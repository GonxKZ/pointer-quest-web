import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { THREE } from '../utils/three';

interface CustomDeleterState {
  sharedPtrs: { 
    id: number; 
    name: string; 
    useCount: number; 
    deleterType: 'default' | 'custom_function' | 'lambda' | 'functor'; 
    resourceType: 'heap' | 'file' | 'socket' | 'array' | 'custom';
    controlBlockSize: number;
    resourceSize: number;
  }[];
  selectedPtr: number | null;
  demonstration: 'basic_custom' | 'control_block' | 'deleter_types' | 'performance';
  showControlBlock: boolean;
  showMemoryUsage: boolean;
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

function CustomDeleterVisualization({ state }: { state: CustomDeleterState }) {
  const { sharedPtrs, selectedPtr, demonstration, showControlBlock, showMemoryUsage } = state;

  const getDeleterInfo = (deleterType: string) => {
    const info = {
      default: { name: 'delete', color: '#57606f', size: 0 },
      custom_function: { name: 'fclose', color: '#2ed573', size: 8 },
      lambda: { name: 'lambda', color: '#00d4ff', size: 16 },
      functor: { name: 'Functor', color: '#ffa500', size: 24 }
    };
    return info[deleterType as keyof typeof info] || info.default;
  };

  const getResourceColor = (resourceType: string) => {
    const colors = {
      heap: '#2ed573',
      file: '#ffa500',
      socket: '#ff6b7a',
      array: '#00d4ff',
      custom: '#9b59b6'
    };
    return colors[resourceType as keyof typeof colors] || '#57606f';
  };

  const renderBasicCustom = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#00d4ff"
        anchorX="center"
      >
        shared_ptr with Custom Deleters
      </Text>
      
      {/* shared_ptr instances */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#ffa500"
          anchorX="center"
        >
          shared_ptr Instances
        </Text>
        
        {sharedPtrs.map((ptr, index) => (
          <group key={`ptr-${ptr.id}`} position={[index * 2.5 - (sharedPtrs.length - 1) * 1.25, 0, 0]}>
            {/* shared_ptr visualization */}
            <Box args={[2, 0.8, 0.3]}>
              <meshStandardMaterial 
                color={selectedPtr === index ? '#ff6b7a' : '#00d4ff'}
                transparent 
                opacity={0.7} 
              />
            </Box>
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.1}
              color="white"
              anchorX="center"
            >
              {ptr.name}
            </Text>
            <Text
              position={[0, -0.5, 0]}
              fontSize={0.08}
              color="#888"
              anchorX="center"
            >
              use_count: {ptr.useCount}
            </Text>
            
            {/* Arrow to resource */}
            <mesh position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.1, 0.4]} />
              <meshStandardMaterial color="#00d4ff" />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Resources */}
      <group position={[0, 0, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#2ed573"
          anchorX="center"
        >
          Managed Resources
        </Text>
        
        {sharedPtrs.map((ptr, index) => (
          <group key={`resource-${ptr.id}`} position={[index * 2.5 - (sharedPtrs.length - 1) * 1.25, 0, 0]}>
            <Box args={[1.8, 0.6, 0.3]}>
              <meshStandardMaterial 
                color={getResourceColor(ptr.resourceType)}
                transparent 
                opacity={0.8} 
              />
            </Box>
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.09}
              color="white"
              anchorX="center"
            >
              {ptr.resourceType}
            </Text>
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.07}
              color="#888"
              anchorX="center"
            >
              {ptr.resourceSize} bytes
            </Text>
          </group>
        ))}
      </group>
      
      {/* Deleters */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#ffa500"
          anchorX="center"
        >
          Custom Deleters
        </Text>
        
        {sharedPtrs.map((ptr, index) => {
          const deleterInfo = getDeleterInfo(ptr.deleterType);
          return (
            <group key={`deleter-${ptr.id}`} position={[index * 2.5 - (sharedPtrs.length - 1) * 1.25, 0, 0]}>
              <Box args={[1.6, 0.5, 0.3]}>
                <meshStandardMaterial 
                  color={deleterInfo.color}
                  transparent 
                  opacity={0.7} 
                />
              </Box>
              <Text
                position={[0, 0, 0.2]}
                fontSize={0.08}
                color="white"
                anchorX="center"
              >
                {deleterInfo.name}
              </Text>
              <Text
                position={[0, -0.3, 0]}
                fontSize={0.06}
                color="#888"
                anchorX="center"
              >
                {deleterInfo.size > 0 ? `${deleterInfo.size} bytes` : 'no overhead'}
              </Text>
            </group>
          );
        })}
      </group>
    </group>
  );

  const renderControlBlock = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#2ed573"
        anchorX="center"
      >
        Control Block Structure
      </Text>
      
      {/* Control block components */}
      <group position={[0, 1, 0]}>
        {[
          { name: 'Reference Count', color: '#2ed573', size: 8 },
          { name: 'Weak Count', color: '#00d4ff', size: 8 },
          { name: 'Deleter Object', color: '#ffa500', size: 24 },
          { name: 'Allocator', color: '#9b59b6', size: 8 },
          { name: 'Virtual Table', color: '#ff6b7a', size: 8 }
        ].map((component, index) => (
          <group key={`component-${index}`} position={[0, 1.5 - index * 0.4, 0]}>
            <Box args={[3.5, 0.35, 0.2]}>
              <meshStandardMaterial color={component.color} transparent opacity={0.7} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.1}
              color="white"
              anchorX="center"
            >
              {component.name} ({component.size} bytes)
            </Text>
          </group>
        ))}
      </group>
      
