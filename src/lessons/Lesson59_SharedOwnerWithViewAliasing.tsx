import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Lesson59Props {
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

interface AliasingVisualizationProps {
  scenario: 'basic' | 'member' | 'array';
}

function AliasingVisualization({ scenario }: AliasingVisualizationProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const renderAliasingPattern = () => {
    switch (scenario) {
      case 'basic':
        return (
          <group>
            {/* Main object */}
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[2.5, 1, 1]} />
              <meshStandardMaterial color="#4a9eff" transparent opacity={0.8} />
            </mesh>
            <Text position={[0, 1, 0.6]} fontSize={0.2} color="white" anchorX="center">
              Main Object
            </Text>
            
            {/* shared_ptr to main */}
            <mesh position={[-2, -0.5, 0]}>
              <boxGeometry args={[1.5, 0.8, 0.5]} />
              <meshStandardMaterial color="#50c878" transparent opacity={0.7} />
            </mesh>
            <Text position={[-2, -0.5, 0.3]} fontSize={0.15} color="white" anchorX="center">
              shared_ptr
            </Text>
            
            {/* Aliasing shared_ptr */}
            <mesh position={[2, -0.5, 0]}>
              <boxGeometry args={[1.5, 0.8, 0.5]} />
              <meshStandardMaterial color="#ff9f40" transparent opacity={0.7} />
            </mesh>
            <Text position={[2, -0.5, 0.3]} fontSize={0.15} color="white" anchorX="center">
              Aliasing ptr
            </Text>
            
            {/* Connection lines */}
            <mesh position={[-1, 0.25, 0]} rotation={[0, 0, Math.PI / 6]}>
              <cylinderGeometry args={[0.02, 0.02, 1.5]} />
              <meshStandardMaterial color="#50c878" />
            </mesh>
            <mesh position={[1, 0.25, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <cylinderGeometry args={[0.02, 0.02, 1.5]} />
              <meshStandardMaterial color="#ff9f40" />
            </mesh>
          </group>
        );
        
      case 'member':
        return (
          <group>
            {/* Container object */}
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[3, 1, 1]} />
              <meshStandardMaterial color="#4a9eff" transparent opacity={0.8} />
            </mesh>
            
            {/* Member subobject */}
            <mesh position={[0, 1, 0]} scale={[0.6, 0.6, 1.2]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#ff6b6b" transparent opacity={0.9} />
            </mesh>
            <Text position={[0, 0.4, 0]} fontSize={0.15} color="white" anchorX="center">
              Member Object
            </Text>
            
            {/* Aliasing pointer to member */}
            <mesh position={[0, -1, 0]}>
              <boxGeometry args={[2, 0.8, 0.5]} />
              <meshStandardMaterial color="#ff9f40" transparent opacity={0.7} />
            </mesh>
            <Text position={[0, -1, 0.3]} fontSize={0.15} color="white" anchorX="center">
              Aliasing to Member
            </Text>
            
            {/* Connection */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2]} />
              <meshStandardMaterial color="#ff9f40" />
            </mesh>
          </group>
        );
        
      case 'array':
        return (
          <group>
            {/* Array container */}
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[4, 1, 1]} />
              <meshStandardMaterial color="#4a9eff" transparent opacity={0.8} />
            </mesh>
            
            {/* Array elements */}
            {Array.from({ length: 4 }, (_, i) => (
              <mesh key={i} position={[(i - 1.5) * 0.8, 1, 0]} scale={[0.8, 0.8, 1.2]}>
                <boxGeometry args={[0.6, 0.8, 0.8]} />
                <meshStandardMaterial 
                  color={i === 1 ? "#ff6b6b" : "#666666"} 
                  transparent 
                  opacity={0.9} 
                />
              </mesh>
            ))}
            
            {/* Aliasing to specific element */}
            <mesh position={[0, -1, 0]}>
              <boxGeometry args={[2, 0.8, 0.5]} />
              <meshStandardMaterial color="#ff9f40" transparent opacity={0.7} />
            </mesh>
            <Text position={[0, -1, 0.3]} fontSize={0.15} color="white" anchorX="center">
              Alias to Element[1]
            </Text>
            
            {/* Connection to specific element */}
            <mesh position={[-0.4, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2]} />
              <meshStandardMaterial color="#ff9f40" />
            </mesh>
          </group>
        );
    }
  };

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      {renderAliasingPattern()}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
      >
        Aliasing Scenario: {scenario.toUpperCase()}
      </Text>
    </group>
  );
}

