import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Line, Html, OrbitControls } from '@react-three/drei';
import { THREE } from '../utils/three';

// Tipos para el sistema automático
interface DemoStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  action: () => void;
}

interface AutoDemoProps {
  onStepChange?: (step: DemoStep) => void;
  autoPlay?: boolean;
  speed?: number;
}

// Componente de cámara automática
function AutoCamera({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Movimiento de cámara suave y automático
    const radius = 8;
    const height = 5 + Math.sin(time * 0.5) * 2;
    const angle = time * 0.3;

    camera.position.x = target[0] + Math.cos(angle) * radius;
    camera.position.z = target[2] + Math.sin(angle) * radius;
    camera.position.y = height;

    camera.lookAt(target[0], target[1], target[2]);
  });

  return null;
}

// Componente de puntero animado automáticamente
function AutoPointer({
  start,
  end,
  color,
  delay = 0,
  duration = 2
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  delay?: number;
  duration?: number;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const progressRef = useRef(0);

  useFrame((state) => {
    if (!lineRef.current) return;

    const elapsed = state.clock.elapsedTime - delay;
    if (elapsed < 0) return;

    const progress = Math.min((elapsed % duration) / duration, 1);
    progressRef.current = progress;

    // Interpolación de posición
    const currentEnd: [number, number, number] = [
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress,
      start[2] + (end[2] - start[2]) * progress,
    ];

    // Actualizar geometría de la línea
    const geometry = lineRef.current.geometry;
    const positions = new Float32Array([
      start[0], start[1], start[2],
      currentEnd[0], currentEnd[1], currentEnd[2]
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    posAttr.needsUpdate = true;

    // Efecto de pulso
    const material = lineRef.current.material as THREE.LineBasicMaterial;
    material.opacity = 0.5 + Math.sin(progress * Math.PI * 4) * 0.3;
  });

  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={2}
    />
  );
}

// Componente de bloque de memoria animado
function AutoMemoryBlock({
  position,
  size,
  color,
  value,
  delay = 0
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  value?: string;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const elapsed = state.clock.elapsedTime - delay;
    if (elapsed < 0) return;

    // Animación de aparición
    const appearProgress = Math.min(elapsed / 1, 1);
    meshRef.current.scale.setScalar(appearProgress);

    // Animación de flotación
    const floatProgress = Math.sin(state.clock.elapsedTime * 2 + delay) * 0.2;
    meshRef.current.position.y = position[1] + floatProgress;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.9}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {value && (
        <Text
          position={[0, size[1] / 2 + 0.3, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {value}
        </Text>
      )}
    </group>
  );
}

// Componente principal de demostración automática
function AutoDemoScene({
  currentStep,
  onStepChange,
  autoPlay
}: {
  currentStep: number;
  onStepChange?: (step: DemoStep) => void;
  autoPlay?: boolean;
}) {
  const demoSteps: DemoStep[] = useMemo(() => [
    {
      id: 'intro',
      title: 'Introducción a los Punteros',
      description: 'Los punteros son variables que almacenan direcciones de memoria',
      duration: 3,
      action: () => { /* Mostrando introducción */ }
    },
    {
      id: 'memory_layout',
      title: 'Layout de Memoria',
      description: 'La memoria se divide en Stack, Heap y Global',
      duration: 4,
      action: () => { /* Mostrando layout de memoria */ }
    },
    {
      id: 'basic_pointer',
      title: 'Puntero Básico',
      description: 'Un puntero almacena la dirección de otra variable',
      duration: 5,
      action: () => { /* Mostrando puntero básico */ }
    },
    {
      id: 'dereference',
      title: 'Dereferencia',
      description: 'Usamos * para acceder al valor apuntado por el puntero',
      duration: 4,
      action: () => { /* Mostrando dereferencia */ }
    },
    {
      id: 'null_pointer',
      title: 'Puntero Nulo',
      description: 'nullptr representa que el puntero no apunta a nada',
      duration: 3,
      action: () => { /* Mostrando puntero nulo */ }
    }
  ], []);

  const currentDemoStep = demoSteps[currentStep % demoSteps.length] || demoSteps[0];

  // Cambiar paso automáticamente
  useEffect(() => {
    if (!onStepChange || !autoPlay) return;
    
    const interval = setInterval(() => {
      const nextStep = (currentStep + 1) % demoSteps.length;
      const next = demoSteps[nextStep];
      if (next) onStepChange(next);
    }, (currentDemoStep?.duration || 3) * 1000);

    return () => clearInterval(interval);
  }, [currentStep, demoSteps, currentDemoStep?.duration, onStepChange, autoPlay]);

  return (
    <>
      {/* Iluminación */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} />

      {/* Cámara automática */}
      <AutoCamera target={[0, 0, 0]} />

      {/* Controles manuales opcionales */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Elementos de demostración automática */}
      <AutoMemoryBlock
        position={[-3, 0, 0]}
        size={[1, 1, 1]}
        color="#4ecdc4"
        value="Stack"
        delay={0}
      />

      <AutoMemoryBlock
        position={[3, 0, 0]}
        size={[1, 1, 1]}
        color="#ff6b6b"
        value="Heap"
        delay={1}
      />

      <AutoMemoryBlock
        position={[0, 2, 0]}
        size={[1, 1, 1]}
        color="#ffa500"
        value="Global"
        delay={2}
      />

      {/* Punteros animados automáticamente */}
      <AutoPointer
        start={[-3, 0, 0]}
        end={[3, 0, 0]}
        color="#00d4ff"
        delay={3}
        duration={3}
      />

      {/* Información del paso actual */}
      <Html position={[0, -3, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <h3 style={{ color: '#00d4ff', marginBottom: '10px' }}>
            {currentDemoStep?.title || 'Demo Step'}
          </h3>
          <p style={{ margin: 0 }}>
            {currentDemoStep?.description || 'Demo description'}
          </p>
        </div>
      </Html>
    </>
  );
}

// Componente principal exportado
export default function Auto3DDemo({
  onStepChange,
  autoPlay = true,
  speed = 1
}: AutoDemoProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleStepChange = (step: DemoStep) => {
    setCurrentStep(prev => prev + 1);
    onStepChange?.(step);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)'
    }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <AutoDemoScene
          currentStep={currentStep}
          onStepChange={handleStepChange}
          autoPlay={autoPlay}
        />
      </Canvas>

      {/* Controles de velocidad */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        padding: '15px',
        borderRadius: '10px',
        color: 'white'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Velocidad: {speed}x</label>
        </div>
        <button
          style={{
            background: '#00d4ff',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}
          onClick={() => setCurrentStep(prev => prev + 1)}
        >
          Siguiente Paso
        </button>
      </div>
    </div>
  );
}
