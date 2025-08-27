import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { THREE } from '../utils/three';

interface Node {
  id: string;
  value: number;
  position: [number, number, number];
  hasParent: boolean;
  hasChild: boolean;
  parentType: 'shared' | 'weak' | null;
  childType: 'shared' | 'weak' | null;
  useCount: number;
  weakCount: number;
  isAlive: boolean;
}

interface CycleState {
  nodes: Node[];
  hasCycle: boolean;
  hasLeak: boolean;
  operation: 'none' | 'create_nodes' | 'connect_shared' | 'create_cycle' | 'break_cycle' | 'destroy';
  message: string;
  leakDetected: boolean;
  memoryUsage: number;
  currentStep: number;
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

const LeakWarning = styled.div<{ show: boolean }>`
  background: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff4444;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  display: ${props => props.show ? 'block' : 'none'};
  animation: ${props => props.show ? 'warningPulse 2s ease-in-out infinite' : 'none'};

  @keyframes warningPulse {
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
  state: CycleState;
}> = ({ state }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const NodeComponent = ({ node }: { node: Node }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current) {
        if (state.hasCycle && node.isAlive) {
          meshRef.current.rotation.z += 0.02;
          const scale = 1 + Math.sin(Date.now() * 0.01 + node.id.charCodeAt(0)) * 0.1;
          meshRef.current.scale.setScalar(scale);
        }
      }
    });

    const getNodeColor = () => {
      if (!node.isAlive) return '#333333';
      if (state.hasLeak && node.useCount > 0) return '#ff4444';
      return '#00ff88';
    };

    return (
      <group position={node.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial 
            color={getNodeColor()}
            emissive={getNodeColor()}
            emissiveIntensity={node.isAlive ? 0.3 : 0}
            transparent
            opacity={node.isAlive ? 0.9 : 0.3}
          />
        </mesh>
        
        <Text
          position={[0, 0, 0.8]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {node.value}
        </Text>

        <Text
          position={[0, -1.2, 0]}
          fontSize={0.3}
          color={getNodeColor()}
          anchorX="center"
          anchorY="middle"
        >
          Node {node.id}
        </Text>

        <Text
          position={[0, -1.6, 0]}
          fontSize={0.2}
          color="#66ccff"
          anchorX="center"
          anchorY="middle"
        >
          use_count: {node.useCount}
        </Text>

        {node.weakCount > 0 && (
          <Text
            position={[0, -1.9, 0]}
            fontSize={0.2}
            color="#ffaa00"
            anchorX="center"
            anchorY="middle"
          >
            weak_count: {node.weakCount}
          </Text>
        )}

        {state.hasLeak && node.useCount > 0 && (
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.25}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            ⚠️ LEAKED
          </Text>
        )}
      </group>
    );
  };

  const ConnectionArrow = ({ from, to, type, label }: {
    from: [number, number, number];
    to: [number, number, number];
    type: 'shared' | 'weak';
    label: string;
  }) => {
    const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const length = direction.length();
    direction.normalize();

    const color = type === 'shared' ? '#00ff88' : '#ffaa00';
    const opacity = type === 'shared' ? 0.8 : 0.6;

    const midPoint: [number, number, number] = [
      from[0] + direction.x * length * 0.5,
      from[1] + direction.y * length * 0.5 + 0.3,
      from[2] + direction.z * length * 0.5
    ];

    return (
      <group>
        <group position={from}>
          <mesh rotation={[0, 0, Math.atan2(direction.y, direction.x)]}>
            <cylinderGeometry args={[0.05, 0.05, length, 8]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.3}
              transparent
              opacity={opacity}
            />
          </mesh>
        </group>
        
        <Text
          position={midPoint}
          fontSize={0.2}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>

        {type === 'weak' && (
          <group position={[midPoint[0], midPoint[1] - 0.3, midPoint[2]]}>
            <Text
              fontSize={0.15}
              color="#ffaa00"
              anchorX="center"
              anchorY="middle"
            >
              (weak_ptr)
            </Text>
          </group>
        )}
      </group>
    );
  };

  const CycleIndicator = () => {
    if (!state.hasCycle) return null;

    return (
      <group position={[0, -3, 0]}>
        <mesh>
          <torusGeometry args={[2, 0.1, 8, 16]} />
          <meshStandardMaterial 
            color="#ff4444"
            emissive="#ff4444"
            emissiveIntensity={0.5}
          />
        </mesh>
        <Text
          position={[0, -1, 0]}
          fontSize={0.4}
          color="#ff6666"
          anchorX="center"
          anchorY="middle"
        >
          {state.hasLeak ? '💥 MEMORY LEAK CYCLE' : '✅ CYCLE BROKEN'}
        </Text>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066cc" />

      {state.nodes.map(node => (
        <NodeComponent key={node.id} node={node} />
      ))}

      {/* Parent -> Child connections */}
      {state.nodes.map(node => {
        if (!node.hasChild) return null;
        const childNode = state.nodes.find(n => n.id !== node.id);
        if (!childNode) return null;

        return (
          <ConnectionArrow
            key={`${node.id}-child`}
            from={node.position}
            to={childNode.position}
            type={node.childType || 'shared'}
            label="child"
          />
        );
      })}

      {/* Child -> Parent connections */}
      {state.nodes.map(node => {
        if (!node.hasParent) return null;
        const parentNode = state.nodes.find(n => n.id !== node.id);
        if (!parentNode) return null;

        return (
          <ConnectionArrow
            key={`${node.id}-parent`}
            from={node.position}
            to={parentNode.position}
            type={node.parentType || 'shared'}
            label="parent"
          />
        );
      })}

      <CycleIndicator />

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

export const Lesson15_SharedPtrCycle: React.FC = () => {
  const [state, setState] = useState<CycleState>({
    nodes: [],
    hasCycle: false,
    hasLeak: false,
    operation: 'none',
    message: 'shared_ptr cycles: el problema de las referencias circulares',
    leakDetected: false,
    memoryUsage: 0,
    currentStep: 0
  });

  const createNodes = () => {
    const parentNode: Node = {
      id: 'Parent',
      value: 1,
      position: [-2, 1, 0],
      hasParent: false,
      hasChild: false,
      parentType: null,
      childType: null,
      useCount: 1,
      weakCount: 0,
      isAlive: true
    };

    const childNode: Node = {
      id: 'Child',
      value: 2,
      position: [2, 1, 0],
      hasParent: false,
      hasChild: false,
      parentType: null,
      childType: null,
      useCount: 1,
      weakCount: 0,
      isAlive: true
    };

    setState(prev => ({
      ...prev,
      nodes: [parentNode, childNode],
      operation: 'create_nodes',
      message: 'auto parent = make_shared<Node>(1), child = make_shared<Node>(2)',
      currentStep: 1,
      memoryUsage: 32, // Approximate memory for 2 nodes + control blocks
      hasLeak: false,
      hasCycle: false
    }));
  };

  const connectParentToChild = () => {
    setState(prev => ({
      ...prev,
      operation: 'connect_shared',
      message: 'parent->child = child - shared_ptr connection establecida',
      currentStep: 2,
      nodes: prev.nodes.map(node => {
        if (node.id === 'Parent') {
          return { ...node, hasChild: true, childType: 'shared' };
        }
        if (node.id === 'Child') {
          return { ...node, useCount: 2 }; // Parent holds reference
        }
        return node;
      })
    }));
  };

  const createCycleWithSharedPtr = () => {
    setState(prev => ({
      ...prev,
      operation: 'create_cycle',
      message: '💥 child->parent = parent - CYCLE CREATED! Memory leak detected',
      currentStep: 3,
      hasCycle: true,
      hasLeak: true,
      leakDetected: true,
      memoryUsage: 32, // Memory remains allocated due to cycle
      nodes: prev.nodes.map(node => {
        if (node.id === 'Child') {
          return { ...node, hasParent: true, parentType: 'shared' };
        }
        if (node.id === 'Parent') {
          return { ...node, useCount: 2 }; // Child holds reference
        }
        return node;
      })
    }));
  };

  const breakCycleWithWeakPtr = () => {
    setState(prev => ({
      ...prev,
      operation: 'break_cycle',
      message: '✅ child->parent = weak_ptr(parent) - cycle broken, leak fixed!',
      currentStep: 4,
      hasLeak: false,
      nodes: prev.nodes.map(node => {
        if (node.id === 'Child') {
          return { ...node, parentType: 'weak' };
        }
        if (node.id === 'Parent') {
          return { ...node, useCount: 1, weakCount: 1 }; // Child has weak reference
        }
        return node;
      })
    }));
  };

  const simulateDestruction = () => {
    setState(prev => ({
      ...prev,
      operation: 'destroy',
      message: 'Destructors ejecutándose en orden correcto - memoria liberada',
      currentStep: 5,
      memoryUsage: 0,
      nodes: prev.nodes.map(node => ({
        ...node,
        isAlive: false,
        useCount: 0,
        weakCount: 0
      }))
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        nodes: [],
        hasCycle: false,
        message: 'Destrucción completa - objetos removidos del heap'
      }));
    }, 2000);
  };

  const demonstrateWeakPtrAccess = () => {
    if (state.currentStep < 4) {
      setState(prev => ({
        ...prev,
        message: 'Primero necesitas romper el cycle con weak_ptr'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      message: 'if (auto locked = child->parent.lock()) { /* safe access */ }'
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        message: 'weak_ptr.lock() retorna shared_ptr válido si objeto existe'
      }));
    }, 2000);
  };

  const resetScene = () => {
    setState({
      nodes: [],
      hasCycle: false,
      hasLeak: false,
      operation: 'none',
      message: 'Demostración reiniciada - listo para mostrar cycles',
      leakDetected: false,
      memoryUsage: 0,
      currentStep: 0
    });
  };

  return (
    <Container>
      <Header>
        <Title>Lección 15: shared_ptr Cycles</Title>
        <Subtitle>Referencias Circulares y Solución con weak_ptr</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <MemoryVisualization state={state} />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>🔄 Ciclos con shared_ptr</h3>
            <p>Referencias circulares impiden la destrucción automática:</p>
            <CodeBlock>{`struct Node {
    std::shared_ptr<Node> child;
    std::shared_ptr<Node> parent;  // ❌ Cycle!
    int value;
};

auto parent = std::make_shared<Node>();
auto child = std::make_shared<Node>();

parent->child = child;    // child use_count = 2
child->parent = parent;   // parent use_count = 2

// Al salir del scope: parent y child siguen
// referenciándose mutuamente = MEMORY LEAK`}</CodeBlock>
          </TheorySection>

