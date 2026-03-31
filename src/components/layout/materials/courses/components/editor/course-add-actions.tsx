import { Group, Button, MultiSelect } from '@mantine/core';
import { 
    IoAddOutline, 
    IoPlayCircleOutline,
    IoCheckmarkDoneCircleOutline 
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';

interface Props {
    on_add_group: () => void;
    on_add_lesson: (id: string) => void;
    on_add_test: (id: string) => void;
    all_lessons: any[];
    all_tests: any[];
    used_lesson_ids: string[];
    used_test_ids: string[];
}

/**
 * Buttons for adding groups, lessons, and tests at the bottom of the course structure
 */
export function CourseAddActions({ 
    on_add_group, 
    on_add_lesson, 
    on_add_test, 
    all_lessons, 
    all_tests, 
    used_lesson_ids, 
    used_test_ids 
}: Props) {
    const t = useTranslations('Materials.courses');
    const t_test = useTranslations('Materials.tests');

    return (
        <>
            <Group grow>
                <Button 
                    variant="light" 
                    leftSection={<IoAddOutline size={18} />} 
                    onClick={on_add_group}
                    radius="md"
                >
                    {t('form.add_group')}
                </Button>
            </Group>

            <Group grow>
                <MultiSelect
                    placeholder={t('form.add_lesson')}
                    data={all_lessons
                        .filter(l => !used_lesson_ids.includes(l.id))
                        .map(l => ({ value: l.id, label: l.name }))
                    }
                    onChange={(selected) => {
                        const last = selected[selected.length - 1];
                        if (last) on_add_lesson(last);
                    }}
                    value={[]}
                    searchable
                    variant="light"
                    radius="xl"
                    leftSection={<IoPlayCircleOutline size={18} />}
                />

                <MultiSelect
                    placeholder={t_test('add_test') || 'Add test'}
                    data={all_tests
                        .filter(t => !used_test_ids.includes(t.id))
                        .map(t => ({ value: t.id, label: t.name }))
                    }
                    onChange={(selected) => {
                        const last = selected[selected.length - 1];
                        if (last) on_add_test(last);
                    }}
                    value={[]}
                    searchable
                    variant="light"
                    radius="xl"
                    leftSection={<IoCheckmarkDoneCircleOutline size={18} />}
                />
            </Group>
        </>
    );
}
