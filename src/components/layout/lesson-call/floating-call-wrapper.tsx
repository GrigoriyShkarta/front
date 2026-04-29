'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useActiveCall } from '@/context/active-call-context';
import { usePathname, useRouter } from '@/i18n/routing';
import { StreamCall, StreamTheme, useCallStateHooks, ParticipantView, useCall } from '@stream-io/video-react-sdk';
import { SfuModels } from '@stream-io/video-client';
import { Box, ActionIcon, Group, Text, MantineProvider, useMantineTheme } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { 
  IoMicOffOutline, 
  IoMicOutline, 
  IoVideocamOffOutline, 
  IoVideocamOutline, 
  IoLogOutOutline,
  IoBrowsersOutline 
} from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';

import { DraggablePip } from './components/draggable-pip';

export function FloatingCallWrapper() {
  const t = useTranslations('Calendar.lesson_room');
  const theme = useMantineTheme();
  const { activeCall } = useActiveCall();
  const pathname = usePathname();
  const router = useRouter();
  
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [participantCount, setParticipantCount] = useState(1);

  // Handle PiP window resize when participant count changes
  useEffect(() => {
    if (pipWindow) {
      try {
        const targetHeight = participantCount > 1 ? 480 : 240;
        pipWindow.resizeTo(320, targetHeight);
      } catch (e) {
        // resizeTo might be blocked or fail
      }
    }
  }, [pipWindow, participantCount]);

  // Close PiP when call ends or component unmounts
  useEffect(() => {
    return () => {
      if (pipWindow) pipWindow.close();
    };
  }, [pipWindow]);

  useEffect(() => {
    if (!activeCall && pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [activeCall, pipWindow]);

  const togglePip = useCallback(async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      try {
        const targetHeight = participantCount > 1 ? 480 : 240;
        const pip = await (window as any).documentPictureInPicture.requestWindow({
          width: 320,
          height: targetHeight,
        });

        // Copy styles to PiP window
        const stylesheets = Array.from(document.styleSheets);
        stylesheets.forEach((sheet) => {
          try {
            if (sheet.cssRules) {
              const newStyle = pip.document.createElement('style');
              Array.from(sheet.cssRules).forEach((rule) => {
                newStyle.appendChild(pip.document.createTextNode(rule.cssText));
              });
              pip.document.head.appendChild(newStyle);
            } else if (sheet.href) {
              const link = pip.document.createElement('link');
              link.rel = 'stylesheet';
              link.href = sheet.href;
              pip.document.head.appendChild(link);
            }
          } catch (e) {
            // Some stylesheets might be cross-origin and inaccessible
          }
        });

        // Copy the color scheme attribute to ensure dark mode variables work correctly
        const colorScheme = document.documentElement.getAttribute('data-mantine-color-scheme') || 'dark';
        pip.document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
        pip.document.documentElement.className = document.documentElement.className;

        pip.document.body.style.backgroundColor = 'var(--mantine-color-body)';
        pip.document.body.style.margin = '0';
        pip.document.body.style.overflow = 'hidden';

        pip.addEventListener('pagehide', () => {
          setPipWindow(null);
        });

        setPipWindow(pip);
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          console.warn('PiP auto-activation blocked by browser: requires user gesture.');
        } else {
          console.error('Failed to open PiP window', err);
        }
      }
    }
  }, [pipWindow, activeCall, participantCount]);

  // Attempt to auto-PIP when tab becomes hidden and auto-close when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !pipWindow && activeCall) {
        togglePip();
      } else if (document.visibilityState === 'visible' && pipWindow) {
        pipWindow.close();
        setPipWindow(null);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pipWindow, activeCall, togglePip]);

  // If there's no call, don't show anything
  if (!activeCall) {
    return null;
  }

  const isLessonPage = pathname?.includes('/lesson/');

  // If we are on the lesson page AND not in PiP, don't show the floating UI
  if (isLessonPage && !pipWindow) {
    return null;
  }

  // Hide the floating widget if the local user is sharing their screen 
  // (to prevent it from being captured in the demonstration)
  // We only hide the internal DraggablePip, the real pipWindow (separate window) can stay.
  const isLocalSharing = activeCall.state.localParticipant?.publishedTracks.includes(SfuModels.TrackType.SCREEN_SHARE);
  if (isLocalSharing && !pipWindow) {
    return null;
  }

  const content = (
    <StreamCall call={activeCall}>
      <StreamTheme>
        <MiniCallUI 
          t={t} 
          onTogglePip={togglePip} 
          isPip={!!pipWindow} 
          pipWindow={pipWindow}
          onParticipantCountChange={setParticipantCount} 
        />
      </StreamTheme>
    </StreamCall>
  );

  if (pipWindow) {
    return createPortal(
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <div className="w-screen h-screen bg-[var(--mantine-color-body)]">
          {content}
        </div>
      </MantineProvider>,
      pipWindow.document.body
    );
  }

  return (
    <DraggablePip 
      fixed 
      width={280} 
      height={participantCount > 1 ? 420 : 210} 
    >
      <div 
        className="w-full h-full cursor-pointer"
        onClick={() => router.push(`/main/lesson/${activeCall.id}`)}
      >
        {content}
      </div>
    </DraggablePip>
  );
}

