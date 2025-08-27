import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson53Props {
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

interface CaptureVisualizationProps {
  captureType: 'value' | 'reference' | 'move' | 'weak';
}

function CaptureVisualization({ captureType }: CaptureVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      setAnimationPhase(state.clock.elapsedTime);
    }
  });

  const getCaptureColor = () => {
    switch (captureType) {
      case 'value': return '#4a9eff';
      case 'reference': return '#ff9f40';
      case 'move': return '#50c878';
      case 'weak': return '#ff6b6b';
      default: return '#ffffff';
    }
  };

  const getCaptureDescription = () => {
    switch (captureType) {
      case 'value': return 'Copy Capture\n[=] or [ptr]';
      case 'reference': return 'Reference Capture\n[&] or [&ptr]';
      case 'move': return 'Move Capture\n[ptr = std::move(ptr)]';
      case 'weak': return 'Weak Capture\n[weak = std::weak_ptr]';
      default: return 'Unknown';
    }
  };

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Original object */}
      <group position={[-3, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.5, 1]} />
          <meshStandardMaterial color="#cccccc" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          Original
        </Text>
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Smart Pointer
        </Text>
      </group>
      
      {/* Arrow */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.2, 1, 6]} />
        <meshStandardMaterial color={getCaptureColor()} />
      </mesh>
      
      {/* Lambda capture */}
      <group position={[3, 0, 0]}>
        <mesh>
          <boxGeometry args={[2, 1.5, 1]} />
          <meshStandardMaterial color={getCaptureColor()} transparent opacity={0.7} />
        </mesh>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Lambda
        </Text>
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {getCaptureDescription()}
        </Text>
      </group>
      
      {/* Lifetime indicator */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color={getCaptureColor()}
        anchorX="center"
        anchorY="middle"
      >
        Capture Type: {captureType.toUpperCase()}
      </Text>
      
      {/* Animated connection for reference capture */}
      {captureType === 'reference' && (
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, Math.abs(Math.sin(animationPhase * 2)), 1]}>
          <cylinderGeometry args={[0.05, 0.05, 6]} />
          <meshStandardMaterial color="#ff9f40" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

export default function Lesson53_LambdaCapturesSmartPointers({ onComplete, isCompleted }: Lesson53Props) {
  const [currentCaptureType, setCurrentCaptureType] = useState<'value' | 'reference' | 'move' | 'weak'>('value');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const captureTypes: Array<'value' | 'reference' | 'move' | 'weak'> = ['value', 'reference', 'move', 'weak'];

  const quizQuestions = [
    {
      question: "What happens when a lambda captures a shared_ptr by value [ptr]?",
      options: [
        "The lambda holds a reference to the original shared_ptr",
        "The lambda gets its own copy with incremented reference count",
        "The original shared_ptr becomes invalid",
        "A compilation error occurs"
      ],
      correct: 1,
      explanation: "Capturing by value creates a copy of the shared_ptr, incrementing the reference count and ensuring the object stays alive."
    },
    {
      question: "What's the risk of capturing a shared_ptr by reference [&ptr]?",
      options: [
        "Performance overhead",
        "The lambda may outlive the original shared_ptr variable",
        "The reference count increases unnecessarily",
        "Memory leaks always occur"
      ],
      correct: 1,
      explanation: "If the lambda outlives the scope where the shared_ptr variable exists, the reference becomes invalid, leading to undefined behavior."
    },
    {
      question: "When should you use move capture [ptr = std::move(ptr)] with smart pointers?",
      options: [
        "Always, for better performance",
        "When transferring unique ownership to the lambda",
        "Never, it's always unsafe",
        "Only with shared_ptr"
      ],
      correct: 1,
      explanation: "Move capture is ideal for transferring ownership, especially with unique_ptr, where the lambda takes over ownership."
    },
    {
      question: "What's the benefit of capturing weak_ptr in a lambda?",
      options: [
        "Better performance than shared_ptr",
        "Prevents circular references and allows safe access checking",
        "Automatic memory management",
        "Thread safety"
      ],
      correct: 1,
      explanation: "weak_ptr capture prevents circular references and allows the lambda to check if the object is still alive before accessing it."
    },
    {
      question: "In an asynchronous callback, what's the safest capture method?",
      options: [
        "[&] - capture everything by reference",
        "[=] - capture everything by value",
        "[ptr] - capture shared_ptr by value",
        "[this] - capture the object pointer"
      ],
      correct: 2,
      explanation: "Capturing shared_ptr by value ensures the object remains alive for the duration of the asynchronous operation."
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
      <Title>Lesson 53: Lambda Captures with Smart Pointers</Title>
      
      <Description>
        <h3>Mastering Lifetime Management in Lambda Expressions</h3>
        <p>
          Lambda expressions with smart pointer captures create complex lifetime relationships.
          Understanding the difference between capturing by value, reference, and move semantics
          is crucial for writing safe asynchronous code and avoiding common pitfalls like
          dangling references and circular dependencies.
        </p>
        
        <h4>Key Concepts:</h4>
        <ul>
          <li><strong>Value capture:</strong> [ptr] - Creates copy, extends lifetime</li>
          <li><strong>Reference capture:</strong> [&ptr] - Risk of dangling references</li>
          <li><strong>Move capture:</strong> [ptr = std::move(ptr)] - Transfer ownership</li>
          <li><strong>Weak capture:</strong> [weak] - Break cycles, safe access</li>
        </ul>
      </Description>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <CaptureVisualization captureType={currentCaptureType} />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </VisualizationContainer>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        {captureTypes.map(type => (
          <button
            key={type}
            onClick={() => setCurrentCaptureType(type)}
            style={{
              padding: '10px 15px',
              background: currentCaptureType === type ? '#4a9eff' : 'rgba(74, 158, 255, 0.3)',
              color: 'white',
              border: '1px solid rgba(74, 158, 255, 0.5)',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Capture
          </button>
        ))}
      </div>

      <h3>Basic Capture Patterns</h3>
      <CodeBlock>
        <code>
{`#include <memory>
#include <functional>
#include <iostream>
#include <thread>
#include <future>

class Resource {
public:
    Resource(int id) : id_(id) {
        std::cout << "Resource " << id_ << " created\\n";
    }
    
    ~Resource() {
        std::cout << "Resource " << id_ << " destroyed\\n";
    }
    
    void process() {
        std::cout << "Processing resource " << id_ << "\\n";
    }
    
    int getId() const { return id_; }

private:
    int id_;
};

void demonstrateBasicCaptures() {
    auto resource = std::make_shared<Resource>(1);
    
    // 1. Capture by value - safe for async operations
    auto lambdaByValue = [resource]() {
        resource->process();  // resource is copied, reference count increased
    };
    
    // 2. Capture by reference - potentially dangerous
    auto lambdaByReference = [&resource]() {
        if (resource) {  // resource might be invalid if original goes out of scope
            resource->process();
        }
    };
    
    // 3. Move capture - transfer ownership
    auto resource2 = std::make_shared<Resource>(2);
    auto lambdaMove = [captured = std::move(resource2)]() {
        captured->process();  // lambda now owns the resource
    };
    // resource2 is now null
    
    // 4. Weak pointer capture - safe circular reference breaking
    std::weak_ptr<Resource> weak_resource = resource;
    auto lambdaWeak = [weak_resource]() {
        if (auto shared = weak_resource.lock()) {
            shared->process();  // Safe access after checking validity
        } else {
            std::cout << "Resource no longer available\\n";
        }
    };
    
    // Execute lambdas
    std::cout << "\\n=== Executing lambdas ===\\n";
    lambdaByValue();
    lambdaByReference();
    lambdaMove();
    lambdaWeak();
    
    std::cout << "Reference count: " << resource.use_count() << "\\n";
}`}
        </code>
      </CodeBlock>

      <h3>Asynchronous Operations and Lifetime Management</h3>
      <CodeBlock>
        <code>
{`// Safe patterns for asynchronous operations
class AsyncProcessor {
private:
    std::shared_ptr<Resource> resource_;
    std::vector<std::future<void>> futures_;

public:
    AsyncProcessor() : resource_(std::make_shared<Resource>(42)) {}
    
    // SAFE: Capture shared_ptr by value
    void processAsync() {
        futures_.push_back(std::async(std::launch::async, [resource = resource_]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
            resource->process();  // Safe: resource is kept alive by lambda
        }));
    }
    
    // DANGEROUS: Capture by reference
    void processAsyncDangerous() {
        auto& ref = resource_;  // Local reference
        futures_.push_back(std::async(std::launch::async, [&ref]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
            if (ref) {  // ref might be dangling if AsyncProcessor is destroyed
                ref->process();
            }
        }));
    }
    
    // SAFE: Using weak_ptr for callbacks
    void setupCallback(std::function<void(std::weak_ptr<Resource>)> callback) {
        std::weak_ptr<Resource> weak_ref = resource_;
        
        // Callback lambda captures weak_ptr
        futures_.push_back(std::async(std::launch::async, [callback, weak_ref]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            callback(weak_ref);  // Callback can safely check if resource exists
        }));
    }
    
    // EFFICIENT: Move unique resources into async operations
    static void processUniqueAsync(std::unique_ptr<Resource> resource) {
        auto future = std::async(std::launch::async, [resource = std::move(resource)]() mutable {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
            resource->process();
            // resource is destroyed when lambda completes
        });
        
        // Original unique_ptr is now empty
        future.wait();
    }
    
    void waitAll() {
        for (auto& future : futures_) {
            future.wait();
        }
        futures_.clear();
    }
};

void demonstrateAsyncSafety() {
    {
        AsyncProcessor processor;
        
        // Safe async processing
        processor.processAsync();
        
        // Setup callback with weak_ptr
        processor.setupCallback([](std::weak_ptr<Resource> weak) {
            if (auto resource = weak.lock()) {
                std::cout << "Callback: Resource " << resource->getId() << " is alive\\n";
            } else {
                std::cout << "Callback: Resource is gone\\n";
            }
        });
        
        processor.waitAll();
    } // processor destroyed here, but async operations are safe
    
    // Demonstrate unique_ptr move
    auto unique_resource = std::make_unique<Resource>(99);
    AsyncProcessor::processUniqueAsync(std::move(unique_resource));
    // unique_resource is now null
}`}
        </code>
      </CodeBlock>

      <h3>Circular Reference Prevention</h3>
      <CodeBlock>
        <code>
{`// Preventing circular references with lambda captures
class Observer {
public:
    Observer(int id) : id_(id) {}
    virtual ~Observer() {
        std::cout << "Observer " << id_ << " destroyed\\n";
    }
    
    void notify(const std::string& message) {
        std::cout << "Observer " << id_ << " received: " << message << "\\n";
    }
    
private:
    int id_;
};

class Subject {
private:
    std::vector<std::weak_ptr<Observer>> observers_;  // Use weak_ptr to prevent cycles
    std::string name_;
    
public:
    Subject(const std::string& name) : name_(name) {}
    
    ~Subject() {
        std::cout << "Subject " << name_ << " destroyed\\n";
    }
    
    void addObserver(std::weak_ptr<Observer> observer) {
        observers_.push_back(observer);
    }
    
    void notifyAll(const std::string& message) {
        // Clean up expired weak_ptrs while notifying
        observers_.erase(
            std::remove_if(observers_.begin(), observers_.end(),
                [&message](const std::weak_ptr<Observer>& weak) {
                    if (auto observer = weak.lock()) {
                        observer->notify(message);
                        return false;  // Keep this observer
                    }
                    return true;  // Remove expired observer
                }), 
            observers_.end()
        );
        
        std::cout << "Active observers: " << observers_.size() << "\\n";
    }
    
    // WRONG: This would create circular references
    void addObserverDangerous(std::shared_ptr<Observer> observer) {
        // Don't do this - creates potential cycles
        // observers_shared_.push_back(observer);
    }
};

// Event system with proper lambda captures
class EventSystem {
private:
    std::shared_ptr<Subject> subject_;
    std::vector<std::shared_ptr<Observer>> observers_;
    
public:
    EventSystem() : subject_(std::make_shared<Subject>("EventSystem")) {}
    
    void addObserver() {
        auto observer = std::make_shared<Observer>(observers_.size() + 1);
        observers_.push_back(observer);
        
        // SAFE: Use weak_ptr to avoid circular reference
        subject_->addObserver(observer);
        
        // Setup cleanup lambda with weak capture
        std::weak_ptr<Observer> weak_observer = observer;
        auto cleanup = [weak_observer]() {
            if (auto obs = weak_observer.lock()) {
                std::cout << "Cleanup lambda can still access observer\\n";
            } else {
                std::cout << "Observer already destroyed in cleanup\\n";
            }
        };
        
        // Simulate some async cleanup operation
        std::thread([cleanup]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
            cleanup();
        }).detach();
    }
    
    void removeObserver(size_t index) {
        if (index < observers_.size()) {
            // Observer will be destroyed when removed from vector
            // Subject's weak_ptr will automatically detect this
            observers_.erase(observers_.begin() + index);
        }
    }
    
    void broadcastMessage(const std::string& message) {
        subject_->notifyAll(message);
    }
    
    void demonstrateLifetimes() {
        addObserver();
        addObserver();
        addObserver();
        
        broadcastMessage("Hello observers!");
        
        // Remove middle observer
        removeObserver(1);
        std::this_thread::sleep_for(std::chrono::milliseconds(20));
        
        broadcastMessage("Some observers removed!");
        
        // Clear all observers
        observers_.clear();
        std::this_thread::sleep_for(std::chrono::milliseconds(20));
        
        broadcastMessage("All observers should be gone!");
    }
};`}
        </code>
      </CodeBlock>

      <h3>Advanced Capture Techniques</h3>
      <CodeBlock>
        <code>
{`// Advanced lambda capture patterns with smart pointers
class AdvancedCapturePatterns {
public:
    // 1. Selective capture with smart pointers
    static auto createProcessor(std::shared_ptr<Resource> resource, 
                               const std::string& config) {
        return [resource, config = std::move(config)](int input) mutable {
            // resource is shared, config is moved
            resource->process();
            std::cout << "Config: " << config << ", Input: " << input << "\\n";
            config += "_processed";  // Can modify moved config
        };
    }
    
    // 2. Conditional capture based on smart pointer type
    template<typename SmartPtr>
    static auto createConditionalLambda(SmartPtr ptr) {
        if constexpr (std::is_same_v<SmartPtr, std::unique_ptr<Resource>>) {
            // Move capture for unique_ptr
            return [ptr = std::move(ptr)]() mutable {
                if (ptr) {
                    ptr->process();
                    ptr.reset();  // Explicitly release
                }
            };
        } else if constexpr (std::is_same_v<SmartPtr, std::shared_ptr<Resource>>) {
            // Value capture for shared_ptr
            return [ptr]() {
                if (ptr) {
                    ptr->process();
                }
            };
        } else {
            // Fallback for raw pointers (not recommended)
            return [ptr]() {
                if (ptr) {
                    // Dangerous: no lifetime management
                    // ptr->process();
                }
            };
        }
    }
    
    // 3. Generic capture with perfect forwarding
    template<typename T>
    static auto createGenericCapture(T&& resource) {
        return [captured = std::forward<T>(resource)]() mutable {
            if constexpr (requires { captured->process(); }) {
                captured->process();
            }
        };
    }
    
    // 4. Capture with custom deleter preservation
    static void demonstrateCustomDeleterCapture() {
        auto custom_deleter = [](Resource* r) {
            std::cout << "Custom deleter called for resource " << r->getId() << "\\n";
            delete r;
        };
        
        std::unique_ptr<Resource, decltype(custom_deleter)> resource(
            new Resource(100), custom_deleter
        );
        
        // Lambda captures the deleter too
        auto lambda = [resource = std::move(resource)]() mutable {
            if (resource) {
                resource->process();
                resource.reset();  // Custom deleter will be called
            }
        };
        
        lambda();
    }
    
    // 5. Thread-safe capture patterns
    class ThreadSafeCapture {
    private:
        std::shared_ptr<Resource> resource_;
        std::mutex mutex_;
        
    public:
        ThreadSafeCapture(std::shared_ptr<Resource> res) : resource_(std::move(res)) {}
        
        auto createThreadSafeLambda() {
            // Capture both the resource and a weak reference to this
            std::weak_ptr<ThreadSafeCapture> weak_self = 
                std::static_pointer_cast<ThreadSafeCapture>(shared_from_this());
            
            return [resource = resource_, weak_self](int delay_ms) {
                std::this_thread::sleep_for(std::chrono::milliseconds(delay_ms));
                
                if (auto self = weak_self.lock()) {
                    std::lock_guard<std::mutex> lock(self->mutex_);
                    if (resource) {
                        resource->process();
                    }
                }
            };
        }
        
        // This would be part of enable_shared_from_this in real code
        std::shared_ptr<ThreadSafeCapture> shared_from_this() {
            // Simplified for demonstration
            return std::shared_ptr<ThreadSafeCapture>(this, [](ThreadSafeCapture*){});
        }
    };
};

// Performance comparison of different capture methods
void performanceComparison() {
    const int iterations = 1000000;
    auto resource = std::make_shared<Resource>(1);
    
    // Measure value capture overhead
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < iterations; ++i) {
        auto lambda = [resource]() { /* capture by value */ };
        lambda();
    }
    auto value_time = std::chrono::high_resolution_clock::now() - start;
    
    // Measure reference capture (when safe)
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < iterations; ++i) {
        auto lambda = [&resource]() { /* capture by reference */ };
        lambda();
    }
    auto ref_time = std::chrono::high_resolution_clock::now() - start;
    
    std::cout << "Value capture time: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(value_time).count() 
              << " microseconds\\n";
    std::cout << "Reference capture time: " 
              << std::chrono::duration_cast<std::chrono::microseconds>(ref_time).count() 
              << " microseconds\\n";
}`}
        </code>
      </CodeBlock>

      <h3>Common Pitfalls and Solutions</h3>
      <CodeBlock>
        <code>
{`// Common mistakes and how to avoid them
class CommonPitfalls {
public:
    // PITFALL 1: Capturing 'this' when using shared_from_this
    class BadSelfCapture : public std::enable_shared_from_this<BadSelfCapture> {
    private:
        std::string data_;
        
    public:
        BadSelfCapture(const std::string& data) : data_(data) {}
        
        // BAD: Capturing 'this' directly
        <span class="danger">void setupCallbackBad() {
            std::thread([this]() {  // Dangerous: 'this' might be invalid
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                std::cout << data_ << "\\n";  // Might access destroyed object
            }).detach();
        }</span>
        
        // GOOD: Capturing shared_ptr to self
        <span class="safe">void setupCallbackGood() {
            auto self = shared_from_this();
            std::thread([self]() {  // Safe: keeps object alive
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                std::cout << self->data_ << "\\n";
            }).detach();
        }</span>
    };
    
    // PITFALL 2: Capturing expired weak_ptr without checking
    static void demonstrateWeakPtrPitfall() {
        std::weak_ptr<Resource> weak_resource;
        
        {
            auto resource = std::make_shared<Resource>(1);
            weak_resource = resource;
            
            // BAD: Not checking if weak_ptr is still valid
            <span class="danger">auto badLambda = [weak_resource]() {
                auto shared = weak_resource.lock();
                shared->process();  // Potential null pointer dereference!
            };</span>
            
            // GOOD: Always check before using
            <span class="safe">auto goodLambda = [weak_resource]() {
                if (auto shared = weak_resource.lock()) {
                    shared->process();  // Safe access
                } else {
                    std::cout << "Resource no longer available\\n";
                }
            };</span>
        } // resource destroyed here
        
        // Execute lambdas after resource is destroyed
        // badLambda();  // Would crash
        // goodLambda();  // Safe
    }
    
    // PITFALL 3: Capturing unique_ptr by value instead of move
    static void demonstrateUniquePtrCapture() {
        auto resource = std::make_unique<Resource>(1);
        
        // BAD: Trying to capture unique_ptr by value (won't compile)
        // auto badLambda = [resource]() { resource->process(); };
        
        // GOOD: Move capture
        <span class="safe">auto goodLambda = [resource = std::move(resource)]() mutable {
            if (resource) {
                resource->process();
                // Can transfer ownership further if needed
            }
        };</span>
    }
    
    // PITFALL 4: Mixing capture modes incorrectly
    static void demonstrateMixedCaptures() {
        auto shared_res = std::make_shared<Resource>(1);
        auto unique_res = std::make_unique<Resource>(2);
        int value = 42;
        
        // BAD: Inconsistent lifetime management
        <span class="danger">// auto badLambda = [&shared_res, &unique_res, value]() {
        //     // shared_res and unique_res captured by reference - dangerous!
        //     shared_res->process();
        //     unique_res->process();
        // };</span>
        
        // GOOD: Consistent and safe capture strategy
        <span class="safe">auto goodLambda = [shared_res,                    // Copy shared_ptr
                           unique_res = std::move(unique_res), // Move unique_ptr
                           value]() mutable {                  // Copy primitive
            if (shared_res) shared_res->process();
            if (unique_res) unique_res->process();
            std::cout << "Value: " << value << "\\n";
        };</span>
    }
    
    // SOLUTION: Capture guidelines
    static void captureGuidelines() {
        std::cout << "\\n=== Lambda Capture Guidelines ===\\n";
        std::cout << "1. shared_ptr: Capture by value [ptr] for async operations\\n";
        std::cout << "2. unique_ptr: Use move capture [ptr = std::move(ptr)]\\n";
        std::cout << "3. weak_ptr: Always check lock() before accessing\\n";
        std::cout << "4. 'this': Use shared_from_this() instead of raw 'this'\\n";
        std::cout << "5. References: Only safe within same scope lifetime\\n";
        std::cout << "6. Values: Copy capture [=] or explicit [var] for safety\\n";
    }
};`}
        </code>
      </CodeBlock>

      <QuizContainer>
        <h3>Test Your Lambda Capture Knowledge</h3>
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