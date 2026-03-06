'use client';

import { 
  Group, 
  Stack, 
  ActionIcon, 
  Paper, 
  Text, 
  Box,
  Button
} from '@mantine/core';
import { 
  IoAddOutline,
  IoTrashOutline,
  IoPencilOutline
} from 'react-icons/io5';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useTrackerTranslator } from '../hooks/use-tracker-translator';
import { TrackerColumn as TrackerColumnType, TrackerTask, TrackerSettings } from '../schemas/tracker-schema';
import { TrackerTaskCard } from './tracker-task-card';
import { cn } from '@/lib/utils';

interface Props {
  column: TrackerColumnType;
  index: number;
  tasks: TrackerTask[];
  columns: TrackerColumnType[];
  is_admin: boolean;
  settings: TrackerSettings;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: TrackerTask) => void;
  onMoveTask: (taskId: string, newColumnId: string) => void;
  onAddTask: (columnId: string) => void;
  onDeleteColumn: (column_id: string) => void;
  onDeleteTask: (task_id: string) => void;
  onEditColumn: (column: TrackerColumnType) => void;
}

/**
 * Column component for the tracker board
 */
export function TrackerColumn({ 
  column, 
  index, 
  tasks, 
  columns, 
  is_admin, 
  settings,
  onToggleSubtask, 
  onEditTask, 
  onMoveTask,
  onAddTask,
  onDeleteColumn,
  onDeleteTask,
  onEditColumn
}: Props) {
  const { t, getColumnLabel } = useTrackerTranslator();
  const can_create = is_admin || settings.can_student_create_tracker;
  const can_edit = is_admin || settings.can_student_edit_tracker;
  
  const isDefault = ['planned', 'in_progress', 'completed'].includes(column.id.toLowerCase());


  return (
    <Draggable key={column.id} draggableId={column.id} index={index} isDragDisabled={!is_admin}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "flex flex-col h-full shrink-0 transition-shadow duration-300",
            snapshot.isDragging && "z-50"
          )}
          style={{
            ...provided.draggableProps.style,
            width: 340, // Match the Paper width exactly to avoid jumping
          }}
        >
          <Paper 
            w={340} 
            className={cn(
                "flex flex-col h-full bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/5",
                "shadow-sm rounded-2xl overflow-hidden",
                snapshot.isDragging && "shadow-2xl scale-[1.02] border-primary/30"
            )}
            withBorder
          >
            <Box 
                p="md" 
                className="bg-white/30 dark:bg-white/5 border-b border-white/20 dark:border-white/5 relative" 
                {...provided.dragHandleProps}
                style={{
                  borderTop: column.color ? `4px solid ${column.color}` : undefined
                }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs">
                    <Text fw={800} size="xs" tt="uppercase" className="text-zinc-500 dark:text-zinc-400 tracking-wider">
                        {getColumnLabel(column)}
                    </Text>
                </Group>
                <Group gap="xs">
                  {is_admin && !isDefault && (
                    <Group gap={4}>
                      <ActionIcon variant="subtle" size="sm" color="gray" onClick={() => onEditColumn(column)}>
                          <IoPencilOutline size={18} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" size="sm" color="red" onClick={() => onDeleteColumn(column.id)}>
                          <IoTrashOutline size={18} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>
              </Group>
            </Box>
            
            <Droppable droppableId={column.id} type="task">
              {(provided, snapshot) => (
                <Box 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "flex-1 flex flex-col p-4 overflow-y-auto transition-colors scrollbar-thin",
                    snapshot.isDraggingOver && "bg-primary/5"
                  )}
                >
                  <Stack gap="md" className="flex-1">
                    {tasks
                      .filter(t => t.column_id === column.id)
                      .sort((a, b) => a.order - b.order)
                      .map((task, taskIndex) => (
                        <TrackerTaskCard 
                           key={task.id}
                           task={task}
                           index={taskIndex}
                           columns={columns}
                           can_edit={can_edit}
                           onToggleSubtask={onToggleSubtask}
                           onEditTask={onEditTask}
                           onMoveTask={onMoveTask}
                           onDeleteTask={onDeleteTask}
                        />
                      ))}
                    {provided.placeholder}
                  </Stack>
                  
                  {can_create && (
                    <Button 
                      variant="light" 
                      fullWidth
                      size="sm" 
                      color="gray" 
                      leftSection={<IoAddOutline />}
                      onClick={() => onAddTask(column.id)}
                      className="border-dashed border-2 opacity-60 hover:opacity-100 transition-opacity rounded-xl mt-4 shrink-0"
                    >
                      {t('card.add_card')}
                    </Button>
                  )}
                </Box>
              )}
            </Droppable>
          </Paper>
        </div>
      )}
    </Draggable>
  );
}
