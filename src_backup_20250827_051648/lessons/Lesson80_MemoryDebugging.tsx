/**
 * Lesson 80: Memory Debugging Techniques
 * Advanced memory debugging tools, sanitizers, and corruption detection
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
  AccessibilityAnnouncer
} from '../design-system';

interface MemoryDebuggingState {
  language: 'en' | 'es';
  debuggingTool: 'address_sanitizer' | 'valgrind' | 'custom_guards' | 'heap_corruption' | 'stack_protection';
  isAnimating: boolean;
  corruptionLevel: number;
  detectedErrors: number;
  memoryViolations: number;
  stackOverflows: number;
  heapCorruptions: number;
  doubleFreesDetected: number;
  useAfterFrees: number;
}

// 3D Visualization of Memory Debugging and Corruption Detection
const MemoryDebuggingVisualization: React.FC<{ 
  debuggingTool: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ debuggingTool, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);
  const memoryRegions = useRef<{id: number, corrupted: boolean, protected: boolean, type: string, severity: number}[]>([]);
  const violations = useRef<{type: string, address: number, detected: boolean}[]>([]);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.025;
    
    // Simulate different debugging tool scenarios
    if (debuggingTool === 'address_sanitizer') {
      // AddressSanitizer detection simulation
      const totalRegions = 25;
      const corruptionRate = Math.sin(animationRef.current * 1.5) * 0.1 + 0.15;
      
      memoryRegions.current = Array.from({ length: totalRegions }, (_, i) => ({
        id: i,
        corrupted: Math.random() < corruptionRate,
        protected: true,
        type: ['heap', 'stack', 'global', 'shadow'][Math.floor(Math.random() * 4)],
        severity: Math.floor(Math.random() * 3) + 1
      }));
      
      groupRef.current.rotation.y = animationRef.current * 0.4;
      groupRef.current.position.y = Math.sin(animationRef.current * 2) * 0.2;
      
      const corrupted = memoryRegions.current.filter(r => r.corrupted).length;
      const detected = Math.floor(corrupted * 0.95); // 95% detection rate for ASan
      
      onMetrics({
        detectedErrors: detected,
        memoryViolations: corrupted,
        stackOverflows: Math.floor(Math.random() * 2),
        heapCorruptions: Math.floor(corrupted * 0.6),
        doubleFreesDetected: Math.floor(Math.random() * 3),
        useAfterFrees: Math.floor(corrupted * 0.4),
        corruptionLevel: Math.floor(corruptionRate * 100)
      });
    } else if (debuggingTool === 'valgrind') {
      // Valgrind memcheck simulation
      const memoryBlocks = Math.floor(Math.sin(animationRef.current * 1.2) * 10 + 20);
      const leakRate = Math.sin(animationRef.current * 0.8) * 0.05 + 0.08;
      
      memoryRegions.current = Array.from({ length: memoryBlocks }, (_, i) => ({
        id: i,
        corrupted: Math.random() < leakRate,
        protected: false,
        type: 'heap_block',
        severity: Math.floor(Math.random() * 2) + 1
      }));
      
      groupRef.current.rotation.x = Math.sin(animationRef.current * 0.6) * 0.3;
      groupRef.current.scale.setScalar(0.9 + Math.sin(animationRef.current * 3) * 0.1);
      
      const violations = memoryRegions.current.filter(r => r.corrupted).length;
      
      onMetrics({
        detectedErrors: violations,
        memoryViolations: violations,
        stackOverflows: 0,
        heapCorruptions: Math.floor(violations * 0.7),
        doubleFreesDetected: Math.floor(violations * 0.2),
        useAfterFrees: Math.floor(violations * 0.3),
        corruptionLevel: Math.floor(leakRate * 100)
      });
    } else if (debuggingTool === 'custom_guards') {
      // Custom guard pages and boundary checking
      const guardedRegions = 15;
      const boundaryViolations = Math.sin(animationRef.current * 2) * 0.05 + 0.03;
      
      memoryRegions.current = Array.from({ length: guardedRegions }, (_, i) => ({
        id: i,
        corrupted: Math.random() < boundaryViolations,
        protected: true,
        type: 'guarded_region',
        severity: 3 // High severity for boundary violations
      }));
      
      groupRef.current.rotation.z = Math.cos(animationRef.current * 1.8) * 0.4;
      groupRef.current.position.x = Math.sin(animationRef.current * 1.1) * 0.3;
      
      const violations = memoryRegions.current.filter(r => r.corrupted).length;
      
      onMetrics({
        detectedErrors: violations,
        memoryViolations: violations,
        stackOverflows: Math.floor(violations * 0.3),
        heapCorruptions: Math.floor(violations * 0.5),
        doubleFreesDetected: Math.floor(violations * 0.1),
        useAfterFrees: Math.floor(violations * 0.4),
        corruptionLevel: Math.floor(boundaryViolations * 100)
      });
    } else if (debuggingTool === 'heap_corruption') {
      // Heap corruption pattern detection
      const heapBlocks = 30;
      const corruptionPatterns = Math.sin(animationRef.current * 1.8) * 0.12 + 0.18;
      
      memoryRegions.current = Array.from({ length: heapBlocks }, (_, i) => ({
        id: i,
        corrupted: Math.random() < corruptionPatterns,
        protected: false,
        type: 'heap_metadata',
        severity: Math.floor(Math.random() * 3) + 1
      }));
      
      groupRef.current.rotation.x = animationRef.current * 0.5;
      groupRef.current.rotation.y = Math.sin(animationRef.current * 1.3) * 0.6;
      
      const corrupted = memoryRegions.current.filter(r => r.corrupted).length;
      
      onMetrics({
        detectedErrors: Math.floor(corrupted * 0.8), // 80% detection rate
        memoryViolations: corrupted,
        stackOverflows: 0,
        heapCorruptions: corrupted,
        doubleFreesDetected: Math.floor(corrupted * 0.4),
        useAfterFrees: Math.floor(corrupted * 0.3),
        corruptionLevel: Math.floor(corruptionPatterns * 100)
      });
    } else if (debuggingTool === 'stack_protection') {
      // Stack smashing detection
      const stackFrames = 12;
      const smashingRate = Math.sin(animationRef.current * 2.2) * 0.08 + 0.05;
      
      memoryRegions.current = Array.from({ length: stackFrames }, (_, i) => ({
        id: i,
        corrupted: Math.random() < smashingRate,
        protected: true,
        type: 'stack_frame',
        severity: 3 // High severity for stack smashing
      }));
      
      groupRef.current.rotation.y = animationRef.current * 0.7;
      groupRef.current.position.z = Math.cos(animationRef.current * 1.5) * 0.2;
      
      const smashed = memoryRegions.current.filter(r => r.corrupted).length;
      
      onMetrics({
        detectedErrors: smashed,
        memoryViolations: smashed,
        stackOverflows: smashed,
        heapCorruptions: 0,
        doubleFreesDetected: 0,
        useAfterFrees: 0,
        corruptionLevel: Math.floor(smashingRate * 100)
      });
    }
  });

  const renderMemoryVisualization = () => {
    const blocks = [];
    const gridSize = Math.ceil(Math.sqrt(memoryRegions.current.length));
    
    memoryRegions.current.forEach((region, index) => {
      const x = (index % gridSize - gridSize / 2) * 0.8;
      const z = (Math.floor(index / gridSize) - gridSize / 2) * 0.8;
      
      // Color based on corruption status and protection
      let color = region.protected ? 
        (region.corrupted ? '#ff4444' : '#44ff44') : 
        (region.corrupted ? '#ffaa44' : '#4488ff');
      
      // Special coloring for different tools
      if (debuggingTool === 'address_sanitizer' && region.corrupted) {
        color = region.severity === 3 ? '#ff0000' : region.severity === 2 ? '#ff6600' : '#ffaa00';
      } else if (debuggingTool === 'valgrind' && region.corrupted) {
        color = '#ff3366';
      } else if (debuggingTool === 'custom_guards' && region.protected) {
        color = region.corrupted ? '#cc0000' : '#0066cc';
      }
      
      blocks.push(
        <mesh key={region.id} position={[x, 0, z]}>
          <boxGeometry args={[0.6, region.corrupted ? 1.2 : 0.8, 0.6]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={region.corrupted ? 0.9 : 0.7}
            emissive={region.corrupted ? new Color(color).multiplyScalar(0.2) : new Color(0x000000)}
          />
        </mesh>
      );
      
      // Add warning indicators for severe violations
      if (region.corrupted && region.severity >= 2) {
        blocks.push(
          <mesh key={`warning_${region.id}`} position={[x, 1.5, z]}>
            <coneGeometry args={[0.2, 0.4, 3]} />
            <meshBasicMaterial color="#ffff00" />
          </mesh>
        );
      }
    });
    
    return blocks;
  };

  return (
    <group ref={groupRef}>
      {renderMemoryVisualization()}
      
      {/* Debug tool indicator */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 16]} />
        <meshStandardMaterial 
          color={
            debuggingTool === 'address_sanitizer' ? '#ff6600' :
            debuggingTool === 'valgrind' ? '#6666ff' :
            debuggingTool === 'custom_guards' ? '#00cc66' :
            debuggingTool === 'heap_corruption' ? '#cc3366' :
            '#ffcc00'
          } 
          transparent 
          opacity={0.3} 
        />
      </mesh>
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
    </group>
  );
};

