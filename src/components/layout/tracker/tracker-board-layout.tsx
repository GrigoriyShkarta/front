'use client';

import { 
  Stack, 
  Title, 
  Group, 
  Button, 
  Text, 
  Box,
  LoadingOverlay,
  Center,
} from '@mantine/core';
import { 
  IoAddOutline,
  IoSettingsOutline,
  IoListOutline
} from 'react-icons/io5';
import { 
  DragDropContext, 
  Droppable 
} from '@hello-pangea/dnd';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';

import { useTrackerBoard } from './hooks/use-tracker-board';
import { TrackerColumn } from './components/tracker-column';
import { TaskDrawer } from './components/task-drawer';
import { ColumnDrawer } from './components/column-drawer';
import { SettingsDrawer } from './components/settings-drawer';

/**
 * Main layout for the tracker board
 * Orchestrates columns, tasks and management drawers
 */
interface Props {
  student_id?: string;
  hide_header?: boolean;
}

export function TrackerBoardLayout({ student_id, hide_header }: Props) {
  const t = useTranslations('Tracker');
  const tNav = useTranslations('Navigation');
  const params = useParams();
  
  const userId = student_id || (params?.userId as string) || (params?.id as string);
  const { user: current_user } = useAuth();
  
  const { 
    board,
    drawers,
    handlers 
  } = useTrackerBoard(userId);

  const { columns, tasks, loading, student_name } = board;

  const is_admin = current_user?.role === 'super_admin' || current_user?.role === 'admin' || current_user?.role === 'teacher';

  return (
    <Stack gap="lg" className="tracker-board-container min-h-full">
      {hide_header ? (
        is_admin && (
          <Group justify="flex-end" mb="xs">
            <Button 
                variant="default"
                color="gray"
                size="sm"
                leftSection={<IoSettingsOutline size={18} />} 
                onClick={() => drawers.settings.setOpened(true)}
                radius="md"
            >
                {t('settings.button')}
            </Button>
            <Button 
                size="sm"
                leftSection={<IoAddOutline size={18} />} 
                onClick={() => handlers.handleCreateColumn()}
                radius="md"
                color="primary"
                className="bg-primary shadow-md text-primary-foreground hover:opacity-90 transition-all"
            >
              {t('add_column')}
            </Button>
          </Group>
        )
      ) : (
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group align="center" gap="md">
              <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
                <IoListOutline size={28} />
              </Box>
              <Stack gap={0}>
                <Title order={2} className="text-[24px] sm:text-[28px] font-bold tracking-tight">
                  {t('title')}
                </Title>
                <Text c="dimmed" size="sm" className="hidden sm:block">
                  {t('subtitle')}
                </Text>
              </Stack>
            </Group>

            {is_admin && (
              <Group gap="sm">
                <Button
                  color="gray"
                  leftSection={<IoSettingsOutline size={20} />} 
                  onClick={() => drawers.settings.setOpened(true)}
                  radius="md"
                >
                  {t('settings.button')}
                </Button>
                <Button 
                  leftSection={<IoAddOutline size={20} />} 
                  onClick={() => handlers.handleCreateColumn()}
                  radius="md"
                  color="primary"
                  className="bg-primary shadow-md text-primary-foreground hover:opacity-90 transition-all"
                >
                  {t('add_column')}
                </Button>
              </Group>
            )}
          </Group>
        </Stack>
      )}

      <Box className="flex-1 relative mt-4 overflow-hidden">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2, bg: 'transparent' }} />
        
        {!loading && (
          columns.length > 0 ? (
            <DragDropContext onDragEnd={(result) => handlers.onDragEnd(result, is_admin)}>
              <Droppable droppableId="board" type="column" direction="horizontal">
                {(provided) => (
                  <Group 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    align="stretch" 
                    gap="lg" 
                    className="overflow-x-auto pb-3 pt-2 px-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-secondary/30 hover:[&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" 
                    wrap="nowrap"
                  >
                    {columns.map((column, index) => (
                      <TrackerColumn 
                          key={column.id}
                          column={column}
                          index={index}
                          tasks={tasks}
                          columns={columns}
                          is_admin={is_admin}
                          settings={board.settings}
                          onToggleSubtask={handlers.handleToggleSubtask}
                          onEditTask={handlers.handleEditTask}
                          onMoveTask={handlers.handleMoveTask}
                          onAddTask={handlers.handleCreateTask}
                          onDeleteColumn={handlers.handleDeleteColumn}
                          onDeleteTask={handlers.handleDeleteTask}
                          onEditColumn={handlers.handleEditColumn}
                      />
                    ))}
                    {provided.placeholder}
                  </Group>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <Center h={400} className="flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
               <Stack align="center" gap="sm">
                  <Box className="w-16 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4" />
                  <Text size="xl" fw={700} className="text-zinc-300 dark:text-zinc-700 text-center max-w-md">
                    {is_admin ? t('board_empty_admin') : t('board_empty_student')}
                  </Text>
                  {is_admin && (
                    <Button 
                      variant="subtle" 
                      color="gray"
                      leftSection={<IoAddOutline />}
                      onClick={() => handlers.handleCreateColumn()}
                    >
                      {t('add_column')}
                    </Button>
                  )}
               </Stack>
            </Center>
          )
        )}
      </Box>

      <TaskDrawer 
        opened={drawers.task.opened}
        onClose={() => drawers.task.setOpened(false)}
        editingTask={drawers.task.editing}
        loading={drawers.task.loading}
        form={drawers.task.form}
        columns={columns}
        subtaskFields={drawers.task.subtaskFields}
        onSubmit={drawers.task.onSubmit}
      />

      <ColumnDrawer 
        opened={drawers.column.opened}
        onClose={() => drawers.column.setOpened(false)}
        loading={drawers.column.loading}
        onSubmit={drawers.column.onSubmit}
        initialName={drawers.column.editing?.title}
        initialColor={drawers.column.editing?.color}
      />

      <SettingsDrawer
        opened={drawers.settings.opened}
        onClose={() => drawers.settings.setOpened(false)}
        settings={board.settings}
        onSubmit={drawers.settings.onSubmit}
      />
    </Stack>
  );
}
