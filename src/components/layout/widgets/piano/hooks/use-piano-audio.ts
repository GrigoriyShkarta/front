'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import * as Tone from 'tone';

/**
 * Hook for playing piano sounds using Tone.Sampler with optimized loading
 * Uses a small set of high-quality samples to balance quality and speed.
 */
export const use_piano_audio = () => {
  const sampler_ref = useRef<Tone.Sampler | null>(null);
  const [is_loaded, set_is_loaded] = useState(false);
  const [is_loading, set_is_loading] = useState(false);

  const init_audio = useCallback(async () => {
    if (sampler_ref.current || is_loading) return;
    
    set_is_loading(true);
    
    // Initialize Tone.js
    await Tone.start();

    const sampler = new Tone.Sampler({
      urls: {
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => {
        set_is_loaded(true);
        set_is_loading(false);
      },
      onerror: (error) => {
        console.error('Failed to load piano samples:', error);
        set_is_loading(false);
      }
    }).toDestination();

    sampler_ref.current = sampler;
  }, [is_loading]);

  useEffect(() => {
    return () => {
      if (sampler_ref.current) {
        sampler_ref.current.dispose();
      }
    };
  }, []);

  const play_note = useCallback((note: string) => {
    if (!sampler_ref.current || !is_loaded) {
      init_audio();
      return;
    }
    sampler_ref.current.triggerAttack(note);
  }, [is_loaded, init_audio]);

  const stop_note = useCallback((note: string) => {
    if (!sampler_ref.current || !is_loaded) return;
    sampler_ref.current.triggerRelease(note);
  }, [is_loaded]);

  return { play_note, stop_note, init_audio, is_loaded, is_loading };
};
