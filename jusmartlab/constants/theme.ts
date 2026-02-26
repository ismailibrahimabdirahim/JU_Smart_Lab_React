/**
 * JU Smart Lab – Jazeera University official branding (Requirements.md)
 * Primary: #0468ce (Light Blue) – Buttons & highlights
 * Secondary: #062056 (Dark Blue) – Headers & navbar
 * Tertiary: #0c8806 (Green) – Success / Fixed
 * Pending/Warning: Orange or Red accent
 * Background: White
 */

export const JUColors = {
  primary: '#0468ce',       // Light Blue – buttons, highlights
  secondary: '#062056',     // Dark Blue – headers, navbar
  tertiary: '#0c8806',      // Green – success, fixed
  pending: '#e67e22',      // Orange – pending
  warning: '#e74c3c',      // Red – warning
  background: '#ffffff',
  backgroundSoft: '#f0f6ff', // Soft blue tint for pages
  surface: '#f8f9fa',
  surfaceElevated: '#ffffff',
  text: '#062056',
  textMuted: '#5c6b7a',
  border: '#e2e8f0',
  borderLight: '#eef2f7',
  white: '#ffffff',
  primaryLight: '#0468ce18', // 10% opacity for backgrounds
  secondaryLight: '#0620560d',
  transparent: 'transparent',
} as const;

export const JUGradients = {
  primary: {
    // CSS Linear Gradient equivalent for Web: linear-gradient(135deg, #0468ce 0%, #062056 100%)
    colors: ['#0468ce', '#062056'],
  },
  surface: {
    // Soft gradient for cards
    colors: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)'],
  },
  mesh: {
    // Dynamic background mesh
    web: 'radial-gradient(at 0% 0%, rgba(4, 104, 206, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(6, 32, 86, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(12, 136, 6, 0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(4, 104, 206, 0.1) 0px, transparent 50%)',
  }
} as const;

export const JUGlass = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
  },
  navbar: {
    backgroundColor: 'rgba(6, 32, 86, 0.85)',
    backdropFilter: 'blur(16px)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: 'rgba(6, 32, 86, 0.15)',
  }
} as const;

export const JUSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const JURadius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const JUShadow = {
  sm: {
    shadowColor: '#062056',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#062056',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  lg: {
    shadowColor: '#062056',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 8,
  },
  glow: {
    shadowColor: '#0468ce',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  }
} as const;

export const JUFonts = {
  sans: 'system-ui',
  serif: 'serif',
  mono: 'monospace',
} as const;

// Legacy exports (JU brand for light mode)
export const Colors = {
  light: {
    text: JUColors.text,
    background: JUColors.background,
    tint: JUColors.primary,
    icon: JUColors.textMuted,
    tabIconDefault: JUColors.textMuted,
    tabIconSelected: JUColors.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: JUColors.primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: JUColors.primary,
  },
};

export const Fonts = JUFonts;
