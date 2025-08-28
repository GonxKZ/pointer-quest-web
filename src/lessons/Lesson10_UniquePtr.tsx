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
  Button,
  CodeBlock,
  InteractiveSection,
  theme,
  StatusDisplay,
  ButtonGroup
} from '../design-system';

interface SmartPtrState {
  hasObject: boolean;
  value: number;
  operation: 'none' | 'make_unique' | 'reset' | 'release' | 'get' | 'swap';
  rawPtr: {
    visible: boolean;
    value: number | null;
  };
  message: string;
  swapPartner: {
    hasObject: boolean;
    value: number;
  };
}

interface MemoryBlock {
  id: string;
  value: number;
  owner: 'unique_ptr' | 'unique_ptr2' | 'raw' | null;
  position: [number, number, number];
  isActive: boolean;
}

const SmartPointer: React.FC<{
  position: [number, number, number];
  hasObject: boolean;
  label: string;
  color: string;
}> = ({ position, hasObject, label, color }) => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && hasObject) {
      meshRef.current.rotation.z += 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 0.8, 0.3]} />
        <meshStandardMaterial 
          color={hasObject ? color : '#333333'}
          emissive={hasObject ? color : '#000000'}
          emissiveIntensity={hasObject ? 0.3 : 0}
        />
      </mesh>
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color={hasObject ? color : '#666666'}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

