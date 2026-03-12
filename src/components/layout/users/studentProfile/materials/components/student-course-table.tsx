'use client';

import { 
  Table, 
  Group, 
  Stack, 
  Text, 
  Badge, 
  Avatar, 
  Progress,
  UnstyledButton,
  Box
} from '@mantine/core';
import { IoImageOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { StudentCourseItem } from '../schemas/materials-schema';
import dayjs from 'dayjs';

interface Props {
  data: StudentCourseItem[];
  is_loading?: boolean;
  on_course_click: (course: StudentCourseItem) => void;
}

export function StudentCourseTable({ data, is_loading, on_course_click }: Props) {
  const t = useTranslations('Materials.courses');
  const common_t = useTranslations('Common');

  const rows = data.map((item) => (
    <Table.Tr 
      key={item.id} 
      className="hover:bg-white/5 transition-colors cursor-pointer"
      onClick={() => on_course_click(item)}
    >
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Avatar 
            src={item.image_url} 
            radius="md" 
            size="md"
            className="bg-white/10"
          >
            <IoImageOutline size={20} />
          </Avatar>
          <Stack gap={0}>
            <Text size="sm" fw={600} className="line-clamp-1">{item.name}</Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          {item.categories && item.categories.length > 0 ? (
            item.categories.slice(0, 2).map((cat) => (
              <Badge 
                key={cat.id} 
                size="xs" 
                variant="outline"
                style={{ color: cat.color, borderColor: cat.color }}
              >
                {cat.name}
              </Badge>
            ))
          ) : item.category ? (
            <Badge 
              size="xs" 
              variant="outline"
              style={{ color: item.category.color, borderColor: item.category.color }}
            >
              {item.category.name}
            </Badge>
          ) : (
            <Text size="xs" c="dimmed">-</Text>
          )}
          {item.categories && item.categories.length > 2 && (
            <Badge size="xs" variant="outline" color="gray">+{item.categories.length - 2}</Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Stack gap={4} w={120}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">{t('table.progress') || 'Progress'}</Text>
            <Text size="xs" fw={500}>{item.progress_percentage}%</Text>
          </Group>
          <Progress value={item.progress_percentage} size="xs" radius="xl" color="primary" />
        </Stack>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm">
        <Table.Thead className="bg-white/2">
          <Table.Tr>
            <Table.Th>{t('table.name') || 'Name'}</Table.Th>
            <Table.Th>{t('table.categories') || 'Categories'}</Table.Th>
            <Table.Th>{t('table.progress') || 'Progress'}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.length > 0 ? rows : (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text ta="center" py="xl" c="dimmed">
                  {common_t('no_data') || 'No data'}
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
