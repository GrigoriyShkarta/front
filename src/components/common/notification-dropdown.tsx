'use client';

import { 
  Menu, 
  ActionIcon, 
  Indicator, 
  Text, 
  ScrollArea, 
  UnstyledButton, 
  Group, 
  Stack, 
  Box,
  Divider,
  Button,
  useMantineTheme
} from '@mantine/core';
import { IoNotificationsOutline, IoNotifications, IoCheckmarkDoneOutline, IoTrashOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Link } from '@/i18n/routing';
import { userActions } from '@/components/layout/users/actions/user-actions';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

dayjs.extend(relativeTime);

export function NotificationDropdown() {
  const { user, refresh_user } = useAuth();
  const theme = useMantineTheme();
  const t = useTranslations('Notifications');
  const params = useParams();
  const locale = params.locale as string || 'uk';

  const notifications = [...(user?.notifications || [])].sort((a, b) => 
    dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
  );
  const unread_notifications = notifications.filter(n => !n.is_read);
  const has_unread = unread_notifications.length > 0;

  const handle_mark_all_read = async () => {
    try {
      await userActions.mark_all_read_notifications();
      await refresh_user();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handle_delete = async (e: React.MouseEvent, ids: string[]) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await userActions.delete_notifications(ids);
      await refresh_user();
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const handle_on_open = () => {
    if (has_unread) {
      handle_mark_all_read();
    }
  };

  const get_notification_link = (notification: any) => {
    const { message_type, payload } = notification;
    
    // Extract student/user ID from payload with fallbacks
    const target_id = payload?.student_id || payload?.user_id || payload?.id || user?.id;

    // 1. Task Type -> Link to Student's Tracker
    if (message_type === 'task') {
       return target_id ? `/main/tracker/${target_id}` : '/main/tracker';
    }
    
    // 2. User Type -> Link to Student's Profile Page
    if (message_type === 'user') {
       if (target_id) {
         return notification.message === 'task_column_changed' 
           ? `/main/users/${target_id}/tracker`
           : `/main/users/${target_id}`;
       }
       return '/main/users';
    }

    // 3. Test Type
    if (message_type === 'test') {
      if (notification.message === 'test_access_granted') {
        const id = payload?.id || payload?.test_id || notification.message_id;
        return id ? `/main/materials/tests/${id}` : '/main/materials/tests';
      }
      return '/main/materials/tests/reviews';
    }

    // 4. Lesson Type -> Link to Lesson Page
    if (message_type === 'lesson') {
       const id = payload?.lesson_id || payload?.id || notification.message_id;
       return id ? `/main/materials/lessons/${id}` : '/main/materials/lessons';
    }

    // 5. Homework Completion Type (Admin) -> Link to Review Page
    if (message_type === 'homework') {
      return payload?.submission_id 
        ? `/main/materials/homeworks/reviews/${payload.submission_id}` 
        : '/main/materials/homeworks/reviews';
    }

    // 6. Homework Reviewed Type (Student) -> Link to Lesson Page
    if (message_type === 'homework_reviewed') {
      return notification.message_id 
        ? `/main/materials/lessons/${notification.message_id}` 
        : '/main/materials/lessons';
    }
    
    return '#';
  };

  const space = user?.space?.personalization;
  const primary_color = space?.primary_color || theme.primaryColor;

  return (
    <Menu 
      width={360} 
      position="bottom-end" 
      offset={10} 
      radius="md" 
      shadow="xl"
      transitionProps={{ transition: 'pop-top-right' }}
      onOpen={handle_on_open}
    >
      <Menu.Target>
        <ActionIcon 
          variant="transparent" 
          size="lg" 
          style={{ color: primary_color }}
          className={cn(
            "transition-all duration-300 hover:scale-110", 
            has_unread ? "opacity-100 animate-pulse" : "opacity-70 hover:opacity-100"
          )}
          aria-label="Notifications"
        >
          <Indicator 
            disabled={!has_unread} 
            color={primary_color} 
            size={10} 
            offset={4}
            processing
            withBorder
            styles={{
              indicator: { border: '2px solid var(--mantine-color-body)' }
            }}
          >
            {has_unread ? (
              <IoNotifications size={22} />
            ) : (
              <IoNotificationsOutline size={22} />
            )}
          </Indicator>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown p={0} className="overflow-hidden border border-secondary shadow-2xl bg-secondary/10 backdrop-blur-md">
        <Box px="md" py="sm" className="bg-secondary/10">
          <Group justify="space-between" align="center">
            <Text fw={800} size="sm" tt="uppercase" className="tracking-wider text-secondary opacity-60">{t('title')}</Text>
            <Group gap={4}>
              {notifications.length > 0 && (
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={(e) => handle_delete(e, notifications.map(n => n.id))}
                  title={t('clear_all')}
                >
                  <IoTrashOutline size={16} />
                </ActionIcon>
              )}
            </Group>
          </Group>
        </Box>
        
        <Divider color="var(--space-secondary)" className="opacity-20" />

        <ScrollArea.Autosize 
          mah={420} 
          type="hover"
          scrollbarSize={6}
          styles={{
            viewport: { 
              paddingRight: '0 !important',
              overflowX: 'hidden'
            },
            scrollbar: {
              '&[data-orientation="vertical"]': {
                width: 6,
                backgroundColor: 'transparent',
              },
              '&:hover': {
                backgroundColor: 'rgba(var(--space-secondary-rgb), 0.05)',
              },
              thumb: {
                backgroundColor: 'rgba(var(--space-secondary-rgb), 0.5) !important',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--space-primary) !important',
                }
              }
            }
          }}
        >
          <Stack gap={4} p={8}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Menu.Item
                  key={notification.id}
                  component={Link}
                  href={get_notification_link(notification)}
                  closeMenuOnClick
                  className={cn(
                    "p-3 rounded-xl transition-all duration-200 border border-transparent hover:bg-secondary/10 relative group",
                    !notification.is_read ? "bg-primary/10 border-primary/10 shadow-sm shadow-primary/5 font-medium" : "hover:shadow-sm"
                  )}
                  rightSection={
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handle_delete(e, [notification.id])}
                    >
                      <IoTrashOutline size={14} />
                    </ActionIcon>
                  }
                >
                  <Group align="flex-start" wrap="nowrap" gap="sm">
                    <Box className="mt-1.5 shrink-0">
                      {!notification.is_read ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      )}
                    </Box>

                    <Stack gap={2} className="flex-1 min-w-0">
                      <Group justify="space-between" wrap="nowrap" gap="xs">
                        <Text size="sm" fw={700} className="text-zinc-800 dark:text-zinc-100 break-words">
                          {notification.message_title}
                        </Text>
                        <Text size="11px" fz={10} c="dimmed" className="shrink-0 font-medium pt-0.5">
                          {dayjs(notification.created_at).locale(locale).fromNow()}
                        </Text>
                      </Group>
                      <Text size="xs" c="zinc.500" className="leading-relaxed font-medium break-words">
                        {t(`messages.${notification.message}`)}
                        {notification.payload?.test_name && (
                          <Text component="span" fw={800} inherit ml={4} className="text-zinc-900 dark:text-zinc-100">
                             {notification.payload.test_name}
                          </Text>
                        )}
                        {notification.payload?.task_name && (
                          <Text component="span" fw={800} inherit ml={4} className="text-zinc-900 dark:text-zinc-100">
                             {notification.payload.task_name}
                          </Text>
                        )}
                        {(notification.payload?.lesson_name || (notification.message === 'lesson_access_granted' && notification.payload?.name)) && (
                          <Text component="span" fw={800} inherit ml={4} className="text-primary-600 dark:text-primary-400">
                             {notification.payload.lesson_name || notification.payload?.name}
                          </Text>
                        )}
                        {(notification.payload?.test_name || (notification.message === 'test_access_granted' && notification.payload?.name)) && (
                          <Text component="span" fw={800} inherit ml={4} className="text-primary-600 dark:text-primary-400">
                             {notification.payload.test_name || notification.payload?.name}
                          </Text>
                        )}
                        {notification.payload?.homework_name && (
                          <Text component="span" fw={800} inherit ml={4} className="text-primary-600 dark:text-primary-400">
                             {notification.payload.homework_name}
                          </Text>
                        )}
                      </Text>
                    </Stack>
                  </Group>
                </Menu.Item>
              ))
            ) : (
              <Box py={40} px="xl" className="text-center">
                <IoNotificationsOutline size={40} className="mx-auto text-zinc-300 dark:text-zinc-800 mb-3" />
                <Text c="dimmed" fw={500} size="sm">
                  {t('no_notifications')}
                </Text>
              </Box>
            )}
          </Stack>
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
