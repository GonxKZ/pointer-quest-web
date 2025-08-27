import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';
import { useApp } from '../context/AppContext';

function LockFreeVisualization() {
  const [operations, setOperations] = useState({ push: 0, pop: 0, enqueue: 0, dequeue: 0 });
  const [activeStructure, setActiveStructure] = useState('stack');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOperations(prev => ({
        push: prev.push + Math.floor(Math.random() * 3),
        pop: prev.pop + Math.floor(Math.random() * 2),
        enqueue: prev.enqueue + Math.floor(Math.random() * 3),
        dequeue: prev.dequeue + Math.floor(Math.random() * 2)
      }));
    }, 600);
    
    return () => clearInterval(interval);
  }, []);

  const structures = [
    { name: 'stack', pos: [-3, 1.5, 0], color: '#00ff88', label: 'Lock-Free Stack' },
    { name: 'queue', pos: [-1, 1.5, 0], color: '#00d4ff', label: 'Lock-Free Queue' },
    { name: 'hash', pos: [1, 1.5, 0], color: '#ff6b6b', label: 'Lock-Free Hash' },
    { name: 'tree', pos: [3, 1.5, 0], color: '#ffa500', label: 'Lock-Free Tree' }
  ];

  return (
    <group>
      {structures.map((struct) => (
        <group key={struct.name}>
          <Box
            position={struct.pos}
            args={[1.5, 0.8, 0.4]}
            onClick={() => setActiveStructure(struct.name)}
          >
            <meshStandardMaterial
              color={struct.color}
              opacity={activeStructure === struct.name ? 1.0 : 0.7}
              transparent
            />
          </Box>
          <Text
            position={[struct.pos[0], struct.pos[1] + 1, struct.pos[2]]}
            fontSize={0.25}
            color="white"
            anchorX="center"
          >
            {struct.label}
          </Text>
        </group>
      ))}
      
      <Sphere position={[0, -0.5, 0]} args={[0.3]}>
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </Sphere>
      
      <Text
        position={[-2, -1.5, 0]}
        fontSize={0.3}
        color="#00ff88"
        anchorX="center"
      >
        {`Push: ${operations.push}`}
      </Text>
      
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="#00d4ff"
        anchorX="center"
      >
        {`Pop: ${operations.pop}`}
      </Text>
      
      <Text
        position={[2, -1.5, 0]}
        fontSize={0.3}
        color="#ff6b6b"
        anchorX="center"
      >
        {`Enqueue: ${operations.enqueue}`}
      </Text>
      
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="#ffa500"
        anchorX="center"
      >
        {`Dequeue: ${operations.dequeue}`}
      </Text>
    </group>
  );
}

