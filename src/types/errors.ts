// Comprehensive error boundary type definitions for C++ pointer education app

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

export interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  url: string;
  userAgent: string;
  buildVersion?: string;
}

export enum ErrorType {
  RENDER_ERROR = 'RENDER_ERROR',
  CHUNK_LOAD_ERROR = 'CHUNK_LOAD_ERROR',
  WASM_ERROR = 'WASM_ERROR',
  THREEJS_ERROR = 'THREEJS_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERFORMANCE_ERROR = 'PERFORMANCE_ERROR',
  USER_INPUT_ERROR = 'USER_INPUT_ERROR',
  LESSON_CONTENT_ERROR = 'LESSON_CONTENT_ERROR',
  MEMORY_ERROR = 'MEMORY_ERROR',
  ANIMATION_ERROR = 'ANIMATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorBoundaryConfig {
  name: string;
  level: 'app' | 'route' | 'component' | 'feature';
  enableRetry: boolean;
  maxRetries: number;
  enableFallback: boolean;
  enableLogging: boolean;
  enableDevelopmentInfo: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onReset?: () => void;
}

export interface FallbackProps {
  error: Error;
  resetError: () => void;
  retry: () => void;
  canRetry: boolean;
  retryCount: number;
  errorType: ErrorType;
  severity: ErrorSeverity;
  boundaryName: string;
}

export interface ErrorRecoveryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: ErrorType;
  severity: ErrorSeverity;
  retryCount: number;
  lastRetryTime: number;
  isRecovering: boolean;
  recoveryAttempted: boolean;
}

// Performance-related error types
export interface PerformanceErrorDetails {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  componentCount: number;
  threejsObjects: number;
  wasmMemory: number;
}

// WebAssembly-specific error types
export interface WasmErrorDetails {
  module: string;
  function?: string;
  wasmError: boolean;
  fallbackAvailable: boolean;
  compilationError: boolean;
  runtimeError: boolean;
}

// Three.js-specific error types
export interface ThreeJsErrorDetails {
  renderer: string;
  scene: string;
  camera: string;
  geometryCount: number;
  materialCount: number;
  textureCount: number;
  webglError: boolean;
  shaderError: boolean;
}

// Lesson-specific error types
export interface LessonErrorDetails {
  lessonId: string;
  stepNumber: number;
  interactiveElement?: string;
  codeExample?: string;
  visualizationActive: boolean;
}

// Error logging interface
export interface ErrorLogger {
  logError: (error: ErrorDetails) => Promise<void>;
  logPerformanceError: (error: ErrorDetails & PerformanceErrorDetails) => Promise<void>;
  logWasmError: (error: ErrorDetails & WasmErrorDetails) => Promise<void>;
  logThreeJsError: (error: ErrorDetails & ThreeJsErrorDetails) => Promise<void>;
  logLessonError: (error: ErrorDetails & LessonErrorDetails) => Promise<void>;
}

// Error boundary hooks interface
export interface ErrorBoundaryHooks {
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: (retryCount: number) => void;
  onRecovery?: (wasSuccessful: boolean) => void;
  onFallback?: (reason: string) => void;
}

// Global error state for error context
export interface GlobalErrorState {
  errors: ErrorDetails[];
  recentErrors: ErrorDetails[];
  errorCount: number;
  lastErrorTime: number;
  isRecovering: boolean;
  suppressedErrors: string[];
}

export interface ErrorContextValue {
  state: GlobalErrorState;
  logError: (error: ErrorDetails) => void;
  clearErrors: () => void;
  suppressError: (errorType: string) => void;
  unsuppressError: (errorType: string) => void;
  isErrorSuppressed: (errorType: string) => boolean;
}