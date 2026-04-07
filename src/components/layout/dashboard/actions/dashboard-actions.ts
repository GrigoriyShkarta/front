import { api } from '@/lib/api';

export interface TodoItem {
  id: string;
  text: string;
  is_done: boolean;
  created_at: string;
}

export interface DashboardTodosResponse {
  items: TodoItem[];
}

export const dashboardActions = {
  /**
   * Get today's lessons from the calendar
   * Endpoint: GET /finance/subscriptions/calendar
   */
  get_today_lessons: async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get('/finance/subscriptions/calendar', {
      params: { start_date: today, end_date: today },
    });
    return response.data;
  },

  /**
   * Update dashboard personalization (banner image, title, description, announcement)
   * Endpoint: PATCH /personalization/dashboard
   */
  update_dashboard: async (data: {
    dashboard_title?: string;
    dashboard_description?: string;
    dashboard_hero_image?: string | null;
    student_dashboard_title?: string;
    student_dashboard_description?: string;
    student_dashboard_hero_image?: string | null;
    student_announcement?: string;
  }) => {
    const response = await api.patch('/personalization/dashboard', data);
    return response.data;
  },

  /**
   * Upload banner image
   * Endpoint: POST /personalization/dashboard/upload-image
   */
  upload_banner_image: async (file: File): Promise<{ url: string }> => {
    const form_data = new FormData();
    form_data.append('file', file);
    const response = await api.post('/personalization/dashboard/upload-image', form_data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get todo list for current user
   * Endpoint: GET /dashboard/todos
   */
  get_todos: async (): Promise<DashboardTodosResponse> => {
    const response = await api.get('/dashboard/todos');
    return response.data;
  },

  /**
   * Create a new todo item
   * Endpoint: POST /dashboard/todos
   */
  create_todo: async (text: string): Promise<TodoItem> => {
    const response = await api.post('/dashboard/todos', { text });
    return response.data;
  },

  /**
   * Toggle todo item completion
   * Endpoint: PATCH /dashboard/todos/:id
   */
  toggle_todo: async (id: string, is_done: boolean): Promise<TodoItem> => {
    const response = await api.patch(`/dashboard/todos/${id}`, { is_done });
    return response.data;
  },

  /**
   * Delete a todo item
   * Endpoint: DELETE /dashboard/todos/:id
   */
  delete_todo: async (id: string): Promise<void> => {
    await api.delete(`/dashboard/todos/${id}`);
  },

  /**
   * Mark notifications as read
   * Endpoint: PATCH /users/notifications/read-all
   */
  mark_notifications_read: async (): Promise<void> => {
    await api.patch('/users/notifications/read-all');
  },
};
