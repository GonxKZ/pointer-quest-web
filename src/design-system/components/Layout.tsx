/**
 * Pointer Quest Design System - Layout Components
 * 
 * Standardized layout components for consistent lesson structure across all components.
 * Provides responsive, accessible, and cohesive educational experience.
 */

import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { theme, mediaQuery, LessonTopic, LessonDifficulty, getLessonTopic, getDifficultyColor, getTopicName } from '../theme';
import { NavigationButton } from './Button';

// Base layout props
interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
}

// Layout type definitions
export type LayoutType = 'two-panel' | 'three-panel' | 'full-screen' | 'mobile-stack';

// Enhanced lesson-specific layout props
export interface LessonLayoutProps extends BaseLayoutProps {
  title: string;
  subtitle?: string;
  lessonNumber: number;
  lessonId?: string;
  topic?: LessonTopic;
  difficulty?: LessonDifficulty;
  progress?: number;
  layoutType?: LayoutType;
  showProgress?: boolean;
  showNavigation?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  estimatedTime?: number; // in minutes
  prerequisites?: number[]; // lesson numbers
}

// Base container styles
const BaseContainer = css`
  min-height: 100vh;
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.primary};
  position: relative;
`;

// Dynamic container selector
const LessonContainer = styled.div<{ layoutType: LayoutType }>`
  ${props => {
    switch (props.layoutType) {
      case 'three-panel':
        return css`
          ${BaseContainer}
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: ${theme.spacing[3]};
          padding: ${theme.spacing[4]};
          
          ${mediaQuery.down('xl')} {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto 1fr 1fr;
          }
          
          ${mediaQuery.down('lg')} {
            grid-template-columns: 1fr;
            gap: ${theme.spacing[2]};
            padding: ${theme.spacing[2]};
          }
        `;
      
      case 'full-screen':
        return css`
          ${BaseContainer}
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
        `;
      
      case 'mobile-stack':
        return css`
          ${BaseContainer}
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing[3]};
          padding: ${theme.spacing[3]};
          
          ${mediaQuery.up('md')} {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto 1fr;
          }
        `;
      
      default: // 'two-panel'
        return css`
          ${BaseContainer}
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${theme.spacing[4]};
          padding: ${theme.spacing[4]};
          
          ${mediaQuery.down('lg')} {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
          }
          
          ${mediaQuery.down('md')} {
            gap: ${theme.spacing[2]};
            padding: ${theme.spacing[2]};
          }
        `;
    }
  }}
`;

// Panel base styles with topic theming
const PanelBase = css<{ topic?: LessonTopic }>`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${props => props.topic ? `${theme.colors.topics[props.topic]?.primary}40` : 'rgba(0, 212, 255, 0.3)'};
  border-radius: ${theme.borderRadius['2xl']};
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${props => props.topic ? theme.colors.topics[props.topic]?.primary : theme.colors.primary[500]}, transparent);
    opacity: 0.8;
  }
`;

// Theory panel for educational content
export const TheoryPanel = styled.div<{ scrollable?: boolean; topic?: LessonTopic }>`
  ${PanelBase}
  padding: ${theme.spacing[8]};
  overflow-y: ${props => props.scrollable !== false ? 'auto' : 'hidden'};
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${theme.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.topic ? theme.colors.topics[props.topic]?.primary : theme.colors.primary[500]};
    border-radius: ${theme.borderRadius.full};
    
    &:hover {
      background: ${props => props.topic ? theme.colors.topics[props.topic]?.secondary : theme.colors.primary[400]};
    }
  }
  
  ${mediaQuery.down('md')} {
    padding: ${theme.spacing[4]};
  }
`;

// Visualization panel for 3D content
export const VisualizationPanel = styled.div<{ topic?: LessonTopic }>`
  ${PanelBase}
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// Code panel for three-panel layouts
export const CodePanel = styled.div<{ topic?: LessonTopic }>`
  ${PanelBase}
  padding: ${theme.spacing[4]};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  ${mediaQuery.down('md')} {
    padding: ${theme.spacing[2]};
  }
