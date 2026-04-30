'use client';

import { Paper, Stack, Box, Text, Button } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { 
  IoLinkOutline, IoSyncOutline, IoWarningOutline 
} from 'react-icons/io5';
import dayjs from 'dayjs';

interface SlotProps {
  lesson: any;
  locale: string;
}

/**
 * Slot shown when no recording is available.
 */
export function EmptyRecordingSlot({ 
  lesson, 
  is_teacher, 
  locale, 
  onEdit 
}: SlotProps & { is_teacher: boolean, onEdit?: () => void }) {
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  
  return (
    <Paper 
      withBorder 
      radius="md" 
      className="bg-secondary/5 h-full border-secondary/10 border-dashed group flex flex-col hover:bg-secondary/10 transition-all duration-300 relative"
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

/**
 * Slot shown when recording is being processed by the server.
 */
export function ProcessingRecordingSlot({ 
  lesson, 
  locale, 
  is_additional 
}: SlotProps & { is_additional?: boolean }) {
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

/**
 * Slot shown when recording failed to be saved/processed.
 */
export function FailedRecordingSlot({ 
  lesson, 
  locale, 
  is_teacher, 
  onEdit 
}: SlotProps & { is_teacher: boolean, onEdit?: () => void }) {
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
