'use client';
import { useState } from 'react';
import { 
  Group, 
  Stack, 
  ActionIcon, 
  Paper, 
  Text, 
  rem, 
  Progress, 
  Checkbox,
  Select,
  Box,
  Portal,
  Collapse,
  Modal,
  Button,
} from '@mantine/core';
import { 
  IoEllipsisVertical, 
  IoListOutline,
  IoTrashOutline
} from 'react-icons/io5';
import { Draggable } from '@hello-pangea/dnd';
import { useTrackerTranslator } from '../hooks/use-tracker-translator';
import { TrackerTask, TrackerColumn } from '../schemas/tracker-schema';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
interface Props {
  task: TrackerTask;
  index: number;
  columns: TrackerColumn[];
  can_edit: boolean;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: TrackerTask) => void;
  onMoveTask: (taskId: string, newColumnId: string) => void;
  onDeleteTask: (taskId: string) => void;
}
/**
 * Task card component for the tracker board
 */
export function TrackerTaskCard({ task, index, columns, can_edit, onToggleSubtask, onEditTask, onMoveTask, onDeleteTask }: Props) {
  const { t, getColumnLabel } = useTrackerTranslator();
  const common_t = useTranslations('Common');
  const [expanded, setExpanded] = useState(false);
  const [confirm_delete_opened, set_confirm_delete_opened] = useState(false);
  
  const is_long_description = task.description && task.description.length > 100;

  const handle_delete = () => {
    onDeleteTask(task.id);
    set_confirm_delete_opened(false);
  };
  return (
    <>
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided, snapshot) => {
          const cardContent = (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{
                ...provided.draggableProps.style,
                opacity: snapshot.isDragging ? 0.9 : 1,
                zIndex: snapshot.isDragging ? 9999 : 1,
                marginBottom: rem(12)
              }}
            >
              <Paper 
                p="md" 
                radius="lg"
                withBorder 
                className={cn(
                  "bg-white dark:bg-zinc-800/50 border-white/30 dark:border-white/5 shadow-md active:cursor-grabbing",
                  !snapshot.isDragging && "transition-all hover:bg-zinc-50 dark:hover:bg-white/5",
                  snapshot.isDragging && "shadow-2xl border-primary ring-2 ring-primary/20 scale-[1.02]",
                )}
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Text size="sm" fw={700} className="text-zinc-800 dark:text-zinc-100">
                        {task.title}
                    </Text>
                    {can_edit && (
                      <Group gap={4}>
                        <ActionIcon 
                            variant="subtle" 
                            size="sm" 
                            color="gray" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditTask(task);
                            }}
                            className="shrink-0"
                        >
                            <IoEllipsisVertical className="text-zinc-400" />
                        </ActionIcon>
                        <ActionIcon 
                            variant="subtle" 
                            size="sm" 
                            color="red" 
                            onClick={(e) => {
                                e.stopPropagation();
                                set_confirm_delete_opened(true);
                            }}
                            className="shrink-0"
                        >
                            <IoTrashOutline size={14} />
                        </ActionIcon>
                      </Group>
                    )}
                  </Group>
                  {task.description && (
                    <Stack gap={4}>
                      <Collapse in={expanded || !is_long_description}>
                         <Text size="xs" className="text-zinc-500 dark:text-zinc-400">
                           {task.description}
                         </Text>
                      </Collapse>
                      {!expanded && is_long_description && (
                         <Text size="xs" className="text-zinc-500 dark:text-zinc-400 line-clamp-2">
                           {task.description}
                         </Text>
                      )}
                      {is_long_description && (
                         <Text 
                           size="xs" 
                           component="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             setExpanded(!expanded);
                           }}
                           className="text-primary hover:underline cursor-pointer bg-transparent border-none p-0 text-left font-bold"
                         >
                           {expanded ? t('read_less') : t('read_more')}
                         </Text>
                      )}
                    </Stack>
                  )}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <Stack gap={6} mt={4}>
                      <Stack gap={4} className="bg-zinc-500/5 p-2 rounded-lg">
                        {task.subtasks.map((subtask) => (
                          <Group
                              key={subtask.id}
                              gap={6}
                              wrap="nowrap"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleSubtask(task.id, subtask.id);
                              }}
                              className="group/subtask cursor-pointer"
                          >
                            <Checkbox
                              checked={subtask.completed}
                              readOnly
                              size="xs"
                              radius="xl"
                              color="var(--space-primary)"
                              styles={{ input: { cursor: 'pointer' } }}
                            />
                            <Text 
                                size="xs" 
                                className={cn(
                                    "transition-all",
                                subtask.completed ? "line-through opacity-50" : "text-[var(--space-primary)]"
                            )}
                            >
                                {subtask.title}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                      <Group justify="space-between" gap={4} mt={4}>
                        <Group gap={4}>
                            <IoListOutline size={14} style={{ color: 'var(--space-secondary)' }} />
                            <Text size="xs" fw={700} c="dimmed">
                                {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length}
                            </Text>
                        </Group>
                        <Text size="10px" fw={800} className="text-primary">
                            {Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%
                        </Text>
                      </Group>
                      <Progress 
                        value={(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100} 
                        size="xs" 
                        radius="xl"
                        color="var(--space-accent)"
                        striped
                        animated={snapshot.isDragging}
                     />
                    </Stack>
                  )}
                  <Box onClick={(e) => e.stopPropagation()} mt={4}>
                    <Select 
                       size="xs"
                       radius="xl"
                       variant="filled"
                       data={columns.map(c => ({ 
                          value: c.id, 
                          label: getColumnLabel(c) 
                       }))}
                       value={task.column_id}
                       onChange={(val) => val && onMoveTask(task.id, val)}
                       styles={{
                           input: { 
                               fontSize: '10px', 
                               height: rem(26), 
                               minHeight: rem(26),
                               paddingLeft: rem(12),
                               background: 'rgba(0,0,0,0.05)',
                               border: 'none'
                           }
                       }}
                    />
                  </Box>
                </Stack>
              </Paper>
            </div>
          );
          if (snapshot.isDragging) {
            return <Portal>{cardContent}</Portal>;
          }
          return cardContent;
        }}
      </Draggable>

      <Modal
        opened={confirm_delete_opened}
        onClose={() => set_confirm_delete_opened(false)}
        title={t('card.delete_confirm_title') || common_t('delete')}
        centered
        size="sm"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      >
        <Stack gap="md">
          <Text size="sm">
            {t('card.delete_confirm_description') || common_t('delete_confirmation_desc')}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={() => set_confirm_delete_opened(false)}>
              {common_t('cancel')}
            </Button>
            <Button color="red" onClick={handle_delete}>
              {common_t('delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
