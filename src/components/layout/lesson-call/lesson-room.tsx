'use client';

import {
  Call,
  CallingState,
  ParticipantView,
  StreamCall,
  StreamTheme,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { SfuModels } from '@stream-io/video-client';
import { Box, Center, Loader, Text } from '@mantine/core';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { useActiveCall } from '@/context/active-call-context';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { useFloatingNotes } from '@/context/floating-notes-context';

import { useLessonSettings } from './hooks/use-lesson-settings';
import { useCallRecording } from './hooks/use-call-recording';
import { useFullscreen } from './hooks/use-fullscreen';

import { SettingsDrawer } from './components/settings-drawer';
import { ParticipantsPanel } from './components/participants-panel';
import { CallControlsBar } from './components/call-controls-bar';
import { LessonLayoutView } from './components/lesson-layout-view';
import { DraggablePip } from './components/draggable-pip';
import { OtherParticipantsPreview } from './components/other-participants-preview';

import { LessonTimer } from './components/lesson-timer';
import { CurrentTime } from './components/current-time';
import { FloatingNotesManager } from './components/floating-notes-manager';

import '@stream-io/video-react-sdk/dist/css/styles.css';



/**
 * Main Lesson Room component.
 * Handles the call lifecycle and layout.
 */
export function LessonRoom({ call }: { call: Call }) {
  const { user } = useAuth();
  const { clearNotes, closeAllNotes } = useFloatingNotes();

  useEffect(() => {
    if (call.id) {
      clearNotes(call.id);
    }

    // Cleanup: hide notes when leaving the lesson room UI, but don't wipe session IDs
    return () => {
      closeAllNotes();
    };
  }, [call.id, clearNotes, closeAllNotes]);
  
  return (
    <StreamCall call={call}>
      <StreamTheme>
        <Box 
          className="flex flex-col h-[calc(100vh-45px)] relative overflow-hidden"
          data-user-role={user?.role}
        >
          <MyCallUI />
        </Box>
      </StreamTheme>
    </StreamCall>
  );
}

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right' | 'speaker-top' | 'pip';

function MyCallUI() {
  const t = useTranslations('Calendar.lesson_room');
  const router = useRouter();
  const { user } = useAuth();
  const { activeCall, setActiveCall, call_layout, set_call_layout } = useActiveCall();
  const call = useCall();
  
  const { 
    useCallCallingState, 
    useHasOngoingScreenShare, 
    useLocalParticipant, 
    useParticipants,
    useIsCallRecordingInProgress,
  } = useCallStateHooks();
  
  const callingState = useCallCallingState();
  const hasOngoingScreenShare = useHasOngoingScreenShare();
  const localParticipant = useLocalParticipant();
  const participants = useParticipants();
  const isRecordingInProgress = useIsCallRecordingInProgress();

  // Use publishedTracks (signaling-based, immediate) to reliably detect screen sharing
  // screenShareStream is only set after WebRTC track subscription — causes a race on the viewer side
  const sharingParticipant = participants.find(
    (p) => p.publishedTracks.includes(SfuModels.TrackType.SCREEN_SHARE)
  ) ?? null;

  // Custom Hooks
  const rootRef = useRef<HTMLElement | null>(null);
  const { fullscreenEl, toggleFullscreen } = useFullscreen(rootRef);
  const { lessonSettings, isUpdating, updateSetting } = useLessonSettings(call, user?.role);

  // Count existing recording segments so useCallRecording can show the correct notification
  const existing_parts_count = lessonSettings.lesson_recording_url
    ? lessonSettings.lesson_recording_url.split(',').filter(Boolean).length
    : 0;

  useCallRecording(call, existing_parts_count);

  // Local State
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [visibilityKey, setVisibilityKey] = useState(0);

  // Force re-render of layout when tab becomes visible to fix frozen videos (e.g. after PiP or tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setVisibilityKey(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Screen share layout management: auto-switch and restore
  const prevSharing = useRef(hasOngoingScreenShare);
  useEffect(() => {
    // Case 1: Screen share STARTED
    if (!prevSharing.current && hasOngoingScreenShare) {
      // Auto-switch to PiP mode when sharing starts
      set_call_layout('pip');
    }

    // Case 2: Screen share ENDED
    if (prevSharing.current && !hasOngoingScreenShare) {
      // Restore layout based on fullscreen state
      if (fullscreenEl) {
        set_call_layout('pip');
      } else {
        set_call_layout('grid');
      }
    }

    prevSharing.current = hasOngoingScreenShare;
  }, [hasOngoingScreenShare, fullscreenEl, call_layout, set_call_layout]);

  // Set default constraints for screen share to avoid audio echo when sharing tab
  useEffect(() => {
    if (call && typeof (call.screenShare as any).setDefaultConstraints === 'function') {
      try {
        (call.screenShare as any).setDefaultConstraints({
          audio: {
            suppressLocalAudioPlayback: false,
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: false,
          },
          video: true,
        });
      } catch (e) {
        console.warn('Could not set screen share default constraints', e);
      }
    }
  }, [call]);

  // Default to PIP in fullscreen mode, unless there is a screen share
  useEffect(() => {
    if (fullscreenEl && !hasOngoingScreenShare) {
      set_call_layout('pip');
    }
  }, [fullscreenEl, hasOngoingScreenShare, set_call_layout]);

  // Handle call end/cleanup
  useEffect(() => {
    if (callingState === CallingState.LEFT || callingState === CallingState.IDLE) {
      setActiveCall(null);
      router.push('/main');
    }
  }, [callingState, setActiveCall, router]);

  const handleLeave = async () => {
    // 1. Store reference and immediately clear context to remove UI elements
    const callToEnd = activeCall || call;
    setActiveCall(null);
    
    // 2. Perform cleanup
    if (callToEnd) {
      try {
        if (user && user.role !== 'student') {
          // If teacher is leaving, stop recording and end call for everyone
          if (isRecordingInProgress) {
            try {
              await callToEnd.stopRecording();
            } catch (error) {
              console.error('Failed to stop recording:', error);
            }
          }
          await callToEnd.endCall();
        } else {
          // Student just leaves
          await callToEnd.leave();
        }
      } catch (e) {
        console.error('Error during call termination:', e);
        try { await callToEnd.leave(); } catch (inner_e) {}
      }
    }

    // 3. Finally redirect
    router.push('/main');
  };

  if (callingState !== CallingState.JOINED || !call) {
    return (
      <Center className="flex-1 flex-col gap-4" style={{ backgroundColor: 'var(--call-bg)', color: 'var(--call-text)' }}>
        <Loader size="xl" color="primary" type="dots" />
        <Text fw={600} style={{ color: 'var(--call-text)' }}>
          {callingState === CallingState.JOINING ? t('joining') : t('preparing')}
        </Text>
      </Center>
    );
  }

  return (
    <section
      ref={rootRef}
      className="relative flex flex-col h-full w-full overflow-hidden"
      style={{ backgroundColor: 'var(--call-bg)', color: 'var(--call-text)' }}
    >
      {/* Main View Area */}
      <div className={`relative flex-1 flex w-full items-center justify-center min-h-0 ${fullscreenEl ? 'p-0' : 'p-4'}`}>
        <div className="flex size-full items-center">
          <LessonLayoutView 
            key={`layout-${visibilityKey}-${call_layout}`}
            layout={call_layout}
            fullscreenEl={fullscreenEl}
            localParticipant={localParticipant}
            participants={participants}
            sharingParticipant={sharingParticipant}
          />
        </div>

        {/* Floating PIP Window for focus mode */}
        {call_layout === 'pip' && participants.length > 1 && (fullscreenEl || rootRef.current) && createPortal(
          <DraggablePip containerRef={rootRef}>
            {participants.length === 2 && localParticipant ? (
              <ParticipantView 
                participant={
                  // If someone is sharing, always show the remote participant in the corner
                  // so the user can see their reaction/camera.
                  hasOngoingScreenShare 
                    ? (participants.find(p => p.sessionId !== localParticipant.sessionId) || localParticipant)
                    : localParticipant
                } 
                trackType="videoTrack"
                className="w-full h-full" 
                muteAudio={true} 
              />
            ) : (
              <OtherParticipantsPreview />
            )}
          </DraggablePip>,
          fullscreenEl || rootRef.current!,
        )}

        {/* Portaled UI Overlays: Lesson Timer, Clock, Recording Indicator */}
        {(fullscreenEl || rootRef.current) && createPortal(
          <>
            {isRecordingInProgress && (
              <Box 
                className={`absolute z-50 flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                  fullscreenEl ? 'top-4 left-4' : 'top-8 left-8'
                }`} 
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <Text size="sm" fw={600} style={{ color: 'white' }}>{t('recording')}</Text>
              </Box>
            )}
            <LessonTimer lesson_id={call.id} />
            <CurrentTime visible={!!fullscreenEl && !showParticipants && !showSettings} />
          </>,
          fullscreenEl || rootRef.current!,
        )}
      </div>

      {/* Sidebar Panel */}
      <ParticipantsPanel 
        opened={showParticipants} 
        onClose={() => setShowParticipants(false)} 
        fullscreenEl={fullscreenEl}
      />

      {/* Footer Controls */}
      <CallControlsBar 
        userRole={user?.role}
        layout={call_layout}
        is_fullscreen={!!fullscreenEl}
        onLayoutChange={set_call_layout}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={() => setShowSettings(true)}
        onToggleParticipants={() => setShowParticipants((prev) => !prev)}
        onLeave={handleLeave}
        studentId={participants.find(p => p.userId !== user?.id)?.userId}
        studentSessionId={participants.find(p => p.userId !== user?.id)?.sessionId}
      />

      {/* Settings Drawer */}
      <SettingsDrawer 
        opened={showSettings}
        onClose={() => setShowSettings(false)}
        fullscreenEl={fullscreenEl}
        settings={lessonSettings}
        onUpdate={updateSetting}
        isLoading={isUpdating}
        userRole={user?.role}
      />

      <FloatingNotesManager />
    </section>
  );
}
