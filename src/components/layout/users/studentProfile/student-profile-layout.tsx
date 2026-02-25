'use client';

import { Tabs, Stack, Title, Paper, Text, Breadcrumbs, Anchor, Box, LoadingOverlay, Group, Avatar, Badge, Button } from '@mantine/core';
import { IoPersonOutline, IoCardOutline, IoPencilOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useUserQuery } from '../hooks/use-user-query';
import { useUsersQuery } from '../hooks/use-users-query';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { UserDrawer } from '../components/user-drawer';

interface Props {
  id?: string;
  children: React.ReactNode;
  is_own_profile?: boolean;
}

/**
 * Shared Shell for Student Profile (Personal or Admin view)
 * Handles header, breadcrumbs, tabs navigation and drawer.
 */
export function StudentProfileShell({ id: prop_id, children, is_own_profile }: Props) {
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
  const active_tab = pathname.endsWith('/subscriptions') ? 'subscriptions' : 'general';

  const breadcrumb_items = useMemo(() => {
    const items = [
      { title: tNav('dashboard'), href: '/main' },
    ];

    if (!is_own_profile) {
      items.push({ title: tNav('users'), href: '/main/users' });
    }

    if (user) {
      items.push({ title: user.name, href: is_own_profile ? '/main/profile' : `/main/users/${id}` });
    }

    return items.map((item, index) => (
      <Anchor component={Link} href={item.href} key={index} size="sm">
        {item.title}
      </Anchor>
    ));
  }, [is_own_profile, tNav, user, id]);

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
      <Stack gap="xs">
        <Breadcrumbs separator="→">{breadcrumb_items}</Breadcrumbs>
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Avatar src={user.avatar} size="xl" radius="md">
              {user.name.charAt(0)}
            </Avatar>
            <Stack gap={0}>
              <Title order={2}>{user.name}</Title>
              <Group gap="xs">
                <Text c="dimmed" size="sm">{user.email}</Text>
                <Badge variant="light" size="sm">
                  {common_t(`roles.${user.role}`)}
                </Badge>
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

      <Paper withBorder radius="md" p={0} className="bg-white/5 border-white/10 overflow-hidden">
        <Tabs 
          value={active_tab} 
          variant="outline" 
          onChange={(val) => {
            if (val === 'general') router.push(basePath);
            if (val === 'subscriptions') router.push(`${basePath}/subscriptions`);
          }}
          classNames={{
            list: 'pl-5 border-b border-white/10',
            tab: 'h-[50px] border-b-2 border-transparent data-[active=true]:border-blue-500 transition-colors'
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="general" leftSection={<IoPersonOutline size={16} />}>
              {t('tabs.general') || 'General'}
            </Tabs.Tab>
            {user.role === 'student' && (
              <Tabs.Tab value="subscriptions" leftSection={<IoCardOutline size={16} />}>
                {tNav('subscriptions')}
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Box p="xl">
            {active_tab === 'general' && (
              <Group justify="flex-end" mb="lg">
                <Button 
                  variant="light" 
                  leftSection={<IoPencilOutline size={16} />}
                  onClick={() => setDrawerOpened(true)}
                >
                  {common_t('edit')}
                </Button>
              </Group>
            )}
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
