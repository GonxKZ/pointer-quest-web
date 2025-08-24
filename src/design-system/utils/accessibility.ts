/**
 * Pointer Quest Design System - Accessibility Utilities
 * 
 * WCAG 2.1 AA compliant accessibility utilities for educational content.
 * Ensures the application is usable by all learners regardless of abilities.
 */

import { theme } from '../theme';

// WCAG 2.1 AA Compliance Constants
export const WCAG_AA_STANDARDS = {
  MIN_CONTRAST_NORMAL: 4.5, // For normal text (under 24px or under 19px bold)
  MIN_CONTRAST_LARGE: 3.0,  // For large text (24px+ or 19px+ bold)
  MIN_TOUCH_TARGET: 44,     // Minimum touch target size in pixels
  FOCUS_INDICATOR_MIN: 2,   // Minimum focus indicator thickness
  ANIMATION_DURATION_MAX: 5000, // Maximum auto-playing animation duration
} as const;

// Color contrast calculation utilities
export const calculateContrast = (foreground: string, background: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Convert to linear RGB
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);
    
    // Calculate luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

// Validate color contrast for accessibility
export const isContrastCompliant = (
  foreground: string, 
  background: string, 
  isLargeText: boolean = false
): { compliant: boolean; ratio: number; standard: number } => {
  const ratio = calculateContrast(foreground, background);
  const standard = isLargeText ? WCAG_AA_STANDARDS.MIN_CONTRAST_LARGE : WCAG_AA_STANDARDS.MIN_CONTRAST_NORMAL;
  
  return {
    compliant: ratio >= standard,
    ratio: Math.round(ratio * 100) / 100,
    standard
  };
};

// Screen reader utilities
export const screenReaderOnly = `
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

export const focusVisible = `
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]} !important;
    outline-offset: 2px !important;
    border-radius: ${theme.borderRadius.sm} !important;
  }
  
  &:focus:not(:focus-visible) {
    outline: none !important;
  }
`;

// High contrast mode detection
export const highContrastStyles = `
  @media (prefers-contrast: high) {
    border: 2px solid !important;
    background: CanvasText !important;
    color: Canvas !important;
  }
`;

// Reduced motion preferences
export const respectsReducedMotion = (animation: string): string => `
  @media (prefers-reduced-motion: no-preference) {
    ${animation}
  }
  
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
  }
`;

// Skip link utilities
export const skipLinkStyles = `
  position: absolute;
  top: -40px;
  left: 6px;
  background: ${theme.colors.primary[500]};
  color: ${theme.colors.text.primary};
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: ${theme.zIndex.skipLink};
  
  &:focus {
    top: 6px;
  }
