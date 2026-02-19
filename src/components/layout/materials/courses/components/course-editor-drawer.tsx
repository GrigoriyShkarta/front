'use client';

import { 
    Drawer, 
    Stack, 
    TextInput, 
    Textarea, 
    Button, 
    Group, 
    Text, 
    Divider, 
    ActionIcon, 
    Paper,
    Box,
    MultiSelect,
    rem,
    Tooltip,
    Badge,
    ScrollArea
} from '@mantine/core';
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
    IoAddOutline, 
    IoTrashOutline, 
    IoMenuOutline,
    IoImageOutline,
    IoChevronUpOutline,
    IoChevronDownOutline,
    IoBookOutline,
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { create_course_schema, CreateCourseForm, CourseMaterial, CourseContentItem } from '../schemas/course-schema';
import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { useLessons } from '@/components/layout/materials/lessons/hooks/use-lessons';
import { CategoryDrawer } from '@/components/layout/categories/components/category-drawer';
import { MediaPickerModal } from '@/components/layout/materials/lessons/components/media-picker-modal';

interface Props {
    opened: boolean;
    onClose: () => void;
    course?: CourseMaterial | null;
    onSave: (data: CreateCourseForm) => Promise<boolean>;
    is_saving?: boolean;
}

export function CourseEditorDrawer({ opened, onClose, course, onSave, is_saving }: Props) {
    const t = useTranslations('Materials.courses');
    const common_t = useTranslations('Common');
    const tCat = useTranslations('Categories');
    
    const { categories, create_category, is_pending: is_cat_pending } = useCategories();
    const [cat_drawer_opened, setCatDrawerOpened] = useState(false);
    const [media_picker_opened, setMediaPickerOpened] = useState(false);
    
    // Fetch lessons
    const { lessons: all_lessons } = useLessons({ 
        page: 1, 
        limit: 100, 
        search: '' 
    });

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
        resolver: zodResolver(create_course_schema),
        defaultValues: {
            name: '',
            description: '',
            image_url: '',
            category_ids: [],
            content: []
        }
    });

    const { fields, append, remove, move, insert } = useFieldArray({
        control,
        name: "content"
    });

    useEffect(() => {
        if (course) {
            reset({
                name: course.name,
                description: course.description || '',
                image_url: course.image_url || '',
                category_ids: course.categories?.map(c => c.id) || [],
                content: course.content.map(item => ({
                    ...item
                }))
            });
        } else {
            reset({
                name: '',
                description: '',
                image_url: '',
                category_ids: [],
                content: []
            });
        }
    }, [course, opened, reset]);

    const onSubmitHandler: SubmitHandler<CreateCourseForm> = async (values) => {
        const success = await onSave(values);
        if (success) {
            onClose();
        }
    };

    const handle_add_group = () => {
        append({
            type: 'group',
            id: crypto.randomUUID(),
            title: '',
            lesson_ids: []
        });
    };

    const handle_add_lesson = (lesson_id: string) => {
        append({
            type: 'lesson',
            id: crypto.randomUUID(),
            lesson_id: lesson_id
        });
    };

    const handle_add_lesson_to_group = (groupIndex: number, lessonId: string) => {
        const currentIds = getValues(`content.${groupIndex}.lesson_ids` as any) || [];
        if (!currentIds.includes(lessonId)) {
            setValue(`content.${groupIndex}.lesson_ids` as any, [...currentIds, lessonId], { shouldDirty: true });
        }
    };

    const handle_remove_lesson_from_group = (groupIndex: number, lessonIndex: number) => {
        const currentIds = [...(getValues(`content.${groupIndex}.lesson_ids` as any) || [])];
        currentIds.splice(lessonIndex, 1);
        setValue(`content.${groupIndex}.lesson_ids` as any, currentIds, { shouldDirty: true });
    };

    const move_up = (index: number) => {
        if (index > 0) move(index, index - 1);
    };

    const move_down = (index: number) => {
        if (index < fields.length - 1) move(index, index + 1);
    };

    const handle_move_lesson_in_group = (groupIndex: number, fromIndex: number, toIndex: number) => {
        const currentIds = [...(getValues(`content.${groupIndex}.lesson_ids` as any) || [])];
        if (toIndex >= 0 && toIndex < currentIds.length) {
            const temp = currentIds[fromIndex];
            currentIds[fromIndex] = currentIds[toIndex];
            currentIds[toIndex] = temp;
            setValue(`content.${groupIndex}.lesson_ids` as any, currentIds, { shouldDirty: true });
        }
    };

    // Helper to get all lesson IDs already used in the course
    const content_watch = watch('content');
    const used_lesson_ids = content_watch.reduce((acc: string[], item: any) => {
        if (item.type === 'lesson') {
            acc.push(item.lesson_id);
        } else if (item.type === 'group') {
            acc.push(...(item.lesson_ids || []));
        }
        return acc;
    }, []);



    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={course ? t('edit_course') : t('add_course')}
            position="right"
            size="xl"
            padding="xl"
            styles={{
                header: { borderBottom: '1px solid var(--border-color)', marginBottom: rem(16) },
                body: { height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }
            }}
        >
            <form onSubmit={handleSubmit(onSubmitHandler)} className="flex flex-col h-full">
                <ScrollArea className="flex-1 -mx-4 px-4">
                    <Stack gap="xl" pb="xl">
                        {/* Basic Info */}
                        <Stack gap="md">
                            <Group justify="center" className="w-full">
                            <Box className="w-full flex flex-col gap-2">
                                <Box 
                                    className="w-full h-44 rounded-xl bg-black/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer overflow-hidden relative hover:border-[var(--mantine-primary-color-filled)]"
                                    onClick={() => setMediaPickerOpened(true)}
                                >
                                    {watch('image_url') ? (
                                        <>
                                            <img src={watch('image_url')!} className="w-full h-full object-cover" />
                                            <Box className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                                <IoImageOutline size={20} color="white" />
                                                <Text c="white" size="xs" fw={500}>{t('form.upload_image')}</Text>
                                            </Box>
                                        </>
                                    ) : (
                                        <>
                                            <IoImageOutline size={32} color="gray" />
                                            <Stack gap={2} align="center">
                                                <Text size="xs" c="dimmed" fw={500}>{t('form.upload_image')}</Text>
                                                <Text size="xs" c="dimmed" fs="italic">
                                                    {t('form.library_upload_hint')}
                                                </Text>
                                            </Stack>
                                        </>
                                    )}
                                </Box>
                                {watch('image_url') && (
                                    <Button 
                                        variant="subtle" 
                                        color="red" 
                                        size="compact-xs" 
                                        leftSection={<IoTrashOutline size={14} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setValue('image_url', '');
                                        }}
                                    >
                                        {common_t('clear')}
                                    </Button>
                                )}
                            </Box>
                        </Group>

                            <TextInput
                                label={t('form.name')}
                                required
                                placeholder={t('form.placeholder_name')}
                                {...register('name')}
                                error={errors.name?.message}
                                variant="filled"
                            />

                            <Textarea
                                label={t('form.description')}
                                placeholder={t('form.placeholder_description')}
                                {...register('description')}
                                variant="filled"
                                autosize
                                minRows={3}
                            />

                            <Stack gap={4}>
                                <Text size="sm" fw={500}>{tCat('title')}</Text>
                                <Group gap="xs" align="flex-end" wrap="nowrap">
                                    <Controller
                                        name="category_ids"
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                data={categories.map(c => ({ value: c.id, label: c.name }))}
                                                placeholder={tCat('select_categories')}
                                                searchable
                                                variant="filled"
                                                className="flex-1"
                                                {...field}
                                            />
                                        )}
                                    />
                                    <Tooltip label={tCat('add_category')}>
                                        <ActionIcon 
                                            size={42}
                                            variant="light"
                                            color="primary"
                                            onClick={() => setCatDrawerOpened(true)}
                                        >
                                            <IoAddOutline size={20} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Stack>
                        </Stack>

                        <Divider label={t('form.add_group')} labelPosition="center" />

                        {/* Content (Mixed) */}
                        <Stack gap="md">
                            {fields.map((field, index) => {
                                const content_item = field as unknown as CourseContentItem;
                                
                                return (
                                    <Paper key={field.id} withBorder p="md" radius="md" className="bg-white/2 relative">
                                        {/* Reorder Controls (Internal) */}
                                        <Group justify="space-between" mb="xs" wrap="nowrap">
                                            <Group gap={4}>
                                                <ActionIcon variant="light" size="sm" onClick={() => move_up(index)} disabled={index === 0}>
                                                    <IoChevronUpOutline />
                                                </ActionIcon>
                                                <ActionIcon variant="light" size="sm" onClick={() => move_down(index)} disabled={index === fields.length - 1}>
                                                    <IoChevronDownOutline />
                                                </ActionIcon>
                                                <Badge variant="outline" size="xs" color="gray">#{index + 1}</Badge>
                                            </Group>
                                            <ActionIcon 
                                                color="red" 
                                                variant="subtle" 
                                                size="sm"
                                                onClick={() => remove(index)}
                                            >
                                                <IoTrashOutline size={16} />
                                            </ActionIcon>
                                        </Group>

                                        {content_item.type === 'group' ? (
                                            <Stack gap="sm">
                                                <Group gap="xs" className="flex-1">
                                                    <IoMenuOutline className="text-gray-400" />
                                                    <TextInput
                                                        placeholder={t('form.group_title')}
                                                        className="flex-1"
                                                        {...register(`content.${index}.title` as any)}
                                                        variant="unstyled"
                                                        fw={600}
                                                        styles={{ input: { fontSize: rem(16) } }}
                                                    />
                                                </Group>

                                                {/* Lessons inside group */}
                                                <Stack gap={4} pl="md" className="border-l border-white/10">
                                                    {(watch(`content.${index}.lesson_ids` as any) || []).map((lessonId: string, lessonIndex: number) => {
                                                        const lesson = all_lessons.find(l => l.id === lessonId);
                                                        return (
                                                            <Paper key={`${lessonId}-${lessonIndex}`} withBorder px="sm" py={6} radius="sm" className="bg-white/5">
                                                                <Group justify="space-between" wrap="nowrap">
                                                                    <Group gap="xs" wrap="nowrap">
                                                                        <Group gap={2}>
                                                                            <ActionIcon 
                                                                                size="xs" 
                                                                                variant="light" 
                                                                                onClick={() => handle_move_lesson_in_group(index, lessonIndex, lessonIndex - 1)}
                                                                                disabled={lessonIndex === 0}
                                                                            >
                                                                                <IoChevronUpOutline size={10} />
                                                                            </ActionIcon>
                                                                            <ActionIcon 
                                                                                size="xs" 
                                                                                variant="light" 
                                                                                onClick={() => handle_move_lesson_in_group(index, lessonIndex, lessonIndex + 1)}
                                                                                disabled={lessonIndex === (watch(`content.${index}.lesson_ids` as any) || []).length - 1}
                                                                            >
                                                                                <IoChevronDownOutline size={10} />
                                                                            </ActionIcon>
                                                                        </Group>
                                                                        <IoBookOutline size={14} color="var(--mantine-primary-color-filled)" />
                                                                        <Text size="xs">{lesson?.name || 'Unknown Lesson'}</Text>
                                                                    </Group>
                                                                    <ActionIcon 
                                                                        size="xs" 
                                                                        color="gray" 
                                                                        variant="subtle"
                                                                        onClick={() => handle_remove_lesson_from_group(index, lessonIndex)}
                                                                    >
                                                                        <IoTrashOutline size={12} />
                                                                    </ActionIcon>
                                                                </Group>
                                                            </Paper>
                                                        );
                                                    })}

                                                    <MultiSelect
                                                        placeholder={t('form.add_lesson')}
                                                        data={all_lessons
                                                            .filter(l => !used_lesson_ids.includes(l.id))
                                                            .map(l => ({ value: l.id, label: l.name }))}
                                                        onChange={(selected) => {
                                                            const last = selected[selected.length - 1];
                                                            if (last) {
                                                                handle_add_lesson_to_group(index, last);
                                                            }
                                                        }}
                                                        value={[]}
                                                        searchable
                                                        className="mt-2"
                                                        size="xs"
                                                        variant="filled"
                                                    />
                                                </Stack>
                                            </Stack>
                                        ) : (
                                            <Stack gap="sm">
                                                <Group gap="xs" className="flex-1">
                                                    <IoMenuOutline className="text-gray-400" />
                                                    <Box className="flex-1 bg-white/5 py-2 px-3 rounded-md border border-white/5">
                                                        <Group justify="space-between">
                                                            <Group gap="xs">
                                                                <IoBookOutline size={18} color="var(--mantine-primary-color-filled)" />
                                                                <Text size="sm" fw={500}>
                                                                    {all_lessons.find(l => l.id === (content_item as any).lesson_id)?.name || 'Unknown Lesson'}
                                                                </Text>
                                                            </Group>
                                                        </Group>
                                                    </Box>
                                                </Group>
                                            </Stack>
                                        )}
                                    </Paper>
                                );
                            })}

                            {fields.length === 0 && (
                                <Box className="py-8 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center opacity-50">
                                    <Text size="sm">{t('form.no_groups')}</Text>
                                </Box>
                            )}

                            <Group grow>
                                <Button 
                                    variant="light" 
                                    leftSection={<IoAddOutline size={18} />}
                                    onClick={handle_add_group}
                                >
                                    {t('form.add_group')}
                                </Button>
                                
                                <MultiSelect
                                    placeholder={t('form.add_lesson')}
                                    data={all_lessons
                                        .filter(l => !used_lesson_ids.includes(l.id))
                                        .map(l => ({ value: l.id, label: l.name }))}
                                    onChange={(selected) => {
                                        const last = selected[selected.length - 1];
                                        if (last) handle_add_lesson(last);
                                    }}
                                    value={[]}
                                    searchable
                                    variant="light"
                                    radius="md"
                                    leftSection={<IoBookOutline size={18} color="var(--mantine-primary-color-filled)" />}
                                />
                            </Group>
                        </Stack>
                    </Stack>
                </ScrollArea>

                <Box className="pt-xl border-t border-zinc-300 dark:border-white/10 mt-auto" style={{ backgroundColor: 'transparent' }}>
                    <Button 
                        type="submit" 
                        fullWidth 
                        loading={is_saving}
                        disabled={!isValid}
                        size="md"
                        radius="md"
                        className="h-12"
                        color="primary"
                        variant="filled"
                    >
                        {common_t('save')}
                    </Button>
                </Box>
            </form>

            <CategoryDrawer 
                opened={cat_drawer_opened}
                onClose={() => setCatDrawerOpened(false)}
                onSubmit={async (data) => {
                    if (Array.isArray(data)) {
                        // Assuming the user mostly adds one via this UI
                        await create_category(data[0]);
                    } else {
                        await create_category(data);
                    }
                }}
                loading={is_cat_pending}
            />

            <MediaPickerModal 
                opened={media_picker_opened}
                onClose={() => setMediaPickerOpened(false)}
                type="image"
                onSelect={(media) => {
                    setValue('image_url', media.url);
                    setMediaPickerOpened(false);
                }}
            />
        </Drawer>
    );
}
