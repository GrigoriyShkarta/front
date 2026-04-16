'use client';

import { forwardRef } from 'react';
import { Box } from '@mantine/core';
import BlockNoteEditor, { BlockNoteEditorRef } from '../block-note';

interface BlockItemContentProps {
  content: string;
  on_change: (content: string) => void;
  on_open_bank: (type: 'image' | 'video' | 'audio' | 'file') => void;
  read_only: boolean;
}

/**
 * Renders the BlockNoteEditor within a block item.
 * Uses forwardRef to expose editor methods (like insert_media).
 */
export const BlockItemContent = forwardRef<BlockNoteEditorRef, BlockItemContentProps>(({
  content,
  on_change,
  on_open_bank,
  read_only
}, ref) => {
  return (
    <Box style={{ flex: 1, position: 'relative' }}>
      <div onDragStart={(e) => e.stopPropagation()}>
        <BlockNoteEditor 
          ref={ref}
          initial_content={content}
          on_change={on_change}
          on_open_bank={on_open_bank}
          read_only={read_only}
        />
      </div>
    </Box>
  );
});

BlockItemContent.displayName = 'BlockItemContent';
