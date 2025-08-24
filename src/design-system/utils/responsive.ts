/**
 * Pointer Quest Design System - Responsive Design Utilities
 * 
 * Utility functions and hooks for responsive design, mobile-first approach,
 * and adaptive layouts for educational content.
 */

import { useState, useEffect } from 'react';
import { css } from 'styled-components';
import { theme } from '../theme';

// Breakpoint values from theme
export const breakpoints = theme.breakpoints;

// Media query utilities
export const media = {
  // Mobile first approach - min-width queries
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // Max-width queries for specific targeting
  maxXs: `@media (max-width: ${parseInt(breakpoints.sm) - 1}px)`,
  maxSm: `@media (max-width: ${parseInt(breakpoints.md) - 1}px)`,
  maxMd: `@media (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  maxLg: `@media (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  maxXl: `@media (max-width: ${parseInt(breakpoints['2xl']) - 1}px)`,
  
  // Between breakpoints
  smToMd: `@media (min-width: ${breakpoints.sm}) and (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  mdToLg: `@media (min-width: ${breakpoints.md}) and (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  lgToXl: `@media (min-width: ${breakpoints.lg}) and (max-width: ${parseInt(breakpoints['2xl']) - 1}px)`,
  
  // Orientation queries
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  
  // Device-specific queries
  mobile: '@media (max-width: 767px)',
  tablet: '@media (min-width: 768px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',
  
  // Preference-based queries
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  highContrast: '@media (prefers-contrast: high)',
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)'
};

// Responsive value generator
export function responsive<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}) {
  return css`
    ${values.xs && css`
      ${media.xs} {
        ${values.xs}
      }
    `}
    ${values.sm && css`
      ${media.sm} {
        ${values.sm}
      }
    `}
    ${values.md && css`
      ${media.md} {
        ${values.md}
      }
    `}
    ${values.lg && css`
      ${media.lg} {
        ${values.lg}
      }
    `}
    ${values.xl && css`
      ${media.xl} {
        ${values.xl}
      }
    `}
    ${values['2xl'] && css`
      ${media['2xl']} {
        ${values['2xl']}
      }
    `}
  `;
}

// Container utilities
export const containerStyles = css`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${theme.spacing[4]};
  padding-right: ${theme.spacing[4]};
  
  ${media.sm} {
    max-width: 640px;
    padding-left: ${theme.spacing[6]};
    padding-right: ${theme.spacing[6]};
  }
  
  ${media.md} {
    max-width: 768px;
  }
  
  ${media.lg} {
    max-width: 1024px;
    padding-left: ${theme.spacing[8]};
    padding-right: ${theme.spacing[8]};
  }
  
  ${media.xl} {
    max-width: 1280px;
  }
  
  ${media['2xl']} {
    max-width: 1536px;
  }
`;

// Grid utilities
export const gridResponsive = (columns: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}) => css`
  display: grid;
  gap: ${theme.spacing[4]};
  
  ${columns.xs && css`
    grid-template-columns: repeat(${columns.xs}, 1fr);
  `}
  
  ${columns.sm && css`
    ${media.sm} {
      grid-template-columns: repeat(${columns.sm}, 1fr);
    }
  `}
  
  ${columns.md && css`
    ${media.md} {
      grid-template-columns: repeat(${columns.md}, 1fr);
    }
  `}
  
  ${columns.lg && css`
    ${media.lg} {
      grid-template-columns: repeat(${columns.lg}, 1fr);
    }
  `}
  
  ${columns.xl && css`
    ${media.xl} {
      grid-template-columns: repeat(${columns.xl}, 1fr);
    }
  `}
  
  ${columns['2xl'] && css`
    ${media['2xl']} {
      grid-template-columns: repeat(${columns['2xl']}, 1fr);
    }
  `}
`;

// Flex utilities
export const flexResponsive = (direction: {
  xs?: 'row' | 'column';
  sm?: 'row' | 'column';
  md?: 'row' | 'column';
  lg?: 'row' | 'column';
  xl?: 'row' | 'column';
  '2xl'?: 'row' | 'column';
}) => css`
  display: flex;
  
  ${direction.xs && css`
    flex-direction: ${direction.xs};
  `}
  
  ${direction.sm && css`
    ${media.sm} {
      flex-direction: ${direction.sm};
    }
  `}
  
  ${direction.md && css`
    ${media.md} {
      flex-direction: ${direction.md};
    }
  `}
  
  ${direction.lg && css`
    ${media.lg} {
      flex-direction: ${direction.lg};
    }
  `}
  
  ${direction.xl && css`
    ${media.xl} {
      flex-direction: ${direction.xl};
    }
  `}
  
  ${direction['2xl'] && css`
    ${media['2xl']} {
      flex-direction: ${direction['2xl']};
    }
  `}
`;

// Hook for detecting screen size
export type BreakpointKey = keyof typeof breakpoints;
export type ScreenSize = BreakpointKey | 'mobile' | 'tablet' | 'desktop';

