'use client';

import { Table, Group, ActionIcon, Menu, ColorSwatch, Text, Checkbox } from '@mantine/core';
import { IoEllipsisVertical, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { CategoryMaterial } from '../schemas/category-schema';

interface Props {
  data: CategoryMaterial[];
  selected_ids: string[];
  on_select: (ids: string[]) => void;
  on_edit: (category: CategoryMaterial) => void;
  on_delete: (id: string) => void;
}

export function CategoryTable({ data, selected_ids, on_select, on_edit, on_delete }: Props) {
  const t = useTranslations('Categories');
  const common_t = useTranslations('Common');

  const handle_selection = (id: string) => {
    on_select(
      selected_ids.includes(id)
        ? selected_ids.filter((i) => i !== id)
        : [...selected_ids, id]
    );
  };

  const handle_select_all = () => {
    on_select(
      selected_ids.length === data.length ? [] : data.map((item) => item.id)
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 40 }}>
              <Checkbox
                checked={selected_ids.length === data.length && data.length > 0}
                indeterminate={selected_ids.length > 0 && selected_ids.length < data.length}
                onChange={handle_select_all}
              />
            </Table.Th>
            <Table.Th style={{ width: 80 }}>{t('table.actions')}</Table.Th>
            <Table.Th>{t('table.name')}</Table.Th>
            <Table.Th>{t('table.color')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <Checkbox
                  checked={selected_ids.includes(item.id)}
                  onChange={() => handle_selection(item.id)}
                />
              </Table.Td>
              <Table.Td>
                <Group>
                  <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IoEllipsisVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IoPencilOutline size={14} />}
                        onClick={() => on_edit(item)}
                      >
                        {common_t('edit')}
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<IoTrashOutline size={14} />}
                        onClick={() => on_delete(item.id)}
                      >
                        {common_t('delete')}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={500}>{item.name}</Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ColorSwatch color={item?.color ?? ''} size={16} />
                  <Text size="xs" c="dimmed" ff="monospace">{item?.color?.toUpperCase() ?? ''}</Text>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          {data.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={4} align="center" py="xl">
                <Text c="dimmed">{t('table.empty')}</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </div>
  );
}
