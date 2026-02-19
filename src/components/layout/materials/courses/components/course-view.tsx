'use client';

import { 
    Stack, 
    Title, 
    Text, 
    Group, 
    Box, 
    Paper, 
    Image, 
    Badge, 
    ActionIcon, 
    Breadcrumbs, 
    Anchor,
    LoadingOverlay,
    Divider,
    ThemeIcon,
    Button,
    Container,
    rem,
    Grid
} from '@mantine/core';
import {  
    IoBookOutline, 
    IoChevronDownOutline,
    IoImageOutline,
    IoInformationCircleOutline,
    IoListOutline,
    IoTimeOutline,
    IoDocumentTextOutline,
    IoOpenOutline
} from 'react-icons/io5';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Collapse } from '@mantine/core';
import { useCourse } from '../hooks/use-course';
import { useLessons } from '@/components/layout/materials/lessons/hooks/use-lessons';
import { CourseContentItem } from '../schemas/course-schema';

interface Props {
    id: string;
}

export function CourseView({ id }: Props) {
    const t = useTranslations('Materials.courses');
    const tNav = useTranslations('Navigation');
    const common_t = useTranslations('Common');
    const router = useRouter();
    
    const { course, is_loading } = useCourse(id);
    const { lessons: all_lessons } = useLessons({ page: 1, limit: 1000, search: '' });

    if (is_loading) {
        return <Box mih={400} className="relative"><LoadingOverlay visible /></Box>;
    }

    if (!course) {
        return (
            <Stack align="center" py={100} gap="md">
                <Text fw={500} size="xl">{common_t('error')}</Text>
                <Button variant="light" onClick={() => router.back()}>
                    {common_t('back')}
                </Button>
            </Stack>
        );
    }

    const breadcrumb_items = [
        { title: tNav('dashboard'), href: '/main' },
        { title: t('title'), href: '/main/materials/courses' },
        { title: course.name, href: `/main/materials/courses/${id}` },
    ].map((item, index) => (
        <Anchor component={Link} href={item.href} key={index} size="sm">
            {item.title}
        </Anchor>
    ));

    const total_duration = course.content.reduce((acc: number, item: CourseContentItem) => {
        if (item.type === 'lesson') {
            const lesson = all_lessons.find((l: any) => l.id === item.lesson_id);
            return acc + (lesson?.duration || 0);
        } else if (item.type === 'group') {
            const group_duration = item.lesson_ids.reduce((g_acc: number, lid: string) => {
                const lesson = all_lessons.find((l: any) => l.id === lid);
                return g_acc + (lesson?.duration || 0);
            }, 0);
            return acc + group_duration;
        }
        return acc;
    }, 0);

    const format_duration = (mins: number) => {
        if (mins < 60) return `${mins} min`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    return (
        <div className="min-h-screen -mt-4">
            {/* Hero Section */}
            <Box className="relative overflow-hidden pt-12 pb-24 border-b border-white/5">
                {/* Dynamic Background Gradient from Image */}
                {course.image_url && (
                    <Box 
                        className="absolute inset-0 opacity-20 pointer-events-none blur-[100px] scale-150"
                        style={{ 
                            backgroundImage: `url(${course.image_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                )}
                <Box 
                    className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" 
                    style={{ backgroundColor: 'var(--mantine-primary-color-filled)' }}
                />
                
                <Container size="xl">
                    <Stack gap="xl">
                        <Breadcrumbs separator="→">
                            {breadcrumb_items}
                        </Breadcrumbs>

                        <Grid gutter={40} align="center">
                            <Grid.Col span={{ base: 12, md: 7 }}>
                                <Stack gap="lg">
                                    <Title order={1} size={rem(48)} className="leading-tight font-bold tracking-tight">
                                        {course.name}
                                    </Title>
                                    
                                    <Text size="lg" c="dimmed" lh={1.6} className="max-w-2xl">
                                        {course.description || "Unlock your potential with this comprehensive course covering all essential aspects of the subject."}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            
                            <Grid.Col span={{ base: 12, md: 5 }}>
                                <Paper 
                                    radius="2xl" 
                                    className="aspect-video relative overflow-hidden bg-white/5 border border-white/10 shadow-2xl"
                                >
                                    {course.image_url ? (
                                        <Image 
                                            src={course.image_url} 
                                            className="w-full h-full object-cover" 
                                            alt={course.name}
                                        />
                                    ) : (
                                        <Box className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/20">
                                            <IoImageOutline size={64} />
                                            <Text fw={500}>{t('stats.no_preview')}</Text>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid.Col>
                        </Grid>
                    </Stack>
                </Container>
            </Box>

            {/* Content Section */}
            <Container size="xl" py={60}>
                <Grid gutter={40}>
                    {/* Curriculum */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Stack gap="xl">
                            <Group gap="sm">
                                <ThemeIcon variant="light" size="xl" radius="md">
                                    <IoListOutline size={24} />
                                </ThemeIcon>
                                <Title order={2}>{t('course_structure')}</Title>
                            </Group>

                            <Stack gap="md">
                                {course.content.length > 0 ? (
                                    course.content.map((item: CourseContentItem, index: number) => (
                                        <CourseItemRenderer 
                                            key={item.id} 
                                            item={item} 
                                            all_lessons={all_lessons}
                                            index={index}
                                            t={t}
                                        />
                                    ))
                                ) : (
                                    <Paper p={40} radius="xl" bg="white/2" className="text-center border-2 border-dashed border-white/10">
                                        <Stack align="center" gap="xs">
                                            <IoInformationCircleOutline size={48} className="text-white/20" />
                                            <Text c="dimmed" size="lg">{t('form.no_groups')}</Text>
                                        </Stack>
                                    </Paper>
                                )}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Sidebar Stats / Info */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack gap="xl" className="sticky top-24">
                            <Paper p="xl" radius="2xl" withBorder className="bg-white/5 border-white/10 shadow-lg">
                                <Title order={4} mb="lg">{t('stats.title')}</Title>
                                <Divider className="mb-lg border-white/5" />
                                <Stack gap="md">
                                    <Group justify="space-between">
                                        <Group gap="xs">
                                            <IoBookOutline style={{ color: 'var(--mantine-primary-color-filled)' }} />
                                            <Text size="sm">{t('course_structure')}</Text>
                                        </Group>
                                        <Text size="sm" fw={600}>{t('stats.blocks', { count: course.content.length })}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Group gap="xs">
                                            <IoTimeOutline style={{ color: 'var(--mantine-primary-color-filled)' }} />
                                            <Text size="sm">{t('stats.estimated_time')}</Text>
                                        </Group>
                                        <Text size="sm" fw={600}>{total_duration > 0 ? format_duration(total_duration) : '—'}</Text>
                                    </Group>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>
        </div>
    );
}

function CourseItemRenderer({ item, all_lessons, index, t }: { item: CourseContentItem, all_lessons: any[], index: number, t: any }) {
    const [opened, setOpened] = useState(true);

    if (item.type === 'group') {
        return (
            <Paper 
                radius="xl" 
                withBorder 
                className="bg-zinc-50/30 dark:bg-white/5 overflow-hidden border-zinc-300 dark:border-white/10 group/group shadow-sm"
            >
                <Box 
                    className="bg-zinc-100/50 dark:bg-white/5 p-5 border-b border-zinc-300 dark:border-white/5 group-hover/group:bg-zinc-200/50 dark:group-hover/group:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setOpened(!opened)}
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
                    <Stack gap={0} p="md">
                        {item.lesson_ids.map((lessonId: string, lIndex: number) => {
                            const lesson = all_lessons.find((l: any) => l.id === lessonId);
                            return (
                                <LessonRow 
                                    key={lessonId} 
                                    lesson={lesson} 
                                    index={lIndex + 1} 
                                />
                            );
                        })}
                    </Stack>
                </Collapse>
            </Paper>
        );
    }

    const lesson = all_lessons.find((l: any) => l.id === item.lesson_id);
    return (
        <LessonRow 
            lesson={lesson} 
            index={index + 1} 
            isStandalone
        />
    );
}

function LessonRow({ lesson, index, isStandalone }: { lesson: any, index: number, isStandalone?: boolean }) {
    return (
        <Paper 
            p="md" 
            radius={isStandalone ? "xl" : "md"} 
            className={cn(
                "transition-all cursor-pointer group/lesson border border-transparent",
                isStandalone 
                    ? "bg-zinc-50/30 dark:bg-white/5 border-zinc-300 dark:border-white/10 hover:border-[var(--mantine-primary-color-filled)] shadow-sm" 
                    : "bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5",
                !isStandalone && "hover:pl-6"
            )}
        >
            <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                    {!isStandalone && <Text size="xs" c="dimmed" w={20}>{index}.</Text>}
                    {isStandalone && (
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
                            <Badge size="xs" variant="outline" color="gray">Lesson</Badge>
                            {lesson?.duration && (
                                <Text size="xs" c="dimmed" fw={500}>{lesson.duration} min</Text>
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
                        className="text-zinc-500 dark:text-white/40 group-hover/lesson:text-white" 
                    />
                </Box>
            </Group>
        </Paper>
    );
}
