import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { THREE } from '../utils/three';

interface Lesson46Props {
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
    .header { color: #4fc3f7; background: rgba(79, 195, 247, 0.1); padding: 2px; }
    .impl { color: #81c784; background: rgba(129, 199, 132, 0.1); padding: 2px; }
    .interface { color: #ffb74d; background: rgba(255, 183, 77, 0.1); padding: 2px; }
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

const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin: 20px 0;
  
  .benefit {
    background: rgba(74, 158, 255, 0.1);
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #4a9eff;
    
    .icon {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }
    
    .title {
      font-weight: bold;
      color: #4a9eff;
      margin-bottom: 5px;
    }
    
    .description {
      color: #ccc;
      font-size: 0.9rem;
    }
  }
`;

interface PimplVisualizationProps {
  showImplementation: boolean;
}

function ModuleBlock({ 
  position, 
  size, 
  label, 
  color, 
  isInterface,
  dependencies 
}: {
  position: [number, number, number];
  size: [number, number, number];
  label: string;
  color: string;
  isInterface: boolean;
  dependencies: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && !isInterface) {
      // Implementation modules pulse to show hidden complexity
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
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
          opacity={isInterface ? 0.9 : 0.6}
          emissive={!isInterface ? color : '#000000'}
          emissiveIntensity={!isInterface ? 0.2 : 0}
        />
      </mesh>
      <Text
        position={[0, 0, size[2]/2 + 0.1]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      {dependencies > 0 && (
        <Text
          position={[0, -size[1]/2 - 0.3, size[2]/2 + 0.1]}
          fontSize={0.2}
          color="#ff9800"
          anchorX="center"
          anchorY="middle"
        >
          {dependencies} dependencies
        </Text>
      )}
    </group>
  );
}

function DependencyArrow({ 
  start, 
  end, 
  hidden 
}: {
  start: [number, number, number];
  end: [number, number, number];
  hidden: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);
  
  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = hidden ? 0.3 : 0.8;
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial 
        color={hidden ? "#666" : "#ff9800"} 
        linewidth={2} 
        transparent 
        linecap="round"
      />
    </line>
  );
}

function PimplVisualization({ showImplementation }: PimplVisualizationProps) {
  const withoutPimpl = [
    // Header file exposes everything
    { pos: [0, 2, 0] as [number, number, number], size: [3, 1, 0.3] as [number, number, number], 
      label: "MyClass.h (exposed)", color: "#f44336", isInterface: true, deps: 5 },
    { pos: [-3, 0, 0] as [number, number, number], size: [1.5, 0.8, 0.2] as [number, number, number], 
      label: "boost/", color: "#ff9800", isInterface: false, deps: 0 },
    { pos: [-1, 0, 0] as [number, number, number], size: [1.5, 0.8, 0.2] as [number, number, number], 
      label: "std/", color: "#ff9800", isInterface: false, deps: 0 },
    { pos: [1, 0, 0] as [number, number, number], size: [1.5, 0.8, 0.2] as [number, number, number], 
      label: "Qt/", color: "#ff9800", isInterface: false, deps: 0 },
    { pos: [3, 0, 0] as [number, number, number], size: [1.5, 0.8, 0.2] as [number, number, number], 
      label: "Custom", color: "#ff9800", isInterface: false, deps: 0 }
  ];

  const withPimpl = [
    // Clean interface
    { pos: [0, 2, 0] as [number, number, number], size: [2, 1, 0.3] as [number, number, number], 
      label: "MyClass.h (clean)", color: "#4caf50", isInterface: true, deps: 0 },
    // Hidden implementation
    { pos: [0, -1, 0] as [number, number, number], size: [2.5, 0.8, 0.2] as [number, number, number], 
      label: "MyClass.cpp (hidden)", color: "#2196f3", isInterface: false, deps: 5 },
    // Dependencies hidden in .cpp
    { pos: [-2.5, -2.5, 0] as [number, number, number], size: [1, 0.6, 0.15] as [number, number, number], 
      label: "boost", color: "#666", isInterface: false, deps: 0 },
    { pos: [-0.8, -2.5, 0] as [number, number, number], size: [1, 0.6, 0.15] as [number, number, number], 
      label: "std", color: "#666", isInterface: false, deps: 0 },
    { pos: [0.8, -2.5, 0] as [number, number, number], size: [1, 0.6, 0.15] as [number, number, number], 
      label: "Qt", color: "#666", isInterface: false, deps: 0 },
    { pos: [2.5, -2.5, 0] as [number, number, number], size: [1, 0.6, 0.15] as [number, number, number], 
      label: "Custom", color: "#666", isInterface: false, deps: 0 }
  ];

  const current = showImplementation ? withPimpl : withoutPimpl;
  const arrows = showImplementation ? [
    { start: [0, 1.5, 0] as [number, number, number], end: [0, -0.5, 0] as [number, number, number], hidden: false },
    { start: [0, -1.4, 0] as [number, number, number], end: [-2.5, -2.2, 0] as [number, number, number], hidden: true },
    { start: [0, -1.4, 0] as [number, number, number], end: [-0.8, -2.2, 0] as [number, number, number], hidden: true },
    { start: [0, -1.4, 0] as [number, number, number], end: [0.8, -2.2, 0] as [number, number, number], hidden: true },
    { start: [0, -1.4, 0] as [number, number, number], end: [2.5, -2.2, 0] as [number, number, number], hidden: true }
  ] : [
    { start: [0, 1.5, 0] as [number, number, number], end: [-3, 0.4, 0] as [number, number, number], hidden: false },
    { start: [0, 1.5, 0] as [number, number, number], end: [-1, 0.4, 0] as [number, number, number], hidden: false },
    { start: [0, 1.5, 0] as [number, number, number], end: [1, 0.4, 0] as [number, number, number], hidden: false },
    { start: [0, 1.5, 0] as [number, number, number], end: [3, 0.4, 0] as [number, number, number], hidden: false }
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4a9eff" />
      
      {current.map((block, index) => (
        <ModuleBlock
          key={index}
          position={block.pos}
          size={block.size}
          label={block.label}
          color={block.color}
          isInterface={block.isInterface}
          dependencies={block.deps}
        />
      ))}

      {arrows.map((arrow, index) => (
        <DependencyArrow
          key={index}
          start={arrow.start}
          end={arrow.end}
          hidden={arrow.hidden}
        />
      ))}

      <Text
        position={[0, -3.5, 0]}
        fontSize={0.35}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
        maxWidth={16}
        textAlign="center"
      >
        {showImplementation ? "PIMPL: Clean Interface + Hidden Dependencies" : "Without PIMPL: All Dependencies Exposed"}
      </Text>
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </>
  );
}

export default function Lesson46_PimplIdiom({ onComplete, isCompleted }: Lesson46Props) {
  const [showImplementation, setShowImplementation] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "¿Cuál es el principal beneficio del PIMPL idiom?",
      options: [
        "Mejor rendimiento en tiempo de ejecución",
        "Reducción de dependencias de compilación",
        "Menor uso de memoria",
        "Sintaxis más simple"
      ],
      correct: 1
    },
    {
      question: "¿Por qué unique_ptr es ideal para PIMPL?",
      options: [
        "Es más rápido que raw pointers",
        "Maneja automáticamente la destrucción + forward declarations",
        "Ocupa menos memoria",
        "Permite herencia múltiple"
      ],
      correct: 1
    },
    {
      question: "¿Qué problema resuelve PIMPL respecto a ABI?",
      options: [
        "Mejora la compatibilidad binaria entre versiones",
        "Hace el código más portable",
        "Reduce el tamaño del ejecutable",
        "Acelera la carga de librerías"
      ],
      correct: 0
    },
    {
      question: "¿Cuál es un costo del PIMPL idiom?",
      options: [
        "Tiempo de compilación más lento",
        "Indirección adicional en acceso a datos",
        "Sintaxis más compleja",
        "Las opciones B y C son correctas"
      ],
      correct: 3
    },
    {
      question: "¿Dónde debe definirse el destructor en PIMPL?",
      options: [
        "En el header file con = default",
        "En el .cpp file después de la definición de Impl",
        "No es necesario definirlo explícitamente",
        "Puede definirse en cualquier lugar"
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
      <Title>🔒 Lección 46: PIMPL Idiom con unique_ptr</Title>
      
      <Description>
        <h3>🎯 Objetivo</h3>
        <p>
          El PIMPL (Pointer to Implementation) idiom es una técnica fundamental para 
          reducir dependencias de compilación y mejorar la encapsulación. Con unique_ptr, 
          se vuelve seguro y eficiente de implementar.
        </p>

        <h4>🔧 PIMPL Básico con unique_ptr</h4>
        <CodeBlock>
          {`// MyClass.h - Header file limpio
#pragma once
#include <memory> // Solo necesita unique_ptr

class MyClass {
public:
    // Constructor y destructor
    MyClass();
    ~MyClass();  // ¡Debe definirse en .cpp!
    
    // Move constructor/assignment
    MyClass(MyClass&&) noexcept;
    MyClass& operator=(MyClass&&) noexcept;
    
    // Copy (si necesario)
    MyClass(const MyClass& other);
    MyClass& operator=(const MyClass& other);
    
    // Interface pública
    void doSomething();
    int getValue() const;
    
private:
    class Impl;                    // Forward declaration
    std::unique_ptr<Impl> pimpl;  // Puntero a implementación
};`}
        </CodeBlock>

        <CodeBlock>
          {`// MyClass.cpp - Implementación completa
#include "MyClass.h"
// Todas las dependencias pesadas van aquí
#include <boost/algorithm/string.hpp>
#include <QtWidgets/QApplication>
#include <nlohmann/json.hpp>

// Definición de la implementación
class MyClass::Impl {
public:
    int value;
    boost::shared_ptr<SomeResource> resource;
    std::vector<ComplexType> data;
    
    void processData() {
        // Lógica compleja usando todas las librerías
        boost::algorithm::to_upper(someString);
        // ... más implementación
    }
};

// Implementación de métodos públicos
MyClass::MyClass() : pimpl(std::make_unique<Impl>()) {
    pimpl->value = 0;
}

// ¡CRÍTICO: Destructor en .cpp después de definir Impl!
MyClass::~MyClass() = default;

void MyClass::doSomething() {
    pimpl->processData();
}

int MyClass::getValue() const {
    return pimpl->value;
}`}
        </CodeBlock>
      </Description>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <PimplVisualization showImplementation={showImplementation} />
        </Canvas>
      </CanvasContainer>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={() => setShowImplementation(!showImplementation)}
          style={{
            padding: '10px 20px',
            background: showImplementation ? '#4caf50' : '#f44336',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {showImplementation ? 'Con PIMPL ✅' : 'Sin PIMPL ❌'}
        </button>
      </div>

      <Description>
        <h4>🎁 Beneficios del PIMPL</h4>
        <BenefitsList>
          <div className="benefit">
            <div className="icon">🚀</div>
            <div className="title">Compilación Más Rápida</div>
            <div className="description">
              Headers limpios = menos recompilaciones cuando cambia la implementación
            </div>
          </div>
          <div className="benefit">
            <div className="icon">🔒</div>
            <div className="title">Encapsulación Total</div>
            <div className="description">
              Detalles de implementación completamente ocultos del cliente
            </div>
          </div>
          <div className="benefit">
            <div className="icon">📦</div>
            <div className="title">Estabilidad ABI</div>
            <div className="description">
              Cambios internos no rompen compatibilidad binaria
            </div>
          </div>
          <div className="benefit">
            <div className="icon">📊</div>
            <div className="title">Dependencias Reducidas</div>
            <div className="description">
              Headers no incluyen librerías pesadas como Boost o Qt
            </div>
          </div>
        </BenefitsList>

        <h4>⚠️ Consideraciones Importantes</h4>
        
        <h5>1. El Destructor Debe Estar en .cpp:</h5>
        <CodeBlock>
          {`// ❌ INCORRECTO: En el header
class MyClass {
    // ...
    ~MyClass() = default; // ¡ERROR! Impl no está definido aquí
};

// ✅ CORRECTO: En el .cpp
// MyClass.h
class MyClass {
    ~MyClass(); // Solo declaración
};

// MyClass.cpp
MyClass::~MyClass() = default; // Definición donde Impl está completo`}
        </CodeBlock>

        <h5>2. Move Semantics:</h5>
        <CodeBlock>
          {`// Move constructor/assignment también en .cpp
MyClass::MyClass(MyClass&& other) noexcept = default;

MyClass& MyClass::operator=(MyClass&& other) noexcept {
    if (this != &other) {
        pimpl = std::move(other.pimpl);
    }
    return *this;
}`}
        </CodeBlock>

        <h5>3. Copy Constructor (si necesario):</h5>
        <CodeBlock>
          {`// Copy requiere implementación manual
MyClass::MyClass(const MyClass& other) 
    : pimpl(std::make_unique<Impl>(*other.pimpl)) {
    // Impl debe tener copy constructor
}

MyClass& MyClass::operator=(const MyClass& other) {
    if (this != &other) {
        *pimpl = *other.pimpl; // O recrear con make_unique
    }
    return *this;
}`}
        </CodeBlock>

        <h4>🔬 PIMPL Avanzado</h4>
        
        <h5>Fast PIMPL (para hot paths):</h5>
        <CodeBlock>
          {`// Híbrido: datos críticos en la clase, resto en PIMPL
class FastClass {
private:
    // Hot data: acceso directo, sin indirección
    int frequently_used_value;
    bool is_active;
    
    // Cold data: en PIMPL
    class Impl;
    std::unique_ptr<Impl> pimpl;

public:
    // Fast path: sin indirección
    int getFastValue() const { return frequently_used_value; }
    
    // Slow path: con indirección pero rara vez usado
    void doComplexOperation();
};`}
        </CodeBlock>

        <h5>PIMPL con Factory:</h5>
        <CodeBlock>
          {`// Factory function para crear instancias
std::unique_ptr<MyClass> createMyClass(const Config& config) {
    auto obj = std::make_unique<MyClass>();
    // Configuración específica...
    return obj;
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
              {score >= 80 ? '🎉 ¡Excelente! Dominas el PIMPL idiom' :
               score >= 60 ? '👍 Bien, pero revisa los detalles de implementación' :
               '📚 Necesitas repasar los conceptos de PIMPL'}
            </p>
          </ScoreDisplay>
        )}
      </QuizContainer>
    </Container>
  );
}