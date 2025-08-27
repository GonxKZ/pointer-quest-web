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

const UBWarning = styled.div`
  background: rgba(255, 107, 107, 0.1);
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #ff6b6b;
  font-weight: bold;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const ScopeBox = styled.div<{ active: boolean }>`
  border: 2px dashed ${props => props.active ? '#4caf50' : '#ff6b6b'};
  background: ${props => props.active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 107, 107, 0.1)'};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  transition: all 0.3s ease;
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

interface DanglingState {
  outerVariable: number;
  innerVariable: number | null;
  danglingPtr: number | null;
  inInnerScope: boolean;
  innerScopeExists: boolean;
  showDanglingArrow: boolean;
  arrowColor: string;
  status: 'safe' | 'entering_scope' | 'in_scope' | 'exiting_scope' | 'dangling' | 'ub_access';
  message: string;
}

function DisappearingBlock({ position, size, color, label, value, visible, fadeOut }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  label: string;
  value?: string;
  visible: boolean;
  fadeOut: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    if (meshRef.current && fadeOut) {
      setOpacity(prev => Math.max(0, prev - 0.02));
    }
  });

  if (!visible && !fadeOut) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={fadeOut ? opacity : 0.8} 
        />
      </mesh>
      
      <Text
        position={[0, size[1] / 2 + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        visible={visible || fadeOut}
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
          visible={visible || fadeOut}
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
        visible={visible || fadeOut}
      >
        inner scope
      </Text>
    </group>
  );
}

function DanglingArrow({ start, color = "#ff6b6b", floating = false }: {
  start: [number, number, number];
  color?: string;
  floating?: boolean;
}) {
  const arrowRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (arrowRef.current && floating) {
      arrowRef.current.position.y = start[1] + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      arrowRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group ref={arrowRef} position={start}>
      <mesh>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.25}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {floating ? "DANGLING!" : "POINTS TO"}
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

function ScopeVisualization({ active, position }: { active: boolean; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[4, 3, 0.1]} />
        <meshStandardMaterial 
          color={active ? "#4caf50" : "#ff6b6b"} 
          transparent 
          opacity={0.2}
          wireframe
        />
      </mesh>
      
      <Text
        position={[0, 1.7, 0]}
        fontSize={0.3}
        color={active ? "#4caf50" : "#ff6b6b"}
        anchorX="center"
        anchorY="middle"
      >
        {active ? "{ INNER SCOPE ACTIVE }" : "{ SCOPE DESTROYED }"}
      </Text>
    </group>
  );
}

function Lesson03Scene({ state }: { state: DanglingState }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (state.status === 'exiting_scope') {
      setFadingOut(true);
      setTimeout(() => setFadingOut(false), 2000);
    }
  }, [state.status]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Scope visualization */}
      <ScopeVisualization 
        active={state.innerScopeExists} 
        position={[0, 0, -1]}
      />
      
      {/* Outer variable */}
      <group position={[-3, 1, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1, 0.5]} />
          <meshStandardMaterial color="#00d4ff" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          outer var
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
        >
          {state.outerVariable}
        </Text>
      </group>
      
      {/* Inner variable (disappears when scope ends) */}
      <DisappearingBlock
        position={[0, 0, 0]}
        size={[1.5, 1, 0.5]}
        color="#4caf50"
        label="inner var"
        value={state.innerVariable?.toString()}
        visible={state.innerScopeExists}
        fadeOut={fadingOut}
      />
      
      {/* Dangling pointer */}
      <group position={[3, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1, 0.5]} />
          <meshStandardMaterial 
            color={state.status === 'dangling' || state.status === 'ub_access' ? "#ff6b6b" : "#00d4ff"} 
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
          fontSize={0.3}
          color={state.status === 'dangling' || state.status === 'ub_access' ? "#ff6b6b" : "#00d4ff"}
          anchorX="center"
          anchorY="middle"
        >
          {state.danglingPtr ? `&inner (${state.danglingPtr.toString(16)})` : 'nullptr'}
        </Text>
      </group>
      
      {/* Arrow from d to inner (valid) */}
      {state.innerScopeExists && state.danglingPtr && (
        <PointerArrow
          start={[3.8, 0, 0]}
          end={[-0.8, 0, 0]}
          color="#4caf50"
        />
      )}
      
      {/* Dangling arrow (floating) */}
      {state.showDanglingArrow && (
        <DanglingArrow
          start={[3.8, 0, 0]}
          color="#ff6b6b"
          floating={true}
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
          border: state.status === 'ub_access' ? '2px solid #ff6b6b' : 
                  state.status === 'dangling' ? '2px solid #ffca28' : '1px solid #00d4ff'
        }}>
          <h4 style={{ 
            color: state.status === 'ub_access' ? '#ff6b6b' : 
                   state.status === 'dangling' ? '#ffca28' : '#00d4ff', 
            margin: '0 0 0.5rem 0' 
          }}>
            Dangling Pointer - Lifecycle Visualization
          </h4>
          <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            Scope: {state.innerScopeExists ? 'ACTIVO' : 'DESTRUIDO'} | 
            d: {state.danglingPtr ? `&inner (${state.danglingPtr.toString(16)})` : 'nullptr'}
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: state.status === 'ub_access' ? '#ff6b6b' : 
                   state.status === 'dangling' ? '#ffca28' : '#4ecdc4',
            fontWeight: 'bold'
          }}>
            {state.message}
          </p>
        </div>
      </Html>
    </>
  );
}

