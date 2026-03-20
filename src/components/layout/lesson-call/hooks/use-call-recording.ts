'use client';

import { useEffect } from 'react';
import { Call } from '@stream-io/video-react-sdk';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

/**
 * Hook to handle call recording events and debug logging.
 * 
 * @param call Stream call instance
 */
export function useCallRecording(call: Call | undefined) {
  const t = useTranslations('Calendar.lesson_room');

  useEffect(() => {
    if (!call) return;

    const handleRecordingStarted = (event: any) => {
      console.log('[Recording] Started:', event);
      notifications.show({
        title: t('success_title'),
        message: t('recording_started'),
        color: 'green',
      });
    };

    const handleRecordingStopped = (event: any) => {
      console.log('[Recording] Stopped:', event);
      notifications.show({
        title: t('success_title'),
        message: t('recording_stopped'),
        color: 'blue',
      });
    };

    const handleRecordingFailed = (event: any) => {
      console.error('[Recording] Failed:', event);
      notifications.show({
        title: t('error_title'),
        message: t('recording_failed'),
        color: 'red',
      });
    };

    const handleRecordingReady = (event: any) => {
      console.log('[Recording] Ready:', event);
    };

    const unsubStarted = call.on('call.recording_started', handleRecordingStarted);
    const unsubStopped = call.on('call.recording_stopped', handleRecordingStopped);
    const unsubFailed = call.on('call.recording_failed', handleRecordingFailed);
    const unsubReady = call.on('call.recording_ready', handleRecordingReady);

    return () => {
      unsubStarted?.();
      unsubStopped?.();
      unsubFailed?.();
      unsubReady?.();
    };
  }, [call, t]);
}
