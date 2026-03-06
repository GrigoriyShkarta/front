'use client';

import { useQuery } from '@tanstack/react-query';
import { userActions } from '@/components/layout/users/actions/user-actions';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { financeReportActions } from '../actions/finance-report-actions';

dayjs.extend(isBetween);

export const useReports = (dateRange: [Date | null, Date | null]) => {
  const [startDate, endDate] = dateRange;

  const start_date_str = startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined;
  const end_date_str = endDate ? dayjs(endDate).format('YYYY-MM-DD') : undefined;

  // New transactions query for real income
  const transactionsQuery = useQuery({
    queryKey: ['finance-transactions', { start_date: start_date_str, end_date: end_date_str }],
    queryFn: () => financeReportActions.get_transactions({ 
      start_date: start_date_str, 
      end_date: end_date_str 
    }),
  });

  // Keep users query for expected income and active students count
  // We can optimize this by only fetching active students if needed, 
  // but for now we keep it similar to original but focused on expected.
  const usersQuery = useQuery({
    queryKey: ['users-reports', { role: 'student', include_subscriptions: true }],
    queryFn: () => userActions.get_users({ 
        role: 'student', 
        limit: 1000, 
        include_subscriptions: true 
    }),
  });

  const stats = useMemo(() => {
    const transactions = transactionsQuery.data || [];
    const allStudents = usersQuery.data?.data as any[] || [];
    
    const start = startDate ? dayjs(startDate).startOf('day') : null;
    const end = endDate ? dayjs(endDate).endOf('day') : null;

    // --- REAL INCOME (FROM NEW API) ---
    // The API already filtered by date, so we just group/map it for the UI
    const totalRevenue = transactions.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
    
    const groupRealByStudent = (data: any[]) => {
        const groups: Record<string, any> = {};
        data.forEach((item: any) => {
            const sid = item.student_id;
            if (!groups[sid]) {
                groups[sid] = {
                    id: sid,
                    student: item.student,
                    price: 0,
                    subscriptionNames: new Set<string>(),
                    date: item.payment_date,
                    payment_status: item.payment_status
                };
            }
            groups[sid].price += (item.amount || 0);
            const subName = item.name || item.subscription?.name;
            if (subName) groups[sid].subscriptionNames.add(subName);
            if (item.payment_status === 'partially_paid') groups[sid].payment_status = 'partially_paid';
            if (dayjs(item.payment_date).isAfter(dayjs(groups[sid].date))) groups[sid].date = item.payment_date;
        });

        return Object.values(groups).map(g => ({
            ...g,
            payment_date: g.date,
            subscription: { name: Array.from(g.subscriptionNames).join(', ') }
        }));
    };

    const realIncomeList = groupRealByStudent(transactions);

    const breakdownMap: Record<string, { count: number; revenue: number; name: string }> = {};
    transactions.forEach((t: any) => {
      const templateId = t.subscription_id;
      const subName = t.name || t.subscription?.name || 'Unknown';
      const key = templateId || `individual-${subName}`;
      
      if (!breakdownMap[key]) {
        breakdownMap[key] = { count: 0, revenue: 0, name: subName };
      }
      breakdownMap[key].count++;
      breakdownMap[key].revenue += (t.amount || 0);
    });

    const breakdown = Object.values(breakdownMap).sort((a, b) => b.revenue - a.revenue);

    // --- EXPECTED INCOME (STILL CLIENT-SIDE CALCULATION) ---
    const expectedEntries: any[] = [];
    
    // Identify the latest subscription for each student
    const studentLatestSubMap: Record<string, string> = {};
    allStudents.forEach(student => {
        const subs = (student.purchased_subscriptions || []);
        if (subs.length > 0) {
            const latest = [...subs].sort((a,b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())[0];
            studentLatestSubMap[student.id] = latest.id;
        }
    });

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
                    isLatestSub: true
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
                    isLatestSub: true
                });
            }
        }
    });

    const expectedRevenue = expectedEntries.reduce((acc, entry) => acc + entry.reportAmount, 0);
    const expectedIncomeList = expectedEntries.map(entry => ({
        ...entry,
        price: entry.reportAmount,
        next_payment_date: entry.reportDate,
        payment_status: entry.reportStatus,
    })).sort((a, b) => dayjs(a.reportDate).valueOf() - dayjs(b.reportDate).valueOf());

    const activeStudentsCount = allStudents.filter(s => s.status === 'active').length;

    return {
      totalRevenue,
      expectedRevenue,
      activeStudentsCount,
      soldSubscriptionsCount: transactions.length,
      realIncomeList,
      expectedIncomeList,
      breakdown
    };
  }, [transactionsQuery.data, usersQuery.data, startDate, endDate]);

  return {
    stats,
    is_loading: transactionsQuery.isLoading || usersQuery.isLoading,
    is_error: transactionsQuery.isError || usersQuery.isError,
    refresh: () => {
      transactionsQuery.refetch();
      usersQuery.refetch();
    }
  };
};
