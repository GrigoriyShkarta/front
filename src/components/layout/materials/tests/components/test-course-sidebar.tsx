'use client';

import { Box, Paper, Stack, Group, Title, Text, ActionIcon, Grid } from '@mantine/core';
import { IoCloseOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { CourseCurriculum } from '@/components/layout/materials/courses/course/course-curriculum';

interface TestCourseSidebarProps {
    opened: boolean;
    course: any;
    all_lessons: any[];
    all_tests: any[];
    current_test_id: string;
    course_id: string;
    onClose: () => void;
}

/**
 * Sidebar component specifically for tests within courses.
 * Reusable across test detail and test taking pages.
 */
export function TestCourseSidebar({ 
    opened, 
    course, 
    all_lessons, 
    all_tests, 
    current_test_id, 
    course_id,
    onClose, 
}: TestCourseSidebarProps) {
    const t = useTranslations('Materials.lessons');
    
    return (
        <Box 
            className={cn(
                "hidden lg:block fixed top-0 bottom-0 z-[101] transition-all duration-500 ease-in-out border-l border-white/10",
                opened ? "right-0 w-[400px] opacity-100" : "-right-[400px] w-0 opacity-0 pointer-events-none"
            )}
        >
            <Paper 
                radius="0" 
                className="h-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl flex flex-col"
                style={{
                    boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.05)'
                }}
            >
                <Stack gap="0" className="h-full">
                    {/* Sidebar Header */}
                    <Box p="xl" pb="md" className="bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5">
                        <Group justify="space-between" align="flex-start" mb="xl" wrap="nowrap">
                            <Stack gap={4} className="flex-1">
                                <Text size="xs" fw={800} c="primary" tt="uppercase" lts={2}>
                                    {t('editor.course_navigation')}
                                </Text>
                                <Title order={3} className="line-clamp-2 leading-tight">
                                    {course.name}
                                </Title>
                            </Stack>
                            <ActionIcon variant="subtle" color="gray" onClick={onClose} radius="md">
                                <IoCloseOutline size={22} />
                            </ActionIcon>
                        </Group>
                        
                        <Stack gap={8}>
                            <Group justify="space-between">
                                <Text size="xs" fw={700} c="dimmed">{t('editor.your_progress')}</Text>
                                <Text size="xs" fw={700} c="primary">
                                    {(() => {
                                        const all_items = (course.content || []).flatMap((item: any) => 
                                            item.type === 'group' ? (item.content || []) : [item]
                                        );
                                        const accessible_count = all_items.filter((l: any) => l.has_access || l.id === current_test_id).length;
                                        const progress = all_items.length > 0 ? Math.round((accessible_count / all_items.length) * 100) : 0;
                                        return `${progress}%`;
                                    })()}
                                </Text>
                            </Group>
                            <Box h={6} className="bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <Box 
                                    h="100%" 
                                    className="bg-primary rounded-full transition-all duration-1000"
                                    style={{ 
                                        width: (() => {
                                             const all_items = (course.content || []).flatMap((item: any) => 
                                                item.type === 'group' ? (item.content || []) : [item]
                                             );
                                             const accessible_count = all_items.filter((l: any) => l.has_access || l.id === current_test_id).length;
                                             return `${all_items.length > 0 ? (accessible_count / all_items.length) * 100 : 0}%`;
                                        })()
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Box>

                    {/* Scrollable Curriculum */}
                    <Box p="xl" className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        <CourseCurriculum 
                            content={course.content} 
                            all_lessons={all_lessons} 
                            all_tests={all_tests}
                            course_id={course_id} 
                            active_lesson_id={current_test_id} // Treat current test as active
                        />
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}
