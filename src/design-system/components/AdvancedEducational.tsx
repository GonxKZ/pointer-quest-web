/**
 * Pointer Quest Design System - Advanced Educational Components
 * 
 * Specialized components for advanced C++ concepts (Lessons 61-120).
 * Handles complex topics like UB, atomics, PMR, and performance optimization.
 */

import React, { ReactNode, useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme, LessonTopic, LessonDifficulty, mediaQuery } from '../theme';
import { Button, ButtonGroup } from './Button';
import { CodeBlockComponent, InlineCode } from './CodeBlock';

// Danger zone animation for undefined behavior lessons
const dangerPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
    border-color: ${theme.colors.error};
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 68, 68, 0);
    border-color: ${theme.colors.topics.advanced.danger};
  }
`;

const warningFlash = keyframes`
  0%, 100% { background-color: rgba(255, 202, 40, 0.1); }
  50% { background-color: rgba(255, 202, 40, 0.3); }
`;

// Undefined Behavior Warning Component
interface UndefinedBehaviorWarningProps {
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  codeExample?: string;
  consequences?: string[];
  children?: ReactNode;
}

const UBWarningContainer = styled.div<{ severity: string }>`
  background: ${props => {
    switch (props.severity) {
      case 'extreme': return 'rgba(204, 0, 0, 0.15)';
      case 'high': return 'rgba(255, 68, 68, 0.15)';
      case 'medium': return 'rgba(255, 107, 107, 0.15)';
      default: return 'rgba(255, 152, 152, 0.15)';
    }
  }};
  border: 2px solid ${props => {
    switch (props.severity) {
      case 'extreme': return theme.colors.topics.advanced.danger;
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.topics.advanced.warning;
      default: return theme.colors.warning;
    }
  }};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  margin: ${theme.spacing[4]} 0;
  position: relative;
  
  ${props => props.severity === 'extreme' && css`
    animation: ${dangerPulse} 3s infinite;
  `}
  
  ${props => props.severity === 'high' && css`
    animation: ${warningFlash} 2s infinite;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, 
      ${props => {
        switch (props.severity) {
          case 'extreme': return `${theme.colors.topics.advanced.danger}, transparent, ${theme.colors.error}`;
          case 'high': return `${theme.colors.error}, transparent, ${theme.colors.topics.advanced.warning}`;
          case 'medium': return `${theme.colors.topics.advanced.warning}, transparent, ${theme.colors.warning}`;
          default: return `${theme.colors.warning}, transparent, ${theme.colors.topics.advanced.accent}`;
        }
      }}
    );
    border-radius: ${theme.borderRadius.lg};
    z-index: -1;
    opacity: 0.6;
  }
`;

const UBWarningHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`;

const UBWarningIcon = styled.div<{ severity: string }>`
  font-size: ${theme.typography.fontSize['2xl']};
  
  &::before {
    content: ${props => {
      switch (props.severity) {
        case 'extreme': return '"🚨"';
        case 'high': return '"⚠️"';
        case 'medium': return '"⚡"';
        default: return '"ℹ️"';
      }
    }};
  }
`;

const UBWarningTitle = styled.h4`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;

const UBWarningContent = styled.div`
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
  font-size: ${theme.typography.fontSize.base};
`;

const ConsequencesList = styled.ul`
  margin: ${theme.spacing[4]} 0;
  padding-left: ${theme.spacing[6]};
  
  li {
    margin-bottom: ${theme.spacing[2]};
    color: ${theme.colors.text.secondary};
    
    strong {
      color: ${theme.colors.error};
    }
  }
`;

export const UndefinedBehaviorWarning: React.FC<UndefinedBehaviorWarningProps> = ({
  severity,
  title,
  description,
  codeExample,
  consequences = [],
  children
}) => {
  return (
    <UBWarningContainer severity={severity}>
      <UBWarningHeader>
        <UBWarningIcon severity={severity} />
        <div>
          <UBWarningTitle>{title}</UBWarningTitle>
          <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.muted }}>
            Severity: {severity.toUpperCase()}
          </div>
        </div>
      </UBWarningHeader>
      
      <UBWarningContent>
        <p>{description}</p>
        
        {codeExample && (
          <CodeBlockComponent
            language="cpp"
            title="⚠️ Problematic Code Example"
          >
            {codeExample}
          </CodeBlockComponent>
        )}
        
        {consequences.length > 0 && (
          <>
            <h5 style={{ color: theme.colors.error, margin: `${theme.spacing[4]} 0 ${theme.spacing[2]} 0` }}>
              Potential Consequences:
            </h5>
            <ConsequencesList>
              {consequences.map((consequence, index) => (
                <li key={index}>{consequence}</li>
              ))}
            </ConsequencesList>
          </>
        )}
        
        {children}
      </UBWarningContent>
    </UBWarningContainer>
  );
};

