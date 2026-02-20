'use client';

import { Tabs, Stack, Title, Paper, Text, Breadcrumbs, Anchor, Box, LoadingOverlay, Group, Avatar, Badge, Button } from '@mantine/core';
import { IoPersonOutline, IoLockClosedOutline, IoCardOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useUserQuery } from './hooks/use-user-query';
import { UserForm } from './components/user-form';
import { useUsersQuery } from './hooks/use-users-query';

import { useParams } from 'next/navigation';

interface Props {
  id?: string;
}

export function UserProfileLayout({ id: prop_id }: Props) {
  const params = useParams();
  const id = (params?.id as string) || prop_id || '';
  
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const tNav = useTranslations('Navigation');
  const { user, is_loading, is_error, error, refresh } = useUserQuery(id as string);
  const { update_user, teachers, current_user, is_mutating } = useUsersQuery();

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

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: tNav('users'), href: '/main/users' },
    { title: user.name, href: `/main/users/${id}` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  const handle_submit = async (data: any) => {
    await update_user({ id, data });
    refresh();
  };

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
                <Text c="dimmed" size="xs">ID: {id}</Text>
                <Text c="dimmed" size="sm">{user.email}</Text>
                <Badge variant="light" size="sm">
                  {common_t(`roles.${user.role}`)}
                </Badge>
              </Group>
            </Stack>
          </Group>
        </Group>
      </Stack>

      <Paper withBorder radius="md" p={0} className="bg-white/5 border-white/10 overflow-hidden">
        <Tabs defaultValue="general" variant="outline" classNames={{
           list: 'pl-5 border-b border-white/10',
           tab: 'h-[50px] border-b-2 border-transparent data-[active=true]:border-blue-500 transition-colors'
        }}>
          <Tabs.List>
            <Tabs.Tab value="general" leftSection={<IoPersonOutline size={16} />}>
              {t('tabs.general') || 'General'}
            </Tabs.Tab>
            {/* Future tabs: Subscriptions, Activity, etc. */}
            {user.role === 'student' && (
              <Tabs.Tab value="subscriptions" leftSection={<IoCardOutline size={16} />}>
                {tNav('subscriptions')}
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="general" p="xl">
            <Box maw={800}>
              <UserForm 
                initial_data={user} 
                teachers={teachers} 
                current_user={current_user} 
                on_submit={handle_submit} 
                is_loading={is_mutating} 
              />
            </Box>
          </Tabs.Panel>

          {user.role === 'student' && (
            <Tabs.Panel value="subscriptions" p="xl">
              <Text c="dimmed">{t('no_subscriptions_yet') || 'Subscriptions list will be here soon...'}</Text>
            </Tabs.Panel>
          )}
        </Tabs>
      </Paper>
    </Stack>
  );
}
