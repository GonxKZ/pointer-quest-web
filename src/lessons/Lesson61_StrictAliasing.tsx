import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LessonLayout, Section, SectionTitle, InteractiveSection,
  LearningObjectives, Button, CodeBlock, PerformanceMonitor,
  AccessibilityAnnouncer, theme, type LessonProgress 
} from '../design-system';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import { THREE } from '../utils/three';

interface AliasingState {
  demonstrationType: 'basic' | 'optimization' | 'violation' | 'compiler';
  currentScenario: number;
  optimization: boolean;
  compilerWarnings: string[];
  memoryAccesses: {
    address: string;
    type: string;
    value: string;
    valid: boolean;
    timestamp: number;
  }[];
  performance: {
    withAliasing: number;
    withoutAliasing: number;
    optimized: boolean;
  };
}

const StrictAliasingVisualization: React.FC<{ state: AliasingState }> = ({ state }) => {
  const scenarios = [
    {
      title: 'Legal Aliasing - Same Type',
      description: 'int* and int* can alias the same memory',
      memoryLayout: [
        { addr: 0x1000, type: 'int', value: '42', color: '#2ed573', accessible: ['int*', 'void*', 'char*'] },
        { addr: 0x1004, type: 'int', value: '100', color: '#2ed573', accessible: ['int*', 'void*', 'char*'] }
      ]
    },
    {
      title: 'Legal Aliasing - Unions',
      description: 'Union members can legally alias each other',
      memoryLayout: [
        { addr: 0x2000, type: 'union{int,float}', value: '42|3.14f', color: '#00d4ff', accessible: ['int*', 'float*', 'char*'] }
      ]
    },
    {
      title: 'Illegal Aliasing - Type Mismatch',
      description: 'float* accessing int memory violates strict aliasing',
      memoryLayout: [
        { addr: 0x3000, type: 'int', value: '0x42424242', color: '#ff4757', accessible: ['int*', 'char*'], violation: 'float*' }
      ]
    },
    {
      title: 'Compiler Optimization Impact',
      description: 'How aliasing affects compiler optimizations',
      memoryLayout: [
        { addr: 0x4000, type: 'int', value: 'x', color: '#ffa500', accessible: ['int*'] },
        { addr: 0x4004, type: 'float', value: 'y', color: '#ffa500', accessible: ['float*'], optimized: true }
      ]
    }
  ];

  const currentScenario = scenarios[state.currentScenario] || scenarios[0];

  const getAccessibilityColor = (type: string, isViolation?: boolean) => {
    if (isViolation) return '#ff4757';
    switch (type) {
      case 'int*': return '#2ed573';
      case 'float*': return '#00d4ff';
      case 'char*': return '#ffa500';
      case 'void*': return '#9b59b6';
      default: return '#57606f';
    }
  };

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

      {/* Memory Layout Visualization */}
      <group position={[0, 2, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
        >
          Memory Layout
        </Text>
        
        {currentScenario.memoryLayout.map((mem, index) => (
          <group key={index} position={[index * 3 - currentScenario.memoryLayout.length * 1.5, 0, 0]}>
            {/* Memory block */}
            <Box args={[2, 1, 0.3]}>
              <meshStandardMaterial 
                color={mem.color}
                transparent 
                opacity={0.8} 
              />
            </Box>
            
            {/* Address */}
            <Text
              position={[0, -0.7, 0]}
              fontSize={0.12}
              color="#888"
              anchorX="center"
            >
              {mem.addr}
            </Text>
            
            {/* Type */}
            <Text
              position={[0, 0.1, 0.2]}
              fontSize={0.1}
              color="white"
              anchorX="center"
            >
              {mem.type}
            </Text>
            
            {/* Value */}
            <Text
              position={[0, -0.1, 0.2]}
              fontSize={0.09}
              color="white"
              anchorX="center"
            >
              {mem.value}
            </Text>
            
            {/* Violation indicator */}
            {mem.violation && (
              <Text
                position={[0, 0.7, 0]}
                fontSize={0.08}
                color="#ff4757"
                anchorX="center"
              >
                ⚠️ {mem.violation} violation
              </Text>
            )}
          </group>
        ))}
      </group>

      {/* Pointer Access Rights */}
      <group position={[0, 0.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.18}
          color="#ffffff"
          anchorX="center"
        >
          Legal Access Types
        </Text>
        
        {currentScenario.memoryLayout[0]?.accessible.map((ptrType, index) => (
          <group key={index} position={[index * 1.5 - currentScenario.memoryLayout[0].accessible.length * 0.75, 0, 0]}>
            <Box args={[1.2, 0.4, 0.2]}>
              <meshStandardMaterial 
                color={getAccessibilityColor(ptrType)}
                transparent 
                opacity={0.7} 
              />
            </Box>
            
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {ptrType}
            </Text>
          </group>
        ))}
      </group>

      {/* Optimization Impact */}
      {state.optimization && (
        <group position={[0, -1, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.15}
            color="#2ed573"
            anchorX="center"
          >
            Compiler Optimizations
          </Text>
          
          <Text
            position={[-2, 0, 0]}
            fontSize={0.1}
            color="#00d4ff"
            anchorX="center"
          >
            Without Aliasing: Fast
          </Text>
          
          <Text
            position={[0, 0, 0]}
            fontSize={0.1}
            color="#ffa500"
            anchorX="center"
          >
            Potential Aliasing: Slow
          </Text>
          
          <Text
            position={[2, 0, 0]}
            fontSize={0.1}
            color="#ff4757"
            anchorX="center"
          >
            UB Aliasing: Undefined
          </Text>
        </group>
      )}

      {/* Performance Comparison */}
      {state.performance.optimized && (
        <group position={[0, -2, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.15}
            color="#2ed573"
            anchorX="center"
          >
            Performance Impact
          </Text>
          
          {/* Performance bars */}
          <group position={[-1, 0, 0]}>
            <Box args={[0.3, state.performance.withoutAliasing / 100, 0.2]}>
              <meshStandardMaterial color="#2ed573" transparent opacity={0.8} />
            </Box>
            <Text position={[0, -0.4, 0]} fontSize={0.08} color="#2ed573" anchorX="center">
              No Aliasing
            </Text>
          </group>
          
          <group position={[1, 0, 0]}>
            <Box args={[0.3, state.performance.withAliasing / 100, 0.2]}>
              <meshStandardMaterial color="#ff4757" transparent opacity={0.8} />
            </Box>
            <Text position={[0, -0.4, 0]} fontSize={0.08} color="#ff4757" anchorX="center">
              With Aliasing
            </Text>
          </group>
        </group>
      )}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson61_StrictAliasing: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<AliasingState>({
    demonstrationType: 'basic',
    currentScenario: 0,
    optimization: false,
    compilerWarnings: [],
    memoryAccesses: [],
    performance: {
      withAliasing: 45,
      withoutAliasing: 95,
      optimized: false
    }
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 8,
    completedSteps: [],
    score: 0
  });

  const codeExamples = {
    legal: `// Legal strict aliasing examples
void legal_aliasing() {
    int x = 42;
    int* p1 = &x;    // ✅ Same type - legal
    int* p2 = &x;    // ✅ Same type - legal
    void* p3 = &x;   // ✅ void* can alias anything
    char* p4 = reinterpret_cast<char*>(&x); // ✅ char* can alias anything
    
    // All these accesses are well-defined
    *p1 = 100;
    *p2 = 200;
    // p3 needs casting to use
    static_cast<int*>(p3) = 300;
    // byte-wise access through char*
    p4[0] = 0x42;
}`,
    
    unions: `// Legal aliasing through unions
union TypePunning {
    int i;
    float f;
    std::uint32_t ui;
};

void union_aliasing() {
    TypePunning tp;
    
    // Legal: active member access
    tp.i = 42;
    int value = tp.i;  // ✅ Reading active member
    
    // Legal: switching active member  
    tp.f = 3.14f;      // Now float is active
    float fval = tp.f; // ✅ Reading new active member
    
    // Legal but implementation-defined
    tp.i = 0x41200000;
    float result = tp.f; // Implementation-defined bit pattern
}`,
    
    illegal: `// Illegal strict aliasing - undefined behavior
void illegal_aliasing() {
    int x = 42;
    
    // ⚠️ UNDEFINED BEHAVIOR: accessing int through float*
    float* fp = reinterpret_cast<float*>(&x);
    *fp = 3.14f;  // 💥 UB: violates strict aliasing rule
    
    // ⚠️ UNDEFINED BEHAVIOR: accessing different types
    double d = 3.14159;
    std::uint64_t* bits = reinterpret_cast<std::uint64_t*>(&d);
    *bits = 0xDEADBEEF; // 💥 UB: uint64_t* cannot alias double
}`,
    
    memcpy: `// Safe type punning with memcpy
#include <cstring>
#include <bit> // C++20

void safe_type_punning() {
    // Method 1: memcpy (C++11 and later)
    float f = 3.14f;
    std::uint32_t bits;
    std::memcpy(&bits, &f, sizeof(f)); // ✅ Always legal
    
    // Method 2: std::bit_cast (C++20)
    std::uint32_t bits2 = std::bit_cast<std::uint32_t>(f); // ✅ Type-safe
    
    // Method 3: Union (legal but tricky)
    union { float f; std::uint32_t i; } pun;
    pun.f = 3.14f;
    std::uint32_t bits3 = pun.i; // ✅ Legal in most implementations
}`,
    
    optimization: `// How aliasing affects compiler optimizations
void optimization_killer(int* a, float* b) {
    *a = 42;
    *b = 3.14f;  // Compiler assumes no aliasing between int* and float*
    
    // Compiler can optimize:
    // - Reorder these operations
    // - Keep *a in register
    // - Eliminate redundant loads
    
    int x = *a;  // Compiler knows this is still 42 (if no UB)
}

void potential_aliasing(int* a, int* b) {
    *a = 42;
    *b = 100;    // Might alias with *a - compiler must be conservative
    
    int x = *a;  // Compiler must reload - could be 42 or 100
}`,
    
    restrict_keyword: `// Using restrict keyword (C99, GCC extension)
void optimized_function(int* restrict a, int* restrict b, size_t n) {
    // restrict tells compiler: a and b don't alias
    for (size_t i = 0; i < n; ++i) {
        a[i] = b[i] * 2;  // Can vectorize, reorder, optimize aggressively
    }
}

// Without restrict
void conservative_function(int* a, int* b, size_t n) {
    for (size_t i = 0; i < n; ++i) {
        a[i] = b[i] * 2;  // Must check for aliasing, slower
    }
}`
  };

  const scenarios = [
    {
      title: 'Legal Same-Type Aliasing',
      code: codeExamples.legal,
      explanation: state.language === 'en' 
        ? 'Multiple pointers of the same type can legally point to the same memory location.'
        : 'Múltiples punteros del mismo tipo pueden legalmente apuntar a la misma ubicación de memoria.'
    },
    {
      title: 'Legal Union Aliasing', 
      code: codeExamples.unions,
      explanation: state.language === 'en'
        ? 'Union members can legally alias each other, following specific rules.'
        : 'Los miembros de union pueden legalmente hacer aliasing entre sí, siguiendo reglas específicas.'
    },
    {
      title: 'Illegal Type Aliasing',
      code: codeExamples.illegal, 
      explanation: state.language === 'en'
        ? 'Accessing memory through incompatible pointer types violates strict aliasing rules.'
        : 'Acceder a memoria a través de tipos de puntero incompatibles viola las reglas de strict aliasing.'
    },
    {
      title: 'Safe Type Punning',
      code: codeExamples.memcpy,
      explanation: state.language === 'en'
        ? 'Use memcpy, std::bit_cast, or unions for safe type reinterpretation.'
        : 'Usa memcpy, std::bit_cast, o unions para reinterpretación segura de tipos.'
    }
  ];

  const runOptimizationDemo = () => {
    setLessonState(prev => ({
      ...prev,
      optimization: !prev.optimization,
      performance: {
        ...prev.performance,
        optimized: true
      }
    }));
  };

  const nextScenario = () => {
    setLessonState(prev => ({
      ...prev,
      currentScenario: (prev.currentScenario + 1) % scenarios.length
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Understand strict aliasing rules and their purpose' : 'Entender las reglas de strict aliasing y su propósito',
    state.language === 'en' ? 'Identify legal vs illegal aliasing patterns' : 'Identificar patrones de aliasing legales vs ilegales',
    state.language === 'en' ? 'Learn safe type punning techniques' : 'Aprender técnicas seguras de type punning',
    state.language === 'en' ? 'Understand compiler optimization implications' : 'Entender las implicaciones de optimización del compilador',
    state.language === 'en' ? 'Master the restrict keyword usage' : 'Dominar el uso de la palabra clave restrict'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Strict Aliasing Rules" : "Reglas de Strict Aliasing"}
      subtitle={state.language === 'en' 
        ? "Master type-based aliasing rules and compiler optimizations in C++" 
        : "Domina las reglas de aliasing basadas en tipos y optimizaciones del compilador en C++"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🎯 Strict Aliasing Fundamentals' : '🎯 Fundamentos de Strict Aliasing'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'Strict aliasing is a rule in C++ that restricts which pointer types can access the same memory location. This enables powerful compiler optimizations but can lead to undefined behavior when violated.'
            : 'Strict aliasing es una regla en C++ que restringe qué tipos de puntero pueden acceder a la misma ubicación de memoria. Esto permite optimizaciones poderosas del compilador pero puede llevar a comportamiento indefinido cuando se viola.'}
        </p>

        <div style={{ height: '500px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <StrictAliasingVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive Aliasing Demo' : '🧪 Demo Interactivo de Aliasing'}
        </SectionTitle>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button onClick={nextScenario}>
            {state.language === 'en' ? 'Next Scenario' : 'Siguiente Escenario'} ({lessonState.currentScenario + 1}/{scenarios.length})
          </Button>
          <Button onClick={runOptimizationDemo}>
            {lessonState.optimization 
              ? (state.language === 'en' ? 'Hide Optimizations' : 'Ocultar Optimizaciones')
              : (state.language === 'en' ? 'Show Optimizations' : 'Mostrar Optimizaciones')
            }
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div>
            <h4>{scenarios[lessonState.currentScenario].title}</h4>
            <p>{scenarios[lessonState.currentScenario].explanation}</p>
            
            <CodeBlock
              language="cpp"
              showLineNumbers={true}
            >
              {scenarios[lessonState.currentScenario].code}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Key Rules' : 'Reglas Clave'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Same types can always alias' : 'Mismos tipos siempre pueden hacer aliasing'}</li>
              <li>{state.language === 'en' ? 'void* can alias any type' : 'void* puede hacer aliasing con cualquier tipo'}</li>
              <li>{state.language === 'en' ? 'char*/unsigned char* can alias anything' : 'char*/unsigned char* puede hacer aliasing con cualquier cosa'}</li>
              <li>{state.language === 'en' ? 'Union members can alias each other' : 'Miembros de union pueden hacer aliasing entre sí'}</li>
              <li>{state.language === 'en' ? 'Compatible types (const variants) can alias' : 'Tipos compatibles (variantes const) pueden hacer aliasing'}</li>
            </ul>
          </div>
        </div>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '⚡ Performance & Optimization Impact' : '⚡ Impacto en Rendimiento y Optimización'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`// Compiler optimization opportunities with strict aliasing
void fast_path(int* restrict a, float* restrict b, size_t n) {
    // Compiler knows: int* and float* cannot alias
    // Can optimize aggressively:
    // - Vectorize loops
    // - Reorder operations  
    // - Keep values in registers
    // - Eliminate redundant memory accesses
    
    for (size_t i = 0; i < n; ++i) {
        a[i] = compute_int(b[i]);     // Can parallelize
        b[i] = process_float(a[i]);   // Can reorder
    }
}

void slow_path(void* a, void* b, size_t n) {
    // Compiler assumes: pointers might alias
    // Must be conservative:
    // - Cannot reorder operations
    // - Must reload from memory
    // - Limited vectorization
    // - Reduced optimization opportunities
    
    int* ia = static_cast<int*>(a);
    float* fb = static_cast<float*>(b);
    
    for (size_t i = 0; i < n; ++i) {
        ia[i] = compute_int(fb[i]);   // Must be careful about aliasing
        fb[i] = process_float(ia[i]); // Conservative memory access
    }
}`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🛡️ Safe Practices' : '🛡️ Prácticas Seguras'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4>{state.language === 'en' ? 'Use std::bit_cast (C++20)' : 'Usar std::bit_cast (C++20)'}</h4>
            <CodeBlock language="cpp">
{`#include <bit>

float f = 3.14f;
// ✅ Safe type punning
std::uint32_t bits = std::bit_cast<std::uint32_t>(f);

// Convert back
float f2 = std::bit_cast<float>(bits);`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Use memcpy for older standards' : 'Usar memcpy para estándares antiguos'}</h4>
            <CodeBlock language="cpp">
{`#include <cstring>

float f = 3.14f;
std::uint32_t bits;

// ✅ Always safe
std::memcpy(&bits, &f, sizeof(f));

// Convert back
float f2;
std::memcpy(&f2, &bits, sizeof(bits));`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Careful union usage' : 'Uso cuidadoso de unions'}</h4>
            <CodeBlock language="cpp">
{`union FloatBits {
    float f;
    std::uint32_t i;
};

FloatBits fb;
fb.f = 3.14f;  // Set active member
// ✅ Reading active member is safe
std::uint32_t bits = fb.i; // Implementation-defined`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Compiler-specific solutions' : 'Soluciones específicas del compilador'}</h4>
            <CodeBlock language="cpp">
{`// GCC/Clang: may_alias attribute
typedef float __attribute__((__may_alias__)) aliasing_float;

// MSVC: /fno-strict-aliasing flag
// Disables strict aliasing optimizations

// Portable: avoid the problem entirely
template<typename T, typename U>
T safe_cast(const U& u) {
    static_assert(sizeof(T) == sizeof(U));
    T result;
    std::memcpy(&result, &u, sizeof(T));
    return result;
}`}
            </CodeBlock>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🔍 Debugging Aliasing Violations' : '🔍 Depuración de Violaciones de Aliasing'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`// Compiler flags to detect aliasing issues:
// GCC/Clang: -Wstrict-aliasing -fstrict-aliasing
// MSVC: /Wall (includes aliasing warnings)

// Runtime detection tools:
// - AddressSanitizer (ASan)
// - Undefined Behavior Sanitizer (UBSan)  
// - Valgrind (memcheck)

// Example problematic code that tools will catch:
void problematic_function() {
    int x = 42;
    
    // This will trigger UBSan at runtime
    float* fp = reinterpret_cast<float*>(&x);
    *fp = 3.14f;  // UB detected!
    
    // Tools will report:
    // runtime error: store to address with insufficient space
    // for object of type 'float'
}

// Compile with: -fsanitize=undefined -fno-sanitize-recover=undefined
// Runtime: ./program
// Output: undefined behavior detected`}
        </CodeBlock>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Lesson on strict aliasing rules. Current scenario: ${scenarios[lessonState.currentScenario].title}`}
      />
    </LessonLayout>
  );
};

export default Lesson61_StrictAliasing;