'use client';

import dynamic from 'next/dynamic';
import { LoadingOverlay, Box } from '@mantine/core';

// Dynamically import the editor with SSR disabled
const NoteEditorContainer = dynamic(
  () => import('./editor/note-editor-container'),
  { 
    ssr: false,
    loading: () => (
      <Box pos="relative" h={400}>
        <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />
      </Box>
    )
  }
);

export default function NoteEditor({ 
  id, 
  is_read_only = false, 
  is_access_mode = false
}: { 
  id?: string, 
  is_read_only?: boolean, 
  is_access_mode?: boolean
}) {
  return (
    <div className="note-editor-root">
      <NoteEditorContainer 
        id={id} 
        is_read_only={is_read_only} 
        is_access_mode={is_access_mode}
      />
      
      <style jsx global>{`
        .note-editor-root {
          min-height: 100vh;
          background-color: transparent !important;
        }
        .note-editor-root ::-webkit-scrollbar {
          width: 8px;
        }
        .note-editor-root ::-webkit-scrollbar-track {
          background: transparent;
        }
        .note-editor-root ::-webkit-scrollbar-thumb {
          background: var(--mantine-color-gray-3);
          border-radius: 10px;
        }
        [data-mantine-color-scheme='dark'] .note-editor-root ::-webkit-scrollbar-thumb {
          background: var(--mantine-color-dark-4);
        }
      `}</style>
    </div>
  );
}
