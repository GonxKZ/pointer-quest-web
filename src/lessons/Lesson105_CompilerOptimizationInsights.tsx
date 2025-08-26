import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line, Cylinder, Cone } from '@react-three/drei';
import { useApp } from '../context/AppContext';

function CompilerOptimizationVisualization() {
  const [optimizationMetrics, setOptimizationMetrics] = useState({
    aliasAnalysis: 0,
    vectorization: 0,
    inlining: 0,
    lto: 0,
    pgo: 0,
    performanceGain: 92.5
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOptimizationMetrics(prev => ({
        aliasAnalysis: prev.aliasAnalysis + Math.floor(Math.random() * 3) + 1,
        vectorization: prev.vectorization + Math.floor(Math.random() * 4) + 1,
        inlining: prev.inlining + Math.floor(Math.random() * 5) + 2,
        lto: prev.lto + Math.floor(Math.random() * 2) + 1,
        pgo: prev.pgo + Math.floor(Math.random() * 3) + 1,
        performanceGain: Math.min(99.8, prev.performanceGain + (Math.random() - 0.3) * 0.8)
      }));
    }, 900);
    
    return () => clearInterval(interval);
  }, []);

  const optimizationPasses = [
    { name: 'aliasAnalysis', pos: [-4, 3, 0], color: '#00ff88', label: 'Alias Analysis', size: [1.4, 0.7, 0.4] },
    { name: 'vectorization', pos: [-1.5, 3, 0], color: '#00d4ff', label: 'Vectorization', size: [1.6, 0.8, 0.5] },
    { name: 'inlining', pos: [1.5, 3, 0], color: '#ff6b6b', label: 'Inlining', size: [1.8, 0.6, 0.6] },
    { name: 'lto', pos: [4, 3, 0], color: '#ffa500', label: 'LTO', size: [1.2, 0.9, 0.4] },
  ];

  return (
    <group>
      {/* Optimization pass visualization blocks */}
      {optimizationPasses.map((pass) => (
        <group key={pass.name}>
          <Box
            position={pass.pos}
            args={pass.size}
          >
            <meshStandardMaterial
              color={pass.color}
              opacity={0.6 + (optimizationMetrics[pass.name] % 10) / 100}
              transparent
            />
          </Box>
          <Text
            position={[pass.pos[0], pass.pos[1] + 1.3, pass.pos[2]]}
            fontSize={0.18}
            color="white"
            anchorX="center"
          >
            {pass.label}
          </Text>
          <Text
            position={[pass.pos[0], pass.pos[1] - 1.3, pass.pos[2]]}
            fontSize={0.28}
            color={pass.color}
            anchorX="center"
          >
            {optimizationMetrics[pass.name]}
          </Text>
        </group>
      ))}
      
      {/* Central compiler core sphere */}
      <Sphere position={[0, 1, 0]} args={[0.6]}>
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </Sphere>
      
      {/* PGO feedback loop visualization */}
      <group>
        <Cone position={[0, -1.5, 2]} args={[0.3, 1]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial color="#ff9500" opacity={0.8} transparent />
        </Cone>
        <Text
          position={[0, -2.2, 2]}
          fontSize={0.16}
          color="#ff9500"
          anchorX="center"
        >
          PGO: {optimizationMetrics.pgo}
        </Text>
      </group>
      
      {/* Optimization pipeline flow */}
      <Line
        points={[[-4, 3, 0], [-1.5, 3, 0], [1.5, 3, 0], [4, 3, 0], [0, 1, 0]]}
        color="#ffffff"
        lineWidth={3}
        opacity={0.7}
        transparent
      />
      
      {/* Memory hierarchy visualization */}
      <Cylinder position={[0, -0.5, 0]} args={[4.5, 4.5, 0.1]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#333333" opacity={0.2} transparent />
      </Cylinder>
      
      {/* Pointer optimization zones */}
      {[-2.5, -1, 0.5, 2, 3.5].map((offset, index) => (
        <Box
          key={offset}
          position={[offset * 0.8, -3, 0]}
          args={[0.5, 0.3, 0.3]}
        >
          <meshStandardMaterial 
            color={index < 3 ? '#00ff88' : '#ffaa00'} 
            opacity={0.7} 
            transparent 
          />
        </Box>
      ))}
      
      <Text
        position={[0, 0, 0]}
        fontSize={0.32}
        color="#ffffff"
        anchorX="center"
      >
        Compiler Optimization Engine
      </Text>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.24}
        color={optimizationMetrics.performanceGain > 95 ? '#00ff88' : '#ffaa00'}
        anchorX="center"
      >
        {`Optimization Level: ${optimizationMetrics.performanceGain.toFixed(1)}%`}
      </Text>

      <Text
        position={[0, -4.2, 0]}
        fontSize={0.18}
        color="#00d4ff"
        anchorX="center"
      >
        Pointer-Aware Optimization Passes
      </Text>
    </group>
  );
}