`;

// Header section for lessons
const LessonHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[8]};
  gap: ${theme.spacing[4]};
  
  ${mediaQuery.down('md')} {
    flex-direction: column;
    gap: ${theme.spacing[2]};
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const LessonTitle = styled.h1<{ topic?: LessonTopic }>`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.extrabold};
  color: ${props => props.topic ? theme.colors.topics[props.topic]?.primary : theme.colors.primary[500]};
  margin: 0 0 ${theme.spacing[2]} 0;
  text-shadow: 0 0 20px ${props => props.topic ? theme.colors.topics[props.topic]?.primary : theme.colors.primary[500]};
  line-height: ${theme.typography.lineHeight.tight};
  
  ${mediaQuery.down('md')} {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const LessonSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const LessonMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
  align-items: flex-end;
  
  ${mediaQuery.down('md')} {
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
`;

const DifficultyBadge = styled.span<{ difficulty: LessonDifficulty }>`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
  background: ${props => getDifficultyColor(props.difficulty)};
  color: ${props => 
    props.difficulty === 'Intermediate' ? theme.colors.gray[900] : theme.colors.text.primary
  };
`;

// Topic badge for showing lesson category
const TopicBadge = styled.span<{ topic: LessonTopic }>`
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => theme.colors.topics[props.topic]?.primary};
  color: ${theme.colors.text.primary};
  opacity: 0.8;
`;

// Time estimate badge
const TimeEstimateBadge = styled.span`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.muted};
  background: ${theme.colors.background.glass};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  
  &::before {
    content: '⏱️';
  }
`;

const LessonNumber = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  font-family: ${theme.typography.fontFamily.code};
`;

// Progress indicator
const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const ProgressBar = styled.div<{ progress: number; topic?: LessonTopic }>`
  width: 100px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, 
      ${props => props.topic ? theme.colors.topics[props.topic]?.primary : theme.colors.primary[500]}, 
      ${props => props.topic ? theme.colors.topics[props.topic]?.secondary : theme.colors.secondary[500]}
    );
    border-radius: ${theme.borderRadius.full};
    transition: width ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  }
`;

// Prerequisites section
const PrerequisitesSection = styled.div`
  background: rgba(255, 202, 40, 0.1);
  border: 1px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  
  strong {
    color: ${theme.colors.warning};
  }
`;

