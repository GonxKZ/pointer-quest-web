import React, { useRef, useState, useCallback, useEffect, memo, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Line, Sphere, Box, RoundedBox } from '@react-three/drei';
import { useOptimizedAnimation } from '../hooks/useOptimizedAnimation';
import { useMemoryManagement } from '../hooks/useMemoryManagement';
import { useApp } from '../context/AppContext';
import { get3DTranslation } from '../translations/3d-visualization.es';
import * as THREE from 'three';

// Professional color palette for smart pointers
const SMART_POINTER_COLORS = {
  unique: {
    primary: '#9C27B0',
    secondary: '#7B1FA2',
    accent: '#BA68C8',
    glow: '#9C27B0',
    background: 'rgba(156, 39, 176, 0.1)'
  },
  shared: {
    primary: '#4CAF50',
    secondary: '#388E3C',
    accent: '#81C784',
    glow: '#4CAF50',
    background: 'rgba(76, 175, 80, 0.1)'
  },
  weak: {
    primary: '#FF9800',
    secondary: '#F57C00',
    accent: '#FFB74D',
    glow: '#FF9800',
    background: 'rgba(255, 152, 0, 0.1)'
  },
  memory: {
    allocated: '#2196F3',
    deallocated: '#F44336',
    shared: '#4CAF50',
    invalid: '#9E9E9E'
  }
};

