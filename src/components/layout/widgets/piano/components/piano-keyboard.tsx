'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Group, Button, Text, Stack, Loader, Center, ActionIcon, Tooltip } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { use_piano_audio } from '../hooks/use-piano-audio';
import { useTranslations } from 'next-intl';

interface NoteConfig {
  name: string;
  is_black: boolean;
  keyboard_key?: string;
  code?: string;
}

const NOTES_CONFIG: NoteConfig[] = [
  { name: 'C', is_black: false, keyboard_key: 'a', code: 'KeyA' },
  { name: 'C#', is_black: true, keyboard_key: 'w', code: 'KeyW' },
  { name: 'D', is_black: false, keyboard_key: 's', code: 'KeyS' },
  { name: 'D#', is_black: true, keyboard_key: 'e', code: 'KeyE' },
  { name: 'E', is_black: false, keyboard_key: 'd', code: 'KeyD' },
  { name: 'F', is_black: false, keyboard_key: 'f', code: 'KeyF' },
  { name: 'F#', is_black: true, keyboard_key: 't', code: 'KeyT' },
  { name: 'G', is_black: false, keyboard_key: 'g', code: 'KeyG' },
  { name: 'G#', is_black: true, keyboard_key: 'y', code: 'KeyY' },
  { name: 'A', is_black: false, keyboard_key: 'h', code: 'KeyH' },
  { name: 'A#', is_black: true, keyboard_key: 'u', code: 'KeyU' },
  { name: 'B', is_black: false, keyboard_key: 'j', code: 'KeyJ' },
];

const MIN_OCTAVE = 1;
const MAX_OCTAVE = 7;

/**
 * PianoKeyboard component - a custom-built responsive piano keyboard
 * with octave shifting and language-independent keyboard support.
 * @returns {JSX.Element}
 */
