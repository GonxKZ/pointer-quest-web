/**
 * Lesson 82: Advanced std::make_shared - Memory Efficiency and Performance
 * Expert-level shared_ptr creation patterns for high-performance systems
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
  AccessibilityAnnouncer,
  PerformanceComparison
} from '../design-system';

interface MakeSharedState {
  language: 'en' | 'es';
  scenario: 'allocation_comparison' | 'exception_safety' | 'performance_analysis' | 'custom_implementation';
  isAnimating: boolean;
  allocations: number;
  memoryUsage: number;
  cacheEfficiency: number;
  exceptionsSafe: number;
}

// 3D Visualización de make_shared
const MakeSharedVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'allocation_comparison') {
      groupRef.current.rotation.y = animationRef.current * 0.4;
      onMetrics({
        allocations: Math.max(1, 2 - Math.floor(animationRef.current * 2) % 3),
        memoryUsage: 80 + Math.sin(animationRef.current * 2) * 20,
        cacheEfficiency: 85 + Math.cos(animationRef.current) * 12
      });
    } else if (scenario === 'performance_analysis') {
      groupRef.current.rotation.x = Math.sin(animationRef.current) * 0.15;
      onMetrics({
        allocations: Math.floor(animationRef.current * 30) % 1000,
        throughput: Math.floor(8000 + Math.sin(animationRef.current * 3) * 2000),
        cacheEfficiency: 90 + Math.sin(animationRef.current * 1.5) * 8
      });
    }
  });

  const renderMemoryBlocks = () => {
    const elements = [];
    const blockCount = scenario === 'allocation_comparison' ? 12 : 16;
    
    for (let i = 0; i < blockCount; i++) {
      let x, y, z;
      
      if (scenario === 'allocation_comparison') {
        // Show memory layout difference: make_shared vs shared_ptr
        const isControlBlock = i < 6;
        x = (i % 6) * 0.8 - 2.0;
        y = isControlBlock ? 0.6 : -0.6;
        z = 0;
      } else {
        // Circular layout for other scenarios
        const angle = (i / blockCount) * Math.PI * 2;
        const radius = 2.2;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = scenario === 'custom_implementation' ? Math.sin(i * 0.3) * 0.4 : 0;
      }
      
      const color = scenario === 'allocation_comparison'
        ? (i < 6 ? '#00ff00' : '#ff8000')  // Green for single allocation, orange for separate
        : scenario === 'exception_safety'
        ? '#0080ff'
        : scenario === 'performance_analysis'
        ? '#ffff00'
        : '#ff00ff';
      
      elements.push(
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
    
    return elements;
  };

  return (
    <group ref={groupRef}>
      {renderMemoryBlocks()}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, 5]} intensity={0.5} />
    </group>
  );
};

const Lesson82_MakeShared: React.FC = () => {
  const [state, setState] = useState<MakeSharedState>({
    language: 'en',
    scenario: 'allocation_comparison',
    isAnimating: false,
    allocations: 0,
    memoryUsage: 0,
    cacheEfficiency: 0,
    exceptionsSafe: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: MakeSharedState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      allocation_comparison: state.language === 'en' ? 'Allocation Comparison' : 'Comparación de Allocación',
      exception_safety: state.language === 'en' ? 'Exception Safety' : 'Seguridad de Excepciones',
      performance_analysis: state.language === 'en' ? 'Performance Analysis' : 'Análisis de Rendimiento',
      custom_implementation: state.language === 'en' ? 'Custom Implementation' : 'Implementación Personalizada'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    allocation_comparison: `// make_shared vs shared_ptr Allocation Comparison
#include <memory>
#include <chrono>
#include <vector>
#include <iostream>
#include <new>

// Custom allocator para tracking
template<typename T>
class TrackingAllocator {
private:
    static size_t allocation_count_;
    static size_t total_allocated_;
    
public:
    using value_type = T;
    
    TrackingAllocator() = default;
    template<typename U> TrackingAllocator(const TrackingAllocator<U>&) {}
    
    T* allocate(size_t n) {
        allocation_count_++;
        total_allocated_ += n * sizeof(T);
        std::cout << "Allocation #" << allocation_count_ 
                  << ": " << n * sizeof(T) << " bytes\\n";
        return static_cast<T*>(::operator new(n * sizeof(T)));
    }
    
    void deallocate(T* p, size_t n) {
        ::operator delete(p);
    }
    
    static void reset_stats() {
        allocation_count_ = 0;
        total_allocated_ = 0;
    }
    
    static size_t get_allocation_count() { return allocation_count_; }
    static size_t get_total_allocated() { return total_allocated_; }
};

template<typename T> size_t TrackingAllocator<T>::allocation_count_ = 0;
template<typename T> size_t TrackingAllocator<T>::total_allocated_ = 0;

class LargeObject {
    std::array<int, 1024> data_;
public:
    LargeObject(int value) { data_.fill(value); }
    int get_first() const { return data_[0]; }
};

void demonstrate_allocation_difference() {
    TrackingAllocator<LargeObject>::reset_stats();
    
    std::cout << "=== Using shared_ptr constructor ===\\n";
    {
        auto obj = new LargeObject(42);
        auto ptr = std::shared_ptr<LargeObject>(obj);
        // Two allocations: one for object, one for control block
    }
    std::cout << "shared_ptr allocations: " 
              << TrackingAllocator<LargeObject>::get_allocation_count() << "\\n";
    
    TrackingAllocator<LargeObject>::reset_stats();
    
    std::cout << "\\n=== Using make_shared ===\\n";
    {
        auto ptr = std::make_shared<LargeObject>(42);
        // Single allocation: object + control block together
    }
    std::cout << "make_shared allocations: " 
              << TrackingAllocator<LargeObject>::get_allocation_count() << "\\n";
}

// Memory layout analysis
void analyze_memory_layout() {
    auto ptr1 = std::make_shared<int>(42);
    auto ptr2 = std::make_shared<int>(84);
    
    std::cout << "make_shared object addresses:\\n";
    std::cout << "ptr1 object: " << ptr1.get() << "\\n";
    std::cout << "ptr2 object: " << ptr2.get() << "\\n";
    std::cout << "Address difference: " 
              << std::abs(reinterpret_cast<ptrdiff_t>(ptr1.get()) - 
                         reinterpret_cast<ptrdiff_t>(ptr2.get())) << " bytes\\n";
    
    // Control blocks are adjacent to objects in make_shared
    std::cout << "Control block locality enables better cache performance\\n";
}

// Performance benchmark
void benchmark_creation_performance() {
    constexpr int iterations = 1000000;
    
    // shared_ptr constructor benchmark
    auto start = std::chrono::high_resolution_clock::now();
    std::vector<std::shared_ptr<int>> shared_ptrs;
    shared_ptrs.reserve(iterations);
    
    for (int i = 0; i < iterations; ++i) {
        shared_ptrs.emplace_back(new int(i));
    }
    
    auto shared_time = std::chrono::high_resolution_clock::now() - start;
    shared_ptrs.clear();
    
    // make_shared benchmark  
    start = std::chrono::high_resolution_clock::now();
    std::vector<std::shared_ptr<int>> make_shared_ptrs;
    make_shared_ptrs.reserve(iterations);
    
    for (int i = 0; i < iterations; ++i) {
        make_shared_ptrs.emplace_back(std::make_shared<int>(i));
    }
    
    auto make_shared_time = std::chrono::high_resolution_clock::now() - start;
    
    std::cout << "shared_ptr time: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(shared_time).count() 
              << " ms\\n";
    std::cout << "make_shared time: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(make_shared_time).count() 
              << " ms\\n";
    
    double improvement = static_cast<double>(shared_time.count()) / make_shared_time.count();
    std::cout << "Performance improvement: " << improvement << "x\\n";
}`,

    exception_safety: `// Exception Safety with make_shared
#include <memory>
#include <stdexcept>
#include <iostream>
#include <vector>

class ThrowingConstructor {
private:
    int value_;
    static int instance_count_;
    
public:
    ThrowingConstructor(int value) : value_(value) {
        instance_count_++;
        std::cout << "Constructing ThrowingConstructor " << instance_count_ << "\\n";
        
        // Simulate construction failure
        if (value < 0) {
            throw std::runtime_error("Invalid value in constructor");
        }
    }
    
    ~ThrowingConstructor() {
        instance_count_--;
        std::cout << "Destroying ThrowingConstructor, remaining: " << instance_count_ << "\\n";
    }
    
    int get_value() const { return value_; }
    static int get_instance_count() { return instance_count_; }
};

int ThrowingConstructor::instance_count_ = 0;

void demonstrate_exception_safety() {
    std::cout << "=== Exception Safety Comparison ===\\n";
    
    // UNSAFE: shared_ptr constructor
    std::cout << "\\nTesting shared_ptr constructor with exception:\\n";
    try {
        // If ThrowingConstructor throws, we have a memory leak!
        auto ptr = std::shared_ptr<ThrowingConstructor>(new ThrowingConstructor(-1));
    } catch (const std::exception& e) {
        std::cout << "Exception caught: " << e.what() << "\\n";
        std::cout << "Potential memory leak - new succeeded but shared_ptr failed\\n";
    }
    
    std::cout << "Instances after shared_ptr exception: " 
              << ThrowingConstructor::get_instance_count() << "\\n";
    
    // SAFE: make_shared
    std::cout << "\\nTesting make_shared with exception:\\n";
    try {
        auto ptr = std::make_shared<ThrowingConstructor>(-1);
    } catch (const std::exception& e) {
        std::cout << "Exception caught: " << e.what() << "\\n";
        std::cout << "No memory leak - atomic allocation/construction\\n";
    }
    
    std::cout << "Instances after make_shared exception: " 
              << ThrowingConstructor::get_instance_count() << "\\n";
}

// Exception safety in function calls
class Resource {
public:
    Resource(const std::string& name) : name_(name) {
        std::cout << "Acquiring resource: " << name_ << "\\n";
    }
    
    ~Resource() {
        std::cout << "Releasing resource: " << name_ << "\\n";
    }
    
private:
    std::string name_;
};

void unsafe_function_call() {
    std::cout << "\\n=== Unsafe Function Call Pattern ===\\n";
    
    auto risky_function = [](std::shared_ptr<Resource> r1, std::shared_ptr<Resource> r2) {
        // Function that might throw before using resources
        throw std::runtime_error("Function failed");
    };
    
    try {
        // DANGER: If risky_function throws after first new but before second,
        // first allocation leaks!
        risky_function(
            std::shared_ptr<Resource>(new Resource("Resource1")),  // Potential leak
            std::shared_ptr<Resource>(new Resource("Resource2"))   // Potential leak
        );
    } catch (const std::exception& e) {
        std::cout << "Function exception: " << e.what() << "\\n";
    }
}

void safe_function_call() {
    std::cout << "\\n=== Safe Function Call Pattern ===\\n";
    
    auto safe_function = [](std::shared_ptr<Resource> r1, std::shared_ptr<Resource> r2) {
        throw std::runtime_error("Function failed");
    };
    
    try {
        // SAFE: Each make_shared is atomic
        safe_function(
            std::make_shared<Resource>("SafeResource1"),
            std::make_shared<Resource>("SafeResource2")
        );
    } catch (const std::exception& e) {
        std::cout << "Function exception: " << e.what() << "\\n";
        std::cout << "All resources properly cleaned up\\n";
    }
}

// RAII Exception Guard Pattern
template<typename T>
class ExceptionGuard {
private:
    T* ptr_;
    bool released_;
    
public:
    explicit ExceptionGuard(T* ptr) : ptr_(ptr), released_(false) {}
    
    ~ExceptionGuard() {
        if (!released_) {
            delete ptr_;
            std::cout << "Exception guard cleaned up leaked pointer\\n";
        }
    }
    
    T* release() {
        released_ = true;
        return ptr_;
    }
    
    ExceptionGuard(const ExceptionGuard&) = delete;
    ExceptionGuard& operator=(const ExceptionGuard&) = delete;
};

void demonstrate_exception_guard() {
    std::cout << "\\n=== Exception Guard Pattern ===\\n";
    
    try {
        auto raw_ptr = new ThrowingConstructor(10);  // Successful construction
        ExceptionGuard<ThrowingConstructor> guard(raw_ptr);
        
        // Simulate some operation that might throw
        if (raw_ptr->get_value() > 5) {
            throw std::runtime_error("Processing failed");
        }
        
        // If we get here, transfer ownership
        auto shared = std::shared_ptr<ThrowingConstructor>(guard.release());
        
    } catch (const std::exception& e) {
        std::cout << "Exception: " << e.what() << "\\n";
        // Guard destructor will clean up
    }
    
    std::cout << "Remaining instances: " 
              << ThrowingConstructor::get_instance_count() << "\\n";
}`,

    performance_analysis: `// Detailed Performance Analysis
#include <memory>
#include <chrono>
#include <vector>
#include <random>
#include <algorithm>
#include <numeric>

// Performance testing framework
class PerformanceTimer {
private:
    std::chrono::high_resolution_clock::time_point start_;
    
public:
    void start() {
        start_ = std::chrono::high_resolution_clock::now();
    }
    
    double elapsed_ms() const {
        auto end = std::chrono::high_resolution_clock::now();
        return std::chrono::duration<double, std::milli>(end - start_).count();
    }
};

// Test data structure
struct DataNode {
    int value;
    std::array<double, 64> data;  // 512 bytes of data
    
    DataNode(int v) : value(v) {
        std::fill(data.begin(), data.end(), static_cast<double>(v));
    }
    
    double sum() const {
        return std::accumulate(data.begin(), data.end(), 0.0);
    }
};

class PerformanceBenchmark {
private:
    static constexpr int ITERATIONS = 100000;
    static constexpr int CACHE_TEST_SIZE = 10000;
    
public:
    struct BenchmarkResults {
        double creation_time_ms;
        double access_time_ms;
        double destruction_time_ms;
        double memory_usage_mb;
        double cache_efficiency;
    };
    
    // Creation performance test
    BenchmarkResults benchmark_creation_performance() {
        PerformanceTimer timer;
        BenchmarkResults results = {};
        
        // Test shared_ptr constructor
        timer.start();
        std::vector<std::shared_ptr<DataNode>> shared_ptrs;
        shared_ptrs.reserve(ITERATIONS);
        
        for (int i = 0; i < ITERATIONS; ++i) {
            shared_ptrs.emplace_back(new DataNode(i));
        }
        
        double shared_creation_time = timer.elapsed_ms();
        shared_ptrs.clear();
        
        // Test make_shared
        timer.start();
        std::vector<std::shared_ptr<DataNode>> make_shared_ptrs;
        make_shared_ptrs.reserve(ITERATIONS);
        
        for (int i = 0; i < ITERATIONS; ++i) {
            make_shared_ptrs.emplace_back(std::make_shared<DataNode>(i));
        }
        
        results.creation_time_ms = timer.elapsed_ms();
        results.memory_usage_mb = (make_shared_ptrs.size() * sizeof(DataNode)) / (1024.0 * 1024.0);
        
        // Access performance test
        timer.start();
        double total_sum = 0.0;
        
        for (const auto& ptr : make_shared_ptrs) {
            total_sum += ptr->sum();
        }
        
        results.access_time_ms = timer.elapsed_ms();
        
        // Destruction test
        timer.start();
        make_shared_ptrs.clear();
        results.destruction_time_ms = timer.elapsed_ms();
        
        // Calculate improvement
        results.cache_efficiency = shared_creation_time / results.creation_time_ms;
        
        return results;
    }
    
    // Cache locality test
    double benchmark_cache_locality() {
        // Create test data with make_shared (better locality)
        std::vector<std::shared_ptr<DataNode>> make_shared_nodes;
        make_shared_nodes.reserve(CACHE_TEST_SIZE);
        
        for (int i = 0; i < CACHE_TEST_SIZE; ++i) {
            make_shared_nodes.emplace_back(std::make_shared<DataNode>(i));
        }
        
        // Create test data with shared_ptr constructor (worse locality)
        std::vector<std::shared_ptr<DataNode>> shared_ptr_nodes;
        shared_ptr_nodes.reserve(CACHE_TEST_SIZE);
        
        for (int i = 0; i < CACHE_TEST_SIZE; ++i) {
            shared_ptr_nodes.emplace_back(new DataNode(i));
        }
        
        // Benchmark sequential access (cache-friendly)
        PerformanceTimer timer;
        
        timer.start();
        double make_shared_sum = 0.0;
        for (const auto& ptr : make_shared_nodes) {
            make_shared_sum += ptr->sum();
        }
        double make_shared_time = timer.elapsed_ms();
        
        timer.start();
        double shared_ptr_sum = 0.0;
        for (const auto& ptr : shared_ptr_nodes) {
            shared_ptr_sum += ptr->sum();
        }
        double shared_ptr_time = timer.elapsed_ms();
        
        return make_shared_time / shared_ptr_time; // Efficiency ratio
    }
    
    // Memory fragmentation analysis
    void analyze_memory_fragmentation() {
        constexpr int NUM_ALLOCATIONS = 1000;
        std::vector<std::shared_ptr<DataNode>> ptrs;
        ptrs.reserve(NUM_ALLOCATIONS);
        
        std::cout << "\\n=== Memory Fragmentation Analysis ===\\n";
        
        // Allocate with make_shared
        for (int i = 0; i < NUM_ALLOCATIONS; ++i) {
            ptrs.emplace_back(std::make_shared<DataNode>(i));
        }
        
        // Analyze address gaps
        std::vector<ptrdiff_t> gaps;
        for (size_t i = 1; i < ptrs.size(); ++i) {
            ptrdiff_t gap = reinterpret_cast<char*>(ptrs[i].get()) - 
                           reinterpret_cast<char*>(ptrs[i-1].get());
            gaps.push_back(std::abs(gap));
        }
        
        auto min_gap = *std::min_element(gaps.begin(), gaps.end());
        auto max_gap = *std::max_element(gaps.begin(), gaps.end());
        auto avg_gap = std::accumulate(gaps.begin(), gaps.end(), 0LL) / gaps.size();
        
        std::cout << "Address gaps analysis:\\n";
        std::cout << "  Min gap: " << min_gap << " bytes\\n";
        std::cout << "  Max gap: " << max_gap << " bytes\\n";
        std::cout << "  Avg gap: " << avg_gap << " bytes\\n";
        std::cout << "  Expected gap (object + control): " << sizeof(DataNode) << " bytes\\n";
        
        // Calculate fragmentation score
        double fragmentation = static_cast<double>(max_gap - min_gap) / sizeof(DataNode);
        std::cout << "  Fragmentation score: " << fragmentation << "\\n";
    }
};

void run_comprehensive_benchmark() {
    PerformanceBenchmark benchmark;
    
    std::cout << "=== Comprehensive Performance Analysis ===\\n";
    
    auto results = benchmark.benchmark_creation_performance();
    
    std::cout << "Creation performance:\\n";
    std::cout << "  Time: " << results.creation_time_ms << " ms\\n";
    std::cout << "  Memory usage: " << results.memory_usage_mb << " MB\\n";
    std::cout << "  Improvement over shared_ptr: " << results.cache_efficiency << "x\\n";
    
    std::cout << "\\nAccess performance:\\n";
    std::cout << "  Time: " << results.access_time_ms << " ms\\n";
    
    double cache_ratio = benchmark.benchmark_cache_locality();
    std::cout << "\\nCache locality improvement: " << (1.0 / cache_ratio) << "x\\n";
    
    benchmark.analyze_memory_fragmentation();
}`,

    custom_implementation: `// Custom make_shared Implementation
#include <memory>
#include <utility>
#include <new>
#include <type_traits>

// Custom control block for our make_shared
template<typename T>
struct CustomControlBlock {
    std::atomic<long> shared_count{1};
    std::atomic<long> weak_count{0};
    alignas(T) char object_storage[sizeof(T)];
    
    template<typename... Args>
    CustomControlBlock(Args&&... args) {
        // Construct object in-place
        new (object_storage) T(std::forward<Args>(args)...);
    }
    
    T* get_object() {
        return reinterpret_cast<T*>(object_storage);
    }
    
    void increment_shared() {
        shared_count.fetch_add(1, std::memory_order_relaxed);
    }
    
    bool decrement_shared() {
        if (shared_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            // Last shared reference - destroy object
            get_object()->~T();
            return true;
        }
        return false;
    }
    
    void increment_weak() {
        weak_count.fetch_add(1, std::memory_order_relaxed);
    }
    
    bool decrement_weak() {
        return weak_count.fetch_sub(1, std::memory_order_acq_rel) == 1;
    }
    
    long get_shared_count() const {
        return shared_count.load(std::memory_order_acquire);
    }
};

// Custom shared_ptr implementation
template<typename T>
class custom_shared_ptr {
private:
    T* ptr_;
    CustomControlBlock<T>* control_block_;
    
    void increment_if_not_null() {
        if (control_block_) {
            control_block_->increment_shared();
        }
    }
    
    void decrement_if_not_null() {
        if (control_block_ && control_block_->decrement_shared()) {
            // Object destroyed, check if we should delete control block
            if (control_block_->decrement_weak()) {
                delete control_block_;
            }
        }
    }
    
public:
    custom_shared_ptr() : ptr_(nullptr), control_block_(nullptr) {}
    
    custom_shared_ptr(const custom_shared_ptr& other) 
        : ptr_(other.ptr_), control_block_(other.control_block_) {
        increment_if_not_null();
    }
    
    custom_shared_ptr(custom_shared_ptr&& other) noexcept
        : ptr_(other.ptr_), control_block_(other.control_block_) {
        other.ptr_ = nullptr;
        other.control_block_ = nullptr;
    }
    
    ~custom_shared_ptr() {
        decrement_if_not_null();
    }
    
    custom_shared_ptr& operator=(const custom_shared_ptr& other) {
        if (this != &other) {
            decrement_if_not_null();
            ptr_ = other.ptr_;
            control_block_ = other.control_block_;
            increment_if_not_null();
        }
        return *this;
    }
    
    custom_shared_ptr& operator=(custom_shared_ptr&& other) noexcept {
        if (this != &other) {
            decrement_if_not_null();
            ptr_ = other.ptr_;
            control_block_ = other.control_block_;
            other.ptr_ = nullptr;
            other.control_block_ = nullptr;
        }
        return *this;
    }
    
    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_; }
    T* get() const { return ptr_; }
    
    long use_count() const {
        return control_block_ ? control_block_->get_shared_count() : 0;
    }
    
    explicit operator bool() const { return ptr_ != nullptr; }
    
    template<typename U> friend custom_shared_ptr<U> custom_make_shared(auto&&... args);
};

// Custom make_shared implementation
template<typename T, typename... Args>
custom_shared_ptr<T> custom_make_shared(Args&&... args) {
    // Single allocation for control block + object
    auto* control_block = new CustomControlBlock<T>(std::forward<Args>(args)...);
    
    custom_shared_ptr<T> result;
    result.ptr_ = control_block->get_object();
    result.control_block_ = control_block;
    
    return result;
}

// Factory pattern with make_shared
template<typename T>
class ObjectFactory {
private:
    std::vector<std::shared_ptr<T>> object_pool_;
    size_t pool_index_ = 0;
    
public:
    template<typename... Args>
    std::shared_ptr<T> create(Args&&... args) {
        // Use make_shared for efficiency
        return std::make_shared<T>(std::forward<Args>(args)...);
    }
    
    template<typename... Args>
    std::shared_ptr<T> create_pooled(Args&&... args) {
        if (object_pool_.empty()) {
            // Initialize pool with make_shared
            object_pool_.reserve(100);
            for (int i = 0; i < 100; ++i) {
                object_pool_.emplace_back(std::make_shared<T>(std::forward<Args>(args)...));
            }
        }
        
        auto result = object_pool_[pool_index_];
        pool_index_ = (pool_index_ + 1) % object_pool_.size();
        return result;
    }
    
    size_t pool_size() const { return object_pool_.size(); }
};

// Thread-safe object cache
template<typename Key, typename T>
class ThreadSafeCache {
private:
    mutable std::shared_mutex mutex_;
    std::unordered_map<Key, std::weak_ptr<T>> cache_;
    
public:
    template<typename... Args>
    std::shared_ptr<T> get_or_create(const Key& key, Args&&... args) {
        // First, try to get existing object
        {
            std::shared_lock lock(mutex_);
            auto it = cache_.find(key);
            if (it != cache_.end()) {
                if (auto shared = it->second.lock()) {
                    return shared; // Object still alive
                }
            }
        }
        
        // Create new object with make_shared
        auto new_object = std::make_shared<T>(std::forward<Args>(args)...);
        
        // Store weak reference
        {
            std::unique_lock lock(mutex_);
            cache_[key] = std::weak_ptr<T>(new_object);
        }
        
        return new_object;
    }
    
    void cleanup_expired() {
        std::unique_lock lock(mutex_);
        auto it = cache_.begin();
        while (it != cache_.end()) {
            if (it->second.expired()) {
                it = cache_.erase(it);
            } else {
                ++it;
            }
        }
    }
    
    size_t size() const {
        std::shared_lock lock(mutex_);
        return cache_.size();
    }
};

// Usage demonstration
void demonstrate_custom_implementations() {
    std::cout << "=== Custom Implementation Demonstration ===\\n";
    
    // Test custom make_shared
    auto custom_ptr = custom_make_shared<int>(42);
    std::cout << "Custom shared_ptr value: " << *custom_ptr << "\\n";
    std::cout << "Use count: " << custom_ptr.use_count() << "\\n";
    
    // Test factory pattern
    ObjectFactory<std::string> factory;
    auto str1 = factory.create("Hello");
    auto str2 = factory.create("World");
    
    std::cout << "Factory created: " << *str1 << " " << *str2 << "\\n";
    
    // Test thread-safe cache
    ThreadSafeCache<int, std::string> cache;
    auto cached1 = cache.get_or_create(1, "First");
    auto cached2 = cache.get_or_create(1, "Second");  // Should return same object
    auto cached3 = cache.get_or_create(2, "Different");
    
    std::cout << "Cache test - same object: " << (cached1 == cached2) << "\\n";
    std::cout << "Cache size: " << cache.size() << "\\n";
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 82: Advanced std::make_shared" : "Lección 82: std::make_shared Avanzado"}
      lessonId="lesson-82"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'Memory Efficiency and Performance Optimization' : 'Eficiencia de Memoria y Optimización de Rendimiento'}
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
                  'Understand memory allocation efficiency of make_shared vs shared_ptr constructor',
                  'Analyze exception safety benefits and implementation details',
                  'Measure performance improvements through cache locality optimization',
                  'Implement custom make_shared variants for specialized use cases',
                  'Design factory patterns and object caches using make_shared',
                  'Apply make_shared patterns in production systems for optimal performance'
                ]
              : [
                  'Entender eficiencia de allocación de memoria de make_shared vs constructor shared_ptr',
                  'Analizar beneficios de seguridad de excepciones y detalles de implementación',
                  'Medir mejoras de rendimiento a través de optimización de localidad de cache',
                  'Implementar variantes personalizadas de make_shared para casos de uso especializados',
                  'Diseñar patrones factory y caches de objetos usando make_shared',
                  'Aplicar patrones make_shared en sistemas de producción para rendimiento óptimo'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive make_shared Demonstration' : 'Demostración Interactiva de make_shared'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <MakeSharedVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('allocation_comparison')}
            variant={state.scenario === 'allocation_comparison' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Allocation Comparison' : 'Comparación Allocación'}
          </Button>
          <Button 
            onClick={() => runScenario('exception_safety')}
            variant={state.scenario === 'exception_safety' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Exception Safety' : 'Seguridad Excepciones'}
          </Button>
          <Button 
            onClick={() => runScenario('performance_analysis')}
            variant={state.scenario === 'performance_analysis' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Performance Analysis' : 'Análisis Rendimiento'}
          </Button>
          <Button 
            onClick={() => runScenario('custom_implementation')}
            variant={state.scenario === 'custom_implementation' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Custom Implementation' : 'Implementación Personalizada'}
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
              label: state.language === 'en' ? 'Memory Usage MB' : 'Uso Memoria MB', 
              value: Math.round(state.memoryUsage),
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Cache Efficiency %' : 'Eficiencia Cache %', 
              value: Math.round(state.cacheEfficiency),
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Exceptions Safe %' : 'Excepciones Seguras %', 
              value: Math.round(state.exceptionsSafe),
              color: '#ff0080'
            }
          ]}
        />

        <PerformanceComparison
          title={state.language === 'en' ? 'make_shared vs shared_ptr Performance' : 'Rendimiento make_shared vs shared_ptr'}
          scenarios={[
            {
              name: state.language === 'en' ? 'shared_ptr constructor' : 'constructor shared_ptr',
              metrics: {
                [state.language === 'en' ? 'Allocations' : 'Allocaciones']: 2,
                [state.language === 'en' ? 'Cache Misses' : 'Cache Misses']: 45,
                [state.language === 'en' ? 'Exception Safety' : 'Seguridad Excepciones']: 60
              }
            },
            {
              name: state.language === 'en' ? 'make_shared' : 'make_shared',
              metrics: {
                [state.language === 'en' ? 'Allocations' : 'Allocaciones']: 1,
                [state.language === 'en' ? 'Cache Misses' : 'Cache Misses']: 20,
                [state.language === 'en' ? 'Exception Safety' : 'Seguridad Excepciones']: 100
              }
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'allocation_comparison' && (state.language === 'en' ? 'Memory Allocation Comparison' : 'Comparación de Allocación de Memoria')}
          {state.scenario === 'exception_safety' && (state.language === 'en' ? 'Exception Safety Patterns' : 'Patrones de Seguridad de Excepciones')}
          {state.scenario === 'performance_analysis' && (state.language === 'en' ? 'Performance Analysis' : 'Análisis de Rendimiento')}
          {state.scenario === 'custom_implementation' && (state.language === 'en' ? 'Custom Implementation' : 'Implementación Personalizada')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'allocation_comparison' ? 
              (state.language === 'en' ? 'Allocation Efficiency Analysis' : 'Análisis de Eficiencia de Allocación') :
            state.scenario === 'exception_safety' ? 
              (state.language === 'en' ? 'Exception Safety Implementation' : 'Implementación de Seguridad de Excepciones') :
            state.scenario === 'performance_analysis' ? 
              (state.language === 'en' ? 'Performance Benchmarking' : 'Benchmarking de Rendimiento') :
            (state.language === 'en' ? 'Custom make_shared Implementation' : 'Implementación Personalizada de make_shared')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Production Optimization Strategies' : 'Estrategias de Optimización de Producción'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #333'
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🚀 Key Performance Benefits:' : '🚀 Beneficios Clave de Rendimiento:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Single Allocation:' : 'Allocación Única:'}</strong>{' '}
              {state.language === 'en' 
                ? 'make_shared combines object and control block in one allocation, reducing memory fragmentation'
                : 'make_shared combina objeto y bloque de control en una allocación, reduciendo fragmentación de memoria'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Cache Locality:' : 'Localidad de Cache:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Adjacent memory layout improves cache performance by 15-30% in typical workloads'
                : 'Layout de memoria adyacente mejora rendimiento de cache 15-30% en cargas de trabajo típicas'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Exception Safety:' : 'Seguridad de Excepciones:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Atomic allocation/construction eliminates memory leaks during exception scenarios'
                : 'Allocación/construcción atómica elimina fugas de memoria durante escenarios de excepción'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Reduced Overhead:' : 'Overhead Reducido:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Single allocation reduces malloc overhead and memory bookkeeping costs'
                : 'Allocación única reduce overhead de malloc y costos de contabilidad de memoria'
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
            {state.language === 'en' ? '⚠️ Limitations and Considerations:' : '⚠️ Limitaciones y Consideraciones:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Custom Deleters:' : 'Deleters Personalizados:'}</strong>{' '}
              {state.language === 'en' 
                ? 'make_shared cannot be used with custom deleters - use shared_ptr constructor instead'
                : 'make_shared no puede usarse con deleters personalizados - usa constructor shared_ptr en su lugar'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Array Support:' : 'Soporte de Arrays:'}</strong>{' '}
              {state.language === 'en' 
                ? 'make_shared for arrays requires C++20 - use make_unique for arrays in earlier standards'
                : 'make_shared para arrays requiere C++20 - usa make_unique para arrays en estándares anteriores'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Memory Lifetime:' : 'Tiempo de Vida de Memoria:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Control block memory stays allocated until all weak_ptr references are destroyed'
                : 'Memoria del bloque de control permanece allocada hasta que todas las referencias weak_ptr son destruidas'
              }
            </li>
          </ul>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default Lesson82_MakeShared;