import { z } from 'zod';
import { QuestionType } from './test-schema';

/**
 * Attempt statuses:
 * - in_progress: student is currently taking the test
 * - completed: all questions are auto-gradable, result is final
 * - pending_review: has detailed_answer questions awaiting teacher review
 * - reviewed: teacher has reviewed all detailed answers, result is final
 * - timed_out: time limit expired
 */
export const ATTEMPT_STATUSES = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PENDING_REVIEW: 'pending_review',
  REVIEWED: 'reviewed',
  TIMED_OUT: 'timed_out',
} as const;

export type AttemptStatus = typeof ATTEMPT_STATUSES[keyof typeof ATTEMPT_STATUSES];

/**
 * A single answer submitted by a student
 */
export const test_answer_schema = z.object({
  id: z.string(),
  question_id: z.string(),
  question_type: z.string(),
  selected_option_ids: z.array(z.string()).optional(),
  text_answer: z.string().optional(),
  is_correct: z.boolean().nullable().default(null),
  points_awarded: z.number().default(0),
  teacher_comment: z.string().optional(),
  reviewed_by: z.string().optional(),
  reviewed_at: z.string().optional(),
});

export type TestAnswer = z.infer<typeof test_answer_schema>;

/**
 * Full test attempt record
 */
export const test_attempt_schema = z.object({
  id: z.string(),
  test_id: z.string(),
  test_name: z.string().optional(),
  student_id: z.string(),
  student_name: z.string().optional(),
  student_avatar: z.string().optional(),
  status: z.nativeEnum(ATTEMPT_STATUSES),
  started_at: z.string(),
  completed_at: z.string().nullable().optional(),
  time_spent: z.number().default(0),
  score: z.number().default(0),
  max_score: z.number().default(0),
  percentage: z.number().default(0),
  is_passed: z.boolean().default(false),
  answers: z.array(test_answer_schema).default([]),
  test: z.object({
    name: z.string(),
    content: z.any(),
  }).optional(),
});

export type TestAttempt = z.infer<typeof test_attempt_schema>;

/**
 * Payload for submitting test answers
 */
export const submit_test_schema = z.object({
  test_id: z.string(),
  answers: z.array(z.object({
    question_id: z.string(),
    question_type: z.string(),
    selected_option_ids: z.array(z.string()).optional(),
    text_answer: z.string().optional(),
  })),
  time_spent: z.number(),
});

export type SubmitTestPayload = z.infer<typeof submit_test_schema>;

/**
 * Payload for teacher reviewing a detailed answer
 */
export const review_answer_schema = z.object({
  points_awarded: z.number().min(0),
  teacher_comment: z.string().optional(),
});

export type ReviewAnswerPayload = z.infer<typeof review_answer_schema>;

/**
 * API response for attempt list with pagination
 */
export const attempt_list_response_schema = z.object({
  data: z.array(test_attempt_schema.omit({ answers: true })),
  meta: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type AttemptListResponse = z.infer<typeof attempt_list_response_schema>;

/**
 * Test statistics for admin dashboard
 */
export const test_stats_schema = z.object({
  total_attempts: z.number(),
  unique_students: z.number(),
  average_score: z.number(),
  pass_rate: z.number(),
  average_time: z.number(),
  pending_reviews: z.number(),
});

export type TestStats = z.infer<typeof test_stats_schema>;
