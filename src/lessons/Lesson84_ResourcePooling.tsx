/**
 * Lesson 84: Advanced Resource Pooling Patterns
 * Expert-level resource management for high-performance systems
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
  PerformanceComparison
} from '../design-system';

interface ResourcePoolState {
  language: 'en' | 'es';
  scenario: 'object_pools' | 'connection_pools' | 'thread_pools' | 'memory_pools';
  isAnimating: boolean;
  activeResources: number;
  poolUtilization: number;
  recycleRate: number;
  cacheHits: number;
}

// 3D Visualización de Resource Pooling
const ResourcePoolVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'object_pools') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        activeResources: Math.floor(10 + Math.sin(animationRef.current * 2) * 8),
        poolUtilization: 70 + Math.cos(animationRef.current) * 25,
        recycleRate: Math.floor(animationRef.current * 20) % 100,
        cacheHits: 85 + Math.sin(animationRef.current * 1.5) * 12
      });
    } else if (scenario === 'thread_pools') {
      groupRef.current.rotation.x = Math.sin(animationRef.current) * 0.15;
      onMetrics({
        activeResources: Math.floor(8 + Math.cos(animationRef.current * 3) * 6),
        poolUtilization: 60 + Math.sin(animationRef.current * 2) * 30,
        recycleRate: Math.floor(animationRef.current * 25) % 150,
        cacheHits: 90 + Math.cos(animationRef.current) * 8
      });
    }
  });

  const renderPoolResources = () => {
    const elements = [];
    const resourceCount = scenario === 'memory_pools' ? 24 : 16;
    
    for (let i = 0; i < resourceCount; i++) {
      let x, y, z;
      
      if (scenario === 'object_pools') {
        const angle = (i / resourceCount) * Math.PI * 2;
        const radius = 2.0 + (i % 3) * 0.3;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = 0;
      } else if (scenario === 'connection_pools') {
        x = (i % 4) * 1.2 - 1.8;
        y = Math.floor(i / 4) * 1.2 - 1.8;
        z = Math.sin(i * 0.5) * 0.3;
      } else if (scenario === 'thread_pools') {
        const row = Math.floor(i / 4);
        const col = i % 4;
        x = col * 1.0 - 1.5;
        y = row * 1.0 - 1.5;
        z = Math.cos(animationRef.current + i * 0.2) * 0.2;
      } else {
        // Memory pools - grid layout
        const row = Math.floor(i / 6);
        const col = i % 6;
        x = col * 0.7 - 1.75;
        y = row * 0.7 - 1.4;
        z = 0;
      }
      
      const color = scenario === 'object_pools'
        ? (i % 3 === 0 ? '#00ff00' : i % 3 === 1 ? '#ffff00' : '#ff8000')
        : scenario === 'connection_pools'
        ? (i % 2 === 0 ? '#0080ff' : '#8080ff')
        : scenario === 'thread_pools'
        ? '#ff0080'
        : '#ffffff';
      
      elements.push(
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
    
    return elements;
  };

  return (
    <group ref={groupRef}>
      {renderPoolResources()}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, 5]} intensity={0.5} />
    </group>
  );
};

const Lesson84_ResourcePooling: React.FC = () => {
  const [state, setState] = useState<ResourcePoolState>({
    language: 'en',
    scenario: 'object_pools',
    isAnimating: false,
    activeResources: 0,
    poolUtilization: 0,
    recycleRate: 0,
    cacheHits: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: ResourcePoolState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      object_pools: state.language === 'en' ? 'Object Pools' : 'Pools de Objetos',
      connection_pools: state.language === 'en' ? 'Connection Pools' : 'Pools de Conexión',
      thread_pools: state.language === 'en' ? 'Thread Pools' : 'Pools de Hilos',
      memory_pools: state.language === 'en' ? 'Memory Pools' : 'Pools de Memoria'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    object_pools: `// Advanced Object Pool Implementation
#include <memory>
#include <vector>
#include <queue>
#include <mutex>
#include <atomic>
#include <functional>
#include <chrono>

template<typename T>
class ObjectPool {
private:
    mutable std::mutex mutex_;
    std::queue<std::unique_ptr<T>> available_objects_;
    std::atomic<size_t> total_objects_{0};
    std::atomic<size_t> active_objects_{0};
    size_t max_size_;
    std::function<std::unique_ptr<T>()> factory_;
    std::function<void(T&)> reset_func_;
    
public:
    ObjectPool(size_t initial_size, size_t max_size, 
               std::function<std::unique_ptr<T>()> factory,
               std::function<void(T&)> reset_func = [](T&){})
        : max_size_(max_size), factory_(std::move(factory)), reset_func_(std::move(reset_func)) {
        
        // Pre-allocate initial objects
        std::lock_guard<std::mutex> lock(mutex_);
        for (size_t i = 0; i < initial_size; ++i) {
            available_objects_.push(factory_());
            total_objects_++;
        }
    }
    
    class PooledObject {
    private:
        std::unique_ptr<T> object_;
        ObjectPool<T>* pool_;
        
    public:
        PooledObject(std::unique_ptr<T> obj, ObjectPool<T>* pool)
            : object_(std::move(obj)), pool_(pool) {}
        
        ~PooledObject() {
            if (object_ && pool_) {
                pool_->return_object(std::move(object_));
            }
        }
        
        PooledObject(const PooledObject&) = delete;
        PooledObject& operator=(const PooledObject&) = delete;
        
        PooledObject(PooledObject&& other) noexcept
            : object_(std::move(other.object_)), pool_(other.pool_) {
            other.pool_ = nullptr;
        }
        
        T& operator*() { return *object_; }
        T* operator->() { return object_.get(); }
        T* get() { return object_.get(); }
    };
    
    PooledObject acquire() {
        std::lock_guard<std::mutex> lock(mutex_);
        
        std::unique_ptr<T> object;
        
        if (!available_objects_.empty()) {
            object = std::move(available_objects_.front());
            available_objects_.pop();
        } else if (total_objects_ < max_size_) {
            object = factory_();
            total_objects_++;
        } else {
            throw std::runtime_error("Pool exhausted");
        }
        
        if (object) {
            reset_func_(*object);
            active_objects_++;
        }
        
        return PooledObject(std::move(object), this);
    }
    
    void return_object(std::unique_ptr<T> obj) {
        std::lock_guard<std::mutex> lock(mutex_);
        available_objects_.push(std::move(obj));
        active_objects_--;
    }
    
    size_t total_objects() const { return total_objects_; }
    size_t active_objects() const { return active_objects_; }
    size_t available_objects() const { 
        std::lock_guard<std::mutex> lock(mutex_);
        return available_objects_.size(); 
    }
    
    double utilization() const {
        return static_cast<double>(active_objects_) / total_objects_;
    }
};

// Example usage with expensive objects
class ExpensiveResource {
private:
    std::vector<double> data_;
    std::chrono::steady_clock::time_point created_at_;
    
public:
    ExpensiveResource() : data_(10000), created_at_(std::chrono::steady_clock::now()) {
        std::cout << "Creating expensive resource...\\n";
        std::this_thread::sleep_for(std::chrono::milliseconds(10)); // Simulate expensive creation
        std::iota(data_.begin(), data_.end(), 0.0);
    }
    
    void reset() {
        std::fill(data_.begin(), data_.end(), 0.0);
        created_at_ = std::chrono::steady_clock::now();
    }
    
    void process(double value) {
        for (auto& d : data_) {
            d += value;
        }
    }
    
    double sum() const {
        return std::accumulate(data_.begin(), data_.end(), 0.0);
    }
    
    auto age() const {
        return std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::steady_clock::now() - created_at_).count();
    }
};

void demonstrate_object_pool() {
    auto factory = []() { return std::make_unique<ExpensiveResource>(); };
    auto reset_func = [](ExpensiveResource& res) { res.reset(); };
    
    ObjectPool<ExpensiveResource> pool(5, 20, factory, reset_func);
    
    std::cout << "Initial pool stats:\\n";
    std::cout << "Total: " << pool.total_objects() << "\\n";
    std::cout << "Active: " << pool.active_objects() << "\\n";
    std::cout << "Available: " << pool.available_objects() << "\\n";
    
    // Acquire and use resources
    std::vector<ObjectPool<ExpensiveResource>::PooledObject> resources;
    
    for (int i = 0; i < 10; ++i) {
        try {
            auto resource = pool.acquire();
            resource->process(i * 10.0);
            std::cout << "Resource " << i << " sum: " << resource->sum() << "\\n";
            resources.push_back(std::move(resource));
        } catch (const std::exception& e) {
            std::cout << "Pool exhausted: " << e.what() << "\\n";
            break;
        }
    }
    
    std::cout << "After acquisition:\\n";
    std::cout << "Utilization: " << pool.utilization() * 100 << "%\\n";
    
    // Resources automatically returned when destroyed
    resources.clear();
    
    std::cout << "After return:\\n";
    std::cout << "Active: " << pool.active_objects() << "\\n";
    std::cout << "Available: " << pool.available_objects() << "\\n";
}`,

    connection_pools: `// Database Connection Pool Implementation
#include <memory>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <thread>
#include <atomic>
#include <string>

class DatabaseConnection {
private:
    std::string connection_string_;
    bool is_connected_;
    std::chrono::steady_clock::time_point last_used_;
    std::atomic<bool> in_transaction_{false};
    
public:
    DatabaseConnection(const std::string& conn_str) 
        : connection_string_(conn_str), is_connected_(false) {
        connect();
    }
    
    ~DatabaseConnection() {
        disconnect();
    }
    
    void connect() {
        std::this_thread::sleep_for(std::chrono::milliseconds(100)); // Simulate connection time
        is_connected_ = true;
        last_used_ = std::chrono::steady_clock::now();
        std::cout << "Connected to database: " << connection_string_ << "\\n";
    }
    
    void disconnect() {
        if (is_connected_) {
            is_connected_ = false;
            std::cout << "Disconnected from database\\n";
        }
    }
    
    bool is_connected() const { return is_connected_; }
    
    void execute_query(const std::string& query) {
        if (!is_connected_) throw std::runtime_error("Not connected");
        
        last_used_ = std::chrono::steady_clock::now();
        std::this_thread::sleep_for(std::chrono::milliseconds(10)); // Simulate query time
        std::cout << "Executed: " << query << "\\n";
    }
    
    void begin_transaction() {
        if (in_transaction_) throw std::runtime_error("Already in transaction");
        in_transaction_ = true;
        execute_query("BEGIN TRANSACTION");
    }
    
    void commit_transaction() {
        if (!in_transaction_) throw std::runtime_error("Not in transaction");
        execute_query("COMMIT");
        in_transaction_ = false;
    }
    
    void rollback_transaction() {
        if (!in_transaction_) throw std::runtime_error("Not in transaction");
        execute_query("ROLLBACK");
        in_transaction_ = false;
    }
    
    bool is_stale(std::chrono::seconds max_age) const {
        return std::chrono::steady_clock::now() - last_used_ > max_age;
    }
    
    bool in_transaction() const { return in_transaction_; }
};

class ConnectionPool {
private:
    mutable std::mutex mutex_;
    std::condition_variable condition_;
    std::queue<std::unique_ptr<DatabaseConnection>> available_connections_;
    std::string connection_string_;
    size_t min_connections_;
    size_t max_connections_;
    std::atomic<size_t> active_connections_{0};
    std::atomic<size_t> total_connections_{0};
    std::chrono::seconds connection_timeout_;
    std::chrono::seconds max_connection_age_;
    std::thread cleanup_thread_;
    std::atomic<bool> shutdown_{false};
    
    void cleanup_stale_connections() {
        while (!shutdown_) {
            std::this_thread::sleep_for(std::chrono::seconds(30));
            
            std::unique_lock<std::mutex> lock(mutex_);
            
            std::queue<std::unique_ptr<DatabaseConnection>> fresh_connections;
            
            while (!available_connections_.empty()) {
                auto conn = std::move(available_connections_.front());
                available_connections_.pop();
                
                if (!conn->is_stale(max_connection_age_) && conn->is_connected()) {
                    fresh_connections.push(std::move(conn));
                } else {
                    total_connections_--;
                    std::cout << "Cleaned up stale connection\\n";
                }
            }
            
            available_connections_ = std::move(fresh_connections);
            
            // Maintain minimum connections
            while (available_connections_.size() + active_connections_ < min_connections_) {
                if (total_connections_ < max_connections_) {
                    available_connections_.push(
                        std::make_unique<DatabaseConnection>(connection_string_));
                    total_connections_++;
                }
            }
        }
    }
    
public:
    ConnectionPool(const std::string& conn_str, size_t min_conn, size_t max_conn,
                   std::chrono::seconds timeout = std::chrono::seconds(30),
                   std::chrono::seconds max_age = std::chrono::seconds(3600))
        : connection_string_(conn_str), min_connections_(min_conn), 
          max_connections_(max_conn), connection_timeout_(timeout), 
          max_connection_age_(max_age) {
        
        // Initialize minimum connections
        std::lock_guard<std::mutex> lock(mutex_);
        for (size_t i = 0; i < min_connections_; ++i) {
            available_connections_.push(
                std::make_unique<DatabaseConnection>(connection_string_));
            total_connections_++;
        }
        
        cleanup_thread_ = std::thread(&ConnectionPool::cleanup_stale_connections, this);
    }
    
    ~ConnectionPool() {
        shutdown_ = true;
        condition_.notify_all();
        if (cleanup_thread_.joinable()) {
            cleanup_thread_.join();
        }
    }
    
    class PooledConnection {
    private:
        std::unique_ptr<DatabaseConnection> connection_;
        ConnectionPool* pool_;
        
    public:
        PooledConnection(std::unique_ptr<DatabaseConnection> conn, ConnectionPool* pool)
            : connection_(std::move(conn)), pool_(pool) {}
        
        ~PooledConnection() {
            if (connection_ && pool_) {
                // Rollback any open transaction before returning
                if (connection_->in_transaction()) {
                    try {
                        connection_->rollback_transaction();
                    } catch (...) {
                        // Log error but don't throw from destructor
                    }
                }
                pool_->return_connection(std::move(connection_));
            }
        }
        
        PooledConnection(const PooledConnection&) = delete;
        PooledConnection& operator=(const PooledConnection&) = delete;
        
        PooledConnection(PooledConnection&& other) noexcept
            : connection_(std::move(other.connection_)), pool_(other.pool_) {
            other.pool_ = nullptr;
        }
        
        DatabaseConnection& operator*() { return *connection_; }
        DatabaseConnection* operator->() { return connection_.get(); }
    };
    
    PooledConnection acquire_connection() {
        std::unique_lock<std::mutex> lock(mutex_);
        
        // Wait for available connection or timeout
        bool acquired = condition_.wait_for(lock, connection_timeout_, [this] {
            return !available_connections_.empty() || total_connections_ < max_connections_;
        });
        
        if (!acquired) {
            throw std::runtime_error("Connection pool timeout");
        }
        
        std::unique_ptr<DatabaseConnection> conn;
        
        if (!available_connections_.empty()) {
            conn = std::move(available_connections_.front());
            available_connections_.pop();
        } else if (total_connections_ < max_connections_) {
            conn = std::make_unique<DatabaseConnection>(connection_string_);
            total_connections_++;
        }
        
        if (!conn) {
            throw std::runtime_error("Unable to acquire connection");
        }
        
        // Verify connection is still valid
        if (!conn->is_connected()) {
            conn->connect();
        }
        
        active_connections_++;
        return PooledConnection(std::move(conn), this);
    }
    
    void return_connection(std::unique_ptr<DatabaseConnection> conn) {
        std::lock_guard<std::mutex> lock(mutex_);
        available_connections_.push(std::move(conn));
        active_connections_--;
        condition_.notify_one();
    }
    
    size_t total_connections() const { return total_connections_; }
    size_t active_connections() const { return active_connections_; }
    size_t available_connections() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return available_connections_.size();
    }
};

void demonstrate_connection_pool() {
    ConnectionPool pool("postgresql://localhost/testdb", 2, 10);
    
    std::cout << "=== Connection Pool Demonstration ===\\n";
    std::cout << "Initial pool stats:\\n";
    std::cout << "Total: " << pool.total_connections() << "\\n";
    std::cout << "Available: " << pool.available_connections() << "\\n";
    
    // Simulate concurrent database operations
    std::vector<std::thread> workers;
    
    for (int i = 0; i < 5; ++i) {
        workers.emplace_back([&pool, i] {
            try {
                auto conn = pool.acquire_connection();
                std::cout << "Worker " << i << " acquired connection\\n";
                
                conn->begin_transaction();
                conn->execute_query("INSERT INTO users VALUES (1, 'John')");
                conn->execute_query("UPDATE users SET name = 'Jane' WHERE id = 1");
                
                if (i % 2 == 0) {
                    conn->commit_transaction();
                    std::cout << "Worker " << i << " committed transaction\\n";
                } else {
                    conn->rollback_transaction();
                    std::cout << "Worker " << i << " rolled back transaction\\n";
                }
                
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                
            } catch (const std::exception& e) {
                std::cout << "Worker " << i << " error: " << e.what() << "\\n";
            }
        });
    }
    
    // Wait for all workers to complete
    for (auto& worker : workers) {
        worker.join();
    }
    
    std::cout << "Final pool stats:\\n";
    std::cout << "Active: " << pool.active_connections() << "\\n";
    std::cout << "Available: " << pool.available_connections() << "\\n";
}`,

    thread_pools: `// Advanced Thread Pool Implementation
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <future>
#include <functional>
#include <atomic>
#include <vector>
#include <chrono>

class ThreadPool {
private:
    std::vector<std::thread> workers_;
    std::queue<std::function<void()>> task_queue_;
    mutable std::mutex queue_mutex_;
    std::condition_variable condition_;
    std::atomic<bool> stop_{false};
    std::atomic<size_t> active_threads_{0};
    std::atomic<size_t> completed_tasks_{0};
    std::atomic<size_t> total_tasks_{0};
    
    // Dynamic sizing parameters
    std::atomic<size_t> min_threads_;
    std::atomic<size_t> max_threads_;
    std::chrono::seconds idle_timeout_;
    std::thread monitor_thread_;
    
    void worker_thread(bool is_core_thread = true) {
        while (true) {
            std::function<void()> task;
            
            {
                std::unique_lock<std::mutex> lock(queue_mutex_);
                
                auto wait_time = is_core_thread ? 
                    std::chrono::seconds::max() : idle_timeout_;
                
                bool has_task = condition_.wait_for(lock, wait_time, [this] {
                    return stop_ || !task_queue_.empty();
                });
                
                if (stop_ || (!has_task && !is_core_thread)) {
                    return; // Exit thread
                }
                
                if (task_queue_.empty()) {
                    continue; // Spurious wakeup
                }
                
                task = std::move(task_queue_.front());
                task_queue_.pop();
                active_threads_++;
            }
            
            try {
                task();
                completed_tasks_++;
            } catch (...) {
                // Log error but don't crash thread
            }
            
            active_threads_--;
        }
    }
    
    void monitor_threads() {
        while (!stop_) {
            std::this_thread::sleep_for(std::chrono::seconds(10));
            
            size_t queue_size;
            {
                std::lock_guard<std::mutex> lock(queue_mutex_);
                queue_size = task_queue_.size();
            }
            
            size_t current_threads = workers_.size();
            size_t active = active_threads_.load();
            
            // Scale up if queue is building up
            if (queue_size > current_threads && current_threads < max_threads_) {
                std::lock_guard<std::mutex> lock(queue_mutex_);
                workers_.emplace_back(&ThreadPool::worker_thread, this, false);
                std::cout << "Scaled up to " << workers_.size() << " threads\\n";
            }
            
            // Note: Scale down is handled by idle timeout in worker threads
            std::cout << "Pool stats - Threads: " << current_threads 
                      << ", Active: " << active << ", Queue: " << queue_size << "\\n";
        }
    }
    
public:
    ThreadPool(size_t min_threads = 2, size_t max_threads = 8, 
               std::chrono::seconds idle_timeout = std::chrono::seconds(60))
        : min_threads_(min_threads), max_threads_(max_threads), 
          idle_timeout_(idle_timeout) {
        
        // Start core threads
        for (size_t i = 0; i < min_threads_; ++i) {
            workers_.emplace_back(&ThreadPool::worker_thread, this, true);
        }
        
        monitor_thread_ = std::thread(&ThreadPool::monitor_threads, this);
    }
    
    ~ThreadPool() {
        stop_ = true;
        condition_.notify_all();
        
        for (auto& worker : workers_) {
            if (worker.joinable()) {
                worker.join();
            }
        }
        
        if (monitor_thread_.joinable()) {
            monitor_thread_.join();
        }
    }
    
    template<typename F, typename... Args>
    auto enqueue(F&& f, Args&&... args) 
        -> std::future<typename std::result_of<F(Args...)>::type> {
        
        using return_type = typename std::result_of<F(Args...)>::type;
        
        auto task = std::make_shared<std::packaged_task<return_type()>>(
            std::bind(std::forward<F>(f), std::forward<Args>(args)...)
        );
        
        std::future<return_type> result = task->get_future();
        
        {
            std::lock_guard<std::mutex> lock(queue_mutex_);
            if (stop_) {
                throw std::runtime_error("ThreadPool is stopped");
            }
            
            task_queue_.emplace([task] { (*task)(); });
            total_tasks_++;
        }
        
        condition_.notify_one();
        return result;
    }
    
    template<typename Iterator>
    void parallel_for_each(Iterator first, Iterator last, 
                          std::function<void(typename Iterator::value_type&)> func) {
        std::vector<std::future<void>> futures;
        
        for (auto it = first; it != last; ++it) {
            futures.push_back(enqueue([func, &*it] { func(*it); }));
        }
        
        for (auto& future : futures) {
            future.get();
        }
    }
    
    size_t thread_count() const { return workers_.size(); }
    size_t active_threads() const { return active_threads_.load(); }
    size_t queue_size() const {
        std::lock_guard<std::mutex> lock(queue_mutex_);
        return task_queue_.size();
    }
    size_t completed_tasks() const { return completed_tasks_.load(); }
    size_t total_tasks() const { return total_tasks_.load(); }
    
    double throughput() const {
        auto total = total_tasks_.load();
        return total > 0 ? static_cast<double>(completed_tasks_) / total : 0.0;
    }
};

// Priority Thread Pool
template<typename Priority = int>
class PriorityThreadPool {
private:
    struct Task {
        std::function<void()> function;
        Priority priority;
        
        bool operator<(const Task& other) const {
            return priority < other.priority; // Max heap
        }
    };
    
    std::vector<std::thread> workers_;
    std::priority_queue<Task> task_queue_;
    mutable std::mutex queue_mutex_;
    std::condition_variable condition_;
    std::atomic<bool> stop_{false};
    
public:
    explicit PriorityThreadPool(size_t num_threads) {
        for (size_t i = 0; i < num_threads; ++i) {
            workers_.emplace_back([this] {
                while (true) {
                    Task task;
                    
                    {
                        std::unique_lock<std::mutex> lock(queue_mutex_);
                        condition_.wait(lock, [this] { return stop_ || !task_queue_.empty(); });
                        
                        if (stop_ && task_queue_.empty()) return;
                        
                        task = std::move(const_cast<Task&>(task_queue_.top()));
                        task_queue_.pop();
                    }
                    
                    task.function();
                }
            });
        }
    }
    
    ~PriorityThreadPool() {
        stop_ = true;
        condition_.notify_all();
        for (auto& worker : workers_) {
            worker.join();
        }
    }
    
    template<typename F, typename... Args>
    void enqueue_with_priority(Priority priority, F&& f, Args&&... args) {
        {
            std::lock_guard<std::mutex> lock(queue_mutex_);
            task_queue_.emplace(Task{
                std::bind(std::forward<F>(f), std::forward<Args>(args)...),
                priority
            });
        }
        condition_.notify_one();
    }
};

void demonstrate_thread_pools() {
    std::cout << "=== Thread Pool Demonstration ===\\n";
    
    ThreadPool pool(2, 6);
    
    // Submit various tasks
    std::vector<std::future<int>> results;
    
    for (int i = 0; i < 10; ++i) {
        results.push_back(pool.enqueue([i] {
            std::this_thread::sleep_for(std::chrono::milliseconds(100 + i * 10));
            return i * i;
        }));
    }
    
    // Parallel processing example
    std::vector<int> data(1000);
    std::iota(data.begin(), data.end(), 1);
    
    auto start = std::chrono::high_resolution_clock::now();
    
    pool.parallel_for_each(data.begin(), data.end(), [](int& value) {
        value = value * value + 1; // Some computation
    });
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "Parallel processing completed in " << duration.count() << " ms\\n";
    
    // Collect results
    for (auto& result : results) {
        std::cout << "Task result: " << result.get() << "\\n";
    }
    
    std::cout << "Pool stats:\\n";
    std::cout << "Threads: " << pool.thread_count() << "\\n";
    std::cout << "Completed tasks: " << pool.completed_tasks() << "\\n";
    std::cout << "Throughput: " << pool.throughput() * 100 << "%\\n";
}`,

    memory_pools: `// High-Performance Memory Pool Implementation
#include <memory>
#include <vector>
#include <mutex>
#include <atomic>
#include <cstddef>
#include <new>

template<size_t BlockSize, size_t BlockCount>
class FixedMemoryPool {
private:
    struct alignas(std::max_align_t) Block {
        std::byte data[BlockSize];
    };
    
    Block* blocks_;
    std::atomic<Block*> free_list_head_{nullptr};
    std::atomic<size_t> allocated_count_{0};
    
    static_assert(BlockSize >= sizeof(void*), "Block size too small");
    
public:
    FixedMemoryPool() {
        // Allocate all blocks at once
        blocks_ = static_cast<Block*>(std::aligned_alloc(alignof(Block), 
                                                        sizeof(Block) * BlockCount));
        if (!blocks_) {
            throw std::bad_alloc{};
        }
        
        // Initialize free list
        for (size_t i = 0; i < BlockCount - 1; ++i) {
            *reinterpret_cast<Block**>(&blocks_[i]) = &blocks_[i + 1];
        }
        *reinterpret_cast<Block**>(&blocks_[BlockCount - 1]) = nullptr;
        
        free_list_head_.store(&blocks_[0]);
    }
    
    ~FixedMemoryPool() {
        std::free(blocks_);
    }
    
    void* allocate() {
        Block* block = free_list_head_.load();
        
        while (block != nullptr) {
            Block* next = *reinterpret_cast<Block**>(block);
            if (free_list_head_.compare_exchange_weak(block, next)) {
                allocated_count_.fetch_add(1);
                return block;
            }
        }
        
        throw std::bad_alloc{}; // Pool exhausted
    }
    
    void deallocate(void* ptr) {
        if (!ptr) return;
        
        Block* block = static_cast<Block*>(ptr);
        
        // Verify block is from this pool
        if (block < blocks_ || block >= blocks_ + BlockCount) {
            throw std::invalid_argument("Block not from this pool");
        }
        
        Block* head = free_list_head_.load();
        do {
            *reinterpret_cast<Block**>(block) = head;
        } while (!free_list_head_.compare_exchange_weak(head, block));
        
        allocated_count_.fetch_sub(1);
    }
    
    size_t allocated_count() const { return allocated_count_.load(); }
    size_t available_count() const { return BlockCount - allocated_count(); }
    constexpr size_t total_count() const { return BlockCount; }
    constexpr size_t block_size() const { return BlockSize; }
    
    double utilization() const {
        return static_cast<double>(allocated_count()) / BlockCount;
    }
};

// Multi-size Memory Pool
class MultiSizeMemoryPool {
private:
    struct PoolInfo {
        void* pool;
        size_t block_size;
        size_t block_count;
        std::function<void*(void*)> allocate_func;
        std::function<void(void*, void*)> deallocate_func;
        std::function<size_t(void*)> allocated_count_func;
    };
    
    std::vector<PoolInfo> pools_;
    mutable std::mutex mutex_;
    
    template<size_t BlockSize, size_t BlockCount>
    void add_pool() {
        auto pool = std::make_unique<FixedMemoryPool<BlockSize, BlockCount>>();
        auto* pool_ptr = pool.release();
        
        pools_.push_back({
            pool_ptr,
            BlockSize,
            BlockCount,
            [](void* p) -> void* {
                return static_cast<FixedMemoryPool<BlockSize, BlockCount>*>(p)->allocate();
            },
            [](void* p, void* ptr) {
                static_cast<FixedMemoryPool<BlockSize, BlockCount>*>(p)->deallocate(ptr);
            },
            [](void* p) -> size_t {
                return static_cast<FixedMemoryPool<BlockSize, BlockCount>*>(p)->allocated_count();
            }
        });
    }
    
public:
    MultiSizeMemoryPool() {
        // Add pools for common sizes
        add_pool<8, 1000>();    // Small objects
        add_pool<16, 1000>();
        add_pool<32, 1000>();
        add_pool<64, 500>();
        add_pool<128, 500>();
        add_pool<256, 200>();
        add_pool<512, 100>();
        add_pool<1024, 50>();   // Large objects
    }
    
    ~MultiSizeMemoryPool() {
        for (auto& info : pools_) {
            delete static_cast<char*>(info.pool); // Simplified cleanup
        }
    }
    
    void* allocate(size_t size) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        // Find appropriate pool
        for (auto& info : pools_) {
            if (size <= info.block_size) {
                try {
                    return info.allocate_func(info.pool);
                } catch (const std::bad_alloc&) {
                    continue; // Try next pool
                }
            }
        }
        
        // Fallback to system allocation
        return std::malloc(size);
    }
    
    void deallocate(void* ptr, size_t size) {
        if (!ptr) return;
        
        std::lock_guard<std::mutex> lock(mutex_);
        
        // Find appropriate pool
        for (auto& info : pools_) {
            if (size <= info.block_size) {
                try {
                    info.deallocate_func(info.pool, ptr);
                    return;
                } catch (const std::invalid_argument&) {
                    continue; // Not from this pool
                }
            }
        }
        
        // Fallback to system deallocation
        std::free(ptr);
    }
    
    std::vector<std::pair<size_t, double>> get_utilization() const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<std::pair<size_t, double>> result;
        
        for (const auto& info : pools_) {
            double utilization = static_cast<double>(info.allocated_count_func(info.pool)) / 
                               info.block_count;
            result.emplace_back(info.block_size, utilization);
        }
        
        return result;
    }
};

// RAII Memory Pool Allocator
template<typename T>
class PoolAllocator {
private:
    MultiSizeMemoryPool* pool_;
    
public:
    using value_type = T;
    using pointer = T*;
    using const_pointer = const T*;
    using reference = T&;
    using const_reference = const T&;
    using size_type = std::size_t;
    using difference_type = std::ptrdiff_t;
    
    template<typename U>
    struct rebind { using other = PoolAllocator<U>; };
    
    explicit PoolAllocator(MultiSizeMemoryPool* pool) : pool_(pool) {}
    
    template<typename U>
    PoolAllocator(const PoolAllocator<U>& other) : pool_(other.pool_) {}
    
    pointer allocate(size_type n) {
        if (n > std::numeric_limits<size_type>::max() / sizeof(T)) {
            throw std::bad_alloc{};
        }
        
        void* ptr = pool_->allocate(n * sizeof(T));
        return static_cast<pointer>(ptr);
    }
    
    void deallocate(pointer p, size_type n) {
        pool_->deallocate(p, n * sizeof(T));
    }
    
    template<typename U>
    bool operator==(const PoolAllocator<U>& other) const {
        return pool_ == other.pool_;
    }
    
    template<typename U>
    bool operator!=(const PoolAllocator<U>& other) const {
        return !(*this == other);
    }
};

void demonstrate_memory_pools() {
    std::cout << "=== Memory Pool Demonstration ===\\n";
    
    // Fixed size pool test
    FixedMemoryPool<64, 100> fixed_pool;
    
    std::vector<void*> allocated_blocks;
    
    // Allocate some blocks
    for (int i = 0; i < 50; ++i) {
        try {
            allocated_blocks.push_back(fixed_pool.allocate());
        } catch (const std::bad_alloc&) {
            std::cout << "Pool exhausted at " << i << " allocations\\n";
            break;
        }
    }
    
    std::cout << "Fixed pool utilization: " << fixed_pool.utilization() * 100 << "%\\n";
    
    // Deallocate some blocks
    for (size_t i = 0; i < allocated_blocks.size() / 2; ++i) {
        fixed_pool.deallocate(allocated_blocks[i]);
    }
    
    std::cout << "After partial deallocation: " << fixed_pool.utilization() * 100 << "%\\n";
    
    // Multi-size pool test
    MultiSizeMemoryPool multi_pool;
    
    std::vector<std::pair<void*, size_t>> multi_allocated;
    std::vector<size_t> sizes = {8, 16, 32, 64, 128, 256, 512, 1024};
    
    // Allocate various sizes
    for (size_t size : sizes) {
        for (int i = 0; i < 10; ++i) {
            void* ptr = multi_pool.allocate(size);
            multi_allocated.emplace_back(ptr, size);
        }
    }
    
    std::cout << "\\nMulti-size pool utilization:\\n";
    auto utilization = multi_pool.get_utilization();
    for (const auto& [size, util] : utilization) {
        std::cout << "Size " << size << ": " << util * 100 << "%\\n";
    }
    
    // Cleanup
    for (const auto& [ptr, size] : multi_allocated) {
        multi_pool.deallocate(ptr, size);
    }
    
    for (size_t i = allocated_blocks.size() / 2; i < allocated_blocks.size(); ++i) {
        fixed_pool.deallocate(allocated_blocks[i]);
    }
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 84: Advanced Resource Pooling" : "Lección 84: Resource Pooling Avanzado"}
      lessonId="lesson-84"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'High-Performance Resource Management Patterns' : 'Patrones de Gestión de Recursos de Alto Rendimiento'}
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
                  'Design and implement object pools for expensive resource creation',
                  'Create thread-safe connection pools with auto-scaling capabilities',
                  'Build high-performance thread pools with dynamic sizing',
                  'Implement lock-free memory pools for zero-allocation hot paths',
                  'Apply resource recycling patterns in production systems',
                  'Optimize pool sizing strategies for different workload patterns'
                ]
              : [
                  'Diseñar e implementar pools de objetos para creación de recursos costosos',
                  'Crear pools de conexión thread-safe con capacidades de auto-escalado',
                  'Construir pools de hilos de alto rendimiento con dimensionamiento dinámico',
                  'Implementar pools de memoria lock-free para hot paths sin allocación',
                  'Aplicar patrones de reciclaje de recursos en sistemas de producción',
                  'Optimizar estrategias de dimensionamiento de pools para diferentes patrones de carga'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive Resource Pooling Demonstration' : 'Demostración Interactiva de Resource Pooling'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <ResourcePoolVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('object_pools')}
            variant={state.scenario === 'object_pools' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Object Pools' : 'Pools de Objetos'}
          </Button>
          <Button 
            onClick={() => runScenario('connection_pools')}
            variant={state.scenario === 'connection_pools' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Connection Pools' : 'Pools de Conexión'}
          </Button>
          <Button 
            onClick={() => runScenario('thread_pools')}
            variant={state.scenario === 'thread_pools' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Thread Pools' : 'Pools de Hilos'}
          </Button>
          <Button 
            onClick={() => runScenario('memory_pools')}
            variant={state.scenario === 'memory_pools' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Memory Pools' : 'Pools de Memoria'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Active Resources' : 'Recursos Activos', 
              value: state.activeResources,
              color: '#00ff00'
            },
            { 
              label: state.language === 'en' ? 'Pool Utilization %' : 'Utilización Pool %', 
              value: Math.round(state.poolUtilization),
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Recycle Rate/s' : 'Tasa Reciclaje/s', 
              value: state.recycleRate,
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Cache Hits %' : 'Cache Hits %', 
              value: Math.round(state.cacheHits),
              color: '#ff0080'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'object_pools' && (state.language === 'en' ? 'Object Pool Implementation' : 'Implementación de Pool de Objetos')}
          {state.scenario === 'connection_pools' && (state.language === 'en' ? 'Database Connection Pools' : 'Pools de Conexión de Base de Datos')}
          {state.scenario === 'thread_pools' && (state.language === 'en' ? 'Advanced Thread Pool Patterns' : 'Patrones Avanzados de Pool de Hilos')}
          {state.scenario === 'memory_pools' && (state.language === 'en' ? 'High-Performance Memory Pools' : 'Pools de Memoria de Alto Rendimiento')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'object_pools' ? 
              (state.language === 'en' ? 'Generic Object Pool' : 'Pool de Objetos Genérico') :
            state.scenario === 'connection_pools' ? 
              (state.language === 'en' ? 'Connection Pool Manager' : 'Gestor de Pool de Conexiones') :
            state.scenario === 'thread_pools' ? 
              (state.language === 'en' ? 'Dynamic Thread Pool' : 'Pool de Hilos Dinámico') :
            (state.language === 'en' ? 'Lock-Free Memory Pool' : 'Pool de Memoria Lock-Free')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Production Optimization Strategies' : 'Estrategias de Optimización de Producción'}
        </SectionTitle>
        
        <PerformanceComparison
          title={state.language === 'en' ? 'Pool vs Direct Allocation Performance' : 'Rendimiento Pool vs Allocación Directa'}
          scenarios={[
            {
              name: state.language === 'en' ? 'Direct Allocation' : 'Allocación Directa',
              metrics: {
                [state.language === 'en' ? 'Allocation Time' : 'Tiempo Allocación']: 100,
                [state.language === 'en' ? 'Memory Fragmentation' : 'Fragmentación Memoria']: 85,
                [state.language === 'en' ? 'Cache Misses' : 'Cache Misses']: 75
              }
            },
            {
              name: state.language === 'en' ? 'Pool Allocation' : 'Allocación Pool',
              metrics: {
                [state.language === 'en' ? 'Allocation Time' : 'Tiempo Allocación']: 15,
                [state.language === 'en' ? 'Memory Fragmentation' : 'Fragmentación Memoria']: 20,
                [state.language === 'en' ? 'Cache Misses' : 'Cache Misses']: 30
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
            {state.language === 'en' ? '🚀 Key Performance Benefits:' : '🚀 Beneficios Clave de Rendimiento:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Reduced Allocation Overhead:' : 'Overhead de Allocación Reducido:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Pool allocation is 5-10x faster than system malloc/free for small objects'
                : 'La allocación de pool es 5-10x más rápida que malloc/free del sistema para objetos pequeños'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Memory Fragmentation Control:' : 'Control de Fragmentación de Memoria:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Pre-allocated pools eliminate memory fragmentation and improve cache locality'
                : 'Los pools pre-allocados eliminan fragmentación de memoria y mejoran localidad de cache'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Resource Reuse:' : 'Reutilización de Recursos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Expensive resource initialization (connections, threads) amortized across multiple uses'
                : 'Inicialización costosa de recursos (conexiones, hilos) amortizada en múltiples usos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Deterministic Performance:' : 'Rendimiento Determinístico:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Predictable allocation/deallocation times critical for real-time systems'
                : 'Tiempos predecibles de allocación/desallocación críticos para sistemas en tiempo real'
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
            {state.language === 'en' ? '⚠️ Design Considerations:' : '⚠️ Consideraciones de Diseño:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Pool Sizing Strategy:' : 'Estrategia de Dimensionamiento:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Balance between memory usage and allocation failures - monitor utilization patterns'
                : 'Balance entre uso de memoria y fallos de allocación - monitorear patrones de utilización'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Thread Safety:' : 'Seguridad de Hilos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Lock-free implementations using atomic operations provide better scalability'
                : 'Implementaciones lock-free usando operaciones atómicas proporcionan mejor escalabilidad'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Resource Cleanup:' : 'Limpieza de Recursos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Implement proper cleanup policies for stale resources and connection timeouts'
                : 'Implementar políticas apropiadas de limpieza para recursos obsoletos y timeouts de conexión'
              }
            </li>
          </ul>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default Lesson84_ResourcePooling;