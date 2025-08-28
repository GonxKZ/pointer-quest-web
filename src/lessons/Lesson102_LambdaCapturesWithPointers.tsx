import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';
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



function LambdaCaptureVisualization() {
  const [captureMetrics, setCaptureMetrics] = useState({
    valueCapture: 0,
    moveCapture: 0,
    weakCapture: 0,
    generalized: 0,
    safetyScore: 95
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCaptureMetrics(prev => ({
        valueCapture: prev.valueCapture + Math.floor(Math.random() * 3) + 1,
        moveCapture: prev.moveCapture + Math.floor(Math.random() * 2) + 1,
        weakCapture: prev.weakCapture + Math.floor(Math.random() * 4) + 1,
        generalized: prev.generalized + Math.floor(Math.random() * 2) + 1,
        safetyScore: Math.min(100, prev.safetyScore + (Math.random() - 0.3) * 2)
      }));
    }, 900);
    
    return () => clearInterval(interval);
  }, []);

  const captureTypes = [
    { name: 'valueCapture', pos: [-3, 2, 0] as const, color: '#00ff88', label: 'Smart Ptr Copy' },
    { name: 'moveCapture', pos: [-1, 2, 0] as const, color: '#00d4ff', label: 'Move Capture' },
    { name: 'weakCapture', pos: [1, 2, 0] as const, color: '#ff6b6b', label: 'Weak Capture' },
    { name: 'generalized', pos: [3, 2, 0] as const, color: '#ffa500', label: 'Generalized' },
  ] as const;

  return (
    <group>
      {captureTypes.map((type) => (
        <group key={type.name}>
          <Box
            position={type.pos as [number, number, number]}
            args={[1.4, 0.8, 0.4]}
          >
            <meshStandardMaterial
              color={type.color}
              opacity={0.8 + (captureMetrics[type.name] % 10) / 100}
              transparent
            />
          </Box>
          <Text
            position={[type.pos[0], type.pos[1] + 1, type.pos[2]]}
            fontSize={0.22}
            color="white"
            anchorX="center"
          >
            {type.label}
          </Text>
          <Text
            position={[type.pos[0], type.pos[1] - 1, type.pos[2]]}
            fontSize={0.35}
            color={type.color}
            anchorX="center"
          >
            {captureMetrics[type.name]}
          </Text>
        </group>
      ))}
      
      <Sphere position={[0, 0, 0]} args={[0.4]}>
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </Sphere>
      
      {/* Connection lines showing lambda capture relationships */}
      <Line
        points={[[-3, 2, 0], [0, 0, 0], [1, 2, 0], [3, 2, 0]]}
        color="#ffffff"
        lineWidth={2}
        opacity={0.6}
        transparent
      />
      
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
      >
        Lambda Capture Mastery
      </Text>
      
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.25}
        color={captureMetrics.safetyScore > 90 ? '#00ff88' : '#ff6b6b'}
        anchorX="center"
      >
        {`Memory Safety: ${captureMetrics.safetyScore.toFixed(1)}%`}
      </Text>
    </group>
  );
}

