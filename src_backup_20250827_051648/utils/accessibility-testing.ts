/**
 * Pointer Quest - Comprehensive Accessibility Testing Suite
 * 
 * Automated accessibility testing utilities for WCAG 2.1 AA compliance.
 * Use in conjunction with manual testing and screen reader testing.
 */

import { calculateContrast, isContrastCompliant, WCAG_AA_STANDARDS } from '../design-system/utils/accessibility';
import { theme } from '../design-system/theme';

// Types for accessibility testing
export interface A11yTestResult {
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  element?: HTMLElement;
  recommendation: string;
}

export interface A11yTestSuite {
  name: string;
  tests: A11yTestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
}

// Color contrast testing
export const testColorContrast = (element: HTMLElement): A11yTestResult[] => {
  const results: A11yTestResult[] = [];
  const styles = getComputedStyle(element);
  const color = styles.color;
  const backgroundColor = styles.backgroundColor;
  const fontSize = parseFloat(styles.fontSize);
  const fontWeight = styles.fontWeight;
  
  // Determine if text is large (24px+ or 19px+ bold)
  const isLargeText = fontSize >= 24 || (fontSize >= 19 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
  
  if (color && backgroundColor && color !== 'transparent' && backgroundColor !== 'transparent') {
    try {
      const contrastCheck = isContrastCompliant(color, backgroundColor, isLargeText);
      
      if (!contrastCheck.compliant) {
        results.push({
          passed: false,
          severity: 'error',
          message: `Insufficient color contrast: ${contrastCheck.ratio}:1 (required: ${contrastCheck.standard}:1)`,
          element,
          recommendation: `Increase contrast to at least ${contrastCheck.standard}:1. Consider using darker text or lighter background.`
        });
      } else {
        results.push({
          passed: true,
          severity: 'info',
          message: `Good color contrast: ${contrastCheck.ratio}:1`,
          element,
          recommendation: 'No action needed - contrast meets WCAG AA standards.'
        });
      }
    } catch (error) {
      results.push({
        passed: false,
        severity: 'warning',
        message: 'Could not calculate color contrast - check color values',
        element,
        recommendation: 'Manually verify color contrast meets WCAG AA standards.'
      });
    }
  }
  
  return results;
};

// Keyboard navigation testing
export const testKeyboardNavigation = (container: HTMLElement): A11yTestResult[] => {
  const results: A11yTestResult[] = [];
  
  // Find all focusable elements
  const focusableSelector = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
  const focusableElements = container.querySelectorAll(focusableSelector);
  
  // Test each focusable element
  focusableElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    // Check for proper focus indicators
    const styles = getComputedStyle(htmlElement, ':focus');
    const hasOutline = styles.outline !== 'none' && styles.outline !== '0px';
    const hasBoxShadow = styles.boxShadow !== 'none';
    const hasFocusStyles = hasOutline || hasBoxShadow;
    
    if (!hasFocusStyles) {
      results.push({
        passed: false,
        severity: 'error',
        message: `${tagName} element lacks visible focus indicator`,
        element: htmlElement,
        recommendation: 'Add visible focus styles using :focus-visible CSS or focus ring utilities.'
      });
    }
    
    // Check tabindex values
    const tabIndex = htmlElement.getAttribute('tabindex');
    if (tabIndex && parseInt(tabIndex) > 0) {
      results.push({
        passed: false,
        severity: 'warning',
        message: `${tagName} has positive tabindex (${tabIndex}) which disrupts natural tab order`,
        element: htmlElement,
        recommendation: 'Use tabindex="0" for focusable elements or remove tabindex to use natural tab order.'
      });
    }
    
    // Check minimum touch target size for interactive elements
    const rect = htmlElement.getBoundingClientRect();
    const minSize = WCAG_AA_STANDARDS.MIN_TOUCH_TARGET;
    
    if (['button', 'a', 'input'].includes(tagName) && (rect.width < minSize || rect.height < minSize)) {
      results.push({
        passed: false,
        severity: 'error',
        message: `${tagName} element is too small (${Math.round(rect.width)}×${Math.round(rect.height)}px, minimum: ${minSize}×${minSize}px)`,
        element: htmlElement,
        recommendation: `Increase element size to at least ${minSize}×${minSize}px or add padding.`
      });
    }
  });
  
  if (focusableElements.length === 0) {
    results.push({
      passed: false,
      severity: 'warning',
      message: 'No focusable elements found',
      recommendation: 'Ensure interactive elements are keyboard accessible.'
    });
  }
  
  return results;
};

