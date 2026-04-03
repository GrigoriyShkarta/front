'use client';

import { Box, Paper, Stack, Group, Title, Button, ActionIcon, Text, LoadingOverlay } from '@mantine/core';
import { IoAddOutline, IoPencilOutline, IoTrashOutline, IoCloseOutline } from 'react-icons/io5';
import BlockNoteEditor from '../block-note';
import { LessonHomeworkSubmission } from '../../lesson-homework-submission';

interface LessonHomeworkSectionProps {
    is_student: boolean;
    homeworkId: string | null;
    is_creating_hw: boolean;
    is_editing_hw: boolean;
    is_saving_hw: boolean;
    lesson: any;
    hw_content: string;
    onHwContentChange: (val: string) => void;
    onStartCreate: () => void;
    onStartEdit: () => void;
    onDelete: () => void;
    onCancel: () => void;
    onSave: () => void;
    t: (key: string) => string;
    tHw: (key: string) => string;
}

export function LessonHomeworkSection({
    is_student, homeworkId, is_creating_hw, is_editing_hw, is_saving_hw,
    lesson, hw_content, onHwContentChange, onStartCreate, onStartEdit, onDelete,
    onCancel, onSave, t, tHw
}: LessonHomeworkSectionProps) {
    if (is_student && lesson?.homework) {
        return (
            <Box mt={60}>
                <LessonHomeworkSubmission 
                    homework={lesson.homework} 
                    homework_status={lesson.homework_status} 
                    my_submission={lesson.homework_submission}
                />
            </Box>
        );
    }

    if (is_student) return null;

    return (
        <Box mt={60}>
            {/* Create Button */}
            {!homeworkId && !is_creating_hw && (
                <Button 
                    variant="light" leftSection={<IoAddOutline size={20} />}
                    onClick={onStartCreate} fullWidth h={50} radius="md"
                >
                    {tHw('add_homework')}
                </Button>
            )}

            {/* Read-only View */}
            {homeworkId && !is_creating_hw && !is_editing_hw && (
                <Paper withBorder p="xl" radius="md">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Title order={3}>{tHw('title')}</Title>
                            <Group gap="sm">
                                <Button 
                                    variant="light" color="blue" leftSection={<IoPencilOutline size={18} />}
                                    onClick={onStartEdit}
                                >
                                    {tHw('edit_homework')}
                                </Button>
                                <Button 
                                    variant="light" color="red" leftSection={<IoTrashOutline size={18} />}
                                    onClick={onDelete} loading={is_saving_hw}
                                >
                                    {tHw('delete_homework')}
                                </Button>
                            </Group>
                        </Group>
                        <Box style={{ opacity: 0.9 }}>
                            <BlockNoteEditor 
                                initial_content={typeof lesson?.homework?.content === 'string' ? lesson.homework.content : JSON.stringify(lesson?.homework?.content || [])} 
                                read_only on_change={() => {}} on_open_bank={() => {}}
                            />
                        </Box>
                    </Stack>
                </Paper>
            )}

            {/* Editor Mode */}
            {(is_creating_hw || is_editing_hw) && (
                <Paper withBorder p="xl" radius="md" pos="relative">
                    <LoadingOverlay visible={is_saving_hw} overlayProps={{ radius: 'md', blur: 2 }} />
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Title order={3}>{is_editing_hw ? tHw('edit_homework') : tHw('title')}</Title>
                            <ActionIcon variant="subtle" color="red" onClick={onCancel}>
                                <IoCloseOutline size={20} />
                            </ActionIcon>
                        </Group>
                        <Box>
                            <Text size="sm" fw={500} mb={8}>{tHw('submission.task_description')}</Text>
                            <Box style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}>
                                <BlockNoteEditor 
                                    initial_content={hw_content}
                                    on_change={onHwContentChange}
                                    on_open_bank={() => {}}
                                />
                            </Box>
                        </Box>
                        <Group justify="flex-end">
                            <Button variant="subtle" color="gray" onClick={onCancel}>{tHw('submission.cancel')}</Button>
                            <Button onClick={onSave} px={40}>{t('editor.save')}</Button>
                        </Group>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
}
