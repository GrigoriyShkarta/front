/**
 * Extended palette definitions for the application theme.
 * Includes solid colors and gradients for maximum customization.
 */

// ============================================
// PRIMARY COLORS (Categorized for Premium)
// ============================================
export const PRIMARY_COLORS_CATEGORIES = {
  "Classic": {
    blue: "#2563eb",
    purple: "#7c3aed",
    yellow: "#eab308",
    orange: "#ed6b15",
    red: "#dc2626",
    green: "#16a34a",
    gray: "#6b7280",
  },
  "Vibrant": {
    azure: "#007fff",
    violet: "#8b5cf6",
    fuchsia: "#d946ef",
    pink: "#ec4899",
    crimson: "#dc143c",
    amber: "#f59e0b",
    lime: "#84cc16",
    mint: "#10b981",
    cyan: "#06b6d4",
  },
  "Elegant": {
    cobalt: "#0047ab",
    sapphire: "#0f52ba",
    royal: "#4169e1",
    amethyst: "#9966cc",
    magenta: "#ff00ff",
    ruby: "#e0115f",
    coral: "#ff7f50",
    gold: "#ffd700",
    indigo: "#4f46e5",
    sky: "#0284c7",
    emerald: "#059669",
    teal: "#0d9488",
    rose: "#e11d48",
    jade: "#00a86b",
    sage: "#bcbc8f",
  },
  "Deep": {
    navy: "#000080",
    midnight: "#191970",
    maroon: "#800000",
    burgundy: "#800020",
    forest: "#228b22",
    olive: "#808000",
    chocolate: "#d2691e",
    charcoal: "#36454f",
    slate: "#708090",
    zinc: "#3f3f46",
  },
  "Modern": {
    "neon-blue": "#00ffff",
    "electric-violet": "#8f00ff",
    "hot-pink": "#ff69b4",
    "sunset-orange": "#ff4500",
    "acid-green": "#ccff00",
    "malibu": "#5edfff",
    "lavender": "#e6e6fa",
    "mauve": "#e0b0ff",
    "periwinkle": "#ccccff",
    "steel": "#4682b4",
  }
} as const;

// Flattened for compatibility
export const PRIMARY_COLORS: Record<string, string> = Object.values(PRIMARY_COLORS_CATEGORIES).reduce((acc, cat) => ({ ...acc, ...cat }), {});

export type PrimaryColorId = string;

