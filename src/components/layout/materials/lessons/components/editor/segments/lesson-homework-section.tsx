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
    readOnly: boolean;
    hw_content: string;
    onHwContentChange: (val: string) => void;
    onStartCreate: () => void;
    onDelete: () => void;
    t: (key: string) => string;
    tHw: (key: string) => string;
}

export function LessonHomeworkSection({
    is_student, homeworkId, is_creating_hw, is_editing_hw, is_saving_hw,
    lesson, readOnly, hw_content, onHwContentChange, onStartCreate, onDelete,
    t, tHw
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
            {!readOnly && !homeworkId && !is_creating_hw && (
                <Button 
                    variant="light" leftSection={<IoAddOutline size={20} />}
                    onClick={onStartCreate} fullWidth h={50} radius="md"
                >
                    {tHw('add_homework')}
                </Button>
            )}

            {/* Read-only View */}
            {readOnly && homeworkId && (
                <Paper withBorder p="xl" radius="md">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Title order={3}>{tHw('title')}</Title>
                        </Group>
                        <Box style={{ opacity: 0.9 }}>
                            <BlockNoteEditor 
                                key={typeof lesson?.homework?.content === 'string' ? lesson.homework.content : JSON.stringify(lesson?.homework?.content || [])}
                                initial_content={typeof lesson?.homework?.content === 'string' ? lesson.homework.content : JSON.stringify(lesson?.homework?.content || [])} 
                                read_only on_change={() => {}} on_open_bank={() => {}}
                            />
                        </Box>
                    </Stack>
                </Paper>
            )}

            {/* Editor Mode */}
            {!readOnly && (is_creating_hw || homeworkId) && (
                <Paper withBorder p="xl" radius="md" pos="relative">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Title order={3}>{tHw('title')}</Title>
                            <Button 
                                variant="light" color="red" leftSection={<IoTrashOutline size={18} />}
                                onClick={onDelete} loading={is_saving_hw}
                            >
                                {tHw('delete_homework')}
                            </Button>
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
                    </Stack>
                </Paper>
            )}
        </Box>
    );
}
