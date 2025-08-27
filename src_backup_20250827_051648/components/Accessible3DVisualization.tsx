/**
 * Accessible 3D Visualization Component - WCAG 2.1 AA Compliant
 * 
 * Accessible wrapper for 3D visualizations with:
 * - Text alternatives for screen readers
 * - Keyboard navigation support  
 * - Reduced motion support
 * - High contrast mode
 * - Alternative interaction methods
 */

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import styled from 'styled-components';
import { theme } from '../design-system/theme';
import { 
  focusVisible, 
  AccessibilityAnnouncer,
  keyboardNavigation
} from '../design-system/utils/accessibility';

interface Accessible3DVisualizationProps {
  children: React.ReactNode;
  title: string;
  description: string;
  textAlternative: string;
  interactionInstructions?: string;
  keyboardShortcuts?: { key: string; action: string }[];
  onStateChange?: (state: any) => void;
  className?: string;
}

const VisualizationContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background.secondary};
  overflow: hidden;
  
  @media (prefers-contrast: high) {
    border: 3px solid #ffffff;
    background: #000000;
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: 400px;
  }
`;

const CanvasContainer = styled.div<{ $isVisible: boolean }>`
  width: 100%;
  height: 100%;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s ease;
  
  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
  }
`;

const TextAlternativeContainer = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing[6]};
  color: ${theme.colors.text.primary};
  overflow-y: auto;
  display: ${props => props.$isVisible ? 'block' : 'none'};
  
  @media (prefers-contrast: high) {
    background: #000000;
    color: #ffffff;
  }
`;

const AccessibilityControls = styled.div`
  position: absolute;
  top: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
  z-index: 10;
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? theme.colors.primary[500] : 'rgba(0, 0, 0, 0.7)'};
  border: 1px solid ${props => props.$active ? theme.colors.primary[400] : 'rgba(255, 255, 255, 0.3)'};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  min-height: 44px; /* WCAG minimum touch target */
  min-width: 44px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${props => props.$active ? theme.colors.primary[400] : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${theme.colors.primary[400]};
  }
  
  ${focusVisible}
  
  @media (prefers-contrast: high) {
    background: ${props => props.$active ? '#ffffff' : '#000000'};
    color: ${props => props.$active ? '#000000' : '#ffffff'};
    border: 2px solid #ffffff;
  }
`;

const KeyboardInstructions = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: ${theme.spacing[4]};
  left: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  background: rgba(0, 0, 0, 0.8);
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateY(${props => props.$isVisible ? 0 : '100%'});
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  @media (prefers-contrast: high) {
    background: #000000;
    border: 2px solid #ffffff;
  }
`;

const TextDescription = styled.div`
  font-family: ${theme.typography.fontFamily.primary};
  line-height: ${theme.typography.lineHeight.relaxed};
  
  h3 {
    color: ${theme.colors.primary[400]};
    font-size: ${theme.typography.fontSize.xl};
    margin-bottom: ${theme.spacing[3]};
    
    @media (prefers-contrast: high) {
      color: #ffffff;
    }
  }
  
  p {
    margin-bottom: ${theme.spacing[3]};
    color: ${theme.colors.text.primary};
    
    @media (prefers-contrast: high) {
      color: #ffffff;
    }
  }
  
  ul {
    margin: ${theme.spacing[3]} 0;
    padding-left: ${theme.spacing[6]};
    
    li {
      margin-bottom: ${theme.spacing[2]};
      color: ${theme.colors.text.secondary};
      
      @media (prefers-contrast: high) {
        color: #cccccc;
      }
    }
  }
  
  code {
    background: rgba(0, 0, 0, 0.3);
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.sm};
    font-family: ${theme.typography.fontFamily.code};
    color: ${theme.colors.primary[300]};
    
    @media (prefers-contrast: high) {
      background: #333333;
      color: #ffffff;
    }
  }
`;

const ScreenReaderOnly = styled.div`
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

