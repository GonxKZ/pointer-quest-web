import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { THREE } from '../utils/three';

interface VectorInvalidationState {
  vectorData: number[];
  capacity: number;
  iterators: { name: string; index: number; valid: boolean; color: string }[];
  pointers: { name: string; index: number; valid: boolean; color: string }[];
  operation: 'push_back' | 'insert' | 'resize' | 'reserve' | 'clear';
  operationValue: number;
  insertPosition: number;
  showInvalidation: boolean;
  reallocationCount: number;
  view: 'memory_layout' | 'invalidation_tracking' | 'capacity_growth';
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

function VectorVisualization({ state }: { state: VectorInvalidationState }) {
  const { vectorData, capacity, iterators, pointers, showInvalidation, view } = state;

  const renderMemoryLayout = () => (
    <group>
      {/* Vector capacity visualization */}
      <group position={[0, 1, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.2}
          color="#00d4ff"
          anchorX="center"
        >
          Vector Memory Layout (capacity: {capacity})
        </Text>
        
        {/* Capacity blocks */}
        {Array.from({ length: capacity }, (_, index) => (
          <group key={`capacity-${index}`} position={[index * 0.8 - (capacity * 0.8) / 2, 0, 0]}>
            <Box args={[0.6, 0.6, 0.3]}>
              <meshStandardMaterial 
                color={
                  index < vectorData.length ? '#2ed573' : '#57606f'
                }
                transparent
                opacity={0.7}
              />
            </Box>
            
            {index < vectorData.length && (
              <Text
                position={[0, 0, 0.2]}
                fontSize={0.15}
                color="white"
                anchorX="center"
              >
                {vectorData[index]}
              </Text>
            )}
            
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.1}
              color="#ffa500"
              anchorX="center"
            >
              [{index}]
            </Text>
          </group>
        ))}
        
        {/* Size vs capacity indicator */}
        <group position={[0, -1, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="#2ed573"
            anchorX="center"
          >
            size(): {vectorData.length} | capacity(): {capacity}
          </Text>
        </group>
      </group>
      
      {/* Iterators and pointers */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.18}
          color="#ffa500"
          anchorX="center"
        >
          Iterators & Pointers
        </Text>
        
        {iterators.map((iter, index) => (
          <group key={`iter-${iter.name}`} position={[iter.index * 0.8 - (capacity * 0.8) / 2, 0.3, 0]}>
            <Box args={[0.2, 0.2, 0.2]}>
              <meshStandardMaterial color={iter.valid ? iter.color : '#ff4757'} />
            </Box>
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.1}
              color={iter.valid ? iter.color : '#ff4757'}
              anchorX="center"
            >
              {iter.name}
            </Text>
            {!iter.valid && showInvalidation && (
              <Text
                position={[0, -0.3, 0]}
                fontSize={0.08}
                color="#ff4757"
                anchorX="center"
              >
                INVALID
              </Text>
            )}
          </group>
        ))}
        
        {pointers.map((ptr, index) => (
          <group key={`ptr-${ptr.name}`} position={[ptr.index * 0.8 - (capacity * 0.8) / 2, -0.3, 0]}>
            <Box args={[0.2, 0.2, 0.2]}>
              <meshStandardMaterial color={ptr.valid ? ptr.color : '#ff4757'} />
            </Box>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.1}
              color={ptr.valid ? ptr.color : '#ff4757'}
              anchorX="center"
            >
              {ptr.name}
            </Text>
            {!ptr.valid && showInvalidation && (
              <Text
                position={[0, 0.3, 0]}
                fontSize={0.08}
                color="#ff4757"
                anchorX="center"
              >
                INVALID
              </Text>
            )}
          </group>
        ))}
      </group>
    </group>
  );

  const renderInvalidationTracking = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.25}
        color="#ff4757"
        anchorX="center"
      >
        Iterator/Pointer Invalidation Status
      </Text>
      
