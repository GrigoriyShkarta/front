'use client';

import { useActiveCall } from '@/context/active-call-context';
import { usePathname, useRouter } from '@/i18n/routing';
import { StreamCall, StreamTheme, useCallStateHooks, ParticipantView, useCall } from '@stream-io/video-react-sdk';
import { SfuModels } from '@stream-io/video-client';
import { Box, ActionIcon, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoMicOffOutline, IoMicOutline, IoVideocamOffOutline, IoVideocamOutline, IoLogOutOutline } from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';

import { DraggablePip } from './components/draggable-pip';

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
    <DraggablePip 
      fixed 
      width={280} 
      height={210} 
    >
      <div 
        className="w-full h-full cursor-pointer"
        onClick={() => router.push(`/main/lesson/${activeCall.id}`)}
      >
        <StreamCall call={activeCall}>
          <StreamTheme>
            <MiniCallUI t={t} />
          </StreamTheme>
        </StreamCall>
      </div>
    </DraggablePip>
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
  // Use publishedTracks (signaling-based, immediate) to reliably detect screen sharing
  // screenShareStream is only set after WebRTC track subscription — causes a race on the viewer side
  const sharingParticipant = participants.find(
    (p) => p.publishedTracks.includes(SfuModels.TrackType.SCREEN_SHARE)
  ) ?? null;
  
  // Fallback to remote participant
  const remoteParticipants = participants.filter(p => !p.isLocalParticipant);
  const mainParticipant = sharingParticipant || (remoteParticipants.length > 0 ? remoteParticipants[0] : participants[0]);

  return (
    <Box className="w-full h-full relative group bg-[var(--call-surface)]">
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        {mainParticipant ? (
          <div key={mainParticipant.sessionId} className="relative w-full h-full">
            <ParticipantView
              participant={mainParticipant}
              trackType={mainParticipant?.sessionId === sharingParticipant?.sessionId ? 'screenShareTrack' : 'videoTrack'}
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
