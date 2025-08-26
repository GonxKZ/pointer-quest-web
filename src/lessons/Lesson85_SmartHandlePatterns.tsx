/**
 * Lesson 85: Smart Handle Patterns
 * Advanced RAII evolution with template-based smart handles
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
  PerformanceComparison,
  UndefinedBehaviorWarning
} from '../design-system';

interface SmartHandleState {
  language: 'en' | 'es';
  scenario: 'template_handles' | 'reference_counting' | 'weak_handles' | 'handle_hierarchies' | 'thread_safe' | 'observability';
  isAnimating: boolean;
  handleCount: number;
  referenceCount: number;
  weakReferences: number;
  cycleDetection: boolean;
  threadSafety: number;
  observabilityLevel: number;
}

// 3D Visualización de Smart Handle Patterns
const SmartHandleVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'template_handles') {
      groupRef.current.rotation.y = animationRef.current * 0.4;
      onMetrics({
        handleCount: Math.floor(8 + Math.sin(animationRef.current * 2) * 6),
        referenceCount: Math.floor(12 + Math.cos(animationRef.current * 1.5) * 8),
        weakReferences: Math.floor(4 + Math.sin(animationRef.current) * 3),
        cycleDetection: Math.sin(animationRef.current * 3) > 0,
        threadSafety: 85 + Math.cos(animationRef.current) * 12,
        observabilityLevel: Math.floor(animationRef.current * 15) % 100
      });
    } else if (scenario === 'reference_counting') {
      groupRef.current.rotation.x = Math.sin(animationRef.current) * 0.2;
      onMetrics({
        handleCount: Math.floor(6 + Math.cos(animationRef.current * 2.5) * 4),
        referenceCount: Math.floor(20 + Math.sin(animationRef.current * 2) * 15),
        weakReferences: Math.floor(8 + Math.cos(animationRef.current * 1.8) * 6),
        cycleDetection: true,
        threadSafety: 90 + Math.sin(animationRef.current) * 8,
        observabilityLevel: Math.floor(animationRef.current * 12) % 100
      });
    } else if (scenario === 'weak_handles') {
      groupRef.current.rotation.z = Math.cos(animationRef.current) * 0.15;
      onMetrics({
        handleCount: Math.floor(5 + Math.sin(animationRef.current * 1.8) * 3),
        referenceCount: Math.floor(8 + Math.cos(animationRef.current * 2.2) * 5),
        weakReferences: Math.floor(15 + Math.sin(animationRef.current * 2.5) * 10),
        cycleDetection: false,
        threadSafety: 75 + Math.cos(animationRef.current * 2) * 20,
        observabilityLevel: Math.floor(animationRef.current * 18) % 100
      });
    } else if (scenario === 'handle_hierarchies') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      groupRef.current.rotation.x = Math.sin(animationRef.current * 0.5) * 0.1;
      onMetrics({
        handleCount: Math.floor(12 + Math.sin(animationRef.current * 1.5) * 8),
        referenceCount: Math.floor(25 + Math.cos(animationRef.current * 2) * 18),
        weakReferences: Math.floor(6 + Math.sin(animationRef.current * 2.8) * 4),
        cycleDetection: true,
        threadSafety: 80 + Math.sin(animationRef.current * 1.2) * 15,
        observabilityLevel: Math.floor(animationRef.current * 20) % 100
      });
    } else if (scenario === 'thread_safe') {
      groupRef.current.rotation.y = animationRef.current * 0.5;
      onMetrics({
        handleCount: Math.floor(10 + Math.cos(animationRef.current * 3) * 7),
        referenceCount: Math.floor(18 + Math.sin(animationRef.current * 2.5) * 12),
        weakReferences: Math.floor(7 + Math.cos(animationRef.current * 2) * 5),
        cycleDetection: true,
        threadSafety: 95 + Math.sin(animationRef.current) * 4,
        observabilityLevel: Math.floor(animationRef.current * 25) % 100
      });
    } else {
      // observability
      groupRef.current.rotation.x = Math.sin(animationRef.current * 2) * 0.1;
      groupRef.current.rotation.z = Math.cos(animationRef.current * 1.5) * 0.1;
      onMetrics({
        handleCount: Math.floor(14 + Math.sin(animationRef.current * 2.2) * 10),
        referenceCount: Math.floor(30 + Math.cos(animationRef.current * 1.8) * 20),
        weakReferences: Math.floor(12 + Math.sin(animationRef.current * 2.5) * 8),
        cycleDetection: Math.sin(animationRef.current * 4) > 0,
        threadSafety: 88 + Math.cos(animationRef.current * 2) * 10,
        observabilityLevel: Math.floor(animationRef.current * 30) % 100
      });
    }
  });

  const renderHandleNodes = () => {
    const elements = [];
    const nodeCount = scenario === 'handle_hierarchies' ? 20 : scenario === 'observability' ? 24 : 16;
    
    for (let i = 0; i < nodeCount; i++) {
      let x, y, z;
      
      if (scenario === 'template_handles') {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 2.5 + (i % 2) * 0.4;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = Math.sin(i * 0.8) * 0.3;
      } else if (scenario === 'reference_counting') {
        const layer = Math.floor(i / 8);
        const angle = (i % 8) * Math.PI / 4;
        const radius = 1.5 + layer * 0.8;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = layer * 0.5 - 0.5;
      } else if (scenario === 'weak_handles') {
        x = (i % 4) * 1.4 - 2.1;
        y = Math.floor(i / 4) * 1.4 - 2.1;
        z = Math.sin(animationRef.current + i * 0.3) * 0.4;
      } else if (scenario === 'handle_hierarchies') {
        // Tree structure
        const level = Math.floor(Math.log2(i + 1));
        const posInLevel = i - (Math.pow(2, level) - 1);
        const levelWidth = Math.pow(2, level);
        x = (posInLevel - levelWidth / 2 + 0.5) * (4 / levelWidth);
        y = 3 - level * 1.2;
        z = Math.sin(i * 0.5) * 0.2;
      } else if (scenario === 'thread_safe') {
        const ring = Math.floor(i / 4);
        const angle = (i % 4) * Math.PI / 2;
        const radius = 1.2 + ring * 0.7;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = Math.cos(animationRef.current * 2 + i * 0.4) * 0.3;
      } else {
        // observability - complex network
        const row = Math.floor(i / 6);
        const col = i % 6;
        x = col * 0.8 - 2;
        y = row * 0.8 - 1.6;
        z = Math.sin(animationRef.current + i * 0.2) * 0.2;
      }
      
      const color = scenario === 'template_handles'
        ? (i % 3 === 0 ? '#00ff00' : i % 3 === 1 ? '#00ffff' : '#ffff00')
        : scenario === 'reference_counting'
        ? (i % 2 === 0 ? '#ff6600' : '#ff9900')
        : scenario === 'weak_handles'
        ? (i % 2 === 0 ? '#8080ff' : '#4040ff')
        : scenario === 'handle_hierarchies'
        ? '#00ff88'
        : scenario === 'thread_safe'
        ? '#ff0080'
        : '#ffffff';

      const scale = scenario === 'weak_handles' && i % 3 === 2 ? 0.15 : 0.2;
      
      elements.push(
        <mesh key={i} position={[x, y, z]} scale={[scale, scale, scale]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );

      // Add connections for hierarchical patterns
      if (scenario === 'handle_hierarchies' && i > 0) {
        const parentIndex = Math.floor((i - 1) / 2);
        if (parentIndex >= 0) {
          const parentAngle = Math.atan2(y, x);
          const connectionLength = Math.sqrt(x * x + y * y) * 0.8;
          elements.push(
            <mesh key={`connection-${i}`} 
                  position={[x * 0.5, y * 0.5, z * 0.5]} 
                  rotation={[0, 0, parentAngle]}>
              <cylinderGeometry args={[0.02, 0.02, connectionLength, 8]} />
              <meshBasicMaterial color="#666666" />
            </mesh>
          );
        }
      }
    }
    
    return elements;
  };

  return (
    <group ref={groupRef}>
      {renderHandleNodes()}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, 5]} intensity={0.5} />
      <pointLight position={[0, 0, -5]} intensity={0.3} />
    </group>
  );
};

const Lesson85_SmartHandlePatterns: React.FC = () => {
  const [state, setState] = useState<SmartHandleState>({
    language: 'en',
    scenario: 'template_handles',
    isAnimating: false,
    handleCount: 0,
    referenceCount: 0,
    weakReferences: 0,
    cycleDetection: false,
    threadSafety: 0,
    observabilityLevel: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: SmartHandleState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      template_handles: state.language === 'en' ? 'Template Handles' : 'Handles de Template',
      reference_counting: state.language === 'en' ? 'Reference Counting' : 'Conteo de Referencias',
      weak_handles: state.language === 'en' ? 'Weak Handles' : 'Handles Débiles',
      handle_hierarchies: state.language === 'en' ? 'Handle Hierarchies' : 'Jerarquías de Handles',
      thread_safe: state.language === 'en' ? 'Thread-Safe Handles' : 'Handles Thread-Safe',
      observability: state.language === 'en' ? 'Observable Handles' : 'Handles Observables'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    template_handles: `// Template-based Smart Handle Implementation
#include <memory>
#include <functional>
#include <type_traits>
#include <atomic>
#include <utility>

template<typename Resource, typename Deleter = std::default_delete<Resource>>
class SmartHandle {
private:
    Resource* resource_;
    Deleter deleter_;
    std::atomic<int>* ref_count_;
    
    void cleanup() {
        if (ref_count_ && ref_count_->fetch_sub(1) == 1) {
            if (resource_) {
                deleter_(resource_);
            }
            delete ref_count_;
        }
    }
    
public:
    // Constructor for new resource
    explicit SmartHandle(Resource* res = nullptr, Deleter del = Deleter{})
        : resource_(res), deleter_(std::move(del)), 
          ref_count_(res ? new std::atomic<int>(1) : nullptr) {}
    
    // Copy constructor
    SmartHandle(const SmartHandle& other)
        : resource_(other.resource_), deleter_(other.deleter_), 
          ref_count_(other.ref_count_) {
        if (ref_count_) {
            ref_count_->fetch_add(1);
        }
    }
    
    // Move constructor
    SmartHandle(SmartHandle&& other) noexcept
        : resource_(other.resource_), deleter_(std::move(other.deleter_)),
          ref_count_(other.ref_count_) {
        other.resource_ = nullptr;
        other.ref_count_ = nullptr;
    }
    
    // Copy assignment
    SmartHandle& operator=(const SmartHandle& other) {
        if (this != &other) {
            cleanup();
            resource_ = other.resource_;
            deleter_ = other.deleter_;
            ref_count_ = other.ref_count_;
            if (ref_count_) {
                ref_count_->fetch_add(1);
            }
        }
        return *this;
    }
    
    // Move assignment
    SmartHandle& operator=(SmartHandle&& other) noexcept {
        if (this != &other) {
            cleanup();
            resource_ = other.resource_;
            deleter_ = std::move(other.deleter_);
            ref_count_ = other.ref_count_;
            other.resource_ = nullptr;
            other.ref_count_ = nullptr;
        }
        return *this;
    }
    
    ~SmartHandle() { cleanup(); }
    
    // Access operators
    Resource& operator*() const { return *resource_; }
    Resource* operator->() const { return resource_; }
    Resource* get() const { return resource_; }
    
    // Utility functions
    explicit operator bool() const { return resource_ != nullptr; }
    int use_count() const { 
        return ref_count_ ? ref_count_->load() : 0; 
    }
    
    // Reset with new resource
    void reset(Resource* new_res = nullptr, Deleter new_del = Deleter{}) {
        SmartHandle temp(new_res, std::move(new_del));
        swap(temp);
    }
    
    void swap(SmartHandle& other) noexcept {
        std::swap(resource_, other.resource_);
        std::swap(deleter_, other.deleter_);
        std::swap(ref_count_, other.ref_count_);
    }
};

// Custom deleter for different resource types
template<typename T>
struct ArrayDeleter {
    void operator()(T* ptr) const {
        delete[] ptr;
    }
};

template<typename T>
struct FunctionDeleter {
    std::function<void(T*)> deleter_func;
    
    explicit FunctionDeleter(std::function<void(T*)> func)
        : deleter_func(std::move(func)) {}
    
    void operator()(T* ptr) const {
        if (deleter_func) {
            deleter_func(ptr);
        }
    }
};

// Factory functions for different handle types
template<typename T, typename... Args>
SmartHandle<T> make_handle(Args&&... args) {
    return SmartHandle<T>(new T(std::forward<Args>(args)...));
}

template<typename T>
SmartHandle<T, ArrayDeleter<T>> make_array_handle(size_t count) {
    return SmartHandle<T, ArrayDeleter<T>>(new T[count], ArrayDeleter<T>{});
}

template<typename T>
SmartHandle<T, FunctionDeleter<T>> make_custom_handle(
    T* resource, std::function<void(T*)> deleter) {
    return SmartHandle<T, FunctionDeleter<T>>(
        resource, FunctionDeleter<T>(std::move(deleter)));
}

// Example usage with GPU resources
class GPUResource {
private:
    unsigned int buffer_id_;
    size_t size_;
    
public:
    GPUResource(size_t size) : size_(size) {
        // Simulate GPU buffer allocation
        buffer_id_ = generate_buffer_id();
        allocate_gpu_memory(buffer_id_, size);
        std::cout << "Allocated GPU buffer " << buffer_id_ 
                  << " with " << size << " bytes\\n";
    }
    
    ~GPUResource() {
        deallocate_gpu_memory(buffer_id_);
        std::cout << "Deallocated GPU buffer " << buffer_id_ << "\\n";
    }
    
    void bind() const {
        bind_gpu_buffer(buffer_id_);
    }
    
    void upload_data(const void* data, size_t offset, size_t count) {
        upload_to_gpu_buffer(buffer_id_, data, offset, count);
    }
    
    unsigned int id() const { return buffer_id_; }
    size_t size() const { return size_; }
    
private:
    static unsigned int generate_buffer_id() {
        static unsigned int next_id = 1;
        return next_id++;
    }
    
    void allocate_gpu_memory(unsigned int id, size_t size) {
        // Simulate GPU allocation
        std::this_thread::sleep_for(std::chrono::microseconds(100));
    }
    
    void deallocate_gpu_memory(unsigned int id) {
        // Simulate GPU deallocation
        std::this_thread::sleep_for(std::chrono::microseconds(50));
    }
    
    void bind_gpu_buffer(unsigned int id) {
        // Simulate buffer binding
    }
    
    void upload_to_gpu_buffer(unsigned int id, const void* data, 
                             size_t offset, size_t count) {
        // Simulate data upload
        std::this_thread::sleep_for(std::chrono::microseconds(10));
    }
};

void demonstrate_template_handles() {
    std::cout << "=== Template-based Smart Handles ===\\n";
    
    // Create GPU resource handle
    auto gpu_buffer = make_handle<GPUResource>(1024 * 1024); // 1MB buffer
    
    std::cout << "Created GPU buffer handle, use count: " 
              << gpu_buffer.use_count() << "\\n";
    
    // Share the resource
    {
        auto shared_buffer = gpu_buffer;
        std::cout << "After copying, use count: " 
                  << gpu_buffer.use_count() << "\\n";
        
        shared_buffer->bind();
        
        std::vector<float> data(1000, 3.14f);
        shared_buffer->upload_data(data.data(), 0, data.size() * sizeof(float));
        
    } // shared_buffer goes out of scope
    
    std::cout << "After scope exit, use count: " 
              << gpu_buffer.use_count() << "\\n";
    
    // Array handle example
    auto array_handle = make_array_handle<int>(100);
    std::cout << "Created array handle, use count: " 
              << array_handle.use_count() << "\\n";
    
    // Custom deleter example
    FILE* file = fopen("temp.txt", "w");
    auto file_handle = make_custom_handle(file, [](FILE* f) {
        if (f) {
            std::cout << "Closing file with custom deleter\\n";
            fclose(f);
        }
    });
    
    if (file_handle) {
        fprintf(file_handle.get(), "Hello, Smart Handles!\\n");
    }
    
    std::cout << "File handle use count: " << file_handle.use_count() << "\\n";
}`,

    reference_counting: `// Reference Counting Handle with Weak References
#include <memory>
#include <atomic>
#include <mutex>
#include <set>
#include <algorithm>

template<typename T>
class RefCountedHandle;

template<typename T>
class WeakHandle;

// Control block for reference counting
template<typename T>
struct ControlBlock {
    std::atomic<int> strong_refs{0};
    std::atomic<int> weak_refs{0};
    T* resource{nullptr};
    std::mutex weak_observers_mutex;
    std::set<WeakHandle<T>*> weak_observers;
    
    ControlBlock(T* res) : resource(res) {}
    
    void add_strong_ref() { strong_refs.fetch_add(1); }
    void add_weak_ref() { weak_refs.fetch_add(1); }
    
    bool remove_strong_ref() {
        int count = strong_refs.fetch_sub(1);
        if (count == 1) {
            // Last strong reference, destroy resource
            delete resource;
            resource = nullptr;
            notify_weak_observers();
            return true;
        }
        return false;
    }
    
    bool remove_weak_ref() {
        int count = weak_refs.fetch_sub(1);
        if (count == 1 && strong_refs.load() == 0) {
            // Last weak reference and no strong refs, destroy control block
            return true;
        }
        return false;
    }
    
    void register_weak_observer(WeakHandle<T>* observer) {
        std::lock_guard<std::mutex> lock(weak_observers_mutex);
        weak_observers.insert(observer);
    }
    
    void unregister_weak_observer(WeakHandle<T>* observer) {
        std::lock_guard<std::mutex> lock(weak_observers_mutex);
        weak_observers.erase(observer);
    }
    
private:
    void notify_weak_observers() {
        std::lock_guard<std::mutex> lock(weak_observers_mutex);
        for (auto* observer : weak_observers) {
            observer->notify_expired();
        }
    }
};

template<typename T>
class RefCountedHandle {
private:
    ControlBlock<T>* control_block_;
    
    void cleanup() {
        if (control_block_) {
            if (control_block_->remove_strong_ref()) {
                // Resource was destroyed, check if control block should be deleted
                if (control_block_->weak_refs.load() == 0) {
                    delete control_block_;
                }
            }
        }
    }
    
public:
    explicit RefCountedHandle(T* resource = nullptr)
        : control_block_(resource ? new ControlBlock<T>(resource) : nullptr) {
        if (control_block_) {
            control_block_->add_strong_ref();
        }
    }
    
    RefCountedHandle(const RefCountedHandle& other)
        : control_block_(other.control_block_) {
        if (control_block_) {
            control_block_->add_strong_ref();
        }
    }
    
    RefCountedHandle(RefCountedHandle&& other) noexcept
        : control_block_(other.control_block_) {
        other.control_block_ = nullptr;
    }
    
    RefCountedHandle& operator=(const RefCountedHandle& other) {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            if (control_block_) {
                control_block_->add_strong_ref();
            }
        }
        return *this;
    }
    
    RefCountedHandle& operator=(RefCountedHandle&& other) noexcept {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            other.control_block_ = nullptr;
        }
        return *this;
    }
    
    ~RefCountedHandle() { cleanup(); }
    
    T& operator*() const { return *control_block_->resource; }
    T* operator->() const { return control_block_->resource; }
    T* get() const { return control_block_ ? control_block_->resource : nullptr; }
    
    explicit operator bool() const { 
        return control_block_ && control_block_->resource != nullptr; 
    }
    
    int use_count() const { 
        return control_block_ ? control_block_->strong_refs.load() : 0; 
    }
    
    void reset(T* new_resource = nullptr) {
        RefCountedHandle temp(new_resource);
        swap(temp);
    }
    
    void swap(RefCountedHandle& other) noexcept {
        std::swap(control_block_, other.control_block_);
    }
    
    // Create weak handle
    WeakHandle<T> weak() const {
        return WeakHandle<T>(control_block_);
    }
    
    friend class WeakHandle<T>;
};

template<typename T>
class WeakHandle {
private:
    ControlBlock<T>* control_block_;
    std::atomic<bool> expired_{false};
    
    void cleanup() {
        if (control_block_) {
            control_block_->unregister_weak_observer(this);
            if (control_block_->remove_weak_ref()) {
                delete control_block_;
            }
        }
    }
    
public:
    WeakHandle() : control_block_(nullptr) {}
    
    explicit WeakHandle(ControlBlock<T>* cb)
        : control_block_(cb) {
        if (control_block_) {
            control_block_->add_weak_ref();
            control_block_->register_weak_observer(this);
        }
    }
    
    WeakHandle(const WeakHandle& other)
        : control_block_(other.control_block_) {
        if (control_block_) {
            control_block_->add_weak_ref();
            control_block_->register_weak_observer(this);
        }
    }
    
    WeakHandle(WeakHandle&& other) noexcept
        : control_block_(other.control_block_) {
        other.control_block_ = nullptr;
        if (control_block_) {
            control_block_->unregister_weak_observer(&other);
            control_block_->register_weak_observer(this);
        }
    }
    
    WeakHandle& operator=(const WeakHandle& other) {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            if (control_block_) {
                control_block_->add_weak_ref();
                control_block_->register_weak_observer(this);
            }
        }
        return *this;
    }
    
    WeakHandle& operator=(WeakHandle&& other) noexcept {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            other.control_block_ = nullptr;
            if (control_block_) {
                control_block_->unregister_weak_observer(&other);
                control_block_->register_weak_observer(this);
            }
        }
        return *this;
    }
    
    ~WeakHandle() { cleanup(); }
    
    bool expired() const { 
        return expired_.load() || 
               (control_block_ && control_block_->strong_refs.load() == 0); 
    }
    
    RefCountedHandle<T> lock() const {
        if (!expired() && control_block_ && control_block_->resource) {
            return RefCountedHandle<T>(*this);
        }
        return RefCountedHandle<T>();
    }
    
    int use_count() const {
        return control_block_ ? control_block_->strong_refs.load() : 0;
    }
    
    void notify_expired() {
        expired_.store(true);
    }
    
private:
    // Allow RefCountedHandle to construct from WeakHandle
    explicit RefCountedHandle(const WeakHandle<T>& weak)
        : control_block_(weak.control_block_) {
        if (control_block_ && control_block_->resource) {
            // Try to increment strong reference atomically
            int expected = control_block_->strong_refs.load();
            while (expected > 0) {
                if (control_block_->strong_refs.compare_exchange_weak(expected, expected + 1)) {
                    return; // Successfully created strong reference
                }
            }
        }
        control_block_ = nullptr; // Failed to create strong reference
    }
    
    friend class RefCountedHandle<T>;
};

// Example usage with file system handles
class FileSystemNode {
private:
    std::string path_;
    bool is_directory_;
    std::vector<RefCountedHandle<FileSystemNode>> children_;
    WeakHandle<FileSystemNode> parent_;
    
public:
    FileSystemNode(std::string path, bool is_dir = false)
        : path_(std::move(path)), is_directory_(is_dir) {
        std::cout << "Created filesystem node: " << path_ << "\\n";
    }
    
    ~FileSystemNode() {
        std::cout << "Destroyed filesystem node: " << path_ << "\\n";
    }
    
    const std::string& path() const { return path_; }
    bool is_directory() const { return is_directory_; }
    
    void add_child(RefCountedHandle<FileSystemNode> child) {
        if (is_directory_) {
            child->parent_ = weak_from_this();
            children_.push_back(std::move(child));
        }
    }
    
    RefCountedHandle<FileSystemNode> get_parent() const {
        return parent_.lock();
    }
    
    const std::vector<RefCountedHandle<FileSystemNode>>& get_children() const {
        return children_;
    }
    
    void print_tree(int depth = 0) const {
        std::string indent(depth * 2, ' ');
        std::cout << indent << path_;
        if (is_directory_) std::cout << "/";
        std::cout << " (refs: " << /* use_count() - not available from inside */ "N" << ")\\n";
        
        for (const auto& child : children_) {
            child->print_tree(depth + 1);
        }
    }
    
