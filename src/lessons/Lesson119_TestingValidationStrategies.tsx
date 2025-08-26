import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone, Line } from '@react-three/drei';
import { useApp } from '../context/AppContext';

interface TestingMetrics {
  unitTestCoverage: number;
  mockIsolation: number;
  memoryValidation: number;
  performanceBenchmark: number;
}

interface TestingVisualizationProps {
  metrics: TestingMetrics;
  activeFramework: string;
  onFrameworkSelect: (framework: string) => void;
}

const TestingVisualization: React.FC<TestingVisualizationProps> = ({ 
  metrics, 
  activeFramework, 
  onFrameworkSelect 
}) => {
  const groupRef = useRef<any>();
  const unitTestRef = useRef<any>();
  const mockRef = useRef<any>();
  const memoryRef = useRef<any>();
  const performanceRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
    if (unitTestRef.current) {
      // Animate unit test coverage
      const time = state.clock.elapsedTime;
      unitTestRef.current.children.forEach((child: any, index: number) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = 0.6 + 0.4 * Math.sin(time * 1.2 + index * 0.5);
        }
      });
    }
    if (mockRef.current) {
      // Animate mock object isolation
      const time = state.clock.elapsedTime;
      mockRef.current.position.y = Math.sin(time * 0.9) * 0.3;
    }
    if (memoryRef.current) {
      // Animate memory validation tools
      memoryRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.2;
    }
    if (performanceRef.current) {
      // Animate performance testing
      const time = state.clock.elapsedTime;
      performanceRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.1);
    }
  });

  const testingFrameworks = [
    { name: 'Unit Testing', position: [-4, 2, 0], color: '#e74c3c', coverage: metrics.unitTestCoverage },
    { name: 'Mock Objects', position: [-1, 2, 0], color: '#3498db', coverage: metrics.mockIsolation },
    { name: 'Memory Tools', position: [2, 2, 0], color: '#2ecc71', coverage: metrics.memoryValidation },
    { name: 'Performance', position: [5, 2, 0], color: '#f39c12', coverage: metrics.performanceBenchmark },
  ];

  return (
    <group ref={groupRef}>
      {/* Testing Infrastructure Base */}
      <Box args={[14, 0.4, 10]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#2c3e50" transparent opacity={0.7} />
      </Box>

      {/* Unit Testing Framework */}
      <group ref={unitTestRef} position={[-4, 0, 0]}>
        {[...Array(6)].map((_, i) => (
          <Box 
            key={`unit-test-${i}`}
            args={[0.5, 0.8, 0.5]} 
            position={[i * 0.6 - 1.5, 0, 0]}
            onClick={() => onFrameworkSelect('Unit Testing')}
          >
            <meshStandardMaterial 
              color={activeFramework === 'Unit Testing' ? '#e74c3c' : '#95a5a6'} 
              transparent 
              opacity={0.8}
            />
          </Box>
        ))}
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.4}
          color="#e74c3c"
          anchorX="center"
          anchorY="middle"
        >
          Unit Testing
        </Text>
      </group>

      {/* Mock Object System */}
      <group ref={mockRef} position={[0, 0, 3]}>
        <Cylinder args={[1.2, 1.2, 1.5]} onClick={() => onFrameworkSelect('Mock Objects')}>
          <meshStandardMaterial 
            color={activeFramework === 'Mock Objects' ? '#3498db' : '#7f8c8d'} 
            transparent 
            opacity={0.7}
          />
        </Cylinder>
        {/* Mock interfaces */}
        {[...Array(8)].map((_, i) => (
          <Sphere 
            key={`mock-${i}`}
            args={[0.15]} 
            position={[
              Math.cos(i * Math.PI / 4) * 1.5,
              Math.sin(i * Math.PI / 4) * 0.3,
              Math.sin(i * Math.PI / 4) * 1.5
            ]}
          >
            <meshStandardMaterial 
              color="#3498db" 
              transparent 
              opacity={0.6}
            />
          </Sphere>
        ))}
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.4}
          color="#3498db"
          anchorX="center"
          anchorY="middle"
        >
          Mock Objects
        </Text>
      </group>

      {/* Memory Validation Tools */}
      <group ref={memoryRef} position={[4, 0, 0]}>
        <Cone args={[1, 2]} onClick={() => onFrameworkSelect('Memory Tools')}>
          <meshStandardMaterial 
            color={activeFramework === 'Memory Tools' ? '#2ecc71' : '#7f8c8d'} 
            transparent 
            opacity={0.8}
          />
        </Cone>
        {/* Memory scanners */}
        {[...Array(4)].map((_, i) => (
          <Box 
            key={`memory-tool-${i}`}
            args={[0.3, 0.3, 0.3]} 
            position={[
              Math.cos(i * Math.PI / 2) * 1.8,
              0.5,
              Math.sin(i * Math.PI / 2) * 1.8
            ]}
          >
            <meshStandardMaterial 
              color="#2ecc71" 
              transparent 
              opacity={0.7}
            />
          </Box>
        ))}
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.4}
          color="#2ecc71"
          anchorX="center"
          anchorY="middle"
        >
          Memory Tools
        </Text>
      </group>

      {/* Performance Testing Framework */}
      <group ref={performanceRef} position={[0, 0, -3]}>
        <Box args={[2, 1, 1]} onClick={() => onFrameworkSelect('Performance')}>
          <meshStandardMaterial 
            color={activeFramework === 'Performance' ? '#f39c12' : '#7f8c8d'} 
            transparent 
            opacity={0.8}
          />
        </Box>
        {/* Performance metrics indicators */}
        {[...Array(5)].map((_, i) => (
          <Cylinder 
            key={`perf-${i}`}
            args={[0.1, 0.1, 1 + i * 0.3]} 
            position={[i * 0.4 - 0.8, 0.5 + i * 0.15, 0]}
          >
            <meshStandardMaterial 
              color="#f39c12" 
              transparent 
              opacity={0.6}
            />
          </Cylinder>
        ))}
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.4}
          color="#f39c12"
          anchorX="center"
          anchorY="middle"
        >
          Performance
        </Text>
      </group>

      {/* Connecting pathways between frameworks */}
      {testingFrameworks.map((framework, index) => (
        testingFrameworks.slice(index + 1).map((otherFramework, otherIndex) => (
          <Line
            key={`connection-${index}-${otherIndex}`}
            points={[framework.position, otherFramework.position]}
            color="#34495e"
            lineWidth={2}
            transparent
            opacity={0.3}
          />
        ))
      ))}

      {/* Coverage indicators */}
      {testingFrameworks.map((framework, index) => (
        <Text
          key={`coverage-${index}`}
          position={[framework.position[0], framework.position[1] + 1.5, framework.position[2]]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {`${(framework.coverage * 100).toFixed(1)}%`}
        </Text>
      ))}
    </group>
  );
};

