'use client';

import { useTranslations } from 'next-intl';

import { BoardElement, TextElement, ImageElement, VideoElement, AudioElement, YoutubeElement, LinkElement, EmbedElement, FileElement, ArrowElement, ToolType, StrokeStyle } from './types';
import { SelectionHandles } from './selection-handles';
import { get_element_bbox } from './utils';
import { AudioPlayer } from '@/components/ui/audio-player';
import { Box, Group, ActionIcon, Tooltip, useMantineColorScheme, Loader, Badge, Stack, Text } from '@mantine/core';
import { IoDocumentOutline, IoDownloadOutline } from 'react-icons/io5';
import { MdLink, MdPlayArrow } from 'react-icons/md';
import { cn } from '@/lib/utils';

const backend_url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');
const get_media_url = (url: string) => {
    if (!url || url.startsWith('http') || url.startsWith('blob') || url.startsWith('data')) return url;
    return `${backend_url}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface CanvasRendererProps {
  elements: BoardElement[];
  pan_x: number;
  pan_y: number;
  zoom: number;
  selected_ids: string[];
  editing_text_id: string | null;
  interactive_media_id: string | null;
  tool: ToolType;
  on_element_pointer_down: (e: React.MouseEvent, id: string) => void;
  on_element_touch_start: (e: React.TouchEvent, id: string) => void;
  on_element_double_click: (e: React.MouseEvent, id: string) => void;
  on_resize_start: (e: React.MouseEvent | React.TouchEvent, id: string, anchor: string) => void;
  on_rotate_start: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  is_dark: boolean;
  eraser_trail?: { x: number, y: number }[];
}

function get_dash(style?: StrokeStyle, width: number = 4) {
  if (style === 'dashed') return `${width * 3}, ${width * 2}`;
  if (style === 'dotted') return `1, ${width * 2}`;
  if (style === 'dash-dot') return `${width * 3}, ${width * 2}, 1, ${width * 2}`;
  return undefined;
}

export function CanvasRenderer({
  elements, pan_x, pan_y, zoom, selected_ids, editing_text_id, interactive_media_id, tool,
  on_element_pointer_down, 
  on_element_touch_start,
  on_element_double_click, 
  on_resize_start, 
  on_rotate_start, 
  is_dark, 
  eraser_trail 
}: CanvasRendererProps) {
  const t = useTranslations('Common');
  const sel_style = (id: string): React.CSSProperties =>
    selected_ids.includes(id) ? { filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.8))' } : {};

  const make_handlers = (id: string) => ({
    onMouseDown: (e: React.MouseEvent) => {
      const is_pan = e.button === 1 || (e.button === 0 && (e.altKey || tool === 'hand'));
      if (is_pan || tool === 'eraser' || tool !== 'select') return;
      on_element_pointer_down(e, id);
    },
    onTouchStart: (e: React.TouchEvent) => {
      if (tool === 'hand' || tool === 'eraser' || tool !== 'select') return;
      on_element_touch_start(e, id);
    },
    onDoubleClick: (e: React.MouseEvent) => {
      if (tool !== 'select') return;
      e.stopPropagation();
      on_element_double_click(e, id);
    },
  });

   return (
    <>
      <style>{`
        .board-text-content a {
          text-decoration: underline !important;
          color: var(--space-primary) !important;
          cursor: pointer !important;
        }
      `}</style>
      <defs>
        <filter id="wavy_filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.03 0.15" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g transform={`translate(${pan_x}, ${pan_y}) scale(${zoom})`}>
        {elements.map((el) => {
          const handlers = make_handlers(el.id);
          const is_editing = el.id === editing_text_id;
          const style: React.CSSProperties = {
            cursor: tool === 'select' ? (el.is_locked ? 'default' : 'grab') : (tool === 'hand' ? 'grab' : 'default'),
            pointerEvents: tool === 'select' ? 'all' : 'none',
            ...sel_style(el.id),
            filter: (el as any).stroke_style === 'wavy' ? 'url(#wavy_filter)' : undefined
          };
          const dash = get_dash((el as any).stroke_style, (el as any).stroke_width);
          
          const bbox = get_element_bbox(el);
          const cx = bbox ? bbox.x + bbox.w / 2 : 0;
          const cy = bbox ? bbox.y + bbox.h / 2 : 0;
          const rotation = el.angle ? `rotate(${el.angle}, ${cx}, ${cy})` : '';

          const get_theme_color = (c?: string) => {
              if (!c) return c;
              const lower = c.toLowerCase();
              const is_adaptive = ['#000000', 'black', '#000', '#ffffff', 'white', '#fff'].includes(lower);
              if (is_adaptive) return is_dark ? '#ffffff' : '#000000';
              return c;
          };

          const c_color = get_theme_color((el as any).color);
          const c_fill = get_theme_color((el as any).fill);

          switch (el.type) {
            case 'path':
              return (
                <g key={el.id} {...handlers} transform={rotation}>
                  <path d={el.d} stroke="rgba(0,0,0,0.01)" strokeWidth={Math.max(24, el.stroke_width * 3)} fill="none" style={{ cursor: tool === 'select' ? 'grab' : 'default', pointerEvents: tool === 'select' ? 'all' : 'none' }} />
                  <path d={el.d} stroke={c_color} strokeWidth={el.stroke_width} strokeDasharray={dash} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={el.opacity} style={style} />
                </g>
              );

            case 'rect':
              return (
                <rect key={el.id} x={el.x} y={el.y} width={el.width} height={el.height} stroke={c_color} strokeWidth={el.stroke_width} strokeDasharray={dash} fill={c_fill} opacity={el.opacity} rx={2} style={style} {...handlers} transform={rotation} />
              );

            case 'ellipse':
              return (
                <ellipse key={el.id} cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} stroke={c_color} strokeWidth={el.stroke_width} strokeDasharray={dash} fill={c_fill} opacity={el.opacity} style={style} {...handlers} transform={rotation} />
              );

            case 'diamond': {
              const d = el as any; // DiamondElement
              const points = `${d.x + d.width / 2},${d.y} ${d.x + d.width},${d.y + d.height / 2} ${d.x + d.width / 2},${d.y + d.height} ${d.x},${d.y + d.height / 2}`;
              return (
                <polygon key={d.id} points={points} stroke={c_color} strokeWidth={d.stroke_width} strokeDasharray={dash} fill={c_fill} opacity={d.opacity} style={style} {...handlers} transform={rotation} />
              );
            }

            case 'triangle': {
              const t = el as any; // TriangleElement
              const points = `${t.x + t.width / 2},${t.y} ${t.x + t.width},${t.y + t.height} ${t.x},${t.y + t.height}`;
              return (
                <polygon key={t.id} points={points} stroke={c_color} strokeWidth={t.stroke_width} strokeDasharray={dash} fill={c_fill} opacity={t.opacity} style={style} {...handlers} transform={rotation} />
              );
            }

            case 'line':
              return (
                <line key={el.id} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={c_color} strokeWidth={el.stroke_width} strokeDasharray={dash} strokeLinecap="round" opacity={el.opacity} style={style} {...handlers} transform={rotation} />
              );

            case 'arrow': {
              const a = el as ArrowElement;
              const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
              const headlen = 10 + a.stroke_width * 2;
              const x3 = a.x2 - headlen * Math.cos(angle - Math.PI / 6);
              const y3 = a.y2 - headlen * Math.sin(angle - Math.PI / 6);
              const x4 = a.x2 - headlen * Math.cos(angle + Math.PI / 6);
              const y4 = a.y2 - headlen * Math.sin(angle + Math.PI / 6);

              return (
                <g key={a.id} style={style} {...handlers} opacity={a.opacity} transform={rotation}>
                  <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={c_color} strokeWidth={a.stroke_width} strokeDasharray={dash} strokeLinecap="round" />
                  <path d={`M ${a.x2} ${a.y2} L ${x3} ${y3} M ${a.x2} ${a.y2} L ${x4} ${y4}`} stroke={c_color} strokeWidth={a.stroke_width} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              );
            }

            case 'text': {
              const t = el as TextElement;
              const decor: string[] = [];
              if (t.text_decoration === 'underline') decor.push('underline');
              if (t.text_decoration === 'line-through') decor.push('line-through');
              if (!bbox) return null;
              return (
                <foreignObject key={el.id} x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h} opacity={is_editing ? 0 : t.opacity} style={{ overflow: 'visible', pointerEvents: 'none', transform: el.angle ? `rotate(${el.angle}deg)` : undefined, transformOrigin: 'center' }} >
                  <div className="board-text-content" onMouseDown={(e) => { 
                    // If clicking a link — open it, don't select the frame
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'A' || target.closest('a')) {
                      e.stopPropagation();
                      const anchor = (target.tagName === 'A' ? target : target.closest('a')) as HTMLAnchorElement;
                      if (anchor?.href) window.open(anchor.href, '_blank', 'noopener,noreferrer');
                      return;
                    }
                    const is_pan = e.button === 1 || (e.button === 0 && (e.altKey || tool === 'hand'));
                    if (is_pan || tool === 'eraser' || tool !== 'select') return;
                    on_element_pointer_down(e, el.id);
                  }} onTouchStart={(e) => {
                    if (tool === 'hand' || tool === 'eraser' || tool !== 'select') return;
                    on_element_touch_start(e, el.id);
                  }} onDoubleClick={(e) => {
                    if (tool !== 'select') return;
                    e.stopPropagation();
                    on_element_double_click(e, el.id);
                  }} style={{ width: 'fit-content', minWidth: '100%', pointerEvents: tool === 'select' ? 'all' : 'none', cursor: tool === 'select' ? 'text' : 'default', color: c_color, fontSize: t.font_size, fontWeight: t.font_weight, fontStyle: t.font_style, textDecoration: decor.join(' ') || 'none', fontFamily: t.font_family, whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'none', marginTop: 0, lineHeight: 1.35 }} 
                    dangerouslySetInnerHTML={{ __html: t.content }}
                  />
                </foreignObject>
              );
            }

            case 'image': {
              const img = el as ImageElement;
              return (
                <foreignObject key={el.id} x={img.x} y={img.y} width={img.width} height={img.height} opacity={img.opacity} style={{ overflow: 'visible', pointerEvents: 'none', transform: el.angle ? `rotate(${el.angle}deg)` : undefined, transformOrigin: 'center' }} >
                  <div style={{ width: '100%', height: '100%', position: 'relative', background: img.loading ? 'rgba(0,0,0,0.05)' : 'transparent', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {img.loading ? (
                      <Stack align="center" gap={4}>
                        <Loader size="sm" />
                        <Text size="xs" c="dimmed">{t('uploading', { defaultValue: 'Uploading...' })}</Text>
                      </Stack>
                    ) : (
                      <img 
                        src={get_media_url(img.src)} 
                        alt={img.name} 
                        crossOrigin="anonymous"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: tool === 'select' ? 'all' : 'none', cursor: tool === 'select' ? (img.is_locked ? 'default' : 'grab') : 'default' }} 
                        onMouseDown={(e) => {
                            if (img.is_locked) {
                                // Still allow selection
                                const is_pan = e.button === 1 || (e.button === 0 && (e.altKey || tool === 'hand'));
                                if (is_pan || tool === 'eraser' || tool !== 'select') return;
                                on_element_pointer_down(e, img.id);
                                return;
                            }
                            handlers.onMouseDown(e);
                        }} 
                        onTouchStart={(e) => {
                            if (img.is_locked) return;
                            handlers.onTouchStart(e);
                        }}
                        onDoubleClick={(e) => {
                            if (img.is_locked) return;
                            handlers.onDoubleClick(e);
                        }} 
                      />
                    )}
                  </div>
                </foreignObject>
              );
            }

            case 'video': {
              const v = el as VideoElement;
              const is_int = interactive_media_id === el.id;
              return (
                <foreignObject key={el.id} x={v.x} y={v.y} width={v.width} height={v.height} opacity={v.opacity} style={{ overflow: 'visible', pointerEvents: 'auto', transform: el.angle ? `rotate(${el.angle}deg)` : undefined, transformOrigin: 'center' }} >
                  <div onMouseDown={(e) => { 
                    if (is_int) return;
                    const is_pan = e.button === 1 || (e.button === 0 && (e.altKey || tool === 'hand'));
                    if (is_pan || tool === 'eraser' || tool !== 'select') return;
                    e.stopPropagation(); 
                    on_element_pointer_down(e, el.id); 
                  }} onTouchStart={(e) => {
                    if (is_int || tool === 'hand' || tool === 'eraser' || tool !== 'select' || el.is_locked) return;
                    on_element_touch_start(e, el.id);
                  }} onDoubleClick={(e) => { 
                    if (tool !== 'select' || el.is_locked) return;
                    e.stopPropagation(); 
                    on_element_double_click(e, el.id); 
                  }}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      pointerEvents: is_int ? 'auto' : (tool === 'select' ? 'all' : 'none'), 
                      cursor: is_int ? 'default' : (tool === 'select' ? (el.is_locked ? 'default' : 'grab') : 'default'), 
                      borderRadius: 8, 
                      overflow: 'hidden', 
                      background: '#000', 
                      border: is_int ? '2px solid var(--space-primary)' : 'none', 
                      boxShadow: is_int ? '0 0 12px rgba(var(--space-primary-rgb), 0.4)' : 'none',
                      position: 'relative'
                    }} >
                  {v.loading ? (
                    <Stack align="center" gap={4}>
                      <Loader size="sm" color="white" />
                      <Text size="xs" c="white" opacity={0.7}>{t('uploading', { defaultValue: 'Uploading...' })}</Text>
                    </Stack>
                  ) : (
                    <video src={get_media_url(v.src)} controls style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: is_int ? 'auto' : 'none' }} />
                  )}
                    {selected_ids.includes(el.id) && !is_int && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
                        <Box p={10} bg="blue" style={{ borderRadius: '50%', color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                           <MdPlayArrow size={30} />
                        </Box>
                      </div>
                    )}
                  </div>
                </foreignObject>
              );
            }

            case 'audio': {
              const a = el as AudioElement;
              const is_int = interactive_media_id === el.id;
              return (
                <foreignObject key={el.id} x={a.x} y={a.y} width={a.width} height={a.height} opacity={a.opacity} style={{ overflow: 'visible', pointerEvents: 'none', transform: el.angle ? `rotate(${el.angle}deg)` : undefined, transformOrigin: 'center' }} >
                  <div onMouseDown={(e) => { 
                    const is_pan = e.button === 1 || (e.button === 0 && (e.altKey || tool === 'hand'));
                    if (is_pan || tool === 'eraser' || tool !== 'select') return;
                    if (!is_int) on_element_pointer_down(e, el.id); 
                  }} onTouchStart={(e) => {
                    if (is_int || tool === 'hand' || tool === 'eraser' || tool !== 'select') return;
                    on_element_touch_start(e, el.id);
                  }} onDoubleClick={(e) => { 
                    if (tool !== 'select') return;
                    e.stopPropagation(); 
                    on_element_double_click(e, el.id); 
                  }}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      pointerEvents: tool === 'select' ? 'all' : 'none', 
                      cursor: is_int ? 'default' : (tool === 'select' ? (el.is_locked ? 'default' : 'grab') : 'default'), 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: 8, 
                      gap: 4, 
                      background: 'transparent', 
                      borderRadius: 12, 
                      border: is_int ? '2px solid var(--space-primary)' : 'none', 
                      boxShadow: is_int ? '0 0 12px rgba(var(--space-primary-rgb), 0.4)' : 'none' 
                    }} >
                    {a.loading ? (
                       <Group wrap="nowrap" gap="sm" px="md" style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.05)', borderRadius: 12 }}>
                         <Loader size="xs" />
                         <Text size="xs" c="dimmed">{t('uploading', { defaultValue: 'Uploading...' })}</Text>
                       </Group>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, color: is_dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', textAlign: 'center', fontWeight: 500 }}> 🎵 {a.name} </div>
                        <div style={{ width: '100%', pointerEvents: is_int ? 'auto' : 'none' }}> <AudioPlayer src={get_media_url(a.src)} /> </div>
                      </>
                    )}
                  </div>
                </foreignObject>
              );
            }

            case 'youtube': {
              const yt = el as YoutubeElement;
              const is_int = interactive_media_id === el.id;
              return (
                <foreignObject key={el.id} x={yt.x} y={yt.y} width={yt.width} height={yt.height} opacity={yt.opacity} style={{ overflow: 'visible', pointerEvents: 'auto', transform: el.angle ? `rotate(${el.angle}deg)` : undefined, transformOrigin: 'center' }} >
                  <div onMouseDown={(e) => { 
                    if (is_int) return;
                    const is_pan = e.button === 1 || (e.button === 0 && (e.altKey || tool === 'hand'));
                    if (is_pan || tool === 'eraser' || tool !== 'select') return;
                    e.stopPropagation(); 
                    on_element_pointer_down(e, el.id); 
                  }} onTouchStart={(e) => {
                    if (is_int || tool === 'hand' || tool === 'eraser' || tool !== 'select' || el.is_locked) return;
                    on_element_touch_start(e, el.id);
                  }} onDoubleClick={(e) => { 
                    if (tool !== 'select' || el.is_locked) return;
                    e.stopPropagation(); 
                    on_element_double_click(e, el.id); 
                  }}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      pointerEvents: is_int ? 'auto' : (tool === 'select' ? 'all' : 'none'), 
                      cursor: is_int ? 'default' : (tool === 'select' ? (el.is_locked ? 'default' : 'grab') : 'default'), 
                      borderRadius: 8, 
                      overflow: 'hidden', 
                      background: '#000', 
                      border: is_int ? '2px solid var(--space-primary)' : 'none', 
                      boxShadow: is_int ? '0 0 12px rgba(var(--space-primary-rgb), 0.4)' : 'none',
                      position: 'relative'
                    }} >
                    <iframe src={`https://www.youtube.com/embed/${yt.video_id}`} style={{ width: '100%', height: '100%', border: 'none', pointerEvents: is_int ? 'auto' : 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    {!is_int && (
                      <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: tool === 'select' ? 'grab' : 'default', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {selected_ids.includes(el.id) && (
                            <Box p={10} style={{ borderRadius: '50%', backgroundColor: 'var(--space-primary)', color: 'var(--space-primary-text)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                               <MdPlayArrow size={30} />
                            </Box>
                         )}
                      </div>
                    )}
                  </div>
                </foreignObject>
              );
            }

            case 'embed': {
              const eb = el as EmbedElement;
              const is_sel = selected_ids.includes(el.id);
              const is_int = interactive_media_id === el.id;
              return (
                <foreignObject key={el.id} x={eb.x} y={eb.y} width={eb.width} height={eb.height} opacity={eb.opacity} style={{ overflow: 'visible', pointerEvents: 'auto', transform: el.angle ? `rotate(${el.angle}deg)` : undefined, transformOrigin: 'center' }} >
                  <div onMouseDown={(e) => {
                    if (is_int) return;
                    const is_pan = e.button === 1 || (e.button === 0 && (e.altKey || tool === 'hand'));
                    if (is_pan || tool === 'eraser' || tool !== 'select') return;
                    e.stopPropagation(); 
                    on_element_pointer_down(e, el.id); 
                   }} onTouchStart={(e) => {
                    if (is_int || tool === 'hand' || tool === 'eraser' || tool !== 'select') return;
                    on_element_touch_start(e, el.id);
                   }}
                    onDoubleClick={(e) => { if (tool !== 'select' || el.is_locked) return; e.stopPropagation(); on_element_double_click(e, el.id); }}
                    style={{ width: '100%', height: '100%', pointerEvents: is_int ? 'auto' : (tool === 'select' ? 'all' : 'none'), cursor: tool === 'select' ? (is_int ? 'default' : (el.is_locked ? 'default' : 'grab')) : 'default', borderRadius: 12, overflow: 'hidden', border: is_sel ? '2px solid var(--space-primary)' : `1px solid ${is_dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, background: '#000', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }} >
                    <iframe src={eb.src} style={{ width: '100%', height: '100%', border: 'none', pointerEvents: is_int ? 'all' : 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; vr" allowFullScreen />
                    {!is_int && (
                      <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: tool === 'select' ? 'grab' : 'default', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {is_sel && (
                            <Box p={10} style={{ borderRadius: '50%', backgroundColor: 'var(--space-primary)', color: 'var(--space-primary-text)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                               <MdPlayArrow size={30} />
                            </Box>
                         )}
                      </div>
                    )}
                  </div>
                </foreignObject>
              );
            }

            case 'link': {
              const l = el as LinkElement;
              const is_sel = selected_ids.includes(l.id);
              const is_int = interactive_media_id === el.id;
              return (
                <foreignObject key={el.id} x={l.x} y={l.y} width={l.width} height={l.height} opacity={l.opacity} style={{ overflow: 'visible', pointerEvents: 'auto', transform: el.angle ? `rotate(${el.angle}deg)` : undefined, transformOrigin: 'center' }} >
                  <div {...(tool === 'select' ? handlers : {})} 
                    onTouchStart={(e) => {
                        if (is_int || tool === 'hand' || tool === 'eraser' || tool !== 'select' || el.is_locked) return;
                        on_element_touch_start(e, el.id);
                    }}
                    onDoubleClick={(e) => { if (tool !== 'select' || el.is_locked) return; e.stopPropagation(); on_element_double_click(e, el.id); }}
                    style={{ width: '100%', height: '100%', pointerEvents: is_int ? 'auto' : (tool === 'select' ? 'all' : 'none'), cursor: tool === 'select' ? (is_int ? 'default' : (el.is_locked ? 'default' : 'grab')) : 'default', display: 'flex', flexDirection: 'column', background: is_dark ? '#1e1e2d' : '#ffffff', borderRadius: 12, overflow: 'hidden', border: is_sel ? '2px solid var(--space-primary)' : `1px solid ${is_dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} >
                    {l.loading ? (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader size="sm" color="primary" />
                      </div>
                    ) : (
                      <>
                        {l.image ? <div style={{ width: '100%', height: '55%', background: `url(${l.image}) center/cover no-repeat`, borderBottom: `1px solid ${is_dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` }} /> : <div style={{ width: '100%', height: '55%', background: is_dark ? '#2a2a3c' : '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}> 🔗 </div>}
                        <div style={{ padding: '10px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: is_dark ? '#fff' : '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}> {l.title} </div>
                          {l.description && <div style={{ fontSize: 11, color: is_dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}> {l.description} </div>}
                          <div style={{ fontSize: 11, color: is_dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}> {new URL(l.url).hostname} </div>
                          <div onClick={(e) => { if (tool !== 'select') return; e.stopPropagation(); window.open(l.url, '_blank'); }} style={{ marginTop: 4, fontSize: 10, color: 'var(--space-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }} > {is_dark ? 'OPEN LINK' : 'ВІДКРИТИ'} ↗ </div>
                        </div>
                      </>
                    )}
                  </div>
                </foreignObject>
              );
            }

            case 'file': {
              const f = el as FileElement;
              const is_sel = selected_ids.includes(f.id);
              const is_int = interactive_media_id === el.id;
              return (
                <foreignObject key={f.id} x={f.x} y={f.y} width={f.width} height={f.height} style={{ opacity: f.opacity, overflow: 'visible', transform: el.angle ? `rotate(${el.angle}deg)` : undefined, transformOrigin: 'center', pointerEvents: 'auto' }} >
                  <div onMouseDown={(e) => {
                    if (is_int) return;
                    const is_pan = e.button === 1 || (e.button === 0 && (e.altKey || tool === 'hand'));
                    if (is_pan || tool === 'eraser' || tool !== 'select') return;
                    on_element_pointer_down(e, f.id);
                  }} 
                  onTouchStart={(e) => {
                    if (is_int || tool === 'hand' || tool === 'eraser' || tool !== 'select' || f.is_locked) return;
                    on_element_touch_start(e, f.id);
                  }}
                  onDoubleClick={(e) => {
                    if (tool !== 'select' || f.is_locked) return;
                    e.stopPropagation();
                    on_element_double_click(e, f.id);
                  }} className={cn(
                    "w-full h-full flex flex-row items-center justify-between rounded-xl border transition-all px-3 py-2 pointer-events-auto gap-3", 
                    is_dark ? "bg-[#1e1e2d] border-white/10" : "bg-white border-gray-200", 
                    is_sel ? "shadow-lg ring-2 ring-[var(--space-primary)]/30" : "shadow-sm"
                  )} 
                  style={{ 
                    pointerEvents: is_int ? 'auto' : (tool === 'select' ? 'all' : 'none'), 
                    cursor: tool === 'select' ? (is_int ? 'default' : (f.is_locked ? 'default' : 'grab')) : 'default',
                    borderColor: is_sel ? 'var(--space-primary)' : undefined,
                    zIndex: 10
                  }}>
                    {f.loading ? (
                      <Group gap="sm" wrap="nowrap">
                        <Loader size="xs" />
                        <Text size="xs" c="dimmed">Uploading...</Text>
                      </Group>
                    ) : (
                      <>
                        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                          <Box 
                            className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-lg relative" 
                            style={{ backgroundColor: 'rgba(var(--space-primary-rgb), 0.1)' }}
                          > 
                            <IoDocumentOutline size={20} style={{ color: 'var(--space-primary)' }} /> 
                            <Badge 
                                size="xs" 
                                variant="filled" 
                                color="primary" 
                                style={{ position: 'absolute', bottom: -4, right: -4, fontSize: 8, height: 14, minHeight: 14, padding: '0 4px' }}
                            >
                                {f.ext || 'FILE'}
                            </Badge>
                          </Box>
                          <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1, color: is_dark ? 'white' : 'black' }}>
                            {f.name}
                          </Text>
                        </Group>
                        <Tooltip label={t('download')}>
                          <ActionIcon 
                            variant="light" 
                            color="primary" 
                            radius="md" 
                            size="md" 
                            onClick={async (e) => { 
                                e.stopPropagation(); 
                                try {
                                    const response = await fetch(get_media_url(f.src));
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = f.name;
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                } catch (err) {
                                    console.error("Download failed:", err);
                                    window.open(get_media_url(f.src), '_blank');
                                }
                            }}
                            onMouseDown={(e) => { e.stopPropagation(); }}
                          >
                            <IoDownloadOutline size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </foreignObject>
              );
            }

            default:
              return null;
          }
        })}

        {elements.map(el => {
          if (!selected_ids.includes(el.id) || el.id === editing_text_id || tool !== 'select') return null;
          const bbox = get_element_bbox(el);
          if (!bbox) return null;
          return (
            <SelectionHandles 
              key={`sel-${el.id}`} 
              bbox={bbox} 
              zoom={zoom} 
              angle={el.angle}
              is_interactive={interactive_media_id === el.id}
              on_resize_start={(e, anchor) => on_resize_start(e, el.id, anchor)} 
              on_rotate_start={(e) => on_rotate_start(e, el.id)}
              on_pointer_down={(e) => on_element_pointer_down(e, el.id)}
              on_touch_start={(e) => on_element_touch_start(e, el.id)}
              on_double_click={(e) => on_element_double_click(e, el.id)}
              is_locked={el.is_locked}
            />
          );
        })}
      </g>
    </>
  );
}
