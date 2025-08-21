import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson50Props {
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

interface VectorVisualizationProps {
  stage: number;
}

function VectorVisualization({ stage }: VectorVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      setAnimationPhase(state.clock.elapsedTime);
    }
  });

  const renderMemoryBlocks = () => {
    const blocks = [];
    const phases = [
      { capacity: 2, used: 2, color: '#4a9eff' },
      { capacity: 4, used: 3, color: '#ff9f40' },
      { capacity: 8, used: 5, color: '#ff6b6b' },
    ];
    
    const currentPhase = phases[stage % phases.length];
    
    for (let i = 0; i < currentPhase.capacity; i++) {
      const isUsed = i < currentPhase.used;
      const x = (i - currentPhase.capacity / 2) * 1.5;
      
      blocks.push(
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={isUsed ? currentPhase.color : '#333333'}
            transparent
            opacity={isUsed ? 0.8 : 0.3}
          />
          {isUsed && (
            <Text
              position={[0, 0, 0.6]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              ptr{i + 1}
            </Text>
          )}
        </mesh>
      );
    }
    
    return blocks;
  };

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {renderMemoryBlocks()}
      
      <Text
        position={[0, -2, 0]}
        fontSize={0.4}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
      >
        Vector Reallocation Stage {stage + 1}
      </Text>
      
      <Text
        position={[0, -2.8, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Capacity Growth: 2 → 4 → 8
      </Text>
    </group>
  );
}

export default function Lesson50_VectorUniquePtrReallocation({ onComplete, isCompleted }: Lesson50Props) {
  const [currentStage, setCurrentStage] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      question: "What happens to unique_ptr objects during vector reallocation?",
      options: [
        "They are copied to the new memory location",
        "They are moved to the new memory location",
        "They are destroyed and recreated",
        "Reallocation is prevented"
      ],
      correct: 1,
      explanation: "unique_ptr objects are moved during reallocation since they cannot be copied."
    },
    {
      question: "Why is vector<unique_ptr<T>> exception-safe during reallocation?",
      options: [
        "Because unique_ptr move constructor is noexcept",
        "Because vector uses placement new",
        "Because unique_ptr has a copy constructor",
        "Because vector allocates extra memory"
      ],
      correct: 0,
      explanation: "The move constructor of unique_ptr is noexcept, ensuring strong exception safety."
    },
    {
      question: "What would happen with vector<unique_ptr<T>> if unique_ptr was copyable?",
      options: [
        "Better performance",
        "Potential double deletion",
        "No difference",
        "Compilation error"
      ],
      correct: 1,
      explanation: "If unique_ptr was copyable, reallocation could lead to multiple unique_ptrs owning the same object."
    },
    {
      question: "When does vector<unique_ptr<T>> reallocation typically occur?",
      options: [
        "When capacity is exceeded",
        "When elements are accessed",
        "When the vector is destroyed",
        "Never, it's prevented"
      ],
      correct: 0,
      explanation: "Reallocation occurs when adding elements would exceed the current capacity."
    },
    {
      question: "What is the performance characteristic of vector<unique_ptr<T>> reallocation?",
      options: [
        "O(1) due to move semantics",
        "O(n) where n is the number of elements",
        "O(n²) due to pointer complexity",
        "O(log n) due to binary allocation"
      ],
      correct: 1,
      explanation: "Reallocation is O(n) as each element must be moved to the new memory location."
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
      <Title>Lesson 50: Vector&lt;unique_ptr&lt;T&gt;&gt; Reallocation Behavior</Title>
      
      <Description>
        <h3>Understanding Memory Reallocation with Smart Pointers</h3>
        <p>
          When a <code>vector&lt;unique_ptr&lt;T&gt;&gt;</code> needs to grow beyond its current capacity,
          it must reallocate memory and move all existing elements. This lesson explores the unique
          behavior of unique_ptr during reallocation and the exception safety guarantees provided.
        </p>
        
        <h4>Key Concepts:</h4>
        <ul>
          <li><strong>Move-only semantics:</strong> unique_ptr cannot be copied, only moved</li>
          <li><strong>Exception safety:</strong> Strong guarantee during reallocation</li>
          <li><strong>Performance implications:</strong> O(n) complexity for reallocation</li>
          <li><strong>Memory management:</strong> Automatic cleanup on exceptions</li>
        </ul>
      </Description>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <VectorVisualization stage={currentStage} />
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
        Next Reallocation Stage
      </button>

      <h3>The Reallocation Process</h3>
      <CodeBlock>
        <code>
{`#include <vector>
#include <memory>
#include <iostream>

class Resource {
public:
    Resource(int id) : id_(id) {
        std::cout << "Resource " << id_ << " created\\n";
    }
    
    ~Resource() {
        std::cout << "Resource " << id_ << " destroyed\\n";
    }
    
    // Move constructor for demonstration
    Resource(Resource&& other) noexcept : id_(other.id_) {
        other.id_ = -1;
        std::cout << "Resource " << id_ << " moved\\n";
    }
    
private:
    int id_;
};

void demonstrateReallocation() {
    std::vector<std::unique_ptr<Resource>> vec;
    
    // Initial capacity is typically 0
    std::cout << "Initial capacity: " << vec.capacity() << "\\n";
    
    // Add first element - triggers first allocation
    vec.push_back(std::make_unique<Resource>(1));
    std::cout << "After first push: capacity = " << vec.capacity() << "\\n";
    
    // Add second element - may trigger reallocation
    vec.push_back(std::make_unique<Resource>(2));
    std::cout << "After second push: capacity = " << vec.capacity() << "\\n";
    
    // Continue adding - observe reallocation pattern
    for (int i = 3; i <= 10; ++i) {
        size_t old_capacity = vec.capacity();
        vec.push_back(std::make_unique<Resource>(i));
        
        if (vec.capacity() != old_capacity) {
            std::cout << "Reallocation occurred! New capacity: " 
                      << vec.capacity() << "\\n";
        }
    }
}`}
        </code>
      </CodeBlock>

      <h3>Exception Safety Analysis</h3>
      <CodeBlock>
        <code>
{`// Why vector<unique_ptr<T>> is exception-safe during reallocation:

class ExceptionResource {
public:
    ExceptionResource(int id) : id_(id) {
        if (id == 5) {
            throw std::runtime_error("Simulated construction failure");
        }
    }
    
    // Move constructor is noexcept - crucial for exception safety
    ExceptionResource(ExceptionResource&& other) noexcept 
        : id_(other.id_) {
        other.id_ = -1;
    }
    
private:
    int id_;
};

void demonstrateExceptionSafety() {
    std::vector<std::unique_ptr<ExceptionResource>> vec;
    
    try {
        // Fill vector to trigger multiple reallocations
        for (int i = 1; i <= 10; ++i) {
            // unique_ptr constructor may throw
            auto ptr = std::make_unique<ExceptionResource>(i);
            
            // But push_back with unique_ptr is exception-safe
            // because unique_ptr move is noexcept
            vec.push_back(std::move(ptr));
        }
    } catch (const std::exception& e) {
        // If exception occurs during make_unique, vector remains unchanged
        // If exception occurs during reallocation, it's handled safely
        std::cout << "Exception caught: " << e.what() << "\\n";
        std::cout << "Vector size remains: " << vec.size() << "\\n";
    }
    
    // All successfully created objects are properly managed
}`}
        </code>
      </CodeBlock>

      <h3>Performance Considerations</h3>
      <CodeBlock>
        <code>
{`// Optimizing vector<unique_ptr<T>> performance

class PerformanceAnalysis {
public:
    static void compareStrategies() {
        const size_t N = 1000000;
        
        // Strategy 1: Let vector grow naturally
        {
            auto start = std::chrono::high_resolution_clock::now();
            std::vector<std::unique_ptr<int>> vec1;
            
            for (size_t i = 0; i < N; ++i) {
                vec1.push_back(std::make_unique<int>(i));
            }
            
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
            std::cout << "Natural growth: " << duration.count() << "ms\\n";
        }
        
        // Strategy 2: Reserve capacity upfront
        {
            auto start = std::chrono::high_resolution_clock::now();
            std::vector<std::unique_ptr<int>> vec2;
            vec2.reserve(N);  // <-- Key optimization
            
            for (size_t i = 0; i < N; ++i) {
                vec2.push_back(std::make_unique<int>(i));
            }
            
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
            std::cout << "With reserve: " << duration.count() << "ms\\n";
        }
    }
    
    // Analyze memory fragmentation
    static void analyzeFragmentation() {
        std::vector<std::unique_ptr<LargeObject>> vec;
        
        // Objects are allocated on heap, vector only stores pointers
        // Reallocation only moves pointers, not the objects themselves
        for (int i = 0; i < 100; ++i) {
            vec.push_back(std::make_unique<LargeObject>(i));
            
            if (i % 10 == 0) {
                std::cout << "Capacity: " << vec.capacity() 
                          << ", Objects in heap: " << i + 1 << "\\n";
            }
        }
    }
};`}
        </code>
      </CodeBlock>

      <h3>Best Practices</h3>
      <CodeBlock>
        <code>
{`// Best practices for vector<unique_ptr<T>>

class BestPractices {
public:
    // 1. Use reserve() when size is known
    static auto createOptimizedVector(size_t expectedSize) {
        std::vector<std::unique_ptr<Resource>> vec;
        vec.reserve(expectedSize);  // Prevent reallocations
        return vec;
    }
    
    // 2. Use emplace_back for in-place construction
    static void efficientInsertion() {
        std::vector<std::unique_ptr<Resource>> vec;
        
        // Efficient: constructs unique_ptr in-place
        vec.emplace_back(std::make_unique<Resource>(1));
        
        // Also efficient: move construction
        auto ptr = std::make_unique<Resource>(2);
        vec.push_back(std::move(ptr));
    }
    
    // 3. Consider stable_vector for pointer stability
    template<typename T>
    class stable_vector {
        std::vector<std::unique_ptr<T>> storage_;
        
    public:
        T* push_back(std::unique_ptr<T> ptr) {
            T* raw_ptr = ptr.get();
            storage_.push_back(std::move(ptr));
            return raw_ptr;  // Pointer remains valid even after reallocation
        }
        
        size_t size() const { return storage_.size(); }
        T& operator[](size_t index) { return *storage_[index]; }
    };
    
    // 4. Monitor reallocation frequency in debug builds
    template<typename T>
    class debug_vector : public std::vector<T> {
        mutable size_t reallocation_count_ = 0;
        
    public:
        void push_back(const T& value) {
            size_t old_capacity = this->capacity();
            std::vector<T>::push_back(value);
            
            if (this->capacity() != old_capacity) {
                ++reallocation_count_;
                std::cout << "Reallocation #" << reallocation_count_ 
                          << ", new capacity: " << this->capacity() << "\\n";
            }
        }
        
        size_t reallocation_count() const { return reallocation_count_; }
    };
};`}
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