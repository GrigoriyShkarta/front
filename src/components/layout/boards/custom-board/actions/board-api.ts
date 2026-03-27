import { api } from '@/lib/api';
import { BoardElement } from '../types';

export interface BoardDataResponse {
  id: string;
  student_id: string;
  user_id: string;
  title: string;
  settings: {
    bg_color: string;
    grid_type: string;
    board_theme: string;
  };
  elements: BoardElement[];
  preview_url?: string | null;
}

export const get_board = async (board_id: string): Promise<BoardDataResponse> => {
  const { data } = await api.get(`/boards/${board_id}`);
  return data;
};

export const create_board = async (student_id: string, title?: string): Promise<BoardDataResponse> => {
  const { data } = await api.post('/boards', { student_id, title });
  return data;
};

export interface BoardListResponse {
  id: string;
  student_id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  preview_url?: string | null;
}

export const get_boards = async (student_id: string): Promise<BoardListResponse[]> => {
  const { data } = await api.get(`/boards/student/${student_id}`);
  return data;
};

export const update_board = async (board_id: string, payload: { title?: string; settings?: Partial<BoardDataResponse['settings']> }): Promise<BoardDataResponse> => {
  const { data } = await api.patch(`/boards/${board_id}`, payload);
  return data;
};

export const delete_board = async (board_id: string): Promise<void> => {
  await api.delete(`/boards/${board_id}`);
};

export interface UploadFileResponse {
  src: string;
  name: string;
  size: number;
  ext: string;
}

export const upload_board_file = async (board_id: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadFileResponse>(`/boards/${board_id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.src;
};

export const update_board_preview = async (board_id: string, file: Blob): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file, 'preview.jpg');
  await api.patch(`/boards/${board_id}/preview`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
