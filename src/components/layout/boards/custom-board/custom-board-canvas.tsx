'use client';

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useBoardHistory } from './hooks/use-board-history';
import { useBoardZoomPan } from './hooks/use-board-zoom-pan';
import { useRouter } from '@/i18n/routing';
import { useBoardActions } from './hooks/use-board-actions';
import { useBoardPreview } from './hooks/use-board-preview';
import { useBoardSocket } from './hooks/use-board-socket';
import { BoardElement, ToolType, GridType, TextElement, BoardData } from './types';
import { CanvasRenderer } from './canvas-renderer';
import { CanvasToolbar } from './canvas-toolbar';
import { ShapeFormatToolbar } from './shape-format-toolbar';
import { TextFormatToolbar } from './text-format-toolbar';
import { get_element_bbox } from './utils';
import { InlineTextToolbar } from './inline-text-toolbar';
import { BoardBackground } from './components/board-background';
import { BoardParticipants } from './components/board-participants';
import { BoardCursors } from './components/board-cursors';
import { BoardSettingsModal } from './components/board-settings-modal';
import { MaterialsPickerModal } from '../components/materials-picker-modal';
import { LinkCreateModal as BoardLinkModal } from './components/link-create-modal';
import { EditableText } from '@/components/layout/boards/custom-board/components/editable-text';
import { UserProfile } from '@/schemas/user-profile';
import { upload_board_file, update_board } from './actions/board-api';
import { Box, useMantineColorScheme } from '@mantine/core';

const backend_url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');
const get_media_url = (url: string) => {
    if (!url || url.startsWith('http') || url.startsWith('blob') || url.startsWith('data')) return url;
    return `${backend_url}${url.startsWith('/') ? '' : '/'}${url}`;
};

const ERASER_CURSOR_WHITE = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'white\' stroke=\'black\' stroke-width=\'1\'%3E%3Crect x=\'4\' y=\'8\' width=\'16\' height=\'10\' rx=\'2\' transform=\'rotate(-45 12 13)\' /%3E%3C/svg%3E") 12 12, auto';
const ERASER_CURSOR_BLACK = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'black\' stroke=\'white\' stroke-width=\'1\'%3E%3Crect x=\'4\' y=\'8\' width=\'16\' height=\'10\' rx=\'2\' transform=\'rotate(-45 12 13)\' /%3E%3C/svg%3E") 12 12, auto';

interface Props {
  board_id: string;
  initial_data?: BoardData;
  user: UserProfile;
}

