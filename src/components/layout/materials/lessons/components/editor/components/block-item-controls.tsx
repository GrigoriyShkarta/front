'use client';

import { Group, ActionIcon, Tooltip, Box, Checkbox } from '@mantine/core';
import { IoReorderThree, IoTrashOutline } from 'react-icons/io5';

interface BlockItemControlsProps {
  id: string;
  read_only: boolean;
  is_access_mode: boolean;
  is_checked: boolean;
  show_remove: boolean;
  on_remove: () => void;
  on_checked_change: (checked: boolean) => void;
  setCanDrag: (can: boolean) => void;
  isDragging: boolean;
  t: (key: string) => string;
}

/**
 * Renders the controls for a block item, including the drag handle,
 * access checkbox, and delete button.
 */
export function BlockItemControls({
  read_only,
  is_access_mode,
  is_checked,
  show_remove,
  on_remove,
  on_checked_change,
  setCanDrag,
  isDragging,
  t
}: BlockItemControlsProps) {
  return (
    <>
      {is_access_mode && (
        <Box p="md">
          <Checkbox 
            checked={is_checked} 
            onChange={(e) => on_checked_change?.(e.currentTarget.checked)}
            size="md"
          />
        </Box>
      )}

      {!read_only && !is_access_mode && (
        <Box
          p="4px"
          className="drag-handle cursor-grab" 
          onMouseDown={() => setCanDrag(true)}
          onMouseUp={() => setCanDrag(false)}
          onMouseLeave={() => !isDragging && setCanDrag(false)}
        >
          <IoReorderThree size={18} color="var(--mantine-color-gray-6)" />
        </Box>
      )}

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
    </>
  );
}
