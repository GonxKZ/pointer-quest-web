import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface SharedPtrArrayState {
  arrays: { 
    id: number; 
    name: string; 
    size: number; 
    type: 'T[]' | 'regular' | 'vector'; 
    useCount: number; 
    elementType: 'int' | 'string' | 'custom';
    elements: any[];
  }[];
  selectedArray: number | null;
  demonstration: 'array_vs_regular' | 'specialization_features' | 'alternatives' | 'performance';
  showElements: boolean;
  currentOperation: 'none' | 'access' | 'bounds_check' | 'destruction';
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e0e6ed;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
`;

const Header = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-bottom: 2px solid #00d4ff;
`;

const Title = styled.h1`
  margin: 0;
  color: #00d4ff;
  font-size: 1.8rem;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0 0;
  text-align: center;
  opacity: 0.8;
  font-size: 1.1rem;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  gap: 1rem;
  padding: 1rem;
`;

const LeftPanel = styled.div`
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VisualizationArea = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  height: 400px;
`;

const ControlsArea = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
`;

const TheorySection = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
  margin-top: 1rem;
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #00d4ff;
  overflow-x: auto;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.7rem 1.2rem;
  margin: 0.3rem;
  border: none;
  border-radius: 6px;
  font-family: 'Cascadia Code', monospace;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: linear-gradient(135deg, #ff4757, #ff3742);
          color: white;
          &:hover { background: linear-gradient(135deg, #ff3742, #ff2f3a); }
        `;
      case 'secondary':
        return `
          background: linear-gradient(135deg, #57606f, #4f5966);
          color: white;
          &:hover { background: linear-gradient(135deg, #4f5966, #47505e); }
        `;
      default:
        return `
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          color: #001a2e;
          &:hover { background: linear-gradient(135deg, #0099cc, #007399); }
        `;
    }
  }}
`;

const StatusDisplay = styled.div<{ $type: 'info' | 'warning' | 'success' | 'error' }>`
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid;
  
  ${props => {
    switch (props.$type) {
      case 'error':
        return `
          background: rgba(255, 71, 87, 0.1);
          border-color: #ff4757;
          color: #ff6b7a;
        `;
      case 'warning':
        return `
          background: rgba(255, 165, 0, 0.1);
          border-color: #ffa500;
          color: #ffb84d;
        `;
      case 'success':
        return `
          background: rgba(46, 213, 115, 0.1);
          border-color: #2ed573;
          color: #4ade80;
        `;
      default:
        return `
          background: rgba(0, 212, 255, 0.1);
          border-color: #00d4ff;
          color: #00d4ff;
        `;
    }
  }}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const InfoCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
`;

const Highlight = styled.span<{ $color?: string }>`
  color: ${props => props.$color || '#00d4ff'};
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.5rem;
  margin: 0.5rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  color: #e0e6ed;
  font-family: 'Cascadia Code', monospace;
  width: 80px;