// Unique Pointer Visualization with enhanced Spanish support
export const UniquePtrVisualization = memo(({ 
  position = [0, 0, 0],
  targetPosition = [3, 0, 0],
  isValid = true,
  showMove = false,
  animated = true,
  scale = 1
}: {
  position?: [number, number, number];
  targetPosition?: [number, number, number];
  isValid?: boolean;
  showMove?: boolean;
  animated?: boolean;
  scale?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [moveProgress, setMoveProgress] = useState(0);

  // Use optimized animation system for better performance
  useOptimizedAnimation(
    `unique-ptr-${position.join('-')}`,
    useCallback((state) => {
      if (!groupRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      // Unique ownership pulsing effect
      const pulse = 1 + Math.sin(time * 3) * 0.05;
      groupRef.current.scale.setScalar(scale * pulse);
      
      // Move animation when showing ownership transfer
      if (showMove) {
        const progress = (Math.sin(time * 0.8) + 1) * 0.5;
        setMoveProgress(progress);
      }
    }, [scale, showMove]),
    1, // Medium priority
    [position, scale, showMove, animated]
  );

  const colors = SMART_POINTER_COLORS.unique;

  return (
    <group ref={groupRef} position={position}>
      {/* Unique pointer container */}
      <RoundedBox args={[1.8, 0.8, 0.4]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color={isValid ? colors.primary : SMART_POINTER_COLORS.memory.invalid}
          transparent
          opacity={0.9}
          emissive={colors.glow}
          emissiveIntensity={isValid ? 0.1 : 0}
        />
      </RoundedBox>
      
      {/* Unique ownership indicator */}
      <mesh position={[-0.6, 0, 0.3]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.glow}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Pointer arrow */}
      {isValid && (
        <Line
          points={[
            [0.9, 0, 0],
            [targetPosition[0] - position[0] - 0.9, targetPosition[1] - position[1], targetPosition[2] - position[2]]
          ]}
          color={colors.primary}
          lineWidth={3}
        />
      )}
      
      {/* Move animation indicator */}
      {showMove && (
        <mesh position={[moveProgress * 2 - 1, 0.5, 0]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.glow}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Label */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color={colors.primary}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        unique_ptr&lt;T&gt;
      </Text>
      
      {/* Status indicator */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.12}
        color={isValid ? colors.accent : '#FF5252'}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {isValid ? 
          get3DTranslation('pointerStates.valid', 'OWNS') : 
          get3DTranslation('pointerStates.null', 'MOVED/NULL')
        }
      </Text>
    </group>
  );
});

// Shared Pointer Visualization with Reference Counting and Spanish support
export const SharedPtrVisualization = memo(({
  position = [0, 0, 0],
  targetPosition = [3, 0, 0],
  refCount = 1,
  animated = true,
  scale = 1,
  showControlBlock = true
}: {
  position?: [number, number, number];
  targetPosition?: [number, number, number];
  refCount?: number;
  animated?: boolean;
  scale?: number;
  showControlBlock?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const refCountRef = useRef<THREE.Mesh>(null);

  // Use optimized animation system for better performance
  useOptimizedAnimation(
    `shared-ptr-${position.join('-')}`,
    useCallback((state) => {
      if (!groupRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      // Shared ownership gentle pulsing
      const pulse = 1 + Math.sin(time * 2) * 0.03;
      groupRef.current.scale.setScalar(scale * pulse);
      
      // Reference count animation
      if (refCountRef.current) {
        refCountRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
      }
    }, [scale]),
    1, // Medium priority
    [position, scale, refCount, animated]
  );

  const colors = SMART_POINTER_COLORS.shared;

  return (
    <group ref={groupRef} position={position}>
      {/* Shared pointer container */}
      <RoundedBox args={[1.8, 0.8, 0.4]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color={colors.primary}
          transparent
          opacity={0.9}
          emissive={colors.glow}
          emissiveIntensity={0.1}
        />
      </RoundedBox>
      
      {/* Reference count display */}
      <mesh ref={refCountRef} position={[0.7, 0.3, 0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.glow}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <Text
        position={[0.7, 0.3, 0.35]}
        fontSize={0.12}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {refCount}
      </Text>
      
      {/* Control block visualization */}
      {showControlBlock && (
        <group position={[1.5, 1, 0]}>
          <Box args={[0.8, 0.4, 0.2]}>
            <meshStandardMaterial
              color={colors.secondary}
              transparent
              opacity={0.7}
            />
          </Box>
          <Text
            position={[0, 0, 0.15]}
            fontSize={0.08}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            font="/fonts/FiraCode-Regular.woff"
          >
            Control Block
          </Text>
          <Text
            position={[0, -0.1, 0.15]}
            fontSize={0.06}
            color={colors.accent}
            anchorX="center"
            anchorY="middle"
            font="/fonts/FiraCode-Regular.woff"
          >
            refs: {refCount}
          </Text>
        </group>
      )}
      
      {/* Shared pointer arrow */}
      <Line
        points={[
          [0.9, 0, 0],
          [targetPosition[0] - position[0] - 0.9, targetPosition[1] - position[1], targetPosition[2] - position[2]]
        ]}
        color={colors.primary}
        lineWidth={4}
      />
      
      {/* Label */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color={colors.primary}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        shared_ptr&lt;T&gt;
      </Text>
      
      {/* Reference count status */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.12}
        color={colors.accent}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {get3DTranslation('pointerStates.shared', 'SHARED')} ({refCount} refs)
      </Text>
    </group>
  );
});

// Weak Pointer Visualization with Spanish support
export const WeakPtrVisualization = memo(({
  position = [0, 0, 0],
  targetPosition = [3, 0, 0],
  isExpired = false,
  animated = true,
  scale = 1,
  showDashedLine = true
}: {
  position?: [number, number, number];
  targetPosition?: [number, number, number];
  isExpired?: boolean;
  animated?: boolean;
  scale?: number;
  showDashedLine?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Use optimized animation system for better performance
  useOptimizedAnimation(
    `weak-ptr-${position.join('-')}`,
    useCallback((state) => {
      if (!groupRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      // Weak connection flickering effect
      const flicker = isExpired ? 0.3 + Math.sin(time * 6) * 0.2 : 1;
      groupRef.current.scale.setScalar(scale * (0.9 + flicker * 0.1));
    }, [scale, isExpired]),
    1, // Medium priority
    [position, scale, isExpired, animated]
  );

  const colors = SMART_POINTER_COLORS.weak;

  return (
    <group ref={groupRef} position={position}>
      {/* Weak pointer container */}
      <RoundedBox args={[1.8, 0.8, 0.4]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color={isExpired ? SMART_POINTER_COLORS.memory.invalid : colors.primary}
          transparent
          opacity={isExpired ? 0.5 : 0.9}
          emissive={isExpired ? '#000000' : colors.glow}
          emissiveIntensity={isExpired ? 0 : 0.1}
        />
      </RoundedBox>
      
      {/* Weak connection indicator */}
      <mesh position={[-0.6, 0, 0.3]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial
          color={colors.accent}
          transparent
          opacity={isExpired ? 0.3 : 0.8}
          emissive={colors.glow}
          emissiveIntensity={isExpired ? 0 : 0.2}
        />
      </mesh>
      
      {/* Dashed line for weak reference */}
      {showDashedLine && !isExpired && (
        <Line
          points={[
            [0.9, 0, 0],
            [targetPosition[0] - position[0] - 0.9, targetPosition[1] - position[1], targetPosition[2] - position[2]]
          ]}
          color={colors.primary}
          lineWidth={2}
          dashed
          dashScale={20}
          dashSize={0.1}
          gapSize={0.05}
        />
      )}
      
      {/* Expired indicator */}
      {isExpired && (
        <mesh position={[0, 0, 0.3]}>
          <torusGeometry args={[0.3, 0.05, 8, 16]} />
          <meshStandardMaterial
            color="#FF5252"
            emissive="#FF5252"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
      
      {/* Label */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color={isExpired ? '#FF5252' : colors.primary}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        weak_ptr&lt;T&gt;
      </Text>
      
      {/* Status indicator */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.12}
        color={isExpired ? '#FF5252' : colors.accent}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {isExpired ? 
          get3DTranslation('pointerStates.expired', 'EXPIRED') : 
          get3DTranslation('pointerStates.observing', 'OBSERVING')
        }
      </Text>
    </group>
  );
});

// Comprehensive Smart Pointer Comparison Scene with enhanced educational features
export const SmartPointerComparisonScene = memo(({
  showUnique = true,
  showShared = true,
  showWeak = true,
  animated = true
}: {
  showUnique?: boolean;
  showShared?: boolean;
  showWeak?: boolean;
  animated?: boolean;
  interactive?: boolean;
}) => {
  const { state } = useApp();
  const isSpanish = state.language === 'es';

  // Target object position
  const targetPos: [number, number, number] = [6, 0, 0];

  return (
    <group>
      {/* Target object */}
      <group position={targetPos}>
        <Box args={[1.2, 1.2, 0.8]}>
          <meshStandardMaterial
            color={SMART_POINTER_COLORS.memory.allocated}
            transparent
            opacity={0.8}
            emissive={SMART_POINTER_COLORS.memory.allocated}
            emissiveIntensity={0.1}
          />
        </Box>
        <Text
          position={[0, 0, 0.5]}
          fontSize={0.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          font="/fonts/FiraCode-Regular.woff"
        >
          Object
        </Text>
      </group>

      {/* Unique pointer */}
      {showUnique && (
        <UniquePtrVisualization
          position={[-3, 2, 0]}
          targetPosition={targetPos}
          animated={animated}
          isValid={true}
        />
      )}

      {/* Shared pointer */}
      {showShared && (
        <SharedPtrVisualization
          position={[-3, 0, 0]}
          targetPosition={targetPos}
          refCount={2}
          animated={animated}
          showControlBlock={true}
        />
      )}

      {/* Weak pointer */}
      {showWeak && (
        <WeakPtrVisualization
          position={[-3, -2, 0]}
          targetPosition={targetPos}
          animated={animated}
          isExpired={false}
        />
      )}

      {/* Comparison information */}
      <Html position={[0, -4, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          minWidth: '400px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h3 style={{ 
            color: '#00D4FF', 
            margin: '0 0 15px 0', 
            textAlign: 'center',
            fontSize: '18px'
          }}>
            {isSpanish ? 'Comparación de Punteros Inteligentes' : 'Smart Pointer Comparison'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: SMART_POINTER_COLORS.unique.primary, 
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                unique_ptr
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                • Exclusive ownership<br/>
                • Zero overhead<br/>
                • Move-only semantics<br/>
                • RAII guaranteed
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: SMART_POINTER_COLORS.shared.primary, 
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                shared_ptr
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                • Shared ownership<br/>
                • Reference counting<br/>
                • Thread-safe counts<br/>
                • Control block overhead
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: SMART_POINTER_COLORS.weak.primary, 
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                weak_ptr
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                • Non-owning observer<br/>
                • Breaks cycles<br/>
                • Can expire<br/>
                • Must lock() to access
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
});

// Advanced RAII Lifecycle Demonstration
export function RAIILifecycleDemo({
  position = [0, 0, 0],
  autoPlay = false,
  speed = 1
}: {
  position?: [number, number, number];
  animated?: boolean;
  autoPlay?: boolean;
  speed?: number;
}) {
  const [lifecycleStep, setLifecycleStep] = useState<'construction' | 'usage' | 'destruction' | 'complete'>('construction');
  const [showSparks, setShowSparks] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  
  // Auto-advance lifecycle steps
  useEffect(() => {
    if (!autoPlay) return;
    
    const stepDuration = 2000 / speed;
    const interval = setInterval(() => {
      setLifecycleStep(current => {
        switch (current) {
          case 'construction': return 'usage';
          case 'usage': return 'destruction';
          case 'destruction': return 'complete';
          case 'complete': return 'construction';
          default: return 'construction';
        }
      });
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [autoPlay, speed]);
  
  // Sparks effect during construction/destruction
  useEffect(() => {
    if (lifecycleStep === 'construction' || lifecycleStep === 'destruction') {
      setShowSparks(true);
      const timeout = setTimeout(() => setShowSparks(false), 800);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [lifecycleStep]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Different animations for each lifecycle phase
    switch (lifecycleStep) {
      case 'construction':
        groupRef.current.scale.setScalar(0.3 + Math.sin(time * 8) * 0.1);
        break;
      case 'usage':
        groupRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
        break;
      case 'destruction':
        const decay = 1 - Math.min((time % 4) / 2, 1);
        groupRef.current.scale.setScalar(decay);
        break;
      case 'complete':
        groupRef.current.scale.setScalar(0.1);
        break;
    }
  });
  
  const getStepColor = () => {
    switch (lifecycleStep) {
      case 'construction': return '#4CAF50';
      case 'usage': return '#2196F3';
      case 'destruction': return '#FF5722';
      case 'complete': return '#9E9E9E';
      default: return '#2196F3';
    }
  };
  
  return (
    <group ref={groupRef} position={position}>
      {/* Main object undergoing RAII lifecycle */}
      <Box args={[1.5, 1.5, 1]}>
        <meshStandardMaterial
          color={getStepColor()}
          transparent
          opacity={lifecycleStep === 'complete' ? 0.2 : 0.8}
          emissive={getStepColor()}
          emissiveIntensity={lifecycleStep === 'complete' ? 0 : 0.2}
        />
      </Box>
      
      {/* Construction/Destruction sparks */}
      {showSparks && Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const radius = 1.5;
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius * 0.5,
              Math.sin(angle) * radius * 0.3
            ]}
          >
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshStandardMaterial
              color={lifecycleStep === 'construction' ? '#4CAF50' : '#FF5722'}
              emissive={lifecycleStep === 'construction' ? '#4CAF50' : '#FF5722'}
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
      
      {/* Lifecycle phase indicator */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color={getStepColor()}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {lifecycleStep.toUpperCase()}
      </Text>
      
      {/* Phase description */}
      <Html position={[0, -2, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '200px',
          border: `2px solid ${getStepColor()}`,
          fontSize: '14px'
        }}>
          <strong>{lifecycleStep === 'construction' ? 'Constructor Called' :
                   lifecycleStep === 'usage' ? 'Object In Use' :
                   lifecycleStep === 'destruction' ? 'Destructor Called' :
                   'Memory Released'}</strong>
          <br/>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>
            {lifecycleStep === 'construction' ? 'Resources acquired automatically' :
             lifecycleStep === 'usage' ? 'Safe resource access' :
             lifecycleStep === 'destruction' ? 'Resources cleaned up automatically' :
             'Zero memory leaks - RAII complete'}
          </span>
        </div>
      </Html>
    </group>
  );
}

// Memory Management Demonstration with Leak Detection
export function MemoryLeakVisualization({
  position = [0, 0, 0],
  showLeaks = true
}: {
  position?: [number, number, number];
  showLeaks?: boolean;
  animated?: boolean;
}) {
  const [leakedBlocks, setLeakedBlocks] = useState<number[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (!showLeaks) return;
    
    const interval = setInterval(() => {
      setLeakedBlocks(current => {
        const newBlock = Math.random() * 1000;
        return [...current, newBlock].slice(-5); // Keep max 5 leaked blocks
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [showLeaks]);
  
  const clearLeaks = useCallback(() => {
    setLeakedBlocks([]);
  }, []);
  
  return (
    <group ref={groupRef} position={position}>
      {/* Memory pool */}
      <Box args={[4, 0.5, 3]} position={[0, -1, 0]}>
        <meshStandardMaterial
          color="#1A1A2E"
          transparent
          opacity={0.7}
        />
      </Box>
      
      {/* Allocated memory blocks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} args={[0.4, 0.4, 0.4]} position={[-1.5 + i * 0.5, -0.5, 0]}>
          <meshStandardMaterial
            color="#2196F3"
            transparent
            opacity={0.8}
            emissive="#2196F3"
            emissiveIntensity={0.1}
          />
        </Box>
      ))}
      
      {/* Leaked memory blocks (red and pulsing) */}
      {leakedBlocks.map((blockId, index) => {
        const leakPosition: [number, number, number] = [
          -1.5 + (index % 3) * 1,
          0.5 + Math.floor(index / 3) * 0.5,
          0
        ];
        
        return (
          <group key={blockId} position={leakPosition}>
            <Box args={[0.3, 0.3, 0.3]}>
              <meshStandardMaterial
                color="#F44336"
                transparent
                opacity={0.8 + Math.sin(Date.now() * 0.005 + blockId) * 0.2}
                emissive="#F44336"
                emissiveIntensity={0.3}
              />
            </Box>
            <Text
              position={[0, 0.4, 0]}
              fontSize={0.1}
              color="#FF5252"
              anchorX="center"
              anchorY="middle"
            >
              LEAK
            </Text>
          </group>
        );
      })}
      
      {/* Memory status display */}
      <Html position={[0, 2, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'center',
          border: leakedBlocks.length > 0 ? '2px solid #F44336' : '2px solid #4CAF50'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#00D4FF' }}>Memory Status</h4>
          <div>Allocated: 6 blocks</div>
          <div style={{ color: leakedBlocks.length > 0 ? '#F44336' : '#4CAF50' }}>
            Leaked: {leakedBlocks.length} blocks
          </div>
          <button
            onClick={clearLeaks}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clean Memory
          </button>
        </div>
      </Html>
    </group>
  );
}

// Ownership Transfer Animation
export function OwnershipTransferDemo({
  position = [0, 0, 0],
  animated = true,
  transferType = 'unique',
  autoPlay = false
}: {
  position?: [number, number, number];
  animated?: boolean;
  transferType?: 'unique' | 'shared' | 'copy';
  autoPlay?: boolean;
}) {
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  
  useFrame((state) => {
    if (!animated || !isTransferring) return;
    
    const progress = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
    setTransferProgress(progress);
  });
  
  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        setIsTransferring(true);
        setTimeout(() => setIsTransferring(false), 2000);
      }, 4000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoPlay]);
  
  const startTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => setIsTransferring(false), 2000);
  };
  
  return (
    <group position={position}>
      {/* Source pointer */}
      <group position={[-3, 0, 0]}>
        {transferType === 'unique' ? (
          <UniquePtrVisualization
            position={[0, 0, 0]}
            targetPosition={[6, 0, 0]}
            isValid={!isTransferring || transferProgress < 0.5}
            animated={animated}
          />
        ) : (
          <SharedPtrVisualization
            position={[0, 0, 0]}
            targetPosition={[6, 0, 0]}
            refCount={isTransferring ? Math.max(1, Math.floor(2 - transferProgress)) : 1}
            animated={animated}
          />
        )}
      </group>
      
      {/* Target pointer */}
      <group position={[3, 0, 0]}>
        {transferType === 'unique' ? (
          <UniquePtrVisualization
            position={[0, 0, 0]}
            targetPosition={[3, 0, 0]}
            isValid={isTransferring && transferProgress > 0.5}
            animated={animated}
          />
        ) : (
          <SharedPtrVisualization
            position={[0, 0, 0]}
            targetPosition={[3, 0, 0]}
            refCount={isTransferring ? Math.floor(1 + transferProgress) : 2}
            animated={animated}
          />
        )}
      </group>
      
      {/* Transfer animation */}
      {isTransferring && (
        <group position={[-3 + transferProgress * 6, 1, 0]}>
          <Sphere args={[0.1]}>
            <meshStandardMaterial
              color={transferType === 'unique' ? '#9C27B0' : '#4CAF50'}
              emissive={transferType === 'unique' ? '#9C27B0' : '#4CAF50'}
              emissiveIntensity={0.5}
            />
          </Sphere>
        </group>
      )}
      
      {/* Target object */}
      <Box args={[1, 1, 0.8]} position={[6, 0, 0]}>
        <meshStandardMaterial
          color="#2196F3"
          transparent
          opacity={0.8}
        />
      </Box>
      
      {/* Controls */}
      <Html position={[0, -2.5, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#00D4FF', margin: '0 0 10px 0' }}>
            {transferType === 'unique' ? 'Move Semantics' : 'Shared Ownership'}
          </h4>
          <button
            onClick={startTransfer}
            disabled={isTransferring}
            style={{
              padding: '8px 16px',
              background: isTransferring ? '#666' : '#00D4FF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isTransferring ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isTransferring ? 'Transferring...' : `Start ${transferType === 'unique' ? 'Move' : 'Copy'}`}
          </button>
        </div>
      </Html>
    </group>
  );
}

// Enhanced Memory Diagnostics Component
export const MemoryDiagnostics = memo(() => {
  const { state } = useApp();
  const isSpanish = state.language === 'es';
  const [diagnostics, setDiagnostics] = useState({
    uniquePtrCount: 0,
    sharedPtrCount: 0,
    weakPtrCount: 0,
    totalMemory: 0,
    leakDetected: false
  });
  
  // Simulate memory diagnostics
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDiagnostics({
        uniquePtrCount: Math.floor(Math.random() * 5),
        sharedPtrCount: Math.floor(Math.random() * 3),
        weakPtrCount: Math.floor(Math.random() * 2),
        totalMemory: Math.floor(Math.random() * 1024) + 512,
        leakDetected: Math.random() < 0.1
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Html position={[0, 4, 0]} center>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))',
        padding: '15px',
        borderRadius: '10px',
        border: diagnostics.leakDetected ? '2px solid #F44336' : '2px solid #4CAF50',
        color: 'white',
        fontSize: '11px',
        fontFamily: 'monospace',
        minWidth: '220px'
      }}>
        <h4 style={{ 
          color: '#00D4FF', 
          margin: '0 0 10px 0', 
          textAlign: 'center',
          fontSize: '13px'
        }}>
          🧠 {isSpanish ? 'Diagnóstico de Memoria' : 'Memory Diagnostics'}
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ color: '#9C27B0' }}>unique_ptr: {diagnostics.uniquePtrCount}</div>
            <div style={{ color: '#4CAF50' }}>shared_ptr: {diagnostics.sharedPtrCount}</div>
            <div style={{ color: '#FF9800' }}>weak_ptr: {diagnostics.weakPtrCount}</div>
          </div>
          <div>
            <div style={{ color: '#00BCD4' }}>
              {isSpanish ? 'Memoria' : 'Memory'}: {diagnostics.totalMemory}KB
            </div>
            <div style={{ color: diagnostics.leakDetected ? '#F44336' : '#4CAF50' }}>
              {diagnostics.leakDetected ? 
                (isSpanish ? '⚠️ Fuga!' : '⚠️ Leak!') :
                (isSpanish ? '✅ Limpio' : '✅ Clean')
              }
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
});

export default SmartPointerComparisonScene;