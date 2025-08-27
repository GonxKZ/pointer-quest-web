import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { THREE } from '../utils/three';

interface ExaminationState {
  scenarios: {
    id: number;
    name: string;
    type: 'dangling_pointer' | 'double_delete' | 'illegal_alias' | 'shared_cycle' | 'shared_from_this_error' | 'vector_invalidation' | 'virtual_destructor' | 'const_cast_ub';
    description: string;
    status: 'unsolved' | 'diagnosed' | 'fixed';
    severity: 'low' | 'medium' | 'high' | 'critical';
    codeSnippet: string;
    fix: string;
  }[];
  currentScenario: number;
  memoryVisualization: {
    blocks: { id: string; status: 'valid' | 'leaked' | 'corrupted' | 'dangling'; type: string }[];
    pointers: { id: string; target: string | null; status: 'valid' | 'dangling' | 'null' }[];
  };
  gameStats: {
    totalScenarios: number;
    solved: number;
    timeElapsed: number;
    score: number;
    hintsUsed: number;
  };
  showHint: boolean;
  showSolution: boolean;
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

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #00d4ff;
  overflow-x: auto;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  max-height: 300px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
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
      case 'success':
        return `
          background: linear-gradient(135deg, #2ed573, #27ae60);
          color: white;
          &:hover { background: linear-gradient(135deg, #27ae60, #219a52); }
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

const ScenarioCard = styled.div<{ $selected: boolean; $status: string }>`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  border: 2px solid ${props => 
    props.$selected ? '#00d4ff' : 
    props.$status === 'fixed' ? '#2ed573' : 
    props.$status === 'diagnosed' ? '#ffa500' : 
    'rgba(0, 212, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const Highlight = styled.span<{ $color?: string }>`
  color: ${props => props.$color || '#00d4ff'};
  font-weight: bold;
`;

function ExaminationVisualization({ state }: { state: ExaminationState }) {
  const { memoryVisualization, scenarios, currentScenario } = state;

  const getBlockColor = (status: string) => {
    const colors = {
      'valid': '#2ed573',
      'leaked': '#ffa500',
      'corrupted': '#ff4757',
      'dangling': '#9b59b6'
    };
    return colors[status as keyof typeof colors] || '#57606f';
  };

  const getPointerColor = (status: string) => {
    const colors = {
      'valid': '#00d4ff',
      'dangling': '#ff4757',
      'null': '#57606f'
    };
    return colors[status as keyof typeof colors] || '#57606f';
  };

  const currentScenarioData = scenarios[currentScenario];

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Scenario title */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ff4757"
        anchorX="center"
      >
        🔍 {currentScenarioData?.name}
      </Text>
      
      {/* Memory blocks */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#ffa500"
          anchorX="center"
        >
          Memory State
        </Text>
        
        {memoryVisualization.blocks.map((block, index) => (
          <group key={`block-${block.id}`} position={[index * 1.5 - memoryVisualization.blocks.length * 0.75, 0, 0]}>
            <Box args={[1.2, 0.8, 0.3]}>
              <meshStandardMaterial 
                color={getBlockColor(block.status)}
                transparent 
                opacity={0.8} 
              />
            </Box>
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {block.type}
            </Text>
            <Text
              position={[0, -0.5, 0]}
              fontSize={0.07}
              color="#888"
              anchorX="center"
            >
              {block.status}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Pointers */}
      <group position={[0, 0.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Pointer State
        </Text>
        
        {memoryVisualization.pointers.map((pointer, index) => (
          <group key={`ptr-${pointer.id}`} position={[index * 1.5 - memoryVisualization.pointers.length * 0.75, 0, 0]}>
            <Box args={[1.2, 0.6, 0.3]}>
              <meshStandardMaterial 
                color={getPointerColor(pointer.status)}
                transparent 
                opacity={0.7} 
              />
            </Box>
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {pointer.id}
            </Text>
            
            {/* Arrow to target */}
            {pointer.target && (
              <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.08, 0.3]} />
                <meshStandardMaterial color={getPointerColor(pointer.status)} />
              </mesh>
            )}
          </group>
        ))}
      </group>
      
      {/* Status indicators */}
      <group position={[0, -1, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color={currentScenarioData?.status === 'fixed' ? '#2ed573' : '#ff4757'}
          anchorX="center"
        >
          Status: {currentScenarioData?.status.toUpperCase()}
        </Text>
        
        <Text
          position={[0, 0, 0]}
          fontSize={0.1}
          color="#888"
          anchorX="center"
        >
          Severity: {currentScenarioData?.severity.toUpperCase()}
        </Text>
      </group>
      
      {/* Problem visualization */}
      <group position={[0, -1.8, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.09}
          color="#ffa500"
          anchorX="center"
        >
          {currentScenarioData?.description}
        </Text>
      </group>
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson60_FinalExamination: React.FC = () => {
  const [state, setState] = useState<ExaminationState>({
    scenarios: [
      {
        id: 1,
        name: 'Dangling Pointer',
        type: 'dangling_pointer',
        description: 'Pointer references deallocated memory',
        status: 'unsolved',
        severity: 'critical',
        codeSnippet: `int* create_dangling() {
    int local_var = 42;
    return &local_var;  // 💥 Returns pointer to local variable
}

int main() {
    int* ptr = create_dangling();
    std::cout << *ptr;  // 💥 Undefined behavior - dangling pointer
    return 0;
}`,
        fix: `// Fix: Return by value or use heap allocation
int create_value() {
    return 42;  // ✅ Return by value
}

// Or use heap allocation with smart pointer
std::unique_ptr<int> create_heap() {
    return std::make_unique<int>(42);  // ✅ Heap allocation
}`
      },
      {
        id: 2,
        name: 'Double Delete',
        type: 'double_delete',
        description: 'Memory freed twice causing corruption',
        status: 'unsolved',
        severity: 'critical',
        codeSnippet: `void problematic_function() {
    int* ptr = new int(42);
    
    delete ptr;    // First delete - OK
    
    // ... some code ...
    
    delete ptr;    // 💥 Second delete - undefined behavior
}`,
        fix: `// Fix: Use RAII with smart pointers
void safe_function() {
    auto ptr = std::make_unique<int>(42);  // ✅ RAII
    
    // Automatic cleanup, no double delete possible
} // destructor called automatically

// Or set to nullptr after delete
void manual_fix() {
    int* ptr = new int(42);
    delete ptr;
    ptr = nullptr;  // Prevent accidental reuse
}`
      },
      {
        id: 3,
        name: 'Illegal Aliasing',
        type: 'illegal_alias',
        description: 'Type punning violates strict aliasing',
        status: 'unsolved',
        severity: 'high',
        codeSnippet: `void illegal_aliasing() {
    float f = 3.14f;
    int* int_ptr = reinterpret_cast<int*>(&f);  // 💥 Illegal aliasing
    *int_ptr = 0x12345678;  // 💥 Undefined behavior
    
    std::cout << f;  // May print garbage due to optimizer assumptions
}`,
        fix: `// Fix: Use std::bit_cast (C++20) or memcpy
void safe_aliasing() {
    float f = 3.14f;
    
    // Method 1: std::bit_cast (C++20)
    std::uint32_t bits = std::bit_cast<std::uint32_t>(f);
    
    // Method 2: memcpy (portable)
    std::uint32_t bits2;
    std::memcpy(&bits2, &f, sizeof(float));
    
    // Both are well-defined and optimizer-safe
}`
      },
      {
        id: 4,
        name: 'Shared Pointer Cycle',
        type: 'shared_cycle',
        description: 'Cyclic references prevent destruction',
        status: 'unsolved',
        severity: 'medium',
        codeSnippet: `struct Node {
    std::shared_ptr<Node> next;
    std::shared_ptr<Node> prev;  // 💥 Creates cycles
};

void create_cycle() {
    auto node1 = std::make_shared<Node>();
    auto node2 = std::make_shared<Node>();
    
    node1->next = node2;
    node2->prev = node1;  // 💥 Cycle created - memory leak
}`,
        fix: `// Fix: Use weak_ptr to break cycles
struct Node {
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev;   // ✅ weak_ptr breaks cycle
};

void safe_cycle() {
    auto node1 = std::make_shared<Node>();
    auto node2 = std::make_shared<Node>();
    
    node1->next = node2;
    node2->prev = node1;  // ✅ No cycle, proper cleanup
}`
      },
      {
        id: 5,
        name: 'shared_from_this Error',
        type: 'shared_from_this_error',
        description: 'shared_from_this called on unmanaged object',
        status: 'unsolved',
        severity: 'high',
        codeSnippet: `class Widget : public std::enable_shared_from_this<Widget> {
public:
    void register_self() {
        auto self = shared_from_this();  // 💥 May throw if not in shared_ptr
        // register with some manager
    }
};

void problematic_usage() {
    Widget widget;                    // 💥 Stack object
    widget.register_self();           // 💥 Exception thrown
}`,
        fix: `// Fix: Always construct with make_shared
void safe_usage() {
    auto widget = std::make_shared<Widget>();  // ✅ Managed by shared_ptr
    widget->register_self();                   // ✅ Safe to call
}

// Or check before calling
class SafeWidget : public std::enable_shared_from_this<SafeWidget> {
public:
    void register_self() {
        if (auto self = weak_from_this().lock()) {  // ✅ Safe check
            // register self
        }
    }
};`
      },
      {
        id: 6,
        name: 'Vector Invalidation',
        type: 'vector_invalidation',
        description: 'Iterator/pointer invalidated by reallocation',
        status: 'unsolved',
        severity: 'medium',
        codeSnippet: `void vector_invalidation() {
    std::vector<int> vec{1, 2, 3};
    int* ptr = &vec[1];               // Pointer to element
    
    vec.push_back(4);                 // 💥 May reallocate, invalidating ptr
    
    std::cout << *ptr;                // 💥 Undefined behavior - ptr may be invalid
}`,
        fix: `// Fix: Use indices instead of pointers/iterators
void safe_vector() {
    std::vector<int> vec{1, 2, 3};
    size_t index = 1;                 // ✅ Index remains valid
    
    vec.push_back(4);                 // Reallocation OK
    
    std::cout << vec[index];          // ✅ Safe access via index
}

// Or use stable containers
void stable_container() {
    std::list<int> list{1, 2, 3};
    auto it = std::next(list.begin()); // Iterator to second element
    
    list.push_back(4);                // ✅ No invalidation
    std::cout << *it;                 // ✅ Still valid
}`
      },
      {
        id: 7,
        name: 'Missing Virtual Destructor',
        type: 'virtual_destructor',
        description: 'Non-virtual destructor in polymorphic base',
        status: 'unsolved',
        severity: 'high',
        codeSnippet: `class Base {
    // 💥 Non-virtual destructor in polymorphic base
public:
    ~Base() { std::cout << "Base dtor\\n"; }
};

class Derived : public Base {
    int* data;
public:
    Derived() : data(new int[100]) {}
    ~Derived() { delete[] data; std::cout << "Derived dtor\\n"; }  // 💥 Never called
};

void polymorphic_destruction() {
    Base* ptr = new Derived();        // Polymorphic use
    delete ptr;                       // 💥 Only Base destructor called - memory leak
}`,
        fix: `// Fix: Make base destructor virtual
class Base {
public:
    virtual ~Base() { std::cout << "Base dtor\\n"; }  // ✅ Virtual destructor
};

class Derived : public Base {
    int* data;
public:
    Derived() : data(new int[100]) {}
    ~Derived() override { delete[] data; std::cout << "Derived dtor\\n"; }
};

void safe_polymorphic_destruction() {
    Base* ptr = new Derived();
    delete ptr;  // ✅ Both destructors called in correct order
}`
      },
      {
        id: 8,
        name: 'const_cast UB',
        type: 'const_cast_ub',
        description: 'const_cast used to modify originally const object',
        status: 'unsolved',
        severity: 'high',
        codeSnippet: `void const_cast_ub() {
    const int orig_const = 42;           // Originally const object
    
    int* mutable_ptr = const_cast<int*>(&orig_const);  // 💥 Dangerous cast
    *mutable_ptr = 100;                  // 💥 UB - modifying originally const object
    
    std::cout << orig_const;             // May still print 42 due to optimization
}`,
        fix: `// Fix: Only const_cast objects that were originally non-const
void safe_const_cast() {
    int orig_non_const = 42;            // Originally non-const
    const int* const_ptr = &orig_non_const;
    
    int* mutable_ptr = const_cast<int*>(const_ptr);  // ✅ Safe cast
    *mutable_ptr = 100;                  // ✅ OK - originally non-const
    
    std::cout << orig_non_const;         // Prints 100
}

// Better: Design away the need for const_cast
void design_solution() {
    // Use mutable keyword for data that needs modification in const methods
    // Use proper const-correctness in API design
}`
      }
    ],
    currentScenario: 0,
    memoryVisualization: {
      blocks: [
        { id: 'block1', status: 'dangling', type: 'int' },
        { id: 'block2', status: 'leaked', type: 'Node' },
        { id: 'block3', status: 'valid', type: 'Widget' }
      ],
      pointers: [
        { id: 'ptr1', target: 'block1', status: 'dangling' },
        { id: 'ptr2', target: null, status: 'null' },
        { id: 'ptr3', target: 'block3', status: 'valid' }
      ]
    },
    gameStats: {
      totalScenarios: 8,
      solved: 0,
      timeElapsed: 0,
      score: 0,
      hintsUsed: 0
    },
    showHint: false,
    showSolution: false
  });

  const selectScenario = (index: number) => {
    setState(prev => ({
      ...prev,
      currentScenario: index,
      showHint: false,
      showSolution: false
    }));
  };

  const diagnoseScenario = () => {
    setState(prev => ({
      ...prev,
      scenarios: prev.scenarios.map((scenario, index) => 
        index === prev.currentScenario 
          ? { ...scenario, status: 'diagnosed' }
          : scenario
      ),
      gameStats: {
        ...prev.gameStats,
        score: prev.gameStats.score + 10
      }
    }));
  };

  const fixScenario = () => {
    setState(prev => ({
      ...prev,
      scenarios: prev.scenarios.map((scenario, index) => 
        index === prev.currentScenario 
          ? { ...scenario, status: 'fixed' }
          : scenario
      ),
      gameStats: {
        ...prev.gameStats,
        solved: prev.gameStats.solved + 1,
        score: prev.gameStats.score + 25
      }
    }));
  };

  const useHint = () => {
    setState(prev => ({
      ...prev,
      showHint: true,
      gameStats: {
        ...prev.gameStats,
        hintsUsed: prev.gameStats.hintsUsed + 1,
        score: Math.max(0, prev.gameStats.score - 5)
      }
    }));
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': '#2ed573',
      'medium': '#ffa500',
      'high': '#ff6b7a',
      'critical': '#ff4757'
    };
    return colors[severity as keyof typeof colors] || '#57606f';
  };

  const currentScenarioData = state.scenarios[state.currentScenario];

  return (
    <Container>
      <Header>
        <Title>🎓 Final Examination</Title>
        <Subtitle>Master all pointer scenarios and become a memory management expert</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>🎯 Examination Scenarios</h3>
          
          <StatusDisplay $type="info">
            <strong>Progress:</strong> {state.gameStats.solved}/{state.gameStats.totalScenarios} scenarios solved<br/>
            <strong>Score:</strong> {state.gameStats.score} points<br/>
            <strong>Hints Used:</strong> {state.gameStats.hintsUsed}
          </StatusDisplay>

          <h4>📋 Scenario List</h4>
          {state.scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              $selected={index === state.currentScenario}
              $status={scenario.status}
              onClick={() => selectScenario(index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{scenario.name}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.25rem' }}>
                    {scenario.description}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: getSeverityColor(scenario.severity),
                    fontSize: '0.8rem',
                    marginBottom: '0.25rem' 
                  }}>
                    {scenario.severity.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    {scenario.status === 'fixed' ? '✅' : scenario.status === 'diagnosed' ? '🔍' : '❌'}
                  </div>
                </div>
              </div>
            </ScenarioCard>
          ))}

          <h4>📊 Final Score Calculation</h4>
          <StatusDisplay $type="success">
            • <Highlight $color="#2ed573">Diagnosis</Highlight>: +10 points per scenario<br/>
            • <Highlight $color="#00d4ff">Fix</Highlight>: +25 points per scenario<br/>
            • <Highlight $color="#ffa500">Hints</Highlight>: -5 points per hint used<br/>
            • <Highlight $color="#9b59b6">Perfect</Highlight>: Bonus for solving all without hints
          </StatusDisplay>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <ExaminationVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🔍 Current Scenario: {currentScenarioData?.name}</h4>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Problem Code:</strong>
              <CodeBlock>{currentScenarioData?.codeSnippet}</CodeBlock>
            </div>

            {state.showHint && (
              <div style={{ marginBottom: '1rem' }}>
                <StatusDisplay $type="warning">
                  <strong>💡 Hint:</strong><br/>
                  Look for: {currentScenarioData?.type.replace('_', ' ')}. 
                  This is a {currentScenarioData?.severity} severity issue that can cause 
                  {currentScenarioData?.type.includes('delete') ? ' memory corruption' :
                   currentScenarioData?.type.includes('dangling') ? ' undefined behavior' :
                   currentScenarioData?.type.includes('cycle') ? ' memory leaks' :
                   ' runtime problems'}.
                </StatusDisplay>
              </div>
            )}

            {state.showSolution && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>✅ Solution:</strong>
                <CodeBlock>{currentScenarioData?.fix}</CodeBlock>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <strong>Actions:</strong><br/>
              <Button 
                onClick={diagnoseScenario}
                disabled={currentScenarioData?.status !== 'unsolved'}
                $variant={currentScenarioData?.status === 'diagnosed' ? 'success' : 'primary'}
              >
                🔍 Diagnose Problem (+10 pts)
              </Button>
              <Button 
                onClick={fixScenario}
                disabled={currentScenarioData?.status === 'fixed'}
                $variant={currentScenarioData?.status === 'fixed' ? 'success' : 'primary'}
              >
                🛠️ Fix Issue (+25 pts)
              </Button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Help:</strong><br/>
              <Button onClick={useHint} disabled={state.showHint}>
                💡 Get Hint (-5 pts)
              </Button>
              <Button 
                onClick={() => setState(prev => ({ ...prev, showSolution: !prev.showSolution }))}
              >
                {state.showSolution ? 'Hide' : 'Show'} Solution
              </Button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Navigation:</strong><br/>
              <Button 
                onClick={() => selectScenario(Math.max(0, state.currentScenario - 1))}
                disabled={state.currentScenario === 0}
                $variant="secondary"
              >
                ⬅️ Previous
              </Button>
              <Button 
                onClick={() => selectScenario(Math.min(state.scenarios.length - 1, state.currentScenario + 1))}
                disabled={state.currentScenario === state.scenarios.length - 1}
                $variant="secondary"
              >
                ➡️ Next
              </Button>
            </div>

            <StatusDisplay $type="info">
              <strong>🎯 Mastery Goals:</strong><br/>
              • <Highlight>Identify</Highlight> all 8 common pointer problems<br/>
              • <Highlight>Understand</Highlight> the root cause of each issue<br/>
              • <Highlight>Apply</Highlight> modern C++ solutions (RAII, smart pointers)<br/>
              • <Highlight>Achieve</Highlight> 200+ points for expert level<br/>
              • <Highlight>Perfect</Highlight> score: 280 points (no hints needed)
            </StatusDisplay>

            {state.gameStats.solved === state.gameStats.totalScenarios && (
              <StatusDisplay $type="success">
                <strong>🎉 Congratulations!</strong><br/>
                You have successfully completed all scenarios!<br/>
                Final Score: <Highlight $color="#2ed573">{state.gameStats.score}</Highlight> points<br/>
                You are now a certified C++ pointer expert! 🎓
              </StatusDisplay>
            )}
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson60_FinalExamination;