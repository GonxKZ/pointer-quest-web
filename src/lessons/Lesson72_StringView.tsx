import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LessonLayout, Section, SectionTitle, InteractiveSection,
  LearningObjectives, Button, CodeBlock, PerformanceMonitor,
  AccessibilityAnnouncer, theme, type LessonProgress 
} from '../design-system';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import * as THREE from 'three';

interface StringViewState {
  demonstrationType: 'basic_operations' | 'performance_comparison' | 'parser_implementation' | 'memory_layout';
  currentScenario: number;
  basicOperations: {
    originalString: string;
    viewStart: number;
    viewLength: number;
    operations: Array<{
      name: string;
      result: string;
      performance: number;
    }>;
  };
  performanceComparison: {
    scenarios: Array<{
      operation: string;
      stringCopy: number;
      stringView: number;
      improvement: number;
    }>;
    totalOperations: number;
    memoryAllocations: number;
  };
  parserImplementation: {
    input: string;
    tokens: Array<{
      type: string;
      value: string;
      position: number;
      length: number;
    }>;
    parseStep: number;
    totalTokens: number;
  };
  memoryLayout: {
    originalStrings: Array<{
      id: string;
      content: string;
      address: number;
      size: number;
    }>;
    stringViews: Array<{
      id: string;
      pointsTo: string;
      offset: number;
      length: number;
      overhead: number;
    }>;
    memoryEfficiency: number;
  };
  performanceStats: {
    allocationsSaved: number;
    copyOperationsAvoided: number;
    memoryEfficiency: number;
    parsePerformance: number;
  };
}

const StringViewVisualization: React.FC<{ state: StringViewState }> = ({ state }) => {
  const getOperationColor = (performance: number) => {
    if (performance > 80) return '#2ecc71';
    if (performance > 60) return '#f39c12';
    return '#e74c3c';
  };

  const scenarios = [
    {
      title: 'Basic String View Operations',
      description: 'Core string_view operations without memory allocation',
      focus: 'basic_operations'
    },
    {
      title: 'Performance vs std::string',
      description: 'Zero-copy operations performance comparison',
      focus: 'performance_comparison'
    },
    {
      title: 'Efficient Parser Implementation',
      description: 'Zero-copy tokenization with string_view',
      focus: 'parser_implementation'
    },
    {
      title: 'Memory Layout Visualization',
      description: 'String views pointing to existing memory',
      focus: 'memory_layout'
    }
  ];

  const currentScenario = scenarios[state.currentScenario] || scenarios[0];

  const renderBasicOperations = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Basic String View Operations
      </Text>
      
      {/* Original string visualization */}
      <group position={[0, 2.5, 0]}>
        <Box args={[6, 0.8, 0.3]}>
          <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
        </Box>
        <Text position={[0, 0, 0.2]} fontSize={0.08} color="white" anchorX="center">
          {state.basicOperations.originalString}
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.06} color="#ecf0f1" anchorX="center">
          Original String (Heap Memory)
        </Text>
      </group>

      {/* String view visualization */}
      <group position={[0, 1, 0]}>
        <Box args={[4, 0.6, 0.25]} position={[state.basicOperations.viewStart * 0.3 - 1.5, 0, 0]}>
          <meshStandardMaterial color="#e74c3c" transparent opacity={0.9} />
        </Box>
        <Text 
          position={[state.basicOperations.viewStart * 0.3 - 1.5, 0, 0.15]} 
          fontSize={0.07} 
          color="white" 
          anchorX="center"
        >
          VIEW
        </Text>
        
        {/* Pointer line from view to original */}
        <Line
          points={[[state.basicOperations.viewStart * 0.3 - 1.5, 0.3, 0], [0, 2.1, 0]]}
          color="#e74c3c"
          lineWidth={3}
          dashed={true}
        />
      </group>

      {/* Operations results */}
      <group position={[0, -0.5, 0]}>
        {state.basicOperations.operations.slice(0, 3).map((op, index) => (
          <group key={op.name} position={[index * 2.5 - 2.5, 0, 0]}>
            <Box args={[2, 1.2, 0.3]}>
              <meshStandardMaterial 
                color={getOperationColor(op.performance)} 
                transparent 
                opacity={0.7} 
              />
            </Box>
            
            <Text position={[0, 0.3, 0.2]} fontSize={0.06} color="white" anchorX="center">
              {op.name}
            </Text>
            <Text position={[0, 0, 0.2]} fontSize={0.05} color="white" anchorX="center">
              {op.result}
            </Text>
            <Text position={[0, -0.3, 0.2]} fontSize={0.04} color="white" anchorX="center">
              {op.performance}% efficient
            </Text>
          </group>
        ))}
      </group>

      {/* Performance metrics */}
      <group position={[0, -2, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.10} color="#2ecc71" anchorX="center">
          Zero Allocations • Zero Copies • Constant Time
        </Text>
      </group>
    </group>
  );

  const renderPerformanceComparison = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Performance: string_view vs std::string
      </Text>
      
      {/* Performance comparison bars */}
      <group position={[0, 2, 0]}>
        {state.performanceComparison.scenarios.slice(0, 4).map((scenario, index) => (
          <group key={scenario.operation} position={[index * 2 - 3, 0, 0]}>
            {/* std::string bar (slower) */}
            <Box args={[0.6, scenario.stringCopy / 50, 0.2]} position={[-0.4, scenario.stringCopy / 100, 0]}>
              <meshStandardMaterial color="#e74c3c" transparent opacity={0.8} />
            </Box>
            
            {/* string_view bar (faster) */}
            <Box args={[0.6, scenario.stringView / 50, 0.2]} position={[0.4, scenario.stringView / 100, 0]}>
              <meshStandardMaterial color="#2ecc71" transparent opacity={0.8} />
            </Box>
            
            <Text position={[0, -0.8, 0]} fontSize={0.05} color="white" anchorX="center">
              {scenario.operation}
            </Text>
            
            <Text position={[0, -1, 0]} fontSize={0.04} color="#f39c12" anchorX="center">
              {scenario.improvement.toFixed(1)}x faster
            </Text>
          </group>
        ))}
      </group>

      {/* Legend */}
      <group position={[0, 0, 0]}>
        <Box args={[0.3, 0.3, 0.1]} position={[-1.5, 0, 0]}>
          <meshStandardMaterial color="#e74c3c" />
        </Box>
        <Text position={[-1, 0, 0]} fontSize={0.06} color="white" anchorX="left">
          std::string (allocations)
        </Text>
        
        <Box args={[0.3, 0.3, 0.1]} position={[1, 0, 0]}>
          <meshStandardMaterial color="#2ecc71" />
        </Box>
        <Text position={[1.5, 0, 0]} fontSize={0.06} color="white" anchorX="left">
          string_view (zero-copy)
        </Text>
      </group>

      {/* Statistics */}
      <group position={[0, -1.5, 0]}>
        <Text position={[-1.5, 0, 0]} fontSize={0.08} color="#3498db" anchorX="center">
          Operations: {state.performanceComparison.totalOperations}
        </Text>
        <Text position={[1.5, 0, 0]} fontSize={0.08} color="#e74c3c" anchorX="center">
          Allocations Saved: {state.performanceComparison.memoryAllocations}
        </Text>
      </group>
    </group>
  );

  const renderParserImplementation = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Zero-Copy Parser with string_view
      </Text>
      
      {/* Input string */}
      <group position={[0, 2.5, 0]}>
        <Box args={[8, 0.6, 0.3]}>
          <meshStandardMaterial color="#34495e" transparent opacity={0.8} />
        </Box>
        <Text position={[0, 0, 0.2]} fontSize={0.06} color="white" anchorX="center">
          {state.parserImplementation.input}
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.05} color="#ecf0f1" anchorX="center">
          Input Text (Single Allocation)
        </Text>
      </group>

      {/* Parsed tokens */}
      <group position={[0, 1, 0]}>
        {state.parserImplementation.tokens.slice(0, 6).map((token, index) => {
          const x = index * 1.3 - 3.25;
          const tokenColor = token.type === 'keyword' ? '#9b59b6' : 
                           token.type === 'identifier' ? '#3498db' : 
                           token.type === 'literal' ? '#2ecc71' : '#f39c12';
          
          return (
            <group key={`${token.type}-${index}`} position={[x, 0, 0]}>
              <Box args={[1.2, 0.8, 0.25]}>
                <meshStandardMaterial color={tokenColor} transparent opacity={0.8} />
              </Box>
              
              <Text position={[0, 0.2, 0.15]} fontSize={0.04} color="white" anchorX="center">
                {token.type}
              </Text>
              <Text position={[0, 0, 0.15]} fontSize={0.05} color="white" anchorX="center">
                {token.value}
              </Text>
              <Text position={[0, -0.2, 0.15]} fontSize={0.03} color="white" anchorX="center">
                @{token.position}
              </Text>
              
              {/* Pointer to original string */}
              <Line
                points={[[0, 0.4, 0], [0, 1.9, 0]]}
                color={tokenColor}
                lineWidth={2}
                dashed={true}
              />
            </group>
          );
        })}
      </group>

      {/* Parse progress */}
      <group position={[0, -0.5, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.08} color="#f39c12" anchorX="center">
          Parse Step: {state.parserImplementation.parseStep}
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.07} color="#2ecc71" anchorX="center">
          Tokens Found: {state.parserImplementation.totalTokens}
        </Text>
        <Text position={[0, -0.3, 0]} fontSize={0.06} color="#3498db" anchorX="center">
          Zero Memory Copies • All Views Point to Original
        </Text>
      </group>
    </group>
  );

  const renderMemoryLayout = () => (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Memory Layout: Views vs Copies
      </Text>
      
      {/* Original strings in memory */}
      <group position={[0, 2.2, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.10} color="#ecf0f1" anchorX="center">
          Heap Memory (Original Strings)
        </Text>
        
        {state.memoryLayout.originalStrings.slice(0, 3).map((str, index) => (
          <group key={str.id} position={[index * 2.5 - 2.5, 0, 0]}>
            <Box args={[2.2, 0.8, 0.4]}>
              <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
            </Box>
            <Text position={[0, 0.1, 0.25]} fontSize={0.05} color="white" anchorX="center">
              {str.content.substring(0, 12)}...
            </Text>
            <Text position={[0, -0.1, 0.25]} fontSize={0.04} color="white" anchorX="center">
              Size: {str.size}B
            </Text>
            <Text position={[0, -0.3, 0.25]} fontSize={0.03} color="#ecf0f1" anchorX="center">
              @0x{str.address.toString(16)}
            </Text>
          </group>
        ))}
      </group>

      {/* String views */}
      <group position={[0, 0.5, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.10} color="#ecf0f1" anchorX="center">
          String Views (Stack Objects)
        </Text>
        
        {state.memoryLayout.stringViews.slice(0, 6).map((view, index) => {
          const x = index * 1.5 - 3.75;
          const originalIndex = state.memoryLayout.originalStrings.findIndex(s => s.id === view.pointsTo);
          const originalX = originalIndex * 2.5 - 2.5;
          
          return (
            <group key={view.id} position={[x, 0, 0]}>
              <Box args={[1.3, 0.6, 0.25]}>
                <meshStandardMaterial color="#e74c3c" transparent opacity={0.8} />
              </Box>
              <Text position={[0, 0.1, 0.15]} fontSize={0.04} color="white" anchorX="center">
                view_{view.id}
              </Text>
              <Text position={[0, -0.1, 0.15]} fontSize={0.03} color="white" anchorX="center">
                +{view.offset}:{view.length}
              </Text>
              
              {/* Pointer to original string */}
              {originalIndex >= 0 && (
                <Line
                  points={[[0, 0.3, 0], [originalX - x, 1.4, 0]]}
                  color="#e74c3c"
                  lineWidth={2}
                  dashed={false}
                />
              )}
            </group>
          );
        })}
      </group>

      {/* Memory efficiency stats */}
      <group position={[0, -1.2, 0]}>
        <Text position={[0, 0.3, 0]} fontSize={0.08} color="#2ecc71" anchorX="center">
          Memory Efficiency: {(state.memoryLayout.memoryEfficiency * 100).toFixed(1)}%
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.06} color="#f39c12" anchorX="center">
          Views: {state.memoryLayout.stringViews.length} × 16 bytes each
        </Text>
        <Text position={[0, -0.3, 0]} fontSize={0.06} color="#3498db" anchorX="center">
          No string duplication • Shared read-only data
        </Text>
      </group>
    </group>
  );

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      <Text position={[0, 4.2, 0]} fontSize={0.25} color="#00d4ff" anchorX="center">
        {currentScenario.title}
      </Text>
      
      <Text position={[0, 3.8, 0]} fontSize={0.12} color="#ffa500" anchorX="center">
        {currentScenario.description}
      </Text>
      
      {state.demonstrationType === 'basic_operations' && renderBasicOperations()}
      {state.demonstrationType === 'performance_comparison' && renderPerformanceComparison()}
      {state.demonstrationType === 'parser_implementation' && renderParserImplementation()}
      {state.demonstrationType === 'memory_layout' && renderMemoryLayout()}
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
};

