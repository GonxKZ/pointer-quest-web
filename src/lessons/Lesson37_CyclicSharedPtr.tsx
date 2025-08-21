import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson37Props {
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

interface NodeProps {
  position: [number, number, number];
  label: string;
  color: string;
  glowing: boolean;
  connections: number[];
  nodeId: number;
}

function MemoryNode({ position, label, color, glowing, connections, nodeId }: NodeProps) {
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && glowing) {
      meshRef.current.rotation.y = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 1, 0.3]} />
        <meshStandardMaterial 
          color={color} 
          emissive={glowing ? color : '#000000'}
          emissiveIntensity={glowing ? 0.3 : 0}
        />
      </mesh>
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff"
      >
        {label}
      </Text>
    </group>
  );
}

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  animated: boolean;
}

function ConnectionLine({ start, end, color, animated }: ConnectionLineProps) {
  const lineRef = React.useRef<THREE.Line>(null);

  useFrame((state) => {
    if (lineRef.current && animated) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.5 + Math.sin(state.clock.getElapsedTime() * 4) * 0.3;
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={3} transparent />
    </line>
  );
}

function CyclicVisualization({ scenario }: { scenario: number }) {
  const scenarios = [
    // Scenario 0: Simple cycle (A -> B -> A)
    {
      nodes: [
        { pos: [-2, 1, 0] as [number, number, number], label: 'Node A\nref_count: 1', color: '#ff6b6b', connections: [1] },
        { pos: [2, 1, 0] as [number, number, number], label: 'Node B\nref_count: 1', color: '#ff6b6b', connections: [0] }
      ],
      message: 'Ciclo simple A↔B: Ambos nodos tienen ref_count=1 y nunca se destruirán'
    },
    // Scenario 1: Triangle cycle (A -> B -> C -> A)
    {
      nodes: [
        { pos: [0, 2, 0] as [number, number, number], label: 'Node A\nref_count: 1', color: '#ff6b6b', connections: [1] },
        { pos: [-2, -1, 0] as [number, number, number], label: 'Node B\nref_count: 1', color: '#ff6b6b', connections: [2] },
        { pos: [2, -1, 0] as [number, number, number], label: 'Node C\nref_count: 1', color: '#ff6b6b', connections: [0] }
      ],
      message: 'Ciclo triangular A→B→C→A: Los tres nodos quedan huérfanos en memoria'
    },
    // Scenario 2: Broken cycle with weak_ptr
    {
      nodes: [
        { pos: [-2, 1, 0] as [number, number, number], label: 'Node A\nref_count: 1', color: '#4caf50', connections: [1] },
        { pos: [2, 1, 0] as [number, number, number], label: 'Node B\nref_count: 1\nweak_ptr→A', color: '#4caf50', connections: [] }
      ],
      message: 'Ciclo roto con weak_ptr: B mantiene una referencia débil a A'
    },
    // Scenario 3: Complex cycle with external references
    {
      nodes: [
        { pos: [0, 3, 0] as [number, number, number], label: 'Root\nref_count: 2', color: '#4a9eff', connections: [1, 2] },
        { pos: [-2, 0, 0] as [number, number, number], label: 'Node A\nref_count: 2', color: '#ff9800', connections: [2] },
        { pos: [2, 0, 0] as [number, number, number], label: 'Node B\nref_count: 2', color: '#ff9800', connections: [1] },
        { pos: [0, -3, 0] as [number, number, number], label: 'External\nref_count: 1', color: '#9c27b0', connections: [1] }
      ],
      message: 'Ciclo complejo: Root mantiene el ciclo vivo, External agrava la situación'
    }
  ];

  const currentScenario = scenarios[scenario] || scenarios[0];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4a9eff" />
      
      {currentScenario.nodes.map((node, index) => (
        <MemoryNode
          key={index}
          position={node.pos}
          label={node.label}
          color={node.color}
          glowing={true}
          connections={node.connections}
          nodeId={index}
        />
      ))}
      
      {currentScenario.nodes.map((node, index) =>
        node.connections.map(targetIndex => (
          <ConnectionLine
            key={`${index}-${targetIndex}`}
            start={node.pos}
            end={currentScenario.nodes[targetIndex].pos}
            color={node.color === '#4caf50' ? '#81c784' : '#ff8a65'}
            animated={true}
          />
        ))
      )}

      <Text
        position={[0, -4, 0]}
        fontSize={0.4}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
        maxWidth={12}
        textAlign="center"
      >
        {currentScenario.message}
      </Text>
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </>
  );
}

