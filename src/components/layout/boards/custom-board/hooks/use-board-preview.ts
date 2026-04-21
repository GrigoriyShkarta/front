'use client';

import { useRef, useCallback, useEffect } from 'react';
import {
    BoardElement,
    YoutubeElement,
    ImageElement,
    VideoElement,
    AudioElement,
    FileElement,
    LinkElement,
} from '../types';
import { update_board_preview } from '../actions/board-api';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');

/** Converts relative backend URLs to absolute. */
const to_absolute_url = (src: string): string => {
    if (!src || src.startsWith('http') || src.startsWith('blob') || src.startsWith('data')) return src;
    return `${BACKEND_URL}${src.startsWith('/') ? '' : '/'}${src}`;
};

/**
 * Fetches a URL and converts it to a base64 data URL.
 * Returns null on any failure (CORS, network, etc.).
 * @param url - Absolute URL to fetch
 */
const fetch_as_base64 = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url, { mode: 'cors', cache: 'force-cache' });
        if (!response.ok) return null;
        const blob = await response.blob();
        return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

/**
 * Hook to handle board thumbnail capture and upload.
 * It captures the SVG state and sends it to the server as a JPG blob.
 *
 * Key constraint: `<foreignObject>` elements always taint the canvas (browser spec).
 * Solution: replace every foreignObject with a safe SVG-native element using element data
 * from the `elements` array. For images and YouTube — we fetch and inline as base64.
 */
