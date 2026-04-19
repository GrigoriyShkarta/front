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

import { useLessonSettings } from './hooks/use-lesson-settings';
import { useCallRecording } from './hooks/use-call-recording';
import { useFullscreen } from './hooks/use-fullscreen';

import { SettingsDrawer } from './components/settings-drawer';
import { ParticipantsPanel } from './components/participants-panel';
import { CallControlsBar } from './components/call-controls-bar';
import { LessonLayoutView } from './components/lesson-layout-view';
import { OtherParticipantsPreview } from './components/other-participants-preview';

import { LessonTimer } from './components/lesson-timer';

import '@stream-io/video-react-sdk/dist/css/styles.css';



/**
 * Main Lesson Room component.
 * Handles the call lifecycle and layout.
 */
export function LessonRoom({ call }: { call: Call }) {
  const { user } = useAuth();
  
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

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right' | 'pip';

function MyCallUI() {
  const t = useTranslations('Calendar.lesson_room');
  const router = useRouter();
  const { user } = useAuth();
  const { activeCall, setActiveCall } = useActiveCall();
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
  useCallRecording(call);

  // Local State
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-switch layout on screen share
  useEffect(() => {
    if (hasOngoingScreenShare) {
      setLayout('speaker-right');
    } else {
      setLayout('grid');
    }
  }, [hasOngoingScreenShare]);

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
            layout={layout}
            fullscreenEl={fullscreenEl}
            localParticipant={localParticipant}
            participants={participants}
            sharingParticipant={sharingParticipant}
          />
        </div>

        {/* Floating PIP Window for focus mode */}
        {layout === 'pip' && participants.length > 1 && (fullscreenEl || rootRef.current) && createPortal(
          <div className="absolute bottom-6 right-6 w-[240px] h-[160px] z-[9999] rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--call-border)] bg-[var(--call-surface)]">
            {participants.length === 2 && localParticipant ? (
              <ParticipantView participant={localParticipant} className="w-full h-full" />
            ) : (
              <OtherParticipantsPreview />
            )}
          </div>,
          fullscreenEl || rootRef.current!,
        )}

        {/* Lesson End Timer (5m warning) - Portaled here for fullscreen visibility */}
        {(fullscreenEl || rootRef.current) && createPortal(
          <LessonTimer lesson_id={call.id} />,
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
        layout={layout}
        is_fullscreen={!!fullscreenEl}
        onLayoutChange={setLayout}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={() => setShowSettings(true)}
        onToggleParticipants={() => setShowParticipants((prev) => !prev)}
        onLeave={handleLeave}
      />

      {/* Settings Drawer */}
      <SettingsDrawer 
        opened={showSettings}
        onClose={() => setShowSettings(false)}
        fullscreenEl={fullscreenEl}
        settings={lessonSettings}
        onUpdate={updateSetting}
        isLoading={isUpdating}
      />
    </section>
  );
}
