import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface SpanState {
  sourceType: 'array' | 'vector' | 'string' | 'custom';
  spanOffset: number;
  spanSize: number;
  sourceData: any[];
  showSubspan: boolean;
  subspanStart: number;
  subspanCount: number;
  demonstration: 'basic' | 'bounds_check' | 'iteration' | 'conversion';
  spanView: 'full' | 'first' | 'last' | 'subspan';
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

function SpanVisualization({ state }: { state: SpanState }) {
  const { sourceData, spanOffset, spanSize, showSubspan, subspanStart, subspanCount, spanView } = state;
  
  const getSpanData = () => {
    const fullSpan = sourceData.slice(spanOffset, spanOffset + spanSize);
    
    switch (spanView) {
      case 'first':
        return fullSpan.slice(0, Math.min(3, fullSpan.length));
      case 'last':
        return fullSpan.slice(-Math.min(3, fullSpan.length));
      case 'subspan':
        return showSubspan ? fullSpan.slice(subspanStart, subspanStart + subspanCount) : fullSpan;
      default:
        return fullSpan;
    }
  };

  const spanData = getSpanData();
  const isSubspanActive = showSubspan && spanView === 'subspan';

  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Original source container */}
      <group position={[0, 2, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.25}
          color="#ffa500"
          anchorX="center"
        >
          Source Container ({state.sourceType})
        </Text>
        
        {/* Source data visualization */}
        {sourceData.map((item, index) => {
          const isInSpan = index >= spanOffset && index < spanOffset + spanSize;
          const isInSubspan = isSubspanActive && 
                             index >= spanOffset + subspanStart && 
                             index < spanOffset + subspanStart + subspanCount;
          
          return (
            <group key={`source-${index}`} position={[index * 0.8 - (sourceData.length * 0.8) / 2, 0, 0]}>
              <Box args={[0.6, 0.6, 0.3]}>
                <meshStandardMaterial 
                  color={
                    isInSubspan ? '#ff4757' :
                    isInSpan ? '#2ed573' : 
                    '#57606f'
                  }
                  transparent
                  opacity={0.7}
                />
              </Box>
              
              <Text
                position={[0, 0, 0.2]}
                fontSize={0.15}
                color="white"
                anchorX="center"
              >
                {item}
              </Text>
              
              <Text
                position={[0, -0.4, 0]}
                fontSize={0.1}
                color="#888"
                anchorX="center"
              >
                [{index}]
              </Text>
            </group>
          );
        })}
      </group>
      
      {/* Span view */}
      <group position={[0, -1, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.25}
          color="#00d4ff"
          anchorX="center"
        >
          span&lt;T&gt; View {isSubspanActive ? '(subspan)' : ''}
        </Text>
        
        {/* Span boundary box */}
        <Box 
          args={[spanData.length * 0.8 + 0.2, 0.8, 0.1]} 
          position={[0, 0, -0.1]}
        >
          <meshStandardMaterial color="#00d4ff" transparent opacity={0.2} />
        </Box>
        
        {/* Span data */}
        {spanData.map((item, index) => (
          <group key={`span-${index}`} position={[index * 0.8 - (spanData.length * 0.8) / 2, 0, 0]}>
            <Box args={[0.6, 0.6, 0.3]}>
              <meshStandardMaterial 
                color={isSubspanActive ? '#ff4757' : '#00d4ff'}
                transparent
                opacity={0.8}
              />
            </Box>
            
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.15}
              color="white"
              anchorX="center"
            >
              {item}
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
        
        {/* Span metadata */}
        <group position={[0, -1.2, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.12}
            color="#00d4ff"
            anchorX="center"
          >
            size(): {spanData.length} | data(): 0x{(0x1000 + spanOffset * 4).toString(16)}
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.12}
            color="#00d4ff"
            anchorX="center"
          >
            {isSubspanActive ? `subspan(${subspanStart}, ${subspanCount})` : `span(offset: ${spanOffset}, size: ${spanSize})`}
          </Text>
        </group>
      </group>
      
      {/* Connection lines */}
      {sourceData.map((_, index) => {
        const isInSpan = index >= spanOffset && index < spanOffset + spanSize;
        if (!isInSpan) return null;
        
        const sourceX = index * 0.8 - (sourceData.length * 0.8) / 2;
        const spanIndex = index - spanOffset;
        const spanX = spanIndex * 0.8 - (spanData.length * 0.8) / 2;
        
        return (
          <mesh key={`line-${index}`} position={[sourceX, 0.5, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 2]} />
            <meshStandardMaterial color="#00d4ff" transparent opacity={0.5} />
          </mesh>
        );
      })}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson25_Span: React.FC = () => {
  const [state, setState] = useState<SpanState>({
    sourceType: 'array',
    spanOffset: 1,
    spanSize: 4,
    sourceData: [10, 20, 30, 40, 50, 60],
    showSubspan: false,
    subspanStart: 1,
    subspanCount: 2,
    demonstration: 'basic',
    spanView: 'full'
  });

  const getSourceData = (type: typeof state.sourceType) => {
    switch (type) {
      case 'array':
        return [10, 20, 30, 40, 50, 60];
      case 'vector':
        return [1, 4, 9, 16, 25, 36, 49];
      case 'string':
        return ['H', 'e', 'l', 'l', 'o', '!'];
      case 'custom':
        return [0.1, 0.2, 0.4, 0.8, 1.6, 3.2];
      default:
        return [10, 20, 30, 40, 50, 60];
    }
  };

  const handleSourceTypeChange = (type: typeof state.sourceType) => {
    const newData = getSourceData(type);
    setState(prev => ({
      ...prev,
      sourceType: type,
      sourceData: newData,
      spanOffset: Math.min(prev.spanOffset, newData.length - 1),
      spanSize: Math.min(prev.spanSize, newData.length - prev.spanOffset)
    }));
  };

  const createSubspan = () => {
    setState(prev => ({
      ...prev,
      showSubspan: true,
      spanView: 'subspan'
    }));
  };

  const resetSpan = () => {
    setState(prev => ({
      ...prev,
      spanOffset: 0,
      spanSize: prev.sourceData.length,
      showSubspan: false,
      spanView: 'full'
    }));
  };

  const getCurrentCode = () => {
    const { sourceType, spanOffset, spanSize, showSubspan, subspanStart, subspanCount } = state;
    
    const sourceCode = {
      array: `int arr[] = {${state.sourceData.join(', ')}};`,
      vector: `std::vector<int> vec = {${state.sourceData.join(', ')}};`,
      string: `std::string str = "${state.sourceData.join('')}";`,
      custom: `std::array<double, ${state.sourceData.length}> data = {${state.sourceData.join(', ')}};`
    };

    const spanCreation = {
      array: `std::span<int> span(arr + ${spanOffset}, ${spanSize});`,
      vector: `std::span<int> span(vec.data() + ${spanOffset}, ${spanSize});`,
      string: `std::span<char> span(str.data() + ${spanOffset}, ${spanSize});`,
      custom: `std::span<double> span(data.data() + ${spanOffset}, ${spanSize});`
    };

    return `${sourceCode[sourceType]}
${spanCreation[sourceType]}

// span.size() = ${state.spanSize}
// span.data() = ${sourceType} + ${spanOffset}
${showSubspan ? `\n// Create subspan\nauto sub = span.subspan(${subspanStart}, ${subspanCount});` : ''}`;
  };

  const isValidSpan = state.spanOffset + state.spanSize <= state.sourceData.length;
  const isValidSubspan = state.subspanStart + state.subspanCount <= state.spanSize;

  return (
    <Container>
      <Header>
        <Title>📊 std::span&lt;T&gt;</Title>
        <Subtitle>Non-owning view over contiguous memory sequences</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 std::span Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>std::span&lt;T&gt;</strong><br/>
            A lightweight, non-owning view over a contiguous sequence of objects.
            Zero-cost abstraction for array-like access.
          </StatusDisplay>

          <h4>🎯 Key Properties</h4>
          <Grid>
            <InfoCard>
              <h4>Non-owning View</h4>
              <CodeBlock>{`// std::span doesn't own data
std::span<int> span(data, size);

// Just stores pointer + size
class span<T> {
    T* data_;
    size_t size_;
};

// No allocation, no deallocation`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Multiple Sources</h4>
              <CodeBlock>{`int arr[5] = {1, 2, 3, 4, 5};
std::vector<int> vec = {1, 2, 3, 4, 5};
std::array<int, 5> arr2 = {1, 2, 3, 4, 5};

// All can create spans
std::span<int> s1(arr);
std::span<int> s2(vec);  
std::span<int> s3(arr2);`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Subspan Operations</h4>
              <CodeBlock>{`std::span<int> full(data, 10);

// Subspan from index 2, size 5
auto sub1 = full.subspan(2, 5);

// First 3 elements
auto first = full.first(3);

// Last 3 elements  
auto last = full.last(3);`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Range-based Access</h4>
              <CodeBlock>{`std::span<int> span(data, size);

// Iterator support
for (auto& elem : span) {
    elem *= 2;
}

// Index access
span[0] = 42;
span.at(1) = 84;  // bounds checked

// Raw pointer access
int* ptr = span.data();`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Advanced Usage</h4>
          <CodeBlock>{`// Function parameter - accepts any contiguous container
void process(std::span<const int> data) {
    for (auto value : data) {
        std::cout << value << " ";
    }
}

// Usage
int arr[] = {1, 2, 3};
std::vector<int> vec = {4, 5, 6};
std::array<int, 3> arr2 = {7, 8, 9};

process(arr);   // Works
process(vec);   // Works  
process(arr2);  // Works

// Dynamic extent vs fixed extent
std::span<int> dynamic_span(data, size);           // std::span<int, std::dynamic_extent>
std::span<int, 5> fixed_span(data);               // Fixed size known at compile time

// Bounds checking
#ifdef _DEBUG
    span.at(index);  // Throws on out of bounds
#else
    span[index];     // No bounds check in release
#endif`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current Span State</h4>
            <StatusDisplay $type={isValidSpan ? 'success' : 'error'}>
              <strong>Source:</strong> {state.sourceType} with {state.sourceData.length} elements<br/>
              <strong>Span:</strong> offset {state.spanOffset}, size {state.spanSize}<br/>
              <strong>Valid:</strong> {isValidSpan ? 'Yes' : 'No - exceeds source bounds'}<br/>
              {state.showSubspan && (
                <>
                  <strong>Subspan:</strong> start {state.subspanStart}, count {state.subspanCount}<br/>
                  <strong>Subspan Valid:</strong> {isValidSubspan ? 'Yes' : 'No - exceeds span bounds'}
                </>
              )}
            </StatusDisplay>
            
            <h4>💻 Generated Code</h4>
            <CodeBlock>{getCurrentCode()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <SpanVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Span Controls</h4>
            
            <div>
              <strong>Source Container:</strong><br/>
              <Button 
                $variant={state.sourceType === 'array' ? 'primary' : 'secondary'}
                onClick={() => handleSourceTypeChange('array')}
              >
                int[] array
              </Button>
              <Button 
                $variant={state.sourceType === 'vector' ? 'primary' : 'secondary'}
                onClick={() => handleSourceTypeChange('vector')}
              >
                std::vector
              </Button>
              <Button 
                $variant={state.sourceType === 'string' ? 'primary' : 'secondary'}
                onClick={() => handleSourceTypeChange('string')}
              >
                std::string
              </Button>
              <Button 
                $variant={state.sourceType === 'custom' ? 'primary' : 'secondary'}
                onClick={() => handleSourceTypeChange('custom')}
              >
                std::array
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Span Configuration:</strong><br/>
              <label>Offset: </label>
              <Input 
                type="number"
                min="0"
                max={state.sourceData.length - 1}
                value={state.spanOffset}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  spanOffset: Math.max(0, Math.min(parseInt(e.target.value) || 0, prev.sourceData.length - 1))
                }))}
              />
              <label>Size: </label>
              <Input 
                type="number"
                min="1"
                max={state.sourceData.length - state.spanOffset}
                value={state.spanSize}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  spanSize: Math.max(1, Math.min(parseInt(e.target.value) || 1, prev.sourceData.length - prev.spanOffset))
                }))}
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Span Views:</strong><br/>
              <Button 
                $variant={state.spanView === 'full' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, spanView: 'full', showSubspan: false }))}
              >
                Full span
              </Button>
              <Button 
                $variant={state.spanView === 'first' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, spanView: 'first', showSubspan: false }))}
              >
                span.first(3)
              </Button>
              <Button 
                $variant={state.spanView === 'last' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, spanView: 'last', showSubspan: false }))}
              >
                span.last(3)
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Subspan Operations:</strong><br/>
              <label>Start: </label>
              <Input 
                type="number"
                min="0"
                max={state.spanSize - 1}
                value={state.subspanStart}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  subspanStart: Math.max(0, Math.min(parseInt(e.target.value) || 0, prev.spanSize - 1))
                }))}
              />
              <label>Count: </label>
              <Input 
                type="number"
                min="1"
                max={state.spanSize - state.subspanStart}
                value={state.subspanCount}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  subspanCount: Math.max(1, Math.min(parseInt(e.target.value) || 1, prev.spanSize - prev.subspanStart))
                }))}
              />
              <Button onClick={createSubspan}>
                Create Subspan
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button onClick={resetSpan}>
                🔄 Reset to Full Span
              </Button>
            </div>

            <StatusDisplay $type="info">
              <strong>Current View:</strong> {
                state.showSubspan && state.spanView === 'subspan' ? 'Subspan' :
                state.spanView === 'first' ? 'First 3 elements' :
                state.spanView === 'last' ? 'Last 3 elements' :
                'Full span'
              }<br/>
              <strong>Elements Visible:</strong> {
                state.showSubspan && state.spanView === 'subspan' ? state.subspanCount :
                state.spanView === 'first' ? Math.min(3, state.spanSize) :
                state.spanView === 'last' ? Math.min(3, state.spanSize) :
                state.spanSize
              }<br/>
              <strong>Zero-cost:</strong> <Highlight>No dynamic allocation, just pointer + size</Highlight>
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson25_Span;