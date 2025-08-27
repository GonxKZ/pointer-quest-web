import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import * as THREE from 'three';
import { 
  LessonLayout,
  TheoryPanel,
  VisualizationPanel,
  Section,
  SectionTitle,
  Button,
  CodeBlock,
  InteractiveSection,
  theme,
  StatusDisplay,
  ButtonGroup
} from '../design-system';


const ContractViolation: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: 'rgba(255, 107, 107, 0.1)',
    border: '2px solid #ff6b6b',
    borderRadius: '8px',
    padding: '1rem',
    margin: '1rem 0',
    color: '#ff6b6b',
    fontWeight: 'bold',
    animation: 'contractError 2s infinite',
  }}>
    {children}
    <style jsx>{`
      @keyframes contractError {
        0%, 100% { 
          border-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
        }
        50% { 
          border-color: #ff0000;
          background: rgba(255, 107, 107, 0.2);
        }
      }
    `}</style>
  </div>
);

const RAIISolution: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: 'rgba(156, 39, 176, 0.1)',
    border: '2px solid #9c27b0',
    borderRadius: '8px',
    padding: '1rem',
    margin: '1rem 0',
    color: '#9c27b0',
    fontWeight: 'bold',
  }}>
    {children}
  </div>
);

interface ArrayState {
  pointer: number | null;
  arrayData: number[];
  arraySize: number;
  isAllocated: boolean;
  deletionType: 'none' | 'correct' | 'incorrect';
  contractViolated: boolean;
  showRaiiSolution: boolean;
  status: 'unallocated' | 'allocated' | 'correct_delete' | 'contract_violation' | 'raii_demo';
  message: string;
}

function ArrayShelf({ position, size, elements, visible = true, errorHighlight = false }: {
  position: [number, number, number];
  size: [number, number, number];
  elements: number[];
  visible?: boolean;
  errorHighlight?: boolean;
}) {
  const shelfRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (shelfRef.current && errorHighlight) {
      shelfRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1;
    }
  });

  if (!visible) return null;

  return (
    <group ref={shelfRef} position={position}>
      {/* Base shelf */}
      <mesh>
        <boxGeometry args={[size[0], 0.2, size[2]]} />
        <meshStandardMaterial 
          color={errorHighlight ? "#ff6b6b" : "#8B4513"} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
      {/* Array elements */}
      {elements.map((value, index) => (
        <group key={index} position={[
          -size[0]/2 + (index + 0.5) * (size[0] / elements.length), 
          0.6, 
          0
        ]}>
          <mesh>
            <boxGeometry args={[size[0] / elements.length * 0.8, 1, size[2] * 0.8]} />
            <meshStandardMaterial 
              color={errorHighlight ? "#ff9999" : "#00d4ff"} 
              transparent 
              opacity={0.9} 
            />
          </mesh>
          
          <Text
            position={[0, 0, size[2]/2 + 0.1]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {value}
          </Text>
          
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.2}
            color="#4ecdc4"
            anchorX="center"
            anchorY="middle"
          >
            [{index}]
          </Text>
        </group>
      ))}
      
      {/* Array label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.4}
        color={errorHighlight ? "#ff6b6b" : "#00d4ff"}
        anchorX="center"
        anchorY="middle"
      >
        int[{elements.length}]
      </Text>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        contiguous memory
      </Text>
    </group>
  );
}

function StackPointer({ position, arrayAddress, errorState = false }: {
  position: [number, number, number];
  arrayAddress: number | null;
  errorState?: boolean;
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.5, 1, 0.5]} />
        <meshStandardMaterial 
          color={errorState ? "#ff6b6b" : "#00d4ff"} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        int* a
      </Text>
      
      <Text
        position={[0, 0, 0]}
        fontSize={0.35}
        color={errorState ? "#ff6b6b" : "#00d4ff"}
        anchorX="center"
        anchorY="middle"
      >
        {arrayAddress ? `0x${arrayAddress.toString(16)}` : 'nullptr'}
      </Text>
      
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.2}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        stack
      </Text>
    </group>
  );
}

function PointerArrow({ start, end, color = "#00d4ff", broken = false }: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  broken?: boolean;
}) {
  if (broken) {
    return (
      <group>
        {/* Broken arrow pieces */}
        <Text
          position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, 0]}
          fontSize={0.4}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          ⚡💥⚡
        </Text>
      </group>
    );
  }

  const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
  const length = direction.length();
  direction.normalize();

  const arrowHelper = new THREE.ArrowHelper(direction, new THREE.Vector3(...start), length, color, length * 0.2, length * 0.1);

  return <primitive object={arrowHelper} />;
}

