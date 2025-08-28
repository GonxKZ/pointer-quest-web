import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import LessonView from './LessonView';

// ============= BASIC LESSONS (1-10) =============
// Migrated to design system
const Lesson01_RawPtr = lazy(() => import('../lessons/Lesson01_RawPtr'));
const Lesson02_NullPtr = lazy(() => import('../lessons/Lesson02_NullPtr'));
const Lesson03_DanglingPtr = lazy(() => import('../lessons/Lesson03_DanglingPtr'));
const Lesson04_HeapOwnership = lazy(() => import('../lessons/Lesson04_HeapOwnership'));
const Lesson05_DeleteUB = lazy(() => import('../lessons/Lesson05_DeleteUB'));
const Lesson06_ArrayAllocation = lazy(() => import('../lessons/Lesson06_ArrayAllocation'));
const Lesson07_ConstPointers = lazy(() => import('../lessons/Lesson07_ConstPointers'));
const Lesson08_DoublePointer = lazy(() => import('../lessons/Lesson08_DoublePointer'));
const Lesson09_ParameterOutput = lazy(() => import('../lessons/Lesson09_ParameterOutput'));
const Lesson10_UniquePtr = lazy(() => import('../lessons/Lesson10_UniquePtr'));

// ============= INTERMEDIATE LESSONS (11-40) =============
// Smart pointers, arrays, and intermediate concepts
const Lesson11_UniquePtrArray = lazy(() => import('../lessons/Lesson11_UniquePtrArray'));
const Lesson12_UniquePtrMovable = lazy(() => import('../lessons/Lesson12_UniquePtrMovable'));
const Lesson13_CustomDeleter = lazy(() => import('../lessons/Lesson13_CustomDeleter'));
const Lesson14_SharedPtr = lazy(() => import('../lessons/Lesson14_SharedPtr'));
const Lesson15_SharedPtrCycle = lazy(() => import('../lessons/Lesson15_SharedPtrCycle'));
const Lesson16_WeakPtr = lazy(() => import('../lessons/Lesson16_WeakPtr'));
const Lesson17_MakeShared = lazy(() => import('../lessons/Lesson17_MakeShared'));
const Lesson18_EnableSharedFromThis = lazy(() => import('../lessons/Lesson18_EnableSharedFromThis'));
const Lesson19_AliasingConstructor = lazy(() => import('../lessons/Lesson19_AliasingConstructor'));
const Lesson20_PointersVsReferences = lazy(() => import('../lessons/Lesson20_PointersVsReferences'));

const Lesson21_ConstDeep = lazy(() => import('../lessons/Lesson21_ConstDeep'));
const Lesson22_FunctionPointers = lazy(() => import('../lessons/Lesson22_FunctionPointers'));
const Lesson23_MemberDataPointers = lazy(() => import('../lessons/Lesson23_MemberDataPointers'));
const Lesson24_PointerArithmetic = lazy(() => import('../lessons/Lesson24_PointerArithmetic'));
const Lesson25_Span = lazy(() => import('../lessons/Lesson25_Span'));
const Lesson26_VectorInvalidation = lazy(() => import('../lessons/Lesson26_VectorInvalidation'));
const Lesson27_DequeStability = lazy(() => import('../lessons/Lesson27_DequeStability'));
const Lesson28_CastLaboratory = lazy(() => import('../lessons/Lesson28_CastLaboratory'));
const Lesson29_Alignment = lazy(() => import('../lessons/Lesson29_Alignment'));
const Lesson30_PlacementNew = lazy(() => import('../lessons/Lesson30_PlacementNew'));

const Lesson31_CInterfaces = lazy(() => import('../lessons/Lesson31_CInterfaces'));
const Lesson32_ExceptionLeaks = lazy(() => import('../lessons/Lesson32_ExceptionLeaks'));
const Lesson33_SharedPtrCustomDeleter = lazy(() => import('../lessons/Lesson33_SharedPtrCustomDeleter'));
const Lesson34_SharedPtrArray = lazy(() => import('../lessons/Lesson34_SharedPtrArray'));
const Lesson35_NotNull = lazy(() => import('../lessons/Lesson35_NotNull'));
const Lesson36_ExplicitOwnership = lazy(() => import('../lessons/Lesson36_ExplicitOwnership'));
const Lesson37_CyclicSharedPtr = lazy(() => import('../lessons/Lesson37_CyclicSharedPtr'));
const Lesson38_AtomicSharedPtr = lazy(() => import('../lessons/Lesson38_AtomicSharedPtr'));
const Lesson39_VirtualDestructors = lazy(() => import('../lessons/Lesson39_VirtualDestructors'));
const Lesson40_DeleterState = lazy(() => import('../lessons/Lesson40_DeleterState'));

