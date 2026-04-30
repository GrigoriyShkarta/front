'use client';

import { 
  Paper, Text, ActionIcon, Group, Stack, AspectRatio, Tooltip 
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { 
  IoDownloadOutline, IoTrashOutline, IoPencilOutline, IoTimeOutline 
} from 'react-icons/io5';
import dayjs from 'dayjs';

interface RecordingCardProps {
  lesson: any;
  is_teacher: boolean;
  locale: string;
  onEdit: () => void;
  onDelete: () => void;
  part_idx?: number;
}

/**
 * Individual recording card showing video/youtube preview and actions.
 */
export function RecordingCard({ 
  lesson, 
  is_teacher, 
  locale, 
  onEdit, 
  onDelete, 
  part_idx 
}: RecordingCardProps) {
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
        <Group justify="space-between" wrap="nowrap" align="center" className="flex-col!">
          <Stack gap={0} style={{ flex: 1, minWidth: 0 }} >
            <Tooltip 
              label={`${dayjs(lesson.date || new Date()).locale(locale).format('DD MMM YYYY')}${part_idx !== undefined ? ` (${t('part')} ${part_idx + 1})` : ''}`} 
              position="top-start" 
              withArrow
              openDelay={300}
            >
              <Text fw={700} size="sm" className="line-clamp-1">
                {dayjs(lesson.date || new Date()).locale(locale).format('DD MMM YYYY')}
                {part_idx !== undefined && (
                  <Text component="span" ml={6} c="primary" fw={800} size="xs">
                    ({t('part')} {part_idx + 1})
                  </Text>
                )}
              </Text>
            </Tooltip>
            <Text size="xs" c="dimmed" fw={500}>
                {dayjs(lesson.date || new Date()).locale(locale).format('HH:mm')}
            </Text>
          </Stack>

          <Group gap={4}>
            {lesson.is_recording_temp && (
              <Tooltip 
                label={`${t('deletion_date')} ${dayjs(lesson.recording_deletion_date).locale(locale).format('DD.MM.YYYY')}`}
                position="top"
                withArrow
              >
                <ActionIcon variant="light" color="orange" size="sm" radius="sm">
                  <IoTimeOutline size={14} />
                </ActionIcon>
              </Tooltip>
            )}
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