export default function Lesson102_LambdaCapturesWithPointers() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'Smart Pointer Capture Fundamentals' : 'Fundamentos de Captura de Punteros Inteligentes',
      code: `#include <memory>
#include <functional>
#include <iostream>
#include <vector>
#include <future>
#include <chrono>

// Clase base para demostrar diferentes tipos de captura
class Resource {
private:
    std::string name_;
    int data_;
    
public:
    Resource(const std::string& name, int data) : name_(name), data_(data) {
        std::cout << "Resource '" << name_ << "' created with data=" << data_ << std::endl;
    }
    
    ~Resource() {
        std::cout << "Resource '" << name_ << "' destroyed" << std::endl;
    }
    
    void process() const {
        std::cout << "Processing " << name_ << " (data=" << data_ << ")" << std::endl;
    }
    
    const std::string& name() const { return name_; }
    int data() const { return data_; }
    void set_data(int new_data) { data_ = new_data; }
};

// Demostración de capturas fundamentales con shared_ptr
void demonstrate_shared_ptr_captures() {
    std::cout << "\\n=== Smart Pointer Capture Fundamentals ===" << std::endl;
    
    auto resource = std::make_shared<Resource>("SharedResource", 42);
    
    std::cout << "Initial use_count: " << resource.use_count() << std::endl;
    
    // 1. Captura por valor - SEGURO para operaciones asíncronas
    auto lambda_by_value = [resource](const std::string& operation) {
        std::cout << "Lambda by value - use_count: " << resource.use_count() << std::endl;
        std::cout << "Performing " << operation << " on: ";
        resource->process();
        return resource->data();
    };
    
    // 2. Captura por referencia - PELIGROSO si la lambda sobrevive el scope
    auto lambda_by_reference = [&resource](const std::string& operation) {
        if (resource) {  // Siempre verificar en captura por referencia
            std::cout << "Lambda by reference - use_count: " << resource.use_count() << std::endl;
            std::cout << "Performing " << operation << " on: ";
            resource->process();
            return resource->data();
        }
        std::cout << "Resource is null in reference capture!" << std::endl;
        return -1;
    };
    
    // 3. Captura explícita con copia - control total
    auto lambda_explicit_copy = [resource_copy = resource](const std::string& operation) mutable {
        std::cout << "Lambda explicit copy - use_count: " << resource_copy.use_count() << std::endl;
        resource_copy->set_data(resource_copy->data() * 2);
        resource_copy->process();
        return resource_copy->data();
    };
    
    // Ejecutar lambdas
    std::cout << "\\nExecuting lambdas:" << std::endl;
    lambda_by_value("analysis");
    lambda_by_reference("verification");
    lambda_explicit_copy("modification");
    
    std::cout << "Final use_count: " << resource.use_count() << std::endl;
    std::cout << "Original resource data: " << resource->data() << std::endl;
}

// Demostración de move capture con unique_ptr
void demonstrate_unique_ptr_move_capture() {
    std::cout << "\\n=== Unique Pointer Move Capture ===" << std::endl;
    
    auto unique_resource = std::make_unique<Resource>("UniqueResource", 100);
    
    // INCORRECTO: No se puede capturar unique_ptr por valor
    // auto bad_lambda = [unique_resource]() { /* Error de compilación */ };
    
    // CORRECTO: Move capture transfiere ownership
    auto lambda_move = [resource = std::move(unique_resource)](const std::string& task) mutable -> std::unique_ptr<Resource> {
        if (resource) {
            std::cout << "Processing task: " << task << std::endl;
            resource->process();
            
            // Transferir ownership de vuelta si es necesario
            return std::move(resource);
        }
        std::cout << "No resource available for task: " << task << std::endl;
        return nullptr;
    };
    
    // unique_resource es ahora nullptr
    if (!unique_resource) {
        std::cout << "Original unique_ptr is now null (moved)" << std::endl;
    }
    
    // Ejecutar lambda y recuperar ownership
    auto returned_resource = lambda_move("data_processing");
    
    if (returned_resource) {
        std::cout << "Recovered resource: " << returned_resource->name() << std::endl;
        returned_resource->process();
    }
    
    // Segundo intento - resource ya fue movido
    auto should_be_null = lambda_move("second_attempt");
    if (!should_be_null) {
        std::cout << "Second attempt correctly returned null" << std::endl;
    }
}

// Captura con inicialización perfecta
template<typename T>
auto create_perfect_capture_lambda(T&& smart_ptr) {
    return [captured = std::forward<T>(smart_ptr)](auto&& operation) {
        if constexpr (requires { captured->process(); }) {
            captured->process();
            
            // Diferentes comportamientos según el tipo
            if constexpr (std::is_same_v<std::decay_t<T>, std::shared_ptr<Resource>>) {
                std::cout << "Working with shared_ptr, use_count: " << captured.use_count() << std::endl;
            } else if constexpr (std::is_same_v<std::decay_t<T>, std::unique_ptr<Resource>>) {
                std::cout << "Working with unique_ptr (exclusive ownership)" << std::endl;
            }
            
            return std::forward<decltype(operation)>(operation)(captured.get());
        }
        return false;
    };
}

// Wrapper para captura segura de shared_ptr
class safe_shared_capture {
private:
    std::weak_ptr<Resource> weak_resource_;
    
public:
    template<typename T>
    explicit safe_shared_capture(std::shared_ptr<T> ptr) 
        : weak_resource_(std::static_pointer_cast<Resource>(ptr)) {}
    
    template<typename Func>
    auto operator()(Func&& func) -> decltype(func(std::shared_ptr<Resource>{})) {
        if (auto locked = weak_resource_.lock()) {
            return func(locked);
        } else {
            std::cout << "Resource expired, cannot execute operation" << std::endl;
            if constexpr (!std::is_void_v<decltype(func(std::shared_ptr<Resource>{}))>) {
                return decltype(func(std::shared_ptr<Resource>{})){};
            }
        }
    }
    
    bool is_valid() const {
        return !weak_resource_.expired();
    }
};

void demonstrate_perfect_forwarding_capture() {
    std::cout << "\\n=== Perfect Forwarding Capture ===" << std::endl;
    
    // Test con shared_ptr
    auto shared_res = std::make_shared<Resource>("SharedForwarded", 200);
    auto shared_lambda = create_perfect_capture_lambda(shared_res);
    
    shared_lambda([](Resource* r) {
        std::cout << "Shared lambda executed with resource: " << r->name() << std::endl;
        return true;
    });
    
    // Test con unique_ptr
    auto unique_res = std::make_unique<Resource>("UniqueForwarded", 300);
    auto unique_lambda = create_perfect_capture_lambda(std::move(unique_res));
    
    unique_lambda([](Resource* r) {
        std::cout << "Unique lambda executed with resource: " << r->name() << std::endl;
        return true;
    });
    
    // Test con safe capture wrapper
    auto safe_resource = std::make_shared<Resource>("SafeCaptured", 400);
    safe_shared_capture safe_capture(safe_resource);
    
    // Lambda que usa safe capture
    auto safe_lambda = [safe_capture](const std::string& task) mutable {
        return safe_capture([&task](std::shared_ptr<Resource> res) {
            std::cout << "Safe execution of task: " << task << std::endl;
            res->process();
            return res->data();
        });
    };
    
    int result = safe_lambda("safe_task");
    std::cout << "Safe lambda result: " << result << std::endl;
    
    // Destruir el resource original
    safe_resource.reset();
    
    // Intentar usar safe capture después de que el resource expire
    int expired_result = safe_lambda("expired_task");
    std::cout << "Expired lambda result: " << expired_result << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Advanced Move Semantics & Generalized Capture' : 'Semántica de Movimiento Avanzada y Captura Generalizada',
      code: `#include <memory>
#include <functional>
#include <type_traits>
#include <utility>
#include <vector>
#include <algorithm>

// Plantilla para captura generalizada con move semantics avanzado
template<typename... Ptrs>
class multi_pointer_capture {
private:
    std::tuple<Ptrs...> pointers_;
    
public:
    template<typename... Args>
    explicit multi_pointer_capture(Args&&... args) 
        : pointers_(std::forward<Args>(args)...) {}
    
    // Acceso seguro por índice
    template<size_t I>
    auto& get() { return std::get<I>(pointers_); }
    
    template<size_t I>
    const auto& get() const { return std::get<I>(pointers_); }
    
    // Aplicar función a todos los punteros válidos
    template<typename Func>
    void for_each_valid(Func&& func) {
        std::apply([&func](auto&&... ptrs) {
            (apply_if_valid(func, ptrs), ...);
        }, pointers_);
    }
    
private:
    template<typename Func, typename Ptr>
    void apply_if_valid(Func& func, Ptr& ptr) {
        if constexpr (requires { ptr.get(); }) {
            if (ptr && ptr.get()) {
                func(*ptr);
            }
        } else if constexpr (std::is_pointer_v<std::decay_t<Ptr>>) {
            if (ptr) {
                func(*ptr);
            }
        }
    }
};

// Factory para crear lambdas con múltiples capturas
template<typename... Ptrs>
auto make_multi_capture_lambda(Ptrs&&... ptrs) {
    return [capture = multi_pointer_capture<std::decay_t<Ptrs>...>(
        std::forward<Ptrs>(ptrs)...)](auto&& operation) mutable {
        
        return operation(capture);
    };
}

// Captura con transformación automática (weak_ptr para shared_ptr)
template<typename T>
class auto_weak_capture {
private:
    std::weak_ptr<T> weak_ptr_;
    
public:
    // Constructor para shared_ptr - automáticamente convierte a weak_ptr
    explicit auto_weak_capture(std::shared_ptr<T> ptr) : weak_ptr_(ptr) {}
    
    // Operador de función con lock automático
    template<typename Func>
    auto operator()(Func&& func) -> std::optional<decltype(func(std::shared_ptr<T>{}))> {
        if (auto locked = weak_ptr_.lock()) {
            if constexpr (std::is_void_v<decltype(func(locked))>) {
                func(locked);
                return std::make_optional(true);  // Placeholder para void
            } else {
                return std::make_optional(func(locked));
            }
        }
        return std::nullopt;
    }
    
    bool expired() const { return weak_ptr_.expired(); }
    size_t use_count() const { return weak_ptr_.use_count(); }
};

