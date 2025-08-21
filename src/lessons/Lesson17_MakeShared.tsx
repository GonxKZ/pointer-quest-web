import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface AllocationState {
  method: 'none' | 'make_shared' | 'shared_ptr_new';
  allocations: Array<{
    id: string;
    type: 'object' | 'control_block' | 'combined';
    position: [number, number, number];
    size: number;
    color: string;
    isActive: boolean;
  }>;
  performance: {
    allocCount: number;
    totalSize: number;
    fragmentation: number;
    cacheLocality: 'excellent' | 'poor';
  };
  exceptionSafety: 'safe' | 'unsafe' | 'not_tested';
  message: string;
  timingResults: {
    makeSharedTime: number;
    sharedPtrNewTime: number;
    showComparison: boolean;
  };
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

const PerformancePanel = styled.div`
  background: rgba(0, 150, 0, 0.1);
  border: 1px solid #00aa00;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
`;

const ExceptionPanel = styled.div<{ safe: boolean }>`
  background: ${props => props.safe ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
  border: 1px solid ${props => props.safe ? '#00ff00' : '#ff0000'};
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
`;

const TimingComparison = styled.div`
  background: rgba(100, 0, 100, 0.1);
  border: 1px solid #aa00aa;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
`;

const MemoryVisualization: React.FC<{
  state: AllocationState;
}> = ({ state }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const AllocationBlock = ({ allocation }: { allocation: any }) => {
    const meshRef = useRef<Mesh>(null);
    
    useFrame(() => {
      if (meshRef.current && allocation.isActive) {
        meshRef.current.rotation.z += 0.02;
        const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    });

    const getGeometry = () => {
      switch (allocation.type) {
        case 'object':
          return <boxGeometry args={[1.2, 1.2, 1.2]} />;
        case 'control_block':
          return <cylinderGeometry args={[0.8, 0.8, 0.6, 8]} />;
        case 'combined':
          return <boxGeometry args={[2.5, 1.5, 1]} />;
        default:
          return <boxGeometry args={[1, 1, 1]} />;
      }
    };

    return (
      <group position={allocation.position}>
        <mesh ref={meshRef}>
          {getGeometry()}
          <meshStandardMaterial 
            color={allocation.color}
            emissive={allocation.color}
            emissiveIntensity={allocation.isActive ? 0.4 : 0.1}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.25}
          color={allocation.color}
          anchorX="center"
          anchorY="middle"
        >
          {allocation.type.replace('_', ' ')}
        </Text>

        <Text
          position={[0, -1.8, 0]}
          fontSize={0.2}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          {allocation.size} bytes
        </Text>

        {allocation.type === 'combined' && (
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.2}
            color="#00ff88"
            anchorX="center"
            anchorY="middle"
          >
            ✨ Single Allocation
          </Text>
        )}
      </group>
    );
  };

  const PerformanceIndicator = () => {
    const fragmentationLevel = state.performance.fragmentation;
    const color = fragmentationLevel < 0.3 ? '#00ff88' : 
                  fragmentationLevel < 0.7 ? '#ffaa00' : '#ff4444';

    return (
      <group position={[0, -3, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          Cache Locality: {state.performance.cacheLocality.toUpperCase()}
        </Text>
        
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.3}
          color="#66ccff"
          anchorX="center"
          anchorY="middle"
        >
          Allocations: {state.performance.allocCount}
        </Text>
      </group>
    );
  };

  const ExceptionSafetyIndicator = () => {
    if (state.exceptionSafety === 'not_tested') return null;

    const color = state.exceptionSafety === 'safe' ? '#00ff88' : '#ff4444';
    const icon = state.exceptionSafety === 'safe' ? '🛡️' : '⚠️';

    return (
      <group position={[0, 3, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {icon} Exception Safety: {state.exceptionSafety.toUpperCase()}
        </Text>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066cc" />

      {state.allocations.map(allocation => (
        <AllocationBlock key={allocation.id} allocation={allocation} />
      ))}

      <PerformanceIndicator />
      <ExceptionSafetyIndicator />

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

export const Lesson17_MakeShared: React.FC = () => {
  const [state, setState] = useState<AllocationState>({
    method: 'none',
    allocations: [],
    performance: {
      allocCount: 0,
      totalSize: 0,
      fragmentation: 0,
      cacheLocality: 'excellent'
    },
    exceptionSafety: 'not_tested',
    message: 'make_shared vs shared_ptr(new T) - optimización y seguridad',
    timingResults: {
      makeSharedTime: 0,
      sharedPtrNewTime: 0,
      showComparison: false
    },
    currentStep: 0
  });

  const demonstrateMakeShared = () => {
    setState(prev => ({
      ...prev,
      method: 'make_shared',
      allocations: [{
        id: 'combined',
        type: 'combined',
        position: [0, 0, 0],
        size: 24, // object + control block together
        color: '#00ff88',
        isActive: true
      }],
      performance: {
        allocCount: 1,
        totalSize: 24,
        fragmentation: 0,
        cacheLocality: 'excellent'
      },
      exceptionSafety: 'safe',
      message: 'auto ptr = std::make_shared<int>(42) - 1 allocation, exception-safe',
      currentStep: 1
    }));
  };

  const demonstrateSharedPtrNew = () => {
    setState(prev => ({
      ...prev,
      method: 'shared_ptr_new',
      allocations: [
        {
          id: 'object',
          type: 'object',
          position: [-2, 0, 0],
          size: 4, // int object
          color: '#ff8800',
          isActive: true
        },
        {
          id: 'control_block',
          type: 'control_block',
          position: [2, 0, 0],
          size: 20, // control block
          color: '#0066cc',
          isActive: true
        }
      ],
      performance: {
        allocCount: 2,
        totalSize: 24,
        fragmentation: 0.5,
        cacheLocality: 'poor'
      },
      exceptionSafety: 'unsafe',
      message: 'auto ptr = std::shared_ptr<int>(new int(42)) - 2 allocations, exception unsafe',
      currentStep: 2
    }));
  };

  const simulateExceptionBetweenAllocations = () => {
    setState(prev => ({
      ...prev,
      message: '💥 Excepción entre new int(42) y construcción de shared_ptr = MEMORY LEAK',
      exceptionSafety: 'unsafe',
      allocations: prev.allocations.map(alloc => 
        alloc.type === 'object' ? { ...alloc, color: '#ff4444' } : alloc
      )
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        message: 'make_shared previene este leak - construcción atómica',
        exceptionSafety: 'safe'
      }));
    }, 3000);
  };

  const measurePerformance = () => {
    setState(prev => ({
      ...prev,
      message: 'Midiendo performance...',
    }));

    // Simulate timing measurements
    setTimeout(() => {
      const makeSharedTime = 45 + Math.random() * 10; // Faster
      const sharedPtrNewTime = 78 + Math.random() * 15; // Slower

      setState(prev => ({
        ...prev,
        timingResults: {
          makeSharedTime,
          sharedPtrNewTime,
          showComparison: true
        },
        message: `Performance: make_shared ${makeSharedTime.toFixed(1)}ns vs shared_ptr(new) ${sharedPtrNewTime.toFixed(1)}ns`,
        currentStep: Math.max(prev.currentStep, 3)
      }));
    }, 1500);
  };

  const demonstrateCacheLocality = () => {
    setState(prev => ({
      ...prev,
      message: 'make_shared: objeto y control block contiguos en memoria = mejor cache locality',
      performance: {
        ...prev.performance,
        cacheLocality: prev.method === 'make_shared' ? 'excellent' : 'poor'
      }
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        message: 'shared_ptr(new): objeto y control block separados = cache misses'
      }));
    }, 2000);
  };

  const showWeakPtrConsequence = () => {
    setState(prev => ({
      ...prev,
      message: '⚠️ make_shared mantiene objeto vivo hasta que weak_ptr expiren',
      currentStep: Math.max(prev.currentStep, 4)
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        message: 'Trade-off: mejor performance vs control de lifetime más granular'
      }));
    }, 3000);
  };

  const compareAllocatorSupport = () => {
    setState(prev => ({
      ...prev,
      message: 'shared_ptr(new) permite custom allocators, make_shared tiene limitaciones',
      currentStep: Math.max(prev.currentStep, 5)
    }));
  };

  const resetDemo = () => {
    setState({
      method: 'none',
      allocations: [],
      performance: {
        allocCount: 0,
        totalSize: 0,
        fragmentation: 0,
        cacheLocality: 'excellent'
      },
      exceptionSafety: 'not_tested',
      message: 'Demostración reiniciada - comparar make_shared vs shared_ptr(new)',
      timingResults: {
        makeSharedTime: 0,
        sharedPtrNewTime: 0,
        showComparison: false
      },
      currentStep: 0
    });
  };

  return (
    <Container>
      <Header>
        <Title>Lección 17: std::make_shared</Title>
        <Subtitle>Optimización vs shared_ptr(new T) - Exception Safety y Performance</Subtitle>
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
            <h3>🏗️ make_shared vs shared_ptr(new T)</h3>
            <p>Diferencias fundamentales en allocación y seguridad:</p>
            <CodeBlock>{`// ✅ Recomendado: make_shared
auto ptr1 = std::make_shared<Widget>(args...);
// - 1 allocation (object + control block juntos)
// - Exception safe
// - Mejor cache locality
// - ~15-30% más rápido

// ❌ Menos eficiente: constructor directo
auto ptr2 = std::shared_ptr<Widget>(new Widget(args...));
// - 2 allocations (object separado de control block)  
// - Riesgo de leak si excepción entre new y constructor
// - Peor cache locality
// - Más lento, más fragmentación`}</CodeBlock>
          </TheorySection>

          <div>
            <h4>🎮 Comparación de Métodos</h4>
            
            <Button onClick={demonstrateMakeShared} variant="success">
              ✅ make_shared
            </Button>
            
            <Button onClick={demonstrateSharedPtrNew} variant="warning">
              ⚠️ shared_ptr(new T)
            </Button>
          </div>

          <div>
            <h4>🧪 Análisis de Seguridad</h4>
            
            <Button onClick={simulateExceptionBetweenAllocations} variant="danger">
              💥 Simular Exception
            </Button>
          </div>

          <div>
            <h4>⚡ Performance Testing</h4>
            
            <Button onClick={measurePerformance}>
              📊 Medir Timing
            </Button>
            
            <Button onClick={demonstrateCacheLocality}>
              🧠 Cache Locality
            </Button>
          </div>

          <div>
            <h4>🔬 Consideraciones Avanzadas</h4>
            
            <Button onClick={showWeakPtrConsequence}>
              weak_ptr Lifetime
            </Button>
            
            <Button onClick={compareAllocatorSupport}>
              Custom Allocators
            </Button>
          </div>

          <PerformancePanel>
            <h4>📈 Métricas de Performance</h4>
            <div>Allocaciones: {state.performance.allocCount}</div>
            <div>Tamaño total: {state.performance.totalSize} bytes</div>
            <div>Fragmentación: {(state.performance.fragmentation * 100).toFixed(1)}%</div>
            <div>Cache locality: {state.performance.cacheLocality}</div>
          </PerformancePanel>

          {state.timingResults.showComparison && (
            <TimingComparison>
              <h4>⏱️ Comparación de Timing</h4>
              <div>make_shared: {state.timingResults.makeSharedTime.toFixed(1)}ns</div>
              <div>shared_ptr(new): {state.timingResults.sharedPtrNewTime.toFixed(1)}ns</div>
              <div style={{ color: '#00ff88' }}>
                Mejora: {((state.timingResults.sharedPtrNewTime - state.timingResults.makeSharedTime) / state.timingResults.sharedPtrNewTime * 100).toFixed(1)}%
              </div>
            </TimingComparison>
          )}

          <ExceptionPanel safe={state.exceptionSafety === 'safe'}>
            <h4>🛡️ Exception Safety</h4>
            {state.exceptionSafety === 'safe' ? (
              <div style={{ color: '#00ff88' }}>
                ✅ Exception safe - no memory leaks posibles
              </div>
            ) : state.exceptionSafety === 'unsafe' ? (
              <div style={{ color: '#ff6666' }}>
                ❌ Vulnerable a memory leaks en excepciones
              </div>
            ) : (
              <div style={{ color: '#cccccc' }}>
                ⏳ No evaluado aún
              </div>
            )}
          </ExceptionPanel>

          <TheorySection>
            <h4>🎯 Cuándo Usar Cada Uno</h4>
            <CodeBlock>{`// ✅ Usar make_shared cuando:
- Performance es importante
- No necesitas custom allocator  
- No hay problema con weak_ptr lifetime extension
- Quieres maximum exception safety

// ✅ Usar shared_ptr(new T) cuando:
- Necesitas custom allocator
- Quieres control granular de object vs control block lifetime
- Integrando con C APIs que retornan raw pointers
- Usando array delete o custom deleters`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>⚠️ Desventaja de make_shared</h4>
            <CodeBlock>{`class BigObject { char data[1000000]; };

auto shared = std::make_shared<BigObject>();
std::weak_ptr<BigObject> weak = shared;
shared.reset();  // BigObject destruido...

// PERO: weak_ptr mantiene control block vivo
// Y como object + control block están juntos,
// ¡toda la memoria sigue allocated hasta que weak expire!

// Con shared_ptr(new), object se libera inmediatamente,
// solo control block queda hasta que weak expire`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>📊 Benchmark Real</h4>
            <CodeBlock>{`// Típicos resultados de performance:
make_shared<int>():        ~45ns  (1 allocation)
shared_ptr(new int()):     ~78ns  (2 allocations)
                          
make_shared<Widget>():     ~120ns (construct + alloc)  
shared_ptr(new Widget()):  ~165ns (2 allocs + construct)

// Cache locality mejora dramáticamente con objetos grandes
// que acceden frecuentemente a use_count`}</CodeBlock>
          </TheorySection>

          <Button onClick={resetDemo} variant="secondary">
            🔄 Reiniciar Comparación
          </Button>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};