'use client';

import { Table, Checkbox, Avatar, Group, Text, ActionIcon, Menu, Badge, Pagination, Select, Box } from '@mantine/core';
import { IoEllipsisHorizontal, IoPencilOutline, IoTrashOutline, IoArrowUpOutline, IoArrowDownOutline, IoSwapVerticalOutline } from 'react-icons/io5';
import { UserListItem } from '@/schemas/users';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface Props {
  users: UserListItem[];
  meta?: {
    current_page: number;
    total_pages: number;
    total_items: number;
  };
  page: number;
  limit: number;
  current_user: any;
  selected_users: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  user_link_prefix?: string;
  show_actions?: boolean;
  on_page_change: (page: number) => void;
  on_limit_change: (limit: number) => void;
  on_select: (id: string) => void;
  on_select_all: () => void;
  on_edit: (user: UserListItem) => void;
  on_delete: (id: string) => void;
  on_sort: (field: string) => void;
}

export function UserTable({ 
  users, 
  meta,
  page,
  limit,
  current_user,
  selected_users, 
  sort_by,
  sort_order,
  user_link_prefix = '/main/users',
  show_actions = true,
  on_page_change,
  on_limit_change,
  on_select, 
  on_select_all,
  on_edit, 
  on_delete,
  on_sort,
}: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');

  const all_selected = users.length > 0 && selected_users.length === users.length;
  const some_selected = selected_users.length > 0 && selected_users.length < users.length;

  const get_attached_name = (user: UserListItem) => {
    if (user.role === 'super_admin') return '-';
    
    // 1. If teacher_id is present, try to find the teacher
    if (user.teacher_id) {
      if (user.teacher?.name) return user.teacher.name;
      const found_teacher = users.find(u => u.id === user.teacher_id);
      if (found_teacher) return found_teacher.name;
    }
    
    // 2. If no teacher or teacher_id is null, look for super admin
    const specific_admin = users.find(u => u.id === user.super_admin_id);
    if (specific_admin) return specific_admin.name;
    
    if (current_user?.id === user.super_admin_id) return current_user.name;
    
    const any_admin = users.find(u => u.role === 'super_admin');
    if (any_admin) return any_admin.name;
    
    return common_t('roles.super_admin');
  };

  const rows = users.map((user) => {
    const subs = (user as any).purchased_subscriptions || [];
    const latest_sub = [...subs].sort((a, b) => {
      const date_a = a.next_payment_date || a.created_at;
      const date_b = b.next_payment_date || b.created_at;
      return new Date(date_b).getTime() - new Date(date_a).getTime();
    })[0];
    const last_sub = latest_sub;
    const is_partially_paid = last_sub?.payment_status === 'partially_paid';
    
    // If partially paid, we prioritize partial_payment_date for this column
    const displayed_date = is_partially_paid 
      ? last_sub?.partial_payment_date 
      : last_sub?.next_payment_date;

    const is_overdue = displayed_date && dayjs(displayed_date).isBefore(dayjs(), 'day');

    return (
      <Table.Tr key={user.id} className={selected_users.includes(user.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}>
        {show_actions && (
          <Table.Td>
            <Checkbox
              checked={selected_users.includes(user.id)}
              onChange={() => on_select(user.id)}
            />
          </Table.Td>
        )}
        {show_actions && (
          <Table.Td>
            <Menu shadow="md" width={160} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IoEllipsisHorizontal size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item 
                leftSection={<IoPencilOutline size={14} />} 
                onClick={() => on_edit(user)}
              >
                {common_t('edit')}
              </Menu.Item>
              <Menu.Item 
                leftSection={<IoTrashOutline size={14} />} 
                color="red"
                onClick={() => on_delete(user.id)}
              >
                {common_t('delete')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
        )}
        <Table.Td>
          <Box component={Link} href={`${user_link_prefix}/${user.id}`} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar 
              src={user.avatar} 
              radius="xl" 
              size="md"
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              {user.name.charAt(0)}
            </Avatar>
            <Text 
              size="sm" 
              fw={500}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              {user.name}
            </Text>
          </Box>
        </Table.Td>
        <Table.Td>
          {user.role === 'student' && (
            <Badge 
              variant="light" 
              size="sm"
              className={cn(
                user.status === 'active' 
                  ? '!text-green-500 !bg-green-500/10' 
                  : '!text-red-500 !bg-red-500/10'
              )}
            >
              {user.status === 'active' ? t('form.status_active') : t('form.status_inactive')}
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          {(user.role === 'student' || last_sub) && (
            <Badge 
              variant="light" 
              size="sm"
              className={cn(
                last_sub?.payment_status === 'paid' ? '!text-green-500 !bg-green-500/10' : 
                last_sub?.payment_status === 'partially_paid' ? '!text-yellow-500 !bg-yellow-500/10' : 
                last_sub?.payment_status === 'unpaid' ? '!text-red-500 !bg-red-500/10' :
                '!text-zinc-500 !bg-zinc-500/10'
              )}
            >
              {last_sub?.payment_status 
                ? common_t(`payment_statuses.${last_sub.payment_status}`) 
                : '-'}
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          {displayed_date ? (
            <Text 
              size="sm" 
              c={is_overdue ? 'red' : undefined}
              fw={is_overdue ? 700 : undefined}
            >
              {dayjs(displayed_date).format('DD.MM.YYYY')}
            </Text>
          ) : (
            <Text size="sm" c="dimmed">-</Text>
          )}
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            {user.categories?.map((category, index) => (
              <Badge 
                key={index}
                variant="outline"
                color="gray"
                style={{ 
                  backgroundColor: category.color || 'transparent',
                  color: category.color ? 'var(--space-primary-text)' : undefined,
                  border: category.color ? 'none' : '1px solid var(--mantine-color-gray-4)',
                }}
              >
                {category.name}
              </Badge>
            ))}
          </Group>
        </Table.Td>
        
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {show_actions && (
                <Table.Th style={{ width: 40 }}>
                  <Checkbox
                    checked={all_selected}
                    indeterminate={some_selected}
                    onChange={on_select_all}
                  />
                </Table.Th>
              )}
              {show_actions && <Table.Th style={{ width: 80 }}>{t('table.actions')}</Table.Th>}
              <Table.Th>{t('table.user')}</Table.Th>
              <Table.Th>{t('table.status')}</Table.Th>
              <Table.Th>{t('table.payment_status')}</Table.Th>
              <Table.Th 
                className="cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => on_sort('next_payment_date')}
              >
                <Group gap={4}>
                  <Text size="sm" fw={700}>{t('table.next_payment_date')}</Text>
                  {sort_by === 'next_payment_date' ? (
                    sort_order === 'asc' ? <IoArrowUpOutline size={14} style={{ color: 'var(--space-primary)' }} /> : <IoArrowDownOutline size={14} style={{ color: 'var(--space-primary)' }} />
                  ) : (
                    <IoSwapVerticalOutline size={14} color="gray" />
                  )}
                </Group>
              </Table.Th>
              <Table.Th>{t('table.categories')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {meta && (
        <Group justify="center" p="md" className="border-t border-white/10">
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {common_t('show')}
            </Text>
            <Select
              data={['15', '30', '50']}
              value={limit.toString()}
              onChange={(val) => on_limit_change(Number(val))}
              size="xs"
              w={70}
            />
            <Text size="sm" c="dimmed">
              {common_t('per_page')}
            </Text>
          </Group>

          <Pagination
            total={meta.total_pages}
            value={page}
            onChange={on_page_change}
            size="sm"
            withEdges
            boundaries={1}
            siblings={1}
            color="primary"
          />
        </Group>
      )}
    </Box>
  );
}
