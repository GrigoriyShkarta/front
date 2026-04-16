'use client';

import { createReactBlockSpec } from "@blocknote/react";
import { Box, Paper, Group, Menu, ActionIcon, Card, Text, Stack } from '@mantine/core';
import { IoMenuOutline, IoFileTrayOutline, IoDownloadOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';

/**
 * Custom File block specification
 */
export const FileBlock = createReactBlockSpec(
  {
    type: "file",
    propSchema: {
      url: { default: "" },
      name: { default: "Document" },
      extension: { default: "" },
      alignment: { default: "center", values: ["left", "center", "right"] },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const { url, name, alignment } = block.props;
      const extension = block.props.extension || url.split('.').pop()?.toUpperCase() || 'FILE';
      const justify = alignment === 'left' ? 'flex-start' : (alignment === 'right' ? 'flex-end' : 'center');
      const is_read_only = !editor.isEditable;

      return (
        <Box className="py-2 relative group w-full" style={{ display: 'flex', justifyContent: justify }}>
          <Card 
            component="a"
            href={url}
            target="_blank"
            download
            withBorder={!is_read_only} 
            radius="lg" 
            p="sm" 
            className={cn(
                "w-full max-w-md transition-all no-underline text-inherit",
                is_read_only 
                    ? "bg-transparent hover:bg-zinc-50 dark:hover:bg-white/5" 
                    : "bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
            )}
          >
            <Group wrap="nowrap" gap="md">
              <Box className="relative">
                <Box 
                  className="w-12 h-14 rounded-lg border flex items-center justify-center relative overflow-hidden text-white border-transparent"
                  bg="brand"
                >
                  <IoFileTrayOutline size={24} />
                </Box>
              </Box>
              
              <Stack gap={2} className="flex-1 min-w-0">
                <Text fw={600} size="sm" className="truncate">{name}</Text>
                <Text size="xs" c="dimmed">{extension} Document</Text>
              </Stack>

              {!is_read_only && (
                <ActionIcon 
                  variant="subtle" 
                  color="brand"
                  radius="md"
                >
                  <IoDownloadOutline size={20} />
                </ActionIcon>
              )}
            </Group>
          </Card>

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
      )
    }
  }
);
