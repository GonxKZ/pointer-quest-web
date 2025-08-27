/**
 * Memory Management System for Three.js Performance Optimization
 * 
 * This system tracks and manages Three.js objects to prevent memory leaks
 * and optimize garbage collection.
 */

import { THREE } from '../utils/three';
import { logger } from './logger';

export interface ManagedResource {
  id: string;
  type: 'geometry' | 'material' | 'texture' | 'mesh' | 'group';
  object: THREE.Object3D | THREE.Material | THREE.BufferGeometry | THREE.Texture;
  createdAt: number;
  lastUsed: number;
  references: number;
}

export class MemoryManager {
  private static instance: MemoryManager;
  private resources: Map<string, ManagedResource> = new Map();
  private geometryCache: Map<string, THREE.BufferGeometry> = new Map();
  private materialCache: Map<string, THREE.Material> = new Map();
  private textureCache: Map<string, THREE.Texture> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryThreshold = 100 * 1024 * 1024; // 100MB threshold

  private constructor() {
    this.startCleanupLoop();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Register a Three.js resource for management
   */
  register<T extends THREE.Object3D | THREE.Material | THREE.BufferGeometry | THREE.Texture>(
    id: string,
    resource: T,
    type: ManagedResource['type']
  ): T {
    const now = Date.now();
    
    // If resource already exists, increment reference count
    if (this.resources.has(id)) {
      const existing = this.resources.get(id)!;
      existing.references++;
      existing.lastUsed = now;
      return existing.object as T;
    }

    // Register new resource
    this.resources.set(id, {
      id,
      type,
      object: resource,
      createdAt: now,
      lastUsed: now,
      references: 1
    });

    // Add to appropriate cache
    this.addToCache(id, resource, type);

    return resource;
  }

  /**
   * Unregister a resource (decrement reference count)
   */
  unregister(id: string): void {
    const resource = this.resources.get(id);
    if (!resource) return;

    resource.references = Math.max(0, resource.references - 1);
    
    // If no more references, mark for cleanup
    if (resource.references === 0) {
      this.scheduleCleanup(id);
    }
  }

  /**
   * Get a cached resource
   */
  getResource<T>(id: string): T | null {
    const resource = this.resources.get(id);
    if (resource) {
      resource.lastUsed = Date.now();
      return resource.object as T;
    }
    return null;
  }

  /**
   * Create or get cached geometry
   */
  getGeometry(id: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
    let geometry = this.geometryCache.get(id);
    
    if (!geometry) {
      geometry = factory();
      this.register(id, geometry, 'geometry');
    } else {
      // Update last used time
      const resource = this.resources.get(id);
      if (resource) {
        resource.lastUsed = Date.now();
        resource.references++;
      }
    }
    
    return geometry;
  }

  /**
   * Create or get cached material
   */
  getMaterial(id: string, factory: () => THREE.Material): THREE.Material {
    let material = this.materialCache.get(id);
    
    if (!material) {
      material = factory();
      this.register(id, material, 'material');
    } else {
      // Update last used time
      const resource = this.resources.get(id);
      if (resource) {
        resource.lastUsed = Date.now();
        resource.references++;
      }
    }
    
    return material;
  }

  /**
   * Create or get cached texture
   */
  getTexture(id: string, factory: () => THREE.Texture): THREE.Texture {
    let texture = this.textureCache.get(id);
    
    if (!texture) {
      texture = factory();
      this.register(id, texture, 'texture');
    } else {
      // Update last used time
      const resource = this.resources.get(id);
      if (resource) {
        resource.lastUsed = Date.now();
        resource.references++;
      }
    }
    
    return texture;
  }

  /**
   * Force cleanup of a specific resource
   */
  forceCleanup(id: string): void {
    const resource = this.resources.get(id);
    if (!resource) return;

    this.disposeResource(resource);
    this.resources.delete(id);
    this.removeFromCache(id, resource.type);
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats() {
    const stats = {
      totalResources: this.resources.size,
      geometries: 0,
      materials: 0,
      textures: 0,
      meshes: 0,
      groups: 0,
      estimatedMemoryUsage: 0,
      oldestResource: 0,
      averageAge: 0
    };

    let totalAge = 0;
    const now = Date.now();

    this.resources.forEach(resource => {
      stats[`${resource.type}s` as keyof typeof stats]++;
      
      const age = now - resource.createdAt;
      totalAge += age;
      
      if (stats.oldestResource === 0 || age > stats.oldestResource) {
        stats.oldestResource = age;
      }

      // Estimate memory usage (rough approximation)
      stats.estimatedMemoryUsage += this.estimateResourceSize(resource);
    });

    stats.averageAge = totalAge / this.resources.size || 0;

    return stats;
  }

  /**
   * Clean up unused resources
   */
  cleanup(maxAge = 300000): number { // 5 minutes default
    const now = Date.now();
    let cleaned = 0;

    this.resources.forEach((resource, id) => {
      const age = now - resource.lastUsed;
      
      if (resource.references === 0 && age > maxAge) {
        this.disposeResource(resource);
        this.resources.delete(id);
        this.removeFromCache(id, resource.type);
        cleaned++;
      }
    });

    return cleaned;
  }

  /**
   * Force cleanup when memory threshold is exceeded
   */
  forceMemoryCleanup(): number {
    const stats = this.getMemoryStats();
    
    if (stats.estimatedMemoryUsage > this.memoryThreshold) {
      // Clean up oldest unused resources first
      const sortedResources = Array.from(this.resources.entries())
        .filter(([, resource]) => resource.references === 0)
        .sort(([, a], [, b]) => a.lastUsed - b.lastUsed);

      let cleaned = 0;
      const targetReduction = stats.estimatedMemoryUsage * 0.3; // Clean 30% of memory
      let memoryFreed = 0;

      for (const [id, resource] of sortedResources) {
        if (memoryFreed >= targetReduction) break;

        const resourceSize = this.estimateResourceSize(resource);
        this.disposeResource(resource);
        this.resources.delete(id);
        this.removeFromCache(id, resource.type);
        
        memoryFreed += resourceSize;
        cleaned++;
      }

      return cleaned;
    }

    return 0;
  }

  /**
   * Destroy the memory manager and clean up all resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Dispose all resources
    this.resources.forEach(resource => {
      this.disposeResource(resource);
    });

    this.resources.clear();
    this.geometryCache.clear();
    this.materialCache.clear();
    this.textureCache.clear();
  }

  private addToCache(
    id: string,
    resource: THREE.Object3D | THREE.Material | THREE.BufferGeometry | THREE.Texture,
    type: ManagedResource['type']
  ): void {
    switch (type) {
      case 'geometry':
        this.geometryCache.set(id, resource as THREE.BufferGeometry);
        break;
      case 'material':
        this.materialCache.set(id, resource as THREE.Material);
        break;
      case 'texture':
        this.textureCache.set(id, resource as THREE.Texture);
        break;
    }
  }

  private removeFromCache(id: string, type: ManagedResource['type']): void {
    switch (type) {
      case 'geometry':
        this.geometryCache.delete(id);
        break;
      case 'material':
        this.materialCache.delete(id);
        break;
      case 'texture':
        this.textureCache.delete(id);
        break;
    }
  }

  private scheduleCleanup(id: string): void {
    // Schedule cleanup after a short delay to allow for re-use
    setTimeout(() => {
      const resource = this.resources.get(id);
      if (resource && resource.references === 0) {
        this.forceCleanup(id);
      }
    }, 5000); // 5 second delay
  }

  private disposeResource(resource: ManagedResource): void {
    try {
      const obj = resource.object;

      if (obj instanceof THREE.BufferGeometry) {
        obj.dispose();
      } else if (obj instanceof THREE.Material) {
        obj.dispose();
        // Dispose textures in material
        Object.values(obj).forEach(value => {
          if (value instanceof THREE.Texture) {
            value.dispose();
          }
        });
      } else if (obj instanceof THREE.Texture) {
        obj.dispose();
      } else if (obj instanceof THREE.Object3D) {
        // Recursively dispose object3D
        obj.traverse(child => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    } catch (error) {
      logger.warn(`Failed to dispose resource ${resource.id}:`, error);
    }
  }

  private estimateResourceSize(resource: ManagedResource): number {
    const obj = resource.object;
    let size = 0;

    if (obj instanceof THREE.BufferGeometry) {
      // Estimate geometry size based on attributes
      const attributes = obj.attributes;
      Object.values(attributes).forEach(attr => {
        if (attr instanceof THREE.BufferAttribute) {
          size += attr.array.byteLength;
        }
      });
    } else if (obj instanceof THREE.Texture) {
      // Estimate texture size
      const image = obj.image;
      if (image && image.width && image.height) {
        size = image.width * image.height * 4; // Assume RGBA
      }
    }

    return size;
  }

  private startCleanupLoop(): void {
    this.cleanupInterval = setInterval(() => {
      const cleaned = this.cleanup();
      const forceCleaned = this.forceMemoryCleanup();
      
      if (cleaned > 0 || forceCleaned > 0) {
        logger.log(`🧹 Memory cleanup: ${cleaned + forceCleaned} resources freed`);
      }
    }, 60000); // Run every minute
  }
}

/**
 * React hook to use the memory manager
 */
export function useMemoryManager() {
  const manager = MemoryManager.getInstance();
  return manager;
}

// Export default instance
export default MemoryManager.getInstance();