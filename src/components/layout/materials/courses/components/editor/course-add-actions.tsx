import { Group, Button, Menu, ActionIcon, Tooltip, Select } from '@mantine/core';
import { 
    IoAddOutline, 
    IoPlayCircleOutline,
    IoCheckmarkDoneCircleOutline,
    IoFolderOutline
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Props {
    on_add_group: () => void;
    on_add_lesson: (id: string) => void;
    on_add_test: (id: string) => void;
    on_create_item: (type: 'lesson' | 'test') => void;
    all_lessons: any[];
    all_tests: any[];
    used_lesson_ids: string[];
    used_test_ids: string[];
}

/**
 * Compact buttons for adding groups, lessons, and tests
 */
export function CourseAddActions({ 
    on_add_group, 
    on_add_lesson, 
    on_add_test, 
    all_lessons, 
    all_tests, 
    used_lesson_ids, 
    used_test_ids,
    on_create_item
}: Props) {
    const t = useTranslations('Materials.courses');
    const t_test = useTranslations('Materials.tests');
    const common_t = useTranslations('Common');

    const [lesson_select_open, set_lesson_select_open] = useState(false);
    const [test_select_open, set_test_select_open] = useState(false);

    return (
        <Group justify="center" gap="sm" mt="sm">
            <Tooltip label={t('form.add_group')} withArrow>
                <Button 
                    variant="light" 
                    color="gray"
                    radius="xl"
                    size="sm"
                    leftSection={<IoFolderOutline size={16} />} 
                    onClick={on_add_group}
                >
                    {t('form.add_group')}
                </Button>
            </Tooltip>

            <Group gap="xs" wrap="nowrap">
                {lesson_select_open ? (
                    <Select
                        data={all_lessons.filter(l => !used_lesson_ids.includes(l.id)).map(l => ({ value: l.id, label: l.name }))}
                        placeholder={t('form.add_lesson')}
                        searchable
                        size="sm"
                        radius="xl"
                        onDropdownClose={() => set_lesson_select_open(false)}
                        onChange={(val) => {
                            if (val) {
                                on_add_lesson(val);
                                set_lesson_select_open(false);
                            }
                        }}
                        autoFocus
                        leftSection={<IoPlayCircleOutline size={14} />}
                    />
                ) : (
                    <Button 
                        variant="light" 
                        color="green"
                        radius="xl"
                        size="sm"
                        leftSection={<IoPlayCircleOutline size={16} />} 
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
                        size="lg" 
                        onClick={() => on_create_item('lesson')}
                    >
                        <IoAddOutline size={20} />
                    </ActionIcon>
                </Tooltip>
            </Group>

            <Group gap="xs" wrap="nowrap">
                {test_select_open ? (
                    <Select
                        data={all_tests.filter(t => !used_test_ids.includes(t.id)).map(t => ({ value: t.id, label: t.name }))}
                        placeholder={t_test('add_test') || 'Add test'}
                        searchable
                        size="sm"
                        radius="xl"
                        onDropdownClose={() => set_test_select_open(false)}
                        onChange={(val) => {
                            if (val) {
                                on_add_test(val);
                                set_test_select_open(false);
                            }
                        }}
                        autoFocus
                        leftSection={<IoCheckmarkDoneCircleOutline size={14} />}
                    />
                ) : (
                    <Button 
                        variant="light" 
                        color="orange"
                        radius="xl"
                        size="sm"
                        leftSection={<IoCheckmarkDoneCircleOutline size={16} />} 
                        onClick={() => set_test_select_open(true)}
                    >
                        {t_test('add_test') || 'Add test'}
                    </Button>
                )}
                <Tooltip label={common_t('create_test') || "Create Test"} withArrow>
                    <ActionIcon 
                        variant="light" 
                        color="orange" 
                        radius="xl" 
                        size="lg" 
                        onClick={() => on_create_item('test')}
                    >
                        <IoAddOutline size={20} />
                    </ActionIcon>
                </Tooltip>
            </Group>
        </Group>
    );
}
