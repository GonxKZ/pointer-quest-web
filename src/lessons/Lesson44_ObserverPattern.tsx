import React, { useState, useCallback, useRef } from 'react';
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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

const ObserverCard = styled.div<{ active: boolean }>`
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
    margin: 0;
  }
`;

// Types
interface Observer {
  id: string;
  name: string;
  type: 'UI' | 'Logger' | 'Analytics' | 'Cache';
  active: boolean;
  lastNotified?: string;
}

interface SubjectState {
  value: number;
  status: string;
  observers: Observer[];
  notificationCount: number;
}

// 3D Visualization Component
const ObserverVisualization: React.FC<{ state: SubjectState }> = ({ state }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Subject in center */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color={state.status === 'notifying' ? '#00d4ff' : '#64b5f6'}
          emissive={state.status === 'notifying' ? '#001122' : '#000000'}
        />
      </mesh>
      
      {/* Subject label */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.5}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        Subject
      </Text>
      
      {/* Value display */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`Value: ${state.value}`}
      </Text>
      
      {/* Observers around the subject */}
      {state.observers.map((observer, index) => {
        const angle = (index / state.observers.length) * Math.PI * 2;
        const radius = 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={observer.id}>
            {/* Observer node */}
            <mesh position={[x, 0, z]}>
              <sphereGeometry args={[0.5]} />
              <meshStandardMaterial 
                color={observer.active ? '#00ff00' : '#666666'}
                emissive={observer.active ? '#001100' : '#000000'}
              />
            </mesh>
            
            {/* Connection line */}
            <line>
              <bufferGeometry>
                {(() => {
                  const points = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(x, 0, z)
                  ];
                  const geometry = new THREE.BufferGeometry().setFromPoints(points);
                  return React.createElement('primitive', { object: geometry });
                })()}
              </bufferGeometry>
              <lineBasicMaterial 
                color={observer.active ? '#00d4ff' : '#444444'}
                opacity={observer.active ? 1 : 0.3}
                transparent
              />
            </line>
            
            {/* Observer label */}
            <Text
              position={[x, 1, z]}
              fontSize={0.3}
              color={observer.active ? '#00ff00' : '#888888'}
              anchorX="center"
              anchorY="middle"
            >
              {observer.name}
            </Text>
          </group>
        );
      })}
      
      {/* Notification waves during notification */}
      {state.status === 'notifying' && (
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[3, 0.1, 8, 16]} />
          <meshStandardMaterial 
            color="#00d4ff" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      )}
    </>
  );
};

