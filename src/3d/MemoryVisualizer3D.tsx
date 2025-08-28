import { useRef, useMemo, useCallback, memo, Suspense } from 'react';
import type { RootState } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { MemoryBlock3D, Pointer3D } from '../types';
import { useOptimizedAnimation, useAnimationFrame, usePerformanceAnimation } from '../hooks/useOptimizedAnimation';
import { useMemoryManagement, useMaterialSharing } from '../hooks/useMemoryManagement';
import { get3DLabel, get3DMessage } from "../translations/3d-visualization.es";
import { THREE } from '../utils/three';

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



// Advanced Dangling Pointer Detection Component
const DanglingPointerWarning = memo(({ position, isActive }: {
  position: [number, number, number];
  isActive: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useOptimizedAnimation(
    `dangling-warning-${position.join('-')}`,
    useCallback((state) => {
      if (!meshRef.current || !isActive) return;
      
      const time = state.clock.elapsedTime;
      const flash = Math.sin(time * 8) * 0.5 + 0.5;
      
      if ('opacity' in meshRef.current.material) {
        (meshRef.current.material as any).opacity = flash * 0.8 + 0.2;
      }
      meshRef.current.rotation.z = time * 2;
    }, [isActive]),
    2, // High priority for warnings
    [position, isActive]
  );
  
  if (!isActive) return null;
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <ringGeometry args={[0.3, 0.5, 8]} />
        <meshStandardMaterial
          color="#FF5252"
          transparent
          emissive="#FF5252"
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        ⚠
      </Text>
      <Html position={[0, -0.8, 0]} center>
        <div style={{
          background: 'rgba(255, 82, 82, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 'bold',
          textAlign: 'center',
          border: '1px solid #FF1744'
        }}>
          {get3DMessage('danglingPointer')}
        </div>
      </Html>
    </group>
  );
});

// Memory Leak Detection Component
const MemoryLeakIndicator = memo(({ position, severity }: {
  position: [number, number, number];
  severity: 'low' | 'medium' | 'high';
}) => {
  const particlesRef = useRef<THREE.Group>(null);
  
  const colors = {
    low: '#FFC107',
    medium: '#FF9800',
    high: '#FF5252'
  };
  
  const particleCount = {
    low: 3,
    medium: 6,
    high: 10
  };
  
  useOptimizedAnimation(
    `leak-indicator-${position.join('-')}`,
    useCallback((state) => {
      if (!particlesRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      particlesRef.current.children.forEach((particle, index) => {
        const offset = index * 0.5;
        particle.position.y = Math.sin(time * 2 + offset) * 0.2;
        particle.rotation.y = time + offset;
      });
    }, []),
    1, // Medium priority
    [position, severity]
  );
  
  return (
    <group position={position}>
      <group ref={particlesRef}>
        {Array.from({ length: particleCount[severity] }).map((_, i) => {
          const angle = (i * Math.PI * 2) / particleCount[severity];
          const radius = 0.4;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
              ]}
            >
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshStandardMaterial
                color={colors[severity]}
                emissive={colors[severity]}
                emissiveIntensity={0.6}
              />
            </mesh>
          );
        })}
      </group>
      
      <Html position={[0, -0.6, 0]} center>
        <div style={{
          background: `rgba(${severity === 'high' ? '255,82,82' : severity === 'medium' ? '255,152,0' : '255,193,7'}, 0.9)`,
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '8px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {severity.toUpperCase()} LEAK
        </div>
      </Html>
    </group>
  );
});

