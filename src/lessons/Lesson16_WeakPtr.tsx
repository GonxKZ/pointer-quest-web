import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { THREE } from '../utils/three';
import {
  LessonLayout,
  TheoryPanel,
  VisualizationPanel,
  Section,
  SectionTitle,
  CodeBlock,
  InteractiveSection,
  StatusDisplay,
  ButtonGroup,
  StepIndicator,
  theme
} from '../design-system';
import { useApp } from '../context/AppContext';



interface WeakPtrState {
  sharedPtr: {
    exists: boolean;
    value: number;
    useCount: number;
  };
  weakPtrs: Array<{
    id: string;
    name: string;
    expired: boolean;
    lastLockResult: 'success' | 'failed' | 'not_attempted';
  }>;
  controlBlock: {
    exists: boolean;
    strongRefs: number;
    weakRefs: number;
  };
  operation: 'none' | 'create_shared' | 'create_weak' | 'lock_weak' | 'destroy_shared' | 'access_expired';
  message: string;
  objectLifetime: 'alive' | 'destroyed' | 'never_existed';
  demonstrationStep: number;
}

interface WeakPtrVisual {
  id: string;
  name: string;
  position: [number, number, number];
  expired: boolean;
  isActive: boolean;
  lockAttempting: boolean;
}

interface SharedPtrVisual {
  id: string;
  position: [number, number, number];
  exists: boolean;
  value: number;
  useCount: number;
}

interface ControlBlockVisual {
  id: string;
  position: [number, number, number];
  exists: boolean;
  strongRefs: number;
  weakRefs: number;
  objectAlive: boolean;
}

// Using design system - no need for styled components

const InputGroup = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '10px 0',
    flexWrap: 'wrap'
  }}>
    {children}</div>
);

const Input = ({ type, min, max, value, onChange, ...props }: {
  type?: string;
  min?: string;
  max?: string;
  value?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}) => (
  <input
    type={type}
    min={min}
    max={max}
    value={value}
    onChange={onChange}
    style={{
      background: 'rgba(0, 0, 0, 0.3)',
      border: `1px solid ${theme.colors.primary}`,
      borderRadius: '4px',
      padding: '8px 12px',
      color: 'white',
      fontFamily: 'inherit',
      width: type === 'number' ? '80px' : '200px'
    }}
    {...props}
  />
);





const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' }>`
  background: ${props => 
    props.variant === 'danger' ? 'linear-gradient(45deg, #ff4444, #cc0000)' :
    props.variant === 'success' ? 'linear-gradient(45deg, #44ff44, #00cc00)' :
    props.variant === 'warning' ? 'linear-gradient(45deg, #ff8800, #cc6600)' :
    props.variant === 'secondary' ? 'linear-gradient(45deg, #666, #333)' :
    'linear-gradient(45deg, #0066cc, #0099ff)'};
  color: white;
  border: none;
  padding: 12px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9em;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 100, 200, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;



const LockResultDisplay = styled.div<{ result: 'success' | 'failed' | 'not_attempted' }>`
  background: ${props => 
    props.result === 'success' ? 'rgba(0, 255, 0, 0.2)' :
    props.result === 'failed' ? 'rgba(255, 0, 0, 0.2)' :
    'rgba(100, 100, 100, 0.2)'};
  border: 1px solid ${props => 
    props.result === 'success' ? '#00ff00' :
    props.result === 'failed' ? '#ff0000' :
    '#666666'};
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
`;



