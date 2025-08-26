import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone, Line } from '@react-three/drei';
import { useApp } from '../context/AppContext';

interface NetworkMetrics {
  bufferEfficiency: number;
  zeroCopyPerformance: number;
  protocolOptimization: number;
  resourceUtilization: number;
}

interface NetworkVisualizationProps {
  metrics: NetworkMetrics;
  activePattern: string;
  onPatternSelect: (pattern: string) => void;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ 
  metrics, 
  activePattern, 
  onPatternSelect 
}) => {
  const groupRef = useRef<any>();
  const bufferRef = useRef<any>();
  const packetsRef = useRef<any>();
  const protocolRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
    if (bufferRef.current) {
      // Animate buffer management
      const time = state.clock.elapsedTime;
      bufferRef.current.children.forEach((child: any, index: number) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = 0.6 + 0.4 * Math.sin(time * 2 + index * 0.8);
        }
      });
    }
    if (packetsRef.current) {
      // Animate packet flow
      const time = state.clock.elapsedTime;
      packetsRef.current.position.x = Math.sin(time * 1.5) * 2;
    }
    if (protocolRef.current) {
      // Animate protocol stack
      protocolRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  const networkComponents = [
    { name: 'Buffer Pool', position: [-4, 2, 0], color: '#e74c3c', efficiency: metrics.bufferEfficiency },
    { name: 'Zero-Copy', position: [-2, 2, 0], color: '#3498db', efficiency: metrics.zeroCopyPerformance },
    { name: 'Protocol Buffer', position: [0, 2, 0], color: '#2ecc71', efficiency: metrics.protocolOptimization },
    { name: 'Resource Manager', position: [2, 2, 0], color: '#f39c12', efficiency: metrics.resourceUtilization },
  ];

  return (
    <group ref={groupRef}>
      {/* Network Architecture Base */}
      <Box args={[10, 0.2, 6]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#34495e" transparent opacity={0.8} />
      </Box>

      {/* Buffer Management Visualization */}
      <group ref={bufferRef} position={[-3, 0, 0]}>
        {[...Array(4)].map((_, i) => (
          <Box 
            key={`buffer-${i}`}
            args={[0.8, 0.8, 0.8]} 
            position={[i * 0.9, 0, 0]}
            onClick={() => onPatternSelect('Buffer Pool')}
          >
            <meshStandardMaterial 
              color={activePattern === 'Buffer Pool' ? '#e74c3c' : '#95a5a6'} 
              transparent 
              opacity={0.7}
            />
          </Box>
        ))}
      </group>

      {/* Zero-Copy Data Flow */}
      <group ref={packetsRef} position={[0, 0, 2]}>
        <Cylinder args={[0.3, 0.3, 2]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial 
            color={activePattern === 'Zero-Copy' ? '#3498db' : '#7f8c8d'} 
            transparent 
            opacity={0.8}
          />
        </Cylinder>
      </group>

      {/* Protocol Stack */}
      <group ref={protocolRef} position={[3, 0, 0]}>
        {[...Array(3)].map((_, i) => (
          <Box 
            key={`protocol-${i}`}
            args={[1.2, 0.3, 1.2]} 
            position={[0, i * 0.5, 0]}
            onClick={() => onPatternSelect('Protocol Buffer')}
          >
            <meshStandardMaterial 
              color={activePattern === 'Protocol Buffer' ? '#2ecc71' : '#95a5a6'} 
              transparent 
              opacity={0.6 + i * 0.1}
            />
          </Box>
        ))}
      </group>

      {/* Network Connections */}
      {networkComponents.map((comp, index) => (
        <group key={comp.name} position={comp.position}>
          <Sphere args={[0.4]} onClick={() => onPatternSelect(comp.name)}>
            <meshStandardMaterial 
              color={activePattern === comp.name ? comp.color : '#bdc3c7'} 
              transparent 
              opacity={0.8}
            />
          </Sphere>
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.2}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            {comp.name}
          </Text>
        </group>
      ))}

      {/* Efficiency Indicators */}
      {networkComponents.map((comp, index) => (
        <Box
          key={`indicator-${index}`}
          args={[0.1, comp.efficiency * 2, 0.1]}
          position={[comp.position[0], comp.efficiency - 1, comp.position[2] - 1.5]}
        >
          <meshStandardMaterial color={comp.color} />
        </Box>
      ))}
    </group>
  );
};

const Lesson117_NetworkProgrammingPointers: React.FC = () => {
  const { state } = useApp();
  const [activeExample, setActiveExample] = useState<string>('buffer-management');
  const [selectedPattern, setSelectedPattern] = useState<string>('Buffer Pool');
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    bufferEfficiency: 0.91,
    zeroCopyPerformance: 0.88,
    protocolOptimization: 0.93,
    resourceUtilization: 0.86
  });

  const examples = {
    'buffer-management': {
      title: state.language === 'en' ? 'Buffer Management Strategies' : 'Estrategias de Gestión de Buffers',
      code: `#include <memory>
#include <vector>
#include <queue>
#include <atomic>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <cassert>

namespace NetworkBuffers {

// High-performance buffer pool for network operations
template<size_t BufferSize = 4096>
class BufferPool {
private:
    struct Buffer {
        alignas(64) std::byte data[BufferSize];  // Cache-line aligned
        std::atomic<bool> in_use{false};
        std::atomic<size_t> ref_count{0};
        
        Buffer* next = nullptr;  // For free list management
    };
    
    static constexpr size_t POOL_SIZE = 1024;
    std::unique_ptr<Buffer[]> buffer_pool_;
    std::atomic<Buffer*> free_head_{nullptr};
    std::atomic<size_t> allocated_count_{0};
    
    // Lock-free stack for buffer management
    void push_buffer(Buffer* buffer) noexcept {
        Buffer* current_head = free_head_.load(std::memory_order_relaxed);
        do {
            buffer->next = current_head;
        } while (!free_head_.compare_exchange_weak(
            current_head, buffer, 
            std::memory_order_release, 
            std::memory_order_relaxed));
    }
    
    Buffer* pop_buffer() noexcept {
        Buffer* current_head = free_head_.load(std::memory_order_acquire);
        while (current_head != nullptr) {
            Buffer* next = current_head->next;
            if (free_head_.compare_exchange_weak(
                current_head, next,
                std::memory_order_release,
                std::memory_order_relaxed)) {
                return current_head;
            }
        }
        return nullptr;
    }

public:
    BufferPool() : buffer_pool_(std::make_unique<Buffer[]>(POOL_SIZE)) {
        // Initialize free list
        for (size_t i = 0; i < POOL_SIZE; ++i) {
            push_buffer(&buffer_pool_[i]);
        }
    }
    
    // RAII Buffer Handle with automatic return to pool
    class BufferHandle {
    private:
        Buffer* buffer_;
        BufferPool* pool_;
        
    public:
        BufferHandle(Buffer* buf, BufferPool* p) : buffer_(buf), pool_(p) {
            if (buffer_) {
                buffer_->ref_count_.fetch_add(1, std::memory_order_relaxed);
            }
        }
        
        ~BufferHandle() {
            if (buffer_ && pool_) {
                if (buffer_->ref_count_.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                    buffer_->in_use_.store(false, std::memory_order_release);
                    pool_->push_buffer(buffer_);
                }
            }
        }
        
        // Move semantics
        BufferHandle(BufferHandle&& other) noexcept 
            : buffer_(other.buffer_), pool_(other.pool_) {
            other.buffer_ = nullptr;
            other.pool_ = nullptr;
        }
        
        BufferHandle& operator=(BufferHandle&& other) noexcept {
            if (this != &other) {
                this->~BufferHandle();
                buffer_ = other.buffer_;
                pool_ = other.pool_;
                other.buffer_ = nullptr;
                other.pool_ = nullptr;
            }
            return *this;
        }
        
        // No copy semantics
        BufferHandle(const BufferHandle&) = delete;
        BufferHandle& operator=(const BufferHandle&) = delete;
        
        std::byte* data() noexcept { return buffer_ ? buffer_->data : nullptr; }
        const std::byte* data() const noexcept { return buffer_ ? buffer_->data : nullptr; }
        size_t size() const noexcept { return BufferSize; }
        bool valid() const noexcept { return buffer_ != nullptr; }
    };
    
    BufferHandle acquire_buffer() {
        Buffer* buffer = pop_buffer();
        if (buffer) {
            buffer->in_use_.store(true, std::memory_order_release);
            allocated_count_.fetch_add(1, std::memory_order_relaxed);
            return BufferHandle(buffer, this);
        }
        return BufferHandle(nullptr, nullptr);  // Pool exhausted
    }
    
    size_t available_buffers() const noexcept {
        return POOL_SIZE - allocated_count_.load(std::memory_order_relaxed);
    }
    
    double utilization_ratio() const noexcept {
        return static_cast<double>(allocated_count_.load(std::memory_order_relaxed)) / POOL_SIZE;
    }
};

// Example usage with network operations
class NetworkManager {
private:
    BufferPool<4096> send_buffers_;
    BufferPool<65536> receive_buffers_;
    
public:
    // Efficient send operation with buffer management
    bool send_data(const void* data, size_t size) {
        auto buffer = send_buffers_.acquire_buffer();
        if (!buffer.valid() || size > buffer.size()) {
            return false;
        }
        
        std::memcpy(buffer.data(), data, size);
        
        // Simulate network send (buffer automatically returned to pool)
        // In real implementation, buffer would be passed to async I/O
        return true;
    }
    
    // Zero-copy receive with buffer ownership transfer
    std::unique_ptr<BufferPool<65536>::BufferHandle> prepare_receive() {
        auto buffer = receive_buffers_.acquire_buffer();
        if (buffer.valid()) {
            return std::make_unique<BufferPool<65536>::BufferHandle>(std::move(buffer));
        }
        return nullptr;
    }
};

} // namespace NetworkBuffers`,
      explanation: state.language === 'en' ? 
        'Buffer management is critical for network performance. This implementation provides lock-free buffer pools with RAII handles, reference counting, and cache-line alignment for optimal performance.' :
        'La gestión de buffers es crítica para el rendimiento de red. Esta implementación proporciona pools de buffers sin bloqueos con handles RAII, conteo de referencias y alineación de línea de caché para rendimiento óptimo.'
    },
    
    'zero-copy': {
      title: state.language === 'en' ? 'Zero-Copy Networking Techniques' : 'Técnicas de Red Zero-Copy',
      code: `#include <memory>
#include <span>
#include <sys/socket.h>
#include <sys/sendfile.h>
#include <sys/uio.h>
#include <unistd.h>
#include <vector>
#include <array>

namespace ZeroCopy {

// Zero-copy scatter-gather I/O operations
class ScatterGatherBuffer {
private:
    std::vector<std::span<const std::byte>> read_spans_;
    std::vector<std::span<std::byte>> write_spans_;
    std::vector<struct iovec> iovec_array_;
    
public:
    // Add read-only data span (for sending)
    void add_read_span(std::span<const std::byte> data) {
        read_spans_.push_back(data);
    }
    
    // Add writable data span (for receiving)
    void add_write_span(std::span<std::byte> data) {
        write_spans_.push_back(data);
    }
    
    // Prepare iovec array for zero-copy operations
    const struct iovec* prepare_iovec() {
        iovec_array_.clear();
        
        // Prepare for read spans (sending)
        for (const auto& span : read_spans_) {
            iovec_array_.push_back({
                .iov_base = const_cast<std::byte*>(span.data()),
                .iov_len = span.size()
            });
        }
        
        // Prepare for write spans (receiving)
        for (const auto& span : write_spans_) {
            iovec_array_.push_back({
                .iov_base = span.data(),
                .iov_len = span.size()
            });
        }
        
        return iovec_array_.data();
    }
    
    size_t iovec_count() const noexcept {
        return iovec_array_.size();
    }
    
    size_t total_size() const noexcept {
        size_t total = 0;
        for (const auto& span : read_spans_) {
            total += span.size();
        }
        for (const auto& span : write_spans_) {
            total += span.size();
        }
        return total;
    }
};

// Memory-mapped file for zero-copy file operations
class MemoryMappedFile {
private:
    void* mapped_memory_ = nullptr;
    size_t file_size_ = 0;
    int fd_ = -1;
    
public:
    explicit MemoryMappedFile(const char* filename) {
        fd_ = open(filename, O_RDONLY);
        if (fd_ == -1) return;
        
        struct stat st;
        if (fstat(fd_, &st) == -1) {
            close(fd_);
            fd_ = -1;
            return;
        }
        
        file_size_ = st.st_size;
        mapped_memory_ = mmap(nullptr, file_size_, PROT_READ, MAP_PRIVATE, fd_, 0);
        
        if (mapped_memory_ == MAP_FAILED) {
            mapped_memory_ = nullptr;
            close(fd_);
            fd_ = -1;
        }
        
        // Advise kernel about access pattern
        if (mapped_memory_) {
            madvise(mapped_memory_, file_size_, MADV_SEQUENTIAL);
        }
    }
    
    ~MemoryMappedFile() {
        if (mapped_memory_) {
            munmap(mapped_memory_, file_size_);
        }
        if (fd_ != -1) {
            close(fd_);
        }
    }
    
    // Non-copyable
    MemoryMappedFile(const MemoryMappedFile&) = delete;
    MemoryMappedFile& operator=(const MemoryMappedFile&) = delete;
    
    // Movable
    MemoryMappedFile(MemoryMappedFile&& other) noexcept
        : mapped_memory_(other.mapped_memory_)
        , file_size_(other.file_size_)
        , fd_(other.fd_) {
        other.mapped_memory_ = nullptr;
        other.file_size_ = 0;
        other.fd_ = -1;
    }
    
    std::span<const std::byte> data() const noexcept {
        if (!mapped_memory_) return {};
        return std::span<const std::byte>(
            static_cast<const std::byte*>(mapped_memory_), 
            file_size_
        );
    }
    
    bool is_valid() const noexcept {
        return mapped_memory_ != nullptr;
    }
    
    // Zero-copy send file over socket
    ssize_t sendfile_to_socket(int socket_fd, off_t offset = 0, 
                              size_t count = 0) const {
        if (!is_valid() || fd_ == -1) return -1;
        
        size_t bytes_to_send = (count == 0) ? file_size_ - offset : count;
        return sendfile(socket_fd, fd_, &offset, bytes_to_send);
    }
};

// Zero-copy ring buffer for high-performance networking
template<size_t Size>
class ZeroCopyRingBuffer {
    static_assert((Size & (Size - 1)) == 0, "Size must be power of 2");
    
private:
    alignas(64) std::array<std::byte, Size> buffer_;
    alignas(64) std::atomic<size_t> write_pos_{0};
    alignas(64) std::atomic<size_t> read_pos_{0};
    
    static constexpr size_t INDEX_MASK = Size - 1;
    
public:
    // Get writable span without copying
    std::span<std::byte> reserve_write_space(size_t requested_size) {
        size_t current_write = write_pos_.load(std::memory_order_relaxed);
        size_t current_read = read_pos_.load(std::memory_order_acquire);
        
        size_t available_space = Size - (current_write - current_read);
        if (requested_size > available_space) {
            return {};  // Not enough space
        }
        
        size_t write_index = current_write & INDEX_MASK;
        size_t contiguous_space = std::min(requested_size, Size - write_index);
        
        return std::span<std::byte>(
            buffer_.data() + write_index, 
            contiguous_space
        );
    }
    
    // Commit written data
    void commit_write(size_t bytes_written) {
        write_pos_.fetch_add(bytes_written, std::memory_order_release);
    }
    
    // Get readable span without copying
    std::span<const std::byte> get_read_data() const {
        size_t current_read = read_pos_.load(std::memory_order_relaxed);
        size_t current_write = write_pos_.load(std::memory_order_acquire);
        
        if (current_read >= current_write) {
            return {};  // No data available
        }
        
        size_t read_index = current_read & INDEX_MASK;
        size_t available_data = current_write - current_read;
        size_t contiguous_data = std::min(available_data, Size - read_index);
        
        return std::span<const std::byte>(
            buffer_.data() + read_index,
            contiguous_data
        );
    }
    
    // Consume read data
    void consume_read(size_t bytes_consumed) {
        read_pos_.fetch_add(bytes_consumed, std::memory_order_release);
    }
    
    size_t available_write_space() const noexcept {
        return Size - (write_pos_.load(std::memory_order_relaxed) - 
                      read_pos_.load(std::memory_order_relaxed));
    }
    
    size_t available_read_data() const noexcept {
        return write_pos_.load(std::memory_order_relaxed) - 
               read_pos_.load(std::memory_order_relaxed);
    }
};

// Example zero-copy network server
class ZeroCopyServer {
private:
    ZeroCopyRingBuffer<1024 * 1024> receive_buffer_;  // 1MB ring buffer
    ScatterGatherBuffer sg_buffer_;
    
public:
    // Zero-copy receive operation
    ssize_t receive_data(int socket_fd) {
        auto write_span = receive_buffer_.reserve_write_space(4096);
        if (write_span.empty()) {
            return -1;  // Buffer full
        }
        
        ssize_t bytes_received = recv(socket_fd, write_span.data(), 
                                     write_span.size(), MSG_DONTWAIT);
        
        if (bytes_received > 0) {
            receive_buffer_.commit_write(bytes_received);
        }
        
        return bytes_received;
    }
    
    // Process received data without copying
    void process_received_data() {
        auto read_span = receive_buffer_.get_read_data();
        if (read_span.empty()) return;
        
        // Process data in-place (zero-copy)
        size_t processed = process_protocol_data(read_span);
        
        receive_buffer_.consume_read(processed);
    }
    
private:
    size_t process_protocol_data(std::span<const std::byte> data) {
        // Example: process data without copying
        // Return number of bytes processed
        return std::min(data.size(), size_t{1024});
    }
};

} // namespace ZeroCopy`,
      explanation: state.language === 'en' ? 
        'Zero-copy techniques eliminate unnecessary data copying in network operations. This includes scatter-gather I/O, memory-mapped files, ring buffers, and direct kernel operations like sendfile.' :
        'Las técnicas zero-copy eliminan copias de datos innecesarias en operaciones de red. Esto incluye E/S scatter-gather, archivos mapeados en memoria, buffers circulares y operaciones directas del kernel como sendfile.'
    },
    
    'protocol-buffers': {
      title: state.language === 'en' ? 'Protocol Buffers and Pointers' : 'Protocol Buffers y Punteros',
      code: `#include <memory>
#include <vector>
#include <string_view>
#include <span>
#include <cstring>
#include <bit>
#include <concepts>

namespace ProtocolBuffers {

// Efficient protocol buffer implementation with pointer optimization
class BinaryBuffer {
private:
    std::unique_ptr<std::byte[]> data_;
    size_t size_;
    size_t capacity_;
    size_t read_pos_ = 0;
    size_t write_pos_ = 0;
    
    void ensure_capacity(size_t needed) {
        if (write_pos_ + needed > capacity_) {
            size_t new_capacity = std::max(capacity_ * 2, write_pos_ + needed);
            auto new_data = std::make_unique<std::byte[]>(new_capacity);
            
            if (data_) {
                std::memcpy(new_data.get(), data_.get(), write_pos_);
            }
            
            data_ = std::move(new_data);
            capacity_ = new_capacity;
        }
    }
    
public:
    explicit BinaryBuffer(size_t initial_capacity = 1024)
        : data_(std::make_unique<std::byte[]>(initial_capacity))
        , size_(0)
        , capacity_(initial_capacity) {}
    
    // Efficient varint encoding (protobuf-style)
    void write_varint(uint64_t value) {
        while (value >= 0x80) {
            ensure_capacity(1);
            data_[write_pos_++] = static_cast<std::byte>(value | 0x80);
            value >>= 7;
        }
        ensure_capacity(1);
        data_[write_pos_++] = static_cast<std::byte>(value);
    }
    
    uint64_t read_varint() {
        uint64_t result = 0;
        int shift = 0;
        
        while (read_pos_ < write_pos_) {
            std::byte b = data_[read_pos_++];
            result |= static_cast<uint64_t>(b & std::byte{0x7F}) << shift;
            
            if ((b & std::byte{0x80}) == std::byte{0}) {
                break;
            }
            shift += 7;
        }
        
        return result;
    }
    
    // Write string with length prefix
    void write_string(std::string_view str) {
        write_varint(str.length());
        ensure_capacity(str.length());
        std::memcpy(data_.get() + write_pos_, str.data(), str.length());
        write_pos_ += str.length();
    }
    
    // Read string view (zero-copy)
    std::string_view read_string() {
        uint64_t length = read_varint();
        if (read_pos_ + length > write_pos_) {
            return {};  // Invalid data
        }
        
        std::string_view result(
            reinterpret_cast<const char*>(data_.get() + read_pos_),
            length
        );
        read_pos_ += length;
        return result;
    }
    
    // Write binary data
    template<typename T>
    requires std::is_trivially_copyable_v<T>
    void write_fixed(const T& value) {
        ensure_capacity(sizeof(T));
        
        if constexpr (std::endian::native == std::endian::little) {
            std::memcpy(data_.get() + write_pos_, &value, sizeof(T));
        } else {
            // Handle endianness conversion if needed
            T converted = value;  // Add byte swapping logic here
            std::memcpy(data_.get() + write_pos_, &converted, sizeof(T));
        }
        
        write_pos_ += sizeof(T);
    }
    
    template<typename T>
    requires std::is_trivially_copyable_v<T>
    T read_fixed() {
        if (read_pos_ + sizeof(T) > write_pos_) {
            return {};  // Invalid read
        }
        
        T result;
        std::memcpy(&result, data_.get() + read_pos_, sizeof(T));
        read_pos_ += sizeof(T);
        
        if constexpr (std::endian::native != std::endian::little) {
            // Handle endianness conversion if needed
        }
        
        return result;
    }
    
    std::span<const std::byte> data() const noexcept {
        return std::span<const std::byte>(data_.get(), write_pos_);
    }
    
    void reset() noexcept {
        read_pos_ = write_pos_ = 0;
    }
    
    size_t size() const noexcept { return write_pos_; }
    bool empty() const noexcept { return write_pos_ == 0; }
};

// High-performance message structure with pointer optimization
struct NetworkMessage {
    enum class Type : uint8_t {
        HEARTBEAT = 1,
        DATA = 2,
        CONTROL = 3,
        ERROR = 4
    };
    
    struct Header {
        uint32_t magic = 0xDEADBEEF;
        Type type;
        uint32_t payload_size;
        uint32_t sequence_number;
        uint32_t checksum;
    } __attribute__((packed));
    
    std::unique_ptr<Header> header_;
    std::span<const std::byte> payload_;
    
    // Factory methods for different message types
    static std::unique_ptr<NetworkMessage> create_heartbeat(uint32_t seq_num) {
        auto msg = std::make_unique<NetworkMessage>();
        msg->header_ = std::make_unique<Header>();
        msg->header_->type = Type::HEARTBEAT;
        msg->header_->sequence_number = seq_num;
        msg->header_->payload_size = 0;
        msg->header_->checksum = calculate_checksum(*msg->header_);
        return msg;
    }
    
    static std::unique_ptr<NetworkMessage> create_data_message(
        uint32_t seq_num, 
        std::span<const std::byte> data) {
        
        auto msg = std::make_unique<NetworkMessage>();
        msg->header_ = std::make_unique<Header>();
        msg->header_->type = Type::DATA;
        msg->header_->sequence_number = seq_num;
        msg->header_->payload_size = data.size();
        msg->payload_ = data;
        msg->header_->checksum = calculate_checksum(*msg->header_, data);
        return msg;
    }
    
    // Serialize to buffer (zero-copy when possible)
    size_t serialize_to(BinaryBuffer& buffer) const {
        size_t start_pos = buffer.size();
        
        // Write header
        buffer.write_fixed(*header_);
        
        // Write payload if present
        if (!payload_.empty()) {
            buffer.ensure_capacity(payload_.size());
            std::memcpy(buffer.data().data() + buffer.size(), 
                       payload_.data(), payload_.size());
        }
        
        return buffer.size() - start_pos;
    }
    
    // Deserialize from span (zero-copy parsing)
    static std::unique_ptr<NetworkMessage> deserialize_from(
        std::span<const std::byte> data) {
        
        if (data.size() < sizeof(Header)) {
            return nullptr;
        }
        
        auto msg = std::make_unique<NetworkMessage>();
        msg->header_ = std::make_unique<Header>();
        
        // Parse header
        std::memcpy(msg->header_.get(), data.data(), sizeof(Header));
        
        // Validate magic number
        if (msg->header_->magic != 0xDEADBEEF) {
            return nullptr;
        }
        
        // Set payload span (zero-copy)
        size_t expected_size = sizeof(Header) + msg->header_->payload_size;
        if (data.size() < expected_size) {
            return nullptr;
        }
        
        if (msg->header_->payload_size > 0) {
            msg->payload_ = data.subspan(sizeof(Header), msg->header_->payload_size);
        }
        
        // Validate checksum
        uint32_t calculated_checksum = calculate_checksum(*msg->header_, msg->payload_);
        if (calculated_checksum != msg->header_->checksum) {
            return nullptr;
        }
        
        return msg;
    }
    
private:
    static uint32_t calculate_checksum(const Header& header) {
        // Simple CRC32-like checksum
        uint32_t crc = 0xFFFFFFFF;
        const uint8_t* data = reinterpret_cast<const uint8_t*>(&header);
        
        for (size_t i = 0; i < sizeof(Header) - sizeof(uint32_t); ++i) {
            crc ^= data[i];
            for (int j = 0; j < 8; ++j) {
                crc = (crc >> 1) ^ (0xEDB88320 & (-(crc & 1)));
            }
        }
        
        return ~crc;
    }
    
    static uint32_t calculate_checksum(const Header& header, 
                                     std::span<const std::byte> payload) {
        uint32_t header_crc = calculate_checksum(header);
        
        if (payload.empty()) {
            return header_crc;
        }
        
        uint32_t payload_crc = 0xFFFFFFFF;
        for (std::byte b : payload) {
            payload_crc ^= static_cast<uint8_t>(b);
            for (int j = 0; j < 8; ++j) {
                payload_crc = (payload_crc >> 1) ^ (0xEDB88320 & (-(payload_crc & 1)));
            }
        }
        
        return header_crc ^ ~payload_crc;
    }
};

// Protocol processor with efficient memory management
class ProtocolProcessor {
private:
    BinaryBuffer send_buffer_;
    std::vector<std::unique_ptr<NetworkMessage>> message_queue_;
    uint32_t next_sequence_ = 1;
    
public:
    ProtocolProcessor() : send_buffer_(64 * 1024) {}  // 64KB initial buffer
    
    // Queue message for sending
    void queue_message(std::unique_ptr<NetworkMessage> message) {
        message_queue_.push_back(std::move(message));
    }
    
    // Serialize all queued messages to buffer
    std::span<const std::byte> prepare_send_buffer() {
        send_buffer_.reset();
        
        for (const auto& message : message_queue_) {
            message->serialize_to(send_buffer_);
        }
        
        message_queue_.clear();
        return send_buffer_.data();
    }
    
    // Process received data (zero-copy parsing)
    std::vector<std::unique_ptr<NetworkMessage>> process_received_data(
        std::span<const std::byte> data) {
        
        std::vector<std::unique_ptr<NetworkMessage>> messages;
        size_t offset = 0;
        
        while (offset + sizeof(NetworkMessage::Header) <= data.size()) {
            auto remaining = data.subspan(offset);
            auto message = NetworkMessage::deserialize_from(remaining);
            
            if (!message) {
                break;  // Invalid or incomplete message
            }
            
            size_t message_size = sizeof(NetworkMessage::Header) + 
                                 message->header_->payload_size;
            offset += message_size;
            
            messages.push_back(std::move(message));
        }
        
        return messages;
    }
    
    // Send heartbeat
    void send_heartbeat() {
        auto heartbeat = NetworkMessage::create_heartbeat(next_sequence_++);
        queue_message(std::move(heartbeat));
    }
    
    // Send data message
    void send_data(std::span<const std::byte> data) {
        auto data_msg = NetworkMessage::create_data_message(next_sequence_++, data);
        queue_message(std::move(data_msg));
    }
};

} // namespace ProtocolBuffers`,
      explanation: state.language === 'en' ? 
        'Protocol buffer implementations with pointer optimization focus on zero-copy parsing, efficient serialization, and memory-mapped operations. This reduces CPU overhead and improves network throughput.' :
        'Las implementaciones de protocol buffer con optimización de punteros se enfocan en análisis zero-copy, serialización eficiente y operaciones mapeadas en memoria. Esto reduce la sobrecarga de CPU y mejora el rendimiento de red.'
    },
    
    'resource-management': {
      title: state.language === 'en' ? 'Network Resource Management' : 'Gestión de Recursos de Red',
      code: `#include <memory>
#include <unordered_map>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <atomic>
#include <functional>

namespace NetworkResources {

// RAII socket wrapper with automatic cleanup
class Socket {
private:
    int fd_ = -1;
    std::string remote_address_;
    uint16_t remote_port_ = 0;
    
public:
    explicit Socket(int fd = -1) : fd_(fd) {}
    
    ~Socket() {
        if (fd_ != -1) {
            close(fd_);
        }
    }
    
    // Non-copyable
    Socket(const Socket&) = delete;
    Socket& operator=(const Socket&) = delete;
    
    // Movable
    Socket(Socket&& other) noexcept 
        : fd_(other.fd_)
        , remote_address_(std::move(other.remote_address_))
        , remote_port_(other.remote_port_) {
        other.fd_ = -1;
    }
    
    Socket& operator=(Socket&& other) noexcept {
        if (this != &other) {
            if (fd_ != -1) {
                close(fd_);
            }
            fd_ = other.fd_;
            remote_address_ = std::move(other.remote_address_);
            remote_port_ = other.remote_port_;
            other.fd_ = -1;
        }
        return *this;
    }
    
    int get_fd() const noexcept { return fd_; }
    bool is_valid() const noexcept { return fd_ != -1; }
    
    void set_remote_info(const std::string& addr, uint16_t port) {
        remote_address_ = addr;
        remote_port_ = port;
    }
    
    const std::string& remote_address() const { return remote_address_; }
    uint16_t remote_port() const { return remote_port_; }
};

// Connection pool with automatic lifecycle management
class ConnectionPool {
public:
    struct ConnectionInfo {
        std::unique_ptr<Socket> socket;
        std::chrono::steady_clock::time_point last_used;
        std::atomic<bool> in_use{false};
        uint64_t connection_id;
    };
    
private:
    std::unordered_map<uint64_t, std::unique_ptr<ConnectionInfo>> connections_;
    std::queue<uint64_t> available_connections_;
    std::mutex pool_mutex_;
    std::condition_variable pool_cv_;
    
    std::atomic<uint64_t> next_connection_id_{1};
    std::atomic<size_t> active_connections_{0};
    
    // Connection cleanup thread
    std::unique_ptr<std::thread> cleanup_thread_;
    std::atomic<bool> cleanup_running_{true};
    
    static constexpr auto CONNECTION_TIMEOUT = std::chrono::minutes(5);
    static constexpr size_t MAX_CONNECTIONS = 1000;
    
    void cleanup_expired_connections() {
        while (cleanup_running_) {
            std::this_thread::sleep_for(std::chrono::seconds(30));
            
            auto now = std::chrono::steady_clock::now();
            std::vector<uint64_t> expired_connections;
            
            {
                std::lock_guard<std::mutex> lock(pool_mutex_);
                
                for (auto& [id, info] : connections_) {
                    if (!info->in_use.load() && 
                        (now - info->last_used) > CONNECTION_TIMEOUT) {
                        expired_connections.push_back(id);
                    }
                }
                
                for (uint64_t id : expired_connections) {
                    connections_.erase(id);
                    active_connections_.fetch_sub(1);
                }
            }
        }
    }
    
public:
    ConnectionPool() {
        cleanup_thread_ = std::make_unique<std::thread>(
            &ConnectionPool::cleanup_expired_connections, this);
    }
    
    ~ConnectionPool() {
        cleanup_running_ = false;
        if (cleanup_thread_ && cleanup_thread_->joinable()) {
            cleanup_thread_->join();
        }
    }
    
    // RAII connection handle
    class ConnectionHandle {
    private:
        ConnectionPool* pool_;
        uint64_t connection_id_;
        ConnectionInfo* info_;
        
    public:
        ConnectionHandle(ConnectionPool* pool, uint64_t id, ConnectionInfo* info)
            : pool_(pool), connection_id_(id), info_(info) {}
        
        ~ConnectionHandle() {
            if (pool_ && info_) {
                pool_->return_connection(connection_id_);
            }
        }
        
        // Non-copyable
        ConnectionHandle(const ConnectionHandle&) = delete;
        ConnectionHandle& operator=(const ConnectionHandle&) = delete;
        
        // Movable
        ConnectionHandle(ConnectionHandle&& other) noexcept
            : pool_(other.pool_)
            , connection_id_(other.connection_id_)
            , info_(other.info_) {
            other.pool_ = nullptr;
            other.info_ = nullptr;
        }
        
        Socket* operator->() noexcept { return info_ ? info_->socket.get() : nullptr; }
        Socket& operator*() noexcept { return *info_->socket; }
        
        bool is_valid() const noexcept {
            return info_ && info_->socket && info_->socket->is_valid();
        }
        
        uint64_t connection_id() const noexcept { return connection_id_; }
    };
    
    // Acquire connection from pool or create new one
    std::unique_ptr<ConnectionHandle> acquire_connection(
        const std::string& address, uint16_t port) {
        
        std::unique_lock<std::mutex> lock(pool_mutex_);
        
        // Try to find available connection to same endpoint
        for (auto& [id, info] : connections_) {
            if (!info->in_use.load() && 
                info->socket->remote_address() == address &&
                info->socket->remote_port() == port) {
                
                info->in_use.store(true);
                info->last_used = std::chrono::steady_clock::now();
                
                return std::make_unique<ConnectionHandle>(this, id, info.get());
            }
        }
        
        // Create new connection if under limit
        if (active_connections_.load() < MAX_CONNECTIONS) {
            // Create socket (simplified - in real implementation would connect)
            int fd = socket(AF_INET, SOCK_STREAM, 0);
            if (fd == -1) {
                return nullptr;
            }
            
            auto socket_ptr = std::make_unique<Socket>(fd);
            socket_ptr->set_remote_info(address, port);
            
            uint64_t id = next_connection_id_.fetch_add(1);
            auto info = std::make_unique<ConnectionInfo>();
            info->socket = std::move(socket_ptr);
            info->connection_id = id;
            info->in_use.store(true);
            info->last_used = std::chrono::steady_clock::now();
            
            ConnectionInfo* info_ptr = info.get();
            connections_[id] = std::move(info);
            active_connections_.fetch_add(1);
            
            return std::make_unique<ConnectionHandle>(this, id, info_ptr);
        }
        
        // Pool exhausted, wait for available connection
        pool_cv_.wait(lock, [this] { 
            return !available_connections_.empty() || !cleanup_running_; 
        });
        
        if (!available_connections_.empty()) {
            uint64_t id = available_connections_.front();
            available_connections_.pop();
            
            auto it = connections_.find(id);
            if (it != connections_.end()) {
                it->second->in_use.store(true);
                it->second->last_used = std::chrono::steady_clock::now();
                return std::make_unique<ConnectionHandle>(this, id, it->second.get());
            }
        }
        
        return nullptr;  // No connections available
    }
    
    void return_connection(uint64_t connection_id) {
        std::lock_guard<std::mutex> lock(pool_mutex_);
        
        auto it = connections_.find(connection_id);
        if (it != connections_.end()) {
            it->second->in_use.store(false);
            it->second->last_used = std::chrono::steady_clock::now();
            available_connections_.push(connection_id);
            pool_cv_.notify_one();
        }
    }
    
    size_t active_connection_count() const noexcept {
        return active_connections_.load();
    }
    
    size_t available_connection_count() const noexcept {
        std::lock_guard<std::mutex> lock(const_cast<std::mutex&>(pool_mutex_));
        return available_connections_.size();
    }
};

// Resource monitor for network operations
class NetworkResourceMonitor {
private:
    struct ResourceMetrics {
        std::atomic<size_t> bytes_sent{0};
        std::atomic<size_t> bytes_received{0};
        std::atomic<size_t> active_connections{0};
        std::atomic<size_t> failed_connections{0};
        std::atomic<size_t> buffer_pool_usage{0};
        
        std::chrono::steady_clock::time_point start_time{
            std::chrono::steady_clock::now()
        };
    };
    
    ResourceMetrics metrics_;
    std::mutex callback_mutex_;
    std::vector<std::function<void(const ResourceMetrics&)>> alert_callbacks_;
    
    // Resource limits
    static constexpr size_t MAX_MEMORY_USAGE = 1024 * 1024 * 1024;  // 1GB
    static constexpr size_t MAX_CONNECTIONS = 10000;
    static constexpr double MAX_FAILURE_RATE = 0.1;  // 10%
    
public:
    void record_bytes_sent(size_t bytes) {
        metrics_.bytes_sent.fetch_add(bytes);
    }
    
    void record_bytes_received(size_t bytes) {
        metrics_.bytes_received.fetch_add(bytes);
    }
    
    void record_connection_established() {
        metrics_.active_connections.fetch_add(1);
    }
    
    void record_connection_closed() {
        metrics_.active_connections.fetch_sub(1);
    }
    
    void record_connection_failed() {
        metrics_.failed_connections.fetch_add(1);
        check_failure_rate();
    }
    
    void record_buffer_usage(size_t usage) {
        metrics_.buffer_pool_usage.store(usage);
        
        if (usage > MAX_MEMORY_USAGE) {
            trigger_alerts("Memory usage exceeded limit");
        }
    }
    
    // Resource usage statistics
    struct Statistics {
        size_t total_bytes_sent;
        size_t total_bytes_received;
        size_t current_connections;
        size_t failed_connections;
        size_t buffer_usage;
        double failure_rate;
        std::chrono::seconds uptime;
    };
    
    Statistics get_statistics() const {
        auto now = std::chrono::steady_clock::now();
        auto uptime = std::chrono::duration_cast<std::chrono::seconds>(
            now - metrics_.start_time);
        
        size_t total_attempts = metrics_.active_connections.load() + 
                               metrics_.failed_connections.load();
        double failure_rate = total_attempts > 0 ? 
            static_cast<double>(metrics_.failed_connections.load()) / total_attempts : 0.0;
        
        return Statistics{
            .total_bytes_sent = metrics_.bytes_sent.load(),
            .total_bytes_received = metrics_.bytes_received.load(),
            .current_connections = metrics_.active_connections.load(),
            .failed_connections = metrics_.failed_connections.load(),
            .buffer_usage = metrics_.buffer_pool_usage.load(),
            .failure_rate = failure_rate,
            .uptime = uptime
        };
    }
    
    // Register callback for resource alerts
    void register_alert_callback(std::function<void(const ResourceMetrics&)> callback) {
        std::lock_guard<std::mutex> lock(callback_mutex_);
        alert_callbacks_.push_back(std::move(callback));
    }
    
private:
    void check_failure_rate() {
        auto stats = get_statistics();
        if (stats.failure_rate > MAX_FAILURE_RATE) {
            trigger_alerts("Connection failure rate exceeded threshold");
        }
    }
    
    void trigger_alerts(const std::string& message) {
        std::lock_guard<std::mutex> lock(callback_mutex_);
        for (const auto& callback : alert_callbacks_) {
            callback(metrics_);
        }
    }
};

// Example usage: HTTP client with resource management
class ManagedHttpClient {
private:
    ConnectionPool connection_pool_;
    NetworkResourceMonitor monitor_;
    
public:
    ManagedHttpClient() {
        // Register resource monitoring alerts
        monitor_.register_alert_callback([](const auto& metrics) {
            std::cout << "Resource alert triggered!" << std::endl;
        });
    }
    
    bool send_http_request(const std::string& host, uint16_t port, 
                          const std::string& request) {
        
        auto connection = connection_pool_.acquire_connection(host, port);
        if (!connection || !connection->is_valid()) {
            monitor_.record_connection_failed();
            return false;
        }
        
        monitor_.record_connection_established();
        
        // Send request (simplified)
        ssize_t bytes_sent = send(connection->get_fd(), request.c_str(), 
                                 request.length(), MSG_NOSIGNAL);
        
        if (bytes_sent > 0) {
            monitor_.record_bytes_sent(bytes_sent);
        }
        
        // Connection automatically returned to pool when handle destructs
        return bytes_sent > 0;
    }
    
    NetworkResourceMonitor::Statistics get_resource_statistics() const {
        return monitor_.get_statistics();
    }
};

} // namespace NetworkResources`,
      explanation: state.language === 'en' ? 
        'Network resource management involves RAII patterns for sockets, connection pooling, resource monitoring, and automatic cleanup. This ensures efficient resource usage and prevents leaks in network applications.' :
        'La gestión de recursos de red involucra patrones RAII para sockets, pooling de conexiones, monitoreo de recursos y limpieza automática. Esto asegura uso eficiente de recursos y previene fugas en aplicaciones de red.'
    }
  };

  return (
    <div className="lesson-container">
      <style>{`
        .lesson-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .lesson-header {
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .lesson-title {
          font-size: 2.5rem;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .lesson-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          font-weight: 300;
        }

        .controls-section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
        }

        .control-label {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .example-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
        }

        .example-button {
          padding: 12px 16px;
          border: 2px solid #e1e8ed;
          background: white;
          color: #2c3e50;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .example-button:hover {
          border-color: #3498db;
          background: #f8f9fa;
        }

        .example-button.active {
          border-color: #3498db;
          background: #3498db;
          color: white;
          box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
        }

        .metrics-display {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .metric-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #3498db;
        }

        .metric-label {
          font-size: 0.8rem;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }

        .metric-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .visualization-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .visualization-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .pattern-selector {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pattern-button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .pattern-button:hover {
          background: #f8f9fa;
          border-color: #3498db;
        }

        .pattern-button.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .canvas-container {
          height: 500px;
          border-radius: 10px;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border: 1px solid #e1e8ed;
        }

        .code-section {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .code-header {
          background: #2c3e50;
          color: white;
          padding: 20px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .code-title {
          font-size: 1.2rem;
          font-weight: 600;
        }

        .copy-button {
          padding: 8px 16px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .copy-button:hover {
          background: #2980b9;
        }

        .code-content {
          background: #f8f9fa;
          padding: 0;
          max-height: 600px;
          overflow-y: auto;
        }

        .code-block {
          margin: 0;
          padding: 25px;
          background: transparent;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #2c3e50;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .explanation {
          padding: 25px;
          background: #e8f4f8;
          border-left: 4px solid #3498db;
          margin-top: 20px;
          border-radius: 0 0 12px 12px;
        }

        .explanation-text {
          color: #2c3e50;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .key-concepts-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .key-concepts-section h3 {
          color: #2c3e50;
          margin-bottom: 25px;
          font-size: 1.4rem;
        }

        .concepts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .concept-card {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border-left: 4px solid #3498db;
        }

        .concept-card h4 {
          color: #2c3e50;
          margin-bottom: 15px;
          font-size: 1.1rem;
        }

        .concept-card ul {
          list-style: none;
          padding: 0;
        }

        .concept-card li {
          padding: 8px 0;
          position: relative;
          padding-left: 25px;
          line-height: 1.5;
          color: #4a4a4a;
        }

        .concept-card li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #27ae60;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .lesson-container {
            padding: 15px;
          }
          
          .lesson-title {
            font-size: 2rem;
          }
          
          .controls-grid {
            grid-template-columns: 1fr;
          }
          
          .example-selector {
            grid-template-columns: 1fr;
          }
          
          .concepts-grid {
            grid-template-columns: 1fr;
          }
          
          .canvas-container {
            height: 400px;
          }
        }
      `}</style>

      <div className="lesson-header">
        <h1 className="lesson-title">
          {state.language === 'en' ? 'Lesson 117: Network Programming with Pointers' : 'Lección 117: Programación de Red con Punteros'}
        </h1>
        <p className="lesson-subtitle">
          {state.language === 'en' 
            ? 'Advanced pointer techniques for high-performance network programming, including buffer management, zero-copy operations, protocol optimization, and resource lifecycle management'
            : 'Técnicas avanzadas de punteros para programación de red de alto rendimiento, incluyendo gestión de buffers, operaciones zero-copy, optimización de protocolos y gestión del ciclo de vida de recursos'
          }
        </p>
      </div>

      <div className="controls-section">
        <div className="controls-grid">
          <div className="control-group">
            <label className="control-label">
              {state.language === 'en' ? 'Select Example' : 'Seleccionar Ejemplo'}
            </label>
            <div className="example-selector">
              {Object.keys(examples).map((key) => (
                <button
                  key={key}
                  className={`example-button ${activeExample === key ? 'active' : ''}`}
                  onClick={() => setActiveExample(key)}
                >
                  {examples[key as keyof typeof examples].title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="metrics-display">
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            {state.language === 'en' ? 'Network Performance Metrics' : 'Métricas de Rendimiento de Red'}
          </h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">
                {state.language === 'en' ? 'Buffer Efficiency' : 'Eficiencia de Buffer'}
              </div>
              <div className="metric-value">{(metrics.bufferEfficiency * 100).toFixed(1)}%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">
                {state.language === 'en' ? 'Zero-Copy Performance' : 'Rendimiento Zero-Copy'}
              </div>
              <div className="metric-value">{(metrics.zeroCopyPerformance * 100).toFixed(1)}%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">
                {state.language === 'en' ? 'Protocol Optimization' : 'Optimización Protocolo'}
              </div>
              <div className="metric-value">{(metrics.protocolOptimization * 100).toFixed(1)}%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">
                {state.language === 'en' ? 'Resource Utilization' : 'Utilización Recursos'}
              </div>
              <div className="metric-value">{(metrics.resourceUtilization * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="visualization-section">
        <div className="visualization-header">
          <h2 className="section-title">
            {state.language === 'en' ? 'Network Architecture Visualization' : 'Visualización de Arquitectura de Red'}
          </h2>
          <div className="pattern-selector">
            {['Buffer Pool', 'Zero-Copy', 'Protocol Buffer', 'Resource Manager'].map((pattern) => (
              <button
                key={pattern}
                className={`pattern-button ${selectedPattern === pattern ? 'active' : ''}`}
                onClick={() => setSelectedPattern(pattern)}
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>

        <div className="canvas-container">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[0, 10, 0]} intensity={0.8} />
            <NetworkVisualization
              metrics={metrics}
              activePattern={selectedPattern}
              onPatternSelect={setSelectedPattern}
            />
          </Canvas>
        </div>
      </div>

      <div className="code-section">
        <div className="code-header">
          <h3 className="code-title">
            {examples[activeExample as keyof typeof examples].title}
          </h3>
          <button 
            className="copy-button"
            onClick={() => navigator.clipboard.writeText(examples[activeExample as keyof typeof examples].code)}
          >
            {state.language === 'en' ? 'Copy Code' : 'Copiar Código'}
          </button>
        </div>
        <div className="code-content">
          <pre className="code-block">
            {examples[activeExample as keyof typeof examples].code}
          </pre>
        </div>
        <div className="explanation">
          <p className="explanation-text">
            {examples[activeExample as keyof typeof examples].explanation}
          </p>
        </div>
      </div>

      <div className="key-concepts-section">
        <h3>{state.language === 'en' ? 'Key Network Programming Concepts' : 'Conceptos Clave de Programación de Red'}</h3>
        <div className="concepts-grid">
          <div className="concept-card">
            <h4>{state.language === 'en' ? 'Buffer Management Strategies' : 'Estrategias de Gestión de Buffers'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Lock-free buffer pools for high concurrency' : 'Pools de buffers sin bloqueos para alta concurrencia'}</li>
              <li>{state.language === 'en' ? 'Cache-line aligned memory allocation' : 'Asignación de memoria alineada a línea de caché'}</li>
              <li>{state.language === 'en' ? 'Reference counting with atomic operations' : 'Conteo de referencias con operaciones atómicas'}</li>
              <li>{state.language === 'en' ? 'RAII buffer handles for automatic cleanup' : 'Handles RAII de buffers para limpieza automática'}</li>
              <li>{state.language === 'en' ? 'Pre-allocated buffer recycling' : 'Reciclaje de buffers preasignados'}</li>
            </ul>
          </div>
          
          <div className="concept-card">
            <h4>{state.language === 'en' ? 'Zero-Copy Networking' : 'Redes Zero-Copy'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Scatter-gather I/O operations' : 'Operaciones de E/S scatter-gather'}</li>
              <li>{state.language === 'en' ? 'Memory-mapped file operations' : 'Operaciones de archivos mapeados en memoria'}</li>
              <li>{state.language === 'en' ? 'Direct kernel operations (sendfile)' : 'Operaciones directas del kernel (sendfile)'}</li>
              <li>{state.language === 'en' ? 'Ring buffer implementations' : 'Implementaciones de buffer circular'}</li>
              <li>{state.language === 'en' ? 'DMA-based data transfers' : 'Transferencias de datos basadas en DMA'}</li>
            </ul>
          </div>
          
          <div className="concept-card">
            <h4>{state.language === 'en' ? 'Protocol Buffer Optimization' : 'Optimización de Protocol Buffer'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'Efficient varint encoding/decoding' : 'Codificación/decodificación eficiente de varint'}</li>
              <li>{state.language === 'en' ? 'Zero-copy protocol parsing' : 'Análisis de protocolo zero-copy'}</li>
              <li>{state.language === 'en' ? 'Binary serialization techniques' : 'Técnicas de serialización binaria'}</li>
              <li>{state.language === 'en' ? 'Endianness handling strategies' : 'Estrategias de manejo de endianness'}</li>
              <li>{state.language === 'en' ? 'Message validation and checksums' : 'Validación de mensajes y checksums'}</li>
            </ul>
          </div>
          
          <div className="concept-card">
            <h4>{state.language === 'en' ? 'Network Resource Management' : 'Gestión de Recursos de Red'}</h4>
            <ul>
              <li>{state.language === 'en' ? 'RAII socket wrappers' : 'Wrappers RAII para sockets'}</li>
              <li>{state.language === 'en' ? 'Connection pooling with lifecycle management' : 'Pooling de conexiones con gestión de ciclo de vida'}</li>
              <li>{state.language === 'en' ? 'Automatic resource cleanup and monitoring' : 'Limpieza automática y monitoreo de recursos'}</li>
              <li>{state.language === 'en' ? 'Timeout-based connection management' : 'Gestión de conexiones basada en timeouts'}</li>
              <li>{state.language === 'en' ? 'Resource usage statistics and alerts' : 'Estadísticas de uso de recursos y alertas'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson117_NetworkProgrammingPointers;