import { api } from '@/lib/api';
import { StudentCoursesResponse, GrantAccessForm, RevokeAccessForm } from '../schemas/materials-schema';

/**
 * Get courses for a specific student
 */
export async function get_student_courses(student_id: string, params: any = {}): Promise<StudentCoursesResponse> {
  const response = await api.get('/materials/courses', {
    params: {
      ...params,
      student_id,
    },
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
 * Grant access to materials
 */
export async function grant_access(data: GrantAccessForm) {
  const response = await api.post('/materials/access/grant', data);
  return response.data;
}

/**
 * Revoke access to materials
 */
export async function revoke_access(data: RevokeAccessForm) {
  const response = await api.delete('/materials/access/revoke', { data });
  return response.data;
}

/**
 * Get additional lessons for a specific student (unassigned)
 */
export async function get_additional_lessons(student_id: string, params: any = {}): Promise<any> {
  const response = await api.get('/materials/lessons', {
    params: {
      ...params,
      student_id,
    },
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
 * Get audio materials for a specific student
 */
export async function get_student_audios(student_id: string, params: any = {}): Promise<any> {
  const response = await api.get('/materials/audios', {
    params: {
      ...params,
      student_id,
    },
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
 * Get photo materials for a specific student
 */
export async function get_student_photos(student_id: string, params: any = {}): Promise<any> {
  const response = await api.get('/materials/photos', {
    params: {
      ...params,
      student_id,
    },
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
 * Get video materials for a specific student
 */
export async function get_student_videos(student_id: string, params: any = {}): Promise<any> {
  const response = await api.get('/materials/videos', {
    params: {
      ...params,
      student_id,
    },
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
 * Get file materials for a specific student
 */
export async function get_student_files(student_id: string, params: any = {}): Promise<any> {
  const response = await api.get('/materials/files', {
    params: {
      ...params,
      student_id,
    },
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
 * Get note materials for a specific student
 */
export async function get_student_notes(student_id: string, params: any = {}): Promise<any> {
  const response = await api.get('/materials/notes', {
    params: {
      ...params,
      // student_id,
    },
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
  const data = response.data;
  if (data.data) {
    data.data = data.data.map((item: any) => ({
      ...item,
      has_access: item.access?.some((a: any) => a.student_id === student_id)
    }));
  }
  return data;
}

export const materialsActions = {
  get_student_courses,
  grant_access,
  revoke_access,
  get_additional_lessons,
  get_student_audios,
  get_student_photos,
  get_student_videos,
  get_student_files,
  get_student_notes,
};