// Captura con lifetime tracking personalizado
template<typename T, typename LifetimeTracker>
class tracked_capture {
private:
    T captured_object_;
    LifetimeTracker tracker_;
    
public:
    template<typename U, typename Tracker>
    tracked_capture(U&& obj, Tracker&& tracker) 
        : captured_object_(std::forward<U>(obj)), 
          tracker_(std::forward<Tracker>(tracker)) {}
    
    template<typename Func>
    auto execute(Func&& func) -> decltype(func(captured_object_)) {
        if (tracker_.is_valid()) {
            tracker_.on_access();
            return func(captured_object_);
        } else {
            throw std::runtime_error("Object lifetime expired");
        }
    }
    
    const LifetimeTracker& lifetime_tracker() const { return tracker_; }
};

// Lifetime tracker básico
class simple_lifetime_tracker {
private:
    mutable std::atomic<bool> valid_{true};
    mutable std::atomic<size_t> access_count_{0};
    
public:
    void invalidate() const { valid_ = false; }
    bool is_valid() const { return valid_; }
    void on_access() const { access_count_++; }
    size_t access_count() const { return access_count_; }
};

// Move-only capture wrapper
template<typename T>
class move_only_capture {
private:
    mutable std::optional<T> storage_;
    
public:
    explicit move_only_capture(T&& obj) : storage_(std::move(obj)) {}
    
    // No copiable
    move_only_capture(const move_only_capture&) = delete;
    move_only_capture& operator=(const move_only_capture&) = delete;
    
    // Movible
    move_only_capture(move_only_capture&& other) noexcept 
        : storage_(std::move(other.storage_)) {}
    
    move_only_capture& operator=(move_only_capture&& other) noexcept {
        if (this != &other) {
            storage_ = std::move(other.storage_);
        }
        return *this;
    }
    
    // Extracción destructiva - solo se puede usar una vez
    T extract() const {
        if (!storage_.has_value()) {
            throw std::runtime_error("Object already extracted");
        }
        T result = std::move(*storage_);
        storage_.reset();
        return result;
    }
    
    bool is_valid() const { return storage_.has_value(); }
    
    // Aplicar función sin extraer (permite múltiples usos)
    template<typename Func>
    auto apply(Func&& func) -> decltype(func(std::declval<T&>())) {
        if (!storage_.has_value()) {
            throw std::runtime_error("Object already extracted");
        }
        return func(*storage_);
    }
};

// Helper para crear move-only captures
template<typename T>
auto make_move_capture(T&& obj) {
    return move_only_capture<std::decay_t<T>>(std::forward<T>(obj));
}

// Ejemplo de uso avanzado
class AdvancedResource {
private:
    std::string id_;
    std::vector<int> data_;
    simple_lifetime_tracker tracker_;
    
public:
    AdvancedResource(const std::string& id, std::initializer_list<int> data)
        : id_(id), data_(data) {
        std::cout << "AdvancedResource '" << id_ << "' created" << std::endl;
    }
    
    ~AdvancedResource() {
        tracker_.invalidate();
        std::cout << "AdvancedResource '" << id_ << "' destroyed (accessed " 
                  << tracker_.access_count() << " times)" << std::endl;
    }
    
    void process(const std::string& operation) {
        std::cout << "Resource " << id_ << " processing: " << operation << std::endl;
        std::for_each(data_.begin(), data_.end(), [](int& x) { x *= 2; });
    }
    
    const std::vector<int>& data() const { return data_; }
    const std::string& id() const { return id_; }
    const simple_lifetime_tracker& lifetime_tracker() const { return tracker_; }
};

void demonstrate_generalized_capture() {
    std::cout << "\\n=== Generalized Capture Patterns ===" << std::endl;
    
    // 1. Multi-pointer capture
    auto shared_res1 = std::make_shared<AdvancedResource>("Shared1", {1, 2, 3});
    auto shared_res2 = std::make_shared<AdvancedResource>("Shared2", {4, 5, 6});
    auto unique_res = std::make_unique<AdvancedResource>("Unique1", {7, 8, 9});
    
    auto multi_lambda = make_multi_capture_lambda(
        shared_res1, shared_res2, std::move(unique_res)
    );
    
    multi_lambda([](auto& capture) {
        std::cout << "Processing all captured resources:" << std::endl;
        capture.for_each_valid([](const AdvancedResource& res) {
            std::cout << "  Found resource: " << res.id() << std::endl;
        });
    });
    
    // 2. Auto weak capture
    auto weak_capture = auto_weak_capture(shared_res1);
    
    auto weak_lambda = [weak_capture](const std::string& operation) mutable {
        auto result = weak_capture([&operation](std::shared_ptr<AdvancedResource> res) {
            res->process(operation);
            return res->data().size();
        });
        
        if (result.has_value()) {
            std::cout << "Weak capture succeeded, data size: " << *result << std::endl;
        } else {
            std::cout << "Weak capture failed - resource expired" << std::endl;
        }
    };
    
    weak_lambda("weak_operation");
    
    // Eliminar la referencia original
    shared_res1.reset();
    weak_lambda("expired_operation");
    
    // 3. Tracked capture
    auto tracked_res = std::make_shared<AdvancedResource>("Tracked", {10, 11, 12});
    auto tracked = tracked_capture(tracked_res, tracked_res->lifetime_tracker());
    
    auto tracked_lambda = [tracked](const std::string& operation) mutable {
        try {
            tracked.execute([&operation](std::shared_ptr<AdvancedResource> res) {
                res->process(operation);
                std::cout << "Tracked operation completed successfully" << std::endl;
            });
        } catch (const std::exception& e) {
            std::cout << "Tracked operation failed: " << e.what() << std::endl;
        }
    };
    
    tracked_lambda("tracked_operation");
    
    // 4. Move-only capture
    auto move_only_res = std::make_unique<AdvancedResource>("MoveOnly", {13, 14, 15});
    auto move_capture = make_move_capture(std::move(move_only_res));
    
    auto move_lambda = [move_capture](bool extract) mutable {
        if (extract) {
            try {
                auto extracted = move_capture.extract();
                std::cout << "Successfully extracted: " << extracted->id() << std::endl;
                extracted->process("final_operation");
                return extracted;  // Transfer ownership out
            } catch (const std::exception& e) {
                std::cout << "Extraction failed: " << e.what() << std::endl;
                return std::unique_ptr<AdvancedResource>{};
            }
        } else {
            try {
                move_capture.apply([](auto& res) {
                    res->process("non_destructive");
                    std::cout << "Non-destructive operation on: " << res->id() << std::endl;
                });
                return std::unique_ptr<AdvancedResource>{};
            } catch (const std::exception& e) {
                std::cout << "Apply failed: " << e.what() << std::endl;
                return std::unique_ptr<AdvancedResource>{};
            }
        }
    };
    
    // Uso no destructivo
    move_lambda(false);
    
    // Extracción destructiva
    auto final_resource = move_lambda(true);
    if (final_resource) {
        std::cout << "Final resource obtained: " << final_resource->id() << std::endl;
    }
    
    // Segundo intento de extracción (debe fallar)
    move_lambda(true);
}`
    },
    {
      title: state.language === 'en' ? 'Custom Capture Wrapper Patterns' : 'Patrones de Wrapper de Captura Personalizada',
      code: `#include <memory>
