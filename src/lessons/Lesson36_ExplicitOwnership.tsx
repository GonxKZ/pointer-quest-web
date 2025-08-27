import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { THREE } from '../utils/three';

interface OwnershipState {
  pointers: {
    id: number;
    name: string;
    type: 'owner' | 'observer' | 'ambiguous';
    target: string;
    isValid: boolean;
    responsibility: 'owns' | 'observes' | 'unclear';
    color: string;
  }[];
  codeSnippets: {
    id: number;
    title: string;
    code: string;
    ownershipClarity: 'clear' | 'ambiguous' | 'dangerous';
    issues: string[];
  }[];
  selectedPointer: number | null;
  demonstration: 'ownership_intent' | 'api_clarity' | 'migration' | 'guidelines';
  currentExample: number;
  showAnnotations: boolean;
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

function OwnershipVisualization({ state }: { state: OwnershipState }) {
  const { pointers, selectedPointer, demonstration, showAnnotations, currentExample, codeSnippets } = state;

  const renderOwnershipIntent = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#00d4ff"
        anchorX="center"
      >
        Explicit Ownership Intent
      </Text>
      
      {/* Ownership comparison */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#ffa500"
          anchorX="center"
        >
          Pointer Ownership Roles
        </Text>
        
        {pointers.map((ptr, index) => (
          <group key={`ptr-${ptr.id}`} position={[index * 2.5 - pointers.length * 1.25, 0, 0]}>
            {/* Pointer box */}
            <Box args={[2, 1, 0.3]}>
              <meshStandardMaterial 
                color={selectedPointer === index ? '#ff6b7a' : ptr.color}
                transparent 
                opacity={0.8} 
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
              {ptr.type === 'owner' ? 'owner<T*>' : ptr.type === 'observer' ? 'T*' : 'T*'}
            </Text>
            <Text
              position={[0, -0.2, 0.2]}
              fontSize={0.08}
              color={ptr.responsibility === 'owns' ? '#2ed573' : ptr.responsibility === 'observes' ? '#00d4ff' : '#ff4757'}
              anchorX="center"
            >
              {ptr.responsibility === 'owns' ? 'OWNS' : ptr.responsibility === 'observes' ? 'OBSERVES' : 'UNCLEAR'}
            </Text>
            
            {/* Resource visualization */}
            <group position={[0, -1, 0]}>
              <Box args={[1.5, 0.6, 0.2]}>
                <meshStandardMaterial 
                  color={ptr.isValid ? '#2ed573' : '#ff4757'}
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
                {ptr.target}
              </Text>
            </group>
            
            {/* Arrow */}
            <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.08, 0.3]} />
              <meshStandardMaterial color={ptr.color} />
            </mesh>
          </group>
        ))}
      </group>
      
      {showAnnotations && (
        <group position={[0, -0.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.1}
            color="#ffa500"
            anchorX="center"
          >
            💡 owner&lt;T*&gt; clearly indicates ownership responsibility
          </Text>
        </group>
      )}
    </group>
  );

  const renderApiClarity = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#2ed573"
        anchorX="center"
      >
        API Design Clarity
      </Text>
      
