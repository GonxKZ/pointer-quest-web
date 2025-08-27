import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { THREE } from '../utils/three';

interface SharedPtrState {
  hasObject: boolean;
  value: number;
  useCount: number;
  operation: 'none' | 'create' | 'copy' | 'assign' | 'reset' | 'destroy';
  message: string;
  controlBlockInfo: {
    strongRefs: number;
    weakRefs: number;
    objectAlive: boolean;
    blockAlive: boolean;
  };
  sharedPtrs: Array<{
    id: string;
    name: string;
    hasObject: boolean;
    value: number;
  }>;
}

interface SharedPtrVisual {
  id: string;
  name: string;
  position: [number, number, number];
  hasObject: boolean;
  isActive: boolean;
  copyNumber: number;
}

interface ControlBlock {
  id: string;
  position: [number, number, number];
  strongRefs: number;
  weakRefs: number;
  isActive: boolean;
  objectAlive: boolean;
}

interface SharedObject {
  id: string;
  value: number;
  position: [number, number, number];
  isAlive: boolean;
  ownerCount: number;
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

const StatusDisplay = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  border: 1px solid #333;
`;

const RefCountDisplay = styled.div`
  background: rgba(0, 150, 0, 0.2);
  border: 1px solid #00aa00;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
`;

const MemoryVisualization: React.FC<{
  state: SharedPtrState;
  sharedPtrs: SharedPtrVisual[];
  controlBlock: ControlBlock | null;
  sharedObject: SharedObject | null;
}> = ({ state, sharedPtrs, controlBlock, sharedObject }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const SharedPointer = ({ ptr }: { ptr: SharedPtrVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && ptr.hasObject) {
        meshRef.current.rotation.z += 0.03;
      }
    });

    const getColor = () => {
      if (!ptr.hasObject) return '#333333';
      switch (ptr.copyNumber) {
        case 1: return '#00ff88';
        case 2: return '#ff8800';
        case 3: return '#8800ff';
        case 4: return '#ff0088';
        default: return '#00ffff';
      }
    };

    return (
      <group position={ptr.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 0.8, 0.3]} />
          <meshStandardMaterial 
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={ptr.hasObject ? 0.3 : 0}
            transparent
            opacity={ptr.hasObject ? 0.9 : 0.4}
          />
        </mesh>
        
        <Text
          position={[0, -1, 0]}
          fontSize={0.25}
          color={ptr.hasObject ? getColor() : '#666666'}
          anchorX="center"
          anchorY="middle"
        >
          {ptr.name}
        </Text>

        {ptr.hasObject && (
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.2}
            color="#66ccff"
            anchorX="center"
            anchorY="middle"
          >
            shared_ptr
          </Text>
        )}

        <Text
          position={[0, -1.3, 0]}
          fontSize={0.15}
          color="#999999"
          anchorX="center"
          anchorY="middle"
        >
          copy #{ptr.copyNumber}
        </Text>
      </group>
    );
  };

  const ControlBlockVisual = ({ block }: { block: ControlBlock }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && block.isActive) {
        meshRef.current.rotation.y += 0.05;
        const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    });

    return (
      <group position={block.position}>
        <mesh ref={meshRef}>
          <cylinderGeometry args={[1, 1, 0.5, 8]} />
          <meshStandardMaterial 
            color="#0066cc"
            emissive="#0066cc"
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.3}
          color="#66ccff"
          anchorX="center"
          anchorY="middle"
        >
          Control Block
        </Text>

        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {block.strongRefs}
        </Text>

        <Text
          position={[0, -0.4, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          strong refs
        </Text>

        {block.weakRefs > 0 && (
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.2}
            color="#ffaa00"
            anchorX="center"
            anchorY="middle"
          >
            weak: {block.weakRefs}
          </Text>
        )}
      </group>
    );
  };

  const SharedObjectVisual = ({ obj }: { obj: SharedObject }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && obj.isAlive) {
        meshRef.current.rotation.x += 0.02;
        meshRef.current.rotation.z += 0.02;
      }
    });

    return (
      <group position={obj.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial 
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={obj.isAlive ? 0.4 : 0}
            transparent
            opacity={obj.isAlive ? 0.9 : 0.3}
          />
        </mesh>
        
        <Text
          position={[0, 0, 0.7]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {obj.value}
        </Text>

        <Text
          position={[0, -1, 0]}
          fontSize={0.25}
          color={obj.isAlive ? '#00ff88' : '#666666'}
          anchorX="center"
          anchorY="middle"
        >
          Shared Object
        </Text>

        <Text
          position={[0, -1.3, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          owners: {obj.ownerCount}
        </Text>
      </group>
    );
  };

  const OwnershipArrow = ({ from, to, color, label }: {
    from: [number, number, number];
    to: [number, number, number];
    color: string;
    label?: string;
  }) => {
    const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const length = direction.length();
    direction.normalize();

    const midPoint: [number, number, number] = [
      from[0] + direction.x * length * 0.5,
      from[1] + direction.y * length * 0.5 + 0.3,
      from[2] + direction.z * length * 0.5
    ];

    return (
      <group>
        <group position={from}>
          <mesh rotation={[0, 0, Math.atan2(direction.y, direction.x)]}>
            <cylinderGeometry args={[0.03, 0.03, length, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </mesh>
        </group>
        {label && (
          <Text
            position={midPoint}
            fontSize={0.15}
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        )}
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066cc" />

      {sharedPtrs.map(ptr => (
        <SharedPointer key={ptr.id} ptr={ptr} />
      ))}

      {controlBlock && (
        <ControlBlockVisual block={controlBlock} />
      )}

      {sharedObject && (
        <SharedObjectVisual obj={sharedObject} />
      )}

      {/* Arrows from shared_ptrs to control block */}
      {controlBlock && sharedPtrs.filter(p => p.hasObject).map(ptr => (
        <OwnershipArrow 
          key={`${ptr.id}-cb`}
          from={ptr.position} 
          to={controlBlock.position} 
          color="#0066cc"
          label="ref"
        />
      ))}

      {/* Arrow from control block to object */}
      {controlBlock && sharedObject && sharedObject.isAlive && (
        <OwnershipArrow 
          from={controlBlock.position} 
          to={sharedObject.position} 
          color="#00ff88"
          label="owns"
        />
      )}

      <Text
        position={[0, -4, 0]}
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

export const Lesson14_SharedPtr: React.FC = () => {
  const [state, setState] = useState<SharedPtrState>({
    hasObject: false,
    value: 42,
    useCount: 0,
    operation: 'none',
    message: 'std::shared_ptr - ownership compartido con reference counting',
    controlBlockInfo: {
      strongRefs: 0,
      weakRefs: 0,
      objectAlive: false,
      blockAlive: false
    },
    sharedPtrs: []
  });

  const [sharedPtrs, setSharedPtrs] = useState<SharedPtrVisual[]>([]);
  const [controlBlock, setControlBlock] = useState<ControlBlock | null>(null);
  const [sharedObject, setSharedObject] = useState<SharedObject | null>(null);
  const [nextCopyNumber, setNextCopyNumber] = useState(1);

  const createFirstSharedPtr = () => {
    setState(prev => ({
      ...prev,
      hasObject: true,
      useCount: 1,
      operation: 'create',
      message: 'auto ptr1 = std::make_shared<int>(42) - control block creado',
      controlBlockInfo: {
        strongRefs: 1,
        weakRefs: 0,
        objectAlive: true,
        blockAlive: true
      },
      sharedPtrs: [{ id: 'ptr1', name: 'ptr1', hasObject: true, value: 42 }]
    }));

    setSharedPtrs([{
      id: 'ptr1',
      name: 'ptr1',
      position: [-3, 2, 0],
      hasObject: true,
      isActive: true,
      copyNumber: 1
    }]);

    setControlBlock({
      id: 'control1',
      position: [0, 0, 0],
      strongRefs: 1,
      weakRefs: 0,
      isActive: true,
      objectAlive: true
    });

    setSharedObject({
      id: 'object1',
      value: 42,
      position: [3, 0, 0],
      isAlive: true,
      ownerCount: 1
    });

    setNextCopyNumber(2);
  };

  const copySharedPtr = () => {
    if (!state.hasObject) {
      setState(prev => ({
        ...prev,
        message: 'Error: No hay shared_ptr para copiar'
      }));
      return;
    }

    const newUseCount = state.useCount + 1;
    const newPtrName = `ptr${newUseCount}`;

    setState(prev => ({
      ...prev,
      useCount: newUseCount,
      operation: 'copy',
      message: `auto ${newPtrName} = ptr1 - copy constructor, use_count = ${newUseCount}`,
      controlBlockInfo: {
        ...prev.controlBlockInfo,
        strongRefs: newUseCount
      },
      sharedPtrs: [...prev.sharedPtrs, { id: newPtrName, name: newPtrName, hasObject: true, value: 42 }]
    }));

    const positions: [number, number, number][] = [
      [-3, 2, 0], [3, 2, 0], [-3, -2, 0], [3, -2, 0], [0, 3, 0]
    ];

    setSharedPtrs(prev => [...prev, {
      id: newPtrName,
      name: newPtrName,
      position: positions[Math.min(newUseCount - 1, positions.length - 1)],
      hasObject: true,
      isActive: true,
      copyNumber: nextCopyNumber
    }]);

    setControlBlock(prev => prev ? {
      ...prev,
      strongRefs: newUseCount
    } : null);

    setSharedObject(prev => prev ? {
      ...prev,
      ownerCount: newUseCount
    } : null);

    setNextCopyNumber(prev => prev + 1);
  };

  const assignSharedPtr = () => {
    if (state.useCount < 2) {
      setState(prev => ({
        ...prev,
        message: 'Necesitas al menos 2 shared_ptrs para demostrar assignment'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'assign',
      message: 'ptr2 = ptr1 - assignment operator, reference count actualizado'
    }));
  };

  const resetOnePtr = () => {
    if (state.useCount === 0) {
      setState(prev => ({
        ...prev,
        message: 'No hay shared_ptrs para resetear'
      }));
      return;
    }

    const newUseCount = state.useCount - 1;

    setState(prev => ({
      ...prev,
      useCount: newUseCount,
      operation: 'reset',
      message: newUseCount > 0 
        ? `ptr.reset() - use_count = ${newUseCount}, objeto sigue vivo`
        : 'Último ptr.reset() - use_count = 0, objeto destruido',
      controlBlockInfo: {
        ...prev.controlBlockInfo,
        strongRefs: newUseCount,
        objectAlive: newUseCount > 0
      },
      hasObject: newUseCount > 0,
      sharedPtrs: prev.sharedPtrs.slice(0, -1)
    }));

    setSharedPtrs(prev => prev.slice(0, -1));

    setControlBlock(prev => prev ? {
      ...prev,
      strongRefs: newUseCount,
      objectAlive: newUseCount > 0
    } : null);

    if (newUseCount === 0) {
      setSharedObject(prev => prev ? {
        ...prev,
        isAlive: false,
        ownerCount: 0
      } : null);

      setTimeout(() => {
        setSharedObject(null);
        setControlBlock(null);
      }, 2000);
    } else {
      setSharedObject(prev => prev ? {
        ...prev,
        ownerCount: newUseCount
      } : null);
    }
  };

  const showUseCount = () => {
    setState(prev => ({
      ...prev,
      message: `ptr.use_count() = ${prev.useCount} - número de shared_ptrs apuntando al objeto`
    }));
  };

  const demonstrateUnique = () => {
    if (state.useCount !== 1) {
      setState(prev => ({
        ...prev,
        message: state.useCount === 0 
          ? 'No hay shared_ptr activo'
          : `ptr.unique() = false - hay ${state.useCount} propietarios`
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      message: 'ptr.unique() = true - único propietario del objeto'
    }));
  };

  const resetScene = () => {
    setState({
      hasObject: false,
      value: 42,
      useCount: 0,
      operation: 'none',
      message: 'Escena reiniciada - listo para demostrar shared_ptr',
      controlBlockInfo: {
        strongRefs: 0,
        weakRefs: 0,
        objectAlive: false,
        blockAlive: false
      },
      sharedPtrs: []
    });

    setSharedPtrs([]);
    setControlBlock(null);
    setSharedObject(null);
    setNextCopyNumber(1);
  };

  return (
    <Container>
      <Header>
        <Title>Lección 14: std::shared_ptr&lt;int&gt;</Title>
        <Subtitle>Ownership Compartido con Control Block y Reference Counting</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
            <MemoryVisualization 
              state={state} 
              sharedPtrs={sharedPtrs} 
              controlBlock={controlBlock}
              sharedObject={sharedObject}
            />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>🤝 std::shared_ptr&lt;T&gt;</h3>
            <p>Smart pointer con ownership compartido mediante reference counting:</p>
            <CodeBlock>{`// Creación con control block
auto ptr1 = std::make_shared<int>(42);

// Copy constructor - incrementa use_count
auto ptr2 = ptr1;  // use_count = 2

// Assignment - maneja reference counting
auto ptr3 = std::shared_ptr<int>{};
ptr3 = ptr1;  // use_count = 3

// Consultar reference count
std::cout << ptr1.use_count();  // 3
std::cout << ptr1.unique();     // false`}</CodeBlock>
          </TheorySection>