const MemoryVisualization: React.FC<{
  state: WeakPtrState;
  sharedPtr: SharedPtrVisual;
  weakPtrs: WeakPtrVisual[];
  controlBlock: ControlBlockVisual;
}> = ({ state, sharedPtr, weakPtrs, controlBlock }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const SharedPointerComponent = ({ ptr }: { ptr: SharedPtrVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && ptr.exists) {
        meshRef.current.rotation.z += 0.03;
      }
    });

    return (
      <group position={ptr.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.8, 0.8, 0.3]} />
          <meshStandardMaterial 
            color={ptr.exists ? '#00ff88' : '#333333'}
            emissive={ptr.exists ? '#00ff88' : '#000000'}
            emissiveIntensity={ptr.exists ? 0.3 : 0}
            transparent
            opacity={ptr.exists ? 0.9 : 0.3}
          />
        </mesh>
        
        <Text
          position={[0, -1, 0]}
          fontSize={0.25}
          color={ptr.exists ? '#00ff88' : '#666666'}
          anchorX="center"
          anchorY="middle"
        >
          shared_ptr
        </Text>

        {ptr.exists && (
          <>
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {ptr.value}
            </Text>
            <Text
              position={[0, -1.3, 0]}
              fontSize={0.2}
              color="#66ccff"
              anchorX="center"
              anchorY="middle"
            >
              use_count: {ptr.useCount}
            </Text>
          </>
        )}
      </group>
    );
  };

  const WeakPointerComponent = ({ ptr }: { ptr: WeakPtrVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current) {
        if (ptr.lockAttempting) {
          meshRef.current.rotation.y += 0.1;
          const scale = 1 + Math.sin(Date.now() * 0.02) * 0.2;
          meshRef.current.scale.setScalar(scale);
        } else if (!ptr.expired) {
          meshRef.current.rotation.z += 0.02;
        }
      }
    });

    const getColor = () => {
      if (ptr.lockAttempting) return '#ffaa00';
      if (ptr.expired) return '#ff4444';
      return '#66aaff';
    };

    return (
      <group position={ptr.position}>
        <mesh ref={meshRef}>
          <cylinderGeometry args={[0.6, 0.6, 0.8, 8]} />
          <meshStandardMaterial 
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={ptr.isActive ? 0.4 : 0.1}
            transparent
            opacity={ptr.expired ? 0.5 : 0.8}
          />
        </mesh>
        
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.25}
          color={getColor()}
          anchorX="center"
          anchorY="middle"
        >
          {ptr.name}
        </Text>

        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          weak_ptr
        </Text>

        {ptr.expired && (
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.2}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            EXPIRED
          </Text>
        )}

        {ptr.lockAttempting && (
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.2}
            color="#ffaa00"
            anchorX="center"
            anchorY="middle"
          >
            locking...
          </Text>
        )}
      </group>
    );
  };

  const ControlBlockComponent = ({ block }: { block: ControlBlockVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && block.exists) {
        meshRef.current.rotation.y += 0.02;
      }
    });

    return (
      <group position={block.position}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1]} />
          <meshStandardMaterial 
            color="#0066cc"
            emissive="#0066cc"
            emissiveIntensity={block.exists ? 0.4 : 0}
            transparent
            opacity={block.exists ? 0.8 : 0.3}
          />
        </mesh>
        
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.3}
          color="#66ccff"
          anchorX="center"
          anchorY="middle"
        >
          Control Block
        </Text>

        <Text
          position={[0, 0, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          S:{block.strongRefs} W:{block.weakRefs}
        </Text>

        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color={block.objectAlive ? '#00ff88' : '#ff6666'}
          anchorX="center"
          anchorY="middle"
        >
          Object: {block.objectAlive ? 'ALIVE' : 'DESTROYED'}
        </Text>
      </group>
    );
  };

  const ConnectionArrow = ({ from, to, color, style = 'solid' }: {
    from: [number, number, number];
    to: [number, number, number];
    color: string;
    style?: 'solid' | 'dashed';
  }) => {
    const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const length = direction.length();
    direction.normalize();

    return (
      <group position={from}>
        <mesh rotation={[0, 0, Math.atan2(direction.y, direction.x)]}>
          <cylinderGeometry args={[0.03, 0.03, length, 8]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.3}
            transparent
            opacity={style === 'dashed' ? 0.5 : 0.8}
          />
        </mesh>
      </group>
    );
  };

  const LifetimeIndicator = () => {
    const color = state.objectLifetime === 'alive' ? '#00ff88' : 
                  state.objectLifetime === 'destroyed' ? '#ff4444' : '#666666';
    
    return (
      <group position={[0, -3.5, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          Object Lifetime: {state.objectLifetime.toUpperCase()}
        </Text>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066cc" />

      <SharedPointerComponent ptr={sharedPtr} />

      {weakPtrs.map(ptr => (
        <WeakPointerComponent key={ptr.id} ptr={ptr} />
      ))}

      <ControlBlockComponent block={controlBlock} />

      {/* Strong reference arrow */}
      {sharedPtr.exists && controlBlock.exists && (
        <ConnectionArrow 
          from={sharedPtr.position} 
          to={controlBlock.position} 
          color="#00ff88"
        />
      )}

      {/* Weak reference arrows */}
      {weakPtrs.map(ptr => (
        <ConnectionArrow 
          key={`${ptr.id}-ref`}
          from={ptr.position} 
          to={controlBlock.position} 
          color={ptr.expired ? "#ff4444" : "#66aaff"}
          style={ptr.expired ? "dashed" : "solid"}
        />
      ))}

      <LifetimeIndicator />

      <Text
        position={[0, -4.5, 0]}
        fontSize={0.35}
        color="#66ccff"
        anchorX="center"
        anchorY="middle"
      >
        {state.message}
      </Text>
    </group>
  );
};

const Lesson16_WeakPtr: React.FC = () => {
  const [state, setState] = useState<WeakPtrState>({
    sharedPtr: { exists: false, value: 42, useCount: 0 },
    weakPtrs: [],
    controlBlock: { exists: false, strongRefs: 0, weakRefs: 0 },
    operation: 'none',
    message: 'std::weak_ptr - non-owning smart pointer para romper cycles',
    objectLifetime: 'never_existed',
    demonstrationStep: 0
  });

  const [sharedPtr, setSharedPtr] = useState<SharedPtrVisual>({
    id: 'shared1',
    position: [-3, 2, 0],
    exists: false,
    value: 42,
    useCount: 0
  });

  const [weakPtrs, setWeakPtrs] = useState<WeakPtrVisual[]>([]);
  const [controlBlock, setControlBlock] = useState<ControlBlockVisual>({
    id: 'control1',
    position: [0, 0, 0],
    exists: false,
    strongRefs: 0,
    weakRefs: 0,
    objectAlive: false
  });

  const createSharedPtr = () => {
    setState(prev => ({
      ...prev,
      sharedPtr: { exists: true, value: 42, useCount: 1 },
      controlBlock: { exists: true, strongRefs: 1, weakRefs: 0 },
      operation: 'create_shared',
      message: 'auto shared = std::make_shared<int>(42) - objeto y control block creados',
      objectLifetime: 'alive',
      demonstrationStep: 1
    }));

    setSharedPtr(prev => ({
      ...prev,
      exists: true,
      value: 42,
      useCount: 1
    }));

    setControlBlock(prev => ({
      ...prev,
      exists: true,
      strongRefs: 1,
      weakRefs: 0,
      objectAlive: true
    }));
  };

  const createWeakPtr = () => {
    if (!state.sharedPtr.exists) {
      setState(prev => ({
        ...prev,
        message: 'Error: Necesitas crear un shared_ptr primero'
      }));
      return;
    }

    const weakPtrId = `weak${state.weakPtrs.length + 1}`;
    const newWeakPtr = {
      id: weakPtrId,
      name: weakPtrId,
      expired: false,
      lastLockResult: 'not_attempted' as const
    };

    setState(prev => ({
      ...prev,
      weakPtrs: [...prev.weakPtrs, newWeakPtr],
      controlBlock: {
        ...prev.controlBlock,
        weakRefs: prev.controlBlock.weakRefs + 1
      },
      operation: 'create_weak',
      message: `std::weak_ptr<int> ${weakPtrId}(shared) - weak reference creada`,
      demonstrationStep: Math.max(prev.demonstrationStep, 2)
    }));

    const positions: [number, number, number][] = [
      [3, 2, 0], [3, -1, 0], [-3, -1, 0], [0, 3, 0]
    ];

    setWeakPtrs(prev => [...prev, {
      id: weakPtrId,
      name: weakPtrId,
      position: positions[prev.length] || [0, -2, 0],
      expired: false,
      isActive: true,
      lockAttempting: false
    }]);

    setControlBlock(prev => ({
      ...prev,
      weakRefs: prev.weakRefs + 1
    }));
  };

  const attemptLock = () => {
    if (state.weakPtrs.length === 0) {
      setState(prev => ({
        ...prev,
        message: 'Error: No hay weak_ptr para hacer lock()'
      }));
      return;
    }

    const activeWeakPtr = state.weakPtrs[0];
    const lockSuccess = state.objectLifetime === 'alive';

    // Animate lock attempt
    setWeakPtrs(prev => prev.map(ptr => 
      ptr.id === activeWeakPtr.id 
        ? { ...ptr, lockAttempting: true }
        : ptr
    ));

    setState(prev => ({
      ...prev,
      operation: 'lock_weak',
      message: `${activeWeakPtr.name}.lock() ${lockSuccess ? 'SUCCESS' : 'FAILED'} - ${lockSuccess ? 'shared_ptr válido retornado' : 'nullptr retornado'}`,
      demonstrationStep: Math.max(prev.demonstrationStep, 3),
      weakPtrs: prev.weakPtrs.map(ptr =>
        ptr.id === activeWeakPtr.id
          ? { ...ptr, lastLockResult: lockSuccess ? 'success' : 'failed' }
          : ptr
      )
    }));

    setTimeout(() => {
      setWeakPtrs(prev => prev.map(ptr => 
        ptr.id === activeWeakPtr.id 
          ? { ...ptr, lockAttempting: false }
          : ptr
      ));
    }, 1500);
  };

  const destroySharedPtr = () => {
    if (!state.sharedPtr.exists) {
      setState(prev => ({
        ...prev,
        message: 'No hay shared_ptr para destruir'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      sharedPtr: { ...prev.sharedPtr, exists: false, useCount: 0 },
      controlBlock: {
        ...prev.controlBlock,
        strongRefs: 0,
        objectAlive: false
      },
      operation: 'destroy_shared',
      message: 'shared_ptr destruido - objeto eliminado, weak_ptrs ahora expired',
      objectLifetime: 'destroyed',
      demonstrationStep: Math.max(prev.demonstrationStep, 4),
      weakPtrs: prev.weakPtrs.map(ptr => ({
        ...ptr,
        expired: true,
        lastLockResult: 'not_attempted'
      }))
    }));

    setSharedPtr(prev => ({
      ...prev,
      exists: false,
      useCount: 0
    }));

    setControlBlock(prev => ({
      ...prev,
      strongRefs: 0,
      objectAlive: false
    }));

    setWeakPtrs(prev => prev.map(ptr => ({
      ...ptr,
      expired: true
    })));
  };

  const checkExpired = () => {
    if (state.weakPtrs.length === 0) {
      setState(prev => ({
        ...prev,
        message: 'No hay weak_ptr para verificar'
      }));
      return;
    }

    const isExpired = state.objectLifetime !== 'alive';
    setState(prev => ({
      ...prev,
      message: `weak_ptr.expired() = ${isExpired} - ${isExpired ? 'objeto ha sido destruido' : 'objeto sigue vivo'}`
    }));
  };

  const simulateUseCount = () => {
    if (state.weakPtrs.length === 0) {
      setState(prev => ({
        ...prev,
        message: 'No hay weak_ptr para verificar use_count'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      message: `weak_ptr.use_count() = ${prev.controlBlock.strongRefs} - número de shared_ptr activos`
    }));
  };

  const resetScene = () => {
    setState({
      sharedPtr: { exists: false, value: 42, useCount: 0 },
      weakPtrs: [],
      controlBlock: { exists: false, strongRefs: 0, weakRefs: 0 },
      operation: 'none',
      message: 'Demostración reiniciada - listo para mostrar weak_ptr',
      objectLifetime: 'never_existed',
      demonstrationStep: 0
    });

    setSharedPtr({
      id: 'shared1',
      position: [-3, 2, 0],
      exists: false,
      value: 42,
      useCount: 0
    });

    setWeakPtrs([]);
    setControlBlock({
      id: 'control1',
      position: [0, 0, 0],
      exists: false,
      strongRefs: 0,
      weakRefs: 0,
      objectAlive: false
    });
  };

  const { updateProgress } = useApp();
  
  useEffect(() => {
    updateProgress(16, {
      completed: false,
      timeSpent: 0,
      hintsUsed: 0,
      errors: 0
    });
  }, [updateProgress]);

  const lessonColors = theme.colors.intermediate;

  return (
    <LessonLayout
      title="Lección 16: std::weak_ptr"
      subtitle="Non-owning Smart Pointer y el Patrón lock()"
      lessonNumber={16}
      topic="intermediate"
    >
      <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
            <MemoryVisualization 
              state={state} 
              sharedPtr={sharedPtr}
              weakPtrs={weakPtrs}
              controlBlock={controlBlock}
            />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <TheoryPanel>
          <Section>
            <SectionTitle>🔗 std::weak_ptr&lt;T&gt;</SectionTitle>
<p>Smart pointer que observa sin poseer - rompe cycles de shared_ptr:</p>
            <CodeBlock>{`{[
              '// Crear weak_ptr desde shared_ptr',
              'auto shared = std::make_shared<int>(42);',
              'std::weak_ptr<int> weak = shared;',
              '',
              '// Acceso seguro mediante lock()',
              'if (auto locked = weak.lock()) {',
              '    // locked es shared_ptr válido',
              '    std::cout << *locked;  // Safe access',
              '} else {',
              '    // Objeto fue destruido',
              '    std::cout << "Object destroyed\\n";',
              '}',
              '',
              '// Verificar estado',
              'bool expired = weak.expired();',
              'size_t count = weak.use_count();',
            ].join('\n')}`}</CodeBlock>
          </Section>

          <StepIndicator>
            <strong>Paso {state.demonstrationStep}/5:</strong> {
              state.demonstrationStep === 0 ? 'Listo para comenzar' :
              state.demonstrationStep === 1 ? 'shared_ptr creado' :
              state.demonstrationStep === 2 ? 'weak_ptr creado' :
              state.demonstrationStep === 3 ? 'lock() demostrado' :
              state.demonstrationStep === 4 ? 'shared_ptr destruido' :
              'weak_ptr verificado como expired'
            }
          </StepIndicator>

          <InteractiveSection>
          <SectionTitle>🎮 Ciclo de Vida del Objeto</SectionTitle>
            
            <ButtonGroup>
            <Button onClick={createSharedPtr} variant="primary">
              1. Crear shared_ptr
            </Button>
            
            <Button 
              onClick={createWeakPtr}
              disabled={!state.sharedPtr.exists}
              variant="secondary"
            >
              2. Crear weak_ptr
            </Button>
            
            <Button 
              onClick={destroySharedPtr}
              disabled={!state.sharedPtr.exists}
              variant="danger"
            >
              4. Destruir shared_ptr
            </Button>
          </ButtonGroup>
          </InteractiveSection>

          <InteractiveSection>
          <SectionTitle>🔓 Operaciones de weak_ptr</SectionTitle>
<ButtonGroup>
            <Button 
              onClick={attemptLock}
              disabled={state.weakPtrs.length === 0}
              variant="success"
            >
              3. weak.lock()
            </Button>
            
            <Button 
              onClick={checkExpired}
              disabled={state.weakPtrs.length === 0}
            >
              weak.expired()
            </Button>
            
            <Button 
              onClick={simulateUseCount}
              disabled={state.weakPtrs.length === 0}
            >
              weak.use_count()
            </Button>
          </ButtonGroup>
          </InteractiveSection>

          <LockResultDisplay result={state.weakPtrs[0]?.lastLockResult || 'not_attempted'}>
            <SectionTitle>🔒 Resultado de lock()</SectionTitle>
{state.weakPtrs.length > 0 && (
              <div>
                {state.weakPtrs[0].lastLockResult === 'success' && (
                  <div style={{ color: '#00ff88' }}>
                    ✅ lock() retornó shared_ptr válido - acceso seguro garantizado
          </div>
                )}
                {state.weakPtrs[0].lastLockResult === 'failed' && (
                  <div style={{ color: '#ff6666' }}>
                    ❌ lock() retornó nullptr - objeto fue destruido
                  </div>
                )}
                {state.weakPtrs[0].lastLockResult === 'not_attempted' && (
                  <div style={{ color: '#cccccc' }}>
                    ⏳ Aún no se ha intentado lock()
                  </div>
                )}
              </div>
            )}
          </LockResultDisplay>

          <StatusDisplay>
            <SectionTitle>📊 Estado del Sistema</SectionTitle>
<div>shared_ptr activo: {state.sharedPtr.exists ? 'Sí' : 'No'}
          </div>
            <div>weak_ptrs: {state.weakPtrs.length}</div>
            <div>Strong references: {state.controlBlock.strongRefs}</div>
            <div>Weak references: {state.controlBlock.weakRefs}</div>
            <div>Objeto: {state.objectLifetime}</div>
            <div>Operación: {state.operation}</div>
          </StatusDisplay>

          <Section>
            <SectionTitle>🎯 Patrón lock()</SectionTitle>
            <p>La única forma segura de acceder al objeto mediante weak_ptr:</p>
            <CodeBlock>{[
              '// ✅ Patrón correcto',
              'if (auto locked = weak_ptr.lock()) {',
              '    // Objeto garantizado vivo durante este scope',
              '    locked->method();',
              '    process(*locked);',
              '} // locked se destruye aquí',
              '',
              '// ❌ INCORRECTO - race condition',
              'if (!weak_ptr.expired()) {',
              '    auto shared = weak_ptr.lock();  // Puede retornar nullptr!',
              '    *shared;  // PELIGRO: potential crash',
              '}',
            ].join('\n')}</CodeBlock>
          </Section>

          <Section>
            <SectionTitle>💡 Casos de Uso Comunes</SectionTitle>
            <ul>
              <li><strong>Observer pattern:</strong> Observers no prolongan lifetime del Subject</li>
              <li><strong>Parent-child cycles:</strong> Child tiene weak_ptr a Parent</li>
              <li><strong>Cache systems:</strong> Cache no impide destrucción de objetos</li>
              <li><strong>Callbacks:</strong> Evita dangling function objects</li>
              <li><strong>Event systems:</strong> Listeners con weak references</li>
              <li><strong>Tree traversal:</strong> Referencias temporales sin ownership</li>
            </ul>
          </Section>

          <Section>
            <SectionTitle>⚡ Consideraciones de Performance</SectionTitle>
            <CodeBlock>{`{[
              '// weak_ptr overhead mínimo',
              'sizeof(std::weak_ptr<T>) == sizeof(std::shared_ptr<T>)  // ~16 bytes',
              '',
              '// lock() es relativamente costoso (atomic operations)',
              'for (int i = 0; i < 1000000; ++i) {',
              '    if (auto locked = weak.lock()) {  // Atomic read + increment',
              '        // work with locked',
              '    }  // Atomic decrement',
              '}',
              '',
              '// Mejor: cache el resultado si es posible',
              'auto locked = weak.lock();',
              'if (locked) {',
              '    for (int i = 0; i < 1000000; ++i) {',
              '        // work with locked - no atomic ops',
              '    }',
              '};',
            ].join('\n')}`}</CodeBlock>
          </Section>

          <Button onClick={resetScene} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
              </TheoryPanel>
    </LessonLayout>
  );
};

export default Lesson16_WeakPtr;
