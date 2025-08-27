import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { THREE } from '../utils/three';

interface Lesson58Props {
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

interface PerformanceVisualizationProps {
  operation: 'copy' | 'move' | 'rvo';
}

function PerformanceVisualization({ operation }: PerformanceVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      setAnimationPhase(state.clock.elapsedTime);
    }
  });

  const getOperationColor = () => {
    switch (operation) {
      case 'copy': return '#ff6b6b';
      case 'move': return '#50c878';
      case 'rvo': return '#4a9eff';
      default: return '#ffffff';
    }
  };

  const renderDataFlow = () => {
    const color = getOperationColor();
    
    switch (operation) {
      case 'copy':
        return (
          <group>
            {/* Source */}
            <mesh position={[-2, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#cccccc" />
            </mesh>
            {/* Copy operation */}
            <mesh position={[0, 0, 0]} scale={[1, 0.5, 0.5]}>
              <boxGeometry args={[2, 1, 1]} />
              <meshStandardMaterial color={color} transparent opacity={0.7} />
            </mesh>
            {/* Destination */}
            <mesh position={[2, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#cccccc" />
            </mesh>
            <Text position={[0, -1.5, 0]} fontSize={0.3} color="white" anchorX="center">
              EXPENSIVE COPY
            </Text>
          </group>
        );
      case 'move':
        return (
          <group>
            {/* Source (fading) */}
            <mesh position={[-2, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#666666" transparent opacity={0.3} />
            </mesh>
            {/* Move operation */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, animationPhase]}>
              <coneGeometry args={[0.3, 1]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Destination */}
            <mesh position={[2, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#cccccc" />
            </mesh>
            <Text position={[0, -1.5, 0]} fontSize={0.3} color="white" anchorX="center">
              FAST MOVE
            </Text>
          </group>
        );
      case 'rvo':
        return (
          <group>
            {/* Direct construction */}
            <mesh position={[0, 0, 0]} scale={[1 + 0.2 * Math.sin(animationPhase * 2), 1, 1]}>
              <boxGeometry args={[2, 1, 1]} />
              <meshStandardMaterial color={color} transparent opacity={0.8} />
            </mesh>
            <Text position={[0, -1.5, 0]} fontSize={0.3} color="white" anchorX="center">
              RVO OPTIMIZATION
            </Text>
          </group>
        );
    }
  };

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      {renderDataFlow()}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.4}
        color={getOperationColor()}
        anchorX="center"
        anchorY="middle"
      >
        {operation.toUpperCase()} Operation
      </Text>
    </group>
  );
}

export default function Lesson58_PerformanceBattleCopyVsMove({ onComplete, isCompleted }: Lesson58Props) {
  const [currentOperation, setCurrentOperation] = useState<'copy' | 'move' | 'rvo'>('copy');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const operations: Array<'copy' | 'move' | 'rvo'> = ['copy', 'move', 'rvo'];

  const quizQuestions = [
    {
      question: "What is the main performance advantage of move semantics over copying?",
      options: [
        "Uses less memory",
        "Transfers ownership of resources instead of duplicating them",
        "Compiles faster",
        "Better cache locality"
      ],
      correct: 1,
      explanation: "Move semantics transfers ownership of resources (like heap-allocated memory) instead of creating expensive copies."
    },
    {
      question: "When does Return Value Optimization (RVO) eliminate both copy and move operations?",
      options: [
        "When returning small objects",
        "When the compiler can construct the return value directly in the caller's memory",
        "When using smart pointers",
        "Never, moves are always needed"
      ],
      correct: 1,
      explanation: "RVO allows the compiler to construct the return value directly in the caller's memory location, eliminating any copy or move."
    },
    {
      question: "What makes an object efficiently movable?",
      options: [
        "Small size",
        "Having a move constructor that transfers resources without expensive operations",
        "Being allocated on the stack",
        "Having virtual functions"
      ],
      correct: 1,
      explanation: "Efficiently movable objects have move constructors that simply transfer ownership of resources (like pointers) without expensive copying."
    },
    {
      question: "Which scenario benefits most from move semantics?",
      options: [
        "Passing int by value",
        "Large objects with dynamically allocated resources",
        "Empty classes",
        "Static variables"
      ],
      correct: 1,
      explanation: "Large objects with dynamic resources (like std::vector, std::string) benefit most from move semantics by avoiding expensive deep copies."
    },
    {
      question: "What is copy elision?",
      options: [
        "Removing unnecessary copy operations",
        "Compiler optimization that eliminates copy/move operations entirely",
        "A coding technique to avoid copies",
        "A type of smart pointer"
      ],
      correct: 1,
      explanation: "Copy elision is a compiler optimization that eliminates copy/move operations by constructing objects directly in their final location."
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
      <Title>Lesson 58: Performance Battle - Copy vs Move</Title>
      
      <Description>
        <h3>Understanding Move Semantics and Copy Elision Performance</h3>
        <p>
          Move semantics revolutionized C++ performance by enabling efficient transfer of resources
          instead of expensive copying. Combined with compiler optimizations like RVO (Return Value
          Optimization) and copy elision, modern C++ can achieve zero-cost abstractions even with
          complex object hierarchies.
        </p>
        
        <h4>Performance Concepts:</h4>
        <ul>
          <li><strong>Copy semantics:</strong> Duplicate resources, expensive for large objects</li>
          <li><strong>Move semantics:</strong> Transfer ownership, cheap for any object size</li>
          <li><strong>RVO/NRVO:</strong> Eliminate copies/moves entirely through direct construction</li>
          <li><strong>Copy elision:</strong> Compiler optimization removing unnecessary operations</li>
        </ul>
      </Description>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
          <PerformanceVisualization operation={currentOperation} />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </VisualizationContainer>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        {operations.map(op => (
          <button
            key={op}
            onClick={() => setCurrentOperation(op)}
            style={{
              padding: '10px 15px',
              background: currentOperation === op ? '#4a9eff' : 'rgba(74, 158, 255, 0.3)',
              color: 'white',
              border: '1px solid rgba(74, 158, 255, 0.5)',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {op.toUpperCase()}
          </button>
        ))}
      </div>

      <h3>Performance Benchmark: Copy vs Move</h3>
      <CodeBlock>
        <code>
{`#include <chrono>
#include <vector>
#include <string>
#include <iostream>
#include <memory>

// Heavy object for performance testing
class HeavyObject {
private:
    std::vector<int> data_;
    std::string name_;
    std::unique_ptr<int[]> buffer_;
    static constexpr size_t BUFFER_SIZE = 10000;

public:
    // Constructor
    HeavyObject(const std::string& name) 
        : data_(BUFFER_SIZE, 42)
        , name_(name)
        , buffer_(std::make_unique<int[]>(BUFFER_SIZE)) {
        
        std::cout << "Constructing " << name_ << "\\n";
        
        // Initialize buffer
        for (size_t i = 0; i < BUFFER_SIZE; ++i) {
            buffer_[i] = static_cast<int>(i);
        }
    }
    
    // Copy constructor - expensive!
    HeavyObject(const HeavyObject& other) 
        : data_(other.data_)  // Deep copy of vector
        , name_(other.name_ + "_copy")
        , buffer_(std::make_unique<int[]>(BUFFER_SIZE)) {  // Allocate new buffer
        
        std::cout << "EXPENSIVE COPY: " << name_ << "\\n";
        
        // Copy buffer contents
        for (size_t i = 0; i < BUFFER_SIZE; ++i) {
            buffer_[i] = other.buffer_[i];
        }
    }
    
    // Move constructor - cheap!
    HeavyObject(HeavyObject&& other) noexcept
        : data_(std::move(other.data_))      // Move vector (just pointer swap)
        , name_(std::move(other.name_))      // Move string  
        , buffer_(std::move(other.buffer_))  // Move unique_ptr (just pointer transfer)
    {
        std::cout << "FAST MOVE: " << name_ << "\\n";
        // No expensive operations, just pointer/handle transfers
    }
    
    // Assignment operators
    HeavyObject& operator=(const HeavyObject& other) {
        if (this != &other) {
            data_ = other.data_;  // Expensive copy
            name_ = other.name_ + "_copy_assigned";
            
            buffer_ = std::make_unique<int[]>(BUFFER_SIZE);
            for (size_t i = 0; i < BUFFER_SIZE; ++i) {
                buffer_[i] = other.buffer_[i];
            }
        }
        return *this;
    }
    
    HeavyObject& operator=(HeavyObject&& other) noexcept {
        if (this != &other) {
            data_ = std::move(other.data_);    // Fast move
            name_ = std::move(other.name_);    
            buffer_ = std::move(other.buffer_);
        }
        return *this;
    }
    
    const std::string& getName() const { return name_; }
    size_t getDataSize() const { return data_.size(); }
};

// Performance testing framework
class PerformanceTester {
public:
    template<typename Func>
    static auto timeOperation(const std::string& description, Func&& func) {
        std::cout << "\\n=== " << description << " ===\\n";
        
        auto start = std::chrono::high_resolution_clock::now();
        auto result = func();
        auto end = std::chrono::high_resolution_clock::now();
        
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        std::cout << "Time taken: " << duration.count() << " microseconds\\n";
        
        return std::make_pair(result, duration);
    }
    
    static void compareOperations() {
        const int iterations = 1000;
        
        // Test 1: Copy vs Move in vector operations
        std::cout << "\\n" << std::string(50, '=') << "\\n";
        std::cout << "VECTOR OPERATIONS COMPARISON\\n";
        std::cout << std::string(50, '=') << "\\n";
        
        // Copy-heavy operations
        auto [copy_result, copy_time] = timeOperation("Vector with Copy Operations", [&]() {
            std::vector<HeavyObject> vec;
            vec.reserve(iterations);  // Prevent reallocation
            
            for (int i = 0; i < iterations; ++i) {
                HeavyObject obj("heavy_" + std::to_string(i));
                vec.push_back(obj);  // Copy into vector
            }
            return vec.size();
        });
        
        // Move-optimized operations  
        auto [move_result, move_time] = timeOperation("Vector with Move Operations", [&]() {
            std::vector<HeavyObject> vec;
            vec.reserve(iterations);
            
            for (int i = 0; i < iterations; ++i) {
                vec.emplace_back("heavy_" + std::to_string(i));  // Direct construction
                // OR: vec.push_back(HeavyObject("heavy_" + std::to_string(i)));  // Move from temporary
            }
            return vec.size();
        });
        
        std::cout << "\\nPerformance improvement: " 
                  << (static_cast<double>(copy_time.count()) / move_time.count()) 
                  << "x faster with move semantics\\n";
    }
};

// RVO demonstration
class RVOTester {
public:
    // Function that benefits from RVO
    static HeavyObject createHeavyObject(const std::string& name) {
        HeavyObject obj(name);
        // Some operations...
        return obj;  // RVO: no copy or move, direct construction in caller's space
    }
    
    // Function that prevents RVO (multiple return paths)
    static HeavyObject createHeavyObjectNoRVO(const std::string& name, bool condition) {
        HeavyObject obj1(name + "_1");
        HeavyObject obj2(name + "_2");
        
        if (condition) {
            return obj1;  // Move operation (RVO prevented by multiple return objects)
        } else {
            return obj2;  // Move operation
        }
    }
    
    static void demonstrateRVO() {
        std::cout << "\\n" << std::string(40, '=') << "\\n";
        std::cout << "RVO DEMONSTRATION\\n"; 
        std::cout << std::string(40, '=') << "\\n";
        
        // RVO case - no copy or move
        std::cout << "\\n--- With RVO (single return path) ---\\n";
        HeavyObject rvo_obj = createHeavyObject("RVO_test");
        
        // No RVO case - move operation
        std::cout << "\\n--- Without RVO (multiple return paths) ---\\n";
        HeavyObject no_rvo_obj = createHeavyObjectNoRVO("NoRVO_test", true);
    }
};`}
        </code>
      </CodeBlock>

      <h3>Advanced Move Semantics Patterns</h3>
      <CodeBlock>
        <code>
{`// Advanced move semantics and perfect forwarding
template<typename T>
class MoveOptimizedContainer {
private:
    std::vector<T> data_;
    
public:
    // Perfect forwarding constructor
    template<typename... Args>
    void emplace_back(Args&&... args) {
        data_.emplace_back(std::forward<Args>(args)...);  // Perfect forwarding
    }
    
    // Move-aware insert
    void push_back(const T& value) {  // Copy version
        data_.push_back(value);
    }
    
    void push_back(T&& value) {  // Move version
        data_.push_back(std::move(value));
    }
    
    // Universal reference with perfect forwarding
    template<typename U>
    void universal_push(U&& value) {
        data_.push_back(std::forward<U>(value));
    }
    
    // Move-aware swap
    void swap(MoveOptimizedContainer& other) noexcept {
        data_.swap(other.data_);  // Efficient O(1) swap
    }
    
    // Move iterator support
    auto begin_move() {
        return std::make_move_iterator(data_.begin());
    }
    
    auto end_move() {
        return std::make_move_iterator(data_.end());
    }
};

// Conditional move based on type traits
template<typename T>
class ConditionalMover {
public:
    static T conditional_move(T& value) {
        if constexpr (std::is_nothrow_move_constructible_v<T>) {
            return std::move(value);  // Safe to move
        } else {
            return value;  // Copy instead (safer)
        }
    }
};

// RAII with move semantics for resources
class MoveableResource {
private:
    std::unique_ptr<int[]> buffer_;
    size_t size_;
    std::string name_;
    
public:
    MoveableResource(size_t size, const std::string& name)
        : buffer_(std::make_unique<int[]>(size))
        , size_(size) 
        , name_(name) {
        std::cout << "Allocated resource: " << name_ << "\\n";
    }
    
    // Move constructor - efficient transfer
    MoveableResource(MoveableResource&& other) noexcept
        : buffer_(std::move(other.buffer_))
        , size_(other.size_)
        , name_(std::move(other.name_)) {
        
        other.size_ = 0;  // Reset moved-from object
        std::cout << "Moved resource: " << name_ << "\\n";
    }
    
    // Move assignment
    MoveableResource& operator=(MoveableResource&& other) noexcept {
        if (this != &other) {
            // Release current resources
            buffer_.reset();
            
            // Take ownership of other's resources
            buffer_ = std::move(other.buffer_);
            size_ = other.size_;
            name_ = std::move(other.name_);
            
            other.size_ = 0;
        }
        return *this;
    }
    
    // Deleted copy operations (move-only type)
    MoveableResource(const MoveableResource&) = delete;
    MoveableResource& operator=(const MoveableResource&) = delete;
    
    ~MoveableResource() {
        if (buffer_) {
            std::cout << "Released resource: " << name_ << "\\n";
        }
    }
    
    bool is_valid() const { return buffer_ != nullptr; }
    size_t size() const { return size_; }
    const std::string& name() const { return name_; }
};

// Factory functions with guaranteed move/RVO
class ResourceFactory {
public:
    // RVO-friendly factory
    static MoveableResource createResource(size_t size, const std::string& name) {
        return MoveableResource(size, name);  // RVO applies here
    }
    
    // Move-returning factory  
    static std::unique_ptr<MoveableResource> createUniqueResource(size_t size, const std::string& name) {
        return std::make_unique<MoveableResource>(size, name);  // Move into unique_ptr
    }
    
    // Conditional creation with moves
    static std::vector<MoveableResource> createBatch(const std::vector<std::pair<size_t, std::string>>& specs) {
        std::vector<MoveableResource> resources;
        resources.reserve(specs.size());  // Prevent reallocation
        
        for (const auto& [size, name] : specs) {
            resources.emplace_back(size, name);  // Direct construction, no copy/move
        }
        
        return resources;  // RVO applies to entire vector
    }
};

// Performance monitoring for move operations
class MovePerformanceMonitor {
private:
    static thread_local size_t copy_count_;
    static thread_local size_t move_count_;
    static thread_local size_t construction_count_;
    
public:
    static void recordCopy() { ++copy_count_; }
    static void recordMove() { ++move_count_; }
    static void recordConstruction() { ++construction_count_; }
    
    static void printStats() {
        std::cout << "Performance Stats:\\n";
        std::cout << "  Constructions: " << construction_count_ << "\\n";
        std::cout << "  Copies: " << copy_count_ << "\\n";
        std::cout << "  Moves: " << move_count_ << "\\n";
        std::cout << "  Move efficiency: " 
                  << (100.0 * move_count_ / (copy_count_ + move_count_)) << "%\\n";
    }
    
    static void reset() {
        copy_count_ = move_count_ = construction_count_ = 0;
    }
};

thread_local size_t MovePerformanceMonitor::copy_count_ = 0;
thread_local size_t MovePerformanceMonitor::move_count_ = 0; 
thread_local size_t MovePerformanceMonitor::construction_count_ = 0;

// Instrumented class for monitoring
class InstrumentedHeavyObject {
private:
    std::vector<int> data_;
    std::string name_;
    
public:
    InstrumentedHeavyObject(const std::string& name) : data_(1000, 42), name_(name) {
        MovePerformanceMonitor::recordConstruction();
    }
    
    InstrumentedHeavyObject(const InstrumentedHeavyObject& other) 
        : data_(other.data_), name_(other.name_ + "_copy") {
        MovePerformanceMonitor::recordCopy();
    }
    
    InstrumentedHeavyObject(InstrumentedHeavyObject&& other) noexcept
        : data_(std::move(other.data_)), name_(std::move(other.name_)) {
        MovePerformanceMonitor::recordMove();
    }
};`}
        </code>
      </CodeBlock>

      <h3>Compiler Optimizations and Copy Elision</h3>
      <CodeBlock>
        <code>
{`// Understanding compiler optimizations
class OptimizationDemonstrator {
public:
    // Guaranteed copy elision (C++17)
    static HeavyObject guaranteedElision() {
        return HeavyObject("guaranteed");  // Guaranteed RVO since C++17
    }
    
    // Named Return Value Optimization (NRVO)
    static HeavyObject namedRVO() {
        HeavyObject obj("named");
        // ... some operations on obj
        return obj;  // NRVO likely (but not guaranteed pre-C++17)
    }
    
    // Multiple return paths (NRVO less likely)
    static HeavyObject multipleReturns(bool condition) {
        if (condition) {
            HeavyObject obj1("path1");
            return obj1;  // May require move
        } else {
            HeavyObject obj2("path2"); 
            return obj2;  // May require move
        }
    }
    
    // Copy elision with temporaries
    static void temporaryElision() {
        // These are all optimized away with copy elision:
        
        HeavyObject obj1 = HeavyObject("temp1");  // Copy elision
        
        HeavyObject obj2(HeavyObject("temp2"));   // Copy elision
        
        auto obj3 = guaranteedElision();          // RVO
        
        // Function parameter copy elision
        processObject(HeavyObject("temp3"));     // Copy elision
    }
    
private:
    static void processObject(const HeavyObject& obj) {
        std::cout << "Processing: " << obj.getName() << "\\n";
    }
};

// Measuring optimization impact
class OptimizationMeasurer {
public:
    static void measureOptimizations() {
        std::cout << "\\n" << std::string(50, '=') << "\\n";
        std::cout << "COMPILER OPTIMIZATION MEASUREMENT\\n";
        std::cout << std::string(50, '=') << "\\n";
        
        MovePerformanceMonitor::reset();
        
        // Test various scenarios
        std::cout << "\\n--- Testing RVO ---\\n";
        auto obj1 = OptimizationDemonstrator::guaranteedElision();
        
        std::cout << "\\n--- Testing NRVO ---\\n"; 
        auto obj2 = OptimizationDemonstrator::namedRVO();
        
        std::cout << "\\n--- Testing Multiple Returns ---\\n";
        auto obj3 = OptimizationDemonstrator::multipleReturns(true);
        
        std::cout << "\\n--- Testing Copy Elision ---\\n";
        OptimizationDemonstrator::temporaryElision();
        
        MovePerformanceMonitor::printStats();
    }
};

// Best practices for move-friendly code
class MoveBestPractices {
public:
    // 1. Use emplace over insert when possible
    template<typename Container, typename... Args>
    static void efficientInsertion(Container& container, Args&&... args) {
        container.emplace_back(std::forward<Args>(args)...);  // Construct in-place
        // Better than: container.push_back(T(std::forward<Args>(args)...));
    }
    
    // 2. Return by value for move-friendly types
    static std::vector<HeavyObject> createCollection() {
        std::vector<HeavyObject> result;
        result.reserve(100);
        
        for (int i = 0; i < 100; ++i) {
            result.emplace_back("item_" + std::to_string(i));
        }
        
        return result;  // RVO applies
    }
    
    // 3. Use move in algorithms
    template<typename Container>
    static Container moveElements(Container source) {
        Container destination;
        destination.reserve(source.size());
        
        // Move elements instead of copying
        std::move(source.begin(), source.end(), std::back_inserter(destination));
        
        return destination;
    }
    
    // 4. Conditional move with type traits
    template<typename T>
    static T smart_move_or_copy(T& value) {
        if constexpr (std::is_nothrow_move_constructible_v<T> && 
                      std::is_nothrow_move_assignable_v<T>) {
            return std::move(value);  // Safe to move
        } else {
            return value;  // Copy for safety
        }
    }
    
    // 5. Sink parameters for optimal flexibility
    class Container {
        std::vector<std::string> items_;
        
    public:
        // Sink parameter: accepts both lvalues and rvalues optimally
        void addItem(std::string item) {  // Pass by value
            items_.push_back(std::move(item));  // Always move into container
        }
        
        // Alternative overload approach (more verbose but explicit)
        void addItemExplicit(const std::string& item) {  // Lvalue reference
            items_.push_back(item);  // Copy
        }
        
        void addItemExplicit(std::string&& item) {  // Rvalue reference
            items_.push_back(std::move(item));  // Move
        }
    };
    
    static void demonstrateBestPractices() {
        std::cout << "\\n=== Move Best Practices Demo ===\\n";
        
        // Efficient collection creation
        auto collection = createCollection();
        std::cout << "Created collection with " << collection.size() << " items\\n";
        
        // Move between containers
        auto moved_collection = moveElements(std::move(collection));
        std::cout << "Moved to new collection\\n";
        
        // Sink parameter usage
        Container container;
        
        std::string item1 = "lvalue_item";
        container.addItem(item1);           // Copy into parameter, move into container
        
        container.addItem("rvalue_item");   // Move into parameter, move into container
    }
};

// Demonstration function
void runPerformanceComparison() {
    std::cout << "Starting Performance Battle: Copy vs Move\\n";
    
    PerformanceTester::compareOperations();
    RVOTester::demonstrateRVO();
    OptimizationMeasurer::measureOptimizations();
    MoveBestPractices::demonstrateBestPractices();
}`}
        </code>
      </CodeBlock>

      <QuizContainer>
        <h3>Test Your Performance Knowledge</h3>
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