private:
    WeakHandle<FileSystemNode> weak_from_this() const {
        // This would typically be implemented using enable_shared_from_this pattern
        // For this example, we'll simulate it
        return WeakHandle<FileSystemNode>(); // Simplified
    }
};

void demonstrate_reference_counting() {
    std::cout << "=== Reference Counting Handles ===\\n";
    
    // Create filesystem hierarchy
    auto root = RefCountedHandle<FileSystemNode>(new FileSystemNode("/", true));
    std::cout << "Root use count: " << root.use_count() << "\\n";
    
    auto usr = RefCountedHandle<FileSystemNode>(new FileSystemNode("/usr", true));
    auto bin = RefCountedHandle<FileSystemNode>(new FileSystemNode("/usr/bin", true));
    auto ls = RefCountedHandle<FileSystemNode>(new FileSystemNode("/usr/bin/ls", false));
    
    // Build hierarchy (this would normally handle weak references properly)
    root->add_child(usr);
    usr->add_child(bin);
    bin->add_child(ls);
    
    std::cout << "After building hierarchy:\\n";
    std::cout << "Root use count: " << root.use_count() << "\\n";
    std::cout << "Usr use count: " << usr.use_count() << "\\n";
    
    // Create weak reference to break potential cycles
    auto weak_root = root.weak();
    std::cout << "Weak reference expired: " << weak_root.expired() << "\\n";
    
    // Test weak reference
    {
        auto strong_from_weak = weak_root.lock();
        if (strong_from_weak) {
            std::cout << "Successfully locked weak reference\\n";
            std::cout << "Use count from weak lock: " << strong_from_weak.use_count() << "\\n";
        }
    }
    
    std::cout << "After weak lock scope, root use count: " << root.use_count() << "\\n";
    
    // Clear strong references
    usr.reset();
    bin.reset();
    ls.reset();
    
    std::cout << "After clearing children, root use count: " << root.use_count() << "\\n";
    
    root.reset();
    
    std::cout << "Weak reference expired after root reset: " << weak_root.expired() << "\\n";
}`,

    weak_handles: `// Weak Handle Pattern for Cycle Breaking
