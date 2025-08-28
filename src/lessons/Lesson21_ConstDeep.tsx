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



interface ConstState {
  widgets: Array<{
    id: string;
    name: string;
    value: number;
    isConst: boolean;
    isMutable: boolean;
  }>;
  smartPointers: Array<{
    id: string;
    name: string;
    type: 'unique_ptr' | 'shared_ptr' | 'raw_ptr';
    constLevel: 'none' | 'pointer' | 'pointee' | 'both';
    pointsTo: string;
    canModifyPointer: boolean;
    canModifyPointee: boolean;
  }>;
  operation: 'none' | 'create_mutable' | 'create_const_ptr' | 'create_const_pointee' | 'create_const_both' | 'attempt_modify';
  message: string;
  constAnalysis: {
    pointerConstness: 'mutable' | 'const';
    pointeeConstness: 'mutable' | 'const';
    violationAttempted: boolean;
    errorMessage: string;
  };
  currentVariation: 'basic' | 'deep' | 'propagation';
  currentStep: number;
}

interface WidgetVisual {
  id: string;
  name: string;
  value: number;
  position: [number, number, number];
  isConst: boolean;
  isMutable: boolean;
  isHighlighted: boolean;
}

interface SmartPointerVisual {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'unique_ptr' | 'shared_ptr' | 'raw_ptr';
  constLevel: 'none' | 'pointer' | 'pointee' | 'both';
  pointsTo: string;
  isActive: boolean;
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



const ErrorPanel = styled.div<{ show: boolean }>`
  background: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff4444;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  display: ${props => props.show ? 'block' : 'none'};
  animation: ${props => props.show ? 'errorFlash 2s ease-in-out' : 'none'};

  @keyframes errorFlash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
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
  state: ConstState;
  widgets: WidgetVisual[];
  smartPointers: SmartPointerVisual[];
}> = ({ state, widgets, smartPointers }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const WidgetComponent = ({ widget }: { widget: WidgetVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && widget.isHighlighted) {
        meshRef.current.rotation.z += 0.05;
        const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    });

    const getWidgetColor = () => {
      if (widget.isConst) return '#6666ff';
      if (widget.isMutable) return '#ff6666';
      return '#00ff88';
    };

    return (
      <group position={widget.position}>
        <mesh ref={meshRef}>
          <dodecahedronGeometry args={[1]} />
          <meshStandardMaterial 
            color={getWidgetColor()}
            emissive={getWidgetColor()}
            emissiveIntensity={widget.isHighlighted ? 0.5 : 0.2}
          />
        </mesh>
        
        <Text
          position={[0, 0, 1.2]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {widget.value}
        </Text>

        <Text
          position={[0, -1.8, 0]}
          fontSize={0.25}
          color={getWidgetColor()}
          anchorX="center"
          anchorY="middle"
        >
          {widget.name}
        </Text>

        {widget.isConst && (
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.2}
            color="#6666ff"
            anchorX="center"
            anchorY="middle"
          >
            const
          </Text>
        )}

        {widget.isMutable && (
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.2}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            mutable
          </Text>
        )}
      </group>
    );
  };

  const SmartPointerComponent = ({ ptr }: { ptr: SmartPointerVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && ptr.isActive) {
        meshRef.current.rotation.y += 0.03;
      }
    });

    const getPointerColor = () => {
      switch (ptr.constLevel) {
        case 'none': return '#00ff88';
        case 'pointer': return '#ffaa00';
        case 'pointee': return '#6666ff';
        case 'both': return '#ff6666';
        default: return '#666666';
      }
    };

    const getGeometry = () => {
      switch (ptr.type) {
        case 'unique_ptr':
          return <boxGeometry args={[1.8, 0.8, 0.3]} />;
        case 'shared_ptr':
          return <cylinderGeometry args={[0.6, 0.6, 1.2, 8]} />;
        default:
          return <boxGeometry args={[1.2, 0.6, 0.2]} />;
      }
    };

    return (
      <group position={ptr.position}>
        <mesh ref={meshRef}>
          {getGeometry()}
          <meshStandardMaterial 
            color={getPointerColor()}
            emissive={getPointerColor()}
            emissiveIntensity={0.3}
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
          {ptr.type}
        </Text>

        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color={getPointerColor()}
          anchorX="center"
          anchorY="middle"
        >
          {ptr.constLevel === 'none' ? 'mutable' :
           ptr.constLevel === 'pointer' ? 'const ptr' :
           ptr.constLevel === 'pointee' ? 'const T' :
           'const ptr const T'}
        </Text>
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

      {widgets.map(widget => (
        <WidgetComponent key={widget.id} widget={widget} />
      ))}

      {smartPointers.map(ptr => (
        <SmartPointerComponent key={ptr.id} ptr={ptr} />
      ))}

      {/* Arrows from pointers to widgets */}
      {smartPointers.map(ptr => {
        const targetWidget = widgets.find(w => w.id === ptr.pointsTo);
        if (!targetWidget) return null;

        return (
          <ConnectionArrow 
            key={`${ptr.id}-arrow`}
            from={ptr.position} 
            to={targetWidget.position} 
            color={ptr.constLevel === 'none' ? '#00ff88' :
                   ptr.constLevel === 'pointer' ? '#ffaa00' :
                   ptr.constLevel === 'pointee' ? '#6666ff' : '#ff6666'}
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

const Lesson21_ConstDeep: React.FC = () => {
  const [state, setState] = useState<ConstState>({
    widgets: [],
    smartPointers: [],
    operation: 'none',
    message: 'const correctness profunda - pointer const vs pointee const',
    constAnalysis: {
      pointerConstness: 'mutable',
      pointeeConstness: 'mutable',
      violationAttempted: false,
      errorMessage: ''
    },
    currentVariation: 'basic',
    currentStep: 0
  });

  const [widgets, setWidgets] = useState<WidgetVisual[]>([]);
  const [smartPointers, setSmartPointers] = useState<SmartPointerVisual[]>([]);

  const createBasicExample = () => {
    setState(prev => ({
      ...prev,
      widgets: [
        { id: 'widget1', name: 'widget', value: 42, isConst: false, isMutable: false }
      ],
      smartPointers: [
        { 
          id: 'ptr_mutable', 
          name: 'ptr', 
          type: 'unique_ptr', 
          constLevel: 'none', 
          pointsTo: 'widget1',
          canModifyPointer: true,
          canModifyPointee: true
        }
      ],
      operation: 'create_mutable',
      message: 'std::unique_ptr<Widget> ptr - mutable pointer, mutable pointee',
      currentStep: 1,
      constAnalysis: {
        pointerConstness: 'mutable',
        pointeeConstness: 'mutable',
        violationAttempted: false,
        errorMessage: ''
      }
    }));

    setWidgets([{
      id: 'widget1',
      name: 'widget',
      value: 42,
      position: [2, 0, 0],
      isConst: false,
      isMutable: false,
      isHighlighted: false
    }]);

    setSmartPointers([{
      id: 'ptr_mutable',
      name: 'ptr',
      position: [-2, 0, 0],
      type: 'unique_ptr',
      constLevel: 'none',
      pointsTo: 'widget1',
      isActive: true
    }]);
  };

  const createConstPointer = () => {
    setState(prev => ({
      ...prev,
      smartPointers: [
        ...prev.smartPointers,
        { 
          id: 'const_ptr', 
          name: 'const_ptr', 
          type: 'unique_ptr', 
          constLevel: 'pointer', 
          pointsTo: 'widget1',
          canModifyPointer: false,
          canModifyPointee: true
        }
      ],
      operation: 'create_const_ptr',
      message: 'const std::unique_ptr<Widget> const_ptr - const pointer, mutable pointee',
      currentStep: 2,
      constAnalysis: {
        pointerConstness: 'const',
        pointeeConstness: 'mutable',
        violationAttempted: false,
        errorMessage: ''
      }
    }));

    setSmartPointers(prev => [...prev, {
      id: 'const_ptr',
      name: 'const_ptr',
      position: [-2, 2, 0],
      type: 'unique_ptr',
      constLevel: 'pointer',
      pointsTo: 'widget1',
      isActive: true
    }]);
  };

  const createConstPointee = () => {
    const constWidget = { id: 'const_widget', name: 'const_widget', value: 99, isConst: true, isMutable: false };
    
    setState(prev => ({
      ...prev,
      widgets: [...prev.widgets, constWidget],
      smartPointers: [
        ...prev.smartPointers,
        { 
          id: 'ptr_const_pointee', 
          name: 'ptr_const', 
          type: 'unique_ptr', 
          constLevel: 'pointee', 
          pointsTo: 'const_widget',
          canModifyPointer: true,
          canModifyPointee: false
        }
      ],
      operation: 'create_const_pointee',
      message: 'std::unique_ptr<const Widget> ptr_const - mutable pointer, const pointee',
      currentStep: 3,
      constAnalysis: {
        pointerConstness: 'mutable',
        pointeeConstness: 'const',
        violationAttempted: false,
        errorMessage: ''
      }
    }));

    setWidgets(prev => [...prev, {
      id: 'const_widget',
      name: 'const_widget',
      value: 99,
      position: [2, -2, 0],
      isConst: true,
      isMutable: false,
      isHighlighted: false
    }]);

    setSmartPointers(prev => [...prev, {
      id: 'ptr_const_pointee',
      name: 'ptr_const',
      position: [-2, -2, 0],
      type: 'unique_ptr',
      constLevel: 'pointee',
      pointsTo: 'const_widget',
      isActive: true
    }]);
  };

  const createConstBoth = () => {
    setState(prev => ({
      ...prev,
      smartPointers: [
        ...prev.smartPointers,
        { 
          id: 'const_both', 
          name: 'const_both', 
          type: 'unique_ptr', 
          constLevel: 'both', 
          pointsTo: 'const_widget',
          canModifyPointer: false,
          canModifyPointee: false
        }
      ],
      operation: 'create_const_both',
      message: 'const std::unique_ptr<const Widget> const_both - const pointer, const pointee',
      currentStep: 4,
      constAnalysis: {
        pointerConstness: 'const',
        pointeeConstness: 'const',
        violationAttempted: false,
        errorMessage: ''
      }
    }));

    setSmartPointers(prev => [...prev, {
      id: 'const_both',
      name: 'const_both',
      position: [0, 2, 0],
      type: 'unique_ptr',
      constLevel: 'both',
      pointsTo: 'const_widget',
      isActive: true
    }]);
  };

  const attemptModification = (ptrId: string, modifyType: 'pointer' | 'pointee') => {
    const ptr = state.smartPointers.find(p => p.id === ptrId);
    if (!ptr) return;

    let errorMessage = '';
    let canModify = false;

    if (modifyType === 'pointer') {
      canModify = ptr.canModifyPointer;
      errorMessage = canModify ? '' : 'Error: cannot reassign const pointer';
    } else {
      canModify = ptr.canModifyPointee;
      errorMessage = canModify ? '' : 'Error: cannot modify const pointee';
    }

    setState(prev => ({
      ...prev,
      operation: 'attempt_modify',
      message: canModify ? 
        `✅ Modificación permitida en ${ptrId}` :
        `❌ ${errorMessage}`,
      constAnalysis: {
        ...prev.constAnalysis,
        violationAttempted: !canModify,
        errorMessage: canModify ? '' : errorMessage
      }
    }));

    // Highlight the target widget
    if (modifyType === 'pointee') {
      setWidgets(prev => prev.map(w => 
        w.id === ptr.pointsTo ? { ...w, isHighlighted: true } : { ...w, isHighlighted: false }
      ));

      setTimeout(() => {
        setWidgets(prev => prev.map(w => ({ ...w, isHighlighted: false })));
      }, 2000);
    }
  };

  const demonstrateDeepConstness = () => {
    setState(prev => ({
      ...prev,
      currentVariation: 'deep',
      message: 'const propagation - const no se propaga automáticamente por indirection'
    }));
  };

  const demonstrateConstPropagation = () => {
    setState(prev => ({
      ...prev,
      currentVariation: 'propagation',
      message: 'const propagation en jerarquías - member functions y const methods'
    }));
  };

  const resetDemo = () => {
    setState({
      widgets: [],
      smartPointers: [],
      operation: 'none',
      message: 'Demostración reiniciada - const correctness patterns',
      constAnalysis: {
        pointerConstness: 'mutable',
        pointeeConstness: 'mutable',
        violationAttempted: false,
        errorMessage: ''
      },
      currentVariation: 'basic',
      currentStep: 0
    });

    setWidgets([]);
    setSmartPointers([]);
  };

  const { updateProgress } = useApp();
  
  useEffect(() => {
    updateProgress(21, {
      completed: false,
      timeSpent: 0,
      hintsUsed: 0,
      errors: 0
    });
  }, [updateProgress]);

  const lessonColors = theme.colors.intermediate;

  return (
    <LessonLayout
      title="Lección 21: Deep Const Correctness"
      subtitle="const Pointer vs const Pointee - Semántica Profunda"
      lessonNumber={21}
      topic="intermediate"
    >
      <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <MemoryVisualization 
              state={state} 
              widgets={widgets}
              smartPointers={smartPointers}
            />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <TheoryPanel>
          <div>
            <TabButton 
              active={state.currentVariation === 'basic'}
              onClick={() => setState(prev => ({ ...prev, currentVariation: 'basic' }))}
            >
              Basic Const
            </TabButton>
            <TabButton 
              active={state.currentVariation === 'deep'}
              onClick={demonstrateDeepConstness}
            >
              Deep Const
            </TabButton>
            <TabButton 
              active={state.currentVariation === 'propagation'}
              onClick={demonstrateConstPropagation}
            >
              Propagation
            </TabButton>
          </div>

          {state.currentVariation === 'basic' && (
            <>
              <Section>
                <SectionTitle>🔒 const Variations</SectionTitle>
<p>Diferentes niveles de const correctness con smart pointers:</p>
                <CodeBlock>{`{[
                  '// Mutable pointer, mutable pointee',
                  'std::unique_ptr<Widget> ptr;',
                  'ptr.reset(new Widget());  // ✅ OK',
                  'ptr->modify();            // ✅ OK',
                  '',
                  '// Const pointer, mutable pointee',
                  'const std::unique_ptr<Widget> const_ptr(new Widget());',
                  '// const_ptr.reset(...);  // ❌ ERROR: const pointer',
                  'const_ptr->modify();      // ✅ OK: pointee is mutable',
                  '',
                  '// Mutable pointer, const pointee',
                  'std::unique_ptr<const Widget> ptr_const(new Widget());',
                  'ptr_const.reset(...);     // ✅ OK: pointer is mutable',
                  '// ptr_const->modify();   // ❌ ERROR: const pointee',
                  '',
                  '// Const pointer, const pointee',
                  'const std::unique_ptr<const Widget> const_both(new Widget());',
                  '// const_both.reset(...); // ❌ ERROR: const pointer',
                  '// const_both->modify();  // ❌ ERROR: const pointee',
                ].join('\n')}`}</CodeBlock>
              </Section>

              <InteractiveSection>
          <SectionTitle>🎮 Crear Variaciones</SectionTitle>
                
                <ButtonGroup>
            <Button onClick={createBasicExample} variant="primary">
                  1. Mutable ptr & pointee
                </Button>
                
                <Button 
                  onClick={createConstPointer}
                  disabled={state.currentStep < 1}
                  variant="warning"
                >
                  2. const Pointer
                </Button>
                
                <Button 
                  onClick={createConstPointee}
                  disabled={state.currentStep < 2}
                  variant="warning"
                >
                  3. const Pointee
                </Button>
                
                <Button 
                  onClick={createConstBoth}
                  disabled={state.currentStep < 3}
                  variant="danger"
                >
                  4. const Both
                </Button>
          </ButtonGroup>
        </InteractiveSection>

              <InteractiveSection>
          <SectionTitle>🔧 Probar Modificaciones</SectionTitle>
<ButtonGroup>
            <Button onClick={() => attemptModification('ptr_mutable', 'pointer')}>
                  Reasignar ptr mutable
                </Button>
                
                <Button onClick={() => attemptModification('const_ptr', 'pointer')}>
                  ❌ Reasignar const ptr
                </Button>
                
                <Button onClick={() => attemptModification('ptr_mutable', 'pointee')}>
                  Modificar mutable pointee
                </Button>
                
                <Button onClick={() => attemptModification('ptr_const_pointee', 'pointee')}>
                  ❌ Modificar const pointee
                </Button>
          </ButtonGroup>
          </InteractiveSection>
            </>
          )}

          {state.currentVariation === 'deep' && (
            <>
              <Section>
                <SectionTitle>🏗️ Deep Const vs Shallow Const</SectionTitle>
<p>const no se propaga automáticamente a través de indirections:</p>
                <CodeBlock>{`{[
                  'class Container {',
                  '    std::unique_ptr<Widget> widget_;',
                  'public:',
                  '    // ❌ SHALLOW const - widget_ pointer es const, pero Widget no',
                  '    void shallow_const() const {',
                  "        // widget_.reset(...);     // ERROR: can't modify pointer",
                  '        widget_->modify();         // ✅ OK: Widget is not const!',
                  '    }',
                  '    ',
                  '    // ✅ DEEP const - garantiza que Widget no se modifica',
                  '    void deep_const() const {',
                  '        const Widget& w = *widget_;  // Explicit const view',
                  '        // w.modify();               // ERROR: Widget is const',
                  '    }',
                  '    ',
                  '    // ✅ Alternative: const member type',
                  '    std::unique_ptr<const Widget> const_widget_;',
                  '};',
                  '',
                  '// Logical const vs bitwise const',
                  'class LogicalConstExample {',
                  '    mutable std::mutex mutex_;         // ✅ mutable para locks',
                  '    mutable std::unique_ptr<Cache> cache_;  // ✅ lazy computation',
                  '    ',
                  'public:',
                  '    int get_value() const {',
                  '        std::lock_guard<std::mutex> lock(mutex_);  // ✅ mutable mutex',
                  '        if (!cache_) {',
                  '            cache_ = std::make_unique<Cache>();    // ✅ mutable cache',
                  '        }',
                  '        return cache_->get();',
                  '    }',
                  '};',
                ].join('\n')}`}</CodeBlock>
              </Section>

              <Section>
                <SectionTitle>🎯 Patterns para Deep Const</SectionTitle>
                <CodeBlock>{`{[
                  '// Pattern 1: const member types',
                  'class DeepConstContainer {',
                  '    std::unique_ptr<const Data> data_;  // Data never modifiable',
                  '    const std::unique_ptr<Data> ptr_;   // Pointer never reassignable',
                  '};',
                  '',
                  '// Pattern 2: const methods with const views',
                  'class ShallowConstContainer {',
                  '    std::unique_ptr<Data> data_;',
                  'public:',
                  '    const Data& get_data() const {      // Return const view',
                  '        return *data_;',
                  '    }',
                  '    ',
                  '    void process() const {',
                  '        const auto& data = *data_;      // Explicit const view',
                  '        // data.modify();               // ERROR: const view',
                  '    }',
                  '};',
                  '',
                  '// Pattern 3: mutable for logical const',
                  'class CacheContainer {',
                  '    std::unique_ptr<Data> data_;',
                  '    mutable std::unique_ptr<Cache> cache_;  // Logical const exception',
                  '    ',
                  'public:',
                  '    const Cache& get_cache() const {',
                  '        if (!cache_) {',
                  '            cache_ = compute_cache(*data_);  // ✅ Lazy const computation',
                  '        }',
                  '        return *cache_;',
                  '    }',
                  '};',
                ].join('\n')}`}</CodeBlock>
              </Section>
            </>
          )}

          {state.currentVariation === 'propagation' && (
            <>
              <Section>
                <SectionTitle>🌊 Const Propagation</SectionTitle>
                <p>Cómo const se propaga (o no) a través del código:</p>
                <CodeBlock>{`{[
                  'class Widget {',
                  '    int value_;',
                  '    std::unique_ptr<Detail> detail_;',
                  '    ',
                  'public:',
                  '    // const method - can only call other const methods',
                  '    int get_value() const {',
                  '        return value_;              // ✅ OK: reading member',
                  '        // value_ = 42;             // ❌ ERROR: modifying member',
                  '        return detail_->get_info(); // ✅ Only if get_info() is const',
                  '    }',
                  '    ',
                  '    // Non-const method - can call any method',
                  '    void set_value(int v) {',
                  '        value_ = v;                 // ✅ OK: non-const method',
                  '        detail_->modify();          // ✅ OK: can call non-const',
                  '    }',
                  '    ',
                  '    // const method that needs to modify (logical const)',
                  '    std::string to_string() const {',
                  '        // Lazy computation - logically const but bitwise mutable',
                  '        if (!cached_string_) {',
                  '            cached_string_ = std::make_unique<std::string>(',
                  '                "Widget(" + std::to_string(value_) + ")"',
                  '            );',
                  '        }',
                  '        return *cached_string_;',
                  '    }',
                  '    ',
                  'private:',
                  '    mutable std::unique_ptr<std::string> cached_string_;',
                  '};',
                  '',
                  '// const propagation through call chains',
                  'void process_widget(const Widget& w) {',
                  '    auto value = w.get_value();     // ✅ const method',
                  '    // w.set_value(42);             // ❌ ERROR: non-const method',
                  '    ',
                  '    auto str = w.to_string();       // ✅ const method (logical const)',
                  '}',
                ].join('\n')}`}</CodeBlock>
              </Section>

              <Section>
                <SectionTitle>🔍 const Overloading</SectionTitle>
                <CodeBlock>{`{[
                  'class SmartContainer {',
                  '    std::unique_ptr<Data> data_;',
                  '    ',
                  'public:',
                  '    // const version - returns const reference',
                  '    const Data& get() const {',
                  '        return *data_;',
                  '    }',
                  '    ',
                  '    // non-const version - returns mutable reference',
                  '    Data& get() {',
                  '        return *data_;',
                  '    }',
                  '    ',
                  '    // const version - returns const pointer',
                  '    const Data* operator->() const {',
                  '        return data_.get();',
                  '    }',
                  '    ',
                  '    // non-const version - returns mutable pointer',
                  '    Data* operator->() {',
                  '        return data_.get();',
                  '    }',
                  '};',
                  '',
                  'void demonstrate_const_overloading() {',
                  '    SmartContainer container;',
                  '    const SmartContainer& const_ref = container;',
                  '    ',
                  '    container.get().modify();      // ✅ Non-const version called',
                  '    // const_ref.get().modify();   // ❌ const version returns const&',
                  '    ',
                  '    container->modify();           // ✅ Non-const operator->',
                  '    // const_ref->modify();        // ❌ const operator-> returns const*',
                  '}',
                ].join('\n')}`}</CodeBlock>
              </Section>
            </>
          )}

          <ConstAnalysisPanel>
            <SectionTitle>🔍 Análisis de Constness</SectionTitle>
            <div>Pointer constness: {state.constAnalysis.pointerConstness}
          </div>
            <div>Pointee constness: {state.constAnalysis.pointeeConstness}</div>
            {state.constAnalysis.violationAttempted && (
              <div style={{ color: '#ff6666' }}>
                ⚠️ Violation detected: {state.constAnalysis.errorMessage}
              </div>
            )}
          </ConstAnalysisPanel>

          <ErrorPanel show={state.constAnalysis.violationAttempted}>
            <SectionTitle>💥 Const Violation</SectionTitle>
            <p>{state.constAnalysis.errorMessage}</p>
            <CodeBlock language="cpp">{`// El compilador detecta violaciones de const:
// error: cannot assign to variable 'ptr' with const-qualified type
// error: member function 'modify' not viable: 'this' argument has 
//        type 'const Widget', but function is not marked const`}</CodeBlock>
          </ErrorPanel>

          <Section>
            <SectionTitle>📋 Const Guidelines</SectionTitle>
            <ul>
              <li><strong>const by default:</strong> Make everything const unless it needs to mutate</li>
              <li><strong>const correctness:</strong> Propagate const through your API design</li>
              <li><strong>mutable sparingly:</strong> Only for logical const scenarios</li>
              <li><strong>const overloading:</strong> Provide both const and non-const versions</li>
              <li><strong>const member types:</strong> For truly immutable data</li>
              <li><strong>const methods:</strong> Don't modify object state (except mutable)</li>
            </ul>
          </Section>

          <Button onClick={resetDemo} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
              </TheoryPanel>
    </LessonLayout>
  );
};

export default Lesson21_ConstDeep;
