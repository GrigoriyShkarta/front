'use client';

import {
  Table,
  Badge,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Avatar,
  Stack,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoEyeOutline, IoCheckmarkCircleOutline, IoTimeOutline, IoPersonOutline } from 'react-icons/io5';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

import { HomeworkSubmission } from '../../actions/homework-submission-actions';

interface Props {
  submissions: HomeworkSubmission[];
  homework_name?: string;
  on_review: (submission: HomeworkSubmission) => void;
}

/**
 * Table displaying homework submissions for a specific homework.
 * @param props - Submissions list, homework name, and review handler
 */
export function HomeworkSubmissionsTable({ submissions, homework_name, on_review }: Props) {
  const t = useTranslations('Materials.homework.reviews');
  const common_t = useTranslations('Common');

  return (
    <Table.ScrollContainer minWidth={600} className="px-5 py-2">
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead className="bg-white/2 border-b border-white/5">
          <Table.Tr>
            <Table.Th className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">{t('table.student')}</Table.Th>
            {homework_name && <Table.Th className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">{t('table.homework')}</Table.Th>}
            <Table.Th className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">{t('table.date')}</Table.Th>
            <Table.Th className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">{t('table.status')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {submissions.map((sub) => {
            const is_reviewed = sub.status === 'reviewed';
            return (
              <Table.Tr
                key={sub.id}
                className={cn(
                  'transition-all border-b border-white/[0.03] last:border-0 hover:bg-white/[0.05] cursor-pointer',
                  !is_reviewed && 'bg-primary/5'
                )}
                onClick={() => on_review(sub)}
              >
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar 
                      src={sub.student?.avatar_url} 
                      color="primary" 
                      radius="xl" 
                      size="md"
                      className="border border-white/10 shadow-sm"
                    >
                      {sub.student?.name?.charAt(0) || <IoPersonOutline size={16} />}
                    </Avatar>
                    <Stack gap={0}>
                      <Text size="sm" fw={600} className="truncate max-w-[200px]">
                        {sub.student?.name || t('unknown_student')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {sub.student?.email || sub.student_id.slice(0, 8)}
                      </Text>
                    </Stack>
                  </Group>
                </Table.Td>
                {homework_name && (
                  <Table.Td>
                    <Text size="sm" fw={500} className="truncate max-w-[200px]">{homework_name}</Text>
                  </Table.Td>
                )}
                <Table.Td>
                  <Text size="sm" c="dimmed" fw={500}>
                    {dayjs(sub.created_at).format('DD.MM.YYYY HH:mm')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {is_reviewed ? (
                    <Badge
                      color="teal"
                      variant="light"
                      size="sm"
                      radius="md"
                      className="h-7 border border-teal-500/20"
                      leftSection={<IoCheckmarkCircleOutline size={14} />}
                    >
                      {t('status_reviewed')}
                    </Badge>
                  ) : (
                    <Badge
                      color="orange"
                      variant="outline"
                      size="sm"
                      radius="md"
                      className="h-7 animate-pulse border-orange-500/30"
                      leftSection={<IoTimeOutline size={14} />}
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