#include <functional>
#include <mutex>
#include <shared_mutex>
#include <atomic>
#include <chrono>
#include <thread>

// Thread-safe capture wrapper
template<typename T>
class thread_safe_capture {
private:
    T data_;
    mutable std::shared_mutex mutex_;
    
public:
    template<typename U>
    explicit thread_safe_capture(U&& data) : data_(std::forward<U>(data)) {}
    
    // Lectura con shared lock
    template<typename Func>
    auto read(Func&& func) const -> decltype(func(data_)) {
        std::shared_lock<std::shared_mutex> lock(mutex_);
        return func(data_);
    }
    
    // Escritura con unique lock
    template<typename Func>
    auto write(Func&& func) -> decltype(func(data_)) {
        std::unique_lock<std::shared_mutex> lock(mutex_);
        return func(data_);
    }
    
    // Try-lock operations
    template<typename Func>
    std::optional<decltype(func(std::declval<T&>()))> try_read(
        Func&& func, std::chrono::milliseconds timeout = std::chrono::milliseconds(100)) const {
        
        std::shared_lock<std::shared_mutex> lock(mutex_, timeout);
        if (lock.owns_lock()) {
            if constexpr (std::is_void_v<decltype(func(data_))>) {
                func(data_);
                return std::make_optional(true);
            } else {
                return std::make_optional(func(data_));
            }
        }
        return std::nullopt;
    }
    
    template<typename Func>
    std::optional<decltype(func(std::declval<T&>()))> try_write(
        Func&& func, std::chrono::milliseconds timeout = std::chrono::milliseconds(100)) {
        
        std::unique_lock<std::shared_mutex> lock(mutex_, timeout);
        if (lock.owns_lock()) {
            if constexpr (std::is_void_v<decltype(func(data_))>) {
                func(data_);
                return std::make_optional(true);
            } else {
                return std::make_optional(func(data_));
            }
        }
        return std::nullopt;
    }
};

// Lazy capture - deferred initialization
template<typename T>
class lazy_capture {
private:
    mutable std::optional<T> storage_;
    std::function<T()> initializer_;
    mutable std::once_flag initialized_;
    
public:
    template<typename Func>
    explicit lazy_capture(Func&& init_func) 
        : initializer_(std::forward<Func>(init_func)) {}
    
    const T& get() const {
        std::call_once(initialized_, [this]() {
            storage_ = initializer_();
        });
        return *storage_;
    }
    
    T& get() {
        std::call_once(initialized_, [this]() {
            storage_ = initializer_();
        });
        return *storage_;
    }
    
    bool is_initialized() const {
        return storage_.has_value();
    }
    
    // Apply function with lazy initialization
    template<typename Func>
    auto apply(Func&& func) -> decltype(func(std::declval<T&>())) {
        return func(get());
    }
};

// Cacheable capture - stores function results
template<typename KeyType, typename ValueType>
class cacheable_capture {
private:
    std::function<ValueType(const KeyType&)> computer_;
    mutable std::unordered_map<KeyType, ValueType> cache_;
    mutable std::mutex cache_mutex_;
    size_t max_cache_size_;
    
public:
    template<typename Func>
    explicit cacheable_capture(Func&& computer, size_t max_cache_size = 1000)
        : computer_(std::forward<Func>(computer)), max_cache_size_(max_cache_size) {}
    
    ValueType get(const KeyType& key) {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        
        auto it = cache_.find(key);
        if (it != cache_.end()) {
            return it->second;
        }
        
        // Compute new value
        ValueType value = computer_(key);
        
        // Evict old entries if cache is full
        if (cache_.size() >= max_cache_size_) {
            auto to_remove = cache_.begin();
            cache_.erase(to_remove);
        }
        
        cache_[key] = value;
        return value;
    }
    
    void clear_cache() {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        cache_.clear();
    }
    
    size_t cache_size() const {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        return cache_.size();
    }
};

// Reference-counting capture for manual lifetime management
template<typename T>
class ref_counted_capture {
private:
    std::shared_ptr<T> data_;
    
public:
    template<typename U>
    explicit ref_counted_capture(U&& data) 
        : data_(std::make_shared<T>(std::forward<U>(data))) {}
    
    // Crear una copia ligera (solo incrementa ref count)
    ref_counted_capture copy() const {
        ref_counted_capture result;
        result.data_ = data_;
        return result;
    }
    
    // Crear weak reference
    std::weak_ptr<T> weak_ref() const {
        return std::weak_ptr<T>(data_);
    }
    
    template<typename Func>
    auto apply(Func&& func) const -> decltype(func(*data_)) {
        return func(*data_);
    }
    
    size_t use_count() const {
        return data_ ? data_.use_count() : 0;
    }
    
    T* get() const { return data_.get(); }
    T& operator*() const { return *data_; }
    T* operator->() const { return data_.get(); }
    
private:
    ref_counted_capture() = default;  // Para copy()
};

// Scoped capture con RAII cleanup automático
template<typename T, typename CleanupFunc>
class scoped_capture {
private:
    T data_;
    CleanupFunc cleanup_;
    
public:
    template<typename U, typename Cleanup>
    scoped_capture(U&& data, Cleanup&& cleanup) 
        : data_(std::forward<U>(data)), cleanup_(std::forward<Cleanup>(cleanup)) {}
    
    ~scoped_capture() {
        cleanup_(data_);
    }
    
    // No copiable, solo movible
    scoped_capture(const scoped_capture&) = delete;
    scoped_capture& operator=(const scoped_capture&) = delete;
    
    scoped_capture(scoped_capture&& other) noexcept
        : data_(std::move(other.data_)), cleanup_(std::move(other.cleanup_)) {}
    
    scoped_capture& operator=(scoped_capture&& other) noexcept {
        if (this != &other) {
            cleanup_(data_);  // Cleanup old data
            data_ = std::move(other.data_);
            cleanup_ = std::move(other.cleanup_);
        }
        return *this;
    }
    
    template<typename Func>
    auto apply(Func&& func) -> decltype(func(data_)) {
        return func(data_);
    }
    
    const T& get() const { return data_; }
    T& get() { return data_; }
};

// Helper function para crear scoped captures
template<typename T, typename CleanupFunc>
auto make_scoped_capture(T&& data, CleanupFunc&& cleanup) {
    return scoped_capture<std::decay_t<T>, std::decay_t<CleanupFunc>>(
        std::forward<T>(data), std::forward<CleanupFunc>(cleanup)
    );
}

