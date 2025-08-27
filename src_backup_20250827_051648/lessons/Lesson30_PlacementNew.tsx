import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface PlacementNewState {
  bufferSize: number;
  objectType: 'int' | 'string' | 'vector' | 'custom';
  objectSize: number;
  placementOffset: number;
  constructedObjects: { type: string; offset: number; size: number; alive: boolean; id: number }[];
  selectedObject: number | null;
  demonstration: 'basic' | 'alignment' | 'destructor' | 'array';
  showAlignment: boolean;
  currentStep: number;
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

function PlacementNewVisualization({ state }: { state: PlacementNewState }) {
  const { bufferSize, constructedObjects, selectedObject, showAlignment, demonstration } = state;

  const getObjectTypeInfo = (type: string) => {
    const types = {
      int: { size: 4, align: 4, color: '#2ed573' },
      string: { size: 32, align: 8, color: '#00d4ff' },
      vector: { size: 24, align: 8, color: '#ffa500' },
      custom: { size: 16, align: 8, color: '#ff6b7a' }
    };
    return types[type as keyof typeof types] || types.int;
  };

  const renderBufferVisualization = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#00d4ff"
        anchorX="center"
      >
        std::byte Buffer ({bufferSize} bytes)
      </Text>
      
      {/* Buffer visualization */}
      <group position={[0, 1, 0]}>
        {Array.from({ length: bufferSize }, (_, index) => {
          const containingObject = constructedObjects.find(obj => 
            obj.alive && index >= obj.offset && index < obj.offset + obj.size
          );
          
          const isSelected = containingObject && containingObject.id === selectedObject;
          const isAlignmentBoundary = showAlignment && index % 8 === 0;
          
          return (
            <group key={`byte-${index}`} position={[index * 0.2 - bufferSize * 0.1, 0, 0]}>
              <Box args={[0.18, 0.4, 0.2]}>
                <meshStandardMaterial 
                  color={
                    isSelected ? '#ff4757' :
                    containingObject ? getObjectTypeInfo(containingObject.type).color :
                    isAlignmentBoundary ? '#57606f' :
                    '#333'
                  }
                  transparent
                  opacity={containingObject ? 0.8 : 0.3}
                />
              </Box>
              
              {containingObject && index === containingObject.offset && (
                <Text
                  position={[0, 0, 0.15]}
                  fontSize={0.06}
                  color="white"
                  anchorX="center"
                >
                  {containingObject.type}
                </Text>
              )}
              
              <Text
                position={[0, -0.3, 0]}
                fontSize={0.05}
                color="#888"
                anchorX="center"
              >
                {index}
              </Text>
              
              {isAlignmentBoundary && showAlignment && (
                <Text
                  position={[0, 0.3, 0]}
                  fontSize={0.04}
                  color="#57606f"
                  anchorX="center"
                >
                  8B
                </Text>
              )}
            </group>
          );
        })}
      </group>
      
      {/* Object list */}
      <group position={[0, 0, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#ffa500"
          anchorX="center"
        >
          Constructed Objects
        </Text>
        
        {constructedObjects.map((obj, index) => (
          <group key={`obj-${obj.id}`} position={[0, 0.2 - index * 0.3, 0]}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.1}
              color={obj.alive ? getObjectTypeInfo(obj.type).color : '#ff4757'}
              anchorX="center"
            >
              {obj.type} at [{obj.offset}] - {obj.alive ? 'ALIVE' : 'DESTROYED'}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );

  const renderAlignmentDemo = () => {
    const targetAlignment = 8;
    const { placementOffset } = state;
    const alignedOffset = Math.ceil(placementOffset / targetAlignment) * targetAlignment;
    
    return (
      <group>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.2}
          color="#2ed573"
          anchorX="center"
        >
          Alignment Requirements
        </Text>
        
        {/* Buffer with alignment visualization */}
        <group position={[0, 1, 0]}>
          {Array.from({ length: 32 }, (_, index) => (
            <group key={`align-${index}`} position={[index * 0.3 - 16 * 0.15, 0, 0]}>
              <Box args={[0.25, 0.4, 0.2]}>
                <meshStandardMaterial 
                  color={
                    index === placementOffset ? '#ff6b7a' :
                    index === alignedOffset ? '#2ed573' :
                    index % targetAlignment === 0 ? '#00d4ff' :
                    '#333'
                  }
                  transparent
                  opacity={0.7}
                />
              </Box>
              
              <Text
                position={[0, -0.3, 0]}
                fontSize={0.05}
                color="#888"
                anchorX="center"
              >
                {index}
              </Text>
              
              {index % targetAlignment === 0 && (
                <Text
                  position={[0, 0.3, 0]}
                  fontSize={0.04}
                  color="#00d4ff"
                  anchorX="center"
                >
                  8B
                </Text>
              )}
            </group>
          ))}
        </group>
        
        {/* Alignment calculation */}
        <group position={[0, 0, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.12}
            color="white"
            anchorX="center"
          >
            Requested offset: {placementOffset} → Aligned offset: {alignedOffset}
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.12}
            color="white"
            anchorX="center"
          >
            Padding needed: {alignedOffset - placementOffset} bytes
          </Text>
        </group>
      </group>
    );
  };

  const renderDestructorDemo = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ff4757"
        anchorX="center"
      >
        Manual Destructor Management
      </Text>
      
      {/* Lifecycle visualization */}
      <group position={[0, 1, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Object Lifecycle
        </Text>
        
        {/* Steps */}
        {[
          { step: 1, text: '1. Allocate raw memory', color: '#57606f' },
          { step: 2, text: '2. placement new construct', color: '#2ed573' },
          { step: 3, text: '3. Use object normally', color: '#00d4ff' },
          { step: 4, text: '4. obj->~Type() destruct', color: '#ff6b7a' },
          { step: 5, text: '5. Deallocate memory', color: '#57606f' }
        ].map((item, index) => (
          <group key={`step-${item.step}`} position={[0, 0.2 - index * 0.25, 0]}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.1}
              color={item.color}
              anchorX="center"
            >
              {item.text}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Warning */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.12}
          color="#ff4757"
          anchorX="center"
        >
          ⚠️ Must manually call destructor!
        </Text>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.1}
          color="#ff6b7a"
          anchorX="center"
        >
          No automatic cleanup like regular new/delete
        </Text>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {demonstration === 'basic' && renderBufferVisualization()}
      {demonstration === 'alignment' && renderAlignmentDemo()}
      {demonstration === 'destructor' && renderDestructorDemo()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson30_PlacementNew: React.FC = () => {
  const [state, setState] = useState<PlacementNewState>({
    bufferSize: 64,
    objectType: 'int',
    objectSize: 4,
    placementOffset: 8,
    constructedObjects: [],
    selectedObject: null,
    demonstration: 'basic',
    showAlignment: true,
    currentStep: 0
  });

  const getObjectSize = (type: string) => {
    const sizes = { int: 4, string: 32, vector: 24, custom: 16 };
    return sizes[type as keyof typeof sizes] || 4;
  };

  const canPlaceObject = () => {
    const size = getObjectSize(state.objectType);
    return state.placementOffset + size <= state.bufferSize;
  };

  const placementNewObject = () => {
    if (!canPlaceObject()) return;
    
    const newObject = {
      type: state.objectType,
      offset: state.placementOffset,
      size: getObjectSize(state.objectType),
      alive: true,
      id: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      constructedObjects: [...prev.constructedObjects, newObject],
      placementOffset: prev.placementOffset + newObject.size
    }));
  };

  const destroyObject = (id: number) => {
    setState(prev => ({
      ...prev,
      constructedObjects: prev.constructedObjects.map(obj =>
        obj.id === id ? { ...obj, alive: false } : obj
      )
    }));
  };

  const clearBuffer = () => {
    setState(prev => ({
      ...prev,
      constructedObjects: [],
      placementOffset: 0,
      selectedObject: null
    }));
  };

  const getCurrentExample = () => {
    const { objectType, placementOffset } = state;
    
    return `// Step 1: Allocate raw memory
std::byte buffer[${state.bufferSize}];

// Step 2: Calculate aligned address
void* ptr = &buffer[${placementOffset}];
std::size_t space = ${state.bufferSize - placementOffset};

// Step 3: Placement new construction
${objectType}* obj = new(ptr) ${objectType}(${
  objectType === 'int' ? '42' :
  objectType === 'string' ? '"Hello"' :
  objectType === 'vector' ? '{1, 2, 3}' :
  'CustomType()'
});

// Step 4: Use object normally
${objectType === 'int' ? '*obj = 100;' :
  objectType === 'string' ? 'obj->append(" World");' :
  objectType === 'vector' ? 'obj->push_back(4);' :
  'obj->doSomething();'}

// Step 5: Manual destructor call
obj->~${objectType}();

// Step 6: Memory remains valid (can reuse)
// No delete - buffer cleanup is separate`;
  };

  return (
    <Container>
      <Header>
        <Title>🏗️ Placement New</Title>
        <Subtitle>Constructing objects in pre-allocated std::byte buffers</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Placement New Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>Placement New</strong><br/>
            Constructs objects at a specific memory location without allocating new memory.
            Provides fine control over object lifetime and memory management.
          </StatusDisplay>

          <h4>🎯 Core Concepts</h4>
          <Grid>
            <InfoCard>
              <h4>Basic Syntax</h4>
              <CodeBlock>{`// Include for placement new
#include <new>

// Allocate raw memory
std::byte buffer[1024];
void* ptr = &buffer[0];

// Placement new - construct at address
Widget* w = new(ptr) Widget(args...);

// Use object normally
w->method();

// Manual destructor call
w->~Widget();

// No delete! Memory cleanup separate`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Alignment Handling</h4>
              <CodeBlock>{`#include <memory>

std::byte buffer[1024];
void* ptr = buffer;
std::size_t space = sizeof(buffer);

// Align for specific type
if (std::align(alignof(Widget), sizeof(Widget), ptr, space)) {
    Widget* w = new(ptr) Widget();
    
    // Update pointer for next allocation
    ptr = static_cast<std::byte*>(ptr) + sizeof(Widget);
    space -= sizeof(Widget);
} else {
    // Insufficient space for aligned allocation
}`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Array Construction</h4>
              <CodeBlock>{`// Array placement new
std::byte buffer[1024];
Widget* array = static_cast<Widget*>(static_cast<void*>(buffer));

// Construct each element
for (int i = 0; i < count; ++i) {
    new(&array[i]) Widget(i);
}

// Destroy each element (reverse order)
for (int i = count - 1; i >= 0; --i) {
    array[i].~Widget();
}

// Alternative: std::destroy / std::uninitialized_fill`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>RAII Wrapper</h4>
              <CodeBlock>{`template<typename T>
class PlacementPtr {
    T* ptr;
    bool constructed;
    
public:
    template<typename... Args>
    PlacementPtr(void* memory, Args&&... args) 
        : ptr(static_cast<T*>(memory)), constructed(true) {
        new(memory) T(std::forward<Args>(args)...);
    }
    
    ~PlacementPtr() {
        if (constructed && ptr) {
            ptr->~T();
        }
    }
    
    T* operator->() { return ptr; }
    T& operator*() { return *ptr; }
};

// Usage
std::byte buffer[sizeof(Widget)];
PlacementPtr<Widget> widget(buffer, "constructor args");
widget->method();  // Automatic destructor on scope exit`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Use Cases</h4>
          <CodeBlock>{`// 1. Custom memory pools
class MemoryPool {
    std::byte* memory;
    std::size_t size, offset;
    
public:
    template<typename T, typename... Args>
    T* construct(Args&&... args) {
        if (offset + sizeof(T) > size) return nullptr;
        
        T* result = new(&memory[offset]) T(std::forward<Args>(args)...);
        offset += sizeof(T);
        return result;
    }
};

// 2. Stack allocators for temporary objects
template<std::size_t Size>
class StackAllocator {
    alignas(std::max_align_t) std::byte buffer[Size];
    std::size_t used = 0;
    
public:
    template<typename T, typename... Args>
    T* make(Args&&... args) {
        auto aligned_addr = reinterpret_cast<std::uintptr_t>(&buffer[used]);
        aligned_addr = (aligned_addr + alignof(T) - 1) & ~(alignof(T) - 1);
        
        if (aligned_addr + sizeof(T) > reinterpret_cast<std::uintptr_t>(buffer) + Size) {
            return nullptr;
        }
        
        T* obj = new(reinterpret_cast<void*>(aligned_addr)) T(std::forward<Args>(args)...);
        used = aligned_addr - reinterpret_cast<std::uintptr_t>(buffer) + sizeof(T);
        return obj;
    }
};

// 3. Embedded systems with fixed memory regions
extern std::byte device_memory[4096];
extern std::byte fast_memory[256];

// Place critical objects in fast memory
CriticalController* ctrl = new(fast_memory) CriticalController();
BufferManager* bufmgr = new(device_memory) BufferManager();`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current State</h4>
            <StatusDisplay $type={state.constructedObjects.some(obj => !obj.alive) ? 'warning' : 'success'}>
              <strong>Buffer:</strong> {state.bufferSize} bytes<br/>
              <strong>Objects:</strong> {state.constructedObjects.filter(obj => obj.alive).length} alive, 
              {state.constructedObjects.filter(obj => !obj.alive).length} destroyed<br/>
              <strong>Next Placement:</strong> offset {state.placementOffset}<br/>
              <strong>Space Remaining:</strong> {state.bufferSize - state.placementOffset} bytes
            </StatusDisplay>
            
            <h4>💻 Generated Code</h4>
            <CodeBlock>{getCurrentExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <PlacementNewVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Placement New Controls</h4>
            
            <div>
              <strong>Demonstration:</strong><br/>
              <Button 
                $variant={state.demonstration === 'basic' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'basic' }))}
              >
                Buffer Management
              </Button>
              <Button 
                $variant={state.demonstration === 'alignment' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'alignment' }))}
              >
                Alignment Demo
              </Button>
              <Button 
                $variant={state.demonstration === 'destructor' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'destructor' }))}
              >
                Destructor Lifecycle
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Object Type:</strong><br/>
              <select 
                value={state.objectType}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  objectType: e.target.value as any,
                  objectSize: getObjectSize(e.target.value)
                }))}
                style={{ 
                  padding: '0.5rem', 
                  margin: '0.5rem',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#e0e6ed',
                  border: '1px solid rgba(0,212,255,0.3)'
                }}
              >
                <option value="int">int (4 bytes)</option>
                <option value="string">std::string (32 bytes)</option>
                <option value="vector">std::vector (24 bytes)</option>
                <option value="custom">CustomType (16 bytes)</option>
              </select>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Buffer Configuration:</strong><br/>
              <label>Size: </label>
              <Input 
                type="number"
                min="16"
                max="128"
                value={state.bufferSize}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  bufferSize: Math.max(16, Math.min(parseInt(e.target.value) || 64, 128))
                }))}
              />
              
              <label>Placement Offset: </label>
              <Input 
                type="number"
                min="0"
                max={state.bufferSize - state.objectSize}
                value={state.placementOffset}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  placementOffset: Math.max(0, Math.min(parseInt(e.target.value) || 0, prev.bufferSize - prev.objectSize))
                }))}
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Operations:</strong><br/>
              <Button 
                onClick={placementNewObject}
                disabled={!canPlaceObject()}
                $variant={canPlaceObject() ? 'primary' : 'secondary'}
              >
                🏗️ Placement New {state.objectType}
              </Button>
              
              <Button onClick={clearBuffer} $variant="danger">
                🗑️ Clear Buffer
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                $variant={state.showAlignment ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showAlignment: !prev.showAlignment }))}
              >
                {state.showAlignment ? 'Hide' : 'Show'} Alignment
              </Button>
            </div>

            {state.constructedObjects.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Object Management:</strong><br/>
                {state.constructedObjects.map(obj => (
                  <div key={obj.id} style={{ marginTop: '0.5rem' }}>
                    <Button 
                      $variant="secondary"
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        selectedObject: prev.selectedObject === obj.id ? null : obj.id 
                      }))}
                    >
                      {obj.type} at [{obj.offset}]
                    </Button>
                    {obj.alive && (
                      <Button 
                        $variant="danger"
                        onClick={() => destroyObject(obj.id)}
                      >
                        ~{obj.type}()
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <StatusDisplay $type="warning">
              <strong>Key Requirements:</strong><br/>
              • <Highlight $color="#ff4757">Manual destructor</Highlight>: Must call obj-&gt;~Type()<br/>
              • <Highlight $color="#ffa500">Alignment</Highlight>: Use std::align for proper placement<br/>
              • <Highlight $color="#2ed573">Lifetime</Highlight>: Object lifetime independent of memory lifetime<br/>
              • <Highlight>No delete</Highlight>: Buffer cleanup separate from object destruction
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson30_PlacementNew;