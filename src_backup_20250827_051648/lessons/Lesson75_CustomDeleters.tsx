/**
 * Lesson 75: Custom Deleters - Advanced Resource Management
 * Complete guide to custom deleter patterns for smart pointers and RAII
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

interface CustomDeletersState {
  language: 'en' | 'es';
  scenario: 'function_objects' | 'lambdas' | 'resource_management' | 'memory_pools';
  isAnimating: boolean;
  deletions: number;
  resourcesManaged: number;
  memoryPoolHits: number;
  performanceBenefit: number;
  leaksDetected: number;
}

// 3D Visualization of Custom Deleter Operations
const CustomDeletersVisualization: React.FC<{ scenario: string; isAnimating: boolean; onMetrics: (metrics: any) => void }> = ({ 
  scenario, isAnimating, onMetrics 
}) => {
  const groupRef = useRef<Group>(null);
  const resourceRef = useRef<Group>(null);
  const poolRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'function_objects') {
      groupRef.current.rotation.y = animationRef.current * 0.4;
      onMetrics({
        deletions: Math.floor(animationRef.current * 8) % 100,
        resourcesManaged: Math.floor(animationRef.current * 12) % 150,
        performanceBenefit: 85 + Math.sin(animationRef.current) * 10,
        customDeleterCalls: Math.floor(animationRef.current * 6) % 80
      });
    } else if (scenario === 'lambdas') {
      groupRef.current.position.y = Math.sin(animationRef.current * 0.6) * 0.3;
      onMetrics({
        deletions: Math.floor(animationRef.current * 15) % 200,
        capturesByValue: Math.floor(animationRef.current * 5) % 50,
        capturesByReference: Math.floor(animationRef.current * 3) % 30,
        performanceBenefit: 90 + Math.cos(animationRef.current * 0.7) * 8
      });
    } else if (scenario === 'resource_management') {
      if (resourceRef.current) {
        resourceRef.current.rotation.z = animationRef.current * 0.5;
      }
      onMetrics({
        resourcesManaged: Math.floor(animationRef.current * 20) % 300,
        fileHandlesClosed: Math.floor(animationRef.current * 4) % 40,
        gpuResourcesFreed: Math.floor(animationRef.current * 2) % 20,
        socketsClosed: Math.floor(animationRef.current * 3) % 25,
        leaksDetected: Math.floor(animationRef.current * 0.2) % 3
      });
    } else if (scenario === 'memory_pools') {
      if (poolRef.current) {
        poolRef.current.rotation.x = Math.sin(animationRef.current * 0.8) * 0.2;
      }
      onMetrics({
        memoryPoolHits: Math.floor(animationRef.current * 25) % 400,
        poolAllocations: Math.floor(animationRef.current * 18) % 250,
        customDeallocation: Math.floor(animationRef.current * 12) % 180,
        performanceBenefit: 95 + Math.sin(animationRef.current * 1.2) * 5
      });
    }
  });

  const renderDeleterBlocks = () => {
    const blocks = [];
    const blockCount = scenario === 'memory_pools' ? 30 : scenario === 'resource_management' ? 24 : 20;
    
    for (let i = 0; i < blockCount; i++) {
      const angle = (i / blockCount) * Math.PI * 2;
      const radius = scenario === 'lambdas' ? 2 + Math.sin(i * 0.3) * 0.5 : 
                     scenario === 'memory_pools' ? 1.8 : 2.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = scenario === 'resource_management' ? Math.sin(i * 0.4) * 0.4 : 0;
      
      const color = scenario === 'function_objects' 
        ? (i % 4 === 0 ? '#ff4080' : i % 4 === 1 ? '#4080ff' : i % 4 === 2 ? '#80ff40' : '#ff8040')
        : scenario === 'lambdas'
        ? (i % 3 === 0 ? '#ff6060' : i % 3 === 1 ? '#60ff60' : '#6060ff')
        : scenario === 'resource_management'
        ? (i % 5 === 0 ? '#ff0080' : i % 5 === 1 ? '#00ff80' : i % 5 === 2 ? '#8000ff' : i % 5 === 3 ? '#ff8000' : '#0080ff')
        : (i % 6 === 0 ? '#ff4040' : i % 6 === 1 ? '#40ff40' : i % 6 === 2 ? '#4040ff' : i % 6 === 3 ? '#ffff40' : i % 6 === 4 ? '#ff40ff' : '#40ffff');
      
      const scale = scenario === 'memory_pools' ? 0.25 : 0.3;
      
      blocks.push(
        <mesh key={i} position={[x, y, z]} scale={[scale, scale, scale]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
      );
    }
    
    return blocks;
  };

  const renderCenterStructure = () => {
    if (scenario === 'resource_management') {
      return (
        <group ref={resourceRef}>
          <mesh position={[0, 0, 0]}>
            <octahedronGeometry args={[0.8]} />
            <meshStandardMaterial color="#ff8000" transparent opacity={0.7} />
          </mesh>
        </group>
      );
    } else if (scenario === 'memory_pools') {
      return (
        <group ref={poolRef}>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[1.2, 0.4, 8, 16]} />
            <meshStandardMaterial color="#0080ff" transparent opacity={0.6} />
          </mesh>
        </group>
      );
    }
    return null;
  };

  return (
    <group ref={groupRef}>
      {renderDeleterBlocks()}
      {renderCenterStructure()}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#ff8000" />
    </group>
  );
};

const Lesson75_CustomDeleters: React.FC = () => {
  const [state, setState] = useState<CustomDeletersState>({
    language: 'en',
    scenario: 'function_objects',
    isAnimating: false,
    deletions: 0,
    resourcesManaged: 0,
    memoryPoolHits: 0,
    performanceBenefit: 0,
    leaksDetected: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: CustomDeletersState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      function_objects: state.language === 'en' ? 'Function Objects as Deleters' : 'Objetos Función como Deleters',
      lambdas: state.language === 'en' ? 'Lambda Deleters' : 'Deleters Lambda',
      resource_management: state.language === 'en' ? 'Resource Management' : 'Gestión de Recursos',
      memory_pools: state.language === 'en' ? 'Memory Pool Deleters' : 'Deleters de Memory Pool'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    function_objects: `// Custom Deleters con Function Objects
#include <memory>
#include <iostream>
#include <vector>
#include <fstream>
#include <cstdlib>

// Function object como custom deleter
struct ArrayDeleter {
    void operator()(int* ptr) const {
        std::cout << "ArrayDeleter: deallocating array\\n";
        delete[] ptr;
    }
};

// Function object con estado
class LoggingDeleter {
private:
    mutable size_t deletion_count_ = 0;
    std::string name_;
    
public:
    explicit LoggingDeleter(const std::string& name) : name_(name) {}
    
    void operator()(int* ptr) const {
        ++deletion_count_;
        std::cout << "[" << name_ << "] Deletion #" << deletion_count_ 
                  << " - deleting: " << ptr << "\\n";
        delete ptr;
    }
    
    size_t getDeletionCount() const { return deletion_count_; }
};

// Deleter especializado para diferentes tipos de recursos
template<typename Resource>
struct ResourceDeleter;

// Especialización para FILE*
template<>
struct ResourceDeleter<FILE> {
    void operator()(FILE* file) const {
        if (file) {
            std::cout << "Closing file handle: " << file << "\\n";
            std::fclose(file);
        }
    }
};

// Especialización para malloc'd memory
template<>
struct ResourceDeleter<void> {
    void operator()(void* ptr) const {
        std::cout << "Freeing malloc'd memory: " << ptr << "\\n";
        std::free(ptr);
    }
};

void demonstrate_function_object_deleters() {
    std::cout << "=== Function Object Deleters Demo ===\\n";
    
    // 1. Array deleter con function object
    {
        auto array_ptr = std::unique_ptr<int[], ArrayDeleter>{
            new int[10], ArrayDeleter{}
        };
        
        // Llenar array
        for (int i = 0; i < 10; ++i) {
            array_ptr[i] = i * i;
        }
        
        std::cout << "Array values: ";
        for (int i = 0; i < 10; ++i) {
            std::cout << array_ptr[i] << " ";
        }
        std::cout << "\\n";
    } // ArrayDeleter se llama automáticamente aquí
    
    // 2. Logging deleter con estado
    {
        LoggingDeleter logger("MainDeleter");
        
        auto ptr1 = std::unique_ptr<int, LoggingDeleter>{
            new int(42), logger
        };
        
        auto ptr2 = std::unique_ptr<int, LoggingDeleter>{
            new int(84), logger
        };
        
        std::cout << "Created two pointers with logging deleters\\n";
        
        // Reset para forzar deletion
        ptr1.reset();
        ptr2.reset(new int(126));
        
        std::cout << "Logger deletion count: " << logger.getDeletionCount() << "\\n";
    }
    
    // 3. Specialized resource deleters
    {
        // FILE* con custom deleter
        auto file_ptr = std::unique_ptr<FILE, ResourceDeleter<FILE>>{
            std::fopen("temp.txt", "w"), ResourceDeleter<FILE>{}
        };
        
        if (file_ptr) {
            std::fprintf(file_ptr.get(), "Hello Custom Deleters!\\n");
        }
        
        // malloc'd memory con custom deleter
        auto malloc_ptr = std::unique_ptr<void, ResourceDeleter<void>>{
            std::malloc(1024), ResourceDeleter<void>{}
        };
        
        if (malloc_ptr) {
            std::memset(malloc_ptr.get(), 0, 1024);
            std::cout << "Allocated and zeroed 1024 bytes\\n";
        }
    } // Automáticamente cierra file y libera malloc'd memory
}

// Deleter que puede cambiar comportamiento en runtime
class ConditionalDeleter {
private:
    bool should_log_;
    bool should_delete_;
    
public:
    ConditionalDeleter(bool log = true, bool delete_ptr = true) 
        : should_log_(log), should_delete_(delete_ptr) {}
    
    void operator()(int* ptr) const {
        if (should_log_) {
            std::cout << "ConditionalDeleter: processing " << ptr << "\\n";
        }
        
        if (should_delete_) {
            delete ptr;
            if (should_log_) {
                std::cout << "ConditionalDeleter: deleted " << ptr << "\\n";
            }
        } else {
            if (should_log_) {
                std::cout << "ConditionalDeleter: NOT deleting " << ptr << "\\n";
            }
        }
    }
};

void demonstrate_conditional_deleters() {
    std::cout << "\\n=== Conditional Deleters Demo ===\\n";
    
    // Normal deletion con logging
    {
        auto ptr1 = std::unique_ptr<int, ConditionalDeleter>{
            new int(100), ConditionalDeleter{true, true}
        };
        std::cout << "ptr1 value: " << *ptr1 << "\\n";
    }
    
    // Solo logging, sin deletion (cuidado - memory leak!)
    {
        int* raw_ptr = new int(200);
        auto ptr2 = std::unique_ptr<int, ConditionalDeleter>{
            raw_ptr, ConditionalDeleter{true, false}
        };
        std::cout << "ptr2 value: " << *ptr2 << "\\n";
        
        // Necesitamos delete manual en este caso
        delete raw_ptr;
    }
    
    // Sin logging, con deletion
    {
        auto ptr3 = std::unique_ptr<int, ConditionalDeleter>{
            new int(300), ConditionalDeleter{false, true}
        };
        std::cout << "ptr3 value: " << *ptr3 << " (deletion será silenciosa)\\n";
    }
}

// Deleter con múltiples tipos de cleanup
template<typename T>
class MultiStageDeleter {
private:
    std::function<void(T*)> pre_delete_hook_;
    std::function<void()> post_delete_hook_;
    
public:
    MultiStageDeleter() = default;
    
    MultiStageDeleter(std::function<void(T*)> pre_hook, 
                     std::function<void()> post_hook = nullptr)
        : pre_delete_hook_(std::move(pre_hook))
        , post_delete_hook_(std::move(post_hook)) {}
    
    void operator()(T* ptr) const {
        if (pre_delete_hook_) {
            pre_delete_hook_(ptr);
        }
        
        delete ptr;
        
        if (post_delete_hook_) {
            post_delete_hook_();
        }
    }
};

void demonstrate_multistage_deleters() {
    std::cout << "\\n=== Multi-Stage Deleters Demo ===\\n";
    
    auto pre_hook = [](int* ptr) {
        std::cout << "Pre-delete: logging value " << *ptr << "\\n";
    };
    
    auto post_hook = []() {
        std::cout << "Post-delete: cleanup completed\\n";
    };
    
    {
        auto ptr = std::unique_ptr<int, MultiStageDeleter<int>>{
            new int(999),
            MultiStageDeleter<int>{pre_hook, post_hook}
        };
        
        std::cout << "Created multi-stage deleter pointer with value: " << *ptr << "\\n";
    } // Multi-stage deletion occurs here
}

int main() {
    demonstrate_function_object_deleters();
    demonstrate_conditional_deleters();
    demonstrate_multistage_deleters();
    
    return 0;
}`,

    lambdas: `// Lambda Deleters - Captura por Valor y Referencia
#include <memory>
#include <iostream>
#include <functional>
#include <vector>
#include <atomic>
#include <mutex>
#include <thread>

// Counter global para tracking
std::atomic<int> global_delete_count{0};
std::mutex delete_log_mutex;

void demonstrate_basic_lambda_deleters() {
    std::cout << "=== Basic Lambda Deleters Demo ===\\n";
    
    // 1. Lambda simple como deleter
    {
        auto simple_deleter = [](int* ptr) {
            std::cout << "Lambda deleter: deleting " << ptr << "\\n";
            delete ptr;
        };
        
        auto ptr = std::unique_ptr<int, decltype(simple_deleter)>{
            new int(42), simple_deleter
        };
        
        std::cout << "Value: " << *ptr << "\\n";
    } // Lambda se ejecuta automáticamente
    
    // 2. Lambda con captura por valor
    {
        std::string owner_name = "MainThread";
        int deletion_id = 1001;
        
        auto capturing_deleter = [owner_name, deletion_id](int* ptr) mutable {
            std::lock_guard<std::mutex> lock(delete_log_mutex);
            std::cout << "[" << owner_name << "] Deletion ID: " << deletion_id 
                      << ", deleting: " << ptr << "\\n";
            ++deletion_id; // mutable permite modificar captured values
            delete ptr;
            ++global_delete_count;
        };
        
        auto ptr1 = std::unique_ptr<int, decltype(capturing_deleter)>{
            new int(100), capturing_deleter
        };
        
        auto ptr2 = std::unique_ptr<int, decltype(capturing_deleter)>{
            new int(200), capturing_deleter
        };
        
        std::cout << "Created two pointers with capturing deleters\\n";
    }
}

// Lambda deleter generator function
template<typename Logger>
auto make_logging_deleter(Logger&& logger, const std::string& context) {
    return [logger = std::forward<Logger>(logger), context](auto* ptr) {
        logger("Deleting in context: " + context + ", ptr: " + 
               std::to_string(reinterpret_cast<std::uintptr_t>(ptr)));
        delete ptr;
    };
}

// Factory para diferentes tipos de lambda deleters
class DeleterFactory {
public:
    // Debug deleter con stack trace simulation
    template<typename T>
    static auto make_debug_deleter(const std::string& file, int line) {
        return [file, line](T* ptr) {
            std::cout << "[DEBUG] Deleting " << typeid(T).name() 
                      << "* at " << ptr << " from " << file << ":" << line << "\\n";
            delete ptr;
        };
    }
    
    // Performance timing deleter
    template<typename T>
    static auto make_timing_deleter() {
        return [](T* ptr) {
            auto start = std::chrono::high_resolution_clock::now();
            delete ptr;
            auto end = std::chrono::high_resolution_clock::now();
            
            auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
            std::cout << "Deletion took: " << duration.count() << " nanoseconds\\n";
        };
    }
    
    // Memory pattern checker deleter
    template<typename T>
    static auto make_pattern_checking_deleter(T pattern_value) {
        return [pattern_value](T* ptr) {
            if (*ptr == pattern_value) {
                std::cout << "✅ Memory pattern check passed\\n";
            } else {
                std::cout << "❌ Memory corruption detected! Expected: " 
                          << pattern_value << ", Found: " << *ptr << "\\n";
            }
            delete ptr;
        };
    }
};

void demonstrate_lambda_deleter_patterns() {
    std::cout << "\\n=== Lambda Deleter Patterns Demo ===\\n";
    
    // 1. Logging deleter generator
    auto console_logger = [](const std::string& msg) {
        std::cout << "[LOG] " << msg << "\\n";
    };
    
    {
        auto deleter = make_logging_deleter(console_logger, "TestContext");
        auto ptr = std::unique_ptr<double, decltype(deleter)>{
            new double(3.14159), std::move(deleter)
        };
        
        std::cout << "Pi value: " << *ptr << "\\n";
    }
    
    // 2. Debug deleter
    {
        auto debug_deleter = DeleterFactory::make_debug_deleter<int>(__FILE__, __LINE__);
        auto ptr = std::unique_ptr<int, decltype(debug_deleter)>{
            new int(12345), std::move(debug_deleter)
        };
        
        std::cout << "Debug value: " << *ptr << "\\n";
    }
    
    // 3. Timing deleter
    {
        auto timing_deleter = DeleterFactory::make_timing_deleter<std::vector<int>>();
        auto ptr = std::unique_ptr<std::vector<int>, decltype(timing_deleter)>{
            new std::vector<int>(10000, 42), std::move(timing_deleter)
        };
        
        std::cout << "Vector size: " << ptr->size() << "\\n";
    }
    
    // 4. Pattern checking deleter
    {
        constexpr int MAGIC_VALUE = 0xDEADBEEF;
        auto checker = DeleterFactory::make_pattern_checking_deleter(MAGIC_VALUE);
        
        auto ptr = std::unique_ptr<int, decltype(checker)>{
            new int(MAGIC_VALUE), std::move(checker)
        };
        
        std::cout << "Pattern value: " << std::hex << *ptr << std::dec << "\\n";
    }
}

// Captura por referencia - cuidados especiales
void demonstrate_reference_capture_deleters() {
    std::cout << "\\n=== Reference Capture Deleters Demo ===\\n";
    
    std::vector<std::string> deletion_log;
    deletion_log.reserve(100);
    
    // ⚠️ PELIGRO: Captura por referencia
    auto dangerous_deleter = [&deletion_log](int* ptr) {
        deletion_log.push_back("Deleted: " + std::to_string(*ptr));
        delete ptr;
    };
    
    // ✅ SEGURO: Scope controlado
    {
        auto ptr1 = std::unique_ptr<int, decltype(dangerous_deleter)>{
            new int(1001), dangerous_deleter
        };
        
        auto ptr2 = std::unique_ptr<int, decltype(dangerous_deleter)>{
            new int(1002), dangerous_deleter
        };
        
        std::cout << "Created pointers with reference-capturing deleters\\n";
        
        // Force early deletion dentro del scope
        ptr1.reset();
        ptr2.reset();
        
        std::cout << "Deletion log entries: " << deletion_log.size() << "\\n";
        for (const auto& entry : deletion_log) {
            std::cout << "  " << entry << "\\n";
        }
        
    } // deletion_log todavía es válido aquí
    
    // ❌ NUNCA hacer esto:
    // auto ptr_outside = std::unique_ptr<int, decltype(dangerous_deleter)>{
    //     new int(999), dangerous_deleter
    // };
    // } // deletion_log se destruye aquí, pero ptr_outside aún existe!
    // // Usar ptr_outside aquí causa undefined behavior
}

// Thread-safe lambda deleters
void demonstrate_threadsafe_lambda_deleters() {
    std::cout << "\\n=== Thread-Safe Lambda Deleters Demo ===\\n";
    
    std::atomic<int> thread_safe_counter{0};
    std::vector<std::thread> threads;
    
    auto thread_safe_deleter = [&thread_safe_counter](int* ptr) {
        int old_count = thread_safe_counter.fetch_add(1);
        
        // Simular algo de work
        std::this_thread::sleep_for(std::chrono::microseconds(10));
        
        std::cout << "Thread " << std::this_thread::get_id() 
                  << " deletion #" << old_count + 1 
                  << ", value: " << *ptr << "\\n";
        delete ptr;
    };
    
    // Crear múltiples threads que usan el mismo deleter
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&thread_safe_deleter, i]() {
            auto ptr = std::unique_ptr<int, decltype(thread_safe_deleter)>{
                new int(1000 + i), thread_safe_deleter
            };
            
            // Simular work
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
        });
    }
    
    // Wait for all threads
    for (auto& thread : threads) {
        thread.join();
    }
    
    std::cout << "Total thread-safe deletions: " << thread_safe_counter.load() << "\\n";
}

int main() {
    demonstrate_basic_lambda_deleters();
    demonstrate_lambda_deleter_patterns();
    demonstrate_reference_capture_deleters();
    demonstrate_threadsafe_lambda_deleters();
    
    std::cout << "\\nTotal global deletions: " << global_delete_count.load() << "\\n";
    
    return 0;
}`,

    resource_management: `// Custom Deleters para Resource Management
#include <memory>
#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <cstdio>
#include <cassert>
#include <thread>
#include <chrono>

// RAII wrapper para FILE* con custom deleter
class FileHandle {
public:
    using FilePtr = std::unique_ptr<FILE, decltype(&std::fclose)>;
    
    static FilePtr open(const std::string& filename, const std::string& mode) {
        FILE* file = std::fopen(filename.c_str(), mode.c_str());
        return FilePtr{file, &std::fclose}; // std::fclose como deleter
    }
    
    // Alternative con lambda deleter más verboso
    static auto open_verbose(const std::string& filename, const std::string& mode) {
        auto verbose_closer = [](FILE* file) {
            if (file) {
                std::cout << "Closing file: " << file << "\\n";
                int result = std::fclose(file);
                if (result == 0) {
                    std::cout << "File closed successfully\\n";
                } else {
                    std::cout << "Warning: Error closing file\\n";
                }
            }
        };
        
        FILE* file = std::fopen(filename.c_str(), mode.c_str());
        return std::unique_ptr<FILE, decltype(verbose_closer)>{file, verbose_closer};
    }
};

void demonstrate_file_resource_management() {
    std::cout << "=== File Resource Management Demo ===\\n";
    
    // 1. Simple file handling con function pointer deleter
    {
        auto file = FileHandle::open("test1.txt", "w");
        if (file) {
            std::fprintf(file.get(), "Hello from custom deleter!\\n");
            std::fprintf(file.get(), "Line 2: Resource management\\n");
            std::cout << "Written data to test1.txt\\n";
        }
    } // File automáticamente cerrado por std::fclose
    
    // 2. Verbose file handling con lambda deleter
    {
        auto file = FileHandle::open_verbose("test2.txt", "w");
        if (file) {
            std::fprintf(file.get(), "Hello from verbose deleter!\\n");
            std::cout << "Written data to test2.txt\\n";
        }
    } // Lambda deleter proporciona logging detallado
}

// Socket-like resource management simulator
class SocketHandle {
private:
    int socket_fd_;
    static inline int next_fd_ = 1000;
    
public:
    explicit SocketHandle(int fd) : socket_fd_(fd) {}
    
    int fd() const { return socket_fd_; }
    
    static int create_socket() {
        int fd = next_fd_++;
        std::cout << "Created socket with FD: " << fd << "\\n";
        return fd;
    }
    
    static void close_socket(int fd) {
        std::cout << "Closing socket with FD: " << fd << "\\n";
        // Simular network cleanup
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
        std::cout << "Socket " << fd << " closed successfully\\n";
    }
};

// Custom deleter para socket resources
struct SocketDeleter {
    void operator()(SocketHandle* handle) const {
        if (handle) {
            SocketHandle::close_socket(handle->fd());
            delete handle;
        }
    }
};

using SocketPtr = std::unique_ptr<SocketHandle, SocketDeleter>;

SocketPtr make_socket() {
    int fd = SocketHandle::create_socket();
    return SocketPtr{new SocketHandle(fd), SocketDeleter{}};
}

void demonstrate_socket_resource_management() {
    std::cout << "\\n=== Socket Resource Management Demo ===\\n";
    
    // Crear múltiples sockets que se cleanup automáticamente
    std::vector<SocketPtr> sockets;
    
    for (int i = 0; i < 5; ++i) {
        sockets.push_back(make_socket());
        std::cout << "Created socket in vector, FD: " << sockets.back()->fd() << "\\n";
    }
    
    // Reset some sockets early
    std::cout << "\\nResetting first two sockets...\\n";
    sockets[0].reset();
    sockets[1].reset();
    
    std::cout << "\\nRemaining sockets:\\n";
    for (size_t i = 2; i < sockets.size(); ++i) {
        if (sockets[i]) {
            std::cout << "  Socket FD: " << sockets[i]->fd() << "\\n";
        }
    }
    
} // Remaining sockets automatically closed

// GPU Resource management simulator
struct GPUResource {
    size_t resource_id;
    size_t memory_size_mb;
    
    GPUResource(size_t id, size_t size) 
        : resource_id(id), memory_size_mb(size) {
        std::cout << "GPU Resource " << resource_id 
                  << " allocated (" << memory_size_mb << "MB)\\n";
    }
};

// Stateful GPU resource deleter
class GPUResourceDeleter {
private:
    mutable size_t total_freed_memory_ = 0;
    std::string gpu_name_;
    
public:
    explicit GPUResourceDeleter(const std::string& name) : gpu_name_(name) {}
    
    void operator()(GPUResource* resource) const {
        if (resource) {
            total_freed_memory_ += resource->memory_size_mb;
            std::cout << "[" << gpu_name_ << "] Freeing GPU resource " 
                      << resource->resource_id << " (" << resource->memory_size_mb << "MB)\\n";
            std::cout << "[" << gpu_name_ << "] Total freed: " 
                      << total_freed_memory_ << "MB\\n";
            delete resource;
        }
    }
    
    size_t getTotalFreedMemory() const { return total_freed_memory_; }
};

using GPUPtr = std::unique_ptr<GPUResource, GPUResourceDeleter>;

GPUPtr allocate_gpu_resource(size_t resource_id, size_t memory_mb, const std::string& gpu_name) {
    return GPUPtr{
        new GPUResource(resource_id, memory_mb),
        GPUResourceDeleter{gpu_name}
    };
}

void demonstrate_gpu_resource_management() {
    std::cout << "\\n=== GPU Resource Management Demo ===\\n";
    
    // Simular allocación de GPU resources
    auto texture1 = allocate_gpu_resource(2001, 256, "RTX4090");
    auto buffer1 = allocate_gpu_resource(2002, 512, "RTX4090");
    auto shader1 = allocate_gpu_resource(2003, 128, "RTX4090");
    
    // Crear segundo GPU context
    auto texture2 = allocate_gpu_resource(3001, 1024, "RTX3080");
    auto buffer2 = allocate_gpu_resource(3002, 768, "RTX3080");
    
    std::cout << "\\nAllocated GPU resources on two different GPUs\\n";
    
    // Early release de algunos resources
    std::cout << "\\nReleasing some resources early...\\n";
    texture1.reset();
    buffer2.reset();
    
} // Remaining resources automatically freed

// Database connection simulator con connection pooling
class DatabaseConnection {
private:
    int connection_id_;
    std::string database_name_;
    static inline int next_id_ = 5000;
    
public:
    DatabaseConnection(const std::string& db_name) 
        : connection_id_(next_id_++), database_name_(db_name) {
        std::cout << "DB Connection " << connection_id_ 
                  << " established to: " << database_name_ << "\\n";
    }
    
    int id() const { return connection_id_; }
    const std::string& database() const { return database_name_; }
    
    void execute(const std::string& query) {
        std::cout << "DB " << connection_id_ << " executing: " << query << "\\n";
    }
};

// Connection pool deleter que retorna conexiones al pool
class ConnectionPoolDeleter {
private:
    std::vector<std::unique_ptr<DatabaseConnection>>& pool_;
    mutable std::mutex& pool_mutex_;
    
public:
    ConnectionPoolDeleter(std::vector<std::unique_ptr<DatabaseConnection>>& pool,
                         std::mutex& mutex) 
        : pool_(pool), pool_mutex_(mutex) {}
    
    void operator()(DatabaseConnection* connection) const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        if (connection) {
            std::cout << "Returning connection " << connection->id() 
                      << " to pool (size: " << pool_.size() << ")\\n";
            
            // En lugar de delete, retornar al pool
            pool_.push_back(std::unique_ptr<DatabaseConnection>{connection});
        }
    }
};

using PooledConnection = std::unique_ptr<DatabaseConnection, ConnectionPoolDeleter>;

class ConnectionManager {
private:
    std::vector<std::unique_ptr<DatabaseConnection>> connection_pool_;
    mutable std::mutex pool_mutex_;
    
public:
    PooledConnection acquire_connection(const std::string& db_name) {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        if (!connection_pool_.empty()) {
            std::cout << "Reusing pooled connection\\n";
            auto connection = connection_pool_.back().release();
            connection_pool_.pop_back();
            
            return PooledConnection{
                connection, 
                ConnectionPoolDeleter{connection_pool_, pool_mutex_}
            };
        } else {
            std::cout << "Creating new connection\\n";
            auto* connection = new DatabaseConnection(db_name);
            
            return PooledConnection{
                connection,
                ConnectionPoolDeleter{connection_pool_, pool_mutex_}
            };
        }
    }
    
    size_t pool_size() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return connection_pool_.size();
    }
};

void demonstrate_connection_pool_management() {
    std::cout << "\\n=== Database Connection Pool Demo ===\\n";
    
    ConnectionManager manager;
    
    // Uso normal de conexiones
    {
        auto conn1 = manager.acquire_connection("UserDB");
        conn1->execute("SELECT * FROM users");
        
        auto conn2 = manager.acquire_connection("ProductDB");
        conn2->execute("SELECT * FROM products");
        
        std::cout << "Current pool size: " << manager.pool_size() << "\\n";
        
        {
            auto conn3 = manager.acquire_connection("OrderDB");
            conn3->execute("INSERT INTO orders VALUES (...)");
            
        } // conn3 retorna al pool aquí
        
        std::cout << "Pool size after conn3 return: " << manager.pool_size() << "\\n";
        
    } // conn1 y conn2 retornan al pool aquí
    
    std::cout << "Final pool size: " << manager.pool_size() << "\\n";
    
    // Reusar conexiones del pool
    {
        auto reused_conn = manager.acquire_connection("TestDB");
        reused_conn->execute("SELECT COUNT(*) FROM test_table");
        
    } // Conexión retorna al pool nuevamente
    
    std::cout << "Pool size after reuse: " << manager.pool_size() << "\\n";
}

int main() {
    demonstrate_file_resource_management();
    demonstrate_socket_resource_management();
    demonstrate_gpu_resource_management();
    demonstrate_connection_pool_management();
    
    std::cout << "\\n=== All resources properly managed and cleaned up ===\\n";
    
    return 0;
}`,

    memory_pools: `// Memory Pool Custom Deleters - Advanced Allocation Strategies
#include <memory>
#include <iostream>
#include <vector>
#include <array>
#include <cstddef>
#include <new>
#include <mutex>
#include <thread>
#include <chrono>
#include <cassert>

// Simple Memory Pool Implementation
template<typename T, size_t PoolSize>
class MemoryPool {
private:
    alignas(T) std::array<std::byte, sizeof(T) * PoolSize> storage_;
    std::vector<T*> free_blocks_;
    mutable std::mutex pool_mutex_;
    size_t allocated_count_ = 0;
    size_t total_allocations_ = 0;
    size_t total_deallocations_ = 0;
    
public:
    MemoryPool() {
        // Inicializar todos los bloques como libres
        free_blocks_.reserve(PoolSize);
        for (size_t i = 0; i < PoolSize; ++i) {
            T* block_ptr = reinterpret_cast<T*>(storage_.data() + i * sizeof(T));
            free_blocks_.push_back(block_ptr);
        }
    }
    
    ~MemoryPool() {
        std::cout << "MemoryPool destructor - Stats:\\n";
        std::cout << "  Total allocations: " << total_allocations_ << "\\n";
        std::cout << "  Total deallocations: " << total_deallocations_ << "\\n";
        std::cout << "  Leaked objects: " << allocated_count_ << "\\n";
    }
    
    T* allocate() {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        if (free_blocks_.empty()) {
            throw std::bad_alloc{};
        }
        
        T* ptr = free_blocks_.back();
        free_blocks_.pop_back();
        ++allocated_count_;
        ++total_allocations_;
        
        std::cout << "Pool allocated: " << ptr 
                  << " (free blocks: " << free_blocks_.size() << ")\\n";
        
        return ptr;
    }
    
    void deallocate(T* ptr) {
        if (!ptr) return;
        
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        // Verificar que el pointer pertenece a este pool
        std::byte* pool_start = storage_.data();
        std::byte* pool_end = pool_start + storage_.size();
        std::byte* ptr_byte = reinterpret_cast<std::byte*>(ptr);
        
        if (ptr_byte < pool_start || ptr_byte >= pool_end) {
            std::cout << "ERROR: Pointer " << ptr << " does not belong to this pool!\\n";
            return;
        }
        
        // Verificar alineamiento
        std::ptrdiff_t offset = ptr_byte - pool_start;
        if (offset % sizeof(T) != 0) {
            std::cout << "ERROR: Misaligned pointer " << ptr << "!\\n";
            return;
        }
        
        free_blocks_.push_back(ptr);
        --allocated_count_;
        ++total_deallocations_;
        
        std::cout << "Pool deallocated: " << ptr 
                  << " (free blocks: " << free_blocks_.size() << ")\\n";
    }
    
    size_t available_blocks() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return free_blocks_.size();
    }
    
    size_t allocated_blocks() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return allocated_count_;
    }
    
    double utilization() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return static_cast<double>(allocated_count_) / PoolSize;
    }
};

// Pool deleter que retorna memoria al pool en lugar de delete
template<typename T, size_t PoolSize>
class PoolDeleter {
private:
    MemoryPool<T, PoolSize>* pool_;
    
public:
    explicit PoolDeleter(MemoryPool<T, PoolSize>* pool) : pool_(pool) {}
    
    void operator()(T* ptr) const {
        if (ptr && pool_) {
            // Llamar destructor manualmente
            ptr->~T();
            // Retornar memoria al pool
            pool_->deallocate(ptr);
        }
    }
    
    MemoryPool<T, PoolSize>* get_pool() const { return pool_; }
};

// Factory function para crear unique_ptr con pool deleter
template<typename T, size_t PoolSize, typename... Args>
auto make_pooled(MemoryPool<T, PoolSize>& pool, Args&&... args) {
    T* raw_ptr = pool.allocate();
    
    // Construir objeto in-place
    new (raw_ptr) T(std::forward<Args>(args)...);
    
    using DeleterType = PoolDeleter<T, PoolSize>;
    return std::unique_ptr<T, DeleterType>{raw_ptr, DeleterType{&pool}};
}

void demonstrate_basic_memory_pool() {
    std::cout << "=== Basic Memory Pool Demo ===\\n";
    
    MemoryPool<int, 10> int_pool;
    
    std::cout << "Initial available blocks: " << int_pool.available_blocks() << "\\n";
    
    // Crear objetos usando el pool
    std::vector<std::unique_ptr<int, PoolDeleter<int, 10>>> pooled_ints;
    
    for (int i = 0; i < 5; ++i) {
        auto ptr = make_pooled(int_pool, i * 100);
        std::cout << "Created pooled int with value: " << *ptr << "\\n";
        pooled_ints.push_back(std::move(ptr));
    }
    
    std::cout << "Available blocks after 5 allocations: " << int_pool.available_blocks() << "\\n";
    std::cout << "Pool utilization: " << (int_pool.utilization() * 100) << "%\\n";
    
    // Liberar algunos objetos temprano
    std::cout << "\\nReleasing first 3 objects...\\n";
    pooled_ints.erase(pooled_ints.begin(), pooled_ints.begin() + 3);
    
    std::cout << "Available blocks after early release: " << int_pool.available_blocks() << "\\n";
    
    // Reasignar usando bloques liberados
    std::cout << "\\nCreating new objects (should reuse freed blocks)...\\n";
    for (int i = 0; i < 3; ++i) {
        auto ptr = make_pooled(int_pool, 500 + i);
        std::cout << "Created reused pooled int with value: " << *ptr << "\\n";
        pooled_ints.push_back(std::move(ptr));
    }
    
    std::cout << "Final available blocks: " << int_pool.available_blocks() << "\\n";
}

// Specialized pool para objetos más complejos
struct ComplexObject {
    std::vector<int> data;
    std::string name;
    double value;
    
    ComplexObject(const std::string& n, double v, size_t data_size = 10) 
        : name(n), value(v), data(data_size, static_cast<int>(v)) {
        std::cout << "ComplexObject '" << name << "' constructed\\n";
    }
    
    ~ComplexObject() {
        std::cout << "ComplexObject '" << name << "' destroyed\\n";
    }
    
    void print_info() const {
        std::cout << "ComplexObject: " << name << ", value=" << value 
                  << ", data_size=" << data.size() << "\\n";
    }
};

void demonstrate_complex_object_pool() {
    std::cout << "\\n=== Complex Object Pool Demo ===\\n";
    
    MemoryPool<ComplexObject, 5> complex_pool;
    
    {
        auto obj1 = make_pooled(complex_pool, "Object1", 1.5, 20);
        auto obj2 = make_pooled(complex_pool, "Object2", 2.5, 30);
        
        obj1->print_info();
        obj2->print_info();
        
        std::cout << "Pool utilization: " << (complex_pool.utilization() * 100) << "%\\n";
        
        {
            auto obj3 = make_pooled(complex_pool, "Object3", 3.5, 15);
            obj3->print_info();
            
        } // obj3 destruye aquí, retorna al pool
        
        std::cout << "After obj3 destruction - Available blocks: " 
                  << complex_pool.available_blocks() << "\\n";
        
        // Crear nuevo objeto que reutiliza el bloque de obj3
        auto obj4 = make_pooled(complex_pool, "Object4", 4.5, 25);
        obj4->print_info();
        
    } // obj1, obj2, obj4 se destruyen aquí
    
    std::cout << "All objects destroyed - Available blocks: " 
              << complex_pool.available_blocks() << "\\n";
}

// Thread-safe pool stress test
void demonstrate_threaded_pool_usage() {
    std::cout << "\\n=== Threaded Pool Usage Demo ===\\n";
    
    MemoryPool<int, 20> shared_pool;
    std::vector<std::thread> threads;
    std::atomic<int> total_operations{0};
    
    constexpr int num_threads = 4;
    constexpr int operations_per_thread = 10;
    
    for (int t = 0; t < num_threads; ++t) {
        threads.emplace_back([&shared_pool, &total_operations, t, operations_per_thread]() {
            for (int i = 0; i < operations_per_thread; ++i) {
                try {
                    auto obj = make_pooled(shared_pool, t * 1000 + i);
                    
                    std::cout << "Thread " << t << " created object with value: " 
                              << *obj << "\\n";
                    
                    // Simular algún work
                    std::this_thread::sleep_for(std::chrono::milliseconds(10));
                    
                    total_operations.fetch_add(1);
                    
                } catch (const std::bad_alloc& e) {
                    std::cout << "Thread " << t << " failed to allocate (pool full)\\n";
                }
            }
        });
    }
    
    // Monitoring thread
    std::thread monitor([&shared_pool, &total_operations]() {
        while (total_operations.load() < num_threads * operations_per_thread) {
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            std::cout << "[MONITOR] Pool utilization: " 
                      << (shared_pool.utilization() * 100) << "%, "
                      << "Operations completed: " << total_operations.load() << "\\n";
        }
    });
    
    // Wait for all threads
    for (auto& thread : threads) {
        thread.join();
    }
    
    monitor.join();
    
    std::cout << "All threads completed. Final pool stats:\\n";
    std::cout << "  Available blocks: " << shared_pool.available_blocks() << "\\n";
    std::cout << "  Allocated blocks: " << shared_pool.allocated_blocks() << "\\n";
    std::cout << "  Total operations: " << total_operations.load() << "\\n";
}

// Pool exhaustion handling
void demonstrate_pool_exhaustion() {
    std::cout << "\\n=== Pool Exhaustion Demo ===\\n";
    
    MemoryPool<int, 3> small_pool; // Muy pequeño para test
    std::vector<std::unique_ptr<int, PoolDeleter<int, 3>>> objects;
    
    std::cout << "Attempting to allocate more objects than pool capacity...\\n";
    
    for (int i = 0; i < 5; ++i) {
        try {
            auto obj = make_pooled(small_pool, i * 10);
            std::cout << "Successfully allocated object " << i << " with value: " << *obj << "\\n";
            objects.push_back(std::move(obj));
            
        } catch (const std::bad_alloc& e) {
            std::cout << "Allocation " << i << " failed: pool exhausted\\n";
            break;
        }
    }
    
    std::cout << "Pool utilization: " << (small_pool.utilization() * 100) << "%\\n";
    
    // Liberar un objeto y intentar de nuevo
    std::cout << "\\nReleasing one object and trying again...\\n";
    objects.pop_back();
    
    try {
        auto new_obj = make_pooled(small_pool, 999);
        std::cout << "Successfully allocated after release: " << *new_obj << "\\n";
        objects.push_back(std::move(new_obj));
        
    } catch (const std::bad_alloc& e) {
        std::cout << "Allocation still failed\\n";
    }
    
    std::cout << "Final pool utilization: " << (small_pool.utilization() * 100) << "%\\n";
}

int main() {
    demonstrate_basic_memory_pool();
    demonstrate_complex_object_pool();
    demonstrate_threaded_pool_usage();
    demonstrate_pool_exhaustion();
    
    std::cout << "\\n=== All pool demonstrations completed ===\\n";
    
    return 0;
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 75: Custom Deleters" : "Lección 75: Deleters Personalizados"}
      lessonId="lesson-75"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'Advanced Resource Management with Custom Deleters' : 'Gestión Avanzada de Recursos con Deleters Personalizados'}
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
                  'Master function objects, lambdas, and function pointers as custom deleters',
                  'Implement stateful deleters with capture semantics and resource tracking',
                  'Design RAII wrappers for file handles, sockets, GPU memory, and database connections',
                  'Create memory pool deleters for high-performance allocation strategies',
                  'Understand performance implications of different deleter types',
                  'Apply type erasure with std::function deleters for flexible designs',
                  'Debug resource leaks and implement custom leak detection systems',
                  'Build production-ready custom deleters for C library integration'
                ]
              : [
                  'Dominar objetos función, lambdas y punteros a función como deleters personalizados',
                  'Implementar deleters con estado con semántica de captura y tracking de recursos',
                  'Diseñar wrappers RAII para file handles, sockets, memoria GPU y conexiones de BD',
                  'Crear deleters de memory pool para estrategias de allocación de alto rendimiento',
                  'Entender implicaciones de rendimiento de diferentes tipos de deleter',
                  'Aplicar type erasure con std::function deleters para diseños flexibles',
                  'Debuggear leaks de recursos e implementar sistemas de detección personalizados',
                  'Construir deleters personalizados production-ready para integración con librerías C'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive Custom Deleters Demonstration' : 'Demostración Interactiva de Deleters Personalizados'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <CustomDeletersVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('function_objects')}
            variant={state.scenario === 'function_objects' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Function Objects' : 'Objetos Función'}
          </Button>
          <Button 
            onClick={() => runScenario('lambdas')}
            variant={state.scenario === 'lambdas' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Lambda Deleters' : 'Deleters Lambda'}
          </Button>
          <Button 
            onClick={() => runScenario('resource_management')}
            variant={state.scenario === 'resource_management' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Resource Management' : 'Gestión de Recursos'}
          </Button>
          <Button 
            onClick={() => runScenario('memory_pools')}
            variant={state.scenario === 'memory_pools' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Memory Pools' : 'Memory Pools'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Deletions' : 'Eliminaciones', 
              value: state.deletions,
              color: '#ff4080'
            },
            { 
              label: state.language === 'en' ? 'Resources Managed' : 'Recursos Gestionados', 
              value: state.resourcesManaged,
              color: '#4080ff'
            },
            { 
              label: state.language === 'en' ? 'Pool Hits' : 'Hits de Pool', 
              value: state.memoryPoolHits,
              color: '#80ff40'
            },
            { 
              label: state.language === 'en' ? 'Performance %' : 'Rendimiento %', 
              value: Math.round(state.performanceBenefit),
              color: '#ff8040'
            },
            { 
              label: state.language === 'en' ? 'Leaks Detected' : 'Leaks Detectados', 
              value: state.leaksDetected,
              color: '#ff0080'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'function_objects' && (state.language === 'en' ? 'Function Objects as Deleters' : 'Objetos Función como Deleters')}
          {state.scenario === 'lambdas' && (state.language === 'en' ? 'Lambda Deleters with Capture Semantics' : 'Deleters Lambda con Semántica de Captura')}
          {state.scenario === 'resource_management' && (state.language === 'en' ? 'RAII Resource Management' : 'Gestión RAII de Recursos')}
          {state.scenario === 'memory_pools' && (state.language === 'en' ? 'Memory Pool Custom Deleters' : 'Deleters Personalizados de Memory Pool')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'function_objects' ? 
              (state.language === 'en' ? 'Function Object Deleters' : 'Deleters de Objetos Función') :
            state.scenario === 'lambdas' ? 
              (state.language === 'en' ? 'Lambda Deleter Patterns' : 'Patrones de Deleters Lambda') :
            state.scenario === 'resource_management' ? 
              (state.language === 'en' ? 'Resource Management Implementation' : 'Implementación de Gestión de Recursos') :
            (state.language === 'en' ? 'Memory Pool Deleter System' : 'Sistema de Deleters de Memory Pool')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Custom Deleter Design Patterns' : 'Patrones de Diseño de Deleters Personalizados'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #333'
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🎯 Core Deleter Types:' : '🎯 Tipos Principales de Deleters:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Function Objects:' : 'Objetos Función:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Stateful deleters with member variables for tracking and configuration'
                : 'Deleters con estado con variables miembro para tracking y configuración'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Lambda Deleters:' : 'Deleters Lambda:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Inline deleters with capture semantics for context-aware cleanup'
                : 'Deleters inline con semántica de captura para cleanup consciente del contexto'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Function Pointers:' : 'Punteros a Función:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Lightweight deleters for C library integration and simple cleanup'
                : 'Deleters ligeros para integración con librerías C y cleanup simple'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Type-Erased Deleters:' : 'Deleters con Type Erasure:'}</strong>{' '}
              {state.language === 'en' 
                ? 'std::function-based deleters for runtime polymorphic behavior'
                : 'Deleters basados en std::function para comportamiento polimórfico en runtime'
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
            {state.language === 'en' ? '⚠️ Critical Considerations:' : '⚠️ Consideraciones Críticas:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Capture Lifetimes:' : 'Tiempos de Vida de Captura:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Lambda capture by reference requires careful lifetime management'
                : 'La captura por referencia en lambdas requiere gestión cuidadosa del tiempo de vida'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Exception Safety:' : 'Seguridad de Excepciones:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Custom deleters must never throw exceptions during cleanup'
                : 'Los deleters personalizados nunca deben lanzar excepciones durante el cleanup'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Performance Overhead:' : 'Overhead de Rendimiento:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Complex deleters add call overhead; measure in performance-critical code'
                : 'Los deleters complejos añaden overhead de llamada; medir en código crítico de rendimiento'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Resource Ordering:' : 'Orden de Recursos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Ensure proper cleanup order for interdependent resources'
                : 'Asegurar orden apropiado de cleanup para recursos interdependientes'
              }
            </li>
          </ul>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Production Implementation Patterns' : 'Patrones de Implementación en Producción'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a2e1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #080'
        }}>
          <h4 style={{ color: '#88ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '💡 Advanced Use Cases:' : '💡 Casos de Uso Avanzados:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'RAII Wrappers:' : 'Wrappers RAII:'}</strong>{' '}
              {state.language === 'en' 
                ? 'File handles, sockets, GPU resources, database connections'
                : 'File handles, sockets, recursos GPU, conexiones de base de datos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Memory Pool Management:' : 'Gestión de Memory Pool:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Return objects to pools instead of system delete for performance'
                : 'Retornar objetos a pools en lugar de delete del sistema para rendimiento'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Debug and Profiling:' : 'Debug y Profiling:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Leak detection, allocation tracking, performance timing'
                : 'Detección de leaks, tracking de allocación, timing de rendimiento'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'API Integration:' : 'Integración de API:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Wrap C libraries with proper cleanup semantics'
                : 'Envolver librerías C con semántica apropiada de cleanup'
              }
            </li>
          </ul>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Practice Exercises' : 'Ejercicios Prácticos'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#2e2e1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #880'
        }}>
          <h4 style={{ color: '#ffff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🔧 Implementation Challenges:' : '🔧 Desafíos de Implementación:'}
          </h4>
          <ol style={{ color: '#e0e0e0', lineHeight: '1.8' }}>
            <li>
              <strong>{state.language === 'en' ? 'Thread-Safe Pool Deleter:' : 'Pool Deleter Thread-Safe:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Implement a memory pool with concurrent access and proper synchronization'
                : 'Implementar un memory pool con acceso concurrente y sincronización apropiada'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Resource Manager:' : 'Gestor de Recursos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Build a deleter that manages multiple resource types (files, sockets, memory)'
                : 'Construir un deleter que gestione múltiples tipos de recursos (archivos, sockets, memoria)'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Leak Detection System:' : 'Sistema de Detección de Leaks:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Create deleters with comprehensive allocation tracking and leak reporting'
                : 'Crear deleters con tracking integral de allocaciones y reporte de leaks'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'C Library Wrapper:' : 'Wrapper de Librería C:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Wrap a C library (like OpenSSL or SQLite) with RAII and custom deleters'
                : 'Envolver una librería C (como OpenSSL o SQLite) con RAII y deleters personalizados'
              }
            </li>
          </ol>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default Lesson75_CustomDeleters;