import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import * as THREE from 'three';
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

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'warning' | 'success' | 'const' }>`
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
      case 'const':
        return `
          background: linear-gradient(45deg, #6a1b9a, #8e24aa);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(106, 27, 154, 0.4); }
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

const ConstRule = styled.div<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(106, 27, 154, 0.2)' : 'rgba(106, 27, 154, 0.05)'};
  border: 2px solid ${props => props.active ? '#6a1b9a' : 'rgba(106, 27, 154, 0.3)'};
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  color: ${props => props.active ? '#6a1b9a' : '#8e24aa'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.3s ease;
`;

const ErrorAttempt = styled.div`
  background: rgba(255, 107, 107, 0.1);
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #ff6b6b;
  font-weight: bold;
  animation: compileError 1.5s infinite;
  
  @keyframes compileError {
    0%, 100% { border-color: #ff6b6b; }
    50% { border-color: #ff0000; }
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

type ConstType = 'none' | 'const_data' | 'const_pointer' | 'const_both';

interface ConstState {
  value: number;
  pointer: number;
  constType: ConstType;
  attemptedAction: 'none' | 'modify_value' | 'modify_pointer';
  lastError: string;
  status: 'normal' | 'error' | 'success';
  message: string;
}

function ConstVisualBlock({ position, size, color, label, value, isConst, isPointer = false }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  label: string;
  value: string;
  isConst: boolean;
  isPointer?: boolean;
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.8}
          metalness={isConst ? 0.8 : 0.3}
          roughness={isConst ? 0.1 : 0.7}
        />
      </mesh>
      
      {/* Const indicator */}
      {isConst && (
        <Text
          position={[0, size[1] / 2 + 0.8, 0]}
          fontSize={0.25}
          color="#6a1b9a"
          anchorX="center"
          anchorY="middle"
        >
          🔒 CONST
        </Text>
      )}
      
      <Text
        position={[0, size[1] / 2 + 0.4, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      <Text
        position={[0, 0, 0]}
        fontSize={0.4}
        color={isConst ? "#6a1b9a" : "#00d4ff"}
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
      
      <Text
        position={[0, -size[1] / 2 - 0.3, 0]}
        fontSize={0.2}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        {isPointer ? 'pointer' : 'data'}
      </Text>
    </group>
  );
}

function ConstArrow({ start, end, color = "#00d4ff", isConst = false }: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  isConst?: boolean;
}) {
  const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
  const length = direction.length();
  direction.normalize();

  const arrowColor = isConst ? "#6a1b9a" : color;
  const arrowHelper = new THREE.ArrowHelper(direction, new THREE.Vector3(...start), length, arrowColor, length * 0.2, length * 0.1);

  return <primitive object={arrowHelper} />;
}

function ReadingGuide({ position, constType }: {
  position: [number, number, number];
  constType: ConstType;
}) {
  const guides = {
    none: "int* ptr",
    const_data: "const int* ptr",
    const_pointer: "int* const ptr", 
    const_both: "const int* const ptr"
  };

  const explanations = {
    none: "Mutable data, mutable pointer",
    const_data: "Immutable data, mutable pointer",
    const_pointer: "Mutable data, immutable pointer",
    const_both: "Immutable data, immutable pointer"
  };

  return (
    <Html position={position} center>
      <div style={{
        background: 'rgba(106, 27, 154, 0.1)',
        border: '2px solid #6a1b9a',
        borderRadius: '8px',
        padding: '1rem',
        color: '#6a1b9a',
        textAlign: 'center',
        minWidth: '300px'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#6a1b9a' }}>
          Lectura de Derecha a Izquierda
        </h4>
        <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', margin: '0.5rem 0' }}>
          {guides[constType]}
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
          {explanations[constType]}
        </div>
      </div>
    </Html>
  );
}

function Lesson07Scene({ state }: { state: ConstState }) {
  const isDataConst = state.constType === 'const_data' || state.constType === 'const_both';
  const isPointerConst = state.constType === 'const_pointer' || state.constType === 'const_both';

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, 5]} intensity={0.5} color="#6a1b9a" />
      
      {/* Data block */}
      <ConstVisualBlock
        position={[2, 0, 0]}
        size={[1.5, 1, 0.5]}
        color={isDataConst ? "#6a1b9a" : "#00d4ff"}
        label="data"
        value={state.value.toString()}
        isConst={isDataConst}
      />
      
      {/* Pointer block */}
      <ConstVisualBlock
        position={[-2, 0, 0]}
        size={[1.5, 1, 0.5]}
        color={isPointerConst ? "#6a1b9a" : "#00d4ff"}
        label="ptr"
        value={`0x${state.pointer.toString(16)}`}
        isConst={isPointerConst}
        isPointer={true}
      />
      
      {/* Arrow from pointer to data */}
      <ConstArrow
        start={[-1.2, 0, 0]}
        end={[1.2, 0, 0]}
        isConst={isPointerConst}
      />
      
      {/* Reading guide */}
      <ReadingGuide 
        position={[0, 2.5, 0]} 
        constType={state.constType}
      />
      
      <Html position={[0, -3, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          minWidth: '500px',
          border: state.status === 'error' ? '2px solid #ff6b6b' : '1px solid #6a1b9a'
        }}>
          <h4 style={{ 
            color: state.status === 'error' ? '#ff6b6b' : '#6a1b9a', 
            margin: '0 0 0.5rem 0' 
          }}>
            Const Pointers - Mutabilidad Selectiva
          </h4>
          <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            Type: {state.constType} | 
            Data: {state.value} | 
            Pointer: 0x{state.pointer.toString(16)} | 
            Last Action: {state.attemptedAction}
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: state.status === 'error' ? '#ff6b6b' : '#4ecdc4',
            fontWeight: 'bold'
          }}>
            {state.message}
          </p>
        </div>
      </Html>
    </>
  );
}

export default function Lesson07_ConstPointers() {
  const { dispatch } = useApp();
  
  const [state, setState] = useState<ConstState>({
    value: 42,
    pointer: 0x1000,
    constType: 'none',
    attemptedAction: 'none',
    lastError: '',
    status: 'normal',
    message: 'Configura el tipo de const y experimenta con mutabilidad'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "int* ptr - sin const, todo mutable",
    "const int* ptr - data const, pointer mutable", 
    "int* const ptr - data mutable, pointer const",
    "const int* const ptr - todo const, nada mutable"
  ];

  const setConstType = (type: ConstType) => {
    setState(prev => ({
      ...prev,
      constType: type,
      attemptedAction: 'none',
      status: 'normal',
      message: `Configurado: ${type}. Intenta modificar data o pointer.`
    }));
  };

  const attemptModifyValue = () => {
    const isDataConst = state.constType === 'const_data' || state.constType === 'const_both';
    
    if (isDataConst) {
      setState(prev => ({
        ...prev,
        attemptedAction: 'modify_value',
        status: 'error',
        lastError: '*ptr = 100; // ERROR: assignment of read-only location',
        message: '🚫 ERROR: No puedes modificar data const a través del puntero'
      }));
    } else {
      setState(prev => ({
        ...prev,
        value: prev.value + 10,
        attemptedAction: 'modify_value',
        status: 'success',
        message: '✅ *ptr modificado exitosamente - data es mutable'
      }));
    }
  };

  const attemptModifyPointer = () => {
    const isPointerConst = state.constType === 'const_pointer' || state.constType === 'const_both';
    
    if (isPointerConst) {
      setState(prev => ({
        ...prev,
        attemptedAction: 'modify_pointer',
        status: 'error',
        lastError: 'ptr = &other; // ERROR: assignment of read-only variable',
        message: '🚫 ERROR: No puedes reasignar pointer const'
      }));
    } else {
      setState(prev => ({
        ...prev,
        pointer: 0x2000 + Math.floor(Math.random() * 0x1000),
        attemptedAction: 'modify_pointer',
        status: 'success',
        message: '✅ ptr reasignado exitosamente - pointer es mutable'
      }));
    }
  };

  const reset = () => {
    setState({
      value: 42,
      pointer: 0x1000,
      constType: 'none',
      attemptedAction: 'none',
      lastError: '',
      status: 'normal',
      message: 'Configura el tipo de const y experimenta con mutabilidad'
    });
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const constExamplesCode = `#include <iostream>

int main() {
    int value = 42;
    int other = 100;
    
    // 1. Sin const - todo mutable
    int* ptr1 = &value;
    *ptr1 = 50;     // ✅ OK - modifica value
    ptr1 = &other;  // ✅ OK - reasigna pointer
    
    // 2. Data const, pointer mutable
    const int* ptr2 = &value;
    // *ptr2 = 50;     // ❌ ERROR - data es read-only
    ptr2 = &other;     // ✅ OK - pointer es mutable
    
    // 3. Data mutable, pointer const
    int* const ptr3 = &value;
    *ptr3 = 60;        // ✅ OK - data es mutable
    // ptr3 = &other;  // ❌ ERROR - pointer es read-only
    
    // 4. Todo const - nada mutable
    const int* const ptr4 = &value;
    // *ptr4 = 70;     // ❌ ERROR - data es read-only
    // ptr4 = &other;  // ❌ ERROR - pointer es read-only
    
    return 0;
}`;

  const readingRulesCode = `// REGLA DE LECTURA: Derecha a Izquierda

// Lectura paso a paso:
const int* const ptr;
      ↑         ↑
      |         └─ "ptr es const"
      └─ "apunta a int const"

// Equivalencias útiles:
const int* ptr    ≡  int const* ptr     // Ambas válidas
int* const ptr    ≡  NO hay equivalente // Solo una forma

// Truco mental - Sustituir por "cosa":
const int* ptr    → "ptr es puntero a cosa-int-const"
int* const ptr    → "ptr es cosa-const que apunta a int"

// Ejemplos con typedef:
typedef int* IntPtr;
const IntPtr ptr;  // ≡ int* const ptr (pointer const)

typedef const int* ConstIntPtr;
ConstIntPtr ptr;   // ≡ const int* ptr (data const)`;

  const practicalUseCases = `// CASOS DE USO PRÁCTICOS:

// 1. const int* - Iteración read-only
void print_array(const int* arr, size_t size) {
    for (size_t i = 0; i < size; ++i) {
        std::cout << arr[i] << " ";  // ✅ lectura
        // arr[i] = 0;               // ❌ no modificación
        ++arr;  // ✅ avanzar puntero
    }
}

// 2. int* const - Cache/singleton pointer
class Database {
private:
    Connection* const conn_;  // Conexión fija durante lifetime
public:
    Database(Connection* c) : conn_(c) {}
    // conn_ no puede reasignarse, pero su contenido sí es mutable
};

// 3. const int* const - Configuración inmutable
class Config {
private:
    const char* const version_;  // Ni pointer ni data cambian
public:
    Config() : version_("v1.0.0") {}
};

// 4. Referencias como alternativa moderna
void modern_function(const int& value) {  // Más claro que const int*
    // value es read-only, no puede ser null
}`;

  return (
    <LessonContainer>
      <TheoryPanel>
        <Title>Tarea 7: const con Punteros - Mutabilidad Selectiva</Title>
        
        <Section>
          <SectionTitle>🔒 const: Control Granular de Mutabilidad</SectionTitle>
          <p>
            <strong>const</strong> con punteros permite especificar qué puede mutar y qué no.
            La posición de const determina si se aplica al dato apuntado o al puntero mismo.
          </p>
          
          <h4 style={{ color: '#6a1b9a', marginTop: '1rem' }}>Combinaciones Posibles:</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>int* ptr:</strong> Data mutable, pointer mutable</li>
            <li><strong>const int* ptr:</strong> Data const, pointer mutable</li>
            <li><strong>int* const ptr:</strong> Data mutable, pointer const</li>
            <li><strong>const int* const ptr:</strong> Data const, pointer const</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 Código de Ejemplo</SectionTitle>
          <CodeBlock>{constExamplesCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Experimentación Interactiva</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
            <ConstRule active={state.constType === 'none'}>
              <strong>int* ptr</strong><br/>
              Sin const - todo mutable
            </ConstRule>
            <ConstRule active={state.constType === 'const_data'}>
              <strong>const int* ptr</strong><br/>
              Data const, pointer mutable
            </ConstRule>
            <ConstRule active={state.constType === 'const_pointer'}>
              <strong>int* const ptr</strong><br/>
              Data mutable, pointer const
            </ConstRule>
            <ConstRule active={state.constType === 'const_both'}>
              <strong>const int* const ptr</strong><br/>
              Todo const - nada mutable
            </ConstRule>
          </div>
          
          <InteractiveSection>
            <Button onClick={() => setConstType('none')}>
              int* ptr
            </Button>
            <Button onClick={() => setConstType('const_data')} variant="const">
              const int* ptr
            </Button>
            <Button onClick={() => setConstType('const_pointer')} variant="const">
              int* const ptr
            </Button>
            <Button onClick={() => setConstType('const_both')} variant="const">
              const int* const ptr
            </Button>
          </InteractiveSection>

          <InteractiveSection>
            <Button onClick={attemptModifyValue} variant="warning">
              *ptr = new_value
            </Button>
            <Button onClick={attemptModifyPointer} variant="warning">
              ptr = &other
            </Button>
            <Button onClick={nextStep} variant="success">
              Siguiente Paso
            </Button>
            <Button onClick={reset}>
              Reset
            </Button>
          </InteractiveSection>

          {state.status === 'error' && (
            <ErrorAttempt>
              🚫 COMPILE ERROR<br/>
              {state.lastError}<br/>
              <strong>Razón:</strong> Violación de const-correctness
            </ErrorAttempt>
          )}
        </Section>

        <Section>
          <SectionTitle>📚 Reglas de Lectura</SectionTitle>
          <CodeBlock>{readingRulesCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎯 Casos de Uso Prácticos</SectionTitle>
          <CodeBlock>{practicalUseCases}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>⚡ const-correctness Guidelines</SectionTitle>
          <div style={{
            background: 'rgba(106, 27, 154, 0.1)',
            border: '1px solid #6a1b9a',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <strong>Principios Profesionales:</strong>
            <ol style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              <li><strong>Const by default:</strong> Usar const siempre que sea posible</li>
              <li><strong>Interfaces claras:</strong> const documenta intención</li>
              <li><strong>Compilador amigo:</strong> const permite optimizaciones</li>
              <li><strong>Debugging:</strong> const previene modificaciones accidentales</li>
              <li><strong>Thread safety:</strong> const implica read-only thread-safe</li>
            </ol>
          </div>
        </Section>

        <Section>
          <SectionTitle>🔧 Herramientas y Verificación</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Compilador:</strong> Errores de const-correctness en compile-time</li>
            <li><strong>clang-tidy:</strong> readability-const-return-type</li>
            <li><strong>const_cast:</strong> Romper const (usar con extrema precaución)</li>
            <li><strong>mutable:</strong> Keyword para excepciones en clases const</li>
            <li><strong>constexpr:</strong> const evaluation en compile-time</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>📈 Evolución hacia C++ Moderno</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Referencias:</strong> Alternativa a punteros const no-null</li>
            <li><strong>std::span:</strong> Vista const sobre arrays</li>
            <li><strong>std::string_view:</strong> Vista const sobre strings</li>
            <li><strong>constexpr:</strong> Computación compile-time</li>
            <li><strong>const member functions:</strong> Métodos que no modifican objeto</li>
          </ul>
        </Section>
      </TheoryPanel>

      <VisualizationPanel>
        <StatusDisplay>
          <div>🎯 Tarea 7: const Pointers</div>
          <div>📍 Paso: {currentStep + 1}/{steps.length}</div>
          <div>🔗 Tipo: {state.constType}</div>
          <div>📊 Acción: {state.attemptedAction}</div>
          <div>🎯 Estado: {state.status}</div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
          <Lesson07Scene state={state} />
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