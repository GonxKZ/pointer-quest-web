import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import CodeEditor from '../components/CodeEditor';
import { THREE } from '../utils/three';
import { Lesson01_RawPtrTranslation, Lesson01_StepsSpanish, Lesson01_MessagesSpanish } from '../translations/lessons/Lesson01_RawPtr.es';
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


interface MemoryState {
  x: number;
  p: number | null;
  pValue: number | null;
  showArrow: boolean;
  status: 'normal' | 'modified' | 'error';
  message: string;
}

function MemoryBlock({ position, size, color, label, value, type }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  label: string;
  value?: string;
  type: 'stack' | 'heap';
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      
      <Text
        position={[0, size[1] / 2 + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      {value && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
        >
          {value}
        </Text>
      )}
      
      <Text
        position={[0, -size[1] / 2 - 0.3, 0]}
        fontSize={0.2}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        {type}
      </Text>
    </group>
  );
}

function PointerArrow({ start, end, color = "#00d4ff" }: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
}) {
  const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
  const length = direction.length();
  direction.normalize();

  const arrowHelper = new THREE.ArrowHelper(direction, new THREE.Vector3(...start), length, color, length * 0.2, length * 0.1);

  return <primitive object={arrowHelper} />;
}

function Lesson01Scene({ memoryState }: { memoryState: MemoryState }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <MemoryBlock
        position={[-2, 0, 0]}
        size={[1.5, 1, 0.5]}
        color={memoryState.status === 'modified' ? "#4ecdc4" : "#00d4ff"}
        label="int x"
        value={memoryState.x.toString()}
        type="stack"
      />
      
      <MemoryBlock
        position={[2, 0, 0]}
        size={[1.5, 1, 0.5]}
        color={memoryState.p === null ? "#ff6b6b" : "#00d4ff"}
        label="int* p"
        value={memoryState.p ? `&x (${memoryState.p.toString(16)})` : "null"}
        type="stack"
      />
      
      {memoryState.showArrow && memoryState.p !== null && (
        <PointerArrow
          start={[2.8, 0, 0]}
          end={[-1.2, 0, 0]}
          color="#00d4ff"
        />
      )}
      
      <Html position={[0, -3, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <h4 style={{ color: '#00d4ff', margin: '0 0 0.5rem 0' }}>Estado de Memoria</h4>
          <p style={{ margin: '0', fontFamily: 'monospace' }}>
            x = {memoryState.x} | p = {memoryState.p ? `&x (${memoryState.p.toString(16)})` : 'nullptr'}
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: memoryState.status === 'error' ? '#ff6b6b' : '#4ecdc4',
            fontWeight: 'bold'
          }}>
            {memoryState.message}
          </p>
        </div>
      </Html>
    </>
  );
}