// ARIA and semantic testing
export const testARIAAndSemantics = (container: HTMLElement): A11yTestResult[] => {
  const results: A11yTestResult[] = [];
  
  // Check for proper heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastHeadingLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    
    if (index === 0 && level !== 1) {
      results.push({
        passed: false,
        severity: 'warning',
        message: `First heading should be h1, found h${level}`,
        element: heading as HTMLElement,
        recommendation: 'Start heading hierarchy with h1 or ensure proper heading structure.'
      });
    }
    
    if (level > lastHeadingLevel + 1) {
      results.push({
        passed: false,
        severity: 'error',
        message: `Heading level jumps from h${lastHeadingLevel} to h${level}`,
        element: heading as HTMLElement,
        recommendation: 'Ensure heading levels increment by 1 (h1→h2→h3, not h1→h3).'
      });
    }
    
    lastHeadingLevel = level;
  });
  
  // Check images for alt text
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    const alt = img.getAttribute('alt');
    const role = img.getAttribute('role');
    
    if (alt === null) {
      results.push({
        passed: false,
        severity: 'error',
        message: 'Image missing alt attribute',
        element: img,
        recommendation: 'Add alt attribute with descriptive text or empty alt="" for decorative images.'
      });
    } else if (alt === '' && role !== 'presentation') {
      results.push({
        passed: true,
        severity: 'info',
        message: 'Decorative image properly marked with empty alt',
        element: img,
        recommendation: 'No action needed - decorative image properly handled.'
      });
    }
  });
  
  // Check buttons for accessible names
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    const text = button.textContent?.trim();
    const ariaLabel = button.getAttribute('aria-label');
    const ariaLabelledBy = button.getAttribute('aria-labelledby');
    
    if (!text && !ariaLabel && !ariaLabelledBy) {
      results.push({
        passed: false,
        severity: 'error',
        message: 'Button lacks accessible name',
        element: button,
        recommendation: 'Add text content, aria-label, or aria-labelledby to describe the button action.'
      });
    }
  });
  
  // Check form controls for labels
  const formControls = container.querySelectorAll('input, textarea, select');
  formControls.forEach(control => {
    const id = control.getAttribute('id');
    const ariaLabel = control.getAttribute('aria-label');
    const ariaLabelledBy = control.getAttribute('aria-labelledby');
    const associatedLabel = id ? container.querySelector(`label[for="${id}"]`) : null;
    
    if (!associatedLabel && !ariaLabel && !ariaLabelledBy) {
      results.push({
        passed: false,
        severity: 'error',
        message: `${control.tagName.toLowerCase()} lacks associated label`,
        element: control as HTMLElement,
        recommendation: 'Add a label element with for attribute, aria-label, or aria-labelledby.'
      });
    }
  });
  
  return results;
};

// Screen reader testing helpers
export const testScreenReaderContent = (container: HTMLElement): A11yTestResult[] => {
  const results: A11yTestResult[] = [];
  
  // Check for skip links
  const skipLinks = container.querySelectorAll('a[href^="#"]');
  const hasSkipToMain = Array.from(skipLinks).some(link => 
    link.textContent?.toLowerCase().includes('skip') && 
    link.textContent?.toLowerCase().includes('main')
  );
  
  if (!hasSkipToMain && container === document.body) {
    results.push({
      passed: false,
      severity: 'warning',
      message: 'No "skip to main content" link found',
      recommendation: 'Add skip link to allow screen reader users to bypass navigation.'
    });
  }
  
  // Check for landmark regions
  const landmarks = container.querySelectorAll('main, nav, aside, section[aria-labelledby], section[aria-label], header, footer');
  
  if (landmarks.length === 0) {
    results.push({
      passed: false,
      severity: 'warning',
      message: 'No landmark regions found',
      recommendation: 'Use semantic HTML elements (main, nav, aside) or ARIA landmarks for page structure.'
    });
  }
  
  // Check for live regions where appropriate
  const hasFormValidation = container.querySelectorAll('input[required], input[pattern]').length > 0;
  const hasLiveRegion = container.querySelectorAll('[aria-live]').length > 0;
  
  if (hasFormValidation && !hasLiveRegion) {
    results.push({
      passed: false,
      severity: 'warning',
      message: 'Form validation present but no live region for announcements',
      recommendation: 'Add aria-live region to announce form validation messages to screen readers.'
    });
  }
  
  return results;
};