export function useBoardPreview(board_id: string, elements: BoardElement[], is_dark: boolean) {
    const board_container_ref = useRef<HTMLDivElement | null>(null);
    const last_capture_ref = useRef<number>(0);

    const capture_preview = useCallback(async () => {
        if (!board_id || elements.length === 0) {
            console.log('[Preview] Skipped: no board_id or no elements');
            return;
        }

        // Rate limit: at most once per 30 seconds
        const now = Date.now();
        if (now - last_capture_ref.current < 30000) {
            console.log('[Preview] Skipped: rate limit (30s cooldown)');
            return;
        }

        console.log('[Preview] Starting capture...');

        try {
            const svg = board_container_ref.current?.parentElement?.querySelector('svg');
            if (!svg) {
                console.warn('[Preview] SVG element not found');
                return;
            }

            const SVG_NS = 'http://www.w3.org/2000/svg';
            const serializer = new XMLSerializer();
            const svg_clone = svg.cloneNode(true) as SVGSVGElement;

            // Step 1: Remove interactive / UI-only overlay elements
            svg_clone
                .querySelectorAll('.board-cursor, .selection-handle, .loading-placeholder')
                .forEach(el => el.remove());

            // Step 2: Build a lookup map: element id → BoardElement data
            // We need element data (type, src, video_id, etc.) to create rich placeholders.
            // The foreignObject in the DOM does not store this data — we use the `elements` array.
            const el_map = new Map<string, BoardElement>();
            elements.forEach(el => el_map.set(el.id, el));

            // Step 3: Find all <g> wrappers that contain foreignObject and build SVG replacements.
            // foreignObject in canvas-drawn SVG ALWAYS taints the canvas (HTML spec §4.12.5.1.12).
            const foreign_objects = Array.from(svg_clone.querySelectorAll('foreignObject'));
            console.log(`[Preview] Processing ${foreign_objects.length} foreignObject(s)...`);

            // Pre-fetch images in parallel before DOM manipulation
            const fetch_tasks = foreign_objects.map(async (fo) => {
                const x = parseFloat(fo.getAttribute('x') || '0');
                const y = parseFloat(fo.getAttribute('y') || '0');
                const w = parseFloat(fo.getAttribute('width') || '200');
                const h = parseFloat(fo.getAttribute('height') || '120');
                const opacity = fo.getAttribute('opacity') || '1';

                // Find corresponding element by matching position (foreignObject has no id attr directly)
                // The parent <g> may have a key, or we match by position
                let matched_el: BoardElement | undefined;
                for (const el of elements) {
                    if ('x' in el && 'y' in el) {
                        const ex = (el as any).x ?? 0;
                        const ey = (el as any).y ?? 0;
                        if (Math.abs(ex - x) < 2 && Math.abs(ey - y) < 2) {
                            matched_el = el;
                            break;
                        }
                    }
                }

                let image_base64: string | null = null;
                let label = '◻ Element';
                let color = '#6c757d';
                let sub_label = '';

                if (matched_el) {
                    switch (matched_el.type) {
                        case 'image': {
                            const img_el = matched_el as ImageElement;
                            label = '🖼 Image';
                            color = '#06b6d4';
                            sub_label = img_el.name;
                            image_base64 = await fetch_as_base64(to_absolute_url(img_el.src));
                            break;
                        }
                        case 'youtube': {
                            const yt = matched_el as YoutubeElement;
                            label = '▶ YouTube';
                            color = '#ff0000';
                            sub_label = yt.name || yt.video_id;
                            // YouTube thumbnails are public and CORS-friendly
                            image_base64 = await fetch_as_base64(
                                `https://img.youtube.com/vi/${yt.video_id}/mqdefault.jpg`
                            );
                            break;
                        }
                        case 'link': {
                            const lk = matched_el as LinkElement;
                            label = '🔗 Link';
                            color = '#f59e0b';
                            sub_label = lk.title;
                            if (lk.image) {
                                image_base64 = await fetch_as_base64(lk.image);
                            }
                            break;
                        }
                        case 'video': {
                            const v = matched_el as VideoElement;
                            label = '▶ Video';
                            color = '#3b82f6';
                            sub_label = v.name;
                            break;
                        }
                        case 'audio': {
                            const a = matched_el as AudioElement;
                            label = '♪ Audio';
                            color = '#8b5cf6';
                            sub_label = a.name;
                            break;
                        }
                        case 'file': {
                            const f = matched_el as FileElement;
                            label = `📄 ${f.ext?.toUpperCase() || 'File'}`;
                            color = '#10b981';
                            sub_label = f.name;
                            break;
                        }
                        case 'text': {
                            label = '✎ Text';
                            color = '#64748b';
                            break;
                        }
                        case 'embed': {
                            label = '⧉ Embed';
                            color = '#6366f1';
                            break;
                        }
                    }
                } else {
                    // Fallback: detect from innerHTML
                    const inner = fo.innerHTML.toLowerCase();
                    if (inner.includes('youtube.com/embed')) { label = '▶ YouTube'; color = '#ff0000'; }
                    else if (inner.includes('<iframe')) { label = '⧉ Embed'; color = '#6366f1'; }
                    else if (inner.includes('audio')) { label = '♪ Audio'; color = '#8b5cf6'; }
                    else if (inner.includes('board-text-content')) { label = '✎ Text'; color = '#64748b'; }
                    else if (inner.includes('<img')) { label = '🖼 Image'; color = '#06b6d4'; }
                }

                return { fo, x, y, w, h, opacity, image_base64, label, color, sub_label };
            });

            const resolved = await Promise.all(fetch_tasks);

            // Step 4: Replace foreignObjects with SVG elements (now that we have all base64 data)
            resolved.forEach(({ fo, x, y, w, h, opacity, image_base64, label, color, sub_label }) => {
                const g = document.createElementNS(SVG_NS, 'g');
                g.setAttribute('opacity', opacity);

                if (image_base64) {
                    // Rich placeholder: background rect + the actual image
                    const bg = document.createElementNS(SVG_NS, 'rect');
                    bg.setAttribute('x', String(x));
                    bg.setAttribute('y', String(y));
                    bg.setAttribute('width', String(w));
                    bg.setAttribute('height', String(h));
                    bg.setAttribute('rx', '10');
                    bg.setAttribute('fill', '#000');
                    g.appendChild(bg);

                    const img_node = document.createElementNS(SVG_NS, 'image');
                    img_node.setAttribute('x', String(x));
                    img_node.setAttribute('y', String(y));
                    img_node.setAttribute('width', String(w));
                    img_node.setAttribute('height', String(h));
                    img_node.setAttribute('href', image_base64);
                    img_node.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                    // Clip to rounded rect
                    const clip_id = `clip_prev_${Math.random().toString(36).slice(2)}`;
                    const clip = document.createElementNS(SVG_NS, 'clipPath');
                    clip.setAttribute('id', clip_id);
                    const clip_rect = document.createElementNS(SVG_NS, 'rect');
                    clip_rect.setAttribute('x', String(x));
                    clip_rect.setAttribute('y', String(y));
                    clip_rect.setAttribute('width', String(w));
                    clip_rect.setAttribute('height', String(h));
                    clip_rect.setAttribute('rx', '10');
                    clip.appendChild(clip_rect);
                    svg_clone.querySelector('defs')?.appendChild(clip) ??
                        (() => {
                            const defs = document.createElementNS(SVG_NS, 'defs');
                            defs.appendChild(clip);
                            svg_clone.insertBefore(defs, svg_clone.firstChild);
                        })();
                    img_node.setAttribute('clip-path', `url(#${clip_id})`);
                    g.appendChild(img_node);

                    // Label badge overlay at bottom
                    if (label || sub_label) {
                        const badge_h = 22;
                        const badge = document.createElementNS(SVG_NS, 'rect');
                        badge.setAttribute('x', String(x));
                        badge.setAttribute('y', String(y + h - badge_h));
                        badge.setAttribute('width', String(w));
                        badge.setAttribute('height', String(badge_h));
                        badge.setAttribute('fill', 'rgba(0,0,0,0.55)');
                        g.appendChild(badge);

                        const badge_text = document.createElementNS(SVG_NS, 'text');
                        badge_text.setAttribute('x', String(x + 8));
                        badge_text.setAttribute('y', String(y + h - 6));
                        badge_text.setAttribute('font-size', '11');
                        badge_text.setAttribute('font-family', 'sans-serif');
                        badge_text.setAttribute('fill', 'rgba(255,255,255,0.9)');
                        badge_text.textContent = sub_label ? `${label}  ${sub_label}` : label;
                        g.appendChild(badge_text);
                    }
                } else {
                    // Minimal placeholder: colored rect + icon + label
                    const rect = document.createElementNS(SVG_NS, 'rect');
                    rect.setAttribute('x', String(x));
                    rect.setAttribute('y', String(y));
                    rect.setAttribute('width', String(w));
                    rect.setAttribute('height', String(h));
                    rect.setAttribute('rx', '10');
                    rect.setAttribute('fill', is_dark ? '#1e1e2d' : '#f0f0f5');
                    rect.setAttribute('stroke', color);
                    rect.setAttribute('stroke-width', '2');
                    g.appendChild(rect);

                    const cx = x + w / 2;
                    const circle = document.createElementNS(SVG_NS, 'circle');
                    circle.setAttribute('cx', String(cx));
                    circle.setAttribute('cy', String(y + h / 2 - 14));
                    circle.setAttribute('r', '20');
                    circle.setAttribute('fill', color);
                    circle.setAttribute('opacity', '0.15');
                    g.appendChild(circle);

                    const text = document.createElementNS(SVG_NS, 'text');
                    text.setAttribute('x', String(cx));
                    text.setAttribute('y', String(y + h / 2 + 10));
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('font-size', '13');
                    text.setAttribute('font-family', 'sans-serif');
                    text.setAttribute('fill', is_dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)');
                    text.textContent = label;
                    g.appendChild(text);

                    if (sub_label) {
                        const sub = document.createElementNS(SVG_NS, 'text');
                        sub.setAttribute('x', String(cx));
                        sub.setAttribute('y', String(y + h / 2 + 27));
                        sub.setAttribute('text-anchor', 'middle');
                        sub.setAttribute('font-size', '10');
                        sub.setAttribute('font-family', 'sans-serif');
                        sub.setAttribute('fill', is_dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)');
                        // Truncate long filenames
                        sub.textContent = sub_label.length > 28 ? sub_label.slice(0, 26) + '…' : sub_label;
                        g.appendChild(sub);
                    }
                }

                fo.parentNode?.replaceChild(g, fo);
            });

            console.log('[Preview] All foreignObjects replaced, compositing canvas...');

            // Step 5: Compute bounding box from elements array
            const padding = 20;
            const bboxes = elements.map(el => {
                if ('x' in el && 'y' in el && 'width' in el && 'height' in el) {
                    return { x: el.x, y: el.y, mx: el.x + el.width, my: el.y + el.height };
                }
                return { x: 0, y: 0, mx: 100, my: 100 };
            });
            const min_x  = Math.min(...bboxes.map(b => b.x)) - padding;
            const min_y  = Math.min(...bboxes.map(b => b.y)) - padding;
            const max_x  = Math.max(...bboxes.map(b => b.mx)) + padding;
            const max_y  = Math.max(...bboxes.map(b => b.my)) + padding;
            const width  = Math.max(800, max_x - min_x);
            const height = Math.max(600, max_y - min_y);

            svg_clone.setAttribute('width', String(width));
            svg_clone.setAttribute('height', String(height));
            svg_clone.setAttribute('viewBox', `${min_x} ${min_y} ${width} ${height}`);

            // Step 6: Serialize → ObjectURL → Image → Canvas (no foreignObject = no taint)
            const svg_data = serializer.serializeToString(svg_clone);
            const svg_blob = new Blob([svg_data], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svg_blob);

            const img = new Image();
            img.src = url;
            await new Promise<void>((resolve, reject) => {
                img.onload  = () => resolve();
                img.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            canvas.width  = 600;
            canvas.height = Math.round(600 / (width / height));

            const ctx = canvas.getContext('2d');
            if (!ctx) { URL.revokeObjectURL(url); return; }

            ctx.fillStyle = is_dark ? '#12121e' : '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);

            console.log('[Preview] Rendering to canvas and uploading...');

            // Wait for blob conversion and upload to finish
            await new Promise<void>((resolve) => {
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        try {
                            await update_board_preview(board_id, blob);
                            last_capture_ref.current = Date.now();
                            console.log('[Preview] Preview uploaded successfully ✓');
                        } catch (err) {
                            console.error('[Preview] Upload failed:', err);
                        }
                    } else {
                        console.warn('[Preview] canvas.toBlob returned null');
                    }
                    resolve();
                }, 'image/jpeg', 0.85);
            });

        } catch (error) {
            console.error('[Preview] Capture failed:', error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board_id, elements, is_dark]);

    // Schedule capture 15s after elements change (debounced via dependency)
    useEffect(() => {
        if (elements.length > 0) {
            console.log('[Preview] Activity detected. Scheduling capture in 15 seconds...');
        }
        const timer = setTimeout(capture_preview, 15000);
        return () => clearTimeout(timer);
    }, [capture_preview, elements.length]);

    // Last-ditch capture on unmount
    useEffect(() => {
        return () => {
            if (elements.length > 0) capture_preview();
        };
    }, [capture_preview, elements.length]);

    return { board_container_ref, capture_preview };
}
