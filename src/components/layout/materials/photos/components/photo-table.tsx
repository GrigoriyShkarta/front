'use client';

import { Table, Checkbox, ActionIcon, Group, Text, Box, Menu, rem, Tooltip, Image, Badge } from '@mantine/core';
import { IoEllipsisVertical, IoTrashOutline, IoPencilOutline, IoImageOutline } from 'react-icons/io5';
import { PhotoMaterial } from '../schemas/photo-schema';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

interface Props {
  data: PhotoMaterial[];
  selected_ids: string[];
  on_selection_change: (ids: string[]) => void;
  on_edit: (photo: PhotoMaterial) => void;
  on_delete: (id: string) => void;
  on_preview: (photo: PhotoMaterial) => void;
  on_select?: (photo: PhotoMaterial) => void;
  is_loading?: boolean;
  is_picker?: boolean;
}

export function PhotoTable({ 
    data, 
    selected_ids, 
    on_selection_change, 
    on_edit, 
    on_delete, 
    on_preview, 
    on_select, 
    is_loading,
    is_picker = false
}: Props) {
  const t = useTranslations('Materials.photo.table');
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');

  const toggle_all = () => {
    on_selection_change(
      selected_ids.length === data.length ? [] : data.map((item) => item.id)
    );
  };

  const toggle_one = (id: string) => {
    on_selection_change(
      selected_ids.includes(id)
        ? selected_ids.filter((i) => i !== id)
        : [...selected_ids, id]
    );
  };

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead className="bg-white/5 border-b border-white/10">
          <Table.Tr>
            <Table.Th w={40}>
              {!is_picker && (
                <Checkbox
                  checked={data.length > 0 && selected_ids.length === data.length}
                  indeterminate={selected_ids.length > 0 && selected_ids.length < data.length}
                  onChange={toggle_all}
                />
              )}
            </Table.Th>
            {!is_picker && <Table.Th w={40}>{t('actions')}</Table.Th>}
            <Table.Th w={100}>{t('preview')}</Table.Th>
            <Table.Th>{t('name')}</Table.Th>
            <Table.Th>{tCat('title')}</Table.Th>
            <Table.Th>{t('date')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item) => {
            const is_selected = selected_ids.includes(item.id);
            return (
              <Table.Tr 
                key={item.id} 
                className={cn(
                  'transition-colors border-b border-white/5 last:border-0',
                  is_selected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-white/5'
                )}
              >
                <Table.Td>
                  <Checkbox
                    checked={is_selected}
                    onChange={() => {
                      if (is_picker && on_select) {
                        on_select(item);
                      } else {
                        toggle_one(item.id);
                      }
                    }}
                  />
                </Table.Td>
                {!is_picker && (
                  <Table.Td>
                    <Menu shadow="md" width={160} position="left-start" withArrow>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IoEllipsisVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown className="bg-[var(--space-card-bg)] border-white/10 backdrop-blur-md">
                        {on_select && (
                          <Menu.Item 
                            leftSection={<IoImageOutline style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => on_select(item)}
                            color="blue"
                          >
                            {common_t('confirm')}
                          </Menu.Item>
                        )}
                        <Menu.Item 
                          leftSection={<IoPencilOutline style={{ width: rem(14), height: rem(14) }} />}
                          onClick={() => on_edit(item)}
                        >
                          {common_t('edit')}
                        </Menu.Item>
                        <Menu.Item 
                          color="red"
                          leftSection={<IoTrashOutline style={{ width: rem(14), height: rem(14) }} />}
                          onClick={() => on_delete(item.id)}
                        >
                          {common_t('delete')}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                )}
                <Table.Td className="cursor-pointer" onClick={() => on_preview(item)}>
                  <Image
                    src={item.file_url}
                    w={60}
                    h={40}
                    radius="sm"
                    fit="cover"
                    fallbackSrc="https://placehold.co/60x40?text=No+Image"
                  />
                </Table.Td>
                <Table.Td className="cursor-pointer" onClick={() => on_preview(item)}>
                  <Group gap="sm" wrap="nowrap">
                    <Box 
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm"
                      style={{ 
                        backgroundColor: 'var(--mantine-primary-color-light)',
                        color: 'var(--mantine-primary-color-filled)',
                        border: '1px solid var(--mantine-primary-color-light-hover)'
                      }}
                    >
                      <IoImageOutline size={16} />
                    </Box>
                    <Tooltip label={item.name} position="top-start" withArrow multiline maw={300}>
                      <Text size="sm" fw={500} className="truncate max-w-[600px]">
                        {item.name}
                      </Text>
                    </Tooltip>
                  </Group>
                </Table.Td>
                <Table.Td>
                    <Group gap={4}>
                        {item.categories?.map((cat) => (
                            <Badge key={cat.id} color={cat.color || 'blue'} variant="light" size="xs">
                                {cat.name}
                            </Badge>
                        ))}
                    </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {dayjs(item.created_at).format('DD.MM.YYYY')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
