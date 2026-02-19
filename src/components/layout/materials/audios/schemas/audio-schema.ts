import { z } from 'zod';
import { category_schema } from '@/components/layout/categories/schemas/category-schema';

/**
 * Zod schema for simple audio material metadata
 */
export const audio_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'errors.required'),
  file_url: z.string(),
  file_key: z.string().optional(),
  categories: z.array(category_schema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AudioMaterial = z.infer<typeof audio_schema>;

/**
 * Schema for creating/updating audio (Form Data)
 */
export const audio_form_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  file: z.any().optional(), // File object for upload
  categories: z.array(z.string()).optional(),
});

export type AudioFormData = z.infer<typeof audio_form_schema>;

/**
 * Schema for API Response with pagination
 */
export const audio_list_response_schema = z.object({
  data: z.array(audio_schema),
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type AudioListResponse = z.infer<typeof audio_list_response_schema>;
