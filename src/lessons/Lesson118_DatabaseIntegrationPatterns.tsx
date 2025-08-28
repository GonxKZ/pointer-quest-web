import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone, Line } from '@react-three/drei';
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



interface DatabaseMetrics {
  ormEfficiency: number;
  connectionPoolUtilization: number;
  resultSetOptimization: number;
  transactionPerformance: number;
}

interface DatabaseVisualizationProps {
  metrics: DatabaseMetrics;
  activePattern: string;
  onPatternSelect: (pattern: string) => void;
}

const DatabaseVisualization: React.FC<DatabaseVisualizationProps> = ({ 
  metrics, 
  activePattern, 
  onPatternSelect 
}) => {
  const groupRef = useRef<any>();
  const ormRef = useRef<any>();
  const poolRef = useRef<any>();
  const transactionRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
    if (ormRef.current) {
      // Animate ORM layer
      const time = state.clock.elapsedTime;
      ormRef.current.children.forEach((child: any, index: number) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = 0.5 + 0.5 * Math.sin(time * 1.5 + index * 0.6);
        }
      });
    }
    if (poolRef.current) {
      // Animate connection pool
      const time = state.clock.elapsedTime;
      poolRef.current.position.y = Math.sin(time * 0.8) * 0.2;
    }
    if (transactionRef.current) {
      // Animate transaction boundaries
      transactionRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2) * 0.15;
    }
  });

  const databaseComponents = [
    { name: 'ORM Layer', position: [-4, 2, 0], color: '#e74c3c', efficiency: metrics.ormEfficiency },
    { name: 'Connection Pool', position: [-1, 2, 0], color: '#3498db', efficiency: metrics.connectionPoolUtilization },
    { name: 'Result Sets', position: [2, 2, 0], color: '#2ecc71', efficiency: metrics.resultSetOptimization },
    { name: 'Transactions', position: [5, 2, 0], color: '#f39c12', efficiency: metrics.transactionPerformance },
  ];

  return (
    <group ref={groupRef}>
      {/* Database Architecture Base */}
      <Box args={[12, 0.3, 8]} position={[0, -1.5, 0]}>
        <meshStandardMaterial color="#2c3e50" transparent opacity={0.8} />
      </Box>

      {/* ORM Layer Visualization */}
      <group ref={ormRef} position={[-3, 0, 0]}>
        {[...Array(5)].map((_, i) => (
          <Box 
            key={`orm-${i}`}
            args={[0.6, 0.6, 0.6]} 
            position={[i * 0.7, 0, 0]}
            onClick={() => onPatternSelect('ORM Layer')}
          >
            <meshStandardMaterial 
              color={activePattern === 'ORM Layer' ? '#e74c3c' : '#95a5a6'} 
              transparent 
              opacity={0.8}
            />
          </Box>
        ))}
      </group>

      {/* Connection Pool */}
      <group ref={poolRef} position={[0, 0, 2]}>
        <Cylinder args={[1, 1, 2]} onClick={() => onPatternSelect('Connection Pool')}>
          <meshStandardMaterial 
            color={activePattern === 'Connection Pool' ? '#3498db' : '#7f8c8d'} 
            transparent 
            opacity={0.7}
          />
        </Cylinder>
        {/* Connection threads */}
        {[...Array(8)].map((_, i) => (
          <Cylinder 
            key={`connection-${i}`}
            args={[0.05, 0.05, 1.5]} 
            position={[
              Math.cos(i * Math.PI / 4) * 1.2,
              0,
              Math.sin(i * Math.PI / 4) * 1.2
            ]}
            rotation={[Math.PI / 2, 0, i * Math.PI / 4]}
          >
            <meshStandardMaterial color="#3498db" />
          </Cylinder>
        ))}
      </group>

      {/* Result Set Management */}
      <group position={[3, 0, 0]}>
        {[...Array(4)].map((_, i) => (
          <Box 
            key={`result-${i}`}
            args={[1, 0.2, 1]} 
            position={[0, i * 0.3, 0]}
            onClick={() => onPatternSelect('Result Sets')}
          >
            <meshStandardMaterial 
              color={activePattern === 'Result Sets' ? '#2ecc71' : '#95a5a6'} 
              transparent 
              opacity={0.6 + i * 0.1}
            />
          </Box>
        ))}
      </group>

      {/* Transaction Boundaries */}
      <group ref={transactionRef} position={[0, 0, -2]}>
        <Sphere args={[0.8]} onClick={() => onPatternSelect('Transactions')}>
          <meshStandardMaterial 
            color={activePattern === 'Transactions' ? '#f39c12' : '#bdc3c7'} 
            transparent 
            opacity={0.6}
            wireframe
          />
        </Sphere>
        {/* ACID properties visualization */}
        {['A', 'C', 'I', 'D'].map((letter, index) => (
          <Text
            key={letter}
            position={[
              Math.cos(index * Math.PI / 2) * 1.2,
              Math.sin(index * Math.PI / 2) * 1.2,
              0
            ]}
            fontSize={0.3}
            color="#f39c12"
            anchorX="center"
            anchorY="middle"
          >
            {letter}
          </Text>
        ))}
      </group>

      {/* Database Component Labels */}
      {databaseComponents.map((comp, index) => (
        <group key={comp.name} position={comp.position}>
          <Sphere args={[0.3]} onClick={() => onPatternSelect(comp.name)}>
            <meshStandardMaterial 
              color={activePattern === comp.name ? comp.color : '#bdc3c7'} 
              transparent 
              opacity={0.9}
            />
          </Sphere>
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.15}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            {comp.name}
          </Text>
        </group>
      ))}

      {/* Performance Indicators */}
      {databaseComponents.map((comp, index) => (
        <Box
          key={`indicator-${index}`}
          args={[0.08, comp.efficiency * 2.5, 0.08]}
          position={[comp.position[0], comp.efficiency * 1.25 - 1.5, comp.position[2] - 2]}
        >
          <meshStandardMaterial color={comp.color} />
        </Box>
      ))}

      {/* Data Flow Lines */}
      {[
        [[-4, 2, 0], [-1, 2, 0]],
        [[-1, 2, 0], [2, 2, 0]],
        [[2, 2, 0], [5, 2, 0]],
      ].map((line, index) => (
        <Line
          key={`dataflow-${index}`}
          points={line}
          color="#34495e"
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      ))}
    </group>
  );
};

