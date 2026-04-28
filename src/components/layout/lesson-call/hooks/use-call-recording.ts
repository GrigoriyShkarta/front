'use client';

import { useEffect } from 'react';
import { Call } from '@stream-io/video-react-sdk';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

/**
 * Hook to handle call recording events and show user-facing notifications.
 *
 * @param call - Stream call instance
 * @param existing_parts_count - Number of recording segments already saved for this lesson.
 *   When > 0, the "recording started" notification informs the teacher that the new
 *   segment will be appended as Part (existing_parts_count + 1).
 */
export function useCallRecording(call: Call | undefined, existing_parts_count: number = 0) {
  const t = useTranslations('Calendar.lesson_room');

  useEffect(() => {
    if (!call) return;

    const handleRecordingStarted = () => {
      if (existing_parts_count > 0) {
        // Inform the teacher that the new recording will be a new segment
        notifications.show({
          title: t('recording_new_part_title'),
          message: t('recording_new_part_desc', { count: existing_parts_count + 1 }),
          color: 'yellow',
          autoClose: 6000,
        });
      } else {
        notifications.show({
          title: t('success_title'),
          message: t('recording_started'),
          color: 'green',
        });
      }
    };

    const handleRecordingStopped = () => {
      notifications.show({
        title: t('success_title'),
        message: t('recording_stopped'),
        color: 'blue',
      });
    };

    const handleRecordingFailed = () => {
      notifications.show({
        title: t('error_title'),
        message: t('recording_failed'),
        color: 'red',
      });
    };

    const unsubStarted = call.on('call.recording_started', handleRecordingStarted);
    const unsubStopped = call.on('call.recording_stopped', handleRecordingStopped);
    const unsubFailed = call.on('call.recording_failed', handleRecordingFailed);

    return () => {
      unsubStarted?.();
      unsubStopped?.();
      unsubFailed?.();
    };
  }, [call, t, existing_parts_count]);
}
