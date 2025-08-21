import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson52Props {
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
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

const InteractiveSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 30px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SignatureInput = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid rgba(74, 158, 255, 0.3);
`;

const SignatureTextArea = styled.textarea`
  width: 100%;
  height: 200px;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 5px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4a9eff;
  }
`;

const AnalysisOutput = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  min-height: 200px;
`;

const AnalysisItem = styled.div<{ type: 'safe' | 'warning' | 'danger' }>`
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border-left: 4px solid ${props => 
    props.type === 'safe' ? '#00ff00' :
    props.type === 'warning' ? '#ffaa00' : '#ff0000'
  };
  background: ${props => 
    props.type === 'safe' ? 'rgba(0, 255, 0, 0.1)' :
    props.type === 'warning' ? 'rgba(255, 170, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'
  };
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

const PresetButton = styled.button`
  margin: 5px;
  padding: 8px 12px;
  background: rgba(74, 158, 255, 0.2);
  color: white;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: rgba(74, 158, 255, 0.3);
  }
`;

interface LifetimeVisualizationProps {
  analysis: SignatureAnalysis | null;
}

interface SignatureAnalysis {
  returnType: string;
  functionName: string;
  parameters: Parameter[];
  lifetimeIssues: LifetimeIssue[];
  safetyLevel: 'safe' | 'warning' | 'danger';
}

interface Parameter {
  type: string;
  name: string;
  isPointer: boolean;
  isReference: boolean;
  isConst: boolean;
  lifetimeCategory: 'input' | 'output' | 'inout' | 'unknown';
}

interface LifetimeIssue {
  type: 'safe' | 'warning' | 'danger';
  message: string;
  parameter?: string;
}

function LifetimeVisualization({ analysis }: LifetimeVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  if (!analysis) {
    return (
      <group>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="#4a9eff"
          anchorX="center"
          anchorY="middle"
        >
          Enter a function signature to analyze
        </Text>
      </group>
    );
  }

  const getColorForSafety = (level: string) => {
    switch (level) {
      case 'safe': return '#00ff00';
      case 'warning': return '#ffaa00';
      case 'danger': return '#ff0000';
      default: return '#4a9eff';
    }
  };

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Function box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 1.5, 0.5]} />
        <meshStandardMaterial 
          color={getColorForSafety(analysis.safetyLevel)} 
          transparent 
          opacity={0.7} 
        />
      </mesh>
      
      <Text
        position={[0, 0, 0.3]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {analysis.functionName}
      </Text>
      
      {/* Parameters */}
      {analysis.parameters.map((param, index) => {
        const x = (index - (analysis.parameters.length - 1) / 2) * 1.5;
        const y = -2;
        
        return (
          <group key={index} position={[x, y, 0]}>
            <mesh>
              <boxGeometry args={[1, 0.8, 0.3]} />
              <meshStandardMaterial 
                color={param.isPointer || param.isReference ? '#ff9f40' : '#4a9eff'} 
                transparent 
                opacity={0.7} 
              />
            </mesh>
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {param.name}
            </Text>
            {/* Lifetime flow arrow */}
            <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.1, 0.3, 6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}
      
      {/* Safety indicator */}
      <Text
        position={[0, -3.5, 0]}
        fontSize={0.3}
        color={getColorForSafety(analysis.safetyLevel)}
        anchorX="center"
        anchorY="middle"
      >
        Safety Level: {analysis.safetyLevel.toUpperCase()}
      </Text>
    </group>
  );
}

export default function Lesson52_InteractiveSignatureAnalyzer({ onComplete, isCompleted }: Lesson52Props) {
  const [signatureInput, setSignatureInput] = useState('');
  const [analysis, setAnalysis] = useState<SignatureAnalysis | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const presetSignatures = [
    'char* strcpy(char* dest, const char* src)',
    'int* findElement(const std::vector<int>& vec, int value)',
    'const char* getName() const',
    'void processData(std::shared_ptr<Data>& data, int* result)',
    'std::string_view getView(const std::string& str)',
    'void unsafeFunction(int* ptr, char* buffer, size_t size)'
  ];

  const analyzeSignature = useCallback((signature: string): SignatureAnalysis | null => {
    if (!signature.trim()) return null;

    // Simple parsing logic for demonstration
    const functionMatch = signature.match(/(\w+[\w\s*&<>:,]*)\s+(\w+)\s*\(([^)]*)\)/);
    if (!functionMatch) return null;

    const [, returnType, functionName, paramString] = functionMatch;
    
    const parameters: Parameter[] = [];
    if (paramString.trim()) {
      const paramParts = paramString.split(',');
      for (const paramPart of paramParts) {
        const trimmed = paramPart.trim();
        const paramMatch = trimmed.match(/(.*?)(\w+)$/);
        if (paramMatch) {
          const [, type, name] = paramMatch;
          const cleanType = type.trim();
          
          parameters.push({
            type: cleanType,
            name: name,
            isPointer: cleanType.includes('*'),
            isReference: cleanType.includes('&'),
            isConst: cleanType.includes('const'),
            lifetimeCategory: determineLifetimeCategory(cleanType, name)
          });
        }
      }
    }

    const lifetimeIssues = analyzeLifetimeIssues(returnType, parameters, functionName);
    const safetyLevel = determineSafetyLevel(lifetimeIssues);

    return {
      returnType,
      functionName,
      parameters,
      lifetimeIssues,
      safetyLevel
    };
  }, []);

  const determineLifetimeCategory = (type: string, name: string): 'input' | 'output' | 'inout' | 'unknown' => {
    if (type.includes('const') && !type.includes('*') && type.includes('&')) return 'input';
    if (type.includes('*') && !type.includes('const')) return 'output';
    if (type.includes('&') && !type.includes('const')) return 'inout';
    return 'unknown';
  };

  const analyzeLifetimeIssues = (returnType: string, parameters: Parameter[], functionName: string): LifetimeIssue[] => {
    const issues: LifetimeIssue[] = [];

    // Check return type lifetime issues
    if (returnType.includes('*') || returnType.includes('&')) {
      if (!returnType.includes('const') && !returnType.includes('shared_ptr') && !returnType.includes('unique_ptr')) {
        issues.push({
          type: 'warning',
          message: 'Return type is a non-const pointer/reference - potential lifetime issue'
        });
      }
    }

    // Check parameter lifetime issues
    parameters.forEach(param => {
      if (param.isPointer && !param.isConst) {
        if (param.type === 'char*' && param.name.includes('dest')) {
          issues.push({
            type: 'safe',
            message: `Parameter '${param.name}' appears to be an output buffer`,
            parameter: param.name
          });
        } else {
          issues.push({
            type: 'warning',
            message: `Non-const pointer parameter '${param.name}' - verify lifetime management`,
            parameter: param.name
          });
        }
      }

      if (param.type.includes('std::string_view') || param.type.includes('std::span')) {
        issues.push({
          type: 'warning',
          message: `Parameter '${param.name}' is a view type - ensure source outlives usage`,
          parameter: param.name
        });
      }

      if (param.isReference && !param.isConst && param.type.includes('shared_ptr')) {
        issues.push({
          type: 'safe',
          message: `Parameter '${param.name}' allows modification of shared ownership`,
          parameter: param.name
        });
      }
    });

    // Function-specific analysis
    if (functionName === 'strcpy' || functionName.includes('unsafe')) {
      issues.push({
        type: 'danger',
        message: 'Function name suggests unsafe operations - review implementation carefully'
      });
    }

    if (parameters.some(p => p.type.includes('size_t')) && parameters.some(p => p.name.includes('buffer'))) {
      issues.push({
        type: 'safe',
        message: 'Buffer size parameter detected - good for bounds checking'
      });
    }

    return issues;
  };

  const determineSafetyLevel = (issues: LifetimeIssue[]): 'safe' | 'warning' | 'danger' => {
    if (issues.some(issue => issue.type === 'danger')) return 'danger';
    if (issues.some(issue => issue.type === 'warning')) return 'warning';
    return 'safe';
  };

  const handleSignatureChange = (value: string) => {
    setSignatureInput(value);
    const newAnalysis = analyzeSignature(value);
    setAnalysis(newAnalysis);
  };

  const quizQuestions = [
    {
      question: "What is the main lifetime concern with 'char* strcpy(char* dest, const char* src)'?",
      options: [
        "The return type is unsafe",
        "Source buffer might be too small",
        "Destination buffer might be too small",
        "No lifetime concerns"
      ],
      correct: 2,
      explanation: "strcpy doesn't check bounds, so the destination buffer might be too small, leading to buffer overflow."
    },
    {
      question: "Why is 'const std::string& param' generally safer than 'std::string* param'?",
      options: [
        "References can't be null",
        "const prevents modification",
        "References have automatic lifetime tracking",
        "All of the above"
      ],
      correct: 3,
      explanation: "References can't be null, const prevents unintended modification, and references provide clearer lifetime semantics."
    },
    {
      question: "What's the primary risk with 'std::string_view getName()' as a return type?",
      options: [
        "Performance overhead",
        "The viewed string might be destroyed",
        "string_view is always unsafe",
        "Memory allocation issues"
      ],
      correct: 1,
      explanation: "string_view is a non-owning view, so the underlying string must remain valid for the lifetime of the view."
    },
    {
      question: "In 'void process(std::shared_ptr<T>& ptr)', why is the reference used?",
      options: [
        "Better performance than copying",
        "Allows modification of the shared_ptr itself",
        "Prevents null pointer access",
        "Both A and B"
      ],
      correct: 3,
      explanation: "Using a reference avoids copying the shared_ptr and allows the function to modify the shared_ptr itself (like resetting it)."
    },
    {
      question: "What makes 'const T* func()' potentially problematic?",
      options: [
        "const is unnecessary",
        "Lifetime of returned object is unclear",
        "Should return by value instead",
        "Pointer could be null"
      ],
      correct: 1,
      explanation: "Returning a pointer (even const) doesn't clarify who owns the object or how long it remains valid."
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
      <Title>Lesson 52: Interactive Function Signature Analyzer</Title>
      
      <Description>
        <h3>Analyzing Parameter Lifetimes and Safety</h3>
        <p>
          Function signatures encode crucial information about parameter lifetimes, ownership,
          and potential safety issues. This interactive lesson teaches you to analyze function
          signatures for lifetime management patterns, identify potential issues, and understand
          the implications of different parameter and return types.
        </p>
        
        <h4>Key Analysis Points:</h4>
        <ul>
          <li><strong>Pointer vs Reference:</strong> Nullability and lifetime semantics</li>
          <li><strong>const-correctness:</strong> Mutation intentions and safety guarantees</li>
          <li><strong>Smart pointer usage:</strong> Ownership transfer and sharing patterns</li>
          <li><strong>View types:</strong> Non-owning access and lifetime dependencies</li>
        </ul>
      </Description>

      <InteractiveSection>
        <SignatureInput>
          <h3>Function Signature Input</h3>
          <SignatureTextArea
            value={signatureInput}
            onChange={(e) => handleSignatureChange(e.target.value)}
            placeholder="Enter a C++ function signature, e.g.:&#10;void processData(const std::string&amp; input, int* result)"
          />
          
          <div style={{ marginTop: '10px' }}>
            <strong>Presets:</strong>
            {presetSignatures.map((preset, index) => (
              <PresetButton
                key={index}
                onClick={() => handleSignatureChange(preset)}
              >
                {preset.split('(')[0]}
              </PresetButton>
            ))}
          </div>
        </SignatureInput>

        <AnalysisOutput>
          <h3>Lifetime Analysis</h3>
          {analysis ? (
            <div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Function:</strong> {analysis.functionName}<br />
                <strong>Return Type:</strong> {analysis.returnType}<br />
                <strong>Safety Level:</strong> <span style={{ color: analysis.safetyLevel === 'safe' ? '#00ff00' : analysis.safetyLevel === 'warning' ? '#ffaa00' : '#ff0000' }}>
                  {analysis.safetyLevel.toUpperCase()}
                </span>
              </div>
              
              {analysis.parameters.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Parameters:</strong>
                  {analysis.parameters.map((param, index) => (
                    <div key={index} style={{ marginLeft: '20px', fontSize: '14px' }}>
                      • {param.name}: {param.type} 
                      ({param.lifetimeCategory}
                      {param.isPointer && ', pointer'}
                      {param.isReference && ', reference'}
                      {param.isConst && ', const'})
                    </div>
                  ))}
                </div>
              )}
              
              {analysis.lifetimeIssues.map((issue, index) => (
                <AnalysisItem key={index} type={issue.type}>
                  <strong>{issue.type.toUpperCase()}:</strong> {issue.message}
                  {issue.parameter && ` (Parameter: ${issue.parameter})`}
                </AnalysisItem>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888' }}>Enter a function signature to see the analysis...</p>
          )}
        </AnalysisOutput>
      </InteractiveSection>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <LifetimeVisualization analysis={analysis} />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </VisualizationContainer>

      <h3>Common Signature Patterns</h3>
      <CodeBlock>
        <code>
{`// Input parameters - safe patterns
void processData(const std::string& input);          // Safe: const reference
void calculate(const std::vector<int>& data);        // Safe: const reference
void render(std::shared_ptr<const Texture> tex);     // Safe: shared ownership

