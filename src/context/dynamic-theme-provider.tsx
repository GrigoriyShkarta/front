'use client';

import { ReactNode, useMemo, useState, useEffect } from 'react';
import { MantineProvider, createTheme, useMantineColorScheme } from '@mantine/core';
import { useAuth } from '@/hooks/use-auth';
import { applyTheme } from '@/lib/theme/apply-theme';
import { SPACE_FONTS } from '@/lib/constants';

interface Props {
  children: ReactNode;
}

/**
 * Internal component to apply theme effects.
 * Must be inside MantineProvider to access the correct current color scheme.
 */
function ThemeApplier({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const [is_mounted, set_is_mounted] = useState(false);

  useEffect(() => {
    set_is_mounted(true);
  }, []);

  const space = user?.space?.personalization;
  // If select_mode is enabled, we use Mantine's colorScheme. Otherwise, always light.
  const mode = space?.select_mode ? (colorScheme === 'dark' ? 'dark' : 'light') : 'light';

  // Apply theme to DOM (CSS Variables for Tailwind and Body)
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
    });
  }, [space, mode, is_mounted]);

  return (
    <div className="space-bg-dynamic min-h-screen h-screen overflow-y-auto w-full">
      {children}
    </div>
  );
}

export function DynamicThemeProvider({ children }: Props) {
  const { user } = useAuth();
  const space = user?.space?.personalization;

  // Generate Mantine theme object dynamically based on space settings
  const theme = useMemo(() => {
    const primary_val = space?.primary_color || '#2563eb';
    let primary_hex = '#2563eb';
    
    
    if (primary_val.includes('gradient')) {
      const colors = primary_val.match(/#[a-fA-F0-9]{3,6}/g);
      primary_hex = colors?.[0] || '#2563eb';
    } else {
      primary_hex = primary_val;
    }

    // Resolve font family
    const font_id = space?.font_family || 'inter';
    const font_option = SPACE_FONTS.find(f => f.id === font_id);
    const font_family = font_option ? `'${font_option.label}', sans-serif` : "'Inter', sans-serif";

    return createTheme({
      primaryColor: 'brand',
      cursorType: 'pointer',
      fontFamily: font_family,
      colors: {
        brand: Array(10).fill(primary_hex) as any, // Simple brand palette expansion
      },
      defaultRadius: 'md',
    });
  }, [space?.primary_color, space?.font_family]);

  return (
    <MantineProvider theme={theme}>
      <ThemeApplier>
        {children}
      </ThemeApplier>
    </MantineProvider>
  );
}
