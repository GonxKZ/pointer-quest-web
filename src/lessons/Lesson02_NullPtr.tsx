import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import { THREE } from '../utils/three';
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

// Error and success notification components (using theme colors)
const ErrorBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: `rgba(${parseInt(theme.colors.error.slice(1, 3), 16)}, ${parseInt(theme.colors.error.slice(3, 5), 16)}, ${parseInt(theme.colors.error.slice(5, 7), 16)}, 0.1)`,
    border: `2px solid ${theme.colors.error}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    margin: `${theme.spacing[4]} 0`,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.bold,
    animation: 'pulse 2s infinite'
  }}>
    {children}
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `}</style>
  </div>
);

const SuccessBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: `rgba(${parseInt(theme.colors.success.slice(1, 3), 16)}, ${parseInt(theme.colors.success.slice(3, 5), 16)}, ${parseInt(theme.colors.success.slice(5, 7), 16)}, 0.1)`,
    border: `2px solid ${theme.colors.success}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    margin: `${theme.spacing[4]} 0`,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.bold
  }}>
    {children}
  </div>
);

interface NullPtrState {
  x: number;
  p: number | null;
  isNullPtr: boolean;
  showArrow: boolean;
  arrowColor: string;
  blockingInput: boolean;
  status: 'safe' | 'null' | 'error' | 'assigned';
  message: string;
}

function MemoryBlock({ position, size, color, label, value, type, blinking = false }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  label: string;
  value?: string;
  type: 'stack' | 'heap';
  blinking?: boolean;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (blinking) {
      const interval = setInterval(() => {
        setVisible(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [blinking]);

  return (
    <group position={position}>
      <mesh visible={visible}>
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
          color={color === "#ff6b6b" ? "#ff6b6b" : "#00d4ff"}
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

function NullPointerArrow({ start, color = "#ff6b6b", blinking = false }: {
  start: [number, number, number];
  color?: string;
  blinking?: boolean;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (blinking) {
      const interval = setInterval(() => {
        setVisible(prev => !prev);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [blinking]);

  return (
    <group position={start} visible={visible}>
      <mesh>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        NULLPTR
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

function Lesson02Scene({ state }: { state: NullPtrState }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Variable x en la pila */}
      <MemoryBlock
        position={[-2, 0, 0]}
        size={[1.5, 1, 0.5]}
        color="#00d4ff"
        label="int x"
        value={state.x.toString()}
        type="stack"
      />
      
      {/* Puntero p */}
      <MemoryBlock
        position={[2, 0, 0]}
        size={[1.5, 1, 0.5]}
        color={state.isNullPtr ? "#ff6b6b" : "#00d4ff"}
        label="int* p"
        value={state.isNullPtr ? "nullptr" : `&x (${state.p?.toString(16)})`}
        type="stack"
        blinking={state.status === 'error'}
      />
      
      {/* Flecha normal cuando apunta a x */}
      {state.showArrow && !state.isNullPtr && (
        <PointerArrow
          start={[2.8, 0, 0]}
          end={[-1.2, 0, 0]}
          color={state.arrowColor}
        />
      )}
      
      {/* Indicador nullptr */}
      {state.isNullPtr && (
        <NullPointerArrow
          start={[2, -1.5, 0]}
          color="#ff6b6b"
          blinking={state.status === 'error'}
        />
      )}
      
      <Html position={[0, -3, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          minWidth: '400px',
          border: state.status === 'error' ? '2px solid #ff6b6b' : '1px solid #00d4ff'
        }}>
          <h4 style={{ 
            color: state.status === 'error' ? '#ff6b6b' : '#00d4ff', 
            margin: '0 0 0.5rem 0' 
          }}>
            Estado de Memoria - nullptr Safety
          </h4>
          <p style={{ margin: '0', fontFamily: 'monospace' }}>
            x = {state.x} | p = {state.isNullPtr ? 'nullptr' : `&x (${state.p?.toString(16)})`}
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: state.status === 'error' ? '#ff6b6b' : 
                   state.status === 'assigned' ? '#4caf50' : '#4ecdc4',
            fontWeight: 'bold'
          }}>
            {state.message}
          </p>
        </div>
      </Html>
    </>
  );
}

export default function Lesson02_NullPtr() {
  const { dispatch } = useApp();
  
  const [state, setState] = useState<NullPtrState>({
    x: 42,
    p: null,
    isNullPtr: true,
    showArrow: false,
    arrowColor: "#00d4ff",
    blockingInput: false,
    status: 'null',
    message: 'p declarado como nullptr - NO APUNTA A NADA'
  });

  const [attemptedDereference, setAttemptedDereference] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Declara int* p = nullptr; - el puntero no apunta a nada",
    "Intenta desreferenciar *p - ¡PELIGRO! Undefined Behavior",
    "Asigna p = &x para hacer el puntero válido",
    "Ahora puedes desreferenciar *p de forma segura"
  ];

  const attemptDereference = () => {
    if (state.isNullPtr) {
      setState(prev => ({
        ...prev,
        status: 'error',
        message: '🚨 UNDEFINED BEHAVIOR: *p con nullptr ¡CRASH!',
        blockingInput: true,
        arrowColor: "#ff6b6b"
      }));
      setAttemptedDereference(true);
      
      // Simular bloqueo temporal
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          blockingInput: false,
          message: 'Input desbloqueado. NUNCA desreferencies nullptr!'
        }));
      }, 3000);
    } else {
      setState(prev => ({
        ...prev,
        status: 'safe',
        message: `✅ *p = ${prev.x} - Desreferencia SEGURA porque p apunta a x`
      }));
    }
  };

  const assignToX = () => {
    setState(prev => ({
      ...prev,
      p: 0x7fff5fbff71c,
      isNullPtr: false,
      showArrow: true,
      status: 'assigned',
      message: '✅ p = &x - Ahora p apunta a x de forma válida',
      arrowColor: "#4caf50"
    }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        status: 'safe',
        arrowColor: "#00d4ff",
        message: 'p apunta correctamente a x - desreferencia es segura'
      }));
    }, 2000);
  };

  const resetToNull = () => {
    setState({
      x: 42,
      p: null,
      isNullPtr: true,
      showArrow: false,
      arrowColor: "#00d4ff",
      blockingInput: false,
      status: 'null',
      message: 'p declarado como nullptr - NO APUNTA A NADA'
    });
    setAttemptedDereference(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const cppCode = `#include <iostream>

