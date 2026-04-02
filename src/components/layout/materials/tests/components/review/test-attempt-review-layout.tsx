'use client';

import { 
    Title, 
    Text, 
    Stack, 
    Breadcrumbs, 
    Anchor, 
    Box, 
    LoadingOverlay, 
    Button,
    Paper,
    Group,
    Avatar,
    Divider,
    RingProgress
} from '@mantine/core';
import { 
    IoChevronBackOutline, 
    IoTimeOutline 
} from 'react-icons/io5';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { Link, useRouter } from '@/i18n/routing';
import { PageContainer } from '@/components/common/page-container';
import { testAttemptActions } from '@/components/layout/materials/tests/actions/test-attempt-actions';
import { TestQuestion } from '@/components/layout/materials/tests/schemas/test-schema';
import { ReviewAnswerPayload } from '@/components/layout/materials/tests/schemas/test-attempt-schema';
import { queryKeys } from '@/lib/query-keys';

import { AnswerReviewCard } from './answer-review-card';

interface Props {
    id: string;
}

/**
 * Main layout for test attempt review page
 * @param props - Component props containing attempt ID
 */
export function TestAttemptReviewLayout({ id }: Props) {
    const t = useTranslations('Materials.tests.results');
    const tNav = useTranslations('Navigation');
    const router = useRouter();
    const query_client = useQueryClient();

    // Fetch individual attempt
    const { data: attempt, isLoading: is_loading } = useQuery({
        queryKey: ['test-attempt', id],
        queryFn: () => testAttemptActions.get_attempt(id),
        enabled: !!id,
    });

    // Review answer mutation
    const review_mutation = useMutation({
        mutationFn: ({
            attempt_id,
            answer_id,
            data,
        }: {
            attempt_id: string;
            answer_id: string;
            data: ReviewAnswerPayload;
        }) => testAttemptActions.review_answer(attempt_id, answer_id, data),
        onSuccess: () => {
            query_client.invalidateQueries({ queryKey: ['test-attempts'] });
            query_client.invalidateQueries({ queryKey: ['test-attempt', id] });
            query_client.invalidateQueries({ queryKey: ['test-stats'] });
            query_client.invalidateQueries({ queryKey: queryKeys.auth.user() });
            notifications.show({
                title: t('review_success_title'),
                message: t('review_success'),
                color: 'green',
            });
        },
        onError: () => {
            notifications.show({
                title: t('review_error_title'),
                message: t('review_error'),
                color: 'red',
            });
        },
    });

    const questions: TestQuestion[] = useMemo(() => {
        if (attempt?.test?.content) {
            try {
                const content = attempt.test.content;
                return typeof content === 'string' ? JSON.parse(content) : content;
            } catch {
                return [];
            }
        }
        return [];
    }, [attempt?.test?.content]);

    const format_time = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const breadcrumb_items = [
        { title: tNav('dashboard'), href: '/main' },
        { title: t('title_global') || 'Reviews', href: '/main/materials/tests/reviews' },
        { title: attempt?.student_name || 'Review', href: '#' },
    ].map((item, index) => (
        <Anchor component={Link} href={item.href} key={index} size="sm" underline="hover">
            {item.title}
        </Anchor>
    ));

    if (is_loading && !attempt) {
        return (
            <PageContainer>
                <Box mih="60vh" pos="relative">
                    <LoadingOverlay visible />
                </Box>
            </PageContainer>
        );
    }

    if (!attempt) {
        return (
            <PageContainer>
                <Stack align="center" py={100}>
                    <Text c="dimmed">Attempt not found</Text>
                    <Button variant="subtle" onClick={() => router.back()}>Go back</Button>
                </Stack>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Stack gap="xl">
                <Breadcrumbs separator="/" mb="xs">
                    {breadcrumb_items}
                </Breadcrumbs>

                <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                        <Group 
                            gap="xs" 
                            className="cursor-pointer hover:opacity-70 transition-opacity w-fit -ml-1 mb-4" 
                            onClick={() => router.back()}
                        >
                            <IoChevronBackOutline size={16} />
                            <Text size="sm" fw={600}>{t('back_to_list') || 'Назад до списку'}</Text>
                        </Group>
                        <Title order={1} fw={800} className="tracking-tight leading-tight">
                            {t('review_drawer.title') || 'Attempt Review'}
                        </Title>
                        <Text c="dimmed" size="lg">{t('review_description') || 'Review student answers and grade open-ended questions.'}</Text>
                    </Stack>

                    <Paper withBorder p="md" radius="lg" className="bg-white/5 border-white/10">
                        <Group gap="lg">
                            <Group gap="md">
                                <Avatar src={attempt.student_avatar} size={50} radius="xl">
                                    {attempt.student_name?.charAt(0)}
                                </Avatar>
                                <div>
                                    <Text fw={700} size="lg">{attempt.student_name}</Text>
                                    <Group gap="xs" c="dimmed">
                                        <Group gap={4}>
                                            <IoTimeOutline size={14} />
                                            <Text size="xs">{format_time(attempt.time_spent)}</Text>
                                        </Group>
                                        <Text size="xs">·</Text>
                                        <Text size="xs">{dayjs(attempt.started_at).format('DD.MM.YYYY HH:mm')}</Text>
                                    </Group>
                                </div>
                            </Group>
                            <Divider orientation="vertical" />
                            <Box>
                                <RingProgress
                                    size={64}
                                    thickness={6}
                                    roundCaps
                                    sections={[{
                                        value: attempt.percentage,
                                        color: attempt.is_passed ? 'teal' : 'red',
                                    }]}
                                    label={
                                        <Text size="xs" fw={700} className="text-center tabular-nums">
                                            {Math.round(attempt.percentage)}%
                                        </Text>
                                    }
                                />
                            </Box>
                        </Group>
                    </Paper>
                </Group>

                <Divider className="border-white/5" />

                {/* Questions with answers */}
                <Stack gap="lg" maw={900} mx="auto" w="100%">
                    {questions.map((q, idx) => {
                        const answer = attempt.answers.find(a => a.question_id === q.id);
                        return (
                            <AnswerReviewCard
                                key={q.id}
                                question={q}
                                answer={answer}
                                index={idx}
                                attempt_id={attempt.id}
                                on_review={review_mutation.mutate}
                                is_reviewing={review_mutation.isPending}
                            />
                        );
                    })}
                </Stack>
            </Stack>
        </PageContainer>
    );
}