// Performance Comparison Component
interface PerformanceComparisonProps {
  title: string;
  approaches: Array<{
    name: string;
    code: string;
    performance: 'slow' | 'medium' | 'fast' | 'optimal';
    description: string;
    metrics?: {
      time?: string;
      memory?: string;
      cacheMisses?: number;
    };
  }>;
  onRunBenchmark?: (approachIndex: number) => void;
  benchmarkResults?: Array<{
    time: number;
    memory: number;
    score: number;
  }>;
}

const ComparisonContainer = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.topics.performance.primary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  margin: ${theme.spacing[4]} 0;
`;

const ComparisonTitle = styled.h4`
  color: ${theme.colors.topics.performance.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0 0 ${theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  &::before {
    content: '⚡';
  }
`;

const ApproachesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${theme.spacing[4]};
  
  ${mediaQuery.down('md')} {
    grid-template-columns: 1fr;
  }
`;

const ApproachCard = styled.div<{ performance: string }>`
  background: ${theme.colors.background.tertiary};
  border: 2px solid ${props => {
    switch (props.performance) {
      case 'optimal': return theme.colors.topics.performance.fast;
      case 'fast': return theme.colors.topics.performance.primary;
      case 'medium': return theme.colors.warning;
      default: return theme.colors.topics.performance.slow;
    }
  }};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  position: relative;
`;

const PerformanceBadge = styled.div<{ performance: string }>`
  position: absolute;
  top: ${theme.spacing[2]};
  right: ${theme.spacing[2]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  background: ${props => {
    switch (props.performance) {
      case 'optimal': return theme.colors.topics.performance.fast;
      case 'fast': return theme.colors.topics.performance.primary;
      case 'medium': return theme.colors.warning;
      default: return theme.colors.topics.performance.slow;
    }
  }};
  color: ${props => props.performance === 'medium' ? theme.colors.gray[900] : theme.colors.text.primary};
`;

const ApproachName = styled.h5`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0 0 ${theme.spacing[3]} 0;
`;

const MetricsDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing[2]};
  margin: ${theme.spacing[3]} 0;
  padding: ${theme.spacing[2]};
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.sm};
`;

const MetricItem = styled.div`
  text-align: center;
  color: ${theme.colors.text.secondary};
  
  .metric-value {
    display: block;
    color: ${theme.colors.topics.performance.primary};
    font-weight: ${theme.typography.fontWeight.bold};
  }