const MemoryBlockComponent: React.FC<{ block: MemoryBlock }> = ({ block }) => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && block.isActive) {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.1);
    }
  });

  const getBlockColor = () => {
    switch (block.owner) {
      case 'unique_ptr': return '#00ff88';
      case 'unique_ptr2': return '#ff8800';
      case 'raw': return '#ff4444';
      default: return '#666666';
    }
  };

  return (
    <group position={block.position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={getBlockColor()}
          emissive={getBlockColor()}
          emissiveIntensity={block.isActive ? 0.4 : 0.1}
          transparent
          opacity={block.owner ? 0.8 : 0.3}
        />
      </mesh>
      <Text
        position={[0, 0, 0.6]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {block.value}
      </Text>
      {block.owner && (
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {block.owner}
        </Text>
      )}
    </group>
  );
};

const OwnershipArrow: React.FC<{
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}> = ({ from, to, color }) => {
  const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const length = direction.length();
  direction.normalize();

  return (
    <group position={from}>
      <mesh rotation={[0, 0, Math.atan2(direction.y, direction.x)]}>
        <cylinderGeometry args={[0.05, 0.05, length, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

const MemoryVisualization: React.FC<{
  state: SmartPtrState;
  memoryBlocks: MemoryBlock[];
}> = ({ state, memoryBlocks }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066cc" />

      <SmartPointer 
        position={[-4, 2, 0]} 
        hasObject={state.hasObject} 
        label="unique_ptr<int>" 
        color="#00ff88"
      />

      <SmartPointer 
        position={[4, 2, 0]} 
        hasObject={state.swapPartner.hasObject} 
        label="unique_ptr2<int>" 
        color="#ff8800"
      />

      {state.rawPtr.visible && (
        <group position={[-4, -2, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.6, 0.2]} />
            <meshStandardMaterial 
              color="#ff4444"
              emissive="#ff4444"
              emissiveIntensity={0.2}
            />
          </mesh>
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.25}
            color="#ff4444"
            anchorX="center"
            anchorY="middle"
          >
            int* raw = {state.rawPtr.value !== null ? state.rawPtr.value : 'nullptr'}
          </Text>
        </group>
      )}

      {memoryBlocks.map(block => (
        <MemoryBlockComponent key={block.id} block={block} />
      ))}

      {state.hasObject && memoryBlocks.find(b => b.owner === 'unique_ptr') && (
        <OwnershipArrow 
          from={[-4, 2, 0]} 
          to={memoryBlocks.find(b => b.owner === 'unique_ptr')!.position} 
          color="#00ff88"
        />
      )}

      {state.swapPartner.hasObject && memoryBlocks.find(b => b.owner === 'unique_ptr2') && (
        <OwnershipArrow 
          from={[4, 2, 0]} 
          to={memoryBlocks.find(b => b.owner === 'unique_ptr2')!.position} 
          color="#ff8800"
        />
      )}

      <Text
        position={[0, -4, 0]}
        fontSize={0.4}
        color="#66ccff"
        anchorX="center"
        anchorY="middle"
      >
        {state.message}
      </Text>
    </group>
  );
};

const StatusIndicator: React.FC<{
  children: React.ReactNode;
  type: 'success' | 'warning' | 'info';
}> = ({ children, type }) => {
  const colorMap = {
    success: { bg: 'rgba(76, 175, 80, 0.1)', border: '#4caf50', color: '#4caf50' },
    warning: { bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', color: '#ff9800' },
    info: { bg: 'rgba(33, 150, 243, 0.1)', border: '#2196f3', color: '#2196f3' }
  };
  const styles = colorMap[type];

  return (
    <div style={{
      background: styles.bg,
      border: `1px solid ${styles.border}`,
      borderRadius: '8px',
      padding: '1rem',
      margin: '1rem 0',
      color: styles.color,
      fontWeight: 'bold'
    }}>
      {children}
    </div>
  );
};

export default function Lesson10_UniquePtr() {
  const { state: appState } = useApp();
  
  const [state, setState] = useState<SmartPtrState>({
    hasObject: false,
    value: 0,
    operation: 'none',
    rawPtr: { visible: false, value: null },
    message: 'std::unique_ptr<int> vacío - propiedad exclusiva garantizada',
    swapPartner: { hasObject: false, value: 0 }
  });

  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Crear unique_ptr con make_unique<int>(42)",
    "Observar ownership exclusivo y RAII automático",
    "Explorar operaciones: reset(), release(), get()",
    "Demostrar transferencia segura con move semantics"
  ];

  const createMemoryBlock = (value: number, owner: 'unique_ptr' | 'unique_ptr2' | 'raw', position: [number, number, number]): MemoryBlock => ({
    id: `block_${Date.now()}_${Math.random()}`,
    value,
    owner,
    position,
    isActive: true
  });

  const demonstrateMakeUnique = () => {
    setState(prev => ({
      ...prev,
      operation: 'make_unique',
      hasObject: true,
      value: 42,
      message: 'auto ptr = std::make_unique<int>(42) - asignación segura en heap'
    }));

    const newBlock = createMemoryBlock(42, 'unique_ptr', [0, 0, 0]);
    setMemoryBlocks([newBlock]);
  };

  const demonstrateReset = () => {
    if (!state.hasObject) {
      setState(prev => ({
        ...prev,
        message: '⚠️ unique_ptr está vacío, no hay nada que resetear'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'reset',
      hasObject: false,
      value: 0,
      message: 'ptr.reset() - destructor llamado automáticamente, memoria liberada'
    }));

    setMemoryBlocks(prev => prev.map(block => 
      block.owner === 'unique_ptr' ? { ...block, owner: null, isActive: false } : block
    ));

    setTimeout(() => {
      setMemoryBlocks(prev => prev.filter(block => block.owner !== null));
    }, 2000);
  };

  const demonstrateResetWithValue = () => {
    setState(prev => ({
      ...prev,
      operation: 'reset',
      hasObject: true,
      value: 99,
      message: 'ptr.reset(new int(99)) - destruye objeto anterior y asigna nuevo'
    }));

    setMemoryBlocks(prev => {
      const filtered = prev.filter(block => block.owner !== 'unique_ptr');
      const newBlock = createMemoryBlock(99, 'unique_ptr', [0, 0, 0]);
      return [...filtered, newBlock];
    });
  };

  const demonstrateRelease = () => {
    if (!state.hasObject) {
      setState(prev => ({
        ...prev,
        message: '⚠️ unique_ptr está vacío, no se puede liberar ownership'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'release',
      hasObject: false,
      rawPtr: { visible: true, value: prev.value },
      message: '⚠️ int* raw = ptr.release() - transfiere ownership a puntero crudo'
    }));

    setMemoryBlocks(prev => prev.map(block => 
      block.owner === 'unique_ptr' ? { ...block, owner: 'raw' } : block
    ));
  };

  const demonstrateGet = () => {
    if (!state.hasObject) {
      setState(prev => ({
        ...prev,
        message: 'ptr.get() retorna nullptr - no hay objeto'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      operation: 'get',
      message: `ptr.get() = 0x${Math.floor(Math.random() * 0xFFFFFF).toString(16)} - acceso sin transferir ownership`
    }));
  };

  const demonstrateSwap = () => {
    setState(prev => ({
      ...prev,
      operation: 'swap',
      hasObject: !prev.hasObject && prev.swapPartner.hasObject,
      swapPartner: { 
        hasObject: prev.hasObject, 
        value: prev.hasObject ? prev.value : 0 
      },
      value: prev.swapPartner.hasObject ? prev.swapPartner.value : 0,
      message: 'ptr.swap(ptr2) - intercambio atómico de ownership'
    }));

    setMemoryBlocks(prev => prev.map(block => {
      if (block.owner === 'unique_ptr') return { ...block, owner: 'unique_ptr2' };
      if (block.owner === 'unique_ptr2') return { ...block, owner: 'unique_ptr' };
      return block;
    }));
  };

  const createSecondPtr = () => {
    setState(prev => ({
      ...prev,
      swapPartner: { hasObject: true, value: 77 },
      message: 'auto ptr2 = std::make_unique<int>(77) - segundo unique_ptr creado'
    }));

    const newBlock = createMemoryBlock(77, 'unique_ptr2', [2, 0, 0]);
    setMemoryBlocks(prev => [...prev, newBlock]);
  };

  const resetScene = () => {
    setState({
      hasObject: false,
      value: 0,
      operation: 'none',
      rawPtr: { visible: false, value: null },
      message: 'Escena reiniciada - todos los unique_ptr destruidos automáticamente',
      swapPartner: { hasObject: false, value: 0 }
    });
    setMemoryBlocks([]);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const cppCode = `#include <iostream>
#include <memory>

int main() {
    // ✅ Creación segura con make_unique
    auto ptr = std::make_unique<int>(42);
    std::cout << "Valor: " << *ptr << std::endl;
    
    // Operaciones fundamentales
    ptr.reset();                    // Destruye objeto
    ptr.reset(new int(99));        // Reemplaza objeto
    int* raw = ptr.release();      // ⚠️ Transfiere ownership
    int* observer = ptr.get();     // Acceso sin transferir
    
    // Move semantics (C++11)
    auto ptr2 = std::move(ptr);    // Transferencia de ownership
    
    // ptr ahora es nullptr, ptr2 posee el objeto
    assert(ptr == nullptr);
    assert(ptr2 != nullptr);
    
    return 0;
    // Destrucción automática al salir del scope
}`;

  const raiiAdvantagesCode = `// VENTAJAS DE UNIQUE_PTR VS RAW POINTERS:

// ❌ Raw pointers - propensos a errores
int* create_legacy() {
    int* ptr = new int(42);
    // Si hay excepción aquí, leak garantizado
    some_risky_operation();
    return ptr; // Caller debe recordar delete
}

// ✅ unique_ptr - exception safe + RAII
std::unique_ptr<int> create_modern() {
    auto ptr = std::make_unique<int>(42);
    // Si hay excepción aquí, destrucción automática
    some_risky_operation();
    return ptr; // Transferencia limpia de ownership
}

// BENEFICIOS CLAVE:
// 1. Exception Safety - sin leaks en casos de error
// 2. Automatic Cleanup - destructor garantizado
// 3. Move Semantics - transferencia eficiente
// 4. No Double Delete - único owner por diseño
// 5. Clear Ownership - semánticas explícitas`;

  const bestPracticesCode = `// MEJORES PRÁCTICAS CON UNIQUE_PTR:

// ✅ HACER: Usar make_unique
auto ptr = std::make_unique<Widget>(args);

// ❌ EVITAR: new directo (no exception safe)
std::unique_ptr<Widget> ptr(new Widget(args));

// ✅ HACER: Move para transferir
auto ptr2 = std::move(ptr);

// ❌ EVITAR: Copiar (no compila)
// auto ptr3 = ptr2; // ERROR: no copy constructor

// ✅ HACER: Pasar por referencia para observar
void use_widget(const Widget& w);
use_widget(*ptr);

// ✅ HACER: Pasar por puntero para ownership opcional
void maybe_adopt(std::unique_ptr<Widget> w);
maybe_adopt(std::move(ptr));

// ✅ HACER: Retornar por valor (RVO)
std::unique_ptr<Widget> factory() {
    return std::make_unique<Widget>();
}`;

  return (
    <LessonLayout
      title="Tarea 10: std::unique_ptr - Introducción a Smart Pointers"
      difficulty="Básico"
      topic="basic"
      estimatedTime={25}
    >
      <TheoryPanel>
        <Section>
          <SectionTitle>🚀 std::unique_ptr&lt;T&gt;</SectionTitle>
<p>
            <strong>std::unique_ptr</strong> es el primer smart pointer que todo desarrollador C++ 
            debe dominar. Garantiza ownership exclusivo de un recurso y destrucción automática 
            usando RAII (Resource Acquisition Is Initialization).
          </p>
          
          <h4 style={{ color: theme.colors.accent, marginTop: '1rem' }}>Características Principales:</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Unique Ownership:</strong> Solo un unique_ptr puede poseer un objeto</li>
            <li><strong>RAII:</strong> Destrucción automática al salir del scope</li>
            <li><strong>Move-only:</strong> No copiable, solo transferible</li>
            <li><strong>Exception Safe:</strong> Sin memory leaks en casos de error</li>
            <li><strong>Zero Overhead:</strong> Sin costo en runtime vs raw pointer</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 Código de Ejemplo</SectionTitle>
          <CodeBlock>{cppCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Demostración Interactiva</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <InteractiveSection>
            <ButtonGroup>
              <Button 
                onClick={demonstrateMakeUnique} 
                variant="primary"
                annotation="Creación segura exception-safe"
              >
                make_unique&lt;int&gt;(42)
              </Button>
              
              <Button 
                onClick={demonstrateReset} 
                disabled={!state.hasObject}
                variant="danger"
                annotation="Destrucción explícita"
              >
                reset()
              </Button>
              
              <Button 
                onClick={demonstrateResetWithValue}
                variant="secondary"
                annotation="Reemplazar objeto"
              >
                reset(new int(99))
              </Button>
            </ButtonGroup>
          </InteractiveSection>

          <InteractiveSection>
            <ButtonGroup>
              <Button 
                onClick={demonstrateRelease} 
                disabled={!state.hasObject}
                variant="warning"
                annotation="⚠️ Transferir a raw pointer"
              >
                release()
              </Button>
              
              <Button 
                onClick={demonstrateGet}
                disabled={!state.hasObject}
                variant="secondary"
                annotation="Observar sin transferir"
              >
                get()
              </Button>
            </ButtonGroup>
          </InteractiveSection>

          <InteractiveSection>
            <h4 style={{ color: theme.colors.accent }}>🔄 Operaciones de Intercambio</h4>
            <ButtonGroup>
              <Button 
                onClick={createSecondPtr}
                annotation="Crear segundo unique_ptr"
              >
                Crear ptr2
              </Button>
              
              <Button 
                onClick={demonstrateSwap}
                disabled={!state.hasObject && !state.swapPartner.hasObject}
                annotation="Intercambio atómico O(1)"
              >
                swap(ptr, ptr2)
              </Button>

              <Button onClick={nextStep} variant="success">
                Siguiente Paso
              </Button>
              
              <Button onClick={resetScene} variant="secondary">
                🔄 Reset
              </Button>
            </ButtonGroup>
          </InteractiveSection>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0',
            border: '1px solid #333'
          }}>
            <h4>📊 Estado Actual</h4>
            <div>unique_ptr: {state.hasObject ? `valor ${state.value}` : 'vacío'}
          </div>
            <div>unique_ptr2: {state.swapPartner.hasObject ? `valor ${state.swapPartner.value}` : 'vacío'}</div>
            <div>Operación: {state.operation}</div>
            {state.rawPtr.visible && (
              <div style={{ color: '#ff6666' }}>
                ⚠️ Raw pointer activo: {state.rawPtr.value} (requiere delete manual)
              </div>
            )}
          </div>

          {state.rawPtr.visible && (
            <StatusIndicator type="warning">
              ⚠️ OWNERSHIP TRANSFERIDO A RAW POINTER<br/>
              El objeto ahora requiere delete manual.<br/>
              unique_ptr ya no gestiona la memoria.
            </StatusIndicator>
          )}

          {state.operation === 'make_unique' && (
            <StatusIndicator type="success">
              ✅ RAII ACTIVADO<br/>
              Objeto creado en heap con destrucción automática.<br/>
              Exception safe y sin memory leaks.
            </StatusIndicator>
          )}
        </Section>

        <Section>
          <SectionTitle>⚡ RAII vs Raw Pointers</SectionTitle>
<CodeBlock>{raiiAdvantagesCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎯 Mejores Prácticas</SectionTitle>
          <CodeBlock>{bestPracticesCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>📚 Puntos Clave para Recordar</SectionTitle>
          <div style={{
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <ul style={{ lineHeight: '1.8', margin: 0 }}>
              <li><strong>make_unique:</strong> Siempre preferir sobre new directo</li>
              <li><strong>Move semantics:</strong> std::move() para transferir ownership</li>
              <li><strong>No copiar:</strong> unique_ptr es move-only por diseño</li>
              <li><strong>RAII garantizado:</strong> Destrucción automática en todas las rutas</li>
              <li><strong>Exception safe:</strong> Sin leaks incluso con excepciones</li>
              <li><strong>Performance:</strong> Zero overhead vs raw pointers</li>
              <li><strong>API limpia:</strong> Operaciones explícitas y seguras</li>
            </ul>
          </div>
        </Section>

        <Section>
          <SectionTitle>🔗 Transición a Smart Pointers</SectionTitle>
<p>
            Esta lección marca la <strong>transición crucial</strong> de raw pointers a smart pointers. 
            unique_ptr es la base para entender shared_ptr, weak_ptr y toda la gestión moderna 
            de memoria en C++.
          </p>
          <p style={{ color: theme.colors.accent, fontWeight: 'bold' }}>
            🎯 Próximas lecciones explorarán arrays con unique_ptr, move semantics 
            avanzados y custom deleters.
          </p>
        </Section>
      </TheoryPanel>

      <VisualizationPanel>
        <StatusDisplay style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white',
          zIndex: 100,
          fontFamily: 'monospace'
        }}>
          <div>🎯 Tarea 10: std::unique_ptr
          </div>
          <div>📍 Paso: {currentStep + 1}/{steps.length}</div>
          <div>🔗 Operación: {state.operation}</div>
          <div>📦 Objeto: {state.hasObject ? 'existe' : 'vacío'}</div>
          <div>🎪 Valor: {state.hasObject ? state.value : 'N/A'}</div>
          <div>🔄 Swap Partner: {state.swapPartner.hasObject ? 'activo' : 'vacío'}</div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
          <MemoryVisualization state={state} memoryBlocks={memoryBlocks} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Canvas>
      </VisualizationPanel>
    </LessonLayout>
  );
}
