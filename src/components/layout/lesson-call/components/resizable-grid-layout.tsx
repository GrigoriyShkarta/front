'use client';

import { ParticipantView, DefaultParticipantViewUI } from '@stream-io/video-react-sdk';
import { useCallback, useRef, useState } from 'react';

/** ParticipantViewUI without the three-dot menu button */
const NoMenuParticipantViewUI = () => (
  <DefaultParticipantViewUI showMenuButton={false} />
);

interface ResizableGridLayoutProps {
  local_participant: any;
  participants: any[];
  sharing_participant?: any;
}

const MIN_PCT = 20;
const MAX_PCT = 80;

/**
 * A side-by-side layout for 2 people with a resizable divider.
 * Used for the 'grid' layout when exactly 2 participants are present.
 */
export function ResizableGridLayout({
  local_participant,
  participants,
  sharing_participant,
}: ResizableGridLayoutProps) {
  const [left_pct, set_left_pct] = useState(50);
  const container_ref = useRef<HTMLDivElement | null>(null);

  const others = local_participant
    ? participants.filter((p) => p.sessionId !== local_participant.sessionId)
    : participants;

  const left_participant = others[0];
  const right_participant = local_participant;

  const on_drag_start = useCallback((e: React.MouseEvent) => {
    const container = container_ref.current;
    if (!container) return;

    const container_rect = container.getBoundingClientRect();
    e.preventDefault();

    const on_move = (move_e: MouseEvent) => {
      const relative_x = move_e.clientX - container_rect.left;
      const pct = (relative_x / container_rect.width) * 100;
      set_left_pct(Math.min(MAX_PCT, Math.max(MIN_PCT, pct)));
    };

    const on_up = () => {
      document.removeEventListener('mousemove', on_move);
      document.removeEventListener('mouseup', on_up);
    };

    document.addEventListener('mousemove', on_move);
    document.addEventListener('mouseup', on_up);
  }, []);

  if (!left_participant || !right_participant) return null;

  return (
    <div
      ref={container_ref}
      className="flex w-full h-full gap-0 items-center"
    >
      {/* Left Panel (Teacher/Other) */}
      <div
        className="relative overflow-hidden rounded-xl w-full h-full"
        style={{ flex: `0 0 ${left_pct}%`, minWidth: 0 }}
      >
        <ParticipantView
          participant={left_participant}
          trackType={left_participant?.sessionId === sharing_participant?.sessionId ? 'screenShareTrack' : 'videoTrack'}
          className="w-full h-full"
          ParticipantViewUI={NoMenuParticipantViewUI}
        />
      </div>

      {/* Splitter */}
      <div
        onMouseDown={on_drag_start}
        className="flex-shrink-0 w-2 cursor-col-resize group flex items-center justify-center z-10"
      >
        <div className="w-[3px] h-12 rounded-full bg-white/20 group-hover:bg-white/50 transition-colors duration-150" />
      </div>

      {/* Right Panel (Local) */}
      <div
        className="relative overflow-hidden rounded-xl w-full h-full"
        style={{ flex: `0 0 ${100 - left_pct}%`, minWidth: 0 }}
      >
        <ParticipantView
          participant={right_participant}
          trackType={right_participant?.sessionId === sharing_participant?.sessionId ? 'screenShareTrack' : 'videoTrack'}
          className="w-full h-full"
          ParticipantViewUI={NoMenuParticipantViewUI}
        />
      </div>
    </div>
  );
}
