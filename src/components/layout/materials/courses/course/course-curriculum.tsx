'use client';

import { 
    Stack, 
    Title, 
    Text, 
    Group, 
    Paper, 
    ThemeIcon
} from '@mantine/core';
import { IoListOutline, IoInformationCircleOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { LessonMaterial } from '@/components/layout/materials/lessons/schemas/lesson-schema';
import { CourseContentItem } from '../schemas/course-schema';
import { CourseContentItemRenderer } from './course-content-item';

interface Props {
    content: CourseContentItem[];
    all_lessons: LessonMaterial[];
}

/**
 * Section displaying the course curriculum (list of lessons and groups)
 */
export function CourseCurriculum({ content, all_lessons }: Props) {
    const t = useTranslations('Materials.courses');

    return (
        <Stack gap="xl">
            <Group gap="sm">
                <ThemeIcon variant="light" size="xl" radius="md">
                    <IoListOutline size={24} />
                </ThemeIcon>
                <Title order={2}>{t('course_structure')}</Title>
            </Group>

            <Stack gap="md">
                {content.length > 0 ? (
                    content.map((item: CourseContentItem, index: number) => (
                        <CourseContentItemRenderer 
                            key={item.id} 
                            item={item} 
                            all_lessons={all_lessons}
                            index={index}
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
    );
}
