import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Text, Html, Line, Cylinder, Torus } from '@react-three/drei';
import { useOptimizedAnimation } from '../hooks/useOptimizedAnimation';
import * as THREE from 'three';

// Professional color scheme for const correctness visualization
const CONST_COLORS = {
  immutable: {
    primary: '#3F51B5',
    secondary: '#5C6BC0',
    accent: '#9FA8DA',
    glow: '#3F51B5',
    background: 'rgba(63, 81, 181, 0.1)',
    shield: '#1A237E'
  },
  mutable: {
    primary: '#4CAF50',
    secondary: '#66BB6A',
    accent: '#A5D6A7',
    glow: '#4CAF50',
    background: 'rgba(76, 175, 80, 0.1)'
  },
  constPointer: {
    primary: '#9C27B0',
    secondary: '#BA68C8',
    accent: '#E1BEE7',
    glow: '#9C27B0'
  },
  pointerToConst: {
    primary: '#FF9800',
    secondary: '#FFB74D',
    accent: '#FFCC02',
    glow: '#FF9800'
  },
  constConstPointer: {
    primary: '#607D8B',
    secondary: '#90A4AE',
    accent: '#CFD8DC',
    glow: '#607D8B'
  },
  danger: {
    error: '#F44336',
    warning: '#FF9800',
    blocked: '#B71C1C'
  }
};

// Immutability Shield Component
const ImmutabilityShield = React.memo(({ 
  position, 
  active = true, 
  type = 'data',
  animated = true 
}: {
  position: [number, number, number];
  active?: boolean;
  type?: 'data' | 'pointer' | 'both';
  animated?: boolean;
}) => {
  const shieldRef = useRef<THREE.Group>(null);
  
  useOptimizedAnimation(
    `immutability-shield-${position.join('-')}`,
    useCallback((state) => {
      if (!shieldRef.current || !animated || !active) return;
      
      const time = state.clock.elapsedTime;
      
      // Protective energy field effect
      shieldRef.current.rotation.z = Math.sin(time * 2) * 0.1;
      shieldRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.05);
    }, [active, animated]),
    1,
    [position, active, type]
  );
  
  if (!active) return null;
  
  return (
    <group ref={shieldRef} position={position}>
      {/* Main shield ring */}
      <Torus args={[0.6, 0.05, 8, 16]}>
        <meshStandardMaterial
          color={CONST_COLORS.immutable.primary}
          transparent
          opacity={0.8}
          emissive={CONST_COLORS.immutable.glow}
          emissiveIntensity={0.3}
        />
      </Torus>
      
      {/* Inner protection indicator */}
      <Torus args={[0.4, 0.03, 8, 16]}>
        <meshStandardMaterial
          color={CONST_COLORS.immutable.accent}
          transparent
          opacity={0.6}
          emissive={CONST_COLORS.immutable.glow}
          emissiveIntensity={0.2}
        />
      </Torus>
      
      {/* Const symbol */}
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.2}
        color={CONST_COLORS.immutable.primary}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        🔒
      </Text>
    </group>
  );
});

