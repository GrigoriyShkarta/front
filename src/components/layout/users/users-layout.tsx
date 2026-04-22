'use client';

import { useState, useEffect } from 'react';
import { Title, Group, Button, Paper, Stack, Box, LoadingOverlay } from '@mantine/core';
import { IoAddOutline, IoTrashOutline, IoFilterOutline, IoPeopleOutline } from 'react-icons/io5';
import { UserTable } from './components/user-table';
import { UserDrawer } from './components/user-drawer';
import { UserDeleteModal } from './components/user-delete-modal';
import { UserFilters } from './components/user-filters';
import { UserFilterDrawer } from './components/user-filter-drawer';
import { useUsersQuery } from './hooks/use-users-query';
import { UserListItem, UserFormData } from '@/schemas/users';
import { useTranslations } from 'next-intl';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import { Text } from '@mantine/core';

export function UsersLayout() {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const [search_query, set_search_query] = useState('');
  const [debounced_search] = useDebouncedValue(search_query, 300);
  const [category_filters, set_category_filters] = useState<string[]>([]);
  const [page, set_page] = useState(1);
  const [limit, set_limit] = useState(15);
  const [sort_by, set_sort_by] = useState<string | undefined>();
  const [sort_order, set_sort_order] = useState<'asc' | 'desc'>('desc');
  const [payment_statuses_filter, set_payment_statuses_filter] = useState<string[]>([]);

  const { 
    users, 
    meta,
    is_loading, 
    teachers, 
    is_mutating,
    current_user,
    create_user, 
    update_user, 
    delete_user, 
    bulk_delete, 
  } = useUsersQuery({
    search: debounced_search || undefined,
    category_ids: category_filters,
    page,
    limit,
    sortBy: sort_by,
    sortOrder: sort_order,
    payment_statuses: payment_statuses_filter.length > 0 ? payment_statuses_filter : undefined,
    include_subscriptions: true
  });

  const [selected_users, set_selected_users] = useState<string[]>([]);
  const [editing_user, set_editing_user] = useState<UserListItem | null>(null);
  const [delete_id, set_delete_id] = useState<string | null>(null);

  const [drawer_opened, { open: open_drawer, close: close_drawer }] = useDisclosure(false);
  const [delete_opened, { open: open_delete, close: close_delete }] = useDisclosure(false);
  const [bulk_delete_opened, { open: open_bulk_delete, close: close_bulk_delete }] = useDisclosure(false);
  const [filter_drawer_opened, { open: open_filter_drawer, close: close_filter_drawer }] = useDisclosure(false);

  // Reset page when filters change
  useEffect(() => {
    set_page(1);
  }, [debounced_search, category_filters, payment_statuses_filter]);

  const handle_select = (id: string) => {
    set_selected_users(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handle_select_all = () => {
    set_selected_users(prev => prev.length === users.length ? [] : users.map(u => u.id));
  };

  const handle_limit_change = (new_limit: number) => {
    set_limit(new_limit);
    set_page(1);
  };

  const handle_add_user = () => {
    set_editing_user(null);
    open_drawer();
  };

  const handle_edit_user = (user: UserListItem) => {
    set_editing_user(user);
    open_drawer();
  };

  const handle_delete_click = (id: string) => {
    set_delete_id(id);
    open_delete();
  };
  
  const handle_sort = (field: string) => {
    if (sort_by === field) {
      if (sort_order === 'desc') {
        set_sort_order('asc');
      } else {
        set_sort_by(undefined);
        set_sort_order('desc');
      }
    } else {
      set_sort_by(field);
      set_sort_order('desc');
    }
    set_page(1);
  };

  const on_form_submit = async (data: UserFormData) => {
    if (editing_user) {
      await update_user({ id: editing_user.id, data });
    } else {
      await create_user(data);
    }
    close_drawer();
  };

  const on_confirm_delete = async () => {
    if (delete_id) {
      await delete_user(delete_id);
      set_delete_id(null);
      close_delete();
    }
  };

  const on_confirm_bulk_delete = async () => {
    await bulk_delete(selected_users);
    set_selected_users([]);
    close_bulk_delete();
  };

  const has_data = users.length > 0;

  return (
    <Stack gap="lg">
      <Stack gap="lg">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group align="center" gap="md">
            <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
              <IoPeopleOutline size={28} />
            </Box>
            <Stack gap={0}>
              <Title order={2} className="text-[24px] sm:text-[28px] font-bold tracking-tight">
                {t('title')}
              </Title>
              <Text c="dimmed" size="sm" className="hidden sm:block">
                {t('subtitle')}
              </Text>
            </Stack>
          </Group>
        </Group>
      </Stack>

      <Group justify="space-between" align="flex-end" mb="xs">
        <UserFilters 
          search={search_query}
          onSearchChange={set_search_query}
        />
        
        <Group>
          {selected_users.length > 0 && (
            <Button 
               variant="light" 
               color="red" 
               leftSection={<IoTrashOutline size={18} />}
               onClick={open_bulk_delete}
            >
              {common_t('delete_selected')} ({selected_users.length})
            </Button>
          )}

          <Button 
            variant={(category_filters.length > 0 || payment_statuses_filter.length > 0) ? "light" : "default"}
            color={(category_filters.length > 0 || payment_statuses_filter.length > 0) ? "primary" : "gray"}
            leftSection={<IoFilterOutline size={18} />} 
            onClick={open_filter_drawer}
          >
             <Box className="hidden sm:inline">{common_t('filters')}</Box>
             {(category_filters.length > 0 || payment_statuses_filter.length > 0) && (
                <Box 
                    ml={8} 
                    className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                    style={{ backgroundColor: 'var(--mantine-primary-color-filled)' }}
                >
                    {(category_filters.length > 0 ? 1 : 0) + (payment_statuses_filter.length > 0 ? 1 : 0)}
                </Box>
            )}
          </Button>

          <Button 
            leftSection={<IoAddOutline size={20} />} 
            onClick={handle_add_user}
            color="primary"
            className="bg-primary shadow-md hover:shadow-lg transition-all"
          >
            {t('add_button')}
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md" p={0} className="relative overflow-hidden bg-white/5 backdrop-blur-md border-white/10">
        <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={50} />
        {is_loading && <Box mih="calc(100vh - 400px)" />}
        
        {!is_loading && (
          has_data ? (
            <UserTable 
              users={users}
              meta={meta}
              page={page}
              limit={limit}
              current_user={current_user}
              selected_users={selected_users}
              on_page_change={set_page}
              on_limit_change={handle_limit_change}
              on_select={handle_select}
              on_select_all={handle_select_all}
              on_edit={handle_edit_user}
              on_delete={handle_delete_click}
              sort_by={sort_by}
              sort_order={sort_order}
              on_sort={handle_sort}
            />
          ) : (
            <Stack align="center" gap="md" py={60}>
              <Box 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ 
                  backgroundColor: 'var(--mantine-primary-color-light)',
                  color: 'var(--mantine-primary-color-filled)',
                  border: '1px solid var(--mantine-primary-color-light-hover)',
                  boxShadow: '0 0 20px rgba(var(--mantine-primary-color-filled-rgb), 0.15)'
                }}
              >
                <IoPeopleOutline size={40} />
              </Box>
              <Text fw={500} size="lg">{t('empty_title') || common_t('no_data')}</Text>
              <Text c="dimmed" size="sm" ta="center" maw={400}>
                {t('empty_description') || 'No users found'}
              </Text>
              <Button variant="light" mt="sm" onClick={handle_add_user} className="!bg-primary/10 !text-primary hover:!bg-primary/20 transition-colors">
                {t('add_button')}
              </Button>
            </Stack>
          )
        )}
      </Paper>

      <UserDrawer 
        opened={drawer_opened}
        initial_data={editing_user}
        teachers={teachers}
        current_user={current_user}
        is_loading={is_mutating}
        on_submit={on_form_submit}
        on_close={close_drawer}
      />

      <UserFilterDrawer
        opened={filter_drawer_opened}
        categoryIds={category_filters}
        onCategoryIdsChange={set_category_filters}
        paymentStatuses={payment_statuses_filter}
        onPaymentStatusesChange={set_payment_statuses_filter}
        onClose={close_filter_drawer}
      />

      <UserDeleteModal 
        opened={delete_opened}
        is_loading={is_mutating}
        on_close={close_delete}
        on_confirm={on_confirm_delete}
      />

      <UserDeleteModal 
        opened={bulk_delete_opened}
        is_loading={is_mutating}
        on_close={close_bulk_delete}
        on_confirm={on_confirm_bulk_delete}
        is_bulk
      />
    </Stack>
  );
}
