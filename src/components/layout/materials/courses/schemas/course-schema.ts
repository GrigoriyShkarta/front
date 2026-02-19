import { z } from 'zod';
import { category_schema } from '@/components/layout/categories/schemas/category-schema';

/**
 * Simplified Lesson item for the UI
 */
export const course_lesson_item_schema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * A group of lessons within a course
 */
export const course_group_schema = z.object({
  id: z.string(),
  title: z.string().min(1, 'errors.required'),
  lesson_ids: z.array(z.string()),
});

/**
 * Union type for course content items
 */
export const course_content_item_schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('lesson'),
    id: z.string(), // UUID for the item itself (for DnD/FieldArray)
    lesson_id: z.string(),
  }),
  z.object({
    type: z.literal('group'),
    id: z.string(), // UUID for the group
    title: z.string().min(1, 'errors.required'),
    lesson_ids: z.array(z.string()),
  })
]);

export type CourseContentItem = z.infer<typeof course_content_item_schema>;

/**
 * Full Course material
 */
export const course_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'errors.required'),
  description: z.string().optional(),
  image_url: z.string().nullable().optional(),
  categories: z.array(category_schema).optional().default([]),
  content: z.array(course_content_item_schema).default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CourseMaterial = z.infer<typeof course_schema>;

/**
 * Schema for Course creation/update form
 */
export const create_course_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  description: z.string().optional(),
  image_url: z.string().nullable().optional(),
  category_ids: z.array(z.string()).optional(),
  content: z.array(course_content_item_schema),
});

export type CreateCourseForm = z.infer<typeof create_course_schema>;
