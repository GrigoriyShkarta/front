import { z } from 'zod';
import { category_schema } from '@/components/layout/categories/schemas/category-schema';

/**
 * Question types for the test
 */
export const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  FILL_IN_BLANK: 'fill_in_blank',
  DETAILED_ANSWER: 'detailed_answer',
} as const;

export type QuestionType = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES];

/**
 * Media content within a question
 */
export const question_media_schema = z.object({
  type: z.enum(['image', 'video', 'audio', 'file']),
  url: z.string().url(),
  alignment: z.enum(['left', 'center', 'right']).optional().default('center'),
  size: z.number().optional().default(100), // percentage
}).nullable();

/**
 * Answer option for choice-based questions
 */
export const test_answer_option_schema = z.object({
  id: z.string(),
  text: z.string().min(1, 'errors.required'),
  is_correct: z.boolean().default(false),
  image_url: z.string().nullable().optional(),
});

/**
 * A single question block
 */
export const test_question_schema = z.object({
  id: z.string(),
  type: z.nativeEnum(QUESTION_TYPES),
  question: z.string().min(1, 'errors.required'),
  media: question_media_schema.optional(),
  points: z.number().min(0).default(1),
  options: z.array(test_answer_option_schema).optional(),
  correct_answer_text: z.string().optional(), // For fill_in_blank
});

export type TestQuestion = z.infer<typeof test_question_schema>;

/**
 * Test settings
 */
export const test_settings_schema = z.object({
  time_limit: z.number().nullable().optional(), // in minutes
  passing_score: z.number().min(0).max(100).default(0),
});

/**
 * Full Test material
 */
export const test_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'errors.required'),
  description: z.string().optional(),
  settings: test_settings_schema.default({
    passing_score: 0
  }),
  content: z.array(test_question_schema),
  categories: z.array(category_schema).optional().default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TestMaterial = z.infer<typeof test_schema>;

/**
 * Schema for Test creation/update
 */
export const create_test_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  description: z.string().optional(),
  settings: test_settings_schema.optional(),
  content: z.string(), // JSON stringified TestQuestion[]
  category_ids: z.array(z.string()).optional(),
});

export type CreateTestForm = z.infer<typeof create_test_schema>;

/**
 * Schema for API Response with pagination
 */
export const test_list_response_schema = z.object({
  data: z.array(test_schema.omit({ content: true })), // List doesn't usually need full content
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type TestListResponse = z.infer<typeof test_list_response_schema>;
