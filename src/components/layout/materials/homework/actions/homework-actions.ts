import { api } from '@/lib/api';
import { HomeworkListResponse, HomeworkMaterial, CreateHomeworkForm } from '../schemas/homework-schema';

interface GetHomeworksParams {
  page?: number;
  limit?: number;
  search?: string;
  lesson_id?: string;
  status?: string | null;
}

export const homeworkActions = {
  /**
   * Get paginated list of homeworks
   */
  get_homeworks: async (params: GetHomeworksParams): Promise<HomeworkListResponse> => {
    const response = await api.get('/materials/homeworks', { params });
    return response.data;
  },

  /**
   * Get single homework by ID
   */
  get_homework: async (id: string): Promise<HomeworkMaterial> => {
    const response = await api.get(`/materials/homeworks/${id}`);
    return response.data;
  },

  /**
   * Create new homework
   */
  create_homework: async (data: CreateHomeworkForm): Promise<HomeworkMaterial> => {
    const response = await api.post('/materials/homeworks', data);
    return response.data;
  },

  /**
   * Update existing homework
   */
  update_homework: async (id: string, data: Partial<CreateHomeworkForm>): Promise<HomeworkMaterial> => {
    const response = await api.patch(`/materials/homeworks/${id}`, data);
    return response.data;
  },

  /**
   * Delete single homework
   */
  delete_homework: async (id: string): Promise<void> => {
    await api.delete(`/materials/homeworks/${id}`);
  },

  /**
   * Delete multiple homeworks
   */
  bulk_delete_homeworks: async (ids: string[]): Promise<void> => {
    // If your backend doesn't support bulk delete natively in `/materials/homeworks`, 
    // we would map over ids and delete individually, but let's assume it supports or use individual ones.
    // For safety, delete individually if bulk is not implemented in backend.
    await Promise.all(ids.map(id => api.delete(`/materials/homeworks/${id}`)));
  },

  /**
   * Get all submissions for a homework
   */
  get_submissions: async (id: string): Promise<any[]> => {
    const response = await api.get(`/materials/homeworks/${id}/submissions`);
    return response.data;
  },

  /**
   * Get all submissions across all homeworks (admin dashboard view)
   */
  get_all_submissions: async (params: { page?: number; limit?: number; status?: string; search?: string }): Promise<any> => {
    const response = await api.get('/materials/homeworks/submissions/admin', { params });
    return response.data;
  },

  /**
   * Get a single homework submission by ID
   */
  get_submission: async (id: string): Promise<any> => {
    const response = await api.get(`/materials/homeworks/submissions/${id}`);
    return response.data;
  },

  /**
   * Review and grade a homework submission
   */
  review_submission: async (submission_id: string, data: { status: 'reviewed'; feedback?: string; score?: number }): Promise<any> => {
    const response = await api.patch(`/materials/homeworks/submissions/${submission_id}/review`, data);
    return response.data;
  }
};
