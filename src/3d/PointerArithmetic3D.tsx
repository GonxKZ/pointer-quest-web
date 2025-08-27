import React, { useRef, useState, useCallback, useEffect, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Line, Cylinder, Sphere } from '@react-three/drei';
import { useOptimizedAnimation } from '../hooks/useOptimizedAnimation';
import { useMemoryManagement } from '../hooks/useMemoryManagement';
import { get3DTranslation } from '../translations/3d-visualization.es';
import { THREE } from '../utils/three';

// Professional color scheme for pointer arithmetic
const POINTER_ARITHMETIC_COLORS = {
  array: {
    element: '#4CAF50',
    highlight: '#8BC34A',
    border: '#2E7D32',
    background: 'rgba(76, 175, 80, 0.1)'
  },
  pointer: {
    current: '#2196F3',
    moving: '#03A9F4',
    trail: '#81D4FA',
    arrow: '#1976D2'
  },
  operation: {
    increment: '#FF9800',
    decrement: '#FF5722',
    offset: '#9C27B0',
    comparison: '#607D8B'
  },
  danger: {
    outOfBounds: '#F44336',
    warning: '#FF9800',
    error: '#B71C1C'
  }
};

// Optimized Array Element Component with memory management
const ArrayElement = memo(({ 
  position, 
  value, 
  index, 
  isHighlighted = false,
  isPointed = false,
  isOutOfBounds = false,
  elementSize = 1 
}: {
  position: [number, number, number];
  value: string | number;
  index: number;
  isHighlighted?: boolean;
  isPointed?: boolean;
  isOutOfBounds?: boolean;
  elementSize?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const getElementColor = () => {
    if (isOutOfBounds) return POINTER_ARITHMETIC_COLORS.danger.outOfBounds;
    if (isPointed) return POINTER_ARITHMETIC_COLORS.array.highlight;
    if (isHighlighted) return POINTER_ARITHMETIC_COLORS.pointer.current;
    return POINTER_ARITHMETIC_COLORS.array.element;
  };
  
  useOptimizedAnimation(
    `array-element-${index}`,
    useCallback((state) => {
      if (!meshRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      // Gentle pulsing for highlighted elements
      if (isHighlighted || isPointed) {
        const pulse = 1 + Math.sin(time * 4) * 0.1;
        meshRef.current.scale.setScalar(pulse);
      }
      
      // Warning shake for out of bounds
      if (isOutOfBounds) {
        meshRef.current.position.x = position[0] + Math.sin(time * 10) * 0.05;
      }
    }, [isHighlighted, isPointed, isOutOfBounds, position]),
    1, // Medium priority
    [position, isHighlighted, isPointed, isOutOfBounds]
  );
  
  return (
    <group position={position}>
      {/* Array element block */}
      <mesh ref={meshRef}>
        <boxGeometry args={[elementSize * 0.8, 0.6, 0.4]} />
        <meshStandardMaterial
          color={getElementColor()}
          transparent
          opacity={isOutOfBounds ? 0.5 : 0.9}
          emissive={getElementColor()}
          emissiveIntensity={isHighlighted || isPointed ? 0.2 : 0.05}
        />
      </mesh>
      
      {/* Element value display */}
      <Text
        position={[0, 0, 0.3]}
        fontSize={0.25}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {value.toString()}
      </Text>
      
      {/* Index label */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.15}
        color={isOutOfBounds ? POINTER_ARITHMETIC_COLORS.danger.outOfBounds : "#CCCCCC"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        [{index}]
      </Text>
      
      {/* Out of bounds warning */}
      {isOutOfBounds && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.12}
          color="#FF5252"
          anchorX="center"
          anchorY="middle"
          font="/fonts/FiraCode-Regular.woff"
        >
          ⚠ OUT OF BOUNDS
        </Text>
      )}
    </group>
  );
});

// Animated Pointer Component
const ArithmeticPointer = React.memo(({ 
  position, 
  targetPosition, 
  operation = 'none',
  isAnimating = false,
  offsetValue = 0 
}: {
  position: [number, number, number];
  targetPosition: [number, number, number];
  operation?: 'increment' | 'decrement' | 'offset' | 'none';
  isAnimating?: boolean;
  showOffset?: boolean;
  offsetValue?: number;
}) => {
  const pointerRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!pointerRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    if (isAnimating) {
      // Smooth movement animation
      const progress = (Math.sin(time * 2) + 1) / 2;
      
      // Interpolate position
      const currentPos = new THREE.Vector3(
        position[0] + (targetPosition[0] - position[0]) * progress,
        position[1] + (targetPosition[1] - position[1]) * progress,
        position[2] + (targetPosition[2] - position[2]) * progress
      );
      
      pointerRef.current.position.copy(currentPos);
    } else {
      pointerRef.current.position.set(...position);
    }
    
    // Rotation animation based on operation
    if (operation !== 'none') {
      pointerRef.current.rotation.y = Math.sin(time * 3) * 0.1;
    }
  });
  
  const getOperationColor = () => {
    switch (operation) {
      case 'increment': return POINTER_ARITHMETIC_COLORS.operation.increment;
      case 'decrement': return POINTER_ARITHMETIC_COLORS.operation.decrement;
      case 'offset': return POINTER_ARITHMETIC_COLORS.operation.offset;
      default: return POINTER_ARITHMETIC_COLORS.pointer.current;
    }
  };
  
  return (
    <group ref={pointerRef}>
      {/* Pointer base */}
      <Cylinder args={[0.1, 0.15, 0.3]} position={[0, 0.8, 0]}>
        <meshStandardMaterial
          color={getOperationColor()}
          emissive={getOperationColor()}
          emissiveIntensity={0.3}
        />
      </Cylinder>
      
      {/* Pointer arrow */}
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial
          color={getOperationColor()}
          emissive={getOperationColor()}
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Pointer line to target */}
      <Line
        points={[[0, 0.5, 0], [0, -0.3, 0]]}
        color={getOperationColor()}
        lineWidth={3}
      />
      
      {/* Operation indicator */}
      {operation !== 'none' && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.2}
          color={getOperationColor()}
          anchorX="center"
          anchorY="middle"
          font="/fonts/FiraCode-Regular.woff"
        >
          {operation === 'increment' ? '++' : 
           operation === 'decrement' ? '--' : 
           operation === 'offset' ? `+${offsetValue}` : ''}
        </Text>
      )}
      
      {/* Animation trail effect */}
      {isAnimating && (
        <Sphere args={[0.05]} position={[0, 0.5, 0]}>
          <meshStandardMaterial
            color={POINTER_ARITHMETIC_COLORS.pointer.trail}
            transparent
            opacity={0.6}
            emissive={POINTER_ARITHMETIC_COLORS.pointer.trail}
            emissiveIntensity={0.8}
          />
        </Sphere>
      )}
    </group>
  );
});

