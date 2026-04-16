'use client';

import { 
    Drawer, 
    Stack, 
    Button, 
    Divider, 
    Box,
    ScrollArea,
    rem,
    Group
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { IoSaveOutline, IoAddOutline } from 'react-icons/io5';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CreateCourseForm, CourseMaterial } from '../schemas/course-schema';
// ... (rest of imports unchanged)

import { useCategories } from '@/components/layout/categories/hooks/use-categories';
import { useLessons } from '@/components/layout/materials/lessons/hooks/use-lessons';
import { CategoryDrawer } from '@/components/layout/categories/components/category-drawer';
import { MediaPickerModal } from '@/components/layout/materials/lessons/components/media-picker-modal';
import { useAuth } from '@/hooks/use-auth';
import { useTests } from '@/components/layout/materials/tests/hooks/use-tests';
import { useCourseEditorForm } from '../hooks/use-course-editor-form';
import { CourseBasicInfo } from './editor/course-basic-info';
import { ContentItem } from './editor/course-content-item';
import { CourseAddActions } from './editor/course-add-actions';
import { cn } from '@/lib/utils';
import { Modal, TextInput } from '@mantine/core';
import { lessonActions } from '@/components/layout/materials/lessons/actions/lesson-actions';
import { testActions } from '@/components/layout/materials/tests/actions/test-actions';


interface Props {
    opened: boolean;
    course?: CourseMaterial | null;
    is_saving?: boolean;
    on_close: () => void;
    on_save: (data: CreateCourseForm) => Promise<boolean>;
}

/**
 * Main Course Editor Drawer component
 * Handles course creation and updates. Separates UI into logical sections.
 */
