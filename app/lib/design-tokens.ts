// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
// Comprehensive design system with light/dark theme support for Chief of Staff
// ADHD-friendly, Things 3-inspired, WCAG AA compliant

// ──────────────────────────────────────────────────────────────────────────
// THEME DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────

const lightTheme = {
  // Backgrounds
  bg: {
    primary: '#F5F4F0',           // Main canvas
    secondary: '#ECEAE3',         // Sidebar/panels
    elevated: '#FFFFFF',          // Cards/modals
    overlay: 'rgba(0,0,0,0.4)',   // Backdrop
  },

  // Text
  text: {
    primary: '#1C1B18',           // Headlines, body
    secondary: '#8A8680',         // Subtext
    tertiary: '#B5B1AB',          // Muted/disabled
    inverse: '#FFFFFF',           // Text on dark bg
  },

  // Borders
  border: {
    default: '#E2DED7',
    light: '#EEEBE6',
    focus: '#FFD60A',             // Yellow accent
  },

  // Brand/Accent
  accent: {
    primary: '#FFD60A',           // Yellow
    primaryHover: '#F5C700',
    primaryActive: '#E6B800',
    primaryDim: '#FFF3B0',
    primaryText: '#7A5E00',
  },

  // Semantic Colors
  semantic: {
    success: '#34C759',
    successBg: '#E8F8ED',
    error: '#FF3B30',
    errorBg: '#FFE5E5',
    warning: '#FF9500',
    warningBg: '#FFF0D9',
    info: '#007AFF',
    infoBg: '#E5F1FF',
  },

  // Area Colors (contextual)
  area: {
    oaia: { dot: '#34C759', bg: '#E8F8ED' },
    swell: { dot: '#007AFF', bg: '#E5F1FF' },
    partio: { dot: '#FF9500', bg: '#FFF0D9' },
    personal: { dot: '#AF52DE', bg: '#F3EAFF' },
    work: { dot: '#5AC8FA', bg: '#E0F7FF' },
  },

  // Shadows
  shadow: {
    sm: '0 1px 3px rgba(0,0,0,0.06)',
    md: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
    lg: '0 2px 8px rgba(0,0,0,0.10), 0 6px 24px rgba(0,0,0,0.06)',
    xl: '0 4px 16px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)',
    focus: '0 0 0 3px rgba(255,214,10,0.35)',
  },
};

const darkTheme = {
  // Backgrounds - warm dark, not pure black
  bg: {
    primary: '#1A1816',           // Main canvas (warm charcoal)
    secondary: '#24221F',         // Sidebar/panels (lighter)
    elevated: '#2D2A27',          // Cards/modals (elevated)
    overlay: 'rgba(0,0,0,0.7)',   // Backdrop
  },

  // Text - softer whites for reduced eye strain
  text: {
    primary: '#EEEBE6',           // Headlines, body
    secondary: '#B5B1AB',         // Subtext
    tertiary: '#8A8680',          // Muted/disabled
    inverse: '#1C1B18',           // Text on light bg
  },

  // Borders - subtle in dark mode
  border: {
    default: '#3A3732',
    light: '#2F2D29',
    focus: '#FFD60A',
  },

  // Brand/Accent - slightly muted for dark
  accent: {
    primary: '#F5C700',           // Slightly muted yellow
    primaryHover: '#FFD60A',
    primaryActive: '#E6B800',
    primaryDim: 'rgba(245,199,0,0.15)',
    primaryText: '#1C1B18',       // Dark text on yellow
  },

  // Semantic Colors - adapted for dark
  semantic: {
    success: '#30D158',
    successBg: 'rgba(48,209,88,0.15)',
    error: '#FF453A',
    errorBg: 'rgba(255,69,58,0.15)',
    warning: '#FF9F0A',
    warningBg: 'rgba(255,159,10,0.15)',
    info: '#0A84FF',
    infoBg: 'rgba(10,132,255,0.15)',
  },

  // Area Colors - adjusted for dark
  area: {
    oaia: { dot: '#30D158', bg: 'rgba(48,209,88,0.15)' },
    swell: { dot: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
    partio: { dot: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
    personal: { dot: '#BF5AF2', bg: 'rgba(191,90,242,0.15)' },
    work: { dot: '#64D2FF', bg: 'rgba(100,210,255,0.15)' },
  },

  // Shadows - lighter in dark mode
  shadow: {
    sm: '0 1px 3px rgba(0,0,0,0.3)',
    md: '0 1px 4px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
    lg: '0 2px 8px rgba(0,0,0,0.5), 0 6px 24px rgba(0,0,0,0.4)',
    xl: '0 4px 16px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.5)',
    focus: '0 0 0 3px rgba(245,199,0,0.35)',
  },
};

// ──────────────────────────────────────────────────────────────────────────
// THEME-INDEPENDENT TOKENS
// ──────────────────────────────────────────────────────────────────────────

export const typography = {
  font: {
    sans: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Geist Mono', 'SF Mono', 'Consolas', monospace",
    display: "'Nunito', 'Geist Sans', sans-serif",
  },

  // Type scale (modular scale 1.25)
  size: {
    xs: '11px',     // Micro labels, timestamps
    sm: '13px',     // Secondary text, captions
    base: '15px',   // Body text
    lg: '18px',     // Section headers
    xl: '20px',     // Card titles
    '2xl': '24px',  // Page titles
    '3xl': '32px',  // Display headings
  },

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },

  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.025em',
    wider: '0.08em',
  },
};

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
};

