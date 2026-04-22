'use client';

import { ActionIcon, Group, Tooltip, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoTrashOutline, IoLockClosedOutline, IoLockOpenOutline } from 'react-icons/io5';
import { BoardElement } from './types';
import { cn } from '@/lib/utils';

interface Props {
  element: BoardElement;
  screen_x: number;
  screen_y: number;
  element_h: number; // Height of the element in screen pixels
  on_update: (patch: Partial<BoardElement>) => void;
  on_delete: () => void;
  is_dark: boolean;
}

/**
 * Floating toolbar for media elements (Image, Video, Audio, Youtube, Embed, Link, File).
 */
export function MediaFormatToolbar({ element, screen_x, screen_y, element_h, on_update, on_delete, is_dark }: Props) {
  const t = useTranslations('Boards');

  const show_below = screen_y < 80;
  const top_pos = show_below ? screen_y + element_h + 12 : Math.max(10, screen_y - 60);

  return (
    <Box
      style={{
        position: 'absolute',
        left: screen_x,
        top: top_pos,
        zIndex: 50,
        pointerEvents: 'all',
      }}
    >
      <Group
        gap={8}
        p={6}
        className={cn(
            "rounded-xl border shadow-2xl backdrop-blur-md",
            is_dark ? "border-white/10 bg-[#1e1e2e]" : "border-gray-200 bg-white"
        )}
        wrap="nowrap"
      >
        <Tooltip label={element.is_locked ? t('unlock') : t('lock')}>
          <ActionIcon 
            variant="subtle" 
            color={element.is_locked ? "primary" : (is_dark ? "gray.4" : "gray.6")} 
            size="md" 
            onClick={() => on_update({ is_locked: !element.is_locked })}
          >
            {element.is_locked ? <IoLockClosedOutline size={20} /> : <IoLockOpenOutline size={20} />}
          </ActionIcon>
        </Tooltip>

        <Tooltip label={t('delete')}>
          <ActionIcon variant="subtle" color="red" size="md" onClick={on_delete}>
            <IoTrashOutline size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}
