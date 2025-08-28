/**
 * Lesson 93: Advanced Pimpl Idiom - Expert-Level Implementation Patterns
 * Advanced techniques for Pointer to Implementation pattern including modern C++, performance optimization, and real-world applications
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

interface PimplAdvancedState {
  language: 'en' | 'es';
  scenario: 'basic_pimpl' | 'template_pimpl' | 'fast_pimpl' | 'exception_safe' | 'move_optimized' | 'real_world';
  isAnimating: boolean;
  compilationTime: number;
  binaryCompatibility: number;
  performanceOverhead: number;
  memoryUsage: number;
  showQuiz: boolean;
  quizScore: number;
}

const AdvancedPimplVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  language: 'en' | 'es';
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, language, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const interfaceRef = useRef<Mesh>(null);
  const implRef = useRef<Mesh>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.01;
    
    // Interface module (always visible, clean)
    if (interfaceRef.current) {
      interfaceRef.current.rotation.y = Math.sin(animationRef.current * 0.5) * 0.1;
      interfaceRef.current.position.y = Math.sin(animationRef.current * 2) * 0.05;
    }

    // Implementation module (hidden complexity)
    if (implRef.current) {
      implRef.current.rotation.y = animationRef.current * 0.3;
      implRef.current.scale.setScalar(1 + Math.sin(animationRef.current * 3) * 0.08);
    }

    // Update metrics based on scenario
    switch (scenario) {
      case 'basic_pimpl':
        onMetrics({
          compilationTime: Math.floor(70 + Math.sin(animationRef.current * 1.5) * 20),
          binaryCompatibility: 95,
          performanceOverhead: Math.floor(8 + Math.cos(animationRef.current * 2) * 3),
          memoryUsage: Math.floor(110 + Math.sin(animationRef.current) * 10)
        });
        break;
      case 'template_pimpl':
        onMetrics({
          compilationTime: Math.floor(40 + Math.sin(animationRef.current * 2) * 15),
          binaryCompatibility: 90,
          performanceOverhead: Math.floor(12 + Math.cos(animationRef.current * 1.8) * 4),
          memoryUsage: Math.floor(105 + Math.sin(animationRef.current * 1.2) * 8)
        });
        break;
      case 'fast_pimpl':
        onMetrics({
          compilationTime: Math.floor(85 + Math.sin(animationRef.current * 1.2) * 10),
          binaryCompatibility: 80,
          performanceOverhead: Math.floor(3 + Math.cos(animationRef.current * 3) * 2),
          memoryUsage: Math.floor(95 + Math.sin(animationRef.current * 2) * 5)
        });
        break;
      case 'exception_safe':
        onMetrics({
          compilationTime: Math.floor(75 + Math.sin(animationRef.current * 1.8) * 15),
          binaryCompatibility: 98,
          performanceOverhead: Math.floor(6 + Math.cos(animationRef.current * 2.5) * 3),
          memoryUsage: Math.floor(108 + Math.sin(animationRef.current * 1.5) * 12)
        });
        break;
      case 'move_optimized':
        onMetrics({
          compilationTime: Math.floor(80 + Math.sin(animationRef.current * 2.2) * 12),
          binaryCompatibility: 92,
          performanceOverhead: Math.floor(2 + Math.cos(animationRef.current * 4) * 1),
          memoryUsage: Math.floor(88 + Math.sin(animationRef.current * 2.8) * 8)
        });
        break;
      case 'real_world':
        onMetrics({
          compilationTime: Math.floor(60 + Math.sin(animationRef.current * 1.6) * 25),
          binaryCompatibility: 96,
          performanceOverhead: Math.floor(5 + Math.cos(animationRef.current * 2.2) * 4),
          memoryUsage: Math.floor(100 + Math.sin(animationRef.current * 1.8) * 15)
        });
        break;
    }
  });

  const renderInterfaceModule = () => (
    <mesh ref={interfaceRef} position={[-2, 1, 0]}>
      <boxGeometry args={[1.5, 0.8, 0.3]} />
      <meshStandardMaterial 
        color="#4CAF50" 
        transparent 
        opacity={0.9}
        emissive="#4CAF50"
        emissiveIntensity={0.1}
      />
    </mesh>
  );

  const renderImplementationModule = () => (
    <mesh ref={implRef} position={[2, -1, 0]}>
      <boxGeometry args={[2, 1.2, 0.4]} />
      <meshStandardMaterial 
        color="#2196F3" 
        transparent 
        opacity={0.7}
        emissive="#2196F3"
        emissiveIntensity={0.2}
      />
    </mesh>
  );

  const renderDependencies = () => {
    const dependencies = [
      { pos: [2, -2.5, -0.5], color: '#FF9800' },
      { pos: [3, -2.8, 0], color: '#9C27B0' },
      { pos: [1, -2.8, 0.5], color: '#E91E63' },
      { pos: [2.5, -3.2, 0], color: '#795548' }
    ];

    return dependencies.map((dep, index) => (
      <mesh key={index} position={dep.pos as [number, number, number]}>
        <boxGeometry args={[0.8, 0.5, 0.2]} />
        <meshStandardMaterial 
          color={dep.color} 
          transparent 
          opacity={0.6}
        />
      </mesh>
    ));
  };

  const renderConnectionLine = () => (
    <mesh position={[0, 0, 0]} rotation={[0, 0, -0.3]}>
      <cylinderGeometry args={[0.02, 0.02, 3]} />
      <meshStandardMaterial color="#FFC107" emissive="#FFC107" emissiveIntensity={0.3} />
    </mesh>
  );

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#4CAF50" />
      
      {renderInterfaceModule()}
      {renderImplementationModule()}
      {renderDependencies()}
      {renderConnectionLine()}

      {/* Text labels */}
      <mesh position={[-2, 1.8, 0]}>
        <planeGeometry args={[2, 0.3]} />
        <meshBasicMaterial color="transparent" />
      </mesh>
      
      <mesh position={[2, -0.2, 0]}>
        <planeGeometry args={[2.5, 0.3]} />
        <meshBasicMaterial color="transparent" />
      </mesh>
    </group>
  );
};