function Lesson06Scene({ state }: { state: ArrayState }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, 5]} intensity={0.5} color="#4ecdc4" />
      
      {/* Stack pointer */}
      <StackPointer
        position={[-3, 0, 0]}
        arrayAddress={state.pointer}
        errorState={state.contractViolated}
      />
      
      {/* Array shelf */}
      {state.isAllocated && (
        <ArrayShelf
          position={[2, 0, 0]}
          size={[4, 1, 1]}
          elements={state.arrayData}
          errorHighlight={state.contractViolated}
        />
      )}
      
      {/* Arrow from pointer to array */}
      {state.pointer && state.isAllocated && (
        <PointerArrow
          start={[-2.2, 0, 0]}
          end={[0, 0, 0]}
          color={state.contractViolated ? "#ff6b6b" : "#00d4ff"}
          broken={state.contractViolated}
        />
      )}
      
      {/* Memory region labels */}
      <Text
        position={[-3, 2, 0]}
        fontSize={0.5}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        STACK
      </Text>
      
      <Text
        position={[2, 2.5, 0]}
        fontSize={0.5}
        color="#ff6b6b"
        anchorX="center"
        anchorY="middle"
      >
        HEAP
      </Text>
      
      <Html position={[0, -3, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          minWidth: '500px',
          border: state.contractViolated ? '2px solid #ff6b6b' : '1px solid #00d4ff'
        }}>
          <h4 style={{ 
            color: state.contractViolated ? '#ff6b6b' : '#00d4ff', 
            margin: '0 0 0.5rem 0' 
          }}>
            Array Allocation: new[] vs delete[]
          </h4>
          <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            Pointer: {state.pointer ? `0x${state.pointer.toString(16)}` : 'nullptr'} | 
            Array: {state.isAllocated ? `${state.arraySize} elements` : 'not allocated'} | 
            Deletion: {state.deletionType}
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: state.contractViolated ? '#ff6b6b' : '#4ecdc4',
            fontWeight: 'bold'
          }}>
            {state.message}
          </p>
        </div>
      </Html>
    </>
  );
}

