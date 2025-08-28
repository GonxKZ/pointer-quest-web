/**
 * Pointer Quest Design System - TypeScript Type Definitions
 * 
 * Comprehensive type system for the entire design system.
 * Ensures type safety across all 120+ lessons and components.
 */

import { ReactNode, CSSProperties } from 'react';
import { theme } from '../theme';

// Base theme types
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = keyof typeof theme.spacing;
export type ThemeTypography = typeof theme.typography;
export type ThemeBreakpoints = keyof typeof theme.breakpoints;

// Educational system types
export type LessonTopic = 'basic' | 'smart' | 'memory' | 'advanced' | 'atomic' | 'performance';
export type LessonDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type LessonType = 'theory' | 'practical' | 'interactive' | 'visualization' | 'assessment';
export type ConceptComplexity = 'fundamental' | 'intermediate' | 'advanced' | 'expert' | 'research';
export type WarningLevel = 'low' | 'medium' | 'high' | 'extreme';

// Layout system types
export type LayoutType = 'two-panel' | 'three-panel' | 'full-screen' | 'mobile-stack' | 'code-focused';
export type PanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'auto' | 'min-content' | 'max-content';
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';

// Component variant types
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'error' | 'ghost' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'small' | 'md' | 'lg' | 'xl';
export type InputVariant = 'default' | 'filled' | 'outline' | 'underlined';
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'error' | 'info';

// Advanced lesson-specific types
export interface AdvancedLessonMetadata {
  lessonNumber: number;
  title: string;
  subtitle?: string;
  topic: LessonTopic;
  difficulty: LessonDifficulty;
  type: LessonType;
  complexity: ConceptComplexity;
  estimatedTime: number; // minutes
  prerequisites: number[];
  learningObjectives: string[];
  keyTerms: string[];
  cppFeatures: string[];
  warningLevel?: WarningLevel;
  hasUndefinedBehavior: boolean;
  requiresCompilerSupport?: string[];
  tags: string[];
  category: string; // For lessons 61-120
}

// Interactive element types
export type InteractiveElementType = 
  | 'code-editor'
  | 'memory-visualizer'
  | 'step-by-step'
  | 'quiz'
  | 'drag-drop'
  | 'code-comparison'
  | 'performance-benchmark'
  | 'memory-profiler'
  | 'undefined-behavior-demo'
  | 'atomic-operation-visualizer'
  | 'memory-layout-analyzer';

export interface InteractiveElement {
  id: string;
  type: InteractiveElementType;
  title: string;
  description?: string;
  required: boolean;
  points?: number;
  config?: Record<string, any>;
}

// Memory and pointer visualization types
export interface MemoryBlock {
  id: string;
  address: string;
  size: number;
  type: 'stack' | 'heap' | 'global' | 'text' | 'data';
  value?: any;
  name?: string;
  isValid: boolean;
  color?: string;
}

export interface PointerVisualization {
  source: MemoryBlock;
  target?: MemoryBlock;
  isNull: boolean;
  isDangling: boolean;
  isWild: boolean;
  color: string;
}

export interface MemoryState {
  blocks: MemoryBlock[];
  pointers: PointerVisualization[];
  currentOperation?: string;
  warnings: string[];
  errors: string[];
}

// Performance and optimization types
export interface PerformanceMetrics {
  time: number; // milliseconds
  memory: number; // bytes
  cpuUsage?: number; // percentage
  cacheHits?: number;
  cacheMisses?: number;
  instructions?: number;
  score: number; // 0-100
}

export interface BenchmarkResult {
  name: string;
  metrics: PerformanceMetrics;
  code: string;
  optimizationLevel: 'O0' | 'O1' | 'O2' | 'O3' | 'Os' | 'Ofast';
}

export interface PerformanceComparison {
  title: string;
  approaches: Array<{
    name: string;
    code: string;
    performance: 'slow' | 'medium' | 'fast' | 'optimal';
    description: string;
    metrics?: Partial<PerformanceMetrics>;
  }>;
  results?: BenchmarkResult[];
}

// Atomic operations and concurrency types
export interface AtomicOperation {
  name: string;
  code: string;
  description: string;
  isAtomic: boolean;
  memoryOrdering?: 'relaxed' | 'acquire' | 'release' | 'acq_rel' | 'seq_cst';
  threadSafety: 'safe' | 'unsafe' | 'conditional';
}

export interface ConcurrencyVisualization {
  threads: Array<{
    id: string;
    name: string;
    operations: string[];
    currentOperation?: number;
  }>;
  sharedData: Record<string, any>;
  locks: Array<{
    name: string;
    owner?: string;
    waitingThreads: string[];
  }>;
}

// Undefined behavior types
export interface UndefinedBehaviorWarning {
  severity?: WarningLevel;
  title: string;
  description: string;
  codeExample?: string;
  consequences?: string[];
  mitigation?: string[];
}

export interface UndefinedBehaviorWarningProps {
  severity?: WarningLevel;
  title: string;
  description: string;
  codeExample?: string;
  consequences?: string[];
  children?: ReactNode;
}

export interface UBDemonstration {
  title: string;
  problematicCode: string;
  fixedCode?: string;
  explanation: string;
  compilerBehavior: Array<{
    compiler: string;
    version: string;
    behavior: string;
  }>;
}

// Accessibility types
export interface AccessibilityFeatures {
  supportsScreenReader: boolean;
  supportsKeyboardNavigation: boolean;
  hasHighContrast: boolean;
  respectsReducedMotion: boolean;
  providesAlternativeText: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  role?: string;
}

// Component prop interfaces
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

