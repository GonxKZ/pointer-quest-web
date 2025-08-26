import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';
import { useApp } from '../context/AppContext';

function MasterPointerVisualization() {
  const [masterMetrics, setMasterMetrics] = useState({
    intrusive: 0,
    allocators: 0,
    patterns: 0,
    optimizations: 0,
    mastery: 0
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMasterMetrics(prev => ({
        intrusive: prev.intrusive + Math.floor(Math.random() * 2) + 1,
        allocators: prev.allocators + Math.floor(Math.random() * 3) + 1,
        patterns: prev.patterns + Math.floor(Math.random() * 2) + 1,
        optimizations: prev.optimizations + Math.floor(Math.random() * 4) + 1,
        mastery: Math.min(100, prev.mastery + 0.5)
      }));
    }, 800);
    
    return () => clearInterval(interval);
  }, []);

  const expertAreas = [
    { name: 'intrusive', pos: [-4, 2, 0], color: '#00ff88', label: 'Intrusive Containers' },
    { name: 'allocators', pos: [-2, 2, 0], color: '#00d4ff', label: 'Custom Allocators' },
    { name: 'patterns', pos: [0, 2, 0], color: '#ff6b6b', label: 'Design Patterns' },
    { name: 'optimizations', pos: [2, 2, 0], color: '#ffa500', label: 'Optimizations' },
    { name: 'mastery', pos: [4, 2, 0], color: '#ff1493', label: 'Mastery Level' }
  ];

  return (
    <group>
      {expertAreas.map((area) => (
        <group key={area.name}>
          <Box
            position={area.pos}
            args={[1.2, 0.8, 0.4]}
          >
            <meshStandardMaterial
              color={area.color}
              opacity={0.8 + (masterMetrics[area.name] % 20) / 100}
              transparent
            />
          </Box>
          <Text
            position={[area.pos[0], area.pos[1] + 1, area.pos[2]]}
            fontSize={0.22}
            color="white"
            anchorX="center"
          >
            {area.label}
          </Text>
          <Text
            position={[area.pos[0], area.pos[1] - 1, area.pos[2]]}
            fontSize={0.35}
            color={area.color}
            anchorX="center"
          >
            {area.name === 'mastery' ? `${masterMetrics[area.name].toFixed(1)}%` : masterMetrics[area.name]}
          </Text>
        </group>
      ))}
      
      <Sphere position={[0, 0, 0]} args={[0.5]}>
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </Sphere>
      
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.5}
        color="#ff1493"
        anchorX="center"
      >
        C++ POINTER MASTERY
      </Text>
      
      <Text
        position={[0, -2.2, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
      >
        {masterMetrics.mastery >= 100 ? 'GRANDMASTER ACHIEVED!' : 'Mastering Advanced Patterns...'}
      </Text>
    </group>
  );
}

export default function Lesson100_AdvancedPointerPatterns() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'Intrusive Smart Pointers & Containers' : 'Punteros Inteligentes y Contenedores Intrusivos',
      code: `#include <atomic>
#include <memory>
#include <type_traits>

// Base para objetos con referencia intrusiva
class IntrusiveRefCountBase {
private:
    mutable std::atomic<size_t> ref_count_{0};

public:
    IntrusiveRefCountBase() = default;
    virtual ~IntrusiveRefCountBase() = default;
    
    // No copiable para evitar problemas de referencia
    IntrusiveRefCountBase(const IntrusiveRefCountBase&) = delete;
    IntrusiveRefCountBase& operator=(const IntrusiveRefCountBase&) = delete;
    
    void add_ref() const noexcept {
        ref_count_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void release() const noexcept {
        if (ref_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            delete this;
        }
    }
    
    size_t use_count() const noexcept {
        return ref_count_.load(std::memory_order_acquire);
    }
};

// Puntero inteligente intrusivo optimizado
template<typename T>
class intrusive_ptr {
private:
    T* ptr_;
    
    static_assert(std::is_base_of_v<IntrusiveRefCountBase, T>,
                  "T must inherit from IntrusiveRefCountBase");

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
    
    intrusive_ptr(const intrusive_ptr& other) noexcept : ptr_(other.ptr_) {
        if (ptr_) {
            ptr_->add_ref();
        }
    }
    
    intrusive_ptr(intrusive_ptr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    ~intrusive_ptr() {
        if (ptr_) {
            ptr_->release();
        }
    }
    
    // Asignación
    intrusive_ptr& operator=(const intrusive_ptr& other) noexcept {
        intrusive_ptr(other).swap(*this);
        return *this;
    }
    
    intrusive_ptr& operator=(intrusive_ptr&& other) noexcept {
        intrusive_ptr(std::move(other)).swap(*this);
        return *this;
    }
    
    intrusive_ptr& operator=(T* p) noexcept {
        intrusive_ptr(p).swap(*this);
        return *this;
    }
    
    // Acceso
    T& operator*() const noexcept { return *ptr_; }
    T* operator->() const noexcept { return ptr_; }
    T* get() const noexcept { return ptr_; }
    
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
    
    // Utilidades
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
    
    // Comparaciones
    bool operator==(const intrusive_ptr& other) const noexcept {
        return ptr_ == other.ptr_;
    }
    
    bool operator!=(const intrusive_ptr& other) const noexcept {
        return ptr_ != other.ptr_;
    }
    
    bool operator<(const intrusive_ptr& other) const noexcept {
        return ptr_ < other.ptr_;
    }
};

// Factory para crear objetos intrusivos
template<typename T, typename... Args>
intrusive_ptr<T> make_intrusive(Args&&... args) {
    return intrusive_ptr<T>(new T(std::forward<Args>(args)...), false);
}

// Lista doblemente enlazada intrusiva
template<typename T>
class intrusive_list_node {
public:
    T* next = nullptr;
    T* prev = nullptr;
    
protected:
    ~intrusive_list_node() = default;
};

template<typename T>
class intrusive_list {
private:
    static_assert(std::is_base_of_v<intrusive_list_node<T>, T>,
                  "T must inherit from intrusive_list_node<T>");
    
    T* head_ = nullptr;
    T* tail_ = nullptr;
    size_t size_ = 0;

public:
    class iterator {
    private:
        T* current_;
        
    public:
        explicit iterator(T* node = nullptr) : current_(node) {}
        
        T& operator*() const { return *current_; }
        T* operator->() const { return current_; }
        
        iterator& operator++() {
            if (current_) current_ = current_->next;
            return *this;
        }
        
        iterator operator++(int) {
            iterator tmp = *this;
            ++(*this);
            return tmp;
        }
        
        bool operator==(const iterator& other) const {
            return current_ == other.current_;
        }
        
        bool operator!=(const iterator& other) const {
            return !(*this == other);
        }
    };
    
    intrusive_list() = default;
    ~intrusive_list() { clear(); }
    
    // No copiable por defecto (los nodos pueden pertenecer a múltiples listas)
    intrusive_list(const intrusive_list&) = delete;
    intrusive_list& operator=(const intrusive_list&) = delete;
    
    // Movible
    intrusive_list(intrusive_list&& other) noexcept 
        : head_(other.head_), tail_(other.tail_), size_(other.size_) {
        other.head_ = other.tail_ = nullptr;
        other.size_ = 0;
    }
    
    void push_back(T* node) {
        if (!node) return;
        
        node->next = nullptr;
        node->prev = tail_;
        
        if (tail_) {
            tail_->next = node;
        } else {
            head_ = node;
        }
        
        tail_ = node;
        ++size_;
    }
    
    void push_front(T* node) {
        if (!node) return;
        
        node->prev = nullptr;
        node->next = head_;
        
        if (head_) {
            head_->prev = node;
        } else {
            tail_ = node;
        }
        
        head_ = node;
        ++size_;
    }
    
    void remove(T* node) {
        if (!node) return;
        
        if (node->prev) {
            node->prev->next = node->next;
        } else {
            head_ = node->next;
        }
        
        if (node->next) {
            node->next->prev = node->prev;
        } else {
            tail_ = node->prev;
        }
        
        node->next = node->prev = nullptr;
        --size_;
    }
    
    T* pop_front() {
        if (!head_) return nullptr;
        
        T* result = head_;
        remove(head_);
        return result;
    }
    
    T* pop_back() {
        if (!tail_) return nullptr;
        
        T* result = tail_;
        remove(tail_);
        return result;
    }
    
    void clear() {
        while (head_) {
            remove(head_);
        }
    }
    
    // Acceso
    T* front() const { return head_; }
    T* back() const { return tail_; }
    bool empty() const { return size_ == 0; }
    size_t size() const { return size_; }
    
    // Iteradores
    iterator begin() { return iterator(head_); }
    iterator end() { return iterator(); }
};

// Ejemplo de uso
class GameObject : public IntrusiveRefCountBase, 
                  public intrusive_list_node<GameObject> {
private:
    std::string name_;
    float x_, y_, z_;

public:
    GameObject(const std::string& name, float x, float y, float z)
        : name_(name), x_(x), y_(y), z_(z) {}
    
    const std::string& name() const { return name_; }
    void set_position(float x, float y, float z) { x_ = x; y_ = y; z_ = z; }
    
    virtual void update(float dt) {
        // Lógica de actualización base
    }
};

void intrusive_example() {
    auto obj1 = make_intrusive<GameObject>("Player", 0, 0, 0);
    auto obj2 = make_intrusive<GameObject>("Enemy", 10, 0, 5);
    
    intrusive_list<GameObject> active_objects;
    active_objects.push_back(obj1.get());
    active_objects.push_back(obj2.get());
    
    // Actualizar todos los objetos
    for (auto& obj : active_objects) {
        obj.update(0.016f);  // 60 FPS
    }
    
    std::cout << "Active objects: " << active_objects.size() << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Advanced Custom Allocators' : 'Allocadores Personalizados Avanzados',
      code: `#include <memory>
