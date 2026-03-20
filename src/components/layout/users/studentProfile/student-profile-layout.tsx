'use client';

import { Tabs, Stack, Title, Paper, Text, Breadcrumbs, Anchor, Box, LoadingOverlay, Group, Avatar, Badge, Button } from '@mantine/core';
import { IoPersonOutline, IoCardOutline, IoPencilOutline, IoBookOutline, IoSchoolOutline, IoListOutline, IoVideocamOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useUserQuery } from '../hooks/use-user-query';
import { useUsersQuery } from '../hooks/use-users-query';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { UserDrawer } from '../components/user-drawer';
import { StudentRecordingsList } from './recordings/recordings-list';

interface Props {
  id?: string;
  children: React.ReactNode;
  is_own_profile?: boolean;
  hide_user_info?: boolean;
  hide_tabs?: boolean;
  custom_breadcrumbs?: { title: string; href: string }[];
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
  custom_breadcrumbs,
}: Props) {
  const params = useParams();
  const id = (params?.id as string) || prop_id || '';
  const pathname = usePathname();
  const router = useRouter();
  
  const [drawerOpened, setDrawerOpened] = useState(false);

  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const tNav = useTranslations('Navigation');
  
  const { user, is_loading, is_error, error, refresh } = useUserQuery(id as string);
  const { update_user, teachers, current_user, is_mutating } = useUsersQuery();

  // Determine active tab based on pathname
  const active_tab = pathname.endsWith('/subscriptions') 
    ? 'subscriptions' 
    : pathname.endsWith('/materials')
      ? 'materials'
      : pathname.endsWith('/tracker')
        ? 'tracker'
        : pathname.endsWith('/recordings')
          ? 'recordings'
          : 'general';

  const breadcrumb_items = useMemo(() => {
    const items = custom_breadcrumbs || [
      { title: tNav('dashboard'), href: '/main' },
    ];

    if (!custom_breadcrumbs) {
      if (!is_own_profile) {
        items.push({ title: tNav('users'), href: '/main/users' });
      }

      if (user) {
        items.push({ title: user.name, href: is_own_profile ? '/main/profile' : `/main/users/${id}` });
      }
    }

    return items.map((item, index) => (
      <Anchor component={Link} href={item.href} key={index} size="sm">
        {item.title}
      </Anchor>
    ));
  }, [is_own_profile, tNav, user, id, custom_breadcrumbs]);

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

  if (!user) {
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
      <Breadcrumbs separator="→">{breadcrumb_items}</Breadcrumbs>

      {!hide_user_info && (
        <Stack gap="xs">
          <Group justify="space-between" align="center" wrap="nowrap" className="flex-col sm:flex-row items-start sm:items-center">
            <Group gap="md" wrap="nowrap">
              <Avatar src={user.avatar} size="xl" radius="md" className="hidden xs:block">
                {user.name.charAt(0)}
              </Avatar>
              <Stack gap={0}>
                <Title order={2} size="h3" className="sm:text-3xl">{user.name}</Title>
                <Group gap="xs">
                  <Text c="dimmed" size="sm" className="hidden sm:block">{user.email}</Text>
                  {user.role === 'student' && current_user?.role !== 'student' && (
                    <Badge 
                      color={user.status === 'active' ? 'green' : 'red'} 
                      variant="outline" 
                      size="sm"
                    >
                      {user.status === 'active' ? t('form.status_active') : t('form.status_inactive')}
                    </Badge>
                  )}
                </Group>
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
            <Tabs.List className="px-4 py-3 border-b border-secondary/10 sticky top-0 z-10 overflow-x-auto flex-nowrap hide-scrollbar">
              <Tabs.Tab value="general" leftSection={<IoPersonOutline size={16} />}>
                {t('tabs.general') || 'General'}
              </Tabs.Tab>
              {user.role === 'student' && (
                <>
                  <Tabs.Tab value="subscriptions" leftSection={<IoCardOutline size={16} />}>
                    {t('tabs.lesson_history')}
                  </Tabs.Tab>
                  {current_user?.role !== 'student' && (
                    <Tabs.Tab value="materials" leftSection={<IoBookOutline size={16} />}>
                      {tNav('materials') || 'Materials'}
                    </Tabs.Tab>
                  )}
                  {current_user?.role !== 'student' && (
                    <Tabs.Tab value="tracker" leftSection={<IoListOutline size={16} />}>
                      {tNav('tracker') || 'Tracker'}
                    </Tabs.Tab>
                  )}
                  <Tabs.Tab value="recordings" leftSection={<IoVideocamOutline size={16} />}>
                    {t('tabs.recordings') || 'Recordings'}
                  </Tabs.Tab>
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
        initial_data={user}
        teachers={teachers}
        current_user={current_user}
        on_submit={handle_submit}
        is_loading={is_mutating}
      />
    </Stack>
  );
}
