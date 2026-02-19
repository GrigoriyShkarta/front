import { z } from 'zod';

export const personalization_schema = z.object({
  title_space: z.string().min(1, 'errors.required'),
  icon: z.any().optional(),
  primary_color: z.string(),
  secondary_color: z.string(),
  bg_color: z.string(),
  select_mode: z.boolean(),
  bg_color_dark: z.string(),
  is_white_sidebar_color: z.boolean(),
  is_show_sidebar_icon: z.boolean(),
  languages: z.array(z.string()).min(1, 'errors.required'),
  font_family: z.string(),
});

export type PersonalizationFormData = z.infer<typeof personalization_schema>;
