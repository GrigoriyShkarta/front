'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ToolType } from '../types';

export function useBoardZoomPan(tool: ToolType) {
    const [pan, set_pan_state] = useState({ x: 0, y: 0 });
    const [zoom, set_zoom_state] = useState(1);
    const [is_panning, set_is_panning] = useState(false);
    
    // Refs for stable handle_wheel
    const zoom_ref = useRef(1);
    const pan_ref = useRef({ x: 0, y: 0 });
    const last_mouse = useRef({ x: 0, y: 0 });

    const last_touch_dist = useRef(0);
    const last_touch_center = useRef({ x: 0, y: 0 });

    const set_zoom = useCallback((z: number) => {
        const next_zoom = Math.max(0.1, Math.min(10, z));
        set_zoom_state(next_zoom);
        zoom_ref.current = next_zoom;
    }, []);

    const set_pan = useCallback((p: { x: number, y: number }) => {
        set_pan_state(p);
        pan_ref.current = p;
    }, []);

    const handle_wheel = useCallback((e: WheelEvent | React.WheelEvent) => {
        e.preventDefault(); 
        
        const current_zoom = zoom_ref.current;
        const current_pan = pan_ref.current;

        if (e.ctrlKey || e.metaKey) {
            const delta = Math.exp(-e.deltaY / 100);
            const new_zoom = Math.max(0.1, Math.min(10, current_zoom * delta));
            
            const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect() || { left: 0, top: 0 };
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            
            const dx = (mx - current_pan.x) / current_zoom;
            const dy = (my - current_pan.y) / current_zoom;
            
            const next_pan = {
                x: mx - dx * new_zoom,
                y: my - dy * new_zoom
            };

            set_pan(next_pan);
            set_zoom(new_zoom);
        } else {
            set_pan({
                x: current_pan.x - e.deltaX,
                y: current_pan.y - e.deltaY
            });
        }
    }, [set_pan, set_zoom]);

    const handle_touch_start = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 1 && tool === 'hand') {
            set_is_panning(true);
            last_mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            set_is_panning(true);
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            last_touch_dist.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            last_touch_center.current = {
                x: (t1.clientX + t2.clientX) / 2,
                y: (t1.clientY + t2.clientY) / 2
            };
            last_mouse.current = last_touch_center.current;
        }
    }, [tool]);

    const handle_touch_move = useCallback((e: React.TouchEvent) => {
        if (!is_panning) return;

        if (e.touches.length === 1 && tool === 'hand') {
            const t = e.touches[0];
            const dx = t.clientX - last_mouse.current.x;
            const dy = t.clientY - last_mouse.current.y;
            set_pan({ x: pan_ref.current.x + dx, y: pan_ref.current.y + dy });
            last_mouse.current = { x: t.clientX, y: t.clientY };
        } else if (e.touches.length === 2) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            const center = {
                x: (t1.clientX + t2.clientX) / 2,
                y: (t1.clientY + t2.clientY) / 2
            };

            const current_zoom = zoom_ref.current;
            const current_pan = pan_ref.current;

            // Zoom
            const zoom_factor = dist / last_touch_dist.current;
            const new_zoom = Math.max(0.1, Math.min(10, current_zoom * zoom_factor));

            // Pan based on center movement
            const dx = center.x - last_mouse.current.x;
            const dy = center.y - last_mouse.current.y;

            // Adjust pan for zoom toward center
            const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect() || { left: 0, top: 0 };
            const mx = center.x - rect.left;
            const my = center.y - rect.top;
            
            const world_x = (mx - current_pan.x) / current_zoom;
            const world_y = (my - current_pan.y) / current_zoom;

            set_pan({
                x: mx - world_x * new_zoom + dx,
                y: my - world_y * new_zoom + dy
            });
            set_zoom(new_zoom);

            last_touch_dist.current = dist;
            last_touch_center.current = center;
            last_mouse.current = center;
        }
    }, [is_panning, tool, set_pan, set_zoom]);

    const handle_touch_end = useCallback(() => {
        set_is_panning(false);
        last_touch_dist.current = 0;
    }, []);

    const handle_mouse_down = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey) || (tool === 'hand' && e.button === 0)) {
            set_is_panning(true);
            last_mouse.current = { x: e.clientX, y: e.clientY };
            if (e.button === 1) e.preventDefault();
        }
    }, [tool]);

    useEffect(() => {
        if (!is_panning) return;

        const onMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - last_mouse.current.x;
            const dy = e.clientY - last_mouse.current.y;
            set_pan_state(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            last_mouse.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseUp = () => {
            set_is_panning(false);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [is_panning]);

    return { 
        pan_x: pan.x, pan_y: pan.y, zoom, is_panning, 
        handle_wheel, handle_mouse_down, 
        handle_touch_start, handle_touch_move, handle_touch_end,
        set_pan, set_zoom 
    };
}
