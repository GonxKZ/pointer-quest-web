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


const ComparisonPanel: React.FC<{ type: 'legacy' | 'modern' | 'active'; children: React.ReactNode }> = ({ type, children }) => {
  const getStyles = () => {
    const colorMap = {
      legacy: { bg: 'rgba(121, 85, 72, 0.1)', border: '#795548', color: '#795548' },
      modern: { bg: 'rgba(156, 39, 176, 0.1)', border: '#9c27b0', color: '#9c27b0' },
      active: { bg: 'rgba(76, 175, 80, 0.1)', border: '#4caf50', color: '#4caf50' }
    };
    return colorMap[type];
  };
  
  const styles = getStyles();
  
  return (
    <div style={{
      background: styles.bg,
      border: `2px solid ${styles.border}`,
      borderRadius: '8px',
      padding: '1rem',
      margin: '1rem 0',
      color: styles.color,
      fontWeight: 'bold',
    }}>
      {children}
    </div>
  );
};

const DebtIndicator: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: 'rgba(255, 202, 40, 0.1)',
    border: '2px solid #ffca28',
    borderRadius: '8px',
    padding: '1rem',
    margin: '1rem 0',
    color: '#ffca28',
    fontWeight: 'bold',
    animation: 'debtPulse 2s infinite',
  }}>
    {children}
    <style jsx>{`
      @keyframes debtPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `}</style>
  </div>
);

interface OutputParameterState {
  currentMethod: 'none' | 'double_pointer' | 'unique_ptr_ref';
  heapBlock: {
    exists: boolean;
    value: number;
    address: number;
    owner: 'none' | 'raw' | 'unique_ptr';
  };
  debtBalance: number;
  safetyLevel: 'unsafe' | 'safe' | 'modern';
  status: 'idle' | 'allocating' | 'allocated' | 'transferred';
  message: string;
}

function OutputBlock({ position, size, color, label, value, owner, visible = true }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  label: string;
  value: string;
  owner: 'none' | 'raw' | 'unique_ptr';
  visible?: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && visible && owner === 'unique_ptr') {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  if (!visible) return null;

  const ownerColors = {
    none: "#666",
    raw: "#ff6b6b", 
    unique_ptr: "#9c27b0"
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9}
          metalness={owner === 'unique_ptr' ? 0.8 : 0.3}
          roughness={0.1}
        />
      </mesh>
      
      <Text
        position={[0, size[1] / 2 + 0.8, 0]}
        fontSize={0.25}
        color={ownerColors[owner]}
        anchorX="center"
        anchorY="middle"
      >
        owner: {owner}
      </Text>
      
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
        color="white"
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
        heap
      </Text>
    </group>
  );
}

function MethodIndicator({ position, method, active }: {
  position: [number, number, number];
  method: 'double_pointer' | 'unique_ptr_ref';
  active: boolean;
}) {
  const labels = {
    double_pointer: "void adopt(int** out)",
    unique_ptr_ref: "void adopt(unique_ptr<int>& out)"
  };

  const colors = {
    double_pointer: "#795548",
    unique_ptr_ref: "#9c27b0"
  };

  return (
    <Text
      position={position}
      fontSize={0.4}
      color={active ? colors[method] : "#666"}
      anchorX="center"
      anchorY="middle"
    >
      {labels[method]}
    </Text>
  );
}

function DebtVisualizer({ position, amount }: {
  position: [number, number, number];
  amount: number;
}) {
  if (amount === 0) return null;

  return (
    <group position={position}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="#ffca28"
        anchorX="center"
        anchorY="middle"
      >
        💳 DEBT: {amount}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.3}
        color="#ff6b6b"
        anchorX="center"
        anchorY="middle"
      >
        delete required
      </Text>
    </group>
  );
}

