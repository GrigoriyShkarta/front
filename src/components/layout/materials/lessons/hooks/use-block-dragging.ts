'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const SCROLL_THRESHOLD = 150;
const MIN_SPEED = 8;
const MAX_SPEED = 50;
const INTERVAL_MS = 16;

/**
 * Hook to manage block dragging state and handle smooth auto-scrolling.
 * Triggers scroll when the cursor is within SCROLL_THRESHOLD px of the viewport edge.
 */
export function useBlockDragging() {
  const [is_dragging_block, set_is_dragging_block] = useState(false);
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollDirection = useRef<'up' | 'down' | null>(null);
  const lastClientY = useRef<number>(0);

  const stopScrolling = useCallback(() => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
    scrollDirection.current = null;
  }, []);

  const startScrolling = useCallback((direction: 'up' | 'down') => {
    scrollDirection.current = direction;
    if (scrollInterval.current) return;

    scrollInterval.current = setInterval(() => {
      const dir = scrollDirection.current;
      if (!dir) return;

      let intensity = 0;
      if (dir === 'up') {
        intensity = (SCROLL_THRESHOLD - lastClientY.current) / SCROLL_THRESHOLD;
      } else {
        intensity = (lastClientY.current - (window.innerHeight - SCROLL_THRESHOLD)) / SCROLL_THRESHOLD;
      }

      const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * Math.pow(Math.max(0, Math.min(1, intensity)), 1.5);
      const amount = dir === 'up' ? -speed : speed;

      window.scrollBy({ top: amount, behavior: 'instant' as ScrollBehavior });
    }, INTERVAL_MS);
  }, []);

  useEffect(() => {
    if (!is_dragging_block) {
      stopScrolling();
      return;
    }

    const handleDragOver = (e: DragEvent) => {
      const { clientY } = e;
      lastClientY.current = clientY;

      if (clientY < SCROLL_THRESHOLD) {
        startScrolling('up');
      } else if (window.innerHeight - clientY < SCROLL_THRESHOLD) {
        startScrolling('down');
      } else {
        stopScrolling();
      }
    };

    const handleDragEnd = () => {
      set_is_dragging_block(false);
      stopScrolling();
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('drop', handleDragEnd);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('drop', handleDragEnd);
      stopScrolling();
    };
  }, [is_dragging_block, startScrolling, stopScrolling]);

  return { is_dragging_block, set_is_dragging_block };
}
