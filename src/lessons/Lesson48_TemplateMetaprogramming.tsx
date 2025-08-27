import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import styled from 'styled-components';
import { THREE } from '../utils/three';

// Styled components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  min-height: 100vh;
  color: #ffffff;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #00d4ff;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
`;

const Subtitle = styled.h2`
  font-size: 1.3rem;
  color: #64b5f6;
  margin-bottom: 2rem;
  font-weight: 300;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
`;

const VisualizationPanel = styled.div`
  background: rgba(15, 20, 25, 0.8);
  border-radius: 15px;
  padding: 1rem;
  border: 2px solid rgba(0, 212, 255, 0.3);
  height: 600px;
`;

const ControlPanel = styled.div`
  background: rgba(15, 20, 25, 0.9);
  border-radius: 15px;
  padding: 2rem;
  border: 2px solid rgba(100, 181, 246, 0.3);
  overflow-y: auto;
  max-height: 600px;
`;

const TheorySection = styled.div`
  margin-bottom: 2rem;
  
  h3, h4 {
    color: #00d4ff;
    margin-bottom: 1rem;
  }
  
  p {
    color: #b8c5d6;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  ul {
    color: #b8c5d6;
    margin-left: 1rem;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #e1e5e9;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 1rem 0;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
  }
`;

const StatusPanel = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid #00d4ff;
  
  h4 {
    color: #00d4ff;
    margin-bottom: 0.5rem;
  }
  
  div {
    color: #b8c5d6;
    margin-bottom: 0.3rem;
    font-family: 'Fira Code', monospace;
  }
`;

