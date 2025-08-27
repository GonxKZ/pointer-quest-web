import { lazy, Suspense, ComponentType } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lesson groups for better code splitting
export type LessonGroup = 'basic' | 'smart-pointers' | 'advanced' | 'patterns' | 'memory-management' | 'performance';

// Lazy loading configuration for lesson groups
const LESSON_GROUPS: Record<LessonGroup, { range: [number, number]; priority: 'high' | 'medium' | 'low' }> = {
  'basic': { range: [1, 20], priority: 'high' },
  'smart-pointers': { range: [21, 40], priority: 'high' },
  'advanced': { range: [41, 60], priority: 'medium' },
  'patterns': { range: [61, 80], priority: 'medium' },
  'memory-management': { range: [81, 100], priority: 'low' },
  'performance': { range: [101, 120], priority: 'low' }
};

// Lesson cache with TTL
const lessonCache = new Map<number, { component: ComponentType<any>; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Preload strategy
let preloadedGroups = new Set<LessonGroup>();

// Get lesson group for a lesson number
const getLessonGroup = (lessonNumber: number): LessonGroup => {
  for (const [group, { range }] of Object.entries(LESSON_GROUPS)) {
    if (lessonNumber >= range[0] && lessonNumber <= range[1]) {
      return group as LessonGroup;
    }
  }
  return 'basic';
};

// Format lesson number for import
const formatLessonNumber = (num: number): string => num.toString().padStart(2, '0');

// Dynamic import function with error handling
const importLesson = async (lessonNumber: number): Promise<ComponentType<any>> => {
  const formattedNumber = formatLessonNumber(lessonNumber);
  
  try {
    // Try to import the specific lesson
    let lessonModule;
    
    // Special cases for lessons with different naming patterns
    if (lessonNumber <= 60) {
      // Basic lessons with standard naming
      const lessonNames = {
        1: 'RawPtr',
        2: 'NullPtr', 
        3: 'DanglingPtr',
        4: 'HeapOwnership',
        5: 'DeleteUB',
        6: 'ArrayAllocation',
        7: 'ConstPointers',
        8: 'DoublePointer',
        9: 'ParameterOutput',
        10: 'UniquePtr',
        11: 'UniquePtrArray',
        12: 'UniquePtrMovable',
        13: 'CustomDeleter',
        14: 'SharedPtr',
        15: 'SharedPtrCycle',
        16: 'WeakPtr',
        17: 'MakeShared',
        18: 'EnableSharedFromThis',
        19: 'AliasingConstructor',
        20: 'PointersVsReferences',
        21: 'ConstDeep',
        22: 'FunctionPointers',
        23: 'MemberDataPointers',
        24: 'PointerArithmetic',
        25: 'Span',
        26: 'VectorInvalidation',
        27: 'DequeStability',
        28: 'CastLaboratory',
        29: 'Alignment',
        30: 'PlacementNew',
        31: 'CInterfaces',
        32: 'ExceptionLeaks',
        33: 'SharedPtrCustomDeleter',
        34: 'SharedPtrArray',
        35: 'NotNull',
        36: 'ExplicitOwnership',
        37: 'CyclicSharedPtr',
        38: 'AtomicSharedPtr',
        39: 'VirtualDestructors',
        40: 'DeleterState',
        41: 'ConstCastTraps',
        42: 'FactoryPatterns',
        43: 'MakeSharedPerformance',
        44: 'ObserverPattern',
        45: 'CommandPattern',
        46: 'PimplIdiom',
        47: 'StrategyPattern',
        48: 'TemplateMetaprogramming',
        49: 'DoubleDeleteDetection',
        50: 'VectorUniquePtrReallocation',
        51: 'SharedPtrMultipleInheritance',
        52: 'InteractiveSignatureAnalyzer',
        53: 'LambdaCapturesSmartPointers',
        54: 'InteriorPointersStringViewSpan',
        55: 'OwnershipAuditSystem',
        56: 'ABISimulatorFunctionPointers',
        57: 'CInteropRAIIWrappers',
        58: 'PerformanceBattleCopyVsMove',
        59: 'SharedOwnerWithViewAliasing',
        60: 'FinalExamination'
      };
      
      const lessonName = lessonNames[lessonNumber as keyof typeof lessonNames];
      if (lessonName) {
        lessonModule = await import(`../lessons/Lesson${formattedNumber}_${lessonName}.tsx`);
      }
    } else {
      // Extended lessons (61-120) with different naming
      const extendedLessons = {
        61: 'StrictAliasing',
        62: 'BitCast',
        63: 'Launder',
        64: 'PlacementNew',
        65: 'AdvancedPlacementNew',
        66: 'TypePunning',
        67: 'MemoryAliasing',
        68: 'ObjectLifetime',
        69: 'LowLevelMemory',
        70: 'AdvancedMemoryPatterns',
        71: 'WeakPtr',
        72: 'StringView',
        73: 'Span',
        74: 'PMR',
        75: 'CustomDeleters',
        76: 'ResourceGuards',
        77: 'StringOptimization',
        78: 'MemoryArenas',
        79: 'MemoryTracking',
        80: 'MemoryDebugging',
        81: 'VirtualDestructors',
        82: 'MakeShared',
        83: 'RAIIHandles',
        84: 'ResourcePooling',
        85: 'SmartHandlePatterns',
        86: 'RAIIScopeGuards',
        87: 'ExceptionSafeRAII',
        88: 'RAIILifetimeManagement',
        89: 'ResourceOwnership',
        90: 'AdvancedRAIIPatterns',
        91: 'TaggedPointers',
        92: 'PointerCompression',
        93: 'PimplIdiom',
        94: 'OpaquePointers',
        95: 'HandleSystems',
        96: 'MemoryMappedFiles',
        97: 'ThreadSafePointers',
        98: 'AtomicSmartPointers',
        99: 'LockFreeDataStructures',
        100: 'AdvancedPointerPatterns',
        101: 'IntrusiveRefCounting',
        102: 'LambdaCapturesWithPointers',
        103: 'UndefinedBehaviorMuseum',
        104: 'MemoryAlignmentMastery',
        105: 'CompilerOptimizationInsights',
        106: 'AdvancedDebuggingTechniques',
        107: 'PerformanceProfiling',
        108: 'CrossPlatformConsiderations',
        109: 'ModernCppFeaturesIntegration',
        110: 'EnterprisePatternsCapstone',
        111: 'ReleaseManagementPatterns',
        112: 'StdFunctionPointerCallbacks',
        113: 'AdvancedTemplateMetaprogramming',
        114: 'ConcurrencyPatternsAdvanced',
        115: 'EmbeddedSystemsOptimization',
        116: 'GameEngineArchitecture',
        117: 'NetworkProgrammingPointers',
        118: 'DatabaseIntegrationPatterns',
        119: 'TestingValidationStrategies',
        120: 'MastersFinalExamination'
      };
      
      const lessonName = extendedLessons[lessonNumber as keyof typeof extendedLessons];
      if (lessonName) {
        lessonModule = await import(`../lessons/Lesson${formattedNumber}_${lessonName}.tsx`);
      }
    }
    
    if (lessonModule?.default) {
      return lessonModule.default;
    }
    
    throw new Error(`No default export found for lesson ${lessonNumber}`);
  } catch (error) {
    console.warn(`Failed to load Lesson ${lessonNumber}:`, error);
    
    // Fallback to a placeholder lesson
    return lazy(() => import('./PlaceholderLesson'));
  }
};

// Preload lessons in a group
export const preloadLessonGroup = async (group: LessonGroup): Promise<void> => {
  if (preloadedGroups.has(group)) return;
  
  const { range, priority } = LESSON_GROUPS[group];
  const [start, end] = range;
  
  // Only preload high priority groups immediately
  if (priority !== 'high') {
    // Delay preloading for medium/low priority
    setTimeout(() => preloadLessonGroupInternal(group, start, end), 
      priority === 'medium' ? 2000 : 5000);
    return;
  }
  
  await preloadLessonGroupInternal(group, start, end);
};

const preloadLessonGroupInternal = async (group: LessonGroup, start: number, end: number): Promise<void> => {
  const preloadPromises: Promise<void>[] = [];
  
  for (let i = start; i <= end; i++) {
    preloadPromises.push(
      importLesson(i).then(component => {
        lessonCache.set(i, {
          component,
          timestamp: Date.now()
        });
      }).catch(error => {
        console.warn(`Failed to preload lesson ${i}:`, error);
      })
    );
    
    // Batch preloading in groups of 5 to avoid overwhelming the network
    if (preloadPromises.length >= 5) {
      await Promise.allSettled(preloadPromises);
      preloadPromises.length = 0;
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  if (preloadPromises.length > 0) {
    await Promise.allSettled(preloadPromises);
  }
  
  preloadedGroups.add(group);
};

// Clean expired cache entries
const cleanCache = (): void => {
  const now = Date.now();
  const expired: number[] = [];
  
  lessonCache.forEach(({ timestamp }, lessonNumber) => {
    if (now - timestamp > CACHE_TTL) {
      expired.push(lessonNumber);
    }
  });
  
  expired.forEach(lessonNumber => lessonCache.delete(lessonNumber));
};

// Clean cache every 5 minutes
setInterval(cleanCache, 5 * 60 * 1000);

// Get cached or import lesson
export const getLessonComponent = async (lessonNumber: number): Promise<ComponentType<any>> => {
  // Check cache first
  const cached = lessonCache.get(lessonNumber);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.component;
  }
  
  // Import and cache
  const component = await importLesson(lessonNumber);
  lessonCache.set(lessonNumber, {
    component,
    timestamp: Date.now()
  });
  
  return component;
};

// React component for lazy loading lessons
interface LazyLessonProps {
  lessonNumber: number;
  preloadAdjacent?: boolean;
  [key: string]: any;
}

export const LazyLesson: React.FC<LazyLessonProps> = ({ 
  lessonNumber, 
  preloadAdjacent = true,
  ...props 
}) => {
  const group = getLessonGroup(lessonNumber);
  
  // Preload current group and adjacent lessons
  if (preloadAdjacent) {
    // Preload current group
    preloadLessonGroup(group);
    
    // Preload next/previous lessons
    if (lessonNumber > 1) {
      importLesson(lessonNumber - 1).catch(() => {});
    }
    if (lessonNumber < 120) {
      importLesson(lessonNumber + 1).catch(() => {});
    }
  }
  
  // Create lazy component
  const LessonComponent = lazy(() => 
    getLessonComponent(lessonNumber).then(component => ({ default: component }))
  );
  
  return (
    <Suspense fallback={<LoadingSpinner message={`Loading Lesson ${lessonNumber}...`} />}>
      <LessonComponent {...props} />
    </Suspense>
  );
};

// Performance monitoring
export const getLazyLoadingStats = () => ({
  cacheSize: lessonCache.size,
  preloadedGroups: Array.from(preloadedGroups),
  cacheHitRate: lessonCache.size > 0 ? 'Available' : 'Not available'
});

// Cleanup function for app shutdown
export const cleanupLazyLoader = (): void => {
  lessonCache.clear();
  preloadedGroups.clear();
};

export default LazyLesson;
