'use client';

import { createReactBlockSpec } from "@blocknote/react";
import { Box, Paper, Menu, ActionIcon } from '@mantine/core';
import { IoMenuOutline } from 'react-icons/io5';
import { AudioPlayer } from '@/components/ui/audio-player';

/**
 * Custom Audio block specification
 */
export const AudioBlock = createReactBlockSpec(
  {
    type: "audio",
    propSchema: {
      url: { default: "" },
      name: { default: "Audio File" },
      alignment: { default: "center", values: ["left", "center", "right"] },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const { alignment, url } = block.props;
      const is_read_only = !editor.isEditable;
      const justify = alignment === 'left' ? 'flex-start' : (alignment === 'right' ? 'flex-end' : 'center');

      return (
        <Box className="py-4 relative group w-full" style={{ display: 'flex', justifyContent: justify }}>
          <AudioPlayer src={url} class_name="" />
          
          {!is_read_only && (
            <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Paper withBorder shadow="sm" radius="md" p={4} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
                <Menu shadow="md">
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm" color="gray">
                      <IoMenuOutline size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'left' } })}>Left</Menu.Item>
                    <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'center' } })}>Center</Menu.Item>
                    <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'right' } })}>Right</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Paper>
            </Box>
          )}
        </Box>
      );
    }
  }
);
