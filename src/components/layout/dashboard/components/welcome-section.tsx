'use client';

import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoPencilOutline, IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5';
import { notifications } from '@mantine/notifications';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/types/auth.types';

interface Props {
  /** Title, supports {name} placeholder */
  title?: string | null;
  /** Description text */
  description?: string | null;
  /** 'admin' or 'student' mode (which fields to update) */
  mode: 'admin' | 'student';
  /** Called after successful save */
  on_saved?: (title: string, description: string) => void;
}

/**
 * Dashboard welcome text block.
 * Admins can inline-edit title and description.
 */
export function WelcomeSection({ title, description, mode, on_saved }: Props) {
  const t = useTranslations('Dashboard');
  const tc = useTranslations('Common');
  const { user } = useAuth();

  const is_admin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.TEACHER;

  const [is_editing, set_editing] = useState(false);
  const [edit_title, set_edit_title] = useState(title ?? '');
  const [edit_desc, set_edit_desc] = useState(description ?? '');
  const [is_saving, set_saving] = useState(false);

  const user_name = user?.name?.split(' ')[0] ?? '';

  const resolve_title = (raw?: string | null) => {
    if (raw) return raw.replace('{name}', user_name);
    
    // Dynamic time-based greeting fallback
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return t('welcome_morning', { name: user_name });
    } else if (hour >= 12 && hour < 18) {
      return t('welcome_afternoon', { name: user_name });
    } else {
      return t('welcome_evening', { name: user_name });
    }
  };
  const resolve_desc = (raw?: string | null) =>
    raw ?? t('welcome_description');

  const handle_save = async () => {
    set_saving(true);
    try {
      const title_field = mode === 'admin' ? 'dashboard_title' : 'student_dashboard_title';
      const desc_field = mode === 'admin' ? 'dashboard_description' : 'student_dashboard_description';
      await api.patch('/space/dashboard', {
        [title_field]: edit_title,
        [desc_field]: edit_desc,
      });
      notifications.show({ color: 'green', message: t('save_success') });
      on_saved?.(edit_title, edit_desc);
      set_editing(false);
    } catch {
      notifications.show({ color: 'red', message: tc('error') });
    } finally {
      set_saving(false);
    }
  };

  const handle_cancel = () => {
    set_edit_title(title ?? '');
    set_edit_desc(description ?? '');
    set_editing(false);
  };

  if (is_editing) {
    return (
      <Stack gap="sm">
        <TextInput
          value={edit_title}
          onChange={e => set_edit_title(e.currentTarget.value)}
          placeholder={t('welcome_title', { name: user_name })}
          size="md"
          description={t('banner_title_hint')}
        />
        <Textarea
          value={edit_desc}
          onChange={e => set_edit_desc(e.currentTarget.value)}
          placeholder={t('welcome_description')}
          autosize
          minRows={2}
          maxRows={4}
          size="sm"
        />
        <Group gap="xs" justify="flex-end">
          <Button size="xs" variant="subtle" leftSection={<IoCloseOutline size={14} />} onClick={handle_cancel} disabled={is_saving}>
            {tc('cancel')}
          </Button>
          <Button size="xs" leftSection={<IoCheckmarkOutline size={14} />} onClick={handle_save} loading={is_saving}>
            {tc('save')}
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Box className="group relative">
      <Stack gap={4}>
        <Group gap={8} align="center">
          <Text fw={800} size="xl" className="text-2xl md:text-3xl leading-tight">
            {resolve_title(title)}
          </Text>
          {is_admin && (
            <Tooltip label={tc('edit')} position="right">
              <ActionIcon
                variant="subtle"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => set_editing(true)}
              >
                <IoPencilOutline size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        <Text size="sm" c="dimmed" className="leading-relaxed max-w-2xl">
          {resolve_desc(description)}
        </Text>
      </Stack>
    </Box>
  );
}
