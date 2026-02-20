import { z } from 'zod';

/**
 * Zod schema for subscription material metadata
 */
export const subscription_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'subscription_name_required'),
  lessons_count: z.number().min(1, 'subscription_lessons_count_required'),
  price: z.number().min(0, 'subscription_price_required'),
  student_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SubscriptionMaterial = z.infer<typeof subscription_schema>;

/**
 * Schema for creating/updating subscription (Form Data)
 */
export const subscription_form_schema = z.object({
  name: z.string().min(1, 'subscription_name_required'),
  lessons_count: z.number().min(1, 'subscription_lessons_count_required'),
  price: z.number().min(0, 'subscription_price_required'),
  student_id: z.string().optional(),
});

export type SubscriptionFormData = z.infer<typeof subscription_form_schema>;

/**
 * Schema for API Response with pagination
 */
export const subscription_list_response_schema = z.object({
  data: z.array(subscription_schema),
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type SubscriptionListResponse = z.infer<typeof subscription_list_response_schema>;
