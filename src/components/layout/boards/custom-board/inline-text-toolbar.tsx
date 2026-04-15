'use client';

import { ActionIcon, Group, Tooltip, Box, Popover, ColorSwatch, ColorPicker, Stack, Divider, useMantineColorScheme } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS, MdHighlight, MdLink, MdLinkOff, MdFormatColorText } from 'react-icons/md';
import { useState, useEffect, useRef } from 'react';
import { LinkCreateModal } from './components/link-create-modal';

const rgbToHex = (rgb: string) => {
    if (!rgb || rgb === 'transparent' || rgb.includes('rgba(0, 0, 0, 0)')) return 'transparent';
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return '#ffffff';
    const r = parseInt(match[0], 10), g = parseInt(match[1], 10), b = parseInt(match[2], 10);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#ffffff', '#000000'];

interface Props {
  textRef: React.RefObject<HTMLDivElement | null>;
  onLinkModalOpen?: (opened: boolean) => void;
  is_dark?: boolean;
}

/**
 * Inline formatting toolbar that appears above the text selection inside EditableText.
 */
export function InlineTextToolbar({ textRef, onLinkModalOpen, is_dark: is_dark_prop }: Props) {
  const t = useTranslations('Boards');
  const { colorScheme } = useMantineColorScheme();
  const is_dark = is_dark_prop ?? (colorScheme === 'dark');

  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [linkModalOpened, setLinkModalOpened] = useState(false);

  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false, strikeThrough: false, link: false,
  });
  const [textColor, setTextColor] = useState('#ffffff');
  const [highlightColor, setHighlightColor] = useState('#facc15');

  const checkFormats = () => {
    let linkActive = false;
    const sel = document.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && node.nodeName !== 'DIV') {
        if (node.nodeName === 'A') { linkActive = true; break; }
        node = node.parentNode;
      }
    }
    const fg = document.queryCommandValue('foreColor');
    const bg = document.queryCommandValue('backColor') || document.queryCommandValue('hiliteColor');
    if (fg) setTextColor(rgbToHex(fg));
    if (bg) setHighlightColor(rgbToHex(bg));
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      link: linkActive,
    });
  };

  // Track text selection — position toolbar above the selection rect
  useEffect(() => {
    const handleSelectionChange = () => {
      if (linkModalOpened) return; // Don't hide while modal is open
      const sel = document.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        if (textRef.current && textRef.current.contains(sel.anchorNode)) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          // Position at center-top of selection
          setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top });
          setShowToolbar(true);
          checkFormats();
        } else {
          setShowToolbar(false);
        }
      } else {
        setShowToolbar(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [textRef, linkModalOpened]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    checkFormats();
    textRef.current?.focus();
  };

  const applySavedColor = (cmd: string, value: string) => {
    if (!savedRange || !textRef.current) return;
    textRef.current.focus();
    const sel = document.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange);
    document.execCommand(cmd, false, value);
    checkFormats();
  };

  const handleLinkClick = () => {
    const sel = document.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      setSavedRange(sel.getRangeAt(0).cloneRange());
    }
    onLinkModalOpen?.(true);
    setLinkModalOpened(true);
  };

  const handleApplyLink = (url: string) => {
    setLinkModalOpened(false);
    onLinkModalOpen?.(false);
    if (!savedRange || !textRef.current) return;

    // Focus must happen before any DOM mutation in the editable
    textRef.current.focus();

    // Directly wrap selected range in <a> tag — execCommand('createLink') is unreliable
    try {
      const sel = document.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange);

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.style.textDecoration = 'underline';
      anchor.style.cursor = 'pointer';
      anchor.style.color = 'var(--space-primary, #3b82f6)';

      // Extract selected content and nest it inside the anchor
      anchor.appendChild(savedRange.extractContents());
      savedRange.insertNode(anchor);

      // Move cursor after the link
      const newRange = document.createRange();
      newRange.setStartAfter(anchor);
      newRange.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(newRange);
    } catch (err) {
      console.error('Link insert failed:', err);
    }

    checkFormats();
    setSavedRange(null);
  };

  const handleCloseLinkModal = () => {
    setLinkModalOpened(false);
    onLinkModalOpen?.(false);
    setTimeout(() => {
      if (savedRange && textRef.current) {
        textRef.current.focus();
        const sel = document.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(savedRange);
      }
    }, 10);
  };

  if (!showToolbar && !linkModalOpened) return null;
  if (!toolbarPos) return null;

  return (
    <>
      {showToolbar && (
        <Box
          tabIndex={-1}
          onMouseDown={(e) => {
            // Capture selection before blur fires from clicking toolbar
            const sel = document.getSelection();
            if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
              setSavedRange(sel.getRangeAt(0).cloneRange());
            }
          }}
          style={{
            position: 'fixed', // Use fixed to position relative to viewport
            left: toolbarPos.x,
            top: toolbarPos.y - 8,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
            pointerEvents: 'all',
            outline: 'none',
          }}
          data-inline-toolbar="true"
        >
          <Group 
            gap={4} p={6} 
            className="rounded-xl shadow-2xl backdrop-blur-md" 
            wrap="nowrap"
            style={{ 
              backgroundColor: is_dark ? 'rgba(30, 30, 46, 0.85)' : 'rgba(255, 255, 255, 0.95)',
              border: is_dark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
            }}
          >

            <Tooltip label={t('bold') || 'Bold'}>
              <ActionIcon variant={activeFormats.bold ? 'filled' : 'subtle'} color="var(--space-primary)"
                onClick={() => exec('bold')} onPointerDown={(e) => e.preventDefault()}>
                <MdFormatBold size={20} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={t('italic') || 'Italic'}>
              <ActionIcon variant={activeFormats.italic ? 'filled' : 'subtle'} color="var(--space-primary)"
                onClick={() => exec('italic')} onPointerDown={(e) => e.preventDefault()}>
                <MdFormatItalic size={20} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={t('underline') || 'Underline'}>
              <ActionIcon variant={activeFormats.underline ? 'filled' : 'subtle'} color="var(--space-primary)"
                onClick={() => exec('underline')} onPointerDown={(e) => e.preventDefault()}>
                <MdFormatUnderlined size={20} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={t('strikethrough') || 'Strikethrough'}>
              <ActionIcon variant={activeFormats.strikeThrough ? 'filled' : 'subtle'} color="var(--space-primary)"
                onClick={() => exec('strikeThrough')} onPointerDown={(e) => e.preventDefault()}>
                <MdStrikethroughS size={20} />
              </ActionIcon>
            </Tooltip>

            {/* Text color */}
            <Popover position="top" withArrow shadow="md" withinPortal onChange={(opened) => {
              if (opened) {
                const sel = document.getSelection();
                if (sel && sel.rangeCount > 0) setSavedRange(sel.getRangeAt(0).cloneRange());
              } else {
                textRef.current?.focus();
              }
            }}>
              <Popover.Target>
                <Tooltip label={t('text_color') || 'Text Color'}>
                  <ActionIcon 
                    variant="subtle" 
                    color="var(--space-primary)" 
                    onPointerDown={(e) => e.preventDefault()}
                    style={{ border: `1px solid ${is_dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}` }}
                  >
                    <MdFormatColorText size={20} color={textColor === '#ffffff' && !is_dark ? '#000000' : textColor} />
                  </ActionIcon>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown 
                bg={is_dark ? '#1e1e2e' : '#ffffff'} 
                bd={is_dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'} 
                p="xs"
              >
                <Stack gap="xs">
                  <Group gap={6} w={130} onPointerDown={(e) => e.preventDefault()}>
                    {COLORS.map(c => (
                      <ColorSwatch key={c} color={c} size={18} 
                        style={{ 
                          cursor: 'pointer', 
                          border: `1px solid ${is_dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` 
                        }}
                        onClick={() => { setTextColor(c); applySavedColor('foreColor', c); }} 
                      />
                    ))}
                  </Group>
                  <Divider opacity={0.1} />
                  <ColorPicker
                    value={textColor === 'transparent' ? '#ffffff' : textColor}
                    onChange={(c) => setTextColor(c)}
                    onChangeEnd={(c) => applySavedColor('foreColor', c)}
                    size="xs" fullWidth swatches={[]} />
                </Stack>
              </Popover.Dropdown>
            </Popover>

            {/* Highlight color */}
            <Popover position="top" withArrow shadow="md" withinPortal onChange={(opened) => {
              if (opened) {
                const sel = document.getSelection();
                if (sel && sel.rangeCount > 0) setSavedRange(sel.getRangeAt(0).cloneRange());
              } else {
                textRef.current?.focus();
              }
            }}>
              <Popover.Target>
                <Tooltip label={t('highlight') || 'Highlight'}>
                  <ActionIcon 
                    variant="subtle" 
                    color="var(--space-primary)" 
                    onPointerDown={(e) => e.preventDefault()}
                    style={{ border: `1px solid ${is_dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}` }}
                  >
                    <MdHighlight size={20} color={highlightColor === 'transparent' ? (is_dark ? '#a1a1aa' : '#71717a') : highlightColor} />
                  </ActionIcon>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown 
                bg={is_dark ? '#1e1e2e' : '#ffffff'} 
                bd={is_dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'} 
                p="xs"
              >
                <Stack gap="xs">
                  <Group gap={6} w={130} onPointerDown={(e) => e.preventDefault()}>
                    <ColorSwatch color="transparent" size={18} style={{ cursor: 'pointer', border: '1px solid #444' }}
                      onClick={() => { setHighlightColor('transparent'); applySavedColor('backColor', 'transparent'); }} />
                    {COLORS.map(c => (
                      <ColorSwatch key={c} color={c} size={18} 
                        style={{ 
                          cursor: 'pointer', 
                          border: `1px solid ${is_dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` 
                        }}
                        onClick={() => { setHighlightColor(c); applySavedColor('backColor', c); }} 
                      />
                    ))}
                  </Group>
                  <Divider opacity={0.1} />
                  <ColorPicker
                    value={highlightColor === 'transparent' ? '#facc15' : highlightColor}
                    onChange={(c) => setHighlightColor(c)}
                    onChangeEnd={(c) => applySavedColor('backColor', c)}
                    size="xs" fullWidth />
                </Stack>
              </Popover.Dropdown>
            </Popover>

            <Tooltip label={t('link') || 'Link'}>
              <ActionIcon variant="subtle" color="var(--space-primary)"
                onClick={handleLinkClick} onPointerDown={(e) => e.preventDefault()}>
                <MdLink size={20} />
              </ActionIcon>
            </Tooltip>

            {activeFormats.link && (
              <Tooltip label={t('unlink') || 'Remove Link'}>
                <ActionIcon variant="subtle" color="red"
                  onClick={() => exec('unlink')} onPointerDown={(e) => e.preventDefault()}>
                  <MdLinkOff size={20} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Box>
      )}

      <LinkCreateModal opened={linkModalOpened} onClose={handleCloseLinkModal} onAdd={handleApplyLink} />
    </>
  );
}
