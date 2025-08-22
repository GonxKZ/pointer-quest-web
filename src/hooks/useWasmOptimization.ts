import { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WasmPerformanceAdapter, WasmPerformanceMetrics } from '../utils/WasmPerformanceAdapter';
import { logger } from '../utils/logger';

/**
 * Hook for using WebAssembly optimizations in React components
 */
export function useWasmOptimization() {
  const adapter = WasmPerformanceAdapter.getInstance();
  const [isInitialized, setIsInitialized] = useState(false);
  const [metrics, setMetrics] = useState<WasmPerformanceMetrics | null>(null);

  useEffect(() => {
    const initializeWasm = async () => {
      try {
        await adapter.initialize();
        setIsInitialized(true);
      } catch (error) {
        logger.error('Failed to initialize WASM adapter:', error);
      }
    };

    initializeWasm();
  }, [adapter]);

  // Update metrics periodically
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      setMetrics(adapter.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [isInitialized, adapter]);

  const optimizeGeometry = useCallback(async (geometry: THREE.BufferGeometry) => {
    if (!isInitialized) return geometry;
    return adapter.optimizeGeometry(geometry);
  }, [isInitialized, adapter]);

  const calculateMemoryLayout = useCallback(async (objects: Array<{
    id: string;
    size: number;
    alignment: number;
    priority: number;
  }>) => {
    if (!isInitialized) return [];
    return adapter.calculateMemoryLayout(objects);
  }, [isInitialized, adapter]);

  const batchMatrixOperations = useCallback(async (transforms: Array<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  }>) => {
    if (!isInitialized) return new Float32Array();
    return adapter.batchMatrixOperations(transforms);
  }, [isInitialized, adapter]);

  const calculatePointerPaths = useCallback(async (pointers: Array<{
    start: THREE.Vector3;
    end: THREE.Vector3;
    weight: number;
  }>) => {
    if (!isInitialized) return [];
    return adapter.calculatePointerPaths(pointers);
  }, [isInitialized, adapter]);

  return {
    isInitialized,
    metrics,
    optimizeGeometry,
    calculateMemoryLayout,
    batchMatrixOperations,
    calculatePointerPaths
  };
}

/**
 * Hook for optimized geometry processing with WebAssembly
 */
export function useWasmGeometry(geometry: THREE.BufferGeometry) {
  const { isInitialized, optimizeGeometry } = useWasmOptimization();
  const [optimizedGeometry, setOptimizedGeometry] = useState<THREE.BufferGeometry>(geometry);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    const optimize = async () => {
      setIsOptimizing(true);
      try {
        const optimized = await optimizeGeometry(geometry);
        setOptimizedGeometry(optimized);
      } catch (error) {
        logger.error('Geometry optimization failed:', error);
        setOptimizedGeometry(geometry);
      } finally {
        setIsOptimizing(false);
      }
    };

    optimize();
  }, [geometry, isInitialized, optimizeGeometry]);

  return {
    optimizedGeometry,
    isOptimizing
  };
}

/**
 * Hook for WASM-optimized instanced matrix calculations
 */
export function useWasmInstancedMatrices(
  instances: Array<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  }>
) {
  const { isInitialized, batchMatrixOperations } = useWasmOptimization();
  const [matrices, setMatrices] = useState<Float32Array>(new Float32Array());
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!isInitialized || instances.length === 0) return;

    const calculate = async () => {
      setIsCalculating(true);
      try {
        const result = await batchMatrixOperations(instances);
        setMatrices(result);
      } catch (error) {
        logger.error('Matrix calculation failed:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    calculate();
  }, [instances, isInitialized, batchMatrixOperations]);

  return {
    matrices,
    isCalculating
  };
}

/**
 * Hook for WASM-optimized pointer path calculations
 */
export function useWasmPointerPaths(
  pointers: Array<{
    start: THREE.Vector3;
    end: THREE.Vector3;
    weight: number;
  }>
) {
  const { isInitialized, calculatePointerPaths } = useWasmOptimization();
  const [paths, setPaths] = useState<THREE.Vector3[][]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!isInitialized || pointers.length === 0) return;

    const calculate = async () => {
      setIsCalculating(true);
      try {
        const result = await calculatePointerPaths(pointers);
        setPaths(result);
      } catch (error) {
        logger.error('Pointer path calculation failed:', error);
        setPaths([]);
      } finally {
        setIsCalculating(false);
      }
    };

    calculate();
  }, [pointers, isInitialized, calculatePointerPaths]);

  return {
    paths,
    isCalculating
  };
}

/**
 * Hook for WASM-optimized memory layout calculations
 */
export function useWasmMemoryLayout(
  objects: Array<{
    id: string;
    size: number;
    alignment: number;
    priority: number;
  }>
) {
  const { isInitialized, calculateMemoryLayout } = useWasmOptimization();
  const [layout, setLayout] = useState<Array<{
    id: string;
    offset: number;
    address: number;
  }>>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!isInitialized || objects.length === 0) return;

    const calculate = async () => {
      setIsCalculating(true);
      try {
        const result = await calculateMemoryLayout(objects);
        setLayout(result);
      } catch (error) {
        logger.error('Memory layout calculation failed:', error);
        setLayout([]);
      } finally {
        setIsCalculating(false);
      }
    };

    calculate();
  }, [objects, isInitialized, calculateMemoryLayout]);

  return {
    layout,
    isCalculating
  };
}

/**
 * Hook for monitoring WASM performance
 */
export function useWasmPerformanceMonitoring() {
  const { metrics, isInitialized } = useWasmOptimization();
  const [performanceHistory, setPerformanceHistory] = useState<WasmPerformanceMetrics[]>([]);

  useEffect(() => {
    if (!metrics) return;

    setPerformanceHistory(prev => {
      const newHistory = [...prev, metrics];
      // Keep only last 60 entries (1 minute at 1 second intervals)
      return newHistory.slice(-60);
    });
  }, [metrics]);

  const getPerformanceTrend = useCallback(() => {
    if (performanceHistory.length < 2) return null;

    const recent = performanceHistory.slice(-10);
    const older = performanceHistory.slice(-20, -10);

    if (older.length === 0) return null;

    const recentAvg = recent.reduce((sum, m) => sum + m.operationsPerSecond, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.operationsPerSecond, 0) / older.length;

    return {
      trend: recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable',
      change: ((recentAvg - olderAvg) / olderAvg) * 100
    };
  }, [performanceHistory]);

  return {
    isInitialized,
    currentMetrics: metrics,
    performanceHistory,
    getPerformanceTrend
  };
}
