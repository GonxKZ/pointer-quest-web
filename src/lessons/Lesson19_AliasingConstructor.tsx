import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface AliasingState {
  vector: {
    exists: boolean;
    elements: number[];
    capacity: number;
    dataPtr: string;
  };
  sharedPtrs: Array<{
    id: string;
    name: string;
    pointsTo: 'vector' | 'element' | 'none';
    elementIndex?: number;
    useCount: number;
    isValid: boolean;
  }>;
  operation: 'none' | 'create_vector' | 'create_aliasing' | 'reallocate' | 'access_after_realloc';
  message: string;
  reallocationRisk: {
    level: 'none' | 'medium' | 'high' | 'critical';
    reason: string;
  };
  invalidationState: {
    hasInvalidPointers: boolean;
    invalidPointers: string[];
  };
  currentStep: number;
}

interface VectorVisual {
  position: [number, number, number];
  exists: boolean;
  elements: Array<{
    value: number;
    position: [number, number, number];
    isHighlighted: boolean;
  }>;
  capacity: number;
  isReallocating: boolean;
}

interface SharedPtrVisual {
  id: string;
  name: string;
  position: [number, number, number];
  pointsTo: 'vector' | 'element' | 'none';
  elementIndex?: number;
  isValid: boolean;
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

const RiskPanel = styled.div<{ level: 'none' | 'medium' | 'high' | 'critical' }>`
  background: ${props => 
    props.level === 'critical' ? 'rgba(255, 0, 0, 0.2)' :
    props.level === 'high' ? 'rgba(255, 100, 0, 0.2)' :
    props.level === 'medium' ? 'rgba(255, 200, 0, 0.2)' :
    'rgba(0, 255, 0, 0.2)'};
  border: 1px solid ${props => 
    props.level === 'critical' ? '#ff0000' :
    props.level === 'high' ? '#ff6600' :
    props.level === 'medium' ? '#ffcc00' :
    '#00ff00'};
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
`;

const InvalidationPanel = styled.div<{ show: boolean }>`
  background: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff4444;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  display: ${props => props.show ? 'block' : 'none'};
  animation: ${props => props.show ? 'dangerPulse 2s ease-in-out infinite' : 'none'};

  @keyframes dangerPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const StatusPanel = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  border: 1px solid #333;
`;

const MemoryVisualization: React.FC<{
  state: AliasingState;
  vector: VectorVisual;
  sharedPtrs: SharedPtrVisual[];
}> = ({ state, vector, sharedPtrs }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const VectorComponent = ({ vector }: { vector: VectorVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && vector.isReallocating) {
        meshRef.current.rotation.x += 0.1;
        meshRef.current.rotation.y += 0.1;
        const scale = 1 + Math.sin(Date.now() * 0.02) * 0.2;
        meshRef.current.scale.setScalar(scale);
      }
    });

    if (!vector.exists) return null;

    return (
      <group position={vector.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[3, 1, 0.5]} />
          <meshStandardMaterial 
            color={vector.isReallocating ? '#ff4444' : '#0088ff'}
            emissive={vector.isReallocating ? '#ff4444' : '#0088ff'}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.3}
          color="#66ccff"
          anchorX="center"
          anchorY="middle"
        >
          std::vector&lt;int&gt;
        </Text>

