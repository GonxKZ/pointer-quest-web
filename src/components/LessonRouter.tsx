import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import LessonView from './LessonView';

// Lazy load migrated lesson components (1-10)
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

// Lazy load the other lesson components
const Lesson44_ObserverPattern = lazy(() => import('../lessons/Lesson44_ObserverPattern'));
const Lesson45_CommandPattern = lazy(() => import('../lessons/Lesson45_CommandPattern'));
const Lesson47_StrategyPattern = lazy(() => import('../lessons/Lesson47_StrategyPattern'));
const Lesson48_TemplateMetaprogramming = lazy(() => import('../lessons/Lesson48_TemplateMetaprogramming'));

// Available React component lessons
const reactLessons: Record<number, React.ComponentType> = {
  // Lecciones 1-10 temporalmente desactivadas debido a problemas de compatibilidad del design system
  // 1: Lesson01_RawPtr,
  // 2: Lesson02_NullPtr,
  // 3: Lesson03_DanglingPtr,
  // 4: Lesson04_HeapOwnership,
  // 5: Lesson05_DeleteUB,
  // 6: Lesson06_ArrayAllocation,
  // 7: Lesson07_ConstPointers,
  // 8: Lesson08_DoublePointer,
  // 9: Lesson09_ParameterOutput,
  // 10: Lesson10_UniquePtr,
  44: Lesson44_ObserverPattern,
  45: Lesson45_CommandPattern,
  47: Lesson47_StrategyPattern,
  48: Lesson48_TemplateMetaprogramming,
};

/**
 * LessonRouter component that determines whether to show a React component lesson
 * or fall back to the traditional static lesson view
 */
const LessonRouter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id || '1');

  // Check if this lesson has a React component implementation
  const LessonComponent = reactLessons[lessonId];

  if (LessonComponent) {
    // Render the React component lesson
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LessonComponent />
      </Suspense>
    );
  }

  // Fall back to the traditional lesson view for other lessons
  return <LessonView />;
};

export default LessonRouter;