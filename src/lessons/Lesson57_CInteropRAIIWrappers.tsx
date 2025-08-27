import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { THREE } from '../utils/three';

interface Lesson57Props {
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

interface CInteropVisualizationProps {
  wrapperType: 'basic' | 'raii' | 'exception_safe';
}

function CInteropVisualization({ wrapperType }: CInteropVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const getWrapperColor = () => {
    switch (wrapperType) {
      case 'basic': return '#ff6b6b';
      case 'raii': return '#4a9eff';
      case 'exception_safe': return '#50c878';
      default: return '#ffffff';
    }
  };

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {/* C Library */}
      <group position={[-3, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 2, 1]} />
          <meshStandardMaterial color="#666666" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          C Library
        </Text>
      </group>
      
      {/* RAII Wrapper */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[2, 1.5, 1]} />
          <meshStandardMaterial color={getWrapperColor()} transparent opacity={0.7} />
        </mesh>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {wrapperType.replace('_', ' ').toUpperCase()}
        </Text>
      </group>
      
      {/* C++ Code */}
      <group position={[3, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 2, 1]} />
          <meshStandardMaterial color="#4a9eff" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          C++ Code
        </Text>
      </group>
      
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color={getWrapperColor()}
        anchorX="center"
        anchorY="middle"
      >
        C Interop Pattern: {wrapperType.replace('_', ' ')}
      </Text>
    </group>
  );
}