          <StepIndicator>
            <strong>Paso {state.currentStep}/5:</strong> {
              state.currentStep === 0 ? 'Listo para comenzar' :
              state.currentStep === 1 ? 'Nodos creados independientemente' :
              state.currentStep === 2 ? 'Parent conectado a Child' :
              state.currentStep === 3 ? 'Cycle creado - MEMORY LEAK!' :
              state.currentStep === 4 ? 'Cycle roto con weak_ptr' :
              'Destrucción ordenada completada'
            }
          </StepIndicator>

          <div>
            <h4>🎮 Demostración del Problema</h4>
            
            <Button onClick={createNodes} variant="primary">
              1. Crear Parent & Child
            </Button>
            
            <Button 
              onClick={connectParentToChild}
              disabled={state.nodes.length === 0}
              variant="secondary"
            >
              2. parent-&gt;child = child
            </Button>
            
            <Button 
              onClick={createCycleWithSharedPtr}
              disabled={state.currentStep < 2}
              variant="danger"
            >
              3. 💥 child-&gt;parent = parent
            </Button>
          </div>

          <div>
            <h4>✅ Solución con weak_ptr</h4>
            
            <Button 
              onClick={breakCycleWithWeakPtr}
              disabled={state.currentStep < 3}
              variant="success"
            >
              4. Usar weak_ptr
            </Button>
            
