'use client';

import { forwardRef, useState } from 'react';
import { Paper, Group, ActionIcon, Box, Tooltip, Text } from '@mantine/core';
import { IoReorderThree, IoTrashOutline} from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import BlockNoteEditor, { BlockNoteEditorRef } from './block-note';

interface Props {
  id: string;
  index: number;
  content: string;
  on_change: (content: string) => void;
  on_remove: () => void;
  on_open_bank: (type: 'image' | 'video' | 'audio' | 'file') => void;
  on_move: (from: number, to: number) => void;
  show_remove?: boolean;
  read_only?: boolean;
}

const BlockItem = forwardRef<BlockNoteEditorRef, Props>(({ 
  id, index, content, on_change, on_remove, on_open_bank, on_move, show_remove = true, read_only = false 
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
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setCanDrag(false);
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
  };

  return (
    <Paper 
      withBorder={!read_only}
      radius="md" 
      p={0} 
      draggable={canDrag && !read_only}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`block-item ${isDragging ? 'dragging' : ''} ${read_only ? 'read-only' : ''}`}
      styles={{
        root: {
          transition: 'all 0.2s ease',
          backgroundColor: read_only ? 'transparent' : 'var(--mantine-color-body)',
          opacity: isDragging ? 0.4 : 1,
          border: isDragging 
            ? '2px dashed var(--mantine-color-blue-6)' 
            : (read_only ? 'none' : '1px solid var(--mantine-color-default-border)'),
        }
      }}
    >
      <Group gap={0} align="stretch" mih={read_only ? 'auto' : 100}>
        {!read_only && (
          <Box 
            className="drag-handle cursor-grab" 
            p="xs"
            onMouseDown={() => setCanDrag(true)}
            onMouseUp={() => setCanDrag(false)}
            onMouseLeave={() => !isDragging && setCanDrag(false)}
          >
            <IoReorderThree size={18} color="var(--mantine-color-gray-6)" />
            <Text size="xs" c="dimmed" mt="auto">{index + 1}</Text>
          </Box>
        )}

        <Box style={{ flex: 1, position: 'relative' }}>
          {!read_only && (
            <Group 
              justify="flex-end" 
              p="xs" 
              style={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                zIndex: 10,
                pointerEvents: 'none' 
              }}
            >
              <Group gap="xs" style={{ pointerEvents: 'all' }}>
                {show_remove && (
                  <Tooltip label={t('delete_block')}>
                    <ActionIcon 
                      variant="subtle" 
                      color="red" 
                      onClick={on_remove}
                      radius="md"
                    >
                      <IoTrashOutline size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Group>
          )}

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
