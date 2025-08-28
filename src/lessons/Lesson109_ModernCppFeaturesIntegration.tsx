import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Cone } from '@react-three/drei';
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



function ModernCppFeaturesVisualization() {
  const [featureStatus, setFeatureStatus] = useState({
    concepts: { active: false, complexity: 85, performance: 95 },
    ranges: { active: false, complexity: 75, performance: 88 },
    coroutines: { active: false, complexity: 95, performance: 92 },
    modules: { active: false, complexity: 70, performance: 90 },
    span: { active: false, complexity: 40, performance: 98 },
    metaprogramming: { active: false, complexity: 98, performance: 85 }
  });
  
  const [activeFeature, setActiveFeature] = useState('concepts');
  const [integrationLevel, setIntegrationLevel] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureStatus(prev => {
        const newStatus = { ...prev };
        Object.keys(newStatus).forEach(feature => {
          newStatus[feature].performance = Math.max(70, 
            newStatus[feature].performance + (Math.random() - 0.5) * 3);
        });
        return newStatus;
      });
      
      setIntegrationLevel(prev => (prev + 1) % 360);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    { name: 'concepts', pos: [-3, 2, 0], color: '#ff6b6b', label: 'Concepts C++20' },
    { name: 'ranges', pos: [-1, 2, 0], color: '#4ecdc4', label: 'Ranges/Views' },
    { name: 'coroutines', pos: [1, 2, 0], color: '#45b7d1', label: 'Coroutines' },
    { name: 'modules', pos: [3, 2, 0], color: '#96ceb4', label: 'Modules' },
    { name: 'span', pos: [-2, 0, 0], color: '#feca57', label: 'std::span' },
    { name: 'metaprogramming', pos: [2, 0, 0], color: '#ff9ff3', label: 'Meta C++23' }
  ];

  return (
    <group>
      {features.map((feature, index) => {
        const status = featureStatus[feature.name];
        const isActive = activeFeature === feature.name;
        const scale = isActive ? 1.3 : 1.0;
        const opacity = status.active ? 1.0 : 0.7;
        
        return (
          <group key={feature.name}>
            <Box
              position={feature.pos as [number, number, number]}
              args={[1.2, 0.8, 0.4]}
              scale={[scale, scale, scale]}
              onClick={() => setActiveFeature(feature.name)}
            >
              <meshStandardMaterial
                color={feature.color}
                opacity={opacity}
                transparent
                emissive={isActive ? feature.color : '#000000'}
                emissiveIntensity={isActive ? 0.2 : 0}
              />
            </Box>
            
            {/* Feature complexity indicator */}
            <Sphere
              position={[feature.pos[0], feature.pos[1] + 1.2, feature.pos[2]]}
              args={[0.1 + (status.complexity / 500)]}
            >
              <meshStandardMaterial
                color={status.complexity > 80 ? '#ff4757' : status.complexity > 60 ? '#ffa502' : '#2ed573'}
                opacity={0.8}
                transparent
              />
            </Sphere>
            
            <Text
              position={[feature.pos[0], feature.pos[1] - 1, feature.pos[2]]}
              fontSize={0.15}
              color="white"
              anchorX="center"
            >
              {feature.label}
            </Text>
            <Text
              position={[feature.pos[0], feature.pos[1] - 1.3, feature.pos[2]]}
              fontSize={0.12}
              color={feature.color}
              anchorX="center"
            >
              {`${status.performance.toFixed(0)}% Perf`}
            </Text>
          </group>
        );
      })}
      
      {/* Central integration core */}
      <Cone position={[0, -1.5, 0]} args={[1.5, 0.5]} rotation={[0, integrationLevel * Math.PI / 180, 0]}>
        <meshStandardMaterial color="#ffffff" opacity={0.3} transparent wireframe />
      </Cone>
      
      {/* Connection lines showing feature integration */}
      {features.map((feature, index) => (
        <mesh key={`connection-${index}`}>
          <cylinderGeometry args={[0.02, 0.02, 2.5]} />
          <meshStandardMaterial color={feature.color} opacity={0.4} transparent />
          <primitive object={(() => {
            const obj = new THREE.Object3D();
            obj.position.set(feature.pos[0] / 2, feature.pos[1] / 2 - 0.75, feature.pos[2] / 2);
            obj.lookAt(feature.pos[0], feature.pos[1], feature.pos[2]);
            obj.rotateX(Math.PI / 2);
            return obj;
          })()} />
        </mesh>
      ))}
      
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        Modern C++ Integration Hub
      </Text>
      
      <Text
        position={[0, -3, 0]}
        fontSize={0.25}
        color={featureStatus[activeFeature].complexity > 80 ? '#ff4757' : '#2ed573'}
        anchorX="center"
      >
        {`Active: ${activeFeature.toUpperCase()} (${featureStatus[activeFeature].complexity}% complexity)`}
      </Text>
    </group>
  );
}

export default function Lesson109_ModernCppFeaturesIntegration() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'Concepts and Constraints with Smart Pointers' : 'Concepts y Restricciones con Smart Pointers',
      code: `#include <concepts>
#include <memory>
#include <type_traits>
#include <utility>

// C++20 Concepts for smart pointer constraints
template<typename T>
concept SmartPointerLike = requires(T ptr) {
    typename T::element_type;
    { ptr.get() } -> std::convertible_to<typename T::element_type*>;
    { ptr.operator*() } -> std::convertible_to<typename T::element_type&>;
    { ptr.operator->() } -> std::convertible_to<typename T::element_type*>;
    { static_cast<bool>(ptr) } -> std::convertible_to<bool>;
};

template<typename T>
concept UniquePtrLike = SmartPointerLike<T> && requires(T ptr) {
    { ptr.release() } -> std::convertible_to<typename T::element_type*>;
    { ptr.reset() } -> std::same_as<void>;
    // Unique ownership - not copyable
    requires !std::copyable<T>;
    requires std::movable<T>;
};

template<typename T>
concept SharedPtrLike = SmartPointerLike<T> && requires(T ptr) {
    { ptr.use_count() } -> std::convertible_to<long>;
    { ptr.unique() } -> std::convertible_to<bool>;
    // Shared ownership - copyable
    requires std::copyable<T>;
};

template<typename T>
concept WeakPtrLike = requires(T ptr) {
    typename T::element_type;
    { ptr.use_count() } -> std::convertible_to<long>;
    { ptr.expired() } -> std::convertible_to<bool>;
    { ptr.lock() } -> SharedPtrLike;
    requires !std::convertible_to<T, typename T::element_type*>;
};

// Advanced concepts for pointer semantics
template<typename T>
concept PointerSemantics = requires(T ptr) {
    typename T::element_type;
    { *ptr } -> std::same_as<typename T::element_type&>;
    { ptr.operator->() } -> std::same_as<typename T::element_type*>;
};

template<typename T>
concept NullablePointer = PointerSemantics<T> && requires(T ptr) {
    { ptr == nullptr } -> std::convertible_to<bool>;
    { ptr != nullptr } -> std::convertible_to<bool>;
    { static_cast<bool>(ptr) } -> std::convertible_to<bool>;
};

template<typename T>
concept ArrayPointer = PointerSemantics<T> && requires(T ptr, size_t index) {
    { ptr[index] } -> std::same_as<typename T::element_type&>;
    typename T::element_type;
    requires std::is_array_v<typename T::element_type> || 
             std::is_same_v<typename T::element_type, std::remove_extent_t<typename T::element_type>>;
};

// Constrained smart pointer operations
template<UniquePtrLike PtrType>
class UniquePointerManager {
private:
    PtrType ptr_;
    
public:
    explicit UniquePointerManager(PtrType&& ptr) 
        : ptr_(std::move(ptr)) {}
    
    // Only allow move operations
    UniquePointerManager(UniquePointerManager&&) = default;
    UniquePointerManager& operator=(UniquePointerManager&&) = default;
    
    // Explicitly deleted copy operations
    UniquePointerManager(const UniquePointerManager&) = delete;
    UniquePointerManager& operator=(const UniquePointerManager&) = delete;
    
    // Safe access with constraints
    template<std::invocable<typename PtrType::element_type&> Func>
    requires std::same_as<std::invoke_result_t<Func, typename PtrType::element_type&>, void>
    void apply_if_valid(Func&& func) {
        if (ptr_) {
            std::invoke(std::forward<Func>(func), *ptr_);
        }
    }
    
    template<std::invocable<typename PtrType::element_type&> Func>
    requires (!std::same_as<std::invoke_result_t<Func, typename PtrType::element_type&>, void>)
    auto apply_if_valid(Func&& func) -> std::optional<std::invoke_result_t<Func, typename PtrType::element_type&>> {
        if (ptr_) {
            return std::invoke(std::forward<Func>(func), *ptr_);
        }
        return std::nullopt;
    }
    
    // Transfer ownership with constraints
    template<UniquePtrLike TargetType>
    requires std::constructible_from<TargetType, decltype(ptr_.release())>
    TargetType transfer_ownership() {
        return TargetType(ptr_.release());
    }
    
    const PtrType& get_ptr() const { return ptr_; }
    PtrType& get_ptr() { return ptr_; }
};

template<SharedPtrLike PtrType>
class SharedPointerManager {
private:
    PtrType ptr_;
    
public:
    explicit SharedPointerManager(const PtrType& ptr) : ptr_(ptr) {}
    explicit SharedPointerManager(PtrType&& ptr) : ptr_(std::move(ptr)) {}
    
    // Reference counting operations with constraints
    template<std::predicate<long> Predicate>
    bool check_ref_count(Predicate&& pred) const {
        return pred(ptr_.use_count());
    }
    
    // Conditional operations based on uniqueness
    template<std::invocable<typename PtrType::element_type&> Func>
    requires std::same_as<std::invoke_result_t<Func, typename PtrType::element_type&>, void>
    void apply_if_unique(Func&& func) {
        if (ptr_ && ptr_.unique()) {
            std::invoke(std::forward<Func>(func), *ptr_);
        }
    }
    
    // Safe sharing with type constraints
    template<WeakPtrLike WeakType>
    requires std::constructible_from<WeakType, PtrType>
    WeakType create_weak_ref() const {
        return WeakType(ptr_);
    }
    
    long use_count() const { return ptr_.use_count(); }
    bool unique() const { return ptr_.unique(); }
    const PtrType& get_ptr() const { return ptr_; }
};

// Concept-based factory with perfect forwarding
template<typename T>
concept Constructible = std::constructible_from<T>;

template<Constructible T, typename... Args>
requires std::constructible_from<T, Args...>
auto make_constrained_unique(Args&&... args) -> std::unique_ptr<T> {
    return std::make_unique<T>(std::forward<Args>(args)...);
}

template<Constructible T, typename... Args>
requires std::constructible_from<T, Args...>
auto make_constrained_shared(Args&&... args) -> std::shared_ptr<T> {
    return std::make_shared<T>(std::forward<Args>(args)...);
}

// Advanced constraint: Resource management concept
template<typename T>
concept RAIIResource = requires(T resource) {
    { resource.acquire() } -> std::same_as<void>;
    { resource.release() } -> std::same_as<void>;
    { resource.is_acquired() } -> std::convertible_to<bool>;
    // Must be movable for RAII semantics
    requires std::movable<T>;
    // Should not be copyable for unique resource semantics
    requires !std::copyable<T> || requires { typename T::allow_copy; };
};

template<RAIIResource Resource>
class ConstrainedResourcePointer {
private:
    std::unique_ptr<Resource> resource_;
    
public:
    template<typename... Args>
    requires std::constructible_from<Resource, Args...>
    explicit ConstrainedResourcePointer(Args&&... args) 
        : resource_(std::make_unique<Resource>(std::forward<Args>(args)...)) {
        resource_->acquire();
    }
    
    ~ConstrainedResourcePointer() {
        if (resource_ && resource_->is_acquired()) {
            resource_->release();
        }
    }
    
    // Move-only semantics enforced by concept
    ConstrainedResourcePointer(ConstrainedResourcePointer&&) = default;
    ConstrainedResourcePointer& operator=(ConstrainedResourcePointer&&) = default;
    ConstrainedResourcePointer(const ConstrainedResourcePointer&) = delete;
    ConstrainedResourcePointer& operator=(const ConstrainedResourcePointer&) = delete;
    
    Resource& operator*() const { return *resource_; }
    Resource* operator->() const { return resource_.get(); }
    Resource* get() const { return resource_.get(); }
    
    explicit operator bool() const { 
        return resource_ && resource_->is_acquired(); 
    }
};

// Example usage with concepts
struct MockResource {
    bool acquired_ = false;
    
    void acquire() { acquired_ = true; }
    void release() { acquired_ = false; }
    bool is_acquired() const { return acquired_; }
    
    void do_work() const { /* some work */ }
};

void concepts_demo() {
    // Constrained unique pointer operations
    auto unique_ptr = make_constrained_unique<int>(42);
    UniquePointerManager manager(std::move(unique_ptr));
    
    manager.apply_if_valid([](int& value) { value *= 2; });
    
    auto result = manager.apply_if_valid([](const int& value) { 
        return value > 50; 
    });
    
    if (result) {
        std::cout << "Value check result: " << *result << std::endl;
    }
    
    // Constrained shared pointer operations  
    auto shared_ptr = make_constrained_shared<std::string>("Hello, Concepts!");
    SharedPointerManager shared_manager(shared_ptr);
    
    shared_manager.apply_if_unique([](std::string& str) {
        str += " - Modified";
    });
    
    // Resource management with constraints
    ConstrainedResourcePointer<MockResource> resource_ptr;
    if (resource_ptr) {
        resource_ptr->do_work();
    }
    
    // Compile-time verification of constraints
    static_assert(UniquePtrLike<std::unique_ptr<int>>);
    static_assert(SharedPtrLike<std::shared_ptr<int>>);
    static_assert(WeakPtrLike<std::weak_ptr<int>>);
    static_assert(RAIIResource<MockResource>);
    
    std::cout << "All concept constraints satisfied!" << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Ranges and Views with Pointer-like Iterators' : 'Ranges y Views con Iteradores tipo Puntero',
      code: `#include <ranges>
