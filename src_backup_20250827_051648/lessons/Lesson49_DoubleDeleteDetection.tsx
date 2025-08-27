import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson49Props {
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #4a9eff;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.5rem;
  text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
`;

const Description = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 158, 255, 0.3);
`;

const CodeBlock = styled.pre`
  background: #1a1a1a;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  border-left: 4px solid #4a9eff;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
  
  code {
    color: #e0e0e0;
    
    .keyword { color: #569cd6; }
    .string { color: #ce9178; }
    .comment { color: #6a9955; }
    .type { color: #4ec9b0; }
    .number { color: #b5cea8; }
    .danger { color: #ff3333; background: rgba(255, 51, 51, 0.1); padding: 2px; }
    .safe { color: #4caf50; background: rgba(76, 175, 80, 0.1); padding: 2px; }
    .debug { color: #ff9800; background: rgba(255, 152, 0, 0.1); padding: 2px; }
  }
`;

const CanvasContainer = styled.div`
  height: 500px;
  margin: 20px 0;
  border: 2px solid #4a9eff;
  border-radius: 10px;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0f23 100%);
`;

const QuizContainer = styled.div`
  background: rgba(74, 158, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
`;

const QuestionButton = styled.button<{ selected: boolean; correct?: boolean; incorrect?: boolean }>`
  display: block;
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  background: ${props => 
    props.correct ? '#4caf50' : 
    props.incorrect ? '#f44336' : 
    props.selected ? '#4a9eff' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => 
    props.correct ? '#4caf50' : 
    props.incorrect ? '#f44336' : 
    props.selected ? '#4a9eff' : 'transparent'};
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    background: ${props => !props.correct && !props.incorrect ? '#4a9eff' : props.background};
    transform: translateX(5px);
  }
`;

const ScoreDisplay = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #4a9eff;
  margin: 20px 0;
`;

const TechniqueSelector = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const TechniqueButton = styled.button<{ active: boolean; type?: 'debug' | 'production' | 'prevention' }>`
  padding: 10px 20px;
  background: ${props => 
    props.type === 'debug' ? '#ff9800' : 
    props.type === 'production' ? '#f44336' : 
    props.type === 'prevention' ? '#4caf50' :
    props.active ? '#4a9eff' : '#666'};
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const WarningBox = styled.div`
  background: rgba(255, 51, 51, 0.1);
  border: 2px solid #ff3333;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  color: #ff6666;
  
  h4 {
    color: #ff3333;
    margin-bottom: 10px;
  }
`;

interface MemoryVisualizationProps {
  scenario: number;
}

function MemoryCell({ 
  position, 
  isAllocated, 
  isCorrupted, 
  label,
  beingDeleted 
}: {
  position: [number, number, number];
  isAllocated: boolean;
  isCorrupted: boolean;
  label: string;
  beingDeleted: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (isCorrupted) {
        // Corrupted memory: chaotic animation
        meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 8) * 0.5;
        meshRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 6) * 0.3;
        const scale = 1 + Math.sin(state.clock.getElapsedTime() * 10) * 0.3;
        meshRef.current.scale.setScalar(scale);
      } else if (beingDeleted) {
        // Being deleted: shrinking animation
        const shrink = Math.max(0.1, 1 - (state.clock.getElapsedTime() % 2) * 0.5);
        meshRef.current.scale.setScalar(shrink);
      } else if (isAllocated) {
        // Normal allocated memory: gentle pulse
        const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
        meshRef.current.scale.setScalar(scale);
      } else {
        // Free memory: static
        meshRef.current.scale.setScalar(0.8);
      }
    }
  });

  const getColor = () => {
    if (isCorrupted) return '#ff3333';
    if (!isAllocated) return '#666666';
    if (beingDeleted) return '#ff9800';
    return '#4caf50';
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 1, 0.3]} />
        <meshStandardMaterial 
          color={getColor()}
          emissive={isCorrupted ? '#ff3333' : '#000000'}
          emissiveIntensity={isCorrupted ? 0.6 : 0}
          transparent
          opacity={isAllocated ? 0.9 : 0.4}
        />
      </mesh>
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      {isCorrupted && (
        <>
          <Text
            position={[0, -0.7, 0.2]}
            fontSize={0.2}
            color="#ff3333"
            anchorX="center"
            anchorY="middle"
          >
            CORRUPTED!
          </Text>
          {/* Corruption particles */}
          <mesh position={[0.6, 0.3, 0.2]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.4, -0.2, 0.2]}>
            <sphereGeometry args={[0.06]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.8} />
          </mesh>
        </>
      )}
    </group>
  );
}

