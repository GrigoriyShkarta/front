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
import { IoChevronDownOutline, IoDocumentTextOutline, IoCheckmarkCircleOutline, IoExtensionPuzzleOutline, IoLockClosedOutline } from 'react-icons/io5';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { LessonMaterial } from '@/components/layout/materials/lessons/schemas/lesson-schema';
import { CourseContentItem } from '../schemas/course-schema';
import { LessonRow } from './lesson-row';
import { cn } from '@/lib/utils';

interface Props {
    item: CourseContentItem;
    all_lessons: LessonMaterial[];
    all_tests: any[];
    index: number;
    course_id: string;
    active_lesson_id?: string;
}

/**
 * Renders a course content item (either a single lesson or a group of lessons or a test)
 */
export function CourseContentItemRenderer({ item: _item, all_lessons, all_tests = [], index, course_id, active_lesson_id }: Props) {
    const { user } = useAuth();
    const is_student = user?.role === 'student';
    const item = _item as any;
    const t = useTranslations('Materials.courses');
    const t_test = useTranslations('Materials.tests');
    const [opened, set_opened] = useState(true);

    if (item.type === 'group') {
        const group_content = item.content || [];
        const items_count = group_content.length;

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
                                <Text size="xs" c="dimmed">{t('lessons_count', { count: items_count })}</Text>
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
                        {group_content.map((group_item: any, g_idx: number) => (
                            <CourseContentItemRenderer 
                                key={group_item.id || g_idx}
                                item={group_item}
                                all_lessons={all_lessons}
                                all_tests={all_tests}
                                index={g_idx} // Internal index for the row
                                course_id={course_id}
                                active_lesson_id={active_lesson_id}
                            />
                        ))}
                    </Stack>
                </Collapse>
            </Paper>
        );
    }

    if (item.type === 'test') {
        const test_id = item.test_id;
        const test_data = all_tests.find((t: any) => t.id === test_id);
        const is_active = active_lesson_id === test_id;
        const has_access = !is_student || is_active || !!test_data || item.has_access === true;
        const is_passed = (item.is_passed || test_data?.is_passed) && is_student;

        const TestCard = (
            <Paper 
                p="md" 
                radius="xl" 
                className={cn(
                    "transition-all duration-300 border shadow-sm",
                    has_access ? "cursor-pointer group/test" : "cursor-not-allowed opacity-70",
                    is_active 
                        ? "bg-primary/10 border-primary shadow-primary/10 ring-1 ring-primary/20 scale-[1.02]" 
                        : has_access ? "hover:bg-zinc-100 dark:hover:bg-white/5 hover:translate-x-1 border-transparent" : "border-transparent"
                )}
                style={!is_active && has_access ? { backgroundColor: 'rgba(var(--mantine-primary-color-main-filled), 0.05)' } : undefined}
            >
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="md" wrap="nowrap">
                        <Box className="relative">
                            <ThemeIcon 
                                variant={is_active ? "filled" : "light"}
                                color={!has_access ? "gray" : (is_passed ? "green" : "primary")} 
                                size="lg" 
                                radius="md"
                                className={cn("transition-transform", has_access && !is_active && "group-hover/test:rotate-3")}
                            >
                                {!has_access ? (
                                    <IoLockClosedOutline size={18} />
                                ) : is_passed ? (
                                    <IoCheckmarkCircleOutline size={20} />
                                ) : (
                                    <IoExtensionPuzzleOutline size={18} />
                                )}
                            </ThemeIcon>
                        </Box>
                        <Stack gap={2}>
                            <Text size="sm" fw={700} className={cn(is_active ? "text-primary" : "text-zinc-700 dark:text-zinc-200")}>
                                {item.title || test_data?.name || 'Unknown Test'}
                            </Text>
                            <Group gap={8}>
                                <Text size="xs" c={!has_access ? "dimmed" : (is_passed ? "green" : (is_active ? "primary" : "dimmed"))} fw={700} tt="uppercase" lts={1} opacity={is_active ? 0.8 : 1}>
                                    {is_passed ? t_test('passed') : t_test('single_title')}
                                </Text>
                                {!has_access && (
                                    <Text size="xs" c="dimmed" fw={500}>
                                      • {t('no_access') || 'Locked'}
                                    </Text>
                                )}
                            </Group>
                        </Stack>
                    </Group>
                </Group>
            </Paper>
        );

        if (!has_access) {
            return (
                <Box className="relative">
                    {TestCard}
                </Box>
            );
        }

        return (
            <Link 
                href={`/main/materials/tests/${test_id}${course_id ? `?courseId=${course_id}` : ''}`} 
                className="no-underline text-inherit block"
            >
                {TestCard}
            </Link>
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
