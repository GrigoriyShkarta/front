import { api } from '@/lib/api';
import { TrackerTask, TrackerColumn, TrackerBoardData, TrackerSettings, TrackerSubtask } from '../schemas/tracker-schema';

/**
 * Fetches the tracker board for a specific user and flattens column-nested tasks.
 */
export const getTrackerBoard = async (userId: string): Promise<TrackerBoardData> => {
  const response = await api.get(`/tracker/${userId}`);
  const data = response.data;

  // Flatten tasks from columns if columns are nested
  const flattenedTasks: TrackerTask[] = [];
  const processedColumns: TrackerColumn[] = (data.columns || []).map((col: any) => {
    if (col.tasks && Array.isArray(col.tasks)) {
      col.tasks.forEach((task: any) => {
        flattenedTasks.push({
          ...task,
          column_id: col.id // Ensure column_id matches the column
        });
      });
    }
    const { tasks: _, ...colInfo } = col;
    return colInfo;
  });

  return {
    user_id: userId,
    columns: processedColumns,
    tasks: flattenedTasks,
    settings: {
      can_student_create_tracker: data.can_student_create_tracker ?? false,
      can_student_edit_tracker: data.can_student_edit_tracker ?? false
    }
  };
};

/**
 * Updates tracker settings. Note: if endpoint is not specifically known, it's guessed.
 */
export const updateTrackerSettings = async (userId: string, settings: TrackerSettings) => {
  return await api.patch(`/users/${userId}`, settings);
};

/**
 * Updates task position and column assignment.
 */
export const updateTaskPosition = async (taskId: string, columnId: string, order: number) => {
  return await api.patch(`/tracker/tasks/${taskId}`, { column_id: columnId, order });
};

/**
 * Updates column position or details.
 */
export const updateColumnPosition = async (columnId: string, order: number) => {
  return await api.patch(`/tracker/columns/${columnId}`, { order });
};

/**
 * Creates a new task for the student.
 */
export const createTrackerTask = async (userId: string, data: Partial<TrackerTask>) => {
  return await api.post(`/tracker/${userId}/tasks`, data);
};

/**
 * Updates task details (title, description, etc).
 */
export const updateTrackerTask = async (taskId: string, data: Partial<TrackerTask>) => {
  const { subtasks: _, ...updateData } = data;
  return await api.patch(`/tracker/tasks/${taskId}`, updateData);
};

/**
 * Creates a custom column for the student.
 */
export const createTrackerColumn = async (userId: string, title: string, order: number, color?: string) => {
  return await api.post(`/tracker/${userId}/columns`, { title, order, color });
};

/**
 * Deletes a task.
 */
export const deleteTrackerTask = async (taskId: string) => {
  return await api.delete(`/tracker/tasks/${taskId}`);
};

/**
 * Deletes a column.
 */
export const deleteTrackerColumn = async (columnId: string) => {
  return await api.delete(`/tracker/columns/${columnId}`);
};

export const updateTrackerColumn = async (columnId: string, title: string, color?: string) => {
  return await api.patch(`/tracker/columns/${columnId}`, { title, color });
};

/**
 * Adds a new subtask to a task.
 */
export const addTrackerSubtask = async (taskId: string, title: string) => {
  return await api.post(`/tracker/tasks/${taskId}/subtasks`, { title, completed: false });
};

/**
 * Toggles a subtask's completion status.
 */
export const toggleTrackerSubtask = async (subtaskId: string) => {
  return await api.patch(`/tracker/subtasks/${subtaskId}/toggle`);
};

/**
 * Deletes a subtask.
 */
export const deleteTrackerSubtask = async (subtaskId: string) => {
  return await api.delete(`/tracker/subtasks/${subtaskId}`);
};
