import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone } from '@react-three/drei';
import { useApp } from '../context/AppContext';

interface VersioningMetrics {
  compatibility: number;
  stability: number;
  performance: number;
  migration: number;
}

interface VersionVisualizationProps {
  metrics: VersioningMetrics;
  activeVersion: string;
  onVersionSelect: (version: string) => void;
}

const VersioningVisualization: React.FC<VersionVisualizationProps> = ({ 
  metrics, 
  activeVersion, 
  onVersionSelect 
}) => {
  const groupRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const versions = [
    { name: 'v1.0', position: [-4, 0, 0], color: '#e74c3c', compatibility: 1.0 },
    { name: 'v2.0', position: [-2, 1, 0], color: '#f39c12', compatibility: 0.85 },
    { name: 'v3.0', position: [0, 2, 0], color: '#f1c40f', compatibility: 0.70 },
    { name: 'v4.0', position: [2, 1, 0], color: '#2ecc71', compatibility: 0.60 },
    { name: 'v5.0', position: [4, 0, 0], color: '#3498db', compatibility: 0.45 }
  ];

  return (
    <group ref={groupRef}>
      {versions.map((version, index) => (
        <group key={version.name}>
          <Box
            position={version.position}
            args={[0.8, 0.8, 0.8]}
            onClick={() => onVersionSelect(version.name)}
          >
            <meshPhongMaterial 
              color={activeVersion === version.name ? '#ffffff' : version.color}
              transparent={true}
              opacity={activeVersion === version.name ? 1.0 : 0.7}
            />
          </Box>
          
          <Text
            position={[version.position[0], version.position[1] - 1, version.position[2]]}
            fontSize={0.3}
            color="#333"
            anchorX="center"
            anchorY="middle"
          >
            {version.name}
          </Text>
          
          {/* Compatibility indicator */}
          <Sphere
            position={[version.position[0], version.position[1] + 1.2, version.position[2]]}
            args={[0.1 + (version.compatibility * 0.3)]}
          >
            <meshPhongMaterial 
              color={version.compatibility > 0.8 ? '#2ecc71' : version.compatibility > 0.6 ? '#f39c12' : '#e74c3c'}
              transparent
              opacity={0.8}
            />
          </Sphere>
          
          {/* Connection lines for migration paths */}
          {index < versions.length - 1 && (
            <Cylinder
              args={[0.02, 0.02, 2.2]}
              position={[(version.position[0] + versions[index + 1].position[0]) / 2, 
                        (version.position[1] + versions[index + 1].position[1]) / 2, 0]}
              rotation={[0, 0, Math.atan2(
                versions[index + 1].position[1] - version.position[1],
                versions[index + 1].position[0] - version.position[0]
              )]}
            >
              <meshPhongMaterial color="#95a5a6" transparent opacity={0.5} />
            </Cylinder>
          )}
        </group>
      ))}
    </group>
  );
};

