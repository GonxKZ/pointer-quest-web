import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface CInterfaceState {
  argc: number;
  argv: string[];
  selectedArg: number;
  constLayer: 'none' | 'char_const' | 'ptr_const' | 'both_const';
  demonstration: 'argv' | 'const_layers' | 'modification' | 'best_practices';
  showStringContents: boolean;
  codeExample: 'basic' | 'const_correct' | 'modern_wrapper';
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
  width: 150px;
`;

function CInterfaceVisualization({ state }: { state: CInterfaceState }) {
  const { argc, argv, selectedArg, constLayer, demonstration, showStringContents } = state;

  const getConstDescription = () => {
    switch (constLayer) {
      case 'char_const': return 'const char**';
      case 'ptr_const': return 'char* const*';
      case 'both_const': return 'const char* const*';
      default: return 'char**';
    }
  };

  const renderArgvVisualization = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#00d4ff"
        anchorX="center"
      >
        char** argv Structure
      </Text>
      
      {/* argc display */}
      <group position={[-3, 1.5, 0]}>
        <Box args={[0.8, 0.6, 0.3]}>
          <meshStandardMaterial color="#2ed573" transparent opacity={0.8} />
        </Box>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.15}
          color="white"
          anchorX="center"
        >
          argc
        </Text>
        <Text
          position={[0, -0.3, 0.2]}
          fontSize={0.12}
          color="#ffa500"
          anchorX="center"
        >
          {argc}
        </Text>
      </group>
      
      {/* argv array */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          argv ({getConstDescription()})
        </Text>
        
        {/* Pointer array */}
        {argv.map((arg, index) => (
          <group key={`ptr-${index}`} position={[index * 0.8 - (argc * 0.8) / 2, 0, 0]}>
            <Box args={[0.6, 0.4, 0.2]}>
              <meshStandardMaterial 
                color={selectedArg === index ? '#ff6b7a' : '#57606f'}
                transparent 
                opacity={0.8} 
              />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.1}
              color="white"
              anchorX="center"
            >
              ptr{index}
            </Text>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.08}
              color="#ffa500"
              anchorX="center"
            >
              [{index}]
            </Text>
            
            {/* Arrow to string */}
            <mesh position={[0, -0.7, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.1, 0.3]} />
              <meshStandardMaterial color="#00d4ff" />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* String contents */}
      <group position={[0, 0, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="#ffa500"
          anchorX="center"
        >
          String Contents
        </Text>
        
        {argv.map((arg, index) => (
          <group key={`str-${index}`} position={[index * 0.8 - (argc * 0.8) / 2, 0, 0]}>
            <Box args={[Math.max(0.6, arg.length * 0.08), 0.4, 0.2]}>
              <meshStandardMaterial 
                color={selectedArg === index ? '#2ed573' : '#ffa500'}
                transparent 
                opacity={0.6} 
              />
            </Box>
            
            {showStringContents && (
              <Text
                position={[0, 0, 0.15]}
                fontSize={0.08}
                color="white"
                anchorX="center"
              >
                "{arg}"
              </Text>
            )}
            
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.06}
              color="#888"
              anchorX="center"
            >
              {arg.length + 1} bytes
            </Text>
          </group>
        ))}
      </group>
      
      {/* NULL terminator */}
      <group position={[argc * 0.8 - (argc * 0.8) / 2, 1.5, 0]}>
        <Box args={[0.6, 0.4, 0.2]}>
          <meshStandardMaterial color="#ff4757" transparent opacity={0.8} />
        </Box>
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.1}
          color="white"
          anchorX="center"
        >
          NULL
        </Text>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.08}
          color="#ff4757"
          anchorX="center"
        >
          [end]
        </Text>
      </group>
    </group>
  );

  const renderConstLayers = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ffa500"
        anchorX="center"
      >
        Const Qualification Layers
      </Text>
      
      {/* Layer visualization */}
      <group position={[0, 1, 0]}>
        {/* Base type: char */}
        <group position={[-2, 0.5, 0]}>
          <Box args={[1.5, 0.6, 0.3]}>
            <meshStandardMaterial 
              color={constLayer === 'char_const' || constLayer === 'both_const' ? '#2ed573' : '#57606f'}
              transparent 
              opacity={0.7} 
            />
          </Box>
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.12}
            color="white"
            anchorX="center"
          >
            {constLayer === 'char_const' || constLayer === 'both_const' ? 'const char' : 'char'}
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.1}
            color="#888"
            anchorX="center"
          >
            String Content
          </Text>
        </group>
        
        {/* First pointer level */}
        <group position={[0, 0.5, 0]}>
          <Box args={[1.5, 0.6, 0.3]}>
            <meshStandardMaterial 
              color={constLayer === 'ptr_const' || constLayer === 'both_const' ? '#2ed573' : '#57606f'}
              transparent 
              opacity={0.7} 
            />
          </Box>
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.12}
            color="white"
            anchorX="center"
          >
            * {constLayer === 'ptr_const' || constLayer === 'both_const' ? 'const' : ''}
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.1}
            color="#888"
            anchorX="center"
          >
            Pointer to String
          </Text>
        </group>
        
        {/* Second pointer level */}
        <group position={[2, 0.5, 0]}>
          <Box args={[1.5, 0.6, 0.3]}>
            <meshStandardMaterial color="#00d4ff" transparent opacity={0.7} />
          </Box>
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.12}
            color="white"
            anchorX="center"
          >
            *
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.1}
            color="#888"
            anchorX="center"
          >
            Array of Pointers
          </Text>
        </group>
        
        {/* Arrows */}
        <mesh position={[-0.75, 0.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.3]} />
          <meshStandardMaterial color="#00d4ff" />
        </mesh>
        
        <mesh position={[0.75, 0.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.3]} />
          <meshStandardMaterial color="#00d4ff" />
        </mesh>
      </group>
      
      {/* Current signature */}
      <group position={[0, -0.5, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Current: {getConstDescription()} argv
        </Text>
      </group>
      
      {/* Modification rules */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.1}
          color={constLayer === 'char_const' || constLayer === 'both_const' ? '#ff4757' : '#2ed573'}
          anchorX="center"
        >
          String content: {constLayer === 'char_const' || constLayer === 'both_const' ? 'IMMUTABLE' : 'MUTABLE'}
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={0.1}
          color={constLayer === 'ptr_const' || constLayer === 'both_const' ? '#ff4757' : '#2ed573'}
          anchorX="center"
        >
          Pointer array: {constLayer === 'ptr_const' || constLayer === 'both_const' ? 'IMMUTABLE' : 'MUTABLE'}
        </Text>
      </group>
    </group>
  );

  const renderModificationDemo = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ff4757"
        anchorX="center"
      >
        Modification Attempts
      </Text>
      
      {/* Operation examples */}
      <group position={[0, 1, 0]}>
        {[
          { 
            code: 'argv[0][0] = \'X\'', 
            valid: constLayer !== 'char_const' && constLayer !== 'both_const',
            desc: 'Modify string content'
          },
          { 
            code: 'argv[0] = "new"', 
            valid: constLayer !== 'ptr_const' && constLayer !== 'both_const',
            desc: 'Replace pointer'
          },
          { 
            code: 'argv++', 
            valid: true,
            desc: 'Advance argv pointer'
          }
        ].map((op, index) => (
          <group key={`op-${index}`} position={[0, 0.5 - index * 0.4, 0]}>
            <Box args={[4, 0.3, 0.2]}>
              <meshStandardMaterial 
                color={op.valid ? '#2ed573' : '#ff4757'}
                transparent 
                opacity={0.6} 
              />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.1}
              color="white"
              anchorX="center"
            >
              {op.code} - {op.valid ? 'ALLOWED' : 'FORBIDDEN'}
            </Text>
            <Text
              position={[0, -0.2, 0]}
              fontSize={0.08}
              color="#888"
              anchorX="center"
            >
              {op.desc}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );

  const renderBestPractices = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#2ed573"
        anchorX="center"
      >
        Modern C++ Best Practices
      </Text>
      
      {/* Recommendation boxes */}
      <group position={[0, 1, 0]}>
        {[
          { text: 'Use std::vector<std::string>', reason: 'Type safety & RAII', color: '#2ed573' },
          { text: 'Use std::span<const char*>', reason: 'C++20 interface', color: '#00d4ff' },
          { text: 'Use gsl::not_null<char**>', reason: 'Express non-null intent', color: '#ffa500' },
          { text: 'Avoid C-style arrays', reason: 'Bounds safety', color: '#ff6b7a' }
        ].map((item, index) => (
          <group key={`rec-${index}`} position={[0, 0.8 - index * 0.4, 0]}>
            <Box args={[5, 0.3, 0.2]}>
              <meshStandardMaterial color={item.color} transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.1}
              color="white"
              anchorX="center"
            >
              {item.text}
            </Text>
            <Text
              position={[0, -0.2, 0]}
              fontSize={0.08}
              color="#888"
              anchorX="center"
            >
              {item.reason}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {demonstration === 'argv' && renderArgvVisualization()}
      {demonstration === 'const_layers' && renderConstLayers()}
      {demonstration === 'modification' && renderModificationDemo()}
      {demonstration === 'best_practices' && renderBestPractices()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson31_CInterfaces: React.FC = () => {
  const [state, setState] = useState<CInterfaceState>({
    argc: 3,
    argv: ['./program', '--verbose', 'input.txt'],
    selectedArg: 0,
    constLayer: 'none',
    demonstration: 'argv',
    showStringContents: true,
    codeExample: 'basic'
  });

  const addArgument = () => {
    const newArg = `arg${state.argv.length}`;
    setState(prev => ({
      ...prev,
      argc: prev.argc + 1,
      argv: [...prev.argv, newArg]
    }));
  };

  const removeArgument = () => {
    if (state.argc > 1) {
      setState(prev => ({
        ...prev,
        argc: prev.argc - 1,
        argv: prev.argv.slice(0, -1),
        selectedArg: Math.min(prev.selectedArg, prev.argc - 2)
      }));
    }
  };

  const getCurrentCodeExample = () => {
    const { codeExample, constLayer } = state;
    
    const examples = {
      basic: `// Basic C interface
int main(int argc, char** argv) {
    std::cout << "Program: " << argv[0] << std::endl;
    std::cout << "Arguments: " << argc - 1 << std::endl;
    
    for (int i = 1; i < argc; ++i) {
        std::cout << "  arg[" << i << "]: " << argv[i] << std::endl;
    }
    
    return 0;
}`,
      const_correct: `// Const-correct interface
int main(int argc, const char* const* argv) {
    // argv[i] = "new";     // Error: can't modify pointers
    // argv[0][0] = 'X';    // Error: can't modify strings
    
    // But can still iterate and read
    for (const char* const* arg = argv; *arg; ++arg) {
        std::cout << *arg << std::endl;
    }
    
    return 0;
}`,
      modern_wrapper: `// Modern C++ wrapper
#include <vector>
#include <string>
#include <span>

class ArgumentParser {
    std::vector<std::string> args_;
    
public:
    ArgumentParser(int argc, const char* const* argv) 
        : args_(argv, argv + argc) {}
    
    std::span<const std::string> arguments() const { return args_; }
    const std::string& program_name() const { return args_[0]; }
    
    bool has_flag(const std::string& flag) const {
        return std::find(args_.begin() + 1, args_.end(), flag) != args_.end();
    }
};

int main(int argc, const char* const* argv) {
    ArgumentParser parser(argc, argv);
    
    if (parser.has_flag("--verbose")) {
        std::cout << "Verbose mode enabled" << std::endl;
    }
    
    return 0;
}`
    };
    
    return examples[codeExample];
  };

  const getConstDescription = () => {
    switch (state.constLayer) {
      case 'char_const': 
        return 'const char** - strings are immutable, pointers are mutable';
      case 'ptr_const': 
        return 'char* const* - strings are mutable, pointers are immutable';
      case 'both_const': 
        return 'const char* const* - both strings and pointers are immutable';
      default: 
        return 'char** - both strings and pointers are mutable';
    }
  };

  return (
    <Container>
      <Header>
        <Title>🔗 C Interfaces</Title>
        <Subtitle>Mastering char** argv and const qualification layers</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 C Interface Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>C-Style Interfaces</strong><br/>
            Understanding char** argv structure and const qualification layers
            for safe and effective C/C++ interoperability.
          </StatusDisplay>

          <h4>🎯 char** argv Breakdown</h4>
          <Grid>
            <InfoCard>
              <h4>Memory Layout</h4>
              <CodeBlock>{`// argv is array of pointers to strings
char** argv = {
    "program_name\\0",  // argv[0]
    "--flag\\0",        // argv[1] 
    "file.txt\\0",      // argv[2]
    nullptr             // argv[argc] = NULL
};

// Memory structure:
//   argv ──┐
//          ├── [ptr0] ──→ "program_name\\0"
//          ├── [ptr1] ──→ "--flag\\0"
//          ├── [ptr2] ──→ "file.txt\\0"
//          └── [NULL]`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Const Qualification</h4>
              <CodeBlock>{`// Four possible const combinations:
char** argv;               // Mutable strings, mutable pointers
const char** argv;         // Immutable strings, mutable pointers  
char* const* argv;         // Mutable strings, immutable pointers
const char* const* argv;   // Immutable strings, immutable pointers

// Most common in practice:
int main(int argc, char** argv);           // Traditional
int main(int argc, const char** argv);     // Better
int main(int argc, const char* const* argv); // Best`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Safe Iteration</h4>
              <CodeBlock>{`// Method 1: Index-based (traditional)
for (int i = 0; i < argc; ++i) {
    printf("arg[%d]: %s\\n", i, argv[i]);
}

// Method 2: Pointer-based  
for (char** arg = argv; *arg; ++arg) {
    printf("arg: %s\\n", *arg);
}

// Method 3: Range-based (C++11+)
for (int i = 0; i < argc; ++i) {
    std::cout << "arg[" << i << "]: " << argv[i] << std::endl;
}`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Bounds Safety</h4>
              <CodeBlock>{`// DANGER: No bounds checking
char* dangerous = argv[100];  // UB if argc <= 100

// SAFE: Always check bounds
if (argc > 1) {
    const char* first_arg = argv[1];
}

// SAFE: Use range-based access
for (int i = 0; i < argc; ++i) {
    // Guaranteed valid access
    process_argument(argv[i]);
}

// MODERN: Use span (C++20)
std::span<const char*> args(argv, argc);
for (const char* arg : args) {
    process_argument(arg);
}`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Common Patterns</h4>
          <CodeBlock>{`// Pattern 1: Flag detection
bool has_flag(int argc, const char* const* argv, const char* flag) {
    for (int i = 1; i < argc; ++i) {
        if (std::strcmp(argv[i], flag) == 0) {
            return true;
        }
    }
    return false;
}

// Pattern 2: Option parsing
const char* get_option(int argc, const char* const* argv, const char* option) {
    for (int i = 1; i < argc - 1; ++i) {
        if (std::strcmp(argv[i], option) == 0) {
            return argv[i + 1];  // Return next argument
        }
    }
    return nullptr;
}

// Pattern 3: Modern wrapper
class Arguments {
    std::vector<std::string> args_;
public:
    Arguments(int argc, const char* const* argv) 
        : args_(argv, argv + argc) {}
        
    const std::string& operator[](size_t i) const { return args_[i]; }
    size_t size() const { return args_.size(); }
    
    bool has(const std::string& flag) const {
        return std::find(args_.begin(), args_.end(), flag) != args_.end();
    }
};

// Pattern 4: gsl::span interface
void process_args(gsl::span<const char*> args) {
    for (const char* arg : args) {
        // Process each argument safely
    }
}

int main(int argc, const char* const* argv) {
    process_args(gsl::make_span(argv, argc));
    return 0;
}`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current Configuration</h4>
            <StatusDisplay $type="success">
              <strong>argc:</strong> {state.argc}<br/>
              <strong>Const Layer:</strong> {state.constLayer}<br/>
              <strong>Description:</strong> {getConstDescription()}<br/>
              <strong>Selected Arg:</strong> {state.selectedArg < state.argv.length ? `"${state.argv[state.selectedArg]}"` : 'None'}
            </StatusDisplay>
            
            <h4>💻 Code Example</h4>
            <CodeBlock>{getCurrentCodeExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <CInterfaceVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 C Interface Controls</h4>
            
            <div>
              <strong>Demonstration:</strong><br/>
              <Button 
                $variant={state.demonstration === 'argv' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'argv' }))}
              >
                argv Structure
              </Button>
              <Button 
                $variant={state.demonstration === 'const_layers' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'const_layers' }))}
              >
                Const Layers
              </Button>
              <Button 
                $variant={state.demonstration === 'modification' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'modification' }))}
              >
                Modification Rules
              </Button>
              <Button 
                $variant={state.demonstration === 'best_practices' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'best_practices' }))}
              >
                Best Practices
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Const Qualification:</strong><br/>
              <Button 
                $variant={state.constLayer === 'none' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, constLayer: 'none' }))}
              >
                char**
              </Button>
              <Button 
                $variant={state.constLayer === 'char_const' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, constLayer: 'char_const' }))}
              >
                const char**
              </Button>
              <Button 
                $variant={state.constLayer === 'ptr_const' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, constLayer: 'ptr_const' }))}
              >
                char* const*
              </Button>
              <Button 
                $variant={state.constLayer === 'both_const' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, constLayer: 'both_const' }))}
              >
                const char* const*
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Arguments Management:</strong><br/>
              <Button onClick={addArgument}>
                ➕ Add Argument
              </Button>
              <Button onClick={removeArgument} disabled={state.argc <= 1}>
                ➖ Remove Argument
              </Button>
              
              <div style={{ marginTop: '0.5rem' }}>
                <label>Edit argument {state.selectedArg}: </label>
                <Input 
                  type="text"
                  value={state.argv[state.selectedArg] || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    argv: prev.argv.map((arg, i) => i === prev.selectedArg ? e.target.value : arg)
                  }))}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Argument Selection:</strong><br/>
              {state.argv.map((arg, index) => (
                <Button 
                  key={index}
                  $variant={state.selectedArg === index ? 'primary' : 'secondary'}
                  onClick={() => setState(prev => ({ ...prev, selectedArg: index }))}
                >
                  [{index}] {arg.substring(0, 8)}{arg.length > 8 ? '...' : ''}
                </Button>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Code Example:</strong><br/>
              <Button 
                $variant={state.codeExample === 'basic' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, codeExample: 'basic' }))}
              >
                Basic
              </Button>
              <Button 
                $variant={state.codeExample === 'const_correct' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, codeExample: 'const_correct' }))}
              >
                Const-Correct
              </Button>
              <Button 
                $variant={state.codeExample === 'modern_wrapper' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, codeExample: 'modern_wrapper' }))}
              >
                Modern Wrapper
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                $variant={state.showStringContents ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showStringContents: !prev.showStringContents }))}
              >
                {state.showStringContents ? 'Hide' : 'Show'} String Contents
              </Button>
            </div>

            <StatusDisplay $type="info">
              <strong>Key Points:</strong><br/>
              • <Highlight $color="#2ed573">argv[0]</Highlight>: Always program name<br/>
              • <Highlight $color="#00d4ff">argv[argc]</Highlight>: Always NULL pointer<br/>
              • <Highlight $color="#ffa500">const char**</Highlight>: Recommended for read-only access<br/>
              • <Highlight $color="#ff6b7a">Bounds</Highlight>: Always check argc before accessing argv[i]
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson31_CInterfaces;