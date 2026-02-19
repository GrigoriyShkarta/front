'use client';

import { useState, useEffect } from 'react';
import { Title, Group, Button, Paper, Stack, Box, LoadingOverlay } from '@mantine/core';
import { IoAddOutline, IoTrashOutline, IoFilterOutline } from 'react-icons/io5';
import { UserTable } from './components/user-table';
import { UserDrawer } from './components/user-drawer';
import { UserDeleteModal } from './components/user-delete-modal';
import { UserFilters } from './components/user-filters';
import { CategoryFilterDrawer } from '@/components/common/category-filter-drawer';
import { useUsersQuery } from './hooks/use-users-query';
import { UserListItem, UserFormData } from '@/schemas/users';
import { useTranslations } from 'next-intl';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import { Breadcrumbs, Anchor } from '@mantine/core';
import { Link } from '@/i18n/routing';
import { cn } from "@/lib/utils";

export function UsersLayout() {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const tNav = useTranslations('Navigation');
  const [search_query, set_search_query] = useState('');
  const [debounced_search] = useDebouncedValue(search_query, 300);
  const [category_filters, set_category_filters] = useState<string[]>([]);
  const [page, set_page] = useState(1);
  const [limit, set_limit] = useState(15);

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
  }, [debounced_search, category_filters]);

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: tNav('users'), href: '/main/users' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

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

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Breadcrumbs separator="→">{breadcrumb_items}</Breadcrumbs>
        <Group justify="space-between" align="center">
          <Title order={2}>{t('title')}</Title>
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
            variant={category_filters.length > 0 ? "light" : "default"}
            color={category_filters.length > 0 ? "primary" : "gray"}
            leftSection={<IoFilterOutline size={18} />} 
            onClick={open_filter_drawer}
          >
             <Box className="hidden sm:inline">{common_t('filters')}</Box>
             {category_filters.length > 0 && (
                <Box 
                    ml={8} 
                    className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                    style={{ backgroundColor: 'var(--mantine-primary-color-filled)' }}
                >
                    {category_filters.length}
                </Box>
            )}
          </Button>

          <Button 
            leftSection={<IoAddOutline size={20} />} 
            onClick={handle_add_user}
            className="shadow-sm"
          >
            {t('add_button')}
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md" p={0} className="relative overflow-hidden bg-white/5 backdrop-blur-md border-white/10">
        <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={50} />
        {is_loading && <Box mih="calc(100vh - 400px)" />}
        
        {!is_loading && (
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
          />
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

      <CategoryFilterDrawer
        opened={filter_drawer_opened}
        categoryIds={category_filters}
        onClose={close_filter_drawer}
        onCategoryIdsChange={set_category_filters}
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