#include <vector>
#include <type_traits>
#include <new>
#include <cassert>

// Pool allocator optimizado con free-list
template<typename T, size_t BlockSize = 4096>
class pool_allocator {
public:
    using value_type = T;
    using pointer = T*;
    using const_pointer = const T*;
    using size_type = size_t;
    using difference_type = ptrdiff_t;
    
    template<typename U>
    struct rebind {
        using other = pool_allocator<U, BlockSize>;
    };

private:
    struct Block {
        Block* next;
        alignas(T) char data[];
        
        static constexpr size_t objects_per_block() {
            return (BlockSize - sizeof(Block*)) / sizeof(T);
        }
    };
    
    struct FreeNode {
        FreeNode* next;
    };
    
    Block* current_block_ = nullptr;
    FreeNode* free_list_ = nullptr;
    size_t current_offset_ = 0;
    
    static constexpr size_t objects_per_block = Block::objects_per_block();

public:
    pool_allocator() = default;
    
    template<typename U>
    pool_allocator(const pool_allocator<U, BlockSize>&) noexcept {}
    
    ~pool_allocator() {
        while (current_block_) {
            Block* next = current_block_->next;
            std::free(current_block_);
            current_block_ = next;
        }
    }
    
    pointer allocate(size_type n) {
        if (n != 1) {
            // Para múltiples objetos, usar allocador estándar
            return static_cast<pointer>(std::malloc(n * sizeof(T)));
        }
        
        // Verificar free list primero
        if (free_list_) {
            FreeNode* node = free_list_;
            free_list_ = node->next;
            return reinterpret_cast<pointer>(node);
        }
        
        // Verificar si necesitamos un nuevo bloque
        if (!current_block_ || current_offset_ >= objects_per_block) {
            allocate_new_block();
            current_offset_ = 0;
        }
        
        // Allocar desde el bloque actual
        pointer result = reinterpret_cast<pointer>(
            current_block_->data + current_offset_ * sizeof(T));
        ++current_offset_;
        
        return result;
    }
    
    void deallocate(pointer p, size_type n) {
        if (n != 1) {
            std::free(p);
            return;
        }
        
        // Añadir a free list
        FreeNode* node = reinterpret_cast<FreeNode*>(p);
        node->next = free_list_;
        free_list_ = node;
    }
    
    template<typename U, typename... Args>
    void construct(U* p, Args&&... args) {
        ::new(p) U(std::forward<Args>(args)...);
    }
    
    template<typename U>
    void destroy(U* p) {
        p->~U();
    }
    
    size_type max_size() const noexcept {
        return std::numeric_limits<size_type>::max() / sizeof(T);
    }
    
    template<typename U>
    bool operator==(const pool_allocator<U, BlockSize>&) const noexcept {
        return true;  // Todos los pool allocators son compatibles
    }
    
    template<typename U>
    bool operator!=(const pool_allocator<U, BlockSize>& other) const noexcept {
        return !(*this == other);
    }

private:
    void allocate_new_block() {
        size_t block_size = sizeof(Block) + objects_per_block * sizeof(T);
        Block* new_block = static_cast<Block*>(std::malloc(block_size));
        
        if (!new_block) {
            throw std::bad_alloc();
        }
        
        new_block->next = current_block_;
        current_block_ = new_block;
    }
};

// Stack allocator para objetos temporales
template<size_t Size>
class stack_allocator {
private:
    alignas(std::max_align_t) char buffer_[Size];
    char* top_;
    
public:
    stack_allocator() : top_(buffer_) {}
    
    template<typename T>
    T* allocate(size_t count = 1) {
        size_t bytes = count * sizeof(T);
        size_t aligned_bytes = (bytes + alignof(T) - 1) & ~(alignof(T) - 1);
        
        if (top_ + aligned_bytes > buffer_ + Size) {
            throw std::bad_alloc();
        }
        
        T* result = reinterpret_cast<T*>(top_);
        top_ += aligned_bytes;
        return result;
    }
    
    void reset() {
        top_ = buffer_;
    }
    
    size_t remaining() const {
        return (buffer_ + Size) - top_;
    }
    
    size_t used() const {
        return top_ - buffer_;
    }
};

// Memory arena con múltiples estrategias
class memory_arena {
public:
    enum class Strategy {
        Linear,      // Allocación lineal simple
        Stack,       // Stack con rollback
        Pool,        // Pool para objetos del mismo tamaño
        FreeList     // Free list general
    };

private:
    struct Block {
        Block* next;
        size_t size;
        size_t used;
        alignas(std::max_align_t) char data[];
        
        static Block* create(size_t size) {
            Block* block = static_cast<Block*>(
                std::malloc(sizeof(Block) + size));
            if (!block) throw std::bad_alloc();
            
            block->next = nullptr;
            block->size = size;
            block->used = 0;
            return block;
        }
    };
    
    struct FreeChunk {
        FreeChunk* next;
        size_t size;
    };
    
    Block* current_block_ = nullptr;
    Block* first_block_ = nullptr;
    FreeChunk* free_list_ = nullptr;
    Strategy strategy_;
    size_t block_size_;
    
