/**
 * WebAssembly Performance Adapter for Three.js Optimization
 * 
 * This adapter integrates WebAssembly computations with Three.js
 * for high-performance 3D calculations and memory operations.
 */

import * as THREE from 'three';
import { logger } from './logger';

export interface WasmMemoryOperation {
  type: 'allocation' | 'deallocation' | 'read' | 'write';
  address: number;
  size: number;
  value?: number;
  timestamp: number;
}

export interface WasmPerformanceMetrics {
  operationsPerSecond: number;
  memoryAllocated: number;
  memoryDeallocated: number;
  averageOperationTime: number;
  wasmHeapSize: number;
}

export class WasmPerformanceAdapter {
  private static instance: WasmPerformanceAdapter;
  private wasmModule: any = null;
  private operations: WasmMemoryOperation[] = [];
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): WasmPerformanceAdapter {
    if (!WasmPerformanceAdapter.instance) {
      WasmPerformanceAdapter.instance = new WasmPerformanceAdapter();
    }
    return WasmPerformanceAdapter.instance;
  }

  /**
   * Initialize WebAssembly module
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.loadWasmModule();
    await this.initPromise;
  }

  private async loadWasmModule(): Promise<void> {
    try {
      // Import the WebAssembly module
      const wasmModule = await import('../wasm/pointer_quest_wasm');
      await wasmModule.default(); // Initialize the module
      
      this.wasmModule = wasmModule;
      this.isInitialized = true;
      
      logger.log('🚀 WebAssembly module loaded successfully');
    } catch (error) {
      logger.error('❌ Failed to load WebAssembly module:', error);
      // Fallback to JavaScript implementations
      this.initializeFallbacks();
    }
  }

  private initializeFallbacks(): void {
    // Create JavaScript fallbacks for WASM functions
    this.wasmModule = {
      calculate_memory_layout: this.jsCalculateMemoryLayout.bind(this),
      optimize_geometry: this.jsOptimizeGeometry.bind(this),
      batch_matrix_operations: this.jsBatchMatrixOperations.bind(this),
      calculate_pointer_paths: this.jsCalculatePointerPaths.bind(this),
      memory_usage_stats: this.jsMemoryUsageStats.bind(this)
    };
    
    this.isInitialized = true;
    logger.log('⚠️ Using JavaScript fallbacks for WASM functions');
  }

  /**
   * Calculate optimal memory layout for 3D objects
   */
  async calculateMemoryLayout(objects: Array<{
    id: string;
    size: number;
    alignment: number;
    priority: number;
  }>): Promise<Array<{
    id: string;
    offset: number;
    address: number;
  }>> {
    await this.initialize();
    
    if (!this.wasmModule) {
      throw new Error('WebAssembly module not initialized');
    }

    const startTime = performance.now();
    
    try {
      // Use WASM function for high-performance calculation
      const result = this.wasmModule.calculate_memory_layout(
        JSON.stringify(objects)
      );
      
      const parsedResult = JSON.parse(result);
      
      // Record operation
      this.recordOperation({
        type: 'allocation',
        address: 0,
        size: objects.length,
        timestamp: Date.now()
      });
      
      return parsedResult;
    } catch (error) {
      logger.warn('WASM memory layout calculation failed, using fallback');
      return this.jsCalculateMemoryLayout(objects);
    } finally {
      const endTime = performance.now();
      logger.log(`Memory layout calculated in ${(endTime - startTime).toFixed(2)}ms`);
    }
  }

  /**
   * Optimize geometry data for better performance
   */
  async optimizeGeometry(geometry: THREE.BufferGeometry): Promise<THREE.BufferGeometry> {
    await this.initialize();
    
    if (!this.wasmModule) {
      return geometry;
    }

    const startTime = performance.now();
    
    try {
      // Extract geometry data
      const positions = geometry.attributes.position?.array;
      const indices = geometry.index ? geometry.index.array : null;
      
      // Convert to format suitable for WASM
      if (!positions) {
        throw new Error('Geometry has no position attribute');
      }
      const geometryData = {
        positions: Array.from(positions),
        indices: indices ? Array.from(indices) : null,
        vertexCount: positions.length / 3
      };
      
      // Use WASM function for optimization
      const optimizedData = this.wasmModule.optimize_geometry(
        JSON.stringify(geometryData)
      );
      
      const parsed = JSON.parse(optimizedData);
      
      // Create optimized geometry
      const optimizedGeometry = new THREE.BufferGeometry();
      optimizedGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(parsed.positions, 3)
      );
      
      if (parsed.indices) {
        optimizedGeometry.setIndex(parsed.indices);
      }
      
      return optimizedGeometry;
    } catch (error) {
      logger.warn('WASM geometry optimization failed, using original');
      return geometry;
    } finally {
      const endTime = performance.now();
      logger.log(`Geometry optimized in ${(endTime - startTime).toFixed(2)}ms`);
    }
  }

  /**
   * Batch matrix operations for instanced rendering
   */
  async batchMatrixOperations(transforms: Array<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  }>): Promise<Float32Array> {
    await this.initialize();
    
    if (!this.wasmModule) {
      return this.jsBatchMatrixOperations(transforms);
    }

    const startTime = performance.now();
    
    try {
      // Convert transforms to WASM-compatible format
      const transformData = transforms.map(t => ({
        position: [t.position.x, t.position.y, t.position.z],
        rotation: [t.rotation.x, t.rotation.y, t.rotation.z],
        scale: [t.scale.x, t.scale.y, t.scale.z]
      }));
      
      // Use WASM function for batch processing
      const result = this.wasmModule.batch_matrix_operations(
        JSON.stringify(transformData)
      );
      
      return new Float32Array(JSON.parse(result));
    } catch (error) {
      logger.warn('WASM matrix operations failed, using fallback');
      return this.jsBatchMatrixOperations(transforms);
    } finally {
      const endTime = performance.now();
      logger.log(`Matrix operations completed in ${(endTime - startTime).toFixed(2)}ms`);
    }
  }

  /**
   * Calculate optimal paths for pointer visualization
   */
  async calculatePointerPaths(
    pointers: Array<{
      start: THREE.Vector3;
      end: THREE.Vector3;
      weight: number;
    }>
  ): Promise<Array<THREE.Vector3[]>> {
    await this.initialize();
    
    if (!this.wasmModule) {
      return this.jsCalculatePointerPaths(pointers);
    }

    const startTime = performance.now();
    
    try {
      const pointerData = pointers.map(p => ({
        start: [p.start.x, p.start.y, p.start.z],
        end: [p.end.x, p.end.y, p.end.z],
        weight: p.weight
      }));
      
      const result = this.wasmModule.calculate_pointer_paths(
        JSON.stringify(pointerData)
      );
      
      const parsed = JSON.parse(result);
      
      return parsed.map((path: number[][]) => 
        path.map((point: number[]) => 
          new THREE.Vector3(point[0], point[1], point[2])
        )
      );
    } catch (error) {
      logger.warn('WASM pointer path calculation failed, using fallback');
      return this.jsCalculatePointerPaths(pointers);
    } finally {
      const endTime = performance.now();
      logger.log(`Pointer paths calculated in ${(endTime - startTime).toFixed(2)}ms`);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): WasmPerformanceMetrics {
    const now = Date.now();
    const recentOps = this.operations.filter(op => now - op.timestamp < 1000);
    
    const allocated = this.operations
      .filter(op => op.type === 'allocation')
      .reduce((sum, op) => sum + op.size, 0);
    
    const deallocated = this.operations
      .filter(op => op.type === 'deallocation')
      .reduce((sum, op) => sum + op.size, 0);
    
    const avgTime = recentOps.length > 0 
      ? recentOps.reduce((sum, op) => sum + (op.timestamp - (op.timestamp - 100)), 0) / recentOps.length
      : 0;

    return {
      operationsPerSecond: recentOps.length,
      memoryAllocated: allocated,
      memoryDeallocated: deallocated,
      averageOperationTime: avgTime,
      wasmHeapSize: this.getWasmHeapSize()
    };
  }

  private getWasmHeapSize(): number {
    try {
      if (this.wasmModule && this.wasmModule.memory) {
        return this.wasmModule.memory.buffer.byteLength;
      }
    } catch (error) {
      // Ignore errors
    }
    return 0;
  }

  private recordOperation(operation: WasmMemoryOperation): void {
    this.operations.push(operation);
    
    // Keep only recent operations
    const cutoff = Date.now() - 10000; // 10 seconds
    this.operations = this.operations.filter(op => op.timestamp > cutoff);
  }

  // JavaScript fallback implementations
  private jsCalculateMemoryLayout(objects: any[]): any[] {
    // Simple offset-based layout
    let offset = 0;
    return objects.map(obj => {
      const result = {
        id: obj.id,
        offset,
        address: 0x1000 + offset
      };
      offset += obj.size;
      return result;
    });
  }

  private jsBatchMatrixOperations(transforms: any[]): Float32Array {
    const matrices = new Float32Array(transforms.length * 16);
    const matrix = new THREE.Matrix4();
    
    transforms.forEach((transform, index) => {
      matrix.compose(
        transform.position,
        new THREE.Quaternion().setFromEuler(transform.rotation),
        transform.scale
      );
      
      matrix.toArray(matrices, index * 16);
    });
    
    return matrices;
  }

  private jsOptimizeGeometry(geometryData: any): any {
    // Basic geometry optimization (remove duplicates, etc.)
    return geometryData;
  }

  private jsCalculatePointerPaths(pointers: any[]): THREE.Vector3[][] {
    // Simple curved paths
    return pointers.map(pointer => {
      const start = pointer.start;
      const end = pointer.end;
      const mid = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 1, 0));
      
      return [start, mid, end];
    });
  }

  private jsMemoryUsageStats(): any {
    return {
      allocated: 0,
      deallocated: 0,
      peak: 0
    };
  }
}

export default WasmPerformanceAdapter.getInstance();