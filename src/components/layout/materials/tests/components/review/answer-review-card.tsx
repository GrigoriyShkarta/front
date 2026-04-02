'use client';

import { useState } from 'react';
import { 
    Paper, 
    Stack, 
    Group, 
    ThemeIcon, 
    Text, 
    Badge, 
    Box, 
    Select, 
    Textarea, 
    Button 
} from '@mantine/core';
import { 
    IoCheckmarkCircleOutline, 
    IoCloseCircleOutline, 
    IoHourglassOutline 
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';

import { TestQuestion, QUESTION_TYPES } from '@/components/layout/materials/tests/schemas/test-schema';
import { TestAnswer } from '@/components/layout/materials/tests/schemas/test-attempt-schema';
import { cn } from '@/lib/utils';

interface Props {
    question: TestQuestion;
    answer: TestAnswer | undefined;
    index: number;
    attempt_id: string;
    on_review: (params: { attempt_id: string; answer_id: string; data: any }) => void;
    is_reviewing: boolean;
}

/**
 * Individual answer card for test review
 * @param props - Component props
 */
export function AnswerReviewCard({
    question,
    answer,
    index,
    attempt_id,
    on_review,
    is_reviewing,
}: Props) {
    const t = useTranslations('Materials.tests.results');
    const [review_points, set_review_points] = useState(answer?.points_awarded || 0);
    const [review_comment, set_review_comment] = useState(answer?.teacher_comment || '');

    const is_correct = answer?.is_correct === true;
    const is_wrong = answer?.is_correct === false;
    const is_pending = answer?.is_correct === null;
    const is_detailed = question.type === QUESTION_TYPES.DETAILED_ANSWER;

    const get_student_answer_text = () => {
        if (!answer) return t('review_drawer.no_answer');
        if (answer.text_answer) return answer.text_answer;
        if (answer.selected_option_ids && question.options) {
            return question.options
                .filter(o => answer.selected_option_ids?.includes(o.id))
                .map(o => o.text)
                .join(', ') || t('review_drawer.no_answer');
        }
        return t('review_drawer.no_answer');
    };

    const get_correct_answer = () => {
        if (question.type === QUESTION_TYPES.FILL_IN_BLANK) return question.correct_answer_text || '';
        if (question.options) return question.options.filter(o => o.is_correct).map(o => o.text).join(', ');
        return '';
    };

    return (
        <Paper
            withBorder
            p="xl"
            radius="20px"
            className={cn(
                'bg-white/2 border-white/10 transition-all shadow-sm',
                is_correct && 'border-l-4 border-l-emerald-500/50',
                is_wrong && 'border-l-4 border-l-red-500/50',
                is_pending && 'border-l-4 border-l-orange-400/50'
            )}
        >
            <Stack gap="md">
                <Group justify="space-between">
                    <Group gap="sm">
                        <ThemeIcon 
                            size="md" 
                            radius="md" 
                            variant="light" 
                            color={is_correct ? 'teal' : is_wrong ? 'red' : 'orange'}
                        >
                            {is_correct && <IoCheckmarkCircleOutline size={18} />}
                            {is_wrong && <IoCloseCircleOutline size={18} />}
                            {is_pending && <IoHourglassOutline size={18} />}
                        </ThemeIcon>
                        <Text fw={700}>#{index + 1}</Text>
                    </Group>
                    <Badge variant="filled" color="dark" radius="sm">
                        {answer?.points_awarded || 0} / {question.points} {t('points') || 'pts'}
                    </Badge>
                </Group>

                <Text fw={600} size="lg">{question.question}</Text>

                <Group grow align="flex-start">
                    <Stack gap={8}>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1}>{t('review_drawer.student_answer')}</Text>
                        <Box className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <Text>{get_student_answer_text()}</Text>
                        </Box>
                    </Stack>

                    {!is_detailed && (
                        <Stack gap={8}>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1}>{t('review_drawer.correct_answer')}</Text>
                            <Box className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <Text c="teal" fw={500}>{get_correct_answer()}</Text>
                            </Box>
                        </Stack>
                    )}
                </Group>

                {is_detailed && is_pending && (
                    <Box className="mt-2 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 shadow-inner">
                        <Stack gap="md">
                            <Text fw={700} c="orange.4">{t('review_drawer.review_section')}</Text>
                            <Group grow>
                                <Select
                                    label={t('review_drawer.points_label')}
                                    value={review_points.toString()}
                                    onChange={(val) => set_review_points(Number(val))}
                                    data={Array.from({ length: question.points + 1 }, (_, i) => ({
                                        value: i.toString(),
                                        label: i.toString(),
                                    }))}
                                    variant="filled"
                                    radius="md"
                                />
                                <Textarea
                                    label={t('review_drawer.comment_label')}
                                    placeholder={t('review_drawer.comment_placeholder')}
                                    value={review_comment}
                                    onChange={(e) => set_review_comment(e.currentTarget.value)}
                                    autosize
                                    minRows={1}
                                    variant="filled"
                                    radius="md"
                                />
                            </Group>
                            <Button
                                radius="xl"
                                color="primary"
                                loading={is_reviewing}
                                onClick={() =>
                                    on_review({
                                        attempt_id,
                                        answer_id: answer?.id || '',
                                        data: {
                                            points_awarded: review_points,
                                            teacher_comment: review_comment || undefined,
                                        },
                                    })
                                }
                                className="w-fit px-8"
                            >
                                {t('review_drawer.confirm_review')}
                            </Button>
                        </Stack>
                    </Box>
                )}

                {is_detailed && !is_pending && answer?.teacher_comment && (
                    <Stack gap={8}>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1}>{t('review_drawer.teacher_comment')}</Text>
                        <Box className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <Text>{answer.teacher_comment}</Text>
                        </Box>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
