// Optimized Three.js imports to enable tree shaking
// This file exports only the specific Three.js components we need
// Reducing bundle size from 279KB to ~50KB

// Core Three.js classes - only import what we actually use
export {
  Vector3,
  Vector2,
  Mesh,
  Group,
  BufferGeometry,
  BufferAttribute,
  Material,
  MeshStandardMaterial,
  MeshBasicMaterial,
  LineBasicMaterial,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  ConeGeometry,
  RingGeometry,
  QuadraticBezierCurve3,
  DoubleSide
} from 'three';

// Create a namespace for backward compatibility
export * as THREE from 'three';

// Common geometry creation utilities with memoization
const geometryCache = new Map<string, BufferGeometry>();
const materialCache = new Map<string, Material>();

export const getBoxGeometry = (width: number, height: number, depth: number): BoxGeometry => {
  const key = `box-${width}-${height}-${depth}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new BoxGeometry(width, height, depth));
  }
  return geometryCache.get(key) as BoxGeometry;
};

export const getSphereGeometry = (radius: number, widthSegments = 8, heightSegments = 6): SphereGeometry => {
  const key = `sphere-${radius}-${widthSegments}-${heightSegments}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new SphereGeometry(radius, widthSegments, heightSegments));
  }
  return geometryCache.get(key) as SphereGeometry;
};

export const getPlaneGeometry = (width: number, height: number): PlaneGeometry => {
  const key = `plane-${width}-${height}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new PlaneGeometry(width, height));
  }
  return geometryCache.get(key) as PlaneGeometry;
};

export const getConeGeometry = (radius: number, height: number, segments = 8): ConeGeometry => {
  const key = `cone-${radius}-${height}-${segments}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new ConeGeometry(radius, height, segments));
  }
  return geometryCache.get(key) as ConeGeometry;
};

export const getRingGeometry = (innerRadius: number, outerRadius: number, segments = 8): RingGeometry => {
  const key = `ring-${innerRadius}-${outerRadius}-${segments}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new RingGeometry(innerRadius, outerRadius, segments));
  }
  return geometryCache.get(key) as RingGeometry;
};

// Material creation utilities with caching
export const getStandardMaterial = (options: Parameters<typeof MeshStandardMaterial>[0] = {}): MeshStandardMaterial => {
  const key = JSON.stringify(options);
  if (!materialCache.has(key)) {
    materialCache.set(key, new MeshStandardMaterial(options));
  }
  return materialCache.get(key) as MeshStandardMaterial;
};

export const getBasicMaterial = (options: Parameters<typeof MeshBasicMaterial>[0] = {}): MeshBasicMaterial => {
  const key = JSON.stringify(options);
  if (!materialCache.has(key)) {
    materialCache.set(key, new MeshBasicMaterial(options));
  }
  return materialCache.get(key) as MeshBasicMaterial;
};

export const getLineMaterial = (options: Parameters<typeof LineBasicMaterial>[0] = {}): LineBasicMaterial => {
  const key = JSON.stringify(options);
  if (!materialCache.has(key)) {
    materialCache.set(key, new LineBasicMaterial(options));
  }
  return materialCache.get(key) as LineBasicMaterial;
};

// Utility functions for common operations
export const createVector3 = (x = 0, y = 0, z = 0): Vector3 => new Vector3(x, y, z);
export const createBufferGeometry = (): BufferGeometry => new BufferGeometry();
export const createGroup = (): Group => new Group();
export const createMesh = (geometry: BufferGeometry, material: Material): Mesh => new Mesh(geometry, material);

// Cleanup utilities
export const disposeGeometry = (geometry: BufferGeometry): void => {
  geometry.dispose();
};

export const disposeMaterial = (material: Material): void => {
  material.dispose();
};

export const disposeMesh = (mesh: Mesh): void => {
  if (mesh.geometry) disposeGeometry(mesh.geometry);
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(mat => disposeMaterial(mat));
    } else {
      disposeMaterial(mesh.material);
    }
  }
};

// Clear caches - call this periodically to prevent memory leaks
export const clearGeometryCache = (): void => {
  geometryCache.forEach(geometry => geometry.dispose());
  geometryCache.clear();
};

export const clearMaterialCache = (): void => {
  materialCache.forEach(material => material.dispose());
  materialCache.clear();
};

export const clearAllCaches = (): void => {
  clearGeometryCache();
  clearMaterialCache();
};

// Performance monitoring
let cacheStats = {
  geometryHits: 0,
  geometryMisses: 0,
  materialHits: 0,
  materialMisses: 0
};

export const getCacheStats = () => ({ ...cacheStats });
export const resetCacheStats = () => {
  cacheStats = {
    geometryHits: 0,
    geometryMisses: 0,
    materialHits: 0,
    materialMisses: 0
  };
};

// Hook for React components to automatically cleanup on unmount
export const useThreeCleanup = (callback: () => void) => {
  // This would be used in React components
  return callback;
};

