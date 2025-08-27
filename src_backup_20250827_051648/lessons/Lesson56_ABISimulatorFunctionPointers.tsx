import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson56Props {
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

interface ABIVisualizationProps {
  abiType: 'cdecl' | 'stdcall' | 'fastcall';
}

function ABIVisualization({ abiType }: ABIVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const getABIColor = () => {
    switch (abiType) {
      case 'cdecl': return '#4a9eff';
      case 'stdcall': return '#50c878';
      case 'fastcall': return '#ff9f40';
      default: return '#ffffff';
    }
  };

  const renderCallingConvention = () => {
    const description = {
      cdecl: 'Caller cleans stack\nRight-to-left params',
      stdcall: 'Callee cleans stack\nRight-to-left params', 
      fastcall: 'Registers + stack\nLeft-to-right optimization'
    };

    return (
      <group>
        {/* Function box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 1.5, 1]} />
          <meshStandardMaterial color={getABIColor()} transparent opacity={0.8} />
        </mesh>
        
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {abiType.toUpperCase()}
        </Text>
        
        {/* Stack visualization */}
        <group position={[0, -2.5, 0]}>
          {Array.from({ length: 3 }, (_, i) => (
            <mesh key={i} position={[0, i * 0.5, 0]}>
              <boxGeometry args={[2, 0.4, 0.5]} />
              <meshStandardMaterial color="#666666" transparent opacity={0.6} />
            </mesh>
          ))}
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Stack Layout
          </Text>
        </group>
        
        <Text
          position={[0, 2, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {description[abiType]}
        </Text>
      </group>
    );
  };

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      {renderCallingConvention()}
    </group>
  );
}

export default function Lesson56_ABISimulatorFunctionPointers({ onComplete, isCompleted }: Lesson56Props) {
  const [currentABI, setCurrentABI] = useState<'cdecl' | 'stdcall' | 'fastcall'>('cdecl');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const abiTypes: Array<'cdecl' | 'stdcall' | 'fastcall'> = ['cdecl', 'stdcall', 'fastcall'];

  const quizQuestions = [
    {
      question: "What is the main difference between cdecl and stdcall calling conventions?",
      options: [
        "Parameter passing order",
        "Stack cleanup responsibility", 
        "Return value handling",
        "Register usage"
      ],
      correct: 1,
      explanation: "In cdecl, the caller cleans up the stack, while in stdcall, the callee cleans up the stack."
    },
    {
      question: "Why are calling conventions important for function pointers across ABI boundaries?",
      options: [
        "Performance optimization",
        "Ensuring correct stack management and parameter passing",
        "Memory allocation",
        "Thread safety"
      ],
      correct: 1,
      explanation: "Calling conventions define how parameters are passed and stack is managed, critical for cross-ABI compatibility."
    },
    {
      question: "What happens if you call a stdcall function through a cdecl function pointer?",
      options: [
        "Performance degradation",
        "Compilation error",
        "Stack corruption and undefined behavior", 
        "Automatic conversion"
      ],
      correct: 2,
      explanation: "Mismatched calling conventions lead to stack corruption as each side has different cleanup expectations."
    },
    {
      question: "Which calling convention is typically used for Windows API functions?",
      options: [
        "cdecl",
        "stdcall",
        "fastcall",
        "vectorcall"
      ],
      correct: 1,
      explanation: "Windows API functions typically use the stdcall calling convention (often via WINAPI macro)."
    },
    {
      question: "How do modern C++ compilers handle ABI compatibility?",
      options: [
        "Name mangling and calling convention enforcement",
        "Automatic conversion between conventions",
        "Runtime detection",
        "All calling conventions are identical"
      ],
      correct: 0,
      explanation: "Compilers use name mangling to encode calling conventions and ensure ABI compatibility at link time."
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
      <Title>Lesson 56: ABI Simulator for Function Pointers</Title>
      
      <Description>
        <h3>Understanding Application Binary Interface Compatibility</h3>
        <p>
          The Application Binary Interface (ABI) defines how functions are called at the machine level,
          including parameter passing, stack management, and return value handling. Understanding ABI
          compatibility is crucial when working with function pointers across different compilation
          units, libraries, and language boundaries.
        </p>
        
        <h4>Key ABI Concepts:</h4>
        <ul>
          <li><strong>Calling conventions:</strong> Rules for parameter passing and stack cleanup</li>
          <li><strong>Name mangling:</strong> How function names are encoded for linking</li>
          <li><strong>Stack layout:</strong> How parameters and return addresses are organized</li>
          <li><strong>Register usage:</strong> Which registers are used for parameters and returns</li>
        </ul>
      </Description>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <ABIVisualization abiType={currentABI} />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </VisualizationContainer>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        {abiTypes.map(type => (
          <button
            key={type}
            onClick={() => setCurrentABI(type)}
            style={{
              padding: '10px 15px',
              background: currentABI === type ? '#4a9eff' : 'rgba(74, 158, 255, 0.3)',
              color: 'white',
              border: '1px solid rgba(74, 158, 255, 0.5)',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <h3>Calling Convention Fundamentals</h3>
      <CodeBlock>
        <code>
{`// Calling convention examples and ABI compatibility
#include <iostream>

// Different calling conventions (Windows-specific examples)
#ifdef _WIN32
    #define CDECL_CALL __cdecl
    #define STDCALL_CALL __stdcall  
    #define FASTCALL_CALL __fastcall
#else
    // On other platforms, these are typically ignored or mapped to default
    #define CDECL_CALL
    #define STDCALL_CALL
    #define FASTCALL_CALL
#endif

// Function definitions with different calling conventions
int CDECL_CALL cdecl_function(int a, int b, int c) {
    std::cout << "cdecl: caller cleans stack\\n";
    return a + b + c;
}

int STDCALL_CALL stdcall_function(int a, int b, int c) {
    std::cout << "stdcall: callee cleans stack\\n";
    return a + b + c;
}

int FASTCALL_CALL fastcall_function(int a, int b, int c) {
    std::cout << "fastcall: registers + stack optimization\\n";
    return a + b + c;
}

// Function pointer types with explicit calling conventions
typedef int (CDECL_CALL *CdeclFuncPtr)(int, int, int);
typedef int (STDCALL_CALL *StdcallFuncPtr)(int, int, int);
typedef int (FASTCALL_CALL *FastcallFuncPtr)(int, int, int);

void demonstrateCallingConventions() {
    // Correct function pointer assignments
    CdeclFuncPtr cdecl_ptr = cdecl_function;
    StdcallFuncPtr stdcall_ptr = stdcall_function;
    FastcallFuncPtr fastcall_ptr = fastcall_function;
    
    // Safe calls through correctly typed function pointers
    int result1 = cdecl_ptr(1, 2, 3);
    int result2 = stdcall_ptr(4, 5, 6);
    int result3 = fastcall_ptr(7, 8, 9);
    
    std::cout << "Results: " << result1 << ", " << result2 << ", " << result3 << "\\n";
    
    // DANGEROUS: Mismatched calling conventions
    // This would compile but cause undefined behavior:
    // CdeclFuncPtr wrong_ptr = (CdeclFuncPtr)stdcall_function;  // BAD!
    // int bad_result = wrong_ptr(1, 2, 3);  // Stack corruption!
}

// ABI-safe wrapper patterns
class ABISafeWrapper {
public:
    // Template wrapper that preserves calling convention
    template<typename FuncPtr>
    static auto createSafeWrapper(FuncPtr func) {
        return [func](auto... args) -> decltype(func(args...)) {
            // Wrapper preserves the original calling convention
            return func(args...);
        };
    }
    
    // Explicit conversion between calling conventions (dangerous!)
    template<typename TargetType, typename SourceType>
    static TargetType unsafeConvert(SourceType source) {
        // This is fundamentally unsafe and should be avoided
        // Only for demonstration of what NOT to do
        return reinterpret_cast<TargetType>(source);
    }
    
    // Safe adapter pattern
    template<typename SourceFunc>
    static auto createCdeclAdapter(SourceFunc source_func) {
        return [source_func](int a, int b, int c) -> int {
            // Adapter function uses cdecl convention
            // Calls source function with appropriate convention
            return source_func(a, b, c);
        };
    }
};`}
        </code>
      </CodeBlock>

      <h3>ABI Simulator Implementation</h3>
      <CodeBlock>
        <code>
{`// ABI simulator for understanding function call mechanics
class ABISimulator {
public:
    enum class CallingConvention {
        CDECL,
        STDCALL,
        FASTCALL,
        THISCALL  // For C++ member functions
    };
    
    struct StackFrame {
        std::vector<uint32_t> parameters;
        uint32_t return_address;
        uint32_t old_frame_pointer;
        std::vector<uint32_t> local_variables;
    };
    
    struct RegisterState {
        uint32_t eax, ebx, ecx, edx;  // General purpose
        uint32_t esp, ebp;            // Stack pointers
        uint32_t eip;                 // Instruction pointer
    };
    
    class VirtualStack {
        std::vector<uint32_t> stack_;
        size_t stack_pointer_;
        
    public:
        VirtualStack() : stack_(1024), stack_pointer_(1024) {}
        
        void push(uint32_t value) {
            if (stack_pointer_ > 0) {
                stack_[--stack_pointer_] = value;
            }
        }
        
        uint32_t pop() {
            if (stack_pointer_ < stack_.size()) {
                return stack_[stack_pointer_++];
            }
            return 0;
        }
        
        size_t getStackPointer() const { return stack_pointer_; }
        void setStackPointer(size_t sp) { stack_pointer_ = sp; }
        
        void dump() const {
            std::cout << "Stack contents (top to bottom):\\n";
            for (size_t i = stack_pointer_; i < std::min(stack_pointer_ + 10, stack_.size()); ++i) {
                std::cout << "  [" << i << "] = 0x" << std::hex << stack_[i] << std::dec << "\\n";
            }
        }
    };
    
private:
    VirtualStack stack_;
    RegisterState registers_;
    
public:
    // Simulate function call with specific calling convention
    void simulateCall(CallingConvention conv, 
                     const std::vector<uint32_t>& parameters,
                     uint32_t function_address) {
        
        std::cout << "\\n=== Simulating " << conventionName(conv) << " call ===\\n";
        
        size_t initial_sp = stack_.getStackPointer();
        
        switch (conv) {
            case CallingConvention::CDECL:
                simulateCdeclCall(parameters, function_address);
                break;
            case CallingConvention::STDCALL:
                simulateStdcallCall(parameters, function_address);
                break;
            case CallingConvention::FASTCALL:
                simulateFastcallCall(parameters, function_address);
                break;
            case CallingConvention::THISCALL:
                simulateThiscallCall(parameters, function_address);
                break;
        }
        
        std::cout << "Stack before call: " << initial_sp 
                  << ", after call: " << stack_.getStackPointer() << "\\n";
    }
    
private:
    void simulateCdeclCall(const std::vector<uint32_t>& params, uint32_t func_addr) {
        // Push parameters right-to-left
        for (auto it = params.rbegin(); it != params.rend(); ++it) {
            stack_.push(*it);
            std::cout << "Pushed parameter: 0x" << std::hex << *it << std::dec << "\\n";
        }
        
        // Push return address
        stack_.push(0x12345678);  // Fake return address
        std::cout << "Pushed return address\\n";
        
        // Function executes here (simulated)
        std::cout << "Function executing...\\n";
        
        // Function returns, return address is popped by RET instruction
        stack_.pop();
        
        // CDECL: Caller cleans up parameters
        for (size_t i = 0; i < params.size(); ++i) {
            stack_.pop();
        }
        std::cout << "Caller cleaned up " << params.size() << " parameters\\n";
    }
    
    void simulateStdcallCall(const std::vector<uint32_t>& params, uint32_t func_addr) {
        // Push parameters right-to-left (same as cdecl)
        for (auto it = params.rbegin(); it != params.rend(); ++it) {
            stack_.push(*it);
            std::cout << "Pushed parameter: 0x" << std::hex << *it << std::dec << "\\n";
        }
        
        stack_.push(0x12345678);  // Return address
        std::cout << "Pushed return address\\n";
        
        std::cout << "Function executing...\\n";
        
        // STDCALL: Function cleans up its own parameters
        // This would be done by "RET N" instruction where N = param_bytes
        stack_.pop();  // Return address
        for (size_t i = 0; i < params.size(); ++i) {
            stack_.pop();
        }
        std::cout << "Callee cleaned up " << params.size() << " parameters\\n";
    }
    
    void simulateFastcallCall(const std::vector<uint32_t>& params, uint32_t func_addr) {
        // First two parameters in registers ECX, EDX
        size_t reg_params = std::min(params.size(), size_t(2));
        
        if (reg_params > 0) {
            registers_.ecx = params[0];
            std::cout << "Parameter 1 in ECX: 0x" << std::hex << params[0] << std::dec << "\\n";
        }
        if (reg_params > 1) {
            registers_.edx = params[1];
            std::cout << "Parameter 2 in EDX: 0x" << std::hex << params[1] << std::dec << "\\n";
        }
        
        // Remaining parameters on stack (right-to-left)
        for (size_t i = params.size(); i > reg_params; --i) {
            stack_.push(params[i-1]);
            std::cout << "Pushed parameter " << i << ": 0x" 
                      << std::hex << params[i-1] << std::dec << "\\n";
        }
        
        stack_.push(0x12345678);  // Return address
        std::cout << "Function executing...\\n";
        
        // Callee cleans stack parameters (like stdcall)
        stack_.pop();  // Return address
        for (size_t i = reg_params; i < params.size(); ++i) {
            stack_.pop();
        }
        std::cout << "Callee cleaned up " << (params.size() - reg_params) 
                  << " stack parameters\\n";
    }
    
    void simulateThiscallCall(const std::vector<uint32_t>& params, uint32_t func_addr) {
        // 'this' pointer in ECX register
        if (!params.empty()) {
            registers_.ecx = params[0];  // 'this' pointer
            std::cout << "'this' pointer in ECX: 0x" << std::hex << params[0] << std::dec << "\\n";
            
            // Remaining parameters on stack right-to-left
            for (auto it = params.rbegin(); it != params.rend() - 1; ++it) {
                stack_.push(*it);
                std::cout << "Pushed parameter: 0x" << std::hex << *it << std::dec << "\\n";
            }
        }
        
        stack_.push(0x12345678);  // Return address
        std::cout << "Member function executing...\\n";
        
        // Callee cleans up (like stdcall, except 'this' is in register)
        stack_.pop();  // Return address
        for (size_t i = 1; i < params.size(); ++i) {  // Skip 'this'
            stack_.pop();
        }
        std::cout << "Callee cleaned up " << (params.size() - 1) << " parameters\\n";
    }
    
    const char* conventionName(CallingConvention conv) {
        switch (conv) {
            case CallingConvention::CDECL: return "cdecl";
            case CallingConvention::STDCALL: return "stdcall";
            case CallingConvention::FASTCALL: return "fastcall";
            case CallingConvention::THISCALL: return "thiscall";
            default: return "unknown";
        }
    }
    
public:
    void dumpState() {
        std::cout << "\\nRegister state:\\n";
        std::cout << "  EAX: 0x" << std::hex << registers_.eax << std::dec << "\\n";
        std::cout << "  ECX: 0x" << std::hex << registers_.ecx << std::dec << "\\n";
        std::cout << "  EDX: 0x" << std::hex << registers_.edx << std::dec << "\\n";
        std::cout << "  ESP: " << stack_.getStackPointer() << "\\n";
        
        stack_.dump();
    }
};

// Demonstration of ABI simulation
void demonstrateABISimulation() {
    ABISimulator simulator;
    
    std::vector<uint32_t> parameters = {0x100, 0x200, 0x300};  // 3 parameters
    
    // Simulate different calling conventions
    simulator.simulateCall(ABISimulator::CallingConvention::CDECL, 
                          parameters, 0x401000);
    simulator.dumpState();
    
    simulator.simulateCall(ABISimulator::CallingConvention::STDCALL, 
                          parameters, 0x401000);
    simulator.dumpState();
    
    simulator.simulateCall(ABISimulator::CallingConvention::FASTCALL, 
                          parameters, 0x401000);
    simulator.dumpState();
    
    // Simulate C++ member function call
    std::vector<uint32_t> member_params = {0x500, 0x600};  // this + 1 param
    simulator.simulateCall(ABISimulator::CallingConvention::THISCALL, 
                          member_params, 0x401000);
    simulator.dumpState();
}`}
        </code>
      </CodeBlock>

      <h3>Cross-Platform ABI Considerations</h3>
      <CodeBlock>
        <code>
{`// Cross-platform ABI compatibility patterns
class CrossPlatformABI {
public:
    // Portable function pointer wrapper
    template<typename ReturnType, typename... Args>
    class PortableFunctionPtr {
        void* function_ptr_;
        
    public:
        PortableFunctionPtr(void* ptr) : function_ptr_(ptr) {}
        
        // Platform-specific call implementation
        ReturnType operator()(Args... args) const {
#ifdef _WIN32
            // Windows-specific calling logic
            typedef ReturnType (__stdcall *WinFuncPtr)(Args...);
            auto win_func = reinterpret_cast<WinFuncPtr>(function_ptr_);
            return win_func(args...);
#else
            // Unix/Linux default calling convention
            typedef ReturnType (*UnixFuncPtr)(Args...);
            auto unix_func = reinterpret_cast<UnixFuncPtr>(function_ptr_);
            return unix_func(args...);
#endif
        }
    };
    
    // ABI-neutral interface definition
    struct ABINeutralInterface {
        // Use C-style function pointers for ABI stability
        typedef int (*ProcessFunc)(const void* input, void* output, size_t size);
        typedef void (*CleanupFunc)(void* resource);
        typedef void* (*AllocateFunc)(size_t size);
        
        ProcessFunc process;
        CleanupFunc cleanup;
        AllocateFunc allocate;
    };
    
    // Safe library loading with ABI checks
    class SafeLibraryLoader {
    public:
        struct LibraryInfo {
            void* library_handle;
            std::string abi_version;
            std::string calling_convention;
        };
        
        static LibraryInfo loadLibrary(const std::string& library_name) {
            LibraryInfo info = {};
            
#ifdef _WIN32
            info.library_handle = LoadLibraryA(library_name.c_str());
            info.calling_convention = "stdcall";  // Windows default
#else
            info.library_handle = dlopen(library_name.c_str(), RTLD_LAZY);
            info.calling_convention = "cdecl";    // Unix default
#endif
            
            if (!info.library_handle) {
                throw std::runtime_error("Failed to load library: " + library_name);
            }
            
            // Check ABI version
            auto get_version = getFunctionPointer<const char*()>(
                info.library_handle, "get_abi_version");
                
            if (get_version) {
                info.abi_version = get_version();
            }
            
            return info;
        }
        
        template<typename FuncType>
        static FuncType getFunctionPointer(void* lib_handle, const std::string& func_name) {
#ifdef _WIN32
            return reinterpret_cast<FuncType>(GetProcAddress(
                static_cast<HMODULE>(lib_handle), func_name.c_str()));
#else
            return reinterpret_cast<FuncType>(dlsym(lib_handle, func_name.c_str()));
#endif
        }
        
        static void unloadLibrary(void* lib_handle) {
#ifdef _WIN32
            FreeLibrary(static_cast<HMODULE>(lib_handle));
#else
            dlclose(lib_handle);
#endif
        }
    };
    
    // Example of ABI-safe plugin interface
    class PluginInterface {
    public:
        // C-style interface for ABI stability
        struct PluginVTable {
            int version;
            int (*initialize)(void* plugin_data);
            int (*process)(void* plugin_data, const void* input, void* output);
            void (*cleanup)(void* plugin_data);
        };
        
        class Plugin {
            PluginVTable* vtable_;
            void* plugin_data_;
            
        public:
            Plugin(PluginVTable* vtable, void* data) 
                : vtable_(vtable), plugin_data_(data) {
                
                if (vtable_->version != 1) {
                    throw std::runtime_error("Incompatible plugin ABI version");
                }
                
                if (vtable_->initialize(plugin_data_) != 0) {
                    throw std::runtime_error("Plugin initialization failed");
                }
            }
            
            ~Plugin() {
                if (vtable_ && vtable_->cleanup) {
                    vtable_->cleanup(plugin_data_);
                }
            }
            
            int process(const void* input, void* output) {
                return vtable_->process(plugin_data_, input, output);
            }
        };
    };
};

// Name mangling and symbol resolution
class SymbolResolver {
public:
    // Demonstrate C++ name mangling effects on ABI
    static void demonstrateNameMangling() {
        std::cout << "Function signatures and mangled names:\\n";
        
        // These functions would have different mangled names
        // int func(int) -> _Z4funci (GCC) or ?func@@YAHH@Z (MSVC)
        // int func(double) -> _Z4funcd (GCC) or ?func@@YAHN@Z (MSVC)  
        // void Class::method(int) -> _ZN5Class6methodEi (GCC)
        
        std::cout << "- int func(int): mangled name depends on compiler\\n";
        std::cout << "- int func(double): different mangling due to overloading\\n";
        std::cout << "- Class::method(): includes class name in mangling\\n";
        std::cout << "- extern \\"C\\" functions: no mangling, ABI stable\\n";
    }
    
    // ABI-stable extern "C" wrapper
    extern "C" {
        typedef int (*CStyleCallback)(int, double);
        
        int call_cpp_function_safely(CStyleCallback callback, int a, double b) {
            try {
                return callback(a, b);
            } catch (...) {
                return -1;  // Error indication
            }
        }
    }
    
    // Modern C++ with ABI considerations
    template<typename Signature>
    class ABIStableFunction;
    
    template<typename ReturnType, typename... Args>
    class ABIStableFunction<ReturnType(Args...)> {
        typedef ReturnType (*FunctionType)(Args...);
        FunctionType function_;
        
    public:
        ABIStableFunction(FunctionType func) : function_(func) {}
        
        ReturnType operator()(Args... args) const {
            return function_(args...);
        }
        
        // Get underlying function pointer (ABI-stable)
        FunctionType getFunction() const { return function_; }
    };
};`}
        </code>
      </CodeBlock>

      <QuizContainer>
        <h3>Test Your ABI Knowledge</h3>
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