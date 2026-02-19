import { api } from '@/lib/api';
import { TestListResponse, TestMaterial, CreateTestForm } from '../schemas/test-schema';

interface GetTestsParams {
  page?: number;
  limit?: number;
  search?: string;
  category_ids?: string[];
}

export const testActions = {
  /**
   * Get paginated list of tests
   */
  get_tests: async (params: GetTestsParams): Promise<TestListResponse> => {
    const response = await api.get('/materials/tests', { params });
    return response.data;
  },

  /**
   * Get single test by ID
   */
  get_test: async (id: string): Promise<TestMaterial> => {
    const response = await api.get(`/materials/tests/${id}`);
    return response.data;
  },

  /**
   * Create new test
   */
  create_test: async (data: CreateTestForm): Promise<TestMaterial> => {
    const response = await api.post('/materials/tests', data);
    return response.data;
  },

  /**
   * Update existing test
   */
  update_test: async (id: string, data: Partial<CreateTestForm>): Promise<TestMaterial> => {
    const response = await api.patch(`/materials/tests/${id}`, data);
    return response.data;
  },

  /**
   * Delete single test
   */
  delete_test: async (id: string): Promise<void> => {
    await api.delete(`/materials/tests/${id}`);
  },

  /**
   * Delete multiple tests
   */
  bulk_delete_tests: async (ids: string[]): Promise<void> => {
    await api.delete('/materials/tests', { data: { ids } });
  }
};
