'use client';

import { useActiveCall } from '@/context/active-call-context';
import { usePathname, useRouter } from '@/i18n/routing';
import { StreamCall, StreamTheme, useCallStateHooks, ParticipantView, useCall } from '@stream-io/video-react-sdk';
import { Box, ActionIcon, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoMicOffOutline, IoMicOutline, IoVideocamOffOutline, IoVideocamOutline, IoLogOutOutline } from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';

export function FloatingCallWrapper() {
  const t = useTranslations('Calendar.lesson_room');
  const { activeCall } = useActiveCall();
  const pathname = usePathname();
  const router = useRouter();

  // If there's no call, or we are currently on the lesson page, don't show the floating window
  if (!activeCall || pathname?.includes('/lesson/')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] shadow-2xl rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
         onClick={() => router.push(`/main/lesson/${activeCall.id}`)}
         style={{ width: 280, height: 210, backgroundColor: 'var(--call-surface)' }}>
      <StreamCall call={activeCall}>
        <StreamTheme>
          <MiniCallUI t={t} />
        </StreamTheme>
      </StreamCall>
    </div>
  );
}

function MiniCallUI({ t }: { t: any }) {
  const { useCameraState, useMicrophoneState, useParticipants } = useCallStateHooks();
  const { setActiveCall } = useActiveCall();
  const call = useCall();
  const { user } = useAuth();
  const { isMute: isMicMuted } = useMicrophoneState();
  const { isMute: isCamMuted } = useCameraState();

  const handleLeave = async () => {
    if (call) {
      try {
        // Админ/учитель завершает звонок для всех, студент — выходит только сам
        if (user && user.role !== 'student') {
          await call.endCall();
        } else {
          await call.leave();
        }
      } catch (e) {
        await call.leave();
      }
      setActiveCall(null);
    }
  };
  
  const participants = useParticipants();
  
  // Find a remote participant (student/teacher) to focus on. If alone, show the local participant.
  const remoteParticipants = participants.filter(p => !p.isLocalParticipant);
  const mainParticipant = remoteParticipants.length > 0 ? remoteParticipants[0] : participants[0];

  return (
    <Box className="w-full h-full relative group bg-[var(--call-surface)]">
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        {mainParticipant ? (
          <div key={mainParticipant.sessionId} className="relative w-full h-full">
            <ParticipantView
              participant={mainParticipant}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-center text-xs"
            style={{ color: 'var(--call-text)' }}
          >
            {t('loading')}
          </div>
        )}
      </div>

      {/* Hover controls overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
        <Group gap="xs" justify="center" onClick={(e) => e.stopPropagation()}>
          <ActionIcon 
            variant="filled" 
            size="md" 
            radius="xl"
            color={isMicMuted ? 'red' : 'dark'}
            onClick={() => call?.microphone.toggle()}
            title={isMicMuted ? 'Unmute' : 'Mute'}
          >
            {isMicMuted ? <IoMicOffOutline size={14} /> : <IoMicOutline size={14} />}
          </ActionIcon>
          
          <ActionIcon 
            variant="filled" 
            size="md"
            radius="xl" 
            color={isCamMuted ? 'red' : 'dark'}
            onClick={() => call?.camera.toggle()}
            title={isCamMuted ? 'Start video' : 'Stop video'}
          >
            {isCamMuted ? <IoVideocamOffOutline size={14} /> : <IoVideocamOutline size={14} />}
          </ActionIcon>

          <ActionIcon 
            variant="filled" 
            size="md"
            radius="xl" 
            color="red"
            onClick={handleLeave}
            title={t('leave')}
          >
            <IoLogOutOutline size={14} />
          </ActionIcon>
        </Group>
      </div>
    </Box>
  );
}
