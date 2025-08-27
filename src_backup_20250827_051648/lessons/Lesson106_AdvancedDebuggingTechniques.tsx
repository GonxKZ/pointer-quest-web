/**
 * Lesson 106: Advanced Debugging Techniques for Pointer-Related Issues
 * Expert-level debugging methodologies, sanitizers, and production debugging tools
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, BufferGeometry, BufferAttribute, MeshBasicMaterial, MeshStandardMaterial, Group, Color } from 'three';
import {
  LessonLayout,
  Section,
  SectionTitle,
  InteractiveSection,
  LearningObjectives,
  Button,
  ButtonGroup,
  CodeBlock,
  PerformanceMonitor,
  AccessibilityAnnouncer
} from '../design-system';

interface AdvancedDebuggingState {
  language: 'en' | 'es';
  debuggingTool: 'address_sanitizer' | 'memory_sanitizer' | 'thread_sanitizer' | 'gdb_advanced' | 'valgrind_advanced' | 'custom_logging' | 'hardware_debug' | 'production_debug';
  isAnimating: boolean;
  sanitizerCoverage: number;
  detectedViolations: number;
  performanceOverhead: number;
  debugSymbols: number;
  tracePoints: number;
  memoryLeaks: number;
  raceConditions: number;
  stackCorruption: number;
}

// 3D Visualization of Advanced Debugging Techniques and Coverage Analysis
const AdvancedDebuggingVisualization: React.FC<{ 
  debuggingTool: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ debuggingTool, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);
  const debugProbes = useRef<{id: number, type: string, coverage: number, overhead: number, active: boolean}[]>([]);
  const codeRegions = useRef<{id: number, instrumented: boolean, violations: number, symbolLevel: number}[]>([]);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.03;
    
    // Simulate different advanced debugging scenarios
    if (debuggingTool === 'address_sanitizer') {
      // AddressSanitizer with shadow memory mapping
      const totalRegions = 40;
      const shadowRatio = 8; // 1:8 shadow memory ratio
      const coverageRate = Math.sin(animationRef.current * 1.2) * 0.1 + 0.92;
      
      codeRegions.current = Array.from({ length: totalRegions }, (_, i) => ({
        id: i,
        instrumented: Math.random() < coverageRate,
        violations: Math.floor(Math.sin(animationRef.current * 2 + i) * 2 + 2),
        symbolLevel: Math.floor(Math.random() * 4) + 1
      }));
      
      debugProbes.current = Array.from({ length: Math.floor(totalRegions / shadowRatio) }, (_, i) => ({
        id: i,
        type: 'shadow_memory',
        coverage: coverageRate * 100,
        overhead: 2.5, // ~2.5x slowdown for ASan
        active: true
      }));
      
      groupRef.current.rotation.y = animationRef.current * 0.3;
      groupRef.current.position.y = Math.sin(animationRef.current * 1.5) * 0.15;
      
      const instrumented = codeRegions.current.filter(r => r.instrumented).length;
      const totalViolations = codeRegions.current.reduce((sum, r) => sum + r.violations, 0);
      
      onMetrics({
        sanitizerCoverage: Math.floor(coverageRate * 100),
        detectedViolations: Math.floor(totalViolations * 0.95), // 95% detection rate
        performanceOverhead: 250, // 2.5x overhead
        debugSymbols: instrumented * 3,
        tracePoints: Math.floor(instrumented * 1.2),
        memoryLeaks: Math.floor(Math.random() * 5),
        raceConditions: 0,
        stackCorruption: Math.floor(totalViolations * 0.15)
      });
    } else if (debuggingTool === 'memory_sanitizer') {
      // MemorySanitizer with uninitialized memory detection
      const memoryBlocks = 35;
      const uninitRate = Math.sin(animationRef.current * 1.8) * 0.08 + 0.12;
      
      codeRegions.current = Array.from({ length: memoryBlocks }, (_, i) => ({
        id: i,
        instrumented: true, // MSan instruments everything
        violations: Math.floor(Math.sin(animationRef.current * 3 + i * 0.5) * 3 + 3),
        symbolLevel: 4 // Full debug symbols needed
      }));
      
      debugProbes.current = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        type: 'uninitialized_tracker',
        coverage: 100,
        overhead: 3.2, // ~3.2x slowdown for MSan
        active: Math.random() > 0.1
      }));
      
      groupRef.current.rotation.x = Math.sin(animationRef.current * 0.8) * 0.4;
      groupRef.current.scale.setScalar(0.85 + Math.cos(animationRef.current * 2.5) * 0.15);
      
      const totalViolations = codeRegions.current.reduce((sum, r) => sum + r.violations, 0);
      
      onMetrics({
        sanitizerCoverage: 100,
        detectedViolations: Math.floor(totalViolations * 0.98), // 98% detection rate for MSan
        performanceOverhead: 320, // 3.2x overhead
        debugSymbols: memoryBlocks * 4,
        tracePoints: memoryBlocks * 2,
        memoryLeaks: Math.floor(totalViolations * 0.05),
        raceConditions: 0,
        stackCorruption: Math.floor(totalViolations * 0.02)
      });
    } else if (debuggingTool === 'thread_sanitizer') {
      // ThreadSanitizer with race condition detection
      const threadRegions = 25;
      const raceRate = Math.sin(animationRef.current * 2.2) * 0.06 + 0.08;
      
      codeRegions.current = Array.from({ length: threadRegions }, (_, i) => ({
        id: i,
        instrumented: Math.random() > 0.05, // 95% instrumentation
        violations: Math.floor(Math.sin(animationRef.current * 1.8 + i * 0.7) * 2 + 2),
        symbolLevel: 3
      }));
      
      debugProbes.current = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        type: 'race_detector',
        coverage: 95,
        overhead: 1.8, // ~1.8x slowdown for TSan
        active: true
      }));
      
      groupRef.current.rotation.z = Math.cos(animationRef.current * 1.4) * 0.5;
      groupRef.current.position.x = Math.sin(animationRef.current * 0.9) * 0.25;
      
      const races = Math.floor(threadRegions * raceRate);
      const totalViolations = codeRegions.current.reduce((sum, r) => sum + r.violations, 0);
      
      onMetrics({
        sanitizerCoverage: 95,
        detectedViolations: Math.floor(totalViolations * 0.88), // 88% detection rate for races
        performanceOverhead: 180, // 1.8x overhead
        debugSymbols: threadRegions * 3,
        tracePoints: threadRegions * 1.5,
        memoryLeaks: 0,
        raceConditions: races,
        stackCorruption: 0
      });
    } else if (debuggingTool === 'gdb_advanced') {
      // Advanced GDB with scripting and watchpoints
      const watchPoints = 12;
      const breakPoints = Math.floor(Math.sin(animationRef.current * 1.6) * 8 + 15);
      
      codeRegions.current = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        instrumented: Math.random() > 0.2, // Debug symbols coverage
        violations: Math.floor(Math.sin(animationRef.current * 2.5 + i * 0.3) * 1 + 1),
        symbolLevel: Math.floor(Math.random() * 4) + 1
      }));
      
      debugProbes.current = Array.from({ length: watchPoints }, (_, i) => ({
        id: i,
        type: 'watchpoint',
        coverage: 80,
        overhead: 0.1, // Minimal overhead when not active
        active: Math.random() > 0.3
      }));
      
      groupRef.current.rotation.y = animationRef.current * 0.2;
      groupRef.current.rotation.x = Math.sin(animationRef.current * 1.1) * 0.3;
      
      const activeWatches = debugProbes.current.filter(p => p.active).length;
      const symbolCoverage = codeRegions.current.filter(r => r.symbolLevel >= 3).length;
      
      onMetrics({
        sanitizerCoverage: 80,
        detectedViolations: Math.floor(breakPoints * 0.6),
        performanceOverhead: 10, // 10% overhead with active debugging
        debugSymbols: symbolCoverage * 5,
        tracePoints: activeWatches + breakPoints,
        memoryLeaks: Math.floor(Math.random() * 3),
        raceConditions: Math.floor(Math.random() * 2),
        stackCorruption: Math.floor(Math.random() * 1)
      });
    } else if (debuggingTool === 'valgrind_advanced') {
      // Advanced Valgrind with custom suppressions and DRD
      const memoryBlocks = 45;
      const leakRate = Math.sin(animationRef.current * 1.3) * 0.04 + 0.06;
      
      codeRegions.current = Array.from({ length: memoryBlocks }, (_, i) => ({
        id: i,
        instrumented: true, // Valgrind instruments at runtime
        violations: Math.floor(Math.sin(animationRef.current * 2.8 + i * 0.4) * 2 + 2),
        symbolLevel: 2
      }));
      
      debugProbes.current = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        type: 'valgrind_tool',
        coverage: 100,
        overhead: 12.0, // 12x slowdown typical for Valgrind
        active: true
      }));
      
      groupRef.current.rotation.x = animationRef.current * 0.4;
      groupRef.current.scale.setScalar(0.9 + Math.sin(animationRef.current * 4) * 0.1);
      
      const leaks = Math.floor(memoryBlocks * leakRate);
      const totalViolations = codeRegions.current.reduce((sum, r) => sum + r.violations, 0);
      
      onMetrics({
        sanitizerCoverage: 100,
        detectedViolations: Math.floor(totalViolations * 0.99), // 99% detection rate
        performanceOverhead: 1200, // 12x overhead
        debugSymbols: memoryBlocks * 2,
        tracePoints: memoryBlocks * 3,
        memoryLeaks: leaks,
        raceConditions: Math.floor(leaks * 0.1),
        stackCorruption: Math.floor(totalViolations * 0.05)
      });
    } else if (debuggingTool === 'custom_logging') {
      // Custom debugging infrastructure with structured logging
      const logPoints = 20;
      const traceRate = Math.sin(animationRef.current * 1.7) * 0.3 + 0.7;
      
      codeRegions.current = Array.from({ length: 35 }, (_, i) => ({
        id: i,
        instrumented: Math.random() < traceRate,
        violations: Math.floor(Math.sin(animationRef.current * 2.1 + i * 0.6) * 1 + 1),
        symbolLevel: 2
      }));
      
      debugProbes.current = Array.from({ length: logPoints }, (_, i) => ({
        id: i,
        type: 'log_probe',
        coverage: traceRate * 100,
        overhead: 0.05, // 5% overhead for structured logging
        active: Math.random() > 0.1
      }));
      
      groupRef.current.rotation.z = Math.sin(animationRef.current * 1.5) * 0.4;
      groupRef.current.position.y = Math.cos(animationRef.current * 2.3) * 0.2;
      
      const activeProbes = debugProbes.current.filter(p => p.active).length;
      const totalViolations = codeRegions.current.reduce((sum, r) => sum + r.violations, 0);
      
      onMetrics({
        sanitizerCoverage: Math.floor(traceRate * 100),
        detectedViolations: Math.floor(totalViolations * 0.3), // Lower detection, but faster
        performanceOverhead: 5, // 5% overhead
        debugSymbols: activeProbes * 2,
        tracePoints: activeProbes * 4,
        memoryLeaks: Math.floor(Math.random() * 2),
        raceConditions: 0,
        stackCorruption: 0
      });
    } else if (debuggingTool === 'hardware_debug') {
      // Hardware debugging features (Intel MPX, ARM Pointer Authentication)
      const hwFeatures = 8;
      const hwCoverage = Math.sin(animationRef.current * 1.4) * 0.15 + 0.75;
      
      codeRegions.current = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        instrumented: Math.random() < hwCoverage,
        violations: Math.floor(Math.sin(animationRef.current * 2.6 + i * 0.8) * 1 + 1),
        symbolLevel: 3
      }));
      
      debugProbes.current = Array.from({ length: hwFeatures }, (_, i) => ({
        id: i,
        type: 'hw_feature',
        coverage: hwCoverage * 100,
        overhead: 0.02, // 2% overhead for hardware features
        active: Math.random() > 0.2
      }));
      
      groupRef.current.rotation.x = Math.cos(animationRef.current * 1.8) * 0.6;
      groupRef.current.rotation.y = Math.sin(animationRef.current * 0.7) * 0.3;
      
      const hwActive = debugProbes.current.filter(p => p.active).length;
      const totalViolations = codeRegions.current.reduce((sum, r) => sum + r.violations, 0);
      
      onMetrics({
        sanitizerCoverage: Math.floor(hwCoverage * 100),
        detectedViolations: Math.floor(totalViolations * 0.85), // 85% detection rate for HW
        performanceOverhead: 2, // 2% overhead
        debugSymbols: hwActive * 3,
        tracePoints: hwActive,
        memoryLeaks: 0,
        raceConditions: 0,
        stackCorruption: Math.floor(totalViolations * 0.9) // HW excellent at stack protection
      });
    } else if (debuggingTool === 'production_debug') {
      // Production debugging with minimal overhead
      const prodProbes = 6;
      const samplingRate = Math.sin(animationRef.current * 1.1) * 0.05 + 0.1;
      
      codeRegions.current = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        instrumented: Math.random() < samplingRate,
        violations: Math.floor(Math.sin(animationRef.current * 1.9 + i * 0.2) * 1 + 1),
        symbolLevel: 1
      }));
      
      debugProbes.current = Array.from({ length: prodProbes }, (_, i) => ({
        id: i,
        type: 'prod_sampler',
        coverage: samplingRate * 100,
        overhead: 0.01, // 1% overhead for production
        active: Math.random() > 0.5
      }));
      
      groupRef.current.rotation.y = animationRef.current * 0.1;
      groupRef.current.scale.setScalar(1.0 + Math.sin(animationRef.current * 3) * 0.05);
      
      const activeSamplers = debugProbes.current.filter(p => p.active).length;
      const totalViolations = codeRegions.current.reduce((sum, r) => sum + r.violations, 0);
      
      onMetrics({
        sanitizerCoverage: Math.floor(samplingRate * 100),
        detectedViolations: Math.floor(totalViolations * 0.1), // 10% detection due to sampling
        performanceOverhead: 1, // 1% overhead
        debugSymbols: activeSamplers,
        tracePoints: activeSamplers * 2,
        memoryLeaks: Math.floor(Math.random() * 1),
        raceConditions: 0,
        stackCorruption: 0
      });
    }
  });

  // Render debugging visualization based on current tool
  const renderVisualization = () => {
    if (!codeRegions.current.length || !debugProbes.current.length) return null;

    const probeElements = debugProbes.current.map((probe, i) => {
      const angle = (i / debugProbes.current.length) * Math.PI * 2;
      const radius = 2.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(animationRef.current * 2 + i) * 0.3;

      let color = '#888888';
      if (probe.type === 'shadow_memory') color = '#ff6b6b';
      else if (probe.type === 'uninitialized_tracker') color = '#4ecdc4';
      else if (probe.type === 'race_detector') color = '#45b7d1';
      else if (probe.type === 'watchpoint') color = '#96ceb4';
      else if (probe.type === 'valgrind_tool') color = '#ffeaa7';
      else if (probe.type === 'log_probe') color = '#dda0dd';
      else if (probe.type === 'hw_feature') color = '#98d8c8';
      else if (probe.type === 'prod_sampler') color = '#f7dc6f';

      return (
        <group key={probe.id}>
          <mesh position={[x, y, z]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial 
              color={color} 
              opacity={probe.active ? 0.8 : 0.3} 
              transparent 
            />
          </mesh>
          {probe.active && (
            <mesh position={[x, y + 0.5, z]}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial color={color} />
            </mesh>
          )}
        </group>
      );
    });

    const regionElements = codeRegions.current.slice(0, 15).map((region, i) => {
      const x = (i % 5 - 2) * 0.8;
      const z = (Math.floor(i / 5) - 1) * 0.8;
      const y = -1 + Math.sin(animationRef.current * 3 + i) * 0.2;

      const color = region.instrumented ? '#00ff88' : '#ff4444';
      const size = 0.2 + (region.symbolLevel / 4) * 0.2;

      return (
        <mesh key={region.id} position={[x, y, z]}>
          <boxGeometry args={[size, size, size]} />
          <meshStandardMaterial 
            color={color} 
            opacity={region.instrumented ? 0.8 : 0.4} 
            transparent 
          />
        </mesh>
      );
    });

    return [...probeElements, ...regionElements];
  };

  return (
    <group ref={groupRef}>
      {renderVisualization()}
      
      {/* Central debugging core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>
      
      {/* Debug symbol representation */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[0.3, 0.8]} />
        <meshStandardMaterial color="#ffdd44" opacity={0.7} transparent />
      </mesh>
      
      {/* Performance overhead indicator */}
      <mesh position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 0.6]} />
        <meshStandardMaterial color="#ff6666" opacity={0.6} transparent />
      </mesh>
    </group>
  );
};

