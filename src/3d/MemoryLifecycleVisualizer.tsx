import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Line, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// RAII Lifecycle States
export enum RAIIState {
  UNINITIALIZED = 'uninitialized',
  CONSTRUCTING = 'constructing',
  ALIVE = 'alive',
  DESTRUCTING = 'destructing',
  DESTROYED = 'destroyed'
}

// Memory Lifecycle Colors
const LIFECYCLE_COLORS = {
  uninitialized: '#424242',
  constructing: '#2196F3',
  alive: '#4CAF50',
  destructing: '#FF9800',
  destroyed: '#F44336',
  memory: {
    stack: '#00BCD4',
    heap: '#E91E63',
    allocated: '#4CAF50',
    deallocated: '#F44336'
  }
};

// Animated Memory Block with Lifecycle
export function LifecycleMemoryBlock({
  position = [0, 0, 0],
  size = [1, 1, 1],
  state = RAIIState.UNINITIALIZED,
  label = 'Object',
  animated = true,
  showParticles = true
}: {
  position?: [number, number, number];
  size?: [number, number, number];
  state?: RAIIState;
  label?: string;
  onStateChange?: (newState: RAIIState) => void;
  animated?: boolean;
  showParticles?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Generate particles for construction/destruction effects
  const particles = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }
    
    return { positions, colors };
  }, []);

  useFrame((frameState) => {
    if (!meshRef.current || !animated) return;
    
    const time = frameState.clock.elapsedTime;
    const mesh = meshRef.current;
    
    switch (state) {
      case RAIIState.CONSTRUCTING:
        // Growing animation during construction
        const constructProgress = Math.min((time % 2) / 2, 1);
        mesh.scale.setScalar(constructProgress);
        mesh.rotation.y = constructProgress * Math.PI * 2;
        break;
        
      case RAIIState.ALIVE:
        // Gentle breathing animation when alive
        const breathe = 1 + Math.sin(time * 2) * 0.05;
        mesh.scale.setScalar(breathe);
        mesh.rotation.y = Math.sin(time * 0.5) * 0.1;
        break;
        
      case RAIIState.DESTRUCTING:
        // Shrinking and fading during destruction
        const destructProgress = 1 - Math.min((time % 2) / 2, 1);
        mesh.scale.setScalar(destructProgress);
        mesh.rotation.y = time * 3;
        break;
        
      case RAIIState.DESTROYED:
        // Invisible when destroyed
        mesh.scale.setScalar(0.1);
        mesh.rotation.y = 0;
        break;
        
      default:
        // Uninitialized state
        mesh.scale.setScalar(0.3);
        mesh.rotation.y = 0;
    }
    
    // Animate particles during construction/destruction
    if (particlesRef.current && showParticles && 
        (state === RAIIState.CONSTRUCTING || state === RAIIState.DESTRUCTING)) {
      const positionAttribute = particlesRef.current.geometry.attributes.position;
      if (positionAttribute) {
        const positions = positionAttribute.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += (Math.random() - 0.5) * 0.02;
        }
        
        positionAttribute.needsUpdate = true;
      }
    }
  });

  const currentColor = LIFECYCLE_COLORS[state];

  return (
    <group position={position}>
      {/* Main memory block */}
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={currentColor}
          transparent
          opacity={state === RAIIState.DESTROYED ? 0.1 : 0.8}
          emissive={currentColor}
          emissiveIntensity={state === RAIIState.ALIVE ? 0.1 : 0.2}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      
      {/* Particle system for construction/destruction */}
      {showParticles && (state === RAIIState.CONSTRUCTING || state === RAIIState.DESTRUCTING) && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particles.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[particles.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            vertexColors
            transparent
            opacity={0.6}
          />
        </points>
      )}
      
      {/* State label */}
      <Text
        position={[0, size[1] / 2 + 0.5, 0]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {label}
      </Text>
      
      {/* Lifecycle state indicator */}
      <Text
        position={[0, -size[1] / 2 - 0.3, 0]}
        fontSize={0.15}
        color={currentColor}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {state.toUpperCase()}
      </Text>
    </group>
  );
}

