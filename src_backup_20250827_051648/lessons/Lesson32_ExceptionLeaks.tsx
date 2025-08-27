import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface ExceptionLeakState {
  allocatedObjects: { id: number; type: string; leaked: boolean; size: number; allocated: number }[];
  currentStep: number;
  demonstration: 'unsafe_new' | 'raii_fix' | 'custom_guard' | 'exception_safety';
  exceptionPoint: 'none' | 'between_new_delete' | 'in_constructor' | 'in_function_call';
  showLeakDetection: boolean;
  raiiEnabled: boolean;
  totalLeaked: number;
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

function ExceptionLeakVisualization({ state }: { state: ExceptionLeakState }) {
  const { allocatedObjects, demonstration, exceptionPoint, showLeakDetection, raiiEnabled } = state;

  const renderUnsafeNewDemo = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ff4757"
        anchorX="center"
      >
        Unsafe new/delete Pattern
      </Text>
      
      {/* Timeline */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Execution Timeline
        </Text>
        
        {/* Steps */}
        {[
          { step: 1, text: '1. new allocates', color: '#2ed573', position: -2 },
          { step: 2, text: '2. operation', color: exceptionPoint === 'between_new_delete' ? '#ff4757' : '#00d4ff', position: -0.7 },
          { step: 3, text: '3. EXCEPTION!', color: '#ff4757', position: 0.7 },
          { step: 4, text: '4. delete skipped', color: '#57606f', position: 2 }
        ].map((item, index) => (
          <group key={`step-${item.step}`} position={[item.position, 0, 0]}>
            <Box args={[1.2, 0.4, 0.2]}>
              <meshStandardMaterial color={item.color} transparent opacity={0.7} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {item.text}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Memory blocks */}
      <group position={[0, 0.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="#ffa500"
          anchorX="center"
        >
          Memory State
        </Text>
        
        {allocatedObjects.map((obj, index) => (
          <group key={`obj-${obj.id}`} position={[index * 1.2 - allocatedObjects.length * 0.6, 0, 0]}>
            <Box args={[1, 0.6, 0.3]}>
              <meshStandardMaterial 
                color={obj.leaked ? '#ff4757' : '#2ed573'}
                transparent 
                opacity={0.8} 
              />
            </Box>
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.1}
              color="white"
              anchorX="center"
            >
              {obj.type}
            </Text>
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.08}
              color={obj.leaked ? '#ff6b7a' : '#4ade80'}
              anchorX="center"
            >
              {obj.leaked ? 'LEAKED' : 'SAFE'}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Leak indicator */}
      {state.totalLeaked > 0 && (
        <group position={[0, -1, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="#ff4757"
            anchorX="center"
          >
            🚨 {state.totalLeaked} bytes leaked!
          </Text>
        </group>
      )}
    </group>
  );

  const renderRaiiFix = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#2ed573"
        anchorX="center"
      >
        RAII Solution
      </Text>
      
      {/* RAII timeline */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#2ed573"
          anchorX="center"
        >
          Exception-Safe Execution
        </Text>
        
        {[
          { step: 1, text: '1. Constructor', color: '#2ed573', position: -2 },
          { step: 2, text: '2. Operation', color: '#00d4ff', position: -0.7 },
          { step: 3, text: '3. EXCEPTION!', color: '#ff4757', position: 0.7 },
          { step: 4, text: '4. Auto cleanup', color: '#2ed573', position: 2 }
        ].map((item, index) => (
          <group key={`raii-step-${item.step}`} position={[item.position, 0, 0]}>
            <Box args={[1.2, 0.4, 0.2]}>
              <meshStandardMaterial color={item.color} transparent opacity={0.7} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {item.text}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Stack unwinding visualization */}
      <group position={[0, 0.5, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.12}
          color="#00d4ff"
          anchorX="center"
        >
          Stack Unwinding
        </Text>
        
        {[
          { name: 'unique_ptr<Widget>', status: 'destructor called', color: '#2ed573' },
          { name: 'vector<Data>', status: 'destructor called', color: '#2ed573' },
          { name: 'string filename', status: 'destructor called', color: '#2ed573' }
        ].map((item, index) => (
          <group key={`stack-${index}`} position={[0, 0.4 - index * 0.3, 0]}>
            <Box args={[3, 0.25, 0.2]}>
              <meshStandardMaterial color={item.color} transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {item.name} - {item.status}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Success message */}
      <group position={[0, -1, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.15}
          color="#2ed573"
          anchorX="center"
        >
          ✅ No memory leaks - RAII cleanup guaranteed
        </Text>
      </group>
    </group>
  );

  const renderCustomGuard = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ffa500"
        anchorX="center"
      >
        Custom Exception Guard
      </Text>
      
      {/* Guard visualization */}
      <group position={[0, 1, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="#00d4ff"
          anchorX="center"
        >
          Exception Guard Pattern
        </Text>
        
        {/* Guard object */}
        <group position={[0, 0, 0]}>
          <Box args={[2.5, 0.8, 0.3]}>
            <meshStandardMaterial color="#ffa500" transparent opacity={0.7} />
          </Box>
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.1}
            color="white"
            anchorX="center"
          >
            ScopeGuard
          </Text>
          
          {/* Protected resources */}
          {['Resource A', 'Resource B', 'Resource C'].map((resource, index) => (
            <group key={`resource-${index}`} position={[index * 0.8 - 0.8, -0.8, 0]}>
              <Box args={[0.6, 0.4, 0.2]}>
                <meshStandardMaterial color="#2ed573" transparent opacity={0.6} />
              </Box>
              <Text
                position={[0, 0, 0.15]}
                fontSize={0.07}
                color="white"
                anchorX="center"
              >
                {resource}
              </Text>
            </group>
          ))}
        </group>
      </group>
      
      {/* Exception scenario */}
      <group position={[0, -0.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#ff4757"
          anchorX="center"
        >
          Exception Thrown → Guard Cleans Up
        </Text>
        
        <Text
          position={[0, -0.1, 0]}
          fontSize={0.1}
          color="#2ed573"
          anchorX="center"
        >
          All resources properly released
        </Text>
      </group>
    </group>
  );

  const renderExceptionSafety = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#00d4ff"
        anchorX="center"
      >
        Exception Safety Levels
      </Text>
      
      {/* Safety levels */}
      <group position={[0, 1, 0]}>
        {[
          { level: 'No Guarantee', color: '#ff4757', desc: 'Leaks and corruption possible' },
          { level: 'Basic Guarantee', color: '#ffa500', desc: 'No leaks, but state may change' },
          { level: 'Strong Guarantee', color: '#00d4ff', desc: 'No leaks, state unchanged on failure' },
          { level: 'No-throw Guarantee', color: '#2ed573', desc: 'Never throws exceptions' }
        ].map((item, index) => (
          <group key={`safety-${index}`} position={[0, 1.2 - index * 0.4, 0]}>
            <Box args={[4.5, 0.3, 0.2]}>
              <meshStandardMaterial color={item.color} transparent opacity={0.7} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.09}
              color="white"
              anchorX="center"
            >
              {item.level}: {item.desc}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {demonstration === 'unsafe_new' && renderUnsafeNewDemo()}
      {demonstration === 'raii_fix' && renderRaiiFix()}
      {demonstration === 'custom_guard' && renderCustomGuard()}
      {demonstration === 'exception_safety' && renderExceptionSafety()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson32_ExceptionLeaks: React.FC = () => {
  const [state, setState] = useState<ExceptionLeakState>({
    allocatedObjects: [],
    currentStep: 0,
    demonstration: 'unsafe_new',
    exceptionPoint: 'between_new_delete',
    showLeakDetection: true,
    raiiEnabled: false,
    totalLeaked: 0
  });

  const simulateUnsafeLeak = () => {
    const newObject = {
      id: Date.now(),
      type: 'Widget',
      leaked: true,
      size: 64,
      allocated: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      allocatedObjects: [...prev.allocatedObjects, newObject],
      totalLeaked: prev.totalLeaked + newObject.size
    }));
  };

  const simulateSafeAllocation = () => {
    const newObject = {
      id: Date.now(),
      type: 'unique_ptr<Widget>',
      leaked: false,
      size: 64,
      allocated: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      allocatedObjects: [...prev.allocatedObjects, newObject]
    }));
  };

  const clearAll = () => {
    setState(prev => ({
      ...prev,
      allocatedObjects: [],
      totalLeaked: 0,
      currentStep: 0
    }));
  };

  const getCurrentExample = () => {
    const { demonstration, raiiEnabled } = state;
    
    if (demonstration === 'unsafe_new') {
      return `// UNSAFE: Exception between new and delete
void unsafe_function() {
    Widget* widget = new Widget();  // 1. Allocation
    
    process_data();  // 2. May throw exception!
    
    delete widget;   // 3. NEVER REACHED if exception thrown
}

// Result: Memory leak if process_data() throws`;
    }
    
    if (demonstration === 'raii_fix') {
      return `// SAFE: RAII ensures cleanup
void safe_function() {
    auto widget = std::make_unique<Widget>();  // RAII
    
    process_data();  // May throw exception
    
    // widget destructor called automatically during stack unwinding
}

// Result: No leaks even with exceptions`;
    }
    
    if (demonstration === 'custom_guard') {
      return `// Custom exception guard for C resources
template<typename F>
class ScopeGuard {
    F cleanup;
    bool released = false;
public:
    explicit ScopeGuard(F&& f) : cleanup(std::move(f)) {}
    ~ScopeGuard() { if (!released) cleanup(); }
    void release() { released = true; }
};

void c_resource_function() {
    FILE* file = fopen("data.txt", "r");
    auto guard = ScopeGuard([&] { 
        if (file) fclose(file); 
    });
    
    process_file(file);  // May throw
    
    // File automatically closed by guard destructor
}`;
    }
    
    return `// Exception Safety Levels:

// 1. No guarantee (avoid!)
void bad_function() {
    char* ptr = new char[100];
    risky_operation();  // Exception = leak
    delete[] ptr;
}

// 2. Basic guarantee  
void basic_function() {
    std::vector<int> data;
    data.resize(100);
    risky_operation();  // Exception = no leak, but data may be modified
}

// 3. Strong guarantee
void strong_function() {
    std::vector<int> data;
    auto backup = data;  // Copy state
    try {
        risky_operation();
    } catch (...) {
        data = backup;   // Restore on failure
        throw;
    }
}

// 4. No-throw guarantee
void nothrow_function() noexcept {
    // Only operations that never throw
    int x = 42;
    std::swap(x, y);  // noexcept operations only
}`;
  };

  return (
    <Container>
      <Header>
        <Title>⚠️ Exception Memory Leaks</Title>
        <Subtitle>Demonstrating subtle leaks caused by exceptions without RAII</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Exception Safety Theory</h3>
          
          <StatusDisplay $type="error">
            <strong>Exception Memory Leaks</strong><br/>
            When exceptions occur between new and delete, memory leaks can happen.
            RAII (Resource Acquisition Is Initialization) prevents this automatically.
          </StatusDisplay>

          <h4>🎯 Core Problems</h4>
          <Grid>
            <InfoCard>
              <h4>Unsafe Pattern</h4>
              <CodeBlock>{`// DANGEROUS: Exception between new/delete
void risky_function() {
    Widget* ptr = new Widget();     // 1. Allocate
    
    may_throw_function();          // 2. Exception here!
    
    delete ptr;                    // 3. Never reached
    // Result: Memory leak
}`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>RAII Solution</h4>
              <CodeBlock>{`// SAFE: RAII guarantees cleanup
void safe_function() {
    auto ptr = std::make_unique<Widget>();  // RAII
    
    may_throw_function();  // Exception here is OK
    
    // Destructor called during stack unwinding
    // No explicit delete needed
}`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Custom Guard</h4>
              <CodeBlock>{`// For C resources or complex cleanup
template<typename F>
class ScopeGuard {
    F cleanup_;
    bool dismissed_ = false;
    
public:
    explicit ScopeGuard(F cleanup) 
        : cleanup_(std::move(cleanup)) {}
        
    ~ScopeGuard() { 
        if (!dismissed_) cleanup_(); 
    }
    
    void dismiss() { dismissed_ = true; }
};

#define SCOPE_EXIT(code) \\
    auto CONCAT(guard_, __LINE__) = ScopeGuard([&] { code; })`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Stack Unwinding</h4>
              <CodeBlock>{`// What happens during exception:
void function() {
    std::string name;           // 1. Constructed
    auto ptr = std::make_unique<Widget>(); // 2. Constructed
    std::vector<int> data;      // 3. Constructed
    
    throw std::runtime_error("Oops!");
    
    // Stack unwinding (reverse order):
    // 3. ~vector() called - memory freed
    // 2. ~unique_ptr() called - Widget deleted  
    // 1. ~string() called - string memory freed
}`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Exception Safety Guarantees</h4>
          <CodeBlock>{`// 1. Basic Exception Safety
//    - No resource leaks
//    - Objects remain in valid (but unspecified) state
void basic_safety() {
    std::vector<Widget> widgets;
    widgets.emplace_back();  // Strong guarantee: either adds or throws
}

// 2. Strong Exception Safety  
//    - No resource leaks
//    - Program state unchanged if exception thrown
//    - "Commit or rollback" semantics
void strong_safety() {
    std::vector<Widget> widgets;
    Widget temp;  // Construct separately
    temp.initialize();  // May throw - widgets unchanged
    widgets.push_back(std::move(temp));  // No-throw move
}

// 3. No-throw Guarantee
//    - Never throws exceptions
//    - Usually for destructors, move constructors, swap
void nothrow_safety() noexcept {
    // Only no-throw operations
    std::swap(a, b);
    ptr.reset();
}`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current Simulation</h4>
            <StatusDisplay $type={state.totalLeaked > 0 ? 'error' : 'success'}>
              <strong>Allocated Objects:</strong> {state.allocatedObjects.length}<br/>
              <strong>Leaked Objects:</strong> {state.allocatedObjects.filter(obj => obj.leaked).length}<br/>
              <strong>Total Leaked:</strong> {state.totalLeaked} bytes<br/>
              <strong>Exception Point:</strong> {state.exceptionPoint}
            </StatusDisplay>
            
            <h4>💻 Current Example</h4>
            <CodeBlock>{getCurrentExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <ExceptionLeakVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Exception Leak Controls</h4>
            
            <div>
              <strong>Demonstration:</strong><br/>
              <Button 
                $variant={state.demonstration === 'unsafe_new' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'unsafe_new' }))}
              >
                Unsafe new/delete
              </Button>
              <Button 
                $variant={state.demonstration === 'raii_fix' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'raii_fix' }))}
              >
                RAII Solution
              </Button>
              <Button 
                $variant={state.demonstration === 'custom_guard' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'custom_guard' }))}
              >
                Custom Guard
              </Button>
              <Button 
                $variant={state.demonstration === 'exception_safety' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'exception_safety' }))}
              >
                Safety Levels
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Exception Point:</strong><br/>
              <Button 
                $variant={state.exceptionPoint === 'between_new_delete' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, exceptionPoint: 'between_new_delete' }))}
              >
                Between new/delete
              </Button>
              <Button 
                $variant={state.exceptionPoint === 'in_constructor' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, exceptionPoint: 'in_constructor' }))}
              >
                In Constructor
              </Button>
              <Button 
                $variant={state.exceptionPoint === 'in_function_call' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, exceptionPoint: 'in_function_call' }))}
              >
                In Function Call
              </Button>
              <Button 
                $variant={state.exceptionPoint === 'none' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, exceptionPoint: 'none' }))}
              >
                No Exception
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Simulate Scenarios:</strong><br/>
              <Button onClick={simulateUnsafeLeak} $variant="danger">
                💥 Simulate Leak (unsafe new)
              </Button>
              <Button onClick={simulateSafeAllocation} $variant="primary">
                ✅ Safe Allocation (RAII)
              </Button>
              <Button onClick={clearAll} $variant="secondary">
                🗑️ Clear All
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                $variant={state.showLeakDetection ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showLeakDetection: !prev.showLeakDetection }))}
              >
                {state.showLeakDetection ? 'Hide' : 'Show'} Leak Detection
              </Button>
              
              <Button 
                $variant={state.raiiEnabled ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, raiiEnabled: !prev.raiiEnabled }))}
              >
                {state.raiiEnabled ? 'Disable' : 'Enable'} RAII Mode
              </Button>
            </div>

            <StatusDisplay $type="warning">
              <strong>Key Principles:</strong><br/>
              • <Highlight $color="#ff4757">Never</Highlight> use naked new/delete in modern C++<br/>
              • <Highlight $color="#2ed573">Always</Highlight> prefer RAII (smart pointers, containers)<br/>
              • <Highlight $color="#00d4ff">Destructors</Highlight> are called during stack unwinding<br/>
              • <Highlight $color="#ffa500">Exception safety</Highlight> requires careful resource management<br/>
              • <Highlight>Scope guards</Highlight> help with C resources and complex cleanup
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson32_ExceptionLeaks;