import { z } from 'zod';

export const personalization_schema = z.object({
  id: z.string(),
  title_space: z.string().optional().nullable().default('Lirnexa'),
  icon: z.string().nullable().optional(),
  languages: z.array(z.string()).optional().default(['uk', 'en']),
  select_mode: z.boolean().optional().default(true),
  bg_color: z.string().optional().nullable().default('#ffffff'),
  primary_color: z.string().optional().nullable().default('#2563eb'),
  secondary_color: z.string().optional().nullable().default('#64748b'),
  bg_color_dark: z.string().optional().nullable().default('#0f0f0f'),
  is_white_sidebar_color: z.boolean().optional().default(false),
  is_show_sidebar_icon: z.boolean().optional().default(true),
  font_family: z.string().optional().default('inter'),
  currency: z.string().optional().default('UAH'),
});

export const dashboard_personalization_schema = z.object({
  student_dashboard_title: z.string().nullable().optional(),
  student_dashboard_description: z.string().nullable().optional(),
  student_dashboard_hero_image: z.string().nullable().optional(),
  student_announcement: z.string().nullable().optional(),
  is_show_student_progress: z.boolean().optional(),
  student_social_instagram: z.string().nullable().optional(),
  student_support_telegram: z.string().nullable().optional(),
  dashboard_title: z.string().nullable().optional(),
  dashboard_description: z.string().nullable().optional(),
  dashboard_hero_image: z.string().nullable().optional(),
}).optional();

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
  is_premium: z.boolean().optional().default(false),
  payment_reminder_date: z.string().nullable().optional(),
  stream_token: z.string().optional().nullable(),
  deactivation_date: z.string().nullable().optional(),
  space: z.object({
    personalization: personalization_schema.nullable().optional(),
    dashboard_personalization: dashboard_personalization_schema.nullable().optional(),
  }).nullable().optional(),
  can_student_create_tracker: z.boolean().optional().default(false),
  can_student_edit_tracker: z.boolean().optional().default(false),
  user_categories: z.array(z.any()).optional(),
  categories: z.array(z.any()).optional(),
  notifications: z.array(z.object({
    id: z.string(),
    message_id: z.string().optional().nullable(),
    message_type: z.string().optional().nullable(),
    message: z.string().optional().nullable(),
    message_title: z.string().optional().nullable(),
    is_read: z.boolean().optional().default(false),
    created_at: z.string().optional().nullable(),
    payload: z.record(z.string(), z.any()).optional().nullable(),
  })).optional().nullable(),
  is_recording_enabled: z.boolean().optional().default(false),
  can_student_download_recording: z.boolean().optional().default(false),
  tests_to_review_count: z.number().optional().default(0),
  homeworks_to_review_count: z.number().optional().default(0),
});

export type UserProfile = z.infer<typeof user_schema>;
export type SpaceInfo = z.infer<typeof personalization_schema>;
