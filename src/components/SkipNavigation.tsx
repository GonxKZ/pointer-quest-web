/**
 * Skip Navigation Component
 * WCAG 2.1 AA Compliant skip navigation system
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAccessibility } from '../accessibility/AccessibilityManager';

// Styled components
const SkipLinksContainer = styled.nav`
  position: absolute;
  top: -100px;
  left: 0;
  right: 0;
  z-index: ${props => props.theme.zIndex.skipLink || 9999};
  pointer-events: none;
`;

const SkipLink = styled.a`
  position: absolute;
  left: ${props => props.theme.spacing[2]};
  top: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.base};
  border-radius: ${props => props.theme.borderRadius.base};
  border: 2px solid ${props => props.theme.colors.primary[600]};
  box-shadow: ${props => props.theme.shadows.lg};
  white-space: nowrap;
  pointer-events: auto;
  transform: translateY(-100px);
  transition: transform ${props => props.theme.animation.duration.fast};
  
  &:focus,
  &:focus-visible {
    transform: translateY(0);
    outline: 2px solid ${props => props.theme.colors.text.inverse};
    outline-offset: 2px;
  }
  
  &:hover {
    background: ${props => props.theme.colors.primary[600]};
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:focus,
    &:focus-visible {
      transform: translateY(0);
    }
  }
`;

const KeyboardHelp = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.colors.background.elevated};
  border: 2px solid ${props => props.theme.colors.primary[500]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.modal + 10};
  max-width: 500px;
  width: 90vw;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: all ${props => props.theme.animation.duration.normal};
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const HelpTitle = styled.h2`
  margin: 0 0 ${props => props.theme.spacing[4]} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const HelpList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const HelpItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing[2]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  
  &:last-child {
    border-bottom: none;
  }
`;

const HelpAction = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const HelpKeys = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.typography.fontFamily.mono};
  font-size: ${props => props.theme.typography.fontSize.sm};
  background: ${props => props.theme.colors.background.surface};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const CloseHelpButton = styled.button`
  background: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  margin-top: ${props => props.theme.spacing[4]};
  transition: background-color ${props => props.theme.animation.duration.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primary[600]};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.text.inverse};
    outline-offset: 2px;
  }
`;

// Interface for skip link configuration
interface SkipLink {
  id: string;
  label: string;
  target: string;
  condition?: () => boolean;
}

interface SkipNavigationProps {
  links?: SkipLink[];
  showKeyboardHelp?: boolean;
}

// Default skip links
const defaultSkipLinks: SkipLink[] = [
  {
    id: 'skip-main',
    label: 'Skip to main content',
    target: '#main-content, main, [role="main"]'
  },
  {
    id: 'skip-nav',
    label: 'Skip to navigation',
    target: '#navigation, nav, [role="navigation"]'
  },
  {
    id: 'skip-search',
    label: 'Skip to search',
    target: '#search, [role="search"]',
    condition: () => !!document.querySelector('#search, [role="search"]')
  },
  {
    id: 'skip-footer',
    label: 'Skip to footer',
    target: '#footer, footer, [role="contentinfo"]'
  }
];

// Keyboard shortcuts help data
const keyboardShortcuts = [
  { action: 'Skip to main content', keys: 'Tab + Enter' },
  { action: 'Open accessibility panel', keys: 'Alt + A' },
  { action: 'Toggle theme', keys: 'Alt + T' },
  { action: 'Run accessibility audit', keys: 'Ctrl + Shift + A' },
  { action: 'Show keyboard help', keys: '?' },
  { action: 'Close dialogs', keys: 'Escape' },
  { action: 'Navigate headings', keys: 'Alt + H' },
  { action: 'Navigate landmarks', keys: 'Alt + L' },
  { action: 'Navigate regions', keys: 'Alt + R' }
];

/**
 * Skip Navigation Component
 */