function Lesson09Scene({ state }: { state: OutputParameterState }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, 5]} intensity={0.5} color="#9c27b0" />
      
      {/* Method indicators */}
      <MethodIndicator
        position={[-2, 2, 0]}
        method="double_pointer"
        active={state.currentMethod === 'double_pointer'}
      />
      
      <MethodIndicator
        position={[2, 2, 0]}
        method="unique_ptr_ref"
        active={state.currentMethod === 'unique_ptr_ref'}
      />
      
      {/* Output block */}
      {state.heapBlock.exists && (
        <OutputBlock
          position={[0, 0, 0]}
          size={[2, 1.2, 0.5]}
          color={state.heapBlock.owner === 'unique_ptr' ? "#9c27b0" : "#ff6b6b"}
          label="allocated object"
          value={state.heapBlock.value.toString()}
          owner={state.heapBlock.owner}
        />
      )}
      
      {/* Debt visualizer */}
      <DebtVisualizer
        position={[0, -2, 0]}
        amount={state.debtBalance}
      />
      
      {/* Safety level indicator */}
      <Text
        position={[0, -3, 0]}
        fontSize={0.4}
        color={
          state.safetyLevel === 'unsafe' ? '#ff6b6b' :
          state.safetyLevel === 'safe' ? '#4caf50' : '#9c27b0'
        }
        anchorX="center"
        anchorY="middle"
      >
        Safety: {state.safetyLevel.toUpperCase()}
      </Text>
      
      <Html position={[0, -4, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          minWidth: '500px',
          border: state.safetyLevel === 'unsafe' ? '2px solid #ff6b6b' : 
                  state.safetyLevel === 'modern' ? '2px solid #9c27b0' : '1px solid #4caf50'
        }}>
          <h4 style={{ 
            color: state.safetyLevel === 'unsafe' ? '#ff6b6b' : 
                   state.safetyLevel === 'modern' ? '#9c27b0' : '#4caf50', 
            margin: '0 0 0.5rem 0' 
          }}>
            Output Parameters - Legacy vs Modern
          </h4>
          <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            Method: {state.currentMethod} | 
            Owner: {state.heapBlock.owner} | 
            Debt: {state.debtBalance} | 
            Safety: {state.safetyLevel}
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

