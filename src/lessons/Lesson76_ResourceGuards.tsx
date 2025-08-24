/**
 * Lesson 76: Resource Guards - RAII Patterns and Exception Safety
 * Complete guide to resource guards, lock guards, and exception-safe resource management
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
  AccessibilityAnnouncer
} from '../design-system';

interface ResourceGuardsState {
  language: 'en' | 'es';
  scenario: 'lock_guards' | 'unique_lock' | 'scope_guards' | 'transaction_guards';
  isAnimating: boolean;
  locksAcquired: number;
  resourcesGuarded: number;
  rollbacksExecuted: number;
  exceptionsHandled: number;
  performanceBenefit: number;
  deadlocksAvoided: number;
}

// 3D Visualization of Resource Guard Operations
const ResourceGuardsVisualization: React.FC<{ scenario: string; isAnimating: boolean; onMetrics: (metrics: any) => void }> = ({ 
  scenario, isAnimating, onMetrics 
}) => {
  const groupRef = useRef<Group>(null);
  const lockRef = useRef<Group>(null);
  const guardRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'lock_guards') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      if (lockRef.current) {
        lockRef.current.position.y = Math.sin(animationRef.current * 1.2) * 0.2;
      }
      onMetrics({
        locksAcquired: Math.floor(animationRef.current * 10) % 120,
        resourcesGuarded: Math.floor(animationRef.current * 8) % 100,
        performanceBenefit: 92 + Math.sin(animationRef.current) * 6,
        deadlocksAvoided: Math.floor(animationRef.current * 2) % 15
      });
    } else if (scenario === 'unique_lock') {
      groupRef.current.rotation.z = Math.sin(animationRef.current * 0.8) * 0.1;
      if (guardRef.current) {
        guardRef.current.rotation.x = animationRef.current * 0.6;
      }
      onMetrics({
        locksAcquired: Math.floor(animationRef.current * 12) % 150,
        resourcesGuarded: Math.floor(animationRef.current * 15) % 180,
        performanceBenefit: 88 + Math.cos(animationRef.current * 0.9) * 8,
        flexibleOperations: Math.floor(animationRef.current * 5) % 60
      });
    } else if (scenario === 'scope_guards') {
      if (lockRef.current) {
        lockRef.current.rotation.y = animationRef.current * 0.7;
      }
      if (guardRef.current) {
        guardRef.current.position.z = Math.cos(animationRef.current * 1.1) * 0.3;
      }
      onMetrics({
        resourcesGuarded: Math.floor(animationRef.current * 18) % 220,
        rollbacksExecuted: Math.floor(animationRef.current * 3) % 35,
        exceptionsHandled: Math.floor(animationRef.current * 4) % 45,
        performanceBenefit: 95 + Math.sin(animationRef.current * 1.3) * 4
      });
    } else if (scenario === 'transaction_guards') {
      groupRef.current.position.y = Math.sin(animationRef.current * 0.5) * 0.1;
      if (lockRef.current && guardRef.current) {
        lockRef.current.rotation.z = animationRef.current * 0.4;
        guardRef.current.rotation.y = -animationRef.current * 0.6;
      }
      onMetrics({
        resourcesGuarded: Math.floor(animationRef.current * 22) % 280,
        rollbacksExecuted: Math.floor(animationRef.current * 6) % 75,
        exceptionsHandled: Math.floor(animationRef.current * 8) % 95,
        transactionCommits: Math.floor(animationRef.current * 7) % 85,
        performanceBenefit: 90 + Math.cos(animationRef.current * 0.8) * 7
      });
    }
  });

  const renderGuardBlocks = () => {
    const blocks = [];
    const blockCount = scenario === 'transaction_guards' ? 32 : scenario === 'scope_guards' ? 28 : 24;
    
    for (let i = 0; i < blockCount; i++) {
      const angle = (i / blockCount) * Math.PI * 2;
      const radius = scenario === 'unique_lock' ? 2.5 + Math.cos(i * 0.2) * 0.3 : 
                     scenario === 'transaction_guards' ? 2.2 : 2.4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = scenario === 'scope_guards' ? Math.sin(i * 0.3) * 0.3 : 
                scenario === 'transaction_guards' ? Math.cos(i * 0.4) * 0.2 : 0;
      
      const color = scenario === 'lock_guards' 
        ? (i % 4 === 0 ? '#00ff80' : i % 4 === 1 ? '#8000ff' : i % 4 === 2 ? '#ff8000' : '#0080ff')
        : scenario === 'unique_lock'
        ? (i % 3 === 0 ? '#ff4040' : i % 3 === 1 ? '#40ff40' : '#4040ff')
        : scenario === 'scope_guards'
        ? (i % 5 === 0 ? '#ff0060' : i % 5 === 1 ? '#00ff60' : i % 5 === 2 ? '#6000ff' : i % 5 === 3 ? '#ff6000' : '#0060ff')
        : (i % 6 === 0 ? '#ff2080' : i % 6 === 1 ? '#20ff80' : i % 6 === 2 ? '#8020ff' : i % 6 === 3 ? '#ff8020' : i % 6 === 4 ? '#2080ff' : '#80ff20');
      
      const scale = scenario === 'transaction_guards' ? 0.22 : scenario === 'scope_guards' ? 0.26 : 0.28;
      
      blocks.push(
        <mesh key={i} position={[x, y, z]} scale={[scale, scale, scale]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} transparent opacity={0.85} />
        </mesh>
      );
    }
    
    return blocks;
  };

  const renderCenterStructure = () => {
    if (scenario === 'lock_guards') {
      return (
        <group ref={lockRef}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.8, 1.2, 8]} />
            <meshStandardMaterial color="#00ff80" transparent opacity={0.7} />
          </mesh>
        </group>
      );
    } else if (scenario === 'unique_lock') {
      return (
        <group ref={guardRef}>
          <mesh position={[0, 0, 0]}>
            <dodecahedronGeometry args={[0.9]} />
            <meshStandardMaterial color="#ff4040" transparent opacity={0.6} />
          </mesh>
        </group>
      );
    } else if (scenario === 'scope_guards') {
      return (
        <group>
          <mesh ref={lockRef} position={[0, 0.5, 0]}>
            <octahedronGeometry args={[0.7]} />
            <meshStandardMaterial color="#ff0060" transparent opacity={0.8} />
          </mesh>
          <mesh ref={guardRef} position={[0, -0.5, 0]}>
            <icosahedronGeometry args={[0.6]} />
            <meshStandardMaterial color="#6000ff" transparent opacity={0.7} />
          </mesh>
        </group>
      );
    } else if (scenario === 'transaction_guards') {
      return (
        <group>
          <mesh ref={lockRef} position={[0, 0, 0]}>
            <torusKnotGeometry args={[0.8, 0.3, 64, 8]} />
            <meshStandardMaterial color="#ff2080" transparent opacity={0.6} />
          </mesh>
          <mesh ref={guardRef} position={[0, 0, 0]}>
            <torusGeometry args={[1.1, 0.2, 8, 16]} />
            <meshStandardMaterial color="#2080ff" transparent opacity={0.5} />
          </mesh>
        </group>
      );
    }
    return null;
  };

  return (
    <group ref={groupRef}>
      {renderGuardBlocks()}
      {renderCenterStructure()}
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 8, 8]} intensity={1.2} />
      <pointLight position={[-8, -8, 6]} intensity={0.6} color="#80ff80" />
      <pointLight position={[0, 10, -8]} intensity={0.4} color="#ff8080" />
    </group>
  );
};

const Lesson76_ResourceGuards: React.FC = () => {
  const [state, setState] = useState<ResourceGuardsState>({
    language: 'en',
    scenario: 'lock_guards',
    isAnimating: false,
    locksAcquired: 0,
    resourcesGuarded: 0,
    rollbacksExecuted: 0,
    exceptionsHandled: 0,
    performanceBenefit: 0,
    deadlocksAvoided: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: ResourceGuardsState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      lock_guards: state.language === 'en' ? 'Lock Guards' : 'Lock Guards',
      unique_lock: state.language === 'en' ? 'Unique Lock Patterns' : 'Patrones de Unique Lock',
      scope_guards: state.language === 'en' ? 'Scope Guards' : 'Scope Guards',
      transaction_guards: state.language === 'en' ? 'Transaction Guards' : 'Transaction Guards'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    lock_guards: `// Lock Guards - std::lock_guard y std::scoped_lock
#include <iostream>
#include <thread>
#include <mutex>
#include <vector>
#include <chrono>
#include <shared_mutex>
#include <atomic>

// Shared resource protected by mutex
class ThreadSafeCounter {
private:
    mutable std::mutex mutex_;
    int value_ = 0;
    
public:
    // Basic lock_guard usage
    void increment() {
        std::lock_guard<std::mutex> lock(mutex_); // RAII lock acquisition
        ++value_;
        // Lock automatically released when 'lock' goes out of scope
    }
    
    void decrement() {
        std::lock_guard<std::mutex> lock(mutex_);
        --value_;
    }
    
    int get() const {
        std::lock_guard<std::mutex> lock(mutex_); // const method, mutable mutex
        return value_;
    }
    
    // Compound operations safely protected
    void add(int delta) {
        std::lock_guard<std::mutex> lock(mutex_);
        value_ += delta;
        std::cout << "Added " << delta << ", new value: " << value_ << std::endl;
    }
    
    // Exception-safe operations
    void risky_operation() {
        std::lock_guard<std::mutex> lock(mutex_);
        
        if (value_ < 0) {
            throw std::runtime_error("Negative value not allowed");
        }
        
        value_ *= 2; // This executes only if no exception thrown
        
        // Lock is automatically released even if exception is thrown
    }
};

void demonstrate_basic_lock_guard() {
    std::cout << "=== Basic Lock Guard Demo ===\\n";
    
    ThreadSafeCounter counter;
    std::vector<std::thread> threads;
    
    // Create multiple threads that increment counter
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&counter, i]() {
            for (int j = 0; j < 10; ++j) {
                counter.increment();
                counter.add(i); // Compound operation
                std::this_thread::sleep_for(std::chrono::milliseconds(1));
            }
        });
    }
    
    // Create threads that decrement
    for (int i = 0; i < 3; ++i) {
        threads.emplace_back([&counter]() {
            for (int j = 0; j < 5; ++j) {
                counter.decrement();
                std::this_thread::sleep_for(std::chrono::milliseconds(2));
            }
        });
    }
    
    // Wait for all threads
    for (auto& thread : threads) {
        thread.join();
    }
    
    std::cout << "Final counter value: " << counter.get() << std::endl;
}

// Multiple mutex management with std::scoped_lock (C++17)
class BankAccount {
private:
    mutable std::mutex mutex_;
    double balance_;
    std::string account_number_;
    
public:
    BankAccount(const std::string& number, double initial_balance)
        : account_number_(number), balance_(initial_balance) {}
    
    double get_balance() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return balance_;
    }
    
    std::string get_account_number() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return account_number_;
    }
    
    void deposit(double amount) {
        std::lock_guard<std::mutex> lock(mutex_);
        balance_ += amount;
        std::cout << "Deposited $" << amount << " to " << account_number_ << std::endl;
    }
    
    bool withdraw(double amount) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (balance_ >= amount) {
            balance_ -= amount;
            std::cout << "Withdrew $" << amount << " from " << account_number_ << std::endl;
            return true;
        }
        return false;
    }
    
    std::mutex& get_mutex() { return mutex_; }
};

// Transfer function using std::scoped_lock to avoid deadlock
bool transfer_funds(BankAccount& from, BankAccount& to, double amount) {
    // std::scoped_lock locks multiple mutexes in a deadlock-safe manner
    std::scoped_lock lock(from.get_mutex(), to.get_mutex());
    
    if (from.get_balance() >= amount) {
        // These operations are now atomic together
        from.withdraw(amount);
        to.deposit(amount);
        
        std::cout << "Transfer successful: $" << amount 
                  << " from " << from.get_account_number() 
                  << " to " << to.get_account_number() << std::endl;
        return true;
    } else {
        std::cout << "Transfer failed: insufficient funds\\n";
        return false;
    }
}

void demonstrate_scoped_lock() {
    std::cout << "\\n=== Scoped Lock Demo ===\\n";
    
    BankAccount alice("ALICE001", 1000.0);
    BankAccount bob("BOB002", 500.0);
    BankAccount charlie("CHARLIE003", 750.0);
    
    std::vector<std::thread> threads;
    
    // Concurrent transfers that could cause deadlock with naive locking
    threads.emplace_back([&]() {
        for (int i = 0; i < 5; ++i) {
            transfer_funds(alice, bob, 50.0);
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
        }
    });
    
    threads.emplace_back([&]() {
        for (int i = 0; i < 5; ++i) {
            transfer_funds(bob, alice, 30.0);
            std::this_thread::sleep_for(std::chrono::milliseconds(15));
        }
    });
    
    threads.emplace_back([&]() {
        for (int i = 0; i < 3; ++i) {
            transfer_funds(alice, charlie, 100.0);
            transfer_funds(charlie, bob, 75.0);
            std::this_thread::sleep_for(std::chrono::milliseconds(20));
        }
    });
    
    // Wait for all transfers to complete
    for (auto& thread : threads) {
        thread.join();
    }
    
    std::cout << "\\nFinal balances:\\n";
    std::cout << alice.get_account_number() << ": $" << alice.get_balance() << "\\n";
    std::cout << bob.get_account_number() << ": $" << bob.get_balance() << "\\n";
    std::cout << charlie.get_account_number() << ": $" << charlie.get_balance() << "\\n";
}

// Shared mutex for reader-writer scenarios
class ReadWriteResource {
private:
    mutable std::shared_mutex shared_mutex_;
    std::vector<int> data_;
    std::string name_;
    
public:
    explicit ReadWriteResource(const std::string& name) : name_(name) {
        data_.reserve(100);
        for (int i = 0; i < 50; ++i) {
            data_.push_back(i);
        }
    }
    
    // Read operation - shared lock
    std::vector<int> read_data() const {
        std::shared_lock<std::shared_mutex> lock(shared_mutex_);
        std::cout << "[" << name_ << "] Reading data (thread: " 
                  << std::this_thread::get_id() << ")\\n";
        
        // Simulate read work
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
        
        return data_; // Return copy
    }
    
    // Write operation - exclusive lock
    void write_data(int value) {
        std::lock_guard<std::shared_mutex> lock(shared_mutex_);
        std::cout << "[" << name_ << "] Writing data " << value 
                  << " (thread: " << std::this_thread::get_id() << ")\\n";
        
        data_.push_back(value);
        
        // Simulate write work
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    
    size_t size() const {
        std::shared_lock<std::shared_mutex> lock(shared_mutex_);
        return data_.size();
    }
};

void demonstrate_shared_lock_guard() {
    std::cout << "\\n=== Shared Lock Guard Demo ===\\n";
    
    ReadWriteResource resource("SharedResource");
    std::vector<std::thread> threads;
    std::atomic<int> read_count{0};
    std::atomic<int> write_count{0};
    
    // Multiple reader threads
    for (int i = 0; i < 6; ++i) {
        threads.emplace_back([&resource, &read_count, i]() {
            for (int j = 0; j < 3; ++j) {
                auto data = resource.read_data();
                read_count.fetch_add(1);
                std::this_thread::sleep_for(std::chrono::milliseconds(2));
            }
        });
    }
    
    // Fewer writer threads
    for (int i = 0; i < 2; ++i) {
        threads.emplace_back([&resource, &write_count, i]() {
            for (int j = 0; j < 5; ++j) {
                resource.write_data(1000 + i * 10 + j);
                write_count.fetch_add(1);
                std::this_thread::sleep_for(std::chrono::milliseconds(5));
            }
        });
    }
    
    // Wait for all operations
    for (auto& thread : threads) {
        thread.join();
    }
    
    std::cout << "Operations completed:\\n";
    std::cout << "  Reads: " << read_count.load() << "\\n";
    std::cout << "  Writes: " << write_count.load() << "\\n";
    std::cout << "  Final data size: " << resource.size() << "\\n";
}

int main() {
    demonstrate_basic_lock_guard();
    demonstrate_scoped_lock();
    demonstrate_shared_lock_guard();
    
    std::cout << "\\n=== All lock guard demonstrations completed ===\\n";
    
    return 0;
}`,

    unique_lock: `// std::unique_lock - Flexible Locking Patterns
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <chrono>
#include <vector>
#include <atomic>
#include <random>

// Producer-Consumer with condition variables
template<typename T>
class ThreadSafeQueue {
private:
    mutable std::mutex mutex_;
    std::queue<T> queue_;
    std::condition_variable condition_;
    bool finished_ = false;
    
public:
    void push(T item) {
        std::unique_lock<std::mutex> lock(mutex_);
        queue_.push(std::move(item));
        std::cout << "Produced item, queue size: " << queue_.size() << std::endl;
        
        // Unlock before notifying to avoid unnecessary wakeup blocking
        lock.unlock();
        condition_.notify_one();
    }
    
    bool pop(T& item) {
        std::unique_lock<std::mutex> lock(mutex_);
        
        // Wait for item or finish signal
        condition_.wait(lock, [this] { 
            return !queue_.empty() || finished_; 
        });
        
        if (queue_.empty()) {
            return false; // Finished and no more items
        }
        
        item = std::move(queue_.front());
        queue_.pop();
        std::cout << "Consumed item, queue size: " << queue_.size() << std::endl;
        return true;
    }
    
    // Try to pop with timeout
    bool pop_with_timeout(T& item, std::chrono::milliseconds timeout) {
        std::unique_lock<std::mutex> lock(mutex_);
        
        if (condition_.wait_for(lock, timeout, [this] { 
            return !queue_.empty() || finished_; 
        })) {
            if (!queue_.empty()) {
                item = std::move(queue_.front());
                queue_.pop();
                return true;
            }
        }
        
        return false; // Timeout or finished
    }
    
    void finish() {
        std::unique_lock<std::mutex> lock(mutex_);
        finished_ = true;
        lock.unlock();
        condition_.notify_all();
    }
    
    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return queue_.size();
    }
};

void demonstrate_producer_consumer() {
    std::cout << "=== Producer-Consumer with unique_lock Demo ===\\n";
    
    ThreadSafeQueue<int> queue;
    std::atomic<int> total_produced{0};
    std::atomic<int> total_consumed{0};
    
    // Producer threads
    std::vector<std::thread> producers;
    for (int p = 0; p < 2; ++p) {
        producers.emplace_back([&queue, &total_produced, p]() {
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_int_distribution<> delay_dist(1, 5);
            
            for (int i = 0; i < 10; ++i) {
                int item = p * 100 + i;
                queue.push(item);
                total_produced.fetch_add(1);
                
                std::this_thread::sleep_for(
                    std::chrono::milliseconds(delay_dist(gen))
                );
            }
        });
    }
    
    // Consumer threads
    std::vector<std::thread> consumers;
    for (int c = 0; c < 3; ++c) {
        consumers.emplace_back([&queue, &total_consumed, c]() {
            int item;
            while (queue.pop(item)) {
                std::cout << "Consumer " << c << " got item: " << item << "\\n";
                total_consumed.fetch_add(1);
                
                // Simulate processing time
                std::this_thread::sleep_for(std::chrono::milliseconds(2));
            }
            std::cout << "Consumer " << c << " finished\\n";
        });
    }
    
    // Wait for producers to finish
    for (auto& producer : producers) {
        producer.join();
    }
    
    // Signal completion and wait for consumers
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    queue.finish();
    
    for (auto& consumer : consumers) {
        consumer.join();
    }
    
    std::cout << "Production completed:\\n";
    std::cout << "  Produced: " << total_produced.load() << "\\n";
    std::cout << "  Consumed: " << total_consumed.load() << "\\n";
}

// Deferred locking example
class ResourceManager {
private:
    std::mutex mutex1_;
    std::mutex mutex2_;
    std::vector<std::string> resource1_;
    std::vector<std::string> resource2_;
    
public:
    ResourceManager() {
        resource1_ = {"R1_Item1", "R1_Item2", "R1_Item3"};
        resource2_ = {"R2_Item1", "R2_Item2", "R2_Item3"};
    }
    
    // Deferred locking to avoid deadlock
    void swap_resources() {
        // Create unique_locks without locking immediately
        std::unique_lock<std::mutex> lock1(mutex1_, std::defer_lock);
        std::unique_lock<std::mutex> lock2(mutex2_, std::defer_lock);
        
        // Lock both mutexes simultaneously in deadlock-safe manner
        std::lock(lock1, lock2);
        
        std::cout << "Swapping resources...\\n";
        std::swap(resource1_, resource2_);
        
        std::cout << "Resources swapped successfully\\n";
        
        // Locks automatically released when unique_locks go out of scope
    }
    
    // Try-lock pattern
    bool try_quick_operation() {
        std::unique_lock<std::mutex> lock1(mutex1_, std::try_to_lock);
        std::unique_lock<std::mutex> lock2(mutex2_, std::try_to_lock);
        
        if (lock1.owns_lock() && lock2.owns_lock()) {
            std::cout << "Quick operation: both locks acquired\\n";
            
            // Perform quick operation
            resource1_.push_back("QuickItem");
            resource2_.push_back("QuickItem");
            
            return true;
        } else {
            std::cout << "Quick operation: could not acquire locks\\n";
            return false;
        }
    }
    
    // Timed locking
    bool timed_operation(std::chrono::milliseconds timeout) {
        using namespace std::chrono;
        
        std::unique_lock<std::mutex> lock1(mutex1_, std::defer_lock);
        std::unique_lock<std::mutex> lock2(mutex2_, std::defer_lock);
        
        auto deadline = steady_clock::now() + timeout;
        
        // Try to lock with timeout
        if (lock1.try_lock_until(deadline) && lock2.try_lock_until(deadline)) {
            std::cout << "Timed operation: locks acquired within timeout\\n";
            
            // Simulate work
            std::this_thread::sleep_for(milliseconds(10));
            
            resource1_.push_back("TimedItem");
            resource2_.push_back("TimedItem");
            
            return true;
        } else {
            std::cout << "Timed operation: timeout exceeded\\n";
            return false;
        }
    }
    
    void print_resources() const {
        std::lock_guard<std::mutex> lock1(mutex1_);
        std::lock_guard<std::mutex> lock2(mutex2_);
        
        std::cout << "Resource1: ";
        for (const auto& item : resource1_) {
            std::cout << item << " ";
        }
        std::cout << "\\nResource2: ";
        for (const auto& item : resource2_) {
            std::cout << item << " ";
        }
        std::cout << "\\n";
    }
};

void demonstrate_flexible_locking() {
    std::cout << "\\n=== Flexible Locking Patterns Demo ===\\n";
    
    ResourceManager manager;
    
    std::cout << "Initial state:\\n";
    manager.print_resources();
    
    std::vector<std::thread> threads;
    
    // Thread doing deferred locking
    threads.emplace_back([&manager]() {
        for (int i = 0; i < 3; ++i) {
            manager.swap_resources();
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
        }
    });
    
    // Thread doing try-lock operations
    threads.emplace_back([&manager]() {
        for (int i = 0; i < 5; ++i) {
            bool success = manager.try_quick_operation();
            if (!success) {
                std::this_thread::sleep_for(std::chrono::milliseconds(5));
            }
        }
    });
    
    // Thread doing timed operations
    threads.emplace_back([&manager]() {
        for (int i = 0; i < 4; ++i) {
            manager.timed_operation(std::chrono::milliseconds(20));
            std::this_thread::sleep_for(std::chrono::milliseconds(8));
        }
    });
    
    // Wait for all operations
    for (auto& thread : threads) {
        thread.join();
    }
    
    std::cout << "\\nFinal state:\\n";
    manager.print_resources();
}

// Manual lock management with unique_lock
class WorkerPool {
private:
    std::mutex mutex_;
    std::condition_variable cv_;
    std::queue<std::function<void()>> tasks_;
    std::vector<std::thread> workers_;
    bool stop_ = false;
    
public:
    explicit WorkerPool(size_t num_workers) {
        for (size_t i = 0; i < num_workers; ++i) {
            workers_.emplace_back([this, i] { 
                worker_thread(i); 
            });
        }
    }
    
    ~WorkerPool() {
        {
            std::unique_lock<std::mutex> lock(mutex_);
            stop_ = true;
        }
        cv_.notify_all();
        
        for (auto& worker : workers_) {
            worker.join();
        }
    }
    
    template<typename F>
    void enqueue(F&& task) {
        {
            std::unique_lock<std::mutex> lock(mutex_);
            if (stop_) {
                throw std::runtime_error("WorkerPool is stopped");
            }
            tasks_.emplace(std::forward<F>(task));
        }
        cv_.notify_one();
    }
    
private:
    void worker_thread(size_t worker_id) {
        while (true) {
            std::function<void()> task;
            
            {
                std::unique_lock<std::mutex> lock(mutex_);
                
                // Wait for task or stop signal
                cv_.wait(lock, [this] { 
                    return stop_ || !tasks_.empty(); 
                });
                
                if (stop_ && tasks_.empty()) {
                    break;
                }
                
                task = std::move(tasks_.front());
                tasks_.pop();
                
                std::cout << "Worker " << worker_id << " picked up task\\n";
            } // Lock released before executing task
            
            // Execute task without holding the lock
            task();
            
            std::cout << "Worker " << worker_id << " completed task\\n";
        }
        
        std::cout << "Worker " << worker_id << " shutting down\\n";
    }
};

void demonstrate_worker_pool() {
    std::cout << "\\n=== Worker Pool with unique_lock Demo ===\\n";
    
    WorkerPool pool(3);
    std::atomic<int> completed_tasks{0};
    
    // Enqueue various tasks
    for (int i = 0; i < 10; ++i) {
        pool.enqueue([i, &completed_tasks]() {
            std::cout << "Executing task " << i << "\\n";
            
            // Simulate work
            std::this_thread::sleep_for(
                std::chrono::milliseconds(50 + (i % 3) * 20)
            );
            
            completed_tasks.fetch_add(1);
        });
    }
    
    // Give some time for tasks to complete
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    
    std::cout << "Completed tasks: " << completed_tasks.load() << "\\n";
}

int main() {
    demonstrate_producer_consumer();
    demonstrate_flexible_locking();
    demonstrate_worker_pool();
    
    std::cout << "\\n=== All unique_lock demonstrations completed ===\\n";
    
    return 0;
}`,

    scope_guards: `// Scope Guards - Finally-like Constructs and Cleanup Automation
#include <iostream>
#include <functional>
#include <vector>
#include <fstream>
#include <memory>
#include <exception>
#include <chrono>
#include <thread>

// Generic scope guard implementation
template<typename F>
class ScopeGuard {
private:
    F cleanup_function_;
    bool active_ = true;
    
public:
    explicit ScopeGuard(F&& cleanup) 
        : cleanup_function_(std::forward<F>(cleanup)) {}
    
    ~ScopeGuard() {
        if (active_) {
            try {
                cleanup_function_();
            } catch (...) {
                // Scope guards must never throw from destructor
                std::terminate();
            }
        }
    }
    
    // Disable copy
    ScopeGuard(const ScopeGuard&) = delete;
    ScopeGuard& operator=(const ScopeGuard&) = delete;
    
    // Enable move
    ScopeGuard(ScopeGuard&& other) noexcept 
        : cleanup_function_(std::move(other.cleanup_function_))
        , active_(other.active_) {
        other.active_ = false;
    }
    
    ScopeGuard& operator=(ScopeGuard&& other) noexcept {
        if (this != &other) {
            cleanup_function_ = std::move(other.cleanup_function_);
            active_ = other.active_;
            other.active_ = false;
        }
        return *this;
    }
    
    void dismiss() {
        active_ = false;
    }
    
    void reset() {
        active_ = true;
    }
};

// Helper function to create scope guards
template<typename F>
auto make_scope_guard(F&& cleanup_function) {
    return ScopeGuard<std::decay_t<F>>(std::forward<F>(cleanup_function));
}

// Macro for convenient scope guard creation (like Golang defer)
#define SCOPE_EXIT(code) \\
    auto SCOPE_GUARD_VAR(__LINE__) = make_scope_guard([&]() { code; })

#define SCOPE_GUARD_VAR_IMPL(line) scope_guard_##line
#define SCOPE_GUARD_VAR(line) SCOPE_GUARD_VAR_IMPL(line)

void demonstrate_basic_scope_guards() {
    std::cout << "=== Basic Scope Guards Demo ===\\n";
    
    // File handling with automatic cleanup
    {
        std::cout << "Opening file...\\n";
        FILE* file = std::fopen("test_scope.txt", "w");
        
        if (file) {
            // Automatic file closure regardless of how we exit this scope
            auto file_guard = make_scope_guard([file]() {
                std::cout << "Closing file automatically\\n";
                std::fclose(file);
            });
            
            std::fprintf(file, "Hello Scope Guards!\\n");
            std::fprintf(file, "This file will be closed automatically\\n");
            
            // File is automatically closed when file_guard goes out of scope
        }
    }
    
    // Memory management example
    {
        std::cout << "\\nAllocating memory...\\n";
        int* raw_ptr = new int[100];
        
        SCOPE_EXIT(
            std::cout << "Freeing memory automatically\\n";
            delete[] raw_ptr;
        );
        
        // Use the memory
        for (int i = 0; i < 10; ++i) {
            raw_ptr[i] = i * i;
        }
        
        std::cout << "First 5 values: ";
        for (int i = 0; i < 5; ++i) {
            std::cout << raw_ptr[i] << " ";
        }
        std::cout << "\\n";
        
        // Memory automatically freed by scope guard
    }
}

// Complex resource management with multiple cleanup actions
class DatabaseConnection {
private:
    std::string connection_string_;
    bool connected_ = false;
    bool transaction_active_ = false;
    
public:
    explicit DatabaseConnection(const std::string& conn_str) 
        : connection_string_(conn_str) {}
    
    bool connect() {
        std::cout << "Connecting to database: " << connection_string_ << "\\n";
        connected_ = true;
        return true;
    }
    
    void disconnect() {
        if (connected_) {
            std::cout << "Disconnecting from database\\n";
            connected_ = false;
        }
    }
    
    bool begin_transaction() {
        if (connected_) {
            std::cout << "Beginning transaction\\n";
            transaction_active_ = true;
            return true;
        }
        return false;
    }
    
    void commit() {
        if (transaction_active_) {
            std::cout << "Committing transaction\\n";
            transaction_active_ = false;
        }
    }
    
    void rollback() {
        if (transaction_active_) {
            std::cout << "Rolling back transaction\\n";
            transaction_active_ = false;
        }
    }
    
    void execute_query(const std::string& query) {
        if (!connected_) {
            throw std::runtime_error("Not connected to database");
        }
        std::cout << "Executing query: " << query << "\\n";
    }
    
    bool is_connected() const { return connected_; }
    bool has_active_transaction() const { return transaction_active_; }
};

void demonstrate_database_scope_guards() {
    std::cout << "\\n=== Database Scope Guards Demo ===\\n";
    
    DatabaseConnection db("postgresql://localhost:5432/test");
    
    try {
        // Connection management
        if (db.connect()) {
            auto disconnect_guard = make_scope_guard([&db]() {
                db.disconnect();
            });
            
            // Transaction management with rollback safety
            if (db.begin_transaction()) {
                auto transaction_guard = make_scope_guard([&db]() {
                    if (db.has_active_transaction()) {
                        db.rollback(); // Automatic rollback on any exit
                    }
                });
                
                // Execute database operations
                db.execute_query("INSERT INTO users (name) VALUES ('Alice')");
                db.execute_query("INSERT INTO users (name) VALUES ('Bob')");
                db.execute_query("UPDATE users SET status = 'active'");
                
                // Simulate potential error condition
                std::random_device rd;
                if (rd() % 3 == 0) {
                    throw std::runtime_error("Simulated database error");
                }
                
                // If we reach here, commit the transaction
                db.commit();
                transaction_guard.dismiss(); // Don't rollback anymore
                
                std::cout << "Transaction committed successfully\\n";
            }
        }
        
    } catch (const std::exception& e) {
        std::cout << "Exception caught: " << e.what() << "\\n";
        std::cout << "All cleanup performed automatically\\n";
    }
}

// Stack-based cleanup for multiple related resources
class ResourceManager {
private:
    std::vector<std::function<void()>> cleanup_stack_;
    
public:
    template<typename F>
    void add_cleanup(F&& cleanup_func) {
        cleanup_stack_.emplace_back(std::forward<F>(cleanup_func));
    }
    
    ~ResourceManager() {
        // Execute cleanup in reverse order (LIFO)
        for (auto it = cleanup_stack_.rbegin(); it != cleanup_stack_.rend(); ++it) {
            try {
                (*it)();
            } catch (...) {
                // Continue with other cleanup actions even if one fails
                std::cout << "Warning: Cleanup action failed\\n";
            }
        }
    }
    
    void clear_cleanup() {
        cleanup_stack_.clear();
    }
};

void demonstrate_resource_manager() {
    std::cout << "\\n=== Resource Manager Demo ===\\n";
    
    ResourceManager manager;
    
    // Allocate various resources
    std::cout << "Allocating resources...\\n";
    
    // Resource 1: Memory
    int* memory = new int[50];
    manager.add_cleanup([memory]() {
        std::cout << "Cleaning up memory\\n";
        delete[] memory;
    });
    
    // Resource 2: File
    std::ofstream file("resource_test.txt");
    manager.add_cleanup([&file]() {
        if (file.is_open()) {
            std::cout << "Closing file\\n";
            file.close();
        }
    });
    
    // Resource 3: Temporary directory simulation
    std::string temp_dir = "/tmp/scope_guard_test";
    manager.add_cleanup([temp_dir]() {
        std::cout << "Removing temporary directory: " << temp_dir << "\\n";
    });
    
    // Use resources
    for (int i = 0; i < 10; ++i) {
        memory[i] = i * 2;
    }
    
    file << "Resource management test\\n";
    file << "All resources will be cleaned up automatically\\n";
    
    std::cout << "Resources in use...\\n";
    
    // Simulate some work
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    std::cout << "Exiting scope, cleanup will happen automatically\\n";
    
    // All cleanup happens automatically when manager is destroyed
}

// Exception-safe operations with scope guards
void demonstrate_exception_safety() {
    std::cout << "\\n=== Exception Safety Demo ===\\n";
    
    std::vector<int*> allocated_pointers;
    
    auto cleanup_allocations = make_scope_guard([&allocated_pointers]() {
        std::cout << "Cleaning up all allocations due to exception\\n";
        for (auto* ptr : allocated_pointers) {
            delete ptr;
        }
        allocated_pointers.clear();
    });
    
    try {
        // Allocate several resources
        for (int i = 0; i < 5; ++i) {
            int* ptr = new int(i * 10);
            allocated_pointers.push_back(ptr);
            std::cout << "Allocated pointer " << i << " with value " << *ptr << "\\n";
            
            // Simulate potential failure
            if (i == 3) {
                throw std::runtime_error("Allocation failed at step 3");
            }
        }
        
        // If we get here, everything succeeded
        std::cout << "All allocations successful\\n";
        cleanup_allocations.dismiss(); // Don't clean up on success
        
        // Manual cleanup for success case
        for (auto* ptr : allocated_pointers) {
            delete ptr;
        }
        
    } catch (const std::exception& e) {
        std::cout << "Exception: " << e.what() << "\\n";
        // cleanup_allocations will automatically clean up
    }
}

// Conditional scope guard
template<typename F>
class ConditionalScopeGuard {
private:
    F cleanup_function_;
    std::function<bool()> condition_;
    bool active_ = true;
    
public:
    ConditionalScopeGuard(F&& cleanup, std::function<bool()> cond)
        : cleanup_function_(std::forward<F>(cleanup))
        , condition_(std::move(cond)) {}
    
    ~ConditionalScopeGuard() {
        if (active_ && condition_()) {
            try {
                cleanup_function_();
            } catch (...) {
                std::terminate();
            }
        }
    }
    
    void dismiss() { active_ = false; }
};

template<typename F>
auto make_conditional_scope_guard(F&& cleanup, std::function<bool()> condition) {
    return ConditionalScopeGuard<std::decay_t<F>>(
        std::forward<F>(cleanup), std::move(condition)
    );
}

void demonstrate_conditional_scope_guard() {
    std::cout << "\\n=== Conditional Scope Guard Demo ===\\n";
    
    bool error_occurred = false;
    std::string temp_data = "temporary_data.txt";
    
    // Create temporary file
    {
        std::ofstream temp_file(temp_data);
        temp_file << "This is temporary data\\n";
    }
    
    // Conditional cleanup - only remove file if error occurs
    auto conditional_cleanup = make_conditional_scope_guard(
        [&temp_data]() {
            std::cout << "Error occurred, removing temporary file\\n";
            std::remove(temp_data.c_str());
        },
        [&error_occurred]() { return error_occurred; }
    );
    
    try {
        std::cout << "Processing temporary file...\\n";
        
        // Simulate processing that might fail
        std::random_device rd;
        if (rd() % 2 == 0) {
            error_occurred = true;
            throw std::runtime_error("Processing failed");
        }
        
        std::cout << "Processing completed successfully\\n";
        std::cout << "Temporary file will be preserved\\n";
        
    } catch (const std::exception& e) {
        std::cout << "Exception: " << e.what() << "\\n";
        // conditional_cleanup will remove the file because error_occurred is true
    }
}

int main() {
    demonstrate_basic_scope_guards();
    demonstrate_database_scope_guards();
    demonstrate_resource_manager();
    demonstrate_exception_safety();
    demonstrate_conditional_scope_guard();
    
    std::cout << "\\n=== All scope guard demonstrations completed ===\\n";
    
    return 0;
}`,

    transaction_guards: `// Transaction Guards - Database Commit/Rollback and State Management
#include <iostream>
#include <functional>
#include <vector>
#include <string>
#include <map>
#include <memory>
#include <exception>
#include <atomic>
#include <mutex>
#include <thread>
#include <chrono>

// Database transaction simulator
class DatabaseTransaction {
private:
    std::string transaction_id_;
    std::vector<std::string> operations_;
    bool is_active_ = true;
    bool is_committed_ = false;
    mutable std::mutex mutex_;
    
public:
    explicit DatabaseTransaction(const std::string& id) 
        : transaction_id_(id) {
        std::cout << "[TX:" << transaction_id_ << "] Transaction started\\n";
    }
    
    ~DatabaseTransaction() {
        std::lock_guard<std::mutex> lock(mutex_);
        if (is_active_ && !is_committed_) {
            std::cout << "[TX:" << transaction_id_ << "] Auto-rollback in destructor\\n";
            rollback_impl();
        }
    }
    
    void add_operation(const std::string& operation) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (!is_active_) {
            throw std::runtime_error("Transaction is no longer active");
        }
        operations_.push_back(operation);
        std::cout << "[TX:" << transaction_id_ << "] Operation: " << operation << "\\n";
    }
    
    void commit() {
        std::lock_guard<std::mutex> lock(mutex_);
        if (!is_active_) {
            throw std::runtime_error("Transaction is no longer active");
        }
        
        std::cout << "[TX:" << transaction_id_ << "] Committing " 
                  << operations_.size() << " operations\\n";
        
        // Simulate commit work
        for (const auto& op : operations_) {
            std::cout << "[TX:" << transaction_id_ << "] Committing: " << op << "\\n";
        }
        
        is_committed_ = true;
        is_active_ = false;
        std::cout << "[TX:" << transaction_id_ << "] Transaction committed successfully\\n";
    }
    
    void rollback() {
        std::lock_guard<std::mutex> lock(mutex_);
        if (!is_active_) {
            return; // Already rolled back or committed
        }
        rollback_impl();
    }
    
private:
    void rollback_impl() {
        std::cout << "[TX:" << transaction_id_ << "] Rolling back " 
                  << operations_.size() << " operations\\n";
        
        // Rollback in reverse order
        for (auto it = operations_.rbegin(); it != operations_.rend(); ++it) {
            std::cout << "[TX:" << transaction_id_ << "] Rolling back: " << *it << "\\n";
        }
        
        operations_.clear();
        is_active_ = false;
        std::cout << "[TX:" << transaction_id_ << "] Transaction rolled back\\n";
    }
    
public:
    bool is_active() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return is_active_;
    }
    
    bool is_committed() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return is_committed_;
    }
    
    const std::string& id() const { return transaction_id_; }
};

// Transaction guard that ensures proper cleanup
class TransactionGuard {
private:
    std::unique_ptr<DatabaseTransaction> transaction_;
    bool commit_on_success_ = true;
    
public:
    explicit TransactionGuard(const std::string& transaction_id)
        : transaction_(std::make_unique<DatabaseTransaction>(transaction_id)) {}
    
    ~TransactionGuard() {
        if (transaction_ && transaction_->is_active()) {
            if (commit_on_success_ && !std::uncaught_exceptions()) {
                try {
                    transaction_->commit();
                } catch (const std::exception& e) {
                    std::cout << "Failed to commit in destructor: " << e.what() << "\\n";
                    transaction_->rollback();
                }
            } else {
                std::cout << "Rolling back due to exception or explicit request\\n";
                transaction_->rollback();
            }
        }
    }
    
    // Disable copy, enable move
    TransactionGuard(const TransactionGuard&) = delete;
    TransactionGuard& operator=(const TransactionGuard&) = delete;
    TransactionGuard(TransactionGuard&&) = default;
    TransactionGuard& operator=(TransactionGuard&&) = default;
    
    DatabaseTransaction& get() {
        if (!transaction_) {
            throw std::runtime_error("Transaction is null");
        }
        return *transaction_;
    }
    
    void set_rollback_on_destroy() {
        commit_on_success_ = false;
    }
    
    void commit_explicitly() {
        if (transaction_) {
            transaction_->commit();
        }
    }
};

void demonstrate_basic_transaction_guard() {
    std::cout << "=== Basic Transaction Guard Demo ===\\n";
    
    // Successful transaction
    {
        std::cout << "\\n--- Successful Transaction ---\\n";
        TransactionGuard tx_guard("TX001");
        auto& tx = tx_guard.get();
        
        tx.add_operation("INSERT INTO users VALUES ('Alice', 25)");
        tx.add_operation("INSERT INTO users VALUES ('Bob', 30)");
        tx.add_operation("UPDATE user_count SET count = count + 2");
        
        // Transaction automatically commits on successful scope exit
    }
    
    // Transaction with exception
    {
        std::cout << "\\n--- Transaction with Exception ---\\n";
        try {
            TransactionGuard tx_guard("TX002");
            auto& tx = tx_guard.get();
            
            tx.add_operation("INSERT INTO products VALUES ('Widget', 19.99)");
            tx.add_operation("UPDATE inventory SET quantity = quantity - 1");
            
            // Simulate error
            throw std::runtime_error("Payment processing failed");
            
            tx.add_operation("INSERT INTO sales VALUES (...)"); // Never reached
            
        } catch (const std::exception& e) {
            std::cout << "Caught exception: " << e.what() << "\\n";
            // Transaction automatically rolls back due to exception
        }
    }
    
    // Explicit rollback
    {
        std::cout << "\\n--- Explicit Rollback ---\\n";
        TransactionGuard tx_guard("TX003");
        auto& tx = tx_guard.get();
        
        tx.add_operation("DELETE FROM temp_data WHERE id < 100");
        tx.add_operation("UPDATE stats SET last_cleanup = NOW()");
        
        // Decide to rollback based on business logic
        tx_guard.set_rollback_on_destroy();
        
        // Transaction will rollback even though no exception occurred
    }
}

// Multi-phase transaction with savepoints simulation
class SavepointManager {
private:
    DatabaseTransaction& transaction_;
    std::vector<std::pair<std::string, size_t>> savepoints_;
    
public:
    explicit SavepointManager(DatabaseTransaction& tx) : transaction_(tx) {}
    
    void create_savepoint(const std::string& name) {
        size_t operation_count = 0; // In real impl, would track actual operations
        savepoints_.emplace_back(name, operation_count);
        transaction_.add_operation("SAVEPOINT " + name);
        std::cout << "Created savepoint: " << name << "\\n";
    }
    
    void rollback_to_savepoint(const std::string& name) {
        auto it = std::find_if(savepoints_.begin(), savepoints_.end(),
                              [&name](const auto& sp) { return sp.first == name; });
        
        if (it != savepoints_.end()) {
            transaction_.add_operation("ROLLBACK TO SAVEPOINT " + name);
            std::cout << "Rolled back to savepoint: " << name << "\\n";
            
            // Remove subsequent savepoints
            savepoints_.erase(it + 1, savepoints_.end());
        }
    }
    
    void release_savepoint(const std::string& name) {
        transaction_.add_operation("RELEASE SAVEPOINT " + name);
        std::cout << "Released savepoint: " << name << "\\n";
    }
};

void demonstrate_savepoint_transactions() {
    std::cout << "\\n=== Savepoint Transaction Demo ===\\n";
    
    TransactionGuard tx_guard("TX004_SAVEPOINTS");
    auto& tx = tx_guard.get();
    SavepointManager savepoints(tx);
    
    try {
        tx.add_operation("INSERT INTO orders VALUES (1001, 'Customer A')");
        savepoints.create_savepoint("after_order");
        
        tx.add_operation("INSERT INTO order_items VALUES (1001, 'Item1', 2)");
        tx.add_operation("INSERT INTO order_items VALUES (1001, 'Item2', 1)");
        savepoints.create_savepoint("after_items");
        
        tx.add_operation("UPDATE inventory SET quantity = quantity - 2 WHERE item = 'Item1'");
        tx.add_operation("UPDATE inventory SET quantity = quantity - 1 WHERE item = 'Item2'");
        savepoints.create_savepoint("after_inventory");
        
        // Simulate inventory check failure
        std::cout << "\\nSimulating inventory shortage...\\n";
        savepoints.rollback_to_savepoint("after_items");
        
        // Continue with corrected operations
        tx.add_operation("UPDATE inventory SET quantity = quantity - 1 WHERE item = 'Item1'");
        tx.add_operation("INSERT INTO backorder VALUES (1001, 'Item1', 1)");
        
        savepoints.release_savepoint("after_order");
        
        std::cout << "Transaction will commit successfully\\n";
        
    } catch (const std::exception& e) {
        std::cout << "Transaction failed: " << e.what() << "\\n";
    }
}

// Distributed transaction coordinator simulation
class DistributedTransactionCoordinator {
private:
    std::map<std::string, std::unique_ptr<TransactionGuard>> transactions_;
    std::string coordinator_id_;
    std::atomic<int> transaction_counter_{1};
    
public:
    explicit DistributedTransactionCoordinator(const std::string& id)
        : coordinator_id_(id) {}
    
    std::string begin_distributed_transaction() {
        std::string tx_id = coordinator_id_ + "_DTX_" + 
                           std::to_string(transaction_counter_.fetch_add(1));
        
        // Create local transaction
        auto local_tx = std::make_unique<TransactionGuard>(tx_id + "_LOCAL");
        
        // Simulate remote transaction creation
        auto remote_tx1 = std::make_unique<TransactionGuard>(tx_id + "_REMOTE1");
        auto remote_tx2 = std::make_unique<TransactionGuard>(tx_id + "_REMOTE2");
        
        transactions_[tx_id + "_LOCAL"] = std::move(local_tx);
        transactions_[tx_id + "_REMOTE1"] = std::move(remote_tx1);
        transactions_[tx_id + "_REMOTE2"] = std::move(remote_tx2);
        
        std::cout << "Started distributed transaction: " << tx_id << "\\n";
        return tx_id;
    }
    
    void add_operation_to_all(const std::string& tx_id, const std::string& operation) {
        for (auto& [key, tx_guard] : transactions_) {
            if (key.find(tx_id) != std::string::npos) {
                tx_guard->get().add_operation(operation);
            }
        }
    }
    
    bool prepare_phase(const std::string& tx_id) {
        std::cout << "\\nStarting prepare phase for " << tx_id << "\\n";
        
        // Simulate prepare phase - all participants must agree
        for (auto& [key, tx_guard] : transactions_) {
            if (key.find(tx_id) != std::string::npos) {
                std::cout << "Preparing: " << key << "\\n";
                
                // Simulate random prepare failure
                if (std::rand() % 10 == 0) {
                    std::cout << "Prepare failed for: " << key << "\\n";
                    return false;
                }
            }
        }
        
        std::cout << "All participants prepared successfully\\n";
        return true;
    }
    
    void commit_phase(const std::string& tx_id) {
        std::cout << "\\nStarting commit phase for " << tx_id << "\\n";
        
        for (auto& [key, tx_guard] : transactions_) {
            if (key.find(tx_id) != std::string::npos) {
                try {
                    tx_guard->commit_explicitly();
                } catch (const std::exception& e) {
                    std::cout << "Commit failed for " << key << ": " << e.what() << "\\n";
                }
            }
        }
        
        // Remove completed transactions
        auto it = transactions_.begin();
        while (it != transactions_.end()) {
            if (it->first.find(tx_id) != std::string::npos) {
                it = transactions_.erase(it);
            } else {
                ++it;
            }
        }
    }
    
    void abort_phase(const std::string& tx_id) {
        std::cout << "\\nAborting distributed transaction " << tx_id << "\\n";
        
        for (auto& [key, tx_guard] : transactions_) {
            if (key.find(tx_id) != std::string::npos) {
                tx_guard->set_rollback_on_destroy();
            }
        }
        
        // Remove aborted transactions
        auto it = transactions_.begin();
        while (it != transactions_.end()) {
            if (it->first.find(tx_id) != std::string::npos) {
                it = transactions_.erase(it);
            } else {
                ++it;
            }
        }
    }
};

void demonstrate_distributed_transactions() {
    std::cout << "\\n=== Distributed Transaction Demo ===\\n";
    
    DistributedTransactionCoordinator coordinator("COORD1");
    
    // Successful distributed transaction
    {
        std::cout << "\\n--- Successful Distributed Transaction ---\\n";
        std::string tx_id = coordinator.begin_distributed_transaction();
        
        coordinator.add_operation_to_all(tx_id, "UPDATE account SET balance = balance - 100 WHERE id = 'A'");
        coordinator.add_operation_to_all(tx_id, "UPDATE account SET balance = balance + 100 WHERE id = 'B'");
        coordinator.add_operation_to_all(tx_id, "INSERT INTO audit_log VALUES (...)");
        
        if (coordinator.prepare_phase(tx_id)) {
            coordinator.commit_phase(tx_id);
        } else {
            coordinator.abort_phase(tx_id);
        }
    }
    
    // Failed distributed transaction
    {
        std::cout << "\\n--- Failed Distributed Transaction ---\\n";
        std::string tx_id = coordinator.begin_distributed_transaction();
        
        coordinator.add_operation_to_all(tx_id, "DELETE FROM temp_records WHERE processed = true");
        coordinator.add_operation_to_all(tx_id, "UPDATE statistics SET last_cleanup = NOW()");
        
        // This might fail in prepare phase
        if (coordinator.prepare_phase(tx_id)) {
            coordinator.commit_phase(tx_id);
        } else {
            coordinator.abort_phase(tx_id);
        }
    }
}

// Application-level transaction for business operations
class BusinessTransactionGuard {
private:
    std::vector<std::function<void()>> rollback_actions_;
    std::vector<std::function<void()>> commit_actions_;
    bool committed_ = false;
    std::string operation_name_;
    
public:
    explicit BusinessTransactionGuard(const std::string& name) 
        : operation_name_(name) {
        std::cout << "Starting business operation: " << operation_name_ << "\\n";
    }
    
    ~BusinessTransactionGuard() {
        if (!committed_) {
            std::cout << "Rolling back business operation: " << operation_name_ << "\\n";
            
            // Execute rollback actions in reverse order
            for (auto it = rollback_actions_.rbegin(); it != rollback_actions_.rend(); ++it) {
                try {
                    (*it)();
                } catch (const std::exception& e) {
                    std::cout << "Rollback action failed: " << e.what() << "\\n";
                }
            }
        }
    }
    
    template<typename RollbackF, typename CommitF>
    void add_action(RollbackF&& rollback_action, CommitF&& commit_action) {
        rollback_actions_.emplace_back(std::forward<RollbackF>(rollback_action));
        commit_actions_.emplace_back(std::forward<CommitF>(commit_action));
    }
    
    void commit() {
        std::cout << "Committing business operation: " << operation_name_ << "\\n";
        
        for (auto& commit_action : commit_actions_) {
            commit_action();
        }
        
        committed_ = true;
    }
};

void demonstrate_business_transactions() {
    std::cout << "\\n=== Business Transaction Demo ===\\n";
    
    // Simulate e-commerce order processing
    {
        std::cout << "\\n--- Order Processing ---\\n";
        BusinessTransactionGuard order_tx("ProcessOrder_12345");
        
        // Reserve inventory
        std::cout << "Reserving inventory...\\n";
        order_tx.add_action(
            []() { std::cout << "Releasing inventory reservation\\n"; },
            []() { std::cout << "Confirming inventory reservation\\n"; }
        );
        
        // Process payment
        std::cout << "Processing payment...\\n";
        order_tx.add_action(
            []() { std::cout << "Reversing payment charge\\n"; },
            []() { std::cout << "Finalizing payment charge\\n"; }
        );
        
        // Send confirmation email
        std::cout << "Preparing confirmation email...\\n";
        order_tx.add_action(
            []() { std::cout << "Canceling email notification\\n"; },
            []() { std::cout << "Sending confirmation email\\n"; }
        );
        
        // Check if all steps succeeded
        bool payment_successful = true; // Simulate success/failure
        
        if (payment_successful) {
            order_tx.commit();
            std::cout << "Order processed successfully\\n";
        } else {
            std::cout << "Order processing failed, will rollback\\n";
            // Automatic rollback on destruction
        }
    }
}

int main() {
    demonstrate_basic_transaction_guard();
    demonstrate_savepoint_transactions();
    demonstrate_distributed_transactions();
    demonstrate_business_transactions();
    
    std::cout << "\\n=== All transaction guard demonstrations completed ===\\n";
    
    return 0;
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 76: Resource Guards" : "Lección 76: Resource Guards"}
      lessonId="lesson-76"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'RAII Patterns and Exception-Safe Resource Management' : 'Patrones RAII y Gestión de Recursos Exception-Safe'}
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
                  'Master std::lock_guard, std::unique_lock, and std::shared_lock for thread-safe resource access',
                  'Implement custom scope guards and finally-like constructs for automatic cleanup',
                  'Design transaction guards with commit/rollback semantics for database operations',
                  'Apply exception-safe programming patterns with guaranteed resource cleanup',
                  'Build deadlock-free multi-resource locking patterns using std::scoped_lock',
                  'Create conditional guards and resource-specific cleanup strategies',
                  'Understand performance trade-offs of different guard implementations',
                  'Integrate guards with async/await patterns and real-time systems',
                  'Implement priority inheritance and lock-free alternatives where appropriate',
                  'Build production-ready guard systems for complex resource management scenarios'
                ]
              : [
                  'Dominar std::lock_guard, std::unique_lock y std::shared_lock para acceso thread-safe a recursos',
                  'Implementar scope guards personalizados y constructos tipo finally para cleanup automático',
                  'Diseñar transaction guards con semántica commit/rollback para operaciones de base de datos',
                  'Aplicar patrones de programación exception-safe con cleanup garantizado de recursos',
                  'Construir patrones de locking multi-recurso sin deadlock usando std::scoped_lock',
                  'Crear guards condicionales y estrategias de cleanup específicas de recursos',
                  'Entender trade-offs de rendimiento de diferentes implementaciones de guards',
                  'Integrar guards con patrones async/await y sistemas de tiempo real',
                  'Implementar herencia de prioridad y alternativas lock-free cuando sea apropiado',
                  'Construir sistemas de guards production-ready para escenarios complejos de gestión de recursos'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive Resource Guards Demonstration' : 'Demostración Interactiva de Resource Guards'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <ResourceGuardsVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('lock_guards')}
            variant={state.scenario === 'lock_guards' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Lock Guards' : 'Lock Guards'}
          </Button>
          <Button 
            onClick={() => runScenario('unique_lock')}
            variant={state.scenario === 'unique_lock' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Unique Lock' : 'Unique Lock'}
          </Button>
          <Button 
            onClick={() => runScenario('scope_guards')}
            variant={state.scenario === 'scope_guards' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Scope Guards' : 'Scope Guards'}
          </Button>
          <Button 
            onClick={() => runScenario('transaction_guards')}
            variant={state.scenario === 'transaction_guards' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Transaction Guards' : 'Transaction Guards'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Locks Acquired' : 'Locks Adquiridos', 
              value: state.locksAcquired,
              color: '#00ff80'
            },
            { 
              label: state.language === 'en' ? 'Resources Guarded' : 'Recursos Protegidos', 
              value: state.resourcesGuarded,
              color: '#8000ff'
            },
            { 
              label: state.language === 'en' ? 'Rollbacks Executed' : 'Rollbacks Ejecutados', 
              value: state.rollbacksExecuted,
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Exceptions Handled' : 'Excepciones Manejadas', 
              value: state.exceptionsHandled,
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Performance %' : 'Rendimiento %', 
              value: Math.round(state.performanceBenefit),
              color: '#ff2080'
            },
            { 
              label: state.language === 'en' ? 'Deadlocks Avoided' : 'Deadlocks Evitados', 
              value: state.deadlocksAvoided,
              color: '#20ff80'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'lock_guards' && (state.language === 'en' ? 'Lock Guards - std::lock_guard & std::scoped_lock' : 'Lock Guards - std::lock_guard y std::scoped_lock')}
          {state.scenario === 'unique_lock' && (state.language === 'en' ? 'Flexible Locking with std::unique_lock' : 'Locking Flexible con std::unique_lock')}
          {state.scenario === 'scope_guards' && (state.language === 'en' ? 'Scope Guards - Finally-like Constructs' : 'Scope Guards - Constructos tipo Finally')}
          {state.scenario === 'transaction_guards' && (state.language === 'en' ? 'Transaction Guards - Commit/Rollback Patterns' : 'Transaction Guards - Patrones Commit/Rollback')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'lock_guards' ? 
              (state.language === 'en' ? 'Lock Guard Implementations' : 'Implementaciones de Lock Guard') :
            state.scenario === 'unique_lock' ? 
              (state.language === 'en' ? 'Unique Lock Patterns' : 'Patrones de Unique Lock') :
            state.scenario === 'scope_guards' ? 
              (state.language === 'en' ? 'Scope Guard Systems' : 'Sistemas de Scope Guard') :
            (state.language === 'en' ? 'Transaction Guard Framework' : 'Framework de Transaction Guard')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Resource Guard Design Patterns' : 'Patrones de Diseño de Resource Guards'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #333'
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🛡️ Core Guard Types:' : '🛡️ Tipos Principales de Guards:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Lock Guards:' : 'Lock Guards:'}</strong>{' '}
              {state.language === 'en' 
                ? 'RAII-based mutex management with automatic lock/unlock semantics'
                : 'Gestión de mutex basada en RAII con semántica automática de lock/unlock'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Scope Guards:' : 'Scope Guards:'}</strong>{' '}
              {state.language === 'en' 
                ? 'General-purpose cleanup automation for any resource type'
                : 'Automatización de cleanup de propósito general para cualquier tipo de recurso'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Transaction Guards:' : 'Transaction Guards:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Commit/rollback semantics for atomic operations and state consistency'
                : 'Semántica commit/rollback para operaciones atómicas y consistencia de estado'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Conditional Guards:' : 'Guards Condicionales:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Runtime-configurable cleanup based on execution context'
                : 'Cleanup configurable en runtime basado en contexto de ejecución'
              }
            </li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: '#2e1a1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #800'
        }}>
          <h4 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
            {state.language === 'en' ? '⚠️ Critical Safety Considerations:' : '⚠️ Consideraciones Críticas de Seguridad:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Exception Safety:' : 'Seguridad de Excepciones:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Guards must never throw from destructors; use std::terminate() for critical failures'
                : 'Los guards nunca deben lanzar desde destructores; usar std::terminate() para fallos críticos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Deadlock Prevention:' : 'Prevención de Deadlock:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Use std::scoped_lock for multiple mutexes; avoid nested lock acquisition'
                : 'Usar std::scoped_lock para múltiples mutex; evitar adquisición anidada de locks'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Resource Ordering:' : 'Orden de Recursos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Ensure proper cleanup order for interdependent resources'
                : 'Asegurar orden apropiado de cleanup para recursos interdependientes'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Lifetime Management:' : 'Gestión de Tiempo de Vida:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Guard lifetime must encompass all resource usage; beware of dangling references'
                : 'El tiempo de vida del guard debe abarcar todo el uso del recurso; cuidado con referencias colgantes'
              }
            </li>
          </ul>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Advanced Guard Patterns' : 'Patrones Avanzados de Guards'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a2e1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #080'
        }}>
          <h4 style={{ color: '#88ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🚀 Production Strategies:' : '🚀 Estrategias de Producción:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Distributed Transactions:' : 'Transacciones Distribuidas:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Two-phase commit protocols with automatic rollback on participant failure'
                : 'Protocolos de commit en dos fases con rollback automático en fallo de participante'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Timeout-based Guards:' : 'Guards basados en Timeout:'}</strong>{' '}
              {state.language === 'en' 
                ? 'std::unique_lock with try_lock_for() and try_lock_until() for non-blocking patterns'
                : 'std::unique_lock con try_lock_for() y try_lock_until() para patrones non-blocking'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Hierarchical Locking:' : 'Locking Jerárquico:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Priority-based resource acquisition to prevent priority inversion'
                : 'Adquisición de recursos basada en prioridad para prevenir inversión de prioridad'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Async Integration:' : 'Integración Async:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Coroutine-aware guards with co_await integration and async cleanup'
                : 'Guards conscientes de corrutinas con integración co_await y cleanup async'
              }
            </li>
          </ul>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Performance and Debugging' : 'Rendimiento y Debugging'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#2e2e1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid '#880'
        }}>
          <h4 style={{ color: '#ffff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '📊 Optimization Techniques:' : '📊 Técnicas de Optimización:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Lock Contention Analysis:' : 'Análisis de Contención de Locks:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Use std::shared_mutex for reader-writer scenarios; profile critical sections'
                : 'Usar std::shared_mutex para escenarios reader-writer; perfilar secciones críticas'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Guard Overhead:' : 'Overhead de Guards:'}</strong>{' '}
              {state.language === 'en' 
                ? 'std::lock_guard has minimal overhead; std::unique_lock trades flexibility for cost'
                : 'std::lock_guard tiene overhead mínimo; std::unique_lock intercambia flexibilidad por costo'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Lock-Free Alternatives:' : 'Alternativas Lock-Free:'}</strong>{' '}
              {state.language === 'en' 
                ? 'std::atomic operations and memory ordering for high-performance scenarios'
                : 'Operaciones std::atomic y ordering de memoria para escenarios de alto rendimiento'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Debug Instrumentation:' : 'Instrumentación de Debug:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Custom guards with logging, deadlock detection, and resource leak tracking'
                : 'Guards personalizados con logging, detección de deadlock y tracking de leaks de recursos'
              }
            </li>
          </ul>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Practice Exercises' : 'Ejercicios Prácticos'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#2e1a2e', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid '#808'
        }}>
          <h4 style={{ color: '#ff88ff', marginBottom: '1rem' }}>
            {state.language === 'en' ? '💪 Implementation Challenges:' : '💪 Desafíos de Implementación:'}
          </h4>
          <ol style={{ color: '#e0e0e0', lineHeight: '1.8' }}>
            <li>
              <strong>{state.language === 'en' ? 'Banking System:' : 'Sistema Bancario:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Implement atomic money transfers with deadlock-free multi-account locking'
                : 'Implementar transferencias de dinero atómicas con locking multi-cuenta sin deadlock'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Resource Pool Manager:' : 'Gestor de Pool de Recursos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Build thread-safe resource pools with timeout-based acquisition and cleanup'
                : 'Construir pools de recursos thread-safe con adquisición basada en timeout y cleanup'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Database ORM:' : 'ORM de Base de Datos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Create transaction guards with savepoints, nested transactions, and rollback'
                : 'Crear transaction guards con savepoints, transacciones anidadas y rollback'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Game Engine Resources:' : 'Recursos de Motor de Juego:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Design guards for GPU resources, audio contexts, and render state management'
                : 'Diseñar guards para recursos GPU, contextos de audio y gestión de estado de render'
              }
            </li>
          </ol>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default Lesson76_ResourceGuards;