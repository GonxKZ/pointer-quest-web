/**
 * Student Progress Management System
 * Handles persistent storage of learning progress with offline support
 */

// Types
export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  score: number;
  timeSpent: number; // seconds
  completedAt?: Date;
  attempts: number;
  exercises: ExerciseProgress[];
  notes?: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: number;
  solution?: string;
  hints: string[];
  completedAt?: Date;
}

export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
  lastActive: Date;
  totalTimeSpent: number;
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  preferences: StudentPreferences;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: 'completion' | 'streak' | 'speed' | 'perfect' | 'exploration';
}

export interface StudentPreferences {
  theme: 'dark' | 'light' | 'auto';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notifications: boolean;
  soundEffects: boolean;
  autoSave: boolean;
  showHints: boolean;
  codeStyle: 'compact' | 'verbose';
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  lessonIds: number[];
  totalScore: number;
  exercisesCompleted: number;
  timeSpent: number;
  notes?: string;
}

// Storage keys
const STORAGE_KEYS = {
  PROFILE: 'pq-student-profile',
  PROGRESS: 'pq-lesson-progress',
  SESSIONS: 'pq-study-sessions',
  ACHIEVEMENTS: 'pq-achievements',
  SETTINGS: 'pq-student-settings'
} as const;

// Default preferences
const defaultPreferences: StudentPreferences = {
  theme: 'auto',
  difficulty: 'beginner',
  notifications: true,
  soundEffects: true,
  autoSave: true,
  showHints: true,
  codeStyle: 'compact'
};

/**
 * Student Progress Manager
 * Handles all student progress tracking with persistent storage
 */
export class StudentProgressManager {
  private profile: StudentProfile | null = null;
  private progress: Map<number, LessonProgress> = new Map();
  private sessions: StudySession[] = [];
  private currentSession: StudySession | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;
  private syncQueue: Array<() => Promise<void>> = [];

  constructor() {
    this.loadData();
    this.setupAutoSave();
    this.setupBeforeUnload();
  }

  /**
   * Initialize or load student profile
   */
  async initializeProfile(name: string, email?: string): Promise<StudentProfile> {
    const existingProfile = this.loadProfile();
    
    if (existingProfile) {
      existingProfile.lastActive = new Date();
      this.profile = existingProfile;
    } else {
      this.profile = {
        id: this.generateId(),
        name,
        email,
        createdAt: new Date(),
        lastActive: new Date(),
        totalTimeSpent: 0,
        lessonsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        preferences: { ...defaultPreferences }
      };
    }

    await this.saveProfile();
    return this.profile;
  }

  /**
   * Get current student profile
   */
  getProfile(): StudentProfile | null {
    return this.profile;
  }

  /**
   * Update student profile
   */
  async updateProfile(updates: Partial<StudentProfile>): Promise<void> {
    if (!this.profile) return;

    this.profile = { ...this.profile, ...updates };
    await this.saveProfile();
  }

  /**
   * Start a new study session
   */
  startSession(): StudySession {
    this.currentSession = {
      id: this.generateId(),
      startTime: new Date(),
      lessonIds: [],
      totalScore: 0,
      exercisesCompleted: 0,
      timeSpent: 0
    };

    return this.currentSession;
  }

  /**
   * End current study session
   */
  async endSession(notes?: string): Promise<StudySession | null> {
    if (!this.currentSession) return null;

    this.currentSession.endTime = new Date();
    this.currentSession.timeSpent = this.calculateSessionTime();
    this.currentSession.notes = notes;

    this.sessions.push(this.currentSession);
    await this.saveSessions();

    // Update profile stats
    if (this.profile) {
      this.profile.totalTimeSpent += this.currentSession.timeSpent;
      this.profile.lastActive = new Date();
      await this.saveProfile();
    }

    const session = this.currentSession;
    this.currentSession = null;
    return session;
  }

