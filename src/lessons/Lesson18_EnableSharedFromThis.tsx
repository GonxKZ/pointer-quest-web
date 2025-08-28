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



interface ESFTState {
  widget: {
    exists: boolean;
    hasESFTBase: boolean;
    sharedFromThisCount: number;
    externalSharedCount: number;
    isInitialized: boolean;
  };
  operation: 'none' | 'create_raw' | 'create_shared' | 'call_shared_from_this' | 'demonstrate_error';
  message: string;
  errorState: {
    hasError: boolean;
    errorType: 'bad_weak_ptr' | 'not_initialized' | 'none';
    errorMessage: string;
  };
  sharedPtrs: Array<{
    id: string;
    name: string;
    source: 'external' | 'shared_from_this';
    useCount: number;
  }>;
  weakPtr: {
    exists: boolean;
    expired: boolean;
  };
  currentStep: number;
}

interface WidgetVisual {
  position: [number, number, number];
  exists: boolean;
  hasESFTBase: boolean;
  isGlowing: boolean;
}

interface SharedPtrVisual {
  id: string;
  name: string;
  position: [number, number, number];
  source: 'external' | 'shared_from_this';
  isActive: boolean;
}

interface WeakPtrVisual {
  position: [number, number, number];
  exists: boolean;
  expired: boolean;
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
  animation: ${props => props.show ? 'errorPulse 2s ease-in-out infinite' : 'none'};

  @keyframes errorPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;





const MemoryVisualization: React.FC<{
  state: ESFTState;
  widget: WidgetVisual;
  sharedPtrs: SharedPtrVisual[];
  weakPtr: WeakPtrVisual;
}> = ({ state, widget, sharedPtrs, weakPtr }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const WidgetComponent = ({ widget }: { widget: WidgetVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && widget.exists) {
        if (widget.isGlowing) {
          meshRef.current.rotation.z += 0.05;
          const scale = 1 + Math.sin(Date.now() * 0.01) * 0.15;
          meshRef.current.scale.setScalar(scale);
        } else {
          meshRef.current.rotation.z += 0.02;
        }
      }
    });

    const getWidgetColor = () => {
      if (!widget.exists) return '#333333';
      if (state.errorState.hasError) return '#ff4444';
      if (widget.hasESFTBase) return '#00ff88';
      return '#ffaa00';
    };