export default function Lesson03_DanglingPtr() {
  const { dispatch } = useApp();
  
  const [state, setState] = useState<DanglingState>({
    outerVariable: 100,
    innerVariable: null,
    danglingPtr: null,
    inInnerScope: false,
    innerScopeExists: false,
    showDanglingArrow: false,
    arrowColor: "#00d4ff",
    status: 'safe',
    message: 'Código iniciado. No hay punteros peligrosos todavía.'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Declara puntero fuera del scope interno",
    "Entra al bloque interno y crea variable local",
    "Asigna d = &inner (puntero válido dentro del scope)",
    "Sale del bloque - ¡la variable inner se destruye!",
    "Intenta acceder *d - ¡UNDEFINED BEHAVIOR!"
  ];

  const enterInnerScope = () => {
    setState(prev => ({
      ...prev,
      innerVariable: 42,
      inInnerScope: true,
      innerScopeExists: true,
      status: 'entering_scope',
      message: 'Entrando al scope interno. Variable local creada.'
    }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        status: 'in_scope',
        message: 'Dentro del scope. La variable inner existe en la pila.'
      }));
    }, 1000);
  };

  const assignPointer = () => {
    if (state.innerScopeExists) {
      setState(prev => ({
        ...prev,
        danglingPtr: 0x7fff5fbff710, // Dirección simulada
        status: 'in_scope',
        message: '✅ d = &inner - Puntero válido dentro del scope'
      }));
    }
  };

  const exitScope = () => {
    setState(prev => ({
      ...prev,
      inInnerScope: false,
      innerScopeExists: false,
      status: 'exiting_scope',
      message: '⚠️ Saliendo del scope - la variable inner se DESTRUYE'
    }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        innerVariable: null,
        showDanglingArrow: true,
        status: 'dangling',
        message: '💀 DANGLING POINTER: d apunta a memoria inválida!'
      }));
    }, 1500);
  };

  const attemptAccess = () => {
    if (state.status === 'dangling') {
      setState(prev => ({
        ...prev,
        status: 'ub_access',
        message: '🚨 UNDEFINED BEHAVIOR: *d accede a memoria liberada!'
      }));
      
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          message: 'En un programa real: crash, corrupción o comportamiento impredecible'
        }));
      }, 3000);
    }
  };

  const reset = () => {
    setState({
      outerVariable: 100,
      innerVariable: null,
      danglingPtr: null,
      inInnerScope: false,
      innerScopeExists: false,
      showDanglingArrow: false,
      arrowColor: "#00d4ff",
      status: 'safe',
      message: 'Código iniciado. No hay punteros peligrosos todavía.'
    });
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const cppCode = `#include <iostream>

int main() {
    int outer = 100;
    int* d = nullptr;  // Declaramos puntero fuera del scope
    
    {  // Entramos a un bloque interno
        int inner = 42;    // Variable local del bloque
        d = &inner;        // ¡PELIGRO! Guardamos dirección local
        
        std::cout << "Dentro del scope: " << *d << std::endl;  // OK
        
    }  // inner se DESTRUYE aquí - su memoria ya no es válida
    
    // ¡UNDEFINED BEHAVIOR!
    std::cout << "Fuera del scope: " << *d << std::endl;  // CRASH!
    
    // d apunta a memoria que ya no existe
    // Comportamiento impredecible: crash, basura, corrupción...
    
    return 0;
}`;

  const preventionCode = `// ✅ SOLUCIÓN 1: No retornar punteros a locals
int* bad_function() {
    int local = 42;
    return &local;  // ¡MAL! Retorna dirección de variable local
}

// ✅ SOLUCIÓN 2: Usar parámetros de salida
void good_function(int& out) {
    out = 42;  // Modifica variable del caller
}

// ✅ SOLUCIÓN 3: Heap allocation (pero requiere delete)
int* heap_function() {
    return new int(42);  // OK, pero requiere delete
}

// ✅ SOLUCIÓN 4: Smart pointers (moderno)
std::unique_ptr<int> modern_function() {
    return std::make_unique<int>(42);  // RAII automático
}`;

  return (
    <LessonLayout
      title="Dangling Pointers - La Vitrina Desaparece"
      subtitle="Entendiendo los peligros de los punteros colgantes y gestión de memoria automática"
      lessonNumber={3}
      difficulty="Intermediate"
      estimatedTime={18}
      layoutType="two-panel"
    >
      <TheoryPanel topic="basic">
        
        <Section>
          <SectionTitle>💀 Concepto Mortal: Dangling Pointer</SectionTitle>
          <p>
            Un <strong>dangling pointer</strong> es un puntero que apunta a memoria que ya no es válida.
            Es como tener una llave de una casa que ya fue demolida.
          </p>
          
          <h4 style={{ color: '#ff6b6b', marginTop: '1rem' }}>Causas Comunes:</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Variables locales:</strong> Retornar &amp;local desde una función</li>
            <li><strong>Scope blocks:</strong> Guardar dirección de variable en bloque interno</li>
            <li><strong>delete:</strong> Usar puntero después de delete</li>
            <li><strong>Reallocación:</strong> vector que invalida punteros al crecer</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 Código del Problema</SectionTitle>
          <CodeBlock
            language="cpp"
            title="Ejemplo de Dangling Pointer (¡NO HAGAS ESTO!)"
            copyable={true}
            showLineNumbers={true}
            highlightLines={[4, 7, 10]}
            annotations={[
              { line: 4, content: "Puntero declarado aquí apuntará a variable de scope interno", type: "warning" },
              { line: 7, content: "PELIGRO: inner se destruye al final del bloque", type: "error" },
              { line: 10, content: "UNDEFINED BEHAVIOR: acceso a memoria destruida", type: "error" }
            ]}
          >
            {cppCode}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Simulación del Ciclo de Vida</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <ScopeBox active={state.innerScopeExists}>
            <strong>Estado del Scope Interno:</strong> {state.innerScopeExists ? 'ACTIVO' : 'DESTRUIDO'}
            <br/>
            <strong>Variable inner:</strong> {state.innerVariable !== null ? `Existe (${state.innerVariable})` : 'No existe'}
          </ScopeBox>
          
          <InteractiveSection>
            <ButtonGroup orientation="horizontal" spacing="2">
              <Button 
                onClick={enterInnerScope} 
                variant="success"
                disabled={state.innerScopeExists}
              >
                1. Entrar al Scope { }
              </Button>
              <Button 
                onClick={assignPointer} 
                disabled={!state.innerScopeExists || state.danglingPtr !== null}
              >
                2. d = &inner
              </Button>
              <Button 
                onClick={exitScope} 
                variant="warning"
                disabled={!state.innerScopeExists}
              >
                3. Salir del Scope
              </Button>
              <Button 
                onClick={attemptAccess} 
                variant="danger"
                disabled={state.status !== 'dangling'}
              >
                4. 💀 Intentar *d
              </Button>
              <Button onClick={nextStep} variant="warning">
                Siguiente Paso
              </Button>
              <Button onClick={reset}>
                Reset
              </Button>
            </ButtonGroup>
          </InteractiveSection>

          {state.status === 'ub_access' && (
            <UBWarning>
              🚨 UNDEFINED BEHAVIOR DETECTADO: En un programa real esto causaría:
              <ul>
                <li>Segmentation fault (crash)</li>
                <li>Lectura de basura</li>
                <li>Corrupción de memoria</li>
                <li>Comportamiento impredecible</li>
              </ul>
            </UBWarning>
          )}
        </Section>

        <Section>
          <SectionTitle>✅ Técnicas de Prevención</SectionTitle>
          <CodeBlock
            language="cpp"
            title="Alternativas Seguras a Dangling Pointers"
            copyable={true}
            showLineNumbers={true}
            highlightLines={[4, 11, 18, 23]}
          >
            {preventionCode}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🔍 Herramientas de Detección</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>AddressSanitizer:</strong> <code>-fsanitize=address</code> detecta use-after-free</li>
            <li><strong>Valgrind:</strong> Detecta accesos a memoria inválida</li>
            <li><strong>Static Analysis:</strong> clang-tidy, PVS-Studio, SonarQube</li>
            <li><strong>Core Guidelines:</strong> 
              <a href="https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Res-always" 
                 style={{ color: '#00d4ff' }} target="_blank" rel="noopener noreferrer">
                F.43: Never return a pointer to a local object
              </a>
            </li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>🎯 Lecciones Clave</SectionTitle>
          <div style={{
            background: 'rgba(255, 202, 40, 0.1)',
            border: '1px solid #ffca28',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <strong>Reglas de Oro:</strong>
            <ol style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              <li>Nunca retornes punteros a variables locales</li>
              <li>No guardes direcciones de variables temporales</li>
              <li>Verifica el lifetime antes de almacenar punteros</li>
              <li>Prefiere RAII y smart pointers</li>
              <li>Usa referencias cuando no necesites nulabilidad</li>
            </ol>
          </div>
        </Section>
      </TheoryPanel>
      
      <VisualizationPanel topic="basic">
        <StatusDisplay>
          <div>🎯 Tarea 3: Dangling Pointers</div>
          <div>📍 Paso: {currentStep + 1}/{steps.length}</div>
          <div>🔗 Estado: {state.status}</div>
          <div>📦 Scope: {state.innerScopeExists ? 'ACTIVO' : 'DESTRUIDO'}</div>
          <div>⚠️ Peligro: {state.showDanglingArrow ? 'SÍ' : 'NO'}</div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
          <Lesson03Scene state={state} />
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