// Conditional capture - captura solo si se cumple condición
template<typename T, typename Predicate>
class conditional_capture {
private:
    std::optional<T> storage_;
    Predicate condition_;
    
public:
    template<typename U, typename Pred>
    conditional_capture(U&& data, Pred&& pred) : condition_(std::forward<Pred>(pred)) {
        if (condition_(data)) {
            storage_ = std::forward<U>(data);
        }
    }
    
    bool is_captured() const { return storage_.has_value(); }
    
    template<typename Func, typename DefaultFunc>
    auto apply_or(Func&& func, DefaultFunc&& default_func) 
        -> std::common_type_t<decltype(func(*storage_)), decltype(default_func())> {
        
        if (storage_.has_value()) {
            return func(*storage_);
        } else {
            return default_func();
        }
    }
    
    template<typename Func>
    auto apply_if_captured(Func&& func) -> std::optional<decltype(func(*storage_))> {
        if (storage_.has_value()) {
            if constexpr (std::is_void_v<decltype(func(*storage_))>) {
                func(*storage_);
                return std::make_optional(true);
            } else {
                return std::make_optional(func(*storage_));
            }
        }
        return std::nullopt;
    }
};

// Ejemplo integral de uso
class ComplexResource {
private:
    std::string name_;
    std::vector<int> data_;
    std::atomic<bool> valid_{true};
    
public:
    ComplexResource(const std::string& name, std::initializer_list<int> data)
        : name_(name), data_(data) {
        std::cout << "ComplexResource '" << name_ << "' created" << std::endl;
    }
    
    ~ComplexResource() {
        valid_ = false;
        std::cout << "ComplexResource '" << name_ << "' destroyed" << std::endl;
    }
    
    void process(const std::string& operation) {
        if (valid_) {
            std::cout << name_ << " processing: " << operation << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
        }
    }
    
    int compute(int input) {
        if (valid_) {
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            return input * data_.size();
        }
        return -1;
    }
    
    const std::string& name() const { return name_; }
    bool is_valid() const { return valid_; }
};

void demonstrate_custom_wrappers() {
    std::cout << "\\n=== Custom Capture Wrapper Patterns ===" << std::endl;
    
    // 1. Thread-safe capture
    auto resource = std::make_shared<ComplexResource>("ThreadSafe", {1, 2, 3, 4, 5});
    auto thread_safe = thread_safe_capture(resource);
    
    auto thread_safe_lambda = [thread_safe](const std::string& operation) mutable {
        // Multiple threads can safely read
        thread_safe.read([&operation](std::shared_ptr<ComplexResource> res) {
            res->process("read_" + operation);
        });
        
        // Exclusive write access
        thread_safe.write([&operation](std::shared_ptr<ComplexResource> res) {
            res->process("write_" + operation);
        });
    };
    
    thread_safe_lambda("concurrent_test");
    
    // 2. Lazy capture
    auto lazy = lazy_capture<std::shared_ptr<ComplexResource>>([]{
        std::cout << "Lazy initialization triggered" << std::endl;
        return std::make_shared<ComplexResource>("LazyCreated", {10, 20, 30});
    });
    
    auto lazy_lambda = [lazy](bool trigger) mutable {
        if (trigger) {
            std::cout << "Accessing lazy resource..." << std::endl;
            lazy.apply([](std::shared_ptr<ComplexResource> res) {
                res->process("lazy_operation");
            });
        }
        std::cout << "Lazy initialized: " << std::boolalpha << lazy.is_initialized() << std::endl;
    };
    
    lazy_lambda(false);  // No initialization
    lazy_lambda(true);   // Triggers initialization
    lazy_lambda(true);   // Uses cached value
    
    // 3. Cacheable capture
    auto cached = cacheable_capture<int, int>(
        [resource](int input) {
            std::cout << "Computing expensive result for input: " << input << std::endl;
            return resource->compute(input);
        },
        5  // Max cache size
    );
    
    auto cached_lambda = [cached](const std::vector<int>& inputs) mutable {
        for (int input : inputs) {
            int result = cached.get(input);
            std::cout << "Input " << input << " -> Result " << result << std::endl;
        }
        std::cout << "Cache size: " << cached.cache_size() << std::endl;
    };
    
    cached_lambda({1, 2, 3, 1, 2, 4, 5});  // 1,2 should hit cache
    
    // 4. Reference-counted capture
    auto ref_counted = ref_counted_capture(
        ComplexResource("RefCounted", {100, 200, 300})
    );
    
    // Create multiple copies
    auto copy1 = ref_counted.copy();
    auto copy2 = ref_counted.copy();
    
    std::cout << "Ref count: " << ref_counted.use_count() << std::endl;
    
    // 5. Scoped capture con cleanup
    auto scoped_lambda = [](const std::string& name) {
        auto scoped = make_scoped_capture(
            ComplexResource(name, {1, 2, 3}),
            [](ComplexResource& res) {
                std::cout << "Cleaning up scoped resource: " << res.name() << std::endl;
            }
        );
        
        scoped.apply([](ComplexResource& res) {
            res.process("scoped_operation");
        });
        
        // Cleanup happens automatically when scoped goes out of scope
    };
    
    scoped_lambda("ScopedResource");
    
    // 6. Conditional capture
    auto conditional = conditional_capture(
        resource,
        [](std::shared_ptr<ComplexResource> res) {
            return res && res->is_valid();
        }
    );
    
    auto conditional_lambda = [conditional](const std::string& operation) mutable {
        conditional.apply_or(
            [&operation](std::shared_ptr<ComplexResource> res) {
                res->process(operation);
                return true;
            },
            []() {
                std::cout << "Resource not captured (condition failed)" << std::endl;
                return false;
            }
        );
    };
    
    conditional_lambda("conditional_operation");
}`
    },
    {
      title: state.language === 'en' ? 'Memory Safety & Lambda Closure Patterns' : 'Seguridad de Memoria y Patrones de Clausura Lambda',
      code: `#include <memory>
#include <functional>
#include <vector>
#include <unordered_set>
#include <algorithm>
#include <cassert>

// RAII Lambda closure con automatic cleanup
template<typename Lambda>
class raii_lambda_closure {
private:
    Lambda lambda_;
    std::function<void()> cleanup_;
    bool executed_ = false;
    
public:
    template<typename L, typename Cleanup>
    raii_lambda_closure(L&& lambda, Cleanup&& cleanup) 
        : lambda_(std::forward<L>(lambda)), cleanup_(std::forward<Cleanup>(cleanup)) {}
    
    ~raii_lambda_closure() {
        if (!executed_) {
            cleanup_();
        }
    }
    
