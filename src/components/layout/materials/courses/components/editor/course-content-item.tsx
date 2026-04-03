import { 
    Paper, 
    Group, 
    ActionIcon, 
    Stack, 
    TextInput, 
    Text, 
    Box, 
    MultiSelect, 
    rem,
    ThemeIcon,
    Badge,
} from '@mantine/core';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { 
    IoChevronUpOutline, 
    IoChevronDownOutline, 
    IoTrashOutline, 
    IoPlayCircleOutline,
    IoCheckmarkDoneCircleOutline,
    IoDocumentTextOutline,
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { CourseContentItem, CreateCourseForm } from '../../schemas/course-schema';

interface Props {
    index: number;
    field_id: string;
    content_item: CourseContentItem;
    is_first: boolean;
    is_last: boolean;
    all_lessons: any[];
    all_tests: any[];
    used_lesson_ids: string[];
    used_test_ids: string[];
    register: UseFormRegister<CreateCourseForm>;
    watch: UseFormWatch<CreateCourseForm>;
    on_move_up: (index: number) => void;
    on_move_down: (index: number) => void;
    on_remove: (index: number) => void;
    on_add_item_to_group: (group_index: number, type: 'lesson' | 'test', item_id: string) => void;
    on_remove_item_from_group: (group_index: number, item_index: number) => void;
    on_move_item_in_group: (group_index: number, from_index: number, to_index: number) => void;
}

/**
 * Individual course content item (Lesson, Group, or Test)
 */
export function ContentItem({ 
    index, 
    field_id,
    content_item, 
    is_first,
    is_last,
    all_lessons,
    all_tests,
    used_lesson_ids,
    used_test_ids,
    register, 
    watch, 
    on_move_up, 
    on_move_down, 
    on_remove,
    on_add_item_to_group,
    on_remove_item_from_group,
    on_move_item_in_group
}: Props) {
    const t = useTranslations('Materials.courses');
    const t_test = useTranslations('Materials.tests');
    const t_hw = useTranslations('Materials.homework');

    const group_content = watch(`content.${index}.content` as any) || [];

    const is_group = content_item.type === 'group';
    const is_lesson = content_item.type === 'lesson';

    return (
        <Paper 
            key={field_id} 
            withBorder 
            p="sm" 
            radius="lg" 
            className={cn(
                "relative transition-all border-white/10 shadow-sm",
                is_group ? "bg-white/5" : "bg-white/2"
            )}
        >
            <Group justify="space-between" mb="xs" wrap="nowrap">
                <Group gap={8}>
                    <Group gap={2}>
                        <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => on_move_up(index)} disabled={is_first}>
                            <IoChevronUpOutline size={14} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => on_move_down(index)} disabled={is_last}>
                            <IoChevronDownOutline size={14} />
                        </ActionIcon>
                    </Group>
                </Group>
                <ActionIcon color="red" variant="subtle" size="sm" onClick={() => on_remove(index)}>
                    <IoTrashOutline size={16} />
                </ActionIcon>
            </Group>

            {is_group ? (
                <Stack gap="sm">
                    <Group gap="sm" className="flex-1 px-1">
                        <TextInput
                            placeholder={t('form.group_title')}
                            className="flex-1"
                            {...register(`content.${index}.title` as any)}
                            variant="unstyled"
                            fw={700}
                            styles={{ input: { fontSize: rem(18), padding: '4px' } }}
                        />
                    </Group>
                    
                    <Stack gap="xs" pl={40} className="border-l-2 border-white/5 ml-3">
                        {/* Mixed Content List */}
                        {group_content.length > 0 && (
                            <Stack gap={6}>
                                {group_content.map((item: any, item_idx: number) => {
                                    const is_item_lesson = item.type === 'lesson';
                                    const lesson = is_item_lesson ? all_lessons.find(l => l.id === item.lesson_id) : null;
                                    const test = !is_item_lesson ? all_tests.find(ts => ts.id === item.test_id) : null;

                                    return (
                                        <Paper 
                                            key={`${item.id}-${item_idx}`} 
                                            withBorder 
                                            px="sm" 
                                            py={6} 
                                            radius="lg" 
                                            className={cn(
                                                "border-white/5",
                                                is_item_lesson ? "bg-white/5" : "bg-orange-500/5 border-orange-500/10"
                                            )}
                                        >
                                            <Group justify="space-between" wrap="nowrap">
                                                <Group gap="sm" wrap="nowrap">
                                                    <Group gap={4}>
                                                        <ActionIcon size="xs" variant="subtle" onClick={() => on_move_item_in_group(index, item_idx, item_idx - 1)} disabled={item_idx === 0}>
                                                            <IoChevronUpOutline size={12} />
                                                        </ActionIcon>
                                                        <ActionIcon size="xs" variant="subtle" onClick={() => on_move_item_in_group(index, item_idx, item_idx + 1)} disabled={item_idx === group_content.length - 1}>
                                                            <IoChevronDownOutline size={12} />
                                                        </ActionIcon>
                                                    </Group>
                                                    {is_item_lesson ? (
                                                        <IoPlayCircleOutline size={16} />
                                                    ) : (
                                                        <IoCheckmarkDoneCircleOutline size={16} />
                                                    )}
                                                    <Text size="xs" fw={is_item_lesson ? 500 : 600}>
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
                                })}
                            </Stack>
                        )}

                        <Box className="mt-2 space-y-2">
                            <MultiSelect
                                placeholder={t('form.add_lesson')}
                                leftSection={<IoPlayCircleOutline size={14} />}
                                data={all_lessons.filter(l => !used_lesson_ids.includes(l.id)).map(l => ({ value: l.id, label: l.name }))}
                                onChange={(sel) => {
                                    const last = sel[sel.length - 1];
                                    if (last) on_add_item_to_group(index, 'lesson', last);
                                }}
                                value={[]}
                                searchable
                                size="xs"
                                radius="xl"
                                variant="light"
                                className="flex-1"
                            />
                             <MultiSelect
                                placeholder={t_test('add_test')}
                                leftSection={<IoCheckmarkDoneCircleOutline size={14} />}
                                data={all_tests.filter(ts => !used_test_ids.includes(ts.id)).map(ts => ({ value: ts.id, label: ts.name }))}
                                onChange={(sel) => {
                                    const last = sel[sel.length - 1];
                                    if (last) on_add_item_to_group(index, 'test', last);
                                }}
                                value={[]}
                                searchable
                                size="xs"
                                radius="xl"
                                variant="light"
                                className="flex-1"
                            />
                        </Box>
                    </Stack>
                </Stack>
            ) : is_lesson ? (
                (() => {
                    const lesson = all_lessons.find(l => l.id === (content_item as any).lesson_id);
                    return (
                        <Group gap="sm" wrap="nowrap" className="px-1">
                            <Box className="flex-1 bg-green-500/5 py-2 px-3 rounded-xl border border-green-500/10">
                                <Group justify="space-between" wrap="nowrap">
                                    <Group gap="sm">
                                        <ThemeIcon variant="light" color="green" size="md" radius="md">
                                            <IoPlayCircleOutline size={20} />
                                        </ThemeIcon>
                                        <Stack gap={0}>
                                            <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={1}>{t('form.lesson')}</Text>
                                            <Text size="sm" fw={600} className="line-clamp-1">{lesson?.name || 'Unknown Lesson'}</Text>
                                        </Stack>
                                    </Group>
                                    {lesson?.homework_id && (
                                        <Badge size="xs" variant="light" color="indigo" radius="sm" leftSection={<Text span mt={2}><IoDocumentTextOutline size={12} /></Text>}>
                                            {t_hw('title')}
                                        </Badge>
                                    )}
                                </Group>
                            </Box>
                        </Group>
                    );
                })()
            ) : (
                <Group gap="sm" wrap="nowrap" className="px-1">
                    <Box className="flex-1 bg-orange-500/5 py-2 px-3 rounded-xl border border-orange-500/10">
                        <Group gap="sm">
                            <ThemeIcon variant="light" color="orange" size="md" radius="md">
                                <IoCheckmarkDoneCircleOutline size={20} />
                            </ThemeIcon>
                            <Stack gap={0}>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={1}>{t_test('single_title')}</Text>
                                <Text size="sm" fw={700} className="line-clamp-1">{all_tests.find(ts => ts.id === (content_item as any).test_id)?.name || 'Unknown Test'}</Text>
                            </Stack>
                        </Group>
                    </Box>
                </Group>
            )}
        </Paper>
    );
}
