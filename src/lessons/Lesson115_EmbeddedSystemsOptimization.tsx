import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone } from '@react-three/drei';
import { useApp } from '../context/AppContext';

interface EmbeddedMetrics {
  memoryUsage: number;
  realtimePerformance: number;
  stackOptimization: number;
  powerEfficiency: number;
}

interface EmbeddedVisualizationProps {
  metrics: EmbeddedMetrics;
  activePattern: string;
  onPatternSelect: (pattern: string) => void;
}

const EmbeddedVisualization: React.FC<EmbeddedVisualizationProps> = ({ 
  metrics, 
  activePattern, 
  onPatternSelect 
}) => {
  const groupRef = useRef<any>();
  const memoryBlocksRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
    if (memoryBlocksRef.current) {
      // Animate memory allocation visualization
      const time = state.clock.elapsedTime;
      memoryBlocksRef.current.children.forEach((child: any, index: number) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = 0.6 + 0.3 * Math.sin(time * 2 + index);
        }
      });
    }
  });

  const patterns = [
    { name: 'Stack Opt', position: [-4, 2, 0], color: '#e74c3c', efficiency: 0.95 },
    { name: 'Pool Alloc', position: [-2, 2, 0], color: '#3498db', efficiency: 0.88 },
    { name: 'Real-time', position: [0, 2, 0], color: '#2ecc71', efficiency: 0.92 },
    { name: 'RTOS Ptr', position: [2, 2, 0], color: '#f39c12', efficiency: 0.85 },
    { name: 'DMA Safe', position: [4, 2, 0], color: '#9b59b6', efficiency: 0.90 },
    { name: 'Low Power', position: [-1, -1, 0], color: '#e67e22', efficiency: 0.87 },
    { name: 'ISR Safe', position: [1, -1, 0], color: '#1abc9c', efficiency: 0.93 }
  ];

  return (
    <group ref={groupRef}>
      {patterns.map((pattern, index) => (
        <group key={pattern.name}>
          <Box
            position={pattern.position}
            args={[1.0, 0.6, 0.4]}
            onClick={() => onPatternSelect(pattern.name)}
          >
            <meshPhongMaterial 
              color={activePattern === pattern.name ? '#ffffff' : pattern.color}
              transparent={true}
              opacity={activePattern === pattern.name ? 1.0 : 0.8}
            />
          </Box>
          
          <Text
            position={[pattern.position[0], pattern.position[1] - 1.2, pattern.position[2]]}
            fontSize={0.18}
            color="#333"
            anchorX="center"
            anchorY="middle"
          >
            {pattern.name}
          </Text>
          
          {/* Efficiency indicator */}
          <Cylinder
            position={[pattern.position[0], pattern.position[1] + 1.0, pattern.position[2]]}
            args={[0.08, 0.08, pattern.efficiency * 0.8]}
          >
            <meshPhongMaterial 
              color={pattern.efficiency > 0.9 ? '#27ae60' : pattern.efficiency > 0.85 ? '#f39c12' : '#e74c3c'}
              transparent
              opacity={0.8}
            />
          </Cylinder>
        </group>
      ))}
      
      {/* Central embedded processor visualization */}
      <group ref={memoryBlocksRef}>
        {/* Stack memory */}
        <Box position={[-0.8, 0.5, 0.5]} args={[0.3, 1.2, 0.3]}>
          <meshPhongMaterial color="#34495e" transparent opacity={0.7} />
        </Box>
        <Text
          position={[-0.8, -0.2, 0.8]}
          fontSize={0.12}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Stack
        </Text>
        
        {/* Heap memory */}
        <Box position={[0.8, 0.5, 0.5]} args={[0.3, 0.8, 0.3]}>
          <meshPhongMaterial color="#e74c3c" transparent opacity={0.6} />
        </Box>
        <Text
          position={[0.8, -0.1, 0.8]}
          fontSize={0.12}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Heap
        </Text>
        
        {/* MCU Core */}
        <Sphere position={[0, 0.5, 0]} args={[0.4]}>
          <meshPhongMaterial color="#2980b9" transparent opacity={0.8} />
        </Sphere>
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.12}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          MCU Core
        </Text>
      </group>
    </group>
  );
};

