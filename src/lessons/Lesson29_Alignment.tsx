import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { THREE } from '../utils/three';

interface AlignmentState {
  structType: 'packed' | 'default' | 'aligned_8' | 'aligned_16' | 'aligned_64';
  showPadding: boolean;
  showCacheLine: boolean;
  selectedMember: string;
  memoryView: 'byte_level' | 'cache_lines' | 'alignment_demo';
  bufferSize: number;
  alignmentRequirement: number;
  currentOffset: number;
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

function AlignmentVisualization({ state }: { state: AlignmentState }) {
  const { structType, showPadding, showCacheLine, memoryView, selectedMember } = state;

  const getStructLayout = () => {
    const layouts = {
      packed: {
        members: [
          { name: 'a', type: 'char', size: 1, offset: 0, alignment: 1 },
          { name: 'b', type: 'int', size: 4, offset: 1, alignment: 4 },
          { name: 'c', type: 'char', size: 1, offset: 5, alignment: 1 },
        ],
        totalSize: 6,
        alignment: 1
      },
      default: {
        members: [
          { name: 'a', type: 'char', size: 1, offset: 0, alignment: 1 },
          { name: 'b', type: 'int', size: 4, offset: 4, alignment: 4 },
          { name: 'c', type: 'char', size: 1, offset: 8, alignment: 1 },
        ],
        totalSize: 12,
        alignment: 4
      },
      aligned_8: {
        members: [
          { name: 'a', type: 'char', size: 1, offset: 0, alignment: 1 },
          { name: 'b', type: 'int', size: 4, offset: 4, alignment: 4 },
          { name: 'c', type: 'char', size: 1, offset: 8, alignment: 1 },
        ],
        totalSize: 16,
        alignment: 8
      },
      aligned_16: {
        members: [
          { name: 'a', type: 'char', size: 1, offset: 0, alignment: 1 },
          { name: 'b', type: 'int', size: 4, offset: 4, alignment: 4 },
          { name: 'c', type: 'char', size: 1, offset: 8, alignment: 1 },
        ],
        totalSize: 16,
        alignment: 16
      },
      aligned_64: {
        members: [
          { name: 'a', type: 'char', size: 1, offset: 0, alignment: 1 },
          { name: 'b', type: 'int', size: 4, offset: 4, alignment: 4 },
          { name: 'c', type: 'char', size: 1, offset: 8, alignment: 1 },
        ],
        totalSize: 64,
        alignment: 64
      }
    };
    
    return layouts[structType];
  };

  const renderByteLevel = () => {
    const layout = getStructLayout();
    const maxBytes = Math.max(16, layout.totalSize);
    
    return (
      <group>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.2}
          color="#00d4ff"
          anchorX="center"
        >
          Byte-Level Memory Layout
        </Text>
        
        {/* Memory bytes */}
        {Array.from({ length: maxBytes }, (_, byteIndex) => {
          const member = layout.members.find(m => 
            byteIndex >= m.offset && byteIndex < m.offset + m.size
          );
          
          const isPadding = !member;
          const isSelected = selectedMember === member?.name;
          
          return (
            <group key={`byte-${byteIndex}`} position={[byteIndex * 0.4 - maxBytes * 0.2, 0, 0]}>
              <Box args={[0.35, 0.6, 0.2]}>
                <meshStandardMaterial 
                  color={
                    isSelected ? '#ff6b7a' :
                    isPadding ? (showPadding ? '#ff4757' : '#333') :
                    member ? '#2ed573' : '#57606f'
                  }
                  transparent
                  opacity={isPadding && !showPadding ? 0.3 : 0.8}
                />
              </Box>
              
              <Text
                position={[0, 0, 0.15]}
                fontSize={0.08}
                color="white"
                anchorX="center"
              >
                {isPadding ? (showPadding ? 'PAD' : '') : member?.name}
              </Text>
              
              <Text
                position={[0, -0.4, 0]}
                fontSize={0.06}
                color="#888"
                anchorX="center"
              >
                {byteIndex}
              </Text>
            </group>
          );
        })}
        
        {/* Cache line boundaries */}
        {showCacheLine && Array.from({ length: Math.ceil(maxBytes / 64) }, (_, lineIndex) => (
          <group key={`cache-${lineIndex}`} position={[lineIndex * 64 * 0.4 - maxBytes * 0.2, -1, 0]}>
            <Box args={[64 * 0.4, 0.1, 0.1]}>
              <meshStandardMaterial color="#ffa500" transparent opacity={0.5} />
            </Box>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.1}
              color="#ffa500"
              anchorX="center"
            >
              Cache Line {lineIndex}
            </Text>
          </group>
        ))}
        
        {/* Layout info */}
        <group position={[0, 1.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.12}
            color="#00d4ff"
            anchorX="center"
          >
            Size: {layout.totalSize} bytes | Alignment: {layout.alignment} bytes
          </Text>
        </group>
      </group>
    );
  };

