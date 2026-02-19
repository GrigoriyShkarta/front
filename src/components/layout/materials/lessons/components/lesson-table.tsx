'use client';

import { Table, Checkbox, ActionIcon, Group, Text, Menu, rem, useMantineTheme, Badge, Modal, Stack, Tooltip, Paper, Box } from '@mantine/core';
import { IoEllipsisVertical, IoTrashOutline, IoPencilOutline, IoBookOutline, IoLayersOutline } from 'react-icons/io5';
import { LessonMaterial } from '../schemas/lesson-schema';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useState } from 'react';

interface Props {
  data: LessonMaterial[];
  selected_ids: string[];
  on_selection_change: (ids: string[]) => void;
  on_delete: (id: string) => void;
  is_loading?: boolean;
}

export function LessonTable({ data, selected_ids, on_selection_change, on_delete, is_loading }: Props) {
  const t = useTranslations('Materials.lessons.table');
  const common_t = useTranslations('Common');
  const tCat = useTranslations('Categories');
  const theme = useMantineTheme();
  
  const [selectedCourses, setSelectedCourses] = useState<{ id: string, name: string }[]>([]);
  const [modalOpened, setModalOpened] = useState(false);

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
              <Checkbox
                checked={data.length > 0 && selected_ids.length === data.length}
                indeterminate={selected_ids.length > 0 && selected_ids.length < data.length}
                onChange={toggle_all}
              />
            </Table.Th>
            <Table.Th w={40}>{t('actions')}</Table.Th>
            <Table.Th>{t('name')}</Table.Th>
            <Table.Th>{t('courses')}</Table.Th>
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
                    onChange={() => toggle_one(item.id)}
                  />
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={160} position="left-start" withArrow>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IoEllipsisVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown className="bg-[var(--space-card-bg)] border-white/10 backdrop-blur-md">
                      <Menu.Item 
                        leftSection={<IoPencilOutline style={{ width: rem(14), height: rem(14) }} />}
                        component={Link}
                        href={`/main/materials/lessons/${item.id}/edit`}
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
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <IoBookOutline 
                      size={20} 
                      style={{ color: `var(--mantine-color-${theme.primaryColor}-filled)` }} 
                    />
                    <Link 
                      href={`/main/materials/lessons/${item.id}`}
                      className="text-sm font-medium truncate max-w-[400px] hover:opacity-80 transition-opacity"
                    >
                      {item.name}
                    </Link>
                  </Group>
                </Table.Td>
                <Table.Td>
                    {item.courses && item.courses.length > 0 && (
                        <Tooltip label={t('view_courses')}>
                            <ActionIcon 
                                variant="light" 
                                color="secondary" 
                                radius="md"
                                onClick={() => {
                                    setSelectedCourses(item.courses || []);
                                    setModalOpened(true);
                                }}
                            >
                                <IoLayersOutline size={18} />
                            </ActionIcon>
                        </Tooltip>
                    )}
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
      
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={t('courses_title')}
        centered
        radius="md"
      >
        <Stack gap="sm">
            {selectedCourses?.map((course) => (
                <Paper 
                    key={course.id} 
                    withBorder 
                    p="sm" 
                    radius="md" 
                    className="hover:bg-white/5 transition-colors"
                >
                    <Link 
                        href={`/main/materials/courses/${course.id}`}
                        className="text-sm font-medium hover:opacity-80 transition-opacity flex items-start gap-3"
                        onClick={() => setModalOpened(false)}
                    >
                        <Box mt={2} style={{ flexShrink: 0 }}>
                            <IoLayersOutline size={18} />
                        </Box>
                        <Text size="sm" fw={500} className="line-clamp-2">
                            {course.name}
                        </Text>
                    </Link>
                </Paper>
            ))}
        </Stack>
      </Modal>
    </Table.ScrollContainer>
  );
}