export default function Lesson06_ArrayAllocation() {
  const { dispatch } = useApp();
  
  const [state, setState] = useState<ArrayState>({
    pointer: null,
    arrayData: [],
    arraySize: 0,
    isAllocated: false,
    deletionType: 'none',
    contractViolated: false,
    showRaiiSolution: false,
    status: 'unallocated',
    message: 'Listo para crear array con new int[5]'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Ejecuta int* a = new int[5] - crea estantería contigua",
    "Observa los 5 elementos contiguos en el heap",
    "Intenta delete a (incorrecto) - viola el contrato",
    "Usa delete[] a (correcto) o refactoriza con RAII"
  ];

  const allocateArray = () => {
    const newAddress = 0x3000000;
    setState(prev => ({
      ...prev,
      pointer: newAddress,
      arrayData: [10, 20, 30, 40, 50],
      arraySize: 5,
      isAllocated: true,
      status: 'allocated',
      message: '✅ new int[5] exitoso - 5 elementos contiguos en heap'
    }));
  };

  const incorrectDelete = () => {
    setState(prev => ({
      ...prev,
      deletionType: 'incorrect',
      contractViolated: true,
      status: 'contract_violation',
      message: '🚨 CONTRACT VIOLATION: delete a en lugar de delete[] a'
    }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        message: '⚠️ UB: Solo se destruye el primer elemento, el resto permanece'
      }));
    }, 2000);
  };

  const correctDelete = () => {
    setState(prev => ({
      ...prev,
      deletionType: 'correct',
      contractViolated: false,
      isAllocated: false,
      pointer: null,
      arrayData: [],
      status: 'correct_delete',
      message: '✅ delete[] a - liberación correcta de todo el array'
    }));
  };

  const showRaiiAlternatives = () => {
    setState(prev => ({
      ...prev,
      showRaiiSolution: true,
      status: 'raii_demo',
      message: '🎯 RAII: std::vector y std::unique_ptr<int[]> son más seguros'
    }));
  };

  const reset = () => {
    setState({
      pointer: null,
      arrayData: [],
      arraySize: 0,
      isAllocated: false,
      deletionType: 'none',
      contractViolated: false,
      showRaiiSolution: false,
      status: 'unallocated',
      message: 'Listo para crear array con new int[5]'
    });
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const cppCode = `#include <iostream>

int main() {
    // Array allocation
    int* a = new int[5]{10, 20, 30, 40, 50};
    
    std::cout << "Array elements: ";
    for (int i = 0; i < 5; ++i) {
        std::cout << a[i] << " ";
    }
    std::cout << std::endl;
    
    // WRONG: Contract violation
    delete a;  // UB: Solo destruye a[0], el resto permanece
    
    // CORRECT: Matching operator
    // delete[] a;  // Libera todo el array
    
    return 0;
}`;

  const contractCode = `// new/delete CONTRACT en C++:

// REGLA FUNDAMENTAL: El operador de liberación debe coincidir

new T       →  delete ptr;     // Objeto único
new T[n]    →  delete[] ptr;   // Array de objetos
malloc()    →  free();         // C allocation

// EJEMPLOS DE CONTRATOS:

// ✅ CORRECTO
int* single = new int(42);
delete single;

int* array = new int[10];
delete[] array;

// ❌ INCORRECTO - UB
int* array = new int[10];
delete array;  // Solo destruye array[0]!

// ❌ INCORRECTO - UB  
int* single = new int(42);
delete[] single;  // UB: no es un array`;

  const raiiSolutionsCode = `// ✅ SOLUCIONES RAII MODERNAS:

// 1. std::vector<T> - Gestión automática
#include <vector>
std::vector<int> vec{10, 20, 30, 40, 50};
// Automático: constructor/destructor maneja memoria

// 2. std::unique_ptr<T[]> - Array smart pointer
#include <memory>
auto arr = std::make_unique<int[]>(5);
arr[0] = 10; arr[1] = 20; /* ... */
// Automático: delete[] al destruirse

// 3. std::array<T, N> - Stack-based, tamaño conocido
#include <array>
std::array<int, 5> stack_arr{10, 20, 30, 40, 50};
// Sin heap allocation, sin delete necesario

// ✅ RECOMENDACIÓN SENIOR:
// Preferir containers STL sobre raw arrays en 99% de casos`;

  const whyItMattersCode = `// ¿POR QUÉ IMPORTA EL CONTRACT?

// 1. METADATA DEL ALLOCATOR
// new int[5] almacena información extra:
// [size_metadata][element_0][element_1][element_2][element_3][element_4]
//                 ^-- ptr apunta aquí

// delete ptr    → Solo libera desde ptr
// delete[] ptr  → Libera desde metadata hasta final

// 2. DESTRUCTOR CALLS
class Widget {
public:
    ~Widget() { std::cout << "Destructor called" << std::endl; }
};

Widget* array = new Widget[3];
delete array;   // Solo llama destructor de array[0] 
delete[] array; // Llama destructor de todos los elementos

// 3. HEAP CORRUPTION
// delete incorrecto puede corromper las estructuras del heap
// Comportamiento impredecible en futuras allocaciones`;

  return (
    <LessonLayout
      title="Tarea 6: new[] vs delete[] - Contrato de Arrays"
      difficulty="Básico"
      topic="basic"
      estimatedTime="15 minutos"
    >
      <TheoryPanel>
        
        <Section>
          <SectionTitle>📚 Array Allocation Contract</SectionTitle>
          <p>
            Los arrays asignados con <strong>new[]</strong> requieren liberación con <strong>delete[]</strong>.
            Usar <code>delete</code> simple viola el contrato y causa UB.
          </p>
          
          <h4 style={{ color: '#ff6b6b', marginTop: '1rem' }}>Diferencias Críticas:</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>new int[5]:</strong> Almacena metadata del tamaño</li>
            <li><strong>delete a:</strong> Solo libera el primer elemento</li>
            <li><strong>delete[] a:</strong> Libera todo el array usando metadata</li>
            <li><strong>Violación:</strong> Mezclar operators causa heap corruption</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 Código del Problema</SectionTitle>
          <CodeBlock>{cppCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Simulación del Contract</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <InteractiveSection>
            <Button 
              onClick={allocateArray} 
              disabled={state.isAllocated}
            >
              int* a = new int[5]
            </Button>
            <Button 
              onClick={incorrectDelete} 
              variant="danger"
              disabled={!state.isAllocated || state.deletionType !== 'none'}
            >
              💀 delete a
            </Button>
            <Button 
              onClick={correctDelete} 
              variant="success"
              disabled={!state.isAllocated || state.deletionType !== 'none'}
            >
              ✅ delete[] a
            </Button>
            <Button 
              onClick={showRaiiAlternatives} 
              variant="raii"
            >
              Show RAII
            </Button>
            <Button onClick={nextStep} variant="warning">
              Siguiente Paso
            </Button>
            <Button onClick={reset}>
              Reset
            </Button>
          </InteractiveSection>

          {state.contractViolated && (
            <ContractViolation>
              🚨 CONTRACT VIOLATION DETECTED 🚨<br/>
              delete a (operator delete) usado en array creado con new[]<br/>
              CONSECUENCIAS:<br/>
              • Solo se destruye/libera a[0]<br/>
              • a[1], a[2], a[3], a[4] permanecen en memoria (leak)<br/>
              • Posible corrupción del heap allocator<br/>
              • Comportamiento indefinido en futuras operaciones<br/>
            </ContractViolation>
          )}

          {state.showRaiiSolution && (
            <RAIISolution>
              ✨ RAII SOLUTIONS - MODERN C++ ✨<br/>
              std::vector&lt;int&gt; - Gestión automática completa<br/>
              std::unique_ptr&lt;int[]&gt; - Smart pointer para arrays<br/>
              std::array&lt;int, N&gt; - Array de tamaño fijo en stack<br/>
              <strong>Beneficio:</strong> Sin new/delete manual, sin contract violations
            </RAIISolution>
          )}
        </Section>

        <Section>
          <SectionTitle>⚖️ El Contrato new/delete</SectionTitle>
          <CodeBlock>{contractCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🔍 ¿Por Qué Importa el Contrato?</SectionTitle>
          <CodeBlock>{whyItMattersCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎯 Soluciones RAII Modernas</SectionTitle>
          <CodeBlock>{raiiSolutionsCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🛠️ Herramientas de Detección</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>AddressSanitizer:</strong> Detecta mismatched new/delete</li>
            <li><strong>Valgrind:</strong> Reporta "Mismatched free() / delete / delete []"</li>
            <li><strong>Static Analysis:</strong> clang-tidy, PVS-Studio</li>
            <li><strong>MSVC:</strong> /analyze flag detecta mismatches</li>
            <li><strong>Runtime:</strong> Debug heaps instrumentados</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>📈 Best Practices Profesionales</SectionTitle>
          <div style={{
            background: 'rgba(156, 39, 176, 0.1)',
            border: '1px solid #9c27b0',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <strong>Principios Senior Engineer:</strong>
            <ol style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              <li><strong>RAII First:</strong> std::vector, std::array, std::unique_ptr</li>
              <li><strong>Avoid raw arrays:</strong> Usar containers STL</li>
              <li><strong>Contract awareness:</strong> new[] → delete[]</li>
              <li><strong>Tool integration:</strong> Sanitizers en CI/CD</li>
              <li><strong>Code review focus:</strong> Flagging manual memory management</li>
            </ol>
          </div>
        </Section>

        <Section>
          <SectionTitle>📚 Referencias Técnicas</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li>
              <a href="https://en.cppreference.com/w/cpp/memory/new/operator_delete" 
                 style={{ color: '#00d4ff' }} target="_blank" rel="noopener noreferrer">
                cppreference: operator delete[]
              </a>
            </li>
            <li>
              <a href="https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Res-arr" 
                 style={{ color: '#00d4ff' }} target="_blank" rel="noopener noreferrer">
                Core Guidelines: R.11 Avoid calling new and delete explicitly
              </a>
            </li>
            <li><strong>Effective C++:</strong> Item 16 - Use the same form in corresponding new/delete</li>
            <li><strong>Modern C++:</strong> Containers over raw arrays</li>
          </ul>
        </Section>
      </TheoryPanel>

      <VisualizationPanel>
        <StatusDisplay>
          <div>🎯 Tarea 6: Array Allocation</div>
          <div>📍 Paso: {currentStep + 1}/{steps.length}</div>
          <div>🔗 Estado: {state.status}</div>
          <div>📦 Array: {state.isAllocated ? `${state.arraySize} elements` : 'none'}</div>
          <div>🗑️ Deletion: {state.deletionType}</div>
          <div>⚖️ Contract: {state.contractViolated ? 'VIOLATED' : 'OK'}</div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
          <Lesson06Scene state={state} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
          />
        </Canvas>
      </VisualizationPanel>
    </LessonLayout>
  );
}