int main() {
    int x = 42;
    
    // Declaramos un puntero nulo
    int* p = nullptr;  // C++11 forma moderna de null
    
    // VERIFICACIÓN CRÍTICA antes de desreferencia
    if (p != nullptr) {
        std::cout << "Valor: " << *p << std::endl;  // SEGURO
    } else {
        std::cout << "ERROR: p es nullptr!" << std::endl;
    }
    
    // ¡NUNCA HAGAS ESTO!
    // std::cout << *p << std::endl;  // UNDEFINED BEHAVIOR!
    
    // Asignación segura
    p = &x;
    
    // Ahora es seguro desreferenciar
    if (p != nullptr) {
        std::cout << "Valor seguro: " << *p << std::endl;
    }
    
    return 0;
}`;

  return (
    <LessonLayout
      title="nullptr y Chequeo de Desreferencia"
      subtitle="Entendiendo los peligros de nullptr y cómo manejarlos de forma segura"
      lessonNumber={2}
      difficulty="Beginner"
      estimatedTime={12}
      layoutType="two-panel"
    >
      <TheoryPanel topic="basic">
        
        <Section>
          <SectionTitle>🚨 Concepto Crítico de Seguridad</SectionTitle>
          <p>
            <strong>nullptr</strong> representa un puntero que explícitamente NO apunta a ningún objeto válido.
            Desreferenciar nullptr es <strong>Undefined Behavior (UB)</strong> y puede causar crashes.
          </p>
          
          <h4 style={{ color: '#ff6b6b', marginTop: '1rem' }}>⚠️ Reglas de Oro:</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>SIEMPRE</strong> verifica si p != nullptr antes de usar *p</li>
            <li><strong>NUNCA</strong> asumas que un puntero es válido</li>
            <li><strong>nullptr</strong> (C++11) es preferible sobre NULL o 0</li>
            <li>El compilador NO te protege de la desreferencia de nullptr</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 Código C++ - Patrón Seguro</SectionTitle>
          <CodeBlock
            language="cpp"
            title="Manejo Seguro de nullptr"
            copyable={true}
            showLineNumbers={true}
            highlightLines={[7, 14, 20]}
          >
            {cppCode}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Experimento Interactivo</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <InteractiveSection>
            <ButtonGroup orientation="horizontal" spacing="3">
              <Button 
                onClick={attemptDereference} 
                variant="danger"
                disabled={state.blockingInput}
              >
                {state.isNullPtr ? "💀 Intentar *p" : "✅ Desreferenciar *p"}
              </Button>
              <Button 
                onClick={assignToX} 
                variant="success"
                disabled={!state.isNullPtr}
              >
                p = &x
              </Button>
              <Button onClick={nextStep} variant="warning">
                Siguiente Paso
              </Button>
              <Button onClick={resetToNull}>
                Reset
              </Button>
            </ButtonGroup>
          </InteractiveSection>

          {attemptedDereference && state.isNullPtr && (
            <ErrorBox>
              🚨 CRASH SIMULADO: El programa se habría cerrado inesperadamente.
              En un programa real, esto causaría un segmentation fault.
            </ErrorBox>
          )}

          {state.status === 'assigned' && (
            <SuccessBox>
              ✅ TRANSICIÓN SEGURA: El puntero ahora apunta a un objeto válido.
              La desreferencia es segura.
            </SuccessBox>
          )}
        </Section>

        <Section>
          <SectionTitle>🔒 Técnicas de Prevención</SectionTitle>
          <h4 style={{ color: theme.colors.secondary[500] }}>1. Verificación Defensiva:</h4>
          <CodeBlock language="cpp" copyable={true}>{`if (ptr != nullptr) {
    // usar ptr de forma segura
    *ptr = value;
}`}</CodeBlock>

          <h4 style={{ color: theme.colors.secondary[500] }}>2. Smart Pointers (Moderno):</h4>
          <CodeBlock language="cpp" copyable={true}>{`std::unique_ptr<int> smart_ptr = std::make_unique<int>(42);