    // Para stack strategy
    struct StackMarker {
        Block* block;
        size_t offset;
    };
    std::vector<StackMarker> stack_markers_;

public:
    explicit memory_arena(Strategy strategy = Strategy::Linear, 
                         size_t block_size = 64 * 1024)
        : strategy_(strategy), block_size_(block_size) {}
    
    ~memory_arena() {
        while (first_block_) {
            Block* next = first_block_->next;
            std::free(first_block_);
            first_block_ = next;
        }
    }
    
    template<typename T>
    T* allocate(size_t count = 1) {
        size_t bytes = count * sizeof(T);
        size_t alignment = alignof(T);
        
        switch (strategy_) {
            case Strategy::Linear:
                return linear_allocate<T>(bytes, alignment);
            case Strategy::Stack:
                return stack_allocate<T>(bytes, alignment);
            case Strategy::FreeList:
                return freelist_allocate<T>(bytes, alignment);
            default:
                return linear_allocate<T>(bytes, alignment);
        }
    }
    
    template<typename T>
    void deallocate(T* ptr, size_t count = 1) {
        if (strategy_ == Strategy::FreeList) {
            freelist_deallocate(ptr, count * sizeof(T));
        }
        // Otros strategies no soportan deallocación individual
    }
    
    // Stack-specific operations
    void push_marker() {
        if (strategy_ == Strategy::Stack) {
            stack_markers_.push_back({current_block_, 
                                    current_block_ ? current_block_->used : 0});
        }
    }
    
    void pop_to_marker() {
        if (strategy_ == Strategy::Stack && !stack_markers_.empty()) {
            auto marker = stack_markers_.back();
            stack_markers_.pop_back();
            
            current_block_ = marker.block;
            if (current_block_) {
                current_block_->used = marker.offset;
            }
        }
    }
    
    void reset() {
        for (Block* block = first_block_; block; block = block->next) {
            block->used = 0;
        }
        current_block_ = first_block_;
        free_list_ = nullptr;
        stack_markers_.clear();
    }
    
    size_t total_allocated() const {
        size_t total = 0;
        for (Block* block = first_block_; block; block = block->next) {
            total += block->used;
        }
        return total;
    }
    
    size_t total_capacity() const {
        size_t total = 0;
        for (Block* block = first_block_; block; block = block->next) {
            total += block->size;
        }
        return total;
    }

private:
    template<typename T>
    T* linear_allocate(size_t bytes, size_t alignment) {
        if (!current_block_ || !try_allocate_from_block(current_block_, bytes, alignment)) {
            allocate_new_block();
        }
        
        size_t aligned_offset = (current_block_->used + alignment - 1) & ~(alignment - 1);
        T* result = reinterpret_cast<T*>(current_block_->data + aligned_offset);
        current_block_->used = aligned_offset + bytes;
        
        return result;
    }
    
    template<typename T>
    T* stack_allocate(size_t bytes, size_t alignment) {
        return linear_allocate<T>(bytes, alignment);  // Mismo que linear
    }
    
    template<typename T>
    T* freelist_allocate(size_t bytes, size_t alignment) {
        // Buscar en free list primero
        FreeChunk** prev = &free_list_;
        FreeChunk* current = free_list_;
        
        while (current) {
            if (current->size >= bytes) {
                *prev = current->next;
                return reinterpret_cast<T*>(current);
            }
            prev = &current->next;
            current = current->next;
        }
        
        // Fallback a allocación lineal
        return linear_allocate<T>(bytes, alignment);
    }
    
    void freelist_deallocate(void* ptr, size_t bytes) {
        FreeChunk* chunk = static_cast<FreeChunk*>(ptr);
        chunk->size = bytes;
        chunk->next = free_list_;
        free_list_ = chunk;
    }
    
    bool try_allocate_from_block(Block* block, size_t bytes, size_t alignment) {
        size_t aligned_offset = (block->used + alignment - 1) & ~(alignment - 1);
        return aligned_offset + bytes <= block->size;
    }
    
    void allocate_new_block() {
        Block* new_block = Block::create(block_size_);
        
        if (!first_block_) {
            first_block_ = new_block;
        }
        
        if (current_block_) {
            current_block_->next = new_block;
        }
        
        current_block_ = new_block;
    }
};

// RAII wrapper para arena con automatic cleanup
template<typename T>
class arena_unique_ptr {
private:
    T* ptr_;
    memory_arena* arena_;
    
public:
    arena_unique_ptr(T* ptr, memory_arena* arena) 
        : ptr_(ptr), arena_(arena) {}
    
    arena_unique_ptr(const arena_unique_ptr&) = delete;
    arena_unique_ptr& operator=(const arena_unique_ptr&) = delete;
    
    arena_unique_ptr(arena_unique_ptr&& other) noexcept 
        : ptr_(other.ptr_), arena_(other.arena_) {
        other.ptr_ = nullptr;
        other.arena_ = nullptr;
    }
    
    arena_unique_ptr& operator=(arena_unique_ptr&& other) noexcept {
        if (this != &other) {
            reset();
            ptr_ = other.ptr_;
            arena_ = other.arena_;
            other.ptr_ = nullptr;
            other.arena_ = nullptr;
        }
        return *this;
    }
    
    ~arena_unique_ptr() {
        reset();
    }
    
    T* get() const { return ptr_; }
    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_; }
    
    explicit operator bool() const { return ptr_ != nullptr; }
    
    void reset() {
        if (ptr_ && arena_) {
            ptr_->~T();
            arena_->deallocate(ptr_);
            ptr_ = nullptr;
        }
    }
    
    T* release() {
        T* result = ptr_;
        ptr_ = nullptr;
        arena_ = nullptr;
        return result;
    }
};

template<typename T, typename... Args>
arena_unique_ptr<T> make_arena_unique(memory_arena& arena, Args&&... args) {
    T* ptr = arena.allocate<T>();
    new(ptr) T(std::forward<Args>(args)...);
    return arena_unique_ptr<T>(ptr, &arena);
}`
    },
    {
      title: state.language === 'en' ? 'Advanced Design Patterns with Pointers' : 'Patrones de Diseño Avanzados con Punteros',
      code: `#include <memory>
#include <vector>
#include <unordered_map>
#include <functional>
#include <type_traits>

// Observer pattern con weak_ptr para evitar ciclos
template<typename Event>
class EventDispatcher {
public:
    using EventHandler = std::function<void(const Event&)>;
    using ObserverID = size_t;

private:
    struct Observer {
        std::weak_ptr<void> lifetime_tracker;
        EventHandler handler;
        
        Observer(std::weak_ptr<void> tracker, EventHandler h)
            : lifetime_tracker(std::move(tracker)), handler(std::move(h)) {}
    };
    
    std::unordered_map<ObserverID, Observer> observers_;
    ObserverID next_id_ = 1;

public:
    template<typename T>
    ObserverID subscribe(std::shared_ptr<T> object, 
                        void(T::*method)(const Event&)) {
        auto handler = [object, method](const Event& event) {
            if (auto locked = object.lock()) {
                // Para shared_ptr normal, no hay lock()
                ((*object).*method)(event);
            }
        };
        
        ObserverID id = next_id_++;
        observers_.emplace(id, Observer(
            std::weak_ptr<void>(object), 
            std::move(handler)
        ));
        
        return id;
    }
    
