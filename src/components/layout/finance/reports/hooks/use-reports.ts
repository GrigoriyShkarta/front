'use client';

import { useQuery } from '@tanstack/react-query';
import { userActions } from '@/components/layout/users/actions/user-actions';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export const useReports = (dateRange: [Date | null, Date | null]) => {
  const [startDate, endDate] = dateRange;

  const usersQuery = useQuery({
    queryKey: ['users-reports', { role: 'student', include_subscriptions: true }],
    queryFn: () => userActions.get_users({ 
        role: 'student', 
        limit: 1000, 
        include_subscriptions: true 
    }),
  });

  const stats = useMemo(() => {
    if (!usersQuery.data) return null;

    const allStudents = usersQuery.data.data as any[];
    const start = startDate ? dayjs(startDate).startOf('day') : null;
    const end = endDate ? dayjs(endDate).endOf('day') : null;

    // Identify the latest subscription for each student
    const studentLatestSubMap: Record<string, string> = {};
    
    allStudents.forEach(student => {
        const subs = (student.purchased_subscriptions || []);
        if (subs.length > 0) {
            const latest = [...subs].sort((a,b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())[0];
            studentLatestSubMap[student.id] = latest.id;
        }
    });

    // Flatten all subscriptions for Real Income (historical data includes all subs)
    const allSubscriptions: any[] = allStudents.reduce((acc, student) => {
        const subs = (student.purchased_subscriptions || []).map((sub: any) => ({
            ...sub,
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                avatar: student.avatar,
                status: student.status
            }
        }));
        return [...acc, ...subs];
    }, []);

    // --- REAL INCOME (ALREADY PAID) ---
    const realIncomeRaw = allSubscriptions.filter(sub => {
      const isPaid = sub.payment_status === 'paid';
      const isPartial = sub.payment_status === 'partially_paid';
      
      if (!isPaid && !isPartial) return false;
      if (!sub.payment_date) return false;
      
      if (!start || !end) return true;
      const payDate = dayjs(sub.payment_date);
      return payDate.isBetween(start, end, null, '[]');
    }).map(sub => ({
        ...sub,
        reportAmount: sub.payment_status === 'paid' ? (sub.price || 0) : (sub.paid_amount || 0),
        reportDate: sub.payment_date,
        reportStatus: sub.payment_status
    }));

    // --- EXPECTED INCOME (FUTURE PAYMENTS) ---
    const expectedEntries: any[] = [];

    // ONLY process the latest subscription for each student for expected income
    allStudents.forEach(student => {
        if (student.status !== 'active') return;
        
        const latestSubId = studentLatestSubMap[student.id];
        const latestSub = (student.purchased_subscriptions || []).find((s: any) => s.id === latestSubId);
        
        if (!latestSub) return;

        const subWithStudent = {
            ...latestSub,
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                avatar: student.avatar,
                status: student.status
            }
        };

        // 1. Basic/Renewal payment (next_payment_date)
        if (subWithStudent.next_payment_date) {
            const nextDate = dayjs(subWithStudent.next_payment_date);
            const isInRange = !start || !end || nextDate.isBetween(start, end, null, '[]');
            
            if (isInRange) {
                expectedEntries.push({
                    ...subWithStudent,
                    id: `${subWithStudent.id}-renewal`,
                    reportAmount: subWithStudent.price || 0,
                    reportDate: subWithStudent.next_payment_date,
                    reportStatus: 'renewal',
                    isRenewal: true,
                    isLatestSub: true // Always true here now
                });
            }
        }

        // 2. Partial payment balance (partial_payment_date)
        if (subWithStudent.payment_status === 'partially_paid' && subWithStudent.partial_payment_date) {
            const partialDate = dayjs(subWithStudent.partial_payment_date);
            const isInRange = !start || !end || partialDate.isBetween(start, end, null, '[]');
            
            if (isInRange) {
                expectedEntries.push({
                    ...subWithStudent,
                    id: `${subWithStudent.id}-balance`,
                    reportAmount: Math.max(0, (subWithStudent.price || 0) - (subWithStudent.paid_amount || 0)),
                    reportDate: subWithStudent.partial_payment_date,
                    reportStatus: 'balance',
                    isBalance: true,
                    isLatestSub: true // Always true here now
                });
            }
        }
    });

    const totalRevenue = realIncomeRaw.reduce((acc, sub) => acc + sub.reportAmount, 0);
    const expectedRevenue = expectedEntries.reduce((acc, sub) => acc + sub.reportAmount, 0);
    const activeStudentsCount = allStudents.filter(s => s.status === 'active').length;

    const groupRealByStudent = (data: any[]) => {
        const groups: Record<string, any> = {};
        data.forEach(item => {
            const sid = item.student_id;
            if (!groups[sid]) {
                groups[sid] = {
                    id: sid,
                    student: item.student,
                    price: 0,
                    subscriptionNames: new Set<string>(),
                    date: item.reportDate,
                    payment_status: item.reportStatus
                };
            }
            groups[sid].price += item.reportAmount;
            if (item.subscription?.name) groups[sid].subscriptionNames.add(item.subscription.name);
            if (item.reportStatus === 'partially_paid') groups[sid].payment_status = 'partially_paid';
            if (dayjs(item.reportDate).isAfter(dayjs(groups[sid].date))) groups[sid].date = item.reportDate;
        });

        return Object.values(groups).map(g => ({
            ...g,
            payment_date: g.date,
            subscription: { name: Array.from(g.subscriptionNames).join(', ') }
        }));
    };

    const expectedIncomeList = expectedEntries.map(entry => ({
        ...entry,
        price: entry.reportAmount,
        next_payment_date: entry.reportDate,
        payment_status: entry.reportStatus,
    })).sort((a, b) => dayjs(a.reportDate).valueOf() - dayjs(b.reportDate).valueOf());

    const realIncomeList = groupRealByStudent(realIncomeRaw);

    const breakdownMap: Record<string, { count: number; revenue: number; name: string }> = {};
    realIncomeRaw.forEach(sub => {
      const templateId = sub.subscription_id;
      const templateName = sub.subscription?.name || 'Unknown';
      if (!breakdownMap[templateId]) {
        breakdownMap[templateId] = { count: 0, revenue: 0, name: templateName };
      }
      breakdownMap[templateId].count++;
      breakdownMap[templateId].revenue += sub.reportAmount;
    });

    const breakdown = Object.values(breakdownMap).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      expectedRevenue,
      activeStudentsCount,
      soldSubscriptionsCount: realIncomeRaw.length,
      realIncomeList,
      expectedIncomeList,
      breakdown
    };
  }, [usersQuery.data, startDate, endDate]);

  return {
    stats,
    is_loading: usersQuery.isLoading,
    is_error: usersQuery.isError,
    refresh: () => {
      usersQuery.refetch();
    }
  };
};
