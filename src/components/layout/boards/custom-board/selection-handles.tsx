'use client';

import { BBox } from './types';

interface Props {
  bbox: BBox;
  zoom: number;
  angle?: number;
  is_interactive?: boolean;
  on_resize_start: (e: React.MouseEvent | React.TouchEvent, anchor: string) => void;
  on_rotate_start: (e: React.MouseEvent | React.TouchEvent) => void;
  on_pointer_down: (e: React.MouseEvent) => void;
  on_touch_start: (e: React.TouchEvent) => void;
  on_double_click: (e: React.MouseEvent) => void;
  is_locked?: boolean;
}

const ANCHORS = [
  { id: 'nw', x: 0,   y: 0   },
  { id: 'ne', x: 1,   y: 0   },
  { id: 'sw', x: 0,   y: 1   },
  { id: 'se', x: 1,   y: 1   },
  { id: 'n',  x: 0.5, y: 0   },
  { id: 's',  x: 0.5, y: 1   },
  { id: 'w',  x: 0,   y: 0.5 },
  { id: 'e',  x: 1,   y: 0.5 },
];

const CURSOR_MAP: Record<string, string> = {
  nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
  n: 'n-resize', s: 's-resize', w: 'w-resize', e: 'e-resize',
};

/**
 * SVG selection border with 8 resize handles (corners + edges) plus rotation handle.
 * Renders inside the world-coordinate transform group.
 */
export function SelectionHandles({ bbox, zoom, angle = 0, is_interactive, on_resize_start, on_rotate_start, on_pointer_down, on_touch_start, on_double_click, is_locked }: Props) {
  const { x, y, w, h } = bbox;
  const hs  = 8 / zoom;  // handle size in world units (constant 8px on screen)
  const cx = x + w / 2;
  const cy = y + h / 2;

  const stroke_color = is_locked ? '#adb5bd' : 'var(--space-primary)';

  return (
    <g transform={`rotate(${angle}, ${cx}, ${cy})`} style={{ pointerEvents: is_interactive ? 'none' : 'auto' }}>
      {/* Invisible hit area for dragging & double-clicking */}
      {!is_interactive && (
        <rect
          x={x - 2 / zoom} y={y - 2 / zoom}
          width={w + 4 / zoom} height={h + 4 / zoom}
          fill="transparent"
          style={{ cursor: is_locked ? 'default' : 'grab', pointerEvents: 'all' }}
          onMouseDown={(e) => { e.stopPropagation(); on_pointer_down(e); }}
          onTouchStart={(e) => { e.stopPropagation(); on_touch_start(e); }}
          onDoubleClick={(e) => { e.stopPropagation(); on_double_click(e); }}
        />
      )}

      {/* Selection border */}
      <rect
        x={x - 2 / zoom} y={y - 2 / zoom}
        width={w + 4 / zoom} height={h + 4 / zoom}
        fill="none"
        stroke={stroke_color}
        strokeWidth={1.5 / zoom}
        strokeDasharray={is_locked ? undefined : `${5 / zoom} ${3 / zoom}`}
        pointerEvents="none"
      />

      {/* Resize handles - hidden if locked */}
      {!is_locked && ANCHORS.map(({ id, x: ax, y: ay }) => {
        const hx = x + ax * w - hs / 2;
        const hy = y + ay * h - hs / 2;
        return (
          <rect
            key={id}
            x={hx} y={hy}
            width={hs} height={hs}
            rx={1.5 / zoom}
            fill="white"
            stroke={stroke_color}
            strokeWidth={1.5 / zoom}
            style={{ cursor: CURSOR_MAP[id] }}
            onMouseDown={(e) => { e.stopPropagation(); on_resize_start(e, id); }}
            onTouchStart={(e) => { e.stopPropagation(); on_resize_start(e, id); }}
          />
        );
      })}

      {/* Rotation handle - hidden if locked */}
      {!is_locked && (
        <>
          <line 
            x1={cx} y1={y} 
            x2={cx} y2={y - 24 / zoom} 
            stroke={stroke_color} 
            strokeWidth={1.5 / zoom} 
          />
          <circle 
            cx={cx} cy={y - 24 / zoom} 
            r={6 / zoom} 
            fill="white" 
            stroke={stroke_color} 
            strokeWidth={1.5 / zoom}
            style={{ cursor: 'alias' }}
            onMouseDown={(e) => { e.stopPropagation(); on_rotate_start(e); }}
            onTouchStart={(e) => { e.stopPropagation(); on_rotate_start(e); }}
          />
        </>
      )}

      {/* Lock icon indicator when locked */}
      {is_locked && (
        <g transform={`translate(${x + w - 24 / zoom}, ${y - 24 / zoom}) scale(${1 / zoom})`}>
             <rect width="20" height="20" rx="4" fill="#adb5bd" />
             <path d="M6 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="white" strokeWidth="2" />
             <rect x="5" y="10" width="10" height="7" rx="1" fill="white" />
        </g>
      )}
    </g>
  );
}
