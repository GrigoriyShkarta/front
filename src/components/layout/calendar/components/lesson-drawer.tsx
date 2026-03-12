'use client';

import { Drawer, Stack, Button, Group, Text, Divider, Box, Avatar, Badge, Select, Anchor } from '@mantine/core';
import Link from 'next/link';
import { DateTimePicker } from '@mantine/dates';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { IoTimeOutline, IoArrowForwardOutline, IoSchoolOutline, IoPersonOutline, IoReceiptOutline } from 'react-icons/io5';
import { LessonEvent } from '../schemas/event-schema';
import { cn } from '@/lib/utils';
import { resolve_event_color, get_event_style } from '../utils/calendar-utils';
import '@mantine/dates/styles.css';

interface Props {
  opened: boolean;
  lesson: LessonEvent | null;
  isLoading?: boolean;
  is_student?: boolean;
  onClose: () => void;
  onSubmit: (data: { date: Date; status: string }) => void;
}

export function LessonDrawer({ opened, lesson, onClose, onSubmit, isLoading, is_student }: Props) {
  const t = useTranslations('Calendar.lesson_drawer');
  const common_t = useTranslations('Common');
  const locale = useLocale();
  
  const [status, setStatus] = useState<string | null>('scheduled');
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    if (lesson && opened) {
      const initialStatus = lesson.status === 'rescheduled' ? 'transfered' : lesson.status;
      setStatus(initialStatus);
      setDate(new Date(lesson.date));
    }
  }, [lesson, opened]);

  if (!lesson) return null;

  const handle_save = () => {
    if (date && status) {
      const backendStatus = status === 'transfered' ? 'rescheduled' : status === 'scheduled' ? 'scheduled' : 'burned';
      onSubmit({ date, status: backendStatus });
    }
  };

  const handle_transfer_week = () => {
    if (date) {
      const nextWeek = dayjs(date).add(1, 'week').toDate();
      onSubmit({ date: nextWeek, status: 'rescheduled' });
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Text fw={600} size="lg">{t('title')}</Text>}
      position="right"
      size="md"
      classNames={{
        content: 'bg-[#1A1B1E] border-l border-white/10 flex flex-col',
        header: 'bg-[#1A1B1E] border-b border-white/10',
        body: 'flex-1 flex flex-col p-0 overflow-hidden'
      }}
    >
      <Stack gap="xl" p="md" className="flex-1 overflow-y-auto">
        {is_student ? (
          <Stack gap="lg">
            {/* Header / Status Card */}
            <Box 
              className={cn(
                "p-5 rounded-2xl border-l-[10px] shadow-sm",
                get_event_style(lesson?.color || 'blue')
              )}
            >
              <Stack gap="xs">
                <Text size="xl" fw={800} tt="uppercase" className="tracking-wide leading-tight">
                  {t('title')}
                </Text>
                <Group gap={8}>
                  <Box className={cn(
                    "w-3 h-3 rounded-full shadow-sm",
                    lesson?.status === 'scheduled' ? "bg-blue-400" : 
                    lesson?.status === 'rescheduled' ? "bg-yellow-400" : "bg-red-400"
                  )} />
                  <Text fw={700} opacity={0.9} size="sm">
                    {t(lesson?.status === 'rescheduled' ? 'statuses.transfered' : `statuses.${lesson?.status}`)}
                  </Text>
                </Group>
              </Stack>
            </Box>

            {/* Student & Subscription Info */}
            <Group wrap="nowrap" gap="md" className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
               <Box className="bg-primary/20 p-3 rounded-xl text-primary shrink-0">
                  <IoSchoolOutline size={22} />
               </Box>
               <Stack gap={0}>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase" className="tracking-wider mb-0.5">
                    {t('student')}
                  </Text>
                  <Anchor
                    component={Link}
                    href={`/main/users/${lesson?.subscription.student.id}`}
                    fw={700}
                    size="md"
                    className="hover:underline transition-all"
                  >
                    {lesson?.subscription.student.name}
                  </Anchor>
                  <Text size="sm" opacity={0.7} fw={500} className="flex items-center gap-1.5 mt-0.5">
                    <IoReceiptOutline size={14} className="opacity-70" />
                    {lesson?.subscription.name}
                  </Text>
               </Stack>
            </Group>

            {/* Time & Date */}
            <Group wrap="nowrap" gap="md" className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
              <Box className="bg-primary/20 p-3 rounded-xl text-primary shrink-0">
                <IoTimeOutline size={22} />
              </Box>
              <Stack gap={0}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase" className="tracking-wider mb-0.5">
                  {t('date')}
                </Text>
                <Text fw={700} size="md">
                  {dayjs(lesson?.date).format('DD MMMM YYYY')}
                </Text>
                <Text size="sm" fw={600} className="text-primary mt-0.5">
                  {dayjs(lesson?.date).format('HH:mm')} — {dayjs(lesson?.date).add(1, 'hour').format('HH:mm')}
                </Text>
              </Stack>
            </Group>
          </Stack>
        ) : (
          <>
            <Box className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Group gap="md">
                <Avatar 
                  src={lesson.subscription.student.avatar} 
                  size="lg" 
                  radius="xl"
                  className="border-2 border-primary/20"
                />
                <Stack gap={2}>
                  <Anchor 
                    component={Link}
                    href={`/main/users/${lesson.subscription.student.id}`}
                    fw={700} 
                    size="lg"
                    className="hover:underline text-white transition-all"
                  >
                    {lesson.subscription.student.name}
                  </Anchor>
                  <Group gap={6}>
                    <Badge variant="dot" size="sm" color="primary">
                      {lesson.subscription.name}
                    </Badge>
                  </Group>
                </Stack>
              </Group>
            </Box>

            <Divider label={t('status')} labelPosition="left" />

            <Select
              label={t('status')}
              placeholder={t('status')}
              value={status}
              onChange={setStatus}
              data={[
                { label: t('statuses.scheduled'), value: 'scheduled' },
                { label: t('statuses.transfered'), value: 'transfered' },
                { label: t('statuses.burned'), value: 'burned' },
              ]}
              allowDeselect={false}
              required
              disabled={is_student}
              variant={is_student ? 'unstyled' : 'default'}
              styles={{
                input: { backgroundColor: 'transparent', fontWeight: is_student ? 600 : 400 }
              }}
            />

            <Divider label={t('date')} labelPosition="left" />

            <DateTimePicker
              value={date}
              onChange={(val) => setDate(val ? new Date(val) : null)}
              label={t('date')}
              placeholder={t('date')}
              locale={locale}
              leftSection={<IoTimeOutline size={16} />}
              required
              readOnly={is_student}
              variant={is_student ? 'unstyled' : 'default'}
              styles={{
                input: { backgroundColor: 'transparent', fontWeight: is_student ? 600 : 400 }
              }}
            />

            {!is_student && (
              <Button 
                variant="light" 
                leftSection={<IoArrowForwardOutline size={16} />}
                onClick={handle_transfer_week}
                loading={isLoading}
                className="justify-start h-11"
              >
                {t('transfer_week')}
              </Button>
            )}
          </>
        )}
      </Stack>

      <Box p="md" className="border-t border-white/10">
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={isLoading}>
            {is_student ? common_t('close') : common_t('cancel')}
          </Button>
          {!is_student && (
            <Button 
              onClick={handle_save} 
              loading={isLoading}
              className="bg-primary hover:opacity-90 shadow-lg shadow-primary/20 px-8"
            >
              {t('save')}
            </Button>
          )}
        </Group>
      </Box>
    </Drawer>
  );
}
