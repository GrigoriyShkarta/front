import { z } from 'zod';
import { category_schema } from '@/components/layout/categories/schemas/category-schema';

/**
 * Zod schema for Lesson material
 */
export const lesson_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'errors.required'),
  content: z.string().nullable().optional(), // BlockNote JSON string
  cover_url: z.string().nullable().optional(),
  cover_position: z.number().optional().default(50),
  categories: z.array(category_schema).optional().default([]),
  duration: z.number().nullable().optional(),
  course_ids: z.array(z.string()).optional().default([]),
  courses: z.array(z.object({
    id: z.string(),
    name: z.string()
  })).optional().default([]),
  is_copying_disabled: z.boolean().optional().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export type LessonMaterial = z.infer<typeof lesson_schema>;

/**
 * Schema for Lesson creation/update
 */
export const create_lesson_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  content: z.string().optional(),
  cover_url: z.string().nullable().optional(),
  cover_position: z.number().optional(),
  category_ids: z.array(z.string()).optional(),
  duration: z.number().nullable().optional(),
  course_ids: z.array(z.string()).optional(),
  is_copying_disabled: z.boolean().optional(),
});

export type CreateLessonForm = z.infer<typeof create_lesson_schema>;

/**
 * Schema for API Response with pagination
 */
export const lesson_list_response_schema = z.object({
  data: z.array(lesson_schema),
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type LessonListResponse = z.infer<typeof lesson_list_response_schema>;
