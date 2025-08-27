/**
 * Lesson 89: Advanced Resource Ownership Models
 * Expert-level ownership patterns for high-performance C++ systems
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
  UndefinedBehaviorWarning,
  PerformanceComparison
} from '../design-system';

interface ResourceOwnershipState {
  language: 'en' | 'es';
  scenario: 'unique_ownership' | 'shared_ownership' | 'weak_ownership' | 'transfer_patterns' | 'custom_ownership' | 'thread_safe_ownership';
  isAnimating: boolean;
  uniqueOwners: number;
  sharedReferences: number;
  ownershipTransfers: number;
  memoryEfficiency: number;
}

// 3D Visualización de Resource Ownership
const ResourceOwnershipVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'unique_ownership') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        uniqueOwners: Math.floor(6 + Math.sin(animationRef.current * 2) * 3),
        ownershipTransfers: Math.floor(animationRef.current * 15) % 50,
        memoryEfficiency: 95 + Math.cos(animationRef.current) * 4
      });
    } else if (scenario === 'shared_ownership') {
      groupRef.current.rotation.x = Math.sin(animationRef.current) * 0.15;
      onMetrics({
        sharedReferences: Math.floor(8 + Math.cos(animationRef.current * 3) * 5),
        memoryEfficiency: 80 + Math.sin(animationRef.current * 1.5) * 15,
        ownershipTransfers: Math.floor(animationRef.current * 20) % 75
      });
    }
  });

  const renderOwnershipNodes = () => {
    const elements = [];
    const nodeCount = scenario === 'thread_safe_ownership' ? 20 : 16;
    
    for (let i = 0; i < nodeCount; i++) {
      let x, y, z;
      
      if (scenario === 'unique_ownership') {
        const angle = (i / nodeCount) * Math.PI * 2;
        x = Math.cos(angle) * (2.0 + (i % 2) * 0.5);
        y = Math.sin(angle) * (2.0 + (i % 2) * 0.5);
        z = 0;
      } else if (scenario === 'shared_ownership') {
        const centerCount = Math.min(nodeCount, 4);
        if (i < centerCount) {
          const angle = (i / centerCount) * Math.PI * 2;
          x = Math.cos(angle) * 0.8;
          y = Math.sin(angle) * 0.8;
          z = 0;
        } else {
          const outerIndex = i - centerCount;
          const angle = (outerIndex / (nodeCount - centerCount)) * Math.PI * 2;
          x = Math.cos(angle) * 2.5;
          y = Math.sin(angle) * 2.5;
          z = Math.sin(outerIndex * 0.5) * 0.3;
        }
      } else {
        const row = Math.floor(i / 4);
        const col = i % 4;
        x = col * 1.2 - 1.8;
        y = row * 1.2 - 2.4;
        z = scenario === 'transfer_patterns' ? Math.cos(animationRef.current + i * 0.3) * 0.2 : 0;
      }
      
      const color = scenario === 'unique_ownership'
        ? '#00ff00'  // Green for unique ownership
        : scenario === 'shared_ownership'
        ? (i < 4 ? '#0080ff' : '#8080ff')  // Blue variants for shared
        : scenario === 'weak_ownership'
        ? '#ffff00'  // Yellow for weak references
        : scenario === 'transfer_patterns'
        ? '#ff8000'  // Orange for transfers
        : scenario === 'custom_ownership'
        ? '#ff00ff'  // Magenta for custom
        : '#ffffff'; // White for thread-safe
      
      const scale = scenario === 'shared_ownership' && i < 4 ? 1.5 : 1.0;
      
      elements.push(
        <mesh key={i} position={[x, y, z]} scale={[scale, scale, scale]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
    
    return elements;
  };

  return (
    <group ref={groupRef}>
      {renderOwnershipNodes()}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, 5]} intensity={0.5} />
    </group>
  );
};

const Lesson89_ResourceOwnership: React.FC = () => {
  const [state, setState] = useState<ResourceOwnershipState>({
    language: 'en',
    scenario: 'unique_ownership',
    isAnimating: false,
    uniqueOwners: 0,
    sharedReferences: 0,
    ownershipTransfers: 0,
    memoryEfficiency: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: ResourceOwnershipState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      unique_ownership: state.language === 'en' ? 'Unique Ownership' : 'Propiedad Única',
      shared_ownership: state.language === 'en' ? 'Shared Ownership' : 'Propiedad Compartida',
      weak_ownership: state.language === 'en' ? 'Weak Ownership' : 'Propiedad Débil',
      transfer_patterns: state.language === 'en' ? 'Transfer Patterns' : 'Patrones de Transferencia',
      custom_ownership: state.language === 'en' ? 'Custom Ownership' : 'Propiedad Personalizada',
      thread_safe_ownership: state.language === 'en' ? 'Thread-Safe Ownership' : 'Propiedad Thread-Safe'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    unique_ownership: `// Unique Ownership Patterns with unique_ptr
#include <memory>
#include <vector>
#include <iostream>
#include <algorithm>

// Resource with unique ownership
class ExpensiveResource {
private:
    std::string name_;
    std::vector<double> data_;
    
public:
    ExpensiveResource(const std::string& name, size_t size = 1000) 
        : name_(name), data_(size) {
        std::iota(data_.begin(), data_.end(), 1.0);
        std::cout << "Created resource: " << name_ << std::endl;
    }
    
    ~ExpensiveResource() {
        std::cout << "Destroyed resource: " << name_ << std::endl;
    }
    
    const std::string& name() const { return name_; }
    double compute() const {
        return std::accumulate(data_.begin(), data_.end(), 0.0);
    }
    
    // Move-only semantics for unique ownership
    ExpensiveResource(const ExpensiveResource&) = delete;
    ExpensiveResource& operator=(const ExpensiveResource&) = delete;
    
    ExpensiveResource(ExpensiveResource&&) = default;
    ExpensiveResource& operator=(ExpensiveResource&&) = default;
};

// Factory function for unique resources
std::unique_ptr<ExpensiveResource> createResource(const std::string& name) {
    return std::make_unique<ExpensiveResource>(name);
}

// Resource manager with unique ownership
class ResourceManager {
private:
    std::vector<std::unique_ptr<ExpensiveResource>> resources_;
    
public:
    void addResource(std::unique_ptr<ExpensiveResource> resource) {
        if (resource) {
            std::cout << "Managing resource: " << resource->name() << std::endl;
            resources_.push_back(std::move(resource));
        }
    }
    
    std::unique_ptr<ExpensiveResource> removeResource(const std::string& name) {
        auto it = std::find_if(resources_.begin(), resources_.end(),
            [&name](const std::unique_ptr<ExpensiveResource>& res) {
                return res->name() == name;
            });
        
        if (it != resources_.end()) {
            auto resource = std::move(*it);
            resources_.erase(it);
            std::cout << "Released resource: " << name << std::endl;
            return resource;
        }
        
        return nullptr;
    }
    
    void processAll() {
        for (const auto& resource : resources_) {
            std::cout << "Processing " << resource->name() 
                      << " result: " << resource->compute() << std::endl;
        }
    }
    
    size_t count() const { return resources_.size(); }
    
    // Clear all resources (demonstrates RAII cleanup)
    void clear() {
        std::cout << "Clearing " << resources_.size() << " resources..." << std::endl;
        resources_.clear(); // Automatic cleanup via unique_ptr destructors
    }
};

// Ownership transfer chain
class ProcessingPipeline {
private:
    std::vector<std::function<std::unique_ptr<ExpensiveResource>(std::unique_ptr<ExpensiveResource>)>> stages_;
    
public:
    void addStage(std::function<std::unique_ptr<ExpensiveResource>(std::unique_ptr<ExpensiveResource>)> stage) {
        stages_.push_back(std::move(stage));
    }
    
    std::unique_ptr<ExpensiveResource> process(std::unique_ptr<ExpensiveResource> input) {
        for (auto& stage : stages_) {
            input = stage(std::move(input));
            if (!input) {
                std::cout << "Processing failed at stage" << std::endl;
                break;
            }
        }
        return input;
    }
};

void demonstrate_unique_ownership() {
    std::cout << "=== Unique Ownership Demonstration ===" << std::endl;
    
    ResourceManager manager;
    
    // Create and transfer ownership to manager
    manager.addResource(createResource("Resource1"));
    manager.addResource(createResource("Resource2"));
    manager.addResource(createResource("Resource3"));
    
    std::cout << "Manager has " << manager.count() << " resources" << std::endl;
    
    // Process all resources
    manager.processAll();
    
    // Transfer ownership back
    auto resource = manager.removeResource("Resource2");
    if (resource) {
        std::cout << "Extracted resource: " << resource->name() << std::endl;
    }
    
    // Create processing pipeline
    ProcessingPipeline pipeline;
    
    pipeline.addStage([](std::unique_ptr<ExpensiveResource> res) -> std::unique_ptr<ExpensiveResource> {
        std::cout << "Stage 1: Validating " << res->name() << std::endl;
        return res; // Pass through
    });
    
    pipeline.addStage([](std::unique_ptr<ExpensiveResource> res) -> std::unique_ptr<ExpensiveResource> {
        std::cout << "Stage 2: Processing " << res->name() << std::endl;
        return res; // Pass through
    });
    
    // Process through pipeline
    auto result = pipeline.process(std::move(resource));
    
    // Cleanup
    manager.clear();
    
    std::cout << "Final resource: " << (result ? result->name() : "none") << std::endl;
}`,

    shared_ownership: `// Shared Ownership Models with shared_ptr
#include <memory>
#include <vector>
#include <map>
#include <string>
#include <iostream>
#include <thread>
#include <mutex>

// Shared resource with reference counting
class SharedCache {
private:
    std::map<std::string, std::string> data_;
    mutable std::shared_mutex mutex_;
    std::string name_;
    
public:
    explicit SharedCache(const std::string& name) : name_(name) {
        std::cout << "Created shared cache: " << name_ << std::endl;
    }
    
    ~SharedCache() {
        std::cout << "Destroyed shared cache: " << name_ << std::endl;
    }
    
    void put(const std::string& key, const std::string& value) {
        std::unique_lock lock(mutex_);
        data_[key] = value;
        std::cout << "Cache " << name_ << " stored: " << key << std::endl;
    }
    
    std::string get(const std::string& key) const {
        std::shared_lock lock(mutex_);
        auto it = data_.find(key);
        return it != data_.end() ? it->second : "";
    }
    
    size_t size() const {
        std::shared_lock lock(mutex_);
        return data_.size();
    }
    
    const std::string& name() const { return name_; }
};

// Multiple owners sharing a resource
class CacheUser {
private:
    std::shared_ptr<SharedCache> cache_;
    std::string user_name_;
    
public:
    CacheUser(const std::string& name, std::shared_ptr<SharedCache> cache)
        : user_name_(name), cache_(std::move(cache)) {
        std::cout << "User " << user_name_ << " connected to cache" << std::endl;
    }
    
    ~CacheUser() {
        std::cout << "User " << user_name_ << " disconnected from cache" << std::endl;
    }
    
    void storeData(const std::string& key, const std::string& value) {
        if (cache_) {
            cache_->put(user_name_ + "_" + key, value);
        }
    }
    
    std::string loadData(const std::string& key) const {
        return cache_ ? cache_->get(user_name_ + "_" + key) : "";
    }
    
    void reportStats() const {
        if (cache_) {
            std::cout << "User " << user_name_ << " sees cache size: " 
                      << cache_->size() << " (refs: " << cache_.use_count() << ")" << std::endl;
        }
    }
    
    std::shared_ptr<SharedCache> getCache() const { return cache_; }
};

// Shared resource factory
class CacheManager {
private:
    static std::map<std::string, std::weak_ptr<SharedCache>> cache_registry_;
    static std::mutex registry_mutex_;
    
public:
    static std::shared_ptr<SharedCache> getOrCreateCache(const std::string& name) {
        std::lock_guard<std::mutex> lock(registry_mutex_);
        
        // Check if cache already exists
        auto it = cache_registry_.find(name);
        if (it != cache_registry_.end()) {
            if (auto existing = it->second.lock()) {
                std::cout << "Reusing existing cache: " << name << std::endl;
                return existing;
            } else {
                // Weak pointer expired, remove from registry
                cache_registry_.erase(it);
            }
        }
        
        // Create new cache
        auto cache = std::make_shared<SharedCache>(name);
        cache_registry_[name] = cache;
        std::cout << "Created new shared cache: " << name << std::endl;
        return cache;
    }
    
    static void cleanup() {
        std::lock_guard<std::mutex> lock(registry_mutex_);
        
        auto it = cache_registry_.begin();
        while (it != cache_registry_.end()) {
            if (it->second.expired()) {
                std::cout << "Cleaning up expired cache: " << it->first << std::endl;
                it = cache_registry_.erase(it);
            } else {
                ++it;
            }
        }
    }
    
    static size_t registrySize() {
        std::lock_guard<std::mutex> lock(registry_mutex_);
        return cache_registry_.size();
    }
};

// Static member definitions
std::map<std::string, std::weak_ptr<SharedCache>> CacheManager::cache_registry_;
std::mutex CacheManager::registry_mutex_;

// Circular reference prevention
class Node {
private:
    std::string name_;
    std::vector<std::shared_ptr<Node>> children_;
    std::weak_ptr<Node> parent_; // Weak to prevent cycles
    
public:
    explicit Node(const std::string& name) : name_(name) {
        std::cout << "Created node: " << name_ << std::endl;
    }
    
    ~Node() {
        std::cout << "Destroyed node: " << name_ << std::endl;
    }
    
    void addChild(std::shared_ptr<Node> child) {
        if (child) {
            child->parent_ = shared_from_this();
            children_.push_back(std::move(child));
            std::cout << "Added child to " << name_ << std::endl;
        }
    }
    
    std::shared_ptr<Node> getParent() const {
        return parent_.lock();
    }
    
    const std::vector<std::shared_ptr<Node>>& getChildren() const {
        return children_;
    }
    
    const std::string& name() const { return name_; }
    
    void printHierarchy(int depth = 0) const {
        std::cout << std::string(depth * 2, ' ') << name_ 
                  << " (refs: " << shared_from_this().use_count() << ")" << std::endl;
        for (const auto& child : children_) {
            child->printHierarchy(depth + 1);
        }
    }
};

// Enable shared_from_this
class Node : public std::enable_shared_from_this<Node> {
    // ... (same implementation as above)
};

void demonstrate_shared_ownership() {
    std::cout << "=== Shared Ownership Demonstration ===" << std::endl;
    
    // Create shared cache users
    {
        auto cache = CacheManager::getOrCreateCache("main_cache");
        
        std::vector<std::unique_ptr<CacheUser>> users;
        users.push_back(std::make_unique<CacheUser>("Alice", cache));
        users.push_back(std::make_unique<CacheUser>("Bob", cache));
        users.push_back(std::make_unique<CacheUser>("Charlie", cache));
        
        // Users interact with shared cache
        users[0]->storeData("config", "value1");
        users[1]->storeData("settings", "value2");
        users[2]->storeData("data", "value3");
        
        // Report statistics
        for (const auto& user : users) {
            user->reportStats();
        }
        
        std::cout << "Registry size: " << CacheManager::registrySize() << std::endl;
        
        // Users go out of scope, but cache remains if others hold references
        auto another_cache = CacheManager::getOrCreateCache("main_cache");
        std::cout << "Same cache instance: " << (cache == another_cache) << std::endl;
    }
    
    // Test hierarchical structure without cycles
    {
        auto root = std::make_shared<Node>("Root");
        auto child1 = std::make_shared<Node>("Child1");
        auto child2 = std::make_shared<Node>("Child2");
        auto grandchild = std::make_shared<Node>("Grandchild");
        
        root->addChild(child1);
        root->addChild(child2);
        child1->addChild(grandchild);
        
        std::cout << "Hierarchy:" << std::endl;
        root->printHierarchy();
        
        // Verify parent-child relationships
        auto parent = grandchild->getParent();
        std::cout << "Grandchild's parent: " << (parent ? parent->name() : "none") << std::endl;
        
    } // Automatic cleanup due to shared_ptr reference counting
    
    // Cleanup expired cache entries
    CacheManager::cleanup();
    std::cout << "Final registry size: " << CacheManager::registrySize() << std::endl;
}`,

    weak_ownership: `// Weak Ownership and Observer Patterns
#include <memory>
#include <vector>
#include <iostream>
#include <algorithm>
#include <string>

// Subject in Observer pattern
class EventPublisher {
private:
    std::vector<std::weak_ptr<class EventObserver>> observers_;
    std::string name_;
    
public:
    explicit EventPublisher(const std::string& name) : name_(name) {
        std::cout << "Created publisher: " << name_ << std::endl;
    }
    
    ~EventPublisher() {
        std::cout << "Destroyed publisher: " << name_ << std::endl;
    }
    
    void subscribe(std::weak_ptr<EventObserver> observer) {
        observers_.push_back(observer);
        cleanupExpiredObservers();
        std::cout << "Subscriber added to " << name_ << " (total: " << observers_.size() << ")" << std::endl;
    }
    
    void unsubscribe(std::weak_ptr<EventObserver> observer) {
        // Compare weak_ptr by converting to shared_ptr temporarily
        auto shared_observer = observer.lock();
        if (!shared_observer) return;
        
        observers_.erase(
            std::remove_if(observers_.begin(), observers_.end(),
                [&shared_observer](const std::weak_ptr<EventObserver>& weak_obs) {
                    auto obs = weak_obs.lock();
                    return obs == shared_observer;
                }),
            observers_.end());
        
        std::cout << "Subscriber removed from " << name_ << std::endl;
    }
    
    void publishEvent(const std::string& event) {
        std::cout << "Publishing event '" << event << "' from " << name_ << std::endl;
        
        cleanupExpiredObservers();
        
        for (auto& weak_observer : observers_) {
            if (auto observer = weak_observer.lock()) {
                observer->onEvent(name_, event);
            }
        }
        
        std::cout << "Event delivered to " << observers_.size() << " observers" << std::endl;
    }
    
    const std::string& name() const { return name_; }
    size_t observerCount() const { return observers_.size(); }
    
private:
    void cleanupExpiredObservers() {
        observers_.erase(
            std::remove_if(observers_.begin(), observers_.end(),
                [](const std::weak_ptr<EventObserver>& weak_obs) {
                    return weak_obs.expired();
                }),
            observers_.end());
    }
};

// Observer with automatic cleanup
class EventObserver : public std::enable_shared_from_this<EventObserver> {
private:
    std::string name_;
    std::vector<std::weak_ptr<EventPublisher>> subscriptions_;
    
public:
    explicit EventObserver(const std::string& name) : name_(name) {
        std::cout << "Created observer: " << name_ << std::endl;
    }
    
    ~EventObserver() {
        std::cout << "Destroyed observer: " << name_ << std::endl;
        // No need to manually unsubscribe - weak_ptr handles it automatically
    }
    
    void subscribeTo(std::shared_ptr<EventPublisher> publisher) {
        if (publisher) {
            publisher->subscribe(weak_from_this());
            subscriptions_.push_back(publisher);
            std::cout << "Observer " << name_ << " subscribed to " << publisher->name() << std::endl;
        }
    }
    
    void unsubscribeFrom(std::shared_ptr<EventPublisher> publisher) {
        if (publisher) {
            publisher->unsubscribe(weak_from_this());
            
            // Remove from our subscription list
            subscriptions_.erase(
                std::remove_if(subscriptions_.begin(), subscriptions_.end(),
                    [&publisher](const std::weak_ptr<EventPublisher>& weak_pub) {
                        auto pub = weak_pub.lock();
                        return pub == publisher;
                    }),
                subscriptions_.end());
            
            std::cout << "Observer " << name_ << " unsubscribed from " << publisher->name() << std::endl;
        }
    }
    
    void onEvent(const std::string& publisher_name, const std::string& event) {
        std::cout << "Observer " << name_ << " received event '" << event 
                  << "' from " << publisher_name << std::endl;
    }
    
    const std::string& name() const { return name_; }
    
    size_t subscriptionCount() const {
        // Count only valid subscriptions
        return std::count_if(subscriptions_.begin(), subscriptions_.end(),
            [](const std::weak_ptr<EventPublisher>& weak_pub) {
                return !weak_pub.expired();
            });
    }
    
    std::weak_ptr<EventObserver> weak_from_this() {
        return std::weak_ptr<EventObserver>(shared_from_this());
    }
};

// Cache with weak reference cleanup
template<typename Key, typename Value>
class WeakCache {
private:
    mutable std::mutex mutex_;
    std::map<Key, std::weak_ptr<Value>> cache_;
    
public:
    void store(const Key& key, std::shared_ptr<Value> value) {
        std::lock_guard<std::mutex> lock(mutex_);
        cache_[key] = value;
        std::cout << "Stored in weak cache (size: " << cache_.size() << ")" << std::endl;
    }
    
    std::shared_ptr<Value> retrieve(const Key& key) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        auto it = cache_.find(key);
        if (it != cache_.end()) {
            if (auto value = it->second.lock()) {
                std::cout << "Cache hit for key" << std::endl;
                return value;
            } else {
                // Expired, remove from cache
                cache_.erase(it);
                std::cout << "Cache entry expired, removed" << std::endl;
            }
        }
        
        std::cout << "Cache miss for key" << std::endl;
        return nullptr;
    }
    
    void cleanup() {
        std::lock_guard<std::mutex> lock(mutex_);
        
        auto it = cache_.begin();
        while (it != cache_.end()) {
            if (it->second.expired()) {
                it = cache_.erase(it);
            } else {
                ++it;
            }
        }
        
        std::cout << "Cache cleaned up, size: " << cache_.size() << std::endl;
    }
    
    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return cache_.size();
    }
};

void demonstrate_weak_ownership() {
    std::cout << "=== Weak Ownership Demonstration ===" << std::endl;
    
    // Observer pattern with automatic cleanup
    {
        auto publisher1 = std::make_shared<EventPublisher>("NewsPublisher");
        auto publisher2 = std::make_shared<EventPublisher>("WeatherPublisher");
        
        {
            auto observer1 = std::make_shared<EventObserver>("Alice");
            auto observer2 = std::make_shared<EventObserver>("Bob");
            auto observer3 = std::make_shared<EventObserver>("Charlie");
            
            // Subscribe observers to publishers
            observer1->subscribeTo(publisher1);
            observer1->subscribeTo(publisher2);
            observer2->subscribeTo(publisher1);
            observer3->subscribeTo(publisher2);
            
            std::cout << "\\nInitial state:" << std::endl;
            std::cout << "Publisher1 observers: " << publisher1->observerCount() << std::endl;
            std::cout << "Publisher2 observers: " << publisher2->observerCount() << std::endl;
            
            // Publish events
            publisher1->publishEvent("Breaking News!");
            publisher2->publishEvent("Sunny Weather");
            
            // Manual unsubscribe
            observer1->unsubscribeFrom(publisher2);
            
            std::cout << "\\nAfter unsubscribe:" << std::endl;
            std::cout << "Publisher2 observers: " << publisher2->observerCount() << std::endl;
            
            publisher2->publishEvent("Rain Expected");
            
        } // Observers go out of scope
        
        std::cout << "\\nAfter observers destroyed:" << std::endl;
        std::cout << "Publisher1 observers: " << publisher1->observerCount() << std::endl;
        std::cout << "Publisher2 observers: " << publisher2->observerCount() << std::endl;
        
        // Publishing to no observers
        publisher1->publishEvent("Final News");
    }
    
    // Weak cache demonstration
    {
        WeakCache<int, std::string> cache;
        
        {
            auto data1 = std::make_shared<std::string>("Important Data");
            auto data2 = std::make_shared<std::string>("Temporary Data");
            
            cache.store(1, data1);
            cache.store(2, data2);
            
            // Retrieve while data is alive
            auto retrieved1 = cache.retrieve(1);
            std::cout << "Retrieved: " << (retrieved1 ? *retrieved1 : "null") << std::endl;
            
            // data2 goes out of scope, but data1 remains
            data2.reset();
            
            auto retrieved2 = cache.retrieve(2); // Should be expired
            std::cout << "Retrieved expired: " << (retrieved2 ? *retrieved2 : "null") << std::endl;
            
        } // data1 goes out of scope
        
        cache.cleanup();
        std::cout << "Final cache size: " << cache.size() << std::endl;
    }
}`,

    transfer_patterns: `// Advanced Ownership Transfer Patterns
#include <memory>
#include <functional>
#include <queue>
#include <vector>
#include <iostream>
#include <thread>
#include <future>

// Transfer ownership through factory chains
template<typename T>
class OwnershipChain {
private:
    std::vector<std::function<std::unique_ptr<T>(std::unique_ptr<T>)>> transformers_;
    
public:
    void addTransformer(std::function<std::unique_ptr<T>(std::unique_ptr<T>)> transformer) {
        transformers_.push_back(std::move(transformer));
    }
    
    std::unique_ptr<T> process(std::unique_ptr<T> input) {
        for (auto& transformer : transformers_) {
            input = transformer(std::move(input));
            if (!input) {
                std::cout << "Chain broken - transformation failed" << std::endl;
                break;
            }
        }
        return input;
    }
    
    size_t chainLength() const { return transformers_.size(); }
};

// Resource with transfer semantics
class TransferableResource {
private:
    std::string id_;
    std::vector<int> data_;
    bool processed_;
    
public:
    explicit TransferableResource(const std::string& id, size_t size = 1000) 
        : id_(id), data_(size), processed_(false) {
        std::iota(data_.begin(), data_.end(), 1);
        std::cout << "Created transferable resource: " << id_ << std::endl;
    }
    
    ~TransferableResource() {
        std::cout << "Destroyed transferable resource: " << id_ << std::endl;
    }
    
    // Move-only semantics
    TransferableResource(const TransferableResource&) = delete;
    TransferableResource& operator=(const TransferableResource&) = delete;
    
    TransferableResource(TransferableResource&&) = default;
    TransferableResource& operator=(TransferableResource&&) = default;
    
    void process() {
        if (!processed_) {
            // Simulate processing
            std::for_each(data_.begin(), data_.end(), [](int& x) { x *= 2; });
            processed_ = true;
            std::cout << "Processed resource: " << id_ << std::endl;
        }
    }
    
    const std::string& id() const { return id_; }
    bool isProcessed() const { return processed_; }
    size_t dataSize() const { return data_.size(); }
    
    int checksum() const {
        return std::accumulate(data_.begin(), data_.end(), 0) % 10000;
    }
};

// Async ownership transfer
class AsyncProcessor {
private:
    std::queue<std::packaged_task<std::unique_ptr<TransferableResource>()>> task_queue_;
    std::mutex queue_mutex_;
    std::condition_variable cv_;
    std::vector<std::thread> workers_;
    std::atomic<bool> stop_flag_{false};
    
    void worker_thread() {
        while (!stop_flag_) {
            std::packaged_task<std::unique_ptr<TransferableResource>()> task;
            
            {
                std::unique_lock<std::mutex> lock(queue_mutex_);
                cv_.wait(lock, [this] { return !task_queue_.empty() || stop_flag_; });
                
                if (stop_flag_) break;
                
                if (!task_queue_.empty()) {
                    task = std::move(task_queue_.front());
                    task_queue_.pop();
                }
            }
            
            if (task.valid()) {
                task(); // Execute the task
            }
        }
    }
    
public:
    AsyncProcessor(size_t num_workers = 2) {
        for (size_t i = 0; i < num_workers; ++i) {
            workers_.emplace_back(&AsyncProcessor::worker_thread, this);
        }
    }
    
    ~AsyncProcessor() {
        stop_flag_ = true;
        cv_.notify_all();
        
        for (auto& worker : workers_) {
            if (worker.joinable()) {
                worker.join();
            }
        }
    }
    
    std::future<std::unique_ptr<TransferableResource>> 
    processAsync(std::unique_ptr<TransferableResource> resource) {
        auto task = std::packaged_task<std::unique_ptr<TransferableResource>()>(
            [resource = std::move(resource)]() mutable -> std::unique_ptr<TransferableResource> {
                if (resource) {
                    resource->process();
                    std::this_thread::sleep_for(std::chrono::milliseconds(100));
                    std::cout << "Async processing completed for: " << resource->id() << std::endl;
                }
                return std::move(resource);
            });
        
        auto future = task.get_future();
        
        {
            std::lock_guard<std::mutex> lock(queue_mutex_);
            task_queue_.push(std::move(task));
        }
        
        cv_.notify_one();
        return future;
    }
};

// Conditional ownership transfer
class ConditionalTransferManager {
public:
    enum class TransferCondition {
        ALWAYS,
        ON_SUCCESS,
        ON_FAILURE,
        CONDITIONAL
    };
    
    template<typename T, typename Condition>
    static std::unique_ptr<T> conditionalTransfer(
        std::unique_ptr<T> resource,
        Condition condition,
        TransferCondition transfer_type = TransferCondition::ON_SUCCESS) {
        
        bool should_transfer = false;
        bool condition_result = false;
        
        try {
            condition_result = condition(*resource);
            
            switch (transfer_type) {
                case TransferCondition::ALWAYS:
                    should_transfer = true;
                    break;
                case TransferCondition::ON_SUCCESS:
                    should_transfer = condition_result;
                    break;
                case TransferCondition::ON_FAILURE:
                    should_transfer = !condition_result;
                    break;
                case TransferCondition::CONDITIONAL:
                    should_transfer = condition_result;
                    break;
            }
            
        } catch (const std::exception& e) {
            std::cout << "Condition evaluation failed: " << e.what() << std::endl;
            should_transfer = (transfer_type == TransferCondition::ON_FAILURE);
        }
        
        if (should_transfer) {
            std::cout << "Ownership transferred based on condition result: " 
                      << condition_result << std::endl;
            return std::move(resource);
        } else {
            std::cout << "Ownership retained based on condition result: " 
                      << condition_result << std::endl;
            return nullptr;
        }
    }
};

// Batch ownership transfer
template<typename T>
class BatchTransferManager {
private:
    std::vector<std::unique_ptr<T>> batch_;
    size_t batch_size_limit_;
    
public:
    explicit BatchTransferManager(size_t batch_size = 10) 
        : batch_size_limit_(batch_size) {
        batch_.reserve(batch_size);
    }
    
    void addToBatch(std::unique_ptr<T> item) {
        if (item) {
            batch_.push_back(std::move(item));
            std::cout << "Added to batch (size: " << batch_.size() << ")" << std::endl;
            
            if (batch_.size() >= batch_size_limit_) {
                processBatch();
            }
        }
    }
    
    std::vector<std::unique_ptr<T>> transferBatch() {
        auto result = std::move(batch_);
        batch_.clear();
        batch_.reserve(batch_size_limit_);
        
        std::cout << "Transferred batch of " << result.size() << " items" << std::endl;
        return result;
    }
    
    void processBatch() {
        std::cout << "Processing batch of " << batch_.size() << " items..." << std::endl;
        
        for (auto& item : batch_) {
            if (item) {
                item->process();
            }
        }
        
        std::cout << "Batch processing completed" << std::endl;
    }
    
    size_t batchSize() const { return batch_.size(); }
    bool isFull() const { return batch_.size() >= batch_size_limit_; }
};

void demonstrate_transfer_patterns() {
    std::cout << "=== Ownership Transfer Patterns ===" << std::endl;
    
    // Chain processing with ownership transfer
    {
        OwnershipChain<TransferableResource> chain;
        
        chain.addTransformer([](std::unique_ptr<TransferableResource> res) -> std::unique_ptr<TransferableResource> {
            if (res) {
                std::cout << "Stage 1: Validating " << res->id() << std::endl;
                if (res->dataSize() > 0) return res;
            }
            return nullptr;
        });
        
        chain.addTransformer([](std::unique_ptr<TransferableResource> res) -> std::unique_ptr<TransferableResource> {
            if (res) {
                std::cout << "Stage 2: Processing " << res->id() << std::endl;
                res->process();
                return res;
            }
            return nullptr;
        });
        
        chain.addTransformer([](std::unique_ptr<TransferableResource> res) -> std::unique_ptr<TransferableResource> {
            if (res) {
                std::cout << "Stage 3: Finalizing " << res->id() 
                          << " (checksum: " << res->checksum() << ")" << std::endl;
                return res;
            }
            return nullptr;
        });
        
        // Process through chain
        auto input = std::make_unique<TransferableResource>("ChainResource");
        auto output = chain.process(std::move(input));
        
        std::cout << "Chain result: " << (output ? output->id() : "failed") << std::endl;
    }
    
    // Async transfer processing
    {
        AsyncProcessor processor;
        
        std::vector<std::future<std::unique_ptr<TransferableResource>>> futures;
        
        // Submit multiple resources for async processing
        for (int i = 0; i < 5; ++i) {
            auto resource = std::make_unique<TransferableResource>("AsyncResource" + std::to_string(i));
            futures.push_back(processor.processAsync(std::move(resource)));
        }
        
        // Collect results
        for (auto& future : futures) {
            auto result = future.get();
            if (result) {
                std::cout << "Received processed resource: " << result->id() << std::endl;
            }
        }
    }
    
    // Conditional transfer
    {
        auto resource = std::make_unique<TransferableResource>("ConditionalResource");
        
        auto transferred = ConditionalTransferManager::conditionalTransfer(
            std::move(resource),
            [](const TransferableResource& res) { return res.dataSize() > 500; },
            ConditionalTransferManager::TransferCondition::ON_SUCCESS
        );
        
        std::cout << "Conditional transfer result: " << (transferred ? "success" : "retained") << std::endl;
    }
    
    // Batch transfer
    {
        BatchTransferManager<TransferableResource> batchManager(3);
        
        for (int i = 0; i < 7; ++i) {
            auto resource = std::make_unique<TransferableResource>("BatchResource" + std::to_string(i));
            batchManager.addToBatch(std::move(resource));
        }
        
        // Transfer remaining batch
        if (batchManager.batchSize() > 0) {
            auto remaining = batchManager.transferBatch();
            std::cout << "Final batch contained " << remaining.size() << " items" << std::endl;
        }
    }
}`,

    custom_ownership: `// Custom Ownership Models for Specialized Resources
#include <memory>
#include <atomic>
#include <vector>
#include <functional>
#include <iostream>
#include <chrono>
#include <type_traits>

// Custom reference counting for specialized resources
template<typename T>
class RefCountedPtr {
private:
    struct ControlBlock {
        std::atomic<size_t> ref_count{1};
        std::atomic<size_t> weak_count{0};
        T* object;
        std::function<void(T*)> deleter;
        
        ControlBlock(T* obj, std::function<void(T*)> del) 
            : object(obj), deleter(std::move(del)) {}
    };
    
    ControlBlock* control_block_;
    
    void increment() {
        if (control_block_) {
            control_block_->ref_count.fetch_add(1, std::memory_order_relaxed);
        }
    }
    
    void decrement() {
        if (control_block_ && 
            control_block_->ref_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            
            // Last reference - delete object
            control_block_->deleter(control_block_->object);
            control_block_->object = nullptr;
            
            // Check if we should delete control block
            if (control_block_->weak_count.load(std::memory_order_acquire) == 0) {
                delete control_block_;
            }
        }
    }
    
public:
    // Constructor
    template<typename... Args>
    explicit RefCountedPtr(Args&&... args) {
        auto* obj = new T(std::forward<Args>(args)...);
        control_block_ = new ControlBlock(obj, [](T* ptr) { delete ptr; });
    }
    
    // Custom deleter constructor
    template<typename Deleter>
    RefCountedPtr(T* obj, Deleter deleter) 
        : control_block_(new ControlBlock(obj, std::move(deleter))) {}
    
    // Copy constructor
    RefCountedPtr(const RefCountedPtr& other) : control_block_(other.control_block_) {
        increment();
    }
    
    // Move constructor
    RefCountedPtr(RefCountedPtr&& other) noexcept : control_block_(other.control_block_) {
        other.control_block_ = nullptr;
    }
    
    // Destructor
    ~RefCountedPtr() {
        decrement();
    }
    
    // Assignment operators
    RefCountedPtr& operator=(const RefCountedPtr& other) {
        if (this != &other) {
            decrement();
            control_block_ = other.control_block_;
            increment();
        }
        return *this;
    }
    
    RefCountedPtr& operator=(RefCountedPtr&& other) noexcept {
        if (this != &other) {
            decrement();
            control_block_ = other.control_block_;
            other.control_block_ = nullptr;
        }
        return *this;
    }
    
    // Access operators
    T* operator->() const { return control_block_ ? control_block_->object : nullptr; }
    T& operator*() const { return *control_block_->object; }
    T* get() const { return control_block_ ? control_block_->object : nullptr; }
    
    // Utility functions
    size_t use_count() const { 
        return control_block_ ? control_block_->ref_count.load(std::memory_order_acquire) : 0; 
    }
    
    bool unique() const { return use_count() == 1; }
    explicit operator bool() const { return get() != nullptr; }
    
    void reset() {
        decrement();
        control_block_ = nullptr;
    }
    
    template<typename... Args>
    void reset(Args&&... args) {
        reset();
        auto* obj = new T(std::forward<Args>(args)...);
        control_block_ = new ControlBlock(obj, [](T* ptr) { delete ptr; });
    }
};

// Copy-on-Write ownership for expensive-to-copy resources
template<typename T>
class CowPtr {
private:
    struct CowData {
        mutable std::atomic<size_t> ref_count{1};
        T data;
        
        template<typename... Args>
        explicit CowData(Args&&... args) : data(std::forward<Args>(args)...) {}
    };
    
    CowData* data_;
    
    void detach() {
        if (data_ && data_->ref_count.load(std::memory_order_acquire) > 1) {
            // Make a copy for modification
            auto* new_data = new CowData(data_->data);
            
            // Decrease reference count of old data
            if (data_->ref_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                delete data_;
            }
            
            data_ = new_data;
            std::cout << "COW: Detached for modification" << std::endl;
        }
    }
    
public:
    template<typename... Args>
    explicit CowPtr(Args&&... args) : data_(new CowData(std::forward<Args>(args)...)) {}
    
    CowPtr(const CowPtr& other) : data_(other.data_) {
        if (data_) {
            data_->ref_count.fetch_add(1, std::memory_order_relaxed);
            std::cout << "COW: Shallow copy (refs: " << data_->ref_count << ")" << std::endl;
        }
    }
    
    CowPtr(CowPtr&& other) noexcept : data_(other.data_) {
        other.data_ = nullptr;
    }
    
    ~CowPtr() {
        if (data_ && data_->ref_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            delete data_;
        }
    }
    
    CowPtr& operator=(const CowPtr& other) {
        if (this != &other) {
            if (data_ && data_->ref_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                delete data_;
            }
            
            data_ = other.data_;
            if (data_) {
                data_->ref_count.fetch_add(1, std::memory_order_relaxed);
            }
        }
        return *this;
    }
    
    // Read-only access (no detach needed)
    const T& operator*() const { return data_->data; }
    const T* operator->() const { return &data_->data; }
    const T* get() const { return &data_->data; }
    
    // Mutable access (triggers detach if necessary)
    T& operator*() { detach(); return data_->data; }
    T* operator->() { detach(); return &data_->data; }
    T* get() { detach(); return &data_->data; }
    
    size_t use_count() const { 
        return data_ ? data_->ref_count.load(std::memory_order_acquire) : 0; 
    }
    
    bool unique() const { return use_count() == 1; }
};

// Ownership with automatic pooling
template<typename T>
class PooledPtr {
private:
    static thread_local std::vector<T*> pool_;
    static constexpr size_t MAX_POOL_SIZE = 10;
    
    T* object_;
    bool from_pool_;
    
public:
    template<typename... Args>
    explicit PooledPtr(Args&&... args) : from_pool_(false) {
        // Try to get from pool first
        if (!pool_.empty()) {
            object_ = pool_.back();
            pool_.pop_back();
            from_pool_ = true;
            
            // Reconstruct in place
            object_->~T();
            new (object_) T(std::forward<Args>(args)...);
            
            std::cout << "PooledPtr: Reused from pool" << std::endl;
        } else {
            object_ = new T(std::forward<Args>(args)...);
            std::cout << "PooledPtr: Created new object" << std::endl;
        }
    }
    
    ~PooledPtr() {
        if (object_) {
            if (pool_.size() < MAX_POOL_SIZE) {
                pool_.push_back(object_);
                std::cout << "PooledPtr: Returned to pool (size: " << pool_.size() << ")" << std::endl;
            } else {
                delete object_;
                std::cout << "PooledPtr: Deleted (pool full)" << std::endl;
            }
        }
    }
    
    // Move-only semantics
    PooledPtr(const PooledPtr&) = delete;
    PooledPtr& operator=(const PooledPtr&) = delete;
    
    PooledPtr(PooledPtr&& other) noexcept 
        : object_(other.object_), from_pool_(other.from_pool_) {
        other.object_ = nullptr;
    }
    
    PooledPtr& operator=(PooledPtr&& other) noexcept {
        if (this != &other) {
            this->~PooledPtr(); // Properly destroy current object
            object_ = other.object_;
            from_pool_ = other.from_pool_;
            other.object_ = nullptr;
        }
        return *this;
    }
    
    T* operator->() const { return object_; }
    T& operator*() const { return *object_; }
    T* get() const { return object_; }
    
    bool wasFromPool() const { return from_pool_; }
    
    static size_t poolSize() { return pool_.size(); }
    static void clearPool() { 
        for (auto* obj : pool_) delete obj;
        pool_.clear();
        std::cout << "PooledPtr: Pool cleared" << std::endl;
    }
};

template<typename T>
thread_local std::vector<T*> PooledPtr<T>::pool_;

// Test class for demonstrations
class CustomResource {
private:
    std::string name_;
    std::vector<double> data_;
    
public:
    explicit CustomResource(const std::string& name, size_t size = 100)
        : name_(name), data_(size) {
        std::iota(data_.begin(), data_.end(), 1.0);
        std::cout << "CustomResource created: " << name_ << std::endl;
    }
    
    ~CustomResource() {
        std::cout << "CustomResource destroyed: " << name_ << std::endl;
    }
    
    const std::string& name() const { return name_; }
    void setName(const std::string& name) { name_ = name; }
    
    double compute() const {
        return std::accumulate(data_.begin(), data_.end(), 0.0);
    }
    
    void modify(double factor) {
        std::transform(data_.begin(), data_.end(), data_.begin(),
                      [factor](double x) { return x * factor; });
    }
};

void demonstrate_custom_ownership() {
    std::cout << "=== Custom Ownership Models ===" << std::endl;
    
    // Reference counted pointer
    {
        std::cout << "\\n--- RefCountedPtr Demo ---" << std::endl;
        
        auto ptr1 = RefCountedPtr<CustomResource>("RefCounted Resource");
        std::cout << "ptr1 use_count: " << ptr1.use_count() << std::endl;
        
        {
            auto ptr2 = ptr1; // Copy
            std::cout << "After copy - ptr1 use_count: " << ptr1.use_count() << std::endl;
            std::cout << "ptr2 use_count: " << ptr2.use_count() << std::endl;
            
            auto ptr3 = std::move(ptr1); // Move
            std::cout << "After move - ptr3 use_count: " << ptr3.use_count() << std::endl;
            std::cout << "ptr1 use_count: " << ptr1.use_count() << std::endl;
            
        } // ptr2 and ptr3 destroyed
        
        std::cout << "After scope - ptr1 use_count: " << ptr1.use_count() << std::endl;
    }
    
    // Copy-on-Write pointer
    {
        std::cout << "\\n--- CowPtr Demo ---" << std::endl;
        
        auto cow1 = CowPtr<CustomResource>("COW Resource");
        auto cow2 = cow1; // Shallow copy
        auto cow3 = cow1; // Another shallow copy
        
        std::cout << "Before modification - cow1 refs: " << cow1.use_count() << std::endl;
        
        // Read operations (no detach)
        std::cout << "cow1 name: " << cow1->name() << std::endl;
        std::cout << "cow2 compute: " << cow2->compute() << std::endl;
        
        // Write operation (triggers detach)
        cow2->setName("Modified COW Resource");
        
        std::cout << "After modification:" << std::endl;
        std::cout << "cow1 refs: " << cow1.use_count() << std::endl;
        std::cout << "cow2 refs: " << cow2.use_count() << std::endl;
        std::cout << "cow1 name: " << cow1->name() << std::endl;
        std::cout << "cow2 name: " << cow2->name() << std::endl;
    }
    
    // Pooled pointer
    {
        std::cout << "\\n--- PooledPtr Demo ---" << std::endl;
        
        {
            auto pooled1 = PooledPtr<CustomResource>("Pooled1");
            auto pooled2 = PooledPtr<CustomResource>("Pooled2");
            auto pooled3 = PooledPtr<CustomResource>("Pooled3");
            
        } // Objects returned to pool
        
        std::cout << "Pool size after scope: " << PooledPtr<CustomResource>::poolSize() << std::endl;
        
        // Reuse from pool
        {
            auto pooled4 = PooledPtr<CustomResource>("Pooled4-Reused");
            std::cout << "Was from pool: " << pooled4.wasFromPool() << std::endl;
            
            auto pooled5 = PooledPtr<CustomResource>("Pooled5-Reused");
            std::cout << "Was from pool: " << pooled5.wasFromPool() << std::endl;
        }
        
        PooledPtr<CustomResource>::clearPool();
    }
}`,

    thread_safe_ownership: `// Thread-Safe Ownership Models
#include <memory>
#include <atomic>
#include <mutex>
#include <shared_mutex>
#include <vector>
#include <thread>
#include <iostream>
#include <chrono>
#include <random>

// Lock-free shared ownership
template<typename T>
class LockFreeSharedPtr {
private:
    struct ControlBlock {
        std::atomic<size_t> shared_count{1};
        std::atomic<size_t> weak_count{0};
        T* object;
        std::function<void(T*)> deleter;
        
        ControlBlock(T* obj, std::function<void(T*)> del) 
            : object(obj), deleter(std::move(del)) {}
    };
    
    std::atomic<ControlBlock*> control_block_;
    
public:
    template<typename... Args>
    explicit LockFreeSharedPtr(Args&&... args) {
        auto* obj = new T(std::forward<Args>(args)...);
        auto* cb = new ControlBlock(obj, [](T* ptr) { delete ptr; });
        control_block_.store(cb, std::memory_order_release);
    }
    
    LockFreeSharedPtr(const LockFreeSharedPtr& other) {
        ControlBlock* cb = other.control_block_.load(std::memory_order_acquire);
        if (cb) {
            cb->shared_count.fetch_add(1, std::memory_order_relaxed);
            control_block_.store(cb, std::memory_order_release);
        } else {
            control_block_.store(nullptr, std::memory_order_release);
        }
    }
    
    ~LockFreeSharedPtr() {
        ControlBlock* cb = control_block_.load(std::memory_order_acquire);
        if (cb && cb->shared_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            // Last shared reference
            cb->deleter(cb->object);
            cb->object = nullptr;
            
            if (cb->weak_count.load(std::memory_order_acquire) == 0) {
                delete cb;
            }
        }
    }
    
    T* operator->() const {
        ControlBlock* cb = control_block_.load(std::memory_order_acquire);
        return cb ? cb->object : nullptr;
    }
    
    T& operator*() const {
        return *operator->();
    }
    
    size_t use_count() const {
        ControlBlock* cb = control_block_.load(std::memory_order_acquire);
        return cb ? cb->shared_count.load(std::memory_order_acquire) : 0;
    }
    
    explicit operator bool() const {
        ControlBlock* cb = control_block_.load(std::memory_order_acquire);
        return cb && cb->object;
    }
};

// Thread-safe resource pool
template<typename T>
class ThreadSafeResourcePool {
private:
    mutable std::shared_mutex mutex_;
    std::vector<std::unique_ptr<T>> available_;
    std::atomic<size_t> total_created_{0};
    std::atomic<size_t> currently_borrowed_{0};
    size_t max_size_;
    std::function<std::unique_ptr<T>()> factory_;
    
public:
    ThreadSafeResourcePool(size_t max_size, std::function<std::unique_ptr<T>()> factory)
        : max_size_(max_size), factory_(std::move(factory)) {}
    
    class BorrowedResource {
    private:
        std::unique_ptr<T> resource_;
        ThreadSafeResourcePool* pool_;
        
    public:
        BorrowedResource(std::unique_ptr<T> resource, ThreadSafeResourcePool* pool)
            : resource_(std::move(resource)), pool_(pool) {}
        
        ~BorrowedResource() {
            if (resource_ && pool_) {
                pool_->return_resource(std::move(resource_));
            }
        }
        
        BorrowedResource(const BorrowedResource&) = delete;
        BorrowedResource& operator=(const BorrowedResource&) = delete;
        
        BorrowedResource(BorrowedResource&& other) noexcept
            : resource_(std::move(other.resource_)), pool_(other.pool_) {
            other.pool_ = nullptr;
        }
        
        T* operator->() const { return resource_.get(); }
        T& operator*() const { return *resource_; }
        T* get() const { return resource_.get(); }
    };
    
    BorrowedResource borrow() {
        std::unique_lock lock(mutex_);
        
        std::unique_ptr<T> resource;
        
        if (!available_.empty()) {
            resource = std::move(available_.back());
            available_.pop_back();
        } else if (total_created_ < max_size_) {
            resource = factory_();
            total_created_++;
        } else {
            throw std::runtime_error("Pool exhausted");
        }
        
        currently_borrowed_++;
        return BorrowedResource(std::move(resource), this);
    }
    
    void return_resource(std::unique_ptr<T> resource) {
        std::unique_lock lock(mutex_);
        available_.push_back(std::move(resource));
        currently_borrowed_--;
    }
    
    size_t available_count() const {
        std::shared_lock lock(mutex_);
        return available_.size();
    }
    
    size_t borrowed_count() const { return currently_borrowed_.load(); }
    size_t total_created() const { return total_created_.load(); }
};

// Thread-local ownership manager
template<typename T>
class ThreadLocalOwnershipManager {
private:
    static thread_local std::vector<std::unique_ptr<T>> thread_resources_;
    static std::atomic<size_t> global_resource_count_;
    
public:
    static std::unique_ptr<T>& acquire(const std::string& name) {
        // Check if already exists in this thread
        for (auto& resource : thread_resources_) {
            if (resource && resource->name() == name) {
                return resource;
            }
        }
        
        // Create new resource for this thread
        thread_resources_.push_back(std::make_unique<T>(name + "_thread_" + 
                                   std::to_string(std::hash<std::thread::id>{}(std::this_thread::get_id()))));
        global_resource_count_++;
        
        std::cout << "Created thread-local resource: " << thread_resources_.back()->name() << std::endl;
        return thread_resources_.back();
    }
    
    static void cleanup() {
        size_t count = thread_resources_.size();
        thread_resources_.clear();
        global_resource_count_ -= count;
        std::cout << "Cleaned up " << count << " thread-local resources" << std::endl;
    }
    
    static size_t thread_resource_count() { return thread_resources_.size(); }
    static size_t global_resource_count() { return global_resource_count_.load(); }
};

template<typename T>
thread_local std::vector<std::unique_ptr<T>> ThreadLocalOwnershipManager<T>::thread_resources_;

template<typename T>
std::atomic<size_t> ThreadLocalOwnershipManager<T>::global_resource_count_{0};

// Test resource for thread safety
class ThreadSafeResource {
private:
    std::string name_;
    std::atomic<size_t> access_count_{0};
    mutable std::shared_mutex mutex_;
    std::vector<int> data_;
    
public:
    explicit ThreadSafeResource(const std::string& name) : name_(name), data_(1000) {
        std::iota(data_.begin(), data_.end(), 1);
        std::cout << "ThreadSafeResource created: " << name_ << " (thread: " 
                  << std::this_thread::get_id() << ")" << std::endl;
    }
    
    ~ThreadSafeResource() {
        std::cout << "ThreadSafeResource destroyed: " << name_ << " (accesses: " 
                  << access_count_ << ")" << std::endl;
    }
    
    const std::string& name() const { return name_; }
    
    void read_operation() const {
        std::shared_lock lock(mutex_);
        access_count_++;
        
        // Simulate read work
        volatile int sum = 0;
        for (int val : data_) {
            sum += val;
        }
        
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }
    
    void write_operation(int factor) {
        std::unique_lock lock(mutex_);
        access_count_++;
        
        std::transform(data_.begin(), data_.end(), data_.begin(),
                      [factor](int x) { return x * factor; });
        
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
    }
    
    size_t access_count() const { return access_count_.load(); }
};

void demonstrate_thread_safe_ownership() {
    std::cout << "=== Thread-Safe Ownership Models ===" << std::endl;
    
    // Lock-free shared pointer test
    {
        std::cout << "\\n--- Lock-Free SharedPtr Test ---" << std::endl;
        
        auto shared_resource = LockFreeSharedPtr<ThreadSafeResource>("LockFreeResource");
        
        std::vector<std::thread> threads;
        
        for (int i = 0; i < 4; ++i) {
            threads.emplace_back([shared_resource, i]() {
                for (int j = 0; j < 10; ++j) {
                    shared_resource->read_operation();
                    
                    if (j % 3 == 0) {
                        shared_resource->write_operation(2);
                    }
                }
                
                std::cout << "Thread " << i << " completed. Use count: " 
                          << shared_resource.use_count() << std::endl;
            });
        }
        
        for (auto& t : threads) {
            t.join();
        }
        
        std::cout << "Final access count: " << shared_resource->access_count() << std::endl;
    }
    
    // Thread-safe resource pool test
    {
        std::cout << "\\n--- Thread-Safe Resource Pool Test ---" << std::endl;
        
        ThreadSafeResourcePool<ThreadSafeResource> pool(3, []() {
            static std::atomic<int> counter{0};
            return std::make_unique<ThreadSafeResource>("PoolResource_" + std::to_string(counter++));
        });
        
        std::vector<std::thread> pool_threads;
        std::random_device rd;
        
        for (int i = 0; i < 6; ++i) {
            pool_threads.emplace_back([&pool, i, &rd]() {
                std::mt19937 gen(rd());
                std::uniform_int_distribution<> dis(1, 10);
                
                try {
                    auto resource = pool.borrow();
                    std::cout << "Thread " << i << " borrowed: " << resource->name() << std::endl;
                    
                    // Simulate work
                    for (int j = 0; j < 5; ++j) {
                        resource->read_operation();
                        if (dis(gen) > 7) {
                            resource->write_operation(2);
                        }
                        std::this_thread::sleep_for(std::chrono::milliseconds(dis(gen)));
                    }
                    
                    std::cout << "Thread " << i << " returning resource" << std::endl;
                    
                } catch (const std::exception& e) {
                    std::cout << "Thread " << i << " failed to borrow: " << e.what() << std::endl;
                }
            });
        }
        
        for (auto& t : pool_threads) {
            t.join();
        }
        
        std::cout << "Pool stats - Available: " << pool.available_count() 
                  << ", Borrowed: " << pool.borrowed_count() << std::endl;
    }
    
    // Thread-local ownership test
    {
        std::cout << "\\n--- Thread-Local Ownership Test ---" << std::endl;
        
        std::vector<std::thread> tl_threads;
        
        for (int i = 0; i < 3; ++i) {
            tl_threads.emplace_back([i]() {
                // Each thread gets its own copy of shared resources
                auto& resource1 = ThreadLocalOwnershipManager<ThreadSafeResource>::acquire("SharedResource1");
                auto& resource2 = ThreadLocalOwnershipManager<ThreadSafeResource>::acquire("SharedResource2");
                
                for (int j = 0; j < 5; ++j) {
                    resource1->read_operation();
                    resource2->write_operation(2);
                }
                
                std::cout << "Thread " << i << " resources: " 
                          << ThreadLocalOwnershipManager<ThreadSafeResource>::thread_resource_count() << std::endl;
                
                ThreadLocalOwnershipManager<ThreadSafeResource>::cleanup();
            });
        }
        
        for (auto& t : tl_threads) {
            t.join();
        }
        
        std::cout << "Final global resource count: " 
                  << ThreadLocalOwnershipManager<ThreadSafeResource>::global_resource_count() << std::endl;
    }
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 89: Advanced Resource Ownership Models" : "Lección 89: Modelos Avanzados de Propiedad de Recursos"}
      lessonId="lesson-89"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'Sophisticated Ownership Patterns for Modern C++' : 'Patrones Sofisticados de Propiedad para C++ Moderno'}
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
                  'Master unique, shared, and weak ownership patterns with smart pointers',
                  'Design custom ownership models for specialized resource management',
                  'Implement thread-safe ownership mechanisms for concurrent systems',
                  'Create efficient ownership transfer patterns and optimization strategies',
                  'Apply ownership hierarchies and composition patterns in complex systems',
                  'Understand ownership semantics impact on performance and correctness'
                ]
              : [
                  'Dominar patrones de propiedad única, compartida y débil con smart pointers',
                  'Diseñar modelos de propiedad personalizados para gestión especializada de recursos',
                  'Implementar mecanismos de propiedad thread-safe para sistemas concurrentes',
                  'Crear patrones eficientes de transferencia de propiedad y estrategias de optimización',
                  'Aplicar jerarquías de propiedad y patrones de composición en sistemas complejos',
                  'Entender el impacto de la semántica de propiedad en rendimiento y corrección'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive Resource Ownership Demonstration' : 'Demostración Interactiva de Propiedad de Recursos'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <ResourceOwnershipVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('unique_ownership')}
            variant={state.scenario === 'unique_ownership' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {state.language === 'en' ? 'Unique' : 'Única'}
          </Button>
          <Button 
            onClick={() => runScenario('shared_ownership')}
            variant={state.scenario === 'shared_ownership' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {state.language === 'en' ? 'Shared' : 'Compartida'}
          </Button>
          <Button 
            onClick={() => runScenario('weak_ownership')}
            variant={state.scenario === 'weak_ownership' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {state.language === 'en' ? 'Weak' : 'Débil'}
          </Button>
          <Button 
            onClick={() => runScenario('transfer_patterns')}
            variant={state.scenario === 'transfer_patterns' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {state.language === 'en' ? 'Transfer' : 'Transferencia'}
          </Button>
          <Button 
            onClick={() => runScenario('custom_ownership')}
            variant={state.scenario === 'custom_ownership' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {state.language === 'en' ? 'Custom' : 'Personalizada'}
          </Button>
          <Button 
            onClick={() => runScenario('thread_safe_ownership')}
            variant={state.scenario === 'thread_safe_ownership' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {state.language === 'en' ? 'Thread-Safe' : 'Thread-Safe'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Unique Owners' : 'Propietarios Únicos', 
              value: state.uniqueOwners,
              color: '#00ff00'
            },
            { 
              label: state.language === 'en' ? 'Shared References' : 'Referencias Compartidas', 
              value: state.sharedReferences,
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Transfers/s' : 'Transferencias/s', 
              value: state.ownershipTransfers,
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Memory Efficiency %' : 'Eficiencia Memoria %', 
              value: Math.round(state.memoryEfficiency),
              color: '#ff0080'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'unique_ownership' && (state.language === 'en' ? 'Unique Ownership Patterns' : 'Patrones de Propiedad Única')}
          {state.scenario === 'shared_ownership' && (state.language === 'en' ? 'Shared Ownership Models' : 'Modelos de Propiedad Compartida')}
          {state.scenario === 'weak_ownership' && (state.language === 'en' ? 'Weak Ownership & Observer Patterns' : 'Propiedad Débil y Patrones Observer')}
          {state.scenario === 'transfer_patterns' && (state.language === 'en' ? 'Ownership Transfer Strategies' : 'Estrategias de Transferencia de Propiedad')}
          {state.scenario === 'custom_ownership' && (state.language === 'en' ? 'Custom Ownership Models' : 'Modelos de Propiedad Personalizados')}
          {state.scenario === 'thread_safe_ownership' && (state.language === 'en' ? 'Thread-Safe Ownership' : 'Propiedad Thread-Safe')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'unique_ownership' ? 
              (state.language === 'en' ? 'unique_ptr Patterns' : 'Patrones unique_ptr') :
            state.scenario === 'shared_ownership' ? 
              (state.language === 'en' ? 'shared_ptr Models' : 'Modelos shared_ptr') :
            state.scenario === 'weak_ownership' ? 
              (state.language === 'en' ? 'weak_ptr Observer Pattern' : 'Patrón Observer weak_ptr') :
            state.scenario === 'transfer_patterns' ? 
              (state.language === 'en' ? 'Transfer Chain Implementation' : 'Implementación de Cadena de Transferencia') :
            state.scenario === 'custom_ownership' ? 
              (state.language === 'en' ? 'Custom Smart Pointers' : 'Smart Pointers Personalizados') :
            (state.language === 'en' ? 'Thread-Safe Mechanisms' : 'Mecanismos Thread-Safe')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Ownership Design Principles' : 'Principios de Diseño de Propiedad'}
        </SectionTitle>
        
        <PerformanceComparison
          title={state.language === 'en' ? 'Ownership Model Performance Characteristics' : 'Características de Rendimiento de Modelos de Propiedad'}
          scenarios={[
            {
              name: state.language === 'en' ? 'Unique Ownership' : 'Propiedad Única',
              metrics: {
                [state.language === 'en' ? 'Memory Overhead' : 'Overhead Memoria']: 0,
                [state.language === 'en' ? 'Thread Safety' : 'Seguridad Hilos']: 100,
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 100
              }
            },
            {
              name: state.language === 'en' ? 'Shared Ownership' : 'Propiedad Compartida',
              metrics: {
                [state.language === 'en' ? 'Memory Overhead' : 'Overhead Memoria']: 40,
                [state.language === 'en' ? 'Thread Safety' : 'Seguridad Hilos']: 90,
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 80
              }
            },
            {
              name: state.language === 'en' ? 'Custom Ownership' : 'Propiedad Personalizada',
              metrics: {
                [state.language === 'en' ? 'Memory Overhead' : 'Overhead Memoria']: 20,
                [state.language === 'en' ? 'Thread Safety' : 'Seguridad Hilos']: 95,
                [state.language === 'en' ? 'Performance' : 'Rendimiento']: 95
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
            {state.language === 'en' ? '🎯 Key Ownership Principles:' : '🎯 Principios Clave de Propiedad:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Single Responsibility:' : 'Responsabilidad Única:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Each resource should have a clear owner responsible for its lifetime'
                : 'Cada recurso debe tener un propietario claro responsable de su tiempo de vida'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Transfer Semantics:' : 'Semántica de Transferencia:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Use move semantics for efficient ownership transfers without copying'
                : 'Usar semántica de movimiento para transferencias eficientes de propiedad sin copiar'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Weak References:' : 'Referencias Débiles:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Break cycles and enable observer patterns without affecting lifetime'
                : 'Romper ciclos y habilitar patrones observer sin afectar el tiempo de vida'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Thread Safety:' : 'Seguridad de Hilos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Design ownership models with concurrent access patterns in mind'
                : 'Diseñar modelos de propiedad considerando patrones de acceso concurrente'
              }
            </li>
          </ul>
        </div>

        <UndefinedBehaviorWarning
          title={state.language === 'en' ? 'Ownership Safety Considerations' : 'Consideraciones de Seguridad de Propiedad'}
          description={
            state.language === 'en' 
              ? 'Improper ownership management can lead to use-after-free, double-free, and memory leaks. Always ensure clear ownership semantics and proper lifetime management.'
              : 'La gestión inadecuada de propiedad puede llevar a use-after-free, double-free y fugas de memoria. Siempre asegurar semántica de propiedad clara y gestión apropiada de tiempo de vida.'
          }
        />
      </Section>
    </LessonLayout>
  );
};

export default Lesson89_ResourceOwnership;