import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import { MemoryBlock3D, Pointer3D } from '../types';
import * as THREE from 'three';

// Componente para representar un bloque de memoria en 3D
function MemoryBlock({ block, position }: { block: MemoryBlock3D; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Animación sutil de flotación con fase única por bloque
      const phase = block.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + phase) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + phase) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={block.size} />
        <meshStandardMaterial
          color={block.color}
          transparent
          opacity={0.8}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>

      {/* Etiqueta con el valor */}
      {block.value && (
        <Text
          position={[0, block.size[1] / 2 + 0.5, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {block.value}
        </Text>
      )}

      {/* Etiqueta con el tipo */}
      <Text
        position={[0, -block.size[1] / 2 - 0.5, 0]}
        fontSize={0.3}
        color="lightblue"
        anchorX="center"
        anchorY="middle"
      >
        {block.type?.toUpperCase()}
      </Text>

      {/* Efecto de brillo para bloques activos */}
      <pointLight
        position={[0, 0, 2]}
        intensity={0.3}
        color={block.color}
        distance={3}
      />
    </group>
  );
}



// Componente para renderizar punteros 3D
function Pointer3DComponent({ pointer }: { pointer: Pointer3D }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && pointer.animated) {
      // Animación sutil de rotación y balanceo
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;

      // Animación de intensidad del color
      const intensity = 0.7 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.LineBasicMaterial) {
          child.material.opacity = intensity;
        }
      });
    }
  });

  // Calcular puntos intermedios para curva más natural
  const midPoint: [number, number, number] = [
    (pointer.start[0] + pointer.end[0]) / 2 + (pointer.end[1] - pointer.start[1]) * 0.3,
    (pointer.start[1] + pointer.end[1]) / 2 + (pointer.start[0] - pointer.end[0]) * 0.3,
    (pointer.start[2] + pointer.end[2]) / 2,
  ];

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...pointer.start),
    new THREE.Vector3(...midPoint),
    new THREE.Vector3(...pointer.end)
  );

  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group ref={groupRef}>
      {/* Línea curva del puntero */}
      <line>
        <primitive object={geometry} attach="geometry" />
        <lineBasicMaterial
          color={pointer.color}
          transparent
          opacity={0.8}
          linewidth={2}
        />
      </line>

      {/* Cabeza de la flecha */}
      <mesh position={pointer.end}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial
          color={pointer.color}
          transparent
          opacity={0.9}
          emissive={pointer.color}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Efecto de brillo en la flecha */}
      <mesh position={pointer.end}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0.6}
          emissive="white"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Etiqueta del puntero */}
      <Text
        position={[
          (pointer.start[0] + pointer.end[0]) / 2,
          (pointer.start[1] + pointer.end[1]) / 2 + 0.3,
          (pointer.start[2] + pointer.end[2]) / 2,
        ]}
        fontSize={0.25}
        color={pointer.color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {pointer.type.toUpperCase()}
      </Text>

      {/* Partículas de energía */}
      {pointer.animated && (
        <mesh position={[
          (pointer.start[0] + pointer.end[0]) / 2,
          (pointer.start[1] + pointer.end[1]) / 2,
          (pointer.start[2] + pointer.end[2]) / 2,
        ]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial
            color={pointer.color}
            transparent
            opacity={0.4}
            emissive={pointer.color}
            emissiveIntensity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

// Componente principal de visualización 3D
function MemoryScene() {
  const { state } = useApp();

  // Convertir datos de memoria a bloques 3D
  const memoryBlocks = useMemo(() => {
    const blocks: MemoryBlock3D[] = [];

    // Stack (izquierda) - Variables locales
    state.memoryVisualization.stack.forEach((loc, index) => {
      blocks.push({
        id: loc.id,
        position: [-6, 2 - index * 1.2, 0],
        size: [1.5, 0.8, 0.8],
        color: '#00ff88',
        type: 'stack',
        value: String(loc.value),
      });
    });

    // Heap (centro) - Memoria dinámica
    state.memoryVisualization.heap.forEach((loc, index) => {
      blocks.push({
        id: loc.id,
        position: [0, 2 - index * 1.2, 0],
        size: [2, 1, 1],
        color: '#ff6b6b',
        type: 'heap',
        value: String(loc.value),
      });
    });

    // Global (derecha) - Variables globales
    state.memoryVisualization.global.forEach((loc, index) => {
      blocks.push({
        id: loc.id,
        position: [6, 2 - index * 1.2, 0],
        size: [1.2, 0.8, 0.8],
        color: '#ff6b6b',
        type: 'global',
        value: String(loc.value),
      });
    });

    return blocks;
  }, [state.memoryVisualization]);

  // Convertir punteros a punteros 3D
  const pointer3D = useMemo(() => {
    return state.memoryVisualization.pointers.map((ptr) => {
      const targetBlock = memoryBlocks.find(b => b.id === ptr.targetId);
      const startBlock = memoryBlocks.find(b => b.id === ptr.id);

      return {
        id: ptr.id,
        start: startBlock ? startBlock.position : [0, 0, 0],
        end: targetBlock ? targetBlock.position : [0, 0, 0],
        color: ptr.color,
        type: ptr.type,
        animated: true,
      } as Pointer3D;
    });
  }, [state.memoryVisualization.pointers, memoryBlocks]);

  return (
    <>
      {/* Iluminación avanzada */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, 5, 10]} intensity={0.6} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ff6b6b" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={0.1}
        intensity={0.5}
        color="#ffffff"
        castShadow
      />

      {/* Fondo estelar sutil */}
      <mesh position={[0, 0, -20]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#000011" transparent opacity={0.8} />
      </mesh>

      {/* Controles de cámara */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={50}
      />

      {/* Plano base */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.8} />
      </mesh>

      {/* Etiquetas de secciones */}
      <Text position={[-5, 5, 0]} fontSize={0.8} color="cyan">
        STACK
      </Text>
      <Text position={[0, 5, 0]} fontSize={0.8} color="yellow">
        HEAP
      </Text>
      <Text position={[5, 5, 0]} fontSize={0.8} color="magenta">
        GLOBAL
      </Text>

      {/* Renderizar bloques de memoria */}
      {memoryBlocks.map((block) => (
        <MemoryBlock key={block.id} block={block} position={block.position} />
      ))}

      {/* Renderizar punteros */}
      {pointer3D.map((ptr) => (
        <Pointer3DComponent key={ptr.id} pointer={ptr} />
      ))}

      {/* Efectos visuales adicionales */}
      {/* Líneas de referencia del sistema de memoria */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            args={[new Float32Array([-10, 0, 0, 10, 0, 0]), 3]}
            attach="attributes-position"
          />
        </bufferGeometry>
        <lineBasicMaterial color="#444444" opacity={0.3} transparent />
      </line>

      {/* Líneas de separación de memoria */}
      <line>
        <bufferGeometry>
          <bufferAttribute args={[new Float32Array([-3, -2, 0, -3, 4, 0]), 3]} attach="attributes-position" />
        </bufferGeometry>
        <lineBasicMaterial color="#00ff88" opacity={0.5} transparent />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute args={[new Float32Array([3, -2, 0, 3, 4, 0]), 3]} attach="attributes-position" />
        </bufferGeometry>
        <lineBasicMaterial color="#ff6b6b" opacity={0.5} transparent />
      </line>

      {/* Información de debug mejorada */}
      <Html position={[-8, 8, 0]} style={{ color: 'white', fontSize: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(0,212,255,0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0,212,255,0.2)'
        }}>
          <h4 style={{ color: '#00d4ff', margin: '0 0 10px 0', textAlign: 'center' }}>🧠 Sistema de Memoria 3D</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <p style={{ margin: '5px 0', color: '#00ff88', fontWeight: 'bold' }}>📚 Stack</p>
              <p style={{ margin: '5px 0', fontSize: '11px', color: '#00ff88' }}>{state.memoryVisualization.stack.length} variables</p>
            </div>
            <div>
              <p style={{ margin: '5px 0', color: '#ff6b6b', fontWeight: 'bold' }}>🔥 Heap</p>
              <p style={{ margin: '5px 0', fontSize: '11px', color: '#ff6b6b' }}>{state.memoryVisualization.heap.length} objetos</p>
            </div>
            <div>
              <p style={{ margin: '5px 0', color: '#ff6b6b', fontWeight: 'bold' }}>🌐 Global</p>
              <p style={{ margin: '5px 0', fontSize: '11px', color: '#ff6b6b' }}>{state.memoryVisualization.global.length} datos</p>
            </div>
            <div>
              <p style={{ margin: '5px 0', color: '#00d4ff', fontWeight: 'bold' }}>➡️ Punteros</p>
              <p style={{ margin: '5px 0', fontSize: '11px', color: '#00d4ff' }}>{state.memoryVisualization.pointers.length} conexiones</p>
            </div>
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '10px', color: '#888', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
            🖱️ Interactúa • 📏 Zoom • 🎯 Explora
          </p>
        </div>
      </Html>
    </>
  );
}

// Componente principal exportado
export default function MemoryVisualizer3D() {
  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 50%, #2a2a4a 100%)' }}
      >
        <MemoryScene />
      </Canvas>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        fontSize: '12px',
        background: 'rgba(0,0,0,0.7)',
        padding: '5px 10px',
        borderRadius: '5px',
        fontFamily: 'monospace'
      }}>
        🖱️ Click y arrastra para rotar • 📏 Rueda para zoom
      </div>
    </div>
  );
}
