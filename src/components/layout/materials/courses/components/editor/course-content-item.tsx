import { 
    Paper, 
    Group, 
    ActionIcon, 
    Stack, 
    TextInput, 
    Text, 
    Box, 
    Select,
    Button,
    Tooltip,
    rem,
    ThemeIcon,
    Badge,
} from '@mantine/core';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { 
    IoTrashOutline, 
    IoPlayCircleOutline,
    IoCheckmarkDoneCircleOutline,
    IoDocumentTextOutline,
    IoReorderTwoOutline,
    IoAddOutline
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { CourseContentItem, CreateCourseForm } from '../../schemas/course-schema';
import { Draggable, Droppable } from '@hello-pangea/dnd';

interface Props {
    index: number;
    field_id: string;
    content_item: CourseContentItem;
    all_lessons: any[];
    all_tests: any[];
    used_lesson_ids: string[];
    used_test_ids: string[];
    is_dragging_group: boolean;
    register: UseFormRegister<CreateCourseForm>;
    watch: UseFormWatch<CreateCourseForm>;
    on_move_up: (index: number) => void;
    on_move_down: (index: number) => void;
    on_remove: (index: number) => void;
    on_add_item_to_group: (group_index: number, type: 'lesson' | 'test', item_id: string) => void;
    on_remove_item_from_group: (group_index: number, item_index: number) => void;
    on_move_item_in_group: (group_index: number, from_index: number, to_index: number) => void;
    on_create_item: (type: 'lesson' | 'test') => void;
}

/**
 * Individual course content item (Lesson, Group, or Test)
 */
export function ContentItem({ 
    index, 
    field_id,
    content_item, 
    all_lessons,
    all_tests,
    used_lesson_ids,
    used_test_ids,
    is_dragging_group,
    register, 
    watch, 
    on_remove,
    on_add_item_to_group,
    on_remove_item_from_group,
    on_create_item
}: Props) {
    const t = useTranslations('Materials.courses');
    const t_test = useTranslations('Materials.tests');
    const t_hw = useTranslations('Materials.homework');
    const common_t = useTranslations('Common');

    const [lesson_select_open, set_lesson_select_open] = useState(false);
    const [test_select_open, set_test_select_open] = useState(false);

    const group_content = watch(`content.${index}.content` as any) || [];

    const is_group = content_item.type === 'group';
    const is_lesson = content_item.type === 'lesson';

    return (
        <Draggable draggableId={field_id} index={index}>
            {(provided, snapshot) => {
                const usePortal = snapshot.isDragging && typeof window !== 'undefined';
                const child = (
                    <Paper 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={provided.draggableProps.style}
                    withBorder 
                    p={is_group ? "sm" : 6} 
                    radius={is_group ? "lg" : "md"} 
                    className={cn(
                        "relative transition-all shadow-sm",
                        is_group ? "bg-white/5 border-white/10" : (is_lesson ? "bg-white/5" : "bg-orange-500/5 border-orange-500/10"),
                        snapshot.isDragging && "shadow-2xl border-blue-500/50 z-[100] !bg-zinc-800"
                    )}
                >
                    <Group justify="space-between" mb={is_group ? "sm" : 0} wrap="nowrap" align="center" className={cn(is_group ? "p-[6px]!" : "p-0")}>
                        <Group gap={8} align="center" className="flex-1 w-full">
                            <Box 
                                {...provided.dragHandleProps} 
                                className="cursor-grab hover:bg-white/10 p-[2px] rounded-md transition-colors opacity-40 hover:opacity-100 mr-2"
                            >
                                <IoReorderTwoOutline size={16} />
                            </Box>

                            {is_group ? (
                                <TextInput
                                    placeholder={t('form.group_title')}
                                    className="flex-1 max-w-[200px] sm:max-w-xs"
                                    {...register(`content.${index}.title` as any)}
                                    variant="unstyled"
                                    fw={700}
                                    autoFocus={!watch(`content.${index}.title` as any)}
                                    styles={{ input: { fontSize: rem(16), padding: '0 8px' } }}
                                />
                            ) : is_lesson ? (
                                (() => {
                                    const lesson = all_lessons.find(l => l.id === (content_item as any).lesson_id);
                                    return (
                                        <Group gap="sm" wrap="nowrap" align="center" className="flex-1">
                                            <IoPlayCircleOutline size={16} />
                                            <Text size="xs" fw={500} className="line-clamp-1">{lesson?.name || 'Unknown Lesson'}</Text>
                                            {lesson?.homework_id && (
                                                <Badge size="xs" variant="light" color="indigo" radius="sm" leftSection={<Text span mt={2}><IoDocumentTextOutline size={10} /></Text>}>
                                                    {t_hw('title')}
                                                </Badge>
                                            )}
                                        </Group>
                                    );
                                })()
                            ) : (
                                (() => {
                                    const test = all_tests.find(ts => ts.id === (content_item as any).test_id);
                                    return (
                                        <Group gap="sm" wrap="nowrap" align="center" className="flex-1">
                                            <IoCheckmarkDoneCircleOutline size={16} />
                                            <Text size="xs" fw={600} className="line-clamp-1">{test?.name || 'Unknown Test'}</Text>
                                        </Group>
                                    );
                                })()
                            )}
                        </Group>

                        <ActionIcon color="red" variant="subtle" size="xs" onClick={() => on_remove(index)}>
                            <IoTrashOutline size={14} />
                        </ActionIcon>
                    </Group>

                    {is_group && (
                        <Stack gap="xs" pl={{ base: 10, sm: 36 }} className="border-l-2 border-white/5 ml-4 mt-2">
                            <Droppable droppableId={`group-${index}`} type="COURSE_ITEM" isDropDisabled={is_dragging_group}>
                                {(dropProvided, dropSnapshot) => (
                                    <div 
                                        ref={dropProvided.innerRef} 
                                        {...dropProvided.droppableProps}
                                        className={cn(
                                            "flex flex-col gap-2 min-h-[10px] rounded-lg transition-colors p-1",
                                            dropSnapshot.isDraggingOver && "bg-white/5"
                                        )}
                                    >
                                        {group_content.length > 0 && (
                                            group_content.map((item: any, item_idx: number) => {
                                                const is_item_lesson = item.type === 'lesson';
                                                const lesson = is_item_lesson ? all_lessons.find(l => l.id === item.lesson_id) : null;
                                                const test = !is_item_lesson ? all_tests.find(ts => ts.id === item.test_id) : null;

                                                return (
                                                    <Draggable key={item.id || `${item_idx}`} draggableId={item.id || `temp-${item_idx}`} index={item_idx}>
                                                        {(dragProvided, dragSnapshot) => {
                                                            const innerUsePortal = dragSnapshot.isDragging && typeof window !== 'undefined';
                                                            const innerChild = (
                                                                <Paper 
                                                                    ref={dragProvided.innerRef}
                                                                {...dragProvided.draggableProps}
                                                                style={dragProvided.draggableProps.style}
                                                                withBorder 
                                                                p={6}
                                                                radius="md" 
                                                                className={cn(
                                                                    "border-white/5 shadow-sm transition-shadow",
                                                                    is_item_lesson ? "bg-white/5" : "bg-orange-500/5 border-orange-500/10",
                                                                    dragSnapshot.isDragging && "shadow-xl border-blue-500/50 z-[100] !bg-zinc-800"
                                                                )}
                                                            >
                                                                <Group justify="space-between" wrap="nowrap" align="center">
                                                                    <Group gap="sm" wrap="nowrap" align="center">
                                                                        <Box 
                                                                            {...dragProvided.dragHandleProps} 
                                                                            className="cursor-grab hover:bg-white/10 p-[2px] rounded-md transition-colors opacity-40 hover:opacity-100 -ml-1"
                                                                        >
                                                                            <IoReorderTwoOutline size={16} />
                                                                        </Box>
                                                                        {is_item_lesson ? (
                                                                            <IoPlayCircleOutline size={16} />
                                                                        ) : (
                                                                            <IoCheckmarkDoneCircleOutline size={16} />
                                                                        )}
                                                                        <Text size="xs" fw={is_item_lesson ? 500 : 600} className="line-clamp-1">
                                                                            {is_item_lesson ? (lesson?.name || 'Unknown Lesson') : (test?.name || 'Unknown Test')}
                                                                        </Text>
                                                                        {is_item_lesson && lesson?.homework_id && (
                                                                            <Badge size="xs" variant="light" color="indigo" radius="sm" leftSection={<Text span mt={2}><IoDocumentTextOutline size={10} /></Text>}>
                                                                                {t_hw('title')}
                                                                            </Badge>
                                                                        )}
                                                                    </Group>
                                                                    <ActionIcon size="xs" color="gray" variant="subtle" onClick={() => on_remove_item_from_group(index, item_idx)}>
                                                                        <IoTrashOutline size={14} />
                                                                    </ActionIcon>
                                                                </Group>
                                                            </Paper>
                                                            );
                                                            if (innerUsePortal) return createPortal(innerChild, document.body) as any;
                                                            return innerChild;
                                                        }}
                                                    </Draggable>
                                                );
                                            })
                                        )}
                                        {dropProvided.placeholder}
                                    </div>
                                )}
                            </Droppable>

                            <Group gap="sm" mt="xs" className="px-1 flex-col sm:flex-row">
                                <Group gap="xs" wrap="nowrap" className="flex-1 w-full">
                                    {lesson_select_open ? (
                                        <Select
                                            data={all_lessons.filter(l => !used_lesson_ids.includes(l.id)).map(l => ({ value: l.id, label: l.name }))}
                                            placeholder={t('form.add_lesson')}
                                            searchable
                                            size="xs"
                                            radius="xl"
                                            className="flex-1"
                                            onDropdownClose={() => set_lesson_select_open(false)}
                                            onChange={(val) => {
                                                if (val) {
                                                    on_add_item_to_group(index, 'lesson', val);
                                                    set_lesson_select_open(false);
                                                }
                                            }}
                                            autoFocus
                                            leftSection={<IoPlayCircleOutline size={12} />}
                                        />
                                    ) : (
                                        <Button 
                                            variant="light" 
                                            color="green"
                                            radius="xl"
                                            size="xs"
                                            className="flex-1"
                                            leftSection={<IoPlayCircleOutline size={14} />}
                                            onClick={() => set_lesson_select_open(true)}
                                        >
                                            {t('form.add_lesson')}
                                        </Button>
                                    )}
                                    <Tooltip label={common_t('create_lesson') || "Create Lesson"} withArrow>
                                        <ActionIcon 
                                            variant="light" 
                                            color="green" 
                                            radius="xl" 
                                            size="md" 
                                            onClick={() => on_create_item('lesson')}
                                        >
                                            <IoAddOutline size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>

                                <Group gap="xs" wrap="nowrap" className="flex-1 w-full">
                                    {test_select_open ? (
                                        <Select
                                            data={all_tests.filter(ts => !used_test_ids.includes(ts.id)).map(ts => ({ value: ts.id, label: ts.name }))}
                                            placeholder={t_test('add_test')}
                                            searchable
                                            size="xs"
                                            radius="xl"
                                            className="flex-1"
                                            onDropdownClose={() => set_test_select_open(false)}
                                            onChange={(val) => {
                                                if (val) {
                                                    on_add_item_to_group(index, 'test', val);
                                                    set_test_select_open(false);
                                                }
                                            }}
                                            autoFocus
                                            leftSection={<IoCheckmarkDoneCircleOutline size={12} />}
                                        />
                                    ) : (
                                        <Button 
                                            variant="light" 
                                            color="orange"
                                            radius="xl"
                                            size="xs"
                                            className="flex-1"
                                            leftSection={<IoCheckmarkDoneCircleOutline size={14} />}
                                            onClick={() => set_test_select_open(true)}
                                        >
                                            {t_test('add_test')}
                                        </Button>
                                    )}
                                    <Tooltip label={common_t('create_test') || "Create Test"} withArrow>
                                        <ActionIcon 
                                            variant="light" 
                                            color="orange" 
                                            radius="xl" 
                                            size="md" 
                                            onClick={() => on_create_item('test')}
                                        >
                                            <IoAddOutline size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Group>
                        </Stack>
                    )}
                </Paper>
                );

                if (usePortal) return createPortal(child, document.body) as any;
                return child;
            }}
        </Draggable>
    );
}
