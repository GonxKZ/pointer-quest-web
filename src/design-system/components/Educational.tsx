/**
 * Pointer Quest Design System - Educational Components
 * 
 * Specialized components for educational features like progress tracking,
 * navigation, learning objectives, and assessment feedback.
 */

import React, { ReactNode, useState, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme, LessonTopic, LessonDifficulty, mediaQuery, getLessonTopic, getTopicName, getDifficultyColor } from '../theme';
import { Button, ButtonGroup } from './Button';

// Progress animations
const progressFill = keyframes`
  0% { width: 0%; }
  100% { width: var(--progress); }
`;

const achievementUnlock = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 1; }
`;

// Progress Tracker Component
interface ProgressTrackerProps {
  currentLesson: number;
  totalLessons: number;
  completedLessons: number[];
  topicProgress: Record<LessonTopic, { completed: number; total: number }>;
  overallProgress: number; // 0-100
  showDetailed?: boolean;
}

const ProgressContainer = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  margin: ${theme.spacing[4]} 0;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
  
  ${mediaQuery.down('md')} {
    flex-direction: column;
    gap: ${theme.spacing[2]};
    align-items: flex-start;
  }
`;

const ProgressTitle = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  &::before {
    content: '📊';
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const OverallProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  position: relative;
  margin: ${theme.spacing[4]} 0;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
    border-radius: ${theme.borderRadius.full};
    animation: ${progressFill} 1s ease-out;
    --progress: ${props => props.progress}%;
  }
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[2]};
`;

const TopicProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[4]};
`;

const TopicProgressItem = styled.div<{ topic: LessonTopic }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => `${theme.colors.topics[props.topic]?.primary}40`};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[3]};
`;

const TopicName = styled.div<{ topic: LessonTopic }>`
  color: ${props => theme.colors.topics[props.topic]?.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing[2]};
`;

const TopicProgressBar = styled.div<{ progress: number; topic: LessonTopic }>`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background: ${props => theme.colors.topics[props.topic]?.primary};
    border-radius: ${theme.borderRadius.full};
    transition: width 0.5s ease-out;
  }
`;

const TopicStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.muted};
  margin-top: ${theme.spacing[1]};
`;

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentLesson,
  totalLessons,
  completedLessons,
  topicProgress,
  overallProgress,
  showDetailed = true
}) => {
  return (
    <ProgressContainer>
      <ProgressHeader>
        <ProgressTitle>
          Learning Progress
        </ProgressTitle>
        <div style={{ 
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.primary[500]
        }}>
          {Math.round(overallProgress)}%
        </div>
      </ProgressHeader>
      
      <OverallProgressBar progress={overallProgress} />
      
      <ProgressStats>
        <span>Lesson {currentLesson} of {totalLessons}</span>
        <span>{completedLessons.length} completed</span>
      </ProgressStats>
      
      {showDetailed && (
        <TopicProgressGrid>
          {Object.entries(topicProgress).map(([topicKey, progress]) => {
            const topic = topicKey as LessonTopic;
            const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
            
            return (
              <TopicProgressItem key={topic} topic={topic}>
                <TopicName topic={topic}>
                  {getTopicName(topic)}
                </TopicName>
                <TopicProgressBar progress={progressPercent} topic={topic} />
                <TopicStats>
                  <span>{progress.completed}/{progress.total}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </TopicStats>
              </TopicProgressItem>
            );
          })}
        </TopicProgressGrid>
      )}
    </ProgressContainer>
  );
};

// Lesson Navigation Footer
interface NavigationFooterProps {
  currentLesson: number;
  totalLessons: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onHome?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  showLessonMap?: boolean;
  onShowLessonMap?: () => void;
}

const FooterContainer = styled.footer`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${theme.colors.background.dark};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  backdrop-filter: blur(10px);
  z-index: ${theme.zIndex.sticky};
  
  ${mediaQuery.down('md')} {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
  }
`;

const FooterContent = styled.div`
  max-width: ${theme.layout.maxWidth};
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  ${mediaQuery.down('md')} {
    flex-direction: column;
    gap: ${theme.spacing[3]};
  }
`;

const LessonIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.code};
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  align-items: center;
`;

export const NavigationFooter: React.FC<NavigationFooterProps> = ({
  currentLesson,
  totalLessons,
  onPrevious,
  onNext,
  onHome,
  canGoPrevious = true,
  canGoNext = true,
  showLessonMap = true,
  onShowLessonMap
}) => {
  const currentTopic = getLessonTopic(currentLesson);
  
  return (
    <FooterContainer>
      <FooterContent>
        <LessonIndicator>
          <span style={{ color: theme.colors.topics[currentTopic]?.primary }}>
            {getTopicName(currentTopic)}
          </span>
          <span>•</span>
          <span>Lesson {currentLesson.toString().padStart(3, '0')}</span>
          <span>of {totalLessons}</span>
        </LessonIndicator>
        
        <NavigationButtons>
          {onHome && (
            <Button 
              onClick={onHome}
              variant="ghost"
              size="sm"
              leftIcon="🏠"
              title="Return to lesson overview"
            >
              Home
            </Button>
          )}
          
          {showLessonMap && onShowLessonMap && (
            <Button 
              onClick={onShowLessonMap}
              variant="outline"
              size="sm"
              leftIcon="🗺️"
              title="View lesson map"
            >
              Map
            </Button>
          )}
          
          <Button 
            onClick={onPrevious}
            disabled={!canGoPrevious}
            variant="secondary"
            size="sm"
            leftIcon="←"
            title="Previous lesson"
          >
            Previous
          </Button>
          
          <Button 
            onClick={onNext}
            disabled={!canGoNext}
            variant="primary"
            size="sm"
            rightIcon="→"
            title="Next lesson"
          >
            Next
          </Button>
        </NavigationButtons>
      </FooterContent>
    </FooterContainer>
  );
};

// Achievement Notification
interface AchievementProps {
  title: string;
  description: string;
  icon: string;
  visible: boolean;
  onClose: () => void;
  category?: 'completion' | 'speed' | 'accuracy' | 'exploration' | 'mastery';
}

const AchievementOverlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
`;

const AchievementCard = styled.div<{ visible: boolean }>`
  background: linear-gradient(135deg, ${theme.colors.background.secondary}, ${theme.colors.background.glass});
  border: 2px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing[8]};
  text-align: center;
  max-width: 400px;
  transform: ${props => props.visible ? 'scale(1)' : 'scale(0.8)'};
  animation: ${props => props.visible ? achievementUnlock : 'none'} 0.6s ease-out;
  box-shadow: ${theme.shadows['2xl']};
`;

const AchievementIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${theme.spacing[4]};
`;

const AchievementTitle = styled.h3`
  color: ${theme.colors.warning};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const AchievementDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin: 0 0 ${theme.spacing[6]} 0;
`;

export const AchievementNotification: React.FC<AchievementProps> = ({
  title,
  description,
  icon,
  visible,
  onClose,
  category: _category = 'completion'
}) => {
  return (
    <AchievementOverlay visible={visible} onClick={onClose}>
      <AchievementCard visible={visible} onClick={(e) => e.stopPropagation()}>
        <AchievementIcon>{icon}</AchievementIcon>
        <AchievementTitle>{title}</AchievementTitle>
        <AchievementDescription>{description}</AchievementDescription>
        <Button onClick={onClose} variant="primary">
          Awesome!
        </Button>
      </AchievementCard>
    </AchievementOverlay>
  );
};

// Learning Path Selector
interface LearningPathProps {
  paths: Array<{
    id: string;
    name: string;
    description: string;
    lessons: number[];
    estimatedTime: number;
    difficulty: LessonDifficulty;
    recommended: boolean;
  }>;
  selectedPath?: string;
  onSelectPath: (pathId: string) => void;
}

const PathsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[4]};
  margin: ${theme.spacing[4]} 0;
`;

const PathCard = styled.div<{ selected: boolean; difficulty: LessonDifficulty; recommended: boolean }>`
  background: ${props => props.selected ? theme.colors.background.glass : theme.colors.background.secondary};
  border: 2px solid ${props => props.selected ? theme.colors.primary[500] : 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut};
  position: relative;
  
  &:hover {
    border-color: ${theme.colors.primary[500]};
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
  }
  
  ${props => props.recommended && css`
    &::before {
      content: '⭐ Recommended';
      position: absolute;
      top: -12px;
      right: ${theme.spacing[4]};
      background: ${theme.colors.warning};
      color: ${theme.colors.gray[900]};
      padding: ${theme.spacing[1]} ${theme.spacing[3]};
      border-radius: ${theme.borderRadius.full};
      font-size: ${theme.typography.fontSize.xs};
      font-weight: ${theme.typography.fontWeight.bold};
    }
  `}
`;

const PathHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[3]};
`;

const PathTitle = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0;
`;