          <div>
            <h4>🎮 Gestión de Lifetime</h4>
            
            <Button onClick={createFirstSharedPtr} variant="primary">
              Crear primer shared_ptr
            </Button>
            
            <Button 
              onClick={copySharedPtr}
              disabled={!state.hasObject}
              variant="success"
            >
              Copiar shared_ptr
            </Button>
            
            <Button onClick={assignSharedPtr} variant="secondary">
              Assignment operator
            </Button>
          </div>

          <div>
            <h4>🔍 Consultas de Estado</h4>
            
            <Button 
              onClick={showUseCount}
              disabled={!state.hasObject}
            >
              use_count()
            </Button>
            
            <Button 
              onClick={demonstrateUnique}
              disabled={!state.hasObject}
            >
              unique()
            </Button>
          </div>

          <div>
            <h4>🗑️ Destrucción</h4>
            
            <Button 
              onClick={resetOnePtr}
              disabled={state.useCount === 0}
              variant="danger"
            >
              reset() uno
            </Button>
          </div>

          <RefCountDisplay>
            <h4>📊 Reference Counting</h4>
            <div>Strong references: {state.controlBlockInfo.strongRefs}</div>
            <div>Weak references: {state.controlBlockInfo.weakRefs}</div>
            <div>Objeto vivo: {state.controlBlockInfo.objectAlive ? 'Sí' : 'No'}</div>
            <div>Control block vivo: {state.controlBlockInfo.blockAlive ? 'Sí' : 'No'}</div>
          </RefCountDisplay>

