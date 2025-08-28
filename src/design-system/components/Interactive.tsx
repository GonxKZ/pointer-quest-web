/**
 * Pointer Quest Design System - Interactive Components
 * 
 * Specialized interactive components for educational lesson interactions.
 * Provides consistent UX patterns for coding exercises, visualizations, and learning activities.
 */

import React, { useState, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme, LessonTopic, mediaQuery } from '../theme';
import { Button, ButtonGroup, LessonActionButton, CodeActionButton } from './Button';

// Animation for interactive elements
const highlightPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 212, 255, 0);
  }
`;

const slideInUp = keyframes`
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Interactive Section Container
export const InteractiveSection = styled.div<{ topic?: LessonTopic }>`
  background: ${theme.colors.background.tertiary};
  border: 2px solid ${props => props.topic ? `${theme.colors.topics[props.topic]?.primary}40` : 'rgba(0, 212, 255, 0.3)'};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  margin: ${theme.spacing[4]} 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, 
      ${props => props.topic ? theme.colors.topics[props.topic]?.primary : theme.colors.primary[500]}, 
      transparent, 
      ${props => props.topic ? theme.colors.topics[props.topic]?.secondary : theme.colors.secondary[500]}
    );
    border-radius: ${theme.borderRadius.lg};
    z-index: -1;
    opacity: 0.3;
  }
  
  ${mediaQuery.down('md')} {
    padding: ${theme.spacing[4]};
  }
`;

// Interactive Controls Grid
export const InteractiveControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[3]};
  margin: ${theme.spacing[4]} 0;
  
  ${mediaQuery.down('md')} {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[2]};
  }
`;

// Step-by-step Exercise Component
interface StepExerciseProps {
  steps: Array<{
    title: string;
    description: string;
    action?: () => void;
    actionLabel?: string;
    completed?: boolean;
    disabled?: boolean;
  }>;
  currentStep: number;
  onStepComplete?: (step: number) => void;
  topic?: LessonTopic;
}

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const StepItem = styled.div<{ active?: boolean; completed?: boolean; topic?: LessonTopic }>`
  background: ${props => props.active ? theme.colors.background.glass : theme.colors.background.secondary};
  border: 1px solid ${props => {
    if (props.completed) return theme.colors.success;
    if (props.active && props.topic) return theme.colors.topics[props.topic]?.primary;
    if (props.active) return theme.colors.primary[500];
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  position: relative;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  animation: ${props => props.active ? slideInUp : 'none'} ${theme.animation.duration.normal};
  
  ${props => props.active && css`
    animation: ${highlightPulse} 2s infinite;
  `}
  
  ${props => props.completed && css`
    opacity: 0.8;
    
    &::after {
      content: '✓';
      position: absolute;
      top: ${theme.spacing[2]};
      right: ${theme.spacing[3]};
      color: ${theme.colors.success};
      font-size: ${theme.typography.fontSize.xl};
      font-weight: ${theme.typography.fontWeight.bold};
    }
  `}
`;

const StepNumber = styled.div<{ active?: boolean; completed?: boolean; topic?: LessonTopic }>`
  position: absolute;
  left: -15px;
  top: ${theme.spacing[2]};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => {
    if (props.completed) return theme.colors.success;
    if (props.active && props.topic) return theme.colors.topics[props.topic]?.primary;
    if (props.active) return theme.colors.primary[500];
    return theme.colors.gray[600];
  }};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  font-family: ${theme.typography.fontFamily.code};
`;

const StepTitle = styled.h4`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0 0 ${theme.spacing[2]} 0;
  padding-left: ${theme.spacing[4]};
`;

const StepDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin: 0 0 ${theme.spacing[3]} 0;
  padding-left: ${theme.spacing[4]};
`;

const StepActions = styled.div`
  padding-left: ${theme.spacing[4]};
  display: flex;
  gap: ${theme.spacing[2]};
  align-items: center;
`;

export const StepExercise: React.FC<StepExerciseProps> = ({
  steps,
  currentStep,
  onStepComplete,
  topic
}) => {
  return (
    <StepContainer>
      {steps.map((step, index) => (
        <StepItem
          key={index}
          active={index === currentStep}
          completed={step.completed}
          topic={topic}
        >
          <StepNumber
            active={index === currentStep}
            completed={step.completed}
            topic={topic}
          >
            {step.completed ? '✓' : index + 1}
          </StepNumber>
          
          <StepTitle>{step.title}</StepTitle>
          <StepDescription>{step.description}</StepDescription>
          
          {step.action && (
            <StepActions>
              <LessonActionButton
                onClick={() => {
                  step.action?.();
                  onStepComplete?.(index);
                }}
                disabled={step.disabled || index !== currentStep}
                variant={step.completed ? 'success' : 'primary'}
              >
                {step.actionLabel || 'Execute'}
              </LessonActionButton>
            </StepActions>
          )}
        </StepItem>
      ))}
    </StepContainer>
  );
};

// Code Execution Playground
interface CodePlaygroundProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onExecute?: (code: string) => void;
  executionResult?: string;
  isExecuting?: boolean;
  language?: string;
  topic?: LessonTopic;
}