  const renderCacheLines = () => {
    const layout = getStructLayout();
    const cacheLineSize = 64;
    const numStructs = 8;
    
    return (
      <group>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.2}
          color="#ffa500"
          anchorX="center"
        >
          Cache Line Utilization
        </Text>
        
        {/* Cache lines */}
        {Array.from({ length: 4 }, (_, lineIndex) => (
          <group key={`line-${lineIndex}`} position={[0, 1.5 - lineIndex * 0.8, 0]}>
            {/* Cache line box */}
            <Box args={[8, 0.6, 0.2]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#ffa500" transparent opacity={0.2} />
            </Box>
            
            <Text
              position={[-4.5, 0, 0.15]}
              fontSize={0.1}
              color="#ffa500"
              anchorX="center"
            >
              Line {lineIndex}
            </Text>
            
            {/* Structs in cache line */}
            {Array.from({ length: Math.floor(cacheLineSize / layout.totalSize) }, (_, structIndex) => (
              <group key={`struct-${structIndex}`} position={[structIndex * (layout.totalSize * 0.1) - 3, 0, 0.1]}>
                <Box args={[layout.totalSize * 0.08, 0.4, 0.3]}>
                  <meshStandardMaterial color="#2ed573" transparent opacity={0.7} />
                </Box>
                <Text
                  position={[0, 0, 0.2]}
                  fontSize={0.06}
                  color="white"
                  anchorX="center"
                >
                  S{structIndex}
                </Text>
              </group>
            ))}
          </group>
        ))}
        
        {/* Efficiency info */}
        <group position={[0, -1.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.12}
            color="#00d4ff"
            anchorX="center"
          >
            Structs per cache line: {Math.floor(cacheLineSize / layout.totalSize)}
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.12}
            color="#00d4ff"
            anchorX="center"
          >
            Cache utilization: {((Math.floor(cacheLineSize / layout.totalSize) * layout.totalSize) / cacheLineSize * 100).toFixed(1)}%
          </Text>
        </group>
      </group>
    );
  };

  const renderAlignmentDemo = () => {
    const { bufferSize, alignmentRequirement, currentOffset } = state;
    const alignedOffset = Math.ceil(currentOffset / alignmentRequirement) * alignmentRequirement;
    
    return (
      <group>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.2}
          color="#2ed573"
          anchorX="center"
        >
          std::align Demonstration
        </Text>
        
        {/* Buffer visualization */}
        <group position={[0, 1, 0]}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.15}
            color="#00d4ff"
            anchorX="center"
          >
            Raw Buffer ({bufferSize} bytes)
          </Text>
          
