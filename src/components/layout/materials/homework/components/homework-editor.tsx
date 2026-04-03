'use client';

import dynamic from 'next/dynamic';
import { LoadingOverlay, Box } from '@mantine/core';

const HomeworkEditorContainer = dynamic(
  () => import('./editor/homework-editor-container'),
  { 
    ssr: false,
    loading: () => (
      <Box pos="relative" h={400}>
        <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />
      </Box>
    )
  }
);

export default function HomeworkEditor({ 
  id, 
  is_read_only = false, 
}: { 
  id?: string, 
  is_read_only?: boolean, 
}) {
  return (
    <div className="lesson-editor-root">
      <HomeworkEditorContainer 
        id={id} 
        is_read_only={is_read_only} 
      />
      
      <style jsx global>{`
        .lesson-editor-root {
          min-height: 100vh;
          background-color: transparent;
        }
        .lesson-editor-root ::-webkit-scrollbar {
          width: 8px;
        }
        .lesson-editor-root ::-webkit-scrollbar-track {
          background: transparent;
        }
        .lesson-editor-root ::-webkit-scrollbar-thumb {
          background: var(--mantine-color-gray-3);
          border-radius: 10px;
        }
        [data-mantine-color-scheme='dark'] .lesson-editor-root ::-webkit-scrollbar-thumb {
          background: var(--mantine-color-dark-4);
        }
      `}</style>
    </div>
  );
}
