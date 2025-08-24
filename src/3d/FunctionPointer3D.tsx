import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Text, Html, Line, Box, Sphere, Octahedron } from '@react-three/drei';
import { useOptimizedAnimation } from '../hooks/useOptimizedAnimation';
import * as THREE from 'three';

// Professional color scheme for function pointers
const FUNCTION_POINTER_COLORS = {
  function: {
    idle: '#6A1B9A',
    executing: '#8E24AA',
    accent: '#BA68C8',
    glow: '#9C27B0',
    background: 'rgba(106, 27, 154, 0.1)'
  },
  pointer: {
    primary: '#1976D2',
    secondary: '#42A5F5',
    accent: '#90CAF9',
    glow: '#2196F3'
  },
  execution: {
    flow: '#FF5722',
    data: '#4CAF50',
    result: '#FF9800',
    parameter: '#00BCD4'
  },
  signature: {
    returnType: '#E91E63',
    parameters: '#009688',
    name: '#FF9800'
  }
};

// Function Object Component
const FunctionObject = React.memo(({ 
  position,
  name,
  signature,
  isExecuting = false,
  isPointed = false,
  executionProgress = 0
}: {
  position: [number, number, number];
  name: string;
  signature: string;
  isExecuting?: boolean;
  isPointed?: boolean;
  executionProgress?: number;
  animated?: boolean;
}) => {
  const functionRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  useOptimizedAnimation(
    `function-${name}-${position.join('-')}`,
    useCallback((state) => {
      if (!functionRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      if (isExecuting) {
        // Execution animation
        const pulse = 1 + Math.sin(time * 8) * 0.2;
        functionRef.current.scale.setScalar(pulse);
        functionRef.current.rotation.y = time * 2;
        
        if (coreRef.current && 'emissiveIntensity' in coreRef.current.material) {
          (coreRef.current.material as any).emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.3;
        }
      } else if (isPointed) {
        // Highlighted when pointed to
        const highlight = 1 + Math.sin(time * 4) * 0.1;
        functionRef.current.scale.setScalar(highlight);
      } else {
        // Idle animation
        functionRef.current.scale.setScalar(1);
        functionRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
      }
    }, [isExecuting, isPointed]),
    1,
    [position, isExecuting, isPointed]
  );
  
  const getFunctionColor = () => {
    if (isExecuting) return FUNCTION_POINTER_COLORS.function.executing;
    if (isPointed) return FUNCTION_POINTER_COLORS.function.accent;
    return FUNCTION_POINTER_COLORS.function.idle;
  };
  
  return (
    <group ref={functionRef} position={position}>
      {/* Function core */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.8]} />
        <meshStandardMaterial
          color={getFunctionColor()}
          transparent
          opacity={0.9}
          emissive={getFunctionColor()}
          emissiveIntensity={isExecuting ? 0.4 : 0.1}
        />
      </mesh>
      
      {/* Execution particles */}
      {isExecuting && Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const radius = 1.2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle + executionProgress * Math.PI * 2) * radius,
              Math.sin(angle + executionProgress * Math.PI * 2) * radius * 0.5,
              Math.sin(angle + executionProgress * Math.PI * 2) * radius * 0.3
            ]}
          >
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshStandardMaterial
              color={FUNCTION_POINTER_COLORS.execution.flow}
              emissive={FUNCTION_POINTER_COLORS.execution.flow}
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
      
      {/* Function name */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color={getFunctionColor()}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {name}()
      </Text>
      
      {/* Function signature */}
      <Html position={[0, -1.5, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          textAlign: 'center',
          border: `1px solid ${getFunctionColor()}`,
          maxWidth: '150px'
        }}>
          {signature}
        </div>
      </Html>
      
      {/* Execution progress bar */}
      {isExecuting && (
        <group position={[0, -1, 0]}>
          <Box args={[1.5, 0.1, 0.05]}>
            <meshStandardMaterial color="#333333" />
          </Box>
          <Box args={[1.5 * executionProgress, 0.1, 0.06]} position={[(1.5 * executionProgress - 1.5) / 2, 0, 0.01]}>
            <meshStandardMaterial
              color={FUNCTION_POINTER_COLORS.execution.flow}
              emissive={FUNCTION_POINTER_COLORS.execution.flow}
              emissiveIntensity={0.5}
            />
          </Box>
        </group>
      )}
    </group>
  );
});

