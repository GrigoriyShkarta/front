import { 
  PRIMARY_COLORS as PALETTE_PRIMARY,
  PRIMARY_COLORS_CATEGORIES as PALETTE_CATEGORIES, 
  BACKGROUND_LIGHT as PALETTE_LIGHT, 
  BACKGROUND_DARK as PALETTE_DARK,
  SECONDARY_COLORS as PALETTE_SECONDARY,
  PRIMARY_GRADIENTS as PALETTE_PRIMARY_GRADIENTS,
  BACKGROUND_LIGHT_GRADIENTS as PALETTE_LIGHT_GRADIENTS,
  BACKGROUND_DARK_GRADIENTS as PALETTE_DARK_GRADIENTS,
} from './theme/colors';

// Type definitions for color options
export interface SolidColorOption {
  id: string;
  hex: string;
  type: 'solid';
  category?: string;
  is_premium?: boolean;
}

export interface GradientOption {
  id: string;
  gradient: string;
  from: string;
  to: string;
  type: 'gradient';
  is_premium?: boolean;
}

export type ColorOption = SolidColorOption | GradientOption;

// Solid background colors
export const BACKGROUND_LIGHT: SolidColorOption[] = Object.keys(PALETTE_LIGHT).map((id, index) => ({
  id: PALETTE_LIGHT[id as keyof typeof PALETTE_LIGHT],
  hex: PALETTE_LIGHT[id as keyof typeof PALETTE_LIGHT],
  type: 'solid' as const,
  is_premium: index >= 1 // Only the first color (white) is free
}));

export const BACKGROUND_DARK: SolidColorOption[] = Object.keys(PALETTE_DARK).map((id, index) => ({
  id: PALETTE_DARK[id as keyof typeof PALETTE_DARK],
  hex: PALETTE_DARK[id as keyof typeof PALETTE_DARK],
  type: 'solid' as const,
  is_premium: index >= 1 // Only the first color is free
}));

// Background gradients (Premium Only)
export const BACKGROUND_LIGHT_GRADIENTS: GradientOption[] = Object.keys(PALETTE_LIGHT_GRADIENTS).map(id => ({
  id: PALETTE_LIGHT_GRADIENTS[id as keyof typeof PALETTE_LIGHT_GRADIENTS].gradient,
  gradient: PALETTE_LIGHT_GRADIENTS[id as keyof typeof PALETTE_LIGHT_GRADIENTS].gradient,
  from: PALETTE_LIGHT_GRADIENTS[id as keyof typeof PALETTE_LIGHT_GRADIENTS].from,
  to: PALETTE_LIGHT_GRADIENTS[id as keyof typeof PALETTE_LIGHT_GRADIENTS].to,
  type: 'gradient' as const,
  is_premium: true
}));

export const BACKGROUND_DARK_GRADIENTS: GradientOption[] = Object.keys(PALETTE_DARK_GRADIENTS).map(id => ({
  id: PALETTE_DARK_GRADIENTS[id as keyof typeof PALETTE_DARK_GRADIENTS].gradient,
  gradient: PALETTE_DARK_GRADIENTS[id as keyof typeof PALETTE_DARK_GRADIENTS].gradient,
  from: PALETTE_DARK_GRADIENTS[id as keyof typeof PALETTE_DARK_GRADIENTS].from,
  to: PALETTE_DARK_GRADIENTS[id as keyof typeof PALETTE_DARK_GRADIENTS].to,
  type: 'gradient' as const,
  is_premium: true
}));

// Secondary colors
export const SECONDARY_COLORS: SolidColorOption[] = Object.keys(PALETTE_SECONDARY).map((id, index) => ({
  id: PALETTE_SECONDARY[id as keyof typeof PALETTE_SECONDARY],
  hex: PALETTE_SECONDARY[id as keyof typeof PALETTE_SECONDARY],
  type: 'solid' as const,
  is_premium: index >= 4 // First 4 are basic
}));

// Primary solid colors (Categorized for Premium)
export const PRIMARY_COLORS_CATEGORIZED: SolidColorOption[] = Object.entries(PALETTE_CATEGORIES).flatMap(([category, colors]) => 
  Object.entries(colors).map(([name, hex]) => ({
    id: hex,
    hex,
    type: 'solid' as const,
    category,
    is_premium: category !== 'Classic'
  }))
);

