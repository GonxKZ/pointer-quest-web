/**
 * Lesson 77: Advanced String Optimization Techniques
 * Expert-level string performance patterns for high-performance systems
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, BufferGeometry, BufferAttribute, MeshBasicMaterial, MeshStandardMaterial, Group } from 'three';
import {
  LessonLayout,
  Section,
  SectionTitle,
  InteractiveSection,
  LearningObjectives,
  Button,
  ButtonGroup,
  CodeBlock,
  PerformanceMonitor,
  AccessibilityAnnouncer
} from '../design-system';

interface StringOptState {
  language: 'en' | 'es';
  scenario: 'sso_analysis' | 'simd_operations' | 'string_interning' | 'rope_structures';
  isAnimating: boolean;
  allocations: number;
  simdOps: number;
  cacheHits: number;
  memoryUsage: number;
}

// 3D Visualización de String Optimization
const StringOptimizationVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'sso_analysis') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        allocations: Math.max(0, 100 - Math.floor(animationRef.current * 5) % 120),
        memoryUsage: 50 + Math.sin(animationRef.current) * 30,
        cacheHits: 80 + Math.cos(animationRef.current * 2) * 15
      });
    } else if (scenario === 'simd_operations') {
      groupRef.current.rotation.x = Math.sin(animationRef.current) * 0.15;
      onMetrics({
        simdOps: Math.floor(animationRef.current * 50) % 2000,
        throughput: Math.floor(5000 + Math.sin(animationRef.current * 3) * 2000),
        vectorization: 90 + Math.sin(animationRef.current) * 8
      });
    }
  });

  const renderStringElements = () => {
    const elements = [];
    const elementCount = scenario === 'rope_structures' ? 32 : 16;
    
    for (let i = 0; i < elementCount; i++) {
      const angle = (i / elementCount) * Math.PI * 2;
      const radius = scenario === 'string_interning' ? 2.5 : 2.0;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = scenario === 'rope_structures' ? Math.sin(i * 0.5) * 0.5 : 0;
      
      const color = scenario === 'sso_analysis' 
        ? (i < 8 ? '#00ff00' : '#ff8000')  // Green for SSO, orange for heap
        : scenario === 'simd_operations'
        ? '#0080ff'
        : scenario === 'string_interning'
        ? (i % 3 === 0 ? '#ffff00' : '#ffffff')  // Yellow for interned strings
        : '#ff00ff';  // Magenta for rope nodes
      
      elements.push(
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
    
    return elements;
  };

  return (
    <group ref={groupRef}>
      {renderStringElements()}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, 5]} intensity={0.5} />
    </group>
  );
};

const Lesson77_StringOptimization: React.FC = () => {
  const [state, setState] = useState<StringOptState>({
    language: 'en',
    scenario: 'sso_analysis',
    isAnimating: false,
    allocations: 0,
    simdOps: 0,
    cacheHits: 0,
    memoryUsage: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: StringOptState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      sso_analysis: state.language === 'en' ? 'SSO Analysis' : 'Análisis SSO',
      simd_operations: state.language === 'en' ? 'SIMD Operations' : 'Operaciones SIMD',
      string_interning: state.language === 'en' ? 'String Interning' : 'String Interning',
      rope_structures: state.language === 'en' ? 'Rope Structures' : 'Estructuras Rope'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    sso_analysis: `// Small String Optimization (SSO) Implementation
#include <string>
#include <chrono>
#include <vector>
#include <iostream>
#include <memory>

// Custom SSO String Implementation
class SSOString {
private:
    static constexpr size_t SSO_SIZE = 15; // 15 chars + null terminator
    
    struct HeapData {
        char* data;
        size_t size;
        size_t capacity;
    };
    
    union Storage {
        char sso_buffer[SSO_SIZE + 1];
        HeapData heap;
    } storage_;
    
    bool is_sso() const { 
        return (storage_.sso_buffer[SSO_SIZE] & 0x80) == 0; 
    }
    
public:
    SSOString() {
        storage_.sso_buffer[0] = '\\0';
        storage_.sso_buffer[SSO_SIZE] = 0; // SSO marker
    }
    
    SSOString(const char* str) {
        size_t len = strlen(str);
        if (len <= SSO_SIZE) {
            // Small string - store inline
            memcpy(storage_.sso_buffer, str, len + 1);
            storage_.sso_buffer[SSO_SIZE] = static_cast<char>(len);
        } else {
            // Large string - heap allocation
            storage_.heap.size = len;
            storage_.heap.capacity = len + 1;
            storage_.heap.data = new char[storage_.heap.capacity];
            memcpy(storage_.heap.data, str, len + 1);
            storage_.sso_buffer[SSO_SIZE] = 0x80; // Heap marker
        }
    }
    
    ~SSOString() {
        if (!is_sso()) {
            delete[] storage_.heap.data;
        }
    }
    
    const char* data() const {
        return is_sso() ? storage_.sso_buffer : storage_.heap.data;
    }
    
    size_t size() const {
        return is_sso() ? (storage_.sso_buffer[SSO_SIZE] & 0x7F) : storage_.heap.size;
    }
    
    bool uses_heap() const { return !is_sso(); }
};

// Performance Comparison
void benchmark_sso() {
    constexpr int iterations = 1000000;
    
    // Test short strings (SSO friendly)
    auto start = std::chrono::high_resolution_clock::now();
    std::vector<SSOString> short_strings;
    short_strings.reserve(iterations);
    
    for (int i = 0; i < iterations; ++i) {
        short_strings.emplace_back("Hello");  // 5 chars, fits in SSO
    }
    
    auto sso_time = std::chrono::high_resolution_clock::now() - start;
    
    // Test long strings (heap allocation)
    start = std::chrono::high_resolution_clock::now();
    std::vector<SSOString> long_strings;
    long_strings.reserve(iterations);
    
    for (int i = 0; i < iterations; ++i) {
        long_strings.emplace_back("This is a very long string that exceeds SSO buffer");
    }
    
    auto heap_time = std::chrono::high_resolution_clock::now() - start;
    
    std::cout << "SSO strings time: " << 
        std::chrono::duration_cast<std::chrono::microseconds>(sso_time).count() << " μs\\n";
    std::cout << "Heap strings time: " << 
        std::chrono::duration_cast<std::chrono::microseconds>(heap_time).count() << " μs\\n";
    
    // Memory usage analysis
    size_t sso_memory = short_strings.size() * sizeof(SSOString);
    size_t heap_memory = long_strings.size() * sizeof(SSOString);
    for (const auto& s : long_strings) {
        if (s.uses_heap()) heap_memory += s.size() + 1;
    }
    
    std::cout << "SSO memory usage: " << sso_memory << " bytes\\n";
    std::cout << "Heap memory usage: " << heap_memory << " bytes\\n";
}`,

    simd_operations: `// SIMD String Operations for High Performance
#include <immintrin.h>
#include <string>
#include <chrono>
#include <cstring>
#include <algorithm>

// SIMD String Search (AVX2)
size_t simd_find_char(const char* str, size_t len, char target) {
    const __m256i target_vec = _mm256_set1_epi8(target);
    size_t i = 0;
    
    // Process 32 bytes at a time with AVX2
    for (; i + 32 <= len; i += 32) {
        __m256i data = _mm256_loadu_si256(reinterpret_cast<const __m256i*>(str + i));
        __m256i cmp = _mm256_cmpeq_epi8(data, target_vec);
        uint32_t mask = _mm256_movemask_epi8(cmp);
        
        if (mask != 0) {
            return i + __builtin_ctz(mask); // Count trailing zeros
        }
    }
    
    // Handle remaining bytes
    for (; i < len; ++i) {
        if (str[i] == target) return i;
    }
    
    return std::string::npos;
}

// SIMD String Comparison
int simd_strcmp(const char* s1, const char* s2, size_t len) {
    size_t i = 0;
    
    // Compare 32 bytes at a time
    for (; i + 32 <= len; i += 32) {
        __m256i v1 = _mm256_loadu_si256(reinterpret_cast<const __m256i*>(s1 + i));
        __m256i v2 = _mm256_loadu_si256(reinterpret_cast<const __m256i*>(s2 + i));
        __m256i cmp = _mm256_cmpeq_epi8(v1, v2);
        uint32_t mask = _mm256_movemask_epi8(cmp);
        
        if (mask != 0xFFFFFFFF) {
            // Found difference, find exact position
            for (size_t j = i; j < std::min(i + 32, len); ++j) {
                if (s1[j] != s2[j]) {
                    return static_cast<unsigned char>(s1[j]) - static_cast<unsigned char>(s2[j]);
                }
            }
        }
    }
    
    // Compare remaining bytes
    return memcmp(s1 + i, s2 + i, len - i);
}

// SIMD String Copy with alignment optimization
void simd_strcpy(char* dest, const char* src, size_t len) {
    size_t i = 0;
    
    // Align destination to 32-byte boundary
    while (i < len && reinterpret_cast<uintptr_t>(dest + i) % 32 != 0) {
        dest[i] = src[i];
        if (src[i] == '\\0') return;
        ++i;
    }
    
    // Copy 32 bytes at a time
    for (; i + 32 <= len; i += 32) {
        __m256i data = _mm256_loadu_si256(reinterpret_cast<const __m256i*>(src + i));
        _mm256_store_si256(reinterpret_cast<__m256i*>(dest + i), data);
        
        // Check for null terminator in this block
        __m256i zeros = _mm256_setzero_si256();
        __m256i cmp = _mm256_cmpeq_epi8(data, zeros);
        uint32_t mask = _mm256_movemask_epi8(cmp);
        
        if (mask != 0) {
            // Found null terminator
            return;
        }
    }
    
    // Copy remaining bytes
    memcpy(dest + i, src + i, len - i);
}

// Performance benchmarking
void benchmark_simd_operations() {
    const size_t test_size = 1000000;
    const size_t string_len = 1024;
    
    // Create test strings
    std::string haystack(string_len, 'a');
    haystack[string_len - 100] = 'x'; // Target character
    
    auto start = std::chrono::high_resolution_clock::now();
    
    // SIMD find benchmark
    for (size_t i = 0; i < test_size; ++i) {
        volatile size_t pos = simd_find_char(haystack.c_str(), haystack.size(), 'x');
        (void)pos; // Prevent optimization
    }
    
    auto simd_time = std::chrono::high_resolution_clock::now() - start;
    
    // Standard library comparison
    start = std::chrono::high_resolution_clock::now();
    
    for (size_t i = 0; i < test_size; ++i) {
        volatile size_t pos = haystack.find('x');
        (void)pos;
    }
    
    auto std_time = std::chrono::high_resolution_clock::now() - start;
    
    std::cout << "SIMD find: " << 
        std::chrono::duration_cast<std::chrono::microseconds>(simd_time).count() << " μs\\n";
    std::cout << "std::find: " << 
        std::chrono::duration_cast<std::chrono::microseconds>(std_time).count() << " μs\\n";
}`,

    string_interning: `// String Interning and Flyweight Pattern
#include <unordered_set>
#include <unordered_map>
#include <string>
#include <memory>
#include <mutex>
#include <shared_mutex>

// Thread-safe String Intern Pool
class StringInternPool {
private:
    mutable std::shared_mutex mutex_;
    std::unordered_set<std::string> pool_;
    std::unordered_map<std::string, size_t> usage_count_;
    
public:
    // Intern a string - returns pointer to pooled instance
    const std::string* intern(const std::string& str) {
        std::shared_lock read_lock(mutex_);
        
        auto it = pool_.find(str);
        if (it != pool_.end()) {
            // String already interned
            return &(*it);
        }
        
        // Upgrade to write lock
        read_lock.unlock();
        std::unique_lock write_lock(mutex_);
        
        // Double-check after acquiring write lock
        it = pool_.find(str);
        if (it != pool_.end()) {
            return &(*it);
        }
        
        // Insert new string
        auto [inserted_it, success] = pool_.insert(str);
        usage_count_[str] = 1;
        
        return &(*inserted_it);
    }
    
    // Intern from C-string
    const std::string* intern(const char* str) {
        return intern(std::string(str));
    }
    
    // Get usage statistics
    size_t pool_size() const {
        std::shared_lock lock(mutex_);
        return pool_.size();
    }
    
    size_t usage_count(const std::string& str) const {
        std::shared_lock lock(mutex_);
        auto it = usage_count_.find(str);
        return it != usage_count_.end() ? it->second : 0;
    }
    
    // Memory usage estimation
    size_t memory_usage() const {
        std::shared_lock lock(mutex_);
        size_t total = 0;
        for (const auto& str : pool_) {
            total += str.size() + sizeof(std::string);
        }
        return total;
    }
    
    // Cleanup unused strings (call periodically)
    void cleanup_unused() {
        std::unique_lock lock(mutex_);
        
        auto it = usage_count_.begin();
        while (it != usage_count_.end()) {
            if (it->second == 0) {
                pool_.erase(it->first);
                it = usage_count_.erase(it);
            } else {
                ++it;
            }
        }
    }
};

// Global intern pool instance
StringInternPool& get_intern_pool() {
    static StringInternPool pool;
    return pool;
}

// Interned string wrapper
class InternedString {
private:
    const std::string* str_ptr_;
    
public:
    InternedString(const std::string& str) 
        : str_ptr_(get_intern_pool().intern(str)) {}
        
    InternedString(const char* str) 
        : str_ptr_(get_intern_pool().intern(str)) {}
        
    // Copy is cheap - just pointer copy
    InternedString(const InternedString&) = default;
    InternedString& operator=(const InternedString&) = default;
    
    const std::string& get() const { return *str_ptr_; }
    const char* c_str() const { return str_ptr_->c_str(); }
    size_t size() const { return str_ptr_->size(); }
    
    // Identity comparison is pointer comparison
    bool operator==(const InternedString& other) const {
        return str_ptr_ == other.str_ptr_;
    }
    
    bool operator!=(const InternedString& other) const {
        return str_ptr_ != other.str_ptr_;
    }
    
    // Hash is pointer hash
    struct Hash {
        size_t operator()(const InternedString& is) const {
            return std::hash<const void*>{}(is.str_ptr_);
        }
    };
};

// Usage example: Configuration system
class ConfigurationManager {
private:
    std::unordered_map<InternedString, std::string, InternedString::Hash> config_;
    
public:
    void set(const std::string& key, const std::string& value) {
        config_[InternedString(key)] = value;
    }
    
    std::string get(const std::string& key) const {
        auto it = config_.find(InternedString(key));
        return it != config_.end() ? it->second : "";
    }
    
    // Fast key comparison due to interning
    bool has_key(const std::string& key) const {
        return config_.find(InternedString(key)) != config_.end();
    }
};

// Performance comparison
void benchmark_interning() {
    constexpr int iterations = 100000;
    std::vector<std::string> test_keys = {
        "user.name", "user.email", "app.version", "db.host", "db.port"
    };
    
    // Regular string map
    auto start = std::chrono::high_resolution_clock::now();
    std::unordered_map<std::string, int> regular_map;
    
    for (int i = 0; i < iterations; ++i) {
        const auto& key = test_keys[i % test_keys.size()];
        regular_map[key] = i;
    }
    
    auto regular_time = std::chrono::high_resolution_clock::now() - start;
    
    // Interned string map
    start = std::chrono::high_resolution_clock::now();
    std::unordered_map<InternedString, int, InternedString::Hash> interned_map;
    
    for (int i = 0; i < iterations; ++i) {
        const auto& key = test_keys[i % test_keys.size()];
        interned_map[InternedString(key)] = i;
    }
    
    auto interned_time = std::chrono::high_resolution_clock::now() - start;
    
    std::cout << "Regular strings: " << 
        std::chrono::duration_cast<std::chrono::microseconds>(regular_time).count() << " μs\\n";
    std::cout << "Interned strings: " << 
        std::chrono::duration_cast<std::chrono::microseconds>(interned_time).count() << " μs\\n";
    
    std::cout << "Intern pool size: " << get_intern_pool().pool_size() << std::endl;
    std::cout << "Memory usage: " << get_intern_pool().memory_usage() << " bytes\\n";
}`,

    rope_structures: `// Rope Data Structure for Efficient String Operations
#include <memory>
#include <string>
#include <vector>
#include <iostream>
#include <algorithm>

// Rope node types
enum class RopeNodeType { LEAF, CONCATENATION };

class RopeNode {
public:
    RopeNodeType type;
    size_t weight; // Number of characters in left subtree
    
    virtual ~RopeNode() = default;
    virtual std::string to_string() const = 0;
    virtual char at(size_t index) const = 0;
    virtual size_t size() const = 0;
    virtual std::shared_ptr<RopeNode> substring(size_t start, size_t length) const = 0;
};

// Leaf node containing actual string data
class RopeLeaf : public RopeNode {
private:
    std::string data_;
    
public:
    RopeLeaf(std::string data) : data_(std::move(data)) {
        type = RopeNodeType::LEAF;
        weight = data_.size();
    }
    
    std::string to_string() const override {
        return data_;
    }
    
    char at(size_t index) const override {
        if (index >= data_.size()) throw std::out_of_range("Index out of range");
        return data_[index];
    }
    
    size_t size() const override {
        return data_.size();
    }
    
    std::shared_ptr<RopeNode> substring(size_t start, size_t length) const override {
        if (start >= data_.size()) return std::make_shared<RopeLeaf>("");
        size_t end = std::min(start + length, data_.size());
        return std::make_shared<RopeLeaf>(data_.substr(start, end - start));
    }
    
    const std::string& data() const { return data_; }
};

// Internal node representing concatenation
class RopeConcatenation : public RopeNode {
private:
    std::shared_ptr<RopeNode> left_;
    std::shared_ptr<RopeNode> right_;
    
public:
    RopeConcatenation(std::shared_ptr<RopeNode> left, std::shared_ptr<RopeNode> right)
        : left_(std::move(left)), right_(std::move(right)) {
        type = RopeNodeType::CONCATENATION;
        weight = left_->size();
    }
    
    std::string to_string() const override {
        return left_->to_string() + right_->to_string();
    }
    
    char at(size_t index) const override {
        if (index < weight) {
            return left_->at(index);
        } else {
            return right_->at(index - weight);
        }
    }
    
    size_t size() const override {
        return left_->size() + right_->size();
    }
    
    std::shared_ptr<RopeNode> substring(size_t start, size_t length) const override {
        if (start >= size() || length == 0) {
            return std::make_shared<RopeLeaf>("");
        }
        
        size_t end = std::min(start + length, size());
        
        if (end <= weight) {
            // Substring entirely in left subtree
            return left_->substring(start, length);
        } else if (start >= weight) {
            // Substring entirely in right subtree
            return right_->substring(start - weight, length);
        } else {
            // Substring spans both subtrees
            auto left_part = left_->substring(start, weight - start);
            auto right_part = right_->substring(0, end - weight);
            return std::make_shared<RopeConcatenation>(left_part, right_part);
        }
    }
    
    std::shared_ptr<RopeNode> left() const { return left_; }
    std::shared_ptr<RopeNode> right() const { return right_; }
};

// Main Rope class
class Rope {
private:
    std::shared_ptr<RopeNode> root_;
    
    // Balance the rope to prevent degenerate trees
    std::shared_ptr<RopeNode> balance(std::shared_ptr<RopeNode> node) {
        if (!node || node->type == RopeNodeType::LEAF) return node;
        
        auto concat = std::static_pointer_cast<RopeConcatenation>(node);
        size_t left_depth = depth(concat->left());
        size_t right_depth = depth(concat->right());
        
        // Simple balancing: if one subtree is much deeper, restructure
        if (left_depth > right_depth + 2) {
            return rotate_right(concat);
        } else if (right_depth > left_depth + 2) {
            return rotate_left(concat);
        }
        
        return node;
    }
    
    size_t depth(std::shared_ptr<RopeNode> node) {
        if (!node || node->type == RopeNodeType::LEAF) return 0;
        auto concat = std::static_pointer_cast<RopeConcatenation>(node);
        return 1 + std::max(depth(concat->left()), depth(concat->right()));
    }
    
    std::shared_ptr<RopeNode> rotate_right(std::shared_ptr<RopeConcatenation> node) {
        if (node->left()->type == RopeNodeType::LEAF) return node;
        
        auto left_concat = std::static_pointer_cast<RopeConcatenation>(node->left());
        auto new_right = std::make_shared<RopeConcatenation>(left_concat->right(), node->right());
        return std::make_shared<RopeConcatenation>(left_concat->left(), new_right);
    }
    
    std::shared_ptr<RopeNode> rotate_left(std::shared_ptr<RopeConcatenation> node) {
        if (node->right()->type == RopeNodeType::LEAF) return node;
        
        auto right_concat = std::static_pointer_cast<RopeConcatenation>(node->right());
        auto new_left = std::make_shared<RopeConcatenation>(node->left(), right_concat->left());
        return std::make_shared<RopeConcatenation>(new_left, right_concat->right());
    }
    
public:
    Rope() : root_(std::make_shared<RopeLeaf>("")) {}
    
    Rope(const std::string& str) : root_(std::make_shared<RopeLeaf>(str)) {}
    
    Rope(std::shared_ptr<RopeNode> root) : root_(std::move(root)) {}
    
    // Concatenate two ropes
    Rope operator+(const Rope& other) const {
        auto new_root = std::make_shared<RopeConcatenation>(root_, other.root_);
        Rope result(new_root);
        result.root_ = result.balance(result.root_);
        return result;
    }
    
    // Get character at index
    char at(size_t index) const {
        return root_->at(index);
    }
    
    char operator[](size_t index) const {
        return at(index);
    }
    
    // Get substring
    Rope substring(size_t start, size_t length) const {
        return Rope(root_->substring(start, length));
    }
    
    // Convert to string
    std::string to_string() const {
        return root_->to_string();
    }
    
    size_t size() const {
        return root_->size();
    }
    
    bool empty() const {
        return size() == 0;
    }
    
    // Insert at position (creates new rope)
    Rope insert(size_t pos, const std::string& str) const {
        if (pos == 0) {
            return Rope(str) + *this;
        } else if (pos >= size()) {
            return *this + Rope(str);
        } else {
            auto left = substring(0, pos);
            auto right = substring(pos, size() - pos);
            return left + Rope(str) + right;
        }
    }
    
    // Delete range (creates new rope)
    Rope erase(size_t start, size_t length) const {
        if (start >= size()) return *this;
        
        auto left = substring(0, start);
        auto right = substring(start + length, size() - start - length);
        return left + right;
    }
};

// Performance comparison with std::string
void benchmark_rope_operations() {
    constexpr int iterations = 10000;
    const std::string base_str = "Hello, World! ";
    
    // std::string concatenation benchmark
    auto start = std::chrono::high_resolution_clock::now();
    std::string std_result = base_str;
    
    for (int i = 0; i < iterations; ++i) {
        std_result += base_str; // O(n) operation each time
    }
    
    auto std_time = std::chrono::high_resolution_clock::now() - start;
    
    // Rope concatenation benchmark
    start = std::chrono::high_resolution_clock::now();
    Rope rope_result(base_str);
    
    for (int i = 0; i < iterations; ++i) {
        rope_result = rope_result + Rope(base_str); // O(1) operation
    }
    
    auto rope_time = std::chrono::high_resolution_clock::now() - start;
    
    std::cout << "std::string concat: " << 
        std::chrono::duration_cast<std::chrono::milliseconds>(std_time).count() << " ms\\n";
    std::cout << "Rope concat: " << 
        std::chrono::duration_cast<std::chrono::milliseconds>(rope_time).count() << " ms\\n";
    
    // Substring operations benchmark
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 1000; ++i) {
        volatile auto sub = std_result.substr(100, 50); // O(n) copy
        (void)sub;
    }
    auto std_substr_time = std::chrono::high_resolution_clock::now() - start;
    
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 1000; ++i) {
        volatile auto sub = rope_result.substring(100, 50); // O(log n) view
        (void)sub;
    }
    auto rope_substr_time = std::chrono::high_resolution_clock::now() - start;
    
    std::cout << "std::string substr: " << 
        std::chrono::duration_cast<std::chrono::microseconds>(std_substr_time).count() << " μs\\n";
    std::cout << "Rope substr: " << 
        std::chrono::duration_cast<std::chrono::microseconds>(rope_substr_time).count() << " μs\\n";
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 77: String Optimization Techniques" : "Lección 77: Técnicas de Optimización de Strings"}
      lessonId="lesson-77"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'High-Performance String Processing' : 'Procesamiento de Strings de Alto Rendimiento'}
          </SectionTitle>
          <Button 
            onClick={() => setState(prev => ({ ...prev, language: prev.language === 'en' ? 'es' : 'en' }))}
            variant="secondary"
          >
            {state.language === 'en' ? 'Español' : 'English'}
          </Button>
        </div>

        <LearningObjectives
          objectives={
            state.language === 'en' 
              ? [
                  'Understand Small String Optimization (SSO) implementation details',
                  'Implement SIMD-accelerated string operations for performance',
                  'Design string interning systems for memory efficiency',
                  'Create rope data structures for large text manipulation',
                  'Analyze string performance bottlenecks in production systems',
                  'Apply advanced string optimization patterns in real-world scenarios'
                ]
              : [
                  'Entender detalles de implementación de Small String Optimization (SSO)',
                  'Implementar operaciones de string aceleradas por SIMD para rendimiento',
                  'Diseñar sistemas de string interning para eficiencia de memoria',
                  'Crear estructuras de datos rope para manipulación de texto grande',
                  'Analizar cuellos de botella de rendimiento de strings en sistemas de producción',
                  'Aplicar patrones avanzados de optimización de strings en escenarios del mundo real'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive String Optimization Demonstration' : 'Demostración Interactiva de Optimización de Strings'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <StringOptimizationVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('sso_analysis')}
            variant={state.scenario === 'sso_analysis' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'SSO Analysis' : 'Análisis SSO'}
          </Button>
          <Button 
            onClick={() => runScenario('simd_operations')}
            variant={state.scenario === 'simd_operations' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'SIMD Operations' : 'Operaciones SIMD'}
          </Button>
          <Button 
            onClick={() => runScenario('string_interning')}
            variant={state.scenario === 'string_interning' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'String Interning' : 'String Interning'}
          </Button>
          <Button 
            onClick={() => runScenario('rope_structures')}
            variant={state.scenario === 'rope_structures' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Rope Structures' : 'Estructuras Rope'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Allocations' : 'Allocaciones', 
              value: state.allocations,
              color: '#00ff00'
            },
            { 
              label: state.language === 'en' ? 'SIMD Ops/sec' : 'Ops SIMD/seg', 
              value: state.simdOps,
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Cache Hits %' : 'Cache Hits %', 
              value: Math.round(state.cacheHits),
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Memory Usage MB' : 'Uso Memoria MB', 
              value: Math.round(state.memoryUsage),
              color: '#ff0080'
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'sso_analysis' && (state.language === 'en' ? 'Small String Optimization (SSO)' : 'Small String Optimization (SSO)')}
          {state.scenario === 'simd_operations' && (state.language === 'en' ? 'SIMD String Operations' : 'Operaciones SIMD de Strings')}
          {state.scenario === 'string_interning' && (state.language === 'en' ? 'String Interning & Flyweight' : 'String Interning & Flyweight')}
          {state.scenario === 'rope_structures' && (state.language === 'en' ? 'Rope Data Structures' : 'Estructuras de Datos Rope')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'sso_analysis' ? 
              (state.language === 'en' ? 'SSO Implementation' : 'Implementación SSO') :
            state.scenario === 'simd_operations' ? 
              (state.language === 'en' ? 'SIMD String Operations' : 'Operaciones SIMD de Strings') :
            state.scenario === 'string_interning' ? 
              (state.language === 'en' ? 'String Interning System' : 'Sistema de String Interning') :
            (state.language === 'en' ? 'Rope Data Structure' : 'Estructura de Datos Rope')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Advanced Optimization Strategies' : 'Estrategias de Optimización Avanzadas'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #333'
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🚀 Production Optimization Patterns:' : '🚀 Patrones de Optimización de Producción:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'SSO Implementation:' : 'Implementación SSO:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Store short strings inline to eliminate heap allocations for 80% of string usage'
                : 'Almacenar strings cortos inline para eliminar allocaciones heap en 80% del uso de strings'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'SIMD Acceleration:' : 'Aceleración SIMD:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Use vectorized instructions for find, compare, copy operations - 4-8x performance improvement'
                : 'Usar instrucciones vectorizadas para operaciones find, compare, copy - mejora de rendimiento 4-8x'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'String Interning:' : 'String Interning:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Deduplicate identical strings in memory, enable O(1) equality comparison via pointer comparison'
                : 'Deduplicar strings idénticos en memoria, habilitar comparación de igualdad O(1) via comparación de punteros'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Rope Structures:' : 'Estructuras Rope:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Efficient concatenation and substring operations for large text processing scenarios'
                : 'Concatenación eficiente y operaciones de substring para escenarios de procesamiento de texto grande'
              }
            </li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: '#2e1a1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #800'
        }}>
          <h4 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
            {state.language === 'en' ? '⚠️ Performance Considerations:' : '⚠️ Consideraciones de Rendimiento:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'SSO Threshold:' : 'Umbral SSO:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Typical SSO buffer size is 15-23 bytes - optimize for your application\'s string length distribution'
                : 'El tamaño típico del buffer SSO es 15-23 bytes - optimiza para la distribución de longitud de strings de tu aplicación'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'SIMD Alignment:' : 'Alineación SIMD:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Ensure proper memory alignment for SIMD operations - unaligned access can negate performance benefits'
                : 'Asegurar alineación de memoria apropiada para operaciones SIMD - acceso no alineado puede negar beneficios de rendimiento'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Interning Overhead:' : 'Overhead de Interning:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Thread synchronization cost for intern pool - consider lock-free alternatives for high-contention scenarios'
                : 'Costo de sincronización de threads para pool de intern - considera alternativas lock-free para escenarios de alta contención'
              }
            </li>
          </ul>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default Lesson77_StringOptimization;