    template<typename T>
    ObserverID subscribe_weak(std::weak_ptr<T> weak_object, 
                             void(T::*method)(const Event&)) {
        auto handler = [weak_object, method](const Event& event) {
            if (auto locked = weak_object.lock()) {
                (locked.get()->*method)(event);
            }
        };
        
        ObserverID id = next_id_++;
        observers_.emplace(id, Observer(
            std::weak_ptr<void>(weak_object), 
            std::move(handler)
        ));
        
        return id;
    }
    
    ObserverID subscribe(EventHandler handler) {
        ObserverID id = next_id_++;
        observers_.emplace(id, Observer(
            std::weak_ptr<void>(),  // No lifetime tracking
            std::move(handler)
        ));
        
        return id;
    }
    
    void unsubscribe(ObserverID id) {
        observers_.erase(id);
    }
    
    void dispatch(const Event& event) {
        // Primero, limpiar observers muertos
        cleanup_dead_observers();
        
        // Luego, notificar observers activos
        for (const auto& [id, observer] : observers_) {
            if (observer.lifetime_tracker.expired()) {
                continue;  // Se limpiará en la próxima cleanup
            }
            
            observer.handler(event);
        }
    }
    
    size_t observer_count() const {
        return observers_.size();
    }

private:
    void cleanup_dead_observers() {
        for (auto it = observers_.begin(); it != observers_.end();) {
            if (it->second.lifetime_tracker.expired() && 
                !it->second.lifetime_tracker.owner_before(std::weak_ptr<void>()) &&
                !std::weak_ptr<void>().owner_before(it->second.lifetime_tracker)) {
                it = observers_.erase(it);
            } else {
                ++it;
            }
        }
    }
};

// Command pattern con undo/redo y smart pointers
class Command {
public:
    virtual ~Command() = default;
    virtual void execute() = 0;
    virtual void undo() = 0;
    virtual bool is_reversible() const { return true; }
    virtual std::string description() const = 0;
};

using CommandPtr = std::unique_ptr<Command>;

class CommandHistory {
private:
    std::vector<CommandPtr> history_;
    size_t current_position_ = 0;
    size_t max_history_size_ = 100;

public:
    void execute_command(CommandPtr command) {
        // Ejecutar el comando
        command->execute();
        
        // Limpiar historial hacia adelante si estamos en el medio
        if (current_position_ < history_.size()) {
            history_.erase(history_.begin() + current_position_, history_.end());
        }
        
        // Añadir comando al historial
        history_.push_back(std::move(command));
        current_position_ = history_.size();
        
        // Mantener límite de historial
        if (history_.size() > max_history_size_) {
            history_.erase(history_.begin());
            --current_position_;
        }
    }
    
    bool can_undo() const {
        return current_position_ > 0;
    }
    
    bool can_redo() const {
        return current_position_ < history_.size();
    }
    
    bool undo() {
        if (!can_undo()) return false;
        
        --current_position_;
        Command* command = history_[current_position_].get();
        
        if (command->is_reversible()) {
            command->undo();
            return true;
        }
        
        ++current_position_;  // Restaurar posición
        return false;
    }
    
    bool redo() {
        if (!can_redo()) return false;
        
        Command* command = history_[current_position_].get();
        command->execute();
        ++current_position_;
        
        return true;
    }
    
    void clear() {
        history_.clear();
        current_position_ = 0;
    }
    
    std::vector<std::string> get_history() const {
        std::vector<std::string> result;
        for (const auto& cmd : history_) {
            result.push_back(cmd->description());
        }
        return result;
    }
};

// Strategy pattern con type erasure
template<typename Input, typename Output>
class Strategy {
public:
    virtual ~Strategy() = default;
    virtual Output execute(const Input& input) = 0;
    virtual std::string name() const = 0;
};

template<typename Input, typename Output>
class StrategyManager {
private:
    using StrategyPtr = std::unique_ptr<Strategy<Input, Output>>;
    std::unordered_map<std::string, StrategyPtr> strategies_;
    std::string current_strategy_;

public:
    void register_strategy(const std::string& name, StrategyPtr strategy) {
        strategies_[name] = std::move(strategy);
        if (current_strategy_.empty()) {
            current_strategy_ = name;
        }
    }
    
    void set_strategy(const std::string& name) {
        if (strategies_.find(name) != strategies_.end()) {
            current_strategy_ = name;
        }
    }
    
    Output execute(const Input& input) {
        if (current_strategy_.empty()) {
            throw std::runtime_error("No strategy selected");
        }
        
        auto it = strategies_.find(current_strategy_);
        if (it == strategies_.end()) {
            throw std::runtime_error("Current strategy not found");
        }
        
        return it->second->execute(input);
    }
    
    std::vector<std::string> available_strategies() const {
        std::vector<std::string> result;
        for (const auto& [name, strategy] : strategies_) {
            result.push_back(name);
        }
        return result;
    }
    
    const std::string& current_strategy() const {
        return current_strategy_;
    }
};

// Factory pattern avanzado con registration automático
template<typename Base, typename Key = std::string>
class Factory {
public:
    template<typename... Args>
    using Creator = std::function<std::unique_ptr<Base>(Args...)>;
    
private:
    template<typename... Args>
    using CreatorMap = std::unordered_map<Key, Creator<Args...>>;
    
    template<typename... Args>
    static CreatorMap<Args...>& get_creators() {
        static CreatorMap<Args...> creators;
        return creators;
    }

public:
    template<typename Derived, typename... Args>
    static void register_type(const Key& key) {
        static_assert(std::is_base_of_v<Base, Derived>, 
                      "Derived must inherit from Base");
        
        get_creators<Args...>()[key] = [](Args... args) -> std::unique_ptr<Base> {
            return std::make_unique<Derived>(std::forward<Args>(args)...);
        };
    }
    
    template<typename... Args>
    static std::unique_ptr<Base> create(const Key& key, Args&&... args) {
        auto& creators = get_creators<Args...>();
        auto it = creators.find(key);
        
        if (it == creators.end()) {
            throw std::runtime_error("Unknown type key: " + std::to_string(key));
        }
        
        return it->second(std::forward<Args>(args)...);
    }
    
    template<typename... Args>
    static std::vector<Key> registered_types() {
        std::vector<Key> result;
        const auto& creators = get_creators<Args...>();
        
        for (const auto& [key, creator] : creators) {
            result.push_back(key);
        }
        
        return result;
    }
};

// Auto-registration helper
template<typename Factory, typename Derived, typename Key>
class AutoRegister {
public:
    template<typename... Args>
    AutoRegister(const Key& key) {
        Factory::template register_type<Derived, Args...>(key);
    }
};

#define AUTO_REGISTER(factory, derived, key, ...) \\
    static AutoRegister<factory, derived, std::string> \\
    auto_register_##derived(key);

// Visitor pattern con variant-like behavior
template<typename... Types>
class PointerVariant {
private:
    union {
        char dummy;
        // Los punteros se almacenan aquí
    };
    
    size_t type_index_ = 0;
    void* ptr_ = nullptr;
    void(*deleter_)(void*) = nullptr;
    
    template<typename T>
    static constexpr size_t type_to_index() {
        return index_of<T, Types...>();
    }
    
    template<typename T, typename First, typename... Rest>
    static constexpr size_t index_of() {
        if constexpr (std::is_same_v<T, First>) {
            return 0;
        } else {
            static_assert(sizeof...(Rest) > 0, "Type not found in variant");
            return 1 + index_of<T, Rest...>();
        }
    }

public:
    PointerVariant() = default;
    
