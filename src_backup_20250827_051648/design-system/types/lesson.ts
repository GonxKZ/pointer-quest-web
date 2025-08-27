/**
 * Pointer Quest Design System - Lesson Type Definitions
 * 
 * Comprehensive type definitions for lesson metadata, content structure,
 * and educational components across all 120+ lessons.
 */

import { ReactNode } from 'react';
import { LessonTopic, LessonDifficulty } from '../theme';
import { LayoutType } from './designSystem';

// Core lesson metadata
export interface LessonMetadata {
  lessonNumber: number;
  title: string;
  subtitle?: string;
  topic: LessonTopic;
  difficulty: LessonDifficulty;
  estimatedTime: number; // in minutes
  prerequisites: number[]; // lesson numbers
  learningObjectives: string[];
  tags: string[];
  version: string;
  lastUpdated: Date;
}

// Extended lesson configuration
export interface LessonConfig extends LessonMetadata {
  layoutType: LayoutType;
  showProgress: boolean;
  showNavigation: boolean;
  enableCodePlayground: boolean;
  enableMemoryVisualizer: boolean;
  enableInteractiveExercises: boolean;
  customComponents?: ReactNode[];
}

// Content sections for structured lessons
export interface LessonSection {
  id: string;
  title: string;
  type: 'theory' | 'example' | 'exercise' | 'visualization' | 'summary';
  content: ReactNode;
  estimatedTime?: number;
  interactive?: boolean;
  required?: boolean;
}

// Interactive exercise definitions
export interface InteractiveExercise {
  id: string;
  type: 'step-by-step' | 'code-playground' | 'memory-game' | 'quiz' | 'drag-drop';
  title: string;
  description: string;
  instructions: string[];
  hints?: string[];
  solution?: string;
  validation?: (input: any) => { correct: boolean; feedback: string };
}

// Step-by-step exercise specific
export interface StepExerciseConfig {
  steps: Array<{
    id: string;
    title: string;
    description: string;
    code?: string;
    expectedOutput?: string;
    validation?: (result: any) => boolean;
    hints?: string[];
  }>;
  allowSkip?: boolean;
  resetOnError?: boolean;
}

// Code playground configuration
export interface CodePlaygroundConfig {
  language: 'cpp' | 'c';
  initialCode: string;
  template?: string;
  allowedIncludes?: string[];
  compilerFlags?: string[];
  timeLimit?: number; // seconds
  memoryLimit?: number; // MB
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    description: string;
  }>;
}

// Memory visualizer configuration
export interface MemoryVisualizerConfig {
  scenes: Array<{
    id: string;
    title: string;
    description: string;
    memoryState: MemoryState;
    highlightElements?: string[];
    animations?: Animation[];
  }>;
  autoPlay?: boolean;
  playbackSpeed?: number;
  allowUserControl?: boolean;
}

// Memory state representation
export interface MemoryState {
  stack: StackFrame[];
  heap: HeapBlock[];
  globals: GlobalVariable[];
  pointers: Pointer[];
  references: Reference[];
  annotations: Annotation[];
}

export interface StackFrame {
  id: string;
  name: string;
  variables: Variable[];
  position: { x: number; y: number; z: number };
  active?: boolean;
}

export interface HeapBlock {
  id: string;
  address: string;
  size: number;
  type: string;
  value?: any;
  allocated: boolean;
  position: { x: number; y: number; z: number };
  color?: string;
}

export interface GlobalVariable {
  id: string;
  name: string;
  type: string;
  value: any;
  position: { x: number; y: number; z: number };
}

export interface Variable {
  id: string;
  name: string;
  type: string;
  value: any;
  address?: string;
  position: { x: number; y: number; z: number };
  isPointer?: boolean;
  pointsTo?: string; // ID of target variable/memory block
}

export interface Pointer {
  id: string;
  fromId: string; // Source variable ID
  toId: string;   // Target variable/memory block ID
  type: 'raw' | 'unique_ptr' | 'shared_ptr' | 'weak_ptr';
  valid: boolean;
  color?: string;
  animated?: boolean;
}

export interface Reference {
  id: string;
  name: string;
  targetId: string;
  type: string;
  position: { x: number; y: number; z: number };
}

