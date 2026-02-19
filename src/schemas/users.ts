import { z } from 'zod';

export const user_role_schema = z.enum(['super_admin', 'admin', 'teacher', 'student']);
export type UserRole = z.infer<typeof user_role_schema>;

export const user_form_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  email: z.string().min(1, 'errors.required').email('errors.invalid_email'),
  password: z.string().min(6, 'errors.password_too_short').optional().or(z.literal('')),
  role: user_role_schema,
  avatar: z.any().optional(), // File or string URL
  teacher_id: z.string().optional().nullable(),
  categories: z.array(z.string()).optional(),
});

export type UserFormData = z.infer<typeof user_form_schema>;

export const user_response_schema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: user_role_schema,
  avatar: z.string().nullable().optional(),
  teacher_id: z.string().nullable().optional(),
  teacher: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable().optional(),
  super_admin_id: z.string().nullable().optional(),
  birthday: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  telegram: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  is_premium: z.boolean().optional(),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string().optional(),
  })).optional(),
});

export type UserListItem = z.infer<typeof user_response_schema>;

export const user_list_response_schema = z.object({
  data: z.array(user_response_schema),
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type UserListResponse = z.infer<typeof user_list_response_schema>;
