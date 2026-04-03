import { z } from 'zod';

export const homework_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'errors.required'),
  content: z.array(z.any()).optional().default([]),
  lesson_id: z.string().nullable().optional(),
  lesson: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  categories: z.array(z.any()).optional(),
  category_ids: z.array(z.string()).optional(),
  author_id: z.string(),
  super_admin_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type HomeworkMaterial = z.infer<typeof homework_schema>;

export const create_homework_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  lesson_id: z.string().nullable().optional(),
  content: z.array(z.any()).optional().default([]),
  category_ids: z.array(z.string()).optional().default([]),
});

export type CreateHomeworkForm = z.infer<typeof create_homework_schema>;

export const homework_list_response_schema = z.object({
  data: z.array(homework_schema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    total_pages: z.number(),
  }),
});

export type HomeworkListResponse = z.infer<typeof homework_list_response_schema>;
