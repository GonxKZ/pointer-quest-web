/**
 * Advanced Accessibility Auditor Component
 * WCAG 2.1 AA Compliance Testing and Reporting
 */

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axeCore from 'axe-core';
import { runA11yTests, logA11yResults } from '../utils/accessibility-testing';
import { calculateContrastRatio, checkWCAGCompliance } from '../utils/contrastChecker';

// Animation keyframes
const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

// Styled components
const AuditorContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100vh;
  background: ${props => props.theme.colors.background.elevated};
  border-left: 2px solid ${props => props.theme.colors.primary[500]};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.modal + 2};
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform ${props => props.theme.animation.duration.normal};
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100vw;
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const AuditorHeader = styled.div`
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.text.inverse};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const AuditorTitle = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.inverse};
  font-size: 1.5rem;
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.base};
  transition: background-color ${props => props.theme.animation.duration.fast};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.text.inverse};
    outline-offset: 2px;
  }
`;

const AuditorContent = styled.div`
  padding: ${props => props.theme.spacing[4]};
  height: calc(100vh - 80px);
  overflow-y: auto;
`;

const TestSuiteSection = styled.section`
  margin-bottom: ${props => props.theme.spacing[6]};
  border: 1px solid ${props => props.theme.colors.border.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const SectionHeader = styled.div<{ variant: 'running' | 'pass' | 'fail' | 'warning' }>`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => {
    switch (props.variant) {
      case 'running': return props.theme.colors.info + '20';
      case 'pass': return props.theme.colors.success + '20';
      case 'fail': return props.theme.colors.error + '20';
      case 'warning': return props.theme.colors.warning + '20';
      default: return props.theme.colors.background.surface;
    }
  }};
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const StatusIcon = styled.span<{ variant: 'running' | 'pass' | 'fail' | 'warning' }>`
  font-size: 1.2rem;
  ${props => props.variant === 'running' && `animation: ${pulse} 1.5s infinite;`}
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  flex: 1;
`;


const ProgressBar = styled.div<{ progress: number }>`
  width: 100px;
  height: 8px;
  background: ${props => props.theme.colors.background.input};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background: ${props => {
      if (props.progress >= 90) return props.theme.colors.success;
      if (props.progress >= 70) return props.theme.colors.warning;
      return props.theme.colors.error;
    }};
    transition: width ${props => props.theme.animation.duration.normal};
  }
`;

const TestResults = styled.div`
  padding: ${props => props.theme.spacing[3]};
`;

const TestItem = styled.div<{ severity: 'error' | 'warning' | 'info' | 'pass' }>`
  padding: ${props => props.theme.spacing[3]};
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'error': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      case 'info': return props.theme.colors.info;
      case 'pass': return props.theme.colors.success;
      default: return props.theme.colors.border.secondary;
    }
  }};
  background: ${props => {
    switch (props.severity) {
      case 'error': return props.theme.colors.error + '10';
      case 'warning': return props.theme.colors.warning + '10';
      case 'info': return props.theme.colors.info + '10';
      case 'pass': return props.theme.colors.success + '10';
      default: return 'transparent';
    }
  }};
  margin-bottom: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const TestMessage = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing[1]};
  color: ${props => props.theme.colors.text.primary};
`;

const TestRecommendation = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const WCAGReference = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing[1]};
  font-family: ${props => props.theme.typography.fontFamily.mono};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
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
        return `
          background: ${props.theme.colors.error};
          color: ${props.theme.colors.text.inverse};
          &:hover { background: ${props.theme.colors.error}dd; }
        `;
      case 'secondary':
        return `
          background: ${props.theme.colors.background.surface};
          color: ${props.theme.colors.text.primary};
          border: 1px solid ${props.theme.colors.border.primary};
          &:hover { background: ${props.theme.colors.background.hover}; }
        `;
      default:
        return `
          background: ${props.theme.colors.primary[500]};
          color: ${props.theme.colors.text.inverse};
          &:hover { background: ${props.theme.colors.primary[600]}; }
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
    transition: none;
  }
`;

