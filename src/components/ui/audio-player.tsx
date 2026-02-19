'use client';

import { Group, ActionIcon, Slider, Text, Box } from '@mantine/core';
import { IoPlay, IoPause } from 'react-icons/io5';
import { useState, useRef, useEffect } from 'react';

interface Props {
  src: string;
  class_name?: string;
}

/**
 * Custom Audio Player component with primary color styling
 * Supports both light and dark themes via Mantine's theme system
 * 
 * @param {string} src - The URL of the audio file
 * @param {string} class_name - Optional tailwind classes for the container
 */
export function AudioPlayer({ src, class_name }: Props) {
  const [is_playing, setIsPlaying] = useState(false);
  const [current_time, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audio_ref = useRef<HTMLAudioElement>(null);

  const toggle_play = () => {
    if (audio_ref.current) {
      if (is_playing) {
        audio_ref.current.pause();
      } else {
        audio_ref.current.play();
      }
      setIsPlaying(!is_playing);
    }
  };

  const handle_time_update = () => {
    if (audio_ref.current) {
      setCurrentTime(audio_ref.current.currentTime);
    }
  };

  const handle_loaded_metadata = () => {
    if (audio_ref.current) {
      setDuration(audio_ref.current.duration);
    }
  };

  const handle_duration_change = () => {
    if (audio_ref.current) {
      setDuration(audio_ref.current.duration);
    }
  };

  const handle_slider_change = (value: number) => {
    if (audio_ref.current) {
      audio_ref.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const format_time = (time: number) => {
    if (!time || isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    // Reset state when src changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // If audio is already loaded/cached by the browser, 
    // events might not fire on new mount. Manually check.
    if (audio_ref.current) {
        audio_ref.current.load(); // Force browser to start loading the new src
        if (audio_ref.current.readyState >= 1) { // HAVE_METADATA
            setDuration(audio_ref.current.duration);
        }
    }
  }, [src]);

  return (
    <Box className={`w-full min-w-[66px] ${class_name}`}>
      <audio 
        ref={audio_ref} 
        src={src} 
        onTimeUpdate={handle_time_update} 
        onLoadedMetadata={handle_loaded_metadata}
        onLoadedData={handle_loaded_metadata}
        onCanPlay={handle_loaded_metadata}
        onDurationChange={handle_duration_change}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />
      
      <Group gap="xs" wrap="nowrap" className="bg-white/5 p-1 rounded-full border border-white/10 pr-3">
        <ActionIcon 
          variant="filled" 
          color="brand" 
          radius="xl" 
          size="md" 
          onClick={toggle_play}
          className="shadow-sm hover:scale-105 transition-transform"
        >
          {is_playing ? <IoPause size={14} /> : <IoPlay size={14} />}
        </ActionIcon>
        
        <Slider
          size="xs"
          className="flex-1"
          value={current_time}
          max={duration || 100}
          onChange={handle_slider_change}
          label={null}
          color="brand"
          styles={(theme) => ({
            root: {
              paddingTop: 0,
              paddingBottom: 0,
            },
            track: {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            bar: {
              backgroundColor: 'var(--space-primary)',
            },
            thumb: {
              display: current_time > 0 ? 'block' : 'none',
              borderWidth: 0,
              width: 8,
              height: 8,
              backgroundColor: 'var(--space-primary)',
              boxShadow: theme.shadows.xs,
            }
          })}
        />
        
        <Text size="xs" fw={500} c="dimmed" ff="monospace" className="min-w-[80px] text-right">
          {format_time(current_time)} / {format_time(duration)}
        </Text>
      </Group>
    </Box>
  );
}
