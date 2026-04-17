'use client';

import { forwardRef, useState } from 'react';
import { Paper, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { BlockNoteEditorRef } from './block-note';
import { BlockItemControls } from './components/block-item-controls';
import { BlockItemContent } from './components/block-item-content';

interface Props {
  id: string;
  index: number;
  content: string;
  show_remove?: boolean;
  read_only?: boolean;
  is_access_mode?: boolean;
  is_checked?: boolean;
  on_change: (content: string) => void;
  on_remove: () => void;
  on_open_bank: (type: 'image' | 'video' | 'audio' | 'file') => void;
  on_move: (from: number, to: number) => void;
  on_checked_change?: (checked: boolean) => void;
  set_is_dragging_block: (dragging: boolean) => void;
}

/**
 * Main component representing a single lesson block.
 * Handles drag and drop logic and layout.
 */
const BlockItem = forwardRef<BlockNoteEditorRef, Props>(({ 
  id, index, content, on_change, on_remove, on_open_bank, on_move, 
  show_remove = true, read_only = false, is_access_mode = false,
  is_checked = false, on_checked_change, set_is_dragging_block
}, ref) => {
  const t = useTranslations('Materials.lessons');
  const [isDragging, setIsDragging] = useState(false);
  const [canDrag, setCanDrag] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!canDrag || read_only) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    set_is_dragging_block(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setCanDrag(false);
    set_is_dragging_block(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (read_only) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    if (read_only) return;
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(fromIndex) && fromIndex !== index) {
      on_move(fromIndex, index);
    }
    setCanDrag(false);
    set_is_dragging_block(false);
  };

  return (
    <Paper 
      withBorder={!read_only}
      radius="md" 
      draggable={canDrag && !read_only}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`block-item ${isDragging ? 'dragging' : ''} ${read_only ? 'read-only' : ''}`}
      styles={{
        root: {
          position: 'relative',
          transition: 'all 0.2s ease',
          backgroundColor: 'transparent',
          opacity: isDragging ? 0.4 : 1,
          border: isDragging 
            ? '2px dashed var(--mantine-primary-color-filled)' 
            : (read_only ? 'none' : '1px solid var(--mantine-color-default-border)'),
        }
      }}
    >
      <Group gap={0} align="stretch" mih="auto">
        <BlockItemControls 
          id={id} read_only={read_only} is_access_mode={is_access_mode} 
          is_checked={is_checked} show_remove={show_remove} 
          on_remove={on_remove} on_checked_change={on_checked_change || (() => {})} 
          setCanDrag={setCanDrag} isDragging={isDragging} t={t}
        />
        <BlockItemContent 
          ref={ref} content={content} on_change={on_change} 
          on_open_bank={on_open_bank} read_only={read_only} 
        />
      </Group>

      <style jsx global>{`
        .block-item:not(.read-only):hover {
          box-shadow: var(--mantine-shadow-sm);
        }
        .block-item .drag-handle {
          border-radius: var(--mantine-radius-md) 0 0 var(--mantine-radius-md);
        }
        .block-item .drag-handle:hover {
          background-color: var(--mantine-color-gray-1) !important;
        }
        [data-mantine-color-scheme='dark'] .block-item .drag-handle {
          background-color: var(--mantine-color-dark-6) !important;
        }
        [data-mantine-color-scheme='dark'] .block-item .drag-handle:hover {
          background-color: var(--mantine-color-dark-5) !important;
        }
      `}</style>
    </Paper>
  );
});

BlockItem.displayName = 'BlockItem';

export default BlockItem;