          <StatusDisplay>
            <h4>📋 Estado Actual</h4>
            <div>Número de shared_ptrs: {state.useCount}</div>
            <div>Valor del objeto: {state.hasObject ? state.value : 'N/A'}</div>
            <div>Operación: {state.operation}</div>
            <div>shared_ptrs activos: {state.sharedPtrs.map(p => p.name).join(', ') || 'ninguno'}</div>
          </StatusDisplay>

          <TheorySection>
            <h4>🏗️ Control Block</h4>
            <p>Estructura interna que gestiona el reference counting:</p>
            <CodeBlock>{`struct ControlBlock {
    std::atomic<size_t> strong_refs;  // shared_ptr count
    std::atomic<size_t> weak_refs;    // weak_ptr count
    T* object_ptr;                    // Pointer to managed object
    Deleter deleter;                  // Custom deleter (if any)
    Allocator allocator;              // Custom allocator (if any)
};

// El objeto se destruye cuando strong_refs == 0
// El control block se destruye cuando strong_refs == 0 && weak_refs == 0`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>🎯 Puntos Clave</h4>
            <ul>
              <li><strong>Reference counting:</strong> Automático y thread-safe</li>
              <li><strong>Control block:</strong> Metadatos separados del objeto</li>
              <li><strong>Copy semantics:</strong> Incrementa use_count</li>
              <li><strong>Destrucción:</strong> Cuando use_count llega a 0</li>
              <li><strong>Thread safety:</strong> Reference count atómico</li>
              <li><strong>Overhead:</strong> 16-24 bytes por control block</li>
              <li><strong>Ciclos:</strong> Pueden crear memory leaks</li>
            </ul>
          </TheorySection>

          <TheorySection>
            <h4>⚡ Consideraciones de Performance</h4>
            <CodeBlock>{`// ✅ Eficiente: make_shared
auto ptr = std::make_shared<int>(42);  // 1 allocation

// ❌ Menos eficiente: constructor directo  
auto ptr = std::shared_ptr<int>(new int(42));  // 2 allocations

// Reference counting overhead
// - Atomic increment/decrement en copy/destructor
// - No usar en hot paths si performance es crítica`}</CodeBlock>
          </TheorySection>

          <Button onClick={resetScene} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};