interface MiniCallUIProps {
  t: any;
  onTogglePip: () => void;
  isPip: boolean;
  pipWindow: Window | null;
  onParticipantCountChange?: (count: number) => void;
}

function MiniCallUI({ t, onTogglePip, isPip, pipWindow, onParticipantCountChange }: MiniCallUIProps) {
  const { useCameraState, useMicrophoneState, useParticipants, useCallCallingState } = useCallStateHooks();
  const { setActiveCall } = useActiveCall();
  const call = useCall();
  const { user } = useAuth();
  const { isMute: isMicMuted } = useMicrophoneState();
  const { isMute: isCamMuted } = useCameraState();
  const callingState = useCallCallingState();

  // Close the PiP window automatically if the call ends remotely
  useEffect(() => {
    if (callingState === 'left') {
      setActiveCall(null);
    }
  }, [callingState, setActiveCall]);

  const handleLeave = async () => {
    if (call) {
      try {
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
  const localParticipant = participants.find(p => p.isLocalParticipant);
  const remoteParticipants = participants.filter(p => !p.isLocalParticipant);
  
  useEffect(() => {
    onParticipantCountChange?.(participants.length);
  }, [participants.length, onParticipantCountChange]);

  const isStudent = user?.role === 'student';
  const topParticipant = isStudent ? remoteParticipants[0] : localParticipant;
  const bottomParticipant = isStudent ? localParticipant : remoteParticipants[0];

  const getTrackType = (p: any) => {
    if (!p) return 'videoTrack';
    if (!p.isLocalParticipant && p.publishedTracks.includes(SfuModels.TrackType.SCREEN_SHARE)) {
      return 'screenShareTrack';
    }
    return 'videoTrack';
  };

  // Try to set autoPictureInPicture attribute to the underlying video element
  useEffect(() => {
    const timer = setTimeout(() => {
      const doc = pipWindow ? pipWindow.document : document;
      const video = doc.querySelector('.str-video__participant-view video');
      if (video) {
        (video as any).autoPictureInPicture = true;
        (video as any).disablePictureInPicture = false;
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [topParticipant, bottomParticipant, pipWindow]);

  return (
    <Box className="w-full h-full relative group bg-[var(--call-surface)]">
      <div className="w-full h-full flex flex-col overflow-hidden">
        {topParticipant && (
          <div 
            key={`top-${topParticipant.sessionId}`} 
            className={`flex-1 relative w-full h-full min-h-0 bg-black ${participants.length > 1 ? 'border-b border-[var(--call-border)]' : ''}`}
          >
            <ParticipantView
              participant={topParticipant}
              trackType={getTrackType(topParticipant)}
              className="w-full h-full"
            />
          </div>
        )}
        {bottomParticipant && (
          <div key={`bottom-${bottomParticipant.sessionId}`} className="flex-1 relative w-full h-full min-h-0 bg-black">
            <ParticipantView
              participant={bottomParticipant}
              trackType={getTrackType(bottomParticipant)}
              className="w-full h-full"
            />
          </div>
        )}
        {!topParticipant && !bottomParticipant && (
          <div
            className="flex-1 flex items-center justify-center text-xs"
            style={{ color: 'var(--call-text)' }}
          >
            {t('loading')}
          </div>
        )}
      </div>

      {/* Hover controls overlay */}
      <div className={`absolute inset-0 bg-black/40 ${isPip ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex flex-col justify-end p-2`}>
        <Group gap="xs" justify="center" onClick={(e) => e.stopPropagation()}>
          <ActionIcon 
            variant="filled" 
            size="md" 
            radius="xl"
            color={isMicMuted ? 'red' : 'primary'}
            onClick={() => call?.microphone.toggle()}
            title={isMicMuted ? 'Unmute' : 'Mute'}
          >
            {isMicMuted ? <IoMicOffOutline size={14} /> : <IoMicOutline size={14} />}
          </ActionIcon>
          
          <ActionIcon 
            variant="filled" 
            size="md"
            radius="xl" 
            color={isCamMuted ? 'red' : 'primary'}
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