// Const Data Object
const ConstDataObject = React.memo(({ 
  position, 
  value, 
  isConst = false,
  isMutable = true,
  isBeingModified = false,
  showError = false,
  label = "data"
}: {
  position: [number, number, number];
  value: string | number;
  isConst?: boolean;
  isMutable?: boolean;
  isBeingModified?: boolean;
  showError?: boolean;
  label?: string;
}) => {
  const objectRef = useRef<THREE.Mesh>(null);
  
  useOptimizedAnimation(
    `const-data-${position.join('-')}`,
    useCallback((state) => {
      if (!objectRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      if (showError) {
        // Error shake animation
        objectRef.current.position.x = position[0] + Math.sin(time * 15) * 0.05;
        objectRef.current.position.y = position[1] + Math.cos(time * 15) * 0.05;
      } else if (isBeingModified && isMutable) {
        // Modification pulse
        const pulse = 1 + Math.sin(time * 6) * 0.15;
        objectRef.current.scale.setScalar(pulse);
      } else {
        // Reset to normal
        objectRef.current.position.set(...position);
        objectRef.current.scale.setScalar(1);
      }
    }, [position, isBeingModified, isMutable, showError]),
    1,
    [position, isConst, isBeingModified, showError]
  );
  
  const getObjectColor = () => {
    if (showError) return CONST_COLORS.danger.error;
    if (isConst) return CONST_COLORS.immutable.primary;
    return CONST_COLORS.mutable.primary;
  };
  
  return (
    <group position={position}>
      {/* Data object */}
      <mesh ref={objectRef}>
        <boxGeometry args={[1.2, 0.8, 0.6]} />
        <meshStandardMaterial
          color={getObjectColor()}
          transparent
          opacity={showError ? 0.7 : 0.9}
          emissive={getObjectColor()}
          emissiveIntensity={isBeingModified ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* Value display */}
      <Text
        position={[0, 0, 0.4]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {value.toString()}
      </Text>
      
      {/* Const indicator */}
      {isConst && (
        <ImmutabilityShield
          position={[0, 0, 0]}
          active={isConst}
          type="data"
        />
      )}
      
      {/* Label */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color={isConst ? CONST_COLORS.immutable.accent : CONST_COLORS.mutable.accent}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {label}
      </Text>
      
      {/* Error message */}
      {showError && (
        <Html position={[0, 1, 0]} center>
          <div style={{
            background: 'rgba(244, 67, 54, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            textAlign: 'center',
            border: '1px solid #B71C1C'
          }}>
            ❌ CONST VIOLATION
          </div>
        </Html>
      )}
    </group>
  );
});

// Const Pointer Visualization
const ConstPointerVisualization = React.memo(({ 
  position, 
  targetPosition,
  pointerType = 'regular',
  isPointingToConst = false,
  isConstPointer = false,
  isAttemptingModification = false,
  label = "ptr"
}: {
  position: [number, number, number];
  targetPosition: [number, number, number];
  pointerType?: 'regular' | 'const_pointer' | 'pointer_to_const' | 'const_const_pointer';
  isPointingToConst?: boolean;
  isConstPointer?: boolean;
  isAttemptingModification?: boolean;
  label?: string;
}) => {
  const pointerRef = useRef<THREE.Group>(null);
  
  const getPointerColors = () => {
    switch (pointerType) {
      case 'const_pointer':
        return CONST_COLORS.constPointer;
      case 'pointer_to_const':
        return CONST_COLORS.pointerToConst;
      case 'const_const_pointer':
        return CONST_COLORS.constConstPointer;
      default:
        return CONST_COLORS.mutable;
    }
  };
  
  const colors = getPointerColors();
  
  useOptimizedAnimation(
    `const-pointer-${position.join('-')}`,
    useCallback((state) => {
      if (!pointerRef.current) return;
      
      const time = state.clock.elapsedTime;
      
      if (isAttemptingModification && (isConstPointer || isPointingToConst)) {
        // Blocked modification animation
        pointerRef.current.rotation.z = Math.sin(time * 10) * 0.2;
      } else {
        // Normal gentle animation
        pointerRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
      }
    }, [isConstPointer, isPointingToConst, isAttemptingModification]),
    1,
    [position, pointerType, isAttemptingModification]
  );
  
  return (
    <group ref={pointerRef} position={position}>
      {/* Pointer container */}
      <Cylinder args={[0.15, 0.2, 0.6]} position={[0, 0.3, 0]}>
        <meshStandardMaterial
          color={colors.primary}
          transparent
          opacity={0.9}
          emissive={colors.glow}
          emissiveIntensity={0.2}
        />
      </Cylinder>
      
      {/* Pointer arrow */}
      <Line
        points={[
          [0, 0, 0],
          [
            targetPosition[0] - position[0],
            targetPosition[1] - position[1],
            targetPosition[2] - position[2]
          ]
        ]}
        color={colors.primary}
        lineWidth={3}
      />
      
      {/* Arrow head */}
      <mesh 
        position={[
          targetPosition[0] - position[0] - 0.2,
          targetPosition[1] - position[1],
          targetPosition[2] - position[2]
        ]}
        rotation={[0, 0, Math.atan2(
          targetPosition[1] - position[1],
          targetPosition[0] - position[0]
        ) - Math.PI/2]}
      >
        <coneGeometry args={[0.1, 0.3, 6]} />
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.glow}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Const shield for pointer itself */}
      {isConstPointer && (
        <ImmutabilityShield
          position={[0, 0.3, 0]}
          active={true}
          type="pointer"
        />
      )}
      
      {/* Pointer type indicator */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.12}
        color={colors.accent}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {pointerType.replace(/_/g, ' ').toUpperCase()}
      </Text>
      
      {/* Label */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.15}
        color={colors.primary}
        anchorX="center"
        anchorY="middle"
        font="/fonts/FiraCode-Regular.woff"
      >
        {label}
      </Text>
    </group>
  );
});

// Const Correctness Scenario Component
const ConstScenario = React.memo(({ 
  scenario,
  title,
  code,
  explanation,
  isLegal,
  isActive = false 
}: {
  scenario: number;
  title: string;
  code: string;
  explanation: string;
  isLegal: boolean;
  isActive?: boolean;
}) => {
  return (
    <div style={{
      background: isActive ? 
        (isLegal ? 
          'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(56, 142, 60, 0.2))' :
          'linear-gradient(135deg, rgba(244, 67, 54, 0.2), rgba(183, 28, 28, 0.2))'
        ) :
        'rgba(0, 0, 0, 0.7)',
      border: isActive ? 
        (isLegal ? '2px solid #4CAF50' : '2px solid #F44336') :
        '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        color: isActive ? (isLegal ? '#4CAF50' : '#F44336') : '#CCCCCC',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>{isLegal ? '✅' : '❌'}</span>
        Scenario {scenario}: {title}
      </div>
      
      <div style={{
        fontFamily: 'monospace',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '8px',
        borderRadius: '4px',
        color: isLegal ? '#4CAF50' : '#FF5252',
        fontSize: '12px',
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

// Main Const Correctness Visualization
export const ConstPointer3D = React.memo(({ 
  autoPlay = false,
  speed = 1 
}: {
  animated?: boolean;
  autoPlay?: boolean;
  speed?: number;
}) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isModifying, setIsModifying] = useState(false);
  const [showError, setShowError] = useState(false);
  
  // Const correctness scenarios
  const scenarios = [
    {
      title: "Regular Pointer to Mutable Data",
      code: "int x = 42;\nint* p = &x;\n*p = 100; // ✅ Legal",
      explanation: "Both pointer and data are mutable. All operations allowed.",
      pointerType: 'regular' as const,
      isPointingToConst: false,
      isConstPointer: false,
      dataIsConst: false,
      operationLegal: true
    },
    {
      title: "Pointer to Const Data",
      code: "const int x = 42;\nconst int* p = &x;\n*p = 100; // ❌ Error",
      explanation: "Data is const through pointer. Cannot modify value through pointer.",
      pointerType: 'pointer_to_const' as const,
      isPointingToConst: true,
      isConstPointer: false,
      dataIsConst: true,
      operationLegal: false
    },
    {
      title: "Const Pointer to Mutable Data",
      code: "int x = 42;\nint* const p = &x;\n*p = 100; // ✅ Legal\np++; // ❌ Error",
      explanation: "Pointer address is const, but can modify data. Cannot reassign pointer.",
      pointerType: 'const_pointer' as const,
      isPointingToConst: false,
      isConstPointer: true,
      dataIsConst: false,
      operationLegal: true
    },
    {
      title: "Const Pointer to Const Data",
      code: "const int x = 42;\nconst int* const p = &x;\n*p = 100; // ❌ Error\np++; // ❌ Error",
      explanation: "Both pointer and data are const. No modifications allowed.",
      pointerType: 'const_const_pointer' as const,
      isPointingToConst: true,
      isConstPointer: true,
      dataIsConst: true,
      operationLegal: false
    }
  ];
  
  const currentSc = scenarios[currentScenario];
  
  // Auto-advance scenarios
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentScenario(prev => (prev + 1) % scenarios.length);
    }, 4000 / speed);
    
    return () => clearInterval(interval);
  }, [autoPlay, speed, scenarios.length]);
  
  const attemptModification = useCallback(() => {
    setIsModifying(true);
    
    if (!currentSc?.operationLegal) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
    
    setTimeout(() => setIsModifying(false), 1500);
  }, [currentSc?.operationLegal]);
  
  const nextScenario = () => {
    setCurrentScenario(prev => (prev + 1) % scenarios.length);
    setShowError(false);
    setIsModifying(false);
  };
  
  const prevScenario = () => {
    setCurrentScenario(prev => prev === 0 ? scenarios.length - 1 : prev - 1);
    setShowError(false);
    setIsModifying(false);
  };
  
  return (
    <group>
      {/* Data object */}
      <ConstDataObject
        position={[3, 0, 0]}
        value={isModifying && currentSc?.operationLegal ? "100" : "42"}
        isConst={currentSc?.dataIsConst || false}
        isBeingModified={isModifying}
        showError={showError}
        label="data"
      />
      
      {/* Pointer */}
      <ConstPointerVisualization
        position={[-2, 0, 0]}
        targetPosition={[3, 0, 0]}
        pointerType={currentSc?.pointerType || 'regular'}
        isPointingToConst={currentSc?.isPointingToConst || false}
        isConstPointer={currentSc?.isConstPointer || false}
        isAttemptingModification={isModifying}
        label="ptr"
      />
      
      {/* Const correctness rules display */}
      <Html position={[-4, 3, 0]} style={{ width: '400px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid rgba(63, 81, 181, 0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 25px rgba(63, 81, 181, 0.3)',
          color: 'white',
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxHeight: '450px',
          overflowY: 'auto'
        }}>
          <h3 style={{ 
            color: '#3F51B5', 
            margin: '0 0 15px 0', 
            textAlign: 'center',
            fontSize: '16px'
          }}>
            🔒 Const Correctness
          </h3>
          
          {scenarios.map((sc, index) => (
            <ConstScenario
              key={index}
              scenario={index + 1}
              title={sc.title}
              code={sc.code}
              explanation={sc.explanation}
              isLegal={sc.operationLegal}
              isActive={index === currentScenario}
            />
          ))}
          
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(63, 81, 181, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(63, 81, 181, 0.3)'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#3F51B5', marginBottom: '8px' }}>
              💡 Key Rules:
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', lineHeight: '1.4' }}>
              <li><code>const int*</code> - Cannot modify data through pointer</li>
              <li><code>int* const</code> - Cannot reassign pointer</li>
              <li><code>const int* const</code> - Cannot modify data or reassign pointer</li>
              <li>Const correctness prevents accidental modifications</li>
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
              onClick={attemptModification}
              disabled={isModifying}
              style={{
                padding: '6px 12px',
                background: isModifying ? '#666' : (currentSc?.operationLegal ? '#4CAF50' : '#F44336'),
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isModifying ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Try *p = 100
            </button>
            
            <button
              onClick={nextScenario}
              style={{
                padding: '6px 12px',
                background: '#3F51B5',
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
      
      {/* Current scenario summary */}
      <Html position={[5, 2, 0]} center>
        <div style={{
          background: currentSc?.operationLegal ? 
            'rgba(76, 175, 80, 0.9)' : 
            'rgba(244, 67, 54, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
          border: currentSc?.operationLegal ? '2px solid #4CAF50' : '2px solid #F44336',
          minWidth: '180px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
            {currentSc?.operationLegal ? '✅ Legal Operation' : '❌ Const Violation'}
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'monospace', marginBottom: '6px' }}>
            {currentSc?.pointerType?.replace(/_/g, ' ') || 'regular'}
          </div>
          <div style={{ fontSize: '11px' }}>
            Scenario {currentScenario + 1} of {scenarios.length}
          </div>
        </div>
      </Html>
    </group>
  );
});

export default ConstPointer3D;