// ============================================
// PRIMARY GRADIENTS (Expanded)
// ============================================
export const PRIMARY_GRADIENTS = {
  // Sunset & Warm
  'sunset': { gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)", from: "#f97316", to: "#ec4899" },
  'sunrise': { gradient: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)", from: "#fbbf24", to: "#f97316" },
  'fire': { gradient: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)", from: "#dc2626", to: "#f97316" },
  'peach-sorbet': { gradient: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)", from: "#ff9a9e", to: "#fad0c4" },
  'warm-flame': { gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", from: "#ff9a9e", to: "#fecfef" },
  
  // Cool & Calm
  'ocean-blue': { gradient: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)", from: "#0284c7", to: "#06b6d4" },
  'arctic-ice': { gradient: "linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)", from: "#3b82f6", to: "#22d3ee" },
  'aqua-marine': { gradient: "linear-gradient(135deg, #209cff 0%, #68e0cf 100%)", from: "#209cff", to: "#68e0cf" },
  'deep-indigo': { gradient: "linear-gradient(135deg, #1e3a8a 0%, #4338ca 100%)", from: "#1e3a8a", to: "#4338ca" },
  
  // Luxury & Premium
  'purple-haze': { gradient: "linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%)", from: "#7028e4", to: "#e5b2ca" },
  'royal-purple': { gradient: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)", from: "#6a11cb", to: "#2575fc" },
  'plum-plate': { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", from: "#667eea", to: "#764ba2" },
  'premium-dark': { gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)", from: "#434343", to: "#000000" },
  
  // Nature
  'lush-green': { gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)", from: "#00b09b", to: "#96c93d" },
  'emerald-city': { gradient: "linear-gradient(135deg, #34e89e 0%, #0f3443 100%)", from: "#34e89e", to: "#0f3443" },
  'spring-warmth': { gradient: "linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)", from: "#a8ff78", to: "#78ffd6" },
  
  // Special
  'rainbow': { gradient: "linear-gradient(135deg, #f97316 0%, #eab308 25%, #16a34a 50%, #0284c7 75%, #8b5cf6 100%)", from: "#f97316", to: "#8b5cf6" },
  'cosmic-fusion': { gradient: "linear-gradient(135deg, #ff00cc 0%, #3333ff 100%)", from: "#ff00cc", to: "#3333ff" },
  'cyberpunk': { gradient: "linear-gradient(135deg, #f40076 0%, #342711 100%)", from: "#f40076", to: "#342711" },
  'neon-glow': { gradient: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)", from: "#00f2fe", to: "#4facfe" },
} as const;

export type PrimaryGradientId = keyof typeof PRIMARY_GRADIENTS;

// ============================================
// BACKGROUND LIGHT COLORS
// ============================================
export const BACKGROUND_LIGHT = {
  // Pure & Clean
  'white': "#ffffff",
  'snow': "#fffafa",
  'ivory': "#fffff0",
  
  // Grays
  'soft-gray': "#f5f5f5",
  'cool-gray': "#f1f5f9",
  'warm-gray': "#fafaf9",
  'pearl': "#f8fafc",
  
  // Tinted
  'ice-blue': "#f0f9ff",
  'mint-cream': "#f5fffb",
  'lavender-blush': "#fff0f5",
  'seashell': "#fff5ee",
  'antique-white': "#faebd7",
} as const;

export type BackgroundLightId = keyof typeof BACKGROUND_LIGHT;

// ============================================
// BACKGROUND LIGHT GRADIENTS (Premium)
// ============================================
export const BACKGROUND_LIGHT_GRADIENTS = {
  'light-mist': { gradient: "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)", from: "#e6e9f0", to: "#eef1f5" },
  'light-morning': { gradient: "linear-gradient(135deg, #fff5f5 0%, #fefcbf 100%)", from: "#fff5f5", to: "#fefcbf" },
  'light-sky': { gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", from: "#e0c3fc", to: "#8ec5fc" },
  'soft-gradient': { gradient: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)", from: "#fdfcfb", to: "#e2d1c3" },
  'cloudy-day': { gradient: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", from: "#f5f7fa", to: "#c3cfe2" },
  'white-glass': { gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)", from: "#ffffff", to: "#f1f5f9" },
  'pastel-dream': { gradient: "linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)", from: "#E3F2FD", to: "#F3E5F5" },
  'mint-fresh': { gradient: "linear-gradient(135deg, #f6fdfb 0%, #d9f2ef 100%)", from: "#f6fdfb", to: "#d9f2ef" },
  'cotton-candy': { gradient: "linear-gradient(135deg, #efecf8 0%, #f7e9f1 100%)", from: "#efecf8", to: "#f7e9f1" },
  'lemon-silk': { gradient: "linear-gradient(135deg, #fffcf0 0%, #fff3c7 100%)", from: "#fffcf0", to: "#fff3c7" },
  'rose-water': { gradient: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)", from: "#fff1f2", to: "#ffe4e6" },
} as const;

// ============================================
// BACKGROUND DARK COLORS
// ============================================
export const BACKGROUND_DARK = {
  'dark': "#0f0f0f",
  'deep-blue': "#020617",
  'deep-purple': "#0f0a1f",
  'deep-red': "#1f0a0a",
  'deep-green': "#0a1f0f",
  'graphite': "#111111",
  'carbon': "#0b0b0d",
  'midnight': "#121212",
  'pure-black': "#000000",
  'obsidian': "#050505",
  'zinc': "#18181b",
  'stone': "#1c1917",
  'neutral': "#171717",
} as const;

export type BackgroundDarkId = keyof typeof BACKGROUND_DARK;

// ============================================
// BACKGROUND DARK GRADIENTS (Premium)
// ============================================
export const BACKGROUND_DARK_GRADIENTS = {
  'dark-void': { gradient: "linear-gradient(135deg, #141e30 0%, #243b55 100%)", from: "#141e30", to: "#243b55" },
  'deep-space': { gradient: "linear-gradient(135deg, #000000 0%, #434343 100%)", from: "#000000", to: "#434343" },
  'night-gradient': { gradient: "linear-gradient(135deg, #232526 0%, #414345 100%)", from: "#232526", to: "#414345" },
  'dark-nebula': { gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", from: "#0f0c29", to: "#24243e" },
  'obsidian-glow': { gradient: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)", from: "#000000", to: "#1a1a1a" },
  'dark-velvet': { gradient: "linear-gradient(135deg, #0f0c29 0%, #000000 100%)", from: "#0f0c29", to: "#000000" },
  'midnight-blue': { gradient: "linear-gradient(135deg, #020617 0%, #0f172a 100%)", from: "#020617", to: "#0f172a" },
  'charcoal-mist': { gradient: "linear-gradient(135deg, #1c1c1c 0%, #383838 100%)", from: "#1c1c1c", to: "#383838" },
  'carbon-fiber': { gradient: "linear-gradient(135deg, #121212 0%, #000000 100%)", from: "#121212", to: "#000000" },
  'deep-forest': { gradient: "linear-gradient(135deg, #051610 0%, #000000 100%)", from: "#051610", to: "#000000" },
} as const;

// ============================================
// SECONDARY COLORS (Expanded & Organized)
// ============================================
export const SECONDARY_COLORS = {
  // Neutral Grays
  slate: "#64748b",
  gray: "#6b7280",
  zinc: "#71717a",
  neutral: "#737373",
  stone: "#78716c",
  cool: "#475569",
  mauve: "#9ca3af",
  
  // Blues
  "navy-muted": "#334155",
  "sky-gray": "#7dd3fc",
  "steel-blue": "#94a3b8",
  
  // Greens
  "sage-green": "#84a98c",
  "forest-muted": "#52796f",
  "mint-gray": "#86efac",
  
  // Purples & Pinks
  "lavender-gray": "#c4b5fd",
  "plum-muted": "#a78bfa",
  "rose-muted": "#fda4af",
  
  // Warm Tones
  "warm-brown": "#7c2d12",
  "terracotta": "#c2674c",
  "amber-muted": "#fbbf24",
  "peach-muted": "#fed7aa",
  
  // Earthy Tones
  "olive-gray": "#a1a17d",
  "sand": "#c5b4a0",
  "clay": "#b8a599",
} as const;

export type SecondaryColorId = keyof typeof SECONDARY_COLORS;

