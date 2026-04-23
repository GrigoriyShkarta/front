'use client';

import { Drawer, Stack, Box, Text, MultiSelect, Group, ActionIcon, Tooltip, Button } from '@mantine/core';
import { IoAdd } from 'react-icons/io5';

interface NoteSettingsDrawerProps {
    opened: boolean;
    onClose: () => void;
    categoryIds: string[];
    onCategoriesChange: (val: string[]) => void;
    all_categories: any[];
    studentIds: string[];
    onStudentsChange: (val: string[]) => void;
    all_students: any[];
    onOpenCategoryDrawer: () => void;
    onSave: () => void;
    is_saving: boolean;
    t: (key: string) => string;
    common_t: (key: string) => string;
}

export function NoteSettingsDrawer({
    opened, onClose, categoryIds, onCategoriesChange,
    all_categories, studentIds, onStudentsChange, all_students,
    onOpenCategoryDrawer, onSave, is_saving, t, common_t
}: NoteSettingsDrawerProps) {
    return (
        <Drawer 
            opened={opened} onClose={onClose} position="right" title={common_t('additional')} size="md" 
            styles={{ header: { padding: '24px 32px' }, body: { padding: '0 32px 32px' } }}
        >
            <Stack gap="xl">
                <Box>
                    <Group justify="space-between" mb={8}>
                        <Text size="sm" fw={600}>{t('table.categories')}</Text>
                        <Tooltip label={common_t('add')}>
                            <ActionIcon variant="light" color="primary" onClick={onOpenCategoryDrawer} size="sm">
                                <IoAdd size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                    <MultiSelect 
                        data={all_categories?.map(c => ({ value: c.id, label: c.name })) || []}
                        value={categoryIds} onChange={onCategoriesChange} placeholder={t('editor.add_to_categories_placeholder')} clearable searchable
                    />
                </Box>

                <Box>
                    <Group justify="space-between" mb={8}>
                        <Text size="sm" fw={600}>{t('editor.access_students')}</Text>
                    </Group>
                    <MultiSelect 
                        data={all_students?.map(s => ({ value: s.id, label: s.name })) || []}
                        value={studentIds} onChange={onStudentsChange} placeholder={t('editor.select_students')} clearable searchable
                    />
                </Box>

                <Box mt="xl">
                    <Button 
                        fullWidth 
                        onClick={onSave} 
                        loading={is_saving} 
                        color="primary" 
                        radius="md"
                        size="md"
                    >
                        {t('editor.save')}
                    </Button>
                </Box>
            </Stack>
        </Drawer>
    );
}
