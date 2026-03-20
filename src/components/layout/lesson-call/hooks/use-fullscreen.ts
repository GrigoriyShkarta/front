'use client';

import { useState, useEffect, RefObject } from 'react';

/**
 * Hook to manage fullscreen state and toggle.
 * 
 * @param rootRef Reference to the element that should be fullscreen
 */
export function useFullscreen(rootRef: RefObject<HTMLElement | null>) {
  const [fullscreenEl, setFullscreenEl] = useState<Element | null>(null);

  useEffect(() => {
    const handleFsChange = () => setFullscreenEl(document.fullscreenElement ?? null);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && rootRef.current) {
        await rootRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('[useFullscreen] Toggle failed:', error);
    }
  };

  return {
    fullscreenEl,
    toggleFullscreen,
  };
}