export default function Lesson93_PimplIdiom() {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<PimplAdvancedState>({
    language: state.language,
    scenario: 'basic_pimpl',
    isAnimating: false,
    compilationTime: 100,
    binaryCompatibility: 95,
    performanceOverhead: 5,
    memoryUsage: 100,
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
      compilationTime: metrics.compilationTime,
      binaryCompatibility: metrics.binaryCompatibility,
      performanceOverhead: metrics.performanceOverhead,
      memoryUsage: metrics.memoryUsage
    }));
  }, []);

  const learningObjectives = useMemo(() => [
    lessonState.language === 'en' 
      ? "Master advanced Pimpl patterns and template implementations"
      : "Dominar patrones Pimpl avanzados e implementaciones con templates",
    lessonState.language === 'en'
      ? "Optimize performance with Fast Pimpl and move semantics" 
      : "Optimizar rendimiento con Fast Pimpl y semántica de movimiento",
    lessonState.language === 'en'
      ? "Implement exception-safe Pimpl with proper resource management"
      : "Implementar Pimpl seguro ante excepciones con manejo adecuado de recursos",
    lessonState.language === 'en'
      ? "Apply Pimpl in real-world scenarios: Qt, game engines, libraries"
      : "Aplicar Pimpl en escenarios reales: Qt, motores de juegos, librerías"
  ], [lessonState.language]);

  const quizQuestions = [
    {
      question: lessonState.language === 'en' 
        ? "What is the main advantage of Template Pimpl over traditional Pimpl?"
        : "¿Cuál es la principal ventaja del Template Pimpl sobre el Pimpl tradicional?",
      options: [
        lessonState.language === 'en' ? "Better type safety" : "Mejor seguridad de tipos",
        lessonState.language === 'en' ? "Zero-cost abstractions" : "Abstracciones de costo cero",
        lessonState.language === 'en' ? "Compile-time polymorphism" : "Polimorfismo en tiempo de compilación",
        lessonState.language === 'en' ? "All of the above" : "Todas las anteriores"
      ],
      correct: 3
    },
    {
      question: lessonState.language === 'en'
        ? "In Fast Pimpl, what data should remain in the interface class?"
        : "En Fast Pimpl, ¿qué datos deben permanecer en la clase interface?",
      options: [
        lessonState.language === 'en' ? "All member variables" : "Todas las variables miembro",
        lessonState.language === 'en' ? "Frequently accessed, small data" : "Datos pequeños y frecuentemente accedidos", 
        lessonState.language === 'en' ? "Only static members" : "Solo miembros estáticos",
        lessonState.language === 'en' ? "Configuration data only" : "Solo datos de configuración"
      ],
      correct: 1
    },
    {
      question: lessonState.language === 'en'
        ? "Which smart pointer is best for exception-safe Pimpl?"
        : "¿Qué smart pointer es mejor para Pimpl seguro ante excepciones?",
      options: [
        "shared_ptr",
        "unique_ptr", 
        "weak_ptr",
        lessonState.language === 'en' ? "Raw pointer" : "Puntero crudo"
      ],
      correct: 1
    },
    {
      question: lessonState.language === 'en'
        ? "What is the 'Rule of Five' requirement for Pimpl classes?"
        : "¿Cuál es el requerimiento de la 'Regla de Cinco' para clases Pimpl?",
      options: [
        lessonState.language === 'en' ? "Only destructor needs definition" : "Solo el destructor necesita definición",
        lessonState.language === 'en' ? "All five special functions must be user-defined" : "Las cinco funciones especiales deben definirse por el usuario",
        lessonState.language === 'en' ? "Destructor and move operations in .cpp file" : "Destructor y operaciones de movimiento en archivo .cpp",
        lessonState.language === 'en' ? "No special requirements" : "No hay requerimientos especiales"
      ],
      correct: 2
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
      title={lessonState.language === 'en' ? "🚀 Lesson 93: Advanced Pimpl Idiom" : "🚀 Lección 93: Pimpl Idiom Avanzado"}
      language={lessonState.language}
    >
      <LearningObjectives 
        objectives={learningObjectives}
        language={lessonState.language}
      />

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Template Pimpl: Zero-Cost Abstractions" : "Template Pimpl: Abstracciones de Costo Cero"}
        </SectionTitle>
        
        <p>
          {lessonState.language === 'en' 
            ? "Template Pimpl combines the benefits of compile-time polymorphism with the Pimpl pattern, providing better optimization opportunities while maintaining clean interfaces."
            : "Template Pimpl combina los beneficios del polimorfismo en tiempo de compilación con el patrón Pimpl, proporcionando mejores oportunidades de optimización mientras mantiene interfaces limpias."
          }
        </p>

        <CodeBlock language="cpp">
{`// Template Pimpl: Modern C++ approach
template<typename T>
class TemplateWidget {
public:
    // Perfect forwarding constructor
    template<typename... Args>
    explicit TemplateWidget(Args&&... args);
    
    ~TemplateWidget();
    
    // Move-only semantics for optimal performance
    TemplateWidget(TemplateWidget&&) noexcept;
    TemplateWidget& operator=(TemplateWidget&&) noexcept;
    
    // Template interface methods
    template<typename U>
    auto process(U&& data) -> decltype(impl_->process(std::forward<U>(data)));
    
    // CRTP-style interface
    T& derived() { return static_cast<T&>(*this); }
    const T& derived() const { return static_cast<const T&>(*this); }

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// Specialization for specific types
template<>
class TemplateWidget<GraphicsEngine> {
public:
    void render(const Scene& scene);
    void setShader(ShaderProgram&& program);
    
    // GPU-specific optimizations
    void bindBuffers() noexcept;
    
private:
    class GraphicsImpl;
    std::unique_ptr<GraphicsImpl> impl_;
};`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Fast Pimpl: Performance-Critical Implementation" : "Fast Pimpl: Implementación Crítica en Rendimiento"}
        </SectionTitle>

        <p>
          {lessonState.language === 'en'
            ? "Fast Pimpl optimizes for hot paths by keeping frequently accessed data in the interface while hiding complex, rarely-used functionality."
            : "Fast Pimpl optimiza para rutas críticas manteniendo datos frecuentemente accedidos en la interfaz mientras oculta funcionalidad compleja y raramente usada."
          }
        </p>

        <CodeBlock language="cpp">
{`// Fast Pimpl: Hybrid approach for performance
class FastWidget {
public:
    FastWidget() : id_(next_id_++), is_active_(true) {
        impl_ = std::make_unique<Impl>();
    }
    
    ~FastWidget();
    
    // Hot path: No indirection - inline access
    [[nodiscard]] constexpr uint32_t id() const noexcept { 
        return id_; 
    }
    
    [[nodiscard]] constexpr bool is_active() const noexcept { 
        return is_active_; 
    }
    
    void set_active(bool active) noexcept { 
        is_active_ = active; 
    }
    
    // Cold path: Complex operations through Pimpl
    void configure(const ComplexConfig& config);
    void process_heavy_data(std::span<const uint8_t> data);
    void save_state() const;
    
    // Performance monitoring
    struct Metrics {
        uint64_t operations_count;
        std::chrono::nanoseconds total_time;
        double average_latency;
    };
    
    [[nodiscard]] Metrics get_metrics() const;

private:
    // Hot data: Direct access for performance
    uint32_t id_;
    bool is_active_;
    static std::atomic<uint32_t> next_id_;
    
    // Cold data: Hidden implementation
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// Implementation in .cpp
class FastWidget::Impl {
public:
    ComplexConfig config_;
    std::vector<uint8_t> buffer_;
    std::unordered_map<std::string, std::string> metadata_;
    boost::circular_buffer<Metrics> metrics_history_{100};
    
    // Heavy dependencies only in implementation
    std::unique_ptr<DatabaseConnection> db_;
    std::shared_ptr<Logger> logger_;
    NetworkClient network_client_;
};`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Interactive Visualization" : "Visualización Interactiva"}
        </SectionTitle>

        <InteractiveSection>
          <ButtonGroup>
            <Button 
              onClick={() => handleScenarioChange('basic_pimpl')}
              variant={lessonState.scenario === 'basic_pimpl' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Basic Pimpl" : "Pimpl Básico"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('template_pimpl')}
              variant={lessonState.scenario === 'template_pimpl' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Template Pimpl" : "Template Pimpl"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('fast_pimpl')}
              variant={lessonState.scenario === 'fast_pimpl' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Fast Pimpl" : "Fast Pimpl"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('exception_safe')}
              variant={lessonState.scenario === 'exception_safe' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Exception Safe" : "Seguro ante Excepciones"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('move_optimized')}
              variant={lessonState.scenario === 'move_optimized' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Move Optimized" : "Optimizado para Movimiento"}
            </Button>
            <Button 
              onClick={() => handleScenarioChange('real_world')}
              variant={lessonState.scenario === 'real_world' ? 'primary' : 'secondary'}
            >
              {lessonState.language === 'en' ? "Real World" : "Mundo Real"}
            </Button>
          </ButtonGroup>

          <div style={{ height: '400px', margin: '20px 0', border: '2px solid #4CAF50', borderRadius: '8px' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
              <AdvancedPimplVisualization 
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
                name: lessonState.language === 'en' ? 'Compilation Time' : 'Tiempo de Compilación', 
                value: lessonState.compilationTime,
                unit: '%'
              },
              { 
                name: lessonState.language === 'en' ? 'Binary Compatibility' : 'Compatibilidad Binaria', 
                value: lessonState.binaryCompatibility,
                unit: '%' 
              },
              { 
                name: lessonState.language === 'en' ? 'Performance Overhead' : 'Sobrecarga de Rendimiento', 
                value: lessonState.performanceOverhead,
                unit: '%' 
              },
              { 
                name: lessonState.language === 'en' ? 'Memory Usage' : 'Uso de Memoria', 
                value: lessonState.memoryUsage,
                unit: '%' 
              }
            ]}
            language={lessonState.language}
          />
        </InteractiveSection>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Exception-Safe Pimpl Implementation" : "Implementación Pimpl Segura ante Excepciones"}
        </SectionTitle>

        <p>
          {lessonState.language === 'en'
            ? "Exception safety is critical in Pimpl implementations. We need to ensure proper cleanup and strong exception safety guarantees."
            : "La seguridad ante excepciones es crítica en implementaciones Pimpl. Necesitamos asegurar limpieza adecuada y garantías fuertes de seguridad ante excepciones."
          }
        </p>

        <CodeBlock language="cpp">
{`// Exception-safe Pimpl with RAII and strong guarantees
class ExceptionSafeWidget {
public:
    ExceptionSafeWidget() try 
        : impl_(std::make_unique<Impl>()) {
        // Constructor initialization
        impl_->initialize();
    } catch (...) {
        // Cleanup in case of exception
        // unique_ptr automatically cleans up
        throw; // Re-throw
    }
    
    // Strong exception safety guarantee
    ExceptionSafeWidget(const ExceptionSafeWidget& other) 
        : impl_(std::make_unique<Impl>()) {
        
        // Copy could throw - use temporary
        auto temp_impl = std::make_unique<Impl>(*other.impl_);
        
        // If we get here, copy succeeded
        impl_ = std::move(temp_impl);
    }
    
    ExceptionSafeWidget& operator=(const ExceptionSafeWidget& other) {
        if (this != &other) {
            // Create new instance (could throw)
            auto new_impl = std::make_unique<Impl>(*other.impl_);
            
            // If we get here, no exception occurred
            // Now we can safely replace
            impl_ = std::move(new_impl);
        }
        return *this;
    }
    
    // Move operations are noexcept
    ExceptionSafeWidget(ExceptionSafeWidget&&) noexcept = default;
    ExceptionSafeWidget& operator=(ExceptionSafeWidget&&) noexcept = default;
    
    // Destructor must be defined in .cpp where Impl is complete
    ~ExceptionSafeWidget();
    
    // Operations with exception safety levels
    void safe_operation() noexcept;           // No-throw guarantee
    void basic_operation();                   // Basic guarantee  
    void strong_operation();                  // Strong guarantee
    
    // RAII scope guards for complex operations
    class OperationGuard {
    public:
        explicit OperationGuard(ExceptionSafeWidget* widget) 
            : widget_(widget), committed_(false) {
            widget_->begin_operation();
        }
        
        ~OperationGuard() {
            if (!committed_) {
                widget_->rollback_operation();
            }
        }
        
        void commit() noexcept { committed_ = true; }
        
    private:
        ExceptionSafeWidget* widget_;
        bool committed_;
    };

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
    
    void begin_operation();
    void rollback_operation() noexcept;
};

// Usage example with exception safety
void process_data(ExceptionSafeWidget& widget, const std::vector<Data>& data) {
    ExceptionSafeWidget::OperationGuard guard(&widget);
    
    // Complex processing that might throw
    for (const auto& item : data) {
        widget.strong_operation(); // Could throw
    }
    
    // If we get here, all operations succeeded
    guard.commit();
    // Destructor won't rollback now
}`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Move Semantics Optimization" : "Optimización de Semántica de Movimiento"}
        </SectionTitle>

        <CodeBlock language="cpp">
{`// Move-optimized Pimpl with perfect forwarding
class MoveOptimizedWidget {
public:
    // Perfect forwarding constructor
    template<typename... Args>
    explicit MoveOptimizedWidget(Args&&... args) 
        : impl_(std::make_unique<Impl>(std::forward<Args>(args)...)) {}
    
    // Move constructor - very fast
    MoveOptimizedWidget(MoveOptimizedWidget&&) noexcept = default;
    
    // Move assignment with self-assignment check
    MoveOptimizedWidget& operator=(MoveOptimizedWidget&& other) noexcept {
        if (this != &other) {
            impl_ = std::move(other.impl_);
            // other.impl_ is now nullptr - safe
        }
        return *this;
    }
    
    // Deleted copy operations for move-only semantics
    MoveOptimizedWidget(const MoveOptimizedWidget&) = delete;
    MoveOptimizedWidget& operator=(const MoveOptimizedWidget&) = delete;
    
    ~MoveOptimizedWidget();
    
    // Move-aware factory methods
    static MoveOptimizedWidget create_from_config(ConfigData&& config) {
        return MoveOptimizedWidget(std::move(config));
    }
    
    static std::unique_ptr<MoveOptimizedWidget> create_unique(ConfigData&& config) {
        return std::make_unique<MoveOptimizedWidget>(std::move(config));
    }
    
    // Move-optimized operations
    void set_data(std::vector<uint8_t>&& data);
    void add_resource(std::unique_ptr<Resource> resource);
    
    // Return by move when appropriate
    std::vector<Result> extract_results() &&;  // Rvalue ref-qualified

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// Advanced: Custom deleter for pool allocation
class PoolAllocatedWidget {
    struct PoolDeleter {
        void operator()(Impl* impl) const noexcept;
    };
    
public:
    using ImplPtr = std::unique_ptr<Impl, PoolDeleter>;
    
    PoolAllocatedWidget() : impl_(allocate_from_pool()) {}
    ~PoolAllocatedWidget(); // Must be in .cpp
    
    // Move operations
    PoolAllocatedWidget(PoolAllocatedWidget&&) noexcept = default;
    PoolAllocatedWidget& operator=(PoolAllocatedWidget&&) noexcept = default;

private:
    class Impl;
    ImplPtr impl_;
    
    static ImplPtr allocate_from_pool();
};`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Real-World Applications" : "Aplicaciones del Mundo Real"}
        </SectionTitle>

        <p>
          {lessonState.language === 'en'
            ? "Pimpl is widely used in production systems. Let's examine implementations from Qt, game engines, and major libraries."
            : "Pimpl es ampliamente usado en sistemas de producción. Examinemos implementaciones de Qt, motores de juegos y librerías principales."
          }
        </p>

        <CodeBlock language="cpp">
{`// Qt-style Pimpl with d-pointer convention
class QtStyleWidget : public QObject {
    Q_OBJECT
    
public:
    explicit QtStyleWidget(QWidget* parent = nullptr);
    ~QtStyleWidget();
    
    // Public interface
    void setTitle(const QString& title);
    QString title() const;
    
    void show();
    void hide();
    
signals:
    void titleChanged(const QString& newTitle);
    void visibilityChanged(bool visible);
    
private slots:
    void onInternalTimer();
    
private:
    class QtStyleWidgetPrivate;
    QScopedPointer<QtStyleWidgetPrivate> d_ptr; // Qt's d-pointer
    Q_DECLARE_PRIVATE(QtStyleWidget)
};

// Game Engine Pimpl: High-performance with memory pools
class GameEntity {
public:
    // Entity ID for quick lookups
    using EntityID = uint32_t;
    
    explicit GameEntity(EntityID id);
    ~GameEntity();
    
    // Move-only for performance
    GameEntity(GameEntity&&) noexcept;
    GameEntity& operator=(GameEntity&&) noexcept;
    
    // High-frequency operations: Keep in interface
    [[nodiscard]] EntityID id() const noexcept { return id_; }
    [[nodiscard]] bool is_active() const noexcept { return is_active_; }
    [[nodiscard]] const Vector3& position() const noexcept { return position_; }
    
    void set_position(const Vector3& pos) noexcept { position_ = pos; }
    void set_active(bool active) noexcept { is_active_ = active; }
    
    // Complex operations: Through Pimpl
    void add_component(std::unique_ptr<Component> component);
    void remove_component(ComponentType type);
    void update(float delta_time);
    void render(RenderContext& context);
    
private:
    // Hot data: Direct access
    EntityID id_;
    bool is_active_;
    Vector3 position_;
    
    // Cold data: Pimpl
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// Library API: ABI-stable interface
class LIBRARY_API DatabaseConnection {
public:
    // C++ API
    explicit DatabaseConnection(const ConnectionString& conn_str);
    ~DatabaseConnection();
    
    // Non-copyable, movable
    DatabaseConnection(const DatabaseConnection&) = delete;
    DatabaseConnection& operator=(const DatabaseConnection&) = delete;
    
    DatabaseConnection(DatabaseConnection&&) noexcept;
    DatabaseConnection& operator=(DatabaseConnection&&) noexcept;
    
    // Core operations
    [[nodiscard]] bool is_connected() const noexcept;
    [[nodiscard]] std::optional<ResultSet> execute(const Query& query);
    [[nodiscard]] std::future<ResultSet> execute_async(const Query& query);
    
    // Transaction support
    class Transaction {
    public:
        explicit Transaction(DatabaseConnection& conn);
        ~Transaction(); // Auto-rollback if not committed
        
        void commit();
        void rollback();
        
    private:
        class TransactionImpl;
        std::unique_ptr<TransactionImpl> impl_;
    };
    
    Transaction begin_transaction();

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle level={2}>
          {lessonState.language === 'en' ? "Performance Analysis & Best Practices" : "Análisis de Rendimiento y Mejores Prácticas"}
        </SectionTitle>

        <UndefinedBehaviorWarning 
          title={lessonState.language === 'en' ? "Common Pimpl Pitfalls" : "Trampas Comunes del Pimpl"}
          description={lessonState.language === 'en' 
            ? "Destructor not defined in .cpp, incomplete type usage, and missing move operations can lead to compilation errors or performance issues."
            : "Destructor no definido en .cpp, uso de tipos incompletos y operaciones de movimiento faltantes pueden llevar a errores de compilación o problemas de rendimiento."
          }
        />

        <CodeBlock language="cpp">
{`// Performance measurement and optimization
class PerformanceMeasuredPimpl {
public:
    PerformanceMeasuredPimpl();
    ~PerformanceMeasuredPimpl();
    
    // Instrumented operations for profiling
    void operation_with_metrics(const std::string& operation_name) {
        auto start = std::chrono::high_resolution_clock::now();
        
        // Call through to implementation
        impl_->perform_operation();
        
        auto end = std::chrono::high_resolution_clock::now();
        record_timing(operation_name, end - start);
    }
    
    struct PerformanceReport {
        size_t total_operations;
        std::chrono::nanoseconds total_time;
        std::chrono::nanoseconds average_time;
        std::chrono::nanoseconds min_time;
        std::chrono::nanoseconds max_time;
        double operations_per_second;
    };
    
    [[nodiscard]] PerformanceReport get_report() const;
    void reset_metrics();

private:
    class Impl;
    std::unique_ptr<Impl> impl_;
    
    void record_timing(const std::string& op, std::chrono::nanoseconds duration);
};

// Best practices summary:
namespace pimpl_best_practices {
    
    // 1. Always define destructor in .cpp
    // 2. Use unique_ptr for ownership
    // 3. Implement move operations for performance
    // 4. Consider Fast Pimpl for hot paths
    // 5. Use make_unique for construction
    // 6. Handle exceptions properly
    // 7. Consider alignment for performance-critical code
    // 8. Profile indirection overhead
    // 9. Document ABI stability guarantees
    // 10. Use forward declarations aggressively
    
} // namespace pimpl_best_practices`}
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
                        ? (lessonState.language === 'en' ? '🎉 Excellent! You master advanced Pimpl patterns!' : '🎉 ¡Excelente! ¡Dominas los patrones Pimpl avanzados!')
                        : lessonState.quizScore >= 50
                        ? (lessonState.language === 'en' ? '👍 Good! Review the advanced optimization techniques.' : '👍 ¡Bien! Revisa las técnicas de optimización avanzadas.')
                        : (lessonState.language === 'en' ? '📚 Study more about template Pimpl and performance optimization.' : '📚 Estudia más sobre template Pimpl y optimización de rendimiento.')
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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