export interface ThemeableProps {
  theme?: Partial<Theme>;
  variant?: string;
  size?: string;
  color?: string;
}

export interface ResponsiveProps {
  xs?: boolean | string | number;
  sm?: boolean | string | number;
  md?: boolean | string | number;
  lg?: boolean | string | number;
  xl?: boolean | string | number;
  '2xl'?: boolean | string | number;
}

export interface SpacingProps {
  m?: ThemeSpacing;
  mt?: ThemeSpacing;
  mr?: ThemeSpacing;
  mb?: ThemeSpacing;
  ml?: ThemeSpacing;
  mx?: ThemeSpacing;
  my?: ThemeSpacing;
  p?: ThemeSpacing;
  pt?: ThemeSpacing;
  pr?: ThemeSpacing;
  pb?: ThemeSpacing;
  pl?: ThemeSpacing;
  px?: ThemeSpacing;
  py?: ThemeSpacing;
}

// Layout component props
export interface LayoutProps extends BaseComponentProps, ResponsiveProps {
  layoutType?: LayoutType;
  gap?: ThemeSpacing;
  direction?: FlexDirection;
  justify?: JustifyContent;
  align?: AlignItems;
  wrap?: boolean;
}

export interface PanelProps extends BaseComponentProps, ThemeableProps {
  scrollable?: boolean;
  topic?: LessonTopic;
  padding?: ThemeSpacing;
  maxHeight?: string;
}

export interface LessonLayoutProps extends BaseComponentProps {
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
  estimatedTime?: number;
  prerequisites?: number[];
  metadata?: AdvancedLessonMetadata;
}

// Button component props
export interface ButtonProps extends BaseComponentProps, AriaAttributes {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

// Code block component props
export interface CodeBlockProps extends BaseComponentProps {
  code: string;
  language?: string;
  title?: string;
  filename?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  maxHeight?: string;
  copyable?: boolean;
  editable?: boolean;
  onEdit?: (code: string) => void;
  annotations?: Array<{
    line: number;
    content: ReactNode;
    type?: 'info' | 'warning' | 'error' | 'success';
  }>;
}

// Interactive component props
export interface StepExerciseProps extends BaseComponentProps {
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

export interface CodePlaygroundProps extends BaseComponentProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onExecute?: (code: string) => void;
  executionResult?: string;
  isExecuting?: boolean;
  language?: string;
  topic?: LessonTopic;
}

// Progress tracking types
export interface LessonProgress {
  lessonNumber: number;
  completed: boolean;
  completionDate?: Date;
  timeSpent: number; // minutes
  score?: number; // 0-100
  attempts: number;
  objectivesCompleted: string[];
  mistakesMade: string[];
  conceptsUnderstood: string[];
  lastAccessed: Date;
}

export interface UserProgressData {
  userId: string;
  totalLessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number; // minutes
  averageScore: number;
  topicsCompleted: Record<LessonTopic, number>;
  achievements: string[];
  lessonProgress: Record<number, LessonProgress>;
  preferences: {
    language: 'en' | 'es';
    theme: 'dark' | 'light' | 'auto';
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'sm' | 'md' | 'lg' | 'xl';
  };
}

// Error and state management types
export interface DesignSystemError {
  code: string;
  message: string;
  component?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ComponentState {
  loading: boolean;
  error?: DesignSystemError;
  data?: any;
  lastUpdated: Date;
}

// Theme customization types
export interface ThemeCustomization {
  colors?: Partial<ThemeColors>;
  fonts?: Partial<ThemeTypography>;
  spacing?: Partial<typeof theme.spacing>;
  breakpoints?: Partial<typeof theme.breakpoints>;
  animations?: {
    reducedMotion?: boolean;
    duration?: 'fast' | 'normal' | 'slow';
  };
}

// Form and input types
export interface FormFieldProps extends BaseComponentProps, AriaAttributes {
  label?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  helperText?: string;
  variant?: InputVariant;
  size?: ButtonSize;
}

// Utility types for component composition
export type Merge<T, U> = Omit<T, keyof U> & U;
export type OverrideProps<T, U> = Omit<T, keyof U> & U;
export type StyledSystemProps = ResponsiveProps & SpacingProps;

// Event handler types
export type ClickHandler = (event: React.MouseEvent) => void;
export type KeyboardHandler = (event: React.KeyboardEvent) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler = (event: React.FormEvent) => void;

// Animation and transition types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export interface TransitionConfig {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

// Testing and development types
export interface ComponentTestProps {
  testId?: string;
  'data-cy'?: string; // Cypress
  'data-test'?: string; // General testing
}

export interface DevModeProps {
  debug?: boolean;
  verbose?: boolean;
  showBoundaries?: boolean;
}

// Export utility types for external use
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Global design system configuration
export interface DesignSystemConfig {
  theme: Theme;
  accessibility: {
    enabled: boolean;
    level: 'A' | 'AA' | 'AAA';
    announcements: boolean;
    keyboardNavigation: boolean;
  };
  performance: {
    lazyLoading: boolean;
    caching: boolean;
    optimization: boolean;
  };
  development: {
    debug: boolean;
    hotReload: boolean;
    typeChecking: boolean;
  };
}

// Data Display Component Props
export interface CardProps extends BaseComponentProps, AriaAttributes {
  title?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  interactive?: boolean;
  onClick?: () => void;
}

export interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant;
  size?: 'small' | 'medium' | 'large';
}

export interface MetricProps extends BaseComponentProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'danger' | 'info';
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon?: ReactNode;
  format?: 'number' | 'percentage' | 'time' | 'currency';
}

export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

// Types-only module - all types are already exported above individually