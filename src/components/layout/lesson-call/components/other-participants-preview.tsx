'use client';

import { 
  ParticipantView, 
  useCallStateHooks 
} from '@stream-io/video-react-sdk';

/**
 * PIP-style preview for other participants in fullscreen mode.
 */
export function OtherParticipantsPreview() {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  if (!localParticipant) return null;

  const others = participants.filter(p => p.sessionId !== localParticipant.sessionId);

  // If 1-on-1: Background shows interlocutor, PIP shows local user
  if (others.length === 1) {
    return (
      <div className="w-full h-full">
        <ParticipantView participant={localParticipant} className="w-full h-full" />
      </div>
    );
  }

  const visible = others.slice(0, 4);
  const count = visible.length;

  if (count === 0) return null;

  const cols = count <= 1 ? 1 : 2;
  const rows = Math.ceil(count / cols);

  return (
    <div
      style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {visible.map((p) => (
        <div key={p.sessionId} className="relative w-full h-full overflow-hidden border-[0.5px] border-white/5">
          <ParticipantView participant={p} className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}
