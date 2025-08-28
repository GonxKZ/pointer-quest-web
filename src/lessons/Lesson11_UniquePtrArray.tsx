import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { THREE } from '../utils/three';
import { useApp } from '../context/AppContext';
import {
  LessonLayout,
  TheoryPanel,
  VisualizationPanel,
  Section,
  SectionTitle,
  Button,
  CodeBlock,
  InteractiveSection,
  theme,
  StatusDisplay,
  ButtonGroup
} from '../design-system';

interface ArrayPtrState {
  hasArray: boolean;
  arraySize: number;
  elements: number[];
  operation: 'none' | 'make_unique' | 'make_unique_for_overwrite' | 'access' | 'modify' | 'reset';
  message: string;
  currentIndex: number;
  initializationMethod: 'default' | 'overwrite' | 'value';
  memoryPattern: 'zeroed' | 'uninitialized' | 'custom';
}

interface ArrayElement {
  index: number;
  value: number;
  isAccessed: boolean;
  isModified: boolean;
  isUninitialized: boolean;
  position: [number, number, number];
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
    {children}
  </div>
);

const Input = ({ type, min, max, value, onChange, ...props }: {
  type?: string;
  min?: string;
  max?: string;
  value?: number;
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
      width: '80px'
    }}
    {...props}
  />
);

