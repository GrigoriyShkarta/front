'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, ActionIcon, Group, Stack, RingProgress, Transition, useMantineColorScheme, NumberInput } from '@mantine/core';
import { IoPlayOutline, IoPauseOutline, IoRefreshOutline, IoNotificationsOutline, IoNotificationsOffOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

export function TimerWidget() {
  const t = useTranslations('Widgets.timer');
  const { colorScheme } = useMantineColorScheme();
  const is_dark = colorScheme === 'dark';

  const [seconds_left, set_seconds_left] = useState(0);
  const [initial_seconds, set_initial_seconds] = useState(0);
  const [is_running, set_is_running] = useState(false);
  const [is_sound_on, set_is_sound_on] = useState(true);
  const [is_finished, set_is_finished] = useState(false);

  // Manual input state
  const [input_mins, set_input_mins] = useState<number | string>(0);
  const [input_secs, set_input_secs] = useState<number | string>(0);

  const timer_ref = useRef<NodeJS.Timeout | null>(null);

  // Web Audio API Beep Generator
  const play_beep = useCallback(() => {
    if (!is_sound_on) return;
    
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audio_ctx = new AudioContextClass();
      const oscillator = audio_ctx.createOscillator();
      const gain_node = audio_ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audio_ctx.currentTime); // A5 note
      
      gain_node.gain.setValueAtTime(0, audio_ctx.currentTime);
      gain_node.gain.linearRampToValueAtTime(0.5, audio_ctx.currentTime + 0.1);
      gain_node.gain.exponentialRampToValueAtTime(0.01, audio_ctx.currentTime + 1);

      oscillator.connect(gain_node);
      gain_node.connect(audio_ctx.destination);

      oscillator.start();
      oscillator.stop(audio_ctx.currentTime + 1);
      
      setTimeout(() => audio_ctx.close(), 1100);
    } catch (e) {
      console.error('Failed to play beep', e);
    }
  }, [is_sound_on]);

  const handle_tick = useCallback(() => {
    set_seconds_left(prev => {
      if (prev <= 1) {
        if (timer_ref.current) clearInterval(timer_ref.current);
        set_is_running(false);
        set_is_finished(true);
        play_beep();
        return 0;
      }
      return prev - 1;
    });
  }, [play_beep]);

  useEffect(() => {
    if (is_running) {
      timer_ref.current = setInterval(handle_tick, 1000);
    } else {
      if (timer_ref.current) clearInterval(timer_ref.current);
    }
    return () => { if (timer_ref.current) clearInterval(timer_ref.current); };
  }, [is_running, handle_tick]);

  const start_timer = (total_sec: number) => {
    if (total_sec <= 0) return;
    set_initial_seconds(total_sec);
    set_seconds_left(total_sec);
    set_is_running(true);
    set_is_finished(false);
  };

  const handle_manual_start = () => {
    const total = (Number(input_mins) * 60) + Number(input_secs);
    start_timer(total);
  };

  const toggle_pause = () => {
    if (seconds_left > 0) {
        set_is_running(!is_running);
    }
  };

  const reset_timer = () => {
    set_is_running(false);
    set_seconds_left(0);
    set_initial_seconds(0);
    set_is_finished(false);
  };

  const format_time = (total_sec: number) => {
    const mins = Math.floor(total_sec / 60);
    const secs = total_sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = initial_seconds > 0 ? (seconds_left / initial_seconds) * 100 : 0;

  const presets = [
    { label: '1m', value: 60 },
    { label: '5m', value: 300 },
    { label: '10m', value: 600 },
    { label: '15m', value: 900 },
  ];

  const is_editing = !is_running && seconds_left === 0;

  return (
    <Box 
      p="xl" 
      className="relative h-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: is_dark 
            ? 'linear-gradient(135deg, rgba(20, 20, 35, 0.4) 0%, rgba(10, 10, 20, 0.4) 100%)' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(240, 245, 255, 0.6) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: 24,
        minHeight: 480
      }}
    >
      {/* Background Pulse for finished state */}
      <Transition mounted={is_finished} transition="fade" duration={1000}>
        {(styles) => (
          <Box 
            style={{ 
                ...styles, 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'rgba(var(--space-primary-rgb), 0.1)',
                animation: 'pulse 2s infinite',
                zIndex: 0
            }} 
          />
        )}
      </Transition>

      <Stack align="center" gap="lg" style={{ zIndex: 1, width: '100%' }}>
        <Box className="relative">
          <RingProgress
            size={240}
            thickness={12}
            roundCaps
            sections={[{ value: is_finished ? 100 : progress, color: is_finished ? 'teal' : 'var(--space-primary)' }]}
            label={
              <Stack align="center" gap={0}>
                <Text 
                  size="52px" 
                  fw={800} 
                  style={{ 
                    fontFamily: 'Outfit, sans-serif',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-2px',
                    color: is_finished ? '#20c997' : (is_dark ? '#fff' : '#1a1b1e')
                  }}
                >
                  {format_time(seconds_left)}
                </Text>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: 1 }}>
                  {is_running ? t('running') : (is_finished ? t('finished') : t('ready'))}
                </Text>
              </Stack>
            }
          />
        </Box>

        {/* Manual Input Area */}
        <Transition mounted={is_editing} transition="fade" duration={400}>
            {(styles) => (
                <Stack align="center" gap="md" style={{ ...styles, width: '100%' }}>
                    <Group gap="xs" justify="center" align="center" style={{ 
                        background: is_dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        padding: '12px 24px',
                        borderRadius: 16,
                        border: is_dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <Stack gap={2} align="center">
                            <NumberInput 
                                variant="unstyled"
                                value={input_mins}
                                onChange={set_input_mins}
                                min={0} max={999}
                                styles={{ input: { fontSize: 32, fontWeight: 800, width: 80, textAlign: 'center', color: is_dark ? '#fff' : '#000', padding: 0, height: 'auto' } }}
                            />
                            <Text size="10px" fw={700} c="dimmed">MINUTES</Text>
                        </Stack>
                        <Text size="32px" fw={800} style={{ marginTop: -16 }}>:</Text>
                        <Stack gap={2} align="center">
                            <NumberInput 
                                variant="unstyled"
                                value={input_secs}
                                onChange={set_input_secs}
                                min={0} max={59}
                                styles={{ input: { fontSize: 32, fontWeight: 800, width: 80, textAlign: 'center', color: is_dark ? '#fff' : '#000', padding: 0, height: 'auto' } }}
                            />
                            <Text size="10px" fw={700} c="dimmed">SECONDS</Text>
                        </Stack>
                    </Group>

                    {/* Presets Grid */}
                    <Group gap="xs" justify="center">
                        {presets.map(p => (
                            <ActionIcon 
                                key={p.value}
                                variant="light"
                                size="xl"
                                radius="lg"
                                onClick={() => start_timer(p.value)}
                                style={{ border: '1px solid rgba(var(--space-primary-rgb), 0.1)' }}
                                className="hover:scale-105 active:scale-95 transition-transform"
                            >
                                <Text fw={700} size="xs">{p.label}</Text>
                            </ActionIcon>
                        ))}
                    </Group>
                </Stack>
            )}
        </Transition>

        {/* Controls */}
        <Group gap="xl" mt={is_editing ? 0 : 40}>
            <ActionIcon 
                variant="subtle" 
                size="lg" 
                radius="xl"
                color={is_sound_on ? 'blue' : 'gray'}
                onClick={() => set_is_sound_on(!is_sound_on)}
            >
                {is_sound_on ? <IoNotificationsOutline size={20} /> : <IoNotificationsOffOutline size={20} />}
            </ActionIcon>

            <ActionIcon 
                variant="filled" 
                size="70px" 
                radius="100%"
                onClick={is_editing ? handle_manual_start : toggle_pause}
                disabled={is_editing && Number(input_mins) === 0 && Number(input_secs) === 0}
                style={{ 
                    backgroundColor: 'var(--space-primary)',
                    boxShadow: '0 10px 20px rgba(var(--space-primary-rgb), 0.3)',
                    transition: 'all 0.2s'
                }}
                className="hover:scale-105 active:scale-95"
            >
                {is_running ? <IoPauseOutline size={32} /> : <IoPlayOutline size={32} style={{ marginLeft: 4 }} />}
            </ActionIcon>

            <ActionIcon 
                variant="subtle" 
                size="lg" 
                radius="xl" 
                color="gray"
                onClick={reset_timer}
            >
                <IoRefreshOutline size={22} />
            </ActionIcon>
        </Group>
      </Stack>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
            0% { opacity: 0.1; }
            50% { opacity: 0.3; }
            100% { opacity: 0.1; }
        }
      `}} />
    </Box>
  );
}
