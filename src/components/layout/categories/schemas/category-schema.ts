import { z } from 'zod';

/**
 * Zod schema for Material Category
 */
export const category_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'required'),
  color: z.string().regex(/^$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'invalid_color').optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CategoryMaterial = z.infer<typeof category_schema>;

/**
 * Schema for Category creation/update
 */
export const create_category_schema = z.object({
  name: z.string().min(1, 'required'),
  color: z.string().regex(/^$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'invalid_color').optional(),
});

export type CreateCategoryForm = z.infer<typeof create_category_schema>;

export const bulk_create_category_schema = z.object({
  categories: z.array(create_category_schema)
});

export type BulkCreateCategoryForm = z.infer<typeof bulk_create_category_schema>;

/**
 * Schema for API Response
 */
export const category_list_response_schema = z.object({
  data: z.array(category_schema),
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
    items_per_page: z.number().optional(),
  }).optional(),
});

export type CategoryListResponse = z.infer<typeof category_list_response_schema>;
