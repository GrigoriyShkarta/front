import { PageContainer } from '@/components/common/page-container';
import { CalendarLayout } from '@/components/layout/calendar/calendar-layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar | Lirnexa',
  description: 'Manage your lessons and events.',
};

/**
 * Calendar page.
 */
export default function CalendarPage() {
  return <PageContainer><CalendarLayout /></PageContainer>;
}
