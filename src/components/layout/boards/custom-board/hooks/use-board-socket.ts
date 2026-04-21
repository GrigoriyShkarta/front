'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const backend_data_url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');
// For sockets on Vercel, we MUST use direct connection to the backend, not the /api-proxy
const backend_url = process.env.NEXT_PUBLIC_SOCKET_URL || 
                    (backend_data_url.includes('localhost') 
                      ? backend_data_url.replace('/api', '') 
                      : 'https://test-lirnexa-435a6bda28a0.herokuapp.com');
const socket_path = '/socket.io';

export interface ActiveParticipant {
  user_id: string;
  email: string;
  name: string;
  avatar: string | null;
}

export function useBoardSocket(board_id: string, user: any) {
  const socket_ref = useRef<Socket | null>(null);
  const [is_connected, set_is_connected] = useState(false);
  const [participants, set_participants] = useState<ActiveParticipant[]>([]);
  const [cursors, set_cursors] = useState<Record<string, any>>({});
  const [following_user_id, set_following_user_id] = useState<string | null>(null);

  useEffect(() => {
    if (!board_id) return;

    console.log('check', Cookies.get('access_token_client'));

    const socket = io(`${backend_url}/board`, {
      path: socket_path,
      withCredentials: true,
      auth: { token: Cookies.get('access_token_client') },
      query: { board_id },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket_ref.current = socket;

    socket.on('connect', () => {
      set_is_connected(true);
      console.log('[Socket] Connected');
    });

    socket.on('disconnect', () => set_is_connected(false));

    socket.on('participants:list', (data) => {
      set_participants(data.participants || []);
    });

    socket.on('participant:joined', (data) => {
      if (data.participant) {
        set_participants(prev => {
          if (prev.find(p => p.user_id === data.participant.user_id)) return prev;
          return [...prev, data.participant];
        });
      }
    });

    socket.on('participant:left', (data) => {
      set_participants(prev => prev.filter(p => p.user_id !== data.user_id));
      set_cursors(prev => {
        const next = { ...prev };
        delete next[data.user_id];
        return next;
      });
      if (following_user_id === data.user_id) set_following_user_id(null);
    });

    const handleCursor = (data: any) => {
      const remote_id = data.user_id || data.id || data.socket_id;
      if (!remote_id || remote_id === user?.id) return;
      
      set_cursors(prev => ({
        ...prev,
        [remote_id]: { 
          x: data.x, 
          y: data.y, 
          name: data.name, 
          avatar: data.avatar,
          path: data.path,
          draft: data.draft,
          color: data.color || '#000000',
          stroke_width: data.stroke_width || 4
        }
      }));
    };

    socket.on('cursor:move', handleCursor);

    return () => {
      socket.disconnect();
    };
  }, [board_id, user?.id, following_user_id]);

  const emit_element_update = useCallback((elements: any[]) => {
    socket_ref.current?.emit('element:update', { board_id, elements });
  }, [board_id]);

  const emit_element_create = useCallback((element: any) => {
    socket_ref.current?.emit('element:create', { board_id, element });
  }, [board_id]);

  const emit_element_delete = useCallback((ids: string[]) => {
    socket_ref.current?.emit('element:delete', { board_id, ids });
  }, [board_id]);

  const emit_cursor = useCallback((data: any) => {
    socket_ref.current?.emit('cursor:move', { 
        board_id, 
        user_id: user?.id,
        x: data.x, 
        y: data.y, 
        path: data.path, 
        draft: data.draft,
        name: user?.name,
        avatar: user?.avatar,
        color: data.color,
        stroke_width: data.stroke_width
    });
  }, [board_id, user?.id, user?.name, user?.avatar]);

  const emit_board_settings = useCallback((settings: any) => {
    socket_ref.current?.emit('board:settings_update', { board_id, settings });
  }, [board_id]);

  return { 
    socket: socket_ref.current, 
    isConnected: is_connected, 
    participants, 
    cursors, 
    following_user_id, 
    setFollowingUserId: set_following_user_id,
    emit_element_update,
    emit_element_create,
    emit_element_delete,
    emit_cursor,
    emit_board_settings
  };
}
