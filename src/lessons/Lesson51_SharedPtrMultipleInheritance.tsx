import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { THREE } from '../utils/three';

interface Lesson51Props {
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #4a9eff;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.5rem;
  text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
`;

const Description = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 158, 255, 0.3);
`;

const CodeBlock = styled.pre`
  background: #1a1a1a;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  border-left: 4px solid #4a9eff;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
  
  code {
    color: #e0e0e0;
    
    .keyword { color: #569cd6; }
    .string { color: #ce9178; }
    .comment { color: #6a9955; }
    .type { color: #4ec9b0; }
    .function { color: #dcdcaa; }
    .number { color: #b5cea8; }
    .danger { background-color: rgba(255, 0, 0, 0.2); }
    .safe { background-color: rgba(0, 255, 0, 0.2); }
    .highlight { background-color: rgba(255, 255, 0, 0.2); }
  }
`;

const VisualizationContainer = styled.div`
  height: 400px;
  margin: 30px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(74, 158, 255, 0.3);
`;

const QuizContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-top: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 158, 255, 0.3);
`;

const QuizQuestion = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #4a9eff;
`;

const QuizButton = styled.button<{ correct?: boolean; incorrect?: boolean }>`
  display: block;
  width: 100%;
  padding: 10px 15px;
  margin: 5px 0;
  background: ${props => 
    props.correct ? 'rgba(0, 255, 0, 0.2)' : 
    props.incorrect ? 'rgba(255, 0, 0, 0.2)' : 
    'rgba(74, 158, 255, 0.1)'};
  color: white;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    background: rgba(74, 158, 255, 0.2);
  }
`;

const ScoreDisplay = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #4a9eff;
  margin-top: 20px;
