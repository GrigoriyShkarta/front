import { z } from 'zod';
import { category_schema } from '@/components/layout/categories/schemas/category-schema';

/**
 * Access type enum
 */
export const access_type_schema = z.enum(['none', 'full', 'partial']);

/**
 * Test item in course content with access info
 */
export const course_test_access_schema = z.object({
  id: z.string(),
  type: z.literal('test'),
  test_id: z.string(),
  has_access: z.boolean(),
  name: z.string().optional(),
  title: z.string().optional(),
});

/**
 * Single lesson item in course content with access info
 */
export const course_single_lesson_access_schema = z.object({
  id: z.string(),
  type: z.literal('lesson'),
  lesson_id: z.string(),
  has_access: z.boolean(),
  access_type: access_type_schema,
  name: z.string().optional(),
  title: z.string().optional(),
});

/**
 * Group item in course content with access info
 */
export const course_group_access_schema = z.object({
  id: z.string(),
  type: z.literal('group'),
  title: z.string(),
  content: z.array(z.union([
    course_single_lesson_access_schema,
    course_test_access_schema
  ])).default([]),
  // Deprecated fields, keeping for safety
  lesson_ids: z.array(z.string()).optional().default([]),
  lessons: z.array(course_single_lesson_access_schema).optional().default([]),
});

/**
 * Union for course content with access
 */
export const course_content_access_schema = z.discriminatedUnion('type', [
  course_single_lesson_access_schema,
  course_group_access_schema,
  course_test_access_schema
]);

/**
 * Course item in the list for student profile
 */
export const student_course_item_schema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image_url: z.string().nullable().optional(),
  author_id: z.string(),
  super_admin_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().nullable().optional(),
  }),
  categories: z.array(category_schema).optional().default([]),
  category: category_schema.nullable().optional(),
  duration: z.number().optional().default(0),
  has_access: z.boolean(),
  progress_percentage: z.number().optional().default(0),
  content: z.array(course_content_access_schema).default([]),
});

export type StudentCourseItem = z.infer<typeof student_course_item_schema>;

/**
 * Response for courses in student profile
 */
export const student_courses_response_schema = z.object({
  data: z.array(student_course_item_schema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type StudentCoursesResponse = z.infer<typeof student_courses_response_schema>;

/**
 * Schema for granting access
 */
export const grant_access_schema = z.object({
  student_ids: z.array(z.string()),
  material_ids: z.array(z.string()),
  material_type: z.enum(['lesson', 'course', 'audio', 'photo', 'video', 'file', 'test']),
  full_access: z.boolean(),
  accessible_blocks: z.array(z.string()).optional(), // if we need block-level access later
});

export type GrantAccessForm = z.infer<typeof grant_access_schema>;

/**
 * Schema for revoking access
 */
export const revoke_access_schema = z.object({
  student_ids: z.array(z.string()),
  material_ids: z.array(z.string()),
  material_type: z.enum(['lesson', 'course', 'audio', 'photo', 'video', 'file', 'test']),
});

export type RevokeAccessForm = z.infer<typeof revoke_access_schema>;
