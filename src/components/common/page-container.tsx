'use client';

import { ReactNode } from 'react';
import { Box, Container } from '@mantine/core';

interface Props {
  children: ReactNode;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
}

/**
 * Standard container for pages to ensure consistent spacing and max-width.
 */
export function PageContainer({ children, size = 'xl', centered = false }: Props) {
  return (
    <Box className="flex-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Container size={size} py="xl" h="100%" className={centered ? 'flex items-center justify-center' : ''}>
        {children}
      </Container>
    </Box>
  );
}
