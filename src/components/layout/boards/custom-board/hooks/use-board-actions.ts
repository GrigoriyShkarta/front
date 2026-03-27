'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { BoardElement, ToolType, StrokeStyle, TextElement, PathElement, RectElement, EllipseElement, LineElement, ArrowElement, DiamondElement, TriangleElement, BBox } from '../types';
import { get_element_bbox, is_point_in_bbox } from '../utils';

interface BoardActionsProps {
  el_ref: React.MutableRefObject<BoardElement[]>;
  set_elements: (els: BoardElement[] | ((prev: BoardElement[]) => BoardElement[])) => void;
  tool: ToolType;
  color: string;
  stroke_width: number;
  stroke_style: StrokeStyle;
  pan_x: number;
  pan_y: number;
  zoom: number;
  push_state: (els: BoardElement[]) => void;
  emit_element_update: (els: BoardElement[]) => void;
  emit_element_delete: (ids: string[]) => void;
  emit_cursor: (data: any) => void;
  is_dark: boolean;
  set_tool: (tool: ToolType) => void;
}

const gen_id = () => Math.random().toString(36).slice(2, 10);

export function useBoardActions({
  el_ref, set_elements, tool, color, stroke_width, stroke_style, pan_x, pan_y, zoom,
  push_state, emit_element_update, emit_element_delete, emit_cursor, is_dark, set_tool
}: BoardActionsProps) {
  
  const [selected_ids, set_selected_ids] = useState<string[]>([]);
  const [editing_text_id, set_editing_text_id] = useState<string | null>(null);
  const [interactive_media_id, set_interactive_media_id] = useState<string | null>(null);
  const [draft, set_draft] = useState<BoardElement | null>(null);
  const [active_path, set_active_path] = useState<string | null>(null);
  const [eraser_trail, set_eraser_trail] = useState<{ x: number, y: number }[]>([]);
  const [marquee, set_marquee] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [text_toolbar_pos, set_text_toolbar_pos] = useState<{ x: number, y: number } | null>(null);
  const text_edit_ref = useRef<HTMLDivElement | null>(null);

  // Transient interaction state
  const interaction = useRef<{
    is_dragging: boolean;
    is_resizing: boolean;
    is_rotating: boolean;
    start_mouse: { x: number, y: number };
    start_elements: BoardElement[];
    resize_anchor: string | null;
    resize_id: string | null;
    rotate_id: string | null;
    last_emit: number;
  }>({
    is_dragging: false,
    is_resizing: false,
    is_rotating: false,
    start_mouse: { x: 0, y: 0 },
    start_elements: [],
    resize_anchor: null,
    resize_id: null,
    rotate_id: null,
    last_emit: 0
  });

  const get_board_coords = (e: React.MouseEvent) => {
    // Use the main board's bounding rect instead of whatever child element triggered this
    const svg = (e.currentTarget as Element)?.closest('svg') || document.querySelector('svg.touch-none');
    const rect = svg ? svg.getBoundingClientRect() : { left: 0, top: 0 };
    return {
      x: (e.clientX - rect.left - pan_x) / zoom,
      y: (e.clientY - rect.top - pan_y) / zoom
    };
  };

  const handle_mouse_down = (e: React.MouseEvent) => {
    if (editing_text_id) {
       // Ignore drawing/selection interactions while actively editing text
       return;
    }
    if (e.button !== 0 || e.altKey || tool === 'hand') return;

    // Any mousedown on the canvas or board elements (that aren't swallows by iframes) deactivate media edit mode
    if (interactive_media_id) set_interactive_media_id(null);

    const coords = get_board_coords(e);
    interaction.current.start_mouse = coords;

    if (tool === 'select') {
      const clicked = el_ref.current.slice().reverse().find(el => {
        const bbox = get_element_bbox(el);
        return bbox && is_point_in_bbox(coords.x, coords.y, bbox);
      });

      if (clicked) {
        if (!e.shiftKey && !selected_ids.includes(clicked.id)) {
            set_selected_ids([clicked.id]);
        } else if (e.shiftKey) {
            set_selected_ids(prev => prev.includes(clicked.id) ? prev.filter(id => id !== clicked.id) : [...prev, clicked.id]);
        }
        interaction.current.is_dragging = true;
        interaction.current.start_elements = [...el_ref.current];
      } else {
        set_selected_ids([]);
        set_marquee({ x: coords.x, y: coords.y, w: 0, h: 0 });
      }
    } else if (tool === 'pen' || tool === 'highlighter') {
        set_active_path(`M ${coords.x} ${coords.y}`);
    } else if (tool === 'eraser') {
        const to_delete = el_ref.current.filter(el => {
            const bbox = get_element_bbox(el);
            return bbox && is_point_in_bbox(coords.x, coords.y, bbox);
        }).map(el => el.id);
        if (to_delete.length > 0) {
            handle_delete(to_delete);
        }
        interaction.current.is_dragging = true; // Start continuous erasing
        set_eraser_trail([{ x: coords.x, y: coords.y }]);
    } else {
        // Shapes
        let new_el: BoardElement;
        const id = gen_id();
        switch (tool) {
            case 'rect': new_el = { type: 'rect', id, x: coords.x, y: coords.y, width: 0, height: 0, color, fill: 'none', stroke_width, stroke_style, opacity: 1 }; break;
            case 'ellipse': new_el = { type: 'ellipse', id, cx: coords.x, cy: coords.y, rx: 0, ry: 0, color, fill: 'none', stroke_width, stroke_style, opacity: 1 }; break;
            case 'line': new_el = { type: 'line', id, x1: coords.x, y1: coords.y, x2: coords.x, y2: coords.y, color, stroke_width, stroke_style, opacity: 1 }; break;
            case 'arrow': new_el = { type: 'arrow', id, x1: coords.x, y1: coords.y, x2: coords.x, y2: coords.y, color, stroke_width, stroke_style, opacity: 1 }; break;
            case 'diamond': new_el = { type: 'diamond', id, x: coords.x, y: coords.y, width: 0, height: 0, color, fill: 'none', stroke_width, stroke_style, opacity: 1 }; break;
            case 'triangle': new_el = { type: 'triangle', id, x: coords.x, y: coords.y, width: 0, height: 0, color, fill: 'none', stroke_width, stroke_style, opacity: 1 }; break;
            case 'text':
                new_el = { type: 'text', id, x: coords.x, y: coords.y, content: '', color: is_dark ? '#fff' : '#000', font_size: 20, font_weight: 'normal', font_style: 'normal', text_decoration: 'none', font_family: 'Inter', opacity: 1 };
                break;
            default: return;
        }
        set_draft(new_el);
    }
  };

  const handle_mouse_move = (e: React.MouseEvent) => {
    const coords = get_board_coords(e);
    const start = interaction.current.start_mouse;
    let dx = coords.x - start.x;
    let dy = coords.y - start.y;

    let target_x = coords.x;
    let target_y = coords.y;

    // Orthogonal snapping for drawing tools
    if (e.ctrlKey && (tool === 'line' || tool === 'arrow' || tool === 'pen' || tool === 'highlighter')) {
        if (Math.abs(dx) > Math.abs(dy)) {
            target_y = start.y;
            dy = 0; // Update dy to match new target_y
        } else {
            target_x = start.x;
            dx = 0; // Update dx to match new target_x
        }
    }

    // Emit cursor
    const now = Date.now();
    if (now - interaction.current.last_emit > 32) {
        emit_cursor({ x: target_x, y: target_y, draft, path: active_path, color, stroke_width });
        interaction.current.last_emit = now;
    }

    if (interaction.current.is_dragging) {
        if (tool === 'eraser') {
            const to_delete = el_ref.current.filter(el => {
                const bbox = get_element_bbox(el);
                // Use a slightly larger hitbox for continuous erasing
                return bbox && is_point_in_bbox(coords.x, coords.y, {
                    x: bbox.x - 10, y: bbox.y - 10, w: bbox.w + 20, h: bbox.h + 20
                });
            }).map(el => el.id);
            if (to_delete.length > 0) {
                handle_delete(to_delete);
            }
            set_eraser_trail(prev => [...prev.slice(-10), { x: coords.x, y: coords.y }]);
            return;
        }

        set_elements(prev => prev.map(el => {
            if (selected_ids.includes(el.id)) {
                const base = interaction.current.start_elements.find(e => e.id === el.id);
                if (!base) return el;
                switch (base.type) {
                    case 'path': {
                        return { ...base, d: base.d.replace(/([ML])\s*([-\d.]+)\s+([-\d.]+)/gi, (_, cmd, x, y) => {
                            return `${cmd} ${(parseFloat(x) + dx).toFixed(2)} ${(parseFloat(y) + dy).toFixed(2)}`;
                        }) };
                    }
                    case 'rect': case 'diamond': case 'triangle': case 'image': case 'video': case 'audio': case 'youtube': case 'embed': case 'link': case 'file': case 'text':
                        return { ...base, x: base.x + dx, y: base.y + dy };
                    case 'ellipse': return { ...base, cx: base.cx + dx, cy: base.cy + dy };
                    case 'line': case 'arrow': return { ...base, x1: base.x1 + dx, y1: base.y1 + dy, x2: base.x2 + dx, y2: base.y2 + dy };
                }
            }
            return el;
        }));
    } else if (marquee) {
        set_marquee({
            x: Math.min(start.x, coords.x),
            y: Math.min(start.y, coords.y),
            w: Math.abs(dx),
            h: Math.abs(dy)
        });
    } else if (active_path) {
        set_active_path(prev => prev + ` L ${target_x} ${target_y}`);
    } else if (draft) {
        set_draft(prev => {
            if (!prev) return null;
            switch (prev.type) {
                case 'rect': case 'diamond': case 'triangle':
                    return { ...prev, width: Math.abs(dx), height: Math.abs(dy), x: dx < 0 ? coords.x : start.x, y: dy < 0 ? coords.y : start.y };
                case 'ellipse':
                    return { ...prev, rx: Math.abs(dx) / 2, ry: Math.abs(dy) / 2, cx: start.x + dx / 2, cy: start.y + dy / 2 };
                case 'line': case 'arrow':
                    return { ...prev, x2: target_x, y2: target_y };
                default: return prev;
            }
        });
    } else if (interaction.current.is_resizing && interaction.current.resize_id) {
        set_elements(prev => prev.map(el => {
            if (el.id === interaction.current.resize_id) {
                const base = interaction.current.start_elements.find(e => e.id === el.id);
                if (!base) return el;
                
                const anchor = interaction.current.resize_anchor;
                
                let nx = (base as any).x || (base as any).cx - (base as any).rx || 0;
                let ny = (base as any).y || (base as any).cy - (base as any).ry || 0;
                let nw = (base as any).width || (base as any).rx * 2 || 0;
                let nh = (base as any).height || (base as any).ry * 2 || 0;

                let min_x = Infinity, min_y = Infinity, max_x = -Infinity, max_y = -Infinity;
                if (base.type === 'path') {
                    const matcher = base.d.match(/[-+]?[0-9]*\.?[0-9]+/g);
                    if (matcher) {
                        for (let i = 0; i < matcher.length - 1; i += 2) {
                            const px = parseFloat(matcher[i]);
                            const py = parseFloat(matcher[i+1]);
                            if (px < min_x) min_x = px;
                            if (px > max_x) max_x = px;
                            if (py < min_y) min_y = py;
                            if (py > max_y) max_y = py;
                        }
                    }
                    if (min_x !== Infinity) {
                        nx = min_x;
                        ny = min_y;
                        nw = Math.max(max_x - min_x, 1);
                        nh = Math.max(max_y - min_y, 1);
                    }
                }
                
                let start_nx = nx, start_ny = ny, start_nw = nw, start_nh = nh;

                if (anchor?.includes('n')) { ny += dy; nh -= dy; }
                if (anchor?.includes('s')) { nh += dy; }
                if (anchor?.includes('w')) { nx += dx; nw -= dx; }
                if (anchor?.includes('e')) { nw += dx; }
                
                if (nw < 10) { nx -= (10 - nw); nw = 10; }
                if (nh < 10) { ny -= (10 - nh); nh = 10; }
                if (nw < 10) nw = 10;
                if (nh < 10) nh = 10;
                
                switch (base.type) {
                    case 'rect': case 'diamond': case 'triangle': case 'image': case 'video': case 'audio': case 'youtube': case 'embed': case 'link': case 'file': case 'text':
                        return { ...base, x: nx, y: ny, width: nw, height: nh };
                    case 'ellipse':
                        return { ...base, cx: nx + nw / 2, cy: ny + nh / 2, rx: nw / 2, ry: nh / 2 };
                    case 'line': case 'arrow':
                        let nx1 = (base as any).x1, ny1 = (base as any).y1;
                        let nx2 = (base as any).x2, ny2 = (base as any).y2;
                        if (anchor === 'start') { nx1 += dx; ny1 += dy; }
                        else if (anchor === 'end') { nx2 += dx; ny2 += dy; }
                        return { ...base, x1: nx1, y1: ny1, x2: nx2, y2: ny2 };
                    case 'path': {
                        if (start_nw === 0 || start_nh === 0) return el;
                        const scaleX = nw / start_nw;
                        const scaleY = nh / start_nh;
                        
                        const newD = base.d.replace(/([ML])\s*([-\d.]+)\s+([-\d.]+)/gi, (_, cmd, x, y) => {
                            const px = parseFloat(x);
                            const py = parseFloat(y);
                            const npx = nx + (px - start_nx) * scaleX;
                            const npy = ny + (py - start_ny) * scaleY;
                            return `${cmd} ${npx.toFixed(2)} ${npy.toFixed(2)}`;
                        });
                        return { ...base, d: newD };
                    }
                    default: return el;
                }
            }
            return el;
        }));

    } else if (interaction.current.is_rotating && interaction.current.rotate_id) {
       const el = interaction.current.start_elements.find(e => e.id === interaction.current.rotate_id);
       if (el) {
           const bbox = get_element_bbox(el);
           if (bbox) {
               const cx = bbox.x + bbox.w / 2;
               const cy = bbox.y + bbox.h / 2;
               let angle = Math.atan2(coords.y - cy, coords.x - cx) * (180 / Math.PI) + 90;
               if (e.shiftKey) angle = Math.round(angle / 45) * 45;
               set_elements(prev => prev.map(e => e.id === el.id ? { ...e, angle } : e));
           }
       }
    }
  };

  const handle_mouse_up = () => {
    if (marquee) {
        const found = el_ref.current.filter(el => {
            const bbox = get_element_bbox(el);
            if (!bbox) return false;
            // Use intersection to be more forgiving/intuitive for users selecting multiple elements
            return bbox.x < marquee.x + marquee.w && bbox.x + bbox.w > marquee.x &&
                   bbox.y < marquee.y + marquee.h && bbox.y + bbox.h > marquee.y;
        }).map(el => el.id);
        set_selected_ids(found);
        set_marquee(null);
    } else if (active_path) {
        const new_el: PathElement = { type: 'path', id: gen_id(), d: active_path, color, stroke_width, stroke_style, opacity: tool === 'highlighter' ? 0.35 : 1 };
        const next = [...el_ref.current, new_el];
        set_elements(next); push_state(next); emit_element_update([new_el]);
        set_active_path(null);
    } else if (draft) {
        if (draft.type === 'text') {
            set_editing_text_id(draft.id);
        }
        const next = [...el_ref.current, draft];
        set_elements(next); push_state(next); emit_element_update([draft]);
        set_draft(null);
    } else if (interaction.current.is_dragging || interaction.current.is_resizing || interaction.current.is_rotating) {
        const moved = el_ref.current.filter(el => selected_ids.includes(el.id));
        if (moved.length > 0) {
            push_state(el_ref.current);
            emit_element_update(moved);
        }
    }

    interaction.current.is_dragging = false; 
    interaction.current.is_resizing = false; 
    interaction.current.is_rotating = false;
    interaction.current.resize_id = null; 
    interaction.current.rotate_id = null;
    set_eraser_trail([]);
    
    // Auto-reset to select tool after drawing
    if (tool !== 'select' && tool !== 'hand' && tool !== 'eraser') {
        set_tool('select');
    }
  };

  const handle_element_pointer_down = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (tool !== 'select') return;

      const coords = get_board_coords(e);
      interaction.current.start_mouse = coords;
      
      set_selected_ids(prev => {
          if (!e.shiftKey && !prev.includes(id)) return [id];
          if (e.shiftKey) return prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
          return prev;
      });
      
      interaction.current.is_dragging = true;
      interaction.current.start_elements = [...el_ref.current];
  };

  const handle_element_double_click = (e: React.MouseEvent, id: string) => {
      const el = el_ref.current.find(e => e.id === id);
      if (el?.type === 'text') {
          set_editing_text_id(id);
      } else if (['video', 'audio', 'youtube', 'embed'].includes(el?.type || '')) {
          set_interactive_media_id(prev => prev === id ? null : id);
      }
  };

  const handle_resize_start = (e: React.MouseEvent, id: string, anchor: string) => {
      e.stopPropagation();
      interaction.current.is_resizing = true;
      interaction.current.resize_id = id;
      interaction.current.resize_anchor = anchor;
      interaction.current.start_mouse = get_board_coords(e);
      interaction.current.start_elements = [...el_ref.current];
  };

  const handle_rotate_start = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      interaction.current.is_rotating = true;
      interaction.current.rotate_id = id;
      interaction.current.start_mouse = get_board_coords(e);
      interaction.current.start_elements = [...el_ref.current];
  };

  const handle_delete = useCallback((payload?: string[] | any) => {
      const ids: string[] = Array.isArray(payload) ? payload : selected_ids;
      if (ids.length === 0) return;
      set_elements(prev => prev.filter(el => !ids.includes(el.id)));
      push_state(el_ref.current.filter(el => !ids.includes(el.id)));
      emit_element_delete(ids);
      set_selected_ids([]);
  }, [selected_ids, set_elements, push_state, emit_element_delete]);

  const update_selected = (patch: any) => {
      if (selected_ids.length === 0) return;
      const updated: BoardElement[] = [];
      const new_elements = el_ref.current.map(el => {
          if (selected_ids.includes(el.id)) {
              const next = { ...el, ...patch };
              updated.push(next);
              return next;
          }
          return el;
      });
      set_elements(new_elements);
      push_state(new_elements);
      emit_element_update(updated);
  };

  const update_element_by_id = (id: string, patch: any) => {
      let updated_el: BoardElement | null = null;
      const new_elements = el_ref.current.map(el => {
          if (el.id === id) {
              const next = { ...el, ...patch };
              updated_el = next;
              return next;
          }
          return el;
      });
      
      if (updated_el) {
          set_elements(new_elements);
          push_state(new_elements);
          emit_element_update([updated_el]);
      }
  };

  // Sync text toolbar position
  useEffect(() => {
    if (editing_text_id) {
        const el = el_ref.current.find(e => e.id === editing_text_id);
        if (el) {
            const bbox = get_element_bbox(el);
            if (bbox) {
                set_text_toolbar_pos({ x: bbox.x * zoom + pan_x, y: bbox.y * zoom + pan_y });
            }
        }
    } else {
        set_text_toolbar_pos(null);
    }
  }, [editing_text_id, zoom, pan_x, pan_y]);

  return {
    selected_ids, editing_text_id, interactive_media_id, draft, active_path, marquee, eraser_trail, text_toolbar_pos, text_edit_ref,
    handle_mouse_down, handle_mouse_move, handle_mouse_up, handle_element_pointer_down, handle_element_double_click,
    handle_resize_start, handle_rotate_start, handle_delete, update_selected, update_element_by_id, set_selected_ids, set_editing_text_id
  };
}