const DifficultyIndicator = styled.span<{ difficulty: LessonDifficulty }>`
  background: ${props => getDifficultyColor(props.difficulty)};
  color: ${props => props.difficulty === 'Intermediate' ? theme.colors.gray[900] : theme.colors.text.primary};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
`;

const PathDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin: 0 0 ${theme.spacing[4]} 0;
`;

const PathStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.muted};
  
  span {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[1]};
  }
`;

export const LearningPathSelector: React.FC<LearningPathProps> = ({
  paths,
  selectedPath,
  onSelectPath
}) => {
  return (
    <PathsContainer>
      {paths.map((path) => (
        <PathCard
          key={path.id}
          selected={selectedPath === path.id}
          difficulty={path.difficulty}
          recommended={path.recommended}
          onClick={() => onSelectPath(path.id)}
        >
          <PathHeader>
            <PathTitle>{path.name}</PathTitle>
            <DifficultyIndicator difficulty={path.difficulty}>
              {path.difficulty}
            </DifficultyIndicator>
          </PathHeader>
          
          <PathDescription>{path.description}</PathDescription>
          
          <PathStats>
            <span>
              📚 {path.lessons.length} lessons
            </span>
            <span>
              ⏱️ {path.estimatedTime}h
            </span>
          </PathStats>
        </PathCard>
      ))}
    </PathsContainer>
  );
};

// Lesson Map/Overview Component
interface LessonMapProps {
  lessons: Array<{
    number: number;
    title: string;
    topic: LessonTopic;
    difficulty: LessonDifficulty;
    completed: boolean;
    locked: boolean;
  }>;
  currentLesson: number;
  onSelectLesson: (lessonNumber: number) => void;
}

const MapContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]};
`;

const LessonMapItem = styled.div<{ 
  topic: LessonTopic; 
  completed: boolean; 
  current: boolean; 
  locked: boolean 
}>`
  background: ${props => {
    if (props.locked) return theme.colors.gray[800];
    if (props.current) return `${theme.colors.topics[props.topic]?.primary}20`;
    if (props.completed) return `${theme.colors.success}20`;
    return theme.colors.background.secondary;
  }};
  border: 2px solid ${props => {
    if (props.locked) return theme.colors.gray[600];
    if (props.current) return theme.colors.topics[props.topic]?.primary;
    if (props.completed) return theme.colors.success;
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  transition: all ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut};
  position: relative;
  
  &:hover {
    ${props => !props.locked && css`
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
    `}
  }
  
  ${props => props.completed && css`
    &::after {
      content: '✓';
      position: absolute;
      top: ${theme.spacing[2]};
      right: ${theme.spacing[2]};
      color: ${theme.colors.success};
      font-size: ${theme.typography.fontSize.lg};
      font-weight: ${theme.typography.fontWeight.bold};
    }
  `}
  
  ${props => props.locked && css`
    opacity: 0.5;
    
    &::before {
      content: '🔒';
      position: absolute;
      top: ${theme.spacing[2]};
      right: ${theme.spacing[2]};
      font-size: ${theme.typography.fontSize.base};
    }
  `}
`;

const LessonMapNumber = styled.div<{ topic: LessonTopic }>`
  color: ${props => theme.colors.topics[props.topic]?.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  font-family: ${theme.typography.fontFamily.code};
  margin-bottom: ${theme.spacing[1]};
`;

const LessonMapTitle = styled.h4`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  margin: 0 0 ${theme.spacing[2]} 0;
  line-height: ${theme.typography.lineHeight.tight};
`;

const LessonMapMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.muted};
`;

export const LessonMap: React.FC<LessonMapProps> = ({
  lessons,
  currentLesson,
  onSelectLesson
}) => {
  return (
    <MapContainer>
      {lessons.map((lesson) => (
        <LessonMapItem
          key={lesson.number}
          topic={lesson.topic}
          completed={lesson.completed}
          current={lesson.number === currentLesson}
          locked={lesson.locked}
          onClick={() => !lesson.locked && onSelectLesson(lesson.number)}
        >
          <LessonMapNumber topic={lesson.topic}>
            Lesson {lesson.number.toString().padStart(3, '0')}
          </LessonMapNumber>
          <LessonMapTitle>{lesson.title}</LessonMapTitle>
          <LessonMapMeta>
            <span>{getTopicName(lesson.topic)}</span>
            <span>{lesson.difficulty}</span>
          </LessonMapMeta>
        </LessonMapItem>
      ))}
    </MapContainer>
  );
};

export default {
  ProgressTracker,
  NavigationFooter,
  AchievementNotification,
  LearningPathSelector,
  LessonMap
};