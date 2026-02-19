import { z } from 'zod';
import { category_schema } from '@/components/layout/categories/schemas/category-schema';

/**
 * Zod schema for simple file material metadata
 */
export const file_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'errors.required'),
  file_url: z.string(),
  file_key: z.string().optional(),
  categories: z.array(category_schema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type FileMaterial = z.infer<typeof file_schema>;

/**
 * Schema for creating/updating file (Form Data)
 */
export const file_form_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  file: z.any().optional(), // File object for upload
  categories: z.array(z.string()).optional(),
});

export type FileFormData = z.infer<typeof file_form_schema>;

/**
 * Schema for API Response with pagination
 */
export const file_list_response_schema = z.object({
  data: z.array(file_schema),
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type FileListResponse = z.infer<typeof file_list_response_schema>;