export default function Lesson57_CInteropRAIIWrappers({ onComplete, isCompleted }: Lesson57Props) {
  const [currentWrapper, setCurrentWrapper] = useState<'basic' | 'raii' | 'exception_safe'>('basic');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const wrapperTypes: Array<'basic' | 'raii' | 'exception_safe'> = ['basic', 'raii', 'exception_safe'];

  const quizQuestions = [
    {
      question: "What is the main challenge when integrating C libraries with C++?",
      options: [
        "Performance differences",
        "C libraries don't support RAII and can throw exceptions across boundaries",
        "Syntax incompatibility",
        "Memory alignment issues"
      ],
      correct: 1,
      explanation: "C libraries don't follow RAII principles and may not handle C++ exceptions properly, requiring careful wrapper design."
    },
    {
      question: "Why should C++ exceptions not cross C library boundaries?",
      options: [
        "C libraries are slower with exceptions",
        "C doesn't understand C++ exception handling mechanisms",
        "It's a style preference",
        "Exceptions don't work in C libraries"
      ],
      correct: 1,
      explanation: "C libraries don't understand C++ exception unwinding, which can lead to resource leaks and undefined behavior."
    },
    {
      question: "What makes a good RAII wrapper for C resources?",
      options: [
        "Automatic resource cleanup in destructor",
        "Exception safety",
        "Clear ownership semantics",
        "All of the above"
      ],
      correct: 3,
      explanation: "A good RAII wrapper provides automatic cleanup, exception safety, and clear ownership semantics for C resources."
    },
    {
      question: "How should errors be handled when calling C functions from C++ wrappers?",
      options: [
        "Let C functions throw exceptions directly",
        "Check return codes and convert to C++ exceptions",
        "Ignore errors in wrapper layer",
        "Use global error variables"
      ],
      correct: 1,
      explanation: "C functions typically return error codes, which should be checked and converted to appropriate C++ exceptions."
    },
    {
      question: "What is the purpose of 'extern C' linkage in C++ wrappers?",
      options: [
        "Improve performance",
        "Prevent name mangling and ensure C-compatible function signatures",
        "Enable template usage",
        "Allow operator overloading"
      ],
      correct: 1,
      explanation: "'extern C' prevents C++ name mangling, ensuring the functions can be called from C code with predictable names."
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
      <Title>Lesson 57: C Interop with RAII Wrappers</Title>
      
      <Description>
        <h3>Safe Integration of C Libraries with C++</h3>
        <p>
          Integrating C libraries with C++ requires careful consideration of resource management,
          exception safety, and ABI compatibility. RAII wrappers provide a safe bridge between
          C's manual resource management and C++'s automatic resource management, ensuring
          proper cleanup even in the presence of exceptions.
        </p>
        
        <h4>Key Challenges:</h4>
        <ul>
          <li><strong>Resource management:</strong> C uses manual malloc/free, C++ uses RAII</li>
          <li><strong>Exception safety:</strong> C doesn't understand C++ exceptions</li>
          <li><strong>Error handling:</strong> C uses return codes, C++ uses exceptions</li>
          <li><strong>ABI compatibility:</strong> Ensuring stable interfaces across boundaries</li>
        </ul>
      </Description>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <CInteropVisualization wrapperType={currentWrapper} />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </VisualizationContainer>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        {wrapperTypes.map(type => (
          <button
            key={type}
            onClick={() => setCurrentWrapper(type)}
            style={{
              padding: '10px 15px',
              background: currentWrapper === type ? '#4a9eff' : 'rgba(74, 158, 255, 0.3)',
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

      <h3>Basic RAII Wrappers for C Resources</h3>
      <CodeBlock>
        <code>
{`// Example C library interface (FILE operations)
extern "C" {
    typedef struct FILE_HANDLE* FileHandle;
    
    FileHandle file_open(const char* filename, const char* mode);
    int file_close(FileHandle handle);
    int file_read(FileHandle handle, void* buffer, size_t size);
    int file_write(FileHandle handle, const void* buffer, size_t size);
    const char* file_get_error();
}

// RAII wrapper for C file operations
class FileWrapper {
private:
    FileHandle handle_;
    
public:
    // Constructor acquires resource
    explicit FileWrapper(const std::string& filename, const std::string& mode) {
        handle_ = file_open(filename.c_str(), mode.c_str());
        if (!handle_) {
            throw std::runtime_error("Failed to open file: " + 
                                   std::string(file_get_error()));
        }
    }
    
    // Destructor releases resource automatically
    ~FileWrapper() {
        if (handle_) {
            file_close(handle_);  // Always cleanup, even if exceptions occur
        }
    }
    
    // Delete copy operations to prevent double-close
    FileWrapper(const FileWrapper&) = delete;
    FileWrapper& operator=(const FileWrapper&) = delete;
    
    // Move operations for ownership transfer
    FileWrapper(FileWrapper&& other) noexcept : handle_(other.handle_) {
        other.handle_ = nullptr;  // Transfer ownership
    }
    
    FileWrapper& operator=(FileWrapper&& other) noexcept {
        if (this != &other) {
            if (handle_) {
                file_close(handle_);  // Close current file
            }
            handle_ = other.handle_;
            other.handle_ = nullptr;
        }
        return *this;
    }
    
    // Safe access methods with error checking
    std::vector<uint8_t> read(size_t size) {
        std::vector<uint8_t> buffer(size);
        int result = file_read(handle_, buffer.data(), size);
        
        if (result < 0) {
            throw std::runtime_error("File read error: " + 
                                   std::string(file_get_error()));
        }
        
        buffer.resize(result);  // Adjust to actual bytes read
        return buffer;
    }
    
    void write(const std::vector<uint8_t>& data) {
        int result = file_write(handle_, data.data(), data.size());
        
        if (result < 0) {
            throw std::runtime_error("File write error: " + 
                                   std::string(file_get_error()));
        }
    }
    
    // Check if wrapper holds valid resource
    bool is_valid() const { return handle_ != nullptr; }
    
    // Get underlying handle (use with caution)
    FileHandle get_handle() const { return handle_; }
};`}
        </code>
      </CodeBlock>

      <h3>Exception-Safe Patterns</h3>
      <CodeBlock>
        <code>
{`// Advanced RAII patterns for complex C library integration
template<typename Handle, typename Deleter>
class unique_c_ptr {
private:
    Handle handle_;
    Deleter deleter_;
    
public:
    explicit unique_c_ptr(Handle handle, Deleter deleter = Deleter{})
        : handle_(handle), deleter_(deleter) {}
    
    ~unique_c_ptr() {
        if (handle_) {
            deleter_(handle_);
        }
    }
    
    // Non-copyable, movable
    unique_c_ptr(const unique_c_ptr&) = delete;
    unique_c_ptr& operator=(const unique_c_ptr&) = delete;
    
    unique_c_ptr(unique_c_ptr&& other) noexcept 
        : handle_(other.handle_), deleter_(std::move(other.deleter_)) {
        other.handle_ = Handle{};
    }
    
    unique_c_ptr& operator=(unique_c_ptr&& other) noexcept {
        if (this != &other) {
            reset();
            handle_ = other.handle_;
            deleter_ = std::move(other.deleter_);
            other.handle_ = Handle{};
        }
        return *this;
    }
    
    Handle get() const { return handle_; }
    Handle release() {
        Handle temp = handle_;
        handle_ = Handle{};
        return temp;
    }
    
    void reset(Handle new_handle = Handle{}) {
        if (handle_) {
            deleter_(handle_);
        }
        handle_ = new_handle;
    }
    
    explicit operator bool() const { return handle_ != Handle{}; }
};

// Specialized deleters for different C resource types
struct FileDeleter {
    void operator()(FileHandle handle) {
        if (handle) file_close(handle);
    }
};

struct MemoryDeleter {
    void operator()(void* ptr) {
        if (ptr) free(ptr);
    }
};

// Type aliases for common C resource wrappers
using unique_file = unique_c_ptr<FileHandle, FileDeleter>;
using unique_malloc = unique_c_ptr<void*, MemoryDeleter>;

// Exception-safe factory functions
class CResourceFactory {
public:
    static unique_file createFile(const std::string& filename, const std::string& mode) {
        FileHandle handle = file_open(filename.c_str(), mode.c_str());
        if (!handle) {
            throw std::runtime_error("Failed to create file: " + 
                                   std::string(file_get_error()));
        }
        return unique_file(handle, FileDeleter{});
    }
    
    static unique_malloc allocateMemory(size_t size) {
        void* ptr = malloc(size);
        if (!ptr && size > 0) {
            throw std::bad_alloc();
        }
        return unique_malloc(ptr, MemoryDeleter{});
    }
    
    // Exception-safe multi-resource allocation
    struct DatabaseConnection {
        unique_file config_file;
        unique_malloc buffer;
        // More resources...
        
        DatabaseConnection(const std::string& config_path, size_t buffer_size) 
            : config_file(createFile(config_path, "r")),  // May throw
              buffer(allocateMemory(buffer_size)) {        // May throw
            // If second allocation throws, config_file is automatically cleaned up
        }
    };
};

// Error translation patterns
class CErrorTranslator {
public:
    // Convert C error codes to C++ exceptions
    static void checkError(int error_code) {
        switch (error_code) {
            case 0: return;  // Success
            case -1: throw std::runtime_error("General error: " + 
                                             std::string(file_get_error()));
            case -2: throw std::invalid_argument("Invalid argument");
            case -3: throw std::system_error(errno, std::system_category());
            default: throw std::runtime_error("Unknown error code: " + 
                                             std::to_string(error_code));
        }
    }
    
    // Exception-safe C function caller
    template<typename Func, typename... Args>
    static auto callCFunction(Func&& func, Args&&... args) -> decltype(func(args...)) {
        // Clear any existing error state
        errno = 0;
        
        auto result = func(std::forward<Args>(args)...);
        
        // Check for errors and translate to exceptions
        if constexpr (std::is_integral_v<decltype(result)>) {
            if (result < 0) {
                checkError(result);
            }
        }
        
        return result;
    }
};`}
        </code>
      </CodeBlock>

      <h3>Thread-Safe C Library Integration</h3>
      <CodeBlock>
        <code>
{`// Thread-safe wrappers for C libraries that aren't thread-safe
class ThreadSafeCWrapper {
private:
    mutable std::mutex mutex_;
    FileHandle handle_;
    
public:
    ThreadSafeCWrapper(const std::string& filename, const std::string& mode) {
        std::lock_guard<std::mutex> lock(mutex_);
        handle_ = file_open(filename.c_str(), mode.c_str());
        if (!handle_) {
            throw std::runtime_error("Failed to open file");
        }
    }
    
    ~ThreadSafeCWrapper() {
        std::lock_guard<std::mutex> lock(mutex_);
        if (handle_) {
            file_close(handle_);
        }
    }
    
    // Thread-safe operations
    std::vector<uint8_t> read(size_t size) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        std::vector<uint8_t> buffer(size);
        int result = CErrorTranslator::callCFunction(
            file_read, handle_, buffer.data(), size);
            
        buffer.resize(result);
        return buffer;
    }
    
    void write(const std::vector<uint8_t>& data) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        CErrorTranslator::callCFunction(
            file_write, handle_, data.data(), data.size());
    }
};

// RAII wrapper for C library initialization/cleanup
class CLibraryInitializer {
private:
    static std::atomic<int> instance_count_;
    static std::mutex init_mutex_;
    
public:
    CLibraryInitializer() {
        std::lock_guard<std::mutex> lock(init_mutex_);
        
        if (instance_count_.fetch_add(1) == 0) {
            // First instance - initialize library
            int result = library_initialize();
            if (result != 0) {
                instance_count_.fetch_sub(1);  // Rollback count
                throw std::runtime_error("Library initialization failed");
            }
        }
    }
    
    ~CLibraryInitializer() {
        std::lock_guard<std::mutex> lock(init_mutex_);
        
        if (instance_count_.fetch_sub(1) == 1) {
            // Last instance - cleanup library
            library_cleanup();
        }
    }
    
    // Non-copyable, non-movable for simplicity
    CLibraryInitializer(const CLibraryInitializer&) = delete;
    CLibraryInitializer& operator=(const CLibraryInitializer&) = delete;
};

std::atomic<int> CLibraryInitializer::instance_count_{0};
std::mutex CLibraryInitializer::init_mutex_;

// Example usage with automatic library lifetime management
class SafeCLibraryUser {
private:
    CLibraryInitializer initializer_;  // Ensures library is initialized
    unique_file file_;
    
public:
    SafeCLibraryUser(const std::string& filename) 
        : initializer_(),  // Library init before file operations
          file_(CResourceFactory::createFile(filename, "r")) {
    }
    
    // Library will be automatically cleaned up when last instance destructs
};

// Advanced: Exception boundary control
class ExceptionBoundary {
public:
    // Execute C++ code with exception boundary
    template<typename Func>
    static int executeCppCode(Func&& func) noexcept {
        try {
            func();
            return 0;  // Success
        } catch (const std::bad_alloc&) {
            return -1;  // Out of memory
        } catch (const std::invalid_argument&) {
            return -2;  // Invalid argument
        } catch (const std::exception&) {
            return -3;  // Other standard exception
        } catch (...) {
            return -99; // Unknown exception
        }
    }
};

// C-callable wrapper functions (for callbacks)
extern "C" {
    // Callback that can be safely called from C code
    int cpp_callback_wrapper(void* user_data, const char* message) {
        return ExceptionBoundary::executeCppCode([&]() {
            auto* callback = static_cast<std::function<void(const std::string&)>*>(user_data);
            (*callback)(std::string(message));
        });
    }
}

// Usage example
void demonstrateCallbackIntegration() {
    auto cpp_callback = [](const std::string& msg) {
        std::cout << "Received: " << msg << "\n";
        // This lambda can safely throw exceptions
    };
    
    // Register callback with C library
    // The wrapper ensures exceptions don't cross C boundary
    register_c_callback(cpp_callback_wrapper, &cpp_callback);
}`}
        </code>
      </CodeBlock>

      <QuizContainer>
        <h3>Test Your C Interop Knowledge</h3>
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