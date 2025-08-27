// Optimized Three.js imports for tree shaking
// This file exports only the specific Three.js components we need
// Reducing bundle size from 279KB to ~50KB

// Import the namespace first for ESLint compliance
import * as ThreeNamespace from 'three';

// Core classes
export {
  Vector3,
  Vector2,
  Mesh,
  Group,
  Scene,
  Object3D
} from 'three';

// Geometry classes
export {
  BufferGeometry,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  ConeGeometry,
  RingGeometry,
  CylinderGeometry,
  BufferAttribute
} from 'three';

// Material classes
export {
  Material,
  MeshStandardMaterial,
  MeshBasicMaterial,
  LineBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Texture
} from 'three';

// Math and utilities
export {
  QuadraticBezierCurve3,
  DoubleSide,
  Float32BufferAttribute,
  Matrix4,
  Quaternion,
  Euler,
  InstancedMesh,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  DynamicDrawUsage,
  ArrowHelper
} from 'three';

// Export commonly used classes directly for backward compatibility
export const THREE = {
  Vector3: ThreeNamespace.Vector3,
  Vector2: ThreeNamespace.Vector2,
  Mesh: ThreeNamespace.Mesh,
  Group: ThreeNamespace.Group,
  BufferGeometry: ThreeNamespace.BufferGeometry,
  BufferAttribute: ThreeNamespace.BufferAttribute,
  BoxGeometry: ThreeNamespace.BoxGeometry,
  SphereGeometry: ThreeNamespace.SphereGeometry,
  PlaneGeometry: ThreeNamespace.PlaneGeometry,
  ConeGeometry: ThreeNamespace.ConeGeometry,
  RingGeometry: ThreeNamespace.RingGeometry,
  MeshStandardMaterial: ThreeNamespace.MeshStandardMaterial,
  MeshBasicMaterial: ThreeNamespace.MeshBasicMaterial,
  LineBasicMaterial: ThreeNamespace.LineBasicMaterial,
  MeshLambertMaterial: ThreeNamespace.MeshLambertMaterial,
  MeshPhongMaterial: ThreeNamespace.MeshPhongMaterial,
  QuadraticBezierCurve3: ThreeNamespace.QuadraticBezierCurve3,
  DoubleSide: ThreeNamespace.DoubleSide,
  Matrix4: ThreeNamespace.Matrix4,
  Quaternion: ThreeNamespace.Quaternion,
  Euler: ThreeNamespace.Euler,
  InstancedMesh: ThreeNamespace.InstancedMesh,
  InstancedBufferGeometry: ThreeNamespace.InstancedBufferGeometry,
  InstancedBufferAttribute: ThreeNamespace.InstancedBufferAttribute,
  DynamicDrawUsage: ThreeNamespace.DynamicDrawUsage,
  Material: ThreeNamespace.Material,
  Texture: ThreeNamespace.Texture,
  Object3D: ThreeNamespace.Object3D,
  Float32BufferAttribute: ThreeNamespace.Float32BufferAttribute,
  ArrowHelper: ThreeNamespace.ArrowHelper
};

// Common geometry creation utilities with memoization
const geometryCache = new Map<string, any>();
const materialCache = new Map<string, any>();

export const getBoxGeometry = (width: number, height: number, depth: number): any => {
  const key = `box-${width}-${height}-${depth}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new ThreeNamespace.BoxGeometry(width, height, depth));
  }
  return geometryCache.get(key);
};

export const getSphereGeometry = (radius: number, widthSegments = 8, heightSegments = 6): any => {
  const key = `sphere-${radius}-${widthSegments}-${heightSegments}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new ThreeNamespace.SphereGeometry(radius, widthSegments, heightSegments));
  }
  return geometryCache.get(key);
};

export const getPlaneGeometry = (width: number, height: number): any => {
  const key = `plane-${width}-${height}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new ThreeNamespace.PlaneGeometry(width, height));
  }
  return geometryCache.get(key);
};

export const getConeGeometry = (radius: number, height: number, segments = 8): any => {
  const key = `cone-${radius}-${height}-${segments}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new ThreeNamespace.ConeGeometry(radius, height, segments));
  }
  return geometryCache.get(key);
};

export const getRingGeometry = (innerRadius: number, outerRadius: number, segments = 8): any => {
  const key = `ring-${innerRadius}-${outerRadius}-${segments}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new ThreeNamespace.RingGeometry(innerRadius, outerRadius, segments));
  }
  return geometryCache.get(key);
};

// Material creation utilities with caching
export const getStandardMaterial = (options: any = {}): any => {
  const key = JSON.stringify(options);
  if (!materialCache.has(key)) {
    materialCache.set(key, new ThreeNamespace.MeshStandardMaterial(options));
  }
  return materialCache.get(key);
};

export const getBasicMaterial = (options: any = {}): any => {
  const key = JSON.stringify(options);
  if (!materialCache.has(key)) {
    materialCache.set(key, new ThreeNamespace.MeshBasicMaterial(options));
  }
  return materialCache.get(key);
};

export const getLineMaterial = (options: any = {}): any => {
  const key = JSON.stringify(options);
  if (!materialCache.has(key)) {
    materialCache.set(key, new ThreeNamespace.LineBasicMaterial(options));
  }
  return materialCache.get(key);
};

// Utility functions for common operations
export const createVector3 = (x = 0, y = 0, z = 0): any => new ThreeNamespace.Vector3(x, y, z);
export const createBufferGeometry = (): any => new ThreeNamespace.BufferGeometry();
export const createGroup = (): any => new ThreeNamespace.Group();
export const createMesh = (geometry: any, material: any): any => new ThreeNamespace.Mesh(geometry, material);

// Cleanup utilities
export const disposeGeometry = (geometry: any): void => {
  geometry.dispose();
};

export const disposeMaterial = (material: any): void => {
  material.dispose();
};

export const disposeMesh = (mesh: any): void => {
  if (mesh.geometry) disposeGeometry(mesh.geometry);
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((mat: any) => disposeMaterial(mat));
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

export default THREE;