// Main component
const Lesson44_ObserverPattern: React.FC = () => {
  const [state, setState] = useState<SubjectState>({
    value: 0,
    status: 'idle',
    observers: [
      { id: '1', name: 'UI Observer', type: 'UI', active: true },
      { id: '2', name: 'Logger', type: 'Logger', active: true },
      { id: '3', name: 'Analytics', type: 'Analytics', active: false },
      { id: '4', name: 'Cache', type: 'Cache', active: true }
    ],
    notificationCount: 0
  });

  const notificationTimeoutRef = useRef<NodeJS.Timeout>();

  const notifyObservers = useCallback(() => {
    setState(prev => ({ ...prev, status: 'notifying' }));
    
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    // Update observers
    const timestamp = new Date().toLocaleTimeString();
    setState(prev => ({
      ...prev,
      observers: prev.observers.map(obs => 
        obs.active ? { ...obs, lastNotified: timestamp } : obs
      ),
      notificationCount: prev.notificationCount + 1
    }));
    
    // Reset status after animation
    notificationTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, status: 'idle' }));
    }, 1000);
  }, []);

  const updateValue = useCallback((newValue: number) => {
    setState(prev => ({ ...prev, value: newValue }));
    notifyObservers();
  }, [notifyObservers]);

  const toggleObserver = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      observers: prev.observers.map(obs => 
        obs.id === id ? { ...obs, active: !obs.active } : obs
      )
    }));
  }, []);

  const addObserver = useCallback(() => {
    const newId = (state.observers.length + 1).toString();
    setState(prev => ({
      ...prev,
      observers: [
        ...prev.observers,
        {
          id: newId,
          name: `Observer ${newId}`,
          type: 'UI' as const,
          active: true
        }
      ]
    }));
  }, [state.observers.length]);

  const resetDemo = useCallback(() => {
    setState({
      value: 0,
      status: 'idle',
      observers: [
        { id: '1', name: 'UI Observer', type: 'UI', active: true },
        { id: '2', name: 'Logger', type: 'Logger', active: true },
        { id: '3', name: 'Analytics', type: 'Analytics', active: false },
        { id: '4', name: 'Cache', type: 'Cache', active: true }
      ],
      notificationCount: 0
    });
  }, []);

  return (
    <Container>
      <Header>
        <Title>Lección 44: Observer Pattern con Smart Pointers</Title>
        <Subtitle>Notificaciones Seguras y Eficientes con unique_ptr y shared_ptr</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
            <ObserverVisualization state={state} />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>🔍 Observer Pattern con Smart Pointers</h3>
            <p>
              El Observer Pattern implementado con smart pointers garantiza seguridad 
              de memoria y previene punteros colgantes cuando los observers se destruyen.
            </p>
            
            <CodeBlock>{`// Subject con notificación segura
class Subject {
private:
    std::vector<std::weak_ptr<Observer>> observers_;
    int value_;
    
public:
    void attach(std::shared_ptr<Observer> obs) {
        observers_.push_back(obs);
    }
    
    void notify() {
        // Limpia automáticamente observers destruidos
        observers_.erase(
            std::remove_if(observers_.begin(), observers_.end(),
                [](const std::weak_ptr<Observer>& wp) { 
                    return wp.expired(); 
                }),
            observers_.end());
            
        // Notifica a observers activos
        for (auto& wp : observers_) {
            if (auto obs = wp.lock()) {
                obs->update(value_);
            }
        }
    }
    
    void setValue(int value) {
        value_ = value;
        notify();
    }
};`}</CodeBlock>
          </TheorySection>

          <div>
            <h4>⚙️ Control de Demostración</h4>
            
            <div>
              <label>Valor del Subject:</label>
              <Button onClick={() => updateValue(state.value + 1)}>
                Incrementar (+1)
              </Button>
              <Button onClick={() => updateValue(state.value + 10)}>
                +10
              </Button>
              <Button onClick={() => updateValue(0)}>
                Reset Valor
              </Button>
            </div>

            <Button onClick={addObserver}>
              ➕ Añadir Observer
            </Button>
            <Button onClick={resetDemo}>
              🔄 Reset Demo
            </Button>
          </div>

          <StatusPanel>
            <h4>📊 Estado del Subject</h4>
            <div>Valor actual: {state.value}</div>
            <div>Estado: {state.status}</div>
            <div>Observers activos: {state.observers.filter(o => o.active).length}/{state.observers.length}</div>
            <div>Total notificaciones: {state.notificationCount}</div>
          </StatusPanel>

          <div>
            <h4>👁️ Observers</h4>
            {state.observers.map(observer => (
              <ObserverCard key={observer.id} active={observer.active}>
                <h5>{observer.name} ({observer.type})</h5>
                <p>
                  Estado: {observer.active ? 'Activo' : 'Inactivo'}
                  {observer.lastNotified && ` | Última notificación: ${observer.lastNotified}`}
                </p>
                <Button onClick={() => toggleObserver(observer.id)}>
                  {observer.active ? 'Desactivar' : 'Activar'}
                </Button>
              </ObserverCard>
            ))}
          </div>

          <TheorySection>
            <h4>🏗️ Implementación Avanzada</h4>
            <CodeBlock>{`// Observer base con RAII
class Observer {
public:
    virtual ~Observer() = default;
    virtual void update(int value) = 0;
    virtual std::string getName() const = 0;
};

// Observer específico
class UIObserver : public Observer {
private:
    std::string name_;
    
public:
    UIObserver(std::string name) : name_(std::move(name)) {}
    
    void update(int value) override {
        std::cout << name_ << " received: " << value << std::endl;
        // Actualizar UI de forma thread-safe
    }
    
    std::string getName() const override { return name_; }
};

// Factory para crear observers
class ObserverFactory {
public:
    static std::shared_ptr<Observer> createUI(const std::string& name) {
        return std::make_shared<UIObserver>(name);
    }
    
    static std::shared_ptr<Observer> createLogger(const std::string& name) {
        return std::make_shared<LoggerObserver>(name);
    }
};`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>💡 Ventajas del Smart Pointer Observer</h4>
            <ul>
              <li><strong>Seguridad automática:</strong> weak_ptr previene punteros colgantes</li>
              <li><strong>Limpieza automática:</strong> Observers destruidos se eliminan automáticamente</li>
              <li><strong>Exception safety:</strong> RAII garantiza limpieza en caso de excepción</li>
              <li><strong>Thread safety:</strong> shared_ptr/weak_ptr son thread-safe para reference counting</li>
              <li><strong>Memory efficiency:</strong> No memory leaks por references circulares</li>
            </ul>
          </TheorySection>

          <TheorySection>
            <h4>⚠️ Consideraciones de Performance</h4>
            <CodeBlock>{`// Optimización: batch notifications
class Subject {
    bool notification_pending_ = false;
    
public:
    void setValue(int value) {
        value_ = value;
        scheduleNotification();
    }
    
private:
    void scheduleNotification() {
        if (!notification_pending_) {
            notification_pending_ = true;
            // Usar timer o event loop para batch
            std::async(std::launch::deferred, [this]() {
                notify();
                notification_pending_ = false;
            });
        }
    }
};

// Thread-safe observer management
class ThreadSafeSubject {
    mutable std::shared_mutex observers_mutex_;
    std::vector<std::weak_ptr<Observer>> observers_;
    
public:
    void notify() {
        std::shared_lock lock(observers_mutex_);
        // Safe concurrent read access
        for (auto& wp : observers_) {
            if (auto obs = wp.lock()) {
                obs->update(value_);
            }
        }
    }
};`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>🎯 Casos de Uso Comunes</h4>
            <ul>
              <li><strong>Model-View arquitecturas:</strong> UI reactiva a cambios de modelo</li>
              <li><strong>Event systems:</strong> Múltiples listeners para eventos</li>
              <li><strong>Configuration management:</strong> Componentes reaccionan a cambios</li>
              <li><strong>Logging systems:</strong> Múltiples loggers para diferentes outputs</li>
              <li><strong>Plugin architectures:</strong> Plugins suscritos a eventos del core</li>
              <li><strong>Real-time systems:</strong> Múltiples consumidores de datos</li>
            </ul>
          </TheorySection>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson44_ObserverPattern;