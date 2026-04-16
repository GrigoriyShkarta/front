'use client';

import { createReactBlockSpec } from "@blocknote/react";
import { Box, Paper, Group, Menu, ActionIcon } from '@mantine/core';
import { IoMenuOutline, IoResizeOutline } from 'react-icons/io5';

/**
 * Custom YouTube block specification
 */
export const YoutubeBlock = createReactBlockSpec(
  {
    type: "youtube",
    propSchema: {
      url: { default: "" },
      videoId: { default: "" },
      alignment: { default: "center", values: ["left", "center", "right"] },
      width: { default: "85%", values: ["50%", "70%", "85%", "100%"] },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const videoId = block.props.videoId || "";
      const url = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : block.props.url;
      const { alignment, width } = block.props;
      const is_read_only = !editor.isEditable;
      const justify = alignment === 'left' ? 'flex-start' : (alignment === 'right' ? 'flex-end' : 'center');

      return (
        <Box className="w-full relative group py-4" style={{ display: 'flex', justifyContent: justify }}>
          <Box 
            className="aspect-video relative overflow-hidden rounded-xl shadow-lg border border-white/10"
            style={{ width: width }}
          >
            <iframe
              src={url}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            {!is_read_only && (
              <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Paper 
                  withBorder 
                  shadow="sm" 
                  radius="md" 
                  p={4} 
                  className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md"
                >
                  <Group gap={4}>
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

                    <Menu shadow="md">
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="sm" color="gray">
                          <IoResizeOutline size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { width: '50%' } })}>50%</Menu.Item>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { width: '70%' } })}>70%</Menu.Item>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { width: '85%' } })}>85%</Menu.Item>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { width: '100%' } })}>Full Width</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      );
    },
  }
);