export default function Lesson105_CompilerOptimizationInsights() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'Understanding Compiler Optimization Passes & Pointer Impact' : 'Entendiendo Pases de Optimización del Compilador e Impacto en Punteros',
      code: `#include <iostream>
#include <vector>
#include <memory>
#include <chrono>
#include <random>

// Demostración de cómo diferentes pases de optimización afectan punteros
class OptimizationPassAnalyzer {
private:
    std::vector<int> data_;
    int* raw_ptr_;
    
public:
    OptimizationPassAnalyzer(size_t size) : data_(size), raw_ptr_(data_.data()) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> dis(1, 100);
        
        for (auto& item : data_) {
            item = dis(gen);
        }
    }
    
    // Función que el compilador puede optimizar agresivamente
    // -O0: Sin optimización, acceso directo por puntero
    // -O2: Loop unrolling, vectorización potencial
    // -O3: Optimizaciones más agresivas
    [[gnu::noinline]]  // Prevenir inlining para análisis
    long sum_via_pointer_basic() const {
        long sum = 0;
        const int* ptr = raw_ptr_;
        const size_t size = data_.size();
        
        // El compilador puede:
        // 1. Detectar que ptr no escapa
        // 2. Optimizar el bucle (vectorización)
        // 3. Eliminar bounds checking si es seguro
        for (size_t i = 0; i < size; ++i) {
            sum += ptr[i];  // Acceso por puntero
        }
        return sum;
    }
    
    // Función con aliasing complejo que limita optimizaciones
    [[gnu::noinline]]
    void complex_aliasing_scenario(int* external_ptr) {
        // El compilador debe ser conservador aquí porque:
        // external_ptr podría apuntar a elementos de data_
        for (size_t i = 0; i < data_.size(); ++i) {
            data_[i] += *external_ptr;  // Possible aliasing
            *external_ptr += data_[i];  // El compilador no puede asumir independencia
        }
    }
    
    // Función con restrict hint para mejorar optimización
    [[gnu::noinline]]
    void restrict_optimized_operation(int* __restrict src, int* __restrict dst, size_t size) {
        // __restrict le dice al compilador que src y dst no se superponen
        // Esto habilita:
        // 1. Vectorización más agresiva
        // 2. Reordenamiento de memoria más libre
        // 3. Prefetching optimizado
        for (size_t i = 0; i < size; ++i) {
            dst[i] = src[i] * 2 + 1;  // Puede vectorizarse fácilmente
        }
    }
    
    // Demostración de inline vs no-inline impact
    inline int inline_pointer_operation(const int* ptr, size_t index) {
        // Función inline: el compilador puede optimizar junto con el contexto llamador
        return ptr[index] * ptr[index] + ptr[index];
    }
    
    [[gnu::noinline]]
    int noinline_pointer_operation(const int* ptr, size_t index) {
        // Función no-inline: barrera de optimización
        return ptr[index] * ptr[index] + ptr[index];
    }
    
    void demonstrate_optimization_impact() {
        std::cout << "\\n=== Análisis de Impacto de Optimización ===" << std::endl;
        
        auto start = std::chrono::high_resolution_clock::now();
        volatile long result1 = sum_via_pointer_basic();
        auto end = std::chrono::high_resolution_clock::now();
        auto basic_duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        std::cout << "Suma básica por puntero: " << basic_duration.count() << " ns" << std::endl;
        
        // Crear buffers para demostrar restrict
        std::vector<int> src_buffer(1000, 42);
        std::vector<int> dst_buffer(1000, 0);
        
        start = std::chrono::high_resolution_clock::now();
        restrict_optimized_operation(src_buffer.data(), dst_buffer.data(), 1000);
        end = std::chrono::high_resolution_clock::now();
        auto restrict_duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        std::cout << "Operación con restrict: " << restrict_duration.count() << " ns" << std::endl;
        
        // Comparar inline vs no-inline
        const int* test_ptr = data_.data();
        constexpr size_t test_index = 100;
        constexpr int iterations = 10000;
        
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            volatile int result = inline_pointer_operation(test_ptr, test_index);
            (void)result;
        }
        end = std::chrono::high_resolution_clock::now();
        auto inline_duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            volatile int result = noinline_pointer_operation(test_ptr, test_index);
            (void)result;
        }
        end = std::chrono::high_resolution_clock::now();
        auto noinline_duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        std::cout << "Inline operations: " << inline_duration.count() << " ns" << std::endl;
        std::cout << "No-inline operations: " << noinline_duration.count() << " ns" << std::endl;
        std::cout << "Inline speedup: " 
                  << (double)noinline_duration.count() / inline_duration.count() << "x" << std::endl;
    }
    
    const std::vector<int>& get_data() const { return data_; }
};

// Análisis de pases específicos del compilador
void analyze_compiler_passes() {
    std::cout << "\\n=== Análisis de Pases del Compilador ===" << std::endl;
    
    // Información sobre flags de compilación importantes para punteros
    std::cout << "Flags críticos para optimización de punteros:" << std::endl;
    std::cout << "-fstrict-aliasing: Asume reglas estrictas de aliasing (habilitado en -O2+)" << std::endl;
    std::cout << "-fno-strict-aliasing: Deshabilita optimizaciones de aliasing agresivas" << std::endl;
    std::cout << "-ffast-math: Permite reorganización de operaciones matemáticas" << std::endl;
    std::cout << "-march=native: Optimiza para la CPU específica (habilita vectorización avanzada)" << std::endl;
    std::cout << "-flto: Link-time optimization para optimización inter-module" << std::endl;
    std::cout << "-fprofile-generate/-fprofile-use: Profile-guided optimization" << std::endl;
    
    // Demostrar efectos con diferentes tamaños
    std::vector<size_t> sizes = {100, 1000, 10000, 100000};
    
    for (size_t size : sizes) {
        OptimizationPassAnalyzer analyzer(size);
        
        auto start = std::chrono::high_resolution_clock::now();
        analyzer.sum_via_pointer_basic();
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        std::cout << "Size " << size << ": " << duration.count() << " μs" << std::endl;
    }
}`,
      explanation: state.language === 'en'
        ? 'Compiler optimization passes dramatically affect pointer-based code performance. Understanding how the compiler analyzes aliasing, applies vectorization, and performs inlining helps write code that cooperates with optimization rather than fighting it.'
        : 'Los pases de optimización del compilador afectan dramáticamente el rendimiento de código basado en punteros. Entender cómo el compilador analiza aliasing, aplica vectorización y realiza inlining ayuda a escribir código que coopera con la optimización en lugar de luchar contra ella.'
    },
    {
      title: state.language === 'en' ? 'Pointer Aliasing Analysis & Optimization Barriers' : 'Análisis de Aliasing de Punteros y Barreras de Optimización',
      code: `#include <iostream>
#include <vector>
#include <memory>
#include <type_traits>
#include <chrono>

// Demostración de análisis de aliasing y sus implicaciones
class AliasingAnalysisDemo {
public:
    // Caso 1: Sin posible aliasing - máxima optimización
    static void no_aliasing_scenario(const float* __restrict input, 
                                   float* __restrict output, 
                                   size_t size) {
        // __restrict garantiza que input y output no se superponen
        // El compilador puede:
        // 1. Vectorizar agresivamente con AVX/SSE
        // 2. Reordenar accesos a memoria
        // 3. Aplicar prefetching optimizado
        for (size_t i = 0; i < size; ++i) {
            output[i] = input[i] * 2.0f + 1.0f;  // Vectorizable
        }
    }
    
    // Caso 2: Posible aliasing - optimización limitada
    static void possible_aliasing_scenario(const float* input, 
                                         float* output, 
                                         size_t size) {
        // Sin __restrict, el compilador debe asumir posible solapamiento
        // Limitaciones:
        // 1. Vectorización conservadora
        // 2. Verificaciones de dependencias en runtime
        // 3. Menor reordenamiento de memoria
        for (size_t i = 0; i < size; ++i) {
            output[i] = input[i] * 2.0f + 1.0f;  // Menos optimizable
        }
    }
    
    // Caso 3: Aliasing garantizado - mínima optimización
    static void guaranteed_aliasing_scenario(float* data, size_t size) {
        // data[i] y data[i-1] pueden solaparse
        // El compilador debe:
        // 1. Preservar orden estricto de operaciones
        // 2. No puede vectorizar fácilmente
        // 3. Debe generar código conservador
        for (size_t i = 1; i < size; ++i) {
            data[i] = data[i] + data[i-1] * 0.5f;  // Dependencia real
        }
    }
    
    // Demostración de type-based aliasing analysis (TBAA)
    template<typename T, typename U>
    static void tbaa_demonstration(T* ptr_t, U* ptr_u, size_t size) {
        static_assert(!std::is_same_v<T, U>, "Types must be different for TBAA demo");
        
        // TBAA: Type-Based Alias Analysis
        // Si T != U, el compilador puede asumir que ptr_t y ptr_u no se superponen
        // (excepto para char*, void*, y tipos compatibles)
        
        std::cout << "\\nTBAA Demo - tipos diferentes:" << std::endl;
        std::cout << "Type T: " << typeid(T).name() << std::endl;
        std::cout << "Type U: " << typeid(U).name() << std::endl;
        
        // Esta optimización es posible por TBAA
        for (size_t i = 0; i < size; ++i) {
            *ptr_u = static_cast<U>(*ptr_t + static_cast<T>(1));
            *ptr_t = static_cast<T>(*ptr_u + static_cast<U>(2));
            // El compilador puede reordenar estas operaciones
        }
    }
    
    // Función que viola strict aliasing - comportamiento indefinido
    static void strict_aliasing_violation_example() {
        std::cout << "\\n⚠️  Ejemplo de violación de strict aliasing:" << std::endl;
        
        float f = 3.14159f;
        
        // ¡PELIGRO! Violación de strict aliasing
        // Interpretar float como int a través de punteros
        int* int_ptr = reinterpret_cast<int*>(&f);
        
        std::cout << "Float value: " << f << std::endl;
        std::cout << "Reinterpreted as int: " << *int_ptr << std::endl;
        
        // Forma segura: usar std::bit_cast (C++20) o memcpy
        int safe_int;
        std::memcpy(&safe_int, &f, sizeof(int));
        std::cout << "Safe reinterpretation: " << safe_int << std::endl;
    }
    
    // Benchmark de diferentes escenarios de aliasing
    static void benchmark_aliasing_scenarios() {
        std::cout << "\\n=== Benchmark Escenarios de Aliasing ===" << std::endl;
        
        constexpr size_t size = 100000;
        constexpr int iterations = 1000;
        
        std::vector<float> input_data(size, 3.14f);
        std::vector<float> output_data(size, 0.0f);
        std::vector<float> shared_data(size, 2.71f);
        
        // Benchmark: sin aliasing
        auto start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            no_aliasing_scenario(input_data.data(), output_data.data(), size);
        }
        auto end = std::chrono::high_resolution_clock::now();
        auto no_alias_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        // Benchmark: posible aliasing
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            possible_aliasing_scenario(input_data.data(), output_data.data(), size);
        }
        end = std::chrono::high_resolution_clock::now();
        auto possible_alias_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        // Benchmark: aliasing garantizado
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            guaranteed_aliasing_scenario(shared_data.data(), size);
        }
        end = std::chrono::high_resolution_clock::now();
        auto guaranteed_alias_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        std::cout << "Sin aliasing (__restrict): " << no_alias_duration.count() << " μs" << std::endl;
        std::cout << "Posible aliasing: " << possible_alias_duration.count() << " μs" << std::endl;
        std::cout << "Aliasing garantizado: " << guaranteed_alias_duration.count() << " μs" << std::endl;
        
        double restrict_speedup = (double)possible_alias_duration.count() / no_alias_duration.count();
        std::cout << "Speedup con __restrict: " << restrict_speedup << "x" << std::endl;
    }
};

// Análisis específico de barriers de optimización
class OptimizationBarrierAnalysis {
public:
    // Memory barrier que previene reordenamiento
    static void memory_barrier_example() {
        std::cout << "\\n=== Memory Barriers y Optimización ===" << std::endl;
        
        volatile int* shared_ptr = new int(42);
        
        // El compilador no puede optimizar accesos a volatile
        *shared_ptr = 100;
        int value1 = *shared_ptr;  // No se puede eliminar
        int value2 = *shared_ptr;  // No se puede eliminar (aunque sea redundante)
        
        std::cout << "Valores leídos: " << value1 << ", " << value2 << std::endl;
        
        delete shared_ptr;
    }
    
    // Function call barriers
    [[gnu::noinline]]
    static void external_function(int* ptr) {
        // Esta función puede modificar *ptr
        *ptr += 10;
    }
    
    static void function_call_barrier_demo() {
        std::cout << "\\n=== Function Call Barriers ===" << std::endl;
        
        int value = 5;
        int* ptr = &value;
        
        // El compilador debe cargar *ptr antes de la llamada
        int before = *ptr;
        
        external_function(ptr);  // Barrier: puede modificar *ptr
        
        // El compilador debe cargar *ptr después de la llamada
        int after = *ptr;
        
        std::cout << "Antes: " << before << ", Después: " << after << std::endl;
    }
    
    // Exception barriers
    static void exception_barrier_demo() {
        std::cout << "\\n=== Exception Barriers ===" << std::endl;
        
        std::unique_ptr<int[]> data(new int[100]);
        
        try {
            // El compilador debe ser cuidadoso con reordenamiento
            // debido a posibles excepciones
            for (int i = 0; i < 100; ++i) {
                data[i] = i;
                
                if (i == 50) {
                    // Posible excepción que afecta optimización
                    // throw std::runtime_error("Test exception");
                }
                
                // Esta operación debe preservar orden debido a exception safety
                data[i] *= 2;
            }
        } catch (const std::exception& e) {
            std::cout << "Excepción capturada: " << e.what() << std::endl;
        }
        
        std::cout << "Primeros valores: " << data[0] << ", " << data[1] << ", " << data[2] << std::endl;
    }
};

void demonstrate_aliasing_analysis() {
    AliasingAnalysisDemo::benchmark_aliasing_scenarios();
    AliasingAnalysisDemo::strict_aliasing_violation_example();
    
    // TBAA demonstration con tipos diferentes
    int int_val = 42;
    float float_val = 3.14f;
    AliasingAnalysisDemo::tbaa_demonstration(&int_val, &float_val, 1);
    
    OptimizationBarrierAnalysis::memory_barrier_example();
    OptimizationBarrierAnalysis::function_call_barrier_demo();
    OptimizationBarrierAnalysis::exception_barrier_demo();
}`,
      explanation: state.language === 'en'
        ? 'Pointer aliasing analysis is fundamental to compiler optimization. The compiler must conservatively assume that pointers may alias unless proven otherwise, which can significantly limit optimization opportunities. Understanding and controlling aliasing through restrict, TBAA, and proper code design is crucial for high-performance code.'
        : 'El análisis de aliasing de punteros es fundamental para la optimización del compilador. El compilador debe asumir conservadoramente que los punteros pueden hacer aliasing a menos que se demuestre lo contrario, lo que puede limitar significativamente las oportunidades de optimización. Entender y controlar el aliasing a través de restrict, TBAA y diseño de código adecuado es crucial para código de alto rendimiento.'
    },
    {
      title: state.language === 'en' ? 'Link-Time Optimization (LTO) & Whole-Program Optimization' : 'Optimización en Tiempo de Enlace (LTO) y Optimización de Programa Completo',
      code: `#include <iostream>
#include <vector>
#include <memory>
#include <functional>
#include <chrono>

// Demostración de Link-Time Optimization y sus efectos en punteros
namespace LTODemo {
    
    // Función que será optimizada agresivamente con LTO
    // Sin LTO: llamada de función normal
    // Con LTO: puede ser inlined, especializada, o eliminada completamente
    void process_data_function(int* data, size_t size, int multiplier) {
        for (size_t i = 0; i < size; ++i) {
            data[i] *= multiplier;
        }
    }
    
    // Clase que demuestra optimizaciones inter-módulo
    class LTOOptimizationTarget {
    private:
        std::unique_ptr<int[]> data_;
        size_t size_;
        
    public:
        explicit LTOOptimizationTarget(size_t size) 
            : data_(std::make_unique<int[]>(size)), size_(size) {
            for (size_t i = 0; i < size_; ++i) {
                data_[i] = static_cast<int>(i + 1);
            }
        }
        
        // Método que puede ser optimizado con whole-program analysis
        void transform_data(std::function<int(int)> transformer) {
            // Sin LTO: llamada virtual/indirecta costosa
            // Con LTO: puede devirtualizar y especializar
            for (size_t i = 0; i < size_; ++i) {
                data_[i] = transformer(data_[i]);
            }
        }
        
        // Método que expone datos internos - oportunidad para LTO
        int* get_raw_data() { return data_.get(); }
        size_t get_size() const { return size_; }
        
        // Método que puede ser completamente eliminado con LTO
        // si solo se usa internamente con valores constantes
        void debug_print_stats() const {
            long sum = 0;
            for (size_t i = 0; i < size_; ++i) {
                sum += data_[i];
            }
            std::cout << "Sum: " << sum << ", Average: " << (sum / static_cast<double>(size_)) << std::endl;
        }
    };
    
    // Template function que LTO puede especializar completamente
    template<typename T, size_t N>
    class StaticOptimizationCandidate {
    private:
        T data_[N];
        
    public:
        StaticOptimizationCandidate() {
            for (size_t i = 0; i < N; ++i) {
                data_[i] = static_cast<T>(i);
            }
        }
        
        // Función template que LTO puede especializar por completo
        template<typename Func>
        void apply_operation(Func&& func) {
            // Con LTO y template specialization, esta función puede ser
            // completamente desenrollada e inlined
            for (size_t i = 0; i < N; ++i) {
                data_[i] = func(data_[i]);
            }
        }
        
        T* data() { return data_; }
        constexpr size_t size() const { return N; }
    };
    
    // Función que demuestra dead code elimination con LTO
    void potentially_dead_function(int* ptr, size_t size) {
        // Esta función podría ser eliminada completamente por LTO
        // si el análisis determina que nunca se llama
        static bool called = false;
        if (!called) {
            std::cout << "Esta función fue llamada por primera vez" << std::endl;
            called = true;
        }
        
        // Operación que podría ser optimizada
        for (size_t i = 0; i < size; ++i) {
            ptr[i] += static_cast<int>(i);
        }
    }
    
    // Demostración de constant propagation inter-módulo
    constexpr int GLOBAL_MULTIPLIER = 42;
    
    void use_global_constant(int* data, size_t size) {
        // Con LTO, GLOBAL_MULTIPLIER puede propagarse como literal
        for (size_t i = 0; i < size; ++i) {
            data[i] *= GLOBAL_MULTIPLIER;  // Puede convertirse en data[i] *= 42
        }
    }
    
    // Benchmark para comparar con/sin LTO
    void benchmark_lto_effects() {
        std::cout << "\\n=== Benchmark Efectos de LTO ===" << std::endl;
        
        constexpr size_t size = 10000;
        constexpr int iterations = 1000;
        
        LTOOptimizationTarget target(size);
        
        // Test 1: Function call optimization
        auto start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            process_data_function(target.get_raw_data(), target.get_size(), 2);
        }
        auto end = std::chrono::high_resolution_clock::now();
        auto function_call_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        // Test 2: Lambda optimization
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            target.transform_data([](int x) { return x * 2; });
        }
        end = std::chrono::high_resolution_clock::now();
        auto lambda_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        // Test 3: Template specialization
        StaticOptimizationCandidate<int, 1000> static_target;
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            static_target.apply_operation([](int x) { return x * 2; });
        }
        end = std::chrono::high_resolution_clock::now();
        auto template_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        std::cout << "Function calls: " << function_call_duration.count() << " μs" << std::endl;
        std::cout << "Lambda calls: " << lambda_duration.count() << " μs" << std::endl;
        std::cout << "Template specialization: " << template_duration.count() << " μs" << std::endl;
        
        std::cout << "\\nNota: Los beneficios de LTO son más visibles cuando se compila con -flto" << std::endl;
    }
}

// Análisis de whole-program optimization
namespace WholeProgramOptimization {
    
    // Interface que puede ser devirtualizada con whole-program analysis
    class DataProcessor {
    public:
        virtual ~DataProcessor() = default;
        virtual void process(int* data, size_t size) = 0;
        virtual const char* name() const = 0;
    };
    
    // Implementación concreta #1
    class MultiplyProcessor : public DataProcessor {
    private:
        int multiplier_;
        
    public:
        explicit MultiplyProcessor(int multiplier) : multiplier_(multiplier) {}
        
        void process(int* data, size_t size) override {
            // Con whole-program analysis, esta llamada virtual puede ser devirtualizada
            for (size_t i = 0; i < size; ++i) {
                data[i] *= multiplier_;
            }
        }
        
        const char* name() const override {
            return "MultiplyProcessor";
        }
    };
    
    // Implementación concreta #2
    class AddProcessor : public DataProcessor {
    private:
        int addend_;
        
    public:
        explicit AddProcessor(int addend) : addend_(addend) {}
        
        void process(int* data, size_t size) override {
            for (size_t i = 0; i < size; ++i) {
                data[i] += addend_;
            }
        }
        
        const char* name() const override {
            return "AddProcessor";
        }
    };
    
    // Factory function que puede ser completamente optimizada
    std::unique_ptr<DataProcessor> create_processor(const std::string& type, int value) {
        // Con whole-program analysis, este factory puede ser especializado
        // si solo se llama con valores constantes conocidos
        if (type == "multiply") {
            return std::make_unique<MultiplyProcessor>(value);
        } else if (type == "add") {
            return std::make_unique<AddProcessor>(value);
        }
        return nullptr;
    }
    
    // Función que puede beneficiarse de devirtualization
    void process_with_polymorphism(int* data, size_t size) {
        // Si el compilador puede determinar el tipo exacto en call-site,
        // puede devirtualizar estas llamadas
        auto multiply_proc = create_processor("multiply", 3);
        auto add_proc = create_processor("add", 10);
        
        if (multiply_proc) {
            multiply_proc->process(data, size);  // Posible devirtualización
        }
        
        if (add_proc) {
            add_proc->process(data, size);  // Posible devirtualización
        }
    }
    
    void demonstrate_whole_program_optimization() {
        std::cout << "\\n=== Whole-Program Optimization Demo ===" << std::endl;
        
        constexpr size_t size = 1000;
        std::vector<int> data(size, 1);
        
        // Esta llamada puede ser completamente optimizada con WPO
        process_with_polymorphism(data.data(), size);
        
        std::cout << "Primeros 5 elementos después del procesamiento: ";
        for (int i = 0; i < 5; ++i) {
            std::cout << data[i] << " ";
        }
        std::cout << std::endl;
        
        std::cout << "\\nCon whole-program optimization:" << std::endl;
        std::cout << "- Las llamadas virtuales pueden ser devirtualizadas" << std::endl;
        std::cout << "- Los factory patterns pueden ser especializados" << std::endl;
        std::cout << "- El dead code elimination es más agresivo" << std::endl;
        std::cout << "- La constant propagation cruza límites de módulos" << std::endl;
    }
}

void demonstrate_lto_and_wpo() {
    std::cout << "=== Link-Time Optimization & Whole-Program Optimization ===" << std::endl;
    
    LTODemo::benchmark_lto_effects();
    WholeProgramOptimization::demonstrate_whole_program_optimization();
    
    std::cout << "\\n💡 Para habilitar LTO:" << std::endl;
    std::cout << "   gcc/clang: -flto -O2" << std::endl;
    std::cout << "   MSVC: /GL (generación) + /LTCG (enlace)" << std::endl;
    
    std::cout << "\\n🎯 Beneficios principales de LTO:" << std::endl;
    std::cout << "   • Inlining inter-módulo más agresivo" << std::endl;
    std::cout << "   • Dead code elimination global" << std::endl;
    std::cout << "   • Constant propagation entre módulos" << std::endl;
    std::cout << "   • Devirtualización con análisis de todo el programa" << std::endl;
    std::cout << "   • Optimización de punteros y referencias globales" << std::endl;
}`,
      explanation: state.language === 'en'
        ? 'Link-Time Optimization (LTO) and whole-program optimization enable cross-module optimizations that are impossible during traditional separate compilation. These techniques can dramatically improve pointer-intensive code by enabling aggressive inlining, devirtualization, and global constant propagation.'
        : 'La Optimización en Tiempo de Enlace (LTO) y la optimización de programa completo habilitan optimizaciones inter-módulo que son imposibles durante la compilación separada tradicional. Estas técnicas pueden mejorar dramáticamente código intensivo en punteros habilitando inlining agresivo, devirtualización y propagación de constantes global.'
    },
    {
      title: state.language === 'en' ? 'Profile-Guided Optimization (PGO) with Pointer-Heavy Code' : 'Optimización Guiada por Perfiles (PGO) con Código Intensivo en Punteros',
      code: `#include <iostream>
#include <vector>
#include <memory>
#include <random>
#include <chrono>
#include <algorithm>
#include <unordered_map>
#include <string>

// Demostración de Profile-Guided Optimization en código con uso intensivo de punteros
namespace PGODemo {
    
    // Clase que simula diferentes patrones de acceso que PGO puede optimizar
    class PointerIntensiveWorkload {
    private:
        struct DataNode {
            int value;
            double weight;
            std::unique_ptr<DataNode> next;
            DataNode* prev;  // Raw pointer para linked list
            
            DataNode(int v, double w) : value(v), weight(w), next(nullptr), prev(nullptr) {}
        };
        
        std::unique_ptr<DataNode> head_;
        DataNode* tail_;  // Para acceso rápido al final
        size_t size_;
        
        // Patrones de acceso que PGO puede perfilar
        std::unordered_map<std::string, int> access_patterns_;
        
    public:
        PointerIntensiveWorkload() : tail_(nullptr), size_(0) {
            access_patterns_["sequential"] = 0;
            access_patterns_["random"] = 0;
            access_patterns_["reverse"] = 0;
            access_patterns_["search"] = 0;
        }
        
        void add_node(int value, double weight) {
            auto new_node = std::make_unique<DataNode>(value, weight);
            
            if (!head_) {
                head_ = std::move(new_node);
                tail_ = head_.get();
            } else {
                new_node->prev = tail_;
                tail_->next = std::move(new_node);
                tail_ = tail_->next.get();
            }
            ++size_;
        }
        
        // Patrón de acceso secuencial (muy común - PGO lo optimizará)
        double sequential_sum() {
            access_patterns_["sequential"]++;
            
            double sum = 0.0;
            DataNode* current = head_.get();
            
            // PGO puede optimizar este loop:
            // - Prefetching más agresivo
            // - Mejor predicción de branches
            // - Optimización de layout de memoria
            while (current) {
                sum += current->value * current->weight;
                current = current->next.get();  // Patrón predecible
            }
            return sum;
        }
        
        // Patrón de acceso aleatorio (menos común - menos optimización de PGO)
        double random_access_sum(std::mt19937& gen) {
            access_patterns_["random"]++;
            
            if (size_ == 0) return 0.0;
            
            std::uniform_int_distribution<> dis(0, static_cast<int>(size_ - 1));
            double sum = 0.0;
            
            // Este patrón es difícil de predecir para PGO
            for (int i = 0; i < 100; ++i) {
                int target_index = dis(gen);
                DataNode* current = head_.get();
                
                // Navegación hasta índice aleatorio
                for (int j = 0; j < target_index && current; ++j) {
                    current = current->next.get();
                }
                
                if (current) {
                    sum += current->value * current->weight;
                }
            }
            return sum;
        }
        
        // Patrón de acceso reverso (poco común sin PGO info)
        double reverse_sum() {
            access_patterns_["reverse"]++;
            
            double sum = 0.0;
            DataNode* current = tail_;
            
            // Sin profiling, esta navegación hacia atrás es menos optimizada
            // Con PGO, si es frecuente, se optimiza mejor
            while (current) {
                sum += current->value * current->weight;
                current = current->prev;  // Navegación reversa
            }
            return sum;
        }
        
        // Búsqueda con predicación (beneficia mucho de PGO)
        DataNode* search_value(int target_value) {
            access_patterns_["search"]++;
            
            DataNode* current = head_.get();
            
            while (current) {
                // PGO puede optimizar esta condición basado en hit rates reales
                if (current->value == target_value) {
                    return current;  // Branch prediction importante aquí
                }
                
                // PGO puede reordenar estas condiciones por frecuencia
                if (current->value > target_value * 2) {
                    // Early exit optimization - PGO determina si vale la pena
                    break;
                }
                
                current = current->next.get();
            }
            return nullptr;
        }
        
        // Operación polimórfica que PGO puede devirtualizar
        template<typename Predicate>
        std::vector<DataNode*> filter_nodes(Predicate pred) {
            std::vector<DataNode*> results;
            DataNode* current = head_.get();
            
            while (current) {
                // PGO puede specializar este template call si pred es frecuentemente el mismo
                if (pred(current)) {
                    results.push_back(current);
                }
                current = current->next.get();
            }
            return results;
        }
        
        void print_access_patterns() const {
            std::cout << "\\nPatrones de acceso registrados:" << std::endl;
            for (const auto& [pattern, count] : access_patterns_) {
                std::cout << "  " << pattern << ": " << count << " veces" << std::endl;
            }
        }
        
        size_t size() const { return size_; }
    };
    
    // Simulador de workload realista para PGO
    class PGOWorkloadSimulator {
    private:
        PointerIntensiveWorkload workload_;
        std::mt19937 gen_;
        
    public:
        PGOWorkloadSimulator() : gen_(std::chrono::steady_clock::now().time_since_epoch().count()) {
            // Crear dataset representativo
            std::uniform_real_distribution<> weight_dist(0.1, 10.0);
            std::uniform_int_distribution<> value_dist(1, 1000);
            
            for (int i = 0; i < 5000; ++i) {
                workload_.add_node(value_dist(gen_), weight_dist(gen_));
            }
        }
        
        // Simular patrones de uso típicos que PGO puede capturar
        void simulate_typical_usage() {
            std::cout << "\\n=== Simulación de Uso Típico para PGO ===" << std::endl;
            
            // Patrón típico: 70% sequential, 20% search, 8% random, 2% reverse
            constexpr int total_operations = 1000;
            
            for (int i = 0; i < total_operations; ++i) {
                int operation_type = i % 100;
                
                if (operation_type < 70) {
                    // 70% del tiempo: acceso secuencial
                    volatile double result = workload_.sequential_sum();
                    (void)result;
                } else if (operation_type < 90) {
                    // 20% del tiempo: búsquedas
                    std::uniform_int_distribution<> search_dist(1, 1000);
                    volatile auto result = workload_.search_value(search_dist(gen_));
                    (void)result;
                } else if (operation_type < 98) {
                    // 8% del tiempo: acceso aleatorio
                    volatile double result = workload_.random_access_sum(gen_);
                    (void)result;
                } else {
                    // 2% del tiempo: acceso reverso
                    volatile double result = workload_.reverse_sum();
                    (void)result;
                }
            }
            
            workload_.print_access_patterns();
        }
        
        // Benchmark con/sin información de profiling
        void benchmark_pgo_effects() {
            std::cout << "\\n=== Benchmark Efectos de PGO ===" << std::endl;
            
            constexpr int iterations = 100;
            
            // Test 1: Operación más común (sequential) - máximo beneficio de PGO
            auto start = std::chrono::high_resolution_clock::now();
            for (int i = 0; i < iterations; ++i) {
                volatile double result = workload_.sequential_sum();
                (void)result;
            }
            auto end = std::chrono::high_resolution_clock::now();
            auto sequential_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
            
            // Test 2: Operación menos común (random) - menor beneficio de PGO
            start = std::chrono::high_resolution_clock::now();
            for (int i = 0; i < iterations; ++i) {
                volatile double result = workload_.random_access_sum(gen_);
                (void)result;
            }
            end = std::chrono::high_resolution_clock::now();
            auto random_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
            
            // Test 3: Búsquedas con predicación
            std::uniform_int_distribution<> search_dist(1, 1000);
            start = std::chrono::high_resolution_clock::now();
            for (int i = 0; i < iterations; ++i) {
                volatile auto result = workload_.search_value(search_dist(gen_));
                (void)result;
            }
            end = std::chrono::high_resolution_clock::now();
            auto search_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
            
            std::cout << "Sequential access (común): " << sequential_duration.count() << " μs" << std::endl;
            std::cout << "Random access (raro): " << random_duration.count() << " μs" << std::endl;
            std::cout << "Search operations: " << search_duration.count() << " μs" << std::endl;
            
            std::cout << "\\nCon PGO, las operaciones frecuentes se optimizan más agresivamente" << std::endl;
        }
    };
    
    // Ejemplo de hot/cold code splitting que PGO puede hacer
    class HotColdCodeExample {
    private:
        std::vector<int*> hot_ptrs_;    // Accedidos frecuentemente
        std::vector<int*> cold_ptrs_;   // Accedidos raramente
        
    public:
        void setup_data() {
            // Simular datos hot y cold
            for (int i = 0; i < 1000; ++i) {
                hot_ptrs_.push_back(new int(i));
            }
            for (int i = 0; i < 10000; ++i) {
                cold_ptrs_.push_back(new int(i + 1000));
            }
        }
        
        ~HotColdCodeExample() {
            for (int* ptr : hot_ptrs_) delete ptr;
            for (int* ptr : cold_ptrs_) delete ptr;
        }
        
        // Función con hot path (ejecutada frecuentemente)
        long process_hot_data() {
            long sum = 0;
            
            // Con PGO, este loop se optimiza agresivamente
            for (int* ptr : hot_ptrs_) {
                sum += *ptr * 2;  // Hot path - optimización máxima
            }
            return sum;
        }
        
        // Función con cold path (ejecutada raramente)
        long process_cold_data() {
            long sum = 0;
            
            // Con PGO, este código puede moverse a sección separada
            for (int* ptr : cold_ptrs_) {
                if (*ptr % 1000 == 0) {  // Cold path - menos optimización
                    sum += *ptr;
                }
            }
            return sum;
        }
        
        void demonstrate_hot_cold_optimization() {
            std::cout << "\\n=== Hot/Cold Code Splitting con PGO ===" << std::endl;
            
            // Simular patrón típico: 95% hot path, 5% cold path
            for (int i = 0; i < 1000; ++i) {
                if (i % 20 == 0) {
                    // 5% del tiempo: cold path
                    volatile long result = process_cold_data();
                    (void)result;
                } else {
                    // 95% del tiempo: hot path
                    volatile long result = process_hot_data();
                    (void)result;
                }
            }
            
            std::cout << "PGO puede identificar y separar hot/cold paths para mejor cache utilization" << std::endl;
        }
    };
}

void demonstrate_pgo_optimization() {
    std::cout << "=== Profile-Guided Optimization con Código Intensivo en Punteros ===" << std::endl;
    
    PGODemo::PGOWorkloadSimulator simulator;
    simulator.simulate_typical_usage();
    simulator.benchmark_pgo_effects();
    
    PGODemo::HotColdCodeExample hot_cold;
    hot_cold.setup_data();
    hot_cold.demonstrate_hot_cold_optimization();
    
    std::cout << "\\n💡 Para usar PGO:" << std::endl;
    std::cout << "   1. Compilar con -fprofile-generate" << std::endl;
    std::cout << "   2. Ejecutar con datos representativos" << std::endl;
    std::cout << "   3. Recompilar con -fprofile-use" << std::endl;
    
    std::cout << "\\n🎯 Beneficios de PGO para punteros:" << std::endl;
    std::cout << "   • Mejor predicción de branches en pointer traversal" << std::endl;
    std::cout << "   • Optimización de hot paths en data structures" << std::endl;
    std::cout << "   • Hot/cold code splitting para mejor cache utilization" << std::endl;
    std::cout << "   • Specialización de templates basada en uso real" << std::endl;
    std::cout << "   • Devirtualización de hot virtual calls" << std::endl;
}`,
      explanation: state.language === 'en'
        ? 'Profile-Guided Optimization (PGO) uses runtime profiling data to optimize code based on actual usage patterns. For pointer-intensive code, PGO can significantly improve performance by optimizing hot paths, improving branch prediction for pointer traversals, and enabling better cache utilization through hot/cold code splitting.'
        : 'La Optimización Guiada por Perfiles (PGO) usa datos de profiling en tiempo de ejecución para optimizar código basado en patrones de uso reales. Para código intensivo en punteros, PGO puede mejorar significativamente el rendimiento optimizando hot paths, mejorando la predicción de branches para traversal de punteros, y habilitando mejor utilización de cache através de hot/cold code splitting.'
    },
    {
      title: state.language === 'en' ? 'Compiler Intrinsics & Manual Optimization Hints' : 'Intrínsecos del Compilador e Hints de Optimización Manual',
      code: `#include <iostream>
#include <vector>
#include <memory>
#include <chrono>
#include <immintrin.h>  // Para intrínsecos Intel
#include <cstring>

// Demostración de compiler intrinsics y hints para optimización manual
namespace CompilerIntrinsics {
    
    // Uso de intrínsecos de prefetch para optimización manual
    class PrefetchOptimizedProcessor {
    private:
        static constexpr size_t CACHE_LINE_SIZE = 64;
        static constexpr size_t PREFETCH_DISTANCE = 8;  // Prefetch 8 cache lines ahead
        
    public:
        // Versión básica sin prefetch hints
        static void process_data_basic(const int* input, int* output, size_t size) {
            for (size_t i = 0; i < size; ++i) {
                output[i] = input[i] * 2 + 1;
            }
        }
        
        // Versión con prefetch manual
        static void process_data_with_prefetch(const int* input, int* output, size_t size) {
            for (size_t i = 0; i < size; ++i) {
                // Prefetch próximas cache lines
                if (i + PREFETCH_DISTANCE < size) {
                    #ifdef __builtin_prefetch
                        __builtin_prefetch(&input[i + PREFETCH_DISTANCE], 0, 3);  // Read, high temporal locality
                        __builtin_prefetch(&output[i + PREFETCH_DISTANCE], 1, 3); // Write, high temporal locality
                    #endif
                }
                
                output[i] = input[i] * 2 + 1;
            }
        }
        
        // Versión con SIMD intrínsecos y prefetch
        static void process_data_simd_prefetch(const int* input, int* output, size_t size) {
            #ifdef __AVX2__
            const size_t simd_size = 8;  // AVX2 procesa 8 ints a la vez
            size_t simd_iterations = size / simd_size;
            
            const __m256i two = _mm256_set1_epi32(2);
            const __m256i one = _mm256_set1_epi32(1);
            
            for (size_t i = 0; i < simd_iterations; ++i) {
                size_t idx = i * simd_size;
                
                // Prefetch futuras iteraciones
                if (idx + PREFETCH_DISTANCE * simd_size < size) {
                    __builtin_prefetch(&input[idx + PREFETCH_DISTANCE * simd_size], 0, 3);
                    __builtin_prefetch(&output[idx + PREFETCH_DISTANCE * simd_size], 1, 3);
                }
                
                // Cargar 8 enteros
                __m256i data = _mm256_loadu_si256(reinterpret_cast<const __m256i*>(&input[idx]));
                
                // Procesar: data * 2 + 1
                __m256i multiplied = _mm256_mullo_epi32(data, two);
                __m256i result = _mm256_add_epi32(multiplied, one);
                
                // Guardar resultado
                _mm256_storeu_si256(reinterpret_cast<__m256i*>(&output[idx]), result);
            }
            
            // Procesar elementos restantes
            for (size_t i = simd_iterations * simd_size; i < size; ++i) {
                output[i] = input[i] * 2 + 1;
            }
            #else
            // Fallback sin AVX2
            process_data_with_prefetch(input, output, size);
            #endif
        }
    };
    
    // Uso de branch hints para optimización manual
    class BranchHintOptimization {
    public:
        // Hints de probabilidad de branch
        static int search_with_hints(const int* data, size_t size, int target) {
            for (size_t i = 0; i < size; ++i) {
                // Hint: es probable que no encontremos el target (búsqueda típicamente falla)
                if (__builtin_expect(data[i] == target, 0)) {  // 0 = unlikely
                    return static_cast<int>(i);  // Found
                }
            }
            return -1;  // Not found
        }
        
        // Versión sin hints para comparación
        static int search_without_hints(const int* data, size_t size, int target) {
            for (size_t i = 0; i < size; ++i) {
                if (data[i] == target) {
                    return static_cast<int>(i);
                }
            }
            return -1;
        }
        
        // Ejemplo de hot/cold function hints
        [[gnu::hot]]  // Función ejecutada frecuentemente
        static void hot_function(int* data, size_t size) {
            // Esta función se optimiza agresivamente y se coloca en hot section
            for (size_t i = 0; i < size; ++i) {
                data[i] *= 2;
            }
        }
        
        [[gnu::cold]]  // Función ejecutada raramente
        static void cold_function(int* data, size_t size) {
            // Esta función recibe menos optimización y se coloca en cold section
            for (size_t i = 0; i < size; ++i) {
                if (data[i] < 0) {
                    data[i] = 0;  // Reparar valores negativos (caso raro)
                }
            }
        }
    };
    
    // Memory layout hints y alignment intrinsics
    class MemoryLayoutOptimization {
    private:
        // Estructura con layout optimizado manualmente
        struct alignas(64) CacheAlignedData {
            int frequently_accessed[16];     // Primera cache line
            char padding1[64 - 16 * sizeof(int)];
            
            double occasionally_accessed[8]; // Segunda cache line
            char padding2[64 - 8 * sizeof(double)];
            
            int rarely_accessed[16];         // Tercera cache line
        };
        
    public:
        // Función que usa alignment intrinsics
        static void aligned_memory_operations() {
            // Verificar alignment en runtime
            void* ptr = std::aligned_alloc(64, sizeof(CacheAlignedData));
            if (!ptr) return;
            
            auto* data = new (ptr) CacheAlignedData{};
            
            // Usar intrínsecos que requieren alignment
            #ifdef __SSE2__
            // _mm_load_si128 requiere alignment de 16 bytes
            if (reinterpret_cast<uintptr_t>(data->frequently_accessed) % 16 == 0) {
                __m128i* aligned_ptr = reinterpret_cast<__m128i*>(data->frequently_accessed);
                __m128i loaded = _mm_load_si128(aligned_ptr);  // Carga alineada rápida
                _mm_store_si128(aligned_ptr, loaded);          // Guardado alineado rápido
            }
            #endif
            
            data->~CacheAlignedData();
            std::free(ptr);
        }
        
        // Uso de memory fencing intrinsics
        static void memory_fence_example() {
            static volatile int shared_data = 0;
            static volatile bool flag = false;
            
            // Producer
            shared_data = 42;
            #ifdef __SSE2__
            _mm_sfence();  // Store fence - asegurar que shared_data se escribe antes que flag
            #else
            __sync_synchronize();  // Generic memory barrier
            #endif
            flag = true;
            
            // Consumer (en otro thread)
            if (flag) {
                #ifdef __SSE2__
                _mm_lfence();  // Load fence - asegurar que flag se lee antes que shared_data
                #endif
                volatile int value = shared_data;
                (void)value;
            }
        }
    };
    
    // Cache control intrinsics
    class CacheControlOptimization {
    public:
        // Función que usa cache flush intrinsics
        static void cache_management_example(void* data, size_t size) {
            #ifdef __SSE2__
            char* ptr = static_cast<char*>(data);
            
            // Flush cache lines containing our data
            for (size_t offset = 0; offset < size; offset += 64) {
                _mm_clflush(ptr + offset);  // Flush cache line
            }
            
            // Memory fence to ensure flushes complete
            _mm_mfence();
            #endif
        }
        
        // Non-temporal stores para evitar cache pollution
        static void non_temporal_stores(const int* source, int* dest, size_t size) {
            #ifdef __SSE2__
            const size_t simd_size = 4;  // SSE2 procesa 4 ints
            size_t simd_iterations = size / simd_size;
            
            for (size_t i = 0; i < simd_iterations; ++i) {
                __m128i data = _mm_loadu_si128(reinterpret_cast<const __m128i*>(&source[i * simd_size]));
                
                // Non-temporal store - bypasses cache
                _mm_stream_si128(reinterpret_cast<__m128i*>(&dest[i * simd_size]), data);
            }
            
            // Ensure all non-temporal stores complete
            _mm_sfence();
            
            // Handle remaining elements
            for (size_t i = simd_iterations * simd_size; i < size; ++i) {
                dest[i] = source[i];
            }
            #else
            std::memcpy(dest, source, size * sizeof(int));
            #endif
        }
    };
    
    // Benchmark para comparar técnicas de optimización
    void benchmark_intrinsic_optimizations() {
        std::cout << "\\n=== Benchmark Optimizaciones con Intrínsecos ===" << std::endl;
        
        constexpr size_t size = 100000;
        constexpr int iterations = 1000;
        
        std::vector<int> input(size, 42);
        std::vector<int> output(size, 0);
        
        // Test 1: Básico sin optimizaciones
        auto start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            PrefetchOptimizedProcessor::process_data_basic(input.data(), output.data(), size);
        }
        auto end = std::chrono::high_resolution_clock::now();
        auto basic_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        // Test 2: Con prefetch manual
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            PrefetchOptimizedProcessor::process_data_with_prefetch(input.data(), output.data(), size);
        }
        end = std::chrono::high_resolution_clock::now();
        auto prefetch_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        // Test 3: SIMD + prefetch
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            PrefetchOptimizedProcessor::process_data_simd_prefetch(input.data(), output.data(), size);
        }
        end = std::chrono::high_resolution_clock::now();
        auto simd_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        // Test de búsqueda con branch hints
        std::vector<int> search_data(10000);
        std::iota(search_data.begin(), search_data.end(), 1);
        
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < 10000; ++i) {
            volatile int result = BranchHintOptimization::search_with_hints(
                search_data.data(), search_data.size(), -1);  // Búsqueda que falla (común)
            (void)result;
        }
        end = std::chrono::high_resolution_clock::now();
        auto hint_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < 10000; ++i) {
            volatile int result = BranchHintOptimization::search_without_hints(
                search_data.data(), search_data.size(), -1);
            (void)result;
        }
        end = std::chrono::high_resolution_clock::now();
        auto no_hint_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        std::cout << "Procesamiento básico: " << basic_duration.count() << " μs" << std::endl;
        std::cout << "Con prefetch: " << prefetch_duration.count() << " μs" << std::endl;
        std::cout << "SIMD + prefetch: " << simd_duration.count() << " μs" << std::endl;
        std::cout << "Búsqueda con hints: " << hint_duration.count() << " μs" << std::endl;
        std::cout << "Búsqueda sin hints: " << no_hint_duration.count() << " μs" << std::endl;
        
        double prefetch_speedup = (double)basic_duration.count() / prefetch_duration.count();
        double simd_speedup = (double)basic_duration.count() / simd_duration.count();
        double hint_speedup = (double)no_hint_duration.count() / hint_duration.count();
        
        std::cout << "\\nSpeedups:" << std::endl;
        std::cout << "Prefetch: " << prefetch_speedup << "x" << std::endl;
        std::cout << "SIMD: " << simd_speedup << "x" << std::endl;
        std::cout << "Branch hints: " << hint_speedup << "x" << std::endl;
    }
}

void demonstrate_compiler_intrinsics() {
    std::cout << "=== Compiler Intrinsics & Manual Optimization Hints ===" << std::endl;
    
    CompilerIntrinsics::benchmark_intrinsic_optimizations();
    
    CompilerIntrinsics::MemoryLayoutOptimization::aligned_memory_operations();
    CompilerIntrinsics::MemoryLayoutOptimization::memory_fence_example();
    
    std::vector<int> test_data(1000, 42);
    std::vector<int> dest_data(1000, 0);
    CompilerIntrinsics::CacheControlOptimization::non_temporal_stores(
        test_data.data(), dest_data.data(), test_data.size());
    
    std::cout << "\\n💡 Intrínsecos y hints clave:" << std::endl;
    std::cout << "   __builtin_prefetch() - Manual prefetch control" << std::endl;
    std::cout << "   __builtin_expect() - Branch prediction hints" << std::endl;
    std::cout << "   [[gnu::hot]]/[[gnu::cold]] - Function temperature hints" << std::endl;
    std::cout << "   _mm_sfence()/_mm_lfence() - Memory ordering" << std::endl;
    std::cout << "   _mm_clflush() - Cache line management" << std::endl;
    std::cout << "   _mm_stream_*() - Non-temporal stores" << std::endl;
    
    std::cout << "\\n🎯 Cuándo usar intrínsecos:" << std::endl;
    std::cout << "   • Hot paths donde el compilador no optimiza suficientemente" << std::endl;
    std::cout << "   • Patrones de acceso a memoria conocidos y predecibles" << std::endl;
    std::cout << "   • Control fino sobre cache y pipeline del procesador" << std::endl;
    std::cout << "   • Cuando profiling muestra cuellos de botella específicos" << std::endl;
}`,
      explanation: state.language === 'en'
        ? 'Compiler intrinsics and manual optimization hints provide fine-grained control over code generation when automatic optimizations are insufficient. These tools allow explicit management of prefetching, branch prediction, SIMD operations, and cache behavior, enabling maximum performance for critical code paths.'
        : 'Los intrínsecos del compilador e hints de optimización manual proporcionan control fino sobre la generación de código cuando las optimizaciones automáticas son insuficientes. Estas herramientas permiten gestión explícita de prefetching, predicción de branches, operaciones SIMD y comportamiento de cache, habilitando máximo rendimiento para rutas de código críticas.'
    },
    {
      title: state.language === 'en' ? 'Understanding Compiler Assumptions & Pointer Semantics' : 'Entendiendo Asunciones del Compilador y Semánticas de Punteros',
      code: `#include <iostream>
#include <vector>
#include <memory>
#include <type_traits>
#include <cstdint>
#include <cstring>

// Demostración de asunciones del compilador y cómo afectan la optimización
namespace CompilerAssumptions {
    
    // Análisis de strict aliasing y sus implicaciones
    class StrictAliasingAnalysis {
    public:
        // Ejemplo seguro: acceso a través del mismo tipo
        static void safe_aliasing_example() {
            std::cout << "\\n=== Strict Aliasing - Casos Seguros ===" << std::endl;
            
            int value = 42;
            int* ptr1 = &value;
            int* ptr2 = ptr1;
            
            *ptr1 = 100;
            std::cout << "Valor a través de ptr2: " << *ptr2 << std::endl;  // ✅ Seguro
            
            // El compilador puede optimizar agresivamente porque ambos punteros
            // son del mismo tipo - no hay violación de strict aliasing
        }
        
        // Ejemplo peligroso: violación de strict aliasing
        static void dangerous_aliasing_example() {
            std::cout << "\\n⚠️  Strict Aliasing - Casos Peligrosos" << std::endl;
            
            float f = 3.14159f;
            
            // PELIGRO: Violación de strict aliasing
            // El compilador asume que int* y float* no pueden apuntar al mismo objeto
            int* int_ptr = reinterpret_cast<int*>(&f);
            
            std::cout << "Float original: " << f << std::endl;
            std::cout << "Visto como int: " << *int_ptr << std::endl;
            
            // Modificar a través del puntero int
            *int_ptr = 0x40490FDB;  // Representación IEEE 754 de π
            
            std::cout << "Float después de modificar como int: " << f << std::endl;
            
            // ⚠️ COMPORTAMIENTO INDEFINIDO: El compilador puede asumir que
            // f no cambió porque se modificó a través de int*, no float*
        }
        
        // Forma correcta: usar std::bit_cast o memcpy
        static void correct_type_punning() {
            std::cout << "\\n✅ Type Punning Correcto" << std::endl;
            
            float f = 3.14159f;
            
            // Método 1: std::bit_cast (C++20)
            #if __cplusplus >= 202002L
            int as_int = std::bit_cast<int>(f);
            std::cout << "Float como int (bit_cast): " << as_int << std::endl;
            #endif
            
            // Método 2: memcpy (siempre funciona)
            int as_int_memcpy;
            std::memcpy(&as_int_memcpy, &f, sizeof(int));
            std::cout << "Float como int (memcpy): " << as_int_memcpy << std::endl;
            
            // Método 3: union (C-style, pero estándar)
            union FloatIntUnion {
                float f;
                int i;
            };
            
            FloatIntUnion u;
            u.f = 3.14159f;
            std::cout << "Float como int (union): " << u.i << std::endl;
        }
    };
    
    // Análisis de pointer arithmetic assumptions
    class PointerArithmeticAssumptions {
    public:
        // Aritmética de punteros válida - dentro del mismo objeto
        static void valid_pointer_arithmetic() {
            std::cout << "\\n=== Aritmética de Punteros Válida ===" << std::endl;
            
            int array[10] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
            int* begin = array;
            int* end = array + 10;  // Válido: one-past-the-end
            
            // El compilador puede optimizar agresivamente este loop
            for (int* ptr = begin; ptr != end; ++ptr) {
                std::cout << *ptr << " ";
            }
            std::cout << std::endl;
            
            // Estas operaciones son válidas y optimizables
            ptrdiff_t distance = end - begin;  // 10
            bool in_range = (begin + 5) < end;  // true
            
            std::cout << "Distancia: " << distance << ", En rango: " << in_range << std::endl;
        }
        
        // Aritmética de punteros inválida - comportamiento indefinido
        static void invalid_pointer_arithmetic() {
            std::cout << "\\n⚠️ Aritmética de Punteros Inválida" << std::endl;
            
            int obj1 = 42;
            int obj2 = 84;
            
            int* ptr1 = &obj1;
            int* ptr2 = &obj2;
            
            // COMPORTAMIENTO INDEFINIDO: comparar punteros a objetos diferentes
            // El compilador puede asumir que esto nunca ocurre y optimizar en consecuencia
            if (ptr1 < ptr2) {  // ⚠️ UB si obj1 y obj2 no están en el mismo array
                std::cout << "ptr1 < ptr2 (pero esto es UB)" << std::endl;
            }
            
            // COMPORTAMIENTO INDEFINIDO: aritmética entre objetos diferentes
            // ptrdiff_t diff = ptr2 - ptr1;  // ⚠️ UB - descomentando puede crashear
            
            std::cout << "Estas operaciones pueden funcionar en la práctica pero son UB" << std::endl;
        }
        
        // Demostración de wrap-around assumptions
        static void wraparound_assumptions() {
            std::cout << "\\n=== Asunciones de Overflow en Punteros ===" << std::endl;
            
            // El compilador asume que la aritmética de punteros no hace overflow
            char* base_ptr = reinterpret_cast<char*>(0x1000);
            
            // Esto es válido si base_ptr apunta a un objeto grande
            char* offset_ptr = base_ptr + 100;
            
            std::cout << "Base: " << static_cast<void*>(base_ptr) << std::endl;
            std::cout << "Offset: " << static_cast<void*>(offset_ptr) << std::endl;
            
            // El compilador puede asumir que offset_ptr > base_ptr
            // y optimizar comparaciones en consecuencia
            if (offset_ptr > base_ptr) {
                std::cout << "Offset pointer is greater (optimizable assumption)" << std::endl;
            }
        }
    };
    
    // Análisis de object lifetime assumptions
    class ObjectLifetimeAssumptions {
    private:
        struct TestObject {
            int value;
            TestObject(int v) : value(v) { std::cout << "Construido: " << value << std::endl; }
            ~TestObject() { std::cout << "Destruido: " << value << std::endl; }
        };
        
    public:
        // Ejemplo de lifetime correcto
        static void correct_lifetime_usage() {
            std::cout << "\\n=== Uso Correcto de Lifetime ===" << std::endl;
            
            auto obj = std::make_unique<TestObject>(42);
            TestObject* raw_ptr = obj.get();
            
            // Uso válido: el objeto existe
            std::cout << "Valor: " << raw_ptr->value << std::endl;
            
            // El compilador puede optimizar accesos porque sabe que obj vive
        } // obj se destruye aquí - raw_ptr se invalida
        
        // Ejemplo de dangling pointer
        static TestObject* create_dangling_pointer() {
            std::cout << "\\n⚠️ Creación de Dangling Pointer" << std::endl;
            
            TestObject local_obj(100);
            return &local_obj;  // ⚠️ PELIGRO: retorna puntero a objeto local
        } // local_obj se destruye aquí
        
        // Demostración de use-after-free
        static void demonstrate_use_after_free() {
            std::cout << "\\n⚠️ Demostración de Use-After-Free" << std::endl;
            
            TestObject* ptr = new TestObject(200);
            
            std::cout << "Valor antes del delete: " << ptr->value << std::endl;
            delete ptr;
            
            // ⚠️ COMPORTAMIENTO INDEFINIDO: uso después de liberar
            // El compilador puede asumir que esto nunca ocurre
            // std::cout << "Valor después del delete: " << ptr->value << std::endl;  // UB
            
            std::cout << "Use-after-free comentado para evitar crash" << std::endl;
        }
    };
    
    // Análisis de asunciones sobre signed integer overflow
    class SignedOverflowAssumptions {
    public:
        // El compilador asume que signed overflow no ocurre
        static void signed_overflow_assumptions() {
            std::cout << "\\n=== Asunciones de Overflow en Enteros Signed ===" << std::endl;
            
            int value = 1000000000;  // 10^9
            
            // El compilador puede optimizar esta condición
            // asumiendo que value * 2 no hace overflow
            if (value > 0 && value * 2 > 0) {
                std::cout << "Ambos positivos (compilador puede optimizar)" << std::endl;
            }
            
            // En realidad, value * 2 podría hacer overflow y ser negativo
            // pero el compilador asume que esto no ocurre (UB)
            int doubled = value * 2;  // Posible overflow
            std::cout << "Valor doblado: " << doubled << std::endl;
            
            // Para evitar UB, usar tipos unsigned o verificar overflow
            if (value > 0 && value <= INT_MAX / 2) {
                int safe_doubled = value * 2;
                std::cout << "Doblado seguro: " << safe_doubled << std::endl;
            }
        }
        
        // Demostración con pointer arithmetic y signed overflow
        static void pointer_offset_overflow() {
            std::cout << "\\n=== Overflow en Offsets de Punteros ===" << std::endl;
            
            constexpr size_t large_array_size = 1000;
            std::vector<int> large_array(large_array_size, 42);
            
            int* base = large_array.data();
            
            // Offset que podría causar problemas
            int signed_offset = 500;
            
            // El compilador asume que esto no hace overflow
            int* offset_ptr = base + signed_offset;
            
            if (offset_ptr >= base && offset_ptr < base + large_array_size) {
                std::cout << "Acceso seguro: " << *offset_ptr << std::endl;
            }
            
            // Ejemplo problemático con offset muy grande
            // int huge_offset = INT_MAX;  // Podría causar overflow
            // int* problematic_ptr = base + huge_offset;  // ⚠️ Posible UB
        }
    };
    
    // Análisis de function purity assumptions
    class FunctionPurityAssumptions {
    public:
        // Función pura que el compilador puede optimizar agresivamente
        [[gnu::pure]]  // Hint: función pura
        static int pure_function(int x, int y) {
            return x * x + y * y;  // Sin efectos secundarios
        }
        
        // Función const que solo lee memoria
        [[gnu::const]]  // Hint: función const (más restrictiva que pure)
        static int const_function(int x) {
            return x * 2 + 1;  // No lee memoria global
        }
        
        // Función con efectos secundarios
        static int impure_function(int x) {
            static int counter = 0;  // Estado global
            return x + (++counter);   // No optimizable agresivamente
        }
        
        static void demonstrate_purity_optimizations() {
            std::cout << "\\n=== Optimizaciones Basadas en Pureza de Función ===" << std::endl;
            
            const int a = 5, b = 10;
            
            // El compilador puede:
            // 1. Evaluar en compile-time
            // 2. Common subexpression elimination
            // 3. Loop hoisting
            
            int result1 = const_function(a);    // Puede evaluarse en compile-time
            int result2 = pure_function(a, b);  // Puede evaluarse en compile-time
            int result3 = impure_function(a);   // No puede optimizarse tanto
            int result4 = impure_function(a);   // Diferente resultado que result3
            
            std::cout << "Const function: " << result1 << std::endl;
            std::cout << "Pure function: " << result2 << std::endl;
            std::cout << "Impure function (1): " << result3 << std::endl;
            std::cout << "Impure function (2): " << result4 << std::endl;
            
            // En un loop, pure/const functions pueden ser hoisted
            int sum = 0;
            for (int i = 0; i < 1000; ++i) {
                sum += const_function(5);  // Compilador puede optimizar a: sum += (const_value * 1000)
            }
            std::cout << "Sum optimizable: " << sum << std::endl;
        }
    };
    
    void demonstrate_compiler_assumptions() {
        std::cout << "=== Asunciones del Compilador y Semánticas de Punteros ===" << std::endl;
        
        StrictAliasingAnalysis::safe_aliasing_example();
        StrictAliasingAnalysis::dangerous_aliasing_example();
        StrictAliasingAnalysis::correct_type_punning();
        
        PointerArithmeticAssumptions::valid_pointer_arithmetic();
        PointerArithmeticAssumptions::invalid_pointer_arithmetic();
        PointerArithmeticAssumptions::wraparound_assumptions();
        
        ObjectLifetimeAssumptions::correct_lifetime_usage();
        // TestObject* dangling = ObjectLifetimeAssumptions::create_dangling_pointer();
        // No usar dangling pointer - es UB
        ObjectLifetimeAssumptions::demonstrate_use_after_free();
        
        SignedOverflowAssumptions::signed_overflow_assumptions();
        SignedOverflowAssumptions::pointer_offset_overflow();
        
        FunctionPurityAssumptions::demonstrate_purity_optimizations();
        
        std::cout << "\\n🎯 Asunciones clave del compilador:" << std::endl;
        std::cout << "   • Strict aliasing: punteros de tipos diferentes no se superponen" << std::endl;
        std::cout << "   • No signed overflow: aritmética signed no hace overflow" << std::endl;
        std::cout << "   • Valid pointer arithmetic: solo dentro del mismo objeto" << std::endl;
        std::cout << "   • Object lifetime: no uso de objetos destruidos" << std::endl;
        std::cout << "   • Function purity: funciones pure/const sin efectos secundarios" << std::endl;
        
        std::cout << "\\n⚠️  Consecuencias de violar asunciones:" << std::endl;
        std::cout << "   • Comportamiento indefinido (UB)" << std::endl;
        std::cout << "   • Optimizaciones incorrectas del compilador" << std::endl;
        std::cout << "   • Bugs difíciles de reproducir y debuggear" << std::endl;
        std::cout << "   • Código que funciona en debug pero falla en release" << std::endl;
    }
}

void demonstrate_compiler_assumptions_and_semantics() {
    CompilerAssumptions::demonstrate_compiler_assumptions();
}`,
      explanation: state.language === 'en'
        ? 'Understanding compiler assumptions is crucial for writing correct and optimizable code. The compiler makes specific assumptions about pointer semantics, object lifetimes, and undefined behavior that enable aggressive optimizations. Violating these assumptions leads to undefined behavior and unpredictable program behavior.'
        : 'Entender las asunciones del compilador es crucial para escribir código correcto y optimizable. El compilador hace asunciones específicas sobre semánticas de punteros, lifetimes de objetos y comportamiento indefinido que habilitan optimizaciones agresivas. Violar estas asunciones lleva a comportamiento indefinido y comportamiento impredecible del programa.'
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 105: Compiler Optimization Insights' : 'Lección 105: Insights de Optimización del Compilador'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <CompilerOptimizationVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Advanced Compiler Optimization Techniques' : 'Técnicas Avanzadas de Optimización del Compilador'}</h3>
          
          <div className="example-tabs">
            {examples.map((example, index) => (
              <button
                key={index}
                className={`tab ${currentExample === index ? 'active' : ''}`}
                onClick={() => setCurrentExample(index)}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className="example-content">
            <pre className="code-block">
              <code>{examples[currentExample].code}</code>
            </pre>
            <div className="explanation">
              <p>{examples[currentExample].explanation}</p>
            </div>
          </div>
        </div>

        <div className="concept-section">
          <h3>{state.language === 'en' ? 'Core Optimization Concepts' : 'Conceptos Clave de Optimización'}</h3>
          <div className="concept-grid">
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Optimization Passes' : 'Pases de Optimización'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Multi-stage compiler optimization process including alias analysis, vectorization, inlining, and dead code elimination. Each pass transforms code for better performance.'
                  : 'Proceso de optimización del compilador multi-etapa incluyendo análisis de alias, vectorización, inlining y eliminación de código muerto. Cada pase transforma código para mejor rendimiento.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Alias Analysis' : 'Análisis de Alias'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Compiler analysis to determine which pointers may reference the same memory location. Critical for enabling aggressive optimizations while maintaining correctness.'
                  : 'Análisis del compilador para determinar qué punteros pueden referenciar la misma ubicación de memoria. Crítico para habilitar optimizaciones agresivas manteniendo corrección.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Link-Time Optimization' : 'Optimización en Tiempo de Enlace'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Cross-module optimization that enables aggressive inlining, devirtualization, and global constant propagation across compilation unit boundaries.'
                  : 'Optimización inter-módulo que habilita inlining agresivo, devirtualización y propagación de constantes global a través de límites de unidad de compilación.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Profile-Guided Optimization' : 'Optimización Guiada por Perfiles'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Using runtime profiling data to optimize hot paths, improve branch prediction, and enable better code layout based on actual usage patterns.'
                  : 'Usar datos de profiling en tiempo de ejecución para optimizar hot paths, mejorar predicción de branches y habilitar mejor layout de código basado en patrones de uso reales.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Compiler Intrinsics' : 'Intrínsecos del Compilador'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Low-level functions providing direct access to processor instructions and optimization hints like prefetching, SIMD operations, and memory barriers.'
                  : 'Funciones de bajo nivel proporcionando acceso directo a instrucciones del procesador y hints de optimización como prefetching, operaciones SIMD y barreras de memoria.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Compiler Assumptions' : 'Asunciones del Compilador'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Fundamental assumptions about pointer semantics, object lifetimes, and undefined behavior that enable aggressive optimizations but require careful programming.'
                  : 'Asunciones fundamentales sobre semánticas de punteros, lifetimes de objetos y comportamiento indefinido que habilitan optimizaciones agresivas pero requieren programación cuidadosa.'}
              </p>
            </div>
          </div>
        </div>

        <div className="best-practices">
          <h3>{state.language === 'en' ? 'Expert Optimization Strategies' : 'Estrategias Expertas de Optimización'}</h3>
          <ul>
            <li>
              {state.language === 'en'
                ? 'Profile before optimizing - use tools like perf, vtune, or compiler profiling to identify actual bottlenecks rather than guessing'
                : 'Perfilar antes de optimizar - usa herramientas como perf, vtune, o profiling del compilador para identificar cuellos de botella reales en lugar de adivinar'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Understand and cooperate with compiler optimizations by using restrict, const, noexcept, and purity attributes appropriately'
                : 'Entender y cooperar con optimizaciones del compilador usando restrict, const, noexcept y atributos de pureza apropiadamente'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Enable LTO (-flto) for production builds to unlock cross-module optimizations and better whole-program analysis'
                : 'Habilitar LTO (-flto) para builds de producción para desbloquear optimizaciones inter-módulo y mejor análisis de programa completo'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Use PGO for performance-critical applications by training with representative workloads to optimize hot paths effectively'
                : 'Usar PGO para aplicaciones críticas de rendimiento entrenando con workloads representativos para optimizar hot paths efectivamente'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Apply manual optimization intrinsics judiciously only after compiler auto-optimization proves insufficient for critical paths'
                : 'Aplicar intrínsecos de optimización manual juiciosamente solo después que la auto-optimización del compilador resulte insuficiente para rutas críticas'}
            </li>
          </ul>
        </div>

        <div className="advanced-techniques">
          <h3>{state.language === 'en' ? 'Advanced Optimization Mastery' : 'Dominio Avanzado de Optimización'}</h3>
          <div className="techniques-grid">
            <div className="technique-item">
              <span className="technique-icon">🔍</span>
              <h4>{state.language === 'en' ? 'Optimization Pass Analysis' : 'Análisis de Pases de Optimización'}</h4>
              <p>{state.language === 'en' ? 'Deep understanding of compiler optimization pipeline and pointer impact' : 'Entendimiento profundo del pipeline de optimización del compilador e impacto en punteros'}</p>
            </div>
            
            <div className="technique-item">
              <span className="technique-icon">🧩</span>
              <h4>{state.language === 'en' ? 'Aliasing Control' : 'Control de Aliasing'}</h4>
              <p>{state.language === 'en' ? 'Strategic use of restrict, TBAA, and aliasing barriers for maximum optimization' : 'Uso estratégico de restrict, TBAA y barreras de aliasing para optimización máxima'}</p>
            </div>
            
            <div className="technique-item">
              <span className="technique-icon">🚀</span>
              <h4>{state.language === 'en' ? 'Whole-Program Optimization' : 'Optimización de Programa Completo'}</h4>
              <p>{state.language === 'en' ? 'LTO and cross-module optimization for global performance improvements' : 'LTO y optimización inter-módulo para mejoras globales de rendimiento'}</p>
            </div>
            
            <div className="technique-item">
              <span className="technique-icon">📊</span>
              <h4>{state.language === 'en' ? 'Profile-Driven Optimization' : 'Optimización Dirigida por Perfiles'}</h4>
              <p>{state.language === 'en' ? 'PGO implementation for data-driven performance optimization strategies' : 'Implementación de PGO para estrategias de optimización de rendimiento dirigidas por datos'}</p>
            </div>
          </div>
        </div>

        <div className="warning-section">
          <h3>{state.language === 'en' ? '⚠️ Critical Optimization Pitfalls' : '⚠️ Trampas Críticas de Optimización'}</h3>
          <div className="warning-content">
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Undefined Behavior Exploitation:' : 'Explotación de Comportamiento Indefinido:'}</strong>
              <span>{state.language === 'en' 
                ? 'Compilers aggressively exploit UB for optimization - strict aliasing violations, signed overflow, and dangling pointers can cause unpredictable behavior'
                : 'Los compiladores explotan agresivamente UB para optimización - violaciones de strict aliasing, overflow signed y punteros colgantes pueden causar comportamiento impredecible'}</span>
            </div>
            
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Over-optimization Risks:' : 'Riesgos de Over-optimización:'}</strong>
              <span>{state.language === 'en'
                ? 'Excessive manual optimization can make code fragile, non-portable, and harder to maintain - always measure the actual performance impact'
                : 'Optimización manual excesiva puede hacer código frágil, no-portable y difícil de mantener - siempre mide el impacto real de rendimiento'}</span>
            </div>
            
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Compiler Version Dependencies:' : 'Dependencias de Versión del Compilador:'}</strong>
              <span>{state.language === 'en'
                ? 'Optimization behavior varies between compiler versions and vendors - test thoroughly across target environments and maintain fallback strategies'
                : 'El comportamiento de optimización varía entre versiones de compiladores y vendedores - prueba thoroughly en entornos objetivo y mantén estrategias de fallback'}</span>
            </div>
            
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Profile Data Staleness:' : 'Obsolescencia de Datos de Perfil:'}</strong>
              <span>{state.language === 'en'
                ? 'PGO profiles must be updated regularly as code and usage patterns evolve - stale profiles can actually hurt performance'
                : 'Los perfiles PGO deben actualizarse regularmente conforme el código y patrones de uso evolucionan - perfiles obsoletos pueden realmente dañar el rendimiento'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}