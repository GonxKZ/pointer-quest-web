/**
 * WCAG AA Contrast Checker for Pointer Quest Design System
 * Validates color contrast ratios for accessibility compliance
 */

import { themes, ThemeName } from '../design-system/themes';

// WCAG contrast ratio requirements
export const WCAG_STANDARDS = {
  AA_NORMAL: 4.5,   // Normal text (14pt+)
  AA_LARGE: 3,      // Large text (18pt+ or 14pt+ bold)
  AAA_NORMAL: 7,    // Enhanced normal text
  AAA_LARGE: 4.5    // Enhanced large text
} as const;

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle short hex format
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) {
    return null;
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1]!, 16),
    g: parseInt(result[2]!, 16),
    b: parseInt(result[3]!, 16)
  } : null;
}

/**
 * Get relative luminance of a color
 * Formula from WCAG 2.1
 */
function getRelativeLuminance(color: { r: number; g: number; b: number }): number {
  const { r, g, b } = color;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * (rs || 0) + 0.7152 * (gs || 0) + 0.0722 * (bs || 0);
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio from 1:1 to 21:1
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  // Handle CSS color values (extract hex from gradients, etc.)
  const extractHex = (colorStr: string): string => {
    const hexMatch = colorStr.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/);
    if (hexMatch) return hexMatch[0];
    
    // Common CSS colors
    const cssColors: Record<string, string> = {
      'white': '#ffffff',
      'black': '#000000',
      'red': '#ff0000',
      'green': '#008000',
      'blue': '#0000ff',
      'transparent': '#ffffff' // Default for transparent
    };
    
    return cssColors[colorStr.toLowerCase()] || '#ffffff';
  };
  
  const hex1 = extractHex(color1);
  const hex2 = extractHex(color2);
  
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) {
    console.warn('Invalid color format:', { color1, color2 });
    return 1; // Worst case scenario
  }
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function checkWCAGCompliance(ratio: number, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): {
  passes: boolean;
  required: number;
  actual: number;
  grade: 'Pass' | 'Fail';
} {
  let required: number;
  
  if (level === 'AAA') {
    required = size === 'large' ? WCAG_STANDARDS.AAA_LARGE : WCAG_STANDARDS.AAA_NORMAL;
  } else {
    required = size === 'large' ? WCAG_STANDARDS.AA_LARGE : WCAG_STANDARDS.AA_NORMAL;
  }
  
  const passes = ratio >= required;
  
  return {
    passes,
    required,
    actual: Math.round(ratio * 100) / 100,
    grade: passes ? 'Pass' : 'Fail'
  };
}

/**
 * Test color combinations for a theme
 */
export interface ContrastTest {
  name: string;
  foreground: string;
  background: string;
  context: string;
  size: 'normal' | 'large';
  ratio: number;
  compliance: ReturnType<typeof checkWCAGCompliance>;
}