`;

interface InheritanceVisualizationProps {
  stage: number;
}

function InheritanceVisualization({ stage }: InheritanceVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const stages = [
    { title: "Simple Inheritance", bases: ["Base"], derived: "Derived" },
    { title: "Multiple Inheritance", bases: ["Base1", "Base2"], derived: "Derived" },
    { title: "Diamond Inheritance", bases: ["Base1", "Base2"], derived: "Derived", virtual: true },
  ];

  const currentStage = stages[stage % stages.length];

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Base classes */}
      {currentStage.bases.map((baseName, index) => {
        const x = currentStage.bases.length === 1 ? 0 : (index - 0.5) * 3;
        return (
          <group key={baseName} position={[x, 2, 0]}>
            <mesh>
              <boxGeometry args={[2, 1, 1]} />
              <meshStandardMaterial color="#4a9eff" transparent opacity={0.8} />
            </mesh>
            <Text
              position={[0, 0, 0.6]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {baseName}
            </Text>
            {/* Inheritance arrow */}
            <mesh position={[0, -0.8, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.2, 0.6, 6]} />
              <meshStandardMaterial color="#ff9f40" />
            </mesh>
          </group>
        );
      })}
      
      {/* Virtual base if diamond pattern */}
      {currentStage.virtual && (
        <group position={[0, 4, 0]}>
          <mesh>
            <boxGeometry args={[2, 1, 1]} />
            <meshStandardMaterial color="#ff6b6b" transparent opacity={0.8} />
          </mesh>
          <Text
            position={[0, 0, 0.6]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Virtual Base
          </Text>
        </group>
      )}
      
      {/* Derived class */}
      <group position={[0, -1, 0]}>
        <mesh>
          <boxGeometry args={[3, 1, 1]} />
          <meshStandardMaterial color="#50c878" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {currentStage.derived}
        </Text>
      </group>
      
      <Text
        position={[0, -3, 0]}
        fontSize={0.4}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
      >
        {currentStage.title}
      </Text>
    </group>
  );
}

export default function Lesson51_SharedPtrMultipleInheritance({ onComplete, isCompleted }: Lesson51Props) {
  const [currentStage, setCurrentStage] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      question: "What happens when shared_ptr<Derived> is cast to shared_ptr<Base> in multiple inheritance?",
      options: [
        "The pointer value stays the same",
        "The pointer value may change due to offset adjustment",
        "Compilation error occurs",
        "Runtime error is thrown"
      ],
      correct: 1,
      explanation: "In multiple inheritance, the pointer value may change due to base class offset adjustment while maintaining correct reference counting."
    },
    {
      question: "How does shared_ptr handle the diamond problem in virtual inheritance?",
      options: [
        "It prevents virtual inheritance",
        "It creates multiple control blocks",
        "It correctly manages the single virtual base instance",
        "It causes memory leaks"
      ],
      correct: 2,
      explanation: "shared_ptr correctly handles virtual inheritance by maintaining proper reference counting for the single virtual base instance."
    },
    {
      question: "What is the key advantage of using shared_ptr with multiple inheritance over raw pointers?",
      options: [
        "Faster pointer arithmetic",
        "Automatic lifetime management with correct casting",
        "Prevention of multiple inheritance",
        "Compile-time type checking"
      ],
      correct: 1,
      explanation: "shared_ptr provides automatic lifetime management while correctly handling pointer adjustments needed in multiple inheritance."
    },
    {
      question: "When casting shared_ptr between base and derived classes, what remains constant?",
      options: [
        "The pointer address",
        "The control block reference",
        "The object size",
        "The virtual table pointer"
      ],
      correct: 1,
      explanation: "The control block reference remains the same across casts, ensuring consistent reference counting regardless of pointer adjustments."
    },
    {
      question: "What happens if you cast shared_ptr<Base> to shared_ptr<Derived> incorrectly?",
      options: [
        "Undefined behavior with raw pointers equivalent",
        "dynamic_pointer_cast returns nullptr",
        "static_pointer_cast succeeds but may be dangerous",
        "Both B and C are correct"
      ],
      correct: 3,
      explanation: "dynamic_pointer_cast safely returns nullptr for invalid casts, while static_pointer_cast doesn't check validity but performs the cast."
    }
  ];

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);

    if (newAnswers.length === quizQuestions.length && newAnswers.every(a => a !== undefined)) {
      setShowResults(true);
      const score = newAnswers.reduce((acc, answer, index) => {
        return acc + (answer === quizQuestions[index].correct ? 20 : 0);
      }, 0);
      onComplete(score);
    }
  };

  return (
    <Container>
      <Title>Lesson 51: shared_ptr with Multiple Inheritance</Title>
      
      <Description>
        <h3>Smart Pointers and Complex Inheritance Hierarchies</h3>
        <p>
          Multiple inheritance in C++ creates complex object layouts and pointer relationships.
          When combined with <code>shared_ptr</code>, we must understand how smart pointers
          handle pointer adjustments, virtual base classes, and the diamond problem while
          maintaining correct reference counting.
        </p>
        
        <h4>Key Concepts:</h4>
        <ul>
          <li><strong>Pointer adjustment:</strong> Address changes during base/derived casts</li>
          <li><strong>Control block sharing:</strong> Reference counting across different pointer values</li>
          <li><strong>Virtual inheritance:</strong> Single virtual base instance management</li>
          <li><strong>Safe casting:</strong> dynamic_pointer_cast vs static_pointer_cast</li>
        </ul>
      </Description>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <InheritanceVisualization stage={currentStage} />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </VisualizationContainer>

      <button 
        onClick={() => setCurrentStage((prev) => (prev + 1) % 3)}
        style={{
          padding: '10px 20px',
          background: '#4a9eff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          display: 'block',
          margin: '0 auto 30px auto'
        }}
      >
        Next Inheritance Pattern
      </button>

      <h3>Basic Multiple Inheritance with shared_ptr</h3>
      <CodeBlock>
        <code>
{`#include <memory>
#include <iostream>

class Base1 {
public:
    virtual ~Base1() = default;
    virtual void method1() { std::cout << "Base1::method1\\n"; }
    int data1 = 1;
};

class Base2 {
public:
    virtual ~Base2() = default;
    virtual void method2() { std::cout << "Base2::method2\\n"; }
    int data2 = 2;
};

class Derived : public Base1, public Base2 {
public:
    void method1() override { std::cout << "Derived::method1\\n"; }
    void method2() override { std::cout << "Derived::method2\\n"; }
    void derivedMethod() { std::cout << "Derived::derivedMethod\\n"; }
    int derivedData = 3;
};

