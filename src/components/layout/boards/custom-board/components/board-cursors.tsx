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
            d="M0,0 L0,22 L6,16 L13,16 Z"
            fill={c.color}
            stroke="white"
            strokeWidth="2"
            style={{ 
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
              transition: 'fill 0.2s ease'
            }}
          />
          {/* Accent Pulse Dot */}
          <circle 
            r="3" 
            fill={c.color} 
            stroke="white" 
            strokeWidth="1"
          >
            <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Name Tag */}
          <foreignObject x={12} y={12} width={120} height={40} style={{ overflow: 'visible' }}>
            <Box 
              px={10} 
              py={4} 
              style={{ 
                backgroundColor: c.color,
                color: 'white',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                width: 'fit-content',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.3)'
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
