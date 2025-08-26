/**
 * Lesson 86: RAII Scope Guards
 * Advanced RAII patterns with automatic cleanup and exception-safe scope management
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, BufferGeometry, BufferAttribute, MeshBasicMaterial, MeshStandardMaterial, Group } from 'three';
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
  AccessibilityAnnouncer,
  PerformanceComparison,
  UndefinedBehaviorWarning
} from '../design-system';

interface RAIIScopeGuardState {
  language: 'en' | 'es';
  scenario: 'basic_guards' | 'exception_safe' | 'conditional_guards' | 'nested_guards' | 'lambda_guards' | 'multi_resource';
  isAnimating: boolean;
  guardsActive: number;
  resourcesManaged: number;
  cleanupCalls: number;
  exceptionsHandled: number;
  performanceMetrics: {
    scopeEntryTime: number;
    scopeExitTime: number;
    cleanupOverhead: number;
  };
}

// 3D Visualización de RAII Scope Guards
const RAIIScopeGuardVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'basic_guards') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        guardsActive: Math.floor(3 + Math.sin(animationRef.current * 2) * 2),
        resourcesManaged: Math.floor(5 + Math.cos(animationRef.current * 1.5) * 3),
        cleanupCalls: Math.floor(animationRef.current * 2) % 8,
        exceptionsHandled: Math.floor(Math.sin(animationRef.current * 3) > 0.5 ? 1 : 0),
        performanceMetrics: {
          scopeEntryTime: 0.1 + Math.sin(animationRef.current) * 0.05,
          scopeExitTime: 0.2 + Math.cos(animationRef.current) * 0.08,
          cleanupOverhead: 2.5 + Math.sin(animationRef.current * 2) * 1.2
        }
      });
    } else if (scenario === 'exception_safe') {
      groupRef.current.rotation.x = Math.sin(animationRef.current) * 0.2;
      groupRef.current.rotation.z = Math.cos(animationRef.current) * 0.15;
      onMetrics({
        guardsActive: Math.floor(4 + Math.cos(animationRef.current * 2.5) * 3),
        resourcesManaged: Math.floor(8 + Math.sin(animationRef.current * 2) * 5),
        cleanupCalls: Math.floor(animationRef.current * 3) % 12,
        exceptionsHandled: Math.floor(2 + Math.sin(animationRef.current * 4) * 2),
        performanceMetrics: {
          scopeEntryTime: 0.15 + Math.sin(animationRef.current * 2) * 0.07,
          scopeExitTime: 0.25 + Math.cos(animationRef.current * 1.8) * 0.1,
          cleanupOverhead: 3.2 + Math.sin(animationRef.current * 1.5) * 1.8
        }
      });
    } else if (scenario === 'conditional_guards') {
      groupRef.current.rotation.y = Math.cos(animationRef.current) * 0.25;
      onMetrics({
        guardsActive: Math.floor(2 + Math.sin(animationRef.current * 1.8) * 4),
        resourcesManaged: Math.floor(6 + Math.cos(animationRef.current * 2.2) * 4),
        cleanupCalls: Math.floor(animationRef.current * 1.8) % 10,
        exceptionsHandled: Math.floor(Math.cos(animationRef.current * 3.5) > 0 ? 2 : 0),
        performanceMetrics: {
          scopeEntryTime: 0.08 + Math.cos(animationRef.current) * 0.04,
          scopeExitTime: 0.18 + Math.sin(animationRef.current * 2.5) * 0.09,
          cleanupOverhead: 1.8 + Math.cos(animationRef.current * 2) * 1.4
        }
      });
    } else if (scenario === 'nested_guards') {
      groupRef.current.rotation.y = animationRef.current * 0.4;
      groupRef.current.rotation.x = Math.sin(animationRef.current * 0.7) * 0.1;
      onMetrics({
        guardsActive: Math.floor(6 + Math.sin(animationRef.current * 1.5) * 4),
        resourcesManaged: Math.floor(12 + Math.cos(animationRef.current * 2) * 8),
        cleanupCalls: Math.floor(animationRef.current * 4) % 20,
        exceptionsHandled: Math.floor(3 + Math.sin(animationRef.current * 2.8) * 2),
        performanceMetrics: {
          scopeEntryTime: 0.2 + Math.sin(animationRef.current * 1.5) * 0.1,
          scopeExitTime: 0.35 + Math.cos(animationRef.current * 2) * 0.15,
          cleanupOverhead: 4.5 + Math.sin(animationRef.current * 1.2) * 2.2
        }
      });
    } else if (scenario === 'lambda_guards') {
      groupRef.current.rotation.z = Math.sin(animationRef.current * 1.2) * 0.18;
      onMetrics({
        guardsActive: Math.floor(5 + Math.cos(animationRef.current * 3) * 3),
        resourcesManaged: Math.floor(9 + Math.sin(animationRef.current * 2.5) * 6),
        cleanupCalls: Math.floor(animationRef.current * 2.5) % 15,
        exceptionsHandled: Math.floor(1 + Math.sin(animationRef.current * 3.2) > 0.3 ? 2 : 0),
        performanceMetrics: {
          scopeEntryTime: 0.12 + Math.cos(animationRef.current * 2) * 0.06,
          scopeExitTime: 0.22 + Math.sin(animationRef.current * 1.8) * 0.1,
          cleanupOverhead: 2.8 + Math.cos(animationRef.current * 2.5) * 1.6
        }
      });
    } else if (scenario === 'multi_resource') {
      groupRef.current.rotation.y = animationRef.current * 0.5;
      groupRef.current.rotation.x = Math.cos(animationRef.current * 1.3) * 0.12;
      onMetrics({
        guardsActive: Math.floor(8 + Math.sin(animationRef.current * 2) * 5),
        resourcesManaged: Math.floor(16 + Math.cos(animationRef.current * 1.8) * 10),
        cleanupCalls: Math.floor(animationRef.current * 5) % 25,
        exceptionsHandled: Math.floor(4 + Math.sin(animationRef.current * 2.5) * 3),
        performanceMetrics: {
          scopeEntryTime: 0.25 + Math.sin(animationRef.current * 2.2) * 0.12,
          scopeExitTime: 0.45 + Math.cos(animationRef.current * 1.5) * 0.2,
          cleanupOverhead: 6.2 + Math.sin(animationRef.current) * 2.8
        }
      });
    }
  });

  // Crear geometría para representar scope guards
  const createScopeGuardGeometry = () => {
    const geometry = new BufferGeometry();
    const vertices = [];
    const colors = [];

    // Crear estructura jerárquica de scopes
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const x = (i - 3.5) * 0.8;
        const y = (j - 3.5) * 0.8;
        const z = Math.sin(i * 0.5 + j * 0.3) * 0.5;

        vertices.push(x, y, z);

        // Colores basados en el escenario
        if (scenario === 'basic_guards') {
          colors.push(0.2, 0.8, 0.4); // Verde
        } else if (scenario === 'exception_safe') {
          colors.push(0.8, 0.3, 0.2); // Rojo
        } else if (scenario === 'conditional_guards') {
          colors.push(0.3, 0.5, 0.8); // Azul
        } else if (scenario === 'nested_guards') {
          colors.push(0.8, 0.6, 0.2); // Naranja
        } else if (scenario === 'lambda_guards') {
          colors.push(0.6, 0.2, 0.8); // Púrpura
        } else {
          colors.push(0.8, 0.8, 0.2); // Amarillo
        }
      }
    }

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    return geometry;
  };

  return (
    <group ref={groupRef}>
      <mesh geometry={createScopeGuardGeometry()}>
        <meshStandardMaterial vertexColors />
      </mesh>
      
      {/* Visualización de recursos gestionados */}
      <mesh position={[0, 0, 2]}>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshBasicMaterial color={0x4CAF50} transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