void demonstratePointerAdjustment() {
    // Create a shared_ptr to Derived
    std::shared_ptr<Derived> derivedPtr = std::make_shared<Derived>();
    
    std::cout << "Address of Derived object: " << derivedPtr.get() << "\\n";
    std::cout << "Control block use count: " << derivedPtr.use_count() << "\\n";
    
    // Cast to Base1 - pointer value may stay the same
    std::shared_ptr<Base1> base1Ptr = derivedPtr;
    std::cout << "Address when cast to Base1: " << base1Ptr.get() << "\\n";
    std::cout << "Base1 use count: " << base1Ptr.use_count() << "\\n";
    
    // Cast to Base2 - pointer value will likely change due to offset
    std::shared_ptr<Base2> base2Ptr = derivedPtr;
    std::cout << "Address when cast to Base2: " << base2Ptr.get() << "\\n";
    std::cout << "Base2 use count: " << base2Ptr.use_count() << "\\n";
    
    // All three pointers share the same control block
    // but may have different pointer values!
    std::cout << "\\nAll use counts should be 3:\\n";
    std::cout << "derivedPtr: " << derivedPtr.use_count() << "\\n";
    std::cout << "base1Ptr: " << base1Ptr.use_count() << "\\n";
    std::cout << "base2Ptr: " << base2Ptr.use_count() << "\\n";
}`}
        </code>
      </CodeBlock>

      <h3>Virtual Inheritance and the Diamond Problem</h3>
      <CodeBlock>
        <code>
{`// Diamond inheritance hierarchy
class VirtualBase {
public:
    virtual ~VirtualBase() = default;
    virtual void virtualMethod() { 
        std::cout << "VirtualBase::virtualMethod\\n"; 
    }
    int virtualData = 100;
};

// Virtual inheritance to solve diamond problem
class Left : public virtual VirtualBase {
public:
    virtual void leftMethod() { std::cout << "Left::leftMethod\\n"; }
    int leftData = 200;
};

class Right : public virtual VirtualBase {
public:
    virtual void rightMethod() { std::cout << "Right::rightMethod\\n"; }
    int rightData = 300;
};

class Bottom : public Left, public Right {
public:
    void virtualMethod() override {
        std::cout << "Bottom::virtualMethod\\n";
    }
    
    void demonstrateAccess() {
        // Only one instance of VirtualBase exists
        virtualData = 999;  // Unambiguous access
        std::cout << "Virtual base data: " << virtualData << "\\n";
    }
    
    int bottomData = 400;
};

void demonstrateDiamondInheritance() {
    auto bottomPtr = std::make_shared<Bottom>();
    
    std::cout << "Bottom object address: " << bottomPtr.get() << "\\n";
    
    // Cast to virtual base - significant pointer adjustment likely
    std::shared_ptr<VirtualBase> virtualPtr = bottomPtr;
    std::cout << "Virtual base address: " << virtualPtr.get() << "\\n";
    
    // Cast to intermediate classes
    std::shared_ptr<Left> leftPtr = bottomPtr;
    std::shared_ptr<Right> rightPtr = bottomPtr;
    
    std::cout << "Left base address: " << leftPtr.get() << "\\n";
    std::cout << "Right base address: " << rightPtr.get() << "\\n";
    
    // All share the same control block
    std::cout << "\\nReference count: " << bottomPtr.use_count() << "\\n";
    
    // Verify single virtual base instance
    bottomPtr->demonstrateAccess();
    std::cout << "Access through virtual base: " << virtualPtr->virtualData << "\\n";
}`}
        </code>
      </CodeBlock>

      <h3>Safe Casting Operations</h3>
      <CodeBlock>
        <code>
{`// Demonstrate safe casting with shared_ptr
class SafeCastingDemo {
public:
    static void demonstrateCasting() {
        // Create derived object
        std::shared_ptr<Bottom> bottom = std::make_shared<Bottom>();
        
        // Upcast to base (always safe)
        std::shared_ptr<VirtualBase> base = bottom;
        
        // Downcast using dynamic_pointer_cast (safe)
        if (auto derivedAgain = std::dynamic_pointer_cast<Bottom>(base)) {
            std::cout << "Dynamic cast succeeded\\n";
            derivedAgain->demonstrateAccess();
        } else {
            std::cout << "Dynamic cast failed\\n";
        }
        
        // Cross-cast between sibling classes
        std::shared_ptr<Left> leftPtr = bottom;
        if (auto rightPtr = std::dynamic_pointer_cast<Right>(leftPtr)) {
            std::cout << "Cross-cast from Left to Right succeeded\\n";
            rightPtr->rightMethod();
        }
        
        // Static cast (faster but potentially unsafe)
        std::shared_ptr<Right> rightStatic = 
            std::static_pointer_cast<Right>(leftPtr);
        // This works because we know leftPtr actually points to Bottom
        rightStatic->rightMethod();
    }
    
