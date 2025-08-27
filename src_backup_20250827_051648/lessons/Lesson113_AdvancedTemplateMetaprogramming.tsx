import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone, Line } from '@react-three/drei';
import { useApp } from '../context/AppContext';

interface MetaprogrammingMetrics {
  compilationComplexity: number;
  runtimePerformance: number;
  codeGeneration: number;
  typeChecking: number;
}

interface MetaprogrammingVisualizationProps {
  metrics: MetaprogrammingMetrics;
  activePattern: string;
  onPatternSelect: (pattern: string) => void;
}

const MetaprogrammingVisualization: React.FC<MetaprogrammingVisualizationProps> = ({ 
  metrics, 
  activePattern, 
  onPatternSelect 
}) => {
  const groupRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const patterns = [
    { name: 'SFINAE', position: [-4, 2, 0], color: '#e74c3c', complexity: 0.9 },
    { name: 'Concepts', position: [-2, 2, 0], color: '#3498db', complexity: 0.7 },
    { name: 'Specialization', position: [0, 2, 0], color: '#2ecc71', complexity: 0.8 },
    { name: 'CRTP', position: [2, 2, 0], color: '#f39c12', complexity: 0.75 },
    { name: 'Variadic', position: [4, 2, 0], color: '#9b59b6', complexity: 0.85 },
    { name: 'Metafunction', position: [-2, -1, 0], color: '#e67e22', complexity: 0.95 },
    { name: 'Type Traits', position: [2, -1, 0], color: '#1abc9c', complexity: 0.6 }
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
            position={[pattern.position[0], pattern.position[1] - 1.0, pattern.position[2]]}
            fontSize={0.2}
            color="#333"
            anchorX="center"
            anchorY="middle"
          >
            {pattern.name}
          </Text>
          
          {/* Complexity indicator */}
          <Cone
            position={[pattern.position[0], pattern.position[1] + 1.0, pattern.position[2]]}
            args={[0.1 + (pattern.complexity * 0.2), 0.5, 8]}
          >
            <meshPhongMaterial 
              color={pattern.complexity > 0.8 ? '#e74c3c' : pattern.complexity > 0.6 ? '#f39c12' : '#2ecc71'}
              transparent
              opacity={0.8}
            />
          </Cone>
          
          {/* Connection lines for template relationships */}
          {index > 0 && (
            <Line
              points={[patterns[index - 1].position, pattern.position]}
              color="#bdc3c7"
              lineWidth={1}
              transparent
              opacity={0.4}
            />
          )}
        </group>
      ))}
      
      {/* Central template engine */}
      <Sphere position={[0, 0.5, 0]} args={[0.4]}>
        <meshPhongMaterial color="#34495e" transparent opacity={0.7} />
      </Sphere>
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.15}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Template Engine
      </Text>
    </group>
  );
};

