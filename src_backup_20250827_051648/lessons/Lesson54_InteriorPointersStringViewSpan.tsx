import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson54Props {
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

interface ViewVisualizationProps {
  viewType: 'string_view' | 'span' | 'dangling';
}

function ViewVisualization({ viewType }: ViewVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      setAnimationPhase(state.clock.elapsedTime);
    }
  });

  const getViewColor = () => {
    switch (viewType) {
      case 'string_view': return '#4a9eff';
      case 'span': return '#50c878';
      case 'dangling': return '#ff6b6b';
      default: return '#ffffff';
    }
  };

  const renderDataContainer = () => {
    const isValid = viewType !== 'dangling';
    
    return (
      <group position={[-3, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 1, 1]} />
          <meshStandardMaterial 
            color={isValid ? '#cccccc' : '#666666'} 
            transparent 
            opacity={isValid ? 0.8 : 0.3} 
          />
        </mesh>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.25}
          color={isValid ? 'black' : 'red'}
          anchorX="center"
          anchorY="middle"
        >
          {isValid ? 'Original Data' : 'Destroyed'}
        </Text>
        
        {/* Data elements */}
        {isValid && (
          <group>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={i} position={[(i - 2) * 0.4, -0.6, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color="#4a9eff" />
              </mesh>
            ))}
          </group>
        )}
      </group>
    );
  };

  const renderViewPointer = () => {
    const color = getViewColor();
    
    return (
      <group position={[2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1, 1]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} />
        </mesh>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {viewType === 'string_view' ? 'string_view' : 
           viewType === 'span' ? 'span' : 'dangling view'}
        </Text>
        
        {/* View window */}
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[1.2, 0.4, 0.2]} />
          <meshStandardMaterial 
            color={viewType === 'dangling' ? '#ff0000' : '#ffffff'} 
            transparent 
            opacity={0.3} 
          />
        </mesh>
      </group>
    );
  };

  const renderConnection = () => {
    if (viewType === 'dangling') {
      // Broken connection
      return (
        <group>
          <mesh position={[-0.5, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.05, 0.05, 1]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
          <mesh position={[0.5, -0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.05, 0.05, 1]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
          <Text
            position={[0, 0, 0.8]}
            fontSize={0.2}
            color="#ff0000"
            anchorX="center"
            anchorY="middle"
          >
            DANGLING!
          </Text>
        </group>
      );
    } else {
      // Valid connection
      const pulseScale = 1 + 0.2 * Math.sin(animationPhase * 3);
      return (
        <mesh position={[0, 0, 0]} scale={[pulseScale, 1, 1]}>
          <cylinderGeometry args={[0.05, 0.05, 4]} />
          <meshStandardMaterial color={getViewColor()} transparent opacity={0.6} />
        </mesh>
      );
    }
  };

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {renderDataContainer()}
      {renderConnection()}
      {renderViewPointer()}
      
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color={getViewColor()}
        anchorX="center"
        anchorY="middle"
      >
        View Type: {viewType.toUpperCase()}
      </Text>
    </group>
  );
}

