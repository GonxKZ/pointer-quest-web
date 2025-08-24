/**
 * Lazy-loaded 3D Components for Bundle Optimization
 * 
 * This file provides code-split versions of heavy 3D components
 * to improve initial loading performance.
 */

import React, { lazy, Suspense, ComponentType, useState } from 'react';
import styled from 'styled-components';
import { logger } from '../utils/logger';

// Loading component for 3D components
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 50%, #2a2a4a 100%);
  color: #00d4ff;
  font-family: 'Fira Code', monospace;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 212, 255, 0.3);
  border-top: 3px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const LoadingSubtext = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
  text-align: center;
  max-width: 300px;
`;

// Generic loading component for 3D content
const ThreeDLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = "Cargando visualización 3D..." 
}) => (
  <LoadingContainer>
    <LoadingSpinner />
    <LoadingText>{message}</LoadingText>
    <LoadingSubtext>
      Optimizando recursos Three.js para mejor rendimiento
    </LoadingSubtext>
  </LoadingContainer>
);

// Lazy load Three.js components - Complete set
export const LazyMemoryVisualizer3D = lazy(() => 
  import('../3d/MemoryVisualizer3D').then(module => ({
    default: module.default
  }))
);

export const LazyEducationalPointerScene = lazy(() => 
  import('../3d/EducationalPointerScene').then(module => ({
    default: module.default
  }))
);

export const LazySmartPointerVisualizations = lazy(() => 
  import('../3d/SmartPointerVisualizations').then(module => ({
    default: module.default
  }))
);

export const LazyPointerArithmetic3D = lazy(() => 
  import('../3d/PointerArithmetic3D').then(module => ({
    default: module.default
  }))
);

export const LazyConstPointer3D = lazy(() => 
  import('../3d/ConstPointer3D').then(module => ({
    default: module.default
  }))
);

export const LazyFunctionPointer3D = lazy(() => 
  import('../3d/FunctionPointer3D').then(module => ({
    default: module.default
  }))
);

export const LazyMemoryLifecycleVisualizer = lazy(() => 
  import('../3d/MemoryLifecycleVisualizer').then(module => ({
    default: module.default
  }))
);

export const LazyAuto3DDemo = lazy(() => 
  import('./Auto3DDemo').then(module => ({
    default: module.default
  }))
);

export const LazyEducationalAnimations = lazy(() => 
  import('./EducationalAnimations').then(module => ({
    default: module.default
  }))
);

// HOC for wrapping lazy 3D components with consistent loading
export function withLazy3DLoading<P extends object>(
  Component: ComponentType<P>,
  loadingMessage?: string
) {
  return function Lazy3DComponent(props: P) {
    return (
      <Suspense fallback={<ThreeDLoadingFallback message={loadingMessage} />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components with loading states - Complete set
export const MemoryVisualizer3DWithLoading = withLazy3DLoading(
  LazyMemoryVisualizer3D,
  "Cargando visualizador de memoria 3D..."
);

export const EducationalPointerSceneWithLoading = withLazy3DLoading(
  LazyEducationalPointerScene,
  "Cargando escena educativa de punteros..."
);

export const SmartPointerVisualizationsWithLoading = withLazy3DLoading(
  LazySmartPointerVisualizations,
  "Cargando visualizaciones de punteros inteligentes..."
);

export const PointerArithmetic3DWithLoading = withLazy3DLoading(
  LazyPointerArithmetic3D,
  "Cargando aritmética de punteros 3D..."
);

export const ConstPointer3DWithLoading = withLazy3DLoading(
  LazyConstPointer3D,
  "Cargando visualizador de const correctness..."
);

export const FunctionPointer3DWithLoading = withLazy3DLoading(
  LazyFunctionPointer3D,
  "Cargando visualizador de punteros a función..."
);

export const MemoryLifecycleVisualizerWithLoading = withLazy3DLoading(
  LazyMemoryLifecycleVisualizer,
  "Cargando visualizador de ciclo de vida RAII..."
);

export const Auto3DDemoWithLoading = withLazy3DLoading(
  LazyAuto3DDemo,
  "Cargando demostración automática 3D..."
);

export const EducationalAnimationsWithLoading = withLazy3DLoading(
  LazyEducationalAnimations,
  "Cargando animaciones educativas..."
);

// Bundle analyzer helper component
export const BundleAnalyzerInfo: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#00d4ff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      📊 Bundle: Three.js components lazy-loaded
      <br />
      🚀 Performance: Optimized for 60fps
      <br />
      💾 Memory: Auto-managed resources
    </div>
  );
};

// Preloader for critical 3D resources
export const ThreeDPreloader: React.FC = () => {
  React.useEffect(() => {
    // Preload critical Three.js modules in the background
    const preloadModules = async () => {
      try {
        // Import Three.js modules that will be needed
        await Promise.all([
          import('three'),
          import('@react-three/fiber'),
          import('@react-three/drei')
        ]);
        
        // Also preload our custom 3D translation module
        await import('../translations/3d-visualization.es');
        
        logger.log('🚀 Three.js modules and translations preloaded successfully');
      } catch (error) {
        logger.warn('⚠️ Failed to preload some Three.js modules:', error);
      }
    };

    // Start preloading after a short delay to not block initial render
    const timer = setTimeout(preloadModules, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
};

// Performance monitoring component for 3D scenes
export const Performance3DMonitor: React.FC = () => {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  
  React.useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
        
        // Estimate memory usage
        if ((performance as any).memory) {
          const memInfo = (performance as any).memory;
          setMemoryUsage(Math.round(memInfo.usedJSHeapSize / 1024 / 1024));
        }
      }
      
      requestAnimationFrame(measurePerformance);
    };
    
    requestAnimationFrame(measurePerformance);
  }, []);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: fps < 30 ? '#FF5252' : fps < 50 ? '#FF9800' : '#4CAF50',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      fontFamily: 'monospace',
      zIndex: 1000,
      border: `1px solid ${fps < 30 ? '#FF5252' : fps < 50 ? '#FF9800' : '#4CAF50'}`
    }}>
      <div>FPS: {fps}</div>
      {memoryUsage > 0 && <div>MEM: {memoryUsage}MB</div>}
      <div style={{ fontSize: '9px', opacity: 0.7 }}>3D PERF</div>
    </div>
  );
};

const Lazy3DComponents = {
  // Core 3D Components
  MemoryVisualizer3D: MemoryVisualizer3DWithLoading,
  EducationalPointerScene: EducationalPointerSceneWithLoading,
  SmartPointerVisualizations: SmartPointerVisualizationsWithLoading,
  PointerArithmetic3D: PointerArithmetic3DWithLoading,
  ConstPointer3D: ConstPointer3DWithLoading,
  FunctionPointer3D: FunctionPointer3DWithLoading,
  MemoryLifecycleVisualizer: MemoryLifecycleVisualizerWithLoading,
  
  // Additional Components
  Auto3DDemo: Auto3DDemoWithLoading,
  EducationalAnimations: EducationalAnimationsWithLoading,
  
  // Utilities
  BundleAnalyzerInfo,
  ThreeDPreloader,
  Performance3DMonitor
};

export default Lazy3DComponents;