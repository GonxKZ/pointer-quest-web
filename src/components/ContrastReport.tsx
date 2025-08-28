/**
 * Contrast Report Component
 * Displays WCAG contrast compliance information for the current theme
 */

import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { testThemeContrast, getContrastSummary, WCAG_STANDARDS } from '../utils/contrastChecker';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const ReportContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 380px;
  max-width: 400px;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  backdrop-filter: blur(10px);
  z-index: ${props => props.theme.zIndex.modal};
  animation: ${fadeIn} ${props => props.theme.animation.duration.normal} ease-out;
  font-family: ${props => props.theme.typography.fontFamily.code};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    right: 20px;
    max-width: calc(100vw - 40px);
  }
`;

const ReportHeader = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ReportTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.tertiary};
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.base};
  transition: all ${props => props.theme.animation.duration.fast};
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[500]}40;
  }
`;

const SummaryCard = styled.div<{ passRate: number }>`
  margin: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => 
    props.passRate >= 90 
      ? `${props.theme.colors.success}20` 
      : props.passRate >= 70 
      ? `${props.theme.colors.warning}20` 
      : `${props.theme.colors.error}20`
  };
  border: 1px solid ${props => 
    props.passRate >= 90 
      ? props.theme.colors.success 
      : props.passRate >= 70 
      ? props.theme.colors.warning 
      : props.theme.colors.error
  };
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[2]};
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div<{ type: 'total' | 'pass' | 'fail' }>`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => 
    props.type === 'pass' 
      ? props.theme.colors.success 
      : props.type === 'fail' 
      ? props.theme.colors.error 
      : props.theme.colors.text.primary
  };
`;

const SummaryLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing[1]};
`;

const TestsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.surface};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary[500]};
    border-radius: 3px;
  }
`;

const TestItem = styled.div<{ passes: boolean }>`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => !props.passes && `
    background: ${props.theme.colors.error}10;
    border-left: 3px solid ${props.theme.colors.error};
    margin-left: ${props.theme.spacing[1]};
    border-radius: 0 ${props.theme.borderRadius.base} ${props.theme.borderRadius.base} 0;
  `}
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const TestContext = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing[1]};
`;

const TestResult = styled.div`
  text-align: right;
  margin-left: ${props => props.theme.spacing[2]};
`;

const ContrastRatio = styled.div<{ passes: boolean }>`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.passes ? props.theme.colors.success : props.theme.colors.error};
`;

const ComplianceStatus = styled.div<{ passes: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.passes ? props.theme.colors.success : props.theme.colors.error};
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background: ${props => props.color};
  border-radius: ${props => props.theme.borderRadius.base};
  border: 1px solid ${props => props.theme.colors.border.primary};
  display: inline-block;
  margin-right: ${props => props.theme.spacing[2]};
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 80px;
  right: 20px;
  background: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.full};
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all ${props => props.theme.animation.duration.normal};
  z-index: ${props => props.theme.zIndex.docked};
  box-shadow: ${props => props.theme.shadows.md};
  
  &:hover {
    background: ${props => props.theme.colors.primary[600]};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[500]}40;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    right: 80px;
  }
`;

const WCAGInfo = styled.div`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.info}10;
  border-top: 1px solid ${props => props.theme.colors.border.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  
  h4 {
    margin: 0 0 ${props => props.theme.spacing[2]} 0;
    color: ${props => props.theme.colors.info};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
  
  ul {
    margin: 0;
    padding-left: ${props => props.theme.spacing[4]};
    
    li {
      margin: ${props => props.theme.spacing[1]} 0;
    }
  }
`;

// Component props
interface ContrastReportProps {
  defaultVisible?: boolean;
}

/**
 * Contrast Report Component
 */
