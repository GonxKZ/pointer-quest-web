/**
 * Axe DevTools Integration for Development
 * Automatically runs axe-core accessibility tests and logs results
 */

import { useEffect } from 'react';
import axeCore from 'axe-core';

interface AxeDevToolsProps {
  enabled?: boolean;
  runOnMount?: boolean;
  runOnChange?: boolean;
  element?: Element;
  config?: any;
}

export function AxeDevTools({
  enabled = process.env.NODE_ENV === 'development',
  runOnMount = true,
  runOnChange = false,
  element,
  config = {
    rules: {
      'color-contrast': { enabled: true },
      'color-contrast-enhanced': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'hidden-content': { enabled: true },
      'label-title-only': { enabled: true },
      'link-in-text-block': { enabled: true },
      'p-as-heading': { enabled: true },
      'region': { enabled: true },
      'scope-attr-valid': { enabled: true },
      'skip-link': { enabled: true }
    },
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    reporter: 'v2'
  }
}: AxeDevToolsProps): null {
  
  const runAxeAudit = async (target: Element = document.body): Promise<any> => {
    if (!enabled) return;
    
    try {
      console.group('🔍 Axe-core Accessibility Audit');
      console.log('Running accessibility tests...');
      
      const results = await axeCore.run(target, config);
      
      if (!results) {
        console.log('No results returned from axe-core');
        return;
      }
      
      // Type assertion to ensure results has expected properties
      const axeResults = results as any;
      
      // Log summary
      console.log(`✅ Passes: ${axeResults.passes?.length || 0}`);
      console.log(`❌ Violations: ${axeResults.violations?.length || 0}`);
      console.log(`⚠️ Incomplete: ${axeResults.incomplete?.length || 0}`);
      
      // Log violations with details
      if (axeResults.violations?.length > 0) {
        console.group('❌ Violations');
        axeResults.violations.forEach((violation: any) => {
          console.group(`${violation.impact?.toUpperCase() || 'UNKNOWN'}: ${violation.id}`);
          console.log(`Description: ${violation.description}`);
          console.log(`Help: ${violation.help}`);
          console.log(`Help URL: ${violation.helpUrl}`);
          console.log(`Tags: ${violation.tags.join(', ')}`);
          
          violation.nodes.forEach((node: any, index: number) => {
            console.group(`Element ${index + 1}`);
            console.log('Target:', node.target);
            console.log('HTML:', node.html);
            console.log('Impact:', node.impact);
            
            if (node.failureSummary) {
              console.log('Failure Summary:', node.failureSummary);
            }
            
            if (node.any.length > 0) {
              console.log('Any checks:', node.any);
            }
            
            if (node.all.length > 0) {
              console.log('All checks:', node.all);
            }
            
            if (node.none.length > 0) {
              console.log('None checks:', node.none);
            }
            
            console.groupEnd();
          });
          
          console.groupEnd();
        });
        console.groupEnd();
      }
      
      // Log incomplete tests
      if (axeResults.incomplete?.length > 0) {
        console.group('⚠️ Incomplete Tests');
        axeResults.incomplete.forEach((incomplete: any) => {
          console.log(`${incomplete.id}: ${incomplete.description}`);
        });
        console.groupEnd();
      }
      
      // Log passes (only in verbose mode)
      if (process.env.REACT_APP_AXE_VERBOSE === 'true' && axeResults.passes?.length > 0) {
        console.group('✅ Passed Tests');
        axeResults.passes.forEach((pass: any) => {
          console.log(`${pass.id}: ${pass.description}`);
        });
        console.groupEnd();
      }
      
      console.groupEnd();
      
      // Return results for further processing
      return axeResults;
      
    } catch (error) {
      console.error('🚨 Axe-core audit failed:', error);
    }
  };
  
  // Run audit on mount
  useEffect(() => {
    if (enabled && runOnMount) {
      // Delay to allow DOM to fully render
      const timer = setTimeout(() => {
        runAxeAudit(element);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [enabled, runOnMount, element]);
  
  // Run audit on DOM changes
  useEffect(() => {
    if (!enabled || !runOnChange) return;
    
    const observer = new MutationObserver(() => {
      // Debounce the audit calls
      const timer = setTimeout(() => {
        runAxeAudit(element);
      }, 500);
      
      return () => clearTimeout(timer);
    });
    
    observer.observe(element || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'role', 'aria-*']
    });
    
    return () => observer.disconnect();
  }, [enabled, runOnChange, element]);
  
  // Add global function for manual testing
  useEffect(() => {
    if (enabled) {
      (window as any).runAxeAudit = runAxeAudit;
      
      // Add keyboard shortcut for manual audit (Ctrl+Shift+A)
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'A') {
          event.preventDefault();
          runAxeAudit();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        delete (window as any).runAxeAudit;
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled]);
  
  // This component doesn't render anything
  return null;
}

export default AxeDevTools;