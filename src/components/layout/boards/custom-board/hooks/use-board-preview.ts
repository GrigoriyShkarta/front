'use client';

import { useRef, useCallback, useEffect } from 'react';
import { BoardElement } from '../types';
import { update_board_preview } from '../actions/board-api';

/**
 * Hook to handle board thumbnail capture and upload.
 * It captures the SVG state and sends it to the server as a JPG blob.
 */
export function useBoardPreview(board_id: string, elements: BoardElement[], is_dark: boolean) {
    const board_container_ref = useRef<HTMLDivElement | null>(null);
    const last_capture_ref = useRef<number>(0);

    const capture_preview = useCallback(async () => {
        if (!board_id || elements.length === 0) return;
        
        // Rate limit: 1 capture every 30 seconds to avoid spamming the server
        const now = Date.now();
        if (now - last_capture_ref.current < 30000) return;
        
        try {
            console.log(`[Preview] Starting capture for board ${board_id}...`);
            // Find the SVG element within the container
            const svg = board_container_ref.current?.parentElement?.querySelector('svg');
            if (!svg) {
                console.warn('[Preview] SVG element not found, skipping capture.');
                return;
            }

            // 1. Prepare SVG for serialization
            const serializer = new XMLSerializer();
            // Clone the SVG to avoid modifying the live DOM
            const svg_clone = svg.cloneNode(true) as SVGSVGElement;
            
            // Ensure dimensions for capture
            const padding = 20;
            const bboxes = elements.map(el => {
                // Simplified bbox calculation for preview
                if ('x' in el && 'y' in el && 'width' in el && 'height' in el) return { x: el.x, y: el.y, mx: el.x + el.width, my: el.y + el.height };
                return { x: 0, y: 0, mx: 100, my: 100 }; // Fallback
            });
            
            const min_x = Math.min(...bboxes.map(b => b.x)) - padding;
            const min_y = Math.min(...bboxes.map(b => b.y)) - padding;
            const max_x = Math.max(...bboxes.map(b => b.mx)) + padding;
            const max_y = Math.max(...bboxes.map(b => b.my)) + padding;
            const width = Math.max(800, max_x - min_x);
            const height = Math.max(600, max_y - min_y);

            svg_clone.setAttribute('width', width.toString());
            svg_clone.setAttribute('height', height.toString());
            // Set viewbox to only cover the elements area
            svg_clone.setAttribute('viewBox', `${min_x} ${min_y} ${width} ${height}`);
            
            // Remove interactive parts like cursors for the preview
            svg_clone.querySelectorAll('.board-cursor, .selection-handle').forEach(el => el.remove());

            const svg_data = serializer.serializeToString(svg_clone);
            const svg_blob = new Blob([svg_data], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svg_blob);

            // 2. Draw to Canvas
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            // We want a standard preview size
            const aspect = width / height;
            canvas.width = 600;
            canvas.height = 600 / aspect;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Fill background (white/dark based on theme)
            ctx.fillStyle = is_dark ? '#12121e' : '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // 3. Convert to Blob and Upload
            canvas.toBlob(async (blob) => {
                if (blob) {
                    console.log(`[Preview] Uploading blob (size: ${Math.round(blob.size / 1024)}KB) to server...`);
                    await update_board_preview(board_id, blob);
                    console.log(`[Preview] Successfully updated preview for board ${board_id}.`);
                    last_capture_ref.current = Date.now();
                }
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.8);

        } catch (error) {
            console.error('[Preview] Failed to capture board preview:', error);
        }
    }, [board_id, elements]);

    // Cleanup capture (on unmount/activity)
    useEffect(() => {
        // Capture 15s after drawing starts or elements change
        if (elements.length > 0) {
            console.log(`[Preview] Activity detected. Scheduling capture in 15 seconds...`);
        }
        const timer = setTimeout(capture_preview, 15000);
        return () => {
            clearTimeout(timer);
        };
    }, [capture_preview, elements.length]);

    // Handle "capture on leave" via visibility change or manual call
    useEffect(() => {
        return () => {
            // This is a last-ditch effort on unmount
            if (elements.length > 0) {
                capture_preview();
            }
        };
    }, [capture_preview, elements.length]);

    return { board_container_ref, capture_preview };
}
