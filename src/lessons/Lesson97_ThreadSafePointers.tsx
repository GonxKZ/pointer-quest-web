/**
 * Lesson 97: Thread-Safe Pointer Techniques
 * Expert-level multithreading patterns for safe pointer usage
 */

import React, { useState, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group } from 'three';
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
  UndefinedBehaviorWarning,
  PerformanceComparison
} from '../design-system';

interface ThreadSafePointerState {
  language: 'en' | 'es';
  scenario: 'atomic_ref_counting' | 'hazard_pointers' | 'rcu_patterns' | 'double_checked_locking' | 'lazy_initialization' | 'memory_ordering';
  isAnimating: boolean;
  threadsActive: number;
  syncOperations: number;
  memoryReads: number;
  contentionLevel: number;
}

const ThreadSafeVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'atomic_ref_counting') {
      groupRef.current.rotation.y = animationRef.current * 0.4;
      onMetrics({
        threadsActive: Math.floor(4 + Math.sin(animationRef.current * 3) * 2),
        syncOperations: Math.floor(150 + Math.cos(animationRef.current * 2) * 50),
        memoryReads: Math.floor(800 + Math.sin(animationRef.current * 1.5) * 200),
        contentionLevel: Math.floor(20 + Math.cos(animationRef.current * 4) * 15)
      });
    } else if (scenario === 'hazard_pointers') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        threadsActive: Math.floor(8 + Math.sin(animationRef.current * 2) * 4),
        syncOperations: Math.floor(80 + Math.cos(animationRef.current * 3) * 30),
        memoryReads: Math.floor(1200 + Math.sin(animationRef.current * 2) * 400),
        contentionLevel: Math.floor(10 + Math.cos(animationRef.current * 3) * 8)
      });
    } else if (scenario === 'rcu_patterns') {
      groupRef.current.rotation.y = animationRef.current * 0.2;
      onMetrics({
        threadsActive: Math.floor(12 + Math.sin(animationRef.current * 1.5) * 6),
        syncOperations: Math.floor(30 + Math.cos(animationRef.current * 2) * 15),
        memoryReads: Math.floor(2000 + Math.sin(animationRef.current) * 500),
        contentionLevel: Math.floor(5 + Math.cos(animationRef.current * 2) * 3)
      });
    }
  });

  const renderThreadNodes = () => {
    const elements = [];
    const nodeCount = scenario === 'rcu_patterns' ? 24 : scenario === 'hazard_pointers' ? 20 : 16;
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = scenario === 'atomic_ref_counting' ? 2.5 : 
                    scenario === 'hazard_pointers' ? 2.8 :
                    scenario === 'rcu_patterns' ? 3.2 : 2.2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = scenario === 'memory_ordering' ? Math.sin(i * 0.3) * 0.5 : 0;
      
      const color = scenario === 'atomic_ref_counting' ? '#ff6b00' :
                    scenario === 'hazard_pointers' ? '#00ff88' :
                    scenario === 'rcu_patterns' ? '#0088ff' :
                    scenario === 'double_checked_locking' ? '#ff0088' :
                    scenario === 'lazy_initialization' ? '#8800ff' : '#ffff00';
      
      elements.push(
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );

      // Connection lines for synchronization
      if (i < nodeCount - 1) {
        const nextAngle = ((i + 1) / nodeCount) * Math.PI * 2;
        const nextX = Math.cos(nextAngle) * radius;
        const nextY = Math.sin(nextAngle) * radius;
        
        elements.push(
          <line key={`line-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([x, y, z, nextX, nextY, z])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" opacity={0.3} transparent />
          </line>
        );
      }
    }
    
    return elements;
  };

  return (
    <group ref={groupRef}>
      {renderThreadNodes()}
      
      {/* Central synchronization point */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial 
          color="#ffffff" 
          opacity={0.8} 
          transparent 
          wireframe={scenario === 'memory_ordering'}
        />
      </mesh>
      
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
    </group>
  );
};

const Lesson97_ThreadSafePointers: React.FC = () => {
  const [state, setState] = useState<ThreadSafePointerState>({
    language: 'en',
    scenario: 'atomic_ref_counting',
    isAnimating: false,
    threadsActive: 0,
    syncOperations: 0,
    memoryReads: 0,
    contentionLevel: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: ThreadSafePointerState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    announcer.announce(
      state.language === 'en' 
        ? `Running thread-safe pointer demonstration`
        : `Ejecutando demostración de punteros thread-safe`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    atomic_ref_counting: `// Thread-Safe Reference Counting with Atomics
#include <atomic>
#include <memory>
#include <thread>
#include <vector>
#include <iostream>

template<typename T>
class AtomicSharedPtr {
private:
    struct ControlBlock {
        std::atomic<size_t> ref_count{1};
        std::atomic<size_t> weak_count{0};
        T* ptr;
        
        ControlBlock(T* p) : ptr(p) {}
        
        ~ControlBlock() {
            delete ptr;
        }
        
        void inc_ref() {
            ref_count.fetch_add(1, std::memory_order_relaxed);
        }
        
        bool dec_ref() {
            if (ref_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                delete ptr;
                ptr = nullptr;
                return dec_weak_ref();
            }
            return false;
        }
        
        bool dec_weak_ref() {
            if (weak_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                return true; // Control block should be deleted
            }
            return false;
        }
    };
    
    ControlBlock* control_;
    
public:
    // Constructor
    explicit AtomicSharedPtr(T* ptr = nullptr) 
        : control_(ptr ? new ControlBlock(ptr) : nullptr) {}
    
    // Copy constructor - thread-safe
    AtomicSharedPtr(const AtomicSharedPtr& other) {
        // Use atomic load to ensure we get a consistent view
        ControlBlock* other_control = other.control_;
        if (other_control) {
            other_control->inc_ref();
        }
        control_ = other_control;
    }
    
    // Assignment operator - thread-safe
    AtomicSharedPtr& operator=(const AtomicSharedPtr& other) {
        if (this != &other) {
            // Increment new reference first
            ControlBlock* other_control = other.control_;
            if (other_control) {
                other_control->inc_ref();
            }
            
            // Decrement old reference
            if (control_ && control_->dec_ref()) {
                delete control_;
            }
            
            control_ = other_control;
        }
        return *this;
    }
    
    // Destructor
    ~AtomicSharedPtr() {
        if (control_ && control_->dec_ref()) {
            delete control_;
        }
    }
    
    // Thread-safe reset
    void reset(T* ptr = nullptr) {
        ControlBlock* new_control = ptr ? new ControlBlock(ptr) : nullptr;
        ControlBlock* old_control = control_;
        control_ = new_control;
        
        if (old_control && old_control->dec_ref()) {
            delete old_control;
        }
    }
    
    // Thread-safe access
    T* get() const {
        return control_ ? control_->ptr : nullptr;
    }
    
    T& operator*() const { return *get(); }
    T* operator->() const { return get(); }
    
    // Thread-safe reference count
    size_t use_count() const {
        return control_ ? control_->ref_count.load(std::memory_order_acquire) : 0;
    }
    
    bool unique() const {
        return use_count() == 1;
    }
    
    explicit operator bool() const {
        return get() != nullptr;
    }
    
    // Compare and swap - atomic update
    bool compare_and_swap(AtomicSharedPtr& expected, const AtomicSharedPtr& desired) {
        // This would need more sophisticated implementation in practice
        // using atomic operations on the control block pointer
        return false;
    }
};

// Usage example with multithreading
struct SharedResource {
    std::atomic<int> value{0};
    std::string name;
    
    SharedResource(const std::string& n) : name(n) {
        std::cout << "Created resource: " << name << std::endl;
    }
    
    ~SharedResource() {
        std::cout << "Destroyed resource: " << name << std::endl;
    }
    
    void work() {
        value.fetch_add(1, std::memory_order_relaxed);
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
};

void demonstrate_atomic_ref_counting() {
    AtomicSharedPtr<SharedResource> shared_resource(
        new SharedResource("MultithreadResource")
    );
    
    const int num_threads = 8;
    std::vector<std::thread> threads;
    std::atomic<int> completed_work{0};
    
    // Launch worker threads
    for (int i = 0; i < num_threads; ++i) {
        threads.emplace_back([&shared_resource, &completed_work, i]() {
            // Create local copy (thread-safe copy constructor)
            AtomicSharedPtr<SharedResource> local_copy = shared_resource;
            
            std::cout << "Thread " << i << " use count: " 
                      << local_copy.use_count() << std::endl;
            
            // Do some work
            for (int j = 0; j < 100; ++j) {
                if (local_copy) {
                    local_copy->work();
                    completed_work.fetch_add(1, std::memory_order_relaxed);
                }
            }
            
            std::cout << "Thread " << i << " finished" << std::endl;
        });
    }
    
    // Wait for all threads to complete
    for (auto& thread : threads) {
        thread.join();
    }
    
    std::cout << "Final use count: " << shared_resource.use_count() << std::endl;
    std::cout << "Total work completed: " << completed_work.load() << std::endl;
    std::cout << "Resource value: " << shared_resource->value.load() << std::endl;
}`,

    hazard_pointers: `// Hazard Pointers for Lock-Free Data Structures
#include <atomic>
#include <array>
#include <vector>
#include <thread>
#include <algorithm>

template<typename T>
class HazardPointerManager {
private:
    static constexpr size_t MAX_THREADS = 32;
    static constexpr size_t HAZARD_POINTERS_PER_THREAD = 4;
    
    struct HazardPointer {
        std::atomic<T*> pointer{nullptr};
        std::atomic<bool> active{false};
    };
    
    struct ThreadRecord {
        std::array<HazardPointer, HAZARD_POINTERS_PER_THREAD> hazards;
        std::atomic<bool> active{false};
        std::thread::id thread_id;
    };
    
    static thread_local ThreadRecord* local_thread_record_;
    static std::array<ThreadRecord, MAX_THREADS> thread_records_;
    static std::atomic<size_t> thread_count_;
    
    // Retired pointer list
    struct RetiredPointer {
        T* ptr;
        std::function<void(T*)> deleter;
    };
    
    static thread_local std::vector<RetiredPointer> retired_list_;
    static constexpr size_t RETIRED_LIST_MAX_SIZE = 100;
    
public:
    // Get thread-local hazard pointer manager
    static ThreadRecord* get_thread_record() {
        if (!local_thread_record_) {
            // Find an unused thread record
            for (auto& record : thread_records_) {
                bool expected = false;
                if (record.active.compare_exchange_strong(expected, true)) {
                    record.thread_id = std::this_thread::get_id();
                    local_thread_record_ = &record;
                    thread_count_.fetch_add(1, std::memory_order_relaxed);
                    break;
                }
            }
        }
        return local_thread_record_;
    }
    
    // Acquire hazard pointer
    static void set_hazard_pointer(size_t index, T* ptr) {
        auto* record = get_thread_record();
        if (record && index < HAZARD_POINTERS_PER_THREAD) {
            record->hazards[index].pointer.store(ptr, std::memory_order_release);
        }
    }
    
    // Release hazard pointer
    static void clear_hazard_pointer(size_t index) {
        auto* record = get_thread_record();
        if (record && index < HAZARD_POINTERS_PER_THREAD) {
            record->hazards[index].pointer.store(nullptr, std::memory_order_release);
        }
    }
    
    // Check if pointer is hazardous
    static bool is_hazardous(T* ptr) {
        for (const auto& record : thread_records_) {
            if (!record.active.load(std::memory_order_acquire)) continue;
            
            for (const auto& hazard : record.hazards) {
                if (hazard.pointer.load(std::memory_order_acquire) == ptr) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Retire pointer for later deletion
    static void retire_pointer(T* ptr, std::function<void(T*)> deleter = [](T* p) { delete p; }) {
        retired_list_.emplace_back(RetiredPointer{ptr, std::move(deleter)});
        
        if (retired_list_.size() >= RETIRED_LIST_MAX_SIZE) {
            scan_and_delete();
        }
    }
    
    // Scan retired list and delete non-hazardous pointers
    static void scan_and_delete() {
        auto it = std::remove_if(retired_list_.begin(), retired_list_.end(),
            [](const RetiredPointer& retired) {
                if (!is_hazardous(retired.ptr)) {
                    retired.deleter(retired.ptr);
                    return true; // Remove from list
                }
                return false; // Keep in list
            });
        
        retired_list_.erase(it, retired_list_.end());
    }
    
    // Thread cleanup
    static void cleanup_thread() {
        if (local_thread_record_) {
            // Clear all hazard pointers
            for (auto& hazard : local_thread_record_->hazards) {
                hazard.pointer.store(nullptr, std::memory_order_release);
            }
            
            // Scan and delete remaining retired pointers
            scan_and_delete();
            
            // Mark thread record as inactive
            local_thread_record_->active.store(false, std::memory_order_release);
            thread_count_.fetch_sub(1, std::memory_order_relaxed);
            local_thread_record_ = nullptr;
        }
    }
};

// Static member definitions
template<typename T>
thread_local typename HazardPointerManager<T>::ThreadRecord* 
HazardPointerManager<T>::local_thread_record_ = nullptr;

template<typename T>
std::array<typename HazardPointerManager<T>::ThreadRecord, HazardPointerManager<T>::MAX_THREADS> 
HazardPointerManager<T>::thread_records_;

template<typename T>
std::atomic<size_t> HazardPointerManager<T>::thread_count_{0};

template<typename T>
thread_local std::vector<typename HazardPointerManager<T>::RetiredPointer> 
HazardPointerManager<T>::retired_list_;

// Lock-free stack using hazard pointers
template<typename T>
class LockFreeStack {
private:
    struct Node {
        T data;
        std::atomic<Node*> next;
        
        Node(T&& item) : data(std::move(item)), next(nullptr) {}
    };
    
    std::atomic<Node*> head_{nullptr};
    using HazardManager = HazardPointerManager<Node>;
    
public:
    void push(T item) {
        Node* new_node = new Node(std::move(item));
        Node* current_head = head_.load(std::memory_order_relaxed);
        
        do {
            new_node->next.store(current_head, std::memory_order_relaxed);
        } while (!head_.compare_exchange_weak(current_head, new_node,
                                            std::memory_order_release,
                                            std::memory_order_relaxed));
    }
    
    bool pop(T& result) {
        Node* current_head;
        
        do {
            current_head = head_.load(std::memory_order_acquire);
            if (!current_head) {
                return false; // Stack is empty
            }
            
            // Set hazard pointer to protect current_head
            HazardManager::set_hazard_pointer(0, current_head);
            
            // Verify head hasn't changed after setting hazard pointer
            if (head_.load(std::memory_order_acquire) != current_head) {
                continue; // Head changed, retry
            }
            
            Node* next = current_head->next.load(std::memory_order_relaxed);
            
            // Try to update head
            if (head_.compare_exchange_weak(current_head, next,
                                          std::memory_order_release,
                                          std::memory_order_relaxed)) {
                break; // Successfully popped
            }
            
        } while (true);
        
        // Extract data and retire the node
        result = std::move(current_head->data);
        HazardManager::retire_pointer(current_head);
        
        // Clear hazard pointer
        HazardManager::clear_hazard_pointer(0);
        
        return true;
    }
    
    bool empty() const {
        return head_.load(std::memory_order_acquire) == nullptr;
    }
    
    ~LockFreeStack() {
        // Cleanup remaining nodes
        T dummy;
        while (pop(dummy)) {
            // Empty stack
        }
        HazardManager::cleanup_thread();
    }
};

void demonstrate_hazard_pointers() {
    LockFreeStack<int> stack;
    const int num_threads = 8;
    const int operations_per_thread = 1000;
    
    std::vector<std::thread> producers;
    std::vector<std::thread> consumers;
    std::atomic<int> total_pushed{0};
    std::atomic<int> total_popped{0};
    
    // Start producer threads
    for (int i = 0; i < num_threads / 2; ++i) {
        producers.emplace_back([&stack, &total_pushed, i, operations_per_thread]() {
            for (int j = 0; j < operations_per_thread; ++j) {
                int value = i * operations_per_thread + j;
                stack.push(value);
                total_pushed.fetch_add(1, std::memory_order_relaxed);
            }
            
            std::cout << "Producer " << i << " finished" << std::endl;
            HazardPointerManager<LockFreeStack<int>::Node>::cleanup_thread();
        });
    }
    
    // Start consumer threads
    for (int i = 0; i < num_threads / 2; ++i) {
        consumers.emplace_back([&stack, &total_popped, i]() {
            int value;
            int popped_count = 0;
            
            // Keep trying to pop until producers are done
            while (popped_count < 500 || !stack.empty()) {
                if (stack.pop(value)) {
                    popped_count++;
                    total_popped.fetch_add(1, std::memory_order_relaxed);
                } else {
                    std::this_thread::sleep_for(std::chrono::microseconds(1));
                }
            }
            
            std::cout << "Consumer " << i << " popped " << popped_count << " items" << std::endl;
            HazardPointerManager<LockFreeStack<int>::Node>::cleanup_thread();
        });
    }
    
    // Wait for all threads
    for (auto& t : producers) t.join();
    for (auto& t : consumers) t.join();
    
    std::cout << "Total pushed: " << total_pushed.load() << std::endl;
    std::cout << "Total popped: " << total_popped.load() << std::endl;
    std::cout << "Stack empty: " << stack.empty() << std::endl;
}`,

    rcu_patterns: `// RCU (Read-Copy-Update) Patterns for High-Performance Reading
#include <atomic>
#include <memory>
#include <thread>
#include <vector>
#include <functional>
#include <mutex>
#include <condition_variable>

template<typename T>
class RCUPtr {
private:
    std::atomic<T*> ptr_{nullptr};
    
    // Grace period management
    struct GracePeriod {
        std::atomic<size_t> readers{0};
        std::atomic<bool> grace_started{false};
    };
    
    static std::array<GracePeriod, 2> grace_periods_;
    static std::atomic<size_t> current_period_;
    static std::mutex cleanup_mutex_;
    static std::condition_variable cleanup_cv_;
    static std::vector<std::function<void()>> pending_cleanups_;
    
public:
    // Read-side critical section
    class ReadGuard {
    private:
        size_t period_;
        
    public:
        ReadGuard() : period_(current_period_.load(std::memory_order_acquire)) {
            grace_periods_[period_].readers.fetch_add(1, std::memory_order_acquire);
        }
        
        ~ReadGuard() {
            grace_periods_[period_].readers.fetch_sub(1, std::memory_order_release);
        }
        
        ReadGuard(const ReadGuard&) = delete;
        ReadGuard& operator=(const ReadGuard&) = delete;
        ReadGuard(ReadGuard&&) = delete;
        ReadGuard& operator=(ReadGuard&&) = delete;
    };
    
    RCUPtr(T* ptr = nullptr) : ptr_(ptr) {}
    
    ~RCUPtr() {
        synchronize_rcu();
        delete ptr_.load();
    }
    
    // Read operation - lock-free and wait-free
    T* read() const {
        return ptr_.load(std::memory_order_acquire);
    }
    
    // Update operation - creates new version
    void update(T* new_ptr) {
        T* old_ptr = ptr_.exchange(new_ptr, std::memory_order_acq_rel);
        
        // Schedule old pointer for deletion after grace period
        if (old_ptr) {
            call_rcu([old_ptr]() { delete old_ptr; });
        }
    }
    
    // Compare and swap
    bool compare_exchange(T* expected, T* desired) {
        if (ptr_.compare_exchange_strong(expected, desired, std::memory_order_acq_rel)) {
            if (expected) {
                call_rcu([expected]() { delete expected; });
            }
            return true;
        }
        return false;
    }
    
    // Schedule cleanup after grace period
    static void call_rcu(std::function<void()> cleanup) {
        std::lock_guard<std::mutex> lock(cleanup_mutex_);
        pending_cleanups_.push_back(std::move(cleanup));
        cleanup_cv_.notify_one();
    }
    
    // Wait for grace period to ensure all readers have finished
    static void synchronize_rcu() {
        size_t old_period = current_period_.load(std::memory_order_acquire);
        size_t new_period = 1 - old_period;
        
        // Switch to new period
        current_period_.store(new_period, std::memory_order_release);
        
        // Wait for all readers in old period to finish
        while (grace_periods_[old_period].readers.load(std::memory_order_acquire) > 0) {
            std::this_thread::yield();
        }
        
        // Execute pending cleanups
        std::unique_lock<std::mutex> lock(cleanup_mutex_);
        auto cleanups = std::move(pending_cleanups_);
        pending_cleanups_.clear();
        lock.unlock();
        
        for (auto& cleanup : cleanups) {
            cleanup();
        }
    }
    
    // Background grace period manager
    static void start_grace_period_manager() {
        static std::thread manager_thread([]() {
            while (true) {
                std::unique_lock<std::mutex> lock(cleanup_mutex_);
                cleanup_cv_.wait(lock, []() { return !pending_cleanups_.empty(); });
                
                if (!pending_cleanups_.empty()) {
                    lock.unlock();
                    synchronize_rcu();
                }
            }
        });
        manager_thread.detach();
    }
};

// Static member definitions
template<typename T>
std::array<typename RCUPtr<T>::GracePeriod, 2> RCUPtr<T>::grace_periods_;

template<typename T>
std::atomic<size_t> RCUPtr<T>::current_period_{0};

template<typename T>
std::mutex RCUPtr<T>::cleanup_mutex_;

template<typename T>
std::condition_variable RCUPtr<T>::cleanup_cv_;

template<typename T>
std::vector<std::function<void()>> RCUPtr<T>::pending_cleanups_;

// RCU-protected hash table
template<typename Key, typename Value>
class RCUHashTable {
private:
    struct Entry {
        Key key;
        Value value;
        std::atomic<Entry*> next{nullptr};
        
        Entry(Key k, Value v) : key(std::move(k)), value(std::move(v)) {}
    };
    
    struct Bucket {
        std::atomic<Entry*> head{nullptr};
        mutable std::mutex write_mutex; // Only for writers
    };
    
    std::vector<Bucket> buckets_;
    size_t bucket_count_;
    
    size_t hash(const Key& key) const {
        return std::hash<Key>{}(key) % bucket_count_;
    }
    
public:
    RCUHashTable(size_t bucket_count = 1024) 
        : buckets_(bucket_count), bucket_count_(bucket_count) {
        
        RCUPtr<Entry>::start_grace_period_manager();
    }
    
    // Lock-free read operation
    bool find(const Key& key, Value& value) const {
        typename RCUPtr<Entry>::ReadGuard guard;
        
        size_t bucket_index = hash(key);
        Entry* current = buckets_[bucket_index].head.load(std::memory_order_acquire);
        
        while (current) {
            if (current->key == key) {
                value = current->value;
                return true;
            }
            current = current->next.load(std::memory_order_acquire);
        }
        
        return false;
    }
    
    // Insert operation (writers use mutex)
    void insert(Key key, Value value) {
        size_t bucket_index = hash(key);
        std::lock_guard<std::mutex> lock(buckets_[bucket_index].write_mutex);
        
        Entry* new_entry = new Entry(std::move(key), std::move(value));
        Entry* current_head = buckets_[bucket_index].head.load(std::memory_order_acquire);
        
        // Check if key already exists
        Entry* current = current_head;
        while (current) {
            if (current->key == new_entry->key) {
                // Update existing entry
                current->value = new_entry->value;
                delete new_entry;
                return;
            }
            current = current->next.load(std::memory_order_acquire);
        }
        
        // Insert new entry at head
        new_entry->next.store(current_head, std::memory_order_relaxed);
        buckets_[bucket_index].head.store(new_entry, std::memory_order_release);
    }
    
    // Remove operation
    bool remove(const Key& key) {
        size_t bucket_index = hash(key);
        std::lock_guard<std::mutex> lock(buckets_[bucket_index].write_mutex);
        
        Entry* current = buckets_[bucket_index].head.load(std::memory_order_acquire);
        Entry* prev = nullptr;
        
        while (current) {
            if (current->key == key) {
                if (prev) {
                    prev->next.store(current->next.load(std::memory_order_acquire), 
                                   std::memory_order_release);
                } else {
                    buckets_[bucket_index].head.store(current->next.load(std::memory_order_acquire),
                                                     std::memory_order_release);
                }
                
                // Schedule for RCU cleanup
                RCUPtr<Entry>::call_rcu([current]() { delete current; });
                return true;
            }
            
            prev = current;
            current = current->next.load(std::memory_order_acquire);
        }
        
        return false;
    }
    
    // Statistics
    size_t size() const {
        typename RCUPtr<Entry>::ReadGuard guard;
        size_t count = 0;
        
        for (const auto& bucket : buckets_) {
            Entry* current = bucket.head.load(std::memory_order_acquire);
            while (current) {
                count++;
                current = current->next.load(std::memory_order_acquire);
            }
        }
        
        return count;
    }
};

void demonstrate_rcu_patterns() {
    RCUHashTable<int, std::string> hash_table;
    
    const int num_readers = 12;
    const int num_writers = 4;
    const int operations_per_thread = 1000;
    
    std::vector<std::thread> readers;
    std::vector<std::thread> writers;
    std::atomic<long long> read_operations{0};
    std::atomic<long long> write_operations{0};
    std::atomic<bool> stop_flag{false};
    
    // Start reader threads
    for (int i = 0; i < num_readers; ++i) {
        readers.emplace_back([&hash_table, &read_operations, &stop_flag, i]() {
            std::string value;
            int local_reads = 0;
            
            while (!stop_flag.load(std::memory_order_relaxed)) {
                // Read random keys
                for (int j = 0; j < 100; ++j) {
                    int key = rand() % 1000;
                    if (hash_table.find(key, value)) {
                        local_reads++;
                    }
                }
                
                read_operations.fetch_add(100, std::memory_order_relaxed);
                std::this_thread::sleep_for(std::chrono::microseconds(10));
            }
            
            std::cout << "Reader " << i << " performed " << local_reads << " successful reads" << std::endl;
        });
    }
    
    // Start writer threads
    for (int i = 0; i < num_writers; ++i) {
        writers.emplace_back([&hash_table, &write_operations, i, operations_per_thread]() {
            for (int j = 0; j < operations_per_thread; ++j) {
                int key = i * operations_per_thread + j;
                std::string value = "value_" + std::to_string(key);
                
                hash_table.insert(key, value);
                write_operations.fetch_add(1, std::memory_order_relaxed);
                
                // Occasionally remove some entries
                if (j > 0 && j % 10 == 0) {
                    hash_table.remove(key - 5);
                }
                
                std::this_thread::sleep_for(std::chrono::microseconds(100));
            }
            
            std::cout << "Writer " << i << " finished" << std::endl;
        });
    }
    
    // Let it run for a while
    std::this_thread::sleep_for(std::chrono::seconds(3));
    
    // Stop readers
    stop_flag.store(true, std::memory_order_relaxed);
    
    // Wait for all threads
    for (auto& t : readers) t.join();
    for (auto& t : writers) t.join();
    
    std::cout << "Total read operations: " << read_operations.load() << std::endl;
    std::cout << "Total write operations: " << write_operations.load() << std::endl;
    std::cout << "Final hash table size: " << hash_table.size() << std::endl;
    
    // Ensure all RCU callbacks are processed
    RCUPtr<RCUHashTable<int, std::string>::Entry>::synchronize_rcu();
}`,

    double_checked_locking: `// Double-Checked Locking Pattern with C++11 Memory Model
#include <atomic>
#include <mutex>
#include <memory>
#include <thread>
#include <iostream>

// Classic double-checked locking with proper memory ordering
template<typename T>
class Singleton {
private:
    static std::atomic<T*> instance_;
    static std::mutex mutex_;
    
public:
    static T* get_instance() {
        // First check - relaxed ordering is sufficient
        T* tmp = instance_.load(std::memory_order_acquire);
        if (tmp == nullptr) {
            std::lock_guard<std::mutex> lock(mutex_);
            
            // Second check - within the lock
            tmp = instance_.load(std::memory_order_relaxed);
            if (tmp == nullptr) {
                tmp = new T();
                instance_.store(tmp, std::memory_order_release);
            }
        }
        return tmp;
    }
    
    // Modern C++11 version using call_once
    static T* get_instance_modern() {
        static std::once_flag flag;
        static T* instance = nullptr;
        
        std::call_once(flag, []() {
            instance = new T();
        });
        
        return instance;
    }
    
    // Thread-safe destruction
    static void destroy_instance() {
        std::lock_guard<std::mutex> lock(mutex_);
        T* tmp = instance_.load(std::memory_order_acquire);
        if (tmp != nullptr) {
            instance_.store(nullptr, std::memory_order_release);
            delete tmp;
        }
    }
};

template<typename T>
std::atomic<T*> Singleton<T>::instance_{nullptr};

template<typename T>
std::mutex Singleton<T>::mutex_;

// Resource pool with double-checked locking
template<typename Resource>
class ResourcePool {
private:
    struct PoolEntry {
        std::unique_ptr<Resource> resource;
        std::atomic<bool> in_use{false};
        
        PoolEntry() : resource(std::make_unique<Resource>()) {}
    };
    
    mutable std::mutex expansion_mutex_;
    std::atomic<std::vector<PoolEntry>*> pool_{nullptr};
    std::atomic<size_t> pool_size_{0};
    size_t initial_size_;
    size_t max_size_;
    
    // Expand pool size (double-checked locking)
    void expand_pool() const {
        std::vector<PoolEntry>* current_pool = pool_.load(std::memory_order_acquire);
        
        if (current_pool == nullptr || pool_size_.load(std::memory_order_acquire) == 0) {
            std::lock_guard<std::mutex> lock(expansion_mutex_);
            
            // Second check
            current_pool = pool_.load(std::memory_order_acquire);
            if (current_pool == nullptr) {
                auto* new_pool = new std::vector<PoolEntry>(initial_size_);
                pool_.store(new_pool, std::memory_order_release);
                pool_size_.store(initial_size_, std::memory_order_release);
            }
        }
    }
    
    void grow_pool() {
        std::lock_guard<std::mutex> lock(expansion_mutex_);
        
        std::vector<PoolEntry>* current_pool = pool_.load(std::memory_order_acquire);
        size_t current_size = pool_size_.load(std::memory_order_acquire);
        
        if (current_size < max_size_) {
            size_t new_size = std::min(current_size * 2, max_size_);
            auto* new_pool = new std::vector<PoolEntry>(new_size);
            
            // Copy existing entries
            if (current_pool) {
                for (size_t i = 0; i < current_size; ++i) {
                    (*new_pool)[i] = std::move((*current_pool)[i]);
                }
                delete current_pool;
            }
            
            pool_.store(new_pool, std::memory_order_release);
            pool_size_.store(new_size, std::memory_order_release);
            
            std::cout << "Pool expanded to size: " << new_size << std::endl;
        }
    }
    
public:
    ResourcePool(size_t initial_size = 10, size_t max_size = 100) 
        : initial_size_(initial_size), max_size_(max_size) {}
    
    ~ResourcePool() {
        std::vector<PoolEntry>* pool = pool_.load();
        delete pool;
    }
    
    // Acquire resource from pool
    Resource* acquire() {
        // Ensure pool is initialized
        if (pool_.load(std::memory_order_acquire) == nullptr) {
            expand_pool();
        }
        
        std::vector<PoolEntry>* current_pool = pool_.load(std::memory_order_acquire);
        size_t current_size = pool_size_.load(std::memory_order_acquire);
        
        // Try to find available resource
        for (size_t attempts = 0; attempts < 2; ++attempts) {
            for (size_t i = 0; i < current_size; ++i) {
                bool expected = false;
                if ((*current_pool)[i].in_use.compare_exchange_weak(expected, true, 
                                                                   std::memory_order_acquire,
                                                                   std::memory_order_relaxed)) {
                    return (*current_pool)[i].resource.get();
                }
            }
            
            // No available resources, try to grow pool
            if (attempts == 0) {
                grow_pool();
                current_pool = pool_.load(std::memory_order_acquire);
                current_size = pool_size_.load(std::memory_order_acquire);
            }
        }
        
        return nullptr; // Pool exhausted
    }
    
    // Release resource back to pool
    void release(Resource* resource) {
        std::vector<PoolEntry>* current_pool = pool_.load(std::memory_order_acquire);
        size_t current_size = pool_size_.load(std::memory_order_acquire);
        
        if (!current_pool) return;
        
        for (size_t i = 0; i < current_size; ++i) {
            if ((*current_pool)[i].resource.get() == resource) {
                (*current_pool)[i].in_use.store(false, std::memory_order_release);
                return;
            }
        }
    }
    
    // Get pool statistics
    struct PoolStats {
        size_t total_resources;
        size_t available_resources;
        size_t in_use_resources;
    };
    
    PoolStats get_stats() const {
        std::vector<PoolEntry>* current_pool = pool_.load(std::memory_order_acquire);
        size_t current_size = pool_size_.load(std::memory_order_acquire);
        
        PoolStats stats{0, 0, 0};
        
        if (current_pool) {
            stats.total_resources = current_size;
            
            for (size_t i = 0; i < current_size; ++i) {
                if ((*current_pool)[i].in_use.load(std::memory_order_acquire)) {
                    stats.in_use_resources++;
                } else {
                    stats.available_resources++;
                }
            }
        }
        
        return stats;
    }
};

// Example resource type
struct DatabaseConnection {
    std::string connection_string;
    std::atomic<int> query_count{0};
    
    DatabaseConnection() : connection_string("db://localhost:5432") {
        std::cout << "Created database connection" << std::endl;
    }
    
    ~DatabaseConnection() {
        std::cout << "Destroyed database connection (queries: " << query_count << ")" << std::endl;
    }
    
    void execute_query(const std::string& query) {
        query_count.fetch_add(1, std::memory_order_relaxed);
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
};

void demonstrate_double_checked_locking() {
    ResourcePool<DatabaseConnection> pool(5, 20);
    
    const int num_threads = 12;
    std::vector<std::thread> threads;
    std::atomic<int> successful_queries{0};
    std::atomic<int> failed_acquisitions{0};
    
    for (int i = 0; i < num_threads; ++i) {
        threads.emplace_back([&pool, &successful_queries, &failed_acquisitions, i]() {
            for (int j = 0; j < 50; ++j) {
                if (auto* conn = pool.acquire()) {
                    std::string query = "SELECT * FROM table_" + std::to_string(i) + "_" + std::to_string(j);
                    conn->execute_query(query);
                    successful_queries.fetch_add(1, std::memory_order_relaxed);
                    pool.release(conn);
                } else {
                    failed_acquisitions.fetch_add(1, std::memory_order_relaxed);
                }
                
                std::this_thread::sleep_for(std::chrono::milliseconds(5));
            }
            
            std::cout << "Thread " << i << " finished" << std::endl;
        });
    }
    
    // Monitor pool stats
    std::thread monitor([&pool]() {
        for (int i = 0; i < 10; ++i) {
            auto stats = pool.get_stats();
            std::cout << "Pool stats - Total: " << stats.total_resources 
                      << ", Available: " << stats.available_resources
                      << ", In use: " << stats.in_use_resources << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(200));
        }
    });
    
    // Wait for all threads
    for (auto& t : threads) t.join();
    monitor.join();
    
    std::cout << "Successful queries: " << successful_queries.load() << std::endl;
    std::cout << "Failed acquisitions: " << failed_acquisitions.load() << std::endl;
    
    auto final_stats = pool.get_stats();
    std::cout << "Final pool stats - Total: " << final_stats.total_resources 
              << ", Available: " << final_stats.available_resources
              << ", In use: " << final_stats.in_use_resources << std::endl;
}`,

    lazy_initialization: `// Thread-Safe Lazy Initialization Patterns
#include <atomic>
#include <mutex>
#include <functional>
#include <optional>
#include <memory>

// Thread-safe lazy initialization with std::once_flag
template<typename T>
class LazyInitialized {
private:
    mutable std::once_flag initialized_;
    mutable std::optional<T> value_;
    std::function<T()> factory_;
    
public:
    template<typename Factory>
    LazyInitialized(Factory&& factory) : factory_(std::forward<Factory>(factory)) {}
    
    const T& get() const {
        std::call_once(initialized_, [this]() {
            value_ = factory_();
        });
        return *value_;
    }
    
    // Check if already initialized without triggering initialization
    bool is_initialized() const {
        return value_.has_value();
    }
    
    // Reset to uninitialized state
    void reset() {
        value_.reset();
        initialized_ = std::once_flag{};
    }
};

// Atomic lazy initialization with CAS
template<typename T>
class AtomicLazy {
private:
    mutable std::atomic<T*> ptr_{nullptr};
    std::function<std::unique_ptr<T>()> factory_;
    mutable std::mutex cleanup_mutex_;
    
public:
    template<typename Factory>
    AtomicLazy(Factory&& factory) : factory_(std::forward<Factory>(factory)) {}
    
    ~AtomicLazy() {
        delete ptr_.load();
    }
    
    const T& get() const {
        T* tmp = ptr_.load(std::memory_order_acquire);
        
        if (tmp == nullptr) {
            auto new_obj = factory_();
            T* new_ptr = new_obj.release();
            
            // Try to set the pointer atomically
            T* expected = nullptr;
            if (ptr_.compare_exchange_strong(expected, new_ptr, 
                                           std::memory_order_release,
                                           std::memory_order_acquire)) {
                tmp = new_ptr;
            } else {
                // Another thread got there first
                delete new_ptr;
                tmp = expected;
            }
        }
        
        return *tmp;
    }
    
    bool is_initialized() const {
        return ptr_.load(std::memory_order_acquire) != nullptr;
    }
    
    void reset() {
        std::lock_guard<std::mutex> lock(cleanup_mutex_);
        T* old_ptr = ptr_.exchange(nullptr, std::memory_order_acq_rel);
        delete old_ptr;
    }
};

// Lazy initialization with dependency injection
template<typename T>
class DependencyLazy {
private:
    mutable std::once_flag initialized_;
    mutable std::unique_ptr<T> instance_;
    
    // Dependencies
    std::vector<std::function<void()>> pre_init_hooks_;
    std::vector<std::function<void(T&)>> post_init_hooks_;
    std::function<std::unique_ptr<T>()> factory_;
    
public:
    template<typename Factory>
    DependencyLazy(Factory&& factory) : factory_(std::forward<Factory>(factory)) {}
    
    // Add initialization hooks
    template<typename Hook>
    void add_pre_init_hook(Hook&& hook) {
        pre_init_hooks_.emplace_back(std::forward<Hook>(hook));
    }
    
    template<typename Hook>
    void add_post_init_hook(Hook&& hook) {
        post_init_hooks_.emplace_back(std::forward<Hook>(hook));
    }
    
    const T& get() const {
        std::call_once(initialized_, [this]() {
            // Execute pre-initialization hooks
            for (auto& hook : pre_init_hooks_) {
                hook();
            }
            
            // Create instance
            instance_ = factory_();
            
            // Execute post-initialization hooks
            for (auto& hook : post_init_hooks_) {
                hook(*instance_);
            }
        });
        
        return *instance_;
    }
    
    bool is_initialized() const {
        return instance_ != nullptr;
    }
};

// Thread-safe lazy collection
template<typename Key, typename Value>
class LazyCacheMap {
private:
    mutable std::shared_mutex cache_mutex_;
    mutable std::unordered_map<Key, std::weak_ptr<Value>> cache_;
    std::function<std::shared_ptr<Value>(const Key&)> factory_;
    
public:
    template<typename Factory>
    LazyCacheMap(Factory&& factory) : factory_(std::forward<Factory>(factory)) {}
    
    std::shared_ptr<Value> get(const Key& key) const {
        // First try to find existing value (read lock)
        {
            std::shared_lock<std::shared_mutex> read_lock(cache_mutex_);
            auto it = cache_.find(key);
            if (it != cache_.end()) {
                if (auto shared = it->second.lock()) {
                    return shared;
                }
                // Weak pointer expired, remove it
            }
        }
        
        // Need to create new value (write lock)
        std::unique_lock<std::shared_mutex> write_lock(cache_mutex_);
        
        // Double-check pattern
        auto it = cache_.find(key);
        if (it != cache_.end()) {
            if (auto shared = it->second.lock()) {
                return shared;
            }
            // Remove expired entry
            cache_.erase(it);
        }
        
        // Create new value
        auto new_value = factory_(key);
        cache_[key] = new_value;
        
        return new_value;
    }
    
    void clear_expired() {
        std::unique_lock<std::shared_mutex> write_lock(cache_mutex_);
        
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
        std::shared_lock<std::shared_mutex> read_lock(cache_mutex_);
        return cache_.size();
    }
};

// Example usage classes
struct ExpensiveResource {
    std::string data;
    std::chrono::steady_clock::time_point creation_time;
    int computation_result;
    
    ExpensiveResource(const std::string& input) : data(input) {
        creation_time = std::chrono::steady_clock::now();
        
        // Simulate expensive computation
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        computation_result = static_cast<int>(std::hash<std::string>{}(input) % 1000);
        
        std::cout << "Created expensive resource for: " << input << std::endl;
    }
    
    ~ExpensiveResource() {
        std::cout << "Destroyed expensive resource for: " << data << std::endl;
    }
    
    int get_result() const { return computation_result; }
};

struct ConfigurationManager {
    std::unordered_map<std::string, std::string> config_;
    
    ConfigurationManager() {
        std::cout << "Loading configuration..." << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
        
        config_["database_url"] = "postgresql://localhost:5432/app";
        config_["cache_size"] = "1000";
        config_["log_level"] = "INFO";
        config_["thread_pool_size"] = "8";
        
        std::cout << "Configuration loaded" << std::endl;
    }
    
    std::string get(const std::string& key) const {
        auto it = config_.find(key);
        return it != config_.end() ? it->second : "";
    }
};

void demonstrate_lazy_initialization() {
    // Simple lazy initialization
    LazyInitialized<ConfigurationManager> config([]() {
        return ConfigurationManager();
    });
    
    // Atomic lazy initialization
    AtomicLazy<std::vector<int>> large_vector([]() {
        auto vec = std::make_unique<std::vector<int>>();
        vec->reserve(10000);
        for (int i = 0; i < 10000; ++i) {
            vec->push_back(i * i);
        }
        return vec;
    });
    
    // Dependency injection lazy initialization
    DependencyLazy<std::string> complex_string([]() {
        return std::make_unique<std::string>("Initial value");
    });
    
    complex_string.add_pre_init_hook([]() {
        std::cout << "Pre-initialization hook executed" << std::endl;
    });
    
    complex_string.add_post_init_hook([](std::string& str) {
        str += " - Enhanced by post-init hook";
        std::cout << "Post-initialization hook executed" << std::endl;
    });
    
    // Lazy cache
    LazyCacheMap<std::string, ExpensiveResource> cache([](const std::string& key) {
        return std::make_shared<ExpensiveResource>(key);
    });
    
    // Test with multiple threads
    const int num_threads = 8;
    std::vector<std::thread> threads;
    std::atomic<int> total_operations{0};
    
    for (int i = 0; i < num_threads; ++i) {
        threads.emplace_back([&, i]() {
            // Test simple lazy initialization
            if (i == 0) {
                std::cout << "Thread " << i << " accessing config..." << std::endl;
                const auto& cfg = config.get();
                std::cout << "Database URL: " << cfg.get("database_url") << std::endl;
            }
            
            // Test atomic lazy initialization
            if (i < 4) {
                std::cout << "Thread " << i << " accessing large vector..." << std::endl;
                const auto& vec = large_vector.get();
                std::cout << "Vector size: " << vec.size() 
                          << ", first element: " << vec[0] << std::endl;
            }
            
            // Test dependency injection
            if (i == 0) {
                std::cout << "Thread " << i << " accessing complex string..." << std::endl;
                const auto& str = complex_string.get();
                std::cout << "Complex string: " << str << std::endl;
            }
            
            // Test lazy cache
            std::vector<std::string> keys = {
                "resource_A", "resource_B", "resource_C", "resource_D"
            };
            
            for (const auto& key : keys) {
                auto resource = cache.get(key);
                total_operations.fetch_add(1, std::memory_order_relaxed);
                std::cout << "Thread " << i << " got resource " << key 
                          << " with result: " << resource->get_result() << std::endl;
            }
            
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
        });
    }
    
    // Wait for all threads
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Total cache operations: " << total_operations.load() << std::endl;
    std::cout << "Cache size: " << cache.size() << std::endl;
    
    // Test reset functionality
    if (large_vector.is_initialized()) {
        std::cout << "Resetting large vector..." << std::endl;
        large_vector.reset();
        std::cout << "Large vector reset. Initialized: " << large_vector.is_initialized() << std::endl;
    }
    
    // Clear expired cache entries
    cache.clear_expired();
    std::cout << "Cache size after cleanup: " << cache.size() << std::endl;
}`,

    memory_ordering: `// Memory Ordering Considerations for Thread-Safe Pointers
#include <atomic>
#include <thread>
#include <vector>
#include <chrono>

// Demonstrating different memory orderings
class MemoryOrderingExamples {
public:
    // Relaxed ordering - no synchronization or ordering constraints
    static void relaxed_counter_example() {
        std::atomic<int> counter{0};
        std::atomic<bool> done{false};
        
        constexpr int num_threads = 4;
        constexpr int increments_per_thread = 1000000;
        
        std::vector<std::thread> threads;
        
        auto start_time = std::chrono::steady_clock::now();
        
        // Producer threads
        for (int i = 0; i < num_threads; ++i) {
            threads.emplace_back([&counter, increments_per_thread]() {
                for (int j = 0; j < increments_per_thread; ++j) {
                    counter.fetch_add(1, std::memory_order_relaxed);
                }
            });
        }
        
        // Monitor thread
        threads.emplace_back([&counter, &done]() {
            int last_value = 0;
            while (!done.load(std::memory_order_relaxed)) {
                int current = counter.load(std::memory_order_relaxed);
                if (current != last_value) {
                    std::cout << "Counter: " << current << std::endl;
                    last_value = current;
                }
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
            }
        });
        
        // Wait for producer threads
        for (int i = 0; i < num_threads; ++i) {
            threads[i].join();
        }
        
        done.store(true, std::memory_order_relaxed);
        threads.back().join();
        
        auto end_time = std::chrono::steady_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);
        
        std::cout << "Relaxed ordering - Final counter: " << counter.load() 
                  << " (expected: " << num_threads * increments_per_thread << ")"
                  << " in " << duration.count() << "ms" << std::endl;
    }
    
    // Acquire-Release ordering - synchronizes memory operations
    static void acquire_release_example() {
        std::atomic<int*> ptr{nullptr};
        std::atomic<bool> ready{false};
        
        // Writer thread
        std::thread writer([&ptr, &ready]() {
            int* data = new int(42);
            *data = 123;  // This write happens-before the release
            
            ptr.store(data, std::memory_order_release);  // Release operation
            ready.store(true, std::memory_order_release);
            
            std::cout << "Writer: stored pointer and set ready flag" << std::endl;
        });
        
        // Reader thread
        std::thread reader([&ptr, &ready]() {
            while (!ready.load(std::memory_order_acquire)) {  // Acquire operation
                std::this_thread::sleep_for(std::chrono::microseconds(1));
            }
            
            int* data = ptr.load(std::memory_order_acquire);  // Acquire operation
            if (data) {
                std::cout << "Reader: got value " << *data << std::endl;  // This read happens-after acquire
                delete data;
            }
        });
        
        writer.join();
        reader.join();
    }
    
    // Sequential consistency - strongest ordering
    static void sequential_consistency_example() {
        std::atomic<bool> x{false}, y{false};
        std::atomic<int> r1{0}, r2{0};
        
        // This example demonstrates that sequential consistency prevents
        // the "impossible" outcome where both r1 and r2 are 0
        
        int iterations = 100000;
        int impossible_count = 0;
        
        for (int iter = 0; iter < iterations; ++iter) {
            x.store(false);
            y.store(false);
            r1.store(0);
            r2.store(0);
            
            std::thread t1([&x, &y, &r1]() {
                x.store(true, std::memory_order_seq_cst);
                r1.store(y.load(std::memory_order_seq_cst), std::memory_order_seq_cst);
            });
            
            std::thread t2([&x, &y, &r2]() {
                y.store(true, std::memory_order_seq_cst);
                r2.store(x.load(std::memory_order_seq_cst), std::memory_order_seq_cst);
            });
            
            t1.join();
            t2.join();
            
            if (r1.load() == 0 && r2.load() == 0) {
                impossible_count++;
            }
        }
        
        std::cout << "Sequential consistency - 'Impossible' outcomes: " 
                  << impossible_count << " / " << iterations 
                  << " (should be 0)" << std::endl;
    }
};

// Lock-free queue with proper memory ordering
template<typename T>
class LockFreeQueue {
private:
    struct Node {
        std::atomic<T*> data{nullptr};
        std::atomic<Node*> next{nullptr};
        
        Node() = default;
    };
    
    std::atomic<Node*> head_{new Node};
    std::atomic<Node*> tail_{head_.load()};
    
public:
    ~LockFreeQueue() {
        while (Node* old_head = head_.load()) {
            head_.store(old_head->next);
            delete old_head;
        }
    }
    
    void enqueue(T item) {
        Node* new_node = new Node;
        T* data = new T(std::move(item));
        new_node->data.store(data, std::memory_order_relaxed);
        
        while (true) {
            Node* last = tail_.load(std::memory_order_acquire);
            Node* next = last->next.load(std::memory_order_acquire);
            
            // Check if tail is still the last node
            if (last == tail_.load(std::memory_order_acquire)) {
                if (next == nullptr) {
                    // Try to link new node at end of list
                    if (last->next.compare_exchange_weak(next, new_node,
                                                        std::memory_order_release,
                                                        std::memory_order_relaxed)) {
                        break; // Successfully linked
                    }
                } else {
                    // Try to advance tail pointer
                    tail_.compare_exchange_weak(last, next,
                                              std::memory_order_release,
                                              std::memory_order_relaxed);
                }
            }
        }
        
        // Try to advance tail pointer
        tail_.compare_exchange_weak(tail_.load(), new_node,
                                   std::memory_order_release,
                                   std::memory_order_relaxed);
    }
    
    bool dequeue(T& result) {
        while (true) {
            Node* first = head_.load(std::memory_order_acquire);
            Node* last = tail_.load(std::memory_order_acquire);
            Node* next = first->next.load(std::memory_order_acquire);
            
            // Check consistency
            if (first == head_.load(std::memory_order_acquire)) {
                if (first == last) {
                    if (next == nullptr) {
                        return false; // Queue is empty
                    }
                    // Try to advance tail
                    tail_.compare_exchange_weak(last, next,
                                              std::memory_order_release,
                                              std::memory_order_relaxed);
                } else {
                    if (next == nullptr) {
                        continue; // Inconsistent state, retry
                    }
                    
                    // Read data before potentially freeing node
                    T* data = next->data.load(std::memory_order_acquire);
                    if (data == nullptr) {
                        continue; // Node being processed by another thread
                    }
                    
                    // Try to move head forward
                    if (head_.compare_exchange_weak(first, next,
                                                   std::memory_order_release,
                                                   std::memory_order_relaxed)) {
                        result = *data;
                        delete data;
                        delete first;
                        return true;
                    }
                }
            }
        }
    }
    
    bool empty() const {
        Node* first = head_.load(std::memory_order_acquire);
        Node* last = tail_.load(std::memory_order_acquire);
        return (first == last) && (first->next.load(std::memory_order_acquire) == nullptr);
    }
};

// Memory ordering performance comparison
class MemoryOrderingBenchmark {
public:
    static void compare_orderings() {
        constexpr int iterations = 1000000;
        
        // Test relaxed ordering performance
        auto start = std::chrono::steady_clock::now();
        
        std::atomic<int> relaxed_counter{0};
        std::thread t1([&relaxed_counter, iterations]() {
            for (int i = 0; i < iterations; ++i) {
                relaxed_counter.fetch_add(1, std::memory_order_relaxed);
            }
        });
        
        std::thread t2([&relaxed_counter, iterations]() {
            for (int i = 0; i < iterations; ++i) {
                relaxed_counter.fetch_add(1, std::memory_order_relaxed);
            }
        });
        
        t1.join();
        t2.join();
        
        auto relaxed_time = std::chrono::steady_clock::now() - start;
        
        // Test sequential consistency performance
        start = std::chrono::steady_clock::now();
        
        std::atomic<int> seq_cst_counter{0};
        std::thread t3([&seq_cst_counter, iterations]() {
            for (int i = 0; i < iterations; ++i) {
                seq_cst_counter.fetch_add(1, std::memory_order_seq_cst);
            }
        });
        
        std::thread t4([&seq_cst_counter, iterations]() {
            for (int i = 0; i < iterations; ++i) {
                seq_cst_counter.fetch_add(1, std::memory_order_seq_cst);
            }
        });
        
        t3.join();
        t4.join();
        
        auto seq_cst_time = std::chrono::steady_clock::now() - start;
        
        // Test acquire-release performance
        start = std::chrono::steady_clock::now();
        
        std::atomic<int> acq_rel_counter{0};
        std::atomic<bool> flag{false};
        
        std::thread t5([&acq_rel_counter, &flag, iterations]() {
            for (int i = 0; i < iterations; ++i) {
                acq_rel_counter.fetch_add(1, std::memory_order_acq_rel);
                flag.store(true, std::memory_order_release);
            }
        });
        
        std::thread t6([&acq_rel_counter, &flag, iterations]() {
            for (int i = 0; i < iterations; ++i) {
                while (!flag.load(std::memory_order_acquire)) {
                    // Busy wait
                }
                acq_rel_counter.fetch_add(1, std::memory_order_acq_rel);
                flag.store(false, std::memory_order_release);
            }
        });
        
        t5.join();
        t6.join();
        
        auto acq_rel_time = std::chrono::steady_clock::now() - start;
        
        // Print results
        std::cout << "Memory Ordering Performance Comparison:" << std::endl;
        std::cout << "Relaxed: " << std::chrono::duration_cast<std::chrono::microseconds>(relaxed_time).count() << " μs" << std::endl;
        std::cout << "Acquire-Release: " << std::chrono::duration_cast<std::chrono::microseconds>(acq_rel_time).count() << " μs" << std::endl;
        std::cout << "Sequential Consistency: " << std::chrono::duration_cast<std::chrono::microseconds>(seq_cst_time).count() << " μs" << std::endl;
    }
};

void demonstrate_memory_ordering() {
    std::cout << "=== Memory Ordering Demonstrations ===" << std::endl;
    
    // Relaxed ordering example
    std::cout << "\\n1. Relaxed Ordering Example:" << std::endl;
    MemoryOrderingExamples::relaxed_counter_example();
    
    // Acquire-Release example
    std::cout << "\\n2. Acquire-Release Ordering Example:" << std::endl;
    MemoryOrderingExamples::acquire_release_example();
    
    // Sequential consistency example
    std::cout << "\\n3. Sequential Consistency Example:" << std::endl;
    MemoryOrderingExamples::sequential_consistency_example();
    
    // Lock-free queue test
    std::cout << "\\n4. Lock-Free Queue with Proper Memory Ordering:" << std::endl;
    LockFreeQueue<int> queue;
    
    const int num_producers = 4;
    const int num_consumers = 2;
    const int items_per_producer = 1000;
    
    std::vector<std::thread> producers;
    std::vector<std::thread> consumers;
    std::atomic<int> total_consumed{0};
    std::atomic<bool> production_done{false};
    
    // Start producers
    for (int i = 0; i < num_producers; ++i) {
        producers.emplace_back([&queue, i, items_per_producer]() {
            for (int j = 0; j < items_per_producer; ++j) {
                queue.enqueue(i * items_per_producer + j);
            }
            std::cout << "Producer " << i << " finished" << std::endl;
        });
    }
    
    // Start consumers
    for (int i = 0; i < num_consumers; ++i) {
        consumers.emplace_back([&queue, &total_consumed, &production_done, i]() {
            int item;
            int consumed_count = 0;
            
            while (!production_done.load(std::memory_order_acquire) || !queue.empty()) {
                if (queue.dequeue(item)) {
                    consumed_count++;
                    total_consumed.fetch_add(1, std::memory_order_relaxed);
                } else {
                    std::this_thread::sleep_for(std::chrono::microseconds(1));
                }
            }
            
            std::cout << "Consumer " << i << " consumed " << consumed_count << " items" << std::endl;
        });
    }
    
    // Wait for producers to finish
    for (auto& t : producers) {
        t.join();
    }
    
    production_done.store(true, std::memory_order_release);
    
    // Wait for consumers
    for (auto& t : consumers) {
        t.join();
    }
    
    std::cout << "Total items produced: " << num_producers * items_per_producer << std::endl;
    std::cout << "Total items consumed: " << total_consumed.load() << std::endl;
    std::cout << "Queue empty: " << queue.empty() << std::endl;
    
    // Performance comparison
    std::cout << "\\n5. Memory Ordering Performance Comparison:" << std::endl;
    MemoryOrderingBenchmark::compare_orderings();
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 97: Thread-Safe Pointer Techniques" : "Lección 97: Técnicas de Punteros Thread-Safe"}
      lessonId="lesson-97"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'Advanced Thread-Safe Pointer Patterns for High-Performance Multithreading' : 'Patrones Avanzados de Punteros Thread-Safe para Multithreading de Alto Rendimiento'}
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
                  'Implement atomic reference counting for safe shared pointer operations',
                  'Design hazard pointer systems for lock-free data structure protection',
                  'Apply RCU (Read-Copy-Update) patterns for high-performance concurrent access',
                  'Master double-checked locking with proper memory ordering semantics',
                  'Create thread-safe lazy initialization patterns with minimal overhead',
                  'Understand and optimize memory ordering for different concurrency scenarios'
                ]
              : [
                  'Implementar conteo de referencias atómico para operaciones seguras de punteros compartidos',
                  'Diseñar sistemas de punteros hazard para protección de estructuras de datos lock-free',
                  'Aplicar patrones RCU (Read-Copy-Update) para acceso concurrente de alto rendimiento',
                  'Dominar double-checked locking con semánticas apropiadas de memory ordering',
                  'Crear patrones de inicialización lazy thread-safe con overhead mínimo',
                  'Entender y optimizar memory ordering para diferentes escenarios de concurrencia'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive Thread-Safe Pointer Demonstration' : 'Demostración Interactiva de Punteros Thread-Safe'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <ThreadSafeVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('atomic_ref_counting')}
            variant={state.scenario === 'atomic_ref_counting' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Atomic Ref Count' : 'Conteo Atómico'}
          </Button>
          <Button 
            onClick={() => runScenario('hazard_pointers')}
            variant={state.scenario === 'hazard_pointers' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Hazard Pointers' : 'Punteros Hazard'}
          </Button>
          <Button 
            onClick={() => runScenario('rcu_patterns')}
            variant={state.scenario === 'rcu_patterns' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'RCU Patterns' : 'Patrones RCU'}
          </Button>
          <Button 
            onClick={() => runScenario('double_checked_locking')}
            variant={state.scenario === 'double_checked_locking' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Double-Checked' : 'Doble Verificación'}
          </Button>
          <Button 
            onClick={() => runScenario('lazy_initialization')}
            variant={state.scenario === 'lazy_initialization' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Lazy Init' : 'Init Perezosa'}
          </Button>
          <Button 
            onClick={() => runScenario('memory_ordering')}
            variant={state.scenario === 'memory_ordering' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Memory Ordering' : 'Ordenamiento Memoria'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Active Threads' : 'Hilos Activos', 
              value: state.threadsActive,
              color: '#00ff00'
            },
            { 
              label: state.language === 'en' ? 'Sync Ops/sec' : 'Ops Sync/seg', 
              value: state.syncOperations,
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Memory Reads/sec' : 'Lecturas Memoria/seg', 
              value: state.memoryReads,
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Contention Level %' : 'Nivel Contención %', 
              value: state.contentionLevel,
              color: '#ff0080'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'atomic_ref_counting' && (state.language === 'en' ? 'Atomic Reference Counting Implementation' : 'Implementación de Conteo de Referencias Atómico')}
          {state.scenario === 'hazard_pointers' && (state.language === 'en' ? 'Hazard Pointers for Lock-Free Safety' : 'Punteros Hazard para Seguridad Lock-Free')}
          {state.scenario === 'rcu_patterns' && (state.language === 'en' ? 'RCU (Read-Copy-Update) Patterns' : 'Patrones RCU (Read-Copy-Update)')}
          {state.scenario === 'double_checked_locking' && (state.language === 'en' ? 'Double-Checked Locking Pattern' : 'Patrón Double-Checked Locking')}
          {state.scenario === 'lazy_initialization' && (state.language === 'en' ? 'Thread-Safe Lazy Initialization' : 'Inicialización Lazy Thread-Safe')}
          {state.scenario === 'memory_ordering' && (state.language === 'en' ? 'Memory Ordering Considerations' : 'Consideraciones de Ordenamiento de Memoria')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'atomic_ref_counting' ? 
              (state.language === 'en' ? 'Thread-Safe Reference Counting' : 'Conteo de Referencias Thread-Safe') :
            state.scenario === 'hazard_pointers' ? 
              (state.language === 'en' ? 'Hazard Pointer Management System' : 'Sistema de Gestión de Punteros Hazard') :
            state.scenario === 'rcu_patterns' ? 
              (state.language === 'en' ? 'RCU Pattern Implementation' : 'Implementación de Patrones RCU') :
            state.scenario === 'double_checked_locking' ? 
              (state.language === 'en' ? 'Double-Checked Locking with Memory Ordering' : 'Double-Checked Locking con Ordenamiento de Memoria') :
            state.scenario === 'lazy_initialization' ? 
              (state.language === 'en' ? 'Lazy Initialization Patterns' : 'Patrones de Inicialización Lazy') :
            (state.language === 'en' ? 'Memory Ordering Examples' : 'Ejemplos de Ordenamiento de Memoria')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Thread-Safe Pointer Design Principles' : 'Principios de Diseño de Punteros Thread-Safe'}
        </SectionTitle>
        
        <PerformanceComparison
          title={state.language === 'en' ? 'Thread-Safety Technique Comparison' : 'Comparación de Técnicas Thread-Safety'}
          scenarios={[
            {
              name: state.language === 'en' ? 'Atomic Ref Counting' : 'Conteo Ref Atómico',
              metrics: {
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 75,
                [state.language === 'en' ? 'Safety' : 'Seguridad']: 90,
                [state.language === 'en' ? 'Scalability' : 'Escalabilidad']: 70,
                [state.language === 'en' ? 'Complexity' : 'Complejidad']: 60
              }
            },
            {
              name: state.language === 'en' ? 'Hazard Pointers' : 'Punteros Hazard',
              metrics: {
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 95,
                [state.language === 'en' ? 'Safety' : 'Seguridad']: 95,
                [state.language === 'en' ? 'Scalability' : 'Escalabilidad']: 90,
                [state.language === 'en' ? 'Complexity' : 'Complejidad']: 85
              }
            },
            {
              name: state.language === 'en' ? 'RCU Patterns' : 'Patrones RCU',
              metrics: {
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 98,
                [state.language === 'en' ? 'Safety' : 'Seguridad']: 85,
                [state.language === 'en' ? 'Scalability' : 'Escalabilidad']: 95,
                [state.language === 'en' ? 'Complexity' : 'Complejidad']: 80
              }
            },
            {
              name: state.language === 'en' ? 'Double-Checked Locking' : 'Double-Checked Locking',
              metrics: {
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 85,
                [state.language === 'en' ? 'Safety' : 'Seguridad']: 80,
                [state.language === 'en' ? 'Scalability' : 'Escalabilidad']: 75,
                [state.language === 'en' ? 'Complexity' : 'Complejidad']: 70
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
          <h4 style={{ color: '#ff6b00', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🚀 Thread-Safe Pointer Best Practices:' : '🚀 Mejores Prácticas de Punteros Thread-Safe:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Memory Ordering:' : 'Ordenamiento de Memoria:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Choose appropriate memory ordering constraints based on synchronization requirements'
                : 'Elegir restricciones de ordenamiento de memoria apropiadas basadas en requisitos de sincronización'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Lock-Free Design:' : 'Diseño Lock-Free:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Use hazard pointers or RCU patterns for high-performance concurrent data structures'
                : 'Usar punteros hazard o patrones RCU para estructuras de datos concurrentes de alto rendimiento'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Safe Reclamation:' : 'Reclamación Segura:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Implement proper memory reclamation strategies to prevent use-after-free errors'
                : 'Implementar estrategias apropiadas de reclamación de memoria para prevenir errores use-after-free'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Contention Minimization:' : 'Minimización de Contención:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Design algorithms to minimize cache line sharing and false sharing'
                : 'Diseñar algoritmos para minimizar compartición de líneas de caché y false sharing'
              }
            </li>
          </ul>
        </div>

        <UndefinedBehaviorWarning
          title={state.language === 'en' ? 'Critical Thread-Safety Considerations' : 'Consideraciones Críticas de Thread-Safety'}
          description={
            state.language === 'en' 
              ? 'Thread-safe pointer operations require careful attention to memory ordering, race conditions, and data races. Incorrect implementation can lead to subtle bugs, memory corruption, or deadlocks. Always validate thread-safety with stress testing and formal verification when possible.'
              : 'Las operaciones de punteros thread-safe requieren atención cuidadosa al ordenamiento de memoria, condiciones de carrera y data races. La implementación incorrecta puede llevar a bugs sutiles, corrupción de memoria o deadlocks. Siempre validar thread-safety con stress testing y verificación formal cuando sea posible.'
          }
        />
      </Section>
    </LessonLayout>
  );
};

export default Lesson97_ThreadSafePointers;