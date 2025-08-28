/**
 * Keyboard Shortcuts Guide - WCAG 2.1 AA Compliant
 * Comprehensive keyboard navigation documentation for accessibility
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAccessibility } from '../accessibility/AccessibilityManager';

// Animations
const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const GuideContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(800px, 90vw);
  max-height: 80vh;
  background: ${props => props.theme.colors.background.elevated};
  border: 2px solid ${props => props.theme.colors.primary[500]};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.modal + 10};
  display: ${props => props.$isVisible ? 'block' : 'none'};
  animation: ${slideIn} 0.3s ease-out;
  overflow: hidden;
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
  
  @media (prefers-contrast: high) {
    background: #000000;
    border: 3px solid #ffffff;
  }
`;

const Overlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: ${props => props.theme.zIndex.modal + 5};
  display: ${props => props.$isVisible ? 'block' : 'none'};
`;

const Header = styled.header`
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.text.inverse};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (prefers-contrast: high) {
    background: #ffffff;
    color: #000000;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.inverse};
  font-size: 1.5rem;
  cursor: pointer;
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.base};
  min-height: 44px;
  min-width: 44px;
  transition: all ${props => props.theme.animation.duration.normal};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    animation: ${pulse} 0.3s ease-in-out;
  }
  
  &:focus-visible {
    outline: 3px solid #ffff00;
    outline-offset: 2px;
  }
  
  @media (prefers-contrast: high) {
    color: #000000;
    &:hover {
      background: #cccccc;
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing[6]};
  max-height: 60vh;
  overflow-y: auto;
  color: ${props => props.theme.colors.text.primary};
  
  @media (prefers-contrast: high) {
    color: #ffffff;
  }
`;

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing[6]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.primary[400]};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin: 0 0 ${props => props.theme.spacing[4]} 0;
  padding-bottom: ${props => props.theme.spacing[2]};
  border-bottom: 2px solid ${props => props.theme.colors.border.secondary};
  
  @media (prefers-contrast: high) {
    color: #ffffff;
    border-bottom-color: #ffffff;
  }
`;

const ShortcutGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  align-items: center;
`;

const KeyCombo = styled.kbd`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.surface};
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.base};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  font-family: ${props => props.theme.typography.fontFamily.mono};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  min-height: 32px;
  
  @media (prefers-contrast: high) {
    background: #333333;
    color: #ffffff;
    border-color: #ffffff;
  }
`;

const KeySeparator = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const Description = styled.div`
  font-size: ${props => props.theme.typography.fontSize.base};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  color: ${props => props.theme.colors.text.primary};
  
  @media (prefers-contrast: high) {
    color: #ffffff;
  }
`;

const HelpButton = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: ${props => props.theme.zIndex.modal};
  transition: all ${props => props.theme.animation.duration.normal};
  
  &:hover {
    background: ${props => props.theme.colors.primary[600]};
    transform: scale(1.1);
  }
  
  &:focus-visible {
    outline: 3px solid #ffff00;
    outline-offset: 3px;
  }
  
  @media (prefers-contrast: high) {
    background: #ffffff;
    color: #000000;
    border: 3px solid #000000;
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: background-color ${props => props.theme.animation.duration.fast};
    
    &:hover {
      transform: none;
    }
  }
`;

const Note = styled.div`
  background: ${props => props.theme.colors.background.surface};
  border-left: 4px solid ${props => props.theme.colors.info};
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.base};
  margin-top: ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  
  @media (prefers-contrast: high) {
    background: #333333;
    border-left-color: #ffffff;
    color: #ffffff;
  }
`;

// Keyboard shortcuts data
const shortcuts = {
  navigation: [
    { keys: ['Tab'], description: 'Navigate to next interactive element' },
    { keys: ['Shift', 'Tab'], description: 'Navigate to previous interactive element' },
    { keys: ['Enter'], description: 'Activate button or link' },
    { keys: ['Space'], description: 'Activate button or toggle' },
    { keys: ['Escape'], description: 'Close modal or overlay' },
    { keys: ['Alt', 'H'], description: 'Navigate to next heading' },
    { keys: ['Alt', 'L'], description: 'Navigate to next landmark' },
    { keys: ['Alt', 'R'], description: 'Navigate to next region' }
  ],
  application: [
    { keys: ['Ctrl', '3'], description: 'Toggle 3D/2D view mode' },
    { keys: ['Ctrl', 'S'], description: 'Save current progress' },
    { keys: ['Ctrl', 'R'], description: 'Reset current lesson' },
    { keys: ['F1'], description: 'Show this help guide' },
    { keys: ['F2'], description: 'Toggle accessibility panel' },
    { keys: ['F11'], description: 'Toggle fullscreen mode' }
  ],
  codeEditor: [
    { keys: ['Ctrl', 'Enter'], description: 'Compile and run code' },
    { keys: ['Ctrl', 'Z'], description: 'Undo last change' },
    { keys: ['Ctrl', 'Y'], description: 'Redo last change' },
    { keys: ['Ctrl', 'F'], description: 'Find in code' },
    { keys: ['F9'], description: 'Toggle breakpoint' },
    { keys: ['F5'], description: 'Run/debug code' }
  ],
  visualization: [
    { keys: ['T'], description: 'Toggle text description of 3D content' },
    { keys: ['H'], description: 'Show keyboard controls help' },
    { keys: ['Arrow Keys'], description: 'Navigate 3D scene (when focused)' },
    { keys: ['Space'], description: 'Pause/resume animation' },
    { keys: ['Plus'], description: 'Zoom in' },
    { keys: ['Minus'], description: 'Zoom out' }
  ]
};

interface KeyboardShortcutsGuideProps {
  className?: string;
}

export function KeyboardShortcutsGuide({ className }: KeyboardShortcutsGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  // Listen for F1 key to show help
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        toggleGuide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus management
  useEffect(() => {
    if (isVisible) {
      // Focus the close button when guide opens
      const closeButton = document.querySelector('[data-close-keyboard-guide]') as HTMLElement;
      closeButton?.focus();
      
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      
      announceToScreenReader('Keyboard shortcuts guide opened');
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible, announceToScreenReader]);

  const toggleGuide = () => {
    setIsVisible(!isVisible);
  };

  const renderKeyCombo = (keys: string[]) => (
    <KeyCombo>
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <KeySeparator>+</KeySeparator>}
          <span>{key}</span>
        </React.Fragment>
      ))}
    </KeyCombo>
  );

  return (
    <>
      <HelpButton
        onClick={toggleGuide}
        aria-label="Show keyboard shortcuts guide"
        title="Keyboard Shortcuts (F1)"
        className={className}
      >
        ⌨️
      </HelpButton>

      <Overlay
        $isVisible={isVisible}
        onClick={toggleGuide}
        aria-hidden={!isVisible}
      />

      <GuideContainer
        $isVisible={isVisible}
        role="dialog"
        aria-labelledby="shortcuts-title"
        aria-modal={isVisible}
      >
        <Header>
          <Title id="shortcuts-title">
            Keyboard Shortcuts Guide
          </Title>
          <CloseButton
            onClick={toggleGuide}
            aria-label="Close keyboard shortcuts guide"
            data-close-keyboard-guide
          >
            ×
          </CloseButton>
        </Header>

        <Content>
          <Section>
            <SectionTitle>General Navigation</SectionTitle>
            <ShortcutGrid>
              {shortcuts.navigation.map((shortcut, index) => (
                <React.Fragment key={index}>
                  {renderKeyCombo(shortcut.keys)}
                  <Description>{shortcut.description}</Description>
                </React.Fragment>
              ))}
            </ShortcutGrid>
          </Section>

          <Section>
            <SectionTitle>Application Controls</SectionTitle>
            <ShortcutGrid>
              {shortcuts.application.map((shortcut, index) => (
                <React.Fragment key={index}>
                  {renderKeyCombo(shortcut.keys)}
                  <Description>{shortcut.description}</Description>
                </React.Fragment>
              ))}
            </ShortcutGrid>
          </Section>

          <Section>
            <SectionTitle>Code Editor</SectionTitle>
            <ShortcutGrid>
              {shortcuts.codeEditor.map((shortcut, index) => (
                <React.Fragment key={index}>
                  {renderKeyCombo(shortcut.keys)}
                  <Description>{shortcut.description}</Description>
                </React.Fragment>
              ))}
            </ShortcutGrid>
          </Section>

          <Section>
            <SectionTitle>3D Visualization</SectionTitle>
            <ShortcutGrid>
              {shortcuts.visualization.map((shortcut, index) => (
                <React.Fragment key={index}>
                  {renderKeyCombo(shortcut.keys)}
                  <Description>{shortcut.description}</Description>
                </React.Fragment>
              ))}
            </ShortcutGrid>
          </Section>

          <Note>
            <strong>Screen Reader Users:</strong> This application is fully compatible with 
            NVDA, JAWS, and VoiceOver. All visual content has alternative text descriptions. 
            Use the standard screen reader navigation commands to explore lesson content. 
            Press 'T' when focused on 3D visualizations to access detailed text descriptions.
          </Note>
        </Content>
      </GuideContainer>
    </>
  );
}

export default KeyboardShortcutsGuide;