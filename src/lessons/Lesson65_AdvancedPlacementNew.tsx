import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LessonLayout, Section, SectionTitle, InteractiveSection,
  LearningObjectives, Button, CodeBlock, PerformanceMonitor,
  AccessibilityAnnouncer, theme, type LessonProgress 
} from '../design-system';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import { THREE } from '../utils/three';

interface AdvancedPlacementState {
  demonstrationType: 'exception_safety' | 'array_management' | 'custom_allocator' | 'performance';
  currentScenario: number;
  exceptionTest: {
    step: number;
    constructed: number[];
    failed_at: number | null;
    cleanup_performed: boolean;
  };
  arrayState: {
    elements: { index: number; constructed: boolean; value: string }[];
    constructionOrder: number[];
    destructionOrder: number[];
  };
  allocatorStats: {
    allocations: number;
    deallocations: number;
    peak_usage: number;
    current_usage: number;
    fragmentation: number;
  };
  performanceMetrics: {
    placement_new_time: number;
    regular_new_time: number;
    construction_count: number;
    cache_misses: number;
  };
}

const AdvancedPlacementVisualization: React.FC<{ state: AdvancedPlacementState }> = ({ state }) => {
  const scenarios = [
    {
      title: 'Exception Safety',
      description: 'Handling exceptions during placement new construction',
      visualization: 'exception_safety'
    },
    {
      title: 'Array Management',
      description: 'Element-wise array construction and destruction',
      visualization: 'array_management'
    },
    {
      title: 'Custom Allocator',
      description: 'Integration with custom memory allocators',
      visualization: 'custom_allocator'
    },
    {
      title: 'Performance Analysis',
      description: 'Comparing placement new vs regular allocation',
      visualization: 'performance'
    }
  ];

  const currentScenario = scenarios[state.currentScenario] || scenarios[0];

  const renderExceptionSafety = () => (
    <group>
      <Text position={[0, 3, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        Exception Safety Demo
      </Text>
      
      {/* Construction progress */}
      {[0, 1, 2, 3, 4].map(index => (
        <group key={index} position={[index * 1.5 - 3, 2, 0]}>
          <Box args={[1.2, 0.8, 0.3]}>
            <meshStandardMaterial 
              color={
                state.exceptionTest.constructed.includes(index) ? '#2ed573' :
                state.exceptionTest.failed_at === index ? '#ff4757' :
                '#57606f'
              }
              transparent 
              opacity={0.8} 
            />
          </Box>
          
          <Text position={[0, 0, 0.2]} fontSize={0.08} color="white" anchorX="center">
            [{index}]
          </Text>
          
          <Text position={[0, -0.5, 0]} fontSize={0.06} color="#888" anchorX="center">
            {state.exceptionTest.constructed.includes(index) ? '✓ OK' :
             state.exceptionTest.failed_at === index ? '✗ Failed' : 'Pending'}
          </Text>
          
          {/* Exception indicator */}
          {state.exceptionTest.failed_at === index && (
            <Text position={[0, 0.6, 0]} fontSize={0.07} color="#ff4757" anchorX="center">
              💥 Exception
            </Text>
          )}
        </group>
      ))}
      
      {/* Cleanup status */}
      <group position={[0, 0.5, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.15} color="#ffa500" anchorX="center">
          Cleanup Status
        </Text>
        
        <Text position={[0, 0, 0]} fontSize={0.1} 
              color={state.exceptionTest.cleanup_performed ? '#2ed573' : '#ff4757'} 
              anchorX="center">
          {state.exceptionTest.cleanup_performed ? '✓ Cleanup Performed' : '✗ Cleanup Needed'}
        </Text>
      </group>
    </group>
  );

  const renderArrayManagement = () => (
    <group>
      <Text position={[0, 3, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        Array Element Management
      </Text>
      
      {/* Array elements */}
      {state.arrayState.elements.map((element, index) => (
        <group key={index} position={[index * 1.2 - 2.4, 2, 0]}>
          <Box args={[1, 1, 0.3]}>
            <meshStandardMaterial 
              color={element.constructed ? '#00d4ff' : '#57606f'}
              transparent 
              opacity={0.8} 
            />
          </Box>
          
          <Text position={[0, 0.1, 0.2]} fontSize={0.07} color="white" anchorX="center">
            [{element.index}]
          </Text>
          
          <Text position={[0, -0.1, 0.2]} fontSize={0.06} color="white" anchorX="center">
            {element.value}
          </Text>
          
          <Text position={[0, -0.6, 0]} fontSize={0.05} color="#888" anchorX="center">
            {element.constructed ? 'Constructed' : 'Uninitialized'}
          </Text>
        </group>
      ))}
      
      {/* Construction/Destruction order */}
      <group position={[0, 0.5, 0]}>
        <Text position={[-2, 0.3, 0]} fontSize={0.12} color="#2ed573" anchorX="center">
          Construction: [{state.arrayState.constructionOrder.join(', ')}]
        </Text>
        
        <Text position={[2, 0.3, 0]} fontSize={0.12} color="#e74c3c" anchorX="center">
          Destruction: [{state.arrayState.destructionOrder.join(', ')}]
        </Text>
      </group>
    </group>
  );

  const renderCustomAllocator = () => (
    <group>
      <Text position={[0, 3, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        Custom Allocator Integration
      </Text>
      
      {/* Memory blocks visualization */}
      <group position={[0, 2, 0]}>
        {[0, 1, 2, 3, 4, 5].map(index => (
          <group key={index} position={[index * 1.5 - 3.75, 0, 0]}>
            <Box args={[1.2, 1.5, 0.3]}>
              <meshStandardMaterial 
                color={index < 3 ? '#2ed573' : '#57606f'}
                transparent 
                opacity={0.7} 
              />
            </Box>
            
            <Text position={[0, 0, 0.2]} fontSize={0.06} color="white" anchorX="center">
              Block {index}
            </Text>
            
            <Text position={[0, -0.8, 0]} fontSize={0.05} color="#888" anchorX="center">
              {index < 3 ? 'Allocated' : 'Free'}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Allocator statistics */}
      <group position={[0, 0, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.15} color="#ffa500" anchorX="center">
          Allocator Statistics
        </Text>
        
        <Text position={[-2.5, 0, 0]} fontSize={0.08} color="#2ed573" anchorX="center">
          Allocations: {state.allocatorStats.allocations}
        </Text>
        
        <Text position={[-0.8, 0, 0]} fontSize={0.08} color="#e74c3c" anchorX="center">
          Deallocations: {state.allocatorStats.deallocations}
        </Text>
        
        <Text position={[0.8, 0, 0]} fontSize={0.08} color="#00d4ff" anchorX="center">
          Peak: {state.allocatorStats.peak_usage} KB
        </Text>
        
        <Text position={[2.5, 0, 0]} fontSize={0.08} color="#ffa500" anchorX="center">
          Fragmentation: {state.allocatorStats.fragmentation}%
        </Text>
      </group>
    </group>
  );

  const renderPerformance = () => (
    <group>
      <Text position={[0, 3, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        Performance Comparison
      </Text>
      
      {/* Performance bars */}
      <group position={[0, 2, 0]}>
        <group position={[-2, 0, 0]}>
          <Box args={[0.5, state.performanceMetrics.placement_new_time / 10, 0.3]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.8} />
          </Box>
          <Text position={[0, -1, 0]} fontSize={0.08} color="#2ed573" anchorX="center">
            Placement New
          </Text>
          <Text position={[0, -1.3, 0]} fontSize={0.06} color="#888" anchorX="center">
            {state.performanceMetrics.placement_new_time}ns
          </Text>
        </group>
        
        <group position={[2, 0, 0]}>
          <Box args={[0.5, state.performanceMetrics.regular_new_time / 10, 0.3]}>
            <meshStandardMaterial color="#ff4757" transparent opacity={0.8} />
          </Box>
          <Text position={[0, -1, 0]} fontSize={0.08} color="#ff4757" anchorX="center">
            Regular New
          </Text>
          <Text position={[0, -1.3, 0]} fontSize={0.06} color="#888" anchorX="center">
            {state.performanceMetrics.regular_new_time}ns
          </Text>
        </group>
      </group>
      
      {/* Performance metrics */}
      <group position={[0, 0, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.12} color="#ffa500" anchorX="center">
          Performance Metrics
        </Text>
        
        <Text position={[-1.5, 0, 0]} fontSize={0.08} color="#00d4ff" anchorX="center">
          Objects: {state.performanceMetrics.construction_count}
        </Text>
        
        <Text position={[1.5, 0, 0]} fontSize={0.08} color="#e74c3c" anchorX="center">
          Cache Misses: {state.performanceMetrics.cache_misses}
        </Text>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      <Text position={[0, 4, 0]} fontSize={0.25} color="#00d4ff" anchorX="center">
        {currentScenario.title}
      </Text>
      
      <Text position={[0, 3.6, 0]} fontSize={0.12} color="#ffa500" anchorX="center">
        {currentScenario.description}
      </Text>
      
      {state.demonstrationType === 'exception_safety' && renderExceptionSafety()}
      {state.demonstrationType === 'array_management' && renderArrayManagement()}
      {state.demonstrationType === 'custom_allocator' && renderCustomAllocator()}
      {state.demonstrationType === 'performance' && renderPerformance()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson65_AdvancedPlacementNew: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<AdvancedPlacementState>({
    demonstrationType: 'exception_safety',
    currentScenario: 0,
    exceptionTest: {
      step: 0,
      constructed: [],
      failed_at: null,
      cleanup_performed: false
    },
    arrayState: {
      elements: Array.from({ length: 5 }, (_, i) => ({ 
        index: i, 
        constructed: false, 
        value: '' 
      })),
      constructionOrder: [],
      destructionOrder: []
    },
    allocatorStats: {
      allocations: 0,
      deallocations: 0,
      peak_usage: 0,
      current_usage: 0,
      fragmentation: 0
    },
    performanceMetrics: {
      placement_new_time: 85,
      regular_new_time: 220,
      construction_count: 0,
      cache_misses: 12
    }
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 8,
    completedSteps: [],
    score: 0
  });

  const codeExamples = {
    exception_safety: `// Exception safety with placement new
#include <new>
#include <vector>
#include <stdexcept>

class ThrowingClass {
    static int construct_count;
public:
    ThrowingClass(int id) {
        if (++construct_count == 3) {
            throw std::runtime_error("Construction failed at object 3");
        }
        std::cout << "Constructed object " << construct_count << std::endl;
    }
    
    ~ThrowingClass() {
        std::cout << "Destroyed object" << std::endl;
    }
};

int ThrowingClass::construct_count = 0;

// ❌ UNSAFE: No exception handling
void unsafe_array_construction() {
    constexpr size_t N = 5;
    alignas(ThrowingClass) char buffer[N * sizeof(ThrowingClass)];
    ThrowingClass* objects = reinterpret_cast<ThrowingClass*>(buffer);
    
    // This will throw and leak the first 2 objects!
    for (size_t i = 0; i < N; ++i) {
        new(objects + i) ThrowingClass(static_cast<int>(i));
        // Exception thrown at i=2, objects 0 and 1 are never destroyed!
    }
}

// ✅ SAFE: Exception-safe construction
void safe_array_construction() {
    constexpr size_t N = 5;
    alignas(ThrowingClass) char buffer[N * sizeof(ThrowingClass)];
    ThrowingClass* objects = reinterpret_cast<ThrowingClass*>(buffer);
    
    size_t constructed = 0;
    try {
        for (size_t i = 0; i < N; ++i) {
            new(objects + i) ThrowingClass(static_cast<int>(i));
            ++constructed;  // Only increment after successful construction
        }
    } catch (...) {
        // Clean up successfully constructed objects
        for (size_t i = 0; i < constructed; ++i) {
            objects[i].~ThrowingClass();
        }
        throw;  // Re-throw the exception
    }
    
    // If we get here, all objects were constructed successfully
    // Normal cleanup...
    for (size_t i = 0; i < N; ++i) {
        objects[i].~ThrowingClass();
    }
}

// ✅ RAII approach for automatic cleanup
template<typename T>
class PlacementArray {
private:
    alignas(T) char* buffer;
    T* objects;
    size_t capacity;
    size_t size = 0;
    
public:
    PlacementArray(size_t n) : capacity(n), buffer(new alignas(T) char[n * sizeof(T)]) {
        objects = reinterpret_cast<T*>(buffer);
    }
    
    ~PlacementArray() {
        // Destroy in reverse order
        while (size > 0) {
            objects[--size].~T();
        }
        delete[] buffer;
    }
    
    template<typename... Args>
    void emplace_back(Args&&... args) {
        if (size >= capacity) {
            throw std::runtime_error("Array full");
        }
        
        try {
            new(objects + size) T(std::forward<Args>(args)...);
            ++size;  // Only increment on success
        } catch (...) {
            // Object construction failed, size unchanged
            throw;
        }
    }
    
    T& operator[](size_t index) { return objects[index]; }
    size_t get_size() const { return size; }
};`,

    custom_allocator: `// Integration with custom allocators
#include <new>
#include <memory>
#include <memory_resource>

// Custom allocator using placement new
template<typename T, size_t BlockSize = 4096>
class PoolAllocator {
private:
    struct Block {
        alignas(T) char data[BlockSize];
        Block* next = nullptr;
    };
    
    Block* current_block = nullptr;
    char* current_pos = nullptr;
    char* block_end = nullptr;
    std::vector<std::unique_ptr<Block>> blocks;
    
    void allocate_new_block() {
        auto block = std::make_unique<Block>();
        current_pos = block->data;
        block_end = block->data + BlockSize;
        current_block = block.get();
        blocks.push_back(std::move(block));
    }
    
public:
    PoolAllocator() {
        allocate_new_block();
    }
    
    template<typename... Args>
    T* construct(Args&&... args) {
        // Check if we have space for T with proper alignment
        auto aligned_pos = std::align(alignof(T), sizeof(T), 
                                    reinterpret_cast<void*&>(current_pos),
                                    block_end - current_pos);
        
        if (!aligned_pos) {
            allocate_new_block();
            aligned_pos = std::align(alignof(T), sizeof(T),
                                   reinterpret_cast<void*&>(current_pos),
                                   block_end - current_pos);
        }
        
        if (!aligned_pos) {
            throw std::bad_alloc();
        }
        
        // Construct object using placement new
        T* result = new(aligned_pos) T(std::forward<Args>(args)...);
        current_pos += sizeof(T);
        
        return result;
    }
    
    void destroy(T* obj) {
        obj->~T();
        // Note: We don't reclaim individual objects in this simple pool
        // In a real implementation, you might maintain a free list
    }
    
    // Get memory usage statistics
    size_t get_total_allocated() const {
        return blocks.size() * BlockSize;
    }
    
    size_t get_used_in_current_block() const {
        return current_block ? (current_pos - current_block->data) : 0;
    }
};

// Usage example
void custom_allocator_example() {
    PoolAllocator<std::string> pool;
    
    std::vector<std::string*> strings;
    
    // Allocate many strings from the pool
    for (int i = 0; i < 1000; ++i) {
        auto* str = pool.construct("String " + std::to_string(i));
        strings.push_back(str);
    }
    
    // Use the strings...
    for (auto* str : strings) {
        std::cout << *str << "\\n";
    }
    
    // Clean up
    for (auto* str : strings) {
        pool.destroy(str);
    }
    
    std::cout << "Total allocated: " << pool.get_total_allocated() << " bytes\\n";
}

// C++17 std::pmr integration
#ifdef __cpp_lib_memory_resource
class PMRPlacementResource : public std::pmr::memory_resource {
private:
    alignas(std::max_align_t) char buffer[8192];
    char* current = buffer;
    char* end = buffer + sizeof(buffer);
    
protected:
    void* do_allocate(size_t bytes, size_t alignment) override {
        auto aligned_ptr = std::align(alignment, bytes,
                                    reinterpret_cast<void*&>(current),
                                    end - current);
        
        if (!aligned_ptr) {
            throw std::bad_alloc();
        }
        
        current += bytes;
        return aligned_ptr;
    }
    
    void do_deallocate(void* ptr, size_t bytes, size_t alignment) override {
        // Simple implementation: no individual deallocation
        // All memory is reclaimed when resource is destroyed
    }
    
    bool do_is_equal(const memory_resource& other) const noexcept override {
        return this == &other;
    }
    
public:
    void reset() { current = buffer; }
    
    size_t bytes_used() const { return current - buffer; }
    size_t bytes_available() const { return end - current; }
};

void pmr_placement_example() {
    PMRPlacementResource resource;
    std::pmr::polymorphic_allocator<std::string> alloc(&resource);
    
    // Create container using our custom resource
    std::pmr::vector<std::string> strings(alloc);
    
    for (int i = 0; i < 100; ++i) {
        strings.push_back("PMR String " + std::to_string(i));
    }
    
    std::cout << "Resource used: " << resource.bytes_used() << " bytes\\n";
}
#endif`,

    performance_optimization: `// Performance optimization techniques
#include <chrono>
#include <new>
#include <memory>
#include <vector>

// Performance benchmark framework
template<typename Func>
auto benchmark(Func&& func, int iterations = 1000) {
    auto start = std::chrono::high_resolution_clock::now();
    
    for (int i = 0; i < iterations; ++i) {
        func();
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
}

class TestObject {
    std::string data;
    std::vector<int> numbers;
    
public:
    TestObject(const std::string& str, size_t num_count) 
        : data(str), numbers(num_count, 42) {}
        
    const std::string& get_data() const { return data; }
};

// Performance comparison: placement new vs regular allocation
void performance_comparison() {
    constexpr int ITERATIONS = 10000;
    constexpr size_t POOL_SIZE = ITERATIONS * sizeof(TestObject);
    
    // Pre-allocated memory pool for placement new
    auto pool = std::make_unique<alignas(TestObject) char[]>(POOL_SIZE);
    char* pool_ptr = pool.get();
    
    // Test 1: Regular new/delete
    auto regular_time = benchmark([&]() {
        std::vector<std::unique_ptr<TestObject>> objects;
        
        for (int i = 0; i < 100; ++i) {
            objects.push_back(std::make_unique<TestObject>("regular_" + std::to_string(i), 10));
        }
        
        // Objects automatically destroyed when vector goes out of scope
    }, ITERATIONS / 100);
    
    // Test 2: Placement new with pool
    auto placement_time = benchmark([&]() {
        std::vector<TestObject*> objects;
        char* current = pool_ptr;
        
        for (int i = 0; i < 100; ++i) {
            auto* obj = new(current) TestObject("placement_" + std::to_string(i), 10);
            objects.push_back(obj);
            current += sizeof(TestObject);
        }
        
        // Manual cleanup
        for (auto* obj : objects) {
            obj->~TestObject();
        }
    }, ITERATIONS / 100);
    
    std::cout << "Regular allocation: " << regular_time.count() / (ITERATIONS / 100) << "ns per iteration\\n";
    std::cout << "Placement new: " << placement_time.count() / (ITERATIONS / 100) << "ns per iteration\\n";
    std::cout << "Speedup: " << static_cast<double>(regular_time.count()) / placement_time.count() << "x\\n";
}

// Cache-friendly placement new patterns
template<typename T>
class CacheFriendlyPool {
private:
    static constexpr size_t CACHE_LINE_SIZE = 64;
    static constexpr size_t OBJECTS_PER_CACHE_LINE = CACHE_LINE_SIZE / sizeof(T);
    
    struct alignas(CACHE_LINE_SIZE) CacheLine {
        T objects[OBJECTS_PER_CACHE_LINE];
    };
    
    std::vector<std::unique_ptr<CacheLine>> cache_lines;
    size_t current_line = 0;
    size_t current_object = 0;
    
public:
    template<typename... Args>
    T* construct(Args&&... args) {
        if (current_object >= OBJECTS_PER_CACHE_LINE) {
            current_line++;
            current_object = 0;
            
            if (current_line >= cache_lines.size()) {
                cache_lines.push_back(std::make_unique<CacheLine>());
            }
        }
        
        T* location = &cache_lines[current_line]->objects[current_object++];
        return new(location) T(std::forward<Args>(args)...);
    }
    
    void reset() {
        // Destroy all objects first
        for (size_t line = 0; line <= current_line; ++line) {
            size_t objects_in_line = (line == current_line) ? current_object : OBJECTS_PER_CACHE_LINE;
            for (size_t obj = 0; obj < objects_in_line; ++obj) {
                cache_lines[line]->objects[obj].~T();
            }
        }
        
        current_line = 0;
        current_object = 0;
    }
};

// NUMA-aware placement new (Linux specific)
#ifdef __linux__
#include <numa.h>

class NUMAPlacementPool {
private:
    void* memory;
    size_t size;
    char* current;
    int node;
    
public:
    NUMAPlacementPool(size_t pool_size, int numa_node = -1) 
        : size(pool_size), node(numa_node) {
        
        if (numa_node >= 0 && numa_available() >= 0) {
            memory = numa_alloc_onnode(size, numa_node);
        } else {
            memory = std::aligned_alloc(std::max_align_t, size);
        }
        
        if (!memory) {
            throw std::bad_alloc();
        }
        
        current = static_cast<char*>(memory);
    }
    
    ~NUMAPlacementPool() {
        if (node >= 0 && numa_available() >= 0) {
            numa_free(memory, size);
        } else {
            std::free(memory);
        }
    }
    
    template<typename T, typename... Args>
    T* construct(Args&&... args) {
        auto aligned_pos = std::align(alignof(T), sizeof(T),
                                    reinterpret_cast<void*&>(current),
                                    size - (current - static_cast<char*>(memory)));
        
        if (!aligned_pos) {
            throw std::bad_alloc();
        }
        
        T* result = new(aligned_pos) T(std::forward<Args>(args)...);
        current += sizeof(T);
        
        return result;
    }
};
#endif`,

    array_management: `// Advanced array management with placement new
#include <new>
#include <algorithm>
#include <memory>

// Exception-safe array construction helper
template<typename T>
class PlacementArrayBuilder {
private:
    T* array;
    size_t capacity;
    size_t constructed = 0;
    
public:
    PlacementArrayBuilder(void* memory, size_t count) 
        : array(static_cast<T*>(memory)), capacity(count) {}
    
    ~PlacementArrayBuilder() {
        // Destroy constructed elements in reverse order
        destroy_all();
    }
    
    template<typename... Args>
    void construct_next(Args&&... args) {
        if (constructed >= capacity) {
            throw std::runtime_error("Array capacity exceeded");
        }
        
        try {
            new(array + constructed) T(std::forward<Args>(args)...);
            ++constructed;
        } catch (...) {
            // Don't increment constructed on failure
            throw;
        }
    }
    
    // Commit the array - prevents destructor from cleaning up
    T* release() {
        T* result = array;
        array = nullptr;  // Prevent cleanup
        return result;
    }
    
    size_t size() const { return constructed; }
    
private:
    void destroy_all() {
        if (array) {
            while (constructed > 0) {
                array[--constructed].~T();
            }
        }
    }
};

// Advanced array operations
template<typename T>
class PlacementArray {
private:
    alignas(T) char* buffer;
    T* data;
    size_t capacity_;
    size_t size_ = 0;
    
public:
    explicit PlacementArray(size_t capacity) : capacity_(capacity) {
        buffer = new alignas(T) char[capacity * sizeof(T)];
        data = reinterpret_cast<T*>(buffer);
    }
    
    ~PlacementArray() {
        clear();
        delete[] buffer;
    }
    
    // Copy constructor with placement new
    PlacementArray(const PlacementArray& other) 
        : capacity_(other.capacity_) {
        buffer = new alignas(T) char[capacity_ * sizeof(T)];
        data = reinterpret_cast<T*>(buffer);
        
        // Copy construct elements
        PlacementArrayBuilder<T> builder(data, capacity_);
        try {
            for (size_t i = 0; i < other.size_; ++i) {
                builder.construct_next(other.data[i]);
            }
            size_ = builder.size();
            builder.release();  // Prevent cleanup
        } catch (...) {
            delete[] buffer;
            throw;
        }
    }
    
    // Move constructor
    PlacementArray(PlacementArray&& other) noexcept 
        : buffer(other.buffer), data(other.data), 
          capacity_(other.capacity_), size_(other.size_) {
        other.buffer = nullptr;
        other.data = nullptr;
        other.capacity_ = 0;
        other.size_ = 0;
    }
    
    template<typename... Args>
    void emplace_back(Args&&... args) {
        if (size_ >= capacity_) {
            throw std::runtime_error("Array is full");
        }
        
        new(data + size_) T(std::forward<Args>(args)...);
        ++size_;
    }
    
    void pop_back() {
        if (size_ > 0) {
            data[--size_].~T();
        }
    }
    
    void clear() {
        while (size_ > 0) {
            pop_back();
        }
    }
    
    // Resize with placement new/destruction
    void resize(size_t new_size) {
        if (new_size > capacity_) {
            throw std::runtime_error("Cannot resize beyond capacity");
        }
        
        if (new_size > size_) {
            // Construct new elements with default values
            for (size_t i = size_; i < new_size; ++i) {
                new(data + i) T{};  // Default construction
            }
        } else if (new_size < size_) {
            // Destroy excess elements
            while (size_ > new_size) {
                pop_back();
            }
        }
        
        size_ = new_size;
    }
    
    T& operator[](size_t index) { return data[index]; }
    const T& operator[](size_t index) const { return data[index]; }
    
    size_t size() const { return size_; }
    size_t capacity() const { return capacity_; }
    
    // Iterator support
    T* begin() { return data; }
    T* end() { return data + size_; }
    const T* begin() const { return data; }
    const T* end() const { return data + size_; }
};

// Usage examples
void array_management_examples() {
    // Exception-safe construction
    {
        constexpr size_t N = 10;
        alignas(std::string) char buffer[N * sizeof(std::string)];
        
        PlacementArrayBuilder<std::string> builder(buffer, N);
        
        try {
            for (int i = 0; i < N; ++i) {
                if (i == 7) {
                    throw std::runtime_error("Simulated construction failure");
                }
                builder.construct_next("String " + std::to_string(i));
            }
            
            // If we get here, all constructions succeeded
            auto* array = builder.release();
            
            // Use array...
            for (size_t i = 0; i < builder.size(); ++i) {
                std::cout << array[i] << "\\n";
            }
            
            // Manual cleanup
            for (size_t i = 0; i < builder.size(); ++i) {
                array[builder.size() - 1 - i].~std::string();
            }
            
        } catch (const std::exception& e) {
            std::cout << "Construction failed: " << e.what() << "\\n";
            // Automatic cleanup handled by ~PlacementArrayBuilder()
        }
    }
    
    // Dynamic array with placement new
    {
        PlacementArray<std::string> arr(20);
        
        for (int i = 0; i < 10; ++i) {
            arr.emplace_back("Item " + std::to_string(i));
        }
        
        std::cout << "Array size: " << arr.size() << "\\n";
        
        // Use range-based for loop
        for (const auto& item : arr) {
            std::cout << item << " ";
        }
        std::cout << "\\n";
        
        // Resize operations
        arr.resize(15);  // Add 5 default-constructed elements
        arr.resize(5);   // Remove 10 elements
        
        std::cout << "After resize: " << arr.size() << " elements\\n";
    }
}`
  };

  const scenarios = [
    {
      title: 'Exception Safety',
      code: codeExamples.exception_safety,
      explanation: state.language === 'en' 
        ? 'Learn to handle exceptions safely during placement new construction.'
        : 'Aprende a manejar excepciones de forma segura durante la construcción con placement new.'
    },
    {
      title: 'Custom Allocators',
      code: codeExamples.custom_allocator,
      explanation: state.language === 'en'
        ? 'Integrate placement new with custom memory allocators and pools.'
        : 'Integra placement new con allocators de memoria personalizados y pools.'
    },
    {
      title: 'Performance Optimization',
      code: codeExamples.performance_optimization,
      explanation: state.language === 'en'
        ? 'Optimize performance with cache-friendly and NUMA-aware placement new.'
        : 'Optimiza rendimiento con placement new amigable al caché y consciente de NUMA.'
    },
    {
      title: 'Array Management',
      code: codeExamples.array_management,
      explanation: state.language === 'en'
        ? 'Master advanced array construction and destruction patterns.'
        : 'Domina patrones avanzados de construcción y destrucción de arrays.'
    }
  ];

  const simulateException = () => {
    setLessonState(prev => ({
      ...prev,
      exceptionTest: {
        step: prev.exceptionTest.step + 1,
        constructed: [0, 1], // First 2 objects constructed successfully
        failed_at: 2, // Third object fails
        cleanup_performed: false
      }
    }));
  };

  const performCleanup = () => {
    setLessonState(prev => ({
      ...prev,
      exceptionTest: {
        ...prev.exceptionTest,
        cleanup_performed: true
      }
    }));
  };

  const simulateArrayConstruction = () => {
    setLessonState(prev => {
      const nextIndex = prev.arrayState.constructionOrder.length;
      if (nextIndex >= prev.arrayState.elements.length) return prev;

      return {
        ...prev,
        arrayState: {
          ...prev.arrayState,
          elements: prev.arrayState.elements.map((el, i) => 
            i === nextIndex ? { ...el, constructed: true, value: `Obj${i}` } : el
          ),
          constructionOrder: [...prev.arrayState.constructionOrder, nextIndex]
        }
      };
    });
  };

  const simulateArrayDestruction = () => {
    setLessonState(prev => {
      const constructed = prev.arrayState.elements.filter(el => el.constructed);
      if (constructed.length === 0) return prev;

      const lastIndex = constructed[constructed.length - 1].index;

      return {
        ...prev,
        arrayState: {
          ...prev.arrayState,
          elements: prev.arrayState.elements.map((el, i) => 
            i === lastIndex ? { ...el, constructed: false, value: '' } : el
          ),
          destructionOrder: [...prev.arrayState.destructionOrder, lastIndex]
        }
      };
    });
  };

  const runPerformanceTest = () => {
    setLessonState(prev => ({
      ...prev,
      performanceMetrics: {
        ...prev.performanceMetrics,
        construction_count: prev.performanceMetrics.construction_count + 100,
        placement_new_time: Math.max(50, prev.performanceMetrics.placement_new_time - 5),
        regular_new_time: prev.performanceMetrics.regular_new_time + Math.floor(Math.random() * 20) - 10
      }
    }));
  };

  const nextScenario = () => {
    const nextIndex = (lessonState.currentScenario + 1) % scenarios.length;
    setLessonState(prev => ({
      ...prev,
      currentScenario: nextIndex,
      demonstrationType: ['exception_safety', 'custom_allocator', 'performance', 'array_management'][nextIndex] as AdvancedPlacementState['demonstrationType']
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Master exception-safe placement new techniques' : 'Dominar técnicas de placement new seguras ante excepciones',
    state.language === 'en' ? 'Integrate with custom allocators and memory pools' : 'Integrar con allocators personalizados y pools de memoria',
    state.language === 'en' ? 'Optimize performance with cache-friendly patterns' : 'Optimizar rendimiento con patrones amigables al caché',
    state.language === 'en' ? 'Handle complex array construction scenarios' : 'Manejar escenarios complejos de construcción de arrays',
    state.language === 'en' ? 'Implement NUMA-aware memory allocation' : 'Implementar asignación de memoria consciente de NUMA'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Advanced Placement New" : "Placement New Avanzado"}
      subtitle={state.language === 'en' 
        ? "Master advanced placement new techniques for high-performance applications" 
        : "Domina técnicas avanzadas de placement new para aplicaciones de alto rendimiento"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🚀 Advanced Placement New Techniques' : '🚀 Técnicas Avanzadas de Placement New'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'Advanced placement new techniques enable exception-safe construction, custom allocator integration, and high-performance memory management patterns essential for production systems.'
            : 'Las técnicas avanzadas de placement new permiten construcción segura ante excepciones, integración con allocators personalizados y patrones de gestión de memoria de alto rendimiento esenciales para sistemas de producción.'}
        </p>

        <div style={{ height: '500px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <AdvancedPlacementVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive Advanced Demo' : '🧪 Demo Avanzado Interactivo'}
        </SectionTitle>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {lessonState.demonstrationType === 'exception_safety' && (
            <>
              <Button onClick={simulateException}>
                {state.language === 'en' ? 'Simulate Exception' : 'Simular Excepción'}
              </Button>
              <Button onClick={performCleanup}>
                {state.language === 'en' ? 'Perform Cleanup' : 'Realizar Limpieza'}
              </Button>
            </>
          )}
          
          {lessonState.demonstrationType === 'array_management' && (
            <>
              <Button onClick={simulateArrayConstruction}>
                {state.language === 'en' ? 'Construct Element' : 'Construir Elemento'}
              </Button>
              <Button onClick={simulateArrayDestruction}>
                {state.language === 'en' ? 'Destroy Element' : 'Destruir Elemento'}
              </Button>
            </>
          )}
          
          {lessonState.demonstrationType === 'performance' && (
            <Button onClick={runPerformanceTest}>
              {state.language === 'en' ? 'Run Performance Test' : 'Ejecutar Test de Rendimiento'}
            </Button>
          )}
          
          <Button onClick={nextScenario}>
            {state.language === 'en' ? 'Next Scenario' : 'Siguiente Escenario'} ({lessonState.currentScenario + 1}/{scenarios.length})
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div>
            <h4>{scenarios[lessonState.currentScenario].title}</h4>
            <p>{scenarios[lessonState.currentScenario].explanation}</p>
            
            <CodeBlock
              language="cpp"
              showLineNumbers={true}
            >
              {scenarios[lessonState.currentScenario].code}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Advanced Concepts' : 'Conceptos Avanzados'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Exception-safe RAII patterns' : 'Patrones RAII seguros ante excepciones'}</li>
              <li>{state.language === 'en' ? 'Custom allocator integration' : 'Integración de allocators personalizados'}</li>
              <li>{state.language === 'en' ? 'Cache-friendly memory layouts' : 'Diseños de memoria amigables al caché'}</li>
              <li>{state.language === 'en' ? 'NUMA-aware allocation' : 'Asignación consciente de NUMA'}</li>
              <li>{state.language === 'en' ? 'Performance measurement' : 'Medición de rendimiento'}</li>
            </ul>

            <h4 style={{ marginTop: '20px' }}>{state.language === 'en' ? 'Current Focus' : 'Enfoque Actual'}</h4>
            <p>
              {lessonState.demonstrationType === 'exception_safety' && (state.language === 'en' ? 'Exception-safe construction patterns' : 'Patrones de construcción seguros ante excepciones')}
              {lessonState.demonstrationType === 'array_management' && (state.language === 'en' ? 'Advanced array lifecycle management' : 'Gestión avanzada del ciclo de vida de arrays')}
              {lessonState.demonstrationType === 'custom_allocator' && (state.language === 'en' ? 'Custom allocator integration' : 'Integración de allocators personalizados')}
              {lessonState.demonstrationType === 'performance' && (state.language === 'en' ? 'Performance optimization techniques' : 'Técnicas de optimización de rendimiento')}
            </p>
          </div>
        </div>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '⚡ Performance Best Practices' : '⚡ Mejores Prácticas de Rendimiento'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '15px', background: 'rgba(46, 213, 115, 0.1)', border: '1px solid #2ed573', borderRadius: '8px' }}>
            <h4 style={{ color: '#2ed573' }}>{state.language === 'en' ? '🚀 Cache Optimization' : '🚀 Optimización de Caché'}</h4>
            <CodeBlock language="cpp">
{`// Align to cache line boundaries
constexpr size_t CACHE_LINE = 64;
struct alignas(CACHE_LINE) CacheAligned {
    // Data fits in single cache line
    std::array<int, 15> data;
};

// Pre-fetch friendly allocation
template<typename T>
void* allocate_prefetch_friendly(size_t count) {
    void* ptr = std::aligned_alloc(CACHE_LINE, 
                                  count * sizeof(T));
    
    // Pre-fault pages
    char* mem = static_cast<char*>(ptr);
    for (size_t i = 0; i < count * sizeof(T); 
         i += 4096) {
        mem[i] = 0;
    }
    
    return ptr;
}`}
            </CodeBlock>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid #00d4ff', borderRadius: '8px' }}>
            <h4 style={{ color: '#00d4ff' }}>{state.language === 'en' ? '🧠 Memory Pool Optimization' : '🧠 Optimización de Pool de Memoria'}</h4>
            <CodeBlock language="cpp">
{`// Segregated free lists by size
template<size_t Size>
class SizeSpecificPool {
    static constexpr size_t BLOCK_SIZE = 
        std::max(Size, sizeof(void*));
    
    union Block {
        alignas(std::max_align_t) 
        char data[BLOCK_SIZE];
        Block* next;
    };
    
    Block* free_list = nullptr;
    
public:
    void* allocate() {
        if (!free_list) {
            allocate_new_chunk();
        }
        
        Block* result = free_list;
        free_list = free_list->next;
        return result;
    }
};`}
            </CodeBlock>
          </div>
        </div>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Advanced placement new lesson. Current demonstration: ${lessonState.demonstrationType}`}
      />
    </LessonLayout>
  );
};

export default Lesson65_AdvancedPlacementNew;