export function testThemeContrast(themeName: ThemeName): ContrastTest[] {
  const theme = themes[themeName];
  const tests: ContrastTest[] = [];
  
  // Primary text on backgrounds
  tests.push({
    name: 'Primary Text on Primary Background',
    foreground: theme.colors.text.primary,
    background: theme.colors.background.primary,
    context: 'Main content text',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  tests.push({
    name: 'Primary Text on Surface',
    foreground: theme.colors.text.primary,
    background: theme.colors.background.surface || '#ffffff',
    context: 'Cards and panels',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  tests.push({
    name: 'Secondary Text on Primary Background',
    foreground: theme.colors.text.secondary,
    background: theme.colors.background.primary,
    context: 'Secondary information',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  // Interactive elements
  tests.push({
    name: 'Primary Button Text',
    foreground: theme.colors.text.inverse || '#ffffff',
    background: theme.colors.primary[500],
    context: 'Primary buttons',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  tests.push({
    name: 'Link Color on Background',
    foreground: theme.colors.text.accent,
    background: theme.colors.background.primary,
    context: 'Links and accents',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  // Status colors
  tests.push({
    name: 'Success Text',
    foreground: theme.colors.success,
    background: theme.colors.background.primary,
    context: 'Success messages',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  tests.push({
    name: 'Error Text',
    foreground: theme.colors.error,
    background: theme.colors.background.primary,
    context: 'Error messages',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  tests.push({
    name: 'Warning Text',
    foreground: theme.colors.warning,
    background: theme.colors.background.primary,
    context: 'Warning messages',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  // Memory visualization colors
  tests.push({
    name: 'Stack Memory Color',
    foreground: theme.colors.memory.stack,
    background: theme.colors.background.primary,
    context: 'Stack memory indicators',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  tests.push({
    name: 'Heap Memory Color',
    foreground: theme.colors.memory.heap,
    background: theme.colors.background.primary,
    context: 'Heap memory indicators',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  tests.push({
    name: 'Pointer Color',
    foreground: theme.colors.memory.pointer,
    background: theme.colors.background.primary,
    context: 'Pointer visualizations',
    size: 'normal',
    ratio: 0,
    compliance: { passes: false, required: 0, actual: 0, grade: 'Fail' }
  });
  
  // Calculate actual ratios and compliance
  return tests.map(test => {
    const ratio = calculateContrastRatio(test.foreground, test.background);
    const compliance = checkWCAGCompliance(ratio, 'AA', test.size);
    
    return {
      ...test,
      ratio,
      compliance
    };
  });
}

/**
 * Generate comprehensive contrast report for all themes
 */
export function generateContrastReport(): Record<ThemeName, ContrastTest[]> {
  const report: Record<ThemeName, ContrastTest[]> = {} as Record<ThemeName, ContrastTest[]>;
  
  (Object.keys(themes) as ThemeName[]).forEach(themeName => {
    report[themeName] = testThemeContrast(themeName);
  });
  
  return report;
}

/**
 * Get summary statistics for theme contrast compliance
 */
export function getContrastSummary(tests: ContrastTest[]): {
  total: number;
  passing: number;
  failing: number;
  passRate: number;
  criticalFailures: ContrastTest[];
} {
  const total = tests.length;
  const passing = tests.filter(test => test.compliance.passes).length;
  const failing = total - passing;
  const passRate = Math.round((passing / total) * 100);
  
  // Critical failures are those with very low contrast ratios
  const criticalFailures = tests.filter(test => 
    !test.compliance.passes && test.ratio < 2
  );
  
  return {
    total,
    passing,
    failing,
    passRate,
    criticalFailures
  };
}

/**
 * Generate contrast report for console logging
 */
export function logContrastReport(): void {
  console.group('🎨 WCAG Contrast Compliance Report');
  
  const report = generateContrastReport();
  
  Object.entries(report).forEach(([themeName, tests]) => {
    const summary = getContrastSummary(tests);
    
    console.group(`${themeName.toUpperCase()} Theme - ${summary.passRate}% compliant`);
    
    console.log(`✅ Passing: ${summary.passing}/${summary.total}`);
    console.log(`❌ Failing: ${summary.failing}/${summary.total}`);
    
    if (summary.criticalFailures.length > 0) {
      console.warn('🚨 Critical failures (ratio < 2):');
      summary.criticalFailures.forEach(test => {
        console.warn(`  - ${test.name}: ${test.ratio.toFixed(2)}:1`);
      });
    }
    
    // Show failing tests
    const failingTests = tests.filter(test => !test.compliance.passes);
    if (failingTests.length > 0) {
      console.group('❌ Failing Tests');
      failingTests.forEach(test => {
        console.log(`${test.name}: ${test.ratio.toFixed(2)}:1 (needs ${test.compliance.required}:1)`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
}

/**
 * React hook for contrast validation during development
 */
export function useContrastValidation(enabled: boolean = process.env.NODE_ENV === 'development') {
  if (enabled && typeof window !== 'undefined') {
    // Run validation after a delay to allow themes to load
    setTimeout(() => {
      logContrastReport();
    }, 1000);
  }
}

export default {
  calculateContrastRatio,
  checkWCAGCompliance,
  testThemeContrast,
  generateContrastReport,
  getContrastSummary,
  logContrastReport,
  useContrastValidation
};