    static void demonstrateFailedCast() {
        // Create a Left object (not Bottom)
        std::shared_ptr<Left> pureLeft = std::make_shared<Left>();
        std::shared_ptr<VirtualBase> basePtr = pureLeft;
        
        // Try to cast to Bottom - should fail
        if (auto bottomPtr = std::dynamic_pointer_cast<Bottom>(basePtr)) {
            std::cout << "Unexpected success\\n";
        } else {
            std::cout << "Dynamic cast correctly failed - not a Bottom\\n";
        }
        
        // Try to cast to Right - should fail
        if (auto rightPtr = std::dynamic_pointer_cast<Right>(pureLeft)) {
            std::cout << "Unexpected success\\n";
        } else {
            std::cout << "Cross-cast correctly failed - Left is not Right\\n";
        }
    }
};`}
        </code>
      </CodeBlock>

      <h3>Memory Layout and Performance Considerations</h3>
      <CodeBlock>
        <code>
{`// Understanding memory layout implications
class MemoryLayoutAnalysis {
public:
    static void analyzeLayout() {
        std::shared_ptr<Bottom> obj = std::make_shared<Bottom>();
        
        // Get addresses of different base class views
        void* bottomAddr = static_cast<void*>(obj.get());
        void* leftAddr = static_cast<void*>(static_cast<Left*>(obj.get()));
        void* rightAddr = static_cast<void*>(static_cast<Right*>(obj.get()));
        void* virtualAddr = static_cast<void*>(static_cast<VirtualBase*>(obj.get()));
        
        std::cout << "Memory layout analysis:\\n";
        std::cout << "Bottom address:      " << bottomAddr << "\\n";
        std::cout << "Left base address:   " << leftAddr << "\\n";
        std::cout << "Right base address:  " << rightAddr << "\\n";
        std::cout << "Virtual base address:" << virtualAddr << "\\n";
        
        // Calculate offsets
        ptrdiff_t leftOffset = static_cast<char*>(leftAddr) - static_cast<char*>(bottomAddr);
        ptrdiff_t rightOffset = static_cast<char*>(rightAddr) - static_cast<char*>(bottomAddr);
        ptrdiff_t virtualOffset = static_cast<char*>(virtualAddr) - static_cast<char*>(bottomAddr);
        
        std::cout << "\\nOffsets from Bottom:\\n";
        std::cout << "Left offset:    " << leftOffset << "\\n";
        std::cout << "Right offset:   " << rightOffset << "\\n";
        std::cout << "Virtual offset: " << virtualOffset << "\\n";
    }
    
    // Performance comparison
    static void performanceTesting() {
        const int iterations = 1000000;
        auto obj = std::make_shared<Bottom>();
        
        // Time direct access
        auto start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            obj->bottomData += i;
        }
        auto directTime = std::chrono::high_resolution_clock::now() - start;
        
        // Time access through base pointer
        std::shared_ptr<VirtualBase> basePtr = obj;
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < iterations; ++i) {
            basePtr->virtualData += i;
        }
        auto virtualTime = std::chrono::high_resolution_clock::now() - start;
        
        std::cout << "Direct access time:  " 
                  << std::chrono::duration_cast<std::chrono::microseconds>(directTime).count() 
                  << " microseconds\\n";
        std::cout << "Virtual access time: " 
                  << std::chrono::duration_cast<std::chrono::microseconds>(virtualTime).count() 
                  << " microseconds\\n";
    }
};`}
        </code>
      </CodeBlock>

      <h3>Best Practices and Common Pitfalls</h3>
      <CodeBlock>
        <code>
{`// Best practices for shared_ptr with multiple inheritance
class BestPractices {
public:
    // 1. Always use virtual destructors in base classes
    class ProperBase1 {
    public:
        virtual ~ProperBase1() = default;  // Virtual destructor
        virtual void interface1() = 0;
    };
    
