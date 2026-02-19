'use client';

import { 
    Group, 
    Box, 
    Paper, 
    Text, 
    ThemeIcon,
    Stack,
    Collapse
} from '@mantine/core';
import { IoChevronDownOutline } from 'react-icons/io5';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LessonMaterial } from '@/components/layout/materials/lessons/schemas/lesson-schema';
import { CourseContentItem } from '../schemas/course-schema';
import { LessonRow } from './lesson-row';

interface Props {
    item: CourseContentItem;
    all_lessons: LessonMaterial[];
    index: number;
}

/**
 * Renders a course content item (either a single lesson or a group of lessons)
 */
export function CourseContentItemRenderer({ item, all_lessons, index }: Props) {
    const t = useTranslations('Materials.courses');
    const [opened, set_opened] = useState(true);


    if (item.type === 'group') {
        return (
            <Paper 
                radius="xl" 
                withBorder 
                className="bg-zinc-50/30 dark:bg-white/5 overflow-hidden border-zinc-300 dark:border-white/10 group/group shadow-sm"
            >
                <Box 
                    className="bg-zinc-100/50 dark:bg-white/5 p-5 border-b border-zinc-300 dark:border-white/5 group-hover/group:bg-zinc-200/50 dark:group-hover/group:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => set_opened(!opened)}
                >
                    <Group justify="space-between">
                        <Group gap="md">
                            <Box 
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                               style={{ 
                                    backgroundColor: 'rgba(var(--mantine-primary-color-main-filled), 0.1)',
                                    color: 'var(--mantine-primary-color-filled)'
                                }}
                            >
                                {index + 1}
                            </Box>
                            <Stack gap={0}>
                                <Text fw={700} size="lg">{item.title}</Text>
                                <Text size="xs" c="dimmed">{t('lessons_count', { count: item.lesson_ids.length })}</Text>
                            </Stack>
                        </Group>
                        <ThemeIcon 
                            variant="subtle" 
                            color="gray" 
                            style={{ 
                                transition: 'transform 200ms ease',
                                transform: opened ? 'rotate(0deg)' : 'rotate(-90deg)'
                            }}
                        >
                            <IoChevronDownOutline size={20} />
                        </ThemeIcon>
                    </Group>
                </Box>
                
                <Collapse in={opened}>
                    <Stack gap="md" p="md">
                        {item.lesson_ids.map((lesson_id: string, l_index: number) => {
                            const lesson = all_lessons.find((l: LessonMaterial) => l.id === lesson_id);
                            return (
                                <LessonRow 
                                    key={lesson_id} 
                                    lesson={lesson} 
                                    index={`${index + 1}.${l_index + 1}`} 
                                    is_standalone
                                />
                            );
                        })}
                    </Stack>
                </Collapse>
            </Paper>
        );
    }

    const lesson = all_lessons.find((l: LessonMaterial) => l.id === item.lesson_id);
    return (
        <LessonRow 
            lesson={lesson} 
            index={index + 1} 
            is_standalone
        />
    );
}
