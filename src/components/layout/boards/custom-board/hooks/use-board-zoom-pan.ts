'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ToolType } from '../types';

export function useBoardZoomPan(tool: ToolType) {
    const [pan, set_pan_state] = useState({ x: 0, y: 0 });
    const [zoom, set_zoom_state] = useState(1);
    const [is_panning, set_is_panning] = useState(false);
    const last_mouse = useRef({ x: 0, y: 0 });

    const set_zoom = useCallback((z: number) => {
        set_zoom_state(Math.max(0.1, Math.min(10, z)));
    }, []);

    const set_pan = useCallback((p: { x: number, y: number }) => {
        set_pan_state(p);
    }, []);

    const handle_wheel = useCallback((e: WheelEvent | React.WheelEvent) => {
        // We will call this from a native listener in the component to allow preventDefault
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const new_zoom = Math.max(0.1, Math.min(10, zoom * delta));
            
            // Zoom toward cursor
            // Note: we'll get mx/my from the event relative to the container in the component
            const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect() || { left: 0, top: 0 };
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            
            const dx = (mx - pan.x) / zoom;
            const dy = (my - pan.y) / zoom;
            
            set_pan_state({
                x: mx - dx * new_zoom,
                y: my - dy * new_zoom
            });
            set_zoom_state(new_zoom);
        } else {
            // Regular scroll = Pan
            set_pan_state(prev => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    }, [zoom, pan]);

    const handle_mouse_down = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey) || (tool === 'hand' && e.button === 0)) {
            set_is_panning(true);
            last_mouse.current = { x: e.clientX, y: e.clientY };
            // Note: Prevent default to avoid middle-click scroll icon in Windows
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
        set_pan, set_zoom 
    };
}
