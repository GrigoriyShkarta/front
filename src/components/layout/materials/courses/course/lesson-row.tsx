'use client';

import { 
    Group, 
    Box, 
    Paper, 
    Text, 
    ThemeIcon,
    Stack
} from '@mantine/core';
import { IoDocumentTextOutline, IoOpenOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';
import { LessonMaterial } from '@/components/layout/materials/lessons/schemas/lesson-schema';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

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


    const format_duration = (mins: number) => {
        if (mins < 60) return `${mins} ${t('min')}`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}${t('h')} ${m}${t('m')}` : `${h}${t('h')}`;
    };

    if (!lesson) return null;

    return (
        <Link 
            href={`/main/materials/lessons/${lesson.id}${course_id ? `?courseId=${course_id}` : ''}`} 
            className="no-underline text-inherit block"
        >
            <Paper 
                p="md" 
                radius={is_standalone ? "xl" : "lg"} 
                className={cn(
                    "transition-all duration-300 cursor-pointer group/lesson border",
                    is_active 
                        ? "shadow-md scale-[1.02]"
                        : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-white/5 hover:translate-x-1"
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
                                variant={is_active ? "filled" : "light"} 
                                color="primary" 
                                size="lg" 
                                radius="md"
                                className={cn(
                                    "transition-transform group-hover/lesson:rotate-3",
                                    is_active && "animate-pulse"
                                )}
                            >
                                <IoDocumentTextOutline size={18} />
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
                            </Group>
                        </Stack>
                    </Group>
                    
                    <Box 
                        className={cn(
                            "p-2 rounded-xl transition-all duration-300",
                            is_active 
                                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                : "opacity-0 group-hover/lesson:opacity-100 bg-zinc-100 dark:bg-white/10 text-zinc-500"
                        )}
                        style={is_active ? { backgroundColor: 'var(--mantine-primary-color-filled)' } : {}}
                    >
                        <IoOpenOutline size={16} />
                    </Box>
                </Group>
            </Paper>
        </Link>
    );
}
