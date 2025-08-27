import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { useApp } from '../context/AppContext';

function MemoryMappedVisualization() {
  const [activeMapping, setActiveMapping] = useState(0);
  
  const mappings = [
    { id: 'file_header', pos: [-4, 2, 0], color: '#00ff88', size: [1, 0.5, 0.2], label: 'File Header' },
    { id: 'data_section', pos: [-2, 2, 0], color: '#00d4ff', size: [3, 0.5, 0.2], label: 'Data Section' },
    { id: 'index_section', pos: [2, 2, 0], color: '#ff6b6b', size: [1.5, 0.5, 0.2], label: 'Index Section' },
    { id: 'mapped_memory', pos: [-1, 0, 0], color: '#ffa500', size: [4, 0.3, 0.2], label: 'Virtual Memory' },
  ];

  return (
    <group>
      {mappings.map((mapping, index) => (
        <group key={mapping.id}>
          <Box
            position={mapping.pos}
            args={mapping.size}
            onClick={() => setActiveMapping(index)}
          >
            <meshStandardMaterial
              color={mapping.color}
              opacity={activeMapping === index ? 1.0 : 0.7}
              transparent
            />
          </Box>
          <Text
            position={[mapping.pos[0], mapping.pos[1] + 0.7, mapping.pos[2]]}
            fontSize={0.3}
            color="white"
            anchorX="center"
          >
            {mapping.label}
          </Text>
        </group>
      ))}
      
      {/* Connection lines */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-1, 1.5, 0, -1, 0.3, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" opacity={0.5} transparent />
      </line>
    </group>
  );
}

export default function Lesson96_MemoryMappedFiles() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'Basic Memory Mapping' : 'Mapeo Básico de Memoria',
      code: `#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>

class MemoryMappedFile {
private:
    void* data_;
    size_t size_;
    int fd_;

public:
    MemoryMappedFile(const char* filename) : data_(nullptr), size_(0), fd_(-1) {
        fd_ = open(filename, O_RDWR);
        if (fd_ == -1) return;
        
        struct stat sb;
        if (fstat(fd_, &sb) == -1) {
            close(fd_);
            return;
        }
        
        size_ = sb.st_size;
        data_ = mmap(nullptr, size_, PROT_READ | PROT_WRITE, 
                    MAP_SHARED, fd_, 0);
        
        if (data_ == MAP_FAILED) {
            data_ = nullptr;
            close(fd_);
        }
    }
    
    ~MemoryMappedFile() {
        if (data_) {
            munmap(data_, size_);
            close(fd_);
        }
    }
    
    void* data() const { return data_; }
    size_t size() const { return size_; }
    bool is_valid() const { return data_ != nullptr; }
};

// Uso
MemoryMappedFile file("large_data.bin");
if (file.is_valid()) {
    auto* buffer = static_cast<char*>(file.data());
    // Acceso directo a los datos del archivo
    buffer[0] = 'M';  // Modifica directamente el archivo
}`
    },
    {
      title: state.language === 'en' ? 'Cross-Platform Implementation' : 'Implementación Multiplataforma',
      code: `#ifdef _WIN32
#include <windows.h>
#include <io.h>
#else
#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#endif

class CrossPlatformMMap {
private:
    void* data_;
    size_t size_;
    
#ifdef _WIN32
    HANDLE file_handle_;
    HANDLE mapping_handle_;
#else
    int fd_;
#endif

public:
    CrossPlatformMMap(const char* filename, bool read_only = true) 
        : data_(nullptr), size_(0) {
        
#ifdef _WIN32
        DWORD access = read_only ? GENERIC_READ : (GENERIC_READ | GENERIC_WRITE);
        file_handle_ = CreateFileA(filename, access, FILE_SHARE_READ, 
                                  nullptr, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, nullptr);
        
        if (file_handle_ == INVALID_HANDLE_VALUE) return;
        
        LARGE_INTEGER file_size;
        if (!GetFileSizeEx(file_handle_, &file_size)) {
            CloseHandle(file_handle_);
            return;
        }
        
        size_ = static_cast<size_t>(file_size.QuadPart);
        
        DWORD protect = read_only ? PAGE_READONLY : PAGE_READWRITE;
        mapping_handle_ = CreateFileMapping(file_handle_, nullptr, protect, 0, 0, nullptr);
        
        if (!mapping_handle_) {
            CloseHandle(file_handle_);
            return;
        }
        
        DWORD view_access = read_only ? FILE_MAP_READ : FILE_MAP_WRITE;
        data_ = MapViewOfFile(mapping_handle_, view_access, 0, 0, 0);
        
#else
        int flags = read_only ? O_RDONLY : O_RDWR;
        fd_ = open(filename, flags);
        if (fd_ == -1) return;
        
        struct stat sb;
        if (fstat(fd_, &sb) == -1) {
            close(fd_);
            return;
        }
        
        size_ = sb.st_size;
        int prot = read_only ? PROT_READ : (PROT_READ | PROT_WRITE);
        data_ = mmap(nullptr, size_, prot, MAP_SHARED, fd_, 0);
        
        if (data_ == MAP_FAILED) {
            data_ = nullptr;
        }
#endif
    }
    
    ~CrossPlatformMMap() {
        if (data_) {
#ifdef _WIN32
            UnmapViewOfFile(data_);
            CloseHandle(mapping_handle_);
            CloseHandle(file_handle_);
#else
            munmap(data_, size_);
            close(fd_);
#endif
        }
    }
    
    void* data() const { return data_; }
    size_t size() const { return size_; }
    bool is_valid() const { return data_ != nullptr; }
    
    void sync() {
        if (data_) {
#ifdef _WIN32
            FlushViewOfFile(data_, 0);
#else
            msync(data_, size_, MS_SYNC);
#endif
        }
    }
};`
    },
    {
      title: state.language === 'en' ? 'Memory-Mapped Data Structures' : 'Estructuras de Datos Mapeadas',
      code: `template<typename T>
class MappedArray {
private:
    CrossPlatformMMap mmap_;
    T* data_;
    size_t count_;

public:
    MappedArray(const char* filename) : mmap_(filename, false) {
        if (mmap_.is_valid()) {
            data_ = static_cast<T*>(mmap_.data());
            count_ = mmap_.size() / sizeof(T);
        } else {
            data_ = nullptr;
            count_ = 0;
        }
    }
    
    T& operator[](size_t index) {
        if (index >= count_) {
            throw std::out_of_range("Index out of range");
        }
        return data_[index];
    }
    
    const T& operator[](size_t index) const {
        if (index >= count_) {
            throw std::out_of_range("Index out of range");
        }
        return data_[index];
    }
    
    size_t size() const { return count_; }
    bool is_valid() const { return data_ != nullptr; }
    
    T* begin() { return data_; }
    T* end() { return data_ + count_; }
    const T* begin() const { return data_; }
    const T* end() const { return data_ + count_; }
    
    void sync() { mmap_.sync(); }
};

// Hash table mapeada en memoria
template<typename Key, typename Value>
class MappedHashTable {
private:
    struct Entry {
        Key key;
        Value value;
        bool occupied;
        uint32_t hash;
    };
    
    CrossPlatformMMap mmap_;
    Entry* buckets_;
    size_t bucket_count_;
    
    size_t hash(const Key& key) const {
        return std::hash<Key>{}(key) % bucket_count_;
    }
    
    size_t probe(size_t index) const {
        return (index + 1) % bucket_count_;
    }

public:
    MappedHashTable(const char* filename, size_t bucket_count = 1024) 
        : mmap_(filename, false), bucket_count_(bucket_count) {
        
        if (mmap_.is_valid() && mmap_.size() >= bucket_count * sizeof(Entry)) {
            buckets_ = static_cast<Entry*>(mmap_.data());
        } else {
            buckets_ = nullptr;
        }
    }
    
    bool insert(const Key& key, const Value& value) {
        if (!buckets_) return false;
        
        size_t index = hash(key);
        uint32_t key_hash = std::hash<Key>{}(key);
        
        while (buckets_[index].occupied) {
            if (buckets_[index].hash == key_hash && 
                buckets_[index].key == key) {
                buckets_[index].value = value;
                return true;
            }
            index = probe(index);
        }
        
        buckets_[index] = {key, value, true, key_hash};
        return true;
    }
    
    bool find(const Key& key, Value& value) const {
        if (!buckets_) return false;
        
        size_t index = hash(key);
        uint32_t key_hash = std::hash<Key>{}(key);
        
        while (buckets_[index].occupied) {
            if (buckets_[index].hash == key_hash && 
                buckets_[index].key == key) {
                value = buckets_[index].value;
                return true;
            }
            index = probe(index);
        }
        
        return false;
    }
    
    void sync() { mmap_.sync(); }
};`
    },
    {
      title: state.language === 'en' ? 'Large File Optimization' : 'Optimización para Archivos Grandes',
      code: `class LargeFileMMapper {
private:
    CrossPlatformMMap mmap_;
    size_t window_size_;
    size_t current_offset_;
    
public:
    LargeFileMMapper(const char* filename, size_t window_size = 64 * 1024 * 1024) 
        : mmap_(filename), window_size_(window_size), current_offset_(0) {}
    
    // Acceso por ventanas deslizantes
    void* get_window(size_t offset, size_t& available_size) {
        if (!mmap_.is_valid()) {
            available_size = 0;
            return nullptr;
        }
        
        if (offset >= mmap_.size()) {
            available_size = 0;
            return nullptr;
        }
        
        current_offset_ = offset;
        available_size = std::min(window_size_, mmap_.size() - offset);
        
        return static_cast<char*>(mmap_.data()) + offset;
    }
    
    // Procesamiento por chunks
    template<typename Processor>
    void process_chunks(size_t chunk_size, Processor processor) {
        if (!mmap_.is_valid()) return;
        
        size_t offset = 0;
        char* data = static_cast<char*>(mmap_.data());
        
        while (offset < mmap_.size()) {
            size_t current_chunk = std::min(chunk_size, mmap_.size() - offset);
            processor(data + offset, current_chunk, offset);
            offset += current_chunk;
        }
    }
    
    // Búsqueda optimizada en archivos grandes
    size_t find_pattern(const void* pattern, size_t pattern_size) {
        if (!mmap_.is_valid() || pattern_size == 0) return SIZE_MAX;
        
        const char* haystack = static_cast<const char*>(mmap_.data());
        const char* needle = static_cast<const char*>(pattern);
        
        // Boyer-Moore simplificado para archivos mapeados
        for (size_t i = 0; i <= mmap_.size() - pattern_size; ++i) {
            if (memcmp(haystack + i, needle, pattern_size) == 0) {
                return i;
            }
        }
        
        return SIZE_MAX;
    }
    
    // Estadísticas de acceso
    struct AccessStats {
        size_t total_reads = 0;
        size_t total_writes = 0;
        size_t page_faults = 0;
    };
    
    AccessStats get_stats() const {
        // Implementación dependiente del SO para obtener estadísticas
        AccessStats stats;
        // En un sistema real, usaríamos APIs del OS para obtener esta información
        return stats;
    }
};

// Ejemplo de uso con streaming de datos
class StreamingProcessor {
private:
    LargeFileMMapper mmap_;
    
public:
    StreamingProcessor(const char* filename) : mmap_(filename) {}
    
    void process_log_file() {
        const size_t chunk_size = 1024 * 1024;  // 1MB chunks
        
        mmap_.process_chunks(chunk_size, [](const void* data, size_t size, size_t offset) {
            const char* text = static_cast<const char*>(data);
            
            // Procesar línea por línea
            size_t line_start = 0;
            for (size_t i = 0; i < size; ++i) {
                if (text[i] == '\\n') {
                    // Procesar línea [line_start, i)
                    std::string_view line(text + line_start, i - line_start);
                    process_log_line(line, offset + line_start);
                    line_start = i + 1;
                }
            }
        });
    }
    
private:
    void process_log_line(std::string_view line, size_t file_offset) {
        // Procesar línea individual del log
        if (line.find("ERROR") != std::string_view::npos) {
            printf("Error found at offset %zu: %.*s\\n", 
                   file_offset, static_cast<int>(line.length()), line.data());
        }
    }
};`
    },
    {
      title: state.language === 'en' ? 'Performance Optimization' : 'Optimización de Rendimiento',
      code: `class HighPerformanceMMapper {
private:
    CrossPlatformMMap mmap_;
    size_t page_size_;
    
public:
    HighPerformanceMMapper(const char* filename) : mmap_(filename) {
#ifdef _WIN32
        SYSTEM_INFO si;
        GetSystemInfo(&si);
        page_size_ = si.dwPageSize;
#else
        page_size_ = getpagesize();
#endif
    }
    
    // Pre-carga páginas críticas
    void prefault_pages(size_t offset, size_t size) {
        if (!mmap_.is_valid()) return;
        
        char* data = static_cast<char*>(mmap_.data()) + offset;
        size = std::min(size, mmap_.size() - offset);
        
        // Toca cada página para forzar su carga
        for (size_t i = 0; i < size; i += page_size_) {
            volatile char dummy = data[i];
            (void)dummy;  // Evita warning de variable no usada
        }
    }
    
    // Advise del kernel sobre patrones de acceso
    void set_access_pattern(size_t offset, size_t size, int advice) {
        if (!mmap_.is_valid()) return;
        
        char* addr = static_cast<char*>(mmap_.data()) + offset;
        size = std::min(size, mmap_.size() - offset);
        
#ifdef _WIN32
        // En Windows, usar PrefetchVirtualMemory si está disponible
        WIN32_MEMORY_RANGE_ENTRY entry = {addr, size};
        PrefetchVirtualMemory(GetCurrentProcess(), 1, &entry, 0);
#else
        madvise(addr, size, advice);
#endif
    }
    
    // Configuración para acceso secuencial
    void optimize_for_sequential_access(size_t offset = 0, size_t size = SIZE_MAX) {
        if (size == SIZE_MAX) {
            size = mmap_.size() - offset;
        }
        
#ifndef _WIN32
        set_access_pattern(offset, size, MADV_SEQUENTIAL);
#endif
        prefault_pages(offset, std::min(size, 64 * page_size_));  // Pre-carga 64 páginas
    }
    
    // Configuración para acceso aleatorio
    void optimize_for_random_access(size_t offset = 0, size_t size = SIZE_MAX) {
        if (size == SIZE_MAX) {
            size = mmap_.size() - offset;
        }
        
#ifndef _WIN32
        set_access_pattern(offset, size, MADV_RANDOM);
#endif
    }
    
    // Libera páginas no utilizadas
    void release_unused_pages(size_t offset, size_t size) {
#ifndef _WIN32
        set_access_pattern(offset, size, MADV_DONTNEED);
#endif
    }
    
    // Lock páginas en memoria física
    bool lock_pages(size_t offset, size_t size) {
        if (!mmap_.is_valid()) return false;
        
        char* addr = static_cast<char*>(mmap_.data()) + offset;
        size = std::min(size, mmap_.size() - offset);
        
#ifdef _WIN32
        return VirtualLock(addr, size) != 0;
#else
        return mlock(addr, size) == 0;
#endif
    }
    
    // Unlock páginas
    void unlock_pages(size_t offset, size_t size) {
        if (!mmap_.is_valid()) return;
        
        char* addr = static_cast<char*>(mmap_.data()) + offset;
        size = std::min(size, mmap_.size() - offset);
        
#ifdef _WIN32
        VirtualUnlock(addr, size);
#else
        munlock(addr, size);
#endif
    }
    
    // Medición de rendimiento
    struct PerformanceMetrics {
        double sequential_read_mbps;
        double random_read_mbps;
        double write_mbps;
        size_t page_faults;
    };
    
    PerformanceMetrics benchmark() {
        PerformanceMetrics metrics = {};
        if (!mmap_.is_valid()) return metrics;
        
        const size_t test_size = std::min(mmap_.size(), 100 * 1024 * 1024);  // 100MB max
        char* data = static_cast<char*>(mmap_.data());
        
        // Test lectura secuencial
        auto start = std::chrono::high_resolution_clock::now();
        volatile size_t sum = 0;
        for (size_t i = 0; i < test_size; i += 4096) {
            sum += data[i];
        }
        auto end = std::chrono::high_resolution_clock::now();
        
        double duration = std::chrono::duration<double>(end - start).count();
        metrics.sequential_read_mbps = (test_size / (1024.0 * 1024.0)) / duration;
        
        // Test lectura aleatoria
        start = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < 10000; ++i) {
            size_t random_offset = (rand() % (test_size / 4096)) * 4096;
            sum += data[random_offset];
        }
        end = std::chrono::high_resolution_clock::now();
        
        duration = std::chrono::duration<double>(end - start).count();
        metrics.random_read_mbps = (10000 * 4096 / (1024.0 * 1024.0)) / duration;
        
        return metrics;
    }
};`
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 96: Memory-Mapped Files' : 'Lección 96: Archivos Mapeados en Memoria'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <MemoryMappedVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Memory-Mapped File Techniques' : 'Técnicas de Archivos Mapeados'}</h3>
          
          <div className="example-tabs">
            {examples.map((example, index) => (
              <button
                key={index}
                className={`tab ${currentExample === index ? 'active' : ''}`}
                onClick={() => setCurrentExample(index)}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className="example-content">
            <pre className="code-block">
              <code>{examples[currentExample].code}</code>
            </pre>
          </div>
        </div>

        <div className="theory-section">
          <h3>{state.language === 'en' ? 'Key Concepts' : 'Conceptos Clave'}</h3>
          <div className="concept-grid">
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Virtual Memory Mapping' : 'Mapeo de Memoria Virtual'}</h4>
              <p>
                {state.language === 'en' 
                  ? 'Map file contents directly into process address space for efficient access without explicit I/O operations.'
                  : 'Mapea contenido de archivos directamente en el espacio de direcciones del proceso para acceso eficiente sin operaciones I/O explícitas.'}
              </p>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Cross-Platform Support' : 'Soporte Multiplataforma'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Unified interface over platform-specific APIs (mmap/MapViewOfFile) for portable memory-mapped file access.'
                  : 'Interfaz unificada sobre APIs específicas de plataforma (mmap/MapViewOfFile) para acceso portable a archivos mapeados.'}
              </p>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Large File Handling' : 'Manejo de Archivos Grandes'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Efficient processing of large files through windowing, chunking, and streaming techniques.'
                  : 'Procesamiento eficiente de archivos grandes mediante técnicas de ventanas, fragmentación y streaming.'}
              </p>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Performance Optimization' : 'Optimización de Rendimiento'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Advanced techniques including page prefaulting, access pattern hints, and memory locking for optimal performance.'
                  : 'Técnicas avanzadas incluyendo prefaulting de páginas, hints de patrones de acceso y bloqueo de memoria para rendimiento óptimo.'}
              </p>
            </div>
          </div>
        </div>

        <div className="best-practices">
          <h3>{state.language === 'en' ? 'Best Practices' : 'Mejores Prácticas'}</h3>
          <ul>
            <li>
              {state.language === 'en'
                ? 'Always check mapping validity before accessing data to avoid segmentation faults'
                : 'Siempre verifica la validez del mapeo antes de acceder a datos para evitar fallos de segmentación'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Use appropriate access patterns (sequential vs random) to optimize kernel behavior'
                : 'Usa patrones de acceso apropiados (secuencial vs aleatorio) para optimizar el comportamiento del kernel'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement proper synchronization for concurrent access to mapped files'
                : 'Implementa sincronización apropiada para acceso concurrente a archivos mapeados'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Consider page alignment and size for optimal memory management performance'
                : 'Considera alineación y tamaño de páginas para rendimiento óptimo de gestión de memoria'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Handle platform differences gracefully with unified abstractions'
                : 'Maneja diferencias de plataforma elegantemente con abstracciones unificadas'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}