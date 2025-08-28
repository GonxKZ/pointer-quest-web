import { useState, useEffect, useCallback } from 'react';
import { useStudentProgress as useStudentProgressContext } from '../context/StudentProgressContext';
import { LessonProgress } from '../utils/studentProgress';

/**
 * Hook for lesson-specific progress management
 */
export function useLessonProgress(lessonId: number) {
  const { 
    recordLessonProgress, 
    getLessonProgress, 
    startSession: _startSession, 
    endSession: _endSession,
    currentSession 
  } = useStudentProgressContext();

  const [progress, setProgress] = useState<LessonProgress | null>(() => 
    getLessonProgress(lessonId)
  );
  const [isCompleted, setIsCompleted] = useState(() => 
    progress?.completed || false
  );
  const [currentScore, setCurrentScore] = useState(() => 
    progress?.score || 0
  );
  const [timeSpent, setTimeSpent] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Update progress when lessonId changes
  useEffect(() => {
    const lessonProgress = getLessonProgress(lessonId);
    setProgress(lessonProgress);
    setIsCompleted(lessonProgress?.completed || false);
    setCurrentScore(lessonProgress?.score || 0);
  }, [lessonId, getLessonProgress]);

  // Start timing when component mounts
  useEffect(() => {
    setSessionStartTime(new Date());
    
    const interval = setInterval(() => {
      if (sessionStartTime) {
        const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
        setTimeSpent(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const completeLesson = useCallback(async (
    score: number, 
    exercises: any[] = [],
    notes?: string
  ) => {
    if (!sessionStartTime) return;

    const finalTimeSpent = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
    
    await recordLessonProgress(lessonId, score, finalTimeSpent, exercises, notes);
    
    const updatedProgress = getLessonProgress(lessonId);
    setProgress(updatedProgress);
    setIsCompleted(updatedProgress?.completed || false);
    setCurrentScore(updatedProgress?.score || score);
  }, [lessonId, recordLessonProgress, getLessonProgress, sessionStartTime]);

  const resetLesson = useCallback(() => {
    setSessionStartTime(new Date());
    setTimeSpent(0);
  }, []);

  return {
    progress,
    isCompleted,
    currentScore,
    timeSpent,
    completeLesson,
    resetLesson,
    hasSession: !!currentSession
  };
}

/**
 * Hook for study session management
 */
export function useStudySession() {
  const { 
    currentSession, 
    startSession, 
    endSession,
    profile 
  } = useStudentProgressContext();

  const [isActive, setIsActive] = useState(!!currentSession);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    setIsActive(!!currentSession);
    
    let interval: NodeJS.Timeout;
    
    if (currentSession) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000);
        setSessionDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession]);

  const start = useCallback(() => {
    if (!currentSession) {
      startSession();
      setIsActive(true);
    }
  }, [currentSession, startSession]);

  const end = useCallback(async (notes?: string) => {
    if (currentSession) {
      await endSession(notes);
      setIsActive(false);
      setSessionDuration(0);
    }
  }, [currentSession, endSession]);

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }, []);

  return {
    isActive,
    currentSession,
    sessionDuration,
    formatDuration: (seconds: number = sessionDuration) => formatDuration(seconds),
    start,
    end,
    profile
  };
}

/**
 * Hook for achievement notifications
 */
export function useAchievements() {
  const { 
    achievements, 
    unlockedAchievements,
    showAchievementNotification,
    dismissAchievementNotification 
  } = useStudentProgressContext();

  const [recentAchievements, setRecentAchievements] = useState(unlockedAchievements);

  useEffect(() => {
    setRecentAchievements(unlockedAchievements);
  }, [unlockedAchievements]);

  const markAsViewed = useCallback((achievementId: string) => {
    setRecentAchievements(prev => 
      prev.filter(achievement => achievement.id !== achievementId)
    );
  }, []);

  const hasUnviewedAchievements = recentAchievements.length > 0;

  return {
    achievements,
    unlockedAchievements,
    recentAchievements,
    showAchievementNotification,
    dismissAchievementNotification,
    markAsViewed,
    hasUnviewedAchievements
  };
}

/**
 * Hook for progress statistics and analytics
 */
export function useProgressStats() {
  const { 
    getProgressStats, 
    getTopicProgress, 
    getRecentActivity,
    getAllProgress,
    profile 
  } = useStudentProgressContext();

  const [stats, setStats] = useState(() => getProgressStats());
  const [topicProgress, setTopicProgress] = useState(() => getTopicProgress());
  const [recentActivity, setRecentActivity] = useState(() => getRecentActivity(7));

  // Refresh stats when progress changes
  const refreshStats = useCallback(() => {
    setStats(getProgressStats());
    setTopicProgress(getTopicProgress());
    setRecentActivity(getRecentActivity(7));
  }, [getProgressStats, getTopicProgress, getRecentActivity]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats, getAllProgress()]);

  const getNextLessonRecommendation = useCallback((): number => {
    const allProgress = getAllProgress();
    const completedLessonIds = allProgress
      .filter(p => p.completed)
      .map(p => p.lessonId)
      .sort((a, b) => a - b);

    // Find the first uncompleted lesson
    for (let i = 1; i <= 120; i++) {
      if (!completedLessonIds.includes(i)) {
        return i;
      }
    }

    // All lessons completed
    return 1;
  }, [getAllProgress]);

  const getWeeklyGoalProgress = useCallback((weeklyGoal: number = 5): {
    completed: number;
    remaining: number;
    percentage: number;
  } => {
    const thisWeekActivity = getRecentActivity(7);
    const completedThisWeek = thisWeekActivity.reduce(
      (sum, day) => sum + day.lessonsCompleted, 
      0
    );

    return {
      completed: completedThisWeek,
      remaining: Math.max(0, weeklyGoal - completedThisWeek),
      percentage: Math.min(100, (completedThisWeek / weeklyGoal) * 100)
    };
  }, [getRecentActivity]);

  const getStudyConsistency = useCallback((): {
    streak: number;
    consistency: number;
    averageLessonsPerDay: number;
  } => {
    const activity = getRecentActivity(30);
    const daysWithActivity = activity.filter(day => day.lessonsCompleted > 0).length;
    const totalLessons = activity.reduce((sum, day) => sum + day.lessonsCompleted, 0);

    return {
      streak: profile?.currentStreak || 0,
      consistency: (daysWithActivity / 30) * 100,
      averageLessonsPerDay: totalLessons / 30
    };
  }, [getRecentActivity, profile]);

  return {
    stats,
    topicProgress,
    recentActivity,
    refreshStats,
    getNextLessonRecommendation,
    getWeeklyGoalProgress,
    getStudyConsistency
  };
}

