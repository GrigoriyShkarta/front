'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { LessonRoom } from '@/components/layout/lesson-call/lesson-room';
import { useActiveCall } from '@/context/active-call-context';
import { Center, Loader, Stack, Text, Alert } from '@mantine/core';
import { IoWarningOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

export default function LessonPage() {
  const t = useTranslations('Calendar.lesson_room');
  const { id } = useParams();
  const client = useStreamVideoClient();
  const { activeCall, setActiveCall } = useActiveCall();
  const [error, setError] = useState<string | null>(null);
  
  // Ref to prevent double-joining in Strict Mode
  const joiningTracker = useRef<Record<string, boolean>>({});
  const activeCallRef = useRef<Call | null>(activeCall);
  
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (!id) return;
    if (!client) {
      setError(t('error_join') + ' (Stream client not initialized)');
      return;
    }

    if (activeCallRef.current && activeCallRef.current.id === id) {
      // Already in this call
      return;
    }
    
    // Check if we already have a call with a different ID, we should leave it
    if (activeCallRef.current && activeCallRef.current.id !== id) {
      activeCallRef.current.leave();
      setActiveCall(null);
    }
    
    // Prevent double invocation
    const callId = id as string;
    if (joiningTracker.current[callId]) {
      return; // Already joining this exact call
    }
    
    joiningTracker.current[callId] = true;

    const my_call = client.call('default', callId);

    my_call.join({ create: true })
      .then(() => {
        setActiveCall(my_call);
      })
      .catch((err) => {
        console.error('Failed to join call', err);
        setError(t('error_join'));
        joiningTracker.current[callId] = false; // Reset on failure
      });

    // We never call leave() here; handled by onLeave or route changes
  }, [client, id, setActiveCall, t]);


  if (error) {

    return (
      <Center className="h-full">
        <Alert icon={<IoWarningOutline size={18} />} title={t('error_title')} color="red" variant="filled" className="max-w-md">
          {error}
        </Alert>
      </Center>
    );
  }

  if (!activeCall) {
    return (
      <Center className="h-full flex-col gap-4">
        <Loader size="xl" color="primary" type="dots" />
        <Text c="dimmed">{t('initializing')}</Text>
      </Center>
    );
  }

  return <LessonRoom call={activeCall} />;
}
