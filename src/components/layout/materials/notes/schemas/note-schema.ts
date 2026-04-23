import { z } from 'zod';
import { category_schema } from '@/components/layout/categories/schemas/category-schema';

export const note_schema = z.object({
  id: z.string(),
  title: z.string().min(1, 'errors.required'),
  content: z.string().nullable().optional(),
  categories: z.array(category_schema).optional().default([]),
  accesses: z.array(z.object({
    student: z.object({
      id: z.string(),
      name: z.string().optional(),
      avatar: z.string().nullable().optional(),
    }).optional()
  })).optional().default([]),
  access: z.array(z.any()).optional(),
  author: z.object({
    id: z.string(),
    name: z.string().optional(),
    avatar: z.string().nullable().optional(),
  }).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  pinned_student_id: z.string().nullable().optional(),
});

export type NoteMaterial = z.infer<typeof note_schema>;

export const create_note_schema = z.object({
  title: z.string().min(1, 'errors.required'),
  content: z.string().optional(),
  category_ids: z.array(z.string()).optional(),
  student_ids: z.array(z.string()).optional(),
  pinned_student_id: z.string().optional().nullable(),
});

export type CreateNoteForm = z.infer<typeof create_note_schema>;

export interface UseNoteEditorStateProps {
  id?: string;
  is_read_only: boolean;
  is_access_mode: boolean;
  pinned_student_id?: string | null;
}

export const note_list_response_schema = z.object({
  data: z.array(note_schema),
  meta: z.object({
    current_page: z.number().optional(),
    total_pages: z.number(),
    total_items: z.number().optional(),
    total: z.number().optional(),
  }),
});

export type NoteListResponse = z.infer<typeof note_list_response_schema>;
