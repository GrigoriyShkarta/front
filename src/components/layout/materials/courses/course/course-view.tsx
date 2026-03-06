'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { 
    Stack, 
    Text, 
    Box, 
    LoadingOverlay,
    Button,
    Container,
    Grid,
    Anchor
} from '@mantine/core';
import { useCourse } from '../hooks/use-course';
import { useCourses } from '../hooks/use-courses';
import { useLessons } from '@/components/layout/materials/lessons/hooks/use-lessons';
import { CreateCourseForm } from '../schemas/course-schema';
import { LessonMaterial } from '@/components/layout/materials/lessons/schemas/lesson-schema';
import { CourseHero } from './course-hero';
import { CourseStats } from './course-stats';
import { CourseCurriculum } from './course-curriculum';
import { CourseEditorDrawer } from '../components/course-editor-drawer';

interface Props {
    id: string;
}

/**
 * Main view component for a course
 */
export function CourseView({ id }: Props) {
    const t = useTranslations('Materials.courses');
    const t_nav = useTranslations('Navigation');
    const t_common = useTranslations('Common');
    const router = useRouter();
    
    const { course, is_loading } = useCourse(id);
    const { lessons: all_lessons } = useLessons({ page: 1, limit: 1000, search: '' });
    const { update_course, is_saving } = useCourses();
    const [editor_opened, set_editor_opened] = useState(false);

    if (is_loading) {
        return <Box mih={400} className="relative"><LoadingOverlay visible /></Box>;
    }

    if (!course) {
        return (
            <Stack align="center" py={100} gap="md">
                <Text fw={500} size="xl">{t_common('error')}</Text>
                <Button variant="light" onClick={() => router.back()}>
                    {t_common('back')}
                </Button>
            </Stack>
        );
    }

    const breadcrumb_items = [
        { title: t_nav('dashboard'), href: '/main' },
        { title: t('title'), href: '/main/materials/courses' },
        { title: course.name, href: `/main/materials/courses/${id}` },
    ].map((item, index) => (
        <Anchor component={Link} href={item.href} key={index} size="sm">
            {item.title}
        </Anchor>
    ));

    const filtered_content = course.content;

    const total_duration = filtered_content.reduce((acc: number, item: any) => {
        if (item.type === 'lesson') {
            const lesson = all_lessons.find((l: LessonMaterial) => l.id === item.lesson_id);
            return acc + (item.duration || lesson?.duration || 0);
        } else if (item.type === 'group') {
            const group_duration = (item.lessons || []).reduce((g_acc: number, l: any) => {
                const lesson = all_lessons.find((all_l: LessonMaterial) => all_l.id === l.lesson_id);
                return g_acc + (l.duration || lesson?.duration || 0);
            }, 0) || (item.lesson_ids || []).reduce((g_acc: number, lid: string) => {
                const lesson = all_lessons.find((l: LessonMaterial) => l.id === lid);
                return g_acc + (lesson?.duration || 0);
            }, 0);
            return acc + group_duration;
        }
        return acc;
    }, 0);

    const lessons_count = filtered_content.reduce((acc: number, item: any) => {
        if (item.type === 'lesson') return acc + 1;
        if (item.type === 'group') return acc + (item.lessons?.length || item.lesson_ids?.length || 0);
        return acc;
    }, 0);

    const handle_save = async (data: CreateCourseForm) => {
        return await update_course(id, data);
    };

    return (
        <div className="min-h-screen -mt-4">
            <CourseHero 
                course_name={course.name}
                course_description={course.description}
                image_url={course.image_url}
                breadcrumb_items={breadcrumb_items}
                on_edit={() => set_editor_opened(true)}
            />

            <Container size="xl" py={60}>
                <Grid gutter={40}>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <CourseCurriculum 
                            content={filtered_content}
                            all_lessons={all_lessons}
                            course_id={id}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack gap="xl" className="sticky top-24">
                            <CourseStats 
                                lessons_count={lessons_count}
                                total_duration={total_duration}
                            />
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>

            <CourseEditorDrawer 
                opened={editor_opened}
                onClose={() => set_editor_opened(false)}
                course={course}
                onSave={handle_save}
                is_saving={is_saving}
            />
        </div>
    );
}
