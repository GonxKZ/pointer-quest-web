import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import styled from 'styled-components';
import * as THREE from 'three';

// Styled components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  min-height: 100vh;
  color: #ffffff;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #00d4ff;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
`;

const Subtitle = styled.h2`
  font-size: 1.3rem;
  color: #64b5f6;
  margin-bottom: 2rem;
  font-weight: 300;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
`;

const VisualizationPanel = styled.div`
  background: rgba(15, 20, 25, 0.8);
  border-radius: 15px;
  padding: 1rem;
  border: 2px solid rgba(0, 212, 255, 0.3);
  height: 600px;
`;

const ControlPanel = styled.div`
  background: rgba(15, 20, 25, 0.9);
  border-radius: 15px;
  padding: 2rem;
  border: 2px solid rgba(100, 181, 246, 0.3);
  overflow-y: auto;
  max-height: 600px;
`;

const TheorySection = styled.div`
  margin-bottom: 2rem;
  
  h3, h4 {
    color: #00d4ff;
    margin-bottom: 1rem;
  }
  
  p {
    color: #b8c5d6;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  ul {
    color: #b8c5d6;
    margin-left: 1rem;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #e1e5e9;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 1rem 0;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
  }
  
  &:active {
    background: linear-gradient(135deg, #0099cc, #00d4ff);
  }
`;

const StatusPanel = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid #00d4ff;
  
  h4 {
    color: #00d4ff;
    margin-bottom: 0.5rem;
  }
  
  div {
    color: #b8c5d6;
    margin-bottom: 0.3rem;
    font-family: 'Fira Code', monospace;
  }
`;

const StrategyCard = styled.div<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(0, 212, 255, 0.2)' : 'rgba(100, 181, 246, 0.1)'};
  border: 2px solid ${props => props.active ? '#00d4ff' : 'rgba(100, 181, 246, 0.3)'};
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  transition: all 0.3s ease;
  
  h5 {
    color: ${props => props.active ? '#00d4ff' : '#64b5f6'};
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  
  code {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
  }
`;

const DataVisualization = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  
  .data-item {
    margin: 0.3rem 0;
    padding: 0.2rem;
    background: rgba(100, 181, 246, 0.1);
    border-radius: 4px;
  }
`;

// Types
interface SortStrategy {
  name: string;
  description: string;
  complexity: string;
  bestCase: string;
  worstCase: string;
  stable: boolean;
}

interface SortState {
  data: number[];
  currentStrategy: string;
  sorting: boolean;
  comparisons: number;
  swaps: number;
  timeElapsed: number;
  sortHistory: Array<{ strategy: string; time: number; comparisons: number; swaps: number }>;
}

// 3D Visualization Component
const StrategyVisualization: React.FC<{ state: SortState, strategies: Record<string, SortStrategy> }> = ({ state, strategies }) => {
  const maxValue = Math.max(...state.data, 1);
  
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Data bars */}
      {state.data.map((value, index) => {
        const height = (value / maxValue) * 4 + 0.5;
        const x = (index - state.data.length / 2) * 0.8;
        const color = state.sorting ? 
          (index % 2 === 0 ? '#00d4ff' : '#64b5f6') : 
          '#ffffff';
        
        return (
          <group key={index}>
            <mesh position={[x, height / 2, 0]}>
              <boxGeometry args={[0.6, height, 0.6]} />
              <meshStandardMaterial 
                color={color}
                emissive={state.sorting ? '#001122' : '#000000'}
              />
            </mesh>
            
            {/* Value labels */}
            <Text
              position={[x, height + 0.5, 0]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {value}
            </Text>
          </group>
        );
      })}
      
      {/* Current strategy label */}
      <Text
        position={[0, 6, 0]}
        fontSize={0.5}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        {`Strategy: ${state.currentStrategy}`}
      </Text>
      
      {/* Performance metrics */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="#64b5f6"
        anchorX="center"
        anchorY="middle"
      >
        {`Comparisons: ${state.comparisons} | Swaps: ${state.swaps}`}
      </Text>
      
      {/* Strategy complexity visualization */}
      <mesh position={[6, 2, 0]}>
        <sphereGeometry args={[1]} />
        <meshStandardMaterial 
          color={strategies[state.currentStrategy]?.stable ? '#00ff00' : '#ff9800'}
          emissive="#001100"
          opacity={0.7}
          transparent
        />
      </mesh>
      
      <Text
        position={[6, 3.5, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {strategies[state.currentStrategy]?.stable ? 'Stable' : 'Unstable'}
      </Text>
      
      {/* Complexity indicator */}
      <Text
        position={[6, 0.5, 0]}
        fontSize={0.25}
        color="#ffb74d"
        anchorX="center"
        anchorY="middle"
      >
        {strategies[state.currentStrategy]?.complexity}
      </Text>
    </>
  );
};

// Main component
const Lesson47_StrategyPattern: React.FC = () => {
  const strategies: Record<string, SortStrategy> = {
    'Bubble Sort': {
      name: 'Bubble Sort',
      description: 'Compara elementos adyacentes e intercambia si están en orden incorrecto',
      complexity: 'O(n²)',
      bestCase: 'O(n)',
      worstCase: 'O(n²)',
      stable: true
    },
    'Quick Sort': {
      name: 'Quick Sort',
      description: 'Divide y vencerás usando un pivot para particionar',
      complexity: 'O(n log n)',
      bestCase: 'O(n log n)',
      worstCase: 'O(n²)',
      stable: false
    },
    'Merge Sort': {
      name: 'Merge Sort',
      description: 'Divide recursivamente y luego merge ordenadamente',
      complexity: 'O(n log n)',
      bestCase: 'O(n log n)',
      worstCase: 'O(n log n)',
      stable: true
    },
    'Heap Sort': {
      name: 'Heap Sort',
      description: 'Usa una estructura heap para extraer máximos sucesivamente',
      complexity: 'O(n log n)',
      bestCase: 'O(n log n)',
      worstCase: 'O(n log n)',
      stable: false
    }
  };

  const [state, setState] = useState<SortState>({
    data: [64, 34, 25, 12, 22, 11, 90, 88, 76, 50],
    currentStrategy: 'Bubble Sort',
    sorting: false,
    comparisons: 0,
    swaps: 0,
    timeElapsed: 0,
    sortHistory: []
  });

  // Simulate sorting with different strategies
  const simulateSort = useCallback((strategyName: string) => {
    setState(prev => ({ 
      ...prev, 
      currentStrategy: strategyName, 
      sorting: true, 
      comparisons: 0, 
      swaps: 0,
      timeElapsed: 0 
    }));

    // Simulate sorting process with different performance characteristics
    const startTime = Date.now();
    let comparisons = 0;
    let swaps = 0;
    
    // Simulate different algorithm characteristics
    switch (strategyName) {
      case 'Bubble Sort':
        comparisons = state.data.length * (state.data.length - 1) / 2;
        swaps = Math.floor(comparisons * 0.3);
        break;
      case 'Quick Sort':
        comparisons = state.data.length * Math.log2(state.data.length);
        swaps = Math.floor(comparisons * 0.2);
        break;
      case 'Merge Sort':
        comparisons = state.data.length * Math.log2(state.data.length);
        swaps = Math.floor(comparisons * 0.5);
        break;
      case 'Heap Sort':
        comparisons = state.data.length * Math.log2(state.data.length);
        swaps = Math.floor(comparisons * 0.3);
        break;
    }

    setTimeout(() => {
      const endTime = Date.now();
      const sortedData = [...state.data].sort((a, b) => a - b);
      
      setState(prev => ({
        ...prev,
        data: sortedData,
        sorting: false,
        comparisons: Math.floor(comparisons),
        swaps: Math.floor(swaps),
        timeElapsed: endTime - startTime,
        sortHistory: [
          ...prev.sortHistory,
          {
            strategy: strategyName,
            time: endTime - startTime,
            comparisons: Math.floor(comparisons),
            swaps: Math.floor(swaps)
          }
        ]
      }));
    }, 1500);
  }, [state.data]);

  const generateRandomData = useCallback(() => {
    const newData = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
    setState(prev => ({
      ...prev,
      data: newData,
      comparisons: 0,
      swaps: 0,
      timeElapsed: 0
    }));
  }, []);

  const generateSortedData = useCallback(() => {
    const newData = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);
    setState(prev => ({
      ...prev,
      data: newData,
      comparisons: 0,
      swaps: 0,
      timeElapsed: 0
    }));
  }, []);

  const generateReversedData = useCallback(() => {
    const newData = Array.from({ length: 10 }, (_, i) => (10 - i) * 10);
    setState(prev => ({
      ...prev,
      data: newData,
      comparisons: 0,
      swaps: 0,
      timeElapsed: 0
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, sortHistory: [] }));
  }, []);

  return (
    <Container>
      <Header>
        <Title>Lección 47: Strategy Pattern con Function Pointers</Title>
        <Subtitle>Algoritmos Intercambiables con Punteros a Función</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
            <StrategyVisualization state={state} strategies={strategies} />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>🔄 Strategy Pattern con Function Pointers</h3>
            <p>
              El Strategy Pattern permite cambiar algoritmos dinámicamente. Con function 
              pointers en C++, podemos implementar estrategias de forma eficiente sin 
              overhead de virtual functions.
            </p>
            
            <CodeBlock>{`// Definición de estrategia con function pointer
using SortStrategy = void(*)(std::vector<int>&);

// Implementaciones concretas
void bubbleSort(std::vector<int>& data) {
    bool swapped;
    do {
        swapped = false;
        for (size_t i = 0; i < data.size() - 1; ++i) {
            if (data[i] > data[i + 1]) {
                std::swap(data[i], data[i + 1]);
                swapped = true;
            }
        }
    } while (swapped);
}

void quickSort(std::vector<int>& data) {
    std::sort(data.begin(), data.end()); // Optimized implementation
}

// Context que usa las estrategias
class Sorter {
private:
    SortStrategy strategy_;
    std::string strategy_name_;
    
public:
    void setStrategy(SortStrategy strategy, const std::string& name) {
        strategy_ = strategy;
        strategy_name_ = name;
    }
    
    void sort(std::vector<int>& data) {
        if (strategy_) {
            auto start = std::chrono::high_resolution_clock::now();
            strategy_(data);
            auto end = std::chrono::high_resolution_clock::now();
            
            auto duration = std::chrono::duration_cast<std::chrono::microseconds>(
                end - start);
            std::cout << strategy_name_ << " took: " 
                      << duration.count() << "μs" << std::endl;
        }
    }
};`}</CodeBlock>
          </TheorySection>

          <div>
            <h4>🔄 Estrategias de Ordenamiento</h4>
            {Object.entries(strategies).map(([key, strategy]) => (
              <StrategyCard key={key} active={state.currentStrategy === key}>
                <h5>{strategy.name}</h5>
                <p>{strategy.description}</p>
                <p>
                  <strong>Complejidad:</strong> <code>{strategy.complexity}</code><br/>
                  <strong>Estable:</strong> {strategy.stable ? 'Sí' : 'No'}
                </p>
                <Button 
                  onClick={() => simulateSort(key)}
                  disabled={state.sorting}
                >
                  Usar {strategy.name}
                </Button>
              </StrategyCard>
            ))}
          </div>

          <div>
            <h4>📊 Generar Datos</h4>
            <Button onClick={generateRandomData}>🎲 Datos Aleatorios</Button>
            <Button onClick={generateSortedData}>📈 Datos Ordenados</Button>
            <Button onClick={generateReversedData}>📉 Datos Invertidos</Button>
            <Button onClick={clearHistory}>🗑️ Limpiar Historial</Button>
          </div>

          <StatusPanel>
            <h4>📊 Estadísticas Actuales</h4>
            <div>Estrategia: {state.currentStrategy}</div>
            <div>Estado: {state.sorting ? 'Ordenando...' : 'Listo'}</div>
            <div>Datos: [{state.data.join(', ')}]</div>
            <div>Comparaciones: {state.comparisons}</div>
            <div>Intercambios: {state.swaps}</div>
            <div>Tiempo: {state.timeElapsed}ms</div>
          </StatusPanel>

          <DataVisualization>
            <h4>📈 Historial de Performance</h4>
            {state.sortHistory.slice(-3).map((entry, index) => (
              <div key={index} className="data-item">
                <strong>{entry.strategy}:</strong> {entry.time}ms, 
                {entry.comparisons} comp, {entry.swaps} swaps
              </div>
            ))}
          </DataVisualization>

          <TheorySection>
            <h4>🏗️ Estrategias Avanzadas con std::function</h4>
            <CodeBlock>{`// Estrategias más flexibles con std::function
#include <functional>

using AdvancedStrategy = std::function<void(std::vector<int>&, 
                                          std::function<void(int, int)>)>;

class AdvancedSorter {
private:
    AdvancedStrategy strategy_;
    std::function<void(int, int)> observer_;
    
public:
    void setStrategy(AdvancedStrategy strategy) {
        strategy_ = strategy;
    }
    
    void setObserver(std::function<void(int, int)> obs) {
        observer_ = obs;
    }
    
    void sort(std::vector<int>& data) {
        if (strategy_) {
            strategy_(data, observer_);
        }
    }
};

// Estrategia con observador
void observableBubbleSort(std::vector<int>& data, 
                         std::function<void(int, int)> observer) {
    for (size_t i = 0; i < data.size(); ++i) {
        for (size_t j = 0; j < data.size() - 1 - i; ++j) {
            if (observer) observer(j, j + 1); // Notify comparison
            
            if (data[j] > data[j + 1]) {
                std::swap(data[j], data[j + 1]);
            }
        }
    }
}

// Uso con lambda
AdvancedSorter sorter;
sorter.setStrategy(observableBubbleSort);
sorter.setObserver([](int i, int j) {
    std::cout << "Comparing positions " << i << " and " << j << std::endl;
});`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>🔧 Template Strategy Pattern</h4>
            <CodeBlock>{`// Strategy con templates para mayor performance
template<typename Compare = std::less<int>>
class TemplateSorter {
private:
    Compare comp_;
    
public:
    TemplateSorter(Compare c = Compare{}) : comp_(c) {}
    
    template<typename Container>
    void bubbleSort(Container& data) {
        bool swapped;
        do {
            swapped = false;
            for (auto it = data.begin(); it != data.end() - 1; ++it) {
                if (comp_(*(it + 1), *it)) {  // Use comparator
                    std::swap(*it, *(it + 1));
                    swapped = true;
                }
            }
        } while (swapped);
    }
};

// Uso con diferentes comparadores
TemplateSorter<std::less<int>> ascending;
TemplateSorter<std::greater<int>> descending;
TemplateSorter<decltype([](int a, int b) { return abs(a) < abs(b); })> byAbsValue;

std::vector<int> data = {-5, 3, -1, 8, -2};
byAbsValue.bubbleSort(data);  // Sort by absolute value`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>💡 Ventajas del Function Pointer Strategy</h4>
            <ul>
              <li><strong>Zero overhead:</strong> No virtual function calls</li>
              <li><strong>Compile-time optimization:</strong> Inlining posible</li>
              <li><strong>Type safety:</strong> Verificación en tiempo de compilación</li>
              <li><strong>Flexibility:</strong> Función, functor, lambda compatible</li>
              <li><strong>Performance:</strong> Ideal para hot paths</li>
            </ul>
          </TheorySection>

          <TheorySection>
            <h4>⚠️ Consideraciones de Implementación</h4>
            <CodeBlock>{`// Registry pattern para estrategias
class StrategyRegistry {
private:
    std::map<std::string, SortStrategy> strategies_;
    
public:
    void registerStrategy(const std::string& name, SortStrategy strategy) {
        strategies_[name] = strategy;
    }
    
    SortStrategy getStrategy(const std::string& name) {
        auto it = strategies_.find(name);
        return (it != strategies_.end()) ? it->second : nullptr;
    }
    
    std::vector<std::string> getAvailableStrategies() const {
        std::vector<std::string> names;
        for (const auto& [name, strategy] : strategies_) {
            names.push_back(name);
        }
        return names;
    }
};

// Thread-safe strategy switching
class ThreadSafeSorter {
private:
    std::atomic<SortStrategy> current_strategy_;
    std::string strategy_name_;
    mutable std::shared_mutex name_mutex_;
    
public:
    void setStrategy(SortStrategy strategy, const std::string& name) {
        current_strategy_.store(strategy);
        
        std::unique_lock lock(name_mutex_);
        strategy_name_ = name;
    }
    
    void sort(std::vector<int>& data) {
        auto strategy = current_strategy_.load();
        if (strategy) {
            strategy(data);
        }
    }
};`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>🎯 Casos de Uso Comunes</h4>
            <ul>
              <li><strong>Algoritmos de ordenamiento:</strong> Selección dinámica de algoritmos</li>
              <li><strong>Compression algorithms:</strong> Diferentes niveles de compresión</li>
              <li><strong>Pathfinding:</strong> A*, Dijkstra, BFS intercambiables</li>
              <li><strong>Validation strategies:</strong> Diferentes reglas de validación</li>
              <li><strong>Rendering pipelines:</strong> Diferentes técnicas de renderizado</li>
              <li><strong>Trading strategies:</strong> Algoritmos de trading automático</li>
            </ul>
          </TheorySection>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson47_StrategyPattern;