const MetaprogramExample = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(100, 181, 246, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  
  h5 {
    color: #64b5f6;
    margin-bottom: 0.5rem;
  }
  
  .compile-time {
    color: #00ff00;
    font-family: 'Fira Code', monospace;
    font-size: 0.9rem;
  }
  
  .runtime {
    color: #ffb74d;
    font-family: 'Fira Code', monospace;
    font-size: 0.9rem;
  }
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin: 1rem 0;
`;

const TypeCard = styled.div<{ level: number }>`
  background: ${props => `rgba(${props.level * 50}, 181, 246, 0.2)`};
  border: 2px solid ${props => `rgba(${props.level * 50}, 181, 246, 0.5)`};
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.8rem;
  
  .type-name {
    color: #64b5f6;
    font-weight: bold;
  }
  
  .type-info {
    color: #b8c5d6;
    font-size: 0.7rem;
  }
`;

// Types
interface TemplateState {
  currentExample: string;
  compilationSteps: string[];
  typeDeduction: Array<{ type: string; deduced: string; level: number }>;
  metaResult: string;
  sfinae: boolean;
  instantiated: number;
}

// 3D Visualization Component
const TemplateVisualization: React.FC<{ state: TemplateState }> = ({ state }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Template compilation layers */}
      {state.compilationSteps.map((step, index) => {
        const y = index * 1.5 - (state.compilationSteps.length * 0.75);
        const scale = 1 - index * 0.1;
        const color = `hsl(${200 + index * 20}, 70%, ${60 + index * 10}%)`;
        
        return (
          <group key={index}>
            {/* Compilation step box */}
            <mesh position={[0, y, 0]} scale={[scale, scale, scale]}>
              <boxGeometry args={[4, 0.8, 2]} />
              <meshStandardMaterial 
                color={color}
                emissive="#001122"
                opacity={0.8}
                transparent
              />
            </mesh>
            
            {/* Step label */}
            <Text
              position={[0, y, 1.2]}
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {step}
            </Text>
          </group>
        );
      })}
      
      {/* Template parameters floating around */}
      {state.typeDeduction.map((type, index) => {
        const angle = (index / state.typeDeduction.length) * Math.PI * 2;
        const radius = 6 + type.level;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = type.level * 0.5;
        
        return (
          <group key={index}>
            {/* Type sphere */}
            <mesh position={[x, y, z]}>
              <sphereGeometry args={[0.3 + type.level * 0.1]} />
              <meshStandardMaterial 
                color={`hsl(${type.level * 60}, 80%, 60%)`}
                emissive="#001100"
              />
            </mesh>
            
            {/* Type name */}
            <Text
              position={[x, y + 0.8, z]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {type.type}
            </Text>
            
            {/* Deduced type */}
            <Text
              position={[x, y - 0.8, z]}
              fontSize={0.15}
              color="#64b5f6"
              anchorX="center"
              anchorY="middle"
            >
              {type.deduced}
            </Text>
            
            {/* Connection to center */}
            <line>
              <bufferGeometry>
                {(() => {
                  const points = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(x, y, z)
                  ];
                  const geometry = new THREE.BufferGeometry().setFromPoints(points);
                  return React.createElement('primitive', { object: geometry });
                })()}
              </bufferGeometry>
              <lineBasicMaterial 
                color="#64b5f6"
                opacity={0.4}
                transparent
              />
            </line>
          </group>
        );
      })}
      
      {/* Central compilation core */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1]} />
        <meshStandardMaterial 
          color={state.sfinae ? '#ff4444' : '#00d4ff'}
          emissive={state.sfinae ? '#110000' : '#001122'}
          wireframe
        />
      </mesh>
      
      {/* Result text */}
      <Text
        position={[0, -3, 0]}
        fontSize={0.3}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        {state.metaResult}
      </Text>
      
      {/* SFINAE indicator */}
      {state.sfinae && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.4}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
        >
          SFINAE!
        </Text>
      )}
    </>
  );
};

// Main component
const Lesson48_TemplateMetaprogramming: React.FC = () => {
  const [state, setState] = useState<TemplateState>({
    currentExample: 'Type Traits',
    compilationSteps: ['Parse Template', 'Type Deduction', 'Instantiation', 'Code Generation'],
    typeDeduction: [
      { type: 'T', deduced: 'int', level: 0 },
      { type: 'T*', deduced: 'int*', level: 1 },
      { type: 'T&', deduced: 'int&', level: 1 },
      { type: 'const T', deduced: 'const int', level: 2 }
    ],
    metaResult: 'Compilation Successful',
    sfinae: false,
    instantiated: 0
  });

  const runTypeTraits = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentExample: 'Type Traits',
      compilationSteps: ['Parse Template', 'Check Type Properties', 'Generate Result'],
      typeDeduction: [
        { type: 'is_pointer<int>', deduced: 'false', level: 0 },
        { type: 'is_pointer<int*>', deduced: 'true', level: 1 },
        { type: 'is_const<const int>', deduced: 'true', level: 2 },
        { type: 'remove_pointer<int*>', deduced: 'int', level: 1 }
      ],
      metaResult: 'Type Analysis Complete',
      sfinae: false,
      instantiated: prev.instantiated + 1
    }));
  }, []);

  const runSFINAE = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentExample: 'SFINAE',
      compilationSteps: ['Template Matching', 'Substitution Failure', 'Remove from Overload Set'],
      typeDeduction: [
        { type: 'T::type', deduced: 'substitution failure', level: 3 },
        { type: 'decltype(t.foo())', deduced: 'void', level: 1 },
        { type: 'enable_if<condition>', deduced: 'enabled/disabled', level: 2 }
      ],
      metaResult: 'Overload Resolution',
      sfinae: true,
      instantiated: prev.instantiated + 1
    }));
  }, []);

  const runConcepts = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentExample: 'Concepts (C++20)',
      compilationSteps: ['Concept Check', 'Constraint Satisfaction', 'Template Selection'],
      typeDeduction: [
        { type: 'Addable<T>', deduced: 'satisfied', level: 1 },
        { type: 'Integral<T>', deduced: 'satisfied', level: 1 },
        { type: 'Pointer<T>', deduced: 'not satisfied', level: 2 }
      ],
      metaResult: 'Concept Satisfied',
      sfinae: false,
      instantiated: prev.instantiated + 1
    }));
  }, []);

  const runConstexpr = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentExample: 'Constexpr Metaprogramming',
      compilationSteps: ['Constant Expression Evaluation', 'Compile-time Execution', 'Result Generation'],
      typeDeduction: [
        { type: 'factorial<5>', deduced: '120', level: 2 },
        { type: 'is_prime<17>', deduced: 'true', level: 2 },
        { type: 'fibonacci<10>', deduced: '55', level: 3 }
      ],
      metaResult: 'Computed at Compile Time',
      sfinae: false,
      instantiated: prev.instantiated + 1
    }));
  }, []);

  const resetDemo = useCallback(() => {
    setState({
      currentExample: 'Type Traits',
      compilationSteps: ['Parse Template', 'Type Deduction', 'Instantiation', 'Code Generation'],
      typeDeduction: [
        { type: 'T', deduced: 'int', level: 0 },
        { type: 'T*', deduced: 'int*', level: 1 },
        { type: 'T&', deduced: 'int&', level: 1 },
        { type: 'const T', deduced: 'const int', level: 2 }
      ],
      metaResult: 'Ready for Metaprogramming',
      sfinae: false,
      instantiated: 0
    });
  }, []);

  return (
    <Container>
      <Header>
        <Title>Lección 48: Template Metaprogramming con Punteros</Title>
        <Subtitle>Cómputo en Tiempo de Compilación y Type Traits</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [12, 8, 12], fov: 60 }}>
            <TemplateVisualization state={state} />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>🔬 Template Metaprogramming con Punteros</h3>
            <p>
              La metaprogramación con templates permite cómputo en tiempo de compilación, 
              especialmente útil para manipular tipos de punteros y crear abstracciones 
              zero-cost.
            </p>
            
            <CodeBlock>{`// Type traits para punteros
template<typename T>
struct is_pointer : std::false_type {};

template<typename T>
struct is_pointer<T*> : std::true_type {};

template<typename T>
constexpr bool is_pointer_v = is_pointer<T>::value;

// Remove pointer
template<typename T>
struct remove_pointer {
    using type = T;
};

template<typename T>
struct remove_pointer<T*> {
    using type = T;
};

template<typename T>
using remove_pointer_t = typename remove_pointer<T>::type;

// Ejemplo de uso
static_assert(is_pointer_v<int*>);           // true
static_assert(!is_pointer_v<int>);           // false
static_assert(std::is_same_v<
    remove_pointer_t<int*>, int>);           // true`}</CodeBlock>
          </TheorySection>

          <div>
            <h4>🧪 Ejemplos de Metaprogramming</h4>
            
            <Button onClick={runTypeTraits}>
              🔍 Type Traits
            </Button>
            <Button onClick={runSFINAE}>
              ⚠️ SFINAE
            </Button>
            <Button onClick={runConcepts}>
              📋 Concepts C++20
            </Button>
            <Button onClick={runConstexpr}>
              ⚡ Constexpr
            </Button>
            <Button onClick={resetDemo}>
              🔄 Reset
            </Button>
          </div>

          <StatusPanel>
            <h4>📊 Estado de Compilación</h4>
            <div>Ejemplo actual: {state.currentExample}</div>
            <div>Pasos de compilación: {state.compilationSteps.length}</div>
            <div>Tipos deducidos: {state.typeDeduction.length}</div>
            <div>SFINAE activo: {state.sfinae ? 'Sí' : 'No'}</div>
            <div>Instantiaciones: {state.instantiated}</div>
            <div>Resultado: {state.metaResult}</div>
          </StatusPanel>

          <div>
            <h4>🎯 Type Deduction</h4>
            <TypeGrid>
              {state.typeDeduction.map((type, index) => (
                <TypeCard key={index} level={type.level}>
                  <div className="type-name">{type.type}</div>
                  <div className="type-info">→ {type.deduced}</div>
                </TypeCard>
              ))}
            </TypeGrid>
          </div>

          <TheorySection>
            <h4>🏗️ Smart Pointer Type Traits</h4>
            <CodeBlock>{`// Detectar smart pointers
template<typename T>
struct is_smart_pointer : std::false_type {};

template<typename T>
struct is_smart_pointer<std::unique_ptr<T>> : std::true_type {};

template<typename T>
struct is_smart_pointer<std::shared_ptr<T>> : std::true_type {};

template<typename T>
struct is_smart_pointer<std::weak_ptr<T>> : std::true_type {};

template<typename T>
constexpr bool is_smart_pointer_v = is_smart_pointer<T>::value;

// Extraer tipo contenido en smart pointer
template<typename T>
struct smart_pointer_element {
    using type = void;  // No es smart pointer
};

template<typename T>
struct smart_pointer_element<std::unique_ptr<T>> {
    using type = T;
};

template<typename T>
struct smart_pointer_element<std::shared_ptr<T>> {
    using type = T;
};

template<typename T>
using smart_pointer_element_t = 
    typename smart_pointer_element<T>::type;

// Factory con metaprogramming
template<typename SmartPtr>
auto make_smart_pointer() {
    using element_type = smart_pointer_element_t<SmartPtr>;
    
    if constexpr (std::is_same_v<SmartPtr, std::unique_ptr<element_type>>) {
        return std::make_unique<element_type>();
    } else if constexpr (std::is_same_v<SmartPtr, std::shared_ptr<element_type>>) {
        return std::make_shared<element_type>();
    }
}`}</CodeBlock>
          </TheorySection>

          <MetaprogramExample>
            <h5>🔬 SFINAE Example</h5>
            <CodeBlock>{`// SFINAE para detectar métodos
template<typename T>
class has_begin {
private:
    template<typename U>
    static auto test(int) -> decltype(std::declval<U>().begin(), std::true_type{});
    
    template<typename>
    static std::false_type test(...);
    
public:
    static constexpr bool value = decltype(test<T>(0))::value;
};

template<typename T>
constexpr bool has_begin_v = has_begin<T>::value;

// Función que usa SFINAE
template<typename Container>
std::enable_if_t<has_begin_v<Container>, void>
process_container(Container& c) {
    for (auto it = c.begin(); it != c.end(); ++it) {
        // Process element
    }
}

// Specialization para punteros
template<typename T>
std::enable_if_t<std::is_pointer_v<T>, void>
process_container(T ptr) {
    // Handle single pointer
    if (ptr) {
        // Process single element
    }
}`}</CodeBlock>
            <div className="compile-time">✅ Compile-time: Type checking and overload resolution</div>
            <div className="runtime">⚡ Runtime: Zero overhead, optimal code generation</div>
          </MetaprogramExample>

          <TheorySection>
            <h4>⚡ Constexpr Metaprogramming</h4>
            <CodeBlock>{`// Constexpr algorithms con punteros
template<typename T, size_t N>
constexpr size_t array_size(T (&)[N]) {
    return N;
}

constexpr size_t factorial(size_t n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// Compile-time array processing
template<size_t N>
constexpr std::array<int, N> generate_sequence() {
    std::array<int, N> result{};
    for (size_t i = 0; i < N; ++i) {
        result[i] = i * i;
    }
    return result;
}

// Usage - computed at compile time
constexpr auto squares = generate_sequence<10>();
constexpr int fact5 = factorial(5);  // 120

// Template recursion for pointer depth
template<typename T>
struct pointer_depth {
    static constexpr size_t value = 0;
};

template<typename T>
struct pointer_depth<T*> {
    static constexpr size_t value = 1 + pointer_depth<T>::value;
};

template<typename T>
constexpr size_t pointer_depth_v = pointer_depth<T>::value;

static_assert(pointer_depth_v<int> == 0);
static_assert(pointer_depth_v<int*> == 1);
static_assert(pointer_depth_v<int***> == 3);`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>📋 C++20 Concepts</h4>
            <CodeBlock>{`// Concepts para punteros
#include <concepts>

template<typename T>
concept Pointer = std::is_pointer_v<T>;

template<typename T>
concept SmartPointer = requires {
    typename T::element_type;
    { std::declval<T>().get() } -> std::convertible_to<typename T::element_type*>;
};

template<typename T>
concept Dereferenceable = requires(T t) {
    *t;
};

// Función con concepts
template<Pointer auto ptr>
void process_raw_pointer(decltype(ptr) p) {
    if (p) {
        // Safe to dereference
        auto value = *p;
    }
}

template<SmartPointer auto sptr>
void process_smart_pointer(decltype(sptr) sp) {
    if (sp) {
        auto* raw = sp.get();
        // Process raw pointer
    }
}

// Concept para containers con iterators
template<typename T>
concept Container = requires(T t) {
    t.begin();
    t.end();
    typename T::iterator;
};

// Unified processing con concepts
template<typename T>
void process_data(T&& data) {
    if constexpr (Pointer<T>) {
        process_raw_pointer(data);
    } else if constexpr (SmartPointer<T>) {
        process_smart_pointer(data);
    } else if constexpr (Container<T>) {
        for (auto&& item : data) {
            // Process each item
        }
    }
}`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>💡 Ventajas del Template Metaprogramming</h4>
            <ul>
              <li><strong>Zero runtime cost:</strong> Todo computado en compilación</li>
              <li><strong>Type safety:</strong> Errores detectados en compile-time</li>
              <li><strong>Code generation:</strong> Código optimizado automáticamente</li>
              <li><strong>Generic programming:</strong> Algoritmos reutilizables</li>
              <li><strong>Constraint checking:</strong> Verificación de requisitos</li>
            </ul>
          </TheorySection>

          <TheorySection>
            <h4>⚠️ Consideraciones de Performance</h4>
            <CodeBlock>{`// Compilation time vs runtime tradeoffs
template<size_t N>
struct compile_time_fibonacci {
    static constexpr size_t value = 
        compile_time_fibonacci<N-1>::value + 
        compile_time_fibonacci<N-2>::value;
};

template<>
struct compile_time_fibonacci<0> {
    static constexpr size_t value = 0;
};

template<>
struct compile_time_fibonacci<1> {
    static constexpr size_t value = 1;
};

// ⚠️ Puede ser lento en compilación para N grandes
constexpr auto fib40 = compile_time_fibonacci<40>::value;

// Mejor: usar constexpr functions
constexpr size_t fibonacci(size_t n) {
    if (n <= 1) return n;
    
    size_t prev = 0, curr = 1;
    for (size_t i = 2; i <= n; ++i) {
        size_t next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}

// Template instantiation control
template<typename T>
void expensive_template_function() {
    // Expensive operations
}

// Explicit instantiation para controlar código generado
extern template void expensive_template_function<int>();
extern template void expensive_template_function<double>();`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>🎯 Casos de Uso Comunes</h4>
            <ul>
              <li><strong>Type erasure:</strong> std::function, std::any implementación</li>
              <li><strong>Policy-based design:</strong> Configuración de comportamiento en compilación</li>
              <li><strong>Expression templates:</strong> Optimización de operaciones matemáticas</li>
              <li><strong>Serialization:</strong> Generación automática de código de serialización</li>
              <li><strong>Reflection simulation:</strong> Introspección de tipos</li>
              <li><strong>Compile-time computations:</strong> Tablas lookup precalculadas</li>
            </ul>
          </TheorySection>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson48_TemplateMetaprogramming;