#include <memory>
#include <atomic>
#include <vector>
#include <functional>
#include <iostream>
#include <mutex>
#include <set>

template<typename T>
class StrongHandle;

template<typename T>
class WeakHandle;

template<typename T>
struct HandleControlBlock {
    std::atomic<int> strong_count{0};
    std::atomic<int> weak_count{0};
    T* object{nullptr};
    std::mutex observers_mutex;
    std::set<std::function<void()>> expiry_callbacks;
    
    HandleControlBlock(T* obj) : object(obj) {}
    
    void add_strong() { strong_count.fetch_add(1); }
    void add_weak() { weak_count.fetch_add(1); }
    
    bool release_strong() {
        int count = strong_count.fetch_sub(1);
        if (count == 1) {
            // Last strong reference
            delete object;
            object = nullptr;
            notify_expiry();
            return check_for_deletion();
        }
        return false;
    }
    
    bool release_weak() {
        int count = weak_count.fetch_sub(1);
        if (count == 1) {
            return check_for_deletion();
        }
        return false;
    }
    
    bool check_for_deletion() {
        return strong_count.load() == 0 && weak_count.load() == 0;
    }
    
    void register_expiry_callback(std::function<void()> callback) {
        std::lock_guard<std::mutex> lock(observers_mutex);
        expiry_callbacks.insert(std::move(callback));
    }
    
    void unregister_expiry_callback(const std::function<void()>& callback) {
        std::lock_guard<std::mutex> lock(observers_mutex);
        expiry_callbacks.erase(callback);
    }
    
private:
    void notify_expiry() {
        std::lock_guard<std::mutex> lock(observers_mutex);
        for (const auto& callback : expiry_callbacks) {
            callback();
        }
        expiry_callbacks.clear();
    }
};

template<typename T>
class WeakHandle {
private:
    HandleControlBlock<T>* control_block_;
    std::function<void()> expiry_callback_;
    std::atomic<bool> expired_{false};
    
public:
    WeakHandle() : control_block_(nullptr) {}
    
    explicit WeakHandle(HandleControlBlock<T>* cb) 
        : control_block_(cb) {
        if (control_block_) {
            control_block_->add_weak();
            setup_expiry_callback();
        }
    }
    
    WeakHandle(const WeakHandle& other) 
        : control_block_(other.control_block_) {
        if (control_block_) {
            control_block_->add_weak();
            setup_expiry_callback();
        }
    }
    
    WeakHandle(WeakHandle&& other) noexcept
        : control_block_(other.control_block_) {
        other.control_block_ = nullptr;
        expiry_callback_ = std::move(other.expiry_callback_);
    }
    
    WeakHandle& operator=(const WeakHandle& other) {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            if (control_block_) {
                control_block_->add_weak();
                setup_expiry_callback();
            }
        }
        return *this;
    }
    
    WeakHandle& operator=(WeakHandle&& other) noexcept {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            other.control_block_ = nullptr;
            expiry_callback_ = std::move(other.expiry_callback_);
        }
        return *this;
    }
    
    ~WeakHandle() {
        cleanup();
    }
    
    bool expired() const {
        return expired_.load() || 
               !control_block_ || 
               control_block_->strong_count.load() == 0;
    }
    
    StrongHandle<T> lock() const;
    
    int use_count() const {
        return control_block_ ? control_block_->strong_count.load() : 0;
    }
    
    void reset() {
        cleanup();
        control_block_ = nullptr;
    }
    
private:
    void setup_expiry_callback() {
        expiry_callback_ = [this]() { expired_.store(true); };
        if (control_block_) {
            control_block_->register_expiry_callback(expiry_callback_);
        }
    }
    
    void cleanup() {
        if (control_block_) {
            if (expiry_callback_) {
                control_block_->unregister_expiry_callback(expiry_callback_);
            }
            if (control_block_->release_weak()) {
                delete control_block_;
            }
        }
    }
    
    friend class StrongHandle<T>;
};

template<typename T>
class StrongHandle {
private:
    HandleControlBlock<T>* control_block_;
    
public:
    explicit StrongHandle(T* obj = nullptr)
        : control_block_(obj ? new HandleControlBlock<T>(obj) : nullptr) {
        if (control_block_) {
            control_block_->add_strong();
        }
    }
    
