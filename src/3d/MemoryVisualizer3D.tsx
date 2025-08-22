import { useRef, useMemo, useCallback, memo, Suspense } from 'react';
import type { RootState } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import { MemoryBlock3D, Pointer3D } from '../types';
import { useOptimizedAnimation, useAnimationFrame, usePerformanceAnimation } from '../hooks/useOptimizedAnimation';
import { useMemoryManagement, useMaterialSharing } from '../hooks/useMemoryManagement';
import * as THREE from 'three';

// Optimized memory block component with memoization
const MemoryBlock = memo(({ block, position }: { block: MemoryBlock3D; position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const phaseRef = useRef<number>(
    block.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 0.01
  );
  
  // Use memory management for automatic resource cleanup
  const { getCachedGeometry } = useMemoryManagement(`memory-block-${block.id}`);
  const { getSharedMaterial } = useMaterialSharing();

  // Use optimized animation system
  useOptimizedAnimation(
    `memory-block-${block.id}`,
    useCallback((state: RootState, _delta: number) => {
      if (meshRef.current) {
        // Optimized animation with delta time and reduced calculations
        const time = state.clock.elapsedTime;
        const phase = phaseRef.current;
        
        // Use delta for frame-rate independent animation
        meshRef.current.position.y = position[1] + Math.sin(time * 2 + phase) * 0.1;
        meshRef.current.rotation.y = Math.sin(time * 0.5 + phase) * 0.1;
      }
    }, [position]),
    1, // Medium priority
    [position]
  );

  // Cached geometry and materials for better performance
  const geometry = useMemo(() => 
    getCachedGeometry(`box-${block.size.join('-')}`, () => 
      new THREE.BoxGeometry(...block.size)
    ), [block.size, getCachedGeometry]
  );

  const material = useMemo(() => 
    getSharedMaterial(`block-material-${block.color}`, () => 
      new THREE.MeshStandardMaterial({
        color: block.color,
        transparent: true,
        opacity: 0.8,
        metalness: 0.2,
        roughness: 0.1
      })
    ), [block.color, getSharedMaterial]
  );

  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={geometry} material={material} />

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
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.block.color === nextProps.block.color &&
    prevProps.block.value === nextProps.block.value &&
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1] &&
    prevProps.position[2] === nextProps.position[2]
  );
});



// Optimized pointer component with better performance
const Pointer3DComponent = memo(({ pointer }: { pointer: Pointer3D }) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  // Use performance-aware animation for pointer effects
  usePerformanceAnimation(
    `pointer-${pointer.id}`,
    // High performance callback
    useCallback((state: RootState, _delta: number) => {
      if (!groupRef.current || !pointer.animated) return;
      
      const time = state.clock.elapsedTime;
      
      // Full animation with all effects
      groupRef.current.rotation.z = Math.sin(time * 2) * 0.1;
      groupRef.current.rotation.y = Math.sin(time * 1.5) * 0.05;

      if (materialRef.current) {
        materialRef.current.opacity = 0.7 + Math.sin(time * 3) * 0.3;
      }
    }, [pointer.animated]),
    // Medium performance callback
    useCallback((state: RootState, _delta: number) => {
      if (!groupRef.current || !pointer.animated) return;
      
      const time = state.clock.elapsedTime;
      
      // Reduced animation - only rotation
      groupRef.current.rotation.z = Math.sin(time * 2) * 0.1;
    }, [pointer.animated]),
    // Low performance callback
    useCallback((_state: RootState, _delta: number) => {
      // No animation for low performance
    }, []),
    2 // High priority for pointers
  );

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
}, (prevProps, nextProps) => {
  // Deep comparison for pointer equality
  return (
    prevProps.pointer.id === nextProps.pointer.id &&
    prevProps.pointer.color === nextProps.pointer.color &&
    prevProps.pointer.type === nextProps.pointer.type &&
    JSON.stringify(prevProps.pointer.start) === JSON.stringify(nextProps.pointer.start) &&
    JSON.stringify(prevProps.pointer.end) === JSON.stringify(nextProps.pointer.end)
  );
});

// Componente principal de visualización 3D
export function MemoryScene() {
  const { state } = useApp();
  
  // Initialize centralized animation manager
  useAnimationFrame();

  // Optimized memory blocks with better memoization and dependency tracking
  const memoryBlocks = useMemo(() => {
    const blocks: MemoryBlock3D[] = [];
    
    // Use more efficient block creation with type safety
    const createBlocks = (
      items: typeof state.memoryVisualization.stack,
      basePosition: [number, number, number],
      size: [number, number, number],
      color: string,
      type: 'stack' | 'heap' | 'global'
    ) => {
      return items.map((loc, index) => ({
        id: loc.id,
        position: [basePosition[0], basePosition[1] - index * 1.2, basePosition[2]] as [number, number, number],
        size,
        color,
        type,
        value: String(loc.value),
      }));
    };

    // Stack (izquierda) - Variables locales
    blocks.push(...createBlocks(
      state.memoryVisualization.stack,
      [-6, 2, 0],
      [1.5, 0.8, 0.8],
      '#00ff88',
      'stack'
    ));

    // Heap (centro) - Memoria dinámica
    blocks.push(...createBlocks(
      state.memoryVisualization.heap,
      [0, 2, 0],
      [2, 1, 1],
      '#ff6b6b',
      'heap'
    ));

    // Global (derecha) - Variables globales
    blocks.push(...createBlocks(
      state.memoryVisualization.global,
      [6, 2, 0],
      [1.2, 0.8, 0.8],
      '#ffa500',
      'global'
    ));

    return blocks;
  }, [state]);

  // Convertir punteros a punteros 3D with optimized lookup
  const pointer3D = useMemo(() => {
    // Create a lookup map for better performance
    const blockMap = new Map(memoryBlocks.map(block => [block.id, block]));
    
    return state.memoryVisualization.pointers.map((ptr) => {
      const targetBlock = ptr.targetId ? blockMap.get(ptr.targetId) : undefined;
      const startBlock = blockMap.get(ptr.id);

      return {
        id: ptr.id,
        start: startBlock ? startBlock.position : [0, 0, 0] as [number, number, number],
        end: targetBlock ? targetBlock.position : [0, 0, 0] as [number, number, number],
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

// Performance optimized loading component
const LoadingFallback = memo(() => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '600px',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 50%, #2a2a4a 100%)',
    color: '#00d4ff',
    fontSize: '18px'
  }}>
    🔄 Cargando visualización 3D...
  </div>
));

// Performance optimized Canvas configuration
const canvasProps = {
  camera: { position: [0, 5, 10] as [number, number, number], fov: 60 },
  style: { background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 50%, #2a2a4a 100%)' },
  // Performance optimizations
  dpr: [1, 2] as [number, number], // Limit device pixel ratio
  performance: {
    min: 0.5, // Minimum performance before degradation
    max: 1.0, // Maximum performance
    debounce: 200 // Debounce resize events
  },
  gl: {
    powerPreference: "high-performance" as const,
    antialias: false, // Disable for better performance
    alpha: false, // Disable transparency for better performance
    preserveDrawingBuffer: false
  }
};

// Componente principal exportado
export default function MemoryVisualizer3D() {
  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas {...canvasProps}>
          <MemoryScene />
        </Canvas>
      </Suspense>
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
