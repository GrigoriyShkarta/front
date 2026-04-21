import { z } from 'zod';
import { category_schema } from '@/components/layout/categories/schemas/category-schema';

/**
 * Zod schema for video material metadata
 */
export const video_schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'errors.required'),
  file_url: z.string().nullable().optional(),
  youtube_url: z.string().nullable().optional(),
  file_key: z.string().optional(),
  thumbnail_url: z.string().optional(),
  size: z.number().optional().nullable(),
  categories: z.array(category_schema).optional(),
  accessible_student_ids: z.array(z.string()).optional().default([]),
  student_name: z.string().optional().nullable(),
  recording_status: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});


export type VideoMaterial = z.infer<typeof video_schema>;

/**
 * Schema for creating/updating video (Form Data)
 */
export const video_form_schema = z.object({
  name: z.string().min(1, 'errors.required'),
  file: z.any().optional(),
  youtube_url: z.string().url('errors.invalid_url').optional().or(z.literal('')),
  categories: z.array(z.string()).optional(),
}).refine(data => data.file || data.youtube_url, {
  message: 'errors.file_or_url_required',
  path: ['youtube_url']
});

export type VideoFormData = z.infer<typeof video_form_schema>;

/**
 * Zod schema for lesson recording
 */
export const recording_schema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string().optional().nullable(),
  size: z.number().optional().nullable(),
  file_url: z.string(),
  student_name: z.string().optional().nullable(),
  recording_status: z.string().optional().nullable(),
  is_lesson_recording: z.boolean().optional(),
});

export type Recording = z.infer<typeof recording_schema>;

/**
 * Schema for API Response with pagination
 */
export const video_list_response_schema = z.object({
  data: z.array(video_schema),
  recordings: z.array(recording_schema).optional().default([]),
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type VideoListResponse = z.infer<typeof video_list_response_schema>;

