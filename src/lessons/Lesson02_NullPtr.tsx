import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import * as THREE from 'three';

const LessonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  gap: 1rem;
  padding: 1rem;
`;

const TheoryPanel = styled.div`
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  overflow-y: auto;
  backdrop-filter: blur(10px);
`;

const VisualizationPanel = styled.div`
  background: rgba(22, 33, 62, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  color: #00d4ff;
  font-size: 2rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px #00d4ff;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(0, 212, 255, 0.05);
  border-left: 3px solid #00d4ff;
  border-radius: 5px;
`;

const SectionTitle = styled.h3`
  color: #4ecdc4;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 8px;
  color: #f8f8f2;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Interactive = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1rem 0;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'warning' | 'success' }>`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: linear-gradient(45deg, #ff6b6b, #ff5252);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); }
        `;
      case 'warning':
        return `
          background: linear-gradient(45deg, #ffca28, #ffa000);
          color: #1a1a2e;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(255, 202, 40, 0.4); }
        `;
      case 'success':
        return `
          background: linear-gradient(45deg, #4caf50, #45a049);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4); }
        `;
      default:
        return `
          background: linear-gradient(45deg, #00d4ff, #4ecdc4);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4); }
        `;
    }
  }}
  
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  `}
`;

const ErrorBox = styled.div`
  background: rgba(255, 107, 107, 0.1);
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #ff6b6b;
  font-weight: bold;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const SuccessBox = styled.div`
  background: rgba(76, 175, 80, 0.1);
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #4caf50;
  font-weight: bold;
`;

const StatusDisplay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 8px;
  color: white;
  z-index: 100;
  font-family: monospace;
`;

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
    <LessonContainer>
      <TheoryPanel>
        <Title>Tarea 2: nullptr y Chequeo de Desreferencia</Title>
        
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
          <CodeBlock>{cppCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Experimento Interactivo</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <Interactive>
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
          </Interactive>

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
          <h4 style={{ color: '#4ecdc4' }}>1. Verificación Defensiva:</h4>
          <CodeBlock>{`if (ptr != nullptr) {
    // usar ptr de forma segura
    *ptr = value;
}`}</CodeBlock>

          <h4 style={{ color: '#4ecdc4' }}>2. Smart Pointers (Moderno):</h4>
          <CodeBlock>{`std::unique_ptr<int> smart_ptr = std::make_unique<int>(42);
// Nunca es nullptr si se crea correctamente`}</CodeBlock>

          <h4 style={{ color: '#4ecdc4' }}>3. Referencias cuando no hay nulabilidad:</h4>
          <CodeBlock>{`void process(int& value) {  // No puede ser null
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

      <VisualizationPanel>
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
    </LessonContainer>
  );
}