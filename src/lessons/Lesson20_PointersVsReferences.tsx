import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { THREE } from '../utils/three';
import {
  LessonLayout,
  TheoryPanel,
  VisualizationPanel,
  Section,
  SectionTitle,
  CodeBlock,
  InteractiveSection,
  StatusDisplay,
  ButtonGroup,
  theme
} from '../design-system';
import { useApp } from '../context/AppContext';



interface ComparisonState {
  objects: Array<{
    id: string;
    name: string;
    value: number;
    type: 'target' | 'alias';
    isActive: boolean;
  }>;
  pointers: Array<{
    id: string;
    name: string;
    type: 'raw_ptr' | 'not_null_ptr' | 'reference' | 'null_ptr';
    pointsTo: string | null;
    isValid: boolean;
    canBeNull: boolean;
    canBeReassigned: boolean;
  }>;
  operation: 'none' | 'create_ptr' | 'create_ref' | 'reassign' | 'null_check' | 'demonstrate_not_null';
  message: string;
  currentComparison: 'ptr_vs_ref' | 'not_null' | 'guidelines';
  safetyAnalysis: {
    nullSafety: 'safe' | 'unsafe' | 'checked';
    reassignmentRisk: 'none' | 'medium' | 'high';
    performanceImpact: 'none' | 'minimal' | 'significant';
  };
  currentStep: number;
}

interface ObjectVisual {
  id: string;
  name: string;
  value: number;
  position: [number, number, number];
  type: 'target' | 'alias';
  isActive: boolean;
}

