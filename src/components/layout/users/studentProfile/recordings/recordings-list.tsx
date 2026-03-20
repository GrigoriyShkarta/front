import { useState } from 'react';
import { 
  Stack, Group, Paper, Text, ActionIcon, 
  Button, Modal, TextInput, SimpleGrid, AspectRatio, Box,
} from '@mantine/core';
import { useTranslations, useLocale } from 'next-intl';
import { 
  IoVideocamOutline, IoDownloadOutline, IoTrashOutline, 
  IoPencilOutline, IoLinkOutline
} from 'react-icons/io5';
import { useStudentSubscriptions } from '../hooks/use-student-subscriptions';
import { useAuth } from '@/hooks/use-auth';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';

/**
 * Component to display all lesson recordings for a student, grouped by subscription.
 */
export function StudentRecordingsList() {
  const params = useParams();
  const { user: current_user } = useAuth();
  const student_id = (params?.id as string) || current_user?.id || '';
  
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  const common_t = useTranslations('Common');
  const locale = useLocale();
  
  const { 
    subscriptions, is_loading, update_lesson_recording, delete_lesson_recording
  } = useStudentSubscriptions(student_id);

  const [editing_lesson, set_editing_lesson] = useState<{ id: string, url: string } | null>(null);
  const [deleting_id, set_deleting_id] = useState<string | null>(null);

  const is_teacher = ['super_admin', 'admin', 'teacher'].includes(current_user?.role || '');

  const get_recordings_for_sub = (sub: any) => {
    return (sub.lessons || []).filter((l: any) => !!l.recording_url);
  };

  const handle_delete = async () => {
    if (deleting_id) {
      await delete_lesson_recording(deleting_id);
      set_deleting_id(null);
    }
  };

  const get_all_slots_for_sub = (sub: any) => {
    const lessons = sub.lessons || [];
    const total_count = sub.subscription?.lessons_count || 0;
    
    const sorted_lessons = [...lessons].sort((a: any, b: any) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
    });
    
    const result = [...sorted_lessons];
    
    // Fill with placeholders if less than total_count
    let placeholder_idx = 0;
    while (result.length < total_count) {
      result.push({ is_placeholder: true, id: `virtual-${placeholder_idx++}` });
    }
    
    return result;
  };

  const handle_save_edit = async () => {
    if (editing_lesson) {
      await update_lesson_recording({ lessonId: editing_lesson.id, data: { recording_url: editing_lesson.url } });
      set_editing_lesson(null);
    }
  };

  if (is_loading) return <Box py="xl"><Text size="sm" c="dimmed" ta="center">{common_t('loading')}</Text></Box>;

  // Only show subscriptions that can actually have lessons
  const active_subscriptions = subscriptions.filter(sub => 
    (sub.lessons || []).length > 0 || (sub.subscription?.lessons_count || 0) > 0
  );

  if (active_subscriptions.length === 0) {
    return (
      <Paper withBorder p="xl" className="bg-secondary/5 border-secondary/10 border-dashed rounded-xl">
        <Stack align="center" gap="xs">
          <IoVideocamOutline size={40} className="text-secondary/30" />
          <Text c="dimmed" size="sm" fw={500}>{t('no_recordings')}</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="xl">
      {active_subscriptions.map(sub => {
        const lessons = sub.lessons || [];
        const slots = get_all_slots_for_sub(sub);
        const startDate = dayjs(sub.created_at).format('DD.MM.YYYY');
        const endDate = lessons.length > 0 
          ? dayjs(lessons[lessons.length - 1].date).format('DD.MM.YYYY')
          : dayjs(sub.created_at).add(1, 'month').format('DD.MM.YYYY');

        return (
          <Stack key={sub.id} gap="md" className="p-4 border border-secondary/10 rounded-xl">
            <Group justify="space-between" align="center" px="xs">
              <Stack gap={0}>
                <Text fw={700} size="md" className="text-secondary-dark">{sub.subscription?.name || sub.name || common_t('no_data')}</Text>
                <Text size="xs" c="dimmed" fw={500}>
                  {startDate} - {endDate}
                </Text>
              </Stack>
            </Group>

            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
              {slots.map((lesson: any) => (
                lesson.recording_url ? (
                  <RecordingCard 
                    key={lesson.id} 
                    lesson={lesson} 
                    is_teacher={is_teacher}
                    locale={locale}
                    onEdit={() => set_editing_lesson({ id: lesson.id, url: lesson.recording_url })}
                    onDelete={() => set_deleting_id(lesson.id)}
                  />
                ) : (
                  <EmptyRecordingSlot 
                    key={lesson.id}
                    lesson={lesson}
                    locale={locale}
                    is_teacher={is_teacher}
                    onEdit={is_teacher && !lesson.is_placeholder ? () => set_editing_lesson({ id: lesson.id, url: '' }) : undefined}
                  />
                )
              ))}
            </SimpleGrid>
          </Stack>
        );
      })}

      {/* Modals */}
      <Modal opened={!!editing_lesson} onClose={() => set_editing_lesson(null)} title={t('edit')} centered radius="md">
        <Stack gap="md">
          <TextInput 
            label="URL" 
            value={editing_lesson?.url || ''} 
            onChange={(e) => set_editing_lesson(prev => prev ? { ...prev, url: e.target.value } : null)}
            placeholder="https://..."
            radius="md"
          />
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => set_editing_lesson(null)}>{common_t('cancel')}</Button>
            <Button onClick={handle_save_edit} radius="md">{common_t('save')}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={!!deleting_id} onClose={() => set_deleting_id(null)} title={common_t('delete')} centered radius="md">
        <Stack gap="md">
          <Text size="sm">{t('delete_confirm')}</Text>
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => set_deleting_id(null)}>{common_t('cancel')}</Button>
            <Button color="red" onClick={handle_delete} radius="md">{common_t('delete')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function RecordingCard({ lesson, is_teacher, locale, onEdit, onDelete }: { 
  lesson: any, 
  is_teacher: boolean, 
  locale: string,
  onEdit: () => void, 
  onDelete: () => void 
}) {
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  const common_t = useTranslations('Common');
  
  const get_youtube_embed_url = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  const is_youtube = lesson.recording_url?.includes('youtube.com') || lesson.recording_url?.includes('youtu.be');
  const youtube_embed = is_youtube ? get_youtube_embed_url(lesson.recording_url) : null;

  const handle_download = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lesson.recording_url) return;
    window.open(lesson.recording_url, '_blank');
  };

  const can_download = is_teacher || lesson.can_student_download_recording;

  return (
    <Paper 
      withBorder 
      radius="md" 
      p={0} 
      className="overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border-secondary/10 group flex flex-col h-full"
    >
      <AspectRatio ratio={16 / 9} className="relative bg-black">
        {youtube_embed ? (
          <iframe
            src={youtube_embed}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <video 
            src={lesson.recording_url} 
            className="w-full h-full object-contain"
            controls
            controlsList="nodownload"
            preload="metadata"
          />
        )}
      </AspectRatio>

      <Stack p="sm" gap={4} className="flex-grow">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Stack gap={0}>
            <Text fw={700} size="sm" className="line-clamp-1">
              {dayjs(lesson.date).locale(locale).format('DD MMM YYYY')}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
                {dayjs(lesson.date).locale(locale).format('HH:mm')}
            </Text>
          </Stack>

          <Group gap={4}>
            {can_download && (
              <ActionIcon variant="light" color="blue" onClick={handle_download} size="sm" radius="sm">
                <IoDownloadOutline size={14} />
              </ActionIcon>
            )}
            {is_teacher && (
              <Group gap={4}>
                <ActionIcon variant="light" color="gray" onClick={onEdit} size="sm" radius="sm">
                  <IoPencilOutline size={14} />
                </ActionIcon>
                <ActionIcon variant="light" color="red" onClick={onDelete} size="sm" radius="sm">
                  <IoTrashOutline size={14} />
                </ActionIcon>
              </Group>
            )}
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}

function EmptyRecordingSlot({ lesson, is_teacher, locale, onEdit }: { lesson: any, is_teacher: boolean, locale: string, onEdit?: () => void }) {
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  
  return (
    <Paper 
      withBorder 
      radius="md" 
      className="bg-secondary/5 h-full border-secondary/10 border-dashed group flex flex-col hover:bg-secondary/10 transition-all duration-300 cursor-pointer relative"
      onClick={onEdit}
      style={{ cursor: onEdit ? 'pointer' : 'default' }}
    >
      <Stack align="center" justify="center" gap="sm" className="flex-grow p-6">
        <Box className="p-4 bg-secondary/10 rounded-full group-hover:scale-110 transition-transform duration-300">
          <IoLinkOutline size={32} className="text-secondary/40" />
        </Box>
        <Stack gap={0} align="center">
          <Text size="sm" fw={600} c="dimmed" ta="center" className="max-w-[140px] leading-relaxed">
            {is_teacher ? t('insert_link') : t('no_recording_yet')}
          </Text>
          {lesson?.date && (
            <Text size="xs" c="dimmed" mt={4} ta="center">
              {dayjs(lesson.date).locale(locale).format('DD MMM YYYY')}
            </Text>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
