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
 * Converts a HEX color string to an RGB string (r, g, b).
 */
function hexToRgb(hex: string): string {
  // Handle cases where the color might be a name or invalid
  if (!hex || typeof hex !== 'string') return '37, 99, 235';
  
  // Remove # if present
  const clean_hex = hex.replace(/^#/, '');

  // Parse 3 or 6 digit hex
  let r = 0, g = 0, b = 0;
  if (clean_hex.length === 3) {
    r = parseInt(clean_hex[0] + clean_hex[0], 16);
    g = parseInt(clean_hex[1] + clean_hex[1], 16);
    b = parseInt(clean_hex[2] + clean_hex[2], 16);
  } else if (clean_hex.length === 6) {
    r = parseInt(clean_hex.substring(0, 2), 16);
    g = parseInt(clean_hex.substring(2, 4), 16);
    b = parseInt(clean_hex.substring(4, 6), 16);
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return '37, 99, 235';
  }

  return `${r}, ${g}, ${b}`;
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
    root.style.setProperty('--space-primary-rgb', hexToRgb(from_color));
    root.style.setProperty('--space-primary-hover', to_color);
    root.style.setProperty('--space-primary-bg', primary_val);
    root.style.setProperty('--mantine-primary-color-filled', from_color);
  } else {
    root.style.setProperty('--space-primary', primary_val);
    root.style.setProperty('--space-primary-rgb', hexToRgb(primary_val));
    root.style.setProperty('--space-primary-hover', primary_val);
    root.style.setProperty('--space-primary-bg', primary_val);
    root.style.setProperty('--mantine-primary-color-filled', primary_val);
  }

  // --- Apply Secondary Color ---
  const secondary_val = config.secondary || '#64748b';
  root.style.setProperty('--space-secondary', secondary_val);
  root.style.setProperty('--space-secondary-rgb', hexToRgb(secondary_val));
  root.style.setProperty('--space-secondary-hover', secondary_val);

  // --- Apply Background Color/Gradient ---
  let bg_val = '#ffffff';
  
  if (is_dark) {
    bg_val = config.background_dark || '#0f0f0f';
  } else {
    bg_val = config.background || '#ffffff';
  }

  root.style.setProperty('--space-bg', bg_val);

  // --- Sync call room background with space bg ---
  // background-color doesn't support gradients, so extract the first solid color
  let call_bg_solid = bg_val;
  if (bg_val.includes('gradient')) {
    const colors = bg_val.match(/#[a-fA-F0-9]{3,6}/g);
    call_bg_solid = colors?.[0] || (is_dark ? '#0d0f14' : '#f0f2f5');
  }
  root.style.setProperty('--call-bg', call_bg_solid);

  // call-surface: derive a slightly contrasted surface from the solid bg
  // We parse the solid color hex and shift it to create a secondary surface
  const bg_rgb = hexToRgb(call_bg_solid); // "r, g, b"
  const [r, g, b] = bg_rgb.split(',').map((v) => parseInt(v.trim(), 10));
  let call_surface: string;
  if (is_dark) {
    // Lighten slightly for dark mode
    const shift = 20;
    call_surface = `rgb(${Math.min(255, r + shift)}, ${Math.min(255, g + shift)}, ${Math.min(255, b + shift)})`;
  } else {
    // Darken slightly for light mode
    const shift = 14;
    call_surface = `rgb(${Math.max(0, r - shift)}, ${Math.max(0, g - shift)}, ${Math.max(0, b - shift)})`;
  }
  root.style.setProperty('--call-surface', call_surface);
  root.style.setProperty(
    '--call-text',
    is_dark ? '#f1f5f9' : '#111827',
  );
  
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

  // --- Apply Sidebar & Global Primary Text Color ---
  const primary_text_color = config.is_white_sidebar_color ? '#ffffff' : '#000000';
  const sidebar_text_color_muted = config.is_white_sidebar_color ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  
  root.style.setProperty('--space-primary-text', primary_text_color);
  root.style.setProperty('--space-sidebar-text', primary_text_color);
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
