'use client';

import { Box, Group, Tooltip, Avatar, Indicator, AvatarGroup } from '@mantine/core';
import { ActiveParticipant } from '../hooks/use-board-socket';

interface Props {
  participants: any[];
  user: any;
  isConnected: boolean;
  following_user_id: string | null;
  onFollow: (id: string | null) => void;
}

/**
 * Component to display board participants and connection status.
 */
export function BoardParticipants({ 
  participants, 
  user, 
  isConnected, 
  following_user_id, 
  onFollow 
}: Props) {
  return (
    <Box style={{ position: 'absolute', top: 20, right: 20, zIndex: 110 }}>
      <Group gap={8}>
        <AvatarGroup>
          {/* Others */}
          {participants.map((p) => {
            const p_id = p.user_id || p.id;
            const is_me = p_id === user?.id;
            if (is_me) return null;
            
            const is_following = following_user_id === p_id;
            
            return (
              <Tooltip key={p_id} label={is_following ? `Following ${p.name}` : p.name}>
                <Indicator 
                  disabled={!is_following} 
                  color="blue" 
                  size={10} 
                  withBorder 
                  processing
                >
                  <Avatar 
                    src={p.avatar}
                    size="md" 
                    radius="xl"
                    className="cursor-pointer border-2 transition-transform hover:scale-105"
                    style={{ borderOpacity: 0.1, borderColor: is_following ? 'var(--mantine-color-blue-filled)' : 'transparent' }}
                    onClick={() => onFollow(is_following ? null : p_id)}
                  >
                    {p.name?.slice(0, 2).toUpperCase()}
                  </Avatar>
                </Indicator>
              </Tooltip>
            );
          }).filter(Boolean)}
          
          {participants.length > 5 && (
            <Avatar radius="xl" size="md">+{participants.length - 5}</Avatar>
          )}
        </AvatarGroup>
      </Group>
      {following_user_id && (
        <Box style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <Box className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 backdrop-blur-md">
            Following Mode Active
          </Box>
        </Box>
      )}
    </Box>
  );
}
