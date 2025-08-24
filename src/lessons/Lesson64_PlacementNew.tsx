import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LessonLayout, Section, SectionTitle, InteractiveSection,
  LearningObjectives, Button, CodeBlock, PerformanceMonitor,
  AccessibilityAnnouncer, theme, type LessonProgress 
} from '../design-system';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import * as THREE from 'three';

interface PlacementNewState {
  demonstrationType: 'basic' | 'alignment' | 'array' | 'lifetime';
  currentStep: number;
  memoryPool: {
    address: number;
    size: number;
    used: boolean;
    objectType: string;
    constructed: boolean;
  }[];
  constructionHistory: {
    step: number;
    address: number;
    action: 'allocate' | 'construct' | 'destruct' | 'deallocate';
    type: string;
    timestamp: number;
  }[];
  alignment: {
    requested: number;
    actual: number;
    padding: number;
  };
}

const PlacementNewVisualization: React.FC<{ state: PlacementNewState }> = ({ state }) => {
  const scenarios = [
    {
      title: 'Basic Placement New',
      description: 'Manual object construction in pre-allocated memory',
      memoryLayout: state.memoryPool.slice(0, 4).map((block, index) => ({
        ...block,
        position: [index * 2.5 - 3.75, 2, 0] as [number, number, number],
        color: block.constructed ? '#2ed573' : block.used ? '#ffa500' : '#57606f'
      }))
    },
    {
      title: 'Alignment Requirements',
      description: 'Memory alignment for different types',
      memoryLayout: state.memoryPool.slice(0, 6).map((block, index) => ({
        ...block,
        position: [index * 1.5 - 3.75, 2, 0] as [number, number, number],
        color: (block.address % state.alignment.requested === 0) ? '#2ed573' : '#ff4757',
        aligned: block.address % state.alignment.requested === 0
      }))
    },
    {
      title: 'Array Placement New',
      description: 'Constructing arrays with placement new',
      memoryLayout: state.memoryPool.slice(0, 8).map((block, index) => ({
        ...block,
        position: [index * 1.2 - 4.2, 2, 0] as [number, number, number],
        color: block.constructed ? '#00d4ff' : block.used ? '#ffa500' : '#57606f',
        arrayElement: index < 5
      }))
    },
    {
      title: 'Object Lifetime Management',
      description: 'Construction and destruction lifecycle',
      memoryLayout: state.memoryPool.slice(0, 3).map((block, index) => ({
        ...block,
        position: [index * 3 - 3, 2, 0] as [number, number, number],
        color: block.constructed ? '#2ed573' : block.used ? '#e74c3c' : '#57606f',
        lifetime: block.constructed ? 'active' : block.used ? 'allocated' : 'free'
      }))
    }
  ];

  const currentScenario = scenarios[state.currentStep] || scenarios[0];

  const getLifecycleColor = (stage: string) => {
    switch (stage) {
      case 'free': return '#57606f';
      case 'allocated': return '#ffa500';
      case 'constructed': return '#2ed573';
      case 'destructed': return '#e74c3c';
      default: return '#57606f';
    }
  };

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Title */}
      <Text
        position={[0, 4.5, 0]}
        fontSize={0.3}
        color="#00d4ff"
        anchorX="center"
      >
        {currentScenario.title}
      </Text>
      
      <Text
        position={[0, 4, 0]}
        fontSize={0.15}
        color="#ffa500"
        anchorX="center"
      >
        {currentScenario.description}
      </Text>

      {/* Memory Pool Visualization */}
      <group position={[0, 2, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
        >
          Memory Pool
        </Text>
        
        {currentScenario.memoryLayout.map((block, index) => (
          <group key={index} position={block.position}>
            {/* Memory block */}
            <Box args={[2, 1.2, 0.4]}>
              <meshStandardMaterial 
                color={block.color}
                transparent 
                opacity={0.8} 
              />
            </Box>
            
            {/* Address label */}
            <Text
              position={[0, -0.8, 0]}
              fontSize={0.1}
              color="#888"
              anchorX="center"
            >
              0x{block.address.toString(16).toUpperCase()}
            </Text>
            
            {/* Type label */}
            <Text
              position={[0, 0.1, 0.3]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {block.objectType || 'Free'}
            </Text>
            
            {/* Status indicator */}
            <Text
              position={[0, -0.1, 0.3]}
              fontSize={0.07}
              color="white"
              anchorX="center"
            >
              {block.constructed ? 'Constructed' : block.used ? 'Allocated' : 'Free'}
            </Text>
            
            {/* Alignment indicator for alignment scenario */}
            {'aligned' in block && (
              <Text
                position={[0, 0.7, 0]}
                fontSize={0.06}
                color={block.aligned ? '#2ed573' : '#ff4757'}
                anchorX="center"
              >
                {block.aligned ? '✓ Aligned' : '✗ Misaligned'}
              </Text>
            )}
            
            {/* Array element indicator */}
            {'arrayElement' in block && block.arrayElement && (
              <Text
                position={[0, -0.3, 0.3]}
                fontSize={0.06}
                color="#00d4ff"
                anchorX="center"
              >
                [{index}]
              </Text>
            )}
          </group>
        ))}
      </group>

      {/* Construction Timeline */}
      <group position={[0, 0, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.18}
          color="#ffffff"
          anchorX="center"
        >
          Construction Timeline
        </Text>
        
        {state.constructionHistory.slice(-4).map((event, index) => (
          <group key={index} position={[index * 2 - 3, 0, 0]}>
            <Box args={[1.8, 0.6, 0.2]}>
              <meshStandardMaterial 
                color={
                  event.action === 'construct' ? '#2ed573' :
                  event.action === 'destruct' ? '#ff4757' :
                  event.action === 'allocate' ? '#ffa500' : '#57606f'
                }
                transparent 
                opacity={0.7} 
              />
            </Box>
            
            <Text
              position={[0, 0.1, 0.15]}
              fontSize={0.06}
              color="white"
              anchorX="center"
            >
              {event.action.toUpperCase()}
            </Text>
            
            <Text
              position={[0, -0.1, 0.15]}
              fontSize={0.05}
              color="white"
              anchorX="center"
            >
              {event.type}
            </Text>
            
            <Text
              position={[0, -0.35, 0]}
              fontSize={0.04}
              color="#888"
              anchorX="center"
            >
              0x{event.address.toString(16)}
            </Text>
          </group>
        ))}
      </group>

      {/* Alignment Information */}
      {state.demonstrationType === 'alignment' && (
        <group position={[0, -1.5, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.15}
            color="#2ed573"
            anchorX="center"
          >
            Alignment Analysis
          </Text>
          
          <Text
            position={[-2, 0, 0]}
            fontSize={0.1}
            color="#00d4ff"
            anchorX="center"
          >
            Requested: {state.alignment.requested} bytes
          </Text>
          
          <Text
            position={[0, 0, 0]}
            fontSize={0.1}
            color="#ffa500"
            anchorX="center"
          >
            Actual: {state.alignment.actual} bytes
          </Text>
          
          <Text
            position={[2, 0, 0]}
            fontSize={0.1}
            color="#e74c3c"
            anchorX="center"
          >
            Padding: {state.alignment.padding} bytes
          </Text>
        </group>
      )}

      {/* Performance Stats */}
      <group position={[0, -2.5, 0]}>
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
        >
          Memory Statistics
        </Text>
        
        <Text
          position={[-2, -0.1, 0]}
          fontSize={0.08}
          color="#2ed573"
          anchorX="center"
        >
          Objects: {state.memoryPool.filter(b => b.constructed).length}
        </Text>
        
        <Text
          position={[0, -0.1, 0]}
          fontSize={0.08}
          color="#ffa500"
          anchorX="center"
        >
          Allocated: {state.memoryPool.filter(b => b.used).length}
        </Text>
        
        <Text
          position={[2, -0.1, 0]}
          fontSize={0.08}
          color="#57606f"
          anchorX="center"
        >
          Free: {state.memoryPool.filter(b => !b.used).length}
        </Text>
      </group>
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson64_PlacementNew: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<PlacementNewState>({
    demonstrationType: 'basic',
    currentStep: 0,
    memoryPool: [
      { address: 0x1000, size: 32, used: false, objectType: '', constructed: false },
      { address: 0x1020, size: 32, used: false, objectType: '', constructed: false },
      { address: 0x1040, size: 32, used: false, objectType: '', constructed: false },
      { address: 0x1060, size: 32, used: false, objectType: '', constructed: false },
      { address: 0x1080, size: 32, used: false, objectType: '', constructed: false },
      { address: 0x10A0, size: 32, used: false, objectType: '', constructed: false },
      { address: 0x10C0, size: 32, used: false, objectType: '', constructed: false },
      { address: 0x10E0, size: 32, used: false, objectType: '', constructed: false }
    ],
    constructionHistory: [],
    alignment: {
      requested: 8,
      actual: 8,
      padding: 0
    }
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 6,
    completedSteps: [],
    score: 0
  });

  const codeExamples = {
    basic: `// Basic placement new syntax
#include <new>
#include <memory>

void basic_placement_new() {
    // Step 1: Allocate raw memory
    alignas(int) char buffer[sizeof(int)];
    
    // Step 2: Construct object in place
    int* ptr = new(buffer) int(42);
    
    // Step 3: Use the object
    std::cout << "Value: " << *ptr << std::endl;  // Output: 42
    
    // Step 4: Manually destroy (no delete!)
    ptr->~int();
    
    // Note: buffer is stack allocated, so no delete needed
}`,
    
    classes: `// Placement new with classes
#include <new>
#include <string>

class MyClass {
private:
    std::string name;
    int value;
    
public:
    MyClass(const std::string& n, int v) : name(n), value(v) {
        std::cout << "Constructed: " << name << std::endl;
    }
    
    ~MyClass() {
        std::cout << "Destroyed: " << name << std::endl;
    }
    
    void print() const {
        std::cout << name << ": " << value << std::endl;
    }
};

void class_placement_new() {
    // Allocate memory for MyClass
    alignas(MyClass) char buffer[sizeof(MyClass)];
    
    // Construct MyClass object in buffer
    MyClass* obj = new(buffer) MyClass("PlacementObject", 100);
    
    // Use the object
    obj->print();  // Output: PlacementObject: 100
    
    // CRITICAL: Manual destruction required!
    obj->~MyClass();  // Calls destructor explicitly
    
    // Buffer goes out of scope automatically
}`,
    
    alignment: `// Alignment considerations
#include <new>
#include <memory>

struct AlignedStruct {
    alignas(16) double data[2];  // Requires 16-byte alignment
    int count;
};

void alignment_placement_new() {
    // Method 1: Use alignas in buffer declaration
    alignas(AlignedStruct) char buffer1[sizeof(AlignedStruct)];
    AlignedStruct* obj1 = new(buffer1) AlignedStruct{{1.0, 2.0}, 2};
    
    // Method 2: Use std::aligned_storage (deprecated in C++23)
    std::aligned_storage_t<sizeof(AlignedStruct), alignof(AlignedStruct)> buffer2;
    AlignedStruct* obj2 = new(&buffer2) AlignedStruct{{3.0, 4.0}, 4};
    
    // Method 3: Dynamic aligned allocation
    void* raw_memory = std::aligned_alloc(alignof(AlignedStruct), sizeof(AlignedStruct));
    AlignedStruct* obj3 = new(raw_memory) AlignedStruct{{5.0, 6.0}, 6};
    
    // Check alignments
    assert(reinterpret_cast<uintptr_t>(obj1) % alignof(AlignedStruct) == 0);
    assert(reinterpret_cast<uintptr_t>(obj2) % alignof(AlignedStruct) == 0);
    assert(reinterpret_cast<uintptr_t>(obj3) % alignof(AlignedStruct) == 0);
    
    // Cleanup
    obj1->~AlignedStruct();
    obj2->~AlignedStruct();
    obj3->~AlignedStruct();
    std::free(raw_memory);  // Don't forget!
}`,
    
    arrays: `// Placement new with arrays
#include <new>
#include <memory>

void array_placement_new() {
    constexpr size_t N = 5;
    
    // Allocate memory for array of objects
    alignas(int) char buffer[sizeof(int) * N];
    
    // Method 1: Array placement new (C++98)
    int* array1 = new(buffer) int[N];  // Default constructed
    
    // Initialize elements
    for (size_t i = 0; i < N; ++i) {
        array1[i] = static_cast<int>(i * 10);
    }
    
    // PROBLEM: How do we destroy? No array destructor syntax!
    // array1->~int[N]();  // ❌ This doesn't exist!
    
    // For trivial types like int, this works:
    // (No explicit destruction needed for trivial types)
    
    // Method 2: Manual element-wise construction (safer)
    alignas(std::string) char buffer2[sizeof(std::string) * N];
    std::string* strings = reinterpret_cast<std::string*>(buffer2);
    
    // Construct each element individually
    for (size_t i = 0; i < N; ++i) {
        new(strings + i) std::string("String " + std::to_string(i));
    }
    
    // Use the array
    for (size_t i = 0; i < N; ++i) {
        std::cout << strings[i] << std::endl;
    }
    
    // Destroy each element individually
    for (size_t i = 0; i < N; ++i) {
        strings[i].~std::string();  // ✅ This works
    }
}`,
    
    memory_pool: `// Custom memory pool using placement new
#include <new>
#include <vector>
#include <memory>

template<typename T, size_t PoolSize>
class MemoryPool {
private:
    alignas(T) char pool[sizeof(T) * PoolSize];
    std::vector<bool> used;
    
public:
    MemoryPool() : used(PoolSize, false) {}
    
    template<typename... Args>
    T* construct(Args&&... args) {
        // Find free slot
        for (size_t i = 0; i < PoolSize; ++i) {
            if (!used[i]) {
                used[i] = true;
                // Placement new with perfect forwarding
                return new(pool + i * sizeof(T)) T(std::forward<Args>(args)...);
            }
        }
        return nullptr;  // Pool exhausted
    }
    
    void destroy(T* obj) {
        // Calculate index
        ptrdiff_t index = (reinterpret_cast<char*>(obj) - pool) / sizeof(T);
        if (index >= 0 && index < PoolSize && used[index]) {
            obj->~T();  // Manual destruction
            used[index] = false;
        }
    }
    
    ~MemoryPool() {
        // Destroy all remaining objects
        for (size_t i = 0; i < PoolSize; ++i) {
            if (used[i]) {
                reinterpret_cast<T*>(pool + i * sizeof(T))->~T();
            }
        }
    }
};

// Usage example
void memory_pool_example() {
    MemoryPool<std::string, 10> pool;
    
    // Allocate objects from pool
    std::string* str1 = pool.construct("Hello");
    std::string* str2 = pool.construct("World");
    std::string* str3 = pool.construct("Placement New");
    
    // Use objects
    std::cout << *str1 << " " << *str2 << " " << *str3 << std::endl;
    
    // Return objects to pool
    pool.destroy(str2);  // str2 slot becomes available
    
    // Reuse the slot
    std::string* str4 = pool.construct("Reused Slot");
    std::cout << *str4 << std::endl;
    
    // Remaining objects destroyed automatically by ~MemoryPool()
}`,
    
    common_mistakes: `// Common placement new mistakes and solutions
#include <new>
#include <memory>

void common_mistakes() {
    // ❌ MISTAKE 1: Forgetting alignment
    char buffer1[sizeof(double)];  // Might not be aligned for double!
    double* d1 = new(buffer1) double(3.14);  // Undefined behavior if misaligned
    
    // ✅ CORRECT: Proper alignment
    alignas(double) char buffer2[sizeof(double)];
    double* d2 = new(buffer2) double(3.14);  // Safe
    
    // ❌ MISTAKE 2: Using delete instead of destructor
    MyClass* obj = new(buffer2) MyClass("Test", 42);
    delete obj;  // ❌ WRONG! This tries to deallocate stack memory!
    
    // ✅ CORRECT: Manual destructor call
    obj->~MyClass();  // ✅ CORRECT
    
    // ❌ MISTAKE 3: Buffer too small
    char small_buffer[4];  // Only 4 bytes
    std::string* str = new(small_buffer) std::string("Long string");  // UB!
    
    // ✅ CORRECT: Proper size calculation
    alignas(std::string) char proper_buffer[sizeof(std::string)];
    std::string* str2 = new(proper_buffer) std::string("Any string");
    
    // ❌ MISTAKE 4: Double destruction
    str2->~std::string();  // First destruction - OK
    str2->~std::string();  // ❌ Second destruction - UB!
    
    // ❌ MISTAKE 5: Using object after destruction
    str2->~std::string();  // Object destroyed
    str2->length();        // ❌ UB! Object no longer exists
    
    // ❌ MISTAKE 6: Mixing placement new with regular delete
    void* memory = std::malloc(sizeof(MyClass));
    MyClass* obj2 = new(memory) MyClass("Heap", 100);
    delete obj2;  // ❌ WRONG! Use destructor + free
    
    // ✅ CORRECT cleanup for malloc'd memory
    obj2->~MyClass();
    std::free(memory);
}`
  };

  const scenarios = [
    {
      title: 'Basic Placement New',
      code: codeExamples.basic,
      explanation: state.language === 'en' 
        ? 'Learn the fundamental syntax of placement new for manual object construction.'
        : 'Aprende la sintaxis fundamental de placement new para construcción manual de objetos.'
    },
    {
      title: 'Class Objects',
      code: codeExamples.classes,
      explanation: state.language === 'en'
        ? 'Construct class objects with placement new and handle proper destruction.'
        : 'Construye objetos de clase con placement new y maneja la destrucción adecuada.'
    },
    {
      title: 'Alignment Requirements',
      code: codeExamples.alignment,
      explanation: state.language === 'en'
        ? 'Understand memory alignment requirements for different types.'
        : 'Entiende los requisitos de alineación de memoria para diferentes tipos.'
    },
    {
      title: 'Array Construction',
      code: codeExamples.arrays,
      explanation: state.language === 'en'
        ? 'Handle arrays with placement new and element-wise destruction.'
        : 'Maneja arrays con placement new y destrucción elemento por elemento.'
    },
    {
      title: 'Memory Pool',
      code: codeExamples.memory_pool,
      explanation: state.language === 'en'
        ? 'Implement a custom memory pool using placement new for efficient allocation.'
        : 'Implementa un pool de memoria personalizado usando placement new para asignación eficiente.'
    },
    {
      title: 'Common Mistakes',
      code: codeExamples.common_mistakes,
      explanation: state.language === 'en'
        ? 'Avoid common pitfalls and undefined behavior with placement new.'
        : 'Evita errores comunes y comportamiento indefinido con placement new.'
    }
  ];

  const simulateConstruction = () => {
    setLessonState(prev => {
      const availableSlot = prev.memoryPool.find(block => !block.used);
      if (!availableSlot) return prev;

      const newHistory = [...prev.constructionHistory, {
        step: prev.constructionHistory.length + 1,
        address: availableSlot.address,
        action: 'construct' as const,
        type: 'MyClass',
        timestamp: Date.now()
      }];

      return {
        ...prev,
        memoryPool: prev.memoryPool.map(block => 
          block.address === availableSlot.address 
            ? { ...block, used: true, constructed: true, objectType: 'MyClass' }
            : block
        ),
        constructionHistory: newHistory
      };
    });
  };

  const simulateDestruction = () => {
    setLessonState(prev => {
      const constructedSlot = prev.memoryPool.find(block => block.constructed);
      if (!constructedSlot) return prev;

      const newHistory = [...prev.constructionHistory, {
        step: prev.constructionHistory.length + 1,
        address: constructedSlot.address,
        action: 'destruct' as const,
        type: 'MyClass',
        timestamp: Date.now()
      }];

      return {
        ...prev,
        memoryPool: prev.memoryPool.map(block => 
          block.address === constructedSlot.address 
            ? { ...block, constructed: false, objectType: '' }
            : block
        ),
        constructionHistory: newHistory
      };
    });
  };

  const nextStep = () => {
    setLessonState(prev => ({
      ...prev,
      currentStep: (prev.currentStep + 1) % 4,
      demonstrationType: ['basic', 'alignment', 'array', 'lifetime'][
        (prev.currentStep + 1) % 4
      ] as PlacementNewState['demonstrationType']
    }));
  };

  const resetDemo = () => {
    setLessonState(prev => ({
      ...prev,
      memoryPool: prev.memoryPool.map(block => ({
        ...block,
        used: false,
        constructed: false,
        objectType: ''
      })),
      constructionHistory: []
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Master placement new syntax and semantics' : 'Dominar la sintaxis y semántica de placement new',
    state.language === 'en' ? 'Understand alignment requirements and considerations' : 'Entender requisitos y consideraciones de alineación',
    state.language === 'en' ? 'Handle manual object construction and destruction' : 'Manejar construcción y destrucción manual de objetos',
    state.language === 'en' ? 'Implement memory pools and custom allocators' : 'Implementar pools de memoria y allocators personalizados',
    state.language === 'en' ? 'Avoid common placement new pitfalls' : 'Evitar errores comunes de placement new'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Placement New Fundamentals" : "Fundamentos de Placement New"}
      subtitle={state.language === 'en' 
        ? "Master manual object construction in pre-allocated memory" 
        : "Domina la construcción manual de objetos en memoria pre-asignada"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🏗️ Placement New Fundamentals' : '🏗️ Fundamentos de Placement New'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'Placement new allows you to construct objects in pre-allocated memory, giving you complete control over object lifetime and memory layout. This is essential for memory pools, embedded systems, and high-performance applications.'
            : 'Placement new te permite construir objetos en memoria pre-asignada, dándote control completo sobre el tiempo de vida del objeto y el diseño de memoria. Esto es esencial para pools de memoria, sistemas embebidos y aplicaciones de alto rendimiento.'}
        </p>

        <div style={{ height: '500px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <PlacementNewVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive Placement New Demo' : '🧪 Demo Interactivo de Placement New'}
        </SectionTitle>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button onClick={simulateConstruction}>
            {state.language === 'en' ? 'Construct Object' : 'Construir Objeto'}
          </Button>
          <Button onClick={simulateDestruction}>
            {state.language === 'en' ? 'Destroy Object' : 'Destruir Objeto'}
          </Button>
          <Button onClick={nextStep}>
            {state.language === 'en' ? 'Next Scenario' : 'Siguiente Escenario'} ({lessonState.currentStep + 1}/4)
          </Button>
          <Button onClick={resetDemo}>
            {state.language === 'en' ? 'Reset Demo' : 'Reiniciar Demo'}
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div>
            <h4>{scenarios[lessonState.currentStep].title}</h4>
            <p>{scenarios[lessonState.currentStep].explanation}</p>
            
            <CodeBlock
              language="cpp"
              showLineNumbers={true}
            >
              {scenarios[lessonState.currentStep].code}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Key Principles' : 'Principios Clave'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Separate allocation from construction' : 'Separar asignación de construcción'}</li>
              <li>{state.language === 'en' ? 'Manual destructor calls required' : 'Llamadas manuales al destructor requeridas'}</li>
              <li>{state.language === 'en' ? 'Never use delete with placement new' : 'Nunca usar delete con placement new'}</li>
              <li>{state.language === 'en' ? 'Ensure proper alignment' : 'Asegurar alineación apropiada'}</li>
              <li>{state.language === 'en' ? 'Buffer must be large enough' : 'Buffer debe ser suficientemente grande'}</li>
            </ul>

            <h4 style={{ marginTop: '20px' }}>{state.language === 'en' ? 'Current Step' : 'Paso Actual'}</h4>
            <p>
              {state.demonstrationType === 'basic' && (state.language === 'en' ? 'Basic placement new syntax' : 'Sintaxis básica de placement new')}
              {state.demonstrationType === 'alignment' && (state.language === 'en' ? 'Memory alignment requirements' : 'Requisitos de alineación de memoria')}
              {state.demonstrationType === 'array' && (state.language === 'en' ? 'Array construction patterns' : 'Patrones de construcción de arrays')}
              {state.demonstrationType === 'lifetime' && (state.language === 'en' ? 'Object lifetime management' : 'Gestión del tiempo de vida del objeto')}
            </p>
          </div>
        </div>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '⚠️ Critical Safety Rules' : '⚠️ Reglas Críticas de Seguridad'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '15px', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid #ff4757', borderRadius: '8px' }}>
            <h4 style={{ color: '#ff4757' }}>{state.language === 'en' ? '❌ Never Do This' : '❌ Nunca Hagas Esto'}</h4>
            <CodeBlock language="cpp">
{`// WRONG - Using delete with placement new
char buffer[sizeof(MyClass)];
MyClass* obj = new(buffer) MyClass();
delete obj;  // 💥 Undefined Behavior!

// WRONG - Buffer too small  
char small[4];
std::string* s = new(small) std::string("text"); // UB!

// WRONG - Misaligned buffer
char buffer[sizeof(double)];  // Not aligned!
double* d = new(buffer) double(3.14);  // UB!`}
            </CodeBlock>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(46, 213, 115, 0.1)', border: '1px solid #2ed573', borderRadius: '8px' }}>
            <h4 style={{ color: '#2ed573' }}>{state.language === 'en' ? '✅ Always Do This' : '✅ Siempre Haz Esto'}</h4>
            <CodeBlock language="cpp">
{`// CORRECT - Manual destructor + no delete
alignas(MyClass) char buffer[sizeof(MyClass)];
MyClass* obj = new(buffer) MyClass();
obj->~MyClass();  // ✅ Correct cleanup

// CORRECT - Proper buffer size and alignment
alignas(std::string) char buffer[sizeof(std::string)];
std::string* s = new(buffer) std::string("text");

// CORRECT - Check alignment
assert(reinterpret_cast<uintptr_t>(ptr) % alignof(T) == 0);`}
            </CodeBlock>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🚀 Advanced Patterns' : '🚀 Patrones Avanzados'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`// Advanced placement new patterns for high-performance code

// Pattern 1: RAII wrapper for placement new
template<typename T>
class PlacementWrapper {
private:
    alignas(T) char storage[sizeof(T)];
    T* obj = nullptr;
    
public:
    template<typename... Args>
    PlacementWrapper(Args&&... args) {
        obj = new(storage) T(std::forward<Args>(args)...);
    }
    
    ~PlacementWrapper() {
        if (obj) {
            obj->~T();
        }
    }
    
    T& get() { return *obj; }
    const T& get() const { return *obj; }
    
    // Non-copyable for safety
    PlacementWrapper(const PlacementWrapper&) = delete;
    PlacementWrapper& operator=(const PlacementWrapper&) = delete;
};

// Pattern 2: Stack-based object pool
template<typename T, size_t N>
class StackPool {
private:
    alignas(T) char storage[N * sizeof(T)];
    std::bitset<N> used{};
    
public:
    template<typename... Args>
    T* acquire(Args&&... args) {
        for (size_t i = 0; i < N; ++i) {
            if (!used[i]) {
                used[i] = true;
                return new(storage + i * sizeof(T)) T(std::forward<Args>(args)...);
            }
        }
        return nullptr; // Pool exhausted
    }
    
    void release(T* ptr) {
        auto offset = reinterpret_cast<char*>(ptr) - storage;
        size_t index = offset / sizeof(T);
        
        if (index < N && used[index]) {
            ptr->~T();
            used[index] = false;
        }
    }
};

// Pattern 3: Aligned allocation with placement new
template<typename T, size_t Alignment = alignof(T)>
class AlignedBuffer {
private:
    void* memory;
    
public:
    AlignedBuffer() : memory(std::aligned_alloc(Alignment, sizeof(T))) {
        if (!memory) throw std::bad_alloc();
    }
    
    ~AlignedBuffer() {
        std::free(memory);
    }
    
    template<typename... Args>
    T* construct(Args&&... args) {
        return new(memory) T(std::forward<Args>(args)...);
    }
    
    void destroy(T* obj) {
        obj->~T();
    }
};`}
        </CodeBlock>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Lesson on placement new fundamentals. Current demonstration: ${lessonState.demonstrationType}`}
      />
    </LessonLayout>
  );
};

export default Lesson64_PlacementNew;