    // Execute lambda y marcar como ejecutado
    template<typename... Args>
    auto operator()(Args&&... args) -> decltype(lambda_(std::forward<Args>(args)...)) {
        executed_ = true;
        return lambda_(std::forward<Args>(args)...);
    }
    
    bool is_executed() const { return executed_; }
};

// Memory-safe callback system
class callback_manager {
public:
    using CallbackId = size_t;
    
private:
    struct CallbackEntry {
        std::function<void()> callback;
        std::weak_ptr<void> lifetime_tracker;
        bool one_shot;
        
        CallbackEntry(std::function<void()> cb, std::weak_ptr<void> tracker, bool once)
            : callback(std::move(cb)), lifetime_tracker(tracker), one_shot(once) {}
    };
    
    std::unordered_map<CallbackId, CallbackEntry> callbacks_;
    CallbackId next_id_ = 1;
    mutable std::mutex callbacks_mutex_;
    
public:
    // Register callback con lifetime tracking
    template<typename T, typename Callback>
    CallbackId register_callback(std::shared_ptr<T> lifetime_object, 
                                 Callback&& callback, bool one_shot = false) {
        std::lock_guard<std::mutex> lock(callbacks_mutex_);
        
        CallbackId id = next_id_++;
        callbacks_.emplace(id, CallbackEntry(
            std::forward<Callback>(callback),
            std::weak_ptr<void>(lifetime_object),
            one_shot
        ));
        
        return id;
    }
    
    // Register callback sin lifetime tracking (peligroso)
    template<typename Callback>
    CallbackId register_unsafe_callback(Callback&& callback, bool one_shot = false) {
        std::lock_guard<std::mutex> lock(callbacks_mutex_);
        
        CallbackId id = next_id_++;
        callbacks_.emplace(id, CallbackEntry(
            std::forward<Callback>(callback),
            std::weak_ptr<void>(),
            one_shot
        ));
        
        return id;
    }
    
    bool unregister_callback(CallbackId id) {
        std::lock_guard<std::mutex> lock(callbacks_mutex_);
        return callbacks_.erase(id) > 0;
    }
    
    void execute_callbacks() {
        std::vector<std::function<void()>> to_execute;
        std::vector<CallbackId> to_remove;
        
        {
            std::lock_guard<std::mutex> lock(callbacks_mutex_);
            
            for (auto& [id, entry] : callbacks_) {
                if (entry.lifetime_tracker.expired() && 
                    !entry.lifetime_tracker.owner_before(std::weak_ptr<void>()) &&
                    !std::weak_ptr<void>().owner_before(entry.lifetime_tracker)) {
                    // Lifetime object expired
                    to_remove.push_back(id);
                } else {
                    to_execute.push_back(entry.callback);
                    
                    if (entry.one_shot) {
                        to_remove.push_back(id);
                    }
                }
            }
            
            // Remove expired and one-shot callbacks
            for (CallbackId id : to_remove) {
                callbacks_.erase(id);
            }
        }
        
        // Execute callbacks outside lock
        for (auto& callback : to_execute) {
            callback();
        }
    }
    
    size_t active_callbacks() const {
        std::lock_guard<std::mutex> lock(callbacks_mutex_);
        return callbacks_.size();
    }
};

// Safe lambda factory con memory tracking
class safe_lambda_factory {
private:
    std::unordered_set<void*> tracked_objects_;
    mutable std::mutex tracking_mutex_;
    
public:
    // Create lambda con automatic object tracking
    template<typename Object, typename Lambda>
    auto create_safe_lambda(std::shared_ptr<Object> obj, Lambda&& lambda) {
        // Track object
        {
            std::lock_guard<std::mutex> lock(tracking_mutex_);
            tracked_objects_.insert(obj.get());
        }
        
        return [this, obj, lambda = std::forward<Lambda>(lambda)](auto&&... args) mutable -> decltype(auto) {
            // Verify object is still tracked
            {
                std::lock_guard<std::mutex> lock(tracking_mutex_);
                if (tracked_objects_.find(obj.get()) == tracked_objects_.end()) {
                    throw std::runtime_error("Object no longer tracked - potential use-after-free");
                }
            }
            
            return lambda(obj, std::forward<decltype(args)>(args)...);
        };
    }
    
    // Create lambda con weak reference safety
    template<typename Object, typename Lambda>
    auto create_weak_lambda(std::weak_ptr<Object> weak_obj, Lambda&& lambda) {
        return [weak_obj, lambda = std::forward<Lambda>(lambda)](auto&&... args) -> std::optional<decltype(lambda(std::shared_ptr<Object>{}, std::forward<decltype(args)>(args)...))> {
            
            if (auto obj = weak_obj.lock()) {
                if constexpr (std::is_void_v<decltype(lambda(obj, std::forward<decltype(args)>(args)...))>) {
                    lambda(obj, std::forward<decltype(args)>(args)...);
                    return std::make_optional(true);
                } else {
                    return std::make_optional(lambda(obj, std::forward<decltype(args)>(args)...));
                }
            }
            return std::nullopt;
        };
    }
    
    // Untrack object manualmente
    template<typename Object>
    void untrack_object(Object* obj) {
        std::lock_guard<std::mutex> lock(tracking_mutex_);
        tracked_objects_.erase(obj);
    }
    
    size_t tracked_objects_count() const {
        std::lock_guard<std::mutex> lock(tracking_mutex_);
        return tracked_objects_.size();
    }
};

// Memory pool para lambdas (previene fragmentación)
template<size_t BlockSize = 4096>
class lambda_memory_pool {
private:
    struct Block {
        alignas(std::max_align_t) char data[BlockSize];
        size_t used = 0;
        std::unique_ptr<Block> next;
    };
    
    std::unique_ptr<Block> first_block_;
    Block* current_block_ = nullptr;
    std::mutex allocation_mutex_;
    
    void allocate_new_block() {
        auto new_block = std::make_unique<Block>();
        if (!first_block_) {
            first_block_ = std::move(new_block);
            current_block_ = first_block_.get();
        } else {
            current_block_->next = std::move(new_block);
            current_block_ = current_block_->next.get();
        }
    }
    
public:
    template<typename T>
    T* allocate() {
        std::lock_guard<std::mutex> lock(allocation_mutex_);
        
        constexpr size_t size = sizeof(T);
        constexpr size_t alignment = alignof(T);
        
        if (!current_block_ || current_block_->used + size > BlockSize) {
            allocate_new_block();
        }
        
        // Align allocation
        size_t aligned_offset = (current_block_->used + alignment - 1) & ~(alignment - 1);
        if (aligned_offset + size > BlockSize) {
            allocate_new_block();
            aligned_offset = 0;
        }
        
        T* result = reinterpret_cast<T*>(current_block_->data + aligned_offset);
        current_block_->used = aligned_offset + size;
        
        return result;
    }
    
