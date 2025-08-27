/**
 * Accessibility Control Panel
 * User-friendly interface for accessibility preferences and settings
 */

import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useAccessibility } from '../accessibility/AccessibilityManager';
import { useTheme } from '../context/ThemeContext';

// Styled components
const AccessibilityButton = styled.button`
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  background: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg} 0 0 ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[2]};
  font-size: 1.2rem;
  cursor: pointer;
  z-index: ${props => props.theme.zIndex.modal};
  transition: all ${props => props.theme.animation.duration.normal};
  box-shadow: ${props => props.theme.shadows.lg};

  &:hover {
    background: ${props => props.theme.colors.primary[600]};
    transform: translateY(-50%) translateX(-4px);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.text.inverse};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background-color ${props => props.theme.animation.duration.fast};
    
    &:hover {
      transform: translateY(-50%);
    }
  }
`;

const PanelOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: ${props => props.theme.zIndex.modal};
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all ${props => props.theme.animation.duration.normal};

  @media (prefers-reduced-motion: reduce) {
    transition: opacity ${props => props.theme.animation.duration.fast};
  }
`;

const PanelContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: min(400px, 90vw);
  height: 100vh;
  background: ${props => props.theme.colors.background.elevated};
  border-left: 1px solid ${props => props.theme.colors.border.primary};
  z-index: ${props => props.theme.zIndex.modal + 1};
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform ${props => props.theme.animation.duration.normal};
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: translateX(${props => props.isOpen ? '0' : '100%'});
  }
`;

const PanelHeader = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.colors.background.surface};
  position: sticky;
  top: 0;
  z-index: 1;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: 1.2rem;
  transition: color ${props => props.theme.animation.duration.fast};

  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const PanelContent = styled.div`
  padding: ${props => props.theme.spacing[4]};
`;

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing[3]} 0;
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  padding-bottom: ${props => props.theme.spacing[2]};
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing[3]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.label`
  flex: 1;
  margin-right: ${props => props.theme.spacing[3]};
`;

const SettingTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SettingDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const Toggle = styled.input.attrs({ type: 'checkbox' })`
  position: relative;
  width: 44px;
  height: 24px;
  appearance: none;
  background: ${props => props.theme.colors.background.input};
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.normal};

  &:checked {
    background: ${props => props.theme.colors.primary[500]};
    border-color: ${props => props.theme.colors.primary[500]};
  }

  &::before {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: ${props => props.theme.borderRadius.full};
    transition: transform ${props => props.theme.animation.duration.normal};
  }

  &:checked::before {
    transform: translateX(18px);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]}40;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background-color ${props => props.theme.animation.duration.fast};
    
    &::before {
      transition: transform ${props => props.theme.animation.duration.fast};
    }
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.input};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.border.focus};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[500]}40;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.normal};

  ${props => {
    switch (props.variant) {
      case 'danger':
        return css`
          background: ${props.theme.colors.error};
          color: ${props.theme.colors.text.inverse};
          
          &:hover {
            background: ${props.theme.colors.error}cc;
          }
        `;
      case 'secondary':
        return css`
          background: ${props.theme.colors.background.surface};
          color: ${props.theme.colors.text.primary};
          border: 1px solid ${props.theme.colors.border.primary};
          
          &:hover {
            background: ${props.theme.colors.background.hover};
          }
        `;
      default:
        return css`
          background: ${props.theme.colors.primary[500]};
          color: ${props.theme.colors.text.inverse};
          
          &:hover {
            background: ${props.theme.colors.primary[600]};
          }
        `;
    }
  }}

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]}40;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background-color ${props => props.theme.animation.duration.fast};
  }
`;

const ReportSection = styled.div`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border.secondary};
`;

const ScoreDisplay = styled.div<{ score: number }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ScoreCircle = styled.div<{ score: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  position: relative;
  background: conic-gradient(
    ${props => props.score >= 90 ? props.theme.colors.success : 
               props.score >= 70 ? props.theme.colors.warning : 
               props.theme.colors.error} 0deg ${props.score * 3.6}deg,
    ${props => props.theme.colors.background.input} ${props.score * 3.6}deg 360deg
  );

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: ${props => props.theme.colors.background.surface};
  }

  span {
    position: relative;
    z-index: 1;
    color: ${props => props.theme.colors.text.primary};
  }
`;

const IssuesSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[3]};
`;

