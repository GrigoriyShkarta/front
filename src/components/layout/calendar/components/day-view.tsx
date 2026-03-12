'use client';

import { Box, SimpleGrid, Text, Paper, Stack, ScrollArea, Group, Anchor } from '@mantine/core';
import dayjs from 'dayjs';
import { IoSchoolOutline, IoPersonOutline } from 'react-icons/io5';
import { FaGoogle } from 'react-icons/fa';
import { CalendarEvent, is_google_event, is_lesson_event, is_personal_event } from '../schemas/event-schema';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { get_event_layout, get_event_style, resolve_event_color } from '../utils/calendar-utils';
import { useTranslations } from 'next-intl';

interface Props {
  current_date: Date;
  events: CalendarEvent[];
  is_student?: boolean;
  on_event_click?: (event: CalendarEvent) => void;
  on_date_click?: (date: Date) => void;
  on_event_drop?: (event_id: string, new_date: Date) => void;
}

/**
 * Day view component for the calendar.
 * Displays a single day's time grid with lesson and Google events.
 * @param current_date - The currently active date
 * @param events - All calendar events (lessons + Google personal)
 * @param on_event_click - Callback when an event block is clicked
 * @param on_date_click - Callback when an empty time slot is clicked
 */
export function DayView({ current_date, events, on_event_click, on_date_click, on_event_drop, is_student }: Props) {
  const day = dayjs(current_date);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const is_today = day.isSame(dayjs(), 'day');
  const viewport_ref = useRef<HTMLDivElement>(null);
  const [now, set_now] = useState(dayjs());
  const st = useTranslations('Calendar.lesson_drawer.statuses');

  useEffect(() => {
    const interval = setInterval(() => {
      set_now(dayjs());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (viewport_ref.current) {
      const current_hour = dayjs().hour();
      const scroll_position = Math.max(0, (current_hour - 1) * 80);
      viewport_ref.current.scrollTo({ top: scroll_position, behavior: 'smooth' });
    }
  }, []);

  const day_events = events.filter((e) => dayjs(e.start_date).isSame(day, 'day'));

  return (
    <Paper radius="md" withBorder className="bg-white/5 border-white/10 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <Box p="md" className="border-b border-white/10 bg-white/5">
        <Stack gap={0} align="center">
          <Text size="sm" fw={700} tt="uppercase" c="dimmed">
            {day.format('dddd')}
          </Text>
          <Text
            size="xl"
            fw={700}
            className={cn(
              is_today && 'border-4 border-primary text-primary',
              day.isSame(dayjs(current_date), 'day') && 'bg-primary rounded-full text-white shadow-lg shadow-primary/20'
            )}
            c={day.isSame(dayjs(current_date), 'day') ? 'white' : undefined}
          >
            {day.date()}
          </Text>
        </Stack>
      </Box>

      {/* Grid */}
      <ScrollArea h="100%" className="flex-1 min-h-0" viewportRef={viewport_ref}>
        <Box className="relative" pb={80}>
          <SimpleGrid cols={1} spacing={0}>
            <Box className="flex w-full">
              {/* Time labels */}
              <Stack gap={0} className="w-[80px]">
                {hours.map((h) => (
                  <Box key={h} className="h-[80px] border-r border-b border-white/10 text-right pr-4">
                    <Text size="sm" c="dimmed" mt="-16px">
                      {h === 0 ? '' : `${h}:00`}
                    </Text>
                  </Box>
                ))}
              </Stack>

              {/* Day column */}
              <Box className="flex-1 relative">
                {hours.map((h) => (
                  <Box
                    key={h}
                    className={cn(
                      'h-[80px] border-b border-white/10 w-full transition-colors',
                      !is_student && 'cursor-pointer hover:bg-white/5'
                    )}
                    onClick={() => {
                      if (is_student) return;
                      const clicked_date = day.set('hour', h).set('minute', 0).set('second', 0).toDate();
                      on_date_click?.(clicked_date);
                    }}
                    onDragOver={(e) => {
                      if (is_student) return;
                      e.preventDefault();
                      e.currentTarget.classList.add('bg-white/10');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-white/10');
                    }}
                    onDrop={(e) => {
                      if (is_student) return;
                      e.preventDefault();
                      e.currentTarget.classList.remove('bg-white/10');
                      const event_id = e.dataTransfer.getData('event_id');
                      const new_date = day.set('hour', h).set('minute', 0).set('second', 0).toDate();
                      if (event_id && on_event_drop) {
                        on_event_drop(event_id, new_date);
                      }
                    }}
                  />
                ))}

                {/* Events */}
                {(() => {
                  const layout = get_event_layout(day_events);

                  return day_events.map((event) => {
                    const start = dayjs(event.start_date);
                    const end = dayjs(event.end_date);
                    const top = start.hour() * 80 + (start.minute() / 60) * 80;
                    const height = (end.diff(start, 'minute') / 60) * 80;
                    const event_layout = layout.get(event);
                    const color = resolve_event_color(event);
                    const is_google = is_google_event(event);
                    const is_lesson = is_lesson_event(event);

                    return (
                      <Box
                        key={event.id}
                        onClick={() => on_event_click?.(event)}
                        className={cn(
                          'absolute rounded-lg p-3 text-sm font-semibold transition-all cursor-pointer overflow-hidden z-10 shadow-md',
                          'border-l-8 active:scale-[0.98] hover:z-20',
                          !is_student && is_lesson && 'cursor-move',
                          get_event_style(color)
                        )}
                        draggable={!is_student && is_lesson}
                        onDragStart={(e) => {
                          if (is_student) return;
                          e.dataTransfer.setData('event_id', event.id as string);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          minHeight: '40px',
                          left: event_layout ? `calc(${event_layout.left}% + 16px)` : '16px',
                          width: event_layout ? `calc(${event_layout.width}% - 32px)` : 'calc(100% - 32px)',
                        }}
                      >
                        <Stack gap={4}>
                          <Group justify="space-between" wrap="nowrap">
                            <Group gap={6} wrap="nowrap" className="min-w-0">
                              {is_google && <FaGoogle size={14} className="shrink-0 opacity-70" />}
                              {is_lesson && <IoSchoolOutline size={16} className="shrink-0 opacity-80" />}
                              {is_personal_event(event) && <IoPersonOutline size={16} className="shrink-0 opacity-80" />}
                              <Text fw={700} size="md" className="truncate">
                                {event.title}
                              </Text>
                            </Group>
                            <Text size="xs" opacity={0.8} className="shrink-0">
                              {start.format('HH:mm')} - {end.format('HH:mm')}
                            </Text>
                          </Group>

                          {/* Subtitle: student name for lessons */}
                          {is_lesson && event.subtitle && (
                            <Text size="sm" opacity={0.8} className="truncate">
                              {event.subtitle}
                            </Text>
                          )}

                          {is_lesson && (
                            <Group gap={6} mt={2}>
                              <Box className={cn(
                                "w-2 h-2 rounded-full shadow-sm",
                                event.status === 'scheduled' ? "bg-blue-400" : 
                                event.status === 'rescheduled' ? "bg-yellow-400" : "bg-red-400"
                              )} />
                              <Text size="xs" fw={700} opacity={0.9}>
                                {st(event.status === 'rescheduled' ? 'transfered' : event.status)}
                              </Text>
                            </Group>
                          )}

                          {/* Description for Google events or manual events */}
                          {!is_lesson && (event as { description?: string | null }).description && (
                            <Text size="xs" className="line-clamp-2" opacity={0.7}>
                              {(event as { description?: string | null }).description}
                            </Text>
                          )}

                          {/* Open in Google Calendar link */}
                          {is_google && event.html_link && (
                            <Anchor
                              href={event.html_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="xs"
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-70 hover:opacity-100 transition-opacity"
                            >
                              Open in Google Calendar ↗
                            </Anchor>
                          )}
                        </Stack>
                      </Box>
                    );
                  });
                })()}

                {/* Current time indicator line */}
                {is_today && (
                  <Box
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{
                      top: `${now.hour() * 80 + (now.minute() / 60) * 80}px`,
                    }}
                  >
                    <Box className="flex items-center">
                      <Box className="w-2 h-2 rounded-full bg-red-500 absolute -left-1" />
                      <Box className="h-[2px] bg-red-500 w-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </SimpleGrid>
        </Box>
      </ScrollArea>
    </Paper>
  );
}