    // Note: No deallocate - pool cleanup happens on destruction
    void reset() {
        std::lock_guard<std::mutex> lock(allocation_mutex_);
        for (auto* block = first_block_.get(); block; block = block->next.get()) {
            block->used = 0;
        }
        current_block_ = first_block_.get();
    }
    
    size_t total_allocated() const {
        std::lock_guard<std::mutex> lock(allocation_mutex_);
        size_t total = 0;
        for (auto* block = first_block_.get(); block; block = block->next.get()) {
            total += block->used;
        }
        return total;
    }
};

// Lambda con stack overflow protection
template<size_t MaxDepth = 1000>
class stack_safe_lambda {
private:
    static thread_local size_t recursion_depth_;
    
    struct recursion_guard {
        recursion_guard() { ++recursion_depth_; }
        ~recursion_guard() { --recursion_depth_; }
    };
    
public:
    template<typename Lambda, typename... Args>
    static auto execute_safe(Lambda&& lambda, Args&&... args) 
        -> std::optional<decltype(lambda(std::forward<Args>(args)...))> {
        
        if (recursion_depth_ >= MaxDepth) {
            return std::nullopt;  // Stack overflow prevention
        }
        
        recursion_guard guard;
        
        if constexpr (std::is_void_v<decltype(lambda(std::forward<Args>(args)...))>) {
            lambda(std::forward<Args>(args)...);
            return std::make_optional(true);
        } else {
            return std::make_optional(lambda(std::forward<Args>(args)...));
        }
    }
    
    static size_t current_depth() {
        return recursion_depth_;
    }
};

template<size_t MaxDepth>
thread_local size_t stack_safe_lambda<MaxDepth>::recursion_depth_ = 0;

// Ejemplo de uso integral
class ManagedResource {
private:
    std::string name_;
    std::vector<int> data_;
    std::atomic<bool> active_{true};
    
public:
    ManagedResource(const std::string& name, std::initializer_list<int> data)
        : name_(name), data_(data) {
        std::cout << "ManagedResource '" << name_ << "' created" << std::endl;
    }
    
    ~ManagedResource() {
        active_ = false;
        std::cout << "ManagedResource '" << name_ << "' destroyed" << std::endl;
    }
    
    void process(const std::string& operation) {
        if (active_) {
            std::cout << name_ << " processing: " << operation 
                     << " (data size: " << data_.size() << ")" << std::endl;
        }
    }
    
    int recursive_compute(int n) {
        if (n <= 1) return 1;
        return n * recursive_compute(n - 1);
    }
    
    const std::string& name() const { return name_; }
    bool is_active() const { return active_; }
};

