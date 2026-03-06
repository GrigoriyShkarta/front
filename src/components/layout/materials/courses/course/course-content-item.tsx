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
    course_id: string;
    active_lesson_id?: string;
}

/**
 * Renders a course content item (either a single lesson or a group of lessons)
 */
export function CourseContentItemRenderer({ item: _item, all_lessons, index, course_id, active_lesson_id }: Props) {
    const item = _item as any;
    const t = useTranslations('Materials.courses');
    const [opened, set_opened] = useState(true);

    if (item.type === 'group') {
        const lessons_data = item.lessons || item.lesson_ids || [];
        const lessons_count = lessons_data.length;

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
                                <Text size="xs" c="dimmed">{t('lessons_count', { count: lessons_count })}</Text>
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
                        {lessons_data.map((lesson_entry: any, l_index: number) => {
                            const lid = typeof lesson_entry === 'string' ? lesson_entry : lesson_entry.lesson_id;
                            const lesson_from_all = all_lessons.find((l: LessonMaterial) => l.id === lid);
                            
                            const merged_lesson: LessonMaterial = {
                                ...(lesson_from_all || {}),
                                id: lid,
                                name: (typeof lesson_entry === 'object' ? lesson_entry.title : '') || lesson_from_all?.name || '',
                                duration: (typeof lesson_entry === 'object' ? lesson_entry.duration : 0) || lesson_from_all?.duration || 0,
                                full_access: typeof lesson_entry === 'object' ? lesson_entry.has_access : (lesson_from_all?.full_access ?? true),
                            } as any;

                            return (
                                <LessonRow 
                                    key={lid} 
                                    lesson={merged_lesson.name ? merged_lesson : undefined} 
                                    index={`${index + 1}.${l_index + 1}`} 
                                    is_standalone
                                    course_id={course_id}
                                    active_lesson_id={active_lesson_id}
                                />
                            );
                        })}
                    </Stack>
                </Collapse>
            </Paper>
        );
    }

    const lid = item.lesson_id;
    const lesson_from_all = all_lessons.find((l: LessonMaterial) => l.id === lid);
    const merged_lesson: LessonMaterial = {
        ...(lesson_from_all || {}),
        id: lid,
        name: item.title || lesson_from_all?.name || '',
        duration: item.duration || lesson_from_all?.duration || 0,
        full_access: item.has_access !== undefined ? item.has_access : (lesson_from_all?.full_access ?? true),
    } as any;

    return (
        <LessonRow 
            lesson={merged_lesson.name ? merged_lesson : undefined} 
            index={index + 1} 
            is_standalone
            course_id={course_id}
            active_lesson_id={active_lesson_id}
        />
    );
}
