import { z } from 'zod';

export const subtask_schema = z.object({
  id: z.string(),
  title: z.string().min(1, 'validation.required'),
  completed: z.boolean()
});

export const tracker_task_schema = z.object({
  id: z.string(),
  title: z.string().min(1, 'validation.required'),
  description: z.string().optional().nullable().or(z.literal('')),
  column_id: z.string().min(1, 'validation.required'),
  subtasks: z.array(subtask_schema),
  order: z.number()
});

export const tracker_column_schema = z.object({
  id: z.string(),
  title: z.string().min(1, 'validation.required'),
  color: z.string().optional(),
  order: z.number(),
  tasks: z.array(tracker_task_schema).optional()
});

export const tracker_settings_schema = z.object({
  can_student_create_tracker: z.boolean().default(false),
  can_student_edit_tracker: z.boolean().default(false),
});

export type TrackerSubtask = z.infer<typeof subtask_schema>;
export type TrackerTask = z.infer<typeof tracker_task_schema>;
export type TrackerColumn = z.infer<typeof tracker_column_schema>;
export type TrackerSettings = z.infer<typeof tracker_settings_schema>;

export interface TrackerBoardData {
  user_id: string;
  columns: TrackerColumn[];
  tasks: TrackerTask[];
  settings: TrackerSettings;
}
