import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LessonLayout, Section, SectionTitle, InteractiveSection,
  LearningObjectives, Button, CodeBlock, PerformanceMonitor,
  AccessibilityAnnouncer, theme, type LessonProgress 
} from '../design-system';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface BitCastState {
  sourceType: 'float' | 'int32' | 'double' | 'uint64' | 'array';
  targetType: 'float' | 'int32' | 'double' | 'uint64' | 'bytes';
  sourceValue: string;
  targetValue: string;
  binaryRepresentation: string[];
  conversionMethod: 'bit_cast' | 'memcpy' | 'union' | 'reinterpret_cast';
  isLegalConversion: boolean;
  showBitPattern: boolean;
  currentExample: number;
}

const BitCastVisualization: React.FC<{ state: BitCastState }> = ({ state }) => {
  const getBitColor = (bit: string, index: number) => {
    if (state.sourceType === 'float' && state.targetType === 'int32') {
      // IEEE 754 float: sign(1) + exponent(8) + mantissa(23)
      if (index === 0) return '#ff4757'; // sign bit
      if (index < 9) return '#ffa500';   // exponent
      return '#2ed573';                  // mantissa
    }
    if (state.sourceType === 'double' && state.targetType === 'uint64') {
      // IEEE 754 double: sign(1) + exponent(11) + mantissa(52)
      if (index === 0) return '#ff4757'; // sign bit
      if (index < 12) return '#ffa500';  // exponent  
      return '#2ed573';                  // mantissa
    }
    return bit === '1' ? '#00d4ff' : '#57606f';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'bit_cast': return '#2ed573';
      case 'memcpy': return '#00d4ff';
      case 'union': return '#ffa500';
      case 'reinterpret_cast': return '#ff4757';
      default: return '#57606f';
    }
  };

  const getMethodSafety = (method: string) => {
    switch (method) {
      case 'bit_cast': return 'Type-Safe (C++20)';
      case 'memcpy': return 'Always Safe';
      case 'union': return 'Implementation-Defined';
      case 'reinterpret_cast': return 'Potentially UB';
      default: return 'Unknown';
    }
  };

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Title */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.3}
        color="#00d4ff"
        anchorX="center"
      >
        std::bit_cast&lt;{state.targetType}&gt;({state.sourceType})
      </Text>

      {/* Source Value */}
      <group position={[-3, 2.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#2ed573"
          anchorX="center"
        >
          Source: {state.sourceType}
        </Text>
        
        <Box args={[2, 0.8, 0.3]}>
          <meshStandardMaterial color="#2ed573" transparent opacity={0.7} />
        </Box>
        
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {state.sourceValue}
        </Text>
      </group>

      {/* Target Value */}
      <group position={[3, 2.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#ffa500"
          anchorX="center"
        >
          Target: {state.targetType}
        </Text>
        
        <Box args={[2, 0.8, 0.3]}>
          <meshStandardMaterial color="#ffa500" transparent opacity={0.7} />
        </Box>
        
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {state.targetValue}
        </Text>
      </group>

      {/* Bit Pattern Visualization */}
      {state.showBitPattern && (
        <group position={[0, 1, 0]}>
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.18}
            color="white"
            anchorX="center"
          >
            Bit Pattern (MSB → LSB)
          </Text>
          
          {state.binaryRepresentation.map((bit, index) => (
            <group key={index} position={[index * 0.25 - state.binaryRepresentation.length * 0.125, 0, 0]}>
              <Box args={[0.2, 0.3, 0.1]}>
                <meshStandardMaterial 
                  color={getBitColor(bit, index)}
                  transparent 
                  opacity={0.8} 
                />
              </Box>
              
              <Text
                position={[0, 0, 0.1]}
                fontSize={0.08}
                color="white"
                anchorX="center"
              >
                {bit}
              </Text>
              
              {/* Bit position label */}
              <Text
                position={[0, -0.25, 0]}
                fontSize={0.06}
                color="#888"
                anchorX="center"
              >
                {state.binaryRepresentation.length - 1 - index}
              </Text>
            </group>
          ))}
        </group>
      )}

      {/* Conversion Method */}
      <group position={[0, -0.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.18}
          color="white"
          anchorX="center"
        >
          Conversion Method
        </Text>
        
        <Box args={[3, 0.6, 0.3]}>
          <meshStandardMaterial 
            color={getMethodColor(state.conversionMethod)}
            transparent 
            opacity={0.8} 
          />
        </Box>
        
        <Text
          position={[0, 0.1, 0.2]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {state.conversionMethod}
        </Text>
        
        <Text
          position={[0, -0.1, 0.2]}
          fontSize={0.08}
          color="white"
          anchorX="center"
        >
          {getMethodSafety(state.conversionMethod)}
        </Text>
      </group>

      {/* Safety Indicator */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.15}
          color={state.isLegalConversion ? '#2ed573' : '#ff4757'}
          anchorX="center"
        >
          {state.isLegalConversion ? '✅ Safe Conversion' : '⚠️ Potentially Unsafe'}
        </Text>
        
        {!state.isLegalConversion && (
          <Text
            position={[0, 0, 0]}
            fontSize={0.1}
            color="#ff6b7a"
            anchorX="center"
          >
            Size mismatch or undefined behavior
          </Text>
        )}
      </group>

      {/* IEEE 754 Legend for float/double */}
      {(state.sourceType === 'float' || state.sourceType === 'double') && state.showBitPattern && (
        <group position={[0, -2.5, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.12}
            color="white"
            anchorX="center"
          >
            IEEE 754 Format
          </Text>
          
          <group position={[-1.5, 0, 0]}>
            <Box args={[0.3, 0.2, 0.1]}>
              <meshStandardMaterial color="#ff4757" transparent opacity={0.8} />
            </Box>
            <Text position={[0.5, 0, 0]} fontSize={0.08} color="#ff4757" anchorX="left">
              Sign
            </Text>
          </group>
          
          <group position={[0, 0, 0]}>
            <Box args={[0.3, 0.2, 0.1]}>
              <meshStandardMaterial color="#ffa500" transparent opacity={0.8} />
            </Box>
            <Text position={[0.5, 0, 0]} fontSize={0.08} color="#ffa500" anchorX="left">
              Exponent
            </Text>
          </group>
          
          <group position={[1.5, 0, 0]}>
            <Box args={[0.3, 0.2, 0.1]}>
              <meshStandardMaterial color="#2ed573" transparent opacity={0.8} />
            </Box>
            <Text position={[0.5, 0, 0]} fontSize={0.08} color="#2ed573" anchorX="left">
              Mantissa
            </Text>
          </group>
        </group>
      )}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson62_BitCast: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<BitCastState>({
    sourceType: 'float',
    targetType: 'int32',
    sourceValue: '3.14159f',
    targetValue: '0x40490FDB',
    binaryRepresentation: ['0', '1', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '1', '0', '0', '1', '0', '0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '1', '1', '0', '1', '1'],
    conversionMethod: 'bit_cast',
    isLegalConversion: true,
    showBitPattern: true,
    currentExample: 0
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 6,
    completedSteps: [],
    score: 0
  });

  const examples = [
    {
      title: 'Float to Int32 Conversion',
      description: 'Convert IEEE 754 float to integer representation',
      source: { type: 'float', value: '3.14159f' },
      target: { type: 'int32', value: '0x40490FDB' },
      bits: ['0', '1', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '1', '0', '0', '1', '0', '0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '1', '1', '0', '1', '1'],
      legal: true
    },
    {
      title: 'Double to Uint64 Conversion', 
      description: 'Extract full bit pattern from IEEE 754 double',
      source: { type: 'double', value: '2.718281828' },
      target: { type: 'uint64', value: '0x4005BF0A8B145769' },
      bits: new Array(64).fill('0').map((_, i) => Math.random() > 0.5 ? '1' : '0'), // Simplified
      legal: true
    },
    {
      title: 'Array to Bytes Conversion',
      description: 'Convert array to individual bytes',
      source: { type: 'array', value: '[0x12, 0x34, 0x56, 0x78]' },
      target: { type: 'bytes', value: '12 34 56 78' },
      bits: ['0', '0', '0', '1', '0', '0', '1', '0', '0', '0', '1', '1', '0', '1', '0', '0', '0', '1', '0', '1', '0', '1', '1', '0', '0', '1', '1', '1', '1', '0', '0', '0'],
      legal: true
    }
  ];

  const performConversion = (method: 'bit_cast' | 'memcpy' | 'union' | 'reinterpret_cast') => {
    setLessonState(prev => ({
      ...prev,
      conversionMethod: method,
      isLegalConversion: method !== 'reinterpret_cast' || (prev.sourceType === 'float' && prev.targetType === 'int32')
    }));
  };

  const toggleBitPattern = () => {
    setLessonState(prev => ({
      ...prev,
      showBitPattern: !prev.showBitPattern
    }));
  };

  const nextExample = () => {
    const nextIndex = (lessonState.currentExample + 1) % examples.length;
    const example = examples[nextIndex];
    
    setLessonState(prev => ({
      ...prev,
      currentExample: nextIndex,
      sourceType: example.source.type as any,
      targetType: example.target.type as any,
      sourceValue: example.source.value,
      targetValue: example.target.value,
      binaryRepresentation: example.bits,
      isLegalConversion: example.legal
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Master std::bit_cast for type-safe bit reinterpretation' : 'Dominar std::bit_cast para reinterpretación de bits type-safe',
    state.language === 'en' ? 'Understand when bit_cast can and cannot be used' : 'Entender cuándo se puede y no se puede usar bit_cast',
    state.language === 'en' ? 'Compare bit_cast with alternative approaches' : 'Comparar bit_cast con enfoques alternativos',
    state.language === 'en' ? 'Learn IEEE 754 floating-point representation' : 'Aprender la representación de punto flotante IEEE 754',
    state.language === 'en' ? 'Implement safe bit-level operations' : 'Implementar operaciones seguras a nivel de bits'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "std::bit_cast - Type-Safe Bit Reinterpretation" : "std::bit_cast - Reinterpretación de Bits Type-Safe"}
      subtitle={state.language === 'en' 
        ? "Master C++20's type-safe alternative to reinterpret_cast for bit-level operations" 
        : "Domina la alternativa type-safe de C++20 a reinterpret_cast para operaciones a nivel de bits"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🎯 std::bit_cast Fundamentals' : '🎯 Fundamentos de std::bit_cast'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'std::bit_cast (C++20) provides a safe, efficient way to reinterpret the bit representation of an object as a different type without undefined behavior, unlike reinterpret_cast.'
            : 'std::bit_cast (C++20) proporciona una forma segura y eficiente de reinterpretar la representación de bits de un objeto como un tipo diferente sin comportamiento indefinido, a diferencia de reinterpret_cast.'}
        </p>

        <div style={{ height: '600px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <BitCastVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive bit_cast Demo' : '🧪 Demo Interactivo de bit_cast'}
        </SectionTitle>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button onClick={nextExample}>
            {state.language === 'en' ? 'Next Example' : 'Siguiente Ejemplo'} ({lessonState.currentExample + 1}/{examples.length})
          </Button>
          <Button onClick={toggleBitPattern}>
            {lessonState.showBitPattern 
              ? (state.language === 'en' ? 'Hide Bits' : 'Ocultar Bits')
              : (state.language === 'en' ? 'Show Bits' : 'Mostrar Bits')
            }
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
          <Button 
            onClick={() => performConversion('bit_cast')}
            style={{ backgroundColor: lessonState.conversionMethod === 'bit_cast' ? theme.colors.primary : theme.colors.secondary }}
          >
            std::bit_cast
          </Button>
          <Button 
            onClick={() => performConversion('memcpy')}
            style={{ backgroundColor: lessonState.conversionMethod === 'memcpy' ? theme.colors.primary : theme.colors.secondary }}
          >
            memcpy
          </Button>
          <Button 
            onClick={() => performConversion('union')}
            style={{ backgroundColor: lessonState.conversionMethod === 'union' ? theme.colors.primary : theme.colors.secondary }}
          >
            union
          </Button>
          <Button 
            onClick={() => performConversion('reinterpret_cast')}
            style={{ backgroundColor: lessonState.conversionMethod === 'reinterpret_cast' ? theme.colors.primary : theme.colors.secondary }}
          >
            reinterpret_cast
          </Button>
        </div>

        <h4>{examples[lessonState.currentExample].title}</h4>
        <p>{examples[lessonState.currentExample].description}</p>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '📝 Basic Usage Pattern' : '📝 Patrón de Uso Básico'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`#include <bit>       // C++20
#include <iostream>
#include <iomanip>

// Basic std::bit_cast usage
void basic_bit_cast() {
    float f = 3.14159f;
    
    // ✅ Type-safe bit reinterpretation  
    std::uint32_t bits = std::bit_cast<std::uint32_t>(f);
    
    std::cout << "Float: " << f << "\\n";
    std::cout << "As uint32_t: 0x" << std::hex << bits << "\\n";
    
    // Convert back
    float f2 = std::bit_cast<float>(bits);
    std::cout << "Back to float: " << f2 << "\\n";
}

// Requirements for std::bit_cast<To, From>:
// 1. sizeof(To) == sizeof(From)
// 2. To and From are TriviallyCopyable
// 3. No overlap in object representation

// ❌ This won't compile - size mismatch
// auto invalid = std::bit_cast<std::uint64_t>(3.14f); // float(4) -> uint64_t(8)

// ✅ This works - same size
auto valid = std::bit_cast<std::uint32_t>(3.14f);     // float(4) -> uint32_t(4)`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🔬 IEEE 754 Analysis with bit_cast' : '🔬 Análisis IEEE 754 con bit_cast'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4>{state.language === 'en' ? 'Float Analysis' : 'Análisis de Float'}</h4>
            <CodeBlock language="cpp">
{`void analyze_float(float f) {
    auto bits = std::bit_cast<std::uint32_t>(f);
    
    // Extract IEEE 754 components
    bool sign = (bits >> 31) & 1;
    int exponent = (bits >> 23) & 0xFF;
    int mantissa = bits & 0x7FFFFF;
    
    std::cout << "Value: " << f << "\\n";
    std::cout << "Sign: " << sign << "\\n";
    std::cout << "Exponent: " << exponent << " (bias 127)\\n";
    std::cout << "Mantissa: 0x" << std::hex << mantissa << "\\n";
    
    // Special values
    if (exponent == 0xFF) {
        if (mantissa == 0) {
            std::cout << "Infinity\\n";
        } else {
            std::cout << "NaN\\n";
        }
    }
}`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Double Analysis' : 'Análisis de Double'}</h4>
            <CodeBlock language="cpp">
{`void analyze_double(double d) {
    auto bits = std::bit_cast<std::uint64_t>(d);
    
    // IEEE 754 double precision
    bool sign = (bits >> 63) & 1;
    int exponent = (bits >> 52) & 0x7FF;
    auto mantissa = bits & 0xFFFFFFFFFFFFFULL;
    
    std::cout << "Value: " << d << "\\n";
    std::cout << "Sign: " << sign << "\\n";
    std::cout << "Exponent: " << exponent << " (bias 1023)\\n";
    std::cout << "Mantissa: 0x" << std::hex << mantissa << "\\n";
}

// Usage
analyze_double(3.141592653589793);
analyze_double(std::numeric_limits<double>::infinity());
analyze_double(std::numeric_limits<double>::quiet_NaN());`}
            </CodeBlock>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '⚖️ Comparison of Methods' : '⚖️ Comparación de Métodos'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`#include <bit>
#include <cstring>

float f = 3.14159f;

// Method 1: std::bit_cast (C++20) - RECOMMENDED
auto bits1 = std::bit_cast<std::uint32_t>(f);
// ✅ Type-safe, compile-time checked, no UB
// ✅ Optimizable, constexpr-friendly
// ❌ Requires C++20

// Method 2: memcpy - PORTABLE & SAFE  
std::uint32_t bits2;
std::memcpy(&bits2, &f, sizeof(f));
// ✅ Always safe, no UB, portable
// ✅ Works with all C++ versions
// ❌ Potentially less optimizable
// ❌ Runtime operation

// Method 3: union - IMPLEMENTATION-DEFINED
union { float f; std::uint32_t i; } pun;
pun.f = f;
auto bits3 = pun.i;
// ⚠️ Implementation-defined behavior
// ⚠️ Type punning rules complex
// ✅ Widely supported

// Method 4: reinterpret_cast - DANGEROUS
auto bits4 = *reinterpret_cast<std::uint32_t*>(&f);
// ❌ UNDEFINED BEHAVIOR (strict aliasing violation)
// ❌ May work on some compilers/platforms
// ❌ NOT RECOMMENDED

// Performance comparison (typical)
// bit_cast:        Same as reinterpret_cast when optimized
// memcpy:          Often optimized to same assembly
// union:           Usually optimized well
// reinterpret_cast: Fast but UB`}
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🧰 Advanced Applications' : '🧰 Aplicaciones Avanzadas'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4>{state.language === 'en' ? 'Custom Hash Function' : 'Función Hash Personalizada'}</h4>
            <CodeBlock language="cpp">
{`template<typename T>
std::size_t bit_hash(const T& value) {
    static_assert(std::is_trivially_copyable_v<T>);
    
    if constexpr (sizeof(T) <= sizeof(std::size_t)) {
        // For small types, bit_cast to size_t
        return std::bit_cast<std::size_t>(value);
    } else {
        // For larger types, XOR chunks
        constexpr auto chunk_count = sizeof(T) / sizeof(std::size_t);
        auto bytes = std::bit_cast<std::array<std::size_t, chunk_count>>(value);
        
        std::size_t hash = 0;
        for (auto chunk : bytes) {
            hash ^= chunk;
        }
        return hash;
    }
}`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Fast Float Comparison' : 'Comparación Rápida de Float'}</h4>
            <CodeBlock language="cpp">
{`bool nearly_equal(float a, float b, int max_ulps = 4) {
    // Convert to integer representation
    auto ia = std::bit_cast<std::uint32_t>(a);
    auto ib = std::bit_cast<std::uint32_t>(b);
    
    // Handle negative numbers (two's complement)
    if (ia & 0x80000000) ia = 0x80000000 - ia;
    if (ib & 0x80000000) ib = 0x80000000 - ib;
    
    // Check if difference is within max_ulps
    auto diff = (ia > ib) ? (ia - ib) : (ib - ia);
    return diff <= static_cast<std::uint32_t>(max_ulps);
}

// Usage
float a = 0.1f + 0.2f;
float b = 0.3f;
bool equal = nearly_equal(a, b);  // Handles floating-point precision`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Endianness Detection' : 'Detección de Endianness'}</h4>
            <CodeBlock language="cpp">
{`constexpr bool is_little_endian() {
    std::uint32_t test = 0x12345678;
    auto bytes = std::bit_cast<std::array<std::uint8_t, 4>>(test);
    return bytes[0] == 0x78;  // Little endian: LSB first
}

template<typename T>
T swap_endian(T value) {
    static_assert(std::is_trivially_copyable_v<T>);
    
    auto bytes = std::bit_cast<std::array<std::uint8_t, sizeof(T)>>(value);
    std::reverse(bytes.begin(), bytes.end());
    return std::bit_cast<T>(bytes);
}

// Network byte order conversion
std::uint32_t host_to_network(std::uint32_t host_val) {
    if constexpr (is_little_endian()) {
        return swap_endian(host_val);
    } else {
        return host_val;
    }
}`}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'SIMD Integration' : 'Integración SIMD'}</h4>
            <CodeBlock language="cpp">
{`#include <immintrin.h>

// Convert between SIMD types and arrays
void simd_example() {
    // Array to SIMD register
    alignas(16) std::array<float, 4> data = {1.0f, 2.0f, 3.0f, 4.0f};
    __m128 simd_reg = std::bit_cast<__m128>(data);
    
    // Process with SIMD
    __m128 result = _mm_mul_ps(simd_reg, _mm_set1_ps(2.0f));
    
    // SIMD register back to array
    auto result_array = std::bit_cast<std::array<float, 4>>(result);
    
    for (float f : result_array) {
        std::cout << f << " ";  // 2.0 4.0 6.0 8.0
    }
}`}
            </CodeBlock>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🔍 Compile-time bit_cast' : '🔍 bit_cast en Tiempo de Compilación'}
        </SectionTitle>
        
        <CodeBlock language="cpp" showLineNumbers={true}>
{`// std::bit_cast is constexpr in C++20
constexpr std::uint32_t compile_time_conversion() {
    constexpr float pi = 3.14159265f;
    
    // This happens at compile time!
    constexpr auto bits = std::bit_cast<std::uint32_t>(pi);
    
    return bits;
}

// Template metaprogramming with bit_cast
template<float Value>
struct FloatBits {
    static constexpr auto bits = std::bit_cast<std::uint32_t>(Value);
    static constexpr bool is_negative = (bits >> 31) != 0;
    static constexpr auto exponent = (bits >> 23) & 0xFF;
    static constexpr auto mantissa = bits & 0x7FFFFF;
};

// Usage at compile time
constexpr auto pi_bits = FloatBits<3.14159f>::bits;  // 0x40490fdb
static_assert(FloatBits<-1.0f>::is_negative);
static_assert(FloatBits<1.0f>::exponent == 127);  // IEEE 754 bias

// Compile-time floating-point classification
template<float Value>
constexpr bool is_finite_v = FloatBits<Value>::exponent != 0xFF;

template<float Value>  
constexpr bool is_nan_v = (FloatBits<Value>::exponent == 0xFF) && 
                         (FloatBits<Value>::mantissa != 0);

// Zero-cost compile-time computation
static_assert(is_finite_v<3.14f>);
static_assert(!is_finite_v<std::numeric_limits<float>::infinity()>);
static_assert(is_nan_v<std::numeric_limits<float>::quiet_NaN()>);`}
        </CodeBlock>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Lesson on std::bit_cast. Current example: ${examples[lessonState.currentExample].title}`}
      />
    </LessonLayout>
  );
};

export default Lesson62_BitCast;