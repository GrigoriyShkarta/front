'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

/**
 * Hook for metronome logic using Tone.js for precise timing
 */
export const use_metronome = () => {
  const [is_playing, set_is_playing] = useState(false);
  const [bpm, set_bpm] = useState(120);
  const [time_signature, set_time_signature] = useState(4); // 4/4
  const [current_beat, set_current_beat] = useState(0);
  
  const click_high_ref = useRef<Tone.Synth | null>(null);
  const click_low_ref = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    // Pure sine click for the first beat
    click_high_ref.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 }
    }).toDestination();

    // Pure sine click for other beats
    click_low_ref.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 }
    }).toDestination();

    return () => {
      click_high_ref.current?.dispose();
      click_low_ref.current?.dispose();
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  const toggle_metronome = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    if (is_playing) {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      set_is_playing(false);
      set_current_beat(0);
    } else {
      // Reset transport
      Tone.Transport.cancel();
      Tone.Transport.seconds = 0;

      let beat_counter = 0;
      Tone.Transport.scheduleRepeat((time) => {
        if (beat_counter === 0) {
          click_high_ref.current?.triggerAttackRelease('A6', '64n', time, 1);
        } else {
          click_low_ref.current?.triggerAttackRelease('E6', '64n', time, 0.5);
        }
        
        // Use local variable for drawing to avoid closure issues
        const draw_beat = beat_counter;
        Tone.Draw.schedule(() => {
          set_current_beat(draw_beat);
        }, time);

        beat_counter = (beat_counter + 1) % time_signature;
      }, '4n');

      Tone.Transport.start('+0.1');
      set_is_playing(true);
    }
  }, [is_playing, time_signature]);

  return {
    is_playing,
    bpm,
    set_bpm,
    time_signature,
    set_time_signature,
    current_beat,
    toggle_metronome
  };
};
