'use client';

import { Group, Button, Switch } from '@mantine/core';
import { IoChevronBackOutline, IoPencilOutline, IoOptionsOutline } from 'react-icons/io5';

interface LessonHeaderProps {
    is_access_mode: boolean;
    readOnly: boolean;
    is_student: boolean;
    title: string;
    full_access: boolean;
    is_saving_access: boolean;
    is_saving: boolean;
    onBack: () => void;
    onToggleFullAccess: (val: boolean) => void;
    onSaveAccess: () => void;
    onEdit: () => void;
    onToggleAdditional: () => void;
    onSave: () => void;
    t: (key: string) => string;
    common_t: (key: string) => string;
}

export function LessonHeader({
    is_access_mode, readOnly, is_student, title, full_access, is_saving_access,
    is_saving, onBack, onToggleFullAccess, onSaveAccess, onEdit, onToggleAdditional, onSave,
    t, common_t
}: LessonHeaderProps) {
    return (
        <Group justify="space-between" align="center" px="md" mb="md">
            <Button 
                variant="subtle" 
                color="gray" 
                leftSection={<IoChevronBackOutline size={18} />}
                onClick={onBack}
            >
                {t('editor.back')}
            </Button>
            
            {is_access_mode ? (
                <Group gap="sm">
                    <Switch 
                        label={t('access.full_access') || 'Full access'}
                        checked={full_access}
                        onChange={(e) => onToggleFullAccess(e.currentTarget.checked)}
                    />
                    <Button onClick={onSaveAccess} loading={is_saving_access}>
                        {t('editor.save')}
                    </Button>
                </Group>
            ) : readOnly ? (
                !is_student && (
                    <Button 
                        variant="filled" color="primary" 
                        leftSection={<IoPencilOutline size={18} />}
                        onClick={onEdit}
                        radius="md"
                    >
                        {t('edit_lesson')}
                    </Button>
                )
            ) : (
                <Group gap="sm">
                    <Button 
                        variant="light" color="gray" 
                        leftSection={<IoOptionsOutline size={18} />}
                        onClick={onToggleAdditional}
                        radius="md"
                    >
                        {common_t('additional')}
                    </Button>
                    <Button 
                        variant={!title.trim() ? "light" : "filled"}
                        color={!title.trim() ? "gray" : "primary"}
                        onClick={onSave}
                        loading={is_saving}
                        disabled={!title.trim()}
                        radius="md"
                    >
                        {t('editor.save')}
                    </Button>
                </Group>
            )}
        </Group>
    );
}
