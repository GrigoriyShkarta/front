'use client';

import dynamic from 'next/dynamic';
import { LoadingOverlay, Box } from '@mantine/core';

// Dynamically import the editor with SSR disabled
const LessonEditorContainer = dynamic(
  () => import('./editor/lesson-editor-container'),
  { 
    ssr: false,
    loading: () => (
      <Box pos="relative" h={400}>
        <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />
      </Box>
    )
  }
);

/**
 * Main entry point for the Lesson Editor component.
 * Wraps the internal editor structure and handles SSR safety.
 */
export default function LessonEditor({ 
  id, 
  is_read_only = false, 
  course_id,
  student_id,
  is_access_mode = false
}: { 
  id?: string, 
  is_read_only?: boolean, 
  course_id?: string,
  student_id?: string,
  is_access_mode?: boolean
}) {
  return (
    <div className="lesson-editor-root">
      <LessonEditorContainer 
        id={id} 
        is_read_only={is_read_only} 
        course_id={course_id} 
        student_id={student_id}
        is_access_mode={is_access_mode}
      />
      
      <style jsx global>{`
        .lesson-editor-root {
          min-height: 100vh;
          background-color: transparent !important;
        }
        /* Custom scrollbar for better look */
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