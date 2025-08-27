import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface FunctionPtrState {
  functions: Array<{
    id: string;
    name: string;
    type: 'free_function' | 'member_function' | 'lambda' | 'functor';
    signature: string;
    isActive: boolean;
  }>;
  functionPointers: Array<{
    id: string;
    name: string;
    type: 'raw_fptr' | 'std_function' | 'member_fptr' | 'auto_lambda';
    pointsTo: string | null;
    signature: string;
    overhead: number;
    canStore: string[];
  }>;
  operation: 'none' | 'create_fptr' | 'create_std_function' | 'create_member_ptr' | 'call_function' | 'demonstrate_polymorphism';
  message: string;
  currentDemo: 'basic' | 'member' | 'polymorphic';
  performanceInfo: {
    directCall: number;
    functionPointer: number;
    stdFunction: number;
    memberPointer: number;
  };
  currentStep: number;
}

interface FunctionVisual {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'free_function' | 'member_function' | 'lambda' | 'functor';
  isActive: boolean;
  isBeingCalled: boolean;
}

interface FunctionPointerVisual {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'raw_fptr' | 'std_function' | 'member_fptr' | 'auto_lambda';
  pointsTo: string | null;
  isActive: boolean;
  overhead: number;
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

const PerformancePanel = styled.div`
  background: rgba(150, 0, 150, 0.1);
  border: 1px solid #aa00aa;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#0066cc' : 'transparent'};
  color: white;
  border: 1px solid #0066cc;
  padding: 10px 15px;
  margin: 2px;
  border-radius: 5px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#0088ff' : 'rgba(0, 100, 200, 0.2)'};
  }
`;

const SignatureDisplay = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
  border: 1px solid #333;
`;

const MemoryVisualization: React.FC<{
  state: FunctionPtrState;
  functions: FunctionVisual[];
  functionPointers: FunctionPointerVisual[];
}> = ({ state, functions, functionPointers }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const FunctionComponent = ({ func }: { func: FunctionVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current) {
        if (func.isBeingCalled) {
          meshRef.current.rotation.y += 0.1;
          const scale = 1 + Math.sin(Date.now() * 0.02) * 0.2;
          meshRef.current.scale.setScalar(scale);
        } else if (func.isActive) {
          meshRef.current.rotation.y += 0.02;
        }
      }
    });

    const getFunctionColor = () => {
      switch (func.type) {
        case 'free_function': return '#00ff88';
        case 'member_function': return '#ff8800';
        case 'lambda': return '#8800ff';
        case 'functor': return '#ff0088';
        default: return '#666666';
      }
    };

    const getGeometry = () => {
      switch (func.type) {
        case 'free_function':
          return <boxGeometry args={[1.5, 1, 0.5]} />;
        case 'member_function':
          return <cylinderGeometry args={[0.8, 0.8, 1.2, 6]} />;
        case 'lambda':
          return <octahedronGeometry args={[0.8]} />;
        case 'functor':
          return <dodecahedronGeometry args={[0.7]} />;
        default:
          return <boxGeometry args={[1, 1, 1]} />;
      }
    };

    return (
      <group position={func.position}>
        <mesh ref={meshRef}>
          {getGeometry()}
          <meshStandardMaterial 
            color={getFunctionColor()}
            emissive={getFunctionColor()}
            emissiveIntensity={func.isBeingCalled ? 0.6 : func.isActive ? 0.3 : 0.1}
          />
        </mesh>
        
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.25}
          color={getFunctionColor()}
          anchorX="center"
          anchorY="middle"
        >
          {func.name}
        </Text>

        <Text
          position={[0, -1.8, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          {func.type.replace('_', ' ')}
        </Text>

        {func.isBeingCalled && (
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.2}
            color="#ffaa00"
            anchorX="center"
            anchorY="middle"
          >
            CALLING...
          </Text>
        )}
      </group>
    );
  };

  const FunctionPointerComponent = ({ fptr }: { fptr: FunctionPointerVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && fptr.isActive) {
        meshRef.current.rotation.z += 0.03;
      }
    });

    const getPointerColor = () => {
      switch (fptr.type) {
        case 'raw_fptr': return '#0088ff';
        case 'std_function': return '#66aaff';
        case 'member_fptr': return '#ff6600';
        case 'auto_lambda': return '#aa00aa';
        default: return '#666666';
      }
    };

    const getSizeMultiplier = () => {
      return 1 + (fptr.overhead / 32); // Visual size based on overhead
    };

    return (
      <group position={fptr.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5 * getSizeMultiplier(), 0.8, 0.3]} />
          <meshStandardMaterial 
            color={getPointerColor()}
            emissive={getPointerColor()}
            emissiveIntensity={fptr.isActive ? 0.3 : 0.1}
            transparent
            opacity={fptr.pointsTo ? 0.9 : 0.5}
          />
        </mesh>
        
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.25}
          color={getPointerColor()}
          anchorX="center"
          anchorY="middle"
        >
          {fptr.name}
        </Text>

        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          {fptr.type.replace('_', ' ')}
        </Text>

        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#ffcc00"
          anchorX="center"
          anchorY="middle"
        >
          {fptr.overhead}B overhead
        </Text>

        {!fptr.pointsTo && (
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.2}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            null
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
            opacity={style === 'dashed' ? 0.5 : 0.8}
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

      {functions.map(func => (
        <FunctionComponent key={func.id} func={func} />
      ))}

      {functionPointers.map(fptr => (
        <FunctionPointerComponent key={fptr.id} fptr={fptr} />
      ))}

      {/* Arrows from function pointers to functions */}
      {functionPointers.map(fptr => {
        if (!fptr.pointsTo) return null;
        
        const targetFunc = functions.find(f => f.id === fptr.pointsTo);
        if (!targetFunc) return null;

        return (
          <ConnectionArrow 
            key={`${fptr.id}-arrow`}
            from={fptr.position} 
            to={targetFunc.position} 
            color={fptr.type === 'raw_fptr' ? '#0088ff' :
                   fptr.type === 'std_function' ? '#66aaff' :
                   fptr.type === 'member_fptr' ? '#ff6600' : '#aa00aa'}
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

export const Lesson22_FunctionPointers: React.FC = () => {
  const [state, setState] = useState<FunctionPtrState>({
    functions: [],
    functionPointers: [],
    operation: 'none',
    message: 'Function pointers - indirection para código polimórfico',
    currentDemo: 'basic',
    performanceInfo: {
      directCall: 1,
      functionPointer: 1.1,
      stdFunction: 1.3,
      memberPointer: 1.2
    },
    currentStep: 0
  });

  const [functions, setFunctions] = useState<FunctionVisual[]>([]);
  const [functionPointers, setFunctionPointers] = useState<FunctionPointerVisual[]>([]);

  const createBasicFunctions = () => {
    setState(prev => ({
      ...prev,
      functions: [
        { id: 'add_func', name: 'add', type: 'free_function', signature: 'int(int, int)', isActive: true },
        { id: 'mul_func', name: 'multiply', type: 'free_function', signature: 'int(int, int)', isActive: true }
      ],
      operation: 'create_fptr',
      message: 'int add(int, int) y int multiply(int, int) - free functions creadas',
      currentStep: 1
    }));

    setFunctions([
      {
        id: 'add_func',
        name: 'add',
        position: [-2, 1, 0],
        type: 'free_function',
        isActive: true,
        isBeingCalled: false
      },
      {
        id: 'mul_func',
        name: 'multiply',
        position: [2, 1, 0],
        type: 'free_function',
        isActive: true,
        isBeingCalled: false
      }
    ]);
  };

  const createRawFunctionPointer = () => {
    setState(prev => ({
      ...prev,
      functionPointers: [
        ...prev.functionPointers,
        {
          id: 'raw_fptr',
          name: 'op_ptr',
          type: 'raw_fptr',
          pointsTo: 'add_func',
          signature: 'int(*)(int, int)',
          overhead: 8,
          canStore: ['free_function']
        }
      ],
      operation: 'create_fptr',
      message: 'int (*op_ptr)(int, int) = &add - raw function pointer creado',
      currentStep: 2
    }));

    setFunctionPointers(prev => [...prev, {
      id: 'raw_fptr',
      name: 'op_ptr',
      position: [-2, -1, 0],
      type: 'raw_fptr',
      pointsTo: 'add_func',
      isActive: true,
      overhead: 8
    }]);
  };

  const createStdFunction = () => {
    setState(prev => ({
      ...prev,
      functionPointers: [
        ...prev.functionPointers,
        {
          id: 'std_func',
          name: 'operation',
          type: 'std_function',
          pointsTo: 'mul_func',
          signature: 'std::function<int(int, int)>',
          overhead: 32,
          canStore: ['free_function', 'lambda', 'functor', 'member_function']
        }
      ],
      operation: 'create_std_function',
      message: 'std::function<int(int, int)> operation = multiply - type erasure wrapper',
      currentStep: 3
    }));

    setFunctionPointers(prev => [...prev, {
      id: 'std_func',
      name: 'operation',
      position: [2, -1, 0],
      type: 'std_function',
      pointsTo: 'mul_func',
      isActive: true,
      overhead: 32
    }]);
  };

  const createLambda = () => {
    setState(prev => ({
      ...prev,
      functions: [
        ...prev.functions,
        { id: 'lambda_func', name: 'lambda', type: 'lambda', signature: '[](int a, int b)', isActive: true }
      ],
      functionPointers: [
        ...prev.functionPointers,
        {
          id: 'auto_lambda',
          name: 'lambda_ptr',
          type: 'auto_lambda',
          pointsTo: 'lambda_func',
          signature: 'auto',
          overhead: 0,
          canStore: ['lambda']
        }
      ],
      operation: 'create_fptr',
      message: 'auto lambda_ptr = [](int a, int b) { return a - b; } - zero overhead',
      currentStep: 4
    }));

    setFunctions(prev => [...prev, {
      id: 'lambda_func',
      name: 'lambda',
      position: [0, 2, 0],
      type: 'lambda',
      isActive: true,
      isBeingCalled: false
    }]);

    setFunctionPointers(prev => [...prev, {
      id: 'auto_lambda',
      name: 'lambda_ptr',
      position: [0, -2, 0],
      type: 'auto_lambda',
      pointsTo: 'lambda_func',
      isActive: true,
      overhead: 0
    }]);
  };

  const demonstrateCall = (fptrId: string) => {
    const fptr = state.functionPointers.find(f => f.id === fptrId);
    if (!fptr || !fptr.pointsTo) return;

    setState(prev => ({
      ...prev,
      operation: 'call_function',
      message: `${fptr.name}(5, 3) - indirection call ejecutándose...`
    }));

    setFunctions(prev => prev.map(f => 
      f.id === fptr.pointsTo ? { ...f, isBeingCalled: true } : f
    ));

    setTimeout(() => {
      setFunctions(prev => prev.map(f => ({ ...f, isBeingCalled: false })));
      setState(prev => ({
        ...prev,
        message: `${fptr.name}(5, 3) completado - resultado retornado`
      }));
    }, 2000);
  };

  const createMemberFunctions = () => {
    setState(prev => ({
      ...prev,
      currentDemo: 'member',
      functions: [
        { id: 'method_func', name: 'process', type: 'member_function', signature: 'int Widget::(int)', isActive: true }
      ],
      functionPointers: [
        {
          id: 'member_fptr',
          name: 'method_ptr',
          type: 'member_fptr',
          pointsTo: 'method_func',
          signature: 'int (Widget::*)(int)',
          overhead: 16,
          canStore: ['member_function']
        }
      ],
      operation: 'create_member_ptr',
      message: 'int (Widget::*method_ptr)(int) = &Widget::process - member function pointer',
      currentStep: 1
    }));

    setFunctions([{
      id: 'method_func',
      name: 'process',
      position: [0, 1, 0],
      type: 'member_function',
      isActive: true,
      isBeingCalled: false
    }]);

    setFunctionPointers([{
      id: 'member_fptr',
      name: 'method_ptr',
      position: [0, -1, 0],
      type: 'member_fptr',
      pointsTo: 'method_func',
      isActive: true,
      overhead: 16
    }]);
  };

  const demonstratePolymorphism = () => {
    setState(prev => ({
      ...prev,
      currentDemo: 'polymorphic',
      operation: 'demonstrate_polymorphism',
      message: 'std::function permite runtime polymorphism sin herencia'
    }));
  };

  const resetDemo = () => {
    setState({
      functions: [],
      functionPointers: [],
      operation: 'none',
      message: 'Demostración reiniciada - function pointers y std::function',
      currentDemo: 'basic',
      performanceInfo: {
        directCall: 1,
        functionPointer: 1.1,
        stdFunction: 1.3,
        memberPointer: 1.2
      },
      currentStep: 0
    });

    setFunctions([]);
    setFunctionPointers([]);
  };

  return (
    <Container>
      <Header>
        <Title>Lección 22: Function Pointers</Title>
        <Subtitle>Indirection, std::function y Member Function Pointers</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <MemoryVisualization 
              state={state} 
              functions={functions}
              functionPointers={functionPointers}
            />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <div>
            <TabButton 
              active={state.currentDemo === 'basic'}
              onClick={() => setState(prev => ({ ...prev, currentDemo: 'basic' }))}
            >
              Basic Function Ptrs
            </TabButton>
            <TabButton 
              active={state.currentDemo === 'member'}
              onClick={createMemberFunctions}
            >
              Member Function Ptrs
            </TabButton>
            <TabButton 
              active={state.currentDemo === 'polymorphic'}
              onClick={demonstratePolymorphism}
            >
              Polymorphic Calls
            </TabButton>
          </div>

          {state.currentDemo === 'basic' && (
            <>
              <TheorySection>
                <h3>📞 Function Pointers</h3>
                <p>Indirection para código polimórfico sin herencia:</p>
                <CodeBlock>{`// Raw function pointer - solo free functions
int (*operation)(int, int) = &add;
int result = operation(5, 3);  // Indirection call

// std::function - type erasure wrapper
std::function<int(int, int)> op = add;
op = multiply;                 // Reassignable
op = [](int a, int b) { return a % b; };  // Lambdas
op = std::bind(&Widget::method, &widget, _1, _2);  // Member functions

// auto para lambdas específicas - zero overhead
auto lambda = [](int a, int b) { return a * a + b * b; };
// Más rápido que std::function para caso específico`}</CodeBlock>
              </TheorySection>

