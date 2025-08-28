import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import {
  LessonLayout,
  TheoryPanel,
  VisualizationPanel,
  Section,
  SectionTitle,
  CodeBlock,
  InteractiveSection,
  StatusDisplay,
  ButtonGroup,
  theme
} from '../design-system';



interface ConcurrencyMetrics {
  throughput: number;
  scalability: number;
  contention: number;
  memoryOrder: number;
}

interface ConcurrencyVisualizationProps {
  metrics: ConcurrencyMetrics;
  activePattern: string;
  onPatternSelect: (pattern: string) => void;
}

const ConcurrencyVisualization: React.FC<ConcurrencyVisualizationProps> = ({ 
  metrics, 
  activePattern, 
  onPatternSelect 
}) => {
  const groupRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const patterns = [
    { name: 'Lock-Free', position: [-3, 2, 0], color: '#2ecc71', performance: 0.95 },
    { name: 'Wait-Free', position: [0, 2, 0], color: '#27ae60', performance: 0.98 },
    { name: 'RCU', position: [3, 2, 0], color: '#16a085', performance: 0.92 },
    { name: 'Hazard Ptrs', position: [-2, -1, 0], color: '#3498db', performance: 0.88 },
    { name: 'Atomic Shared', position: [2, -1, 0], color: '#2980b9', performance: 0.85 }
  ];

  return (
    <group ref={groupRef}>
      {patterns.map((pattern, index) => (
        <group key={pattern.name}>
          <Box
            position={pattern.position}
            args={[1.2, 0.8, 0.4]}
            onClick={() => onPatternSelect(pattern.name)}
          >
            <meshPhongMaterial 
              color={activePattern === pattern.name ? '#ffffff' : pattern.color}
              transparent={true}
              opacity={activePattern === pattern.name ? 1.0 : 0.8}
            />
          </Box>
          
          <Text
            position={[pattern.position[0], pattern.position[1] - 1.0, pattern.position[2]]}
            fontSize={0.2}
            color="#333"
            anchorX="center"
            anchorY="middle"
          >
            {pattern.name}
          </Text>
          
          {/* Performance indicator */}
          <Sphere
            position={[pattern.position[0], pattern.position[1] + 1.0, pattern.position[2]]}
            args={[0.1 + (pattern.performance * 0.25)]}
          >
            <meshPhongMaterial 
              color={pattern.performance > 0.9 ? '#27ae60' : pattern.performance > 0.85 ? '#f39c12' : '#e74c3c'}
              transparent
              opacity={0.8}
            />
          </Sphere>
          
          {/* Connection lines showing relationships */}
          {index < patterns.length - 1 && (
            <Cylinder
              args={[0.01, 0.01, 2]}
              position={[(pattern.position[0] + patterns[index + 1].position[0]) / 2, 
                        (pattern.position[1] + patterns[index + 1].position[1]) / 2, 0]}
              rotation={[0, 0, Math.atan2(
                patterns[index + 1].position[1] - pattern.position[1],
                patterns[index + 1].position[0] - pattern.position[0]
              )]}
            >
              <meshPhongMaterial color="#95a5a6" transparent opacity={0.4} />
            </Cylinder>
          )}
        </group>
      ))}
      
      {/* Central synchronization hub */}
      <Cone position={[0, 0.5, 0]} args={[0.3, 0.8, 6]}>
        <meshPhongMaterial color="#34495e" transparent opacity={0.7} />
      </Cone>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Sync Hub
      </Text>
    </group>
  );
};

