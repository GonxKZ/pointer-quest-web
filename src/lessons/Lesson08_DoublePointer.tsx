import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import { THREE } from '../utils/three';
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


const IndirectionLevel: React.FC<{ level: number; active: boolean; children: React.ReactNode }> = ({ level, active, children }) => (
  <div style={{
    background: active ? 'rgba(233, 30, 99, 0.2)' : 'rgba(233, 30, 99, 0.05)',
    border: `2px solid ${active ? '#e91e63' : 'rgba(233, 30, 99, 0.3)'}`,
    borderRadius: '8px',
    padding: '1rem',
    margin: '0.5rem 0',
    color: active ? '#e91e63' : '#c2185b',
    fontWeight: active ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
  }}>
    {children}
  </div>
);

interface DoublePointerState {
  value: number;
  pointerAddr: number;
  doublePointerAddr: number;
  indirectionLevel: 0 | 1 | 2;
  accessType: 'direct' | 'single_indirect' | 'double_indirect';
  lastAccess: string;
  status: 'normal' | 'accessing' | 'modifying';
  message: string;
}

function PointerBlock({ position, size, color, label, value, type, isAccessed = false }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  label: string;
  value: string;
  type: 'data' | 'pointer' | 'double_pointer';
  isAccessed?: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isAccessed) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  const typeColors = {
    data: "#00d4ff",
    pointer: "#ff6b6b", 
    double_pointer: "#e91e63"
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={isAccessed ? "#ffca28" : color} 
          transparent 
          opacity={0.8}
          metalness={isAccessed ? 0.8 : 0.3}
          roughness={0.1}
        />
      </mesh>
      
      <Text
        position={[0, size[1] / 2 + 0.6, 0]}
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
        color={isAccessed ? "#ffca28" : typeColors[type]}
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
      
      <Text
        position={[0, -size[1] / 2 - 0.4, 0]}
        fontSize={0.25}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        {type.replace('_', ' ')}
      </Text>
    </group>
  );
}

function IndirectionArrow({ start, end, color = "#00d4ff", animated = false, label = "" }: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  animated?: boolean;
  label?: string;
}) {
  const arrowRef = React.useRef<THREE.ArrowHelper>(null);

  useFrame((state) => {
    if (arrowRef.current && animated) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      arrowRef.current.scale.setScalar(scale);
    }
  });

  const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
  const length = direction.length();
  direction.normalize();

  const arrowHelper = new THREE.ArrowHelper(direction, new THREE.Vector3(...start), length, color, length * 0.2, length * 0.1);

  return (
    <group>
      <primitive ref={arrowRef} object={arrowHelper} />
      {label && (
        <Text
          position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 0.5, 0]}
          fontSize={0.3}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function AccessPath({ level, position }: { level: number; position: [number, number, number] }) {
  const paths = [
    "value",           // 0 indirection
    "p → value",       // 1 indirection  
    "pp → p → value"   // 2 indirection
  ];

  return (
    <Text
      position={position}
      fontSize={0.4}
      color="#e91e63"
      anchorX="center"
      anchorY="middle"
    >
      {paths[level]}
    </Text>
  );
}

function Lesson08Scene({ state }: { state: DoublePointerState }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, 5]} intensity={0.5} color="#e91e63" />
      
      {/* Data block */}
      <PointerBlock
        position={[4, 0, 0]}
        size={[1.5, 1, 0.5]}
        color="#00d4ff"
        label="int value"
        value={state.value.toString()}
        type="data"
        isAccessed={state.indirectionLevel === 0}
      />
      
      {/* Single pointer block */}
      <PointerBlock
        position={[0, 0, 0]}
        size={[1.5, 1, 0.5]}
        color="#ff6b6b"
        label="int* p"
        value={`0x${state.pointerAddr.toString(16)}`}
        type="pointer"
        isAccessed={state.indirectionLevel === 1}
      />
      
      {/* Double pointer block */}
      <PointerBlock
        position={[-4, 0, 0]}
        size={[1.5, 1, 0.5]}
        color="#e91e63"
        label="int** pp"
        value={`0x${state.doublePointerAddr.toString(16)}`}
        type="double_pointer"
        isAccessed={state.indirectionLevel === 2}
      />
      
      {/* Arrow from pp to p */}
      <IndirectionArrow
        start={[-3.2, 0, 0]}
        end={[-0.8, 0, 0]}
        color="#e91e63"
        animated={state.indirectionLevel >= 2}
        label="*pp"
      />
      
      {/* Arrow from p to value */}
      <IndirectionArrow
        start={[0.8, 0, 0]}
        end={[3.2, 0, 0]}
        color="#ff6b6b"
        animated={state.indirectionLevel >= 1}
        label="*p"
      />
      
      {/* Access path visualization */}
      <AccessPath level={state.indirectionLevel} position={[0, 2.5, 0]} />
      
      {/* Indirection level indicator */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.5}
        color="#e91e63"
        anchorX="center"
        anchorY="middle"
      >
        Indirection Level: {state.indirectionLevel}
      </Text>
      
      <Html position={[0, -3.5, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          minWidth: '500px',
          border: '1px solid #e91e63'
        }}>
          <h4 style={{ 
            color: '#e91e63', 
            margin: '0 0 0.5rem 0' 
          }}>
            Double Pointers - Indirection Chaining
          </h4>
          <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            pp: 0x{state.doublePointerAddr.toString(16)} | 
            p: 0x{state.pointerAddr.toString(16)} | 
            value: {state.value} | 
            Access: {state.accessType}
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: '#4ecdc4',
            fontWeight: 'bold'
          }}>
            {state.message}
          </p>
        </div>
      </Html>
    </>
  );
}

