/**
 * Lesson 83: RAII Handles - Advanced Resource Management
 * Expert-level RAII patterns for system resources and handles
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
  AccessibilityAnnouncer,
  PerformanceComparison
} from '../design-system';

interface RAIIHandlesState {
  language: 'en' | 'es';
  scenario: 'file_handles' | 'gpu_resources' | 'database_connections' | 'custom_handles';
  isAnimating: boolean;
  resourcesActive: number;
  memoryUsage: number;
  handleEfficiency: number;
  cleanupSuccess: number;
}

// 3D Visualización de RAII Handles
const RAIIHandlesVisualization: React.FC<{ 
  scenario: string; 
  isAnimating: boolean; 
  onMetrics: (metrics: any) => void 
}> = ({ scenario, isAnimating, onMetrics }) => {
  const groupRef = useRef<Group>(null);
  const animationRef = useRef<number>(0);

  useFrame(() => {
    if (!isAnimating || !groupRef.current) return;

    animationRef.current += 0.02;
    
    if (scenario === 'file_handles') {
      groupRef.current.rotation.y = animationRef.current * 0.3;
      onMetrics({
        resourcesActive: Math.max(0, 8 - Math.floor(animationRef.current * 3) % 10),
        memoryUsage: 40 + Math.sin(animationRef.current * 1.5) * 15,
        handleEfficiency: 88 + Math.cos(animationRef.current) * 10
      });
    } else if (scenario === 'gpu_resources') {
      groupRef.current.rotation.x = Math.sin(animationRef.current * 0.8) * 0.2;
      groupRef.current.rotation.z = Math.cos(animationRef.current * 0.6) * 0.15;
      onMetrics({
        resourcesActive: Math.floor(animationRef.current * 20) % 16,
        memoryUsage: 120 + Math.sin(animationRef.current * 2) * 50,
        handleEfficiency: 92 + Math.sin(animationRef.current * 1.2) * 6
      });
    } else if (scenario === 'database_connections') {
      groupRef.current.rotation.y = animationRef.current * 0.25;
      onMetrics({
        resourcesActive: Math.floor(animationRef.current * 15) % 12,
        memoryUsage: 80 + Math.cos(animationRef.current * 1.8) * 25,
        cleanupSuccess: 95 + Math.sin(animationRef.current * 0.9) * 4
      });
    } else if (scenario === 'custom_handles') {
      const wave = Math.sin(animationRef.current * 0.5);
      groupRef.current.scale.setScalar(1 + wave * 0.1);
      onMetrics({
        resourcesActive: Math.floor(animationRef.current * 10) % 20,
        handleEfficiency: 90 + Math.sin(animationRef.current * 2.1) * 8,
        cleanupSuccess: 98 + Math.cos(animationRef.current * 1.4) * 2
      });
    }
  });

  const renderResourceHandles = () => {
    const elements = [];
    const handleCount = scenario === 'gpu_resources' ? 20 : scenario === 'database_connections' ? 16 : 18;
    
    for (let i = 0; i < handleCount; i++) {
      let x, y, z;
      
      if (scenario === 'file_handles') {
        // File system hierarchy layout
        const level = Math.floor(i / 6);
        const pos = i % 6;
        x = (pos - 2.5) * 0.8;
        y = (2 - level) * 1.2;
        z = level * 0.3;
      } else if (scenario === 'gpu_resources') {
        // GPU memory layout - more compact
        const row = Math.floor(i / 5);
        const col = i % 5;
        x = (col - 2) * 0.7;
        y = (2 - row) * 0.8;
        z = Math.sin(i * 0.4) * 0.2;
      } else if (scenario === 'database_connections') {
        // Connection pool layout
        const angle = (i / handleCount) * Math.PI * 2;
        const radius = i < 8 ? 1.8 : 2.8; // Inner and outer rings
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = i < 8 ? 0.3 : -0.3;
      } else {
        // Custom handles - dynamic grid
        const gridSize = Math.ceil(Math.sqrt(handleCount));
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        x = (col - gridSize/2) * 0.8;
        y = (gridSize/2 - row) * 0.8;
        z = Math.sin(i * 0.2 + animationRef.current) * 0.4;
      }
      
      const color = scenario === 'file_handles'
        ? i % 3 === 0 ? '#00ff00' : i % 3 === 1 ? '#00ffff' : '#ffff00'  // Files, dirs, streams
        : scenario === 'gpu_resources'
        ? i % 4 === 0 ? '#ff4444' : i % 4 === 1 ? '#4444ff' : i % 4 === 2 ? '#44ff44' : '#ff44ff'  // Textures, buffers, shaders, samplers
        : scenario === 'database_connections'
        ? i < 8 ? '#ff8800' : '#0088ff'  // Active vs pooled connections
        : '#ff0080';  // Custom handles
      
      const size = scenario === 'gpu_resources' ? 0.25 : 0.3;
      
      elements.push(
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[size, size, size]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.2}
          />
        </mesh>
      );
    }
    
    return elements;
  };

  return (
    <group ref={groupRef}>
      {renderResourceHandles()}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, -5, 5]} intensity={0.4} color="#4488ff" />
      <pointLight position={[0, 0, -5]} intensity={0.3} color="#ff8844" />
    </group>
  );
};

const Lesson83_RAIIHandles: React.FC = () => {
  const [state, setState] = useState<RAIIHandlesState>({
    language: 'en',
    scenario: 'file_handles',
    isAnimating: false,
    resourcesActive: 0,
    memoryUsage: 0,
    handleEfficiency: 0,
    cleanupSuccess: 0
  });

  const announcer = AccessibilityAnnouncer();

  const updateMetrics = useCallback((metrics: any) => {
    setState(prev => ({ ...prev, ...metrics }));
  }, []);

  const runScenario = useCallback((newScenario: RAIIHandlesState['scenario']) => {
    setState(prev => ({ ...prev, scenario: newScenario, isAnimating: true }));
    
    const scenarioNames = {
      file_handles: state.language === 'en' ? 'File Handles' : 'Handles de Archivo',
      gpu_resources: state.language === 'en' ? 'GPU Resources' : 'Recursos GPU',
      database_connections: state.language === 'en' ? 'Database Connections' : 'Conexiones de Base de Datos',
      custom_handles: state.language === 'en' ? 'Custom Handles' : 'Handles Personalizados'
    };
    
    announcer.announce(
      state.language === 'en' 
        ? `Running ${scenarioNames[newScenario]} demonstration`
        : `Ejecutando demostración de ${scenarioNames[newScenario]}`
    );
  }, [state.language, announcer]);

  const codeExamples = {
    file_handles: `// File Handles and OS Resource Management
#include <fstream>
#include <memory>
#include <string>
#include <vector>
#include <iostream>
#include <filesystem>
#include <system_error>

// RAII File Handle Wrapper
class FileHandle {
private:
    std::unique_ptr<std::fstream> file_;
    std::string filepath_;
    bool is_open_;
    
public:
    enum class Mode { Read, Write, Append, ReadWrite };
    
    explicit FileHandle(const std::string& filepath, Mode mode = Mode::Read) 
        : filepath_(filepath), is_open_(false) {
        
        std::ios_base::openmode flags = std::ios_base::binary;
        
        switch (mode) {
            case Mode::Read:
                flags |= std::ios_base::in;
                break;
            case Mode::Write:
                flags |= std::ios_base::out | std::ios_base::trunc;
                break;
            case Mode::Append:
                flags |= std::ios_base::out | std::ios_base::app;
                break;
            case Mode::ReadWrite:
                flags |= std::ios_base::in | std::ios_base::out;
                break;
        }
        
        file_ = std::make_unique<std::fstream>();
        file_->open(filepath, flags);
        
        if (file_->is_open()) {
            is_open_ = true;
            std::cout << "File opened: " << filepath_ << "\\n";
        } else {
            throw std::system_error(
                std::make_error_code(std::errc::no_such_file_or_directory),
                "Failed to open file: " + filepath_
            );
        }
    }
    
    // Move constructor - transfer ownership
    FileHandle(FileHandle&& other) noexcept 
        : file_(std::move(other.file_)), 
          filepath_(std::move(other.filepath_)),
          is_open_(other.is_open_) {
        other.is_open_ = false;
        std::cout << "File handle moved: " << filepath_ << "\\n";
    }
    
    // Move assignment
    FileHandle& operator=(FileHandle&& other) noexcept {
        if (this != &other) {
            close();  // Close current file
            file_ = std::move(other.file_);
            filepath_ = std::move(other.filepath_);
            is_open_ = other.is_open_;
            other.is_open_ = false;
        }
        return *this;
    }
    
    // Disable copy construction/assignment
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
    
    ~FileHandle() {
        close();
    }
    
    void close() {
        if (is_open_ && file_ && file_->is_open()) {
            file_->close();
            is_open_ = false;
            std::cout << "File closed: " << filepath_ << "\\n";
        }
    }
    
    std::fstream& get() { 
        if (!is_open_) {
            throw std::runtime_error("Attempting to use closed file handle");
        }
        return *file_; 
    }
    
    bool is_open() const { return is_open_; }
    const std::string& filepath() const { return filepath_; }
    
    // Safe read operations
    template<typename T>
    bool read(T& data) {
        if (!is_open_) return false;
        file_->read(reinterpret_cast<char*>(&data), sizeof(T));
        return file_->good();
    }
    
    // Safe write operations
    template<typename T>
    bool write(const T& data) {
        if (!is_open_) return false;
        file_->write(reinterpret_cast<const char*>(&data), sizeof(T));
        return file_->good();
    }
    
    // String operations
    bool write_string(const std::string& data) {
        if (!is_open_) return false;
        (*file_) << data;
        return file_->good();
    }
    
    bool read_line(std::string& line) {
        if (!is_open_) return false;
        return static_cast<bool>(std::getline(*file_, line));
    }
};

// Directory Handle for filesystem operations
class DirectoryHandle {
private:
    std::filesystem::path path_;
    bool exists_;
    
public:
    explicit DirectoryHandle(const std::filesystem::path& path) 
        : path_(path), exists_(false) {
        
        try {
            if (std::filesystem::exists(path_)) {
                exists_ = true;
            } else {
                // Create directory if it doesn't exist
                std::filesystem::create_directories(path_);
                exists_ = std::filesystem::exists(path_);
            }
            
            if (exists_) {
                std::cout << "Directory handle created: " << path_ << "\\n";
            } else {
                throw std::filesystem::filesystem_error(
                    "Failed to create directory",
                    path_,
                    std::make_error_code(std::errc::permission_denied)
                );
            }
        } catch (const std::filesystem::filesystem_error& e) {
            std::cerr << "Directory error: " << e.what() << "\\n";
            throw;
        }
    }
    
    ~DirectoryHandle() {
        std::cout << "Directory handle destroyed: " << path_ << "\\n";
    }
    
    // File operations within directory
    FileHandle create_file(const std::string& filename, FileHandle::Mode mode = FileHandle::Mode::Write) {
        auto filepath = path_ / filename;
        return FileHandle(filepath.string(), mode);
    }
    
    std::vector<std::string> list_files() const {
        std::vector<std::string> files;
        
        if (!exists_) return files;
        
        try {
            for (const auto& entry : std::filesystem::directory_iterator(path_)) {
                if (entry.is_regular_file()) {
                    files.push_back(entry.path().filename().string());
                }
            }
        } catch (const std::filesystem::filesystem_error& e) {
            std::cerr << "Error listing files: " << e.what() << "\\n";
        }
        
        return files;
    }
    
    bool remove_file(const std::string& filename) {
        auto filepath = path_ / filename;
        try {
            return std::filesystem::remove(filepath);
        } catch (const std::filesystem::filesystem_error& e) {
            std::cerr << "Error removing file: " << e.what() << "\\n";
            return false;
        }
    }
    
    const std::filesystem::path& path() const { return path_; }
    bool exists() const { return exists_; }
};

// Socket Handle (simplified cross-platform)
class SocketHandle {
private:
    int socket_fd_;
    bool is_connected_;
    std::string address_;
    int port_;
    
public:
    SocketHandle(const std::string& address, int port) 
        : socket_fd_(-1), is_connected_(false), address_(address), port_(port) {
        
        // Simplified socket creation (platform-specific code would go here)
        socket_fd_ = socket(AF_INET, SOCK_STREAM, 0);
        if (socket_fd_ == -1) {
            throw std::system_error(errno, std::system_category(), 
                                  "Failed to create socket");
        }
        
        std::cout << "Socket created for " << address_ << ":" << port_ << "\\n";
    }
    
    ~SocketHandle() {
        close();
    }
    
    // Move semantics only
    SocketHandle(SocketHandle&& other) noexcept 
        : socket_fd_(other.socket_fd_), 
          is_connected_(other.is_connected_),
          address_(std::move(other.address_)),
          port_(other.port_) {
        other.socket_fd_ = -1;
        other.is_connected_ = false;
    }
    
    SocketHandle& operator=(SocketHandle&& other) noexcept {
        if (this != &other) {
            close();
            socket_fd_ = other.socket_fd_;
            is_connected_ = other.is_connected_;
            address_ = std::move(other.address_);
            port_ = other.port_;
            other.socket_fd_ = -1;
            other.is_connected_ = false;
        }
        return *this;
    }
    
    SocketHandle(const SocketHandle&) = delete;
    SocketHandle& operator=(const SocketHandle&) = delete;
    
    bool connect() {
        // Simplified connection logic
        if (socket_fd_ == -1) return false;
        
        // In real implementation, would setup sockaddr_in and call connect()
        is_connected_ = true;  // Simulate success
        std::cout << "Connected to " << address_ << ":" << port_ << "\\n";
        return true;
    }
    
    void close() {
        if (socket_fd_ != -1) {
            // In real implementation: ::close(socket_fd_);
            std::cout << "Socket closed: " << address_ << ":" << port_ << "\\n";
            socket_fd_ = -1;
            is_connected_ = false;
        }
    }
    
    bool send_data(const std::string& data) {
        if (!is_connected_) return false;
        
        // Simplified send operation
        std::cout << "Sending: " << data << "\\n";
        return true;
    }
    
    std::string receive_data() {
        if (!is_connected_) return "";
        
        // Simplified receive operation
        return "Received data from " + address_;
    }
    
    bool is_connected() const { return is_connected_; }
    int get_fd() const { return socket_fd_; }
};

void demonstrate_file_handles() {
    std::cout << "=== File Handle Demonstration ===\\n";
    
    try {
        // Create directory handle
        DirectoryHandle dir("./test_files");
        
        // Create and write to file
        {
            auto file_handle = dir.create_file("test.txt", FileHandle::Mode::Write);
            file_handle.write_string("Hello, RAII File Handles!\\n");
            file_handle.write_string("This file is automatically managed.\\n");
            // File automatically closed when handle goes out of scope
        }
        
        // Read from file
        {
            auto file_handle = dir.create_file("test.txt", FileHandle::Mode::Read);
            std::string line;
            while (file_handle.read_line(line)) {
                std::cout << "Read: " << line << "\\n";
            }
        }
        
        // List files in directory
        auto files = dir.list_files();
        std::cout << "Files in directory:\\n";
        for (const auto& file : files) {
            std::cout << "  - " << file << "\\n";
        }
        
        // Move file handle
        auto moved_handle = dir.create_file("moved.txt", FileHandle::Mode::Write);
        moved_handle.write_string("This handle will be moved\\n");
        
        auto new_handle = std::move(moved_handle);  // Ownership transferred
        new_handle.write_string("Written through moved handle\\n");
        
    } catch (const std::exception& e) {
        std::cerr << "File handling error: " << e.what() << "\\n";
    }
}

void demonstrate_socket_handles() {
    std::cout << "\\n=== Socket Handle Demonstration ===\\n";
    
    try {
        SocketHandle socket("127.0.0.1", 8080);
        
        if (socket.connect()) {
            socket.send_data("Hello Server!");
            auto response = socket.receive_data();
            std::cout << "Server response: " << response << "\\n";
        }
        
        // Move socket handle
        auto moved_socket = std::move(socket);
        std::cout << "Socket moved successfully\\n";
        
        // Original socket is now invalid, moved_socket owns the resource
        
    } catch (const std::exception& e) {
        std::cerr << "Socket error: " << e.what() << "\\n";
    }
}`,

    gpu_resources: `// GPU Resource Handles with RAII
#include <memory>
#include <vector>
#include <unordered_map>
#include <string>
#include <iostream>
#include <stdexcept>
#include <functional>

// Forward declarations for GPU API types (would be real GPU API in practice)
using GLuint = unsigned int;
using VkDevice = void*;
using VkBuffer = void*;
using VkDeviceMemory = void*;
using D3D11Device = void*;
using D3D11Texture2D = void*;

// Generic GPU Resource Handle Base
template<typename HandleType, typename DeleterType>
class GPUResourceHandle {
private:
    HandleType handle_;
    DeleterType deleter_;
    bool is_valid_;
    std::string debug_name_;
    
public:
    GPUResourceHandle(HandleType handle, DeleterType deleter, const std::string& name = "")
        : handle_(handle), deleter_(deleter), is_valid_(true), debug_name_(name) {
        std::cout << "GPU Resource created: " << debug_name_ << " (Handle: " << handle << ")\\n";
    }
    
    ~GPUResourceHandle() {
        release();
    }
    
    // Move semantics only
    GPUResourceHandle(GPUResourceHandle&& other) noexcept
        : handle_(other.handle_), 
          deleter_(std::move(other.deleter_)),
          is_valid_(other.is_valid_),
          debug_name_(std::move(other.debug_name_)) {
        other.is_valid_ = false;
        std::cout << "GPU Resource moved: " << debug_name_ << "\\n";
    }
    
    GPUResourceHandle& operator=(GPUResourceHandle&& other) noexcept {
        if (this != &other) {
            release();
            handle_ = other.handle_;
            deleter_ = std::move(other.deleter_);
            is_valid_ = other.is_valid_;
            debug_name_ = std::move(other.debug_name_);
            other.is_valid_ = false;
        }
        return *this;
    }
    
    // Disable copy
    GPUResourceHandle(const GPUResourceHandle&) = delete;
    GPUResourceHandle& operator=(const GPUResourceHandle&) = delete;
    
    void release() {
        if (is_valid_) {
            deleter_(handle_);
            std::cout << "GPU Resource released: " << debug_name_ << "\\n";
            is_valid_ = false;
        }
    }
    
    HandleType get() const { return is_valid_ ? handle_ : HandleType{}; }
    bool is_valid() const { return is_valid_; }
    const std::string& name() const { return debug_name_; }
    
    // Reset with new handle
    void reset(HandleType new_handle, const std::string& new_name = "") {
        release();
        handle_ = new_handle;
        is_valid_ = true;
        debug_name_ = new_name;
    }
};

// OpenGL Texture Handle
class OpenGLTexture {
private:
    using TextureHandle = GPUResourceHandle<GLuint, std::function<void(GLuint)>>;
    std::unique_ptr<TextureHandle> texture_;
    int width_, height_;
    
public:
    OpenGLTexture(int width, int height, const std::string& name = "Texture") 
        : width_(width), height_(height) {
        
        GLuint texture_id = generate_texture_id();  // Simulate GL texture creation
        
        auto deleter = [](GLuint id) {
            // glDeleteTextures(1, &id);  // Real OpenGL call
            std::cout << "OpenGL texture deleted: " << id << "\\n";
        };
        
        texture_ = std::make_unique<TextureHandle>(texture_id, deleter, name);
        
        // Simulate texture setup
        bind();
        set_parameters();
        allocate_storage();
    }
    
    void bind() {
        if (!texture_ || !texture_->is_valid()) {
            throw std::runtime_error("Cannot bind invalid texture");
        }
        // glBindTexture(GL_TEXTURE_2D, texture_->get());
        std::cout << "Texture bound: " << texture_->name() << "\\n";
    }
    
    void upload_data(const void* data, size_t size) {
        bind();
        // glTexImage2D(...); // Real upload
        std::cout << "Uploaded " << size << " bytes to texture: " << texture_->name() << "\\n";
    }
    
    GLuint get_id() const { return texture_ ? texture_->get() : 0; }
    bool is_valid() const { return texture_ && texture_->is_valid(); }
    
private:
    static GLuint generate_texture_id() {
        static GLuint next_id = 1;
        return next_id++;
    }
    
    void set_parameters() {
        // glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        // glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        std::cout << "Texture parameters set\\n";
    }
    
    void allocate_storage() {
        // glTexStorage2D(GL_TEXTURE_2D, 1, GL_RGBA8, width_, height_);
        std::cout << "Texture storage allocated: " << width_ << "x" << height_ << "\\n";
    }
};

// Vulkan Buffer Handle
class VulkanBuffer {
private:
    using BufferHandle = GPUResourceHandle<VkBuffer, std::function<void(VkBuffer)>>;
    using MemoryHandle = GPUResourceHandle<VkDeviceMemory, std::function<void(VkDeviceMemory)>>;
    
    std::unique_ptr<BufferHandle> buffer_;
    std::unique_ptr<MemoryHandle> memory_;
    VkDevice device_;
    size_t size_;
    
public:
    VulkanBuffer(VkDevice device, size_t size, const std::string& name = "Buffer")
        : device_(device), size_(size) {
        
        VkBuffer buffer = create_buffer();
        VkDeviceMemory memory = allocate_memory();
        
        auto buffer_deleter = [device](VkBuffer buf) {
            // vkDestroyBuffer(device, buf, nullptr);
            std::cout << "Vulkan buffer destroyed\\n";
        };
        
        auto memory_deleter = [device](VkDeviceMemory mem) {
            // vkFreeMemory(device, mem, nullptr);
            std::cout << "Vulkan memory freed\\n";
        };
        
        buffer_ = std::make_unique<BufferHandle>(buffer, buffer_deleter, name + "_Buffer");
        memory_ = std::make_unique<MemoryHandle>(memory, memory_deleter, name + "_Memory");
        
        // Bind buffer to memory
        bind_buffer_memory();
    }
    
    void* map_memory() {
        if (!memory_ || !memory_->is_valid()) {
            throw std::runtime_error("Cannot map invalid memory");
        }
        
        // void* mapped_ptr;
        // vkMapMemory(device_, memory_->get(), 0, size_, 0, &mapped_ptr);
        std::cout << "Buffer memory mapped: " << size_ << " bytes\\n";
        return reinterpret_cast<void*>(0x12345678);  // Dummy pointer
    }
    
    void unmap_memory() {
        if (memory_ && memory_->is_valid()) {
            // vkUnmapMemory(device_, memory_->get());
            std::cout << "Buffer memory unmapped\\n";
        }
    }
    
    void upload_data(const void* data, size_t data_size) {
        if (data_size > size_) {
            throw std::runtime_error("Data size exceeds buffer capacity");
        }
        
        void* mapped = map_memory();
        // memcpy(mapped, data, data_size);  // Real data copy
        unmap_memory();
        
        std::cout << "Uploaded " << data_size << " bytes to Vulkan buffer\\n";
    }
    
    VkBuffer get_buffer() const { return buffer_ ? buffer_->get() : nullptr; }
    VkDeviceMemory get_memory() const { return memory_ ? memory_->get() : nullptr; }
    size_t size() const { return size_; }
    
private:
    VkBuffer create_buffer() {
        // VkBufferCreateInfo createInfo = {};
        // vkCreateBuffer(device_, &createInfo, nullptr, &buffer);
        static int buffer_counter = 1;
        return reinterpret_cast<VkBuffer>(buffer_counter++);
    }
    
    VkDeviceMemory allocate_memory() {
        // VkMemoryAllocateInfo allocInfo = {};
        // vkAllocateMemory(device_, &allocInfo, nullptr, &memory);
        static int memory_counter = 1000;
        return reinterpret_cast<VkDeviceMemory>(memory_counter++);
    }
    
    void bind_buffer_memory() {
        // vkBindBufferMemory(device_, buffer_->get(), memory_->get(), 0);
        std::cout << "Buffer bound to memory\\n";
    }
};

// DirectX 11 Texture Handle
class D3D11Texture {
private:
    using TextureHandle = GPUResourceHandle<D3D11Texture2D*, std::function<void(D3D11Texture2D*)>>;
    std::unique_ptr<TextureHandle> texture_;
    D3D11Device* device_;
    int width_, height_;
    
public:
    D3D11Texture(D3D11Device* device, int width, int height, const std::string& name = "D3DTexture")
        : device_(device), width_(width), height_(height) {
        
        D3D11Texture2D* texture = create_texture();
        
        auto deleter = [](D3D11Texture2D* tex) {
            // tex->Release();  // Real DirectX release
            std::cout << "D3D11 texture released\\n";
        };
        
        texture_ = std::make_unique<TextureHandle>(texture, deleter, name);
    }
    
    void update_subresource(const void* data, size_t row_pitch) {
        if (!texture_ || !texture_->is_valid()) {
            throw std::runtime_error("Cannot update invalid texture");
        }
        
        // D3D11DeviceContext->UpdateSubresource(texture_->get(), ...);
        std::cout << "D3D11 texture subresource updated\\n";
    }
    
    D3D11Texture2D* get() const { return texture_ ? texture_->get() : nullptr; }
    bool is_valid() const { return texture_ && texture_->is_valid(); }
    
private:
    D3D11Texture2D* create_texture() {
        // D3D11_TEXTURE2D_DESC desc = {};
        // device_->CreateTexture2D(&desc, nullptr, &texture);
        static int texture_counter = 2000;
        return reinterpret_cast<D3D11Texture2D*>(texture_counter++);
    }
};

// GPU Resource Pool Manager
template<typename ResourceType>
class GPUResourcePool {
private:
    std::vector<std::unique_ptr<ResourceType>> available_resources_;
    std::vector<std::unique_ptr<ResourceType>> in_use_resources_;
    std::function<std::unique_ptr<ResourceType>()> factory_;
    size_t max_pool_size_;
    
public:
    GPUResourcePool(std::function<std::unique_ptr<ResourceType>()> factory, size_t max_size = 100)
        : factory_(factory), max_pool_size_(max_size) {
        std::cout << "GPU Resource Pool created (max size: " << max_size << ")\\n";
    }
    
    std::unique_ptr<ResourceType> acquire() {
        if (!available_resources_.empty()) {
            auto resource = std::move(available_resources_.back());
            available_resources_.pop_back();
            std::cout << "Resource acquired from pool\\n";
            return resource;
        }
        
        // Create new resource if pool is empty
        auto new_resource = factory_();
        std::cout << "New resource created (pool empty)\\n";
        return new_resource;
    }
    
    void release(std::unique_ptr<ResourceType> resource) {
        if (!resource) return;
        
        if (available_resources_.size() < max_pool_size_) {
            available_resources_.push_back(std::move(resource));
            std::cout << "Resource returned to pool\\n";
        } else {
            std::cout << "Resource destroyed (pool full)\\n";
            // resource will be destroyed automatically
        }
    }
    
    size_t available_count() const { return available_resources_.size(); }
    size_t max_size() const { return max_pool_size_; }
    
    void clear() {
        available_resources_.clear();
        in_use_resources_.clear();
        std::cout << "Resource pool cleared\\n";
    }
};

// RAII Resource Manager for automatic cleanup
class GPUResourceManager {
private:
    std::vector<std::function<void()>> cleanup_callbacks_;
    
public:
    ~GPUResourceManager() {
        std::cout << "GPU Resource Manager cleaning up " << cleanup_callbacks_.size() << " resources\\n";
        
        // Cleanup in reverse order (LIFO)
        for (auto it = cleanup_callbacks_.rbegin(); it != cleanup_callbacks_.rend(); ++it) {
            (*it)();
        }
    }
    
    template<typename ResourceType>
    void register_resource(std::shared_ptr<ResourceType> resource) {
        cleanup_callbacks_.push_back([resource]() {
            // Keep resource alive until cleanup
            std::cout << "Managed resource cleaned up\\n";
        });
    }
    
    void add_cleanup_callback(std::function<void()> callback) {
        cleanup_callbacks_.push_back(callback);
    }
    
    size_t managed_count() const { return cleanup_callbacks_.size(); }
};

void demonstrate_gpu_resources() {
    std::cout << "=== GPU Resource Handle Demonstration ===\\n";
    
    try {
        GPUResourceManager manager;
        
        // OpenGL Texture
        {
            auto gl_texture = std::make_unique<OpenGLTexture>(1024, 1024, "MainTexture");
            std::vector<uint8_t> texture_data(1024 * 1024 * 4, 128);  // Gray texture
            gl_texture->upload_data(texture_data.data(), texture_data.size());
            
            // Move texture
            auto moved_texture = std::move(gl_texture);
            std::cout << "OpenGL texture moved successfully\\n";
        }
        
        // Vulkan Buffer
        {
            VkDevice dummy_device = reinterpret_cast<VkDevice>(0x1234);
            auto vk_buffer = std::make_unique<VulkanBuffer>(dummy_device, 1024 * 1024, "VertexBuffer");
            
            std::vector<float> vertex_data(1000, 1.0f);
            vk_buffer->upload_data(vertex_data.data(), vertex_data.size() * sizeof(float));
        }
        
        // DirectX Texture
        {
            D3D11Device* dummy_d3d_device = reinterpret_cast<D3D11Device*>(0x5678);
            auto d3d_texture = std::make_unique<D3D11Texture>(dummy_d3d_device, 512, 512, "RenderTarget");
            
            std::vector<uint32_t> pixel_data(512 * 512, 0xFF0000FF);  // Blue pixels
            d3d_texture->update_subresource(pixel_data.data(), 512 * 4);
        }
        
        // Resource Pool Demonstration
        {
            auto texture_factory = []() {
                return std::make_unique<OpenGLTexture>(256, 256, "PooledTexture");
            };
            
            GPUResourcePool<OpenGLTexture> texture_pool(texture_factory, 10);
            
            // Acquire and release resources
            std::vector<std::unique_ptr<OpenGLTexture>> acquired_textures;
            
            for (int i = 0; i < 5; ++i) {
                acquired_textures.push_back(texture_pool.acquire());
            }
            
            std::cout << "Acquired 5 textures, pool available: " << texture_pool.available_count() << "\\n";
            
            // Release resources back to pool
            for (auto& texture : acquired_textures) {
                texture_pool.release(std::move(texture));
            }
            
            std::cout << "Released textures, pool available: " << texture_pool.available_count() << "\\n";
        }
        
        std::cout << "All GPU resources managed: " << manager.managed_count() << "\\n";
        
    } catch (const std::exception& e) {
        std::cerr << "GPU resource error: " << e.what() << "\\n";
    }
}`,

    database_connections: `// Database Connection Handles and Transaction Management
#include <memory>
#include <string>
#include <vector>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <thread>
#include <functional>
#include <iostream>
#include <atomic>

// Simplified database connection interface
class DatabaseConnection {
private:
    std::string connection_string_;
    bool is_connected_;
    std::string database_type_;
    int connection_id_;
    std::chrono::steady_clock::time_point last_used_;
    
    static std::atomic<int> next_connection_id_;
    
public:
    DatabaseConnection(const std::string& connection_string, const std::string& db_type)
        : connection_string_(connection_string), 
          is_connected_(false),
          database_type_(db_type),
          connection_id_(next_connection_id_++),
          last_used_(std::chrono::steady_clock::now()) {
        
        connect();
    }
    
    ~DatabaseConnection() {
        disconnect();
    }
    
    // Move semantics only
    DatabaseConnection(DatabaseConnection&& other) noexcept
        : connection_string_(std::move(other.connection_string_)),
          is_connected_(other.is_connected_),
          database_type_(std::move(other.database_type_)),
          connection_id_(other.connection_id_),
          last_used_(other.last_used_) {
        other.is_connected_ = false;
        std::cout << "Database connection moved: " << connection_id_ << "\\n";
    }
    
    DatabaseConnection& operator=(DatabaseConnection&& other) noexcept {
        if (this != &other) {
            disconnect();
            connection_string_ = std::move(other.connection_string_);
            is_connected_ = other.is_connected_;
            database_type_ = std::move(other.database_type_);
            connection_id_ = other.connection_id_;
            last_used_ = other.last_used_;
            other.is_connected_ = false;
        }
        return *this;
    }
    
    DatabaseConnection(const DatabaseConnection&) = delete;
    DatabaseConnection& operator=(const DatabaseConnection&) = delete;
    
private:
    void connect() {
        std::cout << "Connecting to " << database_type_ 
                  << " database (ID: " << connection_id_ << ")\\n";
        
        // Simulate connection time
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        
        is_connected_ = true;
        last_used_ = std::chrono::steady_clock::now();
    }
    
    void disconnect() {
        if (is_connected_) {
            std::cout << "Disconnecting from database (ID: " << connection_id_ << ")\\n";
            is_connected_ = false;
        }
    }
    
public:
    bool execute_query(const std::string& query) {
        if (!is_connected_) {
            std::cerr << "Cannot execute query - connection not active\\n";
            return false;
        }
        
        last_used_ = std::chrono::steady_clock::now();
        std::cout << "Executing query on connection " << connection_id_ 
                  << ": " << query.substr(0, 50) << "...\\n";
        
        // Simulate query execution time
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
        return true;
    }
    
    bool begin_transaction() {
        if (!is_connected_) return false;
        
        last_used_ = std::chrono::steady_clock::now();
        std::cout << "BEGIN TRANSACTION on connection " << connection_id_ << "\\n";
        return execute_query("BEGIN");
    }
    
    bool commit_transaction() {
        if (!is_connected_) return false;
        
        std::cout << "COMMIT on connection " << connection_id_ << "\\n";
        return execute_query("COMMIT");
    }
    
    bool rollback_transaction() {
        if (!is_connected_) return false;
        
        std::cout << "ROLLBACK on connection " << connection_id_ << "\\n";
        return execute_query("ROLLBACK");
    }
    
    bool is_connected() const { return is_connected_; }
    int get_id() const { return connection_id_; }
    std::string get_type() const { return database_type_; }
    
    auto time_since_last_used() const {
        return std::chrono::steady_clock::now() - last_used_;
    }
};

std::atomic<int> DatabaseConnection::next_connection_id_{1};

// RAII Transaction Handle
class TransactionHandle {
private:
    DatabaseConnection* connection_;
    bool is_active_;
    bool auto_rollback_;
    
public:
    explicit TransactionHandle(DatabaseConnection& connection, bool auto_rollback = true)
        : connection_(&connection), is_active_(false), auto_rollback_(auto_rollback) {
        
        if (connection_->begin_transaction()) {
            is_active_ = true;
            std::cout << "Transaction started (auto-rollback: " << auto_rollback_ << ")\\n";
        } else {
            throw std::runtime_error("Failed to begin transaction");
        }
    }
    
    ~TransactionHandle() {
        if (is_active_) {
            if (auto_rollback_) {
                std::cout << "Auto-rollback transaction in destructor\\n";
                connection_->rollback_transaction();
            } else {
                std::cout << "Warning: Transaction destroyed without explicit commit/rollback\\n";
            }
        }
    }
    
    // Move semantics
    TransactionHandle(TransactionHandle&& other) noexcept
        : connection_(other.connection_),
          is_active_(other.is_active_),
          auto_rollback_(other.auto_rollback_) {
        other.is_active_ = false;
    }
    
    TransactionHandle& operator=(TransactionHandle&& other) noexcept {
        if (this != &other) {
            if (is_active_ && auto_rollback_) {
                connection_->rollback_transaction();
            }
            connection_ = other.connection_;
            is_active_ = other.is_active_;
            auto_rollback_ = other.auto_rollback_;
            other.is_active_ = false;
        }
        return *this;
    }
    
    TransactionHandle(const TransactionHandle&) = delete;
    TransactionHandle& operator=(const TransactionHandle&) = delete;
    
    bool commit() {
        if (!is_active_) {
            std::cerr << "Cannot commit inactive transaction\\n";
            return false;
        }
        
        bool success = connection_->commit_transaction();
        if (success) {
            is_active_ = false;
            std::cout << "Transaction committed successfully\\n";
        }
        return success;
    }
    
    bool rollback() {
        if (!is_active_) {
            std::cerr << "Cannot rollback inactive transaction\\n";
            return false;
        }
        
        bool success = connection_->rollback_transaction();
        if (success) {
            is_active_ = false;
            std::cout << "Transaction rolled back\\n";
        }
        return success;
    }
    
    bool execute(const std::string& query) {
        if (!is_active_) {
            std::cerr << "Cannot execute on inactive transaction\\n";
            return false;
        }
        
        return connection_->execute_query(query);
    }
    
    bool is_active() const { return is_active_; }
    DatabaseConnection* get_connection() const { return connection_; }
};

// Connection Pool with RAII Management
class DatabaseConnectionPool {
private:
    std::queue<std::unique_ptr<DatabaseConnection>> available_connections_;
    std::vector<std::unique_ptr<DatabaseConnection>> all_connections_;
    std::mutex pool_mutex_;
    std::condition_variable pool_condition_;
    
    std::string connection_string_;
    std::string database_type_;
    size_t max_connections_;
    size_t min_connections_;
    std::chrono::seconds connection_timeout_;
    
    std::atomic<bool> is_running_{true};
    std::thread cleanup_thread_;
    
public:
    DatabaseConnectionPool(const std::string& connection_string,
                          const std::string& database_type,
                          size_t min_connections = 5,
                          size_t max_connections = 50,
                          std::chrono::seconds timeout = std::chrono::seconds(300))
        : connection_string_(connection_string),
          database_type_(database_type),
          max_connections_(max_connections),
          min_connections_(min_connections),
          connection_timeout_(timeout) {
        
        // Initialize minimum connections
        initialize_pool();
        
        // Start cleanup thread
        cleanup_thread_ = std::thread([this]() { cleanup_expired_connections(); });
        
        std::cout << "Connection pool initialized: " 
                  << min_connections << "-" << max_connections << " connections\\n";
    }
    
    ~DatabaseConnectionPool() {
        is_running_ = false;
        pool_condition_.notify_all();
        
        if (cleanup_thread_.joinable()) {
            cleanup_thread_.join();
        }
        
        std::cout << "Connection pool destroyed\\n";
    }
    
    // RAII Connection Handle - automatically returns to pool
    class ConnectionHandle {
    private:
        std::unique_ptr<DatabaseConnection> connection_;
        DatabaseConnectionPool* pool_;
        
    public:
        ConnectionHandle(std::unique_ptr<DatabaseConnection> conn, DatabaseConnectionPool* pool)
            : connection_(std::move(conn)), pool_(pool) {}
        
        ~ConnectionHandle() {
            if (connection_) {
                pool_->return_connection(std::move(connection_));
            }
        }
        
        // Move semantics only
        ConnectionHandle(ConnectionHandle&& other) noexcept
            : connection_(std::move(other.connection_)), pool_(other.pool_) {}
        
        ConnectionHandle& operator=(ConnectionHandle&& other) noexcept {
            if (this != &other) {
                if (connection_) {
                    pool_->return_connection(std::move(connection_));
                }
                connection_ = std::move(other.connection_);
                pool_ = other.pool_;
            }
            return *this;
        }
        
        ConnectionHandle(const ConnectionHandle&) = delete;
        ConnectionHandle& operator=(const ConnectionHandle&) = delete;
        
        DatabaseConnection* operator->() { return connection_.get(); }
        DatabaseConnection& operator*() { return *connection_; }
        
        DatabaseConnection* get() const { return connection_.get(); }
        bool is_valid() const { return connection_ && connection_->is_connected(); }
    };
    
    ConnectionHandle acquire_connection(std::chrono::milliseconds timeout = std::chrono::milliseconds(5000)) {
        std::unique_lock<std::mutex> lock(pool_mutex_);
        
        // Wait for available connection
        if (!pool_condition_.wait_for(lock, timeout, [this]() {
            return !available_connections_.empty() || all_connections_.size() < max_connections_;
        })) {
            throw std::runtime_error("Connection pool timeout - no connections available");
        }
        
        std::unique_ptr<DatabaseConnection> connection;
        
        if (!available_connections_.empty()) {
            // Reuse existing connection
            connection = std::move(available_connections_.front());
            available_connections_.pop();
            std::cout << "Connection acquired from pool (ID: " << connection->get_id() << ")\\n";
        } else if (all_connections_.size() < max_connections_) {
            // Create new connection
            connection = std::make_unique<DatabaseConnection>(connection_string_, database_type_);
            all_connections_.push_back(
                std::make_unique<DatabaseConnection>(connection_string_, database_type_)
            );
            std::cout << "New connection created (ID: " << connection->get_id() << ")\\n";
        }
        
        if (!connection) {
            throw std::runtime_error("Failed to acquire database connection");
        }
        
        return ConnectionHandle(std::move(connection), this);
    }
    
private:
    void return_connection(std::unique_ptr<DatabaseConnection> connection) {
        if (!connection || !connection->is_connected()) {
            std::cout << "Invalid connection returned to pool\\n";
            return;
        }
        
        std::lock_guard<std::mutex> lock(pool_mutex_);
        available_connections_.push(std::move(connection));
        std::cout << "Connection returned to pool\\n";
        pool_condition_.notify_one();
    }
    
    void initialize_pool() {
        for (size_t i = 0; i < min_connections_; ++i) {
            auto connection = std::make_unique<DatabaseConnection>(connection_string_, database_type_);
            available_connections_.push(std::move(connection));
            all_connections_.push_back(
                std::make_unique<DatabaseConnection>(connection_string_, database_type_)
            );
        }
    }
    
    void cleanup_expired_connections() {
        while (is_running_) {
            std::this_thread::sleep_for(std::chrono::seconds(30));
            
            std::unique_lock<std::mutex> lock(pool_mutex_);
            
            // Clean up expired connections
            std::queue<std::unique_ptr<DatabaseConnection>> new_queue;
            
            while (!available_connections_.empty()) {
                auto& conn = available_connections_.front();
                
                if (conn->time_since_last_used() < connection_timeout_) {
                    new_queue.push(std::move(conn));
                } else {
                    std::cout << "Cleaning up expired connection (ID: " << conn->get_id() << ")\\n";
                }
                
                available_connections_.pop();
            }
            
            available_connections_ = std::move(new_queue);
            
            // Maintain minimum connections
            while (available_connections_.size() < min_connections_ && 
                   all_connections_.size() < max_connections_) {
                auto new_conn = std::make_unique<DatabaseConnection>(connection_string_, database_type_);
                available_connections_.push(std::move(new_conn));
                all_connections_.push_back(
                    std::make_unique<DatabaseConnection>(connection_string_, database_type_)
                );
            }
        }
    }
    
public:
    size_t available_count() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return available_connections_.size();
    }
    
    size_t total_count() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return all_connections_.size();
    }
};

void demonstrate_database_handles() {
    std::cout << "=== Database Connection Handle Demonstration ===\\n";
    
    try {
        // Connection Pool
        DatabaseConnectionPool pool("postgresql://localhost:5432/testdb", "PostgreSQL", 3, 10);
        
        // Basic connection usage
        {
            auto conn_handle = pool.acquire_connection();
            conn_handle->execute_query("SELECT * FROM users");
            
            // Transaction with automatic rollback
            {
                TransactionHandle transaction(*conn_handle);
                transaction.execute("INSERT INTO users (name) VALUES ('Alice')");
                transaction.execute("INSERT INTO users (name) VALUES ('Bob')");
                
                // Simulate error condition
                if (true) {  // Error condition
                    std::cout << "Error detected - transaction will auto-rollback\\n";
                    // Transaction destructor will rollback
                } else {
                    transaction.commit();
                }
            }
            
            // Successful transaction
            {
                TransactionHandle transaction(*conn_handle, false);  // No auto-rollback
                transaction.execute("INSERT INTO logs (message) VALUES ('Operation completed')");
                transaction.commit();
            }
        }
        
        // Multiple concurrent connections
        std::vector<DatabaseConnectionPool::ConnectionHandle> connections;
        
        for (int i = 0; i < 5; ++i) {
            connections.push_back(pool.acquire_connection());
            connections.back()->execute_query("SELECT COUNT(*) FROM table_" + std::to_string(i));
        }
        
        std::cout << "Pool status - Available: " << pool.available_count() 
                  << ", Total: " << pool.total_count() << "\\n";
        
        // Connections automatically returned to pool when handles are destroyed
        
    } catch (const std::exception& e) {
        std::cerr << "Database error: " << e.what() << "\\n";
    }
}`,

    custom_handles: `// Custom RAII Handle Patterns and Advanced Deleters
#include <memory>
#include <functional>
#include <string>
#include <vector>
#include <unordered_map>
#include <iostream>
#include <chrono>
#include <thread>
#include <atomic>
#include <mutex>

// Generic RAII Handle Template with Custom Deleters
template<typename HandleType, typename DeleterType = std::default_delete<HandleType>>
class RAIIHandle {
private:
    HandleType handle_;
    DeleterType deleter_;
    bool owns_resource_;
    std::string debug_name_;
    
public:
    // Constructor with custom deleter
    RAIIHandle(HandleType handle, DeleterType deleter = DeleterType{}, 
               const std::string& name = "Handle")
        : handle_(handle), deleter_(deleter), owns_resource_(true), debug_name_(name) {
        std::cout << "RAII Handle created: " << debug_name_ << "\\n";
    }
    
    // Move constructor
    RAIIHandle(RAIIHandle&& other) noexcept
        : handle_(other.handle_),
          deleter_(std::move(other.deleter_)),
          owns_resource_(other.owns_resource_),
          debug_name_(std::move(other.debug_name_)) {
        other.owns_resource_ = false;
        std::cout << "RAII Handle moved: " << debug_name_ << "\\n";
    }
    
    // Move assignment
    RAIIHandle& operator=(RAIIHandle&& other) noexcept {
        if (this != &other) {
            reset();  // Clean up current resource
            handle_ = other.handle_;
            deleter_ = std::move(other.deleter_);
            owns_resource_ = other.owns_resource_;
            debug_name_ = std::move(other.debug_name_);
            other.owns_resource_ = false;
        }
        return *this;
    }
    
    // Destructor
    ~RAIIHandle() {
        reset();
    }
    
    // Disable copy
    RAIIHandle(const RAIIHandle&) = delete;
    RAIIHandle& operator=(const RAIIHandle&) = delete;
    
    // Release ownership and return handle
    HandleType release() {
        owns_resource_ = false;
        return handle_;
    }
    
    // Reset with new handle
    void reset(HandleType new_handle = HandleType{}) {
        if (owns_resource_) {
            deleter_(handle_);
            std::cout << "RAII Handle resource cleaned up: " << debug_name_ << "\\n";
        }
        handle_ = new_handle;
        owns_resource_ = (new_handle != HandleType{});
    }
    
    // Get handle without transferring ownership
    HandleType get() const { return handle_; }
    
    // Check if handle owns resource
    bool owns() const { return owns_resource_; }
    
    // Swap with another handle
    void swap(RAIIHandle& other) noexcept {
        std::swap(handle_, other.handle_);
        std::swap(deleter_, other.deleter_);
        std::swap(owns_resource_, other.owns_resource_);
        std::swap(debug_name_, other.debug_name_);
    }
    
    const std::string& name() const { return debug_name_; }
};

// Thread Handle with Custom Deleter
class ThreadHandle {
private:
    std::thread thread_;
    std::atomic<bool> should_stop_{false};
    std::string thread_name_;
    
public:
    template<typename Function, typename... Args>
    ThreadHandle(const std::string& name, Function&& func, Args&&... args)
        : thread_name_(name) {
        
        thread_ = std::thread([this, func = std::forward<Function>(func), 
                              args = std::make_tuple(std::forward<Args>(args)...)]() mutable {
            std::cout << "Thread started: " << thread_name_ << "\\n";
            
            try {
                std::apply(func, args);
            } catch (const std::exception& e) {
                std::cerr << "Thread " << thread_name_ << " error: " << e.what() << "\\n";
            }
            
            std::cout << "Thread finished: " << thread_name_ << "\\n";
        });
    }
    
    ~ThreadHandle() {
        stop_and_join();
    }
    
    // Move semantics only
    ThreadHandle(ThreadHandle&& other) noexcept
        : thread_(std::move(other.thread_)),
          should_stop_(other.should_stop_.load()),
          thread_name_(std::move(other.thread_name_)) {
        std::cout << "Thread handle moved: " << thread_name_ << "\\n";
    }
    
    ThreadHandle& operator=(ThreadHandle&& other) noexcept {
        if (this != &other) {
            stop_and_join();
            thread_ = std::move(other.thread_);
            should_stop_ = other.should_stop_.load();
            thread_name_ = std::move(other.thread_name_);
        }
        return *this;
    }
    
    ThreadHandle(const ThreadHandle&) = delete;
    ThreadHandle& operator=(const ThreadHandle&) = delete;
    
    void stop() {
        should_stop_ = true;
    }
    
    void join() {
        if (thread_.joinable()) {
            thread_.join();
            std::cout << "Thread joined: " << thread_name_ << "\\n";
        }
    }
    
    void detach() {
        if (thread_.joinable()) {
            thread_.detach();
            std::cout << "Thread detached: " << thread_name_ << "\\n";
        }
    }
    
    bool should_stop() const { return should_stop_.load(); }
    bool joinable() const { return thread_.joinable(); }
    const std::string& name() const { return thread_name_; }
    
private:
    void stop_and_join() {
        stop();
        join();
    }
};

// Memory Pool Handle
class MemoryPoolHandle {
private:
    void* memory_block_;
    size_t block_size_;
    size_t alignment_;
    std::string pool_name_;
    std::function<void(void*)> deallocator_;
    
public:
    MemoryPoolHandle(size_t size, size_t alignment = alignof(std::max_align_t), 
                    const std::string& name = "MemoryPool")
        : block_size_(size), alignment_(alignment), pool_name_(name) {
        
        // Aligned allocation
        memory_block_ = std::aligned_alloc(alignment_, size);
        if (!memory_block_) {
            throw std::bad_alloc();
        }
        
        // Custom deallocator
        deallocator_ = [](void* ptr) {
            std::free(ptr);
            std::cout << "Memory pool deallocated\\n";
        };
        
        std::cout << "Memory pool allocated: " << pool_name_ 
                  << " (" << size << " bytes, " << alignment << " alignment)\\n";
    }
    
    ~MemoryPoolHandle() {
        if (memory_block_) {
            deallocator_(memory_block_);
            std::cout << "Memory pool destroyed: " << pool_name_ << "\\n";
        }
    }
    
    // Move semantics only
    MemoryPoolHandle(MemoryPoolHandle&& other) noexcept
        : memory_block_(other.memory_block_),
          block_size_(other.block_size_),
          alignment_(other.alignment_),
          pool_name_(std::move(other.pool_name_)),
          deallocator_(std::move(other.deallocator_)) {
        other.memory_block_ = nullptr;
    }
    
    MemoryPoolHandle& operator=(MemoryPoolHandle&& other) noexcept {
        if (this != &other) {
            if (memory_block_) {
                deallocator_(memory_block_);
            }
            memory_block_ = other.memory_block_;
            block_size_ = other.block_size_;
            alignment_ = other.alignment_;
            pool_name_ = std::move(other.pool_name_);
            deallocator_ = std::move(other.deallocator_);
            other.memory_block_ = nullptr;
        }
        return *this;
    }
    
    MemoryPoolHandle(const MemoryPoolHandle&) = delete;
    MemoryPoolHandle& operator=(const MemoryPoolHandle&) = delete;
    
    template<typename T>
    T* allocate(size_t count = 1) {
        size_t required_size = sizeof(T) * count;
        if (required_size > block_size_) {
            throw std::bad_alloc();
        }
        
        // Simple allocation from start (real implementation would have free list)
        return static_cast<T*>(memory_block_);
    }
    
    void* get_raw() const { return memory_block_; }
    size_t size() const { return block_size_; }
    size_t get_alignment() const { return alignment_; }
    const std::string& name() const { return pool_name_; }
};

// Handle Pool for Resource Recycling
template<typename HandleType>
class HandlePool {
private:
    std::vector<std::unique_ptr<HandleType>> available_handles_;
    std::function<std::unique_ptr<HandleType>()> factory_;
    std::mutex pool_mutex_;
    size_t max_pool_size_;
    std::atomic<size_t> total_created_{0};
    std::atomic<size_t> total_recycled_{0};
    
public:
    HandlePool(std::function<std::unique_ptr<HandleType>()> factory, size_t max_size = 50)
        : factory_(factory), max_pool_size_(max_size) {
        std::cout << "Handle pool created (max size: " << max_size << ")\\n";
    }
    
    ~HandlePool() {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        available_handles_.clear();
        std::cout << "Handle pool destroyed (created: " << total_created_ 
                  << ", recycled: " << total_recycled_ << ")\\n";
    }
    
    // RAII Pool Handle - automatically returns to pool
    class PooledHandle {
    private:
        std::unique_ptr<HandleType> handle_;
        HandlePool* pool_;
        
    public:
        PooledHandle(std::unique_ptr<HandleType> handle, HandlePool* pool)
            : handle_(std::move(handle)), pool_(pool) {}
        
        ~PooledHandle() {
            if (handle_) {
                pool_->return_handle(std::move(handle_));
            }
        }
        
        // Move semantics only
        PooledHandle(PooledHandle&& other) noexcept
            : handle_(std::move(other.handle_)), pool_(other.pool_) {}
        
        PooledHandle& operator=(PooledHandle&& other) noexcept {
            if (this != &other) {
                if (handle_) {
                    pool_->return_handle(std::move(handle_));
                }
                handle_ = std::move(other.handle_);
                pool_ = other.pool_;
            }
            return *this;
        }
        
        PooledHandle(const PooledHandle&) = delete;
        PooledHandle& operator=(const PooledHandle&) = delete;
        
        HandleType* operator->() { return handle_.get(); }
        HandleType& operator*() { return *handle_; }
        HandleType* get() const { return handle_.get(); }
    };
    
    PooledHandle acquire() {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        if (!available_handles_.empty()) {
            auto handle = std::move(available_handles_.back());
            available_handles_.pop_back();
            total_recycled_++;
            std::cout << "Handle acquired from pool (recycled: " << total_recycled_ << ")\\n";
            return PooledHandle(std::move(handle), this);
        }
        
        // Create new handle
        auto new_handle = factory_();
        total_created_++;
        std::cout << "New handle created (total: " << total_created_ << ")\\n";
        return PooledHandle(std::move(new_handle), this);
    }
    
private:
    void return_handle(std::unique_ptr<HandleType> handle) {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        if (available_handles_.size() < max_pool_size_) {
            available_handles_.push_back(std::move(handle));
            std::cout << "Handle returned to pool\\n";
        } else {
            std::cout << "Handle destroyed (pool full)\\n";
            // handle will be destroyed
        }
    }
    
public:
    size_t available_count() const {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        return available_handles_.size();
    }
    
    size_t created_count() const { return total_created_.load(); }
    size_t recycled_count() const { return total_recycled_.load(); }
};

// Cross-platform Handle Abstraction
#ifdef _WIN32
    using PlatformHandle = void*;  // HANDLE on Windows
    constexpr PlatformHandle INVALID_PLATFORM_HANDLE = nullptr;
#else
    using PlatformHandle = int;    // file descriptor on Unix
    constexpr PlatformHandle INVALID_PLATFORM_HANDLE = -1;
#endif

class CrossPlatformHandle {
private:
    PlatformHandle handle_;
    std::function<void(PlatformHandle)> deleter_;
    std::string resource_name_;
    
public:
    CrossPlatformHandle(PlatformHandle handle, 
                       std::function<void(PlatformHandle)> deleter,
                       const std::string& name = "PlatformResource")
        : handle_(handle), deleter_(deleter), resource_name_(name) {
        
        if (handle_ == INVALID_PLATFORM_HANDLE) {
            throw std::runtime_error("Invalid platform handle");
        }
        
        std::cout << "Cross-platform handle created: " << resource_name_ << "\\n";
    }
    
    ~CrossPlatformHandle() {
        if (handle_ != INVALID_PLATFORM_HANDLE) {
            deleter_(handle_);
            std::cout << "Cross-platform handle destroyed: " << resource_name_ << "\\n";
        }
    }
    
    // Move semantics only
    CrossPlatformHandle(CrossPlatformHandle&& other) noexcept
        : handle_(other.handle_),
          deleter_(std::move(other.deleter_)),
          resource_name_(std::move(other.resource_name_)) {
        other.handle_ = INVALID_PLATFORM_HANDLE;
    }
    
    CrossPlatformHandle& operator=(CrossPlatformHandle&& other) noexcept {
        if (this != &other) {
            if (handle_ != INVALID_PLATFORM_HANDLE) {
                deleter_(handle_);
            }
            handle_ = other.handle_;
            deleter_ = std::move(other.deleter_);
            resource_name_ = std::move(other.resource_name_);
            other.handle_ = INVALID_PLATFORM_HANDLE;
        }
        return *this;
    }
    
    CrossPlatformHandle(const CrossPlatformHandle&) = delete;
    CrossPlatformHandle& operator=(const CrossPlatformHandle&) = delete;
    
    PlatformHandle get() const { return handle_; }
    bool is_valid() const { return handle_ != INVALID_PLATFORM_HANDLE; }
    const std::string& name() const { return resource_name_; }
};

void demonstrate_custom_handles() {
    std::cout << "=== Custom RAII Handle Demonstration ===\\n";
    
    try {
        // Generic RAII Handle with custom deleter
        {
            auto custom_deleter = [](int* ptr) {
                std::cout << "Custom deleter called for value: " << *ptr << "\\n";
                delete ptr;
            };
            
            RAIIHandle<int*, decltype(custom_deleter)> handle(
                new int(42), custom_deleter, "IntegerHandle"
            );
            
            std::cout << "Handle value: " << *handle.get() << "\\n";
            
            // Move handle
            auto moved_handle = std::move(handle);
            std::cout << "Moved handle value: " << *moved_handle.get() << "\\n";
        }
        
        // Thread Handle
        {
            ThreadHandle worker_thread("WorkerThread", []() {
                for (int i = 0; i < 5; ++i) {
                    std::cout << "Worker iteration: " << i << "\\n";
                    std::this_thread::sleep_for(std::chrono::milliseconds(100));
                }
            });
            
            std::this_thread::sleep_for(std::chrono::milliseconds(300));
            worker_thread.stop();  // Request stop
            // Thread will be automatically joined in destructor
        }
        
        // Memory Pool Handle
        {
            MemoryPoolHandle memory_pool(1024 * 1024, 64, "MainPool");
            
            auto int_array = memory_pool.allocate<int>(100);
            for (int i = 0; i < 10; ++i) {
                int_array[i] = i * i;
            }
            
            std::cout << "First 5 values: ";
            for (int i = 0; i < 5; ++i) {
                std::cout << int_array[i] << " ";
            }
            std::cout << "\\n";
        }
        
        // Handle Pool
        {
            auto string_factory = []() {
                static int counter = 0;
                return std::make_unique<std::string>("String_" + std::to_string(counter++));
            };
            
            HandlePool<std::string> string_pool(string_factory, 5);
            
            // Acquire multiple handles
            std::vector<HandlePool<std::string>::PooledHandle> handles;
            
            for (int i = 0; i < 8; ++i) {
                handles.push_back(string_pool.acquire());
                std::cout << "Acquired: " << *handles.back() << "\\n";
            }
            
            std::cout << "Pool stats - Created: " << string_pool.created_count() 
                      << ", Available: " << string_pool.available_count() << "\\n";
            
            // Release some handles (scope ends)
            handles.resize(3);
            
            std::cout << "After releasing - Available: " << string_pool.available_count() << "\\n";
        }
        
        // Cross-platform Handle
        {
#ifdef _WIN32
            auto win32_deleter = [](PlatformHandle handle) {
                // CloseHandle(handle); // Real Windows API call
                std::cout << "Windows handle closed\\n";
            };
            
            CrossPlatformHandle platform_handle(
                reinterpret_cast<PlatformHandle>(0x12345678),
                win32_deleter,
                "WindowsResource"
            );
#else
            auto unix_deleter = [](PlatformHandle fd) {
                // close(fd);  // Real Unix system call
                std::cout << "Unix file descriptor closed: " << fd << "\\n";
            };
            
            CrossPlatformHandle platform_handle(
                42,  // Simulated file descriptor
                unix_deleter,
                "UnixResource"
            );
#endif
            
            std::cout << "Platform handle created successfully\\n";
        }
        
    } catch (const std::exception& e) {
        std::cerr << "Custom handle error: " << e.what() << "\\n";
    }
}`
  };

  const currentCode = codeExamples[state.scenario];

  return (
    <LessonLayout
      title={state.language === 'en' ? "Lesson 83: RAII Handles" : "Lección 83: RAII Handles"}
      lessonId="lesson-83"
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <SectionTitle>
            {state.language === 'en' ? 'Advanced Resource Management Patterns' : 'Patrones Avanzados de Gestión de Recursos'}
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
                  'Master RAII patterns for file handles, sockets, and OS resources',
                  'Implement GPU resource handles with custom deleters and pooling',
                  'Design database connection handles with transaction management',
                  'Create custom handle patterns for specialized resource types',
                  'Apply move semantics and exception safety to resource handles',
                  'Build cross-platform resource abstraction with deterministic cleanup'
                ]
              : [
                  'Dominar patrones RAII para handles de archivo, sockets y recursos del SO',
                  'Implementar handles de recursos GPU con deleters personalizados y pooling',
                  'Diseñar handles de conexión de base de datos con gestión de transacciones',
                  'Crear patrones de handles personalizados para tipos de recursos especializados',
                  'Aplicar semántica de movimiento y seguridad de excepciones a handles de recursos',
                  'Construir abstracción de recursos multiplataforma con limpieza determinística'
                ]
          }
        />
      </Section>

      <InteractiveSection>
        <SectionTitle>
          {state.language === 'en' ? 'Interactive RAII Handles Demonstration' : 'Demostración Interactiva de RAII Handles'}
        </SectionTitle>
        
        <div style={{ height: '400px', marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <RAIIHandlesVisualization 
              scenario={state.scenario}
              isAnimating={state.isAnimating}
              onMetrics={updateMetrics}
            />
          </Canvas>
        </div>

        <ButtonGroup>
          <Button 
            onClick={() => runScenario('file_handles')}
            variant={state.scenario === 'file_handles' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'File Handles' : 'Handles de Archivo'}
          </Button>
          <Button 
            onClick={() => runScenario('gpu_resources')}
            variant={state.scenario === 'gpu_resources' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'GPU Resources' : 'Recursos GPU'}
          </Button>
          <Button 
            onClick={() => runScenario('database_connections')}
            variant={state.scenario === 'database_connections' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Database Connections' : 'Conexiones DB'}
          </Button>
          <Button 
            onClick={() => runScenario('custom_handles')}
            variant={state.scenario === 'custom_handles' ? 'primary' : 'secondary'}
          >
            {state.language === 'en' ? 'Custom Handles' : 'Handles Personalizados'}
          </Button>
        </ButtonGroup>

        <PerformanceMonitor
          metrics={[
            { 
              label: state.language === 'en' ? 'Active Resources' : 'Recursos Activos', 
              value: state.resourcesActive,
              color: '#00ff00'
            },
            { 
              label: state.language === 'en' ? 'Memory Usage MB' : 'Uso Memoria MB', 
              value: Math.round(state.memoryUsage),
              color: '#0080ff'
            },
            { 
              label: state.language === 'en' ? 'Handle Efficiency %' : 'Eficiencia Handles %', 
              value: Math.round(state.handleEfficiency),
              color: '#ff8000'
            },
            { 
              label: state.language === 'en' ? 'Cleanup Success %' : 'Limpieza Exitosa %', 
              value: Math.round(state.cleanupSuccess),
              color: '#ff0080'
            }
          ]}
        />

        <PerformanceComparison
          title={state.language === 'en' ? 'RAII vs Manual Resource Management' : 'RAII vs Gestión Manual de Recursos'}
          scenarios={[
            {
              name: state.language === 'en' ? 'Manual Management' : 'Gestión Manual',
              metrics: {
                [state.language === 'en' ? 'Memory Leaks' : 'Fugas Memoria']: 15,
                [state.language === 'en' ? 'Exception Safety' : 'Seguridad Excepciones']: 65,
                [state.language === 'en' ? 'Code Complexity' : 'Complejidad Código']: 85
              }
            },
            {
              name: state.language === 'en' ? 'RAII Handles' : 'RAII Handles',
              metrics: {
                [state.language === 'en' ? 'Memory Leaks' : 'Fugas Memoria']: 0,
                [state.language === 'en' ? 'Exception Safety' : 'Seguridad Excepciones']: 98,
                [state.language === 'en' ? 'Code Complexity' : 'Complejidad Código']: 45
              }
            }
          ]}
        />
      </InteractiveSection>

      <Section>
        <SectionTitle>
          {state.scenario === 'file_handles' && (state.language === 'en' ? 'File and Socket Handles' : 'Handles de Archivo y Socket')}
          {state.scenario === 'gpu_resources' && (state.language === 'en' ? 'GPU Resource Management' : 'Gestión de Recursos GPU')}
          {state.scenario === 'database_connections' && (state.language === 'en' ? 'Database Connection Pooling' : 'Pool de Conexiones de Base de Datos')}
          {state.scenario === 'custom_handles' && (state.language === 'en' ? 'Custom Handle Patterns' : 'Patrones de Handles Personalizados')}
        </SectionTitle>

        <CodeBlock 
          code={currentCode}
          language="cpp"
          title={
            state.scenario === 'file_handles' ? 
              (state.language === 'en' ? 'OS Resource Handle Implementation' : 'Implementación de Handles de Recursos del SO') :
            state.scenario === 'gpu_resources' ? 
              (state.language === 'en' ? 'GPU Resource Handle Patterns' : 'Patrones de Handles de Recursos GPU') :
            state.scenario === 'database_connections' ? 
              (state.language === 'en' ? 'Database Connection Management' : 'Gestión de Conexiones de Base de Datos') :
            (state.language === 'en' ? 'Advanced Custom Handle Patterns' : 'Patrones Avanzados de Handles Personalizados')
          }
        />
      </Section>

      <Section>
        <SectionTitle>
          {state.language === 'en' ? 'Production RAII Handle Strategies' : 'Estrategias de RAII Handles en Producción'}
        </SectionTitle>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #333'
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '🚀 Key RAII Handle Benefits:' : '🚀 Beneficios Clave de RAII Handles:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Deterministic Cleanup:' : 'Limpieza Determinística:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Resources are automatically released when handles go out of scope, eliminating leaks'
                : 'Los recursos se liberan automáticamente cuando los handles salen de alcance, eliminando fugas'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Exception Safety:' : 'Seguridad de Excepciones:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Handle destructors ensure cleanup even when exceptions are thrown during operation'
                : 'Los destructores de handles aseguran limpieza incluso cuando se lanzan excepciones durante la operación'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Move Semantics:' : 'Semántica de Movimiento:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Efficient transfer of resource ownership without expensive copying operations'
                : 'Transferencia eficiente de propiedad de recursos sin operaciones de copiado costosas'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Resource Pooling:' : 'Pool de Recursos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Automatic recycling of expensive resources like database connections and GPU buffers'
                : 'Reciclaje automático de recursos costosos como conexiones de base de datos y buffers GPU'
              }
            </li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: '#2e1a1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #800'
        }}>
          <h4 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
            {state.language === 'en' ? '⚠️ Design Considerations:' : '⚠️ Consideraciones de Diseño:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Custom Deleters:' : 'Deleters Personalizados:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Different resource types require specific cleanup procedures - design flexible deleter patterns'
                : 'Diferentes tipos de recursos requieren procedimientos de limpieza específicos - diseña patrones de deleter flexibles'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Thread Safety:' : 'Seguridad de Hilos:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Shared handles need synchronization - consider atomic operations and proper locking'
                : 'Los handles compartidos necesitan sincronización - considera operaciones atómicas y bloqueo apropiado'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Platform Abstraction:' : 'Abstracción de Plataforma:'}</strong>{' '}
              {state.language === 'en' 
                ? 'OS-specific resources require cross-platform handle wrappers for portability'
                : 'Los recursos específicos del SO requieren wrappers de handles multiplataforma para portabilidad'
              }
            </li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: '#1a2e1a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #080'
        }}>
          <h4 style={{ color: '#88ff88', marginBottom: '1rem' }}>
            {state.language === 'en' ? '✅ Best Practices:' : '✅ Mejores Prácticas:'}
          </h4>
          <ul style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
            <li>
              <strong>{state.language === 'en' ? 'Single Responsibility:' : 'Responsabilidad Única:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Each handle should manage exactly one resource type with clear ownership semantics'
                : 'Cada handle debe gestionar exactamente un tipo de recurso con semántica de propiedad clara'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Factory Patterns:' : 'Patrones Factory:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Use factory functions to create properly initialized handles with correct deleters'
                : 'Usa funciones factory para crear handles correctamente inicializados con deleters correctos'
              }
            </li>
            <li>
              <strong>{state.language === 'en' ? 'Debug Support:' : 'Soporte de Debug:'}</strong>{' '}
              {state.language === 'en' 
                ? 'Include debug names and tracking capabilities for production debugging and profiling'
                : 'Incluye nombres de debug y capacidades de seguimiento para debugging y profiling en producción'
              }
            </li>
          </ul>
        </div>
      </Section>
    </LessonLayout>
  );
};

export default Lesson83_RAIIHandles;