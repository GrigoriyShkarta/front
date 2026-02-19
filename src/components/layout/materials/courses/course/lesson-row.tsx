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
}

/**
 * Single lesson row in the course curriculum
 */
export function LessonRow({ lesson, index, is_standalone }: Props) {
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
            href={`/main/materials/lessons/${lesson.id}`} 
            className="no-underline text-inherit block"
        >
            <Paper 
                p="md" 
                radius={is_standalone ? "xl" : "md"} 
                className={cn(
                    "transition-all cursor-pointer group/lesson border border-transparent",
                    is_standalone 
                        ? "bg-zinc-50/30 dark:bg-white/5 border-zinc-300 dark:border-white/10 hover:border-[var(--mantine-primary-color-filled)] shadow-sm" 
                        : "bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5",
                    !is_standalone && "hover:pl-6"
                )}
                style={{
                    borderColor: 'var(--space-secondary)',
                }}
            >
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="md" wrap="nowrap">
                        {!is_standalone && <Text size="xs" c="dimmed" w={20}>{index}.</Text>}
                        {is_standalone && (
                            <Box 
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                                style={{ 
                                    backgroundColor: 'rgba(var(--mantine-primary-color-main-filled), 0.1)',
                                    color: 'var(--mantine-primary-color-filled)'
                                }}
                            >
                                {index}
                            </Box>
                        )}
                        <ThemeIcon variant="light" color="primary" size="md" radius="sm">
                            <IoDocumentTextOutline size={16} />
                        </ThemeIcon>
                        <Stack gap={2}>
                            <Text 
                                size="sm" 
                                fw={600} 
                                className="transition-colors"
                            >
                                {lesson?.name || 'Loading lesson...'}
                            </Text>
                            <Group gap={8}>
                                {lesson?.duration && (
                                    <Text size="xs" c="dimmed" fw={500}>{format_duration(lesson.duration)}</Text>
                                )}
                            </Group>
                        </Stack>
                    </Group>
                    <Box 
                        className="p-2 rounded-full border border-zinc-300 dark:border-white/10 transition-all group-hover/lesson:bg-primary group-hover/lesson:border-primary"
                        style={{
                            backgroundColor: 'transparent',
                        }}
                    >
                        <IoOpenOutline 
                            size={18} 
                            className="text-zinc-500 group-hover/lesson:text-white" 
                            style={{
                                color: 'var(--mantine-primary-color-filled)'
                            }}
                        />
                    </Box>
                </Group>
            </Paper>
        </Link>
    );
}
