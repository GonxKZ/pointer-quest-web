import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone, Line, Torus, Dodecahedron } from '@react-three/drei';
import { useApp } from '../context/AppContext';

interface MasterExaminationState {
  currentChallenge: number;
  challenges: {
    id: number;
    title: string;
    type: 'capstone' | 'integration' | 'real-world' | 'expert';
    difficulty: 'master' | 'expert' | 'legend';
    description: string;
    status: 'locked' | 'available' | 'in-progress' | 'completed' | 'mastered';
    points: number;
    timeLimit: number;
    codeSnippet: string;
    solution: string;
    realWorldContext: string;
    testCases: string[];
    expertHints: string[];
  }[];
  masterStats: {
    totalChallenges: number;
    completed: number;
    mastered: number;
    totalPoints: number;
    timeElapsed: number;
    expertLevel: 'novice' | 'advanced' | 'expert' | 'master' | 'legend';
    certification: boolean;
  };
  capstoneProject: {
    phase: 'design' | 'implementation' | 'testing' | 'optimization' | 'completed';
    components: string[];
    integrationTests: boolean;
    performanceTargets: boolean;
    expertReview: boolean;
  };
  showExpertAnalysis: boolean;
  showRealWorldContext: boolean;
  masterModeEnabled: boolean;
}

interface MasterVisualizationProps {
  state: MasterExaminationState;
  onChallengeSelect: (index: number) => void;
}

