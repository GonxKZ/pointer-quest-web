import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder } from '@react-three/drei';
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



function CrossPlatformVisualization() {
  const [platformMetrics, setPlatformMetrics] = useState({
    x86_64: { ptrSize: 8, alignment: 8, endianness: 'little', performance: 95 },
    x86_32: { ptrSize: 4, alignment: 4, endianness: 'little', performance: 78 },
    arm64: { ptrSize: 8, alignment: 8, endianness: 'little', performance: 92 },
    arm32: { ptrSize: 4, alignment: 4, endianness: 'little', performance: 82 },
    mips: { ptrSize: 8, alignment: 8, endianness: 'big', performance: 85 },
    embedded: { ptrSize: 2, alignment: 2, endianness: 'little', performance: 65 }
  });
  
  const [activePlatform, setActivePlatform] = useState('x86_64');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPlatformMetrics(prev => {
        const newMetrics = { ...prev };
        Object.keys(newMetrics).forEach(platform => {
          newMetrics[platform].performance = Math.max(50, 
            newMetrics[platform].performance + (Math.random() - 0.5) * 4);
        });
        return newMetrics;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const platforms = [
    { name: 'x86_64', pos: [-4, 2, 0], color: '#00ff88' },
    { name: 'x86_32', pos: [-2, 2, 0], color: '#00d4ff' },
    { name: 'arm64', pos: [0, 2, 0], color: '#ff6b6b' },
    { name: 'arm32', pos: [2, 2, 0], color: '#ffa500' },
    { name: 'mips', pos: [4, 2, 0], color: '#ff1493' },
    { name: 'embedded', pos: [0, 0, 0], color: '#9370db' }
  ];

  return (
    <group>
      {platforms.map((platform) => {
        const metrics = platformMetrics[platform.name];
        return (
          <group key={platform.name}>
            <Box
              position={platform.pos as [number, number, number]}
              args={[1.2, 0.8, 0.4]}
              onClick={() => setActivePlatform(platform.name)}
            >
              <meshStandardMaterial
                color={platform.color}
                opacity={activePlatform === platform.name ? 1.0 : 0.7}
                transparent
              />
            </Box>
            <Text
              position={[platform.pos[0], platform.pos[1] + 1, platform.pos[2]]}
              fontSize={0.2}
              color="white"
              anchorX="center"
            >
              {platform.name.toUpperCase()}
            </Text>
            <Text
              position={[platform.pos[0], platform.pos[1] - 1, platform.pos[2]]}
              fontSize={0.15}
              color={platform.color}
              anchorX="center"
            >
              {`${metrics.ptrSize}B ${metrics.endianness}`}
            </Text>
          </group>
        );
      })}
      
      <Cylinder position={[0, -2, 0]} args={[3, 3, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#ffffff" opacity={0.1} transparent />
      </Cylinder>
      
      <Text
        position={[0, -3, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        Cross-Platform Compatibility
      </Text>
      
      <Text
        position={[0, -3.5, 0]}
        fontSize={0.25}
        color={platformMetrics[activePlatform].endianness === 'big' ? '#ff6b6b' : '#00ff88'}
        anchorX="center"
      >
        {`Active: ${activePlatform} (${platformMetrics[activePlatform].performance.toFixed(0)}%)`}
      </Text>
    </group>
  );
}

export default function Lesson108_CrossPlatformConsiderations() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'Platform Detection & Pointer Sizes' : 'Detección de Plataforma y Tamaños de Punteros',
      code: `#include <cstddef>
#include <cstdint>
#include <type_traits>
#include <iostream>

// Comprehensive platform detection
struct PlatformInfo {
    enum class Architecture { X86_64, X86_32, ARM64, ARM32, MIPS64, MIPS32, UNKNOWN };
    enum class Endianness { LITTLE, BIG };
    enum class Compiler { GCC, CLANG, MSVC, ICC, UNKNOWN };
    
    static constexpr Architecture get_architecture() {
#if defined(__x86_64__) || defined(_M_X64)
        return Architecture::X86_64;
#elif defined(__i386__) || defined(_M_IX86)
        return Architecture::X86_32;
#elif defined(__aarch64__) || defined(_M_ARM64)
        return Architecture::ARM64;
#elif defined(__arm__) || defined(_M_ARM)
        return Architecture::ARM32;
#elif defined(__mips64__)
        return Architecture::MIPS64;
#elif defined(__mips__)
        return Architecture::MIPS32;
#else
        return Architecture::UNKNOWN;
#endif
    }
    
    static constexpr Endianness get_endianness() {
#if defined(__BYTE_ORDER__)
    #if __BYTE_ORDER__ == __ORDER_LITTLE_ENDIAN__
        return Endianness::LITTLE;
    #elif __BYTE_ORDER__ == __ORDER_BIG_ENDIAN__
        return Endianness::BIG;
    #endif
#endif
        // Runtime fallback
        return check_endianness_runtime();
    }
    
    static constexpr Compiler get_compiler() {
#if defined(__GNUC__) && !defined(__clang__)
        return Compiler::GCC;
#elif defined(__clang__)
        return Compiler::CLANG;
#elif defined(_MSC_VER)
        return Compiler::MSVC;
#elif defined(__ICC) || defined(__INTEL_COMPILER)
        return Compiler::ICC;
#else
        return Compiler::UNKNOWN;
#endif
    }
    
private:
    static constexpr Endianness check_endianness_runtime() {
        // This would be runtime in practice
        constexpr uint32_t value = 0x01020304;
        constexpr uint8_t* bytes = reinterpret_cast<const uint8_t*>(&value);
        return (bytes[0] == 0x01) ? Endianness::BIG : Endianness::LITTLE;
    }
};

// Safe pointer size abstractions
template<size_t PtrSize>
struct PointerTraits;

template<>
struct PointerTraits<4> {
    using uintptr_type = uint32_t;
    using intptr_type = int32_t;
    static constexpr size_t size = 4;
    static constexpr size_t alignment = 4;
    static constexpr uintptr_type null_value = 0;
    static constexpr uintptr_type max_value = UINT32_MAX;
};

template<>
struct PointerTraits<8> {
    using uintptr_type = uint64_t;
    using intptr_type = int64_t;
    static constexpr size_t size = 8;
    static constexpr size_t alignment = 8;
    static constexpr uintptr_type null_value = 0;
    static constexpr uintptr_type max_value = UINT64_MAX;
};

// Cross-platform pointer wrapper
template<typename T>
class portable_ptr {
private:
    using Traits = PointerTraits<sizeof(void*)>;
    typename Traits::uintptr_type addr_;

public:
    portable_ptr() : addr_(Traits::null_value) {}
    portable_ptr(T* ptr) : addr_(reinterpret_cast<typename Traits::uintptr_type>(ptr)) {}
    portable_ptr(std::nullptr_t) : addr_(Traits::null_value) {}
    
    T* get() const {
        return reinterpret_cast<T*>(addr_);
    }
    
    T& operator*() const { return *get(); }
    T* operator->() const { return get(); }
    
    explicit operator bool() const { return addr_ != Traits::null_value; }
    
    // Safe arithmetic
    portable_ptr operator+(typename Traits::intptr_type offset) const {
        if (!*this) return portable_ptr{};
        
        auto new_addr = addr_ + offset * sizeof(T);
        // Check for overflow
        if ((offset > 0 && new_addr < addr_) || 
            (offset < 0 && new_addr > addr_)) {
            throw std::overflow_error("Pointer arithmetic overflow");
        }
        
        portable_ptr result;
        result.addr_ = new_addr;
        return result;
    }
    
    typename Traits::intptr_type operator-(const portable_ptr& other) const {
        if (addr_ >= other.addr_) {
            return static_cast<typename Traits::intptr_type>((addr_ - other.addr_) / sizeof(T));
        } else {
            return -static_cast<typename Traits::intptr_type>((other.addr_ - addr_) / sizeof(T));
        }
    }
    
    bool operator==(const portable_ptr& other) const { return addr_ == other.addr_; }
    bool operator!=(const portable_ptr& other) const { return addr_ != other.addr_; }
    bool operator<(const portable_ptr& other) const { return addr_ < other.addr_; }
    
    // Serialization support
    typename Traits::uintptr_type raw_address() const { return addr_; }
    void set_raw_address(typename Traits::uintptr_type addr) { addr_ = addr; }
};

// Platform capability detection
struct PlatformCapabilities {
    static bool has_aligned_alloc() {
#if defined(__cpp_aligned_new) || (defined(_MSC_VER) && _MSC_VER >= 1912)
        return true;
#else
        return false;
#endif
    }
    
    static bool has_hardware_prefetch() {
#if defined(__x86_64__) || defined(__i386__) || defined(_M_X64) || defined(_M_IX86)
        return true;  // SSE prefetch instructions
#elif defined(__aarch64__) || defined(__arm__)
        return true;  // ARM prefetch instructions
#else
        return false;
#endif
    }
    
    static size_t cache_line_size() {
#if defined(__x86_64__) || defined(__i386__) || defined(_M_X64) || defined(_M_IX86)
        return 64;    // Intel/AMD typical cache line
#elif defined(__aarch64__) || defined(__arm__)
        return 64;    // ARM typical cache line
#else
        return 64;    // Safe default
#endif
    }
    
    static size_t page_size() {
#ifdef _WIN32
        SYSTEM_INFO si;
        GetSystemInfo(&si);
        return si.dwPageSize;
#else
        return getpagesize();
#endif
    }
};

void platform_info_demo() {
    std::cout << "=== Platform Information ===" << std::endl;
    std::cout << "Pointer size: " << sizeof(void*) << " bytes" << std::endl;
    std::cout << "Architecture: ";
    
    switch (PlatformInfo::get_architecture()) {
        case PlatformInfo::Architecture::X86_64: std::cout << "x86-64"; break;
        case PlatformInfo::Architecture::X86_32: std::cout << "x86-32"; break;
        case PlatformInfo::Architecture::ARM64: std::cout << "ARM64"; break;
        case PlatformInfo::Architecture::ARM32: std::cout << "ARM32"; break;
        case PlatformInfo::Architecture::MIPS64: std::cout << "MIPS64"; break;
        case PlatformInfo::Architecture::MIPS32: std::cout << "MIPS32"; break;
        default: std::cout << "Unknown"; break;
    }
    std::cout << std::endl;
    
    std::cout << "Endianness: ";
    std::cout << (PlatformInfo::get_endianness() == PlatformInfo::Endianness::LITTLE ? 
                  "Little" : "Big") << " Endian" << std::endl;
    
    std::cout << "Cache line size: " << PlatformCapabilities::cache_line_size() << " bytes" << std::endl;
    std::cout << "Page size: " << PlatformCapabilities::page_size() << " bytes" << std::endl;
    std::cout << "Aligned allocation: " << (PlatformCapabilities::has_aligned_alloc() ? 
                                           "Available" : "Not available") << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Endianness & Serialization' : 'Endianness y Serialización',
      code: `#include <cstring>
#include <array>
#include <vector>

// Endianness-aware serialization
class EndianessHandler {
public:
    enum class ByteOrder { LITTLE_ENDIAN, BIG_ENDIAN };
    
    static constexpr ByteOrder native_order() {
        constexpr uint32_t test = 0x01020304;
        constexpr uint8_t first_byte = static_cast<const uint8_t*>(
            static_cast<const void*>(&test))[0];
        return (first_byte == 0x01) ? ByteOrder::BIG_ENDIAN : ByteOrder::LITTLE_ENDIAN;
    }
    
    template<typename T>
    static void swap_bytes(T& value) {
        static_assert(std::is_integral_v<T>, "Only integral types supported");
        
        if constexpr (sizeof(T) == 1) {
            return; // No swap needed for single byte
        } else if constexpr (sizeof(T) == 2) {
            value = __builtin_bswap16(value);
        } else if constexpr (sizeof(T) == 4) {
            value = __builtin_bswap32(value);
        } else if constexpr (sizeof(T) == 8) {
            value = __builtin_bswap64(value);
        }
    }
    
    template<typename T>
    static T to_network_order(T value) {
        if constexpr (native_order() == ByteOrder::LITTLE_ENDIAN) {
            swap_bytes(value);
        }
        return value;
    }
    
    template<typename T>
    static T from_network_order(T value) {
        return to_network_order(value); // Same operation
    }
};

// Cross-platform pointer serialization
template<typename T>
class SerializablePointer {
private:
    T* ptr_;
    
public:
    SerializablePointer(T* p = nullptr) : ptr_(p) {}
    
    // Serialize pointer as offset from base
    template<typename Buffer>
    void serialize(Buffer& buffer, const void* base_address) const {
        if (!ptr_) {
            uint64_t null_offset = UINT64_MAX;
            write_value(buffer, null_offset);
        } else {
            const char* base = static_cast<const char*>(base_address);
            const char* target = reinterpret_cast<const char*>(ptr_);
            
            if (target < base) {
                throw std::runtime_error("Pointer before base address");
            }
            
            uint64_t offset = target - base;
            write_value(buffer, offset);
        }
    }
    
    template<typename Buffer>
    void deserialize(Buffer& buffer, void* base_address) {
        uint64_t offset;
        read_value(buffer, offset);
        
        if (offset == UINT64_MAX) {
            ptr_ = nullptr;
        } else {
            char* base = static_cast<char*>(base_address);
            ptr_ = reinterpret_cast<T*>(base + offset);
        }
    }
    
    T* get() const { return ptr_; }
    T& operator*() const { return *ptr_; }
    T* operator->() const { return ptr_; }

private:
    template<typename Buffer, typename ValueType>
    void write_value(Buffer& buffer, ValueType value) const {
        ValueType network_value = EndianessHandler::to_network_order(value);
        buffer.insert(buffer.end(), 
                     reinterpret_cast<const uint8_t*>(&network_value),
                     reinterpret_cast<const uint8_t*>(&network_value) + sizeof(ValueType));
    }
    
    template<typename Buffer, typename ValueType>
    void read_value(Buffer& buffer, ValueType& value) {
        if (buffer.size() < sizeof(ValueType)) {
            throw std::runtime_error("Buffer underrun");
        }
        
        std::memcpy(&value, buffer.data(), sizeof(ValueType));
        value = EndianessHandler::from_network_order(value);
        buffer.erase(buffer.begin(), buffer.begin() + sizeof(ValueType));
    }
};

// Cross-platform structure serialization
template<typename T>
class PortableStruct {
private:
    T data_;
    
    // Platform-specific padding calculation
    template<typename U>
    static constexpr size_t calculate_padding(size_t offset) {
        constexpr size_t alignment = alignof(U);
        return (alignment - (offset % alignment)) % alignment;
    }

public:
    PortableStruct() = default;
    explicit PortableStruct(const T& data) : data_(data) {}
    
    // Serialize with explicit field ordering (platform-independent)
    std::vector<uint8_t> serialize() const {
        std::vector<uint8_t> buffer;
        serialize_fields(buffer, data_);
        return buffer;
    }
    
    void deserialize(const std::vector<uint8_t>& buffer) {
        auto buffer_copy = buffer;
        deserialize_fields(buffer_copy, data_);
    }
    
    const T& get() const { return data_; }
    T& get() { return data_; }

private:
    template<typename U>
    void serialize_fields(std::vector<uint8_t>& buffer, const U& obj) const {
        // Use reflection-like approach for field serialization
        // This is a simplified version - real implementation would use
        // template metaprogramming or macro-based field iteration
        
        if constexpr (std::is_arithmetic_v<U>) {
            U network_value = EndianessHandler::to_network_order(obj);
            const uint8_t* bytes = reinterpret_cast<const uint8_t*>(&network_value);
            buffer.insert(buffer.end(), bytes, bytes + sizeof(U));
        }
        // Add more type handling as needed
    }
    
    template<typename U>
    void deserialize_fields(std::vector<uint8_t>& buffer, U& obj) {
        if constexpr (std::is_arithmetic_v<U>) {
            if (buffer.size() < sizeof(U)) {
                throw std::runtime_error("Buffer underrun");
            }
            
            std::memcpy(&obj, buffer.data(), sizeof(U));
            obj = EndianessHandler::from_network_order(obj);
            buffer.erase(buffer.begin(), buffer.begin() + sizeof(U));
        }
        // Add more type handling as needed
    }
};

// Example usage
struct NetworkMessage {
    uint32_t message_id;
    uint16_t payload_size;
    SerializablePointer<char> payload_ptr;
    uint64_t timestamp;
};

void serialization_example() {
    const char* payload = "Hello, cross-platform world!";
    NetworkMessage msg{
        .message_id = 12345,
        .payload_size = static_cast<uint16_t>(strlen(payload)),
        .payload_ptr = const_cast<char*>(payload),
        .timestamp = 1640995200000ULL
    };
    
    // Serialize message
    std::vector<uint8_t> buffer;
    
    // Serialize each field explicitly with endianness handling
    auto serialized_id = EndianessHandler::to_network_order(msg.message_id);
    auto serialized_size = EndianessHandler::to_network_order(msg.payload_size);
    auto serialized_timestamp = EndianessHandler::to_network_order(msg.timestamp);
    
    // Add to buffer
    buffer.insert(buffer.end(), 
                 reinterpret_cast<uint8_t*>(&serialized_id),
                 reinterpret_cast<uint8_t*>(&serialized_id) + sizeof(uint32_t));
    
    std::cout << "Serialized " << buffer.size() << " bytes" << std::endl;
    std::cout << "Native byte order: " << 
                 (EndianessHandler::native_order() == EndianessHandler::ByteOrder::LITTLE_ENDIAN ? 
                  "Little Endian" : "Big Endian") << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'ABI & Calling Convention Differences' : 'Diferencias de ABI y Convenciones de Llamada',
      code: `#include <functional>
#include <memory>

// ABI-safe interface design
class ABISafeInterface {
public:
    // Use pure virtual interface to avoid ABI issues
    virtual ~ABISafeInterface() = default;
    
    // Stable ABI methods - use C-style interfaces
    virtual int get_version() const = 0;
    virtual const char* get_name() const = 0;
    virtual bool process_data(const void* input, size_t input_size,
                             void* output, size_t* output_size) = 0;
};

// ABI-safe factory function (C linkage)
extern "C" {
    ABISafeInterface* create_implementation();
    void destroy_implementation(ABISafeInterface* impl);
}

// Implementation details hidden behind interface
class Implementation : public ABISafeInterface {
private:
    std::string name_;
    static constexpr int VERSION = 1;

public:
    Implementation() : name_("CrossPlatformImpl") {}
    
    int get_version() const override { return VERSION; }
    const char* get_name() const override { return name_.c_str(); }
    
    bool process_data(const void* input, size_t input_size,
                     void* output, size_t* output_size) override {
        // Implementation-specific processing
        if (!input || !output || !output_size) return false;
        
        // Simple echo for demonstration
        size_t copy_size = std::min(input_size, *output_size);
        std::memcpy(output, input, copy_size);
        *output_size = copy_size;
        
        return true;
    }
};

// Factory implementation
extern "C" {
    ABISafeInterface* create_implementation() {
        return new Implementation();
    }
    
    void destroy_implementation(ABISafeInterface* impl) {
        delete impl;
    }
}

// Cross-platform calling convention handling
#ifdef _WIN32
    #define PLATFORM_CALL __stdcall
    #define PLATFORM_EXPORT __declspec(dllexport)
#else
    #define PLATFORM_CALL
    #define PLATFORM_EXPORT __attribute__((visibility("default")))
#endif

// Platform-specific function pointer types
template<typename Signature>
struct FunctionTraits;

template<typename R, typename... Args>
struct FunctionTraits<R(Args...)> {
    using return_type = R;
    using args_tuple = std::tuple<Args...>;
    static constexpr size_t arity = sizeof...(Args);
    
#ifdef _WIN32
    using stdcall_type = R(PLATFORM_CALL*)(Args...);
    using cdecl_type = R(*)(Args...);
#else
    using native_type = R(*)(Args...);
#endif
};

// Cross-platform function wrapper
template<typename Signature>
class CrossPlatformFunction;

template<typename R, typename... Args>
class CrossPlatformFunction<R(Args...)> {
private:
    void* func_ptr_;
    
    enum class CallType {
#ifdef _WIN32
        STDCALL,
        CDECL,
#endif
        NATIVE
    } call_type_;

public:
    template<typename FuncPtr>
    CrossPlatformFunction(FuncPtr func) {
        func_ptr_ = reinterpret_cast<void*>(func);
        
#ifdef _WIN32
        // Detect calling convention (simplified)
        if constexpr (std::is_same_v<FuncPtr, typename FunctionTraits<R(Args...)>::stdcall_type>) {
            call_type_ = CallType::STDCALL;
        } else {
            call_type_ = CallType::CDECL;
        }
#else
        call_type_ = CallType::NATIVE;
#endif
    }
    
    R operator()(Args... args) const {
        switch (call_type_) {
#ifdef _WIN32
        case CallType::STDCALL:
            return reinterpret_cast<typename FunctionTraits<R(Args...)>::stdcall_type>(func_ptr_)(args...);
        case CallType::CDECL:
            return reinterpret_cast<typename FunctionTraits<R(Args...)>::cdecl_type>(func_ptr_)(args...);
#endif
        case CallType::NATIVE:
        default:
            return reinterpret_cast<typename FunctionTraits<R(Args...)>::native_type>(func_ptr_)(args...);
        }
    }
};

// Platform-specific data layout handling
template<typename T>
struct PlatformLayout {
    // Calculate structure size with platform-specific padding
    static constexpr size_t calculate_size() {
        // This would use compiler-specific methods to calculate exact layout
        return sizeof(T);
    }
    
    // Get field offset in a portable way
    template<typename U>
    static constexpr size_t offset_of(U T::*member) {
        return reinterpret_cast<size_t>(&(static_cast<T*>(nullptr)->*member));
    }
    
    // Verify layout compatibility
    static bool verify_layout() {
        // Check if current platform layout matches expected layout
        // This would be more sophisticated in real implementation
        return true;
    }
};

// Example of cross-platform structure
struct CrossPlatformData {
    uint32_t magic;           // Always 4 bytes
    uint16_t version;         // Always 2 bytes
    uint16_t flags;           // Always 2 bytes
    uint64_t timestamp;       // Always 8 bytes
    char name[32];           // Fixed size array
    
    // Validate structure layout
    static bool validate_layout() {
        static_assert(sizeof(magic) == 4, "Magic field size mismatch");
        static_assert(sizeof(version) == 2, "Version field size mismatch");
        static_assert(sizeof(timestamp) == 8, "Timestamp field size mismatch");
        
        // Verify offsets are as expected
        constexpr size_t magic_offset = PlatformLayout<CrossPlatformData>::offset_of(&CrossPlatformData::magic);
        constexpr size_t version_offset = PlatformLayout<CrossPlatformData>::offset_of(&CrossPlatformData::version);
        
        static_assert(magic_offset == 0, "Magic field offset mismatch");
        // Add more offset checks as needed
        
        return true;
    }
};

// Cross-platform dynamic library loading
class DynamicLibrary {
private:
#ifdef _WIN32
    HMODULE handle_;
#else
    void* handle_;
#endif

public:
    explicit DynamicLibrary(const char* library_name) {
#ifdef _WIN32
        handle_ = LoadLibraryA(library_name);
#else
        handle_ = dlopen(library_name, RTLD_LAZY);
#endif
        if (!handle_) {
            throw std::runtime_error("Failed to load library");
        }
    }
    
    ~DynamicLibrary() {
        if (handle_) {
#ifdef _WIN32
            FreeLibrary(handle_);
#else
            dlclose(handle_);
#endif
        }
    }
    
    template<typename FuncSignature>
    CrossPlatformFunction<FuncSignature> get_function(const char* func_name) const {
#ifdef _WIN32
        void* func_ptr = GetProcAddress(handle_, func_name);
#else
        void* func_ptr = dlsym(handle_, func_name);
#endif
        
        if (!func_ptr) {
            throw std::runtime_error("Function not found");
        }
        
        return CrossPlatformFunction<FuncSignature>(
            reinterpret_cast<FuncSignature*>(func_ptr));
    }
};

void abi_example() {
    // Verify data layout
    if (!CrossPlatformData::validate_layout()) {
        std::cerr << "Platform layout validation failed!" << std::endl;
        return;
    }
    
    std::cout << "Structure size: " << sizeof(CrossPlatformData) << " bytes" << std::endl;
    std::cout << "Magic offset: " << offsetof(CrossPlatformData, magic) << std::endl;
    std::cout << "Version offset: " << offsetof(CrossPlatformData, version) << std::endl;
    std::cout << "Timestamp offset: " << offsetof(CrossPlatformData, timestamp) << std::endl;
    
    // Use ABI-safe interface
    std::unique_ptr<ABISafeInterface, void(*)(ABISafeInterface*)> 
        impl(create_implementation(), destroy_implementation);
    
    std::cout << "Implementation: " << impl->get_name() << std::endl;
    std::cout << "Version: " << impl->get_version() << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Memory Layout & Stack Growth' : 'Layout de Memoria y Crecimiento de Stack',
      code: `#include <iostream>
#include <vector>
#include <thread>
#include <memory>

// Stack growth detection
class StackAnalyzer {
private:
    static thread_local void* stack_base_;
    static thread_local bool initialized_;
    
public:
    enum class GrowthDirection { UP, DOWN, UNKNOWN };
    
    static GrowthDirection detect_stack_growth() {
        if (!initialized_) {
            stack_base_ = get_approximate_stack_base();
            initialized_ = true;
        }
        
        volatile char current_stack_var;
        void* current_pos = const_cast<char*>(&current_stack_var);
        
        if (current_pos > stack_base_) {
            return GrowthDirection::UP;
        } else if (current_pos < stack_base_) {
            return GrowthDirection::DOWN;
        }
        
        return GrowthDirection::UNKNOWN;
    }
    
    static size_t estimate_stack_usage() {
        if (!initialized_) return 0;
        
        volatile char current_stack_var;
        void* current_pos = const_cast<char*>(&current_stack_var);
        
        ptrdiff_t usage = static_cast<char*>(current_pos) - static_cast<char*>(stack_base_);
        return static_cast<size_t>(std::abs(usage));
    }
    
    static void* get_current_stack_pointer() {
        volatile char current_stack_var;
        return const_cast<char*>(&current_stack_var);
    }

private:
    static void* get_approximate_stack_base() {
#ifdef _WIN32
        // Windows - use TEB (Thread Environment Block)
        return __readgsqword(0x08);  // Stack base from TEB
#elif defined(__linux__)
        // Linux - parse /proc/self/maps or use pthread
        pthread_t self = pthread_self();
        pthread_attr_t attr;
        void* stack_addr;
        size_t stack_size;
        
        if (pthread_getattr_np(self, &attr) == 0) {
            if (pthread_attr_getstack(&attr, &stack_addr, &stack_size) == 0) {
                pthread_attr_destroy(&attr);
                // Stack typically grows down, so base is at high address
                return static_cast<char*>(stack_addr) + stack_size;
            }
            pthread_attr_destroy(&attr);
        }
#endif
        // Fallback - use current position as approximation
        volatile char stack_var;
        return const_cast<char*>(&stack_var);
    }
};

thread_local void* StackAnalyzer::stack_base_ = nullptr;
thread_local bool StackAnalyzer::initialized_ = false;

// Platform-specific memory layout information
class MemoryLayoutInfo {
public:
    struct Layout {
        void* text_segment_start;
        void* text_segment_end;
        void* data_segment_start;
        void* data_segment_end;
        void* heap_start;
        void* heap_current;
        void* stack_base;
        void* stack_current;
        StackAnalyzer::GrowthDirection stack_growth;
    };
    
    static Layout get_current_layout() {
        Layout layout = {};
        
        // Get text segment info (approximate)
        layout.text_segment_start = reinterpret_cast<void*>(&get_current_layout);
        
        // Get data segment info
        static int static_var = 42;
        layout.data_segment_start = &static_var;
        
        // Get heap info
        static std::unique_ptr<int> heap_ptr = std::make_unique<int>(42);
        layout.heap_current = heap_ptr.get();
        
        // Get stack info
        layout.stack_current = StackAnalyzer::get_current_stack_pointer();
        layout.stack_growth = StackAnalyzer::detect_stack_growth();
        
        return layout;
    }
    
    static void print_layout_info(const Layout& layout) {
        std::cout << "=== Memory Layout Information ===" << std::endl;
        std::cout << "Text segment: " << layout.text_segment_start << std::endl;
        std::cout << "Data segment: " << layout.data_segment_start << std::endl;
        std::cout << "Heap current: " << layout.heap_current << std::endl;
        std::cout << "Stack current: " << layout.stack_current << std::endl;
        std::cout << "Stack growth: ";
        
        switch (layout.stack_growth) {
        case StackAnalyzer::GrowthDirection::UP:
            std::cout << "Upward (toward higher addresses)";
            break;
        case StackAnalyzer::GrowthDirection::DOWN:
            std::cout << "Downward (toward lower addresses)";
            break;
        default:
            std::cout << "Unknown";
            break;
        }
        std::cout << std::endl;
        
        std::cout << "Estimated stack usage: " << StackAnalyzer::estimate_stack_usage() 
                  << " bytes" << std::endl;
    }
};

// Safe recursive function with stack overflow protection
class StackGuard {
private:
    static constexpr size_t STACK_GUARD_SIZE = 64 * 1024; // 64KB guard
    void* stack_limit_;
    
public:
    StackGuard() {
        void* current_stack = StackAnalyzer::get_current_stack_pointer();
        
        if (StackAnalyzer::detect_stack_growth() == StackAnalyzer::GrowthDirection::DOWN) {
            stack_limit_ = static_cast<char*>(current_stack) - STACK_GUARD_SIZE;
        } else {
            stack_limit_ = static_cast<char*>(current_stack) + STACK_GUARD_SIZE;
        }
    }
    
    bool check_stack_space() const {
        void* current_stack = StackAnalyzer::get_current_stack_pointer();
        
        if (StackAnalyzer::detect_stack_growth() == StackAnalyzer::GrowthDirection::DOWN) {
            return current_stack > stack_limit_;
        } else {
            return current_stack < stack_limit_;
        }
    }
};

// Cross-platform heap analysis
class HeapAnalyzer {
public:
    struct HeapStats {
        size_t allocated_bytes = 0;
        size_t free_bytes = 0;
        size_t total_bytes = 0;
        size_t allocation_count = 0;
    };
    
    static HeapStats get_heap_stats() {
        HeapStats stats;
        
#ifdef _WIN32
        // Windows heap statistics
        HANDLE heap = GetProcessHeap();
        PROCESS_HEAP_ENTRY entry = {};
        
        while (HeapWalk(heap, &entry)) {
            if (entry.wFlags & PROCESS_HEAP_ENTRY_BUSY) {
                stats.allocated_bytes += entry.cbData;
                stats.allocation_count++;
            } else {
                stats.free_bytes += entry.cbData;
            }
            stats.total_bytes += entry.cbData;
        }
        
#elif defined(__linux__)
        // Linux - use mallinfo if available
        #ifdef __GLIBC__
        struct mallinfo mi = mallinfo();
        stats.allocated_bytes = mi.uordblks;
        stats.free_bytes = mi.fordblks;
        stats.total_bytes = mi.arena;
        #endif
#endif
        
        return stats;
    }
    
    static void print_heap_info(const HeapStats& stats) {
        std::cout << "=== Heap Information ===" << std::endl;
        std::cout << "Allocated: " << stats.allocated_bytes << " bytes" << std::endl;
        std::cout << "Free: " << stats.free_bytes << " bytes" << std::endl;
        std::cout << "Total arena: " << stats.total_bytes << " bytes" << std::endl;
        std::cout << "Allocation count: " << stats.allocation_count << std::endl;
    }
};

// Recursive function with stack protection
int protected_factorial(int n, const StackGuard& guard) {
    if (!guard.check_stack_space()) {
        throw std::runtime_error("Stack overflow protection triggered");
    }
    
    if (n <= 1) return 1;
    return n * protected_factorial(n - 1, guard);
}

void memory_layout_demo() {
    std::cout << "=== Cross-Platform Memory Layout Demo ===" << std::endl;
    
    // Analyze current memory layout
    auto layout = MemoryLayoutInfo::get_current_layout();
    MemoryLayoutInfo::print_layout_info(layout);
    
    // Analyze heap
    auto heap_stats = HeapAnalyzer::get_heap_stats();
    HeapAnalyzer::print_heap_info(heap_stats);
    
    // Test stack protection
    try {
        StackGuard guard;
        int result = protected_factorial(10, guard);
        std::cout << "Protected factorial(10) = " << result << std::endl;
        
        // This might trigger stack protection
        // result = protected_factorial(10000, guard);
        
    } catch (const std::exception& e) {
        std::cout << "Stack protection triggered: " << e.what() << std::endl;
    }
    
    // Test with multiple threads to see different stack layouts
    std::vector<std::thread> threads;
    for (int i = 0; i < 3; ++i) {
        threads.emplace_back([i]() {
            std::cout << "\\nThread " << i << " memory layout:" << std::endl;
            auto thread_layout = MemoryLayoutInfo::get_current_layout();
            std::cout << "Stack position: " << thread_layout.stack_current << std::endl;
            std::cout << "Stack usage: " << StackAnalyzer::estimate_stack_usage() << " bytes" << std::endl;
        });
    }
    
    for (auto& t : threads) {
        t.join();
    }
}`
    },
    {
      title: state.language === 'en' ? 'Cross-Platform File Handling' : 'Manejo de Archivos Multiplataforma',
      code: `#include <fstream>
#include <filesystem>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>
#endif

// Cross-platform file path handling
class CrossPlatformPath {
private:
    std::filesystem::path path_;

public:
    CrossPlatformPath() = default;
    explicit CrossPlatformPath(const std::string& path) : path_(path) {
        normalize_path();
    }
    
    // Platform-specific path separators
    static constexpr char native_separator() {
#ifdef _WIN32
        return '\\\\';
#else
        return '/';
#endif
    }
    
    // Convert to platform-native path
    std::string native() const {
        return path_.string();
    }
    
    // Convert to portable path (always forward slashes)
    std::string portable() const {
        std::string result = path_.string();
        std::replace(result.begin(), result.end(), '\\\\', '/');
        return result;
    }
    
    // Join paths in platform-appropriate way
    CrossPlatformPath operator/(const std::string& other) const {
        CrossPlatformPath result;
        result.path_ = path_ / other;
        return result;
    }
    
    // Check if path exists
    bool exists() const {
        std::error_code ec;
        return std::filesystem::exists(path_, ec);
    }
    
    // Check if it's a directory
    bool is_directory() const {
        std::error_code ec;
        return std::filesystem::is_directory(path_, ec);
    }
    
    // Get file size
    std::uintmax_t file_size() const {
        std::error_code ec;
        return std::filesystem::file_size(path_, ec);
    }
    
    // Create directory (and parents if needed)
    bool create_directories() const {
        std::error_code ec;
        return std::filesystem::create_directories(path_, ec);
    }

private:
    void normalize_path() {
        // Normalize path separators and resolve . and ..
        path_ = std::filesystem::absolute(path_);
        path_ = path_.lexically_normal();
    }
};

// Cross-platform file I/O with proper encoding handling
class CrossPlatformFile {
private:
    std::fstream file_;
    CrossPlatformPath path_;
    bool is_binary_;

public:
    enum class Mode { READ, WRITE, APPEND, READ_WRITE };
    enum class Encoding { UTF8, UTF16LE, UTF16BE, ASCII };
    
    CrossPlatformFile(const CrossPlatformPath& path, Mode mode, 
                     bool binary = false, Encoding encoding = Encoding::UTF8)
        : path_(path), is_binary_(binary) {
        
        std::ios::openmode flags = std::ios::in;
        
        switch (mode) {
        case Mode::READ:
            flags = std::ios::in;
            break;
        case Mode::WRITE:
            flags = std::ios::out | std::ios::trunc;
            break;
        case Mode::APPEND:
            flags = std::ios::out | std::ios::app;
            break;
        case Mode::READ_WRITE:
            flags = std::ios::in | std::ios::out;
            break;
        }
        
        if (binary) {
            flags |= std::ios::binary;
        }
        
        // Platform-specific file opening
#ifdef _WIN32
        // Windows: Handle Unicode file names properly
        std::wstring wide_path = std::filesystem::path(path.native()).wstring();
        file_.open(wide_path, flags);
#else
        // Unix-like: UTF-8 file names work directly
        file_.open(path.native(), flags);
#endif
        
        if (!file_.is_open()) {
            throw std::runtime_error("Failed to open file: " + path.native());
        }
        
        // Handle BOM for text files
        if (!binary && (mode == Mode::READ || mode == Mode::READ_WRITE)) {
            handle_bom(encoding);
        }
    }
    
    ~CrossPlatformFile() {
        if (file_.is_open()) {
            file_.close();
        }
    }
    
    // Read data with proper encoding handling
    std::vector<uint8_t> read_binary(size_t max_bytes = SIZE_MAX) {
        if (!is_binary_) {
            throw std::runtime_error("File not opened in binary mode");
        }
        
        file_.seekg(0, std::ios::end);
        auto file_size = static_cast<size_t>(file_.tellg());
        file_.seekg(0, std::ios::beg);
        
        size_t bytes_to_read = std::min(max_bytes, file_size);
        std::vector<uint8_t> buffer(bytes_to_read);
        
        file_.read(reinterpret_cast<char*>(buffer.data()), bytes_to_read);
        buffer.resize(static_cast<size_t>(file_.gcount()));
        
        return buffer;
    }
    
    std::string read_text() {
        if (is_binary_) {
            throw std::runtime_error("File opened in binary mode");
        }
        
        std::ostringstream content;
        content << file_.rdbuf();
        return content.str();
    }
    
    // Write data with proper encoding
    void write_binary(const std::vector<uint8_t>& data) {
        if (!is_binary_) {
            throw std::runtime_error("File not opened in binary mode");
        }
        
        file_.write(reinterpret_cast<const char*>(data.data()), data.size());
        file_.flush();
    }
    
    void write_text(const std::string& text, Encoding encoding = Encoding::UTF8) {
        if (is_binary_) {
            throw std::runtime_error("File opened in binary mode");
        }
        
        switch (encoding) {
        case Encoding::UTF8:
            file_ << text;
            break;
        case Encoding::UTF16LE:
            write_utf16_le(text);
            break;
        case Encoding::UTF16BE:
            write_utf16_be(text);
            break;
        case Encoding::ASCII:
            // Filter non-ASCII characters
            for (char c : text) {
                if (static_cast<unsigned char>(c) < 128) {
                    file_ << c;
                }
            }
            break;
        }
        file_.flush();
    }
    
    bool is_open() const { return file_.is_open(); }
    std::streampos tell() { return file_.tellg(); }
    void seek(std::streampos pos) { file_.seekg(pos); }

private:
    void handle_bom(Encoding expected_encoding) {
        // Read potential BOM
        std::streampos initial_pos = file_.tellg();
        std::array<char, 4> bom_buffer = {};
        file_.read(bom_buffer.data(), 4);
        auto bytes_read = file_.gcount();
        
        // Check for UTF-8 BOM (EF BB BF)
        if (bytes_read >= 3 && 
            static_cast<unsigned char>(bom_buffer[0]) == 0xEF &&
            static_cast<unsigned char>(bom_buffer[1]) == 0xBB &&
            static_cast<unsigned char>(bom_buffer[2]) == 0xBF) {
            
            if (expected_encoding == Encoding::UTF8) {
                file_.seekg(initial_pos + std::streamoff(3));
                return;
            }
        }
        
        // Check for UTF-16 LE BOM (FF FE)
        if (bytes_read >= 2 &&
            static_cast<unsigned char>(bom_buffer[0]) == 0xFF &&
            static_cast<unsigned char>(bom_buffer[1]) == 0xFE) {
            
            if (expected_encoding == Encoding::UTF16LE) {
                file_.seekg(initial_pos + std::streamoff(2));
                return;
            }
        }
        
        // Check for UTF-16 BE BOM (FE FF)
        if (bytes_read >= 2 &&
            static_cast<unsigned char>(bom_buffer[0]) == 0xFE &&
            static_cast<unsigned char>(bom_buffer[1]) == 0xFF) {
            
            if (expected_encoding == Encoding::UTF16BE) {
                file_.seekg(initial_pos + std::streamoff(2));
                return;
            }
        }
        
        // No BOM found or doesn't match expected encoding
        file_.seekg(initial_pos);
    }
    
    void write_utf16_le(const std::string& text) {
        // Simple UTF-8 to UTF-16LE conversion (basic implementation)
        for (size_t i = 0; i < text.length(); ++i) {
            char c = text[i];
            if (static_cast<unsigned char>(c) < 128) {
                // ASCII character
                file_.put(c);
                file_.put('\\0');
            } else {
                // For full UTF-8 to UTF-16 conversion, use proper library
                // This is a simplified version
                file_.put('?');
                file_.put('\\0');
            }
        }
    }
    
    void write_utf16_be(const std::string& text) {
        // Similar to write_utf16_le but with bytes swapped
        for (size_t i = 0; i < text.length(); ++i) {
            char c = text[i];
            if (static_cast<unsigned char>(c) < 128) {
                file_.put('\\0');
                file_.put(c);
            } else {
                file_.put('\\0');
                file_.put('?');
            }
        }
    }
};

// Cross-platform directory operations
class DirectoryOperations {
public:
    static std::vector<CrossPlatformPath> list_directory(const CrossPlatformPath& dir_path) {
        std::vector<CrossPlatformPath> entries;
        
        std::error_code ec;
        for (const auto& entry : std::filesystem::directory_iterator(dir_path.native(), ec)) {
            if (!ec) {
                entries.emplace_back(entry.path().string());
            }
        }
        
        return entries;
    }
    
    static bool copy_file(const CrossPlatformPath& from, const CrossPlatformPath& to) {
        std::error_code ec;
        return std::filesystem::copy_file(from.native(), to.native(), ec);
    }
    
    static bool move_file(const CrossPlatformPath& from, const CrossPlatformPath& to) {
        std::error_code ec;
        std::filesystem::rename(from.native(), to.native(), ec);
        return !ec;
    }
    
    static bool remove_file(const CrossPlatformPath& file_path) {
        std::error_code ec;
        return std::filesystem::remove(file_path.native(), ec);
    }
    
    static std::uintmax_t remove_all(const CrossPlatformPath& dir_path) {
        std::error_code ec;
        return std::filesystem::remove_all(dir_path.native(), ec);
    }
    
    // Get platform-specific temporary directory
    static CrossPlatformPath temp_directory() {
        std::error_code ec;
        auto temp_path = std::filesystem::temp_directory_path(ec);
        if (ec) {
#ifdef _WIN32
            return CrossPlatformPath("C:\\\\Temp");
#else
            return CrossPlatformPath("/tmp");
#endif
        }
        return CrossPlatformPath(temp_path.string());
    }
    
    // Get platform-specific application data directory
    static CrossPlatformPath app_data_directory(const std::string& app_name) {
#ifdef _WIN32
        // Windows: %APPDATA%\\AppName
        const char* appdata = std::getenv("APPDATA");
        if (appdata) {
            return CrossPlatformPath(appdata) / app_name;
        }
        return CrossPlatformPath("C:\\\\ProgramData") / app_name;
#elif defined(__APPLE__)
        // macOS: ~/Library/Application Support/AppName
        const char* home = std::getenv("HOME");
        if (home) {
            return CrossPlatformPath(home) / "Library" / "Application Support" / app_name;
        }
        return CrossPlatformPath("/Library/Application Support") / app_name;
#else
        // Linux/Unix: ~/.local/share/AppName or follow XDG Base Directory spec
        const char* xdg_data = std::getenv("XDG_DATA_HOME");
        if (xdg_data) {
            return CrossPlatformPath(xdg_data) / app_name;
        }
        
        const char* home = std::getenv("HOME");
        if (home) {
            return CrossPlatformPath(home) / ".local" / "share" / app_name;
        }
        return CrossPlatformPath("/usr/local/share") / app_name;
#endif
    }
};

// Memory-mapped file for efficient large file handling
class MemoryMappedFile {
private:
#ifdef _WIN32
    HANDLE file_handle_;
    HANDLE mapping_handle_;
#else
    int file_descriptor_;
#endif
    void* mapped_data_;
    size_t file_size_;
    bool is_writable_;

public:
    MemoryMappedFile(const CrossPlatformPath& path, bool writable = false)
        : mapped_data_(nullptr), file_size_(0), is_writable_(writable) {
        
#ifdef _WIN32
        // Windows implementation
        DWORD access = writable ? (GENERIC_READ | GENERIC_WRITE) : GENERIC_READ;
        DWORD share = FILE_SHARE_READ;
        DWORD creation = OPEN_EXISTING;
        
        file_handle_ = CreateFileW(
            std::filesystem::path(path.native()).wstring().c_str(),
            access, share, nullptr, creation, FILE_ATTRIBUTE_NORMAL, nullptr);
            
        if (file_handle_ == INVALID_HANDLE_VALUE) {
            throw std::runtime_error("Failed to open file for memory mapping");
        }
        
        LARGE_INTEGER size;
        if (!GetFileSizeEx(file_handle_, &size)) {
            CloseHandle(file_handle_);
            throw std::runtime_error("Failed to get file size");
        }
        file_size_ = static_cast<size_t>(size.QuadPart);
        
        DWORD protect = writable ? PAGE_READWRITE : PAGE_READONLY;
        mapping_handle_ = CreateFileMappingW(file_handle_, nullptr, protect, 0, 0, nullptr);
        if (!mapping_handle_) {
            CloseHandle(file_handle_);
            throw std::runtime_error("Failed to create file mapping");
        }
        
        DWORD map_access = writable ? FILE_MAP_WRITE : FILE_MAP_READ;
        mapped_data_ = MapViewOfFile(mapping_handle_, map_access, 0, 0, 0);
        if (!mapped_data_) {
            CloseHandle(mapping_handle_);
            CloseHandle(file_handle_);
            throw std::runtime_error("Failed to map file view");
        }
        
#else
        // Unix implementation
        int flags = writable ? O_RDWR : O_RDONLY;
        file_descriptor_ = open(path.native().c_str(), flags);
        if (file_descriptor_ == -1) {
            throw std::runtime_error("Failed to open file for memory mapping");
        }
        
        struct stat file_stat;
        if (fstat(file_descriptor_, &file_stat) == -1) {
            close(file_descriptor_);
            throw std::runtime_error("Failed to get file statistics");
        }
        file_size_ = static_cast<size_t>(file_stat.st_size);
        
        int prot = PROT_READ | (writable ? PROT_WRITE : 0);
        mapped_data_ = mmap(nullptr, file_size_, prot, MAP_SHARED, file_descriptor_, 0);
        if (mapped_data_ == MAP_FAILED) {
            close(file_descriptor_);
            throw std::runtime_error("Failed to map file");
        }
#endif
    }
    
    ~MemoryMappedFile() {
#ifdef _WIN32
        if (mapped_data_) UnmapViewOfFile(mapped_data_);
        if (mapping_handle_) CloseHandle(mapping_handle_);
        if (file_handle_) CloseHandle(file_handle_);
#else
        if (mapped_data_ != MAP_FAILED) {
            munmap(mapped_data_, file_size_);
        }
        if (file_descriptor_ != -1) {
            close(file_descriptor_);
        }
#endif
    }
    
    const void* data() const { return mapped_data_; }
    void* data() { return is_writable_ ? mapped_data_ : nullptr; }
    size_t size() const { return file_size_; }
    
    // Hint the OS about access patterns
    void advise_sequential() {
#ifdef _WIN32
        // Windows doesn't have direct equivalent, but can use prefetch
#else
        if (mapped_data_ != MAP_FAILED) {
            madvise(mapped_data_, file_size_, MADV_SEQUENTIAL);
        }
#endif
    }
    
    void advise_random() {
#ifdef _WIN32
        // Windows doesn't have direct equivalent
#else
        if (mapped_data_ != MAP_FAILED) {
            madvise(mapped_data_, file_size_, MADV_RANDOM);
        }
#endif
    }
};

void cross_platform_file_demo() {
    std::cout << "=== Cross-Platform File Handling Demo ===" << std::endl;
    
    try {
        // Test path operations
        CrossPlatformPath app_dir = DirectoryOperations::app_data_directory("PointerQuest");
        std::cout << "App data directory: " << app_dir.native() << std::endl;
        std::cout << "Portable path: " << app_dir.portable() << std::endl;
        
        // Create directory structure
        if (!app_dir.exists()) {
            if (app_dir.create_directories()) {
                std::cout << "Created application directory" << std::endl;
            }
        }
        
        // Test file I/O
        CrossPlatformPath test_file = app_dir / "test_file.txt";
        {
            CrossPlatformFile file(test_file, CrossPlatformFile::Mode::WRITE);
            file.write_text("Hello, cross-platform world!\\n");
            file.write_text("This file was created with proper platform handling.\\n");
        }
        
        // Read back the file
        {
            CrossPlatformFile file(test_file, CrossPlatformFile::Mode::READ);
            std::string content = file.read_text();
            std::cout << "File content:\\n" << content << std::endl;
        }
        
        // Test directory listing
        auto entries = DirectoryOperations::list_directory(app_dir);
        std::cout << "Directory contents:" << std::endl;
        for (const auto& entry : entries) {
            std::cout << "  " << entry.native();
            if (entry.is_directory()) {
                std::cout << " [DIR]";
            } else {
                std::cout << " (" << entry.file_size() << " bytes)";
            }
            std::cout << std::endl;
        }
        
        // Clean up
        DirectoryOperations::remove_file(test_file);
        
    } catch (const std::exception& e) {
        std::cout << "File operation error: " << e.what() << std::endl;
    }
}`
    },
    {
      title: state.language === 'en' ? 'Platform Optimization Opportunities' : 'Oportunidades de Optimización por Plataforma',
      code: `#include <immintrin.h>  // Intel intrinsics
#ifdef __aarch64__
#include <arm_neon.h>   // ARM NEON intrinsics
#endif
#include <vector>
#include <chrono>
#include <numeric>
#include <iostream>
#ifdef _WIN32
#include <intrin.h>
#endif

// Platform-specific optimization dispatcher
class OptimizationDispatcher {
public:
    enum class CPUFeatures {
        NONE = 0,
        SSE2 = 1 << 0,
        SSE4_1 = 1 << 1,
        AVX = 1 << 2,
        AVX2 = 1 << 3,
        AVX512 = 1 << 4,
        NEON = 1 << 5,
        SVE = 1 << 6  // ARM Scalable Vector Extension
    };
    
private:
    static CPUFeatures detected_features_;
    static bool features_detected_;
    
public:
    static CPUFeatures get_cpu_features() {
        if (!features_detected_) {
            detect_features();
            features_detected_ = true;
        }
        return detected_features_;
    }
    
private:
    static void detect_features() {
        detected_features_ = CPUFeatures::NONE;
        
#if defined(__x86_64__) || defined(__i386__) || defined(_M_X64) || defined(_M_IX86)
        // x86/x64 feature detection
        int cpuinfo[4];
        
        // Check for SSE2
        __cpuid(cpuinfo, 1);
        if (cpuinfo[3] & (1 << 26)) {
            detected_features_ = static_cast<CPUFeatures>(
                static_cast<int>(detected_features_) | static_cast<int>(CPUFeatures::SSE2));
        }
        
        // Check for SSE4.1
        if (cpuinfo[2] & (1 << 19)) {
            detected_features_ = static_cast<CPUFeatures>(
                static_cast<int>(detected_features_) | static_cast<int>(CPUFeatures::SSE4_1));
        }
        
        // Check for AVX
        if (cpuinfo[2] & (1 << 28)) {
            detected_features_ = static_cast<CPUFeatures>(
                static_cast<int>(detected_features_) | static_cast<int>(CPUFeatures::AVX));
        }
        
        // Check for AVX2
        __cpuid(cpuinfo, 7);
        if (cpuinfo[1] & (1 << 5)) {
            detected_features_ = static_cast<CPUFeatures>(
                static_cast<int>(detected_features_) | static_cast<int>(CPUFeatures::AVX2));
        }
        
        // Check for AVX-512
        if (cpuinfo[1] & (1 << 16)) {
            detected_features_ = static_cast<CPUFeatures>(
                static_cast<int>(detected_features_) | static_cast<int>(CPUFeatures::AVX512));
        }
        
#elif defined(__aarch64__) || defined(__arm__)
        // ARM feature detection
        detected_features_ = static_cast<CPUFeatures>(
            static_cast<int>(detected_features_) | static_cast<int>(CPUFeatures::NEON));
        
        // Check for SVE (ARM Scalable Vector Extension)
        #ifdef __ARM_FEATURE_SVE
        detected_features_ = static_cast<CPUFeatures>(
            static_cast<int>(detected_features_) | static_cast<int>(CPUFeatures::SVE));
        #endif
#endif
    }
};

OptimizationDispatcher::CPUFeatures OptimizationDispatcher::detected_features_ = 
    OptimizationDispatcher::CPUFeatures::NONE;
bool OptimizationDispatcher::features_detected_ = false;

// Platform-optimized memory operations
class OptimizedMemory {
public:
    // Optimized memory copy
    static void* optimized_memcpy(void* dest, const void* src, size_t count) {
        auto features = OptimizationDispatcher::get_cpu_features();
        
#if defined(__x86_64__) || defined(_M_X64)
        if (static_cast<int>(features) & static_cast<int>(OptimizationDispatcher::CPUFeatures::AVX2)) {
            return avx2_memcpy(dest, src, count);
        } else if (static_cast<int>(features) & static_cast<int>(OptimizationDispatcher::CPUFeatures::SSE2)) {
            return sse2_memcpy(dest, src, count);
        }
#elif defined(__aarch64__)
        if (static_cast<int>(features) & static_cast<int>(OptimizationDispatcher::CPUFeatures::NEON)) {
            return neon_memcpy(dest, src, count);
        }
#endif
        
        return std::memcpy(dest, src, count);
    }
    
    // Optimized memory set
    static void* optimized_memset(void* dest, int value, size_t count) {
        auto features = OptimizationDispatcher::get_cpu_features();
        
#if defined(__x86_64__) || defined(_M_X64)
        if (static_cast<int>(features) & static_cast<int>(OptimizationDispatcher::CPUFeatures::AVX2)) {
            return avx2_memset(dest, value, count);
        }
#elif defined(__aarch64__)
        if (static_cast<int>(features) & static_cast<int>(OptimizationDispatcher::CPUFeatures::NEON)) {
            return neon_memset(dest, value, count);
        }
#endif
        
        return std::memset(dest, value, count);
    }

private:
#if defined(__x86_64__) || defined(_M_X64)
    static void* avx2_memcpy(void* dest, const void* src, size_t count) {
        if (count < 32) {
            return std::memcpy(dest, src, count);
        }
        
        char* d = static_cast<char*>(dest);
        const char* s = static_cast<const char*>(src);
        
        // AVX2 copy 32 bytes at a time
        size_t avx2_count = count & ~31;  // Round down to multiple of 32
        for (size_t i = 0; i < avx2_count; i += 32) {
            __m256i data = _mm256_loadu_si256(reinterpret_cast<const __m256i*>(s + i));
            _mm256_storeu_si256(reinterpret_cast<__m256i*>(d + i), data);
        }
        
        // Copy remaining bytes
        if (count & 31) {
            std::memcpy(d + avx2_count, s + avx2_count, count & 31);
        }
        
        return dest;
    }
    
    static void* sse2_memcpy(void* dest, const void* src, size_t count) {
        if (count < 16) {
            return std::memcpy(dest, src, count);
        }
        
        char* d = static_cast<char*>(dest);
        const char* s = static_cast<const char*>(src);
        
        // SSE2 copy 16 bytes at a time
        size_t sse2_count = count & ~15;
        for (size_t i = 0; i < sse2_count; i += 16) {
            __m128i data = _mm_loadu_si128(reinterpret_cast<const __m128i*>(s + i));
            _mm_storeu_si128(reinterpret_cast<__m128i*>(d + i), data);
        }
        
        // Copy remaining bytes
        if (count & 15) {
            std::memcpy(d + sse2_count, s + sse2_count, count & 15);
        }
        
        return dest;
    }
    
    static void* avx2_memset(void* dest, int value, size_t count) {
        if (count < 32) {
            return std::memset(dest, value, count);
        }
        
        char* d = static_cast<char*>(dest);
        __m256i set_value = _mm256_set1_epi8(static_cast<char>(value));
        
        size_t avx2_count = count & ~31;
        for (size_t i = 0; i < avx2_count; i += 32) {
            _mm256_storeu_si256(reinterpret_cast<__m256i*>(d + i), set_value);
        }
        
        if (count & 31) {
            std::memset(d + avx2_count, value, count & 31);
        }
        
        return dest;
    }
#endif

#ifdef __aarch64__
    static void* neon_memcpy(void* dest, const void* src, size_t count) {
        if (count < 16) {
            return std::memcpy(dest, src, count);
        }
        
        char* d = static_cast<char*>(dest);
        const char* s = static_cast<const char*>(src);
        
        // NEON copy 16 bytes at a time
        size_t neon_count = count & ~15;
        for (size_t i = 0; i < neon_count; i += 16) {
            uint8x16_t data = vld1q_u8(reinterpret_cast<const uint8_t*>(s + i));
            vst1q_u8(reinterpret_cast<uint8_t*>(d + i), data);
        }
        
        if (count & 15) {
            std::memcpy(d + neon_count, s + neon_count, count & 15);
        }
        
        return dest;
    }
    
    static void* neon_memset(void* dest, int value, size_t count) {
        if (count < 16) {
            return std::memset(dest, value, count);
        }
        
        char* d = static_cast<char*>(dest);
        uint8x16_t set_value = vdupq_n_u8(static_cast<uint8_t>(value));
        
        size_t neon_count = count & ~15;
        for (size_t i = 0; i < neon_count; i += 16) {
            vst1q_u8(reinterpret_cast<uint8_t*>(d + i), set_value);
        }
        
        if (count & 15) {
            std::memset(d + neon_count, value, count & 15);
        }
        
        return dest;
    }
#endif
};

// Platform-specific prefetching
class PlatformPrefetch {
public:
    enum class PrefetchLevel {
        L1_CACHE,
        L2_CACHE,
        L3_CACHE,
        NON_TEMPORAL
    };
    
    static void prefetch(const void* addr, PrefetchLevel level) {
#if defined(__x86_64__) || defined(__i386__) || defined(_M_X64) || defined(_M_IX86)
        switch (level) {
        case PrefetchLevel::L1_CACHE:
            _mm_prefetch(static_cast<const char*>(addr), _MM_HINT_T0);
            break;
        case PrefetchLevel::L2_CACHE:
            _mm_prefetch(static_cast<const char*>(addr), _MM_HINT_T1);
            break;
        case PrefetchLevel::L3_CACHE:
            _mm_prefetch(static_cast<const char*>(addr), _MM_HINT_T2);
            break;
        case PrefetchLevel::NON_TEMPORAL:
            _mm_prefetch(static_cast<const char*>(addr), _MM_HINT_NTA);
            break;
        }
#elif defined(__aarch64__) || defined(__arm__)
        // ARM prefetch
        switch (level) {
        case PrefetchLevel::L1_CACHE:
            __builtin_prefetch(addr, 0, 3);  // Read, high locality
            break;
        case PrefetchLevel::L2_CACHE:
            __builtin_prefetch(addr, 0, 2);  // Read, moderate locality
            break;
        case PrefetchLevel::L3_CACHE:
            __builtin_prefetch(addr, 0, 1);  // Read, low locality
            break;
        case PrefetchLevel::NON_TEMPORAL:
            __builtin_prefetch(addr, 0, 0);  // Read, no locality
            break;
        }
#endif
    }
    
    // Prefetch with platform-specific distance
    template<typename Iterator>
    static void prefetch_ahead(Iterator current, Iterator end, size_t distance = 0) {
        if (distance == 0) {
#if defined(__x86_64__) || defined(_M_X64)
            distance = 64;  // Typical x86 prefetch distance
#elif defined(__aarch64__)
            distance = 32;  // Typical ARM prefetch distance
#else
            distance = 16;  // Conservative default
#endif
        }
        
        Iterator prefetch_it = current;
        for (size_t i = 0; i < distance && prefetch_it != end; ++i, ++prefetch_it) {
            prefetch(&(*prefetch_it), PrefetchLevel::L1_CACHE);
        }
    }
};

void optimization_demo() {
    std::cout << "=== Platform Optimization Demo ===" << std::endl;
    
    // Display detected CPU features
    auto features = OptimizationDispatcher::get_cpu_features();
    std::cout << "Detected CPU features: ";
    
    if (static_cast<int>(features) & static_cast<int>(OptimizationDispatcher::CPUFeatures::SSE2)) {
        std::cout << "SSE2 ";
    }
    if (static_cast<int>(features) & static_cast<int>(OptimizationDispatcher::CPUFeatures::AVX)) {
        std::cout << "AVX ";
    }
    if (static_cast<int>(features) & static_cast<int>(OptimizationDispatcher::CPUFeatures::AVX2)) {
        std::cout << "AVX2 ";
    }
    if (static_cast<int>(features) & static_cast<int>(OptimizationDispatcher::CPUFeatures::NEON)) {
        std::cout << "NEON ";
    }
    std::cout << std::endl;
    
    // Test optimized memory operations
    const size_t test_size = 1024 * 1024;  // 1MB
    std::vector<char> src(test_size, 0xAA);
    std::vector<char> dest(test_size);
    
    auto start = std::chrono::high_resolution_clock::now();
    OptimizedMemory::optimized_memcpy(dest.data(), src.data(), test_size);
    auto end = std::chrono::high_resolution_clock::now();
    
    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    std::cout << "Optimized memcpy of " << test_size << " bytes took: " 
              << duration.count() << " microseconds" << std::endl;
    
    // Test prefetching
    std::vector<int> data(1000);
    std::iota(data.begin(), data.end(), 0);
    
    volatile int sum = 0;
    start = std::chrono::high_resolution_clock::now();
    
    for (auto it = data.begin(); it != data.end(); ++it) {
        PlatformPrefetch::prefetch_ahead(it, data.end());
        sum += *it;
    }
    
    end = std::chrono::high_resolution_clock::now();
    duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    std::cout << "Sum with prefetching: " << sum << " (took " 
              << duration.count() << " microseconds)" << std::endl;
}`
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 108: Cross-Platform Considerations' : 'Lección 108: Consideraciones Multiplataforma'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <CrossPlatformVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <SectionTitle>{state.language === 'en' ? 'Cross-Platform Development Techniques' : 'Técnicas de Desarrollo Multiplataforma'}</SectionTitle>
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
              <SectionTitle>{state.language === 'en' ? 'Platform Detection' : 'Detección de Plataforma'}</SectionTitle>
              <p>
                {state.language === 'en' 
                  ? 'Comprehensive runtime and compile-time detection of platform capabilities, architecture, and features.'
                  : 'Detección comprensiva en tiempo de ejecución y compilación de capacidades, arquitectura y características de plataforma.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'ABI Compatibility' : 'Compatibilidad ABI'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Design patterns and techniques for maintaining binary compatibility across different platforms and compilers.'
                  : 'Patrones de diseño y técnicas para mantener compatibilidad binaria entre diferentes plataformas y compiladores.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Memory Layout Awareness' : 'Conciencia de Layout de Memoria'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Understanding and handling differences in stack growth, heap organization, and memory addressing across platforms.'
                  : 'Entendimiento y manejo de diferencias en crecimiento de stack, organización de heap y direccionamiento de memoria entre plataformas.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Cross-Platform File I/O' : 'E/S de Archivos Multiplataforma'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Unified file handling across platforms with proper encoding support, path normalization, and memory-mapped file access.'
                  : 'Manejo unificado de archivos entre plataformas con soporte adecuado de codificación, normalización de rutas y acceso a archivos mapeados en memoria.'}
              </p>
          </div>
            
            <div className="concept-card">
              <SectionTitle>{state.language === 'en' ? 'Platform Optimization' : 'Optimización por Plataforma'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Leveraging platform-specific features like SIMD instructions, cache optimization, and hardware capabilities.'
                  : 'Aprovechamiento de características específicas de plataforma como instrucciones SIMD, optimización de caché y capacidades de hardware.'}
              </p>
          </div>
          </div>
        </div>

        <div className="best-practices">
          <SectionTitle>{state.language === 'en' ? 'Best Practices' : 'Mejores Prácticas'}</SectionTitle>
<ul>
            <li>
              {state.language === 'en'
                ? 'Use compile-time feature detection combined with runtime capability checks'
                : 'Usa detección de características en tiempo de compilación combinada con verificaciones de capacidad en tiempo de ejecución'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Design ABI-stable interfaces using C linkage and pure virtual base classes'
                : 'Diseña interfaces ABI-estables usando enlace C y clases base virtuales puras'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Handle endianness explicitly when serializing data or communicating across platforms'
                : 'Maneja endianness explícitamente al serializar datos o comunicarse entre plataformas'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement platform-specific optimizations with clear fallback mechanisms'
                : 'Implementa optimizaciones específicas de plataforma con mecanismos de fallback claros'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Use platform-agnostic file path operations and handle text encoding properly'
                : 'Usa operaciones de rutas de archivos independientes de plataforma y maneja la codificación de texto apropiadamente'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Test thoroughly on all target platforms to catch platform-specific issues early'
                : 'Prueba exhaustivamente en todas las plataformas objetivo para detectar problemas específicos de plataforma temprano'}
            </li>
          </ul>
          </div>
      </div>
    </div>
  );
}