    template<typename T>
    PointerVariant(std::unique_ptr<T> ptr) 
        : type_index_(type_to_index<T>()), 
          ptr_(ptr.release()),
          deleter_([](void* p) { delete static_cast<T*>(p); }) {
        static_assert((std::is_same_v<T, Types> || ...), 
                      "Type must be one of the variant types");
    }
    
    ~PointerVariant() {
        if (ptr_ && deleter_) {
            deleter_(ptr_);
        }
    }
    
    PointerVariant(PointerVariant&& other) noexcept 
        : type_index_(other.type_index_), 
          ptr_(other.ptr_), 
          deleter_(other.deleter_) {
        other.ptr_ = nullptr;
        other.deleter_ = nullptr;
        other.type_index_ = 0;
    }
    
    PointerVariant& operator=(PointerVariant&& other) noexcept {
        if (this != &other) {
            if (ptr_ && deleter_) {
                deleter_(ptr_);
            }
            
            type_index_ = other.type_index_;
            ptr_ = other.ptr_;
            deleter_ = other.deleter_;
            
            other.ptr_ = nullptr;
            other.deleter_ = nullptr;
            other.type_index_ = 0;
        }
        return *this;
    }
    
    template<typename T>
    bool holds() const {
        return type_index_ == type_to_index<T>() && ptr_ != nullptr;
    }
    
    template<typename T>
    T* get() const {
        if (!holds<T>()) {
            throw std::bad_cast();
        }
        return static_cast<T*>(ptr_);
    }
    
    template<typename Visitor>
    decltype(auto) visit(Visitor&& visitor) {
        return visit_impl(std::forward<Visitor>(visitor), 
                         std::make_index_sequence<sizeof...(Types)>{});
    }

private:
    template<typename Visitor, size_t... Is>
    decltype(auto) visit_impl(Visitor&& visitor, std::index_sequence<Is...>) {
        using ReturnType = std::common_type_t<
            decltype(visitor(std::declval<Types*>()))...>;
        
        static constexpr ReturnType(*visitors[])(void*, Visitor&&) = {
            [](void* ptr, Visitor&& vis) -> ReturnType {
                return vis(static_cast<Types*>(ptr));
            }...
        };
        
        if (type_index_ < sizeof...(Types) && ptr_) {
            return visitors[type_index_](ptr_, std::forward<Visitor>(visitor));
        }
        
        throw std::runtime_error("Invalid variant state");
    }
};`
    },
    {
      title: state.language === 'en' ? 'Performance Optimization Masterclass' : 'Masterclass de Optimización de Rendimiento',
      code: `#include <memory>
#include <chrono>
#include <vector>
#include <algorithm>
#include <x86intrin.h>  // Para intrínsecos Intel

// Cache-aware data structures
template<typename T>
class cache_friendly_vector {
private:
    static constexpr size_t CACHE_LINE_SIZE = 64;
    static constexpr size_t ELEMENTS_PER_CACHE_LINE = CACHE_LINE_SIZE / sizeof(T);
    
    struct alignas(CACHE_LINE_SIZE) CacheLine {
        T elements[ELEMENTS_PER_CACHE_LINE];
        size_t count = 0;
    };
    
    std::vector<std::unique_ptr<CacheLine>> cache_lines_;
    size_t size_ = 0;

public:
    void push_back(const T& value) {
        if (cache_lines_.empty() || 
            cache_lines_.back()->count >= ELEMENTS_PER_CACHE_LINE) {
            cache_lines_.push_back(std::make_unique<CacheLine>());
        }
        
        auto& line = *cache_lines_.back();
        line.elements[line.count++] = value;
        ++size_;
    }
    
    T& operator[](size_t index) {
        size_t line_idx = index / ELEMENTS_PER_CACHE_LINE;
        size_t elem_idx = index % ELEMENTS_PER_CACHE_LINE;
        return cache_lines_[line_idx]->elements[elem_idx];
    }
    
    size_t size() const { return size_; }
    
    // Iterator cache-friendly
    class iterator {
    private:
        std::vector<std::unique_ptr<CacheLine>>* lines_;
        size_t line_idx_, elem_idx_;
        
    public:
        iterator(std::vector<std::unique_ptr<CacheLine>>* lines, 
                size_t line_idx, size_t elem_idx)
            : lines_(lines), line_idx_(line_idx), elem_idx_(elem_idx) {}
        
        T& operator*() {
            return (*lines_)[line_idx_]->elements[elem_idx_];
        }
        
        iterator& operator++() {
            if (++elem_idx_ >= ELEMENTS_PER_CACHE_LINE) {
                elem_idx_ = 0;
                ++line_idx_;
            }
            return *this;
        }
        
        bool operator!=(const iterator& other) const {
            return line_idx_ != other.line_idx_ || elem_idx_ != other.elem_idx_;
        }
    };
    
    iterator begin() { return iterator(&cache_lines_, 0, 0); }
    iterator end() { 
        return iterator(&cache_lines_, cache_lines_.size(), 0); 
    }
};

// SIMD-optimized operations
class SIMDOperations {
public:
    // Suma vectorizada de arrays
    static void vector_add_avx2(const float* a, const float* b, float* result, size_t count) {
        const size_t simd_count = count & ~7;  // Múltiplo de 8
        
        for (size_t i = 0; i < simd_count; i += 8) {
            __m256 va = _mm256_load_ps(&a[i]);
            __m256 vb = _mm256_load_ps(&b[i]);
            __m256 vresult = _mm256_add_ps(va, vb);
            _mm256_store_ps(&result[i], vresult);
        }
        
        // Procesar elementos restantes
        for (size_t i = simd_count; i < count; ++i) {
            result[i] = a[i] + b[i];
        }
    }
    
    // Producto punto optimizado
    static float dot_product_avx2(const float* a, const float* b, size_t count) {
        __m256 sum = _mm256_setzero_ps();
        const size_t simd_count = count & ~7;
        
        for (size_t i = 0; i < simd_count; i += 8) {
            __m256 va = _mm256_load_ps(&a[i]);
            __m256 vb = _mm256_load_ps(&b[i]);
            sum = _mm256_fmadd_ps(va, vb, sum);
        }
        
        // Reducir el vector a un escalar
        __m128 low = _mm256_castps256_ps128(sum);
        __m128 high = _mm256_extractf128_ps(sum, 1);
        __m128 result128 = _mm_add_ps(low, high);
        
        result128 = _mm_hadd_ps(result128, result128);
        result128 = _mm_hadd_ps(result128, result128);
        
        float final_result = _mm_cvtss_f32(result128);
        
        // Procesar elementos restantes
        for (size_t i = simd_count; i < count; ++i) {
            final_result += a[i] * b[i];
        }
        
        return final_result;
    }
    
    // Búsqueda vectorizada
    static size_t find_first_avx2(const int* array, int target, size_t count) {
        __m256i vtarget = _mm256_set1_epi32(target);
        const size_t simd_count = count & ~7;
        
        for (size_t i = 0; i < simd_count; i += 8) {
            __m256i varray = _mm256_load_si256(
                reinterpret_cast<const __m256i*>(&array[i]));
            __m256i vcmp = _mm256_cmpeq_epi32(varray, vtarget);
            
            int mask = _mm256_movemask_ps(_mm256_castsi256_ps(vcmp));
            if (mask != 0) {
                return i + __builtin_ctz(mask);
            }
        }
        
        // Búsqueda secuencial para elementos restantes
        for (size_t i = simd_count; i < count; ++i) {
            if (array[i] == target) {
                return i;
            }
        }
        
        return SIZE_MAX;  // No encontrado
    }
};