#include <algorithm>
#include <memory>
#include <vector>
#include <span>
#include <iterator>

// C++20 Ranges with smart pointer integration
namespace pointer_ranges {

// Custom iterator concept for pointer-like objects
template<typename It>
concept PointerLikeIterator = std::input_iterator<It> && requires(It it) {
    typename std::iterator_traits<It>::pointer;
    { it.operator->() } -> std::convertible_to<typename std::iterator_traits<It>::pointer>;
    { *it } -> std::convertible_to<typename std::iterator_traits<It>::value_type>;
};

// Range adapter for containers of smart pointers
template<std::ranges::input_range Range>
requires requires { 
    typename std::ranges::range_value_t<Range>;
    requires SmartPointerLike<std::ranges::range_value_t<Range>>;
}
class smart_pointer_range {
private:
    Range range_;
    
public:
    explicit smart_pointer_range(Range&& range) : range_(std::forward<Range>(range)) {}
    
    // Iterator that dereferences smart pointers automatically
    class iterator {
    private:
        std::ranges::iterator_t<Range> inner_;
        
    public:
        using iterator_category = std::forward_iterator_tag;
        using value_type = typename std::ranges::range_value_t<Range>::element_type;
        using difference_type = std::ptrdiff_t;
        using pointer = value_type*;
        using reference = value_type&;
        
        explicit iterator(std::ranges::iterator_t<Range> it) : inner_(it) {}
        
        reference operator*() const { 
            return *(*inner_); // Double dereference: once for iterator, once for smart pointer
        }
        
        pointer operator->() const { 
            return inner_->get(); 
        }
        
        iterator& operator++() { 
            ++inner_; 
            return *this; 
        }
        
        iterator operator++(int) { 
            auto temp = *this; 
            ++inner_; 
            return temp; 
        }
        
        bool operator==(const iterator& other) const { 
            return inner_ == other.inner_; 
        }
        
        bool operator!=(const iterator& other) const { 
            return inner_ != other.inner_; 
        }
    };
    
    iterator begin() { return iterator(std::ranges::begin(range_)); }
    iterator end() { return iterator(std::ranges::end(range_)); }
    
    auto begin() const { return iterator(std::ranges::begin(range_)); }
    auto end() const { return iterator(std::ranges::end(range_)); }
    
    size_t size() const requires std::ranges::sized_range<Range> { 
        return std::ranges::size(range_); 
    }
    
    bool empty() const { return std::ranges::empty(range_); }
};

// Range factory function
template<std::ranges::input_range Range>
auto make_smart_pointer_range(Range&& range) {
    return smart_pointer_range<Range>(std::forward<Range>(range));
}

// Custom view for filtering valid (non-null) pointers
struct valid_pointers_view : std::ranges::view_interface<valid_pointers_view> {
    template<std::ranges::input_range Range>
    requires SmartPointerLike<std::ranges::range_value_t<Range>>
    constexpr auto operator()(Range&& range) const {
        return std::forward<Range>(range) 
             | std::views::filter([](const auto& ptr) { return static_cast<bool>(ptr); });
    }
};

inline constexpr valid_pointers_view valid_pointers;

// View for extracting raw pointers from smart pointers
struct raw_pointers_view : std::ranges::view_interface<raw_pointers_view> {
    template<std::ranges::input_range Range>
    requires SmartPointerLike<std::ranges::range_value_t<Range>>
    constexpr auto operator()(Range&& range) const {
        return std::forward<Range>(range) 
             | std::views::transform([](const auto& smart_ptr) { 
                   return smart_ptr.get(); 
               });
    }
};

inline constexpr raw_pointers_view raw_pointers;

// Advanced range adapter for pointer arithmetic sequences
template<typename T>
class pointer_arithmetic_range {
private:
    T* start_;
    T* end_;
    std::ptrdiff_t step_;
    
public:
    pointer_arithmetic_range(T* start, T* end, std::ptrdiff_t step = 1) 
        : start_(start), end_(end), step_(step) {}
    
    class iterator {
    private:
        T* ptr_;
        std::ptrdiff_t step_;
        
    public:
        using iterator_category = std::random_access_iterator_tag;
        using value_type = T;
        using difference_type = std::ptrdiff_t;
        using pointer = T*;
        using reference = T&;
        
        iterator(T* ptr, std::ptrdiff_t step) : ptr_(ptr), step_(step) {}
        
        reference operator*() const { return *ptr_; }
        pointer operator->() const { return ptr_; }
        
        iterator& operator++() { ptr_ += step_; return *this; }
        iterator operator++(int) { auto temp = *this; ptr_ += step_; return temp; }
        iterator& operator--() { ptr_ -= step_; return *this; }
        iterator operator--(int) { auto temp = *this; ptr_ -= step_; return temp; }
        
        iterator& operator+=(difference_type n) { ptr_ += n * step_; return *this; }
        iterator& operator-=(difference_type n) { ptr_ -= n * step_; return *this; }
        iterator operator+(difference_type n) const { return iterator(ptr_ + n * step_, step_); }
        iterator operator-(difference_type n) const { return iterator(ptr_ - n * step_, step_); }
        
        difference_type operator-(const iterator& other) const { 
            return (ptr_ - other.ptr_) / step_; 
        }
        
        reference operator[](difference_type n) const { return *(ptr_ + n * step_); }
        
        bool operator==(const iterator& other) const { return ptr_ == other.ptr_; }
        auto operator<=>(const iterator& other) const { return ptr_ <=> other.ptr_; }
    };
    
    iterator begin() const { return iterator(start_, step_); }
    iterator end() const { return iterator(end_, step_); }
    
    size_t size() const { 
        return static_cast<size_t>((end_ - start_) / step_); 
    }
    
    bool empty() const { return start_ >= end_; }
};

// Range factory for pointer arithmetic
template<typename T>
auto make_pointer_range(T* start, T* end, std::ptrdiff_t step = 1) {
    return pointer_arithmetic_range<T>(start, end, step);
}

// Advanced view combinator for nested smart pointer structures
template<std::ranges::input_range Range>
requires requires {
    // Range of containers, where each container holds smart pointers
    typename std::ranges::range_value_t<Range>;
    requires std::ranges::input_range<std::ranges::range_value_t<Range>>;
    requires SmartPointerLike<std::ranges::range_value_t<std::ranges::range_value_t<Range>>>;
}
auto flatten_smart_pointers(Range&& range) {
    return std::forward<Range>(range)
         | std::views::join  // Flatten containers
         | valid_pointers    // Filter null pointers
         | std::views::transform([](const auto& ptr) { return std::ref(*ptr); }); // Convert to references
}

// Memory-aware range processing with spans
template<typename T>
class memory_efficient_processor {
private:
    std::span<T> data_span_;
    size_t chunk_size_;
    
public:
    memory_efficient_processor(std::span<T> span, size_t chunk_size = 1024) 
        : data_span_(span), chunk_size_(chunk_size) {}
    
    // Process data in chunks to maintain cache locality
    template<std::invocable<std::span<T>> Processor>
    void process_in_chunks(Processor&& proc) {
        for (size_t offset = 0; offset < data_span_.size(); offset += chunk_size_) {
            size_t remaining = data_span_.size() - offset;
            size_t current_chunk = std::min(chunk_size_, remaining);
            
            auto chunk_span = data_span_.subspan(offset, current_chunk);
            std::invoke(std::forward<Processor>(proc), chunk_span);
        }
    }
    
    // Range-based processing with views
    template<std::invocable<T&> Transformer>
    void transform_range(Transformer&& transformer) {
        auto range_view = data_span_ | std::views::transform(std::forward<Transformer>(transformer));
        
        // Force evaluation through iteration
        for ([[maybe_unused]] auto&& transformed : range_view) {
            // Transformation applied lazily during iteration
        }
    }
    
    // Parallel-friendly range subdivision
    std::vector<std::span<T>> subdivide(size_t num_parts) const {
        std::vector<std::span<T>> parts;
        parts.reserve(num_parts);
        
        size_t elements_per_part = data_span_.size() / num_parts;
        size_t remainder = data_span_.size() % num_parts;
        
        size_t offset = 0;
        for (size_t i = 0; i < num_parts; ++i) {
            size_t part_size = elements_per_part + (i < remainder ? 1 : 0);
            parts.emplace_back(data_span_.subspan(offset, part_size));
            offset += part_size;
        }
        
        return parts;
    }
};

} // namespace pointer_ranges