// Stack Frame Visualization
export function StackFrameVisualization({
  position = [0, 0, 0],
  functions = ['main()', 'foo()', 'bar()'],
  currentFrame = 0,
  animated = true
}: {
  position?: [number, number, number];
  functions?: string[];
  currentFrame?: number;
  animated?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !animated) return;
    
    const time = state.clock.elapsedTime;
    // Gentle swaying motion for the stack
    groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
  });

  return (
    <group ref={groupRef} position={position}>
      {functions.map((func, index) => {
        const isActive = index === currentFrame;
        const yOffset = index * 1.2;
        
        return (
          <group key={index} position={[0, yOffset, 0]}>
            {/* Stack frame */}
            <Box args={[2, 1, 0.3]}>
              <meshStandardMaterial
                color={isActive ? LIFECYCLE_COLORS.alive : LIFECYCLE_COLORS.memory.stack}
                transparent
                opacity={isActive ? 0.9 : 0.6}
                emissive={isActive ? LIFECYCLE_COLORS.alive : '#000000'}
                emissiveIntensity={isActive ? 0.1 : 0}
              />
            </Box>
            
            {/* Function name */}
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.15}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              font="/fonts/FiraCode-Regular.woff"
            >
              {func}
            </Text>
            
            {/* Active frame indicator */}
            {isActive && (
              <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.1, 0.2, 8]} />
                <meshStandardMaterial
                  color={LIFECYCLE_COLORS.alive}
                  emissive={LIFECYCLE_COLORS.alive}
                  emissiveIntensity={0.3}
                />
              </mesh>
            )}
          </group>
        );
      })}
      
      {/* Stack label */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color={LIFECYCLE_COLORS.memory.stack}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        CALL STACK
      </Text>
    </group>
  );
}