const Lesson118_DatabaseIntegrationPatterns: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('orm-patterns');
  const [selectedPattern, setSelectedPattern] = useState<string>('ORM Layer');
  const [metrics, setMetrics] = useState<DatabaseMetrics>({
    ormEfficiency: 0.89,
    connectionPoolUtilization: 0.92,
    resultSetOptimization: 0.87,
    transactionPerformance: 0.94
  });

  const examples = {
    'orm-patterns': {
      title: state.language === 'en' ? 'ORM with Smart Pointers' : 'ORM con Smart Pointers',
      code: `#include <memory>
#include <vector>
#include <unordered_map>
#include <string>
#include <functional>
#include <optional>
#include <variant>
#include <typeindex>
#include <type_traits>
#include <concepts>

namespace DatabaseORM {

// Base class for all database entities
class Entity {
public:
    using Id = uint64_t;
    
    Entity() = default;
    virtual ~Entity() = default;
    
    Entity(const Entity&) = delete;
    Entity& operator=(const Entity&) = delete;
    
    Entity(Entity&&) = default;
    Entity& operator=(Entity&&) = default;
    
    Id get_id() const noexcept { return id_; }
    void set_id(Id id) noexcept { id_ = id; }
    
    bool is_dirty() const noexcept { return dirty_; }
    void mark_clean() noexcept { dirty_ = false; }
    void mark_dirty() noexcept { dirty_ = true; }
    
    virtual std::type_index get_type_index() const = 0;

protected:
    void set_dirty() noexcept { dirty_ = true; }

private:
    Id id_ = 0;
    bool dirty_ = false;
};

// Smart pointer types for entities
template<typename T>
using EntityPtr = std::shared_ptr<T>;

template<typename T>
using EntityWeakPtr = std::weak_ptr<T>;

template<typename T>
using EntityUniquePtr = std::unique_ptr<T>;

// Entity factory with memory management
template<typename T>
concept DatabaseEntity = std::derived_from<T, Entity>;

template<DatabaseEntity T>
class EntityFactory {
private:
    std::vector<std::weak_ptr<T>> entity_pool_;
    mutable std::mutex pool_mutex_;
    
public:
    template<typename... Args>
    EntityPtr<T> create(Args&&... args) {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        // Try to reuse expired entities from pool
        auto it = std::find_if(entity_pool_.begin(), entity_pool_.end(),
            [](const std::weak_ptr<T>& weak_ptr) {
                return weak_ptr.expired();
            });
            
        if (it != entity_pool_.end()) {
            entity_pool_.erase(it);
        }
        
        // Create new entity with shared ownership
        auto entity = std::make_shared<T>(std::forward<Args>(args)...);
        entity_pool_.emplace_back(entity);
        
        return entity;
    }
    
    size_t pool_size() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return entity_pool_.size();
    }
    
    size_t active_entities() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return std::count_if(entity_pool_.begin(), entity_pool_.end(),
            [](const std::weak_ptr<T>& weak_ptr) {
                return !weak_ptr.expired();
            });
    }
};

// Repository pattern with smart pointer management
template<DatabaseEntity T>
class Repository {
public:
    using EntityId = Entity::Id;
    using EntityCache = std::unordered_map<EntityId, EntityWeakPtr<T>>;
    
private:
    mutable EntityCache cache_;
    mutable std::shared_mutex cache_mutex_;
    EntityFactory<T> factory_;
    
    // Database connection interface (simplified)
    struct DatabaseConnection {
        // Simplified database operations
        std::optional<std::string> find_by_id(EntityId id) const { return std::nullopt; }
        bool save(const T& entity) const { return true; }
        bool remove(EntityId id) const { return true; }
        std::vector<std::string> find_all() const { return {}; }
    } db_;
    
public:
    // Find entity by ID with caching
    EntityPtr<T> find_by_id(EntityId id) const {
        // First check cache
        {
            std::shared_lock<std::shared_mutex> lock(cache_mutex_);
            auto it = cache_.find(id);
            if (it != cache_.end()) {
                if (auto entity = it->second.lock()) {
                    return entity; // Cache hit
                }
                // Remove expired weak pointer
                cache_.erase(it);
            }
        }
        
        // Load from database
        auto data = db_.find_by_id(id);
        if (!data) {
            return nullptr; // Not found
        }
        
        // Create entity from database data
        auto entity = factory_.create();
        entity->set_id(id);
        // Deserialize data into entity...
        entity->mark_clean();
        
        // Cache the entity
        {
            std::unique_lock<std::shared_mutex> lock(cache_mutex_);
            cache_[id] = entity;
        }
        
        return entity;
    }
    
    // Save entity with dirty tracking
    bool save(EntityPtr<T> entity) {
        if (!entity) return false;
        
        if (!entity->is_dirty()) {
            return true; // Nothing to save
        }
        
        bool success = db_.save(*entity);
        if (success) {
            entity->mark_clean();
            
            // Update cache
            std::unique_lock<std::shared_mutex> lock(cache_mutex_);
            cache_[entity->get_id()] = entity;
        }
        
        return success;
    }
    
    // Remove entity with cache invalidation
    bool remove(EntityId id) {
        bool success = db_.remove(id);
        if (success) {
            std::unique_lock<std::shared_mutex> lock(cache_mutex_);
            cache_.erase(id);
        }
        return success;
    }
    
    // Load all entities with efficient memory management
    std::vector<EntityPtr<T>> find_all() const {
        auto data_list = db_.find_all();
        std::vector<EntityPtr<T>> entities;
        entities.reserve(data_list.size());
        
        for (const auto& data : data_list) {
            // Extract ID from data and check cache first
            EntityId id = extract_id_from_data(data);
            
            auto entity = find_by_id(id);
            if (!entity) {
                // Create new entity if not cached
                entity = factory_.create();
                entity->set_id(id);
                // Deserialize data...
                entity->mark_clean();
            }
            
            entities.push_back(entity);
        }
        
        return entities;
    }
    
    // Cache management
    void clear_cache() {
        std::unique_lock<std::shared_mutex> lock(cache_mutex_);
        cache_.clear();
    }
    
    size_t cache_size() const {
        std::shared_lock<std::shared_mutex> lock(cache_mutex_);
        return cache_.size();
    }
    
    size_t active_cache_entries() const {
        std::shared_lock<std::shared_mutex> lock(cache_mutex_);
        return std::count_if(cache_.begin(), cache_.end(),
            [](const auto& pair) {
                return !pair.second.expired();
            });
    }

private:
    EntityId extract_id_from_data(const std::string& data) const {
        // Simplified ID extraction
        return std::hash<std::string>{}(data) % 10000;
    }
};

// Unit of Work pattern for transaction management
class UnitOfWork {
private:
    std::vector<std::shared_ptr<Entity>> new_entities_;
    std::vector<std::shared_ptr<Entity>> dirty_entities_;
    std::vector<Entity::Id> removed_entities_;
    std::unordered_map<std::type_index, std::unique_ptr<void, void(*)(void*)>> repositories_;
    
    bool in_transaction_ = false;
    
public:
    template<DatabaseEntity T>
    void register_repository(std::unique_ptr<Repository<T>> repo) {
        auto type_idx = std::type_index(typeid(T));
        repositories_[type_idx] = {
            repo.release(),
            [](void* ptr) { delete static_cast<Repository<T>*>(ptr); }
        };
    }
    
    template<DatabaseEntity T>
    Repository<T>* get_repository() {
        auto type_idx = std::type_index(typeid(T));
        auto it = repositories_.find(type_idx);
        if (it != repositories_.end()) {
            return static_cast<Repository<T>*>(it->second.get());
        }
        return nullptr;
    }
    
    // Register entity for insertion
    void register_new(std::shared_ptr<Entity> entity) {
        if (entity && !in_transaction_) {
            new_entities_.push_back(entity);
        }
    }
    
    // Register entity for update
    void register_dirty(std::shared_ptr<Entity> entity) {
        if (entity && entity->is_dirty() && !in_transaction_) {
            // Avoid duplicates
            auto it = std::find(dirty_entities_.begin(), dirty_entities_.end(), entity);
            if (it == dirty_entities_.end()) {
                dirty_entities_.push_back(entity);
            }
        }
    }
    
    // Register entity for deletion
    void register_removed(Entity::Id id) {
        if (!in_transaction_) {
            removed_entities_.push_back(id);
        }
    }
    
    // Commit all changes as a transaction
    bool commit() {
        if (in_transaction_) return false;
        
        in_transaction_ = true;
        
        try {
            // Begin database transaction (simplified)
            // db_.begin_transaction();
            
            // Insert new entities
            for (auto& entity : new_entities_) {
                // Get appropriate repository and save
                // This would require type erasure or visitor pattern
                // in a real implementation
            }
            
            // Update dirty entities
            for (auto& entity : dirty_entities_) {
                // Similar repository lookup and update
            }
            
            // Remove deleted entities
            for (auto id : removed_entities_) {
                // Repository lookup and deletion
            }
            
            // Commit database transaction
            // db_.commit_transaction();
            
            // Clear work lists
            new_entities_.clear();
            dirty_entities_.clear();
            removed_entities_.clear();
            
            in_transaction_ = false;
            return true;
            
        } catch (...) {
            // Rollback on any error
            // db_.rollback_transaction();
            in_transaction_ = false;
            return false;
        }
    }
    
    void rollback() {
        new_entities_.clear();
        dirty_entities_.clear();
        removed_entities_.clear();
        in_transaction_ = false;
    }
    
    size_t pending_operations() const {
        return new_entities_.size() + dirty_entities_.size() + removed_entities_.size();
    }
};

// Example entity implementation
class User : public Entity {
private:
    std::string name_;
    std::string email_;
    int age_ = 0;
    
public:
    User() = default;
    User(std::string name, std::string email, int age)
        : name_(std::move(name))
        , email_(std::move(email))
        , age_(age) {
        mark_dirty();
    }
    
    std::type_index get_type_index() const override {
        return std::type_index(typeid(User));
    }
    
    // Property accessors with dirty tracking
    const std::string& name() const noexcept { return name_; }
    void set_name(std::string name) {
        if (name_ != name) {
            name_ = std::move(name);
            set_dirty();
        }
    }
    
    const std::string& email() const noexcept { return email_; }
    void set_email(std::string email) {
        if (email_ != email) {
            email_ = std::move(email);
            set_dirty();
        }
    }
    
    int age() const noexcept { return age_; }
    void set_age(int age) {
        if (age_ != age) {
            age_ = age;
            set_dirty();
        }
    }
};

// ORM Session with comprehensive entity management
class ORMSession {
private:
    UnitOfWork unit_of_work_;
    std::unordered_map<Entity::Id, std::weak_ptr<Entity>> session_cache_;
    
public:
    ORMSession() {
        // Register repositories for known entity types
        auto user_repo = std::make_unique<Repository<User>>();
        unit_of_work_.register_repository(std::move(user_repo));
    }
    
    template<DatabaseEntity T, typename... Args>
    EntityPtr<T> create(Args&&... args) {
        auto entity = std::make_shared<T>(std::forward<Args>(args)...);
        unit_of_work_.register_new(entity);
        session_cache_[entity->get_id()] = entity;
        return entity;
    }
    
    template<DatabaseEntity T>
    EntityPtr<T> find(Entity::Id id) {
        // Check session cache first
        auto it = session_cache_.find(id);
        if (it != session_cache_.end()) {
            if (auto entity = it->second.lock()) {
                return std::static_pointer_cast<T>(entity);
            }
            session_cache_.erase(it);
        }
        
        // Load from repository
        auto repo = unit_of_work_.get_repository<T>();
        if (repo) {
            auto entity = repo->find_by_id(id);
            if (entity) {
                session_cache_[id] = entity;
            }
            return entity;
        }
        
        return nullptr;
    }
    
    template<DatabaseEntity T>
    bool save(EntityPtr<T> entity) {
        if (!entity) return false;
        
        if (entity->is_dirty()) {
            unit_of_work_.register_dirty(entity);
        }
        
        return true; // Actual save happens on commit
    }
    
    template<DatabaseEntity T>
    bool remove(EntityPtr<T> entity) {
        if (!entity) return false;
        
        unit_of_work_.register_removed(entity->get_id());
        session_cache_.erase(entity->get_id());
        
        return true;
    }
    
    bool commit() {
        return unit_of_work_.commit();
    }
    
    void rollback() {
        unit_of_work_.rollback();
        session_cache_.clear();
    }
    
    void flush() {
        // Force write dirty entities to database
        // but don't commit transaction
    }
    
    size_t cache_size() const {
        return session_cache_.size();
    }
    
    size_t pending_operations() const {
        return unit_of_work_.pending_operations();
    }
};

} // namespace DatabaseORM`,
      explanation: state.language === 'en' ? 
        'ORM with smart pointers provides automatic memory management, entity caching, dirty tracking, and transactional integrity. Smart pointers handle object lifecycle while maintaining referential integrity across database operations.' :
        'ORM con smart pointers proporciona gestión automática de memoria, caché de entidades, seguimiento de cambios e integridad transaccional. Los smart pointers manejan el ciclo de vida de objetos manteniendo integridad referencial en operaciones de base de datos.'
    },
    
    'connection-pooling': {
      title: state.language === 'en' ? 'Connection Pooling Architecture' : 'Arquitectura de Pool de Conexiones',
      code: `#include <memory>
#include <vector>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <atomic>
#include <thread>
#include <functional>
#include <future>
#include <exception>

namespace DatabaseConnections {

// Database connection interface
class DatabaseConnection {
public:
    enum class State {
        DISCONNECTED,
        CONNECTED,
        IN_USE,
        ERROR
    };
    
private:
    std::atomic<State> state_{State::DISCONNECTED};
    std::chrono::steady_clock::time_point last_used_;
    std::string connection_string_;
    uint32_t connection_id_;
    mutable std::mutex connection_mutex_;
    
public:
    explicit DatabaseConnection(uint32_t id, std::string conn_str)
        : connection_id_(id)
        , connection_string_(std::move(conn_str))
        , last_used_(std::chrono::steady_clock::now()) {}
        
    ~DatabaseConnection() {
        if (state_.load() == State::CONNECTED || state_.load() == State::IN_USE) {
            disconnect();
        }
    }
    
    // Non-copyable but movable
    DatabaseConnection(const DatabaseConnection&) = delete;
    DatabaseConnection& operator=(const DatabaseConnection&) = delete;
    
    DatabaseConnection(DatabaseConnection&& other) noexcept
        : state_(other.state_.load())
        , last_used_(other.last_used_)
        , connection_string_(std::move(other.connection_string_))
        , connection_id_(other.connection_id_) {
        other.state_.store(State::DISCONNECTED);
    }
    
    bool connect() {
        std::lock_guard<std::mutex> lock(connection_mutex_);
        if (state_.load() != State::DISCONNECTED) {
            return state_.load() == State::CONNECTED;
        }
        
        try {
            // Simulate connection logic
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
            state_.store(State::CONNECTED);
            last_used_ = std::chrono::steady_clock::now();
            return true;
        } catch (...) {
            state_.store(State::ERROR);
            return false;
        }
    }
    
    void disconnect() {
        std::lock_guard<std::mutex> lock(connection_mutex_);
        if (state_.load() != State::DISCONNECTED) {
            // Simulate disconnection
            state_.store(State::DISCONNECTED);
        }
    }
    
    bool is_healthy() const {
        auto state = state_.load();
        return state == State::CONNECTED || state == State::IN_USE;
    }
    
    bool acquire() {
        State expected = State::CONNECTED;
        if (state_.compare_exchange_strong(expected, State::IN_USE)) {
            last_used_ = std::chrono::steady_clock::now();
            return true;
        }
        return false;
    }
    
    void release() {
        State expected = State::IN_USE;
        if (state_.compare_exchange_strong(expected, State::CONNECTED)) {
            last_used_ = std::chrono::steady_clock::now();
        }
    }
    
    State get_state() const { return state_.load(); }
    uint32_t get_id() const { return connection_id_; }
    
    auto get_last_used() const {
        return last_used_;
    }
    
    // Simulate database operations
    template<typename T>
    std::future<T> execute_async(std::function<T()> operation) {
        return std::async(std::launch::async, [this, op = std::move(operation)]() -> T {
            if (state_.load() != State::IN_USE) {
                throw std::runtime_error("Connection not acquired");
            }
            
            // Simulate work
            std::this_thread::sleep_for(std::chrono::milliseconds(5));
            return op();
        });
    }
};

// RAII connection handle for automatic release
class ConnectionHandle {
private:
    std::shared_ptr<DatabaseConnection> connection_;
    bool released_ = false;
    
public:
    explicit ConnectionHandle(std::shared_ptr<DatabaseConnection> conn)
        : connection_(std::move(conn)) {}
        
    ~ConnectionHandle() {
        if (connection_ && !released_) {
            connection_->release();
        }
    }
    
    // Non-copyable but movable
    ConnectionHandle(const ConnectionHandle&) = delete;
    ConnectionHandle& operator=(const ConnectionHandle&) = delete;
    
    ConnectionHandle(ConnectionHandle&& other) noexcept
        : connection_(std::move(other.connection_))
        , released_(other.released_) {
        other.released_ = true;
    }
    
    ConnectionHandle& operator=(ConnectionHandle&& other) noexcept {
        if (this != &other) {
            if (connection_ && !released_) {
                connection_->release();
            }
            connection_ = std::move(other.connection_);
            released_ = other.released_;
            other.released_ = true;
        }
        return *this;
    }
    
    DatabaseConnection* operator->() { return connection_.get(); }
    const DatabaseConnection* operator->() const { return connection_.get(); }
    DatabaseConnection& operator*() { return *connection_; }
    const DatabaseConnection& operator*() const { return *connection_; }
    
    bool is_valid() const { return connection_ && connection_->is_healthy(); }
    
    void release_early() {
        if (connection_ && !released_) {
            connection_->release();
            released_ = true;
        }
    }
};

// High-performance connection pool with lifecycle management
class ConnectionPool {
public:
    struct PoolConfiguration {
        size_t min_connections = 5;
        size_t max_connections = 20;
        std::chrono::seconds connection_timeout{300}; // 5 minutes
        std::chrono::seconds acquire_timeout{30};     // 30 seconds
        std::chrono::seconds validation_interval{60}; // 1 minute
        std::string connection_string;
    };
    
private:
    PoolConfiguration config_;
    std::vector<std::shared_ptr<DatabaseConnection>> all_connections_;
    std::queue<std::shared_ptr<DatabaseConnection>> available_connections_;
    
    mutable std::mutex pool_mutex_;
    std::condition_variable pool_cv_;
    
    std::atomic<uint32_t> next_connection_id_{1};
    std::atomic<size_t> active_connections_{0};
    std::atomic<bool> pool_running_{true};
    
    // Background threads
    std::unique_ptr<std::thread> maintenance_thread_;
    std::unique_ptr<std::thread> health_check_thread_;
    
    void maintenance_worker() {
        while (pool_running_.load()) {
            std::this_thread::sleep_for(config_.validation_interval);
            
            auto now = std::chrono::steady_clock::now();
            std::vector<std::shared_ptr<DatabaseConnection>> expired_connections;
            
            {
                std::lock_guard<std::mutex> lock(pool_mutex_);
                
                // Remove expired connections
                auto it = std::remove_if(all_connections_.begin(), all_connections_.end(),
                    [&](const std::shared_ptr<DatabaseConnection>& conn) {
                        bool expired = (now - conn->get_last_used()) > config_.connection_timeout;
                        bool not_in_use = conn->get_state() == DatabaseConnection::State::CONNECTED;
                        
                        if (expired && not_in_use && all_connections_.size() > config_.min_connections) {
                            expired_connections.push_back(conn);
                            return true;
                        }
                        return false;
                    });
                    
                all_connections_.erase(it, all_connections_.end());
                
                // Clean available queue
                std::queue<std::shared_ptr<DatabaseConnection>> cleaned_queue;
                while (!available_connections_.empty()) {
                    auto conn = available_connections_.front();
                    available_connections_.pop();
                    
                    if (conn->is_healthy() && 
                        std::find(expired_connections.begin(), expired_connections.end(), conn) == expired_connections.end()) {
                        cleaned_queue.push(conn);
                    }
                }
                available_connections_ = std::move(cleaned_queue);
            }
            
            // Disconnect expired connections outside of lock
            for (auto& conn : expired_connections) {
                conn->disconnect();
            }
            
            // Ensure minimum connections
            ensure_minimum_connections();
        }
    }
    
    void health_check_worker() {
        while (pool_running_.load()) {
            std::this_thread::sleep_for(std::chrono::seconds(30));
            
            std::vector<std::shared_ptr<DatabaseConnection>> unhealthy_connections;
            
            {
                std::lock_guard<std::mutex> lock(pool_mutex_);
                
                for (auto& conn : all_connections_) {
                    if (!conn->is_healthy() && conn->get_state() != DatabaseConnection::State::IN_USE) {
                        unhealthy_connections.push_back(conn);
                    }
                }
            }
            
            // Attempt to reconnect unhealthy connections
            for (auto& conn : unhealthy_connections) {
                if (!conn->connect()) {
                    // Remove permanently failed connections
                    std::lock_guard<std::mutex> lock(pool_mutex_);
                    all_connections_.erase(
                        std::remove(all_connections_.begin(), all_connections_.end(), conn),
                        all_connections_.end()
                    );
                }
            }
        }
    }
    
    void ensure_minimum_connections() {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        while (all_connections_.size() < config_.min_connections) {
            auto conn = create_connection();
            if (conn && conn->connect()) {
                all_connections_.push_back(conn);
                available_connections_.push(conn);
            } else {
                break; // Stop trying if connections fail
            }
        }
    }
    
    std::shared_ptr<DatabaseConnection> create_connection() {
        uint32_t id = next_connection_id_.fetch_add(1);
        return std::make_shared<DatabaseConnection>(id, config_.connection_string);
    }
    
public:
    explicit ConnectionPool(PoolConfiguration config)
        : config_(std::move(config)) {
        
        // Create initial connections
        ensure_minimum_connections();
        
        // Start background threads
        maintenance_thread_ = std::make_unique<std::thread>(&ConnectionPool::maintenance_worker, this);
        health_check_thread_ = std::make_unique<std::thread>(&ConnectionPool::health_check_worker, this);
    }
    
    ~ConnectionPool() {
        shutdown();
    }
    
    void shutdown() {
        pool_running_.store(false);
        
        if (maintenance_thread_ && maintenance_thread_->joinable()) {
            maintenance_thread_->join();
        }
        if (health_check_thread_ && health_check_thread_->joinable()) {
            health_check_thread_->join();
        }
        
        std::lock_guard<std::mutex> lock(pool_mutex_);
        for (auto& conn : all_connections_) {
            conn->disconnect();
        }
        all_connections_.clear();
        while (!available_connections_.empty()) {
            available_connections_.pop();
        }
    }
    
    std::unique_ptr<ConnectionHandle> acquire_connection() {
        std::unique_lock<std::mutex> lock(pool_mutex_);
        
        auto deadline = std::chrono::steady_clock::now() + config_.acquire_timeout;
        
        while (available_connections_.empty() && pool_running_.load()) {
            // Try to create new connection if under limit
            if (all_connections_.size() < config_.max_connections) {
                auto conn = create_connection();
                if (conn && conn->connect()) {
                    all_connections_.push_back(conn);
                    available_connections_.push(conn);
                    break;
                }
            }
            
            // Wait for connection to become available
            if (pool_cv_.wait_until(lock, deadline) == std::cv_status::timeout) {
                return nullptr; // Timeout
            }
        }
        
        if (available_connections_.empty() || !pool_running_.load()) {
            return nullptr;
        }
        
        auto conn = available_connections_.front();
        available_connections_.pop();
        
        if (!conn->acquire()) {
            // Connection couldn't be acquired, try another
            return acquire_connection();
        }
        
        active_connections_.fetch_add(1);
        
        // Return RAII handle that automatically releases connection
        return std::make_unique<ConnectionHandle>(conn);
    }
    
    void return_connection(std::shared_ptr<DatabaseConnection> conn) {
        if (!conn) return;
        
        conn->release();
        active_connections_.fetch_sub(1);
        
        {
            std::lock_guard<std::mutex> lock(pool_mutex_);
            if (conn->is_healthy()) {
                available_connections_.push(conn);
                pool_cv_.notify_one();
            }
        }
    }
    
    // Pool statistics
    struct PoolStatistics {
        size_t total_connections;
        size_t available_connections;
        size_t active_connections;
        size_t healthy_connections;
        double utilization_ratio;
    };
    
    PoolStatistics get_statistics() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        size_t healthy = std::count_if(all_connections_.begin(), all_connections_.end(),
            [](const std::shared_ptr<DatabaseConnection>& conn) {
                return conn->is_healthy();
            });
        
        double utilization = all_connections_.empty() ? 0.0 :
            static_cast<double>(active_connections_.load()) / all_connections_.size();
        
        return PoolStatistics{
            .total_connections = all_connections_.size(),
            .available_connections = available_connections_.size(),
            .active_connections = active_connections_.load(),
            .healthy_connections = healthy,
            .utilization_ratio = utilization
        };
    }
    
    void resize_pool(size_t new_min, size_t new_max) {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        config_.min_connections = new_min;
        config_.max_connections = new_max;
        
        // Adjust current pool size if needed
        if (all_connections_.size() < new_min) {
            ensure_minimum_connections();
        }
    }
};

// Database session with connection management
class DatabaseSession {
private:
    std::shared_ptr<ConnectionPool> pool_;
    std::unique_ptr<ConnectionHandle> current_connection_;
    bool in_transaction_ = false;
    
public:
    explicit DatabaseSession(std::shared_ptr<ConnectionPool> pool)
        : pool_(std::move(pool)) {}
        
    ~DatabaseSession() {
        if (in_transaction_) {
            rollback();
        }
    }
    
    bool begin_transaction() {
        if (in_transaction_) return false;
        
        if (!current_connection_) {
            current_connection_ = pool_->acquire_connection();
            if (!current_connection_) {
                return false;
            }
        }
        
        // Begin database transaction
        in_transaction_ = true;
        return true;
    }
    
    bool commit() {
        if (!in_transaction_ || !current_connection_) {
            return false;
        }
        
        try {
            // Commit database transaction
            in_transaction_ = false;
            current_connection_.reset(); // Release connection
            return true;
        } catch (...) {
            rollback();
            return false;
        }
    }
    
    void rollback() {
        if (in_transaction_ && current_connection_) {
            // Rollback database transaction
            in_transaction_ = false;
            current_connection_.reset();
        }
    }
    
    template<typename T>
    std::future<T> execute_async(std::function<T()> operation) {
        if (!current_connection_) {
            current_connection_ = pool_->acquire_connection();
            if (!current_connection_) {
                return std::future<T>{};
            }
        }
        
        return (*current_connection_)->execute_async<T>(std::move(operation));
    }
    
    bool is_in_transaction() const { return in_transaction_; }
    bool has_connection() const { return current_connection_ != nullptr; }
};

} // namespace DatabaseConnections`,
      explanation: state.language === 'en' ? 
        'Connection pooling manages database connections efficiently through RAII handles, automatic lifecycle management, health monitoring, and background maintenance. Smart pointers ensure proper resource cleanup and prevent connection leaks.' :
        'El pooling de conexiones gestiona conexiones de base de datos eficientemente a través de handles RAII, gestión automática de ciclo de vida, monitoreo de salud y mantenimiento en segundo plano. Los smart pointers aseguran limpieza correcta de recursos y previenen fugas de conexiones.'
    },
    
    'result-sets': {
      title: state.language === 'en' ? 'Result Set Management' : 'Gestión de Conjuntos de Resultados',
      code: `#include <memory>
#include <vector>
#include <iterator>
#include <type_traits>
#include <variant>
#include <optional>
#include <span>
#include <string_view>
#include <concepts>
#include <ranges>

namespace DatabaseResults {

// Forward declarations
template<typename T> class ResultIterator;
template<typename T> class ResultSet;

// Concept for database result types
template<typename T>
concept DatabaseSerializable = requires(T t) {
    { T::from_database_row(std::declval<std::span<const std::byte>>()) } -> std::convertible_to<T>;
    { t.to_database_row() } -> std::convertible_to<std::vector<std::byte>>;
};

// Memory-efficient result set with lazy loading
template<DatabaseSerializable T>
class LazyResultSet {
public:
    using value_type = T;
    using size_type = size_t;
    using difference_type = ptrdiff_t;
    
private:
    // Row data storage strategy
    enum class StorageStrategy {
        MEMORY_BUFFERED,    // All data in memory
        STREAMING,          // Stream from database
        LAZY_LOADING        // Load on demand
    };
    
    struct RowData {
        std::vector<std::byte> raw_data;
        mutable std::optional<T> cached_object;
        bool is_loaded = false;
        
        const T& get_object() const {
            if (!cached_object.has_value()) {
                cached_object = T::from_database_row(std::span<const std::byte>(raw_data));
            }
            return cached_object.value();
        }
        
        void invalidate_cache() {
            cached_object.reset();
        }
    };
    
    std::vector<std::unique_ptr<RowData>> rows_;
    StorageStrategy strategy_;
    size_t total_rows_;
    size_t loaded_rows_;
    
    // Database connection for lazy loading (simplified interface)
    class DatabaseCursor {
    private:
        bool has_more_data_ = true;
        size_t current_position_ = 0;
        
    public:
        bool has_more() const { return has_more_data_ && current_position_ < 1000; }
        
        std::vector<std::byte> fetch_next_row() {
            if (!has_more()) return {};
            
            // Simulate fetching row data
            std::vector<std::byte> row_data(64); // Simulate 64 bytes per row
            std::iota(row_data.begin(), row_data.end(), static_cast<std::byte>(current_position_));
            
            ++current_position_;
            if (current_position_ >= 1000) {
                has_more_data_ = false;
            }
            
            return row_data;
        }
        
        size_t get_total_rows() const { return 1000; }
        void seek(size_t position) { current_position_ = position; }
    };
    
    std::unique_ptr<DatabaseCursor> cursor_;
    
    void ensure_row_loaded(size_t index) const {
        if (index >= rows_.size()) {
            return;
        }
        
        auto& row = rows_[index];
        if (!row || row->is_loaded) {
            return;
        }
        
        if (strategy_ == StorageStrategy::LAZY_LOADING && cursor_) {
            // Load specific row on demand
            cursor_->seek(index);
            if (cursor_->has_more()) {
                row->raw_data = cursor_->fetch_next_row();
                row->is_loaded = true;
                row->invalidate_cache(); // Force object recreation
            }
        }
    }
    
    void load_batch(size_t start_index, size_t count) {
        if (strategy_ != StorageStrategy::STREAMING && strategy_ != StorageStrategy::LAZY_LOADING) {
            return;
        }
        
        if (!cursor_ || !cursor_->has_more()) {
            return;
        }
        
        size_t end_index = std::min(start_index + count, total_rows_);
        
        // Ensure rows vector is large enough
        if (rows_.size() < end_index) {
            rows_.resize(end_index);
        }
        
        for (size_t i = start_index; i < end_index && cursor_->has_more(); ++i) {
            if (!rows_[i]) {
                rows_[i] = std::make_unique<RowData>();
            }
            
            if (!rows_[i]->is_loaded) {
                rows_[i]->raw_data = cursor_->fetch_next_row();
                rows_[i]->is_loaded = true;
                ++loaded_rows_;
            }
        }
    }
    
public:
    // Iterator implementation
    class iterator {
    public:
        using iterator_category = std::random_access_iterator_tag;
        using value_type = T;
        using difference_type = ptrdiff_t;
        using pointer = const T*;
        using reference = const T&;
        
    private:
        const LazyResultSet* result_set_;
        size_t index_;
        
    public:
        iterator(const LazyResultSet* rs, size_t idx) : result_set_(rs), index_(idx) {}
        
        reference operator*() const {
            result_set_->ensure_row_loaded(index_);
            return result_set_->rows_[index_]->get_object();
        }
        
        pointer operator->() const {
            return &(**this);
        }
        
        iterator& operator++() { ++index_; return *this; }
        iterator operator++(int) { iterator tmp = *this; ++index_; return tmp; }
        iterator& operator--() { --index_; return *this; }
        iterator operator--(int) { iterator tmp = *this; --index_; return tmp; }
        
        iterator& operator+=(difference_type n) { index_ += n; return *this; }
        iterator& operator-=(difference_type n) { index_ -= n; return *this; }
        
        iterator operator+(difference_type n) const { return iterator(result_set_, index_ + n); }
        iterator operator-(difference_type n) const { return iterator(result_set_, index_ - n); }
        
        difference_type operator-(const iterator& other) const {
            return static_cast<difference_type>(index_) - static_cast<difference_type>(other.index_);
        }
        
        reference operator[](difference_type n) const {
            return *(*this + n);
        }
        
        bool operator==(const iterator& other) const {
            return result_set_ == other.result_set_ && index_ == other.index_;
        }
        
        bool operator!=(const iterator& other) const { return !(*this == other); }
        bool operator<(const iterator& other) const { return index_ < other.index_; }
        bool operator<=(const iterator& other) const { return index_ <= other.index_; }
        bool operator>(const iterator& other) const { return index_ > other.index_; }
        bool operator>=(const iterator& other) const { return index_ >= other.index_; }
    };
    
    using const_iterator = iterator;
    
    // Constructors
    explicit LazyResultSet(StorageStrategy strategy = StorageStrategy::LAZY_LOADING)
        : strategy_(strategy)
        , total_rows_(0)
        , loaded_rows_(0)
        , cursor_(std::make_unique<DatabaseCursor>()) {
        
        if (cursor_) {
            total_rows_ = cursor_->get_total_rows();
            
            if (strategy_ == StorageStrategy::MEMORY_BUFFERED) {
                // Load all data immediately
                load_batch(0, total_rows_);
            }
        }
    }
    
    // Move semantics
    LazyResultSet(LazyResultSet&& other) noexcept
        : rows_(std::move(other.rows_))
        , strategy_(other.strategy_)
        , total_rows_(other.total_rows_)
        , loaded_rows_(other.loaded_rows_)
        , cursor_(std::move(other.cursor_)) {}
        
    LazyResultSet& operator=(LazyResultSet&& other) noexcept {
        if (this != &other) {
            rows_ = std::move(other.rows_);
            strategy_ = other.strategy_;
            total_rows_ = other.total_rows_;
            loaded_rows_ = other.loaded_rows_;
            cursor_ = std::move(other.cursor_);
        }
        return *this;
    }
    
    // No copy semantics (expensive operation)
    LazyResultSet(const LazyResultSet&) = delete;
    LazyResultSet& operator=(const LazyResultSet&) = delete;
    
    // Iterator interface
    iterator begin() const {
        if (strategy_ != StorageStrategy::MEMORY_BUFFERED && !rows_.empty()) {
            // Ensure first batch is loaded for streaming
            const_cast<LazyResultSet*>(this)->load_batch(0, std::min(size_t{100}, total_rows_));
        }
        return iterator(this, 0);
    }
    
    iterator end() const {
        return iterator(this, total_rows_);
    }
    
    const_iterator cbegin() const { return begin(); }
    const_iterator cend() const { return end(); }
    
    // Random access
    const T& operator[](size_t index) const {
        if (index >= total_rows_) {
            throw std::out_of_range("Index out of range");
        }
        
        ensure_row_loaded(index);
        return rows_[index]->get_object();
    }
    
    const T& at(size_t index) const {
        return (*this)[index];
    }
    
    // Size information
    size_t size() const noexcept { return total_rows_; }
    bool empty() const noexcept { return total_rows_ == 0; }
    size_t loaded_count() const noexcept { return loaded_rows_; }
    
    // Memory management
    void prefetch(size_t start_index, size_t count = 100) {
        if (strategy_ != StorageStrategy::MEMORY_BUFFERED) {
            load_batch(start_index, count);
        }
    }
    
    void clear_cache() {
        if (strategy_ == StorageStrategy::LAZY_LOADING) {
            for (auto& row : rows_) {
                if (row) {
                    row->invalidate_cache();
                }
            }
        }
    }
    
    // Statistics
    struct MemoryStatistics {
        size_t total_rows;
        size_t loaded_rows;
        size_t memory_usage_bytes;
        double cache_hit_ratio;
        StorageStrategy strategy;
    };
    
    MemoryStatistics get_memory_stats() const {
        size_t memory_usage = 0;
        size_t cached_objects = 0;
        
        for (const auto& row : rows_) {
            if (row) {
                memory_usage += row->raw_data.size();
                if (row->cached_object.has_value()) {
                    memory_usage += sizeof(T);
                    ++cached_objects;
                }
            }
        }
        
        double cache_ratio = loaded_rows_ > 0 ? 
            static_cast<double>(cached_objects) / loaded_rows_ : 0.0;
        
        return MemoryStatistics{
            .total_rows = total_rows_,
            .loaded_rows = loaded_rows_,
            .memory_usage_bytes = memory_usage,
            .cache_hit_ratio = cache_ratio,
            .strategy = strategy_
        };
    }
};

// Chunked result processor for large datasets
template<DatabaseSerializable T>
class ChunkedResultProcessor {
private:
    std::unique_ptr<LazyResultSet<T>> result_set_;
    size_t chunk_size_;
    size_t current_position_;
    
public:
    explicit ChunkedResultProcessor(std::unique_ptr<LazyResultSet<T>> results, size_t chunk_size = 1000)
        : result_set_(std::move(results))
        , chunk_size_(chunk_size)
        , current_position_(0) {}
        
    // Process results in chunks to manage memory usage
    template<typename Processor>
    void process_chunks(Processor processor) {
        if (!result_set_) return;
        
        while (current_position_ < result_set_->size()) {
            size_t chunk_end = std::min(current_position_ + chunk_size_, result_set_->size());
            
            // Prefetch chunk data
            result_set_->prefetch(current_position_, chunk_end - current_position_);
            
            // Create span for this chunk
            std::vector<std::reference_wrapper<const T>> chunk;
            chunk.reserve(chunk_end - current_position_);
            
            for (size_t i = current_position_; i < chunk_end; ++i) {
                chunk.emplace_back((*result_set_)[i]);
            }
            
            // Process chunk
            processor(chunk, current_position_);
            
            current_position_ = chunk_end;
            
            // Optional: clear cache after processing to free memory
            if (current_position_ < result_set_->size()) {
                result_set_->clear_cache();
            }
        }
    }
    
    void reset() {
        current_position_ = 0;
    }
    
    size_t remaining_rows() const {
        return result_set_ ? result_set_->size() - current_position_ : 0;
    }
};

// Result set aggregator with smart pointer management
template<DatabaseSerializable T>
class ResultSetAggregator {
private:
    std::vector<std::shared_ptr<LazyResultSet<T>>> result_sets_;
    
public:
    void add_result_set(std::shared_ptr<LazyResultSet<T>> result_set) {
        if (result_set && !result_set->empty()) {
            result_sets_.push_back(std::move(result_set));
        }
    }
    
    // Aggregate iterator that spans multiple result sets
    class aggregated_iterator {
    public:
        using iterator_category = std::forward_iterator_tag;
        using value_type = T;
        using difference_type = ptrdiff_t;
        using pointer = const T*;
        using reference = const T&;
        
    private:
        const ResultSetAggregator* aggregator_;
        size_t result_set_index_;
        typename LazyResultSet<T>::iterator current_iterator_;
        
        void advance_to_next_valid() {
            while (result_set_index_ < aggregator_->result_sets_.size()) {
                auto& current_set = *aggregator_->result_sets_[result_set_index_];
                
                if (current_iterator_ != current_set.end()) {
                    return; // Valid position found
                }
                
                // Move to next result set
                ++result_set_index_;
                if (result_set_index_ < aggregator_->result_sets_.size()) {
                    current_iterator_ = aggregator_->result_sets_[result_set_index_]->begin();
                }
            }
        }
        
    public:
        aggregated_iterator(const ResultSetAggregator* agg, size_t set_idx)
            : aggregator_(agg), result_set_index_(set_idx) {
            
            if (result_set_index_ < aggregator_->result_sets_.size()) {
                current_iterator_ = aggregator_->result_sets_[result_set_index_]->begin();
                advance_to_next_valid();
            }
        }
        
        reference operator*() const { return *current_iterator_; }
        pointer operator->() const { return &(*current_iterator_); }
        
        aggregated_iterator& operator++() {
            ++current_iterator_;
            advance_to_next_valid();
            return *this;
        }
        
        aggregated_iterator operator++(int) {
            aggregated_iterator tmp = *this;
            ++(*this);
            return tmp;
        }
        
        bool operator==(const aggregated_iterator& other) const {
            return aggregator_ == other.aggregator_ && 
                   result_set_index_ == other.result_set_index_ &&
                   (result_set_index_ >= aggregator_->result_sets_.size() ||
                    current_iterator_ == other.current_iterator_);
        }
        
        bool operator!=(const aggregated_iterator& other) const {
            return !(*this == other);
        }
    };
    
    aggregated_iterator begin() const {
        return aggregated_iterator(this, 0);
    }
    
    aggregated_iterator end() const {
        return aggregated_iterator(this, result_sets_.size());
    }
    
    size_t total_size() const {
        size_t total = 0;
        for (const auto& result_set : result_sets_) {
            total += result_set->size();
        }
        return total;
    }
    
    size_t result_set_count() const {
        return result_sets_.size();
    }
    
    // Memory statistics across all result sets
    struct AggregatedStatistics {
        size_t total_result_sets;
        size_t total_rows;
        size_t total_loaded_rows;
        size_t total_memory_usage;
        double average_cache_ratio;
    };
    
    AggregatedStatistics get_aggregated_stats() const {
        AggregatedStatistics stats{};
        stats.total_result_sets = result_sets_.size();
        
        double total_cache_ratio = 0.0;
        
        for (const auto& result_set : result_sets_) {
            auto set_stats = result_set->get_memory_stats();
            stats.total_rows += set_stats.total_rows;
            stats.total_loaded_rows += set_stats.loaded_rows;
            stats.total_memory_usage += set_stats.memory_usage_bytes;
            total_cache_ratio += set_stats.cache_hit_ratio;
        }
        
        stats.average_cache_ratio = result_sets_.empty() ? 0.0 : 
            total_cache_ratio / result_sets_.size();
        
        return stats;
    }
};

// Example entity for demonstration
struct User {
    uint64_t id;
    std::string name;
    std::string email;
    int age;
    
    static User from_database_row(std::span<const std::byte> data) {
        // Simplified deserialization
        User user{};
        if (data.size() >= sizeof(uint64_t)) {
            std::memcpy(&user.id, data.data(), sizeof(uint64_t));
        }
        // In practice, would deserialize all fields
        user.name = "User" + std::to_string(user.id);
        user.email = user.name + "@example.com";
        user.age = static_cast<int>(user.id % 80) + 18;
        return user;
    }
    
    std::vector<std::byte> to_database_row() const {
        // Simplified serialization
        std::vector<std::byte> data(sizeof(uint64_t));
        std::memcpy(data.data(), &id, sizeof(uint64_t));
        return data;
    }
};

// Usage example
class DatabaseQueryExecutor {
private:
    std::shared_ptr<LazyResultSet<User>> execute_user_query() {
        return std::make_shared<LazyResultSet<User>>(
            LazyResultSet<User>::StorageStrategy::LAZY_LOADING);
    }
    
public:
    void demonstrate_result_processing() {
        // Execute query and get lazy result set
        auto results = execute_user_query();
        
        // Process results in chunks to manage memory
        ChunkedResultProcessor<User> processor(
            std::make_unique<LazyResultSet<User>>(std::move(*results)), 500);
        
        processor.process_chunks([](const auto& chunk, size_t offset) {
            std::cout << "Processing chunk at offset " << offset 
                      << " with " << chunk.size() << " users\\n";
            
            // Process each user in the chunk
            for (const User& user : chunk) {
                // Process user data...
            }
        });
        
        // Aggregate multiple result sets
        ResultSetAggregator<User> aggregator;
        aggregator.add_result_set(execute_user_query());
        aggregator.add_result_set(execute_user_query());
        
        // Iterate through aggregated results
        for (const User& user : aggregator) {
            // Process user from multiple result sets
        }
        
        auto stats = aggregator.get_aggregated_stats();
        std::cout << "Total users across all result sets: " << stats.total_rows << "\\n";
        std::cout << "Memory usage: " << stats.total_memory_usage << " bytes\\n";
    }
};

} // namespace DatabaseResults`,
      explanation: state.language === 'en' ? 
        'Result set management with smart pointers enables efficient memory usage through lazy loading, chunked processing, and iterator-based access. This approach handles large datasets while maintaining performance and preventing memory exhaustion.' :
        'La gestión de conjuntos de resultados con smart pointers permite uso eficiente de memoria através de carga perezosa, procesamiento por chunks y acceso basado en iteradores. Este enfoque maneja grandes conjuntos de datos manteniendo rendimiento y previniendo agotamiento de memoria.'
    },
    
    'transaction-boundaries': {
      title: state.language === 'en' ? 'Transaction Boundaries Management' : 'Gestión de Límites Transaccionales',
      code: `#include <memory>
#include <functional>
#include <vector>
#include <stack>
#include <exception>
#include <concepts>
#include <type_traits>
#include <atomic>
#include <mutex>
#include <thread>
#include <chrono>

namespace TransactionBoundaries {

// Forward declarations
class TransactionManager;
template<typename T> class TransactionalResource;

// Transaction isolation levels
enum class IsolationLevel {
    READ_UNCOMMITTED,
    READ_COMMITTED,
    REPEATABLE_READ,
    SERIALIZABLE
};

// Transaction states
enum class TransactionState {
    NOT_STARTED,
    ACTIVE,
    MARKED_ROLLBACK_ONLY,
    PREPARING,
    PREPARED,
    COMMITTING,
    COMMITTED,
    ROLLING_BACK,
    ROLLED_BACK,
    UNKNOWN
};

// Base interface for transactional resources
class TransactionalResource {
public:
    virtual ~TransactionalResource() = default;
    
    virtual bool prepare() = 0;
    virtual bool commit() = 0;
    virtual bool rollback() = 0;
    virtual std::string get_resource_id() const = 0;
    
    // Resource health and status
    virtual bool is_healthy() const { return true; }
    virtual TransactionState get_state() const = 0;
};

// RAII Transaction scope guard
class TransactionScope {
private:
    std::shared_ptr<TransactionManager> manager_;
    std::string transaction_id_;
    bool committed_ = false;
    bool rolled_back_ = false;
    
public:
    explicit TransactionScope(std::shared_ptr<TransactionManager> manager);
    
    ~TransactionScope() {
        if (!committed_ && !rolled_back_) {
            rollback(); // Auto-rollback on destruction
        }
    }
    
    // Non-copyable but movable
    TransactionScope(const TransactionScope&) = delete;
    TransactionScope& operator=(const TransactionScope&) = delete;
    
    TransactionScope(TransactionScope&& other) noexcept
        : manager_(std::move(other.manager_))
        , transaction_id_(std::move(other.transaction_id_))
        , committed_(other.committed_)
        , rolled_back_(other.rolled_back_) {
        other.committed_ = true; // Prevent auto-rollback in moved-from object
    }
    
    bool commit();
    bool rollback();
    
    bool is_active() const { return !committed_ && !rolled_back_; }
    const std::string& get_transaction_id() const { return transaction_id_; }
};

// Savepoint for nested transactions
class Savepoint {
private:
    std::string savepoint_id_;
    std::weak_ptr<TransactionManager> manager_;
    bool released_ = false;
    
public:
    Savepoint(std::string id, std::weak_ptr<TransactionManager> manager)
        : savepoint_id_(std::move(id)), manager_(std::move(manager)) {}
        
    ~Savepoint() {
        if (!released_) {
            rollback_to_savepoint();
        }
    }
    
    // Non-copyable but movable
    Savepoint(const Savepoint&) = delete;
    Savepoint& operator=(const Savepoint&) = delete;
    
    Savepoint(Savepoint&& other) noexcept
        : savepoint_id_(std::move(other.savepoint_id_))
        , manager_(std::move(other.manager_))
        , released_(other.released_) {
        other.released_ = true;
    }
    
    bool rollback_to_savepoint();
    void release();
    
    const std::string& get_id() const { return savepoint_id_; }
    bool is_released() const { return released_; }
};

// Comprehensive transaction manager with smart pointer resource management
class TransactionManager : public std::enable_shared_from_this<TransactionManager> {
private:
    struct TransactionContext {
        std::string transaction_id;
        TransactionState state = TransactionState::NOT_STARTED;
        IsolationLevel isolation_level = IsolationLevel::READ_COMMITTED;
        std::chrono::steady_clock::time_point start_time;
        std::chrono::milliseconds timeout;
        
        // Resources participating in this transaction
        std::vector<std::shared_ptr<TransactionalResource>> resources;
        
        // Nested transactions/savepoints
        std::stack<std::unique_ptr<Savepoint>> savepoints;
        
        // Transaction callbacks
        std::vector<std::function<void()>> before_commit_callbacks;
        std::vector<std::function<void()>> after_commit_callbacks;
        std::vector<std::function<void()>> before_rollback_callbacks;
        std::vector<std::function<void()>> after_rollback_callbacks;
        
        // Two-phase commit state
        bool prepared = false;
        std::vector<std::string> prepared_resources;
        
        TransactionContext(std::string id, IsolationLevel level, std::chrono::milliseconds to)
            : transaction_id(std::move(id))
            , isolation_level(level)
            , start_time(std::chrono::steady_clock::now())
            , timeout(to) {}
    };
    
    // Thread-local transaction context
    thread_local static std::unique_ptr<TransactionContext> current_transaction_;
    
    std::atomic<uint64_t> transaction_counter_{1};
    mutable std::shared_mutex manager_mutex_;
    
    // Transaction timeout management
    std::vector<std::weak_ptr<TransactionContext>> active_transactions_;
    std::unique_ptr<std::thread> timeout_monitor_;
    std::atomic<bool> monitor_running_{true};
    
    void timeout_monitor_worker() {
        while (monitor_running_.load()) {
            std::this_thread::sleep_for(std::chrono::seconds(5));
            
            auto now = std::chrono::steady_clock::now();
            std::vector<std::string> timed_out_transactions;
            
            {
                std::shared_lock<std::shared_mutex> lock(manager_mutex_);
                
                for (auto it = active_transactions_.begin(); it != active_transactions_.end();) {
                    if (auto tx_ctx = it->lock()) {
                        auto elapsed = now - tx_ctx->start_time;
                        if (elapsed > tx_ctx->timeout) {
                            timed_out_transactions.push_back(tx_ctx->transaction_id);
                        }
                        ++it;
                    } else {
                        it = active_transactions_.erase(it);
                    }
                }
            }
            
            // Force rollback timed-out transactions
            for (const auto& tx_id : timed_out_transactions) {
                // In practice, would force rollback the specific transaction
                // This is simplified for the example
            }
        }
    }
    
    std::string generate_transaction_id() {
        uint64_t id = transaction_counter_.fetch_add(1);
        return "TX_" + std::to_string(id) + "_" + 
               std::to_string(std::chrono::steady_clock::now().time_since_epoch().count());
    }
    
public:
    TransactionManager() {
        timeout_monitor_ = std::make_unique<std::thread>(&TransactionManager::timeout_monitor_worker, this);
    }
    
    ~TransactionManager() {
        monitor_running_.store(false);
        if (timeout_monitor_ && timeout_monitor_->joinable()) {
            timeout_monitor_->join();
        }
    }
    
    // Begin new transaction
    std::unique_ptr<TransactionScope> begin_transaction(
        IsolationLevel isolation = IsolationLevel::READ_COMMITTED,
        std::chrono::milliseconds timeout = std::chrono::minutes(5)) {
        
        if (current_transaction_) {
            throw std::runtime_error("Transaction already active in this thread");
        }
        
        std::string tx_id = generate_transaction_id();
        current_transaction_ = std::make_unique<TransactionContext>(tx_id, isolation, timeout);
        current_transaction_->state = TransactionState::ACTIVE;
        
        {
            std::unique_lock<std::shared_mutex> lock(manager_mutex_);
            // Note: In practice, we'd store a shared_ptr to the context
            // This is simplified for the example
        }
        
        return std::make_unique<TransactionScope>(shared_from_this());
    }
    
    // Create savepoint for nested transactions
    std::unique_ptr<Savepoint> create_savepoint() {
        if (!current_transaction_ || current_transaction_->state != TransactionState::ACTIVE) {
            throw std::runtime_error("No active transaction for savepoint");
        }
        
        std::string savepoint_id = current_transaction_->transaction_id + "_SP_" + 
                                  std::to_string(current_transaction_->savepoints.size());
        
        auto savepoint = std::make_unique<Savepoint>(savepoint_id, weak_from_this());
        current_transaction_->savepoints.push(std::unique_ptr<Savepoint>(savepoint.get()));
        
        return savepoint;
    }
    
    // Enlist resource in current transaction
    bool enlist_resource(std::shared_ptr<TransactionalResource> resource) {
        if (!current_transaction_ || !resource) {
            return false;
        }
        
        if (current_transaction_->state != TransactionState::ACTIVE) {
            throw std::runtime_error("Cannot enlist resource in non-active transaction");
        }
        
        // Check if resource is already enlisted
        auto it = std::find_if(current_transaction_->resources.begin(), 
                              current_transaction_->resources.end(),
                              [&resource](const auto& r) {
                                  return r->get_resource_id() == resource->get_resource_id();
                              });
        
        if (it == current_transaction_->resources.end()) {
            current_transaction_->resources.push_back(resource);
        }
        
        return true;
    }
    
    // Register transaction callbacks
    void register_before_commit(std::function<void()> callback) {
        if (current_transaction_) {
            current_transaction_->before_commit_callbacks.push_back(std::move(callback));
        }
    }
    
    void register_after_commit(std::function<void()> callback) {
        if (current_transaction_) {
            current_transaction_->after_commit_callbacks.push_back(std::move(callback));
        }
    }
    
    void register_before_rollback(std::function<void()> callback) {
        if (current_transaction_) {
            current_transaction_->before_rollback_callbacks.push_back(std::move(callback));
        }
    }
    
    void register_after_rollback(std::function<void()> callback) {
        if (current_transaction_) {
            current_transaction_->after_rollback_callbacks.push_back(std::move(callback));
        }
    }
    
    // Two-phase commit implementation
    bool commit_transaction() {
        if (!current_transaction_) {
            return false;
        }
        
        if (current_transaction_->state != TransactionState::ACTIVE) {
            throw std::runtime_error("Cannot commit non-active transaction");
        }
        
        try {
            // Execute before-commit callbacks
            for (const auto& callback : current_transaction_->before_commit_callbacks) {
                callback();
            }
            
            // Phase 1: Prepare all resources
            current_transaction_->state = TransactionState::PREPARING;
            
            for (auto& resource : current_transaction_->resources) {
                if (!resource->prepare()) {
                    // Prepare failed, rollback all
                    rollback_transaction();
                    return false;
                }
                current_transaction_->prepared_resources.push_back(resource->get_resource_id());
            }
            
            current_transaction_->prepared = true;
            current_transaction_->state = TransactionState::PREPARED;
            
            // Phase 2: Commit all resources
            current_transaction_->state = TransactionState::COMMITTING;
            
            bool commit_success = true;
            for (auto& resource : current_transaction_->resources) {
                if (!resource->commit()) {
                    commit_success = false;
                    // Continue committing other resources even if one fails
                    // In practice, would need more sophisticated error handling
                }
            }
            
            if (commit_success) {
                current_transaction_->state = TransactionState::COMMITTED;
                
                // Execute after-commit callbacks
                for (const auto& callback : current_transaction_->after_commit_callbacks) {
                    try {
                        callback();
                    } catch (...) {
                        // Log callback errors but don't fail the transaction
                    }
                }
                
                // Clean up transaction context
                current_transaction_.reset();
                return true;
            } else {
                // Commit failed, attempt rollback
                rollback_transaction();
                return false;
            }
            
        } catch (...) {
            rollback_transaction();
            return false;
        }
    }
    
    bool rollback_transaction() {
        if (!current_transaction_) {
            return false;
        }
        
        if (current_transaction_->state == TransactionState::ROLLED_BACK ||
            current_transaction_->state == TransactionState::ROLLING_BACK) {
            return true; // Already rolled back
        }
        
        try {
            // Execute before-rollback callbacks
            for (const auto& callback : current_transaction_->before_rollback_callbacks) {
                try {
                    callback();
                } catch (...) {
                    // Log errors but continue rollback
                }
            }
            
            current_transaction_->state = TransactionState::ROLLING_BACK;
            
            // Rollback all resources
            bool rollback_success = true;
            for (auto& resource : current_transaction_->resources) {
                try {
                    if (!resource->rollback()) {
                        rollback_success = false;
                        // Continue with other resources
                    }
                } catch (...) {
                    rollback_success = false;
                    // Continue with other resources
                }
            }
            
            current_transaction_->state = TransactionState::ROLLED_BACK;
            
            // Execute after-rollback callbacks
            for (const auto& callback : current_transaction_->after_rollback_callbacks) {
                try {
                    callback();
                } catch (...) {
                    // Log callback errors
                }
            }
            
            // Clean up transaction context
            current_transaction_.reset();
            return rollback_success;
            
        } catch (...) {
            current_transaction_->state = TransactionState::UNKNOWN;
            current_transaction_.reset();
            return false;
        }
    }
    
    // Transaction status queries
    bool has_active_transaction() const {
        return current_transaction_ && current_transaction_->state == TransactionState::ACTIVE;
    }
    
    TransactionState get_transaction_state() const {
        return current_transaction_ ? current_transaction_->state : TransactionState::NOT_STARTED;
    }
    
    std::string get_current_transaction_id() const {
        return current_transaction_ ? current_transaction_->transaction_id : "";
    }
    
    IsolationLevel get_isolation_level() const {
        return current_transaction_ ? current_transaction_->isolation_level : IsolationLevel::READ_COMMITTED;
    }
    
    size_t get_enlisted_resource_count() const {
        return current_transaction_ ? current_transaction_->resources.size() : 0;
    }
    
    std::chrono::milliseconds get_transaction_duration() const {
        if (!current_transaction_) {
            return std::chrono::milliseconds::zero();
        }
        
        auto now = std::chrono::steady_clock::now();
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            now - current_transaction_->start_time);
    }
    
    // Make TransactionScope a friend so it can access private members
    friend class TransactionScope;
    friend class Savepoint;
};

// Thread-local storage definition
thread_local std::unique_ptr<TransactionManager::TransactionContext> 
    TransactionManager::current_transaction_;

// TransactionScope implementation
inline TransactionScope::TransactionScope(std::shared_ptr<TransactionManager> manager)
    : manager_(std::move(manager)) {
    if (manager_) {
        transaction_id_ = manager_->get_current_transaction_id();
    }
}

inline bool TransactionScope::commit() {
    if (!manager_ || committed_ || rolled_back_) {
        return false;
    }
    
    committed_ = manager_->commit_transaction();
    return committed_;
}

inline bool TransactionScope::rollback() {
    if (!manager_ || rolled_back_) {
        return false;
    }
    
    rolled_back_ = manager_->rollback_transaction();
    committed_ = false; // Ensure we don't try to commit after rollback
    return rolled_back_;
}

// Savepoint implementation
inline bool Savepoint::rollback_to_savepoint() {
    if (released_) return false;
    
    if (auto mgr = manager_.lock()) {
        // Simplified savepoint rollback
        // In practice, would rollback to specific savepoint
        released_ = true;
        return true;
    }
    return false;
}

inline void Savepoint::release() {
    released_ = true;
}

// Example transactional resource implementation
class DatabaseResource : public TransactionalResource {
private:
    std::string resource_id_;
    TransactionState state_ = TransactionState::NOT_STARTED;
    
public:
    explicit DatabaseResource(std::string id) : resource_id_(std::move(id)) {}
    
    bool prepare() override {
        state_ = TransactionState::PREPARING;
        // Simulate prepare operation
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
        state_ = TransactionState::PREPARED;
        return true;
    }
    
    bool commit() override {
        if (state_ != TransactionState::PREPARED) return false;
        
        state_ = TransactionState::COMMITTING;
        // Simulate commit operation
        std::this_thread::sleep_for(std::chrono::milliseconds(2));
        state_ = TransactionState::COMMITTED;
        return true;
    }
    
    bool rollback() override {
        state_ = TransactionState::ROLLING_BACK;
        // Simulate rollback operation
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
        state_ = TransactionState::ROLLED_BACK;
        return true;
    }
    
    std::string get_resource_id() const override {
        return resource_id_;
    }
    
    TransactionState get_state() const override {
        return state_;
    }
};

// Usage example with smart pointers
class TransactionalService {
private:
    std::shared_ptr<TransactionManager> tx_manager_;
    
public:
    explicit TransactionalService(std::shared_ptr<TransactionManager> manager)
        : tx_manager_(std::move(manager)) {}
        
    bool perform_complex_operation() {
        // Begin transaction with RAII scope
        auto transaction = tx_manager_->begin_transaction(IsolationLevel::REPEATABLE_READ);
        
        try {
            // Enlist resources
            auto db_resource1 = std::make_shared<DatabaseResource>("DB1");
            auto db_resource2 = std::make_shared<DatabaseResource>("DB2");
            
            tx_manager_->enlist_resource(db_resource1);
            tx_manager_->enlist_resource(db_resource2);
            
            // Register cleanup callbacks
            tx_manager_->register_after_commit([this]() {
                std::cout << "Transaction committed successfully\\n";
            });
            
            tx_manager_->register_after_rollback([this]() {
                std::cout << "Transaction rolled back\\n";
            });
            
            // Perform business operations
            perform_business_logic();
            
            // Create savepoint for nested operation
            auto savepoint = tx_manager_->create_savepoint();
            
            try {
                perform_risky_operation();
                savepoint->release(); // Success, don't rollback
            } catch (...) {
                savepoint->rollback_to_savepoint();
                // Continue with main transaction
            }
            
            // Commit transaction
            return transaction->commit();
            
        } catch (...) {
            // Transaction will auto-rollback on scope exit
            return false;
        }
    }
    
private:
    void perform_business_logic() {
        // Simulate business operations
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    
    void perform_risky_operation() {
        // Simulate risky operation that might fail
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
    }
};

} // namespace TransactionBoundaries`,
      explanation: state.language === 'en' ? 
        'Transaction boundary management with smart pointers ensures ACID properties through RAII patterns, two-phase commit protocols, savepoint management, and automatic resource cleanup. This provides reliable transaction handling with proper resource lifecycle management.' :
        'La gestión de límites transaccionales con smart pointers asegura propiedades ACID através de patrones RAII, protocolos de commit de dos fases, gestión de savepoints y limpieza automática de recursos. Esto proporciona manejo confiable de transacciones con gestión apropiada del ciclo de vida de recursos.'
    }
  };

  return (
    <div className="lesson-container">
      <style>{`
        .lesson-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .lesson-header {
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #8e44ad 0%, #3498db 100%);
          color: white;
          padding: 40px 20px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .lesson-title {
          font-size: 2.5rem;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .lesson-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          font-weight: 300;
        }

        .controls-section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
        }

        .control-label {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .example-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
        }

        .example-button {
          padding: 12px 16px;
          border: 2px solid #e1e8ed;
          background: white;
          color: #2c3e50;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .example-button:hover {
          border-color: #8e44ad;
          background: #f8f9fa;
        }

        .example-button.active {
          border-color: #8e44ad;
          background: #8e44ad;
          color: white;
          box-shadow: 0 3px 10px rgba(142, 68, 173, 0.3);
        }

        .metrics-display {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .metric-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #8e44ad;
        }

        .metric-label {
          font-size: 0.8rem;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }

        .metric-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .visualization-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .visualization-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .pattern-selector {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pattern-button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .pattern-button:hover {
          background: #f8f9fa;
          border-color: #8e44ad;
        }

        .pattern-button.active {
          background: #8e44ad;
          color: white;
          border-color: #8e44ad;
        }

        .canvas-container {
          height: 500px;
          border-radius: 10px;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border: 1px solid #e1e8ed;
        }

        .code-section {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .code-header {
          background: #2c3e50;
          color: white;
          padding: 20px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .code-title {
          font-size: 1.2rem;
          font-weight: 600;
        }

        .copy-button {
          padding: 8px 16px;
          background: #8e44ad;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .copy-button:hover {
          background: #9b59b6;
        }

        .code-content {
          background: #f8f9fa;
          padding: 0;
          max-height: 600px;
          overflow-y: auto;
        }

        .code-block {
          margin: 0;
          padding: 25px;
          background: transparent;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #2c3e50;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .explanation {
          padding: 25px;
          background: #e8f4f8;
          border-left: 4px solid #8e44ad;
          margin-top: 20px;
          border-radius: 0 0 12px 12px;
        }

        .explanation-text {
          color: #2c3e50;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .key-concepts-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .key-concepts-section h3 {
          color: #2c3e50;
          margin-bottom: 25px;
          font-size: 1.4rem;
        }

        .concepts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .concept-card {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border-left: 4px solid #8e44ad;
        }

        .concept-card h4 {
          color: #2c3e50;
          margin-bottom: 15px;
          font-size: 1.1rem;
        }

        .concept-card ul {
          list-style: none;
          padding: 0;
        }

        .concept-card li {
          padding: 8px 0;
          position: relative;
          padding-left: 25px;
          line-height: 1.5;
          color: #4a4a4a;
        }

        .concept-card li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #27ae60;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .lesson-container {
            padding: 15px;
          }
          
          .lesson-title {
            font-size: 2rem;
          }
          
          .controls-grid {
            grid-template-columns: 1fr;
          }
          
          .example-selector {
            grid-template-columns: 1fr;
          }
          
          .concepts-grid {
            grid-template-columns: 1fr;
          }
          
          .canvas-container {
            height: 400px;
          }
        }
      `}</style>

      <div className="lesson-header">
        <h1 className="lesson-title">
          {state.language === 'en' ? 'Lesson 118: Database Integration Patterns' : 'Lección 118: Patrones de Integración de Base de Datos'}
        </h1>
        <p className="lesson-subtitle">
          {state.language === 'en' 
            ? 'Advanced database integration patterns using smart pointers for ORM management, connection pooling, result set optimization, and transaction boundary control'
            : 'Patrones avanzados de integración de base de datos usando smart pointers para gestión ORM, pooling de conexiones, optimización de conjuntos de resultados y control de límites transaccionales'
          }
        </p>
      </div>

      <div className="controls-section">
        <div className="controls-grid">
          <div className="control-group">
            <label className="control-label">
              {state.language === 'en' ? 'Select Pattern' : 'Seleccionar Patrón'}
            </label>
            <div className="example-selector">
              {Object.keys(examples).map((key) => (
                <button
                  key={key}
                  className={`example-button ${activeExample === key ? 'active' : ''}`}
                  onClick={() => setActiveExample(key)}
                >
                  {examples[key as keyof typeof examples].title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="metrics-display">
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            {state.language === 'en' ? 'Database Performance Metrics' : 'Métricas de Rendimiento de Base de Datos'}
          </h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">
                {state.language === 'en' ? 'ORM Efficiency' : 'Eficiencia ORM'}
              </div>
              <div className="metric-value">{(metrics.ormEfficiency * 100).toFixed(1)}%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">
                {state.language === 'en' ? 'Pool Utilization' : 'Utilización Pool'}
              </div>
              <div className="metric-value">{(metrics.connectionPoolUtilization * 100).toFixed(1)}%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">
                {state.language === 'en' ? 'Result Set Optimization' : 'Optimización Result Sets'}
              </div>
              <div className="metric-value">{(metrics.resultSetOptimization * 100).toFixed(1)}%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">
                {state.language === 'en' ? 'Transaction Performance' : 'Rendimiento Transaccional'}
              </div>
              <div className="metric-value">{(metrics.transactionPerformance * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="visualization-section">
        <div className="visualization-header">
          <h2 className="section-title">
            {state.language === 'en' ? 'Database Architecture Visualization' : 'Visualización de Arquitectura de Base de Datos'}
          </h2>
          <div className="pattern-selector">
            {['ORM Layer', 'Connection Pool', 'Result Sets', 'Transactions'].map((pattern) => (
              <button
                key={pattern}
                className={`pattern-button ${selectedPattern === pattern ? 'active' : ''}`}
                onClick={() => setSelectedPattern(pattern)}
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>

        <div className="canvas-container">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[0, 10, 0]} intensity={0.8} />
            <DatabaseVisualization
              metrics={metrics}
              activePattern={selectedPattern}
              onPatternSelect={setSelectedPattern}
            />
          </Canvas>
        </div>
      </div>

      <div className="code-section">
        <div className="code-header">
          <h3 className="code-title">
            {examples[activeExample as keyof typeof examples].title}
          </h3>
          <button 
            className="copy-button"
            onClick={() => navigator.clipboard.writeText(examples[activeExample as keyof typeof examples].code)}
          >
            {state.language === 'en' ? 'Copy Code' : 'Copiar Código'}
          </button>
        </div>
        <div className="code-content">
          <pre className="code-block">
            {examples[activeExample as keyof typeof examples].code}
          </pre>
        </div>
        <div className="explanation">
          <p className="explanation-text">
            {examples[activeExample as keyof typeof examples].explanation}
          </p>
        </div>
      </div>

      <div className="key-concepts-section">
        <SectionTitle>{state.language === 'en' ? 'Key Database Integration Concepts' : 'Conceptos Clave de Integración de Base de Datos'}</SectionTitle>
<div className="concepts-grid">
          <div className="concept-card">
            <SectionTitle>{state.language === 'en' ? 'ORM with Smart Pointers' : 'ORM con Smart Pointers'}</SectionTitle>
            <ul>
              <li>{state.language === 'en' ? 'Entity lifecycle management with shared ownership' : 'Gestión de ciclo de vida de entidades con propiedad compartida'}</li>
              <li>{state.language === 'en' ? 'Repository pattern with smart pointer caching' : 'Patrón Repository con caché de smart pointers'}</li>
              <li>{state.language === 'en' ? 'Unit of Work pattern for transaction management' : 'Patrón Unit of Work para gestión de transacciones'}</li>
              <li>{state.language === 'en' ? 'Dirty tracking and lazy loading strategies' : 'Estrategias de seguimiento de cambios y carga perezosa'}</li>
              <li>{state.language === 'en' ? 'Entity factory with memory pool optimization' : 'Factory de entidades con optimización de pool de memoria'}</li>
            </ul>
          </div>
          
          <div className="concept-card">
            <SectionTitle>{state.language === 'en' ? 'Connection Pooling Architecture' : 'Arquitectura de Pool de Conexiones'}</SectionTitle>
<ul>
              <li>{state.language === 'en' ? 'RAII connection handles with automatic release' : 'Handles RAII de conexiones con liberación automática'}</li>
              <li>{state.language === 'en' ? 'Thread-safe connection pool with lifecycle management' : 'Pool de conexiones thread-safe con gestión de ciclo de vida'}</li>
              <li>{state.language === 'en' ? 'Health monitoring and automatic reconnection' : 'Monitoreo de salud y reconexión automática'}</li>
              <li>{state.language === 'en' ? 'Connection timeout and resource cleanup' : 'Timeout de conexiones y limpieza de recursos'}</li>
              <li>{state.language === 'en' ? 'Dynamic pool sizing and utilization tracking' : 'Dimensionado dinámico de pool y seguimiento de utilización'}</li>
            </ul>
          </div>
          
          <div className="concept-card">
            <SectionTitle>{state.language === 'en' ? 'Result Set Management' : 'Gestión de Conjuntos de Resultados'}</SectionTitle>
<ul>
              <li>{state.language === 'en' ? 'Lazy loading result sets with smart iterators' : 'Conjuntos de resultados con carga perezosa e iteradores inteligentes'}</li>
              <li>{state.language === 'en' ? 'Memory-efficient chunked processing' : 'Procesamiento por chunks eficiente en memoria'}</li>
              <li>{state.language === 'en' ? 'Result set aggregation with pointer management' : 'Agregación de conjuntos de resultados con gestión de punteros'}</li>
              <li>{state.language === 'en' ? 'Cache management and prefetching strategies' : 'Gestión de caché y estrategias de precarga'}</li>
              <li>{state.language === 'en' ? 'Streaming and pagination support' : 'Soporte para streaming y paginación'}</li>
            </ul>
          </div>
          
          <div className="concept-card">
            <SectionTitle>{state.language === 'en' ? 'Transaction Boundaries' : 'Límites Transaccionales'}</SectionTitle>
<ul>
              <li>{state.language === 'en' ? 'RAII transaction scopes with automatic rollback' : 'Ámbitos transaccionales RAII con rollback automático'}</li>
              <li>{state.language === 'en' ? 'Two-phase commit protocol implementation' : 'Implementación de protocolo de commit de dos fases'}</li>
              <li>{state.language === 'en' ? 'Savepoint management for nested transactions' : 'Gestión de savepoints para transacciones anidadas'}</li>
              <li>{state.language === 'en' ? 'Resource enlistment and coordination' : 'Alistamiento y coordinación de recursos'}</li>
              <li>{state.language === 'en' ? 'Transaction callback system and monitoring' : 'Sistema de callbacks transaccionales y monitoreo'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson118_DatabaseIntegrationPatterns;