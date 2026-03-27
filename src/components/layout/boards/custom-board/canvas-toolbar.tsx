'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { ActionIcon, Tooltip, Divider, Box, Stack, Group, ColorInput, Popover, useMantineColorScheme } from '@mantine/core';
import {
  IoNavigateOutline,
  IoHandRightOutline,
  IoPencilOutline,
  IoSquareOutline,
  IoEllipseOutline,
  IoTriangleOutline,
  IoShapesOutline,
  IoRemoveOutline,
  IoArrowUndoOutline,
  IoArrowRedoOutline,
  IoBookOutline,
  IoCloudUploadOutline,
  IoLinkOutline,
  IoSettingsOutline,
  IoArrowBack,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import { TfiText } from "react-icons/tfi";
import { LuEraser, LuHighlighter } from "react-icons/lu";
import { ToolType, StrokeStyle } from './types';

const PRESET_COLORS = [
  '#ffffff', '#000000', '#f87171', '#fb923c', '#facc15',
  '#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#6b7280',
  '#0ea5e9', '#14b8a6', '#8b5cf6', '#ec4899', '#84cc16',
];
const WIDTHS = [2, 4, 8, 12];

interface CanvasToolbarProps {
  tool: ToolType;
  color: string;
  stroke_width: number;
  stroke_style: StrokeStyle;
  can_undo: boolean;
  can_redo: boolean;
  on_tool_change: (tool: ToolType) => void;
  on_color_change: (color: string) => void;
  on_width_change: (width: number) => void;
  on_style_change: (style: StrokeStyle) => void;
  on_undo: () => void;
  on_redo: () => void;
  on_delete: () => void;
  on_open_library: () => void;
  on_upload_device: () => void;
  on_add_link: () => void;
  on_open_settings: () => void;
  on_exit: () => void;
  is_student?: boolean;
}

/**
 * Vertical toolbar for the custom whiteboard: tools, colors, stroke widths, library button.
 * Color section is compact: shows current swatch, hover reveals flyout picker.
 */
export function CanvasToolbar({
  tool, color, stroke_width, stroke_style, can_undo, can_redo,
  on_tool_change, on_color_change, on_width_change, on_style_change, on_undo, on_redo, on_delete,
  on_open_library, on_upload_device, on_add_link, on_open_settings, on_exit, is_student,
}: CanvasToolbarProps) {
  const t = useTranslations('Boards');
  const common_t = useTranslations('Common');
  const { colorScheme } = useMantineColorScheme();
  const is_dark_app = colorScheme === 'dark';

  const [color_open, set_color_open] = useState(false);
  const [styles_open, set_styles_open] = useState(false);
  const [widths_open, set_widths_open] = useState(false);
  const [shapes_open, set_shapes_open] = useState(false);

  const STYLES_LIST: StrokeStyle[] = ['solid', 'dashed', 'dotted', 'dash-dot', 'wavy'];
  
  const SHAPE_TOOLS: { tool: ToolType; icon: any; label: string }[] = [
    { tool: 'rect', icon: <IoSquareOutline size={18} />, label: t('rect') },
    { tool: 'ellipse', icon: <IoEllipseOutline size={18} />, label: t('ellipse') },
    { 
      tool: 'diamond', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 9 2 L 16 9 L 9 16 L 2 9 Z" />
        </svg>
      ), 
      label: t('diamond') 
    },
    { tool: 'triangle', icon: <IoTriangleOutline size={18} />, label: t('triangle') },
  ];

  const tools: { tool: ToolType; icon: any; label: string }[] = [
    { tool: 'select', icon: <IoNavigateOutline size={18} />, label: t('select') },
    { tool: 'hand', icon: <IoHandRightOutline size={18} />, label: t('hand') },
    { tool: 'pen', icon: <IoPencilOutline size={18} />, label: t('pen') },
    { tool: 'highlighter', icon: <LuHighlighter size={18} />, label: t('highlighter') },
    { tool: 'line', icon: <IoRemoveOutline size={18} style={{ transform: 'rotate(-45deg)' }} />, label: t('line') },
    { tool: 'arrow', icon: <IoArrowForwardOutline size={18} style={{ transform: 'rotate(-45deg)' }} />, label: t('arrow') },
    { tool: 'text', icon: <TfiText size={18} />, label: t('text') },
    { tool: 'eraser', icon: <LuEraser size={18} />, label: t('eraser') },
  ];

  const icon_color = is_dark_app ? 'gray' : '#4b5563'; // Slate 600 for better contrast in light mode

  return (
    <Box 
      className="max-w-[95vw] overflow-x-auto overflow-y-visible scrollbar-hide"
      style={{ pointerEvents: 'all' }}
    >
      <Box
        className="flex items-center gap-3 p-2 rounded-xl shadow-2xl min-w-max transition-all"
        style={{ 
          userSelect: 'none',
          backgroundColor: is_dark_app ? 'rgba(30, 30, 46, 0.8)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: is_dark_app ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
        }}
      >
        <Tooltip label={common_t('back')} position="bottom">
          <ActionIcon variant="subtle" color={icon_color} size="lg" radius="md" onClick={on_exit}>
            <IoArrowBack size={20} />
          </ActionIcon>
        </Tooltip>

        <Divider orientation="vertical" h={24} />

        {/* Tools */}
        <Group gap={4} wrap="nowrap">
          {tools.map(({ tool: target_tool, icon, label }, idx) => (
            <>
              <Tooltip key={target_tool} label={label} position="bottom">
                <ActionIcon
                  variant={tool === target_tool ? 'filled' : 'subtle'}
                  style={{ 
                    backgroundColor: tool === target_tool ? 'var(--space-primary)' : undefined,
                    color: tool === target_tool ? 'var(--space-primary-text)' : icon_color 
                  }}
                  size="lg"
                  radius="md"
                  onClick={() => on_tool_change(target_tool)}
                >
                  {icon}
                </ActionIcon>
              </Tooltip>

              {/* Insert Shape Picker after Pen */}
              {idx === 2 && (
                <Popover
                  withinPortal
                  position="bottom"
                  withArrow
                  shadow="md"
                  opened={shapes_open}
                  offset={8}
                  styles={{ dropdown: { backgroundColor: is_dark_app ? '#1e1e2e' : '#fff', border: is_dark_app ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', borderRadius: 12 } }}
                >
                  <Popover.Target>
                    <Box onMouseEnter={() => set_shapes_open(true)} onMouseLeave={() => set_shapes_open(false)}>
                      <Tooltip label={t('shapes')} position="bottom" disabled={shapes_open}>
                        <ActionIcon
                          variant={SHAPE_TOOLS.some(s => s.tool === tool) ? 'filled' : 'subtle'}
                          style={{
                            backgroundColor: SHAPE_TOOLS.some(s => s.tool === tool) ? 'var(--space-primary)' : undefined,
                            color: SHAPE_TOOLS.some(s => s.tool === tool) ? 'var(--space-primary-text)' : icon_color
                          }}
                          size="lg"
                          radius="md"
                          onClick={() => {
                            const active_shape = SHAPE_TOOLS.find(s => s.tool === tool);
                            if (!active_shape) on_tool_change('rect');
                          }}
                        >
                          {SHAPE_TOOLS.find(s => s.tool === tool)?.icon || <IoShapesOutline size={18} />}
                        </ActionIcon>
                      </Tooltip>
                    </Box>
                  </Popover.Target>
                  <Popover.Dropdown
                    p={8}
                    onMouseEnter={() => set_shapes_open(true)}
                    onMouseLeave={() => set_shapes_open(false)}
                    style={{ pointerEvents: 'all' }}
                  >
                    <Group gap={4} wrap="nowrap">
                      {SHAPE_TOOLS.map((s) => (
                        <Tooltip key={s.tool} label={s.label} position="bottom">
                          <ActionIcon
                            variant={tool === s.tool ? 'filled' : 'subtle'}
                            style={{
                              backgroundColor: tool === s.tool ? 'var(--space-primary)' : undefined,
                              color: tool === s.tool ? 'var(--space-primary-text)' : icon_color
                            }}
                            size="lg"
                            onClick={() => { on_tool_change(s.tool); set_shapes_open(false); }}
                          >
                            {s.icon}
                          </ActionIcon>
                        </Tooltip>
                      ))}
                    </Group>
                  </Popover.Dropdown>
                </Popover>
              )}
            </>
          ))}
        </Group>

        <Divider orientation="vertical" h={24} />
        
        {/* Media group */}
        <Group gap={4} wrap="nowrap">
          {!is_student && (
            <Tooltip label={t('library')} position="bottom">
              <ActionIcon variant="light" color="violet" size="lg" radius="md" onClick={on_open_library}>
                <IoBookOutline size={18} />
              </ActionIcon>
            </Tooltip>
          )}

          <Tooltip label={t('upload_device')} position="bottom">
            <ActionIcon variant="light" style={{ backgroundColor: 'rgba(var(--space-primary-rgb), 0.1)', color: 'var(--space-primary)' }} size="lg" radius="md" onClick={on_upload_device}>
              <IoCloudUploadOutline size={18} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label={t('link')} position="bottom">
            <ActionIcon variant="light" color="teal" size="lg" radius="md" onClick={on_add_link}>
              <IoLinkOutline size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" h={24} />

        {/* Color picker */}
        <Popover 
          withinPortal 
          position="bottom" 
          withArrow 
          shadow="md" 
          opened={color_open} 
          offset={8}
          styles={{ 
            dropdown: { 
              backgroundColor: is_dark_app ? '#1e1e2d' : '#fff', 
              border: is_dark_app ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', 
              borderRadius: 12 
            } 
          }}
        >
          <Popover.Target>
            <Box
              onMouseEnter={() => set_color_open(true)}
              onMouseLeave={() => set_color_open(false)}
            >
              <Tooltip label={t('color')} position="bottom" disabled={color_open}>
                <Box
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: '2px solid rgba(255,255,255,0.2)',
                    transition: 'box-shadow 0.2s',
                    boxShadow: color_open ? '0 0 0 2px var(--space-primary)' : 'none',
                  }}
                />
              </Tooltip>
            </Box>
          </Popover.Target>
          <Popover.Dropdown 
            p={10} 
            onMouseEnter={() => set_color_open(true)} 
            onMouseLeave={() => set_color_open(false)}
            style={{ pointerEvents: 'all' }}
          >
            <Box style={{ minWidth: 180 }}>
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 10 }}>
                {PRESET_COLORS.map((c) => (
                  <Box
                    key={c}
                    onClick={() => { on_color_change(c); set_color_open(false); }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: c,
                      cursor: 'pointer',
                      border: color === c ? '2px solid var(--space-primary)' : '1px solid rgba(255,255,255,0.15)',
                      boxShadow: color === c ? '0 0 6px rgba(var(--space-primary-rgb), 0.5)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </Box>
              <ColorInput
                value={color}
                onChange={on_color_change}
                placeholder="Pick color"
                size="xs"
                styles={{
                  input: {
                    backgroundColor: is_dark_app ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: is_dark_app ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                    color: is_dark_app ? '#fff' : '#000',
                    borderRadius: 8,
                  },
                }}
              />
            </Box>
          </Popover.Dropdown>
        </Popover>

        <Divider orientation="vertical" h={24} />

        {/* Current Stroke Style Popover */}
        <Popover 
          withinPortal 
          position="bottom" 
          withArrow 
          shadow="md" 
          opened={styles_open} 
          offset={8}
          styles={{ 
            dropdown: { 
              backgroundColor: is_dark_app ? '#1e1e2d' : '#fff', 
              border: is_dark_app ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', 
              borderRadius: 12 
            } 
          }}
        >
          <Popover.Target>
            <Box
              onMouseEnter={() => set_styles_open(true)}
              onMouseLeave={() => set_styles_open(false)}
            >
              <Tooltip label={t('stroke_style')} position="bottom" disabled={styles_open}>
                <ActionIcon variant="light" style={{ backgroundColor: 'rgba(var(--space-primary-rgb), 0.1)', color: 'var(--space-primary)' }} size="lg" radius="md">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {stroke_style === 'solid' && <rect x="2" y="7" width="12" height="2" rx="1" fill="currentColor" />}
                    {stroke_style === 'dashed' && (
                      <>
                        <rect x="2" y="7" width="4" height="2" rx="1" fill="currentColor" />
                        <rect x="8" y="7" width="4" height="2" rx="1" fill="currentColor" />
                      </>
                    )}
                    {stroke_style === 'dotted' && (
                      <>
                        <circle cx="3" cy="8" r="1.25" fill="currentColor" />
                        <circle cx="8" cy="8" r="1.25" fill="currentColor" />
                        <circle cx="13" cy="8" r="1.25" fill="currentColor" />
                      </>
                    )}
                    {stroke_style === 'dash-dot' && (
                      <>
                        <rect x="2" y="7" width="6" height="2" rx="1" fill="currentColor" />
                        <circle cx="12" cy="8" r="1.25" fill="currentColor" />
                      </>
                    )}
                    {stroke_style === 'wavy' && (
                      <path d="M 2 8 C 3 4, 5 12, 7 8 C 9 4, 11 12, 14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                    )}
                  </svg>
                </ActionIcon>
              </Tooltip>
            </Box>
          </Popover.Target>
          <Popover.Dropdown 
            p={8} 
            onMouseEnter={() => set_styles_open(true)} 
            onMouseLeave={() => set_styles_open(false)}
            style={{ pointerEvents: 'all' }}
          >
            <Group gap={4} wrap="nowrap">
              {STYLES_LIST.map((s) => (
                <ActionIcon 
                  key={s} 
                  variant={stroke_style === s ? 'filled' : 'subtle'} 
                  style={{
                    backgroundColor: stroke_style === s ? 'var(--space-primary)' : undefined,
                    color: stroke_style === s ? 'var(--space-primary-text)' : icon_color
                  }}
                  size="lg"
                  onClick={() => { on_style_change(s); set_styles_open(false); }}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {s === 'solid' && <rect x="2" y="7" width="12" height="2" rx="1" fill="currentColor" />}
                    {s === 'dashed' && (
                      <>
                        <rect x="2" y="7" width="4" height="2" rx="1" fill="currentColor" />
                        <rect x="8" y="7" width="4" height="2" rx="1" fill="currentColor" />
                      </>
                    )}
                    {s === 'dotted' && (
                      <>
                        <circle cx="3" cy="8" r="1.25" fill="currentColor" />
                        <circle cx="8" cy="8" r="1.25" fill="currentColor" />
                        <circle cx="13" cy="8" r="1.25" fill="currentColor" />
                      </>
                    )}
                    {s === 'dash-dot' && (
                      <>
                        <rect x="2" y="7" width="6" height="2" rx="1" fill="currentColor" />
                        <circle cx="12" cy="8" r="1.25" fill="currentColor" />
                      </>
                    )}
                    {s === 'wavy' && (
                      <path d="M 2 8 C 3 4, 5 12, 7 8 C 9 4, 11 12, 14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                    )}
                  </svg>
                </ActionIcon>
              ))}
            </Group>
          </Popover.Dropdown>
        </Popover>

        <Divider orientation="vertical" h={24} />

        {/* Current Stroke Width Popover */}
        <Popover 
          withinPortal 
          position="bottom" 
          withArrow 
          shadow="md" 
          opened={widths_open} 
          offset={8}
          styles={{ 
            dropdown: { 
              backgroundColor: is_dark_app ? '#1e1e2d' : '#fff', 
              border: is_dark_app ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', 
              borderRadius: 12 
            } 
          }}
        >
          <Popover.Target>
            <Box
              onMouseEnter={() => set_widths_open(true)}
              onMouseLeave={() => set_widths_open(false)}
            >
              <Tooltip label={t('stroke_width')} position="bottom" disabled={widths_open}>
                <Box
                  onClick={() => set_widths_open(true)}
                  className="flex items-center justify-center cursor-pointer rounded-md hover:bg-white/10 transition-colors"
                  style={{
                    width: 24,
                    height: 32,
                    outline: '2px solid transparent',
                    borderRadius: 6,
                  }}
                >
                  <Box style={{ height: 20, width: stroke_width, backgroundColor: color, borderRadius: 2 }} />
                </Box>
              </Tooltip>
            </Box>
          </Popover.Target>
          <Popover.Dropdown 
            p={8} 
            onMouseEnter={() => set_widths_open(true)} 
            onMouseLeave={() => set_widths_open(false)}
            style={{ pointerEvents: 'all' }}
          >
            <Group gap={6} wrap="nowrap">
              {WIDTHS.map((w) => (
                <Tooltip key={w} label={`${w}px`} position="bottom">
                  <Box
                    onClick={() => { on_width_change(w); set_widths_open(false); }}
                    className="flex items-center justify-center cursor-pointer rounded-md hover:bg-white/10 transition-colors"
                    style={{
                      width: 24,
                      height: 32,
                      outline: stroke_width === w ? '2px solid var(--space-primary)' : '2px solid transparent',
                      outlineOffset: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Box style={{ height: 20, width: w, backgroundColor: color, borderRadius: 2 }} />
                  </Box>
                </Tooltip>
              ))}
            </Group>
          </Popover.Dropdown>
        </Popover>

        <Divider orientation="vertical" h={24} />

        {/* Undo / Redo */}
        <Group gap={4} wrap="nowrap">
          <Tooltip label={t('undo')} position="bottom">
            <ActionIcon 
              variant="subtle" 
              size="md" 
              radius="md" 
              disabled={!can_undo} 
              onClick={on_undo}
              color={icon_color}
            >
              <IoArrowUndoOutline size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('redo')} position="bottom">
            <ActionIcon 
              variant="subtle" 
              size="md" 
              radius="md" 
              disabled={!can_redo} 
              onClick={on_redo}
              color={icon_color}
            >
              <IoArrowRedoOutline size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" h={24} />

        <Tooltip label={common_t('settings')} position="bottom">
          <ActionIcon variant="subtle" color={icon_color} size="lg" radius="md" onClick={on_open_settings}>
            <IoSettingsOutline size={20} />
          </ActionIcon>
        </Tooltip>
      </Box>
    </Box>
  );
}