  /**
   * Record lesson progress
   */
  async recordLessonProgress(
    lessonId: number,
    score: number,
    timeSpent: number,
    exercises: ExerciseProgress[] = [],
    notes?: string
  ): Promise<void> {
    const existing = this.progress.get(lessonId);
    const isFirstCompletion = !existing?.completed && score >= 70;

    const lessonProgress: LessonProgress = {
      lessonId,
      completed: score >= 70, // 70% threshold for completion
      score: Math.max(existing?.score || 0, score),
      timeSpent: (existing?.timeSpent || 0) + timeSpent,
      attempts: (existing?.attempts || 0) + 1,
      exercises,
      notes,
      completedAt: score >= 70 ? new Date() : existing?.completedAt
    };

    this.progress.set(lessonId, lessonProgress);

    // Update current session
    if (this.currentSession) {
      if (!this.currentSession.lessonIds.includes(lessonId)) {
        this.currentSession.lessonIds.push(lessonId);
      }
      this.currentSession.totalScore += score;
      this.currentSession.exercisesCompleted += exercises.filter(e => e.completed).length;
    }

    // Update profile stats
    if (this.profile && isFirstCompletion) {
      this.profile.lessonsCompleted++;
      this.updateStreak();
      await this.checkAndUnlockAchievements(lessonProgress);
    }

    await this.saveProgress();
    await this.saveProfile();
  }

  /**
   * Get lesson progress
   */
  getLessonProgress(lessonId: number): LessonProgress | null {
    return this.progress.get(lessonId) || null;
  }

  /**
   * Get all progress
   */
  getAllProgress(): LessonProgress[] {
    return Array.from(this.progress.values());
  }

  /**
   * Get progress statistics
   */
  getProgressStats(): {
    totalLessons: number;
    completedLessons: number;
    completionRate: number;
    averageScore: number;
    totalTimeSpent: number;
    currentStreak: number;
    longestStreak: number;
  } {
    const allProgress = this.getAllProgress();
    const completed = allProgress.filter(p => p.completed);
    
    return {
      totalLessons: allProgress.length,
      completedLessons: completed.length,
      completionRate: allProgress.length > 0 ? (completed.length / allProgress.length) * 100 : 0,
      averageScore: completed.length > 0 ? completed.reduce((sum, p) => sum + p.score, 0) / completed.length : 0,
      totalTimeSpent: this.profile?.totalTimeSpent || 0,
      currentStreak: this.profile?.currentStreak || 0,
      longestStreak: this.profile?.longestStreak || 0
    };
  }

  /**
   * Get topic progress (lessons 1-20 = basic, 21-40 = smart, etc.)
   */
  getTopicProgress(): Array<{
    topic: string;
    range: string;
    completed: number;
    total: number;
    percentage: number;
    averageScore: number;
  }> {
    const topics = [
      { name: 'Basic Pointers', start: 1, end: 20 },
      { name: 'Smart Pointers', start: 21, end: 40 },
      { name: 'Memory Management', start: 41, end: 60 },
      { name: 'Advanced/UB', start: 61, end: 80 },
      { name: 'Atomic/Threading', start: 81, end: 100 },
      { name: 'Performance', start: 101, end: 120 }
    ];

    return topics.map(topic => {
      const topicProgress = this.getAllProgress().filter(
        p => p.lessonId >= topic.start && p.lessonId <= topic.end
      );
      
      const completed = topicProgress.filter(p => p.completed);
      const total = topic.end - topic.start + 1;
      
      return {
        topic: topic.name,
        range: `${topic.start}-${topic.end}`,
        completed: completed.length,
        total,
        percentage: (completed.length / total) * 100,
        averageScore: completed.length > 0 
          ? completed.reduce((sum, p) => sum + p.score, 0) / completed.length 
          : 0
      };
    });
  }

