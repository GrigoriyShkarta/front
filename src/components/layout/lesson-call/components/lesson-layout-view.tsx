'use client';

import { 
  PaginatedGridLayout, 
  ParticipantView, 
  DefaultParticipantViewUI,
} from '@stream-io/video-react-sdk';

import { ResizableSpeakerLayout } from './resizable-speaker-layout';
import { ResizableGridLayout } from './resizable-grid-layout';
import { ParticipantModerationWrapper } from './participant-moderation-wrapper';

/** ParticipantViewUI without the three-dot menu button */
const NoMenuParticipantViewUI = () => (
  <DefaultParticipantViewUI showMenuButton={false} />
);

interface LessonLayoutViewProps {
  layout: 'grid' | 'speaker-left' | 'speaker-right' | 'speaker-top' | 'pip';
  fullscreenEl: Element | null;
  localParticipant: any;
  participants: any[];
  sharingParticipant?: any;
}

/**
 * Renders the appropriate video layout based on settings and participants.
 */
export function LessonLayoutView({ 
  layout, 
  fullscreenEl, 
  localParticipant, 
  participants,
  sharingParticipant
}: LessonLayoutViewProps) {
  
  if (fullscreenEl && layout === 'grid' && localParticipant && !sharingParticipant) {
    // Sort participants to ensure consistent order (local participant at the end)
    const sortedParticipants = [...participants].sort((a, b) => {
      if (a.sessionId === localParticipant.sessionId) return 1;
      if (b.sessionId === localParticipant.sessionId) return -1;
      return 0;
    });

    const count = sortedParticipants.length;
    const cols = count <= 1 ? 1 : count === 2 ? 2 : 3;
    const rows = Math.ceil(count / cols);

    return (
      <div
        style={{
          display: 'grid',
          width: '100%',
          height: '100%',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 8,
        }}
      >
        {sortedParticipants.map((p) => (
          <div
            key={p.sessionId}
            className={`relative w-full h-full overflow-hidden ${fullscreenEl ? 'rounded-none' : 'rounded-xl'} border border-white/5`}
          >
            <ParticipantModerationWrapper participant={p}>
              <ParticipantView 
                participant={p} 
                trackType={p.sessionId === sharingParticipant?.sessionId ? 'screenShareTrack' : 'videoTrack'}
                // Mute only local participant to avoid loopback; remote audio should be heard
                muteAudio={p.sessionId === localParticipant?.sessionId}
                className={`w-full h-full ${p.sessionId === sharingParticipant?.sessionId ? '[&_video]:object-contain' : ''}`}
                ParticipantViewUI={NoMenuParticipantViewUI}
              />
            </ParticipantModerationWrapper>
          </div>
        ))}
      </div>
    );
  }

  switch (layout) {
    case 'grid':
      if (sharingParticipant) {
        return (
          <ResizableSpeakerLayout
            bar_position="top"
            local_participant={localParticipant}
            participants={participants}
            sharing_participant={sharingParticipant}
            is_fullscreen={!!fullscreenEl}
          />
        );
      }
      if (participants.length === 2 && localParticipant) {
        return (
          <ResizableGridLayout 
            local_participant={localParticipant}
            participants={participants}
            sharing_participant={sharingParticipant}
            is_fullscreen={!!fullscreenEl}
          />
        );
      }
      return <PaginatedGridLayout ParticipantViewUI={NoMenuParticipantViewUI} />;
    case 'pip':
      // Prioritize the screen share if any, otherwise find first remote, otherwise local
      const main_participant = sharingParticipant || 
                              participants.find(p => p.sessionId !== localParticipant?.sessionId) || 
                              localParticipant || 
                              participants[0];
      
      const is_sharing = main_participant?.sessionId === sharingParticipant?.sessionId;
      return (
        <div className={`relative w-full h-full overflow-hidden ${fullscreenEl ? 'rounded-none' : 'rounded-xl'}`}>
          <ParticipantModerationWrapper participant={main_participant}>
            <ParticipantView 
              participant={main_participant} 
              trackType={is_sharing ? 'screenShareTrack' : 'videoTrack'}
              muteAudio={main_participant?.sessionId === localParticipant?.sessionId}
              className={`w-full h-full ${is_sharing ? '[&_video]:object-contain' : ''}`}
              ParticipantViewUI={NoMenuParticipantViewUI}
            />
          </ParticipantModerationWrapper>
        </div>
      );
    case 'speaker-top':
      return (
        <ResizableSpeakerLayout
          bar_position="top"
          local_participant={localParticipant}
          participants={participants}
          sharing_participant={sharingParticipant}
          is_fullscreen={!!fullscreenEl}
        />
      );
    case 'speaker-right':
      return (
        <ResizableSpeakerLayout
          bar_position="right"
          local_participant={localParticipant}
          participants={participants}
          sharing_participant={sharingParticipant}
          is_fullscreen={!!fullscreenEl}
        />
      );
    case 'speaker-left':
      return (
        <ResizableSpeakerLayout
          bar_position="left"
          local_participant={localParticipant}
          participants={participants}
          sharing_participant={sharingParticipant}
          is_fullscreen={!!fullscreenEl}
        />
      );
    default:
      return (
        <ResizableSpeakerLayout
          bar_position="left"
          local_participant={localParticipant}
          participants={participants}
          sharing_participant={sharingParticipant}
          is_fullscreen={!!fullscreenEl}
        />
      );
  }
}