    StrongHandle(const StrongHandle& other)
        : control_block_(other.control_block_) {
        if (control_block_) {
            control_block_->add_strong();
        }
    }
    
    StrongHandle(StrongHandle&& other) noexcept
        : control_block_(other.control_block_) {
        other.control_block_ = nullptr;
    }
    
    StrongHandle& operator=(const StrongHandle& other) {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            if (control_block_) {
                control_block_->add_strong();
            }
        }
        return *this;
    }
    
    StrongHandle& operator=(StrongHandle&& other) noexcept {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            other.control_block_ = nullptr;
        }
        return *this;
    }
    
    ~StrongHandle() {
        cleanup();
    }
    
    T& operator*() const { return *control_block_->object; }
    T* operator->() const { return control_block_->object; }
    T* get() const { return control_block_ ? control_block_->object : nullptr; }
    
    explicit operator bool() const {
        return control_block_ && control_block_->object;
    }
    
    int use_count() const {
        return control_block_ ? control_block_->strong_count.load() : 0;
    }
    
    WeakHandle<T> weak() const {
        return WeakHandle<T>(control_block_);
    }
    
    void reset(T* new_obj = nullptr) {
        StrongHandle temp(new_obj);
        swap(temp);
    }
    
    void swap(StrongHandle& other) noexcept {
        std::swap(control_block_, other.control_block_);
    }
    
private:
    void cleanup() {
        if (control_block_) {
            if (control_block_->release_strong()) {
                delete control_block_;
            }
        }
    }
};

template<typename T>
StrongHandle<T> WeakHandle<T>::lock() const {
    if (expired() || !control_block_) {
        return StrongHandle<T>();
    }
    
    // Try to atomically increment strong count
    int expected = control_block_->strong_count.load();
    while (expected > 0) {
        if (control_block_->strong_count.compare_exchange_weak(expected, expected + 1)) {
            // Successfully created strong reference
            StrongHandle<T> result;
            result.control_block_ = control_block_;
            return result;
        }
    }
    
    return StrongHandle<T>(); // Failed to lock
}

// Example: Observer Pattern with Weak Handles
class Subject;

class Observer {
private:
    WeakHandle<Subject> subject_;
    std::string name_;
    
public:
    Observer(std::string name) : name_(std::move(name)) {
        std::cout << "Observer " << name_ << " created\\n";
    }
    
    ~Observer() {
        std::cout << "Observer " << name_ << " destroyed\\n";
    }
    
    void observe(const StrongHandle<Subject>& subject) {
        subject_ = subject.weak();
    }
    
    void notify(const std::string& event) {
        if (auto subject = subject_.lock()) {
            std::cout << "Observer " << name_ << " received event: " << event 
                      << " from subject\\n";
        } else {
            std::cout << "Observer " << name_ 
                      << " cannot notify - subject has expired\\n";
        }
    }
    
    bool has_valid_subject() const {
        return !subject_.expired();
    }
    
    const std::string& name() const { return name_; }
};

class Subject {
private:
    std::vector<WeakHandle<Observer>> observers_;
    std::string name_;
    
public:
    Subject(std::string name) : name_(std::move(name)) {
        std::cout << "Subject " << name_ << " created\\n";
    }
    
    ~Subject() {
        std::cout << "Subject " << name_ << " destroyed\\n";
    }
    
    void add_observer(const StrongHandle<Observer>& observer) {
        observers_.push_back(observer.weak());
        std::cout << "Added observer to subject " << name_ << "\\n";
    }
    
    void notify_all(const std::string& event) {
        std::cout << "Subject " << name_ << " notifying all observers of: " 
                  << event << "\\n";
        
        // Clean up expired weak references while notifying
        auto it = observers_.begin();
        while (it != observers_.end()) {
            if (auto observer = it->lock()) {
                observer->notify(event);
                ++it;
            } else {
                std::cout << "Removing expired observer from subject " 
                          << name_ << "\\n";
                it = observers_.erase(it);
            }
        }
    }
    
    size_t observer_count() const {
        size_t count = 0;
        for (const auto& weak_obs : observers_) {
            if (!weak_obs.expired()) {
                count++;
            }
        }
        return count;
    }
    
    const std::string& name() const { return name_; }
};

void demonstrate_weak_handles() {
    std::cout << "=== Weak Handle Pattern ===\\n";
    
    auto subject = StrongHandle<Subject>(new Subject("WeatherStation"));
    
    std::vector<StrongHandle<Observer>> observers;
    observers.push_back(StrongHandle<Observer>(new Observer("Display1")));
    observers.push_back(StrongHandle<Observer>(new Observer("Display2")));
    observers.push_back(StrongHandle<Observer>(new Observer("Logger")));
    
    // Setup observer relationships
    for (auto& observer : observers) {
        observer->observe(subject);
        subject->add_observer(observer);
    }
    
    std::cout << "\\nSubject has " << subject->observer_count() 
              << " active observers\\n";
    
    // Notify all observers
    subject->notify_all("Temperature: 25°C");
    
    // Remove one observer
    std::cout << "\\nRemoving Display1 observer...\\n";
    observers.erase(observers.begin());
    
    // Notify again - should clean up expired reference
    subject->notify_all("Temperature: 26°C");
    
    std::cout << "\\nSubject has " << subject->observer_count() 
              << " active observers\\n";
    
    // Check observer validity
    for (auto& observer : observers) {
        std::cout << "Observer " << observer->name() 
                  << " has valid subject: " 
                  << observer->has_valid_subject() << "\\n";
    }
    
    // Clear subject - should invalidate all weak references
    std::cout << "\\nClearing subject...\\n";
    subject.reset();
    
    // Try to notify - should fail gracefully
    for (auto& observer : observers) {
        observer->notify("Final event");
    }
}`,

    handle_hierarchies: `// Handle Hierarchies and Parent-Child Relationships
#include <memory>
#include <vector>
#include <string>
#include <iostream>
#include <algorithm>
#include <functional>

template<typename T>
class HierarchicalHandle;

template<typename T>
class HierarchicalNode {
private:
    T data_;
    std::vector<HierarchicalHandle<T>> children_;
    HierarchicalHandle<T>* parent_; // Raw pointer to avoid cycles
    std::string id_;
    
public:
    HierarchicalNode(T data, std::string id) 
        : data_(std::move(data)), id_(std::move(id)), parent_(nullptr) {
        std::cout << "Created hierarchical node: " << id_ << "\\n";
    }
    
    ~HierarchicalNode() {
        std::cout << "Destroying hierarchical node: " << id_ << "\\n";
    }
    
    // Data access
    const T& data() const { return data_; }
    T& data() { return data_; }
    const std::string& id() const { return id_; }
    
    // Parent access
    HierarchicalHandle<T>* parent() { return parent_; }
    const HierarchicalHandle<T>* parent() const { return parent_; }
    bool has_parent() const { return parent_ != nullptr; }
    
    // Children management
    void add_child(HierarchicalHandle<T> child) {
        // Remove from previous parent if any
        if (child && child->node_->parent_) {
            child->node_->parent_->remove_child(child->node_->id_);
        }
        
        child->node_->parent_ = this; // Set raw pointer to avoid cycle
        children_.push_back(std::move(child));
    }
    
    bool remove_child(const std::string& child_id) {
        auto it = std::find_if(children_.begin(), children_.end(),
            [&child_id](const HierarchicalHandle<T>& child) {
                return child && child->id() == child_id;
            });
        
        if (it != children_.end()) {
            if (*it) {
                (*it)->node_->parent_ = nullptr;
            }
            children_.erase(it);
            return true;
        }
        return false;
    }
    
    HierarchicalHandle<T> find_child(const std::string& child_id) {
        auto it = std::find_if(children_.begin(), children_.end(),
            [&child_id](const HierarchicalHandle<T>& child) {
                return child && child->id() == child_id;
            });
        
        return (it != children_.end()) ? *it : HierarchicalHandle<T>();
    }
    
    const std::vector<HierarchicalHandle<T>>& children() const { return children_; }
    size_t child_count() const { return children_.size(); }
    
    // Tree operations
    size_t depth() const {
        size_t depth = 0;
        const HierarchicalHandle<T>* current = parent_;
        while (current && *current) {
            depth++;
            current = (*current)->parent();
        }
        return depth;
    }
    
    HierarchicalHandle<T> root() {
        HierarchicalHandle<T>* current = parent_;
        while (current && *current && (*current)->parent()) {
            current = (*current)->parent();
        }
        return current ? *current : HierarchicalHandle<T>();
    }
    
    std::vector<std::string> path() const {
        std::vector<std::string> result;
        const HierarchicalHandle<T>* current = parent_;
        while (current && *current) {
            result.insert(result.begin(), (*current)->id());
            current = (*current)->parent();
        }
        result.push_back(id_);
        return result;
    }
    
    // Traversal
    void traverse_preorder(std::function<void(const T&, const std::string&, size_t)> visitor) const {
        visitor(data_, id_, depth());
        for (const auto& child : children_) {
            if (child) {
                child->traverse_preorder(visitor);
            }
        }
    }
    
    void traverse_postorder(std::function<void(const T&, const std::string&, size_t)> visitor) const {
        for (const auto& child : children_) {
            if (child) {
                child->traverse_postorder(visitor);
            }
        }
        visitor(data_, id_, depth());
    }
    
    // Search
    HierarchicalHandle<T> find_descendant(const std::string& descendant_id) {
        if (id_ == descendant_id) {
            // Cannot return self as HierarchicalHandle - would need factory
            return HierarchicalHandle<T>();
        }
        
        for (auto& child : children_) {
            if (child && child->id() == descendant_id) {
                return child;
            }
            
            if (auto found = child->find_descendant(descendant_id)) {
                return found;
            }
        }
        
        return HierarchicalHandle<T>();
    }
    
    friend class HierarchicalHandle<T>;
};

template<typename T>
class HierarchicalHandle {
private:
    std::shared_ptr<HierarchicalNode<T>> node_;
    
public:
    HierarchicalHandle() = default;
    
    explicit HierarchicalHandle(T data, std::string id) 
        : node_(std::make_shared<HierarchicalNode<T>>(std::move(data), std::move(id))) {}
    