const Lesson113_AdvancedTemplateMetaprogramming: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('sfinae-pointers');
  const [selectedPattern, setSelectedPattern] = useState<string>('SFINAE');
  const [metrics, setMetrics] = useState<MetaprogrammingMetrics>({
    compilationComplexity: 0.90,
    runtimePerformance: 0.95,
    codeGeneration: 0.85,
    typeChecking: 0.88
  });

  const examples = {
    'sfinae-pointers': {
      title: state.language === 'en' ? 'SFINAE with Pointer Types' : 'SFINAE con Tipos de Punteros',
      code: `#include <memory>
#include <type_traits>
#include <utility>
#include <iostream>

// Advanced SFINAE patterns for smart pointer metaprogramming
namespace sfinae_pointers {

// SFINAE detection for smart pointer types
template<typename T, typename = void>
struct is_smart_pointer : std::false_type {};

template<typename T>
struct is_smart_pointer<T, std::void_t<
    typename T::element_type,
    decltype(std::declval<T>().get()),
    decltype(std::declval<T>().reset())
>> : std::true_type {};

template<typename T>
inline constexpr bool is_smart_pointer_v = is_smart_pointer<T>::value;

// SFINAE detection for shared_ptr specifically
template<typename T, typename = void>
struct is_shared_ptr : std::false_type {};

template<typename T>
struct is_shared_ptr<T, std::void_t<
    typename T::element_type,
    decltype(std::declval<T>().use_count()),
    std::enable_if_t<std::is_same_v<T, std::shared_ptr<typename T::element_type>>>
>> : std::true_type {};

template<typename T>
inline constexpr bool is_shared_ptr_v = is_shared_ptr<T>::value;

// SFINAE detection for unique_ptr
template<typename T, typename = void>
struct is_unique_ptr : std::false_type {};

template<typename T>
struct is_unique_ptr<T, std::void_t<
    typename T::element_type,
    typename T::deleter_type,
    decltype(std::declval<T>().release()),
    std::enable_if_t<std::is_same_v<T, std::unique_ptr<typename T::element_type, typename T::deleter_type>>>
>> : std::true_type {};

template<typename T>
inline constexpr bool is_unique_ptr_v = is_unique_ptr<T>::value;

// SFINAE-based function overloading
template<typename SmartPtr>
std::enable_if_t<is_shared_ptr_v<SmartPtr>, size_t>
get_reference_count(const SmartPtr& ptr) {
    return ptr.use_count();
}

template<typename SmartPtr>
std::enable_if_t<is_unique_ptr_v<SmartPtr>, size_t>
get_reference_count(const SmartPtr& ptr) {
    return ptr ? 1 : 0;
}

template<typename T>
std::enable_if_t<std::is_pointer_v<T>, size_t>
get_reference_count(T ptr) {
    return ptr ? 1 : 0; // Raw pointers don't have reference counting
}

// Advanced SFINAE for method detection
template<typename T, typename = void>
struct has_custom_deleter : std::false_type {};

template<typename T>
struct has_custom_deleter<T, std::void_t<
    typename T::deleter_type,
    decltype(std::declval<T>().get_deleter())
>> : std::true_type {};

template<typename T>
inline constexpr bool has_custom_deleter_v = has_custom_deleter<T>::value;

// SFINAE-based conditional member access
template<typename SmartPtr>
class ConditionalAccess {
private:
    SmartPtr ptr_;
    
    template<typename T = SmartPtr>
    auto get_deleter_impl(int) -> std::enable_if_t<has_custom_deleter_v<T>, 
                                                   decltype(ptr_.get_deleter())> {
        return ptr_.get_deleter();
    }
    
    template<typename T = SmartPtr>
    auto get_deleter_impl(...) -> void {
        // No deleter available
    }
    
public:
    explicit ConditionalAccess(SmartPtr ptr) : ptr_(std::move(ptr)) {}
    
    auto get_deleter() {
        return get_deleter_impl<SmartPtr>(0);
    }
    
    template<typename T = SmartPtr>
    std::enable_if_t<is_shared_ptr_v<T>, bool>
    is_unique() const {
        return ptr_.use_count() == 1;
    }
    
    template<typename T = SmartPtr>
    std::enable_if_t<is_unique_ptr_v<T>, bool>
    is_unique() const {
        return static_cast<bool>(ptr_);
    }
    
    template<typename T = SmartPtr>
    std::enable_if_t<std::is_pointer_v<T>, bool>
    is_unique() const {
        return ptr_ != nullptr; // Raw pointers are always "unique"
    }
};

// SFINAE-based factory selection
template<typename T, typename... Args>
class SmartPointerFactory {
public:
    // Create shared_ptr if T supports it
    template<typename U = T>
    static std::enable_if_t<std::is_constructible_v<U, Args...>, std::shared_ptr<U>>
    create_shared(Args&&... args) {
        return std::make_shared<U>(std::forward<Args>(args)...);
    }
    
    // Create unique_ptr if T supports it
    template<typename U = T>
    static std::enable_if_t<std::is_constructible_v<U, Args...>, std::unique_ptr<U>>
    create_unique(Args&&... args) {
        return std::make_unique<U>(std::forward<Args>(args)...);
    }
    
    // Fallback to raw pointer
    template<typename U = T>
    static std::enable_if_t<std::is_constructible_v<U, Args...>, U*>
    create_raw(Args&&... args) {
        return new U(std::forward<Args>(args)...);
    }
    
    // Smart factory that chooses the best smart pointer type
    template<typename U = T>
    static auto create_best(Args&&... args) {
        if constexpr (std::is_move_constructible_v<U> && !std::is_copy_constructible_v<U>) {
            return create_unique<U>(std::forward<Args>(args)...);
        } else {
            return create_shared<U>(std::forward<Args>(args)...);
        }
    }
};

// SFINAE for operation availability
template<typename SmartPtr, typename = void>
struct supports_reset : std::false_type {};

template<typename SmartPtr>
struct supports_reset<SmartPtr, std::void_t<
    decltype(std::declval<SmartPtr>().reset())
>> : std::true_type {};

template<typename SmartPtr>
inline constexpr bool supports_reset_v = supports_reset<SmartPtr>::value;

template<typename SmartPtr, typename = void>
struct supports_release : std::false_type {};

template<typename SmartPtr>
struct supports_release<SmartPtr, std::void_t<
    decltype(std::declval<SmartPtr>().release())
>> : std::true_type {};

template<typename SmartPtr>
inline constexpr bool supports_release_v = supports_release<SmartPtr>::value;

// Universal smart pointer operations using SFINAE
template<typename SmartPtr>
class UniversalSmartPointerOps {
private:
    SmartPtr& ptr_;
    
public:
    explicit UniversalSmartPointerOps(SmartPtr& ptr) : ptr_(ptr) {}
    
    template<typename T = SmartPtr>
    std::enable_if_t<supports_reset_v<T>, void>
    safe_reset() {
        ptr_.reset();
    }
    
    template<typename T = SmartPtr>
    std::enable_if_t<!supports_reset_v<T>, void>
    safe_reset() {
        // Cannot reset this pointer type
        static_assert(supports_reset_v<T>, "Pointer type doesn't support reset");
    }
    
    template<typename T = SmartPtr>
    std::enable_if_t<supports_release_v<T>, typename T::pointer>
    safe_release() {
        return ptr_.release();
    }
    
    template<typename T = SmartPtr>
    std::enable_if_t<!supports_release_v<T>, void*>
    safe_release() {
        // Cannot release this pointer type
        return nullptr;
    }
    
    auto get_underlying_pointer() {
        if constexpr (is_smart_pointer_v<SmartPtr>) {
            return ptr_.get();
        } else if constexpr (std::is_pointer_v<SmartPtr>) {
            return ptr_;
        } else {
            return static_cast<void*>(nullptr);
        }
    }
};

} // namespace sfinae_pointers`
    },
    
    'concepts-constraints': {
      title: state.language === 'en' ? 'Concepts and Constraints for Pointers' : 'Conceptos y Restricciones para Punteros',
      code: `#include <concepts>
#include <memory>
#include <type_traits>

// C++20 Concepts for smart pointer constraints
namespace pointer_concepts {

// Basic pointer concept
template<typename T>
concept Pointer = std::is_pointer_v<T>;

// Smart pointer concept
template<typename T>
concept SmartPointer = requires(T t) {
    typename T::element_type;
    { t.get() } -> std::same_as<typename T::element_type*>;
    t.reset();
};

// Shared ownership concept
template<typename T>
concept SharedOwnership = SmartPointer<T> && requires(T t) {
    { t.use_count() } -> std::convertible_to<size_t>;
};

// Unique ownership concept
template<typename T>
concept UniqueOwnership = SmartPointer<T> && requires(T t) {
    typename T::deleter_type;
    { t.release() } -> std::same_as<typename T::element_type*>;
};

// Weak pointer concept
template<typename T>
concept WeakPointer = requires(T t) {
    typename T::element_type;
    { t.lock() } -> SharedOwnership;
    { t.expired() } -> std::same_as<bool>;
};

// Resettable pointer concept
template<typename T>
concept ResettablePointer = requires(T t) {
    t.reset();
    t.reset(std::declval<typename T::element_type*>());
};

// Observable pointer (can be observed without taking ownership)
template<typename T>
concept ObservablePointer = requires(T t) {
    { t.get() } -> std::convertible_to<const void*>;
} && !requires(T t) {
    t.reset(); // Observable pointers shouldn't be resettable
};

// Custom deleter support concept
template<typename T>
concept CustomDeleterSupport = SmartPointer<T> && requires(T t) {
    typename T::deleter_type;
    { t.get_deleter() } -> std::same_as<typename T::deleter_type&>;
};

// Constrained smart pointer operations
template<SmartPointer T>
class ConstrainedSmartPointer {
private:
    T ptr_;
    
public:
    explicit ConstrainedSmartPointer(T ptr) : ptr_(std::move(ptr)) {}
    
    // Only available for shared ownership pointers
    size_t use_count() const requires SharedOwnership<T> {
        return ptr_.use_count();
    }
    
    // Only available for unique ownership pointers
    auto release() requires UniqueOwnership<T> {
        return ptr_.release();
    }
    
    // Only available for resettable pointers
    void reset() requires ResettablePointer<T> {
        ptr_.reset();
    }
    
    template<typename U>
    void reset(U* new_ptr) requires ResettablePointer<T> && std::convertible_to<U*, typename T::element_type*> {
        ptr_.reset(new_ptr);
    }
    
    // Only available for pointers with custom deleter support
    auto& get_deleter() requires CustomDeleterSupport<T> {
        return ptr_.get_deleter();
    }
    
    // Universal get operation
    auto get() const {
        return ptr_.get();
    }
    
    // Safe dereference with concept checking
    auto& operator*() const requires requires { *ptr_.get(); } {
        return *ptr_;
    }
    
    auto operator->() const requires requires { ptr_.get(); } {
        return ptr_.get();
    }
    
    // Conversion to bool
    explicit operator bool() const {
        return static_cast<bool>(ptr_);
    }
};

// Factory with concept constraints
template<typename T>
class ConceptConstrainedFactory {
public:
    // Create shared pointer only for types that support shared ownership
    template<typename... Args>
    static std::shared_ptr<T> create_shared(Args&&... args) 
        requires std::constructible_from<T, Args...> {
        return std::make_shared<T>(std::forward<Args>(args)...);
    }
    
    // Create unique pointer only for types that support unique ownership
    template<typename... Args>
    static std::unique_ptr<T> create_unique(Args&&... args)
        requires std::constructible_from<T, Args...> {
        return std::make_unique<T>(std::forward<Args>(args)...);
    }
    
    // Create with custom deleter
    template<typename Deleter, typename... Args>
    static std::unique_ptr<T, Deleter> create_unique_with_deleter(Deleter del, Args&&... args)
        requires std::constructible_from<T, Args...> && std::invocable<Deleter, T*> {
        return std::unique_ptr<T, Deleter>(new T(std::forward<Args>(args)...), std::move(del));
    }
};

// Concept-based algorithm selection
template<SmartPointer T>
void optimize_for_shared_ownership(T& ptr) requires SharedOwnership<T> {
    // Optimizations specific to shared ownership
    if (ptr.use_count() == 1) {
        // Can perform unique ownership optimizations
        std::cout << "Optimizing for unique access in shared pointer\\n";
    }
}

template<SmartPointer T>
void optimize_for_unique_ownership(T& ptr) requires UniqueOwnership<T> {
    // Optimizations specific to unique ownership
    std::cout << "Optimizing for unique ownership\\n";
    // Could potentially transfer ownership without copying
}

// Generic optimization dispatcher
template<SmartPointer T>
void optimize_pointer(T& ptr) {
    if constexpr (SharedOwnership<T>) {
        optimize_for_shared_ownership(ptr);
    } else if constexpr (UniqueOwnership<T>) {
        optimize_for_unique_ownership(ptr);
    }
}

// Concept-based polymorphic wrapper
template<SmartPointer T>
class PolymorphicSmartPointer {
private:
    T ptr_;
    
public:
    using element_type = typename T::element_type;
    
    explicit PolymorphicSmartPointer(T ptr) : ptr_(std::move(ptr)) {}
    
    element_type* get() const { return ptr_.get(); }
    element_type& operator*() const { return *ptr_; }
    element_type* operator->() const { return ptr_.get(); }
    explicit operator bool() const { return static_cast<bool>(ptr_); }
    
    // Conditional methods based on concepts
    template<SmartPointer U = T>
    size_t use_count() const requires SharedOwnership<U> {
        return ptr_.use_count();
    }
    
    template<SmartPointer U = T>
    bool unique() const requires SharedOwnership<U> {
        return ptr_.use_count() == 1;
    }
    
    template<SmartPointer U = T>
    auto release() requires UniqueOwnership<U> {
        return ptr_.release();
    }
    
    void reset() requires ResettablePointer<T> {
        ptr_.reset();
    }
    
    template<typename U>
    void reset(U* new_ptr) requires ResettablePointer<T> && std::convertible_to<U*, element_type*> {
        ptr_.reset(new_ptr);
    }
};

// Advanced concept composition
template<typename T>
concept MoveOnlySmartPointer = SmartPointer<T> && 
                               std::move_constructible<T> && 
                               !std::copy_constructible<T>;

template<typename T>
concept CopyableSmartPointer = SmartPointer<T> && 
                               std::copy_constructible<T>;

template<typename T>
concept ThreadSafeSmartPointer = SmartPointer<T> && 
                                 requires(T t) {
                                     { t.use_count() } -> std::same_as<long>; // atomic operation
                                 };

// Concept-based template specialization
template<SmartPointer T>
struct PointerTraits {
    static constexpr bool is_shared = SharedOwnership<T>;
    static constexpr bool is_unique = UniqueOwnership<T>;
    static constexpr bool is_weak = WeakPointer<T>;
    static constexpr bool has_custom_deleter = CustomDeleterSupport<T>;
    static constexpr bool is_move_only = MoveOnlySmartPointer<T>;
    static constexpr bool is_copyable = CopyableSmartPointer<T>;
    static constexpr bool is_thread_safe = ThreadSafeSmartPointer<T>;
    
    using element_type = typename T::element_type;
    using pointer_type = element_type*;
};

// Concept-constrained algorithms
template<SharedOwnership T, SharedOwnership U>
    requires std::same_as<typename T::element_type, typename U::element_type>
bool share_same_object(const T& ptr1, const U& ptr2) {
    return ptr1.get() == ptr2.get();
}

template<UniqueOwnership T>
auto transfer_ownership(T& from) {
    return std::move(from);
}

template<WeakPointer T>
bool is_expired(const T& weak_ptr) {
    return weak_ptr.expired();
}

template<WeakPointer T>
auto try_lock(const T& weak_ptr) -> decltype(weak_ptr.lock()) {
    return weak_ptr.lock();
}

} // namespace pointer_concepts`
    },
    
    'template-specialization': {
      title: state.language === 'en' ? 'Template Specialization Patterns' : 'Patrones de Especialización de Templates',
      code: `#include <memory>
#include <type_traits>
#include <utility>
#include <iostream>

// Advanced template specialization patterns for smart pointers
namespace specialization_patterns {

// Primary template for pointer operations
template<typename T>
struct PointerOperations {
    static void print_info(const T& ptr) {
        std::cout << "Generic pointer type\\n";
    }
    
    static size_t get_size_estimate(const T& ptr) {
        return sizeof(T);
    }
    
    static bool is_null(const T& ptr) {
        return false; // Conservative default
    }
};

// Full specialization for shared_ptr
template<typename T>
struct PointerOperations<std::shared_ptr<T>> {
    static void print_info(const std::shared_ptr<T>& ptr) {
        std::cout << "shared_ptr with use_count: " << ptr.use_count() << "\\n";
    }
    
    static size_t get_size_estimate(const std::shared_ptr<T>& ptr) {
        return sizeof(std::shared_ptr<T>) + (ptr ? sizeof(T) : 0);
    }
    
    static bool is_null(const std::shared_ptr<T>& ptr) {
        return !ptr;
    }
    
    // Specialized methods only for shared_ptr
    static bool is_unique(const std::shared_ptr<T>& ptr) {
        return ptr.use_count() == 1;
    }
    
    static size_t reference_count(const std::shared_ptr<T>& ptr) {
        return ptr.use_count();
    }
};

// Full specialization for unique_ptr
template<typename T, typename Deleter>
struct PointerOperations<std::unique_ptr<T, Deleter>> {
    using unique_ptr_type = std::unique_ptr<T, Deleter>;
    
    static void print_info(const unique_ptr_type& ptr) {
        std::cout << "unique_ptr with custom deleter\\n";
    }
    
    static size_t get_size_estimate(const unique_ptr_type& ptr) {
        return sizeof(unique_ptr_type) + (ptr ? sizeof(T) : 0);
    }
    
    static bool is_null(const unique_ptr_type& ptr) {
        return !ptr;
    }
    
    // Specialized methods only for unique_ptr
    static bool can_release(const unique_ptr_type& ptr) {
        return static_cast<bool>(ptr);
    }
    
    static const Deleter& get_deleter(const unique_ptr_type& ptr) {
        return ptr.get_deleter();
    }
};

// Partial specialization for unique_ptr with default deleter
template<typename T>
struct PointerOperations<std::unique_ptr<T>> {
    using unique_ptr_type = std::unique_ptr<T>;
    
    static void print_info(const unique_ptr_type& ptr) {
        std::cout << "unique_ptr with default deleter\\n";
    }
    
    static size_t get_size_estimate(const unique_ptr_type& ptr) {
        return sizeof(unique_ptr_type) + (ptr ? sizeof(T) : 0);
    }
    
    static bool is_null(const unique_ptr_type& ptr) {
        return !ptr;
    }
    
    static bool is_default_deleter() {
        return true;
    }
};

// Specialization for weak_ptr
template<typename T>
struct PointerOperations<std::weak_ptr<T>> {
    static void print_info(const std::weak_ptr<T>& ptr) {
        std::cout << "weak_ptr, expired: " << ptr.expired() << "\\n";
    }
    
    static size_t get_size_estimate(const std::weak_ptr<T>& ptr) {
        return sizeof(std::weak_ptr<T>);
    }
    
    static bool is_null(const std::weak_ptr<T>& ptr) {
        return ptr.expired();
    }
    
    static bool is_expired(const std::weak_ptr<T>& ptr) {
        return ptr.expired();
    }
    
    static auto try_lock(const std::weak_ptr<T>& ptr) {
        return ptr.lock();
    }
};

// Specialization for raw pointers
template<typename T>
struct PointerOperations<T*> {
    static void print_info(T* ptr) {
        std::cout << "Raw pointer: " << static_cast<void*>(ptr) << "\\n";
    }
    
    static size_t get_size_estimate(T* ptr) {
        return sizeof(T*) + (ptr ? sizeof(T) : 0);
    }
    
    static bool is_null(T* ptr) {
        return ptr == nullptr;
    }
    
    // Raw pointer specific operations
    static bool is_aligned(T* ptr) {
        return reinterpret_cast<uintptr_t>(ptr) % alignof(T) == 0;
    }
};

// CRTP base for specialized pointer behaviors
template<typename Derived, typename PointerType>
class SpecializedPointerBase {
protected:
    PointerType ptr_;
    
public:
    explicit SpecializedPointerBase(PointerType ptr) : ptr_(std::move(ptr)) {}
    
    // CRTP interface
    void perform_specialized_operation() {
        static_cast<Derived*>(this)->perform_specialized_operation_impl();
    }
    
    auto get_specialized_info() {
        return static_cast<Derived*>(this)->get_specialized_info_impl();
    }
    
    const PointerType& get_pointer() const { return ptr_; }
    PointerType& get_pointer() { return ptr_; }
};

// Specialized derived class for shared_ptr
template<typename T>
class SharedPointerWrapper : public SpecializedPointerBase<SharedPointerWrapper<T>, std::shared_ptr<T>> {
    using Base = SpecializedPointerBase<SharedPointerWrapper<T>, std::shared_ptr<T>>;
    
public:
    explicit SharedPointerWrapper(std::shared_ptr<T> ptr) : Base(std::move(ptr)) {}
    
    void perform_specialized_operation_impl() {
        if (this->ptr_.use_count() == 1) {
            std::cout << "Performing unique operation on shared_ptr\\n";
        } else {
            std::cout << "Performing shared operation on shared_ptr\\n";
        }
    }
    
    struct SharedInfo {
        size_t use_count;
        bool is_unique;
        T* raw_ptr;
    };
    
    SharedInfo get_specialized_info_impl() {
        return {this->ptr_.use_count(), this->ptr_.use_count() == 1, this->ptr_.get()};
    }
    
    // Shared-specific operations
    bool try_make_unique() {
        return this->ptr_.use_count() == 1;
    }
    
    void reset_if_unique() {
        if (this->ptr_.use_count() == 1) {
            this->ptr_.reset();
        }
    }
};

// Specialized derived class for unique_ptr
template<typename T, typename Deleter = std::default_delete<T>>
class UniquePointerWrapper : public SpecializedPointerBase<UniquePointerWrapper<T, Deleter>, std::unique_ptr<T, Deleter>> {
    using Base = SpecializedPointerBase<UniquePointerWrapper<T, Deleter>, std::unique_ptr<T, Deleter>>;
    
public:
    explicit UniquePointerWrapper(std::unique_ptr<T, Deleter> ptr) : Base(std::move(ptr)) {}
    
    void perform_specialized_operation_impl() {
        std::cout << "Performing unique ownership operation\\n";
    }
    
    struct UniqueInfo {
        bool has_value;
        T* raw_ptr;
        bool has_custom_deleter;
    };
    
    UniqueInfo get_specialized_info_impl() {
        return {
            static_cast<bool>(this->ptr_), 
            this->ptr_.get(),
            !std::is_same_v<Deleter, std::default_delete<T>>
        };
    }
    
    // Unique-specific operations
    T* release() {
        return this->ptr_.release();
    }
    
    const Deleter& get_deleter() {
        return this->ptr_.get_deleter();
    }
};

// Template specialization for different allocator types
template<typename T, typename Allocator>
struct AllocatorAwareDeleter {
    Allocator alloc;
    
    explicit AllocatorAwareDeleter(const Allocator& a) : alloc(a) {}
    
    void operator()(T* ptr) {
        if (ptr) {
            std::allocator_traits<Allocator>::destroy(alloc, ptr);
            std::allocator_traits<Allocator>::deallocate(alloc, ptr, 1);
        }
    }
};

// Factory with specialized creation strategies
template<typename T>
class SpecializationAwareFactory {
public:
    // General case: use make_shared
    template<typename U = T, typename... Args>
    static std::enable_if_t<std::is_constructible_v<U, Args...> && 
                           !std::is_array_v<U>, 
                           std::shared_ptr<U>>
    create(Args&&... args) {
        return std::make_shared<U>(std::forward<Args>(args)...);
    }
    
    // Specialization for arrays
    template<typename U = T>
    static std::enable_if_t<std::is_array_v<U>, std::shared_ptr<U>>
    create(size_t size) {
        return std::shared_ptr<U>(new std::remove_extent_t<U>[size]);
    }
    
    // Specialization for non-constructible types (must use placement new)
    template<typename U = T, typename... Args>
    static std::enable_if_t<!std::is_constructible_v<U, Args...> && 
                           std::is_default_constructible_v<U>,
                           std::shared_ptr<U>>
    create(Args&&...) {
        auto ptr = std::shared_ptr<U>(new U);
        // Would need custom initialization logic here
        return ptr;
    }
    
    // Specialization with custom allocator
    template<typename Allocator, typename... Args>
    static std::shared_ptr<T> create_with_allocator(const Allocator& alloc, Args&&... args) {
        using AllocTraits = std::allocator_traits<Allocator>;
        
        Allocator local_alloc = alloc;
        T* ptr = AllocTraits::allocate(local_alloc, 1);
        
        try {
            AllocTraits::construct(local_alloc, ptr, std::forward<Args>(args)...);
            return std::shared_ptr<T>(ptr, AllocatorAwareDeleter<T, Allocator>(local_alloc));
        } catch (...) {
            AllocTraits::deallocate(local_alloc, ptr, 1);
            throw;
        }
    }
};

// Meta-function to select best pointer type based on characteristics
template<typename T, bool RequiresSharing = false, bool RequiresCustomDeleter = false>
struct BestPointerType {
    using type = std::conditional_t<
        RequiresSharing,
        std::shared_ptr<T>,
        std::conditional_t<
            RequiresCustomDeleter,
            std::unique_ptr<T, std::function<void(T*)>>,
            std::unique_ptr<T>
        >
    >;
};

template<typename T, bool RequiresSharing = false, bool RequiresCustomDeleter = false>
using best_pointer_t = typename BestPointerType<T, RequiresSharing, RequiresCustomDeleter>::type;

// Compile-time pointer type analysis
template<typename T>
struct PointerAnalysis {
    static constexpr bool is_smart_pointer = 
        std::is_same_v<T, std::shared_ptr<typename T::element_type>> ||
        std::is_same_v<T, std::unique_ptr<typename T::element_type>> ||
        std::is_same_v<T, std::weak_ptr<typename T::element_type>>;
    
    static constexpr bool is_shared = 
        std::is_same_v<T, std::shared_ptr<typename T::element_type>>;
    
    static constexpr bool is_unique = 
        std::is_same_v<T, std::unique_ptr<typename T::element_type>>;
    
    static constexpr bool is_weak = 
        std::is_same_v<T, std::weak_ptr<typename T::element_type>>;
    
    static constexpr bool is_raw_pointer = std::is_pointer_v<T>;
    
    static constexpr bool supports_reference_counting = is_shared || is_weak;
    static constexpr bool supports_ownership_transfer = is_unique;
    static constexpr bool supports_observation_only = is_weak;
};

} // namespace specialization_patterns`
    },
    
    'compile-time-analysis': {
      title: state.language === 'en' ? 'Compile-time Pointer Analysis' : 'Análisis de Punteros en Tiempo de Compilación',
      code: `#include <memory>
#include <type_traits>
#include <utility>
#include <tuple>

// Compile-time analysis and optimization for pointer types
namespace compile_time_analysis {

// Compile-time pointer categorization
template<typename T>
struct PointerCategory {
    static constexpr bool is_raw_pointer = std::is_pointer_v<T>;
    static constexpr bool is_smart_pointer = requires {
        typename T::element_type;
        std::declval<T>().get();
    };
    static constexpr bool is_shared_ptr = false;
    static constexpr bool is_unique_ptr = false;
    static constexpr bool is_weak_ptr = false;
};

template<typename T>
struct PointerCategory<std::shared_ptr<T>> {
    static constexpr bool is_raw_pointer = false;
    static constexpr bool is_smart_pointer = true;
    static constexpr bool is_shared_ptr = true;
    static constexpr bool is_unique_ptr = false;
    static constexpr bool is_weak_ptr = false;
    using element_type = T;
};

template<typename T, typename D>
struct PointerCategory<std::unique_ptr<T, D>> {
    static constexpr bool is_raw_pointer = false;
    static constexpr bool is_smart_pointer = true;
    static constexpr bool is_shared_ptr = false;
    static constexpr bool is_unique_ptr = true;
    static constexpr bool is_weak_ptr = false;
    using element_type = T;
    using deleter_type = D;
};

template<typename T>
struct PointerCategory<std::weak_ptr<T>> {
    static constexpr bool is_raw_pointer = false;
    static constexpr bool is_smart_pointer = true;
    static constexpr bool is_shared_ptr = false;
    static constexpr bool is_unique_ptr = false;
    static constexpr bool is_weak_ptr = true;
    using element_type = T;
};

template<typename T>
struct PointerCategory<T*> {
    static constexpr bool is_raw_pointer = true;
    static constexpr bool is_smart_pointer = false;
    static constexpr bool is_shared_ptr = false;
    static constexpr bool is_unique_ptr = false;
    static constexpr bool is_weak_ptr = false;
    using element_type = T;
};

// Compile-time pointer compatibility checking
template<typename From, typename To>
struct PointerCompatibility {
    using from_category = PointerCategory<From>;
    using to_category = PointerCategory<To>;
    
    static constexpr bool can_convert = 
        std::is_convertible_v<typename from_category::element_type*, 
                             typename to_category::element_type*>;
    
    static constexpr bool is_safe_conversion = 
        can_convert && 
        !(from_category::is_unique_ptr && to_category::is_shared_ptr); // Avoid accidental sharing
    
    static constexpr bool requires_move = 
        from_category::is_unique_ptr && to_category::is_unique_ptr;
    
    static constexpr bool requires_lock = 
        from_category::is_weak_ptr && !to_category::is_weak_ptr;
};

// Compile-time optimization selection
template<typename T>
struct OptimizationTraits {
    using category = PointerCategory<T>;
    
    static constexpr bool can_optimize_for_single_owner = 
        category::is_unique_ptr || 
        (category::is_shared_ptr && std::is_final_v<typename category::element_type>);
    
    static constexpr bool can_use_intrusive_ptr = 
        category::is_shared_ptr && 
        std::is_base_of_v<std::enable_shared_from_this<typename category::element_type>, 
                         typename category::element_type>;
    
    static constexpr bool benefits_from_pooling = 
        sizeof(typename category::element_type) <= 256 && 
        std::is_trivially_destructible_v<typename category::element_type>;
    
    static constexpr size_t alignment_requirement = alignof(typename category::element_type);
    static constexpr bool needs_custom_alignment = alignment_requirement > alignof(std::max_align_t);
};

// Compile-time memory layout analysis
template<typename... Pointers>
struct MemoryLayoutAnalyzer {
    static constexpr size_t pointer_count = sizeof...(Pointers);
    static constexpr size_t total_size = (sizeof(Pointers) + ...);
    
    using size_tuple = std::tuple<std::integral_constant<size_t, sizeof(Pointers)>...>;
    using alignment_tuple = std::tuple<std::integral_constant<size_t, alignof(Pointers)>...>;
    
    static constexpr size_t max_alignment = std::max({alignof(Pointers)...});
    static constexpr size_t min_size = std::min({sizeof(Pointers)...});
    static constexpr size_t max_size = std::max({sizeof(Pointers)...});
    
    // Calculate optimal packing
    template<size_t Index = 0>
    static constexpr size_t calculate_packed_size() {
        if constexpr (Index >= sizeof...(Pointers)) {
            return 0;
        } else {
            using current_type = std::tuple_element_t<Index, std::tuple<Pointers...>>;
            constexpr size_t current_size = sizeof(current_type);
            constexpr size_t current_alignment = alignof(current_type);
            constexpr size_t aligned_offset = (calculate_packed_size<Index + 1>() + current_alignment - 1) 
                                            & ~(current_alignment - 1);
            return aligned_offset + current_size;
        }
    }
    
    static constexpr size_t packed_size = calculate_packed_size();
    static constexpr double packing_efficiency = static_cast<double>(total_size) / packed_size;
};

// Compile-time code generation for pointer operations
template<typename T>
struct PointerOperationGenerator {
    using category = PointerCategory<T>;
    
    // Generate optimal get() implementation
    static constexpr auto generate_get() {
        if constexpr (category::is_smart_pointer) {
            return [](const T& ptr) { return ptr.get(); };
        } else if constexpr (category::is_raw_pointer) {
            return [](const T& ptr) { return ptr; };
        } else {
            return [](const T&) -> void* { return nullptr; };
        }
    }
    
    // Generate optimal reset() implementation
    static constexpr auto generate_reset() {
        if constexpr (category::is_unique_ptr || category::is_shared_ptr) {
            return [](T& ptr) { ptr.reset(); };
        } else {
            return [](T& ptr) {
                if constexpr (category::is_raw_pointer) {
                    ptr = nullptr;
                } else {
                    static_assert(category::is_smart_pointer, "Cannot reset this pointer type");
                }
            };
        }
    }
    
    // Generate optimal reference count implementation
    static constexpr auto generate_use_count() {
        if constexpr (category::is_shared_ptr) {
            return [](const T& ptr) { return ptr.use_count(); };
        } else if constexpr (category::is_unique_ptr) {
            return [](const T& ptr) -> size_t { return ptr ? 1 : 0; };
        } else if constexpr (category::is_raw_pointer) {
            return [](const T& ptr) -> size_t { return ptr ? 1 : 0; };
        } else {
            return [](const T&) -> size_t { return 0; };
        }
    }
};

// Compile-time algorithm selection based on pointer properties
template<typename Container>
struct AlgorithmSelector {
    using value_type = typename Container::value_type;
    using category = PointerCategory<value_type>;
    
    // Select optimal find algorithm
    static constexpr auto select_find_algorithm() {
        if constexpr (category::is_raw_pointer) {
            return [](const Container& container, const value_type& value) {
                return std::find(container.begin(), container.end(), value);
            };
        } else if constexpr (category::is_smart_pointer) {
            return [](const Container& container, const typename category::element_type* raw_ptr) {
                return std::find_if(container.begin(), container.end(),
                    [raw_ptr](const value_type& ptr) { return ptr.get() == raw_ptr; });
            };
        } else {
            return [](const Container& container, const value_type& value) {
                return container.end(); // Default: not found
            };
        }
    }
    
    // Select optimal cleanup algorithm
    static constexpr auto select_cleanup_algorithm() {
        if constexpr (category::is_unique_ptr) {
            return [](Container& container) {
                container.clear(); // Automatic cleanup
            };
        } else if constexpr (category::is_shared_ptr) {
            return [](Container& container) {
                container.erase(
                    std::remove_if(container.begin(), container.end(),
                        [](const value_type& ptr) { return ptr.use_count() <= 1; }),
                    container.end()
                );
            };
        } else if constexpr (category::is_weak_ptr) {
            return [](Container& container) {
                container.erase(
                    std::remove_if(container.begin(), container.end(),
                        [](const value_type& ptr) { return ptr.expired(); }),
                    container.end()
                );
            };
        } else {
            return [](Container& container) {
                container.clear();
            };
        }
    }
};

// Compile-time performance estimator
template<typename T>
struct PerformanceEstimator {
    using category = PointerCategory<T>;
    
    static constexpr int get_cost = category::is_smart_pointer ? 1 : 0;
    static constexpr int reset_cost = category::is_shared_ptr ? 3 : category::is_unique_ptr ? 2 : 1;
    static constexpr int copy_cost = category::is_shared_ptr ? 2 : category::is_unique_ptr ? 100 : 1; // unique_ptr can't be copied
    static constexpr int move_cost = 1; // Move is always cheap
    
    static constexpr int memory_overhead = 
        category::is_shared_ptr ? sizeof(void*) * 2 : // control block pointer
        category::is_unique_ptr ? sizeof(void*) : // just the pointer
        category::is_raw_pointer ? 0 : // no overhead
        sizeof(void*); // default case
    
    static constexpr bool is_cache_friendly = sizeof(T) <= 64; // fits in cache line
    static constexpr bool has_indirection = category::is_smart_pointer || category::is_raw_pointer;
    
    // Overall performance score (higher is better)
    static constexpr int performance_score = 
        (is_cache_friendly ? 10 : 0) +
        (has_indirection ? -5 : 0) +
        (memory_overhead == 0 ? 15 : memory_overhead <= sizeof(void*) ? 10 : 5) +
        (category::is_unique_ptr ? 20 : category::is_shared_ptr ? 10 : category::is_raw_pointer ? 25 : 0);
};

// Compile-time validation and static assertions
template<typename T>
struct PointerValidator {
    using category = PointerCategory<T>;
    
    static_assert(category::is_raw_pointer || category::is_smart_pointer, 
                  "Type must be a pointer type");
    
    static_assert(!category::is_raw_pointer || std::is_pointer_v<T>,
                  "Raw pointer category mismatch");
    
    static_assert(!category::is_smart_pointer || requires { typename T::element_type; },
                  "Smart pointer must have element_type");
    
    // Validate that smart pointers have required operations
    static_assert(!category::is_shared_ptr || requires(T t) { t.use_count(); },
                  "shared_ptr must support use_count()");
    
    static_assert(!category::is_unique_ptr || requires(T t) { t.release(); },
                  "unique_ptr must support release()");
    
    static_assert(!category::is_weak_ptr || requires(T t) { t.expired(); t.lock(); },
                  "weak_ptr must support expired() and lock()");
    
    // Performance warnings
    static_assert(PerformanceEstimator<T>::performance_score >= 0,
                  "Warning: This pointer type may have poor performance characteristics");
    
    static constexpr bool validation_passed = true;
};

} // namespace compile_time_analysis`
    }
  };

  const currentExample = examples[activeExample as keyof typeof examples];

  const handlePatternSelect = (pattern: string) => {
    setSelectedPattern(pattern);
    
    // Update metrics based on selected pattern
    const patternMetrics: { [key: string]: MetaprogrammingMetrics } = {
      'SFINAE': { compilationComplexity: 0.90, runtimePerformance: 0.95, codeGeneration: 0.85, typeChecking: 0.88 },
      'Concepts': { compilationComplexity: 0.70, runtimePerformance: 0.98, codeGeneration: 0.90, typeChecking: 0.95 },
      'Specialization': { compilationComplexity: 0.80, runtimePerformance: 0.90, codeGeneration: 0.95, typeChecking: 0.85 },
      'CRTP': { compilationComplexity: 0.75, runtimePerformance: 0.98, codeGeneration: 0.80, typeChecking: 0.82 },
      'Variadic': { compilationComplexity: 0.85, runtimePerformance: 0.88, codeGeneration: 0.92, typeChecking: 0.80 },
      'Metafunction': { compilationComplexity: 0.95, runtimePerformance: 0.85, codeGeneration: 0.98, typeChecking: 0.90 },
      'Type Traits': { compilationComplexity: 0.60, runtimePerformance: 0.92, codeGeneration: 0.75, typeChecking: 0.95 }
    };
    
    if (patternMetrics[pattern]) {
      setMetrics(patternMetrics[pattern]);
    }
  };

  return (
    <div className="lesson-container">
      <header className="lesson-header">
        <h1>{state.language === 'en' ? 'Lesson 113: Advanced Template Metaprogramming' : 'Lección 113: Metaprogramación Avanzada de Templates'}</h1>
        <p className="lesson-description">
          {state.language === 'en' 
            ? 'Master advanced template metaprogramming techniques including SFINAE with pointer types, C++20 concepts and constraints, template specialization patterns, and compile-time pointer analysis.'
            : 'Domina técnicas avanzadas de metaprogramación de templates incluyendo SFINAE con tipos de punteros, conceptos y restricciones de C++20, patrones de especialización de templates y análisis de punteros en tiempo de compilación.'}
        </p>
      </header>

      <div className="lesson-content">
        <div className="visualization-section">
          <h3>{state.language === 'en' ? 'Metaprogramming Patterns Visualization' : 'Visualización de Patrones de Metaprogramación'}</h3>
          <div className="canvas-container" style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '20px' }}>
            <Canvas camera={{ position: [8, 5, 8] }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />
              <MetaprogrammingVisualization 
                metrics={metrics}
                activePattern={selectedPattern}
                onPatternSelect={handlePatternSelect}
              />
            </Canvas>
          </div>
          
          <div className="pattern-info">
            <h4>{state.language === 'en' ? 'Pattern Metrics' : 'Métricas de Patrones'}</h4>
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Compilation Complexity' : 'Complejidad de Compilación'}:</span>
                <span className="metric-value">{(metrics.compilationComplexity * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Runtime Performance' : 'Rendimiento en Tiempo de Ejecución'}:</span>
                <span className="metric-value">{(metrics.runtimePerformance * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Code Generation' : 'Generación de Código'}:</span>
                <span className="metric-value">{(metrics.codeGeneration * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Type Checking' : 'Verificación de Tipos'}:</span>
                <span className="metric-value">{(metrics.typeChecking * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="selected-pattern">
              <strong>{state.language === 'en' ? 'Selected Pattern:' : 'Patrón Seleccionado:'}</strong> {selectedPattern}
            </div>
          </div>
        </div>

        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Metaprogramming Examples' : 'Ejemplos de Metaprogramación'}</h3>
          
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
              <h4>{state.language === 'en' ? 'SFINAE Techniques' : 'Técnicas SFINAE'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Smart pointer type detection' : 'Detección de tipos de smart pointers'}</li>
                <li>{state.language === 'en' ? 'Method availability checking' : 'Verificación de disponibilidad de métodos'}</li>
                <li>{state.language === 'en' ? 'Conditional function overloading' : 'Sobrecarga condicional de funciones'}</li>
                <li>{state.language === 'en' ? 'Custom deleter detection' : 'Detección de deleters personalizados'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'C++20 Concepts' : 'Conceptos de C++20'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Smart pointer concepts' : 'Conceptos de smart pointers'}</li>
                <li>{state.language === 'en' ? 'Ownership model constraints' : 'Restricciones de modelos de propiedad'}</li>
                <li>{state.language === 'en' ? 'Concept-based template specialization' : 'Especialización de templates basada en conceptos'}</li>
                <li>{state.language === 'en' ? 'Compile-time constraint checking' : 'Verificación de restricciones en tiempo de compilación'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Template Specialization' : 'Especialización de Templates'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Full specialization for specific pointer types' : 'Especialización completa para tipos específicos de punteros'}</li>
                <li>{state.language === 'en' ? 'Partial specialization patterns' : 'Patrones de especialización parcial'}</li>
                <li>{state.language === 'en' ? 'CRTP-based specialization' : 'Especialización basada en CRTP'}</li>
                <li>{state.language === 'en' ? 'Allocator-aware specializations' : 'Especializaciones conscientes de asignadores'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Compile-time Analysis' : 'Análisis en Tiempo de Compilación'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Pointer category classification' : 'Clasificación de categorías de punteros'}</li>
                <li>{state.language === 'en' ? 'Memory layout optimization' : 'Optimización de distribución de memoria'}</li>
                <li>{state.language === 'en' ? 'Performance characteristic estimation' : 'Estimación de características de rendimiento'}</li>
                <li>{state.language === 'en' ? 'Compile-time code generation' : 'Generación de código en tiempo de compilación'}</li>
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
          border-left: 4px solid #9b59b6;
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
          background: #e8f4f8;
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
          background: #9b59b6;
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
          border-left: 4px solid #9b59b6;
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

export default Lesson113_AdvancedTemplateMetaprogramming;