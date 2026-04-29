'use client';

import React, { useMemo } from 'react';
import { Button, Transition, useMantineColorScheme } from '@mantine/core';
import { IoLocateOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { BoardElement, BBox } from '../types';
import { get_collective_bbox } from '../utils';

interface Props {
  elements: BoardElement[];
  pan_x: number;
  pan_y: number;
  zoom: number;
  on_back: (bbox: BBox) => void;
}

export function BackToContentButton({ elements, pan_x, pan_y, zoom, on_back }: Props) {
  const t = useTranslations('Boards');
  const { colorScheme } = useMantineColorScheme();
  const is_dark = colorScheme === 'dark';

  const collective_bbox = useMemo(() => get_collective_bbox(elements), [elements]);

  const is_out_of_view = useMemo(() => {
    if (!collective_bbox) return false;

    // Viewport in world coordinates
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    const view_x1 = -pan_x / zoom;
    const view_y1 = -pan_y / zoom;
    const view_x2 = (vw - pan_x) / zoom;
    const view_y2 = (vh - pan_y) / zoom;

    // Check if any part of the collective bbox is in the viewport
    const intersect_x = Math.max(view_x1, collective_bbox.x) <= Math.min(view_x2, collective_bbox.x + collective_bbox.w);
    const intersect_y = Math.max(view_y1, collective_bbox.y) <= Math.min(view_y2, collective_bbox.y + collective_bbox.h);

    return !(intersect_x && intersect_y);
  }, [collective_bbox, pan_x, pan_y, zoom]);

  if (!collective_bbox) return null;

  return (
    <Transition mounted={is_out_of_view} transition="slide-up" duration={400} timingFunction="ease">
      {(styles) => (
        <div 
          style={{ 
            ...styles,
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100
          }}
        >
          <Button
            leftSection={<IoLocateOutline size={18} />}
            radius="xl"
            size="md"
            variant="filled"
            style={{ 
              backgroundColor: is_dark ? 'rgba(var(--space-primary-rgb), 0.9)' : 'var(--space-primary)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={() => on_back(collective_bbox)}
          >
            {t('back_to_content')}
          </Button>
        </div>
      )}
    </Transition>
  );
}