            <Button 
              onClick={simulateDestruction}
              disabled={state.currentStep < 4}
              variant="secondary"
            >
              5. Simular destrucción
            </Button>
          </div>

          <div>
            <h4>🔍 Utilidades</h4>
            
            <Button onClick={demonstrateWeakPtrAccess}>
              weak_ptr.lock() demo
            </Button>
          </div>

          <LeakWarning show={state.hasLeak}>
            <h4>⚠️ MEMORY LEAK DETECTADO</h4>
            <p>Los objetos se referencian mutuamente con shared_ptr. Sus use_count nunca llegará a 0, por lo que nunca serán destruidos automáticamente.</p>
            <p><strong>Solución:</strong> Usar weak_ptr para romper una de las referencias.</p>
          </LeakWarning>

          <StatusDisplay>
            <h4>📊 Estado del Sistema</h4>
            <div>Nodos activos: {state.nodes.filter(n => n.isAlive).length}</div>
            <div>Cycle detectado: {state.hasCycle ? 'Sí' : 'No'}</div>
            <div>Memory leak: {state.hasLeak ? '⚠️ SÍ' : '✅ No'}</div>
            <div>Uso de memoria: {state.memoryUsage} bytes</div>
            <div>Operación actual: {state.operation}</div>
          </StatusDisplay>

          <TheorySection>
            <h4>🛠️ Solución: weak_ptr</h4>
            <CodeBlock>{`struct Node {
    std::shared_ptr<Node> child;
    std::weak_ptr<Node> parent;    // ✅ No cycle!
    int value;
};

// Acceso seguro a parent
void useParent() {
    if (auto p = parent.lock()) {  // Returns shared_ptr
        // Safe to use p, object guaranteed alive
        std::cout << p->value;
    } else {
        // Parent was already destroyed
        std::cout << "Parent is gone\n";
    }
}`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>🎯 Estrategias Anti-Cycle</h4>
            <ul>
              <li><strong>Parent-Child:</strong> Parent tiene shared_ptr, Child tiene weak_ptr</li>
              <li><strong>Observer pattern:</strong> Observers con weak_ptr a Subject</li>
              <li><strong>Cache systems:</strong> weak_ptr para referencias temporales</li>
              <li><strong>Callback systems:</strong> weak_ptr para evitar dangling callbacks</li>
              <li><strong>Tree structures:</strong> Solo parent-&gt;child con shared_ptr</li>
              <li><strong>Graph algorithms:</strong> Romper cycles con weak_ptr edges</li>
            </ul>
          </TheorySection>

          <TheorySection>
            <h4>🔍 Detección de Cycles</h4>
            <CodeBlock>{`// Runtime leak detection (debugging)
class LeakDetector {
public:
    ~LeakDetector() {
        if (!objects_.empty()) {
            std::cerr << "LEAK: " << objects_.size() 
                      << " objects not destroyed\n";
        }
    }
private:
    static std::set<void*> objects_;
};

// Compile-time prevention
template<typename T>
concept NotSelfReferencing = requires {
    // Enforce design constraints
};`}</CodeBlock>
          </TheorySection>

          <Button onClick={resetScene} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};