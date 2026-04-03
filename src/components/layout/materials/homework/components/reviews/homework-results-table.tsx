'use client';

import { Table, Avatar, Group, Text, Badge } from '@mantine/core';
import { useRouter } from '@/i18n/routing';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { HomeworkSubmission } from '../../actions/homework-submission-actions';

interface Props {
  submissions: (HomeworkSubmission & { 
    homework?: { 
      name: string; 
      lesson_id?: string; 
      lesson?: { name: string; id: string } 
    } 
  })[];
  on_view: (submission_id: string) => void;
}

/**
 * Flat table for student homework submissions.
 * Optimized for admin dashboard overview to match TestResults style.
 */
export function HomeworkResultsTable({ submissions, on_view }: Props) {
  const t = useTranslations('Materials.homework.reviews');
  const router = useRouter();

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead className="bg-white/5 border-b border-white/10">
          <Table.Tr>
            <Table.Th className="px-5">{t('table.student')}</Table.Th>
            <Table.Th>{t('table.lesson')}</Table.Th>
            <Table.Th>{t('table.date')}</Table.Th>
            <Table.Th>{t('table.status')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {submissions.map((sub) => {
            const is_reviewed = sub.status === 'reviewed';
            return (
              <Table.Tr
                key={sub.id}
                className="transition-colors border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer"
                onClick={() => on_view(sub.id)}
              >
                <Table.Td className="px-5">
                  <Group gap="sm" wrap="nowrap">
                    <Avatar 
                      src={sub.student?.avatar_url} 
                      size={32}
                      radius="xl" 
                    >
                      {sub.student?.name?.charAt(0)}
                    </Avatar>
                    <Text size="sm" fw={500} className="truncate max-w-[200px]">
                      {sub.student?.name || t('unknown_student')}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text 
                    size="sm" 
                    fw={600} 
                    className="truncate max-w-[250px] cursor-pointer hover:underline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      const lesson_id = sub.homework?.lesson?.id || sub.homework?.lesson_id;
                      if (lesson_id) router.push(`/main/materials/lessons/${lesson_id}`);
                    }}
                  >
                    {sub.homework?.lesson?.name || sub.homework?.name || '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {dayjs(sub.created_at).format('DD.MM.YYYY HH:mm')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {is_reviewed ? (
                    <Badge
                      color="teal"
                      variant="light"
                      size="sm"
                    >
                      {t('status_reviewed')}
                    </Badge>
                  ) : (
                    <Badge
                      color="orange"
                      variant="light"
                      size="sm"
                    >
                      {t('status_pending')}
                    </Badge>
                  )}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
