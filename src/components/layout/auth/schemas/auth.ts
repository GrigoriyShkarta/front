import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'email_invalid' }),
  password: z.string().min(6, { message: 'password_min' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