    class ProperBase2 {
    public:
        virtual ~ProperBase2() = default;  // Virtual destructor
        virtual void interface2() = 0;
    };
    
    // 2. Use virtual inheritance for diamond hierarchies
    class ProperDerived : public ProperBase1, public ProperBase2 {
    public:
        ~ProperDerived() override = default;
        void interface1() override { /* implementation */ }
        void interface2() override { /* implementation */ }
    };
    
    // 3. Prefer dynamic_pointer_cast for safety
    static std::shared_ptr<ProperBase2> safeCast(std::shared_ptr<ProperBase1> ptr) {
        return std::dynamic_pointer_cast<ProperBase2>(ptr);  // Safe
        // Not: std::static_pointer_cast<ProperBase2>(ptr);  // Potentially unsafe
    }
    
    // 4. Be aware of pointer value changes
    static void demonstratePointerEquality() {
        auto derived = std::make_shared<ProperDerived>();
        std::shared_ptr<ProperBase1> base1 = derived;
        std::shared_ptr<ProperBase2> base2 = derived;
        
        // These may not be equal due to pointer adjustment!
        if (base1.get() != base2.get()) {
            std::cout << "Pointer values differ due to multiple inheritance\\n";
        }
        
        // But the control blocks are the same
        std::cout << "Reference counts are equal: " 
                  << (base1.use_count() == base2.use_count()) << "\\n";
    }
    
    // 5. Use enable_shared_from_this carefully
    class SharedFromThisMultiple : public std::enable_shared_from_this<SharedFromThisMultiple>,
                                   public ProperBase1 {
    public:
        void interface1() override {
            // Get shared_ptr to this object
            auto self = shared_from_this();
            
            // Cast to base works correctly
            std::shared_ptr<ProperBase1> base = self;
            std::cout << "Self-reference count: " << self.use_count() << "\\n";
        }
    };
};

// Common pitfall: Trying to create shared_ptr from different base addresses
void demonstrateCommonPitfall() {
    Bottom* rawPtr = new Bottom();
    
    // WRONG: Creating shared_ptr from different base class pointers
    // These would create separate control blocks!
    // std::shared_ptr<Left> leftPtr(static_cast<Left*>(rawPtr));      // BAD
    // std::shared_ptr<Right> rightPtr(static_cast<Right*>(rawPtr));   // BAD
    
    // CORRECT: Create from the original type or use proper casting
    std::shared_ptr<Bottom> correctPtr(rawPtr);
    std::shared_ptr<Left> leftPtr = correctPtr;     // Good
    std::shared_ptr<Right> rightPtr = correctPtr;   // Good
    
    std::cout << "Proper shared ownership established\\n";
}`}
        </code>
      </CodeBlock>

      <QuizContainer>
        <h3>Test Your Understanding</h3>
        {quizQuestions.map((q, qIndex) => (
          <QuizQuestion key={qIndex}>
            <h4>Question {qIndex + 1}: {q.question}</h4>
            {q.options.map((option, oIndex) => (
              <QuizButton
                key={oIndex}
                onClick={() => handleQuizAnswer(qIndex, oIndex)}
                correct={showResults && oIndex === q.correct}
                incorrect={showResults && quizAnswers[qIndex] === oIndex && oIndex !== q.correct}
              >
                {option}
              </QuizButton>
            ))}
            {showResults && (
              <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(74, 158, 255, 0.1)', borderRadius: '5px' }}>
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </QuizQuestion>
        ))}
        
        {showResults && (
          <ScoreDisplay>
            Your Score: {quizAnswers.reduce((acc, answer, index) => {
              return acc + (answer === quizQuestions[index].correct ? 20 : 0);
            }, 0)}/100
          </ScoreDisplay>
        )}
      </QuizContainer>
    </Container>
  );
}