const FloatingButton = styled.button<{ isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  box-shadow: ${props => props.theme.shadows.lg};
  cursor: pointer;
  z-index: ${props => props.theme.zIndex.modal + 1};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all ${props => props.theme.animation.duration.normal};
  transform: ${props => props.isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
  
  &:hover {
    background: ${props => props.theme.colors.primary[600]};
    transform: ${props => props.isOpen ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)'};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.text.inverse};
    outline-offset: 2px;
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: background-color ${props => props.theme.animation.duration.fast};
    
    &:hover {
      transform: none;
    }
  }
`;

const ReportSection = styled.div`
  background: ${props => props.theme.colors.background.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.secondary};
`;

const ReportTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing[3]} 0;
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const SummaryItem = styled.div<{ variant: 'pass' | 'fail' | 'warning' | 'total' }>`
  text-align: center;
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => {
    switch (props.variant) {
      case 'pass': return props.theme.colors.success + '20';
      case 'fail': return props.theme.colors.error + '20';
      case 'warning': return props.theme.colors.warning + '20';
      default: return props.theme.colors.background.surface;
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'pass': return props.theme.colors.success;
      case 'fail': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      default: return props.theme.colors.border.secondary;
    }
  }};
`;

const SummaryNumber = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SummaryLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

// Types
interface AccessibilityAuditReport {
  timestamp: Date;
  overallScore: number;
  wcagComplianceLevel: 'None' | 'A' | 'AA' | 'AAA';
  axeResults?: any;
  customTestResults?: any;
  contrastResults?: any[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    incomplete: number;
  };
  recommendations: string[];
}

interface AccessibilityAuditorProps {
  targetElement?: HTMLElement;
  autoRun?: boolean;
  onReportGenerated?: (report: AccessibilityAuditReport) => void;
}

/**
 * Advanced Accessibility Auditor Component
 */
export function AccessibilityAuditor({
  targetElement,
  autoRun = false,
  onReportGenerated
}: AccessibilityAuditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentReport, setCurrentReport] = useState<AccessibilityAuditReport | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const auditorRef = useRef<HTMLDivElement>(null);

  // Run comprehensive accessibility audit
  const runComprehensiveAudit = async () => {
    setIsRunning(true);
    setTestProgress(0);
    
    try {
      const target = targetElement || document.body;
      
      // Step 1: Run axe-core audit (40% progress)
      setTestProgress(10);
      const axeResults = await axeCore.run(target, {
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
        }
      });
      setTestProgress(40);
      
      // Step 2: Run custom tests (70% progress)
      const customTestResults = runA11yTests(target);
      setTestProgress(70);
      
      // Step 3: Run contrast analysis (90% progress)
      const contrastResults = await runContrastAnalysis(target);
      setTestProgress(90);
      
      // Step 4: Generate comprehensive report (100% progress)
      const report = generateComprehensiveReport({
        axeResults,
        customTestResults,
        contrastResults
      });
      setTestProgress(100);
      
      setCurrentReport(report);
      onReportGenerated?.(report);
      
    } catch (error) {
      console.error('Accessibility audit failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Run contrast analysis
  const runContrastAnalysis = async (target: HTMLElement) => {
    const textElements = Array.from(target.querySelectorAll('*'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.color && style.backgroundColor && el.textContent?.trim();
      }) as HTMLElement[];

    return textElements.map(el => {
      const style = window.getComputedStyle(el);
      const foreground = rgbToHex(style.color);
      const background = getEffectiveBackgroundColor(el);
      
      if (foreground && background) {
        const contrastRatio = calculateContrastRatio(foreground, background);
        const wcagCompliance = {
          AA: {
            normal: checkWCAGCompliance(contrastRatio, 'AA', 'normal').passes,
            large: checkWCAGCompliance(contrastRatio, 'AA', 'large').passes
          },
          AAA: {
            normal: checkWCAGCompliance(contrastRatio, 'AAA', 'normal').passes,
            large: checkWCAGCompliance(contrastRatio, 'AAA', 'large').passes
          }
        };
        
        return {
          element: el,
          foregroundColor: foreground,
          backgroundColor: background,
          contrastRatio,
          wcagCompliance
        };
      }
      return null;
    }).filter(Boolean);
  };

  // Generate comprehensive report
  const generateComprehensiveReport = ({ axeResults, customTestResults, contrastResults }: any): AccessibilityAuditReport => {
    const timestamp = new Date();
    
    // Calculate summary
    const axeViolations = axeResults.violations.length;
    const axePasses = axeResults.passes.length;
    const axeIncomplete = axeResults.incomplete.length;
    
    const customFailed = customTestResults.failedTests;
    const customWarnings = customTestResults.warningTests;
    const customPassed = customTestResults.passedTests;
    
    const contrastFailures = contrastResults?.filter((c: any) => !c.wcagCompliance.AA.normal).length || 0;
    
    const summary = {
      total: axeResults.violations.length + axeResults.passes.length + axeResults.incomplete.length + customTestResults.totalTests,
      passed: axePasses + customPassed,
      failed: axeViolations + customFailed,
      warnings: customWarnings + contrastFailures,
      incomplete: axeIncomplete
    };
    
    // Calculate overall score
    const totalTests = summary.total;
    const weightedScore = (summary.failed * 4) + (summary.warnings * 2) + (summary.incomplete * 1);
    const overallScore = Math.max(0, 100 - Math.min(100, (weightedScore / totalTests) * 25));
    
    // Determine WCAG compliance level
    let wcagComplianceLevel: 'None' | 'A' | 'AA' | 'AAA' = 'None';
    if (summary.failed === 0) {
      if (summary.warnings === 0) {
        wcagComplianceLevel = 'AAA';
      } else if (summary.warnings <= totalTests * 0.1) {
        wcagComplianceLevel = 'AA';
      } else {
        wcagComplianceLevel = 'A';
      }
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (axeViolations > 0) {
      recommendations.push(`Fix ${axeViolations} critical accessibility violations`);
    }
    
    if (contrastFailures > 0) {
      recommendations.push(`Improve color contrast for ${contrastFailures} elements`);
    }
    
    if (customFailed > 0) {
      recommendations.push(`Address ${customFailed} structural accessibility issues`);
    }
    
    if (summary.warnings > 0) {
      recommendations.push(`Review and optimize ${summary.warnings} potential accessibility improvements`);
    }
    
    return {
      timestamp,
      overallScore: Math.round(overallScore),
      wcagComplianceLevel,
      axeResults,
      customTestResults,
      contrastResults,
      summary,
      recommendations
    };
  };

  // Helper functions
  const rgbToHex = (rgb: string): string | null => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return null;
    
    const [, r, g, b] = match;
    if (!r || !g || !b) return null;
    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
  };

  const getEffectiveBackgroundColor = (element: HTMLElement): string | null => {
    let current = element;
    
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const bgColor = style.backgroundColor;
      
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        return rgbToHex(bgColor);
      }
      
      current = current.parentElement!;
    }
    
    return '#ffffff'; // Default to white
  };

  // Export report
  const exportReport = () => {
    if (!currentReport) return;
    
    const reportContent = `
# WCAG 2.1 AA Accessibility Audit Report

**Generated:** ${currentReport.timestamp.toLocaleString()}
**Overall Score:** ${currentReport.overallScore}/100
**WCAG Compliance Level:** ${currentReport.wcagComplianceLevel}

## Summary
- **Total Tests:** ${currentReport.summary.total}
- **Passed:** ${currentReport.summary.passed}
- **Failed:** ${currentReport.summary.failed}
- **Warnings:** ${currentReport.summary.warnings}
- **Incomplete:** ${currentReport.summary.incomplete}

## Recommendations
${currentReport.recommendations.map(rec => `- ${rec}`).join('\n')}

## Axe-core Results
### Violations
${currentReport.axeResults?.violations.map((v: any) => `- **${v.id}**: ${v.description}`).join('\n') || 'None'}

### Passes
${currentReport.axeResults?.passes.map((p: any) => `- **${p.id}**: ${p.description}`).join('\n') || 'None'}

---
*Generated by Pointer Quest Accessibility Auditor*
    `;
    
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-audit-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-run audit on mount if enabled
  useEffect(() => {
    if (autoRun) {
      runComprehensiveAudit();
    }
  }, [autoRun]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && auditorRef.current) {
      const firstFocusable = auditorRef.current.querySelector('button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating trigger button */}
      <FloatingButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close accessibility auditor' : 'Open accessibility auditor'}
        title="Accessibility Auditor"
      >
        {isOpen ? '×' : '♿'}
      </FloatingButton>

      {/* Main auditor panel */}
      <AuditorContainer
        isOpen={isOpen}
        ref={auditorRef}
        role="dialog"
        aria-labelledby="auditor-title"
        aria-modal={isOpen}
      >
        <AuditorHeader>
          <AuditorTitle id="auditor-title">
            Accessibility Auditor
          </AuditorTitle>
          <CloseButton
            onClick={() => setIsOpen(false)}
            aria-label="Close auditor"
          >
            ×
          </CloseButton>
        </AuditorHeader>

        <AuditorContent>
          {/* Action buttons */}
          <ActionButtons>
            <ActionButton
              onClick={runComprehensiveAudit}
              disabled={isRunning}
              aria-describedby="audit-description"
            >
              {isRunning ? 'Running Audit...' : 'Run Full Audit'}
            </ActionButton>
            
            {currentReport && (
              <ActionButton
                variant="secondary"
                onClick={exportReport}
              >
                Export Report
              </ActionButton>
            )}
            
            <ActionButton
              variant="secondary"
              onClick={() => {
                if (currentReport?.customTestResults) {
                  logA11yResults(currentReport.customTestResults);
                }
              }}
            >
              Log to Console
            </ActionButton>
          </ActionButtons>
          
          <div id="audit-description" className="sr-only">
            Runs comprehensive WCAG 2.1 AA accessibility audit including automated tests, 
            custom checks, and color contrast analysis
          </div>

          {/* Progress indicator */}
          {isRunning && (
            <TestSuiteSection>
              <SectionHeader variant="running">
                <StatusIcon variant="running">⏳</StatusIcon>
                <SectionTitle>Running Accessibility Audit</SectionTitle>
                <ProgressBar progress={testProgress} />
                <span>{testProgress}%</span>
              </SectionHeader>
            </TestSuiteSection>
          )}

          {/* Report summary */}
          {currentReport && (
            <ReportSection>
              <ReportTitle>Audit Summary</ReportTitle>
              
              <SummaryGrid>
                <SummaryItem variant="total">
                  <SummaryNumber>{currentReport.overallScore}</SummaryNumber>
                  <SummaryLabel>Score</SummaryLabel>
                </SummaryItem>
                <SummaryItem variant="pass">
                  <SummaryNumber>{currentReport.summary.passed}</SummaryNumber>
                  <SummaryLabel>Passed</SummaryLabel>
                </SummaryItem>
                <SummaryItem variant="fail">
                  <SummaryNumber>{currentReport.summary.failed}</SummaryNumber>
                  <SummaryLabel>Failed</SummaryLabel>
                </SummaryItem>
                <SummaryItem variant="warning">
                  <SummaryNumber>{currentReport.summary.warnings}</SummaryNumber>
                  <SummaryLabel>Warnings</SummaryLabel>
                </SummaryItem>
              </SummaryGrid>
              
              <div>
                <strong>WCAG Compliance Level:</strong> {currentReport.wcagComplianceLevel}
              </div>
            </ReportSection>
          )}

          {/* Recommendations */}
          {currentReport?.recommendations && currentReport.recommendations.length > 0 && (
            <TestSuiteSection>
              <SectionHeader variant="warning">
                <StatusIcon variant="warning">💡</StatusIcon>
                <SectionTitle>Recommendations</SectionTitle>
              </SectionHeader>
              <TestResults>
                {currentReport.recommendations.map((rec, index) => (
                  <TestItem key={index} severity="warning">
                    <TestMessage>{rec}</TestMessage>
                  </TestItem>
                ))}
              </TestResults>
            </TestSuiteSection>
          )}

          {/* Axe-core violations */}
          {currentReport?.axeResults?.violations && currentReport.axeResults.violations.length > 0 && (
            <TestSuiteSection>
              <SectionHeader variant="fail">
                <StatusIcon variant="fail">❌</StatusIcon>
                <SectionTitle>
                  Axe-core Violations ({currentReport.axeResults.violations.length})
                </SectionTitle>
              </SectionHeader>
              <TestResults>
                {currentReport.axeResults.violations.map((violation: any, index: number) => (
                  <TestItem key={index} severity="error">
                    <TestMessage>{violation.description}</TestMessage>
                    <TestRecommendation>{violation.help}</TestRecommendation>
                    <WCAGReference>
                      WCAG: {violation.tags.filter((tag: string) => tag.startsWith('wcag')).join(', ')}
                    </WCAGReference>
                  </TestItem>
                ))}
              </TestResults>
            </TestSuiteSection>
          )}

          {/* Custom test results */}
          {currentReport?.customTestResults && (
            <TestSuiteSection>
              <SectionHeader variant={currentReport.customTestResults.failedTests === 0 ? 'pass' : 'fail'}>
                <StatusIcon variant={currentReport.customTestResults.failedTests === 0 ? 'pass' : 'fail'}>
                  {currentReport.customTestResults.failedTests === 0 ? '✅' : '❌'}
                </StatusIcon>
                <SectionTitle>
                  Custom Tests ({currentReport.customTestResults.passedTests}/{currentReport.customTestResults.totalTests})
                </SectionTitle>
              </SectionHeader>
              <TestResults>
                {currentReport.customTestResults.tests
                  .filter((test: any) => !test.passed)
                  .map((test: any, index: number) => (
                    <TestItem key={index} severity={test.severity}>
                      <TestMessage>{test.message}</TestMessage>
                      <TestRecommendation>{test.recommendation}</TestRecommendation>
                    </TestItem>
                  ))
                }
              </TestResults>
            </TestSuiteSection>
          )}

          {/* Contrast analysis results */}
          {currentReport?.contrastResults && (
            <TestSuiteSection>
              <SectionHeader variant="warning">
                <StatusIcon variant="warning">🎨</StatusIcon>
                <SectionTitle>
                  Color Contrast Analysis ({currentReport.contrastResults.filter((c: any) => !c.wcagCompliance.AA.normal).length} issues)
                </SectionTitle>
              </SectionHeader>
              <TestResults>
                {currentReport.contrastResults
                  .filter((result: any) => !result.wcagCompliance.AA.normal)
                  .map((result: any, index: number) => (
                    <TestItem key={index} severity="warning">
                      <TestMessage>
                        Insufficient contrast ratio: {result.contrastRatio.toFixed(2)}:1
                      </TestMessage>
                      <TestRecommendation>
                        Colors: {result.foregroundColor} on {result.backgroundColor}. 
                        Increase contrast to at least 4.5:1 for WCAG AA compliance.
                      </TestRecommendation>
                    </TestItem>
                  ))
                }
              </TestResults>
            </TestSuiteSection>
          )}
        </AuditorContent>
      </AuditorContainer>
    </>
  );
}

export default AccessibilityAuditor;