    // Access operators
    HierarchicalNode<T>& operator*() const { return *node_; }
    HierarchicalNode<T>* operator->() const { return node_.get(); }
    HierarchicalNode<T>* get() const { return node_.get(); }
    
    explicit operator bool() const { return node_ != nullptr; }
    
    // Tree operations
    void add_child(HierarchicalHandle child) {
        if (node_) {
            node_->add_child(std::move(child));
        }
    }
    
    bool remove_child(const std::string& child_id) {
        return node_ ? node_->remove_child(child_id) : false;
    }
    
    HierarchicalHandle find_child(const std::string& child_id) {
        return node_ ? node_->find_child(child_id) : HierarchicalHandle();
    }
    
    HierarchicalHandle parent() {
        if (node_ && node_->parent() && *node_->parent()) {
            return *node_->parent();
        }
        return HierarchicalHandle();
    }
    
    HierarchicalHandle root() {
        return node_ ? node_->root() : HierarchicalHandle();
    }
    
    // Factory functions
    static HierarchicalHandle create_tree(T root_data, std::string root_id) {
        return HierarchicalHandle(std::move(root_data), std::move(root_id));
    }
    
    HierarchicalHandle create_child(T child_data, std::string child_id) {
        HierarchicalHandle child(std::move(child_data), std::move(child_id));
        add_child(child);
        return child;
    }
    
    // Utility
    void print_tree(int indent = 0) const {
        if (!node_) return;
        
        std::string prefix(indent * 2, ' ');
        std::cout << prefix << node_->id() << " (depth: " << node_->depth() << ")\\n";
        
        for (const auto& child : node_->children()) {
            child.print_tree(indent + 1);
        }
    }
    
    int use_count() const {
        return node_ ? node_.use_count() : 0;
    }
    
    friend class HierarchicalNode<T>;
};

// Example usage: File System Hierarchy
struct FileInfo {
    std::string name;
    size_t size;
    bool is_directory;
    
    FileInfo(std::string n, size_t s, bool is_dir) 
        : name(std::move(n)), size(s), is_directory(is_dir) {}
};

void demonstrate_handle_hierarchies() {
    std::cout << "=== Handle Hierarchies ===\\n";
    
    // Create filesystem hierarchy
    auto root = HierarchicalHandle<FileInfo>::create_tree(
        FileInfo("root", 0, true), "/"
    );
    
    auto home = root.create_child(FileInfo("home", 0, true), "/home");
    auto user = home.create_child(FileInfo("user", 0, true), "/home/user");
    auto documents = user.create_child(FileInfo("documents", 0, true), "/home/user/documents");
    auto file1 = documents.create_child(FileInfo("report.txt", 1024, false), "/home/user/documents/report.txt");
    auto file2 = documents.create_child(FileInfo("notes.md", 512, false), "/home/user/documents/notes.md");
    
    auto usr = root.create_child(FileInfo("usr", 0, true), "/usr");
    auto bin = usr.create_child(FileInfo("bin", 0, true), "/usr/bin");
    auto ls_cmd = bin.create_child(FileInfo("ls", 14336, false), "/usr/bin/ls");
    auto cat_cmd = bin.create_child(FileInfo("cat", 8192, false), "/usr/bin/cat");
    
    std::cout << "\\nCreated file system hierarchy:\\n";
    root.print_tree();
    
    std::cout << "\\nTraversing tree (preorder):\\n";
    root->traverse_preorder([](const FileInfo& info, const std::string& id, size_t depth) {
        std::string indent(depth * 2, ' ');
        std::cout << indent << id << " - " << info.name 
                  << (info.is_directory ? "/" : "") 
                  << " (" << info.size << " bytes)\\n";
    });
    
    // Test path finding
    std::cout << "\\nPath to report.txt:\\n";
    auto report_path = file1->path();
    for (const auto& segment : report_path) {
        std::cout << segment << "/";
    }
    std::cout << "\\n";
    
    // Test search
    std::cout << "\\nSearching for 'ls' command:\\n";
    auto found_ls = root->find_descendant("/usr/bin/ls");
    if (found_ls) {
        std::cout << "Found: " << found_ls->id() << " at depth " << found_ls->depth() << "\\n";
        std::cout << "Parent: " << (found_ls.parent() ? found_ls.parent()->id() : "none") << "\\n";
    }
    
    // Test parent navigation
    std::cout << "\\nNavigating from file to root:\\n";
    auto current = file1;
    while (current) {
        std::cout << current->id() << " (use_count: " << current.use_count() << ")\\n";
        current = current.parent();
    }
    
    // Test removal
    std::cout << "\\nRemoving documents directory...\\n";
    user.remove_child("/home/user/documents");
    
    std::cout << "Tree after removal:\\n";
    root.print_tree();
    
    // Test root finding
    std::cout << "\\nFinding root from cat command:\\n";
    auto root_from_cat = cat_cmd.root();
    if (root_from_cat) {
        std::cout << "Root found: " << root_from_cat->id() << "\\n";
    }
}`,

    thread_safe: `// Thread-Safe Smart Handles with Atomic Operations
#include <memory>
#include <atomic>
#include <mutex>
#include <thread>
#include <vector>
#include <chrono>
#include <iostream>

template<typename T>
class ThreadSafeHandle;

template<typename T>
struct ThreadSafeControlBlock {
    std::atomic<int> ref_count{1};
    std::atomic<T*> object{nullptr};
    std::atomic<bool> destroyed{false};
    mutable std::mutex destruction_mutex;
    
    ThreadSafeControlBlock(T* obj) : object(obj) {}
    
    void add_reference() {
        ref_count.fetch_add(1, std::memory_order_relaxed);
    }
    
    bool release_reference() {
        int old_count = ref_count.fetch_sub(1, std::memory_order_acq_rel);
        if (old_count == 1) {
            // Last reference - destroy object
            destroy_object();
            return true;
        }
        return false;
    }
    
    T* get_object() const {
        if (destroyed.load(std::memory_order_acquire)) {
            return nullptr;
        }
        return object.load(std::memory_order_acquire);
    }
    
    bool is_destroyed() const {
        return destroyed.load(std::memory_order_acquire);
    }
    
    int get_ref_count() const {
        return ref_count.load(std::memory_order_relaxed);
    }
    
private:
    void destroy_object() {
        std::lock_guard<std::mutex> lock(destruction_mutex);
        
        if (!destroyed.exchange(true, std::memory_order_acq_rel)) {
            T* obj = object.exchange(nullptr, std::memory_order_acq_rel);
            if (obj) {
                delete obj;
                std::cout << "Object destroyed by thread " 
                          << std::this_thread::get_id() << "\\n";
            }
        }
    }
};

template<typename T>
class ThreadSafeHandle {
private:
    ThreadSafeControlBlock<T>* control_block_;
    
    void cleanup() {
        if (control_block_) {
            if (control_block_->release_reference()) {
                delete control_block_;
            }
        }
    }
    
public:
    explicit ThreadSafeHandle(T* obj = nullptr)
        : control_block_(obj ? new ThreadSafeControlBlock<T>(obj) : nullptr) {}
    
    ThreadSafeHandle(const ThreadSafeHandle& other)
        : control_block_(other.control_block_) {
        if (control_block_) {
            control_block_->add_reference();
        }
    }
    
    ThreadSafeHandle(ThreadSafeHandle&& other) noexcept
        : control_block_(other.control_block_) {
        other.control_block_ = nullptr;
    }
    
    ThreadSafeHandle& operator=(const ThreadSafeHandle& other) {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            if (control_block_) {
                control_block_->add_reference();
            }
        }
        return *this;
    }
    
    ThreadSafeHandle& operator=(ThreadSafeHandle&& other) noexcept {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            other.control_block_ = nullptr;
        }
        return *this;
    }
    
    ~ThreadSafeHandle() {
        cleanup();
    }
    
    // Safe access methods
    class SafeAccessor {
    private:
        T* object_;
        ThreadSafeControlBlock<T>* control_block_;
        
    public:
        SafeAccessor(T* obj, ThreadSafeControlBlock<T>* cb) 
            : object_(obj), control_block_(cb) {
            if (control_block_) {
                control_block_->add_reference();
            }
        }
        
        SafeAccessor(const SafeAccessor&) = delete;
        SafeAccessor& operator=(const SafeAccessor&) = delete;
        
        SafeAccessor(SafeAccessor&& other) noexcept
            : object_(other.object_), control_block_(other.control_block_) {
            other.object_ = nullptr;
            other.control_block_ = nullptr;
        }
        
        ~SafeAccessor() {
            if (control_block_) {
                control_block_->release_reference();
            }
        }
        
        T* operator->() const { return object_; }
        T& operator*() const { return *object_; }
        T* get() const { return object_; }
        explicit operator bool() const { return object_ != nullptr; }
    };
    
    SafeAccessor access() const {
        if (!control_block_) {
            return SafeAccessor(nullptr, nullptr);
        }
        
        T* obj = control_block_->get_object();
        return SafeAccessor(obj, control_block_);
    }
    
    // Atomic operations
    template<typename Func>
    auto atomic_operation(Func&& func) const -> decltype(func(*std::declval<T*>())) {
        auto accessor = access();
        if (accessor) {
            return func(accessor.get());
        } else {
            throw std::runtime_error("Handle points to destroyed object");
        }
    }
    
    bool is_valid() const {
        return control_block_ && !control_block_->is_destroyed();
    }
    
    int use_count() const {
        return control_block_ ? control_block_->get_ref_count() : 0;
    }
    
    void reset(T* new_obj = nullptr) {
        ThreadSafeHandle temp(new_obj);
        *this = std::move(temp);
    }
    
    // Compare-and-swap for atomic updates
    bool compare_exchange_object(T* expected, T* desired) {
        if (!control_block_) return false;
        return control_block_->object.compare_exchange_strong(expected, desired);
    }
};

// Lock-free Handle Pool for high-performance scenarios
template<typename T, size_t PoolSize = 1024>
class LockFreeHandlePool {
private:
    struct PoolEntry {
        std::atomic<ThreadSafeHandle<T>*> handle{nullptr};
        std::atomic<bool> in_use{false};
        alignas(64) char padding[64 - sizeof(std::atomic<ThreadSafeHandle<T>*>) - sizeof(std::atomic<bool>)];
    };
    