// Function Pointer Component
const FunctionPointerVisualization = React.memo(({ 
  position,
  targetPosition,
  pointerName,
  isAssigned = false,
  isNull = false
}: {
  position: [number, number, number];
  targetPosition: [number, number, number];
  pointerName: string;
  isAssigned?: boolean;
  isNull?: boolean;
  animated?: boolean;
}) => {
  const pointerRef = useRef<THREE.Group>(null);
  
  useOptimizedAnimation(
    `func-ptr-${pointerName}-${position.join('-')}`,
    useCallback((state) => {
      if (!pointerRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      if (isNull) {
        // Null pointer animation
        pointerRef.current.rotation.z = Math.sin(time * 3) * 0.3;
      } else if (isAssigned) {
        // Connected pointer animation
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        pointerRef.current.scale.setScalar(pulse);
      }
    }, [isAssigned, isNull]),
    1,
    [position, isAssigned, isNull]
  );
  
  const getPointerColor = () => {
    if (isNull) return '#666666';
    return FUNCTION_POINTER_COLORS.pointer.primary;
  };
  
  return (
    <group ref={pointerRef} position={position}>
      {/* Pointer container */}
      <Octahedron args={[0.6]}>
        <meshStandardMaterial
          color={getPointerColor()}
          transparent
          opacity={isNull ? 0.4 : 0.9}
          emissive={getPointerColor()}
          emissiveIntensity={isNull ? 0 : 0.2}
        />
      </Octahedron>
      
      {/* Connection line */}
      {!isNull && (
        <Line
          points={[
            [0, 0, 0],
            [
              targetPosition[0] - position[0],
              targetPosition[1] - position[1],
              targetPosition[2] - position[2]
            ]
          ]}
          color={FUNCTION_POINTER_COLORS.pointer.primary}
          lineWidth={3}
        />
      )}
      
      {/* Arrow head */}
      {!isNull && (
        <mesh
          position={[
            (targetPosition[0] - position[0]) * 0.8,
            (targetPosition[1] - position[1]) * 0.8,
            (targetPosition[2] - position[2]) * 0.8
          ]}
          rotation={[0, 0, Math.atan2(
            targetPosition[1] - position[1],
            targetPosition[0] - position[0]
          ) - Math.PI/2]}
        >
          <coneGeometry args={[0.15, 0.4, 6]} />
          <meshStandardMaterial
            color={FUNCTION_POINTER_COLORS.pointer.secondary}
            emissive={FUNCTION_POINTER_COLORS.pointer.glow}
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
      
      {/* Pointer name */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.15}
        color={getPointerColor()}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {pointerName}
      </Text>
      
      {/* Null indicator */}
      {isNull && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#FF5252"
          anchorX="center"
          anchorY="middle"
          font="/fonts/FiraCode-Regular.woff"
        >
          ∅
        </Text>
      )}
    </group>
  );
});

// Function Call Animation
const FunctionCallAnimation = React.memo(({ 
  startPosition,
  functionPosition,
  parameters = [],
  returnValue,
  isActive = false,
  animationProgress = 0
}: {
  startPosition: [number, number, number];
  functionPosition: [number, number, number];
  parameters?: string[];
  returnValue?: string;
  isActive?: boolean;
  animationProgress?: number;
}) => {
  if (!isActive) return null;
  
  return (
    <group>
      {/* Parameter flow animation */}
      {parameters.map((param, index) => {
        const paramProgress = Math.max(0, animationProgress - index * 0.2);
        const currentPos: [number, number, number] = [
          startPosition[0] + (functionPosition[0] - startPosition[0]) * paramProgress,
          startPosition[1] + (functionPosition[1] - startPosition[1]) * paramProgress + Math.sin(paramProgress * Math.PI) * 0.5,
          startPosition[2] + (functionPosition[2] - startPosition[2]) * paramProgress
        ];
        
        return (
          <group key={index} position={currentPos}>
            <Sphere args={[0.1]}>
              <meshStandardMaterial
                color={FUNCTION_POINTER_COLORS.execution.parameter}
                emissive={FUNCTION_POINTER_COLORS.execution.parameter}
                emissiveIntensity={0.6}
              />
            </Sphere>
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.1}
              color="white"
              anchorX="center"
              anchorY="middle"
              font="/fonts/FiraCode-Regular.woff"
            >
              {param}
            </Text>
          </group>
        );
      })}
      
      {/* Return value animation */}
      {returnValue && animationProgress > 0.7 && (
        <group
          position={[
            functionPosition[0] + (startPosition[0] - functionPosition[0]) * (animationProgress - 0.7) * 3.33,
            functionPosition[1] + (startPosition[1] - functionPosition[1]) * (animationProgress - 0.7) * 3.33 + 0.5,
            functionPosition[2] + (startPosition[2] - functionPosition[2]) * (animationProgress - 0.7) * 3.33
          ]}
        >
          <Sphere args={[0.12]}>
            <meshStandardMaterial
              color={FUNCTION_POINTER_COLORS.execution.result}
              emissive={FUNCTION_POINTER_COLORS.execution.result}
              emissiveIntensity={0.7}
            />
          </Sphere>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.12}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="/fonts/FiraCode-Regular.woff"
          >
            return {returnValue}
          </Text>
        </group>
      )}
    </group>
  );
});

