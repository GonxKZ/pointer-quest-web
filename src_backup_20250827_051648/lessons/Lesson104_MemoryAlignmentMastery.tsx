import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line, Cylinder } from '@react-three/drei';
import { useApp } from '../context/AppContext';

function MemoryAlignmentVisualization() {
  const [alignmentMetrics, setAlignmentMetrics] = useState({
    naturalAlignment: 0,
    overAlignment: 0,
    cacheLineHits: 0,
    simdOptimization: 0,
    performanceGain: 95.2
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAlignmentMetrics(prev => ({
        naturalAlignment: prev.naturalAlignment + Math.floor(Math.random() * 4) + 1,
        overAlignment: prev.overAlignment + Math.floor(Math.random() * 3) + 1,
        cacheLineHits: prev.cacheLineHits + Math.floor(Math.random() * 5) + 2,
        simdOptimization: prev.simdOptimization + Math.floor(Math.random() * 2) + 1,
        performanceGain: Math.min(99.9, prev.performanceGain + (Math.random() - 0.4) * 0.5)
      }));
    }, 800);
    
    return () => clearInterval(interval);
  }, []);

  const alignmentTypes = [
    { name: 'naturalAlignment', pos: [-4, 2, 0], color: '#00ff88', label: 'Natural', size: [1.2, 0.6, 0.3] },
    { name: 'overAlignment', pos: [-1.5, 2, 0], color: '#00d4ff', label: 'Over-aligned', size: [1.4, 0.8, 0.4] },
    { name: 'cacheLineHits', pos: [1.5, 2, 0], color: '#ff6b6b', label: 'Cache Line', size: [1.8, 0.5, 0.6] },
    { name: 'simdOptimization', pos: [4, 2, 0], color: '#ffa500', label: 'SIMD Opt', size: [1.6, 0.7, 0.5] },
  ];

  return (
    <group>
      {/* Memory alignment visualization blocks */}
      {alignmentTypes.map((type) => (
        <group key={type.name}>
          <Box
            position={type.pos}
            args={type.size}
          >
            <meshStandardMaterial
              color={type.color}
              opacity={0.7 + (alignmentMetrics[type.name] % 8) / 80}
              transparent
            />
          </Box>
          <Text
            position={[type.pos[0], type.pos[1] + 1.2, type.pos[2]]}
            fontSize={0.2}
            color="white"
            anchorX="center"
          >
            {type.label}
          </Text>
          <Text
            position={[type.pos[0], type.pos[1] - 1.2, type.pos[2]]}
            fontSize={0.32}
            color={type.color}
            anchorX="center"
          >
            {alignmentMetrics[type.name]}
          </Text>
        </group>
      ))}
      
      {/* Central memory controller sphere */}
      <Sphere position={[0, 0, 0]} args={[0.5]}>
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </Sphere>
      
      {/* Cache line visualization */}
      <Cylinder position={[0, -1.5, 0]} args={[3, 3, 0.1]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#444444" opacity={0.3} transparent />
      </Cylinder>
      
      {/* Connection lines showing alignment relationships */}
      <Line
        points={[[-4, 2, 0], [0, 0, 0], [1.5, 2, 0], [4, 2, 0]]}
        color="#ffffff"
        lineWidth={2}
        opacity={0.6}
        transparent
      />
      
      {/* SIMD vector lanes */}
      {[-2, -1, 0, 1, 2].map((offset) => (
        <Box
          key={offset}
          position={[offset * 0.6, -3, 0]}
          args={[0.4, 0.2, 0.2]}
        >
          <meshStandardMaterial color="#00d4ff" opacity={0.8} transparent />
        </Box>
      ))}
      
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
      >
        Memory Alignment Mastery
      </Text>
      
      <Text
        position={[0, -2.7, 0]}
        fontSize={0.25}
        color={alignmentMetrics.performanceGain > 95 ? '#00ff88' : '#ffaa00'}
        anchorX="center"
      >
        {`Performance: ${alignmentMetrics.performanceGain.toFixed(1)}%`}
      </Text>

      <Text
        position={[0, -3.8, 0]}
        fontSize={0.18}
        color="#00d4ff"
        anchorX="center"
      >
        SIMD Vector Lanes (128-bit)
      </Text>
    </group>
  );
}