// Memory prefetching strategies
class PrefetchOptimizer {
public:
    enum class PrefetchHint {
        Temporal,    // T0 - datos que se usarán pronto
        LowTemporal, // T1 - datos con baja localidad temporal  
        NonTemporal, // NTA - datos que no se reutilizarán
        ToL2Cache    // T2 - prefetch solo a L2
    };
    
    template<typename Iterator>
    static void prefetch_range(Iterator begin, Iterator end, 
                              PrefetchHint hint = PrefetchHint::Temporal) {
        constexpr size_t PREFETCH_DISTANCE = 8;
        size_t distance = std::distance(begin, end);
        
        auto prefetch_ahead = begin;
        std::advance(prefetch_ahead, std::min(distance, PREFETCH_DISTANCE));
        
        for (auto it = begin; it != end; ++it) {
            if (prefetch_ahead != end) {
                prefetch_memory(&(*prefetch_ahead), hint);
                ++prefetch_ahead;
            }
            
            // Procesar elemento actual
            process_element(*it);
        }
    }
    
    static void prefetch_memory(const void* addr, PrefetchHint hint) {
        switch (hint) {
            case PrefetchHint::Temporal:
                _mm_prefetch(static_cast<const char*>(addr), _MM_HINT_T0);
                break;
            case PrefetchHint::LowTemporal:
                _mm_prefetch(static_cast<const char*>(addr), _MM_HINT_T1);
                break;
            case PrefetchHint::NonTemporal:
                _mm_prefetch(static_cast<const char*>(addr), _MM_HINT_NTA);
                break;
            case PrefetchHint::ToL2Cache:
                _mm_prefetch(static_cast<const char*>(addr), _MM_HINT_T2);
                break;
        }
    }

private:
    template<typename T>
    static void process_element(const T& element) {
        // Placeholder para procesamiento específico
        volatile T dummy = element;
        (void)dummy;
    }
};

// Branch prediction optimization
class BranchOptimizer {
public:
    // Likely/unlikely macros
    #ifdef __GNUC__
    #define LIKELY(x)   __builtin_expect(!!(x), 1)
    #define UNLIKELY(x) __builtin_expect(!!(x), 0)
    #else
    #define LIKELY(x)   (x)
    #define UNLIKELY(x) (x)
    #endif
    
    // Optimización de loops con predicción de branch
    template<typename Container, typename Predicate, typename Action>
    static size_t conditional_process_optimized(Container& container, 
                                              Predicate pred, Action action) {
        size_t processed = 0;
        
        for (auto& item : container) {
            // Agrupar condiciones para mejorar predicción
            if (LIKELY(pred(item))) {
                action(item);
                ++processed;
            }
        }
        
        return processed;
    }
    
    // Eliminación de branches usando máscaras
    static void branchless_minmax(const int* data, size_t count, 
                                 int& min_val, int& max_val) {
        if (count == 0) return;
        
        min_val = max_val = data[0];
        
        for (size_t i = 1; i < count; ++i) {
            int val = data[i];
            
            // Branchless min/max usando operaciones bit
            min_val = val + ((min_val - val) & ((min_val - val) >> 31));
            max_val = val + ((max_val - val) & ((val - max_val) >> 31));
        }
    }
};

// False sharing prevention
template<typename T>
struct cache_line_aligned {
    alignas(64) T value;
    char padding[64 - sizeof(T) % 64];
    
    cache_line_aligned() = default;
    cache_line_aligned(const T& v) : value(v) {}
    
    operator T&() { return value; }
    operator const T&() const { return value; }
    
    T& get() { return value; }
    const T& get() const { return value; }
};

// Lock-free performance counters
class PerformanceCounters {
private:
    struct alignas(64) Counter {
        std::atomic<uint64_t> count{0};
        char padding[64 - sizeof(std::atomic<uint64_t>)];
    };
    
    static constexpr size_t MAX_THREADS = 64;
    Counter per_thread_counters_[MAX_THREADS];
    
    static thread_local size_t thread_id_;

public:
    void increment(const std::string& name) {
        size_t tid = get_thread_id();
        per_thread_counters_[tid].count.fetch_add(1, std::memory_order_relaxed);
    }
    
    uint64_t total() const {
        uint64_t sum = 0;
        for (const auto& counter : per_thread_counters_) {
            sum += counter.count.load(std::memory_order_relaxed);
        }
        return sum;
    }
    
    void reset() {
        for (auto& counter : per_thread_counters_) {
            counter.count.store(0, std::memory_order_relaxed);
        }
    }

private:
    size_t get_thread_id() {
        if (thread_id_ == SIZE_MAX) {
            static std::atomic<size_t> counter{0};
            thread_id_ = counter.fetch_add(1) % MAX_THREADS;
        }
        return thread_id_;
    }
};

thread_local size_t PerformanceCounters::thread_id_ = SIZE_MAX;

// Benchmark framework
class PerformanceBenchmark {
public:
    struct Result {
        std::chrono::nanoseconds duration;
        size_t operations;
        double ops_per_second;
        std::string name;
    };

private:
    std::vector<Result> results_;

public:
    template<typename Func>
    Result benchmark(const std::string& name, Func&& func, 
                    size_t operations = 1000000) {
        // Warm-up
        for (size_t i = 0; i < operations / 100; ++i) {
            func();
        }
        
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < operations; ++i) {
            func();
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        double ops_per_sec = (operations * 1e9) / duration.count();
        
        Result result{duration, operations, ops_per_sec, name};
        results_.push_back(result);
        
        return result;
    }
    
    void print_results() const {
        std::cout << "\\n=== Performance Results ===" << std::endl;
        std::cout << std::left << std::setw(25) << "Benchmark" 
                  << std::setw(15) << "Duration (ms)" 
                  << std::setw(15) << "Operations"
                  << "Ops/second" << std::endl;
        std::cout << std::string(70, '-') << std::endl;
        
        for (const auto& result : results_) {
            std::cout << std::left << std::setw(25) << result.name
                      << std::setw(15) << (result.duration.count() / 1e6)
                      << std::setw(15) << result.operations
                      << std::fixed << std::setprecision(0) 
                      << result.ops_per_second << std::endl;
        }
    }
    
    void clear() {
        results_.clear();
    }
    
    const std::vector<Result>& get_results() const {
        return results_;
    }
};

// Ejemplo de uso integral
void performance_masterclass_demo() {
    PerformanceBenchmark benchmark;
    
    // Test 1: Cache-friendly vs regular vector
    {
        cache_friendly_vector<int> cf_vec;
        std::vector<int> reg_vec;
        
        const size_t count = 1000000;
        
        // Llenar vectores
        for (size_t i = 0; i < count; ++i) {
            cf_vec.push_back(i);
            reg_vec.push_back(i);
        }
        
        benchmark.benchmark("Cache-friendly sum", [&]() {
            volatile int sum = 0;
            for (size_t i = 0; i < cf_vec.size(); ++i) {
                sum += cf_vec[i];
            }
        }, 100);
        
        benchmark.benchmark("Regular vector sum", [&]() {
            volatile int sum = 0;
            for (size_t i = 0; i < reg_vec.size(); ++i) {
                sum += reg_vec[i];
            }
        }, 100);
    }
    
    // Test 2: SIMD vs scalar operations
    {
        constexpr size_t size = 1024;
        alignas(32) float a[size], b[size], result[size];
        
        std::iota(a, a + size, 1.0f);
        std::iota(b, b + size, 2.0f);
        
        benchmark.benchmark("SIMD add", [&]() {
            SIMDOperations::vector_add_avx2(a, b, result, size);
        }, 10000);
        
        benchmark.benchmark("Scalar add", [&]() {
            for (size_t i = 0; i < size; ++i) {
                result[i] = a[i] + b[i];
            }
        }, 10000);
    }
    
    benchmark.print_results();
}`
    },
    {
      title: state.language === 'en' ? 'Future C++26 Pointer Features' : 'Características Futuras de Punteros C++26',
      code: `#include <memory>
