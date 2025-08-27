import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { THREE } from '../utils/three';

interface Lesson55Props {
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

const CodeInput = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid rgba(74, 158, 255, 0.3);
`;

const CodeTextArea = styled.textarea`
  width: 100%;
  height: 300px;
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

const AuditOutput = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  min-height: 300px;
  overflow-y: auto;
`;

const AuditItem = styled.div<{ severity: 'info' | 'warning' | 'error' }>`
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border-left: 4px solid ${props => 
    props.severity === 'info' ? '#4a9eff' :
    props.severity === 'warning' ? '#ffaa00' : '#ff0000'
  };
  background: ${props => 
    props.severity === 'info' ? 'rgba(74, 158, 255, 0.1)' :
    props.severity === 'warning' ? 'rgba(255, 170, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'
  };
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

interface OwnershipVisualizationProps {
  audit: OwnershipAudit | null;
}

interface OwnershipIssue {
  severity: 'info' | 'warning' | 'error';
  type: string;
  message: string;
  line?: number;
  suggestion?: string;
}

interface OwnershipAudit {
  issues: OwnershipIssue[];
  statistics: {
    totalPointers: number;
    smartPointers: number;
    rawPointers: number;
    ownershipScore: number;
  };
}

function OwnershipVisualization({ audit }: OwnershipVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  if (!audit) {
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
          Enter code to analyze ownership
        </Text>
      </group>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00ff00';
    if (score >= 60) return '#ffaa00';
    return '#ff0000';
  };

  const errorCount = audit.issues.filter(i => i.severity === 'error').length;
  const warningCount = audit.issues.filter(i => i.severity === 'warning').length;

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Ownership score visualization */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.3]} />
        <meshStandardMaterial 
          color={getScoreColor(audit.statistics.ownershipScore)} 
          transparent 
          opacity={0.7} 
        />
      </mesh>
      
      <Text
        position={[0, 1, 0.2]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {audit.statistics.ownershipScore}%
      </Text>
      
      {/* Statistics bars */}
      <group position={[0, -1, 0]}>
        <mesh position={[-1.5, 0, 0]}>
          <boxGeometry args={[0.5, Math.max(0.1, audit.statistics.smartPointers / 5), 0.5]} />
          <meshStandardMaterial color="#00ff00" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[-1.5, -1, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Smart: {audit.statistics.smartPointers}
        </Text>
        
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, Math.max(0.1, audit.statistics.rawPointers / 5), 0.5]} />
          <meshStandardMaterial color="#ff6b6b" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, -1, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Raw: {audit.statistics.rawPointers}
        </Text>
        
        <mesh position={[1.5, 0, 0]}>
          <boxGeometry args={[0.5, Math.max(0.1, errorCount / 2), 0.5]} />
          <meshStandardMaterial color="#ff0000" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[1.5, -1, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Errors: {errorCount}
        </Text>
      </group>
      
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
      >
        Ownership Analysis Complete
      </Text>
    </group>
  );
}