export default function Lesson37_CyclicSharedPtr({ onComplete, isCompleted }: Lesson37Props) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "¿Qué causa un ciclo de referencias con shared_ptr?",
      options: [
        "Dos shared_ptr que se referencian mutuamente",
        "Un shared_ptr que se referencia a sí mismo",
        "Multiple shared_ptr apuntando al mismo objeto",
        "shared_ptr con deleters personalizados"
      ],
      correct: 0
    },
    {
      question: "¿Cuál es la principal consecuencia de los ciclos shared_ptr?",
      options: [
        "Pérdida de rendimiento en las asignaciones",
        "Memory leaks: los objetos nunca se destruyen",
        "Excepciones en tiempo de ejecución",
        "Comportamiento indefinido en accesos"
      ],
      correct: 1
    },
    {
      question: "¿Cómo se rompe un ciclo de shared_ptr?",
      options: [
        "Usando reset() en todos los shared_ptr",
        "Llamando manualmente a los destructores",
        "Reemplazando una referencia con weak_ptr",
        "Usando unique_ptr en lugar de shared_ptr"
      ],
      correct: 2
    },
    {
      question: "¿Qué ventaja tiene weak_ptr sobre shared_ptr en ciclos?",
      options: [
        "Es más rápido en operaciones de copia",
        "No contribuye al reference count",
        "Ocupa menos memoria que shared_ptr",
        "Proporciona acceso directo sin checks"
      ],
      correct: 1
    },
    {
      question: "¿Cuándo usar weak_ptr para romper ciclos?",
      options: [
        "Siempre que sea posible para mejor rendimiento",
        "Solo en relaciones padre-hijo donde el hijo referencia al padre",
        "Únicamente en estructuras de datos temporales",
        "Cuando el objeto no necesite ser modificado"
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

  const nextScenario = () => {
    setCurrentScenario((prev) => (prev + 1) % 4);
  };

  return (
    <Container>
      <Title>🔄 Lección 37: Ciclos con shared_ptr</Title>
      
      <Description>
        <h3>🎯 Objetivo</h3>
        <p>
          Los ciclos de referencias con shared_ptr son una de las causas más sutiles de memory leaks 
          en C++ moderno. Esta lección explora cómo detectar, entender y resolver estos ciclos 
          usando weak_ptr y diseño cuidadoso de ownership.
        </p>

        <h4>⚠️ El Problema: Ciclos de Referencias</h4>
        <p>
          Cuando dos o más objetos se mantienen vivos mutuamente a través de shared_ptr, 
          crean un ciclo que impide su destrucción automática.
        </p>

        <CodeBlock>
<code><span className="comment">// ❌ PROBLEMA: Ciclo de referencias</span>
<span className="keyword">class</span> <span className="type">Node</span> {
<span className="keyword">public</span>:
    <span className="type">std::shared_ptr</span>&lt;<span className="type">Node</span>&gt; <span className="keyword">next</span>;
    <span className="type">std::shared_ptr</span>&lt;<span className="type">Node</span>&gt; <span className="keyword">prev</span>;
    
    ~<span className="type">Node</span>() { 
        <span className="type">std::cout</span> &lt;&lt; <span className="string">"Node destroyed\n"</span>; 
    }
};

<span className="keyword">void</span> <span className="type">create_cycle</span>() {
    <span className="keyword">auto</span> <span className="keyword">a</span> = <span className="type">std::make_shared</span>&lt;<span className="type">Node</span>&gt;();
    <span className="keyword">auto</span> <span className="keyword">b</span> = <span className="type">std::make_shared</span>&lt;<span className="type">Node</span>&gt;();
    
    <span className="keyword">a</span>-&gt;<span className="keyword">next</span> = <span className="keyword">b</span>;  <span className="comment">// a.use_count() == 1, b.use_count() == 2</span>
    <span className="keyword">b</span>-&gt;<span className="keyword">prev</span> = <span className="keyword">a</span>;  <span className="comment">// a.use_count() == 2, b.use_count() == 2</span>
    
    <span className="comment">// Al salir del scope, a y b locales se destruyen,</span>
    <span className="comment">// pero a.use_count() y b.use_count() siguen siendo 1</span>
    <span className="comment">// ¡Los objetos nunca se destruyen! MEMORY LEAK</span>
}</code>
        </CodeBlock>

        <h4>✅ La Solución: weak_ptr</h4>
        <CodeBlock>
<code><span className="comment">// ✅ SOLUCIÓN: Romper el ciclo con weak_ptr</span>
<span className="keyword">class</span> <span className="type">Node</span> {
<span className="keyword">public</span>:
    <span className="type">std::shared_ptr</span>&lt;<span className="type">Node</span>&gt; <span className="keyword">next</span>;      <span className="comment">// Ownership hacia adelante</span>
    <span className="type">std::weak_ptr</span>&lt;<span className="type">Node</span>&gt; <span className="keyword">prev</span>;        <span className="comment">// Observación hacia atrás</span>
    
    <span className="keyword">void</span> <span className="type">process_prev</span>() {
        <span className="keyword">if</span> (<span className="keyword">auto</span> <span className="keyword">p</span> = <span className="keyword">prev</span>.<span className="type">lock</span>()) {  <span className="comment">// Conversión segura</span>
            <span className="comment">// Usar p como shared_ptr normal</span>
            <span className="type">std::cout</span> &lt;&lt; <span className="string">"Previous node exists\n"</span>;
        } <span className="keyword">else</span> {
            <span className="type">std::cout</span> &lt;&lt; <span className="string">"Previous node was destroyed\n"</span>;
        }
    }
};

<span className="keyword">void</span> <span className="type">safe_chain</span>() {
    <span className="keyword">auto</span> <span className="keyword">a</span> = <span className="type">std::make_shared</span>&lt;<span className="type">Node</span>&gt;();
    <span className="keyword">auto</span> <span className="keyword">b</span> = <span className="type">std::make_shared</span>&lt;<span className="type">Node</span>&gt;();
    
    <span className="keyword">a</span>-&gt;<span className="keyword">next</span> = <span className="keyword">b</span>;  <span className="comment">// b.use_count() == 2</span>
    <span className="keyword">b</span>-&gt;<span className="keyword">prev</span> = <span className="keyword">a</span>;  <span className="comment">// a.use_count() == 1 (weak_ptr no cuenta)</span>
    
    <span className="comment">// Al salir del scope: a.use_count() == 0 → se destruye</span>
    <span className="comment">// Luego b.use_count() == 0 → se destruye</span>
    <span className="comment">// ✅ Destrucción correcta en orden inverso</span>
}</code>
        </CodeBlock>
      </Description>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <CyclicVisualization scenario={currentScenario} />
        </Canvas>
      </CanvasContainer>

      <button 
        onClick={nextScenario}
        style={{
          padding: '10px 20px',
          background: '#4a9eff',
          border: 'none',
          borderRadius: '5px',
          color: 'white',
          cursor: 'pointer',
          margin: '10px 0'
        }}
      >
        Siguiente Escenario ({currentScenario + 1}/4)
      </button>

      <Description>
        <h4>🔧 Patrones Avanzados</h4>
        
        <h5>Parent-Child con weak_ptr:</h5>
        <CodeBlock>
<code><span className="keyword">class</span> <span className="type">Parent</span> {
    <span className="type">std::vector</span>&lt;<span className="type">std::shared_ptr</span>&lt;<span className="type">Child</span>&gt;&gt; <span className="keyword">children</span>;
<span className="keyword">public</span>:
    <span className="keyword">void</span> <span className="type">add_child</span>(<span className="type">std::shared_ptr</span>&lt;<span className="type">Child</span>&gt; <span className="keyword">child</span>) {
        <span className="keyword">children</span>.<span className="type">push_back</span>(<span className="keyword">child</span>);
        <span className="keyword">child</span>-&gt;<span className="keyword">parent</span> = <span className="keyword">shared_from_this</span>(); <span className="comment">// weak_ptr assignment</span>
    }
};

<span className="keyword">class</span> <span className="type">Child</span> : <span className="keyword">public</span> <span className="type">std::enable_shared_from_this</span>&lt;<span className="type">Child</span>&gt; {
<span className="keyword">public</span>:
    <span className="type">std::weak_ptr</span>&lt;<span className="type">Parent</span>&gt; <span className="keyword">parent</span>; <span className="comment">// No ownership del padre</span>
    
    <span className="keyword">void</span> <span className="type">notify_parent</span>() {
        <span className="keyword">if</span> (<span className="keyword">auto</span> <span className="keyword">p</span> = <span className="keyword">parent</span>.<span className="type">lock</span>()) {
            <span className="comment">// Acceso seguro al parent</span>
        }
    }
};</code>
        </CodeBlock>

        <h5>🔍 Detección de Ciclos:</h5>
        <CodeBlock>
<code><span className="comment">// Utilidad para detectar posibles ciclos</span>
<span className="keyword">template</span>&lt;<span className="keyword">typename</span> <span className="type">T</span>&gt;
<span className="keyword">void</span> <span className="type">debug_ref_count</span>(<span className="keyword">const</span> <span className="type">std::shared_ptr</span>&lt;<span className="type">T</span>&gt;&amp; <span className="keyword">ptr</span>, 
                        <span className="keyword">const</span> <span className="type">std::string</span>&amp; <span className="keyword">name</span>) {
    <span className="type">std::cout</span> &lt;&lt; <span className="keyword">name</span> &lt;&lt; <span className="string">" ref_count: "</span> &lt;&lt; <span className="keyword">ptr</span>.<span className="type">use_count</span>() &lt;&lt; <span className="string">"\n"</span>;
    
    <span className="comment">// Advertencia si el ref_count es sospechosamente alto</span>
    <span className="keyword">if</span> (<span className="keyword">ptr</span>.<span className="type">use_count</span>() &gt; <span className="number">10</span>) {
        <span className="type">std::cout</span> &lt;&lt; <span className="string">"⚠️  WARNING: High ref_count, possible cycle!\n"</span>;
    }
}

<span className="comment">// Uso en debugging:</span>
<span className="keyword">auto</span> <span className="keyword">node</span> = <span className="type">std::make_shared</span>&lt;<span className="type">Node</span>&gt;();
<span className="type">debug_ref_count</span>(<span className="keyword">node</span>, <span className="string">"node"</span>); <span className="comment">// ref_count: 1 ✅</span></code>
        </CodeBlock>

        <h4>📝 Reglas de Diseño</h4>
        <ul>
          <li><strong>Principio de Ownership Único:</strong> Solo un objeto debe "poseer" otro</li>
          <li><strong>Referencias hacia arriba:</strong> Usar weak_ptr para referencias padre ← hijo</li>
          <li><strong>Referencias laterales:</strong> Considerar observer_ptr o weak_ptr</li>
          <li><strong>Testing:</strong> Verificar que los destructores se llamen correctamente</li>
        </ul>
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
              {score >= 80 ? '🎉 ¡Excelente! Dominas los ciclos shared_ptr' :
               score >= 60 ? '👍 Bien, pero revisa los conceptos de weak_ptr' :
               '📚 Necesitas repasar el manejo de ciclos de referencias'}
            </p>
          </ScoreDisplay>
        )}
      </QuizContainer>
    </Container>
  );
}