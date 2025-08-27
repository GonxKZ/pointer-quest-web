/**
 * Lesson 87: Exception-Safe RAII
 * Advanced exception safety guarantees and RAII patterns for robust resource management
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

interface ExceptionSafeRAIIState {
  language: 'en' | 'es';
  scenario: 'basic_guarantee' | 'strong_guarantee' | 'two_phase_construction' | 'exception_neutral' | 'noexcept_optimization' | 'template_safety';
  isAnimating: boolean;
  exceptionsSuppressed: number;
  stackUnwindings: number;
  resourcesProtected: number;
  guaranteeLevel: number;
  performanceMetrics: {
    exceptionOverhead: number;
    safetyCompliance: number;
    optimizationLevel: number;
  };
}

// 3D Visualización de Exception-Safe RAII
const ExceptionSafeRAIIVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'basic_guarantee') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        exceptionsSuppressed: Math.floor(2 + Math.sin(animationRef.current * 2) * 1),
        stackUnwindings: Math.floor(3 + Math.cos(animationRef.current * 1.5) * 2),
        resourcesProtected: Math.floor(5 + Math.sin(animationRef.current) * 3),
        guaranteeLevel: Math.floor(40 + Math.cos(animationRef.current * 2) * 20),
        performanceMetrics: {
          exceptionOverhead: 5.2 + Math.sin(animationRef.current) * 2.1,
          safetyCompliance: 75 + Math.cos(animationRef.current * 2) * 10,
          optimizationLevel: 60 + Math.sin(animationRef.current * 1.5) * 15
        }
      });
    } else if (scenario === 'strong_guarantee') {
      groupRef.current.rotation.x = Math.sin(animationRef.current) * 0.2;
      groupRef.current.rotation.z = Math.cos(animationRef.current) * 0.15;
      onMetrics({
        exceptionsSuppressed: Math.floor(4 + Math.cos(animationRef.current * 2.5) * 2),
        stackUnwindings: Math.floor(6 + Math.sin(animationRef.current * 2) * 3),
        resourcesProtected: Math.floor(8 + Math.cos(animationRef.current * 1.8) * 4),
        guaranteeLevel: Math.floor(85 + Math.sin(animationRef.current * 3) * 10),
        performanceMetrics: {
          exceptionOverhead: 8.5 + Math.cos(animationRef.current * 2) * 3.2,
          safetyCompliance: 95 + Math.sin(animationRef.current) * 5,
          optimizationLevel: 75 + Math.cos(animationRef.current * 1.8) * 12
        }
      });
    } else if (scenario === 'two_phase_construction') {
      groupRef.current.rotation.y = Math.cos(animationRef.current) * 0.25;
      onMetrics({
        exceptionsSuppressed: Math.floor(3 + Math.sin(animationRef.current * 1.8) * 2),
        stackUnwindings: Math.floor(4 + Math.cos(animationRef.current * 2.2) * 3),
        resourcesProtected: Math.floor(6 + Math.sin(animationRef.current * 2.5) * 3),
        guaranteeLevel: Math.floor(70 + Math.cos(animationRef.current * 2) * 15),
        performanceMetrics: {
          exceptionOverhead: 12.8 + Math.sin(animationRef.current * 1.5) * 4.5,
          safetyCompliance: 88 + Math.cos(animationRef.current * 2.5) * 8,
          optimizationLevel: 65 + Math.sin(animationRef.current * 2) * 18
        }
      });
    } else if (scenario === 'exception_neutral') {
      groupRef.current.rotation.y = animationRef.current * 0.4;
      groupRef.current.rotation.x = Math.sin(animationRef.current * 0.7) * 0.1;
      onMetrics({
        exceptionsSuppressed: Math.floor(1 + Math.sin(animationRef.current * 1.5)),
        stackUnwindings: Math.floor(8 + Math.cos(animationRef.current * 2) * 4),
        resourcesProtected: Math.floor(10 + Math.sin(animationRef.current * 1.8) * 5),
        guaranteeLevel: Math.floor(95 + Math.sin(animationRef.current * 2.8) * 5),
        performanceMetrics: {
          exceptionOverhead: 3.2 + Math.cos(animationRef.current * 2.5) * 1.8,
          safetyCompliance: 98 + Math.sin(animationRef.current * 3) * 2,
          optimizationLevel: 90 + Math.cos(animationRef.current * 1.2) * 8
        }
      });
    } else if (scenario === 'noexcept_optimization') {
      groupRef.current.rotation.z = Math.sin(animationRef.current * 1.2) * 0.18;
      onMetrics({
        exceptionsSuppressed: 0, // noexcept means no exceptions
        stackUnwindings: Math.floor(2 + Math.cos(animationRef.current * 3) * 2),
        resourcesProtected: Math.floor(12 + Math.sin(animationRef.current * 2.5) * 6),
        guaranteeLevel: 100, // Perfect guarantee
        performanceMetrics: {
          exceptionOverhead: 0.5 + Math.sin(animationRef.current) * 0.3,
          safetyCompliance: 100,
          optimizationLevel: 98 + Math.cos(animationRef.current * 2) * 2
        }
      });
    } else if (scenario === 'template_safety') {
      groupRef.current.rotation.y = animationRef.current * 0.5;
      groupRef.current.rotation.x = Math.cos(animationRef.current * 1.3) * 0.12;
      onMetrics({
        exceptionsSuppressed: Math.floor(6 + Math.sin(animationRef.current * 2) * 3),
        stackUnwindings: Math.floor(10 + Math.cos(animationRef.current * 1.8) * 5),
        resourcesProtected: Math.floor(15 + Math.sin(animationRef.current * 2.2) * 8),
        guaranteeLevel: Math.floor(80 + Math.cos(animationRef.current * 2.5) * 12),
        performanceMetrics: {
          exceptionOverhead: 15.5 + Math.sin(animationRef.current * 2.2) * 6.2,
          safetyCompliance: 85 + Math.cos(animationRef.current * 1.5) * 10,
          optimizationLevel: 72 + Math.sin(animationRef.current) * 20
        }
      });
    }
  });

  // Crear geometría para representar exception safety levels
  const createExceptionSafetyGeometry = () => {
    const geometry = new BufferGeometry();
    const vertices = [];
    const colors = [];

    // Crear estructura que representa diferentes niveles de seguridad
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const x = (i - 4.5) * 0.6;
        const y = (j - 4.5) * 0.6;
        const z = Math.sin(i * 0.8 + j * 0.6) * 0.8;

        vertices.push(x, y, z);

        // Colores basados en el escenario de safety
        if (scenario === 'basic_guarantee') {
          colors.push(0.8, 0.4, 0.2); // Naranja (basic)
        } else if (scenario === 'strong_guarantee') {
          colors.push(0.2, 0.8, 0.3); // Verde (strong)
        } else if (scenario === 'two_phase_construction') {
          colors.push(0.3, 0.6, 0.8); // Azul (construction)
        } else if (scenario === 'exception_neutral') {
          colors.push(0.6, 0.3, 0.8); // Púrpura (neutral)
        } else if (scenario === 'noexcept_optimization') {
          colors.push(0.9, 0.9, 0.2); // Amarillo brillante (optimized)
        } else {
          colors.push(0.8, 0.2, 0.6); // Magenta (template)
        }
      }
    }

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    return geometry;
  };

  return (
    <group ref={groupRef}>
      <mesh geometry={createExceptionSafetyGeometry()}>
        <meshStandardMaterial vertexColors />
      </mesh>
      
      {/* Visualización de stack unwinding */}
      <mesh position={[0, 0, 2]}>
        <boxGeometry args={[1.5, 1.5, 0.3]} />
        <meshBasicMaterial color={0x4CAF50} transparent opacity={0.6} />
      </mesh>
      
      {/* Indicador de nivel de garantía */}
      <mesh position={[2, 2, 1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={0xFF9800} />
      </mesh>
    </group>
  );
};

