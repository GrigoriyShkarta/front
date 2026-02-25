import { StudentSubscription } from '../schemas/student-subscription-schema';

export type SubscriptionLessonStatus = 'scheduled' | 'attended' | 'cancelled' | 'missed' | 'rescheduled' | 'burned' | 'transfered';
export type SubscriptionPaymentStatus = 'paid' | 'unpaid' | 'partially_paid';

export interface SubscriptionLesson {
  id: string;
  student_subscription_id: string;
  date: string | Date;
  status: SubscriptionLessonStatus;
  created_at: string;
  updated_at: string;
}

export interface UpdateSubscriptionData {
  payment_status?: string;
  paid_amount?: number;
  payment_date?: string;
  partial_payment_date?: string | null;
  next_payment_date?: string;
  payment_reminder?: boolean;
  selected_days?: string[];
}

export interface UpdateLessonData {
  status?: string;
  date?: string;
}

export interface StudentSubscriptionCardProps {
  sub: StudentSubscription;
  isTeacher: boolean;
  isExpanded?: boolean;
  canToggle?: boolean;
  showExtend?: boolean;
  onEdit: (sub: StudentSubscription) => void;
  onDelete: (id: string) => void;
  onUpdateSubscription: (args: { id: string; data: UpdateSubscriptionData }) => Promise<any>;
  onUpdateLesson: (data: { lessonId: string; data: UpdateLessonData }) => Promise<any>;
  onToggle?: () => void;
  onExtend?: () => void;
}
