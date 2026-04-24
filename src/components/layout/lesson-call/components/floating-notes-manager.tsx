'use client';

import { useFloatingNotes } from '@/context/floating-notes-context';
import { FloatingNoteWindow } from './floating-note-window';
import { Box } from '@mantine/core';

export function FloatingNotesManager() {
  const { openNotes, closeNote } = useFloatingNotes();

  if (openNotes.length === 0) return null;

  return (
    <Box style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
        <Box style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {openNotes.map((note) => (
                <Box key={note.student_id} style={{ pointerEvents: 'auto' }}>
                    <FloatingNoteWindow 
                        student_id={note.student_id}
                        student_name={note.student_name}
                        pinned_note_id={note.pinned_note_id}
                        session_note_id={note.session_note_id}
                        onClose={() => closeNote(note.student_id)}
                    />
                </Box>
            ))}
        </Box>
    </Box>
  );
}
