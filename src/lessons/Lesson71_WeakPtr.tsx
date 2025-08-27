import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LessonLayout, Section, SectionTitle, InteractiveSection,
  LearningObjectives, Button, CodeBlock, PerformanceMonitor,
  AccessibilityAnnouncer, theme, type LessonProgress 
} from '../design-system';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import { THREE } from '../utils/three';

interface WeakPtrAdvancedState {
  demonstrationType: 'cycle_breaking' | 'observer_pattern' | 'cache_implementation' | 'thread_safety';
  currentScenario: number;
  cycleBreaking: {
    nodes: Array<{
      id: string;
      name: string;
      hasStrongRef: boolean;
      hasWeakRef: boolean;
      refCount: number;
      isLeaking: boolean;
    }>;
    totalLeaks: number;
    memoryUsage: number;
  };
  observerPattern: {
    subjects: Array<{
      id: string;
      name: string;
      observerCount: number;
      weakObservers: number;
      isActive: boolean;
    }>;
    notifications: number;
    dangling: number;
  };
  cacheSystem: {
    entries: Array<{
      key: string;
      isExpired: boolean;
      lockAttempts: number;
      hitRate: number;
    }>;
    totalHits: number;
    totalMisses: number;
    efficiency: number;
  };
  threadSafety: {
    threads: Array<{
      id: number;
      operation: string;
      status: 'success' | 'failed' | 'waiting';
    }>;
    raceConditions: number;
    atomicOperations: number;
  };
  performanceStats: {
    weakPtrOverhead: number;
    lockPerformance: number;
    cycleDetection: number;
    memoryEfficiency: number;
  };
}

