import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
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



function AtomicPointerVisualization() {
  const [atomicOps, setAtomicOps] = useState(0);
  const [casOperations, setCasOperations] = useState(0);
  const [activeOperation, setActiveOperation] = useState('store');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAtomicOps(prev => prev + 1);
      if (Math.random() > 0.7) {
        setCasOperations(prev => prev + 1);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  const operations = [
    { name: 'store', pos: [-3, 2, 0] as const, color: '#00ff88' },
    { name: 'load', pos: [-1, 2, 0] as const, color: '#00d4ff' },
    { name: 'exchange', pos: [1, 2, 0] as const, color: '#ff6b6b' },
    { name: 'compare_exchange', pos: [3, 2, 0] as const, color: '#ffa500' }
  ] as const;

  return (
    <group>
      {operations.map((op) => (
        <group key={op.name}>
          <Box
            position={op.pos as [number, number, number]}
            args={[1.5, 0.6, 0.3]}
            onClick={() => setActiveOperation(op.name)}
          >
            <meshStandardMaterial
              color={op.color}
              opacity={activeOperation === op.name ? 1.0 : 0.6}
              transparent
            />
          </Box>
          <Text
            position={[op.pos[0], op.pos[1] + 0.8, op.pos[2]]}  // TypeScript now knows pos is a fixed tuple
            fontSize={0.3}
            color="white"
            anchorX="center"
          >
            {op.name}
          </Text>
        </group>
      ))}
      
      <Sphere position={[0, 0, 0]} args={[0.5]}>
        <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
      </Sphere>
      
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.4}
        color="#00ff88"
        anchorX="center"
      >
        {`Atomic Ops: ${atomicOps}`}
      </Text>
      
      <Text
        position={[0, -2, 0]}
        fontSize={0.4}
        color="#ff6b6b"
        anchorX="center"
      >
        {`CAS Ops: ${casOperations}`}
      </Text>
    </group>
  );
}

