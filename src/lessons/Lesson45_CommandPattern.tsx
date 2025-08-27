import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import styled from 'styled-components';
import { THREE } from '../utils/three';

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

const CommandCard = styled.div<{ executed: boolean }>`
  background: ${props => props.executed ? 'rgba(0, 255, 0, 0.1)' : 'rgba(100, 181, 246, 0.1)'};
  border: 2px solid ${props => props.executed ? '#00ff00' : 'rgba(100, 181, 246, 0.3)'};
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  transition: all 0.3s ease;
  
  h5 {
    color: ${props => props.executed ? '#00ff00' : '#64b5f6'};
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    margin: 0;
  }
`;

const UndoStack = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 200px;
  overflow-y: auto;
`;

const UndoItem = styled.div`
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0.3rem 0;
  font-size: 0.8rem;
  color: #ffb74d;
  font-family: 'Fira Code', monospace;
`;

// Types
interface Command {
  id: string;
  name: string;
  description: string;
  executed: boolean;
  timestamp?: string;
  undoable: boolean;
}

interface DocumentState {
  content: string;
  cursor: number;
  version: number;
  commands: Command[];
  undoStack: string[];
  redoStack: string[];
}

// 3D Visualization Component
const CommandVisualization: React.FC<{ state: DocumentState }> = ({ state }) => {
  const maxCommands = 8;
  const visibleCommands = state.commands.slice(-maxCommands);
  
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Document in center */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 2, 0.2]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#001122"
        />
      </mesh>
      
      {/* Document label */}
      <Text
        position={[0, 1.5, 0.2]}
        fontSize={0.3}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        Document
      </Text>
      
      {/* Content preview */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.2}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
      >
        {state.content.length > 50 ? state.content.slice(0, 50) + "..." : state.content}
      </Text>
      
      {/* Version indicator */}
      <Text
        position={[0, -1.3, 0.2]}
        fontSize={0.2}
        color="#64b5f6"
        anchorX="center"
        anchorY="middle"
      >
        {`Version: ${state.version}`}
      </Text>
      
      {/* Commands floating around document */}
      {visibleCommands.map((command, index) => {
        const angle = (index / maxCommands) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = index * 0.3 - (maxCommands * 0.15);
        
        return (
          <group key={command.id}>
            {/* Command box */}
            <mesh position={[x, y, z]}>
              <boxGeometry args={[1.5, 0.8, 0.4]} />
              <meshStandardMaterial 
                color={command.executed ? '#00ff00' : '#64b5f6'}
                emissive={command.executed ? '#001100' : '#000011'}
                opacity={command.executed ? 1 : 0.7}
                transparent
              />
            </mesh>
            
            {/* Command label */}
            <Text
              position={[x, y, z + 0.3]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {command.name}
            </Text>
            
            {/* Connection line to document */}
            {command.executed && (
              <line>
                <bufferGeometry>
                  {(() => {
                    const points = [
                      new THREE.Vector3(0, 0, 0),
                      new THREE.Vector3(x, y, z)
                    ];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    return React.createElement('primitive', { object: geometry });
                  })()}
                </bufferGeometry>
                <lineBasicMaterial 
                  color="#00ff00"
                  opacity={0.6}
                  transparent
                />
              </line>
            )}
          </group>
        );
      })}
      
      {/* Undo stack visualization */}
      <mesh position={[-6, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, state.undoStack.length * 0.5 + 0.5]} />
        <meshStandardMaterial 
          color="#ffb74d"
          opacity={0.7}
          transparent
        />
      </mesh>
      
      <Text
        position={[-6, state.undoStack.length * 0.25 + 1, 0]}
        fontSize={0.3}
        color="#ffb74d"
        anchorX="center"
        anchorY="middle"
      >
        Undo Stack
      </Text>
      
      {/* Redo stack visualization */}
      <mesh position={[6, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, state.redoStack.length * 0.5 + 0.5]} />
        <meshStandardMaterial 
          color="#4fc3f7"
          opacity={0.7}
          transparent
        />
      </mesh>
      
      <Text
        position={[6, state.redoStack.length * 0.25 + 1, 0]}
        fontSize={0.3}
        color="#4fc3f7"
        anchorX="center"
        anchorY="middle"
      >
        Redo Stack
      </Text>
    </>
  );
};

// Main component
const Lesson45_CommandPattern: React.FC = () => {
  const [state, setState] = useState<DocumentState>({
    content: "Hello World!",
    cursor: 12,
    version: 1,
    commands: [],
    undoStack: [],
    redoStack: []
  });

  const commandIdCounter = useRef(1);

  const executeCommand = useCallback((commandName: string, description: string, 
                                    execute: () => void, undoAction?: string) => {
    const commandId = (commandIdCounter.current++).toString();
    const timestamp = new Date().toLocaleTimeString();
    
    // Save current state for undo if undoable
    let undoData: string = '';
    if (undoAction) {
      undoData = JSON.stringify({
        content: state.content,
        cursor: state.cursor,
        version: state.version
      });
    }
    
    // Execute the command
    execute();
    
    // Add to command history
    const newCommand: Command = {
      id: commandId,
      name: commandName,
      description,
      executed: true,
      timestamp,
      undoable: !!undoAction
    };
    
    setState(prev => ({
      ...prev,
      commands: [...prev.commands, newCommand],
      undoStack: undoAction ? [...prev.undoStack, undoData] : prev.undoStack,
      redoStack: [], // Clear redo stack on new command
      version: prev.version + 1
    }));
  }, [state.content, state.cursor, state.version]);

  const insertText = useCallback((text: string) => {
    executeCommand(
      `Insert "${text}"`,
      `Insert text "${text}" at position ${state.cursor}`,
      () => {
        setState(prev => ({
          ...prev,
          content: prev.content.slice(0, prev.cursor) + text + prev.content.slice(prev.cursor),
          cursor: prev.cursor + text.length
        }));
      },
      'delete'
    );
  }, [state.cursor, executeCommand]);

  const deleteText = useCallback((count: number) => {
    if (state.cursor === 0) return;
    
    const deleteCount = Math.min(count, state.cursor);
    executeCommand(
      `Delete ${deleteCount} chars`,
      `Delete ${deleteCount} characters before cursor`,
      () => {
        setState(prev => ({
          ...prev,
          content: prev.content.slice(0, prev.cursor - deleteCount) + prev.content.slice(prev.cursor),
          cursor: Math.max(0, prev.cursor - deleteCount)
        }));
      },
      'insert'
    );
  }, [state.cursor, executeCommand]);

  const moveCursor = useCallback((position: number) => {
    const newPos = Math.max(0, Math.min(position, state.content.length));
    executeCommand(
      `Move cursor to ${newPos}`,
      `Move cursor to position ${newPos}`,
      () => {
        setState(prev => ({
          ...prev,
          cursor: newPos
        }));
      }
    );
  }, [state.content.length, executeCommand]);

  const undo = useCallback(() => {
    if (state.undoStack.length === 0) return;
    
    const lastState = state.undoStack[state.undoStack.length - 1];
    if (!lastState) return;
    const parsedState = JSON.parse(lastState);
    
    // Save current state to redo stack
    const currentState = JSON.stringify({
      content: state.content,
      cursor: state.cursor,
      version: state.version
    });
    
    setState(prev => ({
      ...prev,
      content: parsedState.content,
      cursor: parsedState.cursor,
      version: parsedState.version,
      undoStack: prev.undoStack.slice(0, -1),
      redoStack: [...prev.redoStack, currentState]
    }));
  }, [state.undoStack, state.content, state.cursor, state.version]);

  const redo = useCallback(() => {
    if (state.redoStack.length === 0) return;
    
    const nextState = state.redoStack[state.redoStack.length - 1];
    if (!nextState) return;
    const parsedState = JSON.parse(nextState);
    
    // Save current state to undo stack
    const currentState = JSON.stringify({
      content: state.content,
      cursor: state.cursor,
      version: state.version
    });
    
    setState(prev => ({
      ...prev,
      content: parsedState.content,
      cursor: parsedState.cursor,
      version: parsedState.version,
      undoStack: [...prev.undoStack, currentState],
      redoStack: prev.redoStack.slice(0, -1)
    }));
  }, [state.redoStack, state.content, state.cursor, state.version]);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      commands: [],
      undoStack: [],
      redoStack: []
    }));
  }, []);

  const resetDocument = useCallback(() => {
    setState({
      content: "Hello World!",
      cursor: 12,
      version: 1,
      commands: [],
      undoStack: [],
      redoStack: []
    });
    commandIdCounter.current = 1;
  }, []);

  return (
    <Container>
      <Header>
        <Title>Lección 45: Command Pattern con unique_ptr</Title>
        <Subtitle>Deshacer/Rehacer con Gestión Automática de Memoria</Subtitle>
      </Header>

      <MainContent>
        <VisualizationPanel>
          <Canvas camera={{ position: [10, 5, 10], fov: 60 }}>
            <CommandVisualization state={state} />
            <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          </Canvas>
        </VisualizationPanel>

        <ControlPanel>
          <TheorySection>
            <h3>⚙️ Command Pattern con unique_ptr</h3>
            <p>
              El Command Pattern encapsula operaciones como objetos, permitiendo 
              deshacer/rehacer, logging, y transacciones. Con unique_ptr garantizamos 
              gestión automática de memoria para los comandos.
            </p>
            
            <CodeBlock>{`// Base command interface
