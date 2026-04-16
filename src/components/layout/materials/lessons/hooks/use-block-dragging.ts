'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to manage block dragging state and handle smooth auto-scrolling.
 * Uses a dynamic speed based on how close the cursor is to the viewport edges.
 */
export function useBlockDragging() {
  const [is_dragging_block, set_is_dragging_block] = useState(false);
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);
  const scrollDirection = useRef<'up' | 'down' | null>(null);
  const lastClientY = useRef<number>(0);

  useEffect(() => {
    if (!is_dragging_block) {
      stopScrolling();
      return;
    }

    const handleGlobalDragOver = (e: DragEvent) => {
      console.log('hi')
      // Threshold increased to 200px as requested by USER
      const threshold = 80;
      const { clientY } = e;
      lastClientY.current = clientY;

      if (clientY < threshold) {
        startScrolling('up');
      } else if (window.innerHeight - clientY < threshold) {
        startScrolling('down');
      } else {
        stopScrolling();
      }
    };

    const handleGlobalDragEnd = () => {
      set_is_dragging_block(false);
      stopScrolling();
    };

    // We add listeners to window to catch dragging even over margins/empty spaces
    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);

    return () => {
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
      stopScrolling();
    };
  }, [is_dragging_block]);

  const startScrolling = (direction: 'up' | 'down') => {
    scrollDirection.current = direction;
    if (scrollInterval.current) return;

    scrollInterval.current = setInterval(() => {
      if (!scrollDirection.current) return;
      
      const threshold = 200;
      const minSpeed = 5;
      const maxSpeed = 35; // Faster max speed for better UX
      
      let intensity = 0;
      if (scrollDirection.current === 'up') {
        intensity = (threshold - lastClientY.current) / threshold;
      } else {
        intensity = (lastClientY.current - (window.innerHeight - threshold)) / threshold;
      }
      
      // Calculate smooth variable speed: the closer to the edge, the faster it scrolls
      const speed = minSpeed + (maxSpeed - minSpeed) * Math.pow(Math.max(0, Math.min(1, intensity)), 1.5);
      const amount = scrollDirection.current === 'up' ? -speed : speed;

      window.scrollBy(0, amount);
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop += amount;
      } else {
        document.body.scrollTop += amount;
        document.documentElement.scrollTop += amount;
      }
    }, 16);
  };

  const stopScrolling = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
    scrollDirection.current = null;
  };

  return { is_dragging_block, set_is_dragging_block };
}
