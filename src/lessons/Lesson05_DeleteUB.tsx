import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
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



















const Button = styled.button<{ variant?: 'primary' | 'danger' | 'warning' | 'success' | 'critical' }>`
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
      case 'critical':
        return `
          background: linear-gradient(45deg, #8B0000, #DC143C);
          color: white;
          border: 2px solid #ff0000;
          animation: pulse 1.5s infinite;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(220, 20, 60, 0.6); }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
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
    animation: none !important;
  `}
`;





interface DeleteState {
  pointer: number | null;
  heapBlock: {
    exists: boolean;
    value: number;
    address: number;
    owner: 'raw' | 'deleted' | 'none';
    collectingAnimation: boolean;
  };
  deleteCount: number;
  executionBlocked: boolean;
  status: 'allocated' | 'first_delete' | 'collecting' | 'freed' | 'double_delete_attempt' | 'critical_ub';
  message: string;
}

function CollectingBlock({ position, size, collecting }: {
  position: [number, number, number];
  size: [number, number, number];
  collecting: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(1);

  useFrame(() => {
    if (meshRef.current && collecting) {
      setScale(prev => Math.max(0, prev - 0.05));
      meshRef.current.rotation.y += 0.3;
      meshRef.current.rotation.x += 0.2;
    }
  });

  if (!collecting || scale <= 0) return null;

  return (
    <mesh ref={meshRef} position={position} scale={[scale, scale, scale]}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color="#666" 
        transparent 
        opacity={scale * 0.8}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function HeapBlock({ position, size, color, value, owner, address, visible = true }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  value: number;
  owner: 'raw' | 'deleted' | 'none';
  address: number;
  visible?: boolean;
}) {
  if (!visible) return null;

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9}
          metalness={0.3}
          roughness={0.1}
        />
      </mesh>
      
      <Text
        position={[0, size[1] / 2 + 0.8, 0]}
        fontSize={0.25}
        color={owner === 'deleted' ? '#666' : '#ff6b6b'}
        anchorX="center"
        anchorY="middle"
      >
        {owner === 'deleted' ? 'FREED' : `owner: ${owner}`}
      </Text>
      
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
      
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.2}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        0x{address.toString(16)}
      </Text>
    </group>
  );
}

function DanglingPointer({ position, isDangling }: {
  position: [number, number, number];
  isDangling: boolean;
}) {
  const arrowRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (arrowRef.current && isDangling) {
      arrowRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      arrowRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  if (!isDangling) return null;

  return (
    <group ref={arrowRef} position={position}>
      <mesh>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#ff0000" transparent opacity={0.8} />
      </mesh>
      
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.25}
        color="#ff0000"
        anchorX="center"
        anchorY="middle"
      >
        DANGLING!
      </Text>
    </group>
  );
}

function PointerArrow({ start, end, color = "#00d4ff", isDangling = false }: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  isDangling?: boolean;
}) {
  if (isDangling) return null;

  const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
  const length = direction.length();
  direction.normalize();

  const arrowHelper = new THREE.ArrowHelper(direction, new THREE.Vector3(...start), length, color, length * 0.2, length * 0.1);

  return <primitive object={arrowHelper} />;
}