class Command {
public:
    virtual ~Command() = default;
    virtual void execute() = 0;
    virtual void undo() = 0;
    virtual std::string description() const = 0;
};

// Concrete command implementation
class InsertCommand : public Command {
private:
    std::string text_;
    size_t position_;
    Document* document_;
    
public:
    InsertCommand(Document* doc, std::string text, size_t pos)
        : document_(doc), text_(std::move(text)), position_(pos) {}
    
    void execute() override {
        document_->insertAt(position_, text_);
    }
    
    void undo() override {
        document_->deleteAt(position_, text_.length());
    }
    
    std::string description() const override {
        return "Insert '" + text_ + "' at " + std::to_string(position_);
    }
};

// Command manager with unique_ptr
class CommandManager {
private:
    std::vector<std::unique_ptr<Command>> history_;
    size_t current_index_ = 0;
    
public:
    void execute(std::unique_ptr<Command> cmd) {
        cmd->execute();
        
        // Clear any redo history
        history_.erase(history_.begin() + current_index_, history_.end());
        
        // Add new command
        history_.push_back(std::move(cmd));
        current_index_ = history_.size();
    }
    
    bool canUndo() const {
        return current_index_ > 0;
    }
    
    bool canRedo() const {
        return current_index_ < history_.size();
    }
    