// Primary gradients (Premium Only)
export const PRIMARY_GRADIENTS: GradientOption[] = Object.keys(PALETTE_PRIMARY_GRADIENTS).map(id => ({
  id: PALETTE_PRIMARY_GRADIENTS[id as keyof typeof PALETTE_PRIMARY_GRADIENTS].gradient,
  gradient: PALETTE_PRIMARY_GRADIENTS[id as keyof typeof PALETTE_PRIMARY_GRADIENTS].gradient,
  from: PALETTE_PRIMARY_GRADIENTS[id as keyof typeof PALETTE_PRIMARY_GRADIENTS].from,
  to: PALETTE_PRIMARY_GRADIENTS[id as keyof typeof PALETTE_PRIMARY_GRADIENTS].to,
  type: 'gradient' as const,
  is_premium: true
}));

// ============================================
// BASIC TOOLS (For non-premium users)
// ============================================
export const BASIC_PRIMARY_COLORS: SolidColorOption[] = PRIMARY_COLORS_CATEGORIZED.filter(c => c.category === 'Classic');
export const BASIC_SECONDARY_COLORS: SolidColorOption[] = SECONDARY_COLORS.slice(0, 4);
export const BASIC_BACKGROUND_LIGHT: SolidColorOption[] = BACKGROUND_LIGHT.slice(0, 1);
export const BASIC_BACKGROUND_DARK: SolidColorOption[] = BACKGROUND_DARK.slice(0, 1);

// ============================================
// LANGUAGES
// ============================================
export const SUPPORTED_LANGUAGES = [
  { id: 'en', label: 'English', dir: 'ltr' },
  { id: 'es', label: 'Español', dir: 'ltr' },
  { id: 'pt', label: 'Português', dir: 'ltr' },
  { id: 'fr', label: 'Français', dir: 'ltr' },
  { id: 'de', label: 'Deutsch', dir: 'ltr' },
  { id: 'it', label: 'Italiano', dir: 'ltr' },
  { id: 'pl', label: 'Polski', dir: 'ltr' },
  { id: 'uk', label: 'Українська', dir: 'ltr' },
  { id: 'ko', label: '한국어', dir: 'ltr' },
  { id: 'ja', label: '日本語', dir: 'ltr' },
  { id: 'zh', label: '中文', dir: 'ltr' },
  { id: 'tr', label: 'Türkçe', dir: 'ltr' },
  { id: 'ar', label: 'العربية', dir: 'rtl' },
  { id: 'hi', label: 'हिन्दी', dir: 'ltr' },
  { id: 'th', label: 'ไทย', dir: 'ltr' },
  { id: 'zh-CN', label: '简体中文', dir: 'ltr' },
  { id: 'zh-TW', label: '繁體中文', dir: 'ltr' }
] as const;

export type Locale = typeof SUPPORTED_LANGUAGES[number]['id'];
export const LANGUAGES: Locale[] = SUPPORTED_LANGUAGES.map(l => l.id as Locale);
export const DEFAULT_LANGUAGE: Locale = 'uk';

// ============================================
// FONTS (Premium feature)
// ============================================
export interface FontOption {
  id: string;
  label: string;
  google_font: string;
  is_premium: boolean;
}

export const SPACE_FONTS: FontOption[] = [
  { id: 'inter', label: 'Inter', google_font: 'Inter', is_premium: false },
  { id: 'roboto', label: 'Roboto', google_font: 'Roboto', is_premium: true },
  { id: 'open-sans', label: 'Open Sans', google_font: 'Open+Sans', is_premium: true },
  { id: 'lato', label: 'Lato', google_font: 'Lato', is_premium: true },
  { id: 'montserrat', label: 'Montserrat', google_font: 'Montserrat', is_premium: true },
  { id: 'poppins', label: 'Poppins', google_font: 'Poppins', is_premium: true },
  { id: 'nunito', label: 'Nunito', google_font: 'Nunito', is_premium: true },
  { id: 'raleway', label: 'Raleway', google_font: 'Raleway', is_premium: true },
  { id: 'source-sans-3', label: 'Source Sans 3', google_font: 'Source+Sans+3', is_premium: true },
  { id: 'dm-sans', label: 'DM Sans', google_font: 'DM+Sans', is_premium: true },
  { id: 'work-sans', label: 'Work Sans', google_font: 'Work+Sans', is_premium: true },
  { id: 'outfit', label: 'Outfit', google_font: 'Outfit', is_premium: true },
] as const;

export const DEFAULT_FONT = 'inter';

export const BASIC_FONTS: FontOption[] = SPACE_FONTS.filter(f => !f.is_premium);