// Function Pointer Scenario Component
const FunctionPointerScenario = React.memo(({ 
  scenario,
  title,
  code,
  explanation,
  isActive = false 
}: {
  scenario: number;
  title: string;
  code: string;
  explanation: string;
  isActive?: boolean;
}) => {
  return (
    <div style={{
      background: isActive ? 
        'linear-gradient(135deg, rgba(106, 27, 154, 0.2), rgba(142, 36, 170, 0.2))' :
        'rgba(0, 0, 0, 0.7)',
      border: isActive ? '2px solid #9C27B0' : '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        color: isActive ? '#BA68C8' : '#CCCCCC',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '6px'
      }}>
        Step {scenario}: {title}
      </div>
      
      <div style={{
        fontFamily: 'monospace',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '8px',
        borderRadius: '4px',
        color: '#BA68C8',
        fontSize: '11px',
        marginBottom: '6px',
        whiteSpace: 'pre-wrap'
      }}>
        {code}
      </div>
      
      <div style={{
        color: '#B0BEC5',
        fontSize: '12px',
        lineHeight: '1.4'
      }}>
        {explanation}
      </div>
    </div>
  );
});

// Main Function Pointer Visualization
export const FunctionPointer3D = React.memo(({ 
  autoPlay = false,
  speed = 1 
}: {
  animated?: boolean;
  autoPlay?: boolean;
  speed?: number;
}) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [callAnimationActive, setCallAnimationActive] = useState(false);
  const [callAnimationProgress, setCallAnimationProgress] = useState(0);
  
  // Available functions
  const functions = [
    {
      name: 'add',
      signature: 'int add(int a, int b)',
      position: [-3, 2, 0] as [number, number, number],
      returnValue: '42'
    },
    {
      name: 'multiply',
      signature: 'int multiply(int a, int b)',
      position: [0, 2, 0] as [number, number, number],
      returnValue: '200'
    },
    {
      name: 'greet',
      signature: 'void greet(const char* name)',
      position: [3, 2, 0] as [number, number, number],
      returnValue: 'void'
    }
  ];
  
  // Function pointer scenarios
  const scenarios = [
    {
      title: "Declaration",
      code: "// Declare function pointer\nint (*operation)(int, int);",
      explanation: "Declares a pointer that can point to functions taking two ints and returning int"
    },
    {
      title: "Assignment",
      code: "// Assign function address\noperation = &add;\n// or simply: operation = add;",
      explanation: "Assigns the address of the 'add' function to the function pointer"
    },
    {
      title: "Function Call",
      code: "// Call through pointer\nint result = operation(10, 20);\n// or: int result = (*operation)(10, 20);",
      explanation: "Calls the function through the pointer with arguments 10 and 20"
    },
    {
      title: "Reassignment",
      code: "// Change to different function\noperation = multiply;",
      explanation: "Function pointer can be reassigned to point to different compatible functions"
    }
  ];
  
  
  // Auto-advance scenarios
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentScenario(prev => (prev + 1) % scenarios.length);
    }, 4000 / speed);
    
    return () => clearInterval(interval);
  }, [autoPlay, speed, scenarios.length]);
  
  const executeFunction = useCallback(() => {
    if (!selectedFunction) return;
    
    setIsExecuting(true);
    setCallAnimationActive(true);
    setExecutionProgress(0);
    setCallAnimationProgress(0);
    
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setExecutionProgress(progress);
      setCallAnimationProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setIsExecuting(false);
          setCallAnimationActive(false);
          setExecutionProgress(0);
          setCallAnimationProgress(0);
        }, 500);
      }
    };
    
    requestAnimationFrame(animate);
  }, [selectedFunction]);
  
  // Update selected function based on scenario
  useEffect(() => {
    switch (currentScenario) {
      case 0: // Declaration
        setSelectedFunction(null);
        break;
      case 1: // Assignment to add
        setSelectedFunction('add');
        break;
      case 2: // Function call
        if (selectedFunction) {
          executeFunction();
        }
        break;
      case 3: // Reassignment to multiply
        setSelectedFunction('multiply');
        break;
    }
  }, [currentScenario, executeFunction, selectedFunction]);
  
  
  const nextScenario = () => {
    setCurrentScenario(prev => (prev + 1) % scenarios.length);
  };
  
  const prevScenario = () => {
    setCurrentScenario(prev => prev === 0 ? scenarios.length - 1 : prev - 1);
  };
  
  const manualExecute = () => {
    if (selectedFunction && !isExecuting) {
      executeFunction();
    }
  };
  
  return (
    <group>
      {/* Function objects */}
      {functions.map((func) => (
        <FunctionObject
          key={func.name}
          position={func.position}
          name={func.name}
          signature={func.signature}
          isExecuting={isExecuting && selectedFunction === func.name}
          isPointed={selectedFunction === func.name}
          executionProgress={executionProgress}
          animated={true}
        />
      ))}
      
      {/* Function pointer */}
      <FunctionPointerVisualization
        position={[-1, -1, 0]}
        targetPosition={
          selectedFunction 
            ? functions.find(f => f.name === selectedFunction)?.position || [0, 0, 0]
            : [0, 0, 0]
        }
        pointerName="operation"
        isAssigned={selectedFunction !== null}
        isNull={selectedFunction === null}
        animated={true}
      />
      
      {/* Function call animation */}
      {selectedFunction && (
        <FunctionCallAnimation
          startPosition={[-1, -1, 0]}
          functionPosition={functions.find(f => f.name === selectedFunction)?.position || [0, 0, 0]}
          parameters={['10', '20']}
          returnValue={functions.find(f => f.name === selectedFunction)?.returnValue}
          isActive={callAnimationActive}
          animationProgress={callAnimationProgress}
        />
      )}
      
      {/* Scenarios display */}
      <Html position={[-6, 3, 0]} style={{ width: '380px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid rgba(106, 27, 154, 0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 25px rgba(106, 27, 154, 0.3)',
          color: 'white',
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxHeight: '450px',
          overflowY: 'auto'
        }}>
          <h3 style={{ 
            color: '#9C27B0', 
            margin: '0 0 15px 0', 
            textAlign: 'center',
            fontSize: '16px'
          }}>
            🎯 Function Pointers
          </h3>
          
          {scenarios.map((sc, index) => (
            <FunctionPointerScenario
              key={index}
              scenario={index + 1}
              title={sc.title}
              code={sc.code}
              explanation={sc.explanation}
              isActive={index === currentScenario}
            />
          ))}
          
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(106, 27, 154, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(106, 27, 154, 0.3)'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#BA68C8', marginBottom: '8px' }}>
              💡 Key Concepts:
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', lineHeight: '1.4' }}>
              <li>Function pointers store addresses of functions</li>
              <li>Must match function signature exactly</li>
              <li>Enables runtime function selection</li>
              <li>Used in callbacks, polymorphism, event handling</li>
              <li>Can be stored in arrays, passed as parameters</li>
            </ul>
          </div>
          
          {/* Controls */}
          <div style={{
            marginTop: '15px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={prevScenario}
              style={{
                padding: '6px 12px',
                background: '#607D8B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ← Prev
            </button>
            
            <button
              onClick={manualExecute}
              disabled={!selectedFunction || isExecuting}
              style={{
                padding: '6px 12px',
                background: (!selectedFunction || isExecuting) ? '#666' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (!selectedFunction || isExecuting) ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Execute
            </button>
            
            <button
              onClick={nextScenario}
              style={{
                padding: '6px 12px',
                background: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </Html>
      
      {/* Current state display */}
      <Html position={[5, -2, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '2px solid #9C27B0',
          minWidth: '200px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
            Function Pointer State
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'monospace', marginBottom: '6px' }}>
            operation = {selectedFunction || 'nullptr'}
          </div>
          <div style={{ fontSize: '11px', color: '#B0BEC5' }}>
            {selectedFunction ? `Points to ${selectedFunction}()` : 'Null pointer - not callable'}
          </div>
          {isExecuting && (
            <div style={{ 
              fontSize: '11px', 
              color: '#4CAF50', 
              marginTop: '6px',
              fontWeight: 'bold'
            }}>
              🏃 Executing... {Math.round(executionProgress * 100)}%
            </div>
          )}
        </div>
      </Html>
    </group>
  );
});

export default FunctionPointer3D;