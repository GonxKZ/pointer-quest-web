/**
 * Styled Components Theme Type Declaration
 * Extends DefaultTheme to include our custom theme structure
 */

import 'styled-components';

// Forward declare theme structure to avoid circular imports
interface ThemeColors {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: Record<string, string>;
  memory: Record<string, string>;
  gray: Record<string, string>;
  background: Record<string, string>;
  text: Record<string, string>;
  topics: Record<string, any>;
  memoryVisualization: Record<string, string>;
}

interface ThemeTypography {
  fontFamily: Record<string, string>;
  fontWeight: Record<string, number>;
  fontSize: Record<string, string>;
  lineHeight: Record<string, number>;
  letterSpacing: Record<string, string>;
}

interface ThemeSpacing extends Record<string, string> {
  borderRadius: string;
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    borderRadius: Record<string, string>;
    shadows: Record<string, string>;
    animation: Record<string, any>;
    breakpoints: Record<string, string>;
    zIndex: Record<string, any>;
    layout: Record<string, string>;
  }
}