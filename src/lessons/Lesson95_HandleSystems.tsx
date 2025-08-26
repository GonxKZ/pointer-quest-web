/**
 * Lesson 95: Advanced Handle Systems
 * Expert-level handle management for high-performance systems
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

interface HandleSystemState {
  language: 'en' | 'es';
  scenario: 'basic_handles' | 'generational_handles' | 'handle_tables' | 'type_safe_handles' | 'performance_handles' | 'cross_platform';
  isAnimating: boolean;
  activeHandles: number;
  validationRate: number;
  memoryEfficiency: number;
  lookupTime: number;
}

const HandleSystemVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'basic_handles') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        activeHandles: Math.floor(12 + Math.sin(animationRef.current * 2) * 6),
        validationRate: 85 + Math.cos(animationRef.current) * 12,
        memoryEfficiency: 70 + Math.sin(animationRef.current * 1.5) * 20,
        lookupTime: Math.floor(50 + Math.cos(animationRef.current * 2) * 15)
      });
    }
  });

  const renderHandleNodes = () => {
    const elements = [];
    const nodeCount = scenario === 'handle_tables' ? 20 : 16;
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = scenario === 'generational_handles' ? 2.0 + (i % 4) * 0.3 : 2.2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = scenario === 'type_safe_handles' ? Math.sin(i * 0.4) * 0.4 : 0;
      
      const color = scenario === 'basic_handles' ? '#00ff88' :
                    scenario === 'generational_handles' ? '#0088ff' :
                    scenario === 'handle_tables' ? '#ff8800' :
                    scenario === 'type_safe_handles' ? '#ff0088' :
                    scenario === 'performance_handles' ? '#8800ff' : '#ffff88';
      
      elements.push(
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.2, 0.2, 0.6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
    
    return elements;
  };

  return (
    <group ref={groupRef}>
      {renderHandleNodes()}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
    </group>
  );
};

const Lesson95_HandleSystems: React.FC = () => {
  const [state, setState] = useState<HandleSystemState>({
    language: 'en',
    scenario: 'basic_handles',
    isAnimating: false,
    activeHandles: 0,
    validationRate: 0,
    memoryEfficiency: 0,
    lookupTime: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: HandleSystemState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    announcer.announce(
      state.language === 'en' 
        ? `Running handle system demonstration`
        : `Ejecutando demostración de sistemas de handles`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    basic_handles: `// Basic Handle System Implementation
#include <cstdint>
#include <vector>
#include <optional>
#include <cassert>

template<typename T>
class BasicHandleSystem {
public:
    using Handle = uint32_t;
    static constexpr Handle INVALID_HANDLE = 0;
    
private:
    struct Entry {
        T data;
        bool active = false;
    };
    
    std::vector<Entry> entries_;
    std::vector<Handle> free_list_;
    Handle next_handle_ = 1;
    
public:
    Handle create(T&& data) {
        Handle handle;
        
        if (!free_list_.empty()) {
            handle = free_list_.back();
            free_list_.pop_back();
            entries_[handle - 1] = {std::move(data), true};
        } else {
            handle = next_handle_++;
            entries_.emplace_back(Entry{std::move(data), true});
        }
        
        return handle;
    }
    
    bool destroy(Handle handle) {
        if (handle == INVALID_HANDLE || handle >= next_handle_) {
            return false;
        }
        
        auto& entry = entries_[handle - 1];
        if (!entry.active) return false;
        
        entry.active = false;
        free_list_.push_back(handle);
        return true;
    }
    
    T* get(Handle handle) {
        if (handle == INVALID_HANDLE || handle >= next_handle_) {
            return nullptr;
        }
        
        auto& entry = entries_[handle - 1];
        return entry.active ? &entry.data : nullptr;
    }
    
    const T* get(Handle handle) const {
        if (handle == INVALID_HANDLE || handle >= next_handle_) {
            return nullptr;
        }
        
        const auto& entry = entries_[handle - 1];
        return entry.active ? &entry.data : nullptr;
    }
    
    bool is_valid(Handle handle) const {
        if (handle == INVALID_HANDLE || handle >= next_handle_) {
            return false;
        }
        return entries_[handle - 1].active;
    }
    
    size_t size() const {
        return entries_.size() - free_list_.size();
    }
    
    size_t capacity() const {
        return entries_.size();
    }
};

// Usage example
struct GameEntity {
    float x, y, z;
    int health;
    std::string name;
};

void demonstrate_basic_handles() {
    BasicHandleSystem<GameEntity> entities;
    
    // Create entities
    auto player = entities.create(GameEntity{0, 0, 0, 100, "Player"});
    auto enemy1 = entities.create(GameEntity{10, 0, 5, 50, "Goblin"});
    auto enemy2 = entities.create(GameEntity{-5, 0, 10, 75, "Orc"});
    
    std::cout << "Created " << entities.size() << " entities\\n";
    
    // Access entities
    if (auto* player_ptr = entities.get(player)) {
        player_ptr->x = 5.0f;
        player_ptr->health -= 10;
        std::cout << "Player at (" << player_ptr->x << ", " 
                  << player_ptr->y << ") with " << player_ptr->health << " health\\n";
    }
    
    // Destroy entity
    entities.destroy(enemy1);
    std::cout << "After destruction: " << entities.size() << " entities\\n";
    
    // Try to access destroyed entity
    if (entities.get(enemy1) == nullptr) {
        std::cout << "Enemy1 handle is now invalid\\n";
    }
}`,

    generational_handles: `// Generational Handles for Dangling Prevention
#include <cstdint>
#include <vector>
#include <array>

template<typename T>
class GenerationalHandleSystem {
public:
    struct Handle {
        uint32_t index : 24;
        uint32_t generation : 8;
        
        Handle() : index(0), generation(0) {}
        Handle(uint32_t idx, uint32_t gen) : index(idx), generation(gen) {}
        
        bool operator==(const Handle& other) const {
            return index == other.index && generation == other.generation;
        }
        
        bool operator!=(const Handle& other) const {
            return !(*this == other);
        }
    };
    
    static constexpr Handle INVALID_HANDLE{0, 0};
    
private:
    struct Entry {
        T data;
        uint8_t generation = 1;
        bool active = false;
    };
    
    std::vector<Entry> entries_;
    std::vector<uint32_t> free_indices_;
    
public:
    Handle create(T&& data) {
        uint32_t index;
        
        if (!free_indices_.empty()) {
            index = free_indices_.back();
            free_indices_.pop_back();
            
            auto& entry = entries_[index];
            entry.data = std::move(data);
            entry.active = true;
            // Generation already incremented when destroyed
        } else {
            index = static_cast<uint32_t>(entries_.size());
            entries_.emplace_back(Entry{std::move(data), 1, true});
        }
        
        return Handle{index, entries_[index].generation};
    }
    
    bool destroy(Handle handle) {
        if (handle.index >= entries_.size()) return false;
        
        auto& entry = entries_[handle.index];
        if (!entry.active || entry.generation != handle.generation) {
            return false;
        }
        
        entry.active = false;
        entry.generation = (entry.generation + 1) % 256; // Wrap around
        free_indices_.push_back(handle.index);
        return true;
    }
    
    T* get(Handle handle) {
        if (handle.index >= entries_.size()) return nullptr;
        
        auto& entry = entries_[handle.index];
        if (!entry.active || entry.generation != handle.generation) {
            return nullptr;
        }
        
        return &entry.data;
    }
    
    const T* get(Handle handle) const {
        if (handle.index >= entries_.size()) return nullptr;
        
        const auto& entry = entries_[handle.index];
        if (!entry.active || entry.generation != handle.generation) {
            return nullptr;
        }
        
        return &entry.data;
    }
    
    bool is_valid(Handle handle) const {
        if (handle.index >= entries_.size()) return false;
        
        const auto& entry = entries_[handle.index];
        return entry.active && entry.generation == handle.generation;
    }
    
    size_t size() const {
        return entries_.size() - free_indices_.size();
    }
};

// Specialized hash function for generational handles
template<typename T>
struct std::hash<typename GenerationalHandleSystem<T>::Handle> {
    size_t operator()(const typename GenerationalHandleSystem<T>::Handle& handle) const {
        return (static_cast<size_t>(handle.index) << 8) | handle.generation;
    }
};

void demonstrate_generational_handles() {
    GenerationalHandleSystem<std::string> strings;
    
    // Create some strings
    auto handle1 = strings.create(std::string("First string"));
    auto handle2 = strings.create(std::string("Second string"));
    
    std::cout << "Created handles with generations: " 
              << static_cast<int>(handle1.generation) << ", " 
              << static_cast<int>(handle2.generation) << "\\n";
    
    // Store handle for later use
    auto old_handle = handle1;
    
    // Access string
    if (auto* str = strings.get(handle1)) {
        std::cout << "Accessed: " << *str << "\\n";
    }
    
    // Destroy and recreate
    strings.destroy(handle1);
    auto new_handle = strings.create(std::string("New string"));
    
    std::cout << "New handle generation: " 
              << static_cast<int>(new_handle.generation) << "\\n";
    
    // Try to access with old handle (should fail)
    if (strings.get(old_handle) == nullptr) {
        std::cout << "Old handle correctly invalidated by generation mismatch\\n";
    }
    
    // Access with new handle (should work)
    if (auto* str = strings.get(new_handle)) {
        std::cout << "New handle works: " << *str << "\\n";
    }
}`,

    handle_tables: `// Handle Table System with Indirection
#include <memory>
#include <unordered_map>
#include <functional>

template<typename T>
class HandleTableSystem {
public:
    using Handle = uint64_t;
    using Deleter = std::function<void(T*)>;
    
private:
    struct Entry {
        std::unique_ptr<T, Deleter> data;
        bool active = true;
        
        Entry(std::unique_ptr<T, Deleter> ptr) : data(std::move(ptr)) {}
    };
    
    std::unordered_map<Handle, Entry> table_;
    Handle next_handle_ = 1;
    
    // Optional: Handle validation with magic numbers
    static constexpr uint64_t MAGIC_MASK = 0xFF00000000000000ULL;
    static constexpr uint64_t MAGIC_VALUE = 0xAB00000000000000ULL;
    
    Handle encode_handle(Handle raw_handle) const {
        return (raw_handle & ~MAGIC_MASK) | MAGIC_VALUE;
    }
    
    Handle decode_handle(Handle encoded_handle) const {
        if ((encoded_handle & MAGIC_MASK) != MAGIC_VALUE) {
            return 0; // Invalid handle
        }
        return encoded_handle & ~MAGIC_MASK;
    }
    
public:
    template<typename... Args>
    Handle create(Args&&... args) {
        return create_with_deleter(
            std::make_unique<T>(std::forward<Args>(args)...),
            [](T* ptr) { delete ptr; }
        );
    }
    
    Handle create_with_deleter(std::unique_ptr<T, Deleter> data, Deleter deleter) {
        Handle raw_handle = next_handle_++;
        Handle encoded_handle = encode_handle(raw_handle);
        
        data.get_deleter() = std::move(deleter);
        table_.emplace(raw_handle, Entry{std::move(data)});
        
        return encoded_handle;
    }
    
    bool destroy(Handle encoded_handle) {
        Handle raw_handle = decode_handle(encoded_handle);
        if (raw_handle == 0) return false;
        
        auto it = table_.find(raw_handle);
        if (it == table_.end() || !it->second.active) {
            return false;
        }
        
        it->second.active = false;
        // Keep entry for debugging, or remove immediately
        table_.erase(it);
        return true;
    }
    
    T* get(Handle encoded_handle) {
        Handle raw_handle = decode_handle(encoded_handle);
        if (raw_handle == 0) return nullptr;
        
        auto it = table_.find(raw_handle);
        if (it == table_.end() || !it->second.active) {
            return nullptr;
        }
        
        return it->second.data.get();
    }
    
    const T* get(Handle encoded_handle) const {
        Handle raw_handle = decode_handle(encoded_handle);
        if (raw_handle == 0) return nullptr;
        
        auto it = table_.find(raw_handle);
        if (it == table_.end() || !it->second.active) {
            return nullptr;
        }
        
        return it->second.data.get();
    }
    
    bool is_valid(Handle encoded_handle) const {
        Handle raw_handle = decode_handle(encoded_handle);
        if (raw_handle == 0) return false;
        
        auto it = table_.find(raw_handle);
        return it != table_.end() && it->second.active;
    }
    
    size_t size() const {
        return table_.size();
    }
    
    // Advanced: Get all active handles
    std::vector<Handle> get_all_handles() const {
        std::vector<Handle> handles;
        handles.reserve(table_.size());
        
        for (const auto& [raw_handle, entry] : table_) {
            if (entry.active) {
                handles.push_back(encode_handle(raw_handle));
            }
        }
        
        return handles;
    }
    
    // Debug: Validate handle table integrity
    bool validate_table() const {
        for (const auto& [raw_handle, entry] : table_) {
            if (!entry.data) {
                std::cerr << "Null data pointer in handle table entry\\n";
                return false;
            }
        }
        return true;
    }
};

// Example: Graphics resource management
struct TextureResource {
    uint32_t width, height;
    uint32_t format;
    std::vector<uint8_t> data;
    
    TextureResource(uint32_t w, uint32_t h, uint32_t fmt) 
        : width(w), height(h), format(fmt), data(w * h * 4) {}
        
    ~TextureResource() {
        std::cout << "Destroying texture " << width << "x" << height << "\\n";
    }
};

void demonstrate_handle_tables() {
    HandleTableSystem<TextureResource> textures;
    
    // Create textures with automatic cleanup
    auto tex1 = textures.create(256, 256, 0x8058); // RGBA8
    auto tex2 = textures.create(512, 512, 0x8058);
    
    // Create texture with custom deleter
    auto tex3 = textures.create_with_deleter(
        std::make_unique<TextureResource>(1024, 1024, 0x8058),
        [](TextureResource* ptr) {
            std::cout << "Custom deleter for texture\\n";
            delete ptr;
        }
    );
    
    std::cout << "Created " << textures.size() << " textures\\n";
    
    // Access texture data
    if (auto* texture = textures.get(tex1)) {
        std::cout << "Texture1: " << texture->width << "x" << texture->height 
                  << " (" << texture->data.size() << " bytes)\\n";
    }
    
    // Get all active handles
    auto all_handles = textures.get_all_handles();
    std::cout << "Active handles: " << all_handles.size() << "\\n";
    
    // Validate table integrity
    if (textures.validate_table()) {
        std::cout << "Handle table integrity check passed\\n";
    }
    
    // Cleanup
    textures.destroy(tex2);
    std::cout << "After cleanup: " << textures.size() << " textures\\n";
}`,

    type_safe_handles: `// Type-Safe Handle System with Templates
#include <type_traits>
#include <concepts>

// Handle type concept
template<typename H>
concept HandleType = requires {
    typename H::ValueType;
    { H::INVALID } -> std::convertible_to<H>;
};

// Type-safe handle wrapper
template<typename T, typename Tag = void>
class TypedHandle {
public:
    using ValueType = T;
    using TagType = Tag;
    
    static constexpr TypedHandle INVALID{0};
    
private:
    uint32_t id_ = 0;
    
public:
    explicit TypedHandle(uint32_t id = 0) : id_(id) {}
    
    uint32_t id() const { return id_; }
    
    bool operator==(const TypedHandle& other) const { return id_ == other.id_; }
    bool operator!=(const TypedHandle& other) const { return id_ != other.id_; }
    bool operator<(const TypedHandle& other) const { return id_ < other.id_; }
    
    explicit operator bool() const { return id_ != 0; }
};

// Hash specialization for typed handles
template<typename T, typename Tag>
struct std::hash<TypedHandle<T, Tag>> {
    size_t operator()(const TypedHandle<T, Tag>& handle) const {
        return std::hash<uint32_t>{}(handle.id());
    }
};

// Type-safe handle system
template<HandleType H>
class TypeSafeHandleSystem {
public:
    using Handle = H;
    using ValueType = typename H::ValueType;
    
private:
    struct Entry {
        ValueType data;
        bool active = false;
    };
    
    std::unordered_map<Handle, Entry> entries_;
    uint32_t next_id_ = 1;
    
public:
    template<typename... Args>
    Handle create(Args&&... args) {
        Handle handle{next_id_++};
        entries_.emplace(handle, Entry{ValueType{std::forward<Args>(args)...}, true});
        return handle;
    }
    
    bool destroy(Handle handle) {
        auto it = entries_.find(handle);
        if (it == entries_.end() || !it->second.active) {
            return false;
        }
        
        it->second.active = false;
        entries_.erase(it);
        return true;
    }
    
    ValueType* get(Handle handle) {
        auto it = entries_.find(handle);
        if (it == entries_.end() || !it->second.active) {
            return nullptr;
        }
        return &it->second.data;
    }
    
    const ValueType* get(Handle handle) const {
        auto it = entries_.find(handle);
        if (it == entries_.end() || !it->second.active) {
            return nullptr;
        }
        return &it->second.data;
    }
    
    bool is_valid(Handle handle) const {
        auto it = entries_.find(handle);
        return it != entries_.end() && it->second.active;
    }
    
    size_t size() const { return entries_.size(); }
    
    // Iterator support for range-based loops
    auto begin() { return entries_.begin(); }
    auto end() { return entries_.end(); }
    auto begin() const { return entries_.begin(); }
    auto end() const { return entries_.end(); }
};

// Define specific handle types for different resources
struct EntityTag {};
struct TextureTag {};
struct SoundTag {};

using EntityHandle = TypedHandle<struct Entity, EntityTag>;
using TextureHandle = TypedHandle<struct Texture, TextureTag>;
using SoundHandle = TypedHandle<struct Sound, SoundTag>;

struct Entity {
    float x, y, z;
    int health;
    std::string name;
    
    Entity(float px, float py, float pz, int h, std::string n)
        : x(px), y(py), z(pz), health(h), name(std::move(n)) {}
};

struct Texture {
    uint32_t width, height;
    std::string filename;
    
    Texture(uint32_t w, uint32_t h, std::string file)
        : width(w), height(h), filename(std::move(file)) {}
};

struct Sound {
    float duration;
    uint32_t sample_rate;
    std::string filename;
    
    Sound(float dur, uint32_t rate, std::string file)
        : duration(dur), sample_rate(rate), filename(std::move(file)) {}
};

// Game resource manager using type-safe handles
class GameResourceManager {
private:
    TypeSafeHandleSystem<EntityHandle> entities_;
    TypeSafeHandleSystem<TextureHandle> textures_;
    TypeSafeHandleSystem<SoundHandle> sounds_;
    
public:
    // Entity management
    EntityHandle create_entity(float x, float y, float z, int health, const std::string& name) {
        return entities_.create(x, y, z, health, name);
    }
    
    Entity* get_entity(EntityHandle handle) {
        return entities_.get(handle);
    }
    
    bool destroy_entity(EntityHandle handle) {
        return entities_.destroy(handle);
    }
    
    // Texture management
    TextureHandle load_texture(uint32_t width, uint32_t height, const std::string& filename) {
        return textures_.create(width, height, filename);
    }
    
    Texture* get_texture(TextureHandle handle) {
        return textures_.get(handle);
    }
    
    // Sound management
    SoundHandle load_sound(float duration, uint32_t sample_rate, const std::string& filename) {
        return sounds_.create(duration, sample_rate, filename);
    }
    
    Sound* get_sound(SoundHandle handle) {
        return sounds_.get(handle);
    }
    
    // Statistics
    void print_stats() const {
        std::cout << "Resource Manager Stats:\\n";
        std::cout << "  Entities: " << entities_.size() << "\\n";
        std::cout << "  Textures: " << textures_.size() << "\\n";
        std::cout << "  Sounds: " << sounds_.size() << "\\n";
    }
};

void demonstrate_type_safe_handles() {
    GameResourceManager manager;
    
    // Create resources
    auto player = manager.create_entity(0, 0, 0, 100, "Player");
    auto enemy = manager.create_entity(10, 0, 5, 50, "Goblin");
    
    auto player_texture = manager.load_texture(64, 64, "player.png");
    auto enemy_texture = manager.load_texture(32, 32, "goblin.png");
    
    auto jump_sound = manager.load_sound(0.5f, 44100, "jump.wav");
    
    // Type safety: These won't compile due to type mismatch
    // auto* entity_data = manager.get_texture(player); // ERROR!
    // auto* texture_data = manager.get_entity(player_texture); // ERROR!
    
    // Correct usage
    if (auto* entity = manager.get_entity(player)) {
        entity->x = 5.0f;
        entity->health -= 10;
        std::cout << "Player moved to (" << entity->x << ", " << entity->y 
                  << ") with " << entity->health << " health\\n";
    }
    
    if (auto* texture = manager.get_texture(player_texture)) {
        std::cout << "Player texture: " << texture->filename 
                  << " (" << texture->width << "x" << texture->height << ")\\n";
    }
    
    manager.print_stats();
    
    // Cleanup
    manager.destroy_entity(enemy);
    manager.print_stats();
}`,

    performance_handles: `// Performance-Optimized Handle System
#include <memory_resource>
#include <atomic>

template<typename T>
class HighPerformanceHandleSystem {
public:
    using Handle = uint32_t;
    static constexpr Handle INVALID_HANDLE = 0;
    
private:
    // Memory pool for fast allocation
    std::pmr::unsynchronized_pool_resource pool_;
    std::pmr::polymorphic_allocator<T> allocator_;
    
    // Packed entry structure for cache efficiency
    struct alignas(64) Entry {  // Align to cache line
        T data;
        std::atomic<uint32_t> ref_count{0};
        uint32_t generation = 1;
        bool active = false;
        char padding[64 - sizeof(T) - sizeof(std::atomic<uint32_t>) - sizeof(uint32_t) - sizeof(bool)];
    };
    
    // Pre-allocated entry array
    std::unique_ptr<Entry[]> entries_;
    size_t capacity_;
    std::atomic<size_t> size_{0};
    
    // Lock-free free list
    struct FreeNode {
        std::atomic<uint32_t> next;
        FreeNode(uint32_t n = INVALID_HANDLE) : next(n) {}
    };
    
    std::unique_ptr<FreeNode[]> free_list_;
    std::atomic<uint32_t> free_head_{INVALID_HANDLE};
    
    // Handle encoding/decoding for additional safety
    Handle encode_handle(uint32_t index, uint32_t generation) const {
        return (generation << 24) | (index & 0x00FFFFFF);
    }
    
    std::pair<uint32_t, uint32_t> decode_handle(Handle handle) const {
        return {handle & 0x00FFFFFF, handle >> 24};
    }
    
public:
    explicit HighPerformanceHandleSystem(size_t initial_capacity = 1024)
        : allocator_(&pool_), capacity_(initial_capacity) {
        
        entries_ = std::make_unique<Entry[]>(capacity_);
        free_list_ = std::make_unique<FreeNode[]>(capacity_);
        
        // Initialize free list
        for (uint32_t i = 0; i < capacity_ - 1; ++i) {
            free_list_[i].next.store(i + 1, std::memory_order_relaxed);
        }
        free_list_[capacity_ - 1].next.store(INVALID_HANDLE, std::memory_order_relaxed);
        free_head_.store(0, std::memory_order_release);
    }
    
    template<typename... Args>
    Handle create(Args&&... args) {
        // Lock-free allocation from free list
        uint32_t index = free_head_.load(std::memory_order_acquire);
        
        while (index != INVALID_HANDLE) {
            uint32_t next = free_list_[index].next.load(std::memory_order_relaxed);
            
            if (free_head_.compare_exchange_weak(index, next, 
                                               std::memory_order_release, 
                                               std::memory_order_acquire)) {
                break;
            }
        }
        
        if (index == INVALID_HANDLE) {
            // Pool exhausted - could implement growth here
            return INVALID_HANDLE;
        }
        
        auto& entry = entries_[index];
        
        // Construct object in place using PMR allocator
        new (&entry.data) T(std::forward<Args>(args)...);
        entry.ref_count.store(1, std::memory_order_relaxed);
        entry.active = true;
        
        size_.fetch_add(1, std::memory_order_relaxed);
        
        return encode_handle(index, entry.generation);
    }
    
    bool destroy(Handle handle) {
        auto [index, generation] = decode_handle(handle);
        
        if (index >= capacity_) return false;
        
        auto& entry = entries_[index];
        if (!entry.active || entry.generation != generation) {
            return false;
        }
        
        // Decrease reference count
        uint32_t old_ref = entry.ref_count.fetch_sub(1, std::memory_order_acq_rel);
        if (old_ref != 1) {
            // Still has references
            return false;
        }
        
        // Destroy object
        entry.data.~T();
        entry.active = false;
        entry.generation = (entry.generation + 1) % 256;
        
        // Return to free list
        uint32_t head = free_head_.load(std::memory_order_acquire);
        do {
            free_list_[index].next.store(head, std::memory_order_relaxed);
        } while (!free_head_.compare_exchange_weak(head, index,
                                                 std::memory_order_release,
                                                 std::memory_order_acquire));
        
        size_.fetch_sub(1, std::memory_order_relaxed);
        return true;
    }
    
    // Reference-counted access
    class HandleRef {
    private:
        Entry* entry_;
        bool valid_;
        
    public:
        HandleRef(Entry* entry, bool valid) : entry_(entry), valid_(valid) {
            if (valid_ && entry_) {
                entry_->ref_count.fetch_add(1, std::memory_order_relaxed);
            }
        }
        
        ~HandleRef() {
            if (valid_ && entry_) {
                entry_->ref_count.fetch_sub(1, std::memory_order_relaxed);
            }
        }
        
        HandleRef(const HandleRef&) = delete;
        HandleRef& operator=(const HandleRef&) = delete;
        
        HandleRef(HandleRef&& other) noexcept 
            : entry_(other.entry_), valid_(other.valid_) {
            other.entry_ = nullptr;
            other.valid_ = false;
        }
        
        T* get() const { return valid_ ? &entry_->data : nullptr; }
        T* operator->() const { return get(); }
        T& operator*() const { return entry_->data; }
        explicit operator bool() const { return valid_; }
    };
    
    HandleRef get(Handle handle) {
        auto [index, generation] = decode_handle(handle);
        
        if (index >= capacity_) {
            return HandleRef{nullptr, false};
        }
        
        auto& entry = entries_[index];
        bool valid = entry.active && entry.generation == generation;
        
        return HandleRef{&entry, valid};
    }
    
    bool is_valid(Handle handle) const {
        auto [index, generation] = decode_handle(handle);
        
        if (index >= capacity_) return false;
        
        const auto& entry = entries_[index];
        return entry.active && entry.generation == generation;
    }
    
    size_t size() const {
        return size_.load(std::memory_order_relaxed);
    }
    
    size_t capacity() const { return capacity_; }
    
    // Performance monitoring
    struct Stats {
        size_t active_entries;
        size_t free_entries;
        size_t memory_usage;
        double fragmentation;
    };
    
    Stats get_stats() const {
        Stats stats;
        stats.active_entries = size();
        stats.free_entries = capacity_ - stats.active_entries;
        stats.memory_usage = capacity_ * sizeof(Entry);
        stats.fragmentation = static_cast<double>(stats.free_entries) / capacity_;
        return stats;
    }
};

// Example: High-performance particle system
struct Particle {
    float x, y, z;
    float vx, vy, vz;
    float life;
    uint32_t color;
    
    Particle(float px, float py, float pz)
        : x(px), y(py), z(pz), vx(0), vy(0), vz(0), life(1.0f), color(0xFFFFFFFF) {}
        
    void update(float dt) {
        x += vx * dt;
        y += vy * dt;
        z += vz * dt;
        life -= dt;
    }
    
    bool is_alive() const { return life > 0.0f; }
};

void demonstrate_performance_handles() {
    HighPerformanceHandleSystem<Particle> particles(10000);
    
    // Create many particles
    std::vector<HighPerformanceHandleSystem<Particle>::Handle> handles;
    handles.reserve(5000);
    
    auto start = std::chrono::high_resolution_clock::now();
    
    for (int i = 0; i < 5000; ++i) {
        float x = static_cast<float>(rand()) / RAND_MAX * 100.0f - 50.0f;
        float y = static_cast<float>(rand()) / RAND_MAX * 100.0f - 50.0f;
        float z = static_cast<float>(rand()) / RAND_MAX * 100.0f - 50.0f;
        
        auto handle = particles.create(x, y, z);
        if (handle != HighPerformanceHandleSystem<Particle>::INVALID_HANDLE) {
            handles.push_back(handle);
        }
    }
    
    auto creation_time = std::chrono::high_resolution_clock::now() - start;
    
    std::cout << "Created " << handles.size() << " particles in " 
              << std::chrono::duration_cast<std::chrono::microseconds>(creation_time).count() 
              << " μs\\n";
    
    // Update particles
    start = std::chrono::high_resolution_clock::now();
    
    for (auto handle : handles) {
        if (auto particle_ref = particles.get(handle)) {
            particle_ref->update(0.016f); // 60 FPS
        }
    }
    
    auto update_time = std::chrono::high_resolution_clock::now() - start;
    
    std::cout << "Updated " << handles.size() << " particles in " 
              << std::chrono::duration_cast<std::chrono::microseconds>(update_time).count() 
              << " μs\\n";
    
    // Print performance stats
    auto stats = particles.get_stats();
    std::cout << "Performance Stats:\\n";
    std::cout << "  Active entries: " << stats.active_entries << "\\n";
    std::cout << "  Free entries: " << stats.free_entries << "\\n";
    std::cout << "  Memory usage: " << stats.memory_usage / 1024 << " KB\\n";
    std::cout << "  Fragmentation: " << (stats.fragmentation * 100) << "%\\n";
    
    // Cleanup some particles
    for (size_t i = 0; i < handles.size() / 2; ++i) {
        particles.destroy(handles[i]);
    }
    
    std::cout << "After cleanup: " << particles.size() << " particles\\n";
}`,

    cross_platform: `// Cross-Platform Handle System
#ifdef _WIN32
    #include <windows.h>
    #include <handleapi.h>
#elif defined(__linux__) || defined(__APPLE__)
    #include <unistd.h>
    #include <fcntl.h>
    #include <sys/mman.h>
#endif

#include <variant>
#include <string>

// Platform-specific handle wrapper
class PlatformHandle {
public:
    #ifdef _WIN32
        using NativeHandle = HANDLE;
        static constexpr NativeHandle INVALID_NATIVE_HANDLE = INVALID_HANDLE_VALUE;
    #else
        using NativeHandle = int;
        static constexpr NativeHandle INVALID_NATIVE_HANDLE = -1;
    #endif
    
    enum class HandleType {
        File,
        Memory,
        Process,
        Thread,
        Mutex,
        Event
    };
    
private:
    NativeHandle native_handle_ = INVALID_NATIVE_HANDLE;
    HandleType type_;
    std::string name_;
    
public:
    PlatformHandle(HandleType type, const std::string& name = "")
        : type_(type), name_(name) {}
    
    ~PlatformHandle() {
        close();
    }
    
    // Move-only semantics
    PlatformHandle(const PlatformHandle&) = delete;
    PlatformHandle& operator=(const PlatformHandle&) = delete;
    
    PlatformHandle(PlatformHandle&& other) noexcept
        : native_handle_(other.native_handle_), type_(other.type_), name_(std::move(other.name_)) {
        other.native_handle_ = INVALID_NATIVE_HANDLE;
    }
    
    PlatformHandle& operator=(PlatformHandle&& other) noexcept {
        if (this != &other) {
            close();
            native_handle_ = other.native_handle_;
            type_ = other.type_;
            name_ = std::move(other.name_);
            other.native_handle_ = INVALID_NATIVE_HANDLE;
        }
        return *this;
    }
    
    // File operations
    bool open_file(const std::string& filename, bool read_only = true) {
        if (type_ != HandleType::File) return false;
        
        #ifdef _WIN32
            DWORD access = read_only ? GENERIC_READ : (GENERIC_READ | GENERIC_WRITE);
            DWORD creation = read_only ? OPEN_EXISTING : OPEN_ALWAYS;
            
            native_handle_ = CreateFileA(
                filename.c_str(),
                access,
                FILE_SHARE_READ,
                nullptr,
                creation,
                FILE_ATTRIBUTE_NORMAL,
                nullptr
            );
            
            return native_handle_ != INVALID_HANDLE_VALUE;
        #else
            int flags = read_only ? O_RDONLY : O_RDWR | O_CREAT;
            native_handle_ = open(filename.c_str(), flags, 0644);
            return native_handle_ != -1;
        #endif
    }
    
    // Memory mapping
    void* map_memory(size_t size, bool read_only = true) {
        if (type_ != HandleType::Memory || !is_valid()) return nullptr;
        
        #ifdef _WIN32
            DWORD protect = read_only ? PAGE_READONLY : PAGE_READWRITE;
            HANDLE mapping = CreateFileMapping(
                native_handle_,
                nullptr,
                protect,
                0,
                static_cast<DWORD>(size),
                nullptr
            );
            
            if (mapping == nullptr) return nullptr;
            
            DWORD access = read_only ? FILE_MAP_READ : FILE_MAP_WRITE;
            void* mapped = MapViewOfFile(mapping, access, 0, 0, size);
            
            CloseHandle(mapping);
            return mapped;
        #else
            int prot = read_only ? PROT_READ : (PROT_READ | PROT_WRITE);
            return mmap(nullptr, size, prot, MAP_SHARED, native_handle_, 0);
        #endif
    }
    
    static bool unmap_memory(void* ptr, size_t size) {
        #ifdef _WIN32
            return UnmapViewOfFile(ptr) != 0;
        #else
            return munmap(ptr, size) == 0;
        #endif
    }
    
    // Process operations
    bool create_process(const std::string& command) {
        if (type_ != HandleType::Process) return false;
        
        #ifdef _WIN32
            PROCESS_INFORMATION pi = {};
            STARTUPINFOA si = {};
            si.cb = sizeof(si);
            
            std::string cmd_copy = command; // CreateProcess may modify the string
            
            BOOL result = CreateProcessA(
                nullptr,
                cmd_copy.data(),
                nullptr,
                nullptr,
                FALSE,
                0,
                nullptr,
                nullptr,
                &si,
                &pi
            );
            
            if (result) {
                native_handle_ = pi.hProcess;
                CloseHandle(pi.hThread);
                return true;
            }
            return false;
        #else
            // On Unix, we'd typically use fork/exec
            // This is a simplified example
            pid_t pid = fork();
            if (pid == 0) {
                // Child process
                execl("/bin/sh", "sh", "-c", command.c_str(), nullptr);
                _exit(1);
            } else if (pid > 0) {
                // Parent process
                native_handle_ = static_cast<int>(pid);
                return true;
            }
            return false;
        #endif
    }
    
    // Wait for process completion
    bool wait(uint32_t timeout_ms = UINT32_MAX) {
        if (type_ != HandleType::Process || !is_valid()) return false;
        
        #ifdef _WIN32
            DWORD result = WaitForSingleObject(native_handle_, timeout_ms);
            return result == WAIT_OBJECT_0;
        #else
            // On Unix, we'd use waitpid with the stored PID
            int status;
            pid_t result = waitpid(static_cast<pid_t>(native_handle_), &status, 0);
            return result != -1;
        #endif
    }
    
    // Generic handle operations
    bool is_valid() const {
        return native_handle_ != INVALID_NATIVE_HANDLE;
    }
    
    NativeHandle get_native_handle() const {
        return native_handle_;
    }
    
    HandleType get_type() const { return type_; }
    const std::string& get_name() const { return name_; }
    
    void close() {
        if (is_valid()) {
            #ifdef _WIN32
                CloseHandle(native_handle_);
            #else
                if (type_ != HandleType::Process) {
                    ::close(native_handle_);
                }
                // For processes, we don't close the PID
            #endif
            native_handle_ = INVALID_NATIVE_HANDLE;
        }
    }
};

// Cross-platform handle manager
class CrossPlatformHandleManager {
private:
    std::unordered_map<uint32_t, std::unique_ptr<PlatformHandle>> handles_;
    uint32_t next_id_ = 1;
    
public:
    uint32_t create_file_handle(const std::string& filename, bool read_only = true) {
        auto handle = std::make_unique<PlatformHandle>(PlatformHandle::HandleType::File, filename);
        
        if (!handle->open_file(filename, read_only)) {
            return 0; // Invalid handle ID
        }
        
        uint32_t id = next_id_++;
        handles_[id] = std::move(handle);
        return id;
    }
    
    uint32_t create_process_handle(const std::string& command) {
        auto handle = std::make_unique<PlatformHandle>(PlatformHandle::HandleType::Process, command);
        
        if (!handle->create_process(command)) {
            return 0; // Invalid handle ID
        }
        
        uint32_t id = next_id_++;
        handles_[id] = std::move(handle);
        return id;
    }
    
    PlatformHandle* get_handle(uint32_t id) {
        auto it = handles_.find(id);
        return it != handles_.end() ? it->second.get() : nullptr;
    }
    
    bool close_handle(uint32_t id) {
        auto it = handles_.find(id);
        if (it != handles_.end()) {
            handles_.erase(it);
            return true;
        }
        return false;
    }
    
    size_t active_handles() const {
        return handles_.size();
    }
    
    // Platform information
    static std::string get_platform_info() {
        #ifdef _WIN32
            return "Windows";
        #elif defined(__linux__)
            return "Linux";
        #elif defined(__APPLE__)
            return "macOS";
        #else
            return "Unknown";
        #endif
    }
};

void demonstrate_cross_platform_handles() {
    CrossPlatformHandleManager manager;
    
    std::cout << "Running on: " << CrossPlatformHandleManager::get_platform_info() << "\\n";
    
    // Create a file handle
    #ifdef _WIN32
        auto file_id = manager.create_file_handle("C:\\\\temp\\\\test.txt");
    #else
        auto file_id = manager.create_file_handle("/tmp/test.txt");
    #endif
    
    if (file_id != 0) {
        std::cout << "Created file handle ID: " << file_id << "\\n";
        
        if (auto* handle = manager.get_handle(file_id)) {
            std::cout << "File handle is valid: " << handle->is_valid() << "\\n";
            std::cout << "Handle type: " << static_cast<int>(handle->get_type()) << "\\n";
            
            // Try memory mapping
            void* mapped = handle->map_memory(4096, true);
            if (mapped) {
                std::cout << "Memory mapped at: " << mapped << "\\n";
                PlatformHandle::unmap_memory(mapped, 4096);
            }
        }
    } else {
        std::cout << "Failed to create file handle\\n";
    }
    
    // Create a process handle
    #ifdef _WIN32
        auto proc_id = manager.create_process_handle("notepad.exe");
    #else
        auto proc_id = manager.create_process_handle("echo 'Hello from child process'");
    #endif
    
    if (proc_id != 0) {
        std::cout << "Created process handle ID: " << proc_id << "\\n";
        
        if (auto* handle = manager.get_handle(proc_id)) {
            std::cout << "Process handle is valid: " << handle->is_valid() << "\\n";
            
            // Wait for process with timeout
            bool completed = handle->wait(5000); // 5 second timeout
            std::cout << "Process completed: " << completed << "\\n";
        }
    }
    
    std::cout << "Active handles: " << manager.active_handles() << "\\n";
    
    // Cleanup
    if (file_id != 0) manager.close_handle(file_id);
    if (proc_id != 0) manager.close_handle(proc_id);
    
    std::cout << "After cleanup: " << manager.active_handles() << " handles\\n";
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 95: Advanced Handle Systems" : "Lección 95: Sistemas de Handle Avanzados"}
      lessonId="lesson-95"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'Expert-Level Handle Management for Production Systems' : 'Gestión de Handles de Nivel Experto para Sistemas de Producción'}
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
                  'Design robust handle-based architecture patterns for resource management',
                  'Implement generational handles to prevent use-after-free vulnerabilities',
                  'Create high-performance handle tables with indirection layers',
                  'Build type-safe handle systems using modern C++ template techniques',
                  'Optimize handle validation and lookup performance for critical systems',
                  'Apply cross-platform handle management in real-world applications'
                ]
              : [
                  'Diseñar patrones de arquitectura robustos basados en handles para gestión de recursos',
                  'Implementar handles generacionales para prevenir vulnerabilidades use-after-free',
                  'Crear tablas de handles de alto rendimiento con capas de indirección',
                  'Construir sistemas de handles type-safe usando técnicas modernas de templates C++',
                  'Optimizar rendimiento de validación y búsqueda de handles para sistemas críticos',
                  'Aplicar gestión de handles multiplataforma en aplicaciones del mundo real'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive Handle Systems Demonstration' : 'Demostración Interactiva de Sistemas de Handles'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <HandleSystemVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('basic_handles')}
            variant={state.scenario === 'basic_handles' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Basic' : 'Básico'}
          </Button>
          <Button 
            onClick={() => runScenario('generational_handles')}
            variant={state.scenario === 'generational_handles' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Generational' : 'Generacional'}
          </Button>
          <Button 
            onClick={() => runScenario('handle_tables')}
            variant={state.scenario === 'handle_tables' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Tables' : 'Tablas'}
          </Button>
          <Button 
            onClick={() => runScenario('type_safe_handles')}
            variant={state.scenario === 'type_safe_handles' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Type-Safe' : 'Type-Safe'}
          </Button>
          <Button 
            onClick={() => runScenario('performance_handles')}
            variant={state.scenario === 'performance_handles' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Performance' : 'Rendimiento'}
          </Button>
          <Button 
            onClick={() => runScenario('cross_platform')}
            variant={state.scenario === 'cross_platform' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
          >
            {state.language === 'en' ? 'Cross-Platform' : 'Multiplataforma'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Active Handles' : 'Handles Activos', 
              value: state.activeHandles,
              color: '#00ff00'
            },
            { 
              label: state.language === 'en' ? 'Validation Rate %' : 'Tasa Validación %', 
              value: Math.round(state.validationRate),
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Memory Efficiency %' : 'Eficiencia Memoria %', 
              value: Math.round(state.memoryEfficiency),
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Lookup Time ns' : 'Tiempo Búsqueda ns', 
              value: state.lookupTime,
              color: '#ff0080'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'basic_handles' && (state.language === 'en' ? 'Basic Handle System Implementation' : 'Implementación Básica de Sistema de Handles')}
          {state.scenario === 'generational_handles' && (state.language === 'en' ? 'Generational Handles for Safety' : 'Handles Generacionales para Seguridad')}
          {state.scenario === 'handle_tables' && (state.language === 'en' ? 'Handle Table with Indirection' : 'Tabla de Handles con Indirección')}
          {state.scenario === 'type_safe_handles' && (state.language === 'en' ? 'Type-Safe Handle Systems' : 'Sistemas de Handles Type-Safe')}
          {state.scenario === 'performance_handles' && (state.language === 'en' ? 'Performance-Optimized Handles' : 'Handles Optimizados para Rendimiento')}
          {state.scenario === 'cross_platform' && (state.language === 'en' ? 'Cross-Platform Handle Management' : 'Gestión de Handles Multiplataforma')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'basic_handles' ? 
              (state.language === 'en' ? 'Basic Handle System' : 'Sistema de Handles Básico') :
            state.scenario === 'generational_handles' ? 
              (state.language === 'en' ? 'Generational Handle Implementation' : 'Implementación de Handles Generacionales') :
            state.scenario === 'handle_tables' ? 
              (state.language === 'en' ? 'Handle Table System' : 'Sistema de Tabla de Handles') :
            state.scenario === 'type_safe_handles' ? 
              (state.language === 'en' ? 'Type-Safe Handle Design' : 'Diseño de Handles Type-Safe') :
            state.scenario === 'performance_handles' ? 
              (state.language === 'en' ? 'High-Performance Handles' : 'Handles de Alto Rendimiento') :
            (state.language === 'en' ? 'Cross-Platform Implementation' : 'Implementación Multiplataforma')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Handle System Design Principles' : 'Principios de Diseño de Sistemas de Handles'}
        </SectionTitle>
        
        <PerformanceComparison
          title={state.language === 'en' ? 'Handle System Performance Comparison' : 'Comparación de Rendimiento de Sistemas de Handles'}
          scenarios={[
            {
              name: state.language === 'en' ? 'Basic Handles' : 'Handles Básicos',
              metrics: {
                [state.language === 'en' ? 'Safety' : 'Seguridad']: 60,
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 95,
                [state.language === 'en' ? 'Memory Overhead' : 'Overhead Memoria']: 20
              }
            },
            {
              name: state.language === 'en' ? 'Generational Handles' : 'Handles Generacionales',
              metrics: {
                [state.language === 'en' ? 'Safety' : 'Seguridad']: 95,
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 85,
                [state.language === 'en' ? 'Memory Overhead' : 'Overhead Memoria']: 30
              }
            },
            {
              name: state.language === 'en' ? 'Type-Safe Handles' : 'Handles Type-Safe',
              metrics: {
                [state.language === 'en' ? 'Safety' : 'Seguridad']: 90,
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 80,
                [state.language === 'en' ? 'Memory Overhead' : 'Overhead Memoria']: 25
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
            {state.language === 'en' ? '🎯 Handle System Best Practices:' : '🎯 Mejores Prácticas de Sistemas de Handles:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Generation Safety:' : 'Seguridad Generacional:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Use generational handles to prevent use-after-free and stale handle access'
                : 'Usar handles generacionales para prevenir use-after-free y acceso a handles obsoletos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Type Safety:' : 'Seguridad de Tipos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Leverage template system to prevent mixing handles of different resource types'
                : 'Aprovechar sistema de templates para prevenir mezclar handles de diferentes tipos de recursos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Performance Optimization:' : 'Optimización de Rendimiento:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Design handle validation to be cache-friendly and minimize indirection overhead'
                : 'Diseñar validación de handles para ser cache-friendly y minimizar overhead de indirección'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Platform Abstraction:' : 'Abstracción de Plataforma:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Abstract platform-specific handles behind unified interfaces for portability'
                : 'Abstraer handles específicos de plataforma detrás de interfaces unificadas para portabilidad'
              }
            </li>
          </ul>
        </div>

        <UndefinedBehaviorWarning
          title={state.language === 'en' ? 'Handle System Safety Considerations' : 'Consideraciones de Seguridad en Sistemas de Handles'}
          description={
            state.language === 'en' 
              ? 'Handle systems must carefully manage resource lifetime and validation. Improper handle design can lead to use-after-free, double-free, or resource leaks. Always validate handles before use and consider generational handles for critical safety requirements.'
              : 'Los sistemas de handles deben gestionar cuidadosamente el tiempo de vida de recursos y validación. El diseño inadecuado de handles puede llevar a use-after-free, double-free o fugas de recursos. Siempre validar handles antes del uso y considerar handles generacionales para requisitos críticos de seguridad.'
          }
        />
      </Section>
    </LessonLayout>
  );
};

export default Lesson95_HandleSystems;