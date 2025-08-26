import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder } from '@react-three/drei';
import { useApp } from '../hooks/useApp';

interface EnterpriseMetrics {
  throughput: number;
  memoryEfficiency: number;
  errorHandling: number;
  scalability: number;
  monitoring: number;
}

interface EnterpriseVisualizationProps {
  metrics: EnterpriseMetrics;
  activeSystem: string;
}

const EnterpriseArchitectureVisualization: React.FC<EnterpriseVisualizationProps> = ({ metrics, activeSystem }) => {
  const groupRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const systems = [
    { name: 'Memory Manager', position: [0, 2, 0], color: '#ff6b6b', size: metrics.memoryEfficiency },
    { name: 'Resource Pool', position: [-3, 0, 0], color: '#4ecdc4', size: metrics.scalability },
    { name: 'Error Handler', position: [3, 0, 0], color: '#45b7d1', size: metrics.errorHandling },
    { name: 'Monitor System', position: [0, -2, 0], color: '#96ceb4', size: metrics.monitoring },
    { name: 'Core Engine', position: [0, 0, 0], color: '#feca57', size: metrics.throughput }
  ];

  return (
    <group ref={groupRef}>
      {systems.map((system, index) => (
        <group key={system.name} position={system.position}>
          <Box
            args={[system.size, system.size, system.size]}
            position={[0, 0, 0]}
          >
            <meshPhongMaterial 
              color={activeSystem === system.name ? '#ffffff' : system.color}
              transparent={true}
              opacity={activeSystem === system.name ? 1.0 : 0.7}
            />
          </Box>
          <Text
            position={[0, system.size + 0.5, 0]}
            fontSize={0.3}
            color="#333"
            anchorX="center"
            anchorY="middle"
          >
            {system.name}
          </Text>
          <Text
            position={[0, -system.size - 0.5, 0]}
            fontSize={0.2}
            color="#666"
            anchorX="center"
            anchorY="middle"
          >
            {(system.size * 100).toFixed(1)}%
          </Text>
        </group>
      ))}
      
      {/* Connection lines */}
      {systems.slice(1).map((system, index) => (
        <Cylinder
          key={`connection-${index}`}
          args={[0.02, 0.02, Math.sqrt(system.position[0]**2 + system.position[1]**2 + system.position[2]**2)]}
          position={[system.position[0]/2, system.position[1]/2, system.position[2]/2]}
          rotation={[
            Math.atan2(system.position[1], Math.sqrt(system.position[0]**2 + system.position[2]**2)),
            Math.atan2(system.position[0], system.position[2]),
            0
          ]}
        >
          <meshPhongMaterial color="#888888" transparent opacity={0.5} />
        </Cylinder>
      ))}
    </group>
  );
};

