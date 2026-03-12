'use client';

import { Box, SimpleGrid, Text, Paper, Stack, ScrollArea } from '@mantine/core';
import dayjs from 'dayjs';
import { FaGoogle } from 'react-icons/fa';
import { CalendarEvent, is_google_event, is_lesson_event } from '../schemas/event-schema';
import { cn } from '@/lib/utils';
import { resolve_event_color, get_event_style } from '../utils/calendar-utils';
import { useTranslations } from 'next-intl';

interface Props {
  current_date: Date;
  events: CalendarEvent[];
  on_event_click?: (event: CalendarEvent) => void;
  on_date_click?: (date: Date) => void;
  on_navigate?: (date: Date) => void;
  on_event_drop?: (event_id: string, new_date: Date) => void;
  is_student?: boolean;
}

/**
 * Month view component for the calendar.
 * Displays a grid of days for the current month.
 */
export function MonthView({ 
  current_date, 
  events, 
  on_event_click, 
  on_date_click, 
  on_navigate, 
  on_event_drop, 
  is_student 
}: Props) {
  const start_of_month = dayjs(current_date).startOf('month');
  const end_of_month = dayjs(current_date).endOf('month');
  const start_date = start_of_month.startOf('week');
  const end_date = end_of_month.endOf('week');

  const days = [];
  let day = start_date;

  while (day.isBefore(end_date) || day.isSame(end_date, 'day')) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    dayjs().startOf('week').add(i, 'day').format('ddd')
  );
  const st = useTranslations('Calendar.lesson_drawer.statuses');

  return (
    <Paper radius="md" withBorder className="bg-white/5 border-white/10 overflow-hidden flex flex-col h-full min-h-[600px]">
      <SimpleGrid cols={7} spacing={0} className="border-b border-white/10 bg-white/5">
        {weekdays.map((wd) => (
          <Box key={wd} py="xs" className="text-center border-r last:border-r-0 border-white/10">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              {wd}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={7} spacing={0} className="flex-1">
        {days.map((d, index) => {
          const is_current_month = d.isSame(start_of_month, 'month');
          const is_today = d.isSame(dayjs(), 'day');
          const is_selected = d.isSame(dayjs(current_date), 'day');
          const day_events = events.filter((e) => dayjs(e.start_date).isSame(d, 'day'));

          return (
            <Box
              key={d.toISOString()}
              onClick={() => on_date_click?.(d.toDate())}
              className={cn(
                'min-h-[120px] p-2 border-r border-b border-white/10 transition-colors group',
                !is_current_month && 'bg-black/20 opacity-40',
                is_current_month && !is_student && 'hover:bg-white/5 cursor-pointer',
                is_selected && is_current_month && 'bg-primary/5',
                (index + 1) % 7 === 0 && 'border-r-0'
              )}
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
                if (event_id && on_event_drop) {
                  const event = events.find(ev => ev.id === event_id);
                  const original_start = event ? dayjs(event.start_date) : dayjs().hour(10).minute(0);
                  const new_date = d.hour(original_start.hour()).minute(original_start.minute()).second(0).toDate();
                  on_event_drop(event_id, new_date);
                }
              }}
            >
              <Stack gap={4}>
                <Box className="flex justify-between items-start">
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      on_navigate?.(d.toDate());
                    }}
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full transition-transform group-hover:scale-110 z-10 cursor-pointer',
                      is_today && 'border-2 border-primary text-primary',
                      is_selected && 'bg-primary text-white shadow-lg shadow-primary/20'
                    )}
                  >
                    <Text size="sm" fw={is_selected || is_today ? 700 : 500} c={is_selected ? 'white' : undefined}>
                      {d.date()}
                    </Text>
                  </Box>
                </Box>

                <ScrollArea.Autosize mah={80} type="never">
                  <Stack gap={4}>
                    {day_events.map((event) => {
                      const color = resolve_event_color(event);
                      const is_google = is_google_event(event);
                      const is_lesson = is_lesson_event(event);

                      return (
                        <Box
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            on_event_click?.(event);
                          }}
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-semibold truncate transition-all active:scale-95 border-l-2 flex items-center gap-1 hover:z-20',
                            !is_student && is_lesson && 'cursor-move',
                            get_event_style(color)
                          )}
                          draggable={!is_student && is_lesson}
                          onDragStart={(e) => {
                            if (is_student) return;
                            e.dataTransfer.setData('event_id', event.id as string);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                        >
                          {is_google && <FaGoogle size={8} className="shrink-0" />}
                          {is_lesson && (
                            <Box className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              event.status === 'scheduled' ? "bg-blue-400" : 
                              event.status === 'rescheduled' ? "bg-yellow-400" : "bg-red-400"
                            )} />
                          )}
                          <span className="truncate">
                            {dayjs(event.start_date).format('HH:mm')} {event.title}
                          </span>
                        </Box>
                      );
                    })}
                  </Stack>
                </ScrollArea.Autosize>
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Paper>
  );
}