const MasterVisualization: React.FC<MasterVisualizationProps> = ({ 
  state, 
  onChallengeSelect 
}) => {
  const groupRef = useRef<any>();
  const coreRef = useRef<any>();
  const orbitRefs = useRef<any[]>([]);
  const integrationRef = useRef<any>();

  useFrame((frameState) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = frameState.clock.elapsedTime * 0.05;
    }
    
    if (coreRef.current) {
      // Pulsing core representing mastery level
      const pulse = 1 + Math.sin(frameState.clock.elapsedTime * 2) * 0.1;
      coreRef.current.scale.setScalar(pulse);
      
      // Color change based on progress
      const progress = state.masterStats.completed / state.masterStats.totalChallenges;
      coreRef.current.children.forEach((child: any) => {
        if (child.material) {
          child.material.color.setHSL(
            0.1 + progress * 0.5, // Hue from orange to cyan
            0.8,
            0.5 + progress * 0.3
          );
        }
      });
    }
    
    // Animate challenge orbits
    orbitRefs.current.forEach((orbit, index) => {
      if (orbit) {
        const speed = 0.3 + index * 0.1;
        const radius = 4 + index * 1.5;
        const angle = frameState.clock.elapsedTime * speed + index * Math.PI / 2;
        
        orbit.position.x = Math.cos(angle) * radius;
        orbit.position.z = Math.sin(angle) * radius;
        orbit.position.y = Math.sin(frameState.clock.elapsedTime + index) * 0.5;
        
        // Challenge status animation
        const challenge = state.challenges[index];
        if (challenge) {
          const statusIntensity = challenge.status === 'mastered' ? 1.2 : 
                                 challenge.status === 'completed' ? 1.0 :
                                 challenge.status === 'in-progress' ? 0.8 : 0.4;
          orbit.scale.setScalar(statusIntensity);
        }
      }
    });
    
    if (integrationRef.current) {
      // Integration network animation
      integrationRef.current.rotation.x = Math.sin(frameState.clock.elapsedTime * 0.7) * 0.2;
      integrationRef.current.rotation.z = Math.cos(frameState.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const getChallengeColor = (challenge: any, index: number) => {
    const colors = {
      'mastered': '#00ff88',
      'completed': '#00d4ff', 
      'in-progress': '#ffa500',
      'available': '#ffff00',
      'locked': '#666666'
    };
    return colors[challenge.status as keyof typeof colors] || '#666666';
  };

  const getDifficultyShape = (difficulty: string, index: number) => {
    switch (difficulty) {
      case 'legend':
        return <Dodecahedron args={[0.8]} />;
      case 'expert':
        return <Torus args={[0.6, 0.3]} />;
      case 'master':
      default:
        return <Sphere args={[0.7]} />;
    }
  };

  return (
    <group ref={groupRef}>
      {/* Central Mastery Core */}
      <group ref={coreRef} position={[0, 0, 0]}>
        <Dodecahedron args={[1.5]}>
          <meshStandardMaterial 
            color="#ff6b35" 
            transparent 
            opacity={0.8}
            emissive="#ff6b35"
            emissiveIntensity={0.2}
          />
        </Dodecahedron>
        
        {/* Inner energy core */}
        <Sphere args={[0.8]}>
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.9}
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </Sphere>
        
        <Text
          position={[0, 0, 2]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          MASTER
        </Text>
      </group>

      {/* Challenge Orbits */}
      {state.challenges.map((challenge, index) => (
        <group 
          key={`challenge-${challenge.id}`}
          ref={(el) => { if (el) orbitRefs.current[index] = el; }}
          onClick={() => onChallengeSelect(index)}
        >
          {getDifficultyShape(challenge.difficulty, index)}
          <meshStandardMaterial 
            color={getChallengeColor(challenge, index)}
            transparent 
            opacity={0.9}
            emissive={getChallengeColor(challenge, index)}
            emissiveIntensity={challenge.status === 'in-progress' ? 0.3 : 0.1}
          />
          
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {challenge.title}
          </Text>
          
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.1}
            color={getChallengeColor(challenge, index)}
            anchorX="center"
            anchorY="middle"
          >
            {challenge.points} pts
          </Text>
        </group>
      ))}

      {/* Integration Network */}
      <group ref={integrationRef} position={[0, 3, 0]}>
        {/* Network nodes */}
        {[...Array(8)].map((_, i) => (
          <Sphere 
            key={`network-${i}`}
            args={[0.1]} 
            position={[
              Math.cos(i * Math.PI / 4) * 2,
              0,
              Math.sin(i * Math.PI / 4) * 2
            ]}
          >
            <meshStandardMaterial color="#4ecdc4" transparent opacity={0.7} />
          </Sphere>
        ))}
        
        {/* Network connections */}
        {[...Array(8)].map((_, i) => (
          <Line
            key={`connection-${i}`}
            points={[
              [Math.cos(i * Math.PI / 4) * 2, 0, Math.sin(i * Math.PI / 4) * 2],
              [Math.cos((i + 1) * Math.PI / 4) * 2, 0, Math.sin((i + 1) * Math.PI / 4) * 2]
            ]}
            color="#4ecdc4"
            lineWidth={2}
            transparent
            opacity={0.5}
          />
        ))}
        
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.2}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          Integration
        </Text>
      </group>

      {/* Capstone Project Visualization */}
      <group position={[0, -3, 0]}>
        <Box args={[6, 0.2, 6]}>
          <meshStandardMaterial color="#2c3e50" transparent opacity={0.8} />
        </Box>
        
        {/* Project phases */}
        {['Design', 'Implementation', 'Testing', 'Optimization'].map((phase, index) => (
          <Box 
            key={`phase-${index}`}
            args={[1.2, 0.6, 1.2]} 
            position={[index * 1.5 - 2.25, 0.4, 0]}
          >
            <meshStandardMaterial 
              color={index <= Object.values(state.capstoneProject).indexOf(true) ? '#2ecc71' : '#7f8c8d'}
              transparent 
              opacity={0.8} 
            />
          </Box>
        ))}
        
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.2}
          color="#2ecc71"
          anchorX="center"
          anchorY="middle"
        >
          Capstone Project
        </Text>
      </group>

      {/* Master-level statistics display */}
      <group position={[6, 2, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.15}
          color="#ffd700"
          anchorX="center"
        >
          Master Stats
        </Text>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {`Level: ${state.masterStats.expertLevel.toUpperCase()}`}
        </Text>
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {`Score: ${state.masterStats.totalPoints}`}
        </Text>
        <Text
          position={[0, -0.1, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {`Mastered: ${state.masterStats.mastered}/${state.masterStats.totalChallenges}`}
        </Text>
      </group>

      {/* Lighting effects */}
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#4ecdc4" />
      <pointLight position={[0, 0, 8]} intensity={0.6} color="#ffd700" />
    </group>
  );
};

const Lesson120_MastersFinalExamination: React.FC = () => {
  const { state } = useApp();
  const [examinationState, setExaminationState] = useState<MasterExaminationState>({
    currentChallenge: 0,
    challenges: [
      {
        id: 1,
        title: state.language === 'en' ? 'Memory Arena System' : 'Sistema de Arena de Memoria',
        type: 'capstone',
        difficulty: 'master',
        description: state.language === 'en' 
          ? 'Design and implement a comprehensive memory arena system with custom allocators'
          : 'Diseñar e implementar un sistema completo de arena de memoria con asignadores personalizados',
        status: 'available',
        points: 150,
        timeLimit: 3600,
        codeSnippet: `// Master Challenge 1: Memory Arena System
#include <memory>
#include <vector>
#include <unordered_map>
#include <atomic>
#include <mutex>
#include <thread>

template<typename T>
class MemoryArena {
private:
    struct Block {
        void* ptr;
        size_t size;
        bool in_use;
        std::chrono::steady_clock::time_point allocated_at;
        std::string debug_info;
    };

public:
    class ArenaAllocator {
    public:
        using value_type = T;
        
        ArenaAllocator(MemoryArena* arena) : arena_(arena) {}
        
        template<typename U>
        ArenaAllocator(const ArenaAllocator<U>& other) : arena_(other.arena_) {}
        
        T* allocate(size_t n) {
            return static_cast<T*>(arena_->allocate(n * sizeof(T)));
        }
        
        void deallocate(T* ptr, size_t n) {
            arena_->deallocate(ptr, n * sizeof(T));
        }
        
        template<typename U>
        bool operator==(const ArenaAllocator<U>& other) const {
            return arena_ == other.arena_;
        }
        
    private:
        MemoryArena* arena_;
        template<typename U> friend class ArenaAllocator;
    };

public:
    MemoryArena(size_t initial_size = 1024 * 1024) 
        : total_size_(initial_size), used_size_(0) {
        // TODO: Implement arena initialization
        // Requirements:
        // 1. Allocate large contiguous memory block
        // 2. Initialize free list
        // 3. Set up thread safety mechanisms
        // 4. Initialize debug tracking
    }
    
    ~MemoryArena() {
        // TODO: Implement cleanup
        // Requirements:
        // 1. Check for memory leaks
        // 2. Log usage statistics
        // 3. Free all allocated blocks
        // 4. Clean up internal structures
    }
    
    void* allocate(size_t size, size_t alignment = alignof(std::max_align_t)) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        // TODO: Implement aligned allocation
        // Requirements:
        // 1. Find suitable free block
        // 2. Handle alignment requirements
        // 3. Split blocks if necessary
        // 4. Update internal tracking
        // 5. Thread-safe implementation
        
        return nullptr; // Placeholder
    }
    
    void deallocate(void* ptr, size_t size) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        // TODO: Implement deallocation
        // Requirements:
        // 1. Validate pointer belongs to arena
        // 2. Mark block as free
        // 3. Coalesce adjacent free blocks
        // 4. Update statistics
        // 5. Debug validation
    }
    
    // Performance monitoring
    struct Statistics {
        size_t total_allocations;
        size_t total_deallocations;
        size_t peak_usage;
        size_t current_usage;
        size_t fragmentation_percent;
        std::chrono::nanoseconds avg_alloc_time;
    };
    
    Statistics getStatistics() const {
        // TODO: Implement statistics collection
        return Statistics{};
    }
    
    // Debug and validation
    bool validate() const {
        // TODO: Implement arena validation
        // Requirements:
        // 1. Check block list consistency
        // 2. Verify no double allocations
        // 3. Validate free list integrity
        // 4. Check for corruption
        return true;
    }
    
    void dumpState(std::ostream& os) const {
        // TODO: Implement state dumping for debugging
    }

private:
    mutable std::mutex mutex_;
    void* arena_start_;
    size_t total_size_;
    std::atomic<size_t> used_size_;
    std::vector<Block> blocks_;
    std::unordered_map<void*, size_t> allocation_map_;
    Statistics stats_;
    
    // Free list for efficient allocation
    struct FreeBlock {
        void* ptr;
        size_t size;
        FreeBlock* next;
    };
    FreeBlock* free_list_;
    
    // Debugging support
    std::atomic<bool> debug_mode_;
    std::vector<std::string> debug_log_;
};

// Usage example and test cases
void testArenaSystem() {
    // TODO: Implement comprehensive test suite
    // Requirements:
    // 1. Basic allocation/deallocation
    // 2. Alignment handling
    // 3. Thread safety validation
    // 4. Performance benchmarking
    // 5. Memory leak detection
    // 6. Fragmentation analysis
    
    MemoryArena<int> arena(1024 * 1024); // 1MB arena
    
    // Test 1: Basic allocation
    auto allocator = arena.ArenaAllocator(&arena);
    std::vector<int, decltype(allocator)> vec(allocator);
    
    // Test 2: Stress test
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.emplace_back([&arena]() {
            // Concurrent allocation test
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    // Test 3: Performance benchmark
    auto start = std::chrono::high_resolution_clock::now();
    // ... benchmark code ...
    auto end = std::chrono::high_resolution_clock::now();
}`,
        solution: `// Complete implementation with all requirements
// This is a comprehensive solution showing proper arena design`,
        realWorldContext: state.language === 'en' 
          ? 'Memory arenas are crucial in game engines, real-time systems, and high-performance applications where allocation patterns are predictable and garbage collection pauses must be avoided.'
          : 'Las arenas de memoria son cruciales en motores de juegos, sistemas en tiempo real, y aplicaciones de alto rendimiento donde los patrones de asignación son predecibles y deben evitarse las pausas de recolección de basura.',
        testCases: [
          'Basic allocation/deallocation correctness',
          'Thread safety under concurrent access',
          'Alignment handling for various types',
          'Memory leak detection accuracy',
          'Performance vs standard allocator',
          'Fragmentation analysis and mitigation'
        ],
        expertHints: [
          'Use a free list for O(1) allocation',
          'Implement block coalescing to reduce fragmentation', 
          'Consider using memory fences for lockless operations',
          'Add statistical tracking for performance analysis'
        ]
      },
      
      {
        id: 2,
        title: state.language === 'en' ? 'Smart Pointer Framework' : 'Framework de Smart Pointers',
        type: 'capstone',
        difficulty: 'expert',
        description: state.language === 'en'
          ? 'Create a complete smart pointer framework with custom reference counting and weak reference support'
          : 'Crear un framework completo de smart pointers con conteo de referencias personalizado y soporte de referencias débiles',
        status: 'locked',
        points: 200,
        timeLimit: 4200,
        codeSnippet: `// Master Challenge 2: Custom Smart Pointer Framework
#include <atomic>
#include <memory>
#include <type_traits>
#include <exception>

// Forward declarations
template<typename T> class shared_ptr_custom;
template<typename T> class weak_ptr_custom;
template<typename T> class enable_shared_from_this_custom;

// Control block for reference counting
class control_block_base {
public:
    std::atomic<long> shared_count{1};
    std::atomic<long> weak_count{1};
    
    virtual ~control_block_base() = default;
    virtual void destroy_object() = 0;
    virtual void destroy_this() = 0;
    
    void add_shared_ref() {
        shared_count.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release_shared() {
        if (shared_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            destroy_object();
            release_weak();
        }
    }
    
    void add_weak_ref() {
        weak_count.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release_weak() {
        if (weak_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            destroy_this();
        }
    }
    
    long use_count() const {
        return shared_count.load(std::memory_order_relaxed);
    }
    
    bool expired() const {
        return shared_count.load(std::memory_order_relaxed) == 0;
    }
};

template<typename T, typename Deleter>
class control_block_ptr : public control_block_base {
private:
    T* ptr_;
    Deleter deleter_;
    
public:
    control_block_ptr(T* ptr, Deleter deleter) 
        : ptr_(ptr), deleter_(std::move(deleter)) {}
    
    void destroy_object() override {
        deleter_(ptr_);
        ptr_ = nullptr;
    }
    
    void destroy_this() override {
        delete this;
    }
};

template<typename T>
class control_block_obj : public control_block_base {
private:
    typename std::aligned_storage<sizeof(T), alignof(T)>::type storage_;
    bool constructed_;
    
public:
    template<typename... Args>
    control_block_obj(Args&&... args) : constructed_(true) {
        new(&storage_) T(std::forward<Args>(args)...);
    }
    
    T* get() {
        return reinterpret_cast<T*>(&storage_);
    }
    
    void destroy_object() override {
        if (constructed_) {
            get()->~T();
            constructed_ = false;
        }
    }
    
    void destroy_this() override {
        delete this;
    }
};

// Custom shared_ptr implementation
template<typename T>
class shared_ptr_custom {
private:
    T* ptr_;
    control_block_base* control_;
    
    template<typename U> friend class shared_ptr_custom;
    template<typename U> friend class weak_ptr_custom;

public:
    using element_type = T;
    
    // Constructors
    constexpr shared_ptr_custom() noexcept : ptr_(nullptr), control_(nullptr) {}
    
    constexpr shared_ptr_custom(std::nullptr_t) noexcept : ptr_(nullptr), control_(nullptr) {}
    
    template<typename Y>
    explicit shared_ptr_custom(Y* ptr) : ptr_(ptr) {
        static_assert(std::is_convertible_v<Y*, T*>);
        try {
            control_ = new control_block_ptr<Y, std::default_delete<Y>>(ptr, std::default_delete<Y>{});
        } catch (...) {
            delete ptr;
            throw;
        }
    }
    
    template<typename Y, typename Deleter>
    shared_ptr_custom(Y* ptr, Deleter deleter) : ptr_(ptr) {
        try {
            control_ = new control_block_ptr<Y, Deleter>(ptr, std::move(deleter));
        } catch (...) {
            deleter(ptr);
            throw;
        }
    }
    
    // Copy constructor
    shared_ptr_custom(const shared_ptr_custom& other) noexcept 
        : ptr_(other.ptr_), control_(other.control_) {
        if (control_) {
            control_->add_shared_ref();
        }
    }
    
    // Move constructor  
    shared_ptr_custom(shared_ptr_custom&& other) noexcept 
        : ptr_(other.ptr_), control_(other.control_) {
        other.ptr_ = nullptr;
        other.control_ = nullptr;
    }
    
    // Converting constructors
    template<typename Y>
    shared_ptr_custom(const shared_ptr_custom<Y>& other) noexcept 
        : ptr_(other.ptr_), control_(other.control_) {
        static_assert(std::is_convertible_v<Y*, T*>);
        if (control_) {
            control_->add_shared_ref();
        }
    }
    
    // Aliasing constructor
    template<typename Y>
    shared_ptr_custom(const shared_ptr_custom<Y>& other, T* ptr) noexcept 
        : ptr_(ptr), control_(other.control_) {
        if (control_) {
            control_->add_shared_ref();
        }
    }
    
    // Weak pointer constructor
    template<typename Y>
    explicit shared_ptr_custom(const weak_ptr_custom<Y>& weak) : ptr_(nullptr), control_(nullptr) {
        if (!weak.expired()) {
            ptr_ = weak.ptr_;
            control_ = weak.control_;
            if (control_) {
                control_->add_shared_ref();
            }
        } else {
            throw std::bad_weak_ptr{};
        }
    }
    
    // Destructor
    ~shared_ptr_custom() {
        if (control_) {
            control_->release_shared();
        }
    }
    
    // Assignment operators
    shared_ptr_custom& operator=(const shared_ptr_custom& other) noexcept {
        shared_ptr_custom(other).swap(*this);
        return *this;
    }
    
    shared_ptr_custom& operator=(shared_ptr_custom&& other) noexcept {
        shared_ptr_custom(std::move(other)).swap(*this);
        return *this;
    }
    
    template<typename Y>
    shared_ptr_custom& operator=(const shared_ptr_custom<Y>& other) noexcept {
        shared_ptr_custom(other).swap(*this);
        return *this;
    }
    
    // Observers
    T* get() const noexcept {
        return ptr_;
    }
    
    T& operator*() const noexcept {
        return *ptr_;
    }
    
    T* operator->() const noexcept {
        return ptr_;
    }
    
    long use_count() const noexcept {
        return control_ ? control_->use_count() : 0;
    }
    
    bool unique() const noexcept {
        return use_count() == 1;
    }
    
    explicit operator bool() const noexcept {
        return ptr_ != nullptr;
    }
    
    // Modifiers
    void reset() noexcept {
        shared_ptr_custom{}.swap(*this);
    }
    
    template<typename Y>
    void reset(Y* ptr) {
        shared_ptr_custom(ptr).swap(*this);
    }
    
    template<typename Y, typename Deleter>
    void reset(Y* ptr, Deleter deleter) {
        shared_ptr_custom(ptr, deleter).swap(*this);
    }
    
    void swap(shared_ptr_custom& other) noexcept {
        std::swap(ptr_, other.ptr_);
        std::swap(control_, other.control_);
    }
    
    // Owner-based ordering
    template<typename Y>
    bool owner_before(const shared_ptr_custom<Y>& other) const noexcept {
        return control_ < other.control_;
    }
    
    template<typename Y>
    bool owner_before(const weak_ptr_custom<Y>& other) const noexcept {
        return control_ < other.control_;
    }
};

// Custom weak_ptr implementation
template<typename T>
class weak_ptr_custom {
private:
    T* ptr_;
    control_block_base* control_;
    
    template<typename U> friend class shared_ptr_custom;
    template<typename U> friend class weak_ptr_custom;

public:
    using element_type = T;
    
    // Constructors
    constexpr weak_ptr_custom() noexcept : ptr_(nullptr), control_(nullptr) {}
    
    weak_ptr_custom(const weak_ptr_custom& other) noexcept 
        : ptr_(other.ptr_), control_(other.control_) {
        if (control_) {
            control_->add_weak_ref();
        }
    }
    
    template<typename Y>
    weak_ptr_custom(const weak_ptr_custom<Y>& other) noexcept 
        : ptr_(other.ptr_), control_(other.control_) {
        static_assert(std::is_convertible_v<Y*, T*>);
        if (control_) {
            control_->add_weak_ref();
        }
    }
    
    template<typename Y>
    weak_ptr_custom(const shared_ptr_custom<Y>& shared) noexcept 
        : ptr_(shared.ptr_), control_(shared.control_) {
        static_assert(std::is_convertible_v<Y*, T*>);
        if (control_) {
            control_->add_weak_ref();
        }
    }
    
    // Destructor
    ~weak_ptr_custom() {
        if (control_) {
            control_->release_weak();
        }
    }
    
    // Assignment
    weak_ptr_custom& operator=(const weak_ptr_custom& other) noexcept {
        weak_ptr_custom(other).swap(*this);
        return *this;
    }
    
    template<typename Y>
    weak_ptr_custom& operator=(const weak_ptr_custom<Y>& other) noexcept {
        weak_ptr_custom(other).swap(*this);
        return *this;
    }
    
    template<typename Y>
    weak_ptr_custom& operator=(const shared_ptr_custom<Y>& shared) noexcept {
        weak_ptr_custom(shared).swap(*this);
        return *this;
    }
    
    // Observers
    long use_count() const noexcept {
        return control_ ? control_->use_count() : 0;
    }
    
    bool expired() const noexcept {
        return use_count() == 0;
    }
    
    shared_ptr_custom<T> lock() const noexcept {
        if (expired()) {
            return shared_ptr_custom<T>{};
        }
        return shared_ptr_custom<T>(*this);
    }
    
    // Modifiers
    void reset() noexcept {
        weak_ptr_custom{}.swap(*this);
    }
    
    void swap(weak_ptr_custom& other) noexcept {
        std::swap(ptr_, other.ptr_);
        std::swap(control_, other.control_);
    }
    
    // Owner-based ordering
    template<typename Y>
    bool owner_before(const weak_ptr_custom<Y>& other) const noexcept {
        return control_ < other.control_;
    }
    
    template<typename Y>
    bool owner_before(const shared_ptr_custom<Y>& other) const noexcept {
        return control_ < other.control_;
    }
};

// enable_shared_from_this equivalent
template<typename T>
class enable_shared_from_this_custom {
private:
    mutable weak_ptr_custom<T> weak_this_;
    
protected:
    constexpr enable_shared_from_this_custom() noexcept = default;
    enable_shared_from_this_custom(const enable_shared_from_this_custom&) noexcept = default;
    enable_shared_from_this_custom& operator=(const enable_shared_from_this_custom&) noexcept = default;
    ~enable_shared_from_this_custom() = default;
    
public:
    shared_ptr_custom<T> shared_from_this() {
        return shared_ptr_custom<T>(weak_this_);
    }
    
    shared_ptr_custom<const T> shared_from_this() const {
        return shared_ptr_custom<const T>(weak_this_);
    }
    
    weak_ptr_custom<T> weak_from_this() noexcept {
        return weak_this_;
    }
    
    weak_ptr_custom<const T> weak_from_this() const noexcept {
        return weak_this_;
    }
    
private:
    template<typename U> friend class shared_ptr_custom;
    
    void set_weak_this(const shared_ptr_custom<T>& sp) const {
        weak_this_ = sp;
    }
};

// Factory functions
template<typename T, typename... Args>
shared_ptr_custom<T> make_shared_custom(Args&&... args) {
    auto* control = new control_block_obj<T>(std::forward<Args>(args)...);
    shared_ptr_custom<T> sp;
    sp.ptr_ = control->get();
    sp.control_ = control;
    
    // Handle enable_shared_from_this
    if constexpr (std::is_base_of_v<enable_shared_from_this_custom<T>, T>) {
        sp.ptr_->set_weak_this(sp);
    }
    
    return sp;
}

// Comparison operators
template<typename T, typename U>
bool operator==(const shared_ptr_custom<T>& lhs, const shared_ptr_custom<U>& rhs) noexcept {
    return lhs.get() == rhs.get();
}

template<typename T>
bool operator==(const shared_ptr_custom<T>& lhs, std::nullptr_t) noexcept {
    return !lhs;
}

// Hash support
template<typename T>
struct hash<shared_ptr_custom<T>> {
    size_t operator()(const shared_ptr_custom<T>& sp) const noexcept {
        return std::hash<T*>{}(sp.get());
    }
};

// TODO: Implement comprehensive test suite
void testCustomSmartPointers() {
    // Test basic functionality
    // Test thread safety
    // Test performance vs std equivalents
    // Test edge cases and error conditions
}`,
        solution: `// Complete custom smart pointer implementation`,
        realWorldContext: state.language === 'en'
          ? 'Custom smart pointers are essential in embedded systems, game engines, and specialized applications requiring fine-grained control over memory management and reference counting behavior.'
          : 'Los smart pointers personalizados son esenciales en sistemas embebidos, motores de juegos, y aplicaciones especializadas que requieren control fino sobre la gestión de memoria y el comportamiento del conteo de referencias.',
        testCases: [
          'Basic construction/destruction correctness',
          'Thread safety of reference counting',
          'Proper handling of cycles with weak_ptr',
          'enable_shared_from_this functionality',
          'Exception safety during construction',
          'Performance comparison with std smart pointers'
        ],
        expertHints: [
          'Use atomic operations for thread-safe reference counting',
          'Implement proper exception safety in constructors',
          'Consider control block optimization for make_shared',
          'Handle enable_shared_from_this integration carefully'
        ]
      },
      
      {
        id: 3,
        title: state.language === 'en' ? 'Real-Time Systems Integration' : 'Integración de Sistemas en Tiempo Real',
        type: 'real-world',
        difficulty: 'expert',
        description: state.language === 'en'
          ? 'Implement pointer management for real-time systems with strict timing guarantees'
          : 'Implementar gestión de punteros para sistemas en tiempo real con garantías estrictas de tiempo',
        status: 'locked', 
        points: 175,
        timeLimit: 3000,
        codeSnippet: `// Master Challenge 3: Real-Time Systems Integration
#include <chrono>
#include <atomic>
#include <memory>
#include <array>

// Real-time constraints
constexpr std::chrono::nanoseconds MAX_ALLOCATION_TIME{1000}; // 1μs max
constexpr std::chrono::nanoseconds MAX_DEALLOCATION_TIME{500}; // 0.5μs max
constexpr size_t RT_MEMORY_POOL_SIZE = 1024 * 1024; // 1MB pool

class RealTimeMemoryManager {
public:
    // Real-time safe memory pool
    template<typename T, size_t MaxObjects = 1000>
    class RTObjectPool {
    private:
        struct alignas(T) Storage {
            char data[sizeof(T)];
        };
        
        std::array<Storage, MaxObjects> pool_;
        std::atomic<uint64_t> free_mask_{(1ULL << MaxObjects) - 1};
        std::atomic<size_t> allocated_count_{0};
        
    public:
        // Deterministic O(1) allocation
        T* allocate() noexcept {
            auto start = std::chrono::high_resolution_clock::now();
            
            // TODO: Implement lockless allocation
            // Requirements:
            // 1. Must complete within MAX_ALLOCATION_TIME
            // 2. Thread-safe without blocking
            // 3. Deterministic performance
            // 4. No dynamic memory allocation
            // 5. Return nullptr if pool exhausted
            
            uint64_t mask = free_mask_.load(std::memory_order_acquire);
            while (mask != 0) {
                int index = __builtin_ctzll(mask); // Find first set bit
                uint64_t bit = 1ULL << index;
                
                if (free_mask_.compare_exchange_weak(mask, mask & ~bit, 
                                                   std::memory_order_acq_rel)) {
                    allocated_count_.fetch_add(1, std::memory_order_relaxed);
                    
                    auto end = std::chrono::high_resolution_clock::now();
                    auto duration = end - start;
                    
                    // Verify timing constraint
                    if (duration > MAX_ALLOCATION_TIME) {
                        // Log timing violation in real system
                    }
                    
                    return reinterpret_cast<T*>(&pool_[index]);
                }
            }
            
            return nullptr; // Pool exhausted
        }
        
        // Deterministic O(1) deallocation
        void deallocate(T* ptr) noexcept {
            if (!ptr) return;
            
            auto start = std::chrono::high_resolution_clock::now();
            
            // TODO: Implement lockless deallocation
            // Requirements:
            // 1. Must complete within MAX_DEALLOCATION_TIME
            // 2. Validate pointer belongs to pool
            // 3. Thread-safe without blocking
            // 4. No undefined behavior on double-free
            
            // Validate pointer range
            auto* storage_ptr = reinterpret_cast<Storage*>(ptr);
            if (storage_ptr < &pool_[0] || storage_ptr >= &pool_[MaxObjects]) {
                return; // Invalid pointer
            }
            
            size_t index = storage_ptr - &pool_[0];
            uint64_t bit = 1ULL << index;
            
            // Atomic bit set
            uint64_t mask = free_mask_.load(std::memory_order_acquire);
            while (!free_mask_.compare_exchange_weak(mask, mask | bit,
                                                   std::memory_order_acq_rel)) {
                // Retry
            }
            
            allocated_count_.fetch_sub(1, std::memory_order_relaxed);
            
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = end - start;
            
            if (duration > MAX_DEALLOCATION_TIME) {
                // Log timing violation
            }
        }
        
        // Real-time statistics
        struct RTStats {
            size_t allocated_objects;
            size_t peak_allocation;
            std::chrono::nanoseconds max_alloc_time;
            std::chrono::nanoseconds max_dealloc_time;
            size_t allocation_failures;
        };
        
        RTStats getStatistics() const noexcept {
            // TODO: Implement statistics gathering
            // Must be real-time safe itself
            return RTStats{};
        }
    };
    
    // Real-time smart pointer
    template<typename T>
    class rt_unique_ptr {
    private:
        T* ptr_;
        RTObjectPool<T>* pool_;
        
    public:
        explicit rt_unique_ptr(RTObjectPool<T>* pool = nullptr) noexcept 
            : ptr_(nullptr), pool_(pool) {}
        
        // Real-time construction
        template<typename... Args>
        static rt_unique_ptr make(RTObjectPool<T>* pool, Args&&... args) noexcept {
            auto start = std::chrono::high_resolution_clock::now();
            
            rt_unique_ptr ptr(pool);
            ptr.ptr_ = pool->allocate();
            
            if (ptr.ptr_) {
                // Placement new with timing verification
                try {
                    new(ptr.ptr_) T(std::forward<Args>(args)...);
                } catch (...) {
                    pool->deallocate(ptr.ptr_);
                    ptr.ptr_ = nullptr;
                }
            }
            
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = end - start;
            
            // Verify total construction time
            if (duration > MAX_ALLOCATION_TIME * 2) {
                // Log timing violation
            }
            
            return ptr;
        }
        
        // Move semantics only (no copying for RT safety)
        rt_unique_ptr(rt_unique_ptr&& other) noexcept 
            : ptr_(other.ptr_), pool_(other.pool_) {
            other.ptr_ = nullptr;
            other.pool_ = nullptr;
        }
        
        rt_unique_ptr& operator=(rt_unique_ptr&& other) noexcept {
            if (this != &other) {
                reset();
                ptr_ = other.ptr_;
                pool_ = other.pool_;
                other.ptr_ = nullptr;
                other.pool_ = nullptr;
            }
            return *this;
        }
        
        ~rt_unique_ptr() {
            reset();
        }
        
        void reset() noexcept {
            if (ptr_ && pool_) {
                auto start = std::chrono::high_resolution_clock::now();
                
                ptr_->~T();
                pool_->deallocate(ptr_);
                
                auto end = std::chrono::high_resolution_clock::now();
                auto duration = end - start;
                
                if (duration > MAX_DEALLOCATION_TIME * 2) {
                    // Log timing violation
                }
            }
            ptr_ = nullptr;
            pool_ = nullptr;
        }
        
        T* get() const noexcept { return ptr_; }
        T& operator*() const noexcept { return *ptr_; }
        T* operator->() const noexcept { return ptr_; }
        explicit operator bool() const noexcept { return ptr_ != nullptr; }
        
        // Disable copy operations
        rt_unique_ptr(const rt_unique_ptr&) = delete;
        rt_unique_ptr& operator=(const rt_unique_ptr&) = delete;
    };
};

// Real-time system integration example
class RTControlSystem {
private:
    struct SensorData {
        double position;
        double velocity;
        std::chrono::steady_clock::time_point timestamp;
    };
    
    struct ControlCommand {
        double torque;
        std::chrono::steady_clock::time_point deadline;
    };
    
    RealTimeMemoryManager::RTObjectPool<SensorData, 1000> sensor_pool_;
    RealTimeMemoryManager::RTObjectPool<ControlCommand, 1000> command_pool_;
    
public:
    // Real-time control loop
    void controlLoop() {
        while (true) {
            auto cycle_start = std::chrono::high_resolution_clock::now();
            
            // TODO: Implement real-time control algorithm
            // Requirements:
            // 1. Must complete within control period (e.g., 1ms)
            // 2. Use only RT-safe memory operations
            // 3. Predictable execution time
            // 4. No blocking operations
            // 5. Graceful degradation on overload
            
            // Phase 1: Sensor data acquisition
            auto sensor_data = RealTimeMemoryManager::rt_unique_ptr<SensorData>::make(
                &sensor_pool_, 0.0, 0.0, cycle_start);
            
            if (!sensor_data) {
                // Handle memory exhaustion
                handleResourceExhaustion();
                continue;
            }
            
            // Phase 2: Control algorithm execution
            auto control_output = computeControl(*sensor_data);
            
            // Phase 3: Command generation
            auto command = RealTimeMemoryManager::rt_unique_ptr<ControlCommand>::make(
                &command_pool_, control_output, cycle_start + std::chrono::milliseconds(1));
            
            if (command) {
                executeCommand(*command);
            }
            
            // Phase 4: Timing verification
            auto cycle_end = std::chrono::high_resolution_clock::now();
            auto cycle_time = cycle_end - cycle_start;
            
            if (cycle_time > std::chrono::milliseconds(1)) {
                // Real-time constraint violation
                handleTimingViolation(cycle_time);
            }
            
            // Wait for next control cycle
            waitForNextCycle(cycle_start);
        }
    }
    
private:
    double computeControl(const SensorData& data) noexcept {
        // TODO: Implement deterministic control algorithm
        // Must be real-time safe and deterministic
        return 0.0;
    }
    
    void executeCommand(const ControlCommand& cmd) noexcept {
        // TODO: Send command to actuators
    }
    
    void handleResourceExhaustion() noexcept {
        // TODO: Implement graceful degradation
    }
    
    void handleTimingViolation(std::chrono::nanoseconds violation) noexcept {
        // TODO: Log and adapt to timing violations
    }
    
    void waitForNextCycle(std::chrono::steady_clock::time_point cycle_start) noexcept {
        // TODO: Implement precise timing control
    }
};

// TODO: Implement comprehensive test suite
void testRealTimeSystem() {
    // Test timing constraints
    // Test deterministic behavior
    // Test resource exhaustion handling
    // Test system integration
}`,
        solution: `// Complete real-time system implementation`,
        realWorldContext: state.language === 'en'
          ? 'Real-time pointer management is critical in automotive control systems, robotics, aerospace applications, and industrial automation where deterministic timing is essential for safety and performance.'
          : 'La gestión de punteros en tiempo real es crítica en sistemas de control automotriz, robótica, aplicaciones aeroespaciales, y automatización industrial donde el tiempo determinístico es esencial para la seguridad y el rendimiento.',
        testCases: [
          'Allocation time within constraints',
          'Deterministic performance under load',
          'Thread safety in multi-core systems', 
          'Resource exhaustion handling',
          'Timing violation recovery',
          'System integration validation'
        ],
        expertHints: [
          'Use lockless algorithms for predictable timing',
          'Pre-allocate all resources at system startup',
          'Implement graceful degradation strategies',
          'Use hardware timing facilities for precision'
        ]
      },
      
      {
        id: 4,
        title: state.language === 'en' ? 'Cross-Platform Optimization' : 'Optimización Multiplataforma',
        type: 'expert',
        difficulty: 'expert',
        description: state.language === 'en'
          ? 'Create optimized pointer implementations for different architectures and platforms'
          : 'Crear implementaciones optimizadas de punteros para diferentes arquitecturas y plataformas',
        status: 'locked',
        points: 160,
        timeLimit: 2400,
        codeSnippet: `// Platform-specific optimizations and abstractions`,
        solution: `// Cross-platform implementation`,
        realWorldContext: state.language === 'en'
          ? 'Cross-platform optimization is crucial for software that runs on multiple architectures (x86, ARM, RISC-V) and operating systems, ensuring optimal performance while maintaining portability.'
          : 'La optimización multiplataforma es crucial para software que ejecuta en múltiples arquitecturas (x86, ARM, RISC-V) y sistemas operativos, asegurando rendimiento óptimo mientras mantiene portabilidad.',
        testCases: ['Architecture-specific optimizations', 'Platform compatibility'],
        expertHints: ['Use compiler intrinsics wisely', 'Test on target platforms']
      },
      
      {
        id: 5,
        title: state.language === 'en' ? 'Final Integration Project' : 'Proyecto de Integración Final',
        type: 'integration',
        difficulty: 'legend',
        description: state.language === 'en'
          ? 'Integrate all concepts into a comprehensive pointer management system'
          : 'Integrar todos los conceptos en un sistema completo de gestión de punteros',
        status: 'locked',
        points: 250,
        timeLimit: 5400,
        codeSnippet: `// Ultimate integration challenge combining all mastered concepts`,
        solution: `// Complete integrated system`,
        realWorldContext: state.language === 'en'
          ? 'This represents the pinnacle of pointer mastery - creating a production-ready system that demonstrates understanding of all advanced concepts and their real-world application.'
          : 'Esto representa la cima del dominio de punteros - crear un sistema listo para producción que demuestre comprensión de todos los conceptos avanzados y su aplicación en el mundo real.',
        testCases: ['Complete system integration', 'Production readiness'],
        expertHints: ['Combine all learned techniques', 'Focus on production quality']
      }
    ],
    masterStats: {
      totalChallenges: 5,
      completed: 0,
      mastered: 0,
      totalPoints: 0,
      timeElapsed: 0,
      expertLevel: 'novice',
      certification: false
    },
    capstoneProject: {
      phase: 'design',
      components: [
        'Memory Management System',
        'Smart Pointer Framework', 
        'Real-Time Integration',
        'Cross-Platform Support',
        'Performance Optimization'
      ],
      integrationTests: false,
      performanceTargets: false,
      expertReview: false
    },
    showExpertAnalysis: false,
    showRealWorldContext: false,
    masterModeEnabled: true
  });

  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Handle timeout
            handleChallengeTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining]);

  const selectChallenge = (index: number) => {
    const challenge = examinationState.challenges[index];
    if (challenge.status === 'locked') return;
    
    setExaminationState(prev => ({
      ...prev,
      currentChallenge: index,
      showExpertAnalysis: false,
      showRealWorldContext: false
    }));
    
    if (challenge.status === 'available') {
      setTimeRemaining(challenge.timeLimit);
      setExaminationState(prev => ({
        ...prev,
        challenges: prev.challenges.map((ch, i) => 
          i === index ? { ...ch, status: 'in-progress' } : ch
        )
      }));
    }
  };

  const completeChallenge = (mastered: boolean = false) => {
    const currentChallenge = examinationState.challenges[examinationState.currentChallenge];
    
    setExaminationState(prev => ({
      ...prev,
      challenges: prev.challenges.map((ch, i) => 
        i === prev.currentChallenge 
          ? { ...ch, status: mastered ? 'mastered' : 'completed' }
          : ch
      ),
      masterStats: {
        ...prev.masterStats,
        completed: prev.masterStats.completed + 1,
        mastered: prev.masterStats.mastered + (mastered ? 1 : 0),
        totalPoints: prev.masterStats.totalPoints + currentChallenge.points * (mastered ? 1.5 : 1),
        expertLevel: calculateExpertLevel(
          prev.masterStats.totalPoints + currentChallenge.points * (mastered ? 1.5 : 1),
          prev.masterStats.mastered + (mastered ? 1 : 0)
        )
      }
    }));
    
    // Unlock next challenge
    const nextIndex = examinationState.currentChallenge + 1;
    if (nextIndex < examinationState.challenges.length) {
      setExaminationState(prev => ({
        ...prev,
        challenges: prev.challenges.map((ch, i) => 
          i === nextIndex ? { ...ch, status: 'available' } : ch
        )
      }));
    }
    
    setTimeRemaining(0);
  };

  const calculateExpertLevel = (points: number, mastered: number): 'novice' | 'advanced' | 'expert' | 'master' | 'legend' => {
    if (points >= 900 && mastered >= 4) return 'legend';
    if (points >= 700 && mastered >= 3) return 'master';  
    if (points >= 500 && mastered >= 2) return 'expert';
    if (points >= 300 && mastered >= 1) return 'advanced';
    return 'novice';
  };

  const handleChallengeTimeout = () => {
    // Handle timeout logic
    console.log('Challenge timed out');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const currentChallenge = examinationState.challenges[examinationState.currentChallenge];
  const progressPercentage = (examinationState.masterStats.completed / examinationState.masterStats.totalChallenges) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '2px solid #ff6b35',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ffd700)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            textShadow: '0 0 30px rgba(255, 107, 53, 0.5)'
          }}>
            🏆 {state.language === 'en' ? "Master's Final Examination" : 'Examen Final de Maestría'}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            margin: '0.5rem 0 0 0',
            opacity: 0.9,
            fontWeight: '300'
          }}>
            {state.language === 'en' 
              ? 'The ultimate test of C++ pointer mastery and real-world expertise'
              : 'La prueba definitiva de dominio de punteros C++ y experiencia del mundo real'}
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'end',
          gap: '0.5rem'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#ffd700'
          }}>
            {state.language === 'en' ? 'Expert Level' : 'Nivel Experto'}: {examinationState.masterStats.expertLevel.toUpperCase()}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>
            {state.language === 'en' ? 'Total Points' : 'Puntos Totales'}: {examinationState.masterStats.totalPoints}
          </div>
          {timeRemaining > 0 && (
            <div style={{
              fontSize: '1.2rem',
              color: timeRemaining < 300 ? '#ff4757' : '#4ecdc4',
              fontWeight: '600'
            }}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        height: 'calc(100vh - 120px)',
        gap: '1.5rem',
        padding: '1.5rem'
      }}>
        {/* Left Panel - Challenge List and Progress */}
        <div style={{
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{
            fontSize: '1.4rem',
            color: '#ff6b35',
            marginBottom: '1.5rem',
            fontWeight: '700'
          }}>
            🎯 {state.language === 'en' ? 'Master Challenges' : 'Desafíos Maestros'}
          </h3>

          {/* Progress Overview */}
          <div style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ color: '#ffd700', marginBottom: '1rem', fontSize: '1.1rem' }}>
              {state.language === 'en' ? 'Progress Overview' : 'Resumen de Progreso'}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              fontSize: '0.9rem'
            }}>
              <div>
                <div style={{ color: '#4ecdc4' }}>{state.language === 'en' ? 'Completed' : 'Completados'}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {examinationState.masterStats.completed}/{examinationState.masterStats.totalChallenges}
                </div>
              </div>
              <div>
                <div style={{ color: '#00ff88' }}>{state.language === 'en' ? 'Mastered' : 'Dominados'}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {examinationState.masterStats.mastered}/{examinationState.masterStats.totalChallenges}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              marginTop: '1rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff6b35, #ffd700)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Challenge List */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#4ecdc4', marginBottom: '1rem', fontSize: '1rem' }}>
              {state.language === 'en' ? 'Challenges' : 'Desafíos'}
            </h4>
            {examinationState.challenges.map((challenge, index) => (
              <div
                key={challenge.id}
                onClick={() => selectChallenge(index)}
                style={{
                  background: index === examinationState.currentChallenge 
                    ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 147, 30, 0.2))'
                    : 'rgba(0, 0, 0, 0.3)',
                  border: `2px solid ${
                    challenge.status === 'mastered' ? '#00ff88' :
                    challenge.status === 'completed' ? '#4ecdc4' :
                    challenge.status === 'in-progress' ? '#ffa500' :
                    challenge.status === 'available' ? '#ffff00' :
                    '#666666'
                  }`,
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '0.8rem',
                  cursor: challenge.status !== 'locked' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  opacity: challenge.status === 'locked' ? 0.5 : 1
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                    {challenge.title}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    background: challenge.difficulty === 'legend' ? 'linear-gradient(45deg, #ff6b35, #ffd700)' :
                               challenge.difficulty === 'expert' ? 'linear-gradient(45deg, #ff4757, #ff6b35)' :
                               'linear-gradient(45deg, #4ecdc4, #00d4ff)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '10px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {challenge.difficulty.toUpperCase()}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '0.8rem',
                  opacity: 0.8,
                  marginBottom: '0.5rem'
                }}>
                  {challenge.description}
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem'
                }}>
                  <span>{challenge.points} {state.language === 'en' ? 'pts' : 'ptos'}</span>
                  <span>
                    {challenge.status === 'mastered' ? '👑' :
                     challenge.status === 'completed' ? '✅' :
                     challenge.status === 'in-progress' ? '🔄' :
                     challenge.status === 'available' ? '🎯' : '🔒'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Certification Status */}
          {examinationState.masterStats.expertLevel === 'master' || examinationState.masterStats.expertLevel === 'legend' ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(255, 215, 0, 0.1))',
              border: '2px solid #ffd700',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ color: '#ffd700', fontWeight: '700', fontSize: '1.1rem' }}>
                {state.language === 'en' ? 'MASTER CERTIFIED' : 'MAESTRO CERTIFICADO'}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                {state.language === 'en' 
                  ? 'You have achieved mastery level in C++ pointer management'
                  : 'Has alcanzado el nivel de maestría en gestión de punteros C++'}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Panel - Challenge Details and Visualization */}
        <div style={{
          display: 'grid',
          gridTemplateRows: '1fr auto',
          gap: '1.5rem'
        }}>
          {/* 3D Visualization */}
          <div style={{
            background: 'rgba(22, 33, 62, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Canvas
              camera={{ position: [12, 8, 12], fov: 60 }}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={0.4} />
              <pointLight position={[15, 15, 15]} intensity={1} color="#ffffff" />
              <pointLight position={[-10, -5, -10]} intensity={0.6} color="#4ecdc4" />
              <pointLight position={[0, 10, 0]} intensity={0.8} color="#ff6b35" />
              
              <MasterVisualization
                state={examinationState}
                onChallengeSelect={selectChallenge}
              />
            </Canvas>

            {/* Overlay Information */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '1rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              maxWidth: '300px'
            }}>
              <div style={{ color: '#ff6b35', fontWeight: '700', marginBottom: '0.5rem' }}>
                {currentChallenge?.title}
              </div>
              <div style={{ opacity: 0.9 }}>
                {state.language === 'en' ? 'Type' : 'Tipo'}: {currentChallenge?.type}<br/>
                {state.language === 'en' ? 'Status' : 'Estado'}: {currentChallenge?.status}<br/>
                {state.language === 'en' ? 'Points' : 'Puntos'}: {currentChallenge?.points}
              </div>
            </div>

            {/* Expert Level Badge */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'linear-gradient(135deg, #ff6b35, #ffd700)',
              padding: '0.8rem 1.2rem',
              borderRadius: '20px',
              fontSize: '1rem',
              fontWeight: '700',
              color: 'white',
              boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)'
            }}>
              {examinationState.masterStats.expertLevel.toUpperCase()}
            </div>
          </div>

          {/* Challenge Details Panel */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            borderRadius: '20px',
            padding: '2rem',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: '#ff6b35',
                margin: 0,
                fontSize: '1.3rem',
                fontWeight: '700'
              }}>
                {currentChallenge?.title}
              </h3>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setExaminationState(prev => ({ ...prev, showRealWorldContext: !prev.showRealWorldContext }))}
                  style={{
                    background: 'rgba(76, 175, 80, 0.2)',
                    border: '1px solid #4caf50',
                    borderRadius: '8px',
                    color: '#4caf50',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  🌍 {state.language === 'en' ? 'Real World' : 'Mundo Real'}
                </button>
                
                <button
                  onClick={() => setExaminationState(prev => ({ ...prev, showExpertAnalysis: !prev.showExpertAnalysis }))}
                  style={{
                    background: 'rgba(156, 39, 176, 0.2)',
                    border: '1px solid #9c27b0',
                    borderRadius: '8px',
                    color: '#9c27b0',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  🧠 {state.language === 'en' ? 'Expert Analysis' : 'Análisis Experto'}
                </button>
              </div>
            </div>

            {/* Challenge Code */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#4ecdc4', marginBottom: '1rem', fontSize: '1rem' }}>
                {state.language === 'en' ? 'Challenge Code' : 'Código del Desafío'}
              </h4>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1.5rem',
                borderRadius: '10px',
                color: '#f8f8f2',
                fontSize: '0.75rem',
                lineHeight: '1.4',
                overflowX: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                maxHeight: '300px'
              }}>
                <code>{currentChallenge?.codeSnippet}</code>
              </pre>
            </div>

            {/* Real World Context */}
            {examinationState.showRealWorldContext && currentChallenge && (
              <div style={{
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '10px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ color: '#4caf50', marginBottom: '1rem', fontSize: '1rem' }}>
                  🌍 {state.language === 'en' ? 'Real-World Application' : 'Aplicación del Mundo Real'}
                </h4>
                <p style={{
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  margin: 0,
                  opacity: 0.9
                }}>
                  {currentChallenge.realWorldContext}
                </p>
              </div>
            )}

            {/* Expert Analysis */}
            {examinationState.showExpertAnalysis && currentChallenge && (
              <div style={{
                background: 'rgba(156, 39, 176, 0.1)',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                borderRadius: '10px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ color: '#9c27b0', marginBottom: '1rem', fontSize: '1rem' }}>
                  🧠 {state.language === 'en' ? 'Expert Hints' : 'Pistas de Experto'}
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '0.9rem',
                  lineHeight: '1.6'
                }}>
                  {currentChallenge.expertHints?.map((hint, index) => (
                    <li key={index} style={{
                      padding: '0.5rem 0',
                      borderLeft: '3px solid #9c27b0',
                      paddingLeft: '1rem',
                      marginBottom: '0.5rem',
                      opacity: 0.9
                    }}>
                      💡 {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <button
                onClick={() => completeChallenge(false)}
                disabled={currentChallenge?.status !== 'in-progress'}
                style={{
                  background: currentChallenge?.status === 'in-progress' 
                    ? 'linear-gradient(135deg, #4ecdc4, #00d4ff)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: currentChallenge?.status === 'in-progress' ? 'pointer' : 'not-allowed',
                  opacity: currentChallenge?.status === 'in-progress' ? 1 : 0.5
                }}
              >
                ✅ {state.language === 'en' ? 'Complete Challenge' : 'Completar Desafío'}
              </button>
              
              <button
                onClick={() => completeChallenge(true)}
                disabled={currentChallenge?.status !== 'in-progress'}
                style={{
                  background: currentChallenge?.status === 'in-progress'
                    ? 'linear-gradient(135deg, #ff6b35, #ffd700)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: currentChallenge?.status === 'in-progress' ? 'pointer' : 'not-allowed',
                  opacity: currentChallenge?.status === 'in-progress' ? 1 : 0.5
                }}
              >
                👑 {state.language === 'en' ? 'Master Challenge' : 'Dominar Desafío'} (+50%)
              </button>
            </div>

            {/* Final Achievement Message */}
            {examinationState.masterStats.completed === examinationState.masterStats.totalChallenges && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 215, 0, 0.2))',
                border: '2px solid #ffd700',
                borderRadius: '15px',
                padding: '2rem',
                marginTop: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#ffd700',
                  marginBottom: '0.5rem'
                }}>
                  {state.language === 'en' ? 'MASTER EXAMINATION COMPLETED!' : '¡EXAMEN DE MAESTRÍA COMPLETADO!'}
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  opacity: 0.9,
                  marginBottom: '1rem'
                }}>
                  {state.language === 'en'
                    ? `Final Score: ${examinationState.masterStats.totalPoints} points`
                    : `Puntuación Final: ${examinationState.masterStats.totalPoints} puntos`}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: '#4ecdc4'
                }}>
                  {state.language === 'en'
                    ? 'You have achieved the highest level of C++ pointer mastery. Congratulations, Master!'
                    : '¡Has alcanzado el más alto nivel de dominio de punteros C++. ¡Felicitaciones, Maestro!'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson120_MastersFinalExamination;