export function ContrastReport({ defaultVisible = false }: ContrastReportProps) {
  const { themeName } = useTheme();
  const [isVisible, setIsVisible] = useState(defaultVisible);
  
  // Generate contrast tests for current theme
  const contrastTests = useMemo(() => {
    return testThemeContrast(themeName);
  }, [themeName]);
  
  // Calculate summary statistics
  const summary = useMemo(() => {
    return getContrastSummary(contrastTests);
  }, [contrastTests]);
  
  // Filter tests by pass/fail
  const failingTests = contrastTests.filter(test => !test.compliance.passes);
  const passingTests = contrastTests.filter(test => test.compliance.passes);
  
  if (!isVisible) {
    return (
      <ToggleButton
        onClick={() => setIsVisible(true)}
        title="Show WCAG Contrast Report"
        aria-label="Show accessibility contrast report"
      >
        🎨
      </ToggleButton>
    );
  }
  
  return (
    <>
      <ToggleButton
        onClick={() => setIsVisible(false)}
        title="Hide WCAG Contrast Report"
        aria-label="Hide accessibility contrast report"
      >
        ✕
      </ToggleButton>
      
      <ReportContainer role="dialog" aria-labelledby="contrast-report-title">
        <ReportHeader>
          <ReportTitle id="contrast-report-title">
            🎨 WCAG Contrast Report
          </ReportTitle>
          <CloseButton
            onClick={() => setIsVisible(false)}
            aria-label="Close contrast report"
          >
            ✕
          </CloseButton>
        </ReportHeader>
        
        <SummaryCard passRate={summary.passRate}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <strong>{themeName.toUpperCase()} Theme</strong>
          </div>
          <SummaryGrid>
            <SummaryItem>
              <SummaryValue type="total">{summary.total}</SummaryValue>
              <SummaryLabel>Total Tests</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue type="pass">{summary.passing}</SummaryValue>
              <SummaryLabel>Passing</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue type="fail">{summary.failing}</SummaryValue>
              <SummaryLabel>Failing</SummaryLabel>
            </SummaryItem>
          </SummaryGrid>
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '18px', fontWeight: 'bold' }}>
            {summary.passRate}% Compliant
          </div>
        </SummaryCard>
        
        <TestsList>
          {/* Show failing tests first */}
          {failingTests.map((test, index) => (
            <TestItem key={`fail-${index}`} passes={false}>
              <TestInfo>
                <TestName>❌ {test.name}</TestName>
                <TestContext>{test.context}</TestContext>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                  <ColorSwatch color={test.foreground} />
                  <span style={{ fontSize: '10px' }}>on</span>
                  <ColorSwatch color={test.background} />
                </div>
              </TestInfo>
              <TestResult>
                <ContrastRatio passes={false}>
                  {test.ratio.toFixed(2)}:1
                </ContrastRatio>
                <ComplianceStatus passes={false}>
                  needs {test.compliance.required}:1
                </ComplianceStatus>
              </TestResult>
            </TestItem>
          ))}
          
          {/* Show passing tests */}
          {passingTests.map((test, index) => (
            <TestItem key={`pass-${index}`} passes={true}>
              <TestInfo>
                <TestName>✅ {test.name}</TestName>
                <TestContext>{test.context}</TestContext>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                  <ColorSwatch color={test.foreground} />
                  <span style={{ fontSize: '10px' }}>on</span>
                  <ColorSwatch color={test.background} />
                </div>
              </TestInfo>
              <TestResult>
                <ContrastRatio passes={true}>
                  {test.ratio.toFixed(2)}:1
                </ContrastRatio>
                <ComplianceStatus passes={true}>
                  WCAG AA ✓
                </ComplianceStatus>
              </TestResult>
            </TestItem>
          ))}
        </TestsList>
        
        <WCAGInfo>
          <h4>WCAG 2.1 Guidelines</h4>
          <ul>
            <li><strong>AA Normal Text:</strong> {WCAG_STANDARDS.AA_NORMAL}:1 minimum</li>
            <li><strong>AA Large Text:</strong> {WCAG_STANDARDS.AA_LARGE}:1 minimum</li>
            <li><strong>AAA Enhanced:</strong> {WCAG_STANDARDS.AAA_NORMAL}:1 / {WCAG_STANDARDS.AAA_LARGE}:1</li>
          </ul>
        </WCAGInfo>
      </ReportContainer>
    </>
  );
}

export default ContrastReport;