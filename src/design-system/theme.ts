/**
 * Pointer Quest Design System - Theme Configuration
 * 
 * Unified theme configuration for consistent styling across all lesson components.
 * This file defines colors, typography, spacing, and other design tokens.
 */

export const theme = {
  // Color Palette - Educational C++ Theme
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#E6F7FF',
      100: '#BAE7FF', 
      200: '#91D5FF',
      300: '#69C0FF',
      400: '#40A9FF',
      500: '#00D4FF', // Main brand color
      600: '#0099CC',
      700: '#006B99',
      800: '#003D66',
      900: '#001F33'
    },

    // Secondary Educational Colors
    secondary: {
      50: '#E6FFF2',
      100: '#B3FFD9',
      200: '#80FFBF',
      300: '#4DFFA6',
      400: '#1AFF8C',
      500: '#4ECDC4', // Accent teal
      600: '#00CC66',
      700: '#009944',
      800: '#006622',
      900: '#003311'
    },

    // Status Colors
    success: '#00FF88',
    warning: '#FFCA28',
    error: '#FF6B6B',
    info: '#00D4FF',

    // Border Colors
    border: {
      primary: 'rgba(255, 255, 255, 0.2)',
      secondary: 'rgba(255, 255, 255, 0.1)',
      focus: '#00D4FF',
      error: '#FF6B6B',
      success: '#00FF88',
      warning: '#FFCA28'
    },

    // Memory Colors (alias for memoryVisualization for backward compatibility)
    memory: {
      stack: '#00FF88',
      heap: '#FF6B6B',
      global: '#FFA500',
      pointer: '#00D4FF',
      reference: '#4ECDC4',
      null: '#757575',
      danger: '#FF4444',
      modified: '#FFCA28'
    },

    // Neutral Colors
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    },

    // Background Colors
    background: {
      primary: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      secondary: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9))',
      tertiary: 'rgba(0, 212, 255, 0.05)',
      surface: 'rgba(255, 255, 255, 0.02)',
      glass: 'rgba(255, 255, 255, 0.1)',
      dark: 'rgba(0, 0, 0, 0.8)',
      code: 'rgba(0, 0, 0, 0.7)',
      elevated: 'rgba(255, 255, 255, 0.08)'
    },

    // Text Colors
    text: {
      primary: '#FFFFFF',
      secondary: '#B8C5D6',
      tertiary: '#9E9E9E',
      accent: '#00D4FF',
      code: '#F8F8F2',
      muted: 'rgba(255, 255, 255, 0.7)',
      inverse: '#FFFFFF'
    },

    // Educational Topic Colors (120 lessons across 6 categories)
    topics: {
      // Basic Pointers (Lessons 1-20) - Blue family
      basic: {
        primary: '#00d4ff',
        secondary: '#0099CC',
        light: '#BAE7FF',
        dark: '#006B99',
        accent: '#40A9FF'
      },
      
      // Smart Pointers (Lessons 21-40) - Gold/Orange family
      smart: {
        primary: '#FFA000',
        secondary: '#FF8F00',
        light: '#FFCC02',
        dark: '#FF6F00',
        accent: '#FFB300'
      },
      
      // Memory Management (Lessons 41-60) - Red/Orange family
      memory: {
        primary: '#FF6B6B',
        secondary: '#F44336',
        light: '#FF9999',
        dark: '#D32F2F',
        accent: '#FF5252'
      },
      
      // Advanced/UB (Lessons 61-80) - Deep Red family for dangerous concepts
      advanced: {
        primary: '#E53E3E',
        secondary: '#C53030',
        light: '#FC8181',
        dark: '#9B2C2C',
        accent: '#F56565',
        warning: '#FF4444',
        danger: '#CC0000'
      },
      
      // Atomic/Threading (Lessons 81-100) - Purple family for concurrency
      atomic: {
        primary: '#9F7AEA',
        secondary: '#805AD5',
        light: '#B794F6',
        dark: '#553C9A',
        accent: '#A78BFA',
        sync: '#7C3AED',
        async: '#8B5CF6'
      },
      
      // Performance/Optimization (Lessons 101-120) - Green family for efficiency
      performance: {
        primary: '#48BB78',
        secondary: '#38A169',
        light: '#68D391',
        dark: '#2F855A',
        accent: '#4FD1C7',
        fast: '#10B981',
        slow: '#F59E0B'
      }
    },

    // Memory Visualization Colors
    memoryVisualization: {
      stack: '#00FF88',
      heap: '#FF6B6B',
      global: '#FFA500',
      pointer: '#00D4FF',
      reference: '#4ECDC4',
      null: '#757575',
      danger: '#FF4444',
      modified: '#FFCA28'
    }
  },

  // Typography Scale
  typography: {
    // Font Families
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      code: '"Fira Code", "Consolas", "Monaco", "Courier New", monospace',
      display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    // Font Weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },

    // Font Sizes (rem)
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem'  // 60px
    },

    // Line Heights
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },

    // Letter Spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },

  // Spacing Scale (rem)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem',    // 256px
    // Default border radius for quick access
    borderRadius: '0.5rem'
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 20px rgba(0, 212, 255, 0.4)',
    glowLarge: '0 0 30px rgba(0, 212, 255, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms'
    },
    
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },

  // Breakpoints for Responsive Design
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },

  // Layout Constants
  layout: {
    maxWidth: '1400px',
    containerPadding: '2rem',
    lessonGridColumns: '1fr 1fr',
    lessonGridGap: '1rem',
    sidebarWidth: '400px'
  }
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeTypography = typeof theme.typography;

