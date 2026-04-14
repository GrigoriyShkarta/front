'use client';

import { 
  Stack, 
  Title, 
  Group, 
  Button, 
  Breadcrumbs, 
  Anchor, 
  Box, 
  LoadingOverlay, 
  SimpleGrid, 
  Paper, 
  Text, 
  UnstyledButton,
  Modal,
  TextInput,
  ActionIcon
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { IoAddOutline, IoTrashOutline, IoArrowForwardOutline, IoShapesOutline, IoPencilOutline } from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';
import { useBoardData, Board } from './hooks/use-board-data';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

/**
 * Layout for listing individual boards for a specific student.
 */
export function BoardsListLayout({ hide_header }: { hide_header?: boolean }) {
  const t = useTranslations('Boards');
  const tNav = useTranslations('Navigation');
  const params = useParams();
  const userId = (params?.userId || params?.id) as string;
  const { user: currentUser } = useAuth();
  const { loading, student_name, boards, createBoard, deleteBoard, updateBoard } = useBoardData(userId);
  const [opened, { open, close }] = useDisclosure(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const is_admin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'teacher';
  const can_manage = is_admin || currentUser?.id === userId;

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: tNav('boards'), href: '/main/boards' },
    ...(is_admin && student_name ? [{ title: student_name, href: '#' }] : []),
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  const handleCreate = async () => {
    if (!newBoardTitle) return;
    setCreating(true);
    try {
      await createBoard(newBoardTitle);
      close();
      setNewBoardTitle('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Stack gap="xl" className={cn("py-4", !hide_header && "min-h-[500px]")}>
      {!hide_header && (
        <Stack gap="xs">
          <Breadcrumbs separator="→" className="text-xs sm:text-sm">{breadcrumb_items}</Breadcrumbs>
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <Title order={1} className="text-2xl sm:text-3xl font-bold tracking-tight">
                 {student_name ? t('list_title', { name: student_name }) : t('title')}
              </Title>
              <Text c="dimmed" size="sm">{t('list_subtitle')}</Text>
            </Stack>
          </Group>
        </Stack>
      )}

      <Box className="relative">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 1, radius: 'lg' }} loaderProps={{ color: 'primary' }} />
        
        {!loading && (
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="lg">
             {/* Create Card */}
             <UnstyledButton
                onClick={open}
                className={cn(
                  "group relative overflow-hidden p-8 transition-all duration-300",
                  "bg-white/5 border border-dashed border-[var(--space-secondary)]/30 hover:border-[var(--space-primary)]",
                  "flex flex-col items-center justify-center text-center min-h-[180px]"
                )}
             >
                <Box 
                  className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-4"
                  style={{ backgroundColor: 'rgba(var(--space-primary-rgb), 0.1)' }}
                >
                   <IoAddOutline size={28} style={{ color: 'var(--space-secondary)' }} />
                </Box>
                <Text fw={600} size="lg">{t('create_board')}</Text>
             </UnstyledButton>

             {/* Existing Boards */}
             {boards.map((board) => (
                <BoardCard 
                  key={board.id} 
                  board={board} 
                  userId={userId} 
                  onDelete={() => deleteBoard(board.id)} 
                  onUpdate={(title) => updateBoard(board.id, title)}
                  can_delete={can_manage} 
                />
              ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Creation Modal */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={t('create_board')} 
        radius="lg" 
        size="sm"
        overlayProps={{ blur: 5 }}
      >
        <Stack gap="md">
          <TextInput 
            label={t('enter_title')} 
            placeholder={t('board_title', { name: '' }).replace(': ', '')}
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.currentTarget.value)}
            autoFocus
            radius="md"
          />
          <Button 
             fullWidth 
             onClick={handleCreate} 
             loading={creating} 
             radius="md" 
             style={{ background: 'var(--space-accent)' }}
          >
             {useTranslations('Common')('add')}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}

/**
 * Individual board preview card.
 */
function BoardCard({ board, userId, onDelete, onUpdate, can_delete }: { 
  board: Board, 
  userId: string, 
  onDelete: () => void, 
  onUpdate: (title: string) => void,
  can_delete: boolean 
}) {
  const t = useTranslations('Boards');
  const common_t = useTranslations('Common');
  
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    await onUpdate(editTitle);
    setSaving(false);
    setEditOpened(false);
  };

  return (
    <Box className="group relative">
       {can_delete && (
         <Group gap={6} className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionIcon 
                onClick={(e) => { e.preventDefault(); setEditOpened(true); }}
                variant="subtle" size="sm"
                style={{ color: 'var(--space-primary)' }}
            >
                <IoPencilOutline size={16} />
            </ActionIcon>
            <ActionIcon 
                onClick={(e) => { e.preventDefault(); setDeleteOpened(true); }}
                variant="subtle" color="red" size="sm"
            >
                <IoTrashOutline size={16} />
            </ActionIcon>
         </Group>
       )}
       
        <UnstyledButton
          component={Link}
          href={`/main/boards/${userId}/${board.id}`}
          className={cn(
            "relative w-full overflow-hidden p-6 transition-all duration-300",
            "bg-white/5 border border-[var(--space-secondary)]/30 hover:border-[var(--space-primary)]/60 hover:bg-white/[0.08]",
            "flex flex-col min-h-[250px]", // Increased height for stability
            "transform hover:-translate-y-1"
          )}
       >
          <Box className="relative w-full h-[120px] mb-4 overflow-hidden bg-white/5 border border-white/10">
            {board.preview_url ? (
              <img 
                src={`${board.preview_url}?v=${new Date(board.updated_at || board.created_at).getTime()}`} 
                alt={board.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Box className="flex items-center justify-center w-full h-full opacity-20">
                 <IoShapesOutline size={40} />
              </Box>
            )}
          </Box>
          <Stack gap={4}>
             <Text fw={700} size="xl" lineClamp={2} style={{ transition: 'color 0.3s' }} className="group-hover:text-[var(--space-primary)]">
                {board.title}
             </Text>
             <Text size="xs" c="dimmed" className="opacity-50">
               {board.updated_at ? dayjs(board.updated_at).format('DD.MM.YYYY HH:mm') : dayjs(board.created_at).format('DD.MM.YYYY HH:mm')}
             </Text>
          </Stack>

          <Group gap={6} align="center" className="mt-4 flex-nowrap shrink-0">
             <Text size="sm" fw={600} className="text-white/40 group-hover:text-white transition-colors whitespace-nowrap">
               {t('open_board')}
             </Text>
             <IoArrowForwardOutline className="text-white/40 group-hover:translate-x-1 transition-all group-hover:text-[var(--space-primary)] shrink-0" />
          </Group>
        </UnstyledButton>

        {/* Delete Modal */}
        <Modal opened={deleteOpened} onClose={() => setDeleteOpened(false)} title={common_t('confirm')} radius="lg">
          <Stack gap="md">
            <Text size="sm">{t('delete_confirm_desc', { defaultValue: 'Are you sure you want to delete this board?' })}</Text>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setDeleteOpened(false)}>{common_t('cancel')}</Button>
              <Button color="red" onClick={() => { onDelete(); setDeleteOpened(false); }}>{common_t('delete')}</Button>
            </Group>
          </Stack>
        </Modal>

        {/* Edit Modal */}
        <Modal opened={editOpened} onClose={() => setEditOpened(false)} title={t('edit_title', { defaultValue: 'Edit Board Title' })} radius="lg">
           <Stack gap="md">
              <TextInput 
                label={t('enter_title')} 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.currentTarget.value)} 
                radius="md" 
                autoFocus 
              />
              <Button fullWidth onClick={handleUpdate} loading={saving} radius="md" style={{ background: 'var(--space-accent)' }}>
                 {common_t('save')}
              </Button>
           </Stack>
        </Modal>
    </Box>
  );
}