export default function Lesson01_RawPtr() {
  const { state, dispatch } = useApp();
  
  const [memoryState, setMemoryState] = useState<MemoryState>({
    x: 42,
    p: 0x7fff5fbff71c, // Dirección simulada
    pValue: 42,
    showArrow: true,
    status: 'normal',
    message: state.language === 'en' ? 'p points correctly to x' : Lesson01_MessagesSpanish.initialMessage
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = state.language === 'en' 
    ? [
      "Initial declaration: int x = 42; int* p = &x;",
      "Observe how p stores the address of x",
      "Modify x and verify that p continues pointing to the same address",
      "The pointer doesn't change because it stores an address, not a value"
    ]
    : Lesson01_StepsSpanish;

  const modifyX = () => {
    const newValue = memoryState.x + 10;
    setMemoryState(prev => ({
      ...prev,
      x: newValue,
      pValue: newValue,
      status: 'modified',
      message: state.language === 'en' 
        ? `x modified to ${newValue}. p continues pointing to the same address!`
        : `${Lesson01_MessagesSpanish.modifiedMessage} ${newValue}`
    }));
    
    setTimeout(() => {
      setMemoryState(prev => ({
        ...prev,
        status: 'normal',
        message: state.language === 'en' 
          ? 'p points correctly to x' 
          : Lesson01_MessagesSpanish.initialMessage
      }));
    }, 3000);
  };

  const resetValues = () => {
    setMemoryState({
      x: 42,
      p: 0x7fff5fbff71c,
      pValue: 42,
      showArrow: true,
      status: 'normal',
      message: 'p apunta correctamente a x'
    });
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const cppCode = `#include <iostream>

int main() {
    // Declaramos una variable int en la pila
    int x = 42;
    
    // Declaramos un puntero que almacena la dirección de x
    int* p = &x;  // & es el operador "address-of"
    
    std::cout << "Valor de x: " << x << std::endl;
    std::cout << "Dirección de x: " << p << std::endl;
    std::cout << "Valor a través del puntero: " << *p << std::endl;
    
    // Modificamos x
    x = 100;
    
    // El puntero sigue apuntando a la misma dirección
    std::cout << "Nuevo valor de x: " << x << std::endl;
    std::cout << "Dirección de x (sin cambios): " << p << std::endl;
    std::cout << "Nuevo valor a través del puntero: " << *p << std::endl;
    
    return 0;
}`;

  return (
    <LessonLayout
      title={state.language === 'en' 
        ? 'Basic Pointers - int* p = &x' 
        : Lesson01_RawPtrTranslation.title}
      subtitle={state.language === 'en' 
        ? 'Understanding pointer fundamentals and memory addresses'
        : 'Entendiendo los fundamentos de punteros y direcciones de memoria'}
      lessonNumber={1}
      difficulty="Beginner"
      estimatedTime={15}
      layoutType="two-panel"
    >
      <TheoryPanel topic="basic">
        
        <Section>
          <SectionTitle>📖 {state.language === 'en' ? 'Fundamental Theory' : 'Teoría Fundamental'}</SectionTitle>
          <p>
            {state.language === 'en' 
              ? 'Pointers are variables that store memory addresses instead of direct values. This is the fundamental difference you need to internalize.'
              : 'Los punteros son variables que almacenan direcciones de memoria en lugar de valores directos. Esta es la diferencia fundamental que necesitas interiorizar.'}
          </p>
          
          <h4 style={{ color: '#4ecdc4', marginTop: '1rem' }}>
            {state.language === 'en' ? 'Key Concepts:' : 'Conceptos Clave:'}
          </h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li>
              <strong>int x = 42;</strong> 
              {state.language === 'en' 
                ? ' - Normal variable storing value 42 on the stack'
                : ' - Variable normal que almacena el valor 42 en la pila'}
            </li>
            <li>
              <strong>int* p = &x;</strong>
              {state.language === 'en' 
                ? ' - Pointer storing the address where x lives'
                : ' - Puntero que almacena la dirección donde vive x'}
            </li>
            <li>
              <strong>&x</strong>
              {state.language === 'en' 
                ? ' - Address-of operator: "give me the address of x"'
                : ' - Operador address-of: "dame la dirección de x"'}
            </li>
            <li>
              <strong>*p</strong>
              {state.language === 'en' 
                ? ' - Dereference operator: "give me the value at the address p"'
                : ' - Operador de desreferencia: "dame el valor en la dirección p"'}
            </li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 {state.language === 'en' ? 'C++ Example Code' : 'Código C++ de Ejemplo'}</SectionTitle>
          <CodeBlock
            language="cpp"
            title={state.language === 'en' ? 'Basic Pointer Declaration' : 'Declaración Básica de Punteros'}
            copyable={true}
            showLineNumbers={true}
          >
            {cppCode}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🔍 {state.language === 'en' ? 'Critical Understanding Point' : 'Punto Crítico de Entendimiento'}</SectionTitle>
          <div style={{
            background: 'rgba(255, 202, 40, 0.1)',
            border: '1px solid #ffca28',
            borderRadius: '8px',
            padding: '1rem',
            margin: '1rem 0'
          }}>
            <strong>⚠️ {state.language === 'en' ? 'Fundamental Concept:' : 'Concepto Fundamental:'}</strong><br/>
            {state.language === 'en' 
              ? `When you reassign <code>x = 100</code>, the pointer <code>p</code> does NOT change because it stores an 
                <strong>address</strong>, not a value. The address of x remains constant throughout its lifetime.`
              : `Cuando reasignas <code>x = 100</code>, el puntero <code>p</code> NO cambia porque 
                almacena una <strong>dirección</strong>, no un valor. La dirección de x permanece 
                constante durante toda su vida útil.`}
          </div>
        </Section>

        <Section>
          <SectionTitle>🎮 {state.language === 'en' ? 'Interaction' : 'Interacción'}</SectionTitle>
          <p>
            <strong>
              {state.language === 'en' 
                ? `Step ${currentStep + 1} of ${steps.length}:` 
                : `Paso ${currentStep + 1} de ${steps.length}:`}
            </strong> {steps[currentStep]}
          </p>
          
          <InteractiveSection>
            <ButtonGroup orientation="horizontal" spacing="3">
              <Button onClick={modifyX}>
                {state.language === 'en' ? 'Modify x (+10)' : 'Modificar x (+10)'}
              </Button>
              <Button onClick={nextStep} variant="warning">
                {state.language === 'en' ? 'Next Step' : 'Siguiente Paso'}
              </Button>
              <Button onClick={resetValues} variant="danger">
                {state.language === 'en' ? 'Reset' : 'Reiniciar'}
              </Button>
            </ButtonGroup>
          </InteractiveSection>
        </Section>

        <Section>
          <SectionTitle>📚 {state.language === 'en' ? 'References and Best Practices' : 'Referencias y Mejores Prácticas'}</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li>
              <a href="https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-resource" 
                 style={{ color: '#00d4ff' }} target="_blank" rel="noopener noreferrer">
                {state.language === 'en' 
                  ? 'Core Guidelines - Resource Management'
                  : 'Pautas Centrales - Gestión de Recursos'}
              </a>
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Golden Rule:' : 'Regla de Oro:'}</strong> 
              {state.language === 'en' 
                ? ' Always initialize pointers'
                : ' Siempre inicializa los punteros'}
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Verification:' : 'Verificación:'}</strong>
              {state.language === 'en' 
                ? ' Check if the pointer is valid before dereferencing'
                : ' Comprueba si el puntero es válido antes de desreferenciar'}
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Modernity:' : 'Modernidad:'}</strong>
              {state.language === 'en' 
                ? ' Prefer smart pointers in modern code'
                : ' Prefiere smart pointers en código moderno'}
            </li>
          </ul>
        </Section>
      </TheoryPanel>
      
      <VisualizationPanel topic="basic">
        <StatusDisplay>
          <div>🎯 {state.language === 'en' ? 'Task 1: Raw Pointers' : 'Tarea 1: Punteros Básicos'}</div>
          <div>
            📍 {state.language === 'en' ? `Step: ${currentStep + 1}/${steps.length}` : `Paso: ${currentStep + 1}/${steps.length}`}
          </div>
          <div>
            🔗 {state.language === 'en' ? `Status: ${memoryState.status}` : `Estado: ${memoryState.status}`}
          </div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
          <Lesson01Scene memoryState={memoryState} />
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