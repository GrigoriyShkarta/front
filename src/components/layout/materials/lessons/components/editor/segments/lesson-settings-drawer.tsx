'use client';

import { Drawer, Stack, Box, Text, NumberInput, Divider, MultiSelect, Select, Switch, Group } from '@mantine/core';

interface LessonSettingsDrawerProps {
    opened: boolean;
    onClose: () => void;
    duration: number | string | null;
    onDurationChange: (val: string | number) => void;
    categoryIds: string[];
    onCategoriesChange: (val: string[]) => void;
    all_categories: any[];
    homeworkId: string | null;
    onHomeworkChange: (val: string | null) => void;
    all_homeworks: any[];
    courseIds: string[];
    onCoursesChange: (val: string[]) => void;
    all_courses: any[];
    isCopyingDisabled: boolean;
    onToggleCopying: (val: boolean) => void;
    addFilesToMaterials: boolean;
    onToggleAddFiles: (val: boolean) => void;
    onOpenCategoryDrawer: () => void;
    t: (key: string) => string;
    common_t: (key: string) => string;
}

export function LessonSettingsDrawer({
    opened, onClose, duration, onDurationChange, categoryIds, onCategoriesChange,
    all_categories, homeworkId, onHomeworkChange, all_homeworks, courseIds, onCoursesChange,
    all_courses, isCopyingDisabled, onToggleCopying, addFilesToMaterials, onToggleAddFiles,
    onOpenCategoryDrawer, t, common_t
}: LessonSettingsDrawerProps) {
    return (
        <Drawer 
            opened={opened} onClose={onClose} position="right" title={common_t('additional')} size="md" 
            styles={{ header: { padding: '24px 32px' }, body: { padding: '0 32px 32px' } }}
        >
            <Stack gap="xl">
                <Box>
                    <Text size="sm" fw={600} mb={8}>{t('editor.duration')}</Text>
                    <NumberInput 
                        placeholder={t('editor.duration_placeholder')} value={duration || ''} 
                        onChange={onDurationChange} min={1} max={999} hideControls
                    />
                </Box>

                <Divider />

                <Box>
                    <Group justify="space-between" mb={8}>
                        <Text size="sm" fw={600}>{t('table.categories')}</Text>
                        <Text size="xs" c="primary" style={{ cursor: 'pointer' }} onClick={onOpenCategoryDrawer}>
                            {common_t('add')}
                        </Text>
                    </Group>
                    <MultiSelect 
                        data={all_categories?.map(c => ({ value: c.id, label: c.name })) || []}
                        value={categoryIds} onChange={onCategoriesChange} placeholder={t('editor.add_to_course_placeholder')} clearable
                    />
                </Box>

                <Box>
                    <Text size="sm" fw={600} mb={8}>{t('editor.homework')}</Text>
                    <Select 
                        data={all_homeworks?.map(h => ({ value: h.id, label: h.name })) || []}
                        value={homeworkId} onChange={onHomeworkChange} placeholder={t('editor.select_homework')} clearable searchable
                    />
                </Box>

                <Box>
                    <Text size="sm" fw={600} mb={8}>{t('editor.add_to_course')}</Text>
                    <MultiSelect 
                        data={all_courses?.map(c => ({ value: c.id, label: c.name })) || []}
                        value={courseIds} onChange={onCoursesChange} placeholder={t('editor.add_to_course_placeholder')}
                    />
                </Box>

                <Divider />

                <Stack gap="lg">
                    <Box>
                        <Group justify="space-between" wrap="nowrap">
                            <Box><Text size="sm" fw={600}>{t('editor.disable_copying')}</Text><Text size="xs" c="dimmed">{t('editor.disable_copying_description')}</Text></Box>
                            <Switch checked={isCopyingDisabled} onChange={(e) => onToggleCopying(e.currentTarget.checked)} />
                        </Group>
                    </Box>
                    <Box>
                        <Group justify="space-between" wrap="nowrap">
                            <Box><Text size="sm" fw={600}>{t('editor.add_files_to_materials')}</Text><Text size="xs" c="dimmed">{t('editor.add_files_to_materials_description')}</Text></Box>
                            <Switch checked={addFilesToMaterials} onChange={(e) => onToggleAddFiles(e.currentTarget.checked)} />
                        </Group>
                    </Box>
                </Stack>
            </Stack>
        </Drawer>
    );
}