// Output parameters - patterns to consider
bool tryParse(const std::string& input, int* result);     // OK: clear intent
void getData(std::vector<int>& output);                   // OK: reference for output
std::unique_ptr<Object> createObject(const Config& cfg); // Best: return ownership

// Input/Output parameters
void transform(std::vector<Point>& points);          // OK: clear mutation intent
void updateState(GameState& state, const Input& input); // OK: clear roles

// Problematic patterns
<span class="danger">char* getString();</span>                              // BAD: unclear ownership
<span class="danger">void process(std::string* data);</span>                   // BAD: unclear intent
<span class="danger">const Object* findObject(int id);</span>                 // BAD: unclear lifetime

// View parameters - lifetime dependencies
void display(std::string_view message);             // OK: short-lived usage
void process(std::span<const int> data);            // OK: clear non-owning intent
<span class="highlight">std::string_view getDescription() const;</span>       // CAUTION: lifetime dependency`}
        </code>
      </CodeBlock>

      <h3>Smart Pointer Patterns in Signatures</h3>
      <CodeBlock>
        <code>
{`// Shared ownership patterns
void addToCache(std::shared_ptr<Resource> resource);     // Value: shares ownership
void updateResource(std::shared_ptr<Resource>& resource); // Ref: may replace resource
void processResource(const std::shared_ptr<Resource>& resource); // Const ref: temporary access

// Unique ownership patterns  
std::unique_ptr<Object> factory();                      // Transfer ownership out
void consume(std::unique_ptr<Object> obj);              // Transfer ownership in
void processObject(Object& obj);                        // Use without ownership

// Weak reference patterns
void setCallback(std::weak_ptr<Observer> obs);          // Safe callback registration
void notifyObservers(const std::vector<std::weak_ptr<Observer>>& observers);

// Analysis of each pattern:
class SignatureAnalyzer {
public:
    // 1. By-value shared_ptr: Function becomes co-owner
    void store(std::shared_ptr<Data> data) {
        stored_data_ = data;  // Shares ownership
        // Pro: Clear ownership semantics
        // Con: Reference count increment/decrement
    }
    
    // 2. By-reference shared_ptr: Function may change ownership
    void replace(std::shared_ptr<Data>& data) {
        data = create_new_data();  // Caller's shared_ptr is modified
        // Pro: Can modify caller's pointer
        // Con: Unusual pattern, consider carefully
    }
    
    // 3. Const reference to shared_ptr: Temporary access
    void process(const std::shared_ptr<Data>& data) {
        // Use data without affecting reference count
        data->process();
        // Pro: No ref count changes, clear intent
        // Con: Still tied to shared_ptr ecosystem
    }
    
    // 4. Raw reference: Use without ownership concerns
    void transform(Data& data) {
        data.transform();
        // Pro: No ownership implications, fastest
        // Con: Caller must ensure lifetime
    }

private:
    std::shared_ptr<Data> stored_data_;
};`}
        </code>
      </CodeBlock>

      <h3>Lifetime Analysis Checklist</h3>
      <CodeBlock>
        <code>
{`// Systematic approach to analyzing function signatures
class LifetimeAnalysisChecklist {
public:
    // Return type analysis
    template<typename ReturnType>
    static void analyzeReturnType() {
        // Questions to ask:
        // 1. Who owns the returned object?
        // 2. How long is the returned object valid?
        // 3. Can the return value be null?
        // 4. Is the return value a view into something else?
    }
    
    // Parameter analysis
    template<typename ParamType>
    static void analyzeParameter(const std::string& paramName) {
        // Questions for each parameter:
        // 1. Is this input, output, or input/output?
        // 2. Can this parameter be null?
        // 3. Does the function modify this parameter?
        // 4. Does the function store this parameter?
        // 5. What lifetime relationship does this create?
    }
};

// Red flags in function signatures:
<span class="danger">// 1. Raw pointers with unclear ownership
void processBuffer(char* buffer);  // Who owns buffer? Can it be null?

// 2. Inconsistent const usage
void inconsistent(const int* ptr, int* other);  // Why is one const?

// 3. String pointers instead of string_view/reference  
void badString(const char* str);  // Use string_view for read-only
void betterString(std::string_view str);

// 4. Unclear output parameters
bool parseNumber(const std::string& input, int* result);  // OK
void parseNumber(const std::string& input, int& result);  // Better - can't be null

// 5. Returning references to temporaries (compilation error)
const std::string& getString() {
    return std::string("temporary");  // BUG: dangling reference
}</span>

// Green patterns - good signature design:
<span class="safe">// 1. Clear ownership with smart pointers
std::unique_ptr<Resource> createResource(const Config& config);

// 2. Const-correct input parameters
void processData(const std::vector<Data>& input);

// 3. Clear output semantics
std::optional<Result> tryOperation(const Input& input);

// 4. RAII-friendly patterns
void processWithCleanup(std::unique_ptr<Resource> resource);

// 5. View types for non-owning access
void displayMessage(std::string_view message);
void processArray(std::span<const int> data);</span>`}
        </code>
      </CodeBlock>

      <QuizContainer>
        <h3>Test Your Signature Analysis Skills</h3>
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