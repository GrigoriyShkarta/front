'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useMemo } from 'react';
import { personalization_schema, PersonalizationFormData } from '@/schemas/personalization';
import { useAuth } from '@/hooks/use-auth';
import { 
  PRIMARY_COLORS_CATEGORIZED, 
  SECONDARY_COLORS, 
  BACKGROUND_LIGHT, 
  BACKGROUND_DARK, 
  BASIC_PRIMARY_COLORS,
  BASIC_SECONDARY_COLORS,
  BASIC_BACKGROUND_LIGHT,
  BASIC_BACKGROUND_DARK,
  BASIC_FONTS
} from '@/lib/constants';

export function usePersonalizationForm() {
  const { user, setUser } = useAuth();
  const space = user?.space?.personalization;
  const is_premium = user?.is_premium || false;
  const initial_space_ref = useRef<any>(null);

  // Store initial space one time
  useEffect(() => {
    if (space && !initial_space_ref.current) {
        initial_space_ref.current = { ...space };
    }
  }, [space]);

  const form = useForm<PersonalizationFormData>({
    resolver: zodResolver(personalization_schema),
    mode: 'onChange',
    defaultValues: {
      title_space: space?.title_space || 'Lirnexa',
      primary_color: space?.primary_color || '#2563eb',
      secondary_color: space?.secondary_color || '#64748b',
      bg_color: space?.bg_color || '#ffffff',
      select_mode: (space?.select_mode as any) === true || (space?.select_mode as any) === 'true',
      bg_color_dark: space?.bg_color_dark || '#0f0f0f',
      is_white_sidebar_color: (space?.is_white_sidebar_color as any) === true || (space?.is_white_sidebar_color as any) === 'true',
      languages: space?.languages || ['uk'],
      font_family: space?.font_family || 'inter',
      icon: space?.icon || null,
      is_show_sidebar_icon: space?.is_show_sidebar_icon ?? true,
    }
  });

  useEffect(() => {
    if (!space || form.formState.isDirty) return;

    form.reset({
      title_space: space?.title_space || 'Lirnexa',
      primary_color: space?.primary_color || '#2563eb',
      secondary_color: space?.secondary_color || '#64748b',
      bg_color: space?.bg_color || '#ffffff',
      select_mode: (space?.select_mode as any) === true || (space?.select_mode as any) === 'true',
      bg_color_dark: space?.bg_color_dark || '#0f0f0f',
      is_white_sidebar_color: (space?.is_white_sidebar_color as any) === true || (space?.is_white_sidebar_color as any) === 'true',
      languages: space?.languages || ['uk'],
      font_family: space?.font_family || 'inter',
      icon: space?.icon || null,
      is_show_sidebar_icon: space?.is_show_sidebar_icon ?? true,
    });
  }, [space, form]);

  const { watch } = form;
  const watched_values = watch();
  const watched_string = JSON.stringify(watched_values);

  console.log('watched_values', watched_values);

  // Check if any premium option is selected
  const has_premium_selected = useMemo(() => {
    // Check primary
    const is_primary_premium = watched_values.primary_color.includes('gradient') || 
      PRIMARY_COLORS_CATEGORIZED.find(c => c.id === watched_values.primary_color)?.is_premium;
    
    // Check sidebar text color (White sidebar text is premium)
    const is_sidebar_color_premium = watched_values.is_white_sidebar_color === true;

    // Check secondary
    const is_secondary_premium = watched_values.secondary_color.includes('gradient') || 
      (!BASIC_SECONDARY_COLORS.some(c => c.id === watched_values.secondary_color) && 
       SECONDARY_COLORS.find(c => c.id === watched_values.secondary_color)?.is_premium);
    
    // Check background
    const is_bg_premium = watched_values.bg_color.includes('gradient') || 
      (!BASIC_BACKGROUND_LIGHT.some(c => c.id === watched_values.bg_color) && 
       BACKGROUND_LIGHT.find(c => c.id === watched_values.bg_color)?.is_premium);
    
    // Check dark background
    const is_bg_dark_premium = watched_values.select_mode && (watched_values.bg_color_dark.includes('gradient') || 
      (!BASIC_BACKGROUND_DARK.some(c => c.id === watched_values.bg_color_dark) && 
       BACKGROUND_DARK.find(c => c.id === watched_values.bg_color_dark)?.is_premium));

    // Check font
    const is_font_premium = !BASIC_FONTS.some(f => f.id === watched_values.font_family);

    // Check icon (new upload is premium)
    const is_icon_premium = watched_values.icon instanceof File;

    // Check sidebar icon setting (showing is premium)
    const is_sidebar_icon_premium = watched_values.is_show_sidebar_icon === true;

    return !!(is_primary_premium || is_secondary_premium || is_bg_premium || is_bg_dark_premium || is_font_premium || is_icon_premium || is_sidebar_icon_premium);
  }, [watched_string]);

  // Instant preview by updating user context (debounced to keep UI fluid)
  useEffect(() => {
    if (!user) return;

    const timeout_id = setTimeout(() => {
      setUser({
        ...user,
        space: {
          ...user.space,
          personalization: {
            ...user.space?.personalization,
            ...watched_values,
            icon: watched_values.icon instanceof File ? user.space?.personalization?.icon : watched_values.icon
          }
        } as any
      });
    }, 200); // 200ms debounce

    return () => clearTimeout(timeout_id);
  }, [watched_string, setUser]);

  return {
    form,
    user,
    space,
    is_premium,
    has_premium_selected
  };
}
