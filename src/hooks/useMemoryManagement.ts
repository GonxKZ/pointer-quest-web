import { useEffect, useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { THREE } from '../utils/three';
import { MemoryManager } from '../utils/MemoryManager';

/**
 * Hook for automatic memory management of Three.js resources
 */
export function useMemoryManagement(componentId: string) {
  const manager = MemoryManager.getInstance();
  const registeredResources = useRef<Set<string>>(new Set());

  // Register a resource for automatic cleanup
  const registerResource = useCallback(<T extends THREE.Object3D | THREE.Material | THREE.BufferGeometry | THREE.Texture>(
    id: string,
    resource: T,
    type: 'geometry' | 'material' | 'texture' | 'mesh' | 'group'
  ): T => {
    const fullId = `${componentId}-${id}`;
    registeredResources.current.add(fullId);
    return manager.register(fullId, resource, type);
  }, [componentId, manager]);

  // Unregister a specific resource
  const unregisterResource = useCallback((id: string) => {
    const fullId = `${componentId}-${id}`;
    manager.unregister(fullId);
    registeredResources.current.delete(fullId);
  }, [componentId, manager]);

  // Get cached geometry with automatic registration
  const getCachedGeometry = useCallback((id: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry => {
    const fullId = `${componentId}-geometry-${id}`;
    registeredResources.current.add(fullId);
    return manager.getGeometry(fullId, factory);
  }, [componentId, manager]);

  // Get cached material with automatic registration
  const getCachedMaterial = useCallback((id: string, factory: () => THREE.Material): THREE.Material => {
    const fullId = `${componentId}-material-${id}`;
    registeredResources.current.add(fullId);
    return manager.getMaterial(fullId, factory);
  }, [componentId, manager]);

  // Get cached texture with automatic registration
  const getCachedTexture = useCallback((id: string, factory: () => THREE.Texture): THREE.Texture => {
    const fullId = `${componentId}-texture-${id}`;
    registeredResources.current.add(fullId);
    return manager.getTexture(fullId, factory);
  }, [componentId, manager]);

  // Cleanup all registered resources when component unmounts
  useEffect(() => {
    // Capture ref value for cleanup
    const currentResources = registeredResources.current;
    return () => {
      currentResources.forEach(id => {
        manager.unregister(id);
      });
      currentResources.clear();
    };
  }, [manager]);

  return {
    registerResource,
    unregisterResource,
    getCachedGeometry,
    getCachedMaterial,
    getCachedTexture
  };
}

/**
 * Hook for monitoring memory usage and performance
 */
export function useMemoryMonitoring() {
  const manager = MemoryManager.getInstance();
  const { gl } = useThree();

  const getMemoryStats = useCallback(() => {
    const threeStats = manager.getMemoryStats();
    
    // Get WebGL memory info if available
    const webglInfo = gl.extensions.get('WEBGL_debug_renderer_info');
    const context = gl.getContext() as WebGLRenderingContext | WebGL2RenderingContext;
    const webglStats = webglInfo ? {
      renderer: context.getParameter(webglInfo.UNMASKED_RENDERER_WEBGL),
      vendor: context.getParameter(webglInfo.UNMASKED_VENDOR_WEBGL)
    } : {};

    // Get performance memory if available
    const performanceMemory = (performance as any).memory;
    const browserStats = performanceMemory ? {
      usedJSHeapSize: performanceMemory.usedJSHeapSize,
      totalJSHeapSize: performanceMemory.totalJSHeapSize,
      jsHeapSizeLimit: performanceMemory.jsHeapSizeLimit
    } : {};

    return {
      three: threeStats,
      webgl: webglStats,
      browser: browserStats,
      timestamp: Date.now()
    };
  }, [gl, manager]);

  const forceCleanup = useCallback(() => {
    return manager.forceMemoryCleanup();
  }, [manager]);

  return {
    getMemoryStats,
    forceCleanup
  };
}

/**
 * Hook for automatic geometry instancing to reduce memory usage
 */
export function useGeometryInstancing() {
  const memoryManager = MemoryManager.getInstance();

  const createInstancedGeometry = useCallback((
    baseGeometryId: string,
    baseGeometryFactory: () => THREE.BufferGeometry,
    instanceCount: number
  ) => {
    const baseGeometry = memoryManager.getGeometry(baseGeometryId, baseGeometryFactory);
    
    // Create instanced geometry
    const instancedGeometry = new THREE.InstancedBufferGeometry();
    // Copy attributes from base geometry
    Object.keys(baseGeometry.attributes).forEach(key => {
      instancedGeometry.setAttribute(key, baseGeometry.attributes[key]!);
    });
    if (baseGeometry.index) {
      instancedGeometry.setIndex(baseGeometry.index);
    }
    instancedGeometry.instanceCount = instanceCount;

    return instancedGeometry;
  }, [memoryManager]);

  return {
    createInstancedGeometry
  };
}

/**
 * Hook for automatic material sharing to reduce memory usage
 */
export function useMaterialSharing() {
  const memoryManager = MemoryManager.getInstance();

  const getSharedMaterial = useCallback((
    materialId: string,
    materialFactory: () => THREE.Material
  ): THREE.Material => {
    return memoryManager.getMaterial(materialId, materialFactory);
  }, [memoryManager]);

  const createMaterialVariant = useCallback((
    baseMaterialId: string,
    variantId: string,
    modifications: Partial<THREE.Material>
  ): THREE.Material => {
    const baseMaterial = memoryManager.getResource<THREE.Material>(baseMaterialId);
    
    if (!baseMaterial) {
      throw new Error(`Base material ${baseMaterialId} not found`);
    }

    const variantMaterial = baseMaterial.clone();
    Object.assign(variantMaterial, modifications);

    return memoryManager.register(
      `${baseMaterialId}-variant-${variantId}`,
      variantMaterial,
      'material'
    );
  }, [memoryManager]);

  return {
    getSharedMaterial,
    createMaterialVariant
  };
}

/**
 * Hook for level-of-detail (LOD) management to improve performance
 */
export function useLODManagement() {
  const { camera } = useThree();

  const createLODGeometry = useCallback((
    baseId: string,
    highDetail: () => THREE.BufferGeometry,
    mediumDetail: () => THREE.BufferGeometry,
    lowDetail: () => THREE.BufferGeometry,
    distances = [10, 25, 50]
  ) => {
    const memoryManager = MemoryManager.getInstance();
    
    return {
      getGeometryForDistance: (distance: number): THREE.BufferGeometry => {
        if (distance < distances[0]!) {
          return memoryManager.getGeometry(`${baseId}-high`, highDetail);
        } else if (distance < distances[1]!) {
          return memoryManager.getGeometry(`${baseId}-medium`, mediumDetail);
        } else {
          return memoryManager.getGeometry(`${baseId}-low`, lowDetail);
        }
      },
      calculateDistance: (position: THREE.Vector3): number => {
        return camera.position.distanceTo(position);
      }
    };
  }, [camera]);

  return {
    createLODGeometry
  };
}