/**
 * Lesson 74: Polymorphic Memory Resources (PMR) - Modern C++ Memory Management
 * Advanced memory resource patterns for high-performance applications
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

interface PMRState {
  language: 'en' | 'es';
  scenario: 'basic_pmr' | 'monotonic_buffer' | 'pool_resources' | 'custom_tracker';
  isAnimating: boolean;
  allocations: number;
  deallocations: number;
  memoryUsage: number;
  fragmentation: number;
  poolHits: number;
}

// 3D Visualization of PMR Memory Management
const PMRVisualization: React.FC<{ scenario: string; isAnimating: boolean; onMetrics: (metrics: any) => void }> = ({ 
  scenario, isAnimating, onMetrics 
}) => {
  const groupRef = useRef<Group>(null);
  const poolRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'basic_pmr') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        allocations: Math.floor(animationRef.current * 12) % 150,
        deallocations: Math.floor(animationRef.current * 8) % 120,
        memoryUsage: 40 + Math.sin(animationRef.current) * 20,
        fragmentation: 10 + Math.cos(animationRef.current * 0.5) * 8
      });
    } else if (scenario === 'monotonic_buffer') {
      groupRef.current.position.y = Math.sin(animationRef.current * 0.8) * 0.2;
      onMetrics({
        allocations: Math.floor(animationRef.current * 20) % 300,
        memoryUsage: Math.min(95, animationRef.current * 2),
        fragmentation: Math.max(0, 5 - animationRef.current * 0.1),
        bufferGrowth: Math.floor(animationRef.current * 5) % 10
      });
    } else if (scenario === 'pool_resources') {
      if (poolRef.current) {
        poolRef.current.rotation.z = animationRef.current * 0.4;
      }
      onMetrics({
        poolHits: Math.floor(animationRef.current * 15) % 200,
        allocations: Math.floor(animationRef.current * 18) % 250,
        fragmentation: 2 + Math.sin(animationRef.current * 2) * 1,
        efficiency: 90 + Math.cos(animationRef.current) * 8
      });
    } else if (scenario === 'custom_tracker') {
      groupRef.current.rotation.x = Math.sin(animationRef.current * 0.6) * 0.1;
      onMetrics({
        trackedAllocations: Math.floor(animationRef.current * 10) % 100,
        peakMemory: Math.floor(1000 + animationRef.current * 50),
        leakDetection: Math.floor(animationRef.current * 2) % 5,
        debugInfo: Math.floor(animationRef.current * 3) % 8
      });
    }
  });

  const renderMemoryBlocks = () => {
    const blocks = [];
    const blockCount = scenario === 'pool_resources' ? 24 : scenario === 'monotonic_buffer' ? 32 : 16;
    
    for (let i = 0; i < blockCount; i++) {
      const x = (i % 8) * 0.7 - 2.45;
      const y = scenario === 'pool_resources' ? Math.floor(i / 8) * 0.7 - 1.05 : 
                 scenario === 'monotonic_buffer' ? Math.floor(i / 8) * 0.5 - 1.5 : 0;
      const z = scenario === 'custom_tracker' ? Math.sin(i * 0.5) * 0.3 : 0;
      
      const color = scenario === 'monotonic_buffer' 
        ? (i < 16 ? '#00ff00' : i < 24 ? '#ffff00' : '#ff4400')
        : scenario === 'pool_resources'
        ? (i % 3 === 0 ? '#0080ff' : i % 3 === 1 ? '#00ffff' : '#8000ff')
        : scenario === 'custom_tracker'
        ? (i % 4 === 0 ? '#ff0080' : i % 4 === 1 ? '#80ff00' : i % 4 === 2 ? '#ff8000' : '#0080ff')
        : '#ffffff';
      
      const scale = scenario === 'monotonic_buffer' ? (i < 16 ? 0.4 : 0.3) : 0.35;
      
      blocks.push(
        <mesh key={i} position={[x, y, z]} scale={[scale, scale, scale]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
      );
    }
    
    return blocks;
  };

  const renderPoolStructure = () => {
    if (scenario !== 'pool_resources') return null;
    
    const pools = [];
    for (let i = 0; i < 3; i++) {
      pools.push(
        <mesh key={`pool-${i}`} position={[0, i * 0.8 - 0.8, -2]}>
          <cylinderGeometry args={[0.8, 0.8, 0.2, 8]} />
          <meshStandardMaterial color={i === 0 ? '#0080ff' : i === 1 ? '#00ffff' : '#8000ff'} 
                               transparent opacity={0.3} />
        </mesh>
      );
    }
    
    return (
      <group ref={poolRef}>
        {pools}
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      {renderMemoryBlocks()}
      {renderPoolStructure()}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#0080ff" />
    </group>
  );
};

const Lesson74_PMR: React.FC = () => {
  const [state, setState] = useState<PMRState>({
    language: 'en',
    scenario: 'basic_pmr',
    isAnimating: false,
    allocations: 0,
    deallocations: 0,
    memoryUsage: 0,
    fragmentation: 0,
    poolHits: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: PMRState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      basic_pmr: state.language === 'en' ? 'Basic PMR Usage' : 'Uso Básico de PMR',
      monotonic_buffer: state.language === 'en' ? 'Monotonic Buffer Resource' : 'Recurso Buffer Monotónico',
      pool_resources: state.language === 'en' ? 'Pool Resources' : 'Recursos de Pool',
      custom_tracker: state.language === 'en' ? 'Custom Memory Tracker' : 'Tracker de Memoria Personalizado'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    basic_pmr: `// Introducción a Polymorphic Memory Resources (PMR)
#include <memory_resource>
#include <vector>
#include <string>
#include <iostream>
#include <map>

// PMR containers - template sin allocator parameter
using pmr_vector = std::pmr::vector<int>;
using pmr_string = std::pmr::string;
using pmr_map = std::pmr::map<std::pmr::string, int>;

void demonstrate_basic_pmr() {
    // Default memory resource (equivalente a new/delete)
    auto* default_resource = std::pmr::get_default_resource();
    std::cout << "Default resource: " << default_resource << "\\n";
    
    // PMR containers usando default resource
    pmr_vector vec1;
    vec1.push_back(1);
    vec1.push_back(2);
    vec1.push_back(3);
    
    // Explicit resource specification
    pmr_vector vec2{default_resource};
    vec2 = {10, 20, 30, 40, 50};
    
    // PMR strings - reducen template instantiation
    pmr_string str1{"Hello PMR World"};
    pmr_string str2{"Another string", default_resource};
    
    std::cout << "Vector 1 size: " << vec1.size() << "\\n";
    std::cout << "Vector 2 size: " << vec2.size() << "\\n";
    std::cout << "String 1: " << str1 << "\\n";
    std::cout << "String 2: " << str2 << "\\n";
}

// Comparación: PMR vs Traditional Allocators
template<typename Allocator>
void template_instantiation_demo(Allocator alloc) {
    std::vector<int, Allocator> vec{alloc};
    vec.push_back(42);
    // Cada allocator type genera una template instantiation diferente
}

void compare_template_instantiation() {
    // Traditional approach - múltiples template instantiations
    std::allocator<int> std_alloc;
    template_instantiation_demo(std_alloc);
    
    // PMR approach - una sola template instantiation
    auto* resource1 = std::pmr::get_default_resource();
    auto* resource2 = std::pmr::new_delete_resource();
    
    std::pmr::polymorphic_allocator<int> pmr_alloc1{resource1};
    std::pmr::polymorphic_allocator<int> pmr_alloc2{resource2};
    
    // Ambos usan la misma template instantiation
    template_instantiation_demo(pmr_alloc1);
    template_instantiation_demo(pmr_alloc2);
}

// Built-in memory resources
void explore_builtin_resources() {
    // new_delete_resource - equivalente a std::allocator
    auto* new_delete_res = std::pmr::new_delete_resource();
    
    // null_memory_resource - siempre falla allocations
    auto* null_res = std::pmr::null_memory_resource();
    
    std::cout << "New/delete resource: " << new_delete_res << "\\n";
    std::cout << "Null resource: " << null_res << "\\n";
    
    try {
        pmr_vector null_vec{null_res};
        null_vec.push_back(1); // Esto lanzará bad_alloc
    } catch (const std::bad_alloc& e) {
        std::cout << "Expected: null_resource threw bad_alloc\\n";
    }
    
    // Set default resource
    auto* old_default = std::pmr::set_default_resource(new_delete_res);
    pmr_vector vec_with_new_default;
    vec_with_new_default.push_back(100);
    
    // Restore original default
    std::pmr::set_default_resource(old_default);
}

int main() {
    std::cout << "=== Basic PMR Demo ===\\n";
    demonstrate_basic_pmr();
    
    std::cout << "\\n=== Template Instantiation Comparison ===\\n";
    compare_template_instantiation();
    
    std::cout << "\\n=== Built-in Resources ===\\n";
    explore_builtin_resources();
    
    return 0;
}`,

    monotonic_buffer: `// Monotonic Buffer Resource - Allocación Ultra-Rápida
#include <memory_resource>
#include <vector>
#include <chrono>
#include <iostream>
#include <array>

class PerformanceTester {
    using Clock = std::chrono::high_resolution_clock;
    using Duration = std::chrono::nanoseconds;
    
    Clock::time_point start_;
    
public:
    void start() { start_ = Clock::now(); }
    
    Duration elapsed() {
        return std::chrono::duration_cast<Duration>(Clock::now() - start_);
    }
};

void monotonic_buffer_demo() {
    constexpr size_t buffer_size = 1024 * 1024; // 1MB buffer
    std::array<std::byte, buffer_size> buffer;
    
    // Monotonic buffer resource - allocación O(1), no deallocación individual
    std::pmr::monotonic_buffer_resource mono_resource{
        buffer.data(), buffer.size(), std::pmr::null_memory_resource()
    };
    
    std::cout << "=== Monotonic Buffer Performance Test ===\\n";
    
    // Test 1: PMR con monotonic buffer
    {
        PerformanceTester timer;
        timer.start();
        
        std::pmr::vector<int> vec{&mono_resource};
        for (int i = 0; i < 10000; ++i) {
            vec.push_back(i);
        }
        
        auto pmr_time = timer.elapsed();
        std::cout << "PMR monotonic time: " << pmr_time.count() << " ns\\n";
        std::cout << "Vector size: " << vec.size() << "\\n";
    }
    
    // Test 2: Standard allocator comparison
    {
        PerformanceTester timer;
        timer.start();
        
        std::vector<int> vec;
        for (int i = 0; i < 10000; ++i) {
            vec.push_back(i);
        }
        
        auto std_time = timer.elapsed();
        std::cout << "Standard allocator time: " << std_time.count() << " ns\\n";
        std::cout << "Vector size: " << vec.size() << "\\n";
    }
}

// Nested scopes con buffer reuse
void nested_scopes_demo() {
    std::array<std::byte, 64 * 1024> buffer; // 64KB
    std::pmr::monotonic_buffer_resource mono_resource{buffer.data(), buffer.size()};
    
    std::cout << "\\n=== Nested Scopes Demo ===\\n";
    
    // Scope 1: Crear varios containers
    {
        std::pmr::vector<std::pmr::string> strings{&mono_resource};
        strings.emplace_back("Hello", &mono_resource);
        strings.emplace_back("World", &mono_resource);
        strings.emplace_back("PMR", &mono_resource);
        
        std::pmr::vector<int> numbers{&mono_resource};
        for (int i = 0; i < 100; ++i) {
            numbers.push_back(i * i);
        }
        
        std::cout << "Strings created: " << strings.size() << "\\n";
        std::cout << "Numbers created: " << numbers.size() << "\\n";
        
        // Scope 2: Nested containers
        {
            std::pmr::vector<std::pmr::vector<double>> matrix{&mono_resource};
            for (int row = 0; row < 10; ++row) {
                matrix.emplace_back(&mono_resource);
                for (int col = 0; col < 10; ++col) {
                    matrix[row].push_back(row * col * 0.5);
                }
            }
            std::cout << "Matrix created: " << matrix.size() << "x" << matrix[0].size() << "\\n";
        } // matrix destructor called, but memory not returned
        
    } // strings and numbers destructors called, but memory not returned
    
    std::cout << "All scopes exited - memory still allocated in buffer\\n";
    
    // Memory is only reclaimed when mono_resource is destroyed
    // or release() is called
}

// Chained buffer resources
void chained_buffers_demo() {
    std::cout << "\\n=== Chained Buffer Resources ===\\n";
    
    std::array<std::byte, 1024> small_buffer;
    
    // Chain: small_buffer -> new_delete_resource -> null (fallback)
    std::pmr::monotonic_buffer_resource mono_resource{
        small_buffer.data(), 
        small_buffer.size(),
        std::pmr::new_delete_resource()  // upstream resource
    };
    
    std::pmr::vector<int> vec{&mono_resource};
    
    // Fill beyond small buffer capacity
    for (int i = 0; i < 1000; ++i) {
        vec.push_back(i);
        
        if (i == 100) {
            std::cout << "Using small buffer...\\n";
        } else if (i == 300) {
            std::cout << "Overflowed to new_delete_resource...\\n";
        }
    }
    
    std::cout << "Final vector size: " << vec.size() << "\\n";
    std::cout << "Buffer chain handled overflow seamlessly\\n";
}

// Memory release patterns
void memory_release_demo() {
    std::cout << "\\n=== Memory Release Demo ===\\n";
    
    constexpr size_t buffer_size = 4096;
    std::array<std::byte, buffer_size> buffer;
    
    std::pmr::monotonic_buffer_resource mono_resource{buffer.data(), buffer.size()};
    
    // Phase 1: Allocate
    {
        std::pmr::vector<int> phase1_data{&mono_resource};
        for (int i = 0; i < 512; ++i) {
            phase1_data.push_back(i);
        }
        std::cout << "Phase 1: allocated " << phase1_data.size() * sizeof(int) << " bytes\\n";
    }
    
    // No memory returned yet - monotonic behavior
    
    // Phase 2: More allocation
    {
        std::pmr::vector<double> phase2_data{&mono_resource};
        for (int i = 0; i < 256; ++i) {
            phase2_data.push_back(i * 1.5);
        }
        std::cout << "Phase 2: allocated " << phase2_data.size() * sizeof(double) << " bytes\\n";
    }
    
    // Release all memory at once
    mono_resource.release();
    std::cout << "All memory released - buffer ready for reuse\\n";
    
    // Phase 3: Reuse buffer
    {
        std::pmr::vector<char> phase3_data{&mono_resource};
        for (int i = 0; i < 1024; ++i) {
            phase3_data.push_back('A' + (i % 26));
        }
        std::cout << "Phase 3: reused buffer for " << phase3_data.size() << " chars\\n";
    }
}

int main() {
    monotonic_buffer_demo();
    nested_scopes_demo();
    chained_buffers_demo();
    memory_release_demo();
    
    return 0;
}`,

    pool_resources: `// Pool Resources - Optimización para Tamaños Específicos
#include <memory_resource>
#include <vector>
#include <list>
#include <chrono>
#include <iostream>
#include <random>
#include <thread>

// Pool options configuration
std::pmr::pool_options create_pool_options() {
    std::pmr::pool_options options;
    
    // Tamaños de bloques que el pool manejará
    options.max_blocks_per_chunk = 32;  // Máximo bloques por chunk
    options.largest_required_pool_block = 1024;  // Bloque más grande
    
    return options;
}

void basic_pool_demo() {
    std::cout << "=== Basic Pool Resource Demo ===\\n";
    
    auto options = create_pool_options();
    std::pmr::unsynchronized_pool_resource pool{options, std::pmr::new_delete_resource()};
    
    // Containers usando el pool resource
    std::pmr::vector<int> vec{&pool};
    std::pmr::list<double> lst{&pool};
    
    // Allocaciones de tamaño similar son muy eficientes
    for (int i = 0; i < 1000; ++i) {
        vec.push_back(i);
        lst.push_back(i * 0.5);
    }
    
    std::cout << "Vector size: " << vec.size() << "\\n";
    std::cout << "List size: " << lst.size() << "\\n";
    
    // Pool reutiliza bloques del mismo tamaño eficientemente
    vec.clear();
    lst.clear();
    
    // Segundo round - debería ser más rápido debido al pooling
    for (int i = 0; i < 1000; ++i) {
        vec.push_back(i * 2);
        lst.push_back(i * 1.5);
    }
    
    std::cout << "Second round - Vector size: " << vec.size() << "\\n";
    std::cout << "Second round - List size: " << lst.size() << "\\n";
}

// Performance comparison: Pool vs Standard
class PoolBenchmark {
    using Clock = std::chrono::high_resolution_clock;
    
public:
    struct Results {
        std::chrono::nanoseconds allocation_time;
        std::chrono::nanoseconds deallocation_time;
        size_t total_allocations;
    };
    
    Results benchmark_pool_allocations(size_t iterations) {
        auto options = create_pool_options();
        std::pmr::unsynchronized_pool_resource pool{options};
        
        auto start = Clock::now();
        
        std::vector<std::pmr::vector<int>> containers;
        containers.reserve(iterations);
        
        // Allocation phase
        for (size_t i = 0; i < iterations; ++i) {
            containers.emplace_back(&pool);
            auto& vec = containers.back();
            
            // Variable size allocations
            size_t size = 10 + (i % 50);
            for (size_t j = 0; j < size; ++j) {
                vec.push_back(static_cast<int>(j));
            }
        }
        
        auto alloc_end = Clock::now();
        
        // Deallocation phase
        containers.clear();
        
        auto dealloc_end = Clock::now();
        
        return Results{
            std::chrono::duration_cast<std::chrono::nanoseconds>(alloc_end - start),
            std::chrono::duration_cast<std::chrono::nanoseconds>(dealloc_end - alloc_end),
            iterations
        };
    }
    
    Results benchmark_standard_allocations(size_t iterations) {
        auto start = Clock::now();
        
        std::vector<std::vector<int>> containers;
        containers.reserve(iterations);
        
        // Allocation phase
        for (size_t i = 0; i < iterations; ++i) {
            containers.emplace_back();
            auto& vec = containers.back();
            
            // Variable size allocations
            size_t size = 10 + (i % 50);
            for (size_t j = 0; j < size; ++j) {
                vec.push_back(static_cast<int>(j));
            }
        }
        
        auto alloc_end = Clock::now();
        
        // Deallocation phase
        containers.clear();
        
        auto dealloc_end = Clock::now();
        
        return Results{
            std::chrono::duration_cast<std::chrono::nanoseconds>(alloc_end - start),
            std::chrono::duration_cast<std::chrono::nanoseconds>(dealloc_end - alloc_end),
            iterations
        };
    }
    
    void run_comparison(size_t iterations) {
        std::cout << "\\n=== Pool vs Standard Allocator Benchmark ===\\n";
        std::cout << "Iterations: " << iterations << "\\n";
        
        auto pool_results = benchmark_pool_allocations(iterations);
        auto std_results = benchmark_standard_allocations(iterations);
        
        std::cout << "\\nPool Resource Results:\\n";
        std::cout << "  Allocation time: " << pool_results.allocation_time.count() << " ns\\n";
        std::cout << "  Deallocation time: " << pool_results.deallocation_time.count() << " ns\\n";
        std::cout << "  Total time: " << (pool_results.allocation_time + pool_results.deallocation_time).count() << " ns\\n";
        
        std::cout << "\\nStandard Allocator Results:\\n";
        std::cout << "  Allocation time: " << std_results.allocation_time.count() << " ns\\n";
        std::cout << "  Deallocation time: " << std_results.deallocation_time.count() << " ns\\n";
        std::cout << "  Total time: " << (std_results.allocation_time + std_results.deallocation_time).count() << " ns\\n";
        
        auto pool_total = (pool_results.allocation_time + pool_results.deallocation_time).count();
        auto std_total = (std_results.allocation_time + std_results.deallocation_time).count();
        
        if (pool_total < std_total) {
            double speedup = static_cast<double>(std_total) / pool_total;
            std::cout << "\\nPool resource is " << speedup << "x faster\\n";
        } else {
            double slowdown = static_cast<double>(pool_total) / std_total;
            std::cout << "\\nStandard allocator is " << slowdown << "x faster\\n";
        }
    }
};

// Thread-safe synchronized pool
void synchronized_pool_demo() {
    std::cout << "\\n=== Synchronized Pool Demo ===\\n";
    
    auto options = create_pool_options();
    std::pmr::synchronized_pool_resource sync_pool{options};
    
    constexpr int num_threads = 4;
    constexpr int allocations_per_thread = 1000;
    
    std::vector<std::thread> threads;
    threads.reserve(num_threads);
    
    std::cout << "Starting " << num_threads << " threads, " 
              << allocations_per_thread << " allocations each\\n";
    
    for (int t = 0; t < num_threads; ++t) {
        threads.emplace_back([&sync_pool, t, allocations_per_thread]() {
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_int_distribution<> size_dist(10, 100);
            
            for (int i = 0; i < allocations_per_thread; ++i) {
                std::pmr::vector<int> vec{&sync_pool};
                
                int size = size_dist(gen);
                vec.reserve(size);
                
                for (int j = 0; j < size; ++j) {
                    vec.push_back(t * 1000 + i * 10 + j);
                }
                
                // Simulate some work
                if (i % 100 == 0) {
                    std::this_thread::sleep_for(std::chrono::microseconds(10));
                }
            }
        });
    }
    
    // Wait for all threads
    for (auto& thread : threads) {
        thread.join();
    }
    
    std::cout << "All threads completed successfully\\n";
    std::cout << "Total allocations: " << num_threads * allocations_per_thread << "\\n";
}

int main() {
    basic_pool_demo();
    
    PoolBenchmark benchmark;
    benchmark.run_comparison(5000);
    
    synchronized_pool_demo();
    
    return 0;
}`,

    custom_tracker: `// Custom Memory Resources - Debug y Tracking Avanzado
#include <memory_resource>
#include <vector>
#include <iostream>
#include <unordered_map>
#include <mutex>
#include <iomanip>
#include <cassert>

// Tracking Memory Resource para debugging
class TrackingMemoryResource : public std::pmr::memory_resource {
private:
    std::pmr::memory_resource* upstream_;
    mutable std::mutex mutex_;
    
    struct AllocationInfo {
        size_t size;
        size_t alignment;
        std::chrono::time_point<std::chrono::steady_clock> timestamp;
        size_t allocation_id;
    };
    
    mutable std::unordered_map<void*, AllocationInfo> allocations_;
    mutable size_t total_allocated_ = 0;
    mutable size_t peak_allocated_ = 0;
    mutable size_t total_deallocated_ = 0;
    mutable size_t allocation_count_ = 0;
    mutable size_t deallocation_count_ = 0;
    mutable size_t next_allocation_id_ = 1;
    
protected:
    void* do_allocate(size_t bytes, size_t alignment) override {
        void* ptr = upstream_->allocate(bytes, alignment);
        
        std::lock_guard<std::mutex> lock(mutex_);
        
        AllocationInfo info{
            bytes, 
            alignment, 
            std::chrono::steady_clock::now(),
            next_allocation_id_++
        };
        
        allocations_[ptr] = info;
        total_allocated_ += bytes;
        peak_allocated_ = std::max(peak_allocated_, total_allocated_ - total_deallocated_);
        ++allocation_count_;
        
        std::cout << "[ALLOC #" << info.allocation_id << "] " 
                  << std::hex << ptr << std::dec 
                  << " size=" << bytes << " align=" << alignment 
                  << " current=" << (total_allocated_ - total_deallocated_) << "\\n";
        
        return ptr;
    }
    
    void do_deallocate(void* ptr, size_t bytes, size_t alignment) override {
        std::lock_guard<std::mutex> lock(mutex_);
        
        auto it = allocations_.find(ptr);
        if (it != allocations_.end()) {
            const auto& info = it->second;
            
            // Verificar parámetros de deallocación
            if (info.size != bytes) {
                std::cout << "[WARNING] Size mismatch in deallocate: allocated=" 
                          << info.size << " deallocated=" << bytes << "\\n";
            }
            if (info.alignment != alignment) {
                std::cout << "[WARNING] Alignment mismatch in deallocate: allocated=" 
                          << info.alignment << " deallocated=" << alignment << "\\n";
            }
            
            total_deallocated_ += bytes;
            ++deallocation_count_;
            
            auto duration = std::chrono::steady_clock::now() - info.timestamp;
            auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
            
            std::cout << "[DEALLOC #" << info.allocation_id << "] " 
                      << std::hex << ptr << std::dec 
                      << " size=" << bytes << " lifetime=" << ms << "ms"
                      << " remaining=" << (total_allocated_ - total_deallocated_) << "\\n";
            
            allocations_.erase(it);
        } else {
            std::cout << "[ERROR] Double delete or invalid pointer: " 
                      << std::hex << ptr << std::dec << "\\n";
        }
        
        upstream_->deallocate(ptr, bytes, alignment);
    }
    
    bool do_is_equal(const std::pmr::memory_resource& other) const noexcept override {
        return this == &other;
    }
    
public:
    explicit TrackingMemoryResource(std::pmr::memory_resource* upstream = std::pmr::get_default_resource())
        : upstream_(upstream) {}
    
    // Statistics methods
    void print_statistics() const {
        std::lock_guard<std::mutex> lock(mutex_);
        
        std::cout << "\\n=== Memory Statistics ===\\n";
        std::cout << "Total allocated: " << total_allocated_ << " bytes\\n";
        std::cout << "Total deallocated: " << total_deallocated_ << " bytes\\n";
        std::cout << "Current allocated: " << (total_allocated_ - total_deallocated_) << " bytes\\n";
        std::cout << "Peak allocated: " << peak_allocated_ << " bytes\\n";
        std::cout << "Allocation count: " << allocation_count_ << "\\n";
        std::cout << "Deallocation count: " << deallocation_count_ << "\\n";
        std::cout << "Active allocations: " << allocations_.size() << "\\n";
    }
    
    void print_leaks() const {
        std::lock_guard<std::mutex> lock(mutex_);
        
        if (allocations_.empty()) {
            std::cout << "\\n✅ No memory leaks detected\\n";
            return;
        }
        
        std::cout << "\\n❌ Memory leaks detected (" << allocations_.size() << " allocations):\\n";
        for (const auto& [ptr, info] : allocations_) {
            auto duration = std::chrono::steady_clock::now() - info.timestamp;
            auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
            
            std::cout << "  Leak #" << info.allocation_id << ": " 
                      << std::hex << ptr << std::dec 
                      << " size=" << info.size 
                      << " age=" << ms << "ms\\n";
        }
    }
    
    bool has_leaks() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return !allocations_.empty();
    }
};

// Logging Memory Resource
class LoggingMemoryResource : public std::pmr::memory_resource {
private:
    std::pmr::memory_resource* upstream_;
    std::string name_;
    mutable size_t operation_count_ = 0;
    
protected:
    void* do_allocate(size_t bytes, size_t alignment) override {
        ++operation_count_;
        std::cout << "[" << name_ << "] Allocating " << bytes 
                  << " bytes (align=" << alignment << ") - Op #" << operation_count_ << "\\n";
        return upstream_->allocate(bytes, alignment);
    }
    
    void do_deallocate(void* ptr, size_t bytes, size_t alignment) override {
        ++operation_count_;
        std::cout << "[" << name_ << "] Deallocating " << bytes 
                  << " bytes from " << std::hex << ptr << std::dec 
                  << " - Op #" << operation_count_ << "\\n";
        upstream_->deallocate(ptr, bytes, alignment);
    }
    
    bool do_is_equal(const std::pmr::memory_resource& other) const noexcept override {
        return this == &other;
    }
    
public:
    LoggingMemoryResource(const std::string& name, 
                         std::pmr::memory_resource* upstream = std::pmr::get_default_resource())
        : upstream_(upstream), name_(name) {}
};

// Size-limited Memory Resource
class LimitedMemoryResource : public std::pmr::memory_resource {
private:
    std::pmr::memory_resource* upstream_;
    mutable std::mutex mutex_;
    mutable size_t current_usage_ = 0;
    size_t limit_;
    
protected:
    void* do_allocate(size_t bytes, size_t alignment) override {
        std::lock_guard<std::mutex> lock(mutex_);
        
        if (current_usage_ + bytes > limit_) {
            throw std::bad_alloc{};
        }
        
        void* ptr = upstream_->allocate(bytes, alignment);
        current_usage_ += bytes;
        
        std::cout << "[LIMITED] Allocated " << bytes << " bytes, usage: " 
                  << current_usage_ << "/" << limit_ << "\\n";
        
        return ptr;
    }
    
    void do_deallocate(void* ptr, size_t bytes, size_t alignment) override {
        std::lock_guard<std::mutex> lock(mutex_);
        
        upstream_->deallocate(ptr, bytes, alignment);
        current_usage_ -= bytes;
        
        std::cout << "[LIMITED] Deallocated " << bytes << " bytes, usage: " 
                  << current_usage_ << "/" << limit_ << "\\n";
    }
    
    bool do_is_equal(const std::pmr::memory_resource& other) const noexcept override {
        return this == &other;
    }
    
public:
    LimitedMemoryResource(size_t limit, 
                         std::pmr::memory_resource* upstream = std::pmr::get_default_resource())
        : upstream_(upstream), limit_(limit) {}
    
    size_t current_usage() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return current_usage_;
    }
    
    size_t limit() const { return limit_; }
};

// Test scenarios
void tracking_resource_demo() {
    std::cout << "=== Tracking Memory Resource Demo ===\\n";
    
    TrackingMemoryResource tracker;
    
    {
        std::pmr::vector<int> vec{&tracker};
        std::pmr::vector<double> dvec{&tracker};
        
        // Varias allocaciones
        for (int i = 0; i < 100; ++i) {
            vec.push_back(i);
            if (i % 10 == 0) {
                dvec.push_back(i * 0.5);
            }
        }
        
        tracker.print_statistics();
        
        // Crear memoria que intencionalmente "leakea"
        auto* leaked_vec = new std::pmr::vector<int>{&tracker};
        leaked_vec->push_back(42);
        // Intencionalmente no llamamos delete
    }
    
    tracker.print_statistics();
    tracker.print_leaks();
}

void logging_resource_demo() {
    std::cout << "\\n=== Logging Memory Resource Demo ===\\n";
    
    LoggingMemoryResource logger("MainLogger");
    
    std::pmr::vector<std::pmr::string> strings{&logger};
    
    strings.emplace_back("Hello", &logger);
    strings.emplace_back("World", &logger);
    strings.emplace_back("PMR", &logger);
    strings.emplace_back("Logging", &logger);
    
    std::cout << "Created " << strings.size() << " strings\\n";
}

void limited_resource_demo() {
    std::cout << "\\n=== Limited Memory Resource Demo ===\\n";
    
    constexpr size_t limit = 1024; // 1KB limit
    LimitedMemoryResource limited(limit);
    
    try {
        std::pmr::vector<int> vec{&limited};
        
        // Llenar hasta el límite
        while (true) {
            vec.push_back(42);
            
            if (vec.size() % 50 == 0) {
                std::cout << "Vector size: " << vec.size() 
                          << ", memory usage: " << limited.current_usage() << "\\n";
            }
        }
    } catch (const std::bad_alloc& e) {
        std::cout << "Hit memory limit at usage: " << limited.current_usage() 
                  << "/" << limited.limit() << "\\n";
    }
}

// Chained custom resources
void chained_resources_demo() {
    std::cout << "\\n=== Chained Custom Resources Demo ===\\n";
    
    // Chain: Limited -> Logging -> Tracking -> new_delete
    TrackingMemoryResource tracker;
    LoggingMemoryResource logger("ChainedLogger", &tracker);
    LimitedMemoryResource limited(2048, &logger); // 2KB limit
    
    {
        std::pmr::vector<std::pmr::vector<int>> matrix{&limited};
        
        for (int i = 0; i < 10; ++i) {
            matrix.emplace_back(&limited);
            auto& row = matrix.back();
            
            for (int j = 0; j < 10; ++j) {
                row.push_back(i * j);
            }
        }
        
        std::cout << "Created " << matrix.size() << "x" << matrix[0].size() << " matrix\\n";
    }
    
    std::cout << "\\n--- Final Statistics ---\\n";
    tracker.print_statistics();
    tracker.print_leaks();
}

int main() {
    tracking_resource_demo();
    logging_resource_demo();
    limited_resource_demo();
    chained_resources_demo();
    
    return 0;
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 74: Polymorphic Memory Resources (PMR)" : "Lección 74: Recursos de Memoria Polimórficos (PMR)"}
      lessonId="lesson-74"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'Modern C++ Memory Management' : 'Gestión de Memoria Moderna en C++'}
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
                  'Master std::pmr fundamentals and memory_resource base class',
                  'Implement monotonic_buffer_resource for ultra-fast allocations',
                  'Optimize performance with pool_options and unsynchronized_pool_resource',
                  'Create custom memory resources for debugging and tracking',
                  'Understand PMR container benefits: reduced template instantiation',
                  'Apply PMR patterns in production systems for memory optimization',
                  'Debug memory issues with custom resource implementations'
                ]
              : [
                  'Dominar fundamentos de std::pmr y la clase base memory_resource',
                  'Implementar monotonic_buffer_resource para allocaciones ultra-rápidas',
                  'Optimizar rendimiento con pool_options y unsynchronized_pool_resource',
                  'Crear recursos de memoria personalizados para debugging y tracking',
                  'Entender beneficios de containers PMR: reducción de template instantiation',
                  'Aplicar patrones PMR en sistemas de producción para optimización de memoria',
                  'Debuggear problemas de memoria con implementaciones de recursos personalizados'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive PMR Demonstration' : 'Demostración Interactiva de PMR'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <PMRVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('basic_pmr')}
            variant={state.scenario === 'basic_pmr' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Basic PMR' : 'PMR Básico'}
          </Button>
          <Button 
            onClick={() => runScenario('monotonic_buffer')}
            variant={state.scenario === 'monotonic_buffer' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Monotonic Buffer' : 'Buffer Monotónico'}
          </Button>
          <Button 
            onClick={() => runScenario('pool_resources')}
            variant={state.scenario === 'pool_resources' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Pool Resources' : 'Recursos de Pool'}
          </Button>
          <Button 
            onClick={() => runScenario('custom_tracker')}
            variant={state.scenario === 'custom_tracker' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Custom Tracker' : 'Tracker Personalizado'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Allocations' : 'Allocaciones', 
              value: state.allocations,
              color: '#00ff00'
            },
            { 
              label: state.language === 'en' ? 'Deallocations' : 'Desallocaciones', 
              value: state.deallocations,
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Memory Usage %' : 'Uso Memoria %', 
              value: Math.round(state.memoryUsage),
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Fragmentation %' : 'Fragmentación %', 
              value: Math.round(state.fragmentation),
              color: '#ff0080'
            },
            { 
              label: state.language === 'en' ? 'Pool Hits' : 'Hits Pool', 
              value: state.poolHits,
              color: '#80ff00'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'basic_pmr' && (state.language === 'en' ? 'Basic PMR Usage' : 'Uso Básico de PMR')}
          {state.scenario === 'monotonic_buffer' && (state.language === 'en' ? 'Monotonic Buffer Resource' : 'Recurso Buffer Monotónico')}
          {state.scenario === 'pool_resources' && (state.language === 'en' ? 'Pool Resources Optimization' : 'Optimización con Recursos de Pool')}
          {state.scenario === 'custom_tracker' && (state.language === 'en' ? 'Custom Memory Tracker' : 'Tracker de Memoria Personalizado')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'basic_pmr' ? 
              (state.language === 'en' ? 'Basic PMR Implementation' : 'Implementación Básica de PMR') :
            state.scenario === 'monotonic_buffer' ? 
              (state.language === 'en' ? 'Monotonic Buffer Implementation' : 'Implementación Buffer Monotónico') :
            state.scenario === 'pool_resources' ? 
              (state.language === 'en' ? 'Pool Resources Implementation' : 'Implementación Recursos de Pool') :
            (state.language === 'en' ? 'Custom Tracker Implementation' : 'Implementación Tracker Personalizado')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Key Concepts and Production Patterns' : 'Conceptos Clave y Patrones de Producción'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #333'
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🎯 PMR Advantages:' : '🎯 Ventajas de PMR:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Template Instantiation Reduction:' : 'Reducción de Template Instantiation:'}</strong>{' '}
              {state.language === 'en' 
                ? 'PMR containers use polymorphic allocators, reducing binary bloat'
                : 'Los containers PMR usan allocators polimórficos, reduciendo el bloat binario'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Runtime Allocator Selection:' : 'Selección Runtime de Allocator:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Choose memory strategy at runtime without template parameters'
                : 'Elige estrategia de memoria en runtime sin parámetros template'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Performance Optimization:' : 'Optimización de Rendimiento:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Monotonic buffers and pools provide significant speed improvements'
                : 'Los buffers monotónicos y pools proporcionan mejoras significativas de velocidad'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Memory Debugging:' : 'Debugging de Memoria:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Custom resources enable sophisticated tracking and leak detection'
                : 'Los recursos personalizados permiten tracking sofisticado y detección de leaks'
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
            {state.language === 'en' ? '⚠️ Important Considerations:' : '⚠️ Consideraciones Importantes:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Resource Lifetime:' : 'Tiempo de Vida del Recurso:'}</strong>{' '}
              {state.language === 'en' 
                ? 'PMR containers hold non-owning pointers to memory resources'
                : 'Los containers PMR mantienen punteros no-propietarios a recursos de memoria'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Thread Safety:' : 'Seguridad de Hilos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Use synchronized_pool_resource for multi-threaded access'
                : 'Usa synchronized_pool_resource para acceso multi-hilo'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Migration Strategy:' : 'Estrategia de Migración:'}</strong>{' '}
              {state.language === 'en' 
                ? 'PMR containers are not directly compatible with standard containers'
                : 'Los containers PMR no son directamente compatibles con containers estándar'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Memory Overhead:' : 'Overhead de Memoria:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Virtual function calls add slight overhead vs. template allocators'
                : 'Las llamadas a funciones virtuales añaden slight overhead vs. allocators template'
              }
            </li>
          </ul>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Production Implementation Examples' : 'Ejemplos de Implementación en Producción'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a2e1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #080'
        }}>
          <h4 style={{ color: '#88ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '💡 Common Use Cases:' : '💡 Casos de Uso Comunes:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Game Engines:' : 'Motores de Juego:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Frame-based monotonic allocators for temporary objects'
                : 'Allocators monotónicos basados en frames para objetos temporales'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'High-Frequency Trading:' : 'Trading de Alta Frecuencia:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Pool resources for consistent allocation timing'
                : 'Recursos de pool para timing consistente de allocación'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Scientific Computing:' : 'Computación Científica:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Memory tracking for large dataset processing'
                : 'Tracking de memoria para procesamiento de datasets grandes'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Embedded Systems:' : 'Sistemas Embebidos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Limited memory resources with strict bounds checking'
                : 'Recursos de memoria limitados con verificación estricta de límites'
              }
            </li>
          </ul>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default Lesson74_PMR;