// Enhanced Memory Region Visualization
const MemoryRegion = memo(({ type, position, blocks, showBoundaries = true }: {
  type: 'stack' | 'heap' | 'global';
  position: [number, number, number];
  blocks: MemoryBlock3D[];
  showBoundaries?: boolean;
}) => {
  const regionRef = useRef<THREE.Group>(null);
  
  const regionColors = {
    stack: { primary: '#00FF88', secondary: 'rgba(0, 255, 136, 0.1)', border: '#00FF88' },
    heap: { primary: '#FF6B6B', secondary: 'rgba(255, 107, 107, 0.1)', border: '#FF6B6B' },
    global: { primary: '#FFA500', secondary: 'rgba(255, 165, 0, 0.1)', border: '#FFA500' }
  };
  
  const colors = regionColors[type];
  
  return (
    <group ref={regionRef} position={position}>
      {/* Region boundary */}
      {showBoundaries && (
        <mesh position={[0, 0, -0.5]}>
          <planeGeometry args={[4, 6]} />
          <meshStandardMaterial
            color={colors.secondary}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Region border */}
      {showBoundaries && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              args={[new Float32Array([
                -2, -3, 0, 2, -3, 0,
                2, -3, 0, 2, 3, 0,
                2, 3, 0, -2, 3, 0,
                -2, 3, 0, -2, -3, 0
              ]), 3]}
              attach="attributes-position"
            />
          </bufferGeometry>
          <lineBasicMaterial color={colors.border} linewidth={2} />
        </line>
      )}
      
      {/* Memory growth direction indicator for stack */}
      {type === 'stack' && (
        <group position={[-1.5, 2.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color={colors.primary}
            anchorX="center"
            anchorY="middle"
            font="/fonts/FiraCode-Regular.woff"
          >
            ↓ GROWS DOWN
          </Text>
        </group>
      )}
      
      {/* Dynamic allocation indicator for heap */}
      {type === 'heap' && (
        <group position={[1.5, 2.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color={colors.primary}
            anchorX="center"
            anchorY="middle"
            font="/fonts/FiraCode-Regular.woff"
          >
            🔄 DYNAMIC
          </Text>
        </group>
      )}
      
      {/* Memory blocks within this region */}
      {blocks.map((block) => (
        <MemoryBlock 
          key={block.id} 
          block={block} 
          position={[
            block.position[0] - position[0],
            block.position[1] - position[1], 
            block.position[2] - position[2]
          ]} 
        />
      ))}
    </group>
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

// Advanced Memory Analysis Component
const MemoryAnalytics = memo(({ memoryBlocks, pointers }: {
  memoryBlocks: MemoryBlock3D[];
  pointers: Pointer3D[];
}) => {
  const analytics = useMemo(() => {
    const stackBlocks = memoryBlocks.filter(b => b.type === 'stack');
    const heapBlocks = memoryBlocks.filter(b => b.type === 'heap');
    const globalBlocks = memoryBlocks.filter(b => b.type === 'global');
    
    // Detect potential issues
    const danglingPointers = pointers.filter(p => {
      const targetExists = memoryBlocks.some(b => b.id === p.id);
      return !targetExists;
    });
    
    const memoryLeaks = heapBlocks.filter(block => {
      const hasPointer = pointers.some(p => p.start.toString() === block.position.toString());
      return !hasPointer;
    });
    
    return {
      stackUsage: stackBlocks.length,
      heapUsage: heapBlocks.length,
      globalUsage: globalBlocks.length,
      totalPointers: pointers.length,
      danglingCount: danglingPointers.length,
      leakCount: memoryLeaks.length,
      memoryEfficiency: Math.max(0, 100 - (memoryLeaks.length * 20) - (danglingPointers.length * 15))
    };
  }, [memoryBlocks, pointers]);
  
  return (
    <Html position={[8, 8, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))',
        padding: '15px',
        borderRadius: '12px',
        border: `2px solid ${analytics.memoryEfficiency > 80 ? '#4CAF50' : analytics.memoryEfficiency > 60 ? '#FF9800' : '#F44336'}`,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 25px rgba(0,212,255,0.3)',
        minWidth: '200px',
        color: 'white',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <h4 style={{ color: '#00D4FF', margin: '0 0 10px 0', textAlign: 'center' }}>
          🧠 Memory Analytics
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <div style={{ color: '#00FF88', fontWeight: 'bold' }}>Stack: {analytics.stackUsage}</div>
            <div style={{ color: '#FF6B6B', fontWeight: 'bold' }}>Heap: {analytics.heapUsage}</div>
            <div style={{ color: '#FFA500', fontWeight: 'bold' }}>Global: {analytics.globalUsage}</div>
          </div>
          <div>
            <div style={{ color: '#00D4FF', fontWeight: 'bold' }}>Ptrs: {analytics.totalPointers}</div>
            <div style={{ color: '#FF5252', fontWeight: 'bold' }}>Leaks: {analytics.leakCount}</div>
            <div style={{ color: '#FF9800', fontWeight: 'bold' }}>Dangling: {analytics.danglingCount}</div>
          </div>
        </div>
        
        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.2)', 
          paddingTop: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: '#999' }}>Memory Efficiency</div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: analytics.memoryEfficiency > 80 ? '#4CAF50' : analytics.memoryEfficiency > 60 ? '#FF9800' : '#F44336'
          }}>
            {analytics.memoryEfficiency}%
          </div>
        </div>
        
        {analytics.leakCount > 0 && (
          <div style={{
            marginTop: '8px',
            padding: '4px 8px',
            background: 'rgba(244, 67, 54, 0.2)',
            borderRadius: '4px',
            fontSize: '10px',
            textAlign: 'center',
            border: '1px solid #F44336'
          }}>
            ⚠️ Memory leaks detected!
          </div>
        )}
      </div>
    </Html>
  );
});

// Componente principal de visualización 3D
export function MemoryScene() {
  const { state } = useApp();
  const { theme } = useTheme();
  
  // Initialize centralized animation manager
  useAnimationFrame();

  // Get theme-aware colors
  const memoryColors = useMemo(() => ({
    stack: theme.colors.memory.stack,
    heap: theme.colors.memory.heap,
    global: theme.colors.memory.global,
    pointer: theme.colors.memory.pointer,
    text: theme.colors.text.primary,
    secondary: theme.colors.text.secondary,
    accent: theme.colors.text.accent
  }), [theme.colors]);

  // Theme-aware panel styles
  const panelStyle = useMemo(() => ({
    background: theme.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))'
      : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
    color: theme.colors.text.primary,
    border: `2px solid ${theme.colors.primary[500]}40`,
    backdropFilter: 'blur(10px)',
    boxShadow: `0 0 25px ${theme.colors.primary[500]}30`,
    borderRadius: '12px',
    padding: '15px',
    fontFamily: 'monospace',
    fontSize: '12px'
  }), [theme]);

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
      memoryColors.stack,
      'stack'
    ));

    // Heap (centro) - Memoria dinámica
    blocks.push(...createBlocks(
      state.memoryVisualization.heap,
      [0, 2, 0],
      [2, 1, 1],
      memoryColors.heap,
      'heap'
    ));

    // Global (derecha) - Variables globales
    blocks.push(...createBlocks(
      state.memoryVisualization.global,
      [6, 2, 0],
      [1.2, 0.8, 0.8],
      memoryColors.global,
      'global'
    ));

    return blocks;
  }, [state, memoryColors]);

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

      {/* Enhanced memory regions */}
      <MemoryRegion 
        type="stack" 
        position={[-6, 0, 0]} 
        blocks={memoryBlocks.filter(b => b.type === 'stack')}
        showBoundaries={true}
      />
      
      <MemoryRegion 
        type="heap" 
        position={[0, 0, 0]} 
        blocks={memoryBlocks.filter(b => b.type === 'heap')}
        showBoundaries={true}
      />
      
      <MemoryRegion 
        type="global" 
        position={[6, 0, 0]} 
        blocks={memoryBlocks.filter(b => b.type === 'global')}
        showBoundaries={true}
      />

      {/* Renderizar punteros con detección de problemas */}
      {pointer3D.map((ptr) => (
        <group key={ptr.id}>
          <Pointer3DComponent pointer={ptr} />
          
          {/* Dangling pointer warning */}
          <DanglingPointerWarning
            position={ptr.start}
            isActive={!memoryBlocks.some(b => 
              Math.abs(b.position[0] - ptr.end[0]) < 0.5 &&
              Math.abs(b.position[1] - ptr.end[1]) < 0.5 &&
              Math.abs(b.position[2] - ptr.end[2]) < 0.5
            )}
          />
        </group>
      ))}
      
      {/* Memory leak indicators */}
      {memoryBlocks
        .filter(block => block.type === 'heap' && !pointer3D.some(p => 
          Math.abs(p.end[0] - block.position[0]) < 0.5 &&
          Math.abs(p.end[1] - block.position[1]) < 0.5 &&
          Math.abs(p.end[2] - block.position[2]) < 0.5
        ))
        .map((block, index) => (
          <MemoryLeakIndicator
            key={`leak-${block.id}`}
            position={[block.position[0], block.position[1] + 1, block.position[2]]}
            severity={index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low'}
          />
        ))
      }
      
      {/* Memory analytics display */}
      <MemoryAnalytics memoryBlocks={memoryBlocks} pointers={pointer3D} />

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
        <lineBasicMaterial color={memoryColors.stack} opacity={0.5} transparent />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute args={[new Float32Array([3, -2, 0, 3, 4, 0]), 3]} attach="attributes-position" />
        </bufferGeometry>
        <lineBasicMaterial color={memoryColors.heap} opacity={0.5} transparent />
      </line>

      {/* Enhanced memory layout guide */}
      <Html position={[-8, -6, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))',
          padding: '15px',
          borderRadius: '12px',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 25px rgba(0,212,255,0.3)',
          color: 'white',
          fontSize: '11px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '300px'
        }}>
          <h4 style={{ color: '#00D4FF', margin: '0 0 10px 0', textAlign: 'center' }}>
            🎯 Memory Management Guide
          </h4>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#00FF88', fontWeight: 'bold', marginBottom: '4px' }}>🟢 Stack Memory:</div>
            <div style={{ fontSize: '10px', lineHeight: '1.3', marginLeft: '8px' }}>
              • Automatic allocation/deallocation<br/>
              • LIFO (Last In, First Out)<br/>
              • Limited size, fast access<br/>
              • Local variables, function calls
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#FF6B6B', fontWeight: 'bold', marginBottom: '4px' }}>🔴 Heap Memory:</div>
            <div style={{ fontSize: '10px', lineHeight: '1.3', marginLeft: '8px' }}>
              • Manual allocation (new/malloc)<br/>
              • Manual deallocation required<br/>
              • Large capacity, slower access<br/>
              • Dynamic objects, arrays
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#FFA500', fontWeight: 'bold', marginBottom: '4px' }}>🟠 Global Memory:</div>
            <div style={{ fontSize: '10px', lineHeight: '1.3', marginLeft: '8px' }}>
              • Program lifetime duration<br/>
              • Initialized before main()<br/>
              • Static and global variables<br/>
              • Thread-shared data
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '8px',
            fontSize: '10px',
            textAlign: 'center',
            color: '#999'
          }}>
            🔍 Watch for leaks and dangling pointers
          </div>
        </div>
      </Html>
      
      {/* Información de debug mejorada */}
      <Html position={[-8, 8, 0]} style={{ color: theme.colors.text.primary, fontSize: '12px' }}>
        <div style={panelStyle}>
          <h4 style={{ color: memoryColors.accent, margin: '0 0 10px 0', textAlign: 'center' }}>🧠 Sistema de Memoria 3D</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <p style={{ margin: '5px 0', color: memoryColors.stack, fontWeight: 'bold' }}>📚 Stack</p>
              <p style={{ margin: '5px 0', fontSize: '11px', color: memoryColors.stack }}>{state.memoryVisualization.stack.length} variables</p>
              <p style={{ margin: '2px 0', fontSize: '9px', color: memoryColors.secondary }}>Auto-managed</p>
            </div>
            <div>
              <p style={{ margin: '5px 0', color: memoryColors.heap, fontWeight: 'bold' }}>🔥 Heap</p>
              <p style={{ margin: '5px 0', fontSize: '11px', color: memoryColors.heap }}>{state.memoryVisualization.heap.length} objetos</p>
              <p style={{ margin: '2px 0', fontSize: '9px', color: memoryColors.secondary }}>Manual cleanup</p>
            </div>
            <div>
              <p style={{ margin: '5px 0', color: memoryColors.global, fontWeight: 'bold' }}>🌐 Global</p>
              <p style={{ margin: '5px 0', fontSize: '11px', color: memoryColors.global }}>{state.memoryVisualization.global.length} datos</p>
              <p style={{ margin: '2px 0', fontSize: '9px', color: memoryColors.secondary }}>Program lifetime</p>
            </div>
            <div>
              <p style={{ margin: '5px 0', color: memoryColors.pointer, fontWeight: 'bold' }}>➡️ Punteros</p>
              <p style={{ margin: '5px 0', fontSize: '11px', color: memoryColors.pointer }}>{state.memoryVisualization.pointers.length} conexiones</p>
              <p style={{ margin: '2px 0', fontSize: '9px', color: memoryColors.secondary }}>Active references</p>
            </div>
          </div>
          <div style={{ 
            margin: '10px 0 0 0', 
            fontSize: '10px', 
            color: theme.colors.text.tertiary, 
            textAlign: 'center', 
            borderTop: `1px solid ${theme.colors.border.secondary}`, 
            paddingTop: '8px' 
          }}>
            <div style={{ marginBottom: '4px' }}>🖱️ Interactúa • 📏 Zoom • 🎯 Explora</div>
            <div style={{ fontSize: '9px', color: theme.colors.text.muted }}>
              🔴 Leak Detection • ⚠️ Dangling Pointers • 📊 Memory Analytics
            </div>
          </div>
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
  const { theme } = useTheme();
  
  // Theme-aware canvas background
  const canvasBackground = useMemo(() => {
    const isDark = theme.mode === 'dark';
    return isDark ? '#0f0f23' : '#f8fafc';
  }, [theme.mode]);

  const overlayStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
    color: theme.colors.text.primary,
    fontSize: '12px',
    background: theme.colors.background.overlay,
    padding: '5px 10px',
    borderRadius: '5px',
    fontFamily: 'monospace',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.colors.border.secondary}`
  }), [theme.colors]);

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas {...canvasProps} style={{ background: canvasBackground }}>
          <MemoryScene />
        </Canvas>
      </Suspense>
      <div style={overlayStyle}>
        🖱️ {get3DLabel('controls.rotate', 'Click y arrastra para rotar')} • 📏 {get3DLabel('controls.zoom', 'Rueda para zoom')}
      </div>
    </div>
  );
}
