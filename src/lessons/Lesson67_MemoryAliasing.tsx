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

interface MemoryAliasingState {
  demonstrationType: 'compiler_analysis' | 'restrict_keyword' | 'disambiguation' | 'optimization_impact';
  currentScenario: number;
  memoryBlocks: {
    address: number;
    size: number;
    type: string;
    aliasGroup: number;
    accessCount: number;
    lastAccess: string;
  }[];
  aliasingRelations: {
    block1: number;
    block2: number;
    canAlias: boolean;
    reason: string;
  }[];
  optimizationLevel: number;
  performanceGain: number;
  compilerAssumptions: string[];
  restrictUsage: {
    enabled: boolean;
    conflicts: number;
    optimizations: string[];
  };
}

const MemoryAliasingVisualization: React.FC<{ state: MemoryAliasingState }> = ({ state }) => {
  const scenarios = [
    {
      title: 'Compiler Aliasing Analysis',
      description: 'How compilers determine potential memory aliasing',
      focus: 'analysis'
    },
    {
      title: 'restrict Keyword Effects',
      description: 'Performance gains from aliasing guarantees',
      focus: 'restrict'
    },
    {
      title: 'Memory Disambiguation',
      description: 'Techniques for resolving aliasing uncertainty',
      focus: 'disambiguation'
    },
    {
      title: 'Optimization Impact',
      description: 'Performance implications of aliasing analysis',
      focus: 'optimization'
    }
  ];

  const currentScenario = scenarios[state.currentScenario] || scenarios[0];

  const getAliasGroupColor = (group: number) => {
    const colors = ['#2ed573', '#00d4ff', '#ffa500', '#e74c3c', '#9b59b6', '#f39c12'];
    return colors[group % colors.length];
  };

  const renderCompilerAnalysis = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Compiler Aliasing Analysis
      </Text>
      
      {/* Memory blocks with aliasing relationships */}
      {state.memoryBlocks.slice(0, 6).map((block, index) => (
        <group key={index} position={[index * 2.5 - 6.25, 2, 0]}>
          <Box args={[2, 1.5, 0.4]}>
            <meshStandardMaterial 
              color={getAliasGroupColor(block.aliasGroup)}
              transparent 
              opacity={0.8} 
            />
          </Box>
          
          <Text position={[0, 0.2, 0.3]} fontSize={0.08} color="white" anchorX="center">
            {block.type}
          </Text>
          
          <Text position={[0, 0, 0.3]} fontSize={0.06} color="white" anchorX="center">
            0x{block.address.toString(16)}
          </Text>
          
          <Text position={[0, -0.2, 0.3]} fontSize={0.05} color="white" anchorX="center">
            Group {block.aliasGroup}
          </Text>
          
          <Text position={[0, -0.8, 0]} fontSize={0.05} color="#888" anchorX="center">
            Accesses: {block.accessCount}
          </Text>
          
          <Text position={[0, -1, 0]} fontSize={0.04} color="#888" anchorX="center">
            {block.lastAccess}
          </Text>
        </group>
      ))}
      
      {/* Aliasing relationships */}
      <group position={[0, 0.5, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#ffa500" anchorX="center">
          Aliasing Relationships
        </Text>
        
        {state.aliasingRelations.slice(0, 3).map((relation, index) => (
          <group key={index} position={[index * 3 - 3, 0, 0]}>
            <Box args={[2.5, 0.6, 0.2]}>
              <meshStandardMaterial 
                color={relation.canAlias ? '#ffa500' : '#2ed573'}
                transparent 
                opacity={0.7} 
              />
            </Box>
            
            <Text position={[0, 0.1, 0.15]} fontSize={0.06} color="white" anchorX="center">
              Block {relation.block1} ↔ Block {relation.block2}
            </Text>
            
            <Text position={[0, -0.1, 0.15]} fontSize={0.05} color="white" anchorX="center">
              {relation.canAlias ? 'May Alias' : 'No Alias'}
            </Text>
            
            <Text position={[0, -0.4, 0]} fontSize={0.04} color="#888" anchorX="center">
              {relation.reason}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );

  const renderRestrictKeyword = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        restrict Keyword Effects
      </Text>
      
      {/* Before/After comparison */}
      <group position={[0, 2, 0]}>
        <group position={[-3, 0, 0]}>
          <Text position={[0, 0.5, 0]} fontSize={0.12} color="#ff4757" anchorX="center">
            Without restrict
          </Text>
          
          <Box args={[2.5, 1, 0.3]}>
            <meshStandardMaterial color="#ff4757" transparent opacity={0.6} />
          </Box>
          
          <Text position={[0, 0, 0.2]} fontSize={0.06} color="white" anchorX="center">
            Conservative Analysis
          </Text>
          
          <Text position={[0, -0.7, 0]} fontSize={0.05} color="#888" anchorX="center">
            Assumes potential aliasing
          </Text>
        </group>
        
        <Text position={[0, 0, 0]} fontSize={0.1} color="#ffa500" anchorX="center">
          →
        </Text>
        
        <group position={[3, 0, 0]}>
          <Text position={[0, 0.5, 0]} fontSize={0.12} color="#2ed573" anchorX="center">
            With restrict
          </Text>
          
          <Box args={[2.5, 1, 0.3]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.6} />
          </Box>
          
          <Text position={[0, 0, 0.2]} fontSize={0.06} color="white" anchorX="center">
            Aggressive Optimization
          </Text>
          
          <Text position={[0, -0.7, 0]} fontSize={0.05} color="#888" anchorX="center">
            No aliasing guarantee
          </Text>
        </group>
      </group>
      
      {/* Performance metrics */}
      <group position={[0, 0, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.15} color="#00d4ff" anchorX="center">
          Performance Impact
        </Text>
        
        <Text position={[-2.5, 0, 0]} fontSize={0.08} color="#2ed573" anchorX="center">
          Vectorization: {state.restrictUsage.enabled ? '✓ Enabled' : '✗ Limited'}
        </Text>
        
        <Text position={[0, 0, 0]} fontSize={0.08} color="#00d4ff" anchorX="center">
          Performance Gain: +{state.performanceGain}%
        </Text>
        
        <Text position={[2.5, 0, 0]} fontSize={0.08} color="#ffa500" anchorX="center">
          Conflicts: {state.restrictUsage.conflicts}
        </Text>
      </group>
      
      {/* Optimization list */}
      <group position={[0, -1.5, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
          Enabled Optimizations
        </Text>
        
        {state.restrictUsage.optimizations.slice(0, 3).map((opt, index) => (
          <Text 
            key={index}
            position={[index * 3 - 3, 0, 0]} 
            fontSize={0.06} 
            color="#2ed573" 
            anchorX="center"
          >
            ✓ {opt}
          </Text>
        ))}
      </group>
    </group>
  );

  const renderDisambiguation = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Memory Disambiguation Techniques
      </Text>
      
      {/* Analysis techniques */}
      <group position={[0, 2, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
          Analysis Methods
        </Text>
        
        <group position={[-3, 0, 0]}>
          <Box args={[2, 1, 0.3]}>
            <meshStandardMaterial color="#00d4ff" transparent opacity={0.7} />
          </Box>
          <Text position={[0, 0.1, 0.2]} fontSize={0.06} color="white" anchorX="center">
            Type-based Analysis
          </Text>
          <Text position={[0, -0.1, 0.2]} fontSize={0.05} color="white" anchorX="center">
            Strict Aliasing
          </Text>
        </group>
        
        <group position={[0, 0, 0]}>
          <Box args={[2, 1, 0.3]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.7} />
          </Box>
          <Text position={[0, 0.1, 0.2]} fontSize={0.06} color="white" anchorX="center">
            Flow Analysis
          </Text>
          <Text position={[0, -0.1, 0.2]} fontSize={0.05} color="white" anchorx="center">
            Data Flow Graph
          </Text>
        </group>
        
        <group position={[3, 0, 0]}>
          <Box args={[2, 1, 0.3]}>
            <meshStandardMaterial color="#ffa500" transparent opacity={0.7} />
          </Box>
          <Text position={[0, 0.1, 0.2]} fontSize={0.06} color="white" anchorX="center">
            Runtime Checks
          </Text>
          <Text position={[0, -0.1, 0.2]} fontSize={0.05} color="white" anchorX="center">
            Address Compare
          </Text>
        </group>
      </group>
      
      {/* Compiler assumptions */}
      <group position={[0, 0, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#ffa500" anchorX="center">
          Compiler Assumptions
        </Text>
        
        {state.compilerAssumptions.slice(0, 3).map((assumption, index) => (
          <Text 
            key={index}
            position={[index * 4 - 4, 0, 0]} 
            fontSize={0.06} 
            color="#00d4ff" 
            anchorX="center"
          >
            • {assumption}
          </Text>
        ))}
      </group>
    </group>
  );

  const renderOptimizationImpact = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Optimization Impact Analysis
      </Text>
      
      {/* Optimization levels */}
      <group position={[0, 2, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
          Optimization Levels
        </Text>
        
        {[0, 1, 2, 3].map((level) => (
          <group key={level} position={[level * 2.5 - 3.75, 0, 0]}>
            <Box args={[2, 1 + level * 0.3, 0.3]}>
              <meshStandardMaterial 
                color={level <= state.optimizationLevel ? '#2ed573' : '#57606f'}
                transparent 
                opacity={0.8} 
              />
            </Box>
            
            <Text position={[0, 0, 0.2]} fontSize={0.08} color="white" anchorX="center">
              -O{level}
            </Text>
            
            <Text position={[0, -0.8, 0]} fontSize={0.05} color="#888" anchorX="center">
              {level === 0 && 'No optimization'}
              {level === 1 && 'Basic'}
              {level === 2 && 'Full'}
              {level === 3 && 'Aggressive'}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Performance metrics */}
      <group position={[0, 0, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#00d4ff" anchorX="center">
          Performance Metrics
        </Text>
        
        {/* Performance bar */}
        <group position={[0, 0, 0]}>
          <Box args={[6, 0.4, 0.2]}>
            <meshStandardMaterial color="#57606f" transparent opacity={0.3} />
          </Box>
          
          <Box args={[6 * (state.performanceGain / 100), 0.4, 0.25]} position={[-3 + 3 * (state.performanceGain / 100), 0, 0]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.8} />
          </Box>
          
          <Text position={[0, 0, 0.3]} fontSize={0.08} color="white" anchorX="center">
            {state.performanceGain}% improvement
          </Text>
        </group>
      </group>
      
      {/* Impact breakdown */}
      <group position={[0, -1.5, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
          Optimization Benefits
        </Text>
        
        <Text position={[-2.5, 0, 0]} fontSize={0.07} color="#2ed573" anchorX="center">
          Register allocation: +25%
        </Text>
        
        <Text position={[0, 0, 0]} fontSize={0.07} color="#00d4ff" anchorX="center">
          Loop unrolling: +15%
        </Text>
        
        <Text position={[2.5, 0, 0]} fontSize={0.07} color="#ffa500" anchorX="center">
          Vectorization: +35%
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
      
      {state.demonstrationType === 'compiler_analysis' && renderCompilerAnalysis()}
      {state.demonstrationType === 'restrict_keyword' && renderRestrictKeyword()}
      {state.demonstrationType === 'disambiguation' && renderDisambiguation()}
      {state.demonstrationType === 'optimization_impact' && renderOptimizationImpact()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson67_MemoryAliasing: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<MemoryAliasingState>({
    demonstrationType: 'compiler_analysis',
    currentScenario: 0,
    memoryBlocks: [
      { address: 0x1000, size: 4, type: 'int*', aliasGroup: 0, accessCount: 5, lastAccess: 'read' },
      { address: 0x1004, size: 4, type: 'int*', aliasGroup: 0, accessCount: 3, lastAccess: 'write' },
      { address: 0x2000, size: 4, type: 'float*', aliasGroup: 1, accessCount: 2, lastAccess: 'read' },
      { address: 0x2004, size: 4, type: 'float*', aliasGroup: 1, accessCount: 4, lastAccess: 'write' },
      { address: 0x3000, size: 1, type: 'char*', aliasGroup: 2, accessCount: 8, lastAccess: 'read' },
      { address: 0x3001, size: 1, type: 'char*', aliasGroup: 2, accessCount: 6, lastAccess: 'write' }
    ],
    aliasingRelations: [
      { block1: 0, block2: 1, canAlias: true, reason: 'Same type' },
      { block1: 0, block2: 2, canAlias: false, reason: 'Different types' },
      { block1: 4, block2: 0, canAlias: true, reason: 'char* can alias any' }
    ],
    optimizationLevel: 2,
    performanceGain: 45,
    compilerAssumptions: [
      'Different types don\'t alias',
      'restrict pointers are unique',
      'Local addresses don\'t escape'
    ],
    restrictUsage: {
      enabled: false,
      conflicts: 0,
      optimizations: ['Loop vectorization', 'Register promotion', 'Dead store elimination']
    }
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 8,
    completedSteps: [],
    score: 0
  });

  const codeExamples = {
    compiler_analysis: `// Compiler aliasing analysis fundamentals
#include <iostream>
#include <vector>
#include <chrono>

// Example 1: Basic aliasing analysis
void basic_aliasing_analysis(int* a, float* b, int n) {
    // Compiler analysis:
    // - int* and float* cannot alias (strict aliasing rule)
    // - Compiler can optimize aggressively
    
    for (int i = 0; i < n; ++i) {
        *a = i;           // Store to int location
        *b = i * 2.0f;    // Store to float location - independent!
        
        // Compiler can:
        // - Reorder these operations
        // - Keep *a in registers
        // - Vectorize the loop
        // - Eliminate redundant loads
        
        int value = *a;   // Compiler knows this is still 'i'
        std::cout << value << " ";
    }
}

void potential_aliasing(int* a, int* b, int n) {
    // Compiler analysis:
    // - Both are int* - they MIGHT alias
    // - Must be conservative about optimizations
    
    for (int i = 0; i < n; ++i) {
        *a = i;           // Store to int location
        *b = i * 2;       // Store to another int location - might be same!
        
        // Compiler must:
        // - Assume *b might modify *a's location
        // - Reload *a from memory
        // - Limited vectorization possible
        // - Conservative register allocation
        
        int value = *a;   // Might be 'i' or 'i*2' - must reload!
        std::cout << value << " ";
    }
}

// Example 2: Aliasing with different access patterns
class AliasingAnalyzer {
public:
    // Method 1: Clear no-alias case
    void independent_arrays(int* restrict arr1, float* restrict arr2, size_t n) {
        // Compiler knows:
        // 1. Different types (int vs float) 
        // 2. restrict guarantees no overlap
        // Result: Maximum optimization possible
        
        for (size_t i = 0; i < n; ++i) {
            arr1[i] = static_cast<int>(i);      // Can be vectorized
            arr2[i] = static_cast<float>(i);    // Can run in parallel
            
            // These operations can be:
            // - Reordered freely
            // - Vectorized independently
            // - Pipelined across iterations
        }
    }
    
    // Method 2: Potential aliasing - same type
    void same_type_arrays(int* arr1, int* arr2, size_t n) {
        // Compiler must assume:
        // - arr1 and arr2 might point to overlapping memory
        // - Each store through arr2 might affect arr1[i]
        // - Limited optimization opportunities
        
        for (size_t i = 0; i < n; ++i) {
            arr1[i] = static_cast<int>(i * 2);
            arr2[i] = static_cast<int>(i * 3);   // Might modify arr1[i]!
            
            // Compiler must be conservative:
            // - No aggressive vectorization
            // - Must check for dependencies
            // - Register promotion limited
        }
    }
    
    // Method 3: Byte-level access - aliases everything
    void byte_access(char* bytes, int* ints, float* floats, size_t n) {
        // char* can alias ANY type:
        // - Compiler must assume bytes might modify ints/floats
        // - Very conservative optimization
        
        for (size_t i = 0; i < n; ++i) {
            bytes[i] = static_cast<char>(i);     // Might modify ints[j] or floats[k]
            ints[i] = static_cast<int>(i);       // Must reload after bytes access
            floats[i] = static_cast<float>(i);   // Must reload after bytes access
        }
    }
};

// Example 3: Compiler optimization opportunities
void demonstrate_optimization_levels() {
    const size_t N = 10000;
    std::vector<int> data1(N);
    std::vector<float> data2(N);
    
    auto start = std::chrono::high_resolution_clock::now();
    
    // This can be heavily optimized:
    // - Different types don't alias
    // - Loop can be vectorized
    // - Operations can be pipelined
    for (size_t i = 0; i < N; ++i) {
        data1[i] = static_cast<int>(i * 2);
        data2[i] = static_cast<float>(i * 3.14);
        // No dependency between these operations
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    std::cout << "Optimized loop time: " << duration.count() << " microseconds\\n";
}

// Example 4: Manual aliasing analysis with templates
template<typename T, typename U>
constexpr bool can_alias() {
    // Simplified aliasing rules check
    return std::is_same_v<T, U> ||                    // Same type can alias
           std::is_same_v<T, char> ||                 // char can alias anything
           std::is_same_v<U, char> ||                 
           std::is_same_v<T, unsigned char> ||        // unsigned char can alias anything
           std::is_same_v<U, unsigned char> ||
           std::is_same_v<T, void> ||                 // void* can alias anything
           std::is_same_v<U, void>;
}

template<typename T, typename U>
void template_aliasing_demo(T* ptr1, U* ptr2, size_t n) {
    constexpr bool might_alias = can_alias<T, U>();
    
    std::cout << "Types " << typeid(T).name() << " and " << typeid(U).name();
    
    if constexpr (might_alias) {
        std::cout << " might alias - conservative optimization\\n";
        
        // Conservative approach when aliasing is possible
        for (size_t i = 0; i < n; ++i) {
            *ptr1 = static_cast<T>(i);
            *ptr2 = static_cast<U>(i);
            
            // Must assume these might interfere
            T reloaded = *ptr1;  // Compiler must reload
        }
    } else {
        std::cout << " cannot alias - aggressive optimization possible\\n";
        
        // Aggressive optimization when no aliasing
        for (size_t i = 0; i < n; ++i) {
            *ptr1 = static_cast<T>(i);
            *ptr2 = static_cast<U>(i);
            
            // Compiler can keep ptr1 value in register
            T cached = static_cast<T>(i);  // Can use cached value
        }
    }
}`,

    restrict_keyword: `// The restrict keyword (C99/C++23, GCC extension)
#include <iostream>
#include <chrono>
#include <vector>
#include <immintrin.h>  // For intrinsics

// Example 1: Basic restrict usage
void copy_array_basic(int* dest, const int* src, size_t n) {
    // Without restrict: compiler must assume dest and src might overlap
    // Conservative code generation - no aggressive optimization
    
    for (size_t i = 0; i < n; ++i) {
        dest[i] = src[i] * 2;
        // Compiler must handle potential overlap between dest and src
    }
}

void copy_array_restrict(int* restrict dest, const int* restrict src, size_t n) {
    // With restrict: programmer guarantees dest and src don't overlap
    // Compiler can optimize aggressively
    
    for (size_t i = 0; i < n; ++i) {
        dest[i] = src[i] * 2;
        // Compiler can:
        // - Vectorize this loop
        // - Use SIMD instructions
        // - Prefetch memory
        // - Pipeline operations
    }
}

// Example 2: Matrix operations with restrict
class MatrixOperations {
public:
    // Without restrict - conservative
    static void matrix_multiply_conservative(
        double* result, const double* a, const double* b,
        size_t rows, size_t cols, size_t inner) {
        
        for (size_t i = 0; i < rows; ++i) {
            for (size_t j = 0; j < cols; ++j) {
                double sum = 0.0;
                for (size_t k = 0; k < inner; ++k) {
                    sum += a[i * inner + k] * b[k * cols + j];
                }
                result[i * cols + j] = sum;
                
                // Compiler must be careful about pointer aliasing
                // Limited optimization opportunities
            }
        }
    }
    
    // With restrict - aggressive optimization
    static void matrix_multiply_optimized(
        double* restrict result, 
        const double* restrict a, 
        const double* restrict b,
        size_t rows, size_t cols, size_t inner) {
        
        for (size_t i = 0; i < rows; ++i) {
            for (size_t j = 0; j < cols; ++j) {
                double sum = 0.0;
                for (size_t k = 0; k < inner; ++k) {
                    sum += a[i * inner + k] * b[k * cols + j];
                }
                result[i * cols + j] = sum;
                
                // Compiler can:
                // - Vectorize inner loop
                // - Use FMA instructions
                // - Optimize memory access patterns
                // - Apply loop unrolling
            }
        }
    }
};

// Example 3: restrict with function parameters
// Function that benefits from restrict
void vector_operations_restrict(
    float* restrict output,
    const float* restrict input1,
    const float* restrict input2,
    const float* restrict weights,
    size_t n) {
    
    // Complex computation that benefits from non-aliasing guarantee
    for (size_t i = 0; i < n; ++i) {
        float temp1 = input1[i] * weights[0];
        float temp2 = input2[i] * weights[1];
        float combined = temp1 + temp2;
        
        // Multiple operations that can be optimized
        output[i] = combined * weights[2] + weights[3];
        
        // With restrict, compiler can:
        // 1. Keep weights in registers
        // 2. Vectorize the entire computation
        // 3. Pipeline memory operations
        // 4. Eliminate redundant loads
    }
}

// Example 4: restrict in C++ templates
template<typename T>
class RestrictOptimizedVector {
private:
    T* data_;
    size_t size_;
    
public:
    // Method using restrict for performance
    void transform_restrict(T* restrict output, 
                          const T* restrict input,
                          size_t n,
                          T factor) {
        // Template allows compiler to specialize for each type
        // restrict allows aggressive optimization
        
        for (size_t i = 0; i < n; ++i) {
            output[i] = input[i] * factor + static_cast<T>(1);
        }
        
        // Compiler can generate type-specific optimized code:
        // - SIMD for float/double
        // - Integer optimizations for int types
        // - Eliminate bounds checks in release builds
    }
    
    // Comparative method without restrict
    void transform_conservative(T* output, 
                              const T* input,
                              size_t n,
                              T factor) {
        for (size_t i = 0; i < n; ++i) {
            output[i] = input[i] * factor + static_cast<T>(1);
        }
        // More conservative optimization due to potential aliasing
    }
};

// Example 5: Performance measurement
class PerformanceTester {
public:
    static void measure_restrict_impact() {
        const size_t N = 1000000;
        std::vector<float> input1(N, 1.0f);
        std::vector<float> input2(N, 2.0f);
        std::vector<float> output(N);
        std::vector<float> weights{1.5f, 2.5f, 0.5f, 1.0f};
        
        // Test without restrict
        auto start = std::chrono::high_resolution_clock::now();
        
        for (int trial = 0; trial < 100; ++trial) {
            vector_operations_conservative(output.data(), 
                                        input1.data(), 
                                        input2.data(), 
                                        weights.data(), 
                                        N);
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto conservative_time = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        // Test with restrict
        start = std::chrono::high_resolution_clock::now();
        
        for (int trial = 0; trial < 100; ++trial) {
            vector_operations_restrict(output.data(), 
                                     input1.data(), 
                                     input2.data(), 
                                     weights.data(), 
                                     N);
        }
        
        end = std::chrono::high_resolution_clock::now();
        auto restrict_time = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        std::cout << "Conservative time: " << conservative_time.count() << " μs\\n";
        std::cout << "restrict time: " << restrict_time.count() << " μs\\n";
        std::cout << "Speedup: " << static_cast<double>(conservative_time.count()) / restrict_time.count() << "x\\n";
    }
    
private:
    static void vector_operations_conservative(
        float* output,
        const float* input1,
        const float* input2,
        const float* weights,
        size_t n) {
        
        for (size_t i = 0; i < n; ++i) {
            float temp1 = input1[i] * weights[0];
            float temp2 = input2[i] * weights[1];
            float combined = temp1 + temp2;
            output[i] = combined * weights[2] + weights[3];
        }
    }
};

// Example 6: restrict with modern C++ features
#ifdef __cpp_lib_restrict  // Hypothetical C++26 feature
template<typename T>
void modern_restrict_usage(std::span<T> restrict output,
                          std::span<const T> restrict input1,
                          std::span<const T> restrict input2) {
    // Modern C++ with restrict and spans
    assert(output.size() == input1.size());
    assert(output.size() == input2.size());
    
    for (size_t i = 0; i < output.size(); ++i) {
        output[i] = input1[i] + input2[i];
    }
}
#endif

// Example 7: Compiler-specific restrict extensions
#ifdef __GNUC__
void gcc_restrict_example(int* __restrict__ a, 
                         int* __restrict__ b, 
                         size_t n) {
    // GCC-specific syntax
    for (size_t i = 0; i < n; ++i) {
        a[i] = b[i] * 2;
    }
}
#endif

#ifdef _MSC_VER
void msvc_restrict_example(int* __restrict a, 
                          int* __restrict b, 
                          size_t n) {
    // MSVC-specific syntax
    for (size_t i = 0; i < n; ++i) {
        a[i] = b[i] * 2;
    }
}
#endif

// Cross-platform restrict macro
#if defined(__GNUC__)
    #define RESTRICT __restrict__
#elif defined(_MSC_VER)
    #define RESTRICT __restrict
#else
    #define RESTRICT
#endif

void portable_restrict_example(int* RESTRICT a, 
                             int* RESTRICT b, 
                             size_t n) {
    for (size_t i = 0; i < n; ++i) {
        a[i] = b[i] * 2;
    }
}`,

    disambiguation: `// Memory disambiguation techniques
#include <iostream>
#include <type_traits>
#include <memory>
#include <cassert>

// Example 1: Type-based aliasing analysis
template<typename T, typename U>
struct AliasAnalysis {
    static constexpr bool might_alias() {
        // C++ strict aliasing rules
        if constexpr (std::is_same_v<T, U>) {
            return true;  // Same types can alias
        }
        
        // Character types can alias anything
        if constexpr (std::is_same_v<T, char> || std::is_same_v<T, unsigned char> ||
                      std::is_same_v<U, char> || std::is_same_v<U, unsigned char>) {
            return true;
        }
        
        // void* can alias anything
        if constexpr (std::is_same_v<T, void> || std::is_same_v<U, void>) {
            return true;
        }
        
        // Compatible types (signed/unsigned variants)
        if constexpr ((std::is_same_v<T, signed char> && std::is_same_v<U, unsigned char>) ||
                      (std::is_same_v<T, unsigned char> && std::is_same_v<U, signed char>)) {
            return true;
        }
        
        return false;  // Different types generally cannot alias
    }
    
    static void demonstrate_analysis() {
        std::cout << "int and float can alias: " << might_alias<int, float>() << "\\n";
        std::cout << "int and int can alias: " << might_alias<int, int>() << "\\n";
        std::cout << "int and char can alias: " << might_alias<int, char>() << "\\n";
        std::cout << "float and void can alias: " << might_alias<float, void>() << "\\n";
    }
};

// Example 2: Address-based disambiguation
class AddressDisambiguation {
public:
    // Static analysis of address relationships
    template<typename T>
    static bool definitely_no_overlap(T* ptr1, size_t size1, T* ptr2, size_t size2) {
        // Check if memory regions definitely don't overlap
        uintptr_t addr1 = reinterpret_cast<uintptr_t>(ptr1);
        uintptr_t addr2 = reinterpret_cast<uintptr_t>(ptr2);
        
        uintptr_t end1 = addr1 + size1 * sizeof(T);
        uintptr_t end2 = addr2 + size2 * sizeof(T);
        
        // No overlap if one region ends before the other starts
        return (end1 <= addr2) || (end2 <= addr1);
    }
    
    // Runtime disambiguation for dynamic cases
    template<typename T>
    static void conditional_copy(T* dest, const T* src, size_t n) {
        if (definitely_no_overlap(dest, n, const_cast<T*>(src), n)) {
            // Fast path - no overlap, can optimize
            std::cout << "Using optimized non-overlapping copy\\n";
            
            for (size_t i = 0; i < n; ++i) {
                dest[i] = src[i];  // Can be vectorized
            }
        } else {
            // Slow path - potential overlap, use safe method
            std::cout << "Using safe overlapping copy\\n";
            
            if (dest > src) {
                // Copy backwards to handle overlap
                for (size_t i = n; i > 0; --i) {
                    dest[i-1] = src[i-1];
                }
            } else {
                // Copy forwards
                for (size_t i = 0; i < n; ++i) {
                    dest[i] = src[i];
                }
            }
        }
    }
};

// Example 3: Compiler intrinsics for disambiguation
class CompilerHints {
public:
    // GCC/Clang builtin for aliasing hints
    #ifdef __GNUC__
    template<typename T>
    static void optimized_loop_with_hints(T* restrict a, T* restrict b, size_t n) {
        // Tell compiler these pointers don't alias
        __builtin_assume_aligned(a, 64);  // Hint about alignment
        __builtin_assume_aligned(b, 64);
        
        for (size_t i = 0; i < n; ++i) {
            a[i] = b[i] * static_cast<T>(2);
        }
        
        // Additional hint that loop count is multiple of vector size
        if (n % 8 == 0) {
            __builtin_unreachable();  // This helps with remainder handling
        }
    }
    #endif
    
    // MSVC-specific disambiguation
    #ifdef _MSC_VER
    template<typename T>
    static void msvc_optimized_loop(T* __restrict a, T* __restrict b, size_t n) {
        __assume(reinterpret_cast<uintptr_t>(a) % 64 == 0);  // Alignment hint
        __assume(reinterpret_cast<uintptr_t>(b) % 64 == 0);
        __assume(n > 0 && n % 8 == 0);  // Loop bounds hint
        
        for (size_t i = 0; i < n; ++i) {
            a[i] = b[i] * static_cast<T>(2);
        }
    }
    #endif
};

// Example 4: Template-based disambiguation
template<bool NoAlias>
class ConditionalOptimization {
public:
    template<typename T>
    static void process_arrays(T* dest, const T* src1, const T* src2, size_t n) {
        if constexpr (NoAlias) {
            // Compile-time guarantee of no aliasing
            process_no_alias(dest, src1, src2, n);
        } else {
            // Conservative processing with potential aliasing
            process_with_aliasing(dest, src1, src2, n);
        }
    }
    
private:
    template<typename T>
    static void process_no_alias(T* dest, const T* src1, const T* src2, size_t n) {
        // Aggressive optimization - compiler knows no aliasing
        for (size_t i = 0; i < n; ++i) {
            T temp1 = src1[i] * static_cast<T>(2);
            T temp2 = src2[i] * static_cast<T>(3);
            dest[i] = temp1 + temp2;
            
            // Compiler can:
            // - Keep temporaries in registers
            // - Vectorize entire operation
            // - Pipeline memory accesses
        }
    }
    
    template<typename T>
    static void process_with_aliasing(T* dest, const T* src1, const T* src2, size_t n) {
        // Conservative optimization - handle potential aliasing
        for (size_t i = 0; i < n; ++i) {
            // Must be careful about evaluation order
            T temp1 = src1[i] * static_cast<T>(2);
            T temp2 = src2[i] * static_cast<T>(3);
            dest[i] = temp1 + temp2;
            
            // Compiler must:
            // - Check for dependencies
            // - Limited vectorization
            // - Conservative register usage
        }
    }
};

// Example 5: RAII-based disambiguation helper
template<typename T>
class AliasingGuard {
private:
    T* ptr1_;
    T* ptr2_;
    size_t size1_;
    size_t size2_;
    bool can_optimize_;
    
public:
    AliasingGuard(T* ptr1, size_t size1, T* ptr2, size_t size2) 
        : ptr1_(ptr1), ptr2_(ptr2), size1_(size1), size2_(size2) {
        
        // Analyze aliasing potential at construction
        can_optimize_ = AddressDisambiguation::definitely_no_overlap(
            ptr1_, size1_, ptr2_, size2_);
        
        if (can_optimize_) {
            std::cout << "Aliasing guard: optimization enabled\\n";
        } else {
            std::cout << "Aliasing guard: conservative mode\\n";
        }
    }
    
    bool can_optimize() const { return can_optimize_; }
    
    template<typename Func>
    void execute_optimized(Func&& func) {
        if (can_optimize_) {
            // Call optimized version
            func(true);
        } else {
            // Call conservative version
            func(false);
        }
    }
};

// Example 6: Profile-guided disambiguation
class ProfileGuidedOptimization {
private:
    static std::unordered_map<std::pair<void*, void*>, size_t> alias_profile_;
    
public:
    template<typename T>
    static void profile_guided_operation(T* ptr1, T* ptr2, size_t n) {
        auto key = std::make_pair(static_cast<void*>(ptr1), static_cast<void*>(ptr2));
        
        // Check historical aliasing behavior
        auto it = alias_profile_.find(key);
        bool likely_no_alias = (it != alias_profile_.end()) && (it->second > 100);
        
        if (likely_no_alias) {
            // Use optimized path based on profile
            optimized_path(ptr1, ptr2, n);
        } else {
            // Use conservative path and update profile
            conservative_path(ptr1, ptr2, n);
            alias_profile_[key]++;
        }
    }
    
private:
    template<typename T>
    static void optimized_path(T* ptr1, T* ptr2, size_t n) {
        // Assume no aliasing based on profile data
        for (size_t i = 0; i < n; ++i) {
            ptr1[i] = ptr2[i] * static_cast<T>(2);
        }
    }
    
    template<typename T>
    static void conservative_path(T* ptr1, T* ptr2, size_t n) {
        // Conservative approach
        for (size_t i = 0; i < n; ++i) {
            T temp = ptr2[i];
            ptr1[i] = temp * static_cast<T>(2);
        }
    }
    
    static std::unordered_map<std::pair<void*, void*>, size_t> alias_profile_;
};

// Usage demonstration
void demonstrate_disambiguation() {
    const size_t N = 1000;
    std::vector<int> data1(N, 1);
    std::vector<int> data2(N, 2);
    std::vector<int> result(N);
    
    // Example 1: Compile-time disambiguation
    ConditionalOptimization<true>::process_arrays(
        result.data(), data1.data(), data2.data(), N);
    
    // Example 2: Runtime disambiguation
    AliasingGuard<int> guard(result.data(), N, data1.data(), N);
    guard.execute_optimized([&](bool can_optimize) {
        if (can_optimize) {
            std::cout << "Using optimized algorithm\\n";
        } else {
            std::cout << "Using conservative algorithm\\n";
        }
    });
    
    // Example 3: Type-based analysis
    AliasAnalysis<int, float>::demonstrate_analysis();
}`,

    optimization_impact: `// Optimization impact of aliasing analysis
#include <iostream>
#include <chrono>
#include <vector>
#include <immintrin.h>
#include <random>

// Example 1: Vectorization impact
class VectorizationDemo {
public:
    // Without aliasing guarantees - limited vectorization
    static void scalar_processing(float* result, const float* a, const float* b, size_t n) {
        for (size_t i = 0; i < n; ++i) {
            result[i] = a[i] * b[i] + a[i];  // Potential aliasing limits optimization
        }
    }
    
    // With restrict - full vectorization possible
    static void vector_processing(float* restrict result, 
                                const float* restrict a, 
                                const float* restrict b, 
                                size_t n) {
        // Compiler can generate SIMD code:
        // - AVX2: 8 floats per instruction
        // - AVX-512: 16 floats per instruction
        
        for (size_t i = 0; i < n; ++i) {
            result[i] = a[i] * b[i] + a[i];
        }
        
        // Generated assembly might include:
        // vmulps    %ymm1, %ymm0, %ymm2    ; Multiply 8 floats
        // vaddps    %ymm0, %ymm2, %ymm2    ; Add 8 floats  
        // vmovups   %ymm2, (%rdi,%rax,4)   ; Store 8 floats
    }
    
    // Manual vectorization for comparison
    static void manual_vector_processing(float* restrict result, 
                                       const float* restrict a, 
                                       const float* restrict b, 
                                       size_t n) {
        size_t vector_end = n - (n % 8);  // Process in chunks of 8
        
        // SIMD processing
        for (size_t i = 0; i < vector_end; i += 8) {
            __m256 va = _mm256_loadu_ps(&a[i]);
            __m256 vb = _mm256_loadu_ps(&b[i]);
            __m256 vmul = _mm256_mul_ps(va, vb);
            __m256 vadd = _mm256_add_ps(vmul, va);
            _mm256_storeu_ps(&result[i], vadd);
        }
        
        // Handle remainder
        for (size_t i = vector_end; i < n; ++i) {
            result[i] = a[i] * b[i] + a[i];
        }
    }
};

// Example 2: Loop optimization impact
class LoopOptimizationDemo {
public:
    // Conservative loop - potential aliasing
    static void conservative_loop(int* data1, int* data2, int* result, size_t n) {
        for (size_t i = 0; i < n; ++i) {
            data1[i] = i * 2;              // Might affect data2 or result
            data2[i] = data1[i] + 1;       // Must reload data1[i]
            result[i] = data1[i] + data2[i]; // Must reload both
            
            // Compiler limitations:
            // - Cannot keep values in registers across iterations
            // - Cannot reorder operations
            // - Limited loop unrolling
        }
    }
    
    // Optimized loop - no aliasing
    static void optimized_loop(int* restrict data1, 
                             int* restrict data2, 
                             int* restrict result, 
                             size_t n) {
        for (size_t i = 0; i < n; ++i) {
            data1[i] = i * 2;
            data2[i] = data1[i] + 1;       // Can reuse computed value
            result[i] = data1[i] + data2[i]; // Can reuse both values
            
            // Compiler optimizations:
            // - Keep intermediate values in registers
            // - Unroll loop aggressively
            // - Vectorize operations
            // - Pipeline memory operations
        }
    }
    
    // Demonstrate register allocation benefits
    static void register_allocation_demo(int* restrict a, 
                                       int* restrict b, 
                                       int* restrict c,
                                       size_t n) {
        // With restrict, compiler can keep these in registers:
        int temp1, temp2, temp3;
        
        for (size_t i = 0; i < n; ++i) {
            temp1 = a[i] * 2;    // Can keep in register
            temp2 = b[i] + 3;    // Can keep in register  
            temp3 = temp1 + temp2; // Pure register operation
            c[i] = temp3;
            
            // Next iteration can reuse register assignments
        }
    }
};

// Example 3: Cache optimization through aliasing analysis
class CacheOptimizationDemo {
public:
    struct Matrix {
        float* data;
        size_t rows, cols;
        
        Matrix(size_t r, size_t c) : rows(r), cols(c) {
            data = new float[rows * cols];
        }
        
        ~Matrix() { delete[] data; }
        
        float& operator()(size_t r, size_t c) {
            return data[r * cols + c];
        }
    };
    
    // Cache-unfriendly matrix multiply (potential aliasing)
    static void cache_unfriendly_multiply(Matrix& C, const Matrix& A, const Matrix& B) {
        for (size_t i = 0; i < C.rows; ++i) {
            for (size_t j = 0; j < C.cols; ++j) {
                float sum = 0;
                for (size_t k = 0; k < A.cols; ++k) {
                    sum += A.data[i * A.cols + k] * B.data[k * B.cols + j];
                    // Compiler must assume A, B, C might alias
                    // Cannot optimize memory access patterns
                }
                C(i, j) = sum;
            }
        }
    }
    
    // Cache-friendly with restrict (guaranteed no aliasing)
    static void cache_friendly_multiply(float* restrict C_data,
                                      const float* restrict A_data,
                                      const float* restrict B_data,
                                      size_t rows, size_t cols, size_t inner) {
        // Block size optimized for cache
        constexpr size_t BLOCK_SIZE = 64;
        
        for (size_t i = 0; i < rows; i += BLOCK_SIZE) {
            for (size_t j = 0; j < cols; j += BLOCK_SIZE) {
                for (size_t k = 0; k < inner; k += BLOCK_SIZE) {
                    
                    // Process block with guaranteed no aliasing
                    size_t i_end = std::min(i + BLOCK_SIZE, rows);
                    size_t j_end = std::min(j + BLOCK_SIZE, cols);
                    size_t k_end = std::min(k + BLOCK_SIZE, inner);
                    
                    for (size_t ii = i; ii < i_end; ++ii) {
                        for (size_t jj = j; jj < j_end; ++jj) {
                            float sum = 0;
                            for (size_t kk = k; kk < k_end; ++kk) {
                                sum += A_data[ii * inner + kk] * B_data[kk * cols + jj];
                            }
                            C_data[ii * cols + jj] += sum;
                            
                            // Compiler can:
                            // - Keep matrix blocks in cache
                            // - Prefetch next blocks
                            // - Vectorize inner computations
                        }
                    }
                }
            }
        }
    }
};

// Example 4: Performance measurement framework
class PerformanceMeasurement {
public:
    template<typename Func>
    static double measure_time(Func&& func, int iterations = 1000) {
        auto start = std::chrono::high_resolution_clock::now();
        
        for (int i = 0; i < iterations; ++i) {
            func();
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
        
        return duration.count() / static_cast<double>(iterations);
    }
    
    static void benchmark_aliasing_impact() {
        const size_t N = 100000;
        std::vector<float> a(N), b(N), result(N);
        
        // Initialize with random data
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_real_distribution<float> dis(0.0f, 1.0f);
        
        for (size_t i = 0; i < N; ++i) {
            a[i] = dis(gen);
            b[i] = dis(gen);
        }
        
        // Benchmark scalar version
        double scalar_time = measure_time([&]() {
            VectorizationDemo::scalar_processing(result.data(), a.data(), b.data(), N);
        });
        
        // Benchmark vector version with restrict
        double vector_time = measure_time([&]() {
            VectorizationDemo::vector_processing(result.data(), a.data(), b.data(), N);
        });
        
        // Benchmark manual vector version
        double manual_time = measure_time([&]() {
            VectorizationDemo::manual_vector_processing(result.data(), a.data(), b.data(), N);
        });
        
        std::cout << "Performance Comparison (nanoseconds per iteration):\\n";
        std::cout << "Scalar (potential aliasing): " << scalar_time << " ns\\n";
        std::cout << "Vector (restrict): " << vector_time << " ns\\n";
        std::cout << "Manual vectorization: " << manual_time << " ns\\n";
        std::cout << "Speedup (restrict): " << scalar_time / vector_time << "x\\n";
        std::cout << "Speedup (manual): " << scalar_time / manual_time << "x\\n";
    }
    
    static void benchmark_loop_optimization() {
        const size_t N = 50000;
        std::vector<int> data1(N), data2(N), result(N);
        
        double conservative_time = measure_time([&]() {
            LoopOptimizationDemo::conservative_loop(
                data1.data(), data2.data(), result.data(), N);
        });
        
        double optimized_time = measure_time([&]() {
            LoopOptimizationDemo::optimized_loop(
                data1.data(), data2.data(), result.data(), N);
        });
        
        std::cout << "\\nLoop Optimization Comparison:\\n";
        std::cout << "Conservative: " << conservative_time << " ns\\n";
        std::cout << "Optimized (restrict): " << optimized_time << " ns\\n";
        std::cout << "Speedup: " << conservative_time / optimized_time << "x\\n";
    }
};

// Example 5: Compiler optimization flags impact
void demonstrate_optimization_flags() {
    std::cout << "\\n=== Compiler Optimization Flags ===\\n";
    
    #ifdef __OPTIMIZE__
    std::cout << "Optimizations enabled\\n";
    #else
    std::cout << "Debug mode - limited optimizations\\n";
    #endif
    
    #ifdef __FAST_MATH__
    std::cout << "Fast math enabled - aggressive floating point optimizations\\n";
    #endif
    
    #ifdef __STRICT_ALIASING__
    std::cout << "Strict aliasing enabled - type-based optimization active\\n";
    #else
    std::cout << "Strict aliasing disabled - conservative approach\\n";
    #endif
    
    // Recommend compilation flags for maximum optimization:
    std::cout << "\\nRecommended flags for aliasing optimization:\\n";
    std::cout << "-O3 -ffast-math -fstrict-aliasing -march=native\\n";
    std::cout << "-funroll-loops -ftree-vectorize -fassociative-math\\n";
}

// Complete demonstration
void run_all_demonstrations() {
    std::cout << "=== Memory Aliasing Optimization Impact ===\\n\\n";
    
    PerformanceMeasurement::benchmark_aliasing_impact();
    PerformanceMeasurement::benchmark_loop_optimization();
    demonstrate_optimization_flags();
    
    std::cout << "\\n=== Key Takeaways ===\\n";
    std::cout << "1. restrict keyword enables aggressive vectorization\\n";
    std::cout << "2. Type-based aliasing analysis is crucial for optimization\\n";
    std::cout << "3. Loop unrolling and register allocation benefit from no-alias guarantees\\n";
    std::cout << "4. Cache optimization requires careful memory access patterns\\n";
    std::cout << "5. Profile-guided optimization can help with dynamic cases\\n";
}`
  };

  const scenarios = [
    {
      title: 'Compiler Analysis',
      code: codeExamples.compiler_analysis,
      explanation: state.language === 'en' 
        ? 'Understanding how compilers analyze potential memory aliasing for optimization.'
        : 'Entendiendo cómo los compiladores analizan el posible aliasing de memoria para optimización.'
    },
    {
      title: 'restrict Keyword',
      code: codeExamples.restrict_keyword,
      explanation: state.language === 'en'
        ? 'Using the restrict keyword to guarantee no aliasing and enable optimizations.'
        : 'Usando la palabra clave restrict para garantizar no aliasing y habilitar optimizaciones.'
    },
    {
      title: 'Disambiguation Techniques',
      code: codeExamples.disambiguation,
      explanation: state.language === 'en'
        ? 'Advanced techniques for resolving memory aliasing uncertainty.'
        : 'Técnicas avanzadas para resolver incertidumbre de aliasing de memoria.'
    },
    {
      title: 'Optimization Impact',
      code: codeExamples.optimization_impact,
      explanation: state.language === 'en'
        ? 'Measuring the performance impact of aliasing analysis on optimization.'
        : 'Midiendo el impacto de rendimiento del análisis de aliasing en la optimización.'
    }
  ];

  const toggleRestrict = () => {
    setLessonState(prev => ({
      ...prev,
      restrictUsage: {
        ...prev.restrictUsage,
        enabled: !prev.restrictUsage.enabled,
        conflicts: prev.restrictUsage.enabled ? 2 : 0
      },
      performanceGain: prev.restrictUsage.enabled ? 25 : 75
    }));
  };

  const changeOptimizationLevel = () => {
    setLessonState(prev => ({
      ...prev,
      optimizationLevel: (prev.optimizationLevel + 1) % 4,
      performanceGain: Math.min(95, prev.performanceGain + 15)
    }));
  };

  const nextScenario = () => {
    const nextIndex = (lessonState.currentScenario + 1) % scenarios.length;
    setLessonState(prev => ({
      ...prev,
      currentScenario: nextIndex,
      demonstrationType: ['compiler_analysis', 'restrict_keyword', 'disambiguation', 'optimization_impact'][nextIndex] as MemoryAliasingState['demonstrationType']
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Understand compiler aliasing analysis techniques' : 'Entender técnicas de análisis de aliasing del compilador',
    state.language === 'en' ? 'Master the restrict keyword for performance' : 'Dominar la palabra clave restrict para rendimiento',
    state.language === 'en' ? 'Learn memory disambiguation strategies' : 'Aprender estrategias de desambiguación de memoria',
    state.language === 'en' ? 'Measure optimization impact of aliasing rules' : 'Medir impacto de optimización de reglas de aliasing',
    state.language === 'en' ? 'Implement aliasing-aware high-performance code' : 'Implementar código de alto rendimiento consciente de aliasing'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Memory Aliasing Analysis" : "Análisis de Aliasing de Memoria"}
      subtitle={state.language === 'en' 
        ? "Master compiler aliasing analysis and disambiguation for maximum performance" 
        : "Domina el análisis de aliasing del compilador y desambiguación para máximo rendimiento"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🔍 Memory Aliasing Analysis' : '🔍 Análisis de Aliasing de Memoria'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'Memory aliasing analysis is crucial for compiler optimizations. Understanding how compilers determine potential memory overlap enables you to write code that can be optimized aggressively while maintaining correctness.'
            : 'El análisis de aliasing de memoria es crucial para las optimizaciones del compilador. Entender cómo los compiladores determinan la superposición potencial de memoria te permite escribir código que puede ser optimizado agresivamente mientras mantiene la corrección.'}
        </p>

        <div style={{ height: '500px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <MemoryAliasingVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive Aliasing Demo' : '🧪 Demo Interactivo de Aliasing'}
        </SectionTitle>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button onClick={nextScenario}>
            {state.language === 'en' ? 'Next Scenario' : 'Siguiente Escenario'} ({lessonState.currentScenario + 1}/4)
          </Button>
          
          <Button onClick={toggleRestrict}
                  style={{ background: lessonState.restrictUsage.enabled ? '#2ed573' : '#ff4757' }}>
            {lessonState.restrictUsage.enabled 
              ? (state.language === 'en' ? 'restrict: ON' : 'restrict: ON')
              : (state.language === 'en' ? 'restrict: OFF' : 'restrict: OFF')
            }
          </Button>
          
          <Button onClick={changeOptimizationLevel}>
            {state.language === 'en' ? 'Optimization' : 'Optimización'}: -O{lessonState.optimizationLevel}
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
            <h4>{state.language === 'en' ? 'Optimization Impact' : 'Impacto de Optimización'}</h4>
            
            <div style={{ 
              padding: '15px', 
              background: 'rgba(46, 213, 115, 0.1)', 
              border: '1px solid #2ed573', 
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <h5>{state.language === 'en' ? 'Performance Gain' : 'Ganancia de Rendimiento'}</h5>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                background: '#333', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${lessonState.performanceGain}%`, 
                  height: '100%', 
                  background: '#2ed573',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <p>{lessonState.performanceGain}% improvement</p>
            </div>

            <h4>{state.language === 'en' ? 'Key Concepts' : 'Conceptos Clave'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Type-based aliasing rules' : 'Reglas de aliasing basadas en tipos'}</li>
              <li>{state.language === 'en' ? 'restrict keyword benefits' : 'Beneficios de la palabra clave restrict'}</li>
              <li>{state.language === 'en' ? 'Compiler optimization opportunities' : 'Oportunidades de optimización del compilador'}</li>
              <li>{state.language === 'en' ? 'Memory disambiguation techniques' : 'Técnicas de desambiguación de memoria'}</li>
              <li>{state.language === 'en' ? 'Performance measurement methods' : 'Métodos de medición de rendimiento'}</li>
            </ul>

            <h4 style={{ marginTop: '20px' }}>{state.language === 'en' ? 'Current Settings' : 'Configuración Actual'}</h4>
            <p><strong>{state.language === 'en' ? 'restrict:' : 'restrict:'}</strong> {lessonState.restrictUsage.enabled ? 'Enabled' : 'Disabled'}</p>
            <p><strong>{state.language === 'en' ? 'Optimization:' : 'Optimización:'}</strong> -O{lessonState.optimizationLevel}</p>
            <p><strong>{state.language === 'en' ? 'Performance:' : 'Rendimiento:'}</strong> +{lessonState.performanceGain}%</p>
          </div>
        </div>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '⚡ Optimization Strategies' : '⚡ Estrategias de Optimización'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '15px', background: 'rgba(46, 213, 115, 0.1)', border: '1px solid #2ed573', borderRadius: '8px' }}>
            <h4 style={{ color: '#2ed573' }}>{state.language === 'en' ? '🎯 restrict Keyword' : '🎯 Palabra Clave restrict'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Guarantees no pointer aliasing' : 'Garantiza no aliasing de punteros'}</li>
              <li>{state.language === 'en' ? 'Enables aggressive vectorization' : 'Habilita vectorización agresiva'}</li>
              <li>{state.language === 'en' ? 'Improves register allocation' : 'Mejora asignación de registros'}</li>
              <li>{state.language === 'en' ? 'Allows loop unrolling' : 'Permite desenrollado de bucles'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid #00d4ff', borderRadius: '8px' }}>
            <h4 style={{ color: '#00d4ff' }}>{state.language === 'en' ? '🔬 Type-based Analysis' : '🔬 Análisis Basado en Tipos'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Different types cannot alias' : 'Diferentes tipos no pueden hacer aliasing'}</li>
              <li>{state.language === 'en' ? 'char* can alias any type' : 'char* puede hacer aliasing con cualquier tipo'}</li>
              <li>{state.language === 'en' ? 'void* is universal alias' : 'void* es alias universal'}</li>
              <li>{state.language === 'en' ? 'Union members can alias' : 'Miembros de union pueden hacer aliasing'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(255, 164, 0, 0.1)', border: '1px solid #ffa500', borderRadius: '8px' }}>
            <h4 style={{ color: '#ffa500' }}>{state.language === 'en' ? '🚀 Compiler Flags' : '🚀 Flags del Compilador'}</h4>
            <ul>
              <li>-fstrict-aliasing</li>
              <li>-O3 {state.language === 'en' ? '(maximum optimization)' : '(optimización máxima)'}</li>
              <li>-march=native</li>
              <li>-funroll-loops</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid #ff4757', borderRadius: '8px' }}>
            <h4 style={{ color: '#ff4757' }}>{state.language === 'en' ? '⚠️ Common Pitfalls' : '⚠️ Errores Comunes'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Violating restrict contracts' : 'Violar contratos de restrict'}</li>
              <li>{state.language === 'en' ? 'Assuming no padding in structs' : 'Asumir sin padding en structs'}</li>
              <li>{state.language === 'en' ? 'Ignoring alignment requirements' : 'Ignorar requisitos de alineación'}</li>
              <li>{state.language === 'en' ? 'Platform-specific assumptions' : 'Suposiciones específicas de plataforma'}</li>
            </ul>
          </div>
        </div>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`Memory aliasing analysis lesson. Current focus: ${lessonState.demonstrationType}, Performance gain: ${lessonState.performanceGain}%`}
      />
    </LessonLayout>
  );
};

export default Lesson67_MemoryAliasing;