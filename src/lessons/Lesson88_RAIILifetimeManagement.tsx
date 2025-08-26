/**
 * Lesson 88: RAII Lifetime Management
 * Advanced lifetime management patterns with RAII for deterministic resource control
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

interface RAIILifetimeManagementState {
  language: 'en' | 'es';
  scenario: 'object_lifetime' | 'scope_based' | 'lifetime_extension' | 'weak_references' | 'circular_breaking' | 'thread_safe_lifetime';
  isAnimating: boolean;
  objectsAlive: number;
  lifetimeViolations: number;
  resourceLeaks: number;
  lifetimeExtensions: number;
  performanceMetrics: {
    lifetimeOverhead: number;
    determinismLevel: number;
    memoryEfficiency: number;
  };
}

// 3D Visualización de RAII Lifetime Management
const RAIILifetimeManagementVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'object_lifetime') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        objectsAlive: Math.floor(5 + Math.sin(animationRef.current * 2) * 3),
        lifetimeViolations: Math.floor(Math.max(0, Math.sin(animationRef.current * 3.5) * 2)),
        resourceLeaks: Math.floor(Math.max(0, Math.cos(animationRef.current * 2.8) * 1.5)),
        lifetimeExtensions: Math.floor(2 + Math.sin(animationRef.current * 1.5) * 2),
        performanceMetrics: {
          lifetimeOverhead: 3.2 + Math.sin(animationRef.current) * 1.8,
          determinismLevel: 85 + Math.cos(animationRef.current * 2) * 10,
          memoryEfficiency: 78 + Math.sin(animationRef.current * 1.5) * 15
        }
      });
    } else if (scenario === 'scope_based') {
      groupRef.current.rotation.x = Math.sin(animationRef.current) * 0.2;
      groupRef.current.rotation.z = Math.cos(animationRef.current) * 0.15;
      onMetrics({
        objectsAlive: Math.floor(8 + Math.cos(animationRef.current * 2.5) * 4),
        lifetimeViolations: 0, // Perfect scope-based management
        resourceLeaks: 0,
        lifetimeExtensions: Math.floor(4 + Math.sin(animationRef.current * 2) * 3),
        performanceMetrics: {
          lifetimeOverhead: 1.8 + Math.cos(animationRef.current * 2) * 0.9,
          determinismLevel: 95 + Math.sin(animationRef.current) * 5,
          memoryEfficiency: 92 + Math.cos(animationRef.current * 1.8) * 8
        }
      });
    } else if (scenario === 'lifetime_extension') {
      groupRef.current.rotation.y = Math.cos(animationRef.current) * 0.25;
      onMetrics({
        objectsAlive: Math.floor(12 + Math.sin(animationRef.current * 1.8) * 6),
        lifetimeViolations: Math.floor(Math.max(0, Math.cos(animationRef.current * 4) * 1)),
        resourceLeaks: Math.floor(Math.max(0, Math.sin(animationRef.current * 3.2) * 0.8)),
        lifetimeExtensions: Math.floor(8 + Math.cos(animationRef.current * 2.2) * 5),
        performanceMetrics: {
          lifetimeOverhead: 5.5 + Math.sin(animationRef.current * 1.5) * 2.2,
          determinismLevel: 88 + Math.cos(animationRef.current * 2.5) * 8,
          memoryEfficiency: 82 + Math.sin(animationRef.current * 2) * 12
        }
      });
    } else if (scenario === 'weak_references') {
      groupRef.current.rotation.y = animationRef.current * 0.4;
      groupRef.current.rotation.x = Math.sin(animationRef.current * 0.7) * 0.1;
      onMetrics({
        objectsAlive: Math.floor(6 + Math.sin(animationRef.current * 1.5) * 3),
        lifetimeViolations: Math.floor(Math.max(0, Math.sin(animationRef.current * 5) * 1.2)),
        resourceLeaks: 0, // Weak references prevent leaks
        lifetimeExtensions: Math.floor(3 + Math.cos(animationRef.current * 2) * 2),
        performanceMetrics: {
          lifetimeOverhead: 2.8 + Math.cos(animationRef.current * 2.5) * 1.5,
          determinismLevel: 92 + Math.sin(animationRef.current * 3) * 6,
          memoryEfficiency: 88 + Math.cos(animationRef.current * 1.2) * 10
        }
      });
    } else if (scenario === 'circular_breaking') {
      groupRef.current.rotation.z = Math.sin(animationRef.current * 1.2) * 0.18;
      onMetrics({
        objectsAlive: Math.floor(4 + Math.cos(animationRef.current * 3) * 2),
        lifetimeViolations: Math.floor(Math.max(0, Math.cos(animationRef.current * 6) * 0.8)),
        resourceLeaks: Math.floor(Math.max(0, Math.sin(animationRef.current * 4.5) * 0.5)),
        lifetimeExtensions: Math.floor(1 + Math.sin(animationRef.current * 1.8) * 1),
        performanceMetrics: {
          lifetimeOverhead: 4.2 + Math.sin(animationRef.current * 2) * 1.8,
          determinismLevel: 90 + Math.cos(animationRef.current * 2.2) * 7,
          memoryEfficiency: 85 + Math.sin(animationRef.current * 1.5) * 11
        }
      });
    } else if (scenario === 'thread_safe_lifetime') {
      groupRef.current.rotation.y = animationRef.current * 0.5;
      groupRef.current.rotation.x = Math.cos(animationRef.current * 1.3) * 0.12;
      onMetrics({
        objectsAlive: Math.floor(10 + Math.sin(animationRef.current * 2) * 5),
        lifetimeViolations: Math.floor(Math.max(0, Math.sin(animationRef.current * 4.5) * 1.5)),
        resourceLeaks: Math.floor(Math.max(0, Math.cos(animationRef.current * 3.8) * 1)),
        lifetimeExtensions: Math.floor(6 + Math.cos(animationRef.current * 1.8) * 4),
        performanceMetrics: {
          lifetimeOverhead: 8.5 + Math.sin(animationRef.current * 2.2) * 3.2,
          determinismLevel: 78 + Math.cos(animationRef.current * 1.5) * 12,
          memoryEfficiency: 75 + Math.sin(animationRef.current) * 18
        }
      });
    }
  });

  // Crear geometría para representar lifetime management
  const createLifetimeGeometry = () => {
    const geometry = new BufferGeometry();
    const vertices = [];
    const colors = [];

    // Crear estructura que representa object lifetimes y dependencies
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        const x = (i - 5.5) * 0.5;
        const y = (j - 5.5) * 0.5;
        const z = Math.sin(i * 0.6 + j * 0.4) * 0.6;

        vertices.push(x, y, z);

        // Colores basados en el escenario de lifetime management
        if (scenario === 'object_lifetime') {
          colors.push(0.3, 0.7, 0.9); // Azul claro (object lifetimes)
        } else if (scenario === 'scope_based') {
          colors.push(0.2, 0.9, 0.3); // Verde brillante (scope-based)
        } else if (scenario === 'lifetime_extension') {
          colors.push(0.9, 0.7, 0.2); // Dorado (extension)
        } else if (scenario === 'weak_references') {
          colors.push(0.7, 0.3, 0.9); // Púrpura (weak refs)
        } else if (scenario === 'circular_breaking') {
          colors.push(0.9, 0.4, 0.2); // Naranja (circular breaking)
        } else {
          colors.push(0.5, 0.8, 0.6); // Verde azulado (thread-safe)
        }
      }
    }

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    return geometry;
  };

  return (
    <group ref={groupRef}>
      <mesh geometry={createLifetimeGeometry()}>
        <meshStandardMaterial vertexColors />
      </mesh>
      
      {/* Visualización de object dependencies */}
      <mesh position={[0, 0, 2]}>
        <boxGeometry args={[1.8, 1.8, 0.3]} />
        <meshBasicMaterial color={0x4CAF50} transparent opacity={0.6} />
      </mesh>
      
      {/* Indicador de lifetime state */}
      <mesh position={[2.5, 2.5, 1]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color={0xFF9800} />
      </mesh>
    </group>
  );
};

