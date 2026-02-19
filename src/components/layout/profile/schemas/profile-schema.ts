import { z } from 'zod';

export const profile_update_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  email: z.string().min(1, 'errors.required').email('errors.invalid_email'),
  avatar: z.any().optional(),
  birthday: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  telegram: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
});

export type ProfileUpdateData = z.infer<typeof profile_update_schema>;

export const change_password_schema = z.object({
  current_password: z.string().min(6, 'errors.password_too_short'),
  new_password: z.string().min(6, 'errors.password_too_short'),
  confirm_password: z.string().min(1, 'errors.required'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Profile.errors.passwords_do_not_match',
  path: ['confirm_password'],
});

export type ChangePasswordData = z.infer<typeof change_password_schema>;
