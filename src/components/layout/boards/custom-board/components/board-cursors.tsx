'use client';

import { Box, Avatar, Text } from '@mantine/core';

interface Props {
  cursors: Record<string, { 
    x: number; 
    y: number; 
    name?: string; 
    avatar?: string; 
    path?: string | null; 
    draft?: any;
    color?: string;
    stroke_width?: number;
  }>;
}

export function BoardCursors({ cursors }: Props) {
  return (
    <>
      {Object.entries(cursors).map(([id, c]) => (
        <g key={id} transform={`translate(${c.x}, ${c.y})`}>
          {/* Cursor Arrow */}
          <path
            d="M0,0 L0,18 L5,13 L11,13 Z"
            fill={c.color || '#3b82f6'}
            stroke="white"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          />
          {/* Name Tag */}
          <foreignObject x={12} y={12} width={120} height={40} style={{ overflow: 'visible' }}>
            <Box 
              px={8} 
              py={2} 
              style={{ 
                backgroundColor: c.color || '#3b82f6',
                color: 'white',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                width: 'fit-content',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {c.name || 'User'}
            </Box>
          </foreignObject>
          {/* Active Path Hint (optional) */}
          {c.path && (
            <path
              d={c.path}
              transform={`translate(${-c.x}, ${-c.y})`}
              fill="none"
              stroke={c.color || '#3b82f6'}
              strokeWidth={(c.stroke_width || 4) / 2}
              opacity={0.3}
              pointerEvents="none"
            />
          )}
        </g>
      ))}
    </>
  );
}
