'use client';

import { useState, useEffect } from 'react';
import { Title, Paper, Stack, Box, LoadingOverlay, Breadcrumbs, Anchor, Group } from '@mantine/core';
import { UserTable } from '@/components/layout/users/components/user-table';
import { useUsersQuery } from '@/components/layout/users/hooks/use-users-query';
import { useTranslations } from 'next-intl';
import { useDebouncedValue } from '@mantine/hooks';
import { Link, useRouter } from '@/i18n/routing';
import { UserFilters } from '@/components/layout/users/components/user-filters';
import { useAuth } from '@/hooks/use-auth';

export function TrackerUsersLayout() {
  const t = useTranslations('Tracker');
  const tNav = useTranslations('Navigation');
  const common_t = useTranslations('Common');
  const router = useRouter();
  const { user: current_user_auth } = useAuth();
  
  const [search_query, set_search_query] = useState('');
  const [debounced_search] = useDebouncedValue(search_query, 300);
  const [page, set_page] = useState(1);
  const [limit, set_limit] = useState(15);

  const { 
    users, 
    meta,
    is_loading,
    current_user,
  } = useUsersQuery({
    search: debounced_search || undefined,
    page,
    limit,
    include_subscriptions: true
  });

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: tNav('tracker'), href: '/main/tracker' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  // Redirect to tracker board on user click
  const handle_user_click = (user_id: string) => {
    router.push(`/main/tracker/${user_id}`);
  };

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Breadcrumbs separator="→">{breadcrumb_items}</Breadcrumbs>
        <Title order={2}>{t('users_title')}</Title>
      </Stack>

      <Box mb="xs">
        <UserFilters 
          search={search_query}
          onSearchChange={set_search_query}
        />
      </Box>

      <Paper withBorder radius="md" p={0} className="relative overflow-hidden bg-white/5 backdrop-blur-md border-white/10">
        <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={50} />
        {!is_loading && (
          <Box className="tracker-user-table-wrapper">
             {/* We wrap the UserTable but we'll need to handle the click logic by hijacking the link or using a modified table */}
             {/* For now, we'll use a CSS-based approach or wait to see if we need a custom TrackerUserTable */}
             <UserTable 
                users={users}
                meta={meta}
                page={page}
                limit={limit}
                current_user={current_user}
                selected_users={[]}
                on_page_change={set_page}
                on_limit_change={set_limit}
                on_select={() => {}}
                on_select_all={() => {}}
                on_edit={() => {}}
                on_delete={() => {}}
                on_sort={() => {}}
                user_link_prefix="/main/tracker"
                show_actions={false}
             />
          </Box>
        )}
      </Paper>
    </Stack>
  );
}