// Educational topic types
export type LessonTopic = 'basic' | 'smart' | 'memory' | 'advanced' | 'atomic' | 'performance';
export type LessonDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

// Helper functions for common theme usage
export const getThemeColor = (path: string) => {
  const keys = path.split('.');
  let value: any = theme.colors;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value || '';
};

export const getThemeSpacing = (size: keyof typeof theme.spacing) => {
  return theme.spacing[size];
};

export const getThemeFontSize = (size: keyof typeof theme.typography.fontSize) => {
  return theme.typography.fontSize[size];
};

// Educational helper functions
export const getLessonTopic = (lessonNumber: number): LessonTopic => {
  if (lessonNumber <= 20) return 'basic';
  if (lessonNumber <= 40) return 'smart';
  if (lessonNumber <= 60) return 'memory';
  if (lessonNumber <= 80) return 'advanced';
  if (lessonNumber <= 100) return 'atomic';
  return 'performance';
};

export const getTopicColors = (topic: LessonTopic) => {
  return theme.colors.topics[topic];
};

export const getLessonColors = (lessonNumber: number) => {
  const topic = getLessonTopic(lessonNumber);
  return getTopicColors(topic);
};

export const getDifficultyColor = (difficulty: LessonDifficulty): string => {
  switch (difficulty) {
    case 'Beginner':
      return theme.colors.success;
    case 'Intermediate':
      return theme.colors.warning;
    case 'Advanced':
      return theme.colors.error;
    case 'Expert':
      return theme.colors.topics.atomic.primary;
    default:
      return theme.colors.primary[500];
  }
};

export const getTopicName = (topic: LessonTopic): string => {
  const topicNames = {
    basic: 'Basic Pointers',
    smart: 'Smart Pointers',
    memory: 'Memory Management',
    advanced: 'Advanced/UB',
    atomic: 'Atomic/Threading',
    performance: 'Performance'
  };
  return topicNames[topic];
};

// Media query helpers
export const mediaQuery = {
  up: (breakpoint: keyof typeof theme.breakpoints) => 
    `@media (min-width: ${theme.breakpoints[breakpoint]})`,
  
  down: (breakpoint: keyof typeof theme.breakpoints) => 
    `@media (max-width: ${theme.breakpoints[breakpoint]})`,
  
  between: (min: keyof typeof theme.breakpoints, max: keyof typeof theme.breakpoints) => 
    `@media (min-width: ${theme.breakpoints[min]}) and (max-width: ${theme.breakpoints[max]})`
};

// Animation keyframes that can be reused
export const keyframes = {
  glow: `
    0%, 100% { text-shadow: 0 0 10px currentColor; }
    50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  `,
  
  shimmer: `
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  `,
  
  pulse: `
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  `,
  
  slideInFromLeft: `
    0% { transform: translateX(-100%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  `,
  
  slideInFromRight: `
    0% { transform: translateX(100%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  `,
  
  fadeIn: `
    0% { opacity: 0; }
    100% { opacity: 1; }
  `,
  
  scaleIn: `
    0% { transform: scale(0.9); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  `
};