// 3D visualization accessibility testing
export const test3DVisualizationAccessibility = (canvas: HTMLCanvasElement): A11yTestResult[] => {
  const results: A11yTestResult[] = [];
  const container = canvas.parentElement;
  
  if (!container) return results;
  
  // Check for alternative text representation
  const altText = canvas.getAttribute('aria-label') || canvas.getAttribute('alt');
  const describedBy = canvas.getAttribute('aria-describedby');
  const hasTextAlternative = container.querySelector('[data-3d-description]');
  
  if (!altText && !describedBy && !hasTextAlternative) {
    results.push({
      passed: false,
      severity: 'error',
      message: '3D visualization lacks alternative text description',
      element: canvas,
      recommendation: 'Add aria-label or provide detailed text description of the 3D content for screen readers.'
    });
  }
  
  // Check for keyboard controls
  const hasKeyboardControls = container.querySelector('[data-keyboard-controls]') || 
                              canvas.getAttribute('tabindex') === '0';
  
  if (!hasKeyboardControls) {
    results.push({
      passed: false,
      severity: 'warning',
      message: '3D visualization may not be keyboard accessible',
      element: canvas,
      recommendation: 'Provide keyboard controls or alternative interaction methods for 3D content.'
    });
  }
  
  // Check for motion controls
  const hasReducedMotion = container.classList.contains('respect-reduced-motion') ||
                          getComputedStyle(container).animationPlayState === 'paused';
  
  if (!hasReducedMotion) {
    results.push({
      passed: false,
      severity: 'warning',
      message: '3D visualization does not respect prefers-reduced-motion',
      element: canvas,
      recommendation: 'Add CSS to pause or reduce animations when users prefer reduced motion.'
    });
  }
  
  return results;
};

// Code block accessibility testing
export const testCodeBlockAccessibility = (container: HTMLElement): A11yTestResult[] => {
  const results: A11yTestResult[] = [];
  const codeBlocks = container.querySelectorAll('pre, code');
  
  codeBlocks.forEach((block, index) => {
    const element = block as HTMLElement;
    
    // Check for language identification
    const hasLang = element.getAttribute('lang') || 
                   element.className.includes('language-') ||
                   element.getAttribute('data-language');
    
    if (!hasLang && element.tagName.toLowerCase() === 'pre') {
      results.push({
        passed: false,
        severity: 'warning',
        message: `Code block ${index + 1} missing language identification`,
        element,
        recommendation: 'Add lang attribute or language class to help screen readers pronounce code correctly.'
      });
    }
    
    // Check for proper heading
    const prevElement = element.previousElementSibling;
    const hasHeading = prevElement && /^h[1-6]$/i.test(prevElement.tagName);
    
    if (!hasHeading) {
      results.push({
        passed: false,
        severity: 'info',
        message: `Code block ${index + 1} could benefit from descriptive heading`,
        element,
        recommendation: 'Add heading before code block to describe its purpose or context.'
      });
    }
    
    // Check readability
    const styles = getComputedStyle(element);
    const fontSize = parseFloat(styles.fontSize);
    const lineHeight = parseFloat(styles.lineHeight) || fontSize * 1.4;
    
    if (fontSize < 14) {
      results.push({
        passed: false,
        severity: 'warning',
        message: `Code block ${index + 1} has small font size (${fontSize}px)`,
        element,
        recommendation: 'Increase font size to at least 14px for better readability.'
      });
    }
    
    if (lineHeight / fontSize < 1.4) {
      results.push({
        passed: false,
        severity: 'warning',
        message: `Code block ${index + 1} has tight line spacing`,
        element,
        recommendation: 'Increase line height to at least 1.4 times font size for better readability.'
      });
    }
  });
  
  return results;
};

