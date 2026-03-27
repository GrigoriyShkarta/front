'use client';

import { ActionIcon, Group, Select, Tooltip, Box, Divider } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS } from 'react-icons/md';
import { IoTrashOutline } from 'react-icons/io5';
import { TextElement } from './types';
import { cn } from '@/lib/utils';

const FONT_SIZES = ['8', '10', '12', '14', '16', '20', '24', '28', '32', '36', '42', '48', '56', '64', '72', '84', '96'];
const FONTS = [
  { value: 'sans-serif', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'cursive', label: 'Cursive' },
];

const COLORS = ['#ffffff', '#000000', '#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#6b7280'];

interface Props {
  element: TextElement;
  screen_x: number;
  screen_y: number;
  element_h: number; // Height of the element in screen pixels
  on_update: (patch: Partial<TextElement>) => void;
  on_delete: () => void;
  is_dark: boolean;
}

/**
 * Floating toolbar for text element formatting.
 */
export function TextFormatToolbar({ element, screen_x, screen_y, element_h, on_update, on_delete, is_dark }: Props) {
  const t = useTranslations('Boards');
  const is_bold      = element.font_weight === 'bold';
  const is_italic    = element.font_style === 'italic';
  const is_underline = element.text_decoration === 'underline';
  const is_strike    = element.text_decoration === 'line-through';

  const show_below = screen_y < 80;
  const top_pos = show_below ? screen_y + element_h + 12 : Math.max(10, screen_y - 100);

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
        gap={4}
        p={6}
        className={cn(
            "rounded-xl border shadow-2xl backdrop-blur-md",
            is_dark ? "border-white/10 bg-[#1e1e2e]" : "border-gray-200 bg-white"
        )}
        wrap="nowrap"
      >
        <Select
          size="xs"
          w={100}
          data={FONTS}
          value={element.font_family}
          onChange={(v) => on_update({ font_family: v || 'sans-serif' })}
          placeholder={t('font_family')}
          styles={{ 
              input: { 
                  background: is_dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                  color: is_dark ? 'white' : 'black', 
                  border: is_dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' 
              } 
          }}
        />

        <Select
          size="xs"
          w={70}
          data={FONT_SIZES}
          value={element.font_size.toString()}
          onChange={(v) => on_update({ font_size: parseInt(v || '24') })}
          placeholder={t('size')}
          styles={{ 
            input: { 
                background: is_dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                color: is_dark ? 'white' : 'black', 
                border: is_dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' 
            } 
          }}
        />

        <Divider orientation="vertical" />

        <Group gap={2}>
          <Tooltip label={t('bold')}>
            <ActionIcon 
              variant={is_bold ? 'filled' : 'subtle'} 
              style={{
                backgroundColor: is_bold ? 'var(--space-primary)' : undefined,
                color: is_bold ? 'var(--space-primary-text)' : (is_dark ? 'white' : 'black')
              }}
              onClick={() => on_update({ font_weight: is_bold ? 'normal' : 'bold' })}
            >
              <MdFormatBold size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('italic')}>
            <ActionIcon 
              variant={is_italic ? 'filled' : 'subtle'} 
              style={{
                backgroundColor: is_italic ? 'var(--space-primary)' : undefined,
                color: is_italic ? 'var(--space-primary-text)' : (is_dark ? 'white' : 'black')
              }}
              onClick={() => on_update({ font_style: is_italic ? 'normal' : 'italic' })}
            >
              <MdFormatItalic size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('underline')}>
            <ActionIcon 
              variant={is_underline ? 'filled' : 'subtle'} 
              style={{
                backgroundColor: is_underline ? 'var(--space-primary)' : undefined,
                color: is_underline ? 'var(--space-primary-text)' : (is_dark ? 'white' : 'black')
              }}
              onClick={() => on_update({ text_decoration: is_underline ? 'none' : 'underline' })}
            >
              <MdFormatUnderlined size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('strikethrough')}>
            <ActionIcon 
              variant={is_strike ? 'filled' : 'subtle'} 
              style={{
                backgroundColor: is_strike ? 'var(--space-primary)' : undefined,
                color: is_strike ? 'var(--space-primary-text)' : (is_dark ? 'white' : 'black')
              }}
              onClick={() => on_update({ text_decoration: is_strike ? 'none' : 'line-through' })}
            >
              <MdStrikethroughS size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" h={20} mx={4} />

        {/* Text color swatches */}
        <Group gap={4}>
          {COLORS.map((c) => (
            <Tooltip key={c} label={c}>
              <Box
                onClick={() => on_update({ color: c })}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: c,
                  cursor: 'pointer',
                  border: element.color === c ? '2px solid var(--space-primary)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: element.color === c ? '0 0 4px var(--space-primary)' : 'none',
                }}
              />
            </Tooltip>
          ))}
        </Group>

        <Divider orientation="vertical" />

        <Tooltip label={t('delete')}>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={on_delete}>
            <IoTrashOutline size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}