    void undo() {
        if (canUndo()) {
            history_[--current_index_]->undo();
        }
    }
    
    void redo() {
        if (canRedo()) {
            history_[current_index_++]->execute();
        }
    }
};`}</CodeBlock>
          </TheorySection>

          <div>
            <h4>⚙️ Control del Editor</h4>
            
            <div>
              <label>Texto a insertar:</label>
              <Button onClick={() => insertText(" C++")}>
                Insertar " C++"
              </Button>
              <Button onClick={() => insertText("!")}>
                Insertar "!"
              </Button>
              <Button onClick={() => insertText(" Programming")}>
                Insertar " Programming"
              </Button>
            </div>

            <div>
              <Button onClick={() => deleteText(1)}>
                Borrar 1 carácter
              </Button>
              <Button onClick={() => deleteText(5)}>
                Borrar 5 caracteres
              </Button>
            </div>

            <div>
              <Button onClick={() => moveCursor(0)}>
                Cursor al inicio
              </Button>
              <Button onClick={() => moveCursor(state.content.length)}>
                Cursor al final
              </Button>
            </div>

            <div>
              <Button 
                onClick={undo} 
                disabled={state.undoStack.length === 0}
              >
                ↶ Deshacer
              </Button>
              <Button 
                onClick={redo}
                disabled={state.redoStack.length === 0}
              >
                ↷ Rehacer
              </Button>
            </div>

            <Button onClick={clearHistory}>
              🗑️ Limpiar Historial
            </Button>
            <Button onClick={resetDocument}>
              🔄 Reset Documento
            </Button>
          </div>

          <StatusPanel>
            <h4>📄 Estado del Documento</h4>
            <div>Contenido: "{state.content}"</div>
            <div>Posición cursor: {state.cursor}</div>
            <div>Versión: {state.version}</div>
            <div>Comandos ejecutados: {state.commands.length}</div>
            <div>Comandos en undo stack: {state.undoStack.length}</div>
            <div>Comandos en redo stack: {state.redoStack.length}</div>
          </StatusPanel>

          <div>
            <h4>📋 Historial de Comandos</h4>
            {state.commands.slice(-5).map(command => (
              <CommandCard key={command.id} executed={command.executed}>
                <h5>{command.name}</h5>
                <p>{command.description}</p>
                {command.timestamp && <p>Ejecutado: {command.timestamp}</p>}
              </CommandCard>
            ))}
          </div>

          {state.undoStack.length > 0 && (
            <div>
              <h4>↶ Undo Stack</h4>
              <UndoStack>
                {state.undoStack.slice(-3).map((item, index) => {
                  const parsed = JSON.parse(item);
                  return (
                    <UndoItem key={index}>
                      Version {parsed.version}: "{parsed.content.slice(0, 30)}{parsed.content.length > 30 ? '...' : ''}"
                    </UndoItem>
                  );
                })}
              </UndoStack>
            </div>
          )}

          <TheorySection>
            <h4>🏗️ Macro Commands (Composite)</h4>
            <CodeBlock>{`// Macro command que agrupa múltiples comandos
