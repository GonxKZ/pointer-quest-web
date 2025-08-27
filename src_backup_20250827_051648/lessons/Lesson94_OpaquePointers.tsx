/**
 * Lesson 94: Opaque Pointers - Information Hiding and Encapsulation Mastery
 * Advanced techniques for opaque pointer design, API encapsulation, and C/C++ interoperability patterns
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import {
  LessonLayout,
  Section,
  SectionTitle,
  InteractiveSection,
  LearningObjectives,
  Button,
  ButtonGroup,
  CodeBlock,
  PerformanceMonitor,
  AccessibilityAnnouncer,
  UndefinedBehaviorWarning,
  PerformanceComparison
} from '../design-system';
import { useApp } from '../context/AppContext';

interface OpaquePointersState {
  language: 'en' | 'es';
  scenario: 'c_style_opaque' | 'type_safe' | 'api_design' | 'template_opaque' | 'reference_counting' | 'thread_safe';
  isAnimating: boolean;
  encapsulationLevel: number;
  apiStability: number;
  performanceOverhead: number;
  typeSafety: number;
  showQuiz: boolean;
  quizScore: number;
}

const OpaquePointerVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  language: 'en' | 'es';
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, language, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const opaqueRef = useRef<Mesh>(null);
  const interfaceRef = useRef<Mesh>(null);
  const hiddenImplRef = useRef<Mesh>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.01;
    
    // Opaque handle (visible but contents hidden)
    if (opaqueRef.current) {
      opaqueRef.current.rotation.y = Math.sin(animationRef.current * 0.8) * 0.2;
      opaqueRef.current.position.y = Math.sin(animationRef.current * 1.5) * 0.1;
    }

    // Public interface layer
    if (interfaceRef.current) {
      interfaceRef.current.rotation.z = Math.cos(animationRef.current * 1.2) * 0.05;
      interfaceRef.current.scale.setScalar(1 + Math.sin(animationRef.current * 2) * 0.03);
    }

    // Hidden implementation (opacity changes to show/hide)
    if (hiddenImplRef.current) {
      hiddenImplRef.current.rotation.y = animationRef.current * 0.5;
      const visibility = scenario === 'c_style_opaque' ? 0.2 : 
                        scenario === 'type_safe' ? 0.1 :
                        scenario === 'api_design' ? 0.15 : 0.05;
      hiddenImplRef.current.material.opacity = visibility + Math.sin(animationRef.current * 3) * 0.05;
    }

    // Update metrics based on scenario
    switch (scenario) {
      case 'c_style_opaque':
        onMetrics({
          encapsulationLevel: Math.floor(60 + Math.sin(animationRef.current * 1.5) * 15),
          apiStability: 85,
          performanceOverhead: Math.floor(3 + Math.cos(animationRef.current * 2) * 2),
          typeSafety: Math.floor(40 + Math.sin(animationRef.current) * 10)
        });
        break;
      case 'type_safe':
        onMetrics({
          encapsulationLevel: Math.floor(85 + Math.sin(animationRef.current * 2) * 10),
          apiStability: 95,
          performanceOverhead: Math.floor(5 + Math.cos(animationRef.current * 1.8) * 3),
          typeSafety: Math.floor(90 + Math.sin(animationRef.current * 1.2) * 8)
        });
        break;
      case 'api_design':
        onMetrics({
          encapsulationLevel: Math.floor(90 + Math.sin(animationRef.current * 1.2) * 8),
          apiStability: 98,
          performanceOverhead: Math.floor(4 + Math.cos(animationRef.current * 3) * 2),
          typeSafety: Math.floor(85 + Math.sin(animationRef.current * 2) * 5)
        });
        break;
      case 'template_opaque':
        onMetrics({
          encapsulationLevel: Math.floor(95 + Math.sin(animationRef.current * 1.8) * 5),
          apiStability: 80,
          performanceOverhead: Math.floor(1 + Math.cos(animationRef.current * 2.5) * 1),
          typeSafety: Math.floor(98 + Math.sin(animationRef.current * 1.5) * 2)
        });
        break;
      case 'reference_counting':
        onMetrics({
          encapsulationLevel: Math.floor(88 + Math.sin(animationRef.current * 2.2) * 10),
          apiStability: 92,
          performanceOverhead: Math.floor(8 + Math.cos(animationRef.current * 4) * 4),
          typeSafety: Math.floor(85 + Math.sin(animationRef.current * 2.8) * 12)
        });
        break;
      case 'thread_safe':
        onMetrics({
          encapsulationLevel: Math.floor(85 + Math.sin(animationRef.current * 1.6) * 12),
          apiStability: 96,
          performanceOverhead: Math.floor(12 + Math.cos(animationRef.current * 2.2) * 6),
          typeSafety: Math.floor(88 + Math.sin(animationRef.current * 1.8) * 8)
        });
        break;
    }
  });

  const renderOpaqueHandle = () => (
    <mesh ref={opaqueRef} position={[0, 1, 0]}>
      <boxGeometry args={[1.5, 0.5, 0.5]} />
      <meshStandardMaterial 
        color="#607D8B" 
        transparent 
        opacity={0.9}
        emissive="#607D8B"
        emissiveIntensity={0.2}
      />
    </mesh>
  );

  const renderInterface = () => (
    <mesh ref={interfaceRef} position={[-2, 0, 0]}>
      <boxGeometry args={[1.2, 1.5, 0.3]} />
      <meshStandardMaterial 
        color="#4CAF50" 
        transparent 
        opacity={0.85}
        emissive="#4CAF50"
        emissiveIntensity={0.15}
      />
    </mesh>
  );

  const renderHiddenImplementation = () => (
    <mesh ref={hiddenImplRef} position={[2, -1, 0]}>
      <boxGeometry args={[2.5, 2, 0.8]} />
      <meshStandardMaterial 
        color="#F44336" 
        transparent 
        opacity={0.3}
        emissive="#F44336"
        emissiveIntensity={0.1}
      />
    </mesh>
  );

  const renderEncapsulationBarrier = () => (
    <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 12]}>
      <boxGeometry args={[0.05, 3, 1]} />
      <meshStandardMaterial 
        color="#9C27B0" 
        emissive="#9C27B0" 
        emissiveIntensity={0.4}
        transparent
        opacity={0.8}
      />
    </mesh>
  );

  const renderDataFlows = () => {
    const flows = [
      { start: [-1.5, 0, 0], end: [0, 0.8, 0], color: '#2196F3' },
      { start: [0, 0.8, 0], end: [1.5, -0.5, 0], color: '#FF9800' }
    ];

    return flows.map((flow, index) => (
      <mesh key={index} 
        position={[
          (flow.start[0] + flow.end[0]) / 2,
          (flow.start[1] + flow.end[1]) / 2,
          (flow.start[2] + flow.end[2]) / 2
        ]}
        rotation={[0, 0, Math.atan2(flow.end[1] - flow.start[1], flow.end[0] - flow.start[0])]}
      >
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshStandardMaterial 
          color={flow.color} 
          emissive={flow.color} 
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
    ));
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.6} color="#607D8B" />
      
      {renderOpaqueHandle()}
      {renderInterface()}
      {renderHiddenImplementation()}
      {renderEncapsulationBarrier()}
      {renderDataFlows()}

      {/* Labels for visualization components */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[2, 0.3]} />
        <meshBasicMaterial color="transparent" />
      </mesh>
      
      <mesh position={[-2, -0.8, 0]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshBasicMaterial color="transparent" />
      </mesh>

      <mesh position={[2, -2.2, 0]}>
        <planeGeometry args={[3, 0.3]} />
        <meshBasicMaterial color="transparent" />
      </mesh>
    </group>
  );
};