// Comprehensive accessibility test runner
export const runA11yTests = (container: HTMLElement = document.body): A11yTestSuite => {
  const allResults: A11yTestResult[] = [];
  
  // Run all test suites
  allResults.push(...testColorContrast(container));
  allResults.push(...testKeyboardNavigation(container));
  allResults.push(...testARIAAndSemantics(container));
  allResults.push(...testScreenReaderContent(container));
  allResults.push(...testCodeBlockAccessibility(container));
  
  // Test 3D visualizations if present
  const canvases = container.querySelectorAll('canvas');
  canvases.forEach(canvas => {
    allResults.push(...test3DVisualizationAccessibility(canvas));
  });
  
  // Calculate summary statistics
  const passedTests = allResults.filter(r => r.passed).length;
  const failedTests = allResults.filter(r => !r.passed && r.severity === 'error').length;
  const warningTests = allResults.filter(r => !r.passed && r.severity === 'warning').length;
  
  return {
    name: 'Pointer Quest Accessibility Test Suite',
    tests: allResults,
    totalTests: allResults.length,
    passedTests,
    failedTests,
    warningTests
  };
};

// Test reporting functions
export const generateA11yReport = (testSuite: A11yTestSuite): string => {
  const { name, tests, totalTests, passedTests, failedTests, warningTests } = testSuite;
  
  let report = `
# ${name} - Accessibility Report

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)
- **Failed**: ${failedTests}
- **Warnings**: ${warningTests}

## Test Results

`;

  // Group results by severity
  const errors = tests.filter(t => !t.passed && t.severity === 'error');
  const warnings = tests.filter(t => !t.passed && t.severity === 'warning');
  const info = tests.filter(t => t.severity === 'info');

  if (errors.length > 0) {
    report += `### ❌ Errors (${errors.length})\n\n`;
    errors.forEach((error, index) => {
      report += `${index + 1}. **${error.message}**\n`;
      report += `   - Recommendation: ${error.recommendation}\n\n`;
    });
  }

  if (warnings.length > 0) {
    report += `### ⚠️ Warnings (${warnings.length})\n\n`;
    warnings.forEach((warning, index) => {
      report += `${index + 1}. **${warning.message}**\n`;
      report += `   - Recommendation: ${warning.recommendation}\n\n`;
    });
  }

  if (info.length > 0) {
    report += `### ✅ Passed Tests (${info.length})\n\n`;
    info.forEach((item, index) => {
      report += `${index + 1}. ${item.message}\n`;
    });
  }

  report += `
## Next Steps

1. **Priority**: Fix all errors first as they prevent accessibility
2. **Improvements**: Address warnings to enhance user experience  
3. **Validation**: Test with screen readers (NVDA, JAWS, VoiceOver)
4. **User Testing**: Involve users with disabilities in testing
5. **Automated Testing**: Integrate into CI/CD pipeline

Generated on: ${new Date().toLocaleDateString()}
`;

  return report;
};

// Console logging helper for development
export const logA11yResults = (testSuite: A11yTestSuite): void => {
  console.group(`🔍 ${testSuite.name}`);
  console.log(`📊 ${testSuite.passedTests}/${testSuite.totalTests} tests passed`);
  
  const errors = testSuite.tests.filter(t => !t.passed && t.severity === 'error');
  const warnings = testSuite.tests.filter(t => !t.passed && t.severity === 'warning');
  
  if (errors.length > 0) {
    console.group('❌ Errors');
    errors.forEach(error => {
      console.error(error.message);
      console.log('💡 Recommendation:', error.recommendation);
      if (error.element) console.log('🎯 Element:', error.element);
    });
    console.groupEnd();
  }
  
  if (warnings.length > 0) {
    console.group('⚠️ Warnings');
    warnings.forEach(warning => {
      console.warn(warning.message);
      console.log('💡 Recommendation:', warning.recommendation);
      if (warning.element) console.log('🎯 Element:', warning.element);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
};

export default {
  runA11yTests,
  generateA11yReport,
  logA11yResults,
  testColorContrast,
  testKeyboardNavigation,
  testARIAAndSemantics,
  testScreenReaderContent,
  test3DVisualizationAccessibility,
  testCodeBlockAccessibility
};