`;

export const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({
  title,
  approaches,
  onRunBenchmark,
  benchmarkResults = []
}) => {
  return (
    <ComparisonContainer>
      <ComparisonTitle>{title}</ComparisonTitle>
      
      <ApproachesGrid>
        {approaches.map((approach, index) => (
          <ApproachCard key={index} performance={approach.performance}>
            <PerformanceBadge performance={approach.performance}>
              {approach.performance}
            </PerformanceBadge>
            
            <ApproachName>{approach.name}</ApproachName>
            
            <p style={{ 
              color: theme.colors.text.secondary, 
              fontSize: theme.typography.fontSize.sm,
              lineHeight: theme.typography.lineHeight.relaxed,
              margin: `0 0 ${theme.spacing[3]} 0`
            }}>
              {approach.description}
            </p>
            
            <CodeBlockComponent
              language="cpp"
              showLineNumbers={false}
              copyable={false}
              maxHeight="200px"
            >
              {approach.code}
            </CodeBlockComponent>
            
            {approach.metrics && (
              <MetricsDisplay>
                {approach.metrics.time && (
                  <MetricItem>
                    <span className="metric-value">{approach.metrics.time}</span>
                    <span>Time</span>
                  </MetricItem>
                )}
                {approach.metrics.memory && (
                  <MetricItem>
                    <span className="metric-value">{approach.metrics.memory}</span>
                    <span>Memory</span>
                  </MetricItem>
                )}
                {approach.metrics.cacheMisses !== undefined && (
                  <MetricItem>
                    <span className="metric-value">{approach.metrics.cacheMisses}</span>
                    <span>Cache Misses</span>
                  </MetricItem>
                )}
              </MetricsDisplay>
            )}
            
            {onRunBenchmark && (
              <Button
                onClick={() => onRunBenchmark(index)}
                variant="outline"
                size="sm"
                style={{ marginTop: theme.spacing[2] }}
              >
                🏃‍♂️ Benchmark This
              </Button>
            )}
            
            {benchmarkResults[index] && (
              <div style={{
                marginTop: theme.spacing[3],
                padding: theme.spacing[2],
                background: 'rgba(72, 187, 120, 0.1)',
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.code
              }}>
                <div>⏱️ {benchmarkResults[index]?.time}ms</div>
                <div>💾 {benchmarkResults[index]?.memory}KB</div>
                <div>🏆 Score: {benchmarkResults[index]?.score}/100</div>
              </div>
            )}
          </ApproachCard>
        ))}
      </ApproachesGrid>
    </ComparisonContainer>
  );
};

// Memory Layout Visualizer for advanced alignment concepts
interface MemoryLayoutVisualizerProps {
  title: string;
  structures: Array<{
    name: string;
    members: Array<{
      name: string;
      type: string;
      size: number;
      offset: number;
      padding?: number;
    }>;
    totalSize: number;
    alignment: number;
  }>;
  showPadding?: boolean;
  showAlignment?: boolean;
}

const LayoutContainer = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.topics.memory.primary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  margin: ${theme.spacing[4]} 0;
`;

const LayoutTitle = styled.h4`
  color: ${theme.colors.topics.memory.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0 0 ${theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  &::before {
    content: '🧱';
  }
`;

const StructureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${theme.spacing[4]};
  
  ${mediaQuery.down('md')} {
    grid-template-columns: 1fr;
  }
`;

const StructureCard = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
`;

const StructureName = styled.h5`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0 0 ${theme.spacing[3]} 0;
  font-family: ${theme.typography.fontFamily.code};
`;

const MemoryBlock = styled.div<{ size: number; isPadding?: boolean }>`
  height: ${props => Math.max(20, props.size * 4)}px;
  background: ${props => props.isPadding ? 
    'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 5px, transparent 5px, transparent 10px)' :
    theme.colors.topics.memory.primary
  };
  border: 1px solid ${props => props.isPadding ? 'rgba(255, 255, 255, 0.3)' : theme.colors.topics.memory.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.primary};
  position: relative;
  margin: 1px 0;
`;

const OffsetLabel = styled.div`
  position: absolute;
  left: -40px;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.muted};
  font-family: ${theme.typography.fontFamily.code};
`;

const StructureInfo = styled.div`
  margin-top: ${theme.spacing[3]};
  padding: ${theme.spacing[2]};
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[1]};
  }
  
  .highlight {
    color: ${theme.colors.topics.memory.primary};
    font-weight: ${theme.typography.fontWeight.bold};
  }
`;

