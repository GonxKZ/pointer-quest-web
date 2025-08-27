import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { THREE } from '../utils/three';

interface MoveState {
  ptr1: {
    hasObject: boolean;
    value: number;
    name: string;
    isMoved: boolean;
  };
  ptr2: {
    hasObject: boolean;
    value: number;
    name: string;
    isMoved: boolean;
  };
  operation: 'none' | 'move_constructor' | 'move_assignment' | 'copy_attempt' | 'return_move';
  message: string;
  error: string | null;
  currentStep: number;
  animatingMove: boolean;
}

interface SmartPtrVisual {
  id: string;
  name: string;
  hasObject: boolean;
  value: number;
  position: [number, number, number];
  isMoved: boolean;
  isActive: boolean;
}

interface MemoryBlock {
  id: string;
  value: number;
  owner: string | null;
  position: [number, number, number];
  isMoving: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a1e 0%, #1a1a3e 100%);
  color: white;
  font-family: 'Consolas', 'Monaco', monospace;
`;

const Header = styled.div`
  padding: 20px;
  text-align: center;
  background: rgba(0, 100, 200, 0.1);
  border-bottom: 2px solid #0066cc;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5em;
  background: linear-gradient(45deg, #66ccff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(102, 204, 255, 0.5);
`;

const Subtitle = styled.h2`
  margin: 10px 0 0 0;
  font-size: 1.2em;
  color: #99ccff;
  font-weight: normal;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;
  padding: 20px;
`;

const VisualizationPanel = styled.div`
  flex: 2;
  background: rgba(0, 50, 100, 0.2);
  border-radius: 10px;
  border: 1px solid #0066cc;
  position: relative;
  overflow: hidden;
`;

const ControlPanel = styled.div`
  flex: 1;
  background: rgba(0, 50, 100, 0.2);
  border-radius: 10px;
  border: 1px solid #0066cc;
  padding: 20px;
  overflow-y: auto;
`;

const TheorySection = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(0, 100, 200, 0.1);
  border-radius: 8px;
  border-left: 4px solid #0099ff;
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.4);
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #333;
  overflow-x: auto;
  font-size: 0.9em;
  color: #e0e0e0;
  margin: 10px 0;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
  background: ${props => 
    props.variant === 'danger' ? 'linear-gradient(45deg, #ff4444, #cc0000)' :
    props.variant === 'success' ? 'linear-gradient(45deg, #44ff44, #00cc00)' :
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

const StatusDisplay = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  border: 1px solid #333;
`;

const ErrorPanel = styled.div<{ show: boolean }>`
  background: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff4444;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  display: ${props => props.show ? 'block' : 'none'};
  animation: ${props => props.show ? 'errorPulse 2s ease-in-out' : 'none'};

  @keyframes errorPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const StepIndicator = styled.div`
  background: rgba(0, 100, 200, 0.2);
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  border-left: 3px solid #0099ff;
`;

const MemoryVisualization: React.FC<{
  state: MoveState;
  smartPtrs: SmartPtrVisual[];
  memoryBlocks: MemoryBlock[];
}> = ({ state, smartPtrs, memoryBlocks }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const SmartPointer = ({ ptr }: { ptr: SmartPtrVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current) {
        if (ptr.isMoved) {
          meshRef.current.rotation.z += 0.01;
          const scale = 0.7 + Math.sin(Date.now() * 0.01) * 0.1;
          meshRef.current.scale.setScalar(scale);
        } else if (ptr.hasObject && ptr.isActive) {
          meshRef.current.rotation.z += 0.05;
        }
      }
    });

    const getColor = () => {
      if (ptr.isMoved) return '#666666';
      if (ptr.hasObject) return '#00ff88';
      return '#333333';
    };

    return (
      <group position={ptr.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 0.8, 0.3]} />
          <meshStandardMaterial 
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={ptr.hasObject && !ptr.isMoved ? 0.3 : 0}
            transparent
            opacity={ptr.isMoved ? 0.4 : 0.9}
          />
        </mesh>
        
        <Text
          position={[0, -1, 0]}
          fontSize={0.3}
          color={ptr.isMoved ? '#666666' : ptr.hasObject ? '#00ff88' : '#999999'}
          anchorX="center"
          anchorY="middle"
        >
          {ptr.name}
        </Text>

        {ptr.isMoved && (
          <Text
            position={[0, -1.4, 0]}
            fontSize={0.2}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            (moved-from)
          </Text>
        )}

        {ptr.hasObject && !ptr.isMoved && (
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.25}
            color="#66ccff"
            anchorX="center"
            anchorY="middle"
          >
            valor: {ptr.value}
          </Text>
        )}
      </group>
    );
  };

  const MemoryBlock = ({ block }: { block: MemoryBlock }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current) {
        if (block.isMoving) {
          meshRef.current.rotation.x += 0.1;
          meshRef.current.rotation.y += 0.1;
        }
      }
    });

    return (
      <group position={block.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {block.value}
        </Text>
        
        {block.owner && (
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            owner: {block.owner}
          </Text>
        )}

        {block.isMoving && (
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.2}
            color="#ffaa00"
            anchorX="center"
            anchorY="middle"
          >
            transferring...
          </Text>
        )}
      </group>
    );
  };

  const OwnershipArrow = ({ from, to, color, isDashed = false }: {
    from: [number, number, number];
    to: [number, number, number];
    color: string;
    isDashed?: boolean;
  }) => {
    const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const length = direction.length();
    direction.normalize();

    return (
      <group position={from}>
        <mesh rotation={[0, 0, Math.atan2(direction.y, direction.x)]}>
          <cylinderGeometry args={[0.05, 0.05, length, 8]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.3}
            transparent
            opacity={isDashed ? 0.3 : 0.8}
          />
        </mesh>
      </group>
    );
  };

  const CompilerError = () => {
    if (!state.error) return null;

    return (
      <group position={[0, -3, 0]}>
        <mesh>
          <boxGeometry args={[6, 1, 0.1]} />
          <meshStandardMaterial 
            color="#ff4444"
            emissive="#ff4444"
            emissiveIntensity={0.5}
          />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          COMPILER ERROR
        </Text>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066cc" />

      {smartPtrs.map(ptr => (
        <SmartPointer key={ptr.id} ptr={ptr} />
      ))}

      {memoryBlocks.map(block => (
        <MemoryBlock key={block.id} block={block} />
      ))}

      {smartPtrs.length >= 2 && memoryBlocks.length > 0 && !state.ptr1.isMoved && state.ptr1.hasObject && (
        <OwnershipArrow 
          from={smartPtrs[0].position} 
          to={memoryBlocks[0].position} 
          color="#00ff88"
        />
      )}

      {smartPtrs.length >= 2 && memoryBlocks.length > 0 && !state.ptr2.isMoved && state.ptr2.hasObject && (
        <OwnershipArrow 
          from={smartPtrs[1].position} 
          to={memoryBlocks[0].position} 
          color="#00ff88"
        />
      )}

      {state.animatingMove && memoryBlocks.length > 0 && (
        <OwnershipArrow 
          from={[-3, 2, 0]} 
          to={[3, 2, 0]} 
          color="#ffaa00"
          isDashed={true}
        />
      )}

      <CompilerError />

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

export const Lesson12_UniquePtrMovable: React.FC = () => {
  const [state, setState] = useState<MoveState>({
    ptr1: { hasObject: false, value: 0, name: 'ptr1', isMoved: false },
    ptr2: { hasObject: false, value: 0, name: 'ptr2', isMoved: false },
    operation: 'none',
    message: 'unique_ptr es move-only: no copiable, solo movible',
    error: null,
    currentStep: 0,
    animatingMove: false
  });

  const [smartPtrs, setSmartPtrs] = useState<SmartPtrVisual[]>([
    {
      id: 'ptr1',
      name: 'ptr1',
      hasObject: false,
      value: 0,
      position: [-3, 2, 0],
      isMoved: false,
      isActive: true
    },
    {
      id: 'ptr2',
      name: 'ptr2',
      hasObject: false,
      value: 0,
      position: [3, 2, 0],
      isMoved: false,
      isActive: true
    }
  ]);

  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([]);

  const createPtr1 = () => {
    setState(prev => ({
      ...prev,
      ptr1: { hasObject: true, value: 42, name: 'ptr1', isMoved: false },
      operation: 'none',
      message: 'auto ptr1 = std::make_unique<int>(42) - objeto creado',
      error: null,
      currentStep: 1
    }));

    setSmartPtrs(prev => prev.map(ptr => 
      ptr.id === 'ptr1' ? { ...ptr, hasObject: true, value: 42, isMoved: false } : ptr
    ));

    setMemoryBlocks([{
      id: 'memory1',
      value: 42,
      owner: 'ptr1',
      position: [0, 0, 0],
      isMoving: false
    }]);
  };

  const demonstrateMoveConstructor = () => {
    setState(prev => ({
      ...prev,
      operation: 'move_constructor',
      ptr1: { ...prev.ptr1, isMoved: true },
      ptr2: { hasObject: true, value: prev.ptr1.value, name: 'ptr2', isMoved: false },
      message: 'auto ptr2 = std::move(ptr1) - move constructor, ownership transferido',
      error: null,
      currentStep: 2,
      animatingMove: true
    }));

    setTimeout(() => {
      setSmartPtrs(prev => prev.map(ptr => {
        if (ptr.id === 'ptr1') return { ...ptr, hasObject: false, isMoved: true };
        if (ptr.id === 'ptr2') return { ...ptr, hasObject: true, value: 42, isMoved: false };
        return ptr;
      }));

      setMemoryBlocks(prev => prev.map(block => ({
        ...block,
        owner: 'ptr2'
      })));

      setState(prev => ({
        ...prev,
        animatingMove: false
      }));
    }, 1500);
  };

  const demonstrateMoveAssignment = () => {
    createPtr1();
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        operation: 'move_assignment',
        ptr1: { ...prev.ptr1, isMoved: true },
        ptr2: { hasObject: true, value: prev.ptr1.value, name: 'ptr2', isMoved: false },
        message: 'ptr2 = std::move(ptr1) - move assignment operator',
        error: null,
        currentStep: 3,
        animatingMove: true
      }));

      setTimeout(() => {
        setSmartPtrs(prev => prev.map(ptr => {
          if (ptr.id === 'ptr1') return { ...ptr, hasObject: false, isMoved: true };
          if (ptr.id === 'ptr2') return { ...ptr, hasObject: true, value: 42, isMoved: false };
          return ptr;
        }));

        setMemoryBlocks(prev => prev.map(block => ({
          ...block,
          owner: 'ptr2'
        })));

        setState(prev => ({
          ...prev,
          animatingMove: false
        }));
      }, 1500);
    }, 500);
  };

  const attemptCopy = () => {
    setState(prev => ({
      ...prev,
      operation: 'copy_attempt',
      message: '❌ auto ptr2 = ptr1 - ERROR: copy constructor está eliminado',
      error: 'error: call to deleted constructor of std::unique_ptr<int>',
      currentStep: 4
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        error: null,
        message: 'unique_ptr previene copias accidentales'
      }));
    }, 3000);
  };

  const demonstrateReturnMove = () => {
    setState(prev => ({
      ...prev,
      operation: 'return_move',
      message: 'return std::move(ptr) - move explícito desde función',
      error: null,
      currentStep: 5
    }));
  };

  const demonstrateAutoMove = () => {
    setState(prev => ({
      ...prev,
      message: 'return ptr - RVO/NRVO: move automático en return',
      currentStep: 6
    }));
  };

  const accessMovedFrom = () => {
    if (!state.ptr1.isMoved) {
      setState(prev => ({
        ...prev,
        message: 'ptr1 aún es válido - no está en estado moved-from'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      message: '⚠️ ptr1.get() == nullptr - estado moved-from válido pero vacío',
      error: null
    }));
  };

  const resetScene = () => {
    setState({
      ptr1: { hasObject: false, value: 0, name: 'ptr1', isMoved: false },
      ptr2: { hasObject: false, value: 0, name: 'ptr2', isMoved: false },
      operation: 'none',
      message: 'Escena reiniciada - listos para demostrar move semantics',
      error: null,
      currentStep: 0,
      animatingMove: false
    });

    setSmartPtrs([
      {
        id: 'ptr1',
        name: 'ptr1',
        hasObject: false,
        value: 0,
        position: [-3, 2, 0],
        isMoved: false,
        isActive: true
      },
      {
        id: 'ptr2',
        name: 'ptr2',
        hasObject: false,
        value: 0,
        position: [3, 2, 0],
        isMoved: false,
        isActive: true
      }
    ]);

    setMemoryBlocks([]);
  };

  return (
    <Container>
      <Header>
        <Title>Lección 12: unique_ptr Move Semantics</Title>
        <Subtitle>No Copiable, Solo Movible - Transferencia de Ownership</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <MemoryVisualization state={state} smartPtrs={smartPtrs} memoryBlocks={memoryBlocks} />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>🚀 Move Semantics</h3>
            <p>unique_ptr es move-only: elimina copy constructor y copy assignment:</p>
            <CodeBlock>{`// ✅ Válido: move constructor
auto ptr1 = std::make_unique<int>(42);
auto ptr2 = std::move(ptr1);  // ptr1 queda vacío

// ✅ Válido: move assignment  
ptr2 = std::move(ptr1);

// ❌ COMPILACIÓN ERROR: no copiable
auto ptr3 = ptr1;  // deleted function
ptr3 = ptr2;       // deleted function`}</CodeBlock>
          </TheorySection>

          <StepIndicator>
            <strong>Paso {state.currentStep}/6:</strong> {
              state.currentStep === 0 ? 'Listo para comenzar' :
              state.currentStep === 1 ? 'Objeto creado en ptr1' :
              state.currentStep === 2 ? 'Move constructor ejecutado' :
              state.currentStep === 3 ? 'Move assignment ejecutado' :
              state.currentStep === 4 ? 'Copy attempt (error)' :
              state.currentStep === 5 ? 'Return con std::move' :
              'Return con RVO/NRVO'
            }
          </StepIndicator>

          <div>
            <h4>🎮 Demostración Paso a Paso</h4>
            
            <Button onClick={createPtr1} variant="primary">
              1. Crear ptr1
            </Button>
            
            <Button 
              onClick={demonstrateMoveConstructor}
              disabled={!state.ptr1.hasObject || state.ptr1.isMoved}
              variant="success"
            >
              2. Move Constructor
            </Button>
            
            <Button onClick={demonstrateMoveAssignment} variant="success">
              3. Move Assignment
            </Button>
            
            <Button onClick={attemptCopy} variant="danger">
              4. ❌ Intentar Copy
            </Button>
          </div>

          <div>
            <h4>📤 Return Patterns</h4>
            
            <Button onClick={demonstrateReturnMove} variant="secondary">
              return std::move(ptr)
            </Button>
            
            <Button onClick={demonstrateAutoMove} variant="secondary">
              return ptr (RVO)
            </Button>
          </div>

          <div>
            <h4>🔍 Estado Moved-From</h4>
            
            <Button 
              onClick={accessMovedFrom}
              disabled={!state.ptr1.isMoved}
              variant="secondary"
            >
              Acceder ptr1 moved-from
            </Button>
          </div>

          <ErrorPanel show={!!state.error}>
            <h4>💥 Error de Compilación</h4>
            <code>{state.error}</code>
            <p>unique_ptr elimina explícitamente el copy constructor para prevenir ownership compartido accidental.</p>
          </ErrorPanel>

          <StatusDisplay>
            <h4>📊 Estado de Punteros</h4>
            <div>
              ptr1: {state.ptr1.hasObject ? `valor ${state.ptr1.value}` : 'vacío'}
              {state.ptr1.isMoved && ' (moved-from)'}
            </div>
            <div>
              ptr2: {state.ptr2.hasObject ? `valor ${state.ptr2.value}` : 'vacío'}
              {state.ptr2.isMoved && ' (moved-from)'}
            </div>
            <div>Operación: {state.operation}</div>
            {state.animatingMove && <div>🔄 Transfiriendo ownership...</div>}
          </StatusDisplay>

          <TheorySection>
            <h4>🎯 Puntos Clave</h4>
            <ul>
              <li><strong>Move-only:</strong> Copy constructor/assignment eliminados</li>
              <li><strong>std::move:</strong> Cast a rvalue reference</li>
              <li><strong>Moved-from:</strong> Estado válido pero no especificado</li>
              <li><strong>Exception-safe:</strong> Move no puede fallar</li>
              <li><strong>Zero-cost:</strong> Solo transferencia de puntero</li>
              <li><strong>RVO/NRVO:</strong> Return automático sin std::move</li>
              <li><strong>Compilación:</strong> Errores detectados en tiempo de compilación</li>
            </ul>
          </TheorySection>

          <TheorySection>
            <h4>📋 Moved-From State</h4>
            <CodeBlock>{`// Después de std::move(ptr1)
assert(ptr1.get() == nullptr);   // ✅ Garantizado
assert(ptr1 == nullptr);         // ✅ Equivalente  

// ptr1 sigue siendo destructible
ptr1.reset();                    // ✅ Válido (no-op)
ptr1 = std::make_unique<int>(99); // ✅ Reutilizable`}</CodeBlock>
          </TheorySection>

          <Button onClick={resetScene} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};