import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { THREE } from '../utils/three';

interface Lesson38Props {
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
    .error { color: #f44336; background: rgba(244, 67, 54, 0.1); }
    .good { color: #4caf50; background: rgba(76, 175, 80, 0.1); }
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

const SimulationControls = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const ControlButton = styled.button<{ active?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.active ? '#4caf50' : '#4a9eff'};
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#66bb6a' : '#5ba0ff'};
    transform: translateY(-2px);
  }
`;

interface ThreadProps {
  position: [number, number, number];
  color: string;
  label: string;
  isActive: boolean;
  operation: string;
}

function ThreadVisualization({ position, color, label, isActive, operation }: ThreadProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 2;
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.3, 0.3, 2]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isActive ? color : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.25}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
        textAlign="center"
      >
        {operation}
      </Text>
    </group>
  );
}

interface SharedDataProps {
  position: [number, number, number];
  refCount: number;
  isAtomic: boolean;
  accessing: boolean;
}

function SharedDataVisualization({ position, refCount, isAtomic, accessing }: SharedDataProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (accessing) {
        meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 6) * 0.2;
      }
      const scale = isAtomic ? 1.2 : 1.0;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 1.5, 0.5]} />
        <meshStandardMaterial 
          color={isAtomic ? '#4caf50' : '#ff6b6b'}
          emissive={accessing ? (isAtomic ? '#4caf50' : '#ff6b6b') : '#000000'}
          emissiveIntensity={accessing ? 0.4 : 0}
        />
      </mesh>
      <Text
        position={[0, 0, 0.3]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {isAtomic ? 'atomic<shared_ptr>' : 'shared_ptr'}
      </Text>
      <Text
        position={[0, -0.5, 0.3]}
        fontSize={0.25}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
      >
        ref_count: {refCount}
      </Text>
      
      {/* Memory corruption visualization */}
      {!isAtomic && accessing && (
        <>
          <mesh position={[0.8, 0.3, 0.3]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={0.5} />
          </mesh>
          <Text
            position={[1.2, 0.3, 0.3]}
            fontSize={0.15}
            color="#ff3333"
          >
            RACE!
          </Text>
        </>
      )}
    </group>
  );
}

function AtomicSimulation({ scenario, isRunning }: { scenario: number; isRunning: boolean }) {
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    if (isRunning) {
      setTime(prev => prev + delta);
    }
  });

  const scenarios = [
    // Scenario 0: Non-atomic operations
    {
      isAtomic: false,
      threads: [
        { pos: [-3, 1, 0] as [number, number, number], color: '#ff6b6b', label: 'Thread 1', op: 'Reading ptr' },
        { pos: [-3, -1, 0] as [number, number, number], color: '#ff9800', label: 'Thread 2', op: 'Writing ptr' },
        { pos: [3, 0, 0] as [number, number, number], color: '#9c27b0', label: 'Thread 3', op: 'Updating ref_count' }
      ],
      refCount: Math.floor(2 + Math.sin(time * 3) * 2), // Erratic count
      message: 'Race conditions: ref_count corruption y acceso a memoria inválida'
    },
    // Scenario 1: Atomic operations
    {
      isAtomic: true,
      threads: [
        { pos: [-3, 1, 0] as [number, number, number], color: '#4caf50', label: 'Thread 1', op: 'load()' },
        { pos: [-3, -1, 0] as [number, number, number], color: '#2196f3', label: 'Thread 2', op: 'store()' },
        { pos: [3, 0, 0] as [number, number, number], color: '#ff9800', label: 'Thread 3', op: 'compare_exchange' }
      ],
      refCount: 3, // Stable count
      message: 'Operaciones atómicas: acceso seguro y consistencia garantizada'
    },
    // Scenario 2: Load vs Store race
    {
      isAtomic: false,
      threads: [
        { pos: [-4, 0, 0] as [number, number, number], color: '#f44336', label: 'Reader', op: 'Copying shared_ptr' },
        { pos: [4, 0, 0] as [number, number, number], color: '#ff5722', label: 'Writer', op: 'Resetting shared_ptr' }
      ],
      refCount: time % 2 < 1 ? 1 : 0, // Unstable
      message: 'Reader puede acceder a objeto ya destruido por Writer'
    },
    // Scenario 3: Atomic solution
    {
      isAtomic: true,
      threads: [
        { pos: [-4, 0, 0] as [number, number, number], color: '#4caf50', label: 'Reader', op: 'atomic_load()' },
        { pos: [4, 0, 0] as [number, number, number], color: '#2196f3', label: 'Writer', op: 'atomic_store()' }
      ],
      refCount: 2, // Always consistent
      message: 'atomic_load/store garantizan operaciones thread-safe'
    }
  ];

  const currentScenario = scenarios[scenario] || scenarios[0];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4a9eff" />
      
      {currentScenario.threads.map((thread, index) => (
        <ThreadVisualization
          key={index}
          position={thread.pos}
          color={thread.color}
          label={thread.label}
          isActive={isRunning}
          operation={thread.op}
        />
      ))}
      
      <SharedDataVisualization
        position={[0, 0, 0]}
        refCount={currentScenario.refCount}
        isAtomic={currentScenario.isAtomic}
        accessing={isRunning}
      />

      <Text
        position={[0, -3, 0]}
        fontSize={0.35}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
        maxWidth={16}
        textAlign="center"
      >
        {currentScenario.message}
      </Text>
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </>
  );
}

export default function Lesson38_AtomicSharedPtr({ onComplete, isCompleted }: Lesson38Props) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "¿Por qué shared_ptr no es thread-safe por defecto?",
      options: [
        "El reference counting interno usa operaciones atómicas",
        "Solo el control block es thread-safe, no el puntero en sí",
        "shared_ptr siempre es completamente thread-safe",
        "Solo en sistemas single-core hay problemas"
      ],
      correct: 1
    },
    {
      question: "¿Qué proporciona atomic<shared_ptr<T>>?",
      options: [
        "Solo protección para el reference count",
        "Operaciones atómicas para load, store y compare_exchange",
        "Mejor rendimiento que shared_ptr normal",
        "Protección automática contra deadlocks"
      ],
      correct: 1
    },
    {
      question: "¿Cuándo usar atomic<shared_ptr<T>>?",
      options: [
        "Siempre que uses shared_ptr en aplicaciones multi-thread",
        "Solo cuando múltiples threads modifican el mismo shared_ptr",
        "Únicamente en sistemas con muchos cores",
        "Cuando necesites mejor rendimiento en single-thread"
      ],
      correct: 1
    },
    {
      question: "¿Qué operación es más eficiente en atomic<shared_ptr>?",
      options: [
        "atomic_store() vs copy assignment",
        "atomic_load() vs copy constructor",
        "compare_exchange_weak() vs mutex + comparison",
        "Todas las anteriores son correctas"
      ],
      correct: 3
    },
    {
      question: "¿Qué garantiza compare_exchange_strong()?",
      options: [
        "Solo atomicidad de la comparación",
        "Solo atomicidad del intercambio",
        "Atomicidad de comparación + intercambio condicional",
        "Prevención de spurious failures solamente"
      ],
      correct: 2
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

  const nextScenario = () => {
    setCurrentScenario((prev) => (prev + 1) % 4);
  };

  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
  };

  return (
    <Container>
      <Title>⚛️ Lección 38: atomic&lt;shared_ptr&gt; Lock-Free</Title>
      
      <Description>
        <h3>🎯 Objetivo</h3>
        <p>
          En C++20, atomic&lt;shared_ptr&gt; proporciona operaciones thread-safe sin mutexes 
          para compartir punteros entre threads. Esta lección explora cuándo, cómo y por qué 
          usar atomic shared_ptr para programación concurrente segura y eficiente.
        </p>

        <h4>⚠️ El Problema: Race Conditions con shared_ptr</h4>
        <p>
          Aunque el control block de shared_ptr es thread-safe, las operaciones en el 
          shared_ptr mismo no lo son.
        </p>

        <CodeBlock>
          {`// ❌ PROBLEMA: Race condition peligrosa
std::shared_ptr<int> global_ptr = std::make_shared<int>(42);

// Thread 1: Lee el puntero
void reader_thread() {
    while (true) {
        auto local_copy = global_ptr; // ⚠️ NO thread-safe!
        if (local_copy) {
            std::cout << *local_copy << "\\n";
        }
    }
}

// Thread 2: Modifica el puntero
void writer_thread() {
    while (true) {
        global_ptr = std::make_shared<int>(rand()); // ⚠️ RACE!
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

// CONSECUENCIAS:
// - Corrupción del reference count
// - Acceso a memoria liberada
// - Behavior undefined`}
        </CodeBlock>

        <h4>✅ La Solución: atomic&lt;shared_ptr&gt;</h4>
        <CodeBlock>
          {`// ✅ SOLUCIÓN: Operaciones atómicas
std::atomic<std::shared_ptr<int>> atomic_ptr = 
    std::make_shared<int>(42);

// Thread 1: Lectura atómica
void safe_reader() {
    while (true) {
        auto local_copy = atomic_ptr.load(); // ✅ Thread-safe!
        if (local_copy) {
            std::cout << *local_copy << "\\n";
        }
    }
}

// Thread 2: Escritura atómica
void safe_writer() {
    while (true) {
        auto new_ptr = std::make_shared<int>(rand());
        atomic_ptr.store(new_ptr); // ✅ Atomic swap!
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

// BENEFICIOS:
// ✅ No race conditions
// ✅ Reference counting consistente
// ✅ Sin necesidad de mutex`}
        </CodeBlock>
      </Description>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <AtomicSimulation scenario={currentScenario} isRunning={isSimulationRunning} />
        </Canvas>
      </CanvasContainer>

      <SimulationControls>
        <ControlButton onClick={nextScenario}>
          Escenario {currentScenario + 1}/4
        </ControlButton>
        <ControlButton active={isSimulationRunning} onClick={toggleSimulation}>
          {isSimulationRunning ? 'Pausar' : 'Ejecutar'} Simulación
        </ControlButton>
      </SimulationControls>

      <Description>
        <h4>🔧 Operaciones Avanzadas</h4>
        
        <h5>Compare-Exchange para Updates Condicionales:</h5>
        <CodeBlock>
          {`// Compare-and-swap atómico
void atomic_update(std::atomic<std::shared_ptr<Node>>& atomic_node) {
    auto expected = atomic_node.load();
    auto new_node = std::make_shared<Node>();
    
    // Reintenta hasta que tenga éxito
    while (!atomic_node.compare_exchange_weak(expected, new_node)) {
        // expected se actualiza automáticamente con el valor actual
        // Recalcular new_node basado en expected si es necesario
        new_node = create_updated_node(expected);
    }
    // ✅ Update exitoso: old node liberado automáticamente
}`}
        </CodeBlock>

        <h5>Lock-Free Stack Example:</h5>
        <CodeBlock>
          {`// Stack thread-safe sin mutex
template<typename T>
class LockFreeStack {
    struct Node {
        T data;
        std::shared_ptr<Node> next;
        Node(T val) : data(val) {}
    };
    
    std::atomic<std::shared_ptr<Node>> head;

public:
    void push(T item) {
        auto new_node = std::make_shared<Node>(item);
        new_node->next = head.load();
        
        // Retry loop para operación atómica
        while (!head.compare_exchange_weak(new_node->next, new_node)) {
            // new_node->next se actualiza automáticamente
        }
    }
    
    std::optional<T> pop() {
        auto old_head = head.load();
        while (old_head && 
               !head.compare_exchange_weak(old_head, old_head->next)) {
            // old_head se actualiza en cada intento fallido
        }
        return old_head ? old_head->data : std::nullopt;
    }
};`}
        </CodeBlock>

        <h4>⚡ Consideraciones de Rendimiento</h4>
        <ul>
          <li><strong>Memory Ordering:</strong> memory_order_acq_rel por defecto</li>
          <li><strong>Cache Lines:</strong> atomic&lt;shared_ptr&gt; es más grande (~16 bytes)</li>
          <li><strong>Contention:</strong> Múltiples writers pueden causar retry loops</li>
          <li><strong>ABA Problem:</strong> compare_exchange previene este problema</li>
        </ul>

        <CodeBlock>
          {`// Optimización: memory ordering específico
auto ptr = atomic_ptr.load(std::memory_order_acquire);
atomic_ptr.store(new_ptr, std::memory_order_release);`}
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
              {score >= 80 ? '🎉 ¡Excelente! Dominas atomic<shared_ptr>' :
               score >= 60 ? '👍 Bien, pero revisa los conceptos de atomicidad' :
               '📚 Necesitas repasar programación concurrente con shared_ptr'}
            </p>
          </ScoreDisplay>
        )}
      </QuizContainer>
    </Container>
  );
}