/**
 * Hook for data management (import/export/backup)
 */
export function useDataManagement() {
  const { 
    exportProgress, 
    importProgress, 
    clearAllProgress 
  } = useStudentProgressContext();

  const exportToFile = useCallback(() => {
    const data = exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pointer-quest-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportProgress]);

  const importFromFile = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          await importProgress(data);
          resolve();
        } catch (error) {
          reject(new Error('Invalid progress file format'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [importProgress]);

  const createBackup = useCallback(() => {
    const data = exportProgress();
    const backupKey = `pq-backup-${Date.now()}`;
    
    try {
      localStorage.setItem(backupKey, JSON.stringify(data));
      return backupKey;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Storage quota exceeded');
    }
  }, [exportProgress]);

  const restoreFromBackup = useCallback(async (backupKey: string) => {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }
      
      const data = JSON.parse(backupData);
      await importProgress(data);
    } catch (error) {
      throw new Error('Failed to restore backup');
    }
  }, [importProgress]);

  const listBackups = useCallback((): Array<{
    key: string;
    date: Date;
    profile: string | null;
  }> => {
    const backups: Array<{ key: string; date: Date; profile: string | null }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pq-backup-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          const timestamp = parseInt(key.replace('pq-backup-', ''));
          
          backups.push({
            key,
            date: new Date(timestamp),
            profile: data.profile?.name || null
          });
        } catch (error) {
          // Invalid backup, skip
        }
      }
    }
    
    return backups.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  return {
    exportToFile,
    importFromFile,
    createBackup,
    restoreFromBackup,
    listBackups,
    clearAllProgress
  };
}

// Re-export the main hook for backward compatibility
export { useStudentProgressContext as useStudentProgress };