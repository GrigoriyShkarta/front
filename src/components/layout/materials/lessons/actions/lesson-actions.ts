import { api } from '@/lib/api';
import { LessonListResponse, LessonMaterial, CreateLessonForm } from '../schemas/lesson-schema';

interface GetLessonsParams {
  page?: number;
  limit?: number;
  search?: string;
  category_ids?: string[];
}

export const lessonActions = {
  /**
   * Get paginated list of lessons
   */
  get_lessons: async (params: GetLessonsParams): Promise<LessonListResponse> => {
    const response = await api.get('/materials/lessons', { 
      params,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      }
    });
    return response.data;
  },

  /**
   * Get single lesson by ID
   */
  get_lesson: async (id: string): Promise<LessonMaterial> => {
    const response = await api.get(`/materials/lessons/${id}`);
    return response.data;
  },

  /**
   * Create new lesson
   */
  create_lesson: async (data: CreateLessonForm): Promise<LessonMaterial> => {
    const response = await api.post('/materials/lessons', data);
    return response.data;
  },

  /**
   * Update existing lesson
   */
  update_lesson: async (id: string, data: Partial<CreateLessonForm>): Promise<LessonMaterial> => {
    const response = await api.patch(`/materials/lessons/${id}`, data);
    return response.data;
  },

  /**
   * Delete single lesson
   */
  delete_lesson: async (id: string): Promise<void> => {
    await api.delete(`/materials/lessons/${id}`);
  },

  /**
   * Delete multiple lessons
   */
  bulk_delete_lessons: async (ids: string[]): Promise<void> => {
    await api.delete('/materials/lessons', { data: { ids } });
  }
};