// Example usage and demonstration
void ranges_demo() {
    using namespace pointer_ranges;
    
    // Create containers with smart pointers
    std::vector<std::unique_ptr<int>> unique_ptrs;
    unique_ptrs.emplace_back(std::make_unique<int>(1));
    unique_ptrs.emplace_back(std::make_unique<int>(2));
    unique_ptrs.emplace_back(nullptr);
    unique_ptrs.emplace_back(std::make_unique<int>(4));
    
    std::vector<std::shared_ptr<std::string>> shared_ptrs;
    shared_ptrs.emplace_back(std::make_shared<std::string>("Hello"));
    shared_ptrs.emplace_back(std::make_shared<std::string>("World"));
    shared_ptrs.emplace_back(nullptr);
    shared_ptrs.emplace_back(std::make_shared<std::string>("Ranges"));
    
    // Use range adapters
    std::cout << "Valid unique_ptr values: ";
    for (const auto& value : unique_ptrs | valid_pointers) {
        std::cout << *value << " ";
    }
    std::cout << std::endl;
    
    // Transform smart pointers to raw pointers
    std::cout << "Raw pointer addresses: ";
    for (const auto* raw_ptr : shared_ptrs | valid_pointers | raw_pointers) {
        std::cout << raw_ptr << " ";
    }
    std::cout << std::endl;
    
    // Use smart pointer range for direct value access
    auto smart_range = make_smart_pointer_range(unique_ptrs | valid_pointers);
    std::cout << "Direct value access: ";
    for (const auto& value : smart_range) {
        std::cout << value << " ";
    }
    std::cout << std::endl;
    
    // Pointer arithmetic range
    int array[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    auto ptr_range = make_pointer_range(array, array + 10, 2); // Every 2nd element
    
    std::cout << "Every 2nd element: ";
    for (const auto& value : ptr_range) {
        std::cout << value << " ";
    }
    std::cout << std::endl;
    
    // Memory-efficient processing
    std::vector<int> large_data(10000);
    std::iota(large_data.begin(), large_data.end(), 1);
    
    std::span<int> data_span(large_data);
    memory_efficient_processor processor(data_span, 1000);
    
    // Process in chunks
    size_t chunk_count = 0;
    processor.process_in_chunks([&chunk_count](std::span<int> chunk) {
        ++chunk_count;
        // Process chunk (sum, transform, etc.)
        auto sum = std::accumulate(chunk.begin(), chunk.end(), 0);
        std::cout << "Chunk " << chunk_count << " sum: " << sum << std::endl;
    });
    
    // Range-based transformation
    processor.transform_range([](int& value) -> int& {
        value *= 2;
        return value;
    });
    
    std::cout << "First 5 transformed values: ";
    for (const auto& value : data_span | std::views::take(5)) {
        std::cout << value << " ";
    }
    std::cout << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Coroutines and Smart Pointer Lifetime Management' : 'Coroutines y Gestión de Vida de Smart Pointers',
      code: `#include <coroutine>
#include <memory>
#include <optional>
#include <exception>
#include <future>
#include <chrono>

// C++20 Coroutines with smart pointer lifetime management
namespace coroutine_pointers {

// Smart pointer-aware coroutine promise type
template<typename T>
class smart_ptr_task {
public:
    struct promise_type {
        std::shared_ptr<T> result_;
        std::exception_ptr exception_;
        
        smart_ptr_task get_return_object() {
            return smart_ptr_task{std::coroutine_handle<promise_type>::from_promise(*this)};
        }
        
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_never final_suspend() noexcept { return {}; }
        
        void unhandled_exception() {
            exception_ = std::current_exception();
        }
        
        void return_value(std::shared_ptr<T> value) {
            result_ = std::move(value);
        }
        
        // Support for co_await with smart pointers
        template<SmartPointerLike PtrType>
        auto await_transform(PtrType&& ptr) {
            struct awaiter {
                PtrType ptr_;
                
                bool await_ready() const { 
                    return static_cast<bool>(ptr_); 
                }
                
                void await_suspend(std::coroutine_handle<>) const {}
                
                auto await_resume() -> typename PtrType::element_type& { 
                    return *ptr_; 
                }
            };
            return awaiter{std::forward<PtrType>(ptr)};
        }
    };

private:
    std::coroutine_handle<promise_type> handle_;
    
public:
    explicit smart_ptr_task(std::coroutine_handle<promise_type> handle) 
        : handle_(handle) {}
    
    ~smart_ptr_task() {
        if (handle_) {
            handle_.destroy();
        }
    }
    
    // Move-only semantics
    smart_ptr_task(smart_ptr_task&& other) noexcept : handle_(other.handle_) {
        other.handle_ = nullptr;
    }
    
    smart_ptr_task& operator=(smart_ptr_task&& other) noexcept {
        if (this != &other) {
            if (handle_) handle_.destroy();
            handle_ = other.handle_;
            other.handle_ = nullptr;
        }
        return *this;
    }
    
    smart_ptr_task(const smart_ptr_task&) = delete;
    smart_ptr_task& operator=(const smart_ptr_task&) = delete;
    
    std::shared_ptr<T> get_result() {
        if (!handle_) return nullptr;
        if (handle_.promise().exception_) {
            std::rethrow_exception(handle_.promise().exception_);
        }
        return handle_.promise().result_;
    }
    
    bool is_ready() const {
        return handle_ && handle_.done();
    }
};

// Coroutine generator with automatic memory management
template<typename T>
class memory_safe_generator {
public:
    struct promise_type {
        std::shared_ptr<T> current_value_;
        std::exception_ptr exception_;
        
        memory_safe_generator get_return_object() {
            return memory_safe_generator{std::coroutine_handle<promise_type>::from_promise(*this)};
        }
        
        std::suspend_always initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        
        void unhandled_exception() {
            exception_ = std::current_exception();
        }
        
        std::suspend_always yield_value(std::shared_ptr<T> value) {
            current_value_ = std::move(value);
            return {};
        }
        
        void return_void() {}
    };
    
    class iterator {
    private:
        std::coroutine_handle<promise_type> handle_;
        
    public:
        using iterator_category = std::input_iterator_tag;
        using value_type = std::shared_ptr<T>;
        using difference_type = std::ptrdiff_t;
        using pointer = const value_type*;
        using reference = const value_type&;
        
        explicit iterator(std::coroutine_handle<promise_type> handle = nullptr) 
            : handle_(handle) {
            if (handle_ && !handle_.done()) {
                handle_.resume();
            }
        }
        
        iterator& operator++() {
            if (handle_ && !handle_.done()) {
                handle_.resume();
            }
            return *this;
        }
        
        iterator operator++(int) {
            auto temp = *this;
            ++(*this);
            return temp;
        }
        
        reference operator*() const {
            return handle_.promise().current_value_;
        }
        
        pointer operator->() const {
            return &handle_.promise().current_value_;
        }
        
        bool operator==(const iterator& other) const {
            return (!handle_ || handle_.done()) && (!other.handle_ || other.handle_.done());
        }
        
        bool operator!=(const iterator& other) const {
            return !(*this == other);
        }
    };

private:
    std::coroutine_handle<promise_type> handle_;
    
public:
    explicit memory_safe_generator(std::coroutine_handle<promise_type> handle) 
        : handle_(handle) {}
    
    ~memory_safe_generator() {
        if (handle_) {
            handle_.destroy();
        }
    }
    
    // Move-only semantics
    memory_safe_generator(memory_safe_generator&& other) noexcept : handle_(other.handle_) {
        other.handle_ = nullptr;
    }
    
    memory_safe_generator& operator=(memory_safe_generator&& other) noexcept {
        if (this != &other) {
            if (handle_) handle_.destroy();
            handle_ = other.handle_;
            other.handle_ = nullptr;
        }
        return *this;
    }
    
    memory_safe_generator(const memory_safe_generator&) = delete;
    memory_safe_generator& operator=(const memory_safe_generator&) = delete;
    
    iterator begin() {
        if (!handle_) return iterator{};
        
        if (handle_.promise().exception_) {
            std::rethrow_exception(handle_.promise().exception_);
        }
        
        return iterator{handle_};
    }
    
    iterator end() {
        return iterator{};
    }
};

// Async resource manager with coroutines
template<typename Resource>
class async_resource_manager {
public:
    struct promise_type {
        std::shared_ptr<Resource> resource_;
        std::exception_ptr exception_;
        
        async_resource_manager get_return_object() {
            return async_resource_manager{std::coroutine_handle<promise_type>::from_promise(*this)};
        }
        
        std::suspend_never initial_suspend() { return {}; }
        
        struct final_awaiter {
            bool await_ready() noexcept { return false; }
            
            void await_suspend(std::coroutine_handle<promise_type> handle) noexcept {
                // Perform cleanup when coroutine is about to be destroyed
                if (handle.promise().resource_) {
                    // Resource cleanup handled by shared_ptr destructor
                }
            }
            
            void await_resume() noexcept {}
        };
        
        final_awaiter final_suspend() noexcept { return {}; }
        
        void unhandled_exception() {
            exception_ = std::current_exception();
        }
        
        void return_value(std::shared_ptr<Resource> resource) {
            resource_ = std::move(resource);
        }
        
        // Custom await_transform for resource acquisition
        template<typename Acquirer>
        auto await_transform(Acquirer&& acquirer) {
            struct resource_awaiter {
                Acquirer acquirer_;
                
                bool await_ready() const { return false; }
                
                template<typename Promise>
                void await_suspend(std::coroutine_handle<Promise> handle) {
                    // Simulate async resource acquisition
                    std::thread([this, handle]() {
                        std::this_thread::sleep_for(std::chrono::milliseconds(100));
                        handle.resume();
                    }).detach();
                }
                
                auto await_resume() {
                    return acquirer_();
                }
            };
            
            return resource_awaiter{std::forward<Acquirer>(acquirer)};
        }
    };

private:
    std::coroutine_handle<promise_type> handle_;
    
public:
    explicit async_resource_manager(std::coroutine_handle<promise_type> handle) 
        : handle_(handle) {}
    
    ~async_resource_manager() {
        if (handle_) {
            handle_.destroy();
        }
    }
    
    // Move-only
    async_resource_manager(async_resource_manager&& other) noexcept : handle_(other.handle_) {
        other.handle_ = nullptr;
    }
    
    async_resource_manager& operator=(async_resource_manager&& other) noexcept {
        if (this != &other) {
            if (handle_) handle_.destroy();
            handle_ = other.handle_;
            other.handle_ = nullptr;
        }
        return *this;
    }
    
    async_resource_manager(const async_resource_manager&) = delete;
    async_resource_manager& operator=(const async_resource_manager&) = delete;
    
    std::future<std::shared_ptr<Resource>> get_resource_async() {
        return std::async(std::launch::async, [this]() {
            while (!handle_.done()) {
                std::this_thread::sleep_for(std::chrono::milliseconds(10));
            }
            
            if (handle_.promise().exception_) {
                std::rethrow_exception(handle_.promise().exception_);
            }
            
            return handle_.promise().resource_;
        });
    }
};

// Coroutine-based smart pointer chain processing
template<typename T>
smart_ptr_task<T> process_pointer_chain(std::shared_ptr<T> initial) {
    std::shared_ptr<T> current = initial;
    
    while (current) {
        // Simulate async processing
        co_await std::chrono::milliseconds(50);
        
        // Process current element
        if constexpr (requires { current->process(); }) {
            current->process();
        }
        
        // Move to next in chain (if it exists)
        if constexpr (requires { current->next; }) {
            current = current->next;
        } else {
            break;
        }
    }
    
    co_return initial; // Return the processed chain
}

// Generator for creating smart pointers lazily
memory_safe_generator<int> create_smart_int_sequence(int start, int count) {
    for (int i = 0; i < count; ++i) {
        co_yield std::make_shared<int>(start + i);
        
        // Simulate some processing delay
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
}

// Async resource acquisition
struct MockResource {
    int value;
    explicit MockResource(int v) : value(v) {
        std::cout << "Resource " << value << " acquired\\n";
    }
    ~MockResource() {
        std::cout << "Resource " << value << " released\\n";
    }
};

async_resource_manager<MockResource> acquire_resource_async(int resource_id) {
    auto resource = co_await [resource_id]() {
        return std::make_shared<MockResource>(resource_id);
    };
    
    co_return resource;
}

} // namespace coroutine_pointers

// Example usage and demonstration  
void coroutines_demo() {
    using namespace coroutine_pointers;
    
    std::cout << "=== Coroutines with Smart Pointers Demo ===" << std::endl;
    
    // 1. Smart pointer task example
    auto task = [](int value) -> smart_ptr_task<int> {
        auto ptr = std::make_shared<int>(value * 2);
        co_return ptr;
    }(42);
    
    if (task.is_ready()) {
        auto result = task.get_result();
        if (result) {
            std::cout << "Task result: " << *result << std::endl;
        }
    }
    
    // 2. Memory-safe generator example
    std::cout << "Generator sequence: ";
    auto generator = create_smart_int_sequence(1, 5);
    for (const auto& ptr : generator) {
        if (ptr) {
            std::cout << *ptr << " ";
        }
    }
    std::cout << std::endl;
    
    // 3. Async resource management
    auto resource_manager = acquire_resource_async(123);
    auto future_resource = resource_manager.get_resource_async();
    
    // Wait for resource acquisition
    if (future_resource.wait_for(std::chrono::seconds(1)) == std::future_status::ready) {
        auto resource = future_resource.get();
        if (resource) {
            std::cout << "Acquired resource with value: " << resource->value << std::endl;
        }
    }
    
    std::cout << "Coroutines demo completed!" << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Modules and Pointer Interface Design' : 'Módulos y Diseño de Interfaces de Punteros',
      code: `// Modern C++20 Modules with pointer interface design
// File: pointer_interfaces.ixx (Module interface)

export module pointer_interfaces;

import <memory>;
import <concepts>;
import <type_traits>;
import <functional>;
import <span>;

// Export the core pointer interface concepts
export namespace pointer_interfaces {

// Core pointer interface concept
template<typename T>
concept PointerInterface = requires(T ptr) {
    typename T::element_type;
    { ptr.get() } -> std::convertible_to<typename T::element_type*>;
    { ptr.operator*() } -> std::convertible_to<typename T::element_type&>;
    { ptr.operator->() } -> std::convertible_to<typename T::element_type*>;
    { static_cast<bool>(ptr) } -> std::convertible_to<bool>;
};

// Module-local implementation details (not exported)
namespace detail {
    template<typename T>
    class pointer_facade_base {
    protected:
        T* ptr_ = nullptr;
        
    public:
        using element_type = T;
        using pointer = T*;
        using reference = T&;
        
        explicit pointer_facade_base(T* p = nullptr) : ptr_(p) {}
        
        T* get() const noexcept { return ptr_; }
        T& operator*() const { return *ptr_; }
        T* operator->() const { return ptr_; }
        explicit operator bool() const noexcept { return ptr_ != nullptr; }
    };
}

// Exported smart pointer facade
export template<typename T>
class smart_pointer_facade : public detail::pointer_facade_base<T> {
private:
    std::function<void(T*)> deleter_;
    
public:
    explicit smart_pointer_facade(T* ptr = nullptr, 
                                 std::function<void(T*)> del = std::default_delete<T>{})
        : detail::pointer_facade_base<T>(ptr), deleter_(std::move(del)) {}
    
    ~smart_pointer_facade() {
        if (this->ptr_) {
            deleter_(this->ptr_);
        }
    }
    
    // Move semantics
    smart_pointer_facade(smart_pointer_facade&& other) noexcept 
        : detail::pointer_facade_base<T>(other.ptr_), deleter_(std::move(other.deleter_)) {
        other.ptr_ = nullptr;
    }
    
    smart_pointer_facade& operator=(smart_pointer_facade&& other) noexcept {
        if (this != &other) {
            reset();
            this->ptr_ = other.ptr_;
            deleter_ = std::move(other.deleter_);
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    // Deleted copy semantics for unique ownership
    smart_pointer_facade(const smart_pointer_facade&) = delete;
    smart_pointer_facade& operator=(const smart_pointer_facade&) = delete;
    
    void reset(T* new_ptr = nullptr) {
        if (this->ptr_) {
            deleter_(this->ptr_);
        }
        this->ptr_ = new_ptr;
    }
    
    T* release() noexcept {
        T* temp = this->ptr_;
        this->ptr_ = nullptr;
        return temp;
    }
};

// Exported observer pointer interface
export template<typename T>
class observer_pointer_interface {
private:
    T* observed_ptr_ = nullptr;
    
public:
    using element_type = T;
    
    observer_pointer_interface() = default;
    explicit observer_pointer_interface(T* ptr) : observed_ptr_(ptr) {}
    
    // Implicit conversion from smart pointers
    template<PointerInterface PtrType>
    requires std::convertible_to<typename PtrType::element_type*, T*>
    observer_pointer_interface(const PtrType& smart_ptr) 
        : observed_ptr_(smart_ptr.get()) {}
    
    T* get() const noexcept { return observed_ptr_; }
    T& operator*() const { return *observed_ptr_; }
    T* operator->() const { return observed_ptr_; }
    explicit operator bool() const noexcept { return observed_ptr_ != nullptr; }
    
    // Comparison operators
    bool operator==(const observer_pointer_interface& other) const noexcept {
        return observed_ptr_ == other.observed_ptr_;
    }
    
    bool operator!=(const observer_pointer_interface& other) const noexcept {
        return !(*this == other);
    }
    
    template<typename U>
    bool operator==(U* ptr) const noexcept {
        return observed_ptr_ == ptr;
    }
    
    template<typename U>
    bool operator!=(U* ptr) const noexcept {
        return !(*this == ptr);
    }
};

// Exported span-like interface for pointer ranges
export template<typename T>
class pointer_span_interface {
private:
    T* data_ = nullptr;
    size_t size_ = 0;
    
public:
    using element_type = T;
    using value_type = std::remove_cv_t<T>;
    using pointer = T*;
    using const_pointer = const T*;
    using reference = T&;
    using const_reference = const T&;
    using iterator = T*;
    using const_iterator = const T*;
    using size_type = size_t;
    using difference_type = std::ptrdiff_t;
    
    constexpr pointer_span_interface() noexcept = default;
    
    constexpr pointer_span_interface(T* ptr, size_type count) noexcept 
        : data_(ptr), size_(count) {}
    
    constexpr pointer_span_interface(T* first, T* last) noexcept 
        : data_(first), size_(static_cast<size_type>(last - first)) {}
    
    // Construction from containers
    template<typename Container>
    requires requires(Container& c) {
        c.data();
        c.size();
        std::convertible_to<decltype(c.data()), T*>;
    }
    constexpr pointer_span_interface(Container& container) noexcept 
        : data_(container.data()), size_(container.size()) {}
    
    // Element access
    constexpr reference operator[](size_type index) const noexcept {
        return data_[index];
    }
    
    constexpr reference at(size_type index) const {
        if (index >= size_) {
            throw std::out_of_range("pointer_span_interface::at");
        }
        return data_[index];
    }
    
    constexpr reference front() const noexcept { return *data_; }
    constexpr reference back() const noexcept { return data_[size_ - 1]; }
    constexpr pointer data() const noexcept { return data_; }
    
    // Iterators
    constexpr iterator begin() const noexcept { return data_; }
    constexpr iterator end() const noexcept { return data_ + size_; }
    constexpr const_iterator cbegin() const noexcept { return data_; }
    constexpr const_iterator cend() const noexcept { return data_ + size_; }
    
    // Capacity
    constexpr size_type size() const noexcept { return size_; }
    constexpr size_type size_bytes() const noexcept { return size_ * sizeof(T); }
    constexpr bool empty() const noexcept { return size_ == 0; }
    
    // Subspan operations
    constexpr pointer_span_interface first(size_type count) const noexcept {
        return pointer_span_interface(data_, count);
    }
    
    constexpr pointer_span_interface last(size_type count) const noexcept {
        return pointer_span_interface(data_ + size_ - count, count);
    }
    
    constexpr pointer_span_interface subspan(size_type offset, 
                                           size_type count = std::dynamic_extent) const noexcept {
        size_type actual_count = (count == std::dynamic_extent) ? size_ - offset : count;
        return pointer_span_interface(data_ + offset, actual_count);
    }
};

// Exported factory functions
export template<typename T, typename... Args>
auto make_smart_facade(Args&&... args) {
    return smart_pointer_facade<T>(new T(std::forward<Args>(args)...));
}

export template<typename T>
auto make_observer(T* ptr) {
    return observer_pointer_interface<T>(ptr);
}

export template<PointerInterface PtrType>
auto make_observer_from_smart(const PtrType& smart_ptr) {
    return observer_pointer_interface<typename PtrType::element_type>(smart_ptr);
}

export template<typename T>
auto make_pointer_span(T* data, size_t size) {
    return pointer_span_interface<T>(data, size);
}

// Exported utility functions for pointer interface interoperability
export template<PointerInterface From, PointerInterface To>
requires std::convertible_to<typename From::element_type*, typename To::element_type*>
bool compatible_pointers(const From& from, const To& to) {
    return from.get() == to.get();
}

export template<PointerInterface PtrType>
void safe_invoke(const PtrType& ptr, std::invocable<typename PtrType::element_type&> auto&& func) {
    if (ptr) {
        std::invoke(std::forward<decltype(func)>(func), *ptr);
    }
}

export template<PointerInterface PtrType>
auto safe_transform(const PtrType& ptr, 
                   std::invocable<typename PtrType::element_type&> auto&& func) 
    -> std::optional<std::invoke_result_t<decltype(func), typename PtrType::element_type&>> {
    if (ptr) {
        return std::invoke(std::forward<decltype(func)>(func), *ptr);
    }
    return std::nullopt;
}

} // namespace pointer_interfaces

// Module implementation unit (separate compilation unit)
// File: pointer_interfaces.cpp

module pointer_interfaces;

// Implementation details that don't need to be exported
namespace pointer_interfaces::detail {
    
// Global pointer registry for debugging/tracking
static std::unordered_set<void*> active_pointers;
static std::mutex pointer_registry_mutex;

void register_pointer(void* ptr) {
    std::lock_guard<std::mutex> lock(pointer_registry_mutex);
    active_pointers.insert(ptr);
}

void unregister_pointer(void* ptr) {
    std::lock_guard<std::mutex> lock(pointer_registry_mutex);
    active_pointers.erase(ptr);
}

size_t get_active_pointer_count() {
    std::lock_guard<std::mutex> lock(pointer_registry_mutex);
    return active_pointers.size();
}

} // namespace pointer_interfaces::detail

// Usage example in a separate module
// File: main.cpp

import pointer_interfaces;
import <iostream>;
import <vector>;

int main() {
    using namespace pointer_interfaces;
    
    // Create smart pointer facade
    auto smart_ptr = make_smart_facade<int>(42);
    std::cout << "Smart pointer value: " << *smart_ptr << std::endl;
    
    // Create observer from smart pointer
    auto observer = make_observer_from_smart(smart_ptr);
    std::cout << "Observer value: " << *observer << std::endl;
    
    // Test pointer compatibility
    auto another_observer = make_observer(smart_ptr.get());
    std::cout << "Pointers compatible: " << 
        compatible_pointers(observer, another_observer) << std::endl;
    
    // Safe operations
    safe_invoke(smart_ptr, [](int& value) { 
        value *= 2; 
        std::cout << "Modified value: " << value << std::endl;
    });
    
    auto result = safe_transform(smart_ptr, [](const int& value) { 
        return value > 50; 
    });
    
    if (result) {
        std::cout << "Transform result: " << *result << std::endl;
    }
    
    // Pointer span interface
    std::vector<int> data = {1, 2, 3, 4, 5};
    auto span = make_pointer_span(data.data(), data.size());
    
    std::cout << "Span elements: ";
    for (const auto& element : span) {
        std::cout << element << " ";
    }
    std::cout << std::endl;
    
    // Subspan operations
    auto subspan = span.subspan(1, 3);
    std::cout << "Subspan elements: ";
    for (const auto& element : subspan) {
        std::cout << element << " ";
    }
    std::cout << std::endl;
    
    return 0;
}

// Advanced module integration example
// File: advanced_pointer_module.ixx

export module advanced_pointer_integration;

import pointer_interfaces;
import <algorithm>;
import <ranges>;

export namespace advanced_pointer_integration {

// Module that builds upon the pointer interfaces module
template<PointerInterface PtrType>
class pointer_collection {
private:
    std::vector<PtrType> pointers_;
    
public:
    void add(PtrType&& ptr) {
        pointers_.emplace_back(std::move(ptr));
    }
    
    template<std::invocable<typename PtrType::element_type&> Func>
    void for_each_valid(Func&& func) {
        for (auto&& ptr : pointers_) {
            safe_invoke(ptr, std::forward<Func>(func));
        }
    }
    
    auto get_valid_count() const {
        return std::ranges::count_if(pointers_, [](const auto& ptr) { 
            return static_cast<bool>(ptr); 
        });
    }
    
    template<std::predicate<typename PtrType::element_type&> Predicate>
    auto find_if(Predicate&& pred) -> observer_pointer_interface<typename PtrType::element_type> {
        for (const auto& ptr : pointers_) {
            if (ptr && std::invoke(std::forward<Predicate>(pred), *ptr)) {
                return make_observer_from_smart(ptr);
            }
        }
        return observer_pointer_interface<typename PtrType::element_type>{};
    }
};

// Factory function that uses the pointer interfaces module
template<typename T>
auto create_managed_collection() {
    return pointer_collection<smart_pointer_facade<T>>{};
}

} // namespace advanced_pointer_integration`
    },
    {
      title: state.language === 'en' ? 'std::span and std::string_view Integration Patterns' : 'Patrones de Integración de std::span y std::string_view',
      code: `#include <span>
#include <string_view>
#include <memory>
#include <vector>
#include <array>
#include <string>
#include <algorithm>
#include <ranges>
#include <type_traits>

// Advanced integration patterns for std::span and std::string_view with pointers
namespace span_stringview_integration {

// Concept for span-compatible containers
template<typename T>
concept SpanCompatible = std::ranges::contiguous_range<T> && 
                        std::ranges::sized_range<T> &&
                        requires(T& container) {
    { container.data() } -> std::convertible_to<std::add_pointer_t<std::ranges::range_value_t<T>>>;
};

// Smart pointer aware span wrapper
template<typename T>
class smart_span {
private:
    std::span<T> span_;
    std::shared_ptr<void> lifetime_keeper_;  // Keeps the source data alive
    
public:
    using element_type = T;
    using value_type = std::remove_cv_t<T>;
    using size_type = std::span<T>::size_type;
    using difference_type = std::span<T>::difference_type;
    using pointer = T*;
    using const_pointer = const T*;
    using reference = T&;
    using const_reference = const T&;
    using iterator = std::span<T>::iterator;
    
    // Default constructor
    constexpr smart_span() noexcept = default;
    
    // Construct from regular span (no lifetime management)
    constexpr smart_span(std::span<T> span) noexcept : span_(span) {}
    
    // Construct from raw pointer and size (no lifetime management)
    constexpr smart_span(T* ptr, size_type count) noexcept : span_(ptr, count) {}
    
    // Construct with lifetime management
    template<typename Container>
    requires SpanCompatible<Container>
    explicit smart_span(std::shared_ptr<Container> container) 
        : span_(container->data(), container->size()), 
          lifetime_keeper_(container) {}
    
    // Construct from unique_ptr with move
    template<typename Container>
    requires SpanCompatible<Container>
    explicit smart_span(std::unique_ptr<Container> container) {
        auto shared_container = std::shared_ptr<Container>(container.release());
        span_ = std::span<T>(shared_container->data(), shared_container->size());
        lifetime_keeper_ = shared_container;
    }
    
    // Element access - delegate to underlying span
    constexpr reference operator[](size_type index) const { return span_[index]; }
    constexpr reference at(size_type index) const { return span_.at(index); }
    constexpr reference front() const { return span_.front(); }
    constexpr reference back() const { return span_.back(); }
    constexpr pointer data() const noexcept { return span_.data(); }
    
    // Iterators
    constexpr iterator begin() const noexcept { return span_.begin(); }
    constexpr iterator end() const noexcept { return span_.end(); }
    
    // Capacity
    constexpr size_type size() const noexcept { return span_.size(); }
    constexpr size_type size_bytes() const noexcept { return span_.size_bytes(); }
    constexpr bool empty() const noexcept { return span_.empty(); }
    
    // Subspan operations with lifetime preservation
    constexpr smart_span first(size_type count) const {
        smart_span result;
        result.span_ = span_.first(count);
        result.lifetime_keeper_ = lifetime_keeper_;
        return result;
    }
    
    constexpr smart_span last(size_type count) const {
        smart_span result;
        result.span_ = span_.last(count);
        result.lifetime_keeper_ = lifetime_keeper_;
        return result;
    }
    
    constexpr smart_span subspan(size_type offset, size_type count = std::dynamic_extent) const {
        smart_span result;
        result.span_ = span_.subspan(offset, count);
        result.lifetime_keeper_ = lifetime_keeper_;
        return result;
    }
    
    // Conversion to regular span
    constexpr operator std::span<T>() const noexcept { return span_; }
    
    // Lifetime management info
    bool has_lifetime_management() const noexcept { return static_cast<bool>(lifetime_keeper_); }
    long use_count() const noexcept { return lifetime_keeper_ ? lifetime_keeper_.use_count() : 0; }
    
    // Safe data access - returns nullptr if lifetime has expired
    T* safe_data() const noexcept {
        return (lifetime_keeper_ || span_.data()) ? span_.data() : nullptr;
    }
};

// String view with lifetime management
class smart_string_view {
private:
    std::string_view view_;
    std::shared_ptr<void> lifetime_keeper_;
    
public:
    using traits_type = std::string_view::traits_type;
    using value_type = std::string_view::value_type;
    using pointer = std::string_view::pointer;
    using const_pointer = std::string_view::const_pointer;
    using reference = std::string_view::reference;
    using const_reference = std::string_view::const_reference;
    using const_iterator = std::string_view::const_iterator;
    using iterator = std::string_view::iterator;
    using size_type = std::string_view::size_type;
    using difference_type = std::string_view::difference_type;
    
    static constexpr size_type npos = std::string_view::npos;
    
    // Constructors
    constexpr smart_string_view() noexcept = default;
    constexpr smart_string_view(std::string_view sv) noexcept : view_(sv) {}
    
    smart_string_view(const char* s) : view_(s) {}
    smart_string_view(const char* s, size_type count) : view_(s, count) {}
    
    // Constructor with lifetime management from shared_ptr<string>
    explicit smart_string_view(std::shared_ptr<std::string> str) 
        : view_(*str), lifetime_keeper_(str) {}
    
    // Constructor with lifetime management from unique_ptr<string>
    explicit smart_string_view(std::unique_ptr<std::string> str) {
        auto shared_str = std::shared_ptr<std::string>(str.release());
        view_ = std::string_view(*shared_str);
        lifetime_keeper_ = shared_str;
    }
    
    // Constructor from string literal (compile-time)
    template<size_t N>
    constexpr smart_string_view(const char (&str)[N]) : view_(str, N - 1) {}
    
    // Element access
    constexpr const_reference operator[](size_type pos) const { return view_[pos]; }
    constexpr const_reference at(size_type pos) const { return view_.at(pos); }
    constexpr const_reference front() const { return view_.front(); }
    constexpr const_reference back() const { return view_.back(); }
    constexpr const_pointer data() const noexcept { return view_.data(); }
    
    // Iterators
    constexpr const_iterator begin() const noexcept { return view_.begin(); }
    constexpr const_iterator end() const noexcept { return view_.end(); }
    constexpr const_iterator cbegin() const noexcept { return view_.cbegin(); }
    constexpr const_iterator cend() const noexcept { return view_.cend(); }
    
    // Capacity
    constexpr size_type size() const noexcept { return view_.size(); }
    constexpr size_type length() const noexcept { return view_.length(); }
    constexpr size_type max_size() const noexcept { return view_.max_size(); }
    constexpr bool empty() const noexcept { return view_.empty(); }
    
    // Modifiers with lifetime preservation
    constexpr void remove_prefix(size_type n) { view_.remove_prefix(n); }
    constexpr void remove_suffix(size_type n) { view_.remove_suffix(n); }
    constexpr void swap(smart_string_view& v) noexcept { 
        view_.swap(v.view_);
        lifetime_keeper_.swap(v.lifetime_keeper_);
    }
    
    // String operations with lifetime preservation
    constexpr smart_string_view substr(size_type pos = 0, size_type len = npos) const {
        smart_string_view result;
        result.view_ = view_.substr(pos, len);
        result.lifetime_keeper_ = lifetime_keeper_;
        return result;
    }
    
    // Search operations (delegate to underlying string_view)
    constexpr size_type find(smart_string_view v, size_type pos = 0) const noexcept {
        return view_.find(v.view_, pos);
    }
    constexpr size_type find(char c, size_type pos = 0) const noexcept {
        return view_.find(c, pos);
    }
    constexpr size_type find(const char* s, size_type pos, size_type n) const {
        return view_.find(s, pos, n);
    }
    constexpr size_type find(const char* s, size_type pos = 0) const {
        return view_.find(s, pos);
    }
    
    // Comparison operations
    constexpr int compare(smart_string_view v) const noexcept {
        return view_.compare(v.view_);
    }
    
    // Conversion to regular string_view
    constexpr operator std::string_view() const noexcept { return view_; }
    
    // Lifetime management info
    bool has_lifetime_management() const noexcept { return static_cast<bool>(lifetime_keeper_); }
    long use_count() const noexcept { return lifetime_keeper_ ? lifetime_keeper_.use_count() : 0; }
    
    // Safe data access
    const char* safe_data() const noexcept {
        return (lifetime_keeper_ || view_.data()) ? view_.data() : nullptr;
    }
    
    // Conversion to std::string (always safe)
    std::string to_string() const {
        return std::string(view_);
    }
};

// Factory functions for creating smart views
template<typename T>
auto make_smart_span(std::shared_ptr<std::vector<T>> vec) {
    return smart_span<T>(vec);
}

template<typename T, size_t N>
auto make_smart_span(std::shared_ptr<std::array<T, N>> arr) {
    return smart_span<T>(arr);
}

auto make_smart_string_view(std::shared_ptr<std::string> str) {
    return smart_string_view(str);
}

auto make_smart_string_view(std::unique_ptr<std::string> str) {
    return smart_string_view(std::move(str));
}

// Utility functions for span/string_view interoperability
template<typename T>
smart_span<const char> span_from_string_view(const smart_string_view& sv) {
    smart_span<const char> result;
    if (sv.has_lifetime_management()) {
        // Transfer lifetime management - this is a bit tricky and would need careful implementation
        result = smart_span<const char>(sv.data(), sv.size());
    } else {
        result = smart_span<const char>(sv.data(), sv.size());
    }
    return result;
}

template<typename CharT>
smart_string_view string_view_from_char_span(const smart_span<CharT>& span) {
    static_assert(sizeof(CharT) == sizeof(char), "Character type must be char-sized");
    smart_string_view result;
    if (span.has_lifetime_management()) {
        // This would require more sophisticated lifetime management transfer
        result = smart_string_view(std::string_view(reinterpret_cast<const char*>(span.data()), span.size()));
    } else {
        result = smart_string_view(std::string_view(reinterpret_cast<const char*>(span.data()), span.size()));
    }
    return result;
}

// Advanced pattern: Polymorphic view interface
class polymorphic_view_base {
public:
    virtual ~polymorphic_view_base() = default;
    virtual const void* data() const = 0;
    virtual size_t size() const = 0;
    virtual size_t element_size() const = 0;
    virtual bool has_lifetime_management() const = 0;
    virtual long use_count() const = 0;
};

template<typename T>
class typed_polymorphic_view : public polymorphic_view_base {
private:
    smart_span<T> span_;
    
public:
    explicit typed_polymorphic_view(smart_span<T> span) : span_(span) {}
    
    const void* data() const override { return span_.data(); }
    size_t size() const override { return span_.size(); }
    size_t element_size() const override { return sizeof(T); }
    bool has_lifetime_management() const override { return span_.has_lifetime_management(); }
    long use_count() const override { return span_.use_count(); }
    
    const smart_span<T>& get_span() const { return span_; }
};

// View registry for complex lifetime management scenarios
class view_registry {
private:
    static std::unordered_map<const void*, std::weak_ptr<void>> registered_views_;
    static std::mutex registry_mutex_;
    
public:
    template<typename T>
    static void register_view(const smart_span<T>& span) {
        std::lock_guard<std::mutex> lock(registry_mutex_);
        if (span.has_lifetime_management()) {
            // This would require accessing the internal lifetime keeper
            // registered_views_[span.data()] = span.get_lifetime_keeper();
        }
    }
    
    static bool is_view_valid(const void* data) {
        std::lock_guard<std::mutex> lock(registry_mutex_);
        auto it = registered_views_.find(data);
        if (it != registered_views_.end()) {
            return !it->second.expired();
        }
        return false; // Unknown view, assume invalid
    }
    
    static void cleanup_expired_views() {
        std::lock_guard<std::mutex> lock(registry_mutex_);
        auto it = registered_views_.begin();
        while (it != registered_views_.end()) {
            if (it->second.expired()) {
                it = registered_views_.erase(it);
            } else {
                ++it;
            }
        }
    }
};

std::unordered_map<const void*, std::weak_ptr<void>> view_registry::registered_views_;
std::mutex view_registry::registry_mutex_;

} // namespace span_stringview_integration

// Usage example and demonstration
void span_stringview_demo() {
    using namespace span_stringview_integration;
    
    std::cout << "=== std::span and std::string_view Integration Demo ===" << std::endl;
    
    // 1. Smart span with automatic lifetime management
    auto shared_vector = std::make_shared<std::vector<int>>(std::initializer_list<int>{1, 2, 3, 4, 5});
    auto smart_span = make_smart_span(shared_vector);
    
    std::cout << "Smart span elements: ";
    for (const auto& element : smart_span) {
        std::cout << element << " ";
    }
    std::cout << std::endl;
    std::cout << "Span has lifetime management: " << smart_span.has_lifetime_management() << std::endl;
    std::cout << "Reference count: " << smart_span.use_count() << std::endl;
    
    // 2. Subspan operations preserve lifetime
    auto subspan = smart_span.subspan(1, 3);
    std::cout << "Subspan elements: ";
    for (const auto& element : subspan) {
        std::cout << element << " ";
    }
    std::cout << std::endl;
    std::cout << "Subspan reference count: " << subspan.use_count() << std::endl;
    
    // 3. Smart string view with automatic lifetime management
    auto shared_string = std::make_shared<std::string>("Hello, smart string view!");
    auto smart_sv = make_smart_string_view(shared_string);
    
    std::cout << "Smart string view: " << smart_sv.to_string() << std::endl;
    std::cout << "String view has lifetime management: " << smart_sv.has_lifetime_management() << std::endl;
    std::cout << "String view reference count: " << smart_sv.use_count() << std::endl;
    
    // 4. Substring operations
    auto substr = smart_sv.substr(7, 5);
    std::cout << "Substring: " << substr.to_string() << std::endl;
    std::cout << "Substring reference count: " << substr.use_count() << std::endl;
    
    // 5. Conversion between span and string_view
    auto char_span = span_from_string_view(smart_sv);
    std::cout << "Char span size: " << char_span.size() << std::endl;
    
    // 6. Polymorphic view usage
    auto poly_view = std::make_unique<typed_polymorphic_view<int>>(smart_span);
    std::cout << "Polymorphic view data size: " << poly_view->size() << std::endl;
    std::cout << "Polymorphic view element size: " << poly_view->element_size() << std::endl;
    
    // 7. View registry example
    view_registry::register_view(smart_span);
    std::cout << "View is valid: " << view_registry::is_view_valid(smart_span.data()) << std::endl;
    
    // Clean up expired views
    view_registry::cleanup_expired_views();
    
    std::cout << "Span and string_view integration demo completed!" << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Template Metaprogramming Advances with Pointers' : 'Avances en Metaprogramación de Templates con Punteros',
      code: `#include <type_traits>
#include <concepts>
#include <memory>
#include <tuple>
#include <utility>
#include <functional>

// C++20/23 Template metaprogramming advances with pointer types
namespace advanced_metaprogramming {

// C++20 Concepts for advanced pointer metaprogramming
template<typename T>
concept PointerLike = std::is_pointer_v<T> || requires(T t) {
    typename T::element_type;
    { t.get() } -> std::convertible_to<typename T::element_type*>;
    { t.operator*() } -> std::convertible_to<typename T::element_type&>;
    { t.operator->() } -> std::convertible_to<typename T::element_type*>;
};

template<typename T>
concept SmartPointer = PointerLike<T> && !std::is_pointer_v<T>;

template<typename T>
concept RawPointer = std::is_pointer_v<T>;

// Type list metaprogramming utilities
template<typename... Ts>
struct type_list {
    static constexpr size_t size = sizeof...(Ts);
};

template<typename T>
struct is_type_list : std::false_type {};

template<typename... Ts>
struct is_type_list<type_list<Ts...>> : std::true_type {};

template<typename T>
constexpr bool is_type_list_v = is_type_list<T>::value;

// Advanced type manipulation for pointer types
template<typename T>
struct pointer_traits;

template<typename T>
struct pointer_traits<T*> {
    using pointer_type = T*;
    using element_type = T;
    using reference_type = T&;
    static constexpr bool is_raw_pointer = true;
    static constexpr bool is_smart_pointer = false;
    static constexpr bool is_nullable = true;
    static constexpr bool has_ownership = false;
    static constexpr size_t indirection_level = 1;
};

template<typename T>
struct pointer_traits<std::unique_ptr<T>> {
    using pointer_type = std::unique_ptr<T>;
    using element_type = T;
    using reference_type = T&;
    static constexpr bool is_raw_pointer = false;
    static constexpr bool is_smart_pointer = true;
    static constexpr bool is_nullable = true;
    static constexpr bool has_ownership = true;
    static constexpr bool is_movable_only = true;
    static constexpr bool is_copyable = false;
    static constexpr size_t indirection_level = 1;
};

template<typename T>
struct pointer_traits<std::shared_ptr<T>> {
    using pointer_type = std::shared_ptr<T>;
    using element_type = T;
    using reference_type = T&;
    static constexpr bool is_raw_pointer = false;
    static constexpr bool is_smart_pointer = true;
    static constexpr bool is_nullable = true;
    static constexpr bool has_ownership = true;
    static constexpr bool is_movable_only = false;
    static constexpr bool is_copyable = true;
    static constexpr bool supports_weak_refs = true;
    static constexpr size_t indirection_level = 1;
};

template<typename T>
struct pointer_traits<std::weak_ptr<T>> {
    using pointer_type = std::weak_ptr<T>;
    using element_type = T;
    using reference_type = T&;
    static constexpr bool is_raw_pointer = false;
    static constexpr bool is_smart_pointer = true;
    static constexpr bool is_nullable = true;
    static constexpr bool has_ownership = false;
    static constexpr bool is_weak_reference = true;
    static constexpr size_t indirection_level = 1;
};

// Multi-level pointer traits
template<typename T>
struct pointer_traits<T**> {
    using pointer_type = T**;
    using element_type = T*;
    using reference_type = T*&;
    static constexpr bool is_raw_pointer = true;
    static constexpr bool is_smart_pointer = false;
    static constexpr bool is_nullable = true;
    static constexpr bool has_ownership = false;
    static constexpr size_t indirection_level = 2;
};

// Recursive pointer depth calculation
template<typename T>
struct pointer_depth : std::integral_constant<size_t, 0> {};

template<typename T>
struct pointer_depth<T*> : std::integral_constant<size_t, 1 + pointer_depth<T>::value> {};

template<typename T>
struct pointer_depth<std::unique_ptr<T>> : std::integral_constant<size_t, 1 + pointer_depth<T>::value> {};

template<typename T>
struct pointer_depth<std::shared_ptr<T>> : std::integral_constant<size_t, 1 + pointer_depth<T>::value> {};

template<typename T>
constexpr size_t pointer_depth_v = pointer_depth<T>::value;

// Ultimate element type extraction (recursive)
template<typename T>
struct ultimate_element_type { using type = T; };

template<typename T>
struct ultimate_element_type<T*> : ultimate_element_type<T> {};

template<typename T>
struct ultimate_element_type<std::unique_ptr<T>> : ultimate_element_type<T> {};

template<typename T>
struct ultimate_element_type<std::shared_ptr<T>> : ultimate_element_type<T> {};

template<typename T>
struct ultimate_element_type<std::weak_ptr<T>> : ultimate_element_type<T> {};

template<typename T>
using ultimate_element_type_t = typename ultimate_element_type<T>::type;

// C++20 requires clause for pointer conversion
template<typename From, typename To>
concept PointerConvertible = requires(From from) {
    { static_cast<To>(from) } -> std::convertible_to<To>;
} && PointerLike<From> && PointerLike<To>;

// Advanced SFINAE with C++20 concepts
template<typename T, typename... Args>
concept ConstructiblePointer = PointerLike<T> && 
    requires(Args... args) {
        T(std::forward<Args>(args)...);
    };

// Template specialization dispatcher based on pointer properties
template<typename PtrType, bool IsRaw = pointer_traits<PtrType>::is_raw_pointer,
                           bool IsUnique = pointer_traits<PtrType>::is_movable_only,
                           bool IsShared = pointer_traits<PtrType>::is_copyable>
struct pointer_operation_dispatcher;

// Raw pointer specialization
template<typename PtrType>
struct pointer_operation_dispatcher<PtrType, true, false, false> {
    static void cleanup(PtrType& ptr) {
        // Raw pointers: manual cleanup required
        delete ptr;
        ptr = nullptr;
    }
    
    static bool is_valid(const PtrType& ptr) {
        return ptr != nullptr;
    }
    
    template<typename Func>
    static void safe_invoke(const PtrType& ptr, Func&& func) {
        if (ptr) {
            std::invoke(std::forward<Func>(func), *ptr);
        }
    }
};

// Unique pointer specialization
template<typename PtrType>
struct pointer_operation_dispatcher<PtrType, false, true, false> {
    static void cleanup(PtrType& ptr) {
        ptr.reset();
    }
    
    static bool is_valid(const PtrType& ptr) {
        return static_cast<bool>(ptr);
    }
    
    template<typename Func>
    static void safe_invoke(const PtrType& ptr, Func&& func) {
        if (ptr) {
            std::invoke(std::forward<Func>(func), *ptr);
        }
    }
};

// Shared pointer specialization
template<typename PtrType>
struct pointer_operation_dispatcher<PtrType, false, false, true> {
    static void cleanup(PtrType& ptr) {
        ptr.reset();
    }
    
    static bool is_valid(const PtrType& ptr) {
        return static_cast<bool>(ptr);
    }
    
    static long reference_count(const PtrType& ptr) {
        return ptr.use_count();
    }
    
    template<typename Func>
    static void safe_invoke(const PtrType& ptr, Func&& func) {
        if (ptr) {
            std::invoke(std::forward<Func>(func), *ptr);
        }
    }
};

// Generic pointer operations using dispatcher
template<PointerLike PtrType>
void generic_cleanup(PtrType& ptr) {
    pointer_operation_dispatcher<PtrType>::cleanup(ptr);
}

template<PointerLike PtrType>
bool generic_is_valid(const PtrType& ptr) {
    return pointer_operation_dispatcher<PtrType>::is_valid(ptr);
}

template<PointerLike PtrType, typename Func>
void generic_safe_invoke(const PtrType& ptr, Func&& func) {
    pointer_operation_dispatcher<PtrType>::safe_invoke(ptr, std::forward<Func>(func));
}

// C++23-style template parameter pack expansion with pointers
template<PointerLike... PtrTypes>
class pointer_tuple {
private:
    std::tuple<PtrTypes...> pointers_;
    
public:
    explicit pointer_tuple(PtrTypes... ptrs) : pointers_(std::move(ptrs)...) {}
    
    template<size_t Index>
    requires (Index < sizeof...(PtrTypes))
    decltype(auto) get() & {
        return std::get<Index>(pointers_);
    }
    
    template<size_t Index>
    requires (Index < sizeof...(PtrTypes))
    decltype(auto) get() const& {
        return std::get<Index>(pointers_);
    }
    
    template<size_t Index>
    requires (Index < sizeof...(PtrTypes))
    decltype(auto) get() && {
        return std::get<Index>(std::move(pointers_));
    }
    
    // Apply function to all valid pointers
    template<typename Func>
    void for_each_valid(Func&& func) {
        std::apply([&func](auto&... ptrs) {
            (generic_safe_invoke(ptrs, func), ...);
        }, pointers_);
    }
    
    // Count valid pointers
    size_t valid_count() const {
        return std::apply([](const auto&... ptrs) {
            return (static_cast<size_t>(generic_is_valid(ptrs)) + ...);
        }, pointers_);
    }
    
    // Cleanup all pointers
    void cleanup_all() {
        std::apply([](auto&... ptrs) {
            (generic_cleanup(ptrs), ...);
        }, pointers_);
    }
    
    static constexpr size_t size() { return sizeof...(PtrTypes); }
    
    // Type information
    using types = type_list<PtrTypes...>;
    
    template<size_t Index>
    using element_type_at = ultimate_element_type_t<std::tuple_element_t<Index, std::tuple<PtrTypes...>>>;
};

// Factory function with perfect forwarding and concept constraints
template<ConstructiblePointer... PtrTypes>
auto make_pointer_tuple(PtrTypes&&... ptrs) {
    return pointer_tuple<std::decay_t<PtrTypes>...>(std::forward<PtrTypes>(ptrs)...);
}

// Advanced constexpr pointer type analysis
template<typename T>
constexpr auto analyze_pointer_type() {
    struct analysis_result {
        bool is_pointer;
        bool is_raw;
        bool is_smart;
        bool has_ownership;
        bool is_nullable;
        size_t depth;
    };
    
    if constexpr (PointerLike<T>) {
        using traits = pointer_traits<T>;
        return analysis_result{
            .is_pointer = true,
            .is_raw = traits::is_raw_pointer,
            .is_smart = traits::is_smart_pointer,
            .has_ownership = traits::has_ownership,
            .is_nullable = traits::is_nullable,
            .depth = pointer_depth_v<T>
        };
    } else {
        return analysis_result{
            .is_pointer = false,
            .is_raw = false,
            .is_smart = false,
            .has_ownership = false,
            .is_nullable = false,
            .depth = 0
        };
    }
}

// Compile-time pointer type validation
template<typename... Types>
constexpr bool all_pointers() {
    return (PointerLike<Types> && ...);
}

template<typename... Types>
constexpr bool all_smart_pointers() {
    return (SmartPointer<Types> && ...);
}

template<typename... Types>
constexpr bool all_raw_pointers() {
    return (RawPointer<Types> && ...);
}

// Advanced template parameter pack manipulation with pointers
template<PointerLike... PtrTypes>
struct pointer_pack_traits {
    static constexpr size_t count = sizeof...(PtrTypes);
    static constexpr size_t raw_count = (RawPointer<PtrTypes> + ...);
    static constexpr size_t smart_count = (SmartPointer<PtrTypes> + ...);
    static constexpr size_t total_depth = (pointer_depth_v<PtrTypes> + ...);
    static constexpr double average_depth = static_cast<double>(total_depth) / count;
    
    using first_type = std::tuple_element_t<0, std::tuple<PtrTypes...>>;
    using last_type = std::tuple_element_t<count - 1, std::tuple<PtrTypes...>>;
    
    // Generate index sequence for valid type operations
    using indices = std::make_index_sequence<count>;
    
    // Check if all types have the same ultimate element type
    template<size_t... Is>
    static constexpr bool same_ultimate_element_impl(std::index_sequence<Is...>) {
        return (std::is_same_v<ultimate_element_type_t<std::tuple_element_t<0, std::tuple<PtrTypes...>>>,
                              ultimate_element_type_t<std::tuple_element_t<Is, std::tuple<PtrTypes...>>>> && ...);
    }
    
    static constexpr bool same_ultimate_element = same_ultimate_element_impl(indices{});
};

// Template recursion with pointer types (C++20 style)
template<PointerLike PtrType, size_t Depth>
struct recursive_pointer_wrapper;

template<PointerLike PtrType>
struct recursive_pointer_wrapper<PtrType, 0> {
    using type = PtrType;
    static constexpr size_t depth = 0;
    
    static void process(const PtrType& ptr) {
        generic_safe_invoke(ptr, [](const auto& value) {
            std::cout << "Processing value at depth 0: " << typeid(value).name() << std::endl;
        });
    }
};

template<PointerLike PtrType, size_t Depth>
requires (Depth > 0)
struct recursive_pointer_wrapper<PtrType, Depth> {
    using element_type = typename pointer_traits<PtrType>::element_type;
    using next_wrapper = recursive_pointer_wrapper<element_type, Depth - 1>;
    using type = PtrType;
    static constexpr size_t depth = Depth;
    
    static void process(const PtrType& ptr) {
        generic_safe_invoke(ptr, [](const auto& next_level) {
            std::cout << "Processing at depth " << depth << std::endl;
            next_wrapper::process(next_level);
        });
    }
};

// Compile-time type transformation chains
template<typename T>
struct add_unique_ptr {
    using type = std::unique_ptr<T>;
};

template<typename T>
struct add_shared_ptr {
    using type = std::shared_ptr<T>;
};

template<typename T>
struct add_raw_ptr {
    using type = T*;
};

template<typename T>
using add_unique_ptr_t = typename add_unique_ptr<T>::type;

template<typename T>
using add_shared_ptr_t = typename add_shared_ptr<T>::type;

template<typename T>
using add_raw_ptr_t = typename add_raw_ptr<T>::type;

// Chain transformations
template<typename T, template<typename> class... Transforms>
struct transform_chain;

template<typename T>
struct transform_chain<T> {
    using type = T;
};

template<typename T, template<typename> class Transform, template<typename> class... Rest>
struct transform_chain<T, Transform, Rest...> {
    using type = typename transform_chain<typename Transform<T>::type, Rest...>::type;
};

template<typename T, template<typename> class... Transforms>
using transform_chain_t = typename transform_chain<T, Transforms...>::type;

} // namespace advanced_metaprogramming

// Demonstration and usage examples
void metaprogramming_demo() {
    using namespace advanced_metaprogramming;
    
    std::cout << "=== Advanced Template Metaprogramming with Pointers Demo ===" << std::endl;
    
    // 1. Pointer traits analysis
    std::cout << "\\n--- Pointer Traits Analysis ---" << std::endl;
    
    using RawPtr = int*;
    using UniquePtr = std::unique_ptr<int>;
    using SharedPtr = std::shared_ptr<int>;
    using WeakPtr = std::weak_ptr<int>;
    
    std::cout << "Raw pointer depth: " << pointer_depth_v<RawPtr> << std::endl;
    std::cout << "Unique pointer depth: " << pointer_depth_v<UniquePtr> << std::endl;
    std::cout << "Double pointer depth: " << pointer_depth_v<int**> << std::endl;
    
    // 2. Compile-time analysis
    constexpr auto raw_analysis = analyze_pointer_type<RawPtr>();
    constexpr auto smart_analysis = analyze_pointer_type<UniquePtr>();
    
    std::cout << "Raw pointer analysis - is_pointer: " << raw_analysis.is_pointer 
              << ", has_ownership: " << raw_analysis.has_ownership << std::endl;
    std::cout << "Smart pointer analysis - is_smart: " << smart_analysis.is_smart 
              << ", has_ownership: " << smart_analysis.has_ownership << std::endl;
    
    // 3. Pointer tuple operations
    std::cout << "\\n--- Pointer Tuple Operations ---" << std::endl;
    
    auto ptr_tuple = make_pointer_tuple(
        std::make_unique<int>(42),
        std::make_shared<std::string>("Hello"),
        new double(3.14)
    );
    
    std::cout << "Pointer tuple size: " << ptr_tuple.size() << std::endl;
    std::cout << "Valid pointers count: " << ptr_tuple.valid_count() << std::endl;
    
    ptr_tuple.for_each_valid([](const auto& value) {
        std::cout << "Processing value: " << value << std::endl;
    });
    
    // 4. Pack traits analysis
    using PackTraits = pointer_pack_traits<UniquePtr, SharedPtr, WeakPtr>;
    std::cout << "\\n--- Pack Traits ---" << std::endl;
    std::cout << "Total pointers: " << PackTraits::count << std::endl;
    std::cout << "Smart pointers: " << PackTraits::smart_count << std::endl;
    std::cout << "Raw pointers: " << PackTraits::raw_count << std::endl;
    std::cout << "Average depth: " << PackTraits::average_depth << std::endl;
    
    // 5. Type transformation chains
    std::cout << "\\n--- Type Transformations ---" << std::endl;
    
    using TransformedType = transform_chain_t<int, add_unique_ptr, add_shared_ptr>;
    static_assert(std::is_same_v<TransformedType, std::shared_ptr<std::unique_ptr<int>>>);
    std::cout << "Transform chain int -> unique_ptr -> shared_ptr completed" << std::endl;
    
    // 6. Recursive processing
    std::cout << "\\n--- Recursive Processing ---" << std::endl;
    
    recursive_pointer_wrapper<UniquePtr, 1>::process(std::get<0>(ptr_tuple.get<0>()));
    
    // Cleanup
    ptr_tuple.cleanup_all();
    
    std::cout << "\\nMetaprogramming demo completed!" << std::endl;
}`
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 109: Modern C++ Features Integration' : 'Lección 109: Integración de Características Modernas de C++'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, 10]} intensity={0.5} color="#4ecdc4" />
          <ModernCppFeaturesVisualization />
          <OrbitControls enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <SectionTitle>{state.language === 'en' ? 'Modern C++ Integration Techniques' : 'Técnicas de Integración de C++ Moderno'}</SectionTitle>
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
              <code>{examples[currentExample]?.code ?? ''}</code>
            </pre>
          </div>
        </div>

        <div className="theory-section">
          <SectionTitle>{state.language === 'en' ? 'Key Concepts' : 'Conceptos Clave'}</SectionTitle>
<div className="concept-grid">
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Concepts & Constraints' : 'Concepts y Restricciones'}</SectionTitle>
              <p>
                {state.language === 'en' 
                  ? 'C++20 concepts provide compile-time constraints for smart pointers, enabling more expressive and safe template interfaces with pointer types.'
                  : 'Los concepts de C++20 proporcionan restricciones en tiempo de compilación para smart pointers, habilitando interfaces de template más expresivas y seguras con tipos de puntero.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Ranges & Views' : 'Ranges y Views'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Modern range algorithms with pointer-like iterators enable functional-style programming over smart pointer collections with lazy evaluation.'
                  : 'Los algoritmos de ranges modernos con iteradores tipo puntero permiten programación estilo funcional sobre colecciones de smart pointers con evaluación perezosa.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Coroutines & Lifetime' : 'Coroutines y Tiempo de Vida'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'C++20 coroutines integrated with smart pointers provide automatic lifetime management across suspension points and async operations.'
                  : 'Las coroutines de C++20 integradas con smart pointers proporcionan gestión automática de tiempo de vida a través de puntos de suspensión y operaciones async.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Modules & Interfaces' : 'Módulos e Interfaces'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'C++20 modules enable clean separation of pointer interface declarations from implementation details with improved compile times.'
                  : 'Los módulos de C++20 permiten separación limpia de declaraciones de interfaces de puntero de detalles de implementación con tiempos de compilación mejorados.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'span & string_view' : 'span y string_view'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Modern view types with smart pointer integration provide memory-safe, zero-overhead access to contiguous data with automatic lifetime tracking.'
                  : 'Los tipos de view modernos con integración de smart pointers proporcionan acceso seguro en memoria y sin overhead a datos contiguos con seguimiento automático de tiempo de vida.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Template Metaprogramming' : 'Metaprogramación de Templates'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Advanced C++20/23 template metaprogramming with concepts, requires clauses, and constexpr evaluation for sophisticated pointer type manipulation.'
                  : 'Metaprogramación avanzada de templates C++20/23 con concepts, cláusulas requires y evaluación constexpr para manipulación sofisticada de tipos de puntero.'}
              </p>
          </div>
          </div>
        </div>

        <div className="advanced-topics">
          <SectionTitle>{state.language === 'en' ? 'Integration Patterns' : 'Patrones de Integración'}</SectionTitle>
<div className="pattern-grid">
            <div className="pattern-card">
              <SectionTitle>{state.language === 'en' ? 'Concept-Driven Design' : 'Diseño Guiado por Concepts'}</SectionTitle>
              <ul>
                <li>
                  {state.language === 'en'
                    ? 'Define precise constraints for pointer types and operations'
                    : 'Define restricciones precisas para tipos de puntero y operaciones'}
                </li>
                <li>
                  {state.language === 'en'
                    ? 'Enable compile-time validation of pointer semantics'
                    : 'Habilita validación en tiempo de compilación de semántica de punteros'}
                </li>
                <li>
                  {state.language === 'en'
                    ? 'Improve error messages and template instantiation safety'
                    : 'Mejora mensajes de error y seguridad de instanciación de templates'}
                </li>
              </ul>
          </div>
            
            <div className="pattern-card">
              <SectionTitle>{state.language === 'en' ? 'Coroutine Integration' : 'Integración de Coroutines'}</SectionTitle>
<ul>
                <li>
                  {state.language === 'en'
                    ? 'Automatic smart pointer lifetime management across co_await points'
                    : 'Gestión automática de tiempo de vida de smart pointers a través de puntos co_await'}
                </li>
                <li>
                  {state.language === 'en'
                    ? 'Generator patterns for lazy pointer-based data structures'
                    : 'Patrones de generador para estructuras de datos basadas en punteros perezosas'}
                </li>
                <li>
                  {state.language === 'en'
                    ? 'Async resource acquisition with RAII guarantee preservation'
                    : 'Adquisición async de recursos con preservación de garantías RAII'}
                </li>
              </ul>
          </div>
            
            <div className="pattern-card">
              <SectionTitle>{state.language === 'en' ? 'Module Architecture' : 'Arquitectura de Módulos'}</SectionTitle>
<ul>
                <li>
                  {state.language === 'en'
                    ? 'Clean pointer interface separation with modules'
                    : 'Separación limpia de interfaces de puntero con módulos'}
                </li>
                <li>
                  {state.language === 'en'
                    ? 'Implementation hiding while maintaining type safety'
                    : 'Ocultación de implementación mientras mantiene seguridad de tipos'}
                </li>
                <li>
                  {state.language === 'en'
                    ? 'ABI-stable interfaces with modern C++ features'
                    : 'Interfaces ABI-estables con características modernas de C++'}
                </li>
              </ul>
          </div>
            
            <div className="pattern-card">
              <SectionTitle>{state.language === 'en' ? 'Metaprogramming Evolution' : 'Evolución de Metaprogramación'}</SectionTitle>
<ul>
                <li>
                  {state.language === 'en'
                    ? 'Recursive pointer type analysis and transformation'
                    : 'Análisis recursivo y transformación de tipos de puntero'}
                </li>
                <li>
                  {state.language === 'en'
                    ? 'Compile-time pointer property detection and dispatch'
                    : 'Detección y dispatch de propiedades de puntero en tiempo de compilación'}
                </li>
                <li>
                  {state.language === 'en'
                    ? 'Template parameter pack manipulation with pointer semantics'
                    : 'Manipulación de template parameter packs con semántica de punteros'}
                </li>
              </ul>
          </div>
          </div>
        </div>

        <div className="best-practices">
          <SectionTitle>{state.language === 'en' ? 'Best Practices' : 'Mejores Prácticas'}</SectionTitle>
<ul>
            <li>
              {state.language === 'en'
                ? 'Use concepts to express pointer requirements clearly and enforce them at compile-time'
                : 'Usa concepts para expresar requerimientos de punteros claramente y aplicarlos en tiempo de compilación'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Leverage ranges and views for functional-style operations on pointer collections'
                : 'Aprovecha ranges y views para operaciones estilo funcional en colecciones de punteros'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Design coroutine promise types to handle smart pointer lifetime automatically'
                : 'Diseña tipos de promise de coroutine para manejar tiempo de vida de smart pointers automáticamente'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Use modules to create clean pointer interface boundaries with fast compilation'
                : 'Usa módulos para crear límites limpios de interfaces de puntero con compilación rápida'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Integrate span and string_view with smart pointers for memory-safe view semantics'
                : 'Integra span y string_view con smart pointers para semántica de view segura en memoria'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Apply advanced metaprogramming techniques for generic pointer algorithms and data structures'
                : 'Aplica técnicas avanzadas de metaprogramación para algoritmos genéricos de puntero y estructuras de datos'}
            </li>
          </ul>
          </div>

        <div className="expert-insights">
          <SectionTitle>{state.language === 'en' ? 'Expert Insights' : 'Perspectivas de Experto'}</SectionTitle>
<div className="insight-box">
            <p>
              {state.language === 'en'
                ? 'The integration of modern C++ features with pointer techniques represents the evolution of systems programming. Concepts provide compile-time safety, ranges enable functional programming paradigms, coroutines offer structured async programming, modules improve build scalability, and advanced metaprogramming allows for zero-overhead abstractions. Master these integrations to write code that is both highly performant and remarkably expressive.'
                : 'La integración de características modernas de C++ con técnicas de punteros representa la evolución de la programación de sistemas. Los concepts proporcionan seguridad en tiempo de compilación, los ranges habilitan paradigmas de programación funcional, las coroutines ofrecen programación async estructurada, los módulos mejoran la escalabilidad de build, y la metaprogramación avanzada permite abstracciones sin overhead. Domina estas integraciones para escribir código que sea tanto altamente eficiente como notablemente expresivo.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}