const MemoryVisualization: React.FC<{
  state: ArrayPtrState;
  elements: ArrayElement[];
}> = ({ state, elements }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const SmartPointer = ({ position, hasArray, size }: {
    position: [number, number, number];
    hasArray: boolean;
    size: number;
  }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && hasArray) {
        meshRef.current.rotation.z += 0.03;
      }
    });

    return (
      <group position={position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[2, 1, 0.4]} />
          <meshStandardMaterial 
            color={hasArray ? '#00ff88' : '#333333'}
            emissive={hasArray ? '#00ff88' : '#000000'}
            emissiveIntensity={hasArray ? 0.3 : 0}
          />
        </mesh>
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.3}
          color={hasArray ? '#00ff88' : '#666666'}
          anchorX="center"
          anchorY="middle"
        >
          unique_ptr&lt;int[]&gt;
        </Text>
        {hasArray && (
          <Text
            position={[0, -1.6, 0]}
            fontSize={0.25}
            color="#66ccff"
            anchorX="center"
            anchorY="middle"
          >
            size: {size}
          </Text>
        )}
      </group>
    );
  };

  const ArrayElement = ({ element }: { element: ArrayElement }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && element.isAccessed) {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.1);
      }
    });

    const getElementColor = () => {
      if (element.isUninitialized) return '#ff4444';
      if (element.isModified) return '#ffaa00';
      if (element.isAccessed) return '#00ffaa';
      return state.memoryPattern === 'zeroed' ? '#0088ff' : '#666666';
    };

    return (
      <group position={element.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial 
            color={getElementColor()}
            emissive={getElementColor()}
            emissiveIntensity={element.isAccessed ? 0.4 : 0.2}
            transparent
            opacity={element.isUninitialized ? 0.6 : 0.9}
          />
        </mesh>
        
        <Text
          position={[0, 0, 0.5]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {element.isUninitialized ? '?' : element.value}
        </Text>
        
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          [{element.index}]
        </Text>

        {element.isAccessed && (
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.15}
            color="#00ffaa"
            anchorX="center"
            anchorY="middle"
          >
            accessed
          </Text>
        )}

        {element.isModified && (
          <Text
            position={[0, 1, 0]}
            fontSize={0.15}
            color="#ffaa00"
            anchorX="center"
            anchorY="middle"
          >
            modified
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

  const MemoryPatternIndicator = () => {
    const position: [number, number, number] = [0, -4, 0];
    
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={
            state.memoryPattern === 'zeroed' ? '#0088ff' :
            state.memoryPattern === 'uninitialized' ? '#ff4444' : '#ffaa00'
          }
          anchorX="center"
          anchorY="middle"
        >
          Patrón: {
            state.memoryPattern === 'zeroed' ? 'Zero-initialized' :
            state.memoryPattern === 'uninitialized' ? 'Uninitialized' : 'Custom values'
          }
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
        position={[0, 3, 0]} 
        hasArray={state.hasArray} 
        size={state.arraySize}
      />

      {elements.map(element => (
        <ArrayElement key={element.index} element={element} />
      ))}

      {state.hasArray && elements.length > 0 && (
        <OwnershipArrow 
          from={[0, 3, 0]} 
          to={elements[0].position} 
          color="#00ff88"
        />
      )}

      <MemoryPatternIndicator />

      <Text
        position={[0, -5, 0]}
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

const Lesson11_UniquePtrArray: React.FC = () => {
  const [state, setState] = useState<ArrayPtrState>({
    hasArray: false,
    arraySize: 5,
    elements: [],
    operation: 'none',
    message: 'std::unique_ptr<int[]> - gestión automática de arrays dinámicos',
    currentIndex: 0,
    initializationMethod: 'default',
    memoryPattern: 'zeroed'
  });

  const [elements, setElements] = useState<ArrayElement[]>([]);
  const [accessIndex, setAccessIndex] = useState(0);
  const [newValue, setNewValue] = useState(42);

  const createElements = (size: number, pattern: 'zeroed' | 'uninitialized' | 'custom'): ArrayElement[] => {
    const newElements: ArrayElement[] = [];
    const spacing = 1.2;
    const startX = -(size - 1) * spacing / 2;

    for (let i = 0; i < size; i++) {
      const value = pattern === 'zeroed' ? 0 : 
                   pattern === 'uninitialized' ? Math.floor(Math.random() * 256) : 
                   10 + i * 5;
      
      newElements.push({
        index: i,
        value,
        isAccessed: false,
        isModified: false,
        isUninitialized: pattern === 'uninitialized',
        position: [startX + i * spacing, 0, 0]
      });
    }
    
    return newElements;
  };

  const demonstrateMakeUnique = () => {
    const size = state.arraySize;
    setState(prev => ({
      ...prev,
      operation: 'make_unique',
      hasArray: true,
      initializationMethod: 'default',
      memoryPattern: 'zeroed',
      message: `auto arr = std::make_unique<int[]>(${size}) - elementos inicializados a 0`
    }));

    const newElements = createElements(size, 'zeroed');
    setElements(newElements);
  };

  const demonstrateMakeUniqueForOverwrite = () => {
    const size = state.arraySize;
    setState(prev => ({
      ...prev,
      operation: 'make_unique_for_overwrite',
      hasArray: true,
      initializationMethod: 'overwrite',
      memoryPattern: 'uninitialized',
      message: `auto arr = std::make_unique_for_overwrite<int[]>(${size}) - memoria sin inicializar`
    }));

    const newElements = createElements(size, 'uninitialized');
    setElements(newElements);
  };

  const demonstrateValueInit = () => {
    const size = state.arraySize;
    setState(prev => ({
      ...prev,
      operation: 'make_unique',
      hasArray: true,
      initializationMethod: 'value',
      memoryPattern: 'custom',
      message: `Simulando construcción con valores personalizados`
    }));

    const newElements = createElements(size, 'custom');
    setElements(newElements);
  };

  const accessElement = () => {
    if (!state.hasArray || accessIndex >= elements.length || accessIndex < 0) {
      setState(prev => ({
        ...prev,
        message: 'Error: índice fuera de rango o array no inicializado'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'access',
      currentIndex: accessIndex,
      message: `arr[${accessIndex}] = ${elements[accessIndex].value} - acceso por índice`
    }));

    setElements(prev => prev.map(el => 
      el.index === accessIndex 
        ? { ...el, isAccessed: true }
        : { ...el, isAccessed: false }
    ));
  };

  const modifyElement = () => {
    if (!state.hasArray || accessIndex >= elements.length || accessIndex < 0) {
      setState(prev => ({
        ...prev,
        message: 'Error: índice fuera de rango o array no inicializado'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'modify',
      currentIndex: accessIndex,
      message: `arr[${accessIndex}] = ${newValue} - modificación directa`
    }));

    setElements(prev => prev.map(el => 
      el.index === accessIndex 
        ? { ...el, value: newValue, isModified: true, isUninitialized: false, isAccessed: true }
        : { ...el, isAccessed: false }
    ));
  };

  const resetArray = () => {
    setState(prev => ({
      ...prev,
      operation: 'reset',
      hasArray: false,
      message: 'arr.reset() - destructor ~T() llamado para cada elemento, memoria liberada'
    }));

    setTimeout(() => {
      setElements([]);
    }, 1000);
  };

  const changeArraySize = (newSize: number) => {
    if (newSize > 0 && newSize <= 10) {
      setState(prev => ({
        ...prev,
        arraySize: newSize,
        message: `Tamaño configurado: ${newSize} elementos`
      }));
    }
  };

  const demonstrateOutOfBounds = () => {
    setState(prev => ({
      ...prev,
      message: '⚠️ arr[999] - acceso fuera de rango! Comportamiento indefinido'
    }));
  };

  const showMemoryLayout = () => {
    setState(prev => ({
      ...prev,
      message: 'Memoria contigua: arr[0] a arr[n-1] con automatic cleanup'
    }));

    setElements(prev => prev.map((el, idx) => ({
      ...el,
      isAccessed: true
    })));

    setTimeout(() => {
      setElements(prev => prev.map(el => ({
        ...el,
        isAccessed: false
      })));
    }, 2000);
  };

  const { updateProgress } = useApp();
  
  useEffect(() => {
    updateProgress(11, {
      completed: false,
      timeSpent: 0,
      hintsUsed: 0,
      errors: 0
    });
  }, [updateProgress]);

  const lessonColors = theme.colors.intermediate; // Lección intermedia

  return (
    <LessonLayout
      title="Lección 11: std::unique_ptr<int[]>"
      subtitle="Gestión Automática de Arrays Dinámicos"
      lessonNumber={11}
      topic="intermediate"
    >
      <VisualizationPanel>
        <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
          <MemoryVisualization state={state} elements={elements} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Canvas>
      </VisualizationPanel>

      <TheoryPanel>
        <Section>
          <SectionTitle>🔢 std::unique_ptr&lt;T[]&gt;</SectionTitle>
<p>Especialización para arrays con destrucción automática:</p>
          <CodeBlock language="cpp">{`// C++14: Inicialización a cero
auto arr = std::make_unique<int[]>(size);  

// C++20: Sin inicializar (más rápido)
auto arr = std::make_unique_for_overwrite<int[]>(size);

// Acceso y modificación
arr[0] = 42;
int value = arr[3];

// Destrucción automática
arr.reset();  // delete[] llamado automáticamente`}</CodeBlock>
        </Section>

        <InteractiveSection>
          <SectionTitle>⚙️ Configuración de Array</SectionTitle>
          <InputGroup>
            <label>Tamaño:</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={state.arraySize}
              onChange={(e) => changeArraySize(parseInt(e.target.value) || 1)}
            />
          </InputGroup>
        </InteractiveSection>

        <InteractiveSection>
          <SectionTitle>🎮 Creación de Arrays</SectionTitle>
          <ButtonGroup>
            <Button onClick={demonstrateMakeUnique} variant="primary">
              make_unique&lt;int[]&gt;({state.arraySize})
            </Button>
            <Button onClick={demonstrateMakeUniqueForOverwrite} variant="warning">
              make_unique_for_overwrite&lt;int[]&gt;({state.arraySize})
            </Button>
            <Button onClick={demonstrateValueInit} variant="secondary">
              Con valores personalizados
            </Button>
          </ButtonGroup>
          </InteractiveSection>

        <InteractiveSection>
          <SectionTitle>🔍 Acceso a Elementos</SectionTitle>
          <InputGroup>
            <label>Índice:</label>
            <Input
              type="number"
              min="0"
              max={state.arraySize - 1}
              value={accessIndex}
              onChange={(e) => setAccessIndex(parseInt(e.target.value) || 0)}
            />
            <Button 
              onClick={accessElement}
              disabled={!state.hasArray}
              variant="secondary"
            >
              arr[{accessIndex}]
            </Button>
          </InputGroup>

          <InputGroup>
            <label>Nuevo valor:</label>
            <Input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(parseInt(e.target.value) || 0)}
            />
            <Button 
              onClick={modifyElement}
              disabled={!state.hasArray}
              variant="primary"
            >
              Modificar
            </Button>
          </InputGroup>
          </InteractiveSection>

        <InteractiveSection>
          <SectionTitle>🔧 Utilidades</SectionTitle>
          <ButtonGroup>
            <Button onClick={showMemoryLayout} disabled={!state.hasArray}>
              Mostrar layout
            </Button>
            <Button onClick={demonstrateOutOfBounds} variant="danger">
              Acceso fuera de rango
            </Button>
            <Button onClick={resetArray} disabled={!state.hasArray} variant="danger">
              reset()
            </Button>
          </ButtonGroup>
          </InteractiveSection>

        <StatusDisplay>
          <SectionTitle>📊 Estado del Array</SectionTitle>
          <div>Estado: {state.hasArray ? `${state.arraySize} elementos` : 'vacío'}</div>
          <div>Inicialización: {state.initializationMethod}</div>
          <div>Patrón: {state.memoryPattern}</div>
          <div>Operación: {state.operation}</div>
          {state.hasArray && (
            <div>
              Elementos modificados: {elements.filter(e => e.isModified).length}
            </div>
          )}
        </StatusDisplay>

        <Section>
          <SectionTitle>🎯 Diferencias Clave</SectionTitle>
          <ul>
            <li><strong>make_unique&lt;T[]&gt;:</strong> Inicializa a valor por defecto (0)</li>
            <li><strong>make_unique_for_overwrite:</strong> Sin inicializar (C++20)</li>
            <li><strong>Destructor:</strong> Llama delete[] automáticamente</li>
            <li><strong>operator[]:</strong> Acceso directo sin bounds checking</li>
            <li><strong>No get():</strong> Acceso directo mediante arr[i]</li>
            <li><strong>Exception-safe:</strong> Cleanup automático en excepciones</li>
            <li><strong>Move-only:</strong> No copiable, solo movible</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>⚠️ Consideraciones de Rendimiento</SectionTitle>
          <CodeBlock language="cpp">{`// Inicialización cero (más lenta)
auto safe = std::make_unique<int[]>(1000000);

// Sin inicializar (más rápida para casos específicos)
auto fast = std::make_unique_for_overwrite<int[]>(1000000);
// ¡Debe inicializar manualmente antes de usar!
std::fill_n(fast.get(), 1000000, 0);`}</CodeBlock>
        </Section>
      </TheoryPanel>
    </LessonLayout>
  );
};

export default Lesson11_UniquePtrArray;
