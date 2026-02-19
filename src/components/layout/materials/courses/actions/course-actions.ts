import { api } from '@/lib/api';
import { CourseMaterial, CreateCourseForm } from '../schemas/course-schema';

export interface CourseListResponse {
    data: CourseMaterial[];
    meta: {
        current_page: number;
        total_pages: number;
        total_items: number;
    };
}

interface GetCoursesParams {
    page?: number;
    limit?: number;
    search?: string;
    category_ids?: string[];
}

/**
 * Get paginated list of courses
 */
export async function get_courses(params: GetCoursesParams): Promise<CourseListResponse> {
    const response = await api.get('/materials/courses', { 
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
}

/**
 * Get single course by ID
 */
export async function get_course(id: string): Promise<CourseMaterial> {
    const response = await api.get(`/materials/courses/${id}`);
    return response.data;
}

/**
 * Create new course
 */
export async function create_course(data: CreateCourseForm) {
    const response = await api.post('/materials/courses', data);
    return { success: true, ...response.data };
}

/**
 * Update existing course
 */
export async function update_course(id: string, data: CreateCourseForm) {
    const response = await api.patch(`/materials/courses/${id}`, data);
    return { success: true, ...response.data };
}

/**
 * Delete single course
 */
export async function delete_course(id: string) {
    await api.delete(`/materials/courses/${id}`);
    return { success: true };
}

/**
 * Delete multiple courses
 */
export async function bulk_delete_courses(ids: string[]) {
    await api.delete('/materials/courses', { data: { ids } });
    return { success: true };
}

export const courseActions = {
    get_courses,
    get_course,
    create_course,
    update_course,
    delete_course,
    bulk_delete_courses
};
