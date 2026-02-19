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
});

export const user_schema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(), // Could be enum, but role can vary
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
  is_premium: z.boolean().default(false),
  space: z.object({
    personalization: personalization_schema.nullable().optional(),
  })
});

export type UserProfile = z.infer<typeof user_schema>;
export type SpaceInfo = z.infer<typeof personalization_schema>;