export default function Lesson55_OwnershipAuditSystem({ onComplete, isCompleted }: Lesson55Props) {
  const [codeInput, setCodeInput] = useState('');
  const [audit, setAudit] = useState<OwnershipAudit | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const presetCodes = [
    {
      name: "Memory Leak",
      code: `void processData() {
    int* data = new int[100];
    // Missing delete[] - memory leak
    if (some_condition) {
        return; // Early exit without cleanup
    }
    // delete[] data; // Never reached
}`
    },
    {
      name: "Double Delete",
      code: `void unsafeCode() {
    int* ptr = new int(42);
    delete ptr;
    delete ptr; // Double delete - undefined behavior
}`
    },
    {
      name: "Smart Pointer Usage",
      code: `void smartCode() {
    auto ptr = std::make_unique<int>(42);
    auto shared = std::make_shared<std::vector<int>>(100);
    // Automatic cleanup - no issues
}`
    },
    {
      name: "Mixed Ownership",
      code: `class MixedClass {
    int* raw_ptr;
    std::unique_ptr<int> smart_ptr;
public:
    MixedClass() : raw_ptr(new int(1)), smart_ptr(std::make_unique<int>(2)) {}
    ~MixedClass() { delete raw_ptr; } // Manual cleanup needed
};`
    }
  ];

  const analyzeOwnership = useCallback((code: string): OwnershipAudit => {
    const issues: OwnershipIssue[] = [];
    const lines = code.split('\n');
    
    let totalPointers = 0;
    let smartPointers = 0;
    let rawPointers = 0;
    
    // Simple pattern matching for demonstration
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();
      
      // Check for raw pointer allocations
      if (trimmed.includes('new ') && !trimmed.includes('std::')) {
        totalPointers++;
        rawPointers++;
        issues.push({
          severity: 'warning',
          type: 'Raw Allocation',
          message: 'Raw pointer allocation detected - consider using smart pointers',
          line: lineNumber,
          suggestion: 'Use std::make_unique or std::make_shared instead of raw new'
        });
      }
      
      // Check for smart pointers
      if (trimmed.includes('std::unique_ptr') || trimmed.includes('std::shared_ptr') || trimmed.includes('std::make_')) {
        totalPointers++;
        smartPointers++;
        issues.push({
          severity: 'info',
          type: 'Smart Pointer',
          message: 'Smart pointer usage detected - good practice',
          line: lineNumber
        });
      }
      
      // Check for delete without corresponding new
      if (trimmed.includes('delete ') && !code.includes('new ')) {
        issues.push({
          severity: 'error',
          type: 'Orphan Delete',
          message: 'Delete without corresponding allocation in visible scope',
          line: lineNumber,
          suggestion: 'Ensure every delete has a matching new, or use smart pointers'
        });
      }
      
      // Check for potential double delete
      const deleteMatches = code.match(/delete\s+(\w+);/g);
      if (deleteMatches) {
        const deletedVars = deleteMatches.map(match => match.match(/delete\s+(\w+);/)?.[1]).filter(Boolean);
        const duplicates = deletedVars.filter((item, index) => deletedVars.indexOf(item) !== index);
        if (duplicates.length > 0) {
          issues.push({
            severity: 'error',
            type: 'Double Delete',
            message: `Potential double delete detected for variable: ${duplicates[0]}`,
            line: lineNumber,
            suggestion: 'Set pointer to nullptr after delete, or use smart pointers'
          });
        }
      }
      
      // Check for memory leaks (new without delete)
      if (trimmed.includes('new ') && !code.includes('delete')) {
        issues.push({
          severity: 'error',
          type: 'Memory Leak',
          message: 'Allocation without corresponding deallocation detected',
          line: lineNumber,
          suggestion: 'Add delete statement or use RAII/smart pointers'
        });
      }
      
      // Check for early returns after allocation
      if (trimmed.includes('return') && code.substring(0, code.indexOf(trimmed)).includes('new ')) {
        const hasDeleteBefore = code.substring(0, code.indexOf(trimmed)).includes('delete');
        if (!hasDeleteBefore) {
          issues.push({
            severity: 'warning',
            type: 'Early Return',
            message: 'Early return after allocation may cause memory leak',
            line: lineNumber,
            suggestion: 'Ensure cleanup before early returns or use RAII'
          });
        }
      }
      
      // Check for raw pointers in class members
      if ((trimmed.includes('int*') || trimmed.includes('char*') || trimmed.includes('void*')) && 
          !trimmed.includes('std::')) {
        issues.push({
          severity: 'warning',
          type: 'Raw Member Pointer',
          message: 'Raw pointer as member variable - consider ownership semantics',
          line: lineNumber,
          suggestion: 'Use smart pointers for owned resources, raw pointers for non-owning references'
        });
      }
    });
    
    // Calculate ownership score
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const smartPointerRatio = totalPointers > 0 ? (smartPointers / totalPointers) : 1;
    
    let ownershipScore = 100;
    ownershipScore -= errorCount * 30; // Errors heavily penalized
    ownershipScore -= warningCount * 10; // Warnings moderately penalized
    ownershipScore += smartPointerRatio * 20; // Smart pointers boost score
    ownershipScore = Math.max(0, Math.min(100, ownershipScore));
    
    return {
      issues,
      statistics: {
        totalPointers,
        smartPointers,
        rawPointers,
        ownershipScore: Math.round(ownershipScore)
      }
    };
  }, []);

  const handleCodeChange = (value: string) => {
    setCodeInput(value);
    if (value.trim()) {
      const newAudit = analyzeOwnership(value);
      setAudit(newAudit);
    } else {
      setAudit(null);
    }
  };

  const quizQuestions = [
    {
      question: "What is the primary goal of an ownership audit system?",
      options: [
        "Improve code performance",
        "Detect memory management issues and ownership violations",
        "Format code automatically",
        "Generate documentation"
      ],
      correct: 1,
      explanation: "Ownership audit systems analyze code to detect memory leaks, double deletes, dangling pointers, and other ownership-related issues."
    },
    {
      question: "Which pattern indicates a potential memory leak?",
      options: [
        "new followed by delete in the same scope",
        "std::make_unique usage",
        "new without corresponding delete",
        "Using references instead of pointers"
      ],
      correct: 2,
      explanation: "When 'new' is used without a corresponding 'delete', it typically indicates a memory leak."
    },
    {
      question: "What makes smart pointers preferable in ownership analysis?",
      options: [
        "They are faster than raw pointers",
        "They provide automatic lifetime management and clear ownership semantics",
        "They use less memory",
        "They prevent all bugs"
      ],
      correct: 1,
      explanation: "Smart pointers provide RAII (automatic cleanup) and make ownership relationships explicit in the code."
    },
    {
      question: "How should an ownership audit handle early returns after allocation?",
      options: [
        "Ignore them completely",
        "Flag as potential memory leak if no cleanup before return",
        "Always mark as errors",
        "Recommend removing early returns"
      ],
      correct: 1,
      explanation: "Early returns after allocation can cause memory leaks if cleanup doesn't happen before the return statement."
    },
    {
      question: "What information should an ownership audit system track?",
      options: [
        "Only memory allocations",
        "Only smart pointer usage",
        "Allocations, deallocations, ownership transfers, and lifetime relationships",
        "Only compilation errors"
      ],
      correct: 2,
      explanation: "A comprehensive audit tracks the full lifecycle of resources including allocation, ownership transfers, and cleanup."
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
      <Title>Lesson 55: Ownership Audit System</Title>
      
      <Description>
        <h3>Automated Analysis of Memory Management and Ownership</h3>
        <p>
          An ownership audit system analyzes code to detect memory management issues,
          ownership violations, and potential bugs. This interactive lesson demonstrates
          how such systems work and teaches you to identify common ownership problems
          in C++ code through automated analysis.
        </p>
        
        <h4>Audit Categories:</h4>
        <ul>
          <li><strong>Memory Leaks:</strong> Allocations without corresponding deallocations</li>
          <li><strong>Double Deletes:</strong> Multiple deallocations of the same memory</li>
          <li><strong>Dangling Pointers:</strong> Access to deallocated memory</li>
          <li><strong>Ownership Clarity:</strong> Clear vs ambiguous ownership patterns</li>
        </ul>
      </Description>

      <InteractiveSection>
        <CodeInput>
          <h3>Code Analysis Input</h3>
          <CodeTextArea
            value={codeInput}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="Enter C++ code to analyze for ownership issues...&#10;&#10;Example:&#10;void func() {&#10;    int* ptr = new int(42);&#10;    // Missing delete - memory leak&#10;}"
          />
          
          <div style={{ marginTop: '10px' }}>
            <strong>Presets:</strong>
            {presetCodes.map((preset, index) => (
              <PresetButton
                key={index}
                onClick={() => handleCodeChange(preset.code)}
              >
                {preset.name}
              </PresetButton>
            ))}
          </div>
        </CodeInput>

        <AuditOutput>
          <h3>Ownership Audit Results</h3>
          {audit ? (
            <div>
              <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(74, 158, 255, 0.1)', borderRadius: '5px' }}>
                <strong>Statistics:</strong><br />
                Total Pointers: {audit.statistics.totalPointers}<br />
                Smart Pointers: {audit.statistics.smartPointers}<br />
                Raw Pointers: {audit.statistics.rawPointers}<br />
                <strong>Ownership Score: {audit.statistics.ownershipScore}%</strong>
              </div>
              
              {audit.issues.length > 0 ? (
                <div>
                  <strong>Issues Found:</strong>
                  {audit.issues.map((issue, index) => (
                    <AuditItem key={index} severity={issue.severity}>
                      <strong>[{issue.severity.toUpperCase()}] {issue.type}</strong>
                      {issue.line && ` (Line ${issue.line})`}<br />
                      {issue.message}
                      {issue.suggestion && (
                        <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#ccc' }}>
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </div>
                      )}
                    </AuditItem>
                  ))}
                </div>
              ) : (
                <AuditItem severity="info">
                  <strong>No Issues Found</strong><br />
                  The code appears to follow good ownership practices.
                </AuditItem>
              )}
            </div>
          ) : (
            <p style={{ color: '#888' }}>Enter code to see the ownership analysis...</p>
          )}
        </AuditOutput>
      </InteractiveSection>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
          <OwnershipVisualization audit={audit} />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </VisualizationContainer>

      <h3>Ownership Audit Implementation</h3>
      <CodeBlock>
        <code>
{`#include <memory>
#include <vector>
#include <unordered_map>
#include <string>
#include <regex>

// Ownership audit system implementation
class OwnershipAuditor {
public:
    enum class IssueType {
        MEMORY_LEAK,
        DOUBLE_DELETE,
        DANGLING_POINTER,
        UNCLEAR_OWNERSHIP,
        EXCEPTION_UNSAFE,
        RAW_POINTER_USAGE
    };
    
    enum class Severity {
        INFO,
        WARNING,
        ERROR,
        CRITICAL
    };
    
    struct Issue {
        IssueType type;
        Severity severity;
        std::string message;
        std::string suggestion;
        int line_number;
        std::string code_snippet;
    };
    
    struct AuditResult {
        std::vector<Issue> issues;
        double ownership_score;
        std::unordered_map<std::string, int> statistics;
    };

private:
    std::vector<Issue> issues_;
    std::unordered_map<std::string, int> allocations_;
    std::unordered_map<std::string, int> deallocations_;
    int raw_pointer_count_ = 0;
    int smart_pointer_count_ = 0;
    
public:
    AuditResult analyzeCode(const std::string& code) {
        issues_.clear();
        allocations_.clear();
        deallocations_.clear();
        raw_pointer_count_ = 0;
        smart_pointer_count_ = 0;
        
        // Analyze line by line
        std::istringstream stream(code);
        std::string line;
        int line_number = 1;
        
        while (std::getline(stream, line)) {
            analyzeLine(line, line_number);
            ++line_number;
        }
        
        // Perform cross-line analysis
        detectMemoryLeaks();
        detectDoubleDeletes();
        calculateOwnershipScore();
        
        return createAuditResult();
    }

private:
    void analyzeLine(const std::string& line, int line_number) {
        // Check for raw pointer allocations
        std::regex new_pattern(R"(\\b(\\w+)\\s*=\\s*new\\b)");
        std::smatch match;
        
        if (std::regex_search(line, match, new_pattern)) {
            std::string var_name = match[1].str();
            allocations_[var_name] = line_number;
            raw_pointer_count_++;
            
            addIssue(IssueType::RAW_POINTER_USAGE, Severity::WARNING,
                    "Raw pointer allocation detected",
                    "Consider using std::make_unique or std::make_shared",
                    line_number, line);
        }
        
        // Check for smart pointer usage
        if (line.find("std::unique_ptr") != std::string::npos ||
            line.find("std::shared_ptr") != std::string::npos ||
            line.find("std::make_unique") != std::string::npos ||
            line.find("std::make_shared") != std::string::npos) {
            
            smart_pointer_count_++;
            addIssue(IssueType::UNCLEAR_OWNERSHIP, Severity::INFO,
                    "Smart pointer usage detected - good practice",
                    "", line_number, line);
        }
        
        // Check for delete statements
        std::regex delete_pattern(R"(delete\\s+(\\w+))");
        if (std::regex_search(line, match, delete_pattern)) {
            std::string var_name = match[1].str();
            deallocations_[var_name] = line_number;
        }
        
        // Check for array delete
        std::regex delete_array_pattern(R"(delete\\[\\]\\s+(\\w+))");
        if (std::regex_search(line, match, delete_array_pattern)) {
            std::string var_name = match[1].str();
            deallocations_[var_name] = line_number;
        }
        
        // Check for early returns
        if (line.find("return") != std::string::npos) {
            if (hasUncleanedAllocations(line_number)) {
                addIssue(IssueType::MEMORY_LEAK, Severity::WARNING,
                        "Early return may cause memory leak",
                        "Ensure cleanup before return or use RAII",
                        line_number, line);
            }
        }
        
        // Check for exception-unsafe patterns
        if (line.find("throw") != std::string::npos || 
            line.find("catch") != std::string::npos) {
            if (hasRawAllocations()) {
                addIssue(IssueType::EXCEPTION_UNSAFE, Severity::ERROR,
                        "Exception handling with raw pointers is unsafe",
                        "Use RAII and smart pointers for exception safety",
                        line_number, line);
            }
        }
    }
    
    void detectMemoryLeaks() {
        for (const auto& [var_name, alloc_line] : allocations_) {
            if (deallocations_.find(var_name) == deallocations_.end()) {
                addIssue(IssueType::MEMORY_LEAK, Severity::ERROR,
                        "Memory leak: allocation without deallocation",
                        "Add corresponding delete or use smart pointers",
                        alloc_line, "");
            }
        }
    }
    
    void detectDoubleDeletes() {
        std::unordered_map<std::string, int> delete_counts;
        
        for (const auto& [var_name, dealloc_line] : deallocations_) {
            delete_counts[var_name]++;
            
            if (delete_counts[var_name] > 1) {
                addIssue(IssueType::DOUBLE_DELETE, Severity::CRITICAL,
                        "Double delete detected",
                        "Set pointer to nullptr after delete",
                        dealloc_line, "");
            }
        }
    }
    
    bool hasUncleanedAllocations(int before_line) const {
        for (const auto& [var_name, alloc_line] : allocations_) {
            if (alloc_line < before_line) {
                auto dealloc_it = deallocations_.find(var_name);
                if (dealloc_it == deallocations_.end() || 
                    dealloc_it->second > before_line) {
                    return true;
                }
            }
        }
        return false;
    }
    
    bool hasRawAllocations() const {
        return raw_pointer_count_ > 0;
    }
    
    void addIssue(IssueType type, Severity severity, 
                  const std::string& message, const std::string& suggestion,
                  int line_number, const std::string& code_snippet) {
        issues_.push_back({type, severity, message, suggestion, 
                          line_number, code_snippet});
    }
    
    void calculateOwnershipScore() {
        // Implementation of scoring algorithm
    }
    
    AuditResult createAuditResult() {
        AuditResult result;
        result.issues = issues_;
        
        // Calculate statistics
        result.statistics["total_pointers"] = raw_pointer_count_ + smart_pointer_count_;
        result.statistics["raw_pointers"] = raw_pointer_count_;
        result.statistics["smart_pointers"] = smart_pointer_count_;
        result.statistics["memory_leaks"] = countIssuesOfType(IssueType::MEMORY_LEAK);
        result.statistics["double_deletes"] = countIssuesOfType(IssueType::DOUBLE_DELETE);
        
        // Calculate ownership score (0-100)
        int total_issues = issues_.size();
        int critical_issues = countIssuesBySeverity(Severity::CRITICAL);
        int error_issues = countIssuesBySeverity(Severity::ERROR);
        
        double base_score = 100.0;
        base_score -= critical_issues * 40;
        base_score -= error_issues * 20;
        base_score -= (total_issues - critical_issues - error_issues) * 5;
        
        // Bonus for smart pointer usage
        if (smart_pointer_count_ > raw_pointer_count_) {
            base_score += 10;
        }
        
        result.ownership_score = std::max(0.0, std::min(100.0, base_score));
        
        return result;
    }
    
    int countIssuesOfType(IssueType type) const {
        return std::count_if(issues_.begin(), issues_.end(),
                           [type](const Issue& issue) {
                               return issue.type == type;
                           });
    }
    
    int countIssuesBySeverity(Severity severity) const {
        return std::count_if(issues_.begin(), issues_.end(),
                           [severity](const Issue& issue) {
                               return issue.severity == severity;
                           });
    }
};`}
        </code>
      </CodeBlock>

      <h3>Advanced Ownership Analysis</h3>
      <CodeBlock>
        <code>
{`// Advanced ownership patterns and analysis
class AdvancedOwnershipAnalyzer {
public:
    // Analyze ownership transfer patterns
    struct OwnershipTransfer {
        std::string from_variable;
        std::string to_variable;
        std::string transfer_type; // "move", "copy", "release"
        int line_number;
    };
    
    // Track object lifetimes across scopes
    class LifetimeTracker {
        struct ObjectInfo {
            std::string name;
            std::string type;
            int birth_line;
            int death_line = -1;
            bool is_moved = false;
            std::vector<std::string> references;
        };
        
        std::unordered_map<std::string, ObjectInfo> objects_;
        
    public:
        void recordBirth(const std::string& name, const std::string& type, int line) {
            objects_[name] = {name, type, line, -1, false, {}};
        }
        
        void recordDeath(const std::string& name, int line) {
            if (objects_.find(name) != objects_.end()) {
                objects_[name].death_line = line;
            }
        }
        
        void recordMove(const std::string& from, const std::string& to, int line) {
            if (objects_.find(from) != objects_.end()) {
                objects_[from].is_moved = true;
                recordBirth(to, objects_[from].type, line);
            }
        }
        
        void recordReference(const std::string& object, const std::string& reference) {
            if (objects_.find(object) != objects_.end()) {
                objects_[object].references.push_back(reference);
            }
        }
        
        std::vector<std::string> findDanglingReferences() const {
            std::vector<std::string> dangling;
            
            for (const auto& [name, info] : objects_) {
                if (info.death_line != -1 || info.is_moved) {
                    for (const auto& ref : info.references) {
                        dangling.push_back(ref + " -> " + name);
                    }
                }
            }
            
            return dangling;
        }
    };
    
    // Analyze circular reference patterns
    class CircularReferenceDetector {
        std::unordered_map<std::string, std::vector<std::string>> ownership_graph_;
        
    public:
        void addOwnershipEdge(const std::string& owner, const std::string& owned) {
            ownership_graph_[owner].push_back(owned);
        }
        
        std::vector<std::vector<std::string>> findCycles() {
            std::vector<std::vector<std::string>> cycles;
            std::unordered_set<std::string> visited;
            std::unordered_set<std::string> in_stack;
            std::vector<std::string> path;
            
            for (const auto& [node, _] : ownership_graph_) {
                if (visited.find(node) == visited.end()) {
                    detectCyclesDFS(node, visited, in_stack, path, cycles);
                }
            }
            
            return cycles;
        }
        
    private:
        void detectCyclesDFS(const std::string& node,
                           std::unordered_set<std::string>& visited,
                           std::unordered_set<std::string>& in_stack,
                           std::vector<std::string>& path,
                           std::vector<std::vector<std::string>>& cycles) {
            visited.insert(node);
            in_stack.insert(node);
            path.push_back(node);
            
            if (ownership_graph_.find(node) != ownership_graph_.end()) {
                for (const auto& neighbor : ownership_graph_[node]) {
                    if (in_stack.find(neighbor) != in_stack.end()) {
                        // Found cycle
                        auto cycle_start = std::find(path.begin(), path.end(), neighbor);
                        cycles.push_back(std::vector<std::string>(cycle_start, path.end()));
                    } else if (visited.find(neighbor) == visited.end()) {
                        detectCyclesDFS(neighbor, visited, in_stack, path, cycles);
                    }
                }
            }
            
            path.pop_back();
            in_stack.erase(node);
        }
    };
    
    // Resource leak detector with exception paths
    class ResourceLeakDetector {
        struct Resource {
            std::string name;
            std::string type;
            int allocation_line;
            bool has_cleanup;
            std::vector<int> cleanup_lines;
            std::vector<int> exception_paths;
        };
        
        std::vector<Resource> resources_;
        
    public:
        void addResource(const std::string& name, const std::string& type, int line) {
            resources_.push_back({name, type, line, false, {}, {}});
        }
        
        void addCleanup(const std::string& name, int line) {
            for (auto& resource : resources_) {
                if (resource.name == name) {
                    resource.has_cleanup = true;
                    resource.cleanup_lines.push_back(line);
                }
            }
        }
        
        void addExceptionPath(const std::string& resource_name, int line) {
            for (auto& resource : resources_) {
                if (resource.name == resource_name) {
                    resource.exception_paths.push_back(line);
                }
            }
        }
        
        std::vector<std::string> findLeaks() const {
            std::vector<std::string> leaks;
            
            for (const auto& resource : resources_) {
                if (!resource.has_cleanup) {
                    leaks.push_back("Resource '" + resource.name + 
                                  "' allocated at line " + std::to_string(resource.allocation_line) +
                                  " never cleaned up");
                }
                
                if (!resource.exception_paths.empty() && resource.cleanup_lines.empty()) {
                    leaks.push_back("Resource '" + resource.name + 
                                  "' may leak on exception paths");
                }
            }
            
            return leaks;
        }
    };
};

// Integration example
void demonstrateAdvancedAnalysis() {
    AdvancedOwnershipAnalyzer analyzer;
    AdvancedOwnershipAnalyzer::LifetimeTracker tracker;
    AdvancedOwnershipAnalyzer::CircularReferenceDetector cycle_detector;
    AdvancedOwnershipAnalyzer::ResourceLeakDetector leak_detector;
    
    // Simulate analysis of problematic code
    tracker.recordBirth("ptr1", "std::shared_ptr<Node>", 10);
    tracker.recordBirth("ptr2", "std::shared_ptr<Node>", 11);
    
    // Circular reference
    cycle_detector.addOwnershipEdge("ptr1", "ptr2");
    cycle_detector.addOwnershipEdge("ptr2", "ptr1");
    
    auto cycles = cycle_detector.findCycles();
    if (!cycles.empty()) {
        std::cout << "Circular reference detected!\\n";
    }
    
    // Resource leak analysis
    leak_detector.addResource("file_handle", "FILE*", 20);
    leak_detector.addExceptionPath("file_handle", 25); // Exception possible
    // Missing cleanup registration
    
    auto leaks = leak_detector.findLeaks();
    for (const auto& leak : leaks) {
        std::cout << "Leak: " << leak << "\\n";
    }
}`}
        </code>
      </CodeBlock>

      <QuizContainer>
        <h3>Test Your Ownership Audit Knowledge</h3>
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