export default function Lesson54_InteriorPointersStringViewSpan({ onComplete, isCompleted }: Lesson54Props) {
  const [currentViewType, setCurrentViewType] = useState<'string_view' | 'span' | 'dangling'>('string_view');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const viewTypes: Array<'string_view' | 'span' | 'dangling'> = ['string_view', 'span', 'dangling'];

  const quizQuestions = [
    {
      question: "What is the primary risk of using std::string_view?",
      options: [
        "Performance overhead",
        "The viewed string may be destroyed while the view is still in use",
        "It can only view string literals",
        "It modifies the original string"
      ],
      correct: 1,
      explanation: "string_view is a non-owning view, so the original string must outlive the view to avoid dangling pointer access."
    },
    {
      question: "When is it safe to return std::string_view from a function?",
      options: [
        "Always safe",
        "When viewing a string literal or static string",
        "Never safe",
        "Only when viewing temporary strings"
      ],
      correct: 1,
      explanation: "It's safe to return string_view when it points to data with static storage duration or when the caller guarantees the source outlives the view."
    },
    {
      question: "What happens when std::span views elements that get reallocated?",
      options: [
        "span automatically updates to the new location",
        "Compilation error occurs",
        "span becomes dangling and accessing it is undefined behavior",
        "span becomes read-only"
      ],
      correct: 2,
      explanation: "span doesn't track ownership, so if the underlying container reallocates, the span becomes dangling."
    },
    {
      question: "Which is the safest way to pass a substring to a function?",
      options: [
        "std::string substr() for temporary use",
        "std::string_view for read-only access when source outlives call",
        "const char* with manual bounds",
        "All are equally safe"
      ],
      correct: 1,
      explanation: "string_view is safest when you can guarantee the source string outlives the function call and you only need read-only access."
    },
    {
      question: "What's the key difference between interior pointers and owning pointers?",
      options: [
        "Interior pointers are faster",
        "Interior pointers don't manage lifetime, only provide access",
        "Interior pointers can only point to stack objects",
        "There is no difference"
      ],
      correct: 1,
      explanation: "Interior pointers (views) provide access to data but don't manage its lifetime - the original owner must ensure validity."
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
      <Title>Lesson 54: Interior Pointers with string_view and span</Title>
      
      <Description>
        <h3>Non-Owning Views and Lifetime Dependencies</h3>
        <p>
          Interior pointers and view types like <code>std::string_view</code> and <code>std::span</code>
          provide efficient, non-owning access to data. However, they create lifetime dependencies
          that can lead to dangling pointer bugs if not handled carefully. This lesson explores
          safe usage patterns and common pitfalls.
        </p>
        
        <h4>Key Concepts:</h4>
        <ul>
          <li><strong>Non-owning views:</strong> Access without ownership responsibility</li>
          <li><strong>Lifetime dependencies:</strong> Views must not outlive their sources</li>
          <li><strong>Dangling detection:</strong> Identifying when views become invalid</li>
          <li><strong>Safe patterns:</strong> Guidelines for robust view usage</li>
        </ul>
      </Description>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <ViewVisualization viewType={currentViewType} />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </VisualizationContainer>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        {viewTypes.map(type => (
          <button
            key={type}
            onClick={() => setCurrentViewType(type)}
            style={{
              padding: '10px 15px',
              background: currentViewType === type ? '#4a9eff' : 'rgba(74, 158, 255, 0.3)',
              color: 'white',
              border: '1px solid rgba(74, 158, 255, 0.5)',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {type.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <h3>Understanding string_view</h3>
      <CodeBlock>
        <code>
{`#include <string_view>
#include <string>
#include <iostream>
#include <vector>

// string_view basics and lifetime management
void demonstrateStringView() {
    // Safe usage - string literal has static storage duration
    <span class="safe">std::string_view literal_view = "Hello, World!";</span>  // Safe: string literal
    std::cout << literal_view << "\\n";
    
    // Safe usage - local string outlives view
    std::string local_string = "Local string";
    <span class="safe">std::string_view local_view = local_string;</span>        // Safe: same scope
    std::cout << local_view << "\\n";
    
    // Dangerous usage - temporary string
    <span class="danger">std::string_view temp_view = std::string("Temporary");</span>  // DANGEROUS!
    // The temporary string is destroyed immediately
    // Accessing temp_view is undefined behavior
    
    // Safe substring operations
    std::string original = "Hello, C++ World!";
    <span class="safe">std::string_view sub_view = original.substr(7, 3);</span>  // WRONG! substr() returns string
    <span class="safe">std::string_view correct_view = std::string_view(original).substr(7, 3);</span>  // Correct
    std::cout << correct_view << "\\n";  // Prints "C++"
    
    // Demonstrating the efficiency
    auto process_string_copy = [](const std::string& s) {
        // Creates a copy - expensive for large strings
        return s.length();
    };
    
    auto process_string_view = [](std::string_view sv) {
        // No copy - just pointer and length
        return sv.length();
    };
    
    std::string large_string(10000, 'A');
    
    // Both calls process the same data, but string_view avoids copying
    std::cout << "Copy version: " << process_string_copy(large_string) << "\\n";
    std::cout << "View version: " << process_string_view(large_string) << "\\n";
}

// Common string_view pitfalls
class StringViewPitfalls {
public:
    // PITFALL 1: Returning string_view to temporary
    <span class="danger">std::string_view getBadView() {
        std::string temp = "temporary";
        return temp;  // DANGER: returns view to local variable
    }</span>
    
    // SAFE: Return by value for temporary data
    <span class="safe">std::string getGoodString() {
        std::string temp = "temporary";
        return temp;  // Safe: returns copy/move
    }</span>
    
    // SAFE: Return string_view to static/global data
    <span class="safe">std::string_view getStaticView() {
        static const std::string static_str = "static string";
        return static_str;  // Safe: static storage duration
    }</span>
    
    // PITFALL 2: Storing string_view as member variable
    class BadClass {
        <span class="danger">std::string_view member_view_;  // DANGEROUS as member</span>
        
    public:
        BadClass(const std::string& s) : member_view_(s) {}
        // If the string 's' is destroyed, member_view_ becomes dangling
    };
    
    class GoodClass {
        std::string member_string_;  // Safe: owns the data
        
    public:
        GoodClass(const std::string& s) : member_string_(s) {}
        
        std::string_view getView() const {
            return member_string_;  // Safe: returns view to owned data
        }
    };
    
    // PITFALL 3: string_view with string concatenation
    static void demonstrateConcatenationPitfall() {
        std::string base = "Hello, ";
        
        // WRONG: Creating temporary for concatenation
        <span class="danger">std::string_view bad_view = base + "World!";</span>  // Temporary destroyed!
        
        // CORRECT: Store the result first
        <span class="safe">std::string result = base + "World!";
        std::string_view good_view = result;</span>  // Safe within scope
        
        std::cout << good_view << "\\n";
    }
};`}
        </code>
      </CodeBlock>

      <h3>Working with std::span</h3>
      <CodeBlock>
        <code>
{`#include <span>
#include <vector>
#include <array>
#include <memory>

// std::span for safe array access
void demonstrateSpan() {
    // Safe span usage with various containers
    std::vector<int> vec = {1, 2, 3, 4, 5};
    std::array<int, 5> arr = {6, 7, 8, 9, 10};
    int raw_array[] = {11, 12, 13, 14, 15};
    
    // Creating spans - all safe as long as containers exist
    <span class="safe">std::span<int> vec_span = vec;</span>
    <span class="safe">std::span<int> arr_span = arr;</span>
    <span class="safe">std::span<int> raw_span = raw_array;</span>
    
    // Subspan operations
    <span class="safe">std::span<int> sub_span = vec_span.subspan(1, 3);</span>  // Elements 2, 3, 4
    
    auto print_span = [](std::span<const int> s) {
        for (int value : s) {
            std::cout << value << " ";
        }
        std::cout << "\\n";
    };
    
    print_span(vec_span);
    print_span(arr_span);
    print_span(raw_span);
    print_span(sub_span);
}

// Dangerous span patterns
class SpanPitfalls {
public:
    // PITFALL 1: Span outliving container due to reallocation
    static std::span<int> getDangerousSpan() {
        std::vector<int> vec = {1, 2, 3};
        <span class="danger">std::span<int> span = vec;</span>
        
        // Force reallocation
        vec.reserve(1000);  // vec data might move!
        
        <span class="danger">return span;</span>  // DANGER: might point to old location
    }
    
    // PITFALL 2: Span of temporary container
    static void demonstrateTemporarySpan() {
        // Creating span from temporary vector
        <span class="danger">auto span = std::span<int>(std::vector<int>{1, 2, 3});</span>  // DANGER!
        // The temporary vector is destroyed, span becomes dangling
        
        // Safe alternative
        <span class="safe">std::vector<int> vec{1, 2, 3};
        auto safe_span = std::span<int>(vec);</span>  // Safe within scope
    }
    
    // PITFALL 3: Modifying through const span incorrectly
    static void demonstrateConstSpan() {
        std::vector<int> vec = {1, 2, 3, 4, 5};
        
        // const span of non-const data - still can't modify through span
        std::span<const int> const_span = vec;
        // const_span[0] = 10;  // Compilation error - good!
        
        // But original data can still be modified
        vec[0] = 10;  // This works
        std::cout << const_span[0] << "\\n";  // Prints 10
        
        // span of const data
        const std::vector<int> const_vec = {1, 2, 3};
        std::span<const int> span_of_const = const_vec;  // Only way to create span
    }
    
    // Safe patterns for long-lived spans
    class SpanManager {
        std::vector<int> data_;
        std::span<int> span_;
        
    public:
        SpanManager(std::vector<int> initial_data) 
            : data_(std::move(initial_data)), span_(data_) {}
        
        // Safe: span always refers to owned data
        std::span<const int> getReadOnlySpan() const {
            return span_;
        }
        
        // Careful: must update span after modifications that might reallocate
        void addData(int value) {
            size_t old_capacity = data_.capacity();
            data_.push_back(value);
            
            // Update span if reallocation occurred
            if (data_.capacity() != old_capacity) {
                span_ = data_;  // Update span to new location
            }
        }
        
        void processWithSpan() {
            // Safe to use span_ here since we control data_ lifetime
            for (int& value : span_) {
                value *= 2;
            }
        }
    };
};

// Performance and safety analysis
class PerformanceAnalysis {
public:
    // Compare different ways of passing array data
    static void comparePassing() {
        std::vector<int> large_data(10000);
        std::iota(large_data.begin(), large_data.end(), 1);
        
        // Method 1: Pass by const reference (safe, no copy)
        auto process_by_ref = [](const std::vector<int>& data) {
            return std::accumulate(data.begin(), data.end(), 0LL);
        };
        
        // Method 2: Pass by span (safe, more generic)
        auto process_by_span = [](std::span<const int> data) {
            return std::accumulate(data.begin(), data.end(), 0LL);
        };
        
        // Method 3: Pass raw pointer and size (unsafe, but fast)
        auto process_by_raw = [](const int* data, size_t size) {
            return std::accumulate(data, data + size, 0LL);
        };
        
        // Benchmark
        auto start = std::chrono::high_resolution_clock::now();
        
        for (int i = 0; i < 1000; ++i) {
            volatile auto result1 = process_by_ref(large_data);
        }
        auto ref_time = std::chrono::high_resolution_clock::now() - start;
        
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < 1000; ++i) {
            volatile auto result2 = process_by_span(large_data);
        }
        auto span_time = std::chrono::high_resolution_clock::now() - start;
        
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < 1000; ++i) {
            volatile auto result3 = process_by_raw(large_data.data(), large_data.size());
        }
        auto raw_time = std::chrono::high_resolution_clock::now() - start;
        
        std::cout << "Reference method: " << ref_time.count() << " ns\\n";
        std::cout << "Span method: " << span_time.count() << " ns\\n";
        std::cout << "Raw pointer method: " << raw_time.count() << " ns\\n";
    }
};`}
        </code>
      </CodeBlock>

      <h3>Safe Patterns and Best Practices</h3>
      <CodeBlock>
        <code>
{`// Best practices for using views safely
class SafeViewPatterns {
public:
    // Pattern 1: Function parameters - safe for temporary use
    static void processText(std::string_view text) {
        // Safe: text parameter lifetime is guaranteed by caller
        std::cout << "Processing: " << text.substr(0, 10) << "...\\n";
        
        // Safe operations within function scope
        for (char c : text) {
            if (c == ' ') std::cout << "_";
            else std::cout << c;
        }
        std::cout << "\\n";
    }
    
    // Pattern 2: Immediate use - no storage
    static void demonstrateImmediateUse() {
        std::string data = "Hello, immediate use!";
        
        // Safe: immediate consumption
        <span class="safe">processText(data);
        processText(data.substr(0, 5));  // Safe: temporary but immediately consumed</span>
    }
    
    // Pattern 3: RAII wrapper for safe lifetime management
    class SafeStringView {
        std::string owned_string_;
        std::string_view view_;
        
    public:
        // Constructor ensures ownership
        SafeStringView(std::string s) 
            : owned_string_(std::move(s)), view_(owned_string_) {}
        
        // Safe to return view - it references owned data
        std::string_view view() const { return view_; }
        
        // Prevent copying to avoid confusion
        SafeStringView(const SafeStringView&) = delete;
        SafeStringView& operator=(const SafeStringView&) = delete;
        
        // Allow moving
        SafeStringView(SafeStringView&& other) noexcept
            : owned_string_(std::move(other.owned_string_)) {
            view_ = owned_string_;  // Update view to new location
        }
    };
    
    // Pattern 4: Conditional ownership
    class FlexibleStringHolder {
        std::string owned_storage_;
        std::string_view view_;
        bool owns_data_;
        
    public:
        // Constructor for owned data
        FlexibleStringHolder(std::string owned) 
            : owned_storage_(std::move(owned))
            , view_(owned_storage_)
            , owns_data_(true) {}
        
        // Constructor for borrowed data
        FlexibleStringHolder(std::string_view borrowed) 
            : view_(borrowed)
            , owns_data_(false) {}
        
        std::string_view view() const { return view_; }
        bool owns_data() const { return owns_data_; }
        
        // Safe string access
        const std::string& as_string() const {
            if (owns_data_) {
                return owned_storage_;
            } else {
                throw std::runtime_error("Cannot convert borrowed view to string reference");
            }
        }
    };
    
    // Pattern 5: Lifetime binding
    template<typename Container>
    class BoundView {
        Container container_;  // Own the container
        std::span<const typename Container::value_type> span_;
        
    public:
        BoundView(Container container) 
            : container_(std::move(container))
            , span_(container_) {}
        
        // Safe: span is bound to owned container
        std::span<const typename Container::value_type> span() const {
            return span_;
        }
        
        size_t size() const { return span_.size(); }
        auto begin() const { return span_.begin(); }
        auto end() const { return span_.end(); }
    };
    
    // Usage examples
    static void demonstrateSafePatterns() {
        // Safe immediate use
        processText("String literal");  // Safe: static storage
        
        std::string owned = "Owned string";
        processText(owned);  // Safe: owned outlives call
        
        // Safe RAII wrapper
        SafeStringView safe_wrapper("Wrapped string");
        processText(safe_wrapper.view());  // Safe: wrapper owns data
        
        // Safe conditional ownership
        FlexibleStringHolder holder1(std::string("Owned by holder"));
        FlexibleStringHolder holder2(std::string_view("Borrowed view"));
        
        processText(holder1.view());  // Safe: holder owns data
        // Be careful with holder2 - ensure source outlives holder2
        
        // Safe bound container
        BoundView<std::vector<int>> bound_vec(std::vector<int>{1, 2, 3, 4, 5});
        auto process_ints = [](std::span<const int> data) {
            for (int i : data) std::cout << i << " ";
            std::cout << "\\n";
        };
        process_ints(bound_vec.span());  // Safe: bound_vec owns the data
    }
};

// Debugging and detection tools
class LifetimeDebugging {
public:
    // Debug wrapper that tracks view lifetime
    template<typename ViewType>
    class DebugView {
        ViewType view_;
        std::shared_ptr<bool> validity_flag_;
        
    public:
        template<typename Container>
        DebugView(Container&& container, std::shared_ptr<bool> flag)
            : view_(std::forward<Container>(container))
            , validity_flag_(flag) {}
        
        // Access with validity check
        auto operator[](size_t index) const {
            if (!validity_flag_ || !*validity_flag_) {
                throw std::runtime_error("Accessing dangling view!");
            }
            return view_[index];
        }
        
        auto size() const {
            if (!validity_flag_ || !*validity_flag_) {
                throw std::runtime_error("Accessing dangling view!");
            }
            return view_.size();
        }
        
        // Invalidate the view
        void invalidate() {
            if (validity_flag_) {
                *validity_flag_ = false;
            }
        }
    };
    
    // Helper to create debug views
    template<typename Container>
    static auto make_debug_view(Container&& container) {
        auto flag = std::make_shared<bool>(true);
        return std::make_pair(
            DebugView<std::decay_t<decltype(std::span{container})>>(
                std::span{container}, flag),
            flag
        );
    }
    
    static void demonstrateDebugging() {
        auto [debug_view, validity_flag] = make_debug_view(std::vector<int>{1, 2, 3});
        
        std::cout << "View size: " << debug_view.size() << "\\n";  // OK
        
        // Simulate container destruction
        *validity_flag = false;
        
        try {
            std::cout << debug_view[0] << "\\n";  // Throws exception
        } catch (const std::exception& e) {
            std::cout << "Caught: " << e.what() << "\\n";
        }
    }
};`}
        </code>
      </CodeBlock>

      <h3>Real-World Example: Text Processing Pipeline</h3>
      <CodeBlock>
        <code>
{`// Real-world example: Safe text processing with views
class TextProcessor {
public:
    // Safe: Process text without copying
    static std::vector<std::string_view> tokenize(std::string_view text) {
        std::vector<std::string_view> tokens;
        size_t start = 0;
        
        while (start < text.size()) {
            // Skip whitespace
            while (start < text.size() && std::isspace(text[start])) {
                ++start;
            }
            
            if (start >= text.size()) break;
            
            // Find end of token
            size_t end = start;
            while (end < text.size() && !std::isspace(text[end])) {
                ++end;
            }
            
            // Create view to token - safe because text outlives tokens
            tokens.push_back(text.substr(start, end - start));
            start = end;
        }
        
        return tokens;
    }
    
    // Safe pipeline: each stage preserves lifetime requirements
    class ProcessingPipeline {
        std::string original_text_;  // Own the source data
        std::vector<std::string_view> tokens_;
        
    public:
        ProcessingPipeline(std::string text) : original_text_(std::move(text)) {
            // Safe: tokens_ will view original_text_ which we own
            tokens_ = tokenize(original_text_);
        }
        
        // Safe: filter creates new views into same original text
        ProcessingPipeline& filterByLength(size_t min_length) {
            tokens_.erase(
                std::remove_if(tokens_.begin(), tokens_.end(),
                    [min_length](std::string_view token) {
                        return token.size() < min_length;
                    }),
                tokens_.end()
            );
            return *this;
        }
        
        // Safe: transform operates on views
        void printUppercase() const {
            for (std::string_view token : tokens_) {
                for (char c : token) {
                    std::cout << static_cast<char>(std::toupper(c));
                }
                std::cout << " ";
            }
            std::cout << "\\n";
        }
        
        // Get results - caller must ensure pipeline lifetime
        const std::vector<std::string_view>& getTokens() const {
            return tokens_;
        }
    };
    
    // Usage example
    static void demonstratePipeline() {
        // Safe usage
        ProcessingPipeline pipeline("Hello world this is a test of tokenization");
        
        pipeline.filterByLength(4)  // Keep tokens with 4+ characters
                .printUppercase();   // Print in uppercase
        
        // Safe: pipeline owns original_text_, tokens_ are valid
        for (std::string_view token : pipeline.getTokens()) {
            std::cout << "Token: '" << token << "' (length: " << token.size() << ")\\n";
        }
        
        // UNSAFE example:
        /*
        std::vector<std::string_view> unsafe_tokens;
        {
            ProcessingPipeline temp_pipeline("Temporary text");
            unsafe_tokens = temp_pipeline.getTokens();  // DANGER!
        }  // temp_pipeline destroyed here
        
        // unsafe_tokens now contains dangling views!
        // Accessing them is undefined behavior
        */
    }
};`}
        </code>
      </CodeBlock>

      <QuizContainer>
        <h3>Test Your View Safety Knowledge</h3>
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