import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Line } from '@react-three/drei';
import { useApp } from '../context/AppContext';

interface CallbackMetrics {
  performance: number;
  memoryUsage: number;
  flexibility: number;
  typeErasure: number;
}

interface CallbackVisualizationProps {
  metrics: CallbackMetrics;
  activeCallback: string;
  onCallbackSelect: (callback: string) => void;
}

const CallbackVisualization: React.FC<CallbackVisualizationProps> = ({ 
  metrics, 
  activeCallback, 
  onCallbackSelect 
}) => {
  const groupRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const callbacks = [
    { name: 'Function Pointer', position: [-3, 2, 0], color: '#e74c3c', performance: 1.0 },
    { name: 'std::function', position: [0, 2, 0], color: '#3498db', performance: 0.8 },
    { name: 'Lambda Capture', position: [3, 2, 0], color: '#2ecc71', performance: 0.9 },
    { name: 'Functor Class', position: [-1.5, -1, 0], color: '#f39c12', performance: 0.95 },
    { name: 'Callback Chain', position: [1.5, -1, 0], color: '#9b59b6', performance: 0.75 }
  ];

  return (
    <group ref={groupRef}>
      {callbacks.map((callback, index) => (
        <group key={callback.name}>
          <Box
            position={callback.position}
            args={[1.2, 0.8, 0.4]}
            onClick={() => onCallbackSelect(callback.name)}
          >
            <meshPhongMaterial 
              color={activeCallback === callback.name ? '#ffffff' : callback.color}
              transparent={true}
              opacity={activeCallback === callback.name ? 1.0 : 0.7}
            />
          </Box>
          
          <Text
            position={[callback.position[0], callback.position[1] - 1.2, callback.position[2]]}
            fontSize={0.2}
            color="#333"
            anchorX="center"
            anchorY="middle"
          >
            {callback.name}
          </Text>
          
          {/* Performance indicator */}
          <Sphere
            position={[callback.position[0], callback.position[1] + 1.2, callback.position[2]]}
            args={[0.1 + (callback.performance * 0.3)]}
          >
            <meshPhongMaterial 
              color={callback.performance > 0.9 ? '#2ecc71' : callback.performance > 0.8 ? '#f39c12' : '#e74c3c'}
              transparent
              opacity={0.8}
            />
          </Sphere>
          
          {/* Connection lines for callback chains */}
          {index < callbacks.length - 1 && (
            <Line
              points={[callback.position, callbacks[index + 1].position]}
              color="#95a5a6"
              lineWidth={2}
              transparent
              opacity={0.3}
            />
          )}
        </group>
      ))}
      
      {/* Central coordination node */}
      <Sphere position={[0, 0, 0]} args={[0.3]}>
        <meshPhongMaterial color="#34495e" transparent opacity={0.6} />
      </Sphere>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Callback Manager
      </Text>
    </group>
  );
};

