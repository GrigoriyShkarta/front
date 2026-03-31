import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { create_course_schema, CreateCourseForm, CourseMaterial } from '../schemas/course-schema';

interface UseCourseEditorFormProps {
    course?: CourseMaterial | null;
    opened: boolean;
}

/**
 * Custom hook to handle course editor form logic
 */
export function useCourseEditorForm({ course, opened }: UseCourseEditorFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        getValues,
        watch,
        control,
        formState: { errors, isValid }
    } = useForm<CreateCourseForm>({
        mode: 'onChange',
        resolver: zodResolver(create_course_schema) as any,
        defaultValues: {
            name: '',
            description: '',
            image_url: '',
            category_ids: [],
            content: []
        }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "content"
    });

    useEffect(() => {
        if (course && opened) {
            reset({
                name: course.name,
                description: course.description || '',
                image_url: course.image_url || '',
                category_ids: course.categories?.map(c => c.id) || [],
                content: course.content.map(item => ({
                    ...item
                }))
            });
        } else if (!opened) {
            reset({
                name: '',
                description: '',
                image_url: '',
                category_ids: [],
                content: []
            });
        }
    }, [course, opened, reset]);

    const handle_add_group = () => {
        append({
            type: 'group',
            id: crypto.randomUUID(),
            title: '',
            content: []
        } as any);
    };

    const handle_add_lesson = (lesson_id: string) => {
        append({
            type: 'lesson',
            id: crypto.randomUUID(),
            lesson_id: lesson_id
        });
    };

    const handle_add_test = (test_id: string) => {
        append({
            type: 'test',
            id: crypto.randomUUID(),
            test_id: test_id
        });
    };

    const handle_add_item_to_group = (group_index: number, type: 'lesson' | 'test', item_id: string) => {
        const current_content = getValues(`content.${group_index}.content` as any) || [];
        const exists = current_content.some((item: any) => 
            (type === 'lesson' && item.lesson_id === item_id) || 
            (type === 'test' && item.test_id === item_id)
        );

        if (!exists) {
            const new_item = {
                type,
                id: crypto.randomUUID(),
                [type === 'lesson' ? 'lesson_id' : 'test_id']: item_id
            };
            setValue(`content.${group_index}.content` as any, [...current_content, new_item], { shouldDirty: true });
        }
    };

    const handle_remove_item_from_group = (group_index: number, item_index: number) => {
        const current_content = [...(getValues(`content.${group_index}.content` as any) || [])];
        current_content.splice(item_index, 1);
        setValue(`content.${group_index}.content` as any, current_content, { shouldDirty: true });
    };

    const handle_move_item_in_group = (group_index: number, from_index: number, to_index: number) => {
        const current_content = [...(getValues(`content.${group_index}.content` as any) || [])];
        if (to_index >= 0 && to_index < current_content.length) {
            const temp = current_content[from_index];
            current_content[from_index] = current_content[to_index];
            current_content[to_index] = temp;
            setValue(`content.${group_index}.content` as any, current_content, { shouldDirty: true });
        }
    };

    const move_up = (index: number) => {
        if (index > 0) move(index, index - 1);
    };

    const move_down = (index: number) => {
        if (index < fields.length - 1) move(index, index + 1);
    };

    const content_watch = watch('content');
    
    const used_lesson_ids = content_watch.reduce((acc: string[], item: any) => {
        if (item.type === 'lesson') {
            acc.push(item.lesson_id);
        } else if (item.type === 'group') {
            (item.content || []).forEach((c: any) => {
                if (c.type === 'lesson') acc.push(c.lesson_id);
            });
        }
        return acc;
    }, []);

    const used_test_ids = content_watch.reduce((acc: string[], item: any) => {
        if (item.type === 'test') {
            acc.push(item.test_id);
        } else if (item.type === 'group') {
            (item.content || []).forEach((c: any) => {
                if (c.type === 'test') acc.push(c.test_id);
            });
        }
        return acc;
    }, []);

    return {
        control,
        errors,
        is_valid: isValid,
        fields,
        used_lesson_ids,
        used_test_ids,
        register,
        handleSubmit,
        setValue,
        watch,
        remove,
        handle_add_group,
        handle_add_lesson,
        handle_add_test,
        handle_add_item_to_group,
        handle_remove_item_from_group,
        handle_move_item_in_group,
        move_up,
        move_down,
    };
}