`;

function SharedPtrArrayVisualization({ state }: { state: SharedPtrArrayState }) {
  const { arrays, selectedArray, demonstration, showElements, currentOperation } = state;

  const getTypeColor = (type: string) => {
    const colors = {
      'T[]': '#2ed573',
      'regular': '#ffa500',
      'vector': '#00d4ff'
    };
    return colors[type as keyof typeof colors] || '#57606f';
  };

  const renderArrayVsRegular = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#00d4ff"
        anchorX="center"
      >
        shared_ptr&lt;T[]&gt; vs shared_ptr&lt;T&gt;
      </Text>
      
      {/* Comparison */}
      <group position={[0, 1.5, 0]}>
        {/* Array specialization */}
        <group position={[-2.5, 0, 0]}>
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.15}
            color="#2ed573"
            anchorX="center"
          >
            shared_ptr&lt;T[]&gt;
          </Text>
          
          <Box args={[2, 1.2, 0.3]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.7} />
          </Box>
          
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            ✅ operator[]
          </Text>
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            ✅ delete[] deleter
          </Text>
          <Text
            position={[0, -0.1, 0]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            ❌ operator*
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            ❌ operator-&gt;
          </Text>
        </group>
        
        {/* Regular shared_ptr */}
        <group position={[2.5, 0, 0]}>
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.15}
            color="#ffa500"
            anchorX="center"
          >
            shared_ptr&lt;T&gt;
          </Text>
          
          <Box args={[2, 1.2, 0.3]}>
            <meshStandardMaterial color="#ffa500" transparent opacity={0.7} />
          </Box>
          
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            ✅ operator*
          </Text>
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            ✅ operator-&gt;
          </Text>
          <Text
            position={[0, -0.1, 0]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            ❌ operator[]
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            ⚠️ delete deleter
          </Text>
        </group>
      </group>
      
      {/* Arrays visualization */}
      <group position={[0, 0, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="#00d4ff"
          anchorX="center"
        >
          Array Contents
        </Text>
        
        {arrays.map((array, arrayIndex) => (
          <group key={`array-${array.id}`} position={[arrayIndex * 3 - arrays.length * 1.5, 0, 0]}>
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.1}
              color={getTypeColor(array.type)}
              anchorX="center"
            >
              {array.name} [{array.size}]
            </Text>
            
            {/* Array elements */}
            <group position={[0, -0.3, 0]}>
              {Array.from({ length: Math.min(array.size, 8) }, (_, i) => (
                <group key={`elem-${i}`} position={[i * 0.3 - array.size * 0.15, 0, 0]}>
                  <Box args={[0.25, 0.4, 0.2]}>
                    <meshStandardMaterial 
                      color={selectedArray === arrayIndex && currentOperation === 'access' && i === 0 ? '#ff6b7a' : getTypeColor(array.type)}
                      transparent 
                      opacity={0.7} 
                    />
                  </Box>
                  {showElements && array.elements[i] !== undefined && (
                    <Text
                      position={[0, 0, 0.15]}
                      fontSize={0.06}
                      color="white"
                      anchorX="center"
                    >
                      {array.elements[i].toString().substring(0, 3)}
                    </Text>
                  )}
                  <Text
                    position={[0, -0.25, 0]}
                    fontSize={0.05}
                    color="#888"
                    anchorX="center"
                  >
                    [{i}]
                  </Text>
                </group>
              ))}
              
              {array.size > 8 && (
                <Text
                  position={[8 * 0.3 - array.size * 0.15, 0, 0]}
                  fontSize={0.08}
                  color="#888"
                  anchorX="center"
                >
                  ...
                </Text>
              )}
            </group>
            
            <Text
              position={[0, -0.8, 0]}
              fontSize={0.08}
              color="#888"
              anchorX="center"
            >
              use_count: {array.useCount}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );

  const renderSpecializationFeatures = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#2ed573"
        anchorX="center"
      >
        Array Specialization Features
      </Text>
      
      {/* Feature comparison */}
      <group position={[0, 1, 0]}>
        {[
          { feature: 'Default Deleter', regular: 'delete', array: 'delete[]', color: '#2ed573' },
          { feature: 'Element Access', regular: '(*ptr)', array: 'ptr[i]', color: '#00d4ff' },
          { feature: 'Pointer Arithmetic', regular: 'ptr.get() + i', array: '&ptr[i]', color: '#ffa500' },
          { feature: 'Bounds Checking', regular: 'None', array: 'None (but consistent)', color: '#ff6b7a' }
        ].map((item, index) => (
          <group key={`feature-${index}`} position={[0, 1.2 - index * 0.4, 0]}>
            <Box args={[5, 0.3, 0.2]}>
              <meshStandardMaterial color={item.color} transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0.05, 0.15]}
              fontSize={0.09}
              color="white"
              anchorX="center"
            >
              {item.feature}: {item.regular} → {item.array}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Code example visualization */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#00d4ff"
          anchorX="center"
        >
          Usage Pattern
        </Text>
        
        <group position={[0, 0, 0]}>
          <Box args={[4.5, 0.6, 0.2]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.5} />
          </Box>
          <Text
            position={[0, 0, 0.15]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            shared_ptr&lt;int[]&gt; arr(new int[10]);
          </Text>
          <Text
            position={[0, -0.15, 0.15]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            arr[5] = 42;  // Valid operation
          </Text>
        </group>
      </group>
    </group>
  );

  const renderAlternatives = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ffa500"
        anchorX="center"
      >
        Modern Alternatives
      </Text>
      
      {/* Alternative options */}
      <group position={[0, 1, 0]}>
        {[
          { name: 'std::vector', reason: 'Dynamic size, bounds checking', score: 95, color: '#2ed573' },
          { name: 'std::array', reason: 'Fixed size, stack allocation', score: 85, color: '#00d4ff' },
          { name: 'std::shared_ptr<T[]>', reason: 'Shared ownership needed', score: 70, color: '#ffa500' },
          { name: 'std::unique_ptr<T[]>', reason: 'Exclusive ownership', score: 80, color: '#9b59b6' }
        ].map((alt, index) => (
          <group key={`alt-${index}`} position={[0, 1.5 - index * 0.4, 0]}>
            <Box args={[5.5, 0.35, 0.2]}>
              <meshStandardMaterial color={alt.color} transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0.05, 0.15]}
              fontSize={0.09}
              color="white"
              anchorX="center"
            >
              {alt.name}: {alt.reason} (Score: {alt.score}/100)
            </Text>
          </group>
        ))}
      </group>
      
      {/* Recommendation */}
      <group position={[0, -1, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.15}
          color="#2ed573"
          anchorX="center"
        >
          ✅ Prefer std::vector&lt;T&gt; for most use cases
        </Text>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.12}
          color="#888"
          anchorX="center"
        >
          Use shared_ptr&lt;T[]&gt; only when shared ownership is essential
        </Text>
      </group>
    </group>
  );

  const renderPerformance = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ff6b7a"
        anchorX="center"
      >
        Performance Characteristics
      </Text>
      
      {/* Performance metrics */}
      <group position={[0, 1, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Memory & Performance Overhead
        </Text>
        
        {/* Comparison bars */}
        {[
          { name: 'std::vector<int>', time: 1.0, memory: 1.0, color: '#2ed573' },
          { name: 'std::array<int, N>', time: 0.9, memory: 0.8, color: '#00d4ff' },
          { name: 'shared_ptr<int[]>', time: 1.2, memory: 1.4, color: '#ffa500' },
          { name: 'int*', time: 0.8, memory: 1.0, color: '#ff6b7a' }
        ].map((perf, index) => (
          <group key={`perf-${index}`} position={[0, 0.4 - index * 0.3, 0]}>
            {/* Time bar */}
            <group position={[-1.5, 0, 0]}>
              <Box args={[perf.time * 2, 0.2, 0.15]}>
                <meshStandardMaterial color={perf.color} transparent opacity={0.7} />
              </Box>
              <Text
                position={[0, -0.15, 0]}
                fontSize={0.06}
                color="#888"
                anchorX="center"
              >
                Time: {perf.time.toFixed(1)}x
              </Text>
            </group>
            
            {/* Memory bar */}
            <group position={[1.5, 0, 0]}>
              <Box args={[perf.memory * 2, 0.2, 0.15]}>
                <meshStandardMaterial color={perf.color} transparent opacity={0.7} />
              </Box>
              <Text
                position={[0, -0.15, 0]}
                fontSize={0.06}
                color="#888"
                anchorX="center"
              >
                Memory: {perf.memory.toFixed(1)}x
              </Text>
            </group>
            
            {/* Name */}
            <Text
              position={[0, 0, 0]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {perf.name}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Legend */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[-1.5, 0, 0]}
          fontSize={0.1}
          color="#00d4ff"
          anchorX="center"
        >
          Access Time
        </Text>
        <Text
          position={[1.5, 0, 0]}
          fontSize={0.1}
          color="#ffa500"
          anchorX="center"
        >
          Memory Overhead
        </Text>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {demonstration === 'array_vs_regular' && renderArrayVsRegular()}
      {demonstration === 'specialization_features' && renderSpecializationFeatures()}
      {demonstration === 'alternatives' && renderAlternatives()}
      {demonstration === 'performance' && renderPerformance()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson34_SharedPtrArray: React.FC = () => {
  const [state, setState] = useState<SharedPtrArrayState>({
    arrays: [
      { 
        id: 1, 
        name: 'int_array', 
        size: 10, 
        type: 'T[]', 
        useCount: 1, 
        elementType: 'int',
        elements: [42, 17, 8, 23, 56, 91, 14, 37, 68, 29]
      }
    ],
    selectedArray: 0,
    demonstration: 'array_vs_regular',
    showElements: true,
    currentOperation: 'none'
  });

  const addArray = (type: SharedPtrArrayState['arrays'][0]['type'], size: number) => {
    const newArray = {
      id: Date.now(),
      name: `array_${state.arrays.length}`,
      size,
      type,
      useCount: 1,
      elementType: 'int' as const,
      elements: Array.from({ length: size }, (_, i) => Math.floor(Math.random() * 100))
    };
    
    setState(prev => ({
      ...prev,
      arrays: [...prev.arrays, newArray]
    }));
  };

  const removeArray = (index: number) => {
    setState(prev => ({
      ...prev,
      arrays: prev.arrays.filter((_, i) => i !== index),
      selectedArray: prev.selectedArray === index ? null : 
                     prev.selectedArray && prev.selectedArray > index ? prev.selectedArray - 1 : prev.selectedArray
    }));
  };

  const simulateOperation = (operation: SharedPtrArrayState['currentOperation']) => {
    setState(prev => ({
      ...prev,
      currentOperation: operation
    }));
    
    // Reset operation after animation
    setTimeout(() => {
      setState(prev => ({ ...prev, currentOperation: 'none' }));
    }, 2000);
  };

  const getCurrentExample = () => {
    const { demonstration } = state;
    
    if (demonstration === 'array_vs_regular') {
      return `// Array specialization (C++17)
