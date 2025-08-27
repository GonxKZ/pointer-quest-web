import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import * as THREE from 'three';

interface DequeStabilityState {
  dequeData: number[];
  vectorData: number[];
  dequePointers: { name: string; index: number; valid: boolean; color: string }[];
  vectorPointers: { name: string; index: number; valid: boolean; color: string }[];
  operation: 'push_front' | 'push_back' | 'insert_middle' | 'pop_front' | 'pop_back';
  operationValue: number;
  insertPosition: number;
  view: 'comparison' | 'deque_blocks' | 'stability_test';
  showInvalidation: boolean;
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

function DequeVisualization({ state }: { state: DequeStabilityState }) {
  const { dequeData, vectorData, dequePointers, vectorPointers, view, showInvalidation } = state;

  const renderComparison = () => (
    <group>
      {/* Deque visualization */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.2}
          color="#2ed573"
          anchorX="center"
        >
          std::deque - Block-based Storage
        </Text>
        
        {/* Deque blocks (simulate 3-element blocks) */}
        {Array.from({ length: Math.ceil(dequeData.length / 3) }, (_, blockIndex) => (
          <group key={`deque-block-${blockIndex}`} position={[blockIndex * 2.5 - Math.ceil(dequeData.length / 3) * 1.25, 0, 0]}>
            {/* Block container */}
            <Box args={[2.2, 0.8, 0.1]} position={[0, 0, -0.1]}>
              <meshStandardMaterial color="#2ed573" transparent opacity={0.2} />
            </Box>
            
            {/* Elements in this block */}
            {dequeData.slice(blockIndex * 3, (blockIndex + 1) * 3).map((value, elemIndex) => {
              const globalIndex = blockIndex * 3 + elemIndex;
              return (
                <group key={`deque-elem-${globalIndex}`} position={[elemIndex * 0.7 - 0.7, 0, 0]}>
                  <Box args={[0.6, 0.6, 0.3]}>
                    <meshStandardMaterial color="#2ed573" transparent opacity={0.8} />
                  </Box>
                  <Text
                    position={[0, 0, 0.2]}
                    fontSize={0.15}
                    color="white"
                    anchorX="center"
                  >
                    {value}
                  </Text>
                  <Text
                    position={[0, -0.4, 0]}
                    fontSize={0.1}
                    color="#ffa500"
                    anchorX="center"
                  >
                    [{globalIndex}]
                  </Text>
                </group>
              );
            })}
            
            {/* Block label */}
            <Text
              position={[0, -0.8, 0]}
              fontSize={0.1}
              color="#2ed573"
              anchorX="center"
            >
              Block {blockIndex}
            </Text>
          </group>
        ))}
        
        {/* Deque pointers */}
        {dequePointers.map((ptr, index) => (
          <group key={`deque-ptr-${ptr.name}`} position={[0, 1.5, 0]}>
            <Box args={[0.2, 0.2, 0.2]} position={[ptr.index * 0.7 - dequeData.length * 0.35, 0, 0]}>
              <meshStandardMaterial color={ptr.valid ? ptr.color : '#ff4757'} />
            </Box>
            <Text
              position={[ptr.index * 0.7 - dequeData.length * 0.35, 0.3, 0]}
              fontSize={0.1}
              color={ptr.valid ? ptr.color : '#ff4757'}
              anchorX="center"
            >
              {ptr.name}
            </Text>
            {!ptr.valid && (
              <Text
                position={[ptr.index * 0.7 - dequeData.length * 0.35, -0.3, 0]}
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
      
      {/* Vector visualization */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.2}
          color="#ff6b7a"
          anchorX="center"
        >
          std::vector - Contiguous Storage
        </Text>
        
        {/* Vector elements */}
        {vectorData.map((value, index) => (
          <group key={`vector-elem-${index}`} position={[index * 0.7 - vectorData.length * 0.35, 0, 0]}>
            <Box args={[0.6, 0.6, 0.3]}>
              <meshStandardMaterial color="#ff6b7a" transparent opacity={0.8} />
            </Box>
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.15}
              color="white"
              anchorX="center"
            >
              {value}
            </Text>
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
        
        {/* Vector contiguous memory indicator */}
        <Box 
          args={[vectorData.length * 0.7 + 0.1, 0.8, 0.1]} 
          position={[0, 0, -0.1]}
        >
          <meshStandardMaterial color="#ff6b7a" transparent opacity={0.2} />
        </Box>
        
        {/* Vector pointers */}
        {vectorPointers.map((ptr, index) => (
          <group key={`vector-ptr-${ptr.name}`} position={[0, 1.5, 0]}>
            <Box args={[0.2, 0.2, 0.2]} position={[ptr.index * 0.7 - vectorData.length * 0.35, 0, 0]}>
              <meshStandardMaterial color={ptr.valid ? ptr.color : '#ff4757'} />
            </Box>
            <Text
              position={[ptr.index * 0.7 - vectorData.length * 0.35, 0.3, 0]}
              fontSize={0.1}
              color={ptr.valid ? ptr.color : '#ff4757'}
              anchorX="center"
            >
              {ptr.name}
            </Text>
            {!ptr.valid && (
              <Text
                position={[ptr.index * 0.7 - vectorData.length * 0.35, -0.3, 0]}
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

  const renderDequeBlocks = () => {
    const blocksCount = Math.ceil(dequeData.length / 3);
    
    return (
      <group>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.25}
          color="#2ed573"
          anchorX="center"
        >
          Deque Internal Block Structure
        </Text>
        
        {/* Map/index structure */}
        <group position={[0, 1.5, 0]}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.15}
            color="#00d4ff"
            anchorX="center"
          >
            Block Index Map
          </Text>
          
          {Array.from({ length: blocksCount }, (_, index) => (
            <group key={`map-${index}`} position={[index * 0.8 - blocksCount * 0.4, 0, 0]}>
              <Box args={[0.6, 0.3, 0.2]}>
                <meshStandardMaterial color="#00d4ff" transparent opacity={0.7} />
              </Box>
              <Text
                position={[0, 0, 0.15]}
                fontSize={0.1}
                color="white"
                anchorX="center"
              >
                Blk{index}
              </Text>
              
              {/* Arrow to actual block */}
              <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.1, 0.3]} />
                <meshStandardMaterial color="#00d4ff" />
              </mesh>
            </group>
          ))}
        </group>
        
        {/* Actual data blocks */}
        <group position={[0, 0, 0]}>
          {Array.from({ length: blocksCount }, (_, blockIndex) => (
            <group key={`block-${blockIndex}`} position={[blockIndex * 2.5 - blocksCount * 1.25, 0, 0]}>
              {/* Block memory */}
              <Box args={[2.2, 1, 0.2]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#2ed573" transparent opacity={0.3} />
              </Box>
              
              {/* Elements in block */}
              {dequeData.slice(blockIndex * 3, (blockIndex + 1) * 3).map((value, elemIndex) => {
                const globalIndex = blockIndex * 3 + elemIndex;
                return (
                  <group key={`elem-${globalIndex}`} position={[elemIndex * 0.7 - 0.7, 0, 0.15]}>
                    <Box args={[0.6, 0.8, 0.3]}>
                      <meshStandardMaterial color="#2ed573" />
                    </Box>
                    <Text
                      position={[0, 0, 0.2]}
                      fontSize={0.12}
                      color="white"
                      anchorX="center"
                    >
                      {value}
                    </Text>
                  </group>
                );
              })}
              
              <Text
                position={[0, -0.8, 0]}
                fontSize={0.12}
                color="#2ed573"
                anchorX="center"
              >
                Block {blockIndex} (3 elements max)
              </Text>
            </group>
          ))}
        </group>
        
        {/* Iterator stability explanation */}
        <group position={[0, -1.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="#00d4ff"
            anchorX="center"
          >
            ✅ Iterators remain valid during push_front/push_back
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.12}
            color="#888"
            anchorX="center"
          >
            Only invalidated by insert/erase in middle
          </Text>
        </group>
      </group>
    );
  };

  const renderStabilityTest = () => {
    const operations = [
      { name: 'push_front', deque: '✅ Stable', vector: '❌ No push_front' },
      { name: 'push_back', deque: '✅ Stable', vector: '❌ May invalidate' },
      { name: 'pop_front', deque: '✅ Stable', vector: '❌ No pop_front' },
      { name: 'pop_back', deque: '✅ Stable', vector: '✅ Stable' },
      { name: 'insert(middle)', deque: '❌ Invalidates', vector: '❌ Invalidates' },
    ];
    return (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.25}
        color="#ffa500"
        anchorX="center"
      >
        Iterator Stability Comparison
      </Text>
      
      {/* Stability matrix */}
      <group position={[0, 1, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.18}
          color="#00d4ff"
          anchorX="center"
        >
          Operation Effects on Iterators
        </Text>
        
        {/* Headers */}
        <Text position={[-2, 0.5, 0]} fontSize={0.12} color="#00d4ff" anchorX="center">Operation</Text>
        <Text position={[-0.5, 0.5, 0]} fontSize={0.12} color="#2ed573" anchorX="center">std::deque</Text>
        <Text position={[1, 0.5, 0]} fontSize={0.12} color="#ff6b7a" anchorX="center">std::vector</Text>
        {operations.map((op, index) => (
          <group key={op.name} position={[0, 0.2 - index * 0.25, 0]}>
            <Text position={[-2, 0, 0]} fontSize={0.1} color="white" anchorX="center">{op.name}</Text>
            <Text position={[-0.5, 0, 0]} fontSize={0.1} color="#2ed573" anchorX="center">{op.deque}</Text>
            <Text position={[1, 0, 0]} fontSize={0.1} color="#ff6b7a" anchorX="center">{op.vector}</Text>
          </group>
        ))}
      </group>
      
      {/* Current operation highlight */}
      {showInvalidation && (
        <group position={[0, -1.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color="#ff4757"
            anchorX="center"
          >
            ⚠️ VECTOR REALLOCATION
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.15}
            color="#ff6b7a"
            anchorX="center"
          >
            Vector iterators invalidated, deque iterators stable
          </Text>
        </group>
      )}
    </group>
  );
  };

  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {view === 'comparison' && renderComparison()}
      {view === 'deque_blocks' && renderDequeBlocks()}
      {view === 'stability_test' && renderStabilityTest()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson27_DequeStability: React.FC = () => {
  const [state, setState] = useState<DequeStabilityState>({
    dequeData: [10, 20, 30, 40],
    vectorData: [10, 20, 30, 40],
    dequePointers: [
      { name: 'it_d', index: 1, valid: true, color: '#2ed573' },
      { name: 'ptr_d', index: 2, valid: true, color: '#00d4ff' }
    ],
    vectorPointers: [
      { name: 'it_v', index: 1, valid: true, color: '#ff6b7a' },
      { name: 'ptr_v', index: 2, valid: true, color: '#ffa500' }
    ],
    operation: 'push_front',
    operationValue: 5,
    insertPosition: 2,
    view: 'comparison',
    showInvalidation: false
  });

  const willInvalidateVector = () => {
    switch (state.operation) {
      case 'push_back':
        return true; // Assume it may cause reallocation
      case 'insert_middle':
        return true;
      default:
        return false;
    }
  };

  const willInvalidateDeque = () => {
    switch (state.operation) {
      case 'insert_middle':
        return true;
      default:
        return false;
    }
  };

  const performOperation = () => {
    setState(prev => {
      let newDequeData = [...prev.dequeData];
      let newVectorData = [...prev.vectorData];
      
      const vectorInvalidation = willInvalidateVector();
      const dequeInvalidation = willInvalidateDeque();

      switch (prev.operation) {
        case 'push_front':
          newDequeData.unshift(prev.operationValue);
          // Vector doesn't have push_front - simulate with insert at beginning
          newVectorData.unshift(prev.operationValue);
          break;
        case 'push_back':
          newDequeData.push(prev.operationValue);
          newVectorData.push(prev.operationValue);
          break;
        case 'insert_middle':
          newDequeData.splice(prev.insertPosition, 0, prev.operationValue);
          newVectorData.splice(prev.insertPosition, 0, prev.operationValue);
          break;
        case 'pop_front':
          newDequeData.shift();
          newVectorData.shift();
          break;
        case 'pop_back':
          newDequeData.pop();
          newVectorData.pop();
          break;
      }

      // Update pointer validity
      const newDequePointers = prev.dequePointers.map(ptr => ({
        ...ptr,
        valid: !dequeInvalidation && ptr.index < newDequeData.length
      }));

      const newVectorPointers = prev.vectorPointers.map(ptr => ({
        ...ptr,
        valid: !vectorInvalidation && ptr.index < newVectorData.length
      }));

      return {
        ...prev,
        dequeData: newDequeData,
        vectorData: newVectorData,
        dequePointers: newDequePointers,
        vectorPointers: newVectorPointers,
        showInvalidation: vectorInvalidation || dequeInvalidation
      };
    });
  };

  const resetContainers = () => {
    setState(prev => ({
      ...prev,
      dequeData: [10, 20, 30, 40],
      vectorData: [10, 20, 30, 40],
      dequePointers: [
        { name: 'it_d', index: 1, valid: true, color: '#2ed573' },
        { name: 'ptr_d', index: 2, valid: true, color: '#00d4ff' }
      ],
      vectorPointers: [
        { name: 'it_v', index: 1, valid: true, color: '#ff6b7a' },
        { name: 'ptr_v', index: 2, valid: true, color: '#ffa500' }
      ],
      showInvalidation: false
    }));
  };

  const getCurrentCode = () => {
    const operations = {
      push_front: `deque.push_front(${state.operationValue});
// vector has no push_front - use insert(begin(), value)
vec.insert(vec.begin(), ${state.operationValue});`,
      push_back: `deque.push_back(${state.operationValue});
vec.push_back(${state.operationValue});`,
      insert_middle: `deque.insert(deque.begin() + ${state.insertPosition}, ${state.operationValue});
vec.insert(vec.begin() + ${state.insertPosition}, ${state.operationValue});`,
      pop_front: `deque.pop_front();
// vector has no pop_front - use erase(begin())
vec.erase(vec.begin());`,
      pop_back: `deque.pop_back();
vec.pop_back();`
    };

    return `std::deque<int> deque = {${state.dequeData.join(', ')}};
std::vector<int> vec = {${state.vectorData.join(', ')}};

// Store iterators BEFORE operation
auto it_deque = deque.begin() + 1;
auto it_vector = vec.begin() + 1;

${operations[state.operation]}

// Iterator validity after operation:
// deque iterator: ${willInvalidateDeque() ? 'INVALIDATED' : 'VALID'}
// vector iterator: ${willInvalidateVector() ? 'INVALIDATED' : 'VALID'}`;
  };

  return (
    <Container>
      <Header>
        <Title>🔄 Deque vs Vector Stability</Title>
        <Subtitle>Comparing iterator stability between std::deque and std::vector</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Container Stability Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>Iterator Stability</strong><br/>
            std::deque provides better iterator stability than std::vector for front/back operations
            due to its block-based storage design.
          </StatusDisplay>

          <h4>🏗️ Storage Architecture</h4>
          <Grid>
            <InfoCard>
              <h4>std::deque Structure</h4>
              <CodeBlock>{[
                '// Block-based storage',
                'struct deque {',
                '    Block** map;           // Array of block pointers',
                '    iterator begin_iter;   // Points to first element',
                '    iterator end_iter;     // Points past last element',
                '};',
                '',
                '// Each block: fixed size array',
                'struct Block {',
                '    T elements[BLOCK_SIZE];  // Usually 512 bytes / sizeof(T)',
                '};',
                '',
                '// Non-contiguous but efficient random access',
              ].join('\n')}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>std::vector Structure</h4>
              <CodeBlock>{[
                '// Contiguous storage',
                'struct vector {',
                '    T* data;        // Start of array',
                '    T* finish;      // End of used elements',
                '    T* end_cap;     // End of allocated memory',
                '};',
                '',
                '// Reallocation when size() == capacity()',
                '// Invalidates ALL iterators/pointers/references',
              ].join('\n')}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Stability Guarantees</h4>
          <Grid>
            <InfoCard>
              <h4>std::deque Guarantees</h4>
              <CodeBlock>{[
                '// STABLE operations (no invalidation):',
                'deque.push_front(value);   // ✅ Always stable',
                'deque.push_back(value);    // ✅ Always stable',
                'deque.pop_front();         // ✅ Always stable',
                'deque.pop_back();          // ✅ Always stable',
                '',
                '// INVALIDATING operations:',
                'deque.insert(middle, val); // ❌ Invalidates ALL',
                'deque.erase(middle);       // ❌ Invalidates ALL',
              ].join('\n')}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>std::vector Guarantees</h4>
              <CodeBlock>{[
                '// STABLE operations:',
                'vec.pop_back();            // ✅ Only invalidates end()',
                '',
                '// POTENTIALLY INVALIDATING:',
                'vec.push_back(value);      // ❌ May reallocate',
                'vec.insert(pos, value);    // ❌ May reallocate or shift',
                'vec.resize(new_size);      // ❌ May reallocate',
                '',
                '// NO EQUIVALENT:',
                "// vec.push_front();       // Doesn't exist!",
                "// vec.pop_front();        // Doesn't exist!",
              ].join('\n')}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>🎯 Performance Characteristics</h4>
          <CodeBlock>{[
            '// Operation complexities:',
            '                    deque           vector',
            'push_front():      O(1) amortized  O(n) via insert()',
            'push_back():       O(1) amortized  O(1) amortized',
            'random_access:     O(1)            O(1)',
            'memory_overhead:   Higher          Lower',
            'cache_locality:    Lower           Higher',
            '',
            '// Use deque when:',
            '// - Need efficient front insertion/deletion',
            '// - Iterator stability is important',
            '// - Random access needed (vs list)',
            '',
            '// Use vector when:',
            '// - Maximum cache performance needed',
            '// - Memory usage is critical',
            '// - Only back insertion/deletion needed',
          ].join('\n')}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current State</h4>
            <StatusDisplay $type={state.showInvalidation ? 'warning' : 'success'}>
              <strong>Operation:</strong> {state.operation}<br/>
              <strong>Deque Iterators:</strong> {state.dequePointers.filter(p => p.valid).length}/{state.dequePointers.length} valid<br/>
              <strong>Vector Iterators:</strong> {state.vectorPointers.filter(p => p.valid).length}/{state.vectorPointers.length} valid<br/>
              {state.showInvalidation && <strong>⚠️ Some iterators invalidated!</strong>}
            </StatusDisplay>
            
            <h4>💻 Code Comparison</h4>
            <CodeBlock>{getCurrentCode()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <DequeVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Container Operations</h4>
            
            <div>
              <strong>View Mode:</strong><br/>
              <Button 
                $variant={state.view === 'comparison' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, view: 'comparison' }))}
              >
                Side-by-Side
              </Button>
              <Button 
                $variant={state.view === 'deque_blocks' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, view: 'deque_blocks' }))}
              >
                Deque Blocks
              </Button>
              <Button 
                $variant={state.view === 'stability_test' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, view: 'stability_test' }))}
              >
                Stability Matrix
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
                <option value="push_front">push_front() - deque only</option>
                <option value="push_back">push_back()</option>
                <option value="insert_middle">insert(middle)</option>
                <option value="pop_front">pop_front() - deque only</option>
                <option value="pop_back">pop_back()</option>
              </select>
              
              {(state.operation === 'push_front' || state.operation === 'push_back' || 
                state.operation === 'insert_middle') && (
                <Input 
                  type="number"
                  value={state.operationValue}
                  onChange={(e) => setState(prev => ({ ...prev, operationValue: parseInt(e.target.value) || 0 }))}
                  placeholder="value"
                />
              )}
              
              {state.operation === 'insert_middle' && (
                <Input 
                  type="number"
                  min="0"
                  max={state.dequeData.length}
                  value={state.insertPosition}
                  onChange={(e) => setState(prev => ({ ...prev, insertPosition: parseInt(e.target.value) || 0 }))}
                  placeholder="position"
                />
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                onClick={performOperation}
                $variant={willInvalidateVector() || willInvalidateDeque() ? 'danger' : 'primary'}
              >
                {willInvalidateVector() || willInvalidateDeque() ? 
                  '⚠️ Execute (Will Invalidate!)' : 
                  '✅ Execute Operation'
                }
              </Button>
              
              <Button onClick={resetContainers}>
                🔄 Reset Containers
              </Button>
            </div>

            <StatusDisplay $type="info">
              <strong>Key Differences:</strong><br/>
              • <Highlight $color="#2ed573">deque</Highlight>: Better iterator stability for front/back ops<br/>
              • <Highlight $color="#ff6b7a">vector</Highlight>: Better cache locality, less memory overhead<br/>
              • <Highlight>Choice depends on usage pattern and stability requirements</Highlight>
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson27_DequeStability;
