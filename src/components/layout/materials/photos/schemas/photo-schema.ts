import { z } from 'zod';
import { category_schema } from '@/components/layout/categories/schemas/category-schema';

/**
 * Zod schema for simple photo material metadata
 */
export const photo_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'errors.required'),
  file_url: z.string(),
  file_key: z.string().optional(),
  type: z.string().optional(),
  size: z.number().optional(),
  categories: z.array(category_schema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PhotoMaterial = z.infer<typeof photo_schema>;

/**
 * Schema for creating/updating photo (Form Data)
 */
export const photo_form_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  file: z.any().optional(), // File object for upload
  categories: z.array(z.string()).optional(),
});

export type PhotoFormData = z.infer<typeof photo_form_schema>;

/**
 * Schema for API Response with pagination
 */
export const photo_list_response_schema = z.object({
  data: z.array(photo_schema),
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type PhotoListResponse = z.infer<typeof photo_list_response_schema>;
