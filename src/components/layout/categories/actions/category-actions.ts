import { api } from '@/lib/api';
import { CategoryMaterial, CreateCategoryForm, CategoryListResponse } from '../schemas/category-schema';

export const categoryActions = {
  /**
   * Get all categories
   */
  get_categories: async (params?: { page?: number; limit?: number; search?: string }): Promise<CategoryListResponse> => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  /**
   * Create new category
   */
  create_category: async (data: CreateCategoryForm): Promise<CategoryMaterial> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  /**
   * Create multiple categories
   */
  create_categories: async (data: CreateCategoryForm[]): Promise<CategoryMaterial[]> => {
    const promises = data.map(item => api.post('/categories', item).then(res => res.data));
    return Promise.all(promises);
  },

  /**
   * Update existing category
   */
  update_category: async (id: string, data: Partial<CreateCategoryForm>): Promise<CategoryMaterial> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Delete single category
   */
  delete_category: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  /**
   * Delete multiple categories
   */
  bulk_delete_categories: async (ids: string[]): Promise<void> => {
    await api.delete('/categories', { data: { ids } });
  }
};
