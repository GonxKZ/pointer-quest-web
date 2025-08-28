import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { THREE } from '../utils/three';
import {
  LessonLayout,
  TheoryPanel,
  VisualizationPanel,
  Section,
  SectionTitle,
  CodeBlock,
  InteractiveSection,
  ButtonGroup,
  theme
} from '../design-system';



interface PointerArithmeticState {
  array: number[];
  currentIndex: number;
  pointerOffset: number;
  operation: 'increment' | 'decrement' | 'add' | 'subtract' | 'compare';
  operationValue: number;
  showUB: boolean;
  ubType: 'out_of_bounds' | 'negative' | 'far_access' | 'null_arithmetic';
  arrayType: 'stack_array' | 'heap_array' | 'vector_data';
  visualization: 'linear' | 'memory_layout' | 'bounds_check';
}























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





const Highlight = styled.span<{ $color?: string }>`
  color: ${props => props.$color || '#00d4ff'};
  font-weight: bold;
`;



function ArrayVisualization({ state }: { state: PointerArithmeticState }) {
  const { array, currentIndex, pointerOffset, showUB, visualization } = state;
  
  const isValidIndex = (index: number) => index >= 0 && index < array.length;
  const currentPointerIndex = currentIndex + pointerOffset;
  
  const renderArrayLinear = () => (
    <group>
      {/* Array elements */}
      {array.map((value, index) => (
        <group key={index} position={[index * 1.2 - (array.length * 1.2) / 2, 0, 0]}>
          {/* Array element box */}
          <Box args={[1, 0.8, 0.3]}>
            <meshStandardMaterial 
              color={
                index === currentPointerIndex && !isValidIndex(currentPointerIndex) ? '#ff4757' :
                index === currentPointerIndex ? '#00d4ff' :
                index === currentIndex ? '#2ed573' :
                '#57606f'
              }
              transparent
              opacity={0.8}
            />
          </Box>
          
          {/* Value display */}
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.2}
            color="white"
            anchorX="center"
          >
            {value}
          </Text>
          
          {/* Index label */}
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.15}
            color="#ffa500"
            anchorX="center"
          >
            [{index}]
          </Text>
          
          {/* Address simulation */}
          <Text
            position={[0, -1, 0]}
            fontSize={0.1}
            color="#888"
            anchorX="center"
          >
            {`0x${(0x1000 + index * 4).toString(16)}`}
          </Text>
        </group>
      ))}
      
      {/* Current pointer indicator */}
      <group position={[currentPointerIndex * 1.2 - (array.length * 1.2) / 2, 1.5, 0]}>
        <Box args={[0.3, 0.3, 0.3]}>
          <meshStandardMaterial 
            color={isValidIndex(currentPointerIndex) ? '#00d4ff' : '#ff4757'} 
          />
        </Box>
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.12}
          color={isValidIndex(currentPointerIndex) ? '#00d4ff' : '#ff4757'}
          anchorX="center"
        >
          ptr
        </Text>
        
        {/* Arrow pointing down */}
        <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.15, 0.4]} />
          <meshStandardMaterial 
            color={isValidIndex(currentPointerIndex) ? '#00d4ff' : '#ff4757'} 
          />
        </mesh>
      </group>
      
      {/* UB indicator */}
      {showUB && !isValidIndex(currentPointerIndex) && (
        <group position={[currentPointerIndex * 1.2 - (array.length * 1.2) / 2, -1.8, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color="#ff4757"
            anchorX="center"
          >
            ⚠️ UNDEFINED BEHAVIOR
          </Text>
        </group>
      )}
      
      {/* Bounds indicators */}
      <group position={[-1 - (array.length * 1.2) / 2, 0, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.15}
          color="#ff4757"
          anchorX="center"
        >
          ← UB Zone
        </Text>
      </group>
      
      <group position={[array.length * 1.2 - (array.length * 1.2) / 2, 0, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.15}
          color="#ff4757"
          anchorX="center"
        >
          UB Zone →
        </Text>
      </group>
    </group>
  );

  const renderMemoryLayout = () => (
    <group>
      {/* Memory blocks with byte-level detail */}
      {array.map((value, index) => (
        <group key={index} position={[index * 1.5 - (array.length * 1.5) / 2, 0, 0]}>
          {/* 4-byte int representation */}
          {[0, 1, 2, 3].map(byteIndex => (
            <Box 
              key={byteIndex}
              args={[0.3, 0.3, 0.3]}
              position={[byteIndex * 0.35 - 0.525, 0, 0]}
            >
              <meshStandardMaterial 
                color={
                  index === currentPointerIndex ? '#00d4ff' :
                  index === currentIndex ? '#2ed573' :
                  '#57606f'
                }
                transparent
                opacity={0.7}
              />
            </Box>
          ))}
          
          {/* Value display */}
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
          >
            {value}
          </Text>
          
          {/* Address */}
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.1}
            color="#ffa500"
            anchorX="center"
          >
            {`0x${(0x1000 + index * 4).toString(16)}`}
          </Text>
        </group>
      ))}
      
      {/* Pointer arithmetic visualization */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          ptr + {pointerOffset} = ptr + {pointerOffset} * sizeof(int) = ptr + {pointerOffset * 4} bytes
        </Text>
      </group>
    </group>
  );

  const renderBoundsCheck = () => (
    <group>
      {/* Array with bounds visualization */}
      <group position={[0, 0, 0]}>
        {/* Valid region */}
        <Box args={[array.length * 1.2, 1, 0.1]} position={[0, 0, -0.2]}>
          <meshStandardMaterial color="#2ed573" transparent opacity={0.3} />
        </Box>
        
        {/* Invalid regions */}
        <Box args={[2, 1, 0.1]} position={[-array.length * 0.6 - 1, 0, -0.15]}>
          <meshStandardMaterial color="#ff4757" transparent opacity={0.3} />
        </Box>
        <Box args={[2, 1, 0.1]} position={[array.length * 0.6 + 1, 0, -0.15]}>
          <meshStandardMaterial color="#ff4757" transparent opacity={0.3} />
        </Box>
        
        {/* Array elements */}
        {array.map((value, index) => (
          <group key={index} position={[index * 1.2 - (array.length * 1.2) / 2, 0, 0]}>
            <Box args={[1, 0.8, 0.3]}>
              <meshStandardMaterial 
                color={index === currentPointerIndex ? '#00d4ff' : '#57606f'}
                transparent
                opacity={0.8}
              />
            </Box>
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.2}
              color="white"
              anchorX="center"
            >
              {value}
            </Text>
          </group>
        ))}
        
        {/* Current pointer with bounds checking */}
        <group position={[currentPointerIndex * 1.2 - (array.length * 1.2) / 2, 1.5, 0]}>
          <Box args={[0.4, 0.4, 0.4]}>
            <meshStandardMaterial 
              color={isValidIndex(currentPointerIndex) ? '#2ed573' : '#ff4757'} 
            />
          </Box>
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.12}
            color="white"
            anchorX="center"
          >
            {isValidIndex(currentPointerIndex) ? 'SAFE' : 'UNSAFE'}
          </Text>
        </group>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {visualization === 'linear' && renderArrayLinear()}
      {visualization === 'memory_layout' && renderMemoryLayout()}
      {visualization === 'bounds_check' && renderBoundsCheck()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson24_PointerArithmetic: React.FC = () => {
  const [state, setState] = useState<PointerArithmeticState>({
    array: [10, 20, 30, 40, 50],
    currentIndex: 2,
    pointerOffset: 0,
    operation: 'increment',
    operationValue: 1,
    showUB: false,
    ubType: 'out_of_bounds',
    arrayType: 'stack_array',
    visualization: 'linear'
  });

  const resetArray = () => {
    setState(prev => ({
      ...prev,
      array: [10, 20, 30, 40, 50],
      currentIndex: 2,
      pointerOffset: 0,
      showUB: false
    }));
  };

  const performOperation = () => {
    setState(prev => {
      let newOffset = prev.pointerOffset;
      
      switch (prev.operation) {
        case 'increment':
          newOffset += 1;
          break;
        case 'decrement':
          newOffset -= 1;
          break;
        case 'add':
          newOffset += prev.operationValue;
          break;
        case 'subtract':
          newOffset -= prev.operationValue;
          break;
      }
      
      const resultIndex = prev.currentIndex + newOffset;
      const isUB = resultIndex < 0 || resultIndex >= prev.array.length;
      
      return {
        ...prev,
        pointerOffset: newOffset,
        showUB: isUB
      };
    });
  };

  const demonstrateUB = (ubType: typeof state.ubType) => {
    setState(prev => {
      let newOffset = 0;
      
      switch (ubType) {
        case 'out_of_bounds':
          newOffset = prev.array.length; // One past end
          break;
        case 'negative':
          newOffset = -prev.currentIndex - 1; // Before beginning
          break;
        case 'far_access':
          newOffset = 10; // Far beyond end
          break;
      }
      
      return {
        ...prev,
        pointerOffset: newOffset,
        ubType,
        showUB: true
      };
    });
  };

  const currentPointerIndex = state.currentIndex + state.pointerOffset;
  const isValidAccess = currentPointerIndex >= 0 && currentPointerIndex < state.array.length;

  return (
    <Container>
      <Header>
        <Title>🧮 Pointer Arithmetic</Title>
        <Subtitle>Array pointer arithmetic operations and undefined behavior detection</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <SectionTitle>📚 Pointer Arithmetic Theory</SectionTitle>
<StatusDisplay $type="info">
            <strong>Pointer Arithmetic</strong><br/>
            Allows navigation through arrays using pointer increments, decrements, and offsets.
            Operations are scaled by sizeof(T).
          </StatusDisplay>

          <SectionTitle>🎯 Valid Operations</SectionTitle>
          <Grid>
            <InfoCard>
              <SectionTitle>Basic Operations</SectionTitle>
              <CodeBlock language="cpp">{`int arr[5] = {10, 20, 30, 40, 50};
int* ptr = &arr[2];  // Points to 30

ptr++;        // Points to 40 
ptr--;        // Points to 30
ptr += 2;     // Points to 50
ptr -= 1;     // Points to 40

// Offset access
*(ptr + 1);   // Value at ptr+1
ptr[1];       // Same as *(ptr + 1)`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <SectionTitle>Address Calculation</SectionTitle>
              <CodeBlock language="cpp">{`// ptr + n means:
// ptr + (n * sizeof(T))

int* ptr = arr;
ptr + 1;  // arr + 1*sizeof(int) = arr + 4 bytes
ptr + 2;  // arr + 2*sizeof(int) = arr + 8 bytes

// Not just +1 byte!`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <SectionTitle>Pointer Comparison</SectionTitle>
              <CodeBlock language="cpp">{`int arr[5];
int* p1 = &arr[1];
int* p2 = &arr[3];

bool before = p1 < p2;    // true
ptrdiff_t diff = p2 - p1; // 2 elements

// Only valid within same array
// or one past end`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <SectionTitle>One-Past-End</SectionTitle>
              <CodeBlock language="cpp">{`int arr[5];
int* begin = arr;
int* end = arr + 5;  // One past end - LEGAL

// Legal to create, illegal to dereference
*end;  // UNDEFINED BEHAVIOR

// Standard idiom
for (int* p = begin; p != end; ++p) {
    std::cout << *p << " ";
}`}</CodeBlock>
            </InfoCard>
          </Grid>

          <SectionTitle>⚠️ Undefined Behavior Cases</SectionTitle>
          <CodeBlock language="cpp">{`int arr[5] = {1, 2, 3, 4, 5};
int* ptr = arr + 2;

// UB: Before array start
int* before = arr - 1;  // UB to create
*before;                // UB to dereference

// UB: More than one past end  
int* far = arr + 6;     // UB to create

// UB: Pointer arithmetic on different arrays
int arr2[5];
ptrdiff_t diff = (arr + 2) - (arr2 + 1);  // UB

// UB: Arithmetic on null pointer
int* null_ptr = nullptr;
int* invalid = null_ptr + 1;  // UB`}</CodeBlock>

          <Section>
            <SectionTitle>🔍 Current State</SectionTitle>
            <StatusDisplay $type={isValidAccess ? 'success' : 'error'}>
              <strong>Pointer Position:</strong> arr + {state.currentIndex} + {state.pointerOffset} = arr[{currentPointerIndex}]<br/>
              <strong>Status:</strong> {isValidAccess ? 'Valid Access' : 'UNDEFINED BEHAVIOR'}<br/>
              <strong>Value:</strong> {isValidAccess ? state.array[currentPointerIndex] : 'INVALID'}
            </StatusDisplay>
            
            <SectionTitle>💻 Generated Expression</SectionTitle>
            <CodeBlock>{`int arr[${state.array.length}] = {${state.array.join(', ')}};
int* ptr = &arr[${state.currentIndex}];  // Base pointer

// Current operation:
ptr${state.pointerOffset >= 0 ? '+' : ''}${state.pointerOffset};  // Points to arr[${currentPointerIndex}]

${!isValidAccess ? '// ⚠️ WARNING: This access is UNDEFINED BEHAVIOR!' : ''}
${isValidAccess ? `*ptr = ${state.array[currentPointerIndex]};  // Safe access` : '*ptr;  // UB - undefined behavior!'}`}</CodeBlock>
          </Section>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <ArrayVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <SectionTitle>🎮 Pointer Operations</SectionTitle>
            
            <div>
              <strong>Visualization Mode:</strong><br/>
              <ButtonGroup>
            <Button 
                $variant={state.visualization === 'linear' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, visualization: 'linear' }))}
              >
                Linear View
              </Button>
              <Button 
                $variant={state.visualization === 'memory_layout' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, visualization: 'memory_layout' }))}
              >
                Memory Layout
              </Button>
              <Button 
                $variant={state.visualization === 'bounds_check' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, visualization: 'bounds_check' }))}
              >
                Bounds Check
              </Button>
          </ButtonGroup></div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Basic Operations:</strong><br/>
              <ButtonGroup>
            <Button 
                onClick={() => setState(prev => ({ ...prev, operation: 'increment' }))}
                disabled={!isValidAccess}
              >
                ptr++ (increment)
              </Button>
              <Button 
                onClick={() => setState(prev => ({ ...prev, operation: 'decrement' }))}
                disabled={!isValidAccess}
              >
                ptr-- (decrement)
              </Button>
              <Button onClick={performOperation}>
                Perform Operation
              </Button>
          </ButtonGroup></div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Arithmetic Operations:</strong><br/>
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
                <option value="add">ptr + n</option>
                <option value="subtract">ptr - n</option>
              </select>
              <Input 
                type="number"
                value={state.operationValue}
                onChange={(e) => setState(prev => ({ ...prev, operationValue: parseInt(e.target.value) || 0 }))}
                placeholder="offset"
              />
              <Button onClick={performOperation}>Apply</Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>UB Demonstrations:</strong><br/>
              <ButtonGroup>
            <Button 
                $variant="danger"
                onClick={() => demonstrateUB('out_of_bounds')}
              >
                Past End Access
              </Button>
              <Button 
                $variant="danger"
                onClick={() => demonstrateUB('negative')}
              >
                Before Start
              </Button>
              <Button 
                $variant="danger"
                onClick={() => demonstrateUB('far_access')}
              >
                Far Beyond
              </Button>
          </ButtonGroup></div>

            <div style={{ marginTop: '1rem' }}>
              <Button onClick={resetArray}>
                🔄 Reset Array
              </Button>
            </div>

            <StatusDisplay $type={state.showUB ? 'error' : 'info'}>
              <strong>Current Pointer:</strong> arr + {state.currentIndex} + {state.pointerOffset}<br/>
              <strong>Resulting Index:</strong> [{currentPointerIndex}]<br/>
              <strong>Array Bounds:</strong> [0] to [4]<br/>
              {state.showUB && (
                <>
                  <br/><Highlight $color="#ff4757">⚠️ UNDEFINED BEHAVIOR DETECTED!</Highlight><br/>
                  Accessing outside valid array bounds leads to unpredictable program behavior.
                </>
              )}
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson24_PointerArithmetic;