export const PianoKeyboard: React.FC = () => {
  const t = useTranslations('Widgets.piano');
  const { play_note, stop_note, init_audio, is_loaded, is_loading } = use_piano_audio();
  const [active_notes, set_active_notes] = useState<Set<string>>(new Set());
  const [octave_offset, set_octave_offset] = useState(0); // Offset from octave 3
  const { width } = useViewportSize();

  // Responsive octave count
  const octave_count = width < 768 ? 1 : width < 1024 ? 2 : 3;
  
  // Current visible octaves
  const octaves = useMemo(() => 
    Array.from({ length: octave_count }, (_, i) => 3 + octave_offset + i)
  , [octave_count, octave_offset]);

  const can_shift_up = octaves[octaves.length - 1] < MAX_OCTAVE;
  const can_shift_down = octaves[0] > MIN_OCTAVE;

  const handle_play_note = useCallback((full_note: string) => {
    play_note(full_note);
    set_active_notes(prev => new Set(prev).add(full_note));
  }, [play_note]);

  const handle_stop_note = useCallback((full_note: string) => {
    stop_note(full_note);
    set_active_notes(prev => {
      const next = new Set(prev);
      next.delete(full_note);
      return next;
    });
  }, [stop_note]);

  const shift_up = useCallback(() => {
    if (can_shift_up) set_octave_offset(prev => prev + 1);
  }, [can_shift_up]);

  const shift_down = useCallback(() => {
    if (can_shift_down) set_octave_offset(prev => prev - 1);
  }, [can_shift_down]);

  // Keyboard mapping using event.code for layout independence
  useEffect(() => {
    const handle_keydown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      
      const config = NOTES_CONFIG.find(n => n.code === e.code);
      if (config) {
        e.preventDefault();
        const full_note = `${config.name}${octaves[0]}`;
        handle_play_note(full_note);
        return;
      }

      if (e.key === 'ArrowRight') shift_up();
      if (e.key === 'ArrowLeft') shift_down();
    };

    const handle_keyup = (e: KeyboardEvent) => {
      const config = NOTES_CONFIG.find(n => n.code === e.code);
      if (config) {
        const full_note = `${config.name}${octaves[0]}`;
        handle_stop_note(full_note);
      }
    };

    window.addEventListener('keydown', handle_keydown);
    window.addEventListener('keyup', handle_keyup);

    return () => {
      window.removeEventListener('keydown', handle_keydown);
      window.removeEventListener('keyup', handle_keyup);
    };
  }, [octaves, handle_play_note, handle_stop_note, shift_up, shift_down]);

  if (is_loading) {
    return (
      <Center p="xl" className="flex-col gap-4">
        <Loader size="lg" />
        <Text c="dimmed">{t('loading')}</Text>
      </Center>
    );
  }

  const white_keys_in_octave = NOTES_CONFIG.filter(n => !n.is_black);
  const total_white_keys = white_keys_in_octave.length * octaves.length;
  const white_key_width = 100 / total_white_keys;
  const black_key_width = white_key_width * 0.65;

  return (
    <Stack gap="xl" className="w-full max-w-6xl">
      <Group justify="center" align="center" className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Stack gap={4} align="center">
          <Group gap="md">
            <Tooltip label={t('shift_down')}>
              <ActionIcon 
                variant="light" 
                size="lg" 
                onClick={shift_down} 
                disabled={!can_shift_down}
              >
                <IoChevronBack size={20} />
              </ActionIcon>
            </Tooltip>
            
            <Box className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 min-w-[120px] text-center">
              <Text size="sm" fw={700} className="font-mono uppercase tracking-tighter">
                {t('octaves')} {octaves[0]} – {octaves[octaves.length - 1]}
              </Text>
            </Box>

            <Tooltip label={t('shift_up')}>
              <ActionIcon 
                variant="light" 
                size="lg" 
                onClick={shift_up} 
                disabled={!can_shift_up}
              >
                <IoChevronForward size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Text size="xs" c="dimmed" className="font-medium">{t('change_octaves_hint')}</Text>
        </Stack>
      </Group>

      <Box className="relative h-64 w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl flex touch-none">
        {/* White Keys */}
        {octaves.map((octave, octave_index) => (
          white_keys_in_octave.map((note, note_index) => {
            const full_note = `${note.name}${octave}`;
            const is_active = active_notes.has(full_note);
            
            return (
              <Box
                key={`white-${full_note}`}
                component="button"
                className={`
                  relative h-full border-r border-zinc-200 dark:border-zinc-800 transition-all duration-75
                  ${is_active 
                    ? 'bg-zinc-200 dark:bg-zinc-700' 
                    : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }
                  flex flex-col items-center justify-end pb-4
                `}
                style={{ width: `${white_key_width}%` }}
                onMouseDown={() => handle_play_note(full_note)}
                onMouseUp={() => handle_stop_note(full_note)}
                onMouseLeave={() => handle_stop_note(full_note)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handle_play_note(full_note);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handle_stop_note(full_note);
                }}
              >
                <Stack gap={2} align="center" className="pointer-events-none select-none opacity-40">
                  {octave_index === 0 && note.keyboard_key && (
                    <Text size="10px" fw={700} className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded border border-zinc-200 dark:border-zinc-700">
                      {note.keyboard_key.toUpperCase()}
                    </Text>
                  )}
                  <Text size="xs" fw={800}>{note.name}</Text>
                  <Text size="10px" fw={500}>{octave}</Text>
                </Stack>
              </Box>
            );
          })
        ))}

        {/* Black Keys */}
        {octaves.map((octave, octave_index) => (
          NOTES_CONFIG.map((note, note_index) => {
            if (!note.is_black) return null;

            const full_note = `${note.name}${octave}`;
            const is_active = active_notes.has(full_note);
            
            const prev_white_keys = NOTES_CONFIG.slice(0, note_index).filter(n => !n.is_black).length;
            const global_white_index = octave_index * white_keys_in_octave.length + prev_white_keys;
            const left_position = (global_white_index * white_key_width) - (black_key_width / 2);

            return (
              <Box
                key={`black-${full_note}`}
                component="button"
                className={`
                  absolute h-40 z-20 rounded-b-md transition-all duration-75 shadow-lg border-x border-b border-white/5
                  ${is_active 
                    ? 'bg-blue-600 dark:bg-blue-500 scale-[0.98]' 
                    : 'bg-zinc-900 dark:bg-black hover:bg-zinc-800'
                  }
                  flex flex-col items-center justify-end pb-2
                `}
                style={{ 
                  left: `${left_position}%`,
                  width: `${black_key_width}%`
                }}
                onMouseDown={() => handle_play_note(full_note)}
                onMouseUp={() => handle_stop_note(full_note)}
                onMouseLeave={() => handle_stop_note(full_note)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handle_play_note(full_note);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handle_stop_note(full_note);
                }}
              >
                {octave_index === 0 && note.keyboard_key && (
                  <Text size="10px" fw={700} className="text-white/30 pointer-events-none select-none">
                    {note.keyboard_key.toUpperCase()}
                  </Text>
                )}
              </Box>
            );
          })
        ))}
      </Box>

      <Center>
        <Text size="xs" c="dimmed" className="italic">
          {t('mobile_hint')}
        </Text>
      </Center>
    </Stack>
  );
};