        <Text
          position={[0, -1.9, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          capacity: {vector.capacity}
        </Text>

        {vector.isReallocating && (
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.25}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            ⚠️ REALLOCATING
          </Text>
        )}
      </group>
    );
  };

  const ElementComponent = ({ element, index }: { element: any; index: number }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && element.isHighlighted) {
        meshRef.current.rotation.z += 0.05;
        const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    });

    return (
      <group position={element.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial 
            color={element.isHighlighted ? '#ffaa00' : '#00ff88'}
            emissive={element.isHighlighted ? '#ffaa00' : '#00ff88'}
            emissiveIntensity={element.isHighlighted ? 0.5 : 0.2}
          />
        </mesh>
        
        <Text
          position={[0, 0, 0.4]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {element.value}
        </Text>

        <Text
          position={[0, -0.8, 0]}
          fontSize={0.15}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          [{index}]
        </Text>
      </group>
    );
  };

  const SharedPtrComponent = ({ ptr }: { ptr: SharedPtrVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && ptr.isActive) {
        meshRef.current.rotation.z += ptr.isValid ? 0.03 : 0.08;
      }
    });

    const getColor = () => {
      if (!ptr.isValid) return '#ff4444';
      switch (ptr.pointsTo) {
        case 'vector': return '#0088ff';
        case 'element': return '#ffaa00';
        default: return '#666666';
      }
    };

    return (
      <group position={ptr.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 0.8, 0.3]} />
          <meshStandardMaterial 
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={ptr.isValid ? 0.3 : 0.5}
            transparent
            opacity={ptr.isValid ? 0.9 : 0.6}
          />
        </mesh>
        
        <Text
          position={[0, -1, 0]}
          fontSize={0.25}
          color={getColor()}
          anchorX="center"
          anchorY="middle"
        >
          {ptr.name}
        </Text>

        <Text
          position={[0, -1.3, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          {ptr.pointsTo === 'element' && ptr.elementIndex !== undefined 
            ? `element[${ptr.elementIndex}]` 
            : ptr.pointsTo}
        </Text>

        {!ptr.isValid && (
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.2}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            INVALIDATED
          </Text>
        )}
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
          <cylinderGeometry args={[0.04, 0.04, length, 8]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.3}
            transparent
            opacity={style === 'dashed' ? 0.4 : 0.8}
          />
        </mesh>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066cc" />

      <VectorComponent vector={vector} />

      {vector.elements.map((element, index) => (
        <ElementComponent key={index} element={element} index={index} />
      ))}

      {sharedPtrs.map(ptr => (
        <SharedPtrComponent key={ptr.id} ptr={ptr} />
      ))}

      {/* Arrows from shared_ptrs to targets */}
      {sharedPtrs.map(ptr => {
        let targetPosition: [number, number, number];
        
        if (ptr.pointsTo === 'vector') {
          targetPosition = vector.position;
        } else if (ptr.pointsTo === 'element' && ptr.elementIndex !== undefined) {
          const element = vector.elements[ptr.elementIndex];
          if (element) {
            targetPosition = element.position;
          } else {
            return null;
          }
        } else {
          return null;
        }

        return (
          <ConnectionArrow 
            key={`${ptr.id}-arrow`}
            from={ptr.position} 
            to={targetPosition} 
            color={ptr.isValid ? (ptr.pointsTo === 'vector' ? '#0088ff' : '#ffaa00') : '#ff4444'}
            style={ptr.isValid ? 'solid' : 'dashed'}
          />
        );
      })}

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

export const Lesson19_AliasingConstructor: React.FC = () => {
  const [state, setState] = useState<AliasingState>({
    vector: {
      exists: false,
      elements: [],
      capacity: 4,
      dataPtr: '0x1000'
    },
    sharedPtrs: [],
    operation: 'none',
    message: 'Aliasing Constructor - shared_ptr apuntando a subcomponentes',
    reallocationRisk: {
      level: 'none',
      reason: ''
    },
    invalidationState: {
      hasInvalidPointers: false,
      invalidPointers: []
    },
    currentStep: 0
  });

  const [vector, setVector] = useState<VectorVisual>({
    position: [0, 0, 0],
    exists: false,
    elements: [],
    capacity: 4,
    isReallocating: false
  });

  const [sharedPtrs, setSharedPtrs] = useState<SharedPtrVisual[]>([]);

  const createVector = () => {
    const elements = [10, 20, 30];
    
    setState(prev => ({
      ...prev,
      vector: {
        exists: true,
        elements,
        capacity: 4,
        dataPtr: '0x1000'
      },
      operation: 'create_vector',
      message: 'auto vec_ptr = make_shared<vector<int>>{10, 20, 30} - vector compartido creado',
      currentStep: 1,
      reallocationRisk: { level: 'none', reason: '' },
      sharedPtrs: [{
        id: 'vec_ptr',
        name: 'vec_ptr',
        pointsTo: 'vector',
        useCount: 1,
        isValid: true
      }]
    }));

    setVector({
      position: [0, 0, 0],
      exists: true,
      elements: elements.map((value, index) => ({
        value,
        position: [-1 + index * 1, 1.5, 0] as [number, number, number],
        isHighlighted: false
      })),
      capacity: 4,
      isReallocating: false
    });

    setSharedPtrs([{
      id: 'vec_ptr',
      name: 'vec_ptr',
      position: [-3, 2.5, 0],
      pointsTo: 'vector',
      isValid: true,
      isActive: true
    }]);
  };

  const createAliasingPtr = () => {
    if (!state.vector.exists) {
      setState(prev => ({
        ...prev,
        message: 'Error: Necesitas crear el vector primero'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'create_aliasing',
      message: 'shared_ptr<int> elem_ptr(vec_ptr, &(*vec_ptr)[1]) - aliasing a elemento [1]',
      currentStep: 2,
      reallocationRisk: { 
        level: 'high', 
        reason: 'Puntero a elemento individual vulnerable a reallocation' 
      },
      sharedPtrs: [
        ...prev.sharedPtrs,
        {
          id: 'elem_ptr',
          name: 'elem_ptr',
          pointsTo: 'element',
          elementIndex: 1,
          useCount: 2, // Shares control block with vec_ptr
          isValid: true
        }
      ]
    }));

    setSharedPtrs(prev => [...prev, {
      id: 'elem_ptr',
      name: 'elem_ptr',
      position: [3, 2.5, 0],
      pointsTo: 'element',
      elementIndex: 1,
      isValid: true,
      isActive: true
    }]);

    setVector(prev => ({
      ...prev,
      elements: prev.elements.map((elem, index) => ({
        ...elem,
        isHighlighted: index === 1
      }))
    }));
  };

  const triggerReallocation = () => {
    if (state.vector.elements.length === 0) {
      setState(prev => ({
        ...prev,
        message: 'No hay vector para hacer reallocation'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'reallocate',
      message: '💥 vec_ptr->push_back() triggers reallocation - elem_ptr invalidated!',
      currentStep: 3,
      reallocationRisk: { 
        level: 'critical', 
        reason: 'Reallocation occurred - all element pointers invalidated' 
      },
      invalidationState: {
        hasInvalidPointers: true,
        invalidPointers: ['elem_ptr']
      },
      vector: {
        ...prev.vector,
        elements: [...prev.vector.elements, 40],
        capacity: 8,
        dataPtr: '0x2000' // New memory location
      },
      sharedPtrs: prev.sharedPtrs.map(ptr => 
        ptr.pointsTo === 'element' ? { ...ptr, isValid: false } : ptr
      )
    }));

    // Animate reallocation
    setVector(prev => ({ ...prev, isReallocating: true }));

    setTimeout(() => {
      setVector(prev => ({
        ...prev,
        elements: [10, 20, 30, 40].map((value, index) => ({
          value,
          position: [-1.5 + index * 1, 1.5, 0] as [number, number, number],
          isHighlighted: false
        })),
        capacity: 8,
        isReallocating: false
      }));

      setSharedPtrs(prev => prev.map(ptr => 
        ptr.pointsTo === 'element' ? { ...ptr, isValid: false } : ptr
      ));
    }, 2000);
  };

  const attemptAccessAfterRealloc = () => {
    setState(prev => ({
      ...prev,
      operation: 'access_after_realloc',
      message: '⚠️ *elem_ptr - UNDEFINED BEHAVIOR: accessing invalidated pointer',
      currentStep: 4
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        message: 'elem_ptr apunta a memoria liberada - crash o data corruption'
      }));
    }, 2000);
  };

  const demonstrateSafePractice = () => {
    setState(prev => ({
      ...prev,
      message: '✅ Solución: usar indices o iteradores, no punteros a elementos',
      currentStep: 5
    }));
  };

  const showProperPattern = () => {
    setState(prev => ({
      ...prev,
      message: 'size_t index = 1; auto& elem = (*vec_ptr)[index] - acceso seguro'
    }));
  };

  const resetDemo = () => {
    setState({
      vector: {
        exists: false,
        elements: [],
        capacity: 4,
        dataPtr: '0x1000'
      },
      sharedPtrs: [],
      operation: 'none',
      message: 'Demostración reiniciada - aliasing constructor risks',
      reallocationRisk: {
        level: 'none',
        reason: ''
      },
      invalidationState: {
        hasInvalidPointers: false,
        invalidPointers: []
      },
      currentStep: 0
    });

    setVector({
      position: [0, 0, 0],
      exists: false,
      elements: [],
      capacity: 4,
      isReallocating: false
    });

    setSharedPtrs([]);
  };

  return (
    <Container>
      <Header>
        <Title>Lección 19: Aliasing Constructor</Title>
        <Subtitle>shared_ptr a Subcomponentes y Riesgos de Reallocation</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <MemoryVisualization 
              state={state} 
              vector={vector}
              sharedPtrs={sharedPtrs}
            />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>🔗 Aliasing Constructor</h3>
            <p>Construir shared_ptr que apunta a subcomponente de objeto compartido:</p>
            <CodeBlock>{`// Vector compartido
auto vec_ptr = std::make_shared<std::vector<int>>(100);

// ❌ PELIGROSO: Aliasing constructor a elemento
std::shared_ptr<int> elem_ptr(vec_ptr, &(*vec_ptr)[42]);
// - elem_ptr comparte control block con vec_ptr
// - Pero apunta a elemento individual
// - Si vector se realoca, elem_ptr queda invalidado

vec_ptr->push_back(999);  // Puede trigger reallocation
// elem_ptr ahora apunta a memoria liberada!

// ✅ SEGURO: Usar índices
size_t index = 42;
auto& elem = (*vec_ptr)[index];  // Siempre válido`}</CodeBlock>
          </TheorySection>

          <div>
            <h4>🎮 Demostración del Problema</h4>
            
            <Button onClick={createVector} variant="primary">
              1. Crear vector compartido
            </Button>
            
            <Button 
              onClick={createAliasingPtr}
              disabled={!state.vector.exists}
              variant="warning"
            >
              2. ⚠️ Aliasing a elemento
            </Button>
            
            <Button 
              onClick={triggerReallocation}
              disabled={state.currentStep < 2}
              variant="danger"
            >
              3. 💥 Trigger reallocation
            </Button>
            
            <Button 
              onClick={attemptAccessAfterRealloc}
              disabled={state.currentStep < 3}
              variant="danger"
            >
              4. ❌ Access invalidated ptr
            </Button>
          </div>

          <div>
            <h4>✅ Buenas Prácticas</h4>
            
            <Button onClick={demonstrateSafePractice} variant="success">
              5. Mostrar solución segura
            </Button>
            
            <Button onClick={showProperPattern}>
              Patrón correcto
            </Button>
          </div>

          <RiskPanel level={state.reallocationRisk.level}>
            <h4>⚠️ Nivel de Riesgo: {state.reallocationRisk.level.toUpperCase()}</h4>
            {state.reallocationRisk.reason && (
              <div>{state.reallocationRisk.reason}</div>
            )}
            {state.reallocationRisk.level === 'critical' && (
              <div style={{ color: '#ff6666', fontWeight: 'bold' }}>
                🚨 PELIGRO INMEDIATO: Pointers invalidados por reallocation
              </div>
            )}
          </RiskPanel>

          <InvalidationPanel show={state.invalidationState.hasInvalidPointers}>
            <h4>💥 Pointer Invalidation Detected</h4>
            <p>Los siguientes shared_ptrs han sido invalidados:</p>
            <ul>
              {state.invalidationState.invalidPointers.map(ptr => (
                <li key={ptr} style={{ color: '#ff6666' }}>
                  {ptr} - apunta a memoria liberada
                </li>
              ))}
            </ul>
            <CodeBlock>{`// Lo que pasó internamente:
// 1. vector reallocation: old_data freed, new_data allocated
// 2. elem_ptr sigue apuntando a old_data (freed memory)
// 3. Acceder a elem_ptr = undefined behavior`}</CodeBlock>
          </InvalidationPanel>

          <StatusPanel>
            <h4>📊 Estado del Sistema</h4>
            <div>Vector exists: {state.vector.exists ? 'Sí' : 'No'}</div>
            <div>Elementos: {state.vector.elements.length}</div>
            <div>Capacidad: {state.vector.capacity}</div>
            <div>Data pointer: {state.vector.dataPtr}</div>
            <div>shared_ptrs: {state.sharedPtrs.length}</div>
            <div>Invalid pointers: {state.invalidationState.invalidPointers.length}</div>
            <div>Operación: {state.operation}</div>
          </StatusPanel>

          <TheorySection>
            <h4>🎯 Casos de Uso Legítimos</h4>
            <CodeBlock>{`// ✅ SEGURO: Aliasing a miembro estable
struct Widget {
    std::string name;
    std::array<int, 100> fixed_array;  // Size never changes
};

auto widget_ptr = std::make_shared<Widget>();
std::shared_ptr<std::string> name_ptr(widget_ptr, &widget_ptr->name);
// Safe: name is stable member, no reallocation risk

// ✅ SEGURO: Aliasing con garantías de lifetime
std::shared_ptr<int> create_alias(std::shared_ptr<std::vector<int>> vec) {
    if (vec->empty()) return nullptr;
    
    // OK if caller guarantees no modifications
    return std::shared_ptr<int>(vec, &vec->front());
}`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>🛡️ Estrategias de Mitigación</h4>
            <ul>
              <li><strong>Usar índices:</strong> size_t index en lugar de pointers</li>
              <li><strong>reserve():</strong> Pre-allocar capacidad suficiente</li>
              <li><strong>std::array:</strong> Para tamaños fijos conocidos</li>
              <li><strong>std::deque:</strong> Referencias estables (no pointers)</li>
              <li><strong>Span/string_view:</strong> Views temporales seguras</li>
              <li><strong>Documentación:</strong> Contracts claros sobre modificaciones</li>
            </ul>
          </TheorySection>

          <TheorySection>
            <h4>🔍 Detección de Bugs</h4>
            <CodeBlock>{`// Address Sanitizer detecta estos bugs:
// ==1234==ERROR: AddressSanitizer: heap-use-after-free
// READ of size 4 at 0x603000000010 thread T0

// Valgrind también:
// ==1234== Invalid read of size 4
// ==1234==    at 0x4005E4: main (test.cpp:15)

// Debug builds pueden añadir checks:
#ifdef DEBUG
    template<typename T>
    class debug_shared_ptr : public std::shared_ptr<T> {
        void check_validity() const {
            assert(this->get() != nullptr);
            // Additional validity checks...
        }
    };
#endif`}</CodeBlock>
          </TheorySection>

          <Button onClick={resetDemo} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};