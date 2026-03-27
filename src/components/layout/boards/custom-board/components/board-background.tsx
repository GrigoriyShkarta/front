'use client';

import { useMemo } from 'react';
import { GridType } from '../types';

interface BoardBackgroundProps {
  zoom: number;
  pan_x: number;
  pan_y: number;
  grid_type: GridType;
  grid_color: string;
}

export function BoardBackground({ 
  zoom, 
  pan_x, 
  pan_y, 
  grid_type, 
  grid_color 
}: BoardBackgroundProps) {
  // Pattern size scales with zoom
  const size = 40 * zoom;

  return (
    <>
      <defs>
        <pattern 
          id="grid" 
          width={size} 
          height={size} 
          patternUnits="userSpaceOnUse"
          // We apply the pan specifically to the pattern's transform
          patternTransform={`translate(${pan_x}, ${pan_y})`}
        >
          {grid_type === 'cells' && (
            <path 
              d={`M ${size} 0 L 0 0 0 ${size}`} 
              fill="none" 
              stroke={grid_color} 
              strokeWidth="0.5" 
            />
          )}
          {grid_type === 'dots' && (
            <circle cx={1.5} cy={1.5} r={1} fill={grid_color} />
          )}
        </pattern>
      </defs>
      {/* This rect covers the whole SVG viewport and is NOT transformed by the main Group */}
      <rect width="100%" height="100%" fill="url(#grid)" style={{ pointerEvents: 'none' }} />
    </>
  );
}