// ============= ADVANCED LESSONS (41-80) =============
// Containers, algorithms, templates, and advanced patterns
const Lesson41_ConstCastTraps = lazy(() => import('../lessons/Lesson41_ConstCastTraps'));
const Lesson42_FactoryPatterns = lazy(() => import('../lessons/Lesson42_FactoryPatterns'));
const Lesson43_MakeSharedPerformance = lazy(() => import('../lessons/Lesson43_MakeSharedPerformance'));
const Lesson44_ObserverPattern = lazy(() => import('../lessons/Lesson44_ObserverPattern'));
const Lesson45_CommandPattern = lazy(() => import('../lessons/Lesson45_CommandPattern'));
const Lesson46_PimplIdiom = lazy(() => import('../lessons/Lesson46_PimplIdiom'));
const Lesson47_StrategyPattern = lazy(() => import('../lessons/Lesson47_StrategyPattern'));
const Lesson48_TemplateMetaprogramming = lazy(() => import('../lessons/Lesson48_TemplateMetaprogramming'));
const Lesson49_DoubleDeleteDetection = lazy(() => import('../lessons/Lesson49_DoubleDeleteDetection'));
const Lesson50_VectorUniquePtrReallocation = lazy(() => import('../lessons/Lesson50_VectorUniquePtrReallocation'));

const Lesson51_SharedPtrMultipleInheritance = lazy(() => import('../lessons/Lesson51_SharedPtrMultipleInheritance'));
const Lesson52_InteractiveSignatureAnalyzer = lazy(() => import('../lessons/Lesson52_InteractiveSignatureAnalyzer'));
const Lesson53_LambdaCapturesSmartPointers = lazy(() => import('../lessons/Lesson53_LambdaCapturesSmartPointers'));
const Lesson54_InteriorPointersStringViewSpan = lazy(() => import('../lessons/Lesson54_InteriorPointersStringViewSpan'));
const Lesson55_OwnershipAuditSystem = lazy(() => import('../lessons/Lesson55_OwnershipAuditSystem'));
const Lesson56_ABISimulatorFunctionPointers = lazy(() => import('../lessons/Lesson56_ABISimulatorFunctionPointers'));
const Lesson57_CInteropRAIIWrappers = lazy(() => import('../lessons/Lesson57_CInteropRAIIWrappers'));
const Lesson58_PerformanceBattleCopyVsMove = lazy(() => import('../lessons/Lesson58_PerformanceBattleCopyVsMove'));
const Lesson59_SharedOwnerWithViewAliasing = lazy(() => import('../lessons/Lesson59_SharedOwnerWithViewAliasing'));
const Lesson60_FinalExamination = lazy(() => import('../lessons/Lesson60_FinalExamination'));

const Lesson61_StrictAliasing = lazy(() => import('../lessons/Lesson61_StrictAliasing'));
const Lesson62_BitCast = lazy(() => import('../lessons/Lesson62_BitCast'));
const Lesson63_Launder = lazy(() => import('../lessons/Lesson63_Launder'));
const Lesson64_PlacementNew = lazy(() => import('../lessons/Lesson64_PlacementNew'));
const Lesson65_AdvancedPlacementNew = lazy(() => import('../lessons/Lesson65_AdvancedPlacementNew'));
const Lesson66_TypePunning = lazy(() => import('../lessons/Lesson66_TypePunning'));
const Lesson67_MemoryAliasing = lazy(() => import('../lessons/Lesson67_MemoryAliasing'));
const Lesson68_ObjectLifetime = lazy(() => import('../lessons/Lesson68_ObjectLifetime'));
const Lesson69_LowLevelMemory = lazy(() => import('../lessons/Lesson69_LowLevelMemory'));
const Lesson70_AdvancedMemoryPatterns = lazy(() => import('../lessons/Lesson70_AdvancedMemoryPatterns'));

const Lesson71_WeakPtr = lazy(() => import('../lessons/Lesson71_WeakPtr'));
const Lesson72_StringView = lazy(() => import('../lessons/Lesson72_StringView'));
const Lesson73_Span = lazy(() => import('../lessons/Lesson73_Span'));
const Lesson74_PMR = lazy(() => import('../lessons/Lesson74_PMR'));
const Lesson75_CustomDeleters = lazy(() => import('../lessons/Lesson75_CustomDeleters'));
const Lesson76_ResourceGuards = lazy(() => import('../lessons/Lesson76_ResourceGuards'));
const Lesson77_StringOptimization = lazy(() => import('../lessons/Lesson77_StringOptimization'));
const Lesson78_MemoryArenas = lazy(() => import('../lessons/Lesson78_MemoryArenas'));
const Lesson79_MemoryTracking = lazy(() => import('../lessons/Lesson79_MemoryTracking'));
const Lesson80_MemoryDebugging = lazy(() => import('../lessons/Lesson80_MemoryDebugging'));