interface PointerVisual {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'raw_ptr' | 'not_null_ptr' | 'reference' | 'null_ptr';
  pointsTo: string | null;
  isValid: boolean;
  canBeNull: boolean;
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



const SafetyPanel = styled.div<{ level: 'safe' | 'unsafe' | 'checked' }>`
  background: ${props => 
    props.level === 'safe' ? 'rgba(0, 255, 0, 0.1)' :
    props.level === 'unsafe' ? 'rgba(255, 0, 0, 0.1)' :
    'rgba(255, 200, 0, 0.1)'};
  border: 1px solid ${props => 
    props.level === 'safe' ? '#00ff00' :
    props.level === 'unsafe' ? '#ff0000' :
    '#ffcc00'};
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

const MemoryVisualization: React.FC<{
  state: ComparisonState;
  objects: ObjectVisual[];
  pointers: PointerVisual[];
}> = ({ state, objects, pointers }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const ObjectComponent = ({ obj }: { obj: ObjectVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && obj.isActive) {
        meshRef.current.rotation.z += 0.02;
        const scale = 1 + Math.sin(Date.now() * 0.01) * 0.05;
        meshRef.current.scale.setScalar(scale);
      }
    });

    const getObjectColor = () => {
      if (obj.type === 'alias') return '#66ccff';
      return '#00ff88';
    };

    return (
      <group position={obj.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial 
            color={getObjectColor()}
            emissive={getObjectColor()}
            emissiveIntensity={obj.isActive ? 0.4 : 0.2}
          />
        </mesh>
        
        <Text
          position={[0, 0, 0.8]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {obj.value}
        </Text>

        <Text
          position={[0, -2, 0]}
          fontSize={0.3}
          color={getObjectColor()}
          anchorX="center"
          anchorY="middle"
        >
          {obj.name}
        </Text>
      </group>
    );
  };

  const PointerComponent = ({ ptr }: { ptr: PointerVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && ptr.isValid) {
        meshRef.current.rotation.y += 0.03;
      }
    });

    const getPointerColor = () => {
      switch (ptr.type) {
        case 'raw_ptr': return ptr.isValid ? '#0088ff' : '#ff4444';
        case 'not_null_ptr': return '#00ff00';
        case 'reference': return '#ff8800';
        case 'null_ptr': return '#ff4444';
        default: return '#666666';
      }
    };

    const getGeometry = () => {
      switch (ptr.type) {
        case 'reference':
          return <cylinderGeometry args={[0.6, 0.6, 1.2, 6]} />;
        case 'not_null_ptr':
          return <octahedronGeometry args={[0.8]} />;
        default:
          return <boxGeometry args={[1.2, 0.8, 0.3]} />;
      }
    };

    return (
      <group position={ptr.position}>
        <mesh ref={meshRef}>
          {getGeometry()}
          <meshStandardMaterial 
            color={getPointerColor()}
            emissive={getPointerColor()}
            emissiveIntensity={ptr.isValid ? 0.3 : 0.5}
            transparent
            opacity={ptr.isValid ? 0.9 : 0.6}
          />
        </mesh>
        
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.25}
          color={getPointerColor()}
          anchorX="center"
          anchorY="middle"
        >
          {ptr.name}
        </Text>

        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          {ptr.type.replace('_', ' ')}
        </Text>

        {ptr.type === 'null_ptr' && (
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.2}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            nullptr
          </Text>
        )}

        {ptr.type === 'not_null_ptr' && (
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.2}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
          >
            ✓ not_null
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

      {objects.map(obj => (
        <ObjectComponent key={obj.id} obj={obj} />
      ))}

      {pointers.map(ptr => (
        <PointerComponent key={ptr.id} ptr={ptr} />
      ))}

      {/* Arrows from pointers to objects */}
      {pointers.map(ptr => {
        if (!ptr.pointsTo || !ptr.isValid) return null;
        
        const targetObj = objects.find(obj => obj.id === ptr.pointsTo);
        if (!targetObj) return null;

        return (
          <ConnectionArrow 
            key={`${ptr.id}-arrow`}
            from={ptr.position} 
            to={targetObj.position} 
            color={ptr.type === 'raw_ptr' ? '#0088ff' : 
                   ptr.type === 'not_null_ptr' ? '#00ff00' : '#ff8800'}
            style={ptr.type === 'null_ptr' ? 'dashed' : 'solid'}
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

const Lesson20_PointersVsReferences: React.FC = () => {
  const [state, setState] = useState<ComparisonState>({
    objects: [],
    pointers: [],
    operation: 'none',
    message: 'Pointers vs References - semántica y seguridad comparadas',
    currentComparison: 'ptr_vs_ref',
    safetyAnalysis: {
      nullSafety: 'safe',
      reassignmentRisk: 'none',
      performanceImpact: 'none'
    },
    currentStep: 0
  });

  const [objects, setObjects] = useState<ObjectVisual[]>([]);
  const [pointers, setPointers] = useState<PointerVisual[]>([]);

  const createBasicComparison = () => {
    setState(prev => ({
      ...prev,
      objects: [
        { id: 'target', name: 'target', value: 42, type: 'target', isActive: true }
      ],
      pointers: [
        { id: 'ptr', name: 'ptr', type: 'raw_ptr', pointsTo: 'target', isValid: true, canBeNull: true, canBeReassigned: true },
        { id: 'ref', name: 'ref', type: 'reference', pointsTo: 'target', isValid: true, canBeNull: false, canBeReassigned: false }
      ],
      operation: 'create_ptr',
      message: 'int* ptr = &target; int& ref = target; - pointer y reference al mismo objeto',
      currentStep: 1,
      safetyAnalysis: {
        nullSafety: 'unsafe',
        reassignmentRisk: 'medium',
        performanceImpact: 'none'
      }
    }));

    setObjects([{
      id: 'target',
      name: 'target',
      value: 42,
      position: [0, 0, 0],
      type: 'target',
      isActive: true
    }]);

    setPointers([
      {
        id: 'ptr',
        name: 'ptr',
        position: [-3, 2, 0],
        type: 'raw_ptr',
        pointsTo: 'target',
        isValid: true,
        canBeNull: true
      },
      {
        id: 'ref',
        name: 'ref',
        position: [3, 2, 0],
        type: 'reference',
        pointsTo: 'target',
        isValid: true,
        canBeNull: false
      }
    ]);
  };

  const demonstrateNullPointer = () => {
    setState(prev => ({
      ...prev,
      pointers: [
        ...prev.pointers,
        { id: 'null_ptr', name: 'null_ptr', type: 'null_ptr', pointsTo: null, isValid: false, canBeNull: true, canBeReassigned: true }
      ],
      operation: 'null_check',
      message: 'int* null_ptr = nullptr; - pointer puede ser null, reference NO',
      currentStep: 2,
      safetyAnalysis: {
        nullSafety: 'unsafe',
        reassignmentRisk: 'high',
        performanceImpact: 'minimal'
      }
    }));

    setPointers(prev => [...prev, {
      id: 'null_ptr',
      name: 'null_ptr',
      position: [0, -2, 0],
      type: 'null_ptr',
      pointsTo: null,
      isValid: false,
      canBeNull: true
    }]);
  };

  const demonstrateReassignment = () => {
    const newTarget = { id: 'target2', name: 'target2', value: 99, type: 'target' as const, isActive: true };
    
    setState(prev => ({
      ...prev,
      objects: [...prev.objects, newTarget],
      pointers: prev.pointers.map(ptr => 
        ptr.id === 'ptr' ? { ...ptr, pointsTo: 'target2' } : ptr
      ),
      operation: 'reassign',
      message: 'ptr = &target2; - pointer reasignado, reference NO puede reasignarse',
      currentStep: 3,
      safetyAnalysis: {
        nullSafety: 'unsafe',
        reassignmentRisk: 'high',
        performanceImpact: 'minimal'
      }
    }));

    setObjects(prev => [...prev, {
      id: 'target2',
      name: 'target2',
      value: 99,
      position: [-2, -1, 0],
      type: 'target',
      isActive: true
    }]);

    setPointers(prev => prev.map(ptr => 
      ptr.id === 'ptr' ? { ...ptr, pointsTo: 'target2' } : ptr
    ));
  };

  const introduceNotNull = () => {
    setState(prev => ({
      ...prev,
      currentComparison: 'not_null',
      pointers: [
        ...prev.pointers,
        { id: 'not_null', name: 'not_null', type: 'not_null_ptr', pointsTo: 'target', isValid: true, canBeNull: false, canBeReassigned: true }
      ],
      operation: 'demonstrate_not_null',
      message: 'gsl::not_null<int*> not_null(&target) - combina ventajas de pointer y reference',
      currentStep: 4,
      safetyAnalysis: {
        nullSafety: 'checked',
        reassignmentRisk: 'medium',
        performanceImpact: 'minimal'
      }
    }));

    setPointers(prev => [...prev, {
      id: 'not_null',
      name: 'not_null',
      position: [3, -2, 0],
      type: 'not_null_ptr',
      pointsTo: 'target',
      isValid: true,
      canBeNull: false
    }]);
  };

  const showGuidelinesCompliance = () => {
    setState(prev => ({
      ...prev,
      currentComparison: 'guidelines',
      message: 'Core Guidelines: prefer references, use not_null<T*> para optional ownership',
      currentStep: 5
    }));
  };

  const resetDemo = () => {
    setState({
      objects: [],
      pointers: [],
      operation: 'none',
      message: 'Comparación reiniciada - Pointers vs References',
      currentComparison: 'ptr_vs_ref',
      safetyAnalysis: {
        nullSafety: 'safe',
        reassignmentRisk: 'none',
        performanceImpact: 'none'
      },
      currentStep: 0
    });

    setObjects([]);
    setPointers([]);
  };

  const { updateProgress } = useApp();
  
  useEffect(() => {
    updateProgress(20, {
      completed: false,
      timeSpent: 0,
      hintsUsed: 0,
      errors: 0
    });
  }, [updateProgress]);

  const lessonColors = theme.colors.intermediate;

  return (
    <LessonLayout
      title="Lección 20: Pointers vs References"
      subtitle="Semántica, Seguridad y Core Guidelines"
      lessonNumber={20}
      topic="intermediate"
    >
      <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
            <MemoryVisualization 
              state={state} 
              objects={objects}
              pointers={pointers}
            />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <TheoryPanel>
          <div>
            <TabButton 
              active={state.currentComparison === 'ptr_vs_ref'}
              onClick={() => setState(prev => ({ ...prev, currentComparison: 'ptr_vs_ref' }))}
            >
              Pointer vs Reference
            </TabButton>
            <TabButton 
              active={state.currentComparison === 'not_null'}
              onClick={() => setState(prev => ({ ...prev, currentComparison: 'not_null' }))}
            >
              not_null&lt;T*&gt;
            </TabButton>
            <TabButton 
              active={state.currentComparison === 'guidelines'}
              onClick={() => setState(prev => ({ ...prev, currentComparison: 'guidelines' }))}
            >
              Core Guidelines
            </TabButton>
          </div>

          {state.currentComparison === 'ptr_vs_ref' && (
            <>
              <Section>
                <SectionTitle>🔗 Pointers vs References</SectionTitle>
<p>Diferencias fundamentales en semántica y seguridad:</p>
                <CodeBlock language="cpp">{`// Pointer - puede ser null, reasignable
int* ptr = &target;
ptr = nullptr;        // ✅ Legal
ptr = &other;         // ✅ Legal  
if (ptr) { *ptr; }    // ⚠️ Null check necesario

// Reference - nunca null, no reasignable
int& ref = target;
// ref = other;       // ❌ ERROR: no reasignable
// int& bad;          // ❌ ERROR: debe inicializarse
*ref;                 // ✅ Siempre seguro (no null check)`}</CodeBlock>
              </Section>

