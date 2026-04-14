import { Table, Checkbox, Text, Group, Badge, useMantineTheme } from '@mantine/core';
import { IoBookOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Props {
  lessons: any[];
  on_toggle_access: (lesson_id: string, has_access: boolean) => void;
  is_mutating: boolean;
}

export function AdditionalMaterialsTable({ lessons, on_toggle_access, is_mutating }: Props) {
  const t = useTranslations('Materials');
  const theme = useMantineTheme();

  return (
    <Table.ScrollContainer minWidth={500}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={40}>{t('additional.access') || 'Access'}</Table.Th>
            <Table.Th>{t('additional.name') || 'Lesson Name'}</Table.Th>
            <Table.Th>{t('additional.categories') || 'Categories'}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lessons.map((lesson) => (
            <Table.Tr key={lesson.id}>
              <Table.Td>
                <Checkbox 
                  checked={lesson.has_access}
                  onChange={(e) => on_toggle_access(lesson.id, e.currentTarget.checked)}
                  disabled={is_mutating}
                />
              </Table.Td>
              <Table.Td>
                <Group gap="sm" wrap="nowrap">
                  <IoBookOutline 
                    size={20} 
                    style={{ color: 'var(--space-secondary)' }} 
                  />
                  <Link 
                    href={`/main/materials/lessons/${lesson.id}`}
                    className="text-sm font-medium hover:opacity-80 transition-opacity truncate max-w-[400px]"
                  >
                    {lesson.name}
                  </Link>
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap={4}>
                  {lesson.categories?.map((cat: any) => (
                    <Badge 
                      key={cat.id} 
                      variant="light" 
                      size="xs" 
                      color={cat.color || 'primary'}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                  {(!lesson.categories || lesson.categories.length === 0) && (
                    <Text size="xs" c="dimmed">-</Text>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          {lessons.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text ta="center" py="xl" c="dimmed">
                  {t('additional.no_lessons') || 'No lessons found'}
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