#include <concepts>
#include <coroutine>
#include <ranges>

// Reflexión de tipos (C++26 preview)
namespace std {
    // Simulación de características futuras de reflexión
    template<typename T>
    struct type_info {
        static constexpr const char* name() {
            return typeid(T).name();  // Simplificado
        }
        
        static constexpr size_t size() {
            return sizeof(T);
        }
        
        static constexpr size_t alignment() {
            return alignof(T);
        }
    };
}

// Smart pointer con metadata automático (concepto futuro)
template<typename T, typename Metadata = void>
class annotated_ptr {
private:
    T* ptr_;
    [[no_unique_address]] Metadata metadata_;

public:
    using element_type = T;
    using metadata_type = Metadata;
    
    annotated_ptr() : ptr_(nullptr) {}
    
    template<typename... Args>
    annotated_ptr(T* p, Args&&... meta_args) 
        : ptr_(p), metadata_(std::forward<Args>(meta_args)...) {}
    
    T* get() const { return ptr_; }
    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_; }
    
    const Metadata& metadata() const { return metadata_; }
    Metadata& metadata() { return metadata_; }
    
    // Conversión automática a puntero base
    operator T*() const { return ptr_; }
    
    // Reflexión automática
    static constexpr auto type_info() {
        return std::type_info<T>{};
    }
};

// Especialización para metadata void
template<typename T>
class annotated_ptr<T, void> {
private:
    T* ptr_;

public:
    annotated_ptr(T* p = nullptr) : ptr_(p) {}
    
    T* get() const { return ptr_; }
    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_; }
    
    operator T*() const { return ptr_; }
};

// Corrutinas con smart pointers (C++20+)
template<typename T>
class async_unique_ptr {
public:
    struct promise_type {
        std::unique_ptr<T> value_;
        std::exception_ptr exception_;
        
        async_unique_ptr get_return_object() {
            return async_unique_ptr(
                std::coroutine_handle<promise_type>::from_promise(*this)
            );
        }
        
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_never final_suspend() noexcept { return {}; }
        
        void return_value(std::unique_ptr<T> value) {
            value_ = std::move(value);
        }
        
        void unhandled_exception() {
            exception_ = std::current_exception();
        }
    };

private:
    std::coroutine_handle<promise_type> coro_;

public:
    explicit async_unique_ptr(std::coroutine_handle<promise_type> h) : coro_(h) {}
    
    ~async_unique_ptr() {
        if (coro_) {
            coro_.destroy();
        }
    }
    
    async_unique_ptr(const async_unique_ptr&) = delete;
    async_unique_ptr& operator=(const async_unique_ptr&) = delete;
    
    async_unique_ptr(async_unique_ptr&& other) noexcept : coro_(other.coro_) {
        other.coro_ = nullptr;
    }
    
    async_unique_ptr& operator=(async_unique_ptr&& other) noexcept {
        if (this != &other) {
            if (coro_) {
                coro_.destroy();
            }
            coro_ = other.coro_;
            other.coro_ = nullptr;
        }
        return *this;
    }
    
    bool ready() const {
        return coro_ && coro_.done();
    }
    
    std::unique_ptr<T> get() {
        if (!ready()) {
            throw std::runtime_error("Coroutine not ready");
        }
        
        if (coro_.promise().exception_) {
            std::rethrow_exception(coro_.promise().exception_);
        }
        
        return std::move(coro_.promise().value_);
    }
};

// Pattern matching para smart pointers (concepto futuro)
template<typename... Types>
class smart_variant {
private:
    std::variant<std::unique_ptr<Types>...> storage_;

public:
    template<typename T>
    smart_variant(std::unique_ptr<T> ptr) : storage_(std::move(ptr)) {}
    
    template<typename Visitor>
    decltype(auto) visit(Visitor&& visitor) {
        return std::visit([&visitor](auto&& ptr) -> decltype(auto) {
            if (ptr) {
                return visitor(*ptr);
            } else {
                throw std::runtime_error("Null pointer in variant");
            }
        }, storage_);
    }
    
    // Pattern matching syntax (conceptual)
    template<typename... Patterns>
    auto match(Patterns&&... patterns) {
        return visit([&](auto& value) {
            using ValueType = std::decay_t<decltype(value)>;
            
            auto matcher = [&]<typename Pattern>(Pattern&& pattern) {
                if constexpr (std::is_invocable_v<Pattern, ValueType>) {
                    return pattern(value);
                }
            };
            
            return (matcher(patterns) || ...);
        });
    }
};

// Concepts para smart pointers
template<typename T>
concept SmartPointer = requires(T t) {
    typename T::element_type;
    { t.get() } -> std::convertible_to<typename T::element_type*>;
    { t.operator*() } -> std::same_as<typename T::element_type&>;
    { t.operator->() } -> std::same_as<typename T::element_type*>;
    { static_cast<bool>(t) } -> std::same_as<bool>;
};

template<typename T>
concept UniquePointer = SmartPointer<T> && requires(T t) {
    { t.release() } -> std::same_as<typename T::element_type*>;
    t.reset();
};

template<typename T>
concept SharedPointer = SmartPointer<T> && requires(T t) {
    { t.use_count() } -> std::convertible_to<long>;
};

// Algoritmos genéricos para smart pointers
template<SmartPointer Ptr, typename Predicate>
auto find_if_smart(const std::vector<Ptr>& ptrs, Predicate pred) {
    return std::ranges::find_if(ptrs, [pred](const auto& ptr) {
        return ptr && pred(*ptr);
    });
}

template<UniquePointer Ptr>
auto move_non_null(std::vector<Ptr>& ptrs) {
    std::vector<Ptr> result;
    
    for (auto& ptr : ptrs) {
        if (ptr) {
            result.push_back(std::move(ptr));
        }
    }
    
    return result;
}

// Memory-safe range adaptors
namespace smart_ranges {
    template<typename Container>
    requires requires(Container c) {
        { *std::begin(c) } -> SmartPointer;
    }
    auto dereference() {
        return std::views::transform([](auto& ptr) -> decltype(auto) {
            if (!ptr) {
                throw std::runtime_error("Dereferencing null smart pointer");
            }
            return *ptr;
        }) | std::views::filter([](const auto& ptr) {
            return static_cast<bool>(ptr);
        });
    }
    
    template<typename Container>
    auto valid_pointers() {
        return std::views::filter([](const auto& ptr) {
            return static_cast<bool>(ptr);
        });
    }
}

// Automatic lifetime management (conceptual)
template<typename T>
class scoped_ptr {
private:
    T* ptr_;
    std::function<void()> cleanup_;

public:
    template<typename... Args>
    scoped_ptr(Args&&... args) {
        ptr_ = new T(std::forward<Args>(args)...);
        cleanup_ = [this]() { delete ptr_; };
    }
    
    template<typename Deleter>
    scoped_ptr(T* p, Deleter del) : ptr_(p), cleanup_([del, p]() { del(p); }) {}
    