const PlaygroundContainer = styled.div`
  background: ${theme.colors.background.code};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PlaygroundHeader = styled.div<{ topic?: LessonTopic }>`
  background: ${props => props.topic ? `${theme.colors.topics[props.topic]?.primary}20` : 'rgba(0, 212, 255, 0.1)'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PlaygroundTitle = styled.h4`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  &::before {
    content: '💻';
  }
`;

const CodeEditor = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${theme.spacing[4]};
  background: transparent;
  border: none;
  color: ${theme.colors.text.code};
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.sm};
  line-height: 1.5;
  resize: vertical;
  outline: none;
  
  &:focus {
    background: rgba(0, 212, 255, 0.05);
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;

const ResultContainer = styled.div<{ hasError?: boolean }>`
  background: ${props => props.hasError ? 'rgba(255, 107, 107, 0.1)' : 'rgba(0, 255, 136, 0.1)'};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => props.hasError ? theme.colors.error : theme.colors.success};
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  
  &:empty::before {
    content: 'Output will appear here...';
    color: ${theme.colors.text.muted};
    font-style: italic;
  }
`;

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode = '',
  onCodeChange,
  onExecute,
  executionResult = '',
  isExecuting = false,
  language = 'cpp',
  topic
}) => {
  const [code, setCode] = useState(initialCode);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    onCodeChange?.(value);
  }, [onCodeChange]);

  const handleExecute = useCallback(() => {
    onExecute?.(code);
  }, [code, onExecute]);

  return (
    <PlaygroundContainer>
      <PlaygroundHeader topic={topic}>
        <PlaygroundTitle>
          Code Playground ({language.toUpperCase()})
        </PlaygroundTitle>
        
        <ButtonGroup spacing={2}>
          <CodeActionButton
            onClick={handleExecute}
            disabled={isExecuting}
            isLoading={isExecuting}
            variant="primary"
          >
            {isExecuting ? 'Running...' : 'Run Code'}
          </CodeActionButton>
          
          <CodeActionButton
            onClick={() => handleCodeChange('')}
            variant="outline"
          >
            Clear
          </CodeActionButton>
        </ButtonGroup>
      </PlaygroundHeader>
      
      <CodeEditor
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        placeholder={`// Write your ${language.toUpperCase()} code here...\n#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}`}
      />
      
      {(executionResult || isExecuting) && (
        <ResultContainer hasError={executionResult.toLowerCase().includes('error')}>
          {isExecuting ? 'Executing code...' : executionResult}
        </ResultContainer>
      )}
    </PlaygroundContainer>
  );
};