export interface Annotation {
  id: string;
  targetId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  position?: { x: number; y: number; z: number };
  duration?: number; // milliseconds, undefined = permanent
}

export interface Animation {
  id: string;
  type: 'move' | 'highlight' | 'create' | 'destroy' | 'modify';
  targetId: string;
  duration: number;
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  properties?: Record<string, any>;
}

// Learning assessment
export interface LearningAssessment {
  type: 'quiz' | 'practical' | 'conceptual';
  questions: AssessmentQuestion[];
  passingScore?: number; // percentage
  allowRetries?: boolean;
  timeLimit?: number; // minutes
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple-choice' | 'code-completion' | 'drag-drop' | 'free-text';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: any;
  explanation?: string;
  points: number;
  hints?: string[];
}

// Progress tracking
export interface LessonProgress {
  lessonNumber: number;
  completed: boolean;
  completionDate?: Date;
  timeSpent: number; // minutes
  score?: number; // percentage
  sectionsCompleted: string[]; // section IDs
  exercisesCompleted: string[]; // exercise IDs
  hintsUsed: number;
  attempts: number;
}

export interface UserLearningPath {
  userId: string;
  currentLesson: number;
  completedLessons: number[];
  totalTimeSpent: number; // minutes
  overallProgress: number; // percentage
  skillLevels: Record<LessonTopic, number>; // 1-100
  preferences: LearningPreferences;
  achievements: Achievement[];
}

export interface LearningPreferences {
  preferredPace: 'slow' | 'normal' | 'fast';
  visualLearning: boolean;
  practicalLearning: boolean;
  theoreticalLearning: boolean;
  language: 'en' | 'es';
  theme: 'dark' | 'light' | 'auto';
  enableAnimations: boolean;
  enableSounds: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate: Date;
  category: 'completion' | 'speed' | 'accuracy' | 'exploration' | 'mastery';
}

// Error handling and validation
export interface LessonValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  section: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  section: string;
  field: string;
  message: string;
  suggestion?: string;
}

// Accessibility support
export interface AccessibilityConfig {
  ariaLabels: Record<string, string>;
  keyboardShortcuts: Record<string, () => void>;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
}

// Internationalization support
export interface LessonTranslation {
  language: 'en' | 'es';
  title: string;
  subtitle?: string;
  sections: Record<string, {
    title: string;
    content: string;
  }>;
  exercises: Record<string, {
    title: string;
    description: string;
    instructions: string[];
    hints?: string[];
  }>;
  ui: Record<string, string>;
  codeComments: Record<string, string>;
}

// Complete lesson definition
export interface Lesson {
  metadata: LessonMetadata;
  config: LessonConfig;
  sections: LessonSection[];
  exercises?: InteractiveExercise[];
  memoryVisualizer?: MemoryVisualizerConfig;
  codePlayground?: CodePlaygroundConfig;
  assessment?: LearningAssessment;
  translations?: Record<string, LessonTranslation>;
  accessibility?: AccessibilityConfig;
}

// Lesson registry for managing all lessons
export interface LessonRegistry {
  lessons: Record<number, Lesson>;
  topics: Record<LessonTopic, number[]>; // topic -> lesson numbers
  difficulties: Record<LessonDifficulty, number[]>; // difficulty -> lesson numbers
  prerequisites: Record<number, number[]>; // lesson -> required lessons
  learningPaths: LearningPath[];
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  lessons: number[];
  estimatedTime: number; // hours
  difficulty: LessonDifficulty;
  recommended: boolean;
}

// Component props for lesson system
export interface LessonComponentProps {
  lesson: Lesson;
  progress: LessonProgress;
  onProgressUpdate: (progress: Partial<LessonProgress>) => void;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  userPreferences: LearningPreferences;
  accessibility: AccessibilityConfig;
}

// Lesson content renderer props
export interface LessonRendererProps extends LessonComponentProps {
  sectionId?: string; // render specific section only
  interactive?: boolean; // enable/disable interactions
  previewMode?: boolean; // for lesson preview/editing
}

// Types-only module - all types are already exported above individually