              <InteractiveSection>
          <SectionTitle>🎮 Demostración Básica</SectionTitle>
                
                <ButtonGroup>
            <Button onClick={createBasicComparison} variant="primary">
                  1. Crear ptr y ref
                </Button>
                
                <Button 
                  onClick={demonstrateNullPointer}
                  disabled={state.currentStep < 1}
                  variant="warning"
                >
                  2. ⚠️ Null pointer
                </Button>
                
                <Button 
                  onClick={demonstrateReassignment}
                  disabled={state.currentStep < 2}
                  variant="secondary"
                >
                  3. Reasignar pointer
                </Button>
          </ButtonGroup>
        </InteractiveSection>

              <ComparisonTable>
                <SectionTitle>📊 Comparación Detallada</SectionTitle>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '0.9em' }}>
                  <div><strong>Característica</strong>
          </div>
                  <div><strong>Pointer (T*)</strong></div>
                  <div><strong>Reference (T&)</strong></div>
                  
                  <div>Puede ser null</div>
                  <div style={{ color: '#ff8800' }}>✓ Sí</div>
                  <div style={{ color: '#00ff88' }}>✗ No</div>
                  
                  <div>Reasignable</div>
                  <div style={{ color: '#ff8800' }}>✓ Sí</div>
                  <div style={{ color: '#00ff88' }}>✗ No</div>
                  
                  <div>Requiere inicialización</div>
                  <div style={{ color: '#ff8800' }}>✗ No</div>
                  <div style={{ color: '#00ff88' }}>✓ Sí</div>
                  
                  <div>Aritmética de punteros</div>
                  <div style={{ color: '#ff8800' }}>✓ Sí</div>
                  <div style={{ color: '#00ff88' }}>✗ No</div>
                  
                  <div>Overhead memoria</div>
                  <div style={{ color: '#ffcc00' }}>8 bytes</div>
                  <div style={{ color: '#00ff88' }}>0 bytes</div>
                  
                  <div>Indirección</div>
                  <div style={{ color: '#ff8800' }}>Sí</div>
                  <div style={{ color: '#00ff88' }}>No (alias)</div>
                </div>
              </ComparisonTable>
            </>
          )}

          {state.currentComparison === 'not_null' && (
            <>
              <Section>
                <SectionTitle>🛡️ gsl::not_null&lt;T*&gt;</SectionTitle>
<p>Wrapper que combina flexibilidad de pointers con seguridad de references:</p>
                <CodeBlock language="cpp">{`#include <gsl/gsl>

// not_null<T*> - pointer que garantiza no ser null
gsl::not_null<int*> safe_ptr(&target);

// ✅ Ventajas:
// - No puede ser null (compilador + runtime checks)
// - Reasignable (a diferencia de reference)  
// - Compatible con APIs que esperan T*
// - Zero overhead en release builds

// ❌ Limitaciones:
// - Requiere GSL library
// - Runtime overhead en debug builds
// - No previene dangling pointers

void process(gsl::not_null<Widget*> widget) {
    // No null check necesario
    widget->method();  // ✅ Siempre seguro
}`}</CodeBlock>
              </Section>

              <InteractiveSection>
          <SectionTitle>🔧 not_null Demo</SectionTitle>
                
                <Button 
                  onClick={introduceNotNull}
                  disabled={state.currentStep < 3}
                  variant="success"
                >
                  4. Introducir not_null
                </Button>
          </InteractiveSection>

              <SafetyPanel level={state.safetyAnalysis.nullSafety}>
                <SectionTitle>🛡️ Análisis de Seguridad</SectionTitle>
<div>Null Safety: {state.safetyAnalysis.nullSafety}
          </div>
                <div>Reassignment Risk: {state.safetyAnalysis.reassignmentRisk}</div>
                <div>Performance Impact: {state.safetyAnalysis.performanceImpact}</div>
                
                {state.safetyAnalysis.nullSafety === 'checked' && (
                  <div style={{ color: '#00ff88', marginTop: '10px' }}>
                    ✅ not_null proporciona null safety con flexibilidad de pointer
                  </div>
                )}
              </SafetyPanel>
            </>
          )}

          {state.currentComparison === 'guidelines' && (
            <>
              <Section>
                <SectionTitle>📋 Core Guidelines</SectionTitle>
<p>Recomendaciones oficiales para uso seguro:</p>
                <CodeBlock language="cpp">{`// F.60: Prefer T* over T& when "no argument" is valid
void process(Widget* widget) {    // ✅ Puede recibir nullptr
    if (!widget) return;          // ⚠️ Null check requerido
    widget->method();
}

// F.17: Prefer T& when object must exist  
void process(Widget& widget) {    // ✅ Garantiza objeto válido
    widget.method();              // ✅ No null check necesario
}

// GSL: Use not_null<T*> for non-null pointers
void process(gsl::not_null<Widget*> widget) {  // ✅ Best of both
    widget->method();             // ✅ No null check, reasignable
}`}</CodeBlock>
              </Section>

              <InteractiveSection>
          <SectionTitle>🎯 Guidelines Compliance</SectionTitle>
                
                <Button onClick={showGuidelinesCompliance} variant="success">
                  5. Mostrar Guidelines
                </Button>
          </InteractiveSection>

              <Section>
                <SectionTitle>🎯 Decisión Matrix</SectionTitle>
                <CodeBlock language="cpp">{`// Cuándo usar cada uno:

T&           - Parameter debe existir, no ownership
             - Member variables que siempre son válidas
             - Return values que siempre son válidas

T*           - Parameter opcional (puede ser null)
             - Arrays y pointer arithmetic
             - C interop
             - Ownership transfer scenarios

not_null<T*> - Parameter no-null pero reasignable
             - APIs que necesitan pointer semántica
             - Evitar null checks repetitivos
             - Migration de T* a safe código

unique_ptr<T>  - Exclusive ownership
shared_ptr<T>  - Shared ownership
weak_ptr<T>    - Non-owning observation`}</CodeBlock>
              </Section>

              <Section>
                <SectionTitle>🚨 Common Pitfalls</SectionTitle>
                <CodeBlock language="cpp">{`// ❌ Dangling reference
int& get_ref() {
    int local = 42;
    return local;     // ERROR: dangling reference
}

// ❌ Optional reference (impossible)
std::optional<int&> opt_ref;  // ERROR: references no optionals

// ❌ Reference reassignment confusion
void confusing(int& ref) {
    int other = 99;
    ref = other;      // Assigns VALUE, doesn't rebind!
}

// ✅ Correct patterns
std::optional<std::reference_wrapper<int>> opt_ref; // ✅ 
gsl::not_null<int*> safe_ptr(&value);               // ✅
auto& ref = get_valid_object();                     // ✅`}</CodeBlock>
              </Section>
            </>
          )}

          <Button onClick={resetDemo} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
              </TheoryPanel>
    </LessonLayout>
  );
};

export default Lesson20_PointersVsReferences;