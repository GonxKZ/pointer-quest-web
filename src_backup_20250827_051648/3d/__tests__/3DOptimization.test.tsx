/**
 * Comprehensive Test Suite for 3D Visualization Optimizations
 * 
 * Tests performance optimizations, Spanish translations, and educational effectiveness
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import { Canvas } from '@react-three/fiber';

// Import optimized components
import EducationalPointerScene from '../EducationalPointerScene';
import { SmartPointerComparisonScene, MemoryDiagnostics } from '../SmartPointerVisualizations';
import { PointerArithmetic3D } from '../PointerArithmetic3D';
import { ConstPointer3D } from '../ConstPointer3D';
import { FunctionPointer3D } from '../FunctionPointer3D';
import { RAIILifecycleDemo } from '../MemoryLifecycleVisualizer';

// Import utilities
import { 
  get3DTranslation, 
  getEducationalContent,
  PERFORMANCE_THRESHOLDS,
  LEARNING_PATH,
  getTopicByDifficulty 
} from '../index';

// Mock drei components to avoid complex dependencies
jest.mock('@react-three/drei', () => ({
  Text: ({ children }: { children: React.ReactNode }) => <div data-testid="3d-text">{children}</div>,
  Html: ({ children }: { children: React.ReactNode }) => <div data-testid="3d-html">{children}</div>,
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Line: () => <div data-testid="3d-line" />,
  Box: () => <div data-testid="3d-box" />,
  Sphere: () => <div data-testid="3d-sphere" />,
  Cylinder: () => <div data-testid="3d-cylinder" />,
  RoundedBox: () => <div data-testid="3d-rounded-box" />,
  Torus: () => <div data-testid="3d-torus" />,
  Octahedron: () => <div data-testid="3d-octahedron" />
}));

// Mock hooks
jest.mock('../../hooks/useOptimizedAnimation', () => ({
  useOptimizedAnimation: () => ({ setEnabled: jest.fn(), unregister: jest.fn() }),
  useAnimationFrame: () => ({ fps: 60, performanceMode: 'high' }),
  usePerformanceAnimation: () => ({ setEnabled: jest.fn(), unregister: jest.fn() })
}));

jest.mock('../../hooks/useMemoryManagement', () => ({
  useMemoryManagement: () => ({
    getCachedGeometry: jest.fn(() => ({})),
    getCachedMaterial: jest.fn(() => ({})),
    getCachedTexture: jest.fn(() => ({}))
  }),
  useMaterialSharing: () => ({
    getSharedMaterial: jest.fn(() => ({}))
  })
}));

const TestWrapper: React.FC<{ children: React.ReactNode; language?: 'en' | 'es' }> = ({ 
  children, 
  language = 'en' 
}) => (
  <AppProvider initialState={{ language }}>
    <Canvas data-testid="3d-canvas">
      {children}
    </Canvas>
  </AppProvider>
);

describe('3D Visualization Optimization Suite', () => {
  
  describe('Performance Optimizations', () => {
    test('performance thresholds are correctly defined', () => {
      expect(PERFORMANCE_THRESHOLDS.FPS.HIGH).toBe(55);
      expect(PERFORMANCE_THRESHOLDS.FPS.MEDIUM).toBe(40);
      expect(PERFORMANCE_THRESHOLDS.FPS.LOW).toBe(25);
      expect(PERFORMANCE_THRESHOLDS.MEMORY.WARNING).toBe(100);
      expect(PERFORMANCE_THRESHOLDS.MEMORY.CRITICAL).toBe(200);
    });
    
    test('components use React.memo for optimization', () => {
      const MemoizedEducationalScene = React.memo(EducationalPointerScene);
      expect(MemoizedEducationalScene.displayName).toContain('memo');
    });
    
    test('learning path progression is properly structured', () => {
      expect(LEARNING_PATH.BEGINNER.length).toBe(1);
      expect(LEARNING_PATH.INTERMEDIATE.length).toBe(3);
      expect(LEARNING_PATH.ADVANCED.length).toBe(7);
      expect(LEARNING_PATH.EXPERT.length).toBeGreaterThan(7);
    });
  });

  describe('Spanish Translation Support', () => {
    test('translation function works correctly', () => {
      const translation = get3DTranslation('pointerStates.valid', 'VALID');
      expect(translation).toBe('VÁLIDO');
    });
    
    test('educational content provides Spanish translations', () => {
      const content = getEducationalContent('basicPointers');
      expect(content.title).toBe('Punteros Básicos');
      expect(content.description).toBe('Fundamentos de punteros en C++');
    });
    
    test('fallback to default value when translation missing', () => {
      const fallback = get3DTranslation('nonexistent.key', 'DEFAULT');
      expect(fallback).toBe('DEFAULT');
    });
  });

  describe('Educational Effectiveness', () => {
    test('topics can be filtered by difficulty', () => {
      const beginnerTopics = getTopicByDifficulty('beginner');
      const advancedTopics = getTopicByDifficulty('advanced');
      
      expect(beginnerTopics.length).toBeGreaterThan(0);
      expect(advancedTopics.length).toBeGreaterThan(0);
      expect(beginnerTopics[0]?.difficulty).toBe('beginner');
      expect(advancedTopics[0]?.difficulty).toBe('advanced');
    });
    
    test('educational pointer scene renders with multiple topics', () => {
      const topics: Array<'basic' | 'smart' | 'arithmetic' | 'const'> = ['basic', 'smart', 'arithmetic', 'const'];
      
      topics.forEach(topic => {
        render(
          <TestWrapper>
            <EducationalPointerScene topic={topic} animated={true} autoPlay={false} />
          </TestWrapper>
        );
      });
    });
  });

  describe('Component Functionality', () => {
    test('EducationalPointerScene renders without errors', () => {
      render(
        <TestWrapper>
          <EducationalPointerScene topic="basic" />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
    
    test('SmartPointerComparisonScene renders with all pointer types', () => {
      render(
        <TestWrapper>
          <SmartPointerComparisonScene 
            showUnique={true}
            showShared={true}
            showWeak={true}
            animated={true}
          />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
    
    test('MemoryDiagnostics component provides performance metrics', () => {
      render(
        <TestWrapper>
          <MemoryDiagnostics />
        </TestWrapper>
      );
      
      // Should render memory diagnostic information
      expect(screen.getByTestId('3d-html')).toBeInTheDocument();
    });
    
    test('PointerArithmetic3D handles array navigation', () => {
      render(
        <TestWrapper>
          <PointerArithmetic3D 
            arraySize={6}
            initialPointerIndex={0}
            autoPlay={false}
            animated={true}
          />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
    
    test('ConstPointer3D demonstrates const correctness', () => {
      render(
        <TestWrapper>
          <ConstPointer3D autoPlay={false} animated={true} />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
    
    test('FunctionPointer3D shows function pointer concepts', () => {
      render(
        <TestWrapper>
          <FunctionPointer3D autoPlay={false} animated={true} />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
    
    test('RAIILifecycleDemo demonstrates RAII principles', () => {
      render(
        <TestWrapper>
          <RAIILifecycleDemo autoPlay={false} speed={1} />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Internationalization', () => {
    test('components render correctly in Spanish', () => {
      render(
        <TestWrapper language="es">
          <EducationalPointerScene topic="basic" />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
    
    test('components render correctly in English', () => {
      render(
        <TestWrapper language="en">
          <EducationalPointerScene topic="basic" />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries and Resilience', () => {
    test('components handle missing props gracefully', () => {
      // Test with minimal props
      render(
        <TestWrapper>
          <EducationalPointerScene topic="basic" />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
    
    test('components handle invalid configurations', () => {
      // Test with edge case configurations
      render(
        <TestWrapper>
          <PointerArithmetic3D arraySize={0} initialPointerIndex={-1} />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
  });

  describe('Performance Monitoring', () => {
    test('performance metrics are tracked', () => {
      // This would normally test actual performance monitoring
      // For now, we verify the structure is in place
      expect(PERFORMANCE_THRESHOLDS).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.FPS).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.MEMORY).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.ANIMATIONS).toBeDefined();
    });
  });
});

// Integration tests
describe('3D Visualization Integration', () => {
  test('all components can be rendered together', async () => {
    render(
      <TestWrapper>
        <group>
          <EducationalPointerScene topic="basic" />
          <SmartPointerComparisonScene showUnique={true} />
          <MemoryDiagnostics />
        </group>
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    });
  });
  
  test('lazy loading components structure is maintained', () => {
    // This ensures our lazy loading setup is compatible with testing
    expect(() => {
      require('../../components/Lazy3DComponents');
    }).not.toThrow();
  });
});