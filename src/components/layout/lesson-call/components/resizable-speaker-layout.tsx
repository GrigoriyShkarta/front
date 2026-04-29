'use client';

import { 
  ParticipantView, 
  DefaultParticipantViewUI, 
} from '@stream-io/video-react-sdk';

import { useSidebarResize } from '../hooks/use-sidebar-resize';
import { ParticipantModerationWrapper } from './participant-moderation-wrapper';

/** ParticipantViewUI without the three-dot menu button */
const NoMenuParticipantViewUI = () => (
  <DefaultParticipantViewUI showMenuButton={false} />
);

interface ResizableSpeakerLayoutProps {
  bar_position: 'left' | 'right' | 'top';
  local_participant: any;
  participants: any[];
  sharing_participant?: any;
  is_fullscreen?: boolean;
}

/**
 * Custom speaker layout with a draggable divider between spotlight and sidebar.
 * Automatically prioritizes Screen Share in the spotlight area.
 */
export function ResizableSpeakerLayout({
  bar_position,
  local_participant,
  participants,
  sharing_participant,
  is_fullscreen,
}: ResizableSpeakerLayoutProps) {
  const { sidebar_ratio, container_ref, on_drag_start } = useSidebarResize();

  // Determine who goes to spotlight
  const is_sharing = !!sharing_participant;
  
  const spotlight = sharing_participant 
    ? sharing_participant 
    : (participants.find(p => p.sessionId !== local_participant?.sessionId) || local_participant);

  const final_sidebar = is_sharing 
    ? participants 
    : participants.filter(p => p.sessionId !== spotlight?.sessionId);

  const spotlight_pct = 100 - sidebar_ratio;
  const is_horizontal = bar_position === 'top';

  return (
    <div
      ref={container_ref}
      className={`flex w-full h-full gap-0 items-center ${is_horizontal ? 'flex-col' : 'flex-row'}`}
    >
      {/* Spotlight Panel (Big Video or Screen Share) */}
      <div
        className={`relative overflow-hidden w-full h-full transition-all duration-300 ${is_fullscreen ? 'rounded-none' : 'rounded-xl'}`}
        style={{ 
          flex: `0 0 ${spotlight_pct}%`, 
          minWidth: 0,
          order: bar_position === 'left' ? 3 : 1 
        }}
      >
        {spotlight && (
          <ParticipantModerationWrapper participant={spotlight}>
            <ParticipantView
              participant={spotlight}
              trackType={spotlight.sessionId === sharing_participant?.sessionId ? 'screenShareTrack' : 'videoTrack'}
              muteAudio={spotlight.sessionId === local_participant?.sessionId}
              className="w-full h-full [&_video]:object-contain"
              ParticipantViewUI={NoMenuParticipantViewUI}
            />
          </ParticipantModerationWrapper>
        )}
      </div>

      {/* Drag handle - only for left/right positions */}
      {final_sidebar.length > 0 && !is_horizontal && (
        <div
          onMouseDown={(e) => on_drag_start(e, bar_position)}
          className={`flex-shrink-0 group flex items-center justify-center z-10 w-2 h-full cursor-col-resize`}
          style={{ order: 2 }}
        >
          <div className="w-[3px] h-12 rounded-full bg-white/20 group-hover:bg-white/50 transition-colors duration-150" />
        </div>
      )}

      {/* Sidebar Panel (Small Participant Videos) */}
      {final_sidebar.length > 0 && (
        <div
          className={`max-h-full hide-scrollbar flex gap-2 p-1 justify-center ${is_horizontal ? 'w-full flex-row overflow-x-auto overflow-y-hidden items-center' : 'h-full flex-col overflow-y-auto overflow-x-hidden'}`}
          style={{ 
            flex: `0 0 ${sidebar_ratio}%`, 
            minWidth: 0,
            order: bar_position === 'left' ? 1 : 3
          }}
        >
          {final_sidebar.map(p => (
            <div 
              key={p.sessionId} 
              className={`relative overflow-hidden aspect-video border border-white/5 shrink-0 ${is_fullscreen ? 'rounded-none' : 'rounded-lg'} ${is_horizontal ? 'h-full' : 'w-full'}`}
            >
              <ParticipantModerationWrapper participant={p}>
                <ParticipantView
                  participant={p}
                  trackType="videoTrack"
                  muteAudio={p.sessionId === local_participant?.sessionId}
                  className="w-full h-full"
                  ParticipantViewUI={NoMenuParticipantViewUI}
                />
              </ParticipantModerationWrapper>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