export function CustomBoardCanvas({ board_id, initial_data, user }: Props) {
  const { colorScheme } = useMantineColorScheme();
  const el_ref = useRef<BoardElement[]>(initial_data?.elements || []);
  const [elements, set_elements_state] = useState<BoardElement[]>(el_ref.current);
  
  const set_elements = useCallback((new_els: BoardElement[] | ((prev: BoardElement[]) => BoardElement[])) => {
    if (typeof new_els === 'function') {
      el_ref.current = new_els(el_ref.current);
    } else {
      el_ref.current = new_els;
    }
    set_elements_state(el_ref.current);
  }, []);

  // Settings & Theme
  const [bg_color, set_bg_color] = useState(initial_data?.bg_color || 'auto');
  const [grid_type, set_grid_type] = useState<GridType>(
    (initial_data?.grid_type === 'dots' || initial_data?.grid_type === 'none') 
      ? initial_data.grid_type 
      : 'cells'
  );
  const [board_theme, set_board_theme] = useState<'light' | 'dark' | 'auto'>(initial_data?.board_theme || 'auto');

  const is_dark = board_theme === 'auto' ? (colorScheme === 'dark') : (board_theme === 'dark');

  const [tool, set_tool] = useState<ToolType>('select');
  const [color, set_color] = useState(is_dark ? '#ffffff' : '#000000');
  const [stroke_width, set_stroke_width] = useState(4);
  const [stroke_style, set_stroke_style] = useState<'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'wavy'>('solid');
  const [is_settings_opened, set_is_settings_opened] = useState(false);
  const [is_link_modal_opened, set_is_link_modal_opened] = useState(false);
  const [is_materials_opened, set_is_materials_opened] = useState(false);
  const [picker_type, set_picker_type] = useState<'photo' | 'video' | 'audio' | 'file'>('photo');

  // Auto-flip active color on theme change if it's black or white
  useEffect(() => {
    set_color((prev) => {
        const lower = prev.toLowerCase();
        const is_adaptive = ['#000000', 'black', '#000', '#ffffff', 'white', '#fff'].includes(lower);
        if (is_adaptive) return is_dark ? '#ffffff' : '#000000';
        return prev;
    });
  }, [is_dark]);
  const effective_bg_color = bg_color === 'auto' ? (is_dark ? '#12121e' : '#f8f9fa') : bg_color;
  const grid_color = is_dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';

  // Collaborative Socket
  const { 
    socket, isConnected, participants, cursors, 
    emit_element_update, emit_element_create, emit_element_delete, emit_cursor, emit_board_settings,
    following_user_id, setFollowingUserId 
  } = useBoardSocket(board_id, user);

  // Sync from socket
  useEffect(() => {
    if (!socket) return;
    const handleRemoteUpdate = (data: { elements: BoardElement[] }) => {
      set_elements(prev => {
        const next = [...prev];
        (data.elements || []).forEach(u => {
          const idx = next.findIndex(e => e.id === u.id);
          if (idx !== -1) next[idx] = u;
          else next.push(u);
        });
        return next;
      });
    };
    const handleRemoteDelete = (data: { ids: string[] }) => {
      set_elements(prev => prev.filter(e => !(data.ids || []).includes(e.id)));
    };
    const handleSync = (data: { elements: BoardElement[], settings?: any }) => {
      if (data.elements) set_elements(data.elements);
      if (data.settings) {
        if (data.settings.bg_color) set_bg_color(data.settings.bg_color);
        if (data.settings.grid_type) set_grid_type(data.settings.grid_type);
        if (data.settings.board_theme) set_board_theme(data.settings.board_theme);
      }
    };
    
    const handleSettingsUpdated = (data: { settings: any }) => {
      if (!data.settings) return;
      if (data.settings.bg_color) set_bg_color(data.settings.bg_color);
      if (data.settings.grid_type) set_grid_type(data.settings.grid_type);
      if (data.settings.board_theme) set_board_theme(data.settings.board_theme);
    };

    socket.on('element:update', handleRemoteUpdate);
    socket.on('element:updated', handleRemoteUpdate);
    socket.on('elements:updated', handleRemoteUpdate);
    socket.on('element:create', handleRemoteUpdate); // Backend sends { element: [] }
    socket.on('element:created', handleRemoteUpdate);

    socket.on('element:delete', handleRemoteDelete);
    socket.on('element:deleted', handleRemoteDelete);
    socket.on('elements:deleted', handleRemoteDelete);

    socket.on('elements:sync', handleSync);
    socket.on('board:settings_updated', handleSettingsUpdated);
    socket.on('settings:updated', handleSettingsUpdated);

    return () => {
      socket.off('element:update', handleRemoteUpdate);
      socket.off('element:updated', handleRemoteUpdate);
      socket.off('elements:updated', handleRemoteUpdate);
      socket.off('element:create', handleRemoteUpdate);
      socket.off('element:created', handleRemoteUpdate);
      socket.off('element:delete', handleRemoteDelete);
      socket.off('element:deleted', handleRemoteDelete);
      socket.off('elements:deleted', handleRemoteDelete);
      socket.off('elements:sync', handleSync);
      socket.off('board:settings_updated', handleSettingsUpdated);
      socket.off('settings:updated', handleSettingsUpdated);
    };
  }, [socket, set_elements]);

  // History Hook (Undo/Redo)
  const { push_state, undo, redo, can_undo, can_redo } = useBoardHistory(elements, set_elements);

  // Zoom / Pan Hook
  const { pan_x, pan_y, zoom, is_panning, handle_wheel, handle_mouse_down: pan_mouse_down, set_pan, set_zoom } = useBoardZoomPan(tool);

  // "Follow Participant" mechanism
  useEffect(() => {
    if (following_user_id && cursors[following_user_id] && !is_panning) {
        const c = cursors[following_user_id];
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        set_pan({ x: vw / 2 - c.x * zoom, y: vh / 2 - c.y * zoom });
    }
  }, [following_user_id, cursors, zoom, set_pan, is_panning]);

  const handle_settings_update = (key: 'bg_color' | 'grid_type' | 'board_theme', value: any) => {
    if (key === 'bg_color') set_bg_color(value);
    if (key === 'grid_type') set_grid_type(value);
    if (key === 'board_theme') set_board_theme(value);

    // Persist to server
    update_board(board_id, { 
      settings: { 
        bg_color: key === 'bg_color' ? value : bg_color,
        grid_type: key === 'grid_type' ? value : grid_type,
        board_theme: key === 'board_theme' ? value : board_theme
      } 
    });

    // Broadcast to other participants
    emit_board_settings({
      bg_color: key === 'bg_color' ? value : bg_color,
      grid_type: key === 'grid_type' ? value : grid_type,
      board_theme: key === 'board_theme' ? value : board_theme
    });
  };

  const router = useRouter();

  const handle_exit = async () => {
    // Capture one last preview before leaving
    if (elements.length > 0) {
        await capture_preview();
    }
    const targetUserId = initial_data?.student_id || user.id;
    router.push(`/main/boards/${targetUserId}`);
  };

  // Actions Hook (Interaction Logic)
  const {
      selected_ids, editing_text_id, interactive_media_id, draft, active_path, marquee, eraser_trail, text_toolbar_pos, text_edit_ref,
      handle_mouse_down, handle_mouse_move, handle_mouse_up, handle_element_pointer_down, handle_element_double_click,
      handle_resize_start, handle_rotate_start, handle_delete, update_selected, update_element_by_id, set_selected_ids, set_editing_text_id
  } = useBoardActions({
      el_ref, set_elements, tool, color, stroke_width, stroke_style, pan_x, pan_y, zoom, push_state, emit_element_update, emit_element_delete, emit_cursor, is_dark,
      set_tool: (t: ToolType) => set_tool(t)
  });

  const inline_link_ref = useRef(false);
  const set_is_inline_link_open = (v: boolean) => { inline_link_ref.current = v; };

  // Board Thumbnails Hook
  const { board_container_ref, capture_preview } = useBoardPreview(board_id, elements, is_dark);
  const container_ref = useRef<HTMLDivElement>(null);

  // Native wheel listener to avoid browser zoom
  useEffect(() => {
    const el = container_ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => handle_wheel(e);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [handle_wheel]);

  const is_panning_state = is_panning || tool === 'hand';

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (editing_text_id || document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || is_link_modal_opened) return;
        
        if (e.ctrlKey || e.metaKey) {
            if (e.code === 'KeyZ') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
            if (e.code === 'KeyY') { e.preventDefault(); redo(); }
            if (e.code === 'KeyA') { e.preventDefault(); set_selected_ids(el_ref.current.map(el => el.id)); }
            return;
        }
        
        if (e.code === 'Delete' || e.code === 'Backspace') handle_delete();
        if (e.code === 'Escape') set_selected_ids([]);
        
        if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            const keyChar = e.key.toLowerCase();
            const codeChar = e.code.startsWith('Key') ? e.code.replace('Key', '').toLowerCase() : '';
            const keyMap: Record<string, ToolType> = { v: 'select', h: 'hand', p: 'pen', i: 'highlighter', r: 'rect', o: 'ellipse', t: 'text', e: 'eraser', l: 'line', a: 'arrow', d: 'diamond', s: 'triangle' };
            const mappedTool = keyMap[keyChar] || keyMap[codeChar];
            if (mappedTool) set_tool(mappedTool);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handle_delete, set_selected_ids, editing_text_id, is_link_modal_opened]);

  // Global paste handler — create elements from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // If user is editing text or in an input field, let browser handle natively
      if (editing_text_id) return;
      const active = document.activeElement;
      if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return;

      const items = Array.from(e.clipboardData?.items || []);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cx = (vw / 2 - pan_x) / zoom;
      const cy = (vh / 2 - pan_y) / zoom;
      const gen_id = () => Math.random().toString(36).slice(2, 10);

      // 1. Check for image first
      const imageItem = items.find(i => i.type.startsWith('image/'));
      if (imageItem) {
        e.preventDefault();
        const blob = imageItem.getAsFile();
        if (!blob) return;
        try {
          const src = await upload_board_file(board_id, blob);
          const new_el: BoardElement = { type: 'image', id: gen_id(), x: cx - 150, y: cy - 150, width: 300, height: 300, src, name: 'Pasted image', opacity: 1 };
          set_elements(prev => [...prev, new_el]);
          push_state([...el_ref.current, new_el]);
          emit_element_update([new_el]);
          set_selected_ids([new_el.id]);
        } catch (err) {
          console.error('Failed to upload pasted image', err);
        }
        return;
      }

      // 2. Check for plain text or links
      const textItem = items.find(i => i.type === 'text/plain');
      if (textItem) {
        e.preventDefault();
        textItem.getAsString((text) => {
          if (!text.trim()) return;
          const trimmed = text.trim();
          let new_el: BoardElement | null = null;

          // Check for YouTube
          const yt_match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
          if (yt_match) {
             const video_id = yt_match[1];
             new_el = { type: 'youtube', id: gen_id(), x: cx - 240, y: cy - 135, width: 480, height: 270, video_id, name: 'YouTube Video', opacity: 1 };
          } 
          // Check for Sketchfab links
          else if (trimmed.includes('sketchfab.com')) {
             const sf_model_match = trimmed.match(/sketchfab\.com\/(?:3d-)?models\/[^\/?]+-([a-fA-F0-9]{32})/);
             const sf_embed_match = trimmed.match(/sketchfab\.com\/models\/([a-fA-F0-9]{32})\/embed/);
             const model_id = sf_embed_match ? sf_embed_match[1] : (sf_model_match ? sf_model_match[1] : null);
             if (model_id) {
                new_el = { type: 'embed', id: gen_id(), x: cx - 240, y: cy - 135, width: 480, height: 270, src: `https://sketchfab.com/models/${model_id}/embed`, name: 'Sketchfab Model', opacity: 1 };
             }
          }
          // Check for raw iframe embed codes
          else if (trimmed.toLowerCase().startsWith('<iframe') && trimmed.includes('src="')) {
             const src_match = trimmed.match(/src="([^"]+)"/);
             if (src_match) {
                new_el = { type: 'embed', id: gen_id(), x: cx - 240, y: cy - 135, width: 480, height: 270, src: src_match[1], name: 'Embed', opacity: 1 };
             }
          }

          // Default to plain text if not matched
          if (!new_el) {
            new_el = {
              type: 'text', id: gen_id(),
              x: cx - 100, y: cy - 20,
              width: 200,
              content: text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'),
              color: '#ffffff', font_size: 16, font_family: 'Inter', font_weight: 'normal',
              font_style: 'normal', text_decoration: 'none', opacity: 1,
            };
          }

          set_elements(prev => [...prev, new_el!]);
          push_state([...el_ref.current, new_el!]);
          emit_element_update([new_el!]);
          set_selected_ids([new_el!.id]);
        });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [editing_text_id, pan_x, pan_y, zoom, board_id, set_elements, push_state, emit_element_update, set_selected_ids]);

  const file_input_ref = useRef<HTMLInputElement>(null);

  const handle_device_upload_change = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 1. Create a local placeholder
      const id = Math.random().toString(36).slice(2, 10);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cx = (vw / 2 - pan_x) / zoom;
      const cy = (vh / 2 - pan_y) / zoom;

      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file';
      
      let placeholder: BoardElement;
      const common = { id, opacity: 1, loading: true, name: file.name };
      
      if (type === 'image') placeholder = { type: 'image', ...common, x: cx - 150, y: cy - 150, width: 300, height: 300, src: '' };
      else if (type === 'video') placeholder = { type: 'video', ...common, x: cx - 200, y: cy - 150, width: 400, height: 300, src: '' };
      else if (type === 'audio') placeholder = { type: 'audio', ...common, x: cx - 150, y: cy - 40, width: 300, height: 80, src: '' };
      else placeholder = { type: 'file', ...common, x: cx - 125, y: cy - 40, width: 250, height: 80, src: '', ext: file.name.split('.').pop() || 'file' };

      // 2. Add locally and emit
      set_elements(prev => [...prev, placeholder]);
      emit_element_create(placeholder);

      try {
          // 3. Perform the actual upload
          const src = await upload_board_file(board_id, file);
          
          // 4. Update the element with final src and remove loading state
          const updated = { ...placeholder, src, loading: false } as BoardElement;
          update_element_by_id(id, { src, loading: false });
          
          // Sync final state
          emit_element_update([updated]);
          push_state(el_ref.current); // Use el_ref here because update_element_by_id updates it
      } catch (error) {
          console.error("Upload failed", error);
          // Optional: remove placeholder or show error
          set_elements(prev => prev.filter(el => el.id !== id));
          emit_element_delete([id]);
      }
      
      if (file_input_ref.current) file_input_ref.current.value = '';
  };

  const handle_material_select = useCallback((type: 'photo' | 'video' | 'audio' | 'file', material: any) => {
    const id = Math.random().toString(36).slice(2, 10);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = (vw / 2 - pan_x) / zoom;
    const cy = (vh / 2 - pan_y) / zoom;
    
    let new_el: BoardElement;
    const common = { id, opacity: 1 };

    switch (type) {
        case 'photo': new_el = { type: 'image', ...common, x: cx - 150, y: cy - 150, width: 300, height: 300, src: material.file_url || material.url || material.src, name: material.name || 'Image' }; break;
        case 'video': {
            const src = material.file_url || material.url || material.src;
            const yt_match = src?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (yt_match) {
               new_el = { type: 'youtube', ...common, x: cx - 240, y: cy - 135, width: 480, height: 270, video_id: yt_match[1], name: material.name || 'YouTube Video' };
            } else {
               new_el = { type: 'video', ...common, x: cx - 200, y: cy - 150, width: 400, height: 300, src, name: material.name || 'Video' };
            }
            break;
        }
        case 'audio': new_el = { type: 'audio', ...common, x: cx - 150, y: cy - 40, width: 300, height: 80, src: material.file_url || material.url || material.src, name: material.name || 'Audio' }; break;
        case 'file': new_el = { type: 'file', ...common, x: cx - 125, y: cy - 40, width: 250, height: 80, src: material.file_url || material.url || material.src, name: material.name || 'File', ext: material.extension || 'file' }; break;
        default: return;
    }

    set_elements(prev => [...prev, new_el]);
    push_state([...el_ref.current, new_el]);
    emit_element_update([new_el]);
  }, [pan_x, pan_y, zoom, set_elements, push_state, emit_element_update]);

  const handle_link_add = useCallback((url: string) => {
    const id = Math.random().toString(36).slice(2, 10);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = (vw / 2 - pan_x) / zoom;
    const cy = (vh / 2 - pan_y) / zoom;

    let new_el: BoardElement | null = null;
    const trimmed = url.trim();

    // Check for YouTube
    const yt_match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (yt_match) {
       new_el = { type: 'youtube', id, x: cx - 240, y: cy - 135, width: 480, height: 270, video_id: yt_match[1], name: 'YouTube Video', opacity: 1 };
    } 
    // Check for Sketchfab links
    else if (trimmed.includes('sketchfab.com')) {
       const sf_model_match = trimmed.match(/sketchfab\.com\/(?:3d-)?models\/[^\/?]+-([a-fA-F0-9]{32})/);
       const sf_embed_match = trimmed.match(/sketchfab\.com\/models\/([a-fA-F0-9]{32})\/embed/);
       const model_id = sf_embed_match ? sf_embed_match[1] : (sf_model_match ? sf_model_match[1] : null);
       if (model_id) {
          new_el = { type: 'embed', id, x: cx - 240, y: cy - 135, width: 480, height: 270, src: `https://sketchfab.com/models/${model_id}/embed`, name: 'Sketchfab Model', opacity: 1 };
       }
    }
    // Check for raw iframe embed codes
    else if (trimmed.toLowerCase().startsWith('<iframe') && trimmed.includes('src="')) {
       const src_match = trimmed.match(/src="([^"]+)"/);
       if (src_match) {
          new_el = { type: 'embed', id, x: cx - 240, y: cy - 135, width: 480, height: 270, src: src_match[1], name: 'Embed', opacity: 1 };
       }
    }

    if (!new_el) {
        new_el = {
            type: 'link', id, x: cx - 150, y: cy - 100, width: 300, height: 200,
            url: trimmed, title: trimmed, opacity: 1
        };
    }

    set_elements(prev => [...prev, new_el!]);
    push_state([...el_ref.current, new_el!]);
    emit_element_update([new_el!]);
  }, [pan_x, pan_y, zoom, set_elements, push_state, emit_element_update]);

  const selected_element = useMemo(() => elements.find(el => el.id === selected_ids[0]), [elements, selected_ids]);
  const active_bbox = useMemo(() => selected_element ? get_element_bbox(selected_element) : null, [selected_element]);
  
  return (
    <Box ref={container_ref} className="relative w-full h-full overflow-hidden select-none outline-none" style={{ backgroundColor: effective_bg_color }} tabIndex={0}>
        <div ref={board_container_ref} className="absolute inset-0 pointer-events-none" />
        
        <BoardParticipants 
          participants={participants} 
          user={user} 
          isConnected={isConnected} 
          following_user_id={following_user_id} 
          onFollow={setFollowingUserId} 
        />

        <svg className="absolute inset-0 w-full h-full touch-none" 
            style={{ 
              pointerEvents: (editing_text_id || (is_panning_state && !is_panning)) ? 'none' : 'auto', 
              cursor: is_panning ? 'grabbing' : tool === 'hand' ? 'grab' : tool === 'eraser' ? (is_dark ? ERASER_CURSOR_WHITE : ERASER_CURSOR_BLACK) : 'crosshair' 
            }}
            onMouseDown={(e) => { handle_mouse_down(e); pan_mouse_down(e); }}
            onMouseMove={handle_mouse_move}
            onMouseUp={handle_mouse_up}
            onMouseLeave={handle_mouse_up}>
          
          {/* 1. Static infinite background (not affected by main group's translate) */}
          <BoardBackground zoom={zoom} pan_x={pan_x} pan_y={pan_y} grid_type={grid_type} grid_color={grid_color} />

          <g transform={`translate(${pan_x}, ${pan_y}) scale(${zoom})`}>
           <CanvasRenderer elements={elements} pan_x={0} pan_y={0} zoom={1} tool={tool}
                          selected_ids={selected_ids} editing_text_id={editing_text_id} interactive_media_id={interactive_media_id}
                          on_element_pointer_down={handle_element_pointer_down} on_element_double_click={handle_element_double_click}
                          on_resize_start={handle_resize_start} on_rotate_start={handle_rotate_start} 
                          is_dark={is_dark} eraser_trail={eraser_trail} />
          
          {draft && <CanvasRenderer elements={[draft]} pan_x={0} pan_y={0} zoom={1} tool={tool} selected_ids={[]} editing_text_id={null} interactive_media_id={null} on_element_pointer_down={()=>{}} on_element_double_click={()=>{}} on_resize_start={()=>{}} on_rotate_start={()=>{}} is_dark={is_dark} />}
          
          {active_path && <path d={active_path} fill="none" stroke={color} strokeWidth={tool === 'highlighter' ? 12 : stroke_width} strokeLinecap="round" strokeLinejoin="round" opacity={tool === 'highlighter' ? 0.35 : 1} />}
          
          {marquee && <rect x={marquee.x} y={marquee.y} width={marquee.w} height={marquee.h} fill="rgba(66, 133, 244, 0.1)" stroke="#4285f4" strokeWidth={1 / zoom} strokeDasharray={`${4 / zoom}, ${4 / zoom}`} />}
          
          {eraser_trail.length > 1 && (
              <polyline 
                  points={eraser_trail.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none" 
                  stroke={is_dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} 
                  strokeWidth={20} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ pointerEvents: 'none' }}
              />
          )}

          <BoardCursors cursors={cursors} />
         </g>
        </svg>

        {is_panning_state && !is_panning && (
            <div className="absolute inset-0 z-10 touch-none" style={{ cursor: 'grab' }}
                 onMouseDown={pan_mouse_down} />
        )}

        <Box className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] transition-all">
          <CanvasToolbar 
            tool={tool} on_tool_change={set_tool}
            color={color} on_color_change={set_color}
            stroke_width={stroke_width} on_width_change={set_stroke_width}
            stroke_style={stroke_style} on_style_change={set_stroke_style}
            can_undo={can_undo} can_redo={can_redo}
            on_undo={undo} on_redo={redo} on_delete={handle_delete}
            on_open_library={() => { set_picker_type('photo'); set_is_materials_opened(true); }}
            on_upload_device={() => file_input_ref.current?.click()}
            on_add_link={() => set_is_link_modal_opened(true)}
            on_open_settings={() => set_is_settings_opened(true)}
            on_exit={handle_exit}
            is_student={user?.role === 'student'}
          />
          <input 
              type="file" 
              ref={file_input_ref} 
              style={{ display: 'none' }} 
              onChange={handle_device_upload_change} 
          />
        </Box>

        {selected_ids.length === 1 && selected_element && active_bbox && tool === 'select' && (
            <>
                {['rect','ellipse','line','path','arrow','diamond','triangle'].includes(selected_element.type) && (
                    <ShapeFormatToolbar 
                        element={selected_element} 
                        screen_x={active_bbox.x * zoom + pan_x}
                        screen_y={active_bbox.y * zoom + pan_y}
                        element_h={active_bbox.h * zoom}
                        on_update={update_selected}
                        on_delete={handle_delete}
                    />
                )}
                {selected_element.type === 'text' && !editing_text_id && (
                    <TextFormatToolbar 
                        element={selected_element as TextElement} 
                        screen_x={active_bbox.x * zoom + pan_x}
                        screen_y={active_bbox.y * zoom + pan_y}
                        element_h={active_bbox.h * zoom}
                        on_update={update_selected} 
                        on_delete={handle_delete}
                        is_dark={is_dark}
                    />
                )}
            </>
        )}

        {editing_text_id && elements.find(el => el.id === editing_text_id) && (
            <EditableText 
              element={elements.find(el => el.id === editing_text_id) as TextElement}
              zoom={zoom} pan_x={pan_x} pan_y={pan_y}
              suppress_blur={inline_link_ref}
              is_dark={is_dark}
              on_save={(content, w, h) => { update_element_by_id(editing_text_id, { content, width: w, height: h }); set_selected_ids(prev => prev.length ? prev : [editing_text_id]); set_editing_text_id(null); }}
              on_cancel={() => { set_editing_text_id(null); }}
              innerRef={text_edit_ref}
            />
        )}

        <InlineTextToolbar 
          textRef={text_edit_ref} 
          onLinkModalOpen={set_is_inline_link_open} 
          is_dark={is_dark}
        />

        <MaterialsPickerModal 
            opened={is_materials_opened} 
            onClose={() => set_is_materials_opened(false)} 
            initialType={picker_type}
            onSelect={handle_material_select}
        />

        <BoardLinkModal 
            opened={is_link_modal_opened} 
            onClose={() => set_is_link_modal_opened(false)} 
            onAdd={handle_link_add}
        />

        <BoardSettingsModal 
            opened={is_settings_opened} onClose={() => set_is_settings_opened(false)}
            bgColor={bg_color} onBgColorChange={(v) => handle_settings_update('bg_color', v)}
            gridType={grid_type} onGridTypeChange={(v) => handle_settings_update('grid_type', v)}
            boardTheme={board_theme} onBoardThemeChange={(v) => handle_settings_update('board_theme', v)}
        />
    </Box>
  );
}
