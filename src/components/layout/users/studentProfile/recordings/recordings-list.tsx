'use client';

import { useState } from 'react';
import { Stack, Paper, Text, Box } from '@mantine/core';
import { useTranslations, useLocale } from 'next-intl';
import { IoVideocamOutline } from 'react-icons/io5';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';

import { useStudentSubscriptions } from '../hooks/use-student-subscriptions';
import { useAuth } from '@/hooks/use-auth';

import { SubscriptionGroup } from './components/subscription-group';
import { EditRecordingModal, DeleteRecordingModal } from './components/recording-modals';

/**
 * Main component to display all lesson recordings for a student, grouped by subscription.
 */
export function StudentRecordingsList() {
  const params = useParams();
  const { user: current_user } = useAuth();
  const student_id = (params?.id as string) || current_user?.id || '';
  
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  const common_t = useTranslations('Common');
  const locale = useLocale();
  
  const { 
    subscriptions, is_loading, delete_lesson_recording, update_lesson
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

  const is_valid_youtube = (url: string) => {
    if (!url) return true;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return !!(match && match[2].length === 11);
  };

  const handle_save_edit = async () => {
    if (editing_lesson) {
      if (editing_lesson.url && !is_valid_youtube(editing_lesson.url)) return;
      
      const update_data: any = { recording_url: editing_lesson.url };
      if (!editing_lesson.date) update_data.date = dayjs().toISOString();
      
      await update_lesson({ lessonId: editing_lesson.id, data: update_data });
      set_editing_lesson(null);
    }
  };

  if (is_loading) {
    return <Box py="xl"><Text size="sm" c="dimmed" ta="center">{common_t('loading')}</Text></Box>;
  }

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
      {active_subscriptions.map(sub => (
        <SubscriptionGroup 
          key={sub.id} 
          sub={sub} 
          is_teacher={is_teacher}
          locale={locale}
          onEdit={(lesson) => set_editing_lesson({ 
            id: lesson.id, 
            url: (lesson.recording_url || '').split(',').length > 1 ? '' : lesson.recording_url, 
            date: lesson.date 
          })}
          onDelete={set_deleting_id}
        />
      ))}

      <EditRecordingModal 
        opened={!!editing_lesson}
        onClose={() => set_editing_lesson(null)}
        url={editing_lesson?.url || ''}
        onChange={(url) => set_editing_lesson(prev => prev ? { ...prev, url } : null)}
        onSave={handle_save_edit}
        isValid={editing_lesson?.url ? is_valid_youtube(editing_lesson.url) : true}
      />

      <DeleteRecordingModal 
        opened={!!deleting_id}
        onClose={() => set_deleting_id(null)}
        onDelete={handle_delete}
      />
    </Stack>
  );
}
