'use client';

import { 
    Group, 
    Box, 
    Paper, 
    Text, 
    ThemeIcon,
    Stack,
    Badge
} from '@mantine/core';
import { IoDocumentTextOutline, IoOpenOutline, IoLockClosedOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';
import { LessonMaterial } from '@/components/layout/materials/lessons/schemas/lesson-schema';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';

interface Props {
    lesson: LessonMaterial | undefined;
    index: number | string;
    is_standalone?: boolean;
    course_id?: string;
    active_lesson_id?: string;
}

/**
 * Single lesson row in the course curriculum
 */
export function LessonRow({ lesson, index, is_standalone, course_id, active_lesson_id }: Props) {
    const is_active = lesson?.id === active_lesson_id;
    const t = useTranslations('Materials.courses');
    const t_hw = useTranslations('Materials.homework');
    const { user } = useAuth();
    const is_student = user?.role === 'student';
    const has_access = lesson?.full_access !== false || !is_student;

    const format_duration = (mins: number) => {
        if (mins < 60) return `${mins} ${t('min')}`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}${t('h')} ${m}${t('m')}` : `${h}${t('h')}`;
    };

    const render_homework_badge = () => {
        if (!lesson?.homework_id) return null;

        if (!is_student) {
            return (
                <Badge size="xs" variant="light" color="indigo" radius="sm" leftSection={<Text span mt={2}><IoDocumentTextOutline size={12} /></Text>}>
                    {t_hw('title')}
                </Badge>
            );
        }

        const status = lesson.homework_status || 'not_submitted';
        
        return (
            <Group gap={4}>
                <Badge size="xs" variant="light" color="indigo" radius="sm" leftSection={<Text span mt={2}><IoDocumentTextOutline size={12} /></Text>}>
                    {t_hw('title')}
                </Badge>
                {status === 'reviewed' && (
                    <Badge size="xs" variant="light" color="green" radius="sm">
                        {t_hw('submission.status.reviewed')}
                    </Badge>
                )}
                {status === 'pending' && (
                    <Badge size="xs" variant="light" color="orange" radius="sm">
                        {t_hw('submission.status.pending')}
                    </Badge>
                )}
            </Group>
        );
    };

    if (!lesson) return null;

    const Content = (
        <Paper 
            p="md" 
            radius={is_standalone ? "xl" : "lg"} 
            className={cn(
                "transition-all duration-300 border",
                has_access ? "cursor-pointer group/lesson" : "cursor-not-allowed opacity-70",
                is_active 
                    ? "shadow-md scale-[1.02]"
                    : has_access ? "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-white/5 hover:translate-x-1" : "bg-transparent border-transparent"
            )}
            style={{
                backgroundColor: is_active 
                    ? 'rgba(var(--mantine-primary-color-main-filled), 0.08)' 
                    : undefined,
                borderColor: 'var(--mantine-secondary-color-filled)' 
    
            }}
        >
            <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                    <Box className="relative">
                        <ThemeIcon 
                            // variant={is_active ? "filled" : "light"} 
                            // color={has_access ? "primary" : "gray"} 
                            size="lg" 
                            radius="md"
                            className={cn(
                                has_access && "transition-transform group-hover/lesson:rotate-3",
                                is_active && "animate-pulse"
                            )}
                        >
                            {has_access ? <IoDocumentTextOutline size={18} /> : <IoLockClosedOutline size={18} />}
                        </ThemeIcon>
                        {is_active && (
                            <Box 
                                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" 
                                title="Current lesson"
                            />
                        )}
                    </Box>

                    <Stack gap={2}>
                        <Text 
                            size="sm" 
                            fw={is_active ? 700 : 600} 
                            className={cn(
                                "transition-colors",
                                is_active ? "text-[var(--mantine-primary-color-filled)]" : "text-zinc-700 dark:text-zinc-200"
                            )}
                        >
                            {lesson?.name || 'Loading lesson...'}
                        </Text>
                        <Group gap={8}>
                            {lesson?.duration && (
                                <Text size="xs" c="dimmed" fw={500}>
                                    {format_duration(lesson.duration)}
                                </Text>
                            )}
                            {is_active && (
                                <Text size="xs" c="primary" fw={700} tt="uppercase" lts={1}>
                                    • {t('current')}
                                </Text>
                            )}
                            {!has_access && (
                                <Text size="xs" c="dimmed" fw={500}>
                                  • {t('no_access') || 'Locked'}
                                </Text>
                            )}
                            {lesson?.homework_id && (
                                <Group gap={4}>
                                    <Text size="xs" c="dimmed">•</Text>
                                    {render_homework_badge()}
                                </Group>
                            )}
                        </Group>
                    </Stack>
                </Group>
                
                <Box 
                    className={cn(
                        "p-2 rounded-xl transition-all duration-300",
                        is_active 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : has_access ? "opacity-0 group-hover/lesson:opacity-100 bg-zinc-100 dark:bg-white/10 text-zinc-500" : "opacity-0"
                    )}
                    style={is_active ? { backgroundColor: 'var(--mantine-primary-color-filled)' } : {}}
                >
                    <IoOpenOutline size={16} />
                </Box>
            </Group>
        </Paper>
    );

    if (!has_access) {
        return Content;
    }

    return (
        <Link 
            href={`/main/materials/lessons/${lesson.id}${course_id ? `?courseId=${course_id}` : ''}`} 
            className="no-underline text-inherit block"
        >
            {Content}
        </Link>
    );
}
