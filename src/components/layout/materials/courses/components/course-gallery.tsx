'use client';

import { SimpleGrid, Box, Text } from '@mantine/core';
import { CourseMaterial } from '../schemas/course-schema';
import { CourseCard } from './course-card';
import { useTranslations } from 'next-intl';

interface Props {
    data: CourseMaterial[];
    selected_ids: string[];
    on_selection_change: (ids: string[]) => void;
    on_edit: (course: CourseMaterial) => void;
    on_delete: (id: string) => void;
}

export function CourseGallery({ 
    data, 
    selected_ids, 
    on_selection_change, 
    on_edit, 
    on_delete 
}: Props) {
    const t = useTranslations('Materials.courses');

    const handle_select = (id: string) => {
        on_selection_change(
            selected_ids.includes(id)
                ? selected_ids.filter((item) => item !== id)
                : [...selected_ids, id]
        );
    };

    return (
        <Box p="lg">
            <SimpleGrid 
                cols={{ base: 1, sm: 2, md: 3, lg: 3 }} 
                spacing="xl" 
                verticalSpacing="xl"
            >
                {data.map((course) => (
                    <CourseCard 
                        key={course.id}
                        course={course}
                        selected={selected_ids.includes(course.id)}
                        on_select={handle_select}
                        on_edit={on_edit}
                        on_delete={on_delete}
                    />
                ))}
            </SimpleGrid>
        </Box>
    );
}
