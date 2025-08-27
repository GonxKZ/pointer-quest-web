import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson42Props {
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
    .good { color: #4caf50; background: rgba(76, 175, 80, 0.1); padding: 2px; }
    .bad { color: #f44336; background: rgba(244, 67, 54, 0.1); padding: 2px; }
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

const PatternSelector = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const PatternButton = styled.button<{ active: boolean; advanced?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.advanced ? '#9c27b0' : props.active ? '#4caf50' : '#4a9eff'};
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.advanced ? '#ba68c8' : props.active ? '#66bb6a' : '#5ba0ff'};
    transform: translateY(-2px);
  }
`;

interface FactoryVisualizationProps {
  pattern: number;
}

function ObjectNode({ 
  position, 
  label, 
  type, 
  isBase,
  isProduct,
  color 
}: {
  position: [number, number, number];
  label: string;
  type: string;
  isBase: boolean;
  isProduct: boolean;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isProduct) {
      meshRef.current.rotation.y = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={isBase ? [2.5, 1, 0.5] : [2, 1.2, 0.6]} />
        <meshStandardMaterial 
          color={color}
          emissive={isProduct ? color : '#000000'}
          emissiveIntensity={isProduct ? 0.2 : 0}
          transparent
          opacity={isBase ? 0.7 : 0.9}
        />
      </mesh>

      <Text
        position={[0, 0, 0.35]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      <Text
        position={[0, -0.4, 0.35]}
        fontSize={0.2}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
      >
        {type}
      </Text>

      {isBase && (
        <Text
          position={[0, 0.7, 0.35]}
          fontSize={0.18}
          color="#4fc3f7"
          anchorX="center"
          anchorY="middle"
        >
          Base Class
        </Text>
      )}
    </group>
  );
}

function ConnectionArrow({ 
  start, 
  end, 
  label,
  animated 
}: {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
  animated: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);
  
  useFrame((state) => {
    if (lineRef.current && animated) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.5 + Math.sin(state.clock.getElapsedTime() * 3) * 0.3;
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const midPoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + 0.5,
    (start[2] + end[2]) / 2
  ];

  return (
    <>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color="#ffeb3b" linewidth={2} transparent />
      </line>
      <Text
        position={midPoint}
        fontSize={0.2}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </>
  );
}

function FactoryPatternVisualization({ pattern }: FactoryVisualizationProps) {
  const patterns = [
    // Pattern 0: Simple Factory
    {
      title: "Simple Factory Pattern",
      nodes: [
        { pos: [0, 2, 0] as [number, number, number], label: "createShape()", type: "Factory Function", isBase: false, isProduct: false, color: "#2196f3" },
        { pos: [-2, 0, 0] as [number, number, number], label: "Circle", type: "unique_ptr<Shape>", isBase: false, isProduct: true, color: "#4caf50" },
        { pos: [0, 0, 0] as [number, number, number], label: "Rectangle", type: "unique_ptr<Shape>", isBase: false, isProduct: true, color: "#ff9800" },
        { pos: [2, 0, 0] as [number, number, number], label: "Triangle", type: "unique_ptr<Shape>", isBase: false, isProduct: true, color: "#f44336" }
      ],
      arrows: [
        { start: [0, 1.5, 0] as [number, number, number], end: [-2, 0.5, 0] as [number, number, number], label: "creates" },
        { start: [0, 1.5, 0] as [number, number, number], end: [0, 0.5, 0] as [number, number, number], label: "creates" },
        { start: [0, 1.5, 0] as [number, number, number], end: [2, 0.5, 0] as [number, number, number], label: "creates" }
      ]
    },
    // Pattern 1: Abstract Factory
    {
      title: "Abstract Factory Pattern",
      nodes: [
        { pos: [0, 3, 0] as [number, number, number], label: "ShapeFactory", type: "Abstract Base", isBase: true, isProduct: false, color: "#9c27b0" },
        { pos: [-2, 1.5, 0] as [number, number, number], label: "2DFactory", type: "Concrete Factory", isBase: false, isProduct: false, color: "#2196f3" },
        { pos: [2, 1.5, 0] as [number, number, number], label: "3DFactory", type: "Concrete Factory", isBase: false, isProduct: false, color: "#ff5722" },
        { pos: [-2, 0, 0] as [number, number, number], label: "Circle2D", type: "Product", isBase: false, isProduct: true, color: "#4caf50" },
        { pos: [2, 0, 0] as [number, number, number], label: "Sphere3D", type: "Product", isBase: false, isProduct: true, color: "#ff9800" }
      ],
      arrows: [
        { start: [0, 2.5, 0] as [number, number, number], end: [-2, 2, 0] as [number, number, number], label: "inherits" },
        { start: [0, 2.5, 0] as [number, number, number], end: [2, 2, 0] as [number, number, number], label: "inherits" },
        { start: [-2, 1, 0] as [number, number, number], end: [-2, 0.5, 0] as [number, number, number], label: "creates" },
        { start: [2, 1, 0] as [number, number, number], end: [2, 0.5, 0] as [number, number, number], label: "creates" }
      ]
    },
    // Pattern 2: Factory Method
    {
      title: "Factory Method Pattern",
      nodes: [
        { pos: [0, 2.5, 0] as [number, number, number], label: "Document", type: "Base Class", isBase: true, isProduct: false, color: "#673ab7" },
        { pos: [-2, 1, 0] as [number, number, number], label: "PdfDocument", type: "Derived", isBase: false, isProduct: false, color: "#3f51b5" },
        { pos: [2, 1, 0] as [number, number, number], label: "HtmlDocument", type: "Derived", isBase: false, isProduct: false, color: "#2196f3" },
        { pos: [-2, -0.5, 0] as [number, number, number], label: "PdfPage", type: "Page Product", isBase: false, isProduct: true, color: "#4caf50" },
        { pos: [2, -0.5, 0] as [number, number, number], label: "HtmlPage", type: "Page Product", isBase: false, isProduct: true, color: "#ff9800" }
      ],
      arrows: [
        { start: [0, 2, 0] as [number, number, number], end: [-2, 1.5, 0] as [number, number, number], label: "inherits" },
        { start: [0, 2, 0] as [number, number, number], end: [2, 1.5, 0] as [number, number, number], label: "inherits" },
        { start: [-2, 0.5, 0] as [number, number, number], end: [-2, 0, 0] as [number, number, number], label: "createPage()" },
        { start: [2, 0.5, 0] as [number, number, number], end: [2, 0, 0] as [number, number, number], label: "createPage()" }
      ]
    },
    // Pattern 3: Builder Pattern
    {
      title: "Builder Pattern with unique_ptr",
      nodes: [
        { pos: [0, 2, 0] as [number, number, number], label: "CarBuilder", type: "Builder", isBase: false, isProduct: false, color: "#795548" },
        { pos: [-2, 0, 0] as [number, number, number], label: "Engine", type: "Component", isBase: false, isProduct: true, color: "#607d8b" },
        { pos: [0, 0, 0] as [number, number, number], label: "Wheels", type: "Component", isBase: false, isProduct: true, color: "#9e9e9e" },
        { pos: [2, 0, 0] as [number, number, number], label: "Car", type: "Final Product", isBase: false, isProduct: true, color: "#ff5722" }
      ],
      arrows: [
        { start: [0, 1.5, 0] as [number, number, number], end: [-2, 0.5, 0] as [number, number, number], label: "builds" },
        { start: [0, 1.5, 0] as [number, number, number], end: [0, 0.5, 0] as [number, number, number], label: "builds" },
        { start: [0, 1.5, 0] as [number, number, number], end: [2, 0.5, 0] as [number, number, number], label: "assembles" }
      ]
    }
  ];

  const currentPattern = patterns[pattern] || patterns[0];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4a9eff" />
      
      {currentPattern.nodes.map((node, index) => (
        <ObjectNode
          key={index}
          position={node.pos}
          label={node.label}
          type={node.type}
          isBase={node.isBase}
          isProduct={node.isProduct}
          color={node.color}
        />
      ))}

      {currentPattern.arrows.map((arrow, index) => (
        <ConnectionArrow
          key={index}
          start={arrow.start}
          end={arrow.end}
          label={arrow.label}
          animated={true}
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
        {currentPattern.title}
      </Text>
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </>
  );
}

export default function Lesson42_FactoryPatterns({ onComplete, isCompleted }: Lesson42Props) {
  const [currentPattern, setCurrentPattern] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "¿Por qué unique_ptr<Base> es ideal para Factory Patterns?",
      options: [
        "Porque es más rápido que shared_ptr",
        "Porque expresa transferencia clara de ownership",
        "Porque ocupa menos memoria",
        "Porque previene polimorfismo"
      ],
      correct: 1
    },
    {
      question: "¿Cuál es la ventaja de make_unique en factories?",
      options: [
        "Es más lento pero más seguro",
        "Exception safety y sintaxis más limpia",
        "Permite usar constructores privados",
        "Funciona mejor con herencia múltiple"
      ],
      correct: 1
    },
    {
      question: "¿Qué problema resuelve el Abstract Factory Pattern?",
      options: [
        "Crear un solo tipo de objeto eficientemente",
        "Crear familias de objetos relacionados",
        "Evitar el uso de virtual functions",
        "Mejorar el rendimiento de construcción"
      ],
      correct: 1
    },
    {
      question: "¿Por qué usar enable_shared_from_this en factories?",
      options: [
        "Para mejorar el rendimiento",
        "Cuando el objeto necesita devolver shared_ptr de sí mismo",
        "Para evitar circular references",
        "Solo es necesario con weak_ptr"
      ],
      correct: 1
    },
    {
      question: "¿Cuándo preferir Factory Method vs Simple Factory?",
      options: [
        "Siempre usar Factory Method por ser más complejo",
        "Factory Method cuando cada subclase necesita crear diferentes productos",
        "Simple Factory es siempre mejor",
        "No hay diferencia práctica"
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
      <Title>🏭 Lección 42: Factory Patterns con unique_ptr</Title>
      
      <Description>
        <h3>🎯 Objetivo</h3>
        <p>
          Los Factory Patterns son fundamentales en C++ moderno, y unique_ptr&lt;Base&gt; 
          es la herramienta perfecta para expresar transferencia de ownership en estos patrones. 
          Esta lección explora diferentes factory patterns y cómo implementarlos de forma 
          segura y eficiente con smart pointers.
        </p>

        <h4>🏗️ Simple Factory Pattern</h4>
        <CodeBlock>
{[
"// Base class para productos",
"class Shape {",
"public:",
"    virtual ~Shape() = default;",
"    virtual void draw() const = 0;",
"    virtual double area() const = 0;",
"};",
"",
"class Circle : public Shape {",
"    double radius;",
"public:",
"    Circle(double r) : radius(r) {}",
"    void draw() const override { ",
"        std::cout << \"Drawing circle with radius \" << radius << \"\\n\"; ",
"    }",
"    double area() const override { ",
"        return 3.14159 * radius * radius; ",
"    }",
"};",
"",
"// ✅ Factory function con unique_ptr - Ownership claro",
"std::unique_ptr<Shape> createShape(const std::string& type) {",
"    if (type == \"circle\") {",
"        return std::make_unique<Circle>(5.0); // Exception safe",
"    } else if (type == \"rectangle\") {",
"        return std::make_unique<Rectangle>(4.0, 3.0);",
"    }",
"    return nullptr; // O mejor: lanzar excepción",
"}",
"",
"// Uso del factory",
"auto shape = createShape(\"circle\");",
"if (shape) {",
"    shape->draw();",
"    std::cout << \"Area: \" << shape->area() << \"\\n\";",
"}",
].join('\n')}
        </CodeBlock>

        <h4>🏭 Abstract Factory Pattern</h4>
        <CodeBlock>
{[
"// Abstract Factory para crear familias de objetos relacionados",
"class GUIFactory {",
"public:",
"    virtual ~GUIFactory() = default;",
"    virtual std::unique_ptr<Button> createButton() = 0;",
"    virtual std::unique_ptr<Window> createWindow() = 0;",
"};",
"",
"class WindowsFactory : public GUIFactory {",
"public:",
"    std::unique_ptr<Button> createButton() override {",
"        return std::make_unique<WindowsButton>();",
"    }",
"    ",
"    std::unique_ptr<Window> createWindow() override {",
"        return std::make_unique<WindowsWindow>();",
"    }",
"};",
"",
"// Factory selector",
"std::unique_ptr<GUIFactory> createGUIFactory(const std::string& platform) {",
"    if (platform == \"windows\") {",
"        return std::make_unique<WindowsFactory>();",
"    } else if (platform == \"linux\") {",
"        return std::make_unique<LinuxFactory>();",
"    }",
"    throw std::invalid_argument(\"Unknown platform: \" + platform);",
"}",
].join('\n')}
        </CodeBlock>
      </Description>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <FactoryPatternVisualization pattern={currentPattern} />
        </Canvas>
      </CanvasContainer>

      <PatternSelector>
        {['Simple Factory', 'Abstract Factory', 'Factory Method', 'Builder Pattern'].map((name, index) => (
          <PatternButton
            key={index}
            active={currentPattern === index}
            advanced={index >= 2}
            onClick={() => setCurrentPattern(index)}
          >
            {name} {index >= 2 && '⭐'}
          </PatternButton>
        ))}
      </PatternSelector>

      <Description>
        <h4>⚙️ Factory Method Pattern</h4>
        <CodeBlock>
{[
"// Factory Method: cada subclase decide qué crear",
"class Document {",
"protected:",
"    // Factory method - implementado por subclases",
"    virtual std::unique_ptr<Page> createPage() = 0;",
"public:",
"    virtual ~Document() = default;",
"    void addPage() {",
"        auto page = createPage(); // ← Usa factory method",
"        pages.push_back(std::move(page));",
"    }",
"private:",
"    std::vector<std::unique_ptr<Page>> pages;",
"};",
"",
"class PDFDocument : public Document {",
"protected:",
"    std::unique_ptr<Page> createPage() override {",
"        return std::make_unique<PDFPage>();  // PDF específico",
"    }",
"};",
"",
"class HTMLDocument : public Document {",
"protected:",
"    std::unique_ptr<Page> createPage() override {",
"        return std::make_unique<HTMLPage>(); // HTML específico",
"    }",
"};",
].join('\n')}
        </CodeBlock>

        <h4>🔧 Builder Pattern con unique_ptr</h4>
        <CodeBlock>
{[
"// Builder Pattern para construcción compleja",
"class Car {",
"private:",
"    std::unique_ptr<Engine> engine;",
"    std::unique_ptr<Transmission> transmission;",
"    std::vector<std::unique_ptr<Wheel>> wheels;",
"public:",
"    void setEngine(std::unique_ptr<Engine> e) { ",
"        engine = std::move(e); ",
"    }",
"    void addWheel(std::unique_ptr<Wheel> w) { ",
"        wheels.push_back(std::move(w)); ",
"    }",
"};",
"",
"class CarBuilder {",
"private:",
"    std::unique_ptr<Car> car;",
"public:",
"    CarBuilder() : car(std::make_unique<Car>()) {}",
"    CarBuilder& withEngine(const std::string& type) {",
"        if (type == \"V8\") {",
"            car->setEngine(std::make_unique<V8Engine>());",
"        }",
"        return *this; // Fluent interface",
"    }",
"    CarBuilder& withWheels(int count) {",
"        for (int i = 0; i < count; ++i) {",
"            car->addWheel(std::make_unique<StandardWheel>());",
"        }",
"        return *this;",
"    }",
"    std::unique_ptr<Car> build() {",
"        return std::move(car); // Transfer ownership",
"    }",
"};",
"",
"// Uso fluido del builder",
"auto car = CarBuilder()",
"    .withEngine(\"V8\")",
"    .withWheels(4)",
"    .build();",
].join('\n')}
        </CodeBlock>

        <h4>🚀 Patrones Avanzados</h4>
        
        <h5>Factory con enable_shared_from_this:</h5>
        <CodeBlock>
{[
"// Para objetos que necesitan devolver shared_ptr de sí mismos",
"class NetworkConnection : public std::enable_shared_from_this<NetworkConnection> {",
"public:",
"    static std::shared_ptr<NetworkConnection> create(const std::string& host) {",
"        // No se puede usar make_shared aquí si el constructor es privado",
"        return std::shared_ptr<NetworkConnection>(new NetworkConnection(host));",
"    }",
"    void startAsync() {",
"        // Puede pasar shared_ptr de sí mismo a callbacks",
"        auto self = shared_from_this();",
"        asyncOperation([self](bool success) {",
"            self->onComplete(success);",
"        });",
"    }",
"private:",
"    NetworkConnection(const std::string& host) : hostname(host) {}",
"    std::string hostname;",
"};",
].join('\n')}
        </CodeBlock>

        <h5>Registry-based Factory:</h5>
        <CodeBlock>
{[
"// Factory registry para extensibilidad",
"class ShapeFactory {",
"public:",
"    using CreateFunc = std::function<std::unique_ptr<Shape>()>;",
"    static void registerShape(const std::string& name, CreateFunc creator) {",
"        getRegistry()[name] = creator;",
"    }",
"    static std::unique_ptr<Shape> create(const std::string& name) {",
"        auto& registry = getRegistry();",
"        auto it = registry.find(name);",
"        return (it != registry.end()) ? it->second() : nullptr;",
"    }",
"private:",
"    static std::unordered_map<std::string, CreateFunc>& getRegistry() {",
"        static std::unordered_map<std::string, CreateFunc> registry;",
"        return registry;",
"    }",
"};",
"",
"// Auto-registro usando RAII",
"struct CircleRegistrar {",
"    CircleRegistrar() {",
"        ShapeFactory::registerShape(\"circle\", []() {",
"            return std::make_unique<Circle>(1.0);",
"        });",
"    }",
"};",
"static CircleRegistrar circle_registrar; // Auto-registro global",
].join('\n')}
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
              {score >= 80 ? '🎉 ¡Excelente! Dominas los Factory Patterns con unique_ptr' :
               score >= 60 ? '👍 Bien, pero practica más los patrones avanzados' :
               '📚 Necesitas repasar los conceptos de Factory Patterns'}
            </p>
          </ScoreDisplay>
        )}
      </QuizContainer>
    </Container>
  );
}
