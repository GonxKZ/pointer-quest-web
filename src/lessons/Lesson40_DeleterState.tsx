import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson40Props {
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
    .highlight { background: rgba(255, 255, 0, 0.2); }
    .good { color: #4caf50; background: rgba(76, 175, 80, 0.1); }
    .bad { color: #f44336; background: rgba(244, 67, 54, 0.1); }
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

const ComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  th {
    background: rgba(74, 158, 255, 0.2);
    font-weight: bold;
    color: #4a9eff;
  }
  
  tr:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

interface DeleterVisualizationProps {
  deleterType: string;
  size: number;
  color: string;
  position: [number, number, number];
  hasState: boolean;
  stateless: boolean;
}

function DeleterVisualization({ deleterType, size, color, position, hasState, stateless }: DeleterVisualizationProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      if (hasState) {
        const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const sizeScale = size / 8; // Normalize size for visualization

  return (
    <group position={position}>
      {/* Main container */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2, sizeScale, 0.5]} />
        <meshStandardMaterial 
          color={color} 
          emissive={hasState ? color : '#000000'}
          emissiveIntensity={hasState ? 0.2 : 0}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Size indicator */}
      <Text
        position={[0, sizeScale/2 + 0.5, 0.3]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {deleterType}
      </Text>

      <Text
        position={[0, -sizeScale/2 - 0.5, 0.3]}
        fontSize={0.25}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
      >
        {size} bytes
      </Text>

      {/* State indicator */}
      {hasState && (
        <mesh position={[1.2, 0, 0.3]}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Stateless optimization */}
      {stateless && (
        <Text
          position={[0, -sizeScale/2 - 1, 0.3]}
          fontSize={0.2}
          color="#4caf50"
          anchorX="center"
          anchorY="middle"
        >
          EBO Optimized
        </Text>
      )}
    </group>
  );
}

function DeleterComparison() {
  const deleterTypes = [
    { type: 'Default delete', size: 8, color: '#4caf50', pos: [-6, 0, 0] as [number, number, number], hasState: false, stateless: true },
    { type: 'Function pointer', size: 16, color: '#ff9800', pos: [-3, 0, 0] as [number, number, number], hasState: true, stateless: false },
    { type: 'Lambda (no capture)', size: 8, color: '#4caf50', pos: [0, 0, 0] as [number, number, number], hasState: false, stateless: true },
    { type: 'Lambda (capture)', size: 24, color: '#f44336', pos: [3, 0, 0] as [number, number, number], hasState: true, stateless: false },
    { type: 'Custom class', size: 32, color: '#9c27b0', pos: [6, 0, 0] as [number, number, number], hasState: true, stateless: false }
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4a9eff" />
      
      {deleterTypes.map((deleter, index) => (
        <DeleterVisualization
          key={index}
          deleterType={deleter.type}
          size={deleter.size}
          color={deleter.color}
          position={deleter.pos}
          hasState={deleter.hasState}
          stateless={deleter.stateless}
        />
      ))}

      <Text
        position={[0, -3, 0]}
        fontSize={0.4}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
        maxWidth={20}
        textAlign="center"
      >
        Comparación de Tamaños: unique_ptr con Diferentes Deleters
      </Text>

      <Text
        position={[0, -4, 0]}
        fontSize={0.3}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
        maxWidth={16}
        textAlign="center"
      >
        EBO (Empty Base Optimization) elimina el overhead cuando el deleter no tiene estado
      </Text>
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </>
  );
}

export default function Lesson40_DeleterState({ onComplete, isCompleted }: Lesson40Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "¿Qué es Empty Base Optimization (EBO) en unique_ptr?",
      options: [
        "Una optimización que elimina el puntero cuando es nullptr",
        "Una técnica para reducir el tamaño cuando el deleter no tiene estado",
        "Un mecanismo para mejorar el rendimiento de destrucción",
        "Una forma de combinar múltiples unique_ptr en uno"
      ],
      correct: 1
    },
    {
      question: "¿Cuánto ocupa unique_ptr<int> con default delete?",
      options: [
        "4 bytes (solo el puntero)",
        "8 bytes (puntero + deleter)",
        "8 bytes (EBO elimina el deleter)",
        "16 bytes (puntero + reference count)"
      ],
      correct: 2
    },
    {
      question: "¿Qué deleter causa mayor overhead de memoria?",
      options: [
        "std::default_delete<T>",
        "Lambda sin capturas",
        "Lambda con capturas de variables locales",
        "Function pointer simple"
      ],
      correct: 2
    },
    {
      question: "¿Por qué function pointer impacta el tamaño?",
      options: [
        "Porque siempre requiere heap allocation",
        "Porque necesita almacenar la dirección de la función",
        "Porque no puede usar EBO al tener estado",
        "Las opciones B y C son correctas"
      ],
      correct: 3
    },
    {
      question: "¿Cuál es la mejor práctica para deleters?",
      options: [
        "Siempre usar std::default_delete",
        "Preferir lambdas sin capturas cuando sea posible",
        "Usar function pointers para mejor rendimiento",
        "Crear clases custom para todos los casos"
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
      <Title>📏 Lección 40: Impacto del Deleter en unique_ptr</Title>
      
      <Description>
        <h3>🎯 Objetivo</h3>
        <p>
          El tipo de deleter que uses en unique_ptr puede impactar significativamente su tamaño 
          en memoria. Esta lección explora cómo Empty Base Optimization (EBO) y el estado del 
          deleter afectan el footprint de memory de unique_ptr.
        </p>

        <h4>📐 El Tamaño Importa: unique_ptr No Siempre Ocupa 8 Bytes</h4>
        <CodeBlock>
<code><span className="comment">// Comparación de tamaños de unique_ptr</span>
<span className="type">#include</span> <span className="string">&lt;memory&gt;</span>
<span className="type">#include</span> <span className="string">&lt;iostream&gt;</span>
<span className="type">#include</span> <span className="string">&lt;functional&gt;</span>

<span className="keyword">struct</span> <span className="type">MyClass</span> { <span className="keyword">int</span> <span className="keyword">data</span>; };

<span className="keyword">void</span> <span className="type">analyze_sizes</span>() {
    <span className="comment">// 1. Default deleter - EBO aplicado</span>
    <span className="type">std::unique_ptr</span>&lt;<span className="type">MyClass</span>&gt; <span className="keyword">ptr1</span>;
    <span className="good">std::cout &lt;&lt; "Default: " &lt;&lt; sizeof(ptr1) &lt;&lt; " bytes\n";</span> <span className="comment">// 8 bytes ✅</span>

    <span className="comment">// 2. Lambda sin capturas - EBO aplicado</span>
    <span className="keyword">auto</span> <span className="keyword">lambda_deleter</span> = [](<span className="type">MyClass</span>* <span className="keyword">p</span>) { <span className="keyword">delete</span> <span className="keyword">p</span>; };
    <span className="type">std::unique_ptr</span>&lt;<span className="type">MyClass</span>, <span className="keyword">decltype</span>(<span className="keyword">lambda_deleter</span>)&gt; <span className="keyword">ptr2</span>;
    <span className="good">std::cout &lt;&lt; "Lambda (no capture): " &lt;&lt; sizeof(ptr2) &lt;&lt; " bytes\n";</span> <span className="comment">// 8 bytes ✅</span>

    <span className="comment">// 3. Function pointer - NO EBO</span>
    <span className="keyword">void</span> (*<span className="keyword">func_deleter</span>)(<span className="type">MyClass</span>*) = [](<span className="type">MyClass</span>* <span className="keyword">p</span>) { <span className="keyword">delete</span> <span className="keyword">p</span>; };
    <span className="type">std::unique_ptr</span>&lt;<span className="type">MyClass</span>, <span className="keyword">void</span>(*)(<span className="type">MyClass</span>*)&gt; <span className="keyword">ptr3</span>;
    <span className="bad">std::cout &lt;&lt; "Function pointer: " &lt;&lt; sizeof(ptr3) &lt;&lt; " bytes\n";</span> <span className="comment">// 16 bytes ⚠️</span>

    <span className="comment">// 4. Lambda CON capturas - NO EBO</span>
    <span className="keyword">int</span> <span className="keyword">counter</span> = <span className="number">0</span>;
    <span className="keyword">auto</span> <span className="keyword">capturing_lambda</span> = [&amp;<span className="keyword">counter</span>](<span className="type">MyClass</span>* <span className="keyword">p</span>) { 
        ++<span className="keyword">counter</span>; <span className="keyword">delete</span> <span className="keyword">p</span>; 
    };
    <span className="type">std::unique_ptr</span>&lt;<span className="type">MyClass</span>, <span className="keyword">decltype</span>(<span className="keyword">capturing_lambda</span>)&gt; <span className="keyword">ptr4</span>;
    <span className="bad">std::cout &lt;&lt; "Lambda (capture): " &lt;&lt; sizeof(ptr4) &lt;&lt; " bytes\n";</span> <span className="comment">// 16+ bytes ⚠️</span>
}</code>
        </CodeBlock>

        <h4>🧠 Empty Base Optimization (EBO) Explicado</h4>
        <p>
          EBO permite que unique_ptr "fusione" el deleter con el puntero cuando el deleter 
          no tiene estado (stateless), eliminando el overhead de memoria adicional.
        </p>

        <CodeBlock>
<code><span className="comment">// Implementación simplificada de unique_ptr con EBO</span>
<span className="keyword">template</span>&lt;<span className="keyword">typename</span> <span className="type">T</span>, <span className="keyword">typename</span> <span className="type">Deleter</span>&gt;
<span className="keyword">class</span> <span className="type">unique_ptr</span> : <span className="keyword">private</span> <span className="type">Deleter</span> {  <span className="comment">// ← Herencia para EBO</span>
    <span className="type">T</span>* <span className="keyword">ptr_</span>;

<span className="keyword">public</span>:
    <span className="keyword">void</span> <span className="type">reset</span>(<span className="type">T</span>* <span className="keyword">p</span> = <span className="keyword">nullptr</span>) {
        <span className="keyword">if</span> (<span className="keyword">ptr_</span>) {
            <span className="comment">// Accede al deleter via herencia (sin overhead de memoria)</span>
            <span className="keyword">static_cast</span>&lt;<span className="type">Deleter</span>&amp;&gt;(*<span className="keyword">this</span>)(<span className="keyword">ptr_</span>);
        }
        <span className="keyword">ptr_</span> = <span className="keyword">p</span>;
    }
};

<span className="comment">// Cuando Deleter es stateless (empty class):</span>
<span className="comment">// sizeof(unique_ptr) = sizeof(T*) = 8 bytes</span>
<span className="comment">// ¡El deleter no agrega overhead!</span></code>
        </CodeBlock>
      </Description>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <DeleterComparison />
        </Canvas>
      </CanvasContainer>

      <Description>
        <h4>📊 Comparación Detallada de Deleters</h4>
        <ComparisonTable>
          <thead>
            <tr>
              <th>Tipo de Deleter</th>
              <th>Tamaño</th>
              <th>EBO</th>
              <th>Performance</th>
              <th>Casos de Uso</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>std::default_delete&lt;T&gt;</td>
              <td>8 bytes</td>
              <td>✅ Sí</td>
              <td>⚡ Óptimo</td>
              <td>Destrucción estándar con delete</td>
            </tr>
            <tr>
              <td>Lambda sin capturas</td>
              <td>8 bytes</td>
              <td>✅ Sí</td>
              <td>⚡ Óptimo</td>
              <td>Lógica custom sin estado</td>
            </tr>
            <tr>
              <td>Function pointer</td>
              <td>16 bytes</td>
              <td>❌ No</td>
              <td>🟡 Bueno</td>
              <td>Funciones globales/estáticas</td>
            </tr>
            <tr>
              <td>Lambda con capturas</td>
              <td>16+ bytes</td>
              <td>❌ No</td>
              <td>🟡 Variable</td>
              <td>Cuando necesitas estado externo</td>
            </tr>
            <tr>
              <td>std::function&lt;void(T*)&gt;</td>
              <td>32+ bytes</td>
              <td>❌ No</td>
              <td>🔴 Lento</td>
              <td>Type erasure, evitar en unique_ptr</td>
            </tr>
          </tbody>
        </ComparisonTable>

        <h4>🎯 Mejores Prácticas</h4>
        
        <h5>✅ Optimal: Stateless Deleters</h5>
        <CodeBlock>
<code><span className="comment">// ✅ RECOMENDADO: Lambda sin capturas</span>
<span className="keyword">auto</span> <span className="keyword">file_deleter</span> = [](<span className="type">FILE</span>* <span className="keyword">f</span>) { 
    <span className="keyword">if</span> (<span className="keyword">f</span>) <span className="type">fclose</span>(<span className="keyword">f</span>); 
};
<span className="keyword">using</span> <span className="type">FilePtr</span> = <span className="type">std::unique_ptr</span>&lt;<span className="type">FILE</span>, <span className="keyword">decltype</span>(<span className="keyword">file_deleter</span>)&gt;;

<span className="comment">// ✅ RECOMENDADO: Clase custom stateless</span>
<span className="keyword">struct</span> <span className="type">FileDeleter</span> {
    <span className="keyword">void</span> <span className="keyword">operator</span>()(<span className="type">FILE</span>* <span className="keyword">f</span>) <span className="keyword">const</span> { 
        <span className="keyword">if</span> (<span className="keyword">f</span>) <span className="type">fclose</span>(<span className="keyword">f</span>); 
    }
};
<span className="keyword">using</span> <span className="type">FilePtr2</span> = <span className="type">std::unique_ptr</span>&lt;<span className="type">FILE</span>, <span className="type">FileDeleter</span>&gt;; <span className="comment">// EBO aplicado</span></code>
        </CodeBlock>

        <h5>⚠️ Cuidado: Deleters con Estado</h5>
        <CodeBlock>
<code><span className="comment">// ⚠️ CUIDADO: Lambda con capturas agrega overhead</span>
<span className="keyword">std::string</span> <span className="keyword">log_prefix</span> = <span className="string">"[CLEANUP]"</span>;
<span className="keyword">auto</span> <span className="keyword">logging_deleter</span> = [<span className="keyword">log_prefix</span>](<span className="type">MyClass</span>* <span className="keyword">p</span>) {
    <span className="type">std::cout</span> &lt;&lt; <span className="keyword">log_prefix</span> &lt;&lt; <span className="string">" Deleting object\n"</span>;
    <span className="keyword">delete</span> <span className="keyword">p</span>;
};
<span className="comment">// sizeof(unique_ptr) ≈ 8 + sizeof(std::string) = 32+ bytes</span>

<span className="comment">// ✅ MEJOR: Pasar info como parámetro de template</span>
<span className="keyword">template</span>&lt;<span className="keyword">const</span> <span className="keyword">char</span>* <span className="keyword">LogPrefix</span>&gt;
<span className="keyword">struct</span> <span className="type">LoggingDeleter</span> {
    <span className="keyword">void</span> <span className="keyword">operator</span>()(<span className="type">MyClass</span>* <span className="keyword">p</span>) <span className="keyword">const</span> {
        <span className="type">std::cout</span> &lt;&lt; <span className="keyword">LogPrefix</span> &lt;&lt; <span className="string">" Deleting object\n"</span>;
        <span className="keyword">delete</span> <span className="keyword">p</span>;
    }
};
<span className="comment">// sizeof(unique_ptr) = 8 bytes (EBO funciona)</span></code>
        </CodeBlock>

        <h4>🔬 Medición en Tiempo de Compilación</h4>
        <CodeBlock>
<code><span className="comment">// Utilidad para verificar tamaños en compile-time</span>
<span className="keyword">template</span>&lt;<span className="keyword">typename</span> <span className="type">T</span>, <span className="keyword">size_t</span> <span className="keyword">Expected</span>&gt;
<span className="keyword">constexpr</span> <span className="keyword">bool</span> <span className="type">check_size</span>() {
    <span className="keyword">static_assert</span>(<span className="keyword">sizeof</span>(<span className="type">T</span>) == <span className="keyword">Expected</span>, 
        <span className="string">"Unexpected size - deleter overhead detected!"</span>);
    <span className="keyword">return</span> <span className="keyword">true</span>;
}

<span className="comment">// Verificación automática</span>
<span className="keyword">static_assert</span>(<span className="type">check_size</span>&lt;<span className="type">std::unique_ptr</span>&lt;<span className="keyword">int</span>&gt;, <span className="number">8</span>&gt;());
<span className="keyword">static_assert</span>(<span className="type">check_size</span>&lt;<span className="type">FilePtr</span>, <span className="number">8</span>&gt;());  <span className="comment">// Debe pasar con EBO</span></code>
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
              {score >= 80 ? '🎉 ¡Excelente! Dominas EBO y optimización de unique_ptr' :
               score >= 60 ? '👍 Bien, pero revisa los conceptos de EBO y tamaños' :
               '📚 Necesitas repasar las optimizaciones de memoria en unique_ptr'}
            </p>
          </ScoreDisplay>
        )}
      </QuizContainer>
    </Container>
  );
}