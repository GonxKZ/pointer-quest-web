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



function IntrusiveRefVisualization() {
  const [refCounts, setRefCounts] = useState({ 
    strong: 3, 
    weak: 2, 
    cyclic: 1,
    performance: 95
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRefCounts(prev => ({
        strong: Math.max(0, prev.strong + (Math.random() > 0.5 ? 1 : -1)),
        weak: Math.max(0, prev.weak + (Math.random() > 0.6 ? 1 : -1)),
        cyclic: prev.cyclic + (Math.random() > 0.8 ? 1 : 0),
        performance: Math.min(100, prev.performance + (Math.random() - 0.5) * 2)
      }));
    }, 800);
    
    return () => clearInterval(interval);
  }, []);

  const refTypes = [
    { name: 'strong', pos: [-3, 2, 0] as const, color: '#00ff88', label: 'Strong Refs' },
    { name: 'weak', pos: [-1, 2, 0] as const, color: '#00d4ff', label: 'Weak Refs' },
    { name: 'cyclic', pos: [1, 2, 0] as const, color: '#ff6b6b', label: 'Cycles' },
    { name: 'performance', pos: [3, 2, 0] as const, color: '#ffa500', label: 'Performance' }
  ] as const;

  return (
    <group>
      {refTypes.map((type) => (
        <group key={type.name}>
          <Box
            position={type.pos as [number, number, number]}
            args={[1.4, 0.8, 0.4]}
          >
            <meshStandardMaterial
              color={type.color}
              opacity={0.8}
              transparent
            />
          </Box>
          <Text
            position={[type.pos[0], type.pos[1] + 1, type.pos[2]]}
            fontSize={0.25}
            color="white"
            anchorX="center"
          >
            {type.label}
          </Text>
          <Text
            position={[type.pos[0], type.pos[1] - 1, type.pos[2]]}
            fontSize={0.4}
            color={type.color}
            anchorX="center"
          >
            {type.name === 'performance' ? `${refCounts[type.name].toFixed(0)}%` : refCounts[type.name]}
          </Text>
        </group>
      ))}
      
      <Sphere position={[0, 0, 0]} args={[0.4]}>
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </Sphere>
      
      {/* Connection lines */}
      <Line
        points={[[-3, 2, 0], [0, 0, 0], [1, 2, 0]]}
        color="#ffffff"
        lineWidth={2}
        opacity={0.5}
        transparent
      />
      
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
      >
        Intrusive Reference System
      </Text>
    </group>
  );
}