const Lesson115_EmbeddedSystemsOptimization: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('memory-constrained');
  const [selectedPattern, setSelectedPattern] = useState<string>('Stack Opt');
  const [metrics, setMetrics] = useState<EmbeddedMetrics>({
    memoryUsage: 0.85,
    realtimePerformance: 0.92,
    stackOptimization: 0.88,
    powerEfficiency: 0.80
  });

  const examples = {
    'memory-constrained': {
      title: state.language === 'en' ? 'Memory-Constrained Environments' : 'Entornos con Memoria Limitada',
      code: `#include <memory>
#include <array>
#include <cstddef>
#include <type_traits>

// Embedded systems optimization for memory-constrained environments
namespace memory_constrained {

// Custom allocator for stack-based allocation
template<size_t Size>
class StackAllocator {
private:
    alignas(std::max_align_t) char buffer_[Size];
    size_t offset_{0};
    
public:
    StackAllocator() = default;
    
    template<typename T>
    T* allocate(size_t count = 1) {
        constexpr size_t alignment = alignof(T);
        size_t required_size = sizeof(T) * count;
        
        // Align offset
        size_t aligned_offset = (offset_ + alignment - 1) & ~(alignment - 1);
        
        if (aligned_offset + required_size > Size) {
            return nullptr; // Out of memory
        }
        
        T* result = reinterpret_cast<T*>(&buffer_[aligned_offset]);
        offset_ = aligned_offset + required_size;
        return result;
    }
    
    template<typename T>
    void deallocate(T* ptr) noexcept {
        // Stack allocator doesn't support individual deallocation
        // Only supports resetting to a previous state
    }
    
    void reset() noexcept {
        offset_ = 0;
    }
    
    size_t bytes_used() const noexcept {
        return offset_;
    }
    
    size_t bytes_available() const noexcept {
        return Size - offset_;
    }
    
    template<typename T>
    size_t max_objects() const noexcept {
        return bytes_available() / sizeof(T);
    }
};

// Memory-constrained smart pointer using stack allocator
template<typename T, size_t PoolSize = 1024>
class EmbeddedUniquePtr {
private:
    T* ptr_;
    static StackAllocator<PoolSize> allocator_;
    
public:
    EmbeddedUniquePtr() : ptr_(nullptr) {}
    
    explicit EmbeddedUniquePtr(T* ptr) : ptr_(ptr) {}
    
    template<typename... Args>
    static EmbeddedUniquePtr make(Args&&... args) {
        T* ptr = allocator_.template allocate<T>();
        if (!ptr) {
            return EmbeddedUniquePtr(); // Allocation failed
        }
        
        try {
            new(ptr) T(std::forward<Args>(args)...);
            return EmbeddedUniquePtr(ptr);
        } catch (...) {
            allocator_.template deallocate(ptr);
            return EmbeddedUniquePtr();
        }
    }
    
    ~EmbeddedUniquePtr() {
        if (ptr_) {
            ptr_->~T();
            // Note: Stack allocator doesn't free individual objects
        }
    }
    
    EmbeddedUniquePtr(const EmbeddedUniquePtr&) = delete;
    EmbeddedUniquePtr& operator=(const EmbeddedUniquePtr&) = delete;
    
    EmbeddedUniquePtr(EmbeddedUniquePtr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    EmbeddedUniquePtr& operator=(EmbeddedUniquePtr&& other) noexcept {
        if (this != &other) {
            if (ptr_) {
                ptr_->~T();
            }
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    T* get() const noexcept { return ptr_; }
    T* operator->() const noexcept { return ptr_; }
    T& operator*() const noexcept { return *ptr_; }
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
    
    T* release() noexcept {
        T* result = ptr_;
        ptr_ = nullptr;
        return result;
    }
    
    void reset(T* new_ptr = nullptr) noexcept {
        if (ptr_) {
            ptr_->~T();
        }
        ptr_ = new_ptr;
    }
    
    static void reset_allocator() noexcept {
        allocator_.reset();
    }
    
    static size_t memory_usage() noexcept {
        return allocator_.bytes_used();
    }
    
    static size_t memory_available() noexcept {
        return allocator_.bytes_available();
    }
};

template<typename T, size_t PoolSize>
StackAllocator<PoolSize> EmbeddedUniquePtr<T, PoolSize>::allocator_;

// Fixed-size object pool for embedded systems
template<typename T, size_t MaxObjects>
class EmbeddedObjectPool {
private:
    alignas(T) char storage_[MaxObjects * sizeof(T)];
    bool used_[MaxObjects];
    size_t next_free_;
    
public:
    EmbeddedObjectPool() : next_free_(0) {
        for (size_t i = 0; i < MaxObjects; ++i) {
            used_[i] = false;
        }
    }
    
    template<typename... Args>
    T* acquire(Args&&... args) {
        // Find next available slot
        for (size_t attempts = 0; attempts < MaxObjects; ++attempts) {
            size_t index = (next_free_ + attempts) % MaxObjects;
            if (!used_[index]) {
                used_[index] = true;
                next_free_ = (index + 1) % MaxObjects;
                
                T* ptr = reinterpret_cast<T*>(&storage_[index * sizeof(T)]);
                new(ptr) T(std::forward<Args>(args)...);
                return ptr;
            }
        }
        return nullptr; // Pool exhausted
    }
    
    void release(T* ptr) {
        if (!ptr) return;
        
        // Calculate index from pointer
        char* base = reinterpret_cast<char*>(storage_);
        char* obj = reinterpret_cast<char*>(ptr);
        ptrdiff_t offset = obj - base;
        
        if (offset >= 0 && offset < MaxObjects * sizeof(T) && offset % sizeof(T) == 0) {
            size_t index = offset / sizeof(T);
            if (used_[index]) {
                ptr->~T();
                used_[index] = false;
            }
        }
    }
    
    size_t capacity() const noexcept { return MaxObjects; }
    
    size_t size() const noexcept {
        size_t count = 0;
        for (size_t i = 0; i < MaxObjects; ++i) {
            if (used_[i]) count++;
        }
        return count;
    }
    
    size_t available() const noexcept {
        return capacity() - size();
    }
    
    bool empty() const noexcept {
        return size() == 0;
    }
    
    bool full() const noexcept {
        return size() == capacity();
    }
};

// Memory-mapped register safe pointer
template<typename T, uintptr_t Address>
class MemoryMappedPtr {
private:
    volatile T* const ptr_;
    
public:
    constexpr MemoryMappedPtr() : ptr_(reinterpret_cast<volatile T*>(Address)) {}
    
    // Read operations
    T read() const volatile {
        return *ptr_;
    }
    
    // Write operations
    void write(const T& value) volatile {
        *ptr_ = value;
    }
    
    // Bit manipulation for registers
    void set_bit(size_t bit_pos) volatile {
        static_assert(std::is_integral_v<T>, "Bit operations only for integral types");
        *ptr_ |= (T{1} << bit_pos);
    }
    
    void clear_bit(size_t bit_pos) volatile {
        static_assert(std::is_integral_v<T>, "Bit operations only for integral types");
        *ptr_ &= ~(T{1} << bit_pos);
    }
    
    void toggle_bit(size_t bit_pos) volatile {
        static_assert(std::is_integral_v<T>, "Bit operations only for integral types");
        *ptr_ ^= (T{1} << bit_pos);
    }
    
    bool test_bit(size_t bit_pos) const volatile {
        static_assert(std::is_integral_v<T>, "Bit operations only for integral types");
        return (*ptr_ & (T{1} << bit_pos)) != 0;
    }
    
    // Atomic-like operations for embedded systems without std::atomic
    T read_modify_write(T mask, T value) volatile {
        T old_value = *ptr_;
        *ptr_ = (old_value & ~mask) | (value & mask);
        return old_value;
    }
    
    // Safe casting to different types (for register access)
    template<typename U>
    volatile U* as() volatile {
        static_assert(sizeof(U) <= sizeof(T), "Target type must not be larger");
        return reinterpret_cast<volatile U*>(ptr_);
    }
    
    volatile T* get() const volatile { return ptr_; }
    
    // Disable copy and move - these are compile-time constants
    MemoryMappedPtr(const MemoryMappedPtr&) = delete;
    MemoryMappedPtr& operator=(const MemoryMappedPtr&) = delete;
    MemoryMappedPtr(MemoryMappedPtr&&) = delete;
    MemoryMappedPtr& operator=(MemoryMappedPtr&&) = delete;
};

// Circular buffer with embedded-optimized pointer management
template<typename T, size_t Size>
class EmbeddedCircularBuffer {
private:
    T buffer_[Size];
    size_t head_{0};
    size_t tail_{0};
    bool full_{false};
    
public:
    EmbeddedCircularBuffer() = default;
    
    bool push(const T& item) {
        if (full_) {
            return false; // Buffer full
        }
        
        buffer_[head_] = item;
        advance_head();
        return true;
    }
    
    bool push(T&& item) {
        if (full_) {
            return false; // Buffer full
        }
        
        buffer_[head_] = std::move(item);
        advance_head();
        return true;
    }
    
    bool pop(T& item) {
        if (empty()) {
            return false; // Buffer empty
        }
        
        item = std::move(buffer_[tail_]);
        advance_tail();
        return true;
    }
    
    const T* front() const {
        return empty() ? nullptr : &buffer_[tail_];
    }
    
    const T* back() const {
        return empty() ? nullptr : &buffer_[(head_ + Size - 1) % Size];
    }
    
    bool empty() const noexcept {
        return !full_ && (head_ == tail_);
    }
    
    bool full() const noexcept {
        return full_;
    }
    
    size_t size() const noexcept {
        if (full_) return Size;
        if (head_ >= tail_) return head_ - tail_;
        return Size + head_ - tail_;
    }
    
    size_t capacity() const noexcept {
        return Size;
    }
    
    void clear() {
        head_ = tail_ = 0;
        full_ = false;
    }
    
private:
    void advance_head() {
        head_ = (head_ + 1) % Size;
        if (head_ == tail_) {
            full_ = true;
        }
    }
    
    void advance_tail() {
        full_ = false;
        tail_ = (tail_ + 1) % Size;
    }
};

// Example usage
class EmbeddedDevice {
private:
    static constexpr uintptr_t GPIO_BASE = 0x40020000;
    MemoryMappedPtr<uint32_t, GPIO_BASE> gpio_register_;
    
    EmbeddedObjectPool<int, 16> int_pool_;
    EmbeddedCircularBuffer<float, 32> sensor_buffer_;
    
public:
    void configure_gpio(uint32_t pin_mask) {
        gpio_register_.write(pin_mask);
    }
    
    void set_gpio_pin(size_t pin) {
        gpio_register_.set_bit(pin);
    }
    
    bool read_gpio_pin(size_t pin) const {
        return gpio_register_.test_bit(pin);
    }
    
    int* allocate_int(int value) {
        return int_pool_.acquire(value);
    }
    
    void deallocate_int(int* ptr) {
        int_pool_.release(ptr);
    }
    
    bool add_sensor_reading(float reading) {
        return sensor_buffer_.push(reading);
    }
    
    bool get_sensor_reading(float& reading) {
        return sensor_buffer_.pop(reading);
    }
    
    void print_memory_stats() {
        printf("Stack allocator usage: %zu bytes\\n", 
               EmbeddedUniquePtr<int>::memory_usage());
        printf("Object pool usage: %zu/%zu objects\\n", 
               int_pool_.size(), int_pool_.capacity());
        printf("Sensor buffer: %zu/%zu readings\\n", 
               sensor_buffer_.size(), sensor_buffer_.capacity());
    }
};

} // namespace memory_constrained`
    },
    
    'realtime-management': {
      title: state.language === 'en' ? 'Real-time Pointer Management' : 'Gestión de Punteros en Tiempo Real',
      code: `#include <memory>
#include <chrono>
#include <array>
#include <atomic>
#include <type_traits>

// Real-time pointer management for embedded systems
namespace realtime_management {

// Deterministic memory allocator for real-time systems
template<size_t BlockSize, size_t NumBlocks>
class RealtimeAllocator {
private:
    alignas(std::max_align_t) char memory_pool_[BlockSize * NumBlocks];
    std::atomic<uint32_t> free_bitmap_{(1ULL << NumBlocks) - 1};
    
    static_assert(NumBlocks <= 32, "Maximum 32 blocks supported for bitmap");
    
public:
    void* allocate() noexcept {
        uint32_t current_bitmap = free_bitmap_.load(std::memory_order_relaxed);
        
        while (current_bitmap != 0) {
            // Find first set bit (first free block)
            int block_index = __builtin_ctz(current_bitmap);
            uint32_t block_mask = 1U << block_index;
            
            // Try to claim this block
            if (free_bitmap_.compare_exchange_weak(
                current_bitmap, 
                current_bitmap & ~block_mask,
                std::memory_order_acquire,
                std::memory_order_relaxed)) {
                
                return &memory_pool_[block_index * BlockSize];
            }
            // If CAS failed, current_bitmap is updated, continue loop
        }
        
        return nullptr; // No free blocks
    }
    
    void deallocate(void* ptr) noexcept {
        if (!ptr) return;
        
        char* char_ptr = static_cast<char*>(ptr);
        ptrdiff_t offset = char_ptr - memory_pool_;
        
        if (offset >= 0 && offset < BlockSize * NumBlocks && offset % BlockSize == 0) {
            int block_index = offset / BlockSize;
            uint32_t block_mask = 1U << block_index;
            
            // Free the block
            free_bitmap_.fetch_or(block_mask, std::memory_order_release);
        }
    }
    
    size_t available_blocks() const noexcept {
        return __builtin_popcount(free_bitmap_.load(std::memory_order_relaxed));
    }
    
    size_t used_blocks() const noexcept {
        return NumBlocks - available_blocks();
    }
    
    constexpr size_t block_size() const noexcept { return BlockSize; }
    constexpr size_t total_blocks() const noexcept { return NumBlocks; }
};

// Real-time smart pointer with guaranteed deallocation time
template<typename T, size_t BlockSize = 64, size_t NumBlocks = 32>
class RealtimePtr {
private:
    T* ptr_;
    static RealtimeAllocator<BlockSize, NumBlocks> allocator_;
    
    static_assert(sizeof(T) <= BlockSize, "Object size exceeds block size");
    
public:
    RealtimePtr() : ptr_(nullptr) {}
    
    explicit RealtimePtr(T* ptr) : ptr_(ptr) {}
    
    template<typename... Args>
    static RealtimePtr make(Args&&... args) noexcept {
        void* memory = allocator_.allocate();
        if (!memory) {
            return RealtimePtr(); // Allocation failed
        }
        
        try {
            T* ptr = new(memory) T(std::forward<Args>(args)...);
            return RealtimePtr(ptr);
        } catch (...) {
            allocator_.deallocate(memory);
            return RealtimePtr();
        }
    }
    
    ~RealtimePtr() {
        if (ptr_) {
            ptr_->~T();
            allocator_.deallocate(ptr_);
        }
    }
    
    RealtimePtr(const RealtimePtr&) = delete;
    RealtimePtr& operator=(const RealtimePtr&) = delete;
    
    RealtimePtr(RealtimePtr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    RealtimePtr& operator=(RealtimePtr&& other) noexcept {
        if (this != &other) {
            if (ptr_) {
                ptr_->~T();
                allocator_.deallocate(ptr_);
            }
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    T* get() const noexcept { return ptr_; }
    T* operator->() const noexcept { return ptr_; }
    T& operator*() const noexcept { return *ptr_; }
    explicit operator bool() const noexcept { return ptr_ != nullptr; }
    
    T* release() noexcept {
        T* result = ptr_;
        ptr_ = nullptr;
        return result;
    }
    
    void reset(T* new_ptr = nullptr) noexcept {
        if (ptr_) {
            ptr_->~T();
            allocator_.deallocate(ptr_);
        }
        ptr_ = new_ptr;
    }
    
    // Real-time specific methods
    static size_t memory_available() noexcept {
        return allocator_.available_blocks() * allocator_.block_size();
    }
    
    static size_t objects_available() noexcept {
        return allocator_.available_blocks();
    }
    
    static bool has_memory_for_objects(size_t count) noexcept {
        return allocator_.available_blocks() >= count;
    }
};

template<typename T, size_t BlockSize, size_t NumBlocks>
RealtimeAllocator<BlockSize, NumBlocks> RealtimePtr<T, BlockSize, NumBlocks>::allocator_;

// Interrupt-safe pointer for ISR contexts
template<typename T>
class ISRSafePtr {
private:
    std::atomic<T*> ptr_;
    
public:
    ISRSafePtr() : ptr_(nullptr) {}
    
    explicit ISRSafePtr(T* ptr) : ptr_(ptr) {}
    
    // Atomic load - safe in ISR
    T* load(std::memory_order order = std::memory_order_acquire) const noexcept {
        return ptr_.load(order);
    }
    
    // Atomic store - safe in ISR
    void store(T* new_ptr, std::memory_order order = std::memory_order_release) noexcept {
        ptr_.store(new_ptr, order);
    }
    
    // Atomic exchange - safe in ISR
    T* exchange(T* new_ptr, std::memory_order order = std::memory_order_acq_rel) noexcept {
        return ptr_.exchange(new_ptr, order);
    }
    
    // Compare and swap - safe in ISR
    bool compare_exchange_weak(T*& expected, T* desired,
                               std::memory_order success = std::memory_order_acq_rel,
                               std::memory_order failure = std::memory_order_acquire) noexcept {
        return ptr_.compare_exchange_weak(expected, desired, success, failure);
    }
    
    // Direct atomic access
    T* get() const noexcept {
        return ptr_.load(std::memory_order_acquire);
    }
    
    // Safe dereference with null check
    template<typename Func>
    auto safe_call(Func&& func) -> decltype(func(*std::declval<T*>())) {
        T* current = get();
        if (current) {
            return func(*current);
        }
        return decltype(func(*current)){};
    }
    
    explicit operator bool() const noexcept {
        return get() != nullptr;
    }
};

// Priority-based pointer allocation for real-time tasks
template<typename T, size_t MaxPriorities = 4>
class PriorityAllocator {
private:
    struct PriorityPool {
        RealtimeAllocator<sizeof(T), 16> allocator;
        size_t reserved_blocks;
    };
    
    std::array<PriorityPool, MaxPriorities> priority_pools_;
    
public:
    PriorityAllocator() {
        // Reserve more blocks for higher priority tasks
        for (size_t i = 0; i < MaxPriorities; ++i) {
            priority_pools_[i].reserved_blocks = (MaxPriorities - i) * 4;
        }
    }
    
    template<typename... Args>
    T* allocate(size_t priority, Args&&... args) {
        if (priority >= MaxPriorities) {
            priority = MaxPriorities - 1;
        }
        
        // Try to allocate from the requested priority pool first
        for (size_t p = priority; p < MaxPriorities; ++p) {
            void* memory = priority_pools_[p].allocator.allocate();
            if (memory) {
                try {
                    return new(memory) T(std::forward<Args>(args)...);
                } catch (...) {
                    priority_pools_[p].allocator.deallocate(memory);
                    return nullptr;
                }
            }
        }
        
        // If high priority allocation failed, try lower priority pools
        // but only if they have spare capacity
        for (int p = priority - 1; p >= 0; --p) {
            auto& pool = priority_pools_[p];
            if (pool.allocator.available_blocks() > pool.reserved_blocks) {
                void* memory = pool.allocator.allocate();
                if (memory) {
                    try {
                        return new(memory) T(std::forward<Args>(args)...);
                    } catch (...) {
                        pool.allocator.deallocate(memory);
                        return nullptr;
                    }
                }
            }
        }
        
        return nullptr; // Allocation failed
    }
    
    void deallocate(T* ptr, size_t priority) {
        if (!ptr || priority >= MaxPriorities) return;
        
        ptr->~T();
        
        // Find which pool this pointer belongs to
        for (auto& pool : priority_pools_) {
            pool.allocator.deallocate(ptr);
            // Note: allocator.deallocate is safe to call even if 
            // the pointer doesn't belong to this pool
        }
    }
    
    size_t available_at_priority(size_t priority) const {
        if (priority >= MaxPriorities) return 0;
        return priority_pools_[priority].allocator.available_blocks();
    }
};

// Real-time performance measurement
class RealtimeProfiler {
private:
    std::chrono::high_resolution_clock::time_point start_time_;
    const char* operation_name_;
    uint64_t max_allowed_ns_;
    
public:
    RealtimeProfiler(const char* name, uint64_t max_ns) 
        : operation_name_(name)
        , max_allowed_ns_(max_ns)
        , start_time_(std::chrono::high_resolution_clock::now()) {}
    
    ~RealtimeProfiler() {
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(
            end_time - start_time_).count();
        
        if (duration_ns > max_allowed_ns_) {
            // In a real embedded system, this might trigger a warning LED,
            // log to EEPROM, or increment an error counter
            printf("REALTIME VIOLATION: %s took %lu ns (max: %lu ns)\\n",
                   operation_name_, duration_ns, max_allowed_ns_);
        }
    }
};

#define REALTIME_PROFILE(name, max_ns) \\
    RealtimeProfiler __prof__(name, max_ns)

// Example real-time system
class RealtimeController {
private:
    ISRSafePtr<float> sensor_data_;
    PriorityAllocator<int> allocator_;
    
    static constexpr uint64_t MAX_ISR_TIME_NS = 50000; // 50 microseconds
    static constexpr uint64_t MAX_CONTROL_LOOP_TIME_NS = 1000000; // 1 millisecond
    
public:
    // Called from interrupt service routine
    void isr_update_sensor(float new_value) {
        REALTIME_PROFILE("ISR Update", MAX_ISR_TIME_NS);
        
        // Atomic update - safe from interrupt context
        static float sensor_buffer = 0.0f;
        sensor_buffer = new_value;
        sensor_data_.store(&sensor_buffer);
    }
    
    // Main control loop
    void control_loop() {
        REALTIME_PROFILE("Control Loop", MAX_CONTROL_LOOP_TIME_NS);
        
        // Get current sensor reading atomically
        float current_value = 0.0f;
        sensor_data_.safe_call([&current_value](const float& value) {
            current_value = value;
            return true;
        });
        
        // Allocate memory for high-priority control calculation
        int* control_data = allocator_.allocate(0, static_cast<int>(current_value * 100));
        if (control_data) {
            // Perform control calculation
            *control_data = static_cast<int>(current_value * 1.5f);
            
            // Use the data...
            printf("Control output: %d\\n", *control_data);
            
            // Deallocate when done
            allocator_.deallocate(control_data, 0);
        }
    }
    
    void print_status() {
        printf("Priority 0 (highest) blocks available: %zu\\n", 
               allocator_.available_at_priority(0));
        printf("Priority 1 blocks available: %zu\\n", 
               allocator_.available_at_priority(1));
        printf("Priority 2 blocks available: %zu\\n", 
               allocator_.available_at_priority(2));
        printf("Priority 3 (lowest) blocks available: %zu\\n", 
               allocator_.available_at_priority(3));
    }
};

} // namespace realtime_management`
    },
    
    'stack-heap-optimization': {
      title: state.language === 'en' ? 'Stack vs Heap Optimization' : 'Optimización Stack vs Heap',
      code: `#include <memory>
#include <array>
#include <cstddef>
#include <type_traits>
#include <utility>

// Stack vs Heap optimization strategies for embedded systems
namespace stack_heap_optimization {

// Compile-time decision between stack and heap allocation
template<typename T, size_t MaxSize>
class AdaptiveStorage {
private:
    static constexpr bool use_stack = sizeof(T) <= MaxSize;
    
    using StackStorage = std::aligned_storage_t<sizeof(T), alignof(T)>;
    using HeapStorage = std::unique_ptr<T>;
    
    union Storage {
        StackStorage stack_storage;
        HeapStorage heap_storage;
        
        Storage() {} // Intentionally empty
        ~Storage() {} // Destruction handled by AdaptiveStorage
    } storage_;
    
    bool constructed_{false};
    
public:
    AdaptiveStorage() = default;
    
    template<typename... Args>
    explicit AdaptiveStorage(Args&&... args) {
        construct(std::forward<Args>(args)...);
    }
    
    ~AdaptiveStorage() {
        destroy();
    }
    
    AdaptiveStorage(const AdaptiveStorage&) = delete;
    AdaptiveStorage& operator=(const AdaptiveStorage&) = delete;
    
    AdaptiveStorage(AdaptiveStorage&& other) noexcept {
        if (other.constructed_) {
            if constexpr (use_stack) {
                construct(std::move(*other.get()));
                other.destroy();
            } else {
                storage_.heap_storage = std::move(other.storage_.heap_storage);
                constructed_ = true;
                other.constructed_ = false;
            }
        }
    }
    
    AdaptiveStorage& operator=(AdaptiveStorage&& other) noexcept {
        if (this != &other) {
            destroy();
            
            if (other.constructed_) {
                if constexpr (use_stack) {
                    construct(std::move(*other.get()));
                    other.destroy();
                } else {
                    storage_.heap_storage = std::move(other.storage_.heap_storage);
                    constructed_ = true;
                    other.constructed_ = false;
                }
            }
        }
        return *this;
    }
    
    template<typename... Args>
    void construct(Args&&... args) {
        if (constructed_) {
            destroy();
        }
        
        if constexpr (use_stack) {
            new(&storage_.stack_storage) T(std::forward<Args>(args)...);
        } else {
            new(&storage_.heap_storage) HeapStorage(
                std::make_unique<T>(std::forward<Args>(args)...)
            );
        }
        constructed_ = true;
    }
    
    void destroy() {
        if (constructed_) {
            if constexpr (use_stack) {
                get()->~T();
            } else {
                storage_.heap_storage.~HeapStorage();
            }
            constructed_ = false;
        }
    }
    
    T* get() noexcept {
        if (!constructed_) return nullptr;
        
        if constexpr (use_stack) {
            return reinterpret_cast<T*>(&storage_.stack_storage);
        } else {
            return storage_.heap_storage.get();
        }
    }
    
    const T* get() const noexcept {
        if (!constructed_) return nullptr;
        
        if constexpr (use_stack) {
            return reinterpret_cast<const T*>(&storage_.stack_storage);
        } else {
            return storage_.heap_storage.get();
        }
    }
    
    T& operator*() { return *get(); }
    const T& operator*() const { return *get(); }
    T* operator->() { return get(); }
    const T* operator->() const { return get(); }
    
    explicit operator bool() const { return constructed_; }
    
    static constexpr bool uses_stack() { return use_stack; }
    static constexpr bool uses_heap() { return !use_stack; }
    static constexpr size_t max_stack_size() { return MaxSize; }
};

// Stack-based array with overflow protection
template<typename T, size_t N>
class StackArray {
private:
    T data_[N];
    size_t size_{0};
    
public:
    StackArray() = default;
    
    template<typename... Args>
    bool emplace_back(Args&&... args) {
        if (size_ >= N) {
            return false; // Stack overflow protection
        }
        
        new(&data_[size_]) T(std::forward<Args>(args)...);
        ++size_;
        return true;
    }
    
    bool push_back(const T& value) {
        return emplace_back(value);
    }
    
    bool push_back(T&& value) {
        return emplace_back(std::move(value));
    }
    
    void pop_back() {
        if (size_ > 0) {
            --size_;
            data_[size_].~T();
        }
    }
    
    T& operator[](size_t index) {
        return data_[index]; // No bounds checking for performance
    }
    
    const T& operator[](size_t index) const {
        return data_[index];
    }
    
    T& at(size_t index) {
        if (index >= size_) {
            // In embedded systems, might trigger a reset or error state
            while(1) {} // Halt system
        }
        return data_[index];
    }
    
    const T& at(size_t index) const {
        if (index >= size_) {
            while(1) {} // Halt system
        }
        return data_[index];
    }
    
    T* begin() { return data_; }
    const T* begin() const { return data_; }
    T* end() { return data_ + size_; }
    const T* end() const { return data_ + size_; }
    
    size_t size() const noexcept { return size_; }
    size_t capacity() const noexcept { return N; }
    bool empty() const noexcept { return size_ == 0; }
    bool full() const noexcept { return size_ == N; }
    
    void clear() {
        for (size_t i = 0; i < size_; ++i) {
            data_[i].~T();
        }
        size_ = 0;
    }
    
    // Stack usage measurement
    size_t bytes_used() const noexcept {
        return size_ * sizeof(T);
    }
    
    size_t bytes_available() const noexcept {
        return (N - size_) * sizeof(T);
    }
    
    double utilization() const noexcept {
        return static_cast<double>(size_) / N;
    }
};

// Hybrid stack/heap container that starts on stack and migrates to heap
template<typename T, size_t StackCapacity>
class HybridContainer {
private:
    alignas(T) char stack_storage_[StackCapacity * sizeof(T)];
    std::unique_ptr<T[]> heap_storage_;
    size_t capacity_;
    size_t size_;
    bool using_heap_;
    
    T* get_storage() {
        return using_heap_ ? heap_storage_.get() : 
               reinterpret_cast<T*>(stack_storage_);
    }
    
    const T* get_storage() const {
        return using_heap_ ? heap_storage_.get() : 
               reinterpret_cast<const T*>(stack_storage_);
    }
    
    void migrate_to_heap(size_t new_capacity) {
        if (using_heap_ && new_capacity <= capacity_) {
            return; // Already sufficient heap capacity
        }
        
        // Allocate new heap storage
        auto new_heap = std::make_unique<T[]>(new_capacity);
        
        // Move elements from current storage to heap
        T* current_storage = get_storage();
        for (size_t i = 0; i < size_; ++i) {
            new(new_heap.get() + i) T(std::move(current_storage[i]));
            current_storage[i].~T();
        }
        
        // Switch to heap storage
        heap_storage_ = std::move(new_heap);
        capacity_ = new_capacity;
        using_heap_ = true;
    }
    
public:
    HybridContainer() 
        : capacity_(StackCapacity), size_(0), using_heap_(false) {}
    
    ~HybridContainer() {
        clear();
    }
    
    HybridContainer(const HybridContainer&) = delete;
    HybridContainer& operator=(const HybridContainer&) = delete;
    
    HybridContainer(HybridContainer&& other) noexcept
        : capacity_(other.capacity_), size_(other.size_), using_heap_(other.using_heap_) {
        
        if (using_heap_) {
            heap_storage_ = std::move(other.heap_storage_);
        } else {
            // Move stack elements
            T* other_storage = other.get_storage();
            T* my_storage = reinterpret_cast<T*>(stack_storage_);
            for (size_t i = 0; i < size_; ++i) {
                new(my_storage + i) T(std::move(other_storage[i]));
                other_storage[i].~T();
            }
        }
        
        other.size_ = 0;
        other.using_heap_ = false;
    }
    
    template<typename... Args>
    void emplace_back(Args&&... args) {
        if (size_ >= capacity_) {
            // Need to grow - migrate to heap with double capacity
            size_t new_capacity = capacity_ * 2;
            migrate_to_heap(new_capacity);
        }
        
        T* storage = get_storage();
        new(storage + size_) T(std::forward<Args>(args)...);
        ++size_;
    }
    
    void push_back(const T& value) {
        emplace_back(value);
    }
    
    void push_back(T&& value) {
        emplace_back(std::move(value));
    }
    
    void pop_back() {
        if (size_ > 0) {
            --size_;
            get_storage()[size_].~T();
        }
    }
    
    T& operator[](size_t index) {
        return get_storage()[index];
    }
    
    const T& operator[](size_t index) const {
        return get_storage()[index];
    }
    
    T* begin() { return get_storage(); }
    const T* begin() const { return get_storage(); }
    T* end() { return get_storage() + size_; }
    const T* end() const { return get_storage() + size_; }
    
    size_t size() const noexcept { return size_; }
    size_t capacity() const noexcept { return capacity_; }
    bool empty() const noexcept { return size_ == 0; }
    
    void clear() {
        T* storage = get_storage();
        for (size_t i = 0; i < size_; ++i) {
            storage[i].~T();
        }
        size_ = 0;
    }
    
    // Optimization information
    bool is_using_heap() const noexcept { return using_heap_; }
    bool is_using_stack() const noexcept { return !using_heap_; }
    static constexpr size_t stack_capacity() { return StackCapacity; }
    
    void reserve(size_t new_capacity) {
        if (new_capacity > capacity_) {
            migrate_to_heap(new_capacity);
        }
    }
    
    // Force migration to heap (for testing or explicit control)
    void force_heap_migration() {
        if (!using_heap_) {
            migrate_to_heap(capacity_ * 2);
        }
    }
};

// Stack usage monitor for debugging
class StackMonitor {
private:
    const char* stack_bottom_;
    size_t max_stack_size_;
    size_t high_water_mark_;
    
public:
    StackMonitor(size_t max_size = 8192) 
        : max_stack_size_(max_size), high_water_mark_(0) {
        
        // Get approximate stack bottom (this is platform-specific)
        volatile int stack_var;
        stack_bottom_ = reinterpret_cast<const char*>(&stack_var);
    }
    
    size_t current_usage() const {
        volatile int current_var;
        const char* current_pos = reinterpret_cast<const char*>(&current_var);
        
        // Stack typically grows downward
        ptrdiff_t usage = stack_bottom_ - current_pos;
        return usage > 0 ? static_cast<size_t>(usage) : 0;
    }
    
    void update_high_water_mark() {
        size_t current = current_usage();
        if (current > high_water_mark_) {
            high_water_mark_ = current;
        }
    }
    
    size_t get_high_water_mark() const {
        return high_water_mark_;
    }
    
    double utilization() const {
        return static_cast<double>(high_water_mark_) / max_stack_size_;
    }
    
    bool is_near_limit(double threshold = 0.8) const {
        return utilization() > threshold;
    }
    
    void print_status() const {
        printf("Stack usage: %zu bytes (high water: %zu)\\n", 
               current_usage(), high_water_mark_);
        printf("Stack utilization: %.1f%%\\n", utilization() * 100);
        
        if (is_near_limit()) {
            printf("WARNING: Stack usage near limit!\\n");
        }
    }
};

// Example usage demonstrating optimization strategies
class EmbeddedOptimizer {
private:
    StackMonitor stack_monitor_;
    HybridContainer<int, 16> hybrid_ints_;
    AdaptiveStorage<std::array<float, 100>, 256> adaptive_floats_;
    
public:
    void demonstrate_optimizations() {
        stack_monitor_.update_high_water_mark();
        
        printf("=== Adaptive Storage Demo ===\\n");
        printf("Using %s storage for float array\\n", 
               adaptive_floats_.uses_stack() ? "stack" : "heap");
        
        adaptive_floats_.construct();
        (*adaptive_floats_)[0] = 3.14f;
        printf("First element: %f\\n", (*adaptive_floats_)[0]);
        
        printf("\\n=== Hybrid Container Demo ===\\n");
        printf("Starting with stack storage...\\n");
        
        // Fill beyond stack capacity to trigger heap migration
        for (int i = 0; i < 25; ++i) {
            hybrid_ints_.push_back(i * i);
            
            if (i == 15) {
                printf("Before migration - using %s\\n",
                       hybrid_ints_.is_using_stack() ? "stack" : "heap");
            }
        }
        
        printf("After adding 25 elements - using %s\\n",
               hybrid_ints_.is_using_stack() ? "stack" : "heap");
        printf("Container size: %zu, capacity: %zu\\n",
               hybrid_ints_.size(), hybrid_ints_.capacity());
        
        stack_monitor_.update_high_water_mark();
        stack_monitor_.print_status();
    }
    
    void memory_pressure_test() {
        printf("\\n=== Memory Pressure Test ===\\n");
        
        StackArray<int, 100> stack_array;
        
        // Fill array and monitor stack usage
        for (size_t i = 0; i < 100; ++i) {
            if (!stack_array.push_back(i)) {
                printf("Stack array full at %zu elements\\n", i);
                break;
            }
            
            if (i % 25 == 0) {
                printf("Array utilization: %.1f%%, Stack bytes used: %zu\\n",
                       stack_array.utilization() * 100,
                       stack_array.bytes_used());
                stack_monitor_.update_high_water_mark();
            }
        }
        
        stack_monitor_.print_status();
    }
};

} // namespace stack_heap_optimization`
    },
    
    'embedded-patterns': {
      title: state.language === 'en' ? 'Embedded-Specific Patterns' : 'Patrones Específicos para Sistemas Embebidos',
      code: `#include <memory>
#include <array>
#include <atomic>
#include <type_traits>
#include <functional>

// Embedded-specific patterns for resource-constrained systems
namespace embedded_patterns {

// Power-aware pointer management
template<typename T>
class PowerAwarePtr {
private:
    T* ptr_;
    std::atomic<bool> active_;
    std::function<void()> power_down_callback_;
    std::function<void()> power_up_callback_;
    
public:
    PowerAwarePtr() : ptr_(nullptr), active_(false) {}
    
    explicit PowerAwarePtr(T* ptr, 
                          std::function<void()> power_down = nullptr,
                          std::function<void()> power_up = nullptr)
        : ptr_(ptr), active_(true)
        , power_down_callback_(power_down)
        , power_up_callback_(power_up) {}
    
    ~PowerAwarePtr() {
        power_down();
        delete ptr_;
    }
    
    PowerAwarePtr(const PowerAwarePtr&) = delete;
    PowerAwarePtr& operator=(const PowerAwarePtr&) = delete;
    
    PowerAwarePtr(PowerAwarePtr&& other) noexcept
        : ptr_(other.ptr_), active_(other.active_.load())
        , power_down_callback_(std::move(other.power_down_callback_))
        , power_up_callback_(std::move(other.power_up_callback_)) {
        other.ptr_ = nullptr;
        other.active_ = false;
    }
    
    T* get() {
        if (!active_.load(std::memory_order_acquire)) {
            power_up();
        }
        return ptr_;
    }
    
    T* operator->() { return get(); }
    T& operator*() { return *get(); }
    
    void power_down() {
        if (active_.exchange(false, std::memory_order_acq_rel)) {
            if (power_down_callback_) {
                power_down_callback_();
            }
        }
    }
    
    void power_up() {
        if (!active_.exchange(true, std::memory_order_acq_rel)) {
            if (power_up_callback_) {
                power_up_callback_();
            }
        }
    }
    
    bool is_active() const {
        return active_.load(std::memory_order_acquire);
    }
    
    explicit operator bool() const {
        return ptr_ != nullptr;
    }
};

// DMA-safe memory allocator
template<size_t Size, size_t Alignment = 32>
class DMAAllocator {
private:
    alignas(Alignment) char dma_buffer_[Size];
    size_t offset_{0};
    std::atomic<bool> in_use_flags_[Size / Alignment];
    
    static constexpr size_t num_blocks_ = Size / Alignment;
    
public:
    DMAAllocator() {
        for (size_t i = 0; i < num_blocks_; ++i) {
            in_use_flags_[i] = false;
        }
    }
    
    void* allocate_dma_safe(size_t size) {
        // Round up to alignment boundary
        size_t blocks_needed = (size + Alignment - 1) / Alignment;
        
        if (blocks_needed > num_blocks_) {
            return nullptr; // Too large
        }
        
        // Find consecutive free blocks
        for (size_t start = 0; start <= num_blocks_ - blocks_needed; ++start) {
            bool all_free = true;
            
            // Check if all needed blocks are free
            for (size_t i = 0; i < blocks_needed; ++i) {
                if (in_use_flags_[start + i].load(std::memory_order_acquire)) {
                    all_free = false;
                    break;
                }
            }
            
            if (all_free) {
                // Try to claim all blocks atomically
                bool success = true;
                for (size_t i = 0; i < blocks_needed; ++i) {
                    bool expected = false;
                    if (!in_use_flags_[start + i].compare_exchange_strong(
                            expected, true, std::memory_order_acq_rel)) {
                        // Failed to claim block - rollback
                        for (size_t j = 0; j < i; ++j) {
                            in_use_flags_[start + j] = false;
                        }
                        success = false;
                        break;
                    }
                }
                
                if (success) {
                    return &dma_buffer_[start * Alignment];
                }
            }
        }
        
        return nullptr; // No suitable block found
    }
    
    void deallocate_dma_safe(void* ptr) {
        if (!ptr) return;
        
        char* char_ptr = static_cast<char*>(ptr);
        ptrdiff_t offset = char_ptr - dma_buffer_;
        
        if (offset >= 0 && offset < Size && offset % Alignment == 0) {
            size_t block_index = offset / Alignment;
            
            // Find the extent of this allocation
            size_t block_count = 0;
            for (size_t i = block_index; i < num_blocks_; ++i) {
                if (in_use_flags_[i].load(std::memory_order_acquire)) {
                    block_count++;
                } else {
                    break;
                }
            }
            
            // Free all blocks
            for (size_t i = 0; i < block_count; ++i) {
                in_use_flags_[block_index + i].store(false, std::memory_order_release);
            }
        }
    }
    
    bool is_dma_safe(void* ptr) const {
        char* char_ptr = static_cast<char*>(ptr);
        ptrdiff_t offset = char_ptr - dma_buffer_;
        return offset >= 0 && offset < Size;
    }
    
    size_t available_bytes() const {
        size_t free_blocks = 0;
        for (size_t i = 0; i < num_blocks_; ++i) {
            if (!in_use_flags_[i].load(std::memory_order_acquire)) {
                free_blocks++;
            }
        }
        return free_blocks * Alignment;
    }
};

// DMA-safe smart pointer
template<typename T>
class DMASafePtr {
private:
    T* ptr_;
    static DMAAllocator<4096, 32> dma_allocator_;
    
public:
    DMASafePtr() : ptr_(nullptr) {}
    
    template<typename... Args>
    static DMASafePtr make(Args&&... args) {
        void* memory = dma_allocator_.allocate_dma_safe(sizeof(T));
        if (!memory) {
            return DMASafePtr(); // Allocation failed
        }
        
        try {
            T* ptr = new(memory) T(std::forward<Args>(args)...);
            return DMASafePtr(ptr);
        } catch (...) {
            dma_allocator_.deallocate_dma_safe(memory);
            return DMASafePtr();
        }
    }
    
    ~DMASafePtr() {
        if (ptr_) {
            ptr_->~T();
            dma_allocator_.deallocate_dma_safe(ptr_);
        }
    }
    
    DMASafePtr(const DMASafePtr&) = delete;
    DMASafePtr& operator=(const DMASafePtr&) = delete;
    
    DMASafePtr(DMASafePtr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    DMASafePtr& operator=(DMASafePtr&& other) noexcept {
        if (this != &other) {
            if (ptr_) {
                ptr_->~T();
                dma_allocator_.deallocate_dma_safe(ptr_);
            }
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    T* get() const { return ptr_; }
    T* operator->() const { return ptr_; }
    T& operator*() const { return *ptr_; }
    explicit operator bool() const { return ptr_ != nullptr; }
    
    bool is_dma_safe() const {
        return ptr_ ? dma_allocator_.is_dma_safe(ptr_) : false;
    }
    
    static size_t dma_memory_available() {
        return dma_allocator_.available_bytes();
    }
    
private:
    explicit DMASafePtr(T* ptr) : ptr_(ptr) {}
};

template<typename T>
DMAAllocator<4096, 32> DMASafePtr<T>::dma_allocator_;

// Watchdog-safe pointer with timeout protection
template<typename T>
class WatchdogPtr {
private:
    T* ptr_;
    std::chrono::steady_clock::time_point last_access_;
    std::chrono::milliseconds timeout_;
    std::function<void()> timeout_callback_;
    
public:
    WatchdogPtr() : ptr_(nullptr), timeout_(1000) {}
    
    explicit WatchdogPtr(T* ptr, 
                        std::chrono::milliseconds timeout = std::chrono::milliseconds(1000),
                        std::function<void()> on_timeout = nullptr)
        : ptr_(ptr), timeout_(timeout), timeout_callback_(on_timeout)
        , last_access_(std::chrono::steady_clock::now()) {}
    
    ~WatchdogPtr() {
        delete ptr_;
    }
    
    T* get() {
        check_timeout();
        last_access_ = std::chrono::steady_clock::now();
        return ptr_;
    }
    
    T* operator->() { return get(); }
    T& operator*() { return *get(); }
    
    void kick_watchdog() {
        last_access_ = std::chrono::steady_clock::now();
    }
    
    bool is_timed_out() const {
        auto now = std::chrono::steady_clock::now();
        return (now - last_access_) > timeout_;
    }
    
    void set_timeout(std::chrono::milliseconds new_timeout) {
        timeout_ = new_timeout;
    }
    
    explicit operator bool() const {
        return ptr_ != nullptr && !is_timed_out();
    }
    
private:
    void check_timeout() {
        if (is_timed_out() && timeout_callback_) {
            timeout_callback_();
        }
    }
};

// Flash memory-aware pointer for storing pointers in non-volatile memory
template<typename T>
class FlashPtr {
private:
    // Simulated flash memory address
    static constexpr uintptr_t FLASH_BASE = 0x08000000;
    uintptr_t flash_offset_;
    
public:
    FlashPtr() : flash_offset_(0) {}
    
    explicit FlashPtr(uintptr_t offset) : flash_offset_(offset) {}
    
    // Store pointer value in flash (simulation)
    static bool store_in_flash(uintptr_t offset, T* ptr) {
        // In real implementation, this would write to flash memory
        // Here we simulate with static storage
        static std::array<uintptr_t, 256> simulated_flash{};
        
        if (offset >= simulated_flash.size() * sizeof(uintptr_t)) {
            return false; // Out of flash space
        }
        
        size_t index = offset / sizeof(uintptr_t);
        simulated_flash[index] = reinterpret_cast<uintptr_t>(ptr);
        return true;
    }
    
    // Load pointer from flash
    T* load_from_flash() const {
        static std::array<uintptr_t, 256> simulated_flash{};
        
        if (flash_offset_ >= simulated_flash.size() * sizeof(uintptr_t)) {
            return nullptr;
        }
        
        size_t index = flash_offset_ / sizeof(uintptr_t);
        return reinterpret_cast<T*>(simulated_flash[index]);
    }
    
    bool store(T* ptr) {
        return store_in_flash(flash_offset_, ptr);
    }
    
    T* load() const {
        return load_from_flash();
    }
    
    T* operator->() const { return load(); }
    T& operator*() const { return *load(); }
    explicit operator bool() const { return load() != nullptr; }
    
    uintptr_t get_flash_address() const {
        return FLASH_BASE + flash_offset_;
    }
};

// Resource tracking pointer for monitoring embedded resources
template<typename T>
class ResourceTrackingPtr {
private:
    T* ptr_;
    size_t resource_id_;
    static std::array<bool, 64> resource_usage_;
    static std::atomic<size_t> total_allocations_;
    static std::atomic<size_t> peak_usage_;
    
public:
    ResourceTrackingPtr() : ptr_(nullptr), resource_id_(64) {} // Invalid ID
    
    template<typename... Args>
    static ResourceTrackingPtr make(Args&&... args) {
        size_t id = allocate_resource_id();
        if (id >= 64) {
            return ResourceTrackingPtr(); // No resources available
        }
        
        try {
            T* ptr = new T(std::forward<Args>(args)...);
            total_allocations_.fetch_add(1, std::memory_order_relaxed);
            update_peak_usage();
            return ResourceTrackingPtr(ptr, id);
        } catch (...) {
            resource_usage_[id] = false;
            return ResourceTrackingPtr();
        }
    }
    
    ~ResourceTrackingPtr() {
        if (ptr_ && resource_id_ < 64) {
            delete ptr_;
            resource_usage_[resource_id_] = false;
        }
    }
    
    ResourceTrackingPtr(const ResourceTrackingPtr&) = delete;
    ResourceTrackingPtr& operator=(const ResourceTrackingPtr&) = delete;
    
    ResourceTrackingPtr(ResourceTrackingPtr&& other) noexcept
        : ptr_(other.ptr_), resource_id_(other.resource_id_) {
        other.ptr_ = nullptr;
        other.resource_id_ = 64;
    }
    
    ResourceTrackingPtr& operator=(ResourceTrackingPtr&& other) noexcept {
        if (this != &other) {
            if (ptr_ && resource_id_ < 64) {
                delete ptr_;
                resource_usage_[resource_id_] = false;
            }
            ptr_ = other.ptr_;
            resource_id_ = other.resource_id_;
            other.ptr_ = nullptr;
            other.resource_id_ = 64;
        }
        return *this;
    }
    
    T* get() const { return ptr_; }
    T* operator->() const { return ptr_; }
    T& operator*() const { return *ptr_; }
    explicit operator bool() const { return ptr_ != nullptr; }
    
    size_t get_resource_id() const { return resource_id_; }
    
    // Resource monitoring
    static size_t active_resources() {
        size_t count = 0;
        for (bool used : resource_usage_) {
            if (used) count++;
        }
        return count;
    }
    
    static size_t available_resources() {
        return 64 - active_resources();
    }
    
    static size_t total_allocations() {
        return total_allocations_.load();
    }
    
    static size_t peak_usage() {
        return peak_usage_.load();
    }
    
    static double resource_utilization() {
        return static_cast<double>(active_resources()) / 64.0;
    }
    
private:
    ResourceTrackingPtr(T* ptr, size_t id) : ptr_(ptr), resource_id_(id) {}
    
    static size_t allocate_resource_id() {
        for (size_t i = 0; i < 64; ++i) {
            bool expected = false;
            if (resource_usage_[i].compare_exchange_strong(
                    expected, true, std::memory_order_acq_rel)) {
                return i;
            }
        }
        return 64; // No resources available
    }
    
    static void update_peak_usage() {
        size_t current = active_resources();
        size_t current_peak = peak_usage_.load();
        while (current > current_peak) {
            if (peak_usage_.compare_exchange_weak(current_peak, current)) {
                break;
            }
        }
    }
};

template<typename T>
std::array<bool, 64> ResourceTrackingPtr<T>::resource_usage_{};

template<typename T>
std::atomic<size_t> ResourceTrackingPtr<T>::total_allocations_{0};

template<typename T>
std::atomic<size_t> ResourceTrackingPtr<T>::peak_usage_{0};

// Example embedded system using these patterns
class EmbeddedSystem {
private:
    PowerAwarePtr<int> sensor_controller_;
    DMASafePtr<std::array<uint8_t, 256>> dma_buffer_;
    WatchdogPtr<float> critical_data_;
    FlashPtr<int> config_storage_;
    ResourceTrackingPtr<double> computation_unit_;
    
public:
    EmbeddedSystem() {
        // Initialize power-aware sensor with callbacks
        sensor_controller_ = PowerAwarePtr<int>(
            new int(42),
            []() { printf("Sensor powering down\\n"); },
            []() { printf("Sensor powering up\\n"); }
        );
        
        // Initialize DMA-safe buffer
        dma_buffer_ = DMASafePtr<std::array<uint8_t, 256>>::make();
        
        // Initialize watchdog-protected data with 5-second timeout
        critical_data_ = WatchdogPtr<float>(
            new float(3.14f),
            std::chrono::milliseconds(5000),
            []() { printf("WATCHDOG TIMEOUT: Resetting system\\n"); }
        );
        
        // Initialize flash storage
        config_storage_ = FlashPtr<int>(0x100);
        config_storage_.store(new int(12345));
        
        // Initialize resource tracking
        computation_unit_ = ResourceTrackingPtr<double>::make(2.71828);
    }
    
    void run_system() {
        printf("=== Embedded System Operation ===\\n");
        
        // Access sensor (will power up if needed)
        printf("Sensor value: %d\\n", *sensor_controller_);
        
        // Use DMA buffer
        if (dma_buffer_) {
            (*dma_buffer_)[0] = 0xAA;
            printf("DMA buffer first byte: 0x%02X\\n", (*dma_buffer_)[0]);
            printf("DMA safe: %s\\n", dma_buffer_.is_dma_safe() ? "Yes" : "No");
        }
        
        // Access critical data (kicks watchdog)
        printf("Critical data: %f\\n", *critical_data_);
        
        // Access flash storage
        int* config = config_storage_.load();
        if (config) {
            printf("Config from flash: %d\\n", *config);
        }
        
        // Check computation unit
        if (computation_unit_) {
            printf("Computation result: %f\\n", *computation_unit_);
        }
        
        print_resource_status();
    }
    
    void print_resource_status() {
        printf("\\n=== Resource Status ===\\n");
        printf("Active resources: %zu/64\\n", 
               ResourceTrackingPtr<double>::active_resources());
        printf("Peak usage: %zu\\n", 
               ResourceTrackingPtr<double>::peak_usage());
        printf("Total allocations: %zu\\n", 
               ResourceTrackingPtr<double>::total_allocations());
        printf("Resource utilization: %.1f%%\\n", 
               ResourceTrackingPtr<double>::resource_utilization() * 100);
        printf("DMA memory available: %zu bytes\\n",
               DMASafePtr<uint8_t>::dma_memory_available());
    }
    
    void simulate_timeout() {
        printf("\\n=== Simulating Watchdog Timeout ===\\n");
        // Don't access critical_data_ to trigger timeout
        std::this_thread::sleep_for(std::chrono::milliseconds(6000));
        
        // This access should trigger the timeout callback
        if (critical_data_) {
            printf("Critical data: %f\\n", *critical_data_);
        }
    }
    
    void power_management_demo() {
        printf("\\n=== Power Management Demo ===\\n");
        printf("Sensor active: %s\\n", sensor_controller_.is_active() ? "Yes" : "No");
        
        sensor_controller_.power_down();
        printf("After power down - active: %s\\n", 
               sensor_controller_.is_active() ? "Yes" : "No");
        
        // Next access will power up
        printf("Accessing sensor: %d\\n", *sensor_controller_);
        printf("After access - active: %s\\n", 
               sensor_controller_.is_active() ? "Yes" : "No");
    }
};

} // namespace embedded_patterns`
    }
  };

  const currentExample = examples[activeExample as keyof typeof examples];

  const handlePatternSelect = (pattern: string) => {
    setSelectedPattern(pattern);
    
    // Update metrics based on selected pattern
    const patternMetrics: { [key: string]: EmbeddedMetrics } = {
      'Stack Opt': { memoryUsage: 0.75, realtimePerformance: 0.95, stackOptimization: 0.98, powerEfficiency: 0.85 },
      'Pool Alloc': { memoryUsage: 0.88, realtimePerformance: 0.92, stackOptimization: 0.70, powerEfficiency: 0.82 },
      'Real-time': { memoryUsage: 0.82, realtimePerformance: 0.98, stackOptimization: 0.85, powerEfficiency: 0.78 },
      'RTOS Ptr': { memoryUsage: 0.85, realtimePerformance: 0.90, stackOptimization: 0.80, powerEfficiency: 0.80 },
      'DMA Safe': { memoryUsage: 0.90, realtimePerformance: 0.88, stackOptimization: 0.75, powerEfficiency: 0.85 },
      'Low Power': { memoryUsage: 0.70, realtimePerformance: 0.82, stackOptimization: 0.88, powerEfficiency: 0.95 },
      'ISR Safe': { memoryUsage: 0.78, realtimePerformance: 0.95, stackOptimization: 0.92, powerEfficiency: 0.88 }
    };
    
    if (patternMetrics[pattern]) {
      setMetrics(patternMetrics[pattern]);
    }
  };

  return (
    <div className="lesson-container">
      <header className="lesson-header">
        <h1>{state.language === 'en' ? 'Lesson 115: Embedded Systems Optimization' : 'Lección 115: Optimización de Sistemas Embebidos'}</h1>
        <p className="lesson-description">
          {state.language === 'en' 
            ? 'Master embedded systems optimization techniques including memory-constrained environments, real-time pointer management, stack vs heap optimization, and embedded-specific patterns for resource-limited devices.'
            : 'Domina técnicas de optimización de sistemas embebidos incluyendo entornos con memoria limitada, gestión de punteros en tiempo real, optimización stack vs heap y patrones específicos para dispositivos con recursos limitados.'}
        </p>
      </header>

      <div className="lesson-content">
        <div className="visualization-section">
          <h3>{state.language === 'en' ? 'Embedded Systems Visualization' : 'Visualización de Sistemas Embebidos'}</h3>
          <div className="canvas-container" style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '20px' }}>
            <Canvas camera={{ position: [8, 5, 8] }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />
              <EmbeddedVisualization 
                metrics={metrics}
                activePattern={selectedPattern}
                onPatternSelect={handlePatternSelect}
              />
            </Canvas>
          </div>
          
          <div className="pattern-info">
            <h4>{state.language === 'en' ? 'Embedded Metrics' : 'Métricas de Sistemas Embebidos'}</h4>
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Memory Usage' : 'Uso de Memoria'}:</span>
                <span className="metric-value">{(metrics.memoryUsage * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Realtime Performance' : 'Rendimiento Tiempo Real'}:</span>
                <span className="metric-value">{(metrics.realtimePerformance * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Stack Optimization' : 'Optimización Stack'}:</span>
                <span className="metric-value">{(metrics.stackOptimization * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Power Efficiency' : 'Eficiencia Energética'}:</span>
                <span className="metric-value">{(metrics.powerEfficiency * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="selected-pattern">
              <strong>{state.language === 'en' ? 'Selected Pattern:' : 'Patrón Seleccionado:'}</strong> {selectedPattern}
            </div>
          </div>
        </div>

        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Embedded Systems Examples' : 'Ejemplos de Sistemas Embebidos'}</h3>
          
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
              <h4>{state.language === 'en' ? 'Memory-Constrained Environments' : 'Entornos con Memoria Limitada'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Stack-based allocators for deterministic allocation' : 'Asignadores basados en stack para asignación determinística'}</li>
                <li>{state.language === 'en' ? 'Fixed-size object pools for embedded systems' : 'Pools de objetos de tamaño fijo para sistemas embebidos'}</li>
                <li>{state.language === 'en' ? 'Memory-mapped register safe pointers' : 'Punteros seguros para registros mapeados en memoria'}</li>
                <li>{state.language === 'en' ? 'Circular buffers with optimized pointer management' : 'Buffers circulares con gestión optimizada de punteros'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Real-time Pointer Management' : 'Gestión de Punteros en Tiempo Real'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Deterministic memory allocators with fixed-time operations' : 'Asignadores de memoria determinísticos con operaciones de tiempo fijo'}</li>
                <li>{state.language === 'en' ? 'Interrupt-safe pointers using atomic operations' : 'Punteros seguros para interrupciones usando operaciones atómicas'}</li>
                <li>{state.language === 'en' ? 'Priority-based allocation for real-time tasks' : 'Asignación basada en prioridades para tareas tiempo real'}</li>
                <li>{state.language === 'en' ? 'Real-time performance profiling and measurement' : 'Perfilado y medición de rendimiento tiempo real'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Stack vs Heap Optimization' : 'Optimización Stack vs Heap'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Compile-time decision between stack and heap allocation' : 'Decisión en tiempo de compilación entre asignación stack y heap'}</li>
                <li>{state.language === 'en' ? 'Stack-based arrays with overflow protection' : 'Arrays basados en stack con protección contra desbordamiento'}</li>
                <li>{state.language === 'en' ? 'Hybrid containers that migrate from stack to heap' : 'Contenedores híbridos que migran de stack a heap'}</li>
                <li>{state.language === 'en' ? 'Stack usage monitoring and optimization' : 'Monitoreo y optimización del uso del stack'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Embedded-Specific Patterns' : 'Patrones Específicos para Embebidos'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Power-aware pointer management with callbacks' : 'Gestión de punteros consciente del consumo con callbacks'}</li>
                <li>{state.language === 'en' ? 'DMA-safe memory allocators with alignment requirements' : 'Asignadores de memoria DMA-safe con requisitos de alineación'}</li>
                <li>{state.language === 'en' ? 'Watchdog-protected pointers with timeout monitoring' : 'Punteros protegidos por watchdog con monitoreo de timeout'}</li>
                <li>{state.language === 'en' ? 'Resource tracking for embedded resource management' : 'Seguimiento de recursos para gestión de recursos embebidos'}</li>
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
          border-left: 4px solid #e74c3c;
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
          background: #fdf2e9;
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
          background: #e74c3c;
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
          border-left: 4px solid #e74c3c;
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

export default Lesson115_EmbeddedSystemsOptimization;