    PoolEntry pool_[PoolSize];
    std::atomic<size_t> allocation_counter_{0};
    
public:
    LockFreeHandlePool() = default;
    
    bool try_store(ThreadSafeHandle<T> handle) {
        size_t start = allocation_counter_.fetch_add(1, std::memory_order_relaxed) % PoolSize;
        
        for (size_t i = 0; i < PoolSize; ++i) {
            size_t index = (start + i) % PoolSize;
            bool expected = false;
            
            if (pool_[index].in_use.compare_exchange_weak(expected, true, std::memory_order_acquire)) {
                // Successfully claimed slot
                auto* heap_handle = new ThreadSafeHandle<T>(std::move(handle));
                pool_[index].handle.store(heap_handle, std::memory_order_release);
                return true;
            }
        }
        
        return false; // Pool full
    }
    
    ThreadSafeHandle<T> try_retrieve(size_t preferred_index = SIZE_MAX) {
        if (preferred_index == SIZE_MAX) {
            preferred_index = allocation_counter_.load(std::memory_order_relaxed) % PoolSize;
        }
        
        for (size_t i = 0; i < PoolSize; ++i) {
            size_t index = (preferred_index + i) % PoolSize;
            
            if (pool_[index].in_use.load(std::memory_order_acquire)) {
                auto* handle_ptr = pool_[index].handle.exchange(nullptr, std::memory_order_acq_rel);
                if (handle_ptr) {
                    ThreadSafeHandle<T> result = std::move(*handle_ptr);
                    delete handle_ptr;
                    pool_[index].in_use.store(false, std::memory_order_release);
                    return result;
                }
            }
        }
        
        return ThreadSafeHandle<T>(); // Pool empty
    }
    
    size_t capacity() const { return PoolSize; }
    
    size_t size() const {
        size_t count = 0;
        for (size_t i = 0; i < PoolSize; ++i) {
            if (pool_[i].in_use.load(std::memory_order_acquire)) {
                count++;
            }
        }
        return count;
    }
};

// Example usage: Thread-safe shared cache
class CacheEntry {
private:
    std::string key_;
    std::vector<uint8_t> data_;
    std::chrono::steady_clock::time_point created_at_;
    std::atomic<size_t> access_count_{0};
    
public:
    CacheEntry(std::string key, std::vector<uint8_t> data)
        : key_(std::move(key)), data_(std::move(data)), 
          created_at_(std::chrono::steady_clock::now()) {
        std::cout << "Cache entry created for key: " << key_ << "\\n";
    }
    
    ~CacheEntry() {
        std::cout << "Cache entry destroyed for key: " << key_ 
                  << " (accessed " << access_count_ << " times)\\n";
    }
    
    const std::string& key() const { return key_; }
    
    const std::vector<uint8_t>& data() const {
        access_count_.fetch_add(1, std::memory_order_relaxed);
        return data_;
    }
    
    size_t access_count() const {
        return access_count_.load(std::memory_order_relaxed);
    }
    
    std::chrono::milliseconds age() const {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - created_at_);
    }
    
    void update_data(std::vector<uint8_t> new_data) {
        data_ = std::move(new_data);
        created_at_ = std::chrono::steady_clock::now();
        std::cout << "Updated cache entry for key: " << key_ << "\\n";
    }
};

void demonstrate_thread_safe_handles() {
    std::cout << "=== Thread-Safe Smart Handles ===\\n";
    
    // Create shared cache entries
    std::vector<ThreadSafeHandle<CacheEntry>> cache_handles;
    
    cache_handles.push_back(ThreadSafeHandle<CacheEntry>(
        new CacheEntry("user:123", {1, 2, 3, 4, 5})));
    cache_handles.push_back(ThreadSafeHandle<CacheEntry>(
        new CacheEntry("config:main", {6, 7, 8, 9, 10})));
    cache_handles.push_back(ThreadSafeHandle<CacheEntry>(
        new CacheEntry("session:abc", {11, 12, 13, 14, 15})));
    
    // Test lock-free handle pool
    LockFreeHandlePool<CacheEntry> handle_pool;
    
    std::cout << "\\nStoring handles in lock-free pool...\\n";
    for (auto& handle : cache_handles) {
        bool stored = handle_pool.try_store(handle);
        std::cout << "Stored handle for " << handle.access()->key() 
                  << ": " << (stored ? "success" : "failed") << "\\n";
    }
    
    std::cout << "Pool size: " << handle_pool.size() << "/" 
              << handle_pool.capacity() << "\\n";
    
    // Multi-threaded access test
    std::cout << "\\nStarting multi-threaded access test...\\n";
    
    std::vector<std::thread> workers;
    std::atomic<int> completed_operations{0};
    
    for (int i = 0; i < 4; ++i) {
        workers.emplace_back([&handle_pool, &completed_operations, i] {
            std::cout << "Worker " << i << " started\\n";
            
            for (int j = 0; j < 10; ++j) {
                // Retrieve handle from pool
                auto handle = handle_pool.try_retrieve();
                
                if (handle.is_valid()) {
                    // Safe access to shared data
                    auto accessor = handle.access();
                    if (accessor) {
                        const auto& data = accessor->data();
                        std::cout << "Worker " << i << " accessed " 
                                  << accessor->key() << " (size: " << data.size() 
                                  << ", age: " << accessor->age().count() << "ms)\\n";
                        
                        // Simulate some work
                        std::this_thread::sleep_for(std::chrono::milliseconds(10));
                        
                        completed_operations.fetch_add(1, std::memory_order_relaxed);
                    }
                    
                    // Return handle to pool
                    handle_pool.try_store(std::move(handle));
                } else {
                    std::cout << "Worker " << i << " found empty pool\\n";
                    std::this_thread::sleep_for(std::chrono::milliseconds(5));
                }
            }
            
            std::cout << "Worker " << i << " finished\\n";
        });
    }
    
    // Wait for all workers to complete
    for (auto& worker : workers) {
        worker.join();
    }
    
    std::cout << "\\nCompleted " << completed_operations.load() 
              << " operations across all threads\\n";
    
    // Test atomic operations on handles
    std::cout << "\\nTesting atomic operations...\\n";
    auto handle = handle_pool.try_retrieve();
    if (handle.is_valid()) {
        handle.atomic_operation([](CacheEntry* entry) {
            std::cout << "Atomic operation on " << entry->key() 
                      << " - access count: " << entry->access_count() << "\\n";
            return entry->access_count();
        });
    }
    
    std::cout << "Final pool size: " << handle_pool.size() << "\\n";
}`,

    observability: `// Handle Observability and Debugging Support
#include <memory>
#include <atomic>
#include <vector>
#include <string>
#include <unordered_map>
#include <mutex>
#include <chrono>
#include <iostream>
#include <functional>
#include <sstream>

// Forward declarations
template<typename T> class ObservableHandle;
template<typename T> class HandleDebugger;

// Handle event types
enum class HandleEvent {
    CREATED,
    COPIED,
    MOVED,
    DESTROYED,
    ACCESSED,
    RESET,
    EXPIRED
};

// Handle statistics
struct HandleStats {
    std::atomic<size_t> total_created{0};
    std::atomic<size_t> total_destroyed{0};
    std::atomic<size_t> total_copies{0};
    std::atomic<size_t> total_moves{0};
    std::atomic<size_t> total_accesses{0};
    std::atomic<size_t> currently_alive{0};
    std::atomic<size_t> peak_alive{0};
    std::chrono::steady_clock::time_point start_time;
    
    HandleStats() : start_time(std::chrono::steady_clock::now()) {}
    
    void print_summary() const {
        auto duration = std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::steady_clock::now() - start_time);
        
        std::cout << "=== Handle Statistics ===\\n";
        std::cout << "Runtime: " << duration.count() << " seconds\\n";
        std::cout << "Total created: " << total_created.load() << "\\n";
        std::cout << "Total destroyed: " << total_destroyed.load() << "\\n";
        std::cout << "Total copies: " << total_copies.load() << "\\n";
        std::cout << "Total moves: " << total_moves.load() << "\\n";
        std::cout << "Total accesses: " << total_accesses.load() << "\\n";
        std::cout << "Currently alive: " << currently_alive.load() << "\\n";
        std::cout << "Peak alive: " << peak_alive.load() << "\\n";
        
        if (duration.count() > 0) {
            std::cout << "Creation rate: " 
                      << total_created.load() / duration.count() << " handles/sec\\n";
        }
    }
};

// Global handle statistics
static HandleStats g_handle_stats;

// Handle trace information
struct HandleTrace {
    size_t handle_id;
    std::string type_name;
    std::chrono::steady_clock::time_point created_at;
    std::vector<std::pair<HandleEvent, std::chrono::steady_clock::time_point>> events;
    std::vector<std::string> stack_traces;
    size_t ref_count;
    
    HandleTrace(size_t id, std::string type) 
        : handle_id(id), type_name(std::move(type)), 
          created_at(std::chrono::steady_clock::now()), ref_count(1) {}
    
    void add_event(HandleEvent event) {
        events.emplace_back(event, std::chrono::steady_clock::now());
    }
    
    std::chrono::milliseconds lifetime() const {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - created_at);
    }
    
    void print() const {
        std::cout << "Handle " << handle_id << " (" << type_name << "):\\n";
        std::cout << "  Created at: " << created_at.time_since_epoch().count() << "\\n";
        std::cout << "  Lifetime: " << lifetime().count() << "ms\\n";
        std::cout << "  Reference count: " << ref_count << "\\n";
        std::cout << "  Events:\\n";
        
        for (const auto& [event, timestamp] : events) {
            auto delta = std::chrono::duration_cast<std::chrono::milliseconds>(
                timestamp - created_at);
            std::cout << "    +" << delta.count() << "ms: ";
            
            switch (event) {
                case HandleEvent::CREATED: std::cout << "CREATED"; break;
                case HandleEvent::COPIED: std::cout << "COPIED"; break;
                case HandleEvent::MOVED: std::cout << "MOVED"; break;
                case HandleEvent::DESTROYED: std::cout << "DESTROYED"; break;
                case HandleEvent::ACCESSED: std::cout << "ACCESSED"; break;
                case HandleEvent::RESET: std::cout << "RESET"; break;
                case HandleEvent::EXPIRED: std::cout << "EXPIRED"; break;
            }
            std::cout << "\\n";
        }
    }
};