export function useScreenSize(): {
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
} {
  const [screenInfo, setScreenInfo] = useState<{
    screenSize: ScreenSize;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    width: number;
    height: number;
  }>({
    screenSize: 'lg',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let screenSize: ScreenSize = 'xs';
      let isMobile = false;
      let isTablet = false;
      let isDesktop = false;
      
      if (width >= parseInt(breakpoints['2xl'])) {
        screenSize = '2xl';
        isDesktop = true;
      } else if (width >= parseInt(breakpoints.xl)) {
        screenSize = 'xl';
        isDesktop = true;
      } else if (width >= parseInt(breakpoints.lg)) {
        screenSize = 'lg';
        isDesktop = true;
      } else if (width >= parseInt(breakpoints.md)) {
        screenSize = 'md';
        isTablet = true;
      } else if (width >= parseInt(breakpoints.sm)) {
        screenSize = 'sm';
        isMobile = true;
      } else {
        screenSize = 'xs';
        isMobile = true;
      }
      
      // Alternative categorization
      if (width < 768) {
        isMobile = true;
        isTablet = false;
        isDesktop = false;
      } else if (width < 1024) {
        isMobile = false;
        isTablet = true;
        isDesktop = false;
      } else {
        isMobile = false;
        isTablet = false;
        isDesktop = true;
      }
      
      setScreenInfo({
        screenSize,
        isMobile,
        isTablet,
        isDesktop,
        width,
        height
      });
    };

    // Initial check
    updateScreenSize();

    // Listen for resize events
    window.addEventListener('resize', updateScreenSize);
    
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  return screenInfo;
}

// Hook for responsive values
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  mobile?: T;
  tablet?: T;
  desktop?: T;
}): T | undefined {
  const { screenSize, isMobile, isTablet, isDesktop } = useScreenSize();
  
  // Priority order: specific size > device category > fallback
  if (values[screenSize as BreakpointKey] !== undefined) {
    return values[screenSize as BreakpointKey];
  }
  
  if (isMobile && values.mobile !== undefined) {
    return values.mobile;
  }
  
  if (isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  
  if (isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }
  
  // Fallback to closest available value
  const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(screenSize as BreakpointKey);
  
  // Look for values in descending order from current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (bp && values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}

// Educational content specific responsive utilities
export const lessonLayoutResponsive = css`
  /* Two-panel layout */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[4]};
  
  /* Tablet: Stack vertically */
  ${media.maxMd} {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[3]};
  }
  
  /* Mobile: Reduce padding and gap */
  ${media.mobile} {
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[2]};
  }
`;

export const threePanelLayoutResponsive = css`
  /* Three-panel layout */
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]};
  
  /* Large tablet: 2x2 grid */
  ${media.maxLg} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr 1fr;
    
    > *:first-child {
      grid-column: 1 / -1;
    }
  }
  
  /* Mobile: Single column */
  ${media.mobile} {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, auto);
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[2]};
    
    > * {
      grid-column: 1;
    }
  }
`;

// Interactive component responsive utilities
export const interactiveControlsResponsive = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[3]};
  
  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[2]};
  }
`;

export const codePlaygroundResponsive = css`
  min-height: 200px;
  
  ${media.mobile} {
    min-height: 150px;
    font-size: ${theme.typography.fontSize.xs};
  }
  
  ${media.tablet} {
    min-height: 180px;
    font-size: ${theme.typography.fontSize.sm};
  }
`;

// Typography responsive utilities
export const responsiveTypography = {
  heading1: css`
    font-size: ${theme.typography.fontSize['3xl']};
    line-height: ${theme.typography.lineHeight.tight};
    
    ${media.sm} {
      font-size: ${theme.typography.fontSize['4xl']};
    }
    
    ${media.lg} {
      font-size: ${theme.typography.fontSize['5xl']};
    }
  `,
  
  heading2: css`
    font-size: ${theme.typography.fontSize['2xl']};
    line-height: ${theme.typography.lineHeight.tight};
    
    ${media.sm} {
      font-size: ${theme.typography.fontSize['3xl']};
    }
    
    ${media.lg} {
      font-size: ${theme.typography.fontSize['4xl']};
    }
  `,
  
  heading3: css`
    font-size: ${theme.typography.fontSize.xl};
    line-height: ${theme.typography.lineHeight.snug};
    
    ${media.sm} {
      font-size: ${theme.typography.fontSize['2xl']};
    }
    
    ${media.lg} {
      font-size: ${theme.typography.fontSize['3xl']};
    }
  `,
  
  body: css`
    font-size: ${theme.typography.fontSize.sm};
    line-height: ${theme.typography.lineHeight.relaxed};
    
    ${media.sm} {
      font-size: ${theme.typography.fontSize.base};
    }
  `,
  
  code: css`
    font-size: ${theme.typography.fontSize.xs};
    
    ${media.sm} {
      font-size: ${theme.typography.fontSize.sm};
    }
  `
};

// Spacing responsive utilities
export const responsiveSpacing = {
  section: css`
    margin-bottom: ${theme.spacing[4]};
    
    ${media.sm} {
      margin-bottom: ${theme.spacing[6]};
    }
    
    ${media.lg} {
      margin-bottom: ${theme.spacing[8]};
    }
  `,
  
  padding: css`
    padding: ${theme.spacing[3]};
    
    ${media.sm} {
      padding: ${theme.spacing[4]};
    }
    
    ${media.lg} {
      padding: ${theme.spacing[6]};
    }
  `
};

// Animation preferences
export const respectMotionPreferences = css`
  ${media.reducedMotion} {
    animation: none !important;
    transition: none !important;
  }
`;

export default {
  media,
  responsive,
  containerStyles,
  gridResponsive,
  flexResponsive,
  useScreenSize,
  useResponsiveValue,
  lessonLayoutResponsive,
  threePanelLayoutResponsive,
  interactiveControlsResponsive,
  codePlaygroundResponsive,
  responsiveTypography,
  responsiveSpacing,
  respectMotionPreferences
};