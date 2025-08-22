/**
 * Centralized Animation Manager for Three.js Performance Optimization
 * 
 * This manager prevents multiple useFrame hooks from running simultaneously,
 * which can cause performance issues and frame rate drops.
 */

import { RootState } from '@react-three/fiber';
import { logger } from './logger';

export interface AnimationCallback {
  id: string;
  callback: (state: RootState, delta: number) => void;
  priority: number; // Higher priority runs first
  enabled: boolean;
}

export class AnimationManager {
  private static instance: AnimationManager;
  private callbacks: Map<string, AnimationCallback> = new Map();
  private isRunning = false;
  private frameCount = 0;
  private lastTime = 0;
  private averageFPS = 60;
  private targetFPS = 60;
  private performanceMode: 'high' | 'medium' | 'low' = 'high';

  private constructor() {}

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  /**
   * Register an animation callback
   */
  register(id: string, callback: (state: RootState, delta: number) => void, priority = 0): void {
    this.callbacks.set(id, {
      id,
      callback,
      priority,
      enabled: true
    });

    // Sort callbacks by priority
    this.sortCallbacksByPriority();
  }

  /**
   * Unregister an animation callback
   */
  unregister(id: string): void {
    this.callbacks.delete(id);
  }

  /**
   * Enable/disable a specific animation
   */
  setEnabled(id: string, enabled: boolean): void {
    const callback = this.callbacks.get(id);
    if (callback) {
      callback.enabled = enabled;
    }
  }

  /**
   * Execute all registered animations
   */
  executeAnimations(state: RootState, delta: number): void {
    if (!this.isRunning) {
      this.isRunning = true;
    }

    // Update performance metrics
    this.updatePerformanceMetrics(delta);

    // Adjust performance mode based on FPS
    this.adjustPerformanceMode();

    // Execute callbacks based on performance mode
    this.executeCallbacksWithPerformanceOptimization(state, delta);
  }

  /**
   * Sort callbacks by priority (high to low)
   */
  private sortCallbacksByPriority(): void {
    const sortedEntries = Array.from(this.callbacks.entries())
      .sort(([, a], [, b]) => b.priority - a.priority);
    
    this.callbacks = new Map(sortedEntries);
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(_delta: number): void {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return;
    }

    const elapsed = currentTime - this.lastTime;
    
    // Update FPS every second
    if (elapsed >= 1000) {
      this.averageFPS = (this.frameCount * 1000) / elapsed;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * Adjust performance mode based on current FPS
   */
  private adjustPerformanceMode(): void {
    if (this.averageFPS >= 55) {
      this.performanceMode = 'high';
    } else if (this.averageFPS >= 40) {
      this.performanceMode = 'medium';
    } else {
      this.performanceMode = 'low';
    }
  }

  /**
   * Execute callbacks with performance optimization
   */
  private executeCallbacksWithPerformanceOptimization(state: RootState, delta: number): void {
    const callbacks = Array.from(this.callbacks.values()).filter(cb => cb.enabled);
    
    switch (this.performanceMode) {
      case 'high':
        // Execute all callbacks
        callbacks.forEach(cb => {
          try {
            cb.callback(state, delta);
          } catch (error) {
            logger.warn(`Animation callback ${cb.id} failed:`, error);
          }
        });
        break;
        
      case 'medium':
        // Execute only high and medium priority callbacks
        callbacks
          .filter(cb => cb.priority >= 0)
          .forEach(cb => {
            try {
              cb.callback(state, delta);
            } catch (error) {
              logger.warn(`Animation callback ${cb.id} failed:`, error);
            }
          });
        break;
        
      case 'low':
        // Execute only high priority callbacks
        callbacks
          .filter(cb => cb.priority > 0)
          .slice(0, Math.max(1, Math.floor(callbacks.length / 2)))
          .forEach(cb => {
            try {
              cb.callback(state, delta);
            } catch (error) {
              logger.warn(`Animation callback ${cb.id} failed:`, error);
            }
          });
        break;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      averageFPS: this.averageFPS,
      performanceMode: this.performanceMode,
      activeCallbacks: Array.from(this.callbacks.values()).filter(cb => cb.enabled).length,
      totalCallbacks: this.callbacks.size
    };
  }

  /**
   * Force performance mode
   */
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.performanceMode = mode;
  }

  /**
   * Clear all animations
   */
  clear(): void {
    this.callbacks.clear();
    this.isRunning = false;
    this.frameCount = 0;
    this.lastTime = 0;
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      ...this.getMetrics(),
      callbacks: Array.from(this.callbacks.entries()).map(([id, cb]) => ({
        id,
        priority: cb.priority,
        enabled: cb.enabled
      }))
    };
  }
}

/**
 * React hook to use the animation manager
 */
export function useAnimationManager() {
  const manager = AnimationManager.getInstance();
  return manager;
}

/**
 * Hook for registering animations with automatic cleanup
 * Note: This needs to be implemented in a React component file
 */
export interface UseAnimationCallbackResult {
  setEnabled: (enabled: boolean) => void;
  unregister: () => void;
}

// Export default instance for direct access
export default AnimationManager.getInstance();
