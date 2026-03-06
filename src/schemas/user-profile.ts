import { z } from 'zod';

export const personalization_schema = z.object({
  id: z.string(),
  title_space: z.string(),
  icon: z.string().nullable().optional(),
  languages: z.array(z.string()),
  select_mode: z.boolean(),
  bg_color: z.string(),
  primary_color: z.string(),
  secondary_color: z.string(),
  bg_color_dark: z.string(),
  is_white_sidebar_color: z.boolean(),
  is_show_sidebar_icon: z.boolean().optional(),
  font_family: z.string().default('inter'),
  currency: z.string().default('UAH'),
});

export const user_schema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
  birthday: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  telegram: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  super_admin_id: z.string().nullable().optional(),
  teacher: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable().optional(),
  teacher_id: z.string().nullable().optional(),
  learning_goals: z.string().nullable().optional(),
  is_premium: z.boolean().default(false),
  payment_reminder_date: z.string().nullable().optional(),
  deactivation_date: z.string().nullable().optional(),
  space: z.object({
    personalization: personalization_schema.nullable().optional(),
  }).nullable().optional(),
  can_student_create_tracker: z.boolean().default(false).optional(),
  can_student_edit_tracker: z.boolean().default(false).optional(),
  user_categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string().optional(),
    super_admin_id: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional()
  })).optional(),
  notifications: z.array(z.object({
    id: z.string(),
    message_id: z.string().optional(),
    message: z.string(),
    message_title: z.string(),
    is_read: z.boolean(),
    created_at: z.string().optional()
  })).optional()
});

export type UserProfile = z.infer<typeof user_schema>;
export type SpaceInfo = z.infer<typeof personalization_schema>;
