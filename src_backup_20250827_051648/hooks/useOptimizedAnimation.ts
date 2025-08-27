import { useEffect, useCallback } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import { AnimationManager, UseAnimationCallbackResult } from '../utils/AnimationManager';
import { logger } from '../utils/logger';

/**
 * Hook for registering animations with automatic cleanup and performance optimization
 */
export function useOptimizedAnimation(
  id: string,
  callback: (state: RootState, delta: number) => void,
  priority = 0,
  dependencies: React.DependencyList = []
): UseAnimationCallbackResult {
  const manager = AnimationManager.getInstance();

  useEffect(() => {
    manager.register(id, callback, priority);
    
    return () => {
      manager.unregister(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, priority, callback, manager, ...dependencies]);

  return {
    setEnabled: useCallback((enabled: boolean) => manager.setEnabled(id, enabled), [id, manager]),
    unregister: useCallback(() => manager.unregister(id), [id, manager])
  };
}

/**
 * Main animation frame hook that coordinates all animations
 * This should be used only once in the root of the 3D scene
 */
export function useAnimationFrame() {
  const manager = AnimationManager.getInstance();
  
  useFrame((state, delta) => {
    manager.executeAnimations(state, delta);
  });

  return manager.getMetrics();
}

/**
 * Hook for performance-aware animations that adapt based on FPS
 */
export function usePerformanceAnimation(
  id: string,
  highPerformanceCallback: (state: RootState, delta: number) => void,
  mediumPerformanceCallback?: (state: RootState, delta: number) => void,
  lowPerformanceCallback?: (state: RootState, delta: number) => void,
  priority = 0
) {
  const manager = AnimationManager.getInstance();

  const adaptiveCallback = useCallback((state: RootState, delta: number) => {
    const metrics = manager.getMetrics();
    
    switch (metrics.performanceMode) {
      case 'high':
        highPerformanceCallback(state, delta);
        break;
      case 'medium':
        if (mediumPerformanceCallback) {
          mediumPerformanceCallback(state, delta);
        } else {
          highPerformanceCallback(state, delta);
        }
        break;
      case 'low':
        if (lowPerformanceCallback) {
          lowPerformanceCallback(state, delta);
        } else if (mediumPerformanceCallback) {
          mediumPerformanceCallback(state, delta);
        } else {
          // Skip animation for very low performance
        }
        break;
    }
  }, [highPerformanceCallback, mediumPerformanceCallback, lowPerformanceCallback, manager]);

  return useOptimizedAnimation(id, adaptiveCallback, priority);
}

/**
 * Hook for conditional animations that can be enabled/disabled
 */
export function useConditionalAnimation(
  id: string,
  callback: (state: RootState, delta: number) => void,
  condition: boolean,
  priority = 0
) {
  const result = useOptimizedAnimation(id, callback, priority);

  useEffect(() => {
    result.setEnabled(condition);
  }, [condition, result]);

  return result;
}

/**
 * Hook for batched animations that group multiple animations together
 */
export function useBatchedAnimation(
  id: string,
  animations: Array<{
    id: string;
    callback: (state: RootState, delta: number) => void;
    condition?: boolean;
  }>,
  priority = 0
) {
  const batchedCallback = useCallback((state: RootState, delta: number) => {
    animations.forEach(anim => {
      if (anim.condition !== false) {
        try {
          anim.callback(state, delta);
        } catch (error) {
          logger.warn(`Batched animation ${anim.id} failed:`, error);
        }
      }
    });
  }, [animations]);

  return useOptimizedAnimation(id, batchedCallback, priority);
}

/**
 * Hook for debugging animation performance
 */
export function useAnimationDebug() {
  const manager = AnimationManager.getInstance();
  
  useEffect(() => {
    const interval = setInterval(() => {
      const debug = manager.getDebugInfo();
      logger.log('🎬 Animation Performance Debug');
      logger.log('FPS:', debug.averageFPS.toFixed(1));
      logger.log('Performance Mode:', debug.performanceMode);
      logger.log('Active Callbacks:', debug.activeCallbacks);
      logger.log('Total Callbacks:', debug.totalCallbacks);
      logger.log('Debug Callbacks:', debug.callbacks);
    }, 5000); // Log every 5 seconds

    return () => clearInterval(interval);
  }, [manager]);

  return manager.getDebugInfo();
}