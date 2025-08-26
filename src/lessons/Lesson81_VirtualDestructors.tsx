/**
 * Lesson 81: Virtual Destructors and Polymorphism
 * Advanced virtual destructor patterns, inheritance hierarchies, and RAII principles
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
  AccessibilityAnnouncer,
  UndefinedBehaviorWarning,
  PerformanceComparison
} from '../design-system';

interface VirtualDestructorState {
  language: 'en' | 'es';
  scenario: 'basic_problem' | 'virtual_solution' | 'pure_virtual' | 'diamond_inheritance' | 'template_patterns' | 'raii_patterns';
  isAnimating: boolean;
  virtualDestructors: number;
  memoryLeaks: number;
  destructorCalls: number;
  vtableOverhead: number;
  polymorphicObjects: number;
  exceptionSafety: number;
}

// 3D Visualization of Virtual Destructors and Inheritance Hierarchies
const VirtualDestructorVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);
  const classHierarchy = useRef<{id: number, name: string, level: number, hasVirtual: boolean, destructed: boolean, leaked: boolean}[]>([]);
  const vtables = useRef<{classId: number, entries: string[], color: string}[]>([]);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    // Simulate different virtual destructor scenarios
    if (scenario === 'basic_problem') {
      // Non-virtual destructor problem
      const baseClasses = 3;
      const derivedClasses = 9;
      
      classHierarchy.current = [
        { id: 0, name: 'Base', level: 0, hasVirtual: false, destructed: false, leaked: false },
        ...Array.from({ length: derivedClasses }, (_, i) => ({
          id: i + 1,
          name: `Derived${i + 1}`,
          level: 1,
          hasVirtual: false,
          destructed: Math.random() < 0.3, // Only some destructors called
          leaked: Math.random() < 0.7 // High leak probability without virtual
        }))
      ];
      
      groupRef.current.rotation.y = animationRef.current * 0.3;
      groupRef.current.position.y = Math.sin(animationRef.current * 1.5) * 0.1;
      
      const leaks = classHierarchy.current.filter(c => c.leaked).length;
      const destructorCalls = classHierarchy.current.filter(c => c.destructed).length;
      
      onMetrics({
        virtualDestructors: 0,
        memoryLeaks: leaks,
        destructorCalls: destructorCalls,
        vtableOverhead: 0,
        polymorphicObjects: derivedClasses,
        exceptionSafety: Math.max(0, 100 - leaks * 15)
      });
      
    } else if (scenario === 'virtual_solution') {
      // Virtual destructor solution
      const totalClasses = 12;
      
      classHierarchy.current = Array.from({ length: totalClasses }, (_, i) => ({
        id: i,
        name: i === 0 ? 'VirtualBase' : `Derived${i}`,
        level: i === 0 ? 0 : Math.floor((i - 1) / 3) + 1,
        hasVirtual: true,
        destructed: true, // All destructors called correctly
        leaked: false // No leaks with virtual destructors
      }));
      
      // VTables for virtual classes
      vtables.current = classHierarchy.current.map(cls => ({
        classId: cls.id,
        entries: ['~' + cls.name + '()', 'virtual_func1()', 'virtual_func2()'],
        color: cls.level === 0 ? '#00ff88' : '#0088ff'
      }));
      
      groupRef.current.rotation.x = Math.sin(animationRef.current * 0.8) * 0.2;
      groupRef.current.scale.setScalar(1 + Math.sin(animationRef.current * 2) * 0.05);
      
      onMetrics({
        virtualDestructors: totalClasses,
        memoryLeaks: 0,
        destructorCalls: totalClasses,
        vtableOverhead: totalClasses * 8, // 8 bytes per vtable pointer
        polymorphicObjects: totalClasses - 1,
        exceptionSafety: 100
      });
      
    } else if (scenario === 'pure_virtual') {
      // Pure virtual destructors and abstract bases
      const abstractBases = 2;
      const concreteClasses = 8;
      
      classHierarchy.current = [
        { id: 0, name: 'AbstractBase1', level: 0, hasVirtual: true, destructed: true, leaked: false },
        { id: 1, name: 'AbstractBase2', level: 0, hasVirtual: true, destructed: true, leaked: false },
        ...Array.from({ length: concreteClasses }, (_, i) => ({
          id: i + 2,
          name: `Concrete${i + 1}`,
          level: 1 + Math.floor(i / 4),
          hasVirtual: true,
          destructed: true,
          leaked: false
        }))
      ];
      
      groupRef.current.rotation.z = Math.cos(animationRef.current * 1.2) * 0.3;
      groupRef.current.position.x = Math.sin(animationRef.current * 0.9) * 0.2;
      
      onMetrics({
        virtualDestructors: abstractBases + concreteClasses,
        memoryLeaks: 0,
        destructorCalls: concreteClasses, // Abstract destructors still need implementation
        vtableOverhead: (abstractBases + concreteClasses) * 8,
        polymorphicObjects: concreteClasses,
        exceptionSafety: 100
      });
      
    } else if (scenario === 'diamond_inheritance') {
      // Diamond inheritance pattern with virtual destructors
      const diamondPattern = [
        { id: 0, name: 'Base', level: 0, hasVirtual: true, destructed: true, leaked: false },
        { id: 1, name: 'Left', level: 1, hasVirtual: true, destructed: true, leaked: false },
        { id: 2, name: 'Right', level: 1, hasVirtual: true, destructed: true, leaked: false },
        { id: 3, name: 'Diamond', level: 2, hasVirtual: true, destructed: true, leaked: false },
        { id: 4, name: 'ExtendedDiamond', level: 3, hasVirtual: true, destructed: true, leaked: false }
      ];
      
      classHierarchy.current = diamondPattern;
      
      // Complex vtable structure for diamond inheritance
      vtables.current = diamondPattern.map(cls => ({
        classId: cls.id,
        entries: cls.level === 2 ? 
          ['~Diamond()', 'left_virtual()', 'right_virtual()', 'diamond_func()'] :
          ['~' + cls.name + '()', 'virtual_func1()', 'virtual_func2()'],
        color: cls.level === 2 ? '#ff8800' : cls.level === 0 ? '#00ff88' : '#0088ff'
      }));
      
      groupRef.current.rotation.y = animationRef.current * 0.4;
      groupRef.current.rotation.x = Math.sin(animationRef.current * 1.8) * 0.4;
      
      onMetrics({
        virtualDestructors: diamondPattern.length,
        memoryLeaks: 0,
        destructorCalls: diamondPattern.length,
        vtableOverhead: diamondPattern.length * 8 + 16, // Extra overhead for virtual inheritance
        polymorphicObjects: diamondPattern.length - 1,
        exceptionSafety: 95 // Slightly complex due to multiple inheritance
      });
      
    } else if (scenario === 'template_patterns') {
      // Template inheritance with virtual destructors
      const templateClasses = 10;
      
      classHierarchy.current = Array.from({ length: templateClasses }, (_, i) => ({
        id: i,
        name: i === 0 ? 'TemplateBase<T>' : 
              i < 5 ? `TemplateImpl<${['int', 'float', 'double', 'string'][i-1]}>` :
              `CustomTemplate${i - 4}`,
        level: i === 0 ? 0 : i < 5 ? 1 : 2,
        hasVirtual: true,
        destructed: true,
        leaked: false
      }));
      
      groupRef.current.rotation.x = animationRef.current * 0.5;
      groupRef.current.position.y = Math.cos(animationRef.current * 1.3) * 0.15;
      
      onMetrics({
        virtualDestructors: templateClasses,
        memoryLeaks: 0,
        destructorCalls: templateClasses,
        vtableOverhead: templateClasses * 8,
        polymorphicObjects: templateClasses - 1,
        exceptionSafety: 98 // Template specializations are well-defined
      });
      
    } else if (scenario === 'raii_patterns') {
      // RAII with virtual destructors
      const raiiClasses = 8;
      
      classHierarchy.current = Array.from({ length: raiiClasses }, (_, i) => ({
        id: i,
        name: ['ResourceBase', 'FileResource', 'NetworkResource', 'DatabaseResource', 
               'MemoryResource', 'ThreadResource', 'MutexResource', 'TimerResource'][i],
        level: i === 0 ? 0 : 1,
        hasVirtual: true,
        destructed: true,
        leaked: false
      }));
      
      groupRef.current.rotation.y = Math.sin(animationRef.current * 0.7) * 0.6;
      groupRef.current.scale.setScalar(0.9 + Math.cos(animationRef.current * 2.5) * 0.1);
      
      onMetrics({
        virtualDestructors: raiiClasses,
        memoryLeaks: 0,
        destructorCalls: raiiClasses,
        vtableOverhead: raiiClasses * 8,
        polymorphicObjects: raiiClasses - 1,
        exceptionSafety: 100 // RAII ensures exception safety
      });
    }
  });

  const renderClassHierarchy = () => {
    const hierarchyBlocks = [];
    const maxLevel = Math.max(...classHierarchy.current.map(c => c.level));
    
    classHierarchy.current.forEach((cls, index) => {
      const x = (cls.level - maxLevel / 2) * 2;
      const y = -cls.level * 1.5;
      const z = (index % 3 - 1) * 0.8;
      
      // Class representation
      const color = cls.hasVirtual ? 
        (cls.leaked ? '#ff4444' : '#44ff44') : 
        (cls.leaked ? '#ff8844' : '#4488ff');
      
      hierarchyBlocks.push(
        <mesh key={`class_${cls.id}`} position={[x, y, z]}>
          <boxGeometry args={[1.5, 0.8, 0.4]} />
          <meshStandardMaterial 
            color={color}
            transparent 
            opacity={cls.destructed ? 0.9 : 0.5}
            emissive={cls.hasVirtual ? new Color(color).multiplyScalar(0.1) : new Color(0x000000)}
          />
        </mesh>
      );
      
      // Destructor indicator
      hierarchyBlocks.push(
        <mesh key={`destructor_${cls.id}`} position={[x, y + 0.6, z]}>
          <coneGeometry args={[0.15, 0.3, 4]} />
          <meshBasicMaterial 
            color={cls.hasVirtual ? '#00ffff' : '#ffff00'}
          />
        </mesh>
      );
      
      // Memory leak indicator
      if (cls.leaked) {
        hierarchyBlocks.push(
          <mesh key={`leak_${cls.id}`} position={[x + 0.8, y, z]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        );
      }
      
      // VTable indicator for virtual classes
      if (cls.hasVirtual && vtables.current.length > 0) {
        const vtable = vtables.current.find(v => v.classId === cls.id);
        if (vtable) {
          hierarchyBlocks.push(
            <mesh key={`vtable_${cls.id}`} position={[x - 0.8, y, z]}>
              <cylinderGeometry args={[0.2, 0.2, 0.6, 6]} />
              <meshStandardMaterial color={vtable.color} transparent opacity={0.7} />
            </mesh>
          );
        }
      }
    });
    
    return hierarchyBlocks;
  };

  const renderInheritanceConnections = () => {
    const connections = [];
    
    // Draw inheritance arrows
    for (let i = 1; i < classHierarchy.current.length; i++) {
      const child = classHierarchy.current[i];
      const parent = classHierarchy.current.find(c => c.level === child.level - 1);
      
      if (parent) {
        const childPos = [(child.level - Math.max(...classHierarchy.current.map(c => c.level)) / 2) * 2, -child.level * 1.5];
        const parentPos = [(parent.level - Math.max(...classHierarchy.current.map(c => c.level)) / 2) * 2, -parent.level * 1.5];
        
        connections.push(
          <mesh key={`connection_${i}`} 
                position={[(childPos[0] + parentPos[0]) / 2, (childPos[1] + parentPos[1]) / 2, 0]}
                rotation={[0, 0, Math.atan2(childPos[1] - parentPos[1], childPos[0] - parentPos[0])]}>
            <cylinderGeometry args={[0.05, 0.05, Math.sqrt(Math.pow(childPos[0] - parentPos[0], 2) + Math.pow(childPos[1] - parentPos[1], 2)), 8]} />
            <meshBasicMaterial color="#888888" transparent opacity={0.6} />
          </mesh>
        );
      }
    }
    
    return connections;
  };

  return (
    <group ref={groupRef}>
      {renderClassHierarchy()}
      {renderInheritanceConnections()}
      
      {/* Base platform */}
      <mesh position={[0, -4, 0]}>
        <cylinderGeometry args={[4, 4, 0.2, 16]} />
        <meshStandardMaterial 
          color={
            scenario === 'basic_problem' ? '#ff6666' :
            scenario === 'virtual_solution' ? '#66ff66' :
            scenario === 'pure_virtual' ? '#6666ff' :
            scenario === 'diamond_inheritance' ? '#ff8800' :
            scenario === 'template_patterns' ? '#8800ff' :
            '#00ffff'
          } 
          transparent 
          opacity={0.2} 
        />
      </mesh>
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 3, 2]} intensity={0.6} color="#4488ff" />
    </group>
  );
};

