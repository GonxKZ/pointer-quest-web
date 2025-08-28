/**
 * Pointer Quest Design System - Theme System with Dark/Light Mode Support
 * 
 * Extended theme system that supports multiple color modes while maintaining
 * the educational branding and accessibility standards.
 */

import { theme as baseTheme } from './theme';

// Theme mode types
export type ThemeMode = 'dark' | 'light' | 'auto';

// Dark theme configuration (current default)
const darkTheme = {
  ...baseTheme,
  mode: 'dark' as const,
  colors: {
    ...baseTheme.colors,
    
    // Dark mode backgrounds
    background: {
      primary: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      secondary: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9))',
      tertiary: 'rgba(0, 212, 255, 0.05)',
      surface: 'rgba(255, 255, 255, 0.05)',
      elevated: 'rgba(255, 255, 255, 0.1)',
      glass: 'rgba(255, 255, 255, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.8)',
      code: 'rgba(0, 0, 0, 0.7)',
      input: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.12)',
      hover: 'rgba(255, 255, 255, 0.08)',
      active: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.04)'
    },

    // Dark mode text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#B8C5D6',
      tertiary: '#9E9E9E',
      accent: '#00D4FF',
      code: '#F8F8F2',
      muted: 'rgba(255, 255, 255, 0.7)',
      inverse: '#0f0f23',
      disabled: 'rgba(255, 255, 255, 0.5)',
      placeholder: 'rgba(255, 255, 255, 0.6)'
    },

    // Dark mode border colors
    border: {
      primary: 'rgba(255, 255, 255, 0.12)',
      secondary: 'rgba(255, 255, 255, 0.08)',
      focus: '#00D4FF',
      error: '#FF6B6B',
      success: '#00FF88',
      warning: '#FFCA28'
    }
  }
};

// Light theme configuration
const lightTheme = {
  ...baseTheme,
  mode: 'light' as const,
  colors: {
    ...baseTheme.colors,
    
    // Light mode backgrounds  
    background: {
      primary: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      secondary: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(226, 232, 240, 0.9))',
      tertiary: 'rgba(0, 212, 255, 0.08)',
      surface: '#ffffff',
      elevated: '#ffffff',
      glass: 'rgba(255, 255, 255, 0.8)',
      overlay: 'rgba(0, 0, 0, 0.4)',
      code: 'rgba(248, 250, 252, 0.9)',
      input: '#ffffff',
      border: 'rgba(0, 0, 0, 0.12)',
      hover: 'rgba(0, 0, 0, 0.04)',
      active: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.04)'
    },

    // Light mode text colors
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
      tertiary: '#718096',
      accent: '#0099CC',
      code: '#2d3748',
      muted: 'rgba(26, 32, 44, 0.7)',
      inverse: '#ffffff',
      disabled: 'rgba(26, 32, 44, 0.5)',
      placeholder: 'rgba(26, 32, 44, 0.6)'
    },

    // Light mode border colors
    border: {
      primary: 'rgba(0, 0, 0, 0.12)',
      secondary: 'rgba(0, 0, 0, 0.08)',
      focus: '#0099CC',
      error: '#e53e3e',
      success: '#38a169',
      warning: '#d69e2e'
    },

    // Adjust status colors for light mode
    status: {
      success: '#38a169',
      warning: '#d69e2e', 
      error: '#e53e3e',
      info: '#0099CC',
    }
  }
};

// High contrast theme for accessibility
const highContrastTheme = {
  ...darkTheme,
  mode: 'high-contrast' as const,
  colors: {
    ...darkTheme.colors,
    
    background: {
      ...darkTheme.colors.background,
      primary: '#000000',
      secondary: '#1a1a1a',
      surface: '#000000',
      elevated: '#1a1a1a'
    },

    text: {
      ...darkTheme.colors.text,
      primary: '#ffffff',
      secondary: '#ffffff',
      tertiary: '#cccccc'
    },

    border: {
      ...darkTheme.colors.border,
      primary: '#ffffff',
      secondary: '#cccccc'
    }
  }
};

// Theme definitions
export const themes = {
  dark: darkTheme,
  light: lightTheme,
  'high-contrast': highContrastTheme
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes[ThemeName];

// Default theme
export const defaultTheme = themes.dark;

// Theme utilities
export const getTheme = (mode: ThemeName = 'dark'): Theme => {
  return themes[mode] || defaultTheme;
};

// Semantic color helpers that work across themes
export const getSemanticColor = (theme: Theme, semantic: 'success' | 'warning' | 'error' | 'info') => {
  return theme.colors.status?.[semantic] || theme.colors[semantic];
};

// Responsive theme helpers
export const getResponsiveTheme = (theme: Theme, breakpoint: keyof Theme['breakpoints']) => {
  return {
    ...theme,
    currentBreakpoint: breakpoint
  };
};

// CSS custom properties generator for theme switching
export const generateCSSCustomProperties = (theme: Theme): Record<string, string> => {
  const cssVars: Record<string, string> = {};
  
  // Generate CSS variables for colors
  const generateColorVars = (colors: any, prefix = '') => {
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        generateColorVars(value, `${prefix}${key}-`);
      } else {
        cssVars[`--pq-${prefix}${key}`] = value as string;
      }
    });
  };
  
  generateColorVars(theme.colors);
  
  // Generate CSS variables for spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars[`--pq-spacing-${key}`] = value;
  });
  
  // Generate CSS variables for typography
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    cssVars[`--pq-font-size-${key}`] = value;
  });
  
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    cssVars[`--pq-font-weight-${key}`] = value.toString();
  });
  
  // Generate CSS variables for shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    cssVars[`--pq-shadow-${key}`] = value;
  });
  
  return cssVars;
};

// Media query helpers for theme detection
export const mediaQueries = {
  prefersDarkMode: '(prefers-color-scheme: dark)',
  prefersLightMode: '(prefers-color-scheme: light)',
  prefersHighContrast: '(prefers-contrast: high)',
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  prefersReducedTransparency: '(prefers-reduced-transparency: reduce)'
};

// Theme-aware component helpers
export const getThemeAwareStyles = (theme: Theme) => ({
  // Card styles that work in both themes
  card: {
    background: theme.colors.background.surface,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md
  },
  
  // Button styles that work in both themes
  button: {
    primary: {
      background: `linear-gradient(45deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]})`,
      color: theme.colors.text.inverse,
      border: 'none',
      '&:hover': {
        background: `linear-gradient(45deg, ${theme.colors.primary[600]}, ${theme.colors.secondary[600]})`
      }
    },
    secondary: {
      background: theme.colors.background.surface,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.primary}`,
      '&:hover': {
        background: theme.colors.background.hover
      }
    }
  },
  
  // Input styles that work in both themes
  input: {
    background: theme.colors.background.input,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.border.secondary}`,
    borderRadius: theme.borderRadius.base,
    '&:focus': {
      borderColor: theme.colors.border.focus,
      boxShadow: `0 0 0 2px ${theme.colors.primary[500]}20`
    },
    '&::placeholder': {
      color: theme.colors.text.placeholder
    }
  }
});

// Animation preferences based on system settings
export const getAnimationPreferences = () => ({
  respectsReducedMotion: window.matchMedia(mediaQueries.prefersReducedMotion).matches,
  duration: window.matchMedia(mediaQueries.prefersReducedMotion).matches ? '0ms' : '300ms'
});

// Accessibility helpers
export const getAccessibilityColors = (theme: Theme) => ({
  focus: theme.colors.border.focus,
  focusRing: `0 0 0 2px ${theme.colors.primary[500]}40`,
  highContrast: theme.mode === 'high-contrast'
});

export default themes;