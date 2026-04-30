'use client';

import { Stack, Group, Text, SimpleGrid } from '@mantine/core';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

import { RecordingCard } from './recording-card';
import { EmptyRecordingSlot, ProcessingRecordingSlot, FailedRecordingSlot } from './recording-slots';

interface SubscriptionGroupProps {
  sub: any;
  is_teacher: boolean;
  locale: string;
  onEdit: (lesson: any) => void;
  onDelete: (id: string) => void;
}

/**
 * Groups recordings by subscription and renders slots for each lesson.
 */
export function SubscriptionGroup({ 
  sub, 
  is_teacher, 
  locale, 
  onEdit, 
  onDelete 
}: SubscriptionGroupProps) {
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  const common_t = useTranslations('Common');

  const parse_recording_urls = (url: string | null | undefined): string[] => {
    if (!url) return [];
    return url.split(',').map((u) => u.trim()).filter(Boolean);
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
    let placeholder_idx = 0;
    while (result.length < total_count) {
      result.push({ is_placeholder: true, id: `virtual-${placeholder_idx++}` });
    }
    return result;
  };

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
    <Stack gap="md" className="p-4 border border-secondary/10 rounded-xl">
      <Group justify="space-between" align="center" px="xs">
        <Stack gap={0}>
          <Text fw={700} size="md" className="text-secondary-dark">
            {sub.subscription?.name || sub.name || common_t('no_data')}
          </Text>
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
              {has_recordings && urls.map((url, idx) => (
                <RecordingCard 
                  key={`${lesson.id}-${idx}`} 
                  lesson={{ ...lesson, recording_url: url }} 
                  is_teacher={is_teacher}
                  locale={locale}
                  onEdit={() => onEdit(lesson)}
                  onDelete={() => onDelete(lesson.id)}
                  part_idx={urls.length > 1 ? idx : undefined}
                />
              ))}

              {is_processing && (
                <ProcessingRecordingSlot 
                  lesson={lesson}
                  locale={locale}
                  is_additional={has_recordings}
                />
              )}

              {is_failed && !has_recordings && (
                <FailedRecordingSlot 
                  lesson={lesson}
                  locale={locale}
                  is_teacher={is_teacher}
                  onEdit={() => onEdit(lesson)}
                />
              )}

              {!has_recordings && !is_processing && !is_failed && (
                <EmptyRecordingSlot 
                  lesson={lesson}
                  locale={locale}
                  is_teacher={is_teacher}
                  onEdit={is_teacher && !lesson.is_placeholder ? () => onEdit(lesson) : undefined}
                />
              )}
            </div>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
