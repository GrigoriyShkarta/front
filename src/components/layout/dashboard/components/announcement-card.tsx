'use client';

import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import {
  IoMegaphoneOutline,
  IoPencilOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
} from 'react-icons/io5';
import { notifications } from '@mantine/notifications';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/types/auth.types';

interface Props {
  /** Current announcement text */
  text?: string | null;
  /** Primary color for accent */
  primary_color?: string;
  secondary_color?: string;
  /** Called after successful save */
  on_saved?: (text: string) => void;
}

/**
 * Announcement card widget.
 * Admins can inline-edit the announcement text.
 * Students see it read-only.
 */
export function AnnouncementCard({ text, primary_color, secondary_color, on_saved }: Props) {
  const t = useTranslations('Dashboard');
  const tc = useTranslations('Common');
  const { user } = useAuth();

  const is_admin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.TEACHER;

  const [is_editing, set_editing] = useState(false);
  const [edit_text, set_edit_text] = useState(text ?? '');
  const [is_saving, set_saving] = useState(false);

  // Don't render for students if empty
  if (!is_admin && !text) return null;

  const handle_save = async () => {
    set_saving(true);
    try {
      await api.patch('/space/dashboard', { student_announcement: edit_text });
      notifications.show({ color: 'green', message: t('save_success') });
      on_saved?.(edit_text);
      set_editing(false);
    } catch {
      notifications.show({ color: 'red', message: tc('error') });
    } finally {
      set_saving(false);
    }
  };

  const handle_cancel = () => {
    set_edit_text(text ?? '');
    set_editing(false);
  };

  return (
    <Paper
      p="lg"
      radius="xl"
      className="border overflow-hidden relative border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{
        borderColor: primary_color ? `${primary_color}33` : undefined,
        background: primary_color
          ? `linear-gradient(135deg, ${primary_color}10 0%, ${primary_color}05 100%)`
          : undefined,
      }}
    >
      {/* Accent stripe on the left */}
      <Box
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: primary_color ?? 'var(--mantine-color-blue-5)' }}
      />

      <Stack gap="sm" pl={8}>
        <Group gap={8} align="center" justify="space-between">
          <Group gap={8} align="center">
            <IoMegaphoneOutline
              size={18}
              style={{ color: secondary_color ?? 'var(--space-secondary)' }}
            />
            <Title order={6} className="tracking-wide uppercase opacity-70">
              {t('announcement_title')}
            </Title>
          </Group>

          {is_admin && !is_editing && (
            <Tooltip label={tc('edit')} position="left">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => set_editing(true)}
              >
                <IoPencilOutline size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>

        {is_editing ? (
          <Stack gap="sm">
            <Textarea
              value={edit_text}
              onChange={e => set_edit_text(e.currentTarget.value)}
              placeholder={t('announcement_placeholder')}
              autosize
              minRows={2}
              maxRows={6}
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
        ) : (
          <>
            {text ? (
              <Text size="sm" className="leading-relaxed whitespace-pre-line">
                {text}
              </Text>
            ) : (
              is_admin && (
                <Text size="sm" c="dimmed" className="italic">
                  {t('announcement_empty_hint')}
                </Text>
              )
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
