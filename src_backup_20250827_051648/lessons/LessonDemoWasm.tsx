import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useWebAssembly, useAnimationLoop } from '../hooks/useWebAssembly';

const Container = styled.div`
  padding: 2rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  margin: 1rem 0;
`;

const Canvas = styled.canvas`
  border: 2px solid #00d4ff;
  border-radius: 8px;
  background: #000;
  display: block;
  margin: 1rem auto;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(45deg, #00d4ff, #0099cc);
          color: white;
          &:hover { background: linear-gradient(45deg, #0099cc, #006699); }
        `;
      case 'secondary':
        return `
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          color: white;
          &:hover { background: linear-gradient(45deg, #44a08d, #3a8575); }
        `;
      case 'danger':
        return `
          background: linear-gradient(45deg, #ff6b6b, #cc5555);
          color: white;
          &:hover { background: linear-gradient(45deg, #cc5555, #aa4444); }
        `;
      default:
        return `
          background: linear-gradient(45deg, #00d4ff, #0099cc);
          color: white;
          &:hover { background: linear-gradient(45deg, #0099cc, #006699); }
        `;
    }
  }}
`;

const Stats = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 1rem 0;
  color: #00d4ff;
  font-family: 'Fira Code', monospace;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #b8c5d6;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

export default function LessonDemoWasm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    engine,
    isLoading,
    error,
    addPointer,
    addMemoryBlock,
    reset,
    render
  } = useWebAssembly();

  const [pointerCount, setPointerCount] = React.useState(0);
  const [memoryBlockCount, setMemoryBlockCount] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Inicializar elementos de demostración
  useEffect(() => {
    if (!engine) return;

    // Crear algunos punteros de demostración
    const demoPointers = [
      {
        id: "ptr1",
        start_x: 50.0, start_y: 50.0, start_z: 0.0,
        end_x: 200.0, end_y: 150.0, end_z: 0.0,
        color: "#00ff00", thickness: 3.0, animated: true
      },
      {
        id: "ptr2",
        start_x: 300.0, start_y: 100.0, start_z: 0.0,
        end_x: 150.0, end_y: 250.0, end_z: 0.0,
        color: "#ff0000", thickness: 2.0, animated: true
      }
    ];

    // Crear algunos bloques de memoria
    const demoBlocks = [
      {
        id: "block1",
        x: 200.0, y: 150.0, z: 0.0,
        width: 50.0, height: 50.0, depth: 20.0,
        color: "#4ecdc4", value: "int x = 42",
        memory_type: "stack"
      },
      {
        id: "block2",
        x: 150.0, y: 250.0, z: 0.0,
        width: 50.0, height: 50.0, depth: 20.0,
        color: "#ff6b6b", value: "int* ptr",
        memory_type: "heap"
      }
    ];

    demoPointers.forEach(ptr => addPointer(ptr));
    demoBlocks.forEach(block => addMemoryBlock(block));

    setPointerCount(demoPointers.length);
    setMemoryBlockCount(demoBlocks.length);

    // Cleanup
    return () => {
      reset();
    };
  }, [engine, addPointer, addMemoryBlock, reset]);

  // Loop de animación
  useAnimationLoop((deltaTime) => {
    if (!engine || !isAnimating) return;

    try {
      // Actualizar animaciones
      engine.animate(deltaTime);

      // Renderizar si hay canvas
      if (canvasRef.current) {
        render(canvasRef.current.id);
      }

      // Actualizar estadísticas
      setPointerCount(engine.get_pointer_count());
      setMemoryBlockCount(engine.get_memory_block_count());
    } catch (err) {
      // Handle animation error silently in demo
    }
  }, isAnimating);

  const handleStartAnimation = () => {
    setIsAnimating(true);
  };

  const handleStopAnimation = () => {
    setIsAnimating(false);
  };

  const handleAddRandomPointer = () => {
    if (!engine) return;

    const randomId = `ptr${Math.random().toString(36).substr(2, 9)}`;
    const randomPointer = {
      id: randomId,
      start_x: Math.random() * 400,
      start_y: Math.random() * 300,
      start_z: 0.0,
      end_x: Math.random() * 400,
      end_y: Math.random() * 300,
      end_z: 0.0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      thickness: 2.0 + Math.random() * 3.0,
      animated: Math.random() > 0.5
    };

    addPointer(randomPointer);
    setPointerCount(engine.get_pointer_count());
  };

  const handleReset = () => {
    reset();
    setPointerCount(0);
    setMemoryBlockCount(0);
    setIsAnimating(false);
  };

  if (isLoading) {
    return (
      <Container>
        <h3>🎯 Cargando Motor WebAssembly...</h3>
        <p>El motor de animaciones de Rust/WebAssembly se está inicializando.</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <h3>❌ Error en WebAssembly</h3>
        <p>{error}</p>
        <p>Verifica que el módulo WebAssembly esté compilado correctamente.</p>
      </Container>
    );
  }

  return (
    <Container>
      <h3>⚡ Demo Motor WebAssembly + Rust</h3>
      <p>
        Esta demostración muestra el motor de animaciones de alto rendimiento
        desarrollado en Rust y compilado a WebAssembly.
      </p>

      <Canvas
        ref={canvasRef}
        id="wasm-canvas"
        width={400}
        height={300}
      />

      <Stats>
        <Stat>
          <StatLabel>Punteros</StatLabel>
          <StatValue>{pointerCount}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Bloques</StatLabel>
          <StatValue>{memoryBlockCount}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Estado</StatLabel>
          <StatValue>{isAnimating ? '🎬 Animando' : '⏸️ Pausado'}</StatValue>
        </Stat>
      </Stats>

      <Controls>
        <Button onClick={handleStartAnimation} disabled={isAnimating}>
          ▶️ Iniciar Animación
        </Button>
        <Button onClick={handleStopAnimation} disabled={!isAnimating}>
          ⏸️ Pausar
        </Button>
        <Button onClick={handleAddRandomPointer} variant="secondary">
          ➕ Agregar Puntero
        </Button>
        <Button onClick={handleReset} variant="danger">
          🔄 Reset
        </Button>
      </Controls>

      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#b8c5d6' }}>
        <h4>🚀 Características del Motor WebAssembly:</h4>
        <ul>
          <li>• Animaciones en tiempo real a 60 FPS</li>
          <li>• Miles de elementos renderizados eficientemente</li>
          <li>• Memoria gestionada por Rust (sin garbage collection de JS)</li>
          <li>• Comunicación bidireccional entre JavaScript y Rust</li>
          <li>• Performance nativa compilada a WebAssembly</li>
        </ul>
      </div>
    </Container>
  );
}