    return (
      <group position={widget.position}>
        <mesh ref={meshRef}>
          <dodecahedronGeometry args={[1.2]} />
          <meshStandardMaterial 
            color={getWidgetColor()}
            emissive={getWidgetColor()}
            emissiveIntensity={widget.isGlowing ? 0.5 : 0.2}
            transparent
            opacity={widget.exists ? 0.9 : 0.3}
          />
        </mesh>
        
        <Text
          position={[0, -2, 0]}
          fontSize={0.3}
          color={getWidgetColor()}
          anchorX="center"
          anchorY="middle"
        >
          Widget
        </Text>

        {widget.hasESFTBase && (
          <Text
            position={[0, -2.4, 0]}
            fontSize={0.2}
            color="#66ccff"
            anchorX="center"
            anchorY="middle"
          >
            : enable_shared_from_this
          </Text>
        )}

        {state.errorState.hasError && (
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.3}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            ⚠️ ERROR
          </Text>
        )}
      </group>
    );
  };

  const SharedPtrComponent = ({ ptr }: { ptr: SharedPtrVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && ptr.isActive) {
        meshRef.current.rotation.y += 0.04;
      }
    });

    const getColor = () => {
      return ptr.source === 'external' ? '#0088ff' : '#ff8800';
    };

    return (
      <group position={ptr.position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 0.8, 0.3]} />
          <meshStandardMaterial 
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={0.3}
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
          {ptr.source}
        </Text>
      </group>
    );
  };

  const WeakPtrComponent = ({ weak }: { weak: WeakPtrVisual }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && weak.exists) {
        meshRef.current.rotation.x += 0.03;
      }
    });

    if (!weak.exists) return null;

    return (
      <group position={weak.position}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial 
            color="#6666ff"
            emissive="#6666ff"
            emissiveIntensity={0.3}
            transparent
            opacity={weak.expired ? 0.4 : 0.8}
          />
        </mesh>
        
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.25}
          color="#6666ff"
          anchorX="center"
          anchorY="middle"
        >
          weak_ptr (internal)
        </Text>

        {weak.expired && (
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.2}
            color="#ff6666"
            anchorX="center"
            anchorY="middle"
          >
            EXPIRED
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

      <WidgetComponent widget={widget} />

      {sharedPtrs.map(ptr => (
        <SharedPtrComponent key={ptr.id} ptr={ptr} />
      ))}

      <WeakPtrComponent weak={weakPtr} />

      {/* Arrows from shared_ptrs to widget */}
      {sharedPtrs.map(ptr => (
        <ConnectionArrow 
          key={`${ptr.id}-arrow`}
          from={ptr.position} 
          to={widget.position} 
          color={ptr.source === 'external' ? '#0088ff' : '#ff8800'}
        />
      ))}

      {/* Arrow from weak_ptr to widget */}
      {weakPtr.exists && (
        <ConnectionArrow 
          from={weakPtr.position} 
          to={widget.position} 
          color="#6666ff"
          style={weakPtr.expired ? 'dashed' : 'solid'}
        />
      )}

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

const Lesson18_EnableSharedFromThis: React.FC = () => {
  const [state, setState] = useState<ESFTState>({
    widget: {
      exists: false,
      hasESFTBase: false,
      sharedFromThisCount: 0,
      externalSharedCount: 0,
      isInitialized: false
    },
    operation: 'none',
    message: 'enable_shared_from_this - obtener shared_ptr válido desde this',
    errorState: {
      hasError: false,
      errorType: 'none',
      errorMessage: ''
    },
    sharedPtrs: [],
    weakPtr: {
      exists: false,
      expired: false
    },
    currentStep: 0
  });

  const [widget, setWidget] = useState<WidgetVisual>({
    position: [0, 0, 0],
    exists: false,
    hasESFTBase: false,
    isGlowing: false
  });

  const [sharedPtrs, setSharedPtrs] = useState<SharedPtrVisual[]>([]);
  const [weakPtr, setWeakPtr] = useState<WeakPtrVisual>({
    position: [0, -2, 0],
    exists: false,
    expired: false
  });

  const createRawWidget = () => {
    setState(prev => ({
      ...prev,
      widget: {
        exists: true,
        hasESFTBase: true,
        sharedFromThisCount: 0,
        externalSharedCount: 0,
        isInitialized: false
      },
      operation: 'create_raw',
      message: 'Widget* raw = new Widget() - objeto sin shared_ptr, weak_ptr interno no inicializado',
      currentStep: 1,
      errorState: { hasError: false, errorType: 'none', errorMessage: '' }
    }));

    setWidget({
      position: [0, 0, 0],
      exists: true,
      hasESFTBase: true,
      isGlowing: false
    });

    setWeakPtr({
      position: [0, -2, 0],
      exists: true,
      expired: true
    });
  };

  const createSharedWidget = () => {
    setState(prev => ({
      ...prev,
      widget: {
        exists: true,
        hasESFTBase: true,
        sharedFromThisCount: 0,
        externalSharedCount: 1,
        isInitialized: true
      },
      operation: 'create_shared',
      message: 'auto shared = make_shared<Widget>() - weak_ptr interno inicializado correctamente',
      sharedPtrs: [{
        id: 'external',
        name: 'shared',
        source: 'external',
        useCount: 1
      }],
      currentStep: 2,
      errorState: { hasError: false, errorType: 'none', errorMessage: '' }
    }));

    setWidget(prev => ({
      ...prev,
      exists: true,
      hasESFTBase: true,
      isGlowing: false
    }));

    setSharedPtrs([{
      id: 'external',
      name: 'shared',
      position: [-3, 2, 0],
      source: 'external',
      isActive: true
    }]);

    setWeakPtr({
      position: [0, -2, 0],
      exists: true,
      expired: false
    });
  };

  const callSharedFromThis = () => {
    if (!state.widget.isInitialized) {
      setState(prev => ({
        ...prev,
        errorState: {
          hasError: true,
          errorType: 'bad_weak_ptr',
          errorMessage: 'std::bad_weak_ptr thrown - weak_ptr interno no inicializado'
        },
        message: '💥 raw->shared_from_this() - ERROR: objeto no controlado por shared_ptr'
      }));

      setWidget(prev => ({ ...prev, isGlowing: true }));

      setTimeout(() => {
        setWidget(prev => ({ ...prev, isGlowing: false }));
      }, 2000);

      return;
    }

    setState(prev => ({
      ...prev,
      widget: {
        ...prev.widget,
        sharedFromThisCount: prev.widget.sharedFromThisCount + 1
      },
      operation: 'call_shared_from_this',
      message: 'auto self = shared_from_this() - nuevo shared_ptr creado desde this',
      sharedPtrs: [
        ...prev.sharedPtrs,
        {
          id: 'self',
          name: 'self',
          source: 'shared_from_this',
          useCount: prev.widget.externalSharedCount + prev.widget.sharedFromThisCount + 1
        }
      ],
      currentStep: Math.max(prev.currentStep, 3),
      errorState: { hasError: false, errorType: 'none', errorMessage: '' }
    }));

    setSharedPtrs(prev => [...prev, {
      id: 'self',
      name: 'self',
      position: [3, 2, 0],
      source: 'shared_from_this',
      isActive: true
    }]);

    setWidget(prev => ({ ...prev, isGlowing: true }));

    setTimeout(() => {
      setWidget(prev => ({ ...prev, isGlowing: false }));
    }, 1500);
  };

  const demonstrateWrongUsage = () => {
    setState(prev => ({
      ...prev,
      errorState: {
        hasError: true,
        errorType: 'bad_weak_ptr',
        errorMessage: 'shared_from_this() llamado en constructor o antes de shared_ptr'
      },
      message: '❌ Widget() constructor: shared_from_this() - weak_ptr aún no inicializado'
    }));
  };

  const showWeakPtrMechanism = () => {
    setState(prev => ({
      ...prev,
      message: 'enable_shared_from_this almacena weak_ptr interno que shared_ptr inicializa',
      currentStep: Math.max(prev.currentStep, 4)
    }));

    setWidget(prev => ({ ...prev, isGlowing: true }));
    setWeakPtr(prev => ({ ...prev, exists: true }));

    setTimeout(() => {
      setWidget(prev => ({ ...prev, isGlowing: false }));
      setState(prev => ({
        ...prev,
        message: 'shared_from_this() usa weak_ptr.lock() para crear nuevo shared_ptr'
      }));
    }, 2000);
  };

  const demonstrateMultipleInheritance = () => {
    setState(prev => ({
      ...prev,
      message: '⚠️ Multiple inheritance: solo una base enable_shared_from_this permitida',
      currentStep: Math.max(prev.currentStep, 5)
    }));
  };

  const resetDemo = () => {
    setState({
      widget: {
        exists: false,
        hasESFTBase: false,
        sharedFromThisCount: 0,
        externalSharedCount: 0,
        isInitialized: false
      },
      operation: 'none',
      message: 'Demostración reiniciada - enable_shared_from_this pattern',
      errorState: {
        hasError: false,
        errorType: 'none',
        errorMessage: ''
      },
      sharedPtrs: [],
      weakPtr: {
        exists: false,
        expired: false
      },
      currentStep: 0
    });

    setWidget({
      position: [0, 0, 0],
      exists: false,
      hasESFTBase: false,
      isGlowing: false
    });

    setSharedPtrs([]);
    setWeakPtr({
      position: [0, -2, 0],
      exists: false,
      expired: false
    });
  };

  const { updateProgress } = useApp();
  
  useEffect(() => {
    updateProgress(18, {
      completed: false,
      timeSpent: 0,
      hintsUsed: 0,
      errors: 0
    });
  }, [updateProgress]);

  const lessonColors = theme.colors.intermediate;

  return (
    <LessonLayout
      title="Lección 18: enable_shared_from_this"
      subtitle="Patrón CRTP para Obtener shared_ptr desde this"
      lessonNumber={18}
      topic="intermediate"
    >
      <VisualizationPanel>
          <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
            <MemoryVisualization 
              state={state} 
              widget={widget}
              sharedPtrs={sharedPtrs}
              weakPtr={weakPtr}
            />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <TheoryPanel>
          <Section>
            <SectionTitle>🔗 enable_shared_from_this</SectionTitle>
<p>CRTP pattern para obtener shared_ptr válido desde this pointer:</p>
            <CodeBlock>{`{[
              'class Widget : public std::enable_shared_from_this<Widget> {',
              'public:',
              '    std::shared_ptr<Widget> getSelf() {',
              '        return shared_from_this();  // ✅ Safe',
              '    }',
              '    ',
              '    void doAsyncWork() {',
              '        auto self = shared_from_this();',
              '        asyncFunction([self](){ ',
              '            // self mantiene objeto vivo',
              '        });',
              '    }',
              '};',
              '',
              '// ✅ Uso correcto',
              'auto widget = std::make_shared<Widget>();',
              'auto self = widget->getSelf();  // use_count = 2',
              '',
              '// ❌ ERROR - objeto no controlado por shared_ptr',
              'Widget* raw = new Widget();',
              'auto self = raw->shared_from_this();  // std::bad_weak_ptr',
            ].join('\n')}`}</CodeBlock>
          </Section>

          <StepIndicator>
            <strong>Paso {state.currentStep}/5:</strong> {
              state.currentStep === 0 ? 'Listo para comenzar' :
              state.currentStep === 1 ? 'Widget raw creado - weak_ptr no inicializado' :
              state.currentStep === 2 ? 'Widget en shared_ptr - weak_ptr inicializado' :
              state.currentStep === 3 ? 'shared_from_this() ejecutado exitosamente' :
              state.currentStep === 4 ? 'Mecanismo weak_ptr interno demostrado' :
              'Consideraciones avanzadas'
            }
          </StepIndicator>

          <InteractiveSection>
          <SectionTitle>🎮 Creación de Objetos</SectionTitle>
            
            <ButtonGroup>
            <Button onClick={createRawWidget} variant="warning">
              1. ❌ new Widget()
            </Button>
            
            <Button onClick={createSharedWidget} variant="success">
              2. ✅ make_shared&lt;Widget&gt;()
            </Button>
          </ButtonGroup>
          </InteractiveSection>

          <InteractiveSection>
          <SectionTitle>🔄 shared_from_this()</SectionTitle>
<ButtonGroup>
            <Button 
              onClick={callSharedFromThis}
              disabled={!state.widget.exists}
              variant="primary"
            >
              3. shared_from_this()
            </Button>
            
            <Button onClick={demonstrateWrongUsage} variant="danger">
              ❌ Wrong Usage
            </Button>
          </ButtonGroup>
          </InteractiveSection>

          <InteractiveSection>
          <SectionTitle>🔬 Análisis Interno</SectionTitle>
<ButtonGroup>
            <Button onClick={showWeakPtrMechanism}>
              4. Mostrar weak_ptr interno
            </Button>
            
            <Button onClick={demonstrateMultipleInheritance}>
              5. Multiple Inheritance
            </Button>
          </ButtonGroup>
          </InteractiveSection>

          <ErrorPanel show={state.errorState.hasError}>
            <SectionTitle>💥 {state.errorState.errorType}</SectionTitle>
<p>{state.errorState.errorMessage}</p>
            <CodeBlock>{[
              '// Causa del error:',
              'Widget widget;  // Stack object o new Widget()',
              'auto self = widget.shared_from_this();  // BOOM!',
              '',
              '// El weak_ptr interno no fue inicializado porque',
              '// el objeto no fue creado mediante make_shared',
            ].join('\n')}</CodeBlock>
          </ErrorPanel>

          <StatusPanel>
            <SectionTitle>📊 Estado del Widget</SectionTitle>
            <div>Objeto existe: {state.widget.exists ? 'Sí' : 'No'}
          </div>
            <div>Hereda de ESFT: {state.widget.hasESFTBase ? 'Sí' : 'No'}</div>
            <div>weak_ptr inicializado: {state.widget.isInitialized ? 'Sí' : 'No'}</div>
            <div>shared_ptrs externos: {state.widget.externalSharedCount}</div>
            <div>shared_from_this calls: {state.widget.sharedFromThisCount}</div>
            <div>Total use_count: {state.widget.externalSharedCount + state.widget.sharedFromThisCount}</div>
          </StatusPanel>

          <Section>
            <SectionTitle>🏗️ Implementación Interna</SectionTitle>
            <CodeBlock>{`{[
              'template<class T>',
              'class enable_shared_from_this {',
              'private:',
              '    mutable std::weak_ptr<T> weak_this_;',
              '',
              'public:',
              '    std::shared_ptr<T> shared_from_this() {',
              '        std::shared_ptr<T> result(weak_this_);',
              '        if (!result) {',
              '            throw std::bad_weak_ptr();',
              '        }',
              '        return result;',
              '    }',
              '',
              '    // shared_ptr constructor llama a esto',
              '    void _internal_accept_owner(const std::shared_ptr<T>& owner) {',
              '        weak_this_ = owner;',
              '    }',
              '};',
            ].join('\n')}`}</CodeBlock>
          </Section>

          <Section>
            <SectionTitle>💡 Casos de Uso Comunes</SectionTitle>
            <ul>
              <li><strong>Async callbacks:</strong> Mantener objeto vivo en lambdas</li>
              <li><strong>Observer pattern:</strong> Subject se registra como observer</li>
              <li><strong>Factory methods:</strong> Objeto retorna shared_ptr de sí mismo</li>
              <li><strong>Self-scheduling:</strong> Objeto programa su propia ejecución</li>
              <li><strong>Circular references:</strong> Romper cycles con weak_ptr</li>
              <li><strong>Thread safety:</strong> Garantizar lifetime en concurrencia</li>
            </ul>
          </Section>

          <Section>
            <SectionTitle>⚠️ Restricciones y Cuidados</SectionTitle>
            <CodeBlock>{`{[
              '// ❌ No llamar en constructor',
              'class Widget : public enable_shared_from_this<Widget> {',
              'public:',
              '    Widget() {',
              '        auto self = shared_from_this();  // BAD_WEAK_PTR',
              '    }',
              '};',
              '',
              '// ❌ Solo una herencia de enable_shared_from_this',
              'class A : public enable_shared_from_this<A> {};',
              'class B : public enable_shared_from_this<B> {};',
              'class C : public A, public B {};  // ERROR - ambiguous',
              '',
              '// ✅ Patrón correcto para factory',
              'class Widget : public enable_shared_from_this<Widget> {',
              'public:',
              '    static std::shared_ptr<Widget> create() {',
              '        return std::shared_ptr<Widget>(new Widget());',
              '    }',
              'private:',
              '    Widget() = default;  // No public constructor',
              '};',
            ].join('\n')}`}</CodeBlock>
          </Section>

          <Button onClick={resetDemo} variant="secondary">
            🔄 Reiniciar Demostración
          </Button>
              </TheoryPanel>
    </LessonLayout>
  );
};

export default Lesson18_EnableSharedFromThis;