// Memory State Visualizer Controls
interface MemoryVisualizerControlsProps {
  onReset?: () => void;
  onStep?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
  currentStep?: number;
  totalSteps?: number;
  topic?: LessonTopic;
}

const VisualizerControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing[3]};
  background: ${theme.colors.background.dark};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  
  ${mediaQuery.down('md')} {
    flex-direction: column;
    gap: ${theme.spacing[2]};
  }
`;

export const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const StepProgress = styled.div<{ progress: number; topic?: LessonTopic }>`
  width: 150px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background: ${props => props.topic ? theme.colors.topics[props.topic]?.primary : theme.colors.primary[500]};
    transition: width ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  }
`;

export const MemoryVisualizerControls: React.FC<MemoryVisualizerControlsProps> = ({
  onReset,
  onStep,
  onPlay,
  onPause,
  isPlaying = false,
  currentStep = 0,
  totalSteps = 1,
  topic
}) => {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <VisualizerControls>
      <ButtonGroup spacing={2}>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          title="Reset visualization"
        >
          ↻ Reset
        </Button>
        
        <Button
          onClick={onStep}
          variant="secondary"
          size="sm"
          disabled={isPlaying}
          title="Step forward"
        >
          ⏭️ Step
        </Button>
        
        <Button
          onClick={isPlaying ? onPause : onPlay}
          variant="primary"
          size="sm"
          title={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </Button>
      </ButtonGroup>
      
      <StepIndicator>
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <StepProgress progress={progress} topic={topic} />
      </StepIndicator>
    </VisualizerControls>
  );
};

// Learning Objective Checklist
interface LearningObjective {
  id: string;
  objective: string;
  completed: boolean;
  description?: string;
}

interface LearningObjectivesProps {
  objectives: LearningObjective[];
  onToggleObjective?: (id: string) => void;
  topic?: LessonTopic;
}

const ObjectivesList = styled.div`
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ObjectiveItem = styled.div<{ completed: boolean; topic?: LessonTopic }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]} 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut};
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.completed && css`
    opacity: 0.7;
  `}
`;

const ObjectiveCheckbox = styled.button<{ completed: boolean; topic?: LessonTopic }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.completed 
    ? theme.colors.success 
    : (props.topic ? theme.colors.topics[props.topic]?.primary : theme.colors.primary[500])
  };
  background: ${props => props.completed ? theme.colors.success : 'transparent'};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:focus {
    outline: 2px solid ${props => props.topic ? theme.colors.topics[props.topic]?.primary : theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const ObjectiveContent = styled.div`
  flex: 1;
`;

const ObjectiveTitle = styled.h5<{ completed: boolean }>`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  margin: 0 0 ${theme.spacing[1]} 0;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
`;

const ObjectiveDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin: 0;
`;

export const LearningObjectives: React.FC<LearningObjectivesProps> = ({
  objectives,
  onToggleObjective,
  topic
}) => {
  return (
    <ObjectivesList>
      <h4 style={{ 
        color: theme.colors.text.primary, 
        margin: `0 0 ${theme.spacing[4]} 0`,
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold
      }}>
        🎯 Learning Objectives
      </h4>
      
      {objectives.map((objective) => (
        <ObjectiveItem key={objective.id} completed={objective.completed} topic={topic}>
          <ObjectiveCheckbox
            completed={objective.completed}
            topic={topic}
            onClick={() => onToggleObjective?.(objective.id)}
            aria-label={`Mark "${objective.objective}" as ${objective.completed ? 'incomplete' : 'complete'}`}
          >
            {objective.completed && '✓'}
          </ObjectiveCheckbox>
          
          <ObjectiveContent>
            <ObjectiveTitle completed={objective.completed}>
              {objective.objective}
            </ObjectiveTitle>
            {objective.description && (
              <ObjectiveDescription>
                {objective.description}
              </ObjectiveDescription>
            )}
          </ObjectiveContent>
        </ObjectiveItem>
      ))}
    </ObjectivesList>
  );
};

