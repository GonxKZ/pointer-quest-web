import { spanishTranslations } from './es';

export interface Translations {
  title: string;
  description: string;
  objective: string;
  keyPoints: string[];
  challenge: string;
  solution: string;
  explanation: string;
  codeExamples?: string[];
}

export const translateLesson = (
  lesson: Translations, 
  language: 'en' | 'es'
): Translations => {
  if (language === 'es') {
    const spanishMapping = {
      title: lesson.title,
      description: lesson.description,
      objective: lesson.objective,
      keyPoints: lesson.keyPoints,
      challenge: lesson.challenge,
      solution: lesson.solution,
      explanation: lesson.explanation,
      codeExamples: lesson.codeExamples
    };
    return spanishMapping;
  }
  return lesson;
};

export const getTranslatedLessonTerms = () => spanishTranslations.terminology;