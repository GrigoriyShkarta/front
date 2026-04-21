'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import {
  IoNotificationsOutline,
  IoTrashOutline,
  IoCheckmarkDoneOutline,
} from 'react-icons/io5';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { userActions } from '@/components/layout/users/actions/user-actions';
import { cn } from '@/lib/utils';

dayjs.extend(relativeTime);

interface Props {
  primary_color?: string;
  secondary_color?: string;
}

/**
 * Dashboard notifications panel showing only unread notifications.
 */
export function NotificationsPanel({ primary_color, secondary_color }: Props) {
  const t = useTranslations('Dashboard');
  const tn = useTranslations('Notifications');
  const { user, refresh_user } = useAuth();
  const params = useParams();
  const locale = (params.locale as string) || 'uk';

  const all_notifications = [...(user?.notifications ?? [])].sort(
    (a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
  );
  const unread = all_notifications.filter(n => !n.is_read);
  const has_unread = unread.length > 0;

  const handle_delete = async (e: React.MouseEvent, ids: string[]) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await userActions.delete_notifications(ids);
      await refresh_user();
    } catch {/* silent */ }
  };

  const handle_mark_all = async () => {
    try {
      await userActions.mark_all_read_notifications();
      await refresh_user();
    } catch {/* silent */ }
  };

  return (
    <Paper p="lg" radius="xl" className="border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <Stack gap="md">
        {/* Header */}
        <Group gap={8} align="center" justify="space-between">
          <Group gap={8} align="center">
            <Box className="relative">
              <IoNotificationsOutline
                size={18}
                style={{ color: secondary_color ?? 'var(--space-secondary)' }}
              />
              {has_unread && (
                <Box
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
                  style={{ background: primary_color ?? '#3b82f6' }}
                />
              )}
            </Box>
            <Title order={6} className="tracking-wide uppercase opacity-70">
              {t('notifications_title')}
            </Title>
          </Group>
          <Group gap={4}>
            {has_unread && (
              <>
                <Badge variant="light" size="sm" radius="xl">
                  {unread.length}
                </Badge>
                <Tooltip label={tn('mark_all_read')} position="left">
                  <ActionIcon variant="subtle" size="sm" onClick={handle_mark_all}>
                    <IoCheckmarkDoneOutline size={14} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
          </Group>
        </Group>

        {/* Notification list */}
        {unread.length === 0 ? (
          <Box className="flex flex-col items-center justify-center py-8 text-center">
            <IoNotificationsOutline size={36} className="opacity-20 mb-2" />
            <Text size="sm" c="dimmed">
              {tn('no_notifications')}
            </Text>
          </Box>
        ) : (
          <ScrollArea.Autosize mah={280} type="hover" scrollbarSize={4}>
            <Stack gap={4}>
              {unread.map(notification => (
                <Box
                  key={notification.id}
                  className={cn(
                    'relative flex gap-3 p-3 rounded-xl border transition-all duration-200 group',
                    'border-transparent hover:bg-black/3 dark:hover:bg-white/3',
                    !notification.is_read ? 'bg-primary/5 border-primary/10' : ''
                  )}
                >
                  {/* Unread dot */}
                  <Box className="mt-1.5 shrink-0">
                    <Box
                      className="w-2 h-2 rounded-full"
                      style={{ background: primary_color ?? '#3b82f6' }}
                    />
                  </Box>

                  {/* Content */}
                  <Stack gap={2} className="flex-1 min-w-0">
                    <Group gap={4} justify="space-between" wrap="nowrap">
                      <Text size="xs" fw={700} className="truncate">
                        {notification.message_title}
                      </Text>
                      <Text size="10px" c="dimmed" className="shrink-0">
                        {dayjs(notification.created_at).locale(locale).fromNow()}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed" className="leading-relaxed">
                      {tn(`messages.${notification.message}`)}
                    </Text>
                  </Stack>

                  {/* Delete */}
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-0.5"
                    onClick={e => handle_delete(e, [notification.id])}
                  >
                    <IoTrashOutline size={12} />
                  </ActionIcon>
                </Box>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Paper>
  );
}
