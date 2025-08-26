import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone } from '@react-three/drei';
import { useApp } from '../context/AppContext';

interface GameEngineMetrics {
  componentSystemEfficiency: number;
  memoryPoolUtilization: number;
  ecsPerformance: number;
  pointerOptimization: number;
}

interface GameEngineVisualizationProps {
  metrics: GameEngineMetrics;
  activePattern: string;
  onPatternSelect: (pattern: string) => void;
}

const GameEngineVisualization: React.FC<GameEngineVisualizationProps> = ({ 
  metrics, 
  activePattern, 
  onPatternSelect 
}) => {
  const groupRef = useRef<any>();
  const componentsRef = useRef<any>();
  const entitiesRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    if (componentsRef.current) {
      // Animate component system visualization
      const time = state.clock.elapsedTime;
      componentsRef.current.children.forEach((child: any, index: number) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = 0.7 + 0.3 * Math.sin(time * 1.5 + index * 0.5);
        }
      });
    }
    if (entitiesRef.current) {
      // Animate entity movement
      const time = state.clock.elapsedTime;
      entitiesRef.current.rotation.z = time * 0.3;
    }
  });

  const patterns = [
    { name: 'Components', position: [-4, 2, 0], color: '#e74c3c', efficiency: 0.95 },
    { name: 'ECS Core', position: [-2, 2, 0], color: '#3498db', efficiency: 0.92 },
    { name: 'Memory Pool', position: [0, 2, 0], color: '#2ecc71', efficiency: 0.88 },
    { name: 'Ptr Cache', position: [2, 2, 0], color: '#f39c12', efficiency: 0.90 },
    { name: 'Systems', position: [4, 2, 0], color: '#9b59b6', efficiency: 0.87 },
    { name: 'Entities', position: [-1, -1, 0], color: '#e67e22', efficiency: 0.93 },
    { name: 'Resources', position: [1, -1, 0], color: '#1abc9c', efficiency: 0.85 }
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
      
      {/* Central game engine core visualization */}
      <group ref={componentsRef}>
        {/* Component system */}
        <Box position={[-0.8, 0.5, 0.5]} args={[0.3, 1.0, 0.3]}>
          <meshPhongMaterial color="#e74c3c" transparent opacity={0.7} />
        </Box>
        <Text
          position={[-0.8, -0.1, 0.8]}
          fontSize={0.12}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Components
        </Text>
        
        {/* Memory pools */}
        <Box position={[0.8, 0.5, 0.5]} args={[0.3, 0.8, 0.3]}>
          <meshPhongMaterial color="#2ecc71" transparent opacity={0.6} />
        </Box>
        <Text
          position={[0.8, -0.1, 0.8]}
          fontSize={0.12}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Memory Pools
        </Text>
        
        {/* ECS Core */}
        <Sphere position={[0, 0.5, 0]} args={[0.4]}>
          <meshPhongMaterial color="#3498db" transparent opacity={0.8} />
        </Sphere>
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.12}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          ECS Core
        </Text>
      </group>
      
      {/* Entity visualization */}
      <group ref={entitiesRef} position={[0, 0.5, -2]}>
        {[0, 1, 2, 3].map((i) => (
          <Cone
            key={i}
            position={[
              Math.cos(i * Math.PI / 2) * 0.5,
              0,
              Math.sin(i * Math.PI / 2) * 0.5
            ]}
            args={[0.1, 0.3]}
          >
            <meshPhongMaterial color="#f39c12" transparent opacity={0.6} />
          </Cone>
        ))}
      </group>
    </group>
  );
};