export const radius = {
  none: '0',
  sm: '6px',      // Small elements
  md: '8px',      // Inputs, buttons
  lg: '11px',     // Cards, containers
  xl: '16px',     // Modals, large containers
  pill: '100px',  // Pills, badges
  full: '9999px', // Circular elements
};

export const animation = {
  duration: {
    instant: '100ms',
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
  },

  easing: {
    linear: 'linear',
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

// ──────────────────────────────────────────────────────────────────────────
// THEME EXPORT
// ──────────────────────────────────────────────────────────────────────────

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = typeof lightTheme;
export type ThemeName = keyof typeof themes;

/**
 * Get theme tokens by name
 * Defaults to light theme for server-side rendering
 */
export function getTheme(themeName: ThemeName = 'light'): Theme {
  return themes[themeName];
}

// ──────────────────────────────────────────────────────────────────────────
// LEGACY COMPATIBILITY (T object)
// Remove once all components are migrated to CSS variables
// ──────────────────────────────────────────────────────────────────────────

export const T = {
  // Backgrounds
  sidebarBg: lightTheme.bg.secondary,
  mainBg: lightTheme.bg.primary,
  cardBg: lightTheme.bg.elevated,

  // Text
  text: lightTheme.text.primary,
  textSub: lightTheme.text.secondary,
  textMuted: lightTheme.text.tertiary,

  // Borders
  border: lightTheme.border.default,
  borderLight: lightTheme.border.light,

  // Accent
  yellow: lightTheme.accent.primary,
  yellowDim: lightTheme.accent.primaryDim,
  yellowText: lightTheme.accent.primaryText,

  // Layout
  radius: radius.lg,
  radiusSm: radius.md,
  radiusPill: radius.pill,

  // Shadows
  shadow: lightTheme.shadow.md,
  shadowHover: lightTheme.shadow.lg,
};

// Chat-specific tokens (legacy)
export const CHAT_TOKENS = {
  userBubbleBg: T.yellowDim,
  userBubbleText: T.yellowText,
  assistantBubbleBg: T.cardBg,
  assistantBubbleText: T.text,
  streamingDotColor: T.textMuted,
};

// ──────────────────────────────────────────────────────────────────────────
// CSS VARIABLE GENERATION
// ──────────────────────────────────────────────────────────────────────────

/**
 * Generate CSS variables for a theme
 * Used in globals.css
 */
export function generateCSSVariables(theme: Theme): Record<string, string> {
  return {
    // Backgrounds
    '--color-bg-primary': theme.bg.primary,
    '--color-bg-secondary': theme.bg.secondary,
    '--color-bg-elevated': theme.bg.elevated,
    '--color-bg-overlay': theme.bg.overlay,

    // Text
    '--color-text-primary': theme.text.primary,
    '--color-text-secondary': theme.text.secondary,
    '--color-text-tertiary': theme.text.tertiary,
    '--color-text-inverse': theme.text.inverse,

    // Borders
    '--color-border-default': theme.border.default,
    '--color-border-light': theme.border.light,
    '--color-border-focus': theme.border.focus,

    // Accent
    '--color-accent-primary': theme.accent.primary,
    '--color-accent-hover': theme.accent.primaryHover,
    '--color-accent-active': theme.accent.primaryActive,
    '--color-accent-dim': theme.accent.primaryDim,
    '--color-accent-text': theme.accent.primaryText,

    // Semantic
    '--color-success': theme.semantic.success,
    '--color-success-bg': theme.semantic.successBg,
    '--color-error': theme.semantic.error,
    '--color-error-bg': theme.semantic.errorBg,
    '--color-warning': theme.semantic.warning,
    '--color-warning-bg': theme.semantic.warningBg,
    '--color-info': theme.semantic.info,
    '--color-info-bg': theme.semantic.infoBg,

    // Shadows
    '--shadow-sm': theme.shadow.sm,
    '--shadow-md': theme.shadow.md,
    '--shadow-lg': theme.shadow.lg,
    '--shadow-xl': theme.shadow.xl,
    '--shadow-focus': theme.shadow.focus,
  };
}