// Step-by-step arithmetic operation display
const ArithmeticStep = React.memo(({ 
  step, 
  title, 
  code, 
  explanation,
  isActive = false 
}: {
  step: number;
  title: string;
  code: string;
  explanation: string;
  isActive?: boolean;
}) => {
  return (
    <div style={{
      background: isActive ? 
        'linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(21, 101, 192, 0.2))' :
        'rgba(0, 0, 0, 0.7)',
      border: isActive ? '2px solid #2196F3' : '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        color: isActive ? '#2196F3' : '#CCCCCC',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '6px'
      }}>
        Step {step}: {title}
      </div>
      
      <div style={{
        fontFamily: 'monospace',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '6px 8px',
        borderRadius: '4px',
        color: '#4CAF50',
        fontSize: '13px',
        marginBottom: '6px'
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

// Main Pointer Arithmetic Visualization Component
export const PointerArithmetic3D = React.memo(({ 
  arraySize = 6,
  initialPointerIndex = 0,
  autoPlay = false,
  speed = 1 
}: {
  arraySize?: number;
  initialPointerIndex?: number;
  animated?: boolean;
  autoPlay?: boolean;
  speed?: number;
}) => {
  const [currentPointerIndex, setCurrentPointerIndex] = useState(initialPointerIndex);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [operation, setOperation] = useState<'increment' | 'decrement' | 'offset' | 'none'>('none');
  const [offsetValue, setOffsetValue] = useState(0);
  
  // Generate array data
  const arrayData = useMemo(() => 
    Array.from({ length: arraySize + 2 }, (_, i) => ({
      value: i < arraySize ? (i + 1) * 10 : '???',
      index: i,
      isValid: i < arraySize
    })), [arraySize]
  );
  
  // Animation steps
  const steps = [
    {
      title: "Initial State",
      code: "int arr[6] = {10, 20, 30, 40, 50, 60}; int* p = arr;",
      explanation: "Pointer p points to the first element of the array (index 0)"
    },
    {
      title: "Increment Pointer",
      code: "p++; // or p = p + 1",
      explanation: "Pointer moves to the next element. Address increases by sizeof(int)"
    },
    {
      title: "Arithmetic Operation",
      code: "p += 2; // Move 2 elements forward",
      explanation: "Pointer arithmetic scales by the size of the pointed type"
    },
    {
      title: "Bounds Check",
      code: "if (p < arr + 6) { /* safe */ }",
      explanation: "Always verify pointer is within valid array bounds"
    },
    {
      title: "Out of Bounds Danger",
      code: "p++; // DANGEROUS if beyond array",
      explanation: "Accessing memory outside array bounds leads to undefined behavior"
    }
  ];
  
  const performNextOperation = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const nextStep = (currentStep + 1) % steps.length;
    setCurrentStep(nextStep);
    
    switch (nextStep) {
      case 1: // Increment
        setOperation('increment');
        setCurrentPointerIndex(prev => Math.min(prev + 1, arraySize + 1));
        break;
      case 2: // Offset +2
        setOperation('offset');
        setOffsetValue(2);
        setCurrentPointerIndex(prev => Math.min(prev + 2, arraySize + 1));
        break;
      case 3: // Check bounds
        setOperation('none');
        break;
      case 4: // Out of bounds
        setOperation('increment');
        setCurrentPointerIndex(arraySize + 1);
        break;
      case 0: // Reset
        setOperation('none');
        setCurrentPointerIndex(initialPointerIndex);
        setOffsetValue(0);
        break;
    }
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation('none');
    }, 2000);
  }, [currentStep, isAnimating, arraySize, initialPointerIndex, steps.length]);
  
  // Auto-play logic
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      performNextOperation();
    }, 3000 / speed);
    
    return () => clearInterval(interval);
  }, [autoPlay, speed, currentStep, performNextOperation]);
  
  
  const manualIncrement = () => {
    if (isAnimating) return;
    setOperation('increment');
    setIsAnimating(true);
    setCurrentPointerIndex(prev => Math.min(prev + 1, arraySize + 1));
    setTimeout(() => {
      setIsAnimating(false);
      setOperation('none');
    }, 1000);
  };
  
  const manualDecrement = () => {
    if (isAnimating) return;
    setOperation('decrement');
    setIsAnimating(true);
    setCurrentPointerIndex(prev => Math.max(prev - 1, 0));
    setTimeout(() => {
      setIsAnimating(false);
      setOperation('none');
    }, 1000);
  };
  
  const reset = () => {
    if (isAnimating) return;
    setCurrentPointerIndex(initialPointerIndex);
    setCurrentStep(0);
    setOperation('none');
    setOffsetValue(0);
  };
  
  return (
    <group>
      {/* Array visualization */}
      {arrayData.map((element, index) => {
        const position: [number, number, number] = [index * 1.2 - (arraySize * 0.6), 0, 0];
        return (
          <ArrayElement
            key={index}
            position={position}
            value={element.value}
            index={element.index}
            isHighlighted={index === currentPointerIndex}
            isPointed={index === currentPointerIndex}
            isOutOfBounds={!element.isValid}
          />
        );
      })}
      
      {/* Pointer visualization */}
      <ArithmeticPointer
        position={[currentPointerIndex * 1.2 - (arraySize * 0.6), 1, 0]}
        targetPosition={[currentPointerIndex * 1.2 - (arraySize * 0.6), 1, 0]}
        operation={operation}
        isAnimating={isAnimating}
        showOffset={operation === 'offset'}
        offsetValue={offsetValue}
      />
      
      {/* Array bounds indicators */}
      <Line
        points={[
          [-0.5, -1, 0],
          [-0.5, -1.5, 0],
          [(arraySize - 1) * 1.2 - (arraySize * 0.6) + 0.5, -1.5, 0],
          [(arraySize - 1) * 1.2 - (arraySize * 0.6) + 0.5, -1, 0]
        ]}
        color={POINTER_ARITHMETIC_COLORS.array.border}
        lineWidth={2}
      />
      
      <Text
        position={[(arraySize - 1) * 0.6 - (arraySize * 0.6), -2, 0]}
        fontSize={0.2}
        color={POINTER_ARITHMETIC_COLORS.array.border}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        Valid Array Bounds
      </Text>
      
      {/* Step-by-step instructions */}
      <Html position={[-6, 3, 0]} style={{ width: '350px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid rgba(33, 150, 243, 0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 25px rgba(33, 150, 243, 0.3)',
          color: 'white',
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h3 style={{ 
            color: '#2196F3', 
            margin: '0 0 15px 0', 
            textAlign: 'center',
            fontSize: '16px'
          }}>
            🧮 Pointer Arithmetic
          </h3>
          
          {steps.map((stepInfo, index) => (
            <ArithmeticStep
              key={index}
              step={index + 1}
              title={stepInfo.title}
              code={stepInfo.code}
              explanation={stepInfo.explanation}
              isActive={index === currentStep}
            />
          ))}
          
          {/* Controls */}
          <div style={{
            marginTop: '15px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={manualIncrement}
              disabled={isAnimating}
              style={{
                padding: '6px 12px',
                background: isAnimating ? '#666' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              p++
            </button>
            
            <button
              onClick={manualDecrement}
              disabled={isAnimating}
              style={{
                padding: '6px 12px',
                background: isAnimating ? '#666' : '#FF5722',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              p--
            </button>
            
            <button
              onClick={performNextOperation}
              disabled={isAnimating}
              style={{
                padding: '6px 12px',
                background: isAnimating ? '#666' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Next Step
            </button>
            
            <button
              onClick={reset}
              disabled={isAnimating}
              style={{
                padding: '6px 12px',
                background: isAnimating ? '#666' : '#9E9E9E',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </Html>
      
      {/* Current operation display */}
      <Html position={[4, 2, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'center',
          border: currentPointerIndex >= arraySize ? '2px solid #F44336' : '2px solid #4CAF50',
          minWidth: '200px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            Current State
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', marginBottom: '8px' }}>
            p = arr + {currentPointerIndex}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '8px' }}>
            Value: {arrayData[currentPointerIndex]?.value || 'undefined'}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: currentPointerIndex >= arraySize ? '#FF5252' : '#4CAF50',
            fontWeight: 'bold'
          }}>
            {currentPointerIndex >= arraySize ? 
              '⚠️ OUT OF BOUNDS' : 
              '✅ SAFE ACCESS'
            }
          </div>
        </div>
      </Html>
    </group>
  );
});

export default PointerArithmetic3D;