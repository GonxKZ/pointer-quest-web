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

interface TypePunningState {
  demonstrationType: 'bit_cast' | 'union_punning' | 'memcpy_method' | 'unsafe_cast';
  currentExample: number;
  sourceType: string;
  targetType: string;
  sourceValue: string;
  targetValue: string;
  binaryRepresentation: string;
  isValidConversion: boolean;
  endianness: 'little' | 'big';
  conversionMethod: string;
  warningLevel: 'safe' | 'implementation_defined' | 'undefined_behavior';
}

const TypePunningVisualization: React.FC<{ state: TypePunningState }> = ({ state }) => {
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'std::bit_cast': return '#2ed573';
      case 'memcpy': return '#00d4ff';
      case 'union': return '#ffa500';
      case 'reinterpret_cast': return '#ff4757';
      default: return '#57606f';
    }
  };

  const getWarningColor = (level: string) => {
    switch (level) {
      case 'safe': return '#2ed573';
      case 'implementation_defined': return '#ffa500';
      case 'undefined_behavior': return '#ff4757';
      default: return '#57606f';
    }
  };

  const examples = [
    {
      title: 'Float to Int Bits (IEEE 754)',
      sourceType: 'float',
      targetType: 'uint32_t',
      sourceValue: '3.14159f',
      binaryRep: '01000000010010010000111111011011'
    },
    {
      title: 'Double to Two Ints',
      sourceType: 'double', 
      targetType: 'uint32_t[2]',
      sourceValue: '2.71828',
      binaryRep: '0100000000000101101111110000101010111100100110011001100110011010'
    },
    {
      title: 'Struct to Byte Array',
      sourceType: 'Point3D',
      targetType: 'char[12]',
      sourceValue: '{1.0, 2.0, 3.0}',
      binaryRep: '001111110000000000000000010000000100000001000000'
    },
    {
      title: 'Enum to Underlying Type',
      sourceType: 'Color',
      targetType: 'int',
      sourceValue: 'Color::RED',
      binaryRep: '00000000000000000000000000000001'
    }
  ];

  const currentExample = examples[state.currentExample] || examples[0];

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Title */}
      <Text position={[0, 4.5, 0]} fontSize={0.25} color="#00d4ff" anchorX="center">
        Type Punning: {currentExample.title}
      </Text>
      
      <Text position={[0, 4, 0]} fontSize={0.12} color="#ffa500" anchorX="center">
        Safe bit-level type reinterpretation techniques
      </Text>

      {/* Source Type Visualization */}
      <group position={[-3, 2.5, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
          Source Type
        </Text>
        
        <Box args={[2.5, 1.2, 0.4]}>
          <meshStandardMaterial color="#2ed573" transparent opacity={0.8} />
        </Box>
        
        <Text position={[0, 0.1, 0.3]} fontSize={0.1} color="white" anchorX="center">
          {currentExample.sourceType}
        </Text>
        
        <Text position={[0, -0.1, 0.3]} fontSize={0.08} color="white" anchorX="center">
          {currentExample.sourceValue}
        </Text>
        
        <Text position={[0, -0.8, 0]} fontSize={0.06} color="#888" anchorX="center">
          Size: {currentExample.sourceType === 'float' ? '4' : 
                currentExample.sourceType === 'double' ? '8' : 
                currentExample.sourceType === 'Point3D' ? '12' : '4'} bytes
        </Text>
      </group>

      {/* Conversion Arrow */}
      <group position={[0, 2.5, 0]}>
        <Box args={[1.5, 0.2, 0.1]}>
          <meshStandardMaterial color={getMethodColor(state.conversionMethod)} />
        </Box>
        
        <Text position={[0, 0.4, 0]} fontSize={0.08} color={getMethodColor(state.conversionMethod)} anchorX="center">
          {state.conversionMethod}
        </Text>
        
        <Text position={[0, -0.3, 0]} fontSize={0.06} color={getWarningColor(state.warningLevel)} anchorX="center">
          {state.warningLevel.replace('_', ' ')}
        </Text>
      </group>

      {/* Target Type Visualization */}
      <group position={[3, 2.5, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
          Target Type
        </Text>
        
        <Box args={[2.5, 1.2, 0.4]}>
          <meshStandardMaterial color="#00d4ff" transparent opacity={0.8} />
        </Box>
        
        <Text position={[0, 0.1, 0.3]} fontSize={0.1} color="white" anchorX="center">
          {currentExample.targetType}
        </Text>
        
        <Text position={[0, -0.1, 0.3]} fontSize={0.08} color="white" anchorX="center">
          {state.targetValue}
        </Text>
        
        <Text position={[0, -0.8, 0]} fontSize={0.06} color="#888" anchorX="center">
          Same size, different interpretation
        </Text>
      </group>

      {/* Binary Representation */}
      <group position={[0, 1, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
          Binary Representation
        </Text>
        
        <Box args={[8, 0.6, 0.2]}>
          <meshStandardMaterial color="rgba(255,255,255,0.1)" transparent />
        </Box>
        
        {/* Show binary digits in groups of 8 */}
        {currentExample.binaryRep.match(/.{1,8}/g)?.map((byte, index) => (
          <Text 
            key={index}
            position={[index * 0.8 - 2.4, 0, 0.15]} 
            fontSize={0.06} 
            color="#00ff00" 
            anchorX="center"
          >
            {byte}
          </Text>
        ))}
        
        <Text position={[0, -0.5, 0]} fontSize={0.07} color="#ffa500" anchorX="center">
          Endianness: {state.endianness} endian
        </Text>
      </group>

      {/* Method Comparison */}
      <group position={[0, -0.5, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
          Type Punning Methods
        </Text>
        
        {/* std::bit_cast */}
        <group position={[-4, 0, 0]}>
          <Box args={[1.5, 0.8, 0.3]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.7} />
          </Box>
          <Text position={[0, 0.1, 0.2]} fontSize={0.06} color="white" anchorX="center">
            std::bit_cast
          </Text>
          <Text position={[0, -0.1, 0.2]} fontSize={0.05} color="white" anchorX="center">
            C++20
          </Text>
          <Text position={[0, -0.5, 0]} fontSize={0.04} color="#2ed573" anchorX="center">
            ✓ Safe
          </Text>
        </group>
        
        {/* memcpy */}
        <group position={[-1.5, 0, 0]}>
          <Box args={[1.5, 0.8, 0.3]}>
            <meshStandardMaterial color="#00d4ff" transparent opacity={0.7} />
          </Box>
          <Text position={[0, 0.1, 0.2]} fontSize={0.06} color="white" anchorX="center">
            memcpy
          </Text>
          <Text position={[0, -0.1, 0.2]} fontSize={0.05} color="white" anchorX="center">
            C++11
          </Text>
          <Text position={[0, -0.5, 0]} fontSize={0.04} color="#00d4ff" anchorX="center">
            ✓ Safe
          </Text>
        </group>
        
        {/* union */}
        <group position={[1.5, 0, 0]}>
          <Box args={[1.5, 0.8, 0.3]}>
            <meshStandardMaterial color="#ffa500" transparent opacity={0.7} />
          </Box>
          <Text position={[0, 0.1, 0.2]} fontSize={0.06} color="white" anchorX="center">
            union
          </Text>
          <Text position={[0, -0.1, 0.2]} fontSize={0.05} color="white" anchorX="center">
            C++98
          </Text>
          <Text position={[0, -0.5, 0]} fontSize={0.04} color="#ffa500" anchorX="center">
            ⚠ Impl-def
          </Text>
        </group>
        
        {/* reinterpret_cast */}
        <group position={[4, 0, 0]}>
          <Box args={[1.5, 0.8, 0.3]}>
            <meshStandardMaterial color="#ff4757" transparent opacity={0.7} />
          </Box>
          <Text position={[0, 0.1, 0.2]} fontSize={0.06} color="white" anchorX="center">
            reinterpret_cast
          </Text>
          <Text position={[0, -0.1, 0.2]} fontSize={0.05} color="white" anchorX="center">
            C++98
          </Text>
          <Text position={[0, -0.5, 0]} fontSize={0.04} color="#ff4757" anchorX="center">
            ✗ UB
          </Text>
        </group>
      </group>

      {/* Conversion Details */}
      <group position={[0, -2.5, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
          Conversion Details
        </Text>
        
        <Text position={[-2, 0, 0]} fontSize={0.08} color="#2ed573" anchorX="center">
          Valid: {state.isValidConversion ? 'Yes' : 'No'}
        </Text>
        
        <Text position={[0, 0, 0]} fontSize={0.08} color="#00d4ff" anchorX="center">
          Method: {state.conversionMethod}
        </Text>
        
        <Text position={[2, 0, 0]} fontSize={0.08} color={getWarningColor(state.warningLevel)} anchorX="center">
          Safety: {state.warningLevel.replace('_', ' ')}
        </Text>
      </group>
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson66_TypePunning: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<TypePunningState>({
    demonstrationType: 'bit_cast',
    currentExample: 0,
    sourceType: 'float',
    targetType: 'uint32_t',
    sourceValue: '3.14159f',
    targetValue: '0x40490FDB',
    binaryRepresentation: '01000000010010010000111111011011',
    isValidConversion: true,
    endianness: 'little',
    conversionMethod: 'std::bit_cast',
    warningLevel: 'safe'
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 7,
    completedSteps: [],
    score: 0
  });

  const codeExamples = {
    bit_cast: `// std::bit_cast - The modern C++20 way
#include <bit>
#include <cstdint>
#include <iostream>
#include <type_traits>

// Basic float-to-int bits conversion
void bit_cast_basics() {
    float f = 3.14159f;
    
    // ✅ Safe: std::bit_cast (C++20)
    std::uint32_t bits = std::bit_cast<std::uint32_t>(f);
    
    std::cout << "Float: " << f << std::endl;
    std::cout << "Bits: 0x" << std::hex << bits << std::endl;
    
    // Convert back
    float f2 = std::bit_cast<float>(bits);
    std::cout << "Roundtrip: " << f2 << std::endl;
    
    // Compile-time safety checks
    static_assert(sizeof(float) == sizeof(std::uint32_t));
    static_assert(std::is_trivially_copyable_v<float>);
    static_assert(std::is_trivially_copyable_v<std::uint32_t>);
}

// Advanced bit_cast patterns
template<typename To, typename From>
constexpr To safe_bit_cast(const From& from) noexcept {
    static_assert(sizeof(To) == sizeof(From), 
                  "Types must have the same size");
    static_assert(std::is_trivially_copyable_v<To> && 
                  std::is_trivially_copyable_v<From>,
                  "Types must be trivially copyable");
    
    return std::bit_cast<To>(from);
}

// IEEE 754 float analysis
void analyze_ieee754() {
    float f = -3.14159f;
    std::uint32_t bits = std::bit_cast<std::uint32_t>(f);
    
    // Extract IEEE 754 components
    bool sign = (bits >> 31) & 1;
    std::uint8_t exponent = (bits >> 23) & 0xFF;
    std::uint32_t mantissa = bits & 0x7FFFFF;
    
    std::cout << "IEEE 754 breakdown:\\n";
    std::cout << "Sign: " << sign << "\\n";
    std::cout << "Exponent: " << static_cast<int>(exponent) << " (biased)\\n";
    std::cout << "Mantissa: 0x" << std::hex << mantissa << "\\n";
    
    // Reconstruct the float value manually
    float reconstructed = (sign ? -1.0f : 1.0f) * 
                         std::pow(2.0f, static_cast<int>(exponent) - 127) *
                         (1.0f + mantissa / static_cast<float>(1 << 23));
    
    std::cout << "Reconstructed: " << reconstructed << std::endl;
}

// Complex type punning with structs
struct Color {
    std::uint8_t r, g, b, a;
};

void struct_bit_cast() {
    Color color{255, 128, 64, 255};  // RGBA
    
    // Convert to single 32-bit integer
    std::uint32_t packed = std::bit_cast<std::uint32_t>(color);
    
    std::cout << "Packed color: 0x" << std::hex << packed << std::endl;
    
    // Convert back
    Color unpacked = std::bit_cast<Color>(packed);
    
    std::cout << "Unpacked RGBA: " 
              << static_cast<int>(unpacked.r) << ", "
              << static_cast<int>(unpacked.g) << ", "
              << static_cast<int>(unpacked.b) << ", "
              << static_cast<int>(unpacked.a) << std::endl;
}`,

    memcpy_method: `// memcpy - The portable C++11+ way
#include <cstring>
#include <cstdint>
#include <iostream>
#include <cassert>

// Basic memcpy type punning
void memcpy_basics() {
    double d = 2.71828;
    std::uint64_t bits;
    
    // ✅ Safe: memcpy is always well-defined
    std::memcpy(&bits, &d, sizeof(d));
    
    std::cout << "Double: " << d << std::endl;
    std::cout << "Bits: 0x" << std::hex << bits << std::endl;
    
    // Convert back
    double d2;
    std::memcpy(&d2, &bits, sizeof(bits));
    std::cout << "Roundtrip: " << d2 << std::endl;
}

// Template wrapper for type safety
template<typename To, typename From>
To memcpy_cast(const From& from) noexcept {
    static_assert(sizeof(To) == sizeof(From), 
                  "Types must have the same size");
    
    To result;
    std::memcpy(&result, &from, sizeof(From));
    return result;
}

// Array and complex type handling
void complex_memcpy() {
    // Array of floats to array of ints
    float floats[4] = {1.0f, 2.0f, 3.0f, 4.0f};
    std::uint32_t ints[4];
    
    std::memcpy(ints, floats, sizeof(floats));
    
    for (int i = 0; i < 4; ++i) {
        std::cout << "Float " << floats[i] 
                  << " -> Int 0x" << std::hex << ints[i] << std::endl;
    }
    
    // Struct with padding considerations
    struct Padded {
        char c;      // 1 byte
        // 3 bytes padding
        int i;       // 4 bytes
        char c2;     // 1 byte
        // 3 bytes padding
    };
    
    static_assert(sizeof(Padded) == 12);  // Including padding
    
    Padded p{42, 12345, 99};
    char buffer[sizeof(Padded)];
    
    std::memcpy(buffer, &p, sizeof(p));
    
    // Examine byte by byte
    for (size_t i = 0; i < sizeof(buffer); ++i) {
        std::cout << "Byte " << i << ": " 
                  << static_cast<int>(static_cast<unsigned char>(buffer[i])) 
                  << std::endl;
    }
}

// Endianness detection and handling
enum class Endianness { Little, Big };

Endianness detect_endianness() {
    std::uint32_t test = 0x12345678;
    std::uint8_t bytes[4];
    
    std::memcpy(bytes, &test, sizeof(test));
    
    return (bytes[0] == 0x78) ? Endianness::Little : Endianness::Big;
}

void endianness_aware_conversion() {
    std::uint32_t value = 0x12345678;
    std::uint8_t bytes[4];
    
    std::memcpy(bytes, &value, sizeof(value));
    
    std::cout << "System endianness: " 
              << (detect_endianness() == Endianness::Little ? "Little" : "Big")
              << std::endl;
    
    std::cout << "Bytes in memory order: ";
    for (int i = 0; i < 4; ++i) {
        std::cout << "0x" << std::hex << static_cast<int>(bytes[i]) << " ";
    }
    std::cout << std::endl;
    
    // Force big-endian representation
    std::uint8_t big_endian[4] = {0x12, 0x34, 0x56, 0x78};
    std::uint32_t big_endian_value;
    std::memcpy(&big_endian_value, big_endian, sizeof(big_endian_value));
    
    std::cout << "Big-endian bytes as native int: 0x" 
              << std::hex << big_endian_value << std::endl;
}

// Performance comparison
#include <chrono>

void performance_comparison() {
    constexpr int ITERATIONS = 10000000;
    std::vector<float> floats(ITERATIONS);
    std::vector<std::uint32_t> ints(ITERATIONS);
    
    // Fill with test data
    for (int i = 0; i < ITERATIONS; ++i) {
        floats[i] = static_cast<float>(i) * 0.1f;
    }
    
    auto start = std::chrono::high_resolution_clock::now();
    
    // memcpy approach
    for (int i = 0; i < ITERATIONS; ++i) {
        std::memcpy(&ints[i], &floats[i], sizeof(float));
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto memcpy_time = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    std::cout << "memcpy time: " << memcpy_time.count() << " microseconds\\n";
    
    // Compiler typically optimizes memcpy to direct assignment for small, aligned types
}`,

    union_method: `// union - Implementation-defined but widely supported
#include <cstdint>
#include <iostream>
#include <array>

// Basic union type punning
void union_basics() {
    union FloatIntPun {
        float f;
        std::uint32_t i;
    };
    
    FloatIntPun pun;
    pun.f = 3.14159f;  // Set the float member
    
    // Reading int member is implementation-defined behavior
    // Most implementations handle this as expected
    std::cout << "Float: " << pun.f << std::endl;
    std::cout << "Int bits: 0x" << std::hex << pun.i << std::endl;
    
    // Set int and read float
    pun.i = 0x40490FDB;  // Float representation of ~3.14159
    std::cout << "From bits: " << pun.f << std::endl;
}

// C++14 transparent union wrapper
template<typename... Types>
union TypePunUnion;

template<typename T>
union TypePunUnion<T> {
    T value;
    
    TypePunUnion() {}
    TypePunUnion(const T& v) : value(v) {}
    ~TypePunUnion() {}
};

template<typename T, typename U, typename... Rest>
union TypePunUnion<T, U, Rest...> {
    T first;
    TypePunUnion<U, Rest...> rest;
    
    TypePunUnion() {}
    
    template<typename V>
    TypePunUnion(const V& v) {
        set(v);
    }
    
    template<typename V>
    void set(const V& v) {
        if constexpr (std::is_same_v<V, T>) {
            first = v;
        } else {
            rest.set(v);
        }
    }
    
    template<typename V>
    const V& get() const {
        if constexpr (std::is_same_v<V, T>) {
            return first;
        } else {
            return rest.template get<V>();
        }
    }
};

// Advanced union patterns
union Vector3DPun {
    struct { float x, y, z; };      // Named components
    std::array<float, 3> array;     // Array access
    struct { float r, g, b; };      // Color interpretation
    
    Vector3DPun(float x_, float y_, float z_) : x(x_), y(y_), z(z_) {}
    
    // Convenient accessors
    float& operator[](int index) { return array[index]; }
    const float& operator[](int index) const { return array[index]; }
};

void advanced_union_usage() {
    Vector3DPun vec(1.0f, 0.5f, 0.25f);
    
    std::cout << "As vector: (" << vec.x << ", " << vec.y << ", " << vec.z << ")\\n";
    std::cout << "As color: RGB(" << vec.r << ", " << vec.g << ", " << vec.b << ")\\n";
    
    // Array-style access
    for (int i = 0; i < 3; ++i) {
        std::cout << "Component " << i << ": " << vec[i] << "\\n";
    }
    
    // Modify through different views
    vec.r = 0.75f;  // Same as vec.x = 0.75f
    std::cout << "Modified vector: (" << vec.x << ", " << vec.y << ", " << vec.z << ")\\n";
}

// Union with non-trivial types (C++11+)
union StringOrInt {
    std::string str;
    int integer;
    
    StringOrInt() : integer(0) {}  // Initialize POD member
    
    StringOrInt(const std::string& s) : str(s) {}
    StringOrInt(int i) : integer(i) {}
    
    // Destructor must know which member is active
    ~StringOrInt() {
        // In real code, you'd need to track the active member
        // and call the appropriate destructor
    }
};

// Safe tagged union (variant-like)
template<typename... Types>
class SafeUnion {
    union Storage {
        char dummy;
        // Would contain aligned storage for each type
        Storage() : dummy() {}
        ~Storage() {}
    } storage;
    
    std::size_t active_type = 0;
    
public:
    template<typename T>
    void set(const T& value) {
        // Destroy current value
        destroy_active();
        
        // Construct new value with placement new
        new(reinterpret_cast<T*>(&storage)) T(value);
        active_type = type_index<T>();
    }
    
    template<typename T>
    const T& get() const {
        if (active_type != type_index<T>()) {
            throw std::runtime_error("Wrong type accessed");
        }
        return *reinterpret_cast<const T*>(&storage);
    }
    
private:
    template<typename T>
    static constexpr std::size_t type_index() {
        // Implementation would calculate type index
        return 0;
    }
    
    void destroy_active() {
        // Implementation would call appropriate destructor
    }
};`,

    unsafe_patterns: `// Unsafe patterns - AVOID THESE!
#include <cstdint>
#include <iostream>

// ❌ DANGEROUS: Direct pointer casting (violates strict aliasing)
void dangerous_pointer_casting() {
    float f = 3.14159f;
    
    // ⚠️ UNDEFINED BEHAVIOR: Violates strict aliasing rule
    std::uint32_t* int_ptr = reinterpret_cast<std::uint32_t*>(&f);
    std::uint32_t bits = *int_ptr;  // 💥 UB!
    
    std::cout << "Bits (UB!): 0x" << std::hex << bits << std::endl;
    
    // Writing through the aliased pointer is also UB
    *int_ptr = 0x40490000;  // 💥 UB! Modifying float through int*
    
    std::cout << "Modified float (UB!): " << f << std::endl;
}

// ❌ DANGEROUS: Assumption about memory layout
void dangerous_assumptions() {
    struct Point {
        float x, y;
    };
    
    Point p{1.0f, 2.0f};
    
    // ⚠️ ASSUMPTION: No padding between x and y
    // This might work on most platforms but isn't guaranteed
    float* coords = reinterpret_cast<float*>(&p);
    
    std::cout << "X: " << coords[0] << ", Y: " << coords[1] << std::endl;
    
    // Even more dangerous: treating Point as array
    auto* float_array = reinterpret_cast<float(&)[2]>(p);
    std::cout << "Array[0]: " << (*float_array)[0] 
              << ", Array[1]: " << (*float_array)[1] << std::endl;
}

// ❌ DANGEROUS: Type punning with references
void dangerous_references() {
    std::uint64_t value = 0x123456789ABCDEF0;
    
    // ⚠️ UNDEFINED BEHAVIOR: Creating reference to wrong type
    auto& as_double = reinterpret_cast<double&>(value);  // 💥 UB!
    
    std::cout << "As double (UB!): " << as_double << std::endl;
    
    // Modifying through the reference
    as_double = 3.14159;  // 💥 UB! Writing double to uint64_t location
    
    std::cout << "Modified value (UB!): 0x" << std::hex << value << std::endl;
}

// ❌ PROBLEMATIC: Endianness assumptions
void endianness_assumptions() {
    std::uint32_t value = 0x12345678;
    
    union EndianTest {
        std::uint32_t full;
        struct {
            std::uint8_t byte0, byte1, byte2, byte3;
        } bytes;
    };
    
    EndianTest test;
    test.full = value;
    
    // ⚠️ ASSUMPTION: Little-endian byte order
    // This code assumes specific endianness
    std::cout << "Assuming little-endian:\\n";
    std::cout << "LSB: 0x" << std::hex << static_cast<int>(test.bytes.byte0) << std::endl;
    std::cout << "MSB: 0x" << std::hex << static_cast<int>(test.bytes.byte3) << std::endl;
    
    // This will give different results on big-endian systems!
}

// ❌ DANGEROUS: Mixing signed/unsigned with same bit pattern
void sign_bit_confusion() {
    float negative = -1.0f;
    std::uint32_t bits;
    
    // Get the bit pattern (safely)
    std::memcpy(&bits, &negative, sizeof(negative));
    
    // ⚠️ PROBLEM: Interpreting sign bit incorrectly
    if (bits > 0x80000000) {
        std::cout << "This logic is wrong! Treating float bits as unsigned magnitude\\n";
    }
    
    // Correct interpretation: Check sign bit explicitly
    bool is_negative = (bits & 0x80000000) != 0;
    std::cout << "Sign bit indicates: " << (is_negative ? "negative" : "positive") << std::endl;
}

// Better alternatives to unsafe patterns
void safe_alternatives() {
    std::cout << "\\n=== SAFE ALTERNATIVES ===\\n";
    
    // Instead of reinterpret_cast, use std::bit_cast or memcpy
    float f = 3.14159f;
    
    // ✅ SAFE: std::bit_cast (C++20)
    #ifdef __cpp_lib_bit_cast
    std::uint32_t bits1 = std::bit_cast<std::uint32_t>(f);
    std::cout << "bit_cast result: 0x" << std::hex << bits1 << std::endl;
    #endif
    
    // ✅ SAFE: memcpy (works everywhere)
    std::uint32_t bits2;
    std::memcpy(&bits2, &f, sizeof(f));
    std::cout << "memcpy result: 0x" << std::hex << bits2 << std::endl;
    
    // ✅ SAFE: union (implementation-defined but widely supported)
    union FloatBits {
        float f;
        std::uint32_t i;
    } pun;
    
    pun.f = f;
    std::cout << "union result: 0x" << std::hex << pun.i << std::endl;
}

// Demonstration of why strict aliasing matters for optimization
void optimization_implications() {
    // This function shows why compilers need strict aliasing rules
    
    volatile float f = 3.14f;  // volatile to prevent optimization
    volatile std::uint32_t i = 42;
    
    // Compiler can optimize this because float* and uint32_t* cannot alias
    float original_f = f;
    i = 100;  // Compiler knows this doesn't affect 'f'
    float still_f = f;  // Compiler can reuse cached value of 'f'
    
    std::cout << "Original: " << original_f << ", After int assignment: " << still_f << std::endl;
    
    // If we could alias float* and uint32_t*, the compiler couldn't make this optimization
}`
  };

  const scenarios = [
    {
      title: 'std::bit_cast (C++20)',
      code: codeExamples.bit_cast,
      method: 'std::bit_cast',
      safety: 'safe' as const,
      explanation: state.language === 'en' 
        ? 'Type-safe bit reinterpretation with compile-time validation.'
        : 'Reinterpretación de bits type-safe con validación en tiempo de compilación.'
    },
    {
      title: 'memcpy Method',
      code: codeExamples.memcpy_method,
      method: 'memcpy',
      safety: 'safe' as const,
      explanation: state.language === 'en'
        ? 'Portable and always well-defined type punning technique.'
        : 'Técnica de type punning portable y siempre bien definida.'
    },
    {
      title: 'Union Method',
      code: codeExamples.union_method,
      method: 'union',
      safety: 'implementation_defined' as const,
      explanation: state.language === 'en'
        ? 'Implementation-defined but widely supported approach.'
        : 'Enfoque definido por implementación pero ampliamente soportado.'
    },
    {
      title: 'Unsafe Patterns',
      code: codeExamples.unsafe_patterns,
      method: 'reinterpret_cast',
      safety: 'undefined_behavior' as const,
      explanation: state.language === 'en'
        ? 'Dangerous patterns that violate strict aliasing rules.'
        : 'Patrones peligrosos que violan las reglas de strict aliasing.'
    }
  ];

  const nextExample = () => {
    setLessonState(prev => ({
      ...prev,
      currentExample: (prev.currentExample + 1) % 4
    }));
  };

  const changeMethod = (methodIndex: number) => {
    const methods = ['std::bit_cast', 'memcpy', 'union', 'reinterpret_cast'];
    const safetyLevels = ['safe', 'safe', 'implementation_defined', 'undefined_behavior'] as const;
    
    setLessonState(prev => ({
      ...prev,
      conversionMethod: methods[methodIndex],
      warningLevel: safetyLevels[methodIndex],
      demonstrationType: ['bit_cast', 'memcpy_method', 'union_punning', 'unsafe_cast'][methodIndex] as TypePunningState['demonstrationType'],
      targetValue: methodIndex === 3 ? 'UB!' : prev.targetValue,
      isValidConversion: methodIndex !== 3
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Master safe type punning techniques' : 'Dominar técnicas seguras de type punning',
    state.language === 'en' ? 'Understand std::bit_cast and memcpy methods' : 'Entender métodos std::bit_cast y memcpy',
    state.language === 'en' ? 'Learn union-based type reinterpretation' : 'Aprender reinterpretación de tipos basada en union',
    state.language === 'en' ? 'Recognize and avoid undefined behavior patterns' : 'Reconocer y evitar patrones de comportamiento indefinido',
    state.language === 'en' ? 'Handle endianness and portability concerns' : 'Manejar preocupaciones de endianness y portabilidad'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Safe Type Punning Techniques" : "Técnicas Seguras de Type Punning"}
      subtitle={state.language === 'en' 
        ? "Master safe bit-level type reinterpretation without undefined behavior" 
        : "Domina la reinterpretación segura de tipos a nivel de bits sin comportamiento indefinido"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🔄 Type Punning Fundamentals' : '🔄 Fundamentos de Type Punning'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'Type punning allows you to reinterpret the bit pattern of one type as another type with the same size. This is essential for low-level programming, serialization, and interfacing with hardware or network protocols.'
            : 'Type punning te permite reinterpretar el patrón de bits de un tipo como otro tipo del mismo tamaño. Esto es esencial para programación de bajo nivel, serialización e interfaz con hardware o protocolos de red.'}
        </p>

        <div style={{ height: '500px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <TypePunningVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive Type Punning Demo' : '🧪 Demo Interactivo de Type Punning'}
        </SectionTitle>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button onClick={nextExample}>
            {state.language === 'en' ? 'Next Example' : 'Siguiente Ejemplo'} ({lessonState.currentExample + 1}/4)
          </Button>
          
          <Button onClick={() => changeMethod(0)} 
                  style={{ background: lessonState.conversionMethod === 'std::bit_cast' ? '#2ed573' : undefined }}>
            std::bit_cast
          </Button>
          
          <Button onClick={() => changeMethod(1)}
                  style={{ background: lessonState.conversionMethod === 'memcpy' ? '#00d4ff' : undefined }}>
            memcpy
          </Button>
          
          <Button onClick={() => changeMethod(2)}
                  style={{ background: lessonState.conversionMethod === 'union' ? '#ffa500' : undefined }}>
            union
          </Button>
          
          <Button onClick={() => changeMethod(3)}
                  style={{ background: lessonState.conversionMethod === 'reinterpret_cast' ? '#ff4757' : undefined }}>
            reinterpret_cast
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div>
            <h4>{scenarios.find(s => s.method === lessonState.conversionMethod)?.title}</h4>
            <p>{scenarios.find(s => s.method === lessonState.conversionMethod)?.explanation}</p>
            
            <CodeBlock
              language="cpp"
              showLineNumbers={true}
            >
              {scenarios.find(s => s.method === lessonState.conversionMethod)?.code}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Safety Guidelines' : 'Guías de Seguridad'}</h4>
            <ul>
              <li style={{ color: lessonState.warningLevel === 'safe' ? '#2ed573' : '#888' }}>
                {state.language === 'en' ? '✅ Use std::bit_cast when available' : '✅ Usar std::bit_cast cuando esté disponible'}
              </li>
              <li style={{ color: lessonState.warningLevel === 'safe' ? '#2ed573' : '#888' }}>
                {state.language === 'en' ? '✅ memcpy is always well-defined' : '✅ memcpy siempre está bien definido'}
              </li>
              <li style={{ color: lessonState.warningLevel === 'implementation_defined' ? '#ffa500' : '#888' }}>
                {state.language === 'en' ? '⚠️ unions are implementation-defined' : '⚠️ unions son definidos por implementación'}
              </li>
              <li style={{ color: lessonState.warningLevel === 'undefined_behavior' ? '#ff4757' : '#888' }}>
                {state.language === 'en' ? '❌ Avoid reinterpret_cast for aliasing' : '❌ Evitar reinterpret_cast para aliasing'}
              </li>
              <li>{state.language === 'en' ? 'Consider endianness for portability' : 'Considerar endianness para portabilidad'}</li>
            </ul>

            <h4 style={{ marginTop: '20px' }}>{state.language === 'en' ? 'Current Status' : 'Estado Actual'}</h4>
            <div style={{ 
              padding: '10px', 
              borderRadius: '5px', 
              background: 
                lessonState.warningLevel === 'safe' ? 'rgba(46, 213, 115, 0.1)' :
                lessonState.warningLevel === 'implementation_defined' ? 'rgba(255, 164, 0, 0.1)' :
                'rgba(255, 71, 87, 0.1)',
              border: `1px solid ${
                lessonState.warningLevel === 'safe' ? '#2ed573' :
                lessonState.warningLevel === 'implementation_defined' ? '#ffa500' :
                '#ff4757'
              }`
            }}>
              <p><strong>{state.language === 'en' ? 'Method:' : 'Método:'}</strong> {lessonState.conversionMethod}</p>
              <p><strong>{state.language === 'en' ? 'Safety:' : 'Seguridad:'}</strong> {lessonState.warningLevel.replace('_', ' ')}</p>
              <p><strong>{state.language === 'en' ? 'Valid:' : 'Válido:'}</strong> {lessonState.isValidConversion ? (state.language === 'en' ? 'Yes' : 'Sí') : 'No'}</p>
            </div>
          </div>
        </div>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🎯 Best Practices Summary' : '🎯 Resumen de Mejores Prácticas'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', background: 'rgba(46, 213, 115, 0.1)', border: '1px solid #2ed573', borderRadius: '8px' }}>
            <h4 style={{ color: '#2ed573' }}>{state.language === 'en' ? '✅ Preferred Methods' : '✅ Métodos Preferidos'}</h4>
            <ul>
              <li>std::bit_cast (C++20)</li>
              <li>std::memcpy</li>
              <li>Careful union usage</li>
              <li>Template wrappers</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(255, 164, 0, 0.1)', border: '1px solid #ffa500', borderRadius: '8px' }}>
            <h4 style={{ color: '#ffa500' }}>{state.language === 'en' ? '⚠️ Use with Caution' : '⚠️ Usar con Precaución'}</h4>
            <ul>
              <li>Active union member access</li>
              <li>Platform-specific assumptions</li>
              <li>Endianness dependencies</li>
              <li>Padding considerations</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid #ff4757', borderRadius: '8px' }}>
            <h4 style={{ color: '#ff4757' }}>{state.language === 'en' ? '❌ Avoid These' : '❌ Evitar Estos'}</h4>
            <ul>
              <li>reinterpret_cast aliasing</li>
              <li>Pointer type violations</li>
              <li>Reference type punning</li>
              <li>Strict aliasing violations</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid #00d4ff', borderRadius: '8px' }}>
            <h4 style={{ color: '#00d4ff' }}>{state.language === 'en' ? '🔧 Testing & Debugging' : '🔧 Testing y Debugging'}</h4>
            <ul>
              <li>Use -fstrict-aliasing</li>
              <li>Enable UBSan</li>
              <li>Test on multiple platforms</li>
              <li>Verify endianness handling</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🚀 Real-World Applications' : '🚀 Aplicaciones del Mundo Real'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`// Real-world type punning applications

// 1. Network protocol handling (endianness conversion)
class NetworkPacket {
    std::array<std::uint8_t, 1024> buffer;
    size_t size = 0;
    
public:
    template<typename T>
    void write_big_endian(const T& value) {
        static_assert(std::is_trivially_copyable_v<T>);
        
        auto bytes = std::bit_cast<std::array<std::uint8_t, sizeof(T)>>(value);
        
        // Reverse bytes for big-endian if on little-endian system
        if constexpr (std::endian::native == std::endian::little) {
            std::reverse(bytes.begin(), bytes.end());
        }
        
        std::copy(bytes.begin(), bytes.end(), buffer.begin() + size);
        size += sizeof(T);
    }
    
    template<typename T>
    T read_big_endian(size_t offset) const {
        std::array<std::uint8_t, sizeof(T)> bytes;
        std::copy(buffer.begin() + offset, 
                  buffer.begin() + offset + sizeof(T),
                  bytes.begin());
        
        // Reverse bytes if needed
        if constexpr (std::endian::native == std::endian::little) {
            std::reverse(bytes.begin(), bytes.end());
        }
        
        return std::bit_cast<T>(bytes);
    }
};

// 2. Graphics programming (color format conversion)
class ColorConverter {
public:
    // RGBA8 to packed ARGB32
    static std::uint32_t rgba_to_argb(std::uint8_t r, std::uint8_t g, std::uint8_t b, std::uint8_t a) {
        struct RGBA { std::uint8_t r, g, b, a; };
        struct ARGB { std::uint8_t a, r, g, b; };
        
        RGBA rgba{r, g, b, a};
        
        // Reinterpret as bytes and rearrange
        auto rgba_bytes = std::bit_cast<std::array<std::uint8_t, 4>>(rgba);
        ARGB argb{rgba_bytes[3], rgba_bytes[0], rgba_bytes[1], rgba_bytes[2]};
        
        return std::bit_cast<std::uint32_t>(argb);
    }
    
    // Float RGB to packed RGB565
    static std::uint16_t float_rgb_to_rgb565(float r, float g, float b) {
        std::uint16_t r5 = static_cast<std::uint16_t>(std::clamp(r, 0.0f, 1.0f) * 31);
        std::uint16_t g6 = static_cast<std::uint16_t>(std::clamp(g, 0.0f, 1.0f) * 63);
        std::uint16_t b5 = static_cast<std::uint16_t>(std::clamp(b, 0.0f, 1.0f) * 31);
        
        return (r5 << 11) | (g6 << 5) | b5;
    }
};

// 3. Fast floating-point operations
class FastFloatOps {
public:
    // Fast inverse square root (Quake III algorithm)
    static float fast_inv_sqrt(float x) {
        union { float f; std::uint32_t i; } conv = {x};
        
        conv.i = 0x5f3759df - (conv.i >> 1);
        conv.f *= (1.5f - (x * 0.5f * conv.f * conv.f));
        
        return conv.f;
    }
    
    // Check if float is NaN without comparison
    static bool is_nan_bitwise(float f) {
        auto bits = std::bit_cast<std::uint32_t>(f);
        std::uint32_t exponent = (bits >> 23) & 0xFF;
        std::uint32_t mantissa = bits & 0x7FFFFF;
        
        return (exponent == 0xFF) && (mantissa != 0);
    }
    
    // Extract IEEE 754 components
    struct FloatComponents {
        bool sign;
        std::uint8_t exponent;
        std::uint32_t mantissa;
    };
    
    static FloatComponents decompose(float f) {
        auto bits = std::bit_cast<std::uint32_t>(f);
        
        return {
            .sign = (bits >> 31) & 1,
            .exponent = static_cast<std::uint8_t>((bits >> 23) & 0xFF),
            .mantissa = bits & 0x7FFFFF
        };
    }
};

// 4. Memory-efficient data structures
template<typename T>
class PackedOptional {
    static_assert(sizeof(T) >= sizeof(void*));
    
    union Storage {
        T value;
        void* null_indicator;
        
        Storage() : null_indicator(nullptr) {}
        ~Storage() {}
    } storage;
    
public:
    PackedOptional() = default;
    
    PackedOptional(const T& value) {
        new(&storage.value) T(value);
    }
    
    ~PackedOptional() {
        if (has_value()) {
            storage.value.~T();
        }
    }
    
    bool has_value() const {
        // Use knowledge that valid T objects won't have all-zero prefix
        return storage.null_indicator != nullptr;
    }
    
    const T& operator*() const { return storage.value; }
    T& operator*() { return storage.value; }
};`}
        </CodeBlock>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Type punning lesson. Current method: ${lessonState.conversionMethod}, Safety level: ${lessonState.warningLevel}`}
      />
    </LessonLayout>
  );
};

export default Lesson66_TypePunning;