      {/* Total size */}
      <group position={[0, -1, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Total Control Block: 56 bytes (typical)
        </Text>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.12}
          color="#888"
          anchorX="center"
        >
          + Deleter size + Allocator overhead
        </Text>
      </group>
    </group>
  );

  const renderDeleterTypes = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ffa500"
        anchorX="center"
      >
        Deleter Type Comparison
      </Text>
      
      {/* Deleter types */}
      <group position={[0, 1, 0]}>
        {[
          { type: 'Function Pointer', example: 'fclose', overhead: '0 bytes', color: '#2ed573' },
          { type: 'Lambda (no capture)', example: '[](T* p) { delete p; }', overhead: '0 bytes', color: '#00d4ff' },
          { type: 'Lambda (with capture)', example: '[file](T* p) { close(file); }', overhead: '8-24 bytes', color: '#ffa500' },
          { type: 'Function Object', example: 'CustomDeleter{}', overhead: '1-32+ bytes', color: '#ff6b7a' }
        ].map((deleter, index) => (
          <group key={`deltype-${index}`} position={[0, 1.5 - index * 0.45, 0]}>
            <Box args={[5, 0.4, 0.2]}>
              <meshStandardMaterial color={deleter.color} transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0.05, 0.15]}
              fontSize={0.09}
              color="white"
              anchorX="center"
            >
              {deleter.type}: {deleter.example}
            </Text>
            <Text
              position={[0, -0.1, 0.15]}
              fontSize={0.07}
              color="#888"
              anchorX="center"
            >
              Memory overhead: {deleter.overhead}
            </Text>
          </group>
        ))}
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
        Performance Comparison
      </Text>
      
      {/* Performance metrics */}
      <group position={[0, 1, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          make_shared vs shared_ptr(new T, deleter)
        </Text>
        
        {/* make_shared */}
        <group position={[-2, 0.2, 0]}>
          <Box args={[1.8, 1.2, 0.3]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.7} />
          </Box>
          <Text
            position={[0, 0.3, 0.2]}
            fontSize={0.1}
            color="white"
            anchorX="center"
          >
            make_shared
          </Text>
          <Text
            position={[0, 0.1, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            1 allocation
          </Text>
          <Text
            position={[0, -0.1, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            Better locality
          </Text>
          <Text
            position={[0, -0.3, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            No custom deleter
          </Text>
        </group>
        
        {/* Custom deleter */}
        <group position={[2, 0.2, 0]}>
          <Box args={[1.8, 1.2, 0.3]}>
            <meshStandardMaterial color="#ffa500" transparent opacity={0.7} />
          </Box>
          <Text
            position={[0, 0.3, 0.2]}
            fontSize={0.1}
            color="white"
            anchorX="center"
          >
            Custom Deleter
          </Text>
          <Text
            position={[0, 0.1, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            2 allocations
          </Text>
          <Text
            position={[0, -0.1, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            Separate blocks
          </Text>
          <Text
            position={[0, -0.3, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            Flexible cleanup
          </Text>
        </group>
      </group>
      
      {/* Recommendation */}
      <group position={[0, -1.2, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.12}
          color="#00d4ff"
          anchorX="center"
        >
          Use make_shared when possible, custom deleter when needed
        </Text>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {demonstration === 'basic_custom' && renderBasicCustom()}
      {demonstration === 'control_block' && renderControlBlock()}
      {demonstration === 'deleter_types' && renderDeleterTypes()}
      {demonstration === 'performance' && renderPerformance()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson33_SharedPtrCustomDeleter: React.FC = () => {
  const [state, setState] = useState<CustomDeleterState>({
    sharedPtrs: [
      { 
        id: 1, 
        name: 'file_ptr', 
        useCount: 2, 
        deleterType: 'custom_function', 
        resourceType: 'file',
        controlBlockSize: 56,
        resourceSize: 0
      }
    ],
    selectedPtr: 0,
    demonstration: 'basic_custom',
    showControlBlock: true,
    showMemoryUsage: true
  });

  const addSharedPtr = (deleterType: CustomDeleterState['sharedPtrs'][0]['deleterType'], resourceType: CustomDeleterState['sharedPtrs'][0]['resourceType']) => {
    const newPtr = {
      id: Date.now(),
      name: `ptr_${state.sharedPtrs.length}`,
      useCount: 1,
      deleterType,
      resourceType,
      controlBlockSize: 56 + (deleterType === 'functor' ? 24 : deleterType === 'lambda' ? 16 : 8),
      resourceSize: resourceType === 'array' ? 1024 : resourceType === 'file' ? 0 : 64
    };
    
    setState(prev => ({
      ...prev,
      sharedPtrs: [...prev.sharedPtrs, newPtr]
    }));
  };

  const removeSharedPtr = (index: number) => {
    setState(prev => ({
      ...prev,
      sharedPtrs: prev.sharedPtrs.filter((_, i) => i !== index),
      selectedPtr: prev.selectedPtr === index ? null : 
                   prev.selectedPtr && prev.selectedPtr > index ? prev.selectedPtr - 1 : prev.selectedPtr
    }));
  };

  const incrementUseCount = (index: number) => {
    setState(prev => ({
      ...prev,
      sharedPtrs: prev.sharedPtrs.map((ptr, i) => 
        i === index ? { ...ptr, useCount: ptr.useCount + 1 } : ptr
      )
    }));
  };

  const decrementUseCount = (index: number) => {
    setState(prev => ({
      ...prev,
      sharedPtrs: prev.sharedPtrs.map((ptr, i) => 
        i === index ? { ...ptr, useCount: Math.max(0, ptr.useCount - 1) } : ptr
      )
    }));
  };

  const getCurrentExample = () => {
    const { demonstration } = state;
    
    if (demonstration === 'basic_custom') {
      return `// Custom deleter with shared_ptr
#include <memory>
#include <iostream>

// Custom deleter function
void custom_deleter(int* p) {
    std::cout << "Custom deleting: " << *p << std::endl;
    delete p;
}

// Using function pointer
std::shared_ptr<int> ptr1(new int(42), custom_deleter);

// Using lambda
auto ptr2 = std::shared_ptr<int>(new int(100), 
    [](int* p) { 
        std::cout << "Lambda deleting: " << *p << std::endl;
        delete p; 
    });

// File resource with fclose
std::shared_ptr<FILE> file_ptr(
    fopen("data.txt", "r"), 
    [](FILE* f) { 
        if (f) fclose(f); 
    });`;
    }
    
    if (demonstration === 'control_block') {
      return `// Control block contains:
// 1. Reference count (use_count)
// 2. Weak reference count  
// 3. Deleter object (can be large!)
// 4. Allocator object
// 5. Virtual function table

// make_shared: Object + Control block in single allocation
auto sp1 = std::make_shared<Widget>();  // 1 allocation
sizeof(sp1);  // Usually 16 bytes (2 pointers)

// Custom deleter: Separate allocations
auto sp2 = std::shared_ptr<Widget>(new Widget(), 
    [capture_data](Widget* w) { 
        // Deleter with capture stored in control block
        delete w; 
    });
// Result: 2+ allocations, larger control block`;
    }
    
    if (demonstration === 'deleter_types') {
      return `// Different deleter types and their costs:

// 1. Function pointer (zero overhead)
void my_deleter(int* p) { delete p; }
std::shared_ptr<int> sp1(new int(1), my_deleter);

// 2. Lambda without capture (zero overhead)  
auto sp2 = std::shared_ptr<int>(new int(2), 
    [](int* p) { delete p; });

// 3. Lambda with capture (storage overhead)
int context = 42;
auto sp3 = std::shared_ptr<int>(new int(3),
    [context](int* p) { 
        std::cout << "Context: " << context << std::endl;
        delete p; 
    });

// 4. Function object (class size overhead)
struct CustomDeleter {
    std::string message;
    void operator()(int* p) const {
        std::cout << message << std::endl;
        delete p;
    }
};
auto sp4 = std::shared_ptr<int>(new int(4), 
    CustomDeleter{"Deleting with message"});`;
    }
    
    return `// Performance considerations:

// make_shared (preferred when no custom deleter needed)
auto fast = std::make_shared<Widget>();
// ✅ 1 allocation for object + control block
// ✅ Better cache locality
// ✅ Atomic operations on same cache line
// ❌ Object and control block lifetime coupled

// shared_ptr with new (when custom deleter needed)
auto flexible = std::shared_ptr<Widget>(new Widget(), custom_deleter);
// ❌ 2 allocations (object + control block)  
// ❌ Potential cache misses
// ✅ Custom cleanup logic
// ✅ Object destroyed when use_count reaches 0

// Best practices:
// 1. Prefer make_shared for performance
// 2. Use custom deleter for non-standard cleanup
// 3. Keep deleters small and efficient
// 4. Avoid capturing large objects in lambda deleters`;
  };

  const getTotalMemoryUsage = () => {
    return state.sharedPtrs.reduce((total, ptr) => 
      total + ptr.controlBlockSize + ptr.resourceSize, 0);
  };

  return (
    <Container>
      <Header>
        <Title>🔧 shared_ptr Custom Deleters</Title>
        <Subtitle>Mastering custom deletion logic with shared_ptr control blocks</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Custom Deleter Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>shared_ptr Custom Deleters</strong><br/>
            shared_ptr allows custom deletion logic stored in the control block.
            Different deleter types have varying memory and performance impacts.
          </StatusDisplay>

          <h4>🎯 Core Concepts</h4>
          <Grid>
            <InfoCard>
              <h4>Basic Custom Deleter</h4>
              <CodeBlock>{`// Function pointer deleter
void my_deleter(Widget* p) {
    std::cout << "Deleting widget\\n";
    delete p;
}

std::shared_ptr<Widget> sp(new Widget(), my_deleter);

// Lambda deleter  
auto sp2 = std::shared_ptr<Widget>(new Widget(),
    [](Widget* w) { 
        w->cleanup(); 
        delete w; 
    });

// Both have zero storage overhead for deleter`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>File Resource Management</h4>
              <CodeBlock>{`// RAII for C resources
std::shared_ptr<FILE> open_file(const char* filename) {
    FILE* f = fopen(filename, "r");
    if (!f) return nullptr;
    
    return std::shared_ptr<FILE>(f, 
        [](FILE* file) {
            if (file) {
                std::cout << "Closing file\\n";
                fclose(file);
            }
        });
}

// Usage
auto file = open_file("data.txt");
// Automatic fclose when last shared_ptr goes out of scope`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Array Deletion</h4>
              <CodeBlock>{`// Custom deleter for arrays
std::shared_ptr<int> make_int_array(size_t size) {
    return std::shared_ptr<int>(
        new int[size],
        [](int* p) { delete[] p; }  // Important: delete[]
    );
}

// Better: Use std::shared_ptr<int[]> (C++17)
std::shared_ptr<int[]> arr(new int[100]);
// Automatically uses delete[]

// Best: Use std::vector or std::array instead
auto best = std::make_shared<std::vector<int>>(100);`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Socket/Handle Management</h4>
              <CodeBlock>{`// Platform-specific resource cleanup
#ifdef _WIN32
using Handle = HANDLE;
const Handle INVALID_HANDLE = INVALID_HANDLE_VALUE;
auto close_handle = [](Handle h) { CloseHandle(h); };
#else
using Handle = int;
const Handle INVALID_HANDLE = -1;
auto close_handle = [](Handle* h) { close(*h); };
#endif

std::shared_ptr<Handle> make_handle(Handle h) {
    if (h == INVALID_HANDLE) return nullptr;
    
    return std::shared_ptr<Handle>(
        new Handle(h),
        [](Handle* ph) {
            close_handle(*ph);
            delete ph;
        });
}`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Control Block Impact</h4>
          <CodeBlock>{`// Control block contains:
struct ControlBlock {
    std::atomic<long> use_count;      // 8 bytes
    std::atomic<long> weak_count;     // 8 bytes
    
    // Virtual destructor for type erasure
    virtual ~ControlBlock() = default; // 8 bytes (vtable)
    
    // Deleter object stored here - size varies!
    DeleterType deleter;               // 0 to many bytes
    AllocatorType allocator;           // Usually 1 byte (empty)
};

// Size impact examples:
sizeof(std::function<void(T*)>);     // 32 bytes typically
sizeof(void(*)(T*));                 // 8 bytes (function pointer)  
sizeof([](T*){});                    // 1 byte (empty lambda)
sizeof([x](T*){use(x);});           // sizeof(x) + padding

// make_shared vs custom deleter:
make_shared<T>();                    // Object + small control block
shared_ptr<T>(new T(), deleter);     // Object + larger control block`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current State</h4>
            <StatusDisplay $type="success">
              <strong>shared_ptr Count:</strong> {state.sharedPtrs.length}<br/>
              <strong>Total Memory:</strong> {getTotalMemoryUsage()} bytes<br/>
              <strong>Selected:</strong> {state.selectedPtr !== null ? state.sharedPtrs[state.selectedPtr]?.name || 'None' : 'None'}
            </StatusDisplay>
            
            <h4>💻 Code Example</h4>
            <CodeBlock>{getCurrentExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <CustomDeleterVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Custom Deleter Controls</h4>
            
            <div>
              <strong>Demonstration:</strong><br/>
              <Button 
                $variant={state.demonstration === 'basic_custom' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'basic_custom' }))}
              >
                Basic Custom
              </Button>
              <Button 
                $variant={state.demonstration === 'control_block' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'control_block' }))}
              >
                Control Block
              </Button>
              <Button 
                $variant={state.demonstration === 'deleter_types' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'deleter_types' }))}
              >
                Deleter Types
              </Button>
              <Button 
                $variant={state.demonstration === 'performance' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'performance' }))}
              >
                Performance
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Add shared_ptr:</strong><br/>
              <Button onClick={() => addSharedPtr('custom_function', 'file')}>
                📁 File (fclose)
              </Button>
              <Button onClick={() => addSharedPtr('lambda', 'heap')}>
                🔧 Lambda Deleter
              </Button>
              <Button onClick={() => addSharedPtr('functor', 'socket')}>
                🔌 Socket (functor)
              </Button>
              <Button onClick={() => addSharedPtr('custom_function', 'array')}>
                📊 Array (delete[])
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Manage shared_ptrs:</strong><br/>
              {state.sharedPtrs.map((ptr, index) => (
                <div key={ptr.id} style={{ marginTop: '0.5rem' }}>
                  <Button 
                    $variant={state.selectedPtr === index ? 'primary' : 'secondary'}
                    onClick={() => setState(prev => ({ ...prev, selectedPtr: index }))}
                  >
                    {ptr.name} ({ptr.useCount})
                  </Button>
                  <Button onClick={() => incrementUseCount(index)}>
                    ➕
                  </Button>
                  <Button onClick={() => decrementUseCount(index)}>
                    ➖
                  </Button>
                  <Button onClick={() => removeSharedPtr(index)} $variant="danger">
                    🗑️
                  </Button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                $variant={state.showControlBlock ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showControlBlock: !prev.showControlBlock }))}
              >
                {state.showControlBlock ? 'Hide' : 'Show'} Control Block
              </Button>
              
              <Button 
                $variant={state.showMemoryUsage ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showMemoryUsage: !prev.showMemoryUsage }))}
              >
                {state.showMemoryUsage ? 'Hide' : 'Show'} Memory Usage
              </Button>
            </div>

            <StatusDisplay $type="info">
              <strong>Key Points:</strong><br/>
              • <Highlight $color="#2ed573">Control block</Highlight> stores deleter object<br/>
              • <Highlight $color="#ffa500">Function pointers</Highlight> have zero overhead<br/>
              • <Highlight $color="#00d4ff">Lambdas with capture</Highlight> increase memory usage<br/>
              • <Highlight $color="#ff6b7a">make_shared</Highlight> can't use custom deleters<br/>
              • <Highlight>Type erasure</Highlight> allows different deleters in same type
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson33_SharedPtrCustomDeleter;