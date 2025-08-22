import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { AnimationManager } from '../utils/AnimationManager';
import { MemoryManager } from '../utils/MemoryManager';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  renderTime: number;
  jsHeapSize: number;
  componentCount: number;
  lastUpdate: number;
  // Enhanced metrics
  threejsMemory: number;
  animationCallbacks: number;
  performanceMode: string;
  drawCalls: number;
  triangles: number;
}

interface PerformanceMonitorProps {
  visible?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const MonitorContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'visible',
})<{ visible: boolean }>`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.8rem;
  color: #00d4ff;
  z-index: 9999;
  min-width: 200px;
  transform: translateX(${props => props.visible ? '0' : '220px'});
  transition: transform 0.3s ease;
  backdrop-filter: blur(10px);
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 212, 255, 0.8);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.7rem;
  z-index: 10000;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 1);
    transform: scale(1.05);
  }
`;

const MetricRow = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'warning' && prop !== 'error',
})<{ warning?: boolean; error?: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: ${props => 
    props.error ? '#ff6b6b' :
    props.warning ? '#ffa500' : '#00d4ff'
  };
`;

const MetricLabel = styled.span`
  font-weight: bold;
`;

const MetricValue = styled.span`
  font-family: monospace;
`;

const PerformanceChart = styled.div`
  width: 100%;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  margin: 0.5rem 0;
  position: relative;
  overflow: hidden;
`;

const ChartBar = styled.div<{ height: number; color: string }>`
  position: absolute;
  bottom: 0;
  width: 2px;
  background: ${props => props.color};
  height: ${props => props.height}%;
  transition: height 0.3s ease;
`;

export default function PerformanceMonitor({ 
  visible = false, 
  onMetricsUpdate 
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    renderTime: 0,
    jsHeapSize: 0,
    componentCount: 0,
    lastUpdate: Date.now(),
    // Enhanced metrics
    threejsMemory: 0,
    animationCallbacks: 0,
    performanceMode: 'high',
    drawCalls: 0,
    triangles: 0
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderTimesRef = useRef<number[]>([]);
  const fpsHistoryRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const measurePerformance = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    
    frameCountRef.current++;
    
    if (deltaTime >= 1000) { // Update every second
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
      
      // Memory usage (if available)
      const memory = (performance as any).memory;
      const jsHeapSize = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0;
      
      // Average render time
      const avgRenderTime = renderTimesRef.current.length > 0 
        ? renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length
        : 0;
      
      // Component count (approximate)
      const componentCount = document.querySelectorAll('[data-react-component]').length;
      
      // Enhanced metrics from our systems
      const animationManager = AnimationManager.getInstance();
      const memoryManager = MemoryManager.getInstance();
      
      const animationMetrics = animationManager.getMetrics();
      const memoryStats = memoryManager.getMemoryStats();
      
      const newMetrics: PerformanceMetrics = {
        fps,
        memory: jsHeapSize,
        renderTime: Math.round(avgRenderTime * 100) / 100,
        jsHeapSize,
        componentCount,
        lastUpdate: Date.now(),
        // Enhanced metrics
        threejsMemory: Math.round(memoryStats.estimatedMemoryUsage / 1024 / 1024),
        animationCallbacks: animationMetrics.activeCallbacks,
        performanceMode: animationMetrics.performanceMode,
        drawCalls: memoryStats.meshes + memoryStats.groups,
        triangles: memoryStats.geometries * 12 // Rough estimate
      };
      
      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);
      
      // Store FPS history for chart
      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 50) {
        fpsHistoryRef.current.shift();
      }
      
      // Reset counters
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      renderTimesRef.current = [];
    }
    
    animationFrameRef.current = requestAnimationFrame(measurePerformance);
  }, [onMetricsUpdate]);

  useEffect(() => {
    if (isVisible) {
      measurePerformance();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, measurePerformance]);

  // Performance warnings
  const getFPSStatus = (fps: number) => {
    if (fps < 30) return { warning: false, error: true };
    if (fps < 50) return { warning: true, error: false };
    return { warning: false, error: false };
  };

  const getMemoryStatus = (memory: number) => {
    if (memory > 100) return { warning: false, error: true };
    if (memory > 50) return { warning: true, error: false };
    return { warning: false, error: false };
  };

  const getRenderTimeStatus = (renderTime: number) => {
    if (renderTime > 16.67) return { warning: false, error: true }; // > 60fps
    if (renderTime > 10) return { warning: true, error: false };
    return { warning: false, error: false };
  };

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && !visible) {
    return null;
  }

  return (
    <>
      <ToggleButton onClick={() => setIsVisible(!isVisible)}>
        📊 {isVisible ? 'Hide' : 'Perf'}
      </ToggleButton>
      
      <MonitorContainer visible={isVisible}>
        <MetricRow>
          <MetricLabel>🔧 Performance Monitor</MetricLabel>
        </MetricRow>
        
        <MetricRow {...getFPSStatus(metrics.fps)}>
          <MetricLabel>FPS:</MetricLabel>
          <MetricValue>{metrics.fps}</MetricValue>
        </MetricRow>
        
        <MetricRow {...getMemoryStatus(metrics.memory)}>
          <MetricLabel>Memory:</MetricLabel>
          <MetricValue>{metrics.memory} MB</MetricValue>
        </MetricRow>
        
        <MetricRow {...getRenderTimeStatus(metrics.renderTime)}>
          <MetricLabel>Render:</MetricLabel>
          <MetricValue>{metrics.renderTime} ms</MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Components:</MetricLabel>
          <MetricValue>{metrics.componentCount}</MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>3D Memory:</MetricLabel>
          <MetricValue>{metrics.threejsMemory} MB</MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Animations:</MetricLabel>
          <MetricValue>{metrics.animationCallbacks}</MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Mode:</MetricLabel>
          <MetricValue>{metrics.performanceMode}</MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Draw Calls:</MetricLabel>
          <MetricValue>{metrics.drawCalls}</MetricValue>
        </MetricRow>
        
        {/* FPS Chart */}
        <PerformanceChart>
          {fpsHistoryRef.current.map((fps, index) => (
            <ChartBar
              key={index}
              height={(fps / 60) * 100}
              color={fps < 30 ? '#ff6b6b' : fps < 50 ? '#ffa500' : '#4ecdc4'}
              style={{ left: `${(index / 50) * 100}%` }}
            />
          ))}
        </PerformanceChart>
        
        <MetricRow>
          <MetricLabel style={{ fontSize: '0.7rem', opacity: 0.7 }}>
            Last updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}
          </MetricLabel>
        </MetricRow>
      </MonitorContainer>
    </>
  );
}

// Hook for performance monitoring in components
export function usePerformanceMonitor(componentName: string) {
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef(0);

  const startRender = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartRef.current;
    renderCountRef.current++;
    
    if (renderTime > 16.67) { // Slow render
      logger.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    
    // Log every 100 renders
    if (renderCountRef.current % 100 === 0) {
      logger.log(`📊 Component ${componentName} rendered ${renderCountRef.current} times`);
    }
  }, [componentName]);

  useEffect(() => {
    startRender();
    return endRender;
  });

  return { startRender, endRender };
}