export function CourseEditorDrawer({ opened, on_close, course, on_save, is_saving }: Props) {
    const { user } = useAuth();
    const common_t = useTranslations('Common');
    const t = useTranslations('Materials.courses');
    
    const { categories, create_category, is_pending: is_cat_pending } = useCategories();
    const [cat_drawer_opened, set_cat_drawer_opened] = useState(false);
    const [media_picker_opened, set_media_picker_opened] = useState(false);
    
    const { lessons: all_lessons } = useLessons({ page: 1, limit: 100, search: '' });
    const { tests: all_tests } = useTests({ page: 1, limit: 100, search: '' });

    const router = useRouter();
    const queryClient = useQueryClient();

    const [creation_modal, set_creation_modal] = useState<{ opened: boolean; type: 'lesson' | 'test'; target_group_index: number | null }>({ opened: false, type: 'lesson', target_group_index: null });
    const [creation_name, set_creation_name] = useState('');
    const [is_creating, set_is_creating] = useState(false);
    const [success_modal, set_success_modal] = useState<{ opened: boolean; type: 'lesson' | 'test'; id: string } | null>(null);

    const {
        control,
        errors,
        is_valid,
        fields,
        used_lesson_ids,
        used_test_ids,
        is_dragging_group,
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
        on_drag_start,
        on_drag_end,
    } = useCourseEditorForm({ course, opened });

    const on_submit_handler = async (values: CreateCourseForm) => {
        const success = await on_save(values);
        if (success) on_close();
    };

    const handle_create_new_item = async () => {
        if (!creation_name.trim()) return;
        set_is_creating(true);
        try {
            let created_id = '';
            if (creation_modal.type === 'lesson') {
                const res = await lessonActions.create_lesson({ name: creation_name, course_ids: course?.id ? [course.id] : [] });
                created_id = res.id;
            } else {
                const res = await testActions.create_test({ name: creation_name, content: '[]', course_ids: course?.id ? [course.id] : [] });
                created_id = res.id;
            }

            if (creation_modal.target_group_index !== null) {
                handle_add_item_to_group(creation_modal.target_group_index, creation_modal.type, created_id);
            } else {
                if (creation_modal.type === 'lesson') handle_add_lesson(created_id);
                else handle_add_test(created_id);
            }

            queryClient.invalidateQueries({ queryKey: [creation_modal.type === 'lesson' ? 'lessons' : 'tests'] });
            
            set_creation_modal({ ...creation_modal, opened: false });
            set_creation_name('');
            set_success_modal({ opened: true, type: creation_modal.type, id: created_id });
        } catch (e) {
            console.error(e);
        } finally {
            set_is_creating(false);
        }
    };

    return (
        <Drawer
            opened={opened}
            onClose={on_close}
            title={course ? t('edit_course') : t('create_course')}
            position="right"
            size="xl"
            padding="xl"
            styles={{
                header: { borderBottom: '1px solid var(--border-color)', marginBottom: rem(16) },
                body: { height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }
            }}
        >
            <form onSubmit={handleSubmit(on_submit_handler as any)} className="flex flex-col h-full">
                <ScrollArea className="flex-1 -mx-4 px-4">
                    <Stack gap="xl" pb="xl">
                        <CourseBasicInfo 
                            register={register}
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                            categories={categories || []}
                            user={user}
                            on_add_category={() => set_cat_drawer_opened(true)}
                            on_media_picker_open={() => set_media_picker_opened(true)}
                        />

                        <Divider label={t('form.content')} labelPosition="center" />

                        <Stack gap="md">
                            <DragDropContext onDragEnd={on_drag_end} onDragStart={on_drag_start}>
                                <Droppable droppableId="root-course-content" type="COURSE_ITEM">
                                    {(provided) => (
                                        <div 
                                            {...provided.droppableProps} 
                                            ref={provided.innerRef}
                                            className="flex flex-col gap-4"
                                        >
                                            {fields.map((field, index) => (
                                                <ContentItem 
                                                    key={field.id}
                                                    field_id={field.id}
                                                    index={index}
                                                    content_item={field as any}
                                                    is_dragging_group={is_dragging_group}
                                                    register={register}
                                                    watch={watch}
                                                    on_move_up={move_up}
                                                    on_move_down={move_down}
                                                    on_remove={remove}
                                                    all_lessons={all_lessons || []}
                                                    all_tests={all_tests || []}
                                                    used_lesson_ids={used_lesson_ids}
                                                    used_test_ids={used_test_ids}
                                                    on_add_item_to_group={handle_add_item_to_group}
                                                    on_remove_item_from_group={handle_remove_item_from_group}
                                                    on_move_item_in_group={handle_move_item_in_group}
                                                    on_create_item={(type: 'lesson' | 'test') => set_creation_modal({ opened: true, type, target_group_index: index })}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                            {fields.length === 0 && (
                                <Box className="py-8 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center opacity-50">
                                    {t('form.no_groups')}
                                </Box>
                            )}

                                <CourseAddActions 
                                    on_add_group={handle_add_group}
                                    on_add_lesson={handle_add_lesson}
                                    on_add_test={handle_add_test}
                                    on_create_item={(type: 'lesson' | 'test') => set_creation_modal({ opened: true, type, target_group_index: null })}
                                    all_lessons={all_lessons || []}
                                    all_tests={all_tests || []}
                                    used_lesson_ids={used_lesson_ids}
                                    used_test_ids={used_test_ids}
                                />
                        </Stack>
                    </Stack>
                </ScrollArea>

                <Box className="pt-xl border-t border-zinc-300 dark:border-white/10 mt-auto" style={{ backgroundColor: 'transparent' }}>
                    <Button 
                        type="submit" 
                        fullWidth 
                        loading={is_saving}
                        disabled={!is_valid}
                        leftSection={<IoSaveOutline size={18} />}
                        size="md"
                        radius="md"
                        className={cn(
                            "h-12 transition-all duration-200",
                            !is_valid ? "opacity-40 grayscale-[0.5] cursor-not-allowed" : "shadow-md hover:shadow-lg active:scale-[0.98]"
                        )}
                        color="blue"
                        variant={is_valid ? "filled" : "light"}
                    >
                        {common_t('save')}
                    </Button>
                </Box>
            </form>

            <CategoryDrawer 
                opened={cat_drawer_opened}
                onClose={() => set_cat_drawer_opened(false)}
                onSubmit={async (data) => {
                    if (Array.isArray(data)) await create_category(data[0]);
                    else await create_category(data);
                }}
                loading={is_cat_pending}
            />

            <MediaPickerModal 
                opened={media_picker_opened}
                onClose={() => set_media_picker_opened(false)}
                type="image"
                onSelect={(media) => {
                    setValue('image_url', media.url);
                    set_media_picker_opened(false);
                }}
            />

            <Modal 
                opened={creation_modal.opened} 
                onClose={() => set_creation_modal({ ...creation_modal, opened: false })}
                title={creation_modal.type === 'lesson' ? common_t('create_lesson') : common_t('create_test')}
            >
                <Stack>
                    <TextInput 
                        label={common_t('name')} 
                        placeholder={common_t('enter_name')}
                        value={creation_name}
                        onChange={(e) => set_creation_name(e.currentTarget.value)}
                        data-autofocus
                        required
                    />
                    <Button 
                        onClick={handle_create_new_item} 
                        loading={is_creating}
                        disabled={!creation_name.trim()}
                        className={cn(
                            "h-12 transition-all duration-200",
                            !creation_name.trim() ? "opacity-40 grayscale-[0.5] cursor-not-allowed" : "shadow-md hover:shadow-lg active:scale-[0.98]"
                        )}
                        color="blue"
                    >
                        {common_t('create')}
                    </Button>
                </Stack>
            </Modal>

            <Modal
                opened={success_modal?.opened || false}
                onClose={() => set_success_modal(null)}
                title={common_t('success_title')}
                centered
            >
                <Stack>
                    <Box>{common_t('item_created_transition_prompt')}</Box>
                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={() => set_success_modal(null)} color="gray">
                            {common_t('stay')}
                        </Button>
                        <Button
                            className={cn(
                                "h-12 transition-all duration-200",
                                !success_modal ? "opacity-40 grayscale-[0.5] cursor-not-allowed" : "shadow-md hover:shadow-lg active:scale-[0.98]"
                            )}
                            color="blue"
                            onClick={() => {
                                if (success_modal) {
                                    router.push(`/main/materials/${success_modal.type}s/${success_modal.id}/edit`);
                                    set_success_modal(null);
                                    on_close();
                                }
                            }}
                        >
                            {common_t('go_to_editor')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Drawer>
    );
}