function Lesson05Scene({ state }: { state: DeleteState }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, 5]} intensity={0.5} color="#4ecdc4" />
      
      {/* Stack pointer */}
      <group position={[-3, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1, 0.5]} />
          <meshStandardMaterial 
            color={state.pointer && state.heapBlock.owner === 'deleted' ? "#ff0000" : "#00d4ff"} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          int* d
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={0.35}
          color={state.pointer && state.heapBlock.owner === 'deleted' ? "#ff0000" : "#00d4ff"}
          anchorX="center"
          anchorY="middle"
        >
          {state.pointer ? `0x${state.pointer.toString(16)}` : 'nullptr'}
        </Text>
      </group>
      
      {/* Heap block (normal) */}
      {state.heapBlock.exists && !state.heapBlock.collectingAnimation && (
        <HeapBlock
          position={[3, 0, 0]}
          size={[1.5, 1.2, 0.5]}
          color={state.heapBlock.owner === 'deleted' ? "#666" : "#ff6b6b"}
          value={state.heapBlock.value}
          owner={state.heapBlock.owner}
          address={state.heapBlock.address}
        />
      )}
      
      {/* Collecting animation */}
      {state.heapBlock.collectingAnimation && (
        <CollectingBlock
          position={[3, 0, 0]}
          size={[1.5, 1.2, 0.5]}
          collecting={true}
        />
      )}
      
      {/* Arrow (normal or dangling) */}
      {state.pointer && state.heapBlock.exists && !state.heapBlock.collectingAnimation && (
        <PointerArrow
          start={[-2.2, 0, 0]}
          end={[2.2, 0, 0]}
          color={state.heapBlock.owner === 'deleted' ? "#ff0000" : "#00d4ff"}
          isDangling={state.heapBlock.owner === 'deleted'}
        />
      )}
      
      {/* Dangling pointer indicator */}
      {state.pointer && state.heapBlock.owner === 'deleted' && !state.heapBlock.exists && (
        <DanglingPointer
          position={[3, 0, 0]}
          isDangling={true}
        />
      )}
      
      {/* Delete counter */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color={state.deleteCount > 1 ? "#ff0000" : "#4ecdc4"}
        anchorX="center"
        anchorY="middle"
      >
        delete count: {state.deleteCount}
      </Text>
      
      <Html position={[0, -3, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          minWidth: '500px',
          border: state.status === 'critical_ub' ? '2px solid #ff0000' : 
                  state.status === 'double_delete_attempt' ? '2px solid #ffca28' : '1px solid #00d4ff'
        }}>
          <h4 style={{ 
            color: state.status === 'critical_ub' ? '#ff0000' : 
                   state.status === 'double_delete_attempt' ? '#ffca28' : '#00d4ff', 
            margin: '0 0 0.5rem 0' 
          }}>
            Delete Operations y Double Delete UB
          </h4>
          <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            Pointer: {state.pointer ? `0x${state.pointer.toString(16)}` : 'nullptr'} | 
            Heap: {state.heapBlock.exists ? `EXISTS (${state.heapBlock.owner})` : 'FREED'} | 
            Delete Count: {state.deleteCount}
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: state.status === 'critical_ub' ? '#ff0000' : 
                   state.status === 'double_delete_attempt' ? '#ffca28' : '#4ecdc4',
            fontWeight: 'bold'
          }}>
            {state.message}
          </p>
        </div>
      </Html>
    </>
  );
}