const Lesson111_ReleaseManagementPatterns: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('versioning-strategies');
  const [selectedVersion, setSelectedVersion] = useState<string>('v3.0');
  const [metrics, setMetrics] = useState<VersioningMetrics>({
    compatibility: 0.85,
    stability: 0.92,
    performance: 0.88,
    migration: 0.75
  });

  const examples = {
    'versioning-strategies': {
      title: state.language === 'en' ? 'Smart Pointer Versioning Strategies' : 'Estrategias de Versionado de Smart Pointers',
      code: `#include <memory>
#include <string>
#include <unordered_map>
#include <functional>

// Version-aware Smart Pointer System
namespace versioning {

// ABI-stable interface using type erasure
class VersionedInterface {
public:
    virtual ~VersionedInterface() = default;
    virtual std::string get_version() const = 0;
    virtual bool is_compatible(const std::string& version) const = 0;
    
protected:
    // Internal versioning scheme: MAJOR.MINOR.PATCH
    struct Version {
        int major, minor, patch;
        
        Version(const std::string& version_str) {
            sscanf(version_str.c_str(), "%d.%d.%d", &major, &minor, &patch);
        }
        
        bool is_compatible_with(const Version& other) const {
            // Major version must match for ABI compatibility
            if (major != other.major) return false;
            // Minor version backward compatibility
            return minor >= other.minor;
        }
        
        std::string to_string() const {
            return std::to_string(major) + "." + 
                   std::to_string(minor) + "." + 
                   std::to_string(patch);
        }
    };
};

// Version 1.0 - Basic shared pointer wrapper
class SharedPtrV1 : public VersionedInterface {
private:
    std::shared_ptr<void> ptr_;
    std::function<void(void*)> deleter_;
    
public:
    template<typename T>
    explicit SharedPtrV1(T* ptr) 
        : ptr_(ptr, [](void* p) { delete static_cast<T*>(p); })
        , deleter_([](void* p) { delete static_cast<T*>(p); }) {}
    
    std::string get_version() const override { return "1.0.0"; }
    
    bool is_compatible(const std::string& version) const override {
        Version current("1.0.0");
        Version requested(version);
        return current.is_compatible_with(requested);
    }
    
    template<typename T>
    T* get() const { return static_cast<T*>(ptr_.get()); }
    
    size_t use_count() const { return ptr_.use_count(); }
};

// Version 2.0 - Added thread safety and debugging
class SharedPtrV2 : public VersionedInterface {
private:
    std::shared_ptr<void> ptr_;
    std::function<void(void*)> deleter_;
    mutable std::mutex access_mutex_;
    std::string debug_name_;
    static std::atomic<uint64_t> instance_counter_;
    uint64_t instance_id_;
    
public:
    template<typename T>
    explicit SharedPtrV2(T* ptr, const std::string& name = "anonymous") 
        : ptr_(ptr, [](void* p) { delete static_cast<T*>(p); })
        , deleter_([](void* p) { delete static_cast<T*>(p); })
        , debug_name_(name)
        , instance_id_(instance_counter_.fetch_add(1)) {}
    
    std::string get_version() const override { return "2.0.0"; }
    
    bool is_compatible(const std::string& version) const override {
        Version current("2.0.0");
        Version requested(version);
        return current.is_compatible_with(requested);
    }
    
    template<typename T>
    T* get() const { 
        std::lock_guard<std::mutex> lock(access_mutex_);
        return static_cast<T*>(ptr_.get()); 
    }
    
    size_t use_count() const { 
        std::lock_guard<std::mutex> lock(access_mutex_);
        return ptr_.use_count(); 
    }
    
    // V2 additions
    std::string get_debug_name() const { return debug_name_; }
    uint64_t get_instance_id() const { return instance_id_; }
    
    // Thread-safe reset
    template<typename T>
    void reset(T* new_ptr = nullptr) {
        std::lock_guard<std::mutex> lock(access_mutex_);
        ptr_.reset(new_ptr, [](void* p) { delete static_cast<T*>(p); });
    }
};

std::atomic<uint64_t> SharedPtrV2::instance_counter_{1};

// Version 3.0 - Performance optimizations and custom allocators
template<typename Allocator = std::allocator<char>>
class SharedPtrV3 : public VersionedInterface {
private:
    std::shared_ptr<void> ptr_;
    std::function<void(void*)> deleter_;
    mutable std::shared_mutex access_mutex_;
    std::string debug_name_;
    std::atomic<uint64_t> access_count_;
    Allocator allocator_;
    
    // Performance metrics
    mutable std::atomic<std::chrono::nanoseconds> total_access_time_{std::chrono::nanoseconds{0}};
    
public:
    template<typename T>
    explicit SharedPtrV3(T* ptr, const std::string& name = "anonymous", 
                        const Allocator& alloc = Allocator{}) 
        : ptr_(ptr, [alloc](void* p) mutable { 
            auto typed_ptr = static_cast<T*>(p);
            typed_ptr->~T();
            alloc.deallocate(reinterpret_cast<char*>(p), sizeof(T));
          })
        , debug_name_(name)
        , access_count_(0)
        , allocator_(alloc) {}
    
    std::string get_version() const override { return "3.0.0"; }
    
    bool is_compatible(const std::string& version) const override {
        Version current("3.0.0");
        Version requested(version);
        return current.is_compatible_with(requested);
    }
    
    template<typename T>
    T* get() const { 
        auto start = std::chrono::high_resolution_clock::now();
        std::shared_lock<std::shared_mutex> lock(access_mutex_);
        access_count_.fetch_add(1);
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        total_access_time_.store(total_access_time_.load() + duration);
        
        return static_cast<T*>(ptr_.get()); 
    }
    
    size_t use_count() const { 
        std::shared_lock<std::shared_mutex> lock(access_mutex_);
        return ptr_.use_count(); 
    }
    
    // V3 additions
    uint64_t get_access_count() const { return access_count_.load(); }
    double get_avg_access_time_ns() const { 
        auto total = total_access_time_.load().count();
        auto count = access_count_.load();
        return count > 0 ? static_cast<double>(total) / count : 0.0;
    }
    
    // Lock-free operations where possible
    template<typename T, typename F>
    auto apply(F&& func) const -> decltype(func(*static_cast<T*>(ptr_.get()))) {
        std::shared_lock<std::shared_mutex> lock(access_mutex_);
        return func(*static_cast<T*>(ptr_.get()));
    }
};

// Factory for version-specific instances
class VersionedFactory {
private:
    std::unordered_map<std::string, std::function<std::unique_ptr<VersionedInterface>()>> factories_;
    
public:
    VersionedFactory() {
        // Register version factories
        factories_["1.0"] = []() -> std::unique_ptr<VersionedInterface> {
            return std::make_unique<SharedPtrV1<int>>(new int(42));
        };
        
        factories_["2.0"] = []() -> std::unique_ptr<VersionedInterface> {
            return std::make_unique<SharedPtrV2<int>>(new int(42), "factory_v2");
        };
        
        factories_["3.0"] = []() -> std::unique_ptr<VersionedInterface> {
            return std::make_unique<SharedPtrV3<>>(new int(42), "factory_v3");
        };
    }
    
    std::unique_ptr<VersionedInterface> create(const std::string& version) {
        auto major_version = version.substr(0, version.find('.'));
        auto it = factories_.find(major_version);
        if (it != factories_.end()) {
            return it->second();
        }
        return nullptr;
    }
    
    std::vector<std::string> get_supported_versions() const {
        std::vector<std::string> versions;
        for (const auto& [version, _] : factories_) {
            versions.push_back(version);
        }
        return versions;
    }
};

} // namespace versioning`
    },
    
    'abi-compatibility': {
      title: state.language === 'en' ? 'ABI Compatibility Patterns' : 'Patrones de Compatibilidad ABI',
      code: `#include <memory>
#include <type_traits>
#include <functional>

// ABI-stable interface design patterns
namespace abi_stable {

// Opaque pointer pattern - hides implementation details
class OpaqueHandle {
private:
    void* impl_;  // Points to actual implementation
    std::function<void(void*)> deleter_;
    
public:
    template<typename T>
    explicit OpaqueHandle(T* ptr) 
        : impl_(ptr)
        , deleter_([](void* p) { delete static_cast<T*>(p); }) {}
    
    ~OpaqueHandle() {
        if (impl_ && deleter_) {
            deleter_(impl_);
        }
    }
    
    // Non-copyable but movable for ABI safety
    OpaqueHandle(const OpaqueHandle&) = delete;
    OpaqueHandle& operator=(const OpaqueHandle&) = delete;
    
    OpaqueHandle(OpaqueHandle&& other) noexcept 
        : impl_(other.impl_)
        , deleter_(std::move(other.deleter_)) {
        other.impl_ = nullptr;
        other.deleter_ = nullptr;
    }
    
    OpaqueHandle& operator=(OpaqueHandle&& other) noexcept {
        if (this != &other) {
            if (impl_ && deleter_) deleter_(impl_);
            impl_ = other.impl_;
            deleter_ = std::move(other.deleter_);
            other.impl_ = nullptr;
            other.deleter_ = nullptr;
        }
        return *this;
    }
    
    template<typename T>
    T* get() const { return static_cast<T*>(impl_); }
    
    bool is_valid() const { return impl_ != nullptr; }
};

// Version-tagged interface for ABI evolution
template<int MajorVersion, int MinorVersion>
struct ABIVersion {
    static constexpr int major = MajorVersion;
    static constexpr int minor = MinorVersion;
    static constexpr bool is_compatible(int req_major, int req_minor) {
        return major == req_major && minor >= req_minor;
    }
};

// ABI-stable base class with version checking
template<typename VersionTag>
class VersionedInterface {
public:
    using version_type = VersionTag;
    
    virtual ~VersionedInterface() = default;
    
    static constexpr int get_major_version() { return VersionTag::major; }
    static constexpr int get_minor_version() { return VersionTag::minor; }
    
    static bool check_compatibility(int req_major, int req_minor) {
        return VersionTag::is_compatible(req_major, req_minor);
    }
    
    // Pure virtual ABI-stable methods
    virtual void* get_raw_pointer() const = 0;
    virtual size_t get_reference_count() const = 0;
    virtual bool is_unique() const = 0;
    virtual void reset() = 0;
};

// V1.0 Implementation
template<typename T>
class SharedPtrABI_V1_0 : public VersionedInterface<ABIVersion<1, 0>> {
private:
    std::shared_ptr<T> ptr_;
    
public:
    explicit SharedPtrABI_V1_0(T* ptr) : ptr_(ptr) {}
    
    void* get_raw_pointer() const override {
        return ptr_.get();
    }
    
    size_t get_reference_count() const override {
        return ptr_.use_count();
    }
    
    bool is_unique() const override {
        return ptr_.use_count() == 1;
    }
    
    void reset() override {
        ptr_.reset();
    }
    
    // Type-safe accessors (not part of ABI)
    T* get() const { return ptr_.get(); }
    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_.get(); }
};

// V1.1 Implementation - adds thread safety
template<typename T>
class SharedPtrABI_V1_1 : public VersionedInterface<ABIVersion<1, 1>> {
private:
    std::shared_ptr<T> ptr_;
    mutable std::mutex mutex_;
    
public:
    explicit SharedPtrABI_V1_1(T* ptr) : ptr_(ptr) {}
    
    void* get_raw_pointer() const override {
        std::lock_guard<std::mutex> lock(mutex_);
        return ptr_.get();
    }
    
    size_t get_reference_count() const override {
        std::lock_guard<std::mutex> lock(mutex_);
        return ptr_.use_count();
    }
    
    bool is_unique() const override {
        std::lock_guard<std::mutex> lock(mutex_);
        return ptr_.use_count() == 1;
    }
    
    void reset() override {
        std::lock_guard<std::mutex> lock(mutex_);
        ptr_.reset();
    }
    
    // V1.1 additions (ABI compatible)
    void thread_safe_reset(T* new_ptr) {
        std::lock_guard<std::mutex> lock(mutex_);
        ptr_.reset(new_ptr);
    }
    
    template<typename F>
    auto thread_safe_apply(F&& func) const -> decltype(func(*ptr_.get())) {
        std::lock_guard<std::mutex> lock(mutex_);
        return func(*ptr_.get());
    }
};

// ABI-stable factory using type erasure
class ABIStableFactory {
public:
    // Returns interface pointer - ABI stable
    template<typename T>
    static std::unique_ptr<VersionedInterface<ABIVersion<1, 0>>> 
    create_v1_0(T* ptr) {
        return std::make_unique<SharedPtrABI_V1_0<T>>(ptr);
    }
    
    template<typename T>
    static std::unique_ptr<VersionedInterface<ABIVersion<1, 1>>> 
    create_v1_1(T* ptr) {
        return std::make_unique<SharedPtrABI_V1_1<T>>(ptr);
    }
    
    // Version-aware creation
    template<typename T>
    static std::unique_ptr<VersionedInterface<ABIVersion<1, 0>>>
    create_compatible(T* ptr, int req_major, int req_minor) {
        if (ABIVersion<1, 1>::is_compatible(req_major, req_minor)) {
            return create_v1_1(ptr);
        } else if (ABIVersion<1, 0>::is_compatible(req_major, req_minor)) {
            return create_v1_0(ptr);
        }
        return nullptr; // Incompatible version
    }
};

// Migration helper for ABI evolution
template<typename OldInterface, typename NewInterface>
class ABIMigrationHelper {
public:
    static std::unique_ptr<NewInterface> migrate(std::unique_ptr<OldInterface> old_ptr) {
        if (!old_ptr) return nullptr;
        
        // Extract raw pointer from old interface
        auto raw_ptr = old_ptr->get_raw_pointer();
        old_ptr->reset(); // Release ownership
        
        // Create new interface with migrated data
        return std::make_unique<NewInterface>(static_cast<typename NewInterface::element_type*>(raw_ptr));
    }
    
    static bool is_migration_safe() {
        return NewInterface::get_major_version() == OldInterface::get_major_version();
    }
};

} // namespace abi_stable`
    },
    
    'backward-compatibility': {
      title: state.language === 'en' ? 'Backward Compatibility Patterns' : 'Patrones de Compatibilidad Hacia Atrás',
      code: `#include <memory>
#include <vector>
#include <functional>
#include <type_traits>

// Backward compatibility system for smart pointers
namespace backward_compat {

// Legacy interface adapter pattern
template<typename T>
class LegacySmartPtr {
private:
    T* ptr_;
    bool owned_;
    
public:
    // Legacy constructor from raw pointer
    explicit LegacySmartPtr(T* ptr, bool take_ownership = true) 
        : ptr_(ptr), owned_(take_ownership) {}
    
    ~LegacySmartPtr() {
        if (owned_ && ptr_) {
            delete ptr_;
        }
    }
    
    // Legacy interface
    T* get() const { return ptr_; }
    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_; }
    void release() { owned_ = false; }
    
    // Backward compatibility: no copy constructor/assignment
    LegacySmartPtr(const LegacySmartPtr&) = delete;
    LegacySmartPtr& operator=(const LegacySmartPtr&) = delete;
};

// Modern interface that can work with legacy code
template<typename T>
class CompatibleSmartPtr {
private:
    std::shared_ptr<T> modern_ptr_;
    
public:
    // Modern constructor
    template<typename... Args>
    explicit CompatibleSmartPtr(Args&&... args) 
        : modern_ptr_(std::make_shared<T>(std::forward<Args>(args)...)) {}
    
    // Compatibility constructor from legacy pointer
    explicit CompatibleSmartPtr(const LegacySmartPtr<T>& legacy) 
        : modern_ptr_(legacy.get(), [](T*){}) {} // Non-owning
    
    // Conversion from unique_ptr (migration path)
    explicit CompatibleSmartPtr(std::unique_ptr<T>&& unique_ptr) 
        : modern_ptr_(std::move(unique_ptr)) {}
    
    // Legacy interface compatibility
    T* get() const { return modern_ptr_.get(); }
    T& operator*() const { return *modern_ptr_; }
    T* operator->() const { return modern_ptr_.get(); }
    
    // Modern interface additions
    size_t use_count() const { return modern_ptr_.use_count(); }
    bool unique() const { return modern_ptr_.use_count() == 1; }
    void reset() { modern_ptr_.reset(); }
    
    template<typename U>
    void reset(U* ptr) { modern_ptr_.reset(ptr); }
    
    // Conversion back to legacy (for gradual migration)
    LegacySmartPtr<T> to_legacy() const {
        return LegacySmartPtr<T>(modern_ptr_.get(), false); // Non-owning
    }
    
    // Conversion to standard smart pointers
    std::shared_ptr<T> to_shared() const { return modern_ptr_; }
    std::unique_ptr<T> to_unique() && { 
        if (use_count() == 1) {
            auto ptr = modern_ptr_.get();
            modern_ptr_.reset();
            return std::unique_ptr<T>(ptr);
        }
        return nullptr; // Cannot convert if shared
    }
};

// Version compatibility layer
template<int Version>
struct VersionTraits;

template<>
struct VersionTraits<1> {
    template<typename T>
    using smart_ptr_type = LegacySmartPtr<T>;
    
    static constexpr const char* version_string = "1.0";
    static constexpr bool has_shared_ownership = false;
    static constexpr bool has_thread_safety = false;
};

template<>
struct VersionTraits<2> {
    template<typename T>
    using smart_ptr_type = CompatibleSmartPtr<T>;
    
    static constexpr const char* version_string = "2.0";
    static constexpr bool has_shared_ownership = true;
    static constexpr bool has_thread_safety = true;
};

// Multi-version compatibility wrapper
template<typename T, int SupportedVersions = 2>
class MultiVersionWrapper {
private:
    std::variant<
        typename VersionTraits<1>::template smart_ptr_type<T>,
        typename VersionTraits<2>::template smart_ptr_type<T>
    > ptr_variant_;
    int active_version_;
    
public:
    // Create with specific version
    template<int Version, typename... Args>
    static MultiVersionWrapper create(Args&&... args) {
        static_assert(Version <= SupportedVersions, "Unsupported version");
        MultiVersionWrapper wrapper;
        wrapper.active_version_ = Version;
        
        if constexpr (Version == 1) {
            wrapper.ptr_variant_ = VersionTraits<1>::template smart_ptr_type<T>(
                new T(std::forward<Args>(args)...)
            );
        } else if constexpr (Version == 2) {
            wrapper.ptr_variant_ = VersionTraits<2>::template smart_ptr_type<T>(
                std::forward<Args>(args)...
            );
        }
        
        return wrapper;
    }
    
    // Migrate to newer version
    template<int NewVersion>
    MultiVersionWrapper<T, SupportedVersions> migrate() && {
        static_assert(NewVersion <= SupportedVersions, "Unsupported target version");
        static_assert(NewVersion > 1, "Cannot migrate to older version");
        
        if (active_version_ >= NewVersion) {
            return std::move(*this); // Already at or above target version
        }
        
        // Extract raw pointer for migration
        T* raw_ptr = std::visit([](auto&& ptr) { return ptr.get(); }, ptr_variant_);
        
        if constexpr (NewVersion == 2) {
            // Migrate from v1 to v2
            auto new_wrapper = MultiVersionWrapper::create<2>(raw_ptr);
            
            // Release ownership from old wrapper
            if (active_version_ == 1) {
                std::get<0>(ptr_variant_).release();
            }
            
            return new_wrapper;
        }
        
        return std::move(*this);
    }
    
    // Universal interface methods
    T* get() const {
        return std::visit([](const auto& ptr) { return ptr.get(); }, ptr_variant_);
    }
    
    T& operator*() const {
        return std::visit([](const auto& ptr) -> T& { return *ptr; }, ptr_variant_);
    }
    
    T* operator->() const {
        return std::visit([](const auto& ptr) { return ptr.get(); }, ptr_variant_);
    }
    
    // Version-specific features
    size_t use_count() const {
        if (active_version_ >= 2) {
            return std::get<1>(ptr_variant_).use_count();
        }
        return 1; // Legacy behavior
    }
    
    bool supports_shared_ownership() const {
        return active_version_ >= 2;
    }
    
    int get_version() const { return active_version_; }
    
    // Compatibility check
    template<int RequiredVersion>
    bool is_compatible() const {
        return active_version_ >= RequiredVersion;
    }
    
    // Safe feature access
    template<typename F>
    auto apply_if_supported(F&& func, int required_version = 2) 
        -> std::optional<decltype(func(std::get<1>(ptr_variant_)))> {
        
        if (active_version_ >= required_version && active_version_ >= 2) {
            return func(std::get<1>(ptr_variant_));
        }
        return std::nullopt;
    }
};

// Migration coordinator for large codebases
class MigrationCoordinator {
private:
    std::vector<std::function<void()>> migration_steps_;
    std::vector<std::function<bool()>> validation_steps_;
    size_t current_step_ = 0;
    
public:
    void add_migration_step(std::function<void()> step, std::function<bool()> validator) {
        migration_steps_.push_back(std::move(step));
        validation_steps_.push_back(std::move(validator));
    }
    
    bool execute_next_step() {
        if (current_step_ >= migration_steps_.size()) {
            return false; // Migration complete
        }
        
        try {
            migration_steps_[current_step_]();
            
            if (validation_steps_[current_step_]()) {
                current_step_++;
                return true;
            } else {
                // Rollback if validation fails
                return false;
            }
        } catch (...) {
            // Handle migration error
            return false;
        }
    }
    
    bool is_migration_complete() const {
        return current_step_ >= migration_steps_.size();
    }
    
    double get_progress() const {
        return static_cast<double>(current_step_) / migration_steps_.size();
    }
    
    void reset() {
        current_step_ = 0;
    }
};

} // namespace backward_compat`
    },
    
    'migration-strategies': {
      title: state.language === 'en' ? 'Migration Strategies' : 'Estrategias de Migración',
      code: `#include <memory>
#include <vector>
#include <functional>
#include <future>
#include <atomic>

// Comprehensive migration strategies for smart pointer evolution
namespace migration {

// Phased migration approach
enum class MigrationPhase {
    Preparation,
    CoexistenceSetup,
    GradualMigration,
    Validation,
    Cleanup,
    Complete
};

template<typename OldType, typename NewType>
class MigrationManager {
private:
    std::atomic<MigrationPhase> current_phase_{MigrationPhase::Preparation};
    std::vector<std::shared_ptr<OldType>> legacy_objects_;
    std::vector<std::shared_ptr<NewType>> modern_objects_;
    
    // Migration statistics
    std::atomic<size_t> objects_migrated_{0};
    std::atomic<size_t> migration_failures_{0};
    std::atomic<size_t> total_objects_{0};
    
    // Migration callbacks
    std::function<std::shared_ptr<NewType>(const std::shared_ptr<OldType>&)> migrator_;
    std::function<bool(const std::shared_ptr<NewType>&)> validator_;
    std::function<void(MigrationPhase, MigrationPhase)> phase_change_callback_;
    
public:
    explicit MigrationManager(
        std::function<std::shared_ptr<NewType>(const std::shared_ptr<OldType>&)> migrator,
        std::function<bool(const std::shared_ptr<NewType>&)> validator = nullptr)
        : migrator_(std::move(migrator))
        , validator_(std::move(validator)) {
        
        if (!validator_) {
            validator_ = [](const std::shared_ptr<NewType>&) { return true; };
        }
    }
    
    // Phase 1: Register legacy objects for migration
    void register_legacy_object(std::shared_ptr<OldType> obj) {
        if (current_phase_.load() == MigrationPhase::Preparation) {
            legacy_objects_.push_back(std::move(obj));
            total_objects_.fetch_add(1);
        }
    }
    
    // Phase 2: Setup coexistence environment
    bool setup_coexistence() {
        if (current_phase_.load() != MigrationPhase::Preparation) {
            return false;
        }
        
        // Reserve space for modern objects
        modern_objects_.reserve(legacy_objects_.size());
        
        advance_phase(MigrationPhase::CoexistenceSetup);
        return true;
    }
    
    // Phase 3: Gradual migration with batching
    std::future<bool> migrate_batch(size_t batch_size = 10) {
        return std::async(std::launch::async, [this, batch_size]() {
            if (current_phase_.load() != MigrationPhase::CoexistenceSetup &&
                current_phase_.load() != MigrationPhase::GradualMigration) {
                return false;
            }
            
            if (current_phase_.load() == MigrationPhase::CoexistenceSetup) {
                advance_phase(MigrationPhase::GradualMigration);
            }
            
            size_t migrated_count = 0;
            auto start_index = objects_migrated_.load();
            
            for (size_t i = start_index; 
                 i < legacy_objects_.size() && migrated_count < batch_size; 
                 ++i, ++migrated_count) {
                
                try {
                    auto legacy_obj = legacy_objects_[i];
                    auto modern_obj = migrator_(legacy_obj);
                    
                    if (modern_obj && validator_(modern_obj)) {
                        modern_objects_.push_back(modern_obj);
                        objects_migrated_.fetch_add(1);
                    } else {
                        migration_failures_.fetch_add(1);
                        return false;
                    }
                } catch (...) {
                    migration_failures_.fetch_add(1);
                    return false;
                }
            }
            
            // Check if migration is complete
            if (objects_migrated_.load() >= legacy_objects_.size()) {
                advance_phase(MigrationPhase::Validation);
            }
            
            return true;
        });
    }
    
    // Phase 4: Validate migration results
    bool validate_migration() {
        if (current_phase_.load() != MigrationPhase::Validation) {
            return false;
        }
        
        // Comprehensive validation
        if (modern_objects_.size() != legacy_objects_.size()) {
            return false;
        }
        
        for (const auto& obj : modern_objects_) {
            if (!validator_(obj)) {
                return false;
            }
        }
        
        advance_phase(MigrationPhase::Cleanup);
        return true;
    }
    
    // Phase 5: Cleanup legacy objects
    void cleanup_legacy() {
        if (current_phase_.load() == MigrationPhase::Cleanup) {
            legacy_objects_.clear();
            legacy_objects_.shrink_to_fit();
            advance_phase(MigrationPhase::Complete);
        }
    }
    
    // Migration status queries
    double get_progress() const {
        auto total = total_objects_.load();
        return total > 0 ? static_cast<double>(objects_migrated_.load()) / total : 0.0;
    }
    
    MigrationPhase get_current_phase() const {
        return current_phase_.load();
    }
    
    size_t get_migration_failures() const {
        return migration_failures_.load();
    }
    
    bool is_migration_complete() const {
        return current_phase_.load() == MigrationPhase::Complete;
    }
    
    // Access migrated objects
    const std::vector<std::shared_ptr<NewType>>& get_modern_objects() const {
        return modern_objects_;
    }
    
    // Rollback capability
    bool rollback_to_phase(MigrationPhase target_phase) {
        auto current = current_phase_.load();
        if (target_phase >= current) {
            return false; // Cannot rollback to future phase
        }
        
        switch (target_phase) {
            case MigrationPhase::Preparation:
                modern_objects_.clear();
                objects_migrated_.store(0);
                migration_failures_.store(0);
                break;
                
            case MigrationPhase::CoexistenceSetup:
                // Partial rollback - keep setup but clear migration
                objects_migrated_.store(0);
                modern_objects_.clear();
                break;
                
            default:
                return false; // Unsupported rollback target
        }
        
        current_phase_.store(target_phase);
        return true;
    }
    
    // Set phase change callback
    void set_phase_change_callback(std::function<void(MigrationPhase, MigrationPhase)> callback) {
        phase_change_callback_ = std::move(callback);
    }

private:
    void advance_phase(MigrationPhase new_phase) {
        auto old_phase = current_phase_.exchange(new_phase);
        if (phase_change_callback_) {
            phase_change_callback_(old_phase, new_phase);
        }
    }
};

// Automated migration orchestrator
template<typename OldType, typename NewType>
class AutoMigrationOrchestrator {
private:
    std::unique_ptr<MigrationManager<OldType, NewType>> manager_;
    std::thread migration_thread_;
    std::atomic<bool> should_stop_{false};
    std::chrono::milliseconds batch_interval_;
    size_t batch_size_;
    
public:
    explicit AutoMigrationOrchestrator(
        std::function<std::shared_ptr<NewType>(const std::shared_ptr<OldType>&)> migrator,
        std::function<bool(const std::shared_ptr<NewType>&)> validator = nullptr,
        std::chrono::milliseconds interval = std::chrono::milliseconds(100),
        size_t batch_size = 5)
        : manager_(std::make_unique<MigrationManager<OldType, NewType>>(
            std::move(migrator), std::move(validator)))
        , batch_interval_(interval)
        , batch_size_(batch_size) {}
    
    ~AutoMigrationOrchestrator() {
        stop();
    }
    
    void add_objects(const std::vector<std::shared_ptr<OldType>>& objects) {
        for (const auto& obj : objects) {
            manager_->register_legacy_object(obj);
        }
    }
    
    bool start_migration() {
        if (!manager_->setup_coexistence()) {
            return false;
        }
        
        migration_thread_ = std::thread([this]() {
            while (!should_stop_.load() && !manager_->is_migration_complete()) {
                auto future = manager_->migrate_batch(batch_size_);
                
                if (!future.get()) {
                    // Migration failed, could implement retry logic here
                    break;
                }
                
                std::this_thread::sleep_for(batch_interval_);
            }
            
            // Final validation and cleanup
            if (manager_->get_current_phase() == MigrationPhase::Validation) {
                if (manager_->validate_migration()) {
                    manager_->cleanup_legacy();
                }
            }
        });
        
        return true;
    }
    
    void stop() {
        should_stop_.store(true);
        if (migration_thread_.joinable()) {
            migration_thread_.join();
        }
    }
    
    // Status queries
    double get_progress() const {
        return manager_->get_progress();
    }
    
    bool is_complete() const {
        return manager_->is_migration_complete();
    }
    
    MigrationPhase get_phase() const {
        return manager_->get_current_phase();
    }
    
    const std::vector<std::shared_ptr<NewType>>& get_results() const {
        return manager_->get_modern_objects();
    }
};

// Migration strategy selector
enum class MigrationStrategy {
    Conservative,  // Slow, safe migration with extensive validation
    Balanced,      // Moderate speed with good safety
    Aggressive     // Fast migration with minimal validation
};

template<typename OldType, typename NewType>
class StrategyBasedMigrator {
public:
    static std::unique_ptr<AutoMigrationOrchestrator<OldType, NewType>>
    create_migrator(
        MigrationStrategy strategy,
        std::function<std::shared_ptr<NewType>(const std::shared_ptr<OldType>&)> migrator) {
        
        std::function<bool(const std::shared_ptr<NewType>&)> validator;
        std::chrono::milliseconds interval;
        size_t batch_size;
        
        switch (strategy) {
            case MigrationStrategy::Conservative:
                validator = create_thorough_validator();
                interval = std::chrono::milliseconds(500);
                batch_size = 1;
                break;
                
            case MigrationStrategy::Balanced:
                validator = create_standard_validator();
                interval = std::chrono::milliseconds(100);
                batch_size = 5;
                break;
                
            case MigrationStrategy::Aggressive:
                validator = create_minimal_validator();
                interval = std::chrono::milliseconds(10);
                batch_size = 20;
                break;
        }
        
        return std::make_unique<AutoMigrationOrchestrator<OldType, NewType>>(
            std::move(migrator), std::move(validator), interval, batch_size);
    }

private:
    static std::function<bool(const std::shared_ptr<NewType>&)> create_thorough_validator() {
        return [](const std::shared_ptr<NewType>& obj) {
            // Extensive validation logic
            return obj != nullptr && obj.use_count() > 0;
        };
    }
    
    static std::function<bool(const std::shared_ptr<NewType>&)> create_standard_validator() {
        return [](const std::shared_ptr<NewType>& obj) {
            return obj != nullptr;
        };
    }
    
    static std::function<bool(const std::shared_ptr<NewType>&)> create_minimal_validator() {
        return [](const std::shared_ptr<NewType>&) {
            return true; // Trust the migration process
        };
    }
};

} // namespace migration`
    }
  };

  const currentExample = examples[activeExample as keyof typeof examples];

  const handleVersionSelect = (version: string) => {
    setSelectedVersion(version);
    
    // Update metrics based on selected version
    const versionMetrics: { [key: string]: VersioningMetrics } = {
      'v1.0': { compatibility: 1.0, stability: 0.85, performance: 0.70, migration: 0.60 },
      'v2.0': { compatibility: 0.85, stability: 0.90, performance: 0.80, migration: 0.75 },
      'v3.0': { compatibility: 0.70, stability: 0.95, performance: 0.90, migration: 0.80 },
      'v4.0': { compatibility: 0.60, stability: 0.92, performance: 0.95, migration: 0.85 },
      'v5.0': { compatibility: 0.45, stability: 0.88, performance: 0.98, migration: 0.90 }
    };
    
    if (versionMetrics[version]) {
      setMetrics(versionMetrics[version]);
    }
  };

  return (
    <div className="lesson-container">
      <header className="lesson-header">
        <h1>{state.language === 'en' ? 'Lesson 111: Release Management Patterns' : 'Lección 111: Patrones de Gestión de Versiones'}</h1>
        <p className="lesson-description">
          {state.language === 'en' 
            ? 'Master versioning strategies, ABI compatibility, and backward compatibility patterns for smart pointer systems in production environments.'
            : 'Domina estrategias de versionado, compatibilidad ABI y patrones de compatibilidad hacia atrás para sistemas de smart pointers en entornos de producción.'}
        </p>
      </header>

      <div className="lesson-content">
        <div className="visualization-section">
          <h3>{state.language === 'en' ? 'Version Evolution Visualization' : 'Visualización de Evolución de Versiones'}</h3>
          <div className="canvas-container" style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '20px' }}>
            <Canvas camera={{ position: [8, 5, 8] }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />
              <VersioningVisualization 
                metrics={metrics}
                activeVersion={selectedVersion}
                onVersionSelect={handleVersionSelect}
              />
            </Canvas>
          </div>
          
          <div className="version-info">
            <h4>{state.language === 'en' ? 'Version Metrics' : 'Métricas de Versión'}</h4>
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Compatibility' : 'Compatibilidad'}:</span>
                <span className="metric-value">{(metrics.compatibility * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Stability' : 'Estabilidad'}:</span>
                <span className="metric-value">{(metrics.stability * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Performance' : 'Rendimiento'}:</span>
                <span className="metric-value">{(metrics.performance * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">{state.language === 'en' ? 'Migration Ease' : 'Facilidad de Migración'}:</span>
                <span className="metric-value">{(metrics.migration * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Release Management Examples' : 'Ejemplos de Gestión de Versiones'}</h3>
          
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
              <h4>{state.language === 'en' ? 'Version Compatibility' : 'Compatibilidad de Versiones'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Semantic versioning (MAJOR.MINOR.PATCH)' : 'Versionado semántico (MAYOR.MENOR.PARCHE)'}</li>
                <li>{state.language === 'en' ? 'ABI compatibility within major versions' : 'Compatibilidad ABI dentro de versiones mayores'}</li>
                <li>{state.language === 'en' ? 'Backward compatibility guarantees' : 'Garantías de compatibilidad hacia atrás'}</li>
                <li>{state.language === 'en' ? 'Interface evolution strategies' : 'Estrategias de evolución de interfaces'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'ABI Stability' : 'Estabilidad ABI'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Opaque pointer patterns' : 'Patrones de punteros opacos'}</li>
                <li>{state.language === 'en' ? 'Type erasure for interface stability' : 'Borrado de tipos para estabilidad de interfaz'}</li>
                <li>{state.language === 'en' ? 'Virtual function table preservation' : 'Preservación de tabla de funciones virtuales'}</li>
                <li>{state.language === 'en' ? 'Binary layout consistency' : 'Consistencia de diseño binario'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Migration Strategies' : 'Estrategias de Migración'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Gradual migration with coexistence' : 'Migración gradual con coexistencia'}</li>
                <li>{state.language === 'en' ? 'Batch processing for large codebases' : 'Procesamiento por lotes para códigos grandes'}</li>
                <li>{state.language === 'en' ? 'Rollback capabilities' : 'Capacidades de reversión'}</li>
                <li>{state.language === 'en' ? 'Validation and verification' : 'Validación y verificación'}</li>
              </ul>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Release Coordination' : 'Coordinación de Versiones'}</h4>
              <ul>
                <li>{state.language === 'en' ? 'Multi-phase deployment' : 'Despliegue multifase'}</li>
                <li>{state.language === 'en' ? 'Automated migration orchestration' : 'Orquestación de migración automatizada'}</li>
                <li>{state.language === 'en' ? 'Progress tracking and monitoring' : 'Seguimiento y monitoreo del progreso'}</li>
                <li>{state.language === 'en' ? 'Strategy-based migration approaches' : 'Enfoques de migración basados en estrategia'}</li>
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

        .version-info {
          margin-top: 20px;
        }

        .version-info h4 {
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

export default Lesson111_ReleaseManagementPatterns;