/**
 * Pointer Quest Design System - Performance Optimization Utilities
 * 
 * Advanced performance utilities for educational components and 3D visualizations.
 * Optimizes rendering, memory usage, and user experience across all lessons.
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { PerformanceMetrics, BenchmarkResult } from '../types/designSystem';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private observers: PerformanceObserver[] = [];
  private startTimes: Map<string, number> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  private constructor() {
    this.initializeObservers();
  }
  
  private initializeObservers(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }
    
    // Monitor Long Tasks (>50ms)
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.warn(`Long task detected: ${entry.duration}ms`);
          this.recordMetric('long-tasks', {
            time: entry.duration,
            memory: 0,
            score: Math.max(0, 100 - (entry.duration - 50)),
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (e) {
      console.warn('Long task monitoring not available');
    }
    
    // Monitor Layout Shifts
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.value > 0.1) {
            console.warn(`Layout shift detected: ${entry.value}`);
          }
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);
    } catch (e) {
      console.warn('Layout shift monitoring not available');
    }
  }
  
  startTiming(name: string): void {
    this.startTimes.set(name, performance.now());
  }
  
  endTiming(name: string): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`No start time found for: ${name}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.startTimes.delete(name);
    
    this.recordMetric(name, {
      time: duration,
      memory: this.getMemoryUsage(),
      score: this.calculatePerformanceScore(duration),
    });
    
    return duration;
  }
  
  recordMetric(name: string, metrics: PerformanceMetrics): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metricsList = this.metrics.get(name)!;
    metricsList.push({
      ...metrics,
      time: Math.round(metrics.time * 100) / 100,
    });
    
    // Keep only last 50 measurements per metric
    if (metricsList.length > 50) {
      metricsList.shift();
    }
  }
  
  getMetrics(name: string): PerformanceMetrics[] {
    return this.metrics.get(name) || [];
  }
  
  getAverageMetrics(name: string): PerformanceMetrics | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;
    
    const sum = metrics.reduce((acc, metric) => ({
      time: acc.time + metric.time,
      memory: acc.memory + metric.memory,
      score: acc.score + metric.score,
    }), { time: 0, memory: 0, score: 0 });
    
    return {
      time: sum.time / metrics.length,
      memory: sum.memory / metrics.length,
      score: sum.score / metrics.length,
    };
  }
  
  public getMemoryUsage(): number {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return 0;
    }
    
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
  }
  
  public calculatePerformanceScore(duration: number): number {
    // Score from 0-100 based on duration
    // 0-16ms = 100 (60fps)
    // 16-33ms = 80 (30fps)
    // 33-50ms = 60 (20fps)
    // 50ms+ = decreasing score
    
    if (duration <= 16) return 100;
    if (duration <= 33) return 80;
    if (duration <= 50) return 60;
    return Math.max(0, 60 - ((duration - 50) / 10));
  }
  
  generateReport(): string {
    const report = ['=== Performance Report ==='];
    
    this.metrics.forEach((_, name) => {
      const avg = this.getAverageMetrics(name);
      if (avg) {
        report.push(`${name}:`);
        report.push(`  Average Time: ${avg.time.toFixed(2)}ms`);
        report.push(`  Average Memory: ${avg.memory.toFixed(2)}MB`);
        report.push(`  Average Score: ${avg.score.toFixed(0)}/100`);
        report.push('');
      }
    });
    
    return report.join('\n');
  }
  
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// React performance hooks
export const usePerformanceMonitor = (name: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  const startTiming = useCallback(() => {
    monitor.startTiming(name);
  }, [monitor, name]);
  
  const endTiming = useCallback(() => {
    return monitor.endTiming(name);
  }, [monitor, name]);
  
  const getMetrics = useCallback(() => {
    return monitor.getAverageMetrics(name);
  }, [monitor, name]);
  
  return { startTiming, endTiming, getMetrics };
};

// Memoization utilities
export const createDeepMemo = <T extends Record<string, any>>(obj: T): T => {
  const cache = new WeakMap();
  
  const memoize = (target: any): any => {
    if (cache.has(target)) {
      return cache.get(target);
    }
    
    if (Array.isArray(target)) {
      const memoized = target.map(memoize);
      cache.set(target, memoized);
      return memoized;
    }
    
    if (typeof target === 'object' && target !== null) {
      const memoized: any = {};
      Object.keys(target).forEach(key => {
        memoized[key] = memoize(target[key]);
      });
      cache.set(target, memoized);
      return memoized;
    }
    
    return target;
  };
  
  return memoize(obj);
};

// Component lazy loading utilities
export const createLazyComponent = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(factory);
  
  return (props: React.ComponentProps<T>) => 
    React.createElement(
      React.Suspense,
      { 
        fallback: fallback ? React.createElement(fallback) : React.createElement('div', null, 'Loading...')
      },
      React.createElement(LazyComponent, props)
    );
};

// Virtual scrolling for large lesson lists
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
  
  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    onScroll,
    totalHeight: visibleItems.totalHeight,
    offsetY: visibleItems.offsetY,
  };
};

// Debounced hooks for performance
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRun = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= delay) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, delay - (Date.now() - lastRun.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return throttledValue;
};

// Image optimization utilities
export const optimizeImage = (
  src: string,
  width?: number,
  height?: number,
  quality: number = 85
): string => {
  // In a real implementation, this would integrate with image optimization services
  // For now, return the original src with parameters
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  
  return `${src}?${params.toString()}`;
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Memory management utilities
export class MemoryManager {
  private static readonly MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB
  private static cache = new Map<string, any>();
  private static timers = new Map<string, NodeJS.Timeout>();
  
  static set(key: string, value: any, ttl: number = 300000): void {
    // Clear expired entries
    this.cleanup();
    
    this.cache.set(key, value);
    
    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
  }
  
  static get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }
  
  static delete(key: string): boolean {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    
    return this.cache.delete(key);
  }
  
  static clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }
  
  static cleanup(): void {
    const currentMemory = this.getMemoryUsage();
    
    if (currentMemory > this.MEMORY_THRESHOLD) {
      // Remove oldest entries first
      const entries = Array.from(this.cache.entries());
      const toRemove = Math.floor(entries.length * 0.2); // Remove 20%
      
      for (let i = 0; i < toRemove; i++) {
        const entry = entries[i];
        if (entry) {
          this.delete(entry[0]);
        }
      }
    }
  }
  
  private static getMemoryUsage(): number {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return 0;
    }
    
    return (performance as any).memory.usedJSHeapSize;
  }
  
  static getStats(): { entries: number; memoryUsage: number; cacheSize: number } {
    return {
      entries: this.cache.size,
      memoryUsage: this.getMemoryUsage(),
      cacheSize: JSON.stringify([...this.cache.values()]).length,
    };
  }
}

// Code execution performance utilities
export const benchmarkCode = async (
  code: string,
  iterations: number = 1000
): Promise<BenchmarkResult> => {
  const monitor = PerformanceMonitor.getInstance();
  
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    monitor.startTiming(`benchmark-${i}`);
    
    try {
      // In a real implementation, this would execute the code safely
      // For now, simulate execution time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    } catch (error) {
      console.error('Benchmark execution error:', error);
    }
    
    const duration = monitor.endTiming(`benchmark-${i}`);
    results.push(duration);
  }
  
  const average = results.reduce((sum, time) => sum + time, 0) / results.length;
  const _min = Math.min(...results);
  const _max = Math.max(...results);
  
  return {
    name: 'Code Benchmark',
    metrics: {
      time: average,
      memory: monitor.getMemoryUsage(),
      score: monitor.calculatePerformanceScore(average),
    },
    code,
    optimizationLevel: 'O0', // Default
  };
};

// 3D Rendering optimization utilities
export const optimize3DRendering = {
  // Level of detail based on distance
  calculateLOD: (distance: number, maxDistance: number = 100): number => {
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    if (normalizedDistance < 0.3) return 3; // High detail
    if (normalizedDistance < 0.6) return 2; // Medium detail
    if (normalizedDistance < 0.9) return 1; // Low detail
    return 0; // Very low detail
  },
  
  // Frustum culling helper
  isInViewFrustum: (
    objectPosition: [number, number, number],
    cameraPosition: [number, number, number],
    _fov: number,
    near: number,
    far: number
  ): boolean => {
    const distance = Math.sqrt(
      Math.pow(objectPosition[0] - cameraPosition[0], 2) +
      Math.pow(objectPosition[1] - cameraPosition[1], 2) +
      Math.pow(objectPosition[2] - cameraPosition[2], 2)
    );
    
    return distance >= near && distance <= far;
  },
  
  // Adaptive quality based on performance
  getAdaptiveQuality: (): number => {
    const monitor = PerformanceMonitor.getInstance();
    const recentMetrics = monitor.getMetrics('render-frame').slice(-10);
    
    if (recentMetrics.length === 0) return 1.0;
    
    const averageScore = recentMetrics.reduce((sum, m) => sum + m.score, 0) / recentMetrics.length;
    
    if (averageScore >= 90) return 1.0; // High quality
    if (averageScore >= 70) return 0.8; // Medium quality
    if (averageScore >= 50) return 0.6; // Low quality
    return 0.4; // Very low quality
  },
};

export default {
  PerformanceMonitor,
  MemoryManager,
  usePerformanceMonitor,
  useDebounce,
  useThrottle,
  useVirtualScrolling,
  createLazyComponent,
  benchmarkCode,
  optimize3DRendering,
};