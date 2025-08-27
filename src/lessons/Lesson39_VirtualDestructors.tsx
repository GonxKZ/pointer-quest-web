import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { THREE } from '../utils/three';

interface VirtualDestructorState {
  classes: {
    id: number;
    name: string;
    type: 'base' | 'derived';
    hasVirtualDestructor: boolean;
    hasResources: boolean;
    destructorCalled: boolean;
    memoryLeaked: boolean;
    color: string;
  }[];
  polymorphicObjects: {
    id: number;
    actualType: string;
    baseType: string;
    isDestroyed: boolean;
    properlyDestroyed: boolean;
  }[];
  demonstration: 'basic_problem' | 'virtual_solution' | 'memory_analysis' | 'best_practices';
  destructionInProgress: boolean;
  currentStep: number;
  showVTable: boolean;
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

function VirtualDestructorVisualization({ state }: { state: VirtualDestructorState }) {
  const { classes, polymorphicObjects, demonstration, destructionInProgress, showVTable, currentStep } = state;

  const renderBasicProblem = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ff4757"
        anchorX="center"
      >
        🚨 Non-Virtual Destructor Problem
      </Text>
      
      {/* Class hierarchy */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#ffa500"
          anchorX="center"
        >
          Inheritance Hierarchy
        </Text>
        
        {/* Base class */}
        <group position={[-1.5, 0, 0]}>
          <Box args={[2.5, 1, 0.3]}>
            <meshStandardMaterial 
              color={classes.find(c => c.type === 'base')?.hasVirtualDestructor ? '#2ed573' : '#ff4757'}
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
            Base Class
          </Text>
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            {classes.find(c => c.type === 'base')?.hasVirtualDestructor ? 'virtual ~Base()' : '~Base()'}
          </Text>
          <Text
            position={[0, -0.2, 0.2]}
            fontSize={0.07}
            color={classes.find(c => c.type === 'base')?.hasVirtualDestructor ? '#4ade80' : '#ff6b7a'}
            anchorX="center"
          >
            {classes.find(c => c.type === 'base')?.hasVirtualDestructor ? 'SAFE' : 'DANGEROUS'}
          </Text>
        </group>
        
        {/* Inheritance arrow */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.6]} />
          <meshStandardMaterial color="#00d4ff" />
        </mesh>
        
        {/* Derived class */}
        <group position={[1.5, 0, 0]}>
          <Box args={[2.5, 1, 0.3]}>
            <meshStandardMaterial 
              color={classes.find(c => c.type === 'derived')?.hasResources ? '#ffa500' : '#00d4ff'}
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
            Derived Class
          </Text>
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            ~Derived()
          </Text>
          <Text
            position={[0, -0.2, 0.2]}
            fontSize={0.07}
            color={classes.find(c => c.type === 'derived')?.hasResources ? '#ffa500' : '#4ade80'}
            anchorX="center"
          >
            {classes.find(c => c.type === 'derived')?.hasResources ? 'HAS RESOURCES' : 'NO RESOURCES'}
          </Text>
        </group>
      </group>
      
      {/* Polymorphic deletion scenario */}
      <group position={[0, -0.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#ff4757"
          anchorX="center"
        >
          Polymorphic Deletion
        </Text>
        
        <Box args={[4, 0.6, 0.3]}>
          <meshStandardMaterial color="#ff4757" transparent opacity={0.6} />
        </Box>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.09}
          color="white"
          anchorX="center"
        >
          Base* ptr = new Derived(); delete ptr;
        </Text>
        
        {/* Destruction sequence */}
        <group position={[0, -0.8, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.1}
            color={destructionInProgress ? '#ff4757' : '#888'}
            anchorX="center"
          >
            {destructionInProgress ? '💥 Only ~Base() called - Memory leaked!' : 'Click "Simulate Destruction" to see the problem'}
          </Text>
        </group>
      </group>
      
      {/* Memory leak indicator */}
      {state.classes.some(c => c.memoryLeaked) && (
        <group position={[0, -2, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.12}
            color="#ff4757"
            anchorX="center"
          >
            🔴 MEMORY LEAK DETECTED
          </Text>
        </group>
      )}
    </group>
  );

  const renderVirtualSolution = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#2ed573"
        anchorX="center"
      >
        ✅ Virtual Destructor Solution
      </Text>
      
      {/* Correct hierarchy */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#2ed573"
          anchorX="center"
        >
          Corrected Hierarchy
        </Text>
        
        {/* Base with virtual destructor */}
        <group position={[-1.5, 0, 0]}>
          <Box args={[2.5, 1.2, 0.3]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.8} />
          </Box>
          <Text
            position={[0, 0.3, 0.2]}
            fontSize={0.1}
            color="white"
            anchorX="center"
          >
            Base Class
          </Text>
          <Text
            position={[0, 0.1, 0.2]}
            fontSize={0.09}
            color="white"
            anchorX="center"
          >
            virtual ~Base()
          </Text>
          <Text
            position={[0, -0.1, 0.2]}
            fontSize={0.08}
            color="#4ade80"
            anchorX="center"
          >
            ✅ POLYMORPHIC BASE
          </Text>
          <Text
            position={[0, -0.3, 0.2]}
            fontSize={0.07}
            color="#888"
            anchorX="center"
          >
            +8 bytes vtable ptr
          </Text>
        </group>
        
        {/* Inheritance arrow */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.6]} />
          <meshStandardMaterial color="#2ed573" />
        </mesh>
        
        {/* Derived class */}
        <group position={[1.5, 0, 0]}>
          <Box args={[2.5, 1.2, 0.3]}>
            <meshStandardMaterial color="#00d4ff" transparent opacity={0.8} />
          </Box>
          <Text
            position={[0, 0.3, 0.2]}
            fontSize={0.1}
            color="white"
            anchorX="center"
          >
            Derived Class
          </Text>
          <Text
            position={[0, 0.1, 0.2]}
            fontSize={0.09}
            color="white"
            anchorX="center"
          >
            ~Derived() override
          </Text>
          <Text
            position={[0, -0.1, 0.2]}
            fontSize={0.08}
            color="#4ade80"
            anchorX="center"
          >
            ✅ PROPER CLEANUP
          </Text>
          <Text
            position={[0, -0.3, 0.2]}
            fontSize={0.07}
            color="#888"
            anchorX="center"
          >
            resources freed
          </Text>
        </group>
      </group>
      
      {/* Destruction sequence */}
      <group position={[0, -0.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#2ed573"
          anchorX="center"
        >
          Correct Destruction Order
        </Text>
        
        {[
          { step: 1, text: '1. ~Derived() called first', color: '#00d4ff' },
          { step: 2, text: '2. Resources cleaned up', color: '#ffa500' },
          { step: 3, text: '3. ~Base() called second', color: '#2ed573' }
        ].map((step, index) => (
          <group key={`step-${step.step}`} position={[0, 0 - index * 0.25, 0]}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.09}
              color={currentStep >= step.step ? step.color : '#57606f'}
              anchorX="center"
            >
              {step.text}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );

  const renderMemoryAnalysis = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ffa500"
        anchorX="center"
      >
        📊 Memory Layout Analysis
      </Text>
      
      {/* Memory comparison */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#00d4ff"
          anchorX="center"
        >
          Memory Layout Comparison
        </Text>
        
        {/* Non-virtual */}
        <group position={[-2, 0, 0]}>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.1}
            color="#ff4757"
            anchorX="center"
          >
            Non-Virtual Base
          </Text>
          <Box args={[1.5, 1, 0.3]}>
            <meshStandardMaterial color="#ff4757" transparent opacity={0.7} />
          </Box>
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            No vtable
          </Text>
          <Text
            position={[0, -0.5, 0]}
            fontSize={0.07}
            color="#888"
            anchorX="center"
          >
            Size: 4 bytes
          </Text>
        </group>
        
        {/* Virtual */}
        <group position={[2, 0, 0]}>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.1}
            color="#2ed573"
            anchorX="center"
          >
            Virtual Base
          </Text>
          <Box args={[1.5, 1.2, 0.3]}>
            <meshStandardMaterial color="#2ed573" transparent opacity={0.7} />
          </Box>
          <Text
            position={[0, 0.1, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            vtable ptr
          </Text>
          <Text
            position={[0, -0.1, 0.2]}
            fontSize={0.08}
            color="white"
            anchorX="center"
          >
            + data
          </Text>
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.07}
            color="#888"
            anchorX="center"
          >
            Size: 12 bytes
          </Text>
        </group>
      </group>
      
      {showVTable && (
        <group position={[0, -0.5, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.12}
            color="#9b59b6"
            anchorX="center"
          >
            Virtual Function Table
          </Text>
          
          {/* VTable visualization */}
          <group position={[0, 0, 0]}>
            <Box args={[3, 0.8, 0.3]}>
              <meshStandardMaterial color="#9b59b6" transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0.1, 0.2]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              vtable[0] → ~Derived()
            </Text>
            <Text
              position={[0, -0.1, 0.2]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              vtable[1] → other virtuals
            </Text>
          </group>
        </group>
      )}
      
      {/* Performance impact */}
      <group position={[0, -1.8, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.1}
          color="#ffa500"
          anchorX="center"
        >
          Performance: +8 bytes per object, 1 indirection per virtual call
        </Text>
      </group>
    </group>
  );

  const renderBestPractices = () => (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#00d4ff"
        anchorX="center"
      >
        🏆 Best Practices
      </Text>
      
      {/* Guidelines */}
      <group position={[0, 1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#2ed573"
          anchorX="center"
        >
          Virtual Destructor Rules
        </Text>
        
        {[
          { rule: 'Always virtual for polymorphic bases', status: 'critical', color: '#ff4757' },
          { rule: 'Use override in derived classes', status: 'good', color: '#2ed573' },
          { rule: 'Consider pure virtual: = 0', status: 'advanced', color: '#00d4ff' },
          { rule: 'Smart pointers help but don\'t replace', status: 'info', color: '#ffa500' }
        ].map((practice, index) => (
          <group key={`practice-${index}`} position={[0, 0.2 - index * 0.3, 0]}>
            <Box args={[5.5, 0.25, 0.2]}>
              <meshStandardMaterial color={practice.color} transparent opacity={0.6} />
            </Box>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.08}
              color="white"
              anchorX="center"
            >
              {practice.rule}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Modern alternatives */}
      <group position={[0, -1, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#9b59b6"
          anchorX="center"
        >
          Modern C++ Alternatives
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={0.09}
          color="white"
          anchorX="center"
        >
          std::unique_ptr&lt;Base&gt;, std::shared_ptr&lt;Base&gt;
        </Text>
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.08}
          color="#888"
          anchorX="center"
        >
          Smart pointers call correct destructor automatically
        </Text>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {demonstration === 'basic_problem' && renderBasicProblem()}
      {demonstration === 'virtual_solution' && renderVirtualSolution()}
      {demonstration === 'memory_analysis' && renderMemoryAnalysis()}
      {demonstration === 'best_practices' && renderBestPractices()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}

const Lesson39_VirtualDestructors: React.FC = () => {
  const [state, setState] = useState<VirtualDestructorState>({
    classes: [
      { id: 1, name: 'Base', type: 'base', hasVirtualDestructor: false, hasResources: false, destructorCalled: false, memoryLeaked: false, color: '#ff4757' },
      { id: 2, name: 'Derived', type: 'derived', hasVirtualDestructor: false, hasResources: true, destructorCalled: false, memoryLeaked: true, color: '#ffa500' }
    ],
    polymorphicObjects: [
      { id: 1, actualType: 'Derived', baseType: 'Base', isDestroyed: false, properlyDestroyed: false }
    ],
    demonstration: 'basic_problem',
    destructionInProgress: false,
    currentStep: 0,
    showVTable: false
  });

  const toggleVirtualDestructor = (classType: 'base' | 'derived') => {
    setState(prev => ({
      ...prev,
      classes: prev.classes.map(cls => 
        cls.type === classType 
          ? { ...cls, hasVirtualDestructor: !cls.hasVirtualDestructor, color: !cls.hasVirtualDestructor ? '#2ed573' : '#ff4757' }
          : cls
      )
    }));
  };

  const simulateDestruction = () => {
    setState(prev => ({ ...prev, destructionInProgress: true }));
    
    const baseHasVirtual = state.classes.find(c => c.type === 'base')?.hasVirtualDestructor;
    
    if (baseHasVirtual) {
      // Proper destruction sequence
      setTimeout(() => setState(prev => ({ ...prev, currentStep: 1 })), 500);
      setTimeout(() => setState(prev => ({ ...prev, currentStep: 2 })), 1000);
      setTimeout(() => setState(prev => ({ ...prev, currentStep: 3 })), 1500);
      setTimeout(() => setState(prev => ({ 
        ...prev, 
        destructionInProgress: false, 
        currentStep: 0,
        classes: prev.classes.map(cls => ({ ...cls, destructorCalled: true, memoryLeaked: false }))
      })), 2000);
    } else {
      // Only base destructor called
      setTimeout(() => setState(prev => ({ 
        ...prev, 
        destructionInProgress: false,
        classes: prev.classes.map(cls => ({ 
          ...cls, 
          destructorCalled: cls.type === 'base',
          memoryLeaked: cls.type === 'derived' && cls.hasResources
        }))
      })), 1000);
    }
  };

  const resetSimulation = () => {
    setState(prev => ({
      ...prev,
      classes: prev.classes.map(cls => ({ 
        ...cls, 
        destructorCalled: false, 
        memoryLeaked: cls.type === 'derived' && cls.hasResources && !prev.classes.find(c => c.type === 'base')?.hasVirtualDestructor
      })),
      destructionInProgress: false,
      currentStep: 0
    }));
  };

  const getCurrentExample = () => {
    const { demonstration } = state;
    
    if (demonstration === 'basic_problem') {
      return `// THE PROBLEM: Non-virtual destructor in polymorphic base
class Base {
public:
    ~Base() {  // 💥 NON-VIRTUAL DESTRUCTOR
        std::cout << "~Base() called\\n";
    }
};

class Derived : public Base {
    int* data_;  // Resource that needs cleanup
public:
    Derived() : data_(new int[1000]) {
        std::cout << "Derived constructed\\n";
    }
    
    ~Derived() {  // 💥 NEVER CALLED when deleting through Base*
        std::cout << "~Derived() called\\n";
        delete[] data_;  // 💥 NEVER EXECUTED - MEMORY LEAK!
    }
};

void demonstrate_problem() {
    Base* ptr = new Derived();  // Polymorphic usage
    delete ptr;  // 💥 ONLY ~Base() called, ~Derived() skipped!
    // Result: Memory leak! data_ never deleted
}`;
    }
    
    if (demonstration === 'virtual_solution') {
      return `// THE SOLUTION: Virtual destructor in base
class Base {
public:
    virtual ~Base() {  // ✅ VIRTUAL DESTRUCTOR
        std::cout << "~Base() called\\n";
    }
    // Adding virtual destructor makes class polymorphic
    // Adds vtable pointer (+8 bytes per object)
};

class Derived : public Base {
    int* data_;
public:
    Derived() : data_(new int[1000]) {
        std::cout << "Derived constructed\\n";
    }
    
    ~Derived() override {  // ✅ override keyword (C++11+)
        std::cout << "~Derived() called\\n";
        delete[] data_;  // ✅ PROPERLY EXECUTED
    }
};

void demonstrate_solution() {
    Base* ptr = new Derived();
    delete ptr;  // ✅ Calls ~Derived() first, then ~Base()
    // Result: Proper cleanup, no memory leaks!
}`;
    }
    
    if (demonstration === 'memory_analysis') {
      return `// Memory layout analysis
#include <iostream>

// Non-virtual base
class NonVirtualBase {
    int data_;
public:
    ~NonVirtualBase() {}  // Non-virtual
};

// Virtual base  
class VirtualBase {
    int data_;
public:
    virtual ~VirtualBase() {}  // Virtual
};

void analyze_memory_impact() {
    std::cout << "Non-virtual base size: " << sizeof(NonVirtualBase) << " bytes\\n";
    // Output: 4 bytes (just the int data_)
    
    std::cout << "Virtual base size: " << sizeof(VirtualBase) << " bytes\\n";
    // Output: 16 bytes (int + vtable pointer + padding)
    
    // Memory overhead: +8 bytes per object (on 64-bit)
    // Performance overhead: 1 indirection per virtual call
}

// Virtual function table contains:
// - Pointer to destructor function
// - Pointers to other virtual functions
// - RTTI information (with -frtti)`;
    }
    
    return `// Best practices for virtual destructors
class AbstractBase {
public:
    // ✅ BEST: Pure virtual destructor for abstract base
    virtual ~AbstractBase() = 0;  
    virtual void pure_function() = 0;
};

// Must provide implementation even for pure virtual destructor
AbstractBase::~AbstractBase() {
    std::cout << "AbstractBase destructor\\n";
}

class ConcreteBase {
public:
    // ✅ GOOD: Virtual destructor with default implementation
    virtual ~ConcreteBase() = default;
};

class ModernDerived : public ConcreteBase {
public:
    // ✅ EXCELLENT: Use override keyword
    ~ModernDerived() override = default;
};

// Modern C++ alternatives:
void modern_approaches() {
    // ✅ Smart pointers handle virtual destructors correctly
    std::unique_ptr<ConcreteBase> ptr = std::make_unique<ModernDerived>();
    // Destructor called correctly when ptr goes out of scope
    
    std::shared_ptr<ConcreteBase> shared = std::make_shared<ModernDerived>();
    // Reference counting with correct destruction
}

// ⚠️ Special cases:
class NotIntendedForInheritance {
public:
    // Option 1: Non-virtual destructor + final class
    ~NotIntendedForInheritance() = default;
};

class FinalClass final : public ConcreteBase {
public:
    // Option 2: final keyword prevents further inheritance
    ~FinalClass() override = default;
};`;
  };

  const getMemoryLeakCount = () => {
    return state.classes.filter(c => c.memoryLeaked).length;
  };

  return (
    <Container>
      <Header>
        <Title>🏗️ Virtual Destructors & Polymorphism</Title>
        <Subtitle>Master safe polymorphic destruction and prevent memory leaks</Subtitle>
      </Header>

      <MainContent>
        <LeftPanel>
          <h3>📚 Virtual Destructor Theory</h3>
          
          <StatusDisplay $type="error">
            <strong>Critical Rule</strong><br/>
            Any class intended for polymorphic use MUST have a virtual destructor.
            Non-virtual destructors in base classes cause memory leaks and UB.
          </StatusDisplay>

          <h4>🎯 The Problem</h4>
          <Grid>
            <InfoCard>
              <h4>Non-Virtual Destructor Issue</h4>
              <CodeBlock>{`// DANGEROUS: Non-virtual destructor
class Base {
public:
    ~Base() {} // ❌ Non-virtual
};

class Derived : public Base {
    int* data_;
public:
    Derived() : data_(new int[100]) {}
    ~Derived() { delete[] data_; } // ❌ Never called!
};

Base* ptr = new Derived();
delete ptr; // ❌ Only ~Base() called
// Result: data_ leaked!`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Why This Happens</h4>
              <CodeBlock>{`// Static binding without virtual
// Compiler sees: delete (Base*)ptr
// Calls: Base::~Base()
// Ignores: Derived::~Derived()

// The destructor call is resolved at
// compile time based on pointer type,
// not the actual object type.

// Without virtual keyword:
// - No vtable lookup
// - No dynamic dispatch
// - Wrong destructor called`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Virtual Destructor Solution</h4>
              <CodeBlock>{`// SAFE: Virtual destructor
class Base {
public:
    virtual ~Base() {}  // ✅ Virtual
};

class Derived : public Base {
    int* data_;
public:
    Derived() : data_(new int[100]) {}
    ~Derived() override {  // ✅ Called correctly
        delete[] data_;
    }
};

Base* ptr = new Derived();
delete ptr;  // ✅ ~Derived() then ~Base()
// Result: Proper cleanup!`}</CodeBlock>
            </InfoCard>

            <InfoCard>
              <h4>Memory & Performance Impact</h4>
              <CodeBlock>{`// Memory overhead:
sizeof(NonVirtualBase);  // 4 bytes (data only)
sizeof(VirtualBase);     // 16 bytes (data + vtable ptr + padding)

// Per-object cost: +8 bytes (64-bit systems)
// Per-call cost: 1 additional indirection

class Optimized {
public:
    virtual ~Optimized() = default;  // Compiler-generated
    // No custom logic = potentially inlined
};

// Modern approach: Smart pointers
std::unique_ptr<Base> ptr = std::make_unique<Derived>();
// Automatic correct destruction, no manual delete`}</CodeBlock>
            </InfoCard>
          </Grid>

          <h4>⚡ Best Practices</h4>
          <CodeBlock>{`// Rule of thumb:
// - Polymorphic base = virtual destructor
// - Non-polymorphic class = non-virtual destructor

// ✅ Abstract base class
class AbstractShape {
public:
    virtual ~AbstractShape() = 0;  // Pure virtual
    virtual void draw() = 0;
};
AbstractShape::~AbstractShape() {}  // Still need implementation

// ✅ Concrete base class
class Widget {
public:
    virtual ~Widget() = default;  // Compiler-generated
};

// ✅ Final derived class
class Button final : public Widget {
public:
    ~Button() override = default;
};

// ✅ Not intended for inheritance
class UtilityClass {
public:
    ~UtilityClass() = default;  // Non-virtual OK
};

// ❌ Avoid this pattern:
class AmbiguousBase {
    // No virtual functions, but users might inherit
    // Should this have virtual destructor? Unclear!
};`}</CodeBlock>

          <TheorySection>
            <h4>🔍 Current State</h4>
            <StatusDisplay $type={getMemoryLeakCount() > 0 ? 'error' : 'success'}>
              <strong>Classes:</strong> {state.classes.length}<br/>
              <strong>Virtual Destructors:</strong> {state.classes.filter(c => c.hasVirtualDestructor).length}<br/>
              <strong>Memory Leaks:</strong> {getMemoryLeakCount()}<br/>
              <strong>Status:</strong> {getMemoryLeakCount() > 0 ? 'UNSAFE' : 'SAFE'}
            </StatusDisplay>
            
            <h4>💻 Code Example</h4>
            <CodeBlock>{getCurrentExample()}</CodeBlock>
          </TheorySection>
        </LeftPanel>

        <RightPanel>
          <VisualizationArea>
            <VirtualDestructorVisualization state={state} />
          </VisualizationArea>

          <ControlsArea>
            <h4>🎮 Virtual Destructor Controls</h4>
            
            <div>
              <strong>Demonstration:</strong><br/>
              <Button 
                $variant={state.demonstration === 'basic_problem' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'basic_problem' }))}
              >
                Basic Problem
              </Button>
              <Button 
                $variant={state.demonstration === 'virtual_solution' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'virtual_solution' }))}
              >
                Virtual Solution
              </Button>
              <Button 
                $variant={state.demonstration === 'memory_analysis' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'memory_analysis' }))}
              >
                Memory Analysis
              </Button>
              <Button 
                $variant={state.demonstration === 'best_practices' ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, demonstration: 'best_practices' }))}
              >
                Best Practices
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Class Configuration:</strong><br/>
              <Button 
                $variant={state.classes.find(c => c.type === 'base')?.hasVirtualDestructor ? 'primary' : 'danger'}
                onClick={() => toggleVirtualDestructor('base')}
              >
                {state.classes.find(c => c.type === 'base')?.hasVirtualDestructor ? '✅' : '❌'} Base Virtual Destructor
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Destruction Simulation:</strong><br/>
              <Button 
                onClick={simulateDestruction}
                disabled={state.destructionInProgress}
                $variant="primary"
              >
                🔥 Simulate Destruction
              </Button>
              <Button onClick={resetSimulation} $variant="secondary">
                🔄 Reset
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button 
                $variant={state.showVTable ? 'primary' : 'secondary'}
                onClick={() => setState(prev => ({ ...prev, showVTable: !prev.showVTable }))}
              >
                {state.showVTable ? 'Hide' : 'Show'} VTable
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Class Status:</strong><br/>
              {state.classes.map(cls => (
                <div key={cls.id} style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: cls.color }}>
                    {cls.name}: {cls.hasVirtualDestructor ? 'Virtual' : 'Non-virtual'} destructor
                    {cls.memoryLeaked && ' (💥 LEAKED)'}
                    {cls.destructorCalled && ' (✅ CALLED)'}
                  </span>
                </div>
              ))}
            </div>

            <StatusDisplay $type="warning">
              <strong>Key Rules:</strong><br/>
              • <Highlight $color="#ff4757">Always</Highlight> use virtual destructors in polymorphic bases<br/>
              • <Highlight $color="#2ed573">Use override</Highlight> keyword in derived classes<br/>
              • <Highlight $color="#00d4ff">Consider pure virtual</Highlight> for abstract bases<br/>
              • <Highlight $color="#ffa500">Smart pointers</Highlight> help but don't replace virtual destructors<br/>
              • <Highlight>Cost</Highlight>: +8 bytes per object, 1 indirection per call
            </StatusDisplay>
          </ControlsArea>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson39_VirtualDestructors;