export default function Lesson101_IntrusiveRefCounting() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'Thread-Safe Intrusive Base' : 'Base Intrusiva Thread-Safe',
      code: `#include <atomic>
#include <memory>
#include <functional>
#include <type_traits>

// Base class optimizada para reference counting thread-safe
class intrusive_ref_count_base {
private:
    mutable std::atomic<size_t> ref_count_{1};  // Comienza en 1
    mutable std::atomic<size_t> weak_count_{1}; // Control block siempre existe

protected:
    virtual ~intrusive_ref_count_base() = default;

public:
    intrusive_ref_count_base() = default;
    
    // No copiable para evitar problemas de referencia
    intrusive_ref_count_base(const intrusive_ref_count_base&) = delete;
    intrusive_ref_count_base& operator=(const intrusive_ref_count_base&) = delete;

    // Thread-safe reference management
    void add_ref() const noexcept {
        ref_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release() const noexcept {
        if (ref_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            // Última referencia strong, destruir objeto
            delete this;
            
            // Decrementar weak count por el objeto destruido
            if (weak_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                // No hay más referencias weak, limpiar completamente
                delete_control_block();
            }
        }
    }
    
    void add_weak_ref() const noexcept {
        weak_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release_weak() const noexcept {
        if (weak_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            delete_control_block();
        }
    }
    
    size_t use_count() const noexcept {
        return ref_count_.load(std::memory_order_acquire);
    }
    
    bool expired() const noexcept {
        return ref_count_.load(std::memory_order_acquire) == 0;
    }

private:
    virtual void delete_control_block() const {
        // En esta implementación simple, el control block es parte del objeto
        // En implementaciones más avanzadas, podría ser separado
    }
};

// Implementación con custom deleter
template<typename Deleter = std::default_delete<void>>
class intrusive_ref_count_base_deleter {
private:
    mutable std::atomic<size_t> ref_count_{1};
    mutable std::atomic<size_t> weak_count_{1};
    [[no_unique_address]] mutable Deleter deleter_;

protected:
    virtual ~intrusive_ref_count_base_deleter() = default;

public:
    template<typename Del = Deleter>
    explicit intrusive_ref_count_base_deleter(Del&& del = Del{}) 
        : deleter_(std::forward<Del>(del)) {}
    
    intrusive_ref_count_base_deleter(const intrusive_ref_count_base_deleter&) = delete;
    intrusive_ref_count_base_deleter& operator=(const intrusive_ref_count_base_deleter&) = delete;

    void add_ref() const noexcept {
        ref_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release() const noexcept {
        if (ref_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            // Usar custom deleter
            deleter_(const_cast<intrusive_ref_count_base_deleter*>(this));
            
            if (weak_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                delete_control_block();
            }
        }
    }
    
    void add_weak_ref() const noexcept {
        weak_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release_weak() const noexcept {
        if (weak_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            delete_control_block();
        }
    }
    
    size_t use_count() const noexcept {
        return ref_count_.load(std::memory_order_acquire);
    }
    
    bool expired() const noexcept {
        return ref_count_.load(std::memory_order_acquire) == 0;
    }

private:
    virtual void delete_control_block() const {
        // Custom cleanup si es necesario
    }
};

// Intrusive pointer optimizado
template<typename T>
class intrusive_ptr {
private:
    T* ptr_;
    
    static_assert(std::is_base_of_v<intrusive_ref_count_base, T> ||
                  std::is_base_of_v<intrusive_ref_count_base_deleter<>, T>,
                  "T must inherit from intrusive reference count base");

public:
    using element_type = T;
    using pointer = T*;
    
    // Constructores
    constexpr intrusive_ptr() noexcept : ptr_(nullptr) {}
    constexpr intrusive_ptr(std::nullptr_t) noexcept : ptr_(nullptr) {}
    
    explicit intrusive_ptr(T* p, bool add_ref = true) noexcept : ptr_(p) {
        if (ptr_ && add_ref) {
            ptr_->add_ref();
        }
    }
    
    // Copy constructor
    intrusive_ptr(const intrusive_ptr& other) noexcept : ptr_(other.ptr_) {
        if (ptr_) {
            ptr_->add_ref();
        }
    }
    
    // Move constructor
    intrusive_ptr(intrusive_ptr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    // Destructor
    ~intrusive_ptr() {
        if (ptr_) {
            ptr_->release();
        }
    }
    
    // Assignment operators
    intrusive_ptr& operator=(const intrusive_ptr& other) noexcept {
        if (this != &other) {
            if (other.ptr_) {
                other.ptr_->add_ref();
            }
            if (ptr_) {
                ptr_->release();
            }
            ptr_ = other.ptr_;
        }
        return *this;
    }
    
    intrusive_ptr& operator=(intrusive_ptr&& other) noexcept {
        if (this != &other) {
            if (ptr_) {
                ptr_->release();
            }
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    intrusive_ptr& operator=(T* p) noexcept {
        if (p) {
            p->add_ref();
        }
        if (ptr_) {
            ptr_->release();
        }
        ptr_ = p;
        return *this;
    }
    
    // Access
    T& operator*() const noexcept { return *ptr_; }
    T* operator->() const noexcept { return ptr_; }
    T* get() const noexcept { return ptr_; }
    
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
    
    // Utilities
    void swap(intrusive_ptr& other) noexcept {
        std::swap(ptr_, other.ptr_);
    }
    
    void reset(T* p = nullptr) noexcept {
        intrusive_ptr(p).swap(*this);
    }
    
    T* release() noexcept {
        T* result = ptr_;
        ptr_ = nullptr;
        return result;
    }
    
    size_t use_count() const noexcept {
        return ptr_ ? ptr_->use_count() : 0;
    }
    
    // Comparisons
    bool operator==(const intrusive_ptr& other) const noexcept {
        return ptr_ == other.ptr_;
    }
    
    bool operator!=(const intrusive_ptr& other) const noexcept {
        return ptr_ != other.ptr_;
    }
    
    bool operator<(const intrusive_ptr& other) const noexcept {
        return std::less<T*>{}(ptr_, other.ptr_);
    }
};

// Factory functions
template<typename T, typename... Args>
intrusive_ptr<T> make_intrusive(Args&&... args) {
    return intrusive_ptr<T>(new T(std::forward<Args>(args)...), false);
}

template<typename T, typename Deleter, typename... Args>
intrusive_ptr<T> make_intrusive_with_deleter(Deleter&& del, Args&&... args) {
    return intrusive_ptr<T>(new T(std::forward<Deleter>(del), 
                                  std::forward<Args>(args)...), false);
}

// Comparisons globales
template<typename T, typename U>
bool operator==(const intrusive_ptr<T>& a, const intrusive_ptr<U>& b) noexcept {
    return a.get() == b.get();
}

template<typename T>
bool operator==(const intrusive_ptr<T>& a, std::nullptr_t) noexcept {
    return !a;
}

template<typename T>
bool operator==(std::nullptr_t, const intrusive_ptr<T>& a) noexcept {
    return !a;
}

// Cast functions
template<typename T, typename U>
intrusive_ptr<T> static_pointer_cast(const intrusive_ptr<U>& r) noexcept {
    return intrusive_ptr<T>(static_cast<T*>(r.get()));
}

template<typename T, typename U>
intrusive_ptr<T> dynamic_pointer_cast(const intrusive_ptr<U>& r) noexcept {
    return intrusive_ptr<T>(dynamic_cast<T*>(r.get()));
}

template<typename T, typename U>
intrusive_ptr<T> const_pointer_cast(const intrusive_ptr<U>& r) noexcept {
    return intrusive_ptr<T>(const_cast<T*>(r.get()));
}`
    },
    {
      title: state.language === 'en' ? 'Weak Reference Support' : 'Soporte para Referencias Débiles',
      code: `#include <atomic>
#include <memory>

// Weak pointer para intrusive system
template<typename T>
class intrusive_weak_ptr {
private:
    T* ptr_;
    
    static_assert(std::is_base_of_v<intrusive_ref_count_base, T>,
                  "T must inherit from intrusive_ref_count_base");

public:
    using element_type = T;
    
    // Constructores
    constexpr intrusive_weak_ptr() noexcept : ptr_(nullptr) {}
    
    intrusive_weak_ptr(const intrusive_ptr<T>& r) noexcept : ptr_(r.get()) {
        if (ptr_) {
            ptr_->add_weak_ref();
        }
    }
    
    intrusive_weak_ptr(const intrusive_weak_ptr& other) noexcept : ptr_(other.ptr_) {
        if (ptr_) {
            ptr_->add_weak_ref();
        }
    }
    
    intrusive_weak_ptr(intrusive_weak_ptr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    ~intrusive_weak_ptr() {
        if (ptr_) {
            ptr_->release_weak();
        }
    }
    
    // Assignment
    intrusive_weak_ptr& operator=(const intrusive_weak_ptr& other) noexcept {
        if (this != &other) {
            if (other.ptr_) {
                other.ptr_->add_weak_ref();
            }
            if (ptr_) {
                ptr_->release_weak();
            }
            ptr_ = other.ptr_;
        }
        return *this;
    }
    
    intrusive_weak_ptr& operator=(intrusive_weak_ptr&& other) noexcept {
        if (this != &other) {
            if (ptr_) {
                ptr_->release_weak();
            }
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    intrusive_weak_ptr& operator=(const intrusive_ptr<T>& r) noexcept {
        if (r.get()) {
            r.get()->add_weak_ref();
        }
        if (ptr_) {
            ptr_->release_weak();
        }
        ptr_ = r.get();
        return *this;
    }
    
    // Lock - convertir a strong reference si el objeto aún existe
    intrusive_ptr<T> lock() const noexcept {
        if (ptr_ && !ptr_->expired()) {
            // Intento thread-safe de promoción
            size_t current_count = ptr_->use_count();
            while (current_count > 0) {
                if (ptr_->ref_count_.compare_exchange_weak(
                    current_count, current_count + 1, 
                    std::memory_order_acquire, 
                    std::memory_order_relaxed)) {
                    
                    return intrusive_ptr<T>(ptr_, false);  // No add_ref, ya incrementado
                }
                // Retry si CAS falló
                current_count = ptr_->use_count();
            }
        }
        return intrusive_ptr<T>();  // Objeto expirado o nulo
    }
    
    bool expired() const noexcept {
        return !ptr_ || ptr_->expired();
    }
    
    void reset() noexcept {
        intrusive_weak_ptr().swap(*this);
    }
    
    void swap(intrusive_weak_ptr& other) noexcept {
        std::swap(ptr_, other.ptr_);
    }
    
    size_t use_count() const noexcept {
        return ptr_ ? ptr_->use_count() : 0;
    }
};

// Cycle detection utilities
class cycle_detector {
public:
    template<typename T>
    static bool has_cycle(const intrusive_ptr<T>& root) {
        if (!root) return false;
        
        std::unordered_set<const void*> visited;
        std::unordered_set<const void*> recursion_stack;
        
        return detect_cycle_dfs(root.get(), visited, recursion_stack);
    }
    
    template<typename T>
    static std::vector<T*> find_cycle_path(const intrusive_ptr<T>& root) {
        if (!root) return {};
        
        std::vector<T*> path;
        std::unordered_set<const void*> visited;
        
        if (find_cycle_path_dfs(root.get(), path, visited)) {
            return path;
        }
        
        return {};
    }

private:
    template<typename T>
    static bool detect_cycle_dfs(T* node, 
                                std::unordered_set<const void*>& visited,
                                std::unordered_set<const void*>& recursion_stack) {
        if (!node) return false;
        
        const void* node_ptr = static_cast<const void*>(node);
        
        if (recursion_stack.find(node_ptr) != recursion_stack.end()) {
            return true;  // Ciclo detectado
        }
        
        if (visited.find(node_ptr) != visited.end()) {
            return false;  // Ya visitado en otro camino
        }
        
        visited.insert(node_ptr);
        recursion_stack.insert(node_ptr);
        
        // Visitar referencias (implementación específica del tipo)
        bool has_cycle = visit_references(node, visited, recursion_stack);
        
        recursion_stack.erase(node_ptr);
        return has_cycle;
    }
    
    template<typename T>
    static bool find_cycle_path_dfs(T* node,
                                   std::vector<T*>& path,
                                   std::unordered_set<const void*>& visited) {
        if (!node) return false;
        
        const void* node_ptr = static_cast<const void*>(node);
        
        // Verificar si ya está en el path (ciclo encontrado)
        auto it = std::find_if(path.begin(), path.end(), 
                              [node_ptr](const T* p) {
                                  return static_cast<const void*>(p) == node_ptr;
                              });
        
        if (it != path.end()) {
            // Truncar path al ciclo
            path.erase(path.begin(), it);
            return true;
        }
        
        if (visited.find(node_ptr) != visited.end()) {
            return false;
        }
        
        visited.insert(node_ptr);
        path.push_back(node);
        
        // Visitar referencias
        if (visit_references_for_path(node, path, visited)) {
            return true;
        }
        
        path.pop_back();
        return false;
    }
    
    // Estas funciones necesitan ser especializadas para tipos específicos
    template<typename T>
    static bool visit_references(T* node,
                                std::unordered_set<const void*>& visited,
                                std::unordered_set<const void*>& recursion_stack) {
        // Implementación por defecto - necesita especialización
        return false;
    }
    
    template<typename T>
    static bool visit_references_for_path(T* node,
                                         std::vector<T*>& path,
                                         std::unordered_set<const void*>& visited) {
        // Implementación por defecto - necesita especialización
        return false;
    }
};

// Cycle breaker automático
template<typename T>
class cycle_breaking_ptr : public intrusive_ptr<T> {
private:
    using base = intrusive_ptr<T>;
    bool cycle_detection_enabled_ = true;

public:
    using base::base;  // Heredar constructores
    
    cycle_breaking_ptr& operator=(const intrusive_ptr<T>& other) {
        if (cycle_detection_enabled_ && other) {
            // Verificar ciclos antes de asignar
            auto temp = *this;
            base::operator=(other);
            
            if (cycle_detector::has_cycle(*this)) {
                // Revertir asignación si se detecta ciclo
                base::operator=(temp);
                throw std::runtime_error("Cycle detected, assignment reverted");
            }
        } else {
            base::operator=(other);
        }
        return *this;
    }
    
    void enable_cycle_detection(bool enable = true) {
        cycle_detection_enabled_ = enable;
    }
    
    bool is_cycle_detection_enabled() const {
        return cycle_detection_enabled_;
    }
    
    std::vector<T*> get_cycle_path() const {
        if (!*this) return {};
        return cycle_detector::find_cycle_path(*this);
    }
};

// Ejemplo de uso con Node que puede tener ciclos
class GraphNode : public intrusive_ref_count_base {
public:
    std::string name;
    std::vector<intrusive_ptr<GraphNode>> children;
    intrusive_weak_ptr<GraphNode> parent;  // Weak para evitar ciclos padre-hijo
    
    GraphNode(const std::string& n) : name(n) {}
    
    void add_child(intrusive_ptr<GraphNode> child) {
        if (child) {
            child->parent = intrusive_weak_ptr<GraphNode>(*this);
            children.push_back(std::move(child));
        }
    }
    
    intrusive_ptr<GraphNode> get_parent() const {
        return parent.lock();  // Conversión segura weak->strong
    }
    
    void print_hierarchy(int depth = 0) const {
        std::cout << std::string(depth * 2, ' ') << name 
                  << " (refs: " << use_count() << ")" << std::endl;
        
        for (const auto& child : children) {
            if (child) {
                child->print_hierarchy(depth + 1);
            }
        }
    }
};

// Especialización del detector de ciclos para GraphNode
template<>
bool cycle_detector::visit_references<GraphNode>(
    GraphNode* node,
    std::unordered_set<const void*>& visited,
    std::unordered_set<const void*>& recursion_stack) {
    
    for (const auto& child : node->children) {
        if (child && detect_cycle_dfs(child.get(), visited, recursion_stack)) {
            return true;
        }
    }
    
    // También verificar parent si es strong reference
    if (auto parent = node->get_parent()) {
        if (detect_cycle_dfs(parent.get(), visited, recursion_stack)) {
            return true;
        }
    }
    
    return false;
}`
    },
    {
      title: state.language === 'en' ? 'Custom Allocator Integration' : 'Integración con Allocadores Personalizados',
      code: `#include <memory>
#include <atomic>

// Intrusive object con custom allocator support
template<typename Allocator = std::allocator<void>>
class intrusive_ref_count_base_alloc {
private:
    mutable std::atomic<size_t> ref_count_{1};
    mutable std::atomic<size_t> weak_count_{1};
    [[no_unique_address]] mutable Allocator allocator_;

protected:
    virtual ~intrusive_ref_count_base_alloc() = default;

public:
    using allocator_type = Allocator;
    
    template<typename Alloc = Allocator>
    explicit intrusive_ref_count_base_alloc(Alloc&& alloc = Alloc{})
        : allocator_(std::forward<Alloc>(alloc)) {}
    
    intrusive_ref_count_base_alloc(const intrusive_ref_count_base_alloc&) = delete;
    intrusive_ref_count_base_alloc& operator=(const intrusive_ref_count_base_alloc&) = delete;

    void add_ref() const noexcept {
        ref_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release() const noexcept {
        if (ref_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            destroy_object();
            
            if (weak_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                deallocate_self();
            }
        }
    }
    
    void add_weak_ref() const noexcept {
        weak_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release_weak() const noexcept {
        if (weak_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            deallocate_self();
        }
    }
    
    size_t use_count() const noexcept {
        return ref_count_.load(std::memory_order_acquire);
    }
    
    bool expired() const noexcept {
        return ref_count_.load(std::memory_order_acquire) == 0;
    }
    
    const Allocator& get_allocator() const noexcept {
        return allocator_;
    }

private:
    virtual void destroy_object() const {
        // Llamar destructor sin deallocar memoria
        this->~intrusive_ref_count_base_alloc();
    }
    
    virtual void deallocate_self() const {
        using AllocTraits = std::allocator_traits<Allocator>;
        using ObjectAlloc = typename AllocTraits::template rebind_alloc<
            intrusive_ref_count_base_alloc>;
        
        ObjectAlloc obj_alloc(allocator_);
        
        // Cast away const para deallocación
        auto* self = const_cast<intrusive_ref_count_base_alloc*>(this);
        
        AllocTraits::deallocate(obj_alloc, self, 1);
    }
};

// Pool allocator específico para objetos intrusivos
template<typename T, size_t PoolSize = 1024>
class intrusive_pool_allocator {
public:
    using value_type = T;
    using pointer = T*;
    using const_pointer = const T*;
    using size_type = size_t;
    
private:
    struct alignas(T) FreeNode {
        FreeNode* next;
    };
    
    struct Pool {
        alignas(T) char storage[PoolSize * sizeof(T)];
        std::atomic<FreeNode*> free_list;
        std::atomic<size_t> allocated_count{0};
        Pool* next_pool = nullptr;
        
        Pool() {
            // Inicializar free list
            char* current = storage;
            FreeNode* free_head = nullptr;
            
            for (size_t i = 0; i < PoolSize; ++i) {
                FreeNode* node = reinterpret_cast<FreeNode*>(current);
                node->next = free_head;
                free_head = node;
                current += sizeof(T);
            }
            
            free_list.store(free_head, std::memory_order_relaxed);
        }
    };
    
    mutable std::atomic<Pool*> current_pool_{nullptr};
    mutable std::mutex pool_mutex_;  // Para creación de pools

public:
    intrusive_pool_allocator() {
        current_pool_.store(new Pool(), std::memory_order_release);
    }
    
    ~intrusive_pool_allocator() {
        Pool* pool = current_pool_.load();
        while (pool) {
            Pool* next = pool->next_pool;
            delete pool;
            pool = next;
        }
    }
    
    template<typename U>
    intrusive_pool_allocator(const intrusive_pool_allocator<U, PoolSize>&) noexcept {}
    
    pointer allocate(size_type n) {
        if (n != 1) {
            throw std::bad_alloc();  // Solo soporta objetos individuales
        }
        
        Pool* pool = current_pool_.load(std::memory_order_acquire);
        
        while (pool) {
            FreeNode* head = pool->free_list.load(std::memory_order_acquire);
            
            while (head) {
                if (pool->free_list.compare_exchange_weak(
                    head, head->next,
                    std::memory_order_release,
                    std::memory_order_acquire)) {
                    
                    pool->allocated_count.fetch_add(1, std::memory_order_relaxed);
                    return reinterpret_cast<pointer>(head);
                }
            }
            
            // Pool actual está lleno, intentar crear nuevo
            {
                std::lock_guard<std::mutex> lock(pool_mutex_);
                
                // Double-check - otro thread pudo haber creado pool
                Pool* current = current_pool_.load(std::memory_order_acquire);
                if (current == pool) {
                    Pool* new_pool = new Pool();
                    new_pool->next_pool = pool;
                    current_pool_.store(new_pool, std::memory_order_release);
                    pool = new_pool;
                } else {
                    pool = current;
                }
            }
        }
        
        throw std::bad_alloc();
    }
    
    void deallocate(pointer p, size_type n) noexcept {
        if (n != 1 || !p) return;
        
        // Encontrar el pool que contiene este puntero
        Pool* pool = find_pool_for_pointer(p);
        if (!pool) return;  // Puntero no pertenece a ningún pool
        
        FreeNode* node = reinterpret_cast<FreeNode*>(p);
        FreeNode* head = pool->free_list.load(std::memory_order_acquire);
        
        do {
            node->next = head;
        } while (!pool->free_list.compare_exchange_weak(
            head, node,
            std::memory_order_release,
            std::memory_order_acquire));
        
        pool->allocated_count.fetch_sub(1, std::memory_order_relaxed);
    }
    
    template<typename U, typename... Args>
    void construct(U* p, Args&&... args) {
        ::new(p) U(std::forward<Args>(args)...);
    }
    
    template<typename U>
    void destroy(U* p) noexcept {
        p->~U();
    }
    
    size_type max_size() const noexcept {
        return std::numeric_limits<size_type>::max() / sizeof(T);
    }
    
    // Estadísticas
    struct Stats {
        size_t total_pools = 0;
        size_t total_allocated = 0;
        size_t total_capacity = 0;
    };
    
    Stats get_stats() const {
        Stats stats;
        Pool* pool = current_pool_.load(std::memory_order_acquire);
        
        while (pool) {
            ++stats.total_pools;
            stats.total_allocated += pool->allocated_count.load(std::memory_order_relaxed);
            stats.total_capacity += PoolSize;
            pool = pool->next_pool;
        }
        
        return stats;
    }

private:
    Pool* find_pool_for_pointer(pointer p) const {
        char* ptr_char = reinterpret_cast<char*>(p);
        Pool* pool = current_pool_.load(std::memory_order_acquire);
        
        while (pool) {
            char* pool_start = pool->storage;
            char* pool_end = pool_start + PoolSize * sizeof(T);
            
            if (ptr_char >= pool_start && ptr_char < pool_end) {
                return pool;
            }
            
            pool = pool->next_pool;
        }
        
        return nullptr;
    }
};

// Factory para objetos intrusivos con allocator personalizado
template<typename T, typename Allocator>
class intrusive_factory {
public:
    using allocator_type = Allocator;
    using allocator_traits = std::allocator_traits<Allocator>;
    
private:
    [[no_unique_address]] Allocator allocator_;

public:
    template<typename Alloc = Allocator>
    explicit intrusive_factory(Alloc&& alloc = Alloc{})
        : allocator_(std::forward<Alloc>(alloc)) {}
    
    template<typename... Args>
    intrusive_ptr<T> create(Args&&... args) {
        using ObjectAlloc = typename allocator_traits::template rebind_alloc<T>;
        ObjectAlloc obj_alloc(allocator_);
        
        T* ptr = allocator_traits::allocate(obj_alloc, 1);
        
        try {
            allocator_traits::construct(obj_alloc, ptr, 
                                       allocator_, std::forward<Args>(args)...);
            return intrusive_ptr<T>(ptr, false);  // No add_ref, ya comienza en 1
        } catch (...) {
            allocator_traits::deallocate(obj_alloc, ptr, 1);
            throw;
        }
    }
    
    const Allocator& get_allocator() const noexcept {
        return allocator_;
    }
};

// Ejemplo de uso
class PooledObject : public intrusive_ref_count_base_alloc<
    intrusive_pool_allocator<PooledObject, 256>> {
private:
    std::string data_;
    int value_;

public:
    template<typename Alloc>
    PooledObject(Alloc&& alloc, const std::string& data, int value)
        : intrusive_ref_count_base_alloc(std::forward<Alloc>(alloc)),
          data_(data), value_(value) {}
    
    const std::string& data() const { return data_; }
    int value() const { return value_; }
    
    void set_value(int v) { value_ = v; }
};

void allocator_integration_example() {
    // Crear factory con pool allocator
    using PoolAlloc = intrusive_pool_allocator<PooledObject, 256>;
    intrusive_factory<PooledObject, PoolAlloc> factory;
    
    // Crear objetos usando el pool
    std::vector<intrusive_ptr<PooledObject>> objects;
    
    for (int i = 0; i < 100; ++i) {
        auto obj = factory.create("Object " + std::to_string(i), i);
        objects.push_back(obj);
    }
    
    // Obtener estadísticas del pool
    auto stats = factory.get_allocator().get_stats();
    std::cout << "Pool stats - Pools: " << stats.total_pools
              << ", Allocated: " << stats.total_allocated
              << ", Capacity: " << stats.total_capacity << std::endl;
    
    // Los objetos se liberarán automáticamente cuando objects se destruya
}`
    },
    {
      title: state.language === 'en' ? 'Performance Comparison Framework' : 'Framework de Comparación de Rendimiento',
      code: `#include <chrono>
#include <memory>
#include <vector>
#include <random>
#include <iostream>
#include <iomanip>

// Benchmark comparativo entre std::shared_ptr e intrusive_ptr
class performance_comparator {
public:
    struct benchmark_result {
        std::string name;
        std::chrono::nanoseconds creation_time;
        std::chrono::nanoseconds copy_time;
        std::chrono::nanoseconds destruction_time;
        size_t memory_overhead;
        size_t ref_count_overhead;
    };

private:
    static constexpr size_t ITERATIONS = 1000000;
    static constexpr size_t OBJECT_SIZE = 64;

public:
    // Objeto de test simple
    struct test_object_intrusive : public intrusive_ref_count_base {
        char data[OBJECT_SIZE];
        int id;
        
        test_object_intrusive(int i) : id(i) {
            std::memset(data, i % 256, sizeof(data));
        }
    };
    
    struct test_object_shared {
        char data[OBJECT_SIZE];
        int id;
        
        test_object_shared(int i) : id(i) {
            std::memset(data, i % 256, sizeof(data));
        }
    };
    
    // Benchmark de creación
    template<typename CreateFunc>
    std::chrono::nanoseconds benchmark_creation(CreateFunc&& create_func, 
                                              size_t iterations = ITERATIONS) {
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < iterations; ++i) {
            auto obj = create_func(static_cast<int>(i));
            volatile auto* ptr = obj.get();  // Evitar optimización
            (void)ptr;
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        return std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
    }
    
    // Benchmark de copia
    template<typename ObjectPtr>
    std::chrono::nanoseconds benchmark_copy(const std::vector<ObjectPtr>& objects) {
        std::vector<ObjectPtr> copies;
        copies.reserve(objects.size());
        
        auto start = std::chrono::high_resolution_clock::now();
        
        for (const auto& obj : objects) {
            copies.push_back(obj);  // Copy construction
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        
        // Forzar uso de copies para evitar optimización
        volatile size_t sum = 0;
        for (const auto& copy : copies) {
            sum += copy->id;
        }
        (void)sum;
        
        return std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
    }
    
    // Benchmark de destrucción
    template<typename ObjectPtr>
    std::chrono::nanoseconds benchmark_destruction(std::vector<ObjectPtr>& objects) {
        auto start = std::chrono::high_resolution_clock::now();
        
        objects.clear();  // Destruir todos los objetos
        
        auto end = std::chrono::high_resolution_clock::now();
        return std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
    }
    
    // Análisis de overhead de memoria
    template<typename ObjectPtr>
    size_t calculate_memory_overhead() {
        constexpr size_t base_object_size = sizeof(test_object_shared);
        
        if constexpr (std::is_same_v<ObjectPtr, intrusive_ptr<test_object_intrusive>>) {
            return sizeof(test_object_intrusive) - base_object_size;
        } else {
            // Para shared_ptr, incluir el control block
            return sizeof(std::shared_ptr<test_object_shared>) + 
                   sizeof(std::__shared_weak_count);  // Aproximación del control block
        }
    }
    
    // Test completo de rendimiento
    benchmark_result run_intrusive_benchmark() {
        benchmark_result result;
        result.name = "intrusive_ptr";
        
        // Benchmark de creación
        result.creation_time = benchmark_creation([](int i) {
            return make_intrusive<test_object_intrusive>(i);
        });
        
        // Crear objetos para otros benchmarks
        std::vector<intrusive_ptr<test_object_intrusive>> objects;
        objects.reserve(ITERATIONS / 10);  // Menos objetos para evitar memoria excesiva
        
        for (size_t i = 0; i < ITERATIONS / 10; ++i) {
            objects.push_back(make_intrusive<test_object_intrusive>(static_cast<int>(i)));
        }
        
        // Benchmark de copia
        result.copy_time = benchmark_copy(objects);
        
        // Cálculo de overhead
        result.memory_overhead = calculate_memory_overhead<intrusive_ptr<test_object_intrusive>>();
        result.ref_count_overhead = sizeof(std::atomic<size_t>) * 2;  // strong + weak count
        
        // Benchmark de destrucción (debe ser último)
        result.destruction_time = benchmark_destruction(objects);
        
        return result;
    }
    
    benchmark_result run_shared_ptr_benchmark() {
        benchmark_result result;
        result.name = "std::shared_ptr";
        
        // Benchmark de creación
        result.creation_time = benchmark_creation([](int i) {
            return std::make_shared<test_object_shared>(i);
        });
        
        // Crear objetos para otros benchmarks
        std::vector<std::shared_ptr<test_object_shared>> objects;
        objects.reserve(ITERATIONS / 10);
        
        for (size_t i = 0; i < ITERATIONS / 10; ++i) {
            objects.push_back(std::make_shared<test_object_shared>(static_cast<int>(i)));
        }
        
        // Benchmark de copia
        result.copy_time = benchmark_copy(objects);
        
        // Cálculo de overhead
        result.memory_overhead = calculate_memory_overhead<std::shared_ptr<test_object_shared>>();
        result.ref_count_overhead = sizeof(std::atomic<long>) * 2;  // use_count + weak_count
        
        // Benchmark de destrucción
        result.destruction_time = benchmark_destruction(objects);
        
        return result;
    }
    
    void run_comparison() {
        std::cout << "=== Smart Pointer Performance Comparison ===" << std::endl;
        std::cout << "Iterations: " << ITERATIONS << std::endl;
        std::cout << "Object size: " << OBJECT_SIZE << " bytes" << std::endl << std::endl;
        
        auto intrusive_result = run_intrusive_benchmark();
        auto shared_result = run_shared_ptr_benchmark();
        
        print_results(intrusive_result, shared_result);
    }

private:
    void print_results(const benchmark_result& intrusive, 
                      const benchmark_result& shared) {
        auto format_time = [](std::chrono::nanoseconds ns) -> std::string {
            if (ns.count() < 1000) {
                return std::to_string(ns.count()) + " ns";
            } else if (ns.count() < 1000000) {
                return std::to_string(ns.count() / 1000) + " µs";
            } else {
                return std::to_string(ns.count() / 1000000) + " ms";
            }
        };
        
        auto format_ratio = [](double ratio) -> std::string {
            std::ostringstream oss;
            oss << std::fixed << std::setprecision(2) << ratio << "x";
            return oss.str();
        };
        
        std::cout << std::left << std::setw(20) << "Metric" 
                  << std::setw(15) << "intrusive_ptr" 
                  << std::setw(15) << "shared_ptr" 
                  << "Ratio (I/S)" << std::endl;
        std::cout << std::string(65, '-') << std::endl;
        
        // Creation time
        double creation_ratio = static_cast<double>(intrusive.creation_time.count()) / 
                               shared.creation_time.count();
        std::cout << std::left << std::setw(20) << "Creation" 
                  << std::setw(15) << format_time(intrusive.creation_time)
                  << std::setw(15) << format_time(shared.creation_time)
                  << format_ratio(creation_ratio) << std::endl;
        
        // Copy time
        double copy_ratio = static_cast<double>(intrusive.copy_time.count()) / 
                           shared.copy_time.count();
        std::cout << std::left << std::setw(20) << "Copy" 
                  << std::setw(15) << format_time(intrusive.copy_time)
                  << std::setw(15) << format_time(shared.copy_time)
                  << format_ratio(copy_ratio) << std::endl;
        
        // Destruction time
        double destruction_ratio = static_cast<double>(intrusive.destruction_time.count()) / 
                                  shared.destruction_time.count();
        std::cout << std::left << std::setw(20) << "Destruction" 
                  << std::setw(15) << format_time(intrusive.destruction_time)
                  << std::setw(15) << format_time(shared.destruction_time)
                  << format_ratio(destruction_ratio) << std::endl;
        
        // Memory overhead
        std::cout << std::left << std::setw(20) << "Memory overhead" 
                  << std::setw(15) << (std::to_string(intrusive.memory_overhead) + " bytes")
                  << std::setw(15) << (std::to_string(shared.memory_overhead) + " bytes")
                  << format_ratio(static_cast<double>(intrusive.memory_overhead) / 
                                 shared.memory_overhead) << std::endl;
        
        // Ref count overhead
        std::cout << std::left << std::setw(20) << "RefCount overhead" 
                  << std::setw(15) << (std::to_string(intrusive.ref_count_overhead) + " bytes")
                  << std::setw(15) << (std::to_string(shared.ref_count_overhead) + " bytes")
                  << format_ratio(static_cast<double>(intrusive.ref_count_overhead) / 
                                 shared.ref_count_overhead) << std::endl;
        
        std::cout << std::endl;
        
        // Resumen
        std::cout << "=== Summary ===" << std::endl;
        if (creation_ratio < 1.0) {
            std::cout << "✓ intrusive_ptr is " << format_ratio(1.0 / creation_ratio) 
                      << " faster at creation" << std::endl;
        } else {
            std::cout << "✗ shared_ptr is " << format_ratio(creation_ratio) 
                      << " faster at creation" << std::endl;
        }
        
        if (copy_ratio < 1.0) {
            std::cout << "✓ intrusive_ptr is " << format_ratio(1.0 / copy_ratio) 
                      << " faster at copying" << std::endl;
        } else {
            std::cout << "✗ shared_ptr is " << format_ratio(copy_ratio) 
                      << " faster at copying" << std::endl;
        }
        
        double memory_ratio = static_cast<double>(intrusive.memory_overhead) / 
                             shared.memory_overhead;
        if (memory_ratio < 1.0) {
            std::cout << "✓ intrusive_ptr uses " << format_ratio(1.0 / memory_ratio) 
                      << " less memory overhead" << std::endl;
        } else {
            std::cout << "✗ shared_ptr uses " << format_ratio(memory_ratio) 
                      << " less memory overhead" << std::endl;
        }
    }
};

// Función de ejemplo para ejecutar comparación
void run_performance_comparison() {
    performance_comparator comparator;
    comparator.run_comparison();
}`
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 101: Advanced Intrusive Reference Counting' : 'Lección 101: Conteo de Referencias Intrusivo Avanzado'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <IntrusiveRefVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <SectionTitle>{state.language === 'en' ? 'Advanced Intrusive Reference Counting' : 'Conteo de Referencias Intrusivo Avanzado'}</SectionTitle>
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
              <SectionTitle>{state.language === 'en' ? 'Thread-Safe Reference Counting' : 'Conteo de Referencias Thread-Safe'}</SectionTitle>
              <p>
                {state.language === 'en' 
                  ? 'Implement atomic reference counting with proper memory ordering for high-performance multithreaded systems.'
                  : 'Implementa conteo de referencias atómico con ordenamiento de memoria apropiado para sistemas multihilo de alto rendimiento.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Weak Reference Support' : 'Soporte para Referencias Débiles'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Advanced weak pointer implementation with safe promotion to strong references and cycle prevention.'
                  : 'Implementación avanzada de punteros débiles con promoción segura a referencias fuertes y prevención de ciclos.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Custom Allocator Integration' : 'Integración con Allocadores Personalizados'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Seamless integration with custom allocators including pool allocators for optimal memory management.'
                  : 'Integración perfecta con allocadores personalizados incluyendo pool allocators para gestión óptima de memoria.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Performance Optimization' : 'Optimización de Rendimiento'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Comprehensive performance analysis and optimization techniques compared to standard library alternatives.'
                  : 'Análisis comprensivo de rendimiento y técnicas de optimización comparadas con alternativas de la librería estándar.'}
              </p>
          </div>
          </div>
        </div>

        <div className="best-practices">
          <SectionTitle>{state.language === 'en' ? 'Best Practices' : 'Mejores Prácticas'}</SectionTitle>
<ul>
            <li>
              {state.language === 'en'
                ? 'Use weak references to break cycles in parent-child relationships automatically'
                : 'Usa referencias débiles para romper ciclos en relaciones padre-hijo automáticamente'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement proper memory ordering - relaxed for increments, acq_rel for decrements'
                : 'Implementa ordenamiento de memoria apropiado - relajado para incrementos, acq_rel para decrementos'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Integrate with custom allocators for better memory locality and reduced fragmentation'
                : 'Integra con allocadores personalizados para mejor localidad de memoria y fragmentación reducida'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Profile against std::shared_ptr to verify performance benefits for your specific use case'
                : 'Perfilá contra std::shared_ptr para verificar beneficios de rendimiento para tu caso de uso específico'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement comprehensive cycle detection tools for debugging complex object graphs'
                : 'Implementa herramientas comprensivas de detección de ciclos para debug de grafos de objetos complejos'}
            </li>
          </ul>
          </div>
      </div>
    </div>
  );
}