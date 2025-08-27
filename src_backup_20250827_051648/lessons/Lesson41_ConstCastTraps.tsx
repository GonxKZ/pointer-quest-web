import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson41Props {
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
    .ub { color: #ff9800; background: rgba(255, 152, 0, 0.2); padding: 2px; }
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

const ScenarioSelector = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const ScenarioButton = styled.button<{ active: boolean; danger?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.danger ? '#f44336' : props.active ? '#4caf50' : '#4a9eff'};
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.danger ? '#ef5350' : props.active ? '#66bb6a' : '#5ba0ff'};
    transform: translateY(-2px);
  }
`;

interface ConstCastVisualizationProps {
  scenario: number;
}

function ObjectVisualization({ 
  position, 
  isConst, 
  beingModified, 
  isUndefinedBehavior,
  label,
  color 
}: {
  position: [number, number, number];
  isConst: boolean;
  beingModified: boolean;
  isUndefinedBehavior: boolean;
  label: string;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (isUndefinedBehavior) {
        // UB: chaotic movement
        meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 5) * 0.5;
        meshRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 3) * 0.3;
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 8) * 0.2);
      } else if (beingModified && !isConst) {
        // Safe modification
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 2;
        meshRef.current.scale.setScalar(1.1);
      } else if (beingModified && isConst) {
        // Dangerous modification attempt
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 4;
        const scale = 1 + Math.sin(state.clock.getElapsedTime() * 6) * 0.3;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 1, 0.5]} />
        <meshStandardMaterial 
          color={isUndefinedBehavior ? '#ff3333' : color}
          emissive={isUndefinedBehavior ? '#ff3333' : beingModified ? color : '#000000'}
          emissiveIntensity={isUndefinedBehavior ? 0.6 : beingModified ? 0.3 : 0}
          transparent
          opacity={isConst ? 0.6 : 0.9}
        />
      </mesh>

      <Text
        position={[0, 0, 0.3]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {isConst && (
        <Text
          position={[0, 0.7, 0.3]}
          fontSize={0.2}
          color="#4fc3f7"
          anchorX="center"
          anchorY="middle"
        >
          const
        </Text>
      )}

      {isUndefinedBehavior && (
        <>
          <Text
            position={[0, -0.8, 0.3]}
            fontSize={0.25}
            color="#ff3333"
            anchorX="center"
            anchorY="middle"
          >
            UNDEFINED BEHAVIOR!
          </Text>
          {/* Chaos particles */}
          <mesh position={[1, 0.5, 0.3]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-1, -0.3, 0.3]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.8} />
          </mesh>
        </>
      )}
    </group>
  );
}

function ConstCastScenario({ scenario }: ConstCastVisualizationProps) {
  const scenarios = [
    {
      title: "Escenario 1: const_cast en objeto const original",
      objects: [
        {
          pos: [0, 0, 0] as [number, number, number],
          isConst: true,
          beingModified: true,
          isUB: true,
          label: "const Object",
          color: "#2196f3"
        }
      ],
      description: "UNDEFINED BEHAVIOR: Modificar un objeto que fue declarado const"
    },
    {
      title: "Escenario 2: const_cast en puntero a no-const",
      objects: [
        {
          pos: [0, 0, 0] as [number, number, number],
          isConst: false,
          beingModified: true,
          isUB: false,
          label: "Non-const Object",
          color: "#4caf50"
        }
      ],
      description: "LEGAL: El objeto original no es const, solo el puntero lo era"
    },
    {
      title: "Escenario 3: const_cast en literal de string",
      objects: [
        {
          pos: [0, 0, 0] as [number, number, number],
          isConst: true,
          beingModified: true,
          isUB: true,
          label: "String Literal",
          color: "#ff9800"
        }
      ],
      description: "UNDEFINED BEHAVIOR: Los string literals están en memoria read-only"
    },
    {
      title: "Escenario 4: const_cast para pasar a API C legacy",
      objects: [
        {
          pos: [-2, 0, 0] as [number, number, number],
          isConst: true,
          beingModified: false,
          isUB: false,
          label: "const Data",
          color: "#9c27b0"
        },
        {
          pos: [2, 0, 0] as [number, number, number],
          isConst: false,
          beingModified: false,
          isUB: false,
          label: "C API (read-only)",
          color: "#4caf50"
        }
      ],
      description: "LEGAL: API C que no modifica pero no tiene const en signature"
    }
  ];

  const currentScenario = scenarios[scenario] || scenarios[0];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4a9eff" />
      
      {currentScenario.objects.map((obj, index) => (
        <ObjectVisualization
          key={index}
          position={obj.pos}
          isConst={obj.isConst}
          beingModified={obj.beingModified}
          isUndefinedBehavior={obj.isUB}
          label={obj.label}
          color={obj.color}
        />
      ))}

      <Text
        position={[0, -3, 0]}
        fontSize={0.35}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
        maxWidth={20}
        textAlign="center"
      >
        {currentScenario.title}
      </Text>

      <Text
        position={[0, -4, 0]}
        fontSize={0.3}
        color={currentScenario.description.includes("UNDEFINED") ? "#ff3333" : "#4caf50"}
        anchorX="center"
        anchorY="middle"
        maxWidth={16}
        textAlign="center"
      >
        {currentScenario.description}
      </Text>
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </>
  );
}

export default function Lesson41_ConstCastTraps({ onComplete, isCompleted }: Lesson41Props) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "¿Cuándo es undefined behavior usar const_cast para modificar un objeto?",
      options: [
        "Siempre que uses const_cast",
        "Cuando el objeto original fue declarado const",
        "Cuando el puntero/referencia es const",
        "Solo en debug builds"
      ],
      correct: 1
    },
    {
      question: "¿Qué pasa si haces const_cast en un string literal?",
      options: [
        "Funciona perfectamente",
        "Compile error",
        "Undefined behavior si intentas modificarlo",
        "Runtime error garantizado"
      ],
      correct: 2
    },
    {
      question: "¿Cuál es un uso legítimo de const_cast?",
      options: [
        "Modificar cualquier objeto const",
        "Pasar datos const a APIs C legacy que no modifican",
        "Mejorar el rendimiento eliminando const",
        "Hacer casting entre tipos incompatibles"
      ],
      correct: 1
    },
    {
      question: "¿Qué diferencia hay entre estos dos casos?",
      options: [
        "const int x = 5; vs int y = 5; const int* p = &y;",
        "En el primer caso, modificar via const_cast es UB",
        "En el segundo caso, modificar via const_cast es legal",
        "Todas las anteriores son correctas"
      ],
      correct: 3
    },
    {
      question: "¿Por qué los compiladores pueden optimizar agresivamente código const?",
      options: [
        "Asumen que los objetos const nunca cambian",
        "Pueden cache valores const en registros",
        "Pueden eliminar re-reads de memoria const",
        "Todas las anteriores"
      ],
      correct: 3
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
      <Title>⚠️ Lección 41: Trampas de const_cast</Title>
      
      <Description>
        <h3>🎯 Objetivo</h3>
        <p>
          const_cast es uno de los casts más peligrosos en C++. Esta lección explora 
          cuándo su uso conduce a undefined behavior, cuándo es legal pero peligroso, 
          y los pocos casos donde es apropiado usarlo.
        </p>

        <WarningBox>
          <h4>💣 PELIGRO: const_cast Puede Causar UB</h4>
          <p>
            Usar const_cast para modificar un objeto que fue originalmente declarado 
            const resulta en <strong>undefined behavior</strong>. El compilador 
            puede asumir que objetos const nunca cambian y optimizar en consecuencia.
          </p>
        </WarningBox>

        <h4>❌ Casos de Undefined Behavior</h4>
        <CodeBlock>
          {`// ❌ UB CASO 1: Objeto originalmente const
