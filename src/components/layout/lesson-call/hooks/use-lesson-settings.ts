'use client';

import { useState, useEffect } from 'react';
import { Call } from '@stream-io/video-react-sdk';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';

interface LessonSettings {
  is_recording_enabled: boolean;
  can_student_download_recording: boolean;
}

/**
 * Hook to manage lesson recording settings for a specific student profile.
 * 
 * @param call Stream call instance
 * @param userRole Role of the current user
 */
export function useLessonSettings(call: Call | undefined, userRole: string | undefined) {
  const t = useTranslations('Calendar.lesson_room');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lessonSettings, setLessonSettings] = useState<LessonSettings>({
    is_recording_enabled: false,
    can_student_download_recording: false,
  });

  useEffect(() => {
    if (!call?.id || userRole === 'student') return;

    const initSettings = async () => {
      try {
        const lessonRes = await api.get(`/finance/subscriptions/lesson/${call.id}`);
        const sId = lessonRes.data.subscription?.student_id;

        if (sId) {
          setStudentId(sId);
          const userRes = await api.get(`/users/${sId}`);
          setLessonSettings({
            is_recording_enabled: !!userRes.data.is_recording_enabled,
            can_student_download_recording: !!userRes.data.can_student_download_recording,
          });
        }
      } catch (error) {
        console.error('[useLessonSettings] Initialization failed:', error);
      }
    };

    initSettings();
  }, [call?.id, userRole]);

  const updateSetting = async (key: keyof LessonSettings, value: boolean) => {
    if (!studentId) return;

    const prevSettings = { ...lessonSettings };
    setLessonSettings(prev => ({ ...prev, [key]: value }));
    setIsUpdating(true);

    try {
      await api.patch(`/users/${studentId}`, { [key]: value });
      notifications.show({
        title: t('success_title'),
        message: t('settings_saved'),
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: t('error_title'),
        message: t('error_join'),
        color: 'red',
      });
      setLessonSettings(prevSettings);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    lessonSettings,
    isUpdating,
    updateSetting,
    studentId,
  };
}
