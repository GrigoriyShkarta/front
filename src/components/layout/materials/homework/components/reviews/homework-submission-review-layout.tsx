'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  Paper, 
  Stack, 
  Group, 
  Text, 
  ActionIcon, 
  ThemeIcon, 
  Button, 
  Textarea, 
  Avatar, 
  Divider, 
  Badge, 
  LoadingOverlay,
  Container,
  Anchor,
} from '@mantine/core';
import { 
  IoArrowBack, 
  IoCheckmarkCircle, 
  IoChatboxEllipsesOutline, 
  IoAttachOutline, 
  IoPersonOutline, 
  IoBookOutline, 
  IoCalendarOutline, 
  IoSaveOutline,
  IoTimeOutline
} from 'react-icons/io5';
import { notifications } from '@mantine/notifications';
import { useTranslations, useFormatter } from 'next-intl';

import { homeworkActions } from '../../actions/homework-actions';
import { PageContainer } from '@/components/common/page-container';

interface Props {
  id: string;
}

/**
 * Full page review layout for a single student homework submission.
 * Based on the TestAttemptReview style.
 */
export function HomeworkSubmissionReviewLayout({ id }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('Materials.homework.reviews');
  const common_t = useTranslations('Common');
  const format = useFormatter();

  const [feedback, set_feedback] = useState('');

  const { data: submission, isLoading } = useQuery({
    queryKey: ['homework_submission', id],
    queryFn: () => homeworkActions.get_submission(id),
  });

  useEffect(() => {
    if (submission) {
      set_feedback(submission.feedback || '');
    }
  }, [submission]);

  const review_mutation = useMutation({
    mutationFn: (data: { feedback: string }) => 
      homeworkActions.review_submission(id, { status: 'reviewed', ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework_submissions_admin'] });
      queryClient.invalidateQueries({ queryKey: ['homework_submission', id] });
      notifications.show({
        title: t('review_success') || 'Review Saved',
        message: t('review_description_success') || 'Score and feedback applied.',
        color: 'teal',
        icon: <IoCheckmarkCircle size={18} />,
        radius: 'md',
        className: 'shadow-xl border border-teal-500/10'
      });
      router.back();
    },
    onError: () => {
      notifications.show({
        title: common_t('error'),
        message: t('review_error') || 'Failed to save review.',
        color: 'red',
        radius: 'md'
      });
    }
  });

  if (isLoading) return <LoadingOverlay visible zIndex={1000} overlayProps={{ blur: 2 }} />;
  if (!submission) return <Container py="xl"><Text c="dimmed" ta="center">Submission not found</Text></Container>;

  const has_attachments = submission.file_urls && submission.file_urls.length > 0;
  const is_reviewed = submission.status === 'reviewed';

  return (
    <PageContainer>
      <Stack gap="xl" py="md">
        {/* Navigation & Toolbar */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="md">
              <ActionIcon 
                variant="subtle" 
                color="gray" 
                onClick={() => router.back()} 
                size="lg" 
                radius="md"
              >
                <IoArrowBack size={20} />
              </ActionIcon>
              <div>
                <Text size="xl" fw={800} className="tracking-tight leading-tight">
                    {t('drawer_title') || 'Review Submission'}
                </Text>
              </div>
            </Group>
          </Stack>

          <Button 
            leftSection={<IoSaveOutline size={18} />} 
            radius="md" 
            size="md"
            onClick={() => review_mutation.mutate({ feedback })}
            loading={review_mutation.isPending}
            className="shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            {is_reviewed ? t('update_review') : (t('confirm_review') || 'Submit Review')}
          </Button>
        </Group>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Student Answer & Attachments */}
          <div className="lg:col-span-8 space-y-6">
            <Paper p="xl" radius="lg" className="border shadow-sm">
                <Stack gap="md">
                  <Group gap="xs">
                    <ThemeIcon color="primary" variant="light" size="lg" radius="md">
                      <IoBookOutline size={18} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">{t('student_answer')}</Text>
                  </Group>
                  <Divider className="border-white/5" />
                  
                  <Paper p="lg" radius="md" className="border border-white/5 min-h-[200px]">
                    {submission.text ? (
                      <Text size="md" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{submission.text}</Text>
                    ) : (
                      <Text size="sm" c="dimmed" fs="italic">
                        {t('no_text_answer') || 'Student did not provide a text response.'}
                      </Text>
                    )}
                  </Paper>
                </Stack>
            </Paper>

            <Paper p="xl" radius="lg" className="border border-white/5 bg-white/[0.02] shadow-sm">
                <Stack gap="md">
                  <Group gap="xs">
                    <ThemeIcon color="secondary" variant="light" size="lg" radius="md">
                      <IoAttachOutline size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">{t('attachments')}</Text>
                    {has_attachments && <Badge variant="light" size="sm">{submission.file_urls.length}</Badge>}
                  </Group>
                  <Divider className="border-white/5" />
                  
                  {has_attachments ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {submission.file_urls.map((url: string, index: number) => {
                        const filename = url.split('/').pop() || `Attachment ${index + 1}`;
                        return (
                          <Paper 
                            key={index} 
                            component="a" 
                            href={url} 
                            target="_blank"
                            p="md" 
                            radius="md" 
                            className="border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-center gap-3"
                          >
                            <ThemeIcon color="secondary" variant="light" radius="md">
                                <IoAttachOutline size={16} />
                            </ThemeIcon>
                            <div className="overflow-hidden">
                              <Text size="xs" fw={700} className="truncate">{filename}</Text>
                              <Text size="xs" c="dimmed">{common_t('open')}</Text>
                            </div>
                          </Paper>
                        );
                      })}
                    </div>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="xl">{t('no_submissions')}</Text>
                  )}
                </Stack>
            </Paper>
          </div>

          {/* Right Column: Student Info & Grading */}
          <div className="lg:col-span-4 space-y-6">
            <Paper p="xl" radius="lg" className="border border-white/10 bg-primary/2 shadow-xl sticky top-24">
                <Stack gap="xl">
                  {/* Student Card */}
                  <Group wrap="nowrap" align="center">
                    <Avatar 
                      src={submission.student?.avatar_url} 
                      size={60} 
                      radius="xl" 
                      className="border-2 border-primary/20 shadow-lg"
                    >
                      <IoPersonOutline size={30} />
                    </Avatar>
                    <Stack gap={2}>
                      <Text fw={800} size="lg" className="tracking-tight">{submission.student?.name || t('unknown_student')}</Text>
                    </Stack>
                  </Group>

                  <Divider className="border-white/10" />

                  {/* Submission Info */}
                  <Stack gap="sm">
                    <Group gap="xs">
                        <IoCalendarOutline size={16} className="text-primary" />
                        <Text size="sm" fw={600}>{t('submitted_at')}:</Text>
                        <Text size="sm" c="dimmed">
                            {format.dateTime(new Date(submission.created_at), { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric', 
                                hour: 'numeric', 
                                minute: 'numeric' 
                            })}
                        </Text>
                    </Group>
                    <Group gap="xs">
                        <IoBookOutline size={16} className="text-primary" />
                        <Text size="sm" fw={600}>{t('table.lesson')}:</Text>
                        <Anchor 
                            size="sm" 
                            c="dimmed" 
                            underline="hover" 
                            className="truncate flex-1 text-right"
                            onClick={() => {
                                const lesson_id = submission.homework?.lesson?.id || submission.homework?.lesson_id;
                                if (lesson_id) router.push(`/main/materials/lessons/${lesson_id}`);
                            }}
                        >
                            {submission.homework?.lesson?.name || '—'}
                        </Anchor>
                    </Group>
                    <Group gap="xs">
                        <IoTimeOutline size={16} className="text-primary" />
                        <Text size="sm" fw={600}>{t('table.status')}:</Text>
                        {is_reviewed ? (
                            <Badge color="teal" variant="filled" size="sm" leftSection={<IoCheckmarkCircle size={10} />}>{t('status_reviewed')}</Badge>
                        ) : (
                            <Badge color="orange" size="sm" leftSection={<IoTimeOutline size={10} />}>{t('status_pending')}</Badge>
                        )}
                    </Group>
                  </Stack>

                  <Divider className="border-white/10" />


                  {/* Feedback Section */}
                  <Stack gap="md">
                    <Group gap="xs">
                        <ThemeIcon color="primary" variant="light" size="md" radius="md">
                            <IoChatboxEllipsesOutline size={18} />
                        </ThemeIcon>
                        <Text fw={700}>{t('feedback_label')}</Text>
                    </Group>
                    <Textarea
                      label={t('teacher_review') || 'Teacher Feedback'}
                      placeholder={t('feedback_placeholder')}
                      value={feedback}
                      onChange={(e) => set_feedback(e.target.value)}
                      autosize
                      minRows={6}
                      size="md"
                      radius="md"
                      className="w-full"
                    />
                  </Stack>

                </Stack>
            </Paper>
          </div>
        </div>
      </Stack>
    </PageContainer>
  );
}