const Lesson116_GameEngineArchitecture: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('component-systems');
  const [selectedPattern, setSelectedPattern] = useState<string>('Components');
  const [metrics, setMetrics] = useState<GameEngineMetrics>({
    componentSystemEfficiency: 0.92,
    memoryPoolUtilization: 0.85,
    ecsPerformance: 0.88,
    pointerOptimization: 0.90
  });

  const examples = {
    'component-systems': {
      title: state.language === 'en' ? 'Component Systems with Pointers' : 'Sistemas de Componentes con Punteros',
      code: `#include <memory>
#include <vector>
#include <unordered_map>
#include <typeindex>
#include <type_traits>
#include <cassert>

// Component systems with optimized pointer management for game engines
namespace component_systems {

// Base component interface
class IComponent {
public:
    virtual ~IComponent() = default;
    virtual std::type_index get_type() const = 0;
    virtual std::unique_ptr<IComponent> clone() const = 0;
};

// CRTP base for type-safe components
template<typename T>
class Component : public IComponent {
public:
    std::type_index get_type() const override {
        return std::type_index(typeid(T));
    }
    
    std::unique_ptr<IComponent> clone() const override {
        return std::make_unique<T>(static_cast<const T&>(*this));
    }
};

// Transform component for positioning
class TransformComponent : public Component<TransformComponent> {
public:
    float x = 0.0f, y = 0.0f, z = 0.0f;
    float rotation = 0.0f;
    float scale_x = 1.0f, scale_y = 1.0f, scale_z = 1.0f;
    
    TransformComponent() = default;
    TransformComponent(float x, float y, float z) : x(x), y(y), z(z) {}
    
    void translate(float dx, float dy, float dz) {
        x += dx;
        y += dy;
        z += dz;
    }
    
    void rotate(float angle) {
        rotation += angle;
    }
    
    void scale(float factor) {
        scale_x *= factor;
        scale_y *= factor;
        scale_z *= factor;
    }
};

// Render component for graphics
class RenderComponent : public Component<RenderComponent> {
public:
    std::string mesh_name;
    std::string texture_name;
    uint32_t color = 0xFFFFFFFF;
    bool visible = true;
    int render_layer = 0;
    
    RenderComponent(const std::string& mesh = "", const std::string& texture = "")
        : mesh_name(mesh), texture_name(texture) {}
    
    void set_color(uint8_t r, uint8_t g, uint8_t b, uint8_t a = 255) {
        color = (a << 24) | (r << 16) | (g << 8) | b;
    }
    
    void set_layer(int layer) {
        render_layer = layer;
    }
};

// Physics component for movement and collision
class PhysicsComponent : public Component<PhysicsComponent> {
public:
    float velocity_x = 0.0f, velocity_y = 0.0f, velocity_z = 0.0f;
    float mass = 1.0f;
    float drag = 0.98f;
    bool kinematic = false;
    bool collision_enabled = true;
    
    PhysicsComponent() = default;
    PhysicsComponent(float mass) : mass(mass) {}
    
    void apply_force(float fx, float fy, float fz) {
        if (!kinematic && mass > 0.0f) {
            velocity_x += fx / mass;
            velocity_y += fy / mass;
            velocity_z += fz / mass;
        }
    }
    
    void set_velocity(float vx, float vy, float vz) {
        velocity_x = vx;
        velocity_y = vy;
        velocity_z = vz;
    }
};

// Health component for game logic
class HealthComponent : public Component<HealthComponent> {
public:
    int current_health;
    int max_health;
    bool invulnerable = false;
    float regeneration_rate = 0.0f;
    
    HealthComponent(int max_hp = 100) 
        : current_health(max_hp), max_health(max_hp) {}
    
    void take_damage(int damage) {
        if (!invulnerable) {
            current_health = std::max(0, current_health - damage);
        }
    }
    
    void heal(int amount) {
        current_health = std::min(max_health, current_health + amount);
    }
    
    bool is_alive() const {
        return current_health > 0;
    }
    
    float health_percentage() const {
        return static_cast<float>(current_health) / max_health;
    }
};

// Component storage with optimized pointer management
template<typename T>
class ComponentPool {
private:
    static_assert(std::is_base_of_v<IComponent, T>, "T must inherit from IComponent");
    
    std::vector<std::unique_ptr<T>> components_;
    std::vector<size_t> free_indices_;
    size_t next_id_ = 0;
    
public:
    using ComponentPtr = T*;
    using ConstComponentPtr = const T*;
    
    // Allocate a new component
    template<typename... Args>
    std::pair<ComponentPtr, size_t> create(Args&&... args) {
        std::unique_ptr<T> component = std::make_unique<T>(std::forward<Args>(args)...);
        T* raw_ptr = component.get();
        
        if (!free_indices_.empty()) {
            size_t index = free_indices_.back();
            free_indices_.pop_back();
            components_[index] = std::move(component);
            return {raw_ptr, index};
        } else {
            size_t index = components_.size();
            components_.push_back(std::move(component));
            return {raw_ptr, index};
        }
    }
    
    // Get component by index
    ComponentPtr get(size_t index) {
        return (index < components_.size() && components_[index]) 
               ? components_[index].get() : nullptr;
    }
    
    ConstComponentPtr get(size_t index) const {
        return (index < components_.size() && components_[index]) 
               ? components_[index].get() : nullptr;
    }
    
    // Remove component
    bool remove(size_t index) {
        if (index < components_.size() && components_[index]) {
            components_[index].reset();
            free_indices_.push_back(index);
            return true;
        }
        return false;
    }
    
    // Iterate over all active components
    void for_each(std::function<void(ComponentPtr, size_t)> func) {
        for (size_t i = 0; i < components_.size(); ++i) {
            if (components_[i]) {
                func(components_[i].get(), i);
            }
        }
    }
    
    void for_each(std::function<void(ConstComponentPtr, size_t)> func) const {
        for (size_t i = 0; i < components_.size(); ++i) {
            if (components_[i]) {
                func(components_[i].get(), i);
            }
        }
    }
    
    // Get statistics
    size_t size() const { return components_.size(); }
    size_t active_count() const { return components_.size() - free_indices_.size(); }
    size_t free_count() const { return free_indices_.size(); }
    double utilization() const { 
        return size() > 0 ? static_cast<double>(active_count()) / size() : 0.0;
    }
    
    // Memory management
    void compact() {
        // Remove gaps in the vector
        auto new_end = std::remove_if(components_.begin(), components_.end(),
            [](const std::unique_ptr<T>& ptr) { return ptr == nullptr; });
        components_.erase(new_end, components_.end());
        free_indices_.clear();
    }
    
    void reserve(size_t capacity) {
        components_.reserve(capacity);
    }
    
    void clear() {
        components_.clear();
        free_indices_.clear();
    }
};

// Component manager for organizing all component types
class ComponentManager {
private:
    std::unordered_map<std::type_index, std::unique_ptr<void, void(*)(void*)>> component_pools_;
    
    template<typename T>
    ComponentPool<T>* get_pool() {
        auto type_index = std::type_index(typeid(T));
        auto it = component_pools_.find(type_index);
        
        if (it == component_pools_.end()) {
            auto pool = std::make_unique<ComponentPool<T>>();
            ComponentPool<T>* raw_pool = pool.get();
            
            // Custom deleter for type-erased storage
            component_pools_[type_index] = std::unique_ptr<void, void(*)(void*)>(
                pool.release(),
                [](void* ptr) { delete static_cast<ComponentPool<T>*>(ptr); }
            );
            
            return raw_pool;
        } else {
            return static_cast<ComponentPool<T>*>(it->second.get());
        }
    }
    
public:
    // Create a component of type T
    template<typename T, typename... Args>
    std::pair<T*, size_t> create_component(Args&&... args) {
        ComponentPool<T>* pool = get_pool<T>();
        return pool->create(std::forward<Args>(args)...);
    }
    
    // Get component by type and index
    template<typename T>
    T* get_component(size_t index) {
        ComponentPool<T>* pool = get_pool<T>();
        return pool->get(index);
    }
    
    template<typename T>
    const T* get_component(size_t index) const {
        const ComponentPool<T>* pool = get_pool<T>();
        return pool->get(index);
    }
    
    // Remove component
    template<typename T>
    bool remove_component(size_t index) {
        ComponentPool<T>* pool = get_pool<T>();
        return pool->remove(index);
    }
    
    // Iterate over components of specific type
    template<typename T>
    void for_each_component(std::function<void(T*, size_t)> func) {
        ComponentPool<T>* pool = get_pool<T>();
        pool->for_each(func);
    }
    
    template<typename T>
    void for_each_component(std::function<void(const T*, size_t)> func) const {
        const ComponentPool<T>* pool = get_pool<T>();
        pool->for_each(func);
    }
    
    // Get statistics for component type
    template<typename T>
    size_t component_count() const {
        const ComponentPool<T>* pool = get_pool<T>();
        return pool->active_count();
    }
    
    // Memory management
    template<typename T>
    void compact_components() {
        ComponentPool<T>* pool = get_pool<T>();
        pool->compact();
    }
    
    void compact_all() {
        // Note: This is a simplified version - in practice you'd need
        // to iterate over all pools with proper type information
    }
    
    // Performance monitoring
    void print_statistics() const {
        printf("Component Manager Statistics:\\n");
        printf("Total component types: %zu\\n", component_pools_.size());
        
        // In a real implementation, you'd store type names to print detailed stats
        for (const auto& [type, pool] : component_pools_) {
            printf("Component type hash: %zu\\n", type.hash_code());
        }
    }
};

// Example usage demonstrating component system patterns
class GameObjectFactory {
private:
    ComponentManager& component_manager_;
    
public:
    explicit GameObjectFactory(ComponentManager& manager) 
        : component_manager_(manager) {}
    
    // Create a player entity with multiple components
    struct PlayerComponents {
        TransformComponent* transform;
        RenderComponent* render;
        PhysicsComponent* physics;
        HealthComponent* health;
        size_t transform_id, render_id, physics_id, health_id;
    };
    
    PlayerComponents create_player(float x, float y, float z) {
        PlayerComponents player;
        
        // Create transform component
        auto [transform, transform_id] = component_manager_.create_component<TransformComponent>(x, y, z);
        player.transform = transform;
        player.transform_id = transform_id;
        
        // Create render component
        auto [render, render_id] = component_manager_.create_component<RenderComponent>(
            "player_mesh", "player_texture"
        );
        render->set_color(255, 255, 255);
        render->set_layer(1);
        player.render = render;
        player.render_id = render_id;
        
        // Create physics component
        auto [physics, physics_id] = component_manager_.create_component<PhysicsComponent>(1.0f);
        player.physics = physics;
        player.physics_id = physics_id;
        
        // Create health component
        auto [health, health_id] = component_manager_.create_component<HealthComponent>(100);
        player.health = health;
        player.health_id = health_id;
        
        return player;
    }
    
    // Create an enemy entity
    struct EnemyComponents {
        TransformComponent* transform;
        RenderComponent* render;
        PhysicsComponent* physics;
        HealthComponent* health;
        size_t transform_id, render_id, physics_id, health_id;
    };
    
    EnemyComponents create_enemy(float x, float y, float z, int health_points) {
        EnemyComponents enemy;
        
        auto [transform, transform_id] = component_manager_.create_component<TransformComponent>(x, y, z);
        enemy.transform = transform;
        enemy.transform_id = transform_id;
        
        auto [render, render_id] = component_manager_.create_component<RenderComponent>(
            "enemy_mesh", "enemy_texture"
        );
        render->set_color(255, 0, 0);
        render->set_layer(1);
        enemy.render = render;
        enemy.render_id = render_id;
        
        auto [physics, physics_id] = component_manager_.create_component<PhysicsComponent>(0.8f);
        enemy.physics = physics;
        enemy.physics_id = physics_id;
        
        auto [health, health_id] = component_manager_.create_component<HealthComponent>(health_points);
        enemy.health = health;
        enemy.health_id = health_id;
        
        return enemy;
    }
    
    // Create a static prop (no physics)
    struct PropComponents {
        TransformComponent* transform;
        RenderComponent* render;
        size_t transform_id, render_id;
    };
    
    PropComponents create_prop(float x, float y, float z, const std::string& mesh_name) {
        PropComponents prop;
        
        auto [transform, transform_id] = component_manager_.create_component<TransformComponent>(x, y, z);
        prop.transform = transform;
        prop.transform_id = transform_id;
        
        auto [render, render_id] = component_manager_.create_component<RenderComponent>(
            mesh_name, "default_texture"
        );
        render->set_layer(0);
        prop.render = render;
        prop.render_id = render_id;
        
        return prop;
    }
};

// Example component system demonstration
void demonstrate_component_system() {
    printf("=== Component System Demonstration ===\\n");
    
    ComponentManager manager;
    GameObjectFactory factory(manager);
    
    // Create game objects
    auto player = factory.create_player(0.0f, 0.0f, 0.0f);
    auto enemy = factory.create_enemy(5.0f, 0.0f, 0.0f, 50);
    auto tree = factory.create_prop(3.0f, 0.0f, 2.0f, "tree_mesh");
    
    printf("Created player, enemy, and tree\\n");
    
    // Simulate some game logic
    player.physics->apply_force(10.0f, 0.0f, 0.0f);
    player.transform->translate(1.0f, 0.0f, 0.0f);
    
    enemy.health->take_damage(20);
    
    printf("Player position: (%.1f, %.1f, %.1f)\\n", 
           player.transform->x, player.transform->y, player.transform->z);
    printf("Enemy health: %d/%d (%.1f%%)\\n", 
           enemy.health->current_health, enemy.health->max_health,
           enemy.health->health_percentage() * 100);
    
    // Iterate over all transform components
    printf("\\nAll transform components:\\n");
    manager.for_each_component<TransformComponent>([](const TransformComponent* transform, size_t id) {
        printf("  Transform %zu: (%.1f, %.1f, %.1f)\\n", id, transform->x, transform->y, transform->z);
    });
    
    // Iterate over all health components
    printf("\\nAll health components:\\n");
    manager.for_each_component<HealthComponent>([](const HealthComponent* health, size_t id) {
        printf("  Health %zu: %d/%d\\n", id, health->current_health, health->max_health);
    });
    
    manager.print_statistics();
}

} // namespace component_systems`
    },
    
    'ecs-patterns': {
      title: state.language === 'en' ? 'Entity-Component-System (ECS) Patterns' : 'Patrones Entity-Component-System (ECS)',
      code: `#include <memory>
#include <vector>
#include <unordered_map>
#include <bitset>
#include <functional>
#include <type_traits>
#include <algorithm>

// Entity-Component-System patterns with optimized pointer usage
namespace ecs_patterns {

// Entity ID type - lightweight identifier
using EntityID = uint32_t;
static constexpr EntityID INVALID_ENTITY = 0;

// Component type ID system
class ComponentTypeRegistry {
private:
    static inline size_t next_type_id_ = 0;
    
public:
    template<typename T>
    static size_t get_type_id() {
        static size_t type_id = next_type_id_++;
        return type_id;
    }
    
    static size_t get_next_type_id() {
        return next_type_id_;
    }
};

// Component signature using bitset for fast operations
using ComponentSignature = std::bitset<64>; // Support up to 64 component types

template<typename T>
ComponentSignature get_component_signature() {
    ComponentSignature signature;
    signature.set(ComponentTypeRegistry::get_type_id<T>());
    return signature;
}

template<typename... Components>
ComponentSignature get_components_signature() {
    ComponentSignature signature;
    ((signature.set(ComponentTypeRegistry::get_type_id<Components>())), ...);
    return signature;
}

// Dense component array for cache-friendly access
template<typename T>
class DenseComponentArray {
private:
    std::vector<T> components_;
    std::vector<EntityID> entity_to_index_;
    std::vector<EntityID> index_to_entity_;
    std::unordered_map<EntityID, size_t> entity_to_dense_index_;
    
public:
    // Add component for entity
    T* add_component(EntityID entity, T&& component) {
        if (entity_to_dense_index_.count(entity)) {
            // Entity already has this component - replace it
            size_t index = entity_to_dense_index_[entity];
            components_[index] = std::move(component);
            return &components_[index];
        }
        
        // Add new component
        size_t index = components_.size();
        components_.push_back(std::move(component));
        index_to_entity_.push_back(entity);
        entity_to_dense_index_[entity] = index;
        
        return &components_.back();
    }
    
    template<typename... Args>
    T* emplace_component(EntityID entity, Args&&... args) {
        return add_component(entity, T(std::forward<Args>(args)...));
    }
    
    // Get component for entity
    T* get_component(EntityID entity) {
        auto it = entity_to_dense_index_.find(entity);
        return (it != entity_to_dense_index_.end()) ? &components_[it->second] : nullptr;
    }
    
    const T* get_component(EntityID entity) const {
        auto it = entity_to_dense_index_.find(entity);
        return (it != entity_to_dense_index_.end()) ? &components_[it->second] : nullptr;
    }
    
    // Remove component from entity
    bool remove_component(EntityID entity) {
        auto it = entity_to_dense_index_.find(entity);
        if (it == entity_to_dense_index_.end()) {
            return false; // Entity doesn't have this component
        }
        
        size_t index_to_remove = it->second;
        size_t last_index = components_.size() - 1;
        
        if (index_to_remove != last_index) {
            // Move last element to the position being removed
            components_[index_to_remove] = std::move(components_[last_index]);
            EntityID moved_entity = index_to_entity_[last_index];
            index_to_entity_[index_to_remove] = moved_entity;
            entity_to_dense_index_[moved_entity] = index_to_remove;
        }
        
        // Remove last element
        components_.pop_back();
        index_to_entity_.pop_back();
        entity_to_dense_index_.erase(entity);
        
        return true;
    }
    
    // Check if entity has component
    bool has_component(EntityID entity) const {
        return entity_to_dense_index_.count(entity) > 0;
    }
    
    // Iteration over all components
    void for_each(std::function<void(T&, EntityID)> func) {
        for (size_t i = 0; i < components_.size(); ++i) {
            func(components_[i], index_to_entity_[i]);
        }
    }
    
    void for_each(std::function<void(const T&, EntityID)> func) const {
        for (size_t i = 0; i < components_.size(); ++i) {
            func(components_[i], index_to_entity_[i]);
        }
    }
    
    // Direct access to components (cache-friendly)
    T* data() { return components_.data(); }
    const T* data() const { return components_.data(); }
    
    EntityID* entity_data() { return index_to_entity_.data(); }
    const EntityID* entity_data() const { return index_to_entity_.data(); }
    
    size_t size() const { return components_.size(); }
    bool empty() const { return components_.empty(); }
    
    void clear() {
        components_.clear();
        index_to_entity_.clear();
        entity_to_dense_index_.clear();
    }
    
    void reserve(size_t capacity) {
        components_.reserve(capacity);
        index_to_entity_.reserve(capacity);
        entity_to_dense_index_.reserve(capacity);
    }
};

// Entity manager
class EntityManager {
private:
    std::vector<ComponentSignature> entity_signatures_;
    std::vector<bool> entity_active_;
    std::vector<EntityID> free_entities_;
    EntityID next_entity_id_ = 1; // Start from 1 (0 is INVALID_ENTITY)
    
public:
    // Create new entity
    EntityID create_entity() {
        EntityID entity;
        
        if (!free_entities_.empty()) {
            entity = free_entities_.back();
            free_entities_.pop_back();
            entity_active_[entity] = true;
            entity_signatures_[entity].reset();
        } else {
            entity = next_entity_id_++;
            if (entity >= entity_signatures_.size()) {
                entity_signatures_.resize(entity + 1);
                entity_active_.resize(entity + 1, false);
            }
            entity_active_[entity] = true;
        }
        
        return entity;
    }
    
    // Destroy entity
    void destroy_entity(EntityID entity) {
        if (entity < entity_active_.size() && entity_active_[entity]) {
            entity_active_[entity] = false;
            entity_signatures_[entity].reset();
            free_entities_.push_back(entity);
        }
    }
    
    // Check if entity is valid
    bool is_valid(EntityID entity) const {
        return entity < entity_active_.size() && entity_active_[entity];
    }
    
    // Set component signature
    void set_signature(EntityID entity, ComponentSignature signature) {
        if (entity < entity_signatures_.size()) {
            entity_signatures_[entity] = signature;
        }
    }
    
    // Get component signature
    ComponentSignature get_signature(EntityID entity) const {
        return (entity < entity_signatures_.size()) ? entity_signatures_[entity] : ComponentSignature{};
    }
    
    // Add component type to entity signature
    template<typename T>
    void add_component_signature(EntityID entity) {
        if (entity < entity_signatures_.size()) {
            entity_signatures_[entity].set(ComponentTypeRegistry::get_type_id<T>());
        }
    }
    
    // Remove component type from entity signature
    template<typename T>
    void remove_component_signature(EntityID entity) {
        if (entity < entity_signatures_.size()) {
            entity_signatures_[entity].reset(ComponentTypeRegistry::get_type_id<T>());
        }
    }
    
    // Get all active entities
    std::vector<EntityID> get_active_entities() const {
        std::vector<EntityID> active;
        for (EntityID entity = 1; entity < entity_active_.size(); ++entity) {
            if (entity_active_[entity]) {
                active.push_back(entity);
            }
        }
        return active;
    }
    
    size_t get_active_entity_count() const {
        return std::count(entity_active_.begin(), entity_active_.end(), true);
    }
};

// Component manager using dense arrays
class ComponentManager {
private:
    std::unordered_map<size_t, std::unique_ptr<void, void(*)(void*)>> component_arrays_;
    
    template<typename T>
    DenseComponentArray<T>* get_array() {
        size_t type_id = ComponentTypeRegistry::get_type_id<T>();
        auto it = component_arrays_.find(type_id);
        
        if (it == component_arrays_.end()) {
            auto array = std::make_unique<DenseComponentArray<T>>();
            DenseComponentArray<T>* raw_array = array.get();
            
            component_arrays_[type_id] = std::unique_ptr<void, void(*)(void*)>(
                array.release(),
                [](void* ptr) { delete static_cast<DenseComponentArray<T>*>(ptr); }
            );
            
            return raw_array;
        } else {
            return static_cast<DenseComponentArray<T>*>(it->second.get());
        }
    }
    
public:
    // Add component to entity
    template<typename T, typename... Args>
    T* add_component(EntityID entity, Args&&... args) {
        DenseComponentArray<T>* array = get_array<T>();
        return array->emplace_component(entity, std::forward<Args>(args)...);
    }
    
    // Get component from entity
    template<typename T>
    T* get_component(EntityID entity) {
        DenseComponentArray<T>* array = get_array<T>();
        return array->get_component(entity);
    }
    
    template<typename T>
    const T* get_component(EntityID entity) const {
        DenseComponentArray<T>* array = get_array<T>();
        return array->get_component(entity);
    }
    
    // Remove component from entity
    template<typename T>
    bool remove_component(EntityID entity) {
        DenseComponentArray<T>* array = get_array<T>();
        return array->remove_component(entity);
    }
    
    // Check if entity has component
    template<typename T>
    bool has_component(EntityID entity) const {
        DenseComponentArray<T>* array = get_array<T>();
        return array->has_component(entity);
    }
    
    // Get direct access to component array
    template<typename T>
    DenseComponentArray<T>* get_component_array() {
        return get_array<T>();
    }
    
    // Iterate over components
    template<typename T>
    void for_each_component(std::function<void(T&, EntityID)> func) {
        DenseComponentArray<T>* array = get_array<T>();
        array->for_each(func);
    }
    
    // Entity destroyed - remove all its components
    void entity_destroyed(EntityID entity) {
        // In a real implementation, you'd need to track which component types
        // an entity has and remove them all
        // For now, this is a placeholder
    }
};

// System base class
class System {
protected:
    ComponentSignature required_components_;
    std::vector<EntityID> entities_;
    
public:
    virtual ~System() = default;
    
    // Set required components for this system
    template<typename... ComponentTypes>
    void require_components() {
        required_components_ = get_components_signature<ComponentTypes...>();
    }
    
    // Check if entity matches system requirements
    bool matches_requirements(ComponentSignature entity_signature) const {
        return (required_components_ & entity_signature) == required_components_;
    }
    
    // Entity management
    void add_entity(EntityID entity) {
        auto it = std::find(entities_.begin(), entities_.end(), entity);
        if (it == entities_.end()) {
            entities_.push_back(entity);
        }
    }
    
    void remove_entity(EntityID entity) {
        auto it = std::find(entities_.begin(), entities_.end(), entity);
        if (it != entities_.end()) {
            entities_.erase(it);
        }
    }
    
    const std::vector<EntityID>& get_entities() const { return entities_; }
    
    // System update - override in derived classes
    virtual void update(float delta_time, ComponentManager& component_manager) = 0;
};

// Physics system example
class PhysicsSystem : public System {
public:
    PhysicsSystem() {
        require_components<TransformComponent, PhysicsComponent>();
    }
    
    void update(float delta_time, ComponentManager& component_manager) override {
        for (EntityID entity : entities_) {
            auto* transform = component_manager.get_component<TransformComponent>(entity);
            auto* physics = component_manager.get_component<PhysicsComponent>(entity);
            
            if (transform && physics) {
                // Apply velocity
                transform->x += physics->velocity_x * delta_time;
                transform->y += physics->velocity_y * delta_time;
                transform->z += physics->velocity_z * delta_time;
                
                // Apply drag
                physics->velocity_x *= physics->drag;
                physics->velocity_y *= physics->drag;
                physics->velocity_z *= physics->drag;
            }
        }
    }
};

// Render system example
class RenderSystem : public System {
public:
    RenderSystem() {
        require_components<TransformComponent, RenderComponent>();
    }
    
    void update(float delta_time, ComponentManager& component_manager) override {
        // Collect renderable entities
        struct RenderInfo {
            EntityID entity;
            const TransformComponent* transform;
            const RenderComponent* render;
        };
        
        std::vector<RenderInfo> render_list;
        render_list.reserve(entities_.size());
        
        for (EntityID entity : entities_) {
            auto* transform = component_manager.get_component<TransformComponent>(entity);
            auto* render = component_manager.get_component<RenderComponent>(entity);
            
            if (transform && render && render->visible) {
                render_list.push_back({entity, transform, render});
            }
        }
        
        // Sort by render layer
        std::sort(render_list.begin(), render_list.end(),
            [](const RenderInfo& a, const RenderInfo& b) {
                return a.render->render_layer < b.render->render_layer;
            });
        
        // Render entities
        for (const auto& info : render_list) {
            // In a real engine, this would submit draw calls
            printf("Rendering entity %u at (%.1f, %.1f, %.1f) layer %d\\n",
                   info.entity, info.transform->x, info.transform->y, 
                   info.transform->z, info.render->render_layer);
        }
    }
};

// System manager
class SystemManager {
private:
    std::vector<std::unique_ptr<System>> systems_;
    EntityManager* entity_manager_;
    ComponentManager* component_manager_;
    
public:
    SystemManager(EntityManager& entity_mgr, ComponentManager& component_mgr)
        : entity_manager_(&entity_mgr), component_manager_(&component_mgr) {}
    
    // Add system
    template<typename T, typename... Args>
    T* add_system(Args&&... args) {
        static_assert(std::is_base_of_v<System, T>, "T must inherit from System");
        
        auto system = std::make_unique<T>(std::forward<Args>(args)...);
        T* system_ptr = system.get();
        systems_.push_back(std::move(system));
        return system_ptr;
    }
    
    // Update all systems
    void update(float delta_time) {
        for (auto& system : systems_) {
            system->update(delta_time, *component_manager_);
        }
    }
    
    // Entity signature changed - update system entity lists
    void entity_signature_changed(EntityID entity, ComponentSignature new_signature) {
        for (auto& system : systems_) {
            if (system->matches_requirements(new_signature)) {
                system->add_entity(entity);
            } else {
                system->remove_entity(entity);
            }
        }
    }
    
    // Entity destroyed - remove from all systems
    void entity_destroyed(EntityID entity) {
        for (auto& system : systems_) {
            system->remove_entity(entity);
        }
    }
};

// Main ECS coordinator
class ECSCoordinator {
private:
    EntityManager entity_manager_;
    ComponentManager component_manager_;
    SystemManager system_manager_;
    
public:
    ECSCoordinator() : system_manager_(entity_manager_, component_manager_) {}
    
    // Entity operations
    EntityID create_entity() {
        return entity_manager_.create_entity();
    }
    
    void destroy_entity(EntityID entity) {
        entity_manager_.destroy_entity(entity);
        component_manager_.entity_destroyed(entity);
        system_manager_.entity_destroyed(entity);
    }
    
    // Component operations
    template<typename T, typename... Args>
    T* add_component(EntityID entity, Args&&... args) {
        T* component = component_manager_.add_component<T>(entity, std::forward<Args>(args)...);
        
        // Update entity signature
        entity_manager_.add_component_signature<T>(entity);
        ComponentSignature signature = entity_manager_.get_signature(entity);
        system_manager_.entity_signature_changed(entity, signature);
        
        return component;
    }
    
    template<typename T>
    T* get_component(EntityID entity) {
        return component_manager_.get_component<T>(entity);
    }
    
    template<typename T>
    bool remove_component(EntityID entity) {
        bool success = component_manager_.remove_component<T>(entity);
        if (success) {
            entity_manager_.remove_component_signature<T>(entity);
            ComponentSignature signature = entity_manager_.get_signature(entity);
            system_manager_.entity_signature_changed(entity, signature);
        }
        return success;
    }
    
    // System operations
    template<typename T, typename... Args>
    T* add_system(Args&&... args) {
        return system_manager_.add_system<T>(std::forward<Args>(args)...);
    }
    
    void update(float delta_time) {
        system_manager_.update(delta_time);
    }
    
    // Statistics
    size_t get_entity_count() const {
        return entity_manager_.get_active_entity_count();
    }
};

// Example ECS usage
void demonstrate_ecs() {
    printf("=== ECS Pattern Demonstration ===\\n");
    
    ECSCoordinator ecs;
    
    // Add systems
    auto* physics_system = ecs.add_system<PhysicsSystem>();
    auto* render_system = ecs.add_system<RenderSystem>();
    
    // Create entities
    EntityID player = ecs.create_entity();
    ecs.add_component<TransformComponent>(player, 0.0f, 0.0f, 0.0f);
    ecs.add_component<PhysicsComponent>(player, 1.0f);
    ecs.add_component<RenderComponent>(player, "player_mesh", "player_texture");
    
    EntityID enemy = ecs.create_entity();
    ecs.add_component<TransformComponent>(enemy, 5.0f, 0.0f, 0.0f);
    ecs.add_component<RenderComponent>(enemy, "enemy_mesh", "enemy_texture");
    
    EntityID projectile = ecs.create_entity();
    ecs.add_component<TransformComponent>(projectile, 1.0f, 0.0f, 0.0f);
    ecs.add_component<PhysicsComponent>(projectile, 0.1f);
    
    printf("Created %zu entities\\n", ecs.get_entity_count());
    
    // Apply some forces
    auto* player_physics = ecs.get_component<PhysicsComponent>(player);
    if (player_physics) {
        player_physics->apply_force(10.0f, 0.0f, 0.0f);
    }
    
    auto* projectile_physics = ecs.get_component<PhysicsComponent>(projectile);
    if (projectile_physics) {
        projectile_physics->set_velocity(15.0f, 0.0f, 0.0f);
    }
    
    // Simulate a few frames
    for (int frame = 0; frame < 3; ++frame) {
        printf("\\n--- Frame %d ---\\n", frame + 1);
        ecs.update(0.016f); // 60 FPS
        
        // Print positions
        auto* player_transform = ecs.get_component<TransformComponent>(player);
        if (player_transform) {
            printf("Player position: (%.2f, %.2f, %.2f)\\n", 
                   player_transform->x, player_transform->y, player_transform->z);
        }
        
        auto* projectile_transform = ecs.get_component<TransformComponent>(projectile);
        if (projectile_transform) {
            printf("Projectile position: (%.2f, %.2f, %.2f)\\n", 
                   projectile_transform->x, projectile_transform->y, projectile_transform->z);
        }
    }
}

} // namespace ecs_patterns`
    },
    
    'memory-pools': {
      title: state.language === 'en' ? 'Memory Pools for Game Objects' : 'Pools de Memoria para Objetos de Juego',
      code: `#include <memory>
#include <vector>
#include <array>
#include <algorithm>
#include <type_traits>
#include <cassert>
#include <cstdint>

// Memory pools optimized for game object allocation patterns
namespace memory_pools {

// Fixed-size block allocator for uniform objects
template<size_t BlockSize, size_t BlockCount>
class FixedSizePool {
private:
    alignas(std::max_align_t) char memory_pool_[BlockSize * BlockCount];
    std::array<bool, BlockCount> used_blocks_;
    size_t next_free_hint_ = 0;
    size_t allocated_count_ = 0;
    
    static_assert(BlockSize >= sizeof(void*), "Block size too small");
    static_assert(BlockCount > 0, "Block count must be positive");
    
public:
    FixedSizePool() {
        used_blocks_.fill(false);
    }
    
    ~FixedSizePool() = default;
    
    // Non-copyable
    FixedSizePool(const FixedSizePool&) = delete;
    FixedSizePool& operator=(const FixedSizePool&) = delete;
    
    // Movable
    FixedSizePool(FixedSizePool&& other) noexcept {
        std::memcpy(memory_pool_, other.memory_pool_, sizeof(memory_pool_));
        used_blocks_ = other.used_blocks_;
        next_free_hint_ = other.next_free_hint_;
        allocated_count_ = other.allocated_count_;
        
        other.used_blocks_.fill(false);
        other.next_free_hint_ = 0;
        other.allocated_count_ = 0;
    }
    
    void* allocate() {
        if (allocated_count_ >= BlockCount) {
            return nullptr; // Pool exhausted
        }
        
        // Start searching from the hint
        for (size_t i = 0; i < BlockCount; ++i) {
            size_t index = (next_free_hint_ + i) % BlockCount;
            if (!used_blocks_[index]) {
                used_blocks_[index] = true;
                next_free_hint_ = (index + 1) % BlockCount;
                ++allocated_count_;
                return &memory_pool_[index * BlockSize];
            }
        }
        
        return nullptr; // Should never reach here if allocated_count_ is correct
    }
    
    bool deallocate(void* ptr) {
        if (!ptr) return false;
        
        char* char_ptr = static_cast<char*>(ptr);
        ptrdiff_t offset = char_ptr - memory_pool_;
        
        if (offset < 0 || offset >= static_cast<ptrdiff_t>(BlockSize * BlockCount)) {
            return false; // Pointer not from this pool
        }
        
        if (offset % BlockSize != 0) {
            return false; // Misaligned pointer
        }
        
        size_t index = offset / BlockSize;
        if (!used_blocks_[index]) {
            return false; // Double free
        }
        
        used_blocks_[index] = false;
        next_free_hint_ = index;
        --allocated_count_;
        return true;
    }
    
    bool owns(void* ptr) const {
        char* char_ptr = static_cast<char*>(ptr);
        return char_ptr >= memory_pool_ && 
               char_ptr < memory_pool_ + sizeof(memory_pool_) &&
               (char_ptr - memory_pool_) % BlockSize == 0;
    }
    
    // Statistics
    size_t allocated_blocks() const { return allocated_count_; }
    size_t available_blocks() const { return BlockCount - allocated_count_; }
    size_t total_blocks() const { return BlockCount; }
    double utilization() const { return static_cast<double>(allocated_count_) / BlockCount; }
    
    static constexpr size_t block_size() { return BlockSize; }
    static constexpr size_t capacity() { return BlockCount; }
    
    // Debugging
    void print_layout() const {
        printf("Pool layout (U=used, F=free):\\n");
        for (size_t i = 0; i < BlockCount; ++i) {
            printf("%c", used_blocks_[i] ? 'U' : 'F');
            if ((i + 1) % 64 == 0) printf("\\n");
        }
        if (BlockCount % 64 != 0) printf("\\n");
        printf("Allocated: %zu/%zu (%.1f%%)\\n", 
               allocated_count_, BlockCount, utilization() * 100);
    }
};

// Type-specific pool allocator
template<typename T, size_t PoolSize = 256>
class TypedPool {
private:
    FixedSizePool<sizeof(T), PoolSize> pool_;
    
public:
    template<typename... Args>
    T* construct(Args&&... args) {
        void* memory = pool_.allocate();
        if (!memory) {
            return nullptr; // Pool exhausted
        }
        
        try {
            return new(memory) T(std::forward<Args>(args)...);
        } catch (...) {
            pool_.deallocate(memory);
            throw;
        }
    }
    
    void destroy(T* object) {
        if (!object) return;
        
        if (pool_.owns(object)) {
            object->~T();
            pool_.deallocate(object);
        }
    }
    
    bool owns(T* object) const {
        return pool_.owns(object);
    }
    
    // Statistics
    size_t allocated_objects() const { return pool_.allocated_blocks(); }
    size_t available_objects() const { return pool_.available_blocks(); }
    double utilization() const { return pool_.utilization(); }
    
    void print_statistics() const {
        printf("TypedPool<%s>: %zu/%zu objects (%.1f%%)\\n",
               typeid(T).name(), allocated_objects(), PoolSize, utilization() * 100);
    }
};

// Multi-size pool for different object sizes
class MultiSizePool {
private:
    struct PoolInfo {
        size_t block_size;
        size_t block_count;
        std::unique_ptr<char[]> memory;
        std::vector<bool> used_blocks;
        size_t allocated_count = 0;
        size_t next_free_hint = 0;
    };
    
    std::vector<PoolInfo> pools_;
    
    PoolInfo* find_suitable_pool(size_t size) {
        for (auto& pool : pools_) {
            if (pool.block_size >= size && pool.allocated_count < pool.block_count) {
                return &pool;
            }
        }
        return nullptr;
    }
    
    PoolInfo* find_owner_pool(void* ptr) {
        for (auto& pool : pools_) {
            char* start = pool.memory.get();
            char* end = start + pool.block_size * pool.block_count;
            if (ptr >= start && ptr < end) {
                return &pool;
            }
        }
        return nullptr;
    }
    
public:
    MultiSizePool() = default;
    
    // Add a pool for specific block size
    void add_pool(size_t block_size, size_t block_count) {
        PoolInfo pool;
        pool.block_size = block_size;
        pool.block_count = block_count;
        pool.memory = std::make_unique<char[]>(block_size * block_count);
        pool.used_blocks.resize(block_count, false);
        
        pools_.push_back(std::move(pool));
        
        // Sort pools by block size for efficient lookup
        std::sort(pools_.begin(), pools_.end(),
            [](const PoolInfo& a, const PoolInfo& b) {
                return a.block_size < b.block_size;
            });
    }
    
    void* allocate(size_t size) {
        PoolInfo* pool = find_suitable_pool(size);
        if (!pool) {
            return nullptr; // No suitable pool or all exhausted
        }
        
        // Find free block
        for (size_t i = 0; i < pool->block_count; ++i) {
            size_t index = (pool->next_free_hint + i) % pool->block_count;
            if (!pool->used_blocks[index]) {
                pool->used_blocks[index] = true;
                pool->next_free_hint = (index + 1) % pool->block_count;
                ++pool->allocated_count;
                return pool->memory.get() + index * pool->block_size;
            }
        }
        
        return nullptr; // Should not reach here
    }
    
    bool deallocate(void* ptr) {
        if (!ptr) return false;
        
        PoolInfo* pool = find_owner_pool(ptr);
        if (!pool) {
            return false; // Pointer not from any pool
        }
        
        char* char_ptr = static_cast<char*>(ptr);
        ptrdiff_t offset = char_ptr - pool->memory.get();
        
        if (offset % pool->block_size != 0) {
            return false; // Misaligned pointer
        }
        
        size_t index = offset / pool->block_size;
        if (index >= pool->block_count || !pool->used_blocks[index]) {
            return false; // Invalid index or double free
        }
        
        pool->used_blocks[index] = false;
        pool->next_free_hint = index;
        --pool->allocated_count;
        return true;
    }
    
    // Statistics
    void print_statistics() const {
        printf("MultiSizePool Statistics:\\n");
        for (size_t i = 0; i < pools_.size(); ++i) {
            const auto& pool = pools_[i];
            double utilization = static_cast<double>(pool.allocated_count) / pool.block_count;
            printf("  Pool %zu: %zu bytes/block, %zu/%zu blocks (%.1f%%)\\n",
                   i, pool.block_size, pool.allocated_count, pool.block_count,
                   utilization * 100);
        }
    }
};

// Stack allocator for temporary objects
template<size_t Size>
class StackAllocator {
private:
    alignas(std::max_align_t) char buffer_[Size];
    size_t offset_ = 0;
    
    struct Marker {
        size_t offset;
    };
    
public:
    StackAllocator() = default;
    
    void* allocate(size_t size, size_t alignment = alignof(std::max_align_t)) {
        // Align offset to the requested boundary
        size_t aligned_offset = (offset_ + alignment - 1) & ~(alignment - 1);
        
        if (aligned_offset + size > Size) {
            return nullptr; // Out of stack space
        }
        
        void* result = &buffer_[aligned_offset];
        offset_ = aligned_offset + size;
        return result;
    }
    
    template<typename T, typename... Args>
    T* construct(Args&&... args) {
        void* memory = allocate(sizeof(T), alignof(T));
        if (!memory) {
            return nullptr;
        }
        
        try {
            return new(memory) T(std::forward<Args>(args)...);
        } catch (...) {
            // Stack allocator can't individually deallocate, so we just
            // leave the memory allocated. The destructor won't be called.
            throw;
        }
    }
    
    // Get current stack marker
    Marker get_marker() const {
        return {offset_};
    }
    
    // Rewind to marker (destroys all objects allocated after marker)
    void rewind_to_marker(Marker marker) {
        if (marker.offset <= offset_) {
            offset_ = marker.offset;
        }
    }
    
    // Clear all allocations
    void clear() {
        offset_ = 0;
    }
    
    // Statistics
    size_t bytes_used() const { return offset_; }
    size_t bytes_available() const { return Size - offset_; }
    double utilization() const { return static_cast<double>(offset_) / Size; }
    
    bool owns(void* ptr) const {
        return ptr >= buffer_ && ptr < buffer_ + offset_;
    }
};

// Game object pool with recycling
template<typename T>
class GameObjectPool {
private:
    struct ObjectSlot {
        alignas(T) char storage[sizeof(T)];
        bool in_use = false;
        uint32_t generation = 0; // For safe handles
        
        T* get() { return reinterpret_cast<T*>(storage); }
        const T* get() const { return reinterpret_cast<const T*>(storage); }
    };
    
    std::vector<ObjectSlot> objects_;
    std::vector<size_t> free_indices_;
    
public:
    struct Handle {
        uint32_t index;
        uint32_t generation;
        
        bool operator==(const Handle& other) const {
            return index == other.index && generation == other.generation;
        }
        
        bool operator!=(const Handle& other) const {
            return !(*this == other);
        }
    };
    
    static constexpr Handle INVALID_HANDLE = {UINT32_MAX, 0};
    
    explicit GameObjectPool(size_t initial_capacity = 256) {
        objects_.reserve(initial_capacity);
        free_indices_.reserve(initial_capacity);
    }
    
    ~GameObjectPool() {
        clear();
    }
    
    // Create new object
    template<typename... Args>
    Handle create(Args&&... args) {
        size_t index;
        
        if (!free_indices_.empty()) {
            index = free_indices_.back();
            free_indices_.pop_back();
        } else {
            index = objects_.size();
            objects_.emplace_back();
        }
        
        ObjectSlot& slot = objects_[index];
        slot.in_use = true;
        ++slot.generation;
        
        try {
            new(slot.storage) T(std::forward<Args>(args)...);
            return {static_cast<uint32_t>(index), slot.generation};
        } catch (...) {
            slot.in_use = false;
            free_indices_.push_back(index);
            throw;
        }
    }
    
    // Get object by handle
    T* get(Handle handle) {
        if (handle.index >= objects_.size()) {
            return nullptr;
        }
        
        ObjectSlot& slot = objects_[handle.index];
        if (!slot.in_use || slot.generation != handle.generation) {
            return nullptr;
        }
        
        return slot.get();
    }
    
    const T* get(Handle handle) const {
        if (handle.index >= objects_.size()) {
            return nullptr;
        }
        
        const ObjectSlot& slot = objects_[handle.index];
        if (!slot.in_use || slot.generation != handle.generation) {
            return nullptr;
        }
        
        return slot.get();
    }
    
    // Destroy object
    bool destroy(Handle handle) {
        T* obj = get(handle);
        if (!obj) {
            return false; // Invalid handle
        }
        
        ObjectSlot& slot = objects_[handle.index];
        obj->~T();
        slot.in_use = false;
        free_indices_.push_back(handle.index);
        
        return true;
    }
    
    // Check if handle is valid
    bool is_valid(Handle handle) const {
        return get(handle) != nullptr;
    }
    
    // Iterate over all active objects
    void for_each(std::function<void(T&, Handle)> func) {
        for (size_t i = 0; i < objects_.size(); ++i) {
            ObjectSlot& slot = objects_[i];
            if (slot.in_use) {
                Handle handle{static_cast<uint32_t>(i), slot.generation};
                func(*slot.get(), handle);
            }
        }
    }
    
    void for_each(std::function<void(const T&, Handle)> func) const {
        for (size_t i = 0; i < objects_.size(); ++i) {
            const ObjectSlot& slot = objects_[i];
            if (slot.in_use) {
                Handle handle{static_cast<uint32_t>(i), slot.generation};
                func(*slot.get(), handle);
            }
        }
    }
    
    // Clear all objects
    void clear() {
        for (auto& slot : objects_) {
            if (slot.in_use) {
                slot.get()->~T();
                slot.in_use = false;
            }
        }
        free_indices_.clear();
        
        // Refill free indices
        for (size_t i = 0; i < objects_.size(); ++i) {
            free_indices_.push_back(i);
        }
    }
    
    // Statistics
    size_t size() const { return objects_.size(); }
    size_t active_count() const { return objects_.size() - free_indices_.size(); }
    size_t free_count() const { return free_indices_.size(); }
    double utilization() const { 
        return objects_.empty() ? 0.0 : static_cast<double>(active_count()) / objects_.size();
    }
    
    void print_statistics() const {
        printf("GameObjectPool<%s>: %zu/%zu active (%.1f%%)\\n",
               typeid(T).name(), active_count(), size(), utilization() * 100);
    }
};

// Example game objects for demonstration
struct Enemy {
    float x, y, z;
    int health;
    float speed;
    
    Enemy(float px = 0, float py = 0, float pz = 0, int hp = 100, float spd = 1.0f)
        : x(px), y(py), z(pz), health(hp), speed(spd) {
        printf("Enemy created at (%.1f, %.1f, %.1f)\\n", x, y, z);
    }
    
    ~Enemy() {
        printf("Enemy destroyed at (%.1f, %.1f, %.1f)\\n", x, y, z);
    }
    
    void update(float dt) {
        x += speed * dt;
    }
};

struct Projectile {
    float x, y, z;
    float vx, vy, vz;
    float lifetime;
    
    Projectile(float px, float py, float pz, float vx_, float vy_, float vz_, float life = 3.0f)
        : x(px), y(py), z(pz), vx(vx_), vy(vy_), vz(vz_), lifetime(life) {}
    
    bool update(float dt) {
        x += vx * dt;
        y += vy * dt;
        z += vz * dt;
        lifetime -= dt;
        return lifetime > 0;
    }
};

// Demonstration of memory pool usage
void demonstrate_memory_pools() {
    printf("=== Memory Pool Demonstration ===\\n");
    
    // Typed pool for enemies
    TypedPool<Enemy, 64> enemy_pool;
    
    printf("\\n--- Creating enemies ---\\n");
    std::vector<Enemy*> enemies;
    for (int i = 0; i < 10; ++i) {
        Enemy* enemy = enemy_pool.construct(i * 2.0f, 0.0f, 0.0f, 50, 1.5f);
        if (enemy) {
            enemies.push_back(enemy);
        }
    }
    
    enemy_pool.print_statistics();
    
    // Game object pool with handles
    printf("\\n--- Game object pool with handles ---\\n");
    GameObjectPool<Projectile> projectile_pool;
    
    std::vector<GameObjectPool<Projectile>::Handle> projectiles;
    for (int i = 0; i < 5; ++i) {
        auto handle = projectile_pool.create(0.0f, 0.0f, 0.0f, 10.0f, 0.0f, 0.0f);
        projectiles.push_back(handle);
    }
    
    projectile_pool.print_statistics();
    
    // Update projectiles
    printf("\\n--- Updating projectiles ---\\n");
    for (auto it = projectiles.begin(); it != projectiles.end();) {
        Projectile* proj = projectile_pool.get(*it);
        if (proj && proj->update(0.5f)) {
            printf("Projectile at (%.1f, %.1f, %.1f) lifetime: %.1f\\n", 
                   proj->x, proj->y, proj->z, proj->lifetime);
            ++it;
        } else {
            // Remove expired projectile
            if (proj) {
                printf("Projectile expired\\n");
                projectile_pool.destroy(*it);
            }
            it = projectiles.erase(it);
        }
    }
    
    // Stack allocator for temporary objects
    printf("\\n--- Stack allocator ---\\n");
    StackAllocator<4096> stack;
    
    auto marker = stack.get_marker();
    
    // Allocate some temporary objects
    float* temp_array = static_cast<float*>(stack.allocate(10 * sizeof(float)));
    if (temp_array) {
        for (int i = 0; i < 10; ++i) {
            temp_array[i] = i * 0.5f;
        }
        printf("Created temporary array\\n");
    }
    
    printf("Stack usage: %zu/%zu bytes (%.1f%%)\\n", 
           stack.bytes_used(), 4096, stack.utilization() * 100);
    
    // Rewind stack
    stack.rewind_to_marker(marker);
    printf("After rewind: %zu bytes used\\n", stack.bytes_used());
    
    // Clean up
    for (Enemy* enemy : enemies) {
        enemy_pool.destroy(enemy);
    }
    
    printf("\\nFinal statistics:\\n");
    enemy_pool.print_statistics();
    projectile_pool.print_statistics();
}

} // namespace memory_pools`
    },
    
    'performance-optimization': {
      title: state.language === 'en' ? 'Performance-Critical Pointer Usage' : 'Uso de Punteros Crítico para Rendimiento',
      code: `#include <memory>
#include <vector>
#include <array>
#include <chrono>
#include <algorithm>
#include <numeric>
#include <immintrin.h> // For SIMD intrinsics
#include <prefetch.h>  // Platform-specific prefetch

// Performance-critical pointer patterns for game engines
namespace performance_optimization {

// Cache-aware data structures
template<typename T, size_t CacheLineSize = 64>
class CacheAlignedVector {
private:
    static constexpr size_t elements_per_cache_line = CacheLineSize / sizeof(T);
    static constexpr size_t alignment = CacheLineSize;
    
    struct alignas(alignment) CacheLine {
        T data[elements_per_cache_line];
    };
    
    std::vector<CacheLine> cache_lines_;
    size_t size_ = 0;
    
public:
    CacheAlignedVector() = default;
    
    explicit CacheAlignedVector(size_t initial_size) {
        resize(initial_size);
    }
    
    void resize(size_t new_size) {
        size_t required_lines = (new_size + elements_per_cache_line - 1) / elements_per_cache_line;
        cache_lines_.resize(required_lines);
        size_ = new_size;
    }
    
    void reserve(size_t capacity) {
        size_t required_lines = (capacity + elements_per_cache_line - 1) / elements_per_cache_line;
        cache_lines_.reserve(required_lines);
    }
    
    T& operator[](size_t index) {
        size_t line = index / elements_per_cache_line;
        size_t offset = index % elements_per_cache_line;
        return cache_lines_[line].data[offset];
    }
    
    const T& operator[](size_t index) const {
        size_t line = index / elements_per_cache_line;
        size_t offset = index % elements_per_cache_line;
        return cache_lines_[line].data[offset];
    }
    
    T* data() {
        return cache_lines_.empty() ? nullptr : &cache_lines_[0].data[0];
    }
    
    const T* data() const {
        return cache_lines_.empty() ? nullptr : &cache_lines_[0].data[0];
    }
    
    size_t size() const { return size_; }
    bool empty() const { return size_ == 0; }
    
    // Iterator support for range-based loops
    T* begin() { return data(); }
    T* end() { return data() + size_; }
    const T* begin() const { return data(); }
    const T* end() const { return data() + size_; }
    
    // Memory prefetch hint for next access
    void prefetch_next(size_t current_index, int hint = 3) const {
        if (current_index + 1 < size_) {
            size_t next_line = (current_index + 1) / elements_per_cache_line;
            _mm_prefetch(reinterpret_cast<const char*>(&cache_lines_[next_line]), hint);
        }
    }
};

// Structure of Arrays (SoA) for better cache utilization
template<size_t MaxEntities>
class TransformSoA {
private:
    CacheAlignedVector<float> x_coords_;
    CacheAlignedVector<float> y_coords_;
    CacheAlignedVector<float> z_coords_;
    CacheAlignedVector<float> rotations_;
    size_t size_ = 0;
    
public:
    TransformSoA() {
        x_coords_.resize(MaxEntities);
        y_coords_.resize(MaxEntities);
        z_coords_.resize(MaxEntities);
        rotations_.resize(MaxEntities);
    }
    
    void add_transform(float x, float y, float z, float rotation) {
        if (size_ < MaxEntities) {
            x_coords_[size_] = x;
            y_coords_[size_] = y;
            z_coords_[size_] = z;
            rotations_[size_] = rotation;
            ++size_;
        }
    }
    
    void remove_transform(size_t index) {
        if (index < size_) {
            // Swap with last element
            --size_;
            if (index != size_) {
                x_coords_[index] = x_coords_[size_];
                y_coords_[index] = y_coords_[size_];
                z_coords_[index] = z_coords_[size_];
                rotations_[index] = rotations_[size_];
            }
        }
    }
    
    // SIMD-optimized batch operations
    void translate_all(float dx, float dy, float dz) {
        const size_t simd_count = size_ & ~3; // Process in groups of 4
        
        // SIMD processing
        __m128 dx_vec = _mm_set1_ps(dx);
        __m128 dy_vec = _mm_set1_ps(dy);
        __m128 dz_vec = _mm_set1_ps(dz);
        
        for (size_t i = 0; i < simd_count; i += 4) {
            // Prefetch next cache line
            x_coords_.prefetch_next(i + 4);
            y_coords_.prefetch_next(i + 4);
            z_coords_.prefetch_next(i + 4);
            
            // Load current values
            __m128 x_vals = _mm_load_ps(&x_coords_[i]);
            __m128 y_vals = _mm_load_ps(&y_coords_[i]);
            __m128 z_vals = _mm_load_ps(&z_coords_[i]);
            
            // Add deltas
            x_vals = _mm_add_ps(x_vals, dx_vec);
            y_vals = _mm_add_ps(y_vals, dy_vec);
            z_vals = _mm_add_ps(z_vals, dz_vec);
            
            // Store results
            _mm_store_ps(&x_coords_[i], x_vals);
            _mm_store_ps(&y_coords_[i], y_vals);
            _mm_store_ps(&z_coords_[i], z_vals);
        }
        
        // Handle remaining elements
        for (size_t i = simd_count; i < size_; ++i) {
            x_coords_[i] += dx;
            y_coords_[i] += dy;
            z_coords_[i] += dz;
        }
    }
    
    void rotate_all(float angle) {
        for (size_t i = 0; i < size_; ++i) {
            rotations_[i] += angle;
        }
    }
    
    // Data access
    float* x_data() { return x_coords_.data(); }
    float* y_data() { return y_coords_.data(); }
    float* z_data() { return z_coords_.data(); }
    float* rotation_data() { return rotations_.data(); }
    
    const float* x_data() const { return x_coords_.data(); }
    const float* y_data() const { return y_coords_.data(); }
    const float* z_data() const { return z_coords_.data(); }
    const float* rotation_data() const { return rotations_.data(); }
    
    size_t size() const { return size_; }
    
    // Individual element access (less efficient)
    void get_transform(size_t index, float& x, float& y, float& z, float& rotation) const {
        if (index < size_) {
            x = x_coords_[index];
            y = y_coords_[index];
            z = z_coords_[index];
            rotation = rotations_[index];
        }
    }
    
    void set_transform(size_t index, float x, float y, float z, float rotation) {
        if (index < size_) {
            x_coords_[index] = x;
            y_coords_[index] = y;
            z_coords_[index] = z;
            rotations_[index] = rotation;
        }
    }
};

// Pointer-stable vector that doesn't invalidate pointers on growth
template<typename T, size_t ChunkSize = 256>
class StableVector {
private:
    struct Chunk {
        alignas(T) char data[sizeof(T) * ChunkSize];
        std::array<bool, ChunkSize> used;
        size_t count = 0;
        
        T* get(size_t index) {
            return reinterpret_cast<T*>(&data[index * sizeof(T)]);
        }
        
        const T* get(size_t index) const {
            return reinterpret_cast<const T*>(&data[index * sizeof(T)]);
        }
    };
    
    std::vector<std::unique_ptr<Chunk>> chunks_;
    std::vector<std::pair<size_t, size_t>> free_slots_; // {chunk_index, slot_index}
    size_t total_size_ = 0;
    
    std::pair<size_t, size_t> find_free_slot() {
        if (!free_slots_.empty()) {
            auto slot = free_slots_.back();
            free_slots_.pop_back();
            return slot;
        }
        
        // Find a chunk with available space
        for (size_t chunk_idx = 0; chunk_idx < chunks_.size(); ++chunk_idx) {
            auto& chunk = chunks_[chunk_idx];
            if (chunk->count < ChunkSize) {
                for (size_t slot_idx = 0; slot_idx < ChunkSize; ++slot_idx) {
                    if (!chunk->used[slot_idx]) {
                        return {chunk_idx, slot_idx};
                    }
                }
            }
        }
        
        // Need a new chunk
        chunks_.push_back(std::make_unique<Chunk>());
        return {chunks_.size() - 1, 0};
    }
    
public:
    template<typename... Args>
    T* emplace(Args&&... args) {
        auto [chunk_idx, slot_idx] = find_free_slot();
        
        auto& chunk = chunks_[chunk_idx];
        T* slot = chunk->get(slot_idx);
        
        new(slot) T(std::forward<Args>(args)...);
        chunk->used[slot_idx] = true;
        ++chunk->count;
        ++total_size_;
        
        return slot;
    }
    
    bool erase(T* ptr) {
        if (!ptr) return false;
        
        // Find which chunk contains this pointer
        for (size_t chunk_idx = 0; chunk_idx < chunks_.size(); ++chunk_idx) {
            auto& chunk = chunks_[chunk_idx];
            char* chunk_start = chunk->data;
            char* chunk_end = chunk_start + sizeof(chunk->data);
            
            if (ptr >= reinterpret_cast<T*>(chunk_start) && 
                ptr < reinterpret_cast<T*>(chunk_end)) {
                
                size_t slot_idx = (reinterpret_cast<char*>(ptr) - chunk_start) / sizeof(T);
                
                if (slot_idx < ChunkSize && chunk->used[slot_idx]) {
                    ptr->~T();
                    chunk->used[slot_idx] = false;
                    --chunk->count;
                    --total_size_;
                    
                    free_slots_.emplace_back(chunk_idx, slot_idx);
                    return true;
                }
                break;
            }
        }
        
        return false;
    }
    
    size_t size() const { return total_size_; }
    bool empty() const { return total_size_ == 0; }
    
    // Iterate over all active elements
    void for_each(std::function<void(T&)> func) {
        for (auto& chunk : chunks_) {
            for (size_t i = 0; i < ChunkSize; ++i) {
                if (chunk->used[i]) {
                    func(*chunk->get(i));
                }
            }
        }
    }
    
    void for_each(std::function<void(const T&)> func) const {
        for (const auto& chunk : chunks_) {
            for (size_t i = 0; i < ChunkSize; ++i) {
                if (chunk->used[i]) {
                    func(*chunk->get(i));
                }
            }
        }
    }
};

// Memory-mapped circular buffer for high-frequency updates
template<typename T, size_t Capacity>
class CircularBuffer {
private:
    alignas(64) T buffer_[Capacity];
    size_t head_ = 0;
    size_t tail_ = 0;
    bool full_ = false;
    
public:
    bool push(const T& item) {
        if (full_) {
            return false;
        }
        
        buffer_[head_] = item;
        head_ = (head_ + 1) % Capacity;
        
        if (head_ == tail_) {
            full_ = true;
        }
        
        return true;
    }
    
    bool push(T&& item) {
        if (full_) {
            return false;
        }
        
        buffer_[head_] = std::move(item);
        head_ = (head_ + 1) % Capacity;
        
        if (head_ == tail_) {
            full_ = true;
        }
        
        return true;
    }
    
    bool pop(T& item) {
        if (empty()) {
            return false;
        }
        
        item = std::move(buffer_[tail_]);
        tail_ = (tail_ + 1) % Capacity;
        full_ = false;
        
        return true;
    }
    
    const T* peek() const {
        return empty() ? nullptr : &buffer_[tail_];
    }
    
    bool empty() const {
        return !full_ && (head_ == tail_);
    }
    
    bool full() const {
        return full_;
    }
    
    size_t size() const {
        if (full_) return Capacity;
        return (head_ >= tail_) ? (head_ - tail_) : (Capacity + head_ - tail_);
    }
    
    void clear() {
        head_ = tail_ = 0;
        full_ = false;
    }
    
    // Batch operations for better cache utilization
    size_t push_batch(const T* items, size_t count) {
        size_t pushed = 0;
        for (size_t i = 0; i < count && !full_; ++i) {
            if (push(items[i])) {
                ++pushed;
            }
        }
        return pushed;
    }
    
    size_t pop_batch(T* items, size_t max_count) {
        size_t popped = 0;
        for (size_t i = 0; i < max_count && !empty(); ++i) {
            if (pop(items[i])) {
                ++popped;
            }
        }
        return popped;
    }
};

// Performance measurement utilities
class PerformanceProfiler {
private:
    std::chrono::high_resolution_clock::time_point start_time_;
    const char* operation_name_;
    
public:
    explicit PerformanceProfiler(const char* name) 
        : operation_name_(name), start_time_(std::chrono::high_resolution_clock::now()) {}
    
    ~PerformanceProfiler() {
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(
            end_time - start_time_);
        
        printf("%s took %ld microseconds\\n", operation_name_, duration.count());
    }
    
    // Manual timing control
    void restart() {
        start_time_ = std::chrono::high_resolution_clock::now();
    }
    
    long get_elapsed_microseconds() const {
        auto now = std::chrono::high_resolution_clock::now();
        return std::chrono::duration_cast<std::chrono::microseconds>(
            now - start_time_).count();
    }
};

#define PROFILE(name) PerformanceProfiler __prof__(name)

// Example game entities for performance testing
struct Entity {
    float x, y, z;
    float vx, vy, vz;
    float health;
    int type_id;
    
    Entity(float x = 0, float y = 0, float z = 0) 
        : x(x), y(y), z(z), vx(0), vy(0), vz(0), health(100), type_id(0) {}
    
    void update(float dt) {
        x += vx * dt;
        y += vy * dt;
        z += vz * dt;
    }
};

// Performance comparison tests
void performance_comparison_tests() {
    printf("=== Performance Optimization Tests ===\\n");
    
    constexpr size_t ENTITY_COUNT = 100000;
    constexpr size_t ITERATIONS = 1000;
    
    // Test 1: Array of Structures vs Structure of Arrays
    printf("\\n--- AoS vs SoA Performance Test ---\\n");
    
    // Array of Structures (traditional approach)
    {
        PROFILE("AoS allocation");
        std::vector<Entity> entities(ENTITY_COUNT);
        for (size_t i = 0; i < ENTITY_COUNT; ++i) {
            entities[i] = Entity(i * 0.1f, i * 0.2f, i * 0.3f);
        }
    }
    
    std::vector<Entity> entities(ENTITY_COUNT);
    for (size_t i = 0; i < ENTITY_COUNT; ++i) {
        entities[i] = Entity(i * 0.1f, i * 0.2f, i * 0.3f);
        entities[i].vx = 1.0f;
        entities[i].vy = 0.5f;
        entities[i].vz = 0.2f;
    }
    
    {
        PROFILE("AoS update");
        for (size_t iter = 0; iter < ITERATIONS; ++iter) {
            for (auto& entity : entities) {
                entity.update(0.016f);
            }
        }
    }
    
    // Structure of Arrays (cache-friendly approach)
    {
        PROFILE("SoA allocation");
        TransformSoA<ENTITY_COUNT> transform_soa;
        for (size_t i = 0; i < ENTITY_COUNT; ++i) {
            transform_soa.add_transform(i * 0.1f, i * 0.2f, i * 0.3f, 0.0f);
        }
    }
    
    TransformSoA<ENTITY_COUNT> transform_soa;
    for (size_t i = 0; i < ENTITY_COUNT; ++i) {
        transform_soa.add_transform(i * 0.1f, i * 0.2f, i * 0.3f, 0.0f);
    }
    
    {
        PROFILE("SoA SIMD update");
        for (size_t iter = 0; iter < ITERATIONS; ++iter) {
            transform_soa.translate_all(1.0f * 0.016f, 0.5f * 0.016f, 0.2f * 0.016f);
        }
    }
    
    // Test 2: Cache-aligned vs regular vector
    printf("\\n--- Cache Alignment Test ---\\n");
    
    {
        PROFILE("Regular vector allocation");
        std::vector<float> regular_vec(ENTITY_COUNT * 4);
        std::iota(regular_vec.begin(), regular_vec.end(), 0.0f);
    }
    
    {
        PROFILE("Cache-aligned vector allocation");
        CacheAlignedVector<float> aligned_vec(ENTITY_COUNT * 4);
        for (size_t i = 0; i < ENTITY_COUNT * 4; ++i) {
            aligned_vec[i] = static_cast<float>(i);
        }
    }
    
    // Test 3: Pointer stability
    printf("\\n--- Pointer Stability Test ---\\n");
    
    {
        PROFILE("Regular vector with pointer instability");
        std::vector<Entity> unstable_vec;
        unstable_vec.reserve(1000);
        
        std::vector<Entity*> pointers;
        for (int i = 0; i < 1000; ++i) {
            unstable_vec.emplace_back(i, i, i);
            pointers.push_back(&unstable_vec.back());
        }
        
        // Force reallocation
        for (int i = 0; i < 1000; ++i) {
            unstable_vec.emplace_back(i + 1000, i + 1000, i + 1000);
        }
    }
    
    {
        PROFILE("Stable vector");
        StableVector<Entity> stable_vec;
        
        std::vector<Entity*> pointers;
        for (int i = 0; i < 2000; ++i) {
            Entity* entity = stable_vec.emplace(i, i, i);
            pointers.push_back(entity);
        }
        
        // Pointers remain valid - test access
        for (Entity* ptr : pointers) {
            ptr->health += 1.0f; // All pointers still valid
        }
    }
    
    // Test 4: Circular buffer performance
    printf("\\n--- Circular Buffer Test ---\\n");
    
    CircularBuffer<Entity, 1024> circular_buffer;
    
    {
        PROFILE("Circular buffer operations");
        
        // Fill buffer
        for (int i = 0; i < 1024; ++i) {
            circular_buffer.push(Entity(i, i, i));
        }
        
        // Rapid push/pop cycles
        Entity temp;
        for (int cycle = 0; cycle < 10000; ++cycle) {
            circular_buffer.pop(temp);
            temp.x += 1.0f;
            circular_buffer.push(temp);
        }
    }
    
    printf("\\nPerformance test completed!\\n");
}

// Cache miss analysis helper
class CacheMissAnalyzer {
private:
    size_t cache_line_size_;
    
public:
    explicit CacheMissAnalyzer(size_t cache_line_size = 64) 
        : cache_line_size_(cache_line_size) {}
    
    template<typename T>
    void analyze_access_pattern(const T* data, size_t count, 
                               const std::vector<size_t>& access_indices) {
        std::set<size_t> accessed_cache_lines;
        size_t total_accesses = access_indices.size();
        
        for (size_t index : access_indices) {
            if (index < count) {
                size_t address = reinterpret_cast<uintptr_t>(&data[index]);
                size_t cache_line = address / cache_line_size_;
                accessed_cache_lines.insert(cache_line);
            }
        }
        
        size_t unique_cache_lines = accessed_cache_lines.size();
        double cache_efficiency = static_cast<double>(total_accesses) / unique_cache_lines;
        
        printf("Cache Analysis:\\n");
        printf("  Total accesses: %zu\\n", total_accesses);
        printf("  Unique cache lines: %zu\\n", unique_cache_lines);
        printf("  Cache efficiency: %.2f accesses per cache line\\n", cache_efficiency);
        printf("  Theoretical max efficiency: %.2f\\n", 
               static_cast<double>(cache_line_size_) / sizeof(T));
    }
};

} // namespace performance_optimization`
    }
  };

  const currentExample = examples[activeExample as keyof typeof examples];

  const handlePatternSelect = (pattern: string) => {
    setSelectedPattern(pattern);
    
    // Update metrics based on selected pattern
    const patternMetrics: { [key: string]: GameEngineMetrics } = {
      'Components': { componentSystemEfficiency: 0.95, memoryPoolUtilization: 0.80, ecsPerformance: 0.88, pointerOptimization: 0.85 },
      'ECS Core': { componentSystemEfficiency: 0.92, memoryPoolUtilization: 0.85, ecsPerformance: 0.95, pointerOptimization: 0.90 },
      'Memory Pool': { componentSystemEfficiency: 0.80, memoryPoolUtilization: 0.95, ecsPerformance: 0.85, pointerOptimization: 0.88 },
      'Ptr Cache': { componentSystemEfficiency: 0.88, memoryPoolUtilization: 0.88, ecsPerformance: 0.82, pointerOptimization: 0.95 },
      'Systems': { componentSystemEfficiency: 0.90, memoryPoolUtilization: 0.82, ecsPerformance: 0.90, pointerOptimization: 0.87 },
      'Entities': { componentSystemEfficiency: 0.85, memoryPoolUtilization: 0.85, ecsPerformance: 0.93, pointerOptimization: 0.80 },
      'Resources': { componentSystemEfficiency: 0.82, memoryPoolUtilization: 0.90, ecsPerformance: 0.85, pointerOptimization: 0.85 }
    };
    
    if (patternMetrics[pattern]) {
      setMetrics(patternMetrics[pattern]);
    }
  };

  return (
    <div className="lesson-container">
      <header className="lesson-header">
        <h1>{state.language === 'en' ? 'Lesson 116: Game Engine Architecture' : 'Lección 116: Arquitectura de Motor de Juegos'}</h1>
        <p className="lesson-description">
          {state.language === 'en' 
            ? 'Master game engine architecture patterns including component systems with pointers, Entity-Component-System (ECS) patterns, memory pools for game objects, and performance-critical pointer usage techniques.'
            : 'Domina patrones de arquitectura de motores de juegos incluyendo sistemas de componentes con punteros, patrones Entity-Component-System (ECS), pools de memoria para objetos de juego y técnicas de uso de punteros críticos para el rendimiento.'}
        </p>
      </header>

      <div className="lesson-content">
        <div className="visualization-section">
          <h3>{state.language === 'en' ? 'Game Engine Architecture Visualization' : 'Visualización de Arquitectura del Motor de Juegos'}</h3>
          <div className="canvas-container" style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '20px' }}>
            <Canvas camera={{ position: [8, 5, 8] }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />
              <GameEngineVisualization 
                metrics={metrics}
                activePattern={selectedPattern}
                onPatternSelect={handlePatternSelect}
              />
            </Canvas>
          </div>
          
          <div className="pattern-info">
            <h4>{state.language === 'en' ? 'Game Engine Metrics' : 'Métricas del Motor de Juegos'}</h4>
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Component System Efficiency' : 'Eficiencia Sistema Componentes'}:</span>
                <span className="metric-value">{(metrics.componentSystemEfficiency * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Memory Pool Utilization' : 'Utilización Pool de Memoria'}:</span>
                <span className="metric-value">{(metrics.memoryPoolUtilization * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'ECS Performance' : 'Rendimiento ECS'}:</span>
                <span className="metric-value">{(metrics.ecsPerformance * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Pointer Optimization' : 'Optimización Punteros'}:</span>
                <span className="metric-value">{(metrics.pointerOptimization * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="selected-pattern">
              <strong>{state.language === 'en' ? 'Selected Pattern:' : 'Patrón Seleccionado:'}</strong> {selectedPattern}
            </div>
          </div>
        </div>

        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Game Engine Architecture Examples' : 'Ejemplos de Arquitectura del Motor de Juegos'}</h3>
          
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
              <h4>{state.language === 'en' ? 'Component Systems with Pointers' : 'Sistemas de Componentes con Punteros'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Type-safe component management with CRTP patterns' : 'Gestión de componentes type-safe con patrones CRTP'}</li>
                <li>{state.language === 'en' ? 'Optimized component pools for cache-friendly access' : 'Pools de componentes optimizados para acceso cache-friendly'}</li>
                <li>{state.language === 'en' ? 'Component storage with efficient pointer management' : 'Almacenamiento de componentes con gestión eficiente de punteros'}</li>
                <li>{state.language === 'en' ? 'Factory patterns for game object creation' : 'Patrones factory para creación de objetos de juego'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Entity-Component-System (ECS) Patterns' : 'Patrones Entity-Component-System (ECS)'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Dense component arrays for optimal cache utilization' : 'Arrays densos de componentes para utilización óptima del cache'}</li>
                <li>{state.language === 'en' ? 'Component signatures using bitsets for fast queries' : 'Firmas de componentes usando bitsets para consultas rápidas'}</li>
                <li>{state.language === 'en' ? 'System-based processing with entity filtering' : 'Procesamiento basado en sistemas con filtrado de entidades'}</li>
                <li>{state.language === 'en' ? 'ECS coordinator for unified entity management' : 'Coordinador ECS para gestión unificada de entidades'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Memory Pools for Game Objects' : 'Pools de Memoria para Objetos de Juego'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Fixed-size allocators for predictable performance' : 'Asignadores de tamaño fijo para rendimiento predecible'}</li>
                <li>{state.language === 'en' ? 'Object recycling with generational handles' : 'Reciclaje de objetos con handles generacionales'}</li>
                <li>{state.language === 'en' ? 'Stack allocators for temporary game objects' : 'Asignadores de stack para objetos temporales de juego'}</li>
                <li>{state.language === 'en' ? 'Multi-size pools for varied object types' : 'Pools de múltiples tamaños para tipos de objetos variados'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Performance-Critical Pointer Usage' : 'Uso de Punteros Crítico para Rendimiento'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Structure of Arrays (SoA) for SIMD optimization' : 'Structure of Arrays (SoA) para optimización SIMD'}</li>
                <li>{state.language === 'en' ? 'Cache-aligned data structures and prefetching' : 'Estructuras de datos alineadas al cache y prefetch'}</li>
                <li>{state.language === 'en' ? 'Pointer-stable containers for long-lived references' : 'Contenedores estables de punteros para referencias duraderas'}</li>
                <li>{state.language === 'en' ? 'Performance profiling and cache miss analysis' : 'Perfilado de rendimiento y análisis de cache miss'}</li>
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
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

        .selected-pattern {
          margin-top: 15px;
          padding: 10px;
          background: #e8f4fd;
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

export default Lesson116_GameEngineArchitecture;