      {/* Function signatures */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Function Signatures
        </Text>
        
        {[
          { sig: 'void process(Widget* w)', clarity: 'ambiguous', color: '#ff4757' },
          { sig: 'void process(owner<Widget*> w)', clarity: 'clear ownership', color: '#2ed573' },
          { sig: 'void observe(Widget* w)', clarity: 'observer pattern', color: '#00d4ff' }
        ].map((func, index) => (
          <group key={`func-${index}`} position={[0, 0.4 - index * 0.4, 0]}>
            <Box args={[5.5, 0.3, 0.2]}>
              <meshStandardMaterial color={func.color} transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {func.sig}
            </Text>
            <Text
              position={[0, -0.2, 0]}
              fontSize={0.07}
              color="#888"
              anchorX="center"
            >
              {func.clarity}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Current code example */}
      <group position={[0, -1, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#ffa500"
          anchorX="center"
        >
          Current Example: {codeSnippets[currentExample]?.title}
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={0.09}
          color={
            codeSnippets[currentExample]?.ownershipClarity === 'clear' ? '#2ed573' :
            codeSnippets[currentExample]?.ownershipClarity === 'ambiguous' ? '#ffa500' : '#ff4757'
          }
          anchorX="center"
        >
          Ownership Clarity: {codeSnippets[currentExample]?.ownershipClarity.toUpperCase()}
        </Text>
      </group>
    </group>
  );

  const renderMigration = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#9b59b6"
        anchorX="center"
      >
        Migration Strategy
      </Text>
      
      {/* Migration steps */}
      <group position={[0, 1, 0]}>
        {[
          { step: '1. Identify', desc: 'Find ownership-ambiguous APIs', color: '#ff4757' },
          { step: '2. Annotate', desc: 'Add owner<T*> to owning parameters', color: '#ffa500' },
          { step: '3. Document', desc: 'Update API documentation', color: '#00d4ff' },
          { step: '4. Validate', desc: 'Run static analysis tools', color: '#2ed573' }
        ].map((migration, index) => (
          <group key={`migration-${index}`} position={[0, 1.2 - index * 0.4, 0]}>
            <Box args={[4.5, 0.3, 0.2]}>
              <meshStandardMaterial color={migration.color} transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.09}
              color="white"
              anchorX="center"
            >
              {migration.step}: {migration.desc}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Benefits */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#2ed573"
          anchorX="center"
        >
          Migration Benefits
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={0.09}
          color="white"
          anchorX="center"
        >
          ✅ Clearer contracts  ✅ Fewer bugs  ✅ Better tooling support
        </Text>
      </group>
    </group>
  );

  const renderGuidelines = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ff6b7a"
        anchorX="center"
      >
        C++ Core Guidelines
      </Text>
      
      {/* Guidelines */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Relevant Guidelines
        </Text>
        
        {[
          { rule: 'I.11', desc: 'Never transfer ownership by raw pointer (T*)', status: 'critical' },
          { rule: 'F.7', desc: 'For general use, take T* arguments rather than smart pointers', status: 'info' },
          { rule: 'R.3', desc: 'A raw pointer (T*) is non-owning', status: 'important' },
          { rule: 'GSL.owner', desc: 'Use owner<T*> to mark owning pointers', status: 'solution' }
        ].map((guideline, index) => (
          <group key={`guideline-${index}`} position={[0, 0.2 - index * 0.3, 0]}>
            <Box args={[5, 0.25, 0.2]}>
              <meshStandardMaterial 
                color={
                  guideline.status === 'critical' ? '#ff4757' :
                  guideline.status === 'important' ? '#ffa500' :
                  guideline.status === 'solution' ? '#2ed573' : '#00d4ff'
                } 
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
              {guideline.rule}: {guideline.desc}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Tool integration */}
      <group position={[0, -1, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#9b59b6"
          anchorX="center"
        >
          Tool Support
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={0.09}
          color="white"
          anchorX="center"
        >
          🔧 GSL Checker  🔍 Clang-Tidy  📊 Static Analyzers
        </Text>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {demonstration === 'ownership_intent' && renderOwnershipIntent()}
      {demonstration === 'api_clarity' && renderApiClarity()}
      {demonstration === 'migration' && renderMigration()}
      {demonstration === 'guidelines' && renderGuidelines()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson36_ExplicitOwnership: React.FC = () => {
  const [state, setState] = useState<OwnershipState>({
    pointers: [
      { id: 1, name: 'raw_ptr', type: 'ambiguous', target: 'Widget', isValid: true, responsibility: 'unclear', color: '#ff4757' },
      { id: 2, name: 'owner_ptr', type: 'owner', target: 'Widget', isValid: true, responsibility: 'owns', color: '#2ed573' },
      { id: 3, name: 'observer_ptr', type: 'observer', target: 'Widget', isValid: true, responsibility: 'observes', color: '#00d4ff' }
    ],
    codeSnippets: [
      {
        id: 1,
        title: 'Ambiguous API',
        code: 'void process(Widget* widget) {\n    // Who owns widget?\n    // Should I delete it?\n}',
        ownershipClarity: 'ambiguous',
        issues: ['Unclear ownership', 'Potential memory leaks', 'Double delete risk']
      },
      {
        id: 2,
        title: 'Clear Ownership',
        code: 'void take_ownership(owner<Widget*> widget) {\n    // I now own widget\n    // I must delete it\n}',
        ownershipClarity: 'clear',
        issues: []
      },
      {
        id: 3,
        title: 'Observer Pattern',
        code: 'void observe_widget(Widget* widget) {\n    // I only observe\n    // Someone else owns it\n}',
        ownershipClarity: 'clear',
        issues: []
      }
    ],
    selectedPointer: null,
    demonstration: 'ownership_intent',
    currentExample: 0,
    showAnnotations: true
  });

  const addPointer = (type: OwnershipState['pointers'][0]['type']) => {
    const colors = { owner: '#2ed573', observer: '#00d4ff', ambiguous: '#ff4757' };
    const responsibilities = { owner: 'owns', observer: 'observes', ambiguous: 'unclear' } as const;
    
    const newPointer = {
      id: Date.now(),
      name: `${type}_${state.pointers.length}`,
      type,
      target: 'Resource',
      isValid: true,
      responsibility: responsibilities[type],
      color: colors[type]
    };
    
    setState(prev => ({
      ...prev,
      pointers: [...prev.pointers, newPointer]
    }));
  };

  const nextExample = () => {
    setState(prev => ({
      ...prev,
      currentExample: (prev.currentExample + 1) % prev.codeSnippets.length
    }));
  };

  const getCurrentCodeExample = () => {
    const { demonstration, currentExample } = state;
    
    if (demonstration === 'ownership_intent') {
      return `// GSL owner<T*> for explicit ownership
#include <gsl/gsl>
using gsl::owner;

// BEFORE: Ambiguous ownership
void bad_api(Widget* widget) {
    // Unclear: Who owns widget? Should I delete it?
    widget->process();
    // delete widget; // Should I? Shouldn't I?
}

// AFTER: Explicit ownership
void clear_api(owner<Widget*> widget) {
    // Clear: I now own widget, must manage its lifetime
    widget->process();
    delete widget;  // My responsibility
}

void observe_only(Widget* widget) {
    // Clear: I don't own widget, someone else manages it
    widget->process();
    // No delete - not my responsibility
}`;
    }
    
    if (demonstration === 'api_clarity') {
      return state.codeSnippets[currentExample].code;
    }
    
    if (demonstration === 'migration') {
      return `// Migration strategy for existing codebase
class ResourceManager {
public:
    // Step 1: Identify ownership-ambiguous functions
    void process_resource(Resource* res);  // Ambiguous!
    
    // Step 2: Add owner<T*> annotations
    void take_resource(owner<Resource*> res) {
        resources_.emplace_back(res);  // Take ownership
    }
    
    // Step 3: Keep observers as T*
    void inspect_resource(Resource* res) const {
        // Just observing, no ownership transfer
        res->validate();
    }
    
    // Step 4: Update documentation
    /// @param res Resource to take ownership of (caller transfers ownership)
    void documented_take(owner<Resource*> res);
    
    /// @param res Resource to observe (caller retains ownership)  
    void documented_observe(Resource* res);
    
private:
    std::vector<std::unique_ptr<Resource>> resources_;
};`;
    }
    
    return `// C++ Core Guidelines compliance
// I.11: Never transfer ownership by a raw pointer (T*)
// F.7: For general use, take T* arguments rather than smart pointers
// R.3: A raw pointer (T*) is non-owning
// GSL.owner: Use owner<T*> to mark owning pointers

#include <gsl/gsl>

class ModernAPI {
public:
    // ✅ GOOD: Clear ownership transfer
    void take_ownership(gsl::owner<Widget*> widget) {
        widgets_.emplace_back(widget);
    }
    
    // ✅ GOOD: Clear observation pattern
    void process_widget(Widget* widget) {
        widget->update();  // Don't delete
    }
    
    // ❌ BAD: Ambiguous ownership
    void unclear_function(Widget* widget) {
        // Should I delete widget?
        // Who owns it?
    }
    
    // ✅ GOOD: Factory with clear ownership
    gsl::owner<Widget*> create_widget() {
        return new Widget();  // Caller owns the result
    }
    
    // ✅ GOOD: Modern alternative with smart pointers
    std::unique_ptr<Widget> create_widget_modern() {
        return std::make_unique<Widget>();
    }
    
private:
    std::vector<std::unique_ptr<Widget>> widgets_;
};

// Static analysis benefits:
// - Clang-Tidy can warn about owner<T*> misuse
// - GSL checker validates ownership transfers
// - Code becomes self-documenting`;
  };

  return (
    <Container>
      <Header>
        <Title>👑 Explicit Ownership with owner&lt;T*&gt;</Title>
        <Subtitle>Make ownership intent crystal clear with GSL owner annotations</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Explicit Ownership Theory</h3>
          
          <StatusDisplay $type="info">
            <strong>gsl::owner&lt;T*&gt;</strong><br/>
            A type alias that explicitly marks owning pointers in API design.
            Part of the Guidelines Support Library implementing Core Guidelines.
          </StatusDisplay>

          <h4>🎯 Core Problem</h4>
          <Grid>
            <InfoCard>
              <h4>Ambiguous APIs</h4>
              <CodeBlock>{`// Problem: Unclear ownership
void process(Widget* widget) {
    widget->update();
    // Should I delete widget?
    // Who is responsible for cleanup?
}

// Usage confusion:
Widget* w = new Widget();
process(w);  // Did process() take ownership?
// delete w; // Safe? Double delete?`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>owner&lt;T*&gt; Solution</h4>
              <CodeBlock>{`// Solution: Explicit ownership
using gsl::owner;

void take_ownership(owner<Widget*> widget) {
    // Clear: I now own widget
    widget->update();
    delete widget;  // My responsibility
}

void observe_only(Widget* widget) {
    // Clear: I only observe
    widget->update();
    // No delete - not my job
}`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Implementation</h4>
              <CodeBlock>{`// owner<T*> is just a type alias
namespace gsl {
    template<typename T>
    using owner = T;  // Zero runtime overhead
}

// Provides semantic meaning without cost
owner<int*> ptr = new int(42);
delete ptr;  // Clear intent

// Static analyzers understand the annotation
// Clang-Tidy, GSL checker, etc.`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Migration Example</h4>
              <CodeBlock>{`// Before: Confusing API
class FileManager {
    void process(FILE* file);  // Who closes it?
};

// After: Clear intent
class FileManager {
    void take_file(owner<FILE*> file) {
        // I will fclose(file)
    }
    
    void read_file(FILE* file) {
        // I only read, caller manages lifetime
    }
};`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Benefits</h4>
          <CodeBlock>{`// 1. Self-documenting code
owner<Resource*> create_resource();  // Caller owns result
void consume(owner<Resource*> r);    // Function takes ownership
void inspect(Resource* r);           // Function only observes

// 2. Static analysis support
void check_ownership(owner<Widget*> w) {
    // Tools can verify proper delete
    delete w;  // ✅ OK - owner should delete
}

void check_observer(Widget* w) {
    // delete w;  // ⚠️ Warning - non-owner shouldn't delete
}

// 3. API contract clarity
class ResourcePool {
public:
    // Clear: Takes ownership
    void add_resource(owner<Resource*> res);
    
    // Clear: Just borrows reference  
    void process_resource(Resource* res);
    
    // Clear: Returns ownership to caller
    owner<Resource*> remove_resource(int id);
};

// 4. Gradual migration
// Can be added incrementally to existing code
// Zero runtime cost - just documentation
// Compatible with existing T* usage`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current Analysis</h4>
            <StatusDisplay $type="success">
              <strong>Pointers:</strong> {state.pointers.length}<br/>
              <strong>Clear Ownership:</strong> {state.pointers.filter(p => p.responsibility !== 'unclear').length}<br/>
              <strong>Current Example:</strong> {state.codeSnippets[state.currentExample]?.title}
            </StatusDisplay>
            
            <h4>💻 Code Example</h4>
            <CodeBlock>{getCurrentCodeExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <OwnershipVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Ownership Controls</h4>
            
            <div>
              <strong>Demonstration:</strong><br/>
              <Button 
                $variant={state.demonstration === 'ownership_intent' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'ownership_intent' }))}
              >
                Ownership Intent
              </Button>
              <Button 
                $variant={state.demonstration === 'api_clarity' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'api_clarity' }))}
              >
                API Clarity
              </Button>
              <Button 
                $variant={state.demonstration === 'migration' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'migration' }))}
              >
                Migration
              </Button>
              <Button 
                $variant={state.demonstration === 'guidelines' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'guidelines' }))}
              >
                Guidelines
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Add Pointers:</strong><br/>
              <Button onClick={() => addPointer('owner')}>
                👑 owner&lt;T*&gt;
              </Button>
              <Button onClick={() => addPointer('observer')}>
                👁️ Observer T*
              </Button>
              <Button onClick={() => addPointer('ambiguous')}>
                ❓ Ambiguous T*
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Code Examples:</strong><br/>
              <Button onClick={nextExample}>
                ➡️ Next Example
              </Button>
              
              {state.codeSnippets[state.currentExample] && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <div><strong>{state.codeSnippets[state.currentExample].title}</strong></div>
                  <div style={{ color: 
                    state.codeSnippets[state.currentExample].ownershipClarity === 'clear' ? '#2ed573' : 
                    state.codeSnippets[state.currentExample].ownershipClarity === 'ambiguous' ? '#ffa500' : '#ff4757'
                  }}>
                    Clarity: {state.codeSnippets[state.currentExample].ownershipClarity}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Pointer Management:</strong><br/>
              {state.pointers.map((ptr, index) => (
                <div key={ptr.id} style={{ marginTop: '0.5rem' }}>
                  <Button 
                    $variant={state.selectedPointer === index ? 'primary' : 'secondary'}
                    onClick={() => setState(prev => ({ ...prev, selectedPointer: index === prev.selectedPointer ? null : index }))}
                  >
                    {ptr.name} ({ptr.responsibility})
                  </Button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                $variant={state.showAnnotations ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showAnnotations: !prev.showAnnotations }))}
              >
                {state.showAnnotations ? 'Hide' : 'Show'} Annotations
              </Button>
            </div>

            <StatusDisplay $type="info">
              <strong>Core Guidelines:</strong><br/>
              • <Highlight $color="#ff4757">I.11</Highlight>: Never transfer ownership by raw pointer<br/>
              • <Highlight $color="#00d4ff">F.7</Highlight>: Take T* arguments rather than smart pointers<br/>
              • <Highlight $color="#2ed573">R.3</Highlight>: Raw pointer (T*) is non-owning<br/>
              • <Highlight $color="#ffa500">GSL.owner</Highlight>: Use owner&lt;T*&gt; to mark owning pointers<br/>
              • <Highlight>Zero cost</Highlight>: Just a type alias for documentation
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson36_ExplicitOwnership;