class MacroCommand : public Command {
private:
    std::vector<std::unique_ptr<Command>> commands_;
    std::string description_;
    
public:
    MacroCommand(std::string desc) : description_(std::move(desc)) {}
    
    void addCommand(std::unique_ptr<Command> cmd) {
        commands_.push_back(std::move(cmd));
    }
    
    void execute() override {
        for (auto& cmd : commands_) {
            cmd->execute();
        }
    }
    
    void undo() override {
        // Undo en orden reverso
        for (auto it = commands_.rbegin(); it != commands_.rend(); ++it) {
            (*it)->undo();
        }
    }
    
    std::string description() const override {
        return description_ + " (" + std::to_string(commands_.size()) + " operations)";
    }
};

// Factory para crear comandos complejos
class CommandFactory {
public:
    static std::unique_ptr<Command> createInsert(
        Document* doc, std::string text, size_t pos) {
        return std::make_unique<InsertCommand>(doc, std::move(text), pos);
    }
    
    static std::unique_ptr<Command> createFormatParagraph(
        Document* doc, size_t start, size_t end) {
        auto macro = std::make_unique<MacroCommand>("Format Paragraph");
        
        // Añadir comandos individuales
        macro->addCommand(createInsert(doc, "\\n", start));
        macro->addCommand(createInsert(doc, "    ", start + 1));
        macro->addCommand(createInsert(doc, "\\n", end + 5));
        
        return std::move(macro);
    }
};`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>💡 Ventajas del Smart Pointer Command</h4>
            <ul>
              <li><strong>RAII automático:</strong> Comandos se limpian automáticamente</li>
              <li><strong>Exception safety:</strong> No memory leaks en caso de excepción</li>
              <li><strong>Move semantics:</strong> Transferencia eficiente de ownership</li>
              <li><strong>Type safety:</strong> unique_ptr previene doble-delete</li>
              <li><strong>Polymorphism:</strong> Diferentes tipos de comando sin slicing</li>
            </ul>
          </TheorySection>

          <TheorySection>
            <h4>⚠️ Consideraciones de Implementación</h4>
            <CodeBlock>{`// Thread-safe command manager
class ThreadSafeCommandManager {
private:
    std::vector<std::unique_ptr<Command>> history_;
    size_t current_index_ = 0;
    mutable std::mutex mutex_;
    
public:
    void execute(std::unique_ptr<Command> cmd) {
        std::lock_guard<std::mutex> lock(mutex_);
        cmd->execute();
        
        history_.erase(history_.begin() + current_index_, history_.end());
        history_.push_back(std::move(cmd));
        current_index_ = history_.size();
    }
    
    // Memory management para historiales largos
    void trimHistory(size_t max_size) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (history_.size() > max_size) {
            size_t to_remove = history_.size() - max_size;
            history_.erase(history_.begin(), 
                          history_.begin() + to_remove);
            current_index_ = std::min(current_index_, history_.size());
        }
    }
};

// Persistent command logging
class PersistentCommandManager {
private:
    std::ofstream log_file_;
    
public:
    void execute(std::unique_ptr<Command> cmd) {
        // Log command before execution
        log_file_ << "EXECUTE: " << cmd->description() 
                 << " at " << std::time(nullptr) << std::endl;
        
        try {
            cmd->execute();
            log_file_ << "SUCCESS" << std::endl;
        } catch (const std::exception& e) {
            log_file_ << "ERROR: " << e.what() << std::endl;
            throw;
        }
    }
};`}</CodeBlock>
          </TheorySection>

          <TheorySection>
            <h4>🎯 Casos de Uso Comunes</h4>
            <ul>
              <li><strong>Text editors:</strong> Undo/redo de operaciones de edición</li>
              <li><strong>Graphics software:</strong> Historial de transformaciones</li>
              <li><strong>Database transactions:</strong> Rollback de operaciones</li>
              <li><strong>Game engines:</strong> Replay de acciones del jugador</li>
              <li><strong>Configuration managers:</strong> Aplicar/revertir configuraciones</li>
              <li><strong>Batch processing:</strong> Queueing y scheduling de tareas</li>
            </ul>
          </TheorySection>
        </ControlPanel>
      </MainContent>
    </Container>
  );
};

export default Lesson45_CommandPattern;