function DetectionVisualization({ scenario }: MemoryVisualizationProps) {
  const scenarios = [
    // Scenario 0: Double delete problem
    {
      title: "Double Delete Problem",
      cells: [
        { pos: [-2, 1, 0] as [number, number, number], allocated: true, corrupted: false, label: "Object", deleting: false },
        { pos: [0, 1, 0] as [number, number, number], allocated: false, corrupted: true, label: "Freed", deleting: false },
        { pos: [2, 1, 0] as [number, number, number], allocated: false, corrupted: true, label: "Double Free", deleting: true }
      ],
      description: "Segunda llamada a delete causa undefined behavior"
    },
    // Scenario 1: Debug detection
    {
      title: "Debug Heap Detection",
      cells: [
        { pos: [-2, 1, 0] as [number, number, number], allocated: true, corrupted: false, label: "0xDEADBEEF", deleting: false },
        { pos: [0, 1, 0] as [number, number, number], allocated: false, corrupted: false, label: "Guard Pattern", deleting: false },
        { pos: [2, 1, 0] as [number, number, number], allocated: false, corrupted: true, label: "DETECTED!", deleting: false }
      ],
      description: "Debug heap detecta patrón inválido y aborta"
    },
    // Scenario 2: Smart pointer protection
    {
      title: "Smart Pointer Protection",
      cells: [
        { pos: [-2, 1, 0] as [number, number, number], allocated: true, corrupted: false, label: "unique_ptr", deleting: false },
        { pos: [0, 1, 0] as [number, number, number], allocated: false, corrupted: false, label: "reset()", deleting: false },
        { pos: [2, 1, 0] as [number, number, number], allocated: false, corrupted: false, label: "Safe", deleting: false }
      ],
      description: "Smart pointers previenen automáticamente double delete"
    },
    // Scenario 3: Custom detection
    {
      title: "Custom Detection System",
      cells: [
        { pos: [-2, 1, 0] as [number, number, number], allocated: true, corrupted: false, label: "Tracked", deleting: false },
        { pos: [0, 1, 0] as [number, number, number], allocated: false, corrupted: false, label: "Registry", deleting: false },
        { pos: [2, 1, 0] as [number, number, number], allocated: false, corrupted: false, label: "Validated", deleting: false }
      ],
      description: "Sistema personalizado rastrea todas las allocaciones"
    }
  ];

  const currentScenario = scenarios[scenario] || scenarios[0];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4a9eff" />
      
      {currentScenario.cells.map((cell, index) => (
        <MemoryCell
          key={index}
          position={cell.pos}
          isAllocated={cell.allocated}
          isCorrupted={cell.corrupted}
          label={cell.label}
          beingDeleted={cell.deleting}
        />
      ))}

      <Text
        position={[0, -1.5, 0]}
        fontSize={0.35}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
        maxWidth={16}
        textAlign="center"
      >
        {currentScenario.title}
      </Text>

      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
        maxWidth={14}
        textAlign="center"
      >
        {currentScenario.description}
      </Text>
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </>
  );
}

