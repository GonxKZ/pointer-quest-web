import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import {
  LessonLayout,
  TheoryPanel,
  VisualizationPanel,
  Section,
  SectionTitle,
  CodeBlock,
  InteractiveSection,
  StatusDisplay,
  ButtonGroup,
  theme
} from '../design-system';



function UndefinedBehaviorVisualization() {
  const [ubMetrics, setUbMetrics] = useState({
    nullDereference: 0,
    useAfterFree: 0,
    doubleFree: 0,
    bufferOverflow: 0,
    dataRaces: 0,
    strictAliasing: 0,
    dangerLevel: 95
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setUbMetrics(prev => ({
        nullDereference: prev.nullDereference + Math.floor(Math.random() * 2),
        useAfterFree: prev.useAfterFree + Math.floor(Math.random() * 3),
        doubleFree: prev.doubleFree + Math.floor(Math.random() * 2),
        bufferOverflow: prev.bufferOverflow + Math.floor(Math.random() * 4),
        dataRaces: prev.dataRaces + Math.floor(Math.random() * 5),
        strictAliasing: prev.strictAliasing + Math.floor(Math.random() * 3),
        dangerLevel: Math.max(0, prev.dangerLevel - (Math.random() - 0.7) * 3)
      }));
    }, 1200);
    
    return () => clearInterval(interval);
  }, []);

  const ubTypes = [
    { name: 'nullDereference' as keyof typeof ubMetrics, pos: [-4, 3, 0] as const, color: '#ff0000', label: 'Null Deref' },
    { name: 'useAfterFree' as keyof typeof ubMetrics, pos: [-2, 3, 0] as const, color: '#ff4500', label: 'Use After Free' },
    { name: 'doubleFree' as keyof typeof ubMetrics, pos: [0, 3, 0] as const, color: '#ff8c00', label: 'Double Free' },
    { name: 'bufferOverflow' as keyof typeof ubMetrics, pos: [2, 3, 0] as const, color: '#ffd700', label: 'Buffer Overflow' },
    { name: 'dataRaces' as keyof typeof ubMetrics, pos: [-1, 1, 0] as const, color: '#dc143c', label: 'Data Races' },
    { name: 'strictAliasing' as keyof typeof ubMetrics, pos: [1, 1, 0] as const, color: '#b22222', label: 'Aliasing UB' },
  ];

  return (
    <group>
      {ubTypes.map((type) => (
        <group key={type.name}>
          <Box
            position={type.pos as [number, number, number]}
            args={[1.5, 0.8, 0.4]}
          >
            <meshStandardMaterial
              color={type.color}
              opacity={0.3 + ((ubMetrics[type.name] ?? 0) % 15) / 50}
              transparent
            />
          </Box>
          <Text
            position={[type.pos[0], type.pos[1] + 1, type.pos[2]]}
            fontSize={0.2}
            color="white"
            anchorX="center"
          >
            {type.label}
          </Text>
          <Text
            position={[type.pos[0], type.pos[1] - 1, type.pos[2]]}
            fontSize={0.3}
            color={type.color}
            anchorX="center"
          >
            {ubMetrics[type.name] ?? 0}
          </Text>
        </group>
      ))}
      
      {/* Central warning sphere */}
      <Sphere position={[0, -0.5, 0]} args={[0.6]}>
        <meshStandardMaterial 
          color="#8B0000" 
          opacity={0.6 + Math.sin(Date.now() * 0.005) * 0.3} 
          transparent 
        />
      </Sphere>
      
      {/* Warning lines connecting all UB types */}
      <Line
        points={[
          [-4, 3, 0], [0, -0.5, 0], [-2, 3, 0], [0, -0.5, 0],
          [0, 3, 0], [0, -0.5, 0], [2, 3, 0], [0, -0.5, 0],
          [-1, 1, 0], [0, -0.5, 0], [1, 1, 0]
        ]}
        color="#ff0000"
        lineWidth={3}
        opacity={0.4}
        transparent
      />
      
      <Text
        position={[0, -2.2, 0]}
        fontSize={0.35}
        color="#ff0000"
        anchorX="center"
      >
        UB DANGER MUSEUM
      </Text>
      
      <Text
        position={[0, -2.8, 0]}
        fontSize={0.25}
        color={ubMetrics.dangerLevel > 80 ? '#ff0000' : ubMetrics.dangerLevel > 50 ? '#ffa500' : '#00ff00'}
        anchorX="center"
      >
        {`Stability: ${ubMetrics.dangerLevel.toFixed(1)}%`}
      </Text>
    </group>
  );
}