const Lesson110_EnterprisePatternsCapstone: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('memory-architecture');
  const [selectedSystem, setSelectedSystem] = useState<string>('Core Engine');
  const [metrics, setMetrics] = useState<EnterpriseMetrics>({
    throughput: 0.95,
    memoryEfficiency: 0.88,
    errorHandling: 0.92,
    scalability: 0.85,
    monitoring: 0.90
  });

  const examples = {
    'memory-architecture': {
      title: state.language === 'en' ? 'Enterprise Memory Architecture' : 'Arquitectura de Memoria Empresarial',
      code: `#include <memory>
#include <vector>
#include <unordered_map>
#include <atomic>
#include <mutex>
#include <thread>
#include <chrono>

// Enterprise Memory Manager - Production-Ready
class EnterpriseMemoryManager {
public:
    struct PoolStats {
        std::atomic<size_t> allocations{0};
        std::atomic<size_t> deallocations{0};
        std::atomic<size_t> peak_usage{0};
        std::atomic<size_t> current_usage{0};
    };

    class MemoryPool {
    private:
        struct Block {
            size_t size;
            bool is_free;
            Block* next;
            Block* prev;
            
            Block(size_t sz) : size(sz), is_free(true), next(nullptr), prev(nullptr) {}
        };
        
        std::vector<std::unique_ptr<char[]>> chunks_;
        Block* free_list_head_;
        std::mutex pool_mutex_;
        PoolStats stats_;
        
    public:
        MemoryPool(size_t initial_size = 1024 * 1024) {
            allocate_new_chunk(initial_size);
        }
        
        void* allocate(size_t size, size_t alignment = sizeof(void*)) {
            std::lock_guard<std::mutex> lock(pool_mutex_);
            
            size = align_size(size, alignment);
            Block* block = find_free_block(size);
            
            if (!block) {
                size_t chunk_size = std::max(size * 2, static_cast<size_t>(1024 * 1024));
                allocate_new_chunk(chunk_size);
                block = find_free_block(size);
            }
            
            if (block) {
                block->is_free = false;
                stats_.allocations.fetch_add(1);
                stats_.current_usage.fetch_add(size);
                
                size_t current = stats_.current_usage.load();
                size_t peak = stats_.peak_usage.load();
                while (current > peak && !stats_.peak_usage.compare_exchange_weak(peak, current)) {
                    peak = stats_.peak_usage.load();
                }
                
                return static_cast<void*>(block + 1);
            }
            
            throw std::bad_alloc();
        }
        
        void deallocate(void* ptr, size_t size) {
            if (!ptr) return;
            
            std::lock_guard<std::mutex> lock(pool_mutex_);
            Block* block = static_cast<Block*>(ptr) - 1;
            block->is_free = true;
            stats_.deallocations.fetch_add(1);
            stats_.current_usage.fetch_sub(size);
            
            coalesce_free_blocks(block);
        }
        
        PoolStats get_stats() const { return stats_; }
        
    private:
        size_t align_size(size_t size, size_t alignment) {
            return (size + alignment - 1) & ~(alignment - 1);
        }
        
        void allocate_new_chunk(size_t size) {
            auto chunk = std::make_unique<char[]>(size);
            Block* block = new (chunk.get()) Block(size - sizeof(Block));
            
            if (free_list_head_) {
                block->next = free_list_head_;
                free_list_head_->prev = block;
            }
            free_list_head_ = block;
            
            chunks_.push_back(std::move(chunk));
        }
        
        Block* find_free_block(size_t size) {
            Block* current = free_list_head_;
            while (current) {
                if (current->is_free && current->size >= size) {
                    return current;
                }
                current = current->next;
            }
            return nullptr;
        }
        
        void coalesce_free_blocks(Block* block) {
            // Coalesce with next block
            if (block->next && block->next->is_free) {
                block->size += sizeof(Block) + block->next->size;
                Block* next = block->next;
                block->next = next->next;
                if (next->next) next->next->prev = block;
            }
            
            // Coalesce with previous block
            if (block->prev && block->prev->is_free) {
                block->prev->size += sizeof(Block) + block->size;
                block->prev->next = block->next;
                if (block->next) block->next->prev = block->prev;
            }
        }
    };

private:
    std::unordered_map<std::thread::id, std::unique_ptr<MemoryPool>> thread_pools_;
    std::mutex manager_mutex_;
    
public:
    static EnterpriseMemoryManager& instance() {
        static EnterpriseMemoryManager instance;
        return instance;
    }
    
    void* allocate(size_t size, size_t alignment = sizeof(void*)) {
        std::thread::id tid = std::this_thread::get_id();
        
        std::lock_guard<std::mutex> lock(manager_mutex_);
        auto it = thread_pools_.find(tid);
        if (it == thread_pools_.end()) {
            thread_pools_[tid] = std::make_unique<MemoryPool>();
        }
        
        return thread_pools_[tid]->allocate(size, alignment);
    }
    
    void deallocate(void* ptr, size_t size) {
        std::thread::id tid = std::this_thread::get_id();
        
        std::lock_guard<std::mutex> lock(manager_mutex_);
        auto it = thread_pools_.find(tid);
        if (it != thread_pools_.end()) {
            it->second->deallocate(ptr, size);
        }
    }
};`
    },
    
    'raii-patterns': {
      title: state.language === 'en' ? 'Large-Scale RAII Patterns' : 'Patrones RAII a Gran Escala',
      code: `#include <memory>
#include <vector>
#include <functional>
#include <atomic>
#include <thread>
#include <mutex>

// Enterprise RAII Resource Manager
template<typename ResourceType>
class EnterpriseResourceManager {
public:
    using ResourceDeleter = std::function<void(ResourceType*)>;
    using ResourceFactory = std::function<std::unique_ptr<ResourceType>()>;
    
    class ManagedResource {
    private:
        std::unique_ptr<ResourceType, ResourceDeleter> resource_;
        std::atomic<bool> is_valid_;
        mutable std::mutex access_mutex_;
        
    public:
        template<typename... Args>
        ManagedResource(Args&&... args) 
            : resource_(std::forward<Args>(args)...), is_valid_(true) {}
        
        // Thread-safe access with RAII lock
        class ResourceLock {
        private:
            std::unique_lock<std::mutex> lock_;
            ResourceType* resource_;
            
        public:
            ResourceLock(const ManagedResource& managed) 
                : lock_(managed.access_mutex_) {
                if (managed.is_valid_.load()) {
                    resource_ = managed.resource_.get();
                } else {
                    resource_ = nullptr;
                }
            }
            
            ResourceType* operator->() { return resource_; }
            ResourceType& operator*() { return *resource_; }
            bool valid() const { return resource_ != nullptr; }
        };
        
        ResourceLock lock() const {
            return ResourceLock(*this);
        }
        
        void invalidate() {
            std::lock_guard<std::mutex> lock(access_mutex_);
            is_valid_.store(false);
            resource_.reset();
        }
        
        bool is_valid() const {
            return is_valid_.load() && resource_ != nullptr;
        }
    };

private:
    std::vector<std::shared_ptr<ManagedResource>> resources_;
    ResourceFactory factory_;
    std::mutex manager_mutex_;
    std::atomic<size_t> resource_counter_{0};
    
public:
    EnterpriseResourceManager(ResourceFactory factory) 
        : factory_(std::move(factory)) {}
    
    std::shared_ptr<ManagedResource> acquire_resource() {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        
        // Try to find an available resource
        for (auto& resource : resources_) {
            if (resource->is_valid() && resource.use_count() == 1) {
                return resource;
            }
        }
        
        // Create new resource if none available
        auto new_resource = factory_();
        auto managed = std::make_shared<ManagedResource>(
            std::move(new_resource),
            [this](ResourceType* ptr) {
                this->custom_deleter(ptr);
            }
        );
        
        resources_.push_back(managed);
        resource_counter_.fetch_add(1);
        
        return managed;
    }
    
    void cleanup_unused_resources() {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        resources_.erase(
            std::remove_if(resources_.begin(), resources_.end(),
                [](const auto& resource) {
                    return !resource->is_valid() || resource.use_count() == 1;
                }),
            resources_.end()
        );
    }
    
    size_t active_resources() const {
        return resource_counter_.load();
    }

private:
    void custom_deleter(ResourceType* resource) {
        // Custom cleanup logic
        delete resource;
        resource_counter_.fetch_sub(1);
    }
};

// Enterprise Transaction Manager with RAII
class TransactionManager {
public:
    class Transaction {
    private:
        std::function<void()> rollback_actions_;
        std::atomic<bool> committed_;
        std::atomic<bool> rolled_back_;
        
    public:
        Transaction() : committed_(false), rolled_back_(false) {}
        
        ~Transaction() {
            if (!committed_.load() && !rolled_back_.load()) {
                rollback();
            }
        }
        
        template<typename Action, typename Rollback>
        void add_action(Action&& action, Rollback&& rollback) {
            try {
                action();
                auto old_rollback = std::move(rollback_actions_);
                rollback_actions_ = [rollback = std::forward<Rollback>(rollback), old_rollback]() mutable {
                    rollback();
                    if (old_rollback) old_rollback();
                };
            } catch (...) {
                rollback();
                throw;
            }
        }
        
        void commit() {
            committed_.store(true);
        }
        
        void rollback() {
            if (!rolled_back_.exchange(true)) {
                if (rollback_actions_) {
                    rollback_actions_();
                }
            }
        }
        
        bool is_committed() const { return committed_.load(); }
        bool is_rolled_back() const { return rolled_back_.load(); }
    };
    
    static std::unique_ptr<Transaction> begin_transaction() {
        return std::make_unique<Transaction>();
    }
};`
    },
    
    'performance-patterns': {
      title: state.language === 'en' ? 'Performance-Critical Smart Pointers' : 'Smart Pointers Críticos para Rendimiento',
      code: `#include <memory>
#include <atomic>
#include <vector>
#include <thread>
#include <chrono>

// High-Performance Intrusive Smart Pointer
template<typename T>
class intrusive_ptr {
private:
    T* ptr_;

public:
    intrusive_ptr() : ptr_(nullptr) {}
    
    explicit intrusive_ptr(T* p) : ptr_(p) {
        if (ptr_) intrusive_ptr_add_ref(ptr_);
    }
    
    intrusive_ptr(const intrusive_ptr& other) : ptr_(other.ptr_) {
        if (ptr_) intrusive_ptr_add_ref(ptr_);
    }
    
    intrusive_ptr(intrusive_ptr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    ~intrusive_ptr() {
        if (ptr_) intrusive_ptr_release(ptr_);
    }
    
    intrusive_ptr& operator=(const intrusive_ptr& other) {
        if (this != &other) {
            T* old_ptr = ptr_;
            ptr_ = other.ptr_;
            if (ptr_) intrusive_ptr_add_ref(ptr_);
            if (old_ptr) intrusive_ptr_release(old_ptr);
        }
        return *this;
    }
    
    intrusive_ptr& operator=(intrusive_ptr&& other) noexcept {
        if (this != &other) {
            T* old_ptr = ptr_;
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
            if (old_ptr) intrusive_ptr_release(old_ptr);
        }
        return *this;
    }
    
    T* get() const noexcept { return ptr_; }
    T& operator*() const noexcept { return *ptr_; }
    T* operator->() const noexcept { return ptr_; }
    
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
};

// Base class for intrusive reference counting
class intrusive_ref_counter {
private:
    mutable std::atomic<uint32_t> ref_count_{1};

public:
    intrusive_ref_counter() = default;
    
    intrusive_ref_counter(const intrusive_ref_counter&) : ref_count_(1) {}
    
    intrusive_ref_counter& operator=(const intrusive_ref_counter&) {
        // Don't copy reference count
        return *this;
    }
    
    uint32_t use_count() const noexcept {
        return ref_count_.load(std::memory_order_acquire);
    }
    
    friend void intrusive_ptr_add_ref(const intrusive_ref_counter* p) {
        p->ref_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    friend void intrusive_ptr_release(const intrusive_ref_counter* p) {
        if (p->ref_count_.fetch_sub(1, std::memory_order_release) == 1) {
            std::atomic_thread_fence(std::memory_order_acquire);
            delete p;
        }
    }

protected:
    virtual ~intrusive_ref_counter() = default;
};

// Lock-Free Object Pool for High Performance
template<typename T>
class LockFreeObjectPool {
private:
    struct alignas(64) Node {
        std::atomic<Node*> next;
        alignas(T) char storage[sizeof(T)];
        
        Node() : next(nullptr) {}
    };
    
    std::atomic<Node*> head_{nullptr};
    std::vector<std::unique_ptr<Node[]>> chunks_;
    std::atomic<size_t> total_objects_{0};
    std::atomic<size_t> available_objects_{0};
    
public:
    LockFreeObjectPool(size_t initial_size = 1000) {
        allocate_chunk(initial_size);
    }
    
    template<typename... Args>
    std::unique_ptr<T> acquire(Args&&... args) {
        Node* node = pop_node();
        if (!node) {
            allocate_chunk(1000); // Grow pool
            node = pop_node();
            if (!node) {
                throw std::bad_alloc();
            }
        }
        
        T* obj = new (node->storage) T(std::forward<Args>(args)...);
        
        return std::unique_ptr<T>(obj, [this, node](T* ptr) {
            ptr->~T();
            push_node(node);
        });
    }
    
    size_t available_count() const {
        return available_objects_.load(std::memory_order_acquire);
    }
    
    size_t total_count() const {
        return total_objects_.load(std::memory_order_acquire);
    }

private:
    void allocate_chunk(size_t size) {
        auto chunk = std::make_unique<Node[]>(size);
        
        // Link nodes together
        for (size_t i = 0; i < size - 1; ++i) {
            chunk[i].next.store(&chunk[i + 1], std::memory_order_relaxed);
        }
        chunk[size - 1].next.store(nullptr, std::memory_order_relaxed);
        
        // Add to head of free list
        Node* old_head = head_.load(std::memory_order_acquire);
        do {
            chunk[size - 1].next.store(old_head, std::memory_order_relaxed);
        } while (!head_.compare_exchange_weak(old_head, &chunk[0],
                                              std::memory_order_release,
                                              std::memory_order_acquire));
        
        chunks_.push_back(std::move(chunk));
        total_objects_.fetch_add(size, std::memory_order_relaxed);
        available_objects_.fetch_add(size, std::memory_order_relaxed);
    }
    
    Node* pop_node() {
        Node* head = head_.load(std::memory_order_acquire);
        
        while (head != nullptr) {
            Node* next = head->next.load(std::memory_order_relaxed);
            if (head_.compare_exchange_weak(head, next,
                                            std::memory_order_release,
                                            std::memory_order_acquire)) {
                available_objects_.fetch_sub(1, std::memory_order_relaxed);
                return head;
            }
        }
        
        return nullptr;
    }
    
    void push_node(Node* node) {
        Node* old_head = head_.load(std::memory_order_relaxed);
        
        do {
            node->next.store(old_head, std::memory_order_relaxed);
        } while (!head_.compare_exchange_weak(old_head, node,
                                              std::memory_order_release,
                                              std::memory_order_relaxed));
        
        available_objects_.fetch_add(1, std::memory_order_relaxed);
    }
};

// Performance monitoring for smart pointers
class PerformanceMonitor {
private:
    struct Metrics {
        std::atomic<uint64_t> allocations{0};
        std::atomic<uint64_t> deallocations{0};
        std::atomic<uint64_t> peak_objects{0};
        std::atomic<uint64_t> current_objects{0};
        std::atomic<uint64_t> total_allocation_time{0};
    };
    
    static Metrics& get_metrics() {
        static Metrics metrics;
        return metrics;
    }

public:
    class ScopedTimer {
    private:
        std::chrono::high_resolution_clock::time_point start_;
        
    public:
        ScopedTimer() : start_(std::chrono::high_resolution_clock::now()) {}
        
        ~ScopedTimer() {
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start_);
            get_metrics().total_allocation_time.fetch_add(duration.count(), std::memory_order_relaxed);
        }
    };
    
    static void record_allocation() {
        auto& metrics = get_metrics();
        metrics.allocations.fetch_add(1, std::memory_order_relaxed);
        auto current = metrics.current_objects.fetch_add(1, std::memory_order_relaxed) + 1;
        
        auto peak = metrics.peak_objects.load(std::memory_order_relaxed);
        while (current > peak && !metrics.peak_objects.compare_exchange_weak(peak, current, std::memory_order_relaxed)) {
            peak = metrics.peak_objects.load(std::memory_order_relaxed);
        }
    }
    
    static void record_deallocation() {
        auto& metrics = get_metrics();
        metrics.deallocations.fetch_add(1, std::memory_order_relaxed);
        metrics.current_objects.fetch_sub(1, std::memory_order_relaxed);
    }
    
    static void print_stats() {
        auto& metrics = get_metrics();
        printf("Allocations: %lu\\n", metrics.allocations.load());
        printf("Deallocations: %lu\\n", metrics.deallocations.load());
        printf("Peak Objects: %lu\\n", metrics.peak_objects.load());
        printf("Current Objects: %lu\\n", metrics.current_objects.load());
        printf("Avg Allocation Time: %.2f ns\\n", 
               static_cast<double>(metrics.total_allocation_time.load()) / metrics.allocations.load());
    }
};`
    },
    
    'error-handling': {
      title: state.language === 'en' ? 'Production Error Handling' : 'Manejo de Errores en Producción',
      code: `#include <memory>
#include <string>
#include <vector>
#include <functional>
#include <exception>
#include <mutex>
#include <thread>
#include <chrono>
#include <sstream>

// Enterprise Error Handling System
class ErrorContext {
public:
    enum class Severity {
        Info,
        Warning, 
        Error,
        Critical,
        Fatal
    };

private:
    std::string component_;
    std::string operation_;
    Severity severity_;
    std::string message_;
    std::chrono::system_clock::time_point timestamp_;
    std::thread::id thread_id_;
    std::vector<std::string> stack_trace_;
    
public:
    ErrorContext(std::string component, std::string operation, Severity severity, std::string message)
        : component_(std::move(component))
        , operation_(std::move(operation))
        , severity_(severity)
        , message_(std::move(message))
        , timestamp_(std::chrono::system_clock::now())
        , thread_id_(std::this_thread::get_id()) {
        capture_stack_trace();
    }
    
    const std::string& component() const { return component_; }
    const std::string& operation() const { return operation_; }
    Severity severity() const { return severity_; }
    const std::string& message() const { return message_; }
    const auto& timestamp() const { return timestamp_; }
    std::thread::id thread_id() const { return thread_id_; }
    const auto& stack_trace() const { return stack_trace_; }
    
    std::string to_string() const {
        std::stringstream ss;
        ss << "[" << severity_to_string(severity_) << "] "
           << component_ << "::" << operation_ << " - " << message_;
        return ss.str();
    }

private:
    void capture_stack_trace() {
        // Simplified stack trace capture
        stack_trace_.push_back("main()");
        stack_trace_.push_back("EnterpriseSystem::process()");
        stack_trace_.push_back(component_ + "::" + operation_ + "()");
    }
    
    std::string severity_to_string(Severity sev) const {
        switch (sev) {
            case Severity::Info: return "INFO";
            case Severity::Warning: return "WARN";
            case Severity::Error: return "ERROR";
            case Severity::Critical: return "CRITICAL";
            case Severity::Fatal: return "FATAL";
        }
        return "UNKNOWN";
    }
};

// Error Logger with Thread Safety
class ErrorLogger {
private:
    std::vector<ErrorContext> error_log_;
    std::mutex log_mutex_;
    std::function<void(const ErrorContext&)> external_handler_;
    size_t max_log_size_;
    
public:
    ErrorLogger(size_t max_size = 10000) : max_log_size_(max_size) {}
    
    void log_error(ErrorContext error) {
        std::lock_guard<std::mutex> lock(log_mutex_);
        
        error_log_.push_back(std::move(error));
        
        if (error_log_.size() > max_log_size_) {
            error_log_.erase(error_log_.begin());
        }
        
        if (external_handler_) {
            external_handler_(error_log_.back());
        }
        
        // Handle critical/fatal errors immediately
        if (error_log_.back().severity() >= ErrorContext::Severity::Critical) {
            handle_critical_error(error_log_.back());
        }
    }
    
    void set_external_handler(std::function<void(const ErrorContext&)> handler) {
        std::lock_guard<std::mutex> lock(log_mutex_);
        external_handler_ = std::move(handler);
    }
    
    std::vector<ErrorContext> get_errors_by_severity(ErrorContext::Severity min_severity) const {
        std::lock_guard<std::mutex> lock(log_mutex_);
        std::vector<ErrorContext> result;
        
        for (const auto& error : error_log_) {
            if (error.severity() >= min_severity) {
                result.push_back(error);
            }
        }
        
        return result;
    }

private:
    void handle_critical_error(const ErrorContext& error) {
        // Immediate notification for critical errors
        printf("CRITICAL ERROR: %s\\n", error.to_string().c_str());
        
        if (error.severity() == ErrorContext::Severity::Fatal) {
            // Trigger emergency shutdown procedures
            printf("FATAL ERROR - Initiating emergency shutdown\\n");
        }
    }
};

// RAII Exception Safety Wrapper
template<typename T>
class SafeWrapper {
private:
    std::unique_ptr<T> resource_;
    std::shared_ptr<ErrorLogger> logger_;
    std::string component_name_;
    
public:
    template<typename... Args>
    SafeWrapper(std::shared_ptr<ErrorLogger> logger, std::string component, Args&&... args)
        : logger_(std::move(logger))
        , component_name_(std::move(component)) {
        
        try {
            resource_ = std::make_unique<T>(std::forward<Args>(args)...);
        } catch (const std::exception& e) {
            if (logger_) {
                logger_->log_error(ErrorContext(
                    component_name_, "constructor", 
                    ErrorContext::Severity::Error,
                    std::string("Construction failed: ") + e.what()
                ));
            }
            throw;
        }
    }
    
    template<typename F>
    auto safe_call(const std::string& operation, F&& func) -> decltype(func(*resource_)) {
        if (!resource_) {
            throw std::runtime_error("Resource is null");
        }
        
        try {
            return func(*resource_);
        } catch (const std::exception& e) {
            if (logger_) {
                logger_->log_error(ErrorContext(
                    component_name_, operation,
                    ErrorContext::Severity::Error,
                    std::string("Operation failed: ") + e.what()
                ));
            }
            throw;
        }
    }
    
    T* get() const { return resource_.get(); }
    T& operator*() const { return *resource_; }
    T* operator->() const { return resource_.get(); }
    
    bool is_valid() const { return resource_ != nullptr; }
};

// Enterprise Exception Hierarchy
class EnterpriseException : public std::exception {
protected:
    ErrorContext context_;
    
public:
    EnterpriseException(std::string component, std::string operation, 
                       ErrorContext::Severity severity, std::string message)
        : context_(std::move(component), std::move(operation), severity, std::move(message)) {}
    
    const char* what() const noexcept override {
        static std::string cached_message = context_.to_string();
        return cached_message.c_str();
    }
    
    const ErrorContext& context() const { return context_; }
};

class MemoryException : public EnterpriseException {
public:
    MemoryException(std::string component, std::string operation, std::string message)
        : EnterpriseException(std::move(component), std::move(operation), 
                             ErrorContext::Severity::Critical, std::move(message)) {}
};

class ResourceException : public EnterpriseException {
public:
    ResourceException(std::string component, std::string operation, std::string message)
        : EnterpriseException(std::move(component), std::move(operation),
                             ErrorContext::Severity::Error, std::move(message)) {}
};

// Global Error Handler Registry
class ErrorHandlerRegistry {
private:
    static std::shared_ptr<ErrorLogger> global_logger_;
    static std::mutex registry_mutex_;
    
public:
    static std::shared_ptr<ErrorLogger> get_logger() {
        std::lock_guard<std::mutex> lock(registry_mutex_);
        if (!global_logger_) {
            global_logger_ = std::make_shared<ErrorLogger>();
        }
        return global_logger_;
    }
    
    static void set_logger(std::shared_ptr<ErrorLogger> logger) {
        std::lock_guard<std::mutex> lock(registry_mutex_);
        global_logger_ = std::move(logger);
    }
};

std::shared_ptr<ErrorLogger> ErrorHandlerRegistry::global_logger_;
std::mutex ErrorHandlerRegistry::registry_mutex_;`
    },
    
    'scalable-resources': {
      title: state.language === 'en' ? 'Scalable Resource Management' : 'Gestión Escalable de Recursos',
      code: `#include <memory>
#include <unordered_map>
#include <vector>
#include <atomic>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <future>
#include <queue>

// Enterprise Resource Management System
template<typename ResourceType, typename ResourceId = uint64_t>
class EnterpriseResourceSystem {
public:
    using ResourcePtr = std::shared_ptr<ResourceType>;
    using ResourceFactory = std::function<ResourcePtr()>;
    using ResourceValidator = std::function<bool(const ResourceType&)>;
    
    struct ResourceMetrics {
        std::atomic<size_t> total_created{0};
        std::atomic<size_t> currently_active{0};
        std::atomic<size_t> cache_hits{0};
        std::atomic<size_t> cache_misses{0};
        std::atomic<size_t> evictions{0};
    };

private:
    struct ResourceEntry {
        ResourcePtr resource;
        std::atomic<std::chrono::steady_clock::time_point> last_accessed;
        std::atomic<size_t> access_count;
        std::atomic<bool> is_locked;
        
        ResourceEntry(ResourcePtr res) 
            : resource(std::move(res))
            , last_accessed(std::chrono::steady_clock::now())
            , access_count(0)
            , is_locked(false) {}
    };
    
    mutable std::shared_mutex resource_map_mutex_;
    std::unordered_map<ResourceId, std::unique_ptr<ResourceEntry>> resource_cache_;
    std::queue<ResourceId> lru_queue_;
    std::mutex lru_mutex_;
    
    ResourceFactory factory_;
    ResourceValidator validator_;
    size_t max_cache_size_;
    std::chrono::milliseconds eviction_timeout_;
    
    ResourceMetrics metrics_;
    
    // Background eviction thread
    std::thread eviction_thread_;
    std::atomic<bool> should_stop_{false};
    std::condition_variable eviction_cv_;
    
public:
    EnterpriseResourceSystem(ResourceFactory factory, 
                            size_t max_cache_size = 1000,
                            std::chrono::milliseconds eviction_timeout = std::chrono::minutes(5))
        : factory_(std::move(factory))
        , max_cache_size_(max_cache_size)
        , eviction_timeout_(eviction_timeout) {
        
        start_eviction_thread();
    }
    
    ~EnterpriseResourceSystem() {
        should_stop_.store(true);
        eviction_cv_.notify_all();
        if (eviction_thread_.joinable()) {
            eviction_thread_.join();
        }
    }
    
    // Acquire resource with automatic lifecycle management
    class ResourceLease {
    private:
        ResourcePtr resource_;
        ResourceId id_;
        EnterpriseResourceSystem* system_;
        
    public:
        ResourceLease(ResourcePtr resource, ResourceId id, EnterpriseResourceSystem* system)
            : resource_(std::move(resource)), id_(id), system_(system) {}
        
        ~ResourceLease() {
            if (system_ && resource_) {
                system_->release_resource(id_);
            }
        }
        
        ResourceLease(const ResourceLease&) = delete;
        ResourceLease& operator=(const ResourceLease&) = delete;
        
        ResourceLease(ResourceLease&& other) noexcept 
            : resource_(std::move(other.resource_))
            , id_(other.id_)
            , system_(other.system_) {
            other.system_ = nullptr;
        }
        
        ResourceLease& operator=(ResourceLease&& other) noexcept {
            if (this != &other) {
                if (system_ && resource_) {
                    system_->release_resource(id_);
                }
                resource_ = std::move(other.resource_);
                id_ = other.id_;
                system_ = other.system_;
                other.system_ = nullptr;
            }
            return *this;
        }
        
        ResourceType* get() const { return resource_.get(); }
        ResourceType& operator*() const { return *resource_; }
        ResourceType* operator->() const { return resource_.get(); }
        
        bool valid() const { return resource_ != nullptr; }
    };
    
    ResourceLease acquire_resource(ResourceId id) {
        // Try to get from cache first
        {
            std::shared_lock<std::shared_mutex> lock(resource_map_mutex_);
            auto it = resource_cache_.find(id);
            if (it != resource_cache_.end()) {
                auto& entry = it->second;
                if (!entry->is_locked.exchange(true)) {
                    entry->last_accessed.store(std::chrono::steady_clock::now());
                    entry->access_count.fetch_add(1);
                    metrics_.cache_hits.fetch_add(1);
                    return ResourceLease(entry->resource, id, this);
                }
            }
        }
        
        metrics_.cache_misses.fetch_add(1);
        
        // Create new resource
        auto resource = factory_();
        if (!resource) {
            throw std::runtime_error("Resource factory failed");
        }
        
        auto entry = std::make_unique<ResourceEntry>(resource);
        entry->is_locked.store(true);
        
        {
            std::unique_lock<std::shared_mutex> lock(resource_map_mutex_);
            resource_cache_[id] = std::move(entry);
            
            // Handle cache overflow
            if (resource_cache_.size() > max_cache_size_) {
                evict_lru_resource();
            }
        }
        
        metrics_.total_created.fetch_add(1);
        metrics_.currently_active.fetch_add(1);
        
        return ResourceLease(resource, id, this);
    }
    
    void set_validator(ResourceValidator validator) {
        validator_ = std::move(validator);
    }
    
    ResourceMetrics get_metrics() const {
        return metrics_;
    }
    
    void force_eviction() {
        eviction_cv_.notify_all();
    }

private:
    void release_resource(ResourceId id) {
        std::shared_lock<std::shared_mutex> lock(resource_map_mutex_);
        auto it = resource_cache_.find(id);
        if (it != resource_cache_.end()) {
            it->second->is_locked.store(false);
            metrics_.currently_active.fetch_sub(1);
        }
    }
    
    void evict_lru_resource() {
        auto now = std::chrono::steady_clock::now();
        ResourceId oldest_id = 0;
        std::chrono::steady_clock::time_point oldest_time = now;
        
        for (const auto& [id, entry] : resource_cache_) {
            if (!entry->is_locked.load()) {
                auto last_access = entry->last_accessed.load();
                if (last_access < oldest_time) {
                    oldest_time = last_access;
                    oldest_id = id;
                }
            }
        }
        
        if (oldest_id != 0 && (now - oldest_time) > eviction_timeout_) {
            resource_cache_.erase(oldest_id);
            metrics_.evictions.fetch_add(1);
        }
    }
    
    void start_eviction_thread() {
        eviction_thread_ = std::thread([this]() {
            while (!should_stop_.load()) {
                std::unique_lock<std::mutex> lock(lru_mutex_);
                eviction_cv_.wait_for(lock, std::chrono::minutes(1));
                
                if (!should_stop_.load()) {
                    std::unique_lock<std::shared_mutex> resource_lock(resource_map_mutex_);
                    auto now = std::chrono::steady_clock::now();
                    
                    auto it = resource_cache_.begin();
                    while (it != resource_cache_.end()) {
                        const auto& entry = it->second;
                        
                        if (!entry->is_locked.load()) {
                            auto last_access = entry->last_accessed.load();
                            
                            if ((now - last_access) > eviction_timeout_) {
                                // Validate resource before evicting
                                if (!validator_ || !validator_(*entry->resource)) {
                                    it = resource_cache_.erase(it);
                                    metrics_.evictions.fetch_add(1);
                                    continue;
                                }
                            }
                        }
                        ++it;
                    }
                }
            }
        });
    }
};

// Multi-tenant Resource Isolation
template<typename ResourceType>
class MultiTenantResourceManager {
public:
    using TenantId = std::string;
    using ResourceSystemPtr = std::unique_ptr<EnterpriseResourceSystem<ResourceType>>;
    
private:
    std::unordered_map<TenantId, ResourceSystemPtr> tenant_systems_;
    std::shared_mutex tenants_mutex_;
    
    std::function<ResourceSystemPtr()> system_factory_;
    
public:
    MultiTenantResourceManager(std::function<ResourceSystemPtr()> factory)
        : system_factory_(std::move(factory)) {}
    
    auto acquire_resource(const TenantId& tenant, uint64_t resource_id) {
        std::shared_lock<std::shared_mutex> lock(tenants_mutex_);
        
        auto it = tenant_systems_.find(tenant);
        if (it == tenant_systems_.end()) {
            lock.unlock();
            std::unique_lock<std::shared_mutex> write_lock(tenants_mutex_);
            
            // Double-check pattern
            it = tenant_systems_.find(tenant);
            if (it == tenant_systems_.end()) {
                tenant_systems_[tenant] = system_factory_();
                it = tenant_systems_.find(tenant);
            }
            write_lock.unlock();
            lock.lock();
        }
        
        return it->second->acquire_resource(resource_id);
    }
    
    void remove_tenant(const TenantId& tenant) {
        std::unique_lock<std::shared_mutex> lock(tenants_mutex_);
        tenant_systems_.erase(tenant);
    }
    
    std::vector<TenantId> get_active_tenants() const {
        std::shared_lock<std::shared_mutex> lock(tenants_mutex_);
        std::vector<TenantId> tenants;
        tenants.reserve(tenant_systems_.size());
        
        for (const auto& [tenant_id, _] : tenant_systems_) {
            tenants.push_back(tenant_id);
        }
        
        return tenants;
    }
};`
    },
    
    'monitoring-debugging': {
      title: state.language === 'en' ? 'Enterprise Monitoring & Debugging' : 'Monitoreo y Debugging Empresarial',
      code: `#include <memory>
#include <string>
#include <vector>
#include <unordered_map>
#include <atomic>
#include <mutex>
#include <thread>
#include <chrono>
#include <functional>
#include <fstream>
#include <sstream>

// Enterprise Monitoring System
class EnterpriseMonitor {
public:
    enum class MetricType {
        Counter,
        Gauge,
        Histogram,
        Timer
    };
    
    struct MetricValue {
        MetricType type;
        std::atomic<double> value;
        std::atomic<uint64_t> count;
        std::chrono::system_clock::time_point timestamp;
        
        MetricValue(MetricType t, double initial_value = 0.0)
            : type(t)
            , value(initial_value)
            , count(0)
            , timestamp(std::chrono::system_clock::now()) {}
    };

private:
    std::unordered_map<std::string, std::unique_ptr<MetricValue>> metrics_;
    mutable std::shared_mutex metrics_mutex_;
    
    // Periodic reporting
    std::thread reporting_thread_;
    std::atomic<bool> should_stop_{false};
    std::chrono::seconds reporting_interval_;
    
    std::vector<std::function<void(const std::string&, const MetricValue&)>> reporters_;
    std::mutex reporters_mutex_;

public:
    EnterpriseMonitor(std::chrono::seconds interval = std::chrono::seconds(60))
        : reporting_interval_(interval) {
        start_reporting_thread();
    }
    
    ~EnterpriseMonitor() {
        should_stop_.store(true);
        if (reporting_thread_.joinable()) {
            reporting_thread_.join();
        }
    }
    
    void increment_counter(const std::string& name, double delta = 1.0) {
        std::unique_lock<std::shared_mutex> lock(metrics_mutex_);
        auto it = metrics_.find(name);
        
        if (it == metrics_.end()) {
            metrics_[name] = std::make_unique<MetricValue>(MetricType::Counter);
            it = metrics_.find(name);
        }
        
        it->second->value.fetch_add(delta);
        it->second->count.fetch_add(1);
        it->second->timestamp = std::chrono::system_clock::now();
    }
    
    void set_gauge(const std::string& name, double value) {
        std::unique_lock<std::shared_mutex> lock(metrics_mutex_);
        auto it = metrics_.find(name);
        
        if (it == metrics_.end()) {
            metrics_[name] = std::make_unique<MetricValue>(MetricType::Gauge);
            it = metrics_.find(name);
        }
        
        it->second->value.store(value);
        it->second->timestamp = std::chrono::system_clock::now();
    }
    
    class ScopedTimer {
    private:
        EnterpriseMonitor* monitor_;
        std::string metric_name_;
        std::chrono::high_resolution_clock::time_point start_time_;
        
    public:
        ScopedTimer(EnterpriseMonitor* monitor, std::string name)
            : monitor_(monitor)
            , metric_name_(std::move(name))
            , start_time_(std::chrono::high_resolution_clock::now()) {}
        
        ~ScopedTimer() {
            auto end_time = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::microseconds>(
                end_time - start_time_).count();
            monitor_->record_timing(metric_name_, static_cast<double>(duration));
        }
    };
    
    ScopedTimer time_operation(const std::string& name) {
        return ScopedTimer(this, name);
    }
    
    void record_timing(const std::string& name, double microseconds) {
        std::unique_lock<std::shared_mutex> lock(metrics_mutex_);
        auto it = metrics_.find(name);
        
        if (it == metrics_.end()) {
            metrics_[name] = std::make_unique<MetricValue>(MetricType::Timer);
            it = metrics_.find(name);
        }
        
        // Simple moving average for timing metrics
        auto old_value = it->second->value.load();
        auto old_count = it->second->count.load();
        auto new_count = old_count + 1;
        auto new_value = (old_value * old_count + microseconds) / new_count;
        
        it->second->value.store(new_value);
        it->second->count.store(new_count);
        it->second->timestamp = std::chrono::system_clock::now();
    }
    
    void add_reporter(std::function<void(const std::string&, const MetricValue&)> reporter) {
        std::lock_guard<std::mutex> lock(reporters_mutex_);
        reporters_.push_back(std::move(reporter));
    }
    
    double get_metric_value(const std::string& name) const {
        std::shared_lock<std::shared_mutex> lock(metrics_mutex_);
        auto it = metrics_.find(name);
        return (it != metrics_.end()) ? it->second->value.load() : 0.0;
    }

private:
    void start_reporting_thread() {
        reporting_thread_ = std::thread([this]() {
            while (!should_stop_.load()) {
                std::this_thread::sleep_for(reporting_interval_);
                
                if (!should_stop_.load()) {
                    report_metrics();
                }
            }
        });
    }
    
    void report_metrics() {
        std::shared_lock<std::shared_mutex> metrics_lock(metrics_mutex_);
        std::lock_guard<std::mutex> reporters_lock(reporters_mutex_);
        
        for (const auto& [name, metric] : metrics_) {
            for (const auto& reporter : reporters_) {
                reporter(name, *metric);
            }
        }
    }
};

// Smart Pointer Debugging Tools
template<typename T>
class DebuggableSharedPtr {
private:
    std::shared_ptr<T> ptr_;
    static std::atomic<uint64_t> next_id_;
    uint64_t id_;
    std::string debug_name_;
    
    struct DebugInfo {
        uint64_t id;
        std::string name;
        std::string creation_stack;
        std::chrono::system_clock::time_point creation_time;
        mutable std::atomic<size_t> access_count;
        
        DebugInfo(uint64_t i, std::string n)
            : id(i), name(std::move(n))
            , creation_time(std::chrono::system_clock::now())
            , access_count(0) {}
    };
    
    static std::unordered_map<uint64_t, std::shared_ptr<DebugInfo>>& get_debug_registry() {
        static std::unordered_map<uint64_t, std::shared_ptr<DebugInfo>> registry;
        return registry;
    }
    
    static std::mutex& get_debug_mutex() {
        static std::mutex mutex;
        return mutex;
    }

public:
    template<typename... Args>
    explicit DebuggableSharedPtr(std::string debug_name, Args&&... args)
        : ptr_(std::make_shared<T>(std::forward<Args>(args)...))
        , id_(next_id_.fetch_add(1))
        , debug_name_(std::move(debug_name)) {
        
        register_debug_info();
    }
    
    DebuggableSharedPtr(const DebuggableSharedPtr& other)
        : ptr_(other.ptr_)
        , id_(other.id_)
        , debug_name_(other.debug_name_) {
        record_access();
    }
    
    ~DebuggableSharedPtr() {
        unregister_debug_info();
    }
    
    T& operator*() const {
        record_access();
        return *ptr_;
    }
    
    T* operator->() const {
        record_access();
        return ptr_.get();
    }
    
    T* get() const {
        record_access();
        return ptr_.get();
    }
    
    size_t use_count() const {
        return ptr_.use_count();
    }
    
    uint64_t debug_id() const { return id_; }
    const std::string& debug_name() const { return debug_name_; }
    
    static void print_debug_summary() {
        std::lock_guard<std::mutex> lock(get_debug_mutex());
        auto& registry = get_debug_registry();
        
        printf("=== Smart Pointer Debug Summary ===\\n");
        printf("Total active pointers: %zu\\n", registry.size());
        
        for (const auto& [id, info] : registry) {
            printf("ID: %lu, Name: %s, Access Count: %zu\\n",
                   info->id, info->name.c_str(), info->access_count.load());
        }
    }
    
    static std::vector<std::pair<uint64_t, size_t>> get_access_stats() {
        std::lock_guard<std::mutex> lock(get_debug_mutex());
        auto& registry = get_debug_registry();
        
        std::vector<std::pair<uint64_t, size_t>> stats;
        stats.reserve(registry.size());
        
        for (const auto& [id, info] : registry) {
            stats.emplace_back(id, info->access_count.load());
        }
        
        return stats;
    }

private:
    void register_debug_info() {
        auto info = std::make_shared<DebugInfo>(id_, debug_name_);
        
        std::lock_guard<std::mutex> lock(get_debug_mutex());
        get_debug_registry()[id_] = std::move(info);
    }
    
    void unregister_debug_info() {
        if (ptr_.use_count() == 1) {
            std::lock_guard<std::mutex> lock(get_debug_mutex());
            get_debug_registry().erase(id_);
        }
    }
    
    void record_access() const {
        std::lock_guard<std::mutex> lock(get_debug_mutex());
        auto& registry = get_debug_registry();
        auto it = registry.find(id_);
        if (it != registry.end()) {
            it->second->access_count.fetch_add(1);
        }
    }
};

template<typename T>
std::atomic<uint64_t> DebuggableSharedPtr<T>::next_id_{1};

// Memory Leak Detection System
class MemoryLeakDetector {
private:
    struct AllocationInfo {
        size_t size;
        std::string file;
        int line;
        std::chrono::system_clock::time_point timestamp;
        
        AllocationInfo(size_t s, std::string f, int l)
            : size(s), file(std::move(f)), line(l)
            , timestamp(std::chrono::system_clock::now()) {}
    };
    
    static std::unordered_map<void*, AllocationInfo>& get_allocations() {
        static std::unordered_map<void*, AllocationInfo> allocations;
        return allocations;
    }
    
    static std::mutex& get_mutex() {
        static std::mutex mutex;
        return mutex;
    }
    
    static std::atomic<size_t> total_allocated_;
    static std::atomic<size_t> total_freed_;

public:
    static void record_allocation(void* ptr, size_t size, const char* file, int line) {
        std::lock_guard<std::mutex> lock(get_mutex());
        get_allocations().emplace(ptr, AllocationInfo(size, file, line));
        total_allocated_.fetch_add(size);
    }
    
    static void record_deallocation(void* ptr) {
        std::lock_guard<std::mutex> lock(get_mutex());
        auto& allocations = get_allocations();
        auto it = allocations.find(ptr);
        
        if (it != allocations.end()) {
            total_freed_.fetch_add(it->second.size);
            allocations.erase(it);
        }
    }
    
    static void print_leak_report() {
        std::lock_guard<std::mutex> lock(get_mutex());
        auto& allocations = get_allocations();
        
        printf("=== Memory Leak Report ===\\n");
        printf("Total Allocated: %zu bytes\\n", total_allocated_.load());
        printf("Total Freed: %zu bytes\\n", total_freed_.load());
        printf("Current Leaks: %zu allocations\\n", allocations.size());
        
        size_t leaked_bytes = 0;
        for (const auto& [ptr, info] : allocations) {
            leaked_bytes += info.size;
            printf("Leak: %p (%zu bytes) at %s:%d\\n", 
                   ptr, info.size, info.file.c_str(), info.line);
        }
        
        printf("Total Leaked: %zu bytes\\n", leaked_bytes);
    }
    
    static size_t get_current_leaks() {
        std::lock_guard<std::mutex> lock(get_mutex());
        return get_allocations().size();
    }
};

std::atomic<size_t> MemoryLeakDetector::total_allocated_{0};
std::atomic<size_t> MemoryLeakDetector::total_freed_{0};

#define TRACKED_NEW(size) MemoryLeakDetector::record_allocation(malloc(size), size, __FILE__, __LINE__)
#define TRACKED_DELETE(ptr) MemoryLeakDetector::record_deallocation(ptr); free(ptr)`
    }
  };

  const currentExample = examples[activeExample as keyof typeof examples];

  const handleSystemClick = (systemName: string) => {
    setSelectedSystem(systemName);
    
    // Update metrics based on selected system
    switch (systemName) {
      case 'Memory Manager':
        setMetrics({
          throughput: 0.92,
          memoryEfficiency: 0.95,
          errorHandling: 0.88,
          scalability: 0.85,
          monitoring: 0.90
        });
        break;
      case 'Resource Pool':
        setMetrics({
          throughput: 0.88,
          memoryEfficiency: 0.85,
          errorHandling: 0.92,
          scalability: 0.98,
          monitoring: 0.87
        });
        break;
      case 'Error Handler':
        setMetrics({
          throughput: 0.85,
          memoryEfficiency: 0.80,
          errorHandling: 0.99,
          scalability: 0.82,
          monitoring: 0.95
        });
        break;
      case 'Monitor System':
        setMetrics({
          throughput: 0.90,
          memoryEfficiency: 0.88,
          errorHandling: 0.94,
          scalability: 0.88,
          monitoring: 0.99
        });
        break;
      default:
        setMetrics({
          throughput: 0.95,
          memoryEfficiency: 0.88,
          errorHandling: 0.92,
          scalability: 0.85,
          monitoring: 0.90
        });
    }
  };

  return (
    <div className="lesson-container">
      <header className="lesson-header">
        <h1>{state.language === 'en' ? 'Lesson 110: Enterprise Patterns Capstone' : 'Lección 110: Capstone de Patrones Empresariales'}</h1>
        <p className="lesson-description">
          {state.language === 'en' 
            ? 'Master enterprise-level C++ patterns for production systems, integrating memory management, RAII, performance optimization, error handling, scalability, and comprehensive monitoring.'
            : 'Domina patrones C++ de nivel empresarial para sistemas de producción, integrando gestión de memoria, RAII, optimización de rendimiento, manejo de errores, escalabilidad y monitoreo integral.'}
        </p>
      </header>

      <div className="lesson-content">
        <div className="visualization-section">
          <h3>{state.language === 'en' ? 'Enterprise Architecture Visualization' : 'Visualización de Arquitectura Empresarial'}</h3>
          <div className="canvas-container" style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '20px' }}>
            <Canvas camera={{ position: [8, 8, 8] }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />
              <EnterpriseArchitectureVisualization 
                metrics={metrics}
                activeSystem={selectedSystem}
              />
            </Canvas>
          </div>
          
          <div className="system-controls">
            <h4>{state.language === 'en' ? 'Enterprise Systems' : 'Sistemas Empresariales'}</h4>
            <div className="system-buttons">
              {['Memory Manager', 'Resource Pool', 'Error Handler', 'Monitor System', 'Core Engine'].map(system => (
                <button
                  key={system}
                  className={`system-button ${selectedSystem === system ? 'active' : ''}`}
                  onClick={() => handleSystemClick(system)}
                >
                  {system}
                </button>
              ))}
            </div>
          </div>
          
          <div className="metrics-display">
            <h4>{state.language === 'en' ? 'System Metrics' : 'Métricas del Sistema'}</h4>
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Throughput' : 'Rendimiento'}:</span>
                <span className="metric-value">{(metrics.throughput * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Memory Efficiency' : 'Eficiencia de Memoria'}:</span>
                <span className="metric-value">{(metrics.memoryEfficiency * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Error Handling' : 'Manejo de Errores'}:</span>
                <span className="metric-value">{(metrics.errorHandling * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Scalability' : 'Escalabilidad'}:</span>
                <span className="metric-value">{(metrics.scalability * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Monitoring' : 'Monitoreo'}:</span>
                <span className="metric-value">{(metrics.monitoring * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Enterprise Pattern Examples' : 'Ejemplos de Patrones Empresariales'}</h3>
          
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
              <h4>{currentExample.title}</h4>
              <pre>
                <code>{currentExample.code}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="best-practices-section">
          <h3>{state.language === 'en' ? 'Enterprise Best Practices' : 'Mejores Prácticas Empresariales'}</h3>
          
          <div className="practices-grid">
            <div className="practice-card">
              <h4>{state.language === 'en' ? 'Memory Management' : 'Gestión de Memoria'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Thread-safe memory pools' : 'Pools de memoria thread-safe'}</li>
                <li>{state.language === 'en' ? 'Automatic coalescing' : 'Coalescencia automática'}</li>
                <li>{state.language === 'en' ? 'Peak usage tracking' : 'Seguimiento de uso pico'}</li>
                <li>{state.language === 'en' ? 'Alignment optimization' : 'Optimización de alineación'}</li>
              </ul>
            </div>
            
            <div className="practice-card">
              <h4>{state.language === 'en' ? 'RAII Patterns' : 'Patrones RAII'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Automatic resource cleanup' : 'Limpieza automática de recursos'}</li>
                <li>{state.language === 'en' ? 'Exception safety guarantees' : 'Garantías de seguridad ante excepciones'}</li>
                <li>{state.language === 'en' ? 'Transaction-based operations' : 'Operaciones basadas en transacciones'}</li>
                <li>{state.language === 'en' ? 'Lock-free resource leasing' : 'Arrendamiento de recursos sin bloqueos'}</li>
              </ul>
            </div>
            
            <div className="practice-card">
              <h4>{state.language === 'en' ? 'Performance' : 'Rendimiento'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Intrusive smart pointers' : 'Smart pointers intrusivos'}</li>
                <li>{state.language === 'en' ? 'Lock-free object pools' : 'Pools de objetos sin bloqueos'}</li>
                <li>{state.language === 'en' ? 'Performance monitoring' : 'Monitoreo de rendimiento'}</li>
                <li>{state.language === 'en' ? 'Cache-friendly algorithms' : 'Algoritmos amigables con caché'}</li>
              </ul>
            </div>
            
            <div className="practice-card">
              <h4>{state.language === 'en' ? 'Error Handling' : 'Manejo de Errores'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Structured error contexts' : 'Contextos de error estructurados'}</li>
                <li>{state.language === 'en' ? 'Thread-safe error logging' : 'Logging de errores thread-safe'}</li>
                <li>{state.language === 'en' ? 'Exception hierarchies' : 'Jerarquías de excepciones'}</li>
                <li>{state.language === 'en' ? 'Critical error handling' : 'Manejo de errores críticos'}</li>
              </ul>
            </div>
            
            <div className="practice-card">
              <h4>{state.language === 'en' ? 'Scalability' : 'Escalabilidad'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Multi-tenant isolation' : 'Aislamiento multi-tenante'}</li>
                <li>{state.language === 'en' ? 'Automatic resource eviction' : 'Desalojo automático de recursos'}</li>
                <li>{state.language === 'en' ? 'Load balancing patterns' : 'Patrones de balanceeo de carga'}</li>
                <li>{state.language === 'en' ? 'Horizontal scaling support' : 'Soporte para escalado horizontal'}</li>
              </ul>
            </div>
            
            <div className="practice-card">
              <h4>{state.language === 'en' ? 'Monitoring' : 'Monitoreo'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Real-time metrics collection' : 'Recolección de métricas en tiempo real'}</li>
                <li>{state.language === 'en' ? 'Memory leak detection' : 'Detección de fugas de memoria'}</li>
                <li>{state.language === 'en' ? 'Performance profiling tools' : 'Herramientas de profiling de rendimiento'}</li>
                <li>{state.language === 'en' ? 'Automated reporting systems' : 'Sistemas de reporte automatizados'}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="expert-insights-section">
          <h3>{state.language === 'en' ? 'Expert Insights' : 'Conocimientos Expertos'}</h3>
          
          <div className="insights-content">
            <div className="insight-item">
              <h4>{state.language === 'en' ? 'Production Considerations' : 'Consideraciones de Producción'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Enterprise systems require careful balance between performance, reliability, and maintainability. Memory management must be predictable, error handling comprehensive, and monitoring continuous.'
                  : 'Los sistemas empresariales requieren un equilibrio cuidadoso entre rendimiento, confiabilidad y mantenibilidad. La gestión de memoria debe ser predecible, el manejo de errores integral y el monitoreo continuo.'}
              </p>
            </div>
            
            <div className="insight-item">
              <h4>{state.language === 'en' ? 'Scalability Architecture' : 'Arquitectura de Escalabilidad'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Design for horizontal scaling from day one. Use resource pools, multi-tenant isolation, and stateless patterns. Avoid global state and ensure thread safety throughout.'
                  : 'Diseña para escalado horizontal desde el primer día. Usa pools de recursos, aislamiento multi-tenante y patrones sin estado. Evita el estado global y asegura thread safety en todo el sistema.'}
              </p>
            </div>
            
            <div className="insight-item">
              <h4>{state.language === 'en' ? 'Performance Optimization' : 'Optimización de Rendimiento'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Profile first, optimize second. Focus on cache efficiency, reduce memory allocations, and use lock-free algorithms where possible. Monitor continuously and respond to metrics.'
                  : 'Primero perfila, después optimiza. Enfócate en eficiencia de caché, reduce asignaciones de memoria y usa algoritmos sin bloqueos donde sea posible. Monitorea continuamente y responde a las métricas.'}
              </p>
            </div>
            
            <div className="insight-item">
              <h4>{state.language === 'en' ? 'Error Resilience' : 'Resistencia a Errores'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Build systems that gracefully handle failures. Use RAII for automatic cleanup, implement circuit breakers, and provide detailed error contexts for debugging.'
                  : 'Construye sistemas que manejen fallos con elegancia. Usa RAII para limpieza automática, implementa circuit breakers y proporciona contextos de error detallados para debugging.'}
              </p>
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

        .system-controls {
          margin-bottom: 20px;
        }

        .system-controls h4 {
          margin-bottom: 10px;
          color: #34495e;
        }

        .system-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .system-button {
          padding: 8px 16px;
          border: 2px solid #3498db;
          background: white;
          color: #3498db;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .system-button:hover {
          background: #3498db;
          color: white;
        }

        .system-button.active {
          background: #3498db;
          color: white;
        }

        .metrics-display {
          margin-top: 20px;
        }

        .metrics-display h4 {
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
          border-left: 4px solid #3498db;
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
          background: #3498db;
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

        .best-practices-section {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .best-practices-section h3 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .practices-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .practice-card {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #e74c3c;
        }

        .practice-card h4 {
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .practice-card ul {
          list-style: none;
          padding: 0;
        }

        .practice-card li {
          padding: 5px 0;
          position: relative;
          padding-left: 20px;
        }

        .practice-card li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #27ae60;
          font-weight: bold;
        }

        .expert-insights-section {
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .expert-insights-section h3 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .insights-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .insight-item {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #9b59b6;
        }

        .insight-item h4 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .insight-item p {
          color: #5d6d7e;
          line-height: 1.6;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default Lesson110_EnterprisePatternsCapstone;