/**
 * Lesson 107: Advanced Performance Profiling for Pointer-Heavy C++ Applications
 * Expert-level profiling methodologies, CPU/memory profilers, and production debugging tools
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, BufferGeometry, BufferAttribute, MeshBasicMaterial, MeshStandardMaterial, Group, Color } from 'three';
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
  theme,
  type LessonProgress
} from '../design-system';
import { useApp } from '../context/AppContext';

interface PerformanceProfilingState {
  language: 'en' | 'es';
  profilerTool: 'perf' | 'vtune' | 'valgrind' | 'gperftools' | 'custom' | 'production';
  profilingPhase: 'setup' | 'sampling' | 'analysis' | 'optimization' | 'validation';
  isAnimating: boolean;
  cpuUtilization: number;
  memoryFootprint: number;
  cacheHitRatio: number;
  branchMisprediction: number;
  instructionThroughput: number;
  overhead: number;
  hotspots: Array<{
    function: string;
    percentage: number;
    instructions: number;
    cacheActivity: number;
  }>;
  memoryProfile: {
    allocations: number;
    deallocations: number;
    leaks: number;
    fragmentation: number;
    heapSize: number;
  };
}

// 3D Visualization of Performance Profiling and System Analysis
const PerformanceProfilingVisualization: React.FC<{ 
  profilerTool: string; 
  phase: string;
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ profilerTool, phase, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);
  const profilingProbes = useRef<{id: number, type: string, active: boolean, data: number, overhead: number}[]>([]);
  const systemComponents = useRef<{id: number, name: string, utilization: number, hotspot: boolean}[]>([]);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    // Simulate profiling data collection
    const cpuLoad = 0.3 + 0.4 * Math.sin(animationRef.current * 2);
    const memoryPressure = 0.2 + 0.3 * Math.sin(animationRef.current * 1.5 + 1);
    const cacheEfficiency = 0.85 + 0.1 * Math.sin(animationRef.current + 0.5);
    const branchPredictionAccuracy = 0.92 + 0.05 * Math.sin(animationRef.current * 0.8);

    // Update profiling probes
    profilingProbes.current = profilingProbes.current.map(probe => ({
      ...probe,
      data: probe.data * 0.95 + Math.random() * 0.05,
      overhead: getProfilerOverhead(profilerTool, probe.type)
    }));

    // Update system components
    systemComponents.current = systemComponents.current.map(comp => ({
      ...comp,
      utilization: comp.utilization * 0.98 + Math.random() * 0.02,
      hotspot: comp.utilization > 0.7
    }));

    onMetrics({
      cpuUtilization: cpuLoad * 100,
      memoryPressure: memoryPressure * 100,
      cacheHitRatio: cacheEfficiency * 100,
      branchAccuracy: branchPredictionAccuracy * 100,
      profilingOverhead: getProfilerOverhead(profilerTool, 'overall')
    });

    // Animate group rotation based on profiling activity
    if (groupRef.current) {
      groupRef.current.rotation.y = animationRef.current * 0.1;
      groupRef.current.position.y = Math.sin(animationRef.current) * 0.1;
    }
  });

  const getProfilerOverhead = (tool: string, component: string): number => {
    const overheads = {
      'perf': { overall: 1.5, sampling: 0.8, tracing: 3.2 },
      'vtune': { overall: 2.1, sampling: 1.2, tracing: 4.8 },
      'valgrind': { overall: 15.5, sampling: 12.0, tracing: 25.0 },
      'gperftools': { overall: 3.2, sampling: 2.1, tracing: 5.5 },
      'custom': { overall: 0.8, sampling: 0.4, tracing: 1.5 },
      'production': { overall: 0.3, sampling: 0.1, tracing: 0.8 }
    };
    return overheads[tool]?.[component] || 2.0;
  };

  const getProfilerColor = (tool: string): string => {
    const colors = {
      'perf': '#00ff88',
      'vtune': '#0099ff',
      'valgrind': '#ff6b6b',
      'gperftools': '#ffa500',
      'custom': '#9b59b6',
      'production': '#2ecc71'
    };
    return colors[tool] || '#ffffff';
  };

  const getPhaseVisualization = (phase: string) => {
    switch (phase) {
      case 'setup':
        return { scale: [1, 1, 1], opacity: 0.6, wireframe: false };
      case 'sampling':
        return { scale: [1.2, 1.2, 1.2], opacity: 0.8, wireframe: false };
      case 'analysis':
        return { scale: [1, 1.5, 1], opacity: 0.9, wireframe: true };
      case 'optimization':
        return { scale: [1.3, 1, 1.3], opacity: 1.0, wireframe: false };
      case 'validation':
        return { scale: [1, 1, 1], opacity: 0.7, wireframe: true };
      default:
        return { scale: [1, 1, 1], opacity: 0.6, wireframe: false };
    }
  };

  const visualization = getPhaseVisualization(phase);

  return (
    <group ref={groupRef}>
      {/* Central profiler core */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color={getProfilerColor(profilerTool)}
          opacity={visualization.opacity}
          transparent
          wireframe={visualization.wireframe}
        />
      </mesh>

      {/* CPU profiling sensors */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`cpu-${i}`} position={[
          Math.cos(i * Math.PI / 2) * 2.5,
          Math.sin(i * Math.PI / 2) * 0.5,
          Math.sin(i * Math.PI / 2) * 2.5
        ]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial
            color="#ff4757"
            opacity={0.7 + Math.sin(animationRef.current + i) * 0.3}
            transparent
          />
        </mesh>
      ))}

      {/* Memory profiling nodes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={`memory-${i}`} position={[
          Math.cos(i * Math.PI / 3) * 3.2,
          0,
          Math.sin(i * Math.PI / 3) * 3.2
        ]}>
          <cylinderGeometry args={[0.2, 0.2, 0.8]} />
          <meshStandardMaterial
            color="#00d4ff"
            opacity={0.6 + Math.sin(animationRef.current * 1.5 + i) * 0.4}
            transparent
          />
        </mesh>
      ))}

      {/* Cache analysis spheres */}
      {[0, 1, 2].map((level) => (
        <mesh key={`cache-${level}`} position={[0, level * 0.8 - 1, 0]}>
          <sphereGeometry args={[0.4 + level * 0.1, 16, 16]} />
          <meshStandardMaterial
            color={level === 0 ? '#2ed573' : level === 1 ? '#ffa500' : '#9b59b6'}
            opacity={0.4}
            transparent
          />
        </mesh>
      ))}

      {/* Branch prediction visualization */}
      <group position={[4, 0, 0]}>
        <mesh>
          <coneGeometry args={[0.3, 1]} />
          <meshStandardMaterial
            color="#ff9ff3"
            opacity={0.7}
            transparent
          />
        </mesh>
      </group>

      {/* Performance overhead indicator */}
      <group position={[-4, 2, 0]}>
        <mesh scale={[1, getProfilerOverhead(profilerTool, 'overall') / 10, 1]}>
          <boxGeometry args={[0.4, 1, 0.4]} />
          <meshStandardMaterial
            color={getProfilerOverhead(profilerTool, 'overall') > 5 ? '#ff4757' : '#2ed573'}
            opacity={0.8}
            transparent
          />
        </mesh>
      </group>

      {/* Data flow connections */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={8}
            array={new Float32Array([
              0, 0, 0, 2.5, 0.5, 2.5,
              3.2, 0, 3.2, 0, 0.8, 0,
              0, 1.6, 0, -3.2, 0, 3.2,
              -2.5, 0.5, 2.5, 0, 0, 0
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" opacity={0.4} transparent />
      </lineLoop>

      {/* Profiling phase indicator */}
      <group position={[0, 3, 0]}>
        <mesh scale={visualization.scale}>
          <ringGeometry args={[0.8, 1.2, 8]} />
          <meshBasicMaterial
            color={getProfilerColor(profilerTool)}
            opacity={0.5}
            transparent
            side={2}
          />
        </mesh>
      </group>
    </group>
  );
};

const Lesson107_PerformanceProfiling: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<PerformanceProfilingState>({
    language: state.language,
    profilerTool: 'perf',
    profilingPhase: 'setup',
    isAnimating: false,
    cpuUtilization: 45.2,
    memoryFootprint: 128.5,
    cacheHitRatio: 89.3,
    branchMisprediction: 3.2,
    instructionThroughput: 2.8,
    overhead: 1.5,
    hotspots: [
      { function: 'processPointers', percentage: 32.4, instructions: 1250000, cacheActivity: 78.2 },
      { function: 'allocateMemory', percentage: 24.1, instructions: 890000, cacheActivity: 45.7 },
      { function: 'traverseList', percentage: 18.7, instructions: 670000, cacheActivity: 92.1 }
    ],
    memoryProfile: {
      allocations: 45623,
      deallocations: 45619,
      leaks: 4,
      fragmentation: 12.3,
      heapSize: 256.7
    }
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 12,
    completedSteps: [],
    score: 0
  });

  const handleProfilerChange = useCallback((tool: PerformanceProfilingState['profilerTool']) => {
    setLessonState(prev => ({
      ...prev,
      profilerTool: tool,
      overhead: {
        'perf': 1.5,
        'vtune': 2.1,
        'valgrind': 15.5,
        'gperftools': 3.2,
        'custom': 0.8,
        'production': 0.3
      }[tool]
    }));
    
    setProgress(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps),
      completedSteps: [...prev.completedSteps, prev.currentStep],
      score: prev.score + 10
    }));
  }, []);

  const handlePhaseChange = useCallback((phase: PerformanceProfilingState['profilingPhase']) => {
    setLessonState(prev => ({ ...prev, profilingPhase: phase }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setLessonState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  const handleMetricsUpdate = useCallback((metrics: any) => {
    setLessonState(prev => ({
      ...prev,
      cpuUtilization: metrics.cpuUtilization || prev.cpuUtilization,
      cacheHitRatio: metrics.cacheHitRatio || prev.cacheHitRatio,
      branchMisprediction: 100 - (metrics.branchAccuracy || 97),
      overhead: metrics.profilingOverhead || prev.overhead
    }));
  }, []);

  const codeExamples = {
    perfProfiling: `// Advanced CPU profiling with perf
// Compile with debug symbols and optimization
// g++ -O2 -g -fno-omit-frame-pointer main.cpp

#include <iostream>
#include <vector>
#include <chrono>
#include <memory>

class PointerIntensiveWorkload {
private:
    std::vector<std::unique_ptr<int[]>> data_chunks;
    size_t chunk_size;
    size_t num_chunks;

public:
    PointerIntensiveWorkload(size_t chunks, size_t size) 
        : chunk_size(size), num_chunks(chunks) {
        // Allocate multiple chunks for pointer traversal
        for (size_t i = 0; i < num_chunks; ++i) {
            data_chunks.emplace_back(std::make_unique<int[]>(chunk_size));
            
            // Initialize with pointer-chasing pattern
            for (size_t j = 0; j < chunk_size; ++j) {
                data_chunks[i][j] = (j + 1) % chunk_size;
            }
        }
    }

    // Hot function for profiling - pointer-intensive operations
    __attribute__((noinline))
    long processPointers() {
        long sum = 0;
        
        // Profile this loop - cache behavior critical
        for (auto& chunk : data_chunks) {
            int* current = chunk.get();
            
            // Pointer chasing pattern - bad for cache
            for (size_t i = 0; i < chunk_size; ++i) {
                sum += current[current[i]]; // Indirect access
            }
        }
        
        return sum;
    }

    // Memory allocation pattern for profiling
    __attribute__((noinline))
    void allocateMemory() {
        std::vector<int*> ptrs;
        
        // Fragmentation-inducing allocation pattern
        for (int i = 0; i < 1000; ++i) {
            ptrs.push_back(new int[i + 1]);
        }
        
        // Random deallocation pattern
        for (size_t i = 0; i < ptrs.size(); i += 2) {
            delete[] ptrs[i];
        }
        
        for (size_t i = 1; i < ptrs.size(); i += 2) {
            delete[] ptrs[i];
        }
    }
};

// Profiling commands:
// perf record -g --call-graph dwarf ./program
// perf report --stdio
// perf stat -e cache-misses,cache-references,branch-misses ./program`,

    vtuneProfiling: `// Intel VTune profiling setup for pointer analysis
#include <ittnotify.h>  // Intel ITT API

class VTuneInstrumentedPointerAnalysis {
private:
    __itt_domain* domain;
    __itt_string_handle* task_begin;
    __itt_string_handle* task_end;

public:
    VTuneInstrumentedPointerAnalysis() {
        // Initialize VTune instrumentation
        domain = __itt_domain_create("PointerAnalysis");
        task_begin = __itt_string_handle_create("PointerTraversal");
        task_end = __itt_string_handle_create("AllocationHotspot");
    }

    void runAnalysis() {
        // Mark regions of interest for VTune
        __itt_task_begin(domain, __itt_null, __itt_null, task_begin);
        
        performPointerTraversal();
        
        __itt_task_end(domain);
        
        // Different analysis region
        __itt_task_begin(domain, __itt_null, __itt_null, task_end);
        
        performAllocationPattern();
        
        __itt_task_end(domain);
    }

private:
    __attribute__((noinline))
    void performPointerTraversal() {
        // Cache-unfriendly pointer traversal
        const size_t size = 1024 * 1024;
        int* data = new int[size];
        
        // Initialize with random pattern
        for (size_t i = 0; i < size; ++i) {
            data[i] = rand() % size;
        }
        
        // Traverse following pointers - terrible cache locality
        int current = 0;
        for (int i = 0; i < 100000; ++i) {
            current = data[current];
        }
        
        delete[] data;
    }
    
    __attribute__((noinline))
    void performAllocationPattern() {
        // Memory allocation pattern analysis
        std::vector<void*> allocations;
        
        for (int i = 0; i < 10000; ++i) {
            size_t size = 16 + (i % 1024);
            allocations.push_back(malloc(size));
        }
        
        // Free in reverse order
        for (auto it = allocations.rbegin(); it != allocations.rend(); ++it) {
            free(*it);
        }
    }
};

// VTune command line:
// vtune -collect hotspots -app-working-dir . -- ./program
// vtune -collect memory-access -- ./program
// vtune -collect threading -- ./program`,

    valgrindMemcheck: `// Valgrind Memcheck for memory error detection
#include <iostream>
#include <memory>
#include <valgrind/memcheck.h>

class MemoryProfilingExample {
public:
    // Deliberate memory issues for Valgrind analysis
    void demonstrateMemoryIssues() {
        // 1. Memory leak detection
        int* leaked = new int[1000];
        // Intentionally not deleted for demonstration
        
        // 2. Use after free
        int* ptr = new int(42);
        delete ptr;
        // VALGRIND_CHECK_MEM_IS_ADDRESSABLE(ptr, sizeof(int));
        // std::cout << *ptr << std::endl; // Commented out - would trigger error
        
        // 3. Buffer overflow
        int* buffer = new int[10];
        // buffer[10] = 42; // Commented out - would trigger error
        delete[] buffer;
        
        // 4. Double free
        int* double_free_ptr = new int(100);
        delete double_free_ptr;
        // delete double_free_ptr; // Commented out - would trigger error
        
        // 5. Uninitialized memory access
        int* uninit = new int[100];
        // Don't initialize
        // VALGRIND_CHECK_MEM_IS_DEFINED(uninit, 100 * sizeof(int));
        delete[] uninit;
    }
    
    // Memory allocation tracking
    void trackAllocations() {
        VALGRIND_MALLOCLIKE_BLOCK(this, sizeof(*this), 0, 0);
        
        // Perform operations
        performOperations();
        
        VALGRIND_FREELIKE_BLOCK(this, 0);
    }
    
private:
    void performOperations() {
        // Custom allocator simulation
        void* custom_alloc = malloc(1024);
        VALGRIND_MALLOCLIKE_BLOCK(custom_alloc, 1024, 0, 0);
        
        // Use memory
        memset(custom_alloc, 0x42, 1024);
        
        VALGRIND_FREELIKE_BLOCK(custom_alloc, 0);
        free(custom_alloc);
    }
};

// Valgrind commands:
// valgrind --tool=memcheck --leak-check=full --track-origins=yes ./program
// valgrind --tool=cachegrind ./program
// valgrind --tool=callgrind ./program
// valgrind --tool=massif --stacks=yes ./program`,

    gperftoolsProfiling: `// Google Performance Tools (gperftools) integration
#include <gperftools/profiler.h>
#include <gperftools/heap-profiler.h>
#include <gperftools/malloc_extension.h>

class GPerftoolsExample {
public:
    void runProfilingSession() {
        // Start CPU profiling
        ProfilerStart("cpu_profile.prof");
        
        // Start heap profiling
        HeapProfilerStart("heap_profile");
        
        // Perform workload
        performCPUIntensiveWork();
        performMemoryIntensiveWork();
        
        // Stop profiling
        ProfilerStop();
        HeapProfilerStop();
        
        // Print memory statistics
        printMemoryStats();
    }
    
private:
    __attribute__((noinline))
    void performCPUIntensiveWork() {
        const size_t iterations = 10000000;
        volatile long sum = 0;
        
        for (size_t i = 0; i < iterations; ++i) {
            sum += i * i;
        }
    }
    
    __attribute__((noinline))
    void performMemoryIntensiveWork() {
        std::vector<int*> allocations;
        
        // Allocate in various sizes
        for (int i = 1; i <= 1000; ++i) {
            int* ptr = new int[i * 10];
            allocations.push_back(ptr);
            
            // Fill with data
            for (int j = 0; j < i * 10; ++j) {
                ptr[j] = j;
            }
        }
        
        // Take heap profile snapshot
        HeapProfilerDump("mid_execution");
        
        // Free some allocations
        for (size_t i = 0; i < allocations.size(); i += 2) {
            delete[] allocations[i];
        }
        
        // Clear remaining
        for (size_t i = 1; i < allocations.size(); i += 2) {
            delete[] allocations[i];
        }
    }
    
    void printMemoryStats() {
        size_t heap_size, allocated_bytes, unmapped_bytes;
        
        MallocExtension::instance()->GetNumericProperty(
            "generic.heap_size", &heap_size);
        MallocExtension::instance()->GetNumericProperty(
            "generic.current_allocated_bytes", &allocated_bytes);
        MallocExtension::instance()->GetNumericProperty(
            "generic.unmapped_bytes", &unmapped_bytes);
            
        std::cout << "Heap size: " << heap_size << std::endl;
        std::cout << "Allocated: " << allocated_bytes << std::endl;
        std::cout << "Unmapped: " << unmapped_bytes << std::endl;
    }
};

// Usage:
// Compile with: g++ -O2 -g -lprofiler -ltcmalloc program.cpp
// Analysis: pprof --text ./program cpu_profile.prof
// Heap analysis: pprof --text ./program heap_profile.*.heap`,

    customProfiling: `// Custom lightweight profiling infrastructure
#include <chrono>
#include <unordered_map>
#include <thread>
#include <atomic>
#include <iostream>

class CustomProfiler {
private:
    struct ProfileData {
        std::atomic<uint64_t> call_count{0};
        std::atomic<uint64_t> total_time_ns{0};
        std::atomic<uint64_t> max_time_ns{0};
        std::atomic<uint64_t> min_time_ns{UINT64_MAX};
    };
    
    std::unordered_map<std::string, ProfileData> profile_data;
    thread_local static std::chrono::high_resolution_clock::time_point start_time;
    
public:
    static CustomProfiler& getInstance() {
        static CustomProfiler instance;
        return instance;
    }
    
    class ScopedTimer {
    private:
        std::string function_name;
        std::chrono::high_resolution_clock::time_point start;
        
    public:
        ScopedTimer(const std::string& name) 
            : function_name(name), start(std::chrono::high_resolution_clock::now()) {}
        
        ~ScopedTimer() {
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
            
            CustomProfiler::getInstance().recordTiming(function_name, duration.count());
        }
    };
    
    void recordTiming(const std::string& function, uint64_t time_ns) {
        ProfileData& data = profile_data[function];
        
        data.call_count.fetch_add(1, std::memory_order_relaxed);
        data.total_time_ns.fetch_add(time_ns, std::memory_order_relaxed);
        
        // Update max
        uint64_t current_max = data.max_time_ns.load(std::memory_order_relaxed);
        while (time_ns > current_max && 
               !data.max_time_ns.compare_exchange_weak(current_max, time_ns, std::memory_order_relaxed)) {}
        
        // Update min
        uint64_t current_min = data.min_time_ns.load(std::memory_order_relaxed);
        while (time_ns < current_min && 
               !data.min_time_ns.compare_exchange_weak(current_min, time_ns, std::memory_order_relaxed)) {}
    }
    
    void generateReport() {
        std::cout << "\\n=== Custom Profiler Report ===\\n";
        std::cout << "Function                 | Calls    | Total(ms) | Avg(μs) | Min(μs) | Max(μs)\\n";
        std::cout << "-------------------------|----------|-----------|---------|---------|--------\\n";
        
        for (const auto& [name, data] : profile_data) {
            uint64_t calls = data.call_count.load();
            uint64_t total_ns = data.total_time_ns.load();
            uint64_t min_ns = data.min_time_ns.load();
            uint64_t max_ns = data.max_time_ns.load();
            
            double total_ms = total_ns / 1e6;
            double avg_us = (total_ns / static_cast<double>(calls)) / 1e3;
            double min_us = min_ns / 1e3;
            double max_us = max_ns / 1e3;
            
            printf("%-25s| %-9lu| %-10.3f| %-8.2f| %-8.2f| %-7.2f\\n",
                   name.c_str(), calls, total_ms, avg_us, min_us, max_us);
        }
    }
};

#define PROFILE_FUNCTION() CustomProfiler::ScopedTimer timer(__FUNCTION__)

// Example usage in pointer-heavy functions
class ProfiledPointerOperations {
public:
    __attribute__((noinline))
    void processPointerArray() {
        PROFILE_FUNCTION();
        
        const size_t size = 100000;
        int** ptr_array = new int*[size];
        
        // Allocate individual elements
        for (size_t i = 0; i < size; ++i) {
            ptr_array[i] = new int(static_cast<int>(i));
        }
        
        // Process - pointer indirection heavy
        long sum = 0;
        for (size_t i = 0; i < size; ++i) {
            sum += *ptr_array[i];
        }
        
        // Cleanup
        for (size_t i = 0; i < size; ++i) {
            delete ptr_array[i];
        }
        delete[] ptr_array;
    }
    
    __attribute__((noinline))
    void linkedListTraversal() {
        PROFILE_FUNCTION();
        
        struct Node {
            int data;
            Node* next;
            Node(int d) : data(d), next(nullptr) {}
        };
        
        // Create linked list
        Node* head = new Node(0);
        Node* current = head;
        
        for (int i = 1; i < 50000; ++i) {
            current->next = new Node(i);
            current = current->next;
        }
        
        // Traverse - cache unfriendly
        long sum = 0;
        current = head;
        while (current) {
            sum += current->data;
            current = current->next;
        }
        
        // Cleanup
        current = head;
        while (current) {
            Node* temp = current;
            current = current->next;
            delete temp;
        }
    }
};`,

    productionProfiling: `// Production-safe profiling with minimal overhead
#include <iostream>
#include <atomic>
#include <random>
#include <thread>

class ProductionProfiler {
private:
    // Sampling-based profiler to minimize overhead
    static constexpr double SAMPLING_RATE = 0.001; // 0.1% sampling
    std::atomic<bool> profiling_enabled{false};
    std::atomic<uint64_t> sample_counter{0};
    thread_local static std::random_device rd;
    thread_local static std::mt19937 gen;
    thread_local static std::uniform_real_distribution<double> dis;
    
    struct LightweightSample {
        uint64_t timestamp;
        uint32_t function_hash;
        uint16_t duration_us;
        uint8_t cpu_id;
        uint8_t flags;
    };
    
    // Ring buffer for samples
    static constexpr size_t BUFFER_SIZE = 8192;
    LightweightSample sample_buffer[BUFFER_SIZE];
    std::atomic<size_t> buffer_head{0};
    
public:
    class LightweightTimer {
    private:
        uint64_t start_tsc;
        uint32_t function_hash;
        bool should_sample;
        
        // Use RDTSC for minimal overhead timing
        static inline uint64_t rdtsc() {
            uint32_t hi, lo;
            __asm__ volatile ("rdtsc" : "=a"(lo), "=d"(hi));
            return ((uint64_t)hi << 32) | lo;
        }
        
    public:
        LightweightTimer(uint32_t hash) : function_hash(hash) {
            // Fast sampling decision
            should_sample = ProductionProfiler::getInstance().shouldSample();
            if (should_sample) {
                start_tsc = rdtsc();
            }
        }
        
        ~LightweightTimer() {
            if (should_sample) {
                uint64_t end_tsc = rdtsc();
                uint64_t cycles = end_tsc - start_tsc;
                
                // Convert cycles to microseconds (approximate)
                uint16_t duration_us = static_cast<uint16_t>(cycles / 3000); // Assume 3GHz
                
                ProductionProfiler::getInstance().recordSample(function_hash, duration_us);
            }
        }
    };
    
    static ProductionProfiler& getInstance() {
        static ProductionProfiler instance;
        return instance;
    }
    
    bool shouldSample() {
        if (!profiling_enabled.load(std::memory_order_relaxed)) {
            return false;
        }
        
        // Fast sampling decision using thread-local random number generator
        return dis(gen) < SAMPLING_RATE;
    }
    
    void recordSample(uint32_t function_hash, uint16_t duration_us) {
        size_t index = buffer_head.fetch_add(1, std::memory_order_relaxed) % BUFFER_SIZE;
        
        sample_buffer[index] = {
            .timestamp = std::chrono::high_resolution_clock::now().time_since_epoch().count(),
            .function_hash = function_hash,
            .duration_us = duration_us,
            .cpu_id = static_cast<uint8_t>(sched_getcpu()),
            .flags = 0
        };
        
        sample_counter.fetch_add(1, std::memory_order_relaxed);
    }
    
    void enableProfiling() { profiling_enabled.store(true, std::memory_order_release); }
    void disableProfiling() { profiling_enabled.store(false, std::memory_order_release); }
    
    void dumpSamples() {
        std::cout << "Production profiler samples: " << sample_counter.load() << std::endl;
        
        // Analyze hotspots from samples
        std::unordered_map<uint32_t, uint64_t> hotspots;
        size_t samples_analyzed = std::min(static_cast<size_t>(sample_counter.load()), BUFFER_SIZE);
        
        for (size_t i = 0; i < samples_analyzed; ++i) {
            hotspots[sample_buffer[i].function_hash] += sample_buffer[i].duration_us;
        }
        
        // Sort and display top hotspots
        std::vector<std::pair<uint32_t, uint64_t>> sorted_hotspots(hotspots.begin(), hotspots.end());
        std::sort(sorted_hotspots.begin(), sorted_hotspots.end(), 
                  [](const auto& a, const auto& b) { return a.second > b.second; });
        
        std::cout << "Top hotspots:\\n";
        for (size_t i = 0; i < std::min(sorted_hotspots.size(), size_t(10)); ++i) {
            std::cout << "Hash: " << std::hex << sorted_hotspots[i].first 
                      << ", Total time: " << std::dec << sorted_hotspots[i].second << "μs\\n";
        }
    }
};

// Compile-time function name hashing for minimal runtime overhead
constexpr uint32_t hash_function_name(const char* name) {
    uint32_t hash = 0x811c9dc5;
    while (*name) {
        hash ^= static_cast<uint32_t>(*name++);
        hash *= 0x01000193;
    }
    return hash;
}

#define PRODUCTION_PROFILE() \\
    ProductionProfiler::LightweightTimer timer(hash_function_name(__FUNCTION__))

// Example usage
class ProductionPointerWorkload {
public:
    void run() {
        ProductionProfiler::getInstance().enableProfiling();
        
        for (int i = 0; i < 1000000; ++i) {
            processData();
            if (i % 100000 == 0) {
                allocateMemory();
            }
        }
        
        ProductionProfiler::getInstance().disableProfiling();
        ProductionProfiler::getInstance().dumpSamples();
    }
    
private:
    __attribute__((noinline))
    void processData() {
        PRODUCTION_PROFILE();
        
        // Simulate some pointer-heavy work
        volatile int* ptr = new int(42);
        volatile int value = *ptr;
        delete ptr;
    }
    
    __attribute__((noinline))
    void allocateMemory() {
        PRODUCTION_PROFILE();
        
        // Simulate memory allocation pattern
        std::vector<int*> ptrs;
        for (int i = 0; i < 100; ++i) {
            ptrs.push_back(new int(i));
        }
        
        for (int* ptr : ptrs) {
            delete ptr;
        }
    }
};

// Thread-local storage initialization
thread_local std::random_device ProductionProfiler::rd;
thread_local std::mt19937 ProductionProfiler::gen(ProductionProfiler::rd());
thread_local std::uniform_real_distribution<double> ProductionProfiler::dis(0.0, 1.0);

// Signal handler for production profiling control
#include <signal.h>

void sigusr1_handler(int sig) {
    static bool profiling_active = false;
    profiling_active = !profiling_active;
    
    if (profiling_active) {
        ProductionProfiler::getInstance().enableProfiling();
        std::cout << "Production profiling enabled\\n";
    } else {
        ProductionProfiler::getInstance().disableProfiling();
        ProductionProfiler::getInstance().dumpSamples();
        std::cout << "Production profiling disabled\\n";
    }
}

// Enable runtime profiling control: kill -USR1 <pid>`
  };

  const learningObjectives = lessonState.language === 'en' ? [
    'Master CPU profiling with perf, Intel VTune, and advanced profilers',
    'Implement comprehensive memory profiling and allocation tracking',
    'Analyze cache performance and optimize memory access patterns',
    'Understand branch prediction analysis and pipeline optimization',
    'Build custom profiling infrastructure with minimal overhead',
    'Deploy production-safe profiling for live systems'
  ] : [
    'Dominar el perfilado de CPU con perf, Intel VTune y perfiladores avanzados',
    'Implementar perfilado integral de memoria y seguimiento de asignaciones',
    'Analizar rendimiento de caché y optimizar patrones de acceso a memoria',
    'Entender análisis de predicción de ramas y optimización de pipeline',
    'Construir infraestructura de perfilado personalizada con sobrecarga mínima',
    'Desplegar perfilado seguro para producción en sistemas en vivo'
  ];

  const profilerDescriptions = {
    'perf': {
      en: 'Linux perf - Hardware performance counter-based profiling with statistical sampling',
      es: 'Linux perf - Perfilado basado en contadores de rendimiento de hardware con muestreo estadístico'
    },
    'vtune': {
      en: 'Intel VTune - Advanced microarchitecture analysis with CPU-specific optimizations',
      es: 'Intel VTune - Análisis avanzado de microarquitectura con optimizaciones específicas de CPU'
    },
    'valgrind': {
      en: 'Valgrind - Dynamic analysis framework for memory debugging and profiling',
      es: 'Valgrind - Marco de análisis dinámico para depuración y perfilado de memoria'
    },
    'gperftools': {
      en: 'Google Performance Tools - CPU and heap profiling with statistical sampling',
      es: 'Google Performance Tools - Perfilado de CPU y heap con muestreo estadístico'
    },
    'custom': {
      en: 'Custom Profiler - Lightweight application-specific profiling infrastructure',
      es: 'Perfilador Personalizado - Infraestructura de perfilado ligera específica de aplicación'
    },
    'production': {
      en: 'Production Profiler - Ultra-low overhead sampling for live system analysis',
      es: 'Perfilador de Producción - Muestreo con sobrecarga ultra baja para análisis de sistemas en vivo'
    }
  };

  return (
    <LessonLayout
      title={lessonState.language === 'en' ? "Advanced Performance Profiling" : "Perfilado Avanzado de Rendimiento"}
      currentLesson={107}
      totalLessons={107}
      progress={progress}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {lessonState.language === 'en' 
            ? "Performance Profiling Visualization" 
            : "Visualización de Perfilado de Rendimiento"}
        </SectionTitle>
        
        <div style={{ 
          height: '400px', 
          background: theme.colors.dark.secondary,
          borderRadius: theme.borders.radius.large,
          marginBottom: theme.spacing.large 
        }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <PerformanceProfilingVisualization
              profilerTool={lessonState.profilerTool}
              phase={lessonState.profilingPhase}
              isAnimating={lessonState.isAnimating}
              onMetrics={handleMetricsUpdate}
            />
          </Canvas>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: theme.spacing.medium,
          marginBottom: theme.spacing.large 
        }}>
          <div style={{ 
            padding: theme.spacing.medium, 
            background: theme.colors.dark.tertiary, 
            borderRadius: theme.borders.radius.medium 
          }}>
            <div style={{ color: theme.colors.primary, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {lessonState.language === 'en' ? 'CPU Utilization' : 'Utilización de CPU'}
            </div>
            <div style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {lessonState.cpuUtilization.toFixed(1)}%
            </div>
          </div>
          
          <div style={{ 
            padding: theme.spacing.medium, 
            background: theme.colors.dark.tertiary, 
            borderRadius: theme.borders.radius.medium 
          }}>
            <div style={{ color: theme.colors.primary, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {lessonState.language === 'en' ? 'Cache Hit Ratio' : 'Ratio de Aciertos de Caché'}
            </div>
            <div style={{ color: '#2ed573', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {lessonState.cacheHitRatio.toFixed(1)}%
            </div>
          </div>
          
          <div style={{ 
            padding: theme.spacing.medium, 
            background: theme.colors.dark.tertiary, 
            borderRadius: theme.borders.radius.medium 
          }}>
            <div style={{ color: theme.colors.primary, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {lessonState.language === 'en' ? 'Branch Misprediction' : 'Predicción de Ramas Errónea'}
            </div>
            <div style={{ color: '#ff4757', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {lessonState.branchMisprediction.toFixed(1)}%
            </div>
          </div>
          
          <div style={{ 
            padding: theme.spacing.medium, 
            background: theme.colors.dark.tertiary, 
            borderRadius: theme.borders.radius.medium 
          }}>
            <div style={{ color: theme.colors.primary, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {lessonState.language === 'en' ? 'Profiling Overhead' : 'Sobrecarga de Perfilado'}
            </div>
            <div style={{ 
              color: lessonState.overhead > 5 ? '#ff4757' : '#2ed573', 
              fontSize: '1.2rem', 
              fontWeight: 'bold' 
            }}>
              {lessonState.overhead.toFixed(1)}%
            </div>
          </div>
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {lessonState.language === 'en' 
            ? "Profiler Tool Selection" 
            : "Selección de Herramienta de Perfilado"}
        </SectionTitle>
        
        <ButtonGroup>
          {(['perf', 'vtune', 'valgrind', 'gperftools', 'custom', 'production'] as const).map((tool) => (
            <Button
              key={tool}
              onClick={() => handleProfilerChange(tool)}
              variant={lessonState.profilerTool === tool ? 'primary' : 'secondary'}
              style={{ minWidth: '140px' }}
            >
              {tool.toUpperCase()}
            </Button>
          ))}
        </ButtonGroup>

        <div style={{ 
          marginTop: theme.spacing.medium, 
          padding: theme.spacing.medium,
          background: theme.colors.dark.tertiary,
          borderRadius: theme.borders.radius.medium 
        }}>
          <strong>
            {lessonState.profilerTool.toUpperCase()}
          </strong>
          : {profilerDescriptions[lessonState.profilerTool][lessonState.language]}
        </div>

        <ButtonGroup style={{ marginTop: theme.spacing.medium }}>
          {(['setup', 'sampling', 'analysis', 'optimization', 'validation'] as const).map((phase) => (
            <Button
              key={phase}
              onClick={() => handlePhaseChange(phase)}
              variant={lessonState.profilingPhase === phase ? 'primary' : 'secondary'}
            >
              {phase.charAt(0).toUpperCase() + phase.slice(1)}
            </Button>
          ))}
        </ButtonGroup>

        <Button
          onClick={toggleAnimation}
          variant="secondary"
          style={{ marginTop: theme.spacing.medium }}
        >
          {lessonState.isAnimating 
            ? (lessonState.language === 'en' ? 'Pause Animation' : 'Pausar Animación')
            : (lessonState.language === 'en' ? 'Start Animation' : 'Iniciar Animación')
          }
        </Button>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {lessonState.language === 'en' 
            ? "CPU Profiling with perf" 
            : "Perfilado de CPU con perf"}
        </SectionTitle>
        <CodeBlock
          code={codeExamples.perfProfiling}
          language="cpp"
          title={lessonState.language === 'en' ? "Advanced CPU Profiling" : "Perfilado Avanzado de CPU"}
        />
      </Section>

      <Section>
        <SectionTitle>
          {lessonState.language === 'en' 
            ? "Intel VTune Integration" 
            : "Integración con Intel VTune"}
        </SectionTitle>
        <CodeBlock
          code={codeExamples.vtuneProfiling}
          language="cpp"
          title={lessonState.language === 'en' ? "VTune Instrumented Analysis" : "Análisis Instrumentado con VTune"}
        />
      </Section>

      <Section>
        <SectionTitle>
          {lessonState.language === 'en' 
            ? "Memory Profiling with Valgrind" 
            : "Perfilado de Memoria con Valgrind"}
        </SectionTitle>
        <CodeBlock
          code={codeExamples.valgrindMemcheck}
          language="cpp"
          title={lessonState.language === 'en' ? "Comprehensive Memory Analysis" : "Análisis Integral de Memoria"}
        />
      </Section>

      <Section>
        <SectionTitle>
          {lessonState.language === 'en' 
            ? "Google Performance Tools" 
            : "Herramientas de Rendimiento de Google"}
        </SectionTitle>
        <CodeBlock
          code={codeExamples.gperftoolsProfiling}
          language="cpp"
          title={lessonState.language === 'en' ? "CPU and Heap Profiling" : "Perfilado de CPU y Heap"}
        />
      </Section>

      <Section>
        <SectionTitle>
          {lessonState.language === 'en' 
            ? "Custom Profiling Infrastructure" 
            : "Infraestructura de Perfilado Personalizada"}
        </SectionTitle>
        <CodeBlock
          code={codeExamples.customProfiling}
          language="cpp"
          title={lessonState.language === 'en' ? "Lightweight Custom Profiler" : "Perfilador Personalizado Ligero"}
        />
      </Section>

      <Section>
        <SectionTitle>
          {lessonState.language === 'en' 
            ? "Production Profiling" 
            : "Perfilado en Producción"}
        </SectionTitle>
        <CodeBlock
          code={codeExamples.productionProfiling}
          language="cpp"
          title={lessonState.language === 'en' ? "Ultra-Low Overhead Production Profiler" : "Perfilador de Producción con Sobrecarga Ultra Baja"}
        />
      </Section>

      <Section>
        <SectionTitle>
          {lessonState.language === 'en' ? "Hotspot Analysis" : "Análisis de Puntos Calientes"}
        </SectionTitle>
        
        <div style={{ 
          background: theme.colors.dark.tertiary, 
          padding: theme.spacing.medium,
          borderRadius: theme.borders.radius.medium,
          marginBottom: theme.spacing.medium 
        }}>
          <h4 style={{ color: theme.colors.primary, marginBottom: theme.spacing.small }}>
            {lessonState.language === 'en' ? 'Top Performance Hotspots' : 'Principales Puntos Calientes de Rendimiento'}
          </h4>
          
          {lessonState.hotspots.map((hotspot, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < lessonState.hotspots.length - 1 ? `1px solid ${theme.colors.dark.secondary}` : 'none'
            }}>
              <div>
                <strong style={{ color: '#ffffff' }}>{hotspot.function}</strong>
                <div style={{ fontSize: '0.85rem', color: theme.colors.textSecondary }}>
                  {hotspot.instructions.toLocaleString()} {lessonState.language === 'en' ? 'instructions' : 'instrucciones'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  color: hotspot.percentage > 25 ? '#ff4757' : hotspot.percentage > 15 ? '#ffa500' : '#2ed573',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  {hotspot.percentage}%
                </div>
                <div style={{ fontSize: '0.85rem', color: theme.colors.textSecondary }}>
                  {lessonState.language === 'en' ? 'Cache:' : 'Caché:'} {hotspot.cacheActivity.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          background: theme.colors.dark.tertiary, 
          padding: theme.spacing.medium,
          borderRadius: theme.borders.radius.medium 
        }}>
          <h4 style={{ color: theme.colors.primary, marginBottom: theme.spacing.small }}>
            {lessonState.language === 'en' ? 'Memory Profile Summary' : 'Resumen del Perfil de Memoria'}
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                {lessonState.language === 'en' ? 'Allocations' : 'Asignaciones'}
              </div>
              <div style={{ color: '#2ed573', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {lessonState.memoryProfile.allocations.toLocaleString()}
              </div>
            </div>
            
            <div>
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                {lessonState.language === 'en' ? 'Deallocations' : 'Liberaciones'}
              </div>
              <div style={{ color: '#00d4ff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {lessonState.memoryProfile.deallocations.toLocaleString()}
              </div>
            </div>
            
            <div>
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                {lessonState.language === 'en' ? 'Memory Leaks' : 'Fugas de Memoria'}
              </div>
              <div style={{ 
                color: lessonState.memoryProfile.leaks > 0 ? '#ff4757' : '#2ed573', 
                fontSize: '1.1rem', 
                fontWeight: 'bold' 
              }}>
                {lessonState.memoryProfile.leaks}
              </div>
            </div>
            
            <div>
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                {lessonState.language === 'en' ? 'Fragmentation' : 'Fragmentación'}
              </div>
              <div style={{ 
                color: lessonState.memoryProfile.fragmentation > 20 ? '#ff4757' : '#ffa500', 
                fontSize: '1.1rem', 
                fontWeight: 'bold' 
              }}>
                {lessonState.memoryProfile.fragmentation.toFixed(1)}%
              </div>
            </div>
            
            <div>
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                {lessonState.language === 'en' ? 'Heap Size' : 'Tamaño del Heap'}
              </div>
              <div style={{ color: '#9b59b6', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {lessonState.memoryProfile.heapSize.toFixed(1)} MB
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {lessonState.language === 'en' 
            ? "Advanced Profiling Techniques Summary" 
            : "Resumen de Técnicas Avanzadas de Perfilado"}
        </SectionTitle>
        
        <div style={{ 
          background: theme.colors.dark.tertiary, 
          padding: theme.spacing.large,
          borderRadius: theme.borders.radius.medium 
        }}>
          <h3 style={{ color: theme.colors.primary, marginBottom: theme.spacing.medium }}>
            {lessonState.language === 'en' ? 'Key Takeaways' : 'Puntos Clave'}
          </h3>
          
          <ul style={{ color: '#ffffff', lineHeight: 1.6 }}>
            <li>
              <strong style={{ color: theme.colors.primary }}>
                {lessonState.language === 'en' ? 'Profiler Selection:' : 'Selección de Perfilador:'}
              </strong>
              {lessonState.language === 'en' 
                ? ' Choose tools based on overhead tolerance and analysis depth requirements'
                : ' Elegir herramientas basándose en la tolerancia de sobrecarga y los requisitos de profundidad de análisis'
              }
            </li>
            <li>
              <strong style={{ color: theme.colors.primary }}>
                {lessonState.language === 'en' ? 'Statistical Sampling:' : 'Muestreo Estadístico:'}
              </strong>
              {lessonState.language === 'en'
                ? ' Use sampling-based profilers for production systems to minimize performance impact'
                : ' Usar perfiladores basados en muestreo para sistemas de producción para minimizar el impacto en el rendimiento'
              }
            </li>
            <li>
              <strong style={{ color: theme.colors.primary }}>
                {lessonState.language === 'en' ? 'Instrumentation Strategy:' : 'Estrategia de Instrumentación:'}
              </strong>
              {lessonState.language === 'en'
                ? ' Balance between detail and overhead - comprehensive for development, minimal for production'
                : ' Balance entre detalle y sobrecarga - completo para desarrollo, mínimo para producción'
              }
            </li>
            <li>
              <strong style={{ color: theme.colors.primary }}>
                {lessonState.language === 'en' ? 'Multi-dimensional Analysis:' : 'Análisis Multidimensional:'}
              </strong>
              {lessonState.language === 'en'
                ? ' Combine CPU, memory, cache, and branch prediction analysis for complete performance picture'
                : ' Combinar análisis de CPU, memoria, caché y predicción de ramas para una imagen completa del rendimiento'
              }
            </li>
            <li>
              <strong style={{ color: theme.colors.primary }}>
                {lessonState.language === 'en' ? 'Production Integration:' : 'Integración en Producción:'}
              </strong>
              {lessonState.language === 'en'
                ? ' Implement runtime-controllable profiling for continuous monitoring without service disruption'
                : ' Implementar perfilado controlable en tiempo de ejecución para monitoreo continuo sin interrupción del servicio'
              }
            </li>
          </ul>
        </div>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Advanced performance profiling lesson. Current profiler: ${lessonState.profilerTool}, Phase: ${lessonState.profilingPhase}`}
      />
    </LessonLayout>
  );
};

export default Lesson107_PerformanceProfiling;