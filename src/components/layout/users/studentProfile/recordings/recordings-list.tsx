import { useState } from 'react';
import { 
  Stack, Group, Paper, Text, ActionIcon, 
  Button, Modal, TextInput, SimpleGrid, AspectRatio, Box,
} from '@mantine/core';
import { useTranslations, useLocale } from 'next-intl';
import { 
  IoVideocamOutline, IoDownloadOutline, IoTrashOutline, 
  IoPencilOutline, IoLinkOutline, IoSyncOutline, IoWarningOutline
} from 'react-icons/io5';
import { useStudentSubscriptions } from '../hooks/use-student-subscriptions';
import { useAuth } from '@/hooks/use-auth';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';

/**
 * Splits a potentially comma-separated recording_url string into individual URLs.
 * Multiple segments are stored as comma-separated values when a lesson has
 * multiple recording parts (e.g., after a reconnection mid-lesson).
 *
 * @param url - Raw recording_url value from the database
 * @returns Array of individual recording URLs
 */
function parse_recording_urls(url: string | null | undefined): string[] {
  if (!url) return [];
  return url.split(',').map((u) => u.trim()).filter(Boolean);
}

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
    subscriptions, is_loading, update_lesson_recording, delete_lesson_recording, update_lesson
  } = useStudentSubscriptions(student_id);

  const [editing_lesson, set_editing_lesson] = useState<{ id: string, url: string, date: any } | null>(null);
  const [deleting_id, set_deleting_id] = useState<string | null>(null);

  const is_teacher = ['super_admin', 'admin', 'teacher'].includes(current_user?.role || '');

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

  const is_valid_youtube = (url: string) => {
    if (!url) return true; // Allow empty to clear
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return !!(match && match[2].length === 11);
  };

  const handle_save_edit = async () => {
    if (editing_lesson) {
      if (editing_lesson.url && !is_valid_youtube(editing_lesson.url)) {
        return;
      }
      
      const update_data: any = { recording_url: editing_lesson.url };
      
      // If lesson doesn't have a date, set it to today (day of uploading the video)
      if (!editing_lesson.date) {
        update_data.date = dayjs().toISOString();
      }
      
      await update_lesson({ lessonId: editing_lesson.id, data: update_data });
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
        
        const known_lessons = lessons.filter((l: any) => !!l.date);
        const has_period = known_lessons.length > 0;
        
        const startDate = has_period 
          ? dayjs(Math.min(...known_lessons.map((l: any) => dayjs(l.date).valueOf()))).format('DD.MM.YYYY')
          : null;
        const endDate = has_period 
          ? dayjs(Math.max(...known_lessons.map((l: any) => dayjs(l.date).valueOf()))).format('DD.MM.YYYY')
          : null;

        return (
          <Stack key={sub.id} gap="md" className="p-4 border border-secondary/10 rounded-xl">
            <Group justify="space-between" align="center" px="xs">
              <Stack gap={0}>
                <Text fw={700} size="md" className="text-secondary-dark">{sub.subscription?.name || sub.name || common_t('no_data')}</Text>
                {has_period && (
                  <Text size="xs" c="dimmed" fw={500}>
                    {startDate} - {endDate}
                  </Text>
                )}
              </Stack>
            </Group>

            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
              {slots.map((lesson: any) => {
                const urls = parse_recording_urls(lesson.recording_url);
                const has_recordings = urls.length > 0;
                const is_processing = lesson.recording_status === 'processing';
                const is_failed = lesson.recording_status === 'failed';

                return (
                  <div key={lesson.id} className="contents">
                    {/* 1. Show existing recording parts */}
                    {has_recordings && urls.map((url, idx) => (
                      <RecordingCard 
                        key={`${lesson.id}-${idx}`} 
                        lesson={{ ...lesson, recording_url: url }} 
                        is_teacher={is_teacher}
                        locale={locale}
                        onEdit={() => set_editing_lesson({ id: lesson.id, url: urls.length > 1 ? '' : lesson.recording_url, date: lesson.date })}
                        onDelete={() => set_deleting_id(lesson.id)}
                        part_idx={urls.length > 1 ? idx : undefined}
                      />
                    ))}

                    {/* 2. Show processing slot if a new segment is arriving */}
                    {is_processing && (
                      <ProcessingRecordingSlot 
                        lesson={lesson}
                        locale={locale}
                        is_additional={has_recordings}
                      />
                    )}

                    {/* 3. Show failed slot if recording failed and no parts exist */}
                    {is_failed && !has_recordings && (
                      <FailedRecordingSlot 
                        lesson={lesson}
                        locale={locale}
                        is_teacher={is_teacher}
                        onEdit={() => set_editing_lesson({ id: lesson.id, url: '', date: lesson.date })}
                      />
                    )}

                    {/* 4. Show empty slot only if no recordings AND not processing/failed */}
                    {!has_recordings && !is_processing && !is_failed && (
                      <EmptyRecordingSlot 
                        lesson={lesson}
                        locale={locale}
                        is_teacher={is_teacher}
                        onEdit={is_teacher && !lesson.is_placeholder ? () => set_editing_lesson({ id: lesson.id, url: '', date: lesson.date }) : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </SimpleGrid>
          </Stack>
        );
      })}

      {/* Modals */}
      <Modal opened={!!editing_lesson} onClose={() => set_editing_lesson(null)} title={t('edit')} centered radius="md">
        <Stack gap="md">
          <TextInput 
            label="URL (YouTube)" 
            value={editing_lesson?.url || ''} 
            onChange={(e) => set_editing_lesson(prev => prev ? { ...prev, url: e.target.value } : null)}
            placeholder="https://www.youtube.com/watch?v=..."
            radius="md"
            withAsterisk
            error={editing_lesson?.url && !is_valid_youtube(editing_lesson.url) ? t('invalid_youtube_url') || 'Invalid YouTube URL' : null}
          />
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => set_editing_lesson(null)}>{common_t('cancel')}</Button>
            <Button 
              onClick={handle_save_edit} 
              radius="md" 
              color="primary"
              disabled={!editing_lesson?.url || !is_valid_youtube(editing_lesson.url)}
              className="bg-primary hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {common_t('save')}
            </Button>
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

function RecordingCard({ lesson, is_teacher, locale, onEdit, onDelete, part_idx }: { 
  lesson: any, 
  is_teacher: boolean, 
  locale: string,
  onEdit: () => void, 
  onDelete: () => void,
  part_idx?: number
}) {
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  
  const get_youtube_embed_url = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  const active_url = lesson.recording_url || '';
  const is_youtube = active_url.includes('youtube.com') || active_url.includes('youtu.be');
  const youtube_embed = is_youtube ? get_youtube_embed_url(active_url) : null;

  const handle_download = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!active_url) return;
    window.open(active_url, '_blank');
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
            src={active_url} 
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
              {dayjs(lesson.date || new Date()).locale(locale).format('DD MMM YYYY')}
              {part_idx !== undefined && (
                <Text component="span" ml={6} c="primary" fw={800} size="xs">
                  ({t('part')} {part_idx + 1})
                </Text>
              )}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
                {dayjs(lesson.date || new Date()).locale(locale).format('HH:mm')}
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

function ProcessingRecordingSlot({ lesson, locale, is_additional }: { lesson: any, locale: string, is_additional?: boolean }) {
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  
  return (
    <Paper 
      withBorder 
      radius="md" 
      className="bg-secondary/5 h-full border-secondary/10 border-dashed flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      <Stack align="center" gap="sm">
        <Box className="p-4 bg-blue-50 rounded-full">
          <IoSyncOutline size={32} className="text-blue-500 animate-spin" />
        </Box>
        <Stack gap={2} align="center">
          <Text size="sm" fw={600} c="dimmed" ta="center">
            {is_additional ? t('processing_next_part') : t('recording_processing')}
          </Text>
          {lesson?.date && (
            <Text size="xs" c="dimmed" ta="center">
              {dayjs(lesson.date).locale(locale).format('DD MMM YYYY')}
            </Text>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

function FailedRecordingSlot({ lesson, locale, is_teacher, onEdit }: { lesson: any, locale: string, is_teacher: boolean, onEdit?: () => void }) {
  const common_t = useTranslations('Common');
  
  return (
    <Paper 
      withBorder 
      radius="md" 
      className="bg-red-50/30 h-full border-red-200 border-dashed flex flex-col items-center justify-center p-6 relative"
    >
      <Stack align="center" gap="sm">
        <Box className="p-4 bg-red-100 rounded-full">
          <IoWarningOutline size={32} className="text-red-500" />
        </Box>
        <Stack gap={2} align="center">
          <Text size="sm" fw={600} c="red.7" ta="center">
            {common_t('error')}
          </Text>
          {lesson?.date && (
            <Text size="xs" c="dimmed" ta="center">
              {dayjs(lesson.date).locale(locale).format('DD MMM YYYY')}
            </Text>
          )}
          {is_teacher && onEdit && (
             <Button variant="subtle" size="xs" color="red" mt="xs" onClick={onEdit}>
               {common_t('edit')}
             </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