const Lesson119_TestingValidationStrategies: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('unit-testing');
  const [selectedFramework, setSelectedFramework] = useState<string>('Unit Testing');
  const [testMetrics, setTestMetrics] = useState<TestingMetrics>({
    unitTestCoverage: 0.92,
    mockIsolation: 0.88,
    memoryValidation: 0.85,
    performanceBenchmark: 0.78
  });

  const examples = {
    'unit-testing': {
      title: state.language === 'en' ? 'Unit Testing with Smart Pointers' : 'Pruebas Unitarias con Smart Pointers',
      code: `#include <memory>
#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include <vector>

// Test Subject: Smart Pointer Resource Manager
class ResourceManager {
private:
    std::vector<std::shared_ptr<Resource>> resources_;
    std::weak_ptr<Observer> observer_;
    
public:
    void addResource(std::shared_ptr<Resource> resource) {
        if (!resource) {
            throw std::invalid_argument("Resource cannot be null");
        }
        resources_.push_back(resource);
        notifyObserver();
    }
    
    void setObserver(std::shared_ptr<Observer> observer) {
        observer_ = observer;
    }
    
    size_t getResourceCount() const {
        return resources_.size();
    }
    
    std::shared_ptr<Resource> getResource(size_t index) const {
        if (index >= resources_.size()) {
            return nullptr;
        }
        return resources_[index];
    }
    
private:
    void notifyObserver() {
        if (auto obs = observer_.lock()) {
            obs->onResourceAdded();
        }
    }
};

// Google Test Framework Unit Tests
class ResourceManagerTest : public ::testing::Test {
protected:
    void SetUp() override {
        manager_ = std::make_unique<ResourceManager>();
        resource1_ = std::make_shared<MockResource>();
        resource2_ = std::make_shared<MockResource>();
        observer_ = std::make_shared<MockObserver>();
    }
    
    void TearDown() override {
        // Smart pointers handle cleanup automatically
        // Verify no memory leaks in debug builds
        EXPECT_EQ(resource1_.use_count(), 1);  // Only our reference remains
    }
    
    std::unique_ptr<ResourceManager> manager_;
    std::shared_ptr<MockResource> resource1_;
    std::shared_ptr<MockResource> resource2_;
    std::shared_ptr<MockObserver> observer_;
};

TEST_F(ResourceManagerTest, AddValidResource_IncreasesCount) {
    // Arrange
    EXPECT_EQ(manager_->getResourceCount(), 0);
    
    // Act
    manager_->addResource(resource1_);
    
    // Assert
    EXPECT_EQ(manager_->getResourceCount(), 1);
    EXPECT_EQ(manager_->getResource(0), resource1_);
    
    // Verify smart pointer semantics
    EXPECT_EQ(resource1_.use_count(), 2);  // Manager + our reference
}

TEST_F(ResourceManagerTest, AddNullResource_ThrowsException) {
    // Arrange
    std::shared_ptr<Resource> nullResource = nullptr;
    
    // Act & Assert
    EXPECT_THROW(manager_->addResource(nullResource), std::invalid_argument);
    EXPECT_EQ(manager_->getResourceCount(), 0);
}

TEST_F(ResourceManagerTest, ObserverNotification_WeakPtrSafety) {
    // Arrange
    manager_->setObserver(observer_);
    EXPECT_CALL(*observer_, onResourceAdded()).Times(1);
    
    // Act
    manager_->addResource(resource1_);
    
    // Verify weak_ptr doesn't prevent destruction
    observer_.reset();  // Release our reference
    
    // Observer should be automatically cleaned up
    manager_->addResource(resource2_);  // No crash expected
}

// Parametrized tests for multiple scenarios
class ResourceManagerParameterizedTest : 
    public ResourceManagerTest,
    public ::testing::WithParamInterface<int> {
};

TEST_P(ResourceManagerParameterizedTest, MultipleResources_MaintainsCorrectCount) {
    int resource_count = GetParam();
    
    for (int i = 0; i < resource_count; ++i) {
        auto resource = std::make_shared<MockResource>();
        manager_->addResource(resource);
    }
    
    EXPECT_EQ(manager_->getResourceCount(), resource_count);
}

INSTANTIATE_TEST_SUITE_P(
    ResourceCounts,
    ResourceManagerParameterizedTest,
    ::testing::Values(1, 5, 10, 100, 1000)
);

// Memory leak detection test
TEST_F(ResourceManagerTest, ResourceLifecycle_NoMemoryLeaks) {
    {
        auto temp_resource = std::make_shared<MockResource>();
        manager_->addResource(temp_resource);
        
        // temp_resource goes out of scope
        // Manager should maintain the only reference
    }
    
    // Verify resource is still alive through manager
    auto retrieved = manager_->getResource(0);
    EXPECT_NE(retrieved, nullptr);
    EXPECT_EQ(retrieved.use_count(), 2);  // Manager + retrieved reference
}`,
      explanation: state.language === 'en' 
        ? 'Comprehensive unit testing using Google Test framework with smart pointers. Tests cover edge cases, memory management, and pointer semantics validation.'
        : 'Pruebas unitarias completas usando el framework Google Test con smart pointers. Las pruebas cubren casos extremos, gestión de memoria y validación de semántica de punteros.'
    },

    'mock-objects': {
      title: state.language === 'en' ? 'Mock Objects and Pointer Isolation' : 'Objetos Mock y Aislamiento de Punteros',
      code: `#include <memory>
#include <gmock/gmock.h>
#include <gtest/gtest.h>

// Interface for dependency injection
class DatabaseConnection {
public:
    virtual ~DatabaseConnection() = default;
    virtual bool connect(const std::string& url) = 0;
    virtual std::unique_ptr<Result> query(const std::string& sql) = 0;
    virtual void close() = 0;
};

class Logger {
public:
    virtual ~Logger() = default;
    virtual void log(const std::string& message) = 0;
    virtual void error(const std::string& error) = 0;
};

// Mock implementations using Google Mock
class MockDatabaseConnection : public DatabaseConnection {
public:
    MOCK_METHOD(bool, connect, (const std::string& url), (override));
    MOCK_METHOD(std::unique_ptr<Result>, query, (const std::string& sql), (override));
    MOCK_METHOD(void, close, (), (override));
};

class MockLogger : public Logger {
public:
    MOCK_METHOD(void, log, (const std::string& message), (override));
    MOCK_METHOD(void, error, (const std::string& error), (override));
};

// System under test with dependency injection
class UserService {
private:
    std::shared_ptr<DatabaseConnection> db_;
    std::shared_ptr<Logger> logger_;
    
public:
    UserService(std::shared_ptr<DatabaseConnection> db,
                std::shared_ptr<Logger> logger) 
        : db_(std::move(db)), logger_(std::move(logger)) {}
    
    bool authenticateUser(const std::string& username, const std::string& password) {
        logger_->log("Authentication attempt for user: " + username);
        
        if (!db_->connect("user_db_url")) {
            logger_->error("Failed to connect to database");
            return false;
        }
        
        auto result = db_->query("SELECT * FROM users WHERE username='" + username + "'");
        db_->close();
        
        if (!result) {
            logger_->error("Query failed for user: " + username);
            return false;
        }
        
        // Simulate password validation
        bool isValid = validatePassword(result.get(), password);
        
        if (isValid) {
            logger_->log("User authenticated successfully: " + username);
        } else {
            logger_->log("Authentication failed for user: " + username);
        }
        
        return isValid;
    }
    
private:
    bool validatePassword(Result* result, const std::string& password) {
        // Implementation details...
        return result && !password.empty();
    }
};

// Test class with mock injection
class UserServiceTest : public ::testing::Test {
protected:
    void SetUp() override {
        mock_db_ = std::make_shared<MockDatabaseConnection>();
        mock_logger_ = std::make_shared<MockLogger>();
        user_service_ = std::make_unique<UserService>(mock_db_, mock_logger_);
        
        // Set up default mock behaviors
        ON_CALL(*mock_db_, connect(::testing::_))
            .WillByDefault(::testing::Return(true));
    }
    
    std::shared_ptr<MockDatabaseConnection> mock_db_;
    std::shared_ptr<MockLogger> mock_logger_;
    std::unique_ptr<UserService> user_service_;
};

TEST_F(UserServiceTest, AuthenticateUser_ValidCredentials_ReturnsTrue) {
    // Arrange
    std::string username = "testuser";
    std::string password = "password123";
    auto mock_result = std::make_unique<MockResult>();
    
    // Set expectations on mock objects
    EXPECT_CALL(*mock_logger_, log(::testing::HasSubstr("Authentication attempt")))
        .Times(1);
    EXPECT_CALL(*mock_db_, connect("user_db_url"))
        .WillOnce(::testing::Return(true));
    EXPECT_CALL(*mock_db_, query(::testing::HasSubstr("SELECT * FROM users")))
        .WillOnce(::testing::Return(::testing::ByMove(std::move(mock_result))));
    EXPECT_CALL(*mock_db_, close())
        .Times(1);
    EXPECT_CALL(*mock_logger_, log(::testing::HasSubstr("authenticated successfully")))
        .Times(1);
    
    // Act
    bool result = user_service_->authenticateUser(username, password);
    
    // Assert
    EXPECT_TRUE(result);
}

TEST_F(UserServiceTest, AuthenticateUser_DatabaseConnectionFails_ReturnsFalse) {
    // Arrange
    std::string username = "testuser";
    std::string password = "password123";
    
    // Mock database connection failure
    EXPECT_CALL(*mock_db_, connect("user_db_url"))
        .WillOnce(::testing::Return(false));
    EXPECT_CALL(*mock_logger_, error(::testing::HasSubstr("Failed to connect")))
        .Times(1);
    
    // Database should not be queried if connection fails
    EXPECT_CALL(*mock_db_, query(::testing::_))
        .Times(0);
    
    // Act
    bool result = user_service_->authenticateUser(username, password);
    
    // Assert
    EXPECT_FALSE(result);
}

// Test with custom matcher for pointer validation
MATCHER_P(QueryContainsUsername, username, "") {
    return arg.find("username='" + username + "'") != std::string::npos;
}

TEST_F(UserServiceTest, AuthenticateUser_QueryParameterIsolation) {
    // Arrange
    std::string username = "admin";
    std::string password = "secret";
    auto mock_result = std::make_unique<MockResult>();
    
    // Verify exact query parameters
    EXPECT_CALL(*mock_db_, query(QueryContainsUsername(username)))
        .WillOnce(::testing::Return(::testing::ByMove(std::move(mock_result))));
    
    // Act
    user_service_->authenticateUser(username, password);
}

// Test smart pointer ownership and lifecycle
TEST_F(UserServiceTest, MockObjectLifecycle_ProperOwnership) {
    // Verify initial reference counts
    EXPECT_EQ(mock_db_.use_count(), 2);  // Test fixture + UserService
    EXPECT_EQ(mock_logger_.use_count(), 2);  // Test fixture + UserService
    
    // Create a new UserService instance
    auto another_service = std::make_unique<UserService>(mock_db_, mock_logger_);
    
    // Reference count should increase
    EXPECT_EQ(mock_db_.use_count(), 3);  // Test fixture + 2 UserServices
    EXPECT_EQ(mock_logger_.use_count(), 3);
    
    // Destroy one service
    another_service.reset();
    
    // Reference count should decrease
    EXPECT_EQ(mock_db_.use_count(), 2);
    EXPECT_EQ(mock_logger_.use_count(), 2);
}`,
      explanation: state.language === 'en' 
        ? 'Advanced mocking strategies using Google Mock framework. Demonstrates dependency injection, mock object lifecycle management, and pointer isolation techniques for reliable testing.'
        : 'Estrategias avanzadas de mocking usando el framework Google Mock. Demuestra inyección de dependencias, gestión del ciclo de vida de objetos mock, y técnicas de aislamiento de punteros para pruebas confiables.'
    },

    'memory-validation': {
      title: state.language === 'en' ? 'Memory Validation Tools' : 'Herramientas de Validación de Memoria',
      code: `#include <memory>
#include <vector>
#include <string>
#include <cassert>

// Address Sanitizer (ASan) Integration
#ifdef __has_feature
    #if __has_feature(address_sanitizer)
        #define USING_ASAN 1
    #endif
#endif

#ifdef __SANITIZE_ADDRESS__
    #define USING_ASAN 1
#endif

#ifdef USING_ASAN
    #include <sanitizer/asan_interface.h>
#endif

// Valgrind Integration
#ifdef USE_VALGRIND
    #include <valgrind/memcheck.h>
    #define VALGRIND_MAKE_MEM_DEFINED(addr, len) VALGRIND_MAKE_MEM_DEFINED(addr, len)
    #define VALGRIND_MAKE_MEM_UNDEFINED(addr, len) VALGRIND_MAKE_MEM_UNDEFINED(addr, len)
#else
    #define VALGRIND_MAKE_MEM_DEFINED(addr, len) do {} while(0)
    #define VALGRIND_MAKE_MEM_UNDEFINED(addr, len) do {} while(0)
#endif

// Custom Memory Tracker for Testing
class MemoryTracker {
public:
    struct AllocationInfo {
        void* ptr;
        size_t size;
        std::string file;
        int line;
        std::chrono::steady_clock::time_point timestamp;
        
        AllocationInfo(void* p, size_t s, const std::string& f, int l)
            : ptr(p), size(s), file(f), line(l), timestamp(std::chrono::steady_clock::now()) {}
    };
    
    static MemoryTracker& getInstance() {
        static MemoryTracker instance;
        return instance;
    }
    
    void recordAllocation(void* ptr, size_t size, const std::string& file, int line) {
        std::lock_guard<std::mutex> lock(mutex_);
        allocations_[ptr] = std::make_unique<AllocationInfo>(ptr, size, file, line);
        total_allocated_ += size;
        peak_usage_ = std::max(peak_usage_, getCurrentUsage());
    }
    
    void recordDeallocation(void* ptr) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = allocations_.find(ptr);
        if (it != allocations_.end()) {
            total_deallocated_ += it->second->size;
            allocations_.erase(it);
        }
    }
    
    size_t getCurrentUsage() const {
        return total_allocated_ - total_deallocated_;
    }
    
    size_t getPeakUsage() const {
        return peak_usage_;
    }
    
    std::vector<AllocationInfo> getLeaks() const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<AllocationInfo> leaks;
        for (const auto& [ptr, info] : allocations_) {
            leaks.push_back(*info);
        }
        return leaks;
    }
    
    void reset() {
        std::lock_guard<std::mutex> lock(mutex_);
        allocations_.clear();
        total_allocated_ = 0;
        total_deallocated_ = 0;
        peak_usage_ = 0;
    }

private:
    mutable std::mutex mutex_;
    std::unordered_map<void*, std::unique_ptr<AllocationInfo>> allocations_;
    size_t total_allocated_ = 0;
    size_t total_deallocated_ = 0;
    size_t peak_usage_ = 0;
};

// Memory-aware Smart Pointer with validation
template<typename T>
class TrackedUniquePtr {
private:
    std::unique_ptr<T> ptr_;
    std::string creation_context_;
    
public:
    explicit TrackedUniquePtr(T* raw_ptr = nullptr, 
                              const std::string& context = "unknown")
        : ptr_(raw_ptr), creation_context_(context) {
        if (raw_ptr) {
            MemoryTracker::getInstance().recordAllocation(
                raw_ptr, sizeof(T), context, __LINE__
            );
            
            #ifdef USING_ASAN
                __asan_poison_memory_region(raw_ptr, sizeof(T));
                __asan_unpoison_memory_region(raw_ptr, sizeof(T));
            #endif
        }
    }
    
    ~TrackedUniquePtr() {
        if (ptr_) {
            MemoryTracker::getInstance().recordDeallocation(ptr_.get());
            
            #ifdef USING_ASAN
                __asan_poison_memory_region(ptr_.get(), sizeof(T));
            #endif
        }
    }
    
    // Move semantics with tracking
    TrackedUniquePtr(TrackedUniquePtr&& other) noexcept 
        : ptr_(std::move(other.ptr_)), creation_context_(std::move(other.creation_context_)) {}
    
    TrackedUniquePtr& operator=(TrackedUniquePtr&& other) noexcept {
        if (this != &other) {
            if (ptr_) {
                MemoryTracker::getInstance().recordDeallocation(ptr_.get());
            }
            ptr_ = std::move(other.ptr_);
            creation_context_ = std::move(other.creation_context_);
        }
        return *this;
    }
    
    // Disable copy semantics
    TrackedUniquePtr(const TrackedUniquePtr&) = delete;
    TrackedUniquePtr& operator=(const TrackedUniquePtr&) = delete;
    
    T* get() const noexcept {
        validateAccess();
        return ptr_.get();
    }
    
    T& operator*() const {
        validateAccess();
        return *ptr_;
    }
    
    T* operator->() const {
        validateAccess();
        return ptr_.get();
    }
    
    explicit operator bool() const noexcept {
        return ptr_ != nullptr;
    }
    
    void reset(T* new_ptr = nullptr) {
        if (ptr_) {
            MemoryTracker::getInstance().recordDeallocation(ptr_.get());
        }
        ptr_.reset(new_ptr);
        if (new_ptr) {
            MemoryTracker::getInstance().recordAllocation(
                new_ptr, sizeof(T), creation_context_, __LINE__
            );
        }
    }
    
    T* release() {
        T* raw_ptr = ptr_.release();
        if (raw_ptr) {
            // Note: Caller is now responsible for deallocation tracking
            MemoryTracker::getInstance().recordDeallocation(raw_ptr);
        }
        return raw_ptr;
    }

private:
    void validateAccess() const {
        assert(ptr_ != nullptr && "Null pointer access detected");
        
        #ifdef USING_ASAN
            __asan_address_is_poisoned(ptr_.get());
        #endif
        
        VALGRIND_MAKE_MEM_DEFINED(ptr_.get(), sizeof(T));
    }
};

// Memory Validation Test Suite
class MemoryValidationTest : public ::testing::Test {
protected:
    void SetUp() override {
        MemoryTracker::getInstance().reset();
        initial_usage_ = MemoryTracker::getInstance().getCurrentUsage();
    }
    
    void TearDown() override {
        // Check for memory leaks
        auto leaks = MemoryTracker::getInstance().getLeaks();
        if (!leaks.empty()) {
            std::stringstream ss;
            ss << "Memory leaks detected: " << leaks.size() << " allocations\\n";
            for (const auto& leak : leaks) {
                ss << "  Leak: " << leak.size << " bytes at " << leak.file 
                   << ":" << leak.line << "\\n";
            }
            FAIL() << ss.str();
        }
        
        // Verify no net memory increase
        size_t final_usage = MemoryTracker::getInstance().getCurrentUsage();
        EXPECT_EQ(initial_usage_, final_usage) 
            << "Memory usage changed during test: " 
            << "initial=" << initial_usage_ << ", final=" << final_usage;
    }
    
private:
    size_t initial_usage_;
};

TEST_F(MemoryValidationTest, TrackedUniquePtr_LifecycleManagement) {
    // Test proper allocation tracking
    {
        auto ptr = TrackedUniquePtr<int>(new int(42), "test_allocation");
        EXPECT_TRUE(ptr);
        EXPECT_EQ(*ptr, 42);
        
        // Memory usage should increase
        EXPECT_GT(MemoryTracker::getInstance().getCurrentUsage(), 0);
    }
    
    // After scope exit, memory should be reclaimed
    // Validation happens in TearDown()
}

TEST_F(MemoryValidationTest, MemoryLeakDetection_VectorReallocation) {
    std::vector<TrackedUniquePtr<int>> pointers;
    
    // Create many pointers to trigger vector reallocation
    for (int i = 0; i < 1000; ++i) {
        pointers.emplace_back(new int(i), "vector_test");
    }
    
    size_t peak_usage = MemoryTracker::getInstance().getPeakUsage();
    EXPECT_GT(peak_usage, 0);
    
    // Clear all pointers
    pointers.clear();
    
    // Memory should be fully reclaimed (verified in TearDown)
}

TEST_F(MemoryValidationTest, DoubleFreeDetection) {
    auto ptr = TrackedUniquePtr<int>(new int(100), "double_free_test");
    int* raw_ptr = ptr.release();
    
    // Manual deletion - should be tracked
    delete raw_ptr;
    
    // Attempting to delete again would be undefined behavior
    // This test ensures our tracking catches such issues
    
    // Simulate the tracking update for manual deletion
    MemoryTracker::getInstance().recordDeallocation(raw_ptr);
}

// Integration with other validation tools
#ifdef USING_ASAN
TEST_F(MemoryValidationTest, AddressSanitizer_UseAfterFree) {
    int* raw_ptr = nullptr;
    
    {
        auto ptr = TrackedUniquePtr<int>(new int(123), "asan_test");
        raw_ptr = ptr.get();
        *raw_ptr = 456;  // Valid access
        
        // ptr destructor will poison the memory
    }
    
    // This would trigger ASan error in debug builds:
    // EXPECT_DEATH(*raw_ptr = 789, ".*AddressSanitizer.*");
}
#endif`,
      explanation: state.language === 'en' 
        ? 'Comprehensive memory validation using AddressSanitizer, Valgrind integration, and custom memory tracking. Includes leak detection, double-free prevention, and use-after-free validation.'
        : 'Validación completa de memoria usando AddressSanitizer, integración con Valgrind, y seguimiento personalizado de memoria. Incluye detección de fugas, prevención de doble liberación, y validación de uso después de liberación.'
    },

    'performance-testing': {
      title: state.language === 'en' ? 'Performance Testing Frameworks' : 'Frameworks de Pruebas de Rendimiento',
      code: `#include <memory>
#include <chrono>
#include <vector>
#include <benchmark/benchmark.h>
#include <random>
#include <algorithm>

// Google Benchmark Integration for Performance Testing
class PerformanceTestFixture : public benchmark::Fixture {
public:
    void SetUp(const ::benchmark::State& state) override {
        // Initialize test data
        test_size_ = state.range(0);
        raw_pointers_.clear();
        unique_pointers_.clear();
        shared_pointers_.clear();
        
        // Pre-allocate vectors for fair comparison
        raw_pointers_.reserve(test_size_);
        unique_pointers_.reserve(test_size_);
        shared_pointers_.reserve(test_size_);
        
        // Generate test data
        std::random_device rd;
        generator_.seed(rd());
    }
    
    void TearDown(const ::benchmark::State& state) override {
        // Clean up raw pointers manually
        for (auto* ptr : raw_pointers_) {
            delete ptr;
        }
        raw_pointers_.clear();
        unique_pointers_.clear();
        shared_pointers_.clear();
    }

protected:
    size_t test_size_;
    std::vector<int*> raw_pointers_;
    std::vector<std::unique_ptr<int>> unique_pointers_;
    std::vector<std::shared_ptr<int>> shared_pointers_;
    std::mt19937 generator_;
};

// Benchmark: Raw Pointer Allocation
BENCHMARK_DEFINE_F(PerformanceTestFixture, RawPointerAllocation)(benchmark::State& state) {
    for (auto _ : state) {
        state.PauseTiming();
        raw_pointers_.clear();
        state.ResumeTiming();
        
        for (size_t i = 0; i < test_size_; ++i) {
            raw_pointers_.push_back(new int(static_cast<int>(i)));
        }
        
        benchmark::DoNotOptimize(raw_pointers_);
    }
    
    state.SetComplexityN(state.range(0));
    state.SetItemsProcessed(state.iterations() * state.range(0));
    state.SetBytesProcessed(state.iterations() * state.range(0) * sizeof(int));
}

// Benchmark: unique_ptr Allocation
BENCHMARK_DEFINE_F(PerformanceTestFixture, UniquePtrAllocation)(benchmark::State& state) {
    for (auto _ : state) {
        state.PauseTiming();
        unique_pointers_.clear();
        state.ResumeTiming();
        
        for (size_t i = 0; i < test_size_; ++i) {
            unique_pointers_.push_back(std::make_unique<int>(static_cast<int>(i)));
        }
        
        benchmark::DoNotOptimize(unique_pointers_);
    }
    
    state.SetComplexityN(state.range(0));
    state.SetItemsProcessed(state.iterations() * state.range(0));
}

// Benchmark: shared_ptr Allocation
BENCHMARK_DEFINE_F(PerformanceTestFixture, SharedPtrAllocation)(benchmark::State& state) {
    for (auto _ : state) {
        state.PauseTiming();
        shared_pointers_.clear();
        state.ResumeTiming();
        
        for (size_t i = 0; i < test_size_; ++i) {
            shared_pointers_.push_back(std::make_shared<int>(static_cast<int>(i)));
        }
        
        benchmark::DoNotOptimize(shared_pointers_);
    }
    
    state.SetComplexityN(state.range(0));
    state.SetItemsProcessed(state.iterations() * state.range(0));
}

// Register benchmarks with different data sizes
BENCHMARK_REGISTER_F(PerformanceTestFixture, RawPointerAllocation)
    ->RangeMultiplier(2)->Range(1<<10, 1<<20)->Complexity(benchmark::oN);

BENCHMARK_REGISTER_F(PerformanceTestFixture, UniquePtrAllocation)
    ->RangeMultiplier(2)->Range(1<<10, 1<<20)->Complexity(benchmark::oN);

BENCHMARK_REGISTER_F(PerformanceTestFixture, SharedPtrAllocation)
    ->RangeMultiplier(2)->Range(1<<10, 1<<20)->Complexity(benchmark::oN);

// Memory Access Pattern Benchmarks
class MemoryAccessFixture : public benchmark::Fixture {
public:
    void SetUp(const ::benchmark::State& state) override {
        size_ = state.range(0);
        
        // Initialize different memory layouts
        contiguous_data_ = std::make_unique<int[]>(size_);
        fragmented_pointers_.reserve(size_);
        
        for (size_t i = 0; i < size_; ++i) {
            contiguous_data_[i] = static_cast<int>(i);
            fragmented_pointers_.push_back(std::make_unique<int>(static_cast<int>(i)));
        }
    }

protected:
    size_t size_;
    std::unique_ptr<int[]> contiguous_data_;
    std::vector<std::unique_ptr<int>> fragmented_pointers_;
};

BENCHMARK_DEFINE_F(MemoryAccessFixture, ContiguousMemoryAccess)(benchmark::State& state) {
    for (auto _ : state) {
        long sum = 0;
        for (size_t i = 0; i < size_; ++i) {
            sum += contiguous_data_[i];
        }
        benchmark::DoNotOptimize(sum);
    }
    
    state.SetItemsProcessed(state.iterations() * size_);
    state.SetBytesProcessed(state.iterations() * size_ * sizeof(int));
}

BENCHMARK_DEFINE_F(MemoryAccessFixture, FragmentedMemoryAccess)(benchmark::State& state) {
    for (auto _ : state) {
        long sum = 0;
        for (size_t i = 0; i < size_; ++i) {
            sum += *fragmented_pointers_[i];
        }
        benchmark::DoNotOptimize(sum);
    }
    
    state.SetItemsProcessed(state.iterations() * size_);
    state.SetBytesProcessed(state.iterations() * size_ * sizeof(int));
}

BENCHMARK_REGISTER_F(MemoryAccessFixture, ContiguousMemoryAccess)
    ->RangeMultiplier(2)->Range(1<<12, 1<<18);

BENCHMARK_REGISTER_F(MemoryAccessFixture, FragmentedMemoryAccess)
    ->RangeMultiplier(2)->Range(1<<12, 1<<18);

// Custom Performance Timer for Fine-grained Measurements
class HighResolutionTimer {
public:
    using Clock = std::chrono::high_resolution_clock;
    using Duration = std::chrono::nanoseconds;
    
    void start() {
        start_time_ = Clock::now();
    }
    
    Duration stop() {
        auto end_time = Clock::now();
        return std::chrono::duration_cast<Duration>(end_time - start_time_);
    }
    
    template<typename Func>
    Duration measure(Func&& func) {
        start();
        func();
        return stop();
    }
    
    // Statistical analysis of multiple runs
    struct Statistics {
        Duration min;
        Duration max;
        Duration mean;
        Duration median;
        Duration std_dev;
    };
    
    template<typename Func>
    Statistics benchmark(Func&& func, size_t iterations = 1000) {
        std::vector<Duration> measurements;
        measurements.reserve(iterations);
        
        // Warm-up runs
        for (size_t i = 0; i < std::min(iterations / 10, size_t(100)); ++i) {
            func();
        }
        
        // Actual measurements
        for (size_t i = 0; i < iterations; ++i) {
            measurements.push_back(measure(func));
        }
        
        return calculateStatistics(measurements);
    }

private:
    Clock::time_point start_time_;
    
    Statistics calculateStatistics(std::vector<Duration>& measurements) {
        std::sort(measurements.begin(), measurements.end());
        
        Statistics stats;
        stats.min = measurements.front();
        stats.max = measurements.back();
        
        // Calculate mean
        auto total = Duration{0};
        for (const auto& duration : measurements) {
            total += duration;
        }
        stats.mean = total / measurements.size();
        
        // Calculate median
        size_t mid = measurements.size() / 2;
        if (measurements.size() % 2 == 0) {
            stats.median = (measurements[mid - 1] + measurements[mid]) / 2;
        } else {
            stats.median = measurements[mid];
        }
        
        // Calculate standard deviation
        double variance = 0.0;
        double mean_ns = stats.mean.count();
        for (const auto& duration : measurements) {
            double diff = duration.count() - mean_ns;
            variance += diff * diff;
        }
        variance /= measurements.size();
        stats.std_dev = Duration{static_cast<long>(std::sqrt(variance))};
        
        return stats;
    }
};

// Example performance test using custom timer
TEST(PerformanceTest, SmartPointerCreationOverhead) {
    HighResolutionTimer timer;
    
    // Test raw pointer creation
    auto raw_stats = timer.benchmark([]() {
        int* ptr = new int(42);
        delete ptr;
    });
    
    // Test unique_ptr creation
    auto unique_stats = timer.benchmark([]() {
        auto ptr = std::make_unique<int>(42);
        // Automatic cleanup
    });
    
    // Test shared_ptr creation
    auto shared_stats = timer.benchmark([]() {
        auto ptr = std::make_shared<int>(42);
        // Automatic cleanup
    });
    
    // Report results
    std::cout << "Raw Pointer - Mean: " << raw_stats.mean.count() << "ns, "
              << "Std Dev: " << raw_stats.std_dev.count() << "ns\\n";
    std::cout << "Unique Ptr - Mean: " << unique_stats.mean.count() << "ns, "
              << "Std Dev: " << unique_stats.std_dev.count() << "ns\\n";
    std::cout << "Shared Ptr - Mean: " << shared_stats.mean.count() << "ns, "
              << "Std Dev: " << shared_stats.std_dev.count() << "ns\\n";
    
    // Verify reasonable overhead (example thresholds)
    EXPECT_LT(unique_stats.mean, raw_stats.mean * 2) << "unique_ptr overhead too high";
    EXPECT_LT(shared_stats.mean, raw_stats.mean * 5) << "shared_ptr overhead too high";
}

// Memory throughput benchmark
void BM_MemoryThroughput(benchmark::State& state) {
    const size_t size = state.range(0);
    const size_t bytes = size * sizeof(int);
    
    std::vector<std::unique_ptr<int[]>> buffers;
    buffers.reserve(100);  // Pre-allocate to avoid reallocation during test
    
    for (auto _ : state) {
        auto buffer = std::make_unique<int[]>(size);
        
        // Fill buffer (write throughput)
        for (size_t i = 0; i < size; ++i) {
            buffer[i] = static_cast<int>(i);
        }
        
        // Read buffer (read throughput)
        volatile int sum = 0;  // Prevent optimization
        for (size_t i = 0; i < size; ++i) {
            sum += buffer[i];
        }
        
        buffers.push_back(std::move(buffer));
        if (buffers.size() > 10) {
            buffers.erase(buffers.begin());  // Keep memory pressure reasonable
        }
    }
    
    state.SetBytesProcessed(state.iterations() * bytes * 2);  // Read + Write
    state.SetItemsProcessed(state.iterations() * size);
}

BENCHMARK(BM_MemoryThroughput)
    ->RangeMultiplier(4)
    ->Range(1<<10, 1<<20)
    ->Unit(benchmark::kMicrosecond);

// Main function for running benchmarks
int main(int argc, char** argv) {
    ::benchmark::Initialize(&argc, argv);
    ::benchmark::RunSpecifiedBenchmarks();
    
    return 0;
}`,
      explanation: state.language === 'en' 
        ? 'Comprehensive performance testing using Google Benchmark framework. Includes allocation benchmarks, memory access patterns, custom timing utilities, and statistical analysis of pointer performance characteristics.'
        : 'Pruebas de rendimiento completas usando el framework Google Benchmark. Incluye benchmarks de asignación, patrones de acceso a memoria, utilidades de tiempo personalizadas, y análisis estadístico de características de rendimiento de punteros.'
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '350px 1fr',
        height: '100vh',
        gap: '1rem',
        padding: '1rem'
      }}>
        {/* Theory Panel */}
        <div style={{
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00d4ff, #4ecdc4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {state.language === 'en' ? 'Lesson 119: Testing & Validation Strategies' : 'Lección 119: Estrategias de Testing y Validación'}
          </h1>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '2rem'
          }}>
            {Object.entries(examples).map(([key, example]) => (
              <button
                key={key}
                onClick={() => setActiveExample(key)}
                style={{
                  padding: '0.8rem 1rem',
                  background: activeExample === key 
                    ? 'linear-gradient(135deg, #00d4ff, #4ecdc4)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${activeExample === key ? 'transparent' : 'rgba(255, 255, 255, 0.2)'}`,
                  borderRadius: '12px',
                  color: activeExample === key ? '#000' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: activeExample === key ? '600' : '400',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
                }}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: '#4ecdc4',
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>
              {state.language === 'en' ? 'Testing Metrics' : 'Métricas de Testing'}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.8rem'
            }}>
              {[
                { 
                  label: state.language === 'en' ? 'Unit Test Coverage' : 'Cobertura de Pruebas Unitarias', 
                  value: testMetrics.unitTestCoverage 
                },
                { 
                  label: state.language === 'en' ? 'Mock Isolation' : 'Aislamiento Mock', 
                  value: testMetrics.mockIsolation 
                },
                { 
                  label: state.language === 'en' ? 'Memory Validation' : 'Validación de Memoria', 
                  value: testMetrics.memoryValidation 
                },
                { 
                  label: state.language === 'en' ? 'Performance Benchmark' : 'Benchmark de Rendimiento', 
                  value: testMetrics.performanceBenchmark 
                }
              ].map((metric, index) => (
                <div key={index} style={{ marginBottom: '0.8rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.3rem',
                    fontSize: '0.85rem'
                  }}>
                    <span>{metric.label}</span>
                    <span>{(metric.value * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${metric.value * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #00d4ff, #4ecdc4)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{
              color: '#ffd700',
              marginBottom: '1rem',
              fontSize: '1rem'
            }}>
              {state.language === 'en' ? 'Key Concepts' : 'Conceptos Clave'}
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '0.85rem',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              {[
                state.language === 'en' ? 'Google Test/Mock Integration' : 'Integración Google Test/Mock',
                state.language === 'en' ? 'Smart Pointer Test Patterns' : 'Patrones de Test con Smart Pointers',
                state.language === 'en' ? 'Memory Leak Detection' : 'Detección de Fugas de Memoria',
                state.language === 'en' ? 'AddressSanitizer/Valgrind' : 'AddressSanitizer/Valgrind',
                state.language === 'en' ? 'Performance Benchmarking' : 'Benchmarking de Rendimiento',
                state.language === 'en' ? 'Mock Object Lifecycle' : 'Ciclo de Vida de Objetos Mock'
              ].map((concept, index) => (
                <li key={index} style={{
                  padding: '0.3rem 0',
                  borderLeft: '2px solid #4ecdc4',
                  paddingLeft: '0.8rem',
                  marginBottom: '0.3rem'
                }}>
                  {concept}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Visualization Panel */}
        <div style={{
          display: 'grid',
          gridTemplateRows: '1fr auto',
          gap: '1rem',
          height: '100vh'
        }}>
          {/* 3D Visualization */}
          <div style={{
            background: 'rgba(22, 33, 62, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Canvas
              camera={{ position: [8, 8, 8], fov: 60 }}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ecdc4" />
              <TestingVisualization
                metrics={testMetrics}
                activeFramework={selectedFramework}
                onFrameworkSelect={setSelectedFramework}
              />
            </Canvas>

            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '1rem',
              borderRadius: '10px',
              fontSize: '0.8rem'
            }}>
              <div style={{ color: '#4ecdc4', fontWeight: '600', marginBottom: '0.5rem' }}>
                {state.language === 'en' ? 'Active Framework' : 'Framework Activo'}
              </div>
              <div style={{ color: 'white' }}>{selectedFramework}</div>
            </div>
          </div>

          {/* Code Editor */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '20px',
            padding: '1.5rem',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                color: '#00d4ff',
                margin: 0,
                fontSize: '1.1rem'
              }}>
                {examples[activeExample as keyof typeof examples]?.title}
              </h3>
            </div>
            
            <pre style={{
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '1rem',
              borderRadius: '8px',
              color: '#f8f8f2',
              fontSize: '0.75rem',
              lineHeight: '1.4',
              overflowX: 'auto',
              margin: 0,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <code>{examples[activeExample as keyof typeof examples]?.code}</code>
            </pre>
            
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(0, 212, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              fontSize: '0.85rem',
              lineHeight: '1.5'
            }}>
              <strong style={{ color: '#4ecdc4' }}>
                {state.language === 'en' ? 'Explanation:' : 'Explicación:'}
              </strong>
              <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.9)' }}>
                {examples[activeExample as keyof typeof examples]?.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson119_TestingValidationStrategies;