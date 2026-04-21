'use client';

import { ReactNode, useRef, useState, useEffect } from 'react';
import { Box } from '@mantine/core';

interface Props {
  children: ReactNode;
  containerRef?: React.RefObject<HTMLElement | null>;
  width?: number;
  height?: number;
  fixed?: boolean;
  className?: string;
}

export function DraggablePip({ 
  children, 
  containerRef, 
  width = 240, 
  height = 160,
  fixed = false,
  className = ""
}: Props) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Reset position when container changes or on mount
  useEffect(() => {
    const updateInitialPosition = () => {
      let boundsWidth = window.innerWidth;
      let boundsHeight = window.innerHeight;

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        boundsWidth = rect.width;
        boundsHeight = rect.height;
      }

      // Default to bottom-right (matching original styles: bottom-24, right-24)
      setPosition({
        x: boundsWidth - width - 24,
        y: boundsHeight - height - 24,
      });
    };

    updateInitialPosition();
    window.addEventListener('resize', updateInitialPosition);
    return () => window.removeEventListener('resize', updateInitialPosition);
  }, [containerRef, width, height]);

  const onMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    
    // Don't drag if clicking buttons
    if ((e.target as HTMLElement).closest('button, .ActionIcon')) return;
    
    setIsDragging(true);
    hasMovedRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      // Check if moved more than 5px to distinguish drag from click
      if (!hasMovedRef.current) {
        const dist = Math.sqrt(
          Math.pow(e.clientX - startPosRef.current.x, 2) + 
          Math.pow(e.clientY - startPosRef.current.y, 2)
        );
        if (dist > 5) {
          hasMovedRef.current = true;
        }
      }

      let boundsWidth = window.innerWidth;
      let boundsHeight = window.innerHeight;
      let leftOffset = 0;
      let topOffset = 0;

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        boundsWidth = rect.width;
        boundsHeight = rect.height;
        leftOffset = rect.left;
        topOffset = rect.top;
      }
      
      let newX = e.clientX - leftOffset - offsetRef.current.x;
      let newY = e.clientY - topOffset - offsetRef.current.y;

      // Constrain within container
      newX = Math.max(0, Math.min(newX, boundsWidth - width));
      newY = Math.max(0, Math.min(newY, boundsHeight - height));

      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      // Wait a tiny bit before resetting moved flag to let the click event pass/be blocked
      setTimeout(() => {
        // we don't reset it here, we'll use it in the capture phase
      }, 0);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, containerRef, width, height]);

  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMovedRef.current = false; // Reset after blocking
    }
  };

  const scale = isHovered && !isDragging ? 1.05 : 1;

  return (
    <Box
      ref={dragRef}
      onMouseDown={onMouseDown}
      onClickCapture={onClickCapture}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
      }}
      className={`rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--call-border)] bg-[var(--call-surface)] ${className}`}
    >
      {children}
    </Box>
  );
}
