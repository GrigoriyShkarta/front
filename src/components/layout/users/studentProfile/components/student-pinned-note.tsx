'use client';

import { Box, Paper, Text, Stack } from '@mantine/core';
import NoteEditorContainer from '@/components/layout/materials/notes/components/editor/note-editor-container';
import { useTranslations } from 'next-intl';

interface Props {
  student_id: string;
  student_name: string;
  pinned_note_id?: string | null;
}

export function StudentPinnedNote({ student_id, student_name, pinned_note_id }: Props) {
  const t = useTranslations('Materials.note');

  return (
    <Stack gap="md">
        <Box className="relative">
            <NoteEditorContainer 
                id={pinned_note_id || undefined}
                is_read_only={false}
                pinned_student_id={student_id}
                student_name={student_name}
                hide_additional={true}
                hide_edit={true}
                hide_back={true}
                hide_title={true}
                compact={true}
                prevent_redirect={true}
            />
        </Box>
    </Stack>
  );
}