const Lesson80_MemoryDebugging: React.FC = () => {
  const [state, setState] = useState<MemoryDebuggingState>({
    language: 'en',
    debuggingTool: 'address_sanitizer',
    isAnimating: false,
    corruptionLevel: 0,
    detectedErrors: 0,
    memoryViolations: 0,
    stackOverflows: 0,
    heapCorruptions: 0,
    doubleFreesDetected: 0,
    useAfterFrees: 0
  });

  const handleMetrics = useCallback((metrics: any) => {
    setState(prev => ({
      ...prev,
      ...metrics
    }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  const setDebuggingTool = useCallback((tool: MemoryDebuggingState['debuggingTool']) => {
    setState(prev => ({ ...prev, debuggingTool: tool }));
  }, []);

  const toggleLanguage = useCallback(() => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'es' : 'en' }));
  }, []);

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 80: Memory Debugging Techniques" : "Lección 80: Técnicas de Depuración de Memoria"}
      description={state.language === 'en' ? 
        "Master advanced memory debugging tools, sanitizers, and corruption detection techniques" : 
        "Domina herramientas avanzadas de depuración de memoria, sanitizadores y técnicas de detección de corrupción"}
    >
      <AccessibilityAnnouncer 
        message={state.language === 'en' ? 
          `Memory debugging visualization showing ${state.debuggingTool} with ${state.detectedErrors} detected errors` :
          `Visualización de depuración de memoria mostrando ${state.debuggingTool} con ${state.detectedErrors} errores detectados`}
        priority="polite"
      />

      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Button onClick={toggleLanguage}>
            {state.language === 'en' ? '🇪🇸 Español' : '🇺🇸 English'}
          </Button>
        </div>

        <LearningObjectives
          objectives={state.language === 'en' ? [
            "Master AddressSanitizer (ASan) for memory error detection",
            "Understand Valgrind memcheck and heap profiling techniques",
            "Implement custom memory debugging tools and guards",
            "Detect and analyze memory corruption patterns",
            "Apply stack smashing protection and boundary checking",
            "Develop production-ready debugging strategies"
          ] : [
            "Dominar AddressSanitizer (ASan) para detección de errores de memoria",
            "Comprender Valgrind memcheck y técnicas de profiling de heap",
            "Implementar herramientas de depuración de memoria personalizadas",
            "Detectar y analizar patrones de corrupción de memoria",
            "Aplicar protección contra stack smashing y verificación de límites",
            "Desarrollar estrategias de depuración listas para producción"
          ]}
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? "Interactive Memory Debugging Visualization" : "Visualización Interactiva de Depuración de Memoria"}
        </SectionTitle>
        
        <div style={{ marginBottom: '2rem' }}>
          <ButtonGroup>
            <Button 
              variant={state.debuggingTool === 'address_sanitizer' ? 'primary' : 'secondary'}
              onClick={() => setDebuggingTool('address_sanitizer')}
            >
              {state.language === 'en' ? 'AddressSanitizer' : 'AddressSanitizer'}
            </Button>
            <Button 
              variant={state.debuggingTool === 'valgrind' ? 'primary' : 'secondary'}
              onClick={() => setDebuggingTool('valgrind')}
            >
              {state.language === 'en' ? 'Valgrind' : 'Valgrind'}
            </Button>
            <Button 
              variant={state.debuggingTool === 'custom_guards' ? 'primary' : 'secondary'}
              onClick={() => setDebuggingTool('custom_guards')}
            >
              {state.language === 'en' ? 'Custom Guards' : 'Guardas Personalizados'}
            </Button>
            <Button 
              variant={state.debuggingTool === 'heap_corruption' ? 'primary' : 'secondary'}
              onClick={() => setDebuggingTool('heap_corruption')}
            >
              {state.language === 'en' ? 'Heap Corruption' : 'Corrupción de Heap'}
            </Button>
            <Button 
              variant={state.debuggingTool === 'stack_protection' ? 'primary' : 'secondary'}
              onClick={() => setDebuggingTool('stack_protection')}
            >
              {state.language === 'en' ? 'Stack Protection' : 'Protección de Stack'}
            </Button>
          </ButtonGroup>
          
          <Button onClick={toggleAnimation} style={{ marginLeft: '1rem' }}>
            {state.isAnimating ? 
              (state.language === 'en' ? 'Stop Simulation' : 'Detener Simulación') : 
              (state.language === 'en' ? 'Start Simulation' : 'Iniciar Simulación')
            }
          </Button>
        </div>

        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
            <MemoryDebuggingVisualization 
              debuggingTool={state.debuggingTool} 
              isAnimating={state.isAnimating}
              onMetrics={handleMetrics}
            />
          </Canvas>
        </div>

        <PerformanceMonitor
          metrics={{
            [state.language === 'en' ? 'Detected Errors' : 'Errores Detectados']: state.detectedErrors,
            [state.language === 'en' ? 'Memory Violations' : 'Violaciones de Memoria']: state.memoryViolations,
            [state.language === 'en' ? 'Stack Overflows' : 'Desbordamientos de Stack']: state.stackOverflows,
            [state.language === 'en' ? 'Heap Corruptions' : 'Corrupciones de Heap']: state.heapCorruptions,
            [state.language === 'en' ? 'Double Frees' : 'Liberaciones Dobles']: state.doubleFreesDetected,
            [state.language === 'en' ? 'Use After Free' : 'Uso Tras Liberación']: state.useAfterFrees,
            [state.language === 'en' ? 'Corruption Level %' : 'Nivel de Corrupción %']: state.corruptionLevel
          }}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "AddressSanitizer Integration" : "Integración de AddressSanitizer"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "AddressSanitizer (ASan) is a runtime memory error detector that finds use-after-free, buffer overflows, and other memory bugs with minimal performance overhead." :
            "AddressSanitizer (ASan) es un detector de errores de memoria en tiempo de ejecución que encuentra uso después de liberar, desbordamientos de buffer y otros errores de memoria con mínima sobrecarga de rendimiento."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={`// Compile with AddressSanitizer
// g++ -fsanitize=address -g -O1 program.cpp -o program

#include <iostream>
#include <memory>
#include <vector>

class MemoryDebugger {
private:
    static size_t allocation_count_;
    static size_t deallocation_count_;
    static std::vector<void*> active_allocations_;
    
public:
    // Custom allocator with debugging info
    template<typename T>
    static T* debug_allocate(size_t count, const char* file, int line) {
        T* ptr = new T[count];
        active_allocations_.push_back(ptr);
        allocation_count_++;
        
        std::cout << "[ALLOC] " << ptr << " (" << sizeof(T) * count 
                  << " bytes) at " << file << ":" << line << std::endl;
        return ptr;
    }
    
    template<typename T>
    static void debug_deallocate(T* ptr, const char* file, int line) {
        auto it = std::find(active_allocations_.begin(), 
                           active_allocations_.end(), ptr);
        
        if (it != active_allocations_.end()) {
            active_allocations_.erase(it);
            deallocation_count_++;
            std::cout << "[FREE] " << ptr << " at " << file 
                      << ":" << line << std::endl;
            delete[] ptr;
        } else {
            std::cout << "[ERROR] Double free detected: " << ptr 
                      << " at " << file << ":" << line << std::endl;
        }
    }
    
    static void report_leaks() {
        if (!active_allocations_.empty()) {
            std::cout << "[LEAK] " << active_allocations_.size() 
                      << " allocations not freed" << std::endl;
        }
        std::cout << "Allocations: " << allocation_count_ 
                  << ", Deallocations: " << deallocation_count_ << std::endl;
    }
};

#define DEBUG_NEW(type, count) \\
    MemoryDebugger::debug_allocate<type>(count, __FILE__, __LINE__)
#define DEBUG_DELETE(ptr) \\
    MemoryDebugger::debug_deallocate(ptr, __FILE__, __LINE__)

// Static member definitions
size_t MemoryDebugger::allocation_count_ = 0;
size_t MemoryDebugger::deallocation_count_ = 0;
std::vector<void*> MemoryDebugger::active_allocations_;

void demonstrate_asan_detection() {
    // This will be detected by AddressSanitizer
    int* arr = DEBUG_NEW(int, 10);
    
    // Buffer overflow - ASan will catch this
    // arr[10] = 42;  // Uncomment to trigger ASan
    
    DEBUG_DELETE(arr);
    
    // Use after free - ASan will catch this
    // arr[0] = 42;  // Uncomment to trigger ASan
    
    MemoryDebugger::report_leaks();
}`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Valgrind Memcheck Usage" : "Uso de Valgrind Memcheck"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "Valgrind's memcheck tool detects memory leaks, use of uninitialized memory, and improper heap usage with detailed stack traces." :
            "La herramienta memcheck de Valgrind detecta fugas de memoria, uso de memoria no inicializada e uso incorrecto del heap con trazas de stack detalladas."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={`// Run with Valgrind memcheck:
// valgrind --tool=memcheck --leak-check=full --track-origins=yes ./program

#include <cstdlib>
#include <cstring>
#include <iostream>
#include <map>
#include <chrono>

class ValgrindMemcheckDemo {
private:
    struct AllocationInfo {
        size_t size;
        std::chrono::time_point<std::chrono::steady_clock> timestamp;
        std::string context;
    };
    
    static std::map<void*, AllocationInfo> allocations_;
    
public:
    static void* tracked_malloc(size_t size, const std::string& context = "") {
        void* ptr = std::malloc(size);
        if (ptr) {
            allocations_[ptr] = {
                size, 
                std::chrono::steady_clock::now(),
                context
            };
        }
        return ptr;
    }
    
    static void tracked_free(void* ptr) {
        auto it = allocations_.find(ptr);
        if (it != allocations_.end()) {
            allocations_.erase(it);
            std::free(ptr);
        } else {
            std::cerr << "Warning: Attempting to free untracked pointer: " 
                      << ptr << std::endl;
            // Still free it to avoid actual leaks during debugging
            std::free(ptr);
        }
    }
    
    static void demonstrate_valgrind_scenarios() {
        // Scenario 1: Memory leak
        char* leaked_memory = (char*)tracked_malloc(1024, "intentional_leak");
        // Intentionally not freed to demonstrate leak detection
        
        // Scenario 2: Uninitialized read
        char* buffer = (char*)tracked_malloc(100, "uninitialized_buffer");
        // Valgrind will detect reading uninitialized memory
        // char first_byte = buffer[0];  // Uncomment to trigger warning
        
        // Initialize the buffer properly
        std::memset(buffer, 0, 100);
        char first_byte = buffer[0];  // Now safe
        
        tracked_free(buffer);
        
        // Scenario 3: Invalid read/write
        char* small_buffer = (char*)tracked_malloc(10, "small_buffer");
        // Valgrind will detect out-of-bounds access
        // small_buffer[15] = 'X';  // Uncomment to trigger error
        
        // Use buffer within bounds
        small_buffer[5] = 'X';
        
        tracked_free(small_buffer);
        
        // Scenario 4: Double free detection
        char* double_free_buffer = (char*)tracked_malloc(50, "double_free_test");
        tracked_free(double_free_buffer);
        // tracked_free(double_free_buffer);  // Uncomment for double free
    }
    
    static void report_remaining_allocations() {
        if (!allocations_.empty()) {
            std::cout << "Remaining allocations:" << std::endl;
            for (const auto& [ptr, info] : allocations_) {
                auto duration = std::chrono::steady_clock::now() - info.timestamp;
                auto seconds = std::chrono::duration_cast<std::chrono::seconds>(duration);
                
                std::cout << "  " << ptr << ": " << info.size 
                          << " bytes, alive for " << seconds.count() 
                          << "s, context: " << info.context << std::endl;
            }
        }
    }
};

std::map<void*, ValgrindMemcheckDemo::AllocationInfo> 
    ValgrindMemcheckDemo::allocations_;

// Valgrind suppression example for known false positives
/*
{
   known_library_leak
   Memcheck:Leak
   match-leak-kinds: definite
   fun:malloc
   fun:some_library_function
   obj:/usr/lib/x86_64-linux-gnu/libsomelibrary.so
}
*/`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Custom Memory Guards and Boundary Checking" : "Guardas de Memoria Personalizados y Verificación de Límites"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "Custom guard pages and boundary checking mechanisms provide fine-grained control over memory access patterns and can detect violations immediately." :
            "Las páginas de guarda personalizadas y mecanismos de verificación de límites proporcionan control granular sobre patrones de acceso a memoria y pueden detectar violaciones inmediatamente."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={`#include <sys/mman.h>
#include <unistd.h>
#include <signal.h>
#include <iostream>
#include <cstdlib>
#include <cstring>
#include <vector>
#include <map>

class GuardedMemoryAllocator {
private:
    struct GuardedAllocation {
        void* guard_before;
        void* user_memory;
        void* guard_after;
        size_t user_size;
        size_t total_size;
    };
    
    static std::map<void*, GuardedAllocation> allocations_;
    static size_t page_size_;
    static bool signal_handler_installed_;
    
    static void install_signal_handler() {
        if (!signal_handler_installed_) {
            struct sigaction sa;
            sa.sa_sigaction = segv_handler;
            sigemptyset(&sa.sa_mask);
            sa.sa_flags = SA_SIGINFO;
            sigaction(SIGSEGV, &sa, nullptr);
            signal_handler_installed_ = true;
        }
    }
    
    static void segv_handler(int sig, siginfo_t* info, void* context) {
        void* fault_addr = info->si_addr;
        
        std::cerr << "SEGMENTATION FAULT detected at address: " 
                  << fault_addr << std::endl;
        
        // Check if this is one of our guard pages
        for (const auto& [user_ptr, alloc] : allocations_) {
            if (fault_addr >= alloc.guard_before && 
                fault_addr < alloc.user_memory) {
                std::cerr << "UNDERRUN detected: Access before allocated memory" 
                          << std::endl;
                std::cerr << "User memory starts at: " << alloc.user_memory 
                          << std::endl;
                break;
            } else if (fault_addr >= alloc.guard_after && 
                      fault_addr < (char*)alloc.guard_after + page_size_) {
                std::cerr << "OVERRUN detected: Access after allocated memory" 
                          << std::endl;
                std::cerr << "User memory ends at: " 
                          << (char*)alloc.user_memory + alloc.user_size 
                          << std::endl;
                break;
            }
        }
        
        std::abort();
    }
    
public:
    static void initialize() {
        page_size_ = getpagesize();
        install_signal_handler();
    }
    
    static void* guarded_malloc(size_t size) {
        if (page_size_ == 0) initialize();
        
        // Calculate total size: guard + user memory + guard
        size_t aligned_size = (size + page_size_ - 1) & ~(page_size_ - 1);
        size_t total_size = aligned_size + 2 * page_size_;
        
        // Allocate memory with guard pages
        void* base = mmap(nullptr, total_size, 
                         PROT_READ | PROT_WRITE,
                         MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
        
        if (base == MAP_FAILED) {
            return nullptr;
        }
        
        // Set up guard pages (no access permissions)
        void* guard_before = base;
        void* user_memory = (char*)base + page_size_;
        void* guard_after = (char*)user_memory + aligned_size;
        
        // Make guard pages inaccessible
        mprotect(guard_before, page_size_, PROT_NONE);
        mprotect(guard_after, page_size_, PROT_NONE);
        
        // Fill user memory with a pattern for debugging
        std::memset(user_memory, 0xAA, size);
        
        // Store allocation info
        allocations_[user_memory] = {
            guard_before, user_memory, guard_after, size, total_size
        };
        
        return user_memory;
    }
    
    static void guarded_free(void* ptr) {
        auto it = allocations_.find(ptr);
        if (it == allocations_.end()) {
            std::cerr << "ERROR: Attempting to free non-guarded pointer: " 
                      << ptr << std::endl;
            return;
        }
        
        const GuardedAllocation& alloc = it->second;
        
        // Fill memory with different pattern before freeing
        std::memset(ptr, 0xDD, alloc.user_size);
        
        // Unmap the entire allocation
        munmap(alloc.guard_before, alloc.total_size);
        
        allocations_.erase(it);
    }
    
    // Boundary checking for existing allocations
    static bool check_bounds(void* ptr, size_t access_size) {
        auto it = allocations_.find(ptr);
        if (it == allocations_.end()) {
            return false;  // Not a guarded allocation
        }
        
        const GuardedAllocation& alloc = it->second;
        
        if ((char*)ptr + access_size > (char*)alloc.user_memory + alloc.user_size) {
            std::cerr << "BOUNDS CHECK FAILED: Access would exceed allocation" 
                      << std::endl;
            return false;
        }
        
        return true;
    }
    
    static void demonstrate_guard_detection() {
        void* buffer = guarded_malloc(1024);
        
        // Safe access
        ((char*)buffer)[0] = 'A';
        ((char*)buffer)[1023] = 'Z';
        
        // Bounds check before potentially unsafe access
        if (!check_bounds(buffer, 1025)) {
            std::cout << "Bounds check prevented buffer overflow" << std::endl;
        }
        
        // These would trigger SIGSEGV:
        // ((char*)buffer)[-1] = 'X';     // Underrun
        // ((char*)buffer)[1024] = 'X';   // Overrun
        
        guarded_free(buffer);
        
        // Use after free would also be detected:
        // ((char*)buffer)[0] = 'X';
    }
};

// Static member definitions
std::map<void*, GuardedMemoryAllocator::GuardedAllocation> 
    GuardedMemoryAllocator::allocations_;
size_t GuardedMemoryAllocator::page_size_ = 0;
bool GuardedMemoryAllocator::signal_handler_installed_ = false;`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Heap Corruption Detection" : "Detección de Corrupción de Heap"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "Advanced heap corruption detection involves monitoring heap metadata, detecting patterns indicative of corruption, and implementing runtime validation." :
            "La detección avanzada de corrupción de heap implica monitorear metadatos del heap, detectar patrones indicativos de corrupción e implementar validación en tiempo de ejecución."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <cstdlib>
#include <cstring>
#include <unordered_map>
#include <random>
#include <iomanip>

class HeapCorruptionDetector {
private:
    static const uint32_t CANARY_MAGIC = 0xDEADBEEF;
    static const uint32_t FREE_MAGIC = 0xFEEDFACE;
    static const size_t CANARY_SIZE = sizeof(uint32_t);
    
    struct BlockHeader {
        uint32_t front_canary;
        size_t size;
        uint32_t checksum;
        uint64_t allocation_id;
    };
    
    struct BlockFooter {
        uint32_t back_canary;
    };
    
    static std::unordered_map<void*, BlockHeader*> active_blocks_;
    static uint64_t next_allocation_id_;
    static std::mt19937 rng_;
    
    static uint32_t calculate_checksum(const BlockHeader* header) {
        // Simple checksum of header data (excluding checksum field)
        uint32_t sum = header->front_canary;
        sum ^= static_cast<uint32_t>(header->size);
        sum ^= static_cast<uint32_t>(header->allocation_id);
        sum ^= static_cast<uint32_t>(header->allocation_id >> 32);
        return sum;
    }
    
    static void fill_pattern(void* ptr, size_t size, uint8_t pattern) {
        std::memset(ptr, pattern, size);
    }
    
public:
    static void* protected_malloc(size_t size) {
        // Calculate total allocation size
        size_t total_size = sizeof(BlockHeader) + size + sizeof(BlockFooter);
        
        // Allocate memory
        BlockHeader* block = static_cast<BlockHeader*>(std::malloc(total_size));
        if (!block) return nullptr;
        
        // Initialize header
        block->front_canary = CANARY_MAGIC;
        block->size = size;
        block->allocation_id = next_allocation_id_++;
        block->checksum = calculate_checksum(block);
        
        // Get user data pointer
        void* user_data = reinterpret_cast<char*>(block) + sizeof(BlockHeader);
        
        // Initialize footer
        BlockFooter* footer = reinterpret_cast<BlockFooter*>(
            reinterpret_cast<char*>(user_data) + size);
        footer->back_canary = CANARY_MAGIC;
        
        // Fill user data with initialization pattern
        fill_pattern(user_data, size, 0xCC);
        
        // Track allocation
        active_blocks_[user_data] = block;
        
        return user_data;
    }
    
    static bool validate_block(void* user_ptr) {
        auto it = active_blocks_.find(user_ptr);
        if (it == active_blocks_.end()) {
            std::cerr << "CORRUPTION: Block not found in active allocations" 
                      << std::endl;
            return false;
        }
        
        BlockHeader* header = it->second;
        
        // Check front canary
        if (header->front_canary != CANARY_MAGIC) {
            std::cerr << "CORRUPTION: Front canary corrupted (expected: " 
                      << std::hex << CANARY_MAGIC << ", got: " 
                      << header->front_canary << ")" << std::dec << std::endl;
            return false;
        }
        
        // Check header checksum
        uint32_t expected_checksum = calculate_checksum(header);
        if (header->checksum != expected_checksum) {
            std::cerr << "CORRUPTION: Header checksum mismatch (expected: " 
                      << std::hex << expected_checksum << ", got: " 
                      << header->checksum << ")" << std::dec << std::endl;
            return false;
        }
        
        // Check back canary
        BlockFooter* footer = reinterpret_cast<BlockFooter*>(
            reinterpret_cast<char*>(user_ptr) + header->size);
        
        if (footer->back_canary != CANARY_MAGIC) {
            std::cerr << "CORRUPTION: Back canary corrupted (expected: " 
                      << std::hex << CANARY_MAGIC << ", got: " 
                      << footer->back_canary << ")" << std::dec << std::endl;
            return false;
        }
        
        return true;
    }
    
    static void protected_free(void* user_ptr) {
        if (!user_ptr) return;
        
        if (!validate_block(user_ptr)) {
            std::cerr << "ABORTING: Corruption detected during free" << std::endl;
            std::abort();
        }
        
        auto it = active_blocks_.find(user_ptr);
        BlockHeader* header = it->second;
        
        // Fill user data with free pattern
        fill_pattern(user_ptr, header->size, 0xDD);
        
        // Mark header as freed
        header->front_canary = FREE_MAGIC;
        
        // Remove from active blocks
        active_blocks_.erase(it);
        
        // Free the memory
        std::free(header);
    }
    
    static void validate_all_blocks() {
        std::cout << "Validating " << active_blocks_.size() 
                  << " active allocations..." << std::endl;
        
        size_t corrupted_count = 0;
        for (const auto& [user_ptr, header] : active_blocks_) {
            if (!validate_block(user_ptr)) {
                corrupted_count++;
            }
        }
        
        if (corrupted_count == 0) {
            std::cout << "All allocations validated successfully" << std::endl;
        } else {
            std::cout << "Found " << corrupted_count 
                      << " corrupted allocations" << std::endl;
        }
    }
    
    static void demonstrate_corruption_detection() {
        std::cout << "=== Heap Corruption Detection Demo ===" << std::endl;
        
        // Normal allocation and usage
        char* buffer1 = static_cast<char*>(protected_malloc(100));
        strcpy(buffer1, "Hello, World!");
        
        // Another allocation
        int* buffer2 = static_cast<int*>(protected_malloc(40 * sizeof(int)));
        for (int i = 0; i < 40; ++i) {
            buffer2[i] = i * i;
        }
        
        // Validate all blocks (should pass)
        validate_all_blocks();
        
        // Simulate corruption scenarios (commented out for safety)
        /*
        // Scenario 1: Overflow corruption
        buffer1[105] = 'X';  // Would corrupt back canary
        
        // Scenario 2: Header corruption
        BlockHeader* header = reinterpret_cast<BlockHeader*>(
            reinterpret_cast<char*>(buffer1) - sizeof(BlockHeader));
        header->front_canary = 0x12345678;  // Corrupt front canary
        
        validate_all_blocks();  // Would detect corruption
        */
        
        // Clean up
        protected_free(buffer1);
        protected_free(buffer2);
        
        std::cout << "Demo completed successfully" << std::endl;
    }
};

// Static member definitions
std::unordered_map<void*, HeapCorruptionDetector::BlockHeader*> 
    HeapCorruptionDetector::active_blocks_;
uint64_t HeapCorruptionDetector::next_allocation_id_ = 1;
std::mt19937 HeapCorruptionDetector::rng_;`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Production Debugging Strategies" : "Estrategias de Depuración en Producción"}
        </SectionTitle>
        
        <p>
          {state.language === 'en' ? 
            "Production memory debugging requires lightweight, configurable tools that can be enabled selectively without significantly impacting performance." :
            "La depuración de memoria en producción requiere herramientas ligeras y configurables que puedan habilitarse selectivamente sin impactar significativamente el rendimiento."
          }
        </p>

        <CodeBlock
          language="cpp"
          code={`#include <iostream>
#include <atomic>
#include <thread>
#include <chrono>
#include <fstream>
#include <sstream>
#include <vector>
#include <mutex>

class ProductionMemoryDebugger {
private:
    static std::atomic<bool> debug_enabled_;
    static std::atomic<size_t> allocation_count_;
    static std::atomic<size_t> deallocation_count_;
    static std::atomic<size_t> total_allocated_;
    static std::atomic<size_t> peak_allocated_;
    static std::mutex log_mutex_;
    static std::ofstream debug_log_;
    static std::chrono::steady_clock::time_point start_time_;
    
public:
    struct MemoryStats {
        size_t allocations;
        size_t deallocations;
        size_t current_allocated;
        size_t peak_allocated;
        double uptime_seconds;
        size_t leaked_allocations;
    };
    
    static void initialize(const std::string& log_file = "memory_debug.log") {
        debug_enabled_.store(true);
        start_time_ = std::chrono::steady_clock::now();
        
        if (!log_file.empty()) {
            std::lock_guard<std::mutex> lock(log_mutex_);
            debug_log_.open(log_file, std::ios::app);
            if (debug_log_.is_open()) {
                debug_log_ << "=== Memory Debug Session Started ===" << std::endl;
            }
        }
    }
    
    static void shutdown() {
        debug_enabled_.store(false);
        
        std::lock_guard<std::mutex> lock(log_mutex_);
        if (debug_log_.is_open()) {
            debug_log_ << "=== Memory Debug Session Ended ===" << std::endl;
            debug_log_.close();
        }
    }
    
    static void* debug_malloc(size_t size, const char* context = nullptr) {
        void* ptr = std::malloc(size);
        
        if (debug_enabled_.load() && ptr) {
            allocation_count_.fetch_add(1);
            size_t current = total_allocated_.fetch_add(size) + size;
            
            // Update peak if necessary
            size_t current_peak = peak_allocated_.load();
            while (current > current_peak && 
                   !peak_allocated_.compare_exchange_weak(current_peak, current)) {
                // Retry if another thread updated peak_allocated_
            }
            
            // Conditional logging (only for significant allocations or high frequency)
            if (size > 1024 || (allocation_count_.load() % 1000 == 0)) {
                log_allocation(ptr, size, context);
            }
        }
        
        return ptr;
    }
    
    static void debug_free(void* ptr, size_t size = 0, const char* context = nullptr) {
        if (ptr && debug_enabled_.load()) {
            deallocation_count_.fetch_add(1);
            if (size > 0) {
                total_allocated_.fetch_sub(size);
            }
            
            // Conditional logging for significant deallocations
            if (size > 1024 || (deallocation_count_.load() % 1000 == 0)) {
                log_deallocation(ptr, size, context);
            }
        }
        
        std::free(ptr);
    }
    
    static MemoryStats get_stats() {
        auto now = std::chrono::steady_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::seconds>(
            now - start_time_);
        
        size_t allocs = allocation_count_.load();
        size_t deallocs = deallocation_count_.load();
        
        return {
            allocs,
            deallocs,
            total_allocated_.load(),
            peak_allocated_.load(),
            static_cast<double>(duration.count()),
            allocs > deallocs ? allocs - deallocs : 0
        };
    }
    
    static void periodic_report(int interval_seconds = 30) {
        while (debug_enabled_.load()) {
            std::this_thread::sleep_for(std::chrono::seconds(interval_seconds));
            
            MemoryStats stats = get_stats();
            
            std::ostringstream report;
            report << "[MEMORY REPORT] "
                   << "Allocs: " << stats.allocations
                   << ", Frees: " << stats.deallocations
                   << ", Current: " << stats.current_allocated << " bytes"
                   << ", Peak: " << stats.peak_allocated << " bytes"
                   << ", Leaks: " << stats.leaked_allocations
                   << ", Uptime: " << stats.uptime_seconds << "s";
            
            {
                std::lock_guard<std::mutex> lock(log_mutex_);
                if (debug_log_.is_open()) {
                    debug_log_ << report.str() << std::endl;
                    debug_log_.flush();
                }
            }
            
            // Also output to console in debug builds
            #ifdef DEBUG
            std::cout << report.str() << std::endl;
            #endif
        }
    }
    
    static void enable_debug(bool enable) {
        debug_enabled_.store(enable);
    }
    
    static bool is_debug_enabled() {
        return debug_enabled_.load();
    }
    
private:
    static void log_allocation(void* ptr, size_t size, const char* context) {
        std::lock_guard<std::mutex> lock(log_mutex_);
        if (debug_log_.is_open()) {
            auto now = std::chrono::steady_clock::now();
            auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
                now - start_time_).count();
            
            debug_log_ << "[" << timestamp << "ms] ALLOC " << ptr 
                       << " size=" << size;
            if (context) {
                debug_log_ << " context=" << context;
            }
            debug_log_ << std::endl;
        }
    }
    
    static void log_deallocation(void* ptr, size_t size, const char* context) {
        std::lock_guard<std::mutex> lock(log_mutex_);
        if (debug_log_.is_open()) {
            auto now = std::chrono::steady_clock::now();
            auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
                now - start_time_).count();
            
            debug_log_ << "[" << timestamp << "ms] FREE " << ptr;
            if (size > 0) {
                debug_log_ << " size=" << size;
            }
            if (context) {
                debug_log_ << " context=" << context;
            }
            debug_log_ << std::endl;
        }
    }
};

// Static member definitions
std::atomic<bool> ProductionMemoryDebugger::debug_enabled_{false};
std::atomic<size_t> ProductionMemoryDebugger::allocation_count_{0};
std::atomic<size_t> ProductionMemoryDebugger::deallocation_count_{0};
std::atomic<size_t> ProductionMemoryDebugger::total_allocated_{0};
std::atomic<size_t> ProductionMemoryDebugger::peak_allocated_{0};
std::mutex ProductionMemoryDebugger::log_mutex_;
std::ofstream ProductionMemoryDebugger::debug_log_;
std::chrono::steady_clock::time_point ProductionMemoryDebugger::start_time_;

// Convenience macros for production use
#ifdef ENABLE_MEMORY_DEBUG
    #define PROD_MALLOC(size) ProductionMemoryDebugger::debug_malloc(size, __FUNCTION__)
    #define PROD_FREE(ptr, size) ProductionMemoryDebugger::debug_free(ptr, size, __FUNCTION__)
#else
    #define PROD_MALLOC(size) std::malloc(size)
    #define PROD_FREE(ptr, size) std::free(ptr)
#endif

void demonstrate_production_debugging() {
    // Initialize debugging
    ProductionMemoryDebugger::initialize("production_memory.log");
    
    // Start periodic reporting in background thread
    std::thread reporter([]() {
        ProductionMemoryDebugger::periodic_report(10);  // Report every 10 seconds
    });
    reporter.detach();
    
    // Simulate application workload
    std::vector<void*> allocations;
    
    for (int i = 0; i < 1000; ++i) {
        size_t size = 64 + (i % 10) * 128;  // Varying sizes
        void* ptr = PROD_MALLOC(size);
        
        if (ptr) {
            allocations.push_back(ptr);
            
            // Simulate some work
            std::this_thread::sleep_for(std::chrono::milliseconds(1));
            
            // Free some allocations randomly
            if (!allocations.empty() && (rand() % 3 == 0)) {
                void* to_free = allocations.back();
                allocations.pop_back();
                PROD_FREE(to_free, size);
            }
        }
    }
    
    // Clean up remaining allocations
    for (void* ptr : allocations) {
        PROD_FREE(ptr, 0);  // Size unknown in this context
    }
    
    // Get final statistics
    auto stats = ProductionMemoryDebugger::get_stats();
    std::cout << "Final Stats:" << std::endl;
    std::cout << "  Total Allocations: " << stats.allocations << std::endl;
    std::cout << "  Total Deallocations: " << stats.deallocations << std::endl;
    std::cout << "  Peak Memory: " << stats.peak_allocated << " bytes" << std::endl;
    std::cout << "  Potential Leaks: " << stats.leaked_allocations << std::endl;
    
    ProductionMemoryDebugger::shutdown();
}`}
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Practical Exercises" : "Ejercicios Prácticos"}
        </SectionTitle>
        
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>{state.language === 'en' ? "Exercise 1: AddressSanitizer Integration" : "Ejercicio 1: Integración de AddressSanitizer"}</h4>
          <p>
            {state.language === 'en' ? 
              "Implement a complete AddressSanitizer-enabled debugging system with custom allocation tracking, leak detection, and automated error reporting." :
              "Implementa un sistema completo de depuración habilitado con AddressSanitizer con seguimiento de asignación personalizado, detección de fugas e informes de errores automatizados."
            }
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>{state.language === 'en' ? "Exercise 2: Custom Guard Implementation" : "Ejercicio 2: Implementación de Guardas Personalizados"}</h4>
          <p>
            {state.language === 'en' ? 
              "Create a production-ready guard page system that can detect buffer overruns and underruns with configurable protection levels and performance monitoring." :
              "Crea un sistema de páginas de guarda listo para producción que pueda detectar desbordamientos de buffer con niveles de protección configurables y monitoreo de rendimiento."
            }
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>{state.language === 'en' ? "Exercise 3: Heap Corruption Analyzer" : "Ejercicio 3: Analizador de Corrupción de Heap"}</h4>
          <p>
            {state.language === 'en' ? 
              "Build an advanced heap corruption detection system with pattern analysis, automatic corruption source identification, and recovery mechanisms." :
              "Construye un sistema avanzado de detección de corrupción de heap con análisis de patrones, identificación automática de fuentes de corrupción y mecanismos de recuperación."
            }
          </p>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? "Key Takeaways" : "Puntos Clave"}
        </SectionTitle>
        
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            {state.language === 'en' ? 
              "AddressSanitizer provides excellent memory error detection with minimal overhead" :
              "AddressSanitizer proporciona excelente detección de errores de memoria con sobrecarga mínima"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Valgrind memcheck offers comprehensive memory debugging for complex scenarios" :
              "Valgrind memcheck ofrece depuración integral de memoria para escenarios complejos"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Custom guard pages provide immediate detection of boundary violations" :
              "Las páginas de guarda personalizadas proporcionan detección inmediata de violaciones de límites"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Heap corruption detection requires monitoring metadata and implementing validation" :
              "La detección de corrupción de heap requiere monitorear metadatos e implementar validación"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Production debugging tools must balance detection capability with performance impact" :
              "Las herramientas de depuración en producción deben equilibrar la capacidad de detección con el impacto en el rendimiento"
            }
          </li>
          <li>
            {state.language === 'en' ? 
              "Combining multiple debugging techniques provides comprehensive memory safety coverage" :
              "Combinar múltiples técnicas de depuración proporciona cobertura integral de seguridad de memoria"
            }
          </li>
        </ul>
      </Section>
    </LessonLayout>
  );
};

export default Lesson80_MemoryDebugging;