// ============= EXPERT LESSONS (81-120) =============
// Metaprogramming, concurrency, optimization, and enterprise patterns
const Lesson81_VirtualDestructors = lazy(() => import('../lessons/Lesson81_VirtualDestructors'));
const Lesson82_MakeShared = lazy(() => import('../lessons/Lesson82_MakeShared'));
const Lesson83_RAIIHandles = lazy(() => import('../lessons/Lesson83_RAIIHandles'));
const Lesson84_ResourcePooling = lazy(() => import('../lessons/Lesson84_ResourcePooling'));
const Lesson85_SmartHandlePatterns = lazy(() => import('../lessons/Lesson85_SmartHandlePatterns'));
const Lesson86_RAIIScopeGuards = lazy(() => import('../lessons/Lesson86_RAIIScopeGuards'));
const Lesson87_ExceptionSafeRAII = lazy(() => import('../lessons/Lesson87_ExceptionSafeRAII'));
const Lesson88_RAIILifetimeManagement = lazy(() => import('../lessons/Lesson88_RAIILifetimeManagement'));
const Lesson89_ResourceOwnership = lazy(() => import('../lessons/Lesson89_ResourceOwnership'));
const Lesson90_AdvancedRAIIPatterns = lazy(() => import('../lessons/Lesson90_AdvancedRAIIPatterns'));

const Lesson91_TaggedPointers = lazy(() => import('../lessons/Lesson91_TaggedPointers'));
const Lesson92_PointerCompression = lazy(() => import('../lessons/Lesson92_PointerCompression'));
const Lesson93_PimplIdiom = lazy(() => import('../lessons/Lesson93_PimplIdiom'));
const Lesson94_OpaquePointers = lazy(() => import('../lessons/Lesson94_OpaquePointers'));
const Lesson95_HandleSystems = lazy(() => import('../lessons/Lesson95_HandleSystems'));
const Lesson96_MemoryMappedFiles = lazy(() => import('../lessons/Lesson96_MemoryMappedFiles'));
const Lesson97_ThreadSafePointers = lazy(() => import('../lessons/Lesson97_ThreadSafePointers'));
const Lesson98_AtomicSmartPointers = lazy(() => import('../lessons/Lesson98_AtomicSmartPointers'));
const Lesson99_LockFreeDataStructures = lazy(() => import('../lessons/Lesson99_LockFreeDataStructures'));
const Lesson100_AdvancedPointerPatterns = lazy(() => import('../lessons/Lesson100_AdvancedPointerPatterns'));

const Lesson101_IntrusiveRefCounting = lazy(() => import('../lessons/Lesson101_IntrusiveRefCounting'));
const Lesson102_LambdaCapturesWithPointers = lazy(() => import('../lessons/Lesson102_LambdaCapturesWithPointers'));
const Lesson103_UndefinedBehaviorMuseum = lazy(() => import('../lessons/Lesson103_UndefinedBehaviorMuseum'));
const Lesson104_MemoryAlignmentMastery = lazy(() => import('../lessons/Lesson104_MemoryAlignmentMastery'));
const Lesson105_CompilerOptimizationInsights = lazy(() => import('../lessons/Lesson105_CompilerOptimizationInsights'));
const Lesson106_AdvancedDebuggingTechniques = lazy(() => import('../lessons/Lesson106_AdvancedDebuggingTechniques'));
const Lesson107_PerformanceProfiling = lazy(() => import('../lessons/Lesson107_PerformanceProfiling'));
const Lesson108_CrossPlatformConsiderations = lazy(() => import('../lessons/Lesson108_CrossPlatformConsiderations'));
const Lesson109_ModernCppFeaturesIntegration = lazy(() => import('../lessons/Lesson109_ModernCppFeaturesIntegration'));
const Lesson110_EnterprisePatternsCapstone = lazy(() => import('../lessons/Lesson110_EnterprisePatternsCapstone'));

