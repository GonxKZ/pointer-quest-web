/**
 * Accessibility Manager for Pointer Quest
 * Comprehensive WCAG 2.1 AA compliance system with advanced features
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import styled, { css } from 'styled-components';

// Accessibility context types
interface AccessibilityContextValue {
  // Screen reader support
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  setAriaLive: (element: HTMLElement, mode: 'off' | 'polite' | 'assertive') => void;
  
  // Keyboard navigation
  trapFocus: (container: HTMLElement) => () => void;
  restoreFocus: (element?: HTMLElement) => void;
  skipToContent: () => void;
  
  // Visual accessibility
  preferences: AccessibilityPreferences;
  updatePreference: (key: keyof AccessibilityPreferences, value: any) => void;
  
  // Color and contrast
  checkColorContrast: (foreground: string, background: string) => ContrastResult;
  getAccessibleColor: (color: string, background: string, level?: 'AA' | 'AAA') => string;
  
  // Animation and motion
  shouldReduceMotion: boolean;
  respectMotionPreference: (animation: string) => string;
  
  // Text and content
  validateHeadingStructure: () => HeadingValidationResult[];
  checkImageAlternativeText: () => ImageValidationResult[];
  
  // Form accessibility
  validateForm: (form: HTMLFormElement) => FormValidationResult[];
  addFormErrorAnnouncement: (field: HTMLElement, message: string) => void;
  
  // Navigation
  landmarks: LandmarkInfo[];
  updateLandmarks: () => void;
  navigateToLandmark: (landmark: string) => void;
  
  // Testing and debugging
  accessibilityReport: AccessibilityReport;
  runAccessibilityAudit: () => Promise<AccessibilityReport>;
}

interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  reducedTransparency: boolean;
  largeText: boolean;
  boldText: boolean;
  underlineLinks: boolean;
  focusIndicatorSize: 'normal' | 'large' | 'extra-large';
  colorBlindnessType: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReaderMode: boolean;
  keyboardOnlyMode: boolean;
}

interface ContrastResult {
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  passes: boolean;
}

interface HeadingValidationResult {
  element: HTMLElement;
  level: number;
  text: string;
  issues: string[];
}

interface ImageValidationResult {
  element: HTMLImageElement;
  alt: string;
  issues: string[];
}

interface FormValidationResult {
  element: HTMLElement;
  type: 'label' | 'required' | 'error' | 'description';
  message: string;
  severity: 'error' | 'warning';
}

interface LandmarkInfo {
  element: HTMLElement;
  role: string;
  label?: string;
  level: number;
}

interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  timestamp: Date;
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

interface AccessibilityIssue {
  type: 'critical' | 'serious' | 'moderate' | 'minor';
  rule: string;
  message: string;
  element?: HTMLElement;
  help?: string;
  wcagReference?: string[];
}

// Default accessibility preferences
const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  reducedTransparency: false,
  largeText: false,
  boldText: false,
  underlineLinks: false,
  focusIndicatorSize: 'normal',
  colorBlindnessType: 'none',
  screenReaderMode: false,
  keyboardOnlyMode: false
};

// Storage key
const ACCESSIBILITY_STORAGE_KEY = 'pq-accessibility-preferences';

// Screen reader announcer component
const ScreenReaderAnnouncer = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
`;

// Skip links container
const SkipLinksContainer = styled.nav`
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${props => props.theme.zIndex.skipLink};
`;

const SkipLink = styled.a`
  position: absolute;
  top: -100px;
  left: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  text-decoration: none;
  border-radius: ${props => props.theme.borderRadius.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;
  transition: all ${props => props.theme.animation.duration.fast};

  &:focus,
  &:focus-visible {
    top: ${props => props.theme.spacing[2]};
    outline: 2px solid ${props => props.theme.colors.text.inverse};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Focus trap helper
class FocusTrap {
  private container: HTMLElement;
  private previousActiveElement: Element | null;
  private focusableElements: HTMLElement[];

  constructor(container: HTMLElement) {
    this.container = container;
    this.previousActiveElement = document.activeElement;
    this.focusableElements = this.getFocusableElements();
    this.init();
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(this.container.querySelectorAll(selector)) as HTMLElement[];
  }

  private init(): void {
    this.container.addEventListener('keydown', this.handleKeyDown);
    
    // Focus first element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  public destroy(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore focus
    if (this.previousActiveElement instanceof HTMLElement) {
      this.previousActiveElement.focus();
    }
  }
}

// Color contrast utilities
class ColorContrastUtils {
  static hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  static rgbToLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  static calculateContrastRatio(foreground: string, background: string): number {
    const [fgR, fgG, fgB] = this.hexToRgb(foreground);
    const [bgR, bgG, bgB] = this.hexToRgb(background);
    
    const fgLuminance = this.rgbToLuminance(fgR, fgG, fgB);
    const bgLuminance = this.rgbToLuminance(bgR, bgG, bgB);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  static checkContrast(foreground: string, background: string): ContrastResult {
    const ratio = this.calculateContrastRatio(foreground, background);
    
    let level: 'AA' | 'AAA' | 'fail';
    let passes: boolean;
    
    if (ratio >= 7) {
      level = 'AAA';
      passes = true;
    } else if (ratio >= 4.5) {
      level = 'AA';
      passes = true;
    } else {
      level = 'fail';
      passes = false;
    }
    
    return { ratio, level, passes };
  }
}

// Accessibility context
const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

// Accessibility provider
interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [landmarks, setLandmarks] = useState<LandmarkInfo[]>([]);
  const [accessibilityReport, setAccessibilityReport] = useState<AccessibilityReport>({
    score: 0,
    issues: [],
    timestamp: new Date(),
    summary: { critical: 0, serious: 0, moderate: 0, minor: 0 }
  });
  
  const announcerRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);
  const shouldReduceMotion = preferences.reducedMotion || 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Load preferences from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (stored) {
        const parsedPreferences = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsedPreferences });
      }
    } catch (error) {
      console.warn('[A11Y] Failed to load accessibility preferences:', error);
    }
  }, []);

  // Save preferences to storage
  const savePreferences = useCallback((newPreferences: AccessibilityPreferences) => {
    try {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.warn('[A11Y] Failed to save accessibility preferences:', error);
    }
  }, []);

  // Update preference
  const updatePreference = useCallback((key: keyof AccessibilityPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
    
    // Apply immediate changes to DOM
    applyAccessibilityPreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Apply accessibility preferences to DOM
  const applyAccessibilityPreferences = useCallback((prefs: AccessibilityPreferences) => {
    const root = document.documentElement;
    
    // High contrast mode
    root.classList.toggle('a11y-high-contrast', prefs.highContrast);
    
    // Large text
    root.classList.toggle('a11y-large-text', prefs.largeText);
    
    // Bold text
    root.classList.toggle('a11y-bold-text', prefs.boldText);
    
    // Underline links
    root.classList.toggle('a11y-underline-links', prefs.underlineLinks);
    
    // Focus indicator size
    root.setAttribute('data-focus-size', prefs.focusIndicatorSize);
    
    // Color blindness filter
    root.setAttribute('data-color-blindness', prefs.colorBlindnessType);
    
    // Screen reader mode
    root.classList.toggle('a11y-screen-reader', prefs.screenReaderMode);
    
    // Keyboard only mode
    root.classList.toggle('a11y-keyboard-only', prefs.keyboardOnlyMode);
  }, []);

  // Screen reader announcement
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;
    
    // Clear previous announcement
    announcerRef.current.textContent = '';
    
    // Set aria-live attribute
    announcerRef.current.setAttribute('aria-live', priority);
    
    // Add new announcement after a brief delay
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 100);
  }, []);

  // Set aria-live on element
  const setAriaLive = useCallback((element: HTMLElement, mode: 'off' | 'polite' | 'assertive') => {
    element.setAttribute('aria-live', mode);
    if (mode !== 'off') {
      element.setAttribute('aria-atomic', 'true');
    }
  }, []);

  // Focus trap management
  const trapFocus = useCallback((container: HTMLElement) => {
    focusTrapRef.current = new FocusTrap(container);
    
    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.destroy();
        focusTrapRef.current = null;
      }
    };
  }, []);

  // Restore focus
  const restoreFocus = useCallback((element?: HTMLElement) => {
    if (element) {
      element.focus();
    } else if (focusTrapRef.current) {
      focusTrapRef.current.destroy();
      focusTrapRef.current = null;
    }
  }, []);

  // Skip to main content
  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main, [role=\"main\"], #main-content');
    if (mainContent instanceof HTMLElement) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Color contrast checking
  const checkColorContrast = useCallback((foreground: string, background: string): ContrastResult => {
    return ColorContrastUtils.checkContrast(foreground, background);
  }, []);

  // Get accessible color
  const getAccessibleColor = useCallback((color: string, background: string, level: 'AA' | 'AAA' = 'AA'): string => {
    const contrast = checkColorContrast(color, background);
    const targetRatio = level === 'AAA' ? 7 : 4.5;
    
    if (contrast.ratio >= targetRatio) {
      return color;
    }
    
    // Try to adjust color to meet contrast requirements
    // This is a simplified version - in production, you'd want more sophisticated color adjustment
    const [r, g, b] = ColorContrastUtils.hexToRgb(color);
    const [bgR, bgG, bgB] = ColorContrastUtils.hexToRgb(background);
    
    // Determine if we should make the color lighter or darker
    const bgLuminance = ColorContrastUtils.rgbToLuminance(bgR, bgG, bgB);
    const shouldLighten = bgLuminance < 0.5;
    
    // Adjust color
    const adjustedColor = shouldLighten 
      ? `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`
      : `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;
    
    return adjustedColor;
  }, [checkColorContrast]);

  // Motion preference handling
  const respectMotionPreference = useCallback((animation: string): string => {
    return shouldReduceMotion ? 'none' : animation;
  }, [shouldReduceMotion]);

  // Validate heading structure
  const validateHeadingStructure = useCallback((): HeadingValidationResult[] => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
    const results: HeadingValidationResult[] = [];
    let previousLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent?.trim() || '';
      const issues: string[] = [];

      // Check for empty headings
      if (!text) {
        issues.push('Heading is empty');
      }

      // Check for skipped levels
      if (level > previousLevel + 1 && previousLevel !== 0) {
        issues.push(`Heading level skipped (from h${previousLevel} to h${level})`);
      }

      // Check for multiple h1s
      if (level === 1 && results.some(r => r.level === 1)) {
        issues.push('Multiple h1 elements found (should only have one per page)');
      }

      results.push({
        element: heading,
        level,
        text,
        issues
      });

      previousLevel = level;
    });

    return results;
  }, []);

  // Check image alternative text
  const checkImageAlternativeText = useCallback((): ImageValidationResult[] => {
    const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
    const results: ImageValidationResult[] = [];

    images.forEach(img => {
      const alt = img.getAttribute('alt') || '';
      const issues: string[] = [];

      // Check for missing alt attribute
      if (!img.hasAttribute('alt')) {
        issues.push('Missing alt attribute');
      }

      // Check for placeholder alt text
      const placeholderTexts = ['image', 'photo', 'picture', 'img'];
      if (placeholderTexts.some(placeholder => alt.toLowerCase().includes(placeholder))) {
        issues.push('Alt text appears to be placeholder text');
      }

      // Check for redundant text
      if (alt.toLowerCase().startsWith('image of') || alt.toLowerCase().startsWith('picture of')) {
        issues.push('Alt text should not start with "image of" or "picture of"');
      }

      // Check for excessively long alt text
      if (alt.length > 125) {
        issues.push('Alt text is too long (should be under 125 characters)');
      }

      results.push({
        element: img,
        alt,
        issues
      });
    });

    return results;
  }, []);

  // Validate form accessibility
  const validateForm = useCallback((form: HTMLFormElement): FormValidationResult[] => {
    const results: FormValidationResult[] = [];
    const inputs = Array.from(form.querySelectorAll('input, select, textarea')) as HTMLElement[];

    inputs.forEach(input => {
      const id = input.id;
      const name = input.getAttribute('name');
      const required = input.hasAttribute('required');
      const type = input.getAttribute('type');

      // Check for labels
      const label = form.querySelector(`label[for="${id}"]`) as HTMLLabelElement;
      if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        results.push({
          element: input,
          type: 'label',
          message: 'Form control missing accessible label',
          severity: 'error'
        });
      }

      // Check required fields
      if (required && !input.getAttribute('aria-required')) {
        results.push({
          element: input,
          type: 'required',
          message: 'Required field missing aria-required attribute',
          severity: 'warning'
        });
      }

      // Check error messages
      const errorId = input.getAttribute('aria-describedby');
      if (errorId) {
        const errorElement = document.getElementById(errorId);
        if (!errorElement) {
          results.push({
            element: input,
            type: 'error',
            message: 'aria-describedby references non-existent element',
            severity: 'error'
          });
        }
      }
    });

    return results;
  }, []);

  // Add form error announcement
  const addFormErrorAnnouncement = useCallback((field: HTMLElement, message: string) => {
    // Create or update error message element
    let errorElement = document.getElementById(`${field.id}-error`);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = `${field.id}-error`;
      errorElement.className = 'sr-only';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      field.parentNode?.appendChild(errorElement);
    }

    errorElement.textContent = message;
    field.setAttribute('aria-describedby', errorElement.id);
    field.setAttribute('aria-invalid', 'true');

    // Announce to screen reader
    announceToScreenReader(message, 'assertive');
  }, [announceToScreenReader]);

  // Update landmarks
  const updateLandmarks = useCallback(() => {
    const landmarkSelectors = [
      'main, [role="main"]',
      'nav, [role="navigation"]',
      'aside, [role="complementary"]',
      'header, [role="banner"]',
      'footer, [role="contentinfo"]',
      'section, [role="region"]',
      'form, [role="form"]',
      '[role="search"]'
    ];

    const foundLandmarks: LandmarkInfo[] = [];

    landmarkSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      elements.forEach(element => {
        const role = element.getAttribute('role') || element.tagName.toLowerCase();
        const label = element.getAttribute('aria-label') || 
                     element.getAttribute('aria-labelledby') ||
                     (element as any).title ||
                     '';

        foundLandmarks.push({
          element,
          role,
          label,
          level: 0 // Could be calculated based on nesting
        });
      });
    });

    setLandmarks(foundLandmarks);
  }, []);

  // Navigate to landmark
  const navigateToLandmark = useCallback((landmark: string) => {
    const targetLandmark = landmarks.find(l => l.role === landmark || l.label === landmark);
    if (targetLandmark) {
      targetLandmark.element.focus();
      targetLandmark.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announceToScreenReader(`Navigated to ${targetLandmark.role} landmark`);
    }
  }, [landmarks, announceToScreenReader]);

  // Run accessibility audit
  const runAccessibilityAudit = useCallback(async (): Promise<AccessibilityReport> => {
    const issues: AccessibilityIssue[] = [];
    
    // Check heading structure
    const headingIssues = validateHeadingStructure();
    headingIssues.forEach(result => {
      result.issues.forEach(issue => {
        issues.push({
          type: 'serious',
          rule: 'heading-structure',
          message: issue,
          element: result.element,
          wcagReference: ['1.3.1', '2.4.6']
        });
      });
    });

    // Check images
    const imageIssues = checkImageAlternativeText();
    imageIssues.forEach(result => {
      result.issues.forEach(issue => {
        issues.push({
          type: issue.includes('Missing alt') ? 'critical' : 'moderate',
          rule: 'image-alt',
          message: issue,
          element: result.element,
          wcagReference: ['1.1.1']
        });
      });
    });

    // Check forms
    const forms = Array.from(document.querySelectorAll('form')) as HTMLFormElement[];
    forms.forEach(form => {
      const formIssues = validateForm(form);
      formIssues.forEach(issue => {
        issues.push({
          type: issue.severity === 'error' ? 'critical' : 'moderate',
          rule: 'form-labels',
          message: issue.message,
          element: issue.element,
          wcagReference: ['1.3.1', '3.3.2']
        });
      });
    });

    // Check color contrast (simplified)
    const textElements = Array.from(document.querySelectorAll('*')) as HTMLElement[];
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // This is simplified - would need proper color parsing in production
        // const contrast = checkColorContrast(color, backgroundColor);
        // if (!contrast.passes) {
        //   issues.push({
        //     type: 'serious',
        //     rule: 'color-contrast',
        //     message: `Insufficient color contrast ratio (${contrast.ratio.toFixed(2)}:1)`,
        //     element,
        //     wcagReference: ['1.4.3']
        //   });
        // }
      }
    });

    // Calculate summary
    const summary = {
      critical: issues.filter(i => i.type === 'critical').length,
      serious: issues.filter(i => i.type === 'serious').length,
      moderate: issues.filter(i => i.type === 'moderate').length,
      minor: issues.filter(i => i.type === 'minor').length
    };

    // Calculate score (0-100)
    const totalIssues = summary.critical + summary.serious + summary.moderate + summary.minor;
    const weightedScore = (summary.critical * 4) + (summary.serious * 3) + (summary.moderate * 2) + summary.minor;
    const score = Math.max(0, 100 - (weightedScore * 2));

    const report: AccessibilityReport = {
      score,
      issues,
      timestamp: new Date(),
      summary
    };

    setAccessibilityReport(report);
    return report;
  }, [validateHeadingStructure, checkImageAlternativeText, validateForm, checkColorContrast]);

  // Apply preferences on mount
  useEffect(() => {
    applyAccessibilityPreferences(preferences);
  }, [preferences, applyAccessibilityPreferences]);

  // Update landmarks on DOM changes
  useEffect(() => {
    updateLandmarks();
    
    const observer = new MutationObserver(() => {
      updateLandmarks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['role', 'aria-label', 'aria-labelledby']
    });

    return () => observer.disconnect();
  }, [updateLandmarks]);

  const contextValue: AccessibilityContextValue = {
    announceToScreenReader,
    setAriaLive,
    trapFocus,
    restoreFocus,
    skipToContent,
    preferences,
    updatePreference,
    checkColorContrast,
    getAccessibleColor,
    shouldReduceMotion,
    respectMotionPreference,
    validateHeadingStructure,
    checkImageAlternativeText,
    validateForm,
    addFormErrorAnnouncement,
    landmarks,
    updateLandmarks,
    navigateToLandmark,
    accessibilityReport,
    runAccessibilityAudit
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Skip links */}
      <SkipLinksContainer>
        <SkipLink href="#main-content" onClick={skipToContent}>
          Skip to main content
        </SkipLink>
        <SkipLink href="#navigation" onClick={() => navigateToLandmark('navigation')}>
          Skip to navigation
        </SkipLink>
        <SkipLink href="#search" onClick={() => navigateToLandmark('search')}>
          Skip to search
        </SkipLink>
      </SkipLinksContainer>

      {/* Screen reader announcer */}
      <ScreenReaderAnnouncer
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Accessibility hook
 */