export default function Lesson104_MemoryAlignmentMastery() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'Alignment Requirements & Hardware Implications' : 'Requisitos de Alineación e Implicaciones de Hardware',
      code: `#include <iostream>
#include <memory>
#include <cstddef>
#include <new>
#include <vector>
#include <chrono>
#include <immintrin.h>  // Para SIMD

// Demostración de alineación natural y requisitos de hardware
template<typename T>
void analyze_alignment_requirements() {
    std::cout << "\\n=== Análisis de Alineación para " << typeid(T).name() << " ===" << std::endl;
    
    // Alineación natural del tipo
    std::cout << "sizeof(" << typeid(T).name() << "): " << sizeof(T) << " bytes" << std::endl;
    std::cout << "alignof(" << typeid(T).name() << "): " << alignof(T) << " bytes" << std::endl;
    
    // Crear instancias y verificar alineación real
    T instances[5];
    for (int i = 0; i < 5; ++i) {
        void* addr = &instances[i];
        std::cout << "instances[" << i << "] address: " << addr 
                  << " (aligned: " << (reinterpret_cast<uintptr_t>(addr) % alignof(T) == 0 ? "✓" : "✗") << ")" << std::endl;
    }
}

// Estructura con alineación problemática
struct UnalignedStruct {
    char a;      // 1 byte
    double b;    // 8 bytes - requiere alineación de 8
    char c;      // 1 byte
    int d;       // 4 bytes - requiere alineación de 4
};

// Estructura optimizada para alineación
struct AlignedStruct {
    double b;    // 8 bytes - alineación más restrictiva primero
    int d;       // 4 bytes
    char a;      // 1 byte
    char c;      // 1 byte
    // Padding implícito para mantener alineación
};

void demonstrate_structure_alignment() {
    std::cout << "\\n=== Impacto de Alineación en Estructuras ===" << std::endl;
    
    std::cout << "UnalignedStruct:" << std::endl;
    std::cout << "  sizeof: " << sizeof(UnalignedStruct) << " bytes" << std::endl;
    std::cout << "  alignof: " << alignof(UnalignedStruct) << " bytes" << std::endl;
    
    std::cout << "AlignedStruct:" << std::endl;
    std::cout << "  sizeof: " << sizeof(AlignedStruct) << " bytes" << std::endl;
    std::cout << "  alignof: " << alignof(AlignedStruct) << " bytes" << std::endl;
    
    // Análisis de offset de miembros
    UnalignedStruct unaligned{};
    std::cout << "\\nOffsets en UnalignedStruct:" << std::endl;
    std::cout << "  a offset: " << offsetof(UnalignedStruct, a) << std::endl;
    std::cout << "  b offset: " << offsetof(UnalignedStruct, b) << std::endl;
    std::cout << "  c offset: " << offsetof(UnalignedStruct, c) << std::endl;
    std::cout << "  d offset: " << offsetof(UnalignedStruct, d) << std::endl;
}`,
      explanation: state.language === 'en'
        ? 'Understanding natural alignment requirements is crucial for optimal performance. The CPU accesses aligned data more efficiently, and misaligned access can cause performance penalties or even crashes on some architectures.'
        : 'Entender los requisitos de alineación natural es crucial para un rendimiento óptimo. La CPU accede a datos alineados de manera más eficiente, y el acceso desalineado puede causar penalizaciones de rendimiento o incluso crashes en algunas arquitecturas.'
    },
    {
      title: state.language === 'en' ? 'Custom Alignment with alignas & aligned_storage' : 'Alineación Personalizada con alignas y aligned_storage',
      code: `#include <type_traits>
#include <memory>
#include <iostream>
#include <new>

// Clase que requiere alineación específica (ej. para SIMD)
class alignas(32) SIMDVector {
private:
    float data[8];  // 8 floats = 32 bytes, alineados a 32 bytes
    
public:
    SIMDVector() : data{0} {
        // Verificar que la alineación se cumple
        if (reinterpret_cast<uintptr_t>(this) % 32 != 0) {
            throw std::runtime_error("Alineación incorrecta para SIMDVector");
        }
    }
    
    void process_with_avx() {
        #ifdef __AVX__
        __m256 vec = _mm256_load_ps(data);  // Requiere alineación de 32 bytes
        vec = _mm256_mul_ps(vec, _mm256_set1_ps(2.0f));
        _mm256_store_ps(data, vec);
        #endif
    }
    
    float& operator[](size_t index) { return data[index]; }
    const float& operator[](size_t index) const { return data[index]; }
};

// Uso de std::aligned_storage para control manual de alineación
template<typename T, size_t Alignment = alignof(T)>
class AlignedAllocator {
private:
    using StorageType = std::aligned_storage_t<sizeof(T), Alignment>;
    
public:
    static T* allocate(size_t count) {
        // Asegurar que el tipo tiene la alineación requerida
        static_assert(Alignment >= alignof(T), 
                      "La alineación especificada es insuficiente para el tipo");
        
        // Alocar memoria alineada
        void* ptr = std::aligned_alloc(Alignment, sizeof(T) * count);
        if (!ptr) {
            throw std::bad_alloc{};
        }
        
        std::cout << "Allocated " << count << " objects of type " << typeid(T).name() 
                  << " with " << Alignment << "-byte alignment at " << ptr << std::endl;
        
        return static_cast<T*>(ptr);
    }
    
    static void deallocate(T* ptr) {
        std::free(ptr);
    }
};

// Demostración de over-alignment para diferentes casos de uso
void demonstrate_custom_alignment() {
    std::cout << "\\n=== Alineación Personalizada ===" << std::endl;
    
    // Caso 1: Objeto con alineación específica en stack
    {
        SIMDVector vec;
        std::cout << "SIMDVector address: " << &vec 
                  << " (aligned to 32: " << (reinterpret_cast<uintptr_t>(&vec) % 32 == 0 ? "✓" : "✗") << ")" << std::endl;
        
        for (int i = 0; i < 8; ++i) {
            vec[i] = static_cast<float>(i + 1);
        }
        vec.process_with_avx();
    }
    
    // Caso 2: Alineación dinámica con allocator personalizado
    {
        constexpr size_t cache_line_size = 64;
        auto* aligned_doubles = AlignedAllocator<double, cache_line_size>::allocate(8);
        
        // Verificar alineación
        std::cout << "Aligned doubles address: " << aligned_doubles
                  << " (cache-line aligned: " << (reinterpret_cast<uintptr_t>(aligned_doubles) % cache_line_size == 0 ? "✓" : "✗") << ")" << std::endl;
        
        AlignedAllocator<double, cache_line_size>::deallocate(aligned_doubles);
    }
}`,
      explanation: state.language === 'en'
        ? 'Custom alignment using alignas and aligned_storage allows precise control over memory layout for performance-critical code. This is essential for SIMD operations, cache optimization, and avoiding false sharing in multithreaded applications.'
        : 'La alineación personalizada usando alignas y aligned_storage permite control preciso sobre el layout de memoria para código crítico en rendimiento. Esto es esencial para operaciones SIMD, optimización de cache y evitar false sharing en aplicaciones multihilo.'
    },
    {
      title: state.language === 'en' ? 'Over-alignment for SIMD Optimization' : 'Over-alignment para Optimización SIMD',
      code: `#include <immintrin.h>
#include <vector>
#include <chrono>
#include <random>
#include <iostream>
#include <memory>

// Clase especializada para operaciones vectoriales SIMD
class alignas(64) SIMDMatrix {  // Alineación a cache line completa
private:
    static constexpr size_t ROWS = 64;
    static constexpr size_t COLS = 64;
    static constexpr size_t SIMD_WIDTH = 8;  // AVX puede procesar 8 floats
    
    float data[ROWS * COLS];
    
public:
    SIMDMatrix() {
        // Inicializar con datos aleatorios
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_real_distribution<float> dis(0.0f, 1.0f);
        
        for (size_t i = 0; i < ROWS * COLS; ++i) {
            data[i] = dis(gen);
        }
    }
    
    // Multiplicación por escalar usando SIMD
    void scalar_multiply_simd(float scalar) {
        #ifdef __AVX__
        const __m256 scalar_vec = _mm256_set1_ps(scalar);
        
        // Procesar en chunks de 8 floats (256 bits)
        for (size_t i = 0; i < ROWS * COLS; i += SIMD_WIDTH) {
            __m256 data_vec = _mm256_load_ps(&data[i]);  // Requiere alineación
            data_vec = _mm256_mul_ps(data_vec, scalar_vec);
            _mm256_store_ps(&data[i], data_vec);
        }
        #else
        // Fallback sin SIMD
        for (size_t i = 0; i < ROWS * COLS; ++i) {
            data[i] *= scalar;
        }
        #endif
    }
    
    // Versión escalar para comparación
    void scalar_multiply_naive(float scalar) {
        for (size_t i = 0; i < ROWS * COLS; ++i) {
            data[i] *= scalar;
        }
    }
    
    // Operación de reducción sum con SIMD
    float sum_simd() const {
        #ifdef __AVX__
        __m256 sum_vec = _mm256_setzero_ps();
        
        for (size_t i = 0; i < ROWS * COLS; i += SIMD_WIDTH) {
            __m256 data_vec = _mm256_load_ps(&data[i]);
            sum_vec = _mm256_add_ps(sum_vec, data_vec);
        }
        
        // Horizontal sum de los 8 elementos del vector
        float result[8];
        _mm256_store_ps(result, sum_vec);
        return result[0] + result[1] + result[2] + result[3] + 
               result[4] + result[5] + result[6] + result[7];
        #else
        float sum = 0.0f;
        for (size_t i = 0; i < ROWS * COLS; ++i) {
            sum += data[i];
        }
        return sum;
        #endif
    }
    
    float& operator()(size_t row, size_t col) {
        return data[row * COLS + col];
    }
};

// Benchmark para demostrar beneficios de alineación SIMD
void benchmark_simd_alignment() {
    std::cout << "\\n=== Benchmark SIMD con Over-alignment ===" << std::endl;
    
    SIMDMatrix matrix;
    constexpr int iterations = 1000;
    constexpr float scalar = 1.5f;
    
    // Benchmark versión SIMD
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < iterations; ++i) {
        matrix.scalar_multiply_simd(scalar);
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto simd_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    // Benchmark versión escalar
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < iterations; ++i) {
        matrix.scalar_multiply_naive(scalar);
    }
    end = std::chrono::high_resolution_clock::now();
    auto scalar_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    std::cout << "SIMD version: " << simd_duration.count() << " μs" << std::endl;
    std::cout << "Scalar version: " << scalar_duration.count() << " μs" << std::endl;
    std::cout << "Speedup: " << (double)scalar_duration.count() / simd_duration.count() << "x" << std::endl;
    
    // Verificar que la matriz está correctamente alineada
    std::cout << "Matrix alignment: " << reinterpret_cast<uintptr_t>(&matrix) % 64 
              << " (should be 0 for 64-byte alignment)" << std::endl;
}`,
      explanation: state.language === 'en'
        ? 'Over-alignment for SIMD operations can provide significant performance improvements. By aligning data to 256-bit (32-byte) or 512-bit (64-byte) boundaries, we enable vectorized operations that process multiple elements simultaneously.'
        : 'El over-alignment para operaciones SIMD puede proporcionar mejoras significativas de rendimiento. Al alinear datos a límites de 256-bit (32-byte) o 512-bit (64-byte), habilitamos operaciones vectorizadas que procesan múltiples elementos simultáneamente.'
    },
    {
      title: state.language === 'en' ? 'Alignment & Performance in Data Structures' : 'Alineación y Rendimiento en Estructuras de Datos',
      code: `#include <array>
#include <vector>
#include <chrono>
#include <iostream>
#include <memory>
#include <atomic>
#include <thread>

// Estructura con alineación subóptima
struct UnoptimizedNode {
    char flag;              // 1 byte
    std::atomic<int> counter; // 4 bytes (atomic)
    double value;           // 8 bytes
    void* next;             // 8 bytes
    char padding[3];        // Padding manual incorrecto
};

// Estructura optimizada para rendimiento
struct alignas(64) OptimizedNode {  // Alinear a cache line
    double value;           // 8 bytes - acceso frecuente, alineación natural
    void* next;             // 8 bytes
    std::atomic<int> counter; // 4 bytes
    char flag;              // 1 byte
    char reserved[43];      // Padding hasta cache line completa (64 bytes)
    
    // Constructor que verifica alineación
    OptimizedNode() : value(0.0), next(nullptr), counter(0), flag(0) {
        static_assert(sizeof(OptimizedNode) == 64, "Node debe ser exactamente 64 bytes");
        static_assert(alignof(OptimizedNode) == 64, "Node debe alinearse a 64 bytes");
    }
};

// Contenedor con allocator que garantiza alineación
template<typename T>
class CacheAlignedVector {
private:
    T* data_;
    size_t size_;
    size_t capacity_;
    static constexpr size_t alignment = 64;  // Cache line
    
public:
    explicit CacheAlignedVector(size_t initial_capacity = 16) 
        : size_(0), capacity_(initial_capacity) {
        data_ = static_cast<T*>(std::aligned_alloc(alignment, sizeof(T) * capacity_));
        if (!data_) {
            throw std::bad_alloc{};
        }
    }
    
    ~CacheAlignedVector() {
        for (size_t i = 0; i < size_; ++i) {
            data_[i].~T();
        }
        std::free(data_);
    }
    
    void push_back(const T& item) {
        if (size_ >= capacity_) {
            resize_capacity(capacity_ * 2);
        }
        new (&data_[size_]) T(item);
        ++size_;
    }
    
    T& operator[](size_t index) { return data_[index]; }
    const T& operator[](size_t index) const { return data_[index]; }
    size_t size() const { return size_; }
    
    // Verificar alineación de elementos
    bool verify_alignment() const {
        for (size_t i = 0; i < size_; ++i) {
            if (reinterpret_cast<uintptr_t>(&data_[i]) % alignment != 0) {
                return false;
            }
        }
        return true;
    }
    
private:
    void resize_capacity(size_t new_capacity) {
        T* new_data = static_cast<T*>(std::aligned_alloc(alignment, sizeof(T) * new_capacity));
        if (!new_data) {
            throw std::bad_alloc{};
        }
        
        // Move existing elements
        for (size_t i = 0; i < size_; ++i) {
            new (&new_data[i]) T(std::move(data_[i]));
            data_[i].~T();
        }
        
        std::free(data_);
        data_ = new_data;
        capacity_ = new_capacity;
    }
};

// Benchmark de acceso secuencial vs aleatorio
void benchmark_data_structure_alignment() {
    std::cout << "\\n=== Benchmark Alineación en Estructuras de Datos ===" << std::endl;
    
    constexpr size_t num_elements = 10000;
    constexpr int iterations = 1000;
    
    // Crear vectores con diferentes tipos de nodos
    std::vector<UnoptimizedNode> unopt_vector(num_elements);
    CacheAlignedVector<OptimizedNode> opt_vector;
    
    for (size_t i = 0; i < num_elements; ++i) {
        opt_vector.push_back(OptimizedNode{});
    }
    
    std::cout << "UnoptimizedNode size: " << sizeof(UnoptimizedNode) << " bytes" << std::endl;
    std::cout << "OptimizedNode size: " << sizeof(OptimizedNode) << " bytes" << std::endl;
    std::cout << "Optimized vector alignment verified: " << opt_vector.verify_alignment() << std::endl;
    
    // Benchmark acceso secuencial
    auto start = std::chrono::high_resolution_clock::now();
    for (int iter = 0; iter < iterations; ++iter) {
        for (size_t i = 0; i < num_elements; ++i) {
            unopt_vector[i].value += 1.0;
            unopt_vector[i].counter.fetch_add(1, std::memory_order_relaxed);
        }
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto unopt_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    start = std::chrono::high_resolution_clock::now();
    for (int iter = 0; iter < iterations; ++iter) {
        for (size_t i = 0; i < num_elements; ++i) {
            opt_vector[i].value += 1.0;
            opt_vector[i].counter.fetch_add(1, std::memory_order_relaxed);
        }
    }
    end = std::chrono::high_resolution_clock::now();
    auto opt_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    std::cout << "Unoptimized access: " << unopt_duration.count() << " μs" << std::endl;
    std::cout << "Optimized access: " << opt_duration.count() << " μs" << std::endl;
    std::cout << "Performance improvement: " 
              << ((double)unopt_duration.count() / opt_duration.count() - 1.0) * 100.0 << "%" << std::endl;
}`,
      explanation: state.language === 'en'
        ? 'Proper alignment in data structures can dramatically improve cache performance. By aligning structures to cache line boundaries and organizing members by access patterns, we minimize cache misses and false sharing in concurrent access scenarios.'
        : 'La alineación adecuada en estructuras de datos puede mejorar dramáticamente el rendimiento del cache. Al alinear estructuras a límites de línea de cache y organizar miembros por patrones de acceso, minimizamos cache misses y false sharing en escenarios de acceso concurrente.'
    },
    {
      title: state.language === 'en' ? 'Hardware Cache Line Alignment Strategies' : 'Estrategias de Alineación de Línea de Cache Hardware',
      code: `#include <atomic>
#include <thread>
#include <vector>
#include <chrono>
#include <iostream>
#include <memory>

// Configuración de cache line para diferentes arquitecturas
namespace CacheConfig {
    constexpr size_t CACHE_LINE_SIZE = 64;  // Típico para x86-64
    constexpr size_t L1_CACHE_SIZE = 32 * 1024;      // 32 KB típico
    constexpr size_t L2_CACHE_SIZE = 256 * 1024;     // 256 KB típico  
    constexpr size_t L3_CACHE_SIZE = 8 * 1024 * 1024; // 8 MB típico
}

// Estructura que causa false sharing
struct FalseSharingCounter {
    std::atomic<long> counter1;
    std::atomic<long> counter2;  // En la misma cache line que counter1
    std::atomic<long> counter3;
    std::atomic<long> counter4;
};

// Estructura que evita false sharing con padding
struct alignas(CacheConfig::CACHE_LINE_SIZE) CacheLinePaddedCounter {
    std::atomic<long> counter;
    char padding[CacheConfig::CACHE_LINE_SIZE - sizeof(std::atomic<long>)];
};

// Clase para análisis de patrones de acceso a memoria
class CacheAnalyzer {
private:
    static constexpr size_t ARRAY_SIZE = CacheConfig::L3_CACHE_SIZE / sizeof(int);
    std::unique_ptr<int[]> data_;
    
public:
    CacheAnalyzer() {
        // Alocar memoria alineada a cache line
        void* raw_ptr = std::aligned_alloc(CacheConfig::CACHE_LINE_SIZE, 
                                          sizeof(int) * ARRAY_SIZE);
        if (!raw_ptr) {
            throw std::bad_alloc{};
        }
        
        data_.reset(static_cast<int*>(raw_ptr));
        
        // Inicializar datos
        for (size_t i = 0; i < ARRAY_SIZE; ++i) {
            data_[i] = static_cast<int>(i);
        }
    }
    
    ~CacheAnalyzer() {
        std::free(data_.release());
    }
    
    // Patrón de acceso secuencial (cache-friendly)
    long sequential_sum() {
        long sum = 0;
        for (size_t i = 0; i < ARRAY_SIZE; ++i) {
            sum += data_[i];
        }
        return sum;
    }
    
    // Patrón de acceso aleatorio (cache-unfriendly)
    long random_sum(const std::vector<size_t>& indices) {
        long sum = 0;
        for (size_t index : indices) {
            if (index < ARRAY_SIZE) {
                sum += data_[index];
            }
        }
        return sum;
    }
    
    // Acceso con stride específico para analizar cache behavior
    long strided_sum(size_t stride) {
        long sum = 0;
        for (size_t i = 0; i < ARRAY_SIZE; i += stride) {
            sum += data_[i];
        }
        return sum;
    }
};

// Benchmark de false sharing
void benchmark_false_sharing() {
    std::cout << "\\n=== Benchmark False Sharing ===" << std::endl;
    
    constexpr int num_threads = 4;
    constexpr int iterations = 1000000;
    
    // Test con false sharing
    FalseSharingCounter false_sharing_counters{};
    
    auto start = std::chrono::high_resolution_clock::now();
    
    std::vector<std::thread> threads;
    for (int t = 0; t < num_threads; ++t) {
        threads.emplace_back([&false_sharing_counters, t, iterations]() {
            std::atomic<long>* counter = nullptr;
            switch (t) {
                case 0: counter = &false_sharing_counters.counter1; break;
                case 1: counter = &false_sharing_counters.counter2; break;
                case 2: counter = &false_sharing_counters.counter3; break;
                case 3: counter = &false_sharing_counters.counter4; break;
            }
            
            for (int i = 0; i < iterations; ++i) {
                counter->fetch_add(1, std::memory_order_relaxed);
            }
        });
    }
    
    for (auto& thread : threads) {
        thread.join();
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto false_sharing_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    // Test sin false sharing (cache line padded)
    std::vector<CacheLinePaddedCounter> padded_counters(num_threads);
    
    start = std::chrono::high_resolution_clock::now();
    
    threads.clear();
    for (int t = 0; t < num_threads; ++t) {
        threads.emplace_back([&padded_counters, t, iterations]() {
            for (int i = 0; i < iterations; ++i) {
                padded_counters[t].counter.fetch_add(1, std::memory_order_relaxed);
            }
        });
    }
    
    for (auto& thread : threads) {
        thread.join();
    }
    
    end = std::chrono::high_resolution_clock::now();
    auto padded_duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    std::cout << "False sharing: " << false_sharing_duration.count() << " μs" << std::endl;
    std::cout << "Cache padded: " << padded_duration.count() << " μs" << std::endl;
    std::cout << "Performance improvement: " 
              << ((double)false_sharing_duration.count() / padded_duration.count() - 1.0) * 100.0 << "%" << std::endl;
}

// Benchmark de patrones de acceso a cache
void benchmark_cache_patterns() {
    std::cout << "\\n=== Benchmark Patrones de Cache ===" << std::endl;
    
    CacheAnalyzer analyzer;
    constexpr int runs = 10;
    
    // Generar índices aleatorios
    std::vector<size_t> random_indices(100000);
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<size_t> dis(0, CacheConfig::L3_CACHE_SIZE / sizeof(int) - 1);
    
    for (auto& index : random_indices) {
        index = dis(gen);
    }
    
    // Benchmark acceso secuencial
    auto start = std::chrono::high_resolution_clock::now();
    for (int run = 0; run < runs; ++run) {
        volatile long sum = analyzer.sequential_sum();
        (void)sum;  // Evitar optimización
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto sequential_duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // Benchmark acceso aleatorio
    start = std::chrono::high_resolution_clock::now();
    for (int run = 0; run < runs; ++run) {
        volatile long sum = analyzer.random_sum(random_indices);
        (void)sum;
    }
    end = std::chrono::high_resolution_clock::now();
    auto random_duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // Benchmark con diferentes strides
    std::vector<std::pair<size_t, long>> stride_results;
    for (size_t stride : {1, 2, 4, 8, 16, 32, 64, 128}) {
        start = std::chrono::high_resolution_clock::now();
        for (int run = 0; run < runs; ++run) {
            volatile long sum = analyzer.strided_sum(stride);
            (void)sum;
        }
        end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
        stride_results.emplace_back(stride, duration);
    }
    
    std::cout << "Sequential access: " << sequential_duration.count() << " ms" << std::endl;
    std::cout << "Random access: " << random_duration.count() << " ms" << std::endl;
    std::cout << "Random vs Sequential slowdown: " 
              << (double)random_duration.count() / sequential_duration.count() << "x" << std::endl;
    
    std::cout << "\\nStride pattern results:" << std::endl;
    for (const auto& [stride, duration] : stride_results) {
        std::cout << "  Stride " << stride << ": " << duration << " ms" << std::endl;
    }
}`,
      explanation: state.language === 'en'
        ? 'Cache line alignment strategies are critical for high-performance applications. Understanding cache hierarchies, false sharing, and memory access patterns allows us to optimize data layout for maximum cache efficiency and minimize memory bandwidth bottlenecks.'
        : 'Las estrategias de alineación de línea de cache son críticas para aplicaciones de alto rendimiento. Entender las jerarquías de cache, false sharing y patrones de acceso a memoria nos permite optimizar el layout de datos para máxima eficiencia de cache y minimizar cuellos de botella de ancho de banda de memoria.'
    },
    {
      title: state.language === 'en' ? 'Cross-platform Alignment Considerations' : 'Consideraciones de Alineación Multi-plataforma',
      code: `#include <iostream>
#include <type_traits>
#include <cstddef>
#include <memory>
#include <cstring>

// Macro para detectar la plataforma y arquitectura
#ifdef _WIN32
    #define PLATFORM_WINDOWS
    #ifdef _WIN64
        #define ARCH_64BIT
    #else
        #define ARCH_32BIT
    #endif
#elif defined(__linux__)
    #define PLATFORM_LINUX
    #ifdef __x86_64__
        #define ARCH_64BIT
    #elif defined(__i386__)
        #define ARCH_32BIT
    #elif defined(__aarch64__)
        #define ARCH_ARM64
    #elif defined(__arm__)
        #define ARCH_ARM32
    #endif
#elif defined(__APPLE__)
    #define PLATFORM_MACOS
    #ifdef __x86_64__
        #define ARCH_64BIT
    #elif defined(__aarch64__)
        #define ARCH_ARM64
    #endif
#endif

// Configuraciones específicas por plataforma
namespace PlatformConfig {
    #if defined(ARCH_64BIT)
        constexpr size_t POINTER_SIZE = 8;
        constexpr size_t CACHE_LINE_SIZE = 64;
        constexpr size_t MAX_ALIGN = 16;  // Típico para SSE/AVX en x86-64
    #elif defined(ARCH_32BIT)
        constexpr size_t POINTER_SIZE = 4;
        constexpr size_t CACHE_LINE_SIZE = 32;  // Puede variar
        constexpr size_t MAX_ALIGN = 8;
    #elif defined(ARCH_ARM64)
        constexpr size_t POINTER_SIZE = 8;
        constexpr size_t CACHE_LINE_SIZE = 64;  // Apple M1/M2: 128, pero 64 es seguro
        constexpr size_t MAX_ALIGN = 16;   // NEON
    #elif defined(ARCH_ARM32)
        constexpr size_t POINTER_SIZE = 4;
        constexpr size_t CACHE_LINE_SIZE = 32;
        constexpr size_t MAX_ALIGN = 8;
    #else
        // Valores por defecto conservadores
        constexpr size_t POINTER_SIZE = sizeof(void*);
        constexpr size_t CACHE_LINE_SIZE = 64;
        constexpr size_t MAX_ALIGN = sizeof(std::max_align_t);
    #endif
}

// Wrapper portable para alineación dinámica
class PortableAlignedMemory {
private:
    void* ptr_;
    size_t size_;
    size_t alignment_;
    
public:
    PortableAlignedMemory(size_t size, size_t alignment) 
        : ptr_(nullptr), size_(size), alignment_(alignment) {
        
        // Verificar que alignment es potencia de 2
        if (alignment == 0 || (alignment & (alignment - 1)) != 0) {
            throw std::invalid_argument("Alignment debe ser potencia de 2");
        }
        
        #if defined(PLATFORM_WINDOWS)
            ptr_ = _aligned_malloc(size, alignment);
            if (!ptr_) {
                throw std::bad_alloc{};
            }
        #elif defined(PLATFORM_LINUX) || defined(PLATFORM_MACOS)
            // C++17 aligned_alloc requiere que size sea múltiplo de alignment
            size_t adjusted_size = ((size + alignment - 1) / alignment) * alignment;
            ptr_ = std::aligned_alloc(alignment, adjusted_size);
            if (!ptr_) {
                throw std::bad_alloc{};
            }
        #else
            // Fallback usando malloc + manual alignment
            size_t total_size = size + alignment - 1 + sizeof(void*);
            void* raw_ptr = std::malloc(total_size);
            if (!raw_ptr) {
                throw std::bad_alloc{};
            }
            
            // Calcular dirección alineada
            uintptr_t aligned_addr = (reinterpret_cast<uintptr_t>(raw_ptr) + 
                                     sizeof(void*) + alignment - 1) & ~(alignment - 1);
            ptr_ = reinterpret_cast<void*>(aligned_addr);
            
            // Guardar puntero original para liberación posterior
            static_cast<void**>(ptr_)[-1] = raw_ptr;
        #endif
    }
    
    ~PortableAlignedMemory() {
        if (ptr_) {
            #if defined(PLATFORM_WINDOWS)
                _aligned_free(ptr_);
            #elif defined(PLATFORM_LINUX) || defined(PLATFORM_MACOS)
                std::free(ptr_);
            #else
                // Recuperar puntero original y liberar
                void* raw_ptr = static_cast<void**>(ptr_)[-1];
                std::free(raw_ptr);
            #endif
        }
    }
    
    void* get() { return ptr_; }
    const void* get() const { return ptr_; }
    size_t size() const { return size_; }
    size_t alignment() const { return alignment_; }
    
    bool is_aligned() const {
        return reinterpret_cast<uintptr_t>(ptr_) % alignment_ == 0;
    }
    
    // No permitir copia
    PortableAlignedMemory(const PortableAlignedMemory&) = delete;
    PortableAlignedMemory& operator=(const PortableAlignedMemory&) = delete;
    
    // Permitir movimiento
    PortableAlignedMemory(PortableAlignedMemory&& other) noexcept
        : ptr_(other.ptr_), size_(other.size_), alignment_(other.alignment_) {
        other.ptr_ = nullptr;
    }
    
    PortableAlignedMemory& operator=(PortableAlignedMemory&& other) noexcept {
        if (this != &other) {
            this->~PortableAlignedMemory();
            ptr_ = other.ptr_;
            size_ = other.size_;
            alignment_ = other.alignment_;
            other.ptr_ = nullptr;
        }
        return *this;
    }
};

// Template para tipos con alineación específica por plataforma
template<typename T>
struct PlatformAligned {
    #if defined(ARCH_ARM64) && defined(PLATFORM_MACOS)
        // Apple Silicon tiene cache lines de 128 bytes
        static constexpr size_t alignment = 128;
    #elif defined(ARCH_ARM32) || defined(ARCH_32BIT)
        static constexpr size_t alignment = 32;
    #else
        static constexpr size_t alignment = 64;  // x86-64 estándar
    #endif
    
    using type = typename std::aligned_storage<sizeof(T), alignment>::type;
};

// Función para reportar información de alineación de la plataforma
void report_platform_alignment_info() {
    std::cout << "\\n=== Información de Alineación por Plataforma ===" << std::endl;
    
    #if defined(PLATFORM_WINDOWS)
        std::cout << "Plataforma: Windows" << std::endl;
    #elif defined(PLATFORM_LINUX)
        std::cout << "Plataforma: Linux" << std::endl;
    #elif defined(PLATFORM_MACOS)
        std::cout << "Plataforma: macOS" << std::endl;
    #else
        std::cout << "Plataforma: Desconocida" << std::endl;
    #endif
    
    #if defined(ARCH_64BIT)
        std::cout << "Arquitectura: 64-bit x86_64" << std::endl;
    #elif defined(ARCH_32BIT)
        std::cout << "Arquitectura: 32-bit x86" << std::endl;
    #elif defined(ARCH_ARM64)
        std::cout << "Arquitectura: ARM64 (AArch64)" << std::endl;
    #elif defined(ARCH_ARM32)
        std::cout << "Arquitectura: ARM32" << std::endl;
    #else
        std::cout << "Arquitectura: Desconocida" << std::endl;
    #endif
    
    std::cout << "Tamaño de puntero: " << PlatformConfig::POINTER_SIZE << " bytes" << std::endl;
    std::cout << "Cache line size: " << PlatformConfig::CACHE_LINE_SIZE << " bytes" << std::endl;
    std::cout << "Alineación máxima: " << PlatformConfig::MAX_ALIGN << " bytes" << std::endl;
    std::cout << "std::max_align_t: " << alignof(std::max_align_t) << " bytes" << std::endl;
    
    // Información específica de tipos
    std::cout << "\\nAlineación de tipos básicos:" << std::endl;
    std::cout << "  char: " << alignof(char) << std::endl;
    std::cout << "  short: " << alignof(short) << std::endl;
    std::cout << "  int: " << alignof(int) << std::endl;
    std::cout << "  long: " << alignof(long) << std::endl;
    std::cout << "  long long: " << alignof(long long) << std::endl;
    std::cout << "  float: " << alignof(float) << std::endl;
    std::cout << "  double: " << alignof(double) << std::endl;
    std::cout << "  long double: " << alignof(long double) << std::endl;
    std::cout << "  void*: " << alignof(void*) << std::endl;
}

// Test de allocación portable
void test_portable_allocation() {
    std::cout << "\\n=== Test de Allocación Portable ===" << std::endl;
    
    try {
        // Test diferentes alineaciones
        for (size_t alignment : {16, 32, 64, 128, 256}) {
            PortableAlignedMemory mem(1024, alignment);
            
            std::cout << "Allocación con alineación " << alignment << ": "
                      << (mem.is_aligned() ? "✓" : "✗") << " (" 
                      << mem.get() << ")" << std::endl;
            
            // Escribir y leer datos para verificar funcionalidad
            std::memset(mem.get(), 0xAA, 1024);
            bool data_integrity = true;
            auto* bytes = static_cast<unsigned char*>(mem.get());
            for (size_t i = 0; i < 1024; ++i) {
                if (bytes[i] != 0xAA) {
                    data_integrity = false;
                    break;
                }
            }
            
            std::cout << "  Integridad de datos: " << (data_integrity ? "✓" : "✗") << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "Error en allocación portable: " << e.what() << std::endl;
    }
}`,
      explanation: state.language === 'en'
        ? 'Cross-platform alignment considerations are crucial for portable high-performance code. Different architectures have varying cache line sizes, alignment requirements, and available SIMD instruction sets. Proper abstraction ensures optimal performance across all target platforms.'
        : 'Las consideraciones de alineación multi-plataforma son cruciales para código portable de alto rendimiento. Diferentes arquitecturas tienen tamaños de línea de cache variables, requisitos de alineación y conjuntos de instrucciones SIMD disponibles. La abstracción adecuada asegura rendimiento óptimo en todas las plataformas objetivo.'
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 104: Memory Alignment Mastery' : 'Lección 104: Dominio de Alineación de Memoria'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <MemoryAlignmentVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Advanced Memory Alignment Techniques' : 'Técnicas Avanzadas de Alineación de Memoria'}</h3>
          
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
          <h3>{state.language === 'en' ? 'Core Alignment Concepts' : 'Conceptos Clave de Alineación'}</h3>
          <div className="concept-grid">
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Natural Alignment' : 'Alineación Natural'}</h4>
              <p>
                {state.language === 'en'
                  ? 'The hardware-preferred alignment for each data type, typically equal to the size of the type. Essential for optimal CPU performance and avoiding alignment faults.'
                  : 'La alineación preferida por hardware para cada tipo de dato, típicamente igual al tamaño del tipo. Esencial para rendimiento óptimo de CPU y evitar fallas de alineación.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Over-alignment' : 'Over-alignment'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Aligning data to boundaries larger than natural alignment. Used for SIMD optimization, cache line alignment, and avoiding false sharing in concurrent code.'
                  : 'Alinear datos a límites más grandes que la alineación natural. Usado para optimización SIMD, alineación de línea de cache y evitar false sharing en código concurrente.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Cache Line Awareness' : 'Conciencia de Línea de Cache'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Understanding cache line boundaries (typically 64 bytes) to optimize memory access patterns and minimize cache misses in performance-critical code.'
                  : 'Entender los límites de línea de cache (típicamente 64 bytes) para optimizar patrones de acceso a memoria y minimizar cache misses en código crítico de rendimiento.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'SIMD Alignment' : 'Alineación SIMD'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Specialized alignment requirements for SIMD instructions (16, 32, or 64-byte boundaries) to enable vectorized operations and maximize computational throughput.'
                  : 'Requisitos de alineación especializados para instrucciones SIMD (límites de 16, 32 o 64 bytes) para habilitar operaciones vectorizadas y maximizar throughput computacional.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Platform Portability' : 'Portabilidad de Plataforma'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Handling alignment differences across architectures (x86, ARM, mobile) and platforms (Windows, Linux, macOS) for consistent performance everywhere.'
                  : 'Manejar diferencias de alineación entre arquitecturas (x86, ARM, mobile) y plataformas (Windows, Linux, macOS) para rendimiento consistente en todas partes.'}
              </p>
            </div>

            <div className="concept-card">
              <h4>{state.language === 'en' ? 'False Sharing Prevention' : 'Prevención de False Sharing'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Strategic padding and alignment to prevent multiple threads from contending over the same cache line, critical for scalable multithreaded performance.'
                  : 'Padding y alineación estratégicos para prevenir que múltiples threads compitan por la misma línea de cache, crítico para rendimiento multihilo escalable.'}
              </p>
            </div>
          </div>
        </div>

        <div className="best-practices">
          <h3>{state.language === 'en' ? 'Expert Best Practices' : 'Mejores Prácticas de Experto'}</h3>
          <ul>
            <li>
              {state.language === 'en'
                ? 'Always measure alignment impact with profiling tools - theoretical benefits must be validated with real-world performance data'
                : 'Siempre mide el impacto de alineación con herramientas de profiling - los beneficios teóricos deben validarse con datos de rendimiento del mundo real'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Use alignas and aligned_storage for compile-time alignment guarantees, and std::aligned_alloc for runtime dynamic allocation'
                : 'Usa alignas y aligned_storage para garantías de alineación en tiempo de compilación, y std::aligned_alloc para allocación dinámica en runtime'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Structure data members by alignment requirements (largest first) to minimize padding and maximize cache efficiency'
                : 'Estructura miembros de datos por requisitos de alineación (más grandes primero) para minimizar padding y maximizar eficiencia de cache'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement platform-specific alignment strategies using compile-time detection of architecture and available instruction sets'
                : 'Implementa estrategias de alineación específicas por plataforma usando detección en tiempo de compilación de arquitectura y conjuntos de instrucciones disponibles'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Apply cache line padding for frequently accessed shared data in multithreaded scenarios to eliminate false sharing bottlenecks'
                : 'Aplica padding de línea de cache para datos compartidos accedidos frecuentemente en escenarios multihilo para eliminar cuellos de botella de false sharing'}
            </li>
          </ul>
        </div>

        <div className="advanced-techniques">
          <h3>{state.language === 'en' ? 'Advanced Techniques Mastered' : 'Técnicas Avanzadas Dominadas'}</h3>
          <div className="techniques-grid">
            <div className="technique-item">
              <span className="technique-icon">🎯</span>
              <h4>{state.language === 'en' ? 'Hardware-Aware Alignment' : 'Alineación Consciente de Hardware'}</h4>
              <p>{state.language === 'en' ? 'Architecture-specific optimization for x86, ARM, and specialized processors' : 'Optimización específica de arquitectura para x86, ARM y procesadores especializados'}</p>
            </div>
            
            <div className="technique-item">
              <span className="technique-icon">⚡</span>
              <h4>{state.language === 'en' ? 'SIMD Vectorization' : 'Vectorización SIMD'}</h4>
              <p>{state.language === 'en' ? 'AVX/NEON alignment for maximum vectorized computation performance' : 'Alineación AVX/NEON para máximo rendimiento de computación vectorizada'}</p>
            </div>
            
            <div className="technique-item">
              <span className="technique-icon">🔒</span>
              <h4>{state.language === 'en' ? 'Cache Line Optimization' : 'Optimización de Línea de Cache'}</h4>
              <p>{state.language === 'en' ? 'Strategic data layout for L1/L2/L3 cache efficiency' : 'Layout estratégico de datos para eficiencia de cache L1/L2/L3'}</p>
            </div>
            
            <div className="technique-item">
              <span className="technique-icon">🌐</span>
              <h4>{state.language === 'en' ? 'Cross-Platform Portability' : 'Portabilidad Multi-Plataforma'}</h4>
              <p>{state.language === 'en' ? 'Unified alignment abstraction across Windows, Linux, and macOS' : 'Abstracción unificada de alineación entre Windows, Linux y macOS'}</p>
            </div>
          </div>
        </div>

        <div className="warning-section">
          <h3>{state.language === 'en' ? '⚠️ Critical Performance Considerations' : '⚠️ Consideraciones Críticas de Rendimiento'}</h3>
          <div className="warning-content">
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Over-alignment Costs:' : 'Costos de Over-alignment:'}</strong>
              <span>{state.language === 'en' 
                ? 'Excessive alignment increases memory usage and can reduce cache effectiveness - balance alignment benefits against memory overhead'
                : 'El over-alignment excesivo aumenta el uso de memoria y puede reducir la efectividad del cache - balancea beneficios de alineación contra overhead de memoria'}</span>
            </div>
            
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Platform Dependencies:' : 'Dependencias de Plataforma:'}</strong>
              <span>{state.language === 'en'
                ? 'Alignment requirements vary significantly across architectures - always test on target platforms and use portable allocation methods'
                : 'Los requisitos de alineación varían significativamente entre arquitecturas - siempre prueba en plataformas objetivo y usa métodos de allocación portables'}</span>
            </div>
            
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'SIMD Prerequisites:' : 'Prerrequisitos SIMD:'}</strong>
              <span>{state.language === 'en'
                ? 'SIMD instructions require strict alignment - misaligned access causes exceptions or severe performance degradation'
                : 'Las instrucciones SIMD requieren alineación estricta - el acceso desalineado causa excepciones o degradación severa de rendimiento'}</span>
            </div>
            
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Measurement is Essential:' : 'La Medición es Esencial:'}</strong>
              <span>{state.language === 'en'
                ? 'Theoretical alignment benefits must be validated with profiling - modern hardware has complex cache behaviors that require empirical verification'
                : 'Los beneficios teóricos de alineación deben validarse con profiling - el hardware moderno tiene comportamientos complejos de cache que requieren verificación empírica'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}