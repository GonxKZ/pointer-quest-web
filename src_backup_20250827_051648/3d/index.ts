// Professional 3D Educational Visualizations for C++ Pointer Concepts
// Built with React Three Fiber for high-performance 60fps rendering

// Main unified educational scene
export { default as EducationalPointerScene } from './EducationalPointerScene';

// Core memory visualization
export { MemoryScene, default as MemoryVisualizer3D } from './MemoryVisualizer3D';

// Smart pointer visualizations
export {
  SmartPointerComparisonScene,
  UniquePtrVisualization,
  SharedPtrVisualization,
  WeakPtrVisualization,
  RAIILifecycleDemo,
  MemoryLeakVisualization,
  OwnershipTransferDemo,
  default as SmartPointerVisualizations
} from './SmartPointerVisualizations';

// Pointer arithmetic demonstrations
export { PointerArithmetic3D } from './PointerArithmetic3D';

// Const correctness visualizations
export { ConstPointer3D } from './ConstPointer3D';

// Function pointer demonstrations
export { FunctionPointer3D } from './FunctionPointer3D';

// RAII lifecycle visualizations
export {
  LifecycleMemoryBlock,
  StackFrameVisualization,
  HeapVisualization,
  RAIILifecycleDemo as MemoryLifecycleVisualizer,
  RAIIState,
  default as MemoryLifecycleVisualizations
} from './MemoryLifecycleVisualizer';

// Type definitions for educational components
export interface EducationalVisualizationProps {
  animated?: boolean;
  autoPlay?: boolean;
  speed?: number;
  interactive?: boolean;
}

export interface PointerVisualizationProps extends EducationalVisualizationProps {
  position?: [number, number, number];
  targetPosition?: [number, number, number];
  scale?: number;
}

// Educational color schemes
export const EDUCATIONAL_COLORS = {
  memory: {
    stack: '#00FF88',
    heap: '#FF6B6B',
    global: '#FFA500',
    allocated: '#4CAF50',
    deallocated: '#F44336'
  },
  pointers: {
    raw: '#2196F3',
    unique: '#9C27B0',
    shared: '#4CAF50',
    weak: '#FF9800',
    function: '#00BCD4'
  },
  lifecycle: {
    constructing: '#2196F3',
    alive: '#4CAF50',
    destructing: '#FF9800',
    destroyed: '#F44336'
  },
  const: {
    immutable: '#3F51B5',
    mutable: '#4CAF50',
    constPointer: '#9C27B0'
  }
} as const;

// Educational topics configuration
export const EDUCATIONAL_TOPICS = {
  FUNDAMENTALS: {
    key: 'fundamentals',
    title: 'Pointer Fundamentals',
    description: 'Memory addresses, dereferencing, null pointers',
    difficulty: 'beginner'
  },
  SMART_POINTERS: {
    key: 'smart_pointers',
    title: 'Smart Pointers',
    description: 'Modern C++ memory management with smart pointers',
    difficulty: 'intermediate'
  },
  ARITHMETIC: {
    key: 'arithmetic',
    title: 'Pointer Arithmetic',
    description: 'Array traversal and pointer mathematics',
    difficulty: 'intermediate'
  },
  CONST_CORRECTNESS: {
    key: 'const_correctness',
    title: 'Const Correctness',
    description: 'Immutability and const pointer variations',
    difficulty: 'advanced'
  },
  FUNCTION_POINTERS: {
    key: 'function_pointers',
    title: 'Function Pointers',
    description: 'Runtime function selection and callbacks',
    difficulty: 'advanced'
  },
  MEMORY_MANAGEMENT: {
    key: 'memory_management',
    title: 'Memory Management',
    description: 'Heap allocation, memory leaks, and cleanup',
    difficulty: 'advanced'
  },
  RAII_LIFECYCLE: {
    key: 'raii_lifecycle',
    title: 'RAII Lifecycle',
    description: 'Resource acquisition and automatic cleanup',
    difficulty: 'advanced'
  },
  PERFORMANCE_OPTIMIZATION: {
    key: 'performance_optimization',
    title: 'Performance Optimization',
    description: '3D rendering optimization techniques',
    difficulty: 'expert'
  }
} as const;

// Performance monitoring utilities
export const PERFORMANCE_THRESHOLDS = {
  FPS: {
    HIGH: 55,
    MEDIUM: 40,
    LOW: 25
  },
  MEMORY: {
    WARNING: 100, // MB
    CRITICAL: 200 // MB
  },
  ANIMATIONS: {
    MAX_CONCURRENT: 20,
    PRIORITY_CUTOFF: 10
  }
} as const;

// Educational progression system
export const LEARNING_PATH = {
  BEGINNER: [EDUCATIONAL_TOPICS.FUNDAMENTALS],
  INTERMEDIATE: [
    EDUCATIONAL_TOPICS.FUNDAMENTALS,
    EDUCATIONAL_TOPICS.SMART_POINTERS,
    EDUCATIONAL_TOPICS.ARITHMETIC
  ],
  ADVANCED: [
    EDUCATIONAL_TOPICS.FUNDAMENTALS,
    EDUCATIONAL_TOPICS.SMART_POINTERS,
    EDUCATIONAL_TOPICS.ARITHMETIC,
    EDUCATIONAL_TOPICS.CONST_CORRECTNESS,
    EDUCATIONAL_TOPICS.FUNCTION_POINTERS,
    EDUCATIONAL_TOPICS.MEMORY_MANAGEMENT,
    EDUCATIONAL_TOPICS.RAII_LIFECYCLE
  ],
  EXPERT: Object.values(EDUCATIONAL_TOPICS)
} as const;

// Utility functions for educational content
export function getTopicByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert') {
  return Object.values(EDUCATIONAL_TOPICS).filter(topic => topic.difficulty === difficulty);
}

export function getNextTopic(currentTopicKey: string) {
  const topics = Object.values(EDUCATIONAL_TOPICS);
  const currentIndex = topics.findIndex(topic => topic.key === currentTopicKey);
  return topics[currentIndex + 1] || null;
}

export function getPreviousTopic(currentTopicKey: string) {
  const topics = Object.values(EDUCATIONAL_TOPICS);
  const currentIndex = topics.findIndex(topic => topic.key === currentTopicKey);
  return topics[currentIndex - 1] || null;
}

// Re-export translation utilities for convenience
export {
  get3DTranslation,
  get3DLabel,
  get3DMessage,
  get3DControl,
  getEducationalContent
} from '../translations/3d-visualization.es';