void demonstrate_memory_safety() {
    std::cout << "\\n=== Memory Safety & Lambda Closure Patterns ===" << std::endl;
    
    callback_manager mgr;
    safe_lambda_factory factory;
    
    // 1. Safe callback registration con lifetime tracking
    {
        auto resource = std::make_shared<ManagedResource>("CallbackResource", {1, 2, 3, 4, 5});
        
        auto callback_id = mgr.register_callback(resource, 
            [resource]() {
                resource->process("safe_callback");
            }
        );
        
        std::cout << "Active callbacks: " << mgr.active_callbacks() << std::endl;
        mgr.execute_callbacks();
        
        // Resource still exists, callback should execute
        mgr.execute_callbacks();
        
    } // resource destroyed here
    
    std::cout << "After resource destruction:" << std::endl;
    mgr.execute_callbacks();  // Should clean up expired callbacks
    std::cout << "Active callbacks: " << mgr.active_callbacks() << std::endl;
    
    // 2. Safe lambda factory
    {
        auto resource = std::make_shared<ManagedResource>("FactoryResource", {10, 20, 30});
        
        auto safe_lambda = factory.create_safe_lambda(resource, 
            [](std::shared_ptr<ManagedResource> res, const std::string& op) {
                res->process(op);
                return res->name();
            }
        );
        
        std::string result = safe_lambda("factory_operation");
        std::cout << "Safe lambda result: " << result << std::endl;
        
        // Create weak lambda
        std::weak_ptr<ManagedResource> weak_res = resource;
        auto weak_lambda = factory.create_weak_lambda(weak_res,
            [](std::shared_ptr<ManagedResource> res, int value) {
                res->process("weak_operation_" + std::to_string(value));
                return value * 2;
            }
        );
        
        auto weak_result = weak_lambda(42);
        if (weak_result.has_value()) {
            std::cout << "Weak lambda result: " << *weak_result << std::endl;
        }
        
        // Reset resource and try weak lambda again
        resource.reset();
        auto expired_result = weak_lambda(99);
        if (!expired_result.has_value()) {
            std::cout << "Weak lambda correctly detected expired resource" << std::endl;
        }
    }
    
    // 3. Stack-safe recursive lambda
    auto recursive_resource = std::make_shared<ManagedResource>("RecursiveResource", {1, 2, 3});
    
    auto recursive_lambda = [recursive_resource](int n) -> std::optional<int> {
        return stack_safe_lambda<50>::execute_safe([&](int depth) {
            return recursive_resource->recursive_compute(depth);
        }, n);
    };
    
    // Test normal recursion
    auto result1 = recursive_lambda(5);
    if (result1.has_value()) {
        std::cout << "Recursive result (5): " << *result1 << std::endl;
    }
    
    // Test stack overflow prevention
    auto result2 = recursive_lambda(100);  // Should hit recursion limit
    if (!result2.has_value()) {
        std::cout << "Stack overflow correctly prevented for deep recursion" << std::endl;
    }
    
    // 4. RAII lambda closure
    {
        auto cleanup_resource = std::make_shared<ManagedResource>("CleanupResource", {100});
        
        auto raii_closure = raii_lambda_closure(
            [cleanup_resource](const std::string& final_op) {
                cleanup_resource->process(final_op);
                std::cout << "RAII lambda executed successfully" << std::endl;
                return true;
            },
            []() {
                std::cout << "RAII cleanup: Lambda was not executed!" << std::endl;
            }
        );
        
        // Execute the lambda
        bool success = raii_closure("final_operation");
        std::cout << "RAII execution result: " << std::boolalpha << success << std::endl;
        
    } // Cleanup should not trigger since lambda was executed
    
    // 5. Lambda memory pool usage
    lambda_memory_pool<1024> pool;
    
    struct LambdaCapture {
        std::shared_ptr<ManagedResource> resource;
        std::vector<int> data;
        
        void execute() {
            resource->process("pooled_operation");
        }
    };
    
    // Allocate lambda capture from pool
    auto* capture = pool.allocate<LambdaCapture>();
    new(capture) LambdaCapture{
        std::make_shared<ManagedResource>("PooledResource", {1, 2, 3}),
        {10, 20, 30, 40, 50}
    };
    
    capture->execute();
    std::cout << "Pool allocated bytes: " << pool.total_allocated() << std::endl;
    
    // Explicit destructor call (since no automatic deallocation)
    capture->~LambdaCapture();
    
    std::cout << "Memory safety demonstration complete." << std::endl;
    std::cout << "Tracked objects: " << factory.tracked_objects_count() << std::endl;
}`
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 102: Advanced Lambda Captures with Pointers' : 'Lección 102: Capturas Lambda Avanzadas con Punteros'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <LambdaCaptureVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <SectionTitle>{state.language === 'en' ? 'Advanced Lambda Capture Techniques' : 'Técnicas Avanzadas de Captura Lambda'}</SectionTitle>
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
          <SectionTitle>{state.language === 'en' ? 'Expert-Level Concepts' : 'Conceptos de Nivel Experto'}</SectionTitle>
<div className="concept-grid">
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Smart Pointer Capture Mastery' : 'Maestría en Captura de Punteros Inteligentes'}</SectionTitle>
              <p>
                {state.language === 'en' 
                  ? 'Master value, reference, and move capture patterns with shared_ptr, unique_ptr, and weak_ptr for safe lifetime management.'
                  : 'Domina patrones de captura por valor, referencia y movimiento con shared_ptr, unique_ptr y weak_ptr para gestión segura del ciclo de vida.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Generalized Capture with Move Semantics' : 'Captura Generalizada con Semántica de Movimiento'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Implement advanced move capture patterns, perfect forwarding, and multi-pointer captures for optimal performance.'
                  : 'Implementa patrones avanzados de captura por movimiento, perfect forwarding y capturas multi-puntero para rendimiento óptimo.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Custom Capture Wrappers' : 'Wrappers de Captura Personalizados'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Design thread-safe, lazy, cacheable, and conditional capture wrappers for complex lambda lifetime scenarios.'
                  : 'Diseña wrappers de captura thread-safe, lazy, cacheables y condicionales para escenarios complejos de ciclo de vida lambda.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Memory Safety Patterns' : 'Patrones de Seguridad de Memoria'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Implement comprehensive memory safety with RAII closures, automatic cleanup, and stack overflow protection.'
                  : 'Implementa seguridad de memoria comprensiva con clausuras RAII, limpieza automática y protección contra desbordamiento de pila.'}
              </p>
          </div>
          </div>
        </div>

        <div className="best-practices">
          <SectionTitle>{state.language === 'en' ? 'Expert Best Practices' : 'Mejores Prácticas de Experto'}</SectionTitle>
<ul>
            <li>
              {state.language === 'en'
                ? 'Always capture shared_ptr by value for asynchronous operations to ensure object lifetime'
                : 'Siempre captura shared_ptr por valor para operaciones asíncronas para asegurar el ciclo de vida del objeto'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Use generalized capture with perfect forwarding for generic lambda patterns with different smart pointer types'
                : 'Usa captura generalizada con perfect forwarding para patrones lambda genéricos con diferentes tipos de punteros inteligentes'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement custom capture wrappers for thread safety, caching, and conditional execution scenarios'
                : 'Implementa wrappers de captura personalizados para thread safety, caching y escenarios de ejecución condicional'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Apply RAII principles to lambda closures with automatic cleanup for exception-safe resource management'
                : 'Aplica principios RAII a clausuras lambda con limpieza automática para gestión de recursos exception-safe'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Use weak_ptr captures to break circular dependencies and enable safe object lifetime checking'
                : 'Usa capturas weak_ptr para romper dependencias circulares y permitir verificación segura del ciclo de vida del objeto'}
            </li>
          </ul>
          </div>

        <div className="advanced-techniques">
          <SectionTitle>{state.language === 'en' ? 'Advanced Techniques Mastered' : 'Técnicas Avanzadas Dominadas'}</SectionTitle>
<div className="techniques-grid">
            <div className="technique-item">
              <span className="technique-icon">🎯</span>
              <SectionTitle>{state.language === 'en' ? 'Perfect Capture Initialization' : 'Inicialización Perfecta de Captura'}</SectionTitle>
              <p>{state.language === 'en' ? 'Universal reference capture with type deduction' : 'Captura de referencia universal con deducción de tipos'}</p>
          </div>
            
            <div className="technique-item">
              <span className="technique-icon">🔒</span>
              <SectionTitle>{state.language === 'en' ? 'Thread-Safe Lambda Closures' : 'Clausuras Lambda Thread-Safe'}</SectionTitle>
<p>{state.language === 'en' ? 'Mutex-protected captures with shared/exclusive locking' : 'Capturas protegidas con mutex con bloqueo compartido/exclusivo'}</p>
          </div>
            
            <div className="technique-item">
              <span className="technique-icon">⚡</span>
              <SectionTitle>{state.language === 'en' ? 'Lazy & Cached Evaluation' : 'Evaluación Lazy y Cacheada'}</SectionTitle>
<p>{state.language === 'en' ? 'Deferred initialization and memoization patterns' : 'Inicialización diferida y patrones de memoización'}</p>
          </div>
            
            <div className="technique-item">
              <span className="technique-icon">🛡️</span>
              <SectionTitle>{state.language === 'en' ? 'Memory Safety Guarantees' : 'Garantías de Seguridad de Memoria'}</SectionTitle>
<p>{state.language === 'en' ? 'RAII cleanup, stack protection, and lifetime tracking' : 'Limpieza RAII, protección de pila y seguimiento de ciclo de vida'}</p>
          </div>
          </div>
        </div>

        <div className="warning-section">
          <SectionTitle>{state.language === 'en' ? '⚠️ Critical Safety Considerations' : '⚠️ Consideraciones Críticas de Seguridad'}</SectionTitle>
<div className="warning-content">
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Reference Capture Dangers:' : 'Peligros de Captura por Referencia:'}</strong>
              <span>{state.language === 'en' 
                ? 'Never capture local variables by reference in lambdas that outlive their scope'
                : 'Nunca captures variables locales por referencia en lambdas que sobreviven su scope'}</span>
          </div>
            
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Circular Dependencies:' : 'Dependencias Circulares:'}</strong>
              <span>{state.language === 'en'
                ? 'Use weak_ptr captures to prevent shared_ptr cycles in callback systems'
                : 'Usa capturas weak_ptr para prevenir ciclos shared_ptr en sistemas de callbacks'}</span>
            </div>
            
            <div className="warning-item">
              <strong>{state.language === 'en' ? 'Move Semantics:' : 'Semántica de Movimiento:'}</strong>
              <span>{state.language === 'en'
                ? 'Understand that moved objects are left in valid but unspecified state'
                : 'Entiende que objetos movidos quedan en estado válido pero no especificado'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}