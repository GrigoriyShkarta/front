'use client';

import { Stack, Box, Paper, Text, ScrollArea, Group, Button, Badge } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useTranslations, useLocale } from 'next-intl';
import dayjs from 'dayjs';
import { FaGoogle } from 'react-icons/fa';
import { IoAddOutline, IoTimeOutline } from 'react-icons/io5';
import { CalendarEvent, is_google_event, is_lesson_event } from '../schemas/event-schema';

interface Props {
  date: Date;
  on_date_change: (date: Date) => void;
  events: CalendarEvent[];
  on_create_click: () => void;
  on_event_click: (event: CalendarEvent) => void;
  googleCalendarStatus?: { isConnected: boolean };
  isLoadingGoogleStatus?: boolean;
  on_connect_google?: () => void;
  on_disconnect_google?: () => void;
  is_student?: boolean;
}

/**
 * Sidebar for the calendar page.
 * Includes a mini calendar and upcoming events.
 */
export function CalendarSidebar({ 
  date, 
  on_date_change, 
  events, 
  on_create_click, 
  on_event_click,
  googleCalendarStatus,
  isLoadingGoogleStatus,
  on_connect_google,
  on_disconnect_google,
  is_student
}: Props) {
  const t = useTranslations('Calendar');
  const raw_locale = useLocale();
  let locale = raw_locale.toLowerCase();
  if (locale === 'zh-cn') locale = 'zh-cn';
  else if (locale === 'zh-tw') locale = 'zh-tw';

  const upcoming_events = events
    .filter(e => dayjs(e.start_date).isAfter(dayjs().subtract(1, 'hour')))
    .sort((a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix())
    .slice(0, 5);

  return (
    <Stack gap="xl" className="w-[300px] h-full border-r border-white/10 pr-6 hidden lg:flex">
      {!is_student && (
        <Box>
          <Button 
            fullWidth 
            size="md" 
            radius="md" 
            leftSection={<IoAddOutline size={20} />}
            onClick={on_create_click}
            className="shadow-md shadow-primary/20"
          >
            {t('create_event')}
          </Button>
        </Box>
      )}

      {/* Google Calendar Sync */}
      <Box className="flex flex-col gap-2">
        {!isLoadingGoogleStatus && (
          googleCalendarStatus?.isConnected ? (
            <Group justify="space-between" className="bg-white/5 border border-white/10 rounded-md p-2">
              <Text size="xs" fw={500} c="dimmed" className="flex items-center gap-1">
                {t('google_calendar_connected')}
              </Text>
              <Button size="compact-xs" variant="subtle" color="red" onClick={on_disconnect_google}>
                {t('google_calendar_disconnect')}
              </Button>
            </Group>
          ) : (
            <Button
              fullWidth
              size="sm"
              variant="light"
              color="gray"
              onClick={on_connect_google}
              leftSection={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              }
            >
              {t('google_calendar_connect')}
            </Button>
          )
        )}
      </Box>

      <Box className="calendar-mini border border-white/10 rounded-xl bg-white/5 p-2 overflow-hidden flex justify-center">
        <DatePicker 
          value={date} 
          onChange={(new_date) => {
            if (new_date && !Array.isArray(new_date)) {
              on_date_change(new_date as unknown as Date);
            }
          }}
          size="sm"
          allowDeselect={false}
          locale={locale}
        />
      </Box>

      <Box className="flex-1 overflow-hidden">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={700} size="sm" tt="uppercase" c="dimmed">{t('upcoming')}</Text>
            <Badge size="xs" variant="light">{upcoming_events.length}</Badge>
          </Group>
          
          <ScrollArea h={300} type="never">
            <Stack gap="xs">
              {upcoming_events.length === 0 ? (
                <Text size="xs" c="dimmed" fs="italic" py="md" className="text-center">{t('no_events')}</Text>
              ) : (
                upcoming_events.map(event => {
                  const is_google = is_google_event(event);
                  const is_lesson = is_lesson_event(event);
                  return (
                    <Paper
                      key={event.id}
                      p="xs"
                      radius="md"
                      withBorder
                      className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors group"
                      onClick={() => on_event_click(event)}
                    >
                      <Stack gap={4}>
                        <Group gap={6} wrap="nowrap">
                          {is_google && <FaGoogle size={11} className="shrink-0 opacity-60" />}
                          <Text size="sm" fw={600} className="truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </Text>
                        </Group>
                        {is_lesson && event.subtitle && (
                          <Text size="xs" c="dimmed" className="truncate">
                            {event.subtitle}
                          </Text>
                        )}
                        <Group gap={4}>
                          <IoTimeOutline size={12} className="text-dimmed" />
                          <Text size="xs" c="dimmed">
                            {dayjs(event.start_date).format('MMM D, HH:mm')}
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </ScrollArea>
        </Stack>
      </Box>
    </Stack>
  );
}
