'use client';

import { Tabs, Stack, Title, Paper, Text, Box, LoadingOverlay, Group, Avatar, Badge, Button, ActionIcon, Tooltip } from '@mantine/core';
import { IoPersonOutline, IoCardOutline, IoPencilOutline, IoBookOutline, IoListOutline, IoVideocamOutline, IoShieldCheckmarkOutline, IoArrowBackOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useUserQuery } from '../hooks/use-user-query';
import { useUsersQuery } from '../hooks/use-users-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { UserDrawer } from '../components/user-drawer';
import { StudentRecordingsList } from './recordings/recordings-list';
import { useUpcomingLesson } from '@/hooks/use-upcoming-lesson';
import { FaChalkboard } from 'react-icons/fa';

interface Props {
  id?: string;
  children: React.ReactNode;
  is_own_profile?: boolean;
  hide_user_info?: boolean;
  hide_tabs?: boolean;
}

/**
 * Shared Shell for Student Profile (Personal or Admin view)
 * Handles header, breadcrumbs, tabs navigation and drawer.
 */
export function StudentProfileShell({ 
  id: prop_id, 
  children, 
  is_own_profile,
  hide_user_info,
  hide_tabs,
}: Props) {
  const params = useParams();
  const id = (params?.id as string) || prop_id || '';
  const pathname = usePathname();
  const router = useRouter();
  
  const [drawerOpened, setDrawerOpened] = useState(false);

  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const tNav = useTranslations('Navigation');
  const tProfile = useTranslations('Profile');
  
  const { user: profile_user, is_loading, is_error, error, refresh } = useUserQuery(id as string);
  const { update_user, teachers, current_user, is_mutating } = useUsersQuery();
  const { lesson } = useUpcomingLesson(is_own_profile ? undefined : id as string);
  
  const tCalendar = useTranslations('Calendar.event_modal');

  // Determine active tab based on pathname
  const active_tab = pathname.endsWith('/subscriptions') 
    ? 'subscriptions' 
    : pathname.endsWith('/materials')
      ? 'materials'
      : pathname.endsWith('/tracker')
        ? 'tracker'
        : pathname.endsWith('/recordings')
          ? 'recordings'
          : pathname.endsWith('/security')
            ? 'security'
            : pathname.endsWith('/boards')
              ? 'boards'
              : 'general';

  if (is_loading) {
    return (
      <Box mih={400} className="relative">
        <LoadingOverlay visible zIndex={10} overlayProps={{ blur: 2 }} />
      </Box>
    );
  }

  if (is_error) {
    return (
      <Paper p="xl" withBorder className="bg-red-50/5 border-red-500/20">
        <Stack align="center" gap="sm">
          <Text c="red" fw={500}>{common_t('error')}</Text>
          <Text size="sm" c="dimmed">{(error as any)?.response?.data?.message || (error as any)?.message}</Text>
          <Button onClick={() => refresh()} variant="light" size="xs">
            {common_t('retry') || 'Retry'}
          </Button>
        </Stack>
      </Paper>
    );
  }

  if (!profile_user) {
    return (
      <Paper p="xl" withBorder>
        <Text ta="center">{t('not_found')}</Text>
      </Paper>
    );
  }

  const handle_submit = async (data: any) => {
    await update_user({ id, data });
    setDrawerOpened(false);
    refresh();
  };

  const basePath = is_own_profile ? '/main/profile' : `/main/users/${id}`;

  return (
    <Stack gap="lg">
      {!is_own_profile && current_user?.role !== 'student' && (
        <Group>
          <Button
            component={Link}
            href="/main/users"
            variant="subtle"
            color="secondary"
            leftSection={<IoArrowBackOutline size={16} />}
            size="xs"
            p={0}
            className="hover:translate-x-[-4px] transition-transform text-secondary hover:bg-transparent"
          >
            {t('back_to_list')}
          </Button>
        </Group>
      )}

      {!hide_user_info && (
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" className="flex-col sm:flex-row sm:items-center gap-y-4">
            <Group gap="md" wrap="nowrap" align="flex-start">
              <Avatar src={profile_user.avatar} size="xl" radius="md" className="hidden xs:block shrink-0">
                {profile_user.name.charAt(0)}
              </Avatar>
              <Stack gap={0}>
                <Group gap="md" wrap="wrap">
                  <Title order={2} size="h3" className="sm:text-3xl break-words">{profile_user.name}</Title>
                </Group>
                <Group gap="xs" wrap="wrap">
                  <Text c="dimmed" size="sm" className="hidden sm:block break-all">{profile_user.email}</Text>
                  {profile_user.role === 'student' && current_user?.role !== 'student' && (
                    <Badge 
                      color={profile_user.status === 'active' ? 'green' : 'red'} 
                      variant="outline" 
                      size="sm"
                    >
                      {profile_user.status === 'active' ? t('form.status_active') : t('form.status_inactive')}
                    </Badge>
                  )}
                </Group>

                {lesson && (
                    <Button
                      component={Link}
                      href={`/main/lesson/${lesson.id}`}
                      variant="filled"
                      color="green"
                      size="xs"
                      radius="xl"
                      leftSection={<IoVideocamOutline size={14} />}
                      className="animate-pulse shadow-md hover:scale-105 active:scale-95 transition-all mt-2"
                    >
                      {tCalendar('join_lesson')}
                    </Button>
                )}
              </Stack>
            </Group>
            
          </Group>
        </Stack>
      )}

      <Paper withBorder radius="md" p={0} className="bg-secondary/5 border-secondary/20 overflow-hidden">
        <Tabs 
          value={active_tab} 
          onChange={(val) => {
            const path = val === 'general' ? '' : `/${val}`;
            router.push(`${basePath}${path}`);
          }}
          variant="pills"
          radius="md"
          className="bg-transparent"
        >
          {!hide_tabs && (
            <Tabs.List className="!flex !flex-nowrap px-4 py-3 border-b border-secondary/10 sticky top-0 z-10 overflow-x-auto hide-scrollbar bg-secondary/2 gap-1 sm:gap-2">
              <Tabs.Tab value="general" leftSection={<IoPersonOutline size={16} />} className="whitespace-nowrap shrink-0">
                {t('tabs.general') || 'General'}
              </Tabs.Tab>
              {profile_user.role === 'student' && (
                <>
                  <Tabs.Tab value="subscriptions" leftSection={<IoCardOutline size={16} />} className="whitespace-nowrap shrink-0">
                    {t('tabs.lesson_history')}
                  </Tabs.Tab>
                  {current_user?.role !== 'student' && (
                    <Tabs.Tab value="materials" leftSection={<IoBookOutline size={16} />} className="whitespace-nowrap shrink-0">
                      {tNav('materials') || 'Materials'}
                    </Tabs.Tab>
                  )}
                  {current_user?.role !== 'student' && (
                    <Tabs.Tab value="tracker" leftSection={<IoListOutline size={16} />} className="whitespace-nowrap shrink-0">
                      {tNav('tracker') || 'Tracker'}
                    </Tabs.Tab>
                  )}
                  {current_user?.role !== 'student' && (
                    <Tabs.Tab value="boards" leftSection={<FaChalkboard size={16} />} className="whitespace-nowrap shrink-0">
                      {tNav('boards') || 'Boards'}
                    </Tabs.Tab>
                  )}
                  {current_user?.role !== 'student' && (
                    <Tabs.Tab value="recordings" leftSection={<IoVideocamOutline size={16} />} className="whitespace-nowrap shrink-0">
                      {t('tabs.recordings') || 'Recordings'}
                    </Tabs.Tab>
                  )}
                  {is_own_profile && (
                    <Tabs.Tab value="security" leftSection={<IoShieldCheckmarkOutline size={16} />} className="whitespace-nowrap shrink-0">
                      {tProfile('tabs.security') || 'Security'}
                    </Tabs.Tab>
                  )}
                </>
              )}
            </Tabs.List>
          )}

          <Box p={{ base: 'md', sm: 'xl' }}>
            {active_tab === 'general' && (
              <Group justify="flex-end" mb="lg">
                <Button 
                  leftSection={<IoPencilOutline size={16} />}
                  onClick={() => setDrawerOpened(true)}
                  size="sm"
                  variant="filled"
                  color="primary"
                  className="bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all"
                >
                  {common_t('edit')}
                </Button>
              </Group>
            )}
            {active_tab === 'recordings' && <StudentRecordingsList />}
            {children}
          </Box>
        </Tabs>
      </Paper>

      <UserDrawer 
        opened={drawerOpened}
        on_close={() => setDrawerOpened(false)}
        initial_data={profile_user}
        teachers={teachers}
        current_user={current_user}
        on_submit={handle_submit}
        is_loading={is_mutating}
      />
    </Stack>
  );
}