const Lesson72_StringView: React.FC = () => {
  const { state } = useApp();
  const [lessonState, setLessonState] = useState<StringViewState>({
    demonstrationType: 'basic_operations',
    currentScenario: 0,
    basicOperations: {
      originalString: "Hello, std::string_view world!",
      viewStart: 7,
      viewLength: 17,
      operations: [
        { name: 'substr', result: 'std::string', performance: 95 },
        { name: 'find', result: 'Found at 12', performance: 98 },
        { name: 'starts_with', result: 'true', performance: 99 }
      ]
    },
    performanceComparison: {
      scenarios: [
        { operation: 'substr', stringCopy: 150, stringView: 15, improvement: 10 },
        { operation: 'find', stringCopy: 80, stringView: 12, improvement: 6.7 },
        { operation: 'parse', stringCopy: 300, stringView: 25, improvement: 12 },
        { operation: 'tokenize', stringCopy: 450, stringView: 35, improvement: 12.9 }
      ],
      totalOperations: 0,
      memoryAllocations: 0
    },
    parserImplementation: {
      input: "int main() { return 0; }",
      tokens: [
        { type: 'keyword', value: 'int', position: 0, length: 3 },
        { type: 'identifier', value: 'main', position: 4, length: 4 },
        { type: 'operator', value: '()', position: 8, length: 2 },
        { type: 'operator', value: '{', position: 11, length: 1 },
        { type: 'keyword', value: 'return', position: 13, length: 6 },
        { type: 'literal', value: '0', position: 20, length: 1 }
      ],
      parseStep: 0,
      totalTokens: 6
    },
    memoryLayout: {
      originalStrings: [
        { id: 'A', content: 'Configuration file content here', address: 0x10000, size: 128 },
        { id: 'B', content: 'Large text document with data', address: 0x20000, size: 512 },
        { id: 'C', content: 'JSON response from API call', address: 0x30000, size: 256 }
      ],
      stringViews: [
        { id: '1', pointsTo: 'A', offset: 0, length: 13, overhead: 16 },
        { id: '2', pointsTo: 'A', offset: 14, length: 4, overhead: 16 },
        { id: '3', pointsTo: 'B', offset: 6, length: 4, overhead: 16 },
        { id: '4', pointsTo: 'B', offset: 11, length: 8, overhead: 16 },
        { id: '5', pointsTo: 'C', offset: 0, length: 4, overhead: 16 },
        { id: '6', pointsTo: 'C', offset: 5, length: 8, overhead: 16 }
      ],
      memoryEfficiency: 0.85
    },
    performanceStats: {
      allocationsSaved: 0,
      copyOperationsAvoided: 0,
      memoryEfficiency: 85,
      parsePerformance: 90
    }
  });

  const [progress, setProgress] = useState<LessonProgress>({
    currentStep: 0,
    totalSteps: 10,
    completedSteps: [],
    score: 0
  });

  const codeExamples = {
    basic_operations: `// Basic std::string_view Operations
#include <string_view>
#include <string>
#include <iostream>

// String view fundamentals
void demonstrateBasicStringView() {
    std::string original = "Hello, std::string_view world!";
    
    // Create string_view (no allocation, no copy)
    std::string_view view = original;  // Points to original's data
    std::string_view substr = view.substr(7, 17);  // "std::string_view"
    
    std::cout << "Original: " << original << "\\n";
    std::cout << "Full view: " << view << "\\n";
    std::cout << "Substring view: " << substr << "\\n";
    
    // String view properties
    std::cout << "View size: " << view.size() << "\\n";
    std::cout << "View data pointer: " << static_cast<const void*>(view.data()) << "\\n";
    std::cout << "Original data pointer: " << static_cast<const void*>(original.data()) << "\\n";
    // Pointers are the same - no copy made!
}

// Advanced string_view operations (C++20)
void demonstrateAdvancedOperations() {
    std::string_view text = "  Hello, World!  ";
    
    // C++20 string_view enhancements
    if (text.starts_with("  Hello")) {
        std::cout << "Text starts with '  Hello'\\n";
    }
    
    if (text.ends_with("!  ")) {
        std::cout << "Text ends with '!  '\\n";
    }
    
    // Remove prefix and suffix (modifies view, not original)
    std::string_view trimmed = text;
    trimmed.remove_prefix(2);  // Remove leading spaces
    trimmed.remove_suffix(2);  // Remove trailing spaces
    std::cout << "Trimmed: '" << trimmed << "'\\n";
    
    // Find operations
    size_t pos = trimmed.find("World");
    if (pos != std::string_view::npos) {
        std::cout << "Found 'World' at position: " << pos << "\\n";
    }
    
    // String view comparison
    std::string_view hello1 = "Hello";
    std::string_view hello2 = "Hello";
    std::cout << "Views equal: " << (hello1 == hello2) << "\\n";
}

// Working with different string types
void demonstrateStringInterop() {
    // From std::string
    std::string str = "From std::string";
    std::string_view view1 = str;
    
    // From C string literal
    std::string_view view2 = "String literal";  // Points to static memory
    
    // From char array
    char buffer[] = "From char array";
    std::string_view view3(buffer, strlen(buffer));
    
    // From substring of existing view
    std::string_view view4 = view1.substr(5);  // "std::string"
    
    // DANGER: Creating from temporary
    // std::string_view dangling = std::string("temporary").substr(0, 4);  // UNDEFINED BEHAVIOR!
    
    std::cout << "View 1: " << view1 << "\\n";
    std::cout << "View 2: " << view2 << "\\n";
    std::cout << "View 3: " << view3 << "\\n";
    std::cout << "View 4: " << view4 << "\\n";
}

// Efficient string processing
class TextProcessor {
    std::vector<std::string_view> words_;
    
public:
    // Process text without copying
    void tokenize(std::string_view text) {
        words_.clear();
        
        size_t start = 0;
        size_t pos = 0;
        
        while ((pos = text.find(' ', start)) != std::string_view::npos) {
            if (pos > start) {
                words_.emplace_back(text.substr(start, pos - start));
            }
            start = pos + 1;
        }
        
        // Add last word
        if (start < text.length()) {
            words_.emplace_back(text.substr(start));
        }
    }
    
    void printWords() const {
        std::cout << "Tokenized words:\\n";
        for (const auto& word : words_) {
            std::cout << "  '" << word << "'\\n";
        }
    }
    
    // Count specific word (case-insensitive)
    size_t countWord(std::string_view target) const {
        size_t count = 0;
        for (const auto& word : words_) {
            if (word.size() == target.size()) {
                bool match = true;
                for (size_t i = 0; i < word.size(); ++i) {
                    if (std::tolower(word[i]) != std::tolower(target[i])) {
                        match = false;
                        break;
                    }
                }
                if (match) ++count;
            }
        }
        return count;
    }
    
    // Get words containing substring
    std::vector<std::string_view> getWordsContaining(std::string_view substring) const {
        std::vector<std::string_view> result;
        
        for (const auto& word : words_) {
            if (word.find(substring) != std::string_view::npos) {
                result.push_back(word);
            }
        }
        
        return result;
    }
};

// Safe string_view patterns
class SafeStringView {
    std::string storage_;  // Owns the data
    std::string_view view_;  // Views the owned data
    
public:
    // Constructor ensures data lifetime
    SafeStringView(const std::string& data) 
        : storage_(data), view_(storage_) {}
    
    SafeStringView(std::string&& data) 
        : storage_(std::move(data)), view_(storage_) {}
    
    // Safe accessors
    std::string_view get() const { return view_; }
    const std::string& string() const { return storage_; }
    
    // Safe substring that maintains lifetime
    SafeStringView substr(size_t pos, size_t len = std::string_view::npos) const {
        return SafeStringView(storage_.substr(pos, len));
    }
    
    // Copy constructor maintains independent storage
    SafeStringView(const SafeStringView& other) 
        : storage_(other.storage_), view_(storage_) {}
    
    SafeStringView& operator=(const SafeStringView& other) {
        if (this != &other) {
            storage_ = other.storage_;
            view_ = storage_;  // Update view to point to new storage
        }
        return *this;
    }
};`,

    performance_comparison: `// Performance Comparison: string_view vs std::string
#include <string_view>
#include <string>
#include <chrono>
#include <vector>
#include <iostream>
#include <random>

class PerformanceBenchmark {
    std::vector<std::string> test_strings_;
    
    void generateTestData(size_t count = 10000) {
        test_strings_.reserve(count);
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> length_dist(10, 100);
        std::uniform_int_distribution<> char_dist(32, 126);
        
        for (size_t i = 0; i < count; ++i) {
            std::string str;
            int len = length_dist(gen);
            str.reserve(len);
            
            for (int j = 0; j < len; ++j) {
                str.push_back(static_cast<char>(char_dist(gen)));
            }
            
            test_strings_.push_back(std::move(str));
        }
    }
    
public:
    PerformanceBenchmark() {
        generateTestData();
    }
    
    // Benchmark substring creation
    void benchmarkSubstring() {
        std::cout << "=== Substring Creation Benchmark ===\\n";
        
        auto start = std::chrono::high_resolution_clock::now();
        
        // std::string approach (copies)
        size_t string_operations = 0;
        for (const auto& str : test_strings_) {
            if (str.length() > 10) {
                std::string substr = str.substr(2, 8);  // Creates copy
                string_operations += substr.length();
            }
        }
        
        auto mid = std::chrono::high_resolution_clock::now();
        
        // string_view approach (no copies)
        size_t view_operations = 0;
        for (const auto& str : test_strings_) {
            if (str.length() > 10) {
                std::string_view view = str;
                std::string_view substr = view.substr(2, 8);  // No copy
                view_operations += substr.length();
            }
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        
        auto string_time = std::chrono::duration_cast<std::chrono::microseconds>(mid - start);
        auto view_time = std::chrono::duration_cast<std::chrono::microseconds>(end - mid);
        
        std::cout << "String operations: " << string_operations << "\\n";
        std::cout << "View operations: " << view_operations << "\\n";
        std::cout << "std::string time: " << string_time.count() << " μs\\n";
        std::cout << "string_view time: " << view_time.count() << " μs\\n";
        std::cout << "Speedup: " << static_cast<double>(string_time.count()) / view_time.count() << "x\\n\\n";
    }
    
    // Benchmark search operations
    void benchmarkSearch() {
        std::cout << "=== Search Operations Benchmark ===\\n";
        
        const std::string target = "test";
        
        auto start = std::chrono::high_resolution_clock::now();
        
        // std::string approach
        size_t string_found = 0;
        for (const auto& str : test_strings_) {
            if (str.find(target) != std::string::npos) {
                ++string_found;
            }
        }
        
        auto mid = std::chrono::high_resolution_clock::now();
        
        // string_view approach
        size_t view_found = 0;
        for (const auto& str : test_strings_) {
            std::string_view view = str;
            if (view.find(target) != std::string_view::npos) {
                ++view_found;
            }
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        
        auto string_time = std::chrono::duration_cast<std::chrono::microseconds>(mid - start);
        auto view_time = std::chrono::duration_cast<std::chrono::microseconds>(end - mid);
        
        std::cout << "String found: " << string_found << "\\n";
        std::cout << "View found: " << view_found << "\\n";
        std::cout << "std::string time: " << string_time.count() << " μs\\n";
        std::cout << "string_view time: " << view_time.count() << " μs\\n";
        std::cout << "Speedup: " << static_cast<double>(string_time.count()) / view_time.count() << "x\\n\\n";
    }
    
    // Benchmark tokenization
    void benchmarkTokenization() {
        std::cout << "=== Tokenization Benchmark ===\\n";
        
        std::string large_text;
        for (const auto& str : test_strings_) {
            large_text += str + " ";
        }
        
        auto start = std::chrono::high_resolution_clock::now();
        
        // std::string tokenization (creates copies)
        std::vector<std::string> string_tokens;
        size_t start_pos = 0;
        size_t pos = 0;
        
        while ((pos = large_text.find(' ', start_pos)) != std::string::npos) {
            if (pos > start_pos) {
                string_tokens.emplace_back(large_text.substr(start_pos, pos - start_pos));
            }
            start_pos = pos + 1;
        }
        
        auto mid = std::chrono::high_resolution_clock::now();
        
        // string_view tokenization (no copies)
        std::vector<std::string_view> view_tokens;
        std::string_view text_view = large_text;
        start_pos = 0;
        pos = 0;
        
        while ((pos = text_view.find(' ', start_pos)) != std::string_view::npos) {
            if (pos > start_pos) {
                view_tokens.emplace_back(text_view.substr(start_pos, pos - start_pos));
            }
            start_pos = pos + 1;
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        
        auto string_time = std::chrono::duration_cast<std::chrono::microseconds>(mid - start);
        auto view_time = std::chrono::duration_cast<std::chrono::microseconds>(end - mid);
        
        std::cout << "String tokens: " << string_tokens.size() << "\\n";
        std::cout << "View tokens: " << view_tokens.size() << "\\n";
        std::cout << "std::string time: " << string_time.count() << " μs\\n";
        std::cout << "string_view time: " << view_time.count() << " μs\\n";
        std::cout << "Speedup: " << static_cast<double>(string_time.count()) / view_time.count() << "x\\n\\n";
    }
    
    // Memory usage comparison
    void measureMemoryUsage() {
        std::cout << "=== Memory Usage Analysis ===\\n";
        
        const std::string source = "This is a test string for memory usage analysis";
        
        // std::string copies
        std::vector<std::string> string_copies;
        for (int i = 0; i < 1000; ++i) {
            string_copies.emplace_back(source.substr(5, 20));  // Each creates copy
        }
        
        // string_view references
        std::vector<std::string_view> view_refs;
        for (int i = 0; i < 1000; ++i) {
            std::string_view view = source;
            view_refs.emplace_back(view.substr(5, 20));  // No copies
        }
        
        size_t string_memory = string_copies.size() * 20;  // Each copy is 20 chars
        size_t view_memory = view_refs.size() * sizeof(std::string_view);  // Just pointers
        
        std::cout << "String copies memory: " << string_memory << " bytes\\n";
        std::cout << "String view memory: " << view_memory << " bytes\\n";
        std::cout << "Memory saved: " << (string_memory - view_memory) << " bytes\\n";
        std::cout << "Memory efficiency: " << (1.0 - static_cast<double>(view_memory) / string_memory) * 100 << "%\\n\\n";
    }
    
    void runAllBenchmarks() {
        benchmarkSubstring();
        benchmarkSearch();
        benchmarkTokenization();
        measureMemoryUsage();
    }
};

// Real-world performance example: Log file parsing
class LogFileParser {
    std::string log_content_;
    
public:
    LogFileParser(const std::string& content) : log_content_(content) {}
    
    // Parse with string_view (zero-copy)
    struct LogEntry {
        std::string_view timestamp;
        std::string_view level;
        std::string_view message;
        std::string_view file;
        size_t line;
    };
    
    std::vector<LogEntry> parseWithStringView() {
        std::vector<LogEntry> entries;
        std::string_view content = log_content_;
        
        size_t start = 0;
        size_t pos = 0;
        
        while ((pos = content.find('\\n', start)) != std::string_view::npos) {
            std::string_view line = content.substr(start, pos - start);
            
            LogEntry entry;
            size_t field_start = 0;
            size_t field_pos = 0;
            
            // Parse timestamp
            if ((field_pos = line.find(' ', field_start)) != std::string_view::npos) {
                entry.timestamp = line.substr(field_start, field_pos - field_start);
                field_start = field_pos + 1;
            }
            
            // Parse level
            if ((field_pos = line.find(' ', field_start)) != std::string_view::npos) {
                entry.level = line.substr(field_start, field_pos - field_start);
                field_start = field_pos + 1;
            }
            
            // Parse message (rest of line before file info)
            if ((field_pos = line.rfind('(')) != std::string_view::npos) {
                entry.message = line.substr(field_start, field_pos - field_start - 1);
                
                // Parse file and line
                std::string_view file_info = line.substr(field_pos + 1);
                size_t colon_pos = file_info.find(':');
                if (colon_pos != std::string_view::npos) {
                    entry.file = file_info.substr(0, colon_pos);
                    
                    // Parse line number
                    std::string_view line_str = file_info.substr(colon_pos + 1);
                    size_t paren_pos = line_str.find(')');
                    if (paren_pos != std::string_view::npos) {
                        std::string line_num_str(line_str.substr(0, paren_pos));
                        entry.line = std::stoul(line_num_str);
                    }
                }
            }
            
            entries.push_back(entry);
            start = pos + 1;
        }
        
        return entries;
    }
    
    void printEntries(const std::vector<LogEntry>& entries) {
        std::cout << "Parsed " << entries.size() << " log entries:\\n";
        for (size_t i = 0; i < std::min(entries.size(), size_t(5)); ++i) {
            const auto& entry = entries[i];
            std::cout << "  [" << entry.timestamp << "] " 
                      << entry.level << ": " << entry.message 
                      << " (" << entry.file << ":" << entry.line << ")\\n";
        }
    }
};`,

    parser_implementation: `// Zero-Copy Parser Implementation with string_view
#include <string_view>
#include <vector>
#include <unordered_map>
#include <iostream>
#include <cctype>

// Token types for our parser
enum class TokenType {
    KEYWORD,
    IDENTIFIER,
    INTEGER,
    FLOAT,
    STRING,
    OPERATOR,
    PUNCTUATION,
    WHITESPACE,
    COMMENT,
    UNKNOWN
};

const char* tokenTypeString(TokenType type) {
    switch (type) {
        case TokenType::KEYWORD: return "KEYWORD";
        case TokenType::IDENTIFIER: return "IDENTIFIER";
        case TokenType::INTEGER: return "INTEGER";
        case TokenType::FLOAT: return "FLOAT";
        case TokenType::STRING: return "STRING";
        case TokenType::OPERATOR: return "OPERATOR";
        case TokenType::PUNCTUATION: return "PUNCTUATION";
        case TokenType::WHITESPACE: return "WHITESPACE";
        case TokenType::COMMENT: return "COMMENT";
        case TokenType::UNKNOWN: return "UNKNOWN";
    }
    return "UNKNOWN";
}

// Token structure using string_view (no allocations)
struct Token {
    TokenType type;
    std::string_view value;  // Points directly into source
    size_t line;
    size_t column;
    size_t position;
    
    Token(TokenType t, std::string_view v, size_t l, size_t c, size_t p)
        : type(t), value(v), line(l), column(c), position(p) {}
};

// Zero-copy lexer using string_view
class ZeroCopyLexer {
    std::string_view source_;
    size_t position_;
    size_t line_;
    size_t column_;
    
    // Keywords lookup (could use hash map for better performance)
    static const std::unordered_set<std::string_view> keywords_;
    
    char peek(size_t offset = 0) const {
        size_t pos = position_ + offset;
        return pos < source_.size() ? source_[pos] : '\\0';
    }
    
    char advance() {
        if (position_ >= source_.size()) return '\\0';
        
        char ch = source_[position_++];
        if (ch == '\\n') {
            ++line_;
            column_ = 1;
        } else {
            ++column_;
        }
        return ch;
    }
    
    void skipWhitespace() {
        while (position_ < source_.size() && std::isspace(peek())) {
            advance();
        }
    }
    
    Token parseIdentifierOrKeyword() {
        size_t start = position_;
        size_t start_line = line_;
        size_t start_col = column_;
        
        // Read identifier characters
        while (position_ < source_.size() && 
               (std::isalnum(peek()) || peek() == '_')) {
            advance();
        }
        
        std::string_view value = source_.substr(start, position_ - start);
        TokenType type = keywords_.count(value) ? TokenType::KEYWORD : TokenType::IDENTIFIER;
        
        return Token(type, value, start_line, start_col, start);
    }
    
    Token parseNumber() {
        size_t start = position_;
        size_t start_line = line_;
        size_t start_col = column_;
        
        bool is_float = false;
        
        // Read digits
        while (position_ < source_.size() && std::isdigit(peek())) {
            advance();
        }
        
        // Check for decimal point
        if (peek() == '.' && std::isdigit(peek(1))) {
            is_float = true;
            advance(); // consume '.'
            
            // Read fractional digits
            while (position_ < source_.size() && std::isdigit(peek())) {
                advance();
            }
        }
        
        // Check for scientific notation
        if (peek() == 'e' || peek() == 'E') {
            is_float = true;
            advance();
            
            if (peek() == '+' || peek() == '-') {
                advance();
            }
            
            while (position_ < source_.size() && std::isdigit(peek())) {
                advance();
            }
        }
        
        std::string_view value = source_.substr(start, position_ - start);
        TokenType type = is_float ? TokenType::FLOAT : TokenType::INTEGER;
        
        return Token(type, value, start_line, start_col, start);
    }
    
    Token parseString() {
        size_t start = position_;
        size_t start_line = line_;
        size_t start_col = column_;
        
        char quote = advance(); // consume opening quote
        
        while (position_ < source_.size() && peek() != quote) {
            if (peek() == '\\\\') {
                advance(); // consume backslash
                if (position_ < source_.size()) {
                    advance(); // consume escaped character
                }
            } else {
                advance();
            }
        }
        
        if (position_ < source_.size()) {
            advance(); // consume closing quote
        }
        
        std::string_view value = source_.substr(start, position_ - start);
        return Token(TokenType::STRING, value, start_line, start_col, start);
    }
    
    Token parseOperator() {
        size_t start = position_;
        size_t start_line = line_;
        size_t start_col = column_;
        
        char first = advance();
        char second = peek();
        
        // Check for two-character operators
        if ((first == '=' && second == '=') ||
            (first == '!' && second == '=') ||
            (first == '<' && second == '=') ||
            (first == '>' && second == '=') ||
            (first == '+' && second == '+') ||
            (first == '-' && second == '-') ||
            (first == '&' && second == '&') ||
            (first == '|' && second == '|') ||
            (first == '<' && second == '<') ||
            (first == '>' && second == '>')) {
            advance();
        }
        
        std::string_view value = source_.substr(start, position_ - start);
        return Token(TokenType::OPERATOR, value, start_line, start_col, start);
    }
    
    Token parseComment() {
        size_t start = position_;
        size_t start_line = line_;
        size_t start_col = column_;
        
        if (peek() == '/' && peek(1) == '/') {
            // Single-line comment
            while (position_ < source_.size() && peek() != '\\n') {
                advance();
            }
        } else if (peek() == '/' && peek(1) == '*') {
            // Multi-line comment
            advance(); // consume '/'
            advance(); // consume '*'
            
            while (position_ < source_.size() - 1) {
                if (peek() == '*' && peek(1) == '/') {
                    advance(); // consume '*'
                    advance(); // consume '/'
                    break;
                }
                advance();
            }
        }
        
        std::string_view value = source_.substr(start, position_ - start);
        return Token(TokenType::COMMENT, value, start_line, start_col, start);
    }
    
public:
    ZeroCopyLexer(std::string_view source) 
        : source_(source), position_(0), line_(1), column_(1) {}
    
    std::vector<Token> tokenize() {
        std::vector<Token> tokens;
        tokens.reserve(source_.size() / 8); // Estimate
        
        while (position_ < source_.size()) {
            char ch = peek();
            
            if (std::isspace(ch)) {
                skipWhitespace();
            } else if (std::isalpha(ch) || ch == '_') {
                tokens.push_back(parseIdentifierOrKeyword());
            } else if (std::isdigit(ch)) {
                tokens.push_back(parseNumber());
            } else if (ch == '"' || ch == '\\'') {
                tokens.push_back(parseString());
            } else if (ch == '/' && (peek(1) == '/' || peek(1) == '*')) {
                tokens.push_back(parseComment());
            } else if (std::strchr("+-*/%=!<>&|^~", ch)) {
                tokens.push_back(parseOperator());
            } else if (std::strchr("(){}[];,.", ch)) {
                size_t start = position_;
                std::string_view value = source_.substr(start, 1);
                tokens.emplace_back(TokenType::PUNCTUATION, value, line_, column_, start);
                advance();
            } else {
                size_t start = position_;
                std::string_view value = source_.substr(start, 1);
                tokens.emplace_back(TokenType::UNKNOWN, value, line_, column_, start);
                advance();
            }
        }
        
        return tokens;
    }
    
    // Additional utility methods
    std::vector<std::string_view> getLines() const {
        std::vector<std::string_view> lines;
        size_t start = 0;
        
        for (size_t i = 0; i < source_.size(); ++i) {
            if (source_[i] == '\\n') {
                lines.push_back(source_.substr(start, i - start));
                start = i + 1;
            }
        }
        
        if (start < source_.size()) {
            lines.push_back(source_.substr(start));
        }
        
        return lines;
    }
    
    std::string_view getTokenContext(const Token& token, size_t context_size = 20) const {
        size_t start = (token.position >= context_size) ? token.position - context_size : 0;
        size_t end = std::min(token.position + token.value.size() + context_size, source_.size());
        return source_.substr(start, end - start);
    }
};

// Initialize keywords
const std::unordered_set<std::string_view> ZeroCopyLexer::keywords_ = {
    "auto", "break", "case", "char", "const", "continue", "default", "do",
    "double", "else", "enum", "extern", "float", "for", "goto", "if",
    "int", "long", "register", "return", "short", "signed", "sizeof", "static",
    "struct", "switch", "typedef", "union", "unsigned", "void", "volatile", "while",
    "class", "private", "protected", "public", "virtual", "namespace", "using",
    "template", "typename", "try", "catch", "throw", "new", "delete", "this",
    "true", "false", "nullptr", "constexpr", "decltype", "noexcept"
};

// Advanced parser using the zero-copy lexer
class ZeroCopyParser {
    std::vector<Token> tokens_;
    size_t position_;
    
    const Token& peek(size_t offset = 0) const {
        static const Token eof_token{TokenType::UNKNOWN, "", 0, 0, SIZE_MAX};
        size_t pos = position_ + offset;
        return pos < tokens_.size() ? tokens_[pos] : eof_token;
    }
    
    const Token& advance() {
        static const Token eof_token{TokenType::UNKNOWN, "", 0, 0, SIZE_MAX};
        return position_ < tokens_.size() ? tokens_[position_++] : eof_token;
    }
    
public:
    ZeroCopyParser(std::vector<Token> tokens) 
        : tokens_(std::move(tokens)), position_(0) {}
    
    // Parse function declarations
    struct FunctionDecl {
        std::string_view return_type;
        std::string_view name;
        std::vector<std::string_view> parameters;
        size_t line;
    };
    
    std::vector<FunctionDecl> parseFunctions() {
        std::vector<FunctionDecl> functions;
        
        while (position_ < tokens_.size()) {
            // Look for function pattern: type identifier (
            if (peek().type == TokenType::IDENTIFIER || peek().type == TokenType::KEYWORD) {
                size_t start_pos = position_;
                std::string_view return_type = advance().value;
                
                if (peek().type == TokenType::IDENTIFIER) {
                    std::string_view name = advance().value;
                    
                    if (peek().value == "(") {
                        advance(); // consume '('
                        
                        FunctionDecl func;
                        func.return_type = return_type;
                        func.name = name;
                        func.line = tokens_[start_pos].line;
                        
                        // Parse parameters
                        while (peek().value != ")" && position_ < tokens_.size()) {
                            if (peek().type == TokenType::IDENTIFIER || peek().type == TokenType::KEYWORD) {
                                func.parameters.push_back(advance().value);
                            } else {
                                advance(); // skip other tokens
                            }
                        }
                        
                        functions.push_back(func);
                    }
                }
            } else {
                advance();
            }
        }
        
        return functions;
    }
    
    // Parse class declarations
    struct ClassDecl {
        std::string_view name;
        std::vector<std::string_view> members;
        size_t line;
    };
    
    std::vector<ClassDecl> parseClasses() {
        std::vector<ClassDecl> classes;
        
        position_ = 0; // Reset position
        
        while (position_ < tokens_.size()) {
            if (peek().type == TokenType::KEYWORD && peek().value == "class") {
                advance(); // consume 'class'
                
                if (peek().type == TokenType::IDENTIFIER) {
                    ClassDecl cls;
                    cls.name = advance().value;
                    cls.line = tokens_[position_ - 1].line;
                    
                    // Find opening brace
                    while (peek().value != "{" && position_ < tokens_.size()) {
                        advance();
                    }
                    
                    if (peek().value == "{") {
                        advance(); // consume '{'
                        
                        // Parse class body
                        int brace_count = 1;
                        while (brace_count > 0 && position_ < tokens_.size()) {
                            const Token& token = advance();
                            
                            if (token.value == "{") {
                                ++brace_count;
                            } else if (token.value == "}") {
                                --brace_count;
                            } else if (token.type == TokenType::IDENTIFIER) {
                                cls.members.push_back(token.value);
                            }
                        }
                    }
                    
                    classes.push_back(cls);
                }
            } else {
                advance();
            }
        }
        
        return classes;
    }
    
    void printStatistics() const {
        std::unordered_map<TokenType, size_t> counts;
        
        for (const auto& token : tokens_) {
            ++counts[token.type];
        }
        
        std::cout << "Token Statistics:\\n";
        for (const auto& [type, count] : counts) {
            std::cout << "  " << tokenTypeString(type) << ": " << count << "\\n";
        }
        std::cout << "  Total: " << tokens_.size() << " tokens\\n";
    }
};

// Demonstration of zero-copy parsing
void demonstrateZeroCopyParsing() {
    const std::string source_code = R"(
#include <iostream>

class Calculator {
private:
    double value;
    
public:
    Calculator() : value(0.0) {}
    
    double add(double x) {
        value += x;
        return value;
    }
    
    double multiply(double x) {
        value *= x;
        return value;
    }
    
    void reset() {
        value = 0.0;
    }
};

int main() {
    Calculator calc;
    
    calc.add(5.5);
    calc.multiply(2.0);
    
    std::cout << "Result: " << calc.getValue() << std::endl;
    
    return 0;
}
)";

    std::cout << "=== Zero-Copy Parsing Demonstration ===\\n";
    std::cout << "Source code size: " << source_code.size() << " bytes\\n\\n";
    
    // Tokenize without copying strings
    ZeroCopyLexer lexer(source_code);
    auto tokens = lexer.tokenize();
    
    std::cout << "Tokenized into " << tokens.size() << " tokens\\n";
    
    // Show first few tokens
    std::cout << "First 10 tokens:\\n";
    for (size_t i = 0; i < std::min(tokens.size(), size_t(10)); ++i) {
        const auto& token = tokens[i];
        std::cout << "  " << tokenTypeString(token.type) 
                  << ": '" << token.value << "'\\n";
    }
    
    // Parse structure
    ZeroCopyParser parser(std::move(tokens));
    
    auto functions = parser.parseFunctions();
    std::cout << "\\nFound " << functions.size() << " functions:\\n";
    for (const auto& func : functions) {
        std::cout << "  " << func.return_type << " " << func.name 
                  << "(...) at line " << func.line << "\\n";
    }
    
    auto classes = parser.parseClasses();
    std::cout << "\\nFound " << classes.size() << " classes:\\n";
    for (const auto& cls : classes) {
        std::cout << "  class " << cls.name << " at line " << cls.line 
                  << " with " << cls.members.size() << " members\\n";
    }
    
    parser.printStatistics();
}`,

    memory_layout: `// Memory Layout and Lifetime Management with string_view
#include <string_view>
#include <string>
#include <vector>
#include <memory>
#include <iostream>

// Demonstrate string_view memory layout
void demonstrateMemoryLayout() {
    std::cout << "=== String View Memory Layout ===\\n";
    
    // Show sizes
    std::cout << "sizeof(std::string): " << sizeof(std::string) << " bytes\\n";
    std::cout << "sizeof(std::string_view): " << sizeof(std::string_view) << " bytes\\n";
    std::cout << "sizeof(const char*): " << sizeof(const char*) << " bytes\\n\\n";
    
    std::string original = "Hello, string_view world!";
    std::string_view view = original;
    
    std::cout << "Original string:\\n";
    std::cout << "  Address: " << static_cast<const void*>(original.data()) << "\\n";
    std::cout << "  Size: " << original.size() << " bytes\\n";
    std::cout << "  Capacity: " << original.capacity() << " bytes\\n\\n";
    
    std::cout << "String view:\\n";
    std::cout << "  Data pointer: " << static_cast<const void*>(view.data()) << "\\n";
    std::cout << "  Size: " << view.size() << " bytes\\n";
    std::cout << "  Points to same data: " << (view.data() == original.data()) << "\\n\\n";
    
    // Create substring views
    std::string_view sub1 = view.substr(0, 5);   // "Hello"
    std::string_view sub2 = view.substr(7, 11);  // "string_view"
    std::string_view sub3 = view.substr(19, 6);  // "world!"
    
    std::cout << "Substring views:\\n";
    std::cout << "  sub1 '" << sub1 << "' at " << static_cast<const void*>(sub1.data()) << "\\n";
    std::cout << "  sub2 '" << sub2 << "' at " << static_cast<const void*>(sub2.data()) << "\\n";
    std::cout << "  sub3 '" << sub3 << "' at " << static_cast<const void*>(sub3.data()) << "\\n";
    
    // Show memory offsets
    auto base_addr = reinterpret_cast<uintptr_t>(original.data());
    auto sub1_addr = reinterpret_cast<uintptr_t>(sub1.data());
    auto sub2_addr = reinterpret_cast<uintptr_t>(sub2.data());
    auto sub3_addr = reinterpret_cast<uintptr_t>(sub3.data());
    
    std::cout << "\\nMemory offsets from original:\\n";
    std::cout << "  sub1 offset: " << (sub1_addr - base_addr) << " bytes\\n";
    std::cout << "  sub2 offset: " << (sub2_addr - base_addr) << " bytes\\n";
    std::cout << "  sub3 offset: " << (sub3_addr - base_addr) << " bytes\\n";
}

// Dangerous lifetime scenarios
class LifetimeDemonstration {
public:
    // DANGEROUS: Returns view to temporary
    std::string_view getBadSubstring() {
        std::string temp = "This is temporary";
        return std::string_view(temp).substr(5, 2);  // UNDEFINED BEHAVIOR!
        // temp is destroyed when function returns
    }
    
    // SAFE: Returns view to static/long-lived data
    std::string_view getGoodSubstring() {
        static const std::string persistent = "This is persistent";
        return std::string_view(persistent).substr(5, 2);  // OK
    }
    
    // DANGEROUS: Storing view to local variable
    void demonstrateDanglingReference() {
        std::string_view dangling;
        
        {
            std::string local = "Local string";
            dangling = local;  // View points to local
        }  // local is destroyed here
        
        // std::cout << dangling << std::endl;  // UNDEFINED BEHAVIOR!
    }
    
    // SAFE: Proper lifetime management
    void demonstrateSafeUsage() {
        std::string persistent = "Persistent string";
        std::string_view safe_view = persistent;
        
        // Use view while original is alive
        std::cout << "Safe view: " << safe_view << "\\n";
        
        // persistent goes out of scope after this function returns,
        // but we don't use the view after that
    }
};

// Safe string_view wrapper with lifetime management
template<typename StringType>
class SafeStringViewWrapper {
    std::unique_ptr<StringType> owned_string_;
    std::string_view view_;
    
public:
    // Constructor for owned string
    explicit SafeStringViewWrapper(StringType&& str) 
        : owned_string_(std::make_unique<StringType>(std::move(str)))
        , view_(*owned_string_) {}
    
    // Constructor for non-owned (caller guarantees lifetime)
    explicit SafeStringViewWrapper(const StringType& str) 
        : owned_string_(nullptr)
        , view_(str) {}
    
    std::string_view get() const { return view_; }
    bool owns_data() const { return owned_string_ != nullptr; }
    
    // Safe substring that maintains lifetime
    SafeStringViewWrapper substr(size_t pos, size_t len = std::string_view::npos) const {
        if (owned_string_) {
            // Create new owned substring
            std::string sub_str{view_.substr(pos, len)};
            return SafeStringViewWrapper(std::move(sub_str));
        } else {
            // Return view to existing data (caller must ensure lifetime)
            return SafeStringViewWrapper(view_.substr(pos, len));
        }
    }
    
private:
    // Private constructor for view-only wrapper
    explicit SafeStringViewWrapper(std::string_view view) 
        : owned_string_(nullptr)
        , view_(view) {}
    
    friend SafeStringViewWrapper;
};

// Memory-efficient text processing with proper lifetime management
class TextDatabase {
    std::vector<std::string> stored_texts_;
    std::vector<std::string_view> text_views_;
    
public:
    // Add text and return view
    std::string_view addText(std::string text) {
        stored_texts_.push_back(std::move(text));
        std::string_view view = stored_texts_.back();
        text_views_.push_back(view);
        return view;
    }
    
    // Get all views
    const std::vector<std::string_view>& getAllViews() const {
        return text_views_;
    }
    
    // Search across all texts without copying
    std::vector<std::string_view> findContaining(std::string_view substring) const {
        std::vector<std::string_view> results;
        
        for (std::string_view text : text_views_) {
            if (text.find(substring) != std::string_view::npos) {
                results.push_back(text);
            }
        }
        
        return results;
    }
    
    // Get word frequency without copying strings
    std::map<std::string, size_t> getWordFrequency() const {
        std::map<std::string, size_t> frequency;
        
        for (std::string_view text : text_views_) {
            size_t start = 0;
            size_t pos = 0;
            
            while ((pos = text.find(' ', start)) != std::string_view::npos) {
                if (pos > start) {
                    std::string_view word = text.substr(start, pos - start);
                    ++frequency[std::string(word)];  // Convert to string for map key
                }
                start = pos + 1;
            }
            
            // Add last word
            if (start < text.length()) {
                std::string_view word = text.substr(start);
                ++frequency[std::string(word)];
            }
        }
        
        return frequency;
    }
    
    void printMemoryStats() const {
        size_t text_memory = 0;
        for (const auto& text : stored_texts_) {
            text_memory += text.capacity();
        }
        
        size_t view_memory = text_views_.size() * sizeof(std::string_view);
        
        std::cout << "Text Database Memory Stats:\\n";
        std::cout << "  Stored texts: " << stored_texts_.size() << "\\n";
        std::cout << "  Text views: " << text_views_.size() << "\\n";
        std::cout << "  Text memory: " << text_memory << " bytes\\n";
        std::cout << "  View memory: " << view_memory << " bytes\\n";
        std::cout << "  Total memory: " << (text_memory + view_memory) << " bytes\\n";
        std::cout << "  Average text size: " << (text_memory / stored_texts_.size()) << " bytes\\n";
    }
};

// Configuration parser using string_view for zero-copy parsing
class ConfigParser {
    std::string_view config_data_;
    
    std::string_view trim(std::string_view str) const {
        size_t start = str.find_first_not_of(" \\t\\r\\n");
        if (start == std::string_view::npos) return {};
        
        size_t end = str.find_last_not_of(" \\t\\r\\n");
        return str.substr(start, end - start + 1);
    }
    
public:
    struct ConfigEntry {
        std::string_view key;
        std::string_view value;
        size_t line_number;
    };
    
    ConfigParser(std::string_view config) : config_data_(config) {}
    
    std::vector<ConfigEntry> parse() const {
        std::vector<ConfigEntry> entries;
        
        size_t line_start = 0;
        size_t line_number = 1;
        
        while (line_start < config_data_.size()) {
            size_t line_end = config_data_.find('\\n', line_start);
            if (line_end == std::string_view::npos) {
                line_end = config_data_.size();
            }
            
            std::string_view line = config_data_.substr(line_start, line_end - line_start);
            line = trim(line);
            
            // Skip empty lines and comments
            if (!line.empty() && line[0] != '#') {
                size_t eq_pos = line.find('=');
                if (eq_pos != std::string_view::npos) {
                    std::string_view key = trim(line.substr(0, eq_pos));
                    std::string_view value = trim(line.substr(eq_pos + 1));
                    
                    entries.push_back({key, value, line_number});
                }
            }
            
            line_start = line_end + 1;
            ++line_number;
        }
        
        return entries;
    }
    
    std::string_view getValue(std::string_view key) const {
        auto entries = parse();
        
        for (const auto& entry : entries) {
            if (entry.key == key) {
                return entry.value;
            }
        }
        
        return {};
    }
};

// Demonstration of memory layout and lifetime management
void demonstrateAdvancedUsage() {
    std::cout << "\\n=== Advanced Usage Demonstration ===\\n";
    
    // Text database example
    TextDatabase db;
    
    db.addText("The quick brown fox jumps over the lazy dog");
    db.addText("Pack my box with five dozen liquor jugs");
    db.addText("How razorback jumping frogs can level six piqued gymnasts");
    
    auto containing_fox = db.findContaining("fox");
    std::cout << "Texts containing 'fox': " << containing_fox.size() << "\\n";
    for (const auto& text : containing_fox) {
        std::cout << "  '" << text << "'\\n";
    }
    
    db.printMemoryStats();
    
    // Configuration parser example
    const std::string config_text = R"(
# Database configuration
host=localhost
port=5432
database=myapp

# Application settings
debug=true
log_level=info
max_connections=100
)";
    
    std::cout << "\\n=== Configuration Parsing ===\\n";
    ConfigParser parser(config_text);
    auto config_entries = parser.parse();
    
    std::cout << "Parsed " << config_entries.size() << " configuration entries:\\n";
    for (const auto& entry : config_entries) {
        std::cout << "  " << entry.key << " = " << entry.value 
                  << " (line " << entry.line_number << ")\\n";
    }
    
    // Look up specific values
    std::cout << "\\nDatabase host: " << parser.getValue("host") << "\\n";
    std::cout << "Debug mode: " << parser.getValue("debug") << "\\n";
}`
  };

  const scenarios = [
    {
      title: 'Basic String View Operations',
      code: codeExamples.basic_operations,
      explanation: state.language === 'en' 
        ? 'Fundamental string_view operations demonstrating zero-copy string manipulation and efficient substring creation.'
        : 'Operaciones fundamentales de string_view demostrando manipulación de strings sin copias y creación eficiente de subcadenas.'
    },
    {
      title: 'Performance Comparison',
      code: codeExamples.performance_comparison,
      explanation: state.language === 'en'
        ? 'Comprehensive performance benchmarks showing the efficiency gains of string_view over std::string copies.'
        : 'Benchmarks comprensivos de rendimiento mostrando las mejoras de eficiencia de string_view sobre copias de std::string.'
    },
    {
      title: 'Zero-Copy Parser Implementation',
      code: codeExamples.parser_implementation,
      explanation: state.language === 'en'
        ? 'Advanced parser implementation using string_view for zero-copy tokenization and parsing.'
        : 'Implementación avanzada de parser usando string_view para tokenización y parsing sin copias.'
    },
    {
      title: 'Memory Layout & Lifetime Management',
      code: codeExamples.memory_layout,
      explanation: state.language === 'en'
        ? 'Understanding memory layout of string_view and safe patterns for lifetime management.'
        : 'Entendiendo el layout de memoria de string_view y patrones seguros para gestión de lifetime.'
    }
  ];

  const runStringViewOp = () => {
    setLessonState(prev => ({
      ...prev,
      basicOperations: {
        ...prev.basicOperations,
        viewStart: Math.floor(Math.random() * 10),
        viewLength: Math.floor(Math.random() * 15) + 5,
        operations: prev.basicOperations.operations.map(op => ({
          ...op,
          performance: Math.min(100, op.performance + Math.floor(Math.random() * 5))
        }))
      },
      performanceStats: {
        ...prev.performanceStats,
        memoryEfficiency: Math.min(100, prev.performanceStats.memoryEfficiency + 2)
      }
    }));
  };

  const runPerformanceTest = () => {
    setLessonState(prev => ({
      ...prev,
      performanceComparison: {
        ...prev.performanceComparison,
        totalOperations: prev.performanceComparison.totalOperations + 1000,
        memoryAllocations: prev.performanceComparison.memoryAllocations + 500,
        scenarios: prev.performanceComparison.scenarios.map(scenario => ({
          ...scenario,
          improvement: scenario.improvement + 0.5
        }))
      },
      performanceStats: {
        ...prev.performanceStats,
        allocationsSaved: prev.performanceStats.allocationsSaved + 500,
        copyOperationsAvoided: prev.performanceStats.copyOperationsAvoided + 1000
      }
    }));
  };

  const parseTokens = () => {
    setLessonState(prev => ({
      ...prev,
      parserImplementation: {
        ...prev.parserImplementation,
        parseStep: prev.parserImplementation.parseStep + 1,
        totalTokens: prev.parserImplementation.totalTokens + Math.floor(Math.random() * 3) + 1
      },
      performanceStats: {
        ...prev.performanceStats,
        parsePerformance: Math.min(100, prev.performanceStats.parsePerformance + 3)
      }
    }));
  };

  const analyzeMemory = () => {
    setLessonState(prev => ({
      ...prev,
      memoryLayout: {
        ...prev.memoryLayout,
        memoryEfficiency: Math.min(1.0, prev.memoryLayout.memoryEfficiency + 0.02),
        stringViews: prev.memoryLayout.stringViews.map(view => ({
          ...view,
          offset: Math.floor(Math.random() * 20),
          length: Math.floor(Math.random() * 15) + 5
        }))
      }
    }));
  };

  const nextScenario = () => {
    const nextIndex = (lessonState.currentScenario + 1) % scenarios.length;
    setLessonState(prev => ({
      ...prev,
      currentScenario: nextIndex,
      demonstrationType: ['basic_operations', 'performance_comparison', 'parser_implementation', 'memory_layout'][nextIndex] as StringViewState['demonstrationType']
    }));
  };

  const learningObjectives = [
    state.language === 'en' ? 'Master std::string_view for zero-copy string operations' : 'Dominar std::string_view para operaciones string sin copias',
    state.language === 'en' ? 'Understand performance benefits over std::string copies' : 'Entender beneficios de rendimiento sobre copias de std::string',
    state.language === 'en' ? 'Implement efficient parsers and tokenizers' : 'Implementar parsers y tokenizadores eficientes',
    state.language === 'en' ? 'Learn safe lifetime management patterns' : 'Aprender patrones seguros de gestión de lifetime',
    state.language === 'en' ? 'Avoid common string_view pitfalls and undefined behavior' : 'Evitar problemas comunes de string_view y comportamiento indefinido'
  ];

  return (
    <LessonLayout
      title={state.language === 'en' ? "std::string_view - Zero-Copy String Processing" : "std::string_view - Procesamiento de Strings Sin Copias"}
      subtitle={state.language === 'en' 
        ? "Master efficient string operations with zero-copy views and advanced parsing techniques" 
        : "Domina operaciones eficientes de strings con vistas sin copias y técnicas de parsing avanzadas"}
    >
      <LearningObjectives objectives={learningObjectives} />

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🔍 std::string_view Fundamentals' : '🔍 Fundamentos de std::string_view'}
        </SectionTitle>
        
        <p>
          {state.language === 'en' 
            ? 'std::string_view provides a non-owning, read-only view into a string without performing expensive copies. It consists of just two members: a pointer to the character data and a length. This makes it extremely lightweight and efficient for string processing operations like parsing, tokenization, and substring extraction.'
            : 'std::string_view proporciona una vista no-propietaria y de solo lectura a un string sin realizar copias costosas. Consiste en solo dos miembros: un puntero a los datos de caracteres y una longitud. Esto lo hace extremadamente ligero y eficiente para operaciones de procesamiento de strings como parsing, tokenización y extracción de subcadenas.'}
        </p>

        <div style={{ height: '500px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', margin: '20px 0' }}>
          <StringViewVisualization state={lessonState} />
        </div>
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? '🧪 Interactive String View Operations' : '🧪 Operaciones Interactivas de String View'}
        </SectionTitle>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button onClick={nextScenario}>
            {state.language === 'en' ? 'Next Scenario' : 'Siguiente Escenario'} ({lessonState.currentScenario + 1}/4)
          </Button>
          
          <Button onClick={runStringViewOp} style={{ background: '#3498db' }}>
            {state.language === 'en' ? 'Run String Op' : 'Ejecutar Op String'}
          </Button>
          
          <Button onClick={runPerformanceTest} style={{ background: '#e74c3c' }}>
            {state.language === 'en' ? 'Performance Test' : 'Test Rendimiento'}
          </Button>
          
          <Button onClick={parseTokens} style={{ background: '#27ae60' }}>
            {state.language === 'en' ? 'Parse Tokens' : 'Parsear Tokens'}
          </Button>
          
          <Button onClick={analyzeMemory} style={{ background: '#9b59b6' }}>
            {state.language === 'en' ? 'Analyze Memory' : 'Analizar Memoria'}
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div>
            <h4>{scenarios[lessonState.currentScenario].title}</h4>
            <p>{scenarios[lessonState.currentScenario].explanation}</p>
            
            <CodeBlock
              language="cpp"
              showLineNumbers={true}
            >
              {scenarios[lessonState.currentScenario].code}
            </CodeBlock>
          </div>
          
          <div>
            <h4>{state.language === 'en' ? 'Performance Metrics' : 'Métricas de Rendimiento'}</h4>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px', 
              marginBottom: '15px' 
            }}>
              <div style={{ padding: '8px', background: 'rgba(52, 152, 219, 0.1)', border: '1px solid #3498db', borderRadius: '4px' }}>
                <strong>{state.language === 'en' ? 'Operations' : 'Operaciones'}:</strong>
                <br />{lessonState.performanceComparison.totalOperations.toLocaleString()}
              </div>
              
              <div style={{ padding: '8px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '4px' }}>
                <strong>{state.language === 'en' ? 'Allocs Saved' : 'Allocs Evitadas'}:</strong>
                <br />{lessonState.performanceStats.allocationsSaved.toLocaleString()}
              </div>
              
              <div style={{ padding: '8px', background: 'rgba(39, 174, 96, 0.1)', border: '1px solid #27ae60', borderRadius: '4px' }}>
                <strong>{state.language === 'en' ? 'Parse Tokens' : 'Tokens Parseados'}:</strong>
                <br />{lessonState.parserImplementation.totalTokens}
              </div>
              
              <div style={{ padding: '8px', background: 'rgba(155, 89, 182, 0.1)', border: '1px solid #9b59b6', borderRadius: '4px' }}>
                <strong>{state.language === 'en' ? 'Memory Eff.' : 'Ef. Memoria'}:</strong>
                <br />{(lessonState.memoryLayout.memoryEfficiency * 100).toFixed(1)}%
              </div>
            </div>

            <h4>{state.language === 'en' ? 'Key string_view Operations' : 'Operaciones Clave de string_view'}</h4>
            <ul>
              <li><code>data()</code> - {state.language === 'en' ? 'Get pointer to character data' : 'Obtener puntero a datos de caracteres'}</li>
              <li><code>size()/length()</code> - {state.language === 'en' ? 'Get length of view' : 'Obtener longitud de la vista'}</li>
              <li><code>substr(pos, len)</code> - {state.language === 'en' ? 'Create substring view' : 'Crear vista de subcadena'}</li>
              <li><code>find(substring)</code> - {state.language === 'en' ? 'Search within view' : 'Buscar dentro de la vista'}</li>
              <li><code>starts_with(prefix)</code> - {state.language === 'en' ? 'Check prefix (C++20)' : 'Verificar prefijo (C++20)'}</li>
              <li><code>ends_with(suffix)</code> - {state.language === 'en' ? 'Check suffix (C++20)' : 'Verificar sufijo (C++20)'}</li>
            </ul>

            <h4>{state.language === 'en' ? 'Performance Statistics' : 'Estadísticas de Rendimiento'}</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px' 
            }}>
              <div>
                <strong>{state.language === 'en' ? 'Copies Avoided:' : 'Copias Evitadas:'}</strong> {lessonState.performanceStats.copyOperationsAvoided.toLocaleString()}
              </div>
              <div>
                <strong>{state.language === 'en' ? 'Memory Efficiency:' : 'Eficiencia Memoria:'}</strong> {lessonState.performanceStats.memoryEfficiency}%
              </div>
              <div>
                <strong>{state.language === 'en' ? 'Parse Performance:' : 'Rendimiento Parse:'}</strong> {lessonState.performanceStats.parsePerformance}%
              </div>
              <div>
                <strong>{state.language === 'en' ? 'String Views:' : 'Vistas String:'}</strong> {lessonState.memoryLayout.stringViews.length}
              </div>
            </div>

            <div style={{ 
              marginTop: '15px',
              padding: '10px', 
              background: 'rgba(52, 152, 219, 0.1)', 
              border: '1px solid #3498db', 
              borderRadius: '5px' 
            }}>
              <strong>{state.language === 'en' ? '🎯 Current Scenario Status:' : '🎯 Estado Escenario Actual:'}</strong>
              <br />
              <strong>{state.language === 'en' ? 'Type:' : 'Tipo:'}</strong> {lessonState.demonstrationType.replace('_', ' ')}
              <br />
              <strong>{state.language === 'en' ? 'Original Strings:' : 'Strings Originales:'}</strong> {lessonState.memoryLayout.originalStrings.length}
              <br />
              <strong>{state.language === 'en' ? 'Active Views:' : 'Vistas Activas:'}</strong> {lessonState.memoryLayout.stringViews.length}
            </div>
          </div>
        </div>
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '🚀 Advanced Use Cases' : '🚀 Casos de Uso Avanzados'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', background: 'rgba(52, 152, 219, 0.1)', border: '1px solid #3498db', borderRadius: '8px' }}>
            <h4 style={{ color: '#3498db' }}>{state.language === 'en' ? '⚡ Zero-Copy Parsing' : '⚡ Parsing Sin Copias'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Tokenization without allocation' : 'Tokenización sin asignación'}</li>
              <li>{state.language === 'en' ? 'Configuration file parsing' : 'Parsing de archivos de configuración'}</li>
              <li>{state.language === 'en' ? 'CSV and structured data processing' : 'Procesamiento de CSV y datos estructurados'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(39, 174, 96, 0.1)', border: '1px solid #27ae60', borderRadius: '8px' }}>
            <h4 style={{ color: '#27ae60' }}>{state.language === 'en' ? '🔍 Efficient Search' : '🔍 Búsqueda Eficiente'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Pattern matching in large texts' : 'Coincidencia de patrones en textos grandes'}</li>
              <li>{state.language === 'en' ? 'Log file analysis' : 'Análisis de archivos de log'}</li>
              <li>{state.language === 'en' ? 'String algorithms without copying' : 'Algoritmos de string sin copias'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(155, 89, 182, 0.1)', border: '1px solid #9b59b6', borderRadius: '8px' }}>
            <h4 style={{ color: '#9b59b6' }}>{state.language === 'en' ? '📝 Text Processing' : '📝 Procesamiento de Texto'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Document processing pipelines' : 'Pipelines de procesamiento de documentos'}</li>
              <li>{state.language === 'en' ? 'Template engines' : 'Motores de plantillas'}</li>
              <li>{state.language === 'en' ? 'Markup language parsers' : 'Parsers de lenguajes de marcado'}</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '8px' }}>
            <h4 style={{ color: '#e74c3c' }}>{state.language === 'en' ? '🏗️ API Design' : '🏗️ Diseño de API'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Function parameters for string operations' : 'Parámetros de función para operaciones string'}</li>
              <li>{state.language === 'en' ? 'Avoiding unnecessary string copies' : 'Evitando copias innecesarias de string'}</li>
              <li>{state.language === 'en' ? 'Interoperability with different string types' : 'Interoperabilidad con diferentes tipos de string'}</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? '⚠️ Best Practices & Common Pitfalls' : '⚠️ Mejores Prácticas y Problemas Comunes'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#27ae60' }}>{state.language === 'en' ? '✅ Best Practices' : '✅ Mejores Prácticas'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Use string_view for read-only string parameters' : 'Usar string_view para parámetros string de solo lectura'}</li>
              <li>{state.language === 'en' ? 'Ensure the viewed string outlives the string_view' : 'Asegurar que el string visto sobreviva al string_view'}</li>
              <li>{state.language === 'en' ? 'Prefer string_view over const string& for efficiency' : 'Preferir string_view sobre const string& para eficiencia'}</li>
              <li>{state.language === 'en' ? 'Use substr() for zero-copy substring operations' : 'Usar substr() para operaciones de subcadena sin copias'}</li>
              <li>{state.language === 'en' ? 'Leverage C++20 starts_with/ends_with methods' : 'Aprovechar métodos starts_with/ends_with de C++20'}</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#e74c3c' }}>{state.language === 'en' ? '❌ Common Pitfalls' : '❌ Problemas Comunes'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Returning string_view to temporary objects' : 'Retornar string_view a objetos temporales'}</li>
              <li>{state.language === 'en' ? 'Storing string_view when source may be destroyed' : 'Almacenar string_view cuando la fuente puede ser destruida'}</li>
              <li>{state.language === 'en' ? 'Assuming null-termination (use data() + size())' : 'Asumir terminación null (usar data() + size())'}</li>
              <li>{state.language === 'en' ? 'Modifying viewed string through string_view' : 'Modificar string visto a través de string_view'}</li>
              <li>{state.language === 'en' ? 'Creating views from std::string temporaries' : 'Crear vistas desde temporales de std::string'}</li>
            </ul>
          </div>
        </div>
      </Section>

      <PerformanceMonitor />
      <AccessibilityAnnouncer 
        message={`String view lesson. Current scenario: ${scenarios[lessonState.currentScenario].title}, Operations: ${lessonState.performanceComparison.totalOperations}, Memory efficiency: ${(lessonState.memoryLayout.memoryEfficiency * 100).toFixed(1)}%`}
      />
    </LessonLayout>
  );
};

export default Lesson72_StringView;