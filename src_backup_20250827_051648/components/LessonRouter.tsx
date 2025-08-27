import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import LessonView from './LessonView';

// Lazy load the new lesson components
const Lesson44_ObserverPattern = lazy(() => import('../lessons/Lesson44_ObserverPattern'));
const Lesson45_CommandPattern = lazy(() => import('../lessons/Lesson45_CommandPattern'));
const Lesson47_StrategyPattern = lazy(() => import('../lessons/Lesson47_StrategyPattern'));
const Lesson48_TemplateMetaprogramming = lazy(() => import('../lessons/Lesson48_TemplateMetaprogramming'));

// Available React component lessons
const reactLessons: Record<number, React.ComponentType> = {
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