// Handle debugger - tracks all handle operations
template<typename T>
class HandleDebugger {
private:
    static std::atomic<size_t> next_handle_id_;
    static std::mutex traces_mutex_;
    static std::unordered_map<size_t, std::unique_ptr<HandleTrace>> traces_;
    
public:
    static size_t register_handle(const std::string& type_name) {
        size_t id = next_handle_id_.fetch_add(1);
        
        std::lock_guard<std::mutex> lock(traces_mutex_);
        traces_[id] = std::make_unique<HandleTrace>(id, type_name);
        
        g_handle_stats.total_created.fetch_add(1);
        size_t current_alive = g_handle_stats.currently_alive.fetch_add(1) + 1;
        
        // Update peak
        size_t expected_peak = g_handle_stats.peak_alive.load();
        while (current_alive > expected_peak && 
               !g_handle_stats.peak_alive.compare_exchange_weak(expected_peak, current_alive));
        
        return id;
    }
    
    static void record_event(size_t handle_id, HandleEvent event) {
        std::lock_guard<std::mutex> lock(traces_mutex_);
        auto it = traces_.find(handle_id);
        if (it != traces_.end()) {
            it->second->add_event(event);
            
            switch (event) {
                case HandleEvent::COPIED:
                    g_handle_stats.total_copies.fetch_add(1);
                    it->second->ref_count++;
                    break;
                case HandleEvent::MOVED:
                    g_handle_stats.total_moves.fetch_add(1);
                    break;
                case HandleEvent::ACCESSED:
                    g_handle_stats.total_accesses.fetch_add(1);
                    break;
                case HandleEvent::DESTROYED:
                    g_handle_stats.total_destroyed.fetch_add(1);
                    g_handle_stats.currently_alive.fetch_sub(1);
                    if (--it->second->ref_count == 0) {
                        traces_.erase(it);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    
    static void print_all_traces() {
        std::lock_guard<std::mutex> lock(traces_mutex_);
        std::cout << "=== Active Handle Traces ===\\n";
        for (const auto& [id, trace] : traces_) {
            trace->print();
            std::cout << "\\n";
        }
    }
    
    static std::vector<size_t> find_long_lived_handles(std::chrono::milliseconds threshold) {
        std::lock_guard<std::mutex> lock(traces_mutex_);
        std::vector<size_t> result;
        
        for (const auto& [id, trace] : traces_) {
            if (trace->lifetime() > threshold) {
                result.push_back(id);
            }
        }
        
        return result;
    }
    
    static void print_statistics() {
        g_handle_stats.print_summary();
    }
};

template<typename T>
std::atomic<size_t> HandleDebugger<T>::next_handle_id_{1};

template<typename T>
std::mutex HandleDebugger<T>::traces_mutex_;

template<typename T>
std::unordered_map<size_t, std::unique_ptr<HandleTrace>> HandleDebugger<T>::traces_;

// Observable control block
template<typename T>
struct ObservableControlBlock {
    std::atomic<int> ref_count{1};
    T* object;
    size_t debug_id;
    std::atomic<size_t> access_count{0};
    std::chrono::steady_clock::time_point created_at;
    
    ObservableControlBlock(T* obj) 
        : object(obj), debug_id(HandleDebugger<T>::register_handle(typeid(T).name())),
          created_at(std::chrono::steady_clock::now()) {
        HandleDebugger<T>::record_event(debug_id, HandleEvent::CREATED);
    }
    
    void add_ref() {
        ref_count.fetch_add(1);
        HandleDebugger<T>::record_event(debug_id, HandleEvent::COPIED);
    }
    
    bool release_ref() {
        int old_count = ref_count.fetch_sub(1);
        if (old_count == 1) {
            HandleDebugger<T>::record_event(debug_id, HandleEvent::DESTROYED);
            delete object;
            return true;
        }
        return false;
    }
    
    T* access() {
        access_count.fetch_add(1);
        HandleDebugger<T>::record_event(debug_id, HandleEvent::ACCESSED);
        return object;
    }
    
    size_t get_access_count() const {
        return access_count.load();
    }
    
    std::chrono::milliseconds age() const {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - created_at);
    }
};

template<typename T>
class ObservableHandle {
private:
    ObservableControlBlock<T>* control_block_;
    
    void cleanup() {
        if (control_block_ && control_block_->release_ref()) {
            delete control_block_;
        }
    }
    
public:
    explicit ObservableHandle(T* obj = nullptr)
        : control_block_(obj ? new ObservableControlBlock<T>(obj) : nullptr) {}
    
    ObservableHandle(const ObservableHandle& other)
        : control_block_(other.control_block_) {
        if (control_block_) {
            control_block_->add_ref();
        }
    }
    
    ObservableHandle(ObservableHandle&& other) noexcept
        : control_block_(other.control_block_) {
        other.control_block_ = nullptr;
        if (control_block_) {
            HandleDebugger<T>::record_event(control_block_->debug_id, HandleEvent::MOVED);
        }
    }
    
    ObservableHandle& operator=(const ObservableHandle& other) {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            if (control_block_) {
                control_block_->add_ref();
            }
        }
        return *this;
    }
    
    ObservableHandle& operator=(ObservableHandle&& other) noexcept {
        if (this != &other) {
            cleanup();
            control_block_ = other.control_block_;
            other.control_block_ = nullptr;
            if (control_block_) {
                HandleDebugger<T>::record_event(control_block_->debug_id, HandleEvent::MOVED);
            }
        }
        return *this;
    }
    
    ~ObservableHandle() {
        cleanup();
    }
    
    T& operator*() const { return *control_block_->access(); }
    T* operator->() const { return control_block_->access(); }
    T* get() const { return control_block_ ? control_block_->access() : nullptr; }
    
    explicit operator bool() const { return control_block_ && control_block_->object; }
    
    void reset(T* new_obj = nullptr) {
        if (control_block_) {
            HandleDebugger<T>::record_event(control_block_->debug_id, HandleEvent::RESET);
        }
        ObservableHandle temp(new_obj);
        *this = std::move(temp);
    }
    
    int use_count() const {
        return control_block_ ? control_block_->ref_count.load() : 0;
    }
    
    size_t access_count() const {
        return control_block_ ? control_block_->get_access_count() : 0;
    }
    
    std::chrono::milliseconds age() const {
        return control_block_ ? control_block_->age() : std::chrono::milliseconds::zero();
    }
    
    size_t debug_id() const {
        return control_block_ ? control_block_->debug_id : 0;
    }
};

// Example usage: Network connection with observability
class NetworkConnection {
private:
    std::string endpoint_;
    bool connected_;
    std::atomic<size_t> bytes_sent_{0};
    std::atomic<size_t> bytes_received_{0};
    
public:
    NetworkConnection(std::string endpoint) 
        : endpoint_(std::move(endpoint)), connected_(false) {
        connect();
    }
    
    ~NetworkConnection() {
        if (connected_) {
            disconnect();
        }
        std::cout << "NetworkConnection to " << endpoint_ 
                  << " destroyed (sent: " << bytes_sent_ 
                  << ", received: " << bytes_received_ << " bytes)\\n";
    }
    
    void connect() {
        connected_ = true;
        std::cout << "Connected to " << endpoint_ << "\\n";
    }
    
    void disconnect() {
        connected_ = false;
        std::cout << "Disconnected from " << endpoint_ << "\\n";
    }
    
    bool send(const std::string& data) {
        if (!connected_) return false;
        
        bytes_sent_ += data.size();
        std::cout << "Sent " << data.size() << " bytes to " << endpoint_ << "\\n";
        return true;
    }
    
    std::string receive(size_t max_bytes) {
        if (!connected_) return "";
        
        std::string data(std::min(max_bytes, size_t(100)), 'X');
        bytes_received_ += data.size();
        std::cout << "Received " << data.size() << " bytes from " << endpoint_ << "\\n";
        return data;
    }
    
    const std::string& endpoint() const { return endpoint_; }
    bool is_connected() const { return connected_; }
    size_t bytes_sent() const { return bytes_sent_.load(); }
    size_t bytes_received() const { return bytes_received_.load(); }
};

void demonstrate_observability() {
    std::cout << "=== Observable Handle Patterns ===\\n";
    
    // Create observable handles
    std::vector<ObservableHandle<NetworkConnection>> connections;
    
    connections.push_back(ObservableHandle<NetworkConnection>(
        new NetworkConnection("192.168.1.1:80")));
    connections.push_back(ObservableHandle<NetworkConnection>(
        new NetworkConnection("api.example.com:443")));
    connections.push_back(ObservableHandle<NetworkConnection>(
        new NetworkConnection("database.internal:5432")));
    
    std::cout << "\\nCreated " << connections.size() << " observable handles\\n";
    
    // Use connections and track access
    for (auto& conn : connections) {
        conn->send("Hello, World!");
        auto response = conn->receive(1024);
        
        std::cout << "Handle " << conn.debug_id() 
                  << " - Access count: " << conn.access_count()
                  << ", Age: " << conn.age().count() << "ms"
                  << ", Ref count: " << conn.use_count() << "\\n";
    }
    
    // Create additional references
    std::cout << "\\nCreating additional references...\\n";
    auto shared_conn = connections[0];
    auto another_ref = shared_conn;
    
    std::cout << "Shared connection ref count: " << shared_conn.use_count() << "\\n";
    
    // Access shared connection multiple times
    for (int i = 0; i < 5; ++i) {
        shared_conn->send("Bulk data " + std::to_string(i));
    }
    
    std::cout << "After bulk operations - Access count: " 
              << shared_conn.access_count() << "\\n";
    
    // Find long-lived handles
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    auto long_lived = HandleDebugger<NetworkConnection>::find_long_lived_handles(
        std::chrono::milliseconds(50));
    
    std::cout << "\\nFound " << long_lived.size() << " long-lived handles\\n";
    
    // Print debugging information
    HandleDebugger<NetworkConnection>::print_all_traces();
    HandleDebugger<NetworkConnection>::print_statistics();
    
    // Reset some handles
    std::cout << "\\nResetting handles...\\n";
    connections[1].reset();
    connections[2].reset(new NetworkConnection("backup.server.com:80"));
    
    // Final statistics
    std::cout << "\\nFinal statistics:\\n";
    HandleDebugger<NetworkConnection>::print_statistics();
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 85: Smart Handle Patterns" : "Lección 85: Patrones de Smart Handles"}
      lessonId="lesson-85"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'Advanced RAII Evolution with Smart Handles' : 'Evolución Avanzada de RAII con Smart Handles'}
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
                  'Master template-based smart handle design with custom deleters',
                  'Implement reference counting handles for shared resource management',
                  'Design weak handle patterns to break circular references',
                  'Build hierarchical handle systems with parent-child relationships',
                  'Create thread-safe handles using atomic operations and lock-free techniques',
                  'Integrate observability and debugging support into handle implementations',
                  'Optimize handle performance with move semantics and custom allocators'
                ]
              : [
                  'Dominar diseño de smart handles basado en templates con deleters personalizados',
                  'Implementar handles de conteo de referencias para gestión de recursos compartidos',
                  'Diseñar patrones de weak handles para romper referencias circulares',
                  'Construir sistemas de handles jerárquicos con relaciones padre-hijo',
                  'Crear handles thread-safe usando operaciones atómicas y técnicas lock-free',
                  'Integrar soporte de observabilidad y debugging en implementaciones de handles',
                  'Optimizar rendimiento de handles con move semantics y allocators personalizados'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive Smart Handle Demonstration' : 'Demostración Interactiva de Smart Handles'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <SmartHandleVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('template_handles')}
            variant={state.scenario === 'template_handles' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Template Handles' : 'Handles de Template'}
          </Button>
          <Button 
            onClick={() => runScenario('reference_counting')}
            variant={state.scenario === 'reference_counting' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Reference Counting' : 'Conteo Referencias'}
          </Button>
          <Button 
            onClick={() => runScenario('weak_handles')}
            variant={state.scenario === 'weak_handles' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Weak Handles' : 'Handles Débiles'}
          </Button>
          <Button 
            onClick={() => runScenario('handle_hierarchies')}
            variant={state.scenario === 'handle_hierarchies' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Hierarchies' : 'Jerarquías'}
          </Button>
          <Button 
            onClick={() => runScenario('thread_safe')}
            variant={state.scenario === 'thread_safe' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Thread-Safe' : 'Thread-Safe'}
          </Button>
          <Button 
            onClick={() => runScenario('observability')}
            variant={state.scenario === 'observability' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Observability' : 'Observabilidad'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Active Handles' : 'Handles Activos', 
              value: state.handleCount,
              color: '#00ff00'
            },
            { 
              label: state.language === 'en' ? 'Reference Count' : 'Conteo Refs', 
              value: state.referenceCount,
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Weak References' : 'Refs Débiles', 
              value: state.weakReferences,
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Thread Safety %' : 'Thread Safety %', 
              value: Math.round(state.threadSafety),
              color: '#ff0080'
            },
            { 
              label: state.language === 'en' ? 'Observability %' : 'Observabilidad %', 
              value: state.observabilityLevel,
              color: '#ffffff'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'template_handles' && (state.language === 'en' ? 'Template-based Smart Handles' : 'Smart Handles basados en Templates')}
          {state.scenario === 'reference_counting' && (state.language === 'en' ? 'Reference Counting Handles' : 'Handles de Conteo de Referencias')}
          {state.scenario === 'weak_handles' && (state.language === 'en' ? 'Weak Handle Patterns' : 'Patrones de Handles Débiles')}
          {state.scenario === 'handle_hierarchies' && (state.language === 'en' ? 'Hierarchical Handle Systems' : 'Sistemas de Handles Jerárquicos')}
          {state.scenario === 'thread_safe' && (state.language === 'en' ? 'Thread-Safe Handle Implementation' : 'Implementación de Handles Thread-Safe')}
          {state.scenario === 'observability' && (state.language === 'en' ? 'Observable Handle Patterns' : 'Patrones de Handles Observables')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'template_handles' ? 
              (state.language === 'en' ? 'Generic Template Handle' : 'Handle de Template Genérico') :
            state.scenario === 'reference_counting' ? 
              (state.language === 'en' ? 'Reference Counting System' : 'Sistema de Conteo de Referencias') :
            state.scenario === 'weak_handles' ? 
              (state.language === 'en' ? 'Weak Reference Pattern' : 'Patrón de Referencias Débiles') :
            state.scenario === 'handle_hierarchies' ? 
              (state.language === 'en' ? 'Hierarchical Handle Structure' : 'Estructura de Handle Jerárquico') :
            state.scenario === 'thread_safe' ? 
              (state.language === 'en' ? 'Thread-Safe Handle Implementation' : 'Implementación de Handle Thread-Safe') :
            (state.language === 'en' ? 'Observable Handle with Debugging' : 'Handle Observable con Debugging')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Smart Handle Design Patterns' : 'Patrones de Diseño de Smart Handles'}
        </SectionTitle>
        
        <PerformanceComparison
          title={state.language === 'en' ? 'Handle Pattern Performance Analysis' : 'Análisis de Rendimiento de Patrones de Handle'}
          scenarios={[
            {
              name: state.language === 'en' ? 'Raw Pointers' : 'Punteros Raw',
              metrics: {
                [state.language === 'en' ? 'Memory Safety' : 'Seguridad Memoria']: 20,
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 100,
                [state.language === 'en' ? 'Maintainability' : 'Mantenibilidad']: 30,
                [state.language === 'en' ? 'Debug Support' : 'Soporte Debug']: 10
              }
            },
            {
              name: state.language === 'en' ? 'Template Handles' : 'Handles Template',
              metrics: {
                [state.language === 'en' ? 'Memory Safety' : 'Seguridad Memoria']: 90,
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 85,
                [state.language === 'en' ? 'Maintainability' : 'Mantenibilidad']: 85,
                [state.language === 'en' ? 'Debug Support' : 'Soporte Debug']: 70
              }
            },
            {
              name: state.language === 'en' ? 'Observable Handles' : 'Handles Observables',
              metrics: {
                [state.language === 'en' ? 'Memory Safety' : 'Seguridad Memoria']: 95,
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 75,
                [state.language === 'en' ? 'Maintainability' : 'Mantenibilidad']: 95,
                [state.language === 'en' ? 'Debug Support' : 'Soporte Debug']: 100
              }
            }
          ]}
        />

        <div style={{ 
          backgroundColor: '#1a1a2e', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #333'
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🚀 Smart Handle Benefits:' : '🚀 Beneficios de Smart Handles:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Custom Resource Management:' : 'Gestión Personalizada de Recursos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Template-based design allows specialized deletion and cleanup strategies for different resource types'
                : 'El diseño basado en templates permite estrategias especializadas de eliminación y limpieza para diferentes tipos de recursos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Cycle-Free Reference Counting:' : 'Conteo de Referencias sin Ciclos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Weak handles break circular dependencies while maintaining safe access to shared resources'
                : 'Los handles débiles rompen dependencias circulares mientras mantienen acceso seguro a recursos compartidos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Hierarchical Resource Management:' : 'Gestión Jerárquica de Recursos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Parent-child relationships enable automatic cleanup and resource organization'
                : 'Las relaciones padre-hijo permiten limpieza automática y organización de recursos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Production-Ready Observability:' : 'Observabilidad Lista para Producción:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Built-in debugging, tracing, and performance monitoring for complex handle systems'
                : 'Debugging, trazado y monitoreo de rendimiento integrados para sistemas complejos de handles'
              }
            </li>
          </ul>
        </div>

        <UndefinedBehaviorWarning
          title={state.language === 'en' ? 'Smart Handle Implementation Pitfalls' : 'Trampas en Implementación de Smart Handles'}
          warnings={[
            {
              code: `// ❌ Dangerous: Circular references in hierarchical handles
auto parent = make_handle<Node>("parent");
auto child = make_handle<Node>("child");
parent->add_child(child);
child->set_parent(parent); // Creates cycle!

// ✅ Correct: Use weak handles for parent references
class Node {
    std::vector<Handle<Node>> children_;
    WeakHandle<Node> parent_; // Weak reference breaks cycle
};`,
              explanation: state.language === 'en' 
                ? 'Circular references in handle hierarchies can cause memory leaks. Use weak handles for back-references.'
                : 'Las referencias circulares en jerarquías de handles pueden causar memory leaks. Usa handles débiles para referencias hacia atrás.'
            },
            {
              code: `// ❌ Race condition in thread-safe handles
auto handle = shared_handle;
if (handle.is_valid()) {
    handle->do_work(); // Object might be destroyed here!
}

// ✅ Atomic access pattern
auto accessor = handle.access(); // Atomic lock
if (accessor) {
    accessor->do_work(); // Safe until destructor
}`,
              explanation: state.language === 'en'
                ? 'Thread-safe handles require atomic access patterns to prevent race conditions during object access.'
                : 'Los handles thread-safe requieren patrones de acceso atómico para prevenir condiciones de carrera durante el acceso a objetos.'
            }
          ]}
        />

        <div style={{ 
          backgroundColor: '#2e1a1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #800',
          marginTop: '2rem'
        }}>
          <h4 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
            {state.language === 'en' ? '⚡ Performance Considerations:' : '⚡ Consideraciones de Rendimiento:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Template Instantiation Cost:' : 'Costo de Instanciación de Templates:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Each unique template parameter creates separate code - balance flexibility with binary size'
                : 'Cada parámetro de template único crea código separado - equilibra flexibilidad con tamaño binario'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Atomic Operation Overhead:' : 'Overhead de Operaciones Atómicas:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Thread-safe handles use atomic operations which have higher cost than regular memory access'
                : 'Los handles thread-safe usan operaciones atómicas que tienen mayor costo que el acceso regular a memoria'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Observability Impact:' : 'Impacto de Observabilidad:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Debugging features add memory and CPU overhead - consider conditional compilation for production'
                : 'Las características de debugging añaden overhead de memoria y CPU - considera compilación condicional para producción'
              }
            </li>
          </ul>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default Lesson85_SmartHandlePatterns;