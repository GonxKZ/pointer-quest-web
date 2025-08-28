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

// Multi-theme system
export {
  themes,
  defaultTheme,
  getTheme,
  getSemanticColor,
  generateCSSCustomProperties,
  mediaQueries,
  getThemeAwareStyles,
  getAnimationPreferences,
  getAccessibilityColors
} from './themes';

// Theme types
export type { 
  Theme as BaseTheme,
  ThemeColors,
  LessonTopic,
  LessonDifficulty 
} from './theme';

export type {
  ThemeName,
  Theme
} from './themes';

// Layout Components
export {
  LessonLayout,
  Section,
  SectionTitle
} from './components/Layout';

// Legacy compatibility exports (temporary)
export const TheoryPanel = Section;
export const VisualizationPanel = Section;
export const StatusDisplay = Section;

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
  LearningObjectives,
  StepExercise,
  MemoryVisualizerControls,
  StepIndicator
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

// Data Display Components
export {
  Card,
  Badge,
  Metric,
  Progress
} from './components/DataDisplay';

// Component prop types
export type {
  ButtonProps,
  CodeBlockProps,
  LessonProgress,
  MemoryState,
  CardProps,
  BadgeProps,
  MetricProps,
  ProgressProps
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