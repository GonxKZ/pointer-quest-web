// Tipos principales para Pointer Quest Web

export interface MemoryLocation {
  id: string;
  type: 'stack' | 'heap' | 'global';
  address: number;
  value: any;
  size: number;
  color: string;
}

export interface Pointer {
  id: string;
  name: string;
  targetId: string | null;
  address: number;
  color: string;
  type: 'raw' | 'unique' | 'shared' | 'weak';
  refCount?: number;
}

export interface MemoryVisualization {
  stack: MemoryLocation[];
  heap: MemoryLocation[];
  global: MemoryLocation[];
  pointers: Pointer[];
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  component: React.ComponentType;
  code: string;
  explanation: string;
  guidelines: string[];
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: number;
}

export interface UserProgress {
  currentLesson: number;
  completedLessons: number[];
  totalScore: number;
  achievements: string[];
}

export interface ThreeDVisualization {
  memoryBlocks: MemoryBlock3D[];
  pointers: Pointer3D[];
  animations: Animation[];
}

export interface MemoryBlock3D {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  type: 'stack' | 'heap' | 'global';
  value?: string;
}

export interface Pointer3D {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  type: 'raw' | 'unique' | 'shared' | 'weak';
  animated: boolean;
}

export interface Animation {
  id: string;
  type: 'move' | 'create' | 'delete' | 'error';
  targetId: string;
  duration: number;
  properties: Record<string, any>;
}