      {/* Validity matrix */}
      <group position={[0, 1, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.18}
          color="#00d4ff"
          anchorX="center"
        >
          Current References
        </Text>
        
        {[...iterators, ...pointers].map((ref, index) => (
          <group key={`ref-${ref.name}`} position={[0, 0.5 - index * 0.4, 0]}>
            {/* Status indicator */}
            <Box args={[0.3, 0.3, 0.1]} position={[-2, 0, 0]}>
              <meshStandardMaterial color={ref.valid ? '#2ed573' : '#ff4757'} />
            </Box>
            
            <Text
              position={[-1.5, 0, 0]}
              fontSize={0.15}
              color="white"
              anchorX="left"
            >
              {ref.name}: {ref.valid ? 'VALID' : 'INVALIDATED'}
            </Text>
            
            <Text
              position={[1, 0, 0]}
              fontSize={0.12}
              color="#ffa500"
              anchorX="left"
            >
              points to index [{ref.index}]
            </Text>
          </group>
        ))}
      </group>
      
      {showInvalidation && (
        <group position={[0, -1.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color="#ff4757"
            anchorX="center"
          >
            ⚠️ REALLOCATION DETECTED!
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.15}
            color="#ff6b7a"
            anchorX="center"
          >
            All iterators and pointers invalidated
          </Text>
        </group>
      )}
    </group>
  );

  const renderCapacityGrowth = () => {
    const growthSteps = [2, 4, 8, 16, 32];
    const currentStep = growthSteps.findIndex(cap => cap >= capacity);
    
    return (
      <group>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.25}
          color="#2ed573"
          anchorX="center"
        >
          Capacity Growth Pattern
        </Text>
        
        {growthSteps.map((cap, index) => (
          <group key={`growth-${cap}`} position={[index * 1.5 - 3, 0, 0]}>
            <Box 
              args={[1, cap * 0.1, 0.3]}
              position={[0, cap * 0.05, 0]}
            >
              <meshStandardMaterial 
                color={index <= currentStep ? '#2ed573' : '#57606f'}
                transparent
                opacity={0.7}
              />
            </Box>
            
            <Text
              position={[0, cap * 0.1 + 0.3, 0]}
              fontSize={0.12}
              color={index <= currentStep ? '#2ed573' : '#888'}
              anchorX="center"
            >
              {cap}
            </Text>
            
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.1}
              color="#ffa500"
              anchorX="center"
            >
              {index === currentStep ? 'CURRENT' : ''}
            </Text>
          </group>
        ))}
        
        <group position={[0, -1.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="#00d4ff"
            anchorX="center"
          >
            Growth Factor: ~2x (implementation dependent)
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.12}
            color="#888"
            anchorX="center"
          >
            Reallocations: {state.reallocationCount}
          </Text>
        </group>
      </group>
    );
  };

  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {view === 'memory_layout' && renderMemoryLayout()}
      {view === 'invalidation_tracking' && renderInvalidationTracking()}
      {view === 'capacity_growth' && renderCapacityGrowth()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson26_VectorInvalidation: React.FC = () => {
  const [state, setState] = useState<VectorInvalidationState>({
    vectorData: [10, 20, 30],
    capacity: 4,
    iterators: [
      { name: 'it_begin', index: 0, valid: true, color: '#00d4ff' },
      { name: 'it_mid', index: 1, valid: true, color: '#2ed573' }
    ],
    pointers: [
      { name: 'ptr_first', index: 0, valid: true, color: '#ffa500' },
      { name: 'ptr_last', index: 2, valid: true, color: '#ff6b7a' }
    ],
    operation: 'push_back',
    operationValue: 40,
    insertPosition: 1,
    showInvalidation: false,
    reallocationCount: 0,
    view: 'memory_layout'
  });

  const willCauseReallocation = () => {
    switch (state.operation) {
      case 'push_back':
        return state.vectorData.length >= state.capacity;
      case 'insert':
        return state.vectorData.length >= state.capacity;
      case 'resize':
        return state.operationValue > state.capacity;
      case 'reserve':
        return state.operationValue > state.capacity;
      default:
        return false;
    }
  };

  const performOperation = () => {
    setState(prev => {
      const causeReallocation = willCauseReallocation();
      let newData = [...prev.vectorData];
      let newCapacity = prev.capacity;
      let newReallocationCount = prev.reallocationCount;

      switch (prev.operation) {
        case 'push_back':
          newData.push(prev.operationValue);
          if (causeReallocation) {
            newCapacity = Math.max(prev.capacity * 2, newData.length);
            newReallocationCount++;
          }
          break;
        case 'insert':
          newData.splice(prev.insertPosition, 0, prev.operationValue);
          if (causeReallocation) {
            newCapacity = Math.max(prev.capacity * 2, newData.length);
            newReallocationCount++;
          }
          break;
        case 'resize':
          if (prev.operationValue > newData.length) {
            while (newData.length < prev.operationValue) {
              newData.push(0);
            }
          } else {
            newData = newData.slice(0, prev.operationValue);
          }
          if (prev.operationValue > prev.capacity) {
            newCapacity = prev.operationValue;
            newReallocationCount++;
          }
          break;
        case 'reserve':
          if (prev.operationValue > prev.capacity) {
            newCapacity = prev.operationValue;
            newReallocationCount++;
          }
          break;
        case 'clear':
          newData = [];
          break;
      }

      // Update iterator and pointer validity
      const newIterators = prev.iterators.map(iter => ({
        ...iter,
        valid: causeReallocation ? false : iter.index < newData.length,
        index: Math.min(iter.index, newData.length - 1)
      }));

      const newPointers = prev.pointers.map(ptr => ({
        ...ptr,
        valid: causeReallocation ? false : ptr.index < newData.length,
        index: Math.min(ptr.index, newData.length - 1)
      }));

      return {
        ...prev,
        vectorData: newData,
        capacity: newCapacity,
        iterators: newIterators,
        pointers: newPointers,
        showInvalidation: causeReallocation,
        reallocationCount: newReallocationCount
      };
    });
  };

  const resetVector = () => {
    setState(prev => ({
      ...prev,
      vectorData: [10, 20, 30],
      capacity: 4,
      iterators: [
        { name: 'it_begin', index: 0, valid: true, color: '#00d4ff' },
        { name: 'it_mid', index: 1, valid: true, color: '#2ed573' }
      ],
      pointers: [
        { name: 'ptr_first', index: 0, valid: true, color: '#ffa500' },
        { name: 'ptr_last', index: 2, valid: true, color: '#ff6b7a' }
      ],
      showInvalidation: false,
      reallocationCount: 0
    }));
  };

  const addIterator = () => {
    const newIndex = Math.min(state.vectorData.length - 1, 0);
    const colors = ['#ff4757', '#5352ed', '#ffa502', '#ff6348'];
    const newIter = {
      name: `it_${state.iterators.length}`,
      index: newIndex,
      valid: true,
      color: colors[state.iterators.length % colors.length]
    };
    
    setState(prev => ({
      ...prev,
      iterators: [...prev.iterators, newIter]
    }));
  };

  const getCurrentCode = () => {
    const { operation, operationValue, insertPosition } = state;
    
    const operations = {
      push_back: `vec.push_back(${operationValue});`,
      insert: `vec.insert(vec.begin() + ${insertPosition}, ${operationValue});`,
      resize: `vec.resize(${operationValue});`,
      reserve: `vec.reserve(${operationValue});`,
      clear: `vec.clear();`
    };

    return `std::vector<int> vec = {${state.vectorData.join(', ')}};
// Current: size=${state.vectorData.length}, capacity=${state.capacity}

// Store iterators and pointers BEFORE operation
auto it_begin = vec.begin();
auto it_mid = vec.begin() + 1;
int* ptr_first = &vec[0];
int* ptr_last = &vec[${state.vectorData.length - 1}];

${operations[operation]}

// After operation:
${willCauseReallocation() ? '// ⚠️ REALLOCATION OCCURRED!\n// All iterators and pointers are now INVALID!' : '// No reallocation - iterators and pointers still valid'}`;
  };

  return (
    <Container>
      <Header>
        <Title>📦 Vector Invalidation Inspector</Title>
        <Subtitle>Monitor iterator and pointer invalidation during vector reallocation</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Vector Invalidation Theory</h3>
          
          <StatusDisplay $type="warning">
            <strong>Iterator Invalidation</strong><br/>
            Vector reallocation invalidates ALL iterators, pointers, and references to elements.
            This can lead to undefined behavior if not handled properly.
          </StatusDisplay>

          <h4>🎯 Invalidation Rules</h4>
          <Grid>
            <InfoCard>
              <h4>push_back()</h4>
              <CodeBlock>{`// If size() < capacity()
vec.push_back(value);  // No reallocation
// All iterators remain valid

// If size() == capacity()  
vec.push_back(value);  // Reallocation!
// ALL iterators invalidated`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>insert()</h4>
              <CodeBlock>{`// May cause reallocation
auto it = vec.insert(pos, value);

// If reallocation occurred:
// - ALL iterators invalidated
// - Function returns new valid iterator

// If no reallocation:
// - Iterators before pos: valid
// - Iterators at/after pos: invalidated`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>resize()</h4>
              <CodeBlock>{`// Increase size beyond capacity
vec.resize(new_size);  // Reallocation
// ALL iterators invalidated

// Decrease size
vec.resize(smaller_size);  // No reallocation
// Only iterators past new end invalidated`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>reserve()</h4>
              <CodeBlock>{`// Increase capacity
vec.reserve(new_cap);  // May reallocate
// If reallocation: ALL iterators invalidated
// If no reallocation: all remain valid

// Note: reserve() never reduces capacity
vec.reserve(smaller);  // No effect`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚠️ Common Invalidation Bugs</h4>
          <CodeBlock>{`// DANGEROUS: Iterator invalidation
std::vector<int> vec = {1, 2, 3};
auto it = vec.begin();
vec.push_back(4);      // May invalidate 'it'
*it = 10;              // UNDEFINED BEHAVIOR!

// SAFE: Get new iterator after modification
std::vector<int> vec = {1, 2, 3};
size_t index = 0;      // Store index instead
vec.push_back(4);      
vec[index] = 10;       // Safe: use index

// SAFE: Use reserve() to prevent reallocation
std::vector<int> vec;
vec.reserve(100);      // Guarantee capacity
auto it = vec.begin();
vec.push_back(1);      // Safe: no reallocation
vec.push_back(2);      // Safe: no reallocation

// DANGEROUS: Pointer invalidation in loops
for (auto it = vec.begin(); it != vec.end(); ++it) {
    if (*it == target) {
        vec.push_back(new_value);  // May invalidate 'it'!
        // UNDEFINED BEHAVIOR on next iteration
    }
}`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current Vector State</h4>
            <StatusDisplay $type={willCauseReallocation() ? 'error' : 'success'}>
              <strong>Size:</strong> {state.vectorData.length}<br/>
              <strong>Capacity:</strong> {state.capacity}<br/>
              <strong>Next Operation:</strong> {state.operation}<br/>
              <strong>Will Reallocate:</strong> {willCauseReallocation() ? 'YES ⚠️' : 'NO ✅'}<br/>
              <strong>Total Reallocations:</strong> {state.reallocationCount}
            </StatusDisplay>
            
            <h4>💻 Code Preview</h4>
            <CodeBlock>{getCurrentCode()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <VectorVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Vector Operations</h4>
            
            <div>
              <strong>View Mode:</strong><br/>
              <Button 
                $variant={state.view === 'memory_layout' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, view: 'memory_layout' }))}
              >
                Memory Layout
              </Button>
              <Button 
                $variant={state.view === 'invalidation_tracking' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, view: 'invalidation_tracking' }))}
              >
                Invalidation Status
              </Button>
              <Button 
                $variant={state.view === 'capacity_growth' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, view: 'capacity_growth' }))}
              >
                Capacity Growth
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Operation:</strong><br/>
              <select 
                value={state.operation}
                onChange={(e) => setState(prev => ({ ...prev, operation: e.target.value as any }))}
                style={{ 
                  padding: '0.5rem', 
                  margin: '0.5rem',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#e0e6ed',
                  border: '1px solid rgba(0,212,255,0.3)'
                }}
              >
                <option value="push_back">push_back()</option>
                <option value="insert">insert()</option>
                <option value="resize">resize()</option>
                <option value="reserve">reserve()</option>
                <option value="clear">clear()</option>
              </select>
              