const WeakPtrVisualization: React.FC<{ state: WeakPtrAdvancedState }> = ({ state }) => {
  const getNodeColor = (node: WeakPtrAdvancedState['cycleBreaking']['nodes'][0]) => {
    if (node.isLeaking) return '#e74c3c';
    if (node.hasStrongRef && node.hasWeakRef) return '#f39c12';
    if (node.hasStrongRef) return '#2980b9';
    if (node.hasWeakRef) return '#27ae60';
    return '#95a5a6';
  };

  const scenarios = [
    {
      title: 'Reference Cycle Breaking',
      description: 'Solving circular dependencies with weak_ptr',
      focus: 'cycle_prevention'
    },
    {
      title: 'Observer Pattern Implementation',
      description: 'Safe observer pattern using weak references',
      focus: 'observer_safety'
    },
    {
      title: 'Cache System with Weak References',
      description: 'Implementing caches that don\'t prevent destruction',
      focus: 'cache_management'
    },
    {
      title: 'Thread-Safe Weak Pointer Usage',
      description: 'Atomic operations and thread safety with weak_ptr',
      focus: 'thread_safety'
    }
  ];

  const currentScenario = scenarios[state.currentScenario] || scenarios[0];

  const renderCycleBreaking = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Reference Cycle Resolution
      </Text>
      
      {/* Node visualization */}
      {state.cycleBreaking.nodes.slice(0, 6).map((node, index) => {
        const angle = (index / 6) * Math.PI * 2;
        const radius = 2.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={node.id} position={[x, 2, z]}>
            <Box args={[0.8, 0.8, 0.3]}>
              <meshStandardMaterial color={getNodeColor(node)} transparent opacity={0.8} />
            </Box>
            
            <Text position={[0, 0, 0.2]} fontSize={0.08} color="white" anchorX="center">
              {node.name}
            </Text>
            
            <Text position={[0, -0.3, 0.2]} fontSize={0.06} color="white" anchorX="center">
              RC: {node.refCount}
            </Text>
            
            {/* Strong reference indicators */}
            {node.hasStrongRef && (
              <Box args={[0.1, 0.6, 0.1]} position={[0.3, 0.3, 0.2]}>
                <meshStandardMaterial color="#2980b9" />
              </Box>
            )}
            
            {/* Weak reference indicators */}
            {node.hasWeakRef && (
              <Box args={[0.1, 0.6, 0.1]} position={[-0.3, 0.3, 0.2]}>
                <meshStandardMaterial color="#27ae60" />
              </Box>
            )}
            
            {/* Memory leak warning */}
            {node.isLeaking && (
              <Text position={[0, 0.6, 0]} fontSize={0.06} color="#e74c3c" anchorX="center">
                ⚠ LEAK
              </Text>
            )}
          </group>
        );
      })}
      
      {/* Connection lines between nodes */}
      {state.cycleBreaking.nodes.slice(0, 6).map((_, index) => {
        const nextIndex = (index + 1) % 6;
        const angle1 = (index / 6) * Math.PI * 2;
        const angle2 = (nextIndex / 6) * Math.PI * 2;
        const radius = 2.5;
        
        const start = [Math.cos(angle1) * radius, 2, Math.sin(angle1) * radius];
        const end = [Math.cos(angle2) * radius, 2, Math.sin(angle2) * radius];
        
        return (
          <Line
            key={`connection-${index}`}
            points={[start, end]}
            color={index % 2 === 0 ? '#2980b9' : '#27ae60'}
            lineWidth={3}
            dashed={index % 2 !== 0}
          />
        );
      })}
      
      {/* Statistics */}
      <group position={[0, 0.5, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.12} color="#e74c3c" anchorX="center">
          Memory Leaks: {state.cycleBreaking.totalLeaks}
        </Text>
        
        <Text position={[0, 0, 0]} fontSize={0.10} color="#f39c12" anchorX="center">
          Memory Usage: {(state.cycleBreaking.memoryUsage / 1024).toFixed(1)}KB
        </Text>
      </group>
    </group>
  );

  const renderObserverPattern = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Observer Pattern with Weak References
      </Text>
      
      {/* Subject visualization */}
      {state.observerPattern.subjects.slice(0, 3).map((subject, index) => (
        <group key={subject.id} position={[index * 3 - 3, 2, 0]}>
          <Box args={[2, 1.5, 0.4]}>
            <meshStandardMaterial 
              color={subject.isActive ? '#27ae60' : '#95a5a6'} 
              transparent 
              opacity={0.8} 
            />
          </Box>
          
          <Text position={[0, 0.2, 0.3]} fontSize={0.08} color="white" anchorX="center">
            {subject.name}
          </Text>
          
          <Text position={[0, 0, 0.3]} fontSize={0.06} color="white" anchorX="center">
            Observers: {subject.observerCount}
          </Text>
          
          <Text position={[0, -0.2, 0.3]} fontSize={0.06} color="white" anchorX="center">
            Weak: {subject.weakObservers}
          </Text>
          
          {/* Observer connections */}
          {Array.from({ length: subject.weakObservers }, (_, obsIndex) => {
            const angle = (obsIndex / subject.weakObservers) * Math.PI * 2;
            const obsX = Math.cos(angle) * 1.5;
            const obsZ = Math.sin(angle) * 1.5;
            
            return (
              <group key={obsIndex}>
                <Box args={[0.3, 0.3, 0.2]} position={[obsX, -1, obsZ]}>
                  <meshStandardMaterial color="#3498db" transparent opacity={0.6} />
                </Box>
                
                <Line
                  points={[[0, -0.5, 0], [obsX, -1, obsZ]]}
                  color="#3498db"
                  lineWidth={2}
                  dashed={true}
                />
              </group>
            );
          })}
          
          {/* Activity indicator */}
          {subject.isActive && (
            <Box args={[0.2, 0.2, 0.1]} position={[0.8, 0.8, 0.3]}>
              <meshStandardMaterial color="#2ecc71" />
            </Box>
          )}
        </group>
      ))}
      
      {/* Statistics */}
      <group position={[0, 0.5, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.12} color="#3498db" anchorX="center">
          Notifications Sent: {state.observerPattern.notifications}
        </Text>
        
        <Text position={[0, 0, 0]} fontSize={0.10} color="#e74c3c" anchorX="center">
          Dangling References Prevented: {state.observerPattern.dangling}
        </Text>
      </group>
    </group>
  );

  const renderCacheSystem = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Weak Reference Cache System
      </Text>
      
      {/* Cache entries */}
      <group position={[0, 2, 0]}>
        {state.cacheSystem.entries.slice(0, 8).map((entry, index) => (
          <group key={entry.key} position={[index * 1.2 - 4.2, 0, 0]}>
            <Box args={[1, 1, 0.3]}>
              <meshStandardMaterial 
                color={entry.isExpired ? '#e74c3c' : '#27ae60'} 
                transparent 
                opacity={0.7} 
              />
            </Box>
            
            <Text position={[0, 0.2, 0.2]} fontSize={0.06} color="white" anchorX="center">
              {entry.key}
            </Text>
            
            <Text position={[0, 0, 0.2]} fontSize={0.05} color="white" anchorX="center">
              Locks: {entry.lockAttempts}
            </Text>
            
            <Text position={[0, -0.2, 0.2]} fontSize={0.05} color="white" anchorX="center">
              Hit: {(entry.hitRate * 100).toFixed(0)}%
            </Text>
            
            {/* Expiration indicator */}
            {entry.isExpired && (
              <Text position={[0, 0.6, 0]} fontSize={0.05} color="#e74c3c" anchorX="center">
                EXPIRED
              </Text>
            )}
          </group>
        ))}
      </group>
      
      {/* Cache statistics */}
      <group position={[0, 0.5, 0]}>
        <Text position={[-2, 0.3, 0]} fontSize={0.10} color="#2ecc71" anchorX="center">
          Cache Hits: {state.cacheSystem.totalHits}
        </Text>
        
        <Text position={[0, 0.3, 0]} fontSize={0.10} color="#e74c3c" anchorX="center">
          Cache Misses: {state.cacheSystem.totalMisses}
        </Text>
        
        <Text position={[2, 0.3, 0]} fontSize={0.10} color="#f39c12" anchorX="center">
          Efficiency: {(state.cacheSystem.efficiency * 100).toFixed(1)}%
        </Text>
      </group>
    </group>
  );

  const renderThreadSafety = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Thread-Safe Weak Pointer Operations
      </Text>
      
      {/* Thread visualization */}
      <group position={[0, 2, 0]}>
        {state.threadSafety.threads.slice(0, 6).map((thread, index) => (
          <group key={thread.id} position={[index * 1.5 - 3.75, 0, 0]}>
            <Box args={[1.2, 1.5, 0.3]}>
              <meshStandardMaterial 
                color={
                  thread.status === 'success' ? '#27ae60' :
                  thread.status === 'failed' ? '#e74c3c' : '#f39c12'
                } 
                transparent 
                opacity={0.8} 
              />
            </Box>
            
            <Text position={[0, 0.3, 0.2]} fontSize={0.07} color="white" anchorX="center">
              T{thread.id}
            </Text>
            
            <Text position={[0, 0, 0.2]} fontSize={0.05} color="white" anchorX="center">
              {thread.operation}
            </Text>
            
            <Text position={[0, -0.3, 0.2]} fontSize={0.05} color="white" anchorX="center">
              {thread.status.toUpperCase()}
            </Text>
            
            {/* Status indicators */}
            <Box args={[0.2, 0.2, 0.1]} position={[0.4, 0.6, 0.2]}>
              <meshStandardMaterial 
                color={
                  thread.status === 'success' ? '#2ecc71' :
                  thread.status === 'failed' ? '#e74c3c' : '#f1c40f'
                } 
              />
            </Box>
          </group>
        ))}
      </group>
      
      {/* Synchronization visualization */}
      <group position={[0, 0.5, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.12} color="#9b59b6" anchorX="center">
          Atomic Operations
        </Text>
        
        <Text position={[-2, 0.2, 0]} fontSize={0.08} color="#e74c3c" anchorX="center">
          Race Conditions: {state.threadSafety.raceConditions}
        </Text>
        
        <Text position={[2, 0.2, 0]} fontSize={0.08} color="#27ae60" anchorX="center">
          Atomic Ops: {state.threadSafety.atomicOperations}
        </Text>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      <Text position={[0, 4.2, 0]} fontSize={0.25} color="#00d4ff" anchorX="center">
        {currentScenario.title}
      </Text>
      
      <Text position={[0, 3.8, 0]} fontSize={0.12} color="#ffa500" anchorX="center">
        {currentScenario.description}
      </Text>
      
      {state.demonstrationType === 'cycle_breaking' && renderCycleBreaking()}
      {state.demonstrationType === 'observer_pattern' && renderObserverPattern()}
      {state.demonstrationType === 'cache_implementation' && renderCacheSystem()}
      {state.demonstrationType === 'thread_safety' && renderThreadSafety()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson71_WeakPtr: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<WeakPtrAdvancedState>({
    demonstrationType: 'cycle_breaking',
    currentScenario: 0,
    cycleBreaking: {
      nodes: [
        { id: 'A', name: 'NodeA', hasStrongRef: true, hasWeakRef: false, refCount: 2, isLeaking: true },
        { id: 'B', name: 'NodeB', hasStrongRef: true, hasWeakRef: false, refCount: 2, isLeaking: true },
        { id: 'C', name: 'NodeC', hasStrongRef: true, hasWeakRef: true, refCount: 1, isLeaking: false },
        { id: 'D', name: 'NodeD', hasStrongRef: false, hasWeakRef: true, refCount: 0, isLeaking: false },
        { id: 'E', name: 'NodeE', hasStrongRef: true, hasWeakRef: true, refCount: 1, isLeaking: false },
        { id: 'F', name: 'NodeF', hasStrongRef: false, hasWeakRef: true, refCount: 0, isLeaking: false }
      ],
      totalLeaks: 2,
      memoryUsage: 2048
    },
    observerPattern: {
      subjects: [
        { id: 'S1', name: 'EventSource', observerCount: 5, weakObservers: 3, isActive: true },
        { id: 'S2', name: 'DataModel', observerCount: 8, weakObservers: 6, isActive: true },
        { id: 'S3', name: 'UIController', observerCount: 3, weakObservers: 2, isActive: false }
      ],
      notifications: 0,
      dangling: 0
    },
    cacheSystem: {
      entries: [
        { key: 'K1', isExpired: false, lockAttempts: 5, hitRate: 0.8 },
        { key: 'K2', isExpired: true, lockAttempts: 2, hitRate: 0.3 },
        { key: 'K3', isExpired: false, lockAttempts: 8, hitRate: 0.9 },
        { key: 'K4', isExpired: false, lockAttempts: 3, hitRate: 0.7 },
        { key: 'K5', isExpired: true, lockAttempts: 1, hitRate: 0.1 },
        { key: 'K6', isExpired: false, lockAttempts: 6, hitRate: 0.85 },
        { key: 'K7', isExpired: false, lockAttempts: 4, hitRate: 0.75 },
        { key: 'K8', isExpired: true, lockAttempts: 0, hitRate: 0.0 }
      ],
      totalHits: 0,
      totalMisses: 0,
      efficiency: 0.75
    },
    threadSafety: {
      threads: [
        { id: 1, operation: 'lock()', status: 'success' },
        { id: 2, operation: 'expired()', status: 'success' },
        { id: 3, operation: 'lock()', status: 'waiting' },
        { id: 4, operation: 'reset()', status: 'success' },
        { id: 5, operation: 'lock()', status: 'failed' },
        { id: 6, operation: 'use_count()', status: 'success' }
      ],
      raceConditions: 0,
      atomicOperations: 0
    },
    performanceStats: {
      weakPtrOverhead: 8,
      lockPerformance: 95,
      cycleDetection: 88,
      memoryEfficiency: 92
    }
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 12,
    completedSteps: [],
    score: 0
  });

  const codeExamples = {
    cycle_breaking: `// Breaking Reference Cycles with std::weak_ptr
#include <memory>
#include <iostream>
#include <vector>

// Traditional problematic circular reference
class BadNode {
    std::shared_ptr<BadNode> child_;
    std::shared_ptr<BadNode> parent_;  // Creates cycle!
public:
    void setChild(std::shared_ptr<BadNode> child) {
        child_ = child;
        child->parent_ = shared_from_this(); // PROBLEM: Cycle!
    }
    // Destructor never called due to cycle
    ~BadNode() { std::cout << "BadNode destroyed\\n"; }
};

// Correct implementation using weak_ptr
class GoodNode : public std::enable_shared_from_this<GoodNode> {
    std::shared_ptr<GoodNode> child_;
    std::weak_ptr<GoodNode> parent_;  // Breaks the cycle!
    
public:
    void setChild(std::shared_ptr<GoodNode> child) {
        child_ = child;
        child->parent_ = weak_from_this(); // No cycle!
    }
    
    void setParent(std::weak_ptr<GoodNode> parent) {
        parent_ = parent;
    }
    
    std::shared_ptr<GoodNode> getParent() {
        return parent_.lock();  // Safe access
    }
    
    void visitParent() {
        if (auto parent = parent_.lock()) {
            std::cout << "Parent is alive\\n";
            // Use parent safely
        } else {
            std::cout << "Parent has been destroyed\\n";
        }
    }
    
    ~GoodNode() { std::cout << "GoodNode destroyed\\n"; }
};

// Tree structure with proper weak references
template<typename T>
class TreeNode {
    T data_;
    std::vector<std::shared_ptr<TreeNode<T>>> children_;
    std::weak_ptr<TreeNode<T>> parent_;
    
public:
    TreeNode(T data) : data_(data) {}
    
    void addChild(std::shared_ptr<TreeNode<T>> child) {
        children_.push_back(child);
        child->parent_ = weak_from_this();
    }
    
    std::shared_ptr<TreeNode<T>> getParent() {
        return parent_.lock();
    }
    
    void removeFromParent() {
        if (auto parent = parent_.lock()) {
            auto& siblings = parent->children_;
            siblings.erase(
                std::remove_if(siblings.begin(), siblings.end(),
                    [this](const std::weak_ptr<TreeNode<T>>& weak_child) {
                        if (auto child = weak_child.lock()) {
                            return child.get() == this;
                        }
                        return false;
                    }),
                siblings.end()
            );
            parent_.reset();
        }
    }
    
    // Depth-first traversal without cycles
    void traverse(int depth = 0) {
        std::cout << std::string(depth * 2, ' ') << data_ << "\\n";
        for (auto& child : children_) {
            if (child) {  // Child is shared_ptr, always valid if not null
                child->traverse(depth + 1);
            }
        }
    }
    
    ~TreeNode() { 
        std::cout << "TreeNode " << data_ << " destroyed\\n"; 
    }
};

// Cache that doesn't prevent object destruction
template<typename Key, typename Value>
class WeakCache {
    mutable std::unordered_map<Key, std::weak_ptr<Value>> cache_;
    mutable std::mutex cache_mutex_;
    
public:
    std::shared_ptr<Value> get(const Key& key) const {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        
        auto it = cache_.find(key);
        if (it != cache_.end()) {
            if (auto value = it->second.lock()) {
                return value;  // Cache hit, object still alive
            } else {
                cache_.erase(it);  // Clean up expired entry
            }
        }
        return nullptr;  // Cache miss
    }
    
    void put(const Key& key, std::shared_ptr<Value> value) {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        cache_[key] = value;  // Store as weak_ptr
    }
    
    void cleanup() {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        
        // Remove all expired entries
        for (auto it = cache_.begin(); it != cache_.end();) {
            if (it->second.expired()) {
                it = cache_.erase(it);
            } else {
                ++it;
            }
        }
    }
    
    size_t size() const {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        return cache_.size();
    }
    
    // Get cache statistics
    struct Stats {
        size_t total_entries;
        size_t expired_entries;
        double efficiency;
    };
    
    Stats getStats() const {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        
        size_t expired = 0;
        for (const auto& [key, weak_ptr] : cache_) {
            if (weak_ptr.expired()) {
                ++expired;
            }
        }
        
        return {
            cache_.size(),
            expired,
            cache_.empty() ? 0.0 : 1.0 - (double(expired) / cache_.size())
        };
    }
};

// Example usage demonstrating cycle prevention
void demonstrateCycleBreaking() {
    std::cout << "=== Cycle Breaking Demonstration ===\\n";
    
    // Create tree structure
    auto root = std::make_shared<TreeNode<std::string>>("Root");
    auto child1 = std::make_shared<TreeNode<std::string>>("Child1");
    auto child2 = std::make_shared<TreeNode<std::string>>("Child2");
    auto grandchild = std::make_shared<TreeNode<std::string>>("GrandChild");
    
    // Build tree (no cycles due to weak_ptr parent references)
    root->addChild(child1);
    root->addChild(child2);
    child1->addChild(grandchild);
    
    // Traverse tree
    root->traverse();
    
    // Demonstrate parent access
    if (auto parent = grandchild->getParent()) {
        std::cout << "Grandchild's parent exists\\n";
    }
    
    // Remove child1 - grandchild should lose its parent
    child1.reset();
    
    if (auto parent = grandchild->getParent()) {
        std::cout << "Parent still exists\\n";
    } else {
        std::cout << "Parent has been destroyed\\n";
    }
    
    // Objects will be properly destroyed when going out of scope
}`,

    observer_pattern: `// Observer Pattern with std::weak_ptr for Safety
#include <memory>
#include <vector>
#include <algorithm>
#include <iostream>
#include <mutex>

// Forward declarations
class Observable;
class Observer;

// Safe observer interface using weak_ptr
class Observer {
public:
    virtual ~Observer() = default;
    virtual void notify(const std::string& event) = 0;
    virtual void onObservableDestroyed() {}
};

// Observable class with weak_ptr observer management
class Observable : public std::enable_shared_from_this<Observable> {
    mutable std::vector<std::weak_ptr<Observer>> observers_;
    mutable std::mutex observers_mutex_;
    std::string name_;
    
    // Clean up expired observers
    void cleanupObservers() const {
        observers_.erase(
            std::remove_if(observers_.begin(), observers_.end(),
                [](const std::weak_ptr<Observer>& weak_obs) {
                    return weak_obs.expired();
                }),
            observers_.end()
        );
    }
    
public:
    Observable(const std::string& name) : name_(name) {}
    
    void addObserver(std::weak_ptr<Observer> observer) {
        std::lock_guard<std::mutex> lock(observers_mutex_);
        observers_.push_back(observer);
    }
    
    void removeObserver(Observer* observer) {
        std::lock_guard<std::mutex> lock(observers_mutex_);
        
        observers_.erase(
            std::remove_if(observers_.begin(), observers_.end(),
                [observer](const std::weak_ptr<Observer>& weak_obs) {
                    if (auto obs = weak_obs.lock()) {
                        return obs.get() == observer;
                    }
                    return true;  // Remove expired observers too
                }),
            observers_.end()
        );
    }
    
    void notifyObservers(const std::string& event) {
        std::lock_guard<std::mutex> lock(observers_mutex_);
        
        // Notify all living observers
        for (auto it = observers_.begin(); it != observers_.end();) {
            if (auto observer = it->lock()) {
                try {
                    observer->notify(event);
                    ++it;
                } catch (...) {
                    // Handle observer exception gracefully
                    it = observers_.erase(it);
                }
            } else {
                // Remove expired observer
                it = observers_.erase(it);
            }
        }
    }
    
    size_t getObserverCount() const {
        std::lock_guard<std::mutex> lock(observers_mutex_);
        cleanupObservers();
        return observers_.size();
    }
    
    const std::string& getName() const { return name_; }
    
    ~Observable() {
        std::lock_guard<std::mutex> lock(observers_mutex_);
        
        // Notify remaining observers about destruction
        for (const auto& weak_obs : observers_) {
            if (auto obs = weak_obs.lock()) {
                obs->onObservableDestroyed();
            }
        }
        
        std::cout << "Observable " << name_ << " destroyed\\n";
    }
};

// Concrete observer implementation
class ConcreteObserver : public Observer {
    std::string name_;
    std::weak_ptr<Observable> observed_;  // Weak reference to avoid cycles
    
public:
    ConcreteObserver(const std::string& name) : name_(name) {}
    
    void startObserving(std::weak_ptr<Observable> observable) {
        observed_ = observable;
        if (auto obs = observable.lock()) {
            obs->addObserver(weak_from_this());
        }
    }
    
    void stopObserving() {
        if (auto obs = observed_.lock()) {
            obs->removeObserver(this);
        }
        observed_.reset();
    }
    
    void notify(const std::string& event) override {
        std::string observedName = "unknown";
        if (auto obs = observed_.lock()) {
            observedName = obs->getName();
        }
        
        std::cout << "Observer " << name_ << " received event '" 
                  << event << "' from " << observedName << "\\n";
    }
    
    void onObservableDestroyed() override {
        std::cout << "Observer " << name_ 
                  << " notified that observable was destroyed\\n";
        observed_.reset();
    }
    
    bool isObserving() const {
        return !observed_.expired();
    }
    
    ~ConcreteObserver() {
        stopObserving();
        std::cout << "Observer " << name_ << " destroyed\\n";
    }
};

// Advanced observer manager with automatic cleanup
class ObserverManager {
    std::vector<std::weak_ptr<Observer>> managed_observers_;
    std::vector<std::weak_ptr<Observable>> managed_observables_;
    mutable std::mutex manager_mutex_;
    
public:
    template<typename ObserverType, typename... Args>
    std::shared_ptr<ObserverType> createObserver(Args&&... args) {
        auto observer = std::make_shared<ObserverType>(std::forward<Args>(args)...);
        
        std::lock_guard<std::mutex> lock(manager_mutex_);
        managed_observers_.push_back(observer);
        
        return observer;
    }
    
    template<typename ObservableType, typename... Args>
    std::shared_ptr<ObservableType> createObservable(Args&&... args) {
        auto observable = std::make_shared<ObservableType>(std::forward<Args>(args)...);
        
        std::lock_guard<std::mutex> lock(manager_mutex_);
        managed_observables_.push_back(observable);
        
        return observable;
    }
    
    void cleanup() {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        
        // Remove expired observers
        managed_observers_.erase(
            std::remove_if(managed_observers_.begin(), managed_observers_.end(),
                [](const std::weak_ptr<Observer>& weak_obs) {
                    return weak_obs.expired();
                }),
            managed_observers_.end()
        );
        
        // Remove expired observables
        managed_observables_.erase(
            std::remove_if(managed_observables_.begin(), managed_observables_.end(),
                [](const std::weak_ptr<Observable>& weak_obs) {
                    return weak_obs.expired();
                }),
            managed_observables_.end()
        );
    }
    
    void printStatus() const {
        std::lock_guard<std::mutex> lock(manager_mutex_);
        
        size_t alive_observers = 0;
        size_t alive_observables = 0;
        
        for (const auto& weak_obs : managed_observers_) {
            if (!weak_obs.expired()) {
                ++alive_observers;
            }
        }
        
        for (const auto& weak_obs : managed_observables_) {
            if (!weak_obs.expired()) {
                ++alive_observables;
            }
        }
        
        std::cout << "Manager Status:\\n";
        std::cout << "  Alive Observers: " << alive_observers << "\\n";
        std::cout << "  Alive Observables: " << alive_observables << "\\n";
        std::cout << "  Total Observers: " << managed_observers_.size() << "\\n";
        std::cout << "  Total Observables: " << managed_observables_.size() << "\\n";
    }
    
    ~ObserverManager() {
        std::cout << "ObserverManager destroyed\\n";
    }
};

// Demonstration of safe observer pattern
void demonstrateObserverPattern() {
    std::cout << "=== Observer Pattern Demonstration ===\\n";
    
    ObserverManager manager;
    
    // Create observables and observers
    auto subject1 = manager.createObservable<Observable>("EventSource");
    auto subject2 = manager.createObservable<Observable>("DataModel");
    
    auto observer1 = manager.createObserver<ConcreteObserver>("UI_Controller");
    auto observer2 = manager.createObserver<ConcreteObserver>("Logger");
    auto observer3 = manager.createObserver<ConcreteObserver>("Analytics");
    
    // Set up observation relationships
    observer1->startObserving(subject1);
    observer2->startObserving(subject1);
    observer2->startObserving(subject2);
    observer3->startObserving(subject2);
    
    // Generate events
    subject1->notifyObservers("user_clicked");
    subject2->notifyObservers("data_updated");
    
    std::cout << "\\nObserver counts:\\n";
    std::cout << subject1->getName() << ": " << subject1->getObserverCount() << " observers\\n";
    std::cout << subject2->getName() << ": " << subject2->getObserverCount() << " observers\\n";
    
    // Destroy one observer - others should continue working
    observer1.reset();
    
    std::cout << "\\nAfter destroying observer1:\\n";
    subject1->notifyObservers("another_event");
    
    manager.printStatus();
    
    // Destroy an observable - observers should be notified
    subject1.reset();
    
    std::cout << "\\nAfter destroying subject1:\\n";
    std::cout << "Observer2 still observing: " << observer2->isObserving() << "\\n";
    
    manager.cleanup();
    manager.printStatus();
}`,

    cache_implementation: `// Cache Implementation with std::weak_ptr
#include <memory>
#include <unordered_map>
#include <mutex>
#include <chrono>
#include <iostream>
#include <functional>

// Resource class for caching demonstration
class Resource {
    std::string id_;
    std::string data_;
    std::chrono::steady_clock::time_point created_;
    
public:
    Resource(const std::string& id, const std::string& data) 
        : id_(id), data_(data), created_(std::chrono::steady_clock::now()) {}
    
    const std::string& getId() const { return id_; }
    const std::string& getData() const { return data_; }
    
    std::chrono::milliseconds getAge() const {
        auto now = std::chrono::steady_clock::now();
        return std::chrono::duration_cast<std::chrono::milliseconds>(now - created_);
    }
    
    ~Resource() {
        std::cout << "Resource " << id_ << " destroyed\\n";
    }
};

// Weak reference cache that doesn't prevent destruction
template<typename Key, typename Value>
class WeakPtrCache {
public:
    using ValuePtr = std::shared_ptr<Value>;
    using WeakValuePtr = std::weak_ptr<Value>;
    using Factory = std::function<ValuePtr(const Key&)>;
    
private:
    mutable std::unordered_map<Key, WeakValuePtr> cache_;
    mutable std::mutex cache_mutex_;
    Factory factory_;
    
    // Statistics
    mutable size_t hits_ = 0;
    mutable size_t misses_ = 0;
    mutable size_t expired_cleanups_ = 0;
    
public:
    WeakPtrCache(Factory factory) : factory_(factory) {}
    
    ValuePtr get(const Key& key) {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        
        auto it = cache_.find(key);
        if (it != cache_.end()) {
            if (auto value = it->second.lock()) {
                ++hits_;
                return value;  // Cache hit - object still alive
            } else {
                // Object expired, remove from cache
                cache_.erase(it);
                ++expired_cleanups_;
            }
        }
        
        // Cache miss - create new object
        ++misses_;
        auto value = factory_(key);
        cache_[key] = value;  // Store weak reference
        
        return value;
    }
    
    // Force cache entry (useful for preloading)
    void put(const Key& key, ValuePtr value) {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        cache_[key] = value;
    }
    
    // Check if key exists and is alive
    bool contains(const Key& key) const {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        
        auto it = cache_.find(key);
        if (it != cache_.end()) {
            if (!it->second.expired()) {
                return true;
            } else {
                cache_.erase(it);
                ++expired_cleanups_;
            }
        }
        return false;
    }
    
    // Manual cleanup of expired entries
    size_t cleanup() {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        
        size_t removed = 0;
        for (auto it = cache_.begin(); it != cache_.end();) {
            if (it->second.expired()) {
                it = cache_.erase(it);
                ++removed;
            } else {
                ++it;
            }
        }
        
        expired_cleanups_ += removed;
        return removed;
    }
    
    // Cache statistics
    struct Statistics {
        size_t total_entries;
        size_t alive_entries;
        size_t expired_entries;
        size_t hits;
        size_t misses;
        size_t expired_cleanups;
        double hit_rate;
        double efficiency;  // alive / total
    };
    
    Statistics getStatistics() const {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        
        size_t alive = 0;
        size_t expired = 0;
        
        for (const auto& [key, weak_ptr] : cache_) {
            if (weak_ptr.expired()) {
                ++expired;
            } else {
                ++alive;
            }
        }
        
        size_t total_requests = hits_ + misses_;
        double hit_rate = total_requests > 0 ? double(hits_) / total_requests : 0.0;
        double efficiency = cache_.size() > 0 ? double(alive) / cache_.size() : 0.0;
        
        return {
            cache_.size(),
            alive,
            expired,
            hits_,
            misses_,
            expired_cleanups_,
            hit_rate,
            efficiency
        };
    }
    
    void printStatistics() const {
        auto stats = getStatistics();
        
        std::cout << "Cache Statistics:\\n";
        std::cout << "  Total entries: " << stats.total_entries << "\\n";
        std::cout << "  Alive entries: " << stats.alive_entries << "\\n";
        std::cout << "  Expired entries: " << stats.expired_entries << "\\n";
        std::cout << "  Cache hits: " << stats.hits << "\\n";
        std::cout << "  Cache misses: " << stats.misses << "\\n";
        std::cout << "  Hit rate: " << (stats.hit_rate * 100) << "%\\n";
        std::cout << "  Efficiency: " << (stats.efficiency * 100) << "%\\n";
        std::cout << "  Expired cleanups: " << stats.expired_cleanups << "\\n";
    }
    
    void clear() {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        cache_.clear();
    }
    
    size_t size() const {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        return cache_.size();
    }
};

// Advanced cache with TTL and size limits
template<typename Key, typename Value>
class AdvancedWeakCache : public WeakPtrCache<Key, Value> {
    using Base = WeakPtrCache<Key, Value>;
    using ValuePtr = std::shared_ptr<Value>;
    using Factory = typename Base::Factory;
    
    struct CacheEntry {
        std::weak_ptr<Value> value;
        std::chrono::steady_clock::time_point created;
        size_t access_count = 1;
    };
    
    mutable std::unordered_map<Key, CacheEntry> advanced_cache_;
    mutable std::mutex advanced_mutex_;
    std::chrono::milliseconds ttl_;
    size_t max_size_;
    Factory factory_;
    
    // LRU eviction policy
    void evictLRU() {
        if (advanced_cache_.size() <= max_size_) return;
        
        auto lru_it = advanced_cache_.end();
        size_t min_access = SIZE_MAX;
        
        for (auto it = advanced_cache_.begin(); it != advanced_cache_.end(); ++it) {
            if (it->second.access_count < min_access) {
                min_access = it->second.access_count;
                lru_it = it;
            }
        }
        
        if (lru_it != advanced_cache_.end()) {
            advanced_cache_.erase(lru_it);
        }
    }
    
    bool isExpired(const CacheEntry& entry) const {
        auto age = std::chrono::steady_clock::now() - entry.created;
        return age > ttl_;
    }
    
public:
    AdvancedWeakCache(Factory factory, 
                     std::chrono::milliseconds ttl = std::chrono::minutes(10),
                     size_t max_size = 1000) 
        : Base(factory), factory_(factory), ttl_(ttl), max_size_(max_size) {}
    
    ValuePtr get(const Key& key) override {
        std::lock_guard<std::mutex> lock(advanced_mutex_);
        
        auto it = advanced_cache_.find(key);
        if (it != advanced_cache_.end()) {
            // Check if entry is expired
            if (isExpired(it->second)) {
                advanced_cache_.erase(it);
                return createAndCache(key);
            }
            
            // Check if object is still alive
            if (auto value = it->second.value.lock()) {
                ++it->second.access_count;  // Update LRU info
                return value;  // Cache hit
            } else {
                // Object expired, remove entry
                advanced_cache_.erase(it);
            }
        }
        
        return createAndCache(key);
    }
    
private:
    ValuePtr createAndCache(const Key& key) {
        evictLRU();  // Make room if necessary
        
        auto value = factory_(key);
        CacheEntry entry{
            value,
            std::chrono::steady_clock::now(),
            1
        };
        
        advanced_cache_[key] = entry;
        return value;
    }
    
public:
    void cleanup() override {
        std::lock_guard<std::mutex> lock(advanced_mutex_);
        
        auto now = std::chrono::steady_clock::now();
        
        for (auto it = advanced_cache_.begin(); it != advanced_cache_.end();) {
            bool should_remove = false;
            
            // Remove if expired by TTL
            if (now - it->second.created > ttl_) {
                should_remove = true;
            }
            // Remove if weak_ptr is expired
            else if (it->second.value.expired()) {
                should_remove = true;
            }
            
            if (should_remove) {
                it = advanced_cache_.erase(it);
            } else {
                ++it;
            }
        }
    }
};

// Resource manager using weak cache
class ResourceManager {
    using ResourceCache = AdvancedWeakCache<std::string, Resource>;
    
    std::unique_ptr<ResourceCache> cache_;
    size_t created_resources_ = 0;
    
    std::shared_ptr<Resource> createResource(const std::string& id) {
        ++created_resources_;
        
        // Simulate expensive resource creation
        std::string data = "Data for " + id + " (created at " + 
                          std::to_string(created_resources_) + ")";
        
        return std::make_shared<Resource>(id, data);
    }
    
public:
    ResourceManager() {
        auto factory = [this](const std::string& id) {
            return createResource(id);
        };
        
        cache_ = std::make_unique<ResourceCache>(
            factory, 
            std::chrono::seconds(30),  // 30 second TTL
            100  // Max 100 entries
        );
    }
    
    std::shared_ptr<Resource> getResource(const std::string& id) {
        return cache_->get(id);
    }
    
    void preloadResource(const std::string& id) {
        cache_->put(id, createResource(id));
    }
    
    void cleanup() {
        cache_->cleanup();
    }
    
    void printStatus() const {
        std::cout << "Resource Manager Status:\\n";
        std::cout << "  Total resources created: " << created_resources_ << "\\n";
        cache_->printStatistics();
    }
};

// Demonstration of weak pointer cache
void demonstrateWeakCache() {
    std::cout << "=== Weak Pointer Cache Demonstration ===\\n";
    
    ResourceManager manager;
    
    // Load some resources
    std::vector<std::shared_ptr<Resource>> resources;
    
    for (int i = 1; i <= 5; ++i) {
        std::string id = "resource_" + std::to_string(i);
        auto resource = manager.getResource(id);  // Cache miss - will create
        resources.push_back(resource);
        
        std::cout << "Loaded: " << resource->getId() << "\\n";
    }
    
    // Access cached resources (should be hits)
    for (int i = 1; i <= 5; ++i) {
        std::string id = "resource_" + std::to_string(i);
        auto resource = manager.getResource(id);  // Cache hit
        std::cout << "Accessed: " << resource->getId() << "\\n";
    }
    
    manager.printStatus();
    
    // Release some resources
    resources.erase(resources.begin() + 2, resources.begin() + 4);
    
    std::cout << "\\nAfter releasing some resources:\\n";
    
    // Try to access released resources
    auto resource3 = manager.getResource("resource_3");  // Should create new one
    std::cout << "Re-accessed resource_3 (new instance): " << resource3->getData() << "\\n";
    
    manager.cleanup();  // Clean expired entries
    manager.printStatus();
}`,

    thread_safety: `// Thread-Safe std::weak_ptr Usage
#include <memory>
#include <atomic>
#include <thread>
#include <vector>
#include <iostream>
#include <mutex>
#include <condition_variable>
#include <random>

// Thread-safe weak pointer operations
class ThreadSafeResource {
    std::string data_;
    mutable std::atomic<size_t> access_count_{0};
    mutable std::mutex data_mutex_;
    
public:
    ThreadSafeResource(const std::string& data) : data_(data) {}
    
    std::string getData() const {
        std::lock_guard<std::mutex> lock(data_mutex_);
        ++access_count_;
        return data_;
    }
    
    void setData(const std::string& data) {
        std::lock_guard<std::mutex> lock(data_mutex_);
        data_ = data;
    }
    
    size_t getAccessCount() const {
        return access_count_.load();
    }
    
    ~ThreadSafeResource() {
        std::cout << "ThreadSafeResource destroyed (accessed " 
                  << access_count_.load() << " times)\\n";
    }
};

// Atomic weak_ptr operations for C++20 (if available)
template<typename T>
class AtomicWeakPtr {
    mutable std::mutex weak_ptr_mutex_;
    std::weak_ptr<T> weak_ptr_;
    
public:
    AtomicWeakPtr() = default;
    
    AtomicWeakPtr(const std::weak_ptr<T>& ptr) : weak_ptr_(ptr) {}
    
    // Copy constructor
    AtomicWeakPtr(const AtomicWeakPtr& other) {
        std::lock_guard<std::mutex> lock(other.weak_ptr_mutex_);
        weak_ptr_ = other.weak_ptr_;
    }
    
    // Assignment operator
    AtomicWeakPtr& operator=(const AtomicWeakPtr& other) {
        if (this != &other) {
            std::lock(weak_ptr_mutex_, other.weak_ptr_mutex_);
            std::lock_guard<std::mutex> lock1(weak_ptr_mutex_, std::adopt_lock);
            std::lock_guard<std::mutex> lock2(other.weak_ptr_mutex_, std::adopt_lock);
            weak_ptr_ = other.weak_ptr_;
        }
        return *this;
    }
    
    void store(const std::weak_ptr<T>& ptr) {
        std::lock_guard<std::mutex> lock(weak_ptr_mutex_);
        weak_ptr_ = ptr;
    }
    
    std::weak_ptr<T> load() const {
        std::lock_guard<std::mutex> lock(weak_ptr_mutex_);
        return weak_ptr_;
    }
    
    std::shared_ptr<T> lock() const {
        std::lock_guard<std::mutex> lock(weak_ptr_mutex_);
        return weak_ptr_.lock();
    }
    
    bool expired() const {
        std::lock_guard<std::mutex> lock(weak_ptr_mutex_);
        return weak_ptr_.expired();
    }
    
    void reset() {
        std::lock_guard<std::mutex> lock(weak_ptr_mutex_);
        weak_ptr_.reset();
    }
    
    size_t use_count() const {
        std::lock_guard<std::mutex> lock(weak_ptr_mutex_);
        return weak_ptr_.use_count();
    }
};

// Thread-safe observer with weak references
class ThreadSafeObserver {
    std::atomic<size_t> notifications_received_{0};
    std::string name_;
    AtomicWeakPtr<ThreadSafeResource> observed_;
    
public:
    ThreadSafeObserver(const std::string& name) : name_(name) {}
    
    void observe(std::shared_ptr<ThreadSafeResource> resource) {
        observed_.store(resource);
    }
    
    void notify() {
        if (auto resource = observed_.lock()) {
            // Successfully locked - resource is still alive
            std::string data = resource->getData();
            ++notifications_received_;
            
            std::cout << "Observer " << name_ << " processed notification "
                      << notifications_received_.load() << " with data: " << data << "\\n";
        } else {
            std::cout << "Observer " << name_ << " received notification but resource is gone\\n";
        }
    }
    
    bool isObserving() const {
        return !observed_.expired();
    }
    
    size_t getNotificationCount() const {
        return notifications_received_.load();
    }
    
    void stopObserving() {
        observed_.reset();
    }
    
    ~ThreadSafeObserver() {
        std::cout << "ThreadSafeObserver " << name_ << " destroyed ("
                  << notifications_received_.load() << " notifications)\\n";
    }
};

// Multi-threaded weak pointer test
class WeakPtrStressTest {
    std::shared_ptr<ThreadSafeResource> resource_;
    std::vector<std::unique_ptr<ThreadSafeObserver>> observers_;
    std::atomic<bool> running_{true};
    std::atomic<size_t> race_conditions_{0};
    std::atomic<size_t> successful_locks_{0};
    std::atomic<size_t> failed_locks_{0};
    
public:
    WeakPtrStressTest() {
        resource_ = std::make_shared<ThreadSafeResource>("Initial Data");
        
        // Create observers
        for (int i = 0; i < 10; ++i) {
            auto observer = std::make_unique<ThreadSafeObserver>("Observer_" + std::to_string(i));
            observer->observe(resource_);
            observers_.push_back(std::move(observer));
        }
    }
    
    void runProducerThread() {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> delay(1, 10);
        
        int iteration = 0;
        while (running_.load()) {
            // Update resource data
            if (resource_) {
                resource_->setData("Data_" + std::to_string(iteration++));
            }
            
            // Notify observers
            for (auto& observer : observers_) {
                observer->notify();
            }
            
            std::this_thread::sleep_for(std::chrono::milliseconds(delay(gen)));
        }
    }
    
    void runConsumerThread(int thread_id) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> delay(1, 5);
        
        while (running_.load()) {
            // Try to access resource through weak references
            for (auto& observer : observers_) {
                if (observer->isObserving()) {
                    ++successful_locks_;
                } else {
                    ++failed_locks_;
                }
            }
            
            std::this_thread::sleep_for(std::chrono::milliseconds(delay(gen)));
        }
    }
    
    void runDestructorThread() {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        
        // Destroy resource after some time
        std::cout << "Destroying shared resource...\\n";
        resource_.reset();
        
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
        
        // Recreate resource
        std::cout << "Recreating shared resource...\\n";
        resource_ = std::make_shared<ThreadSafeResource>("Recreated Data");
        
        // Re-attach observers
        for (auto& observer : observers_) {
            observer->observe(resource_);
        }
    }
    
    void runStressTest(std::chrono::milliseconds duration) {
        std::cout << "Starting " << duration.count() << "ms stress test...\\n";
        
        std::vector<std::thread> threads;
        
        // Start producer thread
        threads.emplace_back(&WeakPtrStressTest::runProducerThread, this);
        
        // Start consumer threads
        for (int i = 0; i < 4; ++i) {
            threads.emplace_back(&WeakPtrStressTest::runConsumerThread, this, i);
        }
        
        // Start destructor thread
        threads.emplace_back(&WeakPtrStressTest::runDestructorThread, this);
        
        // Run for specified duration
        std::this_thread::sleep_for(duration);
        running_.store(false);
        
        // Join all threads
        for (auto& t : threads) {
            if (t.joinable()) {
                t.join();
            }
        }
        
        printResults();
    }
    
    void printResults() const {
        std::cout << "\\nStress Test Results:\\n";
        std::cout << "  Successful weak_ptr locks: " << successful_locks_.load() << "\\n";
        std::cout << "  Failed weak_ptr locks: " << failed_locks_.load() << "\\n";
        std::cout << "  Race conditions detected: " << race_conditions_.load() << "\\n";
        
        if (resource_) {
            std::cout << "  Final resource access count: " << resource_->getAccessCount() << "\\n";
        }
        
        for (const auto& observer : observers_) {
            std::cout << "  " << "Observer notifications: " << observer->getNotificationCount() << "\\n";
        }
    }
};

// Demonstration of thread safety issues and solutions
void demonstrateThreadSafety() {
    std::cout << "=== Thread Safety Demonstration ===\\n";
    
    // Run basic thread safety test
    {
        auto resource = std::make_shared<ThreadSafeResource>("Shared Resource");
        std::vector<std::weak_ptr<ThreadSafeResource>> weak_refs;
        
        // Create weak references
        for (int i = 0; i < 5; ++i) {
            weak_refs.push_back(resource);
        }
        
        std::vector<std::thread> threads;
        std::atomic<size_t> successful_accesses{0};
        std::atomic<size_t> failed_accesses{0};
        
        // Start threads that try to access through weak_ptr
        for (int i = 0; i < 3; ++i) {
            threads.emplace_back([&weak_refs, &successful_accesses, &failed_accesses]() {
                for (int j = 0; j < 100; ++j) {
                    for (auto& weak_ref : weak_refs) {
                        if (auto shared = weak_ref.lock()) {
                            shared->getData();  // Safe access
                            ++successful_accesses;
                        } else {
                            ++failed_accesses;
                        }
                    }
                    std::this_thread::sleep_for(std::chrono::microseconds(10));
                }
            });
        }
        
        // Destroy resource after short delay
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
        resource.reset();
        
        // Wait for threads
        for (auto& t : threads) {
            if (t.joinable()) {
                t.join();
            }
        }
        
        std::cout << "Basic test - Successful: " << successful_accesses.load() 
                  << ", Failed: " << failed_accesses.load() << "\\n";
    }
    
    // Run comprehensive stress test
    WeakPtrStressTest stress_test;
    stress_test.runStressTest(std::chrono::milliseconds(500));
}`
  };

  const scenarios = [
    {
      title: 'Reference Cycle Breaking',
      code: codeExamples.cycle_breaking,
      explanation: state.language === 'en' 
        ? 'Advanced techniques for breaking circular dependencies using weak_ptr in tree structures and parent-child relationships.'
        : 'Técnicas avanzadas para romper dependencias circulares usando weak_ptr en estructuras de árbol y relaciones padre-hijo.'
    },
    {
      title: 'Observer Pattern',
      code: codeExamples.observer_pattern,
      explanation: state.language === 'en'
        ? 'Safe observer pattern implementation using weak_ptr to prevent dangling references and memory leaks.'
        : 'Implementación segura del patrón observer usando weak_ptr para prevenir referencias colgantes y fugas de memoria.'
    },
    {
      title: 'Cache Implementation',
      code: codeExamples.cache_implementation,
      explanation: state.language === 'en'
        ? 'Sophisticated caching systems that use weak_ptr to avoid preventing object destruction.'
        : 'Sistemas de caché sofisticados que usan weak_ptr para evitar impedir la destrucción de objetos.'
    },
    {
      title: 'Thread Safety',
      code: codeExamples.thread_safety,
      explanation: state.language === 'en'
        ? 'Thread-safe weak_ptr usage patterns with atomic operations and race condition prevention.'
        : 'Patrones de uso thread-safe de weak_ptr con operaciones atómicas y prevención de condiciones de carrera.'
    }
  ];

  const breakCycle = () => {
    setLessonState(prev => ({
      ...prev,
      cycleBreaking: {
        ...prev.cycleBreaking,
        nodes: prev.cycleBreaking.nodes.map(node => 
          node.isLeaking ? { ...node, hasStrongRef: false, hasWeakRef: true, isLeaking: false, refCount: 0 } : node
        ),
        totalLeaks: 0,
        memoryUsage: Math.max(512, prev.cycleBreaking.memoryUsage - 512)
      },
      performanceStats: {
        ...prev.performanceStats,
        cycleDetection: Math.min(100, prev.performanceStats.cycleDetection + 15),
        memoryEfficiency: Math.min(100, prev.performanceStats.memoryEfficiency + 10)
      }
    }));
  };

  const notifyObservers = () => {
    setLessonState(prev => ({
      ...prev,
      observerPattern: {
        ...prev.observerPattern,
        notifications: prev.observerPattern.notifications + 1,
        subjects: prev.observerPattern.subjects.map(subject => ({
          ...subject,
          isActive: !subject.isActive
        }))
      }
    }));
  };

  const testCache = () => {
    setLessonState(prev => ({
      ...prev,
      cacheSystem: {
        ...prev.cacheSystem,
        totalHits: prev.cacheSystem.totalHits + Math.floor(Math.random() * 5) + 1,
        totalMisses: prev.cacheSystem.totalMisses + Math.floor(Math.random() * 2),
        entries: prev.cacheSystem.entries.map(entry => ({
          ...entry,
          lockAttempts: entry.lockAttempts + (Math.random() > 0.7 ? 1 : 0),
          hitRate: Math.min(1.0, entry.hitRate + 0.05)
        })),
        efficiency: Math.min(1.0, prev.cacheSystem.efficiency + 0.02)
      }
    }));
  };

  const runThreadTest = () => {
    setLessonState(prev => ({
      ...prev,
      threadSafety: {
        ...prev.threadSafety,
        atomicOperations: prev.threadSafety.atomicOperations + 10,
        threads: prev.threadSafety.threads.map(thread => ({
          ...thread,
          status: Math.random() > 0.8 ? 'failed' : 'success'
        }))
      },
      performanceStats: {
        ...prev.performanceStats,
        lockPerformance: Math.min(100, prev.performanceStats.lockPerformance + 3)
      }
    }));
  };

  const nextScenario = () => {
    const nextIndex = (lessonState.currentScenario + 1) % scenarios.length;
    setLessonState(prev => ({
      ...prev,
      currentScenario: nextIndex,
      demonstrationType: ['cycle_breaking', 'observer_pattern', 'cache_implementation', 'thread_safety'][nextIndex] as WeakPtrAdvancedState['demonstrationType']
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Master advanced weak_ptr use cases and patterns' : 'Dominar casos de uso y patrones avanzados de weak_ptr',
    state.language === 'en' ? 'Break reference cycles in complex object hierarchies' : 'Romper ciclos de referencia en jerarquías complejas de objetos',
    state.language === 'en' ? 'Implement safe observer patterns with weak references' : 'Implementar patrones observer seguros con referencias débiles',
    state.language === 'en' ? 'Create efficient caching systems using weak_ptr' : 'Crear sistemas de caché eficientes usando weak_ptr',
    state.language === 'en' ? 'Ensure thread safety in multi-threaded weak_ptr scenarios' : 'Asegurar thread safety en escenarios multi-hilo con weak_ptr'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Advanced std::weak_ptr Patterns" : "Patrones Avanzados de std::weak_ptr"}
      subtitle={state.language === 'en' 
        ? "Master sophisticated weak reference patterns for production-ready C++ applications" 
        : "Domina patrones sofisticados de referencias débiles para aplicaciones C++ listas para producción"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🔗 Advanced Weak Pointer Concepts' : '🔗 Conceptos Avanzados de Punteros Débiles'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'std::weak_ptr becomes essential in advanced C++ patterns where shared ownership creates complex relationships. Beyond basic cycle prevention, weak_ptr enables sophisticated observer patterns, non-owning caches, and thread-safe reference management in production systems.'
            : 'std::weak_ptr se vuelve esencial en patrones avanzados de C++ donde la propiedad compartida crea relaciones complejas. Más allá de la prevención básica de ciclos, weak_ptr permite patrones observer sofisticados, cachés sin propiedad y gestión thread-safe de referencias en sistemas de producción.'}
        </p>

        <div style={{ height: '500px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <WeakPtrVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive Weak Pointer Demonstration' : '🧪 Demostración Interactiva de Punteros Débiles'}
        </SectionTitle>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button onClick={nextScenario}>
            {state.language === 'en' ? 'Next Scenario' : 'Siguiente Escenario'} ({lessonState.currentScenario + 1}/4)
          </Button>
          
          <Button onClick={breakCycle} style={{ background: '#e74c3c' }}>
            {state.language === 'en' ? 'Break Cycles' : 'Romper Ciclos'}
          </Button>
          
          <Button onClick={notifyObservers} style={{ background: '#3498db' }}>
            {state.language === 'en' ? 'Notify Observers' : 'Notificar Observadores'}
          </Button>
          
          <Button onClick={testCache} style={{ background: '#27ae60' }}>
            {state.language === 'en' ? 'Test Cache' : 'Probar Caché'}
          </Button>
          
          <Button onClick={runThreadTest} style={{ background: '#9b59b6' }}>
            {state.language === 'en' ? 'Run Thread Test' : 'Ejecutar Test Hilos'}
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div>
            <h4>{scenarios[lessonState.currentScenario].title}</h4>
            <p>{scenarios[lessonState.currentScenario].explanation}</p>
            
            <CodeBlock
              language="cpp"
              showLineNumbers={true}
            >
              {scenarios[lessonState.currentScenario].code}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Advanced Metrics' : 'Métricas Avanzadas'}</h4>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px', 
              marginBottom: '15px' 
            }}>
              <div style={{ padding: '8px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '4px' }}>
                <strong>{state.language === 'en' ? 'Memory Leaks' : 'Fugas Memoria'}:</strong>
                <br />{lessonState.cycleBreaking.totalLeaks}
              </div>
              
              <div style={{ padding: '8px', background: 'rgba(52, 152, 219, 0.1)', border: '1px solid #3498db', borderRadius: '4px' }}>
                <strong>{state.language === 'en' ? 'Notifications' : 'Notificaciones'}:</strong>
                <br />{lessonState.observerPattern.notifications}
              </div>
              
              <div style={{ padding: '8px', background: 'rgba(39, 174, 96, 0.1)', border: '1px solid #27ae60', borderRadius: '4px' }}>
                <strong>{state.language === 'en' ? 'Cache Efficiency' : 'Eficiencia Caché'}:</strong>
                <br />{(lessonState.cacheSystem.efficiency * 100).toFixed(1)}%
              </div>
              
              <div style={{ padding: '8px', background: 'rgba(155, 89, 182, 0.1)', border: '1px solid #9b59b6', borderRadius: '4px' }}>
                <strong>{state.language === 'en' ? 'Atomic Ops' : 'Ops Atómicas'}:</strong>
                <br />{lessonState.threadSafety.atomicOperations}
              </div>
            </div>

            <h4>{state.language === 'en' ? 'Key Weak Pointer Methods' : 'Métodos Clave de Weak Pointer'}</h4>
            <ul>
              <li><code>expired()</code> - {state.language === 'en' ? 'Check if referenced object is destroyed' : 'Verificar si el objeto referenciado fue destruido'}</li>
              <li><code>lock()</code> - {state.language === 'en' ? 'Get shared_ptr if object still exists' : 'Obtener shared_ptr si el objeto aún existe'}</li>
              <li><code>use_count()</code> - {state.language === 'en' ? 'Get reference count of managed object' : 'Obtener contador de referencias del objeto gestionado'}</li>
              <li><code>reset()</code> - {state.language === 'en' ? 'Release weak reference' : 'Liberar referencia débil'}</li>
              <li><code>owner_before()</code> - {state.language === 'en' ? 'Compare control blocks for ordering' : 'Comparar bloques de control para ordenamiento'}</li>
            </ul>

            <h4>{state.language === 'en' ? 'Performance Characteristics' : 'Características de Rendimiento'}</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px' 
            }}>
              <div>
                <strong>{state.language === 'en' ? 'Weak Ptr Overhead:' : 'Overhead Weak Ptr:'}</strong> {lessonState.performanceStats.weakPtrOverhead} bytes
              </div>
              <div>
                <strong>{state.language === 'en' ? 'Lock Performance:' : 'Rendimiento Lock:'}</strong> {lessonState.performanceStats.lockPerformance}%
              </div>
              <div>
                <strong>{state.language === 'en' ? 'Cycle Detection:' : 'Detección Ciclos:'}</strong> {lessonState.performanceStats.cycleDetection}%
              </div>
              <div>
                <strong>{state.language === 'en' ? 'Memory Efficiency:' : 'Eficiencia Memoria:'}</strong> {lessonState.performanceStats.memoryEfficiency}%
              </div>
            </div>

            <div style={{ 
              marginTop: '15px',
              padding: '10px', 
              background: 'rgba(52, 152, 219, 0.1)', 
              border: '1px solid #3498db', 
              borderRadius: '5px' 
            }}>
              <strong>{state.language === 'en' ? '🎯 Advanced Pattern Status:' : '🎯 Estado Patrón Avanzado:'}</strong>
              <br />
              <strong>{state.language === 'en' ? 'Cycles:' : 'Ciclos:'}</strong> {lessonState.cycleBreaking.totalLeaks === 0 ? (state.language === 'en' ? 'Resolved' : 'Resueltos') : (state.language === 'en' ? 'Active' : 'Activos')}
              <br />
              <strong>{state.language === 'en' ? 'Observers:' : 'Observadores:'}</strong> {lessonState.observerPattern.subjects.filter(s => s.isActive).length} / {lessonState.observerPattern.subjects.length} {state.language === 'en' ? 'Active' : 'Activos'}
              <br />
              <strong>{state.language === 'en' ? 'Cache:' : 'Caché:'}</strong> {lessonState.cacheSystem.entries.filter(e => !e.isExpired).length} / {lessonState.cacheSystem.entries.length} {state.language === 'en' ? 'Valid' : 'Válidas'}
            </div>
          </div>
        </div>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🚀 Production Use Cases' : '🚀 Casos de Uso en Producción'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '8px' }}>
            <h4 style={{ color: '#e74c3c' }}>{state.language === 'en' ? '🔄 Cycle Prevention' : '🔄 Prevención de Ciclos'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Parent-child tree relationships' : 'Relaciones padre-hijo en árboles'}</li>
              <li>{state.language === 'en' ? 'Bidirectional graph structures' : 'Estructuras de grafos bidireccionales'}</li>
              <li>{state.language === 'en' ? 'Observer-subject dependencies' : 'Dependencias observer-sujeto'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(52, 152, 219, 0.1)', border: '1px solid #3498db', borderRadius: '8px' }}>
            <h4 style={{ color: '#3498db' }}>{state.language === 'en' ? '👀 Observer Patterns' : '👀 Patrones Observer'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Event notification systems' : 'Sistemas de notificación de eventos'}</li>
              <li>{state.language === 'en' ? 'Model-view architectures' : 'Arquitecturas modelo-vista'}</li>
              <li>{state.language === 'en' ? 'Publisher-subscriber messaging' : 'Mensajería publisher-subscriber'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(39, 174, 96, 0.1)', border: '1px solid #27ae60', borderRadius: '8px' }}>
            <h4 style={{ color: '#27ae60' }}>{state.language === 'en' ? '💾 Smart Caching' : '💾 Caché Inteligente'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Non-owning resource caches' : 'Cachés de recursos sin propiedad'}</li>
              <li>{state.language === 'en' ? 'Automatic cleanup on destruction' : 'Limpieza automática en destrucción'}</li>
              <li>{state.language === 'en' ? 'Memory-efficient lookups' : 'Búsquedas eficientes en memoria'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(155, 89, 182, 0.1)', border: '1px solid #9b59b6', borderRadius: '8px' }}>
            <h4 style={{ color: '#9b59b6' }}>{state.language === 'en' ? '🔒 Thread Safety' : '🔒 Seguridad de Hilos'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Atomic weak_ptr operations' : 'Operaciones atómicas de weak_ptr'}</li>
              <li>{state.language === 'en' ? 'Race condition prevention' : 'Prevención de condiciones de carrera'}</li>
              <li>{state.language === 'en' ? 'Lock-free observer notifications' : 'Notificaciones observer lock-free'}</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '⚠️ Best Practices & Pitfalls' : '⚠️ Mejores Prácticas y Problemas'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#27ae60' }}>{state.language === 'en' ? '✅ Best Practices' : '✅ Mejores Prácticas'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Always check expired() or use lock()' : 'Siempre verificar expired() o usar lock()'}</li>
              <li>{state.language === 'en' ? 'Use weak_ptr for parent references' : 'Usar weak_ptr para referencias padre'}</li>
              <li>{state.language === 'en' ? 'Implement proper cleanup in observers' : 'Implementar limpieza adecuada en observers'}</li>
              <li>{state.language === 'en' ? 'Consider thread safety in multi-threaded code' : 'Considerar thread safety en código multi-hilo'}</li>
              <li>{state.language === 'en' ? 'Use enable_shared_from_this for self-references' : 'Usar enable_shared_from_this para auto-referencias'}</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#e74c3c' }}>{state.language === 'en' ? '❌ Common Pitfalls' : '❌ Problemas Comunes'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Using expired weak_ptr without checking' : 'Usar weak_ptr expirado sin verificar'}</li>
              <li>{state.language === 'en' ? 'Creating cycles with weak_ptr incorrectly' : 'Crear ciclos con weak_ptr incorrectamente'}</li>
              <li>{state.language === 'en' ? 'Not handling lock() failures gracefully' : 'No manejar fallos de lock() correctamente'}</li>
              <li>{state.language === 'en' ? 'Performance issues with frequent locking' : 'Problemas de rendimiento con bloqueos frecuentes'}</li>
              <li>{state.language === 'en' ? 'Thread safety assumptions in atomic operations' : 'Suposiciones de thread safety en operaciones atómicas'}</li>
            </ul>
          </div>
        </div>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Advanced weak_ptr lesson. Current scenario: ${scenarios[lessonState.currentScenario].title}, Memory leaks: ${lessonState.cycleBreaking.totalLeaks}, Cache efficiency: ${(lessonState.cacheSystem.efficiency * 100).toFixed(1)}%`}
      />
    </LessonLayout>
  );
};

export default Lesson71_WeakPtr;