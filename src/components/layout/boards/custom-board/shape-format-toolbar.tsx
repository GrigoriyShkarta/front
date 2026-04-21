'use client';

import { ActionIcon, Group, Tooltip, Box, Divider, Slider, Text, Stack, useMantineColorScheme } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoTrashOutline, IoLockClosedOutline, IoLockOpenOutline } from 'react-icons/io5';
import { BoardElement, RectElement, EllipseElement, PathElement, LineElement, StrokeStyle, ArrowElement } from './types';

const COLORS = ['#ffffff', '#000000', '#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#6b7280'];

interface Props {
  element: BoardElement;
  screen_x: number;
  screen_y: number;
  element_h: number; // Height of the element in screen pixels
  on_update: (patch: Partial<BoardElement>) => void;
  on_delete: () => void;
}

/**
 * Floating toolbar for shape formatting (Rect, Ellipse, Line, Path).
 */
export function ShapeFormatToolbar({ element, screen_x, screen_y, element_h, on_update, on_delete }: Props) {
  const t = useTranslations('Boards');
  const { colorScheme } = useMantineColorScheme();
  const is_dark_app = colorScheme === 'dark';

  const is_shape = element.type === 'rect' || element.type === 'ellipse';
  
  // Cast for easier access to stroke properties
  const el = element as (RectElement | EllipseElement | PathElement | LineElement);

  const show_below = screen_y < 120; // Shape toolbar is taller, so flip later
  const top_pos = show_below ? screen_y + element_h + 12 : Math.max(10, screen_y - 120);

  const label_color = is_dark_app ? 'dimmed' : '#4b5563';
  const swatch_border = is_dark_app ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)';

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
        p={8}
        className="rounded-xl shadow-2xl transition-all"
        wrap="nowrap"
        style={{
          backgroundColor: is_dark_app ? 'rgba(30, 30, 46, 0.8)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: is_dark_app ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
        }}
      >
        {/* Stroke Color */}
        <Stack gap={2}>
          <Text size="10px" c={label_color} fw={700} tt="uppercase" px={4}>{t('stroke')}</Text>
          <Group gap={4}>
            {COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => on_update({ color: c })}
                style={{
                  width: 20, height: 20, borderRadius: 4, backgroundColor: c, cursor: 'pointer',
                  border: el.color === c ? '2px solid var(--space-primary)' : swatch_border,
                }}
              />
            ))}
          </Group>
        </Stack>

        

        {/* Fill Color (only for shapes) */}
        {is_shape && (
          <>
          <Divider orientation="vertical" />
          <Stack gap={2}>
            <Text size="10px" c={label_color} fw={700} tt="uppercase" px={4}>{t('fill')}</Text>
            <Group gap={4}>
              <Box
                onClick={() => on_update({ fill: 'none' } as any)}
                style={{
                  width: 20, height: 20, borderRadius: 4, backgroundColor: 'transparent', cursor: 'pointer',
                  border: (el as any).fill === 'none' ? '2px solid var(--space-primary)' : swatch_border,
                  position: 'relative', overflow: 'hidden'
                }}
              >
                  <Box style={{ position: 'absolute', width: '150%', height: 1, backgroundColor: 'red', top: '50%', left: '-25%', transform: 'rotate(45deg)' }} />
              </Box>
              {COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => on_update({ fill: c } as any)}
                  style={{
                    width: 20, height: 20, borderRadius: 4, backgroundColor: c, cursor: 'pointer',
                    border: (el as any).fill === c ? '2px solid var(--space-primary)' : swatch_border,
                  }}
                />
              ))}
            </Group>
          </Stack>
          </>
        )}

        <Divider orientation="vertical" />

        {/* Stroke Style */}
        <Stack gap={2}>
          <Text size="10px" c={label_color} fw={700} tt="uppercase" px={4}>{t('stroke_style')}</Text>
          <Group gap={4}>
            {(['solid', 'dashed', 'dotted', 'dash-dot', 'wavy'] as StrokeStyle[]).map((s) => {
              const is_active = (el as any).stroke_style === s || (s === 'solid' && !(el as any).stroke_style);
              return (
                <Tooltip key={s} label={t(s)} position="bottom">
                  <ActionIcon 
                    variant={is_active ? 'filled' : 'light'} 
                    size="md" 
                    style={{
                      backgroundColor: is_active ? 'var(--space-primary)' : undefined,
                      color: is_active ? 'var(--space-primary-text)' : (is_dark_app ? 'gray' : 'var(--space-primary)')
                    }}
                    onClick={() => on_update({ stroke_style: s })}
                  >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {s === 'solid' && <rect x="2" y="7.5" width="12" height="1.5" rx="0.75" fill="currentColor" />}
                      {s === 'dashed' && (
                        <>
                          <rect x="2" y="7.5" width="4" height="1.5" rx="0.75" fill="currentColor" />
                          <rect x="8" y="7.5" width="4" height="1.5" rx="0.75" fill="currentColor" />
                        </>
                      )}
                      {s === 'dotted' && (
                        <>
                          <circle cx="3" cy="8.25" r="1" fill="currentColor" />
                          <circle cx="7" cy="8.25" r="1" fill="currentColor" />
                          <circle cx="11" cy="8.25" r="1" fill="currentColor" />
                        </>
                      )}
                      {s === 'dash-dot' && (
                        <>
                          <rect x="2" y="7.5" width="5" height="1.5" rx="0.75" fill="currentColor" />
                          <circle cx="10" cy="8.25" r="1" fill="currentColor" />
                        </>
                      )}
                      {s === 'wavy' && (
                        <path d="M 2 8 C 3.5 4, 5.5 12, 7 8 C 8.5 4, 10.5 12, 12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      )}
                    </svg>
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Group>
        </Stack>

        <Divider orientation="vertical" />

        {/* Stroke Width */}
        <Stack gap={2}>
          <Text size="10px" c={label_color} fw={700} tt="uppercase" px={4}>{t('stroke_width')}: {el.stroke_width}px</Text>
          <Box w={80} px={6}>
            <Slider
              size="xs" min={1} max={30} step={1}
              label={null}
              color="primary"
              value={el.stroke_width}
              onChange={(v) => on_update({ stroke_width: v })}
            />
          </Box>
        </Stack>

        <Divider orientation="vertical" />

        {/* Opacity */}
        <Stack gap={2}>
          <Text size="10px" c={label_color} fw={700} tt="uppercase">{t('opacity')}: {Math.round(el.opacity * 100)}%</Text>
          <Box w={80}>
            <Slider
              size="xs" min={0.1} max={1} step={0.05}
              label={null}
              value={el.opacity}
              onChange={(v) => on_update({ opacity: v })}
            />
          </Box>
        </Stack>

        <Divider orientation="vertical" />

        <Tooltip label={element.is_locked ? t('unlock') : t('lock')}>
          <ActionIcon 
            variant="subtle" 
            color={element.is_locked ? "primary" : "gray"} 
            size="sm" 
            onClick={() => on_update({ is_locked: !element.is_locked })}
          >
            {element.is_locked ? <IoLockClosedOutline size={18} /> : <IoLockOpenOutline size={18} />}
          </ActionIcon>
        </Tooltip>

        <Tooltip label={t('delete')}>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={on_delete}>
            <IoTrashOutline size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}