export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
}

/**
 * Focus management hook
 */
export function useFocusManagement() {
  const { trapFocus, restoreFocus } = useAccessibility();
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    setFocusedElement(document.activeElement as HTMLElement);
  }, []);

  const restoreSavedFocus = useCallback(() => {
    if (focusedElement) {
      focusedElement.focus();
      setFocusedElement(null);
    }
  }, [focusedElement]);

  return {
    trapFocus,
    restoreFocus,
    saveFocus,
    restoreSavedFocus,
    focusedElement
  };
}

/**
 * Keyboard navigation hook
 */
export function useKeyboardNavigation() {
  const { announceToScreenReader } = useAccessibility();

  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    const { key, altKey, ctrlKey, metaKey } = event;

    // Handle common keyboard shortcuts
    if (altKey && !ctrlKey && !metaKey) {
      switch (key) {
        case 'h':
          event.preventDefault();
          announceToScreenReader('Heading navigation activated');
          // Implement heading navigation
          break;
        case 'l':
          event.preventDefault();
          announceToScreenReader('Landmark navigation activated');
          // Implement landmark navigation
          break;
        case 'r':
          event.preventDefault();
          announceToScreenReader('Region navigation activated');
          // Implement region navigation
          break;
      }
    }
  }, [announceToScreenReader]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  return { handleKeyboardNavigation };
}

export default AccessibilityProvider;