const Lesson87_ExceptionSafeRAII: React.FC = () => {
  const [state, setState] = useState<ExceptionSafeRAIIState>({
    language: 'en',
    scenario: 'basic_guarantee',
    isAnimating: false,
    exceptionsSuppressed: 0,
    stackUnwindings: 0,
    resourcesProtected: 0,
    guaranteeLevel: 0,
    performanceMetrics: {
      exceptionOverhead: 0,
      safetyCompliance: 0,
      optimizationLevel: 0
    }
  });

  const handleVisualizationMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  const changeScenario = useCallback((scenario: ExceptionSafeRAIIState['scenario']) => {
    setState(prev => ({ ...prev, scenario, isAnimating: false }));
  }, []);

  const toggleLanguage = useCallback(() => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'es' : 'en' }));
  }, []);

  return (
    <LessonLayout
      title={state.language === 'en' ? "Exception-Safe RAII" : "RAII Seguro ante Excepciones"}
      lessonNumber={87}
      description={state.language === 'en' 
        ? "Master exception safety guarantees and RAII patterns for robust, exception-safe resource management"
        : "Domina las garantías de seguridad ante excepciones y patrones RAII para gestión robusta de recursos segura ante excepciones"
      }
    >
      <AccessibilityAnnouncer 
        message={state.language === 'en' 
          ? `Exception-Safe RAII lesson loaded. Current scenario: ${state.scenario}`
          : `Lección de RAII Seguro ante Excepciones cargada. Escenario actual: ${state.scenario}`
        }
      />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Learning Objectives' : 'Objetivos de Aprendizaje'}
        </SectionTitle>
        <LearningObjectives
          objectives={state.language === 'en' ? [
            'Understand exception safety levels: basic, strong, and no-throw guarantees',
            'Master strong exception safety guarantee implementation patterns',
            'Learn two-phase construction and exception-safe initialization',
            'Implement exception-safe constructors and destructors',
            'Apply exception neutrality patterns and noexcept optimizations',
            'Design exception-safe template code and container patterns'
          ] : [
            'Comprender niveles de seguridad ante excepciones: básica, fuerte y sin lanzamiento',
            'Dominar patrones de implementación de garantía de seguridad fuerte ante excepciones',
            'Aprender construcción en dos fases e inicialización segura ante excepciones',
            'Implementar constructores y destructores seguros ante excepciones',
            'Aplicar patrones de neutralidad ante excepciones y optimizaciones noexcept',
            'Diseñar código template y patrones de contenedores seguros ante excepciones'
          ]}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive Exception-Safe RAII Visualization' : 'Visualización Interactiva de RAII Seguro ante Excepciones'}
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
            onClick={() => changeScenario('basic_guarantee')} 
            variant={state.scenario === 'basic_guarantee' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Basic Guarantee' : 'Garantía Básica'}
          </Button>
          <Button 
            onClick={() => changeScenario('strong_guarantee')} 
            variant={state.scenario === 'strong_guarantee' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Strong Guarantee' : 'Garantía Fuerte'}
          </Button>
          <Button 
            onClick={() => changeScenario('two_phase_construction')} 
            variant={state.scenario === 'two_phase_construction' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Two-Phase Construction' : 'Construcción en Dos Fases'}
          </Button>
          <Button 
            onClick={() => changeScenario('exception_neutral')} 
            variant={state.scenario === 'exception_neutral' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Exception Neutral' : 'Neutral ante Excepciones'}
          </Button>
          <Button 
            onClick={() => changeScenario('noexcept_optimization')} 
            variant={state.scenario === 'noexcept_optimization' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Noexcept Optimization' : 'Optimización Noexcept'}
          </Button>
          <Button 
            onClick={() => changeScenario('template_safety')} 
            variant={state.scenario === 'template_safety' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Template Safety' : 'Seguridad Template'}
          </Button>
        </ButtonGroup>

        <div style={{ height: '400px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '8px', overflow: 'hidden' }}>
          <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            <ExceptionSafeRAIIVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={handleVisualizationMetrics}
            />
          </Canvas>
        </div>

        <PerformanceMonitor
          metrics={{
            'Exceptions Suppressed': state.exceptionsSuppressed,
            'Stack Unwindings': state.stackUnwindings,
            'Resources Protected': state.resourcesProtected,
            'Guarantee Level (%)': state.guaranteeLevel,
            'Exception Overhead (%)': state.performanceMetrics.exceptionOverhead.toFixed(1),
            'Safety Compliance (%)': state.performanceMetrics.safetyCompliance.toFixed(0),
            'Optimization Level (%)': state.performanceMetrics.optimizationLevel.toFixed(0)
          }}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Exception Safety Guarantees' : 'Garantías de Seguridad ante Excepciones'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <vector>
#include <stdexcept>

// Exception safety levels demonstration
namespace ExceptionSafety {
    
    // 1. NO EXCEPTION SAFETY - BAD!
    class UnsafeResource {
    private:
        int* data_;
        size_t size_;
    public:
        UnsafeResource(size_t size) : size_(size) {
            data_ = new int[size];  // May throw
            // If constructor throws, destructor won't be called
            if (size > 1000) {
                delete[] data_; // Manual cleanup - ERROR PRONE!
                throw std::runtime_error("${state.language === 'en' ? 'Size too large' : 'Tamaño demasiado grande'}");
            }
        }
        
        ~UnsafeResource() {
            delete[] data_;  // May never be called if constructor throws!
        }
    };
    
    // 2. BASIC EXCEPTION SAFETY - Minimal guarantee
    class BasicSafeResource {
    private:
        std::unique_ptr<int[]> data_;
        size_t size_;
    public:
        BasicSafeResource(size_t size) : size_(size) {
            data_ = std::make_unique<int[]>(size);  // RAII - safe even if throws
            
            if (size > 1000) {
                throw std::runtime_error("${state.language === 'en' ? 'Size too large' : 'Tamaño demasiado grande'}");
            }
            // No leaks - data_ destructor cleans up automatically
        }
        
        // Basic guarantee: no leaks, but object may be in valid but undefined state
        void risky_operation() {
            auto temp_data = std::make_unique<int[]>(size_ * 2);
            
            // Some operation that might throw
            if (rand() % 10 == 0) {
                throw std::runtime_error("${state.language === 'en' ? 'Operation failed' : 'Operación falló'}");
            }
            
            // If we get here, replace the data
            data_ = std::move(temp_data);
            size_ *= 2;
        }
    };
    
    // 3. STRONG EXCEPTION SAFETY - Commit or rollback semantics
    class StrongSafeResource {
    private:
        std::unique_ptr<int[]> data_;
        size_t size_;
        
    public:
        StrongSafeResource(size_t size) : size_(size) {
            data_ = std::make_unique<int[]>(size);
            
            if (size > 1000) {
                throw std::runtime_error("${state.language === 'en' ? 'Size too large' : 'Tamaño demasiado grande'}");
            }
        }
        
        // Strong guarantee: Either succeeds completely or leaves object unchanged
        void expand_safely(size_t new_size) {
            if (new_size <= size_) return;
            
            // Create new resource first (may throw)
            auto new_data = std::make_unique<int[]>(new_size);
            
            // Copy existing data (may throw)
            std::copy(data_.get(), data_.get() + size_, new_data.get());
            
            // Additional operations that might throw
            for (size_t i = size_; i < new_size; ++i) {
                new_data[i] = static_cast<int>(i); // Simple initialization
            }
            
            // Only if everything succeeds, commit the changes
            // These operations are no-throw:
            data_ = std::move(new_data);  // noexcept
            size_ = new_size;             // noexcept
            
            std::cout << "${state.language === 'en' ? 'Expansion successful' : 'Expansión exitosa'}" << std::endl;
        }
        
        size_t get_size() const noexcept { return size_; }
    };
    
    // 4. NO-THROW GUARANTEE - Never throws exceptions
    class NoThrowSafeResource {
    private:
        std::unique_ptr<int[]> data_;
        size_t size_;
        size_t capacity_;
        
    public:
        // Constructor can throw (object construction)
        NoThrowSafeResource(size_t initial_capacity) 
            : size_(0), capacity_(initial_capacity) {
            data_ = std::make_unique<int[]>(capacity_);
        }
        
        // All operations after construction are noexcept
        bool try_add_element(int value) noexcept {
            if (size_ >= capacity_) {
                return false;  // Cannot add - no exception thrown
            }
            
            data_[size_++] = value;
            return true;
        }
        
        void clear() noexcept {
            size_ = 0;  // Logical clear - no memory operations
        }
        
        size_t size() const noexcept { return size_; }
        size_t capacity() const noexcept { return capacity_; }
        
        int* begin() noexcept { return data_.get(); }
        int* end() noexcept { return data_.get() + size_; }
        
        // Destructor is implicitly noexcept
        ~NoThrowSafeResource() = default;
    };
}

void demonstrate_exception_safety_levels() {
    std::cout << "${state.language === 'en' ? 'Exception Safety Levels Demonstration' : 'Demostración de Niveles de Seguridad ante Excepciones'}" << std::endl;
    
    // Basic safety example
    try {
        ExceptionSafety::BasicSafeResource basic(500);
        basic.risky_operation();
        std::cout << "${state.language === 'en' ? 'Basic operation completed' : 'Operación básica completada'}" << std::endl;
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Basic operation failed: ' : 'Operación básica falló: '}" << e.what() << std::endl;
    }
    
    // Strong safety example
    try {
        ExceptionSafety::StrongSafeResource strong(100);
        std::cout << "${state.language === 'en' ? 'Initial size: ' : 'Tamaño inicial: '}" << strong.get_size() << std::endl;
        
        strong.expand_safely(200);
        std::cout << "${state.language === 'en' ? 'After expansion: ' : 'Después de expansión: '}" << strong.get_size() << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Strong operation failed: ' : 'Operación fuerte falló: '}" << e.what() << std::endl;
    }
    
    // No-throw guarantee example
    ExceptionSafety::NoThrowSafeResource nothrow(10);
    for (int i = 0; i < 15; ++i) {
        if (nothrow.try_add_element(i * 10)) {
            std::cout << "${state.language === 'en' ? 'Added element: ' : 'Elemento agregado: '}" << i * 10 << std::endl;
        } else {
            std::cout << "${state.language === 'en' ? 'Container full - element not added' : 'Contenedor lleno - elemento no agregado'}" << std::endl;
            break;
        }
    }
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Exception safety guarantees define what happens when exceptions occur. The basic guarantee prevents resource leaks, strong guarantee provides rollback semantics, and no-throw guarantee ensures operations never fail.'
            : 'Las garantías de seguridad ante excepciones definen qué ocurre cuando se producen excepciones. La garantía básica previene fugas de recursos, la garantía fuerte proporciona semántica de rollback, y la garantía de no lanzamiento asegura que las operaciones nunca fallen.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Two-Phase Construction Pattern' : 'Patrón de Construcción en Dos Fases'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <vector>
#include <fstream>
#include <string>

// Two-phase construction for exception-safe initialization
namespace TwoPhaseConstruction {
    
    // Complex resource that requires two-phase construction
    class DatabaseConnection {
    private:
        std::string connection_string_;
        std::unique_ptr<char[]> buffer_;
        bool is_connected_ = false;
        bool is_initialized_ = false;
        
        // Private constructor - only creates object in valid but uninitialized state
        DatabaseConnection() = default;
        
    public:
        // Factory method for safe construction
        static std::unique_ptr<DatabaseConnection> create(const std::string& conn_str) {
            // Phase 1: Create object in safe state
            auto db = std::unique_ptr<DatabaseConnection>(new DatabaseConnection());
            
            // Phase 2: Initialize - if this throws, object is still in valid state
            db->initialize(conn_str);
            
            return db;
        }
        
        // Alternative: Two-step construction with explicit initialization
        static std::unique_ptr<DatabaseConnection> create_deferred(const std::string& conn_str) {
            auto db = std::unique_ptr<DatabaseConnection>(new DatabaseConnection());
            db->connection_string_ = conn_str;
            // Initialization deferred until first use
            return db;
        }
        
    private:
        void initialize(const std::string& conn_str) {
            connection_string_ = conn_str;
            
            // Allocate resources that might throw
            buffer_ = std::make_unique<char[]>(4096);
            
            // Simulate connection process that might fail
            if (conn_str.empty()) {
                throw std::invalid_argument("${state.language === 'en' ? 'Empty connection string' : 'Cadena de conexión vacía'}");
            }
            
            // Complex initialization that might throw
            std::fill(buffer_.get(), buffer_.get() + 4096, 0);
            
            // Only mark as connected if everything succeeded
            is_connected_ = true;
            is_initialized_ = true;
            
            std::cout << "${state.language === 'en' ? 'Database connected: ' : 'Base de datos conectada: '}" 
                      << connection_string_ << std::endl;
        }
        
    public:
        void ensure_initialized() {
            if (!is_initialized_) {
                initialize(connection_string_);
            }
        }
        
        bool is_connected() const noexcept { return is_connected_; }
        
        void execute_query(const std::string& query) {
            ensure_initialized();  // Lazy initialization
            
            if (!is_connected_) {
                throw std::runtime_error("${state.language === 'en' ? 'Not connected' : 'No conectado'}");
            }
            
            std::cout << "${state.language === 'en' ? 'Executing query: ' : 'Ejecutando consulta: '}" 
                      << query << std::endl;
        }
        
        ~DatabaseConnection() noexcept {
            if (is_connected_) {
                std::cout << "${state.language === 'en' ? 'Database connection closed' : 'Conexión de base de datos cerrada'}" << std::endl;
            }
        }
    };
    
    // Two-phase construction for containers
    template<typename T>
    class SafeVector {
    private:
        std::unique_ptr<T[]> data_;
        size_t size_ = 0;
        size_t capacity_ = 0;
        bool is_initialized_ = false;
        
        SafeVector() = default;  // Private default constructor
        
    public:
        // Two-phase factory method
        template<typename... Args>
        static std::unique_ptr<SafeVector<T>> create(size_t initial_capacity, Args&&... args) {
            auto vec = std::unique_ptr<SafeVector<T>>(new SafeVector<T>());
            
            // Phase 1: Allocate memory (may throw)
            vec->data_ = std::make_unique<T[]>(initial_capacity);
            vec->capacity_ = initial_capacity;
            
            // Phase 2: Initialize elements (may throw, but memory is managed)
            for (size_t i = 0; i < initial_capacity; ++i) {
                try {
                    new (&vec->data_[i]) T(args...);  // Placement new
                    ++vec->size_;
                } catch (...) {
                    // Cleanup already constructed elements
                    for (size_t j = 0; j < vec->size_; ++j) {
                        vec->data_[j].~T();
                    }
                    throw;  // Re-throw exception
                }
            }
            
            vec->is_initialized_ = true;
            return vec;
        }
        
        // Copy construction using two-phase pattern
        static std::unique_ptr<SafeVector<T>> create_copy(const SafeVector<T>& other) {
            if (!other.is_initialized_) {
                throw std::logic_error("${state.language === 'en' ? 'Cannot copy uninitialized vector' : 'No se puede copiar vector no inicializado'}");
            }
            
            auto vec = std::unique_ptr<SafeVector<T>>(new SafeVector<T>());
            
            // Phase 1: Allocate
            vec->data_ = std::make_unique<T[]>(other.capacity_);
            vec->capacity_ = other.capacity_;
            
            // Phase 2: Copy elements
            for (size_t i = 0; i < other.size_; ++i) {
                try {
                    new (&vec->data_[i]) T(other.data_[i]);
                    ++vec->size_;
                } catch (...) {
                    // Cleanup on failure
                    for (size_t j = 0; j < vec->size_; ++j) {
                        vec->data_[j].~T();
                    }
                    throw;
                }
            }
            
            vec->is_initialized_ = true;
            return vec;
        }
        
        size_t size() const noexcept { return size_; }
        size_t capacity() const noexcept { return capacity_; }
        
        T& operator[](size_t index) {
            if (!is_initialized_ || index >= size_) {
                throw std::out_of_range("${state.language === 'en' ? 'Index out of range' : 'Índice fuera de rango'}");
            }
            return data_[index];
        }
        
        ~SafeVector() noexcept {
            if (is_initialized_) {
                for (size_t i = 0; i < size_; ++i) {
                    data_[i].~T();
                }
            }
        }
    };
    
    // Builder pattern for complex two-phase construction
    class ConfigurationBuilder {
    private:
        std::string database_url_;
        std::string username_;
        std::string password_;
        int timeout_ = 30;
        bool ssl_enabled_ = false;
        
    public:
        ConfigurationBuilder& database_url(const std::string& url) {
            database_url_ = url;
            return *this;
        }
        
        ConfigurationBuilder& credentials(const std::string& user, const std::string& pass) {
            username_ = user;
            password_ = pass;
            return *this;
        }
        
        ConfigurationBuilder& timeout(int seconds) {
            if (seconds <= 0) {
                throw std::invalid_argument("${state.language === 'en' ? 'Timeout must be positive' : 'Timeout debe ser positivo'}");
            }
            timeout_ = seconds;
            return *this;
        }
        
        ConfigurationBuilder& enable_ssl(bool enabled = true) {
            ssl_enabled_ = enabled;
            return *this;
        }
        
        std::unique_ptr<DatabaseConnection> build() {
            // Validate configuration before construction
            if (database_url_.empty()) {
                throw std::invalid_argument("${state.language === 'en' ? 'Database URL required' : 'URL de base de datos requerida'}");
            }
            
            // Build connection string
            std::string conn_str = database_url_;
            if (ssl_enabled_) {
                conn_str += "?ssl=true";
            }
            conn_str += "&timeout=" + std::to_string(timeout_);
            
            return DatabaseConnection::create(conn_str);
        }
    };
}

void demonstrate_two_phase_construction() {
    std::cout << "${state.language === 'en' ? 'Two-Phase Construction Demonstration' : 'Demostración de Construcción en Dos Fases'}" << std::endl;
    
    try {
        // Direct two-phase construction
        auto db = TwoPhaseConstruction::DatabaseConnection::create("postgresql://localhost:5432/mydb");
        db->execute_query("SELECT * FROM users");
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Database creation failed: ' : 'Creación de base de datos falló: '}" << e.what() << std::endl;
    }
    
    try {
        // Two-phase vector construction
        auto vec = TwoPhaseConstruction::SafeVector<int>::create(5, 42);
        std::cout << "${state.language === 'en' ? 'Vector created with ' : 'Vector creado con '}" << vec->size() 
                  << "${state.language === 'en' ? ' elements' : ' elementos'}" << std::endl;
        
        // Copy construction
        auto vec_copy = TwoPhaseConstruction::SafeVector<int>::create_copy(*vec);
        std::cout << "${state.language === 'en' ? 'Vector copied successfully' : 'Vector copiado exitosamente'}" << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Vector creation failed: ' : 'Creación de vector falló: '}" << e.what() << std::endl;
    }
    
    try {
        // Builder pattern for complex construction
        TwoPhaseConstruction::ConfigurationBuilder builder;
        auto db = builder.database_url("postgresql://localhost:5432/mydb")
                        .credentials("user", "pass")
                        .timeout(60)
                        .enable_ssl(true)
                        .build();
                        
        db->execute_query("SELECT version()");
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Builder construction failed: ' : 'Construcción con builder falló: '}" << e.what() << std::endl;
    }
}`}
        />
        
        <UndefinedBehaviorWarning
          warning={state.language === 'en' 
            ? 'Two-phase construction separates object allocation from initialization to provide strong exception safety. Always ensure objects are in a valid state even if initialization fails.'
            : 'La construcción en dos fases separa la asignación de objetos de la inicialización para proporcionar seguridad fuerte ante excepciones. Siempre asegúrate de que los objetos estén en un estado válido incluso si la inicialización falla.'
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Exception-Safe Assignment Operators' : 'Operadores de Asignación Seguros ante Excepciones'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <algorithm>
#include <stdexcept>

namespace ExceptionSafeAssignment {
    
    // Exception-safe assignment using copy-and-swap idiom
    class SafeResource {
    private:
        std::unique_ptr<int[]> data_;
        size_t size_;
        std::string name_;
        
    public:
        SafeResource(size_t size, const std::string& name) 
            : data_(std::make_unique<int[]>(size)), size_(size), name_(name) {
            std::fill(data_.get(), data_.get() + size_, 0);
        }
        
        // Copy constructor
        SafeResource(const SafeResource& other) 
            : data_(std::make_unique<int[]>(other.size_))
            , size_(other.size_)
            , name_(other.name_) {
            std::copy(other.data_.get(), other.data_.get() + size_, data_.get());
        }
        
        // Exception-safe copy assignment using copy-and-swap
        SafeResource& operator=(const SafeResource& other) {
            // Create a temporary copy (may throw)
            SafeResource temp(other);
            
            // Swap with temporary (noexcept operations)
            swap(temp);
            
            return *this;  // temp destructor cleans up old resources
        }
        
        // Move constructor (noexcept)
        SafeResource(SafeResource&& other) noexcept
            : data_(std::move(other.data_))
            , size_(other.size_)
            , name_(std::move(other.name_)) {
            other.size_ = 0;
        }
        
        // Move assignment (noexcept)
        SafeResource& operator=(SafeResource&& other) noexcept {
            if (this != &other) {
                data_ = std::move(other.data_);
                size_ = other.size_;
                name_ = std::move(other.name_);
                other.size_ = 0;
            }
            return *this;
        }
        
        // Exception-safe swap operation
        void swap(SafeResource& other) noexcept {
            using std::swap;
            swap(data_, other.data_);
            swap(size_, other.size_);
            swap(name_, other.name_);
        }
        
        // Exception-safe modify operations
        void safe_resize(size_t new_size) {
            if (new_size == size_) return;
            
            // Create new resource (strong exception safety)
            auto new_data = std::make_unique<int[]>(new_size);
            
            // Copy existing data
            size_t copy_size = std::min(size_, new_size);
            std::copy(data_.get(), data_.get() + copy_size, new_data.get());
            
            // Initialize new elements if expanding
            if (new_size > size_) {
                std::fill(new_data.get() + size_, new_data.get() + new_size, 0);
            }
            
            // Commit changes (noexcept operations)
            data_ = std::move(new_data);
            size_ = new_size;
        }
        
        size_t size() const noexcept { return size_; }
        const std::string& name() const noexcept { return name_; }
        
        int& operator[](size_t index) {
            if (index >= size_) {
                throw std::out_of_range("${state.language === 'en' ? 'Index out of range' : 'Índice fuera de rango'}");
            }
            return data_[index];
        }
    };
    
    // Template class with exception-safe assignment
    template<typename T>
    class ExceptionSafeContainer {
    private:
        std::unique_ptr<T[]> elements_;
        size_t size_;
        size_t capacity_;
        
        // Helper function for strong exception safety
        void copy_from(const ExceptionSafeContainer& other) {
            if (other.size_ == 0) {
                elements_.reset();
                size_ = 0;
                capacity_ = 0;
                return;
            }
            
            // Allocate new memory (may throw)
            auto new_elements = std::make_unique<T[]>(other.capacity_);
            
            // Copy elements one by one with exception safety
            size_t copied = 0;
            try {
                for (size_t i = 0; i < other.size_; ++i) {
                    new_elements[i] = other.elements_[i];  // May throw
                    ++copied;
                }
            } catch (...) {
                // Cleanup partially copied elements
                for (size_t i = 0; i < copied; ++i) {
                    new_elements[i].~T();
                }
                throw;  // Re-throw
            }
            
            // Commit (noexcept operations)
            elements_ = std::move(new_elements);
            size_ = other.size_;
            capacity_ = other.capacity_;
        }
        
    public:
        ExceptionSafeContainer() : size_(0), capacity_(0) {}
        
        explicit ExceptionSafeContainer(size_t initial_capacity) 
            : elements_(std::make_unique<T[]>(initial_capacity))
            , size_(0)
            , capacity_(initial_capacity) {}
        
        // Copy constructor with strong exception safety
        ExceptionSafeContainer(const ExceptionSafeContainer& other) {
            copy_from(other);
        }
        
        // Exception-safe assignment operator
        ExceptionSafeContainer& operator=(const ExceptionSafeContainer& other) {
            if (this != &other) {
                ExceptionSafeContainer temp;
                temp.copy_from(other);  // May throw, but doesn't affect *this
                
                swap(temp);  // noexcept swap
            }
            return *this;
        }
        
        // Move semantics (noexcept)
        ExceptionSafeContainer(ExceptionSafeContainer&& other) noexcept
            : elements_(std::move(other.elements_))
            , size_(other.size_)
            , capacity_(other.capacity_) {
            other.size_ = 0;
            other.capacity_ = 0;
        }
        
        ExceptionSafeContainer& operator=(ExceptionSafeContainer&& other) noexcept {
            if (this != &other) {
                elements_ = std::move(other.elements_);
                size_ = other.size_;
                capacity_ = other.capacity_;
                other.size_ = 0;
                other.capacity_ = 0;
            }
            return *this;
        }
        
        void swap(ExceptionSafeContainer& other) noexcept {
            using std::swap;
            swap(elements_, other.elements_);
            swap(size_, other.size_);
            swap(capacity_, other.capacity_);
        }
        
        // Exception-safe push_back with strong guarantee
        void push_back(const T& value) {
            if (size_ >= capacity_) {
                // Need to grow - use strong exception safety
                size_t new_capacity = capacity_ == 0 ? 1 : capacity_ * 2;
                
                auto new_elements = std::make_unique<T[]>(new_capacity);
                
                // Copy existing elements
                for (size_t i = 0; i < size_; ++i) {
                    try {
                        new_elements[i] = elements_[i];
                    } catch (...) {
                        // Clean up partially copied elements
                        for (size_t j = 0; j < i; ++j) {
                            new_elements[j].~T();
                        }
                        throw;
                    }
                }
                
                // Add new element
                try {
                    new_elements[size_] = value;
                } catch (...) {
                    // Clean up all elements
                    for (size_t i = 0; i < size_; ++i) {
                        new_elements[i].~T();
                    }
                    throw;
                }
                
                // Commit (noexcept operations)
                elements_ = std::move(new_elements);
                capacity_ = new_capacity;
                ++size_;
            } else {
                // Simple case - just add element
                elements_[size_] = value;  // May throw, but object state unchanged
                ++size_;  // Only increment if assignment succeeded
            }
        }
        
        size_t size() const noexcept { return size_; }
        size_t capacity() const noexcept { return capacity_; }
        bool empty() const noexcept { return size_ == 0; }
        
        T& operator[](size_t index) {
            if (index >= size_) {
                throw std::out_of_range("${state.language === 'en' ? 'Index out of range' : 'Índice fuera de rango'}");
            }
            return elements_[index];
        }
        
        const T& operator[](size_t index) const {
            if (index >= size_) {
                throw std::out_of_range("${state.language === 'en' ? 'Index out of range' : 'Índice fuera de rango'}");
            }
            return elements_[index];
        }
    };
}

void demonstrate_exception_safe_assignment() {
    std::cout << "${state.language === 'en' ? 'Exception-Safe Assignment Demonstration' : 'Demostración de Asignación Segura ante Excepciones'}" << std::endl;
    
    try {
        // Test copy-and-swap assignment
        ExceptionSafeAssignment::SafeResource resource1(100, "Resource1");
        ExceptionSafeAssignment::SafeResource resource2(50, "Resource2");
        
        std::cout << "${state.language === 'en' ? 'Before assignment - Resource1 size: ' : 'Antes de asignación - Tamaño Resource1: '}" 
                  << resource1.size() << std::endl;
        
        resource1 = resource2;  // Exception-safe assignment
        
        std::cout << "${state.language === 'en' ? 'After assignment - Resource1 size: ' : 'Después de asignación - Tamaño Resource1: '}" 
                  << resource1.size() << std::endl;
        
        // Test safe resize
        resource1.safe_resize(200);
        std::cout << "${state.language === 'en' ? 'After resize - Resource1 size: ' : 'Después de redimensión - Tamaño Resource1: '}" 
                  << resource1.size() << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Assignment operation failed: ' : 'Operación de asignación falló: '}" << e.what() << std::endl;
    }
    
    try {
        // Test exception-safe container
        ExceptionSafeAssignment::ExceptionSafeContainer<std::string> container1;
        container1.push_back("Hello");
        container1.push_back("World");
        
        ExceptionSafeAssignment::ExceptionSafeContainer<std::string> container2;
        container2.push_back("Foo");
        container2.push_back("Bar");
        container2.push_back("Baz");
        
        std::cout << "${state.language === 'en' ? 'Container1 size before assignment: ' : 'Tamaño Container1 antes de asignación: '}" 
                  << container1.size() << std::endl;
        
        container1 = container2;  // Exception-safe assignment
        
        std::cout << "${state.language === 'en' ? 'Container1 size after assignment: ' : 'Tamaño Container1 después de asignación: '}" 
                  << container1.size() << std::endl;
        
        // Test exception safety during growth
        for (int i = 0; i < 10; ++i) {
            container1.push_back("Item " + std::to_string(i));
        }
        
        std::cout << "${state.language === 'en' ? 'Final container size: ' : 'Tamaño final del contenedor: '}" 
                  << container1.size() << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Container operation failed: ' : 'Operación de contenedor falló: '}" << e.what() << std::endl;
    }
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Exception-safe assignment operators use the copy-and-swap idiom to provide strong exception safety. This technique ensures that either the assignment succeeds completely or the object remains in its original state.'
            : 'Los operadores de asignación seguros ante excepciones usan el modismo copy-and-swap para proporcionar seguridad fuerte ante excepciones. Esta técnica asegura que o la asignación tiene éxito completamente o el objeto permanece en su estado original.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Exception Neutrality and noexcept' : 'Neutralidad ante Excepciones y noexcept'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <vector>
#include <type_traits>
#include <utility>

namespace ExceptionNeutrality {
    
    // Exception-neutral template function
    template<typename Container, typename Predicate>
    void for_each_if(Container& container, Predicate pred) 
        noexcept(noexcept(pred(*container.begin()))) {
        for (auto& element : container) {
            if (pred(element)) {  // May throw - but we don't handle it
                // Just let exception propagate
                std::cout << "${state.language === 'en' ? 'Processing element' : 'Procesando elemento'}" << std::endl;
            }
        }
    }
    
    // Exception-neutral wrapper with perfect forwarding
    template<typename F, typename... Args>
    auto safe_invoke(F&& func, Args&&... args) 
        noexcept(noexcept(std::forward<F>(func)(std::forward<Args>(args)...)))
        -> decltype(std::forward<F>(func)(std::forward<Args>(args)...)) {
        
        static_assert(std::is_nothrow_destructible_v<F>, 
            "Function object must have noexcept destructor");
        
        // Simply forward the call - don't catch exceptions
        return std::forward<F>(func)(std::forward<Args>(args)...);
    }
    
    // Smart pointer with conditional noexcept
    template<typename T, typename Deleter = std::default_delete<T>>
    class conditional_unique_ptr {
    private:
        std::unique_ptr<T, Deleter> ptr_;
        
    public:
        conditional_unique_ptr() = default;
        
        explicit conditional_unique_ptr(T* p) noexcept : ptr_(p) {}
        
        conditional_unique_ptr(T* p, const Deleter& d) 
            noexcept(std::is_nothrow_copy_constructible_v<Deleter>)
            : ptr_(p, d) {}
        
        conditional_unique_ptr(T* p, Deleter&& d) 
            noexcept(std::is_nothrow_move_constructible_v<Deleter>)
            : ptr_(p, std::move(d)) {}
        
        // Move constructor - conditionally noexcept
        conditional_unique_ptr(conditional_unique_ptr&& other) 
            noexcept(std::is_nothrow_move_constructible_v<std::unique_ptr<T, Deleter>>)
            : ptr_(std::move(other.ptr_)) {}
        
        // Move assignment - conditionally noexcept
        conditional_unique_ptr& operator=(conditional_unique_ptr&& other) 
            noexcept(std::is_nothrow_move_assignable_v<std::unique_ptr<T, Deleter>>) {
            ptr_ = std::move(other.ptr_);
            return *this;
        }
        
        // Observers
        T* get() const noexcept { return ptr_.get(); }
        T& operator*() const noexcept(noexcept(*ptr_)) { return *ptr_; }
        T* operator->() const noexcept { return ptr_.get(); }
        explicit operator bool() const noexcept { return static_cast<bool>(ptr_); }
        
        // Modifiers
        T* release() noexcept { return ptr_.release(); }
        void reset(T* p = nullptr) noexcept { ptr_.reset(p); }
        
        void swap(conditional_unique_ptr& other) 
            noexcept(noexcept(ptr_.swap(other.ptr_))) {
            ptr_.swap(other.ptr_);
        }
    };
    
    // Exception-neutral algorithm with strong guarantee
    template<typename InputIt, typename OutputIt, typename UnaryOperation>
    OutputIt transform_safe(InputIt first, InputIt last, OutputIt d_first, UnaryOperation op) {
        // Use temporary storage for strong exception safety
        std::vector<typename std::iterator_traits<OutputIt>::value_type> temp;
        temp.reserve(std::distance(first, last));
        
        // Transform into temporary storage (may throw)
        for (auto it = first; it != last; ++it) {
            temp.push_back(op(*it));  // May throw, but temp handles cleanup
        }
        
        // Copy to destination (may throw, but temp is complete)
        return std::copy(temp.begin(), temp.end(), d_first);
    }
    
    // RAII class with conditional noexcept destructor
    template<typename Resource, typename Cleanup>
    class resource_guard {
    private:
        Resource resource_;
        Cleanup cleanup_;
        bool engaged_ = true;
        
    public:
        resource_guard(Resource r, Cleanup c) 
            noexcept(std::is_nothrow_move_constructible_v<Resource> &&
                    std::is_nothrow_move_constructible_v<Cleanup>)
            : resource_(std::move(r)), cleanup_(std::move(c)) {}
        
        ~resource_guard() noexcept(noexcept(cleanup_(resource_))) {
            if (engaged_) {
                // Conditional noexcept based on cleanup function
                cleanup_(resource_);
            }
        }
        
        // Move-only semantics
        resource_guard(const resource_guard&) = delete;
        resource_guard& operator=(const resource_guard&) = delete;
        
        resource_guard(resource_guard&& other) 
            noexcept(std::is_nothrow_move_constructible_v<Resource> &&
                    std::is_nothrow_move_constructible_v<Cleanup>)
            : resource_(std::move(other.resource_))
            , cleanup_(std::move(other.cleanup_))
            , engaged_(other.engaged_) {
            other.engaged_ = false;
        }
        
        resource_guard& operator=(resource_guard&& other) 
            noexcept(std::is_nothrow_move_assignable_v<Resource> &&
                    std::is_nothrow_move_assignable_v<Cleanup>) {
            if (this != &other) {
                if (engaged_) {
                    cleanup_(resource_);
                }
                resource_ = std::move(other.resource_);
                cleanup_ = std::move(other.cleanup_);
                engaged_ = other.engaged_;
                other.engaged_ = false;
            }
            return *this;
        }
        
        Resource& get() noexcept { return resource_; }
        const Resource& get() const noexcept { return resource_; }
        
        void release() noexcept { engaged_ = false; }
    };
    
    // Factory function with deduced noexcept
    template<typename Resource, typename Cleanup>
    auto make_resource_guard(Resource&& r, Cleanup&& c) 
        noexcept(std::is_nothrow_constructible_v<
            resource_guard<std::decay_t<Resource>, std::decay_t<Cleanup>>,
            Resource, Cleanup>) {
        return resource_guard<std::decay_t<Resource>, std::decay_t<Cleanup>>(
            std::forward<Resource>(r), std::forward<Cleanup>(c));
    }
    
    // Exception-neutral container operations
    template<typename T>
    class exception_neutral_vector {
    private:
        std::vector<T> data_;
        
    public:
        // Constructors with conditional noexcept
        exception_neutral_vector() noexcept(noexcept(std::vector<T>{})) = default;
        
        explicit exception_neutral_vector(size_t count) : data_(count) {}
        
        exception_neutral_vector(size_t count, const T& value) : data_(count, value) {}
        
        template<typename InputIt>
        exception_neutral_vector(InputIt first, InputIt last) : data_(first, last) {}
        
        // Element access
        T& at(size_t pos) { return data_.at(pos); }
        const T& at(size_t pos) const { return data_.at(pos); }
        
        T& operator[](size_t pos) noexcept { return data_[pos]; }
        const T& operator[](size_t pos) const noexcept { return data_[pos]; }
        
        // Modifiers with exception neutrality
        void push_back(const T& value) { data_.push_back(value); }
        void push_back(T&& value) { data_.push_back(std::move(value)); }
        
        template<typename... Args>
        void emplace_back(Args&&... args) { data_.emplace_back(std::forward<Args>(args)...); }
        
        void pop_back() noexcept { data_.pop_back(); }
        
        // Exception-neutral clear operation
        void clear() noexcept(noexcept(data_.clear())) { data_.clear(); }
        
        // Capacity
        size_t size() const noexcept { return data_.size(); }
        bool empty() const noexcept { return data_.empty(); }
        void reserve(size_t new_cap) { data_.reserve(new_cap); }
        
        // Iterator access
        auto begin() noexcept -> decltype(data_.begin()) { return data_.begin(); }
        auto end() noexcept -> decltype(data_.end()) { return data_.end(); }
        auto begin() const noexcept -> decltype(data_.begin()) { return data_.begin(); }
        auto end() const noexcept -> decltype(data_.end()) { return data_.end(); }
    };
}

void demonstrate_exception_neutrality() {
    std::cout << "${state.language === 'en' ? 'Exception Neutrality and noexcept Demonstration' : 'Demostración de Neutralidad ante Excepciones y noexcept'}" << std::endl;
    
    // Test exception-neutral algorithms
    try {
        std::vector<int> numbers = {1, 2, 3, 4, 5};
        
        // Exception-neutral predicate
        auto is_even = [](int x) noexcept { return x % 2 == 0; };
        
        ExceptionNeutrality::for_each_if(numbers, is_even);
        
        // Safe function invocation
        auto multiply_by_2 = [](int x) noexcept { return x * 2; };
        int result = ExceptionNeutrality::safe_invoke(multiply_by_2, 21);
        std::cout << "${state.language === 'en' ? 'Safe invoke result: ' : 'Resultado de invocación segura: '}" << result << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Neutral operation failed: ' : 'Operación neutral falló: '}" << e.what() << std::endl;
    }
    
    // Test conditional unique_ptr
    {
        auto deleter = [](int* p) noexcept { 
            std::cout << "${state.language === 'en' ? 'Custom deleter called' : 'Deleter personalizado llamado'}" << std::endl;
            delete p; 
        };
        
        ExceptionNeutrality::conditional_unique_ptr<int, decltype(deleter)> ptr(new int(42), deleter);
        std::cout << "${state.language === 'en' ? 'Value: ' : 'Valor: '}" << *ptr << std::endl;
        
        // Move operation
        auto ptr2 = std::move(ptr);
        std::cout << "${state.language === 'en' ? 'Moved value: ' : 'Valor movido: '}" << *ptr2 << std::endl;
    }
    
    // Test resource guard
    {
        std::string resource = "Database Connection";
        auto cleanup = [](const std::string& r) noexcept {
            std::cout << "${state.language === 'en' ? 'Cleaning up: ' : 'Limpiando: '}" << r << std::endl;
        };
        
        auto guard = ExceptionNeutrality::make_resource_guard(resource, cleanup);
        std::cout << "${state.language === 'en' ? 'Using resource: ' : 'Usando recurso: '}" << guard.get() << std::endl;
        
        // Guard will automatically clean up when it goes out of scope
    }
    
    // Test exception-neutral vector
    try {
        ExceptionNeutrality::exception_neutral_vector<std::string> vec;
        vec.push_back("Hello");
        vec.push_back("World");
        vec.emplace_back("Exception");
        vec.emplace_back("Safety");
        
        std::cout << "${state.language === 'en' ? 'Vector contents: ' : 'Contenidos del vector: '}";
        for (const auto& item : vec) {
            std::cout << item << " ";
        }
        std::cout << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Vector operation failed: ' : 'Operación de vector falló: '}" << e.what() << std::endl;
    }
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Exception neutrality means functions don\'t handle exceptions themselves but allow them to propagate safely. The noexcept specifier enables optimizations and provides compile-time guarantees about exception safety.'
            : 'La neutralidad ante excepciones significa que las funciones no manejan excepciones por sí mismas sino que permiten que se propaguen de manera segura. El especificador noexcept habilita optimizaciones y proporciona garantías en tiempo de compilación sobre seguridad ante excepciones.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Template Exception Safety' : 'Seguridad ante Excepciones en Templates'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <vector>
#include <type_traits>
#include <utility>
#include <stdexcept>

namespace TemplateSafety {
    
    // SFINAE-based exception safety checking
    template<typename T>
    struct has_nothrow_copy_constructor {
        static constexpr bool value = std::is_nothrow_copy_constructible_v<T>;
    };
    
    template<typename T>
    struct has_nothrow_move_constructor {
        static constexpr bool value = std::is_nothrow_move_constructible_v<T>;
    };
    
    // Exception-safe template container with different strategies
    template<typename T, bool UseStrongGuarantee = true>
    class safe_container {
    private:
        std::unique_ptr<T[]> data_;
        size_t size_ = 0;
        size_t capacity_ = 0;
        
        // Strategy selection based on type properties
        template<typename U = T>
        typename std::enable_if_t<std::is_nothrow_move_constructible_v<U>>
        grow_with_move(size_t new_capacity) {
            auto new_data = std::make_unique<T[]>(new_capacity);
            
            // Move elements (noexcept)
            for (size_t i = 0; i < size_; ++i) {
                new_data[i] = std::move(data_[i]);
            }
            
            data_ = std::move(new_data);
            capacity_ = new_capacity;
        }
        
        template<typename U = T>
        typename std::enable_if_t<!std::is_nothrow_move_constructible_v<U> && 
                                 std::is_copy_constructible_v<U>>
        grow_with_copy(size_t new_capacity) {
            auto new_data = std::make_unique<T[]>(new_capacity);
            
            // Copy elements (may throw, but provides strong guarantee)
            size_t copied = 0;
            try {
                for (size_t i = 0; i < size_; ++i) {
                    new_data[i] = data_[i];  // May throw
                    ++copied;
                }
            } catch (...) {
                // Clean up partially copied elements
                for (size_t i = 0; i < copied; ++i) {
                    new_data[i].~T();
                }
                throw;  // Strong guarantee maintained
            }
            
            data_ = std::move(new_data);
            capacity_ = new_capacity;
        }
        
        void grow_capacity() {
            size_t new_capacity = capacity_ == 0 ? 4 : capacity_ * 2;
            
            if constexpr (std::is_nothrow_move_constructible_v<T>) {
                grow_with_move(new_capacity);
            } else if constexpr (std::is_copy_constructible_v<T>) {
                grow_with_copy(new_capacity);
            } else {
                static_assert(std::is_copy_constructible_v<T>, 
                    "T must be copy constructible if not nothrow move constructible");
            }
        }
        
    public:
        safe_container() = default;
        
        explicit safe_container(size_t initial_capacity) 
            : data_(std::make_unique<T[]>(initial_capacity))
            , capacity_(initial_capacity) {}
        
        // Template constructor with perfect forwarding
        template<typename... Args>
        explicit safe_container(size_t count, Args&&... args) {
            if (count > 0) {
                data_ = std::make_unique<T[]>(count);
                capacity_ = count;
                
                size_t constructed = 0;
                try {
                    for (size_t i = 0; i < count; ++i) {
                        new (&data_[i]) T(std::forward<Args>(args)...);
                        ++constructed;
                        ++size_;
                    }
                } catch (...) {
                    // Clean up constructed elements
                    for (size_t i = 0; i < constructed; ++i) {
                        data_[i].~T();
                    }
                    size_ = 0;
                    throw;
                }
            }
        }
        
        // Exception-safe push_back with conditional noexcept
        template<typename U>
        void push_back(U&& value) 
            noexcept(UseStrongGuarantee && 
                    std::is_nothrow_constructible_v<T, U> && 
                    (std::is_nothrow_move_constructible_v<T> || 
                     std::is_nothrow_copy_constructible_v<T>)) {
                     
            if (size_ >= capacity_) {
                if constexpr (UseStrongGuarantee) {
                    grow_capacity();  // May throw, but provides strong guarantee
                } else {
                    // Basic guarantee version - faster but less safe
                    size_t new_capacity = capacity_ == 0 ? 4 : capacity_ * 2;
                    auto new_data = std::make_unique<T[]>(new_capacity);
                    
                    // Move/copy existing elements without exception safety
                    for (size_t i = 0; i < size_; ++i) {
                        if constexpr (std::is_nothrow_move_constructible_v<T>) {
                            new_data[i] = std::move(data_[i]);
                        } else {
                            new_data[i] = data_[i];  // May leave container in inconsistent state
                        }
                    }
                    
                    data_ = std::move(new_data);
                    capacity_ = new_capacity;
                }
            }
            
            // Construct new element
            if constexpr (UseStrongGuarantee) {
                try {
                    data_[size_] = std::forward<U>(value);
                    ++size_;
                } catch (...) {
                    // Strong guarantee maintained - size not incremented
                    throw;
                }
            } else {
                data_[size_++] = std::forward<U>(value);  // Basic guarantee
            }
        }
        
        // Template emplace_back
        template<typename... Args>
        void emplace_back(Args&&... args) 
            noexcept(UseStrongGuarantee && 
                    std::is_nothrow_constructible_v<T, Args...> && 
                    (std::is_nothrow_move_constructible_v<T> || 
                     std::is_nothrow_copy_constructible_v<T>)) {
                     
            if (size_ >= capacity_) {
                grow_capacity();
            }
            
            if constexpr (UseStrongGuarantee) {
                try {
                    new (&data_[size_]) T(std::forward<Args>(args)...);
                    ++size_;
                } catch (...) {
                    throw;
                }
            } else {
                new (&data_[size_++]) T(std::forward<Args>(args)...);
            }
        }
        
        // Exception-safe element access
        T& at(size_t index) {
            if (index >= size_) {
                throw std::out_of_range("${state.language === 'en' ? 'Index out of range' : 'Índice fuera de rango'}");
            }
            return data_[index];
        }
        
        const T& at(size_t index) const {
            if (index >= size_) {
                throw std::out_of_range("${state.language === 'en' ? 'Index out of range' : 'Índice fuera de rango'}");
            }
            return data_[index];
        }
        
        // Safe accessors
        T& operator[](size_t index) noexcept { return data_[index]; }
        const T& operator[](size_t index) const noexcept { return data_[index]; }
        
        size_t size() const noexcept { return size_; }
        size_t capacity() const noexcept { return capacity_; }
        bool empty() const noexcept { return size_ == 0; }
        
        // Iterator support
        T* begin() noexcept { return data_.get(); }
        T* end() noexcept { return data_.get() + size_; }
        const T* begin() const noexcept { return data_.get(); }
        const T* end() const noexcept { return data_.get() + size_; }
        
        // Clear with conditional noexcept
        void clear() noexcept(std::is_nothrow_destructible_v<T>) {
            if constexpr (std::is_nothrow_destructible_v<T>) {
                for (size_t i = 0; i < size_; ++i) {
                    data_[i].~T();
                }
                size_ = 0;
            } else {
                // Destructors may throw - handle carefully
                size_t original_size = size_;
                size_ = 0;  // Update size first
                
                for (size_t i = 0; i < original_size; ++i) {
                    try {
                        data_[i].~T();
                    } catch (...) {
                        // Log error but continue destructing other elements
                    }
                }
            }
        }
        
        ~safe_container() {
            clear();
        }
    };
    
    // Template function with exception safety constraints
    template<typename InputIt, typename OutputIt, typename UnaryOp>
    OutputIt transform_with_safety(InputIt first, InputIt last, OutputIt d_first, UnaryOp op) {
        using input_type = typename std::iterator_traits<InputIt>::value_type;
        using result_type = decltype(op(*first));
        
        static_assert(std::is_destructible_v<result_type>, 
            "Transform result type must be destructible");
        
        if constexpr (std::is_nothrow_invocable_v<UnaryOp, input_type>) {
            // Fast path - no exception safety concerns
            for (; first != last; ++first, ++d_first) {
                *d_first = op(*first);
            }
            return d_first;
        } else {
            // Slow path with strong exception safety
            std::vector<result_type> temp;
            temp.reserve(std::distance(first, last));
            
            for (auto it = first; it != last; ++it) {
                temp.push_back(op(*it));  // May throw
            }
            
            return std::move(temp.begin(), temp.end(), d_first);
        }
    }
    
    // Exception-safe template swap
    template<typename T>
    void safe_swap(T& a, T& b) noexcept(std::is_nothrow_move_constructible_v<T> && 
                                       std::is_nothrow_move_assignable_v<T>) {
        if constexpr (std::is_nothrow_move_constructible_v<T> && 
                     std::is_nothrow_move_assignable_v<T>) {
            T temp = std::move(a);
            a = std::move(b);
            b = std::move(temp);
        } else {
            // Fallback to copy-based swap (may throw)
            T temp = a;  // May throw
            a = b;       // May throw
            b = temp;    // May throw
        }
    }
}

void demonstrate_template_safety() {
    std::cout << "${state.language === 'en' ? 'Template Exception Safety Demonstration' : 'Demostración de Seguridad ante Excepciones en Templates'}" << std::endl;
    
    // Test with nothrow type
    try {
        TemplateSafety::safe_container<int, true> container_int;
        for (int i = 0; i < 10; ++i) {
            container_int.push_back(i * 10);
        }
        
        std::cout << "${state.language === 'en' ? 'Integer container size: ' : 'Tamaño contenedor enteros: '}" 
                  << container_int.size() << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Integer container failed: ' : 'Contenedor enteros falló: '}" << e.what() << std::endl;
    }
    
    // Test with potentially throwing type
    try {
        TemplateSafety::safe_container<std::string, true> container_string;
        container_string.emplace_back("Hello");
        container_string.emplace_back("Template");
        container_string.emplace_back("Exception");
        container_string.emplace_back("Safety");
        
        std::cout << "${state.language === 'en' ? 'String container contents: ' : 'Contenidos contenedor strings: '}";
        for (const auto& str : container_string) {
            std::cout << str << " ";
        }
        std::cout << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'String container failed: ' : 'Contenedor strings falló: '}" << e.what() << std::endl;
    }
    
    // Test template transform with exception safety
    try {
        std::vector<int> input = {1, 2, 3, 4, 5};
        std::vector<std::string> output;
        output.resize(input.size());
        
        auto to_string = [](int x) { return std::to_string(x * x); };
        
        TemplateSafety::transform_with_safety(
            input.begin(), input.end(),
            output.begin(),
            to_string
        );
        
        std::cout << "${state.language === 'en' ? 'Transform result: ' : 'Resultado transformación: '}";
        for (const auto& s : output) {
            std::cout << s << " ";
        }
        std::cout << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Transform failed: ' : 'Transformación falló: '}" << e.what() << std::endl;
    }
    
    // Test safe swap
    try {
        std::string a = "Hello";
        std::string b = "World";
        
        std::cout << "${state.language === 'en' ? 'Before swap: ' : 'Antes de intercambio: '}" << a << ", " << b << std::endl;
        
        TemplateSafety::safe_swap(a, b);
        
        std::cout << "${state.language === 'en' ? 'After swap: ' : 'Después de intercambio: '}" << a << ", " << b << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "${state.language === 'en' ? 'Swap failed: ' : 'Intercambio falló: '}" << e.what() << std::endl;
    }
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Template exception safety requires careful consideration of type properties and constraints. Using SFINAE, concepts, and conditional noexcept allows templates to adapt their exception safety guarantees based on the types they are instantiated with.'
            : 'La seguridad ante excepciones en templates requiere consideración cuidadosa de propiedades y restricciones de tipos. Usar SFINAE, concepts y noexcept condicional permite que los templates adapten sus garantías de seguridad ante excepciones basándose en los tipos con los que se instancian.'
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
              name: state.language === 'en' ? 'No Exception Safety' : 'Sin Seguridad ante Excepciones',
              complexity: 'O(1)',
              performance: 100,
              description: state.language === 'en' 
                ? 'Fastest but unsafe - resource leaks and undefined behavior on exceptions'
                : 'Más rápido pero inseguro - fugas de recursos y comportamiento indefinido ante excepciones'
            },
            {
              name: state.language === 'en' ? 'Basic Exception Safety' : 'Seguridad Básica ante Excepciones',
              complexity: 'O(1)',
              performance: 90,
              description: state.language === 'en' 
                ? 'Prevents resource leaks but may leave objects in undefined state'
                : 'Previene fugas de recursos pero puede dejar objetos en estado indefinido'
            },
            {
              name: state.language === 'en' ? 'Strong Exception Safety' : 'Seguridad Fuerte ante Excepciones',
              complexity: 'O(n)',
              performance: 75,
              description: state.language === 'en' 
                ? 'Commit-or-rollback semantics with temporary storage overhead'
                : 'Semántica commit-or-rollback con sobrecarga de almacenamiento temporal'
            },
            {
              name: state.language === 'en' ? 'No-Throw Guarantee' : 'Garantía de No Lanzamiento',
              complexity: 'O(1)',
              performance: 95,
              description: state.language === 'en' 
                ? 'Fastest safe option - enables compiler optimizations'
                : 'Opción segura más rápida - habilita optimizaciones del compilador'
            },
            {
              name: state.language === 'en' ? 'Template Safety' : 'Seguridad Template',
              complexity: 'O(1) to O(n)',
              performance: 85,
              description: state.language === 'en' 
                ? 'Adaptive safety level based on type properties'
                : 'Nivel de seguridad adaptativo basado en propiedades del tipo'
            }
          ]}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Practical Exercises' : 'Ejercicios Prácticos'}
        </SectionTitle>
        
        <InteractiveSection>
          <h4>{state.language === 'en' ? 'Exercise 1: Exception-Safe Smart Pointer' : 'Ejercicio 1: Smart Pointer Seguro ante Excepciones'}</h4>
          <p>
            {state.language === 'en' 
              ? 'Implement an exception-safe smart pointer that provides strong exception safety guarantees for all operations.'
              : 'Implementa un smart pointer seguro ante excepciones que proporcione garantías de seguridad fuerte ante excepciones para todas las operaciones.'
            }
          </p>
          
          <CodeBlock
            language="cpp"
            code={`// Your implementation here
template<typename T>
class exception_safe_ptr {
private:
    T* ptr_ = nullptr;
    
    // TODO: Implement exception-safe construction and assignment
    
public:
    // Constructors with exception safety
    exception_safe_ptr() noexcept = default;
    explicit exception_safe_ptr(T* p);
    
    // Copy semantics with strong exception safety
    exception_safe_ptr(const exception_safe_ptr& other);
    exception_safe_ptr& operator=(const exception_safe_ptr& other);
    
    // Move semantics (should be noexcept)
    exception_safe_ptr(exception_safe_ptr&& other) noexcept;
    exception_safe_ptr& operator=(exception_safe_ptr&& other) noexcept;
    
    // Exception-safe operations
    void reset(T* p = nullptr);
    T* release() noexcept;
    void swap(exception_safe_ptr& other) noexcept;
    
    // Observers
    T* get() const noexcept;
    T& operator*() const noexcept;
    T* operator->() const noexcept;
    explicit operator bool() const noexcept;
    
    ~exception_safe_ptr();
    
private:
    // TODO: Implement copy-and-swap helper
    void copy_from(const exception_safe_ptr& other);
};

// Test the implementation
void test_exception_safe_ptr() {
    try {
        exception_safe_ptr<int> ptr1(new int(42));
        exception_safe_ptr<int> ptr2;
        
        ptr2 = ptr1;  // Should use strong exception safety
        
        // Test exception scenarios...
    } catch (const std::exception& e) {
        std::cout << "Test failed: " << e.what() << std::endl;
    }
}`}
          />
          
          <h4>{state.language === 'en' ? 'Exercise 2: Exception-Safe Container Resize' : 'Ejercicio 2: Redimensión de Contenedor Segura ante Excepciones'}</h4>
          <p>
            {state.language === 'en' 
              ? 'Implement an exception-safe resize operation for a custom container that provides strong exception safety guarantees.'
              : 'Implementa una operación de redimensión segura ante excepciones para un contenedor personalizado que proporcione garantías de seguridad fuerte ante excepciones.'
            }
          </p>
          
          <CodeBlock
            language="cpp"
            code={`// Your implementation here
template<typename T>
class safe_dynamic_array {
private:
    std::unique_ptr<T[]> data_;
    size_t size_ = 0;
    size_t capacity_ = 0;
    
public:
    safe_dynamic_array() = default;
    explicit safe_dynamic_array(size_t initial_capacity);
    
    // Exception-safe resize with strong guarantee
    void resize(size_t new_size);
    void resize(size_t new_size, const T& value);
    
    // Exception-safe reserve operation
    void reserve(size_t new_capacity);
    
    // Element access
    T& operator[](size_t index) noexcept;
    const T& operator[](size_t index) const noexcept;
    T& at(size_t index);
    const T& at(size_t index) const;
    
    // Capacity
    size_t size() const noexcept { return size_; }
    size_t capacity() const noexcept { return capacity_; }
    
private:
    // TODO: Implement strong exception safety helpers
    void grow_to_capacity(size_t new_capacity);
    void construct_range(T* dest, size_t count, const T& value);
};

// Test the implementation
void test_safe_resize() {
    try {
        safe_dynamic_array<std::string> arr(10);
        
        // Test various resize scenarios
        arr.resize(20, "default");
        arr.resize(5);
        arr.resize(50);
        
        std::cout << "Resize tests completed successfully" << std::endl;
        
    } catch (const std::exception& e) {
        std::cout << "Resize test failed: " << e.what() << std::endl;
    }
}`}
          />
        </InteractiveSection>
      </Section>
    </LessonLayout>
  );
};

export default Lesson87_ExceptionSafeRAII;