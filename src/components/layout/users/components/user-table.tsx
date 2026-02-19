'use client';

import { Table, Checkbox, Avatar, Group, Text, ActionIcon, Menu, Badge, Pagination, Select, Box } from '@mantine/core';
import { IoEllipsisHorizontal, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import { UserListItem } from '@/schemas/users';
import { useTranslations } from 'next-intl';

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
  on_page_change: (page: number) => void;
  on_limit_change: (limit: number) => void;
  on_select: (id: string) => void;
  on_select_all: () => void;
  on_edit: (user: UserListItem) => void;
  on_delete: (id: string) => void;
}

export function UserTable({ 
  users, 
  meta,
  page,
  limit,
  current_user,
  selected_users, 
  on_page_change,
  on_limit_change,
  on_select, 
  on_select_all, 
  on_edit, 
  on_delete 
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

  const rows = users.map((user) => (
    <Table.Tr key={user.id} className={selected_users.includes(user.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
      <Table.Td>
        <Checkbox
          checked={selected_users.includes(user.id)}
          onChange={() => on_select(user.id)}
        />
      </Table.Td>
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
      <Table.Td>
        <Group gap="sm">
          <Avatar src={user.avatar} radius="xl" size="sm">
            {user.name.charAt(0)}
          </Avatar>
          <Text size="sm" fw={500}>
            {user.name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user.email}</Text>
      </Table.Td>
      {/* <Table.Td>
        <Badge variant="light" size="sm" color={getRoleColor(user.role)}>
          {common_t(`roles.${user.role}`)}
        </Badge>
      </Table.Td> */}
      <Table.Td>
        <Group gap="xs">
          {user.categories?.map((category, index) => (
            <Badge 
              key={index}
              variant="outline"
              color="gray"
              style={{ 
                backgroundColor: category.color || 'transparent',
                color: category.color ? 'var(--mantine-color-white)' : undefined,
                border: category.color ? 'none' : '1px solid var(--mantine-color-gray-4)',
              }}
            >
              {category.name}
            </Badge>
          ))}
        </Group>
      </Table.Td>
      {/* <Table.Td>
        <Text size="sm" c="dimmed">
          {get_attached_name(user)}
        </Text>
      </Table.Td> */}
      
    </Table.Tr>
  ));

  return (
    <Box>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }}>
                <Checkbox
                  checked={all_selected}
                  indeterminate={some_selected}
                  onChange={on_select_all}
                />
              </Table.Th>
              <Table.Th style={{ width: 80 }}>{t('table.actions')}</Table.Th>
              <Table.Th>{t('table.user')}</Table.Th>
              <Table.Th>{t('table.email')}</Table.Th>
              {/* <Table.Th>{t('table.role')}</Table.Th> */}
              <Table.Th>{t('table.categories')}</Table.Th>
              {/* <Table.Th>{t('table.attached_to')}</Table.Th> */}
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
          />
        </Group>
      )}
    </Box>
  );
}