              {(state.operation === 'push_back' || state.operation === 'insert' || 
                state.operation === 'resize' || state.operation === 'reserve') && (
                <Input 
                  type="number"
                  value={state.operationValue}
                  onChange={(e) => setState(prev => ({ ...prev, operationValue: parseInt(e.target.value) || 0 }))}
                  placeholder="value"
                />
              )}
              
              {state.operation === 'insert' && (
                <Input 
                  type="number"
                  min="0"
                  max={state.vectorData.length}
                  value={state.insertPosition}
                  onChange={(e) => setState(prev => ({ ...prev, insertPosition: parseInt(e.target.value) || 0 }))}
                  placeholder="position"
                />
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                onClick={performOperation}
                $variant={willCauseReallocation() ? 'danger' : 'primary'}
              >
                {willCauseReallocation() ? '⚠️ Execute (Will Reallocate!)' : '✅ Execute Operation'}
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Iterator Management:</strong><br/>
              <Button onClick={addIterator}>
                Add Iterator
              </Button>
              <Button onClick={resetVector}>
                🔄 Reset Vector
              </Button>
            </div>

            <StatusDisplay $type={state.showInvalidation ? 'error' : 'info'}>
              <strong>Active References:</strong><br/>
              Iterators: {state.iterators.filter(it => it.valid).length}/{state.iterators.length} valid<br/>
              Pointers: {state.pointers.filter(ptr => ptr.valid).length}/{state.pointers.length} valid<br/>
              {state.showInvalidation && (
                <>
                  <br/><Highlight $color="#ff4757">⚠️ INVALIDATION EVENT!</Highlight><br/>
                  Vector reallocation has invalidated all iterators and pointers.
                </>
              )}
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson26_VectorInvalidation;