export default function Lesson98_AtomicSmartPointers() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'std::atomic_shared_ptr Basics' : 'Conceptos Básicos de std::atomic_shared_ptr',
      code: `#include <memory>
#include <atomic>
#include <thread>
#include <vector>
#include <iostream>

// C++20 atomic_shared_ptr
class SharedResource {
public:
    SharedResource(int value) : value_(value) {
        std::cout << "SharedResource created: " << value_ << std::endl;
    }
    
    ~SharedResource() {
        std::cout << "SharedResource destroyed: " << value_ << std::endl;
    }
    
    void process() {
        std::cout << "Processing: " << value_ << std::endl;
    }
    
private:
    int value_;
};

class AtomicSharedExample {
private:
    std::atomic<std::shared_ptr<SharedResource>> atomic_resource_;

public:
    AtomicSharedExample() {
        atomic_resource_.store(std::make_shared<SharedResource>(0));
    }
    
    void update_resource(int new_value) {
        auto new_resource = std::make_shared<SharedResource>(new_value);
        atomic_resource_.store(new_resource);
    }
    
    void process_resource() {
        auto resource = atomic_resource_.load();
        if (resource) {
            resource->process();
        }
    }
    
    // Compare-and-swap update
    bool try_update(int expected_value, int new_value) {
        auto current = atomic_resource_.load();
        if (current && current->get_value() == expected_value) {
            auto new_resource = std::make_shared<SharedResource>(new_value);
            return atomic_resource_.compare_exchange_strong(current, new_resource);
        }
        return false;
    }
    
    // Exchange operation
    std::shared_ptr<SharedResource> exchange_resource(int new_value) {
        auto new_resource = std::make_shared<SharedResource>(new_value);
        return atomic_resource_.exchange(new_resource);
    }
};

// Uso multithreading
void worker_thread(AtomicSharedExample& manager, int thread_id) {
    for (int i = 0; i < 10; ++i) {
        // Reader threads
        manager.process_resource();
        
        // Writer threads (ocasional)
        if (thread_id == 0 && i % 3 == 0) {
            manager.update_resource(i * 10);
        }
        
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

int main() {
    AtomicSharedExample manager;
    
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.emplace_back(worker_thread, std::ref(manager), i);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    return 0;
}`
    },
    {
      title: state.language === 'en' ? 'Custom Atomic Smart Pointer' : 'Puntero Inteligente Atómico Personalizado',
      code: `#include <atomic>
#include <memory>

template<typename T>
class AtomicUniquePtr {
private:
    std::atomic<T*> ptr_;
    
public:
    AtomicUniquePtr() : ptr_(nullptr) {}
    
    explicit AtomicUniquePtr(std::unique_ptr<T> ptr) 
        : ptr_(ptr.release()) {}
    
    ~AtomicUniquePtr() {
        delete ptr_.load();
    }
    
    // No copiable, solo movible
    AtomicUniquePtr(const AtomicUniquePtr&) = delete;
    AtomicUniquePtr& operator=(const AtomicUniquePtr&) = delete;
    
    AtomicUniquePtr(AtomicUniquePtr&& other) noexcept 
        : ptr_(other.ptr_.exchange(nullptr)) {}
    
    AtomicUniquePtr& operator=(AtomicUniquePtr&& other) noexcept {
        if (this != &other) {
            delete ptr_.exchange(other.ptr_.exchange(nullptr));
        }
        return *this;
    }
    
    // Store operation
    void store(std::unique_ptr<T> new_ptr, 
               std::memory_order order = std::memory_order_seq_cst) {
        T* old_ptr = ptr_.exchange(new_ptr.release(), order);
        delete old_ptr;
    }
    
    // Load operation
    std::unique_ptr<T> load(std::memory_order order = std::memory_order_seq_cst) const {
        T* current = ptr_.load(order);
        if (current) {
            // Necesitamos clonar para mantener semántica única
            return std::make_unique<T>(*current);
        }
        return nullptr;
    }
    
    // Exchange operation
    std::unique_ptr<T> exchange(std::unique_ptr<T> new_ptr,
                                std::memory_order order = std::memory_order_seq_cst) {
        T* old_ptr = ptr_.exchange(new_ptr.release(), order);
        return std::unique_ptr<T>(old_ptr);
    }
    
    // Compare-and-swap
    bool compare_exchange_strong(T*& expected, std::unique_ptr<T> desired,
                                std::memory_order order = std::memory_order_seq_cst) {
        return ptr_.compare_exchange_strong(expected, desired.release(), order);
    }
    
    // Reset
    void reset(std::unique_ptr<T> new_ptr = nullptr) {
        store(std::move(new_ptr));
    }
    
    // Access (read-only)
    T* get() const {
        return ptr_.load();
    }
    
    // Operador bool
    explicit operator bool() const {
        return ptr_.load() != nullptr;
    }
};

// Versión con hazard pointers para mayor seguridad
template<typename T>
class SafeAtomicSharedPtr {
private:
    std::atomic<T*> ptr_;
    std::atomic<size_t> ref_count_;
    
    struct ControlBlock {
        std::atomic<size_t> strong_refs{1};
        std::atomic<size_t> weak_refs{1};
        T* ptr;
        
        ControlBlock(T* p) : ptr(p) {}
    };
    
    std::atomic<ControlBlock*> control_;

public:
    class SharedPtr {
    private:
        ControlBlock* control_;
        T* ptr_;
        
    public:
        SharedPtr(ControlBlock* ctrl = nullptr) : control_(ctrl), ptr_(nullptr) {
            if (control_) {
                control_->strong_refs.fetch_add(1, std::memory_order_relaxed);
                ptr_ = control_->ptr;
            }
        }
        
        SharedPtr(const SharedPtr& other) : control_(other.control_), ptr_(other.ptr_) {
            if (control_) {
                control_->strong_refs.fetch_add(1, std::memory_order_relaxed);
            }
        }
        
        SharedPtr& operator=(const SharedPtr& other) {
            if (this != &other) {
                reset();
                control_ = other.control_;
                ptr_ = other.ptr_;
                if (control_) {
                    control_->strong_refs.fetch_add(1, std::memory_order_relaxed);
                }
            }
            return *this;
        }
        
        ~SharedPtr() {
            reset();
        }
        
        void reset() {
            if (control_) {
                if (control_->strong_refs.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                    delete ptr_;
                    if (control_->weak_refs.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                        delete control_;
                    }
                }
                control_ = nullptr;
                ptr_ = nullptr;
            }
        }
        
        T* get() const { return ptr_; }
        T& operator*() const { return *ptr_; }
        T* operator->() const { return ptr_; }
        explicit operator bool() const { return ptr_ != nullptr; }
        
        size_t use_count() const {
            return control_ ? control_->strong_refs.load() : 0;
        }
    };
    
    SafeAtomicSharedPtr() : control_(nullptr) {}
    
    SafeAtomicSharedPtr(T* ptr) {
        if (ptr) {
            control_.store(new ControlBlock(ptr));
        }
    }
    
    ~SafeAtomicSharedPtr() {
        auto* ctrl = control_.load();
        if (ctrl) {
            if (ctrl->weak_refs.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                delete ctrl;
            }
        }
    }
    
    void store(SharedPtr new_ptr) {
        auto* old_control = control_.exchange(new_ptr.control_);
        // Cleanup anterior...
    }
    
    SharedPtr load() const {
        return SharedPtr(control_.load());
    }
    
    bool compare_exchange_strong(SharedPtr& expected, SharedPtr desired) {
        auto* exp_ctrl = expected.control_;
        return control_.compare_exchange_strong(exp_ctrl, desired.control_);
    }
};`
    },
    {
      title: state.language === 'en' ? 'Lock-Free Data Structures' : 'Estructuras de Datos Lock-Free',
      code: `#include <atomic>
#include <memory>

// Stack lock-free con atomic_shared_ptr
template<typename T>
class LockFreeStack {
private:
    struct Node {
        T data;
        std::atomic<std::shared_ptr<Node>> next;
        
        Node(const T& item) : data(item), next(nullptr) {}
    };
    
    std::atomic<std::shared_ptr<Node>> head_;

public:
    LockFreeStack() : head_(nullptr) {}
    
    void push(const T& item) {
        auto new_node = std::make_shared<Node>(item);
        auto current_head = head_.load();
        
        do {
            new_node->next.store(current_head);
        } while (!head_.compare_exchange_weak(current_head, new_node));
    }
    
    bool pop(T& result) {
        auto current_head = head_.load();
        
        do {
            if (!current_head) {
                return false;  // Stack vacío
            }
            
            result = current_head->data;
            
        } while (!head_.compare_exchange_weak(current_head, 
                                             current_head->next.load()));
        
        return true;
    }
    
    bool empty() const {
        return head_.load() == nullptr;
    }
    
    size_t size() const {
        size_t count = 0;
        auto current = head_.load();
        while (current) {
            ++count;
            current = current->next.load();
        }
        return count;
    }
};

// Queue lock-free más complejo
template<typename T>
class LockFreeQueue {
private:
    struct Node {
        std::atomic<T*> data;
        std::atomic<std::shared_ptr<Node>> next;
        
        Node() : data(nullptr), next(nullptr) {}
    };
    
    std::atomic<std::shared_ptr<Node>> head_;
    std::atomic<std::shared_ptr<Node>> tail_;

public:
    LockFreeQueue() {
        auto dummy = std::make_shared<Node>();
        head_.store(dummy);
        tail_.store(dummy);
    }
    
    void enqueue(const T& item) {
        auto new_node = std::make_shared<Node>();
        auto data = new T(item);
        new_node->data.store(data);
        
        while (true) {
            auto tail = tail_.load();
            auto next = tail->next.load();
            
            if (tail == tail_.load()) {  // Tail no cambió
                if (!next) {
                    // Tail realmente apunta al último nodo
                    if (tail->next.compare_exchange_weak(next, new_node)) {
                        tail_.compare_exchange_weak(tail, new_node);
                        break;
                    }
                } else {
                    // Tail no apunta al último, ayudar a avanzar
                    tail_.compare_exchange_weak(tail, next);
                }
            }
        }
    }
    
    bool dequeue(T& result) {
        while (true) {
            auto head = head_.load();
            auto tail = tail_.load();
            auto next = head->next.load();
            
            if (head == head_.load()) {  // Head no cambió
                if (head == tail) {
                    if (!next) {
                        return false;  // Queue vacía
                    }
                    // Tail atrasado, ayudar a avanzar
                    tail_.compare_exchange_weak(tail, next);
                } else {
                    // Leer datos antes de CAS
                    if (!next) continue;
                    
                    auto* data = next->data.load();
                    if (!data) continue;
                    
                    if (head_.compare_exchange_weak(head, next)) {
                        result = *data;
                        delete data;
                        return true;
                    }
                }
            }
        }
    }
    
    bool empty() const {
        auto head = head_.load();
        auto tail = tail_.load();
        return (head == tail) && !head->next.load();
    }
};

// Hash table lock-free con atomic_shared_ptr
template<typename Key, typename Value>
class LockFreeHashMap {
private:
    static constexpr size_t INITIAL_SIZE = 16;
    
    struct Entry {
        Key key;
        Value value;
        std::atomic<std::shared_ptr<Entry>> next;
        
        Entry(const Key& k, const Value& v) : key(k), value(v), next(nullptr) {}
    };
    
    using Bucket = std::atomic<std::shared_ptr<Entry>>;
    std::unique_ptr<Bucket[]> buckets_;
    std::atomic<size_t> size_;
    std::atomic<size_t> count_;

    size_t hash(const Key& key) const {
        return std::hash<Key>{}(key) % size_.load();
    }

public:
    LockFreeHashMap(size_t initial_size = INITIAL_SIZE) 
        : buckets_(std::make_unique<Bucket[]>(initial_size)),
          size_(initial_size), count_(0) {}
    
    void insert(const Key& key, const Value& value) {
        auto new_entry = std::make_shared<Entry>(key, value);
        size_t bucket_idx = hash(key);
        
        while (true) {
            auto current = buckets_[bucket_idx].load();
            
            // Buscar si la clave ya existe
            auto search = current;
            while (search) {
                if (search->key == key) {
                    // Actualizar valor existente
                    search->value = value;
                    return;
                }
                search = search->next.load();
            }
            
            // Insertar nueva entrada
            new_entry->next.store(current);
            if (buckets_[bucket_idx].compare_exchange_weak(current, new_entry)) {
                count_.fetch_add(1);
                break;
            }
        }
    }
    
    bool find(const Key& key, Value& value) const {
        size_t bucket_idx = hash(key);
        auto current = buckets_[bucket_idx].load();
        
        while (current) {
            if (current->key == key) {
                value = current->value;
                return true;
            }
            current = current->next.load();
        }
        
        return false;
    }
    
    bool erase(const Key& key) {
        size_t bucket_idx = hash(key);
        
        while (true) {
            auto current = buckets_[bucket_idx].load();
            std::shared_ptr<Entry> prev = nullptr;
            
            while (current) {
                if (current->key == key) {
                    auto next = current->next.load();
                    
                    if (prev) {
                        if (prev->next.compare_exchange_weak(current, next)) {
                            count_.fetch_sub(1);
                            return true;
                        } else {
                            break;  // Reintentar desde el principio
                        }
                    } else {
                        if (buckets_[bucket_idx].compare_exchange_weak(current, next)) {
                            count_.fetch_sub(1);
                            return true;
                        } else {
                            break;  // Reintentar desde el principio
                        }
                    }
                }
                prev = current;
                current = current->next.load();
            }
            
            if (!current) return false;  // No encontrado
        }
    }
    
    size_t size() const { return count_.load(); }
    bool empty() const { return count_.load() == 0; }
};`
    },
    {
      title: state.language === 'en' ? 'Memory Ordering Optimization' : 'Optimización de Ordenamiento de Memoria',
      code: `#include <atomic>
#include <memory>
#include <chrono>
#include <thread>

// Comparación de diferentes memory orderings
template<typename T>
class MemoryOrderingBenchmark {
private:
    std::atomic<std::shared_ptr<T>> atomic_ptr_;
    std::shared_ptr<T> test_data_;

public:
    MemoryOrderingBenchmark() {
        test_data_ = std::make_shared<T>();
        atomic_ptr_.store(test_data_);
    }
    
    // Sequential consistency (más lento pero más seguro)
    void test_seq_cst(size_t iterations) {
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < iterations; ++i) {
            auto ptr = atomic_ptr_.load(std::memory_order_seq_cst);
            atomic_ptr_.store(ptr, std::memory_order_seq_cst);
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        printf("Sequential Consistency: %ld µs\\n", duration.count());
    }
    
    // Acquire-Release (balance performance/seguridad)
    void test_acquire_release(size_t iterations) {
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < iterations; ++i) {
            auto ptr = atomic_ptr_.load(std::memory_order_acquire);
            atomic_ptr_.store(ptr, std::memory_order_release);
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        printf("Acquire-Release: %ld µs\\n", duration.count());
    }
    
    // Relaxed (más rápido pero requiere cuidado)
    void test_relaxed(size_t iterations) {
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < iterations; ++i) {
            auto ptr = atomic_ptr_.load(std::memory_order_relaxed);
            atomic_ptr_.store(ptr, std::memory_order_relaxed);
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        printf("Relaxed: %ld µs\\n", duration.count());
    }
};

// Patrón de publicación segura con acquire-release
template<typename T>
class PublishSubscribePattern {
private:
    std::atomic<std::shared_ptr<T>> published_data_;
    std::atomic<bool> ready_;

public:
    PublishSubscribePattern() : published_data_(nullptr), ready_(false) {}
    
    void publish(std::shared_ptr<T> data) {
        // Primero almacenar los datos
        published_data_.store(data, std::memory_order_relaxed);
        
        // Luego marcar como listo con release
        ready_.store(true, std::memory_order_release);
    }
    
    std::shared_ptr<T> try_consume() {
        // Primero verificar si está listo con acquire
        if (ready_.load(std::memory_order_acquire)) {
            // Ahora sabemos que los datos están disponibles
            return published_data_.load(std::memory_order_relaxed);
        }
        return nullptr;
    }
    
    // Versión con timeout
    std::shared_ptr<T> wait_and_consume(std::chrono::milliseconds timeout) {
        auto start = std::chrono::steady_clock::now();
        
        while (std::chrono::steady_clock::now() - start < timeout) {
            if (auto data = try_consume()) {
                return data;
            }
            std::this_thread::sleep_for(std::chrono::microseconds(100));
        }
        
        return nullptr;
    }
};

// RCU-like pattern con atomic_shared_ptr
template<typename T>
class RCUPattern {
private:
    std::atomic<std::shared_ptr<T>> current_data_;

public:
    RCUPattern(std::shared_ptr<T> initial_data) 
        : current_data_(std::move(initial_data)) {}
    
    // Lectores (muy rápido)
    template<typename Func>
    auto read(Func func) const -> decltype(func(*current_data_.load())) {
        auto data = current_data_.load(std::memory_order_acquire);
        return func(*data);
    }
    
    // Escritor (copia, modifica, publica)
    template<typename Func>
    void update(Func update_func) {
        while (true) {
            auto current = current_data_.load(std::memory_order_acquire);
            
            // Crear copia modificada
            auto new_data = std::make_shared<T>(*current);
            update_func(*new_data);
            
            // Intentar publicar
            if (current_data_.compare_exchange_weak(
                current, new_data, 
                std::memory_order_release, 
                std::memory_order_acquire)) {
                break;
            }
        }
    }
    
    // Grace period para cleanup manual si necesario
    void synchronize() {
        // En una implementación real, esperaríamos a que todos
        // los lectores terminen sus critical sections
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }
};

// Ejemplo de uso con métricas de performance
void performance_comparison() {
    const size_t iterations = 1000000;
    
    MemoryOrderingBenchmark<int> benchmark;
    
    printf("Performance comparison for %zu iterations:\\n", iterations);
    benchmark.test_seq_cst(iterations);
    benchmark.test_acquire_release(iterations);
    benchmark.test_relaxed(iterations);
    
    // Test publish-subscribe
    PublishSubscribePattern<std::string> pubsub;
    
    std::thread publisher([&pubsub]() {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        pubsub.publish(std::make_shared<std::string>("Hello, World!"));
    });
    
    std::thread subscriber([&pubsub]() {
        if (auto data = pubsub.wait_and_consume(std::chrono::seconds(1))) {
            printf("Received: %s\\n", data->c_str());
        } else {
            printf("Timeout waiting for data\\n");
        }
    });
    
    publisher.join();
    subscriber.join();
}`
    },
    {
      title: state.language === 'en' ? 'Production-Ready Implementation' : 'Implementación Lista para Producción',
      code: `#include <atomic>
#include <memory>
#include <mutex>
#include <condition_variable>
#include <chrono>

// Sistema completo de caché thread-safe con atomic smart pointers
template<typename Key, typename Value>
class ThreadSafeCache {
private:
    struct CacheEntry {
        Value value;
        std::chrono::steady_clock::time_point timestamp;
        std::atomic<size_t> access_count{0};
        
        CacheEntry(const Value& v) 
            : value(v), timestamp(std::chrono::steady_clock::now()) {}
    };
    
    using EntryPtr = std::shared_ptr<CacheEntry>;
    using AtomicEntryPtr = std::atomic<EntryPtr>;
    
    static constexpr size_t DEFAULT_BUCKET_COUNT = 1024;
    static constexpr auto DEFAULT_TTL = std::chrono::minutes(10);
    
    std::vector<AtomicEntryPtr> buckets_;
    std::atomic<size_t> size_{0};
    std::atomic<size_t> hits_{0};
    std::atomic<size_t> misses_{0};
    
    mutable std::mutex cleanup_mutex_;
    std::condition_variable cleanup_cv_;
    std::atomic<bool> cleanup_running_{false};
    std::thread cleanup_thread_;
    
    size_t hash(const Key& key) const {
        return std::hash<Key>{}(key) % buckets_.size();
    }

public:
    explicit ThreadSafeCache(size_t bucket_count = DEFAULT_BUCKET_COUNT)
        : buckets_(bucket_count) {
        start_cleanup_thread();
    }
    
    ~ThreadSafeCache() {
        stop_cleanup_thread();
    }
    
    // Inserción thread-safe
    void put(const Key& key, const Value& value) {
        size_t bucket_idx = hash(key);
        auto new_entry = std::make_shared<CacheEntry>(value);
        
        // Simple replacement strategy
        buckets_[bucket_idx].store(new_entry, std::memory_order_release);
        size_.fetch_add(1, std::memory_order_relaxed);
    }
    
    // Búsqueda thread-safe
    bool get(const Key& key, Value& value) const {
        size_t bucket_idx = hash(key);
        auto entry = buckets_[bucket_idx].load(std::memory_order_acquire);
        
        if (entry) {
            // Verificar TTL
            auto now = std::chrono::steady_clock::now();
            if (now - entry->timestamp <= DEFAULT_TTL) {
                value = entry->value;
                entry->access_count.fetch_add(1, std::memory_order_relaxed);
                hits_.fetch_add(1, std::memory_order_relaxed);
                return true;
            }
        }
        
        misses_.fetch_add(1, std::memory_order_relaxed);
        return false;
    }
    
    // Get-or-compute pattern
    template<typename Factory>
    Value get_or_compute(const Key& key, Factory factory) {
        Value value;
        if (get(key, value)) {
            return value;
        }
        
        // Compute new value
        value = factory(key);
        put(key, value);
        return value;
    }
    
    // Invalidación
    void invalidate(const Key& key) {
        size_t bucket_idx = hash(key);
        auto entry = buckets_[bucket_idx].exchange(nullptr, std::memory_order_acq_rel);
        if (entry) {
            size_.fetch_sub(1, std::memory_order_relaxed);
        }
    }
    
    void clear() {
        for (auto& bucket : buckets_) {
            bucket.store(nullptr, std::memory_order_release);
        }
        size_.store(0, std::memory_order_release);
    }
    
    // Estadísticas
    struct Stats {
        size_t size;
        size_t hits;
        size_t misses;
        double hit_ratio;
    };
    
    Stats get_stats() const {
        size_t total_hits = hits_.load(std::memory_order_relaxed);
        size_t total_misses = misses_.load(std::memory_order_relaxed);
        size_t total_requests = total_hits + total_misses;
        
        return {
            size_.load(std::memory_order_relaxed),
            total_hits,
            total_misses,
            total_requests > 0 ? static_cast<double>(total_hits) / total_requests : 0.0
        };
    }

private:
    void start_cleanup_thread() {
        cleanup_running_.store(true, std::memory_order_release);
        cleanup_thread_ = std::thread([this]() {
            cleanup_worker();
        });
    }
    
    void stop_cleanup_thread() {
        cleanup_running_.store(false, std::memory_order_release);
        cleanup_cv_.notify_all();
        
        if (cleanup_thread_.joinable()) {
            cleanup_thread_.join();
        }
    }
    
    void cleanup_worker() {
        while (cleanup_running_.load(std::memory_order_acquire)) {
            auto now = std::chrono::steady_clock::now();
            size_t cleaned = 0;
            
            for (auto& bucket : buckets_) {
                auto entry = bucket.load(std::memory_order_acquire);
                if (entry && (now - entry->timestamp) > DEFAULT_TTL) {
                    // Intentar remover entrada expirada
                    if (bucket.compare_exchange_strong(entry, nullptr, 
                                                      std::memory_order_acq_rel)) {
                        ++cleaned;
                    }
                }
            }
            
            if (cleaned > 0) {
                size_.fetch_sub(cleaned, std::memory_order_relaxed);
            }
            
            // Esperar antes del próximo cleanup
            std::unique_lock<std::mutex> lock(cleanup_mutex_);
            cleanup_cv_.wait_for(lock, std::chrono::seconds(30));
        }
    }
};

// Factory thread-safe para objetos complejos
template<typename T, typename... Args>
class ThreadSafeFactory {
private:
    std::atomic<std::shared_ptr<T>> singleton_;
    std::atomic<bool> initialized_{false};
    std::mutex init_mutex_;

public:
    std::shared_ptr<T> get_instance(Args... args) {
        // Fast path - double-checked locking
        if (initialized_.load(std::memory_order_acquire)) {
            return singleton_.load(std::memory_order_relaxed);
        }
        
        // Slow path - thread-safe initialization
        std::lock_guard<std::mutex> lock(init_mutex_);
        
        // Check again inside the lock
        if (!initialized_.load(std::memory_order_relaxed)) {
            auto instance = std::make_shared<T>(std::forward<Args>(args)...);
            singleton_.store(instance, std::memory_order_release);
            initialized_.store(true, std::memory_order_release);
        }
        
        return singleton_.load(std::memory_order_relaxed);
    }
    
    void reset() {
        std::lock_guard<std::mutex> lock(init_mutex_);
        singleton_.store(nullptr, std::memory_order_release);
        initialized_.store(false, std::memory_order_release);
    }
};

// Ejemplo de uso completo
void production_example() {
    ThreadSafeCache<std::string, int> cache(256);
    
    // Múltiples threads accediendo al caché
    std::vector<std::thread> workers;
    
    for (int i = 0; i < 8; ++i) {
        workers.emplace_back([&cache, i]() {
            for (int j = 0; j < 1000; ++j) {
                std::string key = "key_" + std::to_string((i * j) % 100);
                
                int value = cache.get_or_compute(key, [](const std::string& k) {
                    // Simular cálculo costoso
                    std::this_thread::sleep_for(std::chrono::microseconds(10));
                    return static_cast<int>(std::hash<std::string>{}(k) % 10000);
                });
                
                // Usar el valor...
                (void)value;
            }
        });
    }
    
    // Estadísticas en tiempo real
    std::thread stats_thread([&cache]() {
        for (int i = 0; i < 10; ++i) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
            auto stats = cache.get_stats();
            printf("Cache stats - Size: %zu, Hit ratio: %.2f%%\\n", 
                   stats.size, stats.hit_ratio * 100.0);
        }
    });
    
    for (auto& worker : workers) {
        worker.join();
    }
    
    stats_thread.join();
    
    auto final_stats = cache.get_stats();
    printf("Final stats - Size: %zu, Hits: %zu, Misses: %zu, Hit ratio: %.2f%%\\n",
           final_stats.size, final_stats.hits, final_stats.misses, 
           final_stats.hit_ratio * 100.0);
}`
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 98: Atomic Smart Pointers' : 'Lección 98: Punteros Inteligentes Atómicos'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <AtomicPointerVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <SectionTitle>{state.language === 'en' ? 'Atomic Smart Pointer Patterns' : 'Patrones de Punteros Inteligentes Atómicos'}</SectionTitle>
<div className="example-tabs">
            {examples.map((example, index) => (
              <button
                key={index}
                className={`tab ${currentExample === index ? 'active' : ''}`}
                onClick={() => setCurrentExample(index)}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className="example-content">
            <pre className="code-block">
              <code>{examples[currentExample]?.code ?? ''}</code>
            </pre>
          </div>
        </div>

        <div className="theory-section">
          <SectionTitle>{state.language === 'en' ? 'Key Concepts' : 'Conceptos Clave'}</SectionTitle>
<div className="concept-grid">
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Atomic Operations' : 'Operaciones Atómicas'}</SectionTitle>
              <p>
                {state.language === 'en' 
                  ? 'Store, load, exchange, and compare-exchange operations on smart pointers without explicit locking.'
                  : 'Operaciones store, load, exchange y compare-exchange en punteros inteligentes sin bloqueos explícitos.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Memory Ordering' : 'Ordenamiento de Memoria'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Control over memory synchronization with acquire-release, sequential consistency, and relaxed ordering.'
                  : 'Control sobre sincronización de memoria con acquire-release, consistencia secuencial y ordenamiento relajado.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Lock-Free Data Structures' : 'Estructuras de Datos Lock-Free'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Implementation of concurrent data structures using atomic smart pointers for high-performance systems.'
                  : 'Implementación de estructuras de datos concurrentes usando punteros inteligentes atómicos para sistemas de alto rendimiento.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Performance Optimization' : 'Optimización de Rendimiento'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Memory ordering selection, contention reduction, and performance benchmarking for optimal throughput.'
                  : 'Selección de ordenamiento de memoria, reducción de contención y benchmarking de rendimiento para throughput óptimo.'}
              </p>
          </div>
          </div>
        </div>

        <div className="best-practices">
          <SectionTitle>{state.language === 'en' ? 'Best Practices' : 'Mejores Prácticas'}</SectionTitle>
<ul>
            <li>
              {state.language === 'en'
                ? 'Use appropriate memory ordering - acquire-release for synchronization, relaxed for counters'
                : 'Usa ordenamiento de memoria apropiado - acquire-release para sincronización, relajado para contadores'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement ABA problem prevention using generation counters or hazard pointers'
                : 'Implementa prevención del problema ABA usando contadores de generación o hazard pointers'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Profile different memory orderings to find optimal performance for your use case'
                : 'Perfilá diferentes ordenamientos de memoria para encontrar el rendimiento óptimo para tu caso de uso'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Design for contention reduction by minimizing shared atomic operations'
                : 'Diseña para reducir contención minimizando operaciones atómicas compartidas'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement proper cleanup and resource management in lock-free structures'
                : 'Implementa limpieza apropiada y gestión de recursos en estructuras lock-free'}
            </li>
          </ul>
          </div>
      </div>
    </div>
  );
}