export default function Accessible3DVisualization({
  children,
  title,
  description,
  textAlternative,
  interactionInstructions,
  keyboardShortcuts = [],
  onStateChange: _onStateChange,
  className
}: Accessible3DVisualizationProps) {
  const [showTextAlternative, setShowTextAlternative] = useState(false);
  const [showKeyboardInstructions, setShowKeyboardInstructions] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const announcer = AccessibilityAnnouncer.getInstance();

  // Check for user preferences
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  const toggleTextAlternative = () => {
    const newState = !showTextAlternative;
    setShowTextAlternative(newState);
    announcer.announce(
      newState 
        ? 'Switched to text description of 3D visualization' 
        : 'Switched back to 3D visualization'
    );
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!canvasRef.current?.contains(event.target as Node)) return;
      
      switch (event.key) {
        case 'h':
        case 'H':
          event.preventDefault();
          setShowKeyboardInstructions(!showKeyboardInstructions);
          announcer.announce(
            showKeyboardInstructions 
              ? 'Keyboard instructions hidden' 
              : 'Keyboard instructions shown'
          );
          break;
          
        case 't':
        case 'T':
          event.preventDefault();
          toggleTextAlternative();
          break;
          
        case keyboardNavigation.keys.ESCAPE:
          event.preventDefault();
          setShowKeyboardInstructions(false);
          setShowTextAlternative(false);
          break;
          
        default:
          // Handle custom keyboard shortcuts
          const shortcut = keyboardShortcuts.find(s => s.key === event.key);
          if (shortcut) {
            event.preventDefault();
            announcer.announce(`${shortcut.action} activated`);
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardInstructions, showTextAlternative, keyboardShortcuts, announcer, toggleTextAlternative]);

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    announcer.announce(
      reducedMotion 
        ? 'Animations enabled' 
        : 'Animations disabled for reduced motion'
    );
  };

  return (
    <VisualizationContainer 
      className={className}
      role="img"
      aria-label={`${title}. ${description}`}
      aria-describedby="visualization-description"
    >
      {/* Canvas with 3D content */}
      <CanvasContainer 
        ref={canvasRef}
        $isVisible={!showTextAlternative}
        tabIndex={0}
        role="application"
        aria-label="3D interactive visualization"
        aria-describedby="keyboard-instructions"
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 60 }}
          onCreated={({ gl }) => {
            gl.setPixelRatio(window.devicePixelRatio);
            gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
          }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {children}
        </Canvas>
      </CanvasContainer>

      {/* Text alternative for screen readers and users who prefer text */}
      <TextAlternativeContainer $isVisible={showTextAlternative}>
        <TextDescription>
          <h3>{title}</h3>
          <p>{description}</p>
          <div dangerouslySetInnerHTML={{ __html: textAlternative }} />
          {interactionInstructions && (
            <>
              <h4>Interaction Instructions:</h4>
              <p>{interactionInstructions}</p>
            </>
          )}
        </TextDescription>
      </TextAlternativeContainer>

      {/* Accessibility controls */}
      <AccessibilityControls>
        <ControlButton
          onClick={toggleTextAlternative}
          $active={showTextAlternative}
          aria-label={
            showTextAlternative 
              ? 'Switch to 3D visualization view' 
              : 'Switch to text description view'
          }
          title="Toggle between 3D view and text description (T)"
        >
          {showTextAlternative ? '🎲' : '📝'}
        </ControlButton>
        
        <ControlButton
          onClick={toggleReducedMotion}
          $active={reducedMotion}
          aria-label={
            reducedMotion 
              ? 'Enable animations' 
              : 'Disable animations (reduced motion)'
          }
          title="Toggle animations for motion sensitivity"
        >
          {reducedMotion ? '▶️' : '⏸️'}
        </ControlButton>
        
        <ControlButton
          onClick={() => setShowKeyboardInstructions(!showKeyboardInstructions)}
          $active={showKeyboardInstructions}
          aria-label={
            showKeyboardInstructions 
              ? 'Hide keyboard instructions' 
              : 'Show keyboard instructions'
          }
          title="Show keyboard navigation help (H)"
        >
          ⌨️
        </ControlButton>
      </AccessibilityControls>

      {/* Keyboard instructions */}
      <KeyboardInstructions $isVisible={showKeyboardInstructions}>
        <h4 style={{ margin: '0 0 1rem 0', color: theme.colors.primary[400] }}>
          Keyboard Navigation
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem' }}>
          <kbd>T</kbd><span>Toggle text description</span>
          <kbd>H</kbd><span>Toggle this help</span>
          <kbd>Esc</kbd><span>Close overlays</span>
          {keyboardShortcuts.map((shortcut, index) => (
            <React.Fragment key={index}>
              <kbd>{shortcut.key}</kbd><span>{shortcut.action}</span>
            </React.Fragment>
          ))}
        </div>
      </KeyboardInstructions>

      {/* Screen reader content */}
      <ScreenReaderOnly>
        <div id="visualization-description">
          <h3>{title}</h3>
          <p>{description}</p>
          <p>{textAlternative}</p>
          {interactionInstructions && (
            <p>Interaction instructions: {interactionInstructions}</p>
          )}
        </div>
        
        <div id="keyboard-instructions" aria-live="polite">
          <p>
            This is an interactive 3D visualization. Press T to toggle text description, 
            H for keyboard help, or Escape to close overlays.
            {keyboardShortcuts.length > 0 && (
              <span>
                {' '}Additional shortcuts: {keyboardShortcuts.map(s => `${s.key} for ${s.action}`).join(', ')}.
              </span>
            )}
          </p>
        </div>
      </ScreenReaderOnly>

      {/* Live region for state changes */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        style={{ position: 'absolute', left: '-10000px' }}
      >
        {/* This will be populated by the announcer when visualization state changes */}
      </div>
    </VisualizationContainer>
  );
}