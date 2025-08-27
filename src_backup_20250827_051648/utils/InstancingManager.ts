/**
 * Instancing Manager for Three.js Performance Optimization
 * 
 * This system manages instanced geometries to reduce draw calls
 * and improve rendering performance for multiple similar objects.
 */

import * as THREE from 'three';
import { logger } from './logger';

export interface InstancedObject {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  color?: THREE.Color;
  visible: boolean;
  userData?: any;
}

export interface InstanceGroupConfig {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  maxInstances: number;
  dynamic: boolean; // Whether instances change frequently
}

export class InstancingManager {
  private static instance: InstancingManager;
  private instanceGroups: Map<string, THREE.InstancedMesh> = new Map();
  private instanceData: Map<string, InstancedObject[]> = new Map();
  private groupConfigs: Map<string, InstanceGroupConfig> = new Map();
  private needsUpdate: Set<string> = new Set();

  private constructor() {}

  static getInstance(): InstancingManager {
    if (!InstancingManager.instance) {
      InstancingManager.instance = new InstancingManager();
    }
    return InstancingManager.instance;
  }

  /**
   * Create a new instance group
   */
  createInstanceGroup(
    groupId: string,
    config: InstanceGroupConfig
  ): THREE.InstancedMesh {
    // Create instanced mesh
    const instancedMesh = new THREE.InstancedMesh(
      config.geometry,
      config.material,
      config.maxInstances
    );

    // Set up instance matrices
    instancedMesh.instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(config.maxInstances * 16),
      16
    );

