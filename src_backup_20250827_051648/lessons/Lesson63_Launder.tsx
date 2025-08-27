import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LessonLayout, Section, SectionTitle, InteractiveSection,
  LearningObjectives, Button, CodeBlock, PerformanceMonitor,
  AccessibilityAnnouncer, theme, type LessonProgress 
} from '../design-system';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface LaunderState {
  scenario: 'basic' | 'const_change' | 'virtual_change' | 'placement_new';
  memoryAddress: string;
  originalObject: {
    type: string;
    value: string;
    constQualified: boolean;
    hasVirtual: boolean;
  };
  newObject: {
    type: string;
    value: string;
    constQualified: boolean;
    hasVirtual: boolean;
  };
  pointerValidity: {
    withoutLaunder: 'valid' | 'invalid' | 'undefined';
    withLaunder: 'valid' | 'invalid' | 'undefined';
  };
  showOptimization: boolean;
  currentStep: number;
  compilerAssumptions: string[];
}

const LaunderVisualization: React.FC<{ state: LaunderState }> = ({ state }) => {
  const getValidityColor = (validity: string) => {
    switch (validity) {
      case 'valid': return '#2ed573';
      case 'invalid': return '#ff4757';
      case 'undefined': return '#ffa500';
      default: return '#57606f';
    }
  };

  const scenarios = {
    basic: {
      title: 'Basic std::launder Usage',
      description: 'Validating pointer after object replacement',
      memoryLayout: { address: '0x1000', size: 16 }
    },
    const_change: {
      title: 'const-qualification Change',
      description: 'Changing const properties via placement new',
      memoryLayout: { address: '0x2000', size: 8 }
    },
    virtual_change: {
      title: 'Virtual Function Change',
      description: 'Replacing object with different virtual functions',
      memoryLayout: { address: '0x3000', size: 24 }
    },
    placement_new: {
      title: 'Complex Placement New',
      description: 'Multiple object constructions at same address',
      memoryLayout: { address: '0x4000', size: 32 }
    }
  };

  const currentScenario = scenarios[state.scenario];

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Title */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.3}
        color="#00d4ff"
        anchorX="center"
      >
        {currentScenario.title}
      </Text>
      
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.15}
        color="#ffa500"
        anchorX="center"
      >
        {currentScenario.description}
      </Text>

      {/* Memory Location */}
      <group position={[0, 2.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.18}
          color="white"
          anchorX="center"
        >
          Memory Location: {state.memoryAddress}
        </Text>
        
        <Box args={[4, 1, 0.4]}>
          <meshStandardMaterial color="#57606f" transparent opacity={0.6} />
        </Box>
        
        <Text
          position={[0, 0, 0.25]}
          fontSize={0.1}
          color="white"
          anchorX="center"
        >
          {currentScenario.memoryLayout.size} bytes
        </Text>
      </group>

      {/* Original Object */}
      <group position={[-2.5, 1, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#2ed573"
          anchorX="center"
        >
          Original Object
        </Text>
        
        <Box args={[2, 1.5, 0.3]}>
          <meshStandardMaterial 
            color="#2ed573" 
            transparent 
            opacity={0.7} 
          />
        </Box>
        
        <Text
          position={[0, 0.3, 0.2]}
          fontSize={0.1}
          color="white"
          anchorX="center"
        >
          {state.originalObject.type}
        </Text>
        
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.09}
          color="white"
          anchorX="center"
        >
          {state.originalObject.value}
        </Text>
        
        <Text
          position={[0, -0.3, 0.2]}
          fontSize={0.08}
          color={state.originalObject.constQualified ? '#ffa500' : '#888'}
          anchorX="center"
        >
          {state.originalObject.constQualified ? 'const' : 'mutable'}
        </Text>
        
        {state.originalObject.hasVirtual && (
          <Text
            position={[0, -0.5, 0.2]}
            fontSize={0.08}
            color="#00d4ff"
            anchorX="center"
          >
            virtual functions
          </Text>
        )}
      </group>

      {/* Arrow showing replacement */}
      <group position={[0, 1, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.3]} />
          <meshStandardMaterial color="#ffa500" />
        </mesh>
        
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.08}
          color="#ffa500"
          anchorX="center"
        >
          placement new
        </Text>
      </group>

      {/* New Object */}
      <group position={[2.5, 1, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#ff6b7a"
          anchorX="center"
        >
          New Object
        </Text>
        
        <Box args={[2, 1.5, 0.3]}>
          <meshStandardMaterial 
            color="#ff6b7a" 
            transparent 
            opacity={0.7} 
          />
        </Box>
        
        <Text
          position={[0, 0.3, 0.2]}
          fontSize={0.1}
          color="white"
          anchorX="center"
        >
          {state.newObject.type}
        </Text>
        
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.09}
          color="white"
          anchorX="center"
        >
          {state.newObject.value}
        </Text>
        
        <Text
          position={[0, -0.3, 0.2]}
          fontSize={0.08}
          color={state.newObject.constQualified ? '#ffa500' : '#888'}
          anchorX="center"
        >
          {state.newObject.constQualified ? 'const' : 'mutable'}
        </Text>
        
        {state.newObject.hasVirtual && (
          <Text
            position={[0, -0.5, 0.2]}
            fontSize={0.08}
            color="#00d4ff"
            anchorX="center"
          >
            virtual functions
          </Text>
        )}
      </group>

      {/* Pointer Validity Comparison */}
      <group position={[0, -0.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.18}
          color="white"
          anchorX="center"
        >
          Pointer Validity
        </Text>
        
        {/* Without launder */}
        <group position={[-2, 0, 0]}>
          <Box args={[2, 0.6, 0.3]}>
            <meshStandardMaterial 
              color={getValidityColor(state.pointerValidity.withoutLaunder)}
              transparent 
              opacity={0.8} 
            />
          </Box>
          
          <Text
            position={[0, 0.1, 0.2]}
            fontSize={0.1}
            color="white"
            anchorX="center"
          >
            Without launder
          </Text>
          
          <Text
            position={[0, -0.1, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            {state.pointerValidity.withoutLaunder.toUpperCase()}
          </Text>
        </group>
        
        {/* With launder */}
        <group position={[2, 0, 0]}>
          <Box args={[2, 0.6, 0.3]}>
            <meshStandardMaterial 
              color={getValidityColor(state.pointerValidity.withLaunder)}
              transparent 
              opacity={0.8} 
            />
          </Box>
          
          <Text
            position={[0, 0.1, 0.2]}
            fontSize={0.1}
            color="white"
            anchorX="center"
          >
            std::launder(ptr)
          </Text>
          
          <Text
            position={[0, -0.1, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            {state.pointerValidity.withLaunder.toUpperCase()}
          </Text>
        </group>
      </group>

      {/* Compiler Assumptions */}
      {state.showOptimization && (
        <group position={[0, -2, 0]}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.15}
            color="#ffa500"
            anchorX="center"
          >
            Compiler Assumptions (Without launder)
          </Text>
          
          {state.compilerAssumptions.map((assumption, index) => (
            <Text
              key={index}
              position={[0, 0.2 - index * 0.2, 0]}
              fontSize={0.08}
              color="#ff6b7a"
              anchorX="center"
            >
              • {assumption}
            </Text>
          ))}
        </group>
      )}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson63_Launder: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<LaunderState>({
    scenario: 'basic',
    memoryAddress: '0x7fff1234abcd',
    originalObject: {
      type: 'int',
      value: '42',
      constQualified: false,
      hasVirtual: false
    },
    newObject: {
      type: 'int',
      value: '100',
      constQualified: false,
      hasVirtual: false
    },
    pointerValidity: {
      withoutLaunder: 'undefined',
      withLaunder: 'valid'
    },
    showOptimization: false,
    currentStep: 0,
    compilerAssumptions: [
      'Object properties unchanged',
      'Can cache previous loads',
      'Can eliminate redundant operations'
    ]
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 6,
    completedSteps: [],
    score: 0
  });

  const scenarios = {
    basic: {
      title: 'Basic Replacement',
      originalObj: { type: 'int', value: '42', constQualified: false, hasVirtual: false },
      newObj: { type: 'int', value: '100', constQualified: false, hasVirtual: false },
      validity: { withoutLaunder: 'undefined' as const, withLaunder: 'valid' as const },
      assumptions: ['Value remains 42', 'Can optimize away loads', 'No need to check memory']
    },
    const_change: {
      title: 'const-qualification Change',
      originalObj: { type: 'int', value: '42', constQualified: true, hasVirtual: false },
      newObj: { type: 'int', value: '100', constQualified: false, hasVirtual: false },
      validity: { withoutLaunder: 'invalid' as const, withLaunder: 'valid' as const },
      assumptions: ['Object remains const', 'Modifications are UB', 'Can assume immutability']
    },
    virtual_change: {
      title: 'Virtual Function Change',
      originalObj: { type: 'BaseClass', value: 'base_impl', constQualified: false, hasVirtual: true },
      newObj: { type: 'DerivedClass', value: 'derived_impl', constQualified: false, hasVirtual: true },
      validity: { withoutLaunder: 'undefined' as const, withLaunder: 'valid' as const },
      assumptions: ['VTable unchanged', 'Can inline virtual calls', 'Type identity preserved']
    },
    placement_new: {
      title: 'Complex Placement New',
      originalObj: { type: 'ComplexObject', value: 'state_1', constQualified: false, hasVirtual: false },
      newObj: { type: 'ComplexObject', value: 'state_2', constQualified: false, hasVirtual: false },
      validity: { withoutLaunder: 'undefined' as const, withLaunder: 'valid' as const },
      assumptions: ['Internal state unchanged', 'Can cache member accesses', 'Object identity preserved']
    }
  };

  const changeScenario = (newScenario: keyof typeof scenarios) => {
    const scenarioData = scenarios[newScenario];
    setLessonState(prev => ({
      ...prev,
      scenario: newScenario,
      originalObject: scenarioData.originalObj,
      newObject: scenarioData.newObj,
      pointerValidity: scenarioData.validity,
      compilerAssumptions: scenarioData.assumptions
    }));
  };

  const toggleOptimization = () => {
    setLessonState(prev => ({
      ...prev,
      showOptimization: !prev.showOptimization
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Understand when std::launder is required' : 'Entender cuándo se requiere std::launder',
    state.language === 'en' ? 'Learn object replacement via placement new' : 'Aprender reemplazo de objetos vía placement new',
    state.language === 'en' ? 'Master pointer validation after object changes' : 'Dominar validación de punteros después de cambios de objetos',
    state.language === 'en' ? 'Understand compiler optimization assumptions' : 'Entender asunciones de optimización del compilador',
    state.language === 'en' ? 'Implement safe object lifetime management' : 'Implementar gestión segura del ciclo de vida de objetos'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "std::launder - Pointer Validation" : "std::launder - Validación de Punteros"}
      subtitle={state.language === 'en' 
        ? "Master C++17's pointer validation tool for placement new scenarios" 
        : "Domina la herramienta de validación de punteros de C++17 para escenarios de placement new"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🎯 std::launder Fundamentals' : '🎯 Fundamentos de std::launder'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'std::launder (C++17) is used to validate pointers after an object has been replaced via placement new, ensuring the compiler cannot make incorrect optimization assumptions about the object\'s properties.'
            : 'std::launder (C++17) se usa para validar punteros después de que un objeto ha sido reemplazado vía placement new, asegurando que el compilador no pueda hacer asunciones incorrectas de optimización sobre las propiedades del objeto.'}
        </p>

        <div style={{ height: '600px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <LaunderVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive Launder Demo' : '🧪 Demo Interactivo de Launder'}
        </SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
          <Button 
            onClick={() => changeScenario('basic')}
            style={{ backgroundColor: lessonState.scenario === 'basic' ? theme.colors.primary : theme.colors.secondary }}
          >
            {state.language === 'en' ? 'Basic Replacement' : 'Reemplazo Básico'}
          </Button>
          <Button 
            onClick={() => changeScenario('const_change')}
            style={{ backgroundColor: lessonState.scenario === 'const_change' ? theme.colors.primary : theme.colors.secondary }}
          >
            {state.language === 'en' ? 'const Change' : 'Cambio de const'}
          </Button>
          <Button 
            onClick={() => changeScenario('virtual_change')}
            style={{ backgroundColor: lessonState.scenario === 'virtual_change' ? theme.colors.primary : theme.colors.secondary }}
          >
            {state.language === 'en' ? 'Virtual Change' : 'Cambio Virtual'}
          </Button>
          <Button 
            onClick={() => changeScenario('placement_new')}
            style={{ backgroundColor: lessonState.scenario === 'placement_new' ? theme.colors.primary : theme.colors.secondary }}
          >
            {state.language === 'en' ? 'Complex Placement' : 'Placement Complejo'}
          </Button>
        </div>

        <Button onClick={toggleOptimization} style={{ marginBottom: '20px' }}>
          {lessonState.showOptimization 
            ? (state.language === 'en' ? 'Hide Optimizations' : 'Ocultar Optimizaciones')
            : (state.language === 'en' ? 'Show Optimizations' : 'Mostrar Optimizaciones')
          }
        </Button>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '📝 Basic Usage Pattern' : '📝 Patrón de Uso Básico'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`#include <new>     // std::launder (C++17)
#include <memory>

// Basic scenario requiring std::launder
struct Object {
    int value;
    const int id;    // const member - changes object identity
    
    Object(int v, int i) : value(v), id(i) {}
};

void basic_launder_example() {
    // Allocate raw storage
    alignas(Object) std::byte storage[sizeof(Object)];
    
    // Construct first object
    Object* ptr = new(storage) Object(42, 1);
    std::cout << "Original: " << ptr->value << ", id: " << ptr->id << "\\n";
    
    // Destroy first object
    ptr->~Object();
    
    // Construct new object at same location
    new(storage) Object(100, 2);  // Different const member value!
    
    // ❌ Using old pointer is undefined behavior
    // std::cout << ptr->value;  // UB - compiler assumes id still == 1
    
    // ✅ Launder the pointer to validate it
    Object* new_ptr = std::launder(ptr);
    std::cout << "New: " << new_ptr->value << ", id: " << new_ptr->id << "\\n";
    
    new_ptr->~Object();
}`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🔍 When std::launder is Required' : '🔍 Cuándo se Requiere std::launder'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4>{state.language === 'en' ? 'const/reference members' : 'Miembros const/reference'}</h4>
            <CodeBlock language="cpp">
{`struct WithConst {
    const int value;
    WithConst(int v) : value(v) {}
};

// Replacement changes const value
WithConst* ptr = new(storage) WithConst(42);
ptr->~WithConst();
new(storage) WithConst(100);  // Different const value

// ❌ UB: compiler assumes value is still 42
// auto x = ptr->value;

// ✅ Required: launder to validate pointer
auto* valid_ptr = std::launder(ptr);
auto x = valid_ptr->value;  // Now safe`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Virtual function changes' : 'Cambios de función virtual'}</h4>
            <CodeBlock language="cpp">
{`struct Base { virtual void f() { std::cout << "Base\\n"; } };
struct Derived : Base { void f() override { std::cout << "Derived\\n"; } };

// Replace base with derived
Base* ptr = new(storage) Base();
ptr->~Base();
new(storage) Derived();

// ❌ UB: compiler may inline Base::f()
// ptr->f();

// ✅ Required: launder for correct dispatch
auto* valid_ptr = std::launder(ptr);
valid_ptr->f();  // Correctly calls Derived::f()`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Different class layout' : 'Diferente diseño de clase'}</h4>
            <CodeBlock language="cpp">
{`struct A { int x; };
struct B { int x, y; };  // Different size/layout

static_assert(sizeof(A) <= sizeof(B));

// Replace smaller with larger (within bounds)
A* ptr = new(storage) A{42};
ptr->~A();
new(storage) B{100, 200};

// ❌ UB: compiler assumes B members don't exist
// auto y = reinterpret_cast<B*>(ptr)->y;

// ✅ Required: launder for safe access
auto* b_ptr = std::launder(reinterpret_cast<B*>(ptr));
auto y = b_ptr->y;`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'When NOT required' : 'Cuándo NO se requiere'}</h4>
            <CodeBlock language="cpp">
{`struct Simple {
    int value;
    void set(int v) { value = v; }
};

// Same type, no const/virtual differences
Simple* ptr = new(storage) Simple{42};
ptr->~Simple();
new(storage) Simple{100};

// ✅ OK: no object identity changes
auto x = ptr->value;  // Compiler cannot assume old value

// But launder is still safer:
auto* safe_ptr = std::launder(ptr);
auto y = safe_ptr->value;`}
            </CodeBlock>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '⚡ Compiler Optimizations Impact' : '⚡ Impacto de Optimizaciones del Compilador'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`// Example showing why launder is necessary
struct Widget {
    const int id;
    int value;
    
    Widget(int i, int v) : id(i), value(v) {}
    void process() { /* expensive operation */ }
};

void optimization_example(std::byte* storage) {
    // Original object
    Widget* ptr = new(storage) Widget(1, 100);
    
    // Compiler sees const member and makes assumptions:
    // - ptr->id will always be 1
    // - Can cache this value in registers
    // - Can eliminate redundant loads
    
    if (ptr->id == 1) {           // Compiler: "always true"
        ptr->process();           // Can be moved outside loops
        
        // Later...
        ptr->~Widget();
        new(storage) Widget(2, 200);  // Different const value!
        
        // ❌ Without launder: compiler still thinks id == 1
        if (ptr->id == 1) {       // Compiler: "still always true!"
            // This block may execute even though id is now 2!
            ptr->process();       // Wrong behavior
        }
        
        // ✅ With launder: forces compiler to reload
        Widget* fresh_ptr = std::launder(ptr);
        if (fresh_ptr->id == 1) { // Compiler: "must check actual value"
            // This block correctly skipped when id == 2
            fresh_ptr->process();
        }
    }
    
    std::launder(ptr)->~Widget();
}

// Assembly difference (simplified):
// Without launder: test eax, eax     ; assumes id==1, may skip test
// With launder:    mov eax, [ptr]   ; forced to reload from memory
//                  cmp eax, 1        ; actual comparison`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🛠️ Advanced Usage Patterns' : '🛠️ Patrones de Uso Avanzados'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4>{state.language === 'en' ? 'RAII Wrapper' : 'Wrapper RAII'}</h4>
            <CodeBlock language="cpp">
{`template<typename T>
class LaunderPtr {
    T* ptr_;
    
public:
    template<typename... Args>
    LaunderPtr(void* storage, Args&&... args) {
        ptr_ = new(storage) T(std::forward<Args>(args)...);
    }
    
    ~LaunderPtr() {
        if (ptr_) std::launder(ptr_)->~T();
    }
    
    // Automatic laundering on access
    T* get() { return std::launder(ptr_); }
    T& operator*() { return *std::launder(ptr_); }
    T* operator->() { return std::launder(ptr_); }
    
    template<typename U, typename... Args>
    void replace(Args&&... args) {
        std::launder(ptr_)->~T();
        ptr_ = new(ptr_) U(std::forward<Args>(args)...);
    }
};`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Array Laundering' : 'Laundering de Arrays'}</h4>
            <CodeBlock language="cpp">
{`template<typename T>
void launder_array(T* ptr, std::size_t count) {
    // Destroy all elements
    for (std::size_t i = 0; i < count; ++i) {
        ptr[i].~T();
    }
    
    // Reconstruct with different values
    for (std::size_t i = 0; i < count; ++i) {
        new(&ptr[i]) T(/* new values */);
    }
    
    // Launder the array pointer
    return std::launder(ptr);
}

// Usage with arrays
alignas(Widget) std::byte storage[sizeof(Widget) * 10];
Widget* array = reinterpret_cast<Widget*>(storage);

// Initialize array
for (int i = 0; i < 10; ++i) {
    new(&array[i]) Widget(i, i * 10);
}

// Replace all elements
Widget* fresh_array = launder_array(array, 10);`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Conditional Laundering' : 'Laundering Condicional'}</h4>
            <CodeBlock language="cpp">
{`template<typename T>
T* conditional_launder(T* ptr, bool needs_launder) {
    if constexpr (/* compile-time check */) {
        // Check if T has const members, references, or virtual functions
        constexpr bool has_const_members = /* ... */;
        constexpr bool has_virtual = std::is_polymorphic_v<T>;
        
        if constexpr (has_const_members || has_virtual) {
            return std::launder(ptr);
        } else if (needs_launder) {
            return std::launder(ptr);
        } else {
            return ptr;  // Safe to use without laundering
        }
    } else {
        return needs_launder ? std::launder(ptr) : ptr;
    }
}

// Template specialization for known safe types
template<>
int* conditional_launder<int>(int* ptr, bool) {
    return ptr;  // int has no const members or virtual functions
}`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Memory Pool Integration' : 'Integración con Pool de Memoria'}</h4>
            <CodeBlock language="cpp">
{`class LaunderingPool {
    std::byte* memory_;
    std::size_t block_size_;
    std::vector<void*> allocated_;
    
public:
    template<typename T, typename... Args>
    T* construct(Args&&... args) {
        void* ptr = allocate_block();
        T* obj = new(ptr) T(std::forward<Args>(args)...);
        allocated_.push_back(obj);
        return obj;
    }
    
    template<typename T, typename U, typename... Args>
    T* replace(T* old_ptr, Args&&... args) {
        // Verify pointer is from this pool
        assert(is_from_pool(old_ptr));
        
        // Destroy old object
        std::launder(old_ptr)->~T();
        
        // Construct new object
        U* new_obj = new(old_ptr) U(std::forward<Args>(args)...);
        
        // Return laundered pointer
        return std::launder(reinterpret_cast<T*>(new_obj));
    }
    
private:
    void* allocate_block() { /* ... */ }
    bool is_from_pool(void* ptr) { /* ... */ }
};`}
            </CodeBlock>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🎯 Best Practices' : '🎯 Mejores Prácticas'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`// 1. Always use launder after placement new with identity changes
template<typename T, typename... Args>
T* safe_placement_new(void* storage, Args&&... args) {
    return std::launder(new(storage) T(std::forward<Args>(args)...));
}

// 2. RAII approach - automatic laundering
template<typename T>
class AutoLaunderPtr {
    void* storage_;
    
public:
    template<typename... Args>
    explicit AutoLaunderPtr(Args&&... args)
        : storage_(operator new(sizeof(T))) {
        new(storage_) T(std::forward<Args>(args)...);
    }
    
    ~AutoLaunderPtr() { 
        get()->~T(); 
        operator delete(storage_);
    }
    
    T* get() const { return std::launder(static_cast<T*>(storage_)); }
    T* operator->() const { return get(); }
    T& operator*() const { return *get(); }
};

// 3. Compile-time detection of launder requirement
template<typename T>
constexpr bool needs_launder_v = 
    std::is_polymorphic_v<T> ||
    !std::is_trivially_destructible_v<T> ||
    /* has const/reference members check */;

template<typename T>
T* maybe_launder(T* ptr) {
    if constexpr (needs_launder_v<T>) {
        return std::launder(ptr);
    } else {
        return ptr;
    }
}

// 4. Documentation and comments
void complex_placement_new() {
    // IMPORTANT: Object has const members - launder required
    ConstObject* ptr = new(storage) ConstObject(42);
    ptr->~ConstObject();
    
    // New object with different const value
    new(storage) ConstObject(100);
    
    // std::launder required due to const member change
    ConstObject* valid_ptr = std::launder(ptr);
    use_object(valid_ptr);
}

// 5. Testing laundering correctness
#ifdef DEBUG
    #define ASSERT_LAUNDER_NEEDED(ptr, expected_value) \\
        do { \\
            auto* laundered = std::launder(ptr); \\
            assert(laundered->get_check_value() == (expected_value)); \\
        } while(0)
#else
    #define ASSERT_LAUNDER_NEEDED(ptr, expected_value) ((void)0)
#endif`}
        </CodeBlock>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Lesson on std::launder. Current scenario: ${scenarios[lessonState.scenario].title}`}
      />
    </LessonLayout>
  );
};

export default Lesson63_Launder;