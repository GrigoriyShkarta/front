import { api } from '@/lib/api';
import { StudentSubscription } from '../schemas/student-subscription-schema';

export const studentSubscriptionActions = {
  /**
   * Get subscriptions for a specific student
   */
  get_student_subscriptions: async (studentId: string): Promise<StudentSubscription[]> => {
    const response = await api.get(`/finance/subscriptions/student/${studentId}`);
    return response.data;
  },

  /**
   * Create a new student subscription
   */
  create_student_subscription: async (studentId: string, data: any): Promise<StudentSubscription> => {
    const response = await api.post(`/finance/subscriptions/assign`, data);
    return response.data;
  },

  /**
   * Update a student subscription (e.g., payment status)
   */
  update_student_subscription: async (id: string, data: any): Promise<StudentSubscription> => {
    const response = await api.patch(`/finance/subscriptions/student/${id}`, data);
    return response.data;
  },

  /**
   * Update a specific lesson status or date
   */
  update_lesson: async (lessonId: string, data: any): Promise<any> => {
    const response = await api.patch(`/finance/subscriptions/lesson/${lessonId}`, data);
    return response.data;
  },

  /**
   * Update a lesson recording URL
   */
  update_lesson_recording: async (lessonId: string, data: { recording_url: string }): Promise<any> => {
    const response = await api.patch(`/finance/subscriptions/lesson/${lessonId}/recording`, data);
    return response.data;
  },

  /**
   * Delete a lesson recording
   */
  delete_lesson_recording: async (lessonId: string): Promise<any> => {
    const response = await api.delete(`/finance/subscriptions/lesson/${lessonId}/recording`);
    return response.data;
  },

  /**
   * Delete a student subscription
   */
  delete_student_subscription: async (id: string): Promise<void> => {
    await api.delete(`/finance/subscriptions/student/${id}`);
  },

  /**
   * Get all student subscriptions for the space
   */
  get_all_student_subscriptions: async (): Promise<StudentSubscription[]> => {
    const response = await api.get('/finance/subscriptions/student-all');
    return response.data;
  }
};