    // Set up instance colors if material supports it
    if (this.materialSupportsInstanceColors(config.material)) {
      instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(config.maxInstances * 3),
        3
      );
    }

    // Mark as dynamic if needed
    if (config.dynamic) {
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
      }
    }

    // Store group
    this.instanceGroups.set(groupId, instancedMesh);
    this.instanceData.set(groupId, []);
    this.groupConfigs.set(groupId, config);

    return instancedMesh;
  }

  /**
   * Add an instance to a group
   */
  addInstance(groupId: string, instance: InstancedObject): boolean {
    const instances = this.instanceData.get(groupId);
    const config = this.groupConfigs.get(groupId);
    
    if (!instances || !config) {
      logger.warn(`Instance group ${groupId} not found`);
      return false;
    }

    if (instances.length >= config.maxInstances) {
      logger.warn(`Instance group ${groupId} is at maximum capacity`);
      return false;
    }

    instances.push(instance);
    this.needsUpdate.add(groupId);
    return true;
  }

  /**
   * Update an instance in a group
   */
  updateInstance(groupId: string, instanceId: string, updates: Partial<InstancedObject>): boolean {
    const instances = this.instanceData.get(groupId);
    
    if (!instances) {
      logger.warn(`Instance group ${groupId} not found`);
      return false;
    }

    const instanceIndex = instances.findIndex(inst => inst.id === instanceId);
    if (instanceIndex === -1) {
      logger.warn(`Instance ${instanceId} not found in group ${groupId}`);
      return false;
    }

    // Update instance data
    const instance = instances[instanceIndex];
    if (instance) {
      Object.assign(instance, updates);
    }
    this.needsUpdate.add(groupId);
    return true;
  }

  /**
   * Remove an instance from a group
   */
  removeInstance(groupId: string, instanceId: string): boolean {
    const instances = this.instanceData.get(groupId);
    
    if (!instances) {
      logger.warn(`Instance group ${groupId} not found`);
      return false;
    }

    const instanceIndex = instances.findIndex(inst => inst.id === instanceId);
    if (instanceIndex === -1) {
      logger.warn(`Instance ${instanceId} not found in group ${groupId}`);
      return false;
    }

    instances.splice(instanceIndex, 1);
    this.needsUpdate.add(groupId);
    return true;
  }

  /**
   * Update all instance groups that need updates
   */
  updateInstanceGroups(): void {
    this.needsUpdate.forEach(groupId => {
      this.updateInstanceGroup(groupId);
    });
    this.needsUpdate.clear();
  }

  /**
   * Update a specific instance group
   */
  private updateInstanceGroup(groupId: string): void {
    const instancedMesh = this.instanceGroups.get(groupId);
    const instances = this.instanceData.get(groupId);
    
    if (!instancedMesh || !instances) return;

    const matrix = new THREE.Matrix4();

    // Update instance matrices and colors
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      if (!instance) continue;
      
      if (!instance.visible) {
        // Hide instance by scaling to zero
        matrix.makeScale(0, 0, 0);
      } else {
        // Set transform matrix
        matrix.compose(
          instance.position || new THREE.Vector3(),
          new THREE.Quaternion().setFromEuler(instance.rotation || new THREE.Euler()),
          instance.scale || new THREE.Vector3(1, 1, 1)
        );
      }
      
      instancedMesh.setMatrixAt(i, matrix);
      
      // Set color if supported
      if (instancedMesh.instanceColor && instance.color) {
        instancedMesh.setColorAt(i, instance.color);
      }
    }

    // Hide unused instances
    for (let i = instances.length; i < instancedMesh.count; i++) {
      matrix.makeScale(0, 0, 0);
      instancedMesh.setMatrixAt(i, matrix);
    }

    // Update instance count
    instancedMesh.count = instances.length;

    // Mark attributes as needing update
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Get an instance group
   */
  getInstanceGroup(groupId: string): THREE.InstancedMesh | undefined {
    return this.instanceGroups.get(groupId);
  }

  /**
   * Get instances data for a group
   */
  getInstances(groupId: string): InstancedObject[] | undefined {
    return this.instanceData.get(groupId);
  }

  /**
   * Get performance statistics
   */
  getStats() {
    let totalInstances = 0;
    let totalDrawCalls = this.instanceGroups.size;
    let totalVertices = 0;

    this.instanceGroups.forEach((instancedMesh, groupId) => {
      const instances = this.instanceData.get(groupId);
      if (instances) {
        totalInstances += instances.length;
        
        // Estimate vertex count
        const geometry = instancedMesh.geometry;
        const positions = geometry.attributes.position;
        if (positions) {
          totalVertices += (positions.count * instances.length);
        }
      }
    });

    return {
      instanceGroups: this.instanceGroups.size,
      totalInstances,
      drawCalls: totalDrawCalls,
      estimatedVertices: totalVertices,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of instance groups
   */
  private estimateMemoryUsage(): number {
    let totalMemory = 0;

    this.instanceGroups.forEach((instancedMesh, groupId) => {
      const config = this.groupConfigs.get(groupId);
      if (config) {
        // Instance matrix data
        totalMemory += config.maxInstances * 16 * 4; // 16 floats * 4 bytes
        
        // Instance color data (if present)
        if (instancedMesh.instanceColor) {
          totalMemory += config.maxInstances * 3 * 4; // 3 floats * 4 bytes
        }
        
        // Geometry data (shared, but counted once per group)
        const geometry = config.geometry;
        Object.values(geometry.attributes).forEach(attribute => {
          if (attribute instanceof THREE.BufferAttribute) {
            totalMemory += attribute.array.byteLength;
          }
        });
      }
    });

    return totalMemory;
  }

  /**
   * Check if material supports instance colors
   */
  private materialSupportsInstanceColors(material: THREE.Material): boolean {
    return material instanceof THREE.MeshStandardMaterial ||
           material instanceof THREE.MeshBasicMaterial ||
           material instanceof THREE.MeshLambertMaterial ||
           material instanceof THREE.MeshPhongMaterial;
  }

  /**
   * Cleanup all instance groups
   */
  cleanup(): void {
    this.instanceGroups.forEach(instancedMesh => {
      instancedMesh.dispose();
    });
    
    this.instanceGroups.clear();
    this.instanceData.clear();
    this.groupConfigs.clear();
    this.needsUpdate.clear();
  }

  /**
   * Force update all groups
   */
  forceUpdate(): void {
    this.instanceGroups.forEach((_, groupId) => {
      this.needsUpdate.add(groupId);
    });
    this.updateInstanceGroups();
  }
}

/**
 * React hook for using the instancing manager
 */
export function useInstancingManager() {
  const manager = InstancingManager.getInstance();
  return manager;
}

export default InstancingManager.getInstance();