const int x = 42;          // Objeto const original
int* px = const_cast<int*>(&x);
*px = 100;                    // ⚠️ UNDEFINED BEHAVIOR!

// El compilador puede:
// 1. Asumir que x siempre vale 42
// 2. Cache el valor en un registro
// 3. Optimizar basándose en esta suposición

std::cout << x;       // Puede imprimir 42 o 100 ¡IMPREDECIBLE!`}
        </CodeBlock>

        <CodeBlock>
          {`// ❌ UB CASO 2: String literals
const char* str = "Hello";     // String literal (read-only memory)
char* mutable_str = const_cast<char*>(str);
mutable_str[0] = 'h';           // ⚠️ UNDEFINED BEHAVIOR!

// Consecuencias posibles:
// - Segmentation fault
// - Corrupción silenciosa de memoria
// - Modificación de otros string literals idénticos`}
        </CodeBlock>

        <h4>✅ Casos Legales (Pero Peligrosos)</h4>
        <CodeBlock>
          {`// ✅ LEGAL: Objeto no-const referenciado por const pointer
int y = 42;                    // Objeto NO es const
const int* py = &y;         // Solo el puntero es const
int* mutable_py = const_cast<int*>(py);
*mutable_py = 100;              // ✅ Legal: y no era const originalmente

std::cout << y;           // Garantizado: 100`}
        </CodeBlock>

        <h4>🎯 Uso Legítimo: APIs C Legacy</h4>
        <CodeBlock>
          {`// ✅ USO APROPIADO: C API que no modifica pero falta const
extern "C" {
    // API C antigua - no tiene const pero no modifica
    int legacy_strlen(char* str);  // Debería ser const char*
}

void safe_usage(const std::string& text) {
    // Sabemos que legacy_strlen no modifica el string
    int len = legacy_strlen(const_cast<char*>(text.c_str()));
    // ✅ Legal: solo removemos const para satisfacer la signature
    // ✅ Seguro: confiamos en que la función no modifica
}`}
        </CodeBlock>
      </Description>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ConstCastScenario scenario={currentScenario} />
        </Canvas>
      </CanvasContainer>

      <ScenarioSelector>
        {[0, 1, 2, 3].map((index) => (
          <ScenarioButton
            key={index}
            active={currentScenario === index}
            danger={index === 0 || index === 2}
            onClick={() => setCurrentScenario(index)}
          >
            Escenario {index + 1} {(index === 0 || index === 2) && "⚠️"}
          </ScenarioButton>
        ))}
      </ScenarioSelector>

      <Description>
        <h4>🔍 Análisis Profundo: Por Qué el UB</h4>
        
        <h5>Optimizaciones del Compilador:</h5>
        <CodeBlock>
          {`// El compilador puede hacer estas optimizaciones:
const int value = 42;

for (int i = 0; i < 1000000; ++i) {
    // Compilador puede:
    // 1. Cargar 'value' una sola vez antes del loop
    // 2. Mantenerlo en registro, no en memoria
    // 3. Inline el valor directamente (42)
    process(value);
}

// Si alguien hace const_cast y modifica 'value' en paralelo:
// ¡El loop seguirá usando el valor optimizado (42)!`}
        </CodeBlock>

        <h5>Detección de UB con Herramientas:</h5>
        <CodeBlock>
          {`// Compilación con detección de UB
// $ g++ -fsanitize=undefined -g -O2 program.cpp

// UB Runtime Detection Output:
// runtime error: modification of const object
// SUMMARY: UndefinedBehaviorSanitizer: undefined-behavior`}
        </CodeBlock>

        <h4>✅ Alternativas Más Seguras</h4>
        
        <h5>1. Mutable para Casos Específicos:</h5>
        <CodeBlock>
          {`class CacheExample {
    mutable int cached_result = -1; // ← mutable permite modificación
    int expensive_data;

public:
    int get_computed_value() const {
        if (cached_result == -1) {
            cached_result = expensive_computation(expensive_data);
        }
        return cached_result; // ✅ No const_cast necesario
    }
};`}
        </CodeBlock>

        <h5>2. Template Specialization para C APIs:</h5>
        <CodeBlock>
          {`// Wrapper seguro para C APIs
template<typename Func, typename... Args>
auto safe_c_call(Func func, const char* str, Args&&... args) {
    // Solo permite funciones que no modifican
    static_assert(std::is_same_v<decltype(func(const_cast<char*>(str), args...)), int>);
    return func(const_cast<char*>(str), std::forward<Args>(args)...);
}

// Uso seguro
int len = safe_c_call(legacy_strlen, text.c_str());`}
        </CodeBlock>

        <WarningBox>
          <h4>📋 Reglas de Oro para const_cast</h4>
          <ul>
            <li><strong>NUNCA</strong> modifiques un objeto que fue declarado const</li>
            <li><strong>NUNCA</strong> modifiques string literals</li>
            <li><strong>Solo</strong> úsalo para APIs C que no modifican pero faltan const</li>
            <li><strong>Considera</strong> alternativas como mutable o wrappers</li>
            <li><strong>Documenta</strong> claramente por qué es necesario</li>
          </ul>
        </WarningBox>
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
              {score >= 80 ? '🎉 ¡Excelente! Entiendes los peligros de const_cast' :
               score >= 60 ? '👍 Bien, pero ten cuidado con const_cast en código real' :
               '📚 Necesitas repasar cuándo const_cast causa undefined behavior'}
            </p>
          </ScoreDisplay>
        )}
      </QuizContainer>
    </Container>
  );
}