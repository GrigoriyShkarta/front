import { z } from 'zod';

export const student_subscription_lesson_schema = z.object({
  id: z.string(),
  student_subscription_id: z.string(),
  date: z.any(), // Can be string or Date
  status: z.enum(['scheduled', 'attended', 'cancelled', 'missed', 'transfered']),
  created_at: z.string(),
  updated_at: z.string(),
});

export const student_subscription_schema = z.object({
  id: z.string(),
  price: z.number(),
  paid_amount: z.number(),
  payment_status: z.string(),
  payment_date: z.any().optional(),
  partial_payment_date: z.any().optional(),
  next_payment_date: z.any().optional(),
  payment_reminder: z.boolean().optional(),
  selected_days: z.array(z.string()),
  student_id: z.string(),
  subscription_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  lessons: z.array(student_subscription_lesson_schema).optional(),
  subscription: z.object({
    id: z.string(),
    name: z.string(),
    lessons_count: z.number(),
  }).optional(),
});

export type StudentSubscription = z.infer<typeof student_subscription_schema>;

export const create_student_subscription_schema = z.object({
  subscription_id: z.string().min(1, 'errors.required'),
  student_id: z.string().min(1, 'errors.required'),
  paid_amount: z.number().min(0, 'errors.required'),
  payment_status: z.enum(['paid', 'unpaid', 'partially_paid']),
  payment_date: z.string().optional(),
  partial_payment_date: z.string().optional(),
  next_payment_date: z.string().optional(),
  payment_reminder: z.boolean().optional(),
  lesson_dates: z.array(z.string()).min(1),
  selected_days: z.array(z.string()).min(1),
});

export type CreateStudentSubscriptionData = z.infer<typeof create_student_subscription_schema>;