const Lesson88_RAIILifetimeManagement: React.FC = () => {
  const [state, setState] = useState<RAIILifetimeManagementState>({
    language: 'en',
    scenario: 'object_lifetime',
    isAnimating: false,
    objectsAlive: 0,
    lifetimeViolations: 0,
    resourceLeaks: 0,
    lifetimeExtensions: 0,
    performanceMetrics: {
      lifetimeOverhead: 0,
      determinismLevel: 0,
      memoryEfficiency: 0
    }
  });

  const handleVisualizationMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  const changeScenario = useCallback((scenario: RAIILifetimeManagementState['scenario']) => {
    setState(prev => ({ ...prev, scenario, isAnimating: false }));
  }, []);

  const toggleLanguage = useCallback(() => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'es' : 'en' }));
  }, []);

  return (
    <LessonLayout
      title={state.language === 'en' ? "RAII Lifetime Management" : "Gestión de Tiempo de Vida RAII"}
      lessonNumber={88}
      description={state.language === 'en' 
        ? "Master deterministic object lifetime control and resource dependency management with advanced RAII patterns"
        : "Domina el control determinístico del tiempo de vida de objetos y gestión de dependencias de recursos con patrones RAII avanzados"
      }
    >
      <AccessibilityAnnouncer 
        message={state.language === 'en' 
          ? `RAII Lifetime Management lesson loaded. Current scenario: ${state.scenario}`
          : `Lección de Gestión de Tiempo de Vida RAII cargada. Escenario actual: ${state.scenario}`
        }
      />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Learning Objectives' : 'Objetivos de Aprendizaje'}
        </SectionTitle>
        <LearningObjectives
          objectives={state.language === 'en' ? [
            'Understand object lifetime and scope-based resource management principles',
            'Master automatic vs manual lifetime control patterns and trade-offs',
            'Learn resource acquisition ordering and deterministic destruction techniques',
            'Implement lifetime extension patterns with smart pointers and references',
            'Apply weak references and dangling pointer prevention strategies',
            'Design circular reference breaking and memory leak prevention systems',
            'Create thread-safe lifetime management for concurrent applications'
          ] : [
            'Comprender principios de tiempo de vida de objetos y gestión de recursos basada en ámbito',
            'Dominar patrones de control de tiempo de vida automático vs manual y sus compromisos',
            'Aprender ordenamiento de adquisición de recursos y técnicas de destrucción determinística',
            'Implementar patrones de extensión de tiempo de vida con smart pointers y referencias',
            'Aplicar referencias débiles y estrategias de prevención de punteros colgantes',
            'Diseñar ruptura de referencias circulares y sistemas de prevención de fugas de memoria',
            'Crear gestión de tiempo de vida thread-safe para aplicaciones concurrentes'
          ]}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive RAII Lifetime Management Visualization' : 'Visualización Interactiva de Gestión de Tiempo de Vida RAII'}
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
            onClick={() => changeScenario('object_lifetime')} 
            variant={state.scenario === 'object_lifetime' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Object Lifetime' : 'Tiempo de Vida de Objetos'}
          </Button>
          <Button 
            onClick={() => changeScenario('scope_based')} 
            variant={state.scenario === 'scope_based' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Scope-Based' : 'Basado en Ámbito'}
          </Button>
          <Button 
            onClick={() => changeScenario('lifetime_extension')} 
            variant={state.scenario === 'lifetime_extension' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Lifetime Extension' : 'Extensión de Tiempo de Vida'}
          </Button>
          <Button 
            onClick={() => changeScenario('weak_references')} 
            variant={state.scenario === 'weak_references' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Weak References' : 'Referencias Débiles'}
          </Button>
          <Button 
            onClick={() => changeScenario('circular_breaking')} 
            variant={state.scenario === 'circular_breaking' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Circular Breaking' : 'Ruptura Circular'}
          </Button>
          <Button 
            onClick={() => changeScenario('thread_safe_lifetime')} 
            variant={state.scenario === 'thread_safe_lifetime' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Thread-Safe Lifetime' : 'Tiempo de Vida Thread-Safe'}
          </Button>
        </ButtonGroup>

        <div style={{ height: '400px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '8px', overflow: 'hidden' }}>
          <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            <RAIILifetimeManagementVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={handleVisualizationMetrics}
            />
          </Canvas>
        </div>

        <PerformanceMonitor
          metrics={{
            'Objects Alive': state.objectsAlive,
            'Lifetime Violations': state.lifetimeViolations,
            'Resource Leaks': state.resourceLeaks,
            'Lifetime Extensions': state.lifetimeExtensions,
            'Lifetime Overhead (%)': state.performanceMetrics.lifetimeOverhead.toFixed(1),
            'Determinism Level (%)': state.performanceMetrics.determinismLevel.toFixed(0),
            'Memory Efficiency (%)': state.performanceMetrics.memoryEfficiency.toFixed(0)
          }}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Object Lifetime and Scope-Based Management' : 'Tiempo de Vida de Objetos y Gestión Basada en Ámbito'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <vector>
#include <string>
#include <chrono>

// Demonstration of object lifetime principles
namespace ObjectLifetime {
    
    // Class that tracks its lifetime
    class LifetimeTracker {
    private:
        std::string name_;
        static int instance_count_;
        int id_;
        std::chrono::time_point<std::chrono::high_resolution_clock> birth_time_;
        
    public:
        LifetimeTracker(const std::string& name) 
            : name_(name), id_(++instance_count_)
            , birth_time_(std::chrono::high_resolution_clock::now()) {
            std::cout << "${state.language === 'en' ? 'Object ' : 'Objeto '}" << name_ 
                      << " (ID: " << id_ << ") ${state.language === 'en' ? 'constructed' : 'construido'}" << std::endl;
        }
        
        LifetimeTracker(const LifetimeTracker& other) 
            : name_(other.name_ + "_copy"), id_(++instance_count_)
            , birth_time_(std::chrono::high_resolution_clock::now()) {
            std::cout << "${state.language === 'en' ? 'Object ' : 'Objeto '}" << name_ 
                      << " (ID: " << id_ << ") ${state.language === 'en' ? 'copy-constructed from ' : 'construido por copia de '}" 
                      << other.id_ << std::endl;
        }
        
        LifetimeTracker(LifetimeTracker&& other) noexcept
            : name_(std::move(other.name_)), id_(other.id_)
            , birth_time_(other.birth_time_) {
            other.name_ = "moved_from";
            other.id_ = -1;
            std::cout << "${state.language === 'en' ? 'Object ' : 'Objeto '}" << name_ 
                      << " (ID: " << id_ << ") ${state.language === 'en' ? 'move-constructed' : 'construido por movimiento'}" << std::endl;
        }
        
        ~LifetimeTracker() {
            if (id_ > 0) {
                auto death_time = std::chrono::high_resolution_clock::now();
                auto lifetime = std::chrono::duration_cast<std::chrono::microseconds>(
                    death_time - birth_time_).count();
                std::cout << "${state.language === 'en' ? 'Object ' : 'Objeto '}" << name_ 
                          << " (ID: " << id_ << ") ${state.language === 'en' ? 'destroyed after ' : 'destruido después de '}" 
                          << lifetime << "µs" << std::endl;
            }
        }
        
        const std::string& name() const { return name_; }
        int id() const { return id_; }
        
        static int alive_count() { return instance_count_; }
        static void reset_counter() { instance_count_ = 0; }
    };
    
    int LifetimeTracker::instance_count_ = 0;
    
    // Scope-based lifetime management
    void demonstrate_scope_based_lifetime() {
        std::cout << "${state.language === 'en' ? 'Scope-Based Lifetime Management Demo' : 'Demo de Gestión de Tiempo de Vida Basada en Ámbito'}" << std::endl;
        
        {
            // Level 1 scope
            std::cout << "${state.language === 'en' ? 'Entering level 1 scope' : 'Entrando al ámbito nivel 1'}" << std::endl;
            LifetimeTracker obj1("Level1_Object");
            
            {
                // Level 2 scope - nested
                std::cout << "${state.language === 'en' ? 'Entering level 2 scope' : 'Entrando al ámbito nivel 2'}" << std::endl;
                LifetimeTracker obj2("Level2_Object");
                
                {
                    // Level 3 scope - deeply nested
                    std::cout << "${state.language === 'en' ? 'Entering level 3 scope' : 'Entrando al ámbito nivel 3'}" << std::endl;
                    LifetimeTracker obj3("Level3_Object");
                    
                    std::cout << "${state.language === 'en' ? 'Objects alive: ' : 'Objetos vivos: '}" 
                              << LifetimeTracker::alive_count() << std::endl;
                    
                    std::cout << "${state.language === 'en' ? 'Exiting level 3 scope' : 'Saliendo del ámbito nivel 3'}" << std::endl;
                }
                
                std::cout << "${state.language === 'en' ? 'Objects alive after level 3: ' : 'Objetos vivos después del nivel 3: '}" 
                          << LifetimeTracker::alive_count() << std::endl;
                
                std::cout << "${state.language === 'en' ? 'Exiting level 2 scope' : 'Saliendo del ámbito nivel 2'}" << std::endl;
            }
            
            std::cout << "${state.language === 'en' ? 'Objects alive after level 2: ' : 'Objetos vivos después del nivel 2: '}" 
                      << LifetimeTracker::alive_count() << std::endl;
            
            std::cout << "${state.language === 'en' ? 'Exiting level 1 scope' : 'Saliendo del ámbito nivel 1'}" << std::endl;
        }
        
        std::cout << "${state.language === 'en' ? 'Final objects alive: ' : 'Objetos vivos finales: '}" 
                  << LifetimeTracker::alive_count() << std::endl;
    }
    
    // Automatic vs Manual lifetime control
    class ResourceManager {
    private:
        std::vector<std::unique_ptr<LifetimeTracker>> managed_resources_;
        std::vector<LifetimeTracker*> manual_resources_;
        
    public:
        // Automatic lifetime management (RAII)
        void add_managed_resource(const std::string& name) {
            managed_resources_.push_back(std::make_unique<LifetimeTracker>(name + "_managed"));
            std::cout << "${state.language === 'en' ? 'Added managed resource: ' : 'Recurso gestionado agregado: '}" << name << std::endl;
        }
        
        // Manual lifetime management (dangerous)
        void add_manual_resource(const std::string& name) {
            auto* resource = new LifetimeTracker(name + "_manual");
            manual_resources_.push_back(resource);
            std::cout << "${state.language === 'en' ? 'Added manual resource: ' : 'Recurso manual agregado: '}" << name 
                      << " ${state.language === 'en' ? '(requires manual cleanup!)' : '(requiere limpieza manual!)'}" << std::endl;
        }
        
        void cleanup_manual_resources() {
            std::cout << "${state.language === 'en' ? 'Manually cleaning up resources...' : 'Limpiando recursos manualmente...'}" << std::endl;
            for (auto* resource : manual_resources_) {
                delete resource;
            }
            manual_resources_.clear();
        }
        
        size_t managed_count() const { return managed_resources_.size(); }
        size_t manual_count() const { return manual_resources_.size(); }
        
        ~ResourceManager() {
            std::cout << "${state.language === 'en' ? 'ResourceManager destructor - automatic cleanup of ' : 'Destructor ResourceManager - limpieza automática de '}" 
                      << managed_resources_.size() << "${state.language === 'en' ? ' managed resources' : ' recursos gestionados'}" << std::endl;
            
            if (!manual_resources_.empty()) {
                std::cout << "${state.language === 'en' ? 'WARNING: ' : 'ADVERTENCIA: '}" << manual_resources_.size() 
                          << "${state.language === 'en' ? ' manual resources not cleaned up - LEAK!' : ' recursos manuales no limpiados - ¡FUGA!'}" << std::endl;
            }
        }
    };
}

void demonstrate_object_lifetime() {
    using namespace ObjectLifetime;
    
    LifetimeTracker::reset_counter();
    
    std::cout << "${state.language === 'en' ? 'Object Lifetime and Scope-Based Management' : 'Tiempo de Vida de Objetos y Gestión Basada en Ámbito'}" << std::endl;
    
    // Demonstrate scope-based lifetime
    demonstrate_scope_based_lifetime();
    
    std::cout << "\\n${state.language === 'en' ? 'Automatic vs Manual Lifetime Control:' : 'Control Automático vs Manual de Tiempo de Vida:'}" << std::endl;
    
    {
        ResourceManager manager;
        
        // Automatic management (good)
        manager.add_managed_resource("Database");
        manager.add_managed_resource("NetworkSocket");
        
        // Manual management (dangerous)
        manager.add_manual_resource("FileHandle");
        manager.add_manual_resource("MemoryBuffer");
        
        std::cout << "${state.language === 'en' ? 'Managed resources: ' : 'Recursos gestionados: '}" << manager.managed_count() << std::endl;
        std::cout << "${state.language === 'en' ? 'Manual resources: ' : 'Recursos manuales: '}" << manager.manual_count() << std::endl;
        
        // Simulate forgetting to cleanup manual resources
        if (rand() % 2) {
            manager.cleanup_manual_resources();
        }
        
        // manager destructor will run here
    }
    
    std::cout << "${state.language === 'en' ? 'Demo completed' : 'Demo completado'}" << std::endl;
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Object lifetime management is fundamental to RAII. Scope-based lifetime provides deterministic destruction, while automatic management through smart pointers eliminates manual cleanup responsibilities and prevents resource leaks.'
            : 'La gestión del tiempo de vida de objetos es fundamental para RAII. El tiempo de vida basado en ámbito proporciona destrucción determinística, mientras que la gestión automática a través de smart pointers elimina responsabilidades de limpieza manual y previene fugas de recursos.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Lifetime Extension with Smart Pointers' : 'Extensión de Tiempo de Vida con Smart Pointers'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <vector>
#include <functional>
#include <thread>
#include <chrono>

// Lifetime extension patterns with smart pointers
namespace LifetimeExtension {
    
    class ExpensiveResource {
    private:
        std::string name_;
        std::vector<int> data_;
        
    public:
        ExpensiveResource(const std::string& name, size_t size) 
            : name_(name), data_(size, 42) {
            std::cout << "${state.language === 'en' ? 'ExpensiveResource ' : 'Recurso Costoso '}" << name_ 
                      << "${state.language === 'en' ? ' created with ' : ' creado con '}" << size 
                      << "${state.language === 'en' ? ' elements' : ' elementos'}" << std::endl;
        }
        
        ~ExpensiveResource() {
            std::cout << "${state.language === 'en' ? 'ExpensiveResource ' : 'Recurso Costoso '}" << name_ 
                      << "${state.language === 'en' ? ' destroyed' : ' destruido'}" << std::endl;
        }
        
        const std::string& name() const { return name_; }
        size_t size() const { return data_.size(); }
        
        void use_resource() const {
            std::cout << "${state.language === 'en' ? 'Using resource ' : 'Usando recurso '}" << name_ << std::endl;
        }
    };
    
    // Lifetime extension through shared ownership
    class ResourceHolder {
    private:
        std::shared_ptr<ExpensiveResource> resource_;
        
    public:
        ResourceHolder(std::shared_ptr<ExpensiveResource> resource) 
            : resource_(std::move(resource)) {
            std::cout << "${state.language === 'en' ? 'ResourceHolder created, use_count: ' : 'ResourceHolder creado, use_count: '}" 
                      << resource_.use_count() << std::endl;
        }
        
        ~ResourceHolder() {
            std::cout << "${state.language === 'en' ? 'ResourceHolder destroyed, use_count: ' : 'ResourceHolder destruido, use_count: '}" 
                      << (resource_ ? resource_.use_count() : 0) << std::endl;
        }
        
        void use_resource() const {
            if (resource_) {
                resource_->use_resource();
            }
        }
        
        std::shared_ptr<ExpensiveResource> get_resource() const {
            return resource_;  // Extends lifetime
        }
    };
    
    // Async lifetime extension pattern
    class AsyncResourceManager {
    private:
        std::shared_ptr<ExpensiveResource> shared_resource_;
        
    public:
        AsyncResourceManager(const std::string& name, size_t size) 
            : shared_resource_(std::make_shared<ExpensiveResource>(name, size)) {}
        
        // Start async operation that extends resource lifetime
        void start_async_operation() {
            std::cout << "${state.language === 'en' ? 'Starting async operation...' : 'Iniciando operación asíncrona...'}" << std::endl;
            
            // Capture shared_ptr in lambda - extends lifetime
            std::thread worker([resource = shared_resource_]() {
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                
                std::cout << "${state.language === 'en' ? 'Async work using resource: ' : 'Trabajo asíncrono usando recurso: '}" 
                          << resource->name() << std::endl;
                resource->use_resource();
                
                std::this_thread::sleep_for(std::chrono::milliseconds(50));
                std::cout << "${state.language === 'en' ? 'Async work completed' : 'Trabajo asíncrono completado'}" << std::endl;
            });
            
            worker.detach();  // Let it run independently
        }
        
        std::shared_ptr<ExpensiveResource> share_resource() const {
            return shared_resource_;
        }
        
        void reset_resource() {
            std::cout << "${state.language === 'en' ? 'Resetting resource, use_count: ' : 'Reiniciando recurso, use_count: '}" 
                      << shared_resource_.use_count() << std::endl;
            shared_resource_.reset();
        }
    };
    
    // Lifetime extension through callbacks
    class CallbackSystem {
    private:
        std::vector<std::function<void()>> callbacks_;
        
    public:
        template<typename Resource>
        void register_callback(std::shared_ptr<Resource> resource, std::function<void(Resource&)> callback) {
            // Capture resource in lambda to extend its lifetime
            callbacks_.emplace_back([resource, callback]() {
                if (resource) {
                    callback(*resource);
                }
            });
            
            std::cout << "${state.language === 'en' ? 'Callback registered, resource use_count: ' : 'Callback registrado, use_count del recurso: '}" 
                      << resource.use_count() << std::endl;
        }
        
        void execute_callbacks() {
            std::cout << "${state.language === 'en' ? 'Executing ' : 'Ejecutando '}" << callbacks_.size() 
                      << "${state.language === 'en' ? ' callbacks...' : ' callbacks...'}" << std::endl;
            
            for (auto& callback : callbacks_) {
                try {
                    callback();
                } catch (const std::exception& e) {
                    std::cout << "${state.language === 'en' ? 'Callback error: ' : 'Error en callback: '}" << e.what() << std::endl;
                }
            }
        }
        
        void clear_callbacks() {
            std::cout << "${state.language === 'en' ? 'Clearing callbacks...' : 'Limpiando callbacks...'}" << std::endl;
            callbacks_.clear();
        }
        
        size_t callback_count() const { return callbacks_.size(); }
    };
    
    // Custom deleter for fine-grained lifetime control
    template<typename T>
    class CustomDeleter {
    private:
        std::function<void(T*)> cleanup_func_;
        
    public:
        CustomDeleter(std::function<void(T*)> cleanup = nullptr) 
            : cleanup_func_(std::move(cleanup)) {}
        
        void operator()(T* ptr) {
            if (ptr) {
                std::cout << "${state.language === 'en' ? 'Custom deleter called for object' : 'Deleter personalizado llamado para objeto'}" << std::endl;
                
                if (cleanup_func_) {
                    cleanup_func_(ptr);
                }
                
                delete ptr;
            }
        }
    };
    
    // Resource with custom cleanup logic
    std::unique_ptr<ExpensiveResource, CustomDeleter<ExpensiveResource>> 
    create_resource_with_custom_cleanup(const std::string& name, size_t size) {
        auto cleanup = [name](ExpensiveResource* resource) {
            std::cout << "${state.language === 'en' ? 'Custom cleanup for ' : 'Limpieza personalizada para '}" << name << std::endl;
            // Additional cleanup logic here
        };
        
        return std::unique_ptr<ExpensiveResource, CustomDeleter<ExpensiveResource>>(
            new ExpensiveResource(name, size), 
            CustomDeleter<ExpensiveResource>(cleanup)
        );
    }
}

void demonstrate_lifetime_extension() {
    using namespace LifetimeExtension;
    
    std::cout << "${state.language === 'en' ? 'Lifetime Extension Patterns Demo' : 'Demo de Patrones de Extensión de Tiempo de Vida'}" << std::endl;
    
    // Shared ownership lifetime extension
    {
        std::cout << "\\n${state.language === 'en' ? '1. Shared Ownership Lifetime Extension:' : '1. Extensión de Tiempo de Vida por Propiedad Compartida:'}" << std::endl;
        
        std::shared_ptr<ExpensiveResource> original_resource;
        
        {
            // Create resource in inner scope
            ResourceHolder holder(std::make_shared<ExpensiveResource>("SharedResource", 1000));
            original_resource = holder.get_resource();  // Extend lifetime
            
            holder.use_resource();
            
        } // holder destroyed, but resource still alive
        
        if (original_resource) {
            std::cout << "${state.language === 'en' ? 'Resource survived holder destruction, use_count: ' : 'Recurso sobrevivió a destrucción de holder, use_count: '}" 
                      << original_resource.use_count() << std::endl;
            original_resource->use_resource();
        }
        
    } // original_resource destroyed here
    
    // Async lifetime extension
    {
        std::cout << "\\n${state.language === 'en' ? '2. Async Lifetime Extension:' : '2. Extensión de Tiempo de Vida Asíncrona:'}" << std::endl;
        
        {
            AsyncResourceManager manager("AsyncResource", 500);
            manager.start_async_operation();
            
            // Manager will be destroyed, but async operation keeps resource alive
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            manager.reset_resource();
            
        } // manager destroyed
        
        // Give async operation time to complete
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
    
    // Callback system lifetime extension
    {
        std::cout << "\\n${state.language === 'en' ? '3. Callback System Lifetime Extension:' : '3. Extensión de Tiempo de Vida por Sistema de Callbacks:'}" << std::endl;
        
        CallbackSystem callback_system;
        
        {
            auto resource = std::make_shared<ExpensiveResource>("CallbackResource", 300);
            
            // Register callbacks that capture the resource
            callback_system.register_callback(resource, [](ExpensiveResource& r) {
                std::cout << "${state.language === 'en' ? 'Callback 1 executed on ' : 'Callback 1 ejecutado en '}" << r.name() << std::endl;
                r.use_resource();
            });
            
            callback_system.register_callback(resource, [](ExpensiveResource& r) {
                std::cout << "${state.language === 'en' ? 'Callback 2 executed on ' : 'Callback 2 ejecutado en '}" << r.name() << std::endl;
            });
            
        } // resource scope ends, but callbacks keep it alive
        
        std::cout << "${state.language === 'en' ? 'Resource scope ended, executing callbacks...' : 'Ámbito del recurso terminó, ejecutando callbacks...'}" << std::endl;
        callback_system.execute_callbacks();
        
        callback_system.clear_callbacks();  // Now resource can be destroyed
    }
    
    // Custom deleter lifetime control
    {
        std::cout << "\\n${state.language === 'en' ? '4. Custom Deleter Lifetime Control:' : '4. Control de Tiempo de Vida con Deleter Personalizado:'}" << std::endl;
        
        {
            auto custom_resource = create_resource_with_custom_cleanup("CustomResource", 200);
            custom_resource->use_resource();
            
        } // Custom deleter will be called here
    }
    
    std::cout << "${state.language === 'en' ? '\\nLifetime extension demo completed' : '\\nDemo de extensión de tiempo de vida completado'}" << std::endl;
}`}
        />
        
        <UndefinedBehaviorWarning
          warning={state.language === 'en' 
            ? 'Lifetime extension through shared_ptr can lead to unexpected object lifetimes. Always consider the implications of extending object lifetimes, especially in async contexts where objects might outlive their intended scope.'
            : 'La extensión de tiempo de vida a través de shared_ptr puede llevar a tiempos de vida de objetos inesperados. Siempre considera las implicaciones de extender tiempos de vida de objetos, especialmente en contextos asíncronos donde los objetos podrían sobrevivir a su ámbito previsto.'
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Weak References and Dangling Pointer Prevention' : 'Referencias Débiles y Prevención de Punteros Colgantes'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <vector>
#include <map>
#include <string>

// Weak references and dangling pointer prevention
namespace WeakReferences {
    
    class Observer;
    class Subject;
    
    // Subject that can be observed without creating strong references
    class Subject {
    private:
        std::string name_;
        std::vector<std::weak_ptr<Observer>> observers_;
        int state_ = 0;
        
    public:
        Subject(const std::string& name) : name_(name) {
            std::cout << "${state.language === 'en' ? 'Subject ' : 'Sujeto '}" << name_ 
                      << "${state.language === 'en' ? ' created' : ' creado'}" << std::endl;
        }
        
        ~Subject() {
            std::cout << "${state.language === 'en' ? 'Subject ' : 'Sujeto '}" << name_ 
                      << "${state.language === 'en' ? ' destroyed' : ' destruido'}" << std::endl;
        }
        
        void attach_observer(std::weak_ptr<Observer> observer) {
            observers_.push_back(observer);
            cleanup_dead_observers();
        }
        
        void detach_observer(std::shared_ptr<Observer> observer) {
            observers_.erase(
                std::remove_if(observers_.begin(), observers_.end(),
                    [&observer](const std::weak_ptr<Observer>& weak_obs) {
                        return weak_obs.lock() == observer;
                    }),
                observers_.end());
        }
        
        void notify_observers() {
            std::cout << "${state.language === 'en' ? 'Subject ' : 'Sujeto '}" << name_ 
                      << "${state.language === 'en' ? ' notifying observers...' : ' notificando observadores...'}" << std::endl;
            
            cleanup_dead_observers();
            
            for (auto& weak_observer : observers_) {
                if (auto observer = weak_observer.lock()) {
                    observer->on_subject_changed(name_, state_);
                } else {
                    std::cout << "${state.language === 'en' ? 'Found dead observer (will be cleaned up)' : 'Observador muerto encontrado (será limpiado)'}" << std::endl;
                }
            }
        }
        
        void set_state(int new_state) {
            state_ = new_state;
            notify_observers();
        }
        
        int get_state() const { return state_; }
        const std::string& name() const { return name_; }
        
        size_t observer_count() const { return observers_.size(); }
        
    private:
        void cleanup_dead_observers() {
            observers_.erase(
                std::remove_if(observers_.begin(), observers_.end(),
                    [](const std::weak_ptr<Observer>& weak_obs) {
                        return weak_obs.expired();
                    }),
                observers_.end());
        }
    };
    
    // Observer that can safely reference subjects
    class Observer {
    private:
        std::string name_;
        std::vector<std::weak_ptr<Subject>> subjects_;
        
    public:
        Observer(const std::string& name) : name_(name) {
            std::cout << "${state.language === 'en' ? 'Observer ' : 'Observador '}" << name_ 
                      << "${state.language === 'en' ? ' created' : ' creado'}" << std::endl;
        }
        
        ~Observer() {
            std::cout << "${state.language === 'en' ? 'Observer ' : 'Observador '}" << name_ 
                      << "${state.language === 'en' ? ' destroyed' : ' destruido'}" << std::endl;
        }
        
        void observe_subject(std::shared_ptr<Subject> subject) {
            subjects_.push_back(subject);
            subject->attach_observer(std::weak_ptr<Observer>(std::shared_ptr<Observer>(this, [](Observer*){})));
        }
        
        void on_subject_changed(const std::string& subject_name, int new_state) {
            std::cout << "${state.language === 'en' ? 'Observer ' : 'Observador '}" << name_ 
                      << "${state.language === 'en' ? ' notified: subject ' : ' notificado: sujeto '}" << subject_name 
                      << "${state.language === 'en' ? ' changed to state ' : ' cambió a estado '}" << new_state << std::endl;
        }
        
        void check_subjects() {
            std::cout << "${state.language === 'en' ? 'Observer ' : 'Observador '}" << name_ 
                      << "${state.language === 'en' ? ' checking subjects:' : ' verificando sujetos:'}" << std::endl;
            
            for (auto it = subjects_.begin(); it != subjects_.end();) {
                if (auto subject = it->lock()) {
                    std::cout << "  ${state.language === 'en' ? 'Subject ' : 'Sujeto '}" << subject->name() 
                              << "${state.language === 'en' ? ' is alive, state: ' : ' está vivo, estado: '}" 
                              << subject->get_state() << std::endl;
                    ++it;
                } else {
                    std::cout << "  ${state.language === 'en' ? 'Subject is dead (removing reference)' : 'Sujeto está muerto (eliminando referencia)'}" << std::endl;
                    it = subjects_.erase(it);
                }
            }
        }
        
        const std::string& name() const { return name_; }
    };
    
    // Cache system using weak references to avoid keeping objects alive
    template<typename Key, typename Value>
    class WeakCache {
    private:
        std::map<Key, std::weak_ptr<Value>> cache_;
        
    public:
        std::shared_ptr<Value> get(const Key& key) {
            auto it = cache_.find(key);
            if (it != cache_.end()) {
                if (auto value = it->second.lock()) {
                    std::cout << "${state.language === 'en' ? 'Cache hit for key: ' : 'Cache hit para clave: '}" << key << std::endl;
                    return value;
                } else {
                    std::cout << "${state.language === 'en' ? 'Cache entry expired for key: ' : 'Entrada de cache expirada para clave: '}" << key << std::endl;
                    cache_.erase(it);
                }
            }
            return nullptr;
        }
        
        void put(const Key& key, std::shared_ptr<Value> value) {
            cache_[key] = value;
            std::cout << "${state.language === 'en' ? 'Cached value for key: ' : 'Valor cacheado para clave: '}" << key << std::endl;
        }
        
        void cleanup_expired() {
            for (auto it = cache_.begin(); it != cache_.end();) {
                if (it->second.expired()) {
                    std::cout << "${state.language === 'en' ? 'Removing expired cache entry for key: ' : 'Eliminando entrada de cache expirada para clave: '}" 
                              << it->first << std::endl;
                    it = cache_.erase(it);
                } else {
                    ++it;
                }
            }
        }
        
        size_t size() const { return cache_.size(); }
    };
    
    // Parent-Child relationship with weak references to prevent cycles
    class Parent;
    class Child;
    
    class Child {
    private:
        std::string name_;
        std::weak_ptr<Parent> parent_;  // Weak reference to parent
        
    public:
        Child(const std::string& name) : name_(name) {
            std::cout << "${state.language === 'en' ? 'Child ' : 'Hijo '}" << name_ 
                      << "${state.language === 'en' ? ' created' : ' creado'}" << std::endl;
        }
        
        ~Child() {
            std::cout << "${state.language === 'en' ? 'Child ' : 'Hijo '}" << name_ 
                      << "${state.language === 'en' ? ' destroyed' : ' destruido'}" << std::endl;
        }
        
        void set_parent(std::shared_ptr<Parent> parent) {
            parent_ = parent;
        }
        
        void communicate_with_parent() {
            if (auto parent = parent_.lock()) {
                std::cout << "${state.language === 'en' ? 'Child ' : 'Hijo '}" << name_ 
                          << "${state.language === 'en' ? ' communicating with parent' : ' comunicándose con padre'}" << std::endl;
                parent->respond_to_child(name_);
            } else {
                std::cout << "${state.language === 'en' ? 'Child ' : 'Hijo '}" << name_ 
                          << "${state.language === 'en' ? ' has no living parent' : ' no tiene padre vivo'}" << std::endl;
            }
        }
        
        const std::string& name() const { return name_; }
    };
    
    class Parent {
    private:
        std::string name_;
        std::vector<std::shared_ptr<Child>> children_;  // Strong references to children
        
    public:
        Parent(const std::string& name) : name_(name) {
            std::cout << "${state.language === 'en' ? 'Parent ' : 'Padre '}" << name_ 
                      << "${state.language === 'en' ? ' created' : ' creado'}" << std::endl;
        }
        
        ~Parent() {
            std::cout << "${state.language === 'en' ? 'Parent ' : 'Padre '}" << name_ 
                      << "${state.language === 'en' ? ' destroyed' : ' destruido'}" << std::endl;
        }
        
        void add_child(const std::string& child_name) {
            auto child = std::make_shared<Child>(child_name);
            child->set_parent(shared_from_this());
            children_.push_back(child);
        }
        
        void respond_to_child(const std::string& child_name) {
            std::cout << "${state.language === 'en' ? 'Parent ' : 'Padre '}" << name_ 
                      << "${state.language === 'en' ? ' responding to child ' : ' respondiendo a hijo '}" 
                      << child_name << std::endl;
        }
        
        void communicate_with_children() {
            for (auto& child : children_) {
                child->communicate_with_parent();
            }
        }
        
        size_t child_count() const { return children_.size(); }
        const std::string& name() const { return name_; }
    };
    
    // Enable shared_from_this for Parent
    class ParentWithSharedFromThis : public Parent, public std::enable_shared_from_this<ParentWithSharedFromThis> {
    public:
        ParentWithSharedFromThis(const std::string& name) : Parent(name) {}
    };
}

void demonstrate_weak_references() {
    using namespace WeakReferences;
    
    std::cout << "${state.language === 'en' ? 'Weak References and Dangling Pointer Prevention Demo' : 'Demo de Referencias Débiles y Prevención de Punteros Colgantes'}" << std::endl;
    
    // Observer pattern with weak references
    {
        std::cout << "\\n${state.language === 'en' ? '1. Observer Pattern with Weak References:' : '1. Patrón Observer con Referencias Débiles:'}" << std::endl;
        
        auto subject = std::make_shared<Subject>("NewsChannel");
        
        {
            auto observer1 = std::make_shared<Observer>("Subscriber1");
            auto observer2 = std::make_shared<Observer>("Subscriber2");
            
            // Observers register with subject (weak references)
            subject->attach_observer(observer1);
            subject->attach_observer(observer2);
            
            subject->set_state(1);
            
            std::cout << "${state.language === 'en' ? 'Observer count: ' : 'Número de observadores: '}" << subject->observer_count() << std::endl;
            
        } // observers destroyed here
        
        subject->set_state(2);  // Should handle dead observers gracefully
        std::cout << "${state.language === 'en' ? 'Observer count after scope: ' : 'Número de observadores después del ámbito: '}" << subject->observer_count() << std::endl;
    }
    
    // Weak cache system
    {
        std::cout << "\\n${state.language === 'en' ? '2. Weak Cache System:' : '2. Sistema de Cache Débil:'}" << std::endl;
        
        WeakCache<std::string, ExpensiveResource> cache;
        
        {
            auto resource1 = std::make_shared<ExpensiveResource>("CachedResource1", 100);
            auto resource2 = std::make_shared<ExpensiveResource>("CachedResource2", 200);
            
            cache.put("res1", resource1);
            cache.put("res2", resource2);
            
            // Cache hits
            auto cached1 = cache.get("res1");
            auto cached2 = cache.get("res2");
            
            if (cached1) cached1->use_resource();
            if (cached2) cached2->use_resource();
            
            std::cout << "${state.language === 'en' ? 'Cache size: ' : 'Tamaño de cache: '}" << cache.size() << std::endl;
            
        } // resources destroyed here
        
        // Cache misses (resources were destroyed)
        auto cached1 = cache.get("res1");  // Should be null
        auto cached2 = cache.get("res2");  // Should be null
        
        cache.cleanup_expired();
        std::cout << "${state.language === 'en' ? 'Cache size after cleanup: ' : 'Tamaño de cache después de limpieza: '}" << cache.size() << std::endl;
    }
    
    // Parent-child relationship without cycles
    {
        std::cout << "\\n${state.language === 'en' ? '3. Parent-Child Relationship (Cycle Prevention):' : '3. Relación Padre-Hijo (Prevención de Ciclos):'}" << std::endl;
        
        {
            auto parent = std::make_shared<ParentWithSharedFromThis>("Dad");
            parent->add_child("Alice");
            parent->add_child("Bob");
            
            parent->communicate_with_children();
            
            std::cout << "${state.language === 'en' ? 'Parent has ' : 'Padre tiene '}" << parent->child_count() 
                      << "${state.language === 'en' ? ' children' : ' hijos'}" << std::endl;
            
        } // Parent destroyed here, children follow automatically
        
        std::cout << "${state.language === 'en' ? 'Parent-child relationship ended cleanly' : 'Relación padre-hijo terminó limpiamente'}" << std::endl;
    }
    
    std::cout << "${state.language === 'en' ? '\\nWeak references demo completed' : '\\nDemo de referencias débiles completado'}" << std::endl;
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Weak references break potential cycles and prevent dangling pointers by allowing safe access to objects without extending their lifetime. They are essential for observer patterns, caches, and parent-child relationships.'
            : 'Las referencias débiles rompen ciclos potenciales y previenen punteros colgantes permitiendo acceso seguro a objetos sin extender su tiempo de vida. Son esenciales para patrones observer, caches y relaciones padre-hijo.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Circular Reference Breaking Strategies' : 'Estrategias de Ruptura de Referencias Circulares'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <vector>
#include <unordered_set>
#include <functional>

// Circular reference detection and breaking strategies
namespace CircularReferenceBreaking {
    
    // Forward declarations
    class Node;
    class Graph;
    
    // Node with cycle detection capability
    class Node {
    private:
        std::string name_;
        std::vector<std::shared_ptr<Node>> strong_children_;
        std::vector<std::weak_ptr<Node>> weak_children_;
        std::weak_ptr<Node> parent_;
        static size_t instance_count_;
        
    public:
        Node(const std::string& name) : name_(name) {
            ++instance_count_;
            std::cout << "${state.language === 'en' ? 'Node ' : 'Nodo '}" << name_ 
                      << "${state.language === 'en' ? ' created (total: ' : ' creado (total: '}" 
                      << instance_count_ << ")" << std::endl;
        }
        
        ~Node() {
            --instance_count_;
            std::cout << "${state.language === 'en' ? 'Node ' : 'Nodo '}" << name_ 
                      << "${state.language === 'en' ? ' destroyed (remaining: ' : ' destruido (restantes: '}" 
                      << instance_count_ << ")" << std::endl;
        }
        
        // Add child with cycle detection
        bool add_child(std::shared_ptr<Node> child, bool allow_cycles = false) {
            if (!child || child.get() == this) {
                std::cout << "${state.language === 'en' ? 'Cannot add null or self-reference' : 'No se puede agregar referencia nula o a sí mismo'}" << std::endl;
                return false;
            }
            
            if (!allow_cycles && would_create_cycle(child)) {
                std::cout << "${state.language === 'en' ? 'Cycle detected! Using weak reference instead for ' : '¡Ciclo detectado! Usando referencia débil en su lugar para '}" 
                          << child->name() << std::endl;
                weak_children_.push_back(child);
                return true;
            }
            
            strong_children_.push_back(child);
            child->parent_ = shared_from_this();
            std::cout << "${state.language === 'en' ? 'Added strong child: ' : 'Hijo fuerte agregado: '}" 
                      << child->name() << "${state.language === 'en' ? ' to ' : ' a '}" << name_ << std::endl;
            return true;
        }
        
        void add_weak_child(std::shared_ptr<Node> child) {
            if (child && child.get() != this) {
                weak_children_.push_back(child);
                std::cout << "${state.language === 'en' ? 'Added weak child: ' : 'Hijo débil agregado: '}" 
                          << child->name() << "${state.language === 'en' ? ' to ' : ' a '}" << name_ << std::endl;
            }
        }
        
        // Cycle detection using DFS
        bool would_create_cycle(std::shared_ptr<Node> candidate_child) const {
            std::unordered_set<const Node*> visited;
            return has_path_to(candidate_child.get(), visited);
        }
        
        // Check if there's a path from this node to target
        bool has_path_to(const Node* target, std::unordered_set<const Node*>& visited) const {
            if (this == target) return true;
            if (visited.count(this)) return false;
            
            visited.insert(this);
            
            // Check strong children only (weak references don't create cycles)
            for (const auto& child : strong_children_) {
                if (child->has_path_to(target, visited)) {
                    return true;
                }
            }
            
            return false;
        }
        
        void print_tree(int depth = 0, std::unordered_set<const Node*>& visited = 
                       *new std::unordered_set<const Node*>()) const {
            
            std::string indent(depth * 2, ' ');
            std::cout << indent << name_;
            
            if (visited.count(this)) {
                std::cout << " (${state.language === 'en' ? 'already visited' : 'ya visitado'})" << std::endl;
                return;
            }
            
            visited.insert(this);
            std::cout << std::endl;
            
            // Print strong children
            for (const auto& child : strong_children_) {
                child->print_tree(depth + 1, visited);
            }
            
            // Print weak children
            for (const auto& weak_child : weak_children_) {
                if (auto child = weak_child.lock()) {
                    std::cout << indent << "  (${state.language === 'en' ? 'weak' : 'débil'}) " << child->name() << std::endl;
                }
            }
        }
        
        // Get all reachable nodes
        std::vector<std::shared_ptr<Node>> get_all_reachable() const {
            std::vector<std::shared_ptr<Node>> result;
            std::unordered_set<const Node*> visited;
            collect_reachable(result, visited);
            return result;
        }
        
        void collect_reachable(std::vector<std::shared_ptr<Node>>& result, 
                              std::unordered_set<const Node*>& visited) const {
            if (visited.count(this)) return;
            visited.insert(this);
            
            for (const auto& child : strong_children_) {
                result.push_back(child);
                child->collect_reachable(result, visited);
            }
            
            // Include live weak children
            for (const auto& weak_child : weak_children_) {
                if (auto child = weak_child.lock()) {
                    result.push_back(child);
                    child->collect_reachable(result, visited);
                }
            }
        }
        
        const std::string& name() const { return name_; }
        size_t strong_child_count() const { return strong_children_.size(); }
        size_t weak_child_count() const { return weak_children_.size(); }
        
        static size_t total_nodes() { return instance_count_; }
        
        std::shared_ptr<Node> shared_from_this() {
            // Simplified shared_from_this implementation for demo
            return std::shared_ptr<Node>(this, [](Node*){});
        }
    };
    
    size_t Node::instance_count_ = 0;
    
    // Graph structure with cycle management
    class Graph {
    private:
        std::vector<std::shared_ptr<Node>> nodes_;
        bool auto_break_cycles_;
        
    public:
        Graph(bool auto_break_cycles = true) : auto_break_cycles_(auto_break_cycles) {
            std::cout << "${state.language === 'en' ? 'Graph created with auto-cycle-breaking: ' : 'Grafo creado con ruptura automática de ciclos: '}" 
                      << (auto_break_cycles_ ? "enabled" : "disabled") << std::endl;
        }
        
        ~Graph() {
            std::cout << "${state.language === 'en' ? 'Graph destroyed' : 'Grafo destruido'}" << std::endl;
        }
        
        std::shared_ptr<Node> add_node(const std::string& name) {
            auto node = std::make_shared<Node>(name);
            nodes_.push_back(node);
            return node;
        }
        
        bool connect_nodes(const std::string& parent_name, const std::string& child_name) {
            auto parent = find_node(parent_name);
            auto child = find_node(child_name);
            
            if (!parent || !child) {
                std::cout << "${state.language === 'en' ? 'Node not found for connection' : 'Nodo no encontrado para conexión'}" << std::endl;
                return false;
            }
            
            return parent->add_child(child, !auto_break_cycles_);
        }
        
        void print_graph() const {
            std::cout << "${state.language === 'en' ? 'Graph structure:' : 'Estructura del grafo:'}" << std::endl;
            std::unordered_set<const Node*> global_visited;
            
            for (const auto& node : nodes_) {
                if (global_visited.count(node.get()) == 0) {
                    node->print_tree(0, global_visited);
                }
            }
        }
        
        // Detect and report cycles
        void detect_cycles() const {
            std::cout << "${state.language === 'en' ? 'Cycle detection results:' : 'Resultados de detección de ciclos:'}" << std::endl;
            
            for (const auto& node : nodes_) {
                if (node->would_create_cycle(node)) {
                    std::cout << "${state.language === 'en' ? 'Self-cycle detected at node: ' : 'Auto-ciclo detectado en nodo: '}" << node->name() << std::endl;
                }
            }
        }
        
        size_t node_count() const { return nodes_.size(); }
        
    private:
        std::shared_ptr<Node> find_node(const std::string& name) const {
            for (const auto& node : nodes_) {
                if (node->name() == name) {
                    return node;
                }
            }
            return nullptr;
        }
    };
    
    // Reference counting cycle breaker
    class CycleBreaker {
    private:
        std::unordered_set<std::shared_ptr<Node>> monitored_nodes_;
        
    public:
        void monitor_node(std::shared_ptr<Node> node) {
            monitored_nodes_.insert(node);
        }
        
        void check_for_leaks() {
            std::cout << "${state.language === 'en' ? 'Checking for potential memory leaks...' : 'Verificando posibles fugas de memoria...'}" << std::endl;
            
            for (auto it = monitored_nodes_.begin(); it != monitored_nodes_.end();) {
                if (it->use_count() == 1) {  // Only reference is in our monitor set
                    std::cout << "${state.language === 'en' ? 'Node ' : 'Nodo '}" << (*it)->name() 
                              << "${state.language === 'en' ? ' is ready for cleanup' : ' está listo para limpieza'}" << std::endl;
                    it = monitored_nodes_.erase(it);
                } else {
                    std::cout << "${state.language === 'en' ? 'Node ' : 'Nodo '}" << (*it)->name() 
                              << "${state.language === 'en' ? ' still has ' : ' todavía tiene '}" 
                              << (it->use_count() - 1) 
                              << "${state.language === 'en' ? ' external references' : ' referencias externas'}" << std::endl;
                    ++it;
                }
            }
        }
        
        void force_cleanup() {
            std::cout << "${state.language === 'en' ? 'Forcing cleanup of monitored nodes...' : 'Forzando limpieza de nodos monitoreados...'}" << std::endl;
            monitored_nodes_.clear();
        }
        
        size_t monitored_count() const { return monitored_nodes_.size(); }
    };
}

void demonstrate_circular_reference_breaking() {
    using namespace CircularReferenceBreaking;
    
    std::cout << "${state.language === 'en' ? 'Circular Reference Breaking Strategies Demo' : 'Demo de Estrategias de Ruptura de Referencias Circulares'}" << std::endl;
    
    // Automatic cycle detection and prevention
    {
        std::cout << "\\n${state.language === 'en' ? '1. Automatic Cycle Detection and Prevention:' : '1. Detección Automática y Prevención de Ciclos:'}" << std::endl;
        
        Graph graph(true);  // Auto-break cycles enabled
        
        auto nodeA = graph.add_node("A");
        auto nodeB = graph.add_node("B");
        auto nodeC = graph.add_node("C");
        
        // Create connections that would form a cycle
        graph.connect_nodes("A", "B");
        graph.connect_nodes("B", "C");
        graph.connect_nodes("C", "A");  // This should create a weak reference
        
        graph.print_graph();
        graph.detect_cycles();
        
        std::cout << "${state.language === 'en' ? 'Total nodes alive: ' : 'Total de nodos vivos: '}" 
                  << Node::total_nodes() << std::endl;
    }
    
    // Manual cycle management
    {
        std::cout << "\\n${state.language === 'en' ? '2. Manual Cycle Management:' : '2. Gestión Manual de Ciclos:'}" << std::endl;
        
        CycleBreaker cycle_breaker;
        
        {
            auto parent = std::make_shared<Node>("Parent");
            auto child1 = std::make_shared<Node>("Child1");
            auto child2 = std::make_shared<Node>("Child2");
            
            // Monitor nodes for leak detection
            cycle_breaker.monitor_node(parent);
            cycle_breaker.monitor_node(child1);
            cycle_breaker.monitor_node(child2);
            
            // Create parent-child relationships
            parent->add_child(child1);
            parent->add_child(child2);
            
            // Create potential cycle with weak reference
            child1->add_weak_child(parent);  // Weak back-reference
            
            cycle_breaker.check_for_leaks();
            
        } // All nodes should be destroyed here
        
        std::cout << "${state.language === 'en' ? 'After scope exit:' : 'Después de salir del ámbito:'}" << std::endl;
        cycle_breaker.check_for_leaks();
        
        std::cout << "${state.language === 'en' ? 'Total nodes alive: ' : 'Total de nodos vivos: '}" 
                  << Node::total_nodes() << std::endl;
    }
    
    // Complex graph with mixed strong/weak references
    {
        std::cout << "\\n${state.language === 'en' ? '3. Complex Graph with Mixed References:' : '3. Grafo Complejo con Referencias Mixtas:'}" << std::endl;
        
        {
            Graph complex_graph(true);
            
            // Create a more complex structure
            auto root = complex_graph.add_node("Root");
            auto branch1 = complex_graph.add_node("Branch1");
            auto branch2 = complex_graph.add_node("Branch2");
            auto leaf1 = complex_graph.add_node("Leaf1");
            auto leaf2 = complex_graph.add_node("Leaf2");
            auto leaf3 = complex_graph.add_node("Leaf3");
            
            // Build tree structure
            complex_graph.connect_nodes("Root", "Branch1");
            complex_graph.connect_nodes("Root", "Branch2");
            complex_graph.connect_nodes("Branch1", "Leaf1");
            complex_graph.connect_nodes("Branch1", "Leaf2");
            complex_graph.connect_nodes("Branch2", "Leaf3");
            
            // Attempt to create cycles (should be converted to weak references)
            complex_graph.connect_nodes("Leaf1", "Root");    // Back to root
            complex_graph.connect_nodes("Leaf2", "Branch2"); // Cross-branch reference
            complex_graph.connect_nodes("Leaf3", "Branch1"); // Another cross-reference
            
            complex_graph.print_graph();
            
            std::cout << "${state.language === 'en' ? 'Complex graph nodes: ' : 'Nodos de grafo complejo: '}" 
                      << complex_graph.node_count() << std::endl;
            std::cout << "${state.language === 'en' ? 'Total nodes alive: ' : 'Total de nodos vivos: '}" 
                      << Node::total_nodes() << std::endl;
            
        } // Complex graph destroyed here
        
        std::cout << "${state.language === 'en' ? 'After complex graph destruction:' : 'Después de destrucción de grafo complejo:'}" << std::endl;
        std::cout << "${state.language === 'en' ? 'Total nodes alive: ' : 'Total de nodos vivos: '}" 
                  << Node::total_nodes() << std::endl;
    }
    
    std::cout << "${state.language === 'en' ? '\\nCircular reference breaking demo completed' : '\\nDemo de ruptura de referencias circulares completado'}" << std::endl;
}`}
        />
        
        <p>
          {state.language === 'en' 
            ? 'Circular reference breaking strategies include cycle detection algorithms, automatic conversion to weak references, and manual cycle management. These techniques prevent memory leaks in complex object graphs and maintain deterministic destruction.'
            : 'Las estrategias de ruptura de referencias circulares incluyen algoritmos de detección de ciclos, conversión automática a referencias débiles y gestión manual de ciclos. Estas técnicas previenen fugas de memoria en grafos de objetos complejos y mantienen destrucción determinística.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Thread-Safe Lifetime Management' : 'Gestión de Tiempo de Vida Thread-Safe'}
        </SectionTitle>
        
        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <memory>
#include <thread>
#include <mutex>
#include <atomic>
#include <vector>
#include <chrono>
#include <future>

// Thread-safe lifetime management patterns
namespace ThreadSafeLifetime {
    
    // Thread-safe resource with atomic reference counting
    class ThreadSafeResource {
    private:
        mutable std::mutex mutex_;
        std::string name_;
        std::atomic<int> access_count_{0};
        std::atomic<bool> destroyed_{false};
        
    public:
        ThreadSafeResource(const std::string& name) : name_(name) {
            std::cout << "${state.language === 'en' ? 'ThreadSafeResource ' : 'Recurso Thread-Safe '}" 
                      << name_ << "${state.language === 'en' ? ' created in thread ' : ' creado en hilo '}" 
                      << std::this_thread::get_id() << std::endl;
        }
        
        ~ThreadSafeResource() {
            destroyed_.store(true);
            std::cout << "${state.language === 'en' ? 'ThreadSafeResource ' : 'Recurso Thread-Safe '}" 
                      << name_ << "${state.language === 'en' ? ' destroyed in thread ' : ' destruido en hilo '}" 
                      << std::this_thread::get_id() 
                      << "${state.language === 'en' ? ' (total accesses: ' : ' (accesos totales: '}" 
                      << access_count_.load() << ")" << std::endl;
        }
        
        // Thread-safe access method
        bool safe_access(const std::function<void(const std::string&)>& operation) {
            if (destroyed_.load()) {
                std::cout << "${state.language === 'en' ? 'Attempted access to destroyed resource!' : '¡Intento de acceso a recurso destruido!'}" << std::endl;
                return false;
            }
            
            std::lock_guard<std::mutex> lock(mutex_);
            if (destroyed_.load()) {
                return false;  // Double-check after acquiring lock
            }
            
            access_count_.fetch_add(1);
            operation(name_);
            return true;
        }
        
        std::string get_name() const {
            std::lock_guard<std::mutex> lock(mutex_);
            return destroyed_.load() ? "destroyed" : name_;
        }
        
        int get_access_count() const {
            return access_count_.load();
        }
        
        bool is_destroyed() const {
            return destroyed_.load();
        }
    };
    
    // Thread-safe shared resource manager
    class SharedResourceManager {
    private:
        mutable std::shared_mutex shared_mutex_;
        std::map<std::string, std::shared_ptr<ThreadSafeResource>> resources_;
        std::atomic<size_t> access_count_{0};
        
    public:
        SharedResourceManager() {
            std::cout << "${state.language === 'en' ? 'SharedResourceManager created' : 'Gestor de Recursos Compartidos creado'}" << std::endl;
        }
        
        ~SharedResourceManager() {
            std::cout << "${state.language === 'en' ? 'SharedResourceManager destroyed (total accesses: ' : 'Gestor de Recursos Compartidos destruido (accesos totales: '}" 
                      << access_count_.load() << ")" << std::endl;
        }
        
        std::shared_ptr<ThreadSafeResource> get_resource(const std::string& name) {
            std::shared_lock<std::shared_mutex> lock(shared_mutex_);
            auto it = resources_.find(name);
            if (it != resources_.end()) {
                access_count_.fetch_add(1);
                return it->second;
            }
            return nullptr;
        }
        
        std::shared_ptr<ThreadSafeResource> create_resource(const std::string& name) {
            std::unique_lock<std::shared_mutex> lock(shared_mutex_);
            auto it = resources_.find(name);
            if (it != resources_.end()) {
                return it->second;  // Already exists
            }
            
            auto resource = std::make_shared<ThreadSafeResource>(name);
            resources_[name] = resource;
            return resource;
        }
        
        bool remove_resource(const std::string& name) {
            std::unique_lock<std::shared_mutex> lock(shared_mutex_);
            auto it = resources_.find(name);
            if (it != resources_.end()) {
                std::cout << "${state.language === 'en' ? 'Removing resource: ' : 'Eliminando recurso: '}" << name 
                          << "${state.language === 'en' ? ' (use_count: ' : ' (use_count: '}" 
                          << it->second.use_count() << ")" << std::endl;
                resources_.erase(it);
                return true;
            }
            return false;
        }
        
        size_t resource_count() const {
            std::shared_lock<std::shared_mutex> lock(shared_mutex_);
            return resources_.size();
        }
        
        void print_resources() const {
            std::shared_lock<std::shared_mutex> lock(shared_mutex_);
            std::cout << "${state.language === 'en' ? 'Current resources (' : 'Recursos actuales ('}" 
                      << resources_.size() << "):";
            for (const auto& [name, resource] : resources_) {
                std::cout << " " << name << "(ref:" << resource.use_count() << ")";
            }
            std::cout << std::endl;
        }
    };
    
    // Atomic smart pointer for lock-free operations
    template<typename T>
    class AtomicSharedPtr {
    private:
        std::atomic<std::shared_ptr<T>*> ptr_{nullptr};
        
    public:
        AtomicSharedPtr() = default;
        
        explicit AtomicSharedPtr(std::shared_ptr<T> ptr) {
            store(std::move(ptr));
        }
        
        ~AtomicSharedPtr() {
            auto* current = ptr_.load();
            delete current;
        }
        
        void store(std::shared_ptr<T> new_ptr) {
            auto* new_storage = new std::shared_ptr<T>(std::move(new_ptr));
            auto* old_storage = ptr_.exchange(new_storage);
            delete old_storage;
        }
        
        std::shared_ptr<T> load() const {
            auto* current = ptr_.load();
            return current ? *current : std::shared_ptr<T>{};
        }
        
        bool compare_exchange_weak(std::shared_ptr<T>& expected, std::shared_ptr<T> desired) {
            auto* current = ptr_.load();
            if (!current || *current != expected) {
                expected = current ? *current : std::shared_ptr<T>{};
                return false;
            }
            
            auto* new_storage = new std::shared_ptr<T>(std::move(desired));
            if (ptr_.compare_exchange_weak(current, new_storage)) {
                delete current;
                return true;
            } else {
                delete new_storage;
                expected = current ? *current : std::shared_ptr<T>{};
                return false;
            }
        }
    };
    
    // Thread-safe lifetime extension mechanism
    class LifetimeExtender {
    private:
        mutable std::mutex mutex_;
        std::vector<std::weak_ptr<void>> extended_lifetimes_;
        std::atomic<size_t> extension_count_{0};
        
    public:
        template<typename T>
        void extend_lifetime(std::shared_ptr<T> object) {
            std::lock_guard<std::mutex> lock(mutex_);
            extended_lifetimes_.push_back(std::weak_ptr<void>(object));
            extension_count_.fetch_add(1);
            
            std::cout << "${state.language === 'en' ? 'Lifetime extended for object (total extensions: ' : 'Tiempo de vida extendido para objeto (extensiones totales: '}" 
                      << extension_count_.load() << ")" << std::endl;
        }
        
        void cleanup_expired() {
            std::lock_guard<std::mutex> lock(mutex_);
            size_t initial_size = extended_lifetimes_.size();
            
            extended_lifetimes_.erase(
                std::remove_if(extended_lifetimes_.begin(), extended_lifetimes_.end(),
                    [](const std::weak_ptr<void>& weak_ptr) {
                        return weak_ptr.expired();
                    }),
                extended_lifetimes_.end()
            );
            
            size_t removed = initial_size - extended_lifetimes_.size();
            if (removed > 0) {
                std::cout << "${state.language === 'en' ? 'Cleaned up ' : 'Limpiados '}" << removed 
                          << "${state.language === 'en' ? ' expired lifetime extensions' : ' extensiones de tiempo de vida expiradas'}" << std::endl;
            }
        }
        
        size_t active_extensions() const {
            std::lock_guard<std::mutex> lock(mutex_);
            return extended_lifetimes_.size();
        }
        
        size_t total_extensions() const {
            return extension_count_.load();
        }
    };
    
    // Worker thread that safely accesses shared resources
    void worker_thread(std::shared_ptr<SharedResourceManager> manager, 
                      const std::string& resource_name, 
                      int worker_id, 
                      int operations) {
        
        std::cout << "${state.language === 'en' ? 'Worker ' : 'Trabajador '}" << worker_id 
                  << "${state.language === 'en' ? ' started in thread ' : ' iniciado en hilo '}" 
                  << std::this_thread::get_id() << std::endl;
        
        for (int i = 0; i < operations; ++i) {
            // Try to get resource
            auto resource = manager->get_resource(resource_name);
            if (!resource) {
                // Resource doesn't exist, try to create it
                resource = manager->create_resource(resource_name);
            }
            
            if (resource) {
                bool success = resource->safe_access([worker_id, i](const std::string& name) {
                    std::cout << "${state.language === 'en' ? 'Worker ' : 'Trabajador '}" << worker_id 
                              << "${state.language === 'en' ? ' accessing ' : ' accediendo a '}" << name 
                              << "${state.language === 'en' ? ' (operation ' : ' (operación '}" << i << ")" << std::endl;
                    
                    // Simulate work
                    std::this_thread::sleep_for(std::chrono::milliseconds(10));
                });
                
                if (!success) {
                    std::cout << "${state.language === 'en' ? 'Worker ' : 'Trabajador '}" << worker_id 
                              << "${state.language === 'en' ? ' failed to access resource' : ' falló al acceder al recurso'}" << std::endl;
                }
            }
            
            // Small delay between operations
            std::this_thread::sleep_for(std::chrono::milliseconds(5));
        }
        
        std::cout << "${state.language === 'en' ? 'Worker ' : 'Trabajador '}" << worker_id 
                  << "${state.language === 'en' ? ' completed' : ' completado'}" << std::endl;
    }
}

void demonstrate_thread_safe_lifetime() {
    using namespace ThreadSafeLifetime;
    
    std::cout << "${state.language === 'en' ? 'Thread-Safe Lifetime Management Demo' : 'Demo de Gestión de Tiempo de Vida Thread-Safe'}" << std::endl;
    
    // Multi-threaded resource access
    {
        std::cout << "\\n${state.language === 'en' ? '1. Multi-threaded Resource Access:' : '1. Acceso Multi-hilo a Recursos:'}" << std::endl;
        
        auto manager = std::make_shared<SharedResourceManager>();
        
        // Create some initial resources
        manager->create_resource("SharedResource1");
        manager->create_resource("SharedResource2");
        
        manager->print_resources();
        
        // Launch worker threads
        std::vector<std::thread> workers;
        for (int i = 0; i < 4; ++i) {
            workers.emplace_back(worker_thread, manager, "SharedResource" + std::to_string((i % 2) + 1), i, 3);
        }
        
        // Let workers run for a bit
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
        
        // Remove one resource while workers are accessing it
        manager->remove_resource("SharedResource1");
        manager->print_resources();
        
        // Wait for all workers to complete
        for (auto& worker : workers) {
            worker.join();
        }
        
        manager->print_resources();
    }
    
    // Atomic shared pointer operations
    {
        std::cout << "\\n${state.language === 'en' ? '2. Atomic Shared Pointer Operations:' : '2. Operaciones Atómicas con Shared Pointer:'}" << std::endl;
        
        AtomicSharedPtr<ThreadSafeResource> atomic_resource;
        
        // Initialize with a resource
        atomic_resource.store(std::make_shared<ThreadSafeResource>("AtomicResource"));
        
        // Test concurrent access and updates
        std::vector<std::thread> threads;
        
        // Reader threads
        for (int i = 0; i < 3; ++i) {
            threads.emplace_back([&atomic_resource, i]() {
                for (int j = 0; j < 5; ++j) {
                    auto resource = atomic_resource.load();
                    if (resource) {
                        resource->safe_access([i, j](const std::string& name) {
                            std::cout << "${state.language === 'en' ? 'Reader ' : 'Lector '}" << i 
                                      << "${state.language === 'en' ? ' iteration ' : ' iteración '}" << j 
                                      << "${state.language === 'en' ? ' accessed ' : ' accedió a '}" << name << std::endl;
                        });
                    }
                    std::this_thread::sleep_for(std::chrono::milliseconds(20));
                }
            });
        }
        
        // Writer thread
        threads.emplace_back([&atomic_resource]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            
            std::cout << "${state.language === 'en' ? 'Writer replacing resource...' : 'Escritor reemplazando recurso...'}" << std::endl;
            atomic_resource.store(std::make_shared<ThreadSafeResource>("ReplacedAtomicResource"));
            
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            
            std::cout << "${state.language === 'en' ? 'Writer clearing resource...' : 'Escritor limpiando recurso...'}" << std::endl;
            atomic_resource.store(nullptr);
        });
        
        // Wait for all threads
        for (auto& thread : threads) {
            thread.join();
        }
    }
    
    // Lifetime extension in multi-threaded context
    {
        std::cout << "\\n${state.language === 'en' ? '3. Multi-threaded Lifetime Extension:' : '3. Extensión de Tiempo de Vida Multi-hilo:'}" << std::endl;
        
        LifetimeExtender extender;
        
        {
            std::vector<std::shared_ptr<ThreadSafeResource>> resources;
            
            // Create resources
            for (int i = 0; i < 3; ++i) {
                resources.push_back(std::make_shared<ThreadSafeResource>("ExtendedResource" + std::to_string(i)));
                extender.extend_lifetime(resources.back());
            }
            
            // Launch threads that will try to use resources after they go out of scope
            std::vector<std::future<void>> futures;
            
            for (int i = 0; i < 2; ++i) {
                futures.push_back(std::async(std::launch::async, [&extender, i]() {
                    std::this_thread::sleep_for(std::chrono::milliseconds(100));
                    
                    std::cout << "${state.language === 'en' ? 'Async task ' : 'Tarea asíncrona '}" << i 
                              << "${state.language === 'en' ? ' checking extensions...' : ' verificando extensiones...'}" << std::endl;
                    
                    std::cout << "${state.language === 'en' ? 'Active extensions: ' : 'Extensiones activas: '}" 
                              << extender.active_extensions() << std::endl;
                    
                    extender.cleanup_expired();
                }));
            }
            
            std::cout << "${state.language === 'en' ? 'Resources going out of scope...' : 'Recursos saliendo del ámbito...'}" << std::endl;
            
        } // resources vector destroyed here, but lifetime extended
        
        std::cout << "${state.language === 'en' ? 'After scope exit - Active extensions: ' : 'Después de salir del ámbito - Extensiones activas: '}" 
                  << extender.active_extensions() << std::endl;
        
        // Wait for async tasks
        for (auto& future : futures) {
            future.wait();
        }
        
        std::cout << "${state.language === 'en' ? 'Final cleanup...' : 'Limpieza final...'}" << std::endl;
        extender.cleanup_expired();
        
        std::cout << "${state.language === 'en' ? 'Total lifetime extensions performed: ' : 'Total de extensiones de tiempo de vida realizadas: '}" 
                  << extender.total_extensions() << std::endl;
    }
    
    std::cout << "${state.language === 'en' ? '\\nThread-safe lifetime management demo completed' : '\\nDemo de gestión de tiempo de vida thread-safe completado'}" << std::endl;
}`}
        />
        
        <UndefinedBehaviorWarning
          warning={state.language === 'en' 
            ? 'Thread-safe lifetime management requires careful synchronization. Always use proper locking mechanisms, atomic operations, and be aware of race conditions when managing object lifetimes across multiple threads.'
            : 'La gestión de tiempo de vida thread-safe requiere sincronización cuidadosa. Siempre usa mecanismos de bloqueo adecuados, operaciones atómicas y ten cuidado con las condiciones de carrera al gestionar tiempos de vida de objetos a través de múltiples hilos.'
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Performance Comparison' : 'Comparación de Rendimiento'}
        </SectionTitle>
        
        <PerformanceComparison
          scenarios={[
            {
              name: state.language === 'en' ? 'Manual Lifetime Control' : 'Control Manual de Tiempo de Vida',
              complexity: 'O(1)',
              performance: 95,
              description: state.language === 'en' 
                ? 'Direct memory management with manual new/delete calls'
                : 'Gestión directa de memoria con llamadas manuales new/delete'
            },
            {
              name: state.language === 'en' ? 'Scope-Based RAII' : 'RAII Basado en Ámbito',
              complexity: 'O(1)',
              performance: 98,
              description: state.language === 'en' 
                ? 'Automatic deterministic cleanup with minimal overhead'
                : 'Limpieza determinística automática con sobrecarga mínima'
            },
            {
              name: state.language === 'en' ? 'Smart Pointer Lifetime Extension' : 'Extensión con Smart Pointers',
              complexity: 'O(1)',
              performance: 85,
              description: state.language === 'en' 
                ? 'Reference counting overhead but safe lifetime management'
                : 'Sobrecarga de conteo de referencias pero gestión segura de tiempo de vida'
            },
            {
              name: state.language === 'en' ? 'Weak Reference Patterns' : 'Patrones de Referencia Débil',
              complexity: 'O(1)',
              performance: 88,
              description: state.language === 'en' 
                ? 'Prevents cycles with minimal performance impact'
                : 'Previene ciclos con impacto mínimo en rendimiento'
            },
            {
              name: state.language === 'en' ? 'Circular Reference Breaking' : 'Ruptura de Referencias Circulares',
              complexity: 'O(n)',
              performance: 75,
              description: state.language === 'en' 
                ? 'Cycle detection algorithms with graph traversal overhead'
                : 'Algoritmos de detección de ciclos con sobrecarga de recorrido de grafo'
            },
            {
              name: state.language === 'en' ? 'Thread-Safe Lifetime Management' : 'Gestión Thread-Safe',
              complexity: 'O(1) to O(n)',
              performance: 70,
              description: state.language === 'en' 
                ? 'Synchronization overhead but safe concurrent access'
                : 'Sobrecarga de sincronización pero acceso concurrente seguro'
            }
          ]}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Practical Exercises' : 'Ejercicios Prácticos'}
        </SectionTitle>
        
        <InteractiveSection>
          <h4>{state.language === 'en' ? 'Exercise 1: Resource Lifetime Manager' : 'Ejercicio 1: Gestor de Tiempo de Vida de Recursos'}</h4>
          <p>
            {state.language === 'en' 
              ? 'Implement a comprehensive resource lifetime manager that handles automatic cleanup, lifetime extension, and cycle detection.'
              : 'Implementa un gestor integral de tiempo de vida de recursos que maneje limpieza automática, extensión de tiempo de vida y detección de ciclos.'
            }
          </p>
          
          <CodeBlock
            language="cpp"
            code={`// Your implementation here
template<typename ResourceType>
class ResourceLifetimeManager {
public:
    class ResourceHandle {
    private:
        // TODO: Implement RAII handle for managed resources
        
    public:
        ResourceHandle(ResourceLifetimeManager& manager, const std::string& id);
        ~ResourceHandle();
        
        ResourceType* get();
        const ResourceType* get() const;
        
        void extend_lifetime();
        void release_early();
        
        bool is_valid() const;
    };
    
    ResourceHandle acquire_resource(const std::string& id, ResourceType resource);
    void release_resource(const std::string& id);
    void cleanup_expired_resources();
    
    // Cycle detection and prevention
    void detect_cycles();
    void break_cycles();
    
    size_t active_resource_count() const;
    
private:
    // TODO: Implement lifetime tracking and management
};

// Usage example:
void test_resource_manager() {
    ResourceLifetimeManager<DatabaseConnection> manager;
    
    {
        auto handle = manager.acquire_resource("db1", DatabaseConnection("localhost"));
        handle.extend_lifetime();
        
        // Use resource...
        
    } // Handle destroyed, but lifetime extended
    
    manager.cleanup_expired_resources();
}`}
          />
          
          <h4>{state.language === 'en' ? 'Exercise 2: Thread-Safe Object Pool' : 'Ejercicio 2: Pool de Objetos Thread-Safe'}</h4>
          <p>
            {state.language === 'en' 
              ? 'Create a thread-safe object pool with automatic lifetime management and weak reference support for borrowed objects.'
              : 'Crea un pool de objetos thread-safe con gestión automática de tiempo de vida y soporte de referencias débiles para objetos prestados.'
            }
          </p>
          
          <CodeBlock
            language="cpp"
            code={`// Your implementation here
template<typename T>
class ThreadSafeObjectPool {
public:
    class PooledObject {
    private:
        // TODO: Implement RAII wrapper for pooled objects
        
    public:
        PooledObject(ThreadSafeObjectPool& pool, std::shared_ptr<T> object);
        ~PooledObject();
        
        T& operator*();
        T* operator->();
        
        void return_to_pool();
        std::weak_ptr<T> get_weak_ref();
    };
    
    ThreadSafeObjectPool(size_t max_size);
    ~ThreadSafeObjectPool();
    
    template<typename... Args>
    PooledObject acquire(Args&&... args);
    
    void shrink_to_fit();
    size_t size() const;
    size_t available() const;
    
private:
    // TODO: Implement thread-safe pool management
};

// Usage example:
void test_object_pool() {
    ThreadSafeObjectPool<ExpensiveResource> pool(10);
    
    std::vector<std::thread> workers;
    for (int i = 0; i < 4; ++i) {
        workers.emplace_back([&pool, i]() {
            auto obj = pool.acquire("Worker" + std::to_string(i));
            obj->use_resource();
            
            // Automatic return to pool when obj goes out of scope
        });
    }
    
    for (auto& worker : workers) {
        worker.join();
    }
}`}
          />
        </InteractiveSection>
      </Section>
    </LessonLayout>
  );
};

export default Lesson88_RAIILifetimeManagement;