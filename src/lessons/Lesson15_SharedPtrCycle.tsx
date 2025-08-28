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
  CodeBlock,
  InteractiveSection,
  theme,
  StatusDisplay,
  ButtonGroup,
  Button
} from '../design-system';

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

const LeakWarning = ({ show, children }: { show: boolean; children: React.ReactNode }) => (
  <div style={{
    background: 'rgba(255, 0, 0, 0.2)',
    border: '2px solid #ff4444',
    borderRadius: '8px',
    padding: '15px',
    margin: '15px 0',
    display: show ? 'block' : 'none',
    animation: show ? 'warningPulse 2s ease-in-out infinite' : 'none'
  }}>
    <style>{`
      @keyframes warningPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `}</style>
    {children}
  </div>
);

const StepIndicator = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'monospace',
    fontSize: '0.9em',
    color: '#cccccc'
  }}>
    {children}
  </div>
);

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

const Lesson15_SharedPtrCycle: React.FC = () => {
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

  const { updateProgress } = useApp();
  
  useEffect(() => {
    updateProgress(15, {
      completed: false,
      timeSpent: 0,
      hintsUsed: 0,
      errors: 0
    });
  }, [updateProgress]);

  const lessonColors = theme.colors.intermediate;

  return (
    <LessonLayout
      title="Lección 15: shared_ptr Cycles"
      subtitle="Referencias Circulares y Solución con weak_ptr"
      lessonNumber={15}
      topic="intermediate"
    >
      <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <MemoryVisualization state={state} />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <TheoryPanel>
          <Section>
            <SectionTitle>🔄 Ciclos con shared_ptr</SectionTitle>
<p>Referencias circulares impiden la destrucción automática:</p>
            <CodeBlock language="cpp">{`struct Node {
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
          </Section>

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

          <InteractiveSection>
          <SectionTitle>🎮 Demostración del Problema</SectionTitle>
            
            <ButtonGroup>
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
          </ButtonGroup>
          </InteractiveSection>

          <InteractiveSection>
          <SectionTitle>✅ Solución con weak_ptr</SectionTitle>
<ButtonGroup>
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
          </ButtonGroup>
          </InteractiveSection>

          <InteractiveSection>
          <SectionTitle>🔍 Utilidades</SectionTitle>
<Button onClick={demonstrateWeakPtrAccess}>
              weak_ptr.lock() demo
            </Button>
          </InteractiveSection>

          <LeakWarning show={state.hasLeak}>
            <SectionTitle>⚠️ MEMORY LEAK DETECTADO</SectionTitle>
<p>Los objetos se referencian mutuamente con shared_ptr. Sus use_count nunca llegará a 0, por lo que nunca serán destruidos automáticamente.</p>
            <p><strong>Solución:</strong> Usar weak_ptr para romper una de las referencias.</p>
          </LeakWarning>

          <StatusDisplay>
            <SectionTitle>📊 Estado del Sistema</SectionTitle>
            <div>Nodos activos: {state.nodes.filter(n => n.isAlive).length}</div>
            <div>Cycle detectado: {state.hasCycle ? 'Sí' : 'No'}</div>
            <div>Memory leak: {state.hasLeak ? '⚠️ SÍ' : '✅ No'}</div>
            <div>Uso de memoria: {state.memoryUsage} bytes</div>
            <div>Operación actual: {state.operation}</div>
          </StatusDisplay>

          <Section>
            <SectionTitle>🛠️ Solución: weak_ptr</SectionTitle>
            <CodeBlock language="cpp">{`struct Node {
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
          </Section>

          <Section>
            <SectionTitle>🎯 Estrategias Anti-Cycle</SectionTitle>
            <ul>
              <li><strong>Parent-Child:</strong> Parent tiene shared_ptr, Child tiene weak_ptr</li>
              <li><strong>Observer pattern:</strong> Observers con weak_ptr a Subject</li>
              <li><strong>Cache systems:</strong> weak_ptr para referencias temporales</li>
              <li><strong>Callback systems:</strong> weak_ptr para evitar dangling callbacks</li>
              <li><strong>Tree structures:</strong> Solo parent-&gt;child con shared_ptr</li>
              <li><strong>Graph algorithms:</strong> Romper cycles con weak_ptr edges</li>
            </ul>
          </Section>

          <Section>
            <SectionTitle>🔍 Detección de Cycles</SectionTitle>
            <CodeBlock language="cpp">{`// Runtime leak detection (debugging)
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
          </Section>

          <Button onClick={resetScene} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
              </TheoryPanel>
    </LessonLayout>
  );
};

export default Lesson15_SharedPtrCycle;