export default function Lesson09_ParameterOutput() {
  const { dispatch } = useApp();
  
  const [state, setState] = useState<OutputParameterState>({
    currentMethod: 'none',
    heapBlock: {
      exists: false,
      value: 0,
      address: 0,
      owner: 'none'
    },
    debtBalance: 0,
    safetyLevel: 'unsafe',
    status: 'idle',
    message: 'Compara métodos para parámetros de salida'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "void adopt(int** out) - método C tradicional con delete debt",
    "void adopt(unique_ptr<int>& out) - método moderno RAII",
    "Compara ergonomía, seguridad y gestión de memoria",
    "Aprende cuándo usar cada patrón"
  ];

  const demonstrateDoublePointer = () => {
    setState(prev => ({
      ...prev,
      currentMethod: 'double_pointer',
      status: 'allocating',
      message: 'Ejecutando adopt(int** out) - asignando con new...'
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        heapBlock: {
          exists: true,
          value: 7,
          address: 0x4000000,
          owner: 'raw'
        },
        debtBalance: 1,
        safetyLevel: 'unsafe',
        status: 'allocated',
        message: '*out = new int(7) - DEUDA DE DELETE creada'
      }));
    }, 1000);

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        status: 'transferred',
        message: '⚠️ Caller debe hacer delete - responsabilidad manual'
      }));
    }, 2500);
  };

  const demonstrateUniquePtr = () => {
    setState(prev => ({
      ...prev,
      currentMethod: 'unique_ptr_ref',
      status: 'allocating',
      message: 'Ejecutando adopt(unique_ptr<int>& out) - make_unique...'
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        heapBlock: {
          exists: true,
          value: 7,
          address: 0x4000000,
          owner: 'unique_ptr'
        },
        debtBalance: 0,
        safetyLevel: 'modern',
        status: 'allocated',
        message: 'out = make_unique<int>(7) - sin deuda de delete'
      }));
    }, 1000);

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        status: 'transferred',
        message: '✅ RAII automático - destrucción garantizada al salir del scope'
      }));
    }, 2500);
  };

  const reset = () => {
    setState({
      currentMethod: 'none',
      heapBlock: {
        exists: false,
        value: 0,
        address: 0,
        owner: 'none'
      },
      debtBalance: 0,
      safetyLevel: 'unsafe',
      status: 'idle',
      message: 'Compara métodos para parámetros de salida'
    });
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const doublePointerCode = `#include <iostream>

// ❌ LEGACY C-style: Double pointer output parameter
void adopt(int** out) {
    *out = new int(7);  // Caller must delete
    // DEBT: Quien llama debe hacer delete *out
}

int main() {
    int* ptr = nullptr;
    adopt(&ptr);  // ptr ahora apunta a heap object
    
    std::cout << "Value: " << *ptr << std::endl;
    
    delete ptr;  // ⚠️ OBLIGATORIO - easy to forget!
    ptr = nullptr;
    
    return 0;
}`;

  const uniquePtrCode = `#include <iostream>
#include <memory>

// ✅ MODERN C++: Reference to unique_ptr
void adopt(std::unique_ptr<int>& out) {
    out = std::make_unique<int>(7);  // No debt
    // RAII: Automatic cleanup when out goes out of scope
}

int main() {
    std::unique_ptr<int> ptr;
    adopt(ptr);  // ptr now owns heap object
    
    std::cout << "Value: " << *ptr << std::endl;
    
    // No delete needed - automatic cleanup!
    return 0;
}`;

  const comparisonCode = `// COMPARACIÓN DETALLADA:

// 1. ERGONOMÍA
void legacy_allocate(int** out);
auto modern_allocate() -> std::unique_ptr<int>;

// Legacy: Requiere & operator
int* ptr;
legacy_allocate(&ptr);

// Modern: Natural assignment  
auto ptr = modern_allocate();

// 2. SEGURIDAD
void legacy_parse(const char* str, int** result, bool* success);
auto modern_parse(const char* str) -> std::optional<int>;

// Legacy: Error-prone
int* value;
bool ok;
legacy_parse("123", &value, &ok);
if (ok) {
    use(*value);
    delete value;  // Easy to forget!
}

// Modern: Safe
if (auto value = modern_parse("123")) {
    use(*value);
    // Automatic cleanup
}

// 3. EXCEPTION SAFETY
void risky_legacy(int** a, int** b) {
    *a = new int(1);
    *b = new int(2);  // If this throws, *a leaks!
}

void safe_modern(std::unique_ptr<int>& a, std::unique_ptr<int>& b) {
    a = std::make_unique<int>(1);
    b = std::make_unique<int>(2);  // Exception safe
}`;

  const migrationGuideCode = `// GUÍA DE MIGRACIÓN:

// Pattern 1: Simple output parameter
// OLD:
void get_value(int** out) { *out = new int(42); }

// NEW:
auto get_value() -> std::unique_ptr<int> { 
    return std::make_unique<int>(42); 
}

// Pattern 2: Optional output
// OLD:
bool try_parse(const char* str, int** out) {
    if (valid(str)) {
        *out = new int(parse(str));
        return true;
    }
    return false;
}

// NEW:
auto try_parse(const char* str) -> std::optional<int> {
    if (valid(str)) return parse(str);
    return std::nullopt;
}

// Pattern 3: Multiple outputs
// OLD:
void get_range(int** min, int** max) {
    *min = new int(0);
    *max = new int(100);
}

// NEW:
struct Range { int min, max; };
auto get_range() -> Range { return {0, 100}; }

// Pattern 4: Complex objects
// OLD:
void create_widget(Widget** out) {
    *out = new Widget(complex_args);
}

// NEW:
auto create_widget() -> std::unique_ptr<Widget> {
    return std::make_unique<Widget>(complex_args);
}`;

  return (
    <LessonLayout
      title="Tarea 9: Output Parameters - Legacy vs Modern"
      difficulty="Básico"
      topic="basic"
      estimatedTime="20 minutos"
    >
      <TheoryPanel>
        
        <Section>
          <SectionTitle>🔄 Parámetros de Salida: Evolución del Patrón</SectionTitle>
          <p>
            Los parámetros de salida permiten que una función "devuelva" múltiples valores o 
            modifique objetos del caller. El enfoque ha evolucionado desde double pointers 
            (C-style) hacia referencias y smart pointers (C++ moderno).
          </p>
          
          <h4 style={{ color: '#795548', marginTop: '1rem' }}>Legacy Pattern - void adopt(int** out):</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Funciona:</strong> *out = new int(value) asigna memoria</li>
            <li><strong>Problema:</strong> Caller debe recordar hacer delete</li>
            <li><strong>Riesgo:</strong> Memory leaks si se olvida cleanup</li>
            <li><strong>Exception Safety:</strong> Pobre en casos complejos</li>
          </ul>
          
          <h4 style={{ color: '#9c27b0', marginTop: '1rem' }}>Modern Pattern - void adopt(unique_ptr&lt;int&gt;&amp; out):</h4>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>RAII:</strong> out = make_unique&lt;int&gt;(value)</li>
            <li><strong>Seguridad:</strong> Destrucción automática garantizada</li>
            <li><strong>Exception Safe:</strong> Sin memory leaks</li>
            <li><strong>Expresivo:</strong> Ownership transfer explícito</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>💻 Código Legacy (C-style)</SectionTitle>
          <CodeBlock>{doublePointerCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🚀 Código Moderno (C++11+)</SectionTitle>
          <CodeBlock>{uniquePtrCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎮 Demostración Interactiva</SectionTitle>
          <p><strong>Paso {currentStep + 1} de {steps.length}:</strong> {steps[currentStep]}</p>
          
          <ComparisonPanel type={state.currentMethod === 'double_pointer' ? 'active' : 'legacy'}>
            <strong>Legacy:</strong> void adopt(int** out)<br/>
            Deuda de delete, propenso a leaks
          </ComparisonPanel>
          
          <ComparisonPanel type={state.currentMethod === 'unique_ptr_ref' ? 'active' : 'modern'}>
            <strong>Modern:</strong> void adopt(unique_ptr&lt;int&gt;&amp; out)<br/>
            RAII automático, exception safe
          </ComparisonPanel>
          
          <InteractiveSection>
            <Button 
              onClick={demonstrateDoublePointer} 
              variant="secondary"
              disabled={state.status === 'allocating'}
            >
              Legacy: adopt(int** out)
            </Button>
            <Button 
              onClick={demonstrateUniquePtr} 
              variant="primary"
              disabled={state.status === 'allocating'}
            >
              Modern: adopt(unique_ptr&amp; out)
            </Button>
            <Button onClick={nextStep} variant="success">
              Siguiente Paso
            </Button>
            <Button onClick={reset}>
              Reset
            </Button>
          </InteractiveSection>

          {state.debtBalance > 0 && (
            <DebtIndicator>
              ⚠️ DELETE DEBT DETECTADA<br/>
              El caller debe hacer delete para evitar memory leak.<br/>
              Ownership transfer manual = riesgo de olvido.
            </DebtIndicator>
          )}

          {state.currentMethod === 'unique_ptr_ref' && (
            <ComparisonPanel type="active">
              ✅ RAII AUTOMÁTICO<br/>
              unique_ptr gestiona memoria automáticamente.<br/>
              Exception safe + ownership claro + no leaks.
            </ComparisonPanel>
          )}
        </Section>

        <Section>
          <SectionTitle>⚖️ Comparación Completa</SectionTitle>
          <CodeBlock>{comparisonCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🔧 Guía de Migración</SectionTitle>
          <CodeBlock>{migrationGuideCode}</CodeBlock>
        </Section>

        <Section>
          <SectionTitle>🎯 Mejores Prácticas Modernas</SectionTitle>
          <div style={{
            background: 'rgba(156, 39, 176, 0.1)',
            border: '1px solid #9c27b0',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <strong>Recomendaciones Senior:</strong>
            <ol style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              <li><strong>Return over output:</strong> Prefiere return values sobre output parameters</li>
              <li><strong>std::optional:</strong> Para valores que pueden fallar</li>
              <li><strong>std::tuple:</strong> Para múltiples valores relacionados</li>
              <li><strong>Structured bindings:</strong> auto [a, b] = get_pair()</li>
              <li><strong>unique_ptr&amp;:</strong> Solo cuando return no es viable</li>
              <li><strong>Evitar **:</strong> Double pointers solo para C interop</li>
            </ol>
          </div>
        </Section>

        <Section>
          <SectionTitle>📚 Referencias y Evolución</SectionTitle>
          <ul style={{ lineHeight: '1.6' }}>
            <li>
              <a href="https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Rf-out" 
                 style={{ color: '#00d4ff' }} target="_blank" rel="noopener noreferrer">
                Core Guidelines: F.20 For "out" output values, prefer return values
              </a>
            </li>
            <li><strong>C++11:</strong> move semantics + unique_ptr eliminan necesidad de **</li>
            <li><strong>C++14:</strong> make_unique para construcción segura</li>
            <li><strong>C++17:</strong> std::optional para casos opcionales</li>
            <li><strong>C++20:</strong> concepts para interfaces más claras</li>
          </ul>
        </Section>
      </TheoryPanel>

      <VisualizationPanel>
        <StatusDisplay>
          <div>🎯 Tarea 9: Output Parameters</div>
          <div>📍 Paso: {currentStep + 1}/{steps.length}</div>
          <div>🔗 Método: {state.currentMethod}</div>
          <div>💳 Deuda: {state.debtBalance}</div>
          <div>🛡️ Safety: {state.safetyLevel}</div>
          <div>📊 Estado: {state.status}</div>
        </StatusDisplay>
        
        <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
          <Lesson09Scene state={state} />
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