import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { THREE } from '../utils/three';

const LessonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  gap: 1rem;
  padding: 1rem;
`;

const TheoryPanel = styled.div`
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  overflow-y: auto;
  backdrop-filter: blur(10px);
`;

const VisualizationPanel = styled.div`
  background: rgba(22, 33, 62, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  color: #00d4ff;
  font-size: 2rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px #00d4ff;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(0, 212, 255, 0.05);
  border-left: 3px solid #00d4ff;
  border-radius: 5px;
`;

const SectionTitle = styled.h3`
  color: #4ecdc4;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 8px;
  color: #f8f8f2;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Interactive = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1rem 0;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'warning' | 'success' }>`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: linear-gradient(45deg, #ff6b6b, #ff5252);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); }
        `;
      case 'warning':
        return `
          background: linear-gradient(45deg, #ffca28, #ffa000);
          color: #1a1a2e;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(255, 202, 40, 0.4); }
        `;
      case 'success':
        return `
          background: linear-gradient(45deg, #4caf50, #45a049);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4); }
        `;
      default:
        return `
          background: linear-gradient(45deg, #00d4ff, #4ecdc4);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4); }
        `;
    }
  }}
  
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  `}
`;

const OwnershipBadge = styled.div<{ owner: 'none' | 'raw' | 'deleted' }>`
  background: ${props => {
    switch (props.owner) {
      case 'raw': return 'linear-gradient(45deg, #ff6b6b, #ff5252)';
      case 'deleted': return 'linear-gradient(45deg, #666, #444)';
      default: return 'transparent';
    }
  }};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  margin: 0.5rem 0;
  display: inline-block;
  border: 2px solid ${props => {
    switch (props.owner) {
      case 'raw': return '#ff6b6b';
      case 'deleted': return '#666';
      default: return 'transparent';
    }
  }};
`;

const DebtWarning = styled.div`
  background: rgba(255, 202, 40, 0.1);
  border: 2px solid #ffca28;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #ffca28;
  font-weight: bold;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;

const StatusDisplay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 8px;
  color: white;
  z-index: 100;
  font-family: monospace;
`;

interface HeapState {
  danglingPtr: number | null;
  heapBlock: {
    exists: boolean;
    value: number;
    address: number;
    owner: 'none' | 'raw' | 'deleted';
  };
  needsDelete: boolean;
  status: 'initial' | 'allocated' | 'valid_access' | 'needs_cleanup';
  message: string;
}

function HeapBlock({ position, size, color, value, owner, address, visible = true }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  value: number;
  owner: 'none' | 'raw' | 'deleted';
  address: number;
  visible?: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && visible) {
      // Glow effect para heap blocks
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  if (!visible) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9}
          metalness={0.3}
          roughness={0.1}
        />
      </mesh>
      
      {/* Ownership label */}
      <Text
        position={[0, size[1] / 2 + 0.8, 0]}
        fontSize={0.25}
        color={owner === 'raw' ? '#ff6b6b' : owner === 'deleted' ? '#666' : '#4ecdc4'}
        anchorX="center"
        anchorY="middle"
      >
        propietario: {owner}
      </Text>
      
      {/* Value */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
      
      {/* Address */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.2}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        0x{address.toString(16)}
      </Text>
      
      {/* Memory region label */}
      <Text
        position={[0, -size[1] / 2 - 0.5, 0]}
        fontSize={0.3}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        HEAP
      </Text>
    </group>
  );
}

function StackBlock({ position, size, color, label, value, type }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  label: string;
  value?: string;
  type: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      
      <Text
        position={[0, size[1] / 2 + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      {value && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
        >
          {value}
        </Text>
      )}
      
      <Text
        position={[0, -size[1] / 2 - 0.3, 0]}
        fontSize={0.2}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        {type}
      </Text>
    </group>
  );
}

function PointerArrow({ start, end, color = "#00d4ff" }: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
}) {
  const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
  const length = direction.length();
  direction.normalize();

  const arrowHelper = new THREE.ArrowHelper(direction, new THREE.Vector3(...start), length, color, length * 0.2, length * 0.1);

  return <primitive object={arrowHelper} />;
}

function MemoryRegionLabel({ position, text, color }: {
  position: [number, number, number];
  text: string;
  color: string;
}) {
  return (
    <Text
      position={position}
      fontSize={0.6}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

function Lesson04Scene({ state }: { state: HeapState }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, 5]} intensity={0.5} color="#4ecdc4" />
      
      {/* Memory region labels */}
      <MemoryRegionLabel position={[-3, 2.5, 0]} text="STACK" color="#00d4ff" />
      <MemoryRegionLabel position={[3, 2.5, 0]} text="HEAP" color="#ff6b6b" />
      
      {/* Dividing line between stack and heap */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 4, 0.1]} />
          <meshStandardMaterial color="#4ecdc4" transparent opacity={0.5} />
        </mesh>
      </group>
      
      {/* Stack pointer variable */}
      <StackBlock
        position={[-3, 0, 0]}
        size={[1.5, 1, 0.5]}
        color={state.danglingPtr ? "#ff6b6b" : "#666"}
        label="int* d"
        value={state.danglingPtr ? `0x${state.danglingPtr.toString(16)}` : "nullptr"}
        type="stack"
      />
      
      {/* Heap block */}
      {state.heapBlock.exists && (
        <HeapBlock
          position={[3, 0, 0]}
          size={[1.5, 1.2, 0.5]}
          color={state.heapBlock.owner === 'deleted' ? "#666" : "#ff6b6b"}
          value={state.heapBlock.value}
          owner={state.heapBlock.owner}
          address={state.heapBlock.address}
        />
      )}
      
      {/* Arrow from pointer to heap block */}
      {state.danglingPtr && state.heapBlock.exists && (
        <PointerArrow
          start={[-2.2, 0, 0]}
          end={[2.2, 0, 0]}
          color={state.heapBlock.owner === 'deleted' ? "#666" : "#ff6b6b"}
        />
      )}
      
      <Html position={[0, -3, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          minWidth: '500px',
          border: state.needsDelete ? '2px solid #ffca28' : '1px solid #00d4ff'
        }}>
          <h4 style={{ 
            color: state.needsDelete ? '#ffca28' : '#00d4ff', 
            margin: '0 0 0.5rem 0' 
          }}>
            Heap Allocation y Ownership
          </h4>
          <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            d: {state.danglingPtr ? `0x${state.danglingPtr.toString(16)}` : 'nullptr'} | 
            Heap: {state.heapBlock.exists ? `${state.heapBlock.value} (owner: ${state.heapBlock.owner})` : 'vacío'}
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: state.needsDelete ? '#ffca28' : '#4ecdc4',
            fontWeight: 'bold'
          }}>
            {state.message}
          </p>
        </div>
      </Html>
    </>
  );
}

export default function Lesson04_HeapOwnership() {
  const { dispatch } = useApp();
  
  const [state, setState] = useState<HeapState>({
    danglingPtr: null,
    heapBlock: {
      exists: false,
      value: 0,
      address: 0,
      owner: 'none'
    },
    needsDelete: false,
    status: 'initial',
    message: 'Declara int* d. Listo para asignar memoria del heap.'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Declara int* d = nullptr",
    "Ejecuta d = new int(42) - aloca en el heap",
    "Observa el bloque con 'propietario: raw'",
    "Ahora d posee la memoria y debe hacer delete"
  ];

  const allocateHeap = () => {
    const newAddress = 0x2000000 + Math.floor(Math.random() * 0x1000);
    
    setState(prev => ({
      ...prev,
      danglingPtr: newAddress,
      heapBlock: {
        exists: true,
        value: 42,
        address: newAddress,
        owner: 'raw'
      },
      needsDelete: true,
      status: 'allocated',
      message: '✅ new int(42) exitoso. Bloque creado en heap con propietario: raw'
    }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        status: 'needs_cleanup',
        message: '⚠️ DEUDA DE DELETE: d posee memoria que debe liberar manualmente'
      }));
    }, 2000);
  };

  const accessValue = () => {
    if (state.heapBlock.exists && state.heapBlock.owner === 'raw') {
      setState(prev => ({
        ...prev,
        status: 'valid_access',
        message: `✅ *d = ${state.heapBlock.value} - Acceso válido a memoria del heap`
      }));
      
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          status: 'needs_cleanup',
          message: '⚠️ Recuerda: delete d; para evitar memory leak'
        }));
      }, 2000);
    }
  };

  const reset = () => {
    setState({
      danglingPtr: null,
      heapBlock: {
        exists: false,
        value: 0,
        address: 0,
        owner: 'none'
      },
      needsDelete: false,
      status: 'initial',
      message: 'Declara int* d. Listo para asignar memoria del heap.'
    });
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const cppCode = `#include <iostream>

int main() {
    // Puntero en el stack (automático)
    int* d = nullptr;
    
    // Asignación dinámica en el HEAP
    d = new int(42);  // Operador new crea objeto en heap
    
    std::cout << "Valor en heap: " << *d << std::endl;
    std::cout << "Dirección: " << d << std::endl;
    
    // IMPORTANTE: Ahora d "posee" esta memoria
    // Tenemos la RESPONSABILIDAD de liberarla
    
    // TODO: delete d;  // ¡Deuda pendiente!
    
    return 0;
    // Memory leak: no hicimos delete
}`;

  const heapVsStackCode = `// STACK (automático)
{
    int stack_var = 42;  // Se destruye al salir del scope
}  // Limpieza automática

// HEAP (manual)
{
    int* heap_ptr = new int(42);  // Programador controla la vida
    // ... usar heap_ptr ...
    delete heap_ptr;  // OBLIGATORIO: limpieza manual
}

// Diferencias clave:
// Stack: rápido, tamaño limitado, limpieza automática
// Heap: más lento, tamaño grande, control manual`;

  const ownershipRulesCode = `// Reglas de ownership con raw pointers:

1. Quien hace 'new' debe hacer 'delete'
2. Solo un delete por cada new
3. No usar puntero después de delete
4. new[] requiere delete[] (no delete)

// Ejemplo de ownership claro:
std::unique_ptr<int> smart_ptr = std::make_unique<int>(42);
// Ownership automático: no necesita delete manual`;

  return (
    <LessonContainer>
      <TheoryPanel>
        <Title>Tarea 4: new int(42) y Heap Ownership</Title>
        
        <Section>
          <SectionTitle>🏗️ Dynamic Allocation - El Heap</SectionTitle>
          <p>
            El operador <strong>new</strong> asigna memoria en el <strong>heap</strong> y retorna un puntero.
            A diferencia de las variables automáticas (stack), la memoria del heap NO se libera automáticamente.
          </p>
          
          <h4 style={{ color: '#ff6b6b', marginTop: '1rem' }}>Conceptos Clave:</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>new int(42):</strong> Crea int con valor 42 en el heap</li>
            <li><strong>Ownership:</strong> El puntero devuelto "posee" la memoria</li>
            <li><strong>Responsabilidad:</strong> Quien hace new debe hacer delete</li>
            <li><strong>Memory leak:</strong> Olvido de delete causa acumulación de memoria</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 Código de Ejemplo</SectionTitle>
          <CodeBlock>{cppCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Simulación de Ownership</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <OwnershipBadge owner={state.heapBlock.owner}>
            {state.heapBlock.owner === 'none' ? 'Sin ownership' : 
             state.heapBlock.owner === 'raw' ? 'RAW POINTER OWNERSHIP' : 
             'Memory deleted'}
          </OwnershipBadge>
          
          <Interactive>
            <Button 
              onClick={allocateHeap} 
              variant="danger"
              disabled={state.heapBlock.exists}
            >
              d = new int(42)
            </Button>
            <Button 
              onClick={accessValue} 
              disabled={!state.heapBlock.exists || state.heapBlock.owner !== 'raw'}
            >
              Acceder *d
            </Button>
            <Button onClick={nextStep} variant="warning">
              Siguiente Paso
            </Button>
            <Button onClick={reset}>
              Reset
            </Button>
          </Interactive>

          {state.needsDelete && (
            <DebtWarning>
              ⚠️ DEUDA DE DELETE PENDIENTE<br/>
              La memoria asignada con new int(42) debe ser liberada con delete d;<br/>
              Sin delete: MEMORY LEAK garantizado.
            </DebtWarning>
          )}
        </Section>

        <Section>
          <SectionTitle>📊 Stack vs Heap</SectionTitle>
          <CodeBlock
            language="cpp"
            title="Comparación Stack vs Heap"
            copyable={true}
            showLineNumbers={true}
            highlightLines={[2, 6, 9, 12]}
          >
            {heapVsStackCode}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🔒 Reglas de Ownership</SectionTitle>
          <CodeBlock
            language="cpp"
            title="Reglas de Ownership para Raw Pointers"
            copyable={true}
            showLineNumbers={true}
            highlightLines={[11]}
          >
            {ownershipRulesCode}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🚨 Problemas Comunes</SectionTitle>
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{ color: '#ff6b6b', margin: '0 0 0.5rem 0' }}>Anti-patrones peligrosos:</h4>
            <ul style={{ lineHeight: '1.6', margin: '0' }}>
              <li><strong>Memory leaks:</strong> new sin delete correspondiente</li>
              <li><strong>Double delete:</strong> delete del mismo puntero dos veces</li>
              <li><strong>Use after free:</strong> usar puntero después de delete</li>
              <li><strong>Ownership ambiguo:</strong> no está claro quién debe hacer delete</li>
            </ul>
          </div>
        </Section>

        <Section>
          <SectionTitle>📚 Soluciones Modernas</SectionTitle>
          <p>
            <strong>C++ moderno prefiere RAII:</strong> Resource Acquisition Is Initialization
          </p>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>std::unique_ptr:</strong> Ownership único, delete automático</li>
            <li><strong>std::shared_ptr:</strong> Ownership compartido con reference counting</li>
            <li><strong>std::make_unique:</strong> Forma segura de crear unique_ptr</li>
            <li><strong>Containers:</strong> std::vector, std::string manejan memoria automáticamente</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>🎯 Próxima Lección</SectionTitle>
          <p>
            En la siguiente lección veremos qué pasa cuando haces <code>delete d</code> y 
            los peligros del <strong>double delete</strong>.
          </p>
        </Section>
      </TheoryPanel>

      <VisualizationPanel>
        <StatusDisplay>
          <div>🎯 Tarea 4: Heap Ownership</div>
          <div>📍 Paso: {currentStep + 1}/{steps.length}</div>
          <div>🔗 Estado: {state.status}</div>
          <div>💾 Heap: {state.heapBlock.exists ? 'ALLOCATED' : 'EMPTY'}</div>
          <div>⚠️ Deuda: {state.needsDelete ? 'DELETE PENDIENTE' : 'NONE'}</div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
          <Lesson04Scene state={state} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
          />
        </Canvas>
      </VisualizationPanel>
    </LessonContainer>
  );
}