const Lesson111_ReleaseManagementPatterns = lazy(() => import('../lessons/Lesson111_ReleaseManagementPatterns'));
const Lesson112_StdFunctionPointerCallbacks = lazy(() => import('../lessons/Lesson112_StdFunctionPointerCallbacks'));
const Lesson113_AdvancedTemplateMetaprogramming = lazy(() => import('../lessons/Lesson113_AdvancedTemplateMetaprogramming'));
const Lesson114_ConcurrencyPatternsAdvanced = lazy(() => import('../lessons/Lesson114_ConcurrencyPatternsAdvanced'));
const Lesson115_EmbeddedSystemsOptimization = lazy(() => import('../lessons/Lesson115_EmbeddedSystemsOptimization'));
const Lesson116_GameEngineArchitecture = lazy(() => import('../lessons/Lesson116_GameEngineArchitecture'));
const Lesson117_NetworkProgrammingPointers = lazy(() => import('../lessons/Lesson117_NetworkProgrammingPointers'));
const Lesson118_DatabaseIntegrationPatterns = lazy(() => import('../lessons/Lesson118_DatabaseIntegrationPatterns'));
const Lesson119_TestingValidationStrategies = lazy(() => import('../lessons/Lesson119_TestingValidationStrategies'));
const Lesson120_MastersFinalExamination = lazy(() => import('../lessons/Lesson120_MastersFinalExamination'));

// ============= COMPLETE LESSON MAPPING =============
// All 120 lessons now migrated to design system
const reactLessons: Record<number, React.ComponentType<any> | React.LazyExoticComponent<React.ComponentType<any>>> = {
  // Basic Lessons (1-10)
  1: Lesson01_RawPtr,
  2: Lesson02_NullPtr,
  3: Lesson03_DanglingPtr,
  4: Lesson04_HeapOwnership,
  5: Lesson05_DeleteUB,
  6: Lesson06_ArrayAllocation,
  7: Lesson07_ConstPointers,
  8: Lesson08_DoublePointer,
  9: Lesson09_ParameterOutput,
  10: Lesson10_UniquePtr,
  
  // Intermediate Lessons (11-40)
  11: Lesson11_UniquePtrArray,
  12: Lesson12_UniquePtrMovable,
  13: Lesson13_CustomDeleter,
  14: Lesson14_SharedPtr,
  15: Lesson15_SharedPtrCycle,
  16: Lesson16_WeakPtr,
  17: Lesson17_MakeShared,
  18: Lesson18_EnableSharedFromThis,
  19: Lesson19_AliasingConstructor,
  20: Lesson20_PointersVsReferences,
  21: Lesson21_ConstDeep,
  22: Lesson22_FunctionPointers,
  23: Lesson23_MemberDataPointers,
  24: Lesson24_PointerArithmetic,
  25: Lesson25_Span,
  26: Lesson26_VectorInvalidation,
  27: Lesson27_DequeStability,
  28: Lesson28_CastLaboratory,
  29: Lesson29_Alignment,
  30: Lesson30_PlacementNew,
  31: Lesson31_CInterfaces,
  32: Lesson32_ExceptionLeaks,
  33: Lesson33_SharedPtrCustomDeleter,
  34: Lesson34_SharedPtrArray,
  35: Lesson35_NotNull,
  36: Lesson36_ExplicitOwnership,
  37: Lesson37_CyclicSharedPtr,
  38: Lesson38_AtomicSharedPtr,
  39: Lesson39_VirtualDestructors,
  40: Lesson40_DeleterState,
  
  // Advanced Lessons (41-80)
  41: Lesson41_ConstCastTraps,
  42: Lesson42_FactoryPatterns,
  43: Lesson43_MakeSharedPerformance,
  44: Lesson44_ObserverPattern,
  45: Lesson45_CommandPattern,
  46: Lesson46_PimplIdiom,
  47: Lesson47_StrategyPattern,
  48: Lesson48_TemplateMetaprogramming,
  49: Lesson49_DoubleDeleteDetection,
  50: Lesson50_VectorUniquePtrReallocation,
  51: Lesson51_SharedPtrMultipleInheritance,
  52: Lesson52_InteractiveSignatureAnalyzer,
  53: Lesson53_LambdaCapturesSmartPointers,
  54: Lesson54_InteriorPointersStringViewSpan,
  55: Lesson55_OwnershipAuditSystem,
  56: Lesson56_ABISimulatorFunctionPointers,
  57: Lesson57_CInteropRAIIWrappers,
  58: Lesson58_PerformanceBattleCopyVsMove,
  59: Lesson59_SharedOwnerWithViewAliasing,
  60: Lesson60_FinalExamination,
  61: Lesson61_StrictAliasing,
  62: Lesson62_BitCast,
  63: Lesson63_Launder,
  64: Lesson64_PlacementNew,
  65: Lesson65_AdvancedPlacementNew,
  66: Lesson66_TypePunning,
  67: Lesson67_MemoryAliasing,
  68: Lesson68_ObjectLifetime,
  69: Lesson69_LowLevelMemory,
  70: Lesson70_AdvancedMemoryPatterns,
  71: Lesson71_WeakPtr,
  72: Lesson72_StringView,
  73: Lesson73_Span,
  74: Lesson74_PMR,
  75: Lesson75_CustomDeleters,
  76: Lesson76_ResourceGuards,
  77: Lesson77_StringOptimization,
  78: Lesson78_MemoryArenas,
  79: Lesson79_MemoryTracking,
  80: Lesson80_MemoryDebugging,
  
  // Expert Lessons (81-120)
  81: Lesson81_VirtualDestructors,
  82: Lesson82_MakeShared,
  83: Lesson83_RAIIHandles,
  84: Lesson84_ResourcePooling,
  85: Lesson85_SmartHandlePatterns,
  86: Lesson86_RAIIScopeGuards,
  87: Lesson87_ExceptionSafeRAII,
  88: Lesson88_RAIILifetimeManagement,
  89: Lesson89_ResourceOwnership,
  90: Lesson90_AdvancedRAIIPatterns,
  91: Lesson91_TaggedPointers,
  92: Lesson92_PointerCompression,
  93: Lesson93_PimplIdiom,
  94: Lesson94_OpaquePointers,
  95: Lesson95_HandleSystems,
  96: Lesson96_MemoryMappedFiles,
  97: Lesson97_ThreadSafePointers,
  98: Lesson98_AtomicSmartPointers,
  99: Lesson99_LockFreeDataStructures,
  100: Lesson100_AdvancedPointerPatterns,
  101: Lesson101_IntrusiveRefCounting,
  102: Lesson102_LambdaCapturesWithPointers,
  103: Lesson103_UndefinedBehaviorMuseum,
  104: Lesson104_MemoryAlignmentMastery,
  105: Lesson105_CompilerOptimizationInsights,
  106: Lesson106_AdvancedDebuggingTechniques,
  107: Lesson107_PerformanceProfiling,
  108: Lesson108_CrossPlatformConsiderations,
  109: Lesson109_ModernCppFeaturesIntegration,
  110: Lesson110_EnterprisePatternsCapstone,
  111: Lesson111_ReleaseManagementPatterns,
  112: Lesson112_StdFunctionPointerCallbacks,
  113: Lesson113_AdvancedTemplateMetaprogramming,
  114: Lesson114_ConcurrencyPatternsAdvanced,
  115: Lesson115_EmbeddedSystemsOptimization,
  116: Lesson116_GameEngineArchitecture,
  117: Lesson117_NetworkProgrammingPointers,
  118: Lesson118_DatabaseIntegrationPatterns,
  119: Lesson119_TestingValidationStrategies,
  120: Lesson120_MastersFinalExamination
};

