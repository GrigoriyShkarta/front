import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DropResult } from '@hello-pangea/dnd';
import { 
  getTrackerBoard, 
  updateTaskPosition, 
  updateColumnPosition, 
  createTrackerTask, 
  updateTrackerTask,
  createTrackerColumn,
  updateTrackerSettings,
  updateTrackerColumn,
  toggleTrackerSubtask,
  addTrackerSubtask,
  deleteTrackerTask,
  deleteTrackerColumn,
  deleteTrackerSubtask
} from '../actions/tracker-actions';
import { TrackerColumn, TrackerTask, tracker_task_schema, TrackerSettings } from '../schemas/tracker-schema';
import { userActions } from '../../users/actions/user-actions';

/**
 * Hook for managing tracker board state and operations
 * @param userId - ID of the user whose board is being managed
 * @returns Board state and handlers
 */
export function useTrackerBoard(userId: string) {
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<TrackerColumn[]>([]);
  const [tasks, setTasks] = useState<TrackerTask[]>([]);
  const [student_name, setStudentName] = useState('');
  
  // Drawers state
  const [task_drawer_opened, setTaskDrawerOpened] = useState(false);
  const [column_drawer_opened, setColumnDrawerOpened] = useState(false);
  const [editing_task, setEditingTask] = useState<TrackerTask | null>(null);
  const [editing_column, setEditingColumn] = useState<TrackerColumn | null>(null);
  const [settings, setSettings] = useState<TrackerSettings>({
    can_student_create_tracker: false,
    can_student_edit_tracker: false
  });
  const [settings_drawer_opened, setSettingsDrawerOpened] = useState(false);

  const form = useForm<TrackerTask>({
    resolver: zodResolver(tracker_task_schema),
    defaultValues: {
      id: '',
      title: '',
      description: '',
      column_id: '',
      subtasks: [],
      order: 0
    },
    mode: 'onChange'
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subtasks" as any
  });

  useEffect(() => {
    const fetchBoard = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [boardData, userData] = await Promise.all([
          getTrackerBoard(userId),
          userActions.get_user(userId).catch(() => null)
        ]);
        
        setColumns(boardData.columns.sort((a, b) => a.order - b.order));
        setTasks(boardData.tasks.sort((a, b) => a.order - b.order));
        if (userData) {
          setStudentName(userData.name);
          setSettings({
            can_student_create_tracker: userData.can_student_create_tracker ?? false,
            can_student_edit_tracker: userData.can_student_edit_tracker ?? false
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [userId]);

  const onDragEnd = async (result: DropResult, is_admin: boolean) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'column') {
      if (!is_admin) return;
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      
      const updatedColumns = newColumns.map((col, idx) => ({ ...col, order: idx }));
      setColumns(updatedColumns);
      
      await updateColumnPosition(draggableId, destination.index);
      return;
    }

    // Task dragging
    const startColumnId = source.droppableId;
    const finishColumnId = destination.droppableId;

    if (startColumnId === finishColumnId) {
      const columnTasks = tasks.filter(t => t.column_id === startColumnId).sort((a, b) => a.order - b.order);
      const otherTasks = tasks.filter(t => t.column_id !== startColumnId);
      
      const [removed] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, removed);
      
      const reorderedColumnTasks = columnTasks.map((t, idx) => ({ ...t, order: idx }));
      setTasks([...otherTasks, ...reorderedColumnTasks]);
      
      await updateTaskPosition(draggableId, startColumnId, destination.index);
    } else {
      const startTasks = tasks.filter(t => t.column_id === startColumnId).sort((a, b) => a.order - b.order);
      const finishTasks = tasks.filter(t => t.column_id === finishColumnId).sort((a, b) => a.order - b.order);
      const otherTasks = tasks.filter(t => t.column_id !== startColumnId && t.column_id !== finishColumnId);

      const [removed] = startTasks.splice(source.index, 1);
      removed.column_id = finishColumnId;
      finishTasks.splice(destination.index, 0, removed);

      const reorderedStart = startTasks.map((t, idx) => ({ ...t, order: idx }));
      const reorderedFinish = finishTasks.map((t, idx) => ({ ...t, order: idx }));
      
      setTasks([...otherTasks, ...reorderedStart, ...reorderedFinish]);
      
      await updateTaskPosition(draggableId, finishColumnId, destination.index);
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        };
      }
      return task;
    }));
    
    await toggleTrackerSubtask(subtaskId);
  };

  const handleCreateSubtask = async (taskId: string, title: string) => {
    const response = await addTrackerSubtask(taskId, title);
    const newSubtask = response.data;
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, subtasks: [...task.subtasks, newSubtask] } : task
    ));
    return newSubtask;
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    await deleteTrackerSubtask(subtaskId);
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, subtasks: task.subtasks.filter(s => s.id !== subtaskId) } : task
    ));
  };

  const handleMoveTask = async (taskId: string, newColumnId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.column_id === newColumnId) return;

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, column_id: newColumnId, order: tasks.filter(x => x.column_id === newColumnId).length } : t
    ));

    await updateTaskPosition(taskId, newColumnId, tasks.filter(x => x.column_id === newColumnId).length);
  };

  const handleCreateTask = (columnId: string) => {
    setEditingTask(null);
    form.reset({
      id: crypto.randomUUID(), // Temp ID until server responds
      title: '',
      description: '',
      column_id: columnId,
      subtasks: [],
      order: tasks.filter(t => t.column_id === columnId).length
    });
    setTaskDrawerOpened(true);
  };

  const handleEditTask = (task: TrackerTask) => {
    setEditingTask(task);
    form.reset(task);
    setTaskDrawerOpened(true);
  };

  const onSubmitTask = async (data: TrackerTask) => {
    if (editing_task) {
      await updateTrackerTask(editing_task.id, data);
      setTasks(prev => prev.map(t => t.id === editing_task.id ? { ...t, ...data } as TrackerTask : t));
    } else {
      // Ensure order is correct even if state changed since drawer opened
      const task_data = {
        ...data,
        order: tasks.filter(t => t.column_id === data.column_id).length
      };
      const response = await createTrackerTask(userId, task_data);
      const newTask = response.data;
      setTasks(prev => [...prev, newTask]);
    }
    setTaskDrawerOpened(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await deleteTrackerTask(taskId);
  };

  const handleSettingsSubmit = async (newSettings: TrackerSettings) => {
    setSettings(newSettings);
    await updateTrackerSettings(userId, newSettings);
    setSettingsDrawerOpened(false);
  };

  const handleCreateColumn = () => {
    setEditingColumn(null);
    setColumnDrawerOpened(true);
  };

  const handleEditColumn = (column: TrackerColumn) => {
    setEditingColumn(column);
    setColumnDrawerOpened(true);
  };

  const onSubmitColumn = async ({ name, color }: { name: string; color?: string }) => {
    if (!name) return;
    if (editing_column) {
      await updateTrackerColumn(editing_column.id, name, color);
      setColumns(prev => prev.map(c => c.id === editing_column.id ? { ...c, title: name, color } : c));
    } else {
      const response = await createTrackerColumn(userId, name, columns.length, color);
      const newCol = response.data;
      setColumns(prev => [...prev, newCol]);
    }
    setColumnDrawerOpened(false);
  };

  const handleDeleteColumn = async (columnId: string) => {
    setColumns(prev => prev.filter(c => c.id !== columnId));
    setTasks(prev => prev.filter(t => t.column_id !== columnId));
    await deleteTrackerColumn(columnId);
  };

  return {
    board: { columns, tasks, loading, student_name, settings },
    drawers: {
      task: {
        opened: task_drawer_opened,
        editing: editing_task,
        form,
        subtaskFields: { fields, append, remove },
        setOpened: setTaskDrawerOpened,
        onSubmit: onSubmitTask
      },
      column: {
        opened: column_drawer_opened,
        editing: editing_column,
        setOpened: setColumnDrawerOpened,
        onSubmit: onSubmitColumn
      },
      settings: {
        opened: settings_drawer_opened,
        setOpened: setSettingsDrawerOpened,
        onSubmit: handleSettingsSubmit
      }
    },
    handlers: {
      onDragEnd,
      handleToggleSubtask,
      handleCreateSubtask,
      handleDeleteSubtask,
      handleMoveTask,
      handleCreateTask,
      handleCreateColumn,
      handleEditTask,
      handleEditColumn,
      handleDeleteTask,
      handleDeleteColumn
    }
  };
}