`;

// Aria label generators for educational content
export const generateAriaLabel = {
  lesson: (lessonNumber: number, title: string, difficulty: string): string =>
    `Lesson ${lessonNumber}: ${title}. Difficulty level: ${difficulty}`,
    
  codeBlock: (language: string, lineCount: number): string =>
    `Code example in ${language.toUpperCase()}, ${lineCount} lines`,
    
  visualization: (type: string, interactive: boolean): string =>
    `${type} visualization${interactive ? ', interactive' : ''}`,
    
  progress: (current: number, total: number, percentage: number): string =>
    `Progress: ${current} of ${total} completed, ${percentage} percent`,
    
  memoryState: (variable: string, value: string, address?: string): string =>
    `Variable ${variable} has value ${value}${address ? ` at memory address ${address}` : ''}`,
    
  button: (action: string, context?: string): string =>
    `${action}${context ? ` ${context}` : ''}`,
    
  warningLevel: (severity: 'low' | 'medium' | 'high' | 'extreme'): string => {
    const descriptions = {
      low: 'Low severity warning',
      medium: 'Medium severity warning, exercise caution',
      high: 'High severity warning, dangerous operation',
      extreme: 'Extreme danger, undefined behavior possible'
    };
    return descriptions[severity];
  }
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Standard key codes
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  } as const,
  
  // Trap focus within a container
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement && lastElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement && firstElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => container.removeEventListener('keydown', handleTabKey);
  }
};

// Announcement utilities for screen readers
export class AccessibilityAnnouncer {
  private static instance: AccessibilityAnnouncer;
  private liveRegion: HTMLElement;
  
  private constructor() {
    this.liveRegion = this.createLiveRegion();
  }
  
  static getInstance(): AccessibilityAnnouncer {
    if (!AccessibilityAnnouncer.instance) {
      AccessibilityAnnouncer.instance = new AccessibilityAnnouncer();
    }
    return AccessibilityAnnouncer.instance;
  }
  
  private createLiveRegion(): HTMLElement {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = screenReaderOnly;
    liveRegion.id = 'accessibility-announcer';
    document.body.appendChild(liveRegion);
    return liveRegion;
  }
  
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.liveRegion.setAttribute('aria-live', priority);
    
    // Clear previous message
    this.liveRegion.textContent = '';
    
    // Add new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      this.liveRegion.textContent = message;
    }, 100);
  }
  
  announceInteraction(action: string, result: string): void {
    this.announce(`${action}. ${result}`, 'polite');
  }
  
  announceError(error: string): void {
    this.announce(`Error: ${error}`, 'assertive');
  }
  
  announceSuccess(success: string): void {
    this.announce(`Success: ${success}`, 'polite');
  }
}

// Color theme utilities for accessibility
export const accessibilityColorPalette = {
  // High contrast alternatives
  highContrast: {
    text: '#FFFFFF',
    background: '#000000',
    primary: '#00FF00',
    secondary: '#FFFF00',
    error: '#FF0000',
    warning: '#FFA500',
    success: '#00FF00',
    info: '#00FFFF'
  },
  
  // Color blind friendly palette (using colorbrewer2.org recommendations)
  colorBlindFriendly: {
    primary: '#1f77b4',    // Blue
    secondary: '#ff7f0e',  // Orange  
    success: '#2ca02c',    // Green
    warning: '#d62728',    // Red
    info: '#9467bd',       // Purple
    neutral: '#7f7f7f'     // Gray
  }
} as const;

// Validate accessibility of educational content
export const validateAccessibility = {
  codeBlock: (element: HTMLElement): string[] => {
    const issues: string[] = [];
    
    // Check for proper heading structure
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('Code block should have a descriptive heading');
    }
    
    // Check for language identification
    const codeElements = element.querySelectorAll('code, pre');
    codeElements.forEach((code, index) => {
      if (!code.getAttribute('lang') && !code.className.includes('language-')) {
        issues.push(`Code block ${index + 1} should specify programming language`);
      }
    });
    
    return issues;
  },
  
  interactive: (element: HTMLElement): string[] => {
    const issues: string[] = [];
    
    // Check interactive elements have proper labels
    const buttons = element.querySelectorAll('button');
    buttons.forEach((button, index) => {
      if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
        issues.push(`Button ${index + 1} needs text content or aria-label`);
      }
    });
    
    // Check focus indicators
    const focusableElements = element.querySelectorAll('button, input, select, textarea, a[href]');
    focusableElements.forEach((el, index) => {
      const styles = getComputedStyle(el);
      if (styles.outline === 'none' && !styles.boxShadow.includes('outline')) {
        issues.push(`Focusable element ${index + 1} needs visible focus indicator`);
      }
    });
    
    return issues;
  }
};

// Educational content accessibility enhancements
export const educationalA11y = {
  // Generate comprehensive alt text for visualizations
  generateVisualizationAltText: (type: string, state: any): string => {
    switch (type) {
      case 'memory':
        return `Memory visualization showing ${Object.keys(state).length} variables. ${
          Object.entries(state).map(([name, value]) => 
            `Variable ${name} contains ${value}`
          ).join('. ')
        }`;
      
      case 'pointer':
        return `Pointer diagram illustrating relationships between variables and memory addresses`;
      
      default:
        return `Interactive ${type} visualization`;
    }
  },
  
  // Create step-by-step instructions for complex interactions
  generateStepInstructions: (steps: string[]): string => {
    const stepsText = steps.map((step, index) => 
      `Step ${index + 1}: ${step}`
    ).join('. ');
    
    return `This interaction has ${steps.length} steps. ${stepsText}`;
  }
};

export default {
  calculateContrast,
  isContrastCompliant,
  screenReaderOnly,
  focusVisible,
  respectsReducedMotion,
  generateAriaLabel,
  keyboardNavigation,
  AccessibilityAnnouncer,
  validateAccessibility,
  educationalA11y
};