export default function Lesson103_UndefinedBehaviorMuseum() {
  const { state } = useApp();
  const [currentExhibit, setCurrentExhibit] = useState(0);

  const exhibits = [
    {
      title: state.language === 'en' ? 'Classic Pointer Undefined Behavior' : 'Comportamiento Indefinido Clásico de Punteros',
      code: `#include <memory>
#include <iostream>
#include <vector>
#include <cassert>
#include <cstdlib>

// ========================================
// EXHIBIT 1: NULL POINTER DEREFERENCE
// ========================================

class NullDereferenceExamples {
public:
    // UNDEFINED BEHAVIOR: Direct null pointer dereference
    void dangerous_null_dereference() {
        int* ptr = nullptr;
        
        // UB: Dereferencing null pointer
        *ptr = 42;  // UNDEFINED BEHAVIOR - Program may crash or corrupt memory
        
        std::cout << "If you see this, the UB was 'lucky'" << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Indirect null dereference through member access
    struct Point { int x, y; };
    void indirect_null_dereference() {
        Point* p = nullptr;
        
        // UB: Member access through null pointer
        p->x = 10;  // UNDEFINED BEHAVIOR - Equivalent to (*p).x
        
        // UB: Even checking members is undefined
        if (p->x == 10) {  // UNDEFINED BEHAVIOR before the comparison
            std::cout << "Never reached safely" << std::endl;
        }
    }
    
    // SAFE ALTERNATIVE: Always check before dereferencing
    void safe_null_check() {
        int* ptr = nullptr;
        
        // SAFE: Check before dereferencing
        if (ptr != nullptr) {
            *ptr = 42;  // Safe - will not execute
        } else {
            std::cout << "Safely detected null pointer" << std::endl;
        }
    }
    
    // TRICKY UB: Null pointer arithmetic
    void null_pointer_arithmetic() {
        int* ptr = nullptr;
        
        // UB: Arithmetic on null pointer (except +0)
        int* ptr2 = ptr + 1;  // UNDEFINED BEHAVIOR
        int* ptr3 = ptr + 0;  // LEGAL (but useless)
        
        // UB: Comparison with non-null after arithmetic
        int array[5];
        if (ptr2 == &array[1]) {  // UNDEFINED BEHAVIOR - ptr2 has undefined value
            std::cout << "Undefined comparison result" << std::endl;
        }
    }
};

// ========================================
// EXHIBIT 2: USE-AFTER-FREE
// ========================================

class UseAfterFreeExamples {
private:
    struct Resource {
        int data;
        std::string name;
        
        Resource(int d, const std::string& n) : data(d), name(n) {
            std::cout << "Resource " << name << " created" << std::endl;
        }
        
        ~Resource() {
            std::cout << "Resource " << name << " destroyed" << std::endl;
        }
        
        void process() {
            std::cout << "Processing " << name << " with data=" << data << std::endl;
        }
    };
    
public:
    // UNDEFINED BEHAVIOR: Classic use-after-free
    void classic_use_after_free() {
        Resource* res = new Resource(42, "DanglingResource");
        
        delete res;  // Resource is destroyed here
        
        // UB: Accessing freed memory
        res->process();  // UNDEFINED BEHAVIOR - res points to freed memory
        
        std::cout << "Data: " << res->data << std::endl;  // UNDEFINED BEHAVIOR
    }
    
    // UNDEFINED BEHAVIOR: Use after scope end
    Resource* get_dangling_pointer() {
        Resource stack_resource(100, "StackResource");
        
        // UB: Returning pointer to local object
        return &stack_resource;  // UNDEFINED BEHAVIOR - object destroyed when function ends
    }
    
    void use_dangling_from_scope() {
        Resource* dangling = get_dangling_pointer();
        
        // UB: Using pointer to destroyed stack object
        dangling->process();  // UNDEFINED BEHAVIOR - object no longer exists
    }
    
    // UNDEFINED BEHAVIOR: Use after container reallocation
    void vector_reallocation_use_after_free() {
        std::vector<Resource> resources;
        resources.emplace_back(1, "VectorResource1");
        
        Resource* ptr = &resources[0];  // Get pointer to first element
        
        // This may cause reallocation, invalidating ptr
        for (int i = 0; i < 1000; ++i) {
            resources.emplace_back(i, "VectorResource" + std::to_string(i));
        }
        
        // UB: ptr may now point to deallocated memory
        ptr->process();  // UNDEFINED BEHAVIOR - ptr may be invalid
    }
    
    // SAFE ALTERNATIVE: Use indices or iterators correctly
    void safe_vector_access() {
        std::vector<Resource> resources;
        resources.emplace_back(1, "SafeVectorResource1");
        
        size_t index = 0;  // Store index instead of pointer
        
        // Add more elements
        for (int i = 0; i < 1000; ++i) {
            resources.emplace_back(i, "SafeVectorResource" + std::to_string(i));
        }
        
        // SAFE: Access by index
        if (index < resources.size()) {
            resources[index].process();  // Safe - index remains valid
        }
    }
};

// ========================================
// EXHIBIT 3: DOUBLE FREE
// ========================================

class DoubleFreeExamples {
public:
    // UNDEFINED BEHAVIOR: Double delete
    void double_delete_raw_pointer() {
        int* ptr = new int(42);
        
        delete ptr;  // First delete - OK
        delete ptr;  // UNDEFINED BEHAVIOR - Double free
        
        // Program may crash or corrupt heap
    }
    
    // UNDEFINED BEHAVIOR: Double delete through different pointers
    void double_delete_aliased_pointers() {
        int* ptr1 = new int(100);
        int* ptr2 = ptr1;  // Alias - both point to same memory
        
        delete ptr1;  // First delete - OK
        delete ptr2;  // UNDEFINED BEHAVIOR - Deleting already freed memory
    }
    
    // UNDEFINED BEHAVIOR: Delete array allocated with new
    void mismatched_new_delete() {
        int* array = new int[10];
        
        // UB: Using delete instead of delete[]
        delete array;  // UNDEFINED BEHAVIOR - Should use delete[]
        
        // Correct would be: delete[] array;
    }
    
    // UNDEFINED BEHAVIOR: Delete[] single object
    void mismatched_delete_array() {
        int* single = new int(42);
        
        // UB: Using delete[] on single object
        delete[] single;  // UNDEFINED BEHAVIOR - Should use delete
    }
    
    // UNDEFINED BEHAVIOR: Free malloc'd memory with delete
    void mixed_allocation_deallocation() {
        int* ptr = (int*)malloc(sizeof(int));
        *ptr = 42;
        
        // UB: Mixing malloc/free with new/delete
        delete ptr;  // UNDEFINED BEHAVIOR - Should use free()
        
        // Correct would be: free(ptr);
    }
    
    // SAFE ALTERNATIVE: Use smart pointers
    void safe_smart_pointer_usage() {
        auto ptr1 = std::make_unique<int>(42);
        auto ptr2 = std::make_unique<int>(100);
        
        // Safe - automatic cleanup, no double deletion possible
        // ptr1 and ptr2 automatically deleted when going out of scope
        
        std::cout << "Smart pointers handle cleanup safely" << std::endl;
    }
    
    // SAFE ALTERNATIVE: Set to null after delete
    void safe_null_after_delete() {
        int* ptr = new int(42);
        
        delete ptr;
        ptr = nullptr;  // Prevent accidental double delete
        
        // Safe - deleting null pointer is well-defined (no-op)
        delete ptr;  // Safe - delete nullptr does nothing
    }
};

// ========================================
// EXHIBIT 4: BUFFER OVERFLOW & BOUNDS
// ========================================

class BufferOverflowExamples {
public:
    // UNDEFINED BEHAVIOR: Array bounds violation
    void array_bounds_violation() {
        int array[5] = {1, 2, 3, 4, 5};
        
        // UB: Writing beyond array bounds
        array[5] = 6;   // UNDEFINED BEHAVIOR - index 5 is out of bounds
        array[-1] = 0;  // UNDEFINED BEHAVIOR - negative index
        
        // UB: Reading beyond bounds
        int value = array[10];  // UNDEFINED BEHAVIOR - way out of bounds
        
        std::cout << "Out of bounds value: " << value << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Pointer arithmetic beyond bounds
    void pointer_arithmetic_overflow() {
        int array[5] = {1, 2, 3, 4, 5};
        int* ptr = array;
        
        // Legal: Point to one-past-end
        int* end = ptr + 5;  // Legal - one-past-end pointer
        
        // UB: Point beyond one-past-end
        int* beyond = ptr + 6;  // UNDEFINED BEHAVIOR - beyond one-past-end
        
        // UB: Point before array
        int* before = ptr - 1;  // UNDEFINED BEHAVIOR - before array start
        
        // UB: Dereference one-past-end
        *end = 42;  // UNDEFINED BEHAVIOR - dereferencing one-past-end
    }
    
    // UNDEFINED BEHAVIOR: String buffer overflow
    void string_buffer_overflow() {
        char buffer[10];
        const char* source = "This string is way too long for the buffer";
        
        // UB: strcpy without bounds checking
        strcpy(buffer, source);  // UNDEFINED BEHAVIOR - buffer overflow
        
        std::cout << "Buffer contents: " << buffer << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Stack buffer overflow
    void stack_buffer_overflow() {
        char buffer[100];
        
        // UB: Writing beyond stack buffer
        for (int i = 0; i < 200; ++i) {
            buffer[i] = 'A';  // UNDEFINED BEHAVIOR when i >= 100
        }
        
        std::cout << "Buffer filled (if lucky)" << std::endl;
    }
    
    // SAFE ALTERNATIVE: Use bounds-checked operations
    void safe_buffer_operations() {
        constexpr size_t BUFFER_SIZE = 10;
        char buffer[BUFFER_SIZE];
        const char* source = "This string is way too long for the buffer";
        
        // Safe: Use strncpy with size limit
        strncpy(buffer, source, BUFFER_SIZE - 1);
        buffer[BUFFER_SIZE - 1] = '\\0';  // Ensure null termination
        
        std::cout << "Safe buffer contents: " << buffer << std::endl;
        
        // Even safer: Use std::string
        std::string safe_string = source;
        std::cout << "Safe string: " << safe_string.substr(0, 9) << std::endl;
    }
    
    // SAFE ALTERNATIVE: Use std::array with bounds checking
    void safe_array_access() {
        std::array<int, 5> safe_array = {1, 2, 3, 4, 5};
        
        // Safe: at() throws exception on out-of-bounds
        try {
            safe_array.at(5) = 6;  // Throws std::out_of_range
        } catch (const std::out_of_range& e) {
            std::cout << "Safely caught bounds violation: " << e.what() << std::endl;
        }
        
        // Safe: Bounds checking before access
        size_t index = 10;
        if (index < safe_array.size()) {
            safe_array[index] = 42;
        } else {
            std::cout << "Index " << index << " is out of bounds" << std::endl;
        }
    }
};

// Main demonstration function
void demonstrate_classic_ub_patterns() {
    std::cout << "\\n=== UNDEFINED BEHAVIOR MUSEUM - CLASSIC PATTERNS ===" << std::endl;
    std::cout << "WARNING: This code demonstrates DANGEROUS patterns!" << std::endl;
    std::cout << "DO NOT use these patterns in production code!\\n" << std::endl;
    
    // NOTE: Most of these examples will not be executed to avoid crashes
    // They are here for educational demonstration only
    
    std::cout << "1. Null Pointer Dereference Examples:" << std::endl;
    NullDereferenceExamples null_examples;
    null_examples.safe_null_check();  // Only run safe examples
    
    std::cout << "\\n2. Use-After-Free Examples:" << std::endl;
    UseAfterFreeExamples uaf_examples;
    uaf_examples.safe_vector_access();  // Only run safe examples
    
    std::cout << "\\n3. Double Free Examples:" << std::endl;
    DoubleFreeExamples df_examples;
    df_examples.safe_smart_pointer_usage();  // Only run safe examples
    df_examples.safe_null_after_delete();
    
    std::cout << "\\n4. Buffer Overflow Examples:" << std::endl;
    BufferOverflowExamples bo_examples;
    bo_examples.safe_buffer_operations();  // Only run safe examples
    bo_examples.safe_array_access();
    
    std::cout << "\\n=== END OF CLASSIC UB PATTERNS EXHIBIT ===" << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Alignment & Padding Violations' : 'Violaciones de Alineación y Padding',
      code: `#include <memory>
#include <iostream>
#include <cstring>
#include <type_traits>
#include <cstdint>

// ========================================
// EXHIBIT 5: ALIGNMENT VIOLATIONS
// ========================================

class AlignmentViolations {
public:
    // UNDEFINED BEHAVIOR: Misaligned access
    void misaligned_access_demo() {
        // Create a buffer that might not be aligned for int64_t
        char buffer[16];
        
        // UB: Cast to int64_t* without ensuring proper alignment
        int64_t* misaligned_ptr = reinterpret_cast<int64_t*>(buffer + 1);
        
        // UB: Writing to misaligned address
        *misaligned_ptr = 0x123456789ABCDEF0;  // UNDEFINED BEHAVIOR
        
        // UB: Reading from misaligned address
        int64_t value = *misaligned_ptr;  // UNDEFINED BEHAVIOR
        
        std::cout << std::hex << "Misaligned value: " << value << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Structure padding assumptions
    struct PackedStruct {
        char c;
        int i;
        char d;
    };
    
    void wrong_padding_assumptions() {
        PackedStruct s = {'A', 0x12345678, 'B'};
        
        // DANGEROUS: Assuming no padding between members
        char* ptr = reinterpret_cast<char*>(&s);
        
        // This assumes wrong layout - padding may exist
        std::cout << "Assumed layout:" << std::endl;
        std::cout << "c: " << ptr[0] << std::endl;
        std::cout << "i: " << *reinterpret_cast<int*>(ptr + 1) << std::endl;  // UB if padding exists
        std::cout << "d: " << ptr[5] << std::endl;  // UB if wrong offset
    }
    
    // SAFE: Proper alignment checking and handling
    void safe_alignment_handling() {
        // Check alignment requirements
        constexpr size_t alignment = alignof(int64_t);
        std::cout << "int64_t alignment requirement: " << alignment << std::endl;
        
        // Allocate properly aligned memory
        alignas(int64_t) char buffer[16];
        
        // Safe: Properly aligned pointer
        int64_t* aligned_ptr = reinterpret_cast<int64_t*>(buffer);
        
        // Check if pointer is properly aligned
        if (reinterpret_cast<uintptr_t>(aligned_ptr) % alignment == 0) {
            *aligned_ptr = 0x123456789ABCDEF0;  // Safe
            std::cout << std::hex << "Properly aligned value: " << *aligned_ptr << std::endl;
        }
    }
    
    // SAFE: Using proper structure layout
    void safe_structure_access() {
        PackedStruct s = {'A', 0x12345678, 'B'};
        
        // Safe: Access members directly
        std::cout << "Safe member access:" << std::endl;
        std::cout << "c: " << s.c << std::endl;
        std::cout << "i: " << std::hex << s.i << std::endl;
        std::cout << "d: " << s.d << std::endl;
        
        // Safe: Use offsetof for member locations
        std::cout << "Actual member offsets:" << std::endl;
        std::cout << "c offset: " << offsetof(PackedStruct, c) << std::endl;
        std::cout << "i offset: " << offsetof(PackedStruct, i) << std::endl;
        std::cout << "d offset: " << offsetof(PackedStruct, d) << std::endl;
        std::cout << "Total size: " << sizeof(PackedStruct) << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Atomic alignment violations
    void atomic_alignment_violations() {
        char buffer[32];
        
        // UB: std::atomic requires proper alignment
        std::atomic<int64_t>* misaligned_atomic = 
            reinterpret_cast<std::atomic<int64_t>*>(buffer + 1);
        
        // UB: Using misaligned atomic
        // misaligned_atomic->store(42);  // UNDEFINED BEHAVIOR - commented to avoid crash
        
        std::cout << "Atomic alignment violations are dangerous!" << std::endl;
    }
    
    // SAFE: Proper atomic alignment
    void safe_atomic_alignment() {
        alignas(std::atomic<int64_t>) char buffer[32];
        
        // Placement new with proper alignment
        std::atomic<int64_t>* aligned_atomic = 
            new(buffer) std::atomic<int64_t>(42);
        
        // Safe: Properly aligned atomic operations
        int64_t value = aligned_atomic->load();
        aligned_atomic->store(100);
        
        std::cout << "Safe atomic operations: " << value << " -> " << aligned_atomic->load() << std::endl;
        
        // Don't forget to call destructor for placement new
        aligned_atomic->~atomic();
    }
};

// ========================================
// EXHIBIT 6: TYPE PUNNING VIOLATIONS
// ========================================

class TypePunningViolations {
public:
    // UNDEFINED BEHAVIOR: Type punning through unions (pre-C++20)
    void dangerous_union_type_punning() {
        union TypePunner {
            float f;
            int i;
            char bytes[4];
        };
        
        TypePunner punner;
        punner.f = 3.14159f;
        
        // UB: Reading from inactive union member (in C++)
        int int_bits = punner.i;  // UNDEFINED BEHAVIOR in C++
        
        std::cout << "Float as int bits: " << std::hex << int_bits << std::endl;
        
        // UB: Accessing bytes of inactive member
        std::cout << "Float bytes: ";
        for (int j = 0; j < 4; ++j) {
            std::cout << std::hex << static_cast<unsigned>(punner.bytes[j]) << " ";
        }
        std::cout << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Pointer aliasing violations
    void strict_aliasing_violations() {
        int value = 0x12345678;
        
        // UB: Violating strict aliasing rules
        float* float_alias = reinterpret_cast<float*>(&value);
        
        // UB: Reading int through float pointer
        float float_value = *float_alias;  // UNDEFINED BEHAVIOR
        
        std::cout << "Int as float: " << float_value << std::endl;
        
        // UB: Writing through aliased pointer
        *float_alias = 3.14f;  // UNDEFINED BEHAVIOR
        
        std::cout << "Modified int value: " << std::hex << value << std::endl;
    }
    
    // SAFE: C++20 bit_cast for type punning
    void safe_bit_cast() {
        float f = 3.14159f;
        
        // Safe: std::bit_cast preserves bit patterns
        int int_bits = std::bit_cast<int>(f);
        
        std::cout << "Float " << f << " as int bits: " << std::hex << int_bits << std::endl;
        
        // Safe: Convert back
        float restored = std::bit_cast<float>(int_bits);
        std::cout << "Restored float: " << restored << std::endl;
    }
    
    // SAFE: memcpy for type punning
    void safe_memcpy_punning() {
        float f = 3.14159f;
        int int_bits;
        
        // Safe: memcpy preserves bit patterns without aliasing violations
        std::memcpy(&int_bits, &f, sizeof(f));
        
        std::cout << "Float " << f << " as int via memcpy: " << std::hex << int_bits << std::endl;
        
        // Safe: Convert back
        float restored;
        std::memcpy(&restored, &int_bits, sizeof(int_bits));
        std::cout << "Restored float via memcpy: " << restored << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Char array aliasing assumptions
    void char_array_aliasing_issues() {
        struct Data {
            int x;
            float y;
        };
        
        Data data = {42, 3.14f};
        
        // Legal: char* can alias anything
        char* char_ptr = reinterpret_cast<char*>(&data);
        
        // Legal: Reading bytes
        std::cout << "Data bytes: ";
        for (size_t i = 0; i < sizeof(Data); ++i) {
            std::cout << std::hex << static_cast<unsigned char>(char_ptr[i]) << " ";
        }
        std::cout << std::endl;
        
        // DANGEROUS: Assuming layout and endianness
        int* assumed_int = reinterpret_cast<int*>(char_ptr);
        float* assumed_float = reinterpret_cast<float*>(char_ptr + sizeof(int));
        
        // This might work, but relies on implementation details
        std::cout << "Assumed int: " << *assumed_int << std::endl;
        std::cout << "Assumed float: " << *assumed_float << std::endl;
        
        // Better: Access original members
        std::cout << "Actual int: " << data.x << std::endl;
        std::cout << "Actual float: " << data.y << std::endl;
    }
};

// ========================================
// EXHIBIT 7: PADDING AND LAYOUT ISSUES
// ========================================

class PaddingLayoutIssues {
private:
    // Different structure layouts
    struct NormalLayout {
        char c1;     // 1 byte
        int i1;      // 4 bytes (likely 3 bytes padding before)
        char c2;     // 1 byte
        double d1;   // 8 bytes (likely 7 bytes padding before)
    };
    
    #pragma pack(push, 1)
    struct PackedLayout {
        char c1;     // 1 byte
        int i1;      // 4 bytes (no padding)
        char c2;     // 1 byte
        double d1;   // 8 bytes (no padding)
    };
    #pragma pack(pop)
    
    struct ReorderedLayout {
        double d1;   // 8 bytes (naturally aligned)
        int i1;      // 4 bytes
        char c1;     // 1 byte
        char c2;     // 1 byte (+ 2 bytes padding at end)
    };
    
public:
    void demonstrate_padding_issues() {
        std::cout << "\\n=== PADDING AND LAYOUT ANALYSIS ===" << std::endl;
        
        std::cout << "NormalLayout size: " << sizeof(NormalLayout) << " bytes" << std::endl;
        std::cout << "PackedLayout size: " << sizeof(PackedLayout) << " bytes" << std::endl;
        std::cout << "ReorderedLayout size: " << sizeof(ReorderedLayout) << " bytes" << std::endl;
        
        // Demonstrate alignment requirements
        std::cout << "\\nAlignment requirements:" << std::endl;
        std::cout << "char: " << alignof(char) << " bytes" << std::endl;
        std::cout << "int: " << alignof(int) << " bytes" << std::endl;
        std::cout << "double: " << alignof(double) << " bytes" << std::endl;
        std::cout << "NormalLayout: " << alignof(NormalLayout) << " bytes" << std::endl;
        std::cout << "PackedLayout: " << alignof(PackedLayout) << " bytes" << std::endl;
        std::cout << "ReorderedLayout: " << alignof(ReorderedLayout) << " bytes" << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Assuming padding layout
    void dangerous_padding_assumptions() {
        NormalLayout normal = {'A', 0x12345678, 'B', 3.14159};
        
        // DANGEROUS: Assuming specific padding
        char* ptr = reinterpret_cast<char*>(&normal);
        
        // This might not work as expected due to padding
        std::cout << "\\nDangerous byte-by-byte access:" << std::endl;
        for (size_t i = 0; i < sizeof(NormalLayout); ++i) {
            if (ptr[i] != 0) {  // Skip padding bytes (might be 0, might not be)
                std::cout << "Byte " << i << ": " << std::hex 
                         << static_cast<unsigned>(static_cast<unsigned char>(ptr[i])) << std::endl;
            }
        }
    }
    
    // UNDEFINED BEHAVIOR: Packed structure alignment issues
    void packed_structure_problems() {
        PackedLayout packed = {'A', 0x12345678, 'B', 3.14159};
        
        // DANGEROUS: Members may not be properly aligned
        int* int_ptr = &packed.i1;      // May not be 4-byte aligned
        double* double_ptr = &packed.d1;  // May not be 8-byte aligned
        
        // On some architectures, this could cause:
        // 1. Performance degradation (unaligned access)
        // 2. Bus errors or crashes
        // 3. Incorrect values
        
        std::cout << "\\nPacked structure access (potentially dangerous):" << std::endl;
        std::cout << "Packed int: " << *int_ptr << std::endl;
        std::cout << "Packed double: " << *double_ptr << std::endl;
        
        // Check alignment
        std::cout << "int alignment: " << (reinterpret_cast<uintptr_t>(int_ptr) % alignof(int)) << std::endl;
        std::cout << "double alignment: " << (reinterpret_cast<uintptr_t>(double_ptr) % alignof(double)) << std::endl;
    }
    
    // SAFE: Proper structure design
    void safe_structure_design() {
        ReorderedLayout reordered = {3.14159, 0x12345678, 'A', 'B'};
        
        // Safe: Members are naturally aligned
        std::cout << "\\nSafe structure access:" << std::endl;
        std::cout << "Reordered double: " << reordered.d1 << std::endl;
        std::cout << "Reordered int: " << std::hex << reordered.i1 << std::endl;
        std::cout << "Reordered char1: " << reordered.c1 << std::endl;
        std::cout << "Reordered char2: " << reordered.c2 << std::endl;
        
        // Verify alignment
        std::cout << "\\nAlignment verification:" << std::endl;
        std::cout << "double aligned: " << (reinterpret_cast<uintptr_t>(&reordered.d1) % alignof(double) == 0) << std::endl;
        std::cout << "int aligned: " << (reinterpret_cast<uintptr_t>(&reordered.i1) % alignof(int) == 0) << std::endl;
    }
};

// Main demonstration function
void demonstrate_alignment_ub() {
    std::cout << "\\n=== UNDEFINED BEHAVIOR MUSEUM - ALIGNMENT & PADDING ===" << std::endl;
    std::cout << "WARNING: This code demonstrates DANGEROUS alignment patterns!" << std::endl;
    std::cout << "DO NOT use these patterns in production code!\\n" << std::endl;
    
    AlignmentViolations alignment_examples;
    alignment_examples.safe_alignment_handling();
    alignment_examples.safe_structure_access();
    alignment_examples.safe_atomic_alignment();
    
    TypePunningViolations punning_examples;
    punning_examples.safe_bit_cast();
    punning_examples.safe_memcpy_punning();
    
    PaddingLayoutIssues padding_examples;
    padding_examples.demonstrate_padding_issues();
    padding_examples.packed_structure_problems();
    padding_examples.safe_structure_design();
    
    std::cout << "\\n=== END OF ALIGNMENT & PADDING EXHIBIT ===" << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Iterator Invalidation & Pointer Arithmetic UB' : 'Invalidación de Iteradores y UB de Aritmética de Punteros',
      code: `#include <vector>
#include <list>
#include <deque>
#include <unordered_map>
#include <set>
#include <iostream>
#include <algorithm>
#include <iterator>

// ========================================
// EXHIBIT 8: ITERATOR INVALIDATION
// ========================================

class IteratorInvalidationExamples {
public:
    // UNDEFINED BEHAVIOR: Vector iterator invalidation
    void vector_iterator_invalidation() {
        std::vector<int> vec = {1, 2, 3, 4, 5};
        
        auto it = vec.begin();
        auto end_it = vec.end();
        
        std::cout << "Initial vector: ";
        for (const auto& val : vec) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
        
        // UB: Iterator invalidation due to reallocation
        while (it != end_it) {
            std::cout << "Processing: " << *it << std::endl;
            
            // This may cause reallocation, invalidating all iterators
            vec.push_back(*it * 10);
            
            ++it;  // UNDEFINED BEHAVIOR - it may be invalidated
            // end_it is also invalidated and comparison may fail
        }
    }
    
    // UNDEFINED BEHAVIOR: Vector erase invalidation
    void vector_erase_invalidation() {
        std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        
        // Wrong way: iterators invalidated after erase
        auto it = vec.begin();
        while (it != vec.end()) {
            if (*it % 2 == 0) {
                vec.erase(it);  // Invalidates it and all following iterators
                ++it;  // UNDEFINED BEHAVIOR - it is invalidated
            } else {
                ++it;
            }
        }
    }
    
    // SAFE: Proper iterator handling after erase
    void safe_vector_erase() {
        std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        
        std::cout << "Original vector: ";
        for (const auto& val : vec) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
        
        // Safe: Use erase return value
        auto it = vec.begin();
        while (it != vec.end()) {
            if (*it % 2 == 0) {
                it = vec.erase(it);  // erase returns iterator to next element
            } else {
                ++it;
            }
        }
        
        std::cout << "After removing even numbers: ";
        for (const auto& val : vec) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Map iterator invalidation
    void map_iterator_invalidation() {
        std::unordered_map<int, std::string> map = {
            {1, "one"}, {2, "two"}, {3, "three"}, {4, "four"}, {5, "five"}
        };
        
        auto it = map.begin();
        while (it != map.end()) {
            std::cout << it->first << ": " << it->second << std::endl;
            
            // This may cause rehashing, invalidating all iterators
            map[it->first * 10] = it->second + "_x10";
            
            ++it;  // UNDEFINED BEHAVIOR - it may be invalidated due to rehashing
        }
    }
    
    // SAFE: Map modification with iterator safety
    void safe_map_modification() {
        std::unordered_map<int, std::string> map = {
            {1, "one"}, {2, "two"}, {3, "three"}, {4, "four"}, {5, "five"}
        };
        
        // Safe: Collect keys first, then modify
        std::vector<int> keys;
        for (const auto& pair : map) {
            keys.push_back(pair.first);
        }
        
        // Safe: Modify using collected keys
        for (int key : keys) {
            auto it = map.find(key);
            if (it != map.end()) {
                map[key * 10] = it->second + "_x10";
            }
        }
        
        std::cout << "Safely modified map:" << std::endl;
        for (const auto& pair : map) {
            std::cout << pair.first << ": " << pair.second << std::endl;
        }
    }
    
    // UNDEFINED BEHAVIOR: Deque iterator invalidation
    void deque_iterator_invalidation() {
        std::deque<int> deq = {1, 2, 3, 4, 5};
        
        auto it = deq.begin() + 2;  // Points to element 3
        std::cout << "Iterator points to: " << *it << std::endl;
        
        // Operations that invalidate deque iterators:
        deq.push_front(0);  // Invalidates all iterators
        deq.push_back(6);   // Invalidates all iterators
        
        // UB: Using invalidated iterator
        std::cout << "Iterator after push operations: " << *it << std::endl;  // UNDEFINED BEHAVIOR
    }
    
    // SAFE: Deque iterator handling
    void safe_deque_operations() {
        std::deque<int> deq = {1, 2, 3, 4, 5};
        
        size_t index = 2;  // Use index instead of iterator
        std::cout << "Element at index " << index << ": " << deq[index] << std::endl;
        
        deq.push_front(0);
        deq.push_back(6);
        
        // Safe: Index-based access (adjust index if needed)
        if (index < deq.size()) {
            std::cout << "Element at index " << index << " after operations: " << deq[index] << std::endl;
        }
    }
    
    // UNDEFINED BEHAVIOR: List iterator subtlety
    void list_iterator_issues() {
        std::list<int> lst = {1, 2, 3, 4, 5};
        
        auto it = lst.begin();
        std::advance(it, 2);  // Points to 3
        
        auto to_erase = it;
        ++it;  // Move to next element (4)
        
        lst.erase(to_erase);  // Safe - only invalidates erased iterator
        
        std::cout << "After erase, iterator points to: " << *it << std::endl;  // Safe - it is still valid
        
        // However, be careful with end() iterator
        auto end_it = lst.end();
        lst.push_back(6);  // May or may not invalidate end() depending on implementation
        
        // Safer to refresh end iterator
        end_it = lst.end();
    }
};

// ========================================
// EXHIBIT 9: POINTER ARITHMETIC UB
// ========================================

class PointerArithmeticUB {
public:
    // UNDEFINED BEHAVIOR: Pointer arithmetic beyond object bounds
    void pointer_arithmetic_beyond_bounds() {
        int array[5] = {1, 2, 3, 4, 5};
        int* ptr = array;
        
        // Legal: Pointer arithmetic within array bounds
        int* ptr1 = ptr + 2;    // Points to array[2] - Legal
        int* ptr2 = ptr + 5;    // Points one-past-end - Legal
        
        // UB: Pointer arithmetic beyond one-past-end
        int* ptr3 = ptr + 6;    // UNDEFINED BEHAVIOR - beyond one-past-end
        int* ptr4 = ptr - 1;    // UNDEFINED BEHAVIOR - before array start
        
        std::cout << "Array values through pointer arithmetic:" << std::endl;
        std::cout << "*ptr1 (array[2]): " << *ptr1 << std::endl;  // Legal
        // std::cout << "*ptr2: " << *ptr2 << std::endl;  // UB - one-past-end
        // std::cout << "*ptr3: " << *ptr3 << std::endl;  // UB - beyond bounds
        // std::cout << "*ptr4: " << *ptr4 << std::endl;  // UB - before start
    }
    
    // UNDEFINED BEHAVIOR: Pointer subtraction with different objects
    void pointer_subtraction_different_objects() {
        int array1[5] = {1, 2, 3, 4, 5};
        int array2[5] = {6, 7, 8, 9, 10};
        
        int* ptr1 = &array1[2];
        int* ptr2 = &array2[2];
        
        // UB: Subtracting pointers to different objects
        ptrdiff_t diff = ptr1 - ptr2;  // UNDEFINED BEHAVIOR
        
        std::cout << "Pointer difference: " << diff << std::endl;  // Meaningless result
    }
    
    // UNDEFINED BEHAVIOR: Pointer comparison with different objects
    void pointer_comparison_different_objects() {
        int array1[5] = {1, 2, 3, 4, 5};
        int array2[5] = {6, 7, 8, 9, 10};
        
        int* ptr1 = &array1[2];
        int* ptr2 = &array2[2];
        
        // UB: Ordering comparison of pointers to different objects
        if (ptr1 < ptr2) {  // UNDEFINED BEHAVIOR
            std::cout << "ptr1 < ptr2" << std::endl;
        }
        
        // Legal: Equality comparison (though usually false)
        if (ptr1 == ptr2) {  // Legal comparison
            std::cout << "Pointers are equal (highly unlikely)" << std::endl;
        }
    }
    
    // UNDEFINED BEHAVIOR: Integer overflow in pointer arithmetic
    void pointer_arithmetic_overflow() {
        int array[10];
        int* ptr = array;
        
        // UB: Adding value that would overflow pointer arithmetic
        size_t huge_offset = SIZE_MAX / 2;
        
        // This may wrap around or cause undefined behavior
        int* overflow_ptr = ptr + huge_offset;  // UNDEFINED BEHAVIOR on overflow
        
        std::cout << "Original ptr: " << ptr << std::endl;
        std::cout << "Overflow ptr: " << overflow_ptr << std::endl;
    }
    
    // SAFE: Proper pointer arithmetic bounds checking
    void safe_pointer_arithmetic() {
        constexpr size_t ARRAY_SIZE = 5;
        int array[ARRAY_SIZE] = {1, 2, 3, 4, 5};
        int* ptr = array;
        
        // Safe: Check bounds before arithmetic
        auto safe_add = [&](int* base, size_t offset) -> int* {
            if (offset <= ARRAY_SIZE) {  // Allow one-past-end
                return base + offset;
            }
            return nullptr;  // Invalid offset
        };
        
        int* safe_ptr1 = safe_add(ptr, 2);
        int* safe_ptr2 = safe_add(ptr, 5);    // One-past-end - legal
        int* safe_ptr3 = safe_add(ptr, 6);    // Beyond bounds - returns nullptr
        
        if (safe_ptr1 != nullptr && safe_ptr1 < ptr + ARRAY_SIZE) {
            std::cout << "Safe access: " << *safe_ptr1 << std::endl;
        }
        
        if (safe_ptr2 == ptr + ARRAY_SIZE) {
            std::cout << "One-past-end pointer is valid for comparison" << std::endl;
        }
        
        if (safe_ptr3 == nullptr) {
            std::cout << "Detected out-of-bounds offset" << std::endl;
        }
    }
    
    // UNDEFINED BEHAVIOR: Null pointer arithmetic (except +0)
    void null_pointer_arithmetic() {
        int* null_ptr = nullptr;
        
        // Legal: Adding 0 to null pointer
        int* still_null = null_ptr + 0;  // Legal
        
        // UB: Adding non-zero to null pointer
        int* ub_ptr = null_ptr + 1;  // UNDEFINED BEHAVIOR
        
        std::cout << "Null ptr: " << null_ptr << std::endl;
        std::cout << "Null ptr + 0: " << still_null << std::endl;
        std::cout << "Null ptr + 1: " << ub_ptr << std::endl;  // Undefined result
    }
    
    // UNDEFINED BEHAVIOR: Pointer arithmetic with different types
    void mixed_type_pointer_arithmetic() {
        struct Large { char data[100]; };
        struct Small { char data[4]; };
        
        char buffer[1000];
        Large* large_ptr = reinterpret_cast<Large*>(buffer);
        Small* small_ptr = reinterpret_cast<Small*>(buffer);
        
        // Moving large pointer by 1 moves by sizeof(Large) bytes
        Large* large_next = large_ptr + 1;
        
        // Moving small pointer by 1 moves by sizeof(Small) bytes  
        Small* small_next = small_ptr + 1;
        
        std::cout << "Large pointer movement: " << 
            (reinterpret_cast<char*>(large_next) - reinterpret_cast<char*>(large_ptr)) << " bytes" << std::endl;
        std::cout << "Small pointer movement: " << 
            (reinterpret_cast<char*>(small_next) - reinterpret_cast<char*>(small_ptr)) << " bytes" << std::endl;
        
        // DANGEROUS: Comparing pointers of different types after arithmetic
        // This is not directly UB, but can lead to logic errors
        if (reinterpret_cast<void*>(large_next) == reinterpret_cast<void*>(small_next)) {
            std::cout << "Pointers happen to be equal" << std::endl;
        }
    }
};

// ========================================
// EXHIBIT 10: CONTAINER-SPECIFIC UB
// ========================================

class ContainerSpecificUB {
public:
    // UNDEFINED BEHAVIOR: String iterator invalidation
    void string_iterator_invalidation() {
        std::string str = "Hello";
        
        auto it = str.begin() + 2;  // Points to 'l'
        std::cout << "Character at iterator: " << *it << std::endl;
        
        // This may cause reallocation, invalidating iterators
        str += " World! This is a very long string that will likely cause reallocation";
        
        // UB: Using invalidated iterator
        std::cout << "Character after append: " << *it << std::endl;  // UNDEFINED BEHAVIOR
    }
    
    // SAFE: String modification with index
    void safe_string_modification() {
        std::string str = "Hello";
        
        size_t index = 2;  // Position of 'l'
        std::cout << "Character at index: " << str[index] << std::endl;
        
        str += " World! This is a very long string that will likely cause reallocation";
        
        // Safe: Index remains valid (though character may have changed)
        if (index < str.size()) {
            std::cout << "Character at same index after append: " << str[index] << std::endl;
        }
    }
    
    // UNDEFINED BEHAVIOR: Set/Map iterator invalidation during modification
    void set_modification_during_iteration() {
        std::set<int> s = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        
        // Wrong: Modifying set while iterating
        for (auto it = s.begin(); it != s.end(); ++it) {
            if (*it % 2 == 0) {
                s.erase(it);  // Invalidates it
                // ++it on next iteration is UB
            }
        }
    }
    
    // SAFE: Set modification with proper iterator handling
    void safe_set_modification() {
        std::set<int> s = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        
        std::cout << "Original set: ";
        for (const auto& val : s) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
        
        // Safe: Use erase return value or collect elements to remove
        auto it = s.begin();
        while (it != s.end()) {
            if (*it % 2 == 0) {
                it = s.erase(it);  // erase returns iterator to next element
            } else {
                ++it;
            }
        }
        
        std::cout << "After removing even numbers: ";
        for (const auto& val : s) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Vector growth and pointer invalidation
    void vector_pointer_invalidation() {
        std::vector<int> vec = {1, 2, 3};
        vec.reserve(10);  // Reserve space to avoid initial reallocation
        
        int* ptr = &vec[1];  // Pointer to second element
        std::cout << "Original value: " << *ptr << std::endl;
        
        // Force reallocation
        for (int i = 0; i < 20; ++i) {
            vec.push_back(i);
        }
        
        // UB: ptr may now point to deallocated memory
        std::cout << "Value after growth: " << *ptr << std::endl;  // UNDEFINED BEHAVIOR
    }
    
    // SAFE: Vector access after growth
    void safe_vector_access_after_growth() {
        std::vector<int> vec = {1, 2, 3};
        
        size_t index = 1;  // Index of second element
        std::cout << "Original value at index " << index << ": " << vec[index] << std::endl;
        
        // Force reallocation
        for (int i = 0; i < 20; ++i) {
            vec.push_back(i);
        }
        
        // Safe: Index remains valid
        std::cout << "Value at same index after growth: " << vec[index] << std::endl;
    }
};

// Main demonstration function
void demonstrate_iterator_pointer_ub() {
    std::cout << "\\n=== UNDEFINED BEHAVIOR MUSEUM - ITERATORS & POINTER ARITHMETIC ===" << std::endl;
    std::cout << "WARNING: This code demonstrates DANGEROUS iterator/pointer patterns!" << std::endl;
    std::cout << "DO NOT use these patterns in production code!\\n" << std::endl;
    
    IteratorInvalidationExamples iter_examples;
    iter_examples.safe_vector_erase();
    iter_examples.safe_map_modification();
    iter_examples.safe_deque_operations();
    
    PointerArithmeticUB pointer_examples;
    pointer_examples.safe_pointer_arithmetic();
    
    ContainerSpecificUB container_examples;
    container_examples.safe_string_modification();
    container_examples.safe_set_modification();
    container_examples.safe_vector_access_after_growth();
    
    std::cout << "\\n=== END OF ITERATOR & POINTER ARITHMETIC EXHIBIT ===" << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Memory Ordering & Concurrent UB' : 'Ordenamiento de Memoria y UB Concurrente',
      code: `#include <atomic>
#include <thread>
#include <mutex>
#include <memory>
#include <vector>
#include <iostream>
#include <chrono>

// ========================================
// EXHIBIT 11: DATA RACE UNDEFINED BEHAVIOR
// ========================================

class DataRaceExamples {
private:
    static int shared_counter;
    static std::vector<int> shared_vector;
    static std::mutex safe_mutex;

public:
    // UNDEFINED BEHAVIOR: Classic data race
    static void data_race_increment() {
        // Multiple threads incrementing without synchronization
        for (int i = 0; i < 1000; ++i) {
            shared_counter++;  // UNDEFINED BEHAVIOR - Data race
        }
    }
    
    // UNDEFINED BEHAVIOR: Vector data race
    static void vector_data_race() {
        // Multiple threads modifying vector without synchronization
        for (int i = 0; i < 100; ++i) {
            shared_vector.push_back(i);  // UNDEFINED BEHAVIOR - Data race
        }
    }
    
    // SAFE: Atomic increment
    static std::atomic<int> safe_atomic_counter{0};
    static void safe_atomic_increment() {
        for (int i = 0; i < 1000; ++i) {
            safe_atomic_counter.fetch_add(1, std::memory_order_relaxed);
        }
    }
    
    // SAFE: Mutex-protected operations
    static void safe_mutex_increment() {
        for (int i = 0; i < 1000; ++i) {
            std::lock_guard<std::mutex> lock(safe_mutex);
            shared_counter++;  // Safe - protected by mutex
        }
    }
    
    static void demonstrate_data_races() {
        std::cout << "\\n=== DATA RACE EXAMPLES ===" << std::endl;
        
        // Reset shared data
        shared_counter = 0;
        shared_vector.clear();
        safe_atomic_counter = 0;
        
        // Test atomic operations (safe)
        std::vector<std::thread> threads;
        
        auto start_time = std::chrono::high_resolution_clock::now();
        
        for (int i = 0; i < 4; ++i) {
            threads.emplace_back(safe_atomic_increment);
        }
        
        for (auto& t : threads) {
            t.join();
        }
        
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end_time - start_time);
        
        std::cout << "Safe atomic counter result: " << safe_atomic_counter.load() << std::endl;
        std::cout << "Atomic operations took: " << duration.count() << " microseconds" << std::endl;
        
        // Test mutex operations (safe but slower)
        shared_counter = 0;
        threads.clear();
        
        start_time = std::chrono::high_resolution_clock::now();
        
        for (int i = 0; i < 4; ++i) {
            threads.emplace_back(safe_mutex_increment);
        }
        
        for (auto& t : threads) {
            t.join();
        }
        
        end_time = std::chrono::high_resolution_clock::now();
        duration = std::chrono::duration_cast<std::chrono::microseconds>(end_time - start_time);
        
        std::cout << "Safe mutex counter result: " << shared_counter << std::endl;
        std::cout << "Mutex operations took: " << duration.count() << " microseconds" << std::endl;
    }
};

// Static member definitions
int DataRaceExamples::shared_counter = 0;
std::vector<int> DataRaceExamples::shared_vector;
std::mutex DataRaceExamples::safe_mutex;

// ========================================
// EXHIBIT 12: MEMORY ORDERING VIOLATIONS
// ========================================

class MemoryOrderingViolations {
private:
    static std::atomic<bool> ready;
    static std::atomic<int> data;
    static int non_atomic_data;
    
public:
    // UNDEFINED BEHAVIOR: Missing memory ordering
    static void weak_memory_ordering_producer() {
        non_atomic_data = 42;
        
        // UB: Without proper memory ordering, the write to non_atomic_data
        // might be reordered after the ready flag
        ready.store(true, std::memory_order_relaxed);  // May be reordered!
    }
    
    static void weak_memory_ordering_consumer() {
        while (!ready.load(std::memory_order_relaxed)) {
            std::this_thread::yield();
        }
        
        // UB: non_atomic_data might not be visible due to weak ordering
        std::cout << "Consumer sees: " << non_atomic_data << std::endl;  // May see stale value
    }
    
    // SAFE: Proper memory ordering
    static void strong_memory_ordering_producer() {
        non_atomic_data = 42;
        
        // Safe: Release ordering ensures all prior writes are visible
        ready.store(true, std::memory_order_release);
    }
    
    static void strong_memory_ordering_consumer() {
        while (!ready.load(std::memory_order_acquire)) {
            std::this_thread::yield();
        }
        
        // Safe: Acquire ordering ensures all writes before release are visible
        std::cout << "Consumer safely sees: " << non_atomic_data << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Sequential consistency violation
    static std::atomic<int> x{0}, y{0};
    static int r1, r2;
    
    static void thread1_seq_consistency() {
        x.store(1, std::memory_order_relaxed);
        r1 = y.load(std::memory_order_relaxed);
    }
    
    static void thread2_seq_consistency() {
        y.store(1, std::memory_order_relaxed);
        r2 = x.load(std::memory_order_relaxed);
    }
    
    // With relaxed ordering, both r1 and r2 can be 0 simultaneously!
    // This violates programmer intuition about sequential execution
    
    static void safe_seq_consistency_thread1() {
        x.store(1, std::memory_order_seq_cst);
        r1 = y.load(std::memory_order_seq_cst);
    }
    
    static void safe_seq_consistency_thread2() {
        y.store(1, std::memory_order_seq_cst);
        r2 = x.load(std::memory_order_seq_cst);
    }
    
    static void demonstrate_memory_ordering() {
        std::cout << "\\n=== MEMORY ORDERING EXAMPLES ===" << std::endl;
        
        // Reset shared data
        ready = false;
        non_atomic_data = 0;
        
        // Test strong memory ordering (safe)
        std::thread producer(strong_memory_ordering_producer);
        std::thread consumer(strong_memory_ordering_consumer);
        
        producer.join();
        consumer.join();
        
        // Test sequential consistency
        x = 0;
        y = 0;
        r1 = 0;
        r2 = 0;
        
        std::thread t1(safe_seq_consistency_thread1);
        std::thread t2(safe_seq_consistency_thread2);
        
        t1.join();
        t2.join();
        
        std::cout << "Sequential consistency test - r1: " << r1 << ", r2: " << r2 << std::endl;
        std::cout << "(At least one should be 1 with seq_cst ordering)" << std::endl;
    }
};

// Static member definitions  
std::atomic<bool> MemoryOrderingViolations::ready{false};
std::atomic<int> MemoryOrderingViolations::data{0};
int MemoryOrderingViolations::non_atomic_data = 0;
std::atomic<int> MemoryOrderingViolations::x{0};
std::atomic<int> MemoryOrderingViolations::y{0};
int MemoryOrderingViolations::r1 = 0;
int MemoryOrderingViolations::r2 = 0;

// ========================================
// EXHIBIT 13: SHARED_PTR THREAD SAFETY ISSUES
// ========================================

class SharedPtrThreadSafety {
private:
    struct Resource {
        int data;
        std::string name;
        
        Resource(int d, const std::string& n) : data(d), name(n) {
            std::cout << "Resource " << name << " created\\n";
        }
        
        ~Resource() {
            std::cout << "Resource " << name << " destroyed\\n";
        }
        
        void process() const {
            std::cout << "Processing " << name << " with data " << data << "\\n";
        }
    };
    
    static std::shared_ptr<Resource> global_resource;
    static std::mutex resource_mutex;
    
public:
    // UNDEFINED BEHAVIOR: shared_ptr assignment race
    static void dangerous_shared_ptr_assignment() {
        // Multiple threads assigning to the same shared_ptr
        for (int i = 0; i < 100; ++i) {
            global_resource = std::make_shared<Resource>(i, "Resource" + std::to_string(i));
            // UB: Data race on shared_ptr control block
        }
    }
    
    // UNDEFINED BEHAVIOR: shared_ptr copy race  
    static void dangerous_shared_ptr_copy() {
        // Multiple threads copying the same shared_ptr
        for (int i = 0; i < 100; ++i) {
            std::shared_ptr<Resource> local_copy = global_resource;  // UB: Data race
            if (local_copy) {
                local_copy->process();
            }
        }
    }
    
    // SAFE: Atomic shared_ptr operations (C++20)
    static std::shared_ptr<Resource> atomic_global_resource;
    
    static void safe_atomic_shared_ptr_assignment() {
        for (int i = 0; i < 100; ++i) {
            auto new_resource = std::make_shared<Resource>(i, "AtomicResource" + std::to_string(i));
            std::atomic_store(&atomic_global_resource, new_resource);
        }
    }
    
    static void safe_atomic_shared_ptr_copy() {
        for (int i = 0; i < 100; ++i) {
            std::shared_ptr<Resource> local_copy = std::atomic_load(&atomic_global_resource);
            if (local_copy) {
                local_copy->process();
            }
        }
    }
    
    // SAFE: Mutex-protected shared_ptr operations
    static void safe_mutex_shared_ptr_assignment() {
        for (int i = 0; i < 100; ++i) {
            auto new_resource = std::make_shared<Resource>(i, "MutexResource" + std::to_string(i));
            
            std::lock_guard<std::mutex> lock(resource_mutex);
            global_resource = new_resource;
        }
    }
    
    static void safe_mutex_shared_ptr_copy() {
        for (int i = 0; i < 100; ++i) {
            std::shared_ptr<Resource> local_copy;
            
            {
                std::lock_guard<std::mutex> lock(resource_mutex);
                local_copy = global_resource;
            }
            
            if (local_copy) {
                local_copy->process();
            }
        }
    }
    
    static void demonstrate_shared_ptr_safety() {
        std::cout << "\\n=== SHARED_PTR THREAD SAFETY ===" << std::endl;
        
        // Initialize with a resource
        global_resource = std::make_shared<Resource>(0, "Initial");
        atomic_global_resource = std::make_shared<Resource>(0, "InitialAtomic");
        
        std::vector<std::thread> threads;
        
        // Test atomic shared_ptr operations (if available)
        std::cout << "Testing atomic shared_ptr operations:" << std::endl;
        
        for (int i = 0; i < 2; ++i) {
            threads.emplace_back(safe_atomic_shared_ptr_assignment);
            threads.emplace_back(safe_atomic_shared_ptr_copy);
        }
        
        for (auto& t : threads) {
            t.join();
        }
        
        threads.clear();
        
        // Test mutex-protected operations
        std::cout << "\\nTesting mutex-protected shared_ptr operations:" << std::endl;
        
        for (int i = 0; i < 2; ++i) {
            threads.emplace_back(safe_mutex_shared_ptr_assignment);
            threads.emplace_back(safe_mutex_shared_ptr_copy);
        }
        
        for (auto& t : threads) {
            t.join();
        }
        
        std::cout << "Shared_ptr thread safety demonstration complete" << std::endl;
    }
};

// Static member definitions
std::shared_ptr<SharedPtrThreadSafety::Resource> SharedPtrThreadSafety::global_resource;
std::shared_ptr<SharedPtrThreadSafety::Resource> SharedPtrThreadSafety::atomic_global_resource;
std::mutex SharedPtrThreadSafety::resource_mutex;

// ========================================
// EXHIBIT 14: LOCK-FREE DATA STRUCTURE PITFALLS
// ========================================

class LockFreeUB {
private:
    // UNDEFINED BEHAVIOR: ABA Problem
    struct Node {
        std::atomic<int> value;
        std::atomic<Node*> next;
        
        Node(int v) : value(v), next(nullptr) {}
    };
    
    std::atomic<Node*> head{nullptr};
    
public:
    // UNDEFINED BEHAVIOR: ABA problem in lock-free stack
    void dangerous_lock_free_push(int value) {
        Node* new_node = new Node(value);
        Node* old_head;
        
        do {
            old_head = head.load();
            new_node->next = old_head;
            // ABA problem: head might have changed back to old_head
            // but the structure might be completely different
        } while (!head.compare_exchange_weak(old_head, new_node));
    }
    
    Node* dangerous_lock_free_pop() {
        Node* old_head;
        Node* new_head;
        
        do {
            old_head = head.load();
            if (old_head == nullptr) {
                return nullptr;
            }
            
            new_head = old_head->next.load();
            // UB: old_head might be deleted by another thread here!
            
        } while (!head.compare_exchange_weak(old_head, new_head));
        
        return old_head;  // Might be deleted!
    }
    
    // SAFE: Hazard pointer technique (simplified)
    class HazardPointer {
        static constexpr int MAX_HAZARDS = 100;
        static std::atomic<Node*> hazards[MAX_HAZARDS];
        static std::atomic<int> hazard_count;
        
    public:
        static void protect(Node* ptr) {
            for (int i = 0; i < MAX_HAZARDS; ++i) {
                Node* expected = nullptr;
                if (hazards[i].compare_exchange_strong(expected, ptr)) {
                    break;
                }
            }
        }
        
        static void unprotect(Node* ptr) {
            for (int i = 0; i < MAX_HAZARDS; ++i) {
                Node* expected = ptr;
                if (hazards[i].compare_exchange_strong(expected, nullptr)) {
                    break;
                }
            }
        }
        
        static bool is_protected(Node* ptr) {
            for (int i = 0; i < MAX_HAZARDS; ++i) {
                if (hazards[i].load() == ptr) {
                    return true;
                }
            }
            return false;
        }
    };
    
    Node* safe_lock_free_pop() {
        Node* old_head;
        Node* new_head;
        
        do {
            old_head = head.load();
            if (old_head == nullptr) {
                return nullptr;
            }
            
            // Protect old_head from deletion
            HazardPointer::protect(old_head);
            
            // Re-check after protection
            if (head.load() != old_head) {
                HazardPointer::unprotect(old_head);
                continue;
            }
            
            new_head = old_head->next.load();
            
        } while (!head.compare_exchange_weak(old_head, new_head));
        
        HazardPointer::unprotect(old_head);
        return old_head;
    }
    
    static void demonstrate_lock_free_issues() {
        std::cout << "\\n=== LOCK-FREE DATA STRUCTURE PITFALLS ===" << std::endl;
        std::cout << "Lock-free programming requires careful consideration of:" << std::endl;
        std::cout << "1. ABA Problem - Values changing back to original" << std::endl;
        std::cout << "2. Memory reclamation - When is it safe to delete?" << std::endl;
        std::cout << "3. Memory ordering - What ordering guarantees are needed?" << std::endl;
        std::cout << "4. Progress guarantees - Wait-free vs lock-free vs obstruction-free" << std::endl;
        
        LockFreeUB stack;
        
        // Safe operations only for demonstration
        stack.dangerous_lock_free_push(1);
        stack.dangerous_lock_free_push(2);
        stack.dangerous_lock_free_push(3);
        
        Node* popped = stack.safe_lock_free_pop();
        if (popped) {
            std::cout << "Safely popped: " << popped->value.load() << std::endl;
            delete popped;
        }
        
        std::cout << "Lock-free structures require specialized techniques!" << std::endl;
    }
};

// Static member definitions for HazardPointer
std::atomic<LockFreeUB::Node*> LockFreeUB::HazardPointer::hazards[LockFreeUB::HazardPointer::MAX_HAZARDS];
std::atomic<int> LockFreeUB::HazardPointer::hazard_count{0};

// Main demonstration function
void demonstrate_concurrent_ub() {
    std::cout << "\\n=== UNDEFINED BEHAVIOR MUSEUM - CONCURRENT PROGRAMMING ===" << std::endl;
    std::cout << "WARNING: This code demonstrates DANGEROUS concurrent patterns!" << std::endl;
    std::cout << "DO NOT use these patterns in production code!\\n" << std::endl;
    
    DataRaceExamples::demonstrate_data_races();
    MemoryOrderingViolations::demonstrate_memory_ordering();
    SharedPtrThreadSafety::demonstrate_shared_ptr_safety();
    LockFreeUB::demonstrate_lock_free_issues();
    
    std::cout << "\\n=== END OF CONCURRENT UB EXHIBIT ===" << std::endl;
}`
    },
    {
      title: state.language === 'en' ? 'Implementation-Defined & Modern C++ UB Traps' : 'Comportamiento Definido por Implementación y Trampas UB de C++ Moderno',
      code: `#include <memory>
#include <iostream>
#include <limits>
#include <type_traits>
#include <concepts>
#include <ranges>
#include <span>
#include <string_view>
#include <bit>
#include <cstring>

// ========================================
// EXHIBIT 15: IMPLEMENTATION-DEFINED BEHAVIOR THAT CAN BECOME UB
// ========================================

class ImplementationDefinedTraps {
public:
    // IMPLEMENTATION-DEFINED: Signed integer overflow (becomes UB)
    void signed_integer_overflow_trap() {
        int max_int = std::numeric_limits<int>::max();
        
        std::cout << "Max int: " << max_int << std::endl;
        std::cout << "Max int + 1: ";
        
        // UNDEFINED BEHAVIOR: Signed integer overflow
        int overflow = max_int + 1;  // UB in C++
        std::cout << overflow << std::endl;  // Unpredictable result
        
        // SAFE: Use unsigned or check for overflow
        if (max_int == std::numeric_limits<int>::max()) {
            std::cout << "Would overflow, cannot add 1 safely" << std::endl;
        }
        
        // SAFE: Use unsigned arithmetic
        unsigned int u_max = std::numeric_limits<unsigned int>::max();
        unsigned int u_overflow = u_max + 1u;  // Well-defined: wraps to 0
        std::cout << "Unsigned max + 1: " << u_overflow << std::endl;
    }
    
    // IMPLEMENTATION-DEFINED: Bit shift operations
    void bit_shift_traps() {
        int value = 42;
        
        // UNDEFINED BEHAVIOR: Shifting by negative amount
        // int ub1 = value << -1;  // UB
        
        // UNDEFINED BEHAVIOR: Shifting by >= width of type
        // int ub2 = value << 32;  // UB on 32-bit int
        
        // UNDEFINED BEHAVIOR: Right shift of negative signed value (implementation-defined)
        int negative = -42;
        int shifted = negative >> 1;  // Implementation-defined behavior
        std::cout << "Right shift of negative: " << shifted << std::endl;
        
        // SAFE: Check shift amount
        auto safe_left_shift = [](int val, int shift) -> std::optional<int> {
            if (shift < 0 || shift >= static_cast<int>(sizeof(int) * 8)) {
                return std::nullopt;  // Invalid shift
            }
            
            // Check for overflow
            if (val > 0 && val > (std::numeric_limits<int>::max() >> shift)) {
                return std::nullopt;  // Would overflow
            }
            
            return val << shift;
        };
        
        auto result = safe_left_shift(42, 2);
        if (result.has_value()) {
            std::cout << "Safe left shift: " << *result << std::endl;
        }
    }
    
    // IMPLEMENTATION-DEFINED: Enum underlying type and value range
    enum Color { RED, GREEN, BLUE };
    enum class Status : char { ACTIVE = 1, INACTIVE = 2, UNKNOWN = 100 };
    
    void enum_value_traps() {
        // UNDEFINED BEHAVIOR: Out-of-range enum value
        Color invalid_color = static_cast<Color>(999);  // UB if 999 not in range
        
        std::cout << "Invalid color value: " << invalid_color << std::endl;  // Unpredictable
        
        // SAFE: Validate enum values
        auto safe_color_cast = [](int value) -> std::optional<Color> {
            switch (value) {
                case RED:
                case GREEN:
                case BLUE:
                    return static_cast<Color>(value);
                default:
                    return std::nullopt;
            }
        };
        
        auto color = safe_color_cast(1);  // GREEN
        if (color.has_value()) {
            std::cout << "Safe color: " << *color << std::endl;
        }
        
        // Scoped enum is safer but still has issues
        Status status = static_cast<Status>(50);  // May be valid depending on underlying type
        std::cout << "Status value: " << static_cast<int>(status) << std::endl;
    }
    
    // IMPLEMENTATION-DEFINED: Floating point representation
    void floating_point_traps() {
        float f = 1.0f;
        
        // UNDEFINED BEHAVIOR: Assuming IEEE 754 representation
        uint32_t* int_repr = reinterpret_cast<uint32_t*>(&f);  // UB: strict aliasing
        std::cout << "Float as int (UB): " << std::hex << *int_repr << std::endl;
        
        // SAFE: Use std::bit_cast (C++20) or memcpy
        uint32_t safe_repr = std::bit_cast<uint32_t>(f);
        std::cout << "Float as int (safe): " << std::hex << safe_repr << std::endl;
        
        // Or with memcpy
        uint32_t memcpy_repr;
        std::memcpy(&memcpy_repr, &f, sizeof(f));
        std::cout << "Float as int (memcpy): " << std::hex << memcpy_repr << std::endl;
    }
    
    // IMPLEMENTATION-DEFINED: Pointer size and representation
    void pointer_representation_traps() {
        int x = 42;
        int* ptr = &x;
        
        // IMPLEMENTATION-DEFINED: Converting pointer to integer
        uintptr_t ptr_as_int = reinterpret_cast<uintptr_t>(ptr);
        std::cout << "Pointer as integer: " << std::hex << ptr_as_int << std::endl;
        
        // UNDEFINED BEHAVIOR: Converting arbitrary integer to pointer
        int* dangerous_ptr = reinterpret_cast<int*>(0x12345678);  // UB if not valid address
        // *dangerous_ptr = 42;  // UB: dereferencing invalid pointer
        
        // SAFE: Only convert valid pointer values back
        int* restored_ptr = reinterpret_cast<int*>(ptr_as_int);
        if (restored_ptr == ptr) {
            std::cout << "Pointer round-trip successful: " << *restored_ptr << std::endl;
        }
        
        // Platform-specific size assumptions are dangerous
        static_assert(sizeof(void*) >= sizeof(uint32_t), "Pointer must fit in uint32_t");
        // This assert might fail on 64-bit systems if you assume 32-bit pointers
    }
};

// ========================================
// EXHIBIT 16: MODERN C++ UB TRAPS
// ========================================

class ModernCppUBTraps {
public:
    // UNDEFINED BEHAVIOR: Structured bindings lifetime issues
    void structured_bindings_ub() {
        // UNDEFINED BEHAVIOR: Temporary object lifetime
        auto get_pair = []() { return std::make_pair(42, std::string("hello")); };
        
        // UB: auto& binds to references to temporary members
        auto& [value, str] = get_pair();  // UB: temporary destroyed
        
        // UB: Using dangling references
        std::cout << "Value: " << value << ", String: " << str << std::endl;  // UB
        
        // SAFE: Copy the temporary
        auto [safe_value, safe_str] = get_pair();  // Copies, no references
        std::cout << "Safe - Value: " << safe_value << ", String: " << safe_str << std::endl;
        
        // SAFE: Store temporary first
        auto temp_pair = get_pair();
        auto& [ref_value, ref_str] = temp_pair;  // Safe: temp_pair lives long enough
        std::cout << "Safe refs - Value: " << ref_value << ", String: " << ref_str << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Concepts and SFINAE issues
    template<typename T>
    concept HasToString = requires(T t) {
        t.toString();
    };
    
    struct GoodType {
        std::string toString() const { return "GoodType"; }
    };
    
    struct BadType {
        // No toString method
    };
    
    void concepts_ub_traps() {
        // This works fine
        auto process_good = [](HasToString auto obj) {
            return obj.toString();
        };
        
        GoodType good;
        std::cout << "Good type: " << process_good(good) << std::endl;
        
        // UNDEFINED BEHAVIOR: Concept check can be bypassed with explicit instantiation
        // BadType bad;
        // std::cout << process_good(bad) << std::endl;  // Compilation error (good!)
        
        // DANGEROUS: Template specialization bypassing concept
        template<>
        std::string process_specialized<BadType>(BadType) {
            return "Specialized for BadType";  // Bypasses concept requirement
        }
        
        // This could lead to UB if the specialization makes wrong assumptions
        
        std::cout << "Concept validation prevents UB" << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: std::span lifetime issues
    void span_lifetime_ub() {
        std::span<int> dangerous_span;
        
        {
            std::vector<int> vec = {1, 2, 3, 4, 5};
            dangerous_span = std::span(vec);  // span refers to vector
        }  // vector destroyed here
        
        // UB: span now refers to destroyed vector
        // std::cout << "Span size: " << dangerous_span.size() << std::endl;  // UB
        // for (auto x : dangerous_span) { std::cout << x << " "; }  // UB
        
        // SAFE: Ensure underlying data outlives span
        std::vector<int> safe_vec = {1, 2, 3, 4, 5};
        std::span<int> safe_span(safe_vec);
        
        std::cout << "Safe span access:" << std::endl;
        for (auto x : safe_span) {
            std::cout << x << " ";
        }
        std::cout << std::endl;
        
        // SAFE: Copy data if span needs to outlive source
        std::vector<int> copied_data;
        {
            std::vector<int> temp_vec = {6, 7, 8, 9, 10};
            std::span<int> temp_span(temp_vec);
            copied_data.assign(temp_span.begin(), temp_span.end());
        }
        
        std::cout << "Copied data: ";
        for (auto x : copied_data) {
            std::cout << x << " ";
        }
        std::cout << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: string_view lifetime issues
    void string_view_lifetime_ub() {
        std::string_view dangerous_view;
        
        {
            std::string temp_str = "temporary string";
            dangerous_view = temp_str;  // string_view refers to temp_str
        }  // temp_str destroyed here
        
        // UB: string_view now refers to destroyed string
        // std::cout << "Dangerous view: " << dangerous_view << std::endl;  // UB
        
        // SAFE: Ensure string outlives string_view
        std::string safe_str = "persistent string";
        std::string_view safe_view = safe_str;
        std::cout << "Safe string_view: " << safe_view << std::endl;
        
        // SAFE: Create string from string_view if needed
        std::string copied_str;
        {
            std::string temp_str = "another temporary";
            std::string_view temp_view = temp_str;
            copied_str = std::string(temp_view);  // Copy the data
        }
        std::cout << "Copied from string_view: " << copied_str << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Ranges lifetime issues
    void ranges_lifetime_ub() {
        auto get_vector = []() {
            return std::vector<int>{1, 2, 3, 4, 5};
        };
        
        // UB: Range refers to temporary vector
        auto dangerous_range = get_vector() | std::views::filter([](int x) { return x % 2 == 0; });
        
        // UB: Temporary vector destroyed, range is now invalid
        // for (auto x : dangerous_range) {  // UB
        //     std::cout << x << " ";
        // }
        
        // SAFE: Store the source container
        auto source_vec = get_vector();
        auto safe_range = source_vec | std::views::filter([](int x) { return x % 2 == 0; });
        
        std::cout << "Safe ranges access: ";
        for (auto x : safe_range) {
            std::cout << x << " ";
        }
        std::cout << std::endl;
        
        // SAFE: Materialize the range if needed
        std::vector<int> materialized;
        auto temp_range = get_vector() | std::views::filter([](int x) { return x % 2 == 0; });
        std::ranges::copy(temp_range, std::back_inserter(materialized));
        
        std::cout << "Materialized range: ";
        for (auto x : materialized) {
            std::cout << x << " ";
        }
        std::cout << std::endl;
    }
    
    // UNDEFINED BEHAVIOR: Coroutine lifetime issues (C++20)
    #ifdef __cpp_impl_coroutine
    struct SimpleGenerator {
        struct promise_type {
            int current_value;
            
            SimpleGenerator get_return_object() {
                return SimpleGenerator{std::coroutine_handle<promise_type>::from_promise(*this)};
            }
            
            std::suspend_always initial_suspend() { return {}; }
            std::suspend_always final_suspend() noexcept { return {}; }
            void unhandled_exception() {}
            
            std::suspend_always yield_value(int value) {
                current_value = value;
                return {};
            }
            
            void return_void() {}
        };
        
        std::coroutine_handle<promise_type> coro;
        
        SimpleGenerator(std::coroutine_handle<promise_type> h) : coro(h) {}
        
        ~SimpleGenerator() {
            if (coro) coro.destroy();
        }
        
        bool move_next() {
            coro.resume();
            return !coro.done();
        }
        
        int current() {
            return coro.promise().current_value;
        }
    };
    
    SimpleGenerator dangerous_generator(std::vector<int>& vec) {  // Reference parameter
        for (int x : vec) {
            co_yield x * 2;
        }
    }
    
    void coroutine_lifetime_ub() {
        SimpleGenerator gen;
        
        {
            std::vector<int> temp_vec = {1, 2, 3, 4, 5};
            gen = dangerous_generator(temp_vec);  // Coroutine captures reference
        }  // temp_vec destroyed here
        
        // UB: Coroutine frame still holds reference to destroyed vector
        // while (gen.move_next()) {  // UB
        //     std::cout << gen.current() << " ";
        // }
        
        std::cout << "Coroutine lifetime management requires careful attention" << std::endl;
    }
    #endif
};

// ========================================
// EXHIBIT 17: COMPILER-SPECIFIC UB VARIATIONS
// ========================================

class CompilerSpecificUB {
public:
    void compiler_optimization_traps() {
        std::cout << "\\n=== COMPILER-SPECIFIC UB PATTERNS ===" << std::endl;
        
        // Different compilers may optimize UB differently
        int* p = nullptr;
        
        // Some compilers optimize this away entirely
        if (p != nullptr) {
            *p = 42;  // Never executed due to null check
        }
        
        // But this might be "optimized" incorrectly
        if (p == nullptr) {
            std::cout << "Pointer is null" << std::endl;
        } else {
            *p = 42;  // UB: Compiler might assume p is never null
        }
        
        // Compiler might optimize based on UB assumptions:
        // - Dead code elimination
        // - Loop optimization  
        // - Constant propagation
        // - Alias analysis
        
        std::cout << "Different compilers handle UB differently:" << std::endl;
        std::cout << "- GCC: Aggressive optimization assumptions" << std::endl;
        std::cout << "- Clang: Similar to GCC with different diagnostics" << std::endl;
        std::cout << "- MSVC: More conservative in some cases" << std::endl;
        std::cout << "- ICC: Intel-specific optimizations" << std::endl;
        
        // Debug vs Release builds can expose UB differently
        std::cout << "\\nDebug vs Release differences:" << std::endl;
        std::cout << "- Debug: May initialize memory, less optimization" << std::endl;
        std::cout << "- Release: Aggressive optimization may expose UB" << std::endl;
        std::cout << "- Optimization levels change UB manifestation" << std::endl;
    }
    
    void platform_specific_ub() {
        std::cout << "\\n=== PLATFORM-SPECIFIC UB VARIATIONS ===" << std::endl;
        
        // Different platforms handle UB differently:
        std::cout << "Platform differences in UB handling:" << std::endl;
        std::cout << "- x86/x64: Relaxed memory model, unaligned access often OK" << std::endl;  
        std::cout << "- ARM: Stricter alignment requirements" << std::endl;
        std::cout << "- MIPS: Big-endian considerations" << std::endl;
        std::cout << "- Embedded: Limited memory protection" << std::endl;
        
        // Address space layout randomization affects pointer UB
        std::cout << "\\nASLR effects on pointer UB:" << std::endl;
        std::cout << "- Makes pointer value assumptions dangerous" << std::endl;
        std::cout << "- Affects reproducibility of pointer-related UB" << std::endl;
        
        // Operating system differences  
        std::cout << "\\nOS differences:" << std::endl;
        std::cout << "- Linux: Various sanitizers available" << std::endl;
        std::cout << "- Windows: Different heap implementation" << std::endl;
        std::cout << "- macOS: Additional security features" << std::endl;
        
        // Architecture-specific alignment
        struct AlignmentTest {
            char c;
            int i;
        };
        
        std::cout << "\\nAlignment example:" << std::endl;
        std::cout << "AlignmentTest size: " << sizeof(AlignmentTest) << std::endl;
        std::cout << "char alignment: " << alignof(char) << std::endl;
        std::cout << "int alignment: " << alignof(int) << std::endl;
    }
};

// Main demonstration function
void demonstrate_modern_implementation_ub() {
    std::cout << "\\n=== UNDEFINED BEHAVIOR MUSEUM - MODERN C++ & IMPLEMENTATION-DEFINED ===" << std::endl;
    std::cout << "WARNING: This code demonstrates subtle UB patterns in modern C++!" << std::endl;
    std::cout << "These patterns can be especially dangerous because they often work in debug builds!\\n" << std::endl;
    
    ImplementationDefinedTraps impl_traps;
    impl_traps.signed_integer_overflow_trap();
    impl_traps.bit_shift_traps();
    impl_traps.enum_value_traps();
    impl_traps.floating_point_traps();
    impl_traps.pointer_representation_traps();
    
    ModernCppUBTraps modern_traps;
    modern_traps.structured_bindings_ub();
    modern_traps.concepts_ub_traps();
    modern_traps.span_lifetime_ub();
    modern_traps.string_view_lifetime_ub();
    modern_traps.ranges_lifetime_ub();
    
    #ifdef __cpp_impl_coroutine
    modern_traps.coroutine_lifetime_ub();
    #endif
    
    CompilerSpecificUB compiler_ub;
    compiler_ub.compiler_optimization_traps();
    compiler_ub.platform_specific_ub();
    
    std::cout << "\\n=== END OF MODERN C++ UB EXHIBIT ===" << std::endl;
    
    std::cout << "\\n=== UB PREVENTION TOOLKIT ===" << std::endl;
    std::cout << "Essential tools for UB detection and prevention:" << std::endl;
    std::cout << "1. Static Analysis: clang-static-analyzer, PVS-Studio, PC-lint" << std::endl;
    std::cout << "2. Dynamic Analysis: AddressSanitizer, MemorySanitizer, ThreadSanitizer" << std::endl;
    std::cout << "3. Undefined Behavior Sanitizer (UBSan)" << std::endl;
    std::cout << "4. Valgrind (memcheck, helgrind, drd)" << std::endl;
    std::cout << "5. Compiler warnings: -Wall -Wextra -Wpedantic" << std::endl;
    std::cout << "6. Code review and pair programming" << std::endl;
    std::cout << "7. Unit testing with different compiler/platform combinations" << std::endl;
    std::cout << "8. Fuzzing tools for input validation" << std::endl;
    std::cout << "\\nRemember: UB is not just about crashes - it can cause silent corruption!" << std::endl;
}`
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 103: The Undefined Behavior Museum' : 'Lección 103: El Museo del Comportamiento Indefinido'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4444" />
          <UndefinedBehaviorVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="museum-introduction">
          <SectionTitle>{state.language === 'en' ? '🏛️ Welcome to the Undefined Behavior Museum' : '🏛️ Bienvenido al Museo del Comportamiento Indefinido'}</SectionTitle>
<div className="warning-banner">
            <SectionTitle>⚠️ {state.language === 'en' ? 'CRITICAL WARNING' : 'ADVERTENCIA CRÍTICA'} ⚠️</SectionTitle>
            <p>
              {state.language === 'en' 
                ? 'This museum contains DANGEROUS code patterns that demonstrate undefined behavior in C++. These examples are for EDUCATIONAL PURPOSES ONLY and should NEVER be used in production code. Many examples are commented out to prevent crashes during demonstration.'
                : 'Este museo contiene patrones de código PELIGROSOS que demuestran comportamiento indefinido en C++. Estos ejemplos son SOLO para PROPÓSITOS EDUCATIVOS y NUNCA deben usarse en código de producción. Muchos ejemplos están comentados para prevenir crashes durante la demostración.'}
            </p>
          </div>
        </div>

        <div className="examples-section">
          <SectionTitle>{state.language === 'en' ? 'Museum Exhibits' : 'Exhibiciones del Museo'}</SectionTitle>
<div className="example-tabs">
            {exhibits.map((exhibit, index) => (
              <button
                key={index}
                className={`tab ${currentExhibit === index ? 'active' : ''}`}
                onClick={() => setCurrentExhibit(index)}
              >
                {exhibit.title}
              </button>
            ))}
          </div>

          <div className="example-content">
            <pre className="code-block">
              <code>{exhibits[currentExhibit]?.code ?? ''}</code>
            </pre>
          </div>
        </div>

        <div className="theory-section">
          <SectionTitle>{state.language === 'en' ? 'Undefined Behavior Categories' : 'Categorías de Comportamiento Indefinido'}</SectionTitle>
<div className="concept-grid">
            <div className="concept-card danger">
              <SectionTitle>{state.language === 'en' ? '💀 Classic Pointer UB' : '💀 UB Clásico de Punteros'}</SectionTitle>
              <p>
                {state.language === 'en' 
                  ? 'Null dereference, use-after-free, double delete, buffer overflows - the foundational UB patterns that every C++ developer must avoid.'
                  : 'Desreferencia nula, use-after-free, doble delete, desbordamientos de buffer - los patrones UB fundamentales que todo desarrollador de C++ debe evitar.'}
              </p>
          </div>
            
            <div className="concept-card warning">
              <SectionTitle>{state.language === 'en' ? '⚡ Alignment & Memory Layout' : '⚡ Alineación y Layout de Memoria'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Misaligned access, padding assumptions, type punning violations - subtle UB that varies by architecture and compiler.'
                  : 'Acceso mal alineado, asunciones de padding, violaciones de type punning - UB sutil que varía por arquitectura y compilador.'}
              </p>
          </div>
            
            <div className="concept-card error">
              <SectionTitle>{state.language === 'en' ? '🔄 Iterator & Pointer Arithmetic' : '🔄 Iteradores y Aritmética de Punteros'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Container modification during iteration, pointer arithmetic beyond bounds, iterator invalidation - common sources of UB in modern C++.'
                  : 'Modificación de contenedores durante iteración, aritmética de punteros fuera de límites, invalidación de iteradores - fuentes comunes de UB en C++ moderno.'}
              </p>
          </div>
            
            <div className="concept-card critical">
              <SectionTitle>{state.language === 'en' ? '⚛️ Concurrent & Memory Ordering' : '⚛️ Concurrencia y Ordenamiento de Memoria'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Data races, memory ordering violations, ABA problems, shared_ptr thread safety - UB in multithreaded environments.'
                  : 'Data races, violaciones de ordenamiento de memoria, problemas ABA, thread safety de shared_ptr - UB en entornos multihilo.'}
              </p>
          </div>
            
            <div className="concept-card modern">
              <SectionTitle>{state.language === 'en' ? '🆕 Modern C++ UB Traps' : '🆕 Trampas UB de C++ Moderno'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Structured bindings lifetime, span/string_view dangling, ranges temporaries, coroutine frame lifetime - new UB patterns in C++17/20.'
                  : 'Ciclo de vida de structured bindings, span/string_view colgantes, temporales de ranges, ciclo de vida de frames de corrutinas - nuevos patrones UB en C++17/20.'}
              </p>
          </div>
            
            <div className="concept-card implementation">
              <SectionTitle>{state.language === 'en' ? '🔧 Implementation-Defined Traps' : '🔧 Trampas Definidas por Implementación'}</SectionTitle>
<p>
                {state.language === 'en'
                  ? 'Signed overflow, bit shifts, enum values, floating point representation - implementation-defined behavior that can become UB.'
                  : 'Overflow de enteros con signo, bit shifts, valores de enum, representación de punto flotante - comportamiento definido por implementación que puede volverse UB.'}
              </p>
          </div>
          </div>
        </div>

        <div className="ub-prevention-toolkit">
          <SectionTitle>{state.language === 'en' ? '🛠️ UB Prevention & Detection Toolkit' : '🛠️ Herramientas de Prevención y Detección de UB'}</SectionTitle>
<div className="toolkit-grid">
            <div className="tool-category">
              <SectionTitle>{state.language === 'en' ? 'Static Analysis' : 'Análisis Estático'}</SectionTitle>
              <ul>
                <li>clang-static-analyzer</li>
                <li>PVS-Studio</li>
                <li>PC-lint Plus</li>
                <li>Coverity</li>
                <li>SonarQube C++</li>
              </ul>
          </div>
            
            <div className="tool-category">
              <SectionTitle>{state.language === 'en' ? 'Runtime Sanitizers' : 'Sanitizadores en Tiempo de Ejecución'}</SectionTitle>
<ul>
                <li>AddressSanitizer (ASan)</li>
                <li>MemorySanitizer (MSan)</li>
                <li>ThreadSanitizer (TSan)</li>
                <li>UndefinedBehaviorSanitizer (UBSan)</li>
                <li>LeakSanitizer (LSan)</li>
              </ul>
          </div>
            
            <div className="tool-category">
              <SectionTitle>{state.language === 'en' ? 'Memory Analysis' : 'Análisis de Memoria'}</SectionTitle>
<ul>
                <li>Valgrind (memcheck)</li>
                <li>Dr. Memory</li>
                <li>Intel Inspector</li>
                <li>Heap analysis tools</li>
                <li>Memory profilers</li>
              </ul>
          </div>
            
            <div className="tool-category">
              <SectionTitle>{state.language === 'en' ? 'Compiler Features' : 'Características del Compilador'}</SectionTitle>
<ul>
                <li>-Wall -Wextra -Wpedantic</li>
                <li>-Werror (warnings as errors)</li>
                <li>-fsanitize=undefined</li>
                <li>-fstack-protector</li>
                <li>Debug vs Release testing</li>
              </ul>
          </div>
          </div>
        </div>

        <div className="best-practices">
          <SectionTitle>{state.language === 'en' ? '🎯 Expert UB Prevention Strategies' : '🎯 Estrategias Expertas de Prevención de UB'}</SectionTitle>
<ul>
            <li>
              {state.language === 'en'
                ? 'Never assume implementation-defined behavior - use standard library abstractions and checks'
                : 'Nunca asumas comportamiento definido por implementación - usa abstracciones de biblioteca estándar y verificaciones'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Apply RAII principles consistently to prevent resource-related UB (use-after-free, double delete)'
                : 'Aplica principios RAII consistentemente para prevenir UB relacionado con recursos (use-after-free, doble delete)'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Use smart pointers, containers, and algorithms instead of raw pointers and manual memory management'
                : 'Usa punteros inteligentes, contenedores y algoritmos en lugar de punteros crudos y gestión manual de memoria'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Enable all relevant compiler warnings and sanitizers in development and testing environments'
                : 'Habilita todas las advertencias relevantes del compilador y sanitizadores en entornos de desarrollo y prueba'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Understand lifetime relationships in modern C++ features (span, string_view, structured bindings, ranges)'
                : 'Entiende las relaciones de ciclo de vida en características modernas de C++ (span, string_view, structured bindings, ranges)'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Test on multiple compilers, architectures, and optimization levels to catch platform-specific UB'
                : 'Prueba en múltiples compiladores, arquitecturas y niveles de optimización para detectar UB específico de plataforma'}
            </li>
          </ul>
          </div>

        <div className="danger-levels">
          <SectionTitle>{state.language === 'en' ? '☠️ UB Danger Classification' : '☠️ Clasificación de Peligro UB'}</SectionTitle>
<div className="danger-classification">
            <div className="danger-level critical">
              <span className="danger-icon">💀</span>
              <InteractiveSection>
          <SectionTitle>{state.language === 'en' ? 'CRITICAL UB' : 'UB CRÍTICO'}</SectionTitle>
                <p>{state.language === 'en' ? 'Memory corruption, crashes, security vulnerabilities' : 'Corrupción de memoria, crashes, vulnerabilidades de seguridad'}</p>
                <ul>
                  <li>{state.language === 'en' ? 'Buffer overflows, use-after-free' : 'Desbordamientos de buffer, use-after-free'}</li>
                  <li>{state.language === 'en' ? 'Null pointer dereference' : 'Desreferencia de puntero nulo'}</li>
                  <li>{state.language === 'en' ? 'Data races in multithreaded code' : 'Data races en código multihilo'}</li>
                </ul>
          </InteractiveSection>
            </div>
            
            <div className="danger-level high">
              <span className="danger-icon">⚡</span>
              <InteractiveSection>
          <SectionTitle>{state.language === 'en' ? 'HIGH UB' : 'UB ALTO'}</SectionTitle>
<p>{state.language === 'en' ? 'Unpredictable results, optimization issues' : 'Resultados impredecibles, problemas de optimización'}</p>
                <ul>
                  <li>{state.language === 'en' ? 'Signed integer overflow' : 'Overflow de enteros con signo'}</li>
                  <li>{state.language === 'en' ? 'Iterator invalidation' : 'Invalidación de iteradores'}</li>
                  <li>{state.language === 'en' ? 'Strict aliasing violations' : 'Violaciones de strict aliasing'}</li>
                </ul>
          </InteractiveSection>
            </div>
            
            <div className="danger-level medium">
              <span className="danger-icon">⚠️</span>
              <InteractiveSection>
          <SectionTitle>{state.language === 'en' ? 'MEDIUM UB' : 'UB MEDIO'}</SectionTitle>
<p>{state.language === 'en' ? 'Platform-dependent behavior, subtle bugs' : 'Comportamiento dependiente de plataforma, bugs sutiles'}</p>
                <ul>
                  <li>{state.language === 'en' ? 'Alignment issues on some architectures' : 'Problemas de alineación en algunas arquitecturas'}</li>
                  <li>{state.language === 'en' ? 'Enum value out of range' : 'Valor de enum fuera de rango'}</li>
                  <li>{state.language === 'en' ? 'Implementation-defined integer conversions' : 'Conversiones de enteros definidas por implementación'}</li>
                </ul>
          </InteractiveSection>
            </div>
          </div>
        </div>

        <div className="museum-conclusion">
          <SectionTitle>{state.language === 'en' ? '🎓 Museum Graduation' : '🎓 Graduación del Museo'}</SectionTitle>
<div className="conclusion-content">
            <p>
              {state.language === 'en'
                ? 'Congratulations! You have completed your journey through the Undefined Behavior Museum. You now possess comprehensive knowledge of C++ UB patterns, from classic pointer mistakes to modern C++20 pitfalls. This knowledge makes you a safer, more reliable C++ developer.'
                : '¡Felicidades! Has completado tu viaje a través del Museo del Comportamiento Indefinido. Ahora posees conocimiento comprensivo de patrones UB de C++, desde errores clásicos de punteros hasta trampas modernas de C++20. Este conocimiento te convierte en un desarrollador de C++ más seguro y confiable.'}
            </p>
            
            <div className="key-takeaways">
              <SectionTitle>{state.language === 'en' ? 'Key Takeaways:' : 'Puntos Clave:'}</SectionTitle>
              <ul>
                <li>{state.language === 'en' ? 'UB is not just about crashes - it can cause silent data corruption' : 'UB no es solo sobre crashes - puede causar corrupción silenciosa de datos'}</li>
                <li>{state.language === 'en' ? 'Modern C++ features introduce new UB patterns alongside solutions' : 'Las características modernas de C++ introducen nuevos patrones UB junto con soluciones'}</li>
                <li>{state.language === 'en' ? 'Different compilers and platforms can expose UB in different ways' : 'Diferentes compiladores y plataformas pueden exponer UB de diferentes maneras'}</li>
                <li>{state.language === 'en' ? 'Prevention is better than detection - design for safety from the start' : 'La prevención es mejor que la detección - diseña para seguridad desde el inicio'}</li>
                <li>{state.language === 'en' ? 'Tools and techniques exist to catch most UB patterns' : 'Existen herramientas y técnicas para detectar la mayoría de patrones UB'}</li>
              </ul>
          </div>
            
            <div className="final-wisdom">
              <p><strong>
                {state.language === 'en'
                  ? '"With great pointer power comes great responsibility. Use your UB knowledge to write safer, more reliable C++ code."'
                  : '"Con gran poder de punteros viene gran responsabilidad. Usa tu conocimiento de UB para escribir código C++ más seguro y confiable."'}
              </strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}