export default function Lesson94_OpaquePointers() {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<OpaquePointersState>({
    language: state.language,
    scenario: 'c_style_opaque',
    isAnimating: false,
    encapsulationLevel: 75,
    apiStability: 90,
    performanceOverhead: 5,
    typeSafety: 70,
    showQuiz: false,
    quizScore: 0
  });

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  const handleScenarioChange = useCallback((scenario: string) => {
    setLessonState(prev => ({ ...prev, scenario: scenario as any }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setLessonState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  const handleMetricsUpdate = useCallback((metrics: any) => {
    setLessonState(prev => ({
      ...prev,
      encapsulationLevel: metrics.encapsulationLevel,
      apiStability: metrics.apiStability,
      performanceOverhead: metrics.performanceOverhead,
      typeSafety: metrics.typeSafety
    }));
  }, []);

  const learningObjectives = useMemo(() => [
    lessonState.language === 'en' 
      ? "Master C-style opaque pointers and void* techniques"
      : "Dominar punteros opacos estilo C y técnicas con void*",
    lessonState.language === 'en'
      ? "Design type-safe opaque pointer implementations" 
      : "Diseñar implementaciones de punteros opacos type-safe",
    lessonState.language === 'en'
      ? "Build robust API interfaces using opaque handles"
      : "Construir interfaces de API robustas usando handles opacos",
    lessonState.language === 'en'
      ? "Implement template-based opaque pointers with modern C++"
      : "Implementar punteros opacos basados en templates con C++ moderno",
    lessonState.language === 'en'
      ? "Apply opaque pointers in real-world systems: OS, drivers, libraries"
      : "Aplicar punteros opacos en sistemas reales: SO, drivers, librerías"
  ], [lessonState.language]);

  const quizQuestions = [
    {
      question: lessonState.language === 'en' 
        ? "What is the primary advantage of opaque pointers over regular pointers?"
        : "¿Cuál es la principal ventaja de los punteros opacos sobre los punteros regulares?",
      options: [
        lessonState.language === 'en' ? "Better performance" : "Mejor rendimiento",
        lessonState.language === 'en' ? "Information hiding and ABI stability" : "Ocultamiento de información y estabilidad ABI",
        lessonState.language === 'en' ? "Easier memory management" : "Manejo de memoria más fácil",
        lessonState.language === 'en' ? "Type safety guarantees" : "Garantías de seguridad de tipos"
      ],
      correct: 1
    },
    {
      question: lessonState.language === 'en'
        ? "Which approach provides the best type safety for opaque pointers?"
        : "¿Qué enfoque proporciona la mejor seguridad de tipos para punteros opacos?",
      options: [
        "void*",
        lessonState.language === 'en' ? "Forward declared structs" : "Structs declarados hacia adelante", 
        lessonState.language === 'en' ? "Template-based handles" : "Handles basados en templates",
        lessonState.language === 'en' ? "Function pointers" : "Punteros a funciones"
      ],
      correct: 2
    },
    {
      question: lessonState.language === 'en'
        ? "In C-style opaque pointers, what is the main risk with void*?"
        : "En punteros opacos estilo C, ¿cuál es el principal riesgo con void*?",
      options: [
        lessonState.language === 'en' ? "Memory leaks" : "Fugas de memoria",
        lessonState.language === 'en' ? "Type confusion and casting errors" : "Confusión de tipos y errores de casting", 
        lessonState.language === 'en' ? "Performance overhead" : "Sobrecarga de rendimiento",
        lessonState.language === 'en' ? "Thread safety issues" : "Problemas de seguridad de hilos"
      ],
      correct: 1
    },
    {
      question: lessonState.language === 'en'
        ? "What is the best practice for opaque pointer destruction in C APIs?"
        : "¿Cuál es la mejor práctica para la destrucción de punteros opacos en APIs de C?",
      options: [
        lessonState.language === 'en' ? "Always use free()" : "Siempre usar free()",
        lessonState.language === 'en' ? "Provide dedicated cleanup functions" : "Proporcionar funciones de limpieza dedicadas",
        lessonState.language === 'en' ? "Let the client handle cleanup" : "Dejar que el cliente maneje la limpieza",
        lessonState.language === 'en' ? "Use garbage collection" : "Usar recolección de basura"
      ],
      correct: 1
    }
  ];

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateQuizScore = () => {
    const correct = selectedAnswers.filter((answer, index) => answer === quizQuestions[index].correct).length;
    return Math.round((correct / quizQuestions.length) * 100);
  };

  return (
    <LessonLayout
      title={lessonState.language === 'en' ? "🔒 Lesson 94: Opaque Pointers" : "🔒 Lección 94: Punteros Opacos"}
      language={lessonState.language}
    >
      <LearningObjectives 
        objectives={learningObjectives}
        language={lessonState.language}
      />

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Introduction to Opaque Pointers" : "Introducción a los Punteros Opacos"}
        </SectionTitle>
        
        <p>
          {lessonState.language === 'en' 
            ? "Opaque pointers are a fundamental technique for information hiding, providing a clean separation between interface and implementation. They enable binary compatibility, reduce compilation dependencies, and create stable APIs."
            : "Los punteros opacos son una técnica fundamental para el ocultamiento de información, proporcionando una separación limpia entre interfaz e implementación. Permiten compatibilidad binaria, reducen dependencias de compilación y crean APIs estables."
          }
        </p>

        <CodeBlock language="cpp">
{`// Basic Opaque Pointer Concept
// In header file (public interface)
#ifdef __cplusplus
extern "C" {
#endif

// Opaque handle - clients can't see the implementation
typedef struct Database* DatabaseHandle;

// Public API functions
DatabaseHandle db_create(const char* connection_string);
void db_destroy(DatabaseHandle db);
int db_execute(DatabaseHandle db, const char* query);
const char* db_get_error(DatabaseHandle db);

#ifdef __cplusplus
}
#endif

// In implementation file (.cpp)
struct Database {
    // Hidden implementation details
    std::unique_ptr<sqlite3> connection;
    std::string last_error;
    std::vector<std::string> query_history;
    std::mutex connection_mutex;
    
    // Complex initialization logic
    bool initialize(const std::string& conn_str);
    void cleanup() noexcept;
};

DatabaseHandle db_create(const char* connection_string) {
    try {
        auto db = std::make_unique<Database>();
        if (!db->initialize(connection_string)) {
            return nullptr;
        }
        return reinterpret_cast<DatabaseHandle>(db.release());
    } catch (...) {
        return nullptr;
    }
}`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "C-Style Opaque Pointers with void*" : "Punteros Opacos Estilo C con void*"}
        </SectionTitle>

        <p>
          {lessonState.language === 'en'
            ? "Traditional C-style opaque pointers use void* for maximum flexibility but require careful type management to avoid errors."
            : "Los punteros opacos tradicionales estilo C usan void* para máxima flexibilidad pero requieren manejo cuidadoso de tipos para evitar errores."
          }
        </p>

        <CodeBlock language="cpp">
{`// C-Style Opaque Implementation
// Public header
typedef void* WidgetHandle;
typedef void* EventHandle;

// API functions with void* handles
WidgetHandle widget_create(int width, int height);
void widget_destroy(WidgetHandle widget);
void widget_set_size(WidgetHandle widget, int width, int height);
void widget_draw(WidgetHandle widget);

// Event system with opaque handles
EventHandle event_create(int type);
void event_destroy(EventHandle event);
void widget_handle_event(WidgetHandle widget, EventHandle event);

// Implementation with type validation
struct WidgetImpl {
    uint32_t magic;           // Magic number for validation
    int width, height;
    std::vector<uint8_t> pixels;
    bool is_visible;
    
    static const uint32_t MAGIC = 0xDEADBEEF;
    
    bool is_valid() const {
        return magic == MAGIC && width > 0 && height > 0;
    }
};

struct EventImpl {
    uint32_t magic;
    int type;
    uint64_t timestamp;
    void* data;
    
    static const uint32_t MAGIC = 0xCAFEBABE;
    
    bool is_valid() const {
        return magic == MAGIC;
    }
};

// Safe casting with validation
WidgetImpl* cast_to_widget(WidgetHandle handle) {
    if (!handle) return nullptr;
    
    auto* widget = static_cast<WidgetImpl*>(handle);
    return widget->is_valid() ? widget : nullptr;
}

EventImpl* cast_to_event(EventHandle handle) {
    if (!handle) return nullptr;
    
    auto* event = static_cast<EventImpl*>(handle);
    return event->is_valid() ? event : nullptr;
}

// API implementation with validation
WidgetHandle widget_create(int width, int height) {
    if (width <= 0 || height <= 0) return nullptr;
    
    try {
        auto widget = std::make_unique<WidgetImpl>();
        widget->magic = WidgetImpl::MAGIC;
        widget->width = width;
        widget->height = height;
        widget->pixels.resize(width * height * 4);
        widget->is_visible = true;
        
        return static_cast<WidgetHandle>(widget.release());
    } catch (...) {
        return nullptr;
    }
}

void widget_destroy(WidgetHandle handle) {
    auto* widget = cast_to_widget(handle);
    if (widget) {
        widget->magic = 0; // Invalidate
        delete widget;
    }
}

void widget_set_size(WidgetHandle handle, int width, int height) {
    auto* widget = cast_to_widget(handle);
    if (widget && width > 0 && height > 0) {
        widget->width = width;
        widget->height = height;
        widget->pixels.resize(width * height * 4);
    }
}`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Type-Safe Opaque Pointer Implementations" : "Implementaciones Type-Safe de Punteros Opacos"}
        </SectionTitle>

        <p>
          {lessonState.language === 'en'
            ? "Modern C++ enables type-safe opaque pointers that eliminate casting errors while maintaining encapsulation."
            : "C++ moderno permite punteros opacos type-safe que eliminan errores de casting mientras mantienen la encapsulación."
          }
        </p>

        <CodeBlock language="cpp">
{`// Type-Safe Opaque Pointers with Forward Declarations
// Public header file
class NetworkConnection; // Forward declaration - opaque type

class NetworkManager {
public:
    // Type-safe handle using unique_ptr with custom deleter
    using ConnectionPtr = std::unique_ptr<NetworkConnection, void(*)(NetworkConnection*)>;
    
    static ConnectionPtr create_connection(const std::string& host, int port);
    
    // Operations that work with opaque pointers
    static bool send_data(const ConnectionPtr& conn, const void* data, size_t size);
    static std::optional<std::vector<uint8_t>> receive_data(const ConnectionPtr& conn, size_t max_size);
    static bool is_connected(const ConnectionPtr& conn) noexcept;
    static std::string get_status(const ConnectionPtr& conn);
    
private:
    static void destroy_connection(NetworkConnection* conn);
};

// Template-based type-safe opaque handles
template<typename Tag>
class OpaqueHandle {
public:
    OpaqueHandle() : handle_(nullptr) {}
    explicit OpaqueHandle(void* handle) : handle_(handle) {}
    
    // Move-only semantics
    OpaqueHandle(const OpaqueHandle&) = delete;
    OpaqueHandle& operator=(const OpaqueHandle&) = delete;
    
    OpaqueHandle(OpaqueHandle&& other) noexcept : handle_(other.handle_) {
        other.handle_ = nullptr;
    }
    
    OpaqueHandle& operator=(OpaqueHandle&& other) noexcept {
        if (this != &other) {
            reset();
            handle_ = other.handle_;
            other.handle_ = nullptr;
        }
        return *this;
    }
    
    ~OpaqueHandle() {
        reset();
    }
    
    explicit operator bool() const noexcept { return handle_ != nullptr; }
    void* get() const noexcept { return handle_; }
    
    void reset(void* new_handle = nullptr) {
        if (handle_ && handle_ != new_handle) {
            Tag::destroy(handle_);
        }
        handle_ = new_handle;
    }
    
private:
    void* handle_;
};

// Tag types for different handle types
struct DatabaseTag {
    static void destroy(void* handle);
};

struct TextureTag {
    static void destroy(void* handle);
};

struct SoundTag {
    static void destroy(void* handle);
};

// Type-safe handles
using DatabaseHandle = OpaqueHandle<DatabaseTag>;
using TextureHandle = OpaqueHandle<TextureTag>;
using SoundHandle = OpaqueHandle<SoundTag>;

// Modern RAII wrapper for C APIs
template<typename T, void(*Deleter)(T*)>
class CApiWrapper {
public:
    explicit CApiWrapper(T* ptr = nullptr) : ptr_(ptr) {}
    
    ~CApiWrapper() {
        if (ptr_) {
            Deleter(ptr_);
        }
    }
    
    // Move-only
    CApiWrapper(const CApiWrapper&) = delete;
    CApiWrapper& operator=(const CApiWrapper&) = delete;
    
    CApiWrapper(CApiWrapper&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    CApiWrapper& operator=(CApiWrapper&& other) noexcept {
        if (this != &other) {
            reset(other.ptr_);
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    T* get() const noexcept { return ptr_; }
    T* release() noexcept {
        auto* result = ptr_;
        ptr_ = nullptr;
        return result;
    }
    
    void reset(T* new_ptr = nullptr) {
        if (ptr_ && ptr_ != new_ptr) {
            Deleter(ptr_);
        }
        ptr_ = new_ptr;
    }
    
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
    
private:
    T* ptr_;
};

// Usage examples
extern "C" {
    void curl_easy_cleanup(void*);
    void sqlite3_close(void*);
}

using CurlHandle = CApiWrapper<void, curl_easy_cleanup>;
using SqliteHandle = CApiWrapper<void, sqlite3_close>;`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Interactive Visualization" : "Visualización Interactiva"}
        </SectionTitle>

        <InteractiveSection>
          <ButtonGroup>
            <Button 
              onClick={() => handleScenarioChange('c_style_opaque')}
              variant={lessonState.scenario === 'c_style_opaque' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "C-Style Opaque" : "Opaco Estilo C"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('type_safe')}
              variant={lessonState.scenario === 'type_safe' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Type-Safe" : "Type-Safe"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('api_design')}
              variant={lessonState.scenario === 'api_design' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "API Design" : "Diseño de API"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('template_opaque')}
              variant={lessonState.scenario === 'template_opaque' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Template Opaque" : "Template Opaco"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('reference_counting')}
              variant={lessonState.scenario === 'reference_counting' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Reference Counting" : "Conteo de Referencias"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('thread_safe')}
              variant={lessonState.scenario === 'thread_safe' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Thread Safe" : "Thread Safe"}
            </Button>
          </ButtonGroup>

          <div style={{ height: '400px', margin: '20px 0', border: '2px solid #607D8B', borderRadius: '8px' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
              <OpaquePointerVisualization 
                scenario={lessonState.scenario}
                isAnimating={lessonState.isAnimating}
                language={lessonState.language}
                onMetrics={handleMetricsUpdate}
              />
            </Canvas>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <Button onClick={toggleAnimation}>
              {lessonState.isAnimating 
                ? (lessonState.language === 'en' ? '⏸️ Pause' : '⏸️ Pausar')
                : (lessonState.language === 'en' ? '▶️ Play' : '▶️ Reproducir')
              }
            </Button>
          </div>

          <PerformanceComparison 
            metrics={[
              { 
                name: lessonState.language === 'en' ? 'Encapsulation Level' : 'Nivel de Encapsulación', 
                value: lessonState.encapsulationLevel,
                unit: '%'
              },
              { 
                name: lessonState.language === 'en' ? 'API Stability' : 'Estabilidad de API', 
                value: lessonState.apiStability,
                unit: '%' 
              },
              { 
                name: lessonState.language === 'en' ? 'Performance Overhead' : 'Sobrecarga de Rendimiento', 
                value: lessonState.performanceOverhead,
                unit: '%' 
              },
              { 
                name: lessonState.language === 'en' ? 'Type Safety' : 'Seguridad de Tipos', 
                value: lessonState.typeSafety,
                unit: '%' 
              }
            ]}
            language={lessonState.language}
          />
        </InteractiveSection>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "API Design with Opaque Handles" : "Diseño de API con Handles Opacos"}
        </SectionTitle>

        <p>
          {lessonState.language === 'en'
            ? "Well-designed APIs use opaque handles to provide stable interfaces while hiding complex implementations and enabling future enhancements."
            : "APIs bien diseñadas usan handles opacos para proporcionar interfaces estables mientras ocultan implementaciones complejas y permiten mejoras futuras."
          }
        </p>

        <CodeBlock language="cpp">
{`// Professional API Design with Opaque Handles
// Graphics API Example - header file (graphics_api.h)
#ifdef __cplusplus
extern "C" {
#endif

// Opaque handle types
typedef struct GraphicsContext_* GraphicsContextHandle;
typedef struct Texture_* TextureHandle;
typedef struct Shader_* ShaderHandle;
typedef struct Buffer_* BufferHandle;

// Error handling
typedef enum {
    GRAPHICS_OK = 0,
    GRAPHICS_ERROR_INVALID_HANDLE,
    GRAPHICS_ERROR_OUT_OF_MEMORY,
    GRAPHICS_ERROR_INVALID_PARAMETER,
    GRAPHICS_ERROR_DEVICE_LOST
} GraphicsResult;

// Context management
GraphicsContextHandle graphics_create_context(int width, int height);
void graphics_destroy_context(GraphicsContextHandle ctx);
GraphicsResult graphics_resize(GraphicsContextHandle ctx, int width, int height);

// Resource creation
TextureHandle graphics_create_texture(GraphicsContextHandle ctx, 
                                    int width, int height, int format);
ShaderHandle graphics_create_shader(GraphicsContextHandle ctx,
                                   const char* vertex_code,
                                   const char* fragment_code);
BufferHandle graphics_create_buffer(GraphicsContextHandle ctx,
                                   const void* data, size_t size);

// Resource operations
GraphicsResult graphics_bind_texture(GraphicsContextHandle ctx, TextureHandle tex, int slot);
GraphicsResult graphics_use_shader(GraphicsContextHandle ctx, ShaderHandle shader);
GraphicsResult graphics_draw_buffer(GraphicsContextHandle ctx, BufferHandle buffer);

// Resource cleanup
void graphics_destroy_texture(TextureHandle tex);
void graphics_destroy_shader(ShaderHandle shader);
void graphics_destroy_buffer(BufferHandle buffer);

// Utility functions
const char* graphics_get_error_string(GraphicsResult result);
int graphics_is_valid_handle(void* handle, const char* type);

#ifdef __cplusplus
}
#endif

// Implementation file (graphics_api.cpp)
#include "graphics_api.h"
#include <memory>
#include <unordered_map>
#include <mutex>
#include <vulkan/vulkan.h>

// Internal implementation structures
struct GraphicsContext_ {
    uint32_t magic;
    VkInstance instance;
    VkDevice device;
    VkQueue graphics_queue;
    VkCommandPool command_pool;
    std::unordered_map<uint32_t, std::unique_ptr<struct Texture_>> textures;
    std::unordered_map<uint32_t, std::unique_ptr<struct Shader_>> shaders;
    std::mutex resource_mutex;
    uint32_t next_id;
    
    static constexpr uint32_t MAGIC = 0x47525048; // 'GRPH'
    
    bool is_valid() const { return magic == MAGIC; }
    void invalidate() { magic = 0; }
};

struct Texture_ {
    uint32_t magic;
    uint32_t id;
    VkImage image;
    VkImageView view;
    VkDeviceMemory memory;
    int width, height, format;
    GraphicsContext_* context;
    
    static constexpr uint32_t MAGIC = 0x54455854; // 'TEXT'
    
    bool is_valid() const { return magic == MAGIC && context && context->is_valid(); }
    void invalidate() { magic = 0; }
};

struct Shader_ {
    uint32_t magic;
    uint32_t id;
    VkShaderModule vertex_module;
    VkShaderModule fragment_module;
    VkPipelineLayout layout;
    VkRenderPass render_pass;
    VkPipeline pipeline;
    GraphicsContext_* context;
    
    static constexpr uint32_t MAGIC = 0x53484452; // 'SHDR'
    
    bool is_valid() const { return magic == MAGIC && context && context->is_valid(); }
    void invalidate() { magic = 0; }
};

// Safe handle validation
template<typename T>
T* validate_handle(void* handle) {
    if (!handle) return nullptr;
    auto* typed_handle = static_cast<T*>(handle);
    return typed_handle->is_valid() ? typed_handle : nullptr;
}

// API Implementation
GraphicsContextHandle graphics_create_context(int width, int height) {
    if (width <= 0 || height <= 0) return nullptr;
    
    try {
        auto context = std::make_unique<GraphicsContext_>();
        context->magic = GraphicsContext_::MAGIC;
        context->next_id = 1;
        
        // Initialize Vulkan...
        if (!initialize_vulkan(context.get(), width, height)) {
            return nullptr;
        }
        
        return context.release();
    } catch (...) {
        return nullptr;
    }
}

void graphics_destroy_context(GraphicsContextHandle handle) {
    auto* ctx = validate_handle<GraphicsContext_>(handle);
    if (!ctx) return;
    
    // Cleanup all resources first
    ctx->resource_mutex.lock();
    ctx->textures.clear();
    ctx->shaders.clear();
    ctx->resource_mutex.unlock();
    
    // Cleanup Vulkan resources
    cleanup_vulkan(ctx);
    
    ctx->invalidate();
    delete ctx;
}

TextureHandle graphics_create_texture(GraphicsContextHandle ctx_handle, 
                                     int width, int height, int format) {
    auto* ctx = validate_handle<GraphicsContext_>(ctx_handle);
    if (!ctx || width <= 0 || height <= 0) return nullptr;
    
    try {
        auto texture = std::make_unique<Texture_>();
        texture->magic = Texture_::MAGIC;
        texture->width = width;
        texture->height = height;
        texture->format = format;
        texture->context = ctx;
        
        // Create Vulkan texture resources...
        if (!create_vulkan_texture(texture.get())) {
            return nullptr;
        }
        
        std::lock_guard<std::mutex> lock(ctx->resource_mutex);
        texture->id = ctx->next_id++;
        auto* result = texture.get();
        ctx->textures[texture->id] = std::move(texture);
        
        return result;
    } catch (...) {
        return nullptr;
    }
}

// Error handling
const char* graphics_get_error_string(GraphicsResult result) {
    switch (result) {
        case GRAPHICS_OK: return "Success";
        case GRAPHICS_ERROR_INVALID_HANDLE: return "Invalid handle";
        case GRAPHICS_ERROR_OUT_OF_MEMORY: return "Out of memory";
        case GRAPHICS_ERROR_INVALID_PARAMETER: return "Invalid parameter";
        case GRAPHICS_ERROR_DEVICE_LOST: return "Device lost";
        default: return "Unknown error";
    }
}`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Template-Based Opaque Pointers" : "Punteros Opacos Basados en Templates"}
        </SectionTitle>

        <CodeBlock language="cpp">
{`// Modern C++ Template-Based Opaque Pointers
template<typename T, typename Deleter = std::default_delete<T>>
class OpaquePtr {
public:
    using element_type = T;
    using deleter_type = Deleter;
    
    // Constructors
    constexpr OpaquePtr() noexcept : ptr_(nullptr) {}
    constexpr OpaquePtr(std::nullptr_t) noexcept : ptr_(nullptr) {}
    
    explicit OpaquePtr(T* ptr) noexcept : ptr_(ptr) {}
    
    template<typename D>
    OpaquePtr(T* ptr, D&& deleter) : ptr_(ptr), deleter_(std::forward<D>(deleter)) {}
    
    // Move semantics
    OpaquePtr(OpaquePtr&& other) noexcept 
        : ptr_(other.ptr_), deleter_(std::move(other.deleter_)) {
        other.ptr_ = nullptr;
    }
    
    OpaquePtr& operator=(OpaquePtr&& other) noexcept {
        if (this != &other) {
            reset();
            ptr_ = other.ptr_;
            deleter_ = std::move(other.deleter_);
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    // Destructor
    ~OpaquePtr() {
        if (ptr_) {
            deleter_(ptr_);
        }
    }
    
    // No copying
    OpaquePtr(const OpaquePtr&) = delete;
    OpaquePtr& operator=(const OpaquePtr&) = delete;
    
    // Modifiers
    T* release() noexcept {
        T* result = ptr_;
        ptr_ = nullptr;
        return result;
    }
    
    void reset(T* ptr = nullptr) noexcept {
        T* old_ptr = ptr_;
        ptr_ = ptr;
        if (old_ptr) {
            deleter_(old_ptr);
        }
    }
    
    void swap(OpaquePtr& other) noexcept {
        std::swap(ptr_, other.ptr_);
        std::swap(deleter_, other.deleter_);
    }
    
    // Observers
    T* get() const noexcept { return ptr_; }
    deleter_type& get_deleter() noexcept { return deleter_; }
    const deleter_type& get_deleter() const noexcept { return deleter_; }
    
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
    
    // Factory functions
    template<typename... Args>
    static OpaquePtr make(Args&&... args) {
        return OpaquePtr(new T(std::forward<Args>(args)...));
    }
    
private:
    T* ptr_;
    [[no_unique_address]] deleter_type deleter_;
};

// Specialization for arrays
template<typename T, typename Deleter>
class OpaquePtr<T[], Deleter> {
public:
    using element_type = T;
    using deleter_type = Deleter;
    
    constexpr OpaquePtr() noexcept : ptr_(nullptr) {}
    constexpr OpaquePtr(std::nullptr_t) noexcept : ptr_(nullptr) {}
    
    template<typename U>
    explicit OpaquePtr(U* ptr) noexcept : ptr_(ptr) {}
    
    // Move semantics
    OpaquePtr(OpaquePtr&& other) noexcept 
        : ptr_(other.ptr_), deleter_(std::move(other.deleter_)) {
        other.ptr_ = nullptr;
    }
    
    OpaquePtr& operator=(OpaquePtr&& other) noexcept {
        if (this != &other) {
            reset();
            ptr_ = other.ptr_;
            deleter_ = std::move(other.deleter_);
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    ~OpaquePtr() {
        if (ptr_) {
            deleter_(ptr_);
        }
    }
    
    // Array access
    T& operator[](std::size_t index) const {
        return ptr_[index];
    }
    
    T* get() const noexcept { return ptr_; }
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
    
    void reset(T* ptr = nullptr) noexcept {
        T* old_ptr = ptr_;
        ptr_ = ptr;
        if (old_ptr) {
            deleter_(old_ptr);
        }
    }
    
    T* release() noexcept {
        T* result = ptr_;
        ptr_ = nullptr;
        return result;
    }
    
    // Factory for arrays
    static OpaquePtr make(std::size_t size) {
        return OpaquePtr(new T[size]);
    }
    
private:
    T* ptr_;
    [[no_unique_address]] deleter_type deleter_;
};

// Helper function templates
template<typename T, typename... Args>
OpaquePtr<T> make_opaque(Args&&... args) {
    return OpaquePtr<T>::make(std::forward<Args>(args)...);
}

template<typename T>
OpaquePtr<T[]> make_opaque_array(std::size_t size) {
    return OpaquePtr<T[]>::make(size);
}

// Type-safe opaque handle with compile-time checks
template<typename Tag, typename T = void>
class TypedOpaqueHandle {
public:
    TypedOpaqueHandle() : handle_(nullptr) {}
    explicit TypedOpaqueHandle(T* handle) : handle_(handle) {}
    
    ~TypedOpaqueHandle() {
        if (handle_) {
            Tag::destroy(handle_);
        }
    }
    
    // Move-only
    TypedOpaqueHandle(const TypedOpaqueHandle&) = delete;
    TypedOpaqueHandle& operator=(const TypedOpaqueHandle&) = delete;
    
    TypedOpaqueHandle(TypedOpaqueHandle&& other) noexcept : handle_(other.handle_) {
        other.handle_ = nullptr;
    }
    
    TypedOpaqueHandle& operator=(TypedOpaqueHandle&& other) noexcept {
        if (this != &other) {
            reset(other.handle_);
            other.handle_ = nullptr;
        }
        return *this;
    }
    
    T* get() const noexcept { return handle_; }
    explicit operator bool() const noexcept { return handle_ != nullptr; }
    
    void reset(T* new_handle = nullptr) {
        if (handle_ && handle_ != new_handle) {
            Tag::destroy(handle_);
        }
        handle_ = new_handle;
    }
    
    T* release() noexcept {
        T* result = handle_;
        handle_ = nullptr;
        return result;
    }
    
private:
    T* handle_;
};

// Usage example with compile-time type safety
struct FileTag {
    static void destroy(FILE* file) { if (file) fclose(file); }
};

struct SocketTag {
    static void destroy(int* socket) { if (socket) { close(*socket); delete socket; } }
};

using FileHandle = TypedOpaqueHandle<FileTag, FILE>;
using SocketHandle = TypedOpaqueHandle<SocketTag, int>;

// Factory functions
FileHandle create_file(const char* filename, const char* mode) {
    FILE* file = fopen(filename, mode);
    return FileHandle(file);
}

SocketHandle create_socket(int domain, int type, int protocol) {
    int sock = socket(domain, type, protocol);
    return sock >= 0 ? SocketHandle(new int(sock)) : SocketHandle();
}`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Reference Counting with Opaque Pointers" : "Conteo de Referencias con Punteros Opacos"}
        </SectionTitle>

        <CodeBlock language="cpp">
{`// Reference Counting Opaque Pointer Implementation
template<typename T>
class RefCountedOpaquePtr {
public:
    RefCountedOpaquePtr() : control_block_(nullptr) {}
    
    explicit RefCountedOpaquePtr(T* ptr) {
        if (ptr) {
            control_block_ = new ControlBlock(ptr);
        }
    }
    
    // Copy constructor
    RefCountedOpaquePtr(const RefCountedOpaquePtr& other) : control_block_(other.control_block_) {
        if (control_block_) {
            control_block_->add_ref();
        }
    }
    
    // Move constructor
    RefCountedOpaquePtr(RefCountedOpaquePtr&& other) noexcept : control_block_(other.control_block_) {
        other.control_block_ = nullptr;
    }
    
    // Destructor
    ~RefCountedOpaquePtr() {
        release();
    }
    
    // Assignment operators
    RefCountedOpaquePtr& operator=(const RefCountedOpaquePtr& other) {
        if (this != &other) {
            release();
            control_block_ = other.control_block_;
            if (control_block_) {
                control_block_->add_ref();
            }
        }
        return *this;
    }
    
    RefCountedOpaquePtr& operator=(RefCountedOpaquePtr&& other) noexcept {
        if (this != &other) {
            release();
            control_block_ = other.control_block_;
            other.control_block_ = nullptr;
        }
        return *this;
    }
    
    // Observers
    T* get() const noexcept {
        return control_block_ ? control_block_->get_ptr() : nullptr;
    }
    
    long use_count() const noexcept {
        return control_block_ ? control_block_->use_count() : 0;
    }
    
    bool unique() const noexcept {
        return use_count() == 1;
    }
    
    explicit operator bool() const noexcept {
        return get() != nullptr;
    }
    
    // Modifiers
    void reset(T* ptr = nullptr) {
        RefCountedOpaquePtr(ptr).swap(*this);
    }
    
    void swap(RefCountedOpaquePtr& other) noexcept {
        std::swap(control_block_, other.control_block_);
    }

private:
    struct ControlBlock {
        std::atomic<long> ref_count_;
        T* ptr_;
        
        explicit ControlBlock(T* ptr) : ref_count_(1), ptr_(ptr) {}
        
        void add_ref() noexcept {
            ref_count_.fetch_add(1, std::memory_order_relaxed);
        }
        
        void release() noexcept {
            if (ref_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                delete ptr_;
                delete this;
            }
        }
        
        long use_count() const noexcept {
            return ref_count_.load(std::memory_order_relaxed);
        }
        
        T* get_ptr() const noexcept { return ptr_; }
    };
    
    void release() {
        if (control_block_) {
            control_block_->release();
            control_block_ = nullptr;
        }
    }
    
    ControlBlock* control_block_;
};

// Thread-safe opaque pointer with intrusive reference counting
class IntrusiveRefCounted {
public:
    IntrusiveRefCounted() : ref_count_(0) {}
    virtual ~IntrusiveRefCounted() = default;
    
    void add_ref() const noexcept {
        ref_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release() const noexcept {
        if (ref_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            delete this;
        }
    }
    
    long use_count() const noexcept {
        return ref_count_.load(std::memory_order_relaxed);
    }
    
private:
    mutable std::atomic<long> ref_count_;
};

template<typename T>
class IntrusivePtr {
    static_assert(std::is_base_of_v<IntrusiveRefCounted, T>, 
                  "T must inherit from IntrusiveRefCounted");
public:
    IntrusivePtr() : ptr_(nullptr) {}
    explicit IntrusivePtr(T* ptr) : ptr_(ptr) {
        if (ptr_) ptr_->add_ref();
    }
    
    IntrusivePtr(const IntrusivePtr& other) : ptr_(other.ptr_) {
        if (ptr_) ptr_->add_ref();
    }
    
    IntrusivePtr(IntrusivePtr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    ~IntrusivePtr() {
        if (ptr_) ptr_->release();
    }
    
    IntrusivePtr& operator=(const IntrusivePtr& other) {
        if (this != &other) {
            if (other.ptr_) other.ptr_->add_ref();
            if (ptr_) ptr_->release();
            ptr_ = other.ptr_;
        }
        return *this;
    }
    
    IntrusivePtr& operator=(IntrusivePtr&& other) noexcept {
        if (this != &other) {
            if (ptr_) ptr_->release();
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    T* get() const noexcept { return ptr_; }
    T& operator*() const noexcept { return *ptr_; }
    T* operator->() const noexcept { return ptr_; }
    
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
    
    void reset(T* ptr = nullptr) {
        if (ptr) ptr->add_ref();
        if (ptr_) ptr_->release();
        ptr_ = ptr;
    }
    
    T* release() noexcept {
        T* result = ptr_;
        ptr_ = nullptr;
        return result;
    }
    
    void swap(IntrusivePtr& other) noexcept {
        std::swap(ptr_, other.ptr_);
    }
    
    long use_count() const noexcept {
        return ptr_ ? ptr_->use_count() : 0;
    }
    
private:
    T* ptr_;
};

// Example usage: Opaque resource with reference counting
class OpaqueResource : public IntrusiveRefCounted {
public:
    explicit OpaqueResource(const std::string& name) : name_(name) {
        // Resource initialization
    }
    
    const std::string& name() const { return name_; }
    
    // Opaque operations
    void process_data(const void* data, size_t size);
    std::vector<uint8_t> get_result() const;
    
private:
    std::string name_;
    // Hidden implementation details
    mutable std::mutex mutex_;
    std::vector<uint8_t> internal_data_;
};

using OpaqueResourcePtr = IntrusivePtr<OpaqueResource>;

// Factory function
OpaqueResourcePtr create_resource(const std::string& name) {
    return OpaqueResourcePtr(new OpaqueResource(name));
}`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Thread Safety and Performance Considerations" : "Consideraciones de Thread Safety y Rendimiento"}
        </SectionTitle>

        <UndefinedBehaviorWarning 
          title={lessonState.language === 'en' ? "Thread Safety Pitfalls" : "Trampas de Thread Safety"}
          description={lessonState.language === 'en' 
            ? "Concurrent access to opaque pointers requires careful synchronization. Race conditions can lead to double-free, use-after-free, or memory leaks."
            : "El acceso concurrente a punteros opacos requiere sincronización cuidadosa. Las condiciones de carrera pueden llevar a double-free, use-after-free o fugas de memoria."
          }
        />

        <CodeBlock language="cpp">
{`// Thread-Safe Opaque Pointer Implementation
template<typename T>
class ThreadSafeOpaquePtr {
public:
    ThreadSafeOpaquePtr() : ptr_(nullptr) {}
    
    explicit ThreadSafeOpaquePtr(T* ptr) : ptr_(ptr) {}
    
    ~ThreadSafeOpaquePtr() {
        std::lock_guard<std::shared_mutex> lock(mutex_);
        delete ptr_;
    }
    
    // Thread-safe copy constructor
    ThreadSafeOpaquePtr(const ThreadSafeOpaquePtr& other) {
        std::shared_lock<std::shared_mutex> lock(other.mutex_);
        if (other.ptr_) {
            ptr_ = new T(*other.ptr_);
        } else {
            ptr_ = nullptr;
        }
    }
    
    // Thread-safe assignment
    ThreadSafeOpaquePtr& operator=(const ThreadSafeOpaquePtr& other) {
        if (this != &other) {
            std::unique_lock<std::shared_mutex> lock1(mutex_, std::defer_lock);
            std::shared_lock<std::shared_mutex> lock2(other.mutex_, std::defer_lock);
            std::lock(lock1, lock2);
            
            delete ptr_;
            if (other.ptr_) {
                ptr_ = new T(*other.ptr_);
            } else {
                ptr_ = nullptr;
            }
        }
        return *this;
    }
    
    // Thread-safe operations
    template<typename Func>
    auto with_read_lock(Func&& func) const -> decltype(func(ptr_)) {
        std::shared_lock<std::shared_mutex> lock(mutex_);
        return func(ptr_);
    }
    
    template<typename Func>
    auto with_write_lock(Func&& func) -> decltype(func(ptr_)) {
        std::lock_guard<std::shared_mutex> lock(mutex_);
        return func(ptr_);
    }
    
    // Safe observers
    bool is_null() const {
        std::shared_lock<std::shared_mutex> lock(mutex_);
        return ptr_ == nullptr;
    }
    
    // Safe modifiers
    void reset(T* new_ptr = nullptr) {
        std::lock_guard<std::shared_mutex> lock(mutex_);
        delete ptr_;
        ptr_ = new_ptr;
    }
    
private:
    T* ptr_;
    mutable std::shared_mutex mutex_;
};

// Lock-free atomic opaque pointer for high-performance scenarios
template<typename T>
class AtomicOpaquePtr {
public:
    AtomicOpaquePtr() : ptr_(nullptr) {}
    explicit AtomicOpaquePtr(T* ptr) : ptr_(ptr) {}
    
    ~AtomicOpaquePtr() {
        delete ptr_.load();
    }
    
    // Atomic operations
    T* load(std::memory_order order = std::memory_order_seq_cst) const noexcept {
        return ptr_.load(order);
    }
    
    void store(T* desired, std::memory_order order = std::memory_order_seq_cst) noexcept {
        T* old = ptr_.exchange(desired, order);
        delete old;
    }
    
    T* exchange(T* desired, std::memory_order order = std::memory_order_seq_cst) noexcept {
        return ptr_.exchange(desired, order);
    }
    
    bool compare_exchange_weak(T*& expected, T* desired,
                              std::memory_order success = std::memory_order_seq_cst,
                              std::memory_order failure = std::memory_order_seq_cst) noexcept {
        return ptr_.compare_exchange_weak(expected, desired, success, failure);
    }
    
    bool compare_exchange_strong(T*& expected, T* desired,
                                std::memory_order success = std::memory_order_seq_cst,
                                std::memory_order failure = std::memory_order_seq_cst) noexcept {
        return ptr_.compare_exchange_strong(expected, desired, success, failure);
    }
    
    // Safe replacement with proper cleanup
    bool try_replace(T* expected, T* desired) noexcept {
        if (ptr_.compare_exchange_strong(expected, desired)) {
            delete expected;
            return true;
        }
        return false;
    }
    
private:
    std::atomic<T*> ptr_;
};

// Performance-optimized opaque pointer pool
template<typename T, size_t PoolSize = 1024>
class PooledOpaquePtr {
public:
    static_assert(PoolSize > 0, "Pool size must be positive");
    
    PooledOpaquePtr() : ptr_(nullptr), pool_index_(-1) {}
    
    static PooledOpaquePtr create() {
        return PooledOpaquePtr(allocate_from_pool());
    }
    
    ~PooledOpaquePtr() {
        if (ptr_ && pool_index_ >= 0) {
            return_to_pool(ptr_, pool_index_);
        } else {
            delete ptr_;
        }
    }
    
    // Move-only for performance
    PooledOpaquePtr(const PooledOpaquePtr&) = delete;
    PooledOpaquePtr& operator=(const PooledOpaquePtr&) = delete;
    
    PooledOpaquePtr(PooledOpaquePtr&& other) noexcept 
        : ptr_(other.ptr_), pool_index_(other.pool_index_) {
        other.ptr_ = nullptr;
        other.pool_index_ = -1;
    }
    
    PooledOpaquePtr& operator=(PooledOpaquePtr&& other) noexcept {
        if (this != &other) {
            reset();
            ptr_ = other.ptr_;
            pool_index_ = other.pool_index_;
            other.ptr_ = nullptr;
            other.pool_index_ = -1;
        }
        return *this;
    }
    
    T* get() const noexcept { return ptr_; }
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
    
    void reset() {
        if (ptr_) {
            if (pool_index_ >= 0) {
                return_to_pool(ptr_, pool_index_);
            } else {
                delete ptr_;
            }
            ptr_ = nullptr;
            pool_index_ = -1;
        }
    }
    
    // Pool statistics
    static size_t available_count() {
        return get_pool().available_count();
    }
    
    static size_t total_allocations() {
        return get_pool().total_allocations();
    }

private:
    struct PoolEntry {
        alignas(T) char storage[sizeof(T)];
        bool is_free;
        
        T* as_ptr() { return reinterpret_cast<T*>(storage); }
    };
    
    struct Pool {
        std::array<PoolEntry, PoolSize> entries;
        std::mutex mutex;
        size_t next_free_index = 0;
        size_t allocations = 0;
        
        size_t available_count() const {
            std::lock_guard<std::mutex> lock(mutex);
            return std::count_if(entries.begin(), entries.end(),
                               [](const PoolEntry& entry) { return entry.is_free; });
        }
        
        size_t total_allocations() const {
            std::lock_guard<std::mutex> lock(mutex);
            return allocations;
        }
    };
    
    static Pool& get_pool() {
        static Pool pool;
        return pool;
    }
    
    static std::pair<T*, int> allocate_from_pool() {
        Pool& pool = get_pool();
        std::lock_guard<std::mutex> lock(pool.mutex);
        
        // Find free slot
        for (size_t i = 0; i < PoolSize; ++i) {
            size_t index = (pool.next_free_index + i) % PoolSize;
            if (pool.entries[index].is_free) {
                pool.entries[index].is_free = false;
                pool.next_free_index = (index + 1) % PoolSize;
                pool.allocations++;
                
                T* ptr = pool.entries[index].as_ptr();
                new (ptr) T();  // Placement new
                return {ptr, static_cast<int>(index)};
            }
        }
        
        // Pool exhausted, use regular allocation
        return {new T(), -1};
    }
    
    static void return_to_pool(T* ptr, int index) {
        if (index < 0 || index >= PoolSize) {
            delete ptr;
            return;
        }
        
        Pool& pool = get_pool();
        std::lock_guard<std::mutex> lock(pool.mutex);
        
        ptr->~T();  // Explicit destructor call
        pool.entries[index].is_free = true;
    }
    
    explicit PooledOpaquePtr(std::pair<T*, int> allocation) 
        : ptr_(allocation.first), pool_index_(allocation.second) {}
    
    T* ptr_;
    int pool_index_;
};`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Real-World Applications" : "Aplicaciones del Mundo Real"}
        </SectionTitle>

        <CodeBlock language="cpp">
{`// Operating System Driver Interface
// Example: USB device driver with opaque handles
extern "C" {

typedef struct usb_device* usb_device_handle_t;
typedef struct usb_endpoint* usb_endpoint_handle_t;
typedef struct usb_transfer* usb_transfer_handle_t;

// Device management
usb_device_handle_t usb_device_open(uint16_t vendor_id, uint16_t product_id);
void usb_device_close(usb_device_handle_t device);
int usb_device_reset(usb_device_handle_t device);

// Endpoint operations
usb_endpoint_handle_t usb_get_endpoint(usb_device_handle_t device, uint8_t ep_addr);
int usb_endpoint_set_timeout(usb_endpoint_handle_t endpoint, uint32_t timeout_ms);

// Transfer operations
usb_transfer_handle_t usb_create_transfer(usb_endpoint_handle_t endpoint, 
                                         void* buffer, size_t length);
int usb_submit_transfer(usb_transfer_handle_t transfer);
int usb_cancel_transfer(usb_transfer_handle_t transfer);
void usb_destroy_transfer(usb_transfer_handle_t transfer);

} // extern "C"

// Graphics Library - Vulkan-style opaque handles
namespace graphics {

class Device;
class Buffer;
class Image;
class Pipeline;

using DeviceHandle = std::shared_ptr<Device>;
using BufferHandle = std::shared_ptr<Buffer>;
using ImageHandle = std::shared_ptr<Image>;
using PipelineHandle = std::shared_ptr<Pipeline>;

class RenderingAPI {
public:
    // Device creation
    static DeviceHandle create_device(const DeviceDesc& desc);
    
    // Resource creation
    static BufferHandle create_buffer(DeviceHandle device, const BufferDesc& desc);
    static ImageHandle create_image(DeviceHandle device, const ImageDesc& desc);
    static PipelineHandle create_pipeline(DeviceHandle device, const PipelineDesc& desc);
    
    // Command recording
    class CommandBuffer {
    public:
        void bind_pipeline(PipelineHandle pipeline);
        void bind_vertex_buffer(BufferHandle buffer, uint32_t binding);
        void bind_index_buffer(BufferHandle buffer);
        void draw_indexed(uint32_t index_count);
        
    private:
        class Impl;
        std::unique_ptr<Impl> impl_;
    };
    
    static std::unique_ptr<CommandBuffer> create_command_buffer(DeviceHandle device);
};

} // namespace graphics

// Database Connection Pool with Opaque Handles
class DatabaseConnectionPool {
public:
    class Connection; // Opaque forward declaration
    
    using ConnectionHandle = std::unique_ptr<Connection, void(*)(Connection*)>;
    
    explicit DatabaseConnectionPool(const std::string& connection_string, 
                                   size_t pool_size = 10);
    ~DatabaseConnectionPool();
    
    // Get connection from pool (blocks if none available)
    ConnectionHandle acquire_connection(std::chrono::milliseconds timeout);
    
    // Connection operations (through opaque interface)
    static bool execute_query(const ConnectionHandle& conn, const std::string& sql);
    static std::optional<ResultSet> fetch_results(const ConnectionHandle& conn);
    static bool begin_transaction(const ConnectionHandle& conn);
    static bool commit_transaction(const ConnectionHandle& conn);
    static bool rollback_transaction(const ConnectionHandle& conn);
    
    // Pool statistics
    size_t available_connections() const;
    size_t total_connections() const;
    size_t active_connections() const;
    
private:
    class Impl;
    std::unique_ptr<Impl> impl_;
    
    static void return_connection(Connection* conn);
};

// Audio Processing Library - C API with opaque pointers
extern "C" {

typedef struct audio_engine* audio_engine_t;
typedef struct audio_source* audio_source_t;
typedef struct audio_effect* audio_effect_t;
typedef struct audio_buffer* audio_buffer_t;

// Engine lifecycle
audio_engine_t audio_create_engine(int sample_rate, int buffer_size);
void audio_destroy_engine(audio_engine_t engine);
int audio_start_engine(audio_engine_t engine);
int audio_stop_engine(audio_engine_t engine);

// Source management
audio_source_t audio_create_source(audio_engine_t engine, const char* filename);
void audio_destroy_source(audio_source_t source);
int audio_play_source(audio_source_t source);
int audio_pause_source(audio_source_t source);
int audio_stop_source(audio_source_t source);

// Effect processing
audio_effect_t audio_create_reverb_effect(float room_size, float damping);
audio_effect_t audio_create_delay_effect(float delay_ms, float feedback);
void audio_destroy_effect(audio_effect_t effect);
int audio_apply_effect(audio_source_t source, audio_effect_t effect);

// Real-time buffer processing
audio_buffer_t audio_get_input_buffer(audio_engine_t engine);
audio_buffer_t audio_get_output_buffer(audio_engine_t engine);
int audio_process_buffer(audio_buffer_t input, audio_buffer_t output,
                        audio_effect_t* effects, int effect_count);

} // extern "C"

// Network Protocol Implementation - Modern C++
namespace network {

class TcpConnection;
class UdpSocket;
class HttpRequest;
class WebSocket;

// Type-safe opaque handles with RAII
template<typename T>
using NetworkHandle = std::unique_ptr<T, void(*)(T*)>;

using TcpHandle = NetworkHandle<TcpConnection>;
using UdpHandle = NetworkHandle<UdpSocket>;
using HttpHandle = NetworkHandle<HttpRequest>;
using WebSocketHandle = NetworkHandle<WebSocket>;

class NetworkManager {
public:
    // Factory methods
    static TcpHandle create_tcp_connection(const std::string& host, uint16_t port);
    static UdpHandle create_udp_socket(uint16_t local_port = 0);
    static HttpHandle create_http_request(const std::string& url);
    static WebSocketHandle create_websocket(const std::string& url);
    
    // Async operations with callbacks
    template<typename Handle, typename Callback>
    static void async_send(const Handle& handle, const void* data, size_t size, Callback&& cb);
    
    template<typename Handle, typename Callback>
    static void async_receive(const Handle& handle, void* buffer, size_t max_size, Callback&& cb);
    
    // Event loop integration
    static void run_event_loop();
    static void stop_event_loop();
    
private:
    // Deletion functions for handles
    static void delete_tcp_connection(TcpConnection* conn);
    static void delete_udp_socket(UdpSocket* socket);
    static void delete_http_request(HttpRequest* request);
    static void delete_websocket(WebSocket* ws);
};

} // namespace network`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Knowledge Assessment" : "Evaluación de Conocimientos"}
        </SectionTitle>

        {!lessonState.showQuiz ? (
          <Button onClick={() => setLessonState(prev => ({ ...prev, showQuiz: true }))}>
            {lessonState.language === 'en' ? '🧠 Start Quiz' : '🧠 Comenzar Quiz'}
          </Button>
        ) : (
          <div>
            {quizQuestions.map((question, qIndex) => (
              <div key={qIndex} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h4>{question.question}</h4>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} style={{ margin: '10px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={oIndex}
                        checked={selectedAnswers[qIndex] === oIndex}
                        onChange={() => handleQuizAnswer(qIndex, oIndex)}
                        style={{ marginRight: '10px' }}
                      />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            ))}
            
            {selectedAnswers.length === quizQuestions.length && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button 
                  onClick={() => {
                    const score = calculateQuizScore();
                    setLessonState(prev => ({ ...prev, quizScore: score }));
                  }}
                >
                  {lessonState.language === 'en' ? '📊 Calculate Score' : '📊 Calcular Puntuación'}
                </Button>
                
                {lessonState.quizScore > 0 && (
                  <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                    <h3>
                      {lessonState.language === 'en' ? 'Quiz Results' : 'Resultados del Quiz'}: {lessonState.quizScore}%
                    </h3>
                    <p>
                      {lessonState.quizScore >= 75 
                        ? (lessonState.language === 'en' ? '🎉 Excellent! You master opaque pointer techniques!' : '🎉 ¡Excelente! ¡Dominas las técnicas de punteros opacos!')
                        : lessonState.quizScore >= 50
                        ? (lessonState.language === 'en' ? '👍 Good! Review template-based and thread-safe implementations.' : '👍 ¡Bien! Revisa las implementaciones basadas en templates y thread-safe.')
                        : (lessonState.language === 'en' ? '📚 Study more about type safety and API design with opaque pointers.' : '📚 Estudia más sobre seguridad de tipos y diseño de API con punteros opacos.')
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Best Practices Summary" : "Resumen de Mejores Prácticas"}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #e9ecef' 
        }}>
          <h4>{lessonState.language === 'en' ? "Key Takeaways:" : "Puntos Clave:"}</h4>
          <ul>
            <li>
              {lessonState.language === 'en' 
                ? "Use forward declarations and void* for C-style APIs requiring maximum compatibility"
                : "Usar declaraciones adelantadas y void* para APIs estilo C que requieren máxima compatibilidad"
              }
            </li>
            <li>
              {lessonState.language === 'en'
                ? "Implement type-safe opaque pointers with templates and RAII for modern C++"
                : "Implementar punteros opacos type-safe con templates y RAII para C++ moderno"
              }
            </li>
            <li>
              {lessonState.language === 'en'
                ? "Always provide proper cleanup functions and handle error cases gracefully"
                : "Siempre proporcionar funciones de limpieza adecuadas y manejar casos de error elegantemente"
              }
            </li>
            <li>
              {lessonState.language === 'en'
                ? "Use magic numbers or validation for runtime type checking in C APIs"
                : "Usar números mágicos o validación para verificación de tipos en tiempo de ejecución en APIs de C"
              }
            </li>
            <li>
              {lessonState.language === 'en'
                ? "Consider thread safety requirements and implement appropriate synchronization"
                : "Considerar requerimientos de thread safety e implementar sincronización apropiada"
              }
            </li>
            <li>
              {lessonState.language === 'en'
                ? "Profile performance overhead of indirection and optimize hot paths when necessary"
                : "Perfilar la sobrecarga de rendimiento de indirección y optimizar rutas críticas cuando sea necesario"
              }
            </li>
          </ul>
        </div>
      </Section>

      <AccessibilityAnnouncer 
        message={lessonState.language === 'en' 
          ? `Current scenario: ${lessonState.scenario}. Animation ${lessonState.isAnimating ? 'running' : 'paused'}.`
          : `Escenario actual: ${lessonState.scenario}. Animación ${lessonState.isAnimating ? 'ejecutándose' : 'pausada'}.`
        }
      />

      <PerformanceMonitor />
    </LessonLayout>
  );
}