export const MemoryLayoutVisualizer: React.FC<MemoryLayoutVisualizerProps> = ({
  title,
  structures,
  showPadding = true,
  showAlignment = true
}) => {
  return (
    <LayoutContainer>
      <LayoutTitle>{title}</LayoutTitle>
      
      <StructureGrid>
        {structures.map((structure, index) => (
          <StructureCard key={index}>
            <StructureName>struct {structure.name}</StructureName>
            
            <div style={{ position: 'relative', paddingLeft: '50px' }}>
              {structure.members.map((member, memberIndex) => (
                <React.Fragment key={memberIndex}>
                  <MemoryBlock size={member.size}>
                    <OffsetLabel>{member.offset}</OffsetLabel>
                    {member.name}: {member.type} ({member.size}B)
                  </MemoryBlock>
                  
                  {showPadding && member.padding && member.padding > 0 && (
                    <MemoryBlock size={member.padding} isPadding>
                      <OffsetLabel>{member.offset + member.size}</OffsetLabel>
                      padding ({member.padding}B)
                    </MemoryBlock>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <StructureInfo>
              <div className="info-row">
                <span>Total Size:</span>
                <span className="highlight">{structure.totalSize} bytes</span>
              </div>
              {showAlignment && (
                <div className="info-row">
                  <span>Alignment:</span>
                  <span className="highlight">{structure.alignment} bytes</span>
                </div>
              )}
              <div className="info-row">
                <span>Memory Efficiency:</span>
                <span className="highlight">
                  {Math.round((structure.members.reduce((sum, m) => sum + m.size, 0) / structure.totalSize) * 100)}%
                </span>
              </div>
            </StructureInfo>
          </StructureCard>
        ))}
      </StructureGrid>
    </LayoutContainer>
  );
};

// Atomic Operations Visualizer
interface AtomicOperationDemoProps {
  title: string;
  operations: Array<{
    name: string;
    code: string;
    description: string;
    isAtomic: boolean;
    memoryOrdering?: string;
  }>;
  onExecuteOperation?: (operationIndex: number) => void;
}

const AtomicContainer = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.topics.atomic.primary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  margin: ${theme.spacing[4]} 0;
`;

const AtomicTitle = styled.h4`
  color: ${theme.colors.topics.atomic.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0 0 ${theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  &::before {
    content: '⚛️';
  }
`;

const OperationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${theme.spacing[4]};
  
  ${mediaQuery.down('md')} {
    grid-template-columns: 1fr;
  }
`;

const OperationCard = styled.div<{ isAtomic: boolean }>`
  background: ${theme.colors.background.tertiary};
  border: 2px solid ${props => props.isAtomic ? 
    theme.colors.topics.atomic.primary : 
    theme.colors.topics.advanced.warning
  };
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  position: relative;
`;

const AtomicBadge = styled.div<{ isAtomic: boolean }>`
  position: absolute;
  top: ${theme.spacing[2]};
  right: ${theme.spacing[2]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  background: ${props => props.isAtomic ? 
    theme.colors.topics.atomic.primary : 
    theme.colors.topics.advanced.warning
  };
  color: ${props => props.isAtomic ? 
    theme.colors.text.primary : 
    theme.colors.gray[900]
  };
`;

export const AtomicOperationDemo: React.FC<AtomicOperationDemoProps> = ({
  title,
  operations,
  onExecuteOperation
}) => {
  return (
    <AtomicContainer>
      <AtomicTitle>{title}</AtomicTitle>
      
      <OperationGrid>
        {operations.map((operation, index) => (
          <OperationCard key={index} isAtomic={operation.isAtomic}>
            <AtomicBadge isAtomic={operation.isAtomic}>
              {operation.isAtomic ? 'Atomic' : 'Non-Atomic'}
            </AtomicBadge>
            
            <h5 style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              margin: `0 0 ${theme.spacing[3]} 0`
            }}>
              {operation.name}
            </h5>
            
            <p style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
              lineHeight: theme.typography.lineHeight.relaxed,
              margin: `0 0 ${theme.spacing[3]} 0`
            }}>
              {operation.description}
            </p>
            
            {operation.memoryOrdering && (
              <div style={{
                padding: theme.spacing[2],
                background: 'rgba(159, 122, 234, 0.1)',
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.topics.atomic.primary,
                margin: `0 0 ${theme.spacing[3]} 0`,
                fontFamily: theme.typography.fontFamily.code
              }}>
                Memory Ordering: {operation.memoryOrdering}
              </div>
            )}
            
            <CodeBlockComponent
              language="cpp"
              showLineNumbers={false}
              copyable={false}
              maxHeight="150px"
            >
              {operation.code}
            </CodeBlockComponent>
            
            {onExecuteOperation && (
              <Button
                onClick={() => onExecuteOperation(index)}
                variant={operation.isAtomic ? 'primary' : 'warning'}
                size="sm"
                style={{ marginTop: theme.spacing[2] }}
              >
                ⚡ Execute Operation
              </Button>
            )}
          </OperationCard>
        ))}
      </OperationGrid>
    </AtomicContainer>
  );
};

export default {
  UndefinedBehaviorWarning,
  PerformanceComparison,
  MemoryLayoutVisualizer,
  AtomicOperationDemo
};