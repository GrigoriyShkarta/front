'use client';

import { Box, Container, Stack, Transition, LoadingOverlay, Group, Title, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { IoCalendarOutline } from 'react-icons/io5';
import { CalendarSidebar } from './components/calendar-sidebar';
import { CalendarHeader } from './components/calendar-header';
import { MonthView } from './components/month-view';
import { WeekView } from './components/week-view';
import { DayView } from './components/day-view';
import { EventModal } from './components/event-modal';
import { LessonDrawer } from './components/lesson-drawer';
import { useCalendar } from './hooks/use-calendar';
import { StudentSubscriptionDrawer } from '@/components/layout/users/studentProfile/subscriptions/student-subscription-drawer';

/**
 * Main calendar layout component.
 * Orchestrates views and state.
 */
interface Props {
  student_id?: string;
}

export function CalendarLayout({ student_id }: Props = {}) {
  const {
    current_date,
    selected_event,
    current_view,
    modal_opened,
    events,
    isLoading,
    isFetching,
    disconnectGoogleCalendar,
    googleCalendarStatus,
    subscription_drawer_opened,
    isLoadingGoogleStatus,
    subscription_student_id,
    is_student,
    is_mutating,
    lesson_drawer_opened,
    selected_lesson,
    set_current_view,
    handle_prev,
    handle_next,
    handle_today,
    set_modal_opened,
    handle_navigate,
    handle_date_click,
    handle_event_click,
    handle_modal_submit,
    handle_modal_delete,
    connectGoogleCalendar,
    set_subscription_drawer_opened,
    set_subscription_student_id,
    handle_event_drop,
    set_lesson_drawer_opened,
    update_lesson_status,
  } = useCalendar({ student_id });

  const locale = useLocale();
  const tCal = useTranslations('Calendar');
  const tNav = useTranslations('Navigation');
  const [locale_loaded, set_locale_loaded] = useState(false);

  useEffect(() => {
    let internal_locale = locale;
    // Map specific locales if dayjs names them differently (like zh-CN to zh-cn)
    if (locale.toLowerCase() === 'zh-cn') internal_locale = 'zh-cn';
    else if (locale.toLowerCase() === 'zh-tw') internal_locale = 'zh-tw';

    import(`dayjs/locale/${internal_locale}`)
      .then(() => {
        dayjs.locale(internal_locale);
        set_locale_loaded(true);
      })
      .catch((e) => {
        console.error(`Failed to load dayjs locale for ${internal_locale}`, e);
        dayjs.locale('en');
        set_locale_loaded(true);
      });
  }, [locale]);

  const render_view = () => {
    switch (current_view) {
      case 'month':
        return (
          <MonthView 
            current_date={current_date} 
            events={events} 
            on_date_click={handle_date_click}
            on_navigate={(d) => handle_navigate(d, 'day')}
            on_event_click={handle_event_click}
            on_event_drop={handle_event_drop}
            is_student={is_student}
          />
        );
      case 'week':
        return (
          <WeekView 
            current_date={current_date} 
            events={events} 
            on_event_click={handle_event_click}
            on_navigate={(d) => handle_navigate(d, 'day')}
            on_date_click={handle_date_click}
            on_event_drop={handle_event_drop}
            is_student={is_student}
          />
        );
      case 'day':
        return (
          <DayView 
            current_date={current_date} 
            events={events} 
            on_event_click={handle_event_click}
            on_date_click={handle_date_click}
            on_event_drop={handle_event_drop}
            is_student={is_student}
          />
        );
      default:
        return (
          <MonthView 
            current_date={current_date} 
            events={events} 
            on_date_click={handle_date_click}
            on_navigate={(d) => handle_navigate(d, 'day')}
            on_event_click={handle_event_click}
            is_student={is_student}
          />
        );
    }
  };

  return (
    <Container size="xl" className="h-[calc(100vh-100px)] flex flex-col max-w-full relative gap-lg">
      <LoadingOverlay visible={isFetching || !locale_loaded} overlayProps={{ blur: 2 }} />
      {locale_loaded && (
        <>
          <Stack gap="lg" mb="lg">
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group align="center" gap="md">
                <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
                  <IoCalendarOutline size={28} />
                </Box>
                <Stack gap={0}>
                  <Title order={2} className="text-[24px] sm:text-[28px] font-bold tracking-tight">
                    {tCal('title')}
                  </Title>
                  <Text c="dimmed" size="sm" className="hidden sm:block">
                    {tCal('subtitle')}
                  </Text>
                </Stack>
              </Group>
            </Group>
          </Stack>

          <Box className="flex-1 flex overflow-hidden min-h-0">
            <CalendarSidebar 
              date={current_date}
              on_date_change={(d) => handle_navigate(d)}
              events={events}
              on_create_click={() => handle_date_click(new Date())}
              on_event_click={handle_event_click}
              googleCalendarStatus={googleCalendarStatus}
              isLoadingGoogleStatus={isLoadingGoogleStatus}
              on_connect_google={connectGoogleCalendar}
              on_disconnect_google={() => disconnectGoogleCalendar.mutate()}
              is_student={is_student}
            />

            <Stack gap="lg" className="flex-1 pl-0 lg:pl-6 overflow-hidden">
            <CalendarHeader
              current_date={current_date}
              current_view={current_view}
              on_view_change={set_current_view}
              on_prev={handle_prev}
              on_next={handle_next}
              on_today={handle_today}
            />
            
            <Box className="flex-1 relative overflow-hidden">
              <Transition
                mounted={!isLoading}
                transition="fade"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <Box style={styles} className="h-full flex flex-col">
                    {render_view()}
                  </Box>
                )}
              </Transition>
            </Box>
          </Stack>
        </Box>

        <EventModal
            opened={modal_opened}
            event={selected_event}
            is_loading={is_mutating}
            is_student={is_student}
            onClose={() => set_modal_opened(false)}
            onSubmit={handle_modal_submit}
            onDelete={handle_modal_delete}
            onCreateSubscription={(studentId) => {
              set_subscription_student_id(studentId);
              set_modal_opened(false);
              set_subscription_drawer_opened(true);
            }}
          />

          {subscription_student_id && (
            <StudentSubscriptionDrawer
              opened={subscription_drawer_opened}
              onClose={() => set_subscription_drawer_opened(false)}
              studentId={subscription_student_id}
              initialDate={selected_event?.start_date}
            />
          )}

          <LessonDrawer
            opened={lesson_drawer_opened}
            lesson={selected_lesson}
            isLoading={is_mutating}
            is_student={is_student}
            onClose={() => set_lesson_drawer_opened(false)}
            onSubmit={(data) => {
              if (selected_lesson) {
                update_lesson_status({ lessonId: selected_lesson.id, data });
              }
            }}
          />
        </>
      )}
    </Container>
  );
}