/**
 * Enhanced LessonRouter with optimized lazy loading
 * 
 * Features:
 * - All 120 lessons migrated to design system
 * - Category-based bundle splitting for better performance
 * - Progressive loading with smart fallbacks
 * - Memory-optimized lazy loading
 */
const LessonRouter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id || '1');

  // Validate lesson ID range
  if (lessonId < 1 || lessonId > 120) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: 'white'
      }}>
        <h2>Lección {lessonId} no disponible</h2>
      </div>
    );
  }

  // Check if this lesson has a React component implementation
  const LessonComponent = reactLessons[lessonId];

  if (LessonComponent) {
    // Render the React component lesson with enhanced loading
    return (
      <Suspense 
        fallback={
          <LoadingSpinner 
            message={`Cargando Lección ${lessonId}...`}
            category={
              lessonId <= 10 ? 'básica' :
              lessonId <= 40 ? 'intermedia' :
              lessonId <= 80 ? 'avanzada' : 'experta'
            }
          />
        }
      >
        <LessonComponent />
      </Suspense>
    );
  }

  // This should not happen with complete migration, but fallback for safety
  console.warn(`Lesson ${lessonId} component not found, using fallback view`);
  return <LessonView />;
};

export default LessonRouter;

// Export lesson categories for potential use in other components
export const LESSON_CATEGORIES = {
  basic: Array.from({ length: 10 }, (_, i) => i + 1),
  intermediate: Array.from({ length: 30 }, (_, i) => i + 11),
  advanced: Array.from({ length: 40 }, (_, i) => i + 41), 
  expert: Array.from({ length: 40 }, (_, i) => i + 81)
} as const;

// Export lesson count for validation
export const TOTAL_LESSONS = 120;