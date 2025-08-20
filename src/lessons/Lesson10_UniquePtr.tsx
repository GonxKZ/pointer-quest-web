import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface SmartPtrState {
  hasObject: boolean;
  value: number;
  operation: 'none' | 'make_unique' | 'reset' | 'release' | 'get' | 'swap';
  rawPtr: {
    visible: boolean;
    value: number | null;
  };
  message: string;
  swapPartner: {
    hasObject: boolean;
    value: number;
  };
}

interface MemoryBlock {
  id: string;
  value: number;
  owner: 'unique_ptr' | 'unique_ptr2' | 'raw' | null;
  position: [number, number, number];
  isActive: boolean;
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

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => 
    props.variant === 'danger' ? 'linear-gradient(45deg, #ff4444, #cc0000)' :
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

const MemoryVisualization: React.FC<{
  state: SmartPtrState;
  memoryBlocks: MemoryBlock[];
}> = ({ state, memoryBlocks }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const SmartPointer = ({ position, hasObject, label, color }: {
    position: [number, number, number];
    hasObject: boolean;
    label: string;
    color: string;
  }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && hasObject) {
        meshRef.current.rotation.z += 0.05;
      }
    });

    return (
      <group position={position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 0.8, 0.3]} />
          <meshStandardMaterial 
            color={hasObject ? color : '#333333'}
            emissive={hasObject ? color : '#000000'}
            emissiveIntensity={hasObject ? 0.3 : 0}
          />
        </mesh>
        <Text
          position={[0, -1, 0]}
          fontSize={0.3}
          color={hasObject ? color : '#666666'}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    );
  };

  const MemoryBlock = ({ block }: { block: MemoryBlock }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && block.isActive) {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.1);
      }
    });

    const getBlockColor = () => {
      switch (block.owner) {
        case 'unique_ptr': return '#00ff88';
        case 'unique_ptr2': return '#ff8800';
        case 'raw': return '#ff4444';
        default: return '#666666';
      }
    };

    return (
      <group position={block.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={getBlockColor()}
            emissive={getBlockColor()}
            emissiveIntensity={block.isActive ? 0.4 : 0.1}
            transparent
            opacity={block.owner ? 0.8 : 0.3}
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
            {block.owner}
          </Text>
        )}
      </group>
    );
  };

  const OwnershipArrow = ({ from, to, color }: {
    from: [number, number, number];
    to: [number, number, number];
    color: string;
  }) => {
    const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const length = direction.length();
    direction.normalize();

    return (
      <group position={from}>
        <mesh rotation={[0, 0, Math.atan2(direction.y, direction.x)]}>
          <cylinderGeometry args={[0.05, 0.05, length, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066cc" />

      <SmartPointer 
        position={[-4, 2, 0]} 
        hasObject={state.hasObject} 
        label="unique_ptr<int>" 
        color="#00ff88"
      />

      <SmartPointer 
        position={[4, 2, 0]} 
        hasObject={state.swapPartner.hasObject} 
        label="unique_ptr2<int>" 
        color="#ff8800"
      />

      {state.rawPtr.visible && (
        <group position={[-4, -2, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.6, 0.2]} />
            <meshStandardMaterial 
              color="#ff4444"
              emissive="#ff4444"
              emissiveIntensity={0.2}
            />
          </mesh>
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.25}
            color="#ff4444"
            anchorX="center"
            anchorY="middle"
          >
            int* raw = {state.rawPtr.value !== null ? state.rawPtr.value : 'nullptr'}
          </Text>
        </group>
      )}

      {memoryBlocks.map(block => (
        <MemoryBlock key={block.id} block={block} />
      ))}

      {state.hasObject && memoryBlocks.find(b => b.owner === 'unique_ptr') && (
        <OwnershipArrow 
          from={[-4, 2, 0]} 
          to={memoryBlocks.find(b => b.owner === 'unique_ptr')!.position} 
          color="#00ff88"
        />
      )}

      {state.swapPartner.hasObject && memoryBlocks.find(b => b.owner === 'unique_ptr2') && (
        <OwnershipArrow 
          from={[4, 2, 0]} 
          to={memoryBlocks.find(b => b.owner === 'unique_ptr2')!.position} 
          color="#ff8800"
        />
      )}

      <Text
        position={[0, -4, 0]}
        fontSize={0.4}
        color="#66ccff"
        anchorX="center"
        anchorY="middle"
      >
        {state.message}
      </Text>
    </group>
  );
};

export const Lesson10_UniquePtr: React.FC = () => {
  const [state, setState] = useState<SmartPtrState>({
    hasObject: false,
    value: 0,
    operation: 'none',
    rawPtr: { visible: false, value: null },
    message: 'std::unique_ptr<int> vacío - propiedad exclusiva garantizada',
    swapPartner: { hasObject: false, value: 0 }
  });

  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([]);

  const createMemoryBlock = (value: number, owner: 'unique_ptr' | 'unique_ptr2' | 'raw', position: [number, number, number]): MemoryBlock => ({
    id: `block_${Date.now()}_${Math.random()}`,
    value,
    owner,
    position,
    isActive: true
  });

  const demonstrateMakeUnique = () => {
    setState(prev => ({
      ...prev,
      operation: 'make_unique',
      hasObject: true,
      value: 42,
      message: 'auto ptr = std::make_unique<int>(42) - asignación segura en heap'
    }));

    const newBlock = createMemoryBlock(42, 'unique_ptr', [0, 0, 0]);
    setMemoryBlocks([newBlock]);
  };

  const demonstrateReset = () => {
    if (!state.hasObject) {
      setState(prev => ({
        ...prev,
        message: 'Error: unique_ptr está vacío, no hay nada que resetear'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'reset',
      hasObject: false,
      value: 0,
      message: 'ptr.reset() - destructor llamado automáticamente, memoria liberada'
    }));

    setMemoryBlocks(prev => prev.map(block => 
      block.owner === 'unique_ptr' ? { ...block, owner: null, isActive: false } : block
    ));

    setTimeout(() => {
      setMemoryBlocks(prev => prev.filter(block => block.owner !== null));
    }, 2000);
  };

  const demonstrateResetWithValue = () => {
    setState(prev => ({
      ...prev,
      operation: 'reset',
      hasObject: true,
      value: 99,
      message: 'ptr.reset(new int(99)) - destruye objeto anterior y asigna nuevo'
    }));

    setMemoryBlocks(prev => {
      const filtered = prev.filter(block => block.owner !== 'unique_ptr');
      const newBlock = createMemoryBlock(99, 'unique_ptr', [0, 0, 0]);
      return [...filtered, newBlock];
    });
  };

  const demonstrateRelease = () => {
    if (!state.hasObject) {
      setState(prev => ({
        ...prev,
        message: 'Error: unique_ptr está vacío, no se puede liberar ownership'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'release',
      hasObject: false,
      rawPtr: { visible: true, value: prev.value },
      message: 'int* raw = ptr.release() - transfiere ownership a puntero crudo'
    }));

    setMemoryBlocks(prev => prev.map(block => 
      block.owner === 'unique_ptr' ? { ...block, owner: 'raw' } : block
    ));
  };

  const demonstrateGet = () => {
    if (!state.hasObject) {
      setState(prev => ({
        ...prev,
        message: 'ptr.get() retorna nullptr - no hay objeto'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'get',
      message: `ptr.get() = 0x${Math.floor(Math.random() * 0xFFFFFF).toString(16)} - acceso sin transferir ownership`
    }));
  };

  const demonstrateSwap = () => {
    setState(prev => ({
      ...prev,
      operation: 'swap',
      hasObject: !prev.hasObject && prev.swapPartner.hasObject,
      swapPartner: { 
        hasObject: prev.hasObject, 
        value: prev.hasObject ? prev.value : 0 
      },
      value: prev.swapPartner.hasObject ? prev.swapPartner.value : 0,
      message: 'ptr.swap(ptr2) - intercambio atómico de ownership'
    }));

    setMemoryBlocks(prev => prev.map(block => {
      if (block.owner === 'unique_ptr') return { ...block, owner: 'unique_ptr2' };
      if (block.owner === 'unique_ptr2') return { ...block, owner: 'unique_ptr' };
      return block;
    }));
  };

  const createSecondPtr = () => {
    setState(prev => ({
      ...prev,
      swapPartner: { hasObject: true, value: 77 },
      message: 'auto ptr2 = std::make_unique<int>(77) - segundo unique_ptr creado'
    }));

    const newBlock = createMemoryBlock(77, 'unique_ptr2', [2, 0, 0]);
    setMemoryBlocks(prev => [...prev, newBlock]);
  };

  const resetScene = () => {
    setState({
      hasObject: false,
      value: 0,
      operation: 'none',
      rawPtr: { visible: false, value: null },
      message: 'Escena reiniciada - todos los unique_ptr destruidos',
      swapPartner: { hasObject: false, value: 0 }
    });
    setMemoryBlocks([]);
  };

  return (
    <Container>
      <Header>
        <Title>Lección 10: std::unique_ptr&lt;int&gt;</Title>
        <Subtitle>Propiedad Exclusiva y Operaciones Fundamentales</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <MemoryVisualization state={state} memoryBlocks={memoryBlocks} />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>🔒 std::unique_ptr&lt;T&gt;</h3>
            <p>Smart pointer que garantiza propiedad exclusiva de un recurso:</p>
            <CodeBlock>{`// Creación segura
auto ptr = std::make_unique<int>(42);

// Operaciones fundamentales
ptr.reset();              // Libera y destruye
ptr.reset(new int(99));   // Reemplaza objeto
int* raw = ptr.release(); // Transfiere ownership
int* observer = ptr.get(); // Acceso sin transferir
ptr.swap(other_ptr);      // Intercambio atómico`}</CodeBlock>
          </TheorySection>

          <div>
            <h4>🎮 Operaciones Básicas</h4>
            
            <Button onClick={demonstrateMakeUnique} variant="primary">
              make_unique&lt;int&gt;(42)
            </Button>
            
            <Button 
              onClick={demonstrateReset} 
              disabled={!state.hasObject}
              variant="danger"
            >
              reset()
            </Button>
            
            <Button 
              onClick={demonstrateResetWithValue}
              variant="secondary"
            >
              reset(new int(99))
            </Button>
            
            <Button 
              onClick={demonstrateRelease} 
              disabled={!state.hasObject}
              variant="danger"
            >
              release()
            </Button>
            
            <Button 
              onClick={demonstrateGet}
              disabled={!state.hasObject}
              variant="secondary"
            >
              get()
            </Button>
          </div>

          <div>
            <h4>🔄 Operaciones de Intercambio</h4>
            
            <Button onClick={createSecondPtr}>
              Crear ptr2
            </Button>
            
            <Button 
              onClick={demonstrateSwap}
              disabled={!state.hasObject && !state.swapPartner.hasObject}
            >
              swap(ptr, ptr2)
            </Button>
          </div>

          <StatusDisplay>
            <h4>📊 Estado Actual</h4>
            <div>unique_ptr: {state.hasObject ? `valor ${state.value}` : 'vacío'}</div>
            <div>unique_ptr2: {state.swapPartner.hasObject ? `valor ${state.swapPartner.value}` : 'vacío'}</div>
            <div>Operación: {state.operation}</div>
            {state.rawPtr.visible && (
              <div style={{ color: '#ff6666' }}>
                ⚠️ Raw pointer activo: {state.rawPtr.value} (requiere delete manual)
              </div>
            )}
          </StatusDisplay>

          <TheorySection>
            <h4>🎯 Puntos Clave</h4>
            <ul>
              <li><strong>make_unique:</strong> Construcción exception-safe</li>
              <li><strong>reset():</strong> Destrucción automática del objeto</li>
              <li><strong>release():</strong> Transfiere ownership (¡peligroso!)</li>
              <li><strong>get():</strong> Acceso de solo lectura al puntero</li>
              <li><strong>swap():</strong> Intercambio eficiente O(1)</li>
              <li><strong>Movible:</strong> Transferencia sin copia</li>
              <li><strong>No copiable:</strong> Previene ownership compartido</li>
            </ul>
          </TheorySection>

          <Button onClick={resetScene} variant="secondary">
            🔄 Reiniciar Escena
          </Button>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};