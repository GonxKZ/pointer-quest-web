import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface DeleterState {
  hasFile: boolean;
  filename: string;
  deleterType: 'default' | 'function_pointer' | 'lambda' | 'functor' | 'stateful';
  operation: 'none' | 'create' | 'reset' | 'destroy';
  message: string;
  sizeInfo: {
    defaultSize: number;
    currentSize: number;
    overhead: number;
  };
  customDeleterData: string;
  deleterState: any;
}

interface DeleterVisual {
  id: string;
  type: string;
  position: [number, number, number];
  isActive: boolean;
  hasState: boolean;
  size: number;
}

interface FileResource {
  id: string;
  filename: string;
  isOpen: boolean;
  position: [number, number, number];
  deleterType: string;
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

const SizeComparison = styled.div`
  background: rgba(100, 0, 100, 0.2);
  border: 1px solid #cc00cc;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #0066cc;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  font-family: inherit;
  flex: 1;
`;

const MemoryVisualization: React.FC<{
  state: DeleterState;
  deleters: DeleterVisual[];
  fileResource: FileResource | null;
}> = ({ state, deleters, fileResource }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const SmartPointer = ({ position, hasFile, size }: {
    position: [number, number, number];
    hasFile: boolean;
    size: number;
  }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && hasFile) {
        meshRef.current.rotation.z += 0.03;
      }
    });

    const sizeMultiplier = size / 8; // Normalize to default size

    return (
      <group position={position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[2 * sizeMultiplier, 1, 0.4]} />
          <meshStandardMaterial 
            color={hasFile ? '#00ff88' : '#333333'}
            emissive={hasFile ? '#00ff88' : '#000000'}
            emissiveIntensity={hasFile ? 0.3 : 0}
          />
        </mesh>
        
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.3}
          color={hasFile ? '#00ff88' : '#666666'}
          anchorX="center"
          anchorY="middle"
        >
          unique_ptr&lt;FILE, Deleter&gt;
        </Text>
        
        <Text
          position={[0, -1.6, 0]}
          fontSize={0.25}
          color="#66ccff"
          anchorX="center"
          anchorY="middle"
        >
          size: {size} bytes
        </Text>
      </group>
    );
  };

  const DeleterComponent = ({ deleter }: { deleter: DeleterVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && deleter.isActive) {
        meshRef.current.rotation.y += 0.05;
      }
    });

    const getDeleterColor = () => {
      switch (deleter.type) {
        case 'function_pointer': return '#ff6600';
        case 'lambda': return '#6600ff';
        case 'functor': return '#00ff66';
        case 'stateful': return '#ff0066';
        default: return '#666666';
      }
    };

    return (
      <group position={deleter.position}>
        <mesh ref={meshRef}>
          <cylinderGeometry args={[0.5, 0.5, deleter.hasState ? 1.5 : 0.8, 8]} />
          <meshStandardMaterial 
            color={getDeleterColor()}
            emissive={getDeleterColor()}
            emissiveIntensity={deleter.isActive ? 0.4 : 0.1}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.25}
          color={getDeleterColor()}
          anchorX="center"
          anchorY="middle"
        >
          {deleter.type}
        </Text>

        {deleter.hasState && (
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.2}
            color="#ffaa00"
            anchorX="center"
            anchorY="middle"
          >
            state: {deleter.size - 8}B
          </Text>
        )}
      </group>
    );
  };

  const FileResource = ({ file }: { file: FileResource }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && file.isOpen) {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.1);
      }
    });

    return (
      <group position={file.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 2, 0.2]} />
          <meshStandardMaterial 
            color={file.isOpen ? '#ffaa00' : '#666666'}
            emissive={file.isOpen ? '#ffaa00' : '#000000'}
            emissiveIntensity={file.isOpen ? 0.3 : 0}
          />
        </mesh>
        
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          📄
        </Text>
        
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.25}
          color={file.isOpen ? '#ffaa00' : '#666666'}
          anchorX="center"
          anchorY="middle"
        >
          {file.filename}
        </Text>

        <Text
          position={[0, -1.8, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          deleter: {file.deleterType}
        </Text>
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

  const EmptyBaseOptimizationIndicator = () => {
    if (state.sizeInfo.overhead > 0) return null;

    return (
      <group position={[0, -3, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          ✨ Empty Base Optimization Activa
        </Text>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066cc" />

      <SmartPointer 
        position={[0, 2, 0]} 
        hasFile={state.hasFile} 
        size={state.sizeInfo.currentSize}
      />

      {deleters.map(deleter => (
        <DeleterComponent key={deleter.id} deleter={deleter} />
      ))}

      {fileResource && (
        <FileResource file={fileResource} />
      )}

      {state.hasFile && fileResource && (
        <OwnershipArrow 
          from={[0, 2, 0]} 
          to={fileResource.position} 
          color="#00ff88"
        />
      )}

      {deleters.length > 0 && (
        <OwnershipArrow 
          from={[0, 1.5, 0]} 
          to={deleters[0].position} 
          color="#ff6600"
        />
      )}

      <EmptyBaseOptimizationIndicator />

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

export const Lesson13_CustomDeleter: React.FC = () => {
  const [state, setState] = useState<DeleterState>({
    hasFile: false,
    filename: 'data.txt',
    deleterType: 'default',
    operation: 'none',
    message: 'unique_ptr con custom deleters - gestión de recursos no-array',
    sizeInfo: {
      defaultSize: 8,
      currentSize: 8,
      overhead: 0
    },
    customDeleterData: '',
    deleterState: null
  });

  const [deleters, setDeleters] = useState<DeleterVisual[]>([]);
  const [fileResource, setFileResource] = useState<FileResource | null>(null);

  const createFileWithFunctionPointer = () => {
    setState(prev => ({
      ...prev,
      hasFile: true,
      deleterType: 'function_pointer',
      operation: 'create',
      message: 'unique_ptr<FILE, decltype(&fclose)> - function pointer deleter',
      sizeInfo: {
        defaultSize: 8,
        currentSize: 8,  // Function pointer optimized
        overhead: 0
      }
    }));

    setDeleters([{
      id: 'deleter1',
      type: 'function_pointer',
      position: [-2, 0, 0],
      isActive: true,
      hasState: false,
      size: 8
    }]);

    setFileResource({
      id: 'file1',
      filename: state.filename,
      isOpen: true,
      position: [2, 0, 0],
      deleterType: 'fclose'
    });
  };

  const createFileWithLambda = () => {
    setState(prev => ({
      ...prev,
      hasFile: true,
      deleterType: 'lambda',
      operation: 'create',
      message: 'unique_ptr<FILE, decltype(lambda)> - stateless lambda deleter',
      sizeInfo: {
        defaultSize: 8,
        currentSize: 8,  // Stateless lambda optimized via EBO
        overhead: 0
      }
    }));

    setDeleters([{
      id: 'deleter1',
      type: 'lambda',
      position: [-2, 0, 0],
      isActive: true,
      hasState: false,
      size: 8
    }]);

    setFileResource({
      id: 'file1',
      filename: state.filename,
      isOpen: true,
      position: [2, 0, 0],
      deleterType: 'lambda'
    });
  };

  const createFileWithFunctor = () => {
    setState(prev => ({
      ...prev,
      hasFile: true,
      deleterType: 'functor',
      operation: 'create',
      message: 'unique_ptr<FILE, FileCloser> - functor class deleter',
      sizeInfo: {
        defaultSize: 8,
        currentSize: 8,  // Empty functor optimized via EBO
        overhead: 0
      }
    }));

    setDeleters([{
      id: 'deleter1',
      type: 'functor',
      position: [-2, 0, 0],
      isActive: true,
      hasState: false,
      size: 8
    }]);

    setFileResource({
      id: 'file1',
      filename: state.filename,
      isOpen: true,
      position: [2, 0, 0],
      deleterType: 'FileCloser'
    });
  };

  const createFileWithStatefulDeleter = () => {
    const stateSize = 16; // Example: deleter with internal state
    
    setState(prev => ({
      ...prev,
      hasFile: true,
      deleterType: 'stateful',
      operation: 'create',
      message: 'unique_ptr<FILE, StatefulDeleter> - deleter con estado interno',
      sizeInfo: {
        defaultSize: 8,
        currentSize: 8 + stateSize,  // Extra storage for deleter state
        overhead: stateSize
      },
      customDeleterData: 'log_file.txt'
    }));

    setDeleters([{
      id: 'deleter1',
      type: 'stateful',
      position: [-2, 0, 0],
      isActive: true,
      hasState: true,
      size: 8 + stateSize
    }]);

    setFileResource({
      id: 'file1',
      filename: state.filename,
      isOpen: true,
      position: [2, 0, 0],
      deleterType: 'StatefulDeleter'
    });
  };

  const demonstrateCustomDestruction = () => {
    if (!state.hasFile) {
      setState(prev => ({
        ...prev,
        message: 'Error: No hay archivo abierto para demostrar destrucción'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'destroy',
      message: `Llamando deleter personalizado: ${prev.deleterType} ejecutándose...`
    }));

    setDeleters(prev => prev.map(d => ({ ...d, isActive: true })));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        hasFile: false,
        operation: 'none',
        message: `${prev.deleterType} completado - recurso liberado correctamente`
      }));

      setFileResource(prev => prev ? { ...prev, isOpen: false } : null);
      
      setTimeout(() => {
        setFileResource(null);
        setDeleters([]);
      }, 1000);
    }, 2000);
  };

  const resetExample = () => {
    setState({
      hasFile: false,
      filename: 'data.txt',
      deleterType: 'default',
      operation: 'none',
      message: 'Ejemplo reiniciado - listo para probar custom deleters',
      sizeInfo: {
        defaultSize: 8,
        currentSize: 8,
        overhead: 0
      },
      customDeleterData: '',
      deleterState: null
    });

    setDeleters([]);
    setFileResource(null);
  };

  const changeFi

lename = (newFilename: string) => {
    setState(prev => ({
      ...prev,
      filename: newFilename
    }));
  };

  return (
    <Container>
      <Header>
        <Title>Lección 13: Custom Deleters</Title>
        <Subtitle>Gestión Personalizada de Recursos con Empty Base Optimization</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <MemoryVisualization state={state} deleters={deleters} fileResource={fileResource} />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>🗂️ Custom Deleters</h3>
            <p>unique_ptr acepta deleters personalizados para recursos no-array:</p>
            <CodeBlock>{`// Function pointer deleter
std::unique_ptr<FILE, decltype(&fclose)> file(
    fopen("data.txt", "r"), &fclose);

// Lambda deleter (stateless)
auto file_lambda = std::unique_ptr<FILE, decltype([](FILE* f){
    if(f) fclose(f);
})>(fopen("data.txt", "r"));

// Functor class deleter
struct FileCloser {
    void operator()(FILE* f) { if(f) fclose(f); }
};
std::unique_ptr<FILE, FileCloser> file_functor(
    fopen("data.txt", "r"));`}</CodeBlock>
          </TheorySection>

          <div>
            <h4>⚙️ Configuración</h4>
            
            <InputGroup>
              <label>Archivo:</label>
              <Input
                value={state.filename}
                onChange={(e) => changeFilename(e.target.value)}
                placeholder="nombre_archivo.txt"
              />
            </InputGroup>
          </div>

          <div>
            <h4>🎮 Tipos de Deleters</h4>
            
            <Button onClick={createFileWithFunctionPointer} variant="primary">
              Function Pointer
            </Button>
            
            <Button onClick={createFileWithLambda} variant="success">
              Stateless Lambda
            </Button>
            
            <Button onClick={createFileWithFunctor} variant="secondary">
              Functor Class
            </Button>
            
            <Button onClick={createFileWithStatefulDeleter} variant="warning">
              Stateful Deleter
            </Button>
          </div>

          <div>
            <h4>🔧 Operaciones</h4>
            
            <Button 
              onClick={demonstrateCustomDestruction}
              disabled={!state.hasFile}
              variant="danger"
            >
              Ejecutar Deleter
            </Button>
            
            <Button onClick={resetExample} variant="secondary">
              🔄 Reiniciar
            </Button>
          </div>

          <SizeComparison>
            <h4>📏 Análisis de Tamaño</h4>
            <div>unique_ptr por defecto: {state.sizeInfo.defaultSize} bytes</div>
            <div>Con deleter actual: {state.sizeInfo.currentSize} bytes</div>
            <div>Overhead del deleter: {state.sizeInfo.overhead} bytes</div>
            {state.sizeInfo.overhead === 0 && state.deleterType !== 'default' && (
              <div style={{ color: '#00ff88' }}>
                ✨ Empty Base Optimization aplicada!
              </div>
            )}
          </SizeComparison>

          <StatusDisplay>
            <h4>📊 Estado Actual</h4>
            <div>Archivo: {state.hasFile ? `${state.filename} (abierto)` : 'ninguno'}</div>
            <div>Deleter tipo: {state.deleterType}</div>
            <div>Operación: {state.operation}</div>
            {state.customDeleterData && (
              <div>Estado deleter: {state.customDeleterData}</div>
            )}
          </StatusDisplay>

          <TheorySection>
            <h4>🎯 Empty Base Optimization (EBO)</h4>
            <p>Cuando el deleter es stateless, C++ aplica EBO:</p>
            <CodeBlock>{`// Sin overhead de tamaño
sizeof(std::unique_ptr<FILE, decltype(&fclose)>) == 8

// Function object vacío también optimizado
sizeof(std::unique_ptr<FILE, EmptyDeleter>) == 8

// Pero deleter con estado aumenta el tamaño
sizeof(std::unique_ptr<FILE, StatefulDeleter>) > 8`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>💡 Casos de Uso Comunes</h4>
            <ul>
              <li><strong>Archivos:</strong> fclose para FILE*</li>
              <li><strong>Memory mapping:</strong> munmap para void*</li>
              <li><strong>Windows HANDLEs:</strong> CloseHandle</li>
              <li><strong>OpenGL:</strong> glDeleteTextures</li>
              <li><strong>Custom allocators:</strong> aligned_free</li>
              <li><strong>Logging:</strong> Deleters que registran destrucción</li>
              <li><strong>Networking:</strong> close para sockets</li>
            </ul>
          </TheorySection>

          <TheorySection>
            <h4>⚠️ Consideraciones</h4>
            <CodeBlock>{`// ✅ Exception-safe
auto file = std::unique_ptr<FILE, decltype(&fclose)>(
    fopen("data.txt", "r"), &fclose);
if (!file) throw std::runtime_error("Cannot open file");

// ✅ Deleter debe ser callable
struct BadDeleter { int x; }; // No operator()
// std::unique_ptr<FILE, BadDeleter> bad; // ERROR

// ✅ Deleter copiable/movible
struct GoodDeleter {
    void operator()(FILE* f) { if(f) fclose(f); }
};`}</CodeBlock>
          </TheorySection>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};