'use client';

import { useState, useRef } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import {
  IoAddOutline,
  IoCheckmarkDoneOutline,
  IoTrashOutline,
  IoListOutline,
} from 'react-icons/io5';
import { useDashboardTodos } from '../hooks/use-dashboard-todos';
import { cn } from '@/lib/utils';

interface Props {
  primary_color?: string;
}

/**
 * Personal todo list widget for the dashboard.
 * Data is stored in localStorage (per-user isolation is implicit since the app is single-user).
 */
export function TodoList({ primary_color }: Props) {
  const t = useTranslations('Dashboard');
  const tc = useTranslations('Common');
  const { todos, add_todo, toggle_todo, delete_todo, clear_done } = useDashboardTodos();
  const [new_text, set_new_text] = useState('');
  const input_ref = useRef<HTMLInputElement>(null);

  const done_count = todos.filter(t => t.is_done).length;
  const pending_count = todos.filter(t => !t.is_done).length;

  const handle_add = () => {
    if (!new_text.trim()) return;
    add_todo(new_text);
    set_new_text('');
    input_ref.current?.focus();
  };

  const handle_key = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handle_add();
  };

  return (
    <Paper p="lg" radius="xl" className="border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <Stack gap="md">
        {/* Header */}
        <Group gap={8} align="center" justify="space-between">
          <Group gap={8} align="center">
            <IoListOutline
              size={18}
              style={{ color: primary_color ?? 'var(--mantine-color-blue-5)' }}
            />
            <Title order={6} className="tracking-wide uppercase opacity-70">
              {t('todo_title')}
            </Title>
          </Group>
          <Group gap={4}>
            {pending_count > 0 && (
              <Text size="xs" c="dimmed">
                {pending_count} {t('todo_remaining')}
              </Text>
            )}
            {done_count > 0 && (
              <Tooltip label={t('todo_clear_done')} position="left">
                <ActionIcon variant="subtle" color="red" size="sm" onClick={clear_done}>
                  <IoCheckmarkDoneOutline size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        {/* Add input */}
        <Group gap={8}>
          <TextInput
            ref={input_ref}
            value={new_text}
            onChange={e => set_new_text(e.currentTarget.value)}
            onKeyDown={handle_key}
            placeholder={t('todo_add_placeholder')}
            size="sm"
            radius="xl"
            className="flex-1"
            rightSection={
              new_text.trim() ? (
                <ActionIcon
                  variant="filled"
                  size="sm"
                  radius="xl"
                  style={{ background: primary_color ?? undefined }}
                  onClick={handle_add}
                >
                  <IoAddOutline size={14} />
                </ActionIcon>
              ) : null
            }
          />
        </Group>

        {/* Todo items */}
        {todos.length === 0 ? (
          <Box className="flex flex-col items-center justify-center py-6 text-center">
            <IoListOutline size={32} className="opacity-20 mb-2" />
            <Text size="sm" c="dimmed">
              {t('todo_empty')}
            </Text>
          </Box>
        ) : (
          <ScrollArea.Autosize mah={280} type="hover" scrollbarSize={4}>
            <Stack gap={4}>
              {/* Pending items */}
              {todos.filter(item => !item.is_done).map(item => (
                <Box
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-black/3 dark:hover:bg-white/3 group transition-all"
                >
                  <Checkbox
                    checked={false}
                    onChange={() => toggle_todo(item.id)}
                    size="sm"
                    radius="xl"
                    styles={{
                      input: {
                        cursor: 'pointer',
                        borderColor: primary_color ? `${primary_color}66` : undefined,
                      },
                    }}
                  />
                  <Text size="sm" className="flex-1 leading-snug">
                    {item.text}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => delete_todo(item.id)}
                  >
                    <IoTrashOutline size={12} />
                  </ActionIcon>
                </Box>
              ))}

              {/* Done items (if any) */}
              {done_count > 0 && (
                <>
                  <Box className="border-t border-black/5 dark:border-white/5 my-1" />
                  {todos.filter(item => item.is_done).map(item => (
                    <Box
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-black/3 dark:hover:bg-white/3 group transition-all opacity-50"
                    >
                      <Checkbox
                        checked
                        onChange={() => toggle_todo(item.id)}
                        size="sm"
                        radius="xl"
                        styles={{
                          input: { cursor: 'pointer' },
                        }}
                      />
                      <Text
                        size="sm"
                        className="flex-1 leading-snug line-through"
                        c="dimmed"
                      >
                        {item.text}
                      </Text>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => delete_todo(item.id)}
                      >
                        <IoTrashOutline size={12} />
                      </ActionIcon>
                    </Box>
                  ))}
                </>
              )}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Paper>
  );
}
