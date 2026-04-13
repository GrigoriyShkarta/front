'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { useAuth } from '@/hooks/use-auth';
import { applyTheme } from '@/lib/theme/apply-theme';

interface Props {
  children: ReactNode;
}

/**
 * Applies space theme (colors, font, bg) via CSS variables after mount.
 * No nested MantineProvider — avoids hydration mismatches and navigation hangs.
 * @param children - React children to render inside the themed container
 */
export function DynamicThemeProvider({ children }: Props) {
  const { user } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const [is_mounted, set_is_mounted] = useState(false);

  useEffect(() => {
    set_is_mounted(true);
  }, []);

  const space = user?.space?.personalization;
  const mode = space?.select_mode ? (colorScheme === 'dark' ? 'dark' : 'light') : 'light';

  useEffect(() => {
    if (!is_mounted) return;

    applyTheme({
      mode,
      primary: space?.primary_color || '#2563eb',
      secondary: space?.secondary_color || '#64748b',
      background: space?.bg_color || '#ffffff',
      background_dark: space?.bg_color_dark || '#0f0f0f',
      select_mode: space?.select_mode,
      is_white_sidebar_color: space?.is_white_sidebar_color ?? false,
      font_family: space?.font_family || 'inter',
      accent_color: space?.accent_color || '#2563eb',
    });
  }, [space, mode, is_mounted]);

  return (
    <div className="space-bg-dynamic min-h-screen h-screen overflow-y-auto w-full">
      {children}
    </div>
  );
}