export default function Lesson49_DoubleDeleteDetection({ onComplete, isCompleted }: Lesson49Props) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "¿Por qué double delete causa undefined behavior?",
      options: [
        "Solo es un warning del compilador",
        "La memoria puede haber sido reasignada a otro objeto",
        "Solo afecta el rendimiento, no la correctitud",
        "Es perfectamente seguro en C++ moderno"
      ],
      correct: 1
    },
    {
      question: "¿Cómo detecta el debug heap un double delete?",
      options: [
        "Mantiene todos los punteros en una lista",
        "Usa patrones especiales y guards en memoria freed",
        "Compila con información extra de debug",
        "Solo funciona con AddressSanitizer"
      ],
      correct: 1
    },
    {
      question: "¿Cuál es la mejor prevención contra double delete?",
      options: [
        "Usar siempre AddressSanitizer",
        "Verificar manualmente cada delete",
        "Usar smart pointers y RAII",
        "Poner asserts antes de cada delete"
      ],
      correct: 2
    },
    {
      question: "¿Qué hace AddressSanitizer para detectar double delete?",
      options: [
        "Instrumenta cada malloc/free para tracking",
        "Usa breakpoints en tiempo de ejecución",
        "Solo funciona con código compilado en debug",
        "Requiere modificar manualmente el código"
      ],
      correct: 0
    },
    {
      question: "¿Por qué un custom allocator puede ayudar?",
      options: [
        "Es más rápido que malloc/free",
        "Puede implementar detección personalizada",
        "Usa menos memoria",
        "Solo las opciones A y B"
      ],
      correct: 1
    }
  ];

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (showResults) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    const correctAnswers = selectedAnswers.filter((answer, index) => 
      answer === questions[index].correct
    ).length;
    return (correctAnswers / questions.length) * 100;
  };

  const handleShowResults = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    if (!isCompleted) {
      onComplete(finalScore);
    }
  };

  return (
    <Container>
      <Title>🔍 Lección 49: Detección de Double Delete</Title>
      
      <Description>
        <h3>🎯 Objetivo</h3>
        <p>
          Double delete es uno de los bugs más peligrosos en C++. Esta lección explora 
          técnicas para detectar y prevenir double delete, desde debug heaps hasta 
          sistemas de detección personalizados.
        </p>

        <WarningBox>
          <h4>💥 ¿Por qué Double Delete es Tan Peligroso?</h4>
          <p>
            Cuando llamas delete dos veces en el mismo puntero, la segunda llamada 
            opera en memoria que puede haber sido reasignada a otro objeto, causando 
            corrupción de datos impredecible.
          </p>
        </WarningBox>

        <h4>❌ El Problema del Double Delete</h4>
        <CodeBlock>
          {`// ❌ PELIGROSO: Double delete clásico
int* ptr = new int(42);

// Primera destrucción - legal
delete ptr;  // ✓ Memoria liberada

// Entre la primera y segunda llamada:
// - Memoria puede ser reasignada por malloc
// - Otro objeto puede estar en esa dirección
// - Heap metadata puede haber cambiado

// Segunda destrucción - UNDEFINED BEHAVIOR
delete ptr;  // ⚠️ ¡Puede corromper cualquier cosa!

// Posibles consecuencias:
// 1. Segmentation fault (si tenemos suerte)
// 2. Corrupción silenciosa de otros objetos
// 3. Heap corruption y crashes random
// 4. Vulnerabilidades de seguridad`}
        </CodeBlock>

        <h4>🐛 Detección en Debug Mode</h4>
        <CodeBlock>
          {`// Debug Heap Detection (Windows MSVC)
#ifdef _DEBUG
#include <crtdbg.h>

int main() {
    // Habilitar debug heap
    _CrtSetDbgFlag(_CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF);
    
    int* ptr = new int(42);
    delete ptr;
    
    // Debug heap detecta esto automáticamente
    delete ptr;  // ← Assertion failure + stack trace!
    
    return 0;
}
#endif

// Output típico:
// HEAP[program.exe]: Invalid Address specified to RtlFreeHeap
// Debug Assertion Failed!
// _BLOCK_TYPE_IS_VALID(pHead->nBlockUse)`}
        </CodeBlock>
      </Description>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <DetectionVisualization scenario={currentScenario} />
        </Canvas>
      </CanvasContainer>

      <TechniqueSelector>
        <TechniqueButton 
          active={currentScenario === 0} 
          onClick={() => setCurrentScenario(0)}
        >
          Double Delete Problem
        </TechniqueButton>
        <TechniqueButton 
          active={currentScenario === 1} 
          type="debug"
          onClick={() => setCurrentScenario(1)}
        >
          Debug Heap Detection
        </TechniqueButton>
        <TechniqueButton 
          active={currentScenario === 2} 
          type="prevention"
          onClick={() => setCurrentScenario(2)}
        >
          Smart Pointer Prevention
        </TechniqueButton>
        <TechniqueButton 
          active={currentScenario === 3} 
          type="production"
          onClick={() => setCurrentScenario(3)}
        >
          Custom Detection
        </TechniqueButton>
      </TechniqueSelector>

      <Description>
        <h4>🛠️ Herramientas de Detección</h4>

        <h5>1. AddressSanitizer (Recomendado):</h5>
        <CodeBlock>
          {`// Compilación con AddressSanitizer
// $ g++ -fsanitize=address -g program.cpp
// $ clang++ -fsanitize=address -g program.cpp

#include <iostream>

int main() {
    int* ptr = new int(42);
    
    std::cout << "First delete\\n";
    delete ptr;
    
    std::cout << "Second delete (will be caught)\\n";
    delete ptr;  // ← AddressSanitizer detecta esto
}

// Output de AddressSanitizer:
// ERROR: AddressSanitizer: attempting double-free on 0x60200000eff0
// #0 0x... in operator delete(void*)
// #1 0x... in main program.cpp:10:5
// previously allocated here:
// #0 0x... in operator new(unsigned long)`}
        </CodeBlock>

        <h5>2. Valgrind (Linux/macOS):</h5>
        <CodeBlock>
          {`// Ejecutar con Valgrind
// $ valgrind --tool=memcheck --leak-check=full ./program

// Output típico de Valgrind:
// ==1234== Invalid free() / delete / delete[] / realloc()
// ==1234==    at 0x...: operator delete(void*)
// ==1234==    by 0x...: main (program.cpp:10)
// ==1234==  Address 0x... is 0 bytes inside a block of size 4 free'd
// ==1234==    at 0x...: operator delete(void*)
// ==1234==    by 0x...: main (program.cpp:8)`}
        </CodeBlock>

        <h4>🛡️ Prevención con Smart Pointers</h4>
        <CodeBlock>
          {`// ✅ PREVENCIÓN: unique_ptr previene double delete
std::unique_ptr<int> ptr = std::make_unique<int>(42);

// Primera "destrucción" - toma ownership
std::unique_ptr<int> ptr2 = std::move(ptr);
// ptr ahora es nullptr automáticamente

// Intentar "double delete"
ptr.reset();  // ✅ Seguro: no hace nada si es nullptr

// ✅ PREVENCIÓN: Verificación manual
int* raw_ptr = new int(42);

if (raw_ptr) {
    delete raw_ptr;
    raw_ptr = nullptr;  // ← Crítico: evita double delete
}

// Segundo delete ahora es seguro
delete raw_ptr;  // ✅ delete nullptr es seguro (no-op)`}
        </CodeBlock>

        <h4>🔧 Sistema de Detección Personalizado</h4>
        <CodeBlock>
          {`// Debug allocator con tracking
#include <unordered_set>
#include <mutex>
#include <iostream>

class DebugAllocator {
    static std::unordered_set<void*> allocated_pointers;
    static std::mutex mutex;

public:
    static void* allocate(size_t size) {
        void* ptr = malloc(size);
        
        std::lock_guard<std::mutex> lock(mutex);
        allocated_pointers.insert(ptr);
        
        std::cout << "Allocated: " << ptr << "\\n";
        return ptr;
    }
    
    static void deallocate(void* ptr) {
        if (!ptr) return; // delete nullptr es legal
        
        std::lock_guard<std::mutex> lock(mutex);
        
        auto it = allocated_pointers.find(ptr);
        if (it == allocated_pointers.end()) {
            // DOUBLE DELETE DETECTADO!
            std::cerr << "ERROR: Double delete detected for " << ptr << "\\n";
            std::terminate();
        }
        
        allocated_pointers.erase(it);
        free(ptr);
        std::cout << "Deallocated: " << ptr << "\\n";
    }
};

// Uso del debug allocator
int* ptr = static_cast<int*>(DebugAllocator::allocate(sizeof(int)));
*ptr = 42;

DebugAllocator::deallocate(ptr);   // ✓ Primera llamada OK
DebugAllocator::deallocate(ptr);   // ← DETECTADO y terminado!`}
        </CodeBlock>

        <h4>📋 Best Practices</h4>
        <ul>
          <li>🎯 <strong>Usar smart pointers por defecto</strong> - Prevención automática</li>
          <li>🔍 <strong>Compilar con AddressSanitizer en desarrollo</strong></li>
          <li>✅ <strong>Siempre poner punteros en nullptr después de delete</strong></li>
          <li>🧪 <strong>Testing extenso con herramientas de detección</strong></li>
          <li>📝 <strong>Code reviews enfocados en memory management</strong></li>
          <li>🚫 <strong>Evitar raw pointers cuando sea posible</strong></li>
        </ul>

        <h4>🔬 Ejemplo de Testing</h4>
        <CodeBlock>
          {`// Unit test que verifica protección contra double delete
#include <gtest/gtest.h>

TEST(SmartPointerTest, DoubleDeletePrevention) {
    auto ptr = std::make_unique<int>(42);
    
    // Primera "delete" mediante move
    auto ptr2 = std::move(ptr);
    EXPECT_EQ(ptr.get(), nullptr); // ptr debe ser nullptr
    
    // "Double delete" debe ser seguro
    EXPECT_NO_THROW(ptr.reset());
    EXPECT_NO_THROW(ptr = nullptr);
}`}
        </CodeBlock>
      </Description>

      <QuizContainer>
        <h3>🧠 Evaluación de Conocimientos</h3>
        {questions.map((q, qIndex) => (
          <div key={qIndex} style={{ marginBottom: '20px' }}>
            <h4>{q.question}</h4>
            {q.options.map((option, oIndex) => (
              <QuestionButton
                key={oIndex}
                selected={selectedAnswers[qIndex] === oIndex}
                correct={showResults && oIndex === q.correct}
                incorrect={showResults && selectedAnswers[qIndex] === oIndex && oIndex !== q.correct}
                onClick={() => handleAnswerSelect(qIndex, oIndex)}
              >
                {option}
              </QuestionButton>
            ))}
          </div>
        ))}
        
        {selectedAnswers.length === questions.length && !showResults && (
          <button 
            onClick={handleShowResults}
            style={{
              padding: '15px 30px',
              background: '#4caf50',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '20px'
            }}
          >
            Ver Resultados
          </button>
        )}
        
        {showResults && (
          <ScoreDisplay>
            <h3>📊 Resultado Final</h3>
            <p>Has obtenido {score.toFixed(1)}% de aciertos</p>
            <p>
              {score >= 80 ? '🎉 ¡Excelente! Entiendes la detección de double delete' :
               score >= 60 ? '👍 Bien, pero practica más con herramientas de detección' :
               '📚 Necesitas repasar los conceptos de double delete y su prevención'}
            </p>
          </ScoreDisplay>
        )}
      </QuizContainer>
    </Container>
  );
}