import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import {
  StudentProfile,
  LessonProgress,
  StudySession,
  Achievement,
  studentProgress
} from '../utils/studentProgress';

interface StudentProgressContextType {
  // Profile management
  profile: StudentProfile | null;
  initializeProfile: (name: string, email?: string) => Promise<StudentProfile>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;

  // Session management
  currentSession: StudySession | null;
  startSession: () => StudySession;
  endSession: (notes?: string) => Promise<StudySession | null>;

  // Progress tracking
  recordLessonProgress: (
    lessonId: number,
    score: number,
    timeSpent: number,
    exercises?: any[],
    notes?: string
  ) => Promise<void>;
  getLessonProgress: (lessonId: number) => LessonProgress | null;
  getAllProgress: () => LessonProgress[];

  // Statistics and analytics
  getProgressStats: () => {
    totalLessons: number;
    completedLessons: number;
    completionRate: number;
    averageScore: number;
    totalTimeSpent: number;
    currentStreak: number;
    longestStreak: number;
  };
  getTopicProgress: () => Array<{
    topic: string;
    range: string;
    completed: number;
    total: number;
    percentage: number;
    averageScore: number;
  }>;
  getRecentActivity: (days?: number) => Array<{
    date: Date;
    lessonsCompleted: number;
    timeSpent: number;
    averageScore: number;
  }>;

  // Data management
  exportProgress: () => ReturnType<typeof studentProgress.exportProgress>;
  importProgress: (data: ReturnType<typeof studentProgress.exportProgress>) => Promise<void>;
  clearAllProgress: () => Promise<void>;

  // Achievement system
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  
  // UI State
  showAchievementNotification: Achievement | null;
  dismissAchievementNotification: () => void;
}

const StudentProgressContext = createContext<StudentProgressContextType | undefined>(undefined);

export function useStudentProgress() {
  const context = useContext(StudentProgressContext);
  if (!context) {
    throw new Error('useStudentProgress must be used within a StudentProgressProvider');
  }
  return context;
}

interface StudentProgressProviderProps {
  children: ReactNode;
}

// Export everything needed from this module
export { studentProgress } from '../utils/studentProgress';
export type {
  StudentProfile,
  LessonProgress,
  StudySession,
  Achievement,
  StudentPreferences,
  ExerciseProgress
} from '../utils/studentProgress';

export function StudentProgressProvider({ children }: StudentProgressProviderProps) {
  const [profile, setProfile] = React.useState<StudentProfile | null>(null);
  const [currentSession, setCurrentSession] = React.useState<StudySession | null>(null);
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = React.useState<Achievement[]>([]);
  const [showAchievementNotification, setShowAchievementNotification] = React.useState<Achievement | null>(null);

  // Initialize on mount
  useEffect(() => {
    const existingProfile = studentProgress.getProfile();
    if (existingProfile) {
      setProfile(existingProfile);
      setAchievements(existingProfile.achievements);
    }

    // Listen for achievement unlocks
    const handleAchievementUnlock = (event: CustomEvent<Achievement>) => {
      const achievement = event.detail;
      setUnlockedAchievements(prev => [...prev, achievement]);
      setShowAchievementNotification(achievement);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setShowAchievementNotification(null);
      }, 5000);
    };

    window.addEventListener('achievement-unlocked', handleAchievementUnlock as EventListener);

    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievementUnlock as EventListener);
    };
  }, []);

  const initializeProfile = async (name: string, email?: string): Promise<StudentProfile> => {
    const newProfile = await studentProgress.initializeProfile(name, email);
    setProfile(newProfile);
    setAchievements(newProfile.achievements);
    return newProfile;
  };

  const updateProfile = async (updates: Partial<StudentProfile>): Promise<void> => {
    await studentProgress.updateProfile(updates);
    const updatedProfile = studentProgress.getProfile();
    if (updatedProfile) {
      setProfile(updatedProfile);
      setAchievements(updatedProfile.achievements);
    }
  };

  const startSession = (): StudySession => {
    const session = studentProgress.startSession();
    setCurrentSession(session);
    return session;
  };

  const endSession = async (notes?: string): Promise<StudySession | null> => {
    const session = await studentProgress.endSession(notes);
    setCurrentSession(null);
    
    // Update profile state
    const updatedProfile = studentProgress.getProfile();
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
    
    return session;
  };

  const recordLessonProgress = async (
    lessonId: number,
    score: number,
    timeSpent: number,
    exercises: any[] = [],
    notes?: string
  ): Promise<void> => {
    await studentProgress.recordLessonProgress(lessonId, score, timeSpent, exercises, notes);
    
    // Update profile state to reflect new achievements
    const updatedProfile = studentProgress.getProfile();
    if (updatedProfile) {
      setProfile(updatedProfile);
      
      // Check for new achievements
      const newAchievements = updatedProfile.achievements.filter(
        newAchievement => !achievements.some(existing => existing.id === newAchievement.id)
      );
      
      setAchievements(updatedProfile.achievements);
      
      // Add new achievements to unlocked list
      if (newAchievements.length > 0) {
        setUnlockedAchievements(prev => [...prev, ...newAchievements]);
      }
    }
  };

  const getLessonProgress = (lessonId: number): LessonProgress | null => {
    return studentProgress.getLessonProgress(lessonId);
  };

  const getAllProgress = (): LessonProgress[] => {
    return studentProgress.getAllProgress();
  };

  const getProgressStats = () => {
    return studentProgress.getProgressStats();
  };

  const getTopicProgress = () => {
    return studentProgress.getTopicProgress();
  };

  const getRecentActivity = (days: number = 7) => {
    return studentProgress.getRecentActivity(days);
  };

  const exportProgress = () => {
    return studentProgress.exportProgress();
  };

  const importProgress = async (data: ReturnType<typeof studentProgress.exportProgress>): Promise<void> => {
    await studentProgress.importProgress(data);
    
    // Refresh state
    const updatedProfile = studentProgress.getProfile();
    if (updatedProfile) {
      setProfile(updatedProfile);
      setAchievements(updatedProfile.achievements);
    }
  };

  const clearAllProgress = async (): Promise<void> => {
    await studentProgress.clearAllProgress();
    
    // Reset state
    setProfile(studentProgress.getProfile());
    setAchievements([]);
    setUnlockedAchievements([]);
    setCurrentSession(null);
    setShowAchievementNotification(null);
  };

  const dismissAchievementNotification = (): void => {
    setShowAchievementNotification(null);
  };

  const value: StudentProgressContextType = {
    // Profile management
    profile,
    initializeProfile,
    updateProfile,

    // Session management
    currentSession,
    startSession,
    endSession,

    // Progress tracking
    recordLessonProgress,
    getLessonProgress,
    getAllProgress,

    // Statistics and analytics
    getProgressStats,
    getTopicProgress,
    getRecentActivity,

    // Data management
    exportProgress,
    importProgress,
    clearAllProgress,

    // Achievement system
    achievements,
    unlockedAchievements,
    
    // UI State
    showAchievementNotification,
    dismissAchievementNotification
  };

  return (
    <StudentProgressContext.Provider value={value}>
      {children}
    </StudentProgressContext.Provider>
  );
}