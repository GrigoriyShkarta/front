import { 
  PRIMARY_COLORS, 
  PRIMARY_GRADIENTS,
  SECONDARY_COLORS,
  BACKGROUND_LIGHT, 
  BACKGROUND_LIGHT_GRADIENTS,
  BACKGROUND_DARK, 
  BACKGROUND_DARK_GRADIENTS,
  PrimaryColorId, 
  SecondaryColorId,
  BackgroundLightId, 
  BackgroundDarkId 
} from './colors';
import { SPACE_FONTS } from '@/lib/constants';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primary: string; // Dynamic ID, can be solid or gradient
  secondary?: string;
  background?: string;
  background_dark?: string;
  select_mode?: boolean;
  is_white_sidebar_color?: boolean;
  font_family?: string;
}

/**
 * Applies the theme configuration to the document root using CSS variables.
 * Updated to handle HEX and full Gradient strings directly.
 */
export function applyTheme(config: ThemeConfig) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const is_dark = config.mode === 'dark';

  // Apply mode
  root.classList.toggle('dark', is_dark);
  root.setAttribute('data-mantine-color-scheme', config.mode);

  // --- Apply Primary Color/Gradient ---
  const primary_val = config.primary || '#2563eb';
  const is_primary_gradient = primary_val.includes('gradient');
  
  root.style.setProperty('--space-primary-is-gradient', is_primary_gradient ? '1' : '0');

  if (is_primary_gradient) {
    // Extract colors for fallbacks
    const colors = primary_val.match(/#[a-fA-F0-9]{3,6}/g);
    const from_color = colors?.[0] || '#2563eb';
    const to_color = colors?.[1] || from_color;

    root.style.setProperty('--space-primary', from_color);
    root.style.setProperty('--space-primary-hover', to_color);
    root.style.setProperty('--space-primary-bg', primary_val);
    root.style.setProperty('--mantine-primary-color-filled', from_color);
  } else {
    root.style.setProperty('--space-primary', primary_val);
    root.style.setProperty('--space-primary-hover', primary_val);
    root.style.setProperty('--space-primary-bg', primary_val);
    root.style.setProperty('--mantine-primary-color-filled', primary_val);
  }

  // --- Apply Secondary Color ---
  const secondary_val = config.secondary || '#64748b';
  root.style.setProperty('--space-secondary', secondary_val);
  root.style.setProperty('--space-secondary-hover', secondary_val);

  // --- Apply Background Color/Gradient ---
  let bg_val = '#ffffff';
  
  if (is_dark) {
    bg_val = config.background_dark || '#0f0f0f';
  } else {
    bg_val = config.background || '#ffffff';
  }

  root.style.setProperty('--space-bg', bg_val);
  
  // --- Apply Global Styles for Inputs & Cards ---
  const glass_bg = is_dark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.35)';
  root.style.setProperty('--space-input-bg', glass_bg);
  root.style.setProperty('--space-card-bg', is_dark ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 0.6)');
  
  // Sync with Mantine's variables
  // We use a solid color for mantine-color-body so drawers/modals aren't transparent,
  // even if the main page background has a gradient.
  let mantine_body_bg = bg_val;
  if (bg_val.includes('gradient')) {
    const colors = bg_val.match(/#[a-fA-F0-9]{3,6}/g);
    mantine_body_bg = colors?.[0] || (is_dark ? '#1a1b1e' : '#ffffff');
  }
  
  root.style.setProperty('--mantine-color-body', mantine_body_bg);

  // --- Apply Sidebar Text Color ---
  const sidebar_text_color = config.is_white_sidebar_color ? '#ffffff' : '#000000';
  const sidebar_text_color_muted = config.is_white_sidebar_color ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  root.style.setProperty('--space-sidebar-text', sidebar_text_color);
  root.style.setProperty('--space-sidebar-text-muted', sidebar_text_color_muted);

  // --- Apply Font Family ---
  const font_id = config.font_family || 'inter';
  const font_option = SPACE_FONTS.find(f => f.id === font_id);

  if (font_option) {
    // Dynamically load the Google Font
    const link_id = `google-font-${font_option.google_font.replace(/\+/g, '-').toLowerCase()}`;
    if (!document.getElementById(link_id)) {
      const link = document.createElement('link');
      link.id = link_id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font_option.google_font}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }

    const font_value = `'${font_option.label}', sans-serif`;
    root.style.setProperty('--space-font-family', font_value);
    document.body.style.fontFamily = font_value;
  }
}