const Lesson114_ConcurrencyPatternsAdvanced: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('advanced-synchronization');
  const [selectedPattern, setSelectedPattern] = useState<string>('Lock-Free');
  const [metrics, setMetrics] = useState<ConcurrencyMetrics>({
    throughput: 0.92,
    scalability: 0.88,
    contention: 0.15,
    memoryOrder: 0.85
  });

  const examples = {
    'advanced-synchronization': {
      title: state.language === 'en' ? 'Advanced Synchronization with Pointers' : 'Sincronización Avanzada con Punteros',
      code: `#include <memory>
#include <atomic>
#include <thread>
#include <vector>
#include <mutex>
#include <shared_mutex>

// Advanced synchronization patterns for concurrent pointer access
namespace advanced_sync {

// Hazard Pointer implementation for safe memory reclamation
class HazardPointerManager {
private:
    struct HazardRecord {
        std::atomic<void*> hazard_ptr{nullptr};
        std::atomic<bool> active{false};
        std::thread::id owner_thread;
        
        HazardRecord() = default;
    };
    
    static constexpr size_t MAX_HAZARDS = 128;
    static constexpr size_t MAX_RETIRED = 256;
    
    static thread_local std::vector<void*> retired_pointers_;
    static thread_local size_t retired_count_;
    
    std::array<HazardRecord, MAX_HAZARDS> hazard_records_;
    std::atomic<size_t> hazard_count_{0};
    
    static HazardPointerManager& instance() {
        static HazardPointerManager manager;
        return manager;
    }
    
public:
    class HazardGuard {
    private:
        HazardRecord* record_;
        
    public:
        HazardGuard() : record_(nullptr) {
            auto& manager = HazardPointerManager::instance();
            
            // Find an unused hazard record
            for (auto& record : manager.hazard_records_) {
                bool expected = false;
                if (record.active.compare_exchange_weak(expected, true)) {
                    record_ = &record;
                    record.owner_thread = std::this_thread::get_id();
                    break;
                }
            }
            
            if (!record_) {
                throw std::runtime_error("No available hazard records");
            }
        }
        
        ~HazardGuard() {
            if (record_) {
                record_->hazard_ptr.store(nullptr);
                record_->active.store(false);
            }
        }
        
        void protect(void* ptr) {
            if (record_) {
                record_->hazard_ptr.store(ptr, std::memory_order_release);
            }
        }
        
        template<typename T>
        T* load_and_protect(const std::atomic<T*>& atomic_ptr) {
            T* ptr;
            do {
                ptr = atomic_ptr.load(std::memory_order_acquire);
                protect(ptr);
                // Verify the pointer hasn't changed
            } while (ptr != atomic_ptr.load(std::memory_order_acquire));
            
            return ptr;
        }
    };
    
    static void retire_pointer(void* ptr, std::function<void(void*)> deleter) {
        retired_pointers_.push_back(ptr);
        retired_count_++;
        
        if (retired_count_ >= MAX_RETIRED / 2) {
            scan_and_reclaim();
        }
    }
    
private:
    static void scan_and_reclaim() {
        auto& manager = HazardPointerManager::instance();
        
        // Collect all active hazard pointers
        std::set<void*> hazards;
        for (const auto& record : manager.hazard_records_) {
            if (record.active.load()) {
                void* hazard = record.hazard_ptr.load();
                if (hazard) {
                    hazards.insert(hazard);
                }
            }
        }
        
        // Reclaim non-hazardous retired pointers
        auto it = retired_pointers_.begin();
        while (it != retired_pointers_.end()) {
            if (hazards.find(*it) == hazards.end()) {
                // Safe to delete
                delete static_cast<char*>(*it); // Simplified deletion
                it = retired_pointers_.erase(it);
                retired_count_--;
            } else {
                ++it;
            }
        }
    }
};

thread_local std::vector<void*> HazardPointerManager::retired_pointers_;
thread_local size_t HazardPointerManager::retired_count_{0};

// Lock-free shared_ptr using atomic operations
template<typename T>
class LockFreeSharedPtr {
private:
    struct ControlBlock {
        std::atomic<size_t> ref_count{1};
        std::atomic<size_t> weak_count{1};
        T* ptr;
        std::function<void(T*)> deleter;
        
        ControlBlock(T* p, std::function<void(T*)> del) 
            : ptr(p), deleter(std::move(del)) {}
        
        void add_ref() {
            ref_count.fetch_add(1, std::memory_order_relaxed);
        }
        
        void release() {
            if (ref_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                if (deleter && ptr) {
                    deleter(ptr);
                }
                ptr = nullptr;
                
                if (weak_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                    delete this;
                }
            }
        }
        
        void weak_release() {
            if (weak_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                if (ref_count.load(std::memory_order_acquire) == 0) {
                    delete this;
                }
            }
        }
        
        bool try_add_ref() {
            size_t current = ref_count.load(std::memory_order_relaxed);
            do {
                if (current == 0) return false;
            } while (!ref_count.compare_exchange_weak(current, current + 1, 
                                                     std::memory_order_relaxed));
            return true;
        }
    };
    
    std::atomic<ControlBlock*> control_block_{nullptr};
    
public:
    LockFreeSharedPtr() = default;
    
    explicit LockFreeSharedPtr(T* ptr) {
        if (ptr) {
            control_block_ = new ControlBlock(ptr, [](T* p) { delete p; });
        }
    }
    
    LockFreeSharedPtr(const LockFreeSharedPtr& other) {
        HazardPointerManager::HazardGuard guard;
        ControlBlock* cb = guard.load_and_protect(other.control_block_);
        
        if (cb && cb->try_add_ref()) {
            control_block_ = cb;
        }
    }
    
    LockFreeSharedPtr& operator=(const LockFreeSharedPtr& other) {
        if (this != &other) {
            HazardPointerManager::HazardGuard guard;
            ControlBlock* new_cb = guard.load_and_protect(other.control_block_);
            
            if (new_cb) {
                new_cb->try_add_ref();
            }
            
            ControlBlock* old_cb = control_block_.exchange(new_cb);
            if (old_cb) {
                old_cb->release();
            }
        }
        return *this;
    }
    
    ~LockFreeSharedPtr() {
        ControlBlock* cb = control_block_.load();
        if (cb) {
            cb->release();
        }
    }
    
    T* get() const {
        HazardPointerManager::HazardGuard guard;
        ControlBlock* cb = guard.load_and_protect(control_block_);
        return cb ? cb->ptr : nullptr;
    }
    
    size_t use_count() const {
        ControlBlock* cb = control_block_.load(std::memory_order_acquire);
        return cb ? cb->ref_count.load(std::memory_order_relaxed) : 0;
    }
    
    void reset(T* new_ptr = nullptr) {
        ControlBlock* new_cb = nullptr;
        if (new_ptr) {
            new_cb = new ControlBlock(new_ptr, [](T* p) { delete p; });
        }
        
        ControlBlock* old_cb = control_block_.exchange(new_cb);
        if (old_cb) {
            old_cb->release();
        }
    }
    
    T& operator*() const { return *get(); }
    T* operator->() const { return get(); }
    explicit operator bool() const { return get() != nullptr; }
};

// RCU (Read-Copy-Update) pattern for concurrent data structures
template<typename T>
class RCUProtectedData {
private:
    std::atomic<T*> current_data_{nullptr};
    std::shared_mutex rcu_mutex_;
    std::vector<std::unique_ptr<T>> pending_deletion_;
    
public:
    explicit RCUProtectedData(std::unique_ptr<T> initial_data) {
        current_data_ = initial_data.release();
    }
    
    ~RCUProtectedData() {
        T* data = current_data_.load();
        delete data;
    }
    
    // Reader access (lock-free)
    class ReadGuard {
    private:
        T* data_;
        
    public:
        explicit ReadGuard(const RCUProtectedData& rcu) {
            data_ = rcu.current_data_.load(std::memory_order_acquire);
        }
        
        const T* get() const { return data_; }
        const T* operator->() const { return data_; }
        const T& operator*() const { return *data_; }
    };
    
    ReadGuard read() const {
        return ReadGuard(*this);
    }
    
    // Writer access (requires synchronization)
    template<typename Updater>
    void update(Updater&& updater) {
        std::unique_lock<std::shared_mutex> lock(rcu_mutex_);
        
        T* old_data = current_data_.load();
        auto new_data = std::make_unique<T>(*old_data); // Copy
        
        updater(*new_data); // Update
        
        current_data_.store(new_data.get(), std::memory_order_release);
        pending_deletion_.push_back(std::unique_ptr<T>(old_data));
        new_data.release(); // Transfer ownership to current_data_
        
        // Cleanup old versions (simplified grace period)
        if (pending_deletion_.size() > 10) {
            cleanup_old_versions();
        }
    }
    
private:
    void cleanup_old_versions() {
        // In a real RCU implementation, this would wait for a grace period
        // to ensure no readers are accessing old data
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
        pending_deletion_.clear();
    }
};

// Wait-free queue for pointer-based data
template<typename T>
class WaitFreeQueue {
private:
    struct Node {
        std::atomic<T*> data{nullptr};
        std::atomic<Node*> next{nullptr};
        
        Node() = default;
    };
    
    std::atomic<Node*> head_;
    std::atomic<Node*> tail_;
    
public:
    WaitFreeQueue() {
        Node* dummy = new Node;
        head_ = dummy;
        tail_ = dummy;
    }
    
    ~WaitFreeQueue() {
        Node* current = head_.load();
        while (current) {
            Node* next = current->next.load();
            delete current;
            current = next;
        }
    }
    
    void enqueue(std::unique_ptr<T> item) {
        Node* new_node = new Node;
        T* data = item.release();
        new_node->data.store(data, std::memory_order_relaxed);
        
        Node* prev_tail = tail_.exchange(new_node, std::memory_order_acq_rel);
        prev_tail->next.store(new_node, std::memory_order_release);
    }
    
    std::unique_ptr<T> dequeue() {
        Node* head = head_.load(std::memory_order_acquire);
        Node* next = head->next.load(std::memory_order_acquire);
        
        if (!next) {
            return nullptr; // Empty queue
        }
        
        T* data = next->data.exchange(nullptr, std::memory_order_relaxed);
        head_.store(next, std::memory_order_release);
        
        delete head; // Safe because we're the only thread modifying head_
        
        return std::unique_ptr<T>(data);
    }
    
    bool empty() const {
        Node* head = head_.load(std::memory_order_acquire);
        Node* next = head->next.load(std::memory_order_acquire);
        return next == nullptr;
    }
};

} // namespace advanced_sync`
    },
    
    'wait-free-algorithms': {
      title: state.language === 'en' ? 'Wait-Free Algorithms' : 'Algoritmos Wait-Free',
      code: `#include <atomic>
#include <memory>
#include <array>
#include <thread>
#include <chrono>

// Wait-free data structures with smart pointer integration
namespace wait_free {

// Wait-free stack using hazard pointers
template<typename T>
class WaitFreeStack {
private:
    struct Node {
        T data;
        std::atomic<Node*> next;
        
        template<typename... Args>
        Node(Args&&... args) : data(std::forward<Args>(args)...), next(nullptr) {}
    };
    
    std::atomic<Node*> head_{nullptr};
    
    // Hazard pointer for safe memory reclamation
    static constexpr size_t MAX_THREADS = 64;
    static thread_local std::array<std::atomic<Node*>, 2> hazard_pointers_;
    static std::array<std::atomic<std::thread::id>, MAX_THREADS> thread_ids_;
    static std::atomic<size_t> thread_count_;
    
    size_t get_thread_index() {
        auto tid = std::this_thread::get_id();
        
        // Find existing thread index
        for (size_t i = 0; i < thread_count_.load(); ++i) {
            if (thread_ids_[i].load() == tid) {
                return i;
            }
        }
        
        // Register new thread
        size_t index = thread_count_.fetch_add(1);
        if (index >= MAX_THREADS) {
            throw std::runtime_error("Too many threads");
        }
        
        thread_ids_[index].store(tid);
        return index;
    }
    
    void protect_pointer(size_t hazard_index, Node* ptr) {
        hazard_pointers_[hazard_index].store(ptr, std::memory_order_release);
    }
    
    bool is_hazardous(Node* ptr) {
        for (size_t thread = 0; thread < thread_count_.load(); ++thread) {
            for (size_t hazard = 0; hazard < 2; ++hazard) {
                if (hazard_pointers_[hazard].load() == ptr) {
                    return true;
                }
            }
        }
        return false;
    }
    
public:
    WaitFreeStack() = default;
    
    ~WaitFreeStack() {
        while (!empty()) {
            pop();
        }
    }
    
    void push(T item) {
        Node* new_node = new Node(std::move(item));
        Node* old_head = head_.load(std::memory_order_relaxed);
        
        do {
            new_node->next.store(old_head, std::memory_order_relaxed);
        } while (!head_.compare_exchange_weak(old_head, new_node,
                                             std::memory_order_release,
                                             std::memory_order_relaxed));
    }
    
    std::optional<T> pop() {
        size_t thread_index = get_thread_index();
        Node* old_head;
        
        do {
            old_head = head_.load(std::memory_order_acquire);
            if (!old_head) {
                return std::nullopt;
            }
            
            protect_pointer(0, old_head);
            
            // Verify the pointer is still valid
            if (old_head != head_.load(std::memory_order_acquire)) {
                continue;
            }
            
            Node* next = old_head->next.load(std::memory_order_acquire);
            protect_pointer(1, next);
            
        } while (!head_.compare_exchange_weak(old_head, next,
                                             std::memory_order_release,
                                             std::memory_order_relaxed));
        
        T result = std::move(old_head->data);
        
        // Safe memory reclamation using hazard pointers
        if (!is_hazardous(old_head)) {
            delete old_head;
        } else {
            // Defer deletion - in a full implementation, this would go to a retire list
            std::this_thread::sleep_for(std::chrono::nanoseconds(1));
            if (!is_hazardous(old_head)) {
                delete old_head;
            }
        }
        
        protect_pointer(0, nullptr);
        protect_pointer(1, nullptr);
        
        return result;
    }
    
    bool empty() const {
        return head_.load(std::memory_order_acquire) == nullptr;
    }
};

template<typename T>
thread_local std::array<std::atomic<typename WaitFreeStack<T>::Node*>, 2> 
    WaitFreeStack<T>::hazard_pointers_;

template<typename T>
std::array<std::atomic<std::thread::id>, WaitFreeStack<T>::MAX_THREADS> 
    WaitFreeStack<T>::thread_ids_;

template<typename T>
std::atomic<size_t> WaitFreeStack<T>::thread_count_{0};

// Wait-free hash map with smart pointer values
template<typename Key, typename Value, size_t TableSize = 1024>
class WaitFreeHashMap {
private:
    struct Entry {
        std::atomic<Key> key;
        std::atomic<std::shared_ptr<Value>> value;
        std::atomic<bool> valid{false};
        
        Entry() : key{}, value{nullptr} {}
    };
    
    std::array<Entry, TableSize> table_;
    
    size_t hash(const Key& key) const {
        return std::hash<Key>{}(key) % TableSize;
    }
    
    size_t find_slot(const Key& key) const {
        size_t index = hash(key);
        size_t original_index = index;
        
        do {
            const Entry& entry = table_[index];
            if (!entry.valid.load(std::memory_order_acquire)) {
                return index; // Found empty slot
            }
            
            if (entry.key.load(std::memory_order_acquire) == key) {
                return index; // Found existing key
            }
            
            index = (index + 1) % TableSize;
        } while (index != original_index);
        
        return TableSize; // Table full
    }
    
public:
    bool insert(const Key& key, std::shared_ptr<Value> value) {
        size_t index = find_slot(key);
        if (index == TableSize) {
            return false; // Table full
        }
        
        Entry& entry = table_[index];
        
        // Try to claim this slot
        bool expected = false;
        if (entry.valid.compare_exchange_strong(expected, true, std::memory_order_acq_rel)) {
            // Successfully claimed empty slot
            entry.key.store(key, std::memory_order_relaxed);
            entry.value.store(value, std::memory_order_release);
            return true;
        } else {
            // Slot was already claimed, check if it's the same key
            if (entry.key.load(std::memory_order_acquire) == key) {
                // Update existing entry
                entry.value.store(value, std::memory_order_release);
                return true;
            }
            return false; // Different key in this slot
        }
    }
    
    std::shared_ptr<Value> find(const Key& key) const {
        size_t index = hash(key);
        size_t original_index = index;
        
        do {
            const Entry& entry = table_[index];
            if (!entry.valid.load(std::memory_order_acquire)) {
                return nullptr; // Empty slot, key not found
            }
            
            if (entry.key.load(std::memory_order_acquire) == key) {
                return entry.value.load(std::memory_order_acquire);
            }
            
            index = (index + 1) % TableSize;
        } while (index != original_index);
        
        return nullptr; // Not found
    }
    
    bool erase(const Key& key) {
        size_t index = find_slot(key);
        if (index == TableSize) {
            return false; // Not found
        }
        
        Entry& entry = table_[index];
        if (entry.valid.load(std::memory_order_acquire) && 
            entry.key.load(std::memory_order_acquire) == key) {
            
            entry.value.store(nullptr, std::memory_order_release);
            entry.valid.store(false, std::memory_order_release);
            return true;
        }
        
        return false;
    }
    
    size_t size() const {
        size_t count = 0;
        for (const auto& entry : table_) {
            if (entry.valid.load(std::memory_order_acquire)) {
                ++count;
            }
        }
        return count;
    }
    
    bool empty() const {
        return size() == 0;
    }
};

// Wait-free reference counting for custom smart pointers
template<typename T>
class WaitFreeReferenceCounter {
private:
    std::atomic<size_t> count_{1};
    std::atomic<T*> ptr_{nullptr};
    std::function<void(T*)> deleter_;
    
public:
    explicit WaitFreeReferenceCounter(T* ptr, std::function<void(T*)> deleter = nullptr)
        : ptr_(ptr), deleter_(deleter ? std::move(deleter) : [](T* p) { delete p; }) {}
    
    void add_reference() {
        count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    bool release_reference() {
        size_t old_count = count_.fetch_sub(1, std::memory_order_acq_rel);
        if (old_count == 1) {
            // Last reference released
            T* ptr = ptr_.exchange(nullptr, std::memory_order_acq_rel);
            if (ptr && deleter_) {
                deleter_(ptr);
            }
            return true; // Object was deleted
        }
        return false; // Object still has references
    }
    
    size_t use_count() const {
        return count_.load(std::memory_order_acquire);
    }
    
    T* get() const {
        return ptr_.load(std::memory_order_acquire);
    }
    
    bool expired() const {
        return count_.load(std::memory_order_acquire) == 0;
    }
};

// Wait-free smart pointer implementation
template<typename T>
class WaitFreeSmartPtr {
private:
    std::atomic<WaitFreeReferenceCounter<T>*> counter_{nullptr};
    
public:
    WaitFreeSmartPtr() = default;
    
    explicit WaitFreeSmartPtr(T* ptr) {
        if (ptr) {
            counter_ = new WaitFreeReferenceCounter<T>(ptr);
        }
    }
    
    WaitFreeSmartPtr(const WaitFreeSmartPtr& other) {
        WaitFreeReferenceCounter<T>* other_counter = 
            other.counter_.load(std::memory_order_acquire);
        
        if (other_counter && !other_counter->expired()) {
            other_counter->add_reference();
            counter_ = other_counter;
        }
    }
    
    WaitFreeSmartPtr(WaitFreeSmartPtr&& other) noexcept {
        counter_ = other.counter_.exchange(nullptr);
    }
    
    ~WaitFreeSmartPtr() {
        reset();
    }
    
    WaitFreeSmartPtr& operator=(const WaitFreeSmartPtr& other) {
        if (this != &other) {
            WaitFreeReferenceCounter<T>* old_counter = counter_.load();
            WaitFreeReferenceCounter<T>* new_counter = 
                other.counter_.load(std::memory_order_acquire);
            
            if (new_counter && !new_counter->expired()) {
                new_counter->add_reference();
            }
            
            counter_ = new_counter;
            
            if (old_counter) {
                if (old_counter->release_reference()) {
                    delete old_counter;
                }
            }
        }
        return *this;
    }
    
    WaitFreeSmartPtr& operator=(WaitFreeSmartPtr&& other) noexcept {
        if (this != &other) {
            WaitFreeReferenceCounter<T>* old_counter = counter_.exchange(
                other.counter_.exchange(nullptr));
            
            if (old_counter) {
                if (old_counter->release_reference()) {
                    delete old_counter;
                }
            }
        }
        return *this;
    }
    
    T* get() const {
        WaitFreeReferenceCounter<T>* cnt = counter_.load(std::memory_order_acquire);
        return cnt ? cnt->get() : nullptr;
    }
    
    T& operator*() const {
        return *get();
    }
    
    T* operator->() const {
        return get();
    }
    
    size_t use_count() const {
        WaitFreeReferenceCounter<T>* cnt = counter_.load(std::memory_order_acquire);
        return cnt ? cnt->use_count() : 0;
    }
    
    explicit operator bool() const {
        return get() != nullptr;
    }
    
    void reset(T* new_ptr = nullptr) {
        WaitFreeReferenceCounter<T>* new_counter = nullptr;
        if (new_ptr) {
            new_counter = new WaitFreeReferenceCounter<T>(new_ptr);
        }
        
        WaitFreeReferenceCounter<T>* old_counter = counter_.exchange(new_counter);
        if (old_counter) {
            if (old_counter->release_reference()) {
                delete old_counter;
            }
        }
    }
    
    bool unique() const {
        return use_count() == 1;
    }
};

// Performance benchmarking for wait-free operations
class WaitFreePerformanceBenchmark {
private:
    std::chrono::high_resolution_clock::time_point start_time_;
    std::string operation_name_;
    
public:
    explicit WaitFreePerformanceBenchmark(std::string operation) 
        : operation_name_(std::move(operation))
        , start_time_(std::chrono::high_resolution_clock::now()) {}
    
    ~WaitFreePerformanceBenchmark() {
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(
            end_time - start_time_);
        
        printf("Wait-free %s took %ld nanoseconds\\n", 
               operation_name_.c_str(), duration.count());
    }
    
    template<typename F>
    static auto measure_operation(const std::string& name, F&& func) {
        WaitFreePerformanceBenchmark benchmark(name);
        return func();
    }
};

} // namespace wait_free`
    },
    
    'memory-ordering': {
      title: state.language === 'en' ? 'Memory Ordering and Pointers' : 'Orden de Memoria y Punteros',
      code: `#include <atomic>
#include <memory>
#include <thread>
#include <vector>
#include <chrono>

// Memory ordering patterns for concurrent pointer operations
namespace memory_ordering {

// Relaxed ordering for performance-critical pointer operations
template<typename T>
class RelaxedPointerOperations {
private:
    std::atomic<T*> ptr_{nullptr};
    std::atomic<size_t> operation_count_{0};
    
public:
    void store_relaxed(T* new_ptr) {
        ptr_.store(new_ptr, std::memory_order_relaxed);
        operation_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    T* load_relaxed() const {
        operation_count_.fetch_add(1, std::memory_order_relaxed);
        return ptr_.load(std::memory_order_relaxed);
    }
    
    T* exchange_relaxed(T* new_ptr) {
        operation_count_.fetch_add(1, std::memory_order_relaxed);
        return ptr_.exchange(new_ptr, std::memory_order_relaxed);
    }
    
    bool compare_exchange_weak_relaxed(T*& expected, T* desired) {
        operation_count_.fetch_add(1, std::memory_order_relaxed);
        return ptr_.compare_exchange_weak(expected, desired, 
                                         std::memory_order_relaxed,
                                         std::memory_order_relaxed);
    }
    
    size_t get_operation_count() const {
        return operation_count_.load(std::memory_order_relaxed);
    }
};

// Acquire-release ordering for synchronization
template<typename T>
class AcquireReleasePointerSync {
private:
    std::atomic<T*> data_ptr_{nullptr};
    std::atomic<bool> ready_flag_{false};
    
public:
    // Producer: use release ordering
    void publish_data(std::unique_ptr<T> data) {
        T* raw_ptr = data.release();
        data_ptr_.store(raw_ptr, std::memory_order_relaxed);
        ready_flag_.store(true, std::memory_order_release); // Synchronizes-with acquire
    }
    
    // Consumer: use acquire ordering
    std::unique_ptr<T> consume_data() {
        if (!ready_flag_.load(std::memory_order_acquire)) {
            return nullptr;
        }
        
        // All writes before the release in publish_data() are visible here
        T* ptr = data_ptr_.load(std::memory_order_relaxed);
        data_ptr_.store(nullptr, std::memory_order_relaxed);
        ready_flag_.store(false, std::memory_order_relaxed);
        
        return std::unique_ptr<T>(ptr);
    }
    
    bool is_ready() const {
        return ready_flag_.load(std::memory_order_acquire);
    }
};

// Sequential consistency for correctness-critical operations
template<typename T>
class SequentialConsistentPointers {
private:
    std::atomic<T*> ptr1_{nullptr};
    std::atomic<T*> ptr2_{nullptr};
    std::atomic<size_t> version_{0};
    
public:
    // All operations use sequential consistency by default
    void update_pointers(T* p1, T* p2) {
        version_.fetch_add(1); // seq_cst
        ptr1_.store(p1);       // seq_cst
        ptr2_.store(p2);       // seq_cst
    }
    
    std::pair<T*, T*> read_pointers() const {
        size_t v1 = version_.load();  // seq_cst
        T* p1 = ptr1_.load();         // seq_cst
        T* p2 = ptr2_.load();         // seq_cst
        size_t v2 = version_.load();  // seq_cst
        
        // Ensure consistent read
        if (v1 != v2) {
            return {nullptr, nullptr}; // Inconsistent read
        }
        
        return {p1, p2};
    }
    
    bool atomic_swap_pointers() {
        T* p1 = ptr1_.load();  // seq_cst
        T* p2 = ptr2_.load();  // seq_cst
        
        // Atomic swap using compare_exchange
        T* expected_p1 = p1;
        if (ptr1_.compare_exchange_strong(expected_p1, p2)) {
            T* expected_p2 = p2;
            if (ptr2_.compare_exchange_strong(expected_p2, p1)) {
                version_.fetch_add(1); // Mark as updated
                return true;
            } else {
                // Rollback ptr1_
                ptr1_.store(p1);
                return false;
            }
        }
        return false;
    }
};

// Memory ordering for lock-free data structures
template<typename T>
class MemoryOrderAwareLockFreeStack {
private:
    struct Node {
        T data;
        std::atomic<Node*> next;
        
        template<typename... Args>
        Node(Args&&... args) : data(std::forward<Args>(args)...), next(nullptr) {}
    };
    
    std::atomic<Node*> head_{nullptr};
    
public:
    void push(T item) {
        Node* new_node = new Node(std::move(item));
        
        // Load current head with acquire ordering to synchronize with pop operations
        Node* current_head = head_.load(std::memory_order_acquire);
        
        do {
            new_node->next.store(current_head, std::memory_order_relaxed);
            
            // Use release ordering to ensure the next pointer write is visible
            // before the head update becomes visible
        } while (!head_.compare_exchange_weak(current_head, new_node,
                                             std::memory_order_release,
                                             std::memory_order_acquire));
    }
    
    std::optional<T> pop() {
        // Load head with acquire ordering to synchronize with push operations
        Node* current_head = head_.load(std::memory_order_acquire);
        
        while (current_head != nullptr) {
            Node* next = current_head->next.load(std::memory_order_relaxed);
            
            // Use release ordering for the successful CAS to synchronize with push
            if (head_.compare_exchange_weak(current_head, next,
                                           std::memory_order_release,
                                           std::memory_order_acquire)) {
                T result = std::move(current_head->data);
                delete current_head;
                return result;
            }
        }
        
        return std::nullopt;
    }
    
    bool empty() const {
        return head_.load(std::memory_order_acquire) == nullptr;
    }
};

// Fence-based synchronization patterns
class MemoryFencePatterns {
private:
    std::atomic<void*> data_ptr_{nullptr};
    std::atomic<size_t> data_size_{0};
    std::atomic<bool> ready_{false};
    
public:
    // Writer with explicit fences
    void write_with_fences(void* data, size_t size) {
        // Write data with relaxed ordering
        data_ptr_.store(data, std::memory_order_relaxed);
        data_size_.store(size, std::memory_order_relaxed);
        
        // Release fence ensures all previous writes are visible
        // before the ready flag is set
        std::atomic_thread_fence(std::memory_order_release);
        ready_.store(true, std::memory_order_relaxed);
    }
    
    // Reader with explicit fences
    std::pair<void*, size_t> read_with_fences() {
        // Check ready flag with relaxed ordering
        if (!ready_.load(std::memory_order_relaxed)) {
            return {nullptr, 0};
        }
        
        // Acquire fence ensures subsequent reads see all writes
        // that happened before the release fence in write_with_fences
        std::atomic_thread_fence(std::memory_order_acquire);
        
        void* ptr = data_ptr_.load(std::memory_order_relaxed);
        size_t size = data_size_.load(std::memory_order_relaxed);
        
        return {ptr, size};
    }
    
    // Full memory barrier example
    void full_barrier_update(void* new_data, size_t new_size) {
        data_ptr_.store(new_data, std::memory_order_relaxed);
        
        // Full barrier ensures all memory operations are ordered
        std::atomic_thread_fence(std::memory_order_seq_cst);
        
        data_size_.store(new_size, std::memory_order_relaxed);
        ready_.store(true, std::memory_order_relaxed);
    }
};

// Cache-line aligned atomic pointers to avoid false sharing
template<typename T>
struct alignas(64) CacheLineAlignedAtomicPtr {
    std::atomic<T*> ptr{nullptr};
    
    // Padding to ensure cache line alignment
    char padding[64 - sizeof(std::atomic<T*>)];
    
    CacheLineAlignedAtomicPtr() = default;
    CacheLineAlignedAtomicPtr(T* initial) : ptr(initial) {}
    
    T* load(std::memory_order order = std::memory_order_seq_cst) const {
        return ptr.load(order);
    }
    
    void store(T* value, std::memory_order order = std::memory_order_seq_cst) {
        ptr.store(value, order);
    }
    
    T* exchange(T* value, std::memory_order order = std::memory_order_seq_cst) {
        return ptr.exchange(value, order);
    }
    
    bool compare_exchange_weak(T*& expected, T* desired,
                              std::memory_order success_order = std::memory_order_seq_cst,
                              std::memory_order failure_order = std::memory_order_seq_cst) {
        return ptr.compare_exchange_weak(expected, desired, success_order, failure_order);
    }
};

// Performance analysis for different memory orderings
class MemoryOrderingBenchmark {
public:
    template<typename Operation>
    static void benchmark_memory_ordering(const std::string& test_name, 
                                         Operation&& op, 
                                         size_t iterations = 1000000) {
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < iterations; ++i) {
            op();
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        double avg_ns = static_cast<double>(duration.count()) / iterations;
        printf("%s: %.2f ns per operation\\n", test_name.c_str(), avg_ns);
    }
    
    static void run_comprehensive_benchmark() {
        std::atomic<int*> test_ptr{nullptr};
        int dummy_value = 42;
        
        printf("Memory Ordering Performance Comparison:\\n");
        
        // Relaxed ordering benchmark
        benchmark_memory_ordering("Relaxed Store", [&]() {
            test_ptr.store(&dummy_value, std::memory_order_relaxed);
        });
        
        benchmark_memory_ordering("Relaxed Load", [&]() {
            volatile int* result = test_ptr.load(std::memory_order_relaxed);
            (void)result;
        });
        
        // Acquire-release ordering benchmark
        benchmark_memory_ordering("Release Store", [&]() {
            test_ptr.store(&dummy_value, std::memory_order_release);
        });
        
        benchmark_memory_ordering("Acquire Load", [&]() {
            volatile int* result = test_ptr.load(std::memory_order_acquire);
            (void)result;
        });
        
        // Sequential consistency benchmark
        benchmark_memory_ordering("SeqCst Store", [&]() {
            test_ptr.store(&dummy_value, std::memory_order_seq_cst);
        });
        
        benchmark_memory_ordering("SeqCst Load", [&]() {
            volatile int* result = test_ptr.load(std::memory_order_seq_cst);
            (void)result;
        });
        
        // Compare-and-swap benchmarks
        benchmark_memory_ordering("CAS Relaxed", [&]() {
            int* expected = &dummy_value;
            test_ptr.compare_exchange_weak(expected, &dummy_value,
                                          std::memory_order_relaxed,
                                          std::memory_order_relaxed);
        });
        
        benchmark_memory_ordering("CAS AcqRel", [&]() {
            int* expected = &dummy_value;
            test_ptr.compare_exchange_weak(expected, &dummy_value,
                                          std::memory_order_acq_rel,
                                          std::memory_order_acquire);
        });
    }
};

} // namespace memory_ordering`
    },
    
    'concurrent-data-structures': {
      title: state.language === 'en' ? 'Concurrent Data Structures' : 'Estructuras de Datos Concurrentes',
      code: `#include <atomic>
#include <memory>
#include <vector>
#include <mutex>
#include <shared_mutex>
#include <thread>
#include <functional>

// High-performance concurrent data structures with smart pointer integration
namespace concurrent_structures {

// Lock-free concurrent hash table with smart pointer values
template<typename Key, typename Value, size_t NumBuckets = 1024>
class ConcurrentHashTable {
private:
    struct Node {
        Key key;
        std::atomic<std::shared_ptr<Value>> value;
        std::atomic<Node*> next;
        
        Node(Key k, std::shared_ptr<Value> v) 
            : key(std::move(k)), value(std::move(v)), next(nullptr) {}
    };
    
    std::array<std::atomic<Node*>, NumBuckets> buckets_;
    std::atomic<size_t> size_{0};
    
    size_t hash(const Key& key) const {
        return std::hash<Key>{}(key) % NumBuckets;
    }
    
public:
    ConcurrentHashTable() {
        for (auto& bucket : buckets_) {
            bucket.store(nullptr);
        }
    }
    
    ~ConcurrentHashTable() {
        for (auto& bucket : buckets_) {
            Node* current = bucket.load();
            while (current) {
                Node* next = current->next.load();
                delete current;
                current = next;
            }
        }
    }
    
    bool insert(const Key& key, std::shared_ptr<Value> value) {
        size_t bucket_index = hash(key);
        Node* new_node = new Node(key, value);
        
        Node* current = buckets_[bucket_index].load(std::memory_order_acquire);
        
        do {
            // Check if key already exists
            Node* search = current;
            while (search) {
                if (search->key == key) {
                    // Update existing value
                    search->value.store(value, std::memory_order_release);
                    delete new_node;
                    return true;
                }
                search = search->next.load(std::memory_order_acquire);
            }
            
            new_node->next.store(current, std::memory_order_relaxed);
            
        } while (!buckets_[bucket_index].compare_exchange_weak(
            current, new_node, std::memory_order_release, std::memory_order_acquire));
        
        size_.fetch_add(1, std::memory_order_relaxed);
        return true;
    }
    
    std::shared_ptr<Value> find(const Key& key) const {
        size_t bucket_index = hash(key);
        Node* current = buckets_[bucket_index].load(std::memory_order_acquire);
        
        while (current) {
            if (current->key == key) {
                return current->value.load(std::memory_order_acquire);
            }
            current = current->next.load(std::memory_order_acquire);
        }
        
        return nullptr;
    }
    
    bool erase(const Key& key) {
        size_t bucket_index = hash(key);
        std::atomic<Node*>* prev_next = &buckets_[bucket_index];
        Node* current = prev_next->load(std::memory_order_acquire);
        
        while (current) {
            if (current->key == key) {
                Node* next = current->next.load(std::memory_order_acquire);
                
                if (prev_next->compare_exchange_strong(current, next,
                                                      std::memory_order_release,
                                                      std::memory_order_acquire)) {
                    delete current;
                    size_.fetch_sub(1, std::memory_order_relaxed);
                    return true;
                }
                // Retry if CAS failed
                current = prev_next->load(std::memory_order_acquire);
            } else {
                prev_next = &current->next;
                current = current->next.load(std::memory_order_acquire);
            }
        }
        
        return false;
    }
    
    size_t size() const {
        return size_.load(std::memory_order_acquire);
    }
    
    bool empty() const {
        return size() == 0;
    }
    
    // Thread-safe iteration support
    void for_each(std::function<void(const Key&, std::shared_ptr<Value>)> func) const {
        for (const auto& bucket : buckets_) {
            Node* current = bucket.load(std::memory_order_acquire);
            while (current) {
                auto value = current->value.load(std::memory_order_acquire);
                if (value) {
                    func(current->key, value);
                }
                current = current->next.load(std::memory_order_acquire);
            }
        }
    }
};

// RWLock-based concurrent map with better read performance for frequent reads
template<typename Key, typename Value>
class RWLockConcurrentMap {
private:
    std::map<Key, std::shared_ptr<Value>> map_;
    mutable std::shared_mutex rwlock_;
    
public:
    bool insert(const Key& key, std::shared_ptr<Value> value) {
        std::unique_lock<std::shared_mutex> lock(rwlock_);
        auto result = map_.emplace(key, std::move(value));
        return result.second;
    }
    
    bool update(const Key& key, std::shared_ptr<Value> value) {
        std::unique_lock<std::shared_mutex> lock(rwlock_);
        auto it = map_.find(key);
        if (it != map_.end()) {
            it->second = std::move(value);
            return true;
        }
        return false;
    }
    
    std::shared_ptr<Value> find(const Key& key) const {
        std::shared_lock<std::shared_mutex> lock(rwlock_);
        auto it = map_.find(key);
        return (it != map_.end()) ? it->second : nullptr;
    }
    
    bool erase(const Key& key) {
        std::unique_lock<std::shared_mutex> lock(rwlock_);
        return map_.erase(key) > 0;
    }
    
    size_t size() const {
        std::shared_lock<std::shared_mutex> lock(rwlock_);
        return map_.size();
    }
    
    bool empty() const {
        std::shared_lock<std::shared_mutex> lock(rwlock_);
        return map_.empty();
    }
    
    // Bulk operations
    template<typename Container>
    void bulk_insert(const Container& items) {
        std::unique_lock<std::shared_mutex> lock(rwlock_);
        for (const auto& [key, value] : items) {
            map_[key] = value;
        }
    }
    
    std::vector<std::pair<Key, std::shared_ptr<Value>>> snapshot() const {
        std::shared_lock<std::shared_mutex> lock(rwlock_);
        std::vector<std::pair<Key, std::shared_ptr<Value>>> result;
        result.reserve(map_.size());
        
        for (const auto& [key, value] : map_) {
            result.emplace_back(key, value);
        }
        
        return result;
    }
    
    // Conditional operations
    template<typename Predicate>
    size_t erase_if(Predicate pred) {
        std::unique_lock<std::shared_mutex> lock(rwlock_);
        size_t removed = 0;
        
        auto it = map_.begin();
        while (it != map_.end()) {
            if (pred(it->first, it->second)) {
                it = map_.erase(it);
                ++removed;
            } else {
                ++it;
            }
        }
        
        return removed;
    }
};

// Lock-free queue for smart pointer elements
template<typename T>
class ConcurrentQueue {
private:
    struct Node {
        std::atomic<std::shared_ptr<T>> data;
        std::atomic<Node*> next;
        
        Node() : data(nullptr), next(nullptr) {}
    };
    
    std::atomic<Node*> head_;
    std::atomic<Node*> tail_;
    
public:
    ConcurrentQueue() {
        Node* dummy = new Node;
        head_ = dummy;
        tail_ = dummy;
    }
    
    ~ConcurrentQueue() {
        Node* current = head_.load();
        while (current) {
            Node* next = current->next.load();
            delete current;
            current = next;
        }
    }
    
    void enqueue(std::shared_ptr<T> item) {
        Node* new_node = new Node;
        new_node->data.store(item, std::memory_order_relaxed);
        
        Node* prev_tail = tail_.exchange(new_node, std::memory_order_acq_rel);
        prev_tail->next.store(new_node, std::memory_order_release);
    }
    
    std::shared_ptr<T> dequeue() {
        Node* head = head_.load(std::memory_order_acquire);
        Node* next = head->next.load(std::memory_order_acquire);
        
        if (!next) {
            return nullptr; // Queue is empty
        }
        
        auto data = next->data.exchange(nullptr, std::memory_order_relaxed);
        head_.store(next, std::memory_order_release);
        
        delete head; // Safe to delete the old head
        return data;
    }
    
    bool empty() const {
        Node* head = head_.load(std::memory_order_acquire);
        Node* next = head->next.load(std::memory_order_acquire);
        return next == nullptr;
    }
    
    // Bulk dequeue for better performance
    std::vector<std::shared_ptr<T>> dequeue_bulk(size_t max_items) {
        std::vector<std::shared_ptr<T>> result;
        result.reserve(max_items);
        
        for (size_t i = 0; i < max_items; ++i) {
            auto item = dequeue();
            if (!item) break;
            result.push_back(std::move(item));
        }
        
        return result;
    }
};

// Thread-safe object pool using smart pointers
template<typename T>
class ConcurrentObjectPool {
private:
    ConcurrentQueue<T> available_objects_;
    std::atomic<size_t> total_objects_{0};
    std::atomic<size_t> max_objects_;
    std::function<std::unique_ptr<T>()> factory_;
    
public:
    explicit ConcurrentObjectPool(std::function<std::unique_ptr<T>()> factory, 
                                 size_t max_objects = 1000)
        : factory_(std::move(factory)), max_objects_(max_objects) {}
    
    class PooledObject {
    private:
        std::shared_ptr<T> object_;
        ConcurrentObjectPool* pool_;
        
    public:
        PooledObject(std::shared_ptr<T> obj, ConcurrentObjectPool* pool)
            : object_(std::move(obj)), pool_(pool) {}
        
        ~PooledObject() {
            if (object_ && pool_) {
                pool_->return_object(std::move(object_));
            }
        }
        
        T& operator*() { return *object_; }
        T* operator->() { return object_.get(); }
        const T& operator*() const { return *object_; }
        const T* operator->() const { return object_.get(); }
        
        bool valid() const { return object_ != nullptr; }
        
        // Non-copyable but movable
        PooledObject(const PooledObject&) = delete;
        PooledObject& operator=(const PooledObject&) = delete;
        
        PooledObject(PooledObject&& other) noexcept
            : object_(std::move(other.object_)), pool_(other.pool_) {
            other.pool_ = nullptr;
        }
        
        PooledObject& operator=(PooledObject&& other) noexcept {
            if (this != &other) {
                if (object_ && pool_) {
                    pool_->return_object(std::move(object_));
                }
                object_ = std::move(other.object_);
                pool_ = other.pool_;
                other.pool_ = nullptr;
            }
            return *this;
        }
    };
    
    PooledObject acquire() {
        auto object = available_objects_.dequeue();
        
        if (!object) {
            // Create new object if pool is not at capacity
            if (total_objects_.load() < max_objects_.load()) {
                auto new_obj = factory_();
                if (new_obj) {
                    object = std::shared_ptr<T>(new_obj.release());
                    total_objects_.fetch_add(1);
                }
            }
        }
        
        if (!object) {
            throw std::runtime_error("Object pool exhausted");
        }
        
        return PooledObject(object, this);
    }
    
    void return_object(std::shared_ptr<T> object) {
        if (object) {
            available_objects_.enqueue(std::move(object));
        }
    }
    
    size_t size() const {
        return total_objects_.load();
    }
    
    size_t max_size() const {
        return max_objects_.load();
    }
    
    void set_max_size(size_t new_max) {
        max_objects_.store(new_max);
    }
    
    // Preallocation for better performance
    void preallocate(size_t count) {
        for (size_t i = 0; i < count && total_objects_.load() < max_objects_.load(); ++i) {
            try {
                auto obj = factory_();
                if (obj) {
                    available_objects_.enqueue(std::shared_ptr<T>(obj.release()));
                    total_objects_.fetch_add(1);
                }
            } catch (...) {
                break; // Stop on allocation failure
            }
        }
    }
};

// Performance monitoring for concurrent data structures
class ConcurrentPerformanceMonitor {
private:
    std::atomic<size_t> read_operations_{0};
    std::atomic<size_t> write_operations_{0};
    std::atomic<size_t> contention_count_{0};
    std::atomic<std::chrono::nanoseconds> total_wait_time_{std::chrono::nanoseconds{0}};
    
public:
    void record_read() {
        read_operations_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void record_write() {
        write_operations_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void record_contention(std::chrono::nanoseconds wait_time) {
        contention_count_.fetch_add(1, std::memory_order_relaxed);
        
        auto current_total = total_wait_time_.load(std::memory_order_relaxed);
        while (!total_wait_time_.compare_exchange_weak(
            current_total, current_total + wait_time, std::memory_order_relaxed)) {
            // Retry until successful
        }
    }
    
    struct PerformanceStats {
        size_t total_reads;
        size_t total_writes;
        size_t contention_events;
        double avg_wait_time_ns;
        double read_write_ratio;
    };
    
    PerformanceStats get_stats() const {
        auto reads = read_operations_.load();
        auto writes = write_operations_.load();
        auto contentions = contention_count_.load();
        auto total_wait = total_wait_time_.load();
        
        PerformanceStats stats{};
        stats.total_reads = reads;
        stats.total_writes = writes;
        stats.contention_events = contentions;
        stats.avg_wait_time_ns = contentions > 0 ? 
            static_cast<double>(total_wait.count()) / contentions : 0.0;
        stats.read_write_ratio = writes > 0 ? 
            static_cast<double>(reads) / writes : 
            (reads > 0 ? std::numeric_limits<double>::infinity() : 0.0);
        
        return stats;
    }
    
    void reset() {
        read_operations_.store(0);
        write_operations_.store(0);
        contention_count_.store(0);
        total_wait_time_.store(std::chrono::nanoseconds{0});
    }
};

} // namespace concurrent_structures`
    }
  };

  const currentExample = examples[activeExample as keyof typeof examples];

  const handlePatternSelect = (pattern: string) => {
    setSelectedPattern(pattern);
    
    // Update metrics based on selected pattern
    const patternMetrics: { [key: string]: ConcurrencyMetrics } = {
      'Lock-Free': { throughput: 0.95, scalability: 0.90, contention: 0.10, memoryOrder: 0.85 },
      'Wait-Free': { throughput: 0.98, scalability: 0.95, contention: 0.05, memoryOrder: 0.90 },
      'RCU': { throughput: 0.92, scalability: 0.88, contention: 0.15, memoryOrder: 0.80 },
      'Hazard Ptrs': { throughput: 0.88, scalability: 0.85, contention: 0.20, memoryOrder: 0.85 },
      'Atomic Shared': { throughput: 0.85, scalability: 0.80, contention: 0.25, memoryOrder: 0.90 }
    };
    
    if (patternMetrics[pattern]) {
      setMetrics(patternMetrics[pattern]);
    }
  };

  return (
    <div className="lesson-container">
      <header className="lesson-header">
        <h1>{state.language === 'en' ? 'Lesson 114: Concurrency Patterns Advanced' : 'Lección 114: Patrones de Concurrencia Avanzados'}</h1>
        <p className="lesson-description">
          {state.language === 'en' 
            ? 'Master advanced synchronization with pointers, wait-free algorithms, memory ordering patterns, and high-performance concurrent data structures.'
            : 'Domina sincronización avanzada con punteros, algoritmos wait-free, patrones de orden de memoria y estructuras de datos concurrentes de alto rendimiento.'}
        </p>
      </header>

      <div className="lesson-content">
        <div className="visualization-section">
          <SectionTitle>{state.language === 'en' ? 'Concurrency Patterns Visualization' : 'Visualización de Patrones de Concurrencia'}</SectionTitle>
<div className="canvas-container" style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '20px' }}>
            <Canvas camera={{ position: [6, 4, 6] }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />
              <ConcurrencyVisualization 
                metrics={metrics}
                activePattern={selectedPattern}
                onPatternSelect={handlePatternSelect}
              />
            </Canvas>
          </div>
          
          <div className="pattern-info">
            <SectionTitle>{state.language === 'en' ? 'Concurrency Metrics' : 'Métricas de Concurrencia'}</SectionTitle>
<div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Throughput' : 'Rendimiento'}:</span>
                <span className="metric-value">{(metrics.throughput * 100).toFixed(1)}%</span>
          </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Scalability' : 'Escalabilidad'}:</span>
                <span className="metric-value">{(metrics.scalability * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Contention' : 'Contención'}:</span>
                <span className="metric-value">{(metrics.contention * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Memory Order' : 'Orden de Memoria'}:</span>
                <span className="metric-value">{(metrics.memoryOrder * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="selected-pattern">
              <strong>{state.language === 'en' ? 'Selected Pattern:' : 'Patrón Seleccionado:'}</strong> {selectedPattern}
            </div>
          </div>
        </div>

        <div className="examples-section">
          <SectionTitle>{state.language === 'en' ? 'Advanced Concurrency Examples' : 'Ejemplos de Concurrencia Avanzada'}</SectionTitle>
<div className="example-tabs">
            {Object.keys(examples).map(key => (
              <button
                key={key}
                className={`tab-button ${activeExample === key ? 'active' : ''}`}
                onClick={() => setActiveExample(key)}
              >
                {examples[key as keyof typeof examples].title}
              </button>
            ))}
          </div>

          <div className="example-content">
            <div className="code-block">
              <SectionTitle>{currentExample.title}</SectionTitle>
<pre>
                <code>{currentExample.code}</code>
              </pre>
          </div>
          </div>
        </div>

        <div className="key-concepts-section">
          <SectionTitle>{state.language === 'en' ? 'Key Concepts' : 'Conceptos Clave'}</SectionTitle>
<div className="concepts-grid">
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Advanced Synchronization' : 'Sincronización Avanzada'}</SectionTitle>
              <ul>
                <li>{state.language === 'en' ? 'Hazard pointer implementation' : 'Implementación de hazard pointers'}</li>
                <li>{state.language === 'en' ? 'Lock-free shared_ptr operations' : 'Operaciones lock-free con shared_ptr'}</li>
                <li>{state.language === 'en' ? 'RCU (Read-Copy-Update) patterns' : 'Patrones RCU (Read-Copy-Update)'}</li>
                <li>{state.language === 'en' ? 'Safe memory reclamation' : 'Recuperación segura de memoria'}</li>
              </ul>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Wait-Free Algorithms' : 'Algoritmos Wait-Free'}</SectionTitle>
<ul>
                <li>{state.language === 'en' ? 'Wait-free stack with hazard pointers' : 'Stack wait-free con hazard pointers'}</li>
                <li>{state.language === 'en' ? 'Wait-free hash map implementation' : 'Implementación de hash map wait-free'}</li>
                <li>{state.language === 'en' ? 'Wait-free reference counting' : 'Conteo de referencias wait-free'}</li>
                <li>{state.language === 'en' ? 'Performance benchmarking' : 'Benchmarking de rendimiento'}</li>
              </ul>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Memory Ordering' : 'Orden de Memoria'}</SectionTitle>
<ul>
                <li>{state.language === 'en' ? 'Relaxed ordering for performance' : 'Orden relajado para rendimiento'}</li>
                <li>{state.language === 'en' ? 'Acquire-release synchronization' : 'Sincronización acquire-release'}</li>
                <li>{state.language === 'en' ? 'Sequential consistency guarantees' : 'Garantías de consistencia secuencial'}</li>
                <li>{state.language === 'en' ? 'Memory fence patterns' : 'Patrones de fence de memoria'}</li>
              </ul>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Concurrent Data Structures' : 'Estructuras de Datos Concurrentes'}</SectionTitle>
<ul>
                <li>{state.language === 'en' ? 'Lock-free concurrent hash table' : 'Tabla hash concurrente lock-free'}</li>
                <li>{state.language === 'en' ? 'RWLock-based concurrent map' : 'Mapa concurrente basado en RWLock'}</li>
                <li>{state.language === 'en' ? 'Lock-free queue implementation' : 'Implementación de cola lock-free'}</li>
                <li>{state.language === 'en' ? 'Thread-safe object pool' : 'Pool de objetos thread-safe'}</li>
              </ul>
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .lesson-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .lesson-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .lesson-header h1 {
          color: #2c3e50;
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .lesson-description {
          font-size: 1.1em;
          color: #7f8c8d;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .visualization-section {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .visualization-section h3 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .pattern-info {
          margin-top: 20px;
        }

        .pattern-info h4 {
          margin-bottom: 15px;
          color: #34495e;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
          border-left: 4px solid #2ecc71;
        }

        .metric-label {
          font-weight: 500;
          color: #2c3e50;
        }

        .metric-value {
          font-weight: bold;
          color: #27ae60;
          font-size: 1.1em;
        }

        .selected-pattern {
          margin-top: 15px;
          padding: 10px;
          background: #e8f8f5;
          border-radius: 5px;
          color: #2c3e50;
        }

        .examples-section {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .examples-section h3 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .example-tabs {
          display: flex;
          gap: 5px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tab-button {
          padding: 10px 15px;
          border: none;
          background: #ecf0f1;
          color: #2c3e50;
          border-radius: 5px 5px 0 0;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab-button:hover {
          background: #d5dbdb;
        }

        .tab-button.active {
          background: #2ecc71;
          color: white;
        }

        .example-content {
          border: 1px solid #bdc3c7;
          border-radius: 0 5px 5px 5px;
          overflow: hidden;
        }

        .code-block {
          background: #2c3e50;
        }

        .code-block h4 {
          background: #34495e;
          color: white;
          padding: 15px;
          margin: 0;
          border-bottom: 1px solid #4a6741;
        }

        .code-block pre {
          margin: 0;
          padding: 20px;
          background: #2c3e50;
          color: #ecf0f1;
          overflow-x: auto;
          font-size: 14px;
          line-height: 1.5;
        }

        .key-concepts-section {
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .key-concepts-section h3 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .concepts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .concept-card {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #2ecc71;
        }

        .concept-card h4 {
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .concept-card ul {
          list-style: none;
          padding: 0;
        }

        .concept-card li {
          padding: 5px 0;
          position: relative;
          padding-left: 20px;
        }

        .concept-card li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #27ae60;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Lesson114_ConcurrencyPatternsAdvanced;