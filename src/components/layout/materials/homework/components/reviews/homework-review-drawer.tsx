'use client';

import { useState, useEffect } from 'react';

import {
  Drawer,
  Stack,
  Text,
  Badge,
  Group,
  Textarea,
  Button,
  Divider,
  Box,
  Paper,
  Avatar,
  LoadingOverlay,
  Anchor,
  NumberInput,
  Title,
  ThemeIcon,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoCheckmarkCircleOutline, IoTimeOutline, IoAttachOutline, IoPersonOutline, IoStarOutline, IoReaderOutline, IoChatbubbleOutline } from 'react-icons/io5';
import dayjs from 'dayjs';

import { HomeworkSubmission } from '../../actions/homework-submission-actions';

interface Props {
  submission: HomeworkSubmission | null;
  opened: boolean;
  on_close: () => void;
  on_review: (submission_id: string, feedback: string, score: number) => Promise<void>;
  is_reviewing: boolean;
}

/**
 * Drawer to review a single homework submission.
 * Redesigned to match the premium test review style.
 */
export function HomeworkReviewDrawer({ submission, opened, on_close, on_review, is_reviewing }: Props) {
  const t = useTranslations('Materials.homework.reviews');
  const common_t = useTranslations('Common');
  const [feedback, set_feedback] = useState('');
  const [score, set_score] = useState<number | string>(0);

  useEffect(() => {
    if (submission) {
      set_feedback(submission.feedback || '');
      set_score(submission.score || 0);
    }
  }, [submission?.id]);

  const handle_submit = async () => {
    if (!submission) return;
    await on_review(submission.id, feedback, typeof score === 'string' ? parseInt(score) : score);
  };

  const is_reviewed = submission?.status === 'reviewed';

  return (
    <Drawer
      opened={opened}
      onClose={on_close}
      title={
        <Group gap="sm">
          <ThemeIcon variant="light" color="primary" size="md" radius="md">
            <IoReaderOutline size={18} />
          </ThemeIcon>
          <Text fw={700} size="lg" className="tracking-tight">{t('drawer_title') || 'Review Submission'}</Text>
        </Group>
      }
      position="right"
      size="xl"
      padding={0}
      styles={{
        header: { 
          padding: '20px 24px', 
          borderBottom: '1px solid rgba(255,255,255,0.05)', 
          margin: 0,
          backgroundColor: 'rgba(255,255,255,0.02)'
        },
        content: { backgroundColor: '#0c0c0d' }
      }}
    >
      <Box pos="relative" className="h-full">
        <LoadingOverlay visible={is_reviewing} overlayProps={{ blur: 2 }} zIndex={100} />

        {submission && (
          <Stack gap={0} className="h-full">
            {/* Header / Student Card */}
            <Box className="p-6 border-b border-white/5 bg-white/[0.02]">
              <Group justify="space-between" align="flex-start">
                <Group gap="md">
                  <Avatar 
                    src={submission.student?.avatar_url} 
                    size={60} 
                    radius="xl" 
                    className="border-2 border-primary/20 shadow-lg"
                  >
                    {submission.student?.name?.charAt(0) || <IoPersonOutline size={24} />}
                  </Avatar>
                  <Stack gap={4}>
                    <Text fw={800} size="xl" className="tracking-tight">{submission.student?.name || t('unknown_student')}</Text>
                    <Group gap="xs" c="dimmed">
                      <Group gap={4}>
                        <IoTimeOutline size={14} />
                        <Text size="xs" fw={500}>{dayjs(submission.created_at).format('DD.MM.YYYY HH:mm')}</Text>
                      </Group>
                      <Text size="xs">·</Text>
                      <Text size="xs" fw={500}>{submission.student?.email || submission.student_id.slice(0, 8)}</Text>
                    </Group>
                  </Stack>
                </Group>
                <Badge
                  size="lg"
                  radius="md"
                  variant="light"
                  color={is_reviewed ? 'teal' : 'orange'}
                  className="mt-1 border border-white/5"
                  leftSection={is_reviewed ? <IoCheckmarkCircleOutline size={16} /> : <IoTimeOutline size={16} />}
                >
                  {is_reviewed ? t('status_reviewed') : t('status_pending')}
                </Badge>
              </Group>
            </Box>

            {/* Content Area */}
            <Box className="p-6 flex-1 overflow-y-auto">
              <Stack gap="xl" maw={800} mx="auto">
                
                {/* Answer Section */}
                <Stack gap="md">
                  <Group gap="sm">
                    <ThemeIcon variant="transparent" color="zinc" size="sm">
                      <IoReaderOutline size={18} />
                    </ThemeIcon>
                    <Text fw={700} size="sm" className="uppercase tracking-widest text-zinc-500">{t('student_answer')}</Text>
                  </Group>
                  <Paper withBorder radius="lg" p="xl" className="bg-white/[0.03] border-white/10 shadow-sm">
                    {submission.text ? (
                      <Text size="md" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{submission.text}</Text>
                    ) : (
                      <Text size="sm" c="dimmed" fs="italic">{t('no_text_answer') || 'Student did not provide a text response.'}</Text>
                    )}
                  </Paper>
                </Stack>

                {/* Attachments Section */}
                {submission.file_urls && submission.file_urls.length > 0 && (
                  <Stack gap="md">
                     <Group gap="sm">
                        <ThemeIcon variant="transparent" color="zinc" size="sm">
                          <IoAttachOutline size={18} />
                        </ThemeIcon>
                        <Text fw={700} size="sm" className="uppercase tracking-widest text-zinc-500">{t('attachments')}</Text>
                      </Group>
                    <Group gap="sm">
                      {submission.file_urls.map((url, idx) => (
                        <Paper 
                          key={idx} 
                          withBorder 
                          component="a" 
                          href={url} 
                          target="_blank" 
                          radius="md" 
                          p="sm" 
                          className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer min-w-[150px] max-w-[250px]"
                        >
                          <Group gap="sm" wrap="nowrap">
                            <ThemeIcon size="sm" color="primary" variant="light" radius="sm">
                              <IoAttachOutline size={14} />
                            </ThemeIcon>
                            <Text size="xs" fw={600} className="truncate flex-1">
                              {url.split('/').pop() || `File ${idx + 1}`}
                            </Text>
                          </Group>
                        </Paper>
                      ))}
                    </Group>
                  </Stack>
                )}

                <Divider className="border-white/5" />

                {/* Review Form Section */}
                <Stack gap="xl">
                  <Group gap={8}>
                    <ThemeIcon variant="transparent" color="primary" size="sm">
                      <IoChatbubbleOutline size={18} />
                    </ThemeIcon>
                    <Text fw={700} size="sm" className="uppercase tracking-widest text-primary">{t('teacher_review') || 'Teacher Review'}</Text>
                  </Group>

                  <Paper withBorder radius="xl" p="xl" className="bg-primary/5 border-primary/20">
                    <Stack gap="lg">
                      <Group grow align="flex-start">
                        <Stack gap="xs">
                          <Text fw={600} size="sm">{t('score_label') || 'Grade / Score'}</Text>
                          <NumberInput
                            placeholder="0-100"
                            min={0}
                            max={100}
                            value={score}
                            onChange={set_score}
                            radius="md"
                            size="md"
                            variant="filled"
                            leftSection={<IoStarOutline size={18} className="text-primary" />}
                            styles={{ input: { backgroundColor: 'var(--mantine-color-white-5)', fontWeight: 700 } }}
                          />
                        </Stack>
                        <div /> {/* Spacer */}
                      </Group>

                      <Stack gap="xs">
                         <Text fw={600} size="sm">{t('feedback_label')}</Text>
                         <Textarea
                          placeholder={t('feedback_placeholder')}
                          value={feedback}
                          onChange={(e) => set_feedback(e.currentTarget.value)}
                          minRows={5}
                          radius="lg"
                          variant="filled"
                          size="md"
                          styles={{ input: { backgroundColor: 'var(--mantine-color-white-5)', border: '1px solid rgba(255,255,255,0.05)' } }}
                        />
                      </Stack>

                      <Group justify="flex-end" gap="md">
                        <Button variant="subtle" color="gray" onClick={on_close}>{common_t('cancel')}</Button>
                        <Button
                          onClick={handle_submit}
                          loading={is_reviewing}
                          size="md"
                          radius="md"
                          className="bg-primary px-8 hover:opacity-90 shadow-lg shadow-primary/20"
                          leftSection={<IoCheckmarkCircleOutline size={20} />}
                        >
                          {is_reviewed ? t('update_review') : t('confirm_review')}
                        </Button>
                      </Group>
                    </Stack>
                  </Paper>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}