export default function Lesson08_DoublePointer() {
  const { state: appState } = useApp();
  
  const [state, setState] = useState<DoublePointerState>({
    value: 42,
    pointerAddr: 0x1000,
    doublePointerAddr: 0x2000,
    indirectionLevel: 0,
    accessType: 'direct',
    lastAccess: '',
    status: 'normal',
    message: 'Explora diferentes niveles de indirección con pp, *pp, **pp'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Declara int** pp = &p - puntero a puntero",
    "Accede con *pp para obtener p (primera indirección)",
    "Accede con **pp para obtener value (doble indirección)",
    "Modifica p a través de *pp y observa el efecto"
  ];

  const accessDirect = () => {
    setState(prev => ({
      ...prev,
      indirectionLevel: 0,
      accessType: 'direct',
      lastAccess: 'value',
      status: 'accessing',
      message: `Acceso directo: value = ${prev.value}`
    }));
  };

  const accessSingleIndirect = () => {
    setState(prev => ({
      ...prev,
      indirectionLevel: 1,
      accessType: 'single_indirect',
      lastAccess: '*pp',
      status: 'accessing',
      message: `*pp = p = 0x${prev.pointerAddr.toString(16)} (dirección de value)`
    }));
  };

  const accessDoubleIndirect = () => {
    setState(prev => ({
      ...prev,
      indirectionLevel: 2,
      accessType: 'double_indirect',
      lastAccess: '**pp',
      status: 'accessing',
      message: `**pp = *p = value = ${prev.value} (valor final)`
    }));
  };

  const modifyThroughDouble = () => {
    const newAddr = 0x3000 + Math.floor(Math.random() * 0x1000);
    setState(prev => ({
      ...prev,
      pointerAddr: newAddr,
      status: 'modifying',
      message: `*pp modificado: p ahora apunta a 0x${newAddr.toString(16)}`
    }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        status: 'normal',
        message: 'La flecha "interna" se recolocó. **pp seguirá funcionando.'
      }));
    }, 2000);
  };

  const reset = () => {
    setState({
      value: 42,
      pointerAddr: 0x1000,
      doublePointerAddr: 0x2000,
      indirectionLevel: 0,
      accessType: 'direct',
      lastAccess: '',
      status: 'normal',
      message: 'Explora diferentes niveles de indirección con pp, *pp, **pp'
    });
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const doublePointerCode = `#include <iostream>

int main() {
    int value = 42;
    int* p = &value;      // p apunta a value
    int** pp = &p;        // pp apunta a p (¡puntero a puntero!)
    
    std::cout << "Direcciones:" << std::endl;
    std::cout << "value está en: " << &value << std::endl;
    std::cout << "p está en: " << &p << std::endl;
    std::cout << "pp está en: " << &pp << std::endl;
    
    std::cout << "\\nValores:" << std::endl;
    std::cout << "value = " << value << std::endl;
    std::cout << "p = " << p << " (dirección de value)" << std::endl;
    std::cout << "pp = " << pp << " (dirección de p)" << std::endl;
    
    std::cout << "\\nIndirecciones:" << std::endl;
    std::cout << "*p = " << *p << " (valor a través de p)" << std::endl;
    std::cout << "*pp = " << *pp << " (valor de p a través de pp)" << std::endl;
    std::cout << "**pp = " << **pp << " (valor final a través de pp)" << std::endl;
    
    // Modificar p a través de pp
    int other = 100;
    *pp = &other;  // Ahora p apunta a other
    std::cout << "\\nDespués de *pp = &other:" << std::endl;
    std::cout << "**pp = " << **pp << std::endl;  // Ahora es 100
    
    return 0;
}`;

  const cApiUseCaseCode = `// CASO DE USO: APIs C con output parameters

// ❌ Problemático - modificar puntero local
void bad_allocate(int* ptr) {
    ptr = (int*)malloc(sizeof(int) * 10);  // Solo modifica copia local
}

// ✅ Correcto - modificar a través de double pointer
void good_allocate(int** ptr_ptr) {
    *ptr_ptr = (int*)malloc(sizeof(int) * 10);  // Modifica puntero del caller
}

// Uso:
int main() {
    int* my_ptr = nullptr;
    
    bad_allocate(my_ptr);   // my_ptr sigue siendo nullptr
    good_allocate(&my_ptr); // my_ptr ahora apunta a memoria válida
    
    free(my_ptr);
    return 0;
}

// Ejemplos reales de APIs C:
// - pthread_create(pthread_t** thread, ...)
// - getline(char** lineptr, size_t* n, FILE* stream)
// - strtod(const char* str, char** endptr)`;

  const modernAlternativesCode = `// ALTERNATIVAS MODERNAS C++:

// 1. Referencias para output parameters
void modern_allocate(std::unique_ptr<int[]>& ptr) {
    ptr = std::make_unique<int[]>(10);
}

// 2. Return value optimization (RVO)
std::unique_ptr<int[]> factory_allocate() {
    return std::make_unique<int[]>(10);
}

// 3. std::optional para casos opcionales
std::optional<std::unique_ptr<int[]>> safe_allocate(size_t size) {
    if (size > MAX_SIZE) return std::nullopt;
    return std::make_unique<int[]>(size);
}

// 4. Output parameter con referencias
void parse_int(const std::string& str, int& result, bool& success) {
    try {
        result = std::stoi(str);
        success = true;
    } catch (...) {
        success = false;
    }
}

// ✅ RECOMENDACIÓN: Evitar ** en código moderno C++
// Usar referencias, return values, o std::optional`;

  const complexIndirectionCode = `// INDIRECCIÓN COMPLEJA - Entender la sintaxis:

int*** ppp;  // Triple pointer - tres niveles de indirección

// Lectura de derecha a izquierda:
// ppp es un puntero a puntero a puntero a int

// Accesos:
int value = ***ppp;     // Tres desreferencias para llegar al int
int** pp_copy = *ppp;   // Una desreferencia da puntero doble
int* p_copy = **ppp;    // Dos desreferencias dan puntero simple

// Modificaciones:
***ppp = 100;           // Modifica el int final
**ppp = &other_int;     // Modifica el puntero simple
*ppp = &other_pp;       // Modifica el puntero doble
ppp = &other_ppp;       // Modifica el puntero triple

// REGLA: N asteriscos en declaración = N asteriscos para acceso completo`;

  return (
    <LessonLayout
      title="Tarea 8: Double Pointers - Indirección Múltiple"
      difficulty="Básico"
      topic="basic"
      estimatedTime={18}
    >
      <TheoryPanel>
        
        <Section>
          <SectionTitle>🔗 Concepto: Puntero a Puntero</SectionTitle>
<p>
            Un <strong>double pointer</strong> (int**) es un puntero que apunta a otro puntero.
            Permite modificar punteros a través de indirección, esencial para APIs C y output parameters.
          </p>
          
          <h4 style={{ color: '#e91e63', marginTop: '1rem' }}>Niveles de Indirección:</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>pp:</strong> Dirección del puntero p</li>
            <li><strong>*pp:</strong> Valor de p (dirección de value)</li>
            <li><strong>**pp:</strong> Valor final (contenido de value)</li>
            <li><strong>Modificación:</strong> *pp = &other cambia hacia dónde apunta p</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 Código de Ejemplo</SectionTitle>
          <CodeBlock>{doublePointerCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Exploración Interactiva</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <div style={{ margin: '1rem 0' }}>
            <IndirectionLevel level={0} active={state.indirectionLevel === 0}>
              <strong>Nivel 0:</strong> value (acceso directo) = {state.value}
            </IndirectionLevel>
            <IndirectionLevel level={1} active={state.indirectionLevel === 1}>
              <strong>Nivel 1:</strong> *pp (primera indirección) = p = 0x{state.pointerAddr.toString(16)}
            </IndirectionLevel>
            <IndirectionLevel level={2} active={state.indirectionLevel === 2}>
              <strong>Nivel 2:</strong> **pp (doble indirección) = value = {state.value}
            </IndirectionLevel>
          </div>
          
          <InteractiveSection>
            <Button onClick={accessDirect}>
              value
            </Button>
            <Button onClick={accessSingleIndirect} variant="secondary">
              *pp
            </Button>
            <Button onClick={accessDoubleIndirect} variant="secondary">
              **pp
            </Button>
            <Button onClick={modifyThroughDouble} variant="warning">
              *pp = &other
            </Button>
            <Button onClick={nextStep} variant="success">
              Siguiente Paso
            </Button>
            <Button onClick={reset}>
              Reset
            </Button>
        </InteractiveSection>
        </Section>

        <Section>
          <SectionTitle>🔧 Caso de Uso: APIs C Output Parameters</SectionTitle>
<CodeBlock>{cApiUseCaseCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🚀 Alternativas Modernas C++</SectionTitle>
          <CodeBlock>{modernAlternativesCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🧠 Indirección Compleja</SectionTitle>
          <CodeBlock>{complexIndirectionCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>⚡ Cuándo Usar Double Pointers</SectionTitle>
          <div style={{
            background: 'rgba(233, 30, 99, 0.1)',
            border: '1px solid #e91e63',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <strong>Casos Válidos:</strong>
            <ol style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              <li><strong>Interop con C:</strong> APIs que requieren modificar punteros</li>
              <li><strong>Estructuras dinámicas:</strong> Listas enlazadas, árboles</li>
              <li><strong>Output parameters:</strong> Cuando return no es suficiente</li>
              <li><strong>Matrices dinámicas:</strong> Arrays 2D con filas de diferente tamaño</li>
            </ol>
            
            <strong style={{ marginTop: '1rem', display: 'block' }}>Evitar en C++ Moderno:</strong>
            <ul style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              <li>Preferir referencias para output parameters</li>
              <li>Usar std::optional para valores opcionales</li>
              <li>Return value optimization (RVO) para factories</li>
              <li>Smart pointers para ownership management</li>
            </ul>
          </div>
        </Section>

        <Section>
          <SectionTitle>🛠️ Debugging y Herramientas</SectionTitle>
<ul style={{ lineHeight: '1.6' }}>
            <li><strong>gdb/lldb:</strong> p *pp, p **pp para inspeccionar indirecciones</li>
            <li><strong>Visual Studio:</strong> Watch window con expresiones *ptr</li>
            <li><strong>AddressSanitizer:</strong> Detecta dereferences inválidos</li>
            <li><strong>Static Analysis:</strong> Flagging de indirección excesiva</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>📚 Referencias Técnicas</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li>
              <a href="https://isocpp.org/wiki/faq/pointers" 
                 style={{ color: '#00d4ff' }} target="_blank" rel="noopener noreferrer">
                isocpp.org: Pointer FAQ
              </a>
            </li>
            <li><strong>K&R C:</strong> Capítulo sobre punteros múltiples</li>
            <li><strong>Effective C++:</strong> Preferir interfaces modernas</li>
            <li><strong>Modern C++:</strong> std::optional, references, smart pointers</li>
          </ul>
        </Section>
      </TheoryPanel>

      <VisualizationPanel>
        <StatusDisplay>
          <div>🎯 Tarea 8: Double Pointers
          </div>
          <div>📍 Paso: {currentStep + 1}/{steps.length}</div>
          <div>🔗 Indirección: {state.indirectionLevel}</div>
          <div>📊 Acceso: {state.accessType}</div>
          <div>🎯 Estado: {state.status}</div>
          <div>🎪 Último: {state.lastAccess || 'none'}</div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
          <Lesson08Scene state={state} />
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