          {Array.from({ length: bufferSize }, (_, index) => (
            <group key={`buffer-${index}`} position={[index * 0.3 - bufferSize * 0.15, 0, 0]}>
              <Box args={[0.25, 0.4, 0.2]}>
                <meshStandardMaterial 
                  color={
                    index === currentOffset ? '#ff6b7a' :
                    index === alignedOffset ? '#2ed573' :
                    index % alignmentRequirement === 0 ? '#00d4ff' :
                    '#57606f'
                  }
                  transparent
                  opacity={0.7}
                />
              </Box>
              
              <Text
                position={[0, -0.3, 0]}
                fontSize={0.06}
                color="#888"
                anchorX="center"
              >
                {index}
              </Text>
              
              {index % alignmentRequirement === 0 && (
                <Text
                  position={[0, 0.3, 0]}
                  fontSize={0.05}
                  color="#00d4ff"
                  anchorX="center"
                >
                  {alignmentRequirement}B
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
            Current offset: {currentOffset} → Aligned offset: {alignedOffset}
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.12}
            color="white"
            anchorX="center"
          >
            Wasted bytes: {alignedOffset - currentOffset}
          </Text>
        </group>
        
        {/* Legend */}
        <group position={[0, -1.5, 0]}>
          <Text position={[-2, 0, 0]} fontSize={0.1} color="#ff6b7a" anchorX="center">Current</Text>
          <Text position={[0, 0, 0]} fontSize={0.1} color="#2ed573" anchorX="center">Aligned</Text>
          <Text position={[2, 0, 0]} fontSize={0.1} color="#00d4ff" anchorX="center">Boundary</Text>
        </group>
      </group>
    );
  };

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {memoryView === 'byte_level' && renderByteLevel()}
      {memoryView === 'cache_lines' && renderCacheLines()}
      {memoryView === 'alignment_demo' && renderAlignmentDemo()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson29_Alignment: React.FC = () => {
  const [state, setState] = useState<AlignmentState>({
    structType: 'default',
    showPadding: true,
    showCacheLine: false,
    selectedMember: '',
    memoryView: 'byte_level',
    bufferSize: 16,
    alignmentRequirement: 8,
    currentOffset: 3
  });

  const getStructCode = () => {
    const codes = {
      packed: `#pragma pack(push, 1)
struct PackedStruct {
    char a;        // offset: 0, size: 1
    int b;         // offset: 1, size: 4  
    char c;        // offset: 5, size: 1
};                 // total size: 6, alignment: 1
#pragma pack(pop)`,
      default: `struct DefaultStruct {
    char a;        // offset: 0, size: 1
                   // padding: 3 bytes
    int b;         // offset: 4, size: 4
    char c;        // offset: 8, size: 1
                   // padding: 3 bytes
};                 // total size: 12, alignment: 4`,
      aligned_8: `struct alignas(8) Aligned8Struct {
    char a;        // offset: 0, size: 1
                   // padding: 3 bytes
    int b;         // offset: 4, size: 4
    char c;        // offset: 8, size: 1
                   // padding: 7 bytes (for 8-byte alignment)
};                 // total size: 16, alignment: 8`,
      aligned_16: `struct alignas(16) Aligned16Struct {
    char a;        // offset: 0, size: 1
                   // padding: 3 bytes
    int b;         // offset: 4, size: 4
    char c;        // offset: 8, size: 1
                   // padding: 7 bytes (for 16-byte alignment)
};                 // total size: 16, alignment: 16`,
      aligned_64: `struct alignas(64) Aligned64Struct {
    char a;        // offset: 0, size: 1
                   // padding: 3 bytes
    int b;         // offset: 4, size: 4
    char c;        // offset: 8, size: 1
                   // padding: 55 bytes (for 64-byte alignment)
};                 // total size: 64, alignment: 64`
    };
    
    return codes[state.structType];
  };

  const calculateAlignedOffset = () => {
    const { currentOffset, alignmentRequirement } = state;
    return Math.ceil(currentOffset / alignmentRequirement) * alignmentRequirement;
  };

  return (
    <Container>
      <Header>
        <Title>📐 Memory Alignment</Title>
        <Subtitle>Exploring std::align and alignas(64) for optimal memory layout</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Memory Alignment Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>Memory Alignment</strong><br/>
            CPU efficiency requirement where data must be placed at addresses that are 
            multiples of their natural alignment boundary.
          </StatusDisplay>

          <h4>🎯 Alignment Rules</h4>
          <Grid>
            <InfoCard>
              <h4>Natural Alignment</h4>
              <CodeBlock>{`// Type alignments (typical x64):
char:      1 byte   (any address)
short:     2 bytes  (even addresses)
int:       4 bytes  (multiple of 4)
long long: 8 bytes  (multiple of 8)
double:    8 bytes  (multiple of 8)
pointer:   8 bytes  (multiple of 8)

// Struct alignment = max member alignment
struct Example {
    char a;    // alignment: 1
    int b;     // alignment: 4
};             // struct alignment: 4`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>alignas Specifier</h4>
              <CodeBlock>{`// Force specific alignment
struct alignas(16) Vector4 {
    float x, y, z, w;  // SIMD-friendly
};

struct alignas(64) CacheFriendly {
    int data[16];      // Fits exactly in cache line
};

// Array alignment applies to each element
alignas(32) int array[100];  // Each int at 32-byte boundary

// Over-alignment (larger than natural)
alignas(128) char single_char;  // Wastes 127 bytes!`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>std::align Function</h4>
              <CodeBlock>{`#include <memory>

void* align(std::size_t alignment,
           std::size_t size,
           void*& ptr,
           std::size_t& space);

// Usage example:
char buffer[1024];
void* ptr = buffer;
std::size_t space = sizeof(buffer);

// Align for double (8 bytes)
if (std::align(8, sizeof(double), ptr, space)) {
    // ptr now points to aligned location
    double* d = static_cast<double*>(ptr);
    *d = 3.14159;
    
    // Update for next allocation
    ptr = static_cast<char*>(ptr) + sizeof(double);
    space -= sizeof(double);
}`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Cache Line Alignment</h4>
              <CodeBlock>{`// Avoid false sharing
struct alignas(64) NoFalseSharing {
    int counter1;        // In separate cache lines
    char padding1[60];   // Manual padding
    int counter2;
    char padding2[60];
};

// Better: use alignas
struct alignas(64) Counter {
    int value;
    // Compiler adds padding automatically
};

// C++17: hardware_destructive_interference_size
#ifdef __cpp_lib_hardware_interference_size
constexpr std::size_t cache_line_size = 
    std::hardware_destructive_interference_size;
#else
constexpr std::size_t cache_line_size = 64; // Common value
#endif`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Performance Impact</h4>
          <CodeBlock>{`// Misaligned access penalties:
// - Can be 2-10x slower
// - May require multiple memory transactions
// - Some architectures fault on misalignment

// Memory layout optimization:
struct Bad {          // Size: 24 bytes
    char a;           // 1 byte
                      // 7 bytes padding
    double b;         // 8 bytes  
    char c;           // 1 byte
                      // 7 bytes padding
};

struct Good {         // Size: 16 bytes
    double b;         // 8 bytes (no padding needed)
    char a;           // 1 byte
    char c;           // 1 byte
                      // 6 bytes padding
};

// Even better: group similar types
struct Best {         // Size: 12 bytes
    char a, c;        // 2 bytes
                      // 2 bytes padding
    int padding;      // 4 bytes (could be useful data)
    double b;         // 8 bytes
};`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current Configuration</h4>
            <StatusDisplay $type="success">
              <strong>Struct Type:</strong> {state.structType}<br/>
              <strong>View Mode:</strong> {state.memoryView}<br/>
              {state.memoryView === 'alignment_demo' && (
                <>
                  <strong>Buffer Size:</strong> {state.bufferSize} bytes<br/>
                  <strong>Alignment:</strong> {state.alignmentRequirement} bytes<br/>
                  <strong>Current Offset:</strong> {state.currentOffset}<br/>
                  <strong>Aligned Offset:</strong> {calculateAlignedOffset()}<br/>
                  <strong>Waste:</strong> {calculateAlignedOffset() - state.currentOffset} bytes
                </>
              )}
            </StatusDisplay>
            
            <h4>💻 Current Struct Definition</h4>
            <CodeBlock>{getStructCode()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <AlignmentVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Alignment Controls</h4>
            
            <div>
              <strong>Memory View:</strong><br/>
              <Button 
                $variant={state.memoryView === 'byte_level' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, memoryView: 'byte_level' }))}
              >
                Byte Layout
              </Button>
              <Button 
                $variant={state.memoryView === 'cache_lines' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, memoryView: 'cache_lines' }))}
              >
                Cache Lines
              </Button>
              <Button 
                $variant={state.memoryView === 'alignment_demo' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, memoryView: 'alignment_demo' }))}
              >
                std::align Demo
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Struct Type:</strong><br/>
              <Button 
                $variant={state.structType === 'packed' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, structType: 'packed' }))}
              >
                #pragma pack(1)
              </Button>
              <Button 
                $variant={state.structType === 'default' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, structType: 'default' }))}
              >
                Default
              </Button>
              <Button 
                $variant={state.structType === 'aligned_8' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, structType: 'aligned_8' }))}
              >
                alignas(8)
              </Button>
              <Button 
                $variant={state.structType === 'aligned_16' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, structType: 'aligned_16' }))}
              >
                alignas(16)
              </Button>
              <Button 
                $variant={state.structType === 'aligned_64' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, structType: 'aligned_64' }))}
              >
                alignas(64)
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Display Options:</strong><br/>
              <Button 
                $variant={state.showPadding ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showPadding: !prev.showPadding }))}
              >
                {state.showPadding ? 'Hide' : 'Show'} Padding
              </Button>
              <Button 
                $variant={state.showCacheLine ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showCacheLine: !prev.showCacheLine }))}
              >
                {state.showCacheLine ? 'Hide' : 'Show'} Cache Lines
              </Button>
            </div>

            {state.memoryView === 'alignment_demo' && (
              <div style={{ marginTop: '1rem' }}>
                <strong>std::align Parameters:</strong><br/>
                <label>Alignment: </label>
                <select 
                  value={state.alignmentRequirement}
                  onChange={(e) => setState(prev => ({ ...prev, alignmentRequirement: parseInt(e.target.value) }))}
                  style={{ 
                    padding: '0.5rem', 
                    margin: '0.5rem',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#e0e6ed',
                    border: '1px solid rgba(0,212,255,0.3)'
                  }}
                >
                  <option value="1">1 byte</option>
                  <option value="2">2 bytes</option>
                  <option value="4">4 bytes</option>
                  <option value="8">8 bytes</option>
                  <option value="16">16 bytes</option>
                  <option value="32">32 bytes</option>
                </select>
                
                <label>Offset: </label>
                <Input 
                  type="number"
                  min="0"
                  max={state.bufferSize - 1}
                  value={state.currentOffset}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    currentOffset: Math.max(0, Math.min(parseInt(e.target.value) || 0, prev.bufferSize - 1))
                  }))}
                />
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <strong>Member Highlight:</strong><br/>
              <Button 
                $variant={state.selectedMember === 'a' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, selectedMember: prev.selectedMember === 'a' ? '' : 'a' }))}
              >
                Member 'a'
              </Button>
              <Button 
                $variant={state.selectedMember === 'b' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, selectedMember: prev.selectedMember === 'b' ? '' : 'b' }))}
              >
                Member 'b'
              </Button>
              <Button 
                $variant={state.selectedMember === 'c' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, selectedMember: prev.selectedMember === 'c' ? '' : 'c' }))}
              >
                Member 'c'
              </Button>
            </div>

            <StatusDisplay $type="info">
              <strong>Alignment Benefits:</strong><br/>
              • <Highlight $color="#2ed573">Performance</Highlight>: CPU can access aligned data more efficiently<br/>
              • <Highlight $color="#00d4ff">SIMD</Highlight>: Vector instructions require specific alignment<br/>
              • <Highlight $color="#ffa500">Cache</Highlight>: Reduces false sharing between threads<br/>
              • <Highlight>Costs</Highlight>: Memory overhead from padding bytes
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson29_Alignment;