// Nunca es nullptr si se crea correctamente`}</CodeBlock>

          <h4 style={{ color: theme.colors.secondary[500] }}>3. Referencias cuando no hay nulabilidad:</h4>
          <CodeBlock language="cpp" copyable={true}>{`void process(int& value) {  // No puede ser null
    // value siempre es válido
}`}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>📚 Core Guidelines y Referencias</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li>
              <a href="https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Res-null" 
                 style={{ color: '#00d4ff' }} target="_blank" rel="noopener noreferrer">
                ES.65: Don't dereference an invalid pointer
              </a>
            </li>
            <li><strong>Modernidad:</strong> Prefiere referencias sobre punteros cuando la nulabilidad no es semánticamente válida</li>
            <li><strong>Herramientas:</strong> Usa static analyzers como clang-tidy, PVS-Studio</li>
            <li><strong>Runtime:</strong> AddressSanitizer detecta nullptr dereferences</li>
          </ul>
        </Section>
      </TheoryPanel>
      
      <VisualizationPanel topic="basic">
        <StatusDisplay>
          <div>🎯 Tarea 2: nullptr Safety</div>
          <div>📍 Paso: {currentStep + 1}/{steps.length}</div>
          <div>🔗 Estado: {state.status}</div>
          <div>🛡️ Bloqueado: {state.blockingInput ? 'SÍ' : 'NO'}</div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
          <Lesson02Scene state={state} />
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