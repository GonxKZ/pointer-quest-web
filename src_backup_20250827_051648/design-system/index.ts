/**
 * Pointer Quest Design System - Main Export File
 * 
 * Central export point for all design system components, utilities, and types.
 * This file provides a clean API for consuming the design system throughout the application.
 */

// Theme and configuration
export { 
  theme,
  getLessonTopic,
  getTopicColors,
  getLessonColors,
  getDifficultyColor,
  getTopicName,
  mediaQuery,
  keyframes
} from './theme';

// Theme types
export type { 
  Theme,
  ThemeColors,
  LessonTopic,
  LessonDifficulty 
} from './theme';

// Layout Components
export {
  LessonLayout,
  Section,
  SectionTitle
} from './components/Layout';

// Button Components
export {
  Button,
  ButtonGroup
} from './components/Button';

// Code Presentation Components
export {
  CodeBlockComponent as CodeBlock
} from './components/CodeBlock';

// Interactive Components
export {
  InteractiveSection,
  CodePlayground,
  LearningObjectives
} from './components/Interactive';

// Educational Components
export {
  AchievementNotification
} from './components/Educational';

// Advanced Educational Components
export {
  UndefinedBehaviorWarning,
  PerformanceComparison
} from './components/AdvancedEducational';

// Accessible Components
export {
  ScreenReaderOnly,
  AccessibleHeading
} from './components/AccessibleComponents';

// Component prop types
export type {
  ButtonProps,
  CodeBlockProps,
  LessonProgress,
  MemoryState
} from './types/designSystem';

// Utilities
export {
  generateAriaLabel,
  AccessibilityAnnouncer
} from './utils/accessibility';

export {
  PerformanceMonitor
} from './utils/performance';

export {
  responsive
} from './utils/responsive';