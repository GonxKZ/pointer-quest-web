import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LessonLayout, Section, SectionTitle, InteractiveSection,
  LearningObjectives, Button, CodeBlock, PerformanceMonitor,
  AccessibilityAnnouncer, theme, type LessonProgress 
} from '../design-system';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import * as THREE from 'three';

interface ObjectLifetimeState {
  demonstrationType: 'trivial_relocation' | 'const_objects' | 'virtual_inheritance' | 'launder_cases';
  currentScenario: number;
  objectStates: {
    id: number;
    type: string;
    state: 'uninitialized' | 'constructed' | 'moved_from' | 'destroyed' | 'invalid';
    memoryAddress: number;
    lifetime: {
      birth: number;
      death: number | null;
      valid: boolean;
    };
    pointerValidity: boolean;
  }[];
  memoryOperations: {
    operation: string;
    timestamp: number;
    address: number;
    valid: boolean;
    needsLaunder: boolean;
  }[];
  trivialRelocatable: boolean;
  constObjectModification: boolean;
  virtualInheritanceComplexity: number;
}

const ObjectLifetimeVisualization: React.FC<{ state: ObjectLifetimeState }> = ({ state }) => {
  const getStateColor = (objectState: string) => {
    switch (objectState) {
      case 'uninitialized': return '#57606f';
      case 'constructed': return '#2ed573';
      case 'moved_from': return '#ffa500';
      case 'destroyed': return '#e74c3c';
      case 'invalid': return '#ff4757';
      default: return '#57606f';
    }
  };

  const scenarios = [
    {
      title: 'Trivially Relocatable Objects',
      description: 'Objects that can be safely moved with memcpy',
      focus: 'relocation'
    },
    {
      title: 'Const Object Lifetime',
      description: 'Lifetime rules for const and immutable objects',
      focus: 'const_rules'
    },
    {
      title: 'Virtual Inheritance Complexity',
      description: 'Object lifetime in virtual inheritance hierarchies',
      focus: 'virtual_inheritance'
    },
    {
      title: 'std::launder Use Cases',
      description: 'When pointer laundering is required for validity',
      focus: 'launder_required'
    }
  ];

  const currentScenario = scenarios[state.currentScenario] || scenarios[0];

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Title */}
      <Text position={[0, 4.5, 0]} fontSize={0.25} color="#00d4ff" anchorX="center">
        {currentScenario.title}
      </Text>
      
      <Text position={[0, 4, 0]} fontSize={0.12} color="#ffa500" anchorX="center">
        {currentScenario.description}
      </Text>

      {/* Object Lifetime Visualization */}
      <group position={[0, 2.5, 0]}>
        <Text position={[0, 0.8, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
          Object States
        </Text>
        
        {state.objectStates.slice(0, 6).map((obj, index) => (
          <group key={obj.id} position={[index * 2.5 - 6.25, 0, 0]}>
            {/* Object representation */}
            <Box args={[2, 1.5, 0.4]}>
              <meshStandardMaterial 
                color={getStateColor(obj.state)}
                transparent 
                opacity={0.8} 
              />
            </Box>
            
            {/* Object ID and type */}
            <Text position={[0, 0.2, 0.3]} fontSize={0.08} color="white" anchorX="center">
              {obj.type}
            </Text>
            
            <Text position={[0, 0, 0.3]} fontSize={0.06} color="white" anchorX="center">
              ID: {obj.id}
            </Text>
            
            <Text position={[0, -0.2, 0.3]} fontSize={0.05} color="white" anchorX="center">
              {obj.state}
            </Text>
            
            {/* Memory address */}
            <Text position={[0, -0.8, 0]} fontSize={0.05} color="#888" anchorX="center">
              0x{obj.memoryAddress.toString(16)}
            </Text>
            
            {/* Lifetime validity indicator */}
            <Text position={[0, 0.9, 0]} fontSize={0.06} 
                  color={obj.lifetime.valid ? '#2ed573' : '#ff4757'} 
                  anchorX="center">
              {obj.lifetime.valid ? '✓ Valid' : '✗ Invalid'}
            </Text>
            
            {/* Pointer validity */}
            <Text position={[0, -1, 0]} fontSize={0.05} 
                  color={obj.pointerValidity ? '#2ed573' : '#ff4757'} 
                  anchorX="center">
              Ptr: {obj.pointerValidity ? 'Valid' : 'Dangling'}
            </Text>
          </group>
        ))}
      </group>

      {/* Memory Operations Timeline */}
      <group position={[0, 0.5, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
          Memory Operations
        </Text>
        
        {state.memoryOperations.slice(-4).map((op, index) => (
          <group key={index} position={[index * 3 - 4.5, 0, 0]}>
            <Box args={[2.5, 0.8, 0.3]}>
              <meshStandardMaterial 
                color={op.valid ? (op.needsLaunder ? '#ffa500' : '#2ed573') : '#ff4757'}
                transparent 
                opacity={0.7} 
              />
            </Box>
            
            <Text position={[0, 0.1, 0.2]} fontSize={0.06} color="white" anchorX="center">
              {op.operation}
            </Text>
            
            <Text position={[0, -0.1, 0.2]} fontSize={0.05} color="white" anchorX="center">
              0x{op.address.toString(16)}
            </Text>
            
            <Text position={[0, -0.5, 0]} fontSize={0.04} color="#888" anchorX="center">
              t={op.timestamp}
            </Text>
            
            {op.needsLaunder && (
              <Text position={[0, 0.6, 0]} fontSize={0.05} color="#ffa500" anchorX="center">
                Needs launder
              </Text>
            )}
          </group>
        ))}
      </group>

      {/* Scenario-specific information */}
      {state.demonstrationType === 'trivial_relocation' && (
        <group position={[0, -1.5, 0]}>
          <Text position={[0, 0.3, 0]} fontSize={0.15} color="#2ed573" anchorX="center">
            Trivially Relocatable Analysis
          </Text>
          
          <Text position={[-2.5, 0, 0]} fontSize={0.08} color={state.trivialRelocatable ? '#2ed573' : '#ff4757'} anchorX="center">
            Relocatable: {state.trivialRelocatable ? 'Yes' : 'No'}
          </Text>
          
          <Text position={[0, 0, 0]} fontSize={0.08} color="#00d4ff" anchorX="center">
            Can use memcpy
          </Text>
          
          <Text position={[2.5, 0, 0]} fontSize={0.08} color="#ffa500" anchorX="center">
            Optimization eligible
          </Text>
        </group>
      )}

      {state.demonstrationType === 'const_objects' && (
        <group position={[0, -1.5, 0]}>
          <Text position={[0, 0.3, 0]} fontSize={0.15} color="#ffa500" anchorX="center">
            Const Object Lifetime
          </Text>
          
          <Text position={[-2, 0, 0]} fontSize={0.08} color={state.constObjectModification ? '#ff4757' : '#2ed573'} anchorX="center">
            Modification: {state.constObjectModification ? 'Invalid' : 'Protected'}
          </Text>
          
          <Text position={[2, 0, 0]} fontSize={0.08} color="#00d4ff" anchorX="center">
            Const correctness maintained
          </Text>
        </group>
      )}

      {state.demonstrationType === 'virtual_inheritance' && (
        <group position={[0, -1.5, 0]}>
          <Text position={[0, 0.3, 0]} fontSize={0.15} color="#e74c3c" anchorX="center">
            Virtual Inheritance Complexity
          </Text>
          
          <Text position={[0, 0, 0]} fontSize={0.08} color="#ffa500" anchorX="center">
            Complexity Level: {state.virtualInheritanceComplexity}/5
          </Text>
          
          {/* Complexity indicator */}
          <group position={[0, -0.4, 0]}>
            {[0, 1, 2, 3, 4].map((level) => (
              <Box key={level} args={[0.3, 0.3, 0.1]} position={[level * 0.4 - 0.8, 0, 0]}>
                <meshStandardMaterial 
                  color={level < state.virtualInheritanceComplexity ? '#e74c3c' : '#57606f'}
                  transparent 
                  opacity={0.8} 
                />
              </Box>
            ))}
          </group>
        </group>
      )}

      {state.demonstrationType === 'launder_cases' && (
        <group position={[0, -1.5, 0]}>
          <Text position={[0, 0.3, 0]} fontSize={0.15} color="#9b59b6" anchorX="center">
            std::launder Requirements
          </Text>
          
          <Text position={[-2.5, 0, 0]} fontSize={0.07} color="#2ed573" anchorX="center">
            ✓ Pointer validation
          </Text>
          
          <Text position={[0, 0, 0]} fontSize={0.07} color="#ffa500" anchorX="center">
            ⚠ Memory reuse detected
          </Text>
          
          <Text position={[2.5, 0, 0]} fontSize={0.07} color="#9b59b6" anchorX="center">
            std::launder required
          </Text>
        </group>
      )}

      {/* Lifetime Timeline */}
      <group position={[0, -2.5, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
          Object Lifetime Timeline
        </Text>
        
        {/* Timeline visualization */}
        <Line
          points={[[-4, 0, 0], [4, 0, 0]]}
          color="#888888"
          lineWidth={2}
        />
        
        {state.objectStates.slice(0, 3).map((obj, index) => (
          <group key={obj.id}>
            {/* Birth marker */}
            <Box args={[0.1, 0.3, 0.1]} position={[-3 + obj.lifetime.birth * 0.1, 0, 0]}>
              <meshStandardMaterial color="#2ed573" />
            </Box>
            
            {/* Death marker */}
            {obj.lifetime.death !== null && (
              <Box args={[0.1, 0.3, 0.1]} position={[-3 + obj.lifetime.death * 0.1, 0, 0]}>
                <meshStandardMaterial color="#e74c3c" />
              </Box>
            )}
            
            {/* Active lifetime */}
            {obj.lifetime.death && (
              <Box 
                args={[(obj.lifetime.death - obj.lifetime.birth) * 0.1, 0.1, 0.05]} 
                position={[-3 + (obj.lifetime.birth + obj.lifetime.death) * 0.05, index * 0.2 - 0.2, 0]}
              >
                <meshStandardMaterial color={getStateColor(obj.state)} transparent opacity={0.6} />
              </Box>
            )}
          </group>
        ))}
      </group>
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson68_ObjectLifetime: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<ObjectLifetimeState>({
    demonstrationType: 'trivial_relocation',
    currentScenario: 0,
    objectStates: [
      { id: 1, type: 'int', state: 'constructed', memoryAddress: 0x1000, 
        lifetime: { birth: 0, death: null, valid: true }, pointerValidity: true },
      { id: 2, type: 'std::string', state: 'constructed', memoryAddress: 0x2000, 
        lifetime: { birth: 5, death: null, valid: true }, pointerValidity: true },
      { id: 3, type: 'MyClass', state: 'moved_from', memoryAddress: 0x3000, 
        lifetime: { birth: 10, death: null, valid: false }, pointerValidity: false },
      { id: 4, type: 'const int', state: 'constructed', memoryAddress: 0x4000, 
        lifetime: { birth: 15, death: null, valid: true }, pointerValidity: true }
    ],
    memoryOperations: [
      { operation: 'placement new', timestamp: 0, address: 0x1000, valid: true, needsLaunder: false },
      { operation: 'move construct', timestamp: 5, address: 0x2000, valid: true, needsLaunder: false },
      { operation: 'object replace', timestamp: 10, address: 0x3000, valid: true, needsLaunder: true },
      { operation: 'const modify', timestamp: 15, address: 0x4000, valid: false, needsLaunder: false }
    ],
    trivialRelocatable: true,
    constObjectModification: false,
    virtualInheritanceComplexity: 3
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 8,
    completedSteps: [],
    score: 0
  });

  const codeExamples = {
    trivial_relocation: `// Trivially relocatable objects - P1144 proposal
#include <type_traits>
#include <memory>
#include <vector>
#include <string>

// Example 1: Understanding trivial relocation
template<typename T>
struct is_trivially_relocatable : std::is_trivially_copyable<T> {};

// Built-in types are trivially relocatable
static_assert(is_trivially_relocatable<int>::value);
static_assert(is_trivially_relocatable<double>::value);
static_assert(is_trivially_relocatable<int*>::value);

// POD structs are trivially relocatable
struct Point {
    int x, y;
};
static_assert(is_trivially_relocatable<Point>::value);

// Classes with non-trivial destructors are NOT trivially relocatable
class NonTrivial {
    std::string data;  // std::string has non-trivial destructor
public:
    NonTrivial(const std::string& s) : data(s) {}
};
// std::string itself is actually trivially relocatable in practice
// but the standard doesn't guarantee it

// Example 2: Manual relocation for optimization
template<typename T>
void unsafe_relocate(T* from, T* to) {
    static_assert(is_trivially_relocatable<T>::value, 
                  "Type must be trivially relocatable");
    
    // This is safe for trivially relocatable types:
    // 1. Copy bits from source to destination
    std::memcpy(to, from, sizeof(T));
    
    // 2. Mark source as "moved-from" (conceptually)
    // Don't call destructor on 'from' - it's now at 'to'
    
    // For non-trivially relocatable types, you'd need:
    // new(to) T(std::move(*from));
    // from->~T();
}

// Example 3: Vector reallocation optimization
template<typename T>
class OptimizedVector {
    T* data_;
    size_t size_;
    size_t capacity_;
    
public:
    void reserve(size_t new_capacity) {
        if (new_capacity <= capacity_) return;
        
        T* new_data = static_cast<T*>(std::aligned_alloc(alignof(T), 
                                                        new_capacity * sizeof(T)));
        
        if constexpr (is_trivially_relocatable<T>::value) {
            // Fast path: bulk memory copy
            std::memcpy(new_data, data_, size_ * sizeof(T));
            
            // No destructors needed - objects moved as bits
            
        } else {
            // Slow path: move construct each element
            for (size_t i = 0; i < size_; ++i) {
                new(new_data + i) T(std::move(data_[i]));
                data_[i].~T();
            }
        }
        
        std::free(data_);
        data_ = new_data;
        capacity_ = new_capacity;
    }
    
    // Insert with efficient relocation
    void insert(size_t pos, const T& value) {
        if (size_ == capacity_) {
            reserve(capacity_ * 2);
        }
        
        if constexpr (is_trivially_relocatable<T>::value) {
            // Bulk move elements after insertion point
            std::memmove(data_ + pos + 1, data_ + pos, (size_ - pos) * sizeof(T));
        } else {
            // Move each element individually (backwards to avoid overlap)
            for (size_t i = size_; i > pos; --i) {
                new(data_ + i) T(std::move(data_[i - 1]));
                data_[i - 1].~T();
            }
        }
        
        new(data_ + pos) T(value);
        ++size_;
    }
};

// Example 4: Custom types with trivial relocation guarantee
class TriviallyRelocatableString {
    char* data_;
    size_t size_;
    size_t capacity_;
    
public:
    TriviallyRelocatableString(const char* str) {
        size_ = std::strlen(str);
        capacity_ = size_ + 1;
        data_ = new char[capacity_];
        std::strcpy(data_, str);
    }
    
    // Move constructor - becomes trivial after move
    TriviallyRelocatableString(TriviallyRelocatableString&& other) noexcept
        : data_(other.data_), size_(other.size_), capacity_(other.capacity_) {
        other.data_ = nullptr;
        other.size_ = 0;
        other.capacity_ = 0;
    }
    
    ~TriviallyRelocatableString() {
        delete[] data_;
    }
    
    // This class IS trivially relocatable because:
    // 1. After move construction, the moved-from object is in a valid state
    // 2. Destroying the moved-from object is safe (delete[] nullptr is safe)
    // 3. No self-references or external references to 'this'
};

// Specialization to mark as trivially relocatable
template<>
struct is_trivially_relocatable<TriviallyRelocatableString> : std::true_type {};

// Example 5: Real-world performance impact
void demonstrate_performance_difference() {
    constexpr size_t N = 1000000;
    
    // Test with trivially relocatable type
    {
        std::vector<int> vec;
        vec.reserve(1000);  // Start small to force reallocation
        
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < N; ++i) {
            vec.push_back(static_cast<int>(i));
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto trivial_time = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        std::cout << "Trivially relocatable (int): " << trivial_time.count() << " μs\\n";
    }
    
    // Test with non-trivially relocatable type (in theory)
    {
        std::vector<std::string> vec;
        vec.reserve(1000);  // Start small to force reallocation
        
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < N; ++i) {
            vec.push_back("String " + std::to_string(i));
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto nontrivial_time = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        std::cout << "Non-trivially relocatable (string): " << nontrivial_time.count() << " μs\\n";
        
        // Note: std::string is often optimized to be trivially relocatable in practice
        // even though the standard doesn't guarantee it
    }
}`,

    const_objects: `// Const object lifetime and modification rules
#include <memory>
#include <type_traits>

// Example 1: Const object construction and lifetime
class ConstLifetimeDemo {
public:
    // Const objects have special lifetime rules
    void demonstrate_const_lifetime() {
        // 1. Const objects must be initialized at construction
        const int immutable = 42;  // ✅ Must initialize
        // const int uninitialized;  // ❌ Error: must initialize const
        
        // 2. Const objects cannot be assigned after construction
        // immutable = 100;  // ❌ Error: cannot modify const object
        
        // 3. Const objects can be destroyed normally
        {
            const std::string const_str("Hello");
            // const_str is destroyed at end of scope
        }
    }
    
    // Const correctness with pointers
    void const_pointer_lifetime() {
        int value = 42;
        
        // Different const pointer types
        const int* ptr_to_const = &value;      // Pointer to const int
        int* const const_ptr = &value;         // Const pointer to int
        const int* const const_ptr_to_const = &value; // Const pointer to const int
        
        // Lifetime implications:
        *const_ptr = 100;          // ✅ Can modify value through const pointer
        // *ptr_to_const = 100;    // ❌ Cannot modify const value
        
        int other_value = 200;
        ptr_to_const = &other_value;  // ✅ Can change pointer to const
        // const_ptr = &other_value;  // ❌ Cannot change const pointer
    }
};

// Example 2: Const object replacement (advanced)
class ConstObjectReplacement {
public:
    // Const objects can be "replaced" using placement new
    void demonstrate_const_replacement() {
        alignas(int) char buffer[sizeof(int)];
        
        // Construct const object
        const int* const_obj = new(buffer) const int(42);
        
        std::cout << "Original const value: " << *const_obj << "\\n";
        
        // End lifetime of const object
        const_obj->~int();  // Explicit destructor call
        
        // Start new lifetime - different const object at same address
        const int* new_const_obj = new(buffer) const int(100);
        
        std::cout << "New const value: " << *new_const_obj << "\\n";
        
        // Important: const_obj is now a dangling pointer!
        // Using const_obj after destructor call is undefined behavior
        
        // Cleanup
        new_const_obj->~int();
    }
    
    // Const object aliasing through unions
    void const_union_aliasing() {
        union ConstUnion {
            const int const_member;
            int mutable_member;
            
            ConstUnion(int value) : const_member(value) {}
            ~ConstUnion() {}  // Trivial destructor for int
        };
        
        ConstUnion u(42);
        std::cout << "Const member: " << u.const_member << "\\n";
        
        // This is technically undefined behavior, but commonly works:
        u.mutable_member = 100;  // Modifying through non-const member
        std::cout << "After modification: " << u.const_member << "\\n";
        
        // The behavior is implementation-defined and potentially UB
        // Better to avoid this pattern in production code
    }
};

// Example 3: Const correctness in class hierarchies
class ConstInheritance {
public:
    class Base {
    protected:
        mutable int cache_value_ = 0;  // Can be modified in const functions
        
    public:
        virtual ~Base() = default;
        
        virtual void process() const {
            // Can modify mutable members in const function
            cache_value_ = 42;
        }
        
        virtual int get_value() const = 0;
    };
    
    class Derived : public Base {
    private:
        int value_;
        
    public:
        Derived(int v) : value_(v) {}
        
        // Const override must maintain const correctness
        int get_value() const override {
            return value_;  // ✅ Can read non-mutable members
            // value_ = 100; // ❌ Cannot modify non-mutable members
        }
        
        // Non-const version for modification
        void set_value(int v) {
            value_ = v;  // ✅ Non-const function can modify
        }
    };
    
    void demonstrate_const_polymorphism() {
        Derived d(42);
        const Base& const_ref = d;  // Const reference to derived object
        
        // Const interface enforced through polymorphism
        const_ref.process();  // ✅ Const virtual function
        int value = const_ref.get_value();  // ✅ Const virtual function
        
        // const_ref.set_value(100);  // ❌ Function not available on const ref
        
        std::cout << "Value through const reference: " << value << "\\n";
    }
};

// Example 4: Const and std::launder interaction
class ConstLaunderInteraction {
public:
    struct ConstContainer {
        const int value;
        
        ConstContainer(int v) : value(v) {}
        ~ConstContainer() = default;
    };
    
    void demonstrate_const_launder() {
        alignas(ConstContainer) char buffer[sizeof(ConstContainer)];
        
        // First const object
        ConstContainer* obj1 = new(buffer) ConstContainer(42);
        std::cout << "First object value: " << obj1->value << "\\n";
        
        // End lifetime
        obj1->~ConstContainer();
        
        // Create new const object at same location
        ConstContainer* obj2 = new(buffer) ConstContainer(100);
        
        // obj1 is now invalid - using it is UB
        // To reuse pointers after object replacement, might need std::launder
        
        #ifdef __cpp_lib_launder
        ConstContainer* laundered = std::launder(
            reinterpret_cast<ConstContainer*>(buffer));
        std::cout << "Laundered object value: " << laundered->value << "\\n";
        #endif
        
        // Safe approach: use the returned pointer from placement new
        std::cout << "New object value: " << obj2->value << "\\n";
        
        obj2->~ConstContainer();
    }
    
    // Const member with dynamic storage
    void const_with_dynamic_storage() {
        struct DynamicConst {
            const std::unique_ptr<const int> const_ptr;
            
            DynamicConst(int value) 
                : const_ptr(std::make_unique<const int>(value)) {}
                
            // const_ptr itself is const, pointing to const int
            // Neither the pointer nor the pointed-to value can be modified
        };
        
        DynamicConst obj(42);
        std::cout << "Dynamic const value: " << *obj.const_ptr << "\\n";
        
        // obj.const_ptr = std::make_unique<const int>(100);  // ❌ Cannot modify const member
        // *obj.const_ptr = 100;  // ❌ Cannot modify const int through pointer
        
        // The const object's lifetime is tied to the unique_ptr
        // When obj is destroyed, the const int is also destroyed
    }
};

// Example 5: Thread safety and const objects
#include <thread>
#include <atomic>

class ThreadSafeConstAccess {
private:
    const std::string immutable_data_;
    mutable std::atomic<int> access_count_{0};
    
public:
    ThreadSafeConstAccess(const std::string& data) : immutable_data_(data) {}
    
    // Thread-safe const access
    const std::string& get_data() const {
        // Atomic operations on mutable member are allowed in const functions
        access_count_.fetch_add(1, std::memory_order_relaxed);
        
        // Returning const reference to immutable data is thread-safe
        return immutable_data_;
    }
    
    // Thread-safe access count (const function modifying mutable state)
    int get_access_count() const {
        return access_count_.load(std::memory_order_acquire);
    }
    
    static void demonstrate_thread_safety() {
        ThreadSafeConstAccess obj("Thread-safe data");
        
        constexpr int num_threads = 10;
        constexpr int accesses_per_thread = 1000;
        
        std::vector<std::thread> threads;
        threads.reserve(num_threads);
        
        for (int i = 0; i < num_threads; ++i) {
            threads.emplace_back([&obj]() {
                for (int j = 0; j < accesses_per_thread; ++j) {
                    const std::string& data = obj.get_data();  // Thread-safe const access
                    // Use data...
                }
            });
        }
        
        for (auto& t : threads) {
            t.join();
        }
        
        std::cout << "Total accesses: " << obj.get_access_count() << "\\n";
        std::cout << "Expected: " << num_threads * accesses_per_thread << "\\n";
    }
};`,

    virtual_inheritance: `// Virtual inheritance complexity and object lifetime
#include <iostream>
#include <memory>
#include <type_traits>

// Example 1: Basic virtual inheritance lifetime complexity
class VirtualInheritanceLifetime {
public:
    // Virtual base class
    struct VirtualBase {
        int base_value;
        
        VirtualBase(int v) : base_value(v) {
            std::cout << "VirtualBase(" << v << ") constructed\\n";
        }
        
        virtual ~VirtualBase() {
            std::cout << "VirtualBase(" << base_value << ") destroyed\\n";
        }
    };
    
    // First derived class
    struct DerivedA : virtual VirtualBase {
        int a_value;
        
        DerivedA(int base, int a) : VirtualBase(base), a_value(a) {
            std::cout << "DerivedA(" << a << ") constructed\\n";
        }
        
        ~DerivedA() {
            std::cout << "DerivedA(" << a_value << ") destroyed\\n";
        }
    };
    
    // Second derived class
    struct DerivedB : virtual VirtualBase {
        int b_value;
        
        DerivedB(int base, int b) : VirtualBase(base), b_value(b) {
            std::cout << "DerivedB(" << b << ") constructed\\n";
        }
        
        ~DerivedB() {
            std::cout << "DerivedB(" << b_value << ") destroyed\\n";
        }
    };
    
    // Diamond inheritance - most derived class
    struct MostDerived : DerivedA, DerivedB {
        int final_value;
        
        // CRITICAL: Most derived class must initialize virtual base
        MostDerived(int base, int a, int b, int final) 
            : VirtualBase(base),      // ✅ Required: initialize virtual base
              DerivedA(0, a),         // Base parameter ignored
              DerivedB(0, b),         // Base parameter ignored  
              final_value(final) {
            std::cout << "MostDerived(" << final << ") constructed\\n";
        }
        
        ~MostDerived() {
            std::cout << "MostDerived(" << final_value << ") destroyed\\n";
            // Destruction order: MostDerived -> DerivedB -> DerivedA -> VirtualBase
        }
    };
    
    static void demonstrate_virtual_construction() {
        std::cout << "=== Virtual Inheritance Construction ===\\n";
        {
            MostDerived obj(100, 200, 300, 400);
            std::cout << "Object constructed\\n";
            std::cout << "Virtual base value: " << obj.base_value << "\\n";
            std::cout << "A value: " << obj.a_value << "\\n";
            std::cout << "B value: " << obj.b_value << "\\n";
            std::cout << "Final value: " << obj.final_value << "\\n";
        }
        std::cout << "=== Destruction Complete ===\\n";
    }
};

// Example 2: Complex virtual inheritance with multiple levels
class MultiLevelVirtualInheritance {
public:
    struct GrandBase {
        int grand_value;
        
        GrandBase(int v) : grand_value(v) {
            std::cout << "GrandBase(" << v << ") constructed\\n";
        }
        
        virtual ~GrandBase() {
            std::cout << "GrandBase destroyed\\n";
        }
    };
    
    struct MiddleA : virtual GrandBase {
        int middle_a;
        
        MiddleA(int grand, int middle) : GrandBase(grand), middle_a(middle) {
            std::cout << "MiddleA(" << middle << ") constructed\\n";
        }
        
        virtual ~MiddleA() {
            std::cout << "MiddleA destroyed\\n";
        }
    };
    
    struct MiddleB : virtual GrandBase {
        int middle_b;
        
        MiddleB(int grand, int middle) : GrandBase(grand), middle_b(middle) {
            std::cout << "MiddleB(" << middle << ") constructed\\n";
        }
        
        virtual ~MiddleB() {
            std::cout << "MiddleB destroyed\\n";
        }
    };
    
    struct FinalDerived : MiddleA, MiddleB {
        int final_value;
        
        // Must initialize all virtual bases directly
        FinalDerived(int grand, int ma, int mb, int final)
            : GrandBase(grand),           // Direct initialization of virtual base
              MiddleA(0, ma),            // Grand parameter ignored
              MiddleB(0, mb),            // Grand parameter ignored
              final_value(final) {
            std::cout << "FinalDerived(" << final << ") constructed\\n";
        }
        
        ~FinalDerived() {
            std::cout << "FinalDerived destroyed\\n";
        }
    };
    
    static void demonstrate_multi_level() {
        std::cout << "\\n=== Multi-Level Virtual Inheritance ===\\n";
        {
            FinalDerived obj(1, 2, 3, 4);
            
            // Address calculations are complex with virtual inheritance
            std::cout << "Object address: " << &obj << "\\n";
            std::cout << "GrandBase address: " << static_cast<GrandBase*>(&obj) << "\\n";
            std::cout << "MiddleA address: " << static_cast<MiddleA*>(&obj) << "\\n";
            std::cout << "MiddleB address: " << static_cast<MiddleB*>(&obj) << "\\n";
        }
        std::cout << "=== Multi-Level Destruction Complete ===\\n";
    }
};

// Example 3: Virtual inheritance with placement new complexity
class VirtualInheritancePlacementNew {
public:
    using MostDerived = VirtualInheritanceLifetime::MostDerived;
    
    static void demonstrate_placement_new_complexity() {
        std::cout << "\\n=== Virtual Inheritance + Placement New ===\\n";
        
        // Placement new with virtual inheritance is complex
        alignas(MostDerived) char buffer[sizeof(MostDerived)];
        
        std::cout << "Buffer size: " << sizeof(MostDerived) << " bytes\\n";
        std::cout << "Buffer address: " << static_cast<void*>(buffer) << "\\n";
        
        // Construct object in place
        MostDerived* obj = new(buffer) MostDerived(10, 20, 30, 40);
        
        // Virtual inheritance affects object layout
        std::cout << "Object address: " << obj << "\\n";
        std::cout << "Virtual base offset: " 
                  << reinterpret_cast<char*>(static_cast<VirtualInheritanceLifetime::VirtualBase*>(obj)) 
                     - reinterpret_cast<char*>(obj) << " bytes\\n";
        
        // Use the object
        std::cout << "Values: " << obj->base_value << ", " << obj->a_value 
                  << ", " << obj->b_value << ", " << obj->final_value << "\\n";
        
        // Manual destruction required
        obj->~MostDerived();
        
        std::cout << "=== Placement New Complete ===\\n";
    }
};

// Example 4: Virtual inheritance and std::launder interaction  
class VirtualInheritanceLaunder {
public:
    struct VBase {
        const int value;
        
        VBase(int v) : value(v) {}
        virtual ~VBase() = default;
    };
    
    struct Derived : virtual VBase {
        int derived_value;
        
        Derived(int base, int derived) : VBase(base), derived_value(derived) {}
    };
    
    static void demonstrate_launder_with_virtual() {
        std::cout << "\\n=== Virtual Inheritance + std::launder ===\\n";
        
        alignas(Derived) char buffer[sizeof(Derived)];
        
        // First object
        Derived* obj1 = new(buffer) Derived(100, 200);
        std::cout << "First object - base: " << obj1->value 
                  << ", derived: " << obj1->derived_value << "\\n";
        
        // Get pointer to virtual base
        VBase* vbase_ptr1 = obj1;
        std::cout << "Virtual base value through pointer: " << vbase_ptr1->value << "\\n";
        
        // Destroy first object
        obj1->~Derived();
        
        // Create new object with different values
        Derived* obj2 = new(buffer) Derived(300, 400);
        
        // vbase_ptr1 is now potentially invalid due to object replacement
        // std::launder might be needed for virtual base pointers
        
        #ifdef __cpp_lib_launder
        VBase* laundered_vbase = std::launder(
            reinterpret_cast<VBase*>(
                reinterpret_cast<char*>(buffer) + 
                (reinterpret_cast<char*>(static_cast<VBase*>(obj2)) - 
                 reinterpret_cast<char*>(obj2))));
        
        std::cout << "Laundered virtual base value: " << laundered_vbase->value << "\\n";
        #endif
        
        std::cout << "New object values: " << obj2->value 
                  << ", " << obj2->derived_value << "\\n";
        
        obj2->~Derived();
        std::cout << "=== Virtual Launder Complete ===\\n";
    }
};

// Example 5: Performance implications of virtual inheritance
class VirtualInheritancePerformance {
public:
    struct RegularBase {
        int value;
        RegularBase(int v) : value(v) {}
        virtual ~RegularBase() = default;
    };
    
    struct RegularDerived : RegularBase {
        int derived;
        RegularDerived(int b, int d) : RegularBase(b), derived(d) {}
    };
    
    struct VirtualBase {
        int value;
        VirtualBase(int v) : value(v) {}
        virtual ~VirtualBase() = default;
    };
    
    struct VirtualDerived : virtual VirtualBase {
        int derived;
        VirtualDerived(int b, int d) : VirtualBase(b), derived(d) {}
    };
    
    static void demonstrate_performance_impact() {
        std::cout << "\\n=== Virtual Inheritance Performance ===\\n";
        
        constexpr size_t N = 1000000;
        
        // Regular inheritance
        auto start = std::chrono::high_resolution_clock::now();
        
        std::vector<RegularDerived> regular_objects;
        regular_objects.reserve(N);
        
        for (size_t i = 0; i < N; ++i) {
            regular_objects.emplace_back(static_cast<int>(i), static_cast<int>(i * 2));
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto regular_time = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        // Virtual inheritance
        start = std::chrono::high_resolution_clock::now();
        
        std::vector<VirtualDerived> virtual_objects;
        virtual_objects.reserve(N);
        
        for (size_t i = 0; i < N; ++i) {
            virtual_objects.emplace_back(static_cast<int>(i), static_cast<int>(i * 2));
        }
        
        end = std::chrono::high_resolution_clock::now();
        auto virtual_time = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        std::cout << "Regular inheritance: " << regular_time.count() << " μs\\n";
        std::cout << "Virtual inheritance: " << virtual_time.count() << " μs\\n";
        std::cout << "Overhead factor: " << static_cast<double>(virtual_time.count()) / regular_time.count() << "\\n";
        
        std::cout << "Regular object size: " << sizeof(RegularDerived) << " bytes\\n";
        std::cout << "Virtual object size: " << sizeof(VirtualDerived) << " bytes\\n";
    }
};

// Comprehensive demonstration
void demonstrate_all_virtual_inheritance() {
    VirtualInheritanceLifetime::demonstrate_virtual_construction();
    MultiLevelVirtualInheritance::demonstrate_multi_level();
    VirtualInheritancePlacementNew::demonstrate_placement_new_complexity();
    VirtualInheritanceLaunder::demonstrate_launder_with_virtual();
    VirtualInheritancePerformance::demonstrate_performance_impact();
}`,

    launder_cases: `// std::launder use cases and requirements (C++17)
#include <new>
#include <memory>

#ifdef __cpp_lib_launder

// Example 1: Basic std::launder requirement
class BasicLaunderCases {
public:
    struct SimpleStruct {
        int value;
        
        SimpleStruct(int v) : value(v) {}
    };
    
    void demonstrate_basic_launder() {
        alignas(SimpleStruct) char buffer[sizeof(SimpleStruct)];
        
        // First object
        SimpleStruct* obj1 = new(buffer) SimpleStruct(42);
        int* value_ptr = &obj1->value;  // Pointer to member
        
        std::cout << "Original value: " << *value_ptr << "\\n";
        
        // Destroy and replace
        obj1->~SimpleStruct();
        SimpleStruct* obj2 = new(buffer) SimpleStruct(100);
        
        // value_ptr now points to memory that has been reused
        // Using value_ptr without laundering is undefined behavior
        
        // ❌ Undefined behavior:
        // std::cout << "New value (UB): " << *value_ptr << "\\n";
        
        // ✅ Correct with std::launder:
        int* laundered_ptr = std::launder(value_ptr);
        std::cout << "New value (safe): " << *laundered_ptr << "\\n";
        
        obj2->~SimpleStruct();
    }
    
    // Example with const members
    struct ConstMember {
        const int immutable_value;
        int mutable_value;
        
        ConstMember(int cv, int mv) : immutable_value(cv), mutable_value(mv) {}
    };
    
    void demonstrate_const_member_launder() {
        alignas(ConstMember) char buffer[sizeof(ConstMember)];
        
        // First object with const member
        ConstMember* obj1 = new(buffer) ConstMember(42, 100);
        const int* const_ptr = &obj1->immutable_value;
        
        std::cout << "Original const value: " << *const_ptr << "\\n";
        
        // Replace object (const member gets different value)
        obj1->~ConstMember();
        ConstMember* obj2 = new(buffer) ConstMember(200, 300);
        
        // const_ptr is now invalid - points to destroyed const object
        // std::launder is required to get valid pointer to new const object
        
        const int* laundered_const = std::launder(const_ptr);
        std::cout << "New const value: " << *laundered_const << "\\n";
        
        obj2->~ConstMember();
    }
};

// Example 2: std::launder with reference members
class ReferenceMemberLaunder {
public:
    struct WithReference {
        int& ref_member;
        int local_value;
        
        WithReference(int& r, int v) : ref_member(r), local_value(v) {}
    };
    
    void demonstrate_reference_launder() {
        int external_value1 = 42;
        int external_value2 = 100;
        
        alignas(WithReference) char buffer[sizeof(WithReference)];
        
        // First object referencing external_value1
        WithReference* obj1 = new(buffer) WithReference(external_value1, 10);
        int* ref_ptr = &obj1->ref_member;  // Pointer to reference target
        
        std::cout << "Original reference target: " << *ref_ptr << "\\n";
        std::cout << "Reference value: " << obj1->ref_member << "\\n";
        
        // Replace with object referencing different external value
        obj1->~WithReference();
        WithReference* obj2 = new(buffer) WithReference(external_value2, 20);
        
        // ref_ptr now points to old reference target
        // Need std::launder to get pointer to new reference target
        
        int* laundered_ref = std::launder(&obj2->ref_member);
        // OR: int* laundered_ref = &std::launder(reinterpret_cast<WithReference*>(buffer))->ref_member;
        
        std::cout << "New reference target: " << *laundered_ref << "\\n";
        std::cout << "New reference value: " << obj2->ref_member << "\\n";
        
        obj2->~WithReference();
    }
};

// Example 3: Complex case - virtual inheritance + const members
class VirtualInheritanceLaunder {
public:
    struct VirtualBase {
        const int base_const;
        mutable int base_mutable;
        
        VirtualBase(int c, int m) : base_const(c), base_mutable(m) {}
        virtual ~VirtualBase() = default;
    };
    
    struct Derived : virtual VirtualBase {
        const int derived_const;
        
        Derived(int bc, int bm, int dc) 
            : VirtualBase(bc, bm), derived_const(dc) {}
    };
    
    void demonstrate_complex_launder() {
        alignas(Derived) char buffer[sizeof(Derived)];
        
        // First derived object
        Derived* obj1 = new(buffer) Derived(10, 20, 30);
        
        // Get pointers to const members
        const int* base_const_ptr = &obj1->base_const;
        const int* derived_const_ptr = &obj1->derived_const;
        VirtualBase* vbase_ptr = obj1;
        
        std::cout << "Original values: " << *base_const_ptr 
                  << ", " << *derived_const_ptr << "\\n";
        
        // Replace object
        obj1->~Derived();
        Derived* obj2 = new(buffer) Derived(40, 50, 60);
        
        // All old pointers are potentially invalid
        // Complex laundering required due to virtual inheritance
        
        // Method 1: Launder the main object pointer first
        Derived* laundered_obj = std::launder(reinterpret_cast<Derived*>(buffer));
        
        // Method 2: Then get fresh pointers to members
        const int* new_base_const = &laundered_obj->base_const;
        const int* new_derived_const = &laundered_obj->derived_const;
        
        std::cout << "Laundered values: " << *new_base_const 
                  << ", " << *new_derived_const << "\\n";
        
        // Virtual base pointer also needs careful handling
        VirtualBase* new_vbase = laundered_obj;
        std::cout << "Virtual base const: " << new_vbase->base_const << "\\n";
        
        obj2->~Derived();
    }
};

// Example 4: std::launder with arrays
class ArrayLaunder {
public:
    void demonstrate_array_launder() {
        constexpr size_t N = 5;
        alignas(int) char buffer[N * sizeof(int)];
        
        // Construct array of integers
        int* array1 = reinterpret_cast<int*>(buffer);
        for (size_t i = 0; i < N; ++i) {
            new(array1 + i) int(static_cast<int>(i * 10));
        }
        
        // Get pointer to middle element
        int* middle_ptr = array1 + 2;
        std::cout << "Original middle value: " << *middle_ptr << "\\n";
        
        // Destroy and reconstruct array with different values
        for (size_t i = 0; i < N; ++i) {
            array1[i].~int();
        }
        
        for (size_t i = 0; i < N; ++i) {
            new(array1 + i) int(static_cast<int>(i * 100));
        }
        
        // middle_ptr is now invalid
        // Need to launder to get valid pointer to new array element
        
        int* laundered_middle = std::launder(middle_ptr);
        std::cout << "New middle value: " << *laundered_middle << "\\n";
        
        // Print entire new array
        int* laundered_array = std::launder(array1);
        for (size_t i = 0; i < N; ++i) {
            std::cout << "Array[" << i << "]: " << laundered_array[i] << "\\n";
        }
        
        // Cleanup
        for (size_t i = 0; i < N; ++i) {
            laundered_array[i].~int();
        }
    }
};

// Example 5: When std::launder is NOT needed
class LaunderNotNeeded {
public:
    void demonstrate_when_launder_not_needed() {
        alignas(int) char buffer[sizeof(int)];
        
        // Case 1: Using the pointer returned from placement new
        int* obj1 = new(buffer) int(42);
        std::cout << "Value from placement new: " << *obj1 << "\\n";
        
        obj1->~int();
        int* obj2 = new(buffer) int(100);  // New pointer returned
        std::cout << "Value from new placement new: " << *obj2 << "\\n";
        // No laundering needed - using fresh pointer from placement new
        
        obj2->~int();
        
        // Case 2: Pointer to different memory location
        int separate_int = 200;
        int* separate_ptr = &separate_int;
        
        *separate_ptr = 300;  // No object replacement - no laundering needed
        std::cout << "Separate memory value: " << *separate_ptr << "\\n";
        
        // Case 3: Trivial types without const/reference members
        struct TrivialStruct {
            int a, b;
        };
        
        alignas(TrivialStruct) char trivial_buffer[sizeof(TrivialStruct)];
        
        TrivialStruct* ts1 = new(trivial_buffer) TrivialStruct{1, 2};
        int* member_ptr = &ts1->a;
        
        ts1->~TrivialStruct();
        TrivialStruct* ts2 = new(trivial_buffer) TrivialStruct{3, 4};
        
        // For trivial types, some compilers may not require laundering
        // But it's safer to use std::launder or fresh pointers anyway
        
        std::cout << "Trivial member (potentially UB): " << *member_ptr << "\\n";
        std::cout << "Safe access: " << ts2->a << "\\n";
        
        ts2->~TrivialStruct();
    }
    
    // Performance comparison: laundering vs fresh pointers
    void compare_launder_performance() {
        constexpr size_t ITERATIONS = 1000000;
        alignas(int) char buffer[sizeof(int)];
        
        // Method 1: Using std::launder
        int* persistent_ptr = reinterpret_cast<int*>(buffer);
        
        auto start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < ITERATIONS; ++i) {
            new(buffer) int(static_cast<int>(i));
            
            int* laundered = std::launder(persistent_ptr);
            volatile int value = *laundered;  // Prevent optimization
            
            reinterpret_cast<int*>(buffer)->~int();
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto launder_time = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        // Method 2: Using fresh pointers
        start = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < ITERATIONS; ++i) {
            int* fresh_ptr = new(buffer) int(static_cast<int>(i));
            volatile int value = *fresh_ptr;  // Prevent optimization
            fresh_ptr->~int();
        }
        
        end = std::chrono::high_resolution_clock::now();
        auto fresh_time = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        std::cout << "\\nPerformance comparison:\\n";
        std::cout << "std::launder approach: " << launder_time.count() << " ns\\n";
        std::cout << "Fresh pointer approach: " << fresh_time.count() << " ns\\n";
        std::cout << "Overhead ratio: " << static_cast<double>(launder_time.count()) / fresh_time.count() << "\\n";
    }
};

// Comprehensive demonstration
void demonstrate_all_launder_cases() {
    BasicLaunderCases basic;
    basic.demonstrate_basic_launder();
    basic.demonstrate_const_member_launder();
    
    ReferenceMemberLaunder ref_demo;
    ref_demo.demonstrate_reference_launder();
    
    VirtualInheritanceLaunder virtual_demo;
    virtual_demo.demonstrate_complex_launder();
    
    ArrayLaunder array_demo;
    array_demo.demonstrate_array_launder();
    
    LaunderNotNeeded not_needed;
    not_needed.demonstrate_when_launder_not_needed();
    not_needed.compare_launder_performance();
}

#else
void demonstrate_all_launder_cases() {
    std::cout << "std::launder not available in this C++ standard version\\n";
}
#endif // __cpp_lib_launder`
  };

  const scenarios = [
    {
      title: 'Trivially Relocatable Objects',
      code: codeExamples.trivial_relocation,
      explanation: state.language === 'en' 
        ? 'Understanding which objects can be safely moved with memcpy for performance.'
        : 'Entendiendo qué objetos pueden ser movidos de forma segura con memcpy para rendimiento.'
    },
    {
      title: 'Const Object Lifetime',
      code: codeExamples.const_objects,
      explanation: state.language === 'en'
        ? 'Master the complex lifetime rules for const and immutable objects.'
        : 'Domina las reglas complejas de tiempo de vida para objetos const e inmutables.'
    },
    {
      title: 'Virtual Inheritance Complexity',
      code: codeExamples.virtual_inheritance,
      explanation: state.language === 'en'
        ? 'Navigate the complex object lifetime in virtual inheritance hierarchies.'
        : 'Navega el tiempo de vida complejo de objetos en jerarquías de herencia virtual.'
    },
    {
      title: 'std::launder Use Cases',
      code: codeExamples.launder_cases,
      explanation: state.language === 'en'
        ? 'Master std::launder for valid pointer access after object replacement.'
        : 'Domina std::launder para acceso válido de punteros después del reemplazo de objetos.'
    }
  ];

  const simulateObjectState = (newState: ObjectLifetimeState['objectStates'][0]['state']) => {
    setLessonState(prev => ({
      ...prev,
      objectStates: prev.objectStates.map((obj, index) => 
        index === 0 ? { 
          ...obj, 
          state: newState,
          lifetime: {
            ...obj.lifetime,
            valid: newState === 'constructed',
            death: newState === 'destroyed' ? Date.now() : obj.lifetime.death
          },
          pointerValidity: newState === 'constructed' || newState === 'moved_from'
        } : obj
      )
    }));
  };

  const addMemoryOperation = (operation: string, needsLaunder = false) => {
    setLessonState(prev => ({
      ...prev,
      memoryOperations: [...prev.memoryOperations, {
        operation,
        timestamp: Date.now() % 10000,
        address: 0x5000 + prev.memoryOperations.length * 0x100,
        valid: operation !== 'invalid access',
        needsLaunder
      }]
    }));
  };

  const toggleTrivialRelocatable = () => {
    setLessonState(prev => ({
      ...prev,
      trivialRelocatable: !prev.trivialRelocatable
    }));
  };

  const nextScenario = () => {
    const nextIndex = (lessonState.currentScenario + 1) % scenarios.length;
    setLessonState(prev => ({
      ...prev,
      currentScenario: nextIndex,
      demonstrationType: ['trivial_relocation', 'const_objects', 'virtual_inheritance', 'launder_cases'][nextIndex] as ObjectLifetimeState['demonstrationType']
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Master trivially relocatable object patterns' : 'Dominar patrones de objetos trivialmente reubicables',
    state.language === 'en' ? 'Understand const object lifetime complexities' : 'Entender complejidades del tiempo de vida de objetos const',
    state.language === 'en' ? 'Navigate virtual inheritance object lifetimes' : 'Navegar tiempos de vida de objetos en herencia virtual',
    state.language === 'en' ? 'Master std::launder for pointer validity' : 'Dominar std::launder para validez de punteros',
    state.language === 'en' ? 'Handle object replacement scenarios safely' : 'Manejar escenarios de reemplazo de objetos de forma segura'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Object Lifetime Corner Cases" : "Casos Extremos de Tiempo de Vida de Objetos"}
      subtitle={state.language === 'en' 
        ? "Master complex object lifetime scenarios and edge cases in modern C++" 
        : "Domina escenarios complejos de tiempo de vida de objetos y casos extremos en C++ moderno"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '⚡ Object Lifetime Complexities' : '⚡ Complejidades de Tiempo de Vida de Objetos'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'Object lifetime in C++ involves complex scenarios including trivial relocation, const object replacement, virtual inheritance intricacies, and pointer validity after object replacement. Understanding these corner cases is crucial for writing correct and efficient code.'
            : 'El tiempo de vida de objetos en C++ involucra escenarios complejos incluyendo reubicación trivial, reemplazo de objetos const, complejidades de herencia virtual, y validez de punteros después del reemplazo de objetos. Entender estos casos extremos es crucial para escribir código correcto y eficiente.'}
        </p>

        <div style={{ height: '500px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <ObjectLifetimeVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive Lifetime Demo' : '🧪 Demo Interactivo de Tiempo de Vida'}
        </SectionTitle>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button onClick={nextScenario}>
            {state.language === 'en' ? 'Next Scenario' : 'Siguiente Escenario'} ({lessonState.currentScenario + 1}/4)
          </Button>
          
          <Button onClick={() => simulateObjectState('constructed')}>
            {state.language === 'en' ? 'Construct Object' : 'Construir Objeto'}
          </Button>
          
          <Button onClick={() => simulateObjectState('moved_from')}>
            {state.language === 'en' ? 'Move Object' : 'Mover Objeto'}
          </Button>
          
          <Button onClick={() => simulateObjectState('destroyed')}>
            {state.language === 'en' ? 'Destroy Object' : 'Destruir Objeto'}
          </Button>
          
          <Button onClick={() => addMemoryOperation('placement new', true)}>
            {state.language === 'en' ? 'Replace Object' : 'Reemplazar Objeto'}
          </Button>
          
          <Button onClick={toggleTrivialRelocatable}
                  style={{ background: lessonState.trivialRelocatable ? '#2ed573' : '#ff4757' }}>
            {state.language === 'en' ? 'Trivially Relocatable' : 'Trivialmente Reubicable'}: {lessonState.trivialRelocatable ? 'ON' : 'OFF'}
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
            <h4>{state.language === 'en' ? 'Lifetime Rules' : 'Reglas de Tiempo de Vida'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Objects have well-defined lifetime boundaries' : 'Objetos tienen límites de tiempo de vida bien definidos'}</li>
              <li>{state.language === 'en' ? 'Pointer validity tied to object lifetime' : 'Validez de punteros ligada al tiempo de vida del objeto'}</li>
              <li>{state.language === 'en' ? 'Const objects can be replaced via placement new' : 'Objetos const pueden ser reemplazados vía placement new'}</li>
              <li>{state.language === 'en' ? 'Virtual inheritance complicates construction order' : 'Herencia virtual complica orden de construcción'}</li>
              <li>{state.language === 'en' ? 'std::launder required for some pointer reuse' : 'std::launder requerido para algún reuso de punteros'}</li>
            </ul>

            <h4 style={{ marginTop: '20px' }}>{state.language === 'en' ? 'Current Scenario' : 'Escenario Actual'}</h4>
            <div style={{ 
              padding: '10px', 
              borderRadius: '5px', 
              background: 'rgba(0, 212, 255, 0.1)', 
              border: '1px solid #00d4ff'
            }}>
              <p><strong>{state.language === 'en' ? 'Type:' : 'Tipo:'}</strong> {lessonState.demonstrationType.replace('_', ' ')}</p>
              <p><strong>{state.language === 'en' ? 'Objects:' : 'Objetos:'}</strong> {lessonState.objectStates.filter(o => o.lifetime.valid).length} active</p>
              <p><strong>{state.language === 'en' ? 'Operations:' : 'Operaciones:'}</strong> {lessonState.memoryOperations.length}</p>
              {lessonState.demonstrationType === 'launder_cases' && (
                <p><strong>std::launder {state.language === 'en' ? 'needed:' : 'necesario:'}</strong> {lessonState.memoryOperations.some(op => op.needsLaunder) ? 'Yes' : 'No'}</p>
              )}
            </div>
          </div>
        </div>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🔍 Advanced Scenarios' : '🔍 Escenarios Avanzados'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '15px', background: 'rgba(46, 213, 115, 0.1)', border: '1px solid #2ed573', borderRadius: '8px' }}>
            <h4 style={{ color: '#2ed573' }}>{state.language === 'en' ? '⚡ Trivial Relocation' : '⚡ Reubicación Trivial'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Safe memcpy-based moves' : 'Movimientos seguros basados en memcpy'}</li>
              <li>{state.language === 'en' ? 'Vector reallocation optimization' : 'Optimización de realocación de vector'}</li>
              <li>{state.language === 'en' ? 'No destructor on source' : 'Sin destructor en origen'}</li>
              <li>{state.language === 'en' ? 'Significant performance gains' : 'Ganancias significativas de rendimiento'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(255, 164, 0, 0.1)', border: '1px solid #ffa500', borderRadius: '8px' }}>
            <h4 style={{ color: '#ffa500' }}>{state.language === 'en' ? '🔒 Const Objects' : '🔒 Objetos Const'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Replacement via placement new' : 'Reemplazo vía placement new'}</li>
              <li>{state.language === 'en' ? 'Thread-safe immutable access' : 'Acceso inmutable thread-safe'}</li>
              <li>{state.language === 'en' ? 'Mutable member exceptions' : 'Excepciones de miembros mutables'}</li>
              <li>{state.language === 'en' ? 'Const correctness preservation' : 'Preservación de const correctness'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '8px' }}>
            <h4 style={{ color: '#e74c3c' }}>{state.language === 'en' ? '🔗 Virtual Inheritance' : '🔗 Herencia Virtual'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Complex construction order' : 'Orden de construcción complejo'}</li>
              <li>{state.language === 'en' ? 'Most derived initializes virtual bases' : 'Más derivado inicializa bases virtuales'}</li>
              <li>{state.language === 'en' ? 'Address calculation complexity' : 'Complejidad de cálculo de direcciones'}</li>
              <li>{state.language === 'en' ? 'Performance overhead' : 'Sobrecarga de rendimiento'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(155, 89, 182, 0.1)', border: '1px solid #9b59b6', borderRadius: '8px' }}>
            <h4 style={{ color: '#9b59b6' }}>{state.language === 'en' ? '🔧 std::launder' : '🔧 std::launder'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Pointer validity after replacement' : 'Validez de punteros después del reemplazo'}</li>
              <li>{state.language === 'en' ? 'Required for const/reference members' : 'Requerido para miembros const/referencia'}</li>
              <li>{state.language === 'en' ? 'Virtual inheritance complications' : 'Complicaciones de herencia virtual'}</li>
              <li>{state.language === 'en' ? 'Alternative: use fresh pointers' : 'Alternativa: usar punteros frescos'}</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '💡 Best Practices Summary' : '💡 Resumen de Mejores Prácticas'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`// Object lifetime best practices summary

// 1. Prefer fresh pointers over std::launder when possible
template<typename T>
T* safe_object_replacement(void* buffer, T&& new_obj) {
    // Get pointer from placement new (always safe)
    return new(buffer) T(std::forward<T>(new_obj));
}

// 2. Use RAII for automatic lifetime management
template<typename T>
class LifetimeGuard {
    alignas(T) char buffer_[sizeof(T)];
    T* object_ = nullptr;
    
public:
    template<typename... Args>
    LifetimeGuard(Args&&... args) {
        object_ = new(buffer_) T(std::forward<Args>(args)...);
    }
    
    ~LifetimeGuard() {
        if (object_) {
            object_->~T();
        }
    }
    
    T& get() { return *object_; }
    const T& get() const { return *object_; }
};

// 3. Design for trivial relocation when possible
class TriviallyRelocatableDesign {
    std::unique_ptr<int[]> data_;  // Pointer to external resource
    size_t size_;
    
public:
    // Move constructor leaves source in valid state
    TriviallyRelocatableDesign(TriviallyRelocatableDesign&& other) noexcept
        : data_(std::move(other.data_)), size_(other.size_) {
        other.size_ = 0;
    }
    
    // No self-references or complex cleanup required
    ~TriviallyRelocatableDesign() = default;
};

// 4. Be cautious with virtual inheritance
class VirtualInheritanceBestPractices {
    // Prefer composition over virtual inheritance when possible
    struct Component { int value; };
    
    class Alternative {
        std::unique_ptr<Component> component_;
        
    public:
        Alternative() : component_(std::make_unique<Component>()) {}
        
        // Simpler lifetime management than virtual inheritance
        Component& get_component() { return *component_; }
    };
};

// 5. Document lifetime requirements clearly
template<typename T>
void process_with_lifetime_requirements(T* obj) {
    static_assert(std::is_trivially_destructible_v<T>,
                  "Object must be trivially destructible for this optimization");
    
    // Documentation: obj must remain valid throughout function
    // Implementation assumes no aliasing with other objects
    
    // Process object safely...
}`}
        </CodeBlock>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Object lifetime lesson. Current scenario: ${scenarios[lessonState.currentScenario].title}`}
      />
    </LessonLayout>
  );
};

export default Lesson68_ObjectLifetime;