/**
 * Lesson 73: Advanced std::span - C++ Array Views and Memory Mapping
 * Expert-level concepts for high-performance systems
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, BufferGeometry, BufferAttribute, MeshBasicMaterial, MeshStandardMaterial, Group } from 'three';
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
  AccessibilityAnnouncer
} from '../design-system';

interface SpanState {
  language: 'en' | 'es';
  scenario: 'basic_operations' | 'simd_algorithms' | 'memory_mapping' | 'multidimensional';
  isAnimating: boolean;
  operations: number;
  memoryAccess: number;
  simdOps: number;
  cacheEfficiency: number;
}

// 3D Visualización del Span
const SpanVisualization: React.FC<{ scenario: string; isAnimating: boolean; onMetrics: (metrics: any) => void }> = ({ 
  scenario, isAnimating, onMetrics 
}) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'basic_operations') {
      groupRef.current.rotation.y = animationRef.current * 0.5;
      onMetrics({
        operations: Math.floor(animationRef.current * 10) % 100,
        memoryAccess: Math.floor(animationRef.current * 15) % 100,
        cacheEfficiency: 85 + Math.sin(animationRef.current) * 10
      });
    } else if (scenario === 'simd_algorithms') {
      groupRef.current.rotation.x = Math.sin(animationRef.current) * 0.2;
      onMetrics({
        simdOps: Math.floor(animationRef.current * 25) % 1000,
        throughput: Math.floor(2000 + Math.sin(animationRef.current * 2) * 500),
        vectorization: 95 + Math.cos(animationRef.current) * 5
      });
    }
  });

  const renderSpanElements = () => {
    const elements = [];
    const elementCount = scenario === 'multidimensional' ? 64 : 16;
    
    for (let i = 0; i < elementCount; i++) {
      const x = (i % 8) * 0.6 - 2.1;
      const y = scenario === 'multidimensional' ? Math.floor(i / 8) * 0.6 - 1.8 : 0;
      const z = 0;
      
      const color = scenario === 'simd_algorithms' 
        ? (i % 4 === 0 ? '#00ff00' : '#0080ff')
        : scenario === 'memory_mapping'
        ? (i % 2 === 0 ? '#ff8000' : '#ffff00')
        : '#ffffff';
      
      elements.push(
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
    
    return elements;
  };

  return (
    <group ref={groupRef}>
      {renderSpanElements()}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </group>
  );
};

const Lesson73_Span: React.FC = () => {
  const [state, setState] = useState<SpanState>({
    language: 'en',
    scenario: 'basic_operations',
    isAnimating: false,
    operations: 0,
    memoryAccess: 0,
    simdOps: 0,
    cacheEfficiency: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: SpanState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      basic_operations: state.language === 'en' ? 'Basic Operations' : 'Operaciones Básicas',
      simd_algorithms: state.language === 'en' ? 'SIMD Algorithms' : 'Algoritmos SIMD',
      memory_mapping: state.language === 'en' ? 'Memory Mapping' : 'Mapeo de Memoria',
      multidimensional: state.language === 'en' ? 'Multidimensional Spans' : 'Spans Multidimensionales'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    basic_operations: `// std::span Operaciones Básicas
#include <span>
#include <vector>
#include <array>
#include <iostream>

template<typename T>
void process_range(std::span<T> data) {
    // Span unifica diferentes tipos de contenedores
    std::cout << "Processing " << data.size() << " elements\\n";
    
    // Acceso eficiente con bounds checking opcional
    for (size_t i = 0; i < data.size(); ++i) {
        data[i] *= 2;  // Modificación in-place
    }
    
    // Subvistas sin copiar datos
    auto first_half = data.first(data.size() / 2);
    auto last_half = data.last(data.size() / 2);
    
    // Operaciones de slice
    auto middle = data.subspan(data.size() / 4, data.size() / 2);
}

int main() {
    // Funciona con cualquier contenedor contiguo
    std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8};
    std::array<int, 8> arr = {10, 20, 30, 40, 50, 60, 70, 80};
    int c_array[] = {100, 200, 300, 400, 500, 600, 700, 800};
    
    process_range(std::span(vec));       // Vector
    process_range(std::span(arr));       // Array
    process_range(std::span(c_array));   // C-array
    
    return 0;
}`,

    simd_algorithms: `// SIMD con std::span para Alto Rendimiento
#include <span>
#include <vector>
#include <immintrin.h>  // SSE/AVX intrinsics
#include <chrono>
#include <numeric>

// Suma vectorizada usando AVX2
float simd_sum(std::span<const float> data) {
    constexpr size_t simd_width = 8; // AVX2: 8 floats por instrucción
    const size_t aligned_size = (data.size() / simd_width) * simd_width;
    
    __m256 sum_vec = _mm256_setzero_ps();
    
    // Procesamiento SIMD principal
    for (size_t i = 0; i < aligned_size; i += simd_width) {
        __m256 chunk = _mm256_loadu_ps(data.data() + i);
        sum_vec = _mm256_add_ps(sum_vec, chunk);
    }
    
    // Reducción horizontal del vector
    float result[8];
    _mm256_storeu_ps(result, sum_vec);
    float simd_sum = std::accumulate(result, result + 8, 0.0f);
    
    // Procesar elementos restantes
    for (size_t i = aligned_size; i < data.size(); ++i) {
        simd_sum += data[i];
    }
    
    return simd_sum;
}

// Algoritmo de convolución optimizado
void convolution_2d(std::span<const float> input, 
                   std::span<const float> kernel,
                   std::span<float> output,
                   int width, int height, int kernel_size) {
    const int half_kernel = kernel_size / 2;
    
    #pragma omp parallel for collapse(2)
    for (int y = half_kernel; y < height - half_kernel; ++y) {
        for (int x = half_kernel; x < width - half_kernel; ++x) {
            __m256 sum = _mm256_setzero_ps();
            
            // Aplicar kernel usando SIMD
            for (int ky = 0; ky < kernel_size; ++ky) {
                for (int kx = 0; kx < kernel_size; kx += 8) {
                    int input_idx = (y - half_kernel + ky) * width + (x - half_kernel + kx);
                    int kernel_idx = ky * kernel_size + kx;
                    
                    if (kx + 8 <= kernel_size) {
                        __m256 inp = _mm256_loadu_ps(&input[input_idx]);
                        __m256 ker = _mm256_loadu_ps(&kernel[kernel_idx]);
                        sum = _mm256_fmadd_ps(inp, ker, sum);
                    }
                }
            }
            
            // Reducir y almacenar resultado
            float result[8];
            _mm256_storeu_ps(result, sum);
            output[y * width + x] = std::accumulate(result, result + 8, 0.0f);
        }
    }
}`,

    memory_mapping: `// Memory Mapping con std::span
#include <span>
#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#include <iostream>
#include <memory>

class MemoryMappedFile {
    void* mapped_memory_;
    size_t file_size_;
    int fd_;
    
public:
    MemoryMappedFile(const char* filename) : mapped_memory_(nullptr), file_size_(0), fd_(-1) {
        fd_ = open(filename, O_RDWR | O_CREAT, 0644);
        if (fd_ == -1) throw std::runtime_error("Cannot open file");
        
        struct stat st;
        if (fstat(fd_, &st) == -1) {
            close(fd_);
            throw std::runtime_error("Cannot stat file");
        }
        file_size_ = st.st_size;
        
        mapped_memory_ = mmap(nullptr, file_size_, PROT_READ | PROT_WRITE, MAP_SHARED, fd_, 0);
        if (mapped_memory_ == MAP_FAILED) {
            close(fd_);
            throw std::runtime_error("Cannot map file");
        }
    }
    
    ~MemoryMappedFile() {
        if (mapped_memory_ != nullptr) munmap(mapped_memory_, file_size_);
        if (fd_ != -1) close(fd_);
    }
    
    // Acceso tipo-seguro con span
    template<typename T>
    std::span<T> as_span() {
        static_assert(std::is_trivially_copyable_v<T>);
        return std::span<T>(static_cast<T*>(mapped_memory_), file_size_ / sizeof(T));
    }
    
    // Vista de bytes raw
    std::span<std::byte> as_bytes() {
        return std::span<std::byte>(static_cast<std::byte*>(mapped_memory_), file_size_);
    }
    
    // Prefetch para optimización de cache
    void prefetch_range(size_t offset, size_t length) {
        char* ptr = static_cast<char*>(mapped_memory_) + offset;
        // Prefetch líneas de cache
        for (size_t i = 0; i < length; i += 64) {
            __builtin_prefetch(ptr + i, 0, 3);
        }
    }
};

// Procesamiento de archivos grandes con spans
template<typename T>
void process_large_dataset(std::span<T> data) {
    constexpr size_t chunk_size = 1024 * 1024; // 1MB chunks
    
    for (size_t offset = 0; offset < data.size(); offset += chunk_size) {
        size_t current_chunk = std::min(chunk_size, data.size() - offset);
        auto chunk = data.subspan(offset, current_chunk);
        
        // Procesar chunk en paralelo
        #pragma omp parallel for
        for (size_t i = 0; i < chunk.size(); ++i) {
            chunk[i] = transform_data(chunk[i]);
        }
        
        // Sincronizar con disco cada chunk
        msync(chunk.data(), chunk.size() * sizeof(T), MS_ASYNC);
    }
}`,

    multidimensional: `// Spans Multidimensionales y Vistas Complejas
#include <span>
#include <vector>
#include <array>
#include <concepts>

// Span 2D usando template wrapper
template<typename T>
class span_2d {
    std::span<T> data_;
    size_t width_;
    size_t height_;
    
public:
    span_2d(std::span<T> data, size_t width, size_t height) 
        : data_(data), width_(width), height_(height) {
        assert(data.size() >= width * height);
    }
    
    // Acceso 2D con operator()
    T& operator()(size_t row, size_t col) {
        return data_[row * width_ + col];
    }
    
    const T& operator()(size_t row, size_t col) const {
        return data_[row * width_ + col];
    }
    
    // Slice de filas como spans 1D
    std::span<T> row(size_t r) {
        return data_.subspan(r * width_, width_);
    }
    
    // Stride views para columnas
    class column_view {
        T* start_;
        size_t stride_;
        size_t count_;
    public:
        column_view(T* start, size_t stride, size_t count) 
            : start_(start), stride_(stride), count_(count) {}
        
        T& operator[](size_t i) { return *(start_ + i * stride_); }
        const T& operator[](size_t i) const { return *(start_ + i * stride_); }
        size_t size() const { return count_; }
    };
    
    column_view column(size_t c) {
        return column_view(data_.data() + c, width_, height_);
    }
    
    // Subvistas rectangulares
    span_2d<T> subview(size_t start_row, size_t start_col, 
                      size_t rows, size_t cols) {
        std::vector<T> temp;
        temp.reserve(rows * cols);
        
        for (size_t r = 0; r < rows; ++r) {
            auto source_row = row(start_row + r);
            auto col_span = source_row.subspan(start_col, cols);
            temp.insert(temp.end(), col_span.begin(), col_span.end());
        }
        
        return span_2d<T>(std::span(temp), cols, rows);
    }
};

// Algoritmos de procesamiento de imágenes
template<typename T>
void gaussian_blur(span_2d<T>& image) {
    const std::array<std::array<float, 3>, 3> kernel = {{
        {{1.0f/16, 2.0f/16, 1.0f/16}},
        {{2.0f/16, 4.0f/16, 2.0f/16}},
        {{1.0f/16, 2.0f/16, 1.0f/16}}
    }};
    
    auto temp = image; // Copia temporal
    
    for (size_t row = 1; row < image.height() - 1; ++row) {
        for (size_t col = 1; col < image.width() - 1; ++col) {
            float sum = 0.0f;
            
            for (int kr = -1; kr <= 1; ++kr) {
                for (int kc = -1; kc <= 1; ++kc) {
                    sum += static_cast<float>(temp(row + kr, col + kc)) * 
                           kernel[kr + 1][kc + 1];
                }
            }
            
            image(row, col) = static_cast<T>(sum);
        }
    }
}

// Transposición de matrices usando spans
template<typename T>
void transpose_matrix(span_2d<const T> input, span_2d<T> output) {
    assert(input.width() == output.height());
    assert(input.height() == output.width());
    
    #pragma omp parallel for collapse(2)
    for (size_t i = 0; i < input.height(); ++i) {
        for (size_t j = 0; j < input.width(); ++j) {
            output(j, i) = input(i, j);
        }
    }
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 73: Advanced std::span" : "Lección 73: std::span Avanzado"}
      lessonId="lesson-73"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'C++ Array Views and Memory Mapping' : 'Vistas de Arrays y Mapeo de Memoria en C++'}
          </SectionTitle>
          <Button 
            onClick={() => setState(prev => ({ ...prev, language: prev.language === 'en' ? 'es' : 'en' }))}
            variant="secondary"
          >
            {state.language === 'en' ? 'Español' : 'English'}
          </Button>
        </div>

        <LearningObjectives
          objectives={
            state.language === 'en' 
              ? [
                  'Master std::span for efficient array view operations',
                  'Implement SIMD algorithms with contiguous memory spans',
                  'Create memory-mapped file processing with span views',
                  'Design multidimensional span wrappers for matrix operations',
                  'Understand performance characteristics and compiler optimizations',
                  'Apply span patterns in high-performance computing scenarios'
                ]
              : [
                  'Dominar std::span para operaciones eficientes de vistas de arrays',
                  'Implementar algoritmos SIMD con spans de memoria contigua',
                  'Crear procesamiento de archivos mapeados en memoria con vistas span',
                  'Diseñar wrappers span multidimensionales para operaciones de matrices',
                  'Entender características de rendimiento y optimizaciones del compilador',
                  'Aplicar patrones span en escenarios de computación de alto rendimiento'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive std::span Demonstration' : 'Demostración Interactiva de std::span'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <SpanVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('basic_operations')}
            variant={state.scenario === 'basic_operations' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Basic Operations' : 'Operaciones Básicas'}
          </Button>
          <Button 
            onClick={() => runScenario('simd_algorithms')}
            variant={state.scenario === 'simd_algorithms' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'SIMD Algorithms' : 'Algoritmos SIMD'}
          </Button>
          <Button 
            onClick={() => runScenario('memory_mapping')}
            variant={state.scenario === 'memory_mapping' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Memory Mapping' : 'Mapeo de Memoria'}
          </Button>
          <Button 
            onClick={() => runScenario('multidimensional')}
            variant={state.scenario === 'multidimensional' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Multidimensional' : 'Multidimensional'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Operations/sec' : 'Operaciones/seg', 
              value: state.operations,
              color: '#00ff00'
            },
            { 
              label: state.language === 'en' ? 'Memory Access' : 'Acceso Memoria', 
              value: state.memoryAccess,
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'SIMD Ops' : 'Ops SIMD', 
              value: state.simdOps,
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Cache Efficiency %' : 'Eficiencia Cache %', 
              value: Math.round(state.cacheEfficiency),
              color: '#ff0080'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'basic_operations' && (state.language === 'en' ? 'Basic std::span Operations' : 'Operaciones Básicas de std::span')}
          {state.scenario === 'simd_algorithms' && (state.language === 'en' ? 'SIMD Algorithms with Spans' : 'Algoritmos SIMD con Spans')}
          {state.scenario === 'memory_mapping' && (state.language === 'en' ? 'Memory Mapping with std::span' : 'Mapeo de Memoria con std::span')}
          {state.scenario === 'multidimensional' && (state.language === 'en' ? 'Multidimensional Span Views' : 'Vistas Span Multidimensionales')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'basic_operations' ? 
              (state.language === 'en' ? 'Basic Operations Implementation' : 'Implementación de Operaciones Básicas') :
            state.scenario === 'simd_algorithms' ? 
              (state.language === 'en' ? 'SIMD Algorithm Implementation' : 'Implementación de Algoritmos SIMD') :
            state.scenario === 'memory_mapping' ? 
              (state.language === 'en' ? 'Memory Mapping Implementation' : 'Implementación de Mapeo de Memoria') :
            (state.language === 'en' ? 'Multidimensional Spans Implementation' : 'Implementación de Spans Multidimensionales')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Key Concepts and Best Practices' : 'Conceptos Clave y Mejores Prácticas'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #333'
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🎯 Production-Ready Patterns:' : '🎯 Patrones Listos para Producción:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Unified Container Interface:' : 'Interfaz Unificada de Contenedores:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Functions accepting std::span work with vectors, arrays, and C-arrays seamlessly'
                : 'Funciones que aceptan std::span funcionan con vectores, arrays y C-arrays sin problemas'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Zero-Copy Operations:' : 'Operaciones Sin Copia:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Subviews and slicing operations create new spans without copying data'
                : 'Las operaciones de subvistas y slicing crean nuevos spans sin copiar datos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'SIMD Optimization:' : 'Optimización SIMD:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Contiguous memory layout enables efficient vectorized operations'
                : 'El layout de memoria contigua permite operaciones vectorizadas eficientes'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Memory-Mapped Files:' : 'Archivos Mapeados en Memoria:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Direct file system integration without explicit I/O operations'
                : 'Integración directa del sistema de archivos sin operaciones I/O explícitas'
              }
            </li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: '#2e1a1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #800'
        }}>
          <h4 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
            {state.language === 'en' ? '⚠️ Common Pitfalls:' : '⚠️ Errores Comunes:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Lifetime Management:' : 'Gestión de Tiempo de Vida:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Spans are non-owning views - ensure underlying data outlives the span'
                : 'Los spans son vistas no propietarias - asegúrate que los datos subyacentes outliven al span'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Static vs Dynamic:' : 'Estático vs Dinámico:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Use span<T, N> for compile-time known sizes, span<T> for runtime sizes'
                : 'Usa span<T, N> para tamaños conocidos en tiempo de compilación, span<T> para tamaños runtime'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Bounds Checking:' : 'Verificación de Límites:'}</strong>{' '}
              {state.language === 'en' 
                ? 'operator[] provides no bounds checking, use at() for safe access'
                : 'operator[] no verifica límites, usa at() para acceso seguro'
              }
            </li>
          </ul>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default Lesson73_Span;