              <div>
                <h4>🎮 Crear Functions</h4>
                
                <Button onClick={createBasicFunctions} variant="primary">
                  1. Crear free functions
                </Button>
                
                <Button 
                  onClick={createRawFunctionPointer}
                  disabled={state.currentStep < 1}
                  variant="secondary"
                >
                  2. Raw function pointer
                </Button>
                
                <Button 
                  onClick={createStdFunction}
                  disabled={state.currentStep < 2}
                  variant="success"
                >
                  3. std::function
                </Button>
                
                <Button 
                  onClick={createLambda}
                  disabled={state.currentStep < 3}
                  variant="warning"
                >
                  4. Lambda auto
                </Button>
              </div>

              <div>
                <h4>📞 Llamar Functions</h4>
                
                <Button onClick={() => demonstrateCall('raw_fptr')}>
                  Call raw_fptr
                </Button>
                
                <Button onClick={() => demonstrateCall('std_func')}>
                  Call std::function
                </Button>
                
                <Button onClick={() => demonstrateCall('auto_lambda')}>
                  Call lambda
                </Button>
              </div>

              {state.functionPointers.length > 0 && (
                <div>
                  <h4>📝 Signatures Activas</h4>
                  {state.functionPointers.map(fptr => (
                    <SignatureDisplay key={fptr.id}>
                      <strong>{fptr.name}:</strong> {fptr.signature}
                      <br />
                      <span style={{ color: '#ffcc00' }}>Overhead: {fptr.overhead} bytes</span>
                    </SignatureDisplay>
                  ))}
                </div>
              )}
            </>
          )}

          {state.currentDemo === 'member' && (
            <>
              <TheorySection>
                <h3>🏗️ Member Function Pointers</h3>
                <p>Punteros a métodos de clase - sintaxis especial:</p>
                <CodeBlock>{`class Widget {
public:
    int process(int value) { return value * 2; }
    int calculate(int a, int b) { return a + b; }
};

// Member function pointer
int (Widget::*method_ptr)(int) = &Widget::process;

// Calling member function pointer  
Widget widget;
int result = (widget.*method_ptr)(42);      // Via object
int result2 = ((&widget)->*method_ptr)(42); // Via pointer

// Array de member function pointers
int (Widget::*methods[])(int, int) = {
    &Widget::add, &Widget::subtract, &Widget::multiply
};

// std::function puede encapsular member functions
std::function<int(int)> bound_method = 
    std::bind(&Widget::process, &widget, std::placeholders::_1);`}</CodeBlock>
              </TheorySection>

              <div>
                <h4>📞 Member Function Calls</h4>
                
                <Button onClick={() => demonstrateCall('member_fptr')}>
                  Call member function
                </Button>
              </div>

              <TheorySection>
                <h4>⚡ Member Function Pointer Overhead</h4>
                <CodeBlock>{`// Member function pointers can be larger than regular pointers
sizeof(void*) == 8;                    // Regular pointer
sizeof(int (Widget::*)(int)) == 16;    // Member function pointer

// Reasons for extra size:
// 1. Multiple inheritance adjustments
// 2. Virtual function table offsets  
// 3. Null member function representation

// Performance implications:
// - Slightly slower than free function pointers
// - May require this-pointer adjustment
// - Virtual member functions add vtable lookup`}</CodeBlock>
              </TheorySection>
            </>
          )}

          {state.currentDemo === 'polymorphic' && (
            <>
              <TheorySection>
                <h3>🔄 Runtime Polymorphism</h3>
                <p>std::function permite polymorphism sin herencia:</p>
                <CodeBlock>{`// Traditional OOP polymorphism
class Operation {
public:
    virtual int execute(int a, int b) = 0;
};

class Add : public Operation {
public:
    int execute(int a, int b) override { return a + b; }
};

// Function pointer polymorphism - no inheritance!
std::vector<std::function<int(int, int)>> operations = {
    [](int a, int b) { return a + b; },     // Lambda
    std::multiplies<int>{},                  // Functor
    &subtract_function,                      // Free function
    std::bind(&Calculator::divide, calc, _1, _2)  // Member function
};

// Execute all operations polymorphically
for (auto& op : operations) {
    std::cout << op(10, 5) << "\n";
}

// Benefits over inheritance:
// ✅ No virtual function overhead for non-polymorphic use
// ✅ Can mix lambdas, functions, functors freely
// ✅ Value semantics instead of pointer semantics
// ✅ Better optimization opportunities`}</CodeBlock>
              </TheorySection>

              <TheorySection>
                <h4>🎯 Use Cases</h4>
                <ul>
                  <li><strong>Callbacks:</strong> Event handling without inheritance</li>
                  <li><strong>Strategy Pattern:</strong> Algorithm selection at runtime</li>
                  <li><strong>Command Pattern:</strong> Undo/redo systems</li>
                  <li><strong>Plugin Architecture:</strong> Dynamic function loading</li>
                  <li><strong>DSLs:</strong> Domain-specific language implementations</li>
                  <li><strong>State Machines:</strong> State transition functions</li>
                </ul>
              </TheorySection>
            </>
          )}

          <PerformancePanel>
            <h4>⚡ Performance Comparison</h4>
            <div>Direct call: {state.performanceInfo.directCall}x (baseline)</div>
            <div>Function pointer: {state.performanceInfo.functionPointer}x</div>
            <div>std::function: {state.performanceInfo.stdFunction}x</div>
            <div>Member function ptr: {state.performanceInfo.memberPointer}x</div>
            <br />
            <div style={{ fontSize: '0.85em', color: '#cccccc' }}>
              std::function overhead viene de type erasure y heap allocation para large callables
            </div>
          </PerformancePanel>

          <TheorySection>
            <h4>🎯 When to Use What</h4>
            <CodeBlock>{`// Raw function pointers - highest performance
int (*fptr)(int, int) = &add;
// ✅ Use for: C interop, performance-critical code
// ❌ Limitations: Only free functions, no capture

// auto lambdas - zero overhead
auto lambda = [](int a, int b) { return a + b; };
// ✅ Use for: Known callable type, no reassignment needed
// ❌ Limitations: Single specific lambda type

// std::function - maximum flexibility  
std::function<int(int, int)> callable = lambda;
// ✅ Use for: Type erasure, containers of callables
// ❌ Overhead: ~32 bytes + possible heap allocation

// Member function pointers - OOP integration
int (Widget::*method)(int) = &Widget::process;
// ✅ Use for: Calling methods via pointers/reflection
// ❌ Limitations: Complex syntax, inheritance issues`}</CodeBlock>
          </TheorySection>

          <Button onClick={resetDemo} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};