const Lesson106_AdvancedDebuggingTechniques: React.FC = () => {
  const [state, setState] = useState<AdvancedDebuggingState>({
    language: 'en',
    debuggingTool: 'address_sanitizer',
    isAnimating: false,
    sanitizerCoverage: 0,
    detectedViolations: 0,
    performanceOverhead: 0,
    debugSymbols: 0,
    tracePoints: 0,
    memoryLeaks: 0,
    raceConditions: 0,
    stackCorruption: 0
  });

  const toggleLanguage = useCallback(() => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'es' : 'en' }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  const selectDebuggingTool = useCallback((tool: typeof state.debuggingTool) => {
    setState(prev => ({ 
      ...prev, 
      debuggingTool: tool,
      // Reset metrics when switching tools
      sanitizerCoverage: 0,
      detectedViolations: 0,
      performanceOverhead: 0,
      debugSymbols: 0,
      tracePoints: 0,
      memoryLeaks: 0,
      raceConditions: 0,
      stackCorruption: 0
    }));
  }, []);

  const handleMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 106: Advanced Debugging Techniques" : "Lección 106: Técnicas Avanzadas de Depuración"}
      description={state.language === 'en' ? 
        "Master expert-level debugging methodologies for pointer-related issues in production C++ systems" : 
        "Domina metodologías de depuración de nivel experto para problemas relacionados con punteros en sistemas C++ de producción"
      }
    >
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <Button onClick={toggleLanguage} variant="secondary">
          {state.language === 'en' ? '🇪🇸 Español' : '🇺🇸 English'}
        </Button>
      </div>

      <LearningObjectives
        objectives={state.language === 'en' ? [
          "Master advanced sanitizer configurations and shadow memory techniques",
          "Implement sophisticated GDB/LLDB debugging workflows with scripting",
          "Deploy production-grade debugging infrastructure with minimal overhead",
          "Utilize hardware debugging features for pointer authentication and bounds checking",
          "Design comprehensive debugging strategies for large-scale C++ applications"
        ] : [
          "Dominar configuraciones avanzadas de sanitizadores y técnicas de memoria sombra",
          "Implementar flujos de trabajo sofisticados de depuración GDB/LLDB con scripting",
          "Desplegar infraestructura de depuración de grado de producción con sobrecarga mínima",
          "Utilizar características de depuración de hardware para autenticación de punteros y verificación de límites",
          "Diseñar estrategias integrales de depuración para aplicaciones C++ de gran escala"
        ]}
      />

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? "Advanced Debugging Tools Visualization" : "Visualización de Herramientas de Depuración Avanzadas"}
        </SectionTitle>
        
        <ButtonGroup>
          <Button 
            variant={state.debuggingTool === 'address_sanitizer' ? 'primary' : 'secondary'}
            onClick={() => selectDebuggingTool('address_sanitizer')}
          >
            {state.language === 'en' ? 'AddressSanitizer' : 'AddressSanitizer'}
          </Button>
          <Button 
            variant={state.debuggingTool === 'memory_sanitizer' ? 'primary' : 'secondary'}
            onClick={() => selectDebuggingTool('memory_sanitizer')}
          >
            {state.language === 'en' ? 'MemorySanitizer' : 'MemorySanitizer'}
          </Button>
          <Button 
            variant={state.debuggingTool === 'thread_sanitizer' ? 'primary' : 'secondary'}
            onClick={() => selectDebuggingTool('thread_sanitizer')}
          >
            {state.language === 'en' ? 'ThreadSanitizer' : 'ThreadSanitizer'}
          </Button>
          <Button 
            variant={state.debuggingTool === 'gdb_advanced' ? 'primary' : 'secondary'}
            onClick={() => selectDebuggingTool('gdb_advanced')}
          >
            {state.language === 'en' ? 'Advanced GDB' : 'GDB Avanzado'}
          </Button>
          <Button 
            variant={state.debuggingTool === 'valgrind_advanced' ? 'primary' : 'secondary'}
            onClick={() => selectDebuggingTool('valgrind_advanced')}
          >
            {state.language === 'en' ? 'Valgrind Suite' : 'Suite Valgrind'}
          </Button>
          <Button 
            variant={state.debuggingTool === 'custom_logging' ? 'primary' : 'secondary'}
            onClick={() => selectDebuggingTool('custom_logging')}
          >
            {state.language === 'en' ? 'Custom Logging' : 'Logging Personalizado'}
          </Button>
          <Button 
            variant={state.debuggingTool === 'hardware_debug' ? 'primary' : 'secondary'}
            onClick={() => selectDebuggingTool('hardware_debug')}
          >
            {state.language === 'en' ? 'Hardware Debug' : 'Debug Hardware'}
          </Button>
          <Button 
            variant={state.debuggingTool === 'production_debug' ? 'primary' : 'secondary'}
            onClick={() => selectDebuggingTool('production_debug')}
          >
            {state.language === 'en' ? 'Production Debug' : 'Debug Producción'}
          </Button>
        </ButtonGroup>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button onClick={toggleAnimation} variant={state.isAnimating ? 'primary' : 'secondary'}>
            {state.isAnimating ? 
              (state.language === 'en' ? 'Stop Analysis' : 'Detener Análisis') :
              (state.language === 'en' ? 'Start Analysis' : 'Iniciar Análisis')
            }
          </Button>
        </div>

        <div style={{ height: '500px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: '12px', marginTop: '1rem' }}>
          <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            <AdvancedDebuggingVisualization 
              debuggingTool={state.debuggingTool}
              isAnimating={state.isAnimating}
              onMetrics={handleMetrics}
            />
          </Canvas>
        </div>

        <PerformanceMonitor
          metrics={[
            { name: state.language === 'en' ? 'Coverage %' : 'Cobertura %', value: `${state.sanitizerCoverage}%` },
            { name: state.language === 'en' ? 'Violations' : 'Violaciones', value: state.detectedViolations.toString() },
            { name: state.language === 'en' ? 'Overhead %' : 'Sobrecarga %', value: `${state.performanceOverhead}%` },
            { name: state.language === 'en' ? 'Debug Symbols' : 'Símbolos Debug', value: state.debugSymbols.toString() },
            { name: state.language === 'en' ? 'Trace Points' : 'Puntos de Trace', value: state.tracePoints.toString() },
            { name: state.language === 'en' ? 'Memory Leaks' : 'Fugas de Memoria', value: state.memoryLeaks.toString() },
            { name: state.language === 'en' ? 'Race Conditions' : 'Condiciones de Carrera', value: state.raceConditions.toString() },
            { name: state.language === 'en' ? 'Stack Corruption' : 'Corrupción de Stack', value: state.stackCorruption.toString() }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "AddressSanitizer Deep Dive" : "Inmersión Profunda en AddressSanitizer"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "AddressSanitizer (ASan) uses shadow memory to track the state of every byte in your application's memory space. It maintains a 1:8 mapping where each byte of application memory corresponds to one bit in shadow memory." :
            "AddressSanitizer (ASan) utiliza memoria sombra para rastrear el estado de cada byte en el espacio de memoria de tu aplicación. Mantiene un mapeo 1:8 donde cada byte de memoria de aplicación corresponde a un bit en la memoria sombra."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <vector>
#include <memory>
#include <sanitizer/asan_interface.h>

class AdvancedAsanDebugging {
public:
    // Custom poisoning for debugging
    static void poison_memory_region(void* addr, size_t size) {
        __asan_poison_memory_region(addr, size);
        std::cout << "Poisoned region: " << addr << " size: " << size << std::endl;
    }
    
    static void unpoison_memory_region(void* addr, size_t size) {
        __asan_unpoison_memory_region(addr, size);
        std::cout << "Unpoisoned region: " << addr << " size: " << size << std::endl;
    }
    
    // Check if memory region is poisoned
    static bool is_poisoned(void* addr) {
        return __asan_address_is_poisoned(addr);
    }
    
    // Advanced shadow memory inspection
    static void inspect_shadow_memory(void* addr, size_t size) {
        std::cout << "Shadow memory inspection for " << addr << ":" << std::endl;
        
        for (size_t i = 0; i < size; i += 8) {
            void* current_addr = static_cast<char*>(addr) + i;
            int shadow_value = __asan_address_is_poisoned(current_addr);
            
            std::cout << "  Offset " << i << ": " << current_addr 
                     << " Shadow: " << (shadow_value ? "POISONED" : "VALID") << std::endl;
        }
    }
    
    // Demonstrate use-after-free detection with custom annotations
    static void demonstrate_uaf_detection() {
        const size_t buffer_size = 256;
        char* buffer = new char[buffer_size];
        
        // Fill buffer with pattern
        for (size_t i = 0; i < buffer_size; ++i) {
            buffer[i] = static_cast<char>('A' + (i % 26));
        }
        
        std::cout << "Buffer allocated at: " << static_cast<void*>(buffer) << std::endl;
        inspect_shadow_memory(buffer, 32); // Inspect first 32 bytes
        
        // Delete buffer
        delete[] buffer;
        std::cout << "Buffer deleted" << std::endl;
        
        // Shadow memory should now show poisoned state
        inspect_shadow_memory(buffer, 32);
        
        // This would trigger ASan error in debug mode:
        // char first_byte = buffer[0]; // Use-after-free!
        
        std::cout << "Use-after-free would be detected here" << std::endl;
    }
    
    // Stack buffer overflow detection with guard zones
    static void demonstrate_stack_overflow_detection() {
        const int array_size = 10;
        int stack_array[array_size];
        
        std::cout << "Stack array at: " << static_cast<void*>(stack_array) << std::endl;
        
        // Fill array normally
        for (int i = 0; i < array_size; ++i) {
            stack_array[i] = i * i;
        }
        
        // Inspect shadow memory around stack array
        inspect_shadow_memory(stack_array - 2, (array_size + 4) * sizeof(int));
        
        // This would trigger stack buffer overflow:
        // stack_array[array_size] = 999; // Buffer overflow!
        
        std::cout << "Stack overflow would be detected at boundary" << std::endl;
    }
    
    // Global variable redzone checking
    static void demonstrate_global_redzone() {
        extern int global_var;
        
        std::cout << "Global variable at: " << static_cast<void*>(&global_var) << std::endl;
        
        // Inspect shadow memory around global variable
        inspect_shadow_memory(&global_var - 2, 5 * sizeof(int));
        
        global_var = 42; // Normal access
        
        // This would trigger global buffer overflow:
        // (&global_var)[1] = 999; // Global overflow!
        
        std::cout << "Global overflow would be detected" << std::endl;
    }
    
    // Custom allocator with ASan integration
    class AsanAwareAllocator {
    public:
        static void* allocate(size_t size, size_t alignment = 8) {
            // Allocate with extra space for redzones
            size_t total_size = size + 2 * alignment;
            void* raw_ptr = aligned_alloc(alignment, total_size);
            
            if (!raw_ptr) return nullptr;
            
            char* ptr = static_cast<char*>(raw_ptr);
            
            // Poison redzones
            poison_memory_region(ptr, alignment);
            poison_memory_region(ptr + alignment + size, alignment);
            
            // Return pointer to usable memory
            return ptr + alignment;
        }
        
        static void deallocate(void* ptr, size_t size, size_t alignment = 8) {
            if (!ptr) return;
            
            char* raw_ptr = static_cast<char*>(ptr) - alignment;
            size_t total_size = size + 2 * alignment;
            
            // Poison entire region before deallocation
            poison_memory_region(raw_ptr, total_size);
            
            free(raw_ptr);
        }
    };
    
    static void demonstrate_custom_allocator() {
        const size_t alloc_size = 128;
        void* custom_ptr = AsanAwareAllocator::allocate(alloc_size);
        
        if (custom_ptr) {
            std::cout << "Custom allocation at: " << custom_ptr << std::endl;
            inspect_shadow_memory(static_cast<char*>(custom_ptr) - 16, alloc_size + 32);
            
            // Use memory normally
            memset(custom_ptr, 0xAB, alloc_size);
            
            AsanAwareAllocator::deallocate(custom_ptr, alloc_size);
            std::cout << "Custom deallocation completed" << std::endl;
        }
    }
};

// Global variable for testing
int global_var = 0;

// Advanced ASan configuration and usage
class AsanConfiguration {
public:
    static void configure_advanced_options() {
        // These would typically be set via environment variables:
        
        // ASAN_OPTIONS=verbosity=3:halt_on_error=1:abort_on_error=1
        // Fast unwinder for better performance
        // ASAN_OPTIONS=fast_unwind_on_malloc=1:fast_unwind_on_fatal=1
        
        // Detect stack use after return
        // ASAN_OPTIONS=detect_stack_use_after_return=true
        
        // Custom suppression file
        // ASAN_OPTIONS=suppressions=/path/to/asan.supp
        
        // Quarantine size for use-after-free detection
        // ASAN_OPTIONS=quarantine_size_mb=256
        
        std::cout << "ASan configured with advanced options" << std::endl;
        std::cout << "Key options:" << std::endl;
        std::cout << "  - Shadow memory mapping: 1:8 ratio" << std::endl;
        std::cout << "  - Quarantine enabled for delayed reuse" << std::endl;
        std::cout << "  - Stack use-after-return detection" << std::endl;
        std::cout << "  - Global buffer overflow detection" << std::endl;
        std::cout << "  - Initialization order bug detection" << std::endl;
    }
    
    static void print_memory_layout() {
        std::cout << "\\nASan Memory Layout:" << std::endl;
        std::cout << "[0x10007fff8000, 0x7fffffffffff] : HighMem" << std::endl;
        std::cout << "[0x02008fff7000, 0x10007fff7fff] : HighShadow" << std::endl;
        std::cout << "[0x00008fff7000, 0x02008fff6fff] : ShadowGap" << std::endl;
        std::cout << "[0x00007fff8000, 0x00008fff6fff] : LowShadow" << std::endl;
        std::cout << "[0x000000000000, 0x00007fff7fff] : LowMem" << std::endl;
        std::cout << "\\nShadow byte meanings:" << std::endl;
        std::cout << "  0x00: 8 bytes addressable" << std::endl;
        std::cout << "  0x01-0x07: N bytes addressable" << std::endl;
        std::cout << "  0xf9: Stack left redzone" << std::endl;
        std::cout << "  0xfa: Stack mid redzone" << std::endl;
        std::cout << "  0xfb: Stack right redzone" << std::endl;
        std::cout << "  0xfc: Stack after return" << std::endl;
        std::cout << "  0xfd: Heap freed memory" << std::endl;
        std::cout << "  0xfe: Heap right redzone" << std::endl;
    }
};`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "MemorySanitizer and Uninitialized Memory Detection" : "MemorySanitizer y Detección de Memoria No Inicializada"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "MemorySanitizer (MSan) tracks the initialization state of every bit in memory, detecting use of uninitialized values that could lead to unpredictable behavior." :
            "MemorySanitizer (MSan) rastrea el estado de inicialización de cada bit en memoria, detectando el uso de valores no inicializados que podrían llevar a comportamiento impredecible."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <vector>
#include <memory>
#include <cstring>
#include <sanitizer/msan_interface.h>

class MemorySanitizerAdvanced {
public:
    // Manual memory state manipulation for testing
    static void poison_memory(void* addr, size_t size) {
        __msan_poison(addr, size);
        std::cout << "MSan: Poisoned " << size << " bytes at " << addr << std::endl;
    }
    
    static void unpoison_memory(void* addr, size_t size) {
        __msan_unpoison(addr, size);
        std::cout << "MSan: Unpoisoned " << size << " bytes at " << addr << std::endl;
    }
    
    static void check_memory_is_initialized(const void* addr, size_t size) {
        int result = __msan_test_shadow(addr, size);
        if (result >= 0) {
            std::cout << "MSan: Uninitialized memory detected at offset " << result << std::endl;
        } else {
            std::cout << "MSan: Memory region is fully initialized" << std::endl;
        }
    }
    
    // Demonstrate complex initialization tracking
    static void demonstrate_initialization_tracking() {
        std::cout << "\\n=== MSan Initialization Tracking Demo ===" << std::endl;
        
        struct ComplexStruct {
            int initialized_field;
            int uninitialized_field; // Will not be initialized
            char buffer[16];
            double* dynamic_ptr;
            
            ComplexStruct() : initialized_field(42), dynamic_ptr(new double(3.14)) {
                // Note: uninitialized_field and buffer are not initialized
                // Only initialize first half of buffer
                memset(buffer, 'A', 8);
                // buffer[8-15] remains uninitialized
            }
            
            ~ComplexStruct() {
                delete dynamic_ptr;
            }
        };
        
        ComplexStruct obj;
        
        // Check initialization status of different fields
        std::cout << "Checking initialized_field..." << std::endl;
        check_memory_is_initialized(&obj.initialized_field, sizeof(obj.initialized_field));
        
        std::cout << "Checking uninitialized_field..." << std::endl;
        check_memory_is_initialized(&obj.uninitialized_field, sizeof(obj.uninitialized_field));
        
        std::cout << "Checking first half of buffer..." << std::endl;
        check_memory_is_initialized(obj.buffer, 8);
        
        std::cout << "Checking second half of buffer..." << std::endl;
        check_memory_is_initialized(obj.buffer + 8, 8);
        
        // Using uninitialized memory would trigger MSan error:
        // int bad = obj.uninitialized_field + 1; // MSan error!
        
        std::cout << "MSan would detect uninitialized memory usage" << std::endl;
    }
    
    // Demonstrate propagation of uninitialized state
    static void demonstrate_uninitialized_propagation() {
        std::cout << "\\n=== Uninitialized State Propagation ===" << std::endl;
        
        int uninitialized_var;
        poison_memory(&uninitialized_var, sizeof(uninitialized_var));
        
        // Propagation through arithmetic operations
        // int result1 = uninitialized_var + 5; // Would propagate taint
        // int result2 = result1 * 2;           // Further propagation
        
        // Propagation through memory operations
        int array[5];
        // array[0] = uninitialized_var;        // Propagates to array[0]
        // memcpy(&array[1], &array[0], sizeof(int)); // Propagates to array[1]
        
        // Demonstration of conditional propagation
        bool uninitialized_bool;
        poison_memory(&uninitialized_bool, sizeof(uninitialized_bool));
        
        int safe_value = 10;
        // int conditional_result = uninitialized_bool ? safe_value : 20;
        // MSan would detect that result depends on uninitialized condition
        
        std::cout << "MSan tracks uninitialized state through:" << std::endl;
        std::cout << "  - Arithmetic operations" << std::endl;
        std::cout << "  - Memory copies" << std::endl;
        std::cout << "  - Conditional expressions" << std::endl;
        std::cout << "  - Function parameters" << std::endl;
    }
    
    // Memory origins tracking for debugging
    static void demonstrate_origin_tracking() {
        std::cout << "\\n=== Memory Origin Tracking ===" << std::endl;
        
        // Origin tracking helps identify where uninitialized memory came from
        // Enable with: -fsanitize-memory-track-origins=2
        
        struct OriginTest {
            int field_a;
            int field_b;
            int field_c;
            
            OriginTest() {
                field_a = 1;  // Line X: Initialized here
                // field_b not initialized - origin will point to this line
                field_c = 3;  // Line Z: Initialized here
            }
        };
        
        OriginTest test_obj;
        
        // MSan with origin tracking would show:
        // "Use of uninitialized memory at line Y, originated at line X+1"
        
        std::cout << "Origin tracking provides:" << std::endl;
        std::cout << "  - Source line where uninitialized memory was created" << std::endl;
        std::cout << "  - Stack trace of allocation" << std::endl;
        std::cout << "  - Chain of propagation through operations" << std::endl;
    }
    
    // Custom uninitialized memory detector
    class CustomUninitDetector {
    private:
        static constexpr uint32_t MAGIC_UNINIT = 0xDEADBEEF;
        static constexpr uint32_t MAGIC_INIT = 0xCAFEBABE;
        
    public:
        template<typename T>
        static void mark_uninitialized(T& obj) {
            // Fill with magic pattern to detect uninitialized access
            memset(&obj, 0xCC, sizeof(T)); // 0xCC pattern
            
            // Add MSan annotation
            poison_memory(&obj, sizeof(T));
        }
        
        template<typename T>
        static void mark_initialized(T& obj) {
            unpoison_memory(&obj, sizeof(T));
        }
        
        template<typename T>
        static bool is_initialized(const T& obj) {
            return __msan_test_shadow(&obj, sizeof(T)) < 0;
        }
        
        // Wrapper class for automatic tracking
        template<typename T>
        class TrackedValue {
        private:
            T value_;
            bool initialized_;
            
        public:
            TrackedValue() : initialized_(false) {
                mark_uninitialized(value_);
            }
            
            TrackedValue(const T& val) : value_(val), initialized_(true) {
                mark_initialized(value_);
            }
            
            TrackedValue& operator=(const T& val) {
                value_ = val;
                initialized_ = true;
                mark_initialized(value_);
                return *this;
            }
            
            const T& get() const {
                if (!initialized_) {
                    std::cerr << "Warning: Accessing uninitialized TrackedValue!" << std::endl;
                }
                return value_;
            }
            
            bool is_initialized() const {
                return initialized_ && CustomUninitDetector::is_initialized(value_);
            }
        };
    };
    
    static void demonstrate_custom_detector() {
        std::cout << "\\n=== Custom Uninitialized Detector ===" << std::endl;
        
        CustomUninitDetector::TrackedValue<int> tracked_int;
        
        std::cout << "Tracked value initialized: " << tracked_int.is_initialized() << std::endl;
        
        tracked_int = 42;
        std::cout << "After assignment - initialized: " << tracked_int.is_initialized() << std::endl;
        std::cout << "Value: " << tracked_int.get() << std::endl;
        
        // Demonstrate with struct
        struct TestStruct {
            int a, b, c;
        };
        
        TestStruct test_struct;
        CustomUninitDetector::mark_uninitialized(test_struct);
        
        test_struct.a = 1;
        test_struct.b = 2;
        // test_struct.c remains uninitialized
        
        CustomUninitDetector::mark_initialized(test_struct.a);
        CustomUninitDetector::mark_initialized(test_struct.b);
        // c remains poisoned
        
        std::cout << "Struct field 'a' initialized: " 
                  << CustomUninitDetector::is_initialized(test_struct.a) << std::endl;
        std::cout << "Struct field 'c' initialized: " 
                  << CustomUninitDetector::is_initialized(test_struct.c) << std::endl;
    }
};

// MSan configuration and best practices
class MSanConfiguration {
public:
    static void configure_msan_options() {
        std::cout << "\\n=== MSan Configuration Options ===" << std::endl;
        std::cout << "Key environment variables:" << std::endl;
        std::cout << "  MSAN_OPTIONS=print_stats=1" << std::endl;
        std::cout << "  MSAN_OPTIONS=halt_on_error=1" << std::endl;
        std::cout << "  MSAN_OPTIONS=abort_on_error=1" << std::endl;
        std::cout << "  MSAN_OPTIONS=poison_in_dtor=1" << std::endl;
        
        std::cout << "\\nCompilation flags:" << std::endl;
        std::cout << "  -fsanitize=memory" << std::endl;
        std::cout << "  -fsanitize-memory-track-origins=2" << std::endl;
        std::cout << "  -fno-omit-frame-pointer" << std::endl;
        std::cout << "  -g -O1" << std::endl;
        
        std::cout << "\\nBest practices:" << std::endl;
        std::cout << "  - Rebuild all dependencies with MSan" << std::endl;
        std::cout << "  - Use MSan-instrumented standard library" << std::endl;
        std::cout << "  - Enable origin tracking for better debugging" << std::endl;
        std::cout << "  - Test with representative data sets" << std::endl;
    }
};`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Advanced GDB Techniques and Scripting" : "Técnicas Avanzadas de GDB y Scripting"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "Advanced GDB usage involves custom commands, Python scripting, and sophisticated breakpoint strategies for debugging complex pointer-related issues." :
            "El uso avanzado de GDB involucra comandos personalizados, scripting en Python, y estrategias sofisticadas de breakpoints para depurar problemas complejos relacionados con punteros."
          }
        </p>

        <CodeBlock
          language="python"
          code={`# Advanced GDB Python Scripts for Pointer Debugging

import gdb
import gdb.printing
import re
from typing import Dict, List, Optional, Any

class AdvancedPointerDebugger:
    """Advanced GDB commands for pointer debugging and analysis"""
    
    def __init__(self):
        self.watchpoints: Dict[str, Dict[str, Any]] = {}
        self.pointer_history: List[Dict[str, Any]] = []
        self.allocation_tracker: Dict[int, Dict[str, Any]] = {}
    
    def register_commands(self):
        """Register custom GDB commands"""
        PointerAnalysisCommand()
        WatchPointerCommand()
        MemoryLeakDetector()
        HeapAnalyzer()
        StackAnalyzer()
        SmartPointerInspector()

class PointerAnalysisCommand(gdb.Command):
    """Analyze pointer relationships and validity"""
    
    def __init__(self):
        super().__init__("ptr-analysis", gdb.COMMAND_USER)
    
    def invoke(self, argument, from_tty):
        args = gdb.string_to_argv(argument)
        if not args:
            print("Usage: ptr-analysis <pointer_expression>")
            return
        
        ptr_expr = args[0]
        
        try:
            # Evaluate pointer expression
            ptr_val = gdb.parse_and_eval(ptr_expr)
            ptr_addr = int(ptr_val)
            
            print(f"\\n=== Pointer Analysis for {ptr_expr} ===")
            print(f"Address: {hex(ptr_addr)}")
            
            # Check if pointer is null
            if ptr_addr == 0:
                print("Status: NULL pointer")
                return
            
            # Check if address is in valid memory range
            if self.is_valid_address(ptr_addr):
                print("Status: Valid memory address")
                
                # Analyze memory region
                self.analyze_memory_region(ptr_addr)
                
                # Check for heap corruption patterns
                self.check_heap_corruption(ptr_addr)
                
                # Analyze pointer target
                self.analyze_target(ptr_val)
                
            else:
                print("Status: Invalid memory address (possible dangling pointer)")
        
        except gdb.error as e:
            print(f"Error analyzing pointer: {e}")
    
    def is_valid_address(self, addr: int) -> bool:
        """Check if address is in valid memory range"""
        try:
            # Try to read one byte from the address
            gdb.selected_inferior().read_memory(addr, 1)
            return True
        except:
            return False
    
    def analyze_memory_region(self, addr: int):
        """Analyze what memory region the address belongs to"""
        try:
            # Get memory map
            maps = gdb.execute("info proc mappings", to_string=True)
            
            for line in maps.split('\\n'):
                if 'Start Addr' in line or 'start_addr' in line:
                    continue
                
                parts = line.strip().split()
                if len(parts) >= 2:
                    try:
                        start = int(parts[0], 16)
                        end = int(parts[1], 16)
                        
                        if start <= addr < end:
                            region_type = "Unknown"
                            if len(parts) > 4:
                                region_info = ' '.join(parts[4:])
                                if '[heap]' in region_info:
                                    region_type = "Heap"
                                elif '[stack]' in region_info:
                                    region_type = "Stack"
                                elif '.so' in region_info or '.dll' in region_info:
                                    region_type = "Shared Library"
                                elif any(seg in region_info for seg in ['.text', '.data', '.bss']):
                                    region_type = "Program Segment"
                            
                            print(f"Memory Region: {region_type}")
                            print(f"Range: {hex(start)} - {hex(end)}")
                            return
                    except ValueError:
                        continue
            
            print("Memory Region: Unknown (not found in mappings)")
        
        except gdb.error:
            print("Memory Region: Unable to determine")
    
    def check_heap_corruption(self, addr: int):
        """Check for common heap corruption patterns"""
        try:
            # Read surrounding memory to check for corruption patterns
            mem_before = gdb.selected_inferior().read_memory(addr - 32, 32)
            mem_after = gdb.selected_inferior().read_memory(addr, 32)
            
            # Check for common corruption patterns
            corruption_patterns = [
                b'\\xde\\xad\\xbe\\xef',  # Dead beef pattern
                b'\\xfe\\xee\\xfe\\xee',  # Freed memory pattern
                b'\\xcc\\xcc\\xcc\\xcc',  # Uninitialized pattern
                b'\\xab\\xab\\xab\\xab',  # Heap guard pattern
            ]
            
            for pattern in corruption_patterns:
                if pattern in mem_before or pattern in mem_after:
                    print(f"Warning: Corruption pattern {pattern.hex()} detected!")
        
        except:
            pass
    
    def analyze_target(self, ptr_val):
        """Analyze the target of the pointer"""
        try:
            target_type = ptr_val.type.target()
            print(f"Target Type: {target_type}")
            
            if target_type.code == gdb.TYPE_CODE_PTR:
                print("Type: Pointer to pointer")
                # Recursively analyze if it's a pointer to pointer
                indirect_val = ptr_val.dereference()
                print(f"Indirect target: {indirect_val}")
            
            elif target_type.code == gdb.TYPE_CODE_STRUCT:
                print("Type: Pointer to struct/class")
                self.analyze_struct_members(ptr_val.dereference())
            
            elif target_type.code == gdb.TYPE_CODE_ARRAY:
                print("Type: Pointer to array")
                self.analyze_array_bounds(ptr_val)
        
        except gdb.error as e:
            print(f"Cannot analyze target: {e}")
    
    def analyze_struct_members(self, struct_val):
        """Analyze struct/class members for pointer issues"""
        try:
            struct_type = struct_val.type
            print("\\nStruct members analysis:")
            
            for field in struct_type.fields():
                if field.type.code == gdb.TYPE_CODE_PTR:
                    member_val = struct_val[field.name]
                    member_addr = int(member_val) if member_val else 0
                    
                    status = "NULL" if member_addr == 0 else (
                        "Valid" if self.is_valid_address(member_addr) else "Invalid"
                    )
                    print(f"  {field.name}: {hex(member_addr)} ({status})")
        
        except gdb.error:
            pass

class WatchPointerCommand(gdb.Command):
    """Advanced watchpoint management for pointers"""
    
    def __init__(self):
        super().__init__("watch-ptr", gdb.COMMAND_BREAKPOINTS)
        self.watched_pointers = {}
    
    def invoke(self, argument, from_tty):
        args = gdb.string_to_argv(argument)
        if not args:
            print("Usage: watch-ptr <add|remove|list> [pointer_expr]")
            return
        
        command = args[0]
        
        if command == "add" and len(args) > 1:
            self.add_pointer_watch(args[1])
        elif command == "remove" and len(args) > 1:
            self.remove_pointer_watch(args[1])
        elif command == "list":
            self.list_watched_pointers()
        else:
            print("Usage: watch-ptr <add|remove|list> [pointer_expr]")
    
    def add_pointer_watch(self, ptr_expr: str):
        """Add comprehensive watching for a pointer"""
        try:
            # Watch for pointer value changes
            wp1 = gdb.execute(f"watch {ptr_expr}", to_string=True)
            
            # Watch for target value changes (if pointer is valid)
            try:
                target_expr = f"*({ptr_expr})"
                wp2 = gdb.execute(f"watch {target_expr}", to_string=True)
            except:
                wp2 = "Target not watchable"
            
            # Set up conditional breakpoint for null assignment
            bp = gdb.execute(f"break *{ptr_expr} if {ptr_expr} == 0", to_string=True)
            
            self.watched_pointers[ptr_expr] = {
                'pointer_watch': wp1,
                'target_watch': wp2,
                'null_break': bp
            }
            
            print(f"Added comprehensive watching for {ptr_expr}")
            print(f"  Pointer watch: {wp1.strip()}")
            print(f"  Target watch: {wp2}")
        
        except gdb.error as e:
            print(f"Error adding pointer watch: {e}")

class MemoryLeakDetector(gdb.Command):
    """Detect memory leaks using GDB"""
    
    def __init__(self):
        super().__init__("detect-leaks", gdb.COMMAND_USER)
        self.allocations = {}
        self.allocation_id = 0
    
    def invoke(self, argument, from_tty):
        print("\\n=== Memory Leak Detection ===")
        
        # Set breakpoints on allocation functions
        self.setup_allocation_tracking()
        
        print("Allocation tracking enabled.")
        print("Run your program, then use 'detect-leaks report' to see results.")
    
    def setup_allocation_tracking(self):
        """Set up breakpoints to track allocations"""
        
        # Track malloc/new
        malloc_bp = """
        break malloc
        commands
        silent
        python
        detector = gdb.lookup_command("detect-leaks").command
        detector.track_allocation("malloc", $rdi)
        end
        continue
        end
        """
        
        # Track free/delete
        free_bp = """
        break free
        commands
        silent
        python
        detector = gdb.lookup_command("detect-leaks").command
        detector.track_deallocation("free", $rdi)
        end
        continue
        end
        """
        
        try:
            gdb.execute(malloc_bp)
            gdb.execute(free_bp)
        except gdb.error as e:
            print(f"Warning: Could not set up allocation tracking: {e}")
    
    def track_allocation(self, func: str, size_or_addr):
        """Track memory allocation"""
        self.allocation_id += 1
        
        # Get stack trace
        try:
            bt = gdb.execute("bt 5", to_string=True)
        except:
            bt = "No backtrace available"
        
        self.allocations[self.allocation_id] = {
            'function': func,
            'size': int(size_or_addr),
            'address': None,  # Will be filled on return
            'backtrace': bt,
            'freed': False
        }
    
    def track_deallocation(self, func: str, addr):
        """Track memory deallocation"""
        addr_int = int(addr)
        
        # Find matching allocation
        for alloc_id, alloc_info in self.allocations.items():
            if alloc_info['address'] == addr_int and not alloc_info['freed']:
                alloc_info['freed'] = True
                break

# GDB initialization script
class GDBPointerDebugInit:
    \"\"\"Initialize advanced pointer debugging environment\"\"\"
    
    @staticmethod
    def setup_environment():
        # Custom GDB commands
        commands = '''
        # Pointer analysis macro
        define ptr-info
            if $argc != 1
                help ptr-info
            else
                printf "Pointer: %p\\n", $arg0
                printf "Target: "
                p *$arg0
                printf "Type: "
                ptype $arg0
                printf "Target Type: "
                ptype *$arg0
            end
        end
        
        document ptr-info
        Display comprehensive information about a pointer.
        Usage: ptr-info <pointer>
        end
        
        # Heap chunk analysis
        define heap-chunk
            if $argc != 1
                help heap-chunk
            else
                # Assume glibc malloc implementation
                set $chunk = (struct malloc_chunk*)((char*)$arg0 - 2*sizeof(size_t))
                printf "Chunk at %p:\\n", $chunk
                printf "  Size: %zu\\n", $chunk->size & ~7
                printf "  Flags: %s%s%s\\n", 
                    ($chunk->size & 1) ? "PREV_INUSE " : "",
                    ($chunk->size & 2) ? "IS_MMAPPED " : "",
                    ($chunk->size & 4) ? "NON_MAIN_ARENA " : ""
                printf "  Data: %p\\n", $arg0
            end
        end
        
        document heap-chunk
        Analyze glibc heap chunk structure.
        Usage: heap-chunk <data_pointer>
        end
        
        # Smart pointer analysis
        define smart-ptr
            if $argc != 1
                help smart-ptr
            else
                printf "Smart pointer analysis:\\n"
                printf "Address: %p\\n", &$arg0
                printf "Raw pointer: %p\\n", $arg0.get()
                printf "Use count: %ld\\n", $arg0.use_count()
                printf "Target: "
                p *$arg0
            end
        end
        
        document smart-ptr
        Analyze C++ smart pointer (shared_ptr/unique_ptr).
        Usage: smart-ptr <smart_pointer>
        end
        '''
        
        print("Setting up advanced GDB pointer debugging environment...")
        
        # Load custom commands
        for line in commands.split('\\n'):
            if line.strip():
                try:
                    gdb.execute(line)
                except gdb.error as e:
                    pass  # Skip invalid commands
        
        # Set useful defaults
        gdb.execute("set print pretty on")
        gdb.execute("set print array on")
        gdb.execute("set print array-indexes on")
        gdb.execute("set print symbol-filename on")
        
        print("Advanced pointer debugging environment ready!")

# Auto-initialize when loaded
if __name__ == "__main__":
    debugger = AdvancedPointerDebugger()
    debugger.register_commands()
    GDBPointerDebugInit.setup_environment()
    print("Advanced GDB pointer debugging tools loaded!")`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Hardware-Assisted Debugging Features" : "Características de Depuración Asistida por Hardware"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "Modern processors provide hardware-assisted debugging features like Intel MPX (Memory Protection Extensions) and ARM Pointer Authentication that can detect pointer violations at the hardware level with minimal performance overhead." :
            "Los procesadores modernos proporcionan características de depuración asistida por hardware como Intel MPX (Extensiones de Protección de Memoria) y ARM Pointer Authentication que pueden detectar violaciones de punteros a nivel de hardware con sobrecarga mínima de rendimiento."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <vector>
#include <cstdlib>
#include <cstring>

#ifdef __x86_64__
#include <immintrin.h>  // For Intel MPX intrinsics
#endif

#ifdef __aarch64__
// ARM Pointer Authentication support
#include <sys/auxv.h>
#endif

class HardwareAssistedDebugging {
public:
    
#ifdef __x86_64__
    // Intel Memory Protection Extensions (MPX) Support
    class IntelMPXDebugger {
    private:
        static constexpr size_t MPX_ALIGN = 64;  // Cache line alignment
        
    public:
        // Check if MPX is available
        static bool is_mpx_available() {
            unsigned int eax, ebx, ecx, edx;
            
            // Check CPUID for MPX support
            __asm__ volatile("cpuid"
                : "=a" (eax), "=b" (ebx), "=c" (ecx), "=d" (edx)
                : "0" (7), "2" (0));
            
            return (ebx & (1 << 14)) != 0;  // MPX bit in EBX
        }
        
        // Enable MPX bounds checking
        static void enable_mpx() {
            if (!is_mpx_available()) {
                std::cout << "MPX not available on this processor" << std::endl;
                return;
            }
            
            // Enable MPX through XSAVE
            unsigned long long xcr0;
            __asm__ volatile("xgetbv" : "=a" (xcr0) : "c" (0) : "edx");
            
            // Set MPX bits (bit 3 and 4)
            xcr0 |= (1ULL << 3) | (1ULL << 4);
            
            __asm__ volatile("xsetbv" : : "a" (xcr0), "c" (0), "d" (0));
            
            std::cout << "MPX bounds checking enabled" << std::endl;
        }
        
        // Create bounds-checked pointer
        template<typename T>
        static T* create_bounded_ptr(T* ptr, size_t size) {
            if (!is_mpx_available()) {
                return ptr;
            }
            
            // Set bounds using MPX intrinsics
            void* lower_bound = ptr;
            void* upper_bound = static_cast<char*>(ptr) + size - 1;
            
            // Intel MPX bndmk instruction (make bounds)
            __asm__ volatile("bndmk %0, %1"
                :
                : "m" (lower_bound), "r" (upper_bound)
                : "memory");
            
            return ptr;
        }
        
        // Check bounds before access
        template<typename T>
        static bool check_bounds(T* ptr) {
            if (!is_mpx_available()) {
                return true;  // No bounds checking available
            }
            
            // Intel MPX bndcl and bndcu instructions
            bool bounds_ok = true;
            
            __asm__ volatile(
                "bndcl %1, %%bnd0\\n\\t"
                "bndcu %1, %%bnd0\\n\\t"
                "jbe 1f\\n\\t"
                "movb $0, %0\\n"
                "1:"
                : "+r" (bounds_ok)
                : "r" (ptr)
                : "memory");
            
            return bounds_ok;
        }
        
        // Demonstrate MPX usage
        static void demonstrate_mpx() {
            std::cout << "\\n=== Intel MPX Demonstration ===" << std::endl;
            
            if (!is_mpx_available()) {
                std::cout << "MPX not supported on this system" << std::endl;
                return;
            }
            
            enable_mpx();
            
            const size_t buffer_size = 1024;
            char* buffer = static_cast<char*>(aligned_alloc(MPX_ALIGN, buffer_size));
            
            if (!buffer) {
                std::cerr << "Failed to allocate aligned buffer" << std::endl;
                return;
            }
            
            // Create bounded pointer
            char* bounded_ptr = create_bounded_ptr(buffer, buffer_size);
            
            std::cout << "Buffer: " << static_cast<void*>(buffer) << std::endl;
            std::cout << "Size: " << buffer_size << " bytes" << std::endl;
            
            // Safe access
            for (size_t i = 0; i < buffer_size; i += 64) {
                if (check_bounds(&bounded_ptr[i])) {
                    bounded_ptr[i] = static_cast<char>('A' + (i % 26));
                } else {
                    std::cout << "Bounds violation detected at offset " << i << std::endl;
                    break;
                }
            }
            
            // This would trigger hardware bounds exception:
            // bounded_ptr[buffer_size] = 'X';  // Out of bounds access
            
            std::cout << "MPX bounds checking demonstrated" << std::endl;
            free(buffer);
        }
        
        // MPX exception handler setup
        static void setup_mpx_exception_handler() {
            // In a real implementation, you would set up a signal handler
            // for SIGSEGV to catch MPX bounds violations
            
            std::cout << "MPX exception handling:" << std::endl;
            std::cout << "  - Bounds violations generate #BR exception" << std::endl;
            std::cout << "  - OS converts to SIGSEGV signal" << std::endl;
            std::cout << "  - Handler can inspect bounds registers" << std::endl;
            std::cout << "  - Provides exact violation location" << std::endl;
        }
    };
#endif

#ifdef __aarch64__
    // ARM Pointer Authentication Support
    class ARMPointerAuthDebugger {
    private:
        static constexpr uint64_t PAC_MASK = 0xFF00000000000000ULL;
        
    public:
        // Check if Pointer Authentication is available
        static bool is_pointer_auth_available() {
            unsigned long hwcaps = getauxval(AT_HWCAP);
            return (hwcaps & HWCAP_PACA) != 0;  // Pointer Authentication available
        }
        
        // Sign a pointer with return address key
        static void* sign_pointer(void* ptr) {
            if (!is_pointer_auth_available()) {
                return ptr;
            }
            
            void* signed_ptr;
            
            // Use PACIA instruction to sign pointer
            __asm__ volatile(
                "pacia %0, sp"
                : "=r" (signed_ptr)
                : "0" (ptr)
                : "memory");
            
            return signed_ptr;
        }
        
        // Authenticate a signed pointer
        static void* authenticate_pointer(void* signed_ptr) {
            if (!is_pointer_auth_available()) {
                return signed_ptr;
            }
            
            void* auth_ptr;
            
            // Use AUTIA instruction to authenticate pointer
            __asm__ volatile(
                "autia %0, sp"
                : "=r" (auth_ptr)
                : "0" (signed_ptr)
                : "memory");
            
            return auth_ptr;
        }
        
        // Strip authentication code from pointer
        static void* strip_pac(void* signed_ptr) {
            if (!is_pointer_auth_available()) {
                return signed_ptr;
            }
            
            void* stripped_ptr;
            
            __asm__ volatile(
                "xpaci %0"
                : "=r" (stripped_ptr)
                : "0" (signed_ptr));
            
            return stripped_ptr;
        }
        
        // Check if pointer has authentication code
        static bool has_pac(void* ptr) {
            uint64_t addr = reinterpret_cast<uint64_t>(ptr);
            return (addr & PAC_MASK) != 0;
        }
        
        // Demonstrate Pointer Authentication
        static void demonstrate_pointer_auth() {
            std::cout << "\\n=== ARM Pointer Authentication Demonstration ===" << std::endl;
            
            if (!is_pointer_auth_available()) {
                std::cout << "Pointer Authentication not supported" << std::endl;
                return;
            }
            
            // Create test data
            int test_value = 42;
            int* original_ptr = &test_value;
            
            std::cout << "Original pointer: " << original_ptr << std::endl;
            
            // Sign the pointer
            void* signed_ptr = sign_pointer(original_ptr);
            std::cout << "Signed pointer: " << signed_ptr << std::endl;
            std::cout << "Has PAC: " << has_pac(signed_ptr) << std::endl;
            
            // Authenticate and use
            int* auth_ptr = static_cast<int*>(authenticate_pointer(signed_ptr));
            std::cout << "Authenticated pointer: " << auth_ptr << std::endl;
            std::cout << "Value through auth pointer: " << *auth_ptr << std::endl;
            
            // Strip PAC for address comparison
            void* stripped_ptr = strip_pac(signed_ptr);
            std::cout << "Stripped pointer: " << stripped_ptr << std::endl;
            
            if (stripped_ptr == original_ptr) {
                std::cout << "PAC stripping successful - pointers match" << std::endl;
            }
            
            // Demonstrate tampering detection
            demonstrate_tampering_detection();
        }
        
        private:
        static void demonstrate_tampering_detection() {
            std::cout << "\\n--- Tampering Detection ---" << std::endl;
            
            int test_data = 100;
            void* original = &test_data;
            void* signed_ptr = sign_pointer(original);
            
            // Simulate pointer tampering by modifying authentication bits
            uint64_t tampered_addr = reinterpret_cast<uint64_t>(signed_ptr);
            tampered_addr ^= 0x0100000000000000ULL;  // Flip some auth bits
            void* tampered_ptr = reinterpret_cast<void*>(tampered_addr);
            
            std::cout << "Original signed: " << signed_ptr << std::endl;
            std::cout << "Tampered: " << tampered_ptr << std::endl;
            
            // Attempting to authenticate tampered pointer would cause exception
            // In practice, this would generate SIGSEGV
            std::cout << "Authentication of tampered pointer would fail!" << std::endl;
            std::cout << "Hardware would generate authentication failure exception" << std::endl;
        }
    };
#endif

    // Hardware debugging features detection and configuration
    static void detect_hardware_features() {
        std::cout << "\\n=== Hardware Debugging Features Detection ===" << std::endl;
        
#ifdef __x86_64__
        std::cout << "Intel x86_64 Features:" << std::endl;
        
        // Check for various Intel debugging features
        unsigned int eax, ebx, ecx, edx;
        
        // Basic feature detection
        __asm__ volatile("cpuid" : "=a"(eax), "=b"(ebx), "=c"(ecx), "=d"(edx) : "0"(1));
        
        std::cout << "  Debug Store (DS): " << ((edx & (1 << 21)) ? "Yes" : "No") << std::endl;
        std::cout << "  Performance Monitoring (PDCM): " << ((ecx & (1 << 15)) ? "Yes" : "No") << std::endl;
        
        // Extended features
        __asm__ volatile("cpuid" : "=a"(eax), "=b"(ebx), "=c"(ecx), "=d"(edx) : "0"(7), "2"(0));
        
        std::cout << "  MPX (Memory Protection): " << ((ebx & (1 << 14)) ? "Yes" : "No") << std::endl;
        std::cout << "  CET (Control Flow Enforcement): " << ((ecx & (1 << 7)) ? "Yes" : "No") << std::endl;
        std::cout << "  Intel PT (Processor Trace): " << ((ebx & (1 << 25)) ? "Yes" : "No") << std::endl;
        
        if (IntelMPXDebugger::is_mpx_available()) {
            IntelMPXDebugger::demonstrate_mpx();
        }
#endif

#ifdef __aarch64__
        std::cout << "ARM AArch64 Features:" << std::endl;
        
        unsigned long hwcaps = getauxval(AT_HWCAP);
        unsigned long hwcaps2 = getauxval(AT_HWCAP2);
        
        std::cout << "  Pointer Authentication (PACA): " << ((hwcaps & HWCAP_PACA) ? "Yes" : "No") << std::endl;
        std::cout << "  Pointer Authentication (PACG): " << ((hwcaps & HWCAP_PACG) ? "Yes" : "No") << std::endl;
        
        if (ARMPointerAuthDebugger::is_pointer_auth_available()) {
            ARMPointerAuthDebugger::demonstrate_pointer_auth();
        }
#endif

        std::cout << "\\nOther Hardware Features:" << std::endl;
        std::cout << "  Hardware Breakpoints: Platform dependent" << std::endl;
        std::cout << "  Watchpoints: Platform dependent" << std::endl;
        std::cout << "  Branch Tracing: Intel PT, ARM CoreSight" << std::endl;
        std::cout << "  Memory Tagging: ARM MTE, Intel LAM" << std::endl;
    }
    
    // Configure hardware debugging for optimal pointer debugging
    static void configure_hardware_debugging() {
        std::cout << "\\n=== Hardware Debugging Configuration ===" << std::endl;
        
        std::cout << "Recommended hardware debugging setup:" << std::endl;
        std::cout << "\\n1. Intel Systems:" << std::endl;
        std::cout << "   - Enable MPX in BIOS if available" << std::endl;
        std::cout << "   - Use Intel Inspector for advanced analysis" << std::endl;
        std::cout << "   - Enable Intel PT for control flow tracing" << std::endl;
        std::cout << "   - Configure Last Branch Record (LBR)" << std::endl;
        
        std::cout << "\\n2. ARM Systems:" << std::endl;
        std::cout << "   - Enable Pointer Authentication in kernel" << std::endl;
        std::cout << "   - Use ARM Development Studio debugger" << std::endl;
        std::cout << "   - Configure CoreSight tracing components" << std::endl;
        std::cout << "   - Enable Memory Tagging Extension (MTE) if available" << std::endl;
        
        std::cout << "\\n3. General Hardware Features:" << std::endl;
        std::cout << "   - Set hardware breakpoints on critical functions" << std::endl;
        std::cout << "   - Use watchpoints for pointer modification tracking" << std::endl;
        std::cout << "   - Enable performance counters for memory events" << std::endl;
        std::cout << "   - Configure trap handlers for debugging exceptions" << std::endl;
        
        std::cout << "\\n4. Kernel Configuration:" << std::endl;
        std::cout << "   - Enable KASAN for kernel address sanitization" << std::endl;
        std::cout << "   - Configure page table isolation (PTI)" << std::endl;
        std::cout << "   - Enable control flow integrity (CFI)" << std::endl;
        std::cout << "   - Set up kernel guard pages" << std::endl;
    }
};

// Hardware-assisted memory debugging wrapper
template<typename T>
class HardwareTrackedPtr {
private:
    T* ptr_;
    size_t size_;
    bool hardware_protected_;
    
public:
    HardwareTrackedPtr(T* ptr, size_t size) : ptr_(ptr), size_(size) {
        hardware_protected_ = false;
        
#ifdef __x86_64__
        if (HardwareAssistedDebugging::IntelMPXDebugger::is_mpx_available()) {
            ptr_ = HardwareAssistedDebugging::IntelMPXDebugger::create_bounded_ptr(ptr, size * sizeof(T));
            hardware_protected_ = true;
        }
#endif
        
#ifdef __aarch64__
        if (HardwareAssistedDebugging::ARMPointerAuthDebugger::is_pointer_auth_available()) {
            ptr_ = static_cast<T*>(HardwareAssistedDebugging::ARMPointerAuthDebugger::sign_pointer(ptr));
            hardware_protected_ = true;
        }
#endif
    }
    
    T& operator*() {
        validate_access();
        return *get_raw_pointer();
    }
    
    T* operator->() {
        validate_access();
        return get_raw_pointer();
    }
    
    T& operator[](size_t index) {
        if (index >= size_) {
            throw std::out_of_range("HardwareTrackedPtr: Index out of bounds");
        }
        validate_access();
        return get_raw_pointer()[index];
    }
    
    T* get() {
        validate_access();
        return get_raw_pointer();
    }
    
    bool is_hardware_protected() const {
        return hardware_protected_;
    }
    
private:
    void validate_access() {
#ifdef __x86_64__
        if (hardware_protected_ && 
            !HardwareAssistedDebugging::IntelMPXDebugger::check_bounds(ptr_)) {
            throw std::runtime_error("Hardware bounds check failed");
        }
#endif
    }
    
    T* get_raw_pointer() {
#ifdef __aarch64__
        if (hardware_protected_) {
            return static_cast<T*>(
                HardwareAssistedDebugging::ARMPointerAuthDebugger::authenticate_pointer(ptr_)
            );
        }
#endif
        return ptr_;
    }
};`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Production Debugging Infrastructure" : "Infraestructura de Depuración en Producción"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "Production environments require specialized debugging infrastructure that provides observability into pointer-related issues while maintaining system performance and reliability." :
            "Los entornos de producción requieren infraestructura de depuración especializada que proporcione observabilidad de problemas relacionados con punteros mientras mantiene el rendimiento y confiabilidad del sistema."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <atomic>
#include <thread>
#include <chrono>
#include <fstream>
#include <sstream>
#include <vector>
#include <unordered_map>
#include <mutex>
#include <condition_variable>
#include <random>
#include <signal.h>

// Production-grade debugging infrastructure for pointer issues
class ProductionDebugInfrastructure {
public:
    
    // Lightweight sampling-based pointer tracking
    class SamplingPointerTracker {
    private:
        struct AllocationInfo {
            size_t size;
            std::chrono::steady_clock::time_point timestamp;
            std::thread::id thread_id;
            std::string stack_trace;
            bool is_freed;
            
            AllocationInfo(size_t s, std::string trace) 
                : size(s), timestamp(std::chrono::steady_clock::now()),
                  thread_id(std::this_thread::get_id()), 
                  stack_trace(std::move(trace)), is_freed(false) {}
        };
        
        static constexpr double DEFAULT_SAMPLE_RATE = 0.001; // 0.1% sampling
        
        std::atomic<double> sample_rate_{DEFAULT_SAMPLE_RATE};
        std::unordered_map<void*, AllocationInfo> tracked_allocations_;
        std::mutex tracking_mutex_;
        std::atomic<uint64_t> total_allocations_{0};
        std::atomic<uint64_t> sampled_allocations_{0};
        std::atomic<uint64_t> detected_leaks_{0};
        
        std::random_device rd_;
        std::mt19937 gen_{rd_()};
        std::uniform_real_distribution<double> dist_{0.0, 1.0};
        
    public:
        static SamplingPointerTracker& instance() {
            static SamplingPointerTracker tracker;
            return tracker;
        }
        
        void set_sample_rate(double rate) {
            sample_rate_.store(rate);
            std::cout << "Pointer tracking sample rate set to: " << (rate * 100) << "%" << std::endl;
        }
        
        bool should_sample() {
            total_allocations_++;
            return dist_(gen_) < sample_rate_.load();
        }
        
        void track_allocation(void* ptr, size_t size) {
            if (!should_sample() || !ptr) return;
            
            sampled_allocations_++;
            
            // Get simplified stack trace (in production, use libunwind or similar)
            std::string stack_trace = get_stack_trace();
            
            std::lock_guard<std::mutex> lock(tracking_mutex_);
            tracked_allocations_.emplace(ptr, AllocationInfo(size, std::move(stack_trace)));
        }
        
        void track_deallocation(void* ptr) {
            if (!ptr) return;
            
            std::lock_guard<std::mutex> lock(tracking_mutex_);
            auto it = tracked_allocations_.find(ptr);
            if (it != tracked_allocations_.end()) {
                it->second.is_freed = true;
                
                // Clean up old freed entries periodically
                if (sampled_allocations_ % 1000 == 0) {
                    cleanup_freed_entries();
                }
            }
        }
        
        void detect_leaks() {
            std::lock_guard<std::mutex> lock(tracking_mutex_);
            
            uint64_t active_leaks = 0;
            size_t leaked_bytes = 0;
            
            auto now = std::chrono::steady_clock::now();
            
            std::cout << "\\n=== Leak Detection Report ===" << std::endl;
            
            for (const auto& [ptr, info] : tracked_allocations_) {
                if (!info.is_freed) {
                    auto age = std::chrono::duration_cast<std::chrono::seconds>(
                        now - info.timestamp).count();
                    
                    if (age > 300) {  // Consider leaks after 5 minutes
                        active_leaks++;
                        leaked_bytes += info.size;
                        
                        std::cout << "Potential leak: " << ptr 
                                  << " (" << info.size << " bytes, " 
                                  << age << "s old)" << std::endl;
                        std::cout << "  Stack: " << info.stack_trace << std::endl;
                    }
                }
            }
            
            detected_leaks_.store(active_leaks);
            
            std::cout << "Total allocations: " << total_allocations_.load() << std::endl;
            std::cout << "Sampled: " << sampled_allocations_.load() << std::endl;
            std::cout << "Active leaks: " << active_leaks << " (" << leaked_bytes << " bytes)" << std::endl;
        }
        
        void export_metrics(const std::string& filename) {
            std::ofstream file(filename);
            if (!file) return;
            
            auto now = std::chrono::system_clock::now();
            auto time_t = std::chrono::system_clock::to_time_t(now);
            
            file << "# Pointer tracking metrics export\\n";
            file << "# Generated: " << std::ctime(&time_t);
            file << "total_allocations " << total_allocations_.load() << "\\n";
            file << "sampled_allocations " << sampled_allocations_.load() << "\\n";
            file << "detected_leaks " << detected_leaks_.load() << "\\n";
            file << "sample_rate " << sample_rate_.load() << "\\n";
            
            std::lock_guard<std::mutex> lock(tracking_mutex_);
            file << "active_tracked_allocations " << tracked_allocations_.size() << "\\n";
        }
        
    private:
        std::string get_stack_trace() {
            // Simplified stack trace - in production use libunwind or backtrace
            std::ostringstream trace;
            trace << "Thread:" << std::this_thread::get_id();
            return trace.str();
        }
        
        void cleanup_freed_entries() {
            auto it = tracked_allocations_.begin();
            while (it != tracked_allocations_.end()) {
                if (it->second.is_freed) {
                    it = tracked_allocations_.erase(it);
                } else {
                    ++it;
                }
            }
        }
    };
    
    // Crash dump analysis for pointer corruption
    class CrashDumpAnalyzer {
    private:
        struct CrashInfo {
            void* fault_address;
            int signal;
            std::string context;
            std::chrono::system_clock::time_point timestamp;
        };
        
        static std::vector<CrashInfo> crash_history_;
        static std::mutex crash_mutex_;
        
    public:
        static void install_crash_handler() {
            signal(SIGSEGV, crash_handler);
            signal(SIGBUS, crash_handler);
            signal(SIGFPE, crash_handler);
            
            std::cout << "Crash analysis handlers installed" << std::endl;
        }
        
        static void crash_handler(int sig) {
            // In production, this would generate a more comprehensive crash dump
            std::cout << "\\n=== CRASH DETECTED ===" << std::endl;
            std::cout << "Signal: " << sig << std::endl;
            std::cout << "Thread: " << std::this_thread::get_id() << std::endl;
            
            // Analyze potential pointer corruption patterns
            analyze_crash_context(sig);
            
            // Generate core dump information
            generate_crash_report();
            
            // Re-raise signal for default handling
            signal(sig, SIG_DFL);
            raise(sig);
        }
        
    private:
        static void analyze_crash_context(int signal) {
            std::cout << "\\nCrash analysis:" << std::endl;
            
            switch (signal) {
                case SIGSEGV:
                    std::cout << "  SIGSEGV - Likely causes:" << std::endl;
                    std::cout << "    * NULL pointer dereference" << std::endl;
                    std::cout << "    * Use-after-free" << std::endl;
                    std::cout << "    * Buffer overflow" << std::endl;
                    std::cout << "    * Stack corruption" << std::endl;
                    break;
                    
                case SIGBUS:
                    std::cout << "  SIGBUS - Likely causes:" << std::endl;
                    std::cout << "    * Unaligned memory access" << std::endl;
                    std::cout << "    * Memory mapping issues" << std::endl;
                    std::cout << "    * Hardware memory errors" << std::endl;
                    break;
                    
                case SIGFPE:
                    std::cout << "  SIGFPE - Arithmetic exception" << std::endl;
                    std::cout << "    * Division by zero" << std::endl;
                    std::cout << "    * Integer overflow" << std::endl;
                    break;
            }
        }
        
        static void generate_crash_report() {
            auto now = std::chrono::system_clock::now();
            auto time_t = std::chrono::system_clock::to_time_t(now);
            
            std::string filename = "crash_report_" + std::to_string(time_t) + ".txt";
            std::ofstream report(filename);
            
            if (report) {
                report << "=== Production Crash Report ===" << std::endl;
                report << "Timestamp: " << std::ctime(&time_t);
                report << "Thread ID: " << std::this_thread::get_id() << std::endl;
                
                // Include pointer tracking statistics
                auto& tracker = SamplingPointerTracker::instance();
                report << "\\nPointer Tracking Statistics:" << std::endl;
                tracker.export_metrics(filename + ".metrics");
                
                // Memory usage information
                report << "\\nMemory Information:" << std::endl;
                report << "  Process would include memory maps here" << std::endl;
                report << "  Heap statistics" << std::endl;
                report << "  Stack information" << std::endl;
                
                std::cout << "Crash report written to: " << filename << std::endl;
            }
        }
    };
    
    // Real-time performance monitoring
    class PerformanceMonitor {
    private:
        std::atomic<uint64_t> allocation_count_{0};
        std::atomic<uint64_t> deallocation_count_{0};
        std::atomic<uint64_t> total_allocated_bytes_{0};
        std::atomic<uint64_t> current_allocated_bytes_{0};
        std::atomic<uint64_t> peak_allocated_bytes_{0};
        
        std::thread monitor_thread_;
        std::atomic<bool> running_{false};
        std::condition_variable cv_;
        std::mutex cv_mutex_;
        
    public:
        static PerformanceMonitor& instance() {
            static PerformanceMonitor monitor;
            return monitor;
        }
        
        void start_monitoring(std::chrono::seconds interval = std::chrono::seconds(30)) {
            if (running_.load()) return;
            
            running_.store(true);
            monitor_thread_ = std::thread([this, interval]() {
                while (running_.load()) {
                    report_metrics();
                    
                    std::unique_lock<std::mutex> lock(cv_mutex_);
                    cv_.wait_for(lock, interval, [this]() { return !running_.load(); });
                }
            });
            
            std::cout << "Performance monitoring started (interval: " 
                      << interval.count() << "s)" << std::endl;
        }
        
        void stop_monitoring() {
            running_.store(false);
            cv_.notify_all();
            
            if (monitor_thread_.joinable()) {
                monitor_thread_.join();
            }
            
            std::cout << "Performance monitoring stopped" << std::endl;
        }
        
        void record_allocation(size_t size) {
            allocation_count_++;
            total_allocated_bytes_ += size;
            
            uint64_t current = current_allocated_bytes_ += size;
            uint64_t peak = peak_allocated_bytes_.load();
            
            while (current > peak && 
                   !peak_allocated_bytes_.compare_exchange_weak(peak, current)) {
                // Update peak if current is higher
            }
        }
        
        void record_deallocation(size_t size) {
            deallocation_count_++;
            current_allocated_bytes_ -= size;
        }
        
    private:
        void report_metrics() {
            auto allocations = allocation_count_.load();
            auto deallocations = deallocation_count_.load();
            auto total_bytes = total_allocated_bytes_.load();
            auto current_bytes = current_allocated_bytes_.load();
            auto peak_bytes = peak_allocated_bytes_.load();
            
            std::cout << "\\n=== Memory Performance Metrics ===" << std::endl;
            std::cout << "Allocations: " << allocations << std::endl;
            std::cout << "Deallocations: " << deallocations << std::endl;
            std::cout << "Active allocations: " << (allocations - deallocations) << std::endl;
            std::cout << "Total allocated: " << (total_bytes / 1024 / 1024) << " MB" << std::endl;
            std::cout << "Current usage: " << (current_bytes / 1024 / 1024) << " MB" << std::endl;
            std::cout << "Peak usage: " << (peak_bytes / 1024 / 1024) << " MB" << std::endl;
            
            // Check for potential issues
            if (current_bytes > peak_bytes * 0.9) {
                std::cout << "WARNING: Near peak memory usage!" << std::endl;
            }
            
            if (allocations > deallocations * 2) {
                std::cout << "WARNING: High allocation/deallocation ratio!" << std::endl;
            }
        }
    };
    
    // Production debugging configuration
    static void configure_production_debugging() {
        std::cout << "\\n=== Production Debugging Configuration ===" << std::endl;
        
        // Install crash handlers
        CrashDumpAnalyzer::install_crash_handler();
        
        // Configure sampling tracker
        auto& tracker = SamplingPointerTracker::instance();
        tracker.set_sample_rate(0.001); // 0.1% sampling for production
        
        // Start performance monitoring
        auto& monitor = PerformanceMonitor::instance();
        monitor.start_monitoring(std::chrono::seconds(60));
        
        std::cout << "Production debugging infrastructure configured:" << std::endl;
        std::cout << "  ✓ Crash dump analysis enabled" << std::endl;
        std::cout << "  ✓ Sampling pointer tracker (0.1%)" << std::endl;
        std::cout << "  ✓ Performance monitoring (60s intervals)" << std::endl;
        std::cout << "  ✓ Minimal overhead mode active" << std::endl;
    }
    
    // Demonstrate production debugging
    static void demonstrate_production_debugging() {
        std::cout << "\\n=== Production Debugging Demonstration ===" << std::endl;
        
        configure_production_debugging();
        
        // Simulate production workload
        auto& tracker = SamplingPointerTracker::instance();
        auto& monitor = PerformanceMonitor::instance();
        
        std::cout << "\\nSimulating production workload..." << std::endl;
        
        for (int i = 0; i < 10000; ++i) {
            size_t size = 32 + (i % 1024);
            void* ptr = malloc(size);
            
            tracker.track_allocation(ptr, size);
            monitor.record_allocation(size);
            
            // Simulate some work
            if (i % 1000 == 0) {
                std::this_thread::sleep_for(std::chrono::milliseconds(10));
            }
            
            // Free most allocations (simulate some leaks)
            if (i % 10 != 0) {  // 10% leak rate for demonstration
                tracker.track_deallocation(ptr);
                monitor.record_deallocation(size);
                free(ptr);
            }
        }
        
        std::cout << "Workload completed. Analyzing results..." << std::endl;
        
        // Generate reports
        tracker.detect_leaks();
        tracker.export_metrics("production_metrics.txt");
        
        // Cleanup
        std::this_thread::sleep_for(std::chrono::seconds(2));
        monitor.stop_monitoring();
    }
};

// Static member definitions
std::vector<ProductionDebugInfrastructure::CrashDumpAnalyzer::CrashInfo> 
    ProductionDebugInfrastructure::CrashDumpAnalyzer::crash_history_;
std::mutex ProductionDebugInfrastructure::CrashDumpAnalyzer::crash_mutex_;`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Key Takeaways" : "Puntos Clave"}
        </SectionTitle>
        
        <ul>
          <li>
            {state.language === 'en' ? 
              "AddressSanitizer provides comprehensive memory error detection with ~2.5x performance overhead through shadow memory mapping" :
              "AddressSanitizer proporciona detección integral de errores de memoria con ~2.5x sobrecarga de rendimiento a través del mapeo de memoria sombra"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "MemorySanitizer tracks initialization state of every bit, detecting use of uninitialized values with ~3x overhead" :
              "MemorySanitizer rastrea el estado de inicialización de cada bit, detectando el uso de valores no inicializados con ~3x sobrecarga"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "ThreadSanitizer detects race conditions and data races with moderate performance impact (~1.8x)" :
              "ThreadSanitizer detecta condiciones de carrera y carreras de datos con impacto moderado en el rendimiento (~1.8x)"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Advanced GDB scripting enables custom debugging workflows and automated analysis of pointer relationships" :
              "El scripting avanzado de GDB permite flujos de trabajo de depuración personalizados y análisis automatizado de relaciones de punteros"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Hardware-assisted debugging (Intel MPX, ARM Pointer Authentication) provides low-overhead protection with hardware enforcement" :
              "La depuración asistida por hardware (Intel MPX, ARM Pointer Authentication) proporciona protección de baja sobrecarga con aplicación de hardware"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Production debugging requires sampling-based approaches and crash dump analysis to maintain system performance" :
              "La depuración en producción requiere enfoques basados en muestreo y análisis de volcados de memoria para mantener el rendimiento del sistema"
            }
          </li>
        </ul>
      </Section>
    </LessonLayout>
  );
};

export default Lesson106_AdvancedDebuggingTechniques;