const Lesson112_StdFunctionPointerCallbacks: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('function-wrappers');
  const [selectedCallback, setSelectedCallback] = useState<string>('std::function');
  const [metrics, setMetrics] = useState<CallbackMetrics>({
    performance: 0.85,
    memoryUsage: 0.70,
    flexibility: 0.95,
    typeErasure: 0.88
  });

  const examples = {
    'function-wrappers': {
      title: state.language === 'en' ? 'std::function with Pointer Captures' : 'std::function con Capturas de Punteros',
      code: `#include <functional>
#include <memory>
#include <vector>
#include <iostream>
#include <chrono>

// Advanced std::function patterns with smart pointer captures
namespace function_callbacks {

// Function wrapper with smart pointer lifetime management
template<typename Signature>
class ManagedCallback;

template<typename R, typename... Args>
class ManagedCallback<R(Args...)> {
private:
    std::function<R(Args...)> callback_;
    std::vector<std::shared_ptr<void>> captured_objects_;
    std::string debug_name_;
    mutable std::atomic<size_t> call_count_{0};
    mutable std::atomic<std::chrono::nanoseconds> total_time_{std::chrono::nanoseconds{0}};
    
public:
    template<typename F>
    ManagedCallback(F&& func, std::string name = "anonymous") 
        : callback_(std::forward<F>(func))
        , debug_name_(std::move(name)) {}
    
    // Capture shared ownership of objects
    template<typename T>
    void capture(std::shared_ptr<T> obj) {
        captured_objects_.push_back(obj);
    }
    
    // Capture multiple objects at once
    template<typename... Ts>
    void capture_all(std::shared_ptr<Ts>... objs) {
        (capture(objs), ...);
    }
    
    // Execute callback with timing
    R operator()(Args... args) const {
        auto start = std::chrono::high_resolution_clock::now();
        
        call_count_.fetch_add(1);
        
        if constexpr (std::is_void_v<R>) {
            callback_(args...);
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
            total_time_.store(total_time_.load() + duration);
        } else {
            auto result = callback_(args...);
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
            total_time_.store(total_time_.load() + duration);
            return result;
        }
    }
    
    // Performance metrics
    size_t get_call_count() const { return call_count_.load(); }
    double get_avg_execution_time_ns() const {
        auto calls = call_count_.load();
        return calls > 0 ? static_cast<double>(total_time_.load().count()) / calls : 0.0;
    }
    
    const std::string& get_debug_name() const { return debug_name_; }
    size_t get_captured_object_count() const { return captured_objects_.size(); }
    
    // Check if captured objects are still valid
    bool are_captures_valid() const {
        for (const auto& obj : captured_objects_) {
            if (obj.use_count() <= 1) { // Only this callback holds the reference
                return false;
            }
        }
        return true;
    }
};

// Factory for common callback patterns
class CallbackFactory {
public:
    // Create callback that captures shared_ptr by value
    template<typename T, typename F>
    static auto create_capturing_callback(std::shared_ptr<T> obj, F&& func, const std::string& name = "capturing") {
        return ManagedCallback<void()>([obj, func = std::forward<F>(func)]() {
            if (obj) {
                func(*obj);
            }
        }, name);
    }
    
    // Create callback with weak_ptr to avoid circular dependencies
    template<typename T, typename F>
    static auto create_weak_callback(std::weak_ptr<T> weak_obj, F&& func, const std::string& name = "weak") {
        return ManagedCallback<bool()>([weak_obj, func = std::forward<F>(func)]() -> bool {
            if (auto obj = weak_obj.lock()) {
                func(*obj);
                return true;
            }
            return false; // Object no longer exists
        }, name);
    }
    
    // Create chained callbacks
    template<typename... Callbacks>
    static auto create_callback_chain(Callbacks&&... callbacks) {
        return ManagedCallback<void()>([callbacks...]() {
            (callbacks(), ...);
        }, "chain");
    }
    
    // Create conditional callback
    template<typename Condition, typename TrueCallback, typename FalseCallback>
    static auto create_conditional_callback(Condition&& cond, TrueCallback&& true_cb, FalseCallback&& false_cb) {
        return ManagedCallback<void()>([cond = std::forward<Condition>(cond), 
                                       true_cb = std::forward<TrueCallback>(true_cb),
                                       false_cb = std::forward<FalseCallback>(false_cb)]() {
            if (cond()) {
                true_cb();
            } else {
                false_cb();
            }
        }, "conditional");
    }
};

// Example usage with real scenarios
class EventSystem {
private:
    std::vector<ManagedCallback<void(int)>> event_handlers_;
    std::shared_ptr<int> event_counter_ = std::make_shared<int>(0);
    
public:
    void subscribe(ManagedCallback<void(int)> callback) {
        event_handlers_.push_back(std::move(callback));
    }
    
    void fire_event(int event_data) {
        (*event_counter_)++;
        
        // Remove invalid callbacks (those with expired captures)
        event_handlers_.erase(
            std::remove_if(event_handlers_.begin(), event_handlers_.end(),
                [](const auto& callback) { return !callback.are_captures_valid(); }),
            event_handlers_.end()
        );
        
        // Execute remaining callbacks
        for (const auto& handler : event_handlers_) {
            handler(event_data);
        }
    }
    
    size_t get_handler_count() const { return event_handlers_.size(); }
    int get_total_events() const { return *event_counter_; }
    
    void print_performance_stats() const {
        for (size_t i = 0; i < event_handlers_.size(); ++i) {
            const auto& handler = event_handlers_[i];
            std::printf("Handler '%s': %zu calls, avg: %.2f ns\\n",
                       handler.get_debug_name().c_str(),
                       handler.get_call_count(),
                       handler.get_avg_execution_time_ns());
        }
    }
};

// Resource management with callbacks
class ResourceManager {
private:
    std::vector<std::pair<std::string, ManagedCallback<void()>>> cleanup_callbacks_;
    
public:
    template<typename T>
    void register_resource(const std::string& name, std::shared_ptr<T> resource) {
        auto cleanup = CallbackFactory::create_capturing_callback(
            resource,
            [name](const T& res) {
                std::printf("Cleaning up resource: %s\\n", name.c_str());
                // Perform resource-specific cleanup
            },
            "cleanup_" + name
        );
        cleanup.capture(resource);
        cleanup_callbacks_.emplace_back(name, std::move(cleanup));
    }
    
    void cleanup_all() {
        std::printf("Starting cleanup of %zu resources\\n", cleanup_callbacks_.size());
        for (auto& [name, callback] : cleanup_callbacks_) {
            try {
                callback();
            } catch (const std::exception& e) {
                std::printf("Error cleaning up %s: %s\\n", name.c_str(), e.what());
            }
        }
        cleanup_callbacks_.clear();
    }
    
    ~ResourceManager() {
        cleanup_all();
    }
};

} // namespace function_callbacks`
    },
    
    'performance-considerations': {
      title: state.language === 'en' ? 'Performance Considerations' : 'Consideraciones de Rendimiento',
      code: `#include <functional>
#include <memory>
#include <chrono>
#include <vector>
#include <type_traits>

// Performance-optimized callback systems
namespace performance_callbacks {

// Zero-allocation callback for hot paths
template<size_t MaxSize = 64>
class SmallFunctionOptimizer {
private:
    alignas(std::max_align_t) char storage_[MaxSize];
    void(*invoke_)(const void*, void*);
    void(*destroy_)(void*);
    bool is_stored_locally_ = false;
    
public:
    template<typename F>
    SmallFunctionOptimizer(F&& func) {
        static_assert(sizeof(F) <= MaxSize, "Function object too large for small optimization");
        
        if constexpr (sizeof(F) <= MaxSize && std::is_trivially_destructible_v<F>) {
            // Store in local buffer
            new (storage_) F(std::forward<F>(func));
            is_stored_locally_ = true;
            
            invoke_ = [](const void* storage, void* result) {
                const F* f = static_cast<const F*>(storage);
                if constexpr (std::is_void_v<std::invoke_result_t<F>>) {
                    (*f)();
                } else {
                    *static_cast<std::invoke_result_t<F>*>(result) = (*f)();
                }
            };
            
            destroy_ = [](void*) {}; // Trivially destructible
        } else {
            // Fallback to heap allocation
            auto* heap_func = new F(std::forward<F>(func));
            *reinterpret_cast<F**>(storage_) = heap_func;
            is_stored_locally_ = false;
            
            invoke_ = [](const void* storage, void* result) {
                const F* f = *static_cast<F* const*>(storage);
                if constexpr (std::is_void_v<std::invoke_result_t<F>>) {
                    (*f)();
                } else {
                    *static_cast<std::invoke_result_t<F>*>(result) = (*f)();
                }
            };
            
            destroy_ = [](void* storage) {
                F* f = *static_cast<F**>(storage);
                delete f;
            };
        }
    }
    
    ~SmallFunctionOptimizer() {
        destroy_(storage_);
    }
    
    template<typename R = void>
    R operator()() const {
        if constexpr (std::is_void_v<R>) {
            invoke_(storage_, nullptr);
        } else {
            R result;
            invoke_(storage_, &result);
            return result;
        }
    }
    
    bool is_locally_stored() const { return is_stored_locally_; }
};

// Performance monitoring for callbacks
class CallbackProfiler {
private:
    struct ProfileData {
        std::string name;
        size_t call_count = 0;
        std::chrono::nanoseconds total_time{0};
        std::chrono::nanoseconds min_time{std::chrono::nanoseconds::max()};
        std::chrono::nanoseconds max_time{0};
        size_t memory_allocations = 0;
    };
    
    std::unordered_map<std::string, ProfileData> profiles_;
    std::mutex profiles_mutex_;
    
public:
    class ScopedProfiler {
    private:
        CallbackProfiler* profiler_;
        std::string name_;
        std::chrono::high_resolution_clock::time_point start_time_;
        size_t initial_alloc_count_;
        
    public:
        ScopedProfiler(CallbackProfiler* profiler, std::string name)
            : profiler_(profiler), name_(std::move(name))
            , start_time_(std::chrono::high_resolution_clock::now())
            , initial_alloc_count_(get_allocation_count()) {}
        
        ~ScopedProfiler() {
            auto end_time = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end_time - start_time_);
            size_t alloc_count = get_allocation_count() - initial_alloc_count_;
            
            profiler_->record_execution(name_, duration, alloc_count);
        }
    
    private:
        size_t get_allocation_count() const {
            // Simplified - would integrate with actual allocation tracking
            return 0;
        }
    };
    
    ScopedProfiler profile(const std::string& name) {
        return ScopedProfiler(this, name);
    }
    
    void record_execution(const std::string& name, std::chrono::nanoseconds duration, size_t allocations) {
        std::lock_guard<std::mutex> lock(profiles_mutex_);
        auto& profile = profiles_[name];
        
        profile.name = name;
        profile.call_count++;
        profile.total_time += duration;
        profile.min_time = std::min(profile.min_time, duration);
        profile.max_time = std::max(profile.max_time, duration);
        profile.memory_allocations += allocations;
    }
    
    void print_report() const {
        std::lock_guard<std::mutex> lock(profiles_mutex_);
        
        printf("=== Callback Performance Report ===\\n");
        printf("%-20s %10s %15s %15s %15s %10s\\n", 
               "Name", "Calls", "Avg (ns)", "Min (ns)", "Max (ns)", "Allocs");
        printf("%-20s %10s %15s %15s %15s %10s\\n", 
               "----", "-----", "--------", "--------", "--------", "------");
        
        for (const auto& [name, profile] : profiles_) {
            double avg_time = profile.call_count > 0 ? 
                static_cast<double>(profile.total_time.count()) / profile.call_count : 0.0;
            
            printf("%-20s %10zu %15.2f %15ld %15ld %10zu\\n",
                   profile.name.c_str(),
                   profile.call_count,
                   avg_time,
                   profile.min_time.count(),
                   profile.max_time.count(),
                   profile.memory_allocations);
        }
    }
};

// High-performance callback registry
template<typename Signature>
class FastCallbackRegistry;

template<typename R, typename... Args>
class FastCallbackRegistry<R(Args...)> {
private:
    struct CallbackEntry {
        std::function<R(Args...)> callback;
        int priority;
        bool is_active;
        std::string name;
        
        CallbackEntry(std::function<R(Args...)> cb, int prio, std::string n)
            : callback(std::move(cb)), priority(prio), is_active(true), name(std::move(n)) {}
    };
    
    std::vector<CallbackEntry> callbacks_;
    mutable std::shared_mutex callbacks_mutex_;
    bool needs_sorting_ = false;
    CallbackProfiler* profiler_ = nullptr;
    
public:
    using callback_id = size_t;
    
    void set_profiler(CallbackProfiler* profiler) {
        profiler_ = profiler;
    }
    
    callback_id register_callback(std::function<R(Args...)> callback, 
                                 int priority = 0, 
                                 const std::string& name = "anonymous") {
        std::unique_lock<std::shared_mutex> lock(callbacks_mutex_);
        
        callbacks_.emplace_back(std::move(callback), priority, name);
        needs_sorting_ = true;
        
        return callbacks_.size() - 1;
    }
    
    void unregister_callback(callback_id id) {
        std::unique_lock<std::shared_mutex> lock(callbacks_mutex_);
        if (id < callbacks_.size()) {
            callbacks_[id].is_active = false;
        }
    }
    
    // Execute all active callbacks
    void execute_all(Args... args) const {
        std::shared_lock<std::shared_mutex> lock(callbacks_mutex_);
        
        // Sort by priority if needed (higher priority first)
        if (needs_sorting_) {
            const_cast<FastCallbackRegistry*>(this)->sort_callbacks();
        }
        
        for (const auto& entry : callbacks_) {
            if (entry.is_active) {
                if (profiler_) {
                    auto profiler_guard = profiler_->profile(entry.name);
                    if constexpr (std::is_void_v<R>) {
                        entry.callback(args...);
                    } else {
                        entry.callback(args...); // Would need to handle return values
                    }
                } else {
                    if constexpr (std::is_void_v<R>) {
                        entry.callback(args...);
                    } else {
                        entry.callback(args...);
                    }
                }
            }
        }
    }
    
    // Execute until first non-void return or condition
    template<typename Condition>
    bool execute_until(Condition&& condition, Args... args) const {
        std::shared_lock<std::shared_mutex> lock(callbacks_mutex_);
        
        if (needs_sorting_) {
            const_cast<FastCallbackRegistry*>(this)->sort_callbacks();
        }
        
        for (const auto& entry : callbacks_) {
            if (entry.is_active) {
                if constexpr (std::is_void_v<R>) {
                    entry.callback(args...);
                    if (condition()) {
                        return true;
                    }
                } else {
                    auto result = entry.callback(args...);
                    if (condition(result)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    void cleanup_inactive() {
        std::unique_lock<std::shared_mutex> lock(callbacks_mutex_);
        callbacks_.erase(
            std::remove_if(callbacks_.begin(), callbacks_.end(),
                [](const CallbackEntry& entry) { return !entry.is_active; }),
            callbacks_.end()
        );
    }
    
    size_t active_callback_count() const {
        std::shared_lock<std::shared_mutex> lock(callbacks_mutex_);
        return std::count_if(callbacks_.begin(), callbacks_.end(),
            [](const CallbackEntry& entry) { return entry.is_active; });
    }

private:
    void sort_callbacks() {
        std::sort(callbacks_.begin(), callbacks_.end(),
            [](const CallbackEntry& a, const CallbackEntry& b) {
                return a.priority > b.priority; // Higher priority first
            });
        needs_sorting_ = false;
    }
};

// Benchmark utilities
namespace benchmarks {
    template<typename F>
    auto benchmark_callback(F&& func, size_t iterations = 1000000) {
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < iterations; ++i) {
            func();
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto total_time = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        return std::make_pair(total_time, total_time / iterations);
    }
    
    void compare_callback_types() {
        // Function pointer
        void (*func_ptr)() = [](){};
        
        // std::function
        std::function<void()> std_func = [](){};
        
        // Small function optimizer
        SmallFunctionOptimizer<64> small_func([](){});
        
        constexpr size_t iterations = 10000000;
        
        auto [total_fp, avg_fp] = benchmark_callback([&](){ func_ptr(); }, iterations);
        auto [total_sf, avg_sf] = benchmark_callback([&](){ std_func(); }, iterations);
        auto [total_opt, avg_opt] = benchmark_callback([&](){ small_func(); }, iterations);
        
        printf("Function Pointer: %ld ns total, %ld ns avg\\n", total_fp.count(), avg_fp.count());
        printf("std::function:    %ld ns total, %ld ns avg\\n", total_sf.count(), avg_sf.count());
        printf("Small Optimizer:  %ld ns total, %ld ns avg\\n", total_opt.count(), avg_opt.count());
    }
}

} // namespace performance_callbacks`
    },
    
    'memory-management': {
      title: state.language === 'en' ? 'Memory Management in Callbacks' : 'Gestión de Memoria en Callbacks',
      code: `#include <memory>
#include <functional>
#include <vector>
#include <unordered_set>
#include <mutex>

// Advanced memory management patterns for callbacks with pointers
namespace callback_memory {

// RAII callback manager with automatic cleanup
class CallbackLifetimeManager {
private:
    struct CallbackInfo {
        std::function<void()> cleanup_func;
        std::vector<std::weak_ptr<void>> weak_dependencies;
        std::chrono::steady_clock::time_point creation_time;
        std::string debug_name;
        size_t call_count = 0;
        
        CallbackInfo(std::function<void()> cleanup, std::string name)
            : cleanup_func(std::move(cleanup))
            , creation_time(std::chrono::steady_clock::now())
            , debug_name(std::move(name)) {}
    };
    
    std::unordered_map<void*, std::unique_ptr<CallbackInfo>> managed_callbacks_;
    std::mutex manager_mutex_;
    std::thread cleanup_thread_;
    std::atomic<bool> should_stop_{false};
    
public:
    CallbackLifetimeManager() {
        start_cleanup_thread();
    }
    
    ~CallbackLifetimeManager() {
        should_stop_.store(true);
        if (cleanup_thread_.joinable()) {
            cleanup_thread_.join();
        }
        
        // Clean up all remaining callbacks
        std::lock_guard<std::mutex> lock(manager_mutex_);
        for (auto& [key, info] : managed_callbacks_) {
            try {
                info->cleanup_func();
            } catch (...) {
                // Log error but continue cleanup
            }
        }
    }
    
    // Register a callback with dependencies
    template<typename Callback, typename... Dependencies>
    void register_callback(Callback* callback_ptr, 
                          std::function<void()> cleanup_func,
                          const std::string& name,
                          std::shared_ptr<Dependencies>... deps) {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        
        auto info = std::make_unique<CallbackInfo>(std::move(cleanup_func), name);
        (info->weak_dependencies.push_back(std::weak_ptr<void>(deps)), ...);
        
        managed_callbacks_[callback_ptr] = std::move(info);
    }
    
    // Check if callback is still valid (all dependencies alive)
    bool is_callback_valid(void* callback_ptr) {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        auto it = managed_callbacks_.find(callback_ptr);
        if (it == managed_callbacks_.end()) {
            return false;
        }
        
        // Check if all weak dependencies are still alive
        for (const auto& weak_dep : it->second->weak_dependencies) {
            if (weak_dep.expired()) {
                return false;
            }
        }
        return true;
    }
    
    // Manually trigger cleanup for specific callback
    void cleanup_callback(void* callback_ptr) {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        auto it = managed_callbacks_.find(callback_ptr);
        if (it != managed_callbacks_.end()) {
            try {
                it->second->cleanup_func();
            } catch (...) {
                // Log error
            }
            managed_callbacks_.erase(it);
        }
    }
    
    // Get statistics
    struct Stats {
        size_t total_callbacks;
        size_t valid_callbacks;
        size_t expired_callbacks;
        double avg_lifetime_seconds;
    };
    
    Stats get_statistics() const {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        Stats stats{};
        stats.total_callbacks = managed_callbacks_.size();
        
        auto now = std::chrono::steady_clock::now();
        double total_lifetime = 0.0;
        
        for (const auto& [ptr, info] : managed_callbacks_) {
            bool is_valid = true;
            for (const auto& weak_dep : info->weak_dependencies) {
                if (weak_dep.expired()) {
                    is_valid = false;
                    break;
                }
            }
            
            if (is_valid) {
                stats.valid_callbacks++;
            } else {
                stats.expired_callbacks++;
            }
            
            auto lifetime = std::chrono::duration_cast<std::chrono::seconds>(
                now - info->creation_time);
            total_lifetime += lifetime.count();
        }
        
        stats.avg_lifetime_seconds = stats.total_callbacks > 0 ? 
            total_lifetime / stats.total_callbacks : 0.0;
            
        return stats;
    }

private:
    void start_cleanup_thread() {
        cleanup_thread_ = std::thread([this]() {
            while (!should_stop_.load()) {
                std::this_thread::sleep_for(std::chrono::seconds(1));
                cleanup_expired_callbacks();
            }
        });
    }
    
    void cleanup_expired_callbacks() {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        
        auto it = managed_callbacks_.begin();
        while (it != managed_callbacks_.end()) {
            bool has_expired_deps = false;
            for (const auto& weak_dep : it->second->weak_dependencies) {
                if (weak_dep.expired()) {
                    has_expired_deps = true;
                    break;
                }
            }
            
            if (has_expired_deps) {
                try {
                    it->second->cleanup_func();
                } catch (...) {
                    // Log error but continue
                }
                it = managed_callbacks_.erase(it);
            } else {
                ++it;
            }
        }
    }
};

// Memory-efficient callback storage with custom allocators
template<typename Allocator = std::allocator<char>>
class PooledCallbackStorage {
private:
    struct CallbackBlock {
        alignas(std::max_align_t) char storage[256]; // Adjustable size
        size_t used_size = 0;
        std::function<void()> destructor;
        bool is_occupied = false;
    };
    
    std::vector<CallbackBlock> blocks_;
    std::vector<size_t> free_blocks_;
    std::mutex storage_mutex_;
    Allocator allocator_;
    
public:
    explicit PooledCallbackStorage(const Allocator& alloc = Allocator{})
        : allocator_(alloc) {
        // Pre-allocate some blocks
        blocks_.resize(32);
        for (size_t i = 0; i < blocks_.size(); ++i) {
            free_blocks_.push_back(i);
        }
    }
    
    ~PooledCallbackStorage() {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        for (auto& block : blocks_) {
            if (block.is_occupied && block.destructor) {
                try {
                    block.destructor();
                } catch (...) {}
            }
        }
    }
    
    // Allocate space for a callback object
    template<typename T>
    T* allocate_callback() {
        static_assert(sizeof(T) <= sizeof(CallbackBlock::storage), 
                      "Callback object too large for block");
        
        std::lock_guard<std::mutex> lock(storage_mutex_);
        
        size_t block_index;
        if (!free_blocks_.empty()) {
            block_index = free_blocks_.back();
            free_blocks_.pop_back();
        } else {
            // Expand storage
            block_index = blocks_.size();
            blocks_.resize(blocks_.size() * 2);
            for (size_t i = block_index + 1; i < blocks_.size(); ++i) {
                free_blocks_.push_back(i);
            }
        }
        
        auto& block = blocks_[block_index];
        block.is_occupied = true;
        block.used_size = sizeof(T);
        block.destructor = [&block]() {
            T* obj = reinterpret_cast<T*>(block.storage);
            obj->~T();
            block.is_occupied = false;
        };
        
        return new (block.storage) T;
    }
    
    // Deallocate callback object
    template<typename T>
    void deallocate_callback(T* callback_ptr) {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        
        // Find which block contains this pointer
        for (size_t i = 0; i < blocks_.size(); ++i) {
            auto& block = blocks_[i];
            char* block_start = block.storage;
            char* block_end = block_start + sizeof(block.storage);
            char* ptr_addr = reinterpret_cast<char*>(callback_ptr);
            
            if (ptr_addr >= block_start && ptr_addr < block_end && block.is_occupied) {
                callback_ptr->~T();
                block.is_occupied = false;
                block.destructor = nullptr;
                free_blocks_.push_back(i);
                break;
            }
        }
    }
    
    size_t get_used_blocks() const {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        return blocks_.size() - free_blocks_.size();
    }
    
    size_t get_total_blocks() const {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        return blocks_.size();
    }
};

// Safe callback wrapper that prevents use-after-free
template<typename Signature>
class SafeCallback;

template<typename R, typename... Args>
class SafeCallback<R(Args...)> {
private:
    struct CallbackData {
        std::function<R(Args...)> callback;
        std::atomic<bool> is_valid{true};
        std::mutex callback_mutex;
        std::vector<std::weak_ptr<void>> dependencies;
        
        template<typename F>
        CallbackData(F&& f) : callback(std::forward<F>(f)) {}
    };
    
    std::shared_ptr<CallbackData> data_;
    
public:
    template<typename F>
    explicit SafeCallback(F&& func) 
        : data_(std::make_shared<CallbackData>(std::forward<F>(func))) {}
    
    // Add dependencies that must remain alive
    template<typename T>
    void add_dependency(std::shared_ptr<T> dep) {
        if (data_) {
            std::lock_guard<std::mutex> lock(data_->callback_mutex);
            data_->dependencies.push_back(dep);
        }
    }
    
    // Check if callback is safe to execute
    bool is_safe() const {
        if (!data_ || !data_->is_valid.load()) {
            return false;
        }
        
        std::lock_guard<std::mutex> lock(data_->callback_mutex);
        for (const auto& weak_dep : data_->dependencies) {
            if (weak_dep.expired()) {
                return false;
            }
        }
        return true;
    }
    
    // Safe execution with optional result handling
    template<typename DefaultReturn = R>
    auto safe_invoke(Args... args, DefaultReturn&& default_val = DefaultReturn{}) const
        -> std::conditional_t<std::is_void_v<R>, bool, std::optional<R>> {
        
        if (!is_safe()) {
            if constexpr (std::is_void_v<R>) {
                return false; // Indicate failure
            } else {
                return std::nullopt; // No result available
            }
        }
        
        try {
            std::lock_guard<std::mutex> lock(data_->callback_mutex);
            if constexpr (std::is_void_v<R>) {
                data_->callback(args...);
                return true;
            } else {
                return data_->callback(args...);
            }
        } catch (...) {
            // Mark as invalid on exception
            data_->is_valid.store(false);
            if constexpr (std::is_void_v<R>) {
                return false;
            } else {
                return std::nullopt;
            }
        }
    }
    
    // Invalidate callback (prevent further execution)
    void invalidate() {
        if (data_) {
            data_->is_valid.store(false);
        }
    }
    
    // Move-only semantics for performance
    SafeCallback(const SafeCallback&) = delete;
    SafeCallback& operator=(const SafeCallback&) = delete;
    
    SafeCallback(SafeCallback&&) = default;
    SafeCallback& operator=(SafeCallback&&) = default;
};

// Memory pool specifically for callback objects
class CallbackMemoryPool {
private:
    static constexpr size_t BLOCK_SIZE = 4096;
    static constexpr size_t MAX_CALLBACK_SIZE = 256;
    
    struct MemoryBlock {
        alignas(std::max_align_t) char data[BLOCK_SIZE];
        size_t offset = 0;
        std::atomic<size_t> ref_count{0};
    };
    
    std::vector<std::unique_ptr<MemoryBlock>> blocks_;
    std::mutex pool_mutex_;
    
public:
    template<typename T>
    std::unique_ptr<T, std::function<void(T*)>> allocate() {
        static_assert(sizeof(T) <= MAX_CALLBACK_SIZE, "Callback object too large");
        
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        // Find block with enough space
        MemoryBlock* target_block = nullptr;
        for (auto& block : blocks_) {
            if (block->offset + sizeof(T) <= BLOCK_SIZE) {
                target_block = block.get();
                break;
            }
        }
        
        if (!target_block) {
            blocks_.push_back(std::make_unique<MemoryBlock>());
            target_block = blocks_.back().get();
        }
        
        // Allocate from block
        void* ptr = target_block->data + target_block->offset;
        target_block->offset += sizeof(T);
        target_block->ref_count.fetch_add(1);
        
        T* callback_obj = new (ptr) T;
        
        // Custom deleter that manages block reference count
        auto deleter = [target_block](T* obj) {
            obj->~T();
            target_block->ref_count.fetch_sub(1);
            // Block cleanup logic could be added here
        };
        
        return std::unique_ptr<T, std::function<void(T*)>>(callback_obj, deleter);
    }
    
    size_t get_allocated_blocks() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return blocks_.size();
    }
    
    size_t get_total_memory_usage() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return blocks_.size() * BLOCK_SIZE;
    }
};

} // namespace callback_memory`
    },
    
    'type-erasure': {
      title: state.language === 'en' ? 'Type Erasure with Pointers' : 'Type Erasure con Punteros',
      code: `#include <memory>
#include <functional>
#include <typeindex>
#include <unordered_map>

// Advanced type erasure patterns for callback systems
namespace type_erasure_callbacks {

// Universal callback interface using type erasure
class AnyCallback {
private:
    struct CallbackConcept {
        virtual ~CallbackConcept() = default;
        virtual void invoke(void* args) const = 0;
        virtual std::type_index get_signature_type() const = 0;
        virtual std::unique_ptr<CallbackConcept> clone() const = 0;
        virtual size_t get_argument_count() const = 0;
        virtual bool is_compatible_with(const std::type_index& type) const = 0;
    };
    
    template<typename Signature>
    struct CallbackModel;
    
    template<typename R, typename... Args>
    struct CallbackModel<R(Args...)> : public CallbackConcept {
        std::function<R(Args...)> callback_;
        
        template<typename F>
        CallbackModel(F&& func) : callback_(std::forward<F>(func)) {}
        
        void invoke(void* args) const override {
            auto* typed_args = static_cast<std::tuple<Args...>*>(args);
            std::apply(callback_, *typed_args);
        }
        
        std::type_index get_signature_type() const override {
            return std::type_index(typeid(R(Args...)));
        }
        
        std::unique_ptr<CallbackConcept> clone() const override {
            return std::make_unique<CallbackModel<R(Args...)>>(callback_);
        }
        
        size_t get_argument_count() const override {
            return sizeof...(Args);
        }
        
        bool is_compatible_with(const std::type_index& type) const override {
            return get_signature_type() == type;
        }
    };
    
    std::unique_ptr<CallbackConcept> callback_;
    std::string debug_name_;
    
public:
    template<typename F>
    AnyCallback(F&& func, const std::string& name = "anonymous") 
        : debug_name_(name) {
        using signature_type = typename std::function<F>::signature_type;
        callback_ = std::make_unique<CallbackModel<signature_type>>(std::forward<F>(func));
    }
    
    // Copy constructor
    AnyCallback(const AnyCallback& other) 
        : callback_(other.callback_ ? other.callback_->clone() : nullptr)
        , debug_name_(other.debug_name_) {}
    
    // Move constructor
    AnyCallback(AnyCallback&&) = default;
    AnyCallback& operator=(AnyCallback&&) = default;
    
    template<typename... Args>
    void invoke(Args&&... args) const {
        if (!callback_) {
            throw std::runtime_error("Invalid callback");
        }
        
        auto arg_tuple = std::make_tuple(std::forward<Args>(args)...);
        callback_->invoke(&arg_tuple);
    }
    
    template<typename Signature>
    bool is_compatible() const {
        if (!callback_) return false;
        return callback_->is_compatible_with(std::type_index(typeid(Signature)));
    }
    
    std::type_index get_signature_type() const {
        if (!callback_) {
            return std::type_index(typeid(void));
        }
        return callback_->get_signature_type();
    }
    
    const std::string& get_debug_name() const { return debug_name_; }
    size_t get_argument_count() const { 
        return callback_ ? callback_->get_argument_count() : 0; 
    }
    
    bool is_valid() const { return callback_ != nullptr; }
};

// Type-erased callback registry with runtime type safety
class TypeErasedCallbackRegistry {
private:
    std::unordered_map<std::string, std::vector<AnyCallback>> callbacks_by_event_;
    std::unordered_map<std::type_index, std::vector<std::string>> events_by_signature_;
    mutable std::shared_mutex registry_mutex_;
    
public:
    // Register callback for specific event type
    template<typename EventType>
    void register_callback(const std::string& event_name, 
                          std::function<void(const EventType&)> callback,
                          const std::string& callback_name = "anonymous") {
        std::unique_lock<std::shared_mutex> lock(registry_mutex_);
        
        AnyCallback any_cb(std::move(callback), callback_name);
        callbacks_by_event_[event_name].push_back(std::move(any_cb));
        
        auto signature_type = std::type_index(typeid(void(const EventType&)));
        events_by_signature_[signature_type].push_back(event_name);
    }
    
    // Fire event with automatic type checking
    template<typename EventType>
    bool fire_event(const std::string& event_name, const EventType& event_data) {
        std::shared_lock<std::shared_mutex> lock(registry_mutex_);
        
        auto it = callbacks_by_event_.find(event_name);
        if (it == callbacks_by_event_.end()) {
            return false; // No callbacks for this event
        }
        
        bool any_executed = false;
        for (const auto& callback : it->second) {
            if (callback.is_compatible<void(const EventType&)>()) {
                try {
                    callback.invoke(event_data);
                    any_executed = true;
                } catch (const std::exception& e) {
                    // Log error but continue with other callbacks
                    printf("Error in callback '%s': %s\\n", 
                           callback.get_debug_name().c_str(), e.what());
                }
            } else {
                printf("Type mismatch for callback '%s' on event '%s'\\n",
                       callback.get_debug_name().c_str(), event_name.c_str());
            }
        }
        
        return any_executed;
    }
    
    // Get events that can handle specific signature
    template<typename Signature>
    std::vector<std::string> get_compatible_events() const {
        std::shared_lock<std::shared_mutex> lock(registry_mutex_);
        
        auto signature_type = std::type_index(typeid(Signature));
        auto it = events_by_signature_.find(signature_type);
        
        if (it != events_by_signature_.end()) {
            return it->second;
        }
        return {};
    }
    
    // Runtime introspection
    struct EventInfo {
        std::string name;
        size_t callback_count;
        std::vector<std::type_index> signature_types;
        std::vector<std::string> callback_names;
    };
    
    std::vector<EventInfo> get_event_info() const {
        std::shared_lock<std::shared_mutex> lock(registry_mutex_);
        std::vector<EventInfo> info;
        
        for (const auto& [event_name, callbacks] : callbacks_by_event_) {
            EventInfo event_info;
            event_info.name = event_name;
            event_info.callback_count = callbacks.size();
            
            for (const auto& callback : callbacks) {
                event_info.signature_types.push_back(callback.get_signature_type());
                event_info.callback_names.push_back(callback.get_debug_name());
            }
            
            info.push_back(std::move(event_info));
        }
        
        return info;
    }
    
    void clear_event(const std::string& event_name) {
        std::unique_lock<std::shared_mutex> lock(registry_mutex_);
        callbacks_by_event_.erase(event_name);
        
        // Clean up reverse mapping
        for (auto& [signature, events] : events_by_signature_) {
            events.erase(std::remove(events.begin(), events.end(), event_name), 
                        events.end());
        }
    }
};

// Advanced type-erased function storage with custom allocators
template<typename Allocator = std::allocator<char>>
class TypeErasedFunctionStorage {
private:
    struct FunctionStorage {
        alignas(std::max_align_t) char storage[128]; // Configurable size
        std::function<void(char*)> destructor;
        std::function<void(char*, void*)> invoker;
        std::type_index signature_type;
        size_t object_size;
        bool is_occupied = false;
        
        FunctionStorage() : signature_type(typeid(void)) {}
    };
    
    std::vector<FunctionStorage> storage_blocks_;
    std::queue<size_t> free_indices_;
    std::mutex storage_mutex_;
    Allocator allocator_;
    
public:
    using storage_id = size_t;
    
    explicit TypeErasedFunctionStorage(const Allocator& alloc = Allocator{})
        : allocator_(alloc) {
        // Pre-allocate storage blocks
        storage_blocks_.resize(64);
        for (size_t i = 0; i < storage_blocks_.size(); ++i) {
            free_indices_.push(i);
        }
    }
    
    ~TypeErasedFunctionStorage() {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        for (auto& block : storage_blocks_) {
            if (block.is_occupied && block.destructor) {
                block.destructor(block.storage);
            }
        }
    }
    
    // Store any callable object
    template<typename F>
    storage_id store_function(F&& func) {
        using decay_type = std::decay_t<F>;
        static_assert(sizeof(decay_type) <= 128, "Function object too large");
        
        std::lock_guard<std::mutex> lock(storage_mutex_);
        
        size_t index;
        if (!free_indices_.empty()) {
            index = free_indices_.front();
            free_indices_.pop();
        } else {
            // Expand storage
            index = storage_blocks_.size();
            storage_blocks_.resize(storage_blocks_.size() * 2);
            for (size_t i = index + 1; i < storage_blocks_.size(); ++i) {
                free_indices_.push(i);
            }
        }
        
        auto& block = storage_blocks_[index];
        
        // Placement new the function object
        new (block.storage) decay_type(std::forward<F>(func));
        block.is_occupied = true;
        block.object_size = sizeof(decay_type);
        block.signature_type = std::type_index(typeid(F));
        
        // Set up destructor
        block.destructor = [](char* storage) {
            reinterpret_cast<decay_type*>(storage)->~decay_type();
        };
        
        // Set up type-erased invoker
        block.invoker = [](char* storage, void* args) {
            decay_type* func_obj = reinterpret_cast<decay_type*>(storage);
            // This would need more sophisticated argument handling
            // for different function signatures
            (*func_obj)();
        };
        
        return index;
    }
    
    // Invoke stored function
    bool invoke_function(storage_id id) {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        
        if (id >= storage_blocks_.size() || !storage_blocks_[id].is_occupied) {
            return false;
        }
        
        auto& block = storage_blocks_[id];
        try {
            block.invoker(block.storage, nullptr);
            return true;
        } catch (...) {
            return false;
        }
    }
    
    // Remove stored function
    void remove_function(storage_id id) {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        
        if (id < storage_blocks_.size() && storage_blocks_[id].is_occupied) {
            auto& block = storage_blocks_[id];
            if (block.destructor) {
                block.destructor(block.storage);
            }
            block.is_occupied = false;
            free_indices_.push(id);
        }
    }
    
    // Query stored function info
    struct FunctionInfo {
        std::type_index signature_type;
        size_t object_size;
        bool is_valid;
    };
    
    FunctionInfo get_function_info(storage_id id) const {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        
        if (id < storage_blocks_.size() && storage_blocks_[id].is_occupied) {
            const auto& block = storage_blocks_[id];
            return {block.signature_type, block.object_size, true};
        }
        
        return {std::type_index(typeid(void)), 0, false};
    }
    
    size_t get_stored_function_count() const {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        return storage_blocks_.size() - free_indices_.size();
    }
    
    size_t get_memory_usage() const {
        std::lock_guard<std::mutex> lock(storage_mutex_);
        return storage_blocks_.size() * sizeof(FunctionStorage);
    }
};

// Polymorphic callback wrapper with automatic lifetime management
template<typename Signature>
class PolymorphicCallback;

template<typename R, typename... Args>
class PolymorphicCallback<R(Args...)> {
private:
    struct PolymorphicConcept {
        virtual ~PolymorphicConcept() = default;
        virtual R operator()(Args... args) const = 0;
        virtual std::unique_ptr<PolymorphicConcept> clone() const = 0;
        virtual std::vector<std::type_index> get_captured_types() const = 0;
        virtual bool has_expired_captures() const = 0;
    };
    
    template<typename F, typename... CapturedTypes>
    struct PolymorphicModel : public PolymorphicConcept {
        F func_;
        std::tuple<std::weak_ptr<CapturedTypes>...> captured_objects_;
        
        template<typename Func>
        PolymorphicModel(Func&& f, std::shared_ptr<CapturedTypes>... captures)
            : func_(std::forward<Func>(f))
            , captured_objects_(std::weak_ptr<CapturedTypes>(captures)...) {}
        
        R operator()(Args... args) const override {
            // Check if all captured objects are still alive
            if (has_expired_captures()) {
                throw std::runtime_error("Captured objects have expired");
            }
            
            return func_(args...);
        }
        
        std::unique_ptr<PolymorphicConcept> clone() const override {
            return std::make_unique<PolymorphicModel<F, CapturedTypes...>>(func_, captured_objects_);
        }
        
        std::vector<std::type_index> get_captured_types() const override {
            return {std::type_index(typeid(CapturedTypes))...};
        }
        
        bool has_expired_captures() const override {
            return std::apply([](const auto&... weak_ptrs) {
                return (weak_ptrs.expired() || ...);
            }, captured_objects_);
        }
    };
    
    std::unique_ptr<PolymorphicConcept> impl_;
    
public:
    template<typename F, typename... CapturedTypes>
    PolymorphicCallback(F&& func, std::shared_ptr<CapturedTypes>... captures)
        : impl_(std::make_unique<PolymorphicModel<std::decay_t<F>, CapturedTypes...>>(
            std::forward<F>(func), captures...)) {}
    
    // Copy constructor
    PolymorphicCallback(const PolymorphicCallback& other)
        : impl_(other.impl_ ? other.impl_->clone() : nullptr) {}
    
    // Move constructor
    PolymorphicCallback(PolymorphicCallback&&) = default;
    PolymorphicCallback& operator=(PolymorphicCallback&&) = default;
    
    R operator()(Args... args) const {
        if (!impl_) {
            throw std::runtime_error("Invalid callback");
        }
        return (*impl_)(args...);
    }
    
    bool is_valid() const {
        return impl_ && !impl_->has_expired_captures();
    }
    
    std::vector<std::type_index> get_captured_types() const {
        return impl_ ? impl_->get_captured_types() : std::vector<std::type_index>{};
    }
};

} // namespace type_erasure_callbacks`
    }
  };

  const currentExample = examples[activeExample as keyof typeof examples];

  const handleCallbackSelect = (callback: string) => {
    setSelectedCallback(callback);
    
    // Update metrics based on selected callback type
    const callbackMetrics: { [key: string]: CallbackMetrics } = {
      'Function Pointer': { performance: 1.0, memoryUsage: 1.0, flexibility: 0.3, typeErasure: 0.0 },
      'std::function': { performance: 0.8, memoryUsage: 0.6, flexibility: 0.9, typeErasure: 0.8 },
      'Lambda Capture': { performance: 0.9, memoryUsage: 0.7, flexibility: 0.8, typeErasure: 0.6 },
      'Functor Class': { performance: 0.95, memoryUsage: 0.8, flexibility: 0.7, typeErasure: 0.4 },
      'Callback Chain': { performance: 0.75, memoryUsage: 0.5, flexibility: 0.95, typeErasure: 0.9 }
    };
    
    if (callbackMetrics[callback]) {
      setMetrics(callbackMetrics[callback]);
    }
  };

  return (
    <div className="lesson-container">
      <header className="lesson-header">
        <h1>{state.language === 'en' ? 'Lesson 112: std::function and Pointer Callbacks' : 'Lección 112: std::function y Callbacks con Punteros'}</h1>
        <p className="lesson-description">
          {state.language === 'en' 
            ? 'Explore function wrappers with pointer captures, performance considerations, memory management in callbacks, and type erasure patterns with smart pointers.'
            : 'Explora wrappers de funciones con capturas de punteros, consideraciones de rendimiento, gestión de memoria en callbacks y patrones de type erasure con smart pointers.'}
        </p>
      </header>

      <div className="lesson-content">
        <div className="visualization-section">
          <h3>{state.language === 'en' ? 'Callback System Visualization' : 'Visualización de Sistema de Callbacks'}</h3>
          <div className="canvas-container" style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '20px' }}>
            <Canvas camera={{ position: [6, 4, 6] }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />
              <CallbackVisualization 
                metrics={metrics}
                activeCallback={selectedCallback}
                onCallbackSelect={handleCallbackSelect}
              />
            </Canvas>
          </div>
          
          <div className="callback-info">
            <h4>{state.language === 'en' ? 'Callback Metrics' : 'Métricas de Callbacks'}</h4>
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Performance' : 'Rendimiento'}:</span>
                <span className="metric-value">{(metrics.performance * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Memory Usage' : 'Uso de Memoria'}:</span>
                <span className="metric-value">{(metrics.memoryUsage * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Flexibility' : 'Flexibilidad'}:</span>
                <span className="metric-value">{(metrics.flexibility * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Type Erasure' : 'Type Erasure'}:</span>
                <span className="metric-value">{(metrics.typeErasure * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="selected-callback">
              <strong>{state.language === 'en' ? 'Selected:' : 'Seleccionado:'}</strong> {selectedCallback}
            </div>
          </div>
        </div>

        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Callback Pattern Examples' : 'Ejemplos de Patrones de Callbacks'}</h3>
          
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

        <div className="key-concepts-section">
          <h3>{state.language === 'en' ? 'Key Concepts' : 'Conceptos Clave'}</h3>
          
          <div className="concepts-grid">
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Function Wrappers' : 'Wrappers de Funciones'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'std::function with smart pointer captures' : 'std::function con capturas de smart pointers'}</li>
                <li>{state.language === 'en' ? 'Lifetime management of captured objects' : 'Gestión de vida útil de objetos capturados'}</li>
                <li>{state.language === 'en' ? 'Weak pointer captures for safety' : 'Capturas con weak_ptr para seguridad'}</li>
                <li>{state.language === 'en' ? 'Callback chaining and composition' : 'Encadenamiento y composición de callbacks'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Performance Optimization' : 'Optimización de Rendimiento'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Small function optimization' : 'Optimización de funciones pequeñas'}</li>
                <li>{state.language === 'en' ? 'Zero-allocation callback storage' : 'Almacenamiento de callbacks sin asignaciones'}</li>
                <li>{state.language === 'en' ? 'Performance profiling and metrics' : 'Profiling de rendimiento y métricas'}</li>
                <li>{state.language === 'en' ? 'Lock-free callback execution' : 'Ejecución de callbacks sin bloqueos'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Memory Management' : 'Gestión de Memoria'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'RAII callback lifetime management' : 'Gestión de vida útil con RAII'}</li>
                <li>{state.language === 'en' ? 'Custom allocators for callbacks' : 'Asignadores personalizados para callbacks'}</li>
                <li>{state.language === 'en' ? 'Memory pool for callback objects' : 'Pool de memoria para objetos callback'}</li>
                <li>{state.language === 'en' ? 'Automatic cleanup of expired callbacks' : 'Limpieza automática de callbacks expirados'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Type Erasure' : 'Type Erasure'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Universal callback interfaces' : 'Interfaces universales de callback'}</li>
                <li>{state.language === 'en' ? 'Runtime type safety checking' : 'Verificación de seguridad de tipos en tiempo de ejecución'}</li>
                <li>{state.language === 'en' ? 'Polymorphic callback storage' : 'Almacenamiento polimórfico de callbacks'}</li>
                <li>{state.language === 'en' ? 'Type-safe event dispatching' : 'Dispatching de eventos con seguridad de tipos'}</li>
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

        .callback-info {
          margin-top: 20px;
        }

        .callback-info h4 {
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

        .selected-callback {
          margin-top: 15px;
          padding: 10px;
          background: #e8f5e8;
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
          border-left: 4px solid #3498db;
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

export default Lesson112_StdFunctionPointerCallbacks;