const Lesson86_RAIIScopeGuards: React.FC = () => {
  const [state, setState] = useState<RAIIScopeGuardState>({
    language: 'en',
    scenario: 'basic_guards',
    isAnimating: false,
    guardsActive: 0,
    resourcesManaged: 0,
    cleanupCalls: 0,
    exceptionsHandled: 0,
    performanceMetrics: {
      scopeEntryTime: 0,
      scopeExitTime: 0,
      cleanupOverhead: 0
    }
  });

  const handleVisualizationMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  const changeScenario = useCallback((scenario: RAIIScopeGuardState['scenario']) => {
    setState(prev => ({ ...prev, scenario, isAnimating: false }));
  }, []);

  const toggleLanguage = useCallback(() => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'es' : 'en' }));
  }, []);

  return (
    <LessonLayout
      title={state.language === 'en' ? "RAII Scope Guards" : "Guardias de Ámbito RAII"}
      lessonNumber={86}
      description={state.language === 'en' 
        ? "Master automatic cleanup patterns with RAII scope guards and exception-safe resource management"
        : "Domina los patrones de limpieza automática con guardias de ámbito RAII y gestión de recursos segura ante excepciones"
      }
    >
      <AccessibilityAnnouncer 
        message={state.language === 'en' 
          ? `RAII Scope Guards lesson loaded. Current scenario: ${state.scenario}`
          : `Lección de Guardias de Ámbito RAII cargada. Escenario actual: ${state.scenario}`
        }
      />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Learning Objectives' : 'Objetivos de Aprendizaje'}
        </SectionTitle>
        <LearningObjectives
          objectives={state.language === 'en' ? [
            'Understand RAII scope guard patterns and automatic cleanup mechanisms',
            'Master exception-safe scope guard implementations',
            'Learn conditional scope guards and release mechanisms',
            'Implement nested scope guards and RAII hierarchies',
            'Create performance-optimized and lambda-based scope guards',
            'Apply scope guards to real-world resource management scenarios'
          ] : [
            'Comprender patrones de guardias de ámbito RAII y mecanismos de limpieza automática',
            'Dominar implementaciones de guardias de ámbito seguras ante excepciones',
            'Aprender guardias de ámbito condicionales y mecanismos de liberación',
            'Implementar guardias de ámbito anidadas y jerarquías RAII',
            'Crear guardias de ámbito optimizadas para rendimiento y basadas en lambdas',
            'Aplicar guardias de ámbito a escenarios reales de gestión de recursos'
          ]}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive RAII Scope Guards Visualization' : 'Visualización Interactiva de Guardias de Ámbito RAII'}
        </SectionTitle>
        
        <ButtonGroup>
          <Button onClick={toggleLanguage}>
            {state.language === 'en' ? 'Español' : 'English'}
          </Button>
          <Button onClick={toggleAnimation} variant={state.isAnimating ? 'secondary' : 'primary'}>
            {state.isAnimating 
              ? (state.language === 'en' ? 'Pause Animation' : 'Pausar Animación')
              : (state.language === 'en' ? 'Start Animation' : 'Iniciar Animación')
            }
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button 
            onClick={() => changeScenario('basic_guards')} 
            variant={state.scenario === 'basic_guards' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Basic Guards' : 'Guardias Básicas'}
          </Button>
          <Button 
            onClick={() => changeScenario('exception_safe')} 
            variant={state.scenario === 'exception_safe' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Exception-Safe' : 'Seguras ante Excepciones'}
          </Button>
          <Button 
            onClick={() => changeScenario('conditional_guards')} 
            variant={state.scenario === 'conditional_guards' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Conditional Guards' : 'Guardias Condicionales'}
          </Button>
          <Button 
            onClick={() => changeScenario('nested_guards')} 
            variant={state.scenario === 'nested_guards' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Nested Guards' : 'Guardias Anidadas'}
          </Button>
          <Button 
            onClick={() => changeScenario('lambda_guards')} 
            variant={state.scenario === 'lambda_guards' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Lambda Guards' : 'Guardias Lambda'}
          </Button>
          <Button 
            onClick={() => changeScenario('multi_resource')} 
            variant={state.scenario === 'multi_resource' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Multi-Resource' : 'Multi-Recurso'}
          </Button>
        </ButtonGroup>

        <div style={{ height: '400px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '8px', overflow: 'hidden' }}>
          <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            <RAIIScopeGuardVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={handleVisualizationMetrics}
            />
          </Canvas>
        </div>

        <PerformanceMonitor
          metrics={{
            'Guards Active': state.guardsActive,
            'Resources Managed': state.resourcesManaged,
            'Cleanup Calls': state.cleanupCalls,
            'Exceptions Handled': state.exceptionsHandled,
            'Scope Entry (µs)': state.performanceMetrics.scopeEntryTime.toFixed(2),
            'Scope Exit (µs)': state.performanceMetrics.scopeExitTime.toFixed(2),
            'Cleanup Overhead (%)': state.performanceMetrics.cleanupOverhead.toFixed(1)
          }}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Basic RAII Scope Guards' : 'Guardias de Ámbito RAII Básicas'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <functional>
#include <fstream>
#include <memory>

// Basic scope guard implementation
class ScopeGuard {
private:
    std::function<void()> cleanup_;
    bool dismissed_ = false;

public:
    explicit ScopeGuard(std::function<void()> cleanup)
        : cleanup_(std::move(cleanup)) {}
    
    ~ScopeGuard() {
        if (!dismissed_ && cleanup_) {
            cleanup_();
        }
    }
    
    // Prevent copying and moving for simplicity
    ScopeGuard(const ScopeGuard&) = delete;
    ScopeGuard& operator=(const ScopeGuard&) = delete;
    ScopeGuard(ScopeGuard&&) = delete;
    ScopeGuard& operator=(ScopeGuard&&) = delete;
    
    void dismiss() noexcept {
        dismissed_ = true;
    }
};

// Convenience macro for creating scope guards
#define SCOPE_EXIT(code) \\
    ScopeGuard CONCATENATE(scope_guard_, __LINE__)([&](){ code; })

#define CONCATENATE_IMPL(x, y) x##y
#define CONCATENATE(x, y) CONCATENATE_IMPL(x, y)

// Example usage
void basic_scope_guard_example() {
    std::cout << "${state.language === 'en' ? 'Basic Scope Guard Example' : 'Ejemplo de Guardia de Ámbito Básica'}" << std::endl;
    
    FILE* file = fopen("temp.txt", "w");
    if (!file) {
        std::cerr << "${state.language === 'en' ? 'Failed to open file' : 'Error al abrir archivo'}" << std::endl;
        return;
    }
    
    // Automatic cleanup with scope guard
    SCOPE_EXIT(
        fclose(file);
        std::cout << "${state.language === 'en' ? 'File closed automatically' : 'Archivo cerrado automáticamente'}" << std::endl;
    );
    
    // Use the file
    fprintf(file, "Hello, RAII Scope Guards!\\n");
    
    // File will be automatically closed when scope exits
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Basic scope guards provide automatic cleanup when leaving a scope, regardless of how the scope is exited (normal return, exception, etc.). They ensure resources are always properly released.'
            : 'Las guardias de ámbito básicas proporcionan limpieza automática al salir de un ámbito, independientemente de cómo se salga del ámbito (retorno normal, excepción, etc.). Garantizan que los recursos siempre se liberen adecuadamente.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Exception-Safe Scope Guards' : 'Guardias de Ámbito Seguras ante Excepciones'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <exception>
#include <iostream>
#include <stdexcept>

// Exception-safe scope guard with noexcept guarantee
class ExceptionSafeScopeGuard {
private:
    std::function<void()> cleanup_;
    bool dismissed_ = false;
    int exception_count_;

public:
    explicit ExceptionSafeScopeGuard(std::function<void()> cleanup)
        : cleanup_(std::move(cleanup))
        , exception_count_(std::uncaught_exceptions()) {}
    
    ~ExceptionSafeScopeGuard() noexcept {
        if (!dismissed_ && cleanup_) {
            try {
                // Only run cleanup if no new exceptions occurred
                if (std::uncaught_exceptions() == exception_count_) {
                    cleanup_();
                }
            } catch (...) {
                // Never let cleanup throw in destructor
                // Log error in production code
            }
        }
    }
    
    void dismiss() noexcept {
        dismissed_ = true;
    }
};

// Specialized guards for different exception scenarios
class ScopeExitGuard {
private:
    std::function<void()> cleanup_;
    bool dismissed_ = false;
    
public:
    explicit ScopeExitGuard(std::function<void()> cleanup)
        : cleanup_(std::move(cleanup)) {}
    
    ~ScopeExitGuard() noexcept {
        if (!dismissed_ && cleanup_) {
            try {
                cleanup_();
            } catch (...) {
                // Suppress all exceptions in destructor
            }
        }
    }
    
    void dismiss() noexcept { dismissed_ = true; }
};

class ScopeFailGuard {
private:
    std::function<void()> cleanup_;
    int initial_exception_count_;
    
public:
    explicit ScopeFailGuard(std::function<void()> cleanup)
        : cleanup_(std::move(cleanup))
        , initial_exception_count_(std::uncaught_exceptions()) {}
    
    ~ScopeFailGuard() noexcept {
        if (cleanup_ && std::uncaught_exceptions() > initial_exception_count_) {
            try {
                cleanup_();
            } catch (...) {
                // Suppress exceptions during stack unwinding
            }
        }
    }
};

class ScopeSuccessGuard {
private:
    std::function<void()> cleanup_;
    int initial_exception_count_;
    
public:
    explicit ScopeSuccessGuard(std::function<void()> cleanup)
        : cleanup_(std::move(cleanup))
        , initial_exception_count_(std::uncaught_exceptions()) {}
    
    ~ScopeSuccessGuard() noexcept {
        if (cleanup_ && std::uncaught_exceptions() == initial_exception_count_) {
            try {
                cleanup_();
            } catch (...) {
                // Handle success-only cleanup
            }
        }
    }
};

void exception_safe_example() {
    std::cout << "${state.language === 'en' ? 'Exception-Safe Scope Guards Example' : 'Ejemplo de Guardias de Ámbito Seguras ante Excepciones'}" << std::endl;
    
    try {
        // Always execute on scope exit
        ScopeExitGuard exit_guard([&]() {
            std::cout << "${state.language === 'en' ? 'Exit cleanup executed' : 'Limpieza de salida ejecutada'}" << std::endl;
        });
        
        // Only execute if exception occurs
        ScopeFailGuard fail_guard([&]() {
            std::cout << "${state.language === 'en' ? 'Failure cleanup executed' : 'Limpieza de fallo ejecutada'}" << std::endl;
        });
        
        // Only execute if no exception occurs
        ScopeSuccessGuard success_guard([&]() {
            std::cout << "${state.language === 'en' ? 'Success cleanup executed' : 'Limpieza de éxito ejecutada'}" << std::endl;
        });
        
        // Simulate potential exception
        if (rand() % 2) {
            throw std::runtime_error("${state.language === 'en' ? 'Simulated error' : 'Error simulado'}");
        }
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Caught exception: ' : 'Excepción capturada: '}" << e.what() << std::endl;
    }
}`}
        />
        
        <UndefinedBehaviorWarning
          warning={state.language === 'en' 
            ? 'Cleanup functions in scope guard destructors must be noexcept or handle all exceptions internally to prevent std::terminate during stack unwinding.'
            : 'Las funciones de limpieza en los destructores de guardias de ámbito deben ser noexcept o manejar todas las excepciones internamente para prevenir std::terminate durante el desenrollado de pila.'
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Conditional Scope Guards' : 'Guardias de Ámbito Condicionales'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <functional>
#include <memory>

// Conditional scope guard with release mechanism
template<typename F>
class ConditionalScopeGuard {
private:
    F cleanup_;
    bool active_ = true;
    bool condition_met_ = false;
    std::function<bool()> condition_;

public:
    explicit ConditionalScopeGuard(F cleanup, std::function<bool()> condition = nullptr)
        : cleanup_(std::move(cleanup))
        , condition_(std::move(condition)) {}
    
    ~ConditionalScopeGuard() noexcept {
        if (active_ && (!condition_ || condition_())) {
            try {
                cleanup_();
            } catch (...) {
                // Suppress exceptions
            }
        }
    }
    
    void release() noexcept {
        active_ = false;
    }
    
    void activate() noexcept {
        active_ = true;
    }
    
    bool is_active() const noexcept {
        return active_;
    }
};

// Factory functions for common patterns
template<typename F>
auto make_scope_exit(F&& f) {
    return ConditionalScopeGuard<std::decay_t<F>>(std::forward<F>(f));
}

template<typename F, typename Condition>
auto make_conditional_scope_guard(F&& cleanup, Condition&& condition) {
    return ConditionalScopeGuard<std::decay_t<F>>(
        std::forward<F>(cleanup),
        std::forward<Condition>(condition)
    );
}

// Resource acquisition with conditional release
class DatabaseTransaction {
private:
    bool committed_ = false;
    bool connection_valid_ = true;
    
public:
    void begin() {
        std::cout << "${state.language === 'en' ? 'Transaction began' : 'Transacción iniciada'}" << std::endl;
    }
    
    void commit() {
        committed_ = true;
        std::cout << "${state.language === 'en' ? 'Transaction committed' : 'Transacción confirmada'}" << std::endl;
    }
    
    void rollback() {
        std::cout << "${state.language === 'en' ? 'Transaction rolled back' : 'Transacción revertida'}" << std::endl;
    }
    
    bool is_committed() const { return committed_; }
    bool is_connection_valid() const { return connection_valid_; }
};

void conditional_guard_example() {
    std::cout << "${state.language === 'en' ? 'Conditional Scope Guards Example' : 'Ejemplo de Guardias de Ámbito Condicionales'}" << std::endl;
    
    DatabaseTransaction transaction;
    transaction.begin();
    
    // Rollback only if not committed and connection is valid
    auto rollback_guard = make_conditional_scope_guard(
        [&transaction]() {
            transaction.rollback();
        },
        [&transaction]() {
            return !transaction.is_committed() && transaction.is_connection_valid();
        }
    );
    
    try {
        // Perform database operations
        std::cout << "${state.language === 'en' ? 'Performing database operations...' : 'Realizando operaciones de base de datos...'}" << std::endl;
        
        // Simulate success/failure
        if (rand() % 2) {
            transaction.commit();
            rollback_guard.release(); // No rollback needed
        } else {
            throw std::runtime_error("${state.language === 'en' ? 'Database operation failed' : 'Operación de base de datos falló'}");
        }
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Error: ' : 'Error: '}" << e.what() << std::endl;
        // rollback_guard will automatically rollback if conditions are met
    }
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Conditional scope guards allow you to specify when cleanup should occur. They provide flexibility in resource management by enabling conditional release patterns and dynamic activation/deactivation.'
            : 'Las guardias de ámbito condicionales permiten especificar cuándo debe ocurrir la limpieza. Proporcionan flexibilidad en la gestión de recursos habilitando patrones de liberación condicional y activación/desactivación dinámica.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Nested Scope Guards and RAII Hierarchies' : 'Guardias de Ámbito Anidadas y Jerarquías RAII'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <vector>
#include <memory>
#include <stack>

// Hierarchical scope guard manager
class ScopeGuardManager {
private:
    std::stack<std::unique_ptr<ScopeGuard>> guards_;
    
public:
    template<typename F>
    void add_guard(F&& cleanup) {
        guards_.emplace(std::make_unique<ScopeGuard>(std::forward<F>(cleanup)));
    }
    
    void release_last() {
        if (!guards_.empty()) {
            guards_.top()->dismiss();
            guards_.pop();
        }
    }
    
    void release_all() {
        while (!guards_.empty()) {
            guards_.top()->dismiss();
            guards_.pop();
        }
    }
    
    size_t count() const {
        return guards_.size();
    }
    
    ~ScopeGuardManager() {
        // Guards are automatically cleaned up in LIFO order
        std::cout << "${state.language === 'en' ? 'Cleaning up ' : 'Limpiando '}" 
                  << guards_.size() << "${state.language === 'en' ? ' remaining guards' : ' guardias restantes'}" << std::endl;
    }
};

// Nested resource management with automatic cleanup ordering
class NestedResourceManager {
private:
    struct Resource {
        int id;
        std::string name;
        bool active = true;
        
        Resource(int i, const std::string& n) : id(i), name(n) {
            std::cout << "${state.language === 'en' ? 'Acquired resource ' : 'Recurso adquirido '}" 
                      << id << ": " << name << std::endl;
        }
        
        ~Resource() {
            if (active) {
                std::cout << "${state.language === 'en' ? 'Released resource ' : 'Recurso liberado '}" 
                          << id << ": " << name << std::endl;
            }
        }
        
        void release() { active = false; }
    };
    
    std::vector<std::unique_ptr<Resource>> resources_;
    ScopeGuardManager guard_manager_;
    
public:
    void acquire_resource(int id, const std::string& name) {
        auto resource = std::make_unique<Resource>(id, name);
        
        // Add cleanup guard for this resource
        guard_manager_.add_guard([resource_ptr = resource.get()]() {
            resource_ptr->release();
            std::cout << "${state.language === 'en' ? 'Guard cleaned up resource ' : 'Guardia limpió recurso '}" 
                      << resource_ptr->id << std::endl;
        });
        
        resources_.push_back(std::move(resource));
    }
    
    void release_resource(int id) {
        auto it = std::find_if(resources_.begin(), resources_.end(),
            [id](const auto& resource) { return resource->id == id; });
        
        if (it != resources_.end()) {
            (*it)->release();
            // Remove corresponding guard
            guard_manager_.release_last();
            resources_.erase(it);
        }
    }
    
    void release_all_resources() {
        guard_manager_.release_all();
        resources_.clear();
    }
    
    size_t resource_count() const {
        return resources_.size();
    }
};

// Complex nested operation with multiple scope guards
void complex_nested_operation() {
    std::cout << "${state.language === 'en' ? 'Complex Nested Operation Example' : 'Ejemplo de Operación Anidada Compleja'}" << std::endl;
    
    NestedResourceManager manager;
    
    // Level 1: Outer scope guards
    auto level1_guard = make_scope_exit([&]() {
        std::cout << "${state.language === 'en' ? 'Level 1 cleanup' : 'Limpieza nivel 1'}" << std::endl;
    });
    
    manager.acquire_resource(1, "Database Connection");
    
    {
        // Level 2: Nested scope with additional guards
        auto level2_guard = make_scope_exit([&]() {
            std::cout << "${state.language === 'en' ? 'Level 2 cleanup' : 'Limpieza nivel 2'}" << std::endl;
        });
        
        manager.acquire_resource(2, "File Handle");
        manager.acquire_resource(3, "Network Socket");
        
        {
            // Level 3: Deeply nested scope
            auto level3_guard = make_scope_exit([&]() {
                std::cout << "${state.language === 'en' ? 'Level 3 cleanup' : 'Limpieza nivel 3'}" << std::endl;
            });
            
            manager.acquire_resource(4, "Temporary Buffer");
            
            try {
                // Simulate work that might throw
                if (rand() % 3 == 0) {
                    throw std::runtime_error("${state.language === 'en' ? 'Nested operation failed' : 'Operación anidada falló'}");
                }
                
                // Successful completion - release specific resources
                manager.release_resource(4);
                level3_guard.release();
                
            } catch (const std::exception& e) {
                std::cout << "${state.language === 'en' ? 'Error in nested operation: ' : 'Error en operación anidada: '}" 
                          << e.what() << std::endl;
            }
            
            // level3_guard destructor runs here
        }
        
        // Additional level 2 work
        std::cout << "${state.language === 'en' ? 'Level 2 work completed' : 'Trabajo de nivel 2 completado'}" << std::endl;
        
        // level2_guard destructor runs here
    }
    
    std::cout << "${state.language === 'en' ? 'Remaining resources: ' : 'Recursos restantes: '}" 
              << manager.resource_count() << std::endl;
    
    // level1_guard and manager destructors run here
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Nested scope guards create hierarchical cleanup patterns that ensure proper resource deallocation in reverse order of acquisition (LIFO). This pattern is crucial for complex resource dependencies and exception safety.'
            : 'Las guardias de ámbito anidadas crean patrones de limpieza jerárquicos que aseguran la desasignación adecuada de recursos en orden inverso a la adquisición (LIFO). Este patrón es crucial para dependencias complejas de recursos y seguridad ante excepciones.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Lambda-Based Scope Guards' : 'Guardias de Ámbito Basadas en Lambdas'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <functional>
#include <memory>
#include <chrono>
#include <thread>

// Modern C++ lambda-based scope guard
template<typename Lambda>
class LambdaScopeGuard {
private:
    Lambda cleanup_;
    bool dismissed_ = false;

public:
    explicit LambdaScopeGuard(Lambda&& cleanup) noexcept
        : cleanup_(std::forward<Lambda>(cleanup)) {}
    
    ~LambdaScopeGuard() noexcept {
        if (!dismissed_) {
            try {
                cleanup_();
            } catch (...) {
                // Never throw from destructor
            }
        }
    }
    
    // Move-only semantics
    LambdaScopeGuard(const LambdaScopeGuard&) = delete;
    LambdaScopeGuard& operator=(const LambdaScopeGuard&) = delete;
    
    LambdaScopeGuard(LambdaScopeGuard&& other) noexcept
        : cleanup_(std::move(other.cleanup_))
        , dismissed_(other.dismissed_) {
        other.dismissed_ = true;
    }
    
    LambdaScopeGuard& operator=(LambdaScopeGuard&& other) noexcept {
        if (this != &other) {
            cleanup_ = std::move(other.cleanup_);
            dismissed_ = other.dismissed_;
            other.dismissed_ = true;
        }
        return *this;
    }
    
    void dismiss() noexcept {
        dismissed_ = true;
    }
    
    void reset(Lambda&& new_cleanup) {
        cleanup_ = std::forward<Lambda>(new_cleanup);
        dismissed_ = false;
    }
};

// Deduction guide for template argument deduction
template<typename Lambda>
LambdaScopeGuard(Lambda) -> LambdaScopeGuard<Lambda>;

// Factory function for easy creation
template<typename Lambda>
auto make_lambda_guard(Lambda&& lambda) {
    return LambdaScopeGuard{std::forward<Lambda>(lambda)};
}

// Advanced lambda guard with capture by reference safety
template<typename Lambda>
class SafeLambdaGuard {
private:
    std::function<void()> cleanup_;
    bool dismissed_ = false;
    
public:
    template<typename L>
    explicit SafeLambdaGuard(L&& lambda) 
        : cleanup_(std::forward<L>(lambda)) {}
    
    ~SafeLambdaGuard() noexcept {
        if (!dismissed_ && cleanup_) {
            try {
                cleanup_();
            } catch (...) {}
        }
    }
    
    void dismiss() noexcept { dismissed_ = true; }
};

// Performance monitoring with lambda guards
class PerformanceTimer {
private:
    std::chrono::high_resolution_clock::time_point start_;
    std::string operation_name_;
    
public:
    PerformanceTimer(const std::string& name) 
        : start_(std::chrono::high_resolution_clock::now())
        , operation_name_(name) {
        std::cout << "${state.language === 'en' ? 'Started: ' : 'Iniciado: '}" << operation_name_ << std::endl;
    }
    
    ~PerformanceTimer() {
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start_);
        std::cout << "${state.language === 'en' ? 'Completed: ' : 'Completado: '}" << operation_name_ 
                  << " (${state.language === 'en' ? 'took ' : 'tomó '}" << duration.count() 
                  << "µs)" << std::endl;
    }
};

void lambda_guard_examples() {
    std::cout << "${state.language === 'en' ? 'Lambda-Based Scope Guards Example' : 'Ejemplo de Guardias de Ámbito Basadas en Lambdas'}" << std::endl;
    
    int counter = 0;
    
    // Simple lambda guard
    {
        auto guard = make_lambda_guard([&counter]() {
            ++counter;
            std::cout << "${state.language === 'en' ? 'Lambda guard executed, counter: ' : 'Guardia lambda ejecutada, contador: '}" 
                      << counter << std::endl;
        });
        
        std::cout << "${state.language === 'en' ? 'Inside scope' : 'Dentro del ámbito'}" << std::endl;
    }
    
    // Conditional lambda guard with capture
    {
        bool should_cleanup = true;
        auto conditional_guard = make_lambda_guard([&counter, should_cleanup]() {
            if (should_cleanup) {
                counter += 10;
                std::cout << "${state.language === 'en' ? 'Conditional cleanup executed, counter: ' : 'Limpieza condicional ejecutada, contador: '}" 
                          << counter << std::endl;
            }
        });
        
        // Change condition
        should_cleanup = (counter < 5);
    }
    
    // Performance monitoring with RAII
    {
        PerformanceTimer timer("${state.language === 'en' ? 'Complex Operation' : 'Operación Compleja'}");
        
        auto cleanup_guard = make_lambda_guard([&]() {
            std::cout << "${state.language === 'en' ? 'Cleaning up complex operation resources' : 'Limpiando recursos de operación compleja'}" << std::endl;
        });
        
        // Simulate work
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        
        // Performance timer and cleanup guard destructors run here
    }
    
    // Multiple lambda guards with different purposes
    {
        std::string log_message = "${state.language === 'en' ? 'Operation completed successfully' : 'Operación completada exitosamente'}";
        
        auto logging_guard = make_lambda_guard([&log_message]() {
            std::cout << "${state.language === 'en' ? 'Log: ' : 'Registro: '}" << log_message << std::endl;
        });
        
        auto notification_guard = make_lambda_guard([&counter]() {
            std::cout << "${state.language === 'en' ? 'Notification: Final counter value is ' : 'Notificación: El valor final del contador es '}" 
                      << counter << std::endl;
        });
        
        auto cleanup_guard = make_lambda_guard([&counter]() {
            counter = 0;  // Reset for next operation
            std::cout << "${state.language === 'en' ? 'Reset counter for next operation' : 'Contador reiniciado para la siguiente operación'}" << std::endl;
        });
        
        // Simulate some work
        counter += 5;
        
        // All guards execute in reverse order (LIFO)
    }
    
    std::cout << "${state.language === 'en' ? 'Final counter value: ' : 'Valor final del contador: '}" << counter << std::endl;
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Lambda-based scope guards offer maximum flexibility and modern C++ idioms. They support move semantics, perfect forwarding, and automatic template argument deduction, making them ideal for performance-critical code.'
            : 'Las guardias de ámbito basadas en lambdas ofrecen máxima flexibilidad y modismos de C++ moderno. Soportan semántica de movimiento, reenvío perfecto y deducción automática de argumentos de template, haciéndolas ideales para código crítico en rendimiento.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Multi-Resource Scope Guards' : 'Guardias de Ámbito Multi-Recurso'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <vector>
#include <memory>
#include <tuple>
#include <functional>

// Multi-resource scope guard for managing related resources
template<typename... Resources>
class MultiResourceGuard {
private:
    std::tuple<Resources...> resources_;
    std::vector<std::function<void()>> cleanup_functions_;
    bool dismissed_ = false;

public:
    explicit MultiResourceGuard(Resources... resources, 
                               std::vector<std::function<void()>> cleanups)
        : resources_(std::make_tuple(resources...))
        , cleanup_functions_(std::move(cleanups)) {}
    
    ~MultiResourceGuard() noexcept {
        if (!dismissed_) {
            // Execute cleanup functions in reverse order
            for (auto it = cleanup_functions_.rbegin(); it != cleanup_functions_.rend(); ++it) {
                try {
                    (*it)();
                } catch (...) {
                    // Log error but continue with other cleanups
                }
            }
        }
    }
    
    void dismiss() noexcept {
        dismissed_ = true;
    }
    
    template<size_t Index>
    auto& get() {
        return std::get<Index>(resources_);
    }
    
    template<size_t Index>
    const auto& get() const {
        return std::get<Index>(resources_);
    }
};

// Factory function for creating multi-resource guards
template<typename... Resources>
auto make_multi_resource_guard(Resources&&... resources, 
                              std::vector<std::function<void()>> cleanups) {
    return MultiResourceGuard<std::decay_t<Resources>...>(
        std::forward<Resources>(resources)..., std::move(cleanups));
}

// Specialized guard for common resource patterns
class FileSystemGuard {
private:
    std::vector<std::string> files_to_delete_;
    std::vector<std::string> directories_to_remove_;
    bool dismissed_ = false;

public:
    void add_file_for_cleanup(const std::string& filename) {
        files_to_delete_.push_back(filename);
    }
    
    void add_directory_for_cleanup(const std::string& dirname) {
        directories_to_remove_.push_back(dirname);
    }
    
    void dismiss() noexcept {
        dismissed_ = true;
    }
    
    ~FileSystemGuard() noexcept {
        if (!dismissed_) {
            // Clean up files first
            for (const auto& file : files_to_delete_) {
                try {
                    // In real code, use std::filesystem::remove
                    std::cout << "${state.language === 'en' ? 'Removing file: ' : 'Eliminando archivo: '}" 
                              << file << std::endl;
                } catch (...) {
                    // Continue with other files
                }
            }
            
            // Then clean up directories (in reverse order)
            for (auto it = directories_to_remove_.rbegin(); it != directories_to_remove_.rend(); ++it) {
                try {
                    // In real code, use std::filesystem::remove_all
                    std::cout << "${state.language === 'en' ? 'Removing directory: ' : 'Eliminando directorio: '}" 
                              << *it << std::endl;
                } catch (...) {
                    // Continue with other directories
                }
            }
        }
    }
};

// Database transaction guard managing multiple connections
class DatabaseTransactionGuard {
private:
    struct Connection {
        std::string name;
        bool in_transaction = false;
        bool needs_rollback = false;
        
        void begin_transaction() {
            in_transaction = true;
            needs_rollback = true;
            std::cout << "${state.language === 'en' ? 'Transaction started on: ' : 'Transacción iniciada en: '}" 
                      << name << std::endl;
        }
        
        void commit() {
            needs_rollback = false;
            std::cout << "${state.language === 'en' ? 'Transaction committed on: ' : 'Transacción confirmada en: '}" 
                      << name << std::endl;
        }
        
        void rollback() {
            if (needs_rollback) {
                needs_rollback = false;
                std::cout << "${state.language === 'en' ? 'Transaction rolled back on: ' : 'Transacción revertida en: '}" 
                          << name << std::endl;
            }
        }
    };
    
    std::vector<Connection> connections_;
    bool dismissed_ = false;

public:
    void add_connection(const std::string& name) {
        Connection conn{name};
        conn.begin_transaction();
        connections_.push_back(std::move(conn));
    }
    
    void commit_all() {
        for (auto& conn : connections_) {
            conn.commit();
        }
    }
    
    void dismiss() noexcept {
        dismissed_ = true;
    }
    
    ~DatabaseTransactionGuard() noexcept {
        if (!dismissed_) {
            // Rollback all uncommitted transactions
            for (auto& conn : connections_) {
                try {
                    conn.rollback();
                } catch (...) {
                    // Continue with other connections
                }
            }
        }
    }
};

void multi_resource_examples() {
    std::cout << "${state.language === 'en' ? 'Multi-Resource Scope Guards Example' : 'Ejemplo de Guardias de Ámbito Multi-Recurso'}" << std::endl;
    
    // File system operations with automatic cleanup
    {
        FileSystemGuard fs_guard;
        
        // Simulate creating temporary files and directories
        fs_guard.add_file_for_cleanup("temp_file1.txt");
        fs_guard.add_file_for_cleanup("temp_file2.dat");
        fs_guard.add_directory_for_cleanup("temp_dir/subdir");
        fs_guard.add_directory_for_cleanup("temp_dir");
        
        try {
            // Simulate file operations
            std::cout << "${state.language === 'en' ? 'Creating temporary files and directories...' : 'Creando archivos y directorios temporales...'}" << std::endl;
            
            // If all operations succeed, we might choose to keep some files
            if (rand() % 2) {
                throw std::runtime_error("${state.language === 'en' ? 'File operation failed' : 'Operación de archivo falló'}");
            }
            
            // Success case - could dismiss guard for some resources
            std::cout << "${state.language === 'en' ? 'File operations completed successfully' : 'Operaciones de archivo completadas exitosamente'}" << std::endl;
            
        } catch (const std::exception& e) {
            std::cout << "${state.language === 'en' ? 'Error: ' : 'Error: '}" << e.what() << std::endl;
            // fs_guard will clean up all temporary files/directories
        }
        
        // Cleanup happens here automatically
    }
    
    // Database transaction management
    {
        DatabaseTransactionGuard db_guard;
        
        try {
            // Start transactions on multiple databases
            db_guard.add_connection("primary_db");
            db_guard.add_connection("analytics_db");
            db_guard.add_connection("cache_db");
            
            // Simulate database operations
            std::cout << "${state.language === 'en' ? 'Performing multi-database operations...' : 'Realizando operaciones multi-base de datos...'}" << std::endl;
            
            if (rand() % 3 == 0) {
                throw std::runtime_error("${state.language === 'en' ? 'Database operation failed' : 'Operación de base de datos falló'}");
            }
            
            // All operations succeeded
            db_guard.commit_all();
            db_guard.dismiss();
            
        } catch (const std::exception& e) {
            std::cout << "${state.language === 'en' ? 'Database error: ' : 'Error de base de datos: '}" << e.what() << std::endl;
            // db_guard will rollback all transactions automatically
        }
    }
    
    // Generic multi-resource guard
    {
        std::string resource1 = "Network Connection";
        std::string resource2 = "Memory Buffer";
        int resource3 = 12345; // Resource ID
        
        auto multi_guard = make_multi_resource_guard(
            resource1, resource2, resource3,
            std::vector<std::function<void()>>{
                [&resource1]() {
                    std::cout << "${state.language === 'en' ? 'Closing: ' : 'Cerrando: '}" << resource1 << std::endl;
                },
                [&resource2]() {
                    std::cout << "${state.language === 'en' ? 'Freeing: ' : 'Liberando: '}" << resource2 << std::endl;
                },
                [&resource3]() {
                    std::cout << "${state.language === 'en' ? 'Releasing resource ID: ' : 'Liberando ID de recurso: '}" << resource3 << std::endl;
                }
            }
        );
        
        // Use the resources
        std::cout << "${state.language === 'en' ? 'Using resource: ' : 'Usando recurso: '}" << multi_guard.get<0>() << std::endl;
        std::cout << "${state.language === 'en' ? 'Using resource: ' : 'Usando recurso: '}" << multi_guard.get<1>() << std::endl;
        std::cout << "${state.language === 'en' ? 'Using resource ID: ' : 'Usando ID de recurso: '}" << multi_guard.get<2>() << std::endl;
        
        // Automatic cleanup of all resources in reverse order
    }
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Multi-resource scope guards coordinate the cleanup of related resources, ensuring proper ordering and exception safety when managing complex resource dependencies. They are particularly useful for transaction-like operations.'
            : 'Las guardias de ámbito multi-recurso coordinan la limpieza de recursos relacionados, asegurando el orden adecuado y seguridad ante excepciones al gestionar dependencias complejas de recursos. Son particularmente útiles para operaciones tipo transacción.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Performance Comparison' : 'Comparación de Rendimiento'}
        </SectionTitle>
        
        <PerformanceComparison
          scenarios={[
            {
              name: state.language === 'en' ? 'Manual Cleanup' : 'Limpieza Manual',
              complexity: 'O(1)',
              performance: 85,
              description: state.language === 'en' 
                ? 'Direct resource management without RAII protection'
                : 'Gestión directa de recursos sin protección RAII'
            },
            {
              name: state.language === 'en' ? 'Basic Scope Guards' : 'Guardias Básicas',
              complexity: 'O(1)',
              performance: 92,
              description: state.language === 'en' 
                ? 'Simple scope guards with minimal overhead'
                : 'Guardias de ámbito simples con sobrecarga mínima'
            },
            {
              name: state.language === 'en' ? 'Exception-Safe Guards' : 'Guardias Seguras',
              complexity: 'O(1)',
              performance: 88,
              description: state.language === 'en' 
                ? 'Guards with exception detection and handling'
                : 'Guardias con detección y manejo de excepciones'
            },
            {
              name: state.language === 'en' ? 'Lambda Guards' : 'Guardias Lambda',
              complexity: 'O(1)',
              performance: 94,
              description: state.language === 'en' 
                ? 'Modern lambda-based guards with optimization'
                : 'Guardias modernas basadas en lambdas con optimización'
            },
            {
              name: state.language === 'en' ? 'Multi-Resource Guards' : 'Guardias Multi-Recurso',
              complexity: 'O(n)',
              performance: 78,
              description: state.language === 'en' 
                ? 'Complex guards managing multiple resources'
                : 'Guardias complejas gestionando múltiples recursos'
            }
          ]}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Practical Exercises' : 'Ejercicios Prácticos'}
        </SectionTitle>
        
        <InteractiveSection>
          <h4>{state.language === 'en' ? 'Exercise 1: Transaction Manager' : 'Ejercicio 1: Gestor de Transacciones'}</h4>
          <p>
            {state.language === 'en' 
              ? 'Implement a transaction manager using scope guards that can handle nested transactions with automatic rollback on exceptions.'
              : 'Implementa un gestor de transacciones usando guardias de ámbito que pueda manejar transacciones anidadas con rollback automático ante excepciones.'
            }
          </p>
          
          <CodeBlock
            language="cpp"
            code={`// Your implementation here
class TransactionManager {
public:
    class Transaction {
    private:
        // TODO: Implement transaction state
        
    public:
        Transaction(TransactionManager& manager, const std::string& name);
        ~Transaction();
        
        void commit();
        void rollback();
    };
    
    Transaction begin_transaction(const std::string& name);
    
private:
    // TODO: Implement transaction stack and state management
};

// Usage example:
void test_transaction_manager() {
    TransactionManager manager;
    
    try {
        auto tx1 = manager.begin_transaction("outer");
        
        // Nested transaction
        {
            auto tx2 = manager.begin_transaction("inner");
            // Work that might throw...
            tx2.commit();
        }
        
        tx1.commit();
    } catch (...) {
        // All uncommitted transactions should rollback automatically
    }
}`}
          />
          
          <h4>{state.language === 'en' ? 'Exercise 2: Resource Pool Guard' : 'Ejercicio 2: Guardia de Pool de Recursos'}</h4>
          <p>
            {state.language === 'en' 
              ? 'Create a resource pool with automatic return of borrowed resources using scope guards.'
              : 'Crea un pool de recursos con retorno automático de recursos prestados usando guardias de ámbito.'
            }
          </p>
          
          <CodeBlock
            language="cpp"
            code={`// Your implementation here
template<typename T>
class ResourcePool {
public:
    class BorrowedResource {
    private:
        // TODO: Implement RAII wrapper for borrowed resources
        
    public:
        BorrowedResource(ResourcePool& pool, T& resource);
        ~BorrowedResource();
        
        T& operator*();
        T* operator->();
        
        void return_early();
    };
    
    BorrowedResource borrow();
    void add_resource(T resource);
    size_t available_count() const;
    
private:
    // TODO: Implement resource pool state
};

// Usage example:
void test_resource_pool() {
    ResourcePool<std::string> pool;
    pool.add_resource("Resource1");
    pool.add_resource("Resource2");
    
    {
        auto borrowed = pool.borrow();
        *borrowed = "Modified";
        // Resource automatically returned when scope exits
    }
    
    // Resource should be back in pool
    assert(pool.available_count() == 2);
}`}
          />
        </InteractiveSection>
      </Section>
    </LessonLayout>
  );
};

export default Lesson86_RAIIScopeGuards;