export default function Lesson05_DeleteUB() {
  const { state: appState } = useApp();
  
  const [state, setState] = useState<DeleteState>({
    pointer: 0x2000000,
    heapBlock: {
      exists: true,
      value: 42,
      address: 0x2000000,
      owner: 'raw',
      collectingAnimation: false
    },
    deleteCount: 0,
    executionBlocked: false,
    status: 'allocated',
    message: 'Memoria asignada. d posee el bloque del heap.'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Memoria asignada con new int(42)",
    "Ejecuta delete d - recogida del heap",
    "Puntero ahora es dangling",
    "Intenta delete d otra vez - ¡DOUBLE DELETE UB!"
  ];

  const performDelete = () => {
    if (state.deleteCount === 0 && state.heapBlock.exists) {
      // First delete
      setState(prev => ({
        ...prev,
        deleteCount: 1,
        status: 'first_delete',
        heapBlock: { ...prev.heapBlock, collectingAnimation: true, owner: 'deleted' },
        message: '🗑️ delete d ejecutado - comenzando recogida del heap...'
      }));

      // Animation sequence
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          status: 'collecting',
          message: '⚡ Animación de recogida - memoria siendo liberada...'
        }));
      }, 1000);

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          status: 'freed',
          heapBlock: { 
            ...prev.heapBlock, 
            exists: false, 
            collectingAnimation: false 
          },
          message: '✅ Memoria liberada. d ahora es un dangling pointer.'
        }));
      }, 3000);

    } else if (state.deleteCount === 1) {
      // Second delete attempt
      setState(prev => ({
        ...prev,
        deleteCount: 2,
        status: 'double_delete_attempt',
        message: '⚠️ DETECTADO: Intento de double delete - preparando para bloquear...'
      }));

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          status: 'critical_ub',
          executionBlocked: true,
          message: '🚨 CRITICAL UB: Double delete! Ejecución bloqueada.'
        }));
      }, 1500);
    }
  };

  const reset = () => {
    setState({
      pointer: 0x2000000,
      heapBlock: {
        exists: true,
        value: 42,
        address: 0x2000000,
        owner: 'raw',
        collectingAnimation: false
      },
      deleteCount: 0,
      executionBlocked: false,
      status: 'allocated',
      message: 'Memoria asignada. d posee el bloque del heap.'
    });
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const cppCode = `#include <iostream>

int main() {
    int* d = new int(42);  // Asignación en heap
    
    std::cout << "Valor: " << *d << std::endl;  // OK
    
    delete d;  // Primera liberación - OK
    
    // Ahora d es un "dangling pointer"
    // Apunta a memoria que ya no es válida
    
    delete d;  // ¡UNDEFINED BEHAVIOR!
    // Double delete: comportamiento impredecible
    // Puede causar: crash, corrupción, heap corruption
    
    return 0;
}`;

  const preventionCode = `// ✅ PATRÓN SEGURO: Poner nullptr después de delete
int* ptr = new int(42);
delete ptr;
ptr = nullptr;  // Previene double delete

// delete nullptr es seguro (no-op)
delete ptr;  // OK - no hace nada

// ✅ MODERNO: RAII automático
{
    std::unique_ptr<int> smart_ptr = std::make_unique<int>(42);
    // Destrucción automática al salir del scope
    // Imposible double delete
}

// ✅ DEBUGGING: Instrumentación
#ifdef DEBUG
#define SAFE_DELETE(p) do { delete (p); (p) = nullptr; } while(0)
#else
#define SAFE_DELETE(p) delete (p)
#endif`;

  const ubConsequencesCode = `// Consecuencias del double delete:

1. HEAP CORRUPTION
   - El allocator intenta liberar memoria ya liberada
   - Corrompe las estructuras internas del heap
   - Afecta futuras allocaciones

2. SECURITY VULNERABILITIES
   - Heap spraying attacks
   - Use-after-free exploitation
   - Control flow hijacking

3. RUNTIME CRASHES
   - Segmentation fault (Unix)
   - Access violation (Windows)
   - Abort con core dump

4. SILENT CORRUPTION
   - Comportamiento erróneo difícil de debuggear
   - Race conditions en multithreading
   - Estado inconsistente`;

  return (
    <LessonLayout
      title="delete y Double Delete UB"
      subtitle="Explorando el peligroso mundo del double delete y sus consecuencias catastróficas"
      lessonNumber={5}
      difficulty="Advanced"
      estimatedTime={25}
      layoutType="two-panel"
    >
      <TheoryPanel topic="basic">
        
        <Section>
          <SectionTitle>🗑️ Operador delete: Liberación Manual</SectionTitle>
<p>
            El operador <strong>delete</strong> libera memoria previamente asignada con <strong>new</strong>.
            Es la contrapartida obligatoria de new para evitar memory leaks.
          </p>
          
          <h4 style={{ color: '#4ecdc4', marginTop: '1rem' }}>Mecánica del delete:</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Llamada al destructor:</strong> Si es un objeto, se ejecuta ~T()</li>
            <li><strong>Liberación de memoria:</strong> Se devuelve al heap allocator</li>
            <li><strong>Puntero dangling:</strong> El puntero sigue con la dirección anterior</li>
            <li><strong>Undefined si reusar:</strong> Acceder al puntero después es UB</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 Código del Problema</SectionTitle>
          <CodeBlock
            language="cpp"
            title="Double Delete - El Error Más Peligroso"
            copyable={true}
            showLineNumbers={true}
            highlightLines={[6, 10, 11]}
            annotations={[
              { line: 6, content: "Primera liberación - OK", type: "warning" },
              { line: 10, content: "Segunda liberación - ¡UNDEFINED BEHAVIOR!", type: "error" },
              { line: 11, content: "Cualquier comportamiento es posible desde aquí", type: "error" }
            ]}
          >
            {cppCode}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Simulación del Double Delete</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <InteractiveSection>
            <ButtonGroup orientation="horizontal" spacing="2">
              <Button 
                onClick={performDelete} 
                variant={state.deleteCount === 0 ? "success" : "danger"}
                disabled={state.executionBlocked}
                style={state.deleteCount === 1 ? {
                  background: 'linear-gradient(45deg, #8B0000, #DC143C)',
                  border: '2px solid #ff0000',
                  animation: 'pulse 1.5s infinite'
                } : {}}
              >
                {state.deleteCount === 0 ? "delete d" : "💀 delete d (DOUBLE)"}
              </Button>
              <Button onClick={nextStep} variant="warning" disabled={state.executionBlocked}>
                Siguiente Paso
              </Button>
              <Button onClick={reset}>
                Reset
              </Button>
          </ButtonGroup>
        </InteractiveSection>

          {state.status === 'critical_ub' && (
            <CriticalError>
              🚨 CRITICAL UNDEFINED BEHAVIOR DETECTED 🚨<br/>
              Double delete ejecutado. En un programa real esto causaría:<br/>
              • Heap corruption inmediata<br/>
              • Posible crash del programa<br/>
              • Vulnerabilidades de seguridad<br/>
              • Comportamiento completamente impredecible<br/>
              <br/>
              <strong>¡Evitar delete manual y preferir RAII!</strong>
            </CriticalError>
          )}
        </Section>

        <Section>
          <SectionTitle>🛡️ Técnicas de Prevención</SectionTitle>
          <CodeBlock
            language="cpp"
            title="Técnicas Profesionales Anti-Double-Delete"
            copyable={true}
            showLineNumbers={true}
            highlightLines={[3, 9, 16, 23]}
          >
            {preventionCode}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>⚠️ Consecuencias del Double Delete</SectionTitle>
          <CodeBlock
            language="cpp"
            title="Posibles Consecuencias del Double Delete"
            copyable={true}
            showLineNumbers={true}
          >
            {ubConsequencesCode}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🔧 Herramientas de Detección</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>AddressSanitizer:</strong> <code>-fsanitize=address</code> detecta double-free</li>
            <li><strong>Valgrind:</strong> <code>valgrind --tool=memcheck</code></li>
            <li><strong>Static Analysis:</strong> clang-static-analyzer, PVS-Studio</li>
            <li><strong>Debug Heaps:</strong> MSVC CRT Debug, glibc MALLOC_CHECK_</li>
            <li><strong>Custom Allocators:</strong> Instrumentación manual</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>🎯 Mantra del Senior Engineer</SectionTitle>
          <div style={{
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <strong>Principios Fundamentales:</strong>
            <ol style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              <li><strong>RAII over manual management:</strong> unique_ptr, shared_ptr</li>
              <li><strong>Una sola responsabilidad:</strong> Quien crea, destruye</li>
              <li><strong>Nullify after delete:</strong> ptr = nullptr</li>
              <li><strong>Zero tolerance for leaks:</strong> Herramientas automáticas</li>
              <li><strong>Fail fast in debug:</strong> Aserciones y verificaciones</li>
            </ol>
          </div>
        </Section>

        <Section>
          <SectionTitle>📚 Referencias Profesionales</SectionTitle>
<ul style={{ lineHeight: '1.6' }}>
            <li>
              <a href="https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Res-raii" 
                 style={{ color: '#00d4ff' }} target="_blank" rel="noopener noreferrer">
                Core Guidelines: R.1 Manage resources automatically using RAII
              </a>
            </li>
            <li><strong>Effective C++:</strong> Item 13 - Use objects to manage resources</li>
            <li><strong>Modern C++:</strong> Prefer make_unique/make_shared</li>
            <li><strong>Industry Standard:</strong> Zero tolerance for memory errors</li>
          </ul>
        </Section>
      </TheoryPanel>
      
      <VisualizationPanel topic="basic">
        <StatusDisplay>
          <div>🎯 Tarea 5: Delete Operations
          </div>
          <div>📍 Paso: {currentStep + 1}/{steps.length}</div>
          <div>🔗 Estado: {state.status}</div>
          <div>🗑️ Deletes: {state.deleteCount}</div>
          <div>🚨 Bloqueado: {state.executionBlocked ? 'SÍ' : 'NO'}</div>
          <div>💾 Heap: {state.heapBlock.exists ? 'EXISTS' : 'FREED'}</div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
          <Lesson05Scene state={state} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
          />
        </Canvas>
      </VisualizationPanel>
    </LessonLayout>
  );
}