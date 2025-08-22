import React, { useState, useEffect, useRef, memo } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

interface AnimationSequence {
  id: string;
  name: string;
  description: string;
  steps: AnimationStep[];
}

interface AnimationStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  elements: AnimationElement[];
}

interface AnimationElement {
  id: string;
  type: 'variable' | 'pointer' | 'arrow' | 'text' | 'highlight';
  position: [number, number, number];
  target?: [number, number, number];
  color: string;
  content: string;
  animation?: 'fadeIn' | 'move' | 'pulse' | 'scale' | 'rotate';
  delay?: number;
}

interface EducationalAnimationsProps {
  animationId: string;
  autoPlay?: boolean;
  speed?: number;
  onComplete?: () => void;
}

// Contenedor principal
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
`;

const InfoPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 10px;
  max-width: 300px;
  z-index: 100;
`;

const Title = styled.h3`
  color: #00d4ff;
  margin-bottom: 10px;
`;

const Description = styled.p`
  color: #b8c5d6;
  margin-bottom: 15px;
  line-height: 1.5;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #00d4ff, #00ff88);
  transition: width 0.1s linear;
`;

// Optimized variable component with memoization
const AnimatedVariable = memo(({
  position,
  color,
  content,
  animation = 'fadeIn',
  delay = 0
}: {
  position: [number, number, number];
  color: string;
  content: string;
  animation?: string;
  delay?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const startTimeRef = useRef<number>(0);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current - delay;
    if (elapsed < 0) return;

    // Optimized animation with fewer calculations
    switch (animation) {
      case 'fadeIn': {
        const opacity = Math.min(elapsed, 1);
        materialRef.current.opacity = opacity;
        break;
      }
      case 'pulse': {
        const pulse = 0.8 + Math.sin(elapsed * 4) * 0.2;
        meshRef.current.scale.setScalar(pulse);
        break;
      }
      case 'float': {
        const float = Math.sin(elapsed * 2) * 0.1;
        meshRef.current.position.y = position[1] + float;
        break;
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 0.8, 0.5]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          transparent
          opacity={1}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
      <Text
        position={[0, 0, 0.3]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {content}
      </Text>
    </group>
  );
});

// Componente de puntero animado
function AnimatedPointer({
  start,
  end,
  color,
  animation = 'move',
  delay = 0
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  animation?: string;
  delay?: number;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const arrowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!lineRef.current || !arrowRef.current) return;

    const elapsed = state.clock.elapsedTime - delay;
    if (elapsed < 0) return;

    let progress = Math.min(elapsed / 2, 1);

    if (animation === 'pulse') {
      progress = (Math.sin(elapsed * 4) + 1) / 2;
    }

    // Interpolar posición
    const currentEnd: [number, number, number] = [
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress,
      start[2] + (end[2] - start[2]) * progress,
    ];

    // Actualizar línea
    const geometry = lineRef.current.geometry;
    const positions = new Float32Array([
      start[0], start[1], start[2],
      currentEnd[0], currentEnd[1], currentEnd[2]
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    posAttr.needsUpdate = true;

    // Actualizar flecha
    arrowRef.current.position.set(currentEnd[0], currentEnd[1], currentEnd[2]);

    // Calcular rotación de la flecha
    const direction = new THREE.Vector3(
      currentEnd[0] - start[0],
      currentEnd[1] - start[1],
      currentEnd[2] - start[2]
    );
    const angle = Math.atan2(direction.x, direction.z);
    arrowRef.current.rotation.y = angle;
  });

  return (
    <group>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={2}
        transparent
        opacity={0.8}
      />
      <mesh ref={arrowRef} position={end}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Componente de highlight animado
function AnimatedHighlight({
  position,
  size,
  color,
  delay = 0
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const elapsed = state.clock.elapsedTime - delay;
    if (elapsed < 0) return;

    const opacity = 0.3 + Math.sin(elapsed * 6) * 0.2;
    (meshRef.current.material as THREE.MeshStandardMaterial).opacity = opacity;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.5}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// Definir secuencias de animación
const animationSequences: Record<string, AnimationSequence> = {
  basic_pointer: {
    id: 'basic_pointer',
    name: 'Puntero Básico',
    description: 'Animación que muestra cómo funciona un puntero básico',
    steps: [
      {
        id: 'step1',
        title: 'Crear Variable',
        description: 'Primero creamos una variable normal',
        duration: 3,
        elements: [
          {
            id: 'var_x',
            type: 'variable',
            position: [-2, 0, 0],
            color: '#4ecdc4',
            content: 'x = 42',
            animation: 'fadeIn'
          }
        ]
      },
      {
        id: 'step2',
        title: 'Crear Puntero',
        description: 'Ahora creamos un puntero que apunta a la variable',
        duration: 4,
        elements: [
          {
            id: 'var_x',
            type: 'variable',
            position: [-2, 0, 0],
            color: '#4ecdc4',
            content: 'x = 42',
            animation: 'pulse'
          },
          {
            id: 'ptr',
            type: 'pointer',
            position: [2, 1, 0],
            target: [-2, 0, 0],
            color: '#00d4ff',
            content: 'ptr',
            animation: 'fadeIn',
            delay: 1
          }
        ]
      },
      {
        id: 'step3',
        title: 'Usar Puntero',
        description: 'El puntero almacena la dirección de x',
        duration: 3,
        elements: [
          {
            id: 'var_x',
            type: 'variable',
            position: [-2, 0, 0],
            color: '#4ecdc4',
            content: 'x = 42',
            animation: 'fadeIn'
          },
          {
            id: 'ptr',
            type: 'pointer',
            position: [2, 1, 0],
            target: [-2, 0, 0],
            color: '#00d4ff',
            content: 'ptr',
            animation: 'pulse'
          },
          {
            id: 'highlight',
            type: 'highlight',
            position: [-2, 0, 0],
            color: '#00ff88',
            content: '',
            delay: 1
          }
        ]
      }
    ]
  }
};

// Escena principal de animación
function AnimationScene({
  sequence,
  currentStep,
  onStepComplete
}: {
  sequence: AnimationSequence;
  currentStep: number;
  onStepComplete: () => void;
}) {
  const step = sequence.steps[currentStep];
  const { camera } = useThree();

  // Animar cámara automáticamente
  useFrame(() => {
    camera.position.lerp(new THREE.Vector3(0, 5, 8), 0.02);
    camera.lookAt(0, 0, 0);
  });

  // Avanzar automáticamente al siguiente paso
  useEffect(() => {
    if (!step) return;

    const timer = setTimeout(() => {
      onStepComplete();
    }, step.duration * 1000);

    return () => clearTimeout(timer);
  }, [step, onStepComplete]);

  if (!step) return null;

  return (
    <>
      {/* Iluminación */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} />

      {/* Renderizar elementos de la animación */}
      {step.elements.map((element) => {
        switch (element.type) {
          case 'variable':
            return (
              <AnimatedVariable
                key={element.id}
                position={element.position}
                color={element.color}
                content={element.content}
                animation={element.animation}
                delay={element.delay}
              />
            );
          case 'pointer':
            return (
              <AnimatedPointer
                key={element.id}
                start={element.position}
                end={element.target || element.position}
                color={element.color}
                animation={element.animation}
                delay={element.delay}
              />
            );
          case 'highlight':
            return (
              <AnimatedHighlight
                key={element.id}
                position={element.position}
                size={[1.8, 1, 0.6]}
                color={element.color}
                delay={element.delay}
              />
            );
          default:
            return null;
        }
      })}

      {/* Información del paso actual */}
      <Html position={[0, -3, 0]}>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          minWidth: '400px'
        }}>
          <h3 style={{ color: '#00d4ff', marginBottom: '10px' }}>
            {step.title}
          </h3>
          <p style={{ margin: 0 }}>
            {step.description}
          </p>
        </div>
      </Html>
    </>
  );
}

export default function EducationalAnimations({
  animationId,
  autoPlay = true,
  speed: _speed = 1,
  onComplete
}: EducationalAnimationsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const sequence = animationSequences[animationId];

  useEffect(() => {
    if (!sequence || !autoPlay) return;

    let stepStartTime = Date.now();
    const stepDuration = sequence.steps[currentStep]?.duration || 3;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - stepStartTime) / 1000;
      const newProgress = Math.min((elapsed / stepDuration) * 100, 100);
      setProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [sequence, currentStep, autoPlay]);

  const handleStepComplete = () => {
    if (!sequence) return;

    if (currentStep < sequence.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(0);
    } else {
      onComplete?.();
    }
  };

  if (!sequence) {
    return (
      <Container>
        <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '50px' }}>
          Animación no encontrada: {animationId}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <InfoPanel>
        <Title>{sequence.name}</Title>
        <Description>{sequence.description}</Description>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
        <div style={{ color: '#b8c5d6', marginTop: '10px' }}>
          Paso {currentStep + 1} de {sequence.steps.length}
        </div>
      </InfoPanel>

      <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
        <AnimationScene
          sequence={sequence}
          currentStep={currentStep}
          onStepComplete={handleStepComplete}
        />
      </Canvas>
    </Container>
  );
}