// Heap Allocation Visualization
export function HeapVisualization({
  position = [0, 0, 0],
  allocations = [],
  animated = true,
  showFragmentation = false
}: {
  position?: [number, number, number];
  allocations?: Array<{
    id: string;
    size: number;
    allocated: boolean;
    color?: string;
  }>;
  animated?: boolean;
  showFragmentation?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !animated) return;
    
    const time = state.clock.elapsedTime;
    // Subtle floating animation
    groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.05;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Heap memory blocks */}
      {allocations.map((alloc, index) => {
        const blockPosition: [number, number, number] = [
          index * 1.5 - (allocations.length * 1.5) / 2,
          0,
          0
        ];
        
        return (
          <group key={alloc.id} position={blockPosition}>
            <Box args={[1.2, alloc.size * 0.5 + 0.5, 0.8]}>
              <meshStandardMaterial
                color={alloc.allocated ? 
                  (alloc.color || LIFECYCLE_COLORS.memory.allocated) : 
                  LIFECYCLE_COLORS.memory.deallocated}
                transparent
                opacity={alloc.allocated ? 0.8 : 0.3}
                emissive={alloc.allocated ? 
                  (alloc.color || LIFECYCLE_COLORS.memory.allocated) : 
                  '#000000'}
                emissiveIntensity={alloc.allocated ? 0.1 : 0}
              />
            </Box>
            
            {/* Allocation info */}
            <Text
              position={[0, (alloc.size * 0.5 + 0.5) / 2 + 0.3, 0]}
              fontSize={0.12}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              font="/fonts/FiraCode-Regular.woff"
            >
              {alloc.size} bytes
            </Text>
            
            <Text
              position={[0, -(alloc.size * 0.5 + 0.5) / 2 - 0.3, 0]}
              fontSize={0.1}
              color={alloc.allocated ? '#4CAF50' : '#F44336'}
              anchorX="center"
              anchorY="middle"
              font="/fonts/FiraCode-Regular.woff"
            >
              {alloc.allocated ? 'ALLOCATED' : 'FREE'}
            </Text>
          </group>
        );
      })}
      
      {/* Fragmentation indicator */}
      {showFragmentation && (
        <Text
          position={[0, -2, 0]}
          fontSize={0.15}
          color="#FF9800"
          anchorX="center"
          anchorY="middle"
          font="/fonts/FiraCode-Regular.woff"
        >
          FRAGMENTED HEAP
        </Text>
      )}
      
      {/* Heap label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.2}
        color={LIFECYCLE_COLORS.memory.heap}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        HEAP MEMORY
      </Text>
    </group>
  );
}

// Complete RAII Demonstration Scene
export function RAIILifecycleDemo({
  autoPlay = false,
  speed = 1,
  onStepChange
}: {
  autoPlay?: boolean;
  speed?: number;
  onStepChange?: (step: number, description: string) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [objectState, setObjectState] = useState(RAIIState.UNINITIALIZED);
  
  const steps = useMemo(() => [
    { state: RAIIState.UNINITIALIZED, description: 'Object not yet created' },
    { state: RAIIState.CONSTRUCTING, description: 'Constructor called - resources acquired' },
    { state: RAIIState.ALIVE, description: 'Object fully constructed and operational' },
    { state: RAIIState.DESTRUCTING, description: 'Destructor called - resources released' },
    { state: RAIIState.DESTROYED, description: 'Object destroyed - memory reclaimed' },
  ], []);

  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % steps.length;
        setObjectState(steps[next]?.state || RAIIState.UNINITIALIZED);
        onStepChange?.(next, steps[next]?.description || '');
        return next;
      });
    }, 3000 / speed);

    return () => clearInterval(interval);
  }, [autoPlay, speed, onStepChange, steps]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = (prev + 1) % steps.length;
      setObjectState(steps[next]?.state || RAIIState.UNINITIALIZED);
      onStepChange?.(next, steps[next]?.description || '');
      return next;
    });
  }, [onStepChange, steps]);

  return (
    <group>
      {/* RAII Object */}
      <LifecycleMemoryBlock
        position={[0, 0, 0]}
        size={[2, 2, 1]}
        state={objectState}
        label="RAII Object"
        animated={true}
        showParticles={true}
      />
      
      {/* Stack frame showing scope */}
      <StackFrameVisualization
        position={[-5, -1, 0]}
        functions={['main()', 'scope { ... }']}
        currentFrame={objectState === RAIIState.UNINITIALIZED || objectState === RAIIState.DESTROYED ? 0 : 1}
        animated={true}
      />
      
      {/* Resource representation */}
      <group position={[4, 0, 0]}>
        <Cylinder args={[0.5, 0.5, 1.5, 8]}>
          <meshStandardMaterial
            color={objectState === RAIIState.ALIVE ? '#4CAF50' : '#424242'}
            transparent
            opacity={objectState === RAIIState.ALIVE ? 0.8 : 0.3}
            emissive={objectState === RAIIState.ALIVE ? '#4CAF50' : '#000000'}
            emissiveIntensity={objectState === RAIIState.ALIVE ? 0.1 : 0}
          />
        </Cylinder>
        <Text
          position={[0, 1, 0]}
          fontSize={0.15}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          font="/fonts/FiraCode-Regular.woff"
        >
          Resource
        </Text>
      </group>
      
      {/* Acquisition/Release arrows */}
      {(objectState === RAIIState.CONSTRUCTING || objectState === RAIIState.DESTRUCTING) && (
        <Line
          points={[
            [1, 0, 0],
            [3, 0, 0]
          ]}
          color={objectState === RAIIState.CONSTRUCTING ? '#2196F3' : '#FF9800'}
          lineWidth={3}
        />
      )}
      
      {/* Control panel */}
      <Html position={[0, -4, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          textAlign: 'center',
          minWidth: '500px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h3 style={{ color: '#00D4FF', margin: '0 0 15px 0' }}>
            RAII Lifecycle Demonstration
          </h3>
          
          <div style={{ 
            background: 'rgba(0, 212, 255, 0.1)', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              Step {currentStep + 1} of {steps.length}
            </div>
            <div style={{ fontSize: '14px' }}>
              {steps[currentStep]?.description || ''}
            </div>
          </div>
          
          <button
            onClick={nextStep}
            style={{
              background: 'linear-gradient(45deg, #00D4FF, #4ECDC4)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Next Step
          </button>
          
          <div style={{ 
            marginTop: '15px', 
            fontSize: '12px', 
            color: '#B0B0B0',
            lineHeight: '1.4'
          }}>
            RAII ensures automatic resource management:<br/>
            <strong>Resource Acquisition Is Initialization</strong>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default RAIILifecycleDemo;