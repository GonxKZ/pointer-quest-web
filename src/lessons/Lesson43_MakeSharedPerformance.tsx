import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson43Props {
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
    .fast { color: #4caf50; background: rgba(76, 175, 80, 0.1); padding: 2px; }
    .slow { color: #f44336; background: rgba(244, 67, 54, 0.1); padding: 2px; }
    .highlight { background: rgba(255, 235, 59, 0.2); padding: 2px; }
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

const ComparisonSelector = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const ComparisonButton = styled.button<{ active: boolean; type?: 'fast' | 'slow' }>`
  padding: 10px 20px;
  background: ${props => 
    props.type === 'fast' ? '#4caf50' : 
    props.type === 'slow' ? '#f44336' : 
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

const PerformanceChart = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  
  .bar {
    display: flex;
    align-items: center;
    margin: 10px 0;
    
    .label {
      width: 200px;
      color: #fff;
      font-size: 0.9rem;
    }
    
    .bar-fill {
      height: 25px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      color: white;
      font-weight: bold;
      font-size: 0.8rem;
    }
  }
`;

interface MemoryLayoutProps {
  approach: number;
}

function MemoryBlock({ 
  position, 
  size, 
  label, 
  color, 
  isFragmented 
}: {
  position: [number, number, number];
  size: [number, number, number];
  label: string;
  color: string;
  isFragmented: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isFragmented) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color}
          transparent
          opacity={isFragmented ? 0.6 : 0.9}
        />
      </mesh>
      <Text
        position={[0, 0, size[2]/2 + 0.1]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function PerformanceVisualization({ approach }: MemoryLayoutProps) {
  const approaches = [
    // Approach 0: shared_ptr(new T)
    {
      title: "shared_ptr(new T) - Two Allocations",
      blocks: [
        { pos: [-3, 1, 0] as [number, number, number], size: [1.5, 0.8, 0.3] as [number, number, number], label: "Object", color: "#ff6b6b", fragmented: true },
        { pos: [1, 1, 0] as [number, number, number], size: [2, 0.8, 0.3] as [number, number, number], label: "Control Block", color: "#ff9800", fragmented: true },
        { pos: [-3, -0.5, 0] as [number, number, number], size: [1.5, 0.5, 0.2] as [number, number, number], label: "Cache Miss", color: "#f44336", fragmented: true },
        { pos: [1, -0.5, 0] as [number, number, number], size: [2, 0.5, 0.2] as [number, number, number], label: "Cache Miss", color: "#f44336", fragmented: true }
      ],
      performance: "Slower: 2 allocations + cache misses"
    },
    // Approach 1: make_shared
    {
      title: "make_shared<T> - Single Allocation",
      blocks: [
        { pos: [0, 1, 0] as [number, number, number], size: [4, 0.8, 0.3] as [number, number, number], label: "Object + Control Block", color: "#4caf50", fragmented: false },
        { pos: [-1, 0, 0] as [number, number, number], size: [1.5, 0.5, 0.2] as [number, number, number], label: "Object", color: "#66bb6a", fragmented: false },
        { pos: [1, 0, 0] as [number, number, number], size: [1.5, 0.5, 0.2] as [number, number, number], label: "Control Block", color: "#81c784", fragmented: false }
      ],
      performance: "Faster: 1 allocation + cache friendly"
    },
    // Approach 2: Memory Layout Comparison
    {
      title: "Memory Layout Impact",
      blocks: [
        { pos: [-3, 2, 0] as [number, number, number], size: [1, 0.6, 0.2] as [number, number, number], label: "Heap Block 1", color: "#ff6b6b", fragmented: true },
        { pos: [3, 2, 0] as [number, number, number], size: [1, 0.6, 0.2] as [number, number, number], label: "Heap Block 2", color: "#ff6b6b", fragmented: true },
        { pos: [0, 0, 0] as [number, number, number], size: [3, 0.8, 0.3] as [number, number, number], label: "Contiguous Block", color: "#4caf50", fragmented: false }
      ],
      performance: "Locality of reference matters"
    },
    // Approach 3: Exception Safety
    {
      title: "Exception Safety Comparison",
      blocks: [
        { pos: [-2, 1.5, 0] as [number, number, number], size: [1.5, 0.6, 0.2] as [number, number, number], label: "new T()", color: "#ff9800", fragmented: true },
        { pos: [2, 1.5, 0] as [number, number, number], size: [1.5, 0.6, 0.2] as [number, number, number], label: "shared_ptr ctor", color: "#ff9800", fragmented: true },
        { pos: [0, 0, 0] as [number, number, number], size: [2.5, 0.8, 0.3] as [number, number, number], label: "make_shared (atomic)", color: "#4caf50", fragmented: false }
      ],
      performance: "Exception safety guaranteed"
    }
  ];

  const currentApproach = approaches[approach] || approaches[0];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4a9eff" />
      
      {currentApproach.blocks.map((block, index) => (
        <MemoryBlock
          key={index}
          position={block.pos}
          size={block.size}
          label={block.label}
          color={block.color}
          isFragmented={block.fragmented}
        />
      ))}

      <Text
        position={[0, -2.5, 0]}
        fontSize={0.35}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
        maxWidth={16}
        textAlign="center"
      >
        {currentApproach.title}
      </Text>

      <Text
        position={[0, -3.5, 0]}
        fontSize={0.3}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
        maxWidth={14}
        textAlign="center"
      >
        {currentApproach.performance}
      </Text>
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </>
  );
}

export default function Lesson43_MakeSharedPerformance({ onComplete, isCompleted }: Lesson43Props) {
  const [currentApproach, setCurrentApproach] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "¿Cuál es la principal ventaja de make_shared sobre shared_ptr(new T)?",
      options: [
        "make_shared es más seguro para threads",
        "make_shared hace una sola allocación vs dos",
        "make_shared tiene mejor sintaxis",
        "make_shared funciona con constructores privados"
      ],
      correct: 1
    },
    {
      question: "¿Por qué make_shared es más cache-friendly?",
      options: [
        "Usa menos CPU cycles",
        "Object y control block están contiguos en memoria",
        "Tiene menos overhead de memoria",
        "Usa algoritmos de allocación optimizados"
      ],
      correct: 1
    },
    {
      question: "¿Cuál es una desventaja de make_shared?",
      options: [
        "Es más lento que shared_ptr(new T)",
        "No puede usar custom deleters",
        "Memoria no se libera hasta que weak_ptr también expiren",
        "No funciona con arrays"
      ],
      correct: 2
    },
    {
      question: "¿Cuándo NO usar make_shared?",
      options: [
        "Cuando necesites custom deleters",
        "Cuando el objeto sea muy grande y uses weak_ptr",
        "Cuando necesites exception safety",
        "Las opciones A y B son correctas"
      ],
      correct: 3
    },
    {
      question: "¿Qué garantiza make_shared respecto a exception safety?",
      options: [
        "Previene memory leaks si el constructor lanza",
        "Es más rápido en casos de excepción",
        "Automáticamente hace rollback de cambios",
        "Previene double delete automáticamente"
      ],
      correct: 0
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
      <Title>⚡ Lección 43: make_shared vs shared_ptr(new T)</Title>
      
      <Description>
        <h3>🎯 Objetivo</h3>
        <p>
          Entender las diferencias de rendimiento entre make_shared y shared_ptr(new T), 
          incluyendo allocaciones de memoria, cache locality, exception safety y cuándo 
          usar cada aproximación.
        </p>

        <h4>🚀 Performance: make_shared vs shared_ptr(new T)</h4>
        <CodeBlock>
<code><span className="comment">// ❌ LENTO: Dos allocaciones separadas</span>
<span className="keyword">auto</span> <span className="keyword">ptr1</span> = <span className="type">std::shared_ptr</span>&lt;<span className="type">MyClass</span>&gt;(<span className="slow">new MyClass(args)</span>);

<span className="comment">// Internamente hace:</span>
<span className="comment">// 1. new MyClass(args)      ← Allocación en heap #1</span>
<span className="comment">// 2. new ControlBlock       ← Allocación en heap #2</span>
<span className="comment">// Resultado: Fragmentación + cache misses</span>

<span className="comment">// ✅ RÁPIDO: Una sola allocación</span>
<span className="keyword">auto</span> <span className="keyword">ptr2</span> = <span className="fast">std::make_shared&lt;MyClass&gt;(args)</span>;

<span className="comment">// Internamente hace:</span>
<span className="comment">// 1. malloc(sizeof(MyClass) + sizeof(ControlBlock))</span>
<span className="comment">// 2. new(ptr) MyClass(args)</span>
<span className="comment">// 3. new(ptr+offset) ControlBlock</span>
<span className="comment">// Resultado: Memoria contigua + cache friendly</span></code>
        </CodeBlock>

        <PerformanceChart>
          <div className="bar">
            <div className="label">shared_ptr(new T):</div>
            <div className="bar-fill" style={{ width: '300px', background: 'linear-gradient(90deg, #f44336, #ff6b6b)' }}>
              2 allocations + fragmentation
            </div>
          </div>
          <div className="bar">
            <div className="label">make_shared&lt;T&gt;:</div>
            <div className="bar-fill" style={{ width: '150px', background: 'linear-gradient(90deg, #4caf50, #66bb6a)' }}>
              1 allocation + contiguous
            </div>
          </div>
        </PerformanceChart>

        <h4>🧠 Exception Safety</h4>
        <CodeBlock>
<code><span className="comment">// ❌ PELIGROSO: Posible memory leak</span>
<span className="keyword">void</span> <span className="type">dangerous_function</span>(<span className="type">std::shared_ptr</span>&lt;<span className="type">A</span>&gt; <span className="keyword">a</span>, <span className="type">std::shared_ptr</span>&lt;<span className="type">B</span>&gt; <span className="keyword">b</span>);

<span className="slow">dangerous_function(
    std::shared_ptr&lt;A&gt;(new A()),  // ← Si new B() falla...
    std::shared_ptr&lt;B&gt;(new B())   // ← ...A puede no ser liberado
);</span>

<span className="comment">// Secuencia de evaluación indefinida:</span>
<span className="comment">// 1. new A()           ✓</span>
<span className="comment">// 2. new B()           ✗ lanza excepción</span>
<span className="comment">// 3. shared_ptr&lt;A&gt;()   ← NUNCA se ejecuta!</span>
<span className="comment">// Resultado: A* queda sin liberar</span>

<span className="comment">// ✅ SEGURO: Exception safety garantizado</span>
<span className="fast">dangerous_function(
    std::make_shared&lt;A&gt;(),       // ← Atómica: todo o nada
    std::make_shared&lt;B&gt;()        // ← Atómica: todo o nada
);</span></code>
        </CodeBlock>
      </Description>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <PerformanceVisualization approach={currentApproach} />
        </Canvas>
      </CanvasContainer>

      <ComparisonSelector>
        <ComparisonButton 
          active={currentApproach === 0} 
          type="slow"
          onClick={() => setCurrentApproach(0)}
        >
          shared_ptr(new T)
        </ComparisonButton>
        <ComparisonButton 
          active={currentApproach === 1} 
          type="fast"
          onClick={() => setCurrentApproach(1)}
        >
          make_shared
        </ComparisonButton>
        <ComparisonButton 
          active={currentApproach === 2} 
          onClick={() => setCurrentApproach(2)}
        >
          Memory Layout
        </ComparisonButton>
        <ComparisonButton 
          active={currentApproach === 3} 
          onClick={() => setCurrentApproach(3)}
        >
          Exception Safety
        </ComparisonButton>
      </ComparisonSelector>

      <Description>
        <h4>⚠️ Desventajas de make_shared</h4>
        
        <h5>1. Custom Deleters:</h5>
        <CodeBlock>
<code><span className="comment">// ❌ make_shared NO puede usar custom deleters</span>
<span className="keyword">auto</span> <span className="keyword">file_ptr</span> = <span className="slow">std::make_shared&lt;FILE&gt;();</span> <span className="comment">// ¡No puede pasar custom deleter!</span>

<span className="comment">// ✅ shared_ptr SÍ puede</span>
<span className="keyword">auto</span> <span className="keyword">file_ptr</span> = <span className="type">std::shared_ptr</span>&lt;<span className="type">FILE</span>&gt;(
    <span className="type">fopen</span>(<span className="string">"file.txt"</span>, <span className="string">"r"</span>),
    [](<span className="type">FILE</span>* <span className="keyword">f</span>) { <span className="keyword">if</span> (<span className="keyword">f</span>) <span className="type">fclose</span>(<span className="keyword">f</span>); } <span className="comment">// Custom deleter</span>
);</code>
        </CodeBlock>

        <h5>2. Delayed Deallocation con weak_ptr:</h5>
        <CodeBlock>
<code><span className="comment">// Problema: memory NO se libera hasta que weak_ptr expire</span>
<span className="keyword">std::weak_ptr</span>&lt;<span className="type">LargeObject</span>&gt; <span className="keyword">weak_ref</span>;

{
    <span className="keyword">auto</span> <span className="keyword">shared_obj</span> = <span className="type">std::make_shared</span>&lt;<span className="type">LargeObject</span>&gt;();
    <span className="keyword">weak_ref</span> = <span className="keyword">shared_obj</span>;
    
    <span className="comment">// shared_obj se destruye aquí, PERO...</span>
    <span className="comment">// ¡La memoria (Object + Control Block) NO se libera!</span>
    <span className="comment">// Porque weak_ref mantiene el control block vivo</span>
    <span className="comment">// Y make_shared puso todo en el mismo bloque</span>
}

<span className="comment">// La memoria se libera solo cuando weak_ref expire</span>
<span className="keyword">weak_ref</span>.<span className="type">reset</span>(); <span className="comment">// ← Ahora sí se libera todo</span>

<span className="comment">// Con shared_ptr(new T):</span>
<span className="comment">// - Object se libera cuando shared_ptr expire</span>
<span className="comment">// - Control block se libera cuando weak_ptr expire</span></code>
        </CodeBlock>

        <h4>📊 Cuándo Usar Cada Uno</h4>
        
        <h5>✅ Usar make_shared cuando:</h5>
        <ul>
          <li>🚀 <strong>Rendimiento es crítico</strong> (default choice)</li>
          <li>🛡️ <strong>Exception safety es importante</strong></li>
          <li>💾 <strong>Memory locality es beneficiosa</strong></li>
          <li>📦 <strong>No necesitas custom deleters</strong></li>
        </ul>

        <h5>✅ Usar shared_ptr(new T) cuando:</h5>
        <ul>
          <li>🔧 <strong>Necesitas custom deleters</strong></li>
          <li>🐘 <strong>Objeto es muy grande + usas weak_ptr</strong></li>
          <li>🔗 <strong>Adoptas objeto ya existente</strong></li>
          <li>🎯 <strong>Necesitas constructor protegido/privado</strong></li>
        </ul>

        <h4>🔬 Medición de Performance</h4>
        <CodeBlock>
<code><span className="comment">// Benchmark simple</span>
<span className="type">#include</span> <span className="string">&lt;chrono&gt;</span>

<span className="keyword">auto</span> <span className="type">benchmark_shared_ptr</span>() {
    <span className="keyword">auto</span> <span className="keyword">start</span> = <span className="type">std::chrono::high_resolution_clock::now</span>();
    
    <span className="keyword">for</span> (<span className="keyword">int</span> <span className="keyword">i</span> = <span className="number">0</span>; <span className="keyword">i</span> &lt; <span className="number">1000000</span>; ++<span className="keyword">i</span>) {
        <span className="keyword">auto</span> <span className="keyword">ptr</span> = <span className="type">std::shared_ptr</span>&lt;<span className="type">int</span>&gt;(<span className="keyword">new</span> <span className="keyword">int</span>(<span className="number">42</span>));
    }
    
    <span className="keyword">auto</span> <span className="keyword">end</span> = <span className="type">std::chrono::high_resolution_clock::now</span>();
    <span className="keyword">return</span> <span className="keyword">end</span> - <span className="keyword">start</span>;
}

<span className="keyword">auto</span> <span className="type">benchmark_make_shared</span>() {
    <span className="keyword">auto</span> <span className="keyword">start</span> = <span className="type">std::chrono::high_resolution_clock::now</span>();
    
    <span className="keyword">for</span> (<span className="keyword">int</span> <span className="keyword">i</span> = <span className="number">0</span>; <span className="keyword">i</span> &lt; <span className="number">1000000</span>; ++<span className="keyword">i</span>) {
        <span className="keyword">auto</span> <span className="keyword">ptr</span> = <span className="type">std::make_shared</span>&lt;<span className="keyword">int</span>&gt;(<span className="number">42</span>);
    }
    
    <span className="keyword">auto</span> <span className="keyword">end</span> = <span className="type">std::chrono::high_resolution_clock::now</span>();
    <span className="keyword">return</span> <span className="keyword">end</span> - <span className="keyword">start</span>;
}

<span className="comment">// Típicamente make_shared es ~15-30% más rápido</span></code>
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
              {score >= 80 ? '🎉 ¡Excelente! Entiendes las optimizaciones de make_shared' :
               score >= 60 ? '👍 Bien, pero revisa los conceptos de performance' :
               '📚 Necesitas repasar las diferencias entre make_shared y shared_ptr'}
            </p>
          </ScoreDisplay>
        )}
      </QuizContainer>
    </Container>
  );
}