    ~scoped_ptr() {
        if (cleanup_) {
            cleanup_();
        }
    }
    
    T* get() const { return ptr_; }
    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_; }
    
    // No copiable, no movible para simplificar
    scoped_ptr(const scoped_ptr&) = delete;
    scoped_ptr& operator=(const scoped_ptr&) = delete;
    scoped_ptr(scoped_ptr&&) = delete;
    scoped_ptr& operator=(scoped_ptr&&) = delete;
};

// Ejemplo integral de uso futuro
async_unique_ptr<std::string> create_async_string() {
    // Simulación de operación asíncrona
    co_return std::make_unique<std::string>("Hello, Future C++!");
}

void future_features_demo() {
    // Smart pointers con metadata
    struct DebugInfo {
        const char* file;
        int line;
        std::chrono::system_clock::time_point created;
    };
    
    annotated_ptr<int, DebugInfo> debug_ptr(
        new int(42), 
        DebugInfo{"main.cpp", 100, std::chrono::system_clock::now()}
    );
    
    std::cout << "Value: " << *debug_ptr << std::endl;
    std::cout << "Created in: " << debug_ptr.metadata().file 
              << " line " << debug_ptr.metadata().line << std::endl;
    
    // Smart variant con pattern matching
    smart_variant<int, std::string, double> var(std::make_unique<std::string>("Hello"));
    
    var.visit([](auto& value) {
        std::cout << "Visiting: " << value << std::endl;
    });
    
    // Ranges con smart pointers
    std::vector<std::unique_ptr<int>> ptrs;
    ptrs.push_back(std::make_unique<int>(1));
    ptrs.push_back(nullptr);
    ptrs.push_back(std::make_unique<int>(3));
    
    for (auto& value : ptrs | smart_ranges::valid_pointers() | smart_ranges::dereference()) {
        std::cout << "Valid value: " << value << std::endl;
    }
    
    // Corrutinas (nota: requiere manejo cuidadoso en código real)
    auto future_string = create_async_string();
    if (future_string.ready()) {
        auto str = future_string.get();
        std::cout << "Async result: " << *str << std::endl;
    }
    
    delete debug_ptr.get();  // En código real, usar RAII apropiado
}`
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 100: Advanced Pointer Patterns - C++ Mastery' : 'Lección 100: Patrones Avanzados de Punteros - Maestría en C++'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <MasterPointerVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Master-Level Pointer Techniques' : 'Técnicas de Punteros Nivel Maestro'}</h3>
          
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
              <code>{examples[currentExample].code}</code>
            </pre>
          </div>
        </div>

        <div className="theory-section">
          <h3>{state.language === 'en' ? 'Mastery Concepts' : 'Conceptos de Maestría'}</h3>
          <div className="concept-grid">
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Intrusive Design Patterns' : 'Patrones de Diseño Intrusivos'}</h4>
              <p>
                {state.language === 'en' 
                  ? 'Master intrusive containers, self-organizing data structures, and zero-overhead abstractions for maximum performance.'
                  : 'Domina contenedores intrusivos, estructuras de datos auto-organizantes y abstracciones de cero overhead para máximo rendimiento.'}
              </p>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Advanced Memory Management' : 'Gestión Avanzada de Memoria'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Implement custom allocators, memory arenas, and SIMD-optimized operations for high-performance systems.'
                  : 'Implementa allocadores personalizados, arenas de memoria y operaciones optimizadas con SIMD para sistemas de alto rendimiento.'}
              </p>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Design Pattern Mastery' : 'Maestría en Patrones de Diseño'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Apply advanced design patterns with smart pointers including Observer, Command, Strategy, and Factory patterns.'
                  : 'Aplica patrones de diseño avanzados con punteros inteligentes incluyendo Observer, Command, Strategy y Factory.'}
              </p>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Future C++ Features' : 'Características Futuras de C++'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Explore upcoming C++26 features including reflection, pattern matching, and advanced coroutine integration.'
                  : 'Explora características futuras de C++26 incluyendo reflexión, pattern matching e integración avanzada de corrutinas.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mastery-achievement">
          <h3>{state.language === 'en' ? '🏆 C++ Pointer Mastery Achievement' : '🏆 Logro de Maestría en Punteros C++'}</h3>
          <div className="achievement-content">
            <div className="achievement-badge">
              <span className="badge-icon">🎯</span>
              <h4>{state.language === 'en' ? 'GRANDMASTER' : 'GRAN MAESTRO'}</h4>
              <p>{state.language === 'en' ? 'C++ Pointer Systems Expert' : 'Experto en Sistemas de Punteros C++'}</p>
            </div>
            
            <div className="mastery-skills">
              <h4>{state.language === 'en' ? 'Mastered Skills:' : 'Habilidades Dominadas:'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Intrusive containers and self-organizing structures' : 'Contenedores intrusivos y estructuras auto-organizantes'}</li>
                <li>{state.language === 'en' ? 'Custom allocators and memory optimization' : 'Allocadores personalizados y optimización de memoria'}</li>
                <li>{state.language === 'en' ? 'SIMD vectorization and performance tuning' : 'Vectorización SIMD y ajuste de rendimiento'}</li>
                <li>{state.language === 'en' ? 'Advanced design patterns with smart pointers' : 'Patrones de diseño avanzados con punteros inteligentes'}</li>
                <li>{state.language === 'en' ? 'Lock-free programming and atomics mastery' : 'Programación lock-free y maestría en atomics'}</li>
                <li>{state.language === 'en' ? 'Future C++ features and cutting-edge techniques' : 'Características futuras de C++ y técnicas de vanguardia'}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="best-practices">
          <h3>{state.language === 'en' ? 'Master-Level Best Practices' : 'Mejores Prácticas Nivel Maestro'}</h3>
          <ul>
            <li>
              {state.language === 'en'
                ? 'Design for zero-cost abstractions while maintaining code clarity and maintainability'
                : 'Diseña para abstracciones de costo cero manteniendo claridad y mantenibilidad del código'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement comprehensive benchmarking and performance analysis for all optimizations'
                : 'Implementa benchmarking comprensivo y análisis de rendimiento para todas las optimizaciones'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Master both intrusive and non-intrusive design approaches for different use cases'
                : 'Domina enfoques de diseño intrusivos y no intrusivos para diferentes casos de uso'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Apply SIMD optimizations judiciously with proper fallback mechanisms'
                : 'Aplica optimizaciones SIMD juiciosamente con mecanismos de fallback apropiados'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Stay current with evolving C++ standards and upcoming language features'
                : 'Mantente actualizado con estándares de C++ en evolución y características futuras del lenguaje'}
            </li>
          </ul>
        </div>

        <div className="journey-complete">
          <h3>{state.language === 'en' ? '🎉 Journey Complete!' : '🎉 ¡Viaje Completo!'}</h3>
          <p className="completion-message">
            {state.language === 'en'
              ? 'Congratulations! You have mastered the most advanced pointer techniques in C++. You are now equipped with expert-level knowledge to build high-performance, memory-efficient systems. Continue exploring and pushing the boundaries of what\'s possible with C++!'
              : '¡Felicitaciones! Has dominado las técnicas más avanzadas de punteros en C++. Ahora tienes conocimiento de nivel experto para construir sistemas de alto rendimiento y eficientes en memoria. ¡Continúa explorando y empujando los límites de lo que es posible con C++!'}
          </p>
        </div>
      </div>
    </div>
  );
}