std::shared_ptr<int[]> arr_ptr(new int[10]);
arr_ptr[0] = 42;           // ✅ Valid - operator[] available
arr_ptr[9] = 100;          // ✅ Valid - but no bounds checking
// arr_ptr.get()[5] = 50;  // Alternative access

// Regular shared_ptr (problematic for arrays)
std::shared_ptr<int> bad_ptr(new int[10]);  // 🚨 WRONG!
// bad_ptr[0] = 42;        // ❌ Error - no operator[]
// delete called instead of delete[] - UB!

// Correct usage:
std::shared_ptr<int> single_ptr = std::make_shared<int>(42);
*single_ptr = 100;         // ✅ Valid - single object
single_ptr.get();          // ✅ Returns int*`;
    }
    
    if (demonstration === 'specialization_features') {
      return `// shared_ptr<T[]> specialization features
std::shared_ptr<int[]> arr(new int[100]);

// Available operations:
arr[50] = 42;              // ✅ operator[] for element access
arr.get();                 // ✅ Returns T* (raw array pointer)
arr.get() + 10;            // ✅ Pointer arithmetic
arr.use_count();           // ✅ Reference counting
arr.reset();               // ✅ Release ownership

// NOT available (removed for arrays):
// *arr;                   // ❌ No operator* 
// arr->method();          // ❌ No operator->
// arr.get()->method();    // ❌ Arrays don't have methods

// Automatic delete[] called when use_count reaches 0
// No need for custom deleter like regular shared_ptr`;
    }
    
    if (demonstration === 'alternatives') {
      return `// Modern alternatives comparison:

// 1. std::vector<T> - Usually the best choice
std::vector<int> vec(10, 0);
vec[5] = 42;               // Bounds checking in debug mode
vec.at(5) = 42;            // Always bounds checking  
vec.push_back(100);        // Dynamic resizing
vec.size();                // Size information
// ✅ Exception safe, RAII, rich interface

// 2. std::array<T, N> - Fixed size, stack allocated  
std::array<int, 10> arr;
arr[5] = 42;               // Same interface as vector
arr.fill(0);               // Specialized operations
constexpr auto size = arr.size(); // Compile-time size
// ✅ Zero overhead, constexpr support

// 3. shared_ptr<T[]> - When shared ownership needed
auto shared_arr = std::shared_ptr<int[]>(new int[10]);
// shared_arr can be copied, shared between objects
// ❌ No size information, no bounds checking, allocation overhead

// 4. unique_ptr<T[]> - Exclusive ownership
auto unique_arr = std::make_unique<int[]>(10);
unique_arr[5] = 42;
// ✅ Exclusive ownership, automatic cleanup, move semantics`;
    }
    
    return `// Performance characteristics:

// Memory overhead comparison (for 1000 int elements):
sizeof(int) * 1000;                    // 4000 bytes (raw data)

// std::vector<int>:
// - Data: 4000 bytes
// - Vector object: ~24 bytes (size, capacity, pointer)
// - Total: ~4024 bytes + possible over-allocation

// std::shared_ptr<int[]>:  
// - Data: 4000 bytes
// - shared_ptr object: 16 bytes (2 pointers)
// - Control block: ~64 bytes (counters, deleter, etc.)
// - Total: ~4080 bytes

// Access performance:
// vector[i]     - Direct memory access, potential bounds check
// arr_ptr[i]    - Direct memory access, no bounds check  
// raw_ptr[i]    - Direct memory access, no safety

// Recommendations:
// - Use std::vector<T> for dynamic arrays (90% of cases)
// - Use std::array<T,N> for fixed-size arrays
// - Use shared_ptr<T[]> only when shared ownership is essential
// - Avoid raw arrays in modern C++`;
  };

  return (
    <Container>
      <Header>
        <Title>📊 shared_ptr&lt;T[]&gt; Arrays</Title>
        <Subtitle>Array specialization vs alternatives in modern C++</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Array Specialization Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>shared_ptr&lt;T[]&gt; (C++17)</strong><br/>
            Array specialization of shared_ptr with automatic delete[] and operator[] access.
            Usually std::vector is a better choice for most use cases.
          </StatusDisplay>

          <h4>🎯 Key Differences</h4>
          <Grid>
            <InfoCard>
              <h4>Array Specialization</h4>
              <CodeBlock>{`// C++17 array specialization
std::shared_ptr<int[]> arr(new int[100]);

// Available:
arr[50] = 42;         // operator[]
arr.get();            // Raw pointer access
arr.use_count();      // Reference counting
arr.reset();          // Release ownership

// NOT available:
// *arr;              // No operator*
// arr->method();     // No operator->

// Automatic delete[] when destroyed
// No custom deleter needed`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Regular shared_ptr Issues</h4>
              <CodeBlock>{`// WRONG - Don't do this!
std::shared_ptr<int> bad(new int[10]);
// Problems:
// 1. No operator[] access
// 2. delete called instead of delete[]
// 3. Undefined behavior on destruction

// Workaround (pre-C++17):
std::shared_ptr<int> old_way(
    new int[10], 
    [](int* p) { delete[] p; }  // Custom deleter
);
// Works but verbose`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Modern Alternatives</h4>
              <CodeBlock>{`// Preferred: std::vector
std::vector<int> vec(100);
vec[50] = 42;         // Bounds checking available
vec.at(50) = 42;      // Throws on out-of-bounds  
vec.push_back(43);    // Dynamic resizing
auto size = vec.size(); // Size information

// Fixed size: std::array
std::array<int, 100> arr;
arr[50] = 42;         // Same interface as vector
constexpr auto size = arr.size(); // Compile-time

// Exclusive ownership: unique_ptr
auto uptr = std::make_unique<int[]>(100);
uptr[50] = 42;        // operator[] available`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>When to Use shared_ptr&lt;T[]&gt;</h4>
              <CodeBlock>{`// Use when you need:
// 1. Shared ownership of array
// 2. C-style array interface
// 3. Integration with C APIs

// Example: Shared image buffer
class ImageBuffer {
    std::shared_ptr<uint8_t[]> pixels_;
    int width_, height_;
    
public:
    ImageBuffer(int w, int h) 
        : pixels_(new uint8_t[w * h * 3])
        , width_(w), height_(h) {}
        
    // Can be shared between objects
    std::shared_ptr<uint8_t[]> get_pixels() const {
        return pixels_;
    }
    
    // C API compatibility  
    uint8_t* raw_data() { return pixels_.get(); }
};`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Performance Considerations</h4>
          <CodeBlock>{`// Memory layout comparison (1000 ints):

// Raw array: 4000 bytes
int raw_array[1000];

// std::vector: ~4024 bytes + potential over-allocation  
std::vector<int> vec(1000);
// + Dynamic resizing capability
// + Bounds checking (debug mode)
// + Rich interface (size(), capacity(), etc.)

// shared_ptr<int[]>: ~4080 bytes
std::shared_ptr<int[]> shared_arr(new int[1000]);
// + Shared ownership
// + Automatic cleanup
// - No size information
// - Reference counting overhead
// - Potential cache misses (control block separate)

// Access performance (relative):
vec[i];           // 1.0x (baseline)
shared_arr[i];    // ~1.1x (slight indirection overhead)  
raw_array[i];     // 0.9x (direct access, no safety)

// Allocation performance:
// make_shared: Not available for arrays
// vector: Single allocation for initial capacity  
// shared_ptr<T[]>: Two allocations (object + control block)`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current State</h4>
            <StatusDisplay $type="success">
              <strong>Arrays Count:</strong> {state.arrays.length}<br/>
              <strong>Selected:</strong> {state.selectedArray !== null ? state.arrays[state.selectedArray]?.name || 'None' : 'None'}<br/>
              <strong>Operation:</strong> {state.currentOperation}
            </StatusDisplay>
            
            <h4>💻 Code Example</h4>
            <CodeBlock>{getCurrentExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <SharedPtrArrayVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Array Controls</h4>
            
            <div>
              <strong>Demonstration:</strong><br/>
              <Button 
                $variant={state.demonstration === 'array_vs_regular' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'array_vs_regular' }))}
              >
                Array vs Regular
              </Button>
              <Button 
                $variant={state.demonstration === 'specialization_features' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'specialization_features' }))}
              >
                Specialization Features
              </Button>
              <Button 
                $variant={state.demonstration === 'alternatives' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'alternatives' }))}
              >
                Modern Alternatives
              </Button>
              <Button 
                $variant={state.demonstration === 'performance' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'performance' }))}
              >
                Performance
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Add Arrays:</strong><br/>
              <Button onClick={() => addArray('T[]', 10)}>
                📊 shared_ptr&lt;T[]&gt; (10)
              </Button>
              <Button onClick={() => addArray('vector', 10)}>
                📈 vector (10)
              </Button>
              <Button onClick={() => addArray('T[]', 50)}>
                📊 Large Array (50)
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Operations:</strong><br/>
              <Button onClick={() => simulateOperation('access')}>
                🎯 Access Element
              </Button>
              <Button onClick={() => simulateOperation('bounds_check')}>
                🔍 Bounds Check
              </Button>
              <Button onClick={() => simulateOperation('destruction')}>
                💥 Destruction
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Array Management:</strong><br/>
              {state.arrays.map((array, index) => (
                <div key={array.id} style={{ marginTop: '0.5rem' }}>
                  <Button 
                    $variant={state.selectedArray === index ? 'primary' : 'secondary'}
                    onClick={() => setState(prev => ({ ...prev, selectedArray: index }))}
                  >
                    {array.name} [{array.size}] ({array.useCount})
                  </Button>
                  <Button onClick={() => removeArray(index)} $variant="danger">
                    🗑️
                  </Button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                $variant={state.showElements ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showElements: !prev.showElements }))}
              >
                {state.showElements ? 'Hide' : 'Show'} Elements
              </Button>
            </div>

            <StatusDisplay $type="warning">
              <strong>Best Practices:</strong><br/>
              • <Highlight $color="#2ed573">Prefer std::vector</Highlight> for most array needs<br/>
              • <Highlight $color="#00d4ff">Use std::array</Highlight> for fixed-size arrays<br/>
              • <Highlight $color="#ffa500">shared_ptr&lt;T[]&gt;</Highlight> only for shared ownership<br/>
              • <Highlight $color="#ff6b7a">Never</Highlight> use shared_ptr&lt;T&gt; for arrays<br/>
              • <Highlight>Consider unique_ptr&lt;T[]&gt;</Highlight> for exclusive ownership
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson34_SharedPtrArray;