const ProgressText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.code};
`;

// Section components for organizing content
export const Section = styled.section`
  margin-bottom: ${theme.spacing[8]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.secondary[500]};
  margin: 0 0 ${theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  ${mediaQuery.down('md')} {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

export const SectionContent = styled.div`
  padding: ${theme.spacing[4]};
  background: ${theme.colors.background.tertiary};
  border-left: 4px solid ${theme.colors.primary[500]};
  border-radius: ${theme.borderRadius.lg};
  line-height: ${theme.typography.lineHeight.relaxed};
  
  p {
    margin: 0 0 ${theme.spacing[4]} 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin: ${theme.spacing[2]} 0;
    padding-left: ${theme.spacing[6]};
    
    li {
      margin-bottom: ${theme.spacing[1]};
      color: ${theme.colors.text.secondary};
      
      strong {
        color: ${theme.colors.text.primary};
      }
    }
  }
  
  code {
    background: ${theme.colors.background.code};
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.sm};
    font-family: ${theme.typography.fontFamily.code};
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.text.code};
  }
`;

// Status display for visualization panel
export const StatusDisplay = styled.div`
  position: absolute;
  top: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  background: ${theme.colors.background.dark};
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.text.primary};
  z-index: ${theme.zIndex.docked};
  font-family: ${theme.typography.fontFamily.code};
  font-size: ${theme.typography.fontSize.sm};
  min-width: 200px;
  
  ${mediaQuery.down('md')} {
    position: relative;
    top: auto;
    right: auto;
    margin: ${theme.spacing[2]};
  }
`;

// Interactive section for buttons and controls
export const InteractiveSection = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;
  margin: ${theme.spacing[6]} 0;
  
  ${mediaQuery.down('md')} {
    gap: ${theme.spacing[2]};
  }
`;

// Navigation controls
export const NavigationControls = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing[4]};
  
  ${mediaQuery.down('md')} {
    flex-direction: column;
    gap: ${theme.spacing[2]};
  }
`;

// Main lesson layout component
export const LessonLayout: React.FC<LessonLayoutProps> = ({
  children,
  title,
  subtitle,
  lessonNumber,
  lessonId,
  topic,
  difficulty = 'Beginner',
  progress = 0,
  layoutType = 'two-panel',
  showProgress = true,
  showNavigation = true,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
  estimatedTime,
  prerequisites = [],
  className
}) => {
  // Auto-determine topic if not provided
  const lessonTopic = topic || getLessonTopic(lessonNumber);
  
  return (
    <LessonContainer layoutType={layoutType} className={className}>
      <TheoryPanel topic={lessonTopic}>
        <LessonHeader>
          <TitleSection>
            <LessonTitle topic={lessonTopic}>{title}</LessonTitle>
            {subtitle && <LessonSubtitle>{subtitle}</LessonSubtitle>}
          </TitleSection>
          
          <LessonMeta>
            <div style={{ display: 'flex', gap: theme.spacing[2], alignItems: 'center' }}>
              <TopicBadge topic={lessonTopic}>
                {getTopicName(lessonTopic)}
              </TopicBadge>
              
              <DifficultyBadge difficulty={difficulty}>
                {difficulty}
              </DifficultyBadge>
            </div>
            
            <LessonNumber>
              Lesson {lessonNumber.toString().padStart(3, '0')}
            </LessonNumber>
            
            {estimatedTime && (
              <TimeEstimateBadge>
                {estimatedTime} min
              </TimeEstimateBadge>
            )}
            
            {showProgress && (
              <ProgressContainer>
                <ProgressBar progress={progress} topic={lessonTopic} />
                <ProgressText>{progress}%</ProgressText>
              </ProgressContainer>
            )}
          </LessonMeta>
        </LessonHeader>
        
        {prerequisites.length > 0 && (
          <PrerequisitesSection>
            <strong>Prerequisites:</strong> Lessons {prerequisites.join(', ')}
          </PrerequisitesSection>
        )}
        
        {children}
        
        {showNavigation && (
          <NavigationControls>
            <NavigationButton
              onClick={onPrevious}
              disabled={!canGoPrevious}
              leftIcon="←"
            >
              Previous
            </NavigationButton>
            
            <NavigationButton
              onClick={onNext}
              disabled={!canGoNext}
              rightIcon="→"
            >
              Next
            </NavigationButton>
          </NavigationControls>
        )}
      </TheoryPanel>
    </LessonContainer>
  );
};

// Grid layout for responsive design
export const Grid = styled.div<{
  columns?: number;
  gap?: keyof typeof theme.spacing;
  responsive?: boolean;
}>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
  gap: ${props => theme.spacing[props.gap || '4']};
  
  ${props => props.responsive && css`
    ${mediaQuery.down('lg')} {
      grid-template-columns: 1fr;
    }
  `}
`;

// Flex utilities
export const Flex = styled.div<{
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  gap?: keyof typeof theme.spacing;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => theme.spacing[props.gap || '0']};
  
  ${props => props.wrap && css`
    flex-wrap: wrap;
  `}
`;

// Container for max-width and centering
export const Container = styled.div<{
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: keyof typeof theme.spacing;
}>`
  width: 100%;
  margin: 0 auto;
  padding: 0 ${props => theme.spacing[props.padding || '4']};
  
  ${props => {
    switch (props.size) {
      case 'sm': return 'max-width: 640px;';
      case 'md': return 'max-width: 768px;';
      case 'lg': return 'max-width: 1024px;';
      case 'xl': return 'max-width: 1280px;';
      case 'full': return 'max-width: 100%;';
      default: return `max-width: ${theme.layout.maxWidth};`;
    }
  }}
`;

export default LessonLayout;