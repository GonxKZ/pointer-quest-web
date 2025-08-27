import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { THREE } from '../utils/three';

interface NotNullState {
  pointers: { 
    id: number; 
    name: string; 
    type: 'raw' | 'not_null' | 'optional';
    value: string | null;
    isValid: boolean;
    nullCheckRequired: boolean;
    assertionLevel: 'none' | 'debug' | 'always';
  }[];
  selectedPointer: number | null;
  demonstration: 'basic_wrapper' | 'api_design' | 'validation' | 'integration';
  showAssertions: boolean;
  runtimeChecks: boolean;
  currentError: string | null;
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

function NotNullVisualization({ state }: { state: NotNullState }) {
  const { pointers, selectedPointer, demonstration, showAssertions, currentError } = state;

  const getPointerColor = (type: string, isValid: boolean) => {
    if (!isValid) return '#ff4757';
    
    const colors = {
      'raw': '#57606f',
      'not_null': '#2ed573',
      'optional': '#00d4ff'
    };
    return colors[type as keyof typeof colors] || '#57606f';
  };

  const renderBasicWrapper = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#00d4ff"
        anchorX="center"
      >
        not_null&lt;T*&gt; Wrapper
      </Text>
      
      {/* Pointer comparison */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#ffa500"
          anchorX="center"
        >
          Pointer Types Comparison
        </Text>
        
        {pointers.map((ptr, index) => (
          <group key={`ptr-${ptr.id}`} position={[index * 2.5 - pointers.length * 1.25, 0, 0]}>
            {/* Pointer visualization */}
            <Box args={[2, 1, 0.3]}>
              <meshStandardMaterial 
                color={getPointerColor(ptr.type, ptr.isValid)}
                transparent 
                opacity={selectedPointer === index ? 0.9 : 0.7} 
              />
            </Box>
            
            <Text
              position={[0, 0.2, 0.2]}
              fontSize={0.1}
              color="white"
              anchorX="center"
            >
              {ptr.name}
            </Text>
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.09}
              color="white"
              anchorX="center"
            >
              {ptr.type}
            </Text>
            <Text
              position={[0, -0.2, 0.2]}
              fontSize={0.08}
              color={ptr.isValid ? '#4ade80' : '#ff6b7a'}
              anchorX="center"
            >
              {ptr.isValid ? 'Valid' : 'Invalid'}
            </Text>
            
            {/* Arrow to value */}
            <mesh position={[0, -0.8, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.1, 0.3]} />
              <meshStandardMaterial color={ptr.isValid ? '#2ed573' : '#ff4757'} />
            </mesh>
            
            {/* Value visualization */}
            <group position={[0, -1.3, 0]}>
              <Box args={[1.5, 0.6, 0.2]}>
                <meshStandardMaterial 
                  color={ptr.value ? '#2ed573' : '#ff4757'}
                  transparent 
                  opacity={0.6} 
                />
              </Box>
              <Text
                position={[0, 0, 0.15]}
                fontSize={0.08}
                color="white"
                anchorX="center"
              >
                {ptr.value || 'nullptr'}
              </Text>
            </group>
          </group>
        ))}
      </group>
      
      {/* Null check requirements */}
      <group position={[0, -0.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#ffa500"
          anchorX="center"
        >
          Null Check Requirements
        </Text>
        
        {pointers.map((ptr, index) => (
          <group key={`check-${ptr.id}`} position={[index * 2.5 - pointers.length * 1.25, 0, 0]}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.09}
              color={ptr.nullCheckRequired ? '#ff4757' : '#2ed573'}
              anchorX="center"
            >
              {ptr.nullCheckRequired ? 'Check Required' : 'No Check Needed'}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );

  const renderApiDesign = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#2ed573"
        anchorX="center"
      >
        API Design with Intent
      </Text>
      
      {/* Function signatures */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Function Signature Intent
        </Text>
        
        {[
          { 
            signature: 'void process(Widget* ptr)', 
            intent: 'May be null - caller must check',
            color: '#ff4757' 
          },
          { 
            signature: 'void process(not_null<Widget*> ptr)', 
            intent: 'Never null - no check needed',
            color: '#2ed573' 
          },
          { 
            signature: 'void process(Widget& ref)', 
            intent: 'Never null but copies large objects',
            color: '#ffa500' 
          }
        ].map((item, index) => (
          <group key={`api-${index}`} position={[0, 0.4 - index * 0.4, 0]}>
            <Box args={[6, 0.3, 0.2]}>
              <meshStandardMaterial color={item.color} transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0.05, 0.15]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {item.signature}
            </Text>
            <Text
              position={[0, -0.1, 0.15]}
              fontSize={0.07}
              color="#ccc"
              anchorX="center"
            >
              {item.intent}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Benefits */}
      <group position={[0, -1, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#00d4ff"
          anchorX="center"
        >
          Clear Intent Benefits
        </Text>
        
        <Text
          position={[0, 0, 0]}
          fontSize={0.1}
          color="#2ed573"
          anchorX="center"
        >
          ✅ Self-documenting code
        </Text>
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.1}
          color="#2ed573"
          anchorX="center"
        >
          ✅ Eliminates unnecessary null checks
        </Text>
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.1}
          color="#2ed573"
          anchorX="center"
        >
          ✅ Compiler/analyzer support
        </Text>
      </group>
    </group>
  );

  const renderValidation = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ffa500"
        anchorX="center"
      >
        Runtime Validation
      </Text>
      
      {/* Assertion levels */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Assertion Levels
        </Text>
        
        {[
          { level: 'None', description: 'Trust the programmer', cost: 'Zero', color: '#57606f' },
          { level: 'Debug', description: 'Check in debug builds only', cost: 'Debug only', color: '#ffa500' },
          { level: 'Always', description: 'Always validate', cost: 'Runtime cost', color: '#ff4757' }
        ].map((assertion, index) => (
          <group key={`assertion-${index}`} position={[0, 0.2 - index * 0.3, 0]}>
            <Box args={[4.5, 0.25, 0.2]}>
              <meshStandardMaterial 
                color={assertion.color} 
                transparent 
                opacity={showAssertions && index === 1 ? 0.9 : 0.6} 
              />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {assertion.level}: {assertion.description} ({assertion.cost})
            </Text>
          </group>
        ))}
      </group>
      
      {/* Current error display */}
      {currentError && (
        <group position={[0, -0.8, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.12}
            color="#ff4757"
            anchorX="center"
          >
            🚨 {currentError}
          </Text>
        </group>
      )}
      
      {/* Validation flow */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#2ed573"
          anchorX="center"
        >
          Validation Flow
        </Text>
        
        {[
          '1. Constructor checks non-null',
          '2. Assignment checks non-null', 
          '3. Dereference is safe'
        ].map((step, index) => (
          <Text
            key={`step-${index}`}
            position={[0, 0 - index * 0.15, 0]}
            fontSize={0.09}
            color="#00d4ff"
            anchorX="center"
          >
            {step}
          </Text>
        ))}
      </group>
    </group>
  );

  const renderIntegration = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#9b59b6"
        anchorX="center"
      >
        Guidelines Integration
      </Text>
      
      {/* Core Guidelines integration */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          C++ Core Guidelines Support
        </Text>
        
        {[
          { rule: 'I.12', description: 'Declare pointer that cannot be null as not_null', support: 'Full' },
          { rule: 'F.23', description: 'Use not_null to indicate non-null', support: 'Full' },
          { rule: 'GSL', description: 'Guidelines Support Library', support: 'Reference' }
        ].map((guideline, index) => (
          <group key={`guideline-${index}`} position={[0, 0.2 - index * 0.3, 0]}>
            <Box args={[5, 0.25, 0.2]}>
              <meshStandardMaterial color="#9b59b6" transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {guideline.rule}: {guideline.description} ({guideline.support})
            </Text>
          </group>
        ))}
      </group>
      
      {/* Tool integration */}
      <group position={[0, 0, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#ffa500"
          anchorX="center"
        >
          Tool Integration
        </Text>
        
        {[
          'Static analyzers understand intent',
          'IDE warnings for null assignments',
          'Runtime debugging support'
        ].map((tool, index) => (
          <Text
            key={`tool-${index}`}
            position={[0, 0 - index * 0.2, 0]}
            fontSize={0.09}
            color="#2ed573"
            anchorX="center"
          >
            ✅ {tool}
          </Text>
        ))}
      </group>
      
      {/* Migration strategy */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#00d4ff"
          anchorX="center"
        >
          Migration Strategy
        </Text>
        
        <Text
          position={[0, 0, 0]}
          fontSize={0.09}
          color="white"
          anchorX="center"
        >
          1. Start with new APIs → 2. Gradually convert existing code
        </Text>
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.09}
          color="white"
          anchorX="center"
        >
          → 3. Enable static analysis → 4. Profit from clearer intent
        </Text>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {demonstration === 'basic_wrapper' && renderBasicWrapper()}
      {demonstration === 'api_design' && renderApiDesign()}
      {demonstration === 'validation' && renderValidation()}
      {demonstration === 'integration' && renderIntegration()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson35_NotNull: React.FC = () => {
  const [state, setState] = useState<NotNullState>({
    pointers: [
      { 
        id: 1, 
        name: 'raw_ptr', 
        type: 'raw', 
        value: 'Widget@0x1234', 
        isValid: true,
        nullCheckRequired: true,
        assertionLevel: 'none'
      },
      { 
        id: 2, 
        name: 'safe_ptr', 
        type: 'not_null', 
        value: 'Widget@0x1234', 
        isValid: true,
        nullCheckRequired: false,
        assertionLevel: 'debug'
      }
    ],
    selectedPointer: 0,
    demonstration: 'basic_wrapper',
    showAssertions: true,
    runtimeChecks: true,
    currentError: null
  });

  const addPointer = (type: NotNullState['pointers'][0]['type']) => {
    const newPointer = {
      id: Date.now(),
      name: `ptr_${state.pointers.length}`,
      type,
      value: type === 'not_null' ? 'Widget@0x5678' : Math.random() > 0.5 ? 'Widget@0x5678' : null,
      isValid: type === 'not_null' ? true : Math.random() > 0.3,
      nullCheckRequired: type === 'raw',
      assertionLevel: 'debug' as const
    };
    
    setState(prev => ({
      ...prev,
      pointers: [...prev.pointers, newPointer]
    }));
  };

  const setPointerValue = (index: number, value: string | null) => {
    setState(prev => ({
      ...prev,
      pointers: prev.pointers.map((ptr, i) => 
        i === index ? { 
          ...ptr, 
          value,
          isValid: ptr.type === 'not_null' ? value !== null : true
        } : ptr
      )
    }));
  };

  const simulateNullAssignment = () => {
    const notNullIndex = state.pointers.findIndex(p => p.type === 'not_null');
    if (notNullIndex !== -1) {
      setState(prev => ({
        ...prev,
        currentError: 'Assertion failed: not_null<T*> cannot be null!'
      }));
      
      setTimeout(() => {
        setState(prev => ({ ...prev, currentError: null }));
      }, 3000);
    }
  };

  const getCurrentExample = () => {
    const { demonstration } = state;
    
    if (demonstration === 'basic_wrapper') {
      return `// GSL not_null wrapper implementation
#include <gsl/gsl>  // Guidelines Support Library

// Basic usage
void process_widget(gsl::not_null<Widget*> widget) {
    // No null check needed - guaranteed non-null
    widget->do_something();
    widget->update();
}

// Construction requires non-null value
Widget w;
gsl::not_null<Widget*> ptr = &w;        // ✅ OK
// gsl::not_null<Widget*> bad = nullptr; // 💥 Assertion failure

// Assignment also checked
ptr = &another_widget;                   // ✅ OK  
// ptr = nullptr;                        // 💥 Assertion failure

// Dereferencing is safe
*ptr;         // No null check needed
ptr->method(); // Direct access`;
    }
    
    if (demonstration === 'api_design') {
      return `// Clear API intent with not_null
class ResourceManager {
public:
    // Old API - unclear if null is allowed
    void process_resource(Resource* res);
    
    // New API - clear intent
    void process_resource(gsl::not_null<Resource*> res) {
        // No null check needed - caller guarantees non-null
        res->process();
        res->validate();
    }
    
    // Optional resource - null allowed
    void maybe_process(Resource* optional_res) {
        if (optional_res) {
            process_resource(gsl::not_null{optional_res});
        }
    }
    
    // Factory returns guaranteed non-null
    gsl::not_null<std::unique_ptr<Resource>> create_resource() {
        auto res = std::make_unique<Resource>();
        // Compiler/analyzer knows this can't be null
        return gsl::not_null{std::move(res)};
    }
};

// Usage is clearer
ResourceManager mgr;
Resource* maybe_null = get_resource();
if (maybe_null) {
    mgr.process_resource(gsl::not_null{maybe_null});
}`;
    }
    
    if (demonstration === 'validation') {
      return `// not_null validation strategies
template<typename T>
class not_null {
    T ptr_;
    
    void ensure_not_null() const {
#ifdef GSL_THROW_ON_CONTRACT_VIOLATION
        if (!ptr_) throw std::invalid_argument("not_null violation");
#elif defined(GSL_TERMINATE_ON_CONTRACT_VIOLATION)
        if (!ptr_) std::terminate();
#elif defined(GSL_ASSERTION_LEVEL_DEBUG) && defined(_DEBUG)
        assert(ptr_ != nullptr);
#elif defined(GSL_ASSERTION_LEVEL_AUDIT)
        if (!ptr_) std::terminate();
#endif
    }
    
public:
    // Construction validation
    template<typename U>
    not_null(U&& u) : ptr_(std::forward<U>(u)) {
        ensure_not_null();
    }
    
    // Assignment validation  
    template<typename U>
    not_null& operator=(U&& u) {
        ptr_ = std::forward<U>(u);
        ensure_not_null();
        return *this;
    }
    
    // Safe operations
    T get() const noexcept { return ptr_; }
    operator T() const noexcept { return ptr_; }
    T operator->() const noexcept { return ptr_; }
    auto& operator*() const { return *ptr_; }
};`;
    }
    
    return `// Integration with Core Guidelines and tools
// C++ Core Guidelines integration:
// I.12: Declare pointer that cannot be null as not_null
// F.23: Use not_null<T> to indicate that T cannot be nullptr

// Static analyzer benefits:
void analyze_function(gsl::not_null<Widget*> widget,
                     Widget* maybe_null) {
    // Analyzer knows widget is never null
    widget->method();  // No null check warning
    
    // Analyzer warns about potential null dereference
    maybe_null->method();  // Warning: possible null dereference
    
    // Safe conversion
    if (maybe_null) {
        auto safe = gsl::not_null{maybe_null};
        safe->method();  // No warning after null check
    }
}

// Migration strategy:
class ModernAPI {
    // Step 1: New functions use not_null
    void new_function(gsl::not_null<Data*> data);
    
    // Step 2: Gradually convert existing functions
    void old_function(Data* data) {
        if (data) {
            new_function(gsl::not_null{data});
        }
    }
    
    // Step 3: Eventually remove old overloads
    [[deprecated("Use not_null version")]]
    void legacy_function(Data* data);
};

// Compiler integration:
// - Clang static analyzer understands gsl::not_null
// - MSVC /analyze provides enhanced warnings
// - PVS-Studio, Clang-Tidy support GSL annotations`;
  };

  const getValidPointerCount = () => {
    return state.pointers.filter(p => p.isValid).length;
  };

  return (
    <Container>
      <Header>
        <Title>🛡️ not_null&lt;T*&gt; Wrapper</Title>
        <Subtitle>Non-null observer pointers with explicit intent</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 not_null Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>gsl::not_null&lt;T*&gt;</strong><br/>
            A lightweight wrapper that expresses non-null intent in API design.
            Part of the Guidelines Support Library (GSL) and C++ Core Guidelines.
          </StatusDisplay>

          <h4>🎯 Core Benefits</h4>
          <Grid>
            <InfoCard>
              <h4>Clear Intent</h4>
              <CodeBlock>{`// Before: Unclear intent
void process(Widget* widget);  // Can widget be null?

// After: Explicit intent
void process(gsl::not_null<Widget*> widget);
// Clearly communicates: widget cannot be null

// Caller must ensure non-null
Widget* maybe_null = get_widget();
if (maybe_null) {
    process(gsl::not_null{maybe_null});
}`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>No Null Checks</h4>
              <CodeBlock>{`// Traditional code with null checks
void old_function(Widget* widget) {
    if (!widget) {
        // Handle null case
        return;
    }
    widget->do_something();
}

// not_null eliminates checks
void new_function(gsl::not_null<Widget*> widget) {
    // No null check needed!
    widget->do_something();
    widget->update();
}`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Construction Validation</h4>
              <CodeBlock>{`// Runtime validation on construction
Widget* ptr = get_widget();

// This may terminate/throw if ptr is null
gsl::not_null<Widget*> safe_ptr{ptr};

// Different assertion levels:
// - None: Trust programmer (fastest)
// - Debug: Assert in debug builds only  
// - Always: Runtime check (safest)

#define GSL_ASSERTION_LEVEL_DEBUG
// Now null assignments will assert in debug mode`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Static Analysis</h4>
              <CodeBlock>{`// Static analyzers understand not_null
void analyze_me(gsl::not_null<Widget*> guaranteed,
                Widget* maybe_null) {
    
    guaranteed->method();  // ✅ No analyzer warnings
    
    maybe_null->method();  // ⚠️  Analyzer warns: null deref
    
    if (maybe_null) {
        auto safe = gsl::not_null{maybe_null};
        safe->method();    // ✅ No warnings after check
    }
}

// Tools that understand not_null:
// - Clang Static Analyzer
// - MSVC /analyze  
// - PVS-Studio
// - Clang-Tidy GSL checks`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Implementation Details</h4>
          <CodeBlock>{`// Simplified not_null implementation
template<typename T>
class not_null {
    T ptr_;
    
    // Validation based on build configuration
    void ensure_invariant() const {
#if defined(GSL_THROW_ON_CONTRACT_VIOLATION)
        if (!ptr_) throw std::logic_error("not_null");
#elif defined(GSL_TERMINATE_ON_CONTRACT_VIOLATION)  
        if (!ptr_) std::terminate();
#elif defined(_DEBUG)
        assert(ptr_ != nullptr);
#endif
    }
    
public:
    // Disable default construction - must have value
    not_null() = delete;
    
    // Construction with validation
    template<typename U>
    constexpr not_null(U&& u) : ptr_(std::forward<U>(u)) {
        ensure_invariant();
    }
    
    // Assignment with validation
    template<typename U> 
    not_null& operator=(U&& u) {
        ptr_ = std::forward<U>(u);
        ensure_invariant(); 
        return *this;
    }
    
    // Safe access operations
    constexpr T get() const noexcept { return ptr_; }
    constexpr operator T() const noexcept { return ptr_; }
    constexpr T operator->() const noexcept { return ptr_; }
    constexpr auto& operator*() const noexcept { return *ptr_; }
    
    // No null assignment
    not_null& operator=(std::nullptr_t) = delete;
    
    // No null comparison needed - always false
    bool operator==(std::nullptr_t) const = delete;
    bool operator!=(std::nullptr_t) const = delete;
};

// Zero runtime overhead in release builds (typical)
static_assert(sizeof(not_null<int*>) == sizeof(int*));`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current State</h4>
            <StatusDisplay $type="success">
              <strong>Pointers:</strong> {state.pointers.length}<br/>
              <strong>Valid:</strong> {getValidPointerCount()}<br/>
              <strong>Runtime Checks:</strong> {state.runtimeChecks ? 'Enabled' : 'Disabled'}<br/>
              <strong>Current Error:</strong> {state.currentError || 'None'}
            </StatusDisplay>
            
            <h4>💻 Code Example</h4>
            <CodeBlock>{getCurrentExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <NotNullVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 not_null Controls</h4>
            
            <div>
              <strong>Demonstration:</strong><br/>
              <Button 
                $variant={state.demonstration === 'basic_wrapper' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'basic_wrapper' }))}
              >
                Basic Wrapper
              </Button>
              <Button 
                $variant={state.demonstration === 'api_design' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'api_design' }))}
              >
                API Design
              </Button>
              <Button 
                $variant={state.demonstration === 'validation' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'validation' }))}
              >
                Validation
              </Button>
              <Button 
                $variant={state.demonstration === 'integration' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'integration' }))}
              >
                Tool Integration
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Add Pointers:</strong><br/>
              <Button onClick={() => addPointer('raw')}>
                ➕ Raw Pointer
              </Button>
              <Button onClick={() => addPointer('not_null')}>
                🛡️ not_null Pointer
              </Button>
              <Button onClick={() => addPointer('optional')}>
                ❓ Optional Pointer
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Simulate Scenarios:</strong><br/>
              <Button onClick={simulateNullAssignment} $variant="danger">
                💥 Null Assignment Error
              </Button>
              <Button onClick={() => setState(prev => ({ 
                ...prev, 
                pointers: prev.pointers.map(p => ({ ...p, isValid: true }))
              }))}>
                ✅ Fix All Pointers
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Pointer Management:</strong><br/>
              {state.pointers.map((ptr, index) => (
                <div key={ptr.id} style={{ marginTop: '0.5rem' }}>
                  <Button 
                    $variant={state.selectedPointer === index ? 'primary' : 'secondary'}
                    onClick={() => setState(prev => ({ ...prev, selectedPointer: index }))}
                  >
                    {ptr.name} ({ptr.type})
                  </Button>
                  <Button 
                    onClick={() => setPointerValue(index, ptr.value ? null : 'Widget@0x9ABC')}
                    $variant={ptr.value ? 'danger' : 'primary'}
                  >
                    {ptr.value ? '🚫 Make Null' : '✅ Make Valid'}
                  </Button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                $variant={state.showAssertions ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showAssertions: !prev.showAssertions }))}
              >
                {state.showAssertions ? 'Hide' : 'Show'} Assertions
              </Button>
              
              <Button 
                $variant={state.runtimeChecks ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, runtimeChecks: !prev.runtimeChecks }))}
              >
                {state.runtimeChecks ? 'Disable' : 'Enable'} Runtime Checks
              </Button>
            </div>

            <StatusDisplay $type="success">
              <strong>Guidelines Integration:</strong><br/>
              • <Highlight $color="#2ed573">I.12</Highlight>: Declare non-null pointers as not_null<br/>
              • <Highlight $color="#00d4ff">F.23</Highlight>: Use not_null to indicate non-null<br/>
              • <Highlight $color="#ffa500">GSL</Highlight>: Guidelines Support Library provides implementation<br/>
              • <Highlight $color="#9b59b6">Tools</Highlight>: Static analyzers understand intent<br/>
              • <Highlight>Migration</Highlight>: Gradual adoption in existing codebases
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson35_NotNull;