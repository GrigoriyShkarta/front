'use client';

import { Box, Paper, Stack, Group, Title, Text, ActionIcon, Tooltip } from '@mantine/core';
import { IoArrowForwardOutline, IoListOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';
import { CourseCurriculum } from '@/components/layout/materials/courses/course/course-curriculum';

interface LessonSidebarProps {
    course_id?: string;
    context_course: any;
    sidebar_opened: boolean;
    onToggle: () => void;
    all_lessons: any[];
    all_tests: any[];
    active_lesson_id?: string;
    t: (key: string) => string;
}

export function LessonSidebar({ 
    course_id, context_course, sidebar_opened, onToggle, 
    all_lessons, all_tests, active_lesson_id, t 
}: LessonSidebarProps) {
    if (!course_id || !context_course) return null;

    return (
        <>
            <Box 
                className={cn(
                    "hidden lg:block fixed top-1/2 -translate-y-1/2 z-[102] transition-all duration-500 ease-in-out",
                    sidebar_opened ? "right-[378px]" : "right-6"
                )}
            >
                <Tooltip label={sidebar_opened ? t('editor.hide_sidebar') : t('editor.show_sidebar')} position="left">
                    <ActionIcon 
                        size="xl" radius="xl" variant="filled" color="primary" onClick={onToggle}
                        className="shadow-2xl hover:scale-110 active:scale-95 transition-all"
                        style={{
                            backgroundColor: 'var(--mantine-primary-color-filled)',
                            boxShadow: '0 0 20px rgba(var(--mantine-primary-color-main-filled), 0.4)'
                        }}
                    >
                        {sidebar_opened ? <IoArrowForwardOutline size={20} /> : <IoListOutline size={20} />}
                    </ActionIcon>
                </Tooltip>
            </Box>

            <Box 
                className={cn(
                    "hidden lg:block fixed top-0 bottom-0 z-[101] transition-all duration-500 ease-in-out border-l border-white/10",
                    sidebar_opened ? "right-0 w-[400px] opacity-100" : "-right-[400px] w-0 opacity-0 pointer-events-none"
                )}
            >
                <Paper 
                    radius="0" className="h-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl flex flex-col"
                    style={{ boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.05)' }}
                >
                    <Stack gap="0" className="h-full">
                        <Box p="xl" pb="md" className="bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5">
                            <Group justify="space-between" align="flex-start" mb="xl" wrap="nowrap">
                                <Stack gap={4}>
                                    <Text size="xs" fw={800} c="primary" tt="uppercase" lts={2}>{t('editor.course_navigation')}</Text>
                                    <Title order={3} className="line-clamp-2 leading-tight">{context_course.name}</Title>
                                </Stack>
                            </Group>
                            
                            <Stack gap={8}>
                                <Group justify="space-between">
                                    <Text size="xs" fw={700} c="dimmed">{t('editor.your_progress')}</Text>
                                    <Text size="xs" fw={700} c="primary">
                                        {(() => {
                                            const all_lessons = context_course.content.flatMap((item: any) => item.type === 'lesson' ? [item] : (item.lessons || []));
                                            const accessible_count = all_lessons.filter((l: any) => l.has_access).length;
                                            return `${all_lessons.length > 0 ? Math.round((accessible_count / all_lessons.length) * 100) : 0}%`;
                                        })()}
                                    </Text>
                                </Group>
                                <Box h={6} className="bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <Box 
                                        h="100%" className="bg-primary rounded-full transition-all duration-1000"
                                        style={{ 
                                            width: (() => {
                                                const all_lessons = context_course.content.flatMap((item: any) => item.type === 'lesson' ? [item] : (item.lessons || []));
                                                const acc = all_lessons.filter((l: any) => l.has_access).length;
                                                return `${all_lessons.length > 0 ? (acc / all_lessons.length) * 100 : 0}%`;
                                            })()
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Box>

                        <Box p="xl" className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                            <CourseCurriculum 
                                content={context_course.content} 
                                all_lessons={all_lessons}
                                all_tests={all_tests}
                                course_id={course_id!}
                                active_lesson_id={active_lesson_id}
                            />
                        </Box>
                    </Stack>
                </Paper>
            </Box>
        </>
    );
}