export default function Lesson59_SharedOwnerWithViewAliasing({ onComplete, isCompleted }: Lesson59Props) {
  const [currentScenario, setCurrentScenario] = useState<'basic' | 'member' | 'array'>('basic');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const scenarios: Array<'basic' | 'member' | 'array'> = ['basic', 'member', 'array'];

  const quizQuestions = [
    {
      question: "What is the aliasing constructor of shared_ptr used for?",
      options: [
        "Creating copies of shared_ptr",
        "Sharing ownership of one object while pointing to another related object",
        "Converting between different smart pointer types",
        "Optimizing memory allocation"
      ],
      correct: 1,
      explanation: "The aliasing constructor allows a shared_ptr to share ownership of one object while pointing to a different but related object."
    },
    {
      question: "In the aliasing constructor shared_ptr<U>(shared_ptr<T>, U*), what happens to reference counting?",
      options: [
        "A new reference count is created for U",
        "The reference count of T is incremented, U is not reference counted",
        "Both T and U get separate reference counts",
        "Reference counting is disabled"
      ],
      correct: 1,
      explanation: "The aliasing constructor increments the reference count of the owned object T, while the new shared_ptr points to U without separate reference counting."
    },
    {
      question: "What is a common use case for the aliasing constructor?",
      options: [
        "Performance optimization",
        "Pointing to a member of a shared object while keeping the whole object alive",
        "Converting raw pointers to smart pointers",
        "Thread synchronization"
      ],
      correct: 1,
      explanation: "A common use case is pointing to a member of a shared object, ensuring the containing object stays alive as long as the member is referenced."
    },
    {
      question: "What happens when the last aliasing shared_ptr goes out of scope?",
      options: [
        "Only the pointed-to subobject is destroyed",
        "The entire owned object is destroyed",
        "Memory leak occurs",
        "Undefined behavior"
      ],
      correct: 1,
      explanation: "When the last shared_ptr (aliasing or non-aliasing) goes out of scope, the owned object is destroyed, not just the pointed-to part."
    },
    {
      question: "Why is the aliasing constructor safer than storing raw pointers to subobjects?",
      options: [
        "Raw pointers are always dangerous",
        "It ensures the containing object remains alive while subobject is accessed",
        "It provides better performance",
        "It enables automatic type conversion"
      ],
      correct: 1,
      explanation: "The aliasing constructor ensures the lifetime of the containing object, preventing dangling pointers to subobjects."
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
      <Title>Lesson 59: Shared Owner with View using Aliasing Constructor</Title>
      
      <Description>
        <h3>Advanced shared_ptr Aliasing for Subobject Access</h3>
        <p>
          The shared_ptr aliasing constructor enables sophisticated ownership patterns where
          you need to keep one object alive while providing access to a related subobject.
          This advanced technique is crucial for safe member access, array element references,
          and complex object hierarchies while maintaining proper lifetime management.
        </p>
        
        <h4>Aliasing Constructor Benefits:</h4>
        <ul>
          <li><strong>Subobject safety:</strong> Keep parent objects alive when accessing members</li>
          <li><strong>Array element access:</strong> Safe references to individual array elements</li>
          <li><strong>Polymorphic access:</strong> Multiple views of the same underlying resource</li>
          <li><strong>Lifetime coupling:</strong> Automatic lifetime management of related objects</li>
        </ul>
      </Description>

      <VisualizationContainer>
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <AliasingVisualization scenario={currentScenario} />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </VisualizationContainer>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        {scenarios.map(scenario => (
          <button
            key={scenario}
            onClick={() => setCurrentScenario(scenario)}
            style={{
              padding: '10px 15px',
              background: currentScenario === scenario ? '#4a9eff' : 'rgba(74, 158, 255, 0.3)',
              color: 'white',
              border: '1px solid rgba(74, 158, 255, 0.5)',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {scenario.toUpperCase()}
          </button>
        ))}
      </div>

      <h3>Basic Aliasing Constructor Usage</h3>
      <CodeBlock>
        <code>
{`#include <memory>
#include <iostream>
#include <string>
#include <vector>

// Example class hierarchy for aliasing demonstration
struct Person {
    std::string name;
    int age;
    std::vector<std::string> hobbies;
    
    Person(const std::string& n, int a) : name(n), age(a) {
        std::cout << "Person created: " << name << "\\n";
    }
    
    ~Person() {
        std::cout << "Person destroyed: " << name << "\\n";
    }
    
    void addHobby(const std::string& hobby) {
        hobbies.push_back(hobby);
    }
};

void demonstrateBasicAliasing() {
    std::cout << "=== Basic Aliasing Constructor Demo ===\\n";
    
    // Create a shared_ptr to Person
    std::shared_ptr<Person> person = std::make_shared<Person>("Alice", 30);
    person->addHobby("Reading");
    person->addHobby("Hiking");
    
    std::cout << "Person use count: " << person.use_count() << "\\n";
    
    // Create aliasing shared_ptr pointing to the name member
    std::shared_ptr<std::string> name_ptr(person, &person->name);
    
    std::cout << "After aliasing to name:\\n";
    std::cout << "  Person use count: " << person.use_count() << "\\n";
    std::cout << "  Name ptr use count: " << name_ptr.use_count() << "\\n";
    std::cout << "  Name value: " << *name_ptr << "\\n";
    
    // Create aliasing shared_ptr pointing to age member
    std::shared_ptr<int> age_ptr(person, &person->age);
    
    std::cout << "After aliasing to age:\\n";
    std::cout << "  Person use count: " << person.use_count() << "\\n";
    std::cout << "  Age value: " << *age_ptr << "\\n";
    
    // Original person pointer can go out of scope
    person.reset();
    std::cout << "After resetting original person pointer:\\n";
    std::cout << "  Name is still accessible: " << *name_ptr << "\\n";
    std::cout << "  Age is still accessible: " << *age_ptr << "\\n";
    
    // Person object is kept alive by aliasing pointers!
    
} // Person will be destroyed here when last aliasing ptr goes out of scope

// Advanced aliasing patterns
class AliasingPatterns {
public:
    // Pattern 1: Safe member access
    template<typename T, typename Member>
    static std::shared_ptr<Member> getMemberPtr(std::shared_ptr<T> obj, Member T::*member) {
        return std::shared_ptr<Member>(obj, &(obj.get()->*member));
    }
    
    // Pattern 2: Array element aliasing
    template<typename T>
    static std::shared_ptr<T> getArrayElement(std::shared_ptr<T[]> array, size_t index) {
        return std::shared_ptr<T>(array, array.get() + index);
    }
    
    // Pattern 3: Polymorphic base aliasing
    template<typename Base, typename Derived>
    static std::shared_ptr<Base> getBaseView(std::shared_ptr<Derived> derived) {
        return std::shared_ptr<Base>(derived, static_cast<Base*>(derived.get()));
    }
    
    static void demonstrateAdvancedPatterns() {
        std::cout << "\\n=== Advanced Aliasing Patterns ===\\n";
        
        // Member access pattern
        auto person = std::make_shared<Person>("Bob", 25);
        person->addHobby("Gaming");
        person->addHobby("Cooking");
        
        // Safe access to vector member
        auto hobbies_ptr = getMemberPtr(person, &Person::hobbies);
        std::cout << "Hobbies count: " << hobbies_ptr->size() << "\\n";
        
        // Array aliasing pattern
        std::shared_ptr<int[]> numbers(new int[5]{1, 2, 3, 4, 5});
        
        auto third_element = getArrayElement(numbers, 2);
        std::cout << "Third element: " << *third_element << "\\n";
        
        *third_element = 99;  // Modify through aliasing pointer
        std::cout << "Modified third element: " << *third_element << "\\n";
        
        // The array is kept alive by the aliasing pointer
        numbers.reset();
        std::cout << "Array reset, but element still accessible: " << *third_element << "\\n";
    }
};`}
        </code>
      </CodeBlock>

      <h3>Real-World Aliasing Applications</h3>
      <CodeBlock>
        <code>
{`// Real-world applications of shared_ptr aliasing
class ConfigurationManager {
    struct Config {
        std::string database_url;
        int connection_timeout;
        std::vector<std::string> allowed_hosts;
        bool debug_mode;
        
        Config() : connection_timeout(30), debug_mode(false) {}
        
        ~Config() {
            std::cout << "Configuration destroyed\\n";
        }
    };
    
    std::shared_ptr<Config> config_;
    
public:
    ConfigurationManager() : config_(std::make_shared<Config>()) {
        // Load configuration...
        config_->database_url = "postgresql://localhost:5432/mydb";
        config_->allowed_hosts = {"localhost", "127.0.0.1", "::1"};
        config_->debug_mode = true;
    }
    
    // Return aliasing pointers to specific configuration parts
    std::shared_ptr<std::string> getDatabaseUrl() {
        return std::shared_ptr<std::string>(config_, &config_->database_url);
    }
    
    std::shared_ptr<int> getTimeout() {
        return std::shared_ptr<int>(config_, &config_->connection_timeout);
    }
    
    std::shared_ptr<std::vector<std::string>> getAllowedHosts() {
        return std::shared_ptr<std::vector<std::string>>(config_, &config_->allowed_hosts);
    }
    
    std::shared_ptr<bool> getDebugMode() {
        return std::shared_ptr<bool>(config_, &config_->debug_mode);
    }
    
    // Clients can hold onto specific parts without keeping entire config alive
};

// Database connection using aliasing for configuration
class DatabaseConnection {
    std::shared_ptr<std::string> db_url_;
    std::shared_ptr<int> timeout_;
    
public:
    DatabaseConnection(std::shared_ptr<std::string> url, std::shared_ptr<int> timeout)
        : db_url_(url), timeout_(timeout) {}
    
    void connect() {
        std::cout << "Connecting to: " << *db_url_ 
                  << " with timeout: " << *timeout_ << "s\\n";
        // Config object is kept alive automatically
    }
    
    void updateTimeout(int new_timeout) {
        *timeout_ = new_timeout;  // Modifies original config
        std::cout << "Updated timeout to: " << *timeout_ << "s\\n";
    }
};

// Complex object graph with aliasing
class Document {
public:
    struct Metadata {
        std::string title;
        std::string author;
        std::string creation_date;
        std::vector<std::string> tags;
    };
    
    struct Content {
        std::vector<std::string> paragraphs;
        std::vector<std::string> images;
    };
    
private:
    Metadata metadata_;
    Content content_;
    
public:
    Document(const std::string& title, const std::string& author) {
        metadata_.title = title;
        metadata_.author = author;
        metadata_.creation_date = "2024-01-01";
    }
    
    ~Document() {
        std::cout << "Document destroyed: " << metadata_.title << "\\n";
    }
    
    // Factory method that returns the document and aliasing pointers
    static auto createDocumentWithViews(const std::string& title, const std::string& author) {
        auto doc = std::make_shared<Document>(title, author);
        
        // Create aliasing pointers to subobjects
        auto metadata_ptr = std::shared_ptr<Metadata>(doc, &doc->metadata_);
        auto content_ptr = std::shared_ptr<Content>(doc, &doc->content_);
        
        return std::make_tuple(doc, metadata_ptr, content_ptr);
    }
    
    void addParagraph(const std::string& text) {
        content_.paragraphs.push_back(text);
    }
    
    void addTag(const std::string& tag) {
        metadata_.tags.push_back(tag);
    }
};

// Specialized viewers using aliasing
class MetadataViewer {
    std::shared_ptr<Document::Metadata> metadata_;
    
public:
    MetadataViewer(std::shared_ptr<Document::Metadata> metadata)
        : metadata_(metadata) {}
    
    void displayInfo() const {
        std::cout << "Title: " << metadata_->title << "\\n";
        std::cout << "Author: " << metadata_->author << "\\n";
        std::cout << "Date: " << metadata_->creation_date << "\\n";
        std::cout << "Tags: ";
        for (const auto& tag : metadata_->tags) {
            std::cout << tag << " ";
        }
        std::cout << "\\n";
    }
    
    void addTag(const std::string& tag) {
        metadata_->tags.push_back(tag);
    }
};

class ContentEditor {
    std::shared_ptr<Document::Content> content_;
    
public:
    ContentEditor(std::shared_ptr<Document::Content> content)
        : content_(content) {}
    
    void addParagraph(const std::string& text) {
        content_->paragraphs.push_back(text);
    }
    
    void listParagraphs() const {
        std::cout << "Document paragraphs:\\n";
        for (size_t i = 0; i < content_->paragraphs.size(); ++i) {
            std::cout << "  " << (i + 1) << ": " << content_->paragraphs[i] << "\\n";
        }
    }
};

// Demonstration of real-world usage
void demonstrateRealWorldUsage() {
    std::cout << "\\n=== Real-World Aliasing Usage ===\\n";
    
    // Configuration management
    {
        ConfigurationManager config_mgr;
        
        // Get specific configuration parts
        auto db_url = config_mgr.getDatabaseUrl();
        auto timeout = config_mgr.getTimeout();
        
        // Create database connection with aliasing pointers
        DatabaseConnection db_conn(db_url, timeout);
        db_conn.connect();
        db_conn.updateTimeout(60);
        
        // config_mgr can go out of scope, but config parts remain alive
    }
    
    std::cout << "\\nConfiguration manager destroyed, but connection still works\\n";
    
    // Document processing
    {
        auto [doc, metadata, content] = Document::createDocumentWithViews(
            "Advanced C++", "Expert Author");
        
        // Create specialized viewers
        MetadataViewer metadata_viewer(metadata);
        ContentEditor content_editor(content);
        
        // Use viewers independently
        metadata_viewer.addTag("C++");
        metadata_viewer.addTag("Programming");
        
        content_editor.addParagraph("This is the introduction.");
        content_editor.addParagraph("This covers advanced topics.");
        
        // Display information
        metadata_viewer.displayInfo();
        content_editor.listParagraphs();
        
        // Original document pointer can be released
        doc.reset();
        std::cout << "Document pointer released, but viewers still work\\n";
        
        // Add more content through viewer
        content_editor.addParagraph("This is a new paragraph added after doc reset.");
        content_editor.listParagraphs();
        
    } // Document will be destroyed here when last aliasing pointer goes away
}`}
        </code>
      </CodeBlock>

      <h3>Advanced Aliasing Techniques</h3>
      <CodeBlock>
        <code>
{`// Advanced techniques with shared_ptr aliasing
template<typename T>
class AliasingUtilities {
public:
    // Safe downcast with aliasing
    template<typename Derived>
    static std::shared_ptr<Derived> safe_downcast(std::shared_ptr<T> base) {
        if (auto derived = dynamic_cast<Derived*>(base.get())) {
            return std::shared_ptr<Derived>(base, derived);
        }
        return nullptr;
    }
    
    // Create multiple aliasing views
    template<typename... Members>
    static auto create_member_views(std::shared_ptr<T> obj, Members T::*... members) {
        return std::make_tuple(
            std::shared_ptr<Members>(obj, &(obj.get()->*members))...
        );
    }
    
    // Conditional aliasing
    template<typename Member>
    static std::shared_ptr<Member> conditional_member_access(
        std::shared_ptr<T> obj, 
        Member T::*member, 
        bool condition) {
        
        if (condition && obj) {
            return std::shared_ptr<Member>(obj, &(obj.get()->*member));
        }
        return nullptr;
    }
    
    // Array slice aliasing
    template<typename Array>
    static std::vector<std::shared_ptr<typename Array::value_type>> 
    create_array_slice(std::shared_ptr<Array> array, size_t start, size_t count) {
        
        std::vector<std::shared_ptr<typename Array::value_type>> result;
        result.reserve(count);
        
        for (size_t i = start; i < start + count && i < array->size(); ++i) {
            result.emplace_back(array, &(*array)[i]);
        }
        
        return result;
    }
};

// Complex example: Game object hierarchy
class GameObject {
public:
    struct Transform {
        float x, y, z;
        float rotation;
        
        Transform() : x(0), y(0), z(0), rotation(0) {}
    };
    
    struct Renderer {
        std::string texture_path;
        bool visible = true;
        float opacity = 1.0f;
    };
    
    struct Physics {
        float velocity_x, velocity_y;
        float mass;
        bool enabled = true;
        
        Physics() : velocity_x(0), velocity_y(0), mass(1.0f) {}
    };
    
private:
    std::string name_;
    Transform transform_;
    Renderer renderer_;
    Physics physics_;
    
public:
    GameObject(const std::string& name) : name_(name) {}
    
    ~GameObject() {
        std::cout << "GameObject destroyed: " << name_ << "\\n";
    }
    
    // Factory with component access
    static auto createWithComponents(const std::string& name) {
        auto obj = std::make_shared<GameObject>(name);
        
        // Create aliasing pointers to components
        auto transform = std::shared_ptr<Transform>(obj, &obj->transform_);
        auto renderer = std::shared_ptr<Renderer>(obj, &obj->renderer_);
        auto physics = std::shared_ptr<Physics>(obj, &obj->physics_);
        
        return std::make_tuple(obj, transform, renderer, physics);
    }
    
    const std::string& getName() const { return name_; }
};

// Component systems using aliasing
class TransformSystem {
    std::vector<std::shared_ptr<GameObject::Transform>> transforms_;
    
public:
    void addTransform(std::shared_ptr<GameObject::Transform> transform) {
        transforms_.push_back(transform);
    }
    
    void update(float delta_time) {
        for (auto& transform : transforms_) {
            // Update transform logic
            transform->rotation += delta_time * 0.1f;
        }
    }
    
    void printTransforms() const {
        std::cout << "Active transforms: " << transforms_.size() << "\\n";
        for (const auto& transform : transforms_) {
            std::cout << "  Position: (" << transform->x << ", " << transform->y << ")\\n";
        }
    }
};

class RenderSystem {
    std::vector<std::shared_ptr<GameObject::Renderer>> renderers_;
    
public:
    void addRenderer(std::shared_ptr<GameObject::Renderer> renderer) {
        renderers_.push_back(renderer);
    }
    
    void render() {
        std::cout << "Rendering " << renderers_.size() << " objects:\\n";
        for (const auto& renderer : renderers_) {
            if (renderer->visible) {
                std::cout << "  Rendering: " << renderer->texture_path 
                          << " (opacity: " << renderer->opacity << ")\\n";
            }
        }
    }
};

// Thread-safe aliasing with shared_ptr
class ThreadSafeAliasing {
public:
    template<typename T, typename Member>
    static std::shared_ptr<Member> thread_safe_member_access(
        std::shared_ptr<T> obj, 
        Member T::*member,
        std::mutex& obj_mutex) {
        
        std::lock_guard<std::mutex> lock(obj_mutex);
        if (obj) {
            return std::shared_ptr<Member>(obj, &(obj.get()->*member));
        }
        return nullptr;
    }
    
    // Example with thread-safe configuration
    class ThreadSafeConfig {
        struct Data {
            std::atomic<int> counter{0};
            std::string name;
            std::vector<int> values;
        };
        
        std::shared_ptr<Data> data_;
        mutable std::mutex mutex_;
        
    public:
        ThreadSafeConfig() : data_(std::make_shared<Data>()) {}
        
        std::shared_ptr<std::atomic<int>> getCounter() {
            std::lock_guard<std::mutex> lock(mutex_);
            return std::shared_ptr<std::atomic<int>>(data_, &data_->counter);
        }
        
        std::shared_ptr<std::string> getName() {
            std::lock_guard<std::mutex> lock(mutex_);
            return std::shared_ptr<std::string>(data_, &data_->name);
        }
    };
};

// Demonstration of advanced techniques
void demonstrateAdvancedTechniques() {
    std::cout << "\\n=== Advanced Aliasing Techniques ===\\n";
    
    // Game object system
    auto [player, player_transform, player_renderer, player_physics] = 
        GameObject::createWithComponents("Player");
        
    auto [enemy, enemy_transform, enemy_renderer, enemy_physics] = 
        GameObject::createWithComponents("Enemy");
    
    // Set up components
    player_renderer->texture_path = "player.png";
    enemy_renderer->texture_path = "enemy.png";
    
    // Create systems and register components
    TransformSystem transform_system;
    RenderSystem render_system;
    
    transform_system.addTransform(player_transform);
    transform_system.addTransform(enemy_transform);
    
    render_system.addRenderer(player_renderer);
    render_system.addRenderer(enemy_renderer);
    
    // Simulate game loop
    transform_system.update(0.016f);  // 60 FPS
    render_system.render();
    transform_system.printTransforms();
    
    // Original game objects can be released
    player.reset();
    enemy.reset();
    
    std::cout << "\\nGame objects released, but systems still work:\\n";
    transform_system.update(0.016f);
    render_system.render();
    
    // Thread-safe example
    ThreadSafeAliasing::ThreadSafeConfig config;
    auto counter = config.getCounter();
    
    // Counter can be used safely across threads
    (*counter)++;
    std::cout << "Thread-safe counter: " << counter->load() << "\\n";
}`}
        </code>
      </CodeBlock>

      <QuizContainer>
        <h3>Test Your Aliasing Constructor Knowledge</h3>
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