export function SkipNavigation({ 
  links = defaultSkipLinks,
  showKeyboardHelp = true 
}: SkipNavigationProps) {
  const { announceToScreenReader, navigateToLandmark } = useAccessibility();
  const [showHelp, setShowHelp] = useState(false);
  const [availableLinks, setAvailableLinks] = useState<SkipLink[]>([]);

  // Filter links based on conditions and element availability
  useEffect(() => {
    const updateAvailableLinks = () => {
      const available = links.filter(link => {
        // Check condition if provided
        if (link.condition && !link.condition()) {
          return false;
        }
        
        // Check if target element exists
        return !!document.querySelector(link.target);
      });
      
      setAvailableLinks(available);
    };
    
    // Update immediately
    updateAvailableLinks();
    
    // Update on DOM changes
    const observer = new MutationObserver(updateAvailableLinks);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'role']
    });
    
    return () => observer.disconnect();
  }, [links]);

  // Handle skip link navigation
  const handleSkipNavigation = (event: React.MouseEvent<HTMLAnchorElement>, link: SkipLink) => {
    event.preventDefault();
    
    const targetElement = document.querySelector(link.target) as HTMLElement;
    
    if (targetElement) {
      // Make element focusable if it's not naturally focusable
      if (targetElement.tabIndex < 0) {
        targetElement.tabIndex = -1;
      }
      
      // Focus and scroll to element
      targetElement.focus({ preventScroll: false });
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      // Announce to screen reader
      announceToScreenReader(`Navigated to ${link.label.toLowerCase()}`, 'polite');
      
      // Remove tabindex after focus if we added it
      if (targetElement.tabIndex === -1) {
        targetElement.addEventListener('blur', () => {
          targetElement.removeAttribute('tabindex');
        }, { once: true });
      }
    } else {
      console.warn(`Skip navigation target not found: ${link.target}`);
      announceToScreenReader('Navigation target not found', 'assertive');
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show keyboard help with '?'
      if (event.key === '?' && showKeyboardHelp && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const activeElement = document.activeElement;
        
        // Don't intercept if user is typing in an input
        if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
          return;
        }
        
        event.preventDefault();
        setShowHelp(!showHelp);
        announceToScreenReader(
          showHelp ? 'Keyboard help closed' : 'Keyboard help opened',
          'polite'
        );
      }
      
      // Close help with Escape
      if (event.key === 'Escape' && showHelp) {
        setShowHelp(false);
        announceToScreenReader('Keyboard help closed', 'polite');
      }
      
      // Accessibility shortcuts
      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault();
            navigateToHeadings();
            break;
          case 'l':
            event.preventDefault();
            navigateToLandmarks();
            break;
          case 'r':
            event.preventDefault();
            navigateToRegions();
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showHelp, showKeyboardHelp, navigateToLandmark, announceToScreenReader]);

  // Navigation helpers
  const navigateToHeadings = () => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    if (headings.length > 0) {
      announceToScreenReader(`Found ${headings.length} headings. Use Tab to navigate.`, 'polite');
      (headings[0] as HTMLElement).focus();
    } else {
      announceToScreenReader('No headings found on this page', 'polite');
    }
  };

  const navigateToLandmarks = () => {
    const landmarks = Array.from(document.querySelectorAll(
      'main, nav, aside, section, header, footer, [role="main"], [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"], [role="region"]'
    ));
    if (landmarks.length > 0) {
      announceToScreenReader(`Found ${landmarks.length} landmarks. Use Tab to navigate.`, 'polite');
      (landmarks[0] as HTMLElement).focus();
    } else {
      announceToScreenReader('No landmarks found on this page', 'polite');
    }
  };

  const navigateToRegions = () => {
    const regions = Array.from(document.querySelectorAll(
      '[role="region"], section[aria-labelledby], section[aria-label]'
    ));
    if (regions.length > 0) {
      announceToScreenReader(`Found ${regions.length} regions. Use Tab to navigate.`, 'polite');
      (regions[0] as HTMLElement).focus();
    } else {
      announceToScreenReader('No regions found on this page', 'polite');
    }
  };

  return (
    <>
      {/* Skip Links */}
      <SkipLinksContainer role="navigation" aria-label="Skip navigation">
        {availableLinks.map((link) => (
          <SkipLink
            key={link.id}
            href={`#${link.target.replace(/[#\[\]]/g, '')}`}
            onClick={(e) => handleSkipNavigation(e, link)}
            aria-describedby={`${link.id}-desc`}
          >
            {link.label}
          </SkipLink>
        ))}
      </SkipLinksContainer>

      {/* Hidden descriptions for screen readers */}
      {availableLinks.map((link) => (
        <div
          key={`${link.id}-desc`}
          id={`${link.id}-desc`}
          className="sr-only"
        >
          Press Enter to {link.label.toLowerCase()}
        </div>
      ))}

      {/* Keyboard Help Modal */}
      {showKeyboardHelp && (
        <KeyboardHelp 
          isVisible={showHelp}
          role="dialog"
          aria-labelledby="keyboard-help-title"
          aria-modal={showHelp}
        >
          <HelpTitle id="keyboard-help-title">
            Keyboard Navigation Help
          </HelpTitle>
          
          <HelpList>
            {keyboardShortcuts.map((shortcut, index) => (
              <HelpItem key={index}>
                <HelpAction>{shortcut.action}</HelpAction>
                <HelpKeys>{shortcut.keys}</HelpKeys>
              </HelpItem>
            ))}
          </HelpList>
          
          <CloseHelpButton 
            onClick={() => setShowHelp(false)}
            aria-label="Close keyboard help"
          >
            Close Help (Esc)
          </CloseHelpButton>
        </KeyboardHelp>
      )}

      {/* Overlay for keyboard help */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998
          }}
          onClick={() => setShowHelp(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default SkipNavigation;