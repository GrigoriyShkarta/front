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
import { useTests } from '@/components/layout/materials/tests/hooks/use-tests';
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
    
    const { course, is_loading: course_loading } = useCourse(id);
    const { lessons: all_lessons, is_loading: lessons_loading } = useLessons({ page: 1, limit: 1000, search: '' });
    const { tests: all_tests, is_loading: tests_loading } = useTests({ page: 1, limit: 1000, search: '' });
    const { update_course, is_saving } = useCourses();
    const [editor_opened, set_editor_opened] = useState(false);

    const is_loading = course_loading || (lessons_loading && !all_lessons.length) || (tests_loading && !all_tests.length);

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

    const filtered_content = course.content;

    const total_duration = filtered_content.reduce((acc: number, item: any) => {
        if (item.type === 'lesson') {
            const lesson = all_lessons.find((l: LessonMaterial) => l.id === item.lesson_id);
            return acc + (item.duration || lesson?.duration || 0);
        } else if (item.type === 'group') {
            const group_duration = (item.content || []).reduce((g_acc: number, c: any) => {
                if (c.type === 'lesson') {
                    const lesson = all_lessons.find((all_l: LessonMaterial) => all_l.id === c.lesson_id);
                    return g_acc + (c.duration || lesson?.duration || 0);
                }
                return g_acc;
            }, 0);
            return acc + group_duration;
        }
        return acc;
    }, 0);

    const lessons_count = filtered_content.reduce((acc: number, item: any) => {
        if (item.type === 'lesson') return acc + 1;
        if (item.type === 'group') {
            return acc + (item.content || []).filter((c: any) => c.type === 'lesson').length;
        }
        return acc;
    }, 0);

    const tests_count = filtered_content.reduce((acc: number, item: any) => {
        if (item.type === 'test') return acc + 1;
        if (item.type === 'group') {
            return acc + (item.content || []).filter((c: any) => c.type === 'test').length;
        }
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
                on_edit={() => set_editor_opened(true)}
            />

            <Container size="xl" py={60}>
                <Grid gutter={40}>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <CourseCurriculum 
                            content={filtered_content}
                            all_lessons={all_lessons}
                            all_tests={all_tests}
                            course_id={id}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack gap="xl" className="sticky top-24">
                            <CourseStats 
                                lessons_count={lessons_count}
                                tests_count={tests_count}
                                total_duration={total_duration}
                            />
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>

            <CourseEditorDrawer 
                opened={editor_opened}
                on_close={() => set_editor_opened(false)}
                course={course}
                on_save={handle_save}
                is_saving={is_saving}
            />
        </div>
    );
}