const IssueCount = styled.div<{ type: 'critical' | 'serious' | 'moderate' | 'minor' }>`
  text-align: center;
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => {
    switch (props.type) {
      case 'critical': return props.theme.colors.error + '20';
      case 'serious': return props.theme.colors.warning + '20';
      case 'moderate': return props.theme.colors.info + '20';
      default: return props.theme.colors.success + '20';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'critical': return props.theme.colors.error;
      case 'serious': return props.theme.colors.warning;
      case 'moderate': return props.theme.colors.info;
      default: return props.theme.colors.success;
    }
  }};
`;

const IssueNumber = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const IssueLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  text-transform: capitalize;
`;

// Component interface
interface AccessibilityPanelProps {
  className?: string;
}

/**
 * Accessibility Control Panel Component
 */
export function AccessibilityPanel({ className }: AccessibilityPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  
  const {
    preferences,
    updatePreference,
    accessibilityReport,
    runAccessibilityAudit,
    announceToScreenReader
  } = useAccessibility();
  
  const { toggleTheme } = useTheme();

  // Handle panel toggle
  const togglePanel = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      announceToScreenReader('Accessibility panel opened');
    } else {
      announceToScreenReader('Accessibility panel closed');
    }
  };

  // Handle preference changes
  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    updatePreference(key, value);
    announceToScreenReader(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  // Handle audit
  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    announceToScreenReader('Running accessibility audit...');
    
    try {
      const report = await runAccessibilityAudit();
      announceToScreenReader(`Audit complete. Score: ${report.score}/100`);
    } catch (error) {
      announceToScreenReader('Audit failed. Please try again.');
    } finally {
      setIsRunningAudit(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
      announceToScreenReader('Accessibility panel closed');
    }
  };

  return (
    <div className={className}>
      {/* Accessibility button */}
      <AccessibilityButton
        onClick={togglePanel}
        aria-label="Open accessibility settings"
        aria-expanded={isOpen}
        title="Accessibility Settings"
      >
        ♿
      </AccessibilityButton>

      {/* Panel overlay */}
      <PanelOverlay
        isOpen={isOpen}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Panel container */}
      <PanelContainer
        isOpen={isOpen}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="accessibility-panel-title"
        aria-modal={isOpen}
      >
        <PanelHeader>
          <PanelTitle id="accessibility-panel-title">
            Accessibility Settings
          </PanelTitle>
          <CloseButton
            onClick={() => setIsOpen(false)}
            aria-label="Close accessibility panel"
          >
            ×
          </CloseButton>
        </PanelHeader>

        <PanelContent>
          {/* Visual Settings */}
          <Section>
            <SectionTitle>Visual Settings</SectionTitle>
            
            <SettingItem>
              <SettingLabel htmlFor="high-contrast">
                <SettingTitle>High Contrast Mode</SettingTitle>
                <SettingDescription>
                  Increases contrast for better visibility
                </SettingDescription>
              </SettingLabel>
              <Toggle
                id="high-contrast"
                checked={preferences.highContrast}
                onChange={(e) => handlePreferenceChange('highContrast', e.target.checked)}
                aria-describedby="high-contrast-desc"
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel htmlFor="large-text">
                <SettingTitle>Large Text</SettingTitle>
                <SettingDescription>
                  Increases text size for better readability
                </SettingDescription>
              </SettingLabel>
              <Toggle
                id="large-text"
                checked={preferences.largeText}
                onChange={(e) => handlePreferenceChange('largeText', e.target.checked)}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel htmlFor="bold-text">
                <SettingTitle>Bold Text</SettingTitle>
                <SettingDescription>
                  Makes text bolder for improved visibility
                </SettingDescription>
              </SettingLabel>
              <Toggle
                id="bold-text"
                checked={preferences.boldText}
                onChange={(e) => handlePreferenceChange('boldText', e.target.checked)}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel htmlFor="underline-links">
                <SettingTitle>Underline Links</SettingTitle>
                <SettingDescription>
                  Adds underlines to all links for better identification
                </SettingDescription>
              </SettingLabel>
              <Toggle
                id="underline-links"
                checked={preferences.underlineLinks}
                onChange={(e) => handlePreferenceChange('underlineLinks', e.target.checked)}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel htmlFor="focus-size">
                <SettingTitle>Focus Indicator Size</SettingTitle>
                <SettingDescription>
                  Size of focus indicators for keyboard navigation
                </SettingDescription>
              </SettingLabel>
              <Select
                id="focus-size"
                value={preferences.focusIndicatorSize}
                onChange={(e) => handlePreferenceChange('focusIndicatorSize', e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </Select>
            </SettingItem>
          </Section>

          {/* Motion Settings */}
          <Section>
            <SectionTitle>Motion & Animation</SectionTitle>
            
            <SettingItem>
              <SettingLabel htmlFor="reduced-motion">
                <SettingTitle>Reduce Motion</SettingTitle>
                <SettingDescription>
                  Minimizes animations and transitions
                </SettingDescription>
              </SettingLabel>
              <Toggle
                id="reduced-motion"
                checked={preferences.reducedMotion}
                onChange={(e) => handlePreferenceChange('reducedMotion', e.target.checked)}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel htmlFor="reduced-transparency">
                <SettingTitle>Reduce Transparency</SettingTitle>
                <SettingDescription>
                  Reduces transparent effects for clarity
                </SettingDescription>
              </SettingLabel>
              <Toggle
                id="reduced-transparency"
                checked={preferences.reducedTransparency}
                onChange={(e) => handlePreferenceChange('reducedTransparency', e.target.checked)}
              />
            </SettingItem>
          </Section>

          {/* Input Settings */}
          <Section>
            <SectionTitle>Input & Navigation</SectionTitle>
            
            <SettingItem>
              <SettingLabel htmlFor="screen-reader">
                <SettingTitle>Screen Reader Mode</SettingTitle>
                <SettingDescription>
                  Optimizes interface for screen reader users
                </SettingDescription>
              </SettingLabel>
              <Toggle
                id="screen-reader"
                checked={preferences.screenReaderMode}
                onChange={(e) => handlePreferenceChange('screenReaderMode', e.target.checked)}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel htmlFor="keyboard-only">
                <SettingTitle>Keyboard-Only Mode</SettingTitle>
                <SettingDescription>
                  Optimizes interface for keyboard navigation
                </SettingDescription>
              </SettingLabel>
              <Toggle
                id="keyboard-only"
                checked={preferences.keyboardOnlyMode}
                onChange={(e) => handlePreferenceChange('keyboardOnlyMode', e.target.checked)}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel htmlFor="color-blindness">
                <SettingTitle>Color Blindness Filter</SettingTitle>
                <SettingDescription>
                  Applies filters to assist with color vision deficiencies
                </SettingDescription>
              </SettingLabel>
              <Select
                id="color-blindness"
                value={preferences.colorBlindnessType}
                onChange={(e) => handlePreferenceChange('colorBlindnessType', e.target.value)}
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                <option value="tritanopia">Tritanopia (Blue-blind)</option>
              </Select>
            </SettingItem>
          </Section>

          {/* Quick Actions */}
          <Section>
            <SectionTitle>Quick Actions</SectionTitle>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button onClick={toggleTheme}>
                Toggle Theme
              </Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reset Page
              </Button>
            </div>
          </Section>

          {/* Accessibility Report */}
          <Section>
            <SectionTitle>Accessibility Report</SectionTitle>
            
            <ReportSection>
              <ScoreDisplay score={accessibilityReport.score}>
                <ScoreCircle score={accessibilityReport.score}>
                  <span>{accessibilityReport.score}</span>
                </ScoreCircle>
                <div>
                  <div style={{ fontSize: '1.1em', fontWeight: '600', marginBottom: '4px' }}>
                    Accessibility Score
                  </div>
                  <div style={{ fontSize: '0.9em', color: 'var(--pq-text-secondary)' }}>
                    Last updated: {accessibilityReport.timestamp.toLocaleDateString()}
                  </div>
                </div>
              </ScoreDisplay>

              <IssuesSummary>
                <IssueCount type="critical">
                  <IssueNumber>{accessibilityReport.summary.critical}</IssueNumber>
                  <IssueLabel>Critical</IssueLabel>
                </IssueCount>
                <IssueCount type="serious">
                  <IssueNumber>{accessibilityReport.summary.serious}</IssueNumber>
                  <IssueLabel>Serious</IssueLabel>
                </IssueCount>
                <IssueCount type="moderate">
                  <IssueNumber>{accessibilityReport.summary.moderate}</IssueNumber>
                  <IssueLabel>Moderate</IssueLabel>
                </IssueCount>
                <IssueCount type="minor">
                  <IssueNumber>{accessibilityReport.summary.minor}</IssueNumber>
                  <IssueLabel>Minor</IssueLabel>
                </IssueCount>
              </IssuesSummary>

              <div style={{ marginTop: '16px' }}>
                <Button 
                  onClick={handleRunAudit}
                  disabled={isRunningAudit}
                  style={{ width: '100%' }}
                >
                  {isRunningAudit ? 'Running Audit...' : 'Run Accessibility Audit'}
                </Button>
              </div>
            </ReportSection>
          </Section>
        </PanelContent>
      </PanelContainer>
    </div>
  );
}

export default AccessibilityPanel;