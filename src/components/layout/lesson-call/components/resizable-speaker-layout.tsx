'use client';

import { 
  ParticipantView, 
  DefaultParticipantViewUI, 
} from '@stream-io/video-react-sdk';

import { useSidebarResize } from '../hooks/use-sidebar-resize';

/** ParticipantViewUI without the three-dot menu button */
const NoMenuParticipantViewUI = () => (
  <DefaultParticipantViewUI showMenuButton={false} />
);

interface ResizableSpeakerLayoutProps {
  bar_position: 'left' | 'right';
  local_participant: any;
  participants: any[];
  sharing_participant?: any;
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
}: ResizableSpeakerLayoutProps) {
  const { sidebar_ratio, container_ref, on_drag_start } = useSidebarResize();

  // Determine who goes to spotlight
  // 1. If someone is sharing screen, they take the spotlight (with screen track)
  // 2. Otherwise, the first remote participant takes it
  // 3. Last fallback: local participant
  
  const is_sharing = !!sharing_participant;
  
  const spotlight = sharing_participant 
    ? sharing_participant 
    : (participants.find(p => p.sessionId !== local_participant?.sessionId) || local_participant);

  // Sidebar participants are everyone except what's in the spotlight
  // Note: if someone is sharing screen, we still want to see their camera in the sidebar
  const final_sidebar = is_sharing 
    ? participants 
    : participants.filter(p => p.sessionId !== spotlight?.sessionId);

  const spotlight_pct = 100 - sidebar_ratio;

  return (
    <div
      ref={container_ref}
      className="flex w-full h-full gap-0 items-center"
    >
      {/* Spotlight Panel (Big Video or Screen Share) */}
      <div
        className="relative overflow-hidden rounded-xl w-full h-full transition-all duration-300"
        style={{ 
          flex: `0 0 ${spotlight_pct}%`, 
          minWidth: 0,
          order: bar_position === 'left' ? 2 : 1 
        }}
      >
        {spotlight && (
          <ParticipantView
            participant={spotlight}
            trackType={spotlight.sessionId === sharing_participant?.sessionId ? 'screenShareTrack' : 'videoTrack'}
            className="w-full h-full"
            ParticipantViewUI={NoMenuParticipantViewUI}
          />
        )}
      </div>

      {/* Drag handle */}
      {final_sidebar.length > 0 && (
        <div
          onMouseDown={(e) => on_drag_start(e, bar_position)}
          className="flex-shrink-0 w-2 cursor-col-resize group flex items-center justify-center z-10"
          style={{ order: 1.5 }}
        >
          <div className="w-[3px] h-12 rounded-full bg-white/20 group-hover:bg-white/50 transition-colors duration-150" />
        </div>
      )}

      {/* Sidebar Panel (Small Participant Videos) */}
      {final_sidebar.length > 0 && (
        <div
          className="max-h-full overflow-y-auto overflow-x-hidden hide-scrollbar flex flex-col gap-2 p-1"
          style={{ 
            flex: `0 0 ${sidebar_ratio}%`, 
            minWidth: 0,
            order: bar_position === 'left' ? 1 : 2
          }}
        >
          {final_sidebar.map(p => (
            <div key={p.sessionId} className="relative overflow-hidden rounded-lg aspect-video w-full border border-white/5 shrink-0">
              <ParticipantView
                participant={p}
                trackType="videoTrack"
                className="w-full h-full"
                ParticipantViewUI={NoMenuParticipantViewUI}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
