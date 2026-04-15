'use client';

import { Box, SimpleGrid, Text, Paper, Stack, ScrollArea, Tooltip, Group } from '@mantine/core';
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
  on_navigate?: (date: Date) => void;
  on_date_click?: (date: Date) => void;
  on_event_drop?: (event_id: string, new_date: Date) => void;
}

/**
 * Week view component for the calendar.
 * Displays a time grid for the current week.
 * @param current_date - The currently active date
 * @param events - All calendar events (lessons + Google personal)
 * @param on_event_click - Callback when an event block is clicked
 * @param on_navigate - Callback to navigate to a specific day view
 * @param on_date_click - Callback when an empty time slot is clicked
 */
export function WeekView({ current_date, events, on_event_click, on_navigate, on_date_click, on_event_drop, is_student }: Props) {
  const start_of_week = dayjs(current_date).startOf('week');
  const days = Array.from({ length: 7 }, (_, i) => start_of_week.add(i, 'day'));
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const viewport_ref = useRef<HTMLDivElement>(null);
  const [now, set_now] = useState(dayjs());
  const is_this_week = dayjs().isSame(start_of_week, 'week');
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
      const scroll_position = Math.max(0, (current_hour - 1) * 60);
      viewport_ref.current.scrollTo({ top: scroll_position, behavior: 'smooth' });
    }
  }, []);

  return (
    <Paper radius="md" withBorder className="bg-white/5 border-white/10 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <SimpleGrid cols={8} spacing={0} className="border-b border-white/10 bg-white/5">
        <Box py="xs" className="border-r border-white/10" />
        {days.map((d) => {
          const is_today = d.isSame(dayjs(), 'day');
          const is_selected = d.isSame(dayjs(current_date), 'day');
          return (
            <Box key={d.toISOString()} py="xs" className="text-center border-r last:border-r-0 border-white/10 overflow-hidden">
              <Stack gap={0} align="center">
                <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                  {d.format('ddd')}
                </Text>
                <Text
                  size="sm"
                  fw={is_selected || is_today ? 700 : 500}
                  onClick={() => on_navigate?.(d.toDate())}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full mt-1 cursor-pointer hover:bg-white/10 transition-colors',
                    is_today && 'border-2 border-primary text-primary',
                    is_selected && 'bg-primary text-primary-foreground shadow-sm'
                  )}
                  style={{ color: is_selected ? 'var(--space-primary-text)' : undefined }}
                >
                  {d.date()}
                </Text>
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Grid */}
      <ScrollArea h="100%" className="flex-1 min-h-0" viewportRef={viewport_ref}>
        <Box className="relative" pb={80}>
          <SimpleGrid cols={8} spacing={0}>
            {/* Time labels */}
            <Stack gap={0}>
              {hours.map((h) => (
                <Box key={h} className="h-[60px] border-r border-b border-white/10 text-right pr-2">
                  <Text size="xs" c="dimmed" mt="-14px">
                    {h === 0 ? '' : `${h}:00`}
                  </Text>
                </Box>
              ))}
            </Stack>

            {/* Day columns */}
            {days.map((d) => (
              <Box key={d.toISOString()} className="relative border-r last:border-r-0 border-white/10">
                {hours.map((h) => (
                  <Box
                    key={h}
                    className={cn(
                      'h-[60px] border-b border-white/10 transition-colors',
                      !is_student && 'cursor-pointer hover:bg-white/5'
                    )}
                    onClick={() => {
                      if (is_student) return;
                      const clicked_date = d.set('hour', h).set('minute', 0).set('second', 0).toDate();
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
                      const new_date = d.set('hour', h).set('minute', 0).set('second', 0).toDate();
                      if (event_id && on_event_drop) {
                        on_event_drop(event_id, new_date);
                      }
                    }}
                  />
                ))}

                {/* Events in this day */}
                {(() => {
                  const day_events = events.filter((e) => dayjs(e.start_date).isSame(d, 'day'));
                  const layout = get_event_layout(day_events);

                  return day_events.map((event) => {
                    const start = dayjs(event.start_date);
                    const end = dayjs(event.end_date);
                    const top = start.hour() * 60 + start.minute();
                    const height = end.diff(start, 'minute');
                    const event_layout = layout.get(event);
                    const color = resolve_event_color(event);
                    const is_google = is_google_event(event);
                    const is_lesson = is_lesson_event(event);

                    return (
                      <Tooltip
                        key={event.id}
                        label={
                          is_lesson
                            ? `${event.title}${event.subtitle ? ` · ${event.subtitle}` : ''}`
                            : event.title
                        }
                        withinPortal
                        openDelay={400}
                      >
                        <Box
                          onClick={() => on_event_click?.(event)}
                          className={cn(
                            'absolute rounded p-1 text-[11px] font-semibold transition-all cursor-pointer overflow-hidden z-10',
                            'border-l-4 shadow-sm active:scale-95 hover:z-20',
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
                            minHeight: '20px',
                            left: event_layout ? `calc(${event_layout.left}% + 4px)` : '4px',
                            width: event_layout ? `calc(${event_layout.width}% - 8px)` : 'calc(100% - 8px)',
                          }}
                        >
                          <Stack gap={0}>
                            <Box className="flex items-center gap-1 truncate">
                              {is_google && <FaGoogle size={8} className="shrink-0" />}
                              {is_lesson && <IoSchoolOutline size={10} className="shrink-0" />}
                              {is_personal_event(event) && <IoPersonOutline size={10} className="shrink-0" />}
                              <Text size="xs" fw={700} className="truncate">
                                {event.title}
                              </Text>
                            </Box>
                            {is_lesson && (
                              <Group gap={4} className="opacity-80" wrap="nowrap">
                                <Box className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  event.status === 'scheduled' ? "bg-blue-400" : 
                                  event.status === 'rescheduled' ? "bg-yellow-400" : "bg-red-400"
                                )} />
                                <Text size="10px" fw={600} className="truncate">
                                  {st(event.status === 'rescheduled' ? 'transfered' : event.status)}
                                </Text>
                              </Group>
                            )}
                            {is_lesson && event.subtitle && (
                              <Text size="10px" className="truncate opacity-80">
                                {event.subtitle}
                              </Text>
                            )}
                            <Text size="10px" className="opacity-70">
                              {start.format('HH:mm')} - {end.format('HH:mm')}
                            </Text>
                          </Stack>
                        </Box>
                      </Tooltip>
                    );
                  });
                })()}
              </Box>
            ))}
          </SimpleGrid>

          {/* Current time indicator line */}
          {is_this_week && (
            <Box
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{
                top: `${now.hour() * 60 + now.minute()}px`,
              }}
            >
              <Box className="flex items-center">
                {/* Time dot indicator (optional, but looks good) */}
                <Box className="w-2 h-2 rounded-full bg-red-500 absolute -left-1" />
                <Box className="h-[2px] bg-red-500 w-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              </Box>
            </Box>
          )}
        </Box>
      </ScrollArea>
    </Paper>
  );
}