export default function Lesson99_LockFreeDataStructures() {
  const { state } = useApp();
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: state.language === 'en' ? 'Lock-Free Stack Implementation' : 'Implementación de Stack Lock-Free',
      code: `#include <atomic>
#include <memory>

template<typename T>
class LockFreeStack {
private:
    struct Node {
        T data;
        std::shared_ptr<Node> next;
        
        Node(const T& item) : data(item) {}
    };
    
    std::atomic<std::shared_ptr<Node>> head;

public:
    LockFreeStack() = default;
    
    void push(const T& item) {
        auto new_node = std::make_shared<Node>(item);
        auto current_head = head.load();
        
        do {
            new_node->next = current_head;
        } while (!head.compare_exchange_weak(current_head, new_node));
    }
    
    bool pop(T& result) {
        auto current_head = head.load();
        
        do {
            if (!current_head) {
                return false;  // Stack vacío
            }
            result = current_head->data;
            
        } while (!head.compare_exchange_weak(current_head, 
                                           current_head->next));
        
        return true;
    }
    
    bool empty() const {
        return head.load() == nullptr;
    }
    
    size_t size() const {
        size_t count = 0;
        auto current = head.load();
        while (current) {
            ++count;
            current = current->next;
        }
        return count;
    }
};

// Versión optimizada con hazard pointers
template<typename T>
class OptimizedLockFreeStack {
private:
    struct Node {
        T data;
        std::atomic<Node*> next;
        
        Node(const T& item) : data(item), next(nullptr) {}
    };
    
    std::atomic<Node*> head_;
    
    // Thread-local hazard pointer storage
    static thread_local Node* hazard_pointer_;

public:
    OptimizedLockFreeStack() : head_(nullptr) {}
    
    ~OptimizedLockFreeStack() {
        while (auto node = head_.load()) {
            head_.store(node->next);
            delete node;
        }
    }
    
    void push(const T& item) {
        auto new_node = new Node(item);
        auto current_head = head_.load(std::memory_order_relaxed);
        
        do {
            new_node->next.store(current_head, std::memory_order_relaxed);
        } while (!head_.compare_exchange_weak(
            current_head, new_node,
            std::memory_order_release,
            std::memory_order_relaxed));
    }
    
    bool pop(T& result) {
        auto current_head = head_.load(std::memory_order_acquire);
        
        do {
            if (!current_head) {
                hazard_pointer_ = nullptr;
                return false;
            }
            
            // Proteger con hazard pointer
            hazard_pointer_ = current_head;
            
            // Verificar que no haya cambiado
            if (current_head != head_.load(std::memory_order_acquire)) {
                continue;
            }
            
            result = current_head->data;
            auto next = current_head->next.load(std::memory_order_relaxed);
            
        } while (!head_.compare_exchange_weak(
            current_head, next,
            std::memory_order_release,
            std::memory_order_relaxed));
        
        // Retirar hazard pointer y marcar para eliminación
        hazard_pointer_ = nullptr;
        retire_node(current_head);
        
        return true;
    }

private:
    void retire_node(Node* node) {
        // En una implementación completa, aquí iría la lógica
        // para diferir la eliminación hasta que sea seguro
        delete node;  // Simplificado para el ejemplo
    }
};

template<typename T>
thread_local typename OptimizedLockFreeStack<T>::Node* 
    OptimizedLockFreeStack<T>::hazard_pointer_ = nullptr;`
    },
    {
      title: state.language === 'en' ? 'Lock-Free Queue (Michael & Scott)' : 'Cola Lock-Free (Michael & Scott)',
      code: `#include <atomic>
#include <memory>

template<typename T>
class LockFreeQueue {
private:
    struct Node {
        std::atomic<T*> data;
        std::atomic<Node*> next;
        
        Node() : data(nullptr), next(nullptr) {}
    };
    
    std::atomic<Node*> head_;
    std::atomic<Node*> tail_;

public:
    LockFreeQueue() {
        auto dummy = new Node;
        head_.store(dummy);
        tail_.store(dummy);
    }
    
    ~LockFreeQueue() {
        while (Node* old_head = head_.load()) {
            head_.store(old_head->next);
            delete old_head;
        }
    }
    
    void enqueue(const T& item) {
        auto new_node = new Node;
        auto data = new T(item);
        new_node->data.store(data);
        
        while (true) {
            auto tail = tail_.load(std::memory_order_acquire);
            auto next = tail->next.load(std::memory_order_acquire);
            
            // Verificar consistencia
            if (tail == tail_.load(std::memory_order_acquire)) {
                if (next == nullptr) {
                    // Tail realmente apunta al último nodo
                    if (tail->next.compare_exchange_weak(
                        next, new_node,
                        std::memory_order_release,
                        std::memory_order_relaxed)) {
                        
                        // Intentar avanzar tail
                        tail_.compare_exchange_weak(tail, new_node,
                                                   std::memory_order_release,
                                                   std::memory_order_relaxed);
                        break;
                    }
                } else {
                    // Tail está atrasado, ayudar a avanzar
                    tail_.compare_exchange_weak(tail, next,
                                              std::memory_order_release,
                                              std::memory_order_relaxed);
                }
            }
        }
    }
    
    bool dequeue(T& result) {
        while (true) {
            auto head = head_.load(std::memory_order_acquire);
            auto tail = tail_.load(std::memory_order_acquire);
            auto next = head->next.load(std::memory_order_acquire);
            
            // Verificar consistencia
            if (head == head_.load(std::memory_order_acquire)) {
                if (head == tail) {
                    if (next == nullptr) {
                        // Cola vacía
                        return false;
                    }
                    
                    // Tail atrasado, ayudar a avanzar
                    tail_.compare_exchange_weak(tail, next,
                                              std::memory_order_release,
                                              std::memory_order_relaxed);
                } else {
                    // Leer datos antes de CAS
                    if (next == nullptr) {
                        continue;  // Otro thread interfirió
                    }
                    
                    auto data = next->data.load(std::memory_order_acquire);
                    if (data == nullptr) {
                        continue;  // Datos no listos aún
                    }
                    
                    // Intentar avanzar head
                    if (head_.compare_exchange_weak(
                        head, next,
                        std::memory_order_release,
                        std::memory_order_relaxed)) {
                        
                        result = *data;
                        delete data;
                        delete head;  // Eliminar nodo dummy anterior
                        
                        return true;
                    }
                }
            }
        }
    }
    
    bool empty() const {
        auto head = head_.load(std::memory_order_acquire);
        auto tail = tail_.load(std::memory_order_acquire);
        return (head == tail) && (head->next.load(std::memory_order_acquire) == nullptr);
    }
    
    size_t size() const {
        size_t count = 0;
        auto current = head_.load(std::memory_order_acquire);
        auto tail = tail_.load(std::memory_order_acquire);
        
        while (current != tail && current != nullptr) {
            current = current->next.load(std::memory_order_acquire);
            ++count;
        }
        
        return count;
    }
};

// Versión SPSC (Single Producer Single Consumer) optimizada
template<typename T>
class SPSCQueue {
private:
    static constexpr size_t CACHE_LINE_SIZE = 64;
    
    struct alignas(CACHE_LINE_SIZE) Node {
        std::atomic<T*> data;
        std::atomic<Node*> next;
        
        Node() : data(nullptr), next(nullptr) {}
    };
    
    alignas(CACHE_LINE_SIZE) std::atomic<Node*> head_;
    alignas(CACHE_LINE_SIZE) std::atomic<Node*> tail_;
    
    Node* head_cache_;  // Cache local del consumidor
    Node* tail_cache_;  // Cache local del productor

public:
    SPSCQueue() {
        auto dummy = new Node;
        head_.store(dummy);
        tail_.store(dummy);
        head_cache_ = dummy;
        tail_cache_ = dummy;
    }
    
    ~SPSCQueue() {
        while (auto node = head_.load()) {
            head_.store(node->next.load());
            delete node;
        }
    }
    
    // Solo para el productor
    void enqueue(const T& item) {
        auto new_node = new Node;
        auto data = new T(item);
        new_node->data.store(data, std::memory_order_relaxed);
        
        tail_cache_->next.store(new_node, std::memory_order_release);
        tail_.store(new_node, std::memory_order_release);
        tail_cache_ = new_node;
    }
    
    // Solo para el consumidor
    bool dequeue(T& result) {
        if (head_cache_->next.load(std::memory_order_acquire) == nullptr) {
            head_cache_ = head_.load(std::memory_order_acquire);
            if (head_cache_->next.load(std::memory_order_acquire) == nullptr) {
                return false;  // Cola vacía
            }
        }
        
        auto next = head_cache_->next.load(std::memory_order_relaxed);
        auto data = next->data.load(std::memory_order_relaxed);
        
        result = *data;
        delete data;
        
        head_.store(next, std::memory_order_release);
        delete head_cache_;
        head_cache_ = next;
        
        return true;
    }
    
    bool empty() const {
        return head_.load()->next.load() == nullptr;
    }
};`
    },
    {
      title: state.language === 'en' ? 'Lock-Free Hash Table' : 'Tabla Hash Lock-Free',
      code: `#include <atomic>
#include <memory>
#include <vector>
#include <functional>

template<typename Key, typename Value>
class LockFreeHashMap {
private:
    static constexpr size_t INITIAL_SIZE = 16;
    static constexpr double LOAD_FACTOR_THRESHOLD = 0.75;
    
    struct Entry {
        Key key;
        Value value;
        std::atomic<Entry*> next;
        std::atomic<bool> deleted;
        
        Entry(const Key& k, const Value& v) 
            : key(k), value(v), next(nullptr), deleted(false) {}
    };
    
    struct Bucket {
        std::atomic<Entry*> head;
        
        Bucket() : head(nullptr) {}
    };
    
    std::atomic<Bucket*> buckets_;
    std::atomic<size_t> size_;
    std::atomic<size_t> count_;
    std::atomic<bool> resizing_;

    size_t hash(const Key& key, size_t table_size) const {
        return std::hash<Key>{}(key) % table_size;
    }

public:
    LockFreeHashMap() : size_(INITIAL_SIZE), count_(0), resizing_(false) {
        buckets_.store(new Bucket[INITIAL_SIZE]);
    }
    
    ~LockFreeHashMap() {
        auto buckets = buckets_.load();
        for (size_t i = 0; i < size_.load(); ++i) {
            auto current = buckets[i].head.load();
            while (current) {
                auto next = current->next.load();
                delete current;
                current = next;
            }
        }
        delete[] buckets;
    }
    
    bool insert(const Key& key, const Value& value) {
        while (true) {
            if (resizing_.load(std::memory_order_acquire)) {
                std::this_thread::yield();
                continue;
            }
            
            auto buckets = buckets_.load(std::memory_order_acquire);
            auto table_size = size_.load(std::memory_order_acquire);
            size_t bucket_idx = hash(key, table_size);
            
            // Buscar si la clave existe
            auto current = buckets[bucket_idx].head.load(std::memory_order_acquire);
            while (current) {
                if (!current->deleted.load(std::memory_order_acquire) && 
                    current->key == key) {
                    // Actualizar valor existente
                    current->value = value;
                    return false;  // No es una nueva inserción
                }
                current = current->next.load(std::memory_order_acquire);
            }
            
            // Insertar nueva entrada
            auto new_entry = new Entry(key, value);
            auto head = buckets[bucket_idx].head.load(std::memory_order_acquire);
            
            do {
                new_entry->next.store(head, std::memory_order_relaxed);
            } while (!buckets[bucket_idx].head.compare_exchange_weak(
                head, new_entry,
                std::memory_order_release,
                std::memory_order_acquire));
            
            count_.fetch_add(1, std::memory_order_relaxed);
            
            // Verificar si necesitamos redimensionar
            if (static_cast<double>(count_.load()) / table_size > LOAD_FACTOR_THRESHOLD) {
                try_resize();
            }
            
            return true;
        }
    }
    
    bool find(const Key& key, Value& value) const {
        auto buckets = buckets_.load(std::memory_order_acquire);
        auto table_size = size_.load(std::memory_order_acquire);
        size_t bucket_idx = hash(key, table_size);
        
        auto current = buckets[bucket_idx].head.load(std::memory_order_acquire);
        while (current) {
            if (!current->deleted.load(std::memory_order_acquire) && 
                current->key == key) {
                value = current->value;
                return true;
            }
            current = current->next.load(std::memory_order_acquire);
        }
        
        return false;
    }
    
    bool erase(const Key& key) {
        auto buckets = buckets_.load(std::memory_order_acquire);
        auto table_size = size_.load(std::memory_order_acquire);
        size_t bucket_idx = hash(key, table_size);
        
        auto current = buckets[bucket_idx].head.load(std::memory_order_acquire);
        while (current) {
            if (!current->deleted.load(std::memory_order_acquire) && 
                current->key == key) {
                // Marcado lógico para eliminación
                current->deleted.store(true, std::memory_order_release);
                count_.fetch_sub(1, std::memory_order_relaxed);
                return true;
            }
            current = current->next.load(std::memory_order_acquire);
        }
        
        return false;
    }
    
    size_t size() const {
        return count_.load(std::memory_order_acquire);
    }
    
    bool empty() const {
        return count_.load(std::memory_order_acquire) == 0;
    }
    
    double load_factor() const {
        return static_cast<double>(count_.load()) / size_.load();
    }

private:
    void try_resize() {
        // Intentar tomar lock de redimensionamiento
        bool expected = false;
        if (!resizing_.compare_exchange_strong(expected, true,
                                             std::memory_order_acquire,
                                             std::memory_order_relaxed)) {
            return;  // Otro thread ya está redimensionando
        }
        
        auto old_buckets = buckets_.load(std::memory_order_acquire);
        auto old_size = size_.load(std::memory_order_acquire);
        auto new_size = old_size * 2;
        auto new_buckets = new Bucket[new_size];
        
        // Migrar todas las entradas
        for (size_t i = 0; i < old_size; ++i) {
            auto current = old_buckets[i].head.load(std::memory_order_acquire);
            while (current) {
                auto next = current->next.load(std::memory_order_acquire);
                
                if (!current->deleted.load(std::memory_order_acquire)) {
                    // Rehacer hash para nueva tabla
                    size_t new_bucket_idx = hash(current->key, new_size);
                    auto new_head = new_buckets[new_bucket_idx].head.load(std::memory_order_relaxed);
                    
                    do {
                        current->next.store(new_head, std::memory_order_relaxed);
                    } while (!new_buckets[new_bucket_idx].head.compare_exchange_weak(
                        new_head, current,
                        std::memory_order_release,
                        std::memory_order_relaxed));
                } else {
                    delete current;  // Limpiar entradas marcadas como eliminadas
                }
                
                current = next;
            }
        }
        
        // Actualizar tabla atómicamente
        size_.store(new_size, std::memory_order_release);
        buckets_.store(new_buckets, std::memory_order_release);
        
        // Liberar tabla anterior (después de grace period)
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
        delete[] old_buckets;
        
        resizing_.store(false, std::memory_order_release);
    }
};

// Especialización para tipos simples con optimizaciones adicionales
template<typename T>
class LockFreeSet {
private:
    static constexpr size_t MAX_LEVEL = 16;
    
    struct Node {
        T value;
        std::atomic<Node*> next[MAX_LEVEL];
        int level;
        std::atomic<bool> deleted;
        
        Node(const T& val, int lv) : value(val), level(lv), deleted(false) {
            for (int i = 0; i < MAX_LEVEL; ++i) {
                next[i].store(nullptr);
            }
        }
    };
    
    Node* head_;
    std::atomic<size_t> size_;

    int random_level() {
        int level = 1;
        while ((rand() & 1) && level < MAX_LEVEL) {
            level++;
        }
        return level;
    }

public:
    LockFreeSet() : size_(0) {
        head_ = new Node(T{}, MAX_LEVEL);
    }
    
    ~LockFreeSet() {
        auto current = head_;
        while (current) {
            auto next = current->next[0].load();
            delete current;
            current = next;
        }
    }
    
    bool insert(const T& value) {
        Node* preds[MAX_LEVEL];
        Node* succs[MAX_LEVEL];
        
        while (true) {
            if (find_position(value, preds, succs)) {
                return false;  // Ya existe
            }
            
            int level = random_level();
            auto new_node = new Node(value, level);
            
            for (int i = 0; i < level; ++i) {
                new_node->next[i].store(succs[i]);
            }
            
            // Intentar enlazar en el nivel 0 primero
            if (preds[0]->next[0].compare_exchange_strong(succs[0], new_node)) {
                // Enlazar niveles superiores
                for (int i = 1; i < level; ++i) {
                    while (!preds[i]->next[i].compare_exchange_weak(succs[i], new_node)) {
                        find_position(value, preds, succs);
                    }
                }
                size_.fetch_add(1);
                return true;
            } else {
                delete new_node;
            }
        }
    }
    
    bool contains(const T& value) {
        Node* preds[MAX_LEVEL];
        Node* succs[MAX_LEVEL];
        return find_position(value, preds, succs);
    }
    
    bool remove(const T& value) {
        Node* preds[MAX_LEVEL];
        Node* succs[MAX_LEVEL];
        
        if (!find_position(value, preds, succs)) {
            return false;
        }
        
        auto node_to_delete = succs[0];
        node_to_delete->deleted.store(true);
        
        // Desenlazar desde niveles superiores hacia abajo
        for (int i = node_to_delete->level - 1; i >= 1; --i) {
            auto succ = node_to_delete->next[i].load();
            while (!preds[i]->next[i].compare_exchange_weak(node_to_delete, succ)) {
                find_position(value, preds, succs);
            }
        }
        
        // Nivel 0 al final
        auto succ = node_to_delete->next[0].load();
        if (preds[0]->next[0].compare_exchange_strong(node_to_delete, succ)) {
            size_.fetch_sub(1);
            delete node_to_delete;
        }
        
        return true;
    }
    
    size_t size() const { return size_.load(); }

private:
    bool find_position(const T& value, Node* preds[], Node* succs[]) {
        retry:
        Node* pred = head_;
        
        for (int level = MAX_LEVEL - 1; level >= 0; --level) {
            Node* curr = pred->next[level].load();
            
            while (curr != nullptr) {
                if (curr->deleted.load()) {
                    goto retry;  // Nodo eliminado, reintentar
                }
                
                if (curr->value >= value) {
                    break;
                }
                
                pred = curr;
                curr = pred->next[level].load();
            }
            
            preds[level] = pred;
            succs[level] = curr;
        }
        
        return (succs[0] != nullptr && succs[0]->value == value && 
                !succs[0]->deleted.load());
    }
};`
    },
    {
      title: state.language === 'en' ? 'Lock-Free Binary Search Tree' : 'Árbol de Búsqueda Binaria Lock-Free',
      code: `#include <atomic>
#include <memory>

template<typename T>
class LockFreeBST {
private:
    struct Node {
        T value;
        std::atomic<Node*> left;
        std::atomic<Node*> right;
        std::atomic<bool> deleted;
        
        Node(const T& val) : value(val), left(nullptr), right(nullptr), deleted(false) {}
    };
    
    std::atomic<Node*> root_;
    std::atomic<size_t> size_;

public:
    LockFreeBST() : root_(nullptr), size_(0) {}
    
    ~LockFreeBST() {
        clear_tree(root_.load());
    }
    
    bool insert(const T& value) {
        while (true) {
            auto parent = find_parent(value);
            
            if (parent.second) {
                // Nodo ya existe
                if (parent.second->deleted.load()) {
                    // Nodo marcado como eliminado, intentar recuperar
                    if (parent.second->deleted.compare_exchange_strong(
                        bool{true}, false)) {
                        size_.fetch_add(1);
                        return true;
                    }
                }
                return false;  // Ya existe y no eliminado
            }
            
            auto new_node = new Node(value);
            
            if (!parent.first) {
                // Árbol vacío
                if (root_.compare_exchange_strong(parent.first, new_node)) {
                    size_.fetch_add(1);
                    return true;
                } else {
                    delete new_node;
                    continue;
                }
            }
            
            // Insertar como hijo
            if (value < parent.first->value) {
                Node* expected = nullptr;
                if (parent.first->left.compare_exchange_strong(expected, new_node)) {
                    size_.fetch_add(1);
                    return true;
                }
            } else {
                Node* expected = nullptr;
                if (parent.first->right.compare_exchange_strong(expected, new_node)) {
                    size_.fetch_add(1);
                    return true;
                }
            }
            
            delete new_node;
        }
    }
    
    bool contains(const T& value) {
        auto result = find_parent(value);
        return result.second && !result.second->deleted.load();
    }
    
    bool remove(const T& value) {
        while (true) {
            auto result = find_parent(value);
            
            if (!result.second || result.second->deleted.load()) {
                return false;  // No existe o ya eliminado
            }
            
            auto node_to_delete = result.second;
            
            // Marcado lógico
            if (!node_to_delete->deleted.compare_exchange_strong(
                bool{false}, true)) {
                continue;  // Otro thread lo eliminó
            }
            
            size_.fetch_sub(1);
            
            // Restructuración física diferida
            schedule_physical_removal(node_to_delete);
            
            return true;
        }
    }
    
    size_t size() const {
        return size_.load();
    }
    
    bool empty() const {
        return size_.load() == 0;
    }
    
    // Iterador in-order thread-safe
    std::vector<T> to_vector() const {
        std::vector<T> result;
        in_order_traverse(root_.load(), result);
        return result;
    }

private:
    std::pair<Node*, Node*> find_parent(const T& value) {
        Node* parent = nullptr;
        Node* current = root_.load();
        
        while (current) {
            if (current->deleted.load()) {
                // Nodo eliminado, continuar búsqueda
                if (value < current->value) {
                    current = current->left.load();
                } else if (value > current->value) {
                    current = current->right.load();
                } else {
                    return {parent, current};
                }
                continue;
            }
            
            if (value == current->value) {
                return {parent, current};
            }
            
            parent = current;
            if (value < current->value) {
                current = current->left.load();
            } else {
                current = current->right.load();
            }
        }
        
        return {parent, nullptr};
    }
    
    void schedule_physical_removal(Node* node) {
        // En una implementación completa, esto sería más sofisticado
        // Por ahora, simplificamos con eliminación inmediata
        
        auto left = node->left.load();
        auto right = node->right.load();
        
        if (!left && !right) {
            // Hoja - fácil de eliminar
            // La eliminación física se haría aquí
        } else if (!left || !right) {
            // Un hijo - reemplazar con el hijo
            Node* replacement = left ? left : right;
            // Lógica de reemplazo...
        } else {
            // Dos hijos - encontrar sucesor in-order
            auto successor = find_min(right);
            // Lógica de reemplazo con sucesor...
        }
    }
    
    Node* find_min(Node* node) {
        while (node && node->left.load()) {
            node = node->left.load();
        }
        return node;
    }
    
    void in_order_traverse(Node* node, std::vector<T>& result) const {
        if (!node || node->deleted.load()) {
            return;
        }
        
        in_order_traverse(node->left.load(), result);
        result.push_back(node->value);
        in_order_traverse(node->right.load(), result);
    }
    
    void clear_tree(Node* node) {
        if (!node) return;
        
        clear_tree(node->left.load());
        clear_tree(node->right.load());
        delete node;
    }
};

// Versión optimizada con epoch-based reclamation
template<typename T>
class EpochBasedBST {
private:
    static constexpr size_t MAX_THREADS = 64;
    
    struct Node {
        T value;
        std::atomic<Node*> left;
        std::atomic<Node*> right;
        std::atomic<bool> deleted;
        size_t epoch;  // Época de eliminación
        
        Node(const T& val) : value(val), left(nullptr), right(nullptr), 
                           deleted(false), epoch(0) {}
    };
    
    std::atomic<Node*> root_;
    std::atomic<size_t> size_;
    std::atomic<size_t> global_epoch_;
    
    // Thread-local epoch tracking
    struct alignas(64) ThreadEpoch {
        std::atomic<size_t> local_epoch{0};
        std::atomic<bool> active{false};
    };
    
    ThreadEpoch thread_epochs_[MAX_THREADS];
    std::vector<Node*> pending_deletes_[MAX_THREADS];
    static thread_local size_t thread_id_;

public:
    EpochBasedBST() : root_(nullptr), size_(0), global_epoch_(1) {}
    
    bool insert(const T& value) {
        enter_epoch();
        
        bool result = insert_impl(value);
        
        exit_epoch();
        return result;
    }
    
    bool remove(const T& value) {
        enter_epoch();
        
        bool result = remove_impl(value);
        
        exit_epoch();
        return result;
    }
    
    bool contains(const T& value) {
        enter_epoch();
        
        bool result = contains_impl(value);
        
        exit_epoch();
        return result;
    }

private:
    void enter_epoch() {
        size_t tid = get_thread_id();
        thread_epochs_[tid].active.store(true);
        thread_epochs_[tid].local_epoch.store(global_epoch_.load());
    }
    
    void exit_epoch() {
        size_t tid = get_thread_id();
        thread_epochs_[tid].active.store(false);
        
        // Intentar reclamar memoria
        try_reclaim_memory(tid);
    }
    
    size_t get_thread_id() {
        if (thread_id_ == SIZE_MAX) {
            static std::atomic<size_t> counter{0};
            thread_id_ = counter.fetch_add(1) % MAX_THREADS;
        }
        return thread_id_;
    }
    
    void try_reclaim_memory(size_t tid) {
        auto min_epoch = compute_min_epoch();
        
        auto it = pending_deletes_[tid].begin();
        while (it != pending_deletes_[tid].end()) {
            if ((*it)->epoch < min_epoch) {
                delete *it;
                it = pending_deletes_[tid].erase(it);
            } else {
                ++it;
            }
        }
    }
    
    size_t compute_min_epoch() {
        size_t min_epoch = global_epoch_.load();
        
        for (const auto& te : thread_epochs_) {
            if (te.active.load()) {
                min_epoch = std::min(min_epoch, te.local_epoch.load());
            }
        }
        
        return min_epoch;
    }
    
    bool insert_impl(const T& value) {
        // Implementación similar al BST básico...
        return true;  // Simplificado
    }
    
    bool remove_impl(const T& value) {
        // Marcar para eliminación y agregar a lista pending
        // Implementación completa aquí...
        return true;  // Simplificado
    }
    
    bool contains_impl(const T& value) {
        // Implementación de búsqueda...
        return false;  // Simplificado
    }
};

template<typename T>
thread_local size_t EpochBasedBST<T>::thread_id_ = SIZE_MAX;`
    },
    {
      title: state.language === 'en' ? 'Performance Benchmarking' : 'Benchmarking de Rendimiento',
      code: `#include <chrono>
#include <thread>
#include <vector>
#include <random>
#include <iostream>

template<typename Container>
class PerformanceBenchmark {
private:
    Container& container_;
    std::atomic<bool> stop_flag_;
    std::atomic<size_t> operations_completed_;

public:
    PerformanceBenchmark(Container& container) 
        : container_(container), stop_flag_(false), operations_completed_(0) {}
    
    struct BenchmarkResult {
        double operations_per_second;
        double average_latency_us;
        size_t total_operations;
        std::chrono::milliseconds duration;
    };
    
    BenchmarkResult run_insert_benchmark(
        size_t num_threads, 
        std::chrono::milliseconds duration,
        size_t value_range = 100000) {
        
        operations_completed_.store(0);
        stop_flag_.store(false);
        
        std::vector<std::thread> workers;
        auto start_time = std::chrono::high_resolution_clock::now();
        
        // Lanzar threads trabajadores
        for (size_t i = 0; i < num_threads; ++i) {
            workers.emplace_back([this, i, value_range]() {
                insert_worker(i, value_range);
            });
        }
        
        // Esperar duración especificada
        std::this_thread::sleep_for(duration);
        stop_flag_.store(true);
        
        // Esperar a que terminen todos los workers
        for (auto& worker : workers) {
            worker.join();
        }
        
        auto end_time = std::chrono::high_resolution_clock::now();
        auto actual_duration = std::chrono::duration_cast<std::chrono::milliseconds>(
            end_time - start_time);
        
        size_t total_ops = operations_completed_.load();
        double ops_per_second = (total_ops * 1000.0) / actual_duration.count();
        double avg_latency = (actual_duration.count() * 1000.0) / total_ops; // microseconds
        
        return {ops_per_second, avg_latency, total_ops, actual_duration};
    }
    
    BenchmarkResult run_mixed_benchmark(
        size_t num_threads,
        std::chrono::milliseconds duration,
        double insert_ratio = 0.5,
        double remove_ratio = 0.2,
        double find_ratio = 0.3,
        size_t value_range = 100000) {
        
        operations_completed_.store(0);
        stop_flag_.store(false);
        
        std::vector<std::thread> workers;
        auto start_time = std::chrono::high_resolution_clock::now();
        
        for (size_t i = 0; i < num_threads; ++i) {
            workers.emplace_back([this, i, insert_ratio, remove_ratio, find_ratio, value_range]() {
                mixed_worker(i, insert_ratio, remove_ratio, find_ratio, value_range);
            });
        }
        
        std::this_thread::sleep_for(duration);
        stop_flag_.store(true);
        
        for (auto& worker : workers) {
            worker.join();
        }
        
        auto end_time = std::chrono::high_resolution_clock::now();
        auto actual_duration = std::chrono::duration_cast<std::chrono::milliseconds>(
            end_time - start_time);
        
        size_t total_ops = operations_completed_.load();
        double ops_per_second = (total_ops * 1000.0) / actual_duration.count();
        double avg_latency = (actual_duration.count() * 1000.0) / total_ops;
        
        return {ops_per_second, avg_latency, total_ops, actual_duration};
    }
    
    void print_result(const BenchmarkResult& result, const std::string& test_name) {
        std::cout << "\\n=== " << test_name << " ===" << std::endl;
        std::cout << "Operations/second: " << std::fixed << std::setprecision(2) 
                  << result.operations_per_second << std::endl;
        std::cout << "Average latency: " << std::fixed << std::setprecision(2) 
                  << result.average_latency_us << " µs" << std::endl;
        std::cout << "Total operations: " << result.total_operations << std::endl;
        std::cout << "Duration: " << result.duration.count() << " ms" << std::endl;
    }

private:
    void insert_worker(size_t thread_id, size_t value_range) {
        std::mt19937 gen(thread_id);
        std::uniform_int_distribution<> dis(1, value_range);
        
        size_t local_ops = 0;
        while (!stop_flag_.load(std::memory_order_acquire)) {
            int value = dis(gen);
            container_.insert(value);
            ++local_ops;
        }
        
        operations_completed_.fetch_add(local_ops, std::memory_order_relaxed);
    }
    
    void mixed_worker(size_t thread_id, double insert_ratio, double remove_ratio, 
                     double find_ratio, size_t value_range) {
        std::mt19937 gen(thread_id);
        std::uniform_int_distribution<> value_dis(1, value_range);
        std::uniform_real_distribution<> op_dis(0.0, 1.0);
        
        size_t local_ops = 0;
        while (!stop_flag_.load(std::memory_order_acquire)) {
            int value = value_dis(gen);
            double op_type = op_dis(gen);
            
            if (op_type < insert_ratio) {
                container_.insert(value);
            } else if (op_type < insert_ratio + remove_ratio) {
                container_.remove(value);
            } else {
                int dummy;
                container_.find(value, dummy);  // Adaptado para hash map
            }
            
            ++local_ops;
        }
        
        operations_completed_.fetch_add(local_ops, std::memory_order_relaxed);
    }
};

// Benchmark completo comparando diferentes estructuras
void comprehensive_benchmark() {
    const size_t num_threads = std::thread::hardware_concurrency();
    const auto test_duration = std::chrono::seconds(10);
    const size_t value_range = 1000000;
    
    std::cout << "Lock-Free Data Structures Benchmark" << std::endl;
    std::cout << "Threads: " << num_threads << std::endl;
    std::cout << "Duration: " << test_duration.count() << " seconds" << std::endl;
    std::cout << "Value range: " << value_range << std::endl;
    
    // Benchmark Stack
    {
        LockFreeStack<int> stack;
        PerformanceBenchmark benchmark(stack);
        
        auto result = benchmark.run_insert_benchmark(num_threads, test_duration, value_range);
        benchmark.print_result(result, "Lock-Free Stack (Push Only)");
    }
    
    // Benchmark Queue
    {
        LockFreeQueue<int> queue;
        PerformanceBenchmark benchmark(queue);
        
        auto result = benchmark.run_mixed_benchmark(
            num_threads, test_duration, 0.6, 0.0, 0.4, value_range);
        benchmark.print_result(result, "Lock-Free Queue (Mixed Operations)");
    }
    
    // Benchmark Hash Map
    {
        LockFreeHashMap<int, int> hashmap;
        PerformanceBenchmark benchmark(hashmap);
        
        auto result = benchmark.run_mixed_benchmark(
            num_threads, test_duration, 0.4, 0.2, 0.4, value_range);
        benchmark.print_result(result, "Lock-Free Hash Map (Mixed Operations)");
    }
    
    // Scalability test
    std::cout << "\\n=== Scalability Test ===" << std::endl;
    
    LockFreeStack<int> stack;
    for (size_t threads = 1; threads <= num_threads; threads *= 2) {
        PerformanceBenchmark<LockFreeStack<int>> benchmark(stack);
        auto result = benchmark.run_insert_benchmark(threads, 
                                                   std::chrono::seconds(5), 
                                                   value_range);
        
        std::cout << "Threads: " << threads 
                  << ", Ops/sec: " << std::fixed << std::setprecision(0) 
                  << result.operations_per_second << std::endl;
    }
}

// Medición de contention y fairness
class ContentionAnalyzer {
private:
    std::atomic<size_t> successful_cas_;
    std::atomic<size_t> failed_cas_;
    std::vector<std::atomic<size_t>> per_thread_ops_;

public:
    ContentionAnalyzer(size_t num_threads) 
        : successful_cas_(0), failed_cas_(0), per_thread_ops_(num_threads) {}
    
    void record_successful_cas() {
        successful_cas_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void record_failed_cas() {
        failed_cas_.fetch_add(1, std::memory_order_relaxed);
    }
    
    void record_operation(size_t thread_id) {
        per_thread_ops_[thread_id].fetch_add(1, std::memory_order_relaxed);
    }
    
    void print_stats() {
        size_t total_cas = successful_cas_.load() + failed_cas_.load();
        double contention_ratio = total_cas > 0 ? 
            static_cast<double>(failed_cas_.load()) / total_cas : 0.0;
        
        std::cout << "Contention Analysis:" << std::endl;
        std::cout << "Successful CAS: " << successful_cas_.load() << std::endl;
        std::cout << "Failed CAS: " << failed_cas_.load() << std::endl;
        std::cout << "Contention ratio: " << std::fixed << std::setprecision(2) 
                  << contention_ratio * 100.0 << "%" << std::endl;
        
        std::cout << "Per-thread operations:" << std::endl;
        for (size_t i = 0; i < per_thread_ops_.size(); ++i) {
            std::cout << "Thread " << i << ": " 
                      << per_thread_ops_[i].load() << std::endl;
        }
    }
};`
    }
  ];

  return (
    <div className="lesson-container">
      <h2>{state.language === 'en' ? 'Lesson 99: Lock-Free Data Structures' : 'Lección 99: Estructuras de Datos Lock-Free'}</h2>
      
      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <LockFreeVisualization />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <div className="content-container">
        <div className="examples-section">
          <h3>{state.language === 'en' ? 'Lock-Free Data Structure Implementations' : 'Implementaciones de Estructuras de Datos Lock-Free'}</h3>
          
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
              <h4>{state.language === 'en' ? 'ABA Problem Prevention' : 'Prevención del Problema ABA'}</h4>
              <p>
                {state.language === 'en' 
                  ? 'Use generation counters, hazard pointers, or epoch-based reclamation to prevent ABA scenarios in lock-free structures.'
                  : 'Usa contadores de generación, hazard pointers o reclamación basada en épocas para prevenir escenarios ABA en estructuras lock-free.'}
              </p>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Memory Reclamation' : 'Reclamación de Memoria'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Safe memory reclamation strategies including hazard pointers, epochs, and RCU for preventing use-after-free.'
                  : 'Estrategias seguras de reclamación de memoria incluyendo hazard pointers, épocas y RCU para prevenir use-after-free.'}
              </p>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Scalability Patterns' : 'Patrones de Escalabilidad'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Design patterns for minimizing contention and maximizing throughput in highly concurrent environments.'
                  : 'Patrones de diseño para minimizar contención y maximizar throughput en ambientes altamente concurrentes.'}
              </p>
            </div>
            
            <div className="concept-card">
              <h4>{state.language === 'en' ? 'Performance Analysis' : 'Análisis de Rendimiento'}</h4>
              <p>
                {state.language === 'en'
                  ? 'Benchmarking techniques, contention analysis, and fairness measurement for lock-free algorithms.'
                  : 'Técnicas de benchmarking, análisis de contención y medición de fairness para algoritmos lock-free.'}
              </p>
            </div>
          </div>
        </div>

        <div className="best-practices">
          <h3>{state.language === 'en' ? 'Best Practices' : 'Mejores Prácticas'}</h3>
          <ul>
            <li>
              {state.language === 'en'
                ? 'Implement proper memory reclamation to prevent memory leaks and use-after-free bugs'
                : 'Implementa reclamación de memoria apropiada para prevenir memory leaks y bugs de use-after-free'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Use appropriate memory ordering - typically acquire-release for synchronization points'
                : 'Usa ordenamiento de memoria apropiado - típicamente acquire-release para puntos de sincronización'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Design for contention reduction through better data locality and algorithmic improvements'
                : 'Diseña para reducir contención a través de mejor localidad de datos y mejoras algorítmicas'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Implement comprehensive testing including stress tests and correctness verification'
                : 'Implementa testing comprensivo incluyendo stress tests y verificación de correctitud'}
            </li>
            <li>
              {state.language === 'en'
                ? 'Consider fallback strategies for extreme contention scenarios'
                : 'Considera estrategias de fallback para escenarios de contención extrema'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}