const Lesson81_VirtualDestructors: React.FC = () => {
  const [state, setState] = useState<VirtualDestructorState>({
    language: 'en',
    scenario: 'basic_problem',
    isAnimating: false,
    virtualDestructors: 0,
    memoryLeaks: 0,
    destructorCalls: 0,
    vtableOverhead: 0,
    polymorphicObjects: 0,
    exceptionSafety: 0
  });

  const handleMetrics = useCallback((metrics: any) => {
    setState(prev => ({
      ...prev,
      ...metrics
    }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  const setScenario = useCallback((scenario: VirtualDestructorState['scenario']) => {
    setState(prev => ({ ...prev, scenario }));
  }, []);

  const toggleLanguage = useCallback(() => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'es' : 'en' }));
  }, []);

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 81: Virtual Destructors and Polymorphism" : "Lección 81: Destructores Virtuales y Polimorfismo"}
      description={state.language === 'en' ? 
        "Master virtual destructors, inheritance hierarchies, and safe polymorphic destruction patterns" : 
        "Domina destructores virtuales, jerarquías de herencia y patrones de destrucción polimórfica segura"}
    >
      <AccessibilityAnnouncer 
        message={state.language === 'en' ? 
          `Virtual destructor visualization showing ${state.scenario} with ${state.memoryLeaks} memory leaks` :
          `Visualización de destructores virtuales mostrando ${state.scenario} con ${state.memoryLeaks} fugas de memoria`}
        priority="polite"
      />

      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Button onClick={toggleLanguage}>
            {state.language === 'en' ? '🇪🇸 Español' : '🇺🇸 English'}
          </Button>
        </div>

        <LearningObjectives
          objectives={state.language === 'en' ? [
            "Understand the critical role of virtual destructors in polymorphic hierarchies",
            "Master pure virtual destructors and abstract base class design",
            "Implement safe destruction patterns in complex inheritance scenarios",
            "Analyze vtable overhead and performance implications",
            "Apply virtual destructors in template hierarchies and RAII patterns",
            "Handle exception safety in virtual destructor implementations"
          ] : [
            "Comprender el papel crítico de los destructores virtuales en jerarquías polimórficas",
            "Dominar destructores virtuales puros y diseño de clases base abstractas",
            "Implementar patrones de destrucción segura en escenarios de herencia complejos",
            "Analizar sobrecarga de vtable e implicaciones de rendimiento",
            "Aplicar destructores virtuales en jerarquías de plantillas y patrones RAII",
            "Manejar seguridad de excepciones en implementaciones de destructores virtuales"
          ]}
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? "Interactive Virtual Destructor Scenarios" : "Escenarios Interactivos de Destructores Virtuales"}
        </SectionTitle>
        
        <div style={{ marginBottom: '2rem' }}>
          <ButtonGroup>
            <Button 
              variant={state.scenario === 'basic_problem' ? 'primary' : 'secondary'}
              onClick={() => setScenario('basic_problem')}
            >
              {state.language === 'en' ? 'Basic Problem' : 'Problema Básico'}
            </Button>
            <Button 
              variant={state.scenario === 'virtual_solution' ? 'primary' : 'secondary'}
              onClick={() => setScenario('virtual_solution')}
            >
              {state.language === 'en' ? 'Virtual Solution' : 'Solución Virtual'}
            </Button>
            <Button 
              variant={state.scenario === 'pure_virtual' ? 'primary' : 'secondary'}
              onClick={() => setScenario('pure_virtual')}
            >
              {state.language === 'en' ? 'Pure Virtual' : 'Virtual Puro'}
            </Button>
            <Button 
              variant={state.scenario === 'diamond_inheritance' ? 'primary' : 'secondary'}
              onClick={() => setScenario('diamond_inheritance')}
            >
              {state.language === 'en' ? 'Diamond Pattern' : 'Patrón Diamante'}
            </Button>
            <Button 
              variant={state.scenario === 'template_patterns' ? 'primary' : 'secondary'}
              onClick={() => setScenario('template_patterns')}
            >
              {state.language === 'en' ? 'Templates' : 'Plantillas'}
            </Button>
            <Button 
              variant={state.scenario === 'raii_patterns' ? 'primary' : 'secondary'}
              onClick={() => setScenario('raii_patterns')}
            >
              {state.language === 'en' ? 'RAII Patterns' : 'Patrones RAII'}
            </Button>
          </ButtonGroup>
          
          <Button onClick={toggleAnimation} style={{ marginLeft: '1rem' }}>
            {state.isAnimating ? 
              (state.language === 'en' ? 'Stop Simulation' : 'Detener Simulación') : 
              (state.language === 'en' ? 'Start Simulation' : 'Iniciar Simulación')
            }
          </Button>
        </div>

        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
            <VirtualDestructorVisualization 
              scenario={state.scenario} 
              isAnimating={state.isAnimating}
              onMetrics={handleMetrics}
            />
          </Canvas>
        </div>

        <PerformanceMonitor
          metrics={{
            [state.language === 'en' ? 'Virtual Destructors' : 'Destructores Virtuales']: state.virtualDestructors,
            [state.language === 'en' ? 'Memory Leaks' : 'Fugas de Memoria']: state.memoryLeaks,
            [state.language === 'en' ? 'Destructor Calls' : 'Llamadas de Destructor']: state.destructorCalls,
            [state.language === 'en' ? 'VTable Overhead (bytes)' : 'Sobrecarga VTable (bytes)']: state.vtableOverhead,
            [state.language === 'en' ? 'Polymorphic Objects' : 'Objetos Polimórficos']: state.polymorphicObjects,
            [state.language === 'en' ? 'Exception Safety %' : 'Seguridad de Excepciones %']: state.exceptionSafety
          }}
        />
      </InteractiveSection>

      {state.memoryLeaks > 0 && (
        <UndefinedBehaviorWarning
          warning={state.language === 'en' ? 
            "Memory leaks detected! Non-virtual destructors in polymorphic base classes cause undefined behavior and resource leaks." :
            "¡Fugas de memoria detectadas! Los destructores no virtuales en clases base polimórficas causan comportamiento indefinido y fugas de recursos."
          }
        />
      )}

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "The Fundamental Problem" : "El Problema Fundamental"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "When a base class is used polymorphically (via base pointers or references), the destructor must be virtual to ensure proper cleanup of derived objects. Without virtual destructors, only the base destructor is called, leading to resource leaks and undefined behavior." :
            "Cuando una clase base se usa polimórficamente (vía punteros o referencias base), el destructor debe ser virtual para asegurar la limpieza apropiada de objetos derivados. Sin destructores virtuales, solo se llama al destructor base, causando fugas de recursos y comportamiento indefinido."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={state.language === 'en' ? `// THE PROBLEM: Non-virtual destructor in polymorphic base
class ResourceBase {
protected:
    int* some_data_;
public:
    ResourceBase() : some_data_(new int[100]) {
        std::cout << "ResourceBase constructed\\n";
    }
    
    // ❌ CRITICAL ERROR: Non-virtual destructor
    ~ResourceBase() {
        std::cout << "ResourceBase destroyed\\n";
        delete[] some_data_;
    }
    
    virtual void do_something() = 0;  // Pure virtual = polymorphic use intended
};

class FileResource : public ResourceBase {
    std::FILE* file_;
    char* buffer_;
public:
    FileResource(const char* filename) 
        : file_(std::fopen(filename, "r")), buffer_(new char[4096]) {
        std::cout << "FileResource constructed\\n";
    }
    
    // This destructor will NEVER be called when deleting via base pointer!
    ~FileResource() {
        std::cout << "FileResource destroyed\\n";  // ❌ Never executed
        if (file_) std::fclose(file_);             // ❌ File handle leaked!
        delete[] buffer_;                          // ❌ Memory leaked!
    }
    
    void do_something() override {
        // Implementation
    }
};

void demonstrate_problem() {
    ResourceBase* resource = new FileResource("data.txt");
    
    // Use the resource...
    resource->do_something();
    
    // DISASTER: Only ~ResourceBase() called, ~FileResource() skipped!
    delete resource;  // ❌ File handle and buffer memory leaked!
    
    // Output:
    // ResourceBase constructed
    // FileResource constructed
    // ResourceBase destroyed    // ❌ Only base destructor!
    // 
    // Missing:
    // FileResource destroyed    // ❌ Never called!
}` : `// EL PROBLEMA: Destructor no virtual en base polimórfica
class RecursoBase {
protected:
    int* algunos_datos_;
public:
    RecursoBase() : algunos_datos_(new int[100]) {
        std::cout << "RecursoBase construido\\n";
    }
    
    // ❌ ERROR CRÍTICO: Destructor no virtual
    ~RecursoBase() {
        std::cout << "RecursoBase destruido\\n";
        delete[] algunos_datos_;
    }
    
    virtual void hacer_algo() = 0;  // Virtual puro = uso polimórfico previsto
};

class RecursoArchivo : public RecursoBase {
    std::FILE* archivo_;
    char* buffer_;
public:
    RecursoArchivo(const char* nombre_archivo) 
        : archivo_(std::fopen(nombre_archivo, "r")), buffer_(new char[4096]) {
        std::cout << "RecursoArchivo construido\\n";
    }
    
    // ¡Este destructor NUNCA será llamado al eliminar vía puntero base!
    ~RecursoArchivo() {
        std::cout << "RecursoArchivo destruido\\n";  // ❌ Nunca ejecutado
        if (archivo_) std::fclose(archivo_);          // ❌ ¡Handle de archivo filtrado!
        delete[] buffer_;                             // ❌ ¡Memoria filtrada!
    }
    
    void hacer_algo() override {
        // Implementación
    }
};

void demostrar_problema() {
    RecursoBase* recurso = new RecursoArchivo("datos.txt");
    
    // Usar el recurso...
    recurso->hacer_algo();
    
    // DESASTRE: Solo ~RecursoBase() llamado, ~RecursoArchivo() omitido!
    delete recurso;  // ❌ ¡Handle de archivo y memoria de buffer filtrados!
    
    // Salida:
    // RecursoBase construido
    // RecursoArchivo construido
    // RecursoBase destruido    // ❌ ¡Solo destructor base!
    // 
    // Falta:
    // RecursoArchivo destruido    // ❌ ¡Nunca llamado!
}`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Virtual Destructor Solution" : "Solución de Destructor Virtual"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "The solution is simple but critical: make the base class destructor virtual. This ensures that when deleting through a base pointer, the most derived destructor is called first, followed by each base class destructor in reverse order of construction." :
            "La solución es simple pero crítica: hacer virtual el destructor de la clase base. Esto asegura que al eliminar a través de un puntero base, se llame primero al destructor más derivado, seguido por cada destructor de clase base en orden inverso de construcción."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={state.language === 'en' ? `// THE SOLUTION: Virtual destructor in base class
class ResourceBase {
protected:
    int* some_data_;
public:
    ResourceBase() : some_data_(new int[100]) {
        std::cout << "ResourceBase constructed\\n";
    }
    
    // ✅ SOLUTION: Virtual destructor
    virtual ~ResourceBase() {
        std::cout << "ResourceBase destroyed\\n";
        delete[] some_data_;
    }
    
    virtual void do_something() = 0;
};

class FileResource : public ResourceBase {
    std::FILE* file_;
    char* buffer_;
public:
    FileResource(const char* filename) 
        : file_(std::fopen(filename, "r")), buffer_(new char[4096]) {
        std::cout << "FileResource constructed\\n";
    }
    
    // ✅ Now properly called through virtual mechanism
    ~FileResource() override {  // C++11: use 'override' keyword
        std::cout << "FileResource destroyed\\n";
        if (file_) std::fclose(file_);
        delete[] buffer_;
    }
    
    void do_something() override {
        if (file_) {
            // Read and process file
            std::fread(buffer_, 1, 4096, file_);
        }
    }
};

class NetworkResource : public ResourceBase {
    int socket_;
    std::vector<char> recv_buffer_;
public:
    NetworkResource(int socket) : socket_(socket), recv_buffer_(8192) {
        std::cout << "NetworkResource constructed\\n";
    }
    
    ~NetworkResource() override {
        std::cout << "NetworkResource destroyed\\n";
        if (socket_ >= 0) {
            close(socket_);  // Properly close socket
        }
    }
    
    void do_something() override {
        // Network operations
    }
};

void demonstrate_solution() {
    std::vector<std::unique_ptr<ResourceBase>> resources;
    
    resources.push_back(std::make_unique<FileResource>("data.txt"));
    resources.push_back(std::make_unique<NetworkResource>(42));
    
    // When unique_ptr goes out of scope, proper destruction occurs:
    // 1. ~FileResource() called first
    // 2. ~ResourceBase() called second
    // 
    // Output:
    // ResourceBase constructed
    // FileResource constructed
    // ResourceBase constructed  
    // NetworkResource constructed
    // NetworkResource destroyed     // ✅ Derived destructor first!
    // ResourceBase destroyed        // ✅ Then base destructor
    // FileResource destroyed        // ✅ Derived destructor first!
    // ResourceBase destroyed        // ✅ Then base destructor
}

// Cost analysis:
void analyze_virtual_destructor_cost() {
    // Memory overhead: +8 bytes per object (vtable pointer on 64-bit)
    std::cout << "Non-virtual class size: " << sizeof(int*) << " bytes\\n";        // 8 bytes
    std::cout << "Virtual class size: " << sizeof(ResourceBase) << " bytes\\n";     // 16 bytes
    
    // Performance overhead: 1 indirect call per destructor
    // - Lookup in vtable: ~1-2 CPU cycles
    // - Indirect jump: ~1 cycle
    // - Total overhead: ~2-3 cycles per destructor call
    
    // Benefit: Correct program behavior and no memory/resource leaks
    // Cost: 8 bytes + 2-3 cycles per polymorphic object
    // Verdict: ALWAYS worth it for polymorphic hierarchies!
}` : `// LA SOLUCIÓN: Destructor virtual en clase base
class RecursoBase {
protected:
    int* algunos_datos_;
public:
    RecursoBase() : algunos_datos_(new int[100]) {
        std::cout << "RecursoBase construido\\n";
    }
    
    // ✅ SOLUCIÓN: Destructor virtual
    virtual ~RecursoBase() {
        std::cout << "RecursoBase destruido\\n";
        delete[] algunos_datos_;
    }
    
    virtual void hacer_algo() = 0;
};

class RecursoArchivo : public RecursoBase {
    std::FILE* archivo_;
    char* buffer_;
public:
    RecursoArchivo(const char* nombre_archivo) 
        : archivo_(std::fopen(nombre_archivo, "r")), buffer_(new char[4096]) {
        std::cout << "RecursoArchivo construido\\n";
    }
    
    // ✅ Ahora propiamente llamado a través del mecanismo virtual
    ~RecursoArchivo() override {  // C++11: usar palabra clave 'override'
        std::cout << "RecursoArchivo destruido\\n";
        if (archivo_) std::fclose(archivo_);
        delete[] buffer_;
    }
    
    void hacer_algo() override {
        if (archivo_) {
            // Leer y procesar archivo
            std::fread(buffer_, 1, 4096, archivo_);
        }
    }
};

class RecursoRed : public RecursoBase {
    int socket_;
    std::vector<char> buffer_recepcion_;
public:
    RecursoRed(int socket) : socket_(socket), buffer_recepcion_(8192) {
        std::cout << "RecursoRed construido\\n";
    }
    
    ~RecursoRed() override {
        std::cout << "RecursoRed destruido\\n";
        if (socket_ >= 0) {
            close(socket_);  // Cerrar socket apropiadamente
        }
    }
    
    void hacer_algo() override {
        // Operaciones de red
    }
};

void demostrar_solucion() {
    std::vector<std::unique_ptr<RecursoBase>> recursos;
    
    recursos.push_back(std::make_unique<RecursoArchivo>("datos.txt"));
    recursos.push_back(std::make_unique<RecursoRed>(42));
    
    // Cuando unique_ptr sale de alcance, ocurre destrucción apropiada:
    // 1. ~RecursoArchivo() llamado primero
    // 2. ~RecursoBase() llamado segundo
    // 
    // Salida:
    // RecursoBase construido
    // RecursoArchivo construido
    // RecursoBase construido  
    // RecursoRed construido
    // RecursoRed destruido         // ✅ ¡Destructor derivado primero!
    // RecursoBase destruido        // ✅ Luego destructor base
    // RecursoArchivo destruido     // ✅ ¡Destructor derivado primero!
    // RecursoBase destruido        // ✅ Luego destructor base
}

// Análisis de costo:
void analizar_costo_destructor_virtual() {
    // Sobrecarga de memoria: +8 bytes por objeto (puntero vtable en 64-bit)
    std::cout << "Tamaño clase no virtual: " << sizeof(int*) << " bytes\\n";        // 8 bytes
    std::cout << "Tamaño clase virtual: " << sizeof(RecursoBase) << " bytes\\n";    // 16 bytes
    
    // Sobrecarga de rendimiento: 1 llamada indirecta por destructor
    // - Búsqueda en vtable: ~1-2 ciclos CPU
    // - Salto indirecto: ~1 ciclo
    // - Sobrecarga total: ~2-3 ciclos por llamada de destructor
    
    // Beneficio: Comportamiento correcto del programa y sin fugas memoria/recursos
    // Costo: 8 bytes + 2-3 ciclos por objeto polimórfico
    // Veredicto: ¡SIEMPRE vale la pena para jerarquías polimórficas!
}`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Pure Virtual Destructors" : "Destructores Virtuales Puros"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "Pure virtual destructors are used in abstract base classes to prevent instantiation while ensuring virtual destruction. Unlike other pure virtual functions, pure virtual destructors must still have an implementation because they're called during the destruction chain." :
            "Los destructores virtuales puros se usan en clases base abstractas para prevenir instanciación mientras aseguran destrucción virtual. A diferencia de otras funciones virtuales puras, los destructores virtuales puros deben tener una implementación porque son llamados durante la cadena de destrucción."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={state.language === 'en' ? `// Pure virtual destructors for abstract base classes
class AbstractShape {
protected:
    std::string name_;
    double* coordinate_data_;
    
public:
    AbstractShape(const std::string& name, size_t coord_count) 
        : name_(name), coordinate_data_(new double[coord_count]) {
        std::cout << "AbstractShape(" << name_ << ") constructed\\n";
    }
    
    // ✅ Pure virtual destructor makes class abstract
    virtual ~AbstractShape() = 0;
    
    // Other pure virtual functions
    virtual double area() const = 0;
    virtual double perimeter() const = 0;
    virtual void draw() const = 0;
    
    // Non-virtual interface functions
    const std::string& name() const { return name_; }
};

// ✅ CRITICAL: Must provide implementation even for pure virtual destructor
AbstractShape::~AbstractShape() {
    std::cout << "AbstractShape(" << name_ << ") destroyed\\n";
    delete[] coordinate_data_;  // Base class cleanup still needed
}

class Circle : public AbstractShape {
    double radius_;
    
public:
    Circle(double radius) : AbstractShape("Circle", 2), radius_(radius) {
        coordinate_data_[0] = 0.0;  // center x
        coordinate_data_[1] = 0.0;  // center y
        std::cout << "Circle constructed\\n";
    }
    
    ~Circle() override {
        std::cout << "Circle destroyed\\n";
        // No explicit cleanup needed, but destructor is called
    }
    
    double area() const override {
        return M_PI * radius_ * radius_;
    }
    
    double perimeter() const override {
        return 2 * M_PI * radius_;
    }
    
    void draw() const override {
        std::cout << "Drawing circle with radius " << radius_ << "\\n";
    }
};

class Rectangle : public AbstractShape {
    double width_, height_;
    
public:
    Rectangle(double w, double h) : AbstractShape("Rectangle", 8), width_(w), height_(h) {
        // Store rectangle coordinates
        coordinate_data_[0] = 0; coordinate_data_[1] = 0;      // bottom-left
        coordinate_data_[2] = w; coordinate_data_[3] = 0;      // bottom-right
        coordinate_data_[4] = w; coordinate_data_[5] = h;      // top-right
        coordinate_data_[6] = 0; coordinate_data_[7] = h;      // top-left
        std::cout << "Rectangle constructed\\n";
    }
    
    ~Rectangle() override {
        std::cout << "Rectangle destroyed\\n";
    }
    
    double area() const override { return width_ * height_; }
    double perimeter() const override { return 2 * (width_ + height_); }
    void draw() const override { 
        std::cout << "Drawing rectangle " << width_ << "x" << height_ << "\\n"; 
    }
};

// Advanced: Pure virtual destructor with resource management
class AbstractResourceManager {
    static size_t instance_count_;
    
protected:
    std::unique_ptr<std::mutex> access_mutex_;
    std::string resource_id_;
    
public:
    AbstractResourceManager(const std::string& id) 
        : access_mutex_(std::make_unique<std::mutex>()), resource_id_(id) {
        ++instance_count_;
        std::cout << "ResourceManager(" << id << ") created. Total: " 
                  << instance_count_ << "\\n";
    }
    
    // Pure virtual destructor with resource tracking
    virtual ~AbstractResourceManager() = 0;
    
    virtual void acquire_resource() = 0;
    virtual void release_resource() = 0;
    virtual bool is_available() const = 0;
    
    const std::string& id() const { return resource_id_; }
};

size_t AbstractResourceManager::instance_count_ = 0;

AbstractResourceManager::~AbstractResourceManager() {
    --instance_count_;
    std::cout << "ResourceManager(" << resource_id_ << ") destroyed. Remaining: " 
              << instance_count_ << "\\n";
    // Mutex automatically destroyed by unique_ptr
}

class DatabaseConnectionManager : public AbstractResourceManager {
    bool connection_active_;
    std::string connection_string_;
    
public:
    DatabaseConnectionManager(const std::string& conn_str) 
        : AbstractResourceManager("DB_" + std::to_string(std::hash<std::string>{}(conn_str))),
          connection_active_(false), connection_string_(conn_str) {
        std::cout << "DatabaseConnectionManager created\\n";
    }
    
    ~DatabaseConnectionManager() override {
        if (connection_active_) {
            release_resource();  // Ensure cleanup
        }
        std::cout << "DatabaseConnectionManager destroyed\\n";
    }
    
    void acquire_resource() override {
        std::lock_guard<std::mutex> lock(*access_mutex_);
        if (!connection_active_) {
            // Simulate database connection
            connection_active_ = true;
            std::cout << "Database connection acquired\\n";
        }
    }
    
    void release_resource() override {
        std::lock_guard<std::mutex> lock(*access_mutex_);
        if (connection_active_) {
            connection_active_ = false;
            std::cout << "Database connection released\\n";
        }
    }
    
    bool is_available() const override {
        return !connection_active_;
    }
};

void demonstrate_pure_virtual_destructors() {
    std::cout << "=== Pure Virtual Destructor Demo ===\\n";
    
    // Cannot instantiate abstract classes:
    // AbstractShape* shape = new AbstractShape("test", 0);  // ❌ Compilation error
    // AbstractResourceManager* mgr = new AbstractResourceManager("test");  // ❌ Error
    
    // But can use polymorphically:
    std::vector<std::unique_ptr<AbstractShape>> shapes;
    shapes.push_back(std::make_unique<Circle>(5.0));
    shapes.push_back(std::make_unique<Rectangle>(10.0, 20.0));
    
    for (const auto& shape : shapes) {
        std::cout << shape->name() << " area: " << shape->area() << "\\n";
        shape->draw();
    }
    
    // Destruction order will be:
    // 1. ~Rectangle() 
    // 2. ~AbstractShape() (pure virtual destructor implementation)
    // 3. ~Circle()
    // 4. ~AbstractShape() (pure virtual destructor implementation)
    
    std::cout << "\\n=== Resource Manager Demo ===\\n";
    
    {
        auto db_mgr = std::make_unique<DatabaseConnectionManager>("localhost:5432");
        db_mgr->acquire_resource();
        // Resource automatically released when db_mgr destructor called
    }
    
    std::cout << "Pure virtual destructor demo completed\\n";
}` : `// Destructores virtuales puros para clases base abstractas
class FormaAbstracta {
protected:
    std::string nombre_;
    double* datos_coordenadas_;
    
public:
    FormaAbstracta(const std::string& nombre, size_t cuenta_coord) 
        : nombre_(nombre), datos_coordenadas_(new double[cuenta_coord]) {
        std::cout << "FormaAbstracta(" << nombre_ << ") construida\\n";
    }
    
    // ✅ Destructor virtual puro hace la clase abstracta
    virtual ~FormaAbstracta() = 0;
    
    // Otras funciones virtuales puras
    virtual double area() const = 0;
    virtual double perimetro() const = 0;
    virtual void dibujar() const = 0;
    
    // Funciones de interfaz no virtuales
    const std::string& nombre() const { return nombre_; }
};

// ✅ CRÍTICO: Debe proveer implementación incluso para destructor virtual puro
FormaAbstracta::~FormaAbstracta() {
    std::cout << "FormaAbstracta(" << nombre_ << ") destruida\\n";
    delete[] datos_coordenadas_;  // Limpieza de clase base aún necesaria
}

class Circulo : public FormaAbstracta {
    double radio_;
    
public:
    Circulo(double radio) : FormaAbstracta("Círculo", 2), radio_(radio) {
        datos_coordenadas_[0] = 0.0;  // centro x
        datos_coordenadas_[1] = 0.0;  // centro y
        std::cout << "Círculo construido\\n";
    }
    
    ~Circulo() override {
        std::cout << "Círculo destruido\\n";
        // No se necesita limpieza explícita, pero el destructor es llamado
    }
    
    double area() const override {
        return M_PI * radio_ * radio_;
    }
    
    double perimetro() const override {
        return 2 * M_PI * radio_;
    }
    
    void dibujar() const override {
        std::cout << "Dibujando círculo con radio " << radio_ << "\\n";
    }
};

class Rectangulo : public FormaAbstracta {
    double ancho_, alto_;
    
public:
    Rectangulo(double a, double al) : FormaAbstracta("Rectángulo", 8), ancho_(a), alto_(al) {
        // Almacenar coordenadas del rectángulo
        datos_coordenadas_[0] = 0; datos_coordenadas_[1] = 0;      // inferior-izquierda
        datos_coordenadas_[2] = a; datos_coordenadas_[3] = 0;      // inferior-derecha
        datos_coordenadas_[4] = a; datos_coordenadas_[5] = al;     // superior-derecha
        datos_coordenadas_[6] = 0; datos_coordenadas_[7] = al;     // superior-izquierda
        std::cout << "Rectángulo construido\\n";
    }
    
    ~Rectangulo() override {
        std::cout << "Rectángulo destruido\\n";
    }
    
    double area() const override { return ancho_ * alto_; }
    double perimetro() const override { return 2 * (ancho_ + alto_); }
    void dibujar() const override { 
        std::cout << "Dibujando rectángulo " << ancho_ << "x" << alto_ << "\\n"; 
    }
};

void demostrar_destructores_virtuales_puros() {
    std::cout << "=== Demo Destructor Virtual Puro ===\\n";
    
    // No se puede instanciar clases abstractas:
    // FormaAbstracta* forma = new FormaAbstracta("test", 0);  // ❌ Error de compilación
    
    // Pero se puede usar polimórficamente:
    std::vector<std::unique_ptr<FormaAbstracta>> formas;
    formas.push_back(std::make_unique<Circulo>(5.0));
    formas.push_back(std::make_unique<Rectangulo>(10.0, 20.0));
    
    for (const auto& forma : formas) {
        std::cout << forma->nombre() << " área: " << forma->area() << "\\n";
        forma->dibujar();
    }
    
    // El orden de destrucción será:
    // 1. ~Rectangulo() 
    // 2. ~FormaAbstracta() (implementación de destructor virtual puro)
    // 3. ~Circulo()
    // 4. ~FormaAbstracta() (implementación de destructor virtual puro)
}`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Diamond Inheritance and Virtual Destructors" : "Herencia Diamante y Destructores Virtuales"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "In complex inheritance hierarchies like the diamond pattern, virtual inheritance combined with virtual destructors ensures proper destruction order and prevents multiple destructor calls for shared base classes." :
            "En jerarquías de herencia complejas como el patrón diamante, la herencia virtual combinada con destructores virtuales asegura el orden apropiado de destrucción y previene múltiples llamadas de destructor para clases base compartidas."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={state.language === 'en' ? `// Diamond inheritance with virtual destructors
class Device {
protected:
    std::string device_id_;
    bool is_initialized_;
    
public:
    Device(const std::string& id) : device_id_(id), is_initialized_(false) {
        std::cout << "Device(" << device_id_ << ") constructed\\n";
    }
    
    // Virtual destructor for polymorphic base
    virtual ~Device() {
        std::cout << "Device(" << device_id_ << ") destroyed\\n";
        if (is_initialized_) {
            cleanup_device();
        }
    }
    
    virtual void initialize() {
        is_initialized_ = true;
        std::cout << "Device " << device_id_ << " initialized\\n";
    }
    
    virtual void cleanup_device() {
        std::cout << "Device " << device_id_ << " cleanup completed\\n";
    }
    
    const std::string& id() const { return device_id_; }
};

// Virtual inheritance to avoid diamond problem
class InputDevice : public virtual Device {
protected:
    std::vector<int> input_buffer_;
    
public:
    InputDevice(const std::string& id) : Device(id + "_input") {
        input_buffer_.reserve(1024);
        std::cout << "InputDevice constructed\\n";
    }
    
    virtual ~InputDevice() {
        std::cout << "InputDevice destroyed\\n";
        flush_input_buffer();
    }
    
    virtual void process_input() = 0;
    
    void flush_input_buffer() {
        if (!input_buffer_.empty()) {
            std::cout << "Flushing " << input_buffer_.size() << " input events\\n";
            input_buffer_.clear();
        }
    }
};

class OutputDevice : public virtual Device {
protected:
    std::queue<std::string> output_queue_;
    
public:
    OutputDevice(const std::string& id) : Device(id + "_output") {
        std::cout << "OutputDevice constructed\\n";
    }
    
    virtual ~OutputDevice() {
        std::cout << "OutputDevice destroyed\\n";
        flush_output_queue();
    }
    
    virtual void process_output() = 0;
    
    void flush_output_queue() {
        if (!output_queue_.empty()) {
            std::cout << "Flushing " << output_queue_.size() << " output messages\\n";
            while (!output_queue_.empty()) output_queue_.pop();
        }
    }
};

// Diamond pattern: inherits from both InputDevice and OutputDevice
class TouchScreen : public InputDevice, public OutputDevice {
private:
    int screen_width_, screen_height_;
    std::unique_ptr<uint32_t[]> frame_buffer_;
    bool touch_active_;
    
public:
    TouchScreen(const std::string& id, int width, int height)
        : Device(id + "_touchscreen"),  // ✅ Only one Device construction
          InputDevice(id), OutputDevice(id),
          screen_width_(width), screen_height_(height),
          frame_buffer_(std::make_unique<uint32_t[]>(width * height)),
          touch_active_(false) {
        std::cout << "TouchScreen(" << width << "x" << height << ") constructed\\n";
        
        // Initialize framebuffer
        std::fill(frame_buffer_.get(), frame_buffer_.get() + width * height, 0x000000);
    }
    
    // ✅ Virtual destructor properly overridden
    ~TouchScreen() override {
        std::cout << "TouchScreen destroyed\\n";
        if (touch_active_) {
            disable_touch();
        }
        // frame_buffer_ automatically cleaned up by unique_ptr
    }
    
    void initialize() override {
        Device::initialize();
        touch_active_ = true;
        std::cout << "TouchScreen initialized and ready\\n";
    }
    
    void process_input() override {
        // Simulate touch input processing
        input_buffer_.push_back(rand() % screen_width_);   // x coordinate
        input_buffer_.push_back(rand() % screen_height_);  // y coordinate
        input_buffer_.push_back(1);  // touch down event
    }
    
    void process_output() override {
        // Simulate screen drawing
        output_queue_.push("Render frame " + std::to_string(rand() % 1000));
    }
    
    void disable_touch() {
        touch_active_ = false;
        std::cout << "Touch input disabled\\n";
    }
};

// Even more complex: Multiple diamond inheritance
class NetworkDevice : public virtual Device {
protected:
    std::string network_interface_;
    bool network_connected_;
    
public:
    NetworkDevice(const std::string& id, const std::string& interface)
        : Device(id + "_network"), network_interface_(interface), network_connected_(false) {
        std::cout << "NetworkDevice(" << interface << ") constructed\\n";
    }
    
    virtual ~NetworkDevice() {
        std::cout << "NetworkDevice destroyed\\n";
        if (network_connected_) {
            disconnect_network();
        }
    }
    
    void connect_network() {
        network_connected_ = true;
        std::cout << "Connected to network via " << network_interface_ << "\\n";
    }
    
    void disconnect_network() {
        network_connected_ = false;
        std::cout << "Disconnected from network\\n";
    }
};

class SmartDisplay : public TouchScreen, public NetworkDevice {
private:
    std::string current_url_;
    std::thread network_thread_;
    std::atomic<bool> running_;
    
public:
    SmartDisplay(const std::string& id, int width, int height, const std::string& interface)
        : Device(id + "_smartdisplay"),  // ✅ Single Device base
          TouchScreen(id, width, height),
          NetworkDevice(id, interface),
          current_url_("about:blank"), running_(false) {
        std::cout << "SmartDisplay constructed\\n";
    }
    
    ~SmartDisplay() override {
        std::cout << "SmartDisplay destroyed\\n";
        stop_network_thread();
    }
    
    void initialize() override {
        TouchScreen::initialize();  // Calls Device::initialize() once
        connect_network();
        start_network_thread();
    }
    
    void start_network_thread() {
        running_ = true;
        network_thread_ = std::thread([this]() {
            while (running_) {
                // Simulate network activity
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
            }
        });
    }
    
    void stop_network_thread() {
        if (running_) {
            running_ = false;
            if (network_thread_.joinable()) {
                network_thread_.join();
            }
        }
    }
    
    void load_url(const std::string& url) {
        current_url_ = url;
        output_queue_.push("Loading: " + url);
    }
};

void demonstrate_diamond_inheritance() {
    std::cout << "=== Diamond Inheritance Demo ===\\n";
    
    {
        auto smart_display = std::make_unique<SmartDisplay>("living_room", 1920, 1080, "eth0");
        smart_display->initialize();
        smart_display->load_url("https://example.com");
        smart_display->process_input();
        smart_display->process_output();
    }
    
    std::cout << "\\nDestruction order with virtual destructors:\\n";
    std::cout << "1. ~SmartDisplay()\\n";
    std::cout << "2. ~NetworkDevice()\\n";  
    std::cout << "3. ~TouchScreen()\\n";
    std::cout << "4. ~OutputDevice()\\n";
    std::cout << "5. ~InputDevice()\\n";
    std::cout << "6. ~Device() (called only once due to virtual inheritance)\\n";
    
    // Without virtual destructors and virtual inheritance:
    // - Multiple Device destructors would be called
    // - Resource cleanup would be duplicated or missed
    // - Undefined behavior in complex scenarios
}` : `// Herencia diamante con destructores virtuales
class Dispositivo {
protected:
    std::string id_dispositivo_;
    bool esta_inicializado_;
    
public:
    Dispositivo(const std::string& id) : id_dispositivo_(id), esta_inicializado_(false) {
        std::cout << "Dispositivo(" << id_dispositivo_ << ") construido\\n";
    }
    
    // Destructor virtual para base polimórfica
    virtual ~Dispositivo() {
        std::cout << "Dispositivo(" << id_dispositivo_ << ") destruido\\n";
        if (esta_inicializado_) {
            limpiar_dispositivo();
        }
    }
    
    virtual void inicializar() {
        esta_inicializado_ = true;
        std::cout << "Dispositivo " << id_dispositivo_ << " inicializado\\n";
    }
    
    virtual void limpiar_dispositivo() {
        std::cout << "Limpieza de dispositivo " << id_dispositivo_ << " completada\\n";
    }
    
    const std::string& id() const { return id_dispositivo_; }
};

// Herencia virtual para evitar problema diamante
class DispositivoEntrada : public virtual Dispositivo {
protected:
    std::vector<int> buffer_entrada_;
    
public:
    DispositivoEntrada(const std::string& id) : Dispositivo(id + "_entrada") {
        buffer_entrada_.reserve(1024);
        std::cout << "DispositivoEntrada construido\\n";
    }
    
    virtual ~DispositivoEntrada() {
        std::cout << "DispositivoEntrada destruido\\n";
        vaciar_buffer_entrada();
    }
    
    virtual void procesar_entrada() = 0;
    
    void vaciar_buffer_entrada() {
        if (!buffer_entrada_.empty()) {
            std::cout << "Vaciando " << buffer_entrada_.size() << " eventos de entrada\\n";
            buffer_entrada_.clear();
        }
    }
};

class DispositivoSalida : public virtual Dispositivo {
protected:
    std::queue<std::string> cola_salida_;
    
public:
    DispositivoSalida(const std::string& id) : Dispositivo(id + "_salida") {
        std::cout << "DispositivoSalida construido\\n";
    }
    
    virtual ~DispositivoSalida() {
        std::cout << "DispositivoSalida destruido\\n";
        vaciar_cola_salida();
    }
    
    virtual void procesar_salida() = 0;
    
    void vaciar_cola_salida() {
        if (!cola_salida_.empty()) {
            std::cout << "Vaciando " << cola_salida_.size() << " mensajes de salida\\n";
            while (!cola_salida_.empty()) cola_salida_.pop();
        }
    }
};

// Patrón diamante: hereda de DispositivoEntrada y DispositivoSalida
class PantallaTactil : public DispositivoEntrada, public DispositivoSalida {
private:
    int ancho_pantalla_, alto_pantalla_;
    std::unique_ptr<uint32_t[]> buffer_frame_;
    bool tacto_activo_;
    
public:
    PantallaTactil(const std::string& id, int ancho, int alto)
        : Dispositivo(id + "_pantalla_tactil"),  // ✅ Solo una construcción de Dispositivo
          DispositivoEntrada(id), DispositivoSalida(id),
          ancho_pantalla_(ancho), alto_pantalla_(alto),
          buffer_frame_(std::make_unique<uint32_t[]>(ancho * alto)),
          tacto_activo_(false) {
        std::cout << "PantallaTactil(" << ancho << "x" << alto << ") construida\\n";
    }
    
    // ✅ Destructor virtual apropiadamente sobrescrito
    ~PantallaTactil() override {
        std::cout << "PantallaTactil destruida\\n";
        if (tacto_activo_) {
            deshabilitar_tacto();
        }
    }
    
    void procesar_entrada() override {
        // Simular procesamiento de entrada táctil
        buffer_entrada_.push_back(rand() % ancho_pantalla_);   // coordenada x
        buffer_entrada_.push_back(rand() % alto_pantalla_);    // coordenada y
        buffer_entrada_.push_back(1);  // evento toque presionado
    }
    
    void procesar_salida() override {
        // Simular dibujo en pantalla
        cola_salida_.push("Renderizar frame " + std::to_string(rand() % 1000));
    }
    
    void deshabilitar_tacto() {
        tacto_activo_ = false;
        std::cout << "Entrada táctil deshabilitada\\n";
    }
};

void demostrar_herencia_diamante() {
    std::cout << "=== Demo Herencia Diamante ===\\n";
    
    {
        auto pantalla = std::make_unique<PantallaTactil>("sala", 1920, 1080);
        pantalla->inicializar();
        pantalla->procesar_entrada();
        pantalla->procesar_salida();
    }
    
    std::cout << "\\nOrden de destrucción con destructores virtuales:\\n";
    std::cout << "1. ~PantallaTactil()\\n";
    std::cout << "2. ~DispositivoSalida()\\n";
    std::cout << "3. ~DispositivoEntrada()\\n";
    std::cout << "4. ~Dispositivo() (llamado solo una vez por herencia virtual)\\n";
}`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "RAII Patterns with Virtual Destructors" : "Patrones RAII con Destructores Virtuales"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "Resource Acquisition Is Initialization (RAII) combined with virtual destructors provides automatic, exception-safe resource management in polymorphic hierarchies. This pattern ensures resources are properly released regardless of how the object is destroyed." :
            "Resource Acquisition Is Initialization (RAII) combinado con destructores virtuales proporciona gestión automática y segura ante excepciones de recursos en jerarquías polimórficas. Este patrón asegura que los recursos sean liberados apropiadamente sin importar cómo se destruya el objeto."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={state.language === 'en' ? `#include <memory>
#include <fstream>
#include <mutex>
#include <thread>
#include <chrono>

// RAII base class for automatic resource management
class RAIIResource {
protected:
    std::string resource_name_;
    mutable std::mutex resource_mutex_;
    bool resource_acquired_;
    std::chrono::steady_clock::time_point acquisition_time_;
    
public:
    RAIIResource(const std::string& name) 
        : resource_name_(name), resource_acquired_(false) {
        std::cout << "RAIIResource(" << resource_name_ << ") created\\n";
    }
    
    // Virtual destructor ensures proper cleanup in derived classes
    virtual ~RAIIResource() {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (resource_acquired_) {
            auto duration = std::chrono::steady_clock::now() - acquisition_time_;
            auto seconds = std::chrono::duration_cast<std::chrono::seconds>(duration);
            std::cout << "RAIIResource(" << resource_name_ 
                      << ") held for " << seconds.count() << " seconds\\n";
        }
        std::cout << "RAIIResource(" << resource_name_ << ") destroyed\\n";
    }
    
    // Non-copyable, movable
    RAIIResource(const RAIIResource&) = delete;
    RAIIResource& operator=(const RAIIResource&) = delete;
    RAIIResource(RAIIResource&&) = default;
    RAIIResource& operator=(RAIIResource&&) = default;
    
    // Pure virtual resource management interface
    virtual bool acquire() = 0;
    virtual void release() = 0;
    virtual bool is_acquired() const = 0;
    
    const std::string& name() const { return resource_name_; }
    
protected:
    void mark_acquired() {
        resource_acquired_ = true;
        acquisition_time_ = std::chrono::steady_clock::now();
    }
    
    void mark_released() {
        resource_acquired_ = false;
    }
};

// File resource with automatic closure
class FileResource : public RAIIResource {
private:
    std::unique_ptr<std::FILE, int(*)(std::FILE*)> file_;
    std::string file_path_;
    std::string mode_;
    
public:
    FileResource(const std::string& path, const std::string& mode = "r")
        : RAIIResource("File:" + path), 
          file_(nullptr, &std::fclose),  // Custom deleter for FILE*
          file_path_(path), mode_(mode) {
        std::cout << "FileResource(" << file_path_ << ") created\\n";
        
        // Automatic acquisition in constructor (RAII)
        if (!acquire()) {
            throw std::runtime_error("Failed to open file: " + file_path_);
        }
    }
    
    ~FileResource() override {
        std::cout << "FileResource(" << file_path_ << ") destroyed\\n";
        // File automatically closed by unique_ptr's custom deleter
        // No need for explicit release() call
    }
    
    bool acquire() override {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (!file_) {
            std::FILE* raw_file = std::fopen(file_path_.c_str(), mode_.c_str());
            if (raw_file) {
                file_.reset(raw_file);
                mark_acquired();
                std::cout << "File " << file_path_ << " opened successfully\\n";
                return true;
            }
        }
        return false;
    }
    
    void release() override {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (file_) {
            std::cout << "File " << file_path_ << " closed\\n";
            file_.reset();  // Calls fclose automatically
            mark_released();
        }
    }
    
    bool is_acquired() const override {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        return file_ != nullptr;
    }
    
    // Safe file operations
    std::size_t read(void* buffer, std::size_t size, std::size_t count) {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (!file_) {
            throw std::runtime_error("Attempted to read from closed file");
        }
        return std::fread(buffer, size, count, file_.get());
    }
    
    std::size_t write(const void* buffer, std::size_t size, std::size_t count) {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (!file_) {
            throw std::runtime_error("Attempted to write to closed file");
        }
        return std::fwrite(buffer, size, count, file_.get());
    }
};

// Network connection resource
class NetworkResource : public RAIIResource {
private:
    int socket_fd_;
    std::string host_;
    int port_;
    bool connected_;
    
public:
    NetworkResource(const std::string& host, int port)
        : RAIIResource("Network:" + host + ":" + std::to_string(port)),
          socket_fd_(-1), host_(host), port_(port), connected_(false) {
        std::cout << "NetworkResource(" << host_ << ":" << port_ << ") created\\n";
        
        // Automatic connection attempt (RAII)
        acquire();
    }
    
    ~NetworkResource() override {
        std::cout << "NetworkResource(" << host_ << ":" << port_ << ") destroyed\\n";
        if (connected_) {
            release();
        }
    }
    
    bool acquire() override {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (!connected_) {
            // Simulate network connection
            socket_fd_ = socket(AF_INET, SOCK_STREAM, 0);
            if (socket_fd_ >= 0) {
                // Simulate successful connection
                connected_ = true;
                mark_acquired();
                std::cout << "Connected to " << host_ << ":" << port_ << "\\n";
                return true;
            }
        }
        return false;
    }
    
    void release() override {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (connected_ && socket_fd_ >= 0) {
            close(socket_fd_);
            socket_fd_ = -1;
            connected_ = false;
            mark_released();
            std::cout << "Disconnected from " << host_ << ":" << port_ << "\\n";
        }
    }
    
    bool is_acquired() const override {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        return connected_;
    }
    
    bool send_data(const std::string& data) {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (!connected_) return false;
        
        std::cout << "Sending: " << data.substr(0, 50) 
                  << (data.length() > 50 ? "..." : "") << "\\n";
        return true;
    }
};

// Database connection resource
class DatabaseResource : public RAIIResource {
private:
    std::string connection_string_;
    bool transaction_active_;
    std::vector<std::string> prepared_statements_;
    
public:
    DatabaseResource(const std::string& conn_str)
        : RAIIResource("Database:" + conn_str),
          connection_string_(conn_str), transaction_active_(false) {
        std::cout << "DatabaseResource created\\n";
        
        if (!acquire()) {
            throw std::runtime_error("Failed to connect to database");
        }
    }
    
    ~DatabaseResource() override {
        std::cout << "DatabaseResource destroyed\\n";
        if (transaction_active_) {
            rollback_transaction();
        }
        // Connection automatically released
    }
    
    bool acquire() override {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        // Simulate database connection
        mark_acquired();
        std::cout << "Database connection established\\n";
        return true;
    }
    
    void release() override {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (transaction_active_) {
            rollback_transaction();
        }
        prepared_statements_.clear();
        mark_released();
        std::cout << "Database connection closed\\n";
    }
    
    bool is_acquired() const override {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        return resource_acquired_;
    }
    
    void begin_transaction() {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (!resource_acquired_) {
            throw std::runtime_error("Database not connected");
        }
        transaction_active_ = true;
        std::cout << "Transaction started\\n";
    }
    
    void commit_transaction() {
        std::lock_guard<std::mutex> lock(resource_mutex_);
        if (transaction_active_) {
            transaction_active_ = false;
            std::cout << "Transaction committed\\n";
        }
    }
    
    void rollback_transaction() {
        if (transaction_active_) {
            transaction_active_ = false;
            std::cout << "Transaction rolled back\\n";
        }
    }
};

// Resource manager using polymorphism and RAII
class ResourceManager {
private:
    std::vector<std::unique_ptr<RAIIResource>> resources_;
    mutable std::mutex manager_mutex_;
    
public:
    ResourceManager() {
        std::cout << "ResourceManager created\\n";
    }
    
    ~ResourceManager() {
        std::cout << "ResourceManager destroyed\\n";
        // All resources automatically cleaned up by unique_ptr destructors
        // Virtual destructors ensure proper cleanup of derived classes
    }
    
    template<typename ResourceType, typename... Args>
    ResourceType* acquire_resource(Args&&... args) {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        
        auto resource = std::make_unique<ResourceType>(std::forward<Args>(args)...);
        ResourceType* ptr = resource.get();
        resources_.push_back(std::move(resource));
        
        std::cout << "Resource " << ptr->name() << " added to manager\\n";
        return ptr;
    }
    
    void release_all_resources() {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        std::cout << "Releasing " << resources_.size() << " resources\\n";
        resources_.clear();  // Triggers virtual destructors
    }
    
    size_t active_resource_count() const {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        return std::count_if(resources_.begin(), resources_.end(),
                           [](const auto& res) { return res->is_acquired(); });
    }
};

void demonstrate_raii_virtual_destructors() {
    std::cout << "=== RAII + Virtual Destructors Demo ===\\n";
    
    try {
        ResourceManager manager;
        
        // Acquire various resources polymorphically
        auto* file_res = manager.acquire_resource<FileResource>("/tmp/test.txt", "w");
        auto* net_res = manager.acquire_resource<NetworkResource>("example.com", 80);
        auto* db_res = manager.acquire_resource<DatabaseResource>("postgresql://localhost:5432/mydb");
        
        // Use resources
        file_res->write("Hello, RAII World!", 1, 18);
        net_res->send_data("GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n");
        
        db_res->begin_transaction();
        // Simulate database operations...
        db_res->commit_transaction();
        
        std::cout << "Active resources: " << manager.active_resource_count() << "\\n";
        
        // Exception safety demonstration
        try {
            auto* bad_file = manager.acquire_resource<FileResource>("/invalid/path/file.txt");
        } catch (const std::exception& e) {
            std::cout << "Exception caught: " << e.what() << "\\n";
            std::cout << "Other resources remain unaffected\\n";
        }
        
        // manager destructor will call virtual destructors for all resources
        // Automatic cleanup in reverse order of acquisition
        
    } catch (const std::exception& e) {
        std::cout << "Top-level exception: " << e.what() << "\\n";
        // Stack unwinding will still call all destructors properly
    }
    
    std::cout << "\\nRAII ensures exception safety:\\n";
    std::cout << "- Resources acquired in constructor\\n";
    std::cout << "- Resources released in destructor\\n";
    std::cout << "- Virtual destructors enable polymorphic cleanup\\n";
    std::cout << "- Exception safety guaranteed by stack unwinding\\n";
}` : `#include <memory>
#include <fstream>
#include <mutex>
#include <thread>
#include <chrono>

// Clase base RAII para gestión automática de recursos
class RecursoRAII {
protected:
    std::string nombre_recurso_;
    mutable std::mutex mutex_recurso_;
    bool recurso_adquirido_;
    std::chrono::steady_clock::time_point tiempo_adquisicion_;
    
public:
    RecursoRAII(const std::string& nombre) 
        : nombre_recurso_(nombre), recurso_adquirido_(false) {
        std::cout << "RecursoRAII(" << nombre_recurso_ << ") creado\\n";
    }
    
    // Destructor virtual asegura limpieza apropiada en clases derivadas
    virtual ~RecursoRAII() {
        std::lock_guard<std::mutex> lock(mutex_recurso_);
        if (recurso_adquirido_) {
            auto duracion = std::chrono::steady_clock::now() - tiempo_adquisicion_;
            auto segundos = std::chrono::duration_cast<std::chrono::seconds>(duracion);
            std::cout << "RecursoRAII(" << nombre_recurso_ 
                      << ") mantenido por " << segundos.count() << " segundos\\n";
        }
        std::cout << "RecursoRAII(" << nombre_recurso_ << ") destruido\\n";
    }
    
    // No copiable, movible
    RecursoRAII(const RecursoRAII&) = delete;
    RecursoRAII& operator=(const RecursoRAII&) = delete;
    RecursoRAII(RecursoRAII&&) = default;
    RecursoRAII& operator=(RecursoRAII&&) = default;
    
    // Interfaz virtual pura para gestión de recursos
    virtual bool adquirir() = 0;
    virtual void liberar() = 0;
    virtual bool esta_adquirido() const = 0;
    
    const std::string& nombre() const { return nombre_recurso_; }
    
protected:
    void marcar_adquirido() {
        recurso_adquirido_ = true;
        tiempo_adquisicion_ = std::chrono::steady_clock::now();
    }
    
    void marcar_liberado() {
        recurso_adquirido_ = false;
    }
};

// Recurso de archivo con cierre automático
class RecursoArchivo : public RecursoRAII {
private:
    std::unique_ptr<std::FILE, int(*)(std::FILE*)> archivo_;
    std::string ruta_archivo_;
    std::string modo_;
    
public:
    RecursoArchivo(const std::string& ruta, const std::string& modo = "r")
        : RecursoRAII("Archivo:" + ruta), 
          archivo_(nullptr, &std::fclose),  // Eliminador personalizado para FILE*
          ruta_archivo_(ruta), modo_(modo) {
        std::cout << "RecursoArchivo(" << ruta_archivo_ << ") creado\\n";
        
        // Adquisición automática en constructor (RAII)
        if (!adquirir()) {
            throw std::runtime_error("Falló al abrir archivo: " + ruta_archivo_);
        }
    }
    
    ~RecursoArchivo() override {
        std::cout << "RecursoArchivo(" << ruta_archivo_ << ") destruido\\n";
        // Archivo automáticamente cerrado por eliminador personalizado de unique_ptr
        // No necesidad de llamada explícita a liberar()
    }
    
    bool adquirir() override {
        std::lock_guard<std::mutex> lock(mutex_recurso_);
        if (!archivo_) {
            std::FILE* archivo_raw = std::fopen(ruta_archivo_.c_str(), modo_.c_str());
            if (archivo_raw) {
                archivo_.reset(archivo_raw);
                marcar_adquirido();
                std::cout << "Archivo " << ruta_archivo_ << " abierto exitosamente\\n";
                return true;
            }
        }
        return false;
    }
    
    void liberar() override {
        std::lock_guard<std::mutex> lock(mutex_recurso_);
        if (archivo_) {
            std::cout << "Archivo " << ruta_archivo_ << " cerrado\\n";
            archivo_.reset();  // Llama fclose automáticamente
            marcar_liberado();
        }
    }
    
    bool esta_adquirido() const override {
        std::lock_guard<std::mutex> lock(mutex_recurso_);
        return archivo_ != nullptr;
    }
};

void demostrar_raii_destructores_virtuales() {
    std::cout << "=== Demo RAII + Destructores Virtuales ===\\n";
    
    try {
        // Los recursos se adquieren automáticamente y se liberan cuando salen de alcance
        {
            auto archivo = std::make_unique<RecursoArchivo>("/tmp/test.txt", "w");
            std::cout << "Usando archivo...\\n";
            // Archivo se cierra automáticamente al salir de alcance
        }
        
        std::cout << "\\nRAII asegura seguridad ante excepciones:\\n";
        std::cout << "- Recursos adquiridos en constructor\\n";
        std::cout << "- Recursos liberados en destructor\\n";
        std::cout << "- Destructores virtuales permiten limpieza polimórfica\\n";
        std::cout << "- Seguridad ante excepciones garantizada por desenrollado de pila\\n";
        
    } catch (const std::exception& e) {
        std::cout << "Excepción: " << e.what() << "\\n";
        // El desenrollado de pila aún llamará todos los destructores apropiadamente
    }
}`}
        />
      </Section>

      <PerformanceComparison
        scenarios={[
          {
            name: state.language === 'en' ? 'Non-Virtual Destructor' : 'Destructor No Virtual',
            metrics: {
              [state.language === 'en' ? 'Memory Overhead' : 'Sobrecarga Memoria']: '0 bytes',
              [state.language === 'en' ? 'Call Overhead' : 'Sobrecarga Llamada']: '0 cycles',
              [state.language === 'en' ? 'Memory Safety' : 'Seguridad Memoria']: state.language === 'en' ? 'UNSAFE' : 'INSEGURO',
              [state.language === 'en' ? 'Polymorphic Support' : 'Soporte Polimórfico']: state.language === 'en' ? 'None' : 'Ninguno'
            }
          },
          {
            name: state.language === 'en' ? 'Virtual Destructor' : 'Destructor Virtual',
            metrics: {
              [state.language === 'en' ? 'Memory Overhead' : 'Sobrecarga Memoria']: '8 bytes/object',
              [state.language === 'en' ? 'Call Overhead' : 'Sobrecarga Llamada']: '2-3 cycles',
              [state.language === 'en' ? 'Memory Safety' : 'Seguridad Memoria']: state.language === 'en' ? 'SAFE' : 'SEGURO',
              [state.language === 'en' ? 'Polymorphic Support' : 'Soporte Polimórfico']: state.language === 'en' ? 'Complete' : 'Completo'
            }
          },
          {
            name: state.language === 'en' ? 'Pure Virtual Destructor' : 'Destructor Virtual Puro',
            metrics: {
              [state.language === 'en' ? 'Memory Overhead' : 'Sobrecarga Memoria']: '8 bytes/object',
              [state.language === 'en' ? 'Call Overhead' : 'Sobrecarga Llamada']: '2-3 cycles',
              [state.language === 'en' ? 'Memory Safety' : 'Seguridad Memoria']: state.language === 'en' ? 'SAFE' : 'SEGURO',
              [state.language === 'en' ? 'Polymorphic Support' : 'Soporte Polimórfico']: state.language === 'en' ? 'Abstract Base' : 'Base Abstracta'
            }
          }
        ]}
      />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Practical Exercises" : "Ejercicios Prácticos"}
        </SectionTitle>
        
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>{state.language === 'en' ? "Exercise 1: Polymorphic Resource Manager" : "Ejercicio 1: Gestor de Recursos Polimórfico"}</h4>
          <p>
            {state.language === 'en' ? 
              "Design and implement a complete resource management system using virtual destructors, RAII principles, and exception safety. Include file, network, and memory resources." :
              "Diseña e implementa un sistema completo de gestión de recursos usando destructores virtuales, principios RAII y seguridad ante excepciones. Incluye recursos de archivo, red y memoria."
            }
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>{state.language === 'en' ? "Exercise 2: Template Hierarchy with Virtual Destructors" : "Ejercicio 2: Jerarquía de Plantillas con Destructores Virtuales"}</h4>
          <p>
            {state.language === 'en' ? 
              "Create a template-based inheritance hierarchy that properly handles virtual destructors across different template instantiations and specializations." :
              "Crea una jerarquía de herencia basada en plantillas que maneje apropiadamente destructores virtuales a través de diferentes instanciaciones y especializaciones de plantillas."
            }
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>{state.language === 'en' ? "Exercise 3: Exception-Safe Destruction Chain" : "Ejercicio 3: Cadena de Destrucción Segura ante Excepciones"}</h4>
          <p>
            {state.language === 'en' ? 
              "Implement a complex inheritance hierarchy where destructors must handle exceptions safely while ensuring all resources are properly cleaned up even in error scenarios." :
              "Implementa una jerarquía de herencia compleja donde los destructores deben manejar excepciones de forma segura mientras aseguran que todos los recursos sean limpiados apropiadamente incluso en escenarios de error."
            }
          </p>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Key Takeaways" : "Puntos Clave"}
        </SectionTitle>
        
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            {state.language === 'en' ? 
              "Virtual destructors are mandatory for any class used polymorphically - no exceptions" :
              "Los destructores virtuales son obligatorios para cualquier clase usada polimórficamente - sin excepciones"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Pure virtual destructors enable abstract base classes while requiring implementation" :
              "Los destructores virtuales puros permiten clases base abstractas mientras requieren implementación"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Virtual inheritance with virtual destructors prevents double-destruction in diamond patterns" :
              "La herencia virtual con destructores virtuales previene doble-destrucción en patrones diamante"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "RAII combined with virtual destructors provides automatic exception-safe resource management" :
              "RAII combinado con destructores virtuales proporciona gestión automática de recursos segura ante excepciones"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "The cost of virtual destructors (8 bytes + 2-3 cycles) is always justified for polymorphic hierarchies" :
              "El costo de los destructores virtuales (8 bytes + 2-3 ciclos) siempre está justificado para jerarquías polimórficas"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Modern C++ features (override, final) enhance virtual destructor safety and clarity" :
              "Las características de C++ moderno (override, final) mejoran la seguridad y claridad de los destructores virtuales"
            }
          </li>
        </ul>
      </Section>
    </LessonLayout>
  );
};

export default Lesson81_VirtualDestructors;