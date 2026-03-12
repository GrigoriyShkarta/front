'use client';

import { Drawer, Stack, Button, Group, Text, Divider, Box, Avatar, Badge, Select } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { IoTimeOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { LessonEvent } from '../schemas/event-schema';
import '@mantine/dates/styles.css';

interface Props {
  opened: boolean;
  onClose: () => void;
  lesson: LessonEvent | null;
  isLoading?: boolean;
  onSubmit: (data: { date: Date; status: string }) => void;
}

export function LessonDrawer({ opened, lesson, onClose, onSubmit, isLoading }: Props) {
  const t = useTranslations('Calendar.lesson_drawer');
  const common_t = useTranslations('Common');
  const locale = useLocale();
  
  const [status, setStatus] = useState<string | null>('scheduled');
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    if (lesson && opened) {
      const initialStatus = lesson.status === 'scheduled' ? 'transfered' : (lesson.status === 'burned' ? 'burned' : 'transfered');
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
        <Box className="bg-white/5 p-4 rounded-xl border border-white/10">
          <Group gap="md">
            <Avatar 
              src={lesson.subscription.student.avatar} 
              size="lg" 
              radius="xl"
              className="border-2 border-primary/20"
            />
            <Stack gap={2}>
              <Text fw={700} size="lg">{lesson.subscription.student.name}</Text>
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
          styles={{
            input: { backgroundColor: 'transparent' }
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
          styles={{
            input: { backgroundColor: 'transparent' }
          }}
        />

        <Button 
          variant="light" 
          leftSection={<IoArrowForwardOutline size={16} />}
          onClick={handle_transfer_week}
          loading={isLoading}
          className="justify-start h-11"
        >
          {t('transfer_week')}
        </Button>
      </Stack>

      <Box p="md" className="border-t border-white/10">
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={isLoading}>
            {common_t('cancel')}
          </Button>
          <Button 
            onClick={handle_save} 
            loading={isLoading}
            className="bg-primary hover:opacity-90 shadow-lg shadow-primary/20 px-8"
          >
            {t('save')}
          </Button>
        </Group>
      </Box>
    </Drawer>
  );
}
