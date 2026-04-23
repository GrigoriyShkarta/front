import { api } from '@/lib/api';
import { NoteListResponse, NoteMaterial, CreateNoteForm } from '../schemas/note-schema';

interface GetNotesParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  student_id?: string;
}

export const noteActions = {
  get_notes: async (params: GetNotesParams): Promise<NoteListResponse> => {
    const response = await api.get('/materials/notes', { 
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

  get_note: async (id: string): Promise<NoteMaterial> => {
    const response = await api.get(`/materials/notes/${id}`);
    return response.data;
  },

  get_pinned_note: async (studentId: string): Promise<NoteMaterial | null> => {
    const response = await api.get(`/materials/notes/pinned/${studentId}`);
    return response.data;
  },

  create_note: async (data: CreateNoteForm): Promise<NoteMaterial> => {
    const response = await api.post('/materials/notes', data);
    return response.data;
  },

  update_note: async (id: string, data: Partial<CreateNoteForm>): Promise<NoteMaterial> => {
    const response = await api.patch(`/materials/notes/${id}`, data);
    return response.data;
  },

  share_note: async (id: string, student_ids: string[]): Promise<NoteMaterial> => {
    const response = await api.patch(`/materials/notes/${id}/share`, { student_ids });
    return response.data;
  },

  delete_note: async (id: string): Promise<void> => {
    await api.delete(`/materials/notes/${id}`);
  },

  bulk_delete_notes: async (ids: string[]): Promise<void> => {
    // Current backend doesn't have a bulk delete for notes.
    // So we will just run promises concurrently.
    await Promise.all(ids.map(id => api.delete(`/materials/notes/${id}`)));
  }
};
