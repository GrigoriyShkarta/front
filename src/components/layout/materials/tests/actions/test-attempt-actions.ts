import { api } from '@/lib/api';
import {
  TestAttempt,
  AttemptListResponse,
  SubmitTestPayload,
  ReviewAnswerPayload,
  TestStats,
} from '../schemas/test-attempt-schema';

interface GetAttemptsParams {
  test_id?: string;
  page?: number;
  limit?: number;
  status?: string;
  student_id?: string;
}

/**
 * API actions for test attempts (taking tests, viewing results, reviewing)
 */
export const testAttemptActions = {
  /**
   * Start a new test attempt (student begins the test)
   */
  start_attempt: async (test_id: string): Promise<TestAttempt> => {
    const response = await api.post(`/tests/${test_id}/start`);
    return response.data;
  },

  /**
   * Submit test answers (student completes a test)
   */
  submit_test: async (attempt_id: string, data: SubmitTestPayload): Promise<TestAttempt> => {
    const response = await api.post(`/tests/attempts/${attempt_id}/submit`, data);
    return response.data;
  },

  /**
   * Get a single attempt by ID (with full answers)
   */
  get_attempt: async (attempt_id: string): Promise<TestAttempt> => {
    const response = await api.get(`/tests/attempts/${attempt_id}`);
    return response.data;
  },

  /**
   * Get paginated list of attempts for a test (admin view)
   */
  get_attempts: async (params: GetAttemptsParams): Promise<AttemptListResponse> => {
    const url = params.test_id
      ? `/tests/admin/test/${params.test_id}/attempts`
      : '/tests/admin/attempts';
    const response = await api.get(url, { params });
    return response.data;
  },

  /**
   * Get all attempts for current student for a specific test
   */
  get_my_attempts: async (test_id: string): Promise<TestAttempt[]> => {
    const response = await api.get('/tests/student/attempts', { params: { test_id } });
    return response.data;
  },

  /**
   * Get test statistics (admin view)
   */
  get_test_stats: async (test_id?: string): Promise<TestStats> => {
    const url = test_id ? `/tests/admin/test/${test_id}/stats` : '/tests/admin/stats';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Review a detailed answer (teacher grades it)
   */
  review_answer: async (
    attempt_id: string,
    answer_id: string,
    data: ReviewAnswerPayload
  ): Promise<TestAttempt> => {
    const response = await api.patch(
      `/tests/attempts/${attempt_id}/answers/${answer_id}/review`,
      data
    );
    return response.data;
  },

  /**
   * Get count of pending reviews across all tests (for badge in nav)
   */
  get_pending_reviews_count: async (): Promise<{ count: number }> => {
    const response = await api.get('/tests/admin/attempts/pending-count');
    return response.data;
  },
};