  /**
   * Get recent activity
   */
  getRecentActivity(days: number = 7): Array<{
    date: Date;
    lessonsCompleted: number;
    timeSpent: number;
    averageScore: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentProgress = this.getAllProgress().filter(
      p => p.completedAt && p.completedAt >= cutoffDate
    );

    const activityMap = new Map<string, {
      date: Date;
      lessons: LessonProgress[];
      timeSpent: number;
    }>();

    recentProgress.forEach(progress => {
      if (!progress.completedAt) return;
      
      const dateKey = progress.completedAt.toDateString();
      
      if (!activityMap.has(dateKey)) {
        activityMap.set(dateKey, {
          date: progress.completedAt,
          lessons: [],
          timeSpent: 0
        });
      }
      
      const day = activityMap.get(dateKey)!;
      day.lessons.push(progress);
      day.timeSpent += progress.timeSpent;
    });

    return Array.from(activityMap.values()).map(day => ({
      date: day.date,
      lessonsCompleted: day.lessons.length,
      timeSpent: day.timeSpent,
      averageScore: day.lessons.reduce((sum, l) => sum + l.score, 0) / day.lessons.length || 0
    })).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Export progress data
   */
  exportProgress(): {
    profile: StudentProfile | null;
    progress: LessonProgress[];
    sessions: StudySession[];
    exportedAt: Date;
  } {
    return {
      profile: this.profile,
      progress: this.getAllProgress(),
      sessions: this.sessions,
      exportedAt: new Date()
    };
  }

  /**
   * Import progress data
   */
  async importProgress(data: ReturnType<typeof this.exportProgress>): Promise<void> {
    if (data.profile) {
      this.profile = data.profile;
      await this.saveProfile();
    }

    data.progress.forEach(progress => {
      this.progress.set(progress.lessonId, progress);
    });
    await this.saveProgress();

    this.sessions = data.sessions;
    await this.saveSessions();
  }

  /**
   * Clear all progress (with confirmation)
   */
  async clearAllProgress(): Promise<void> {
    this.progress.clear();
    this.sessions = [];
    this.currentSession = null;
    
    if (this.profile) {
      this.profile.lessonsCompleted = 0;
      this.profile.currentStreak = 0;
      this.profile.totalTimeSpent = 0;
      this.profile.achievements = [];
    }

    await this.saveAll();
  }

  /**
   * Private: Load data from storage
   */
  private loadData(): void {
    this.loadProfile();
    this.loadProgress();
    this.loadSessions();
  }

  private loadProfile(): StudentProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        const profile = JSON.parse(stored);
        // Convert date strings back to Date objects
        profile.createdAt = new Date(profile.createdAt);
        profile.lastActive = new Date(profile.lastActive);
        profile.achievements = profile.achievements.map((a: any) => ({
          ...a,
          unlockedAt: new Date(a.unlockedAt)
        }));
        this.profile = profile;
        return profile;
      }
    } catch (error) {
      console.warn('[Progress] Failed to load profile:', error);
    }
    return null;
  }

  private loadProgress(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (stored) {
        const progressArray: LessonProgress[] = JSON.parse(stored);
        progressArray.forEach(progress => {
          if (progress.completedAt) {
            progress.completedAt = new Date(progress.completedAt);
          }
          progress.exercises.forEach(exercise => {
            if (exercise.completedAt) {
              exercise.completedAt = new Date(exercise.completedAt);
            }
          });
          this.progress.set(progress.lessonId, progress);
        });
      }
    } catch (error) {
      console.warn('[Progress] Failed to load progress:', error);
    }
  }

  private loadSessions(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (stored) {
        this.sessions = JSON.parse(stored).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        }));
      }
    } catch (error) {
      console.warn('[Progress] Failed to load sessions:', error);
    }
  }

  /**
   * Private: Save data to storage
   */
  private async saveProfile(): Promise<void> {
    if (!this.profile) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.profile));
    } catch (error) {
      console.error('[Progress] Failed to save profile:', error);
      await this.queueSync(() => this.saveProfile());
    }
  }

  private async saveProgress(): Promise<void> {
    try {
      const progressArray = Array.from(this.progress.values());
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressArray));
    } catch (error) {
      console.error('[Progress] Failed to save progress:', error);
      await this.queueSync(() => this.saveProgress());
    }
  }

  private async saveSessions(): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(this.sessions));
    } catch (error) {
      console.error('[Progress] Failed to save sessions:', error);
      await this.queueSync(() => this.saveSessions());
    }
  }

  private async saveAll(): Promise<void> {
    await Promise.all([
      this.saveProfile(),
      this.saveProgress(),
      this.saveSessions()
    ]);
  }

  /**
   * Private: Utilities
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private calculateSessionTime(): number {
    if (!this.currentSession) return 0;
    
    const now = new Date();
    return Math.floor((now.getTime() - this.currentSession.startTime.getTime()) / 1000);
  }

  private updateStreak(): void {
    if (!this.profile) return;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentActivity = this.getRecentActivity(2);
    const todayActivity = recentActivity.find(a => 
      a.date.toDateString() === today.toDateString()
    );
    const yesterdayActivity = recentActivity.find(a => 
      a.date.toDateString() === yesterday.toDateString()
    );

    if (todayActivity && todayActivity.lessonsCompleted > 0) {
      if (yesterdayActivity && yesterdayActivity.lessonsCompleted > 0) {
        this.profile.currentStreak++;
      } else {
        this.profile.currentStreak = 1;
      }
      
      this.profile.longestStreak = Math.max(
        this.profile.longestStreak,
        this.profile.currentStreak
      );
    }
  }

  private async checkAndUnlockAchievements(progress: LessonProgress): Promise<void> {
    if (!this.profile) return;

    const achievements: Achievement[] = [];
    const _stats = this.getProgressStats();

    // First lesson completed
    if (this.profile.lessonsCompleted === 1) {
      achievements.push({
        id: 'first-lesson',
        name: 'Getting Started',
        description: 'Completed your first lesson',
        icon: '🎯',
        unlockedAt: new Date(),
        type: 'completion'
      });
    }

    // Perfect score
    if (progress.score === 100) {
      achievements.push({
        id: 'perfect-score',
        name: 'Perfection',
        description: 'Scored 100% on a lesson',
        icon: '💯',
        unlockedAt: new Date(),
        type: 'perfect'
      });
    }

    // Milestone completions
    const milestones = [5, 10, 25, 50, 100];
    milestones.forEach(milestone => {
      if (this.profile!.lessonsCompleted === milestone) {
        achievements.push({
          id: `milestone-${milestone}`,
          name: `${milestone} Lessons`,
          description: `Completed ${milestone} lessons`,
          icon: milestone >= 50 ? '🏆' : milestone >= 25 ? '🥉' : milestone >= 10 ? '🥈' : '🏅',
          unlockedAt: new Date(),
          type: 'completion'
        });
      }
    });

    // Streak achievements
    if (this.profile.currentStreak === 7) {
      achievements.push({
        id: 'week-streak',
        name: 'Week Warrior',
        description: 'Completed lessons for 7 days in a row',
        icon: '🔥',
        unlockedAt: new Date(),
        type: 'streak'
      });
    }

    // Add new achievements to profile
    achievements.forEach(achievement => {
      if (!this.profile!.achievements.some(a => a.id === achievement.id)) {
        this.profile!.achievements.push(achievement);
      }
    });

    if (achievements.length > 0) {
      await this.saveProfile();
      
      // Notify about new achievements
      achievements.forEach(achievement => {
        this.notifyAchievement(achievement);
      });
    }
  }

  private notifyAchievement(achievement: Achievement): void {
    // This could integrate with a notification system
    console.log('🎉 Achievement unlocked:', achievement.name);
    
    // Could dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('achievement-unlocked', {
      detail: achievement
    }));
  }

  private setupAutoSave(): void {
    // Auto-save every 30 seconds
    setInterval(() => {
      this.saveAll();
    }, 30000);
  }

  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      if (this.currentSession) {
        this.endSession('Session ended unexpectedly');
      }
      this.saveAll();
    });
  }

  private async queueSync(syncFn: () => Promise<void>): Promise<void> {
    this.syncQueue.push(syncFn);
    // Process sync queue when back online
    window.addEventListener('online', () => {
      this.processSyncQueue();
    });
  }

  private async processSyncQueue(): Promise<void> {
    while (this.syncQueue.length > 0) {
      const syncFn = this.syncQueue.shift();
      if (syncFn) {
        try {
          await syncFn();
        } catch (error) {
          console.error('[Progress] Sync failed:', error);
          // Re-queue on failure
          this.syncQueue.unshift(syncFn);
          break;
        }
      }
    }
  }
}

// Singleton instance
export const studentProgress = new StudentProgressManager();