import { useEffect, useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { THREE } from '../utils/three';
import { InstancingManager, InstancedObject, InstanceGroupConfig } from '../utils/InstancingManager';

/**
 * Hook for creating and managing instanced rendering
 */
export function useInstancedRendering(
  groupId: string,
  config: InstanceGroupConfig,
  instances: InstancedObject[]
) {
  const manager = InstancingManager.getInstance();
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const lastInstancesRef = useRef<string>('');

  // Create instance group on mount
  useEffect(() => {
    const instancedMesh = manager.createInstanceGroup(groupId, config);
    instancedMeshRef.current = instancedMesh;

    return () => {
      // Cleanup on unmount
      manager.cleanup();
    };
  }, [groupId, config, manager]);

  // Update instances when they change
  useEffect(() => {
    const currentInstancesKey = JSON.stringify(instances);
    
    if (currentInstancesKey !== lastInstancesRef.current) {
      // Clear existing instances
      const existingInstances = manager.getInstances(groupId) || [];
      existingInstances.forEach(inst => {
        manager.removeInstance(groupId, inst.id);
      });

      // Add new instances
      instances.forEach(instance => {
        manager.addInstance(groupId, instance);
      });

      lastInstancesRef.current = currentInstancesKey;
    }
  }, [instances, groupId, manager]);

  // Update instance groups every frame
  useFrame(() => {
    manager.updateInstanceGroups();
  });

  return instancedMeshRef.current;
}

/**
 * Hook for managing dynamic instanced objects (objects that change frequently)
 */
export function useDynamicInstancing<T extends InstancedObject>(
  groupId: string,
  baseGeometry: THREE.BufferGeometry,
  baseMaterial: THREE.Material,
  maxInstances: number
) {
  const manager = InstancingManager.getInstance();
  const instancesRef = useRef<Map<string, T>>(new Map());
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);

  // Initialize instance group
  useEffect(() => {
    const config: InstanceGroupConfig = {
      geometry: baseGeometry,
      material: baseMaterial,
      maxInstances,
      dynamic: true
    };

    const instancedMesh = manager.createInstanceGroup(groupId, config);
    instancedMeshRef.current = instancedMesh;

    // Capture ref value for cleanup
    const currentInstances = instancesRef.current;
    return () => {
      currentInstances.clear();
    };
  }, [groupId, baseGeometry, baseMaterial, maxInstances, manager]);

  const addInstance = useCallback((instance: T) => {
    instancesRef.current.set(instance.id, instance);
    return manager.addInstance(groupId, instance);
  }, [groupId, manager]);

  const updateInstance = useCallback((instanceId: string, updates: Partial<T>) => {
    const existing = instancesRef.current.get(instanceId);
    if (existing) {
      Object.assign(existing, updates);
      return manager.updateInstance(groupId, instanceId, updates);
    }
    return false;
  }, [groupId, manager]);

  const removeInstance = useCallback((instanceId: string) => {
    instancesRef.current.delete(instanceId);
    return manager.removeInstance(groupId, instanceId);
  }, [groupId, manager]);

  const getInstance = useCallback((instanceId: string): T | undefined => {
    return instancesRef.current.get(instanceId);
  }, []);

  const getAllInstances = useCallback((): T[] => {
    return Array.from(instancesRef.current.values());
  }, []);

  // Update instancing manager every frame
  useFrame(() => {
    manager.updateInstanceGroups();
  });

  return {
    instancedMesh: instancedMeshRef.current,
    addInstance,
    updateInstance,
    removeInstance,
    getInstance,
    getAllInstances,
    instanceCount: instancesRef.current.size
  };
}

/**
 * Hook for batch operations on instanced objects
 */
export function useBatchInstancing() {
  const manager = InstancingManager.getInstance();

  const batchAdd = useCallback((groupId: string, instances: InstancedObject[]) => {
    const results = instances.map(instance => 
      manager.addInstance(groupId, instance)
    );
    return results.every(result => result);
  }, [manager]);

  const batchUpdate = useCallback((
    groupId: string, 
    updates: Array<{ id: string; updates: Partial<InstancedObject> }>
  ) => {
    const results = updates.map(({ id, updates: instanceUpdates }) => 
      manager.updateInstance(groupId, id, instanceUpdates)
    );
    return results.every(result => result);
  }, [manager]);

  const batchRemove = useCallback((groupId: string, instanceIds: string[]) => {
    const results = instanceIds.map(id => 
      manager.removeInstance(groupId, id)
    );
    return results.every(result => result);
  }, [manager]);

  return {
    batchAdd,
    batchUpdate,
    batchRemove
  };
}

/**
 * Hook for performance monitoring of instanced rendering
 */
export function useInstancingPerformance() {
  const manager = InstancingManager.getInstance();

  const getStats = useCallback(() => {
    return manager.getStats();
  }, [manager]);

  const forceUpdate = useCallback(() => {
    manager.forceUpdate();
  }, [manager]);

  return {
    getStats,
    forceUpdate
  };
}

/**
 * Hook for level-of-detail instancing
 */
export function useLODInstancing(
  groupId: string,
  lodLevels: Array<{
    distance: number;
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
  }>,
  maxInstances: number,
  cameraPosition: THREE.Vector3
) {
  const manager = InstancingManager.getInstance();
  // Removed unused ref that previously tracked current LOD

  // Determine current LOD level based on camera distance
  const getCurrentLOD = useCallback((targetPosition: THREE.Vector3): number => {
    const distance = cameraPosition.distanceTo(targetPosition);
    
    for (let i = 0; i < lodLevels.length; i++) {
      const level = lodLevels[i]!;
      if (distance <= level.distance) {
        return i;
      }
    }
    
    return lodLevels.length - 1; // Use lowest detail if beyond all thresholds
  }, [cameraPosition, lodLevels]);

  // Create LOD instance groups
  useEffect(() => {
    lodLevels.forEach((lod, index) => {
      const lodGroupId = `${groupId}-lod-${index}`;
      const config: InstanceGroupConfig = {
        geometry: lod.geometry,
        material: lod.material,
        maxInstances,
        dynamic: true
      };
      
      manager.createInstanceGroup(lodGroupId, config);
    });

    return () => {
      // Cleanup handled by manager if necessary
    };
  }, [groupId, lodLevels, maxInstances, manager]);

  const updateLODInstances = useCallback((instances: InstancedObject[]) => {
    // Clear all LOD groups
    lodLevels.forEach((_, index) => {
      const lodGroupId = `${groupId}-lod-${index}`;
      const existing = manager.getInstances(lodGroupId) || [];
      existing.forEach(inst => {
        manager.removeInstance(lodGroupId, inst.id);
      });
    });

    // Distribute instances to appropriate LOD levels
    instances.forEach(instance => {
      const lodLevel = getCurrentLOD(instance.position);
      const lodGroupId = `${groupId}-lod-${lodLevel}`;
      manager.addInstance(lodGroupId, instance);
    });
  }, [groupId, lodLevels, manager, getCurrentLOD]);

  return {
    updateLODInstances,
    getCurrentLOD
  };
}
