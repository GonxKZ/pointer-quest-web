import { useState, useEffect, useCallback, useRef } from 'react';

// Tipos profesionales para el motor WebAssembly
interface PointerData {
  id: string;
  start_x: number;
  start_y: number;
  start_z: number;
  end_x: number;
  end_y: number;
  end_z: number;
  color: string;
  thickness: number;
  animated: boolean;
}

interface MemoryBlockData {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  value?: string;
  memory_type: string;
}

interface WebAssemblyEngine {
  add_pointer: (pointer: PointerData) => void;
  add_memory_block: (block: MemoryBlockData) => void;
  remove_pointer: (id: string) => void;
  remove_memory_block: (id: string) => void;
  update_pointer_position: (id: string, end_x: number, end_y: number, end_z: number) => void;
  animate: (delta_time: number) => void;
  render: (canvas_id: string) => Promise<void>;
  get_pointer_count: () => number;
  get_memory_block_count: () => number;
  set_animation_speed: (speed: number) => void;
  reset: () => void;
}

interface UseWebAssemblyReturn {
  engine: WebAssemblyEngine | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addPointer: (pointer: PointerData) => void;
  addMemoryBlock: (block: MemoryBlockData) => void;
  animate: (deltaTime: number) => void;
  render: (canvasId: string) => Promise<void>;
  reset: () => void;
  getPointerCount: () => number;
  getMemoryBlockCount: () => number;
  setAnimationSpeed: (speed: number) => void;
}

export function useWebAssembly(): UseWebAssemblyReturn {
  const [engine, setEngine] = useState<WebAssemblyEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const wasmModuleRef = useRef<any>(null); // Not used in fallback mode
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isInitializedRef = useRef(false);

  // Función de inicialización profesional
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) {
      return; // Evitar inicialización múltiple
    }

    try {
      setIsLoading(true);
      setError(null);

      // WebAssembly module not available, using fallback engine
      // console.log('🎯 Using fallback engine (WebAssembly not compiled)');

      // Crear motor simulado como fallback
      const fallbackEngine: WebAssemblyEngine = {
        add_pointer: (pointer: PointerData) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          // console.log('Fallback: Adding pointer', pointer);
        },
        add_memory_block: (block: MemoryBlockData) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          // console.log('Fallback: Adding memory block', block);
        },
        remove_pointer: (id: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          // console.log('Fallback: Removing pointer', id);
        },
        remove_memory_block: (id: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          // console.log('Fallback: Removing memory block', id);
        },
        update_pointer_position: (id: string, end_x: number, end_y: number, end_z: number) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          // console.log('Fallback: Updating pointer position', { id, end_x, end_y, end_z });
        },
        animate: (delta_time: number) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          // Simular animación
        },
        render: async (canvas_id: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          // Simular renderizado
          await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
        },
        get_pointer_count: () => 0,
        get_memory_block_count: () => 0,
        set_animation_speed: (speed: number) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          // console.log('Fallback: Setting animation speed', speed);
        },
        reset: () => {
          // console.log('Fallback: Resetting engine');
        }
      };

      setEngine(fallbackEngine);

      isInitializedRef.current = true;
      setIsLoading(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to initialize WebAssembly engine: ${errorMessage}`);
      setIsLoading(false);
      // console.error('Failed to initialize WebAssembly engine:', err);
    }
  }, []);

  // Funciones profesionales con manejo de errores
  const addPointer = useCallback((pointer: PointerData) => {
    if (engine) {
      try {
        engine.add_pointer(pointer);
      } catch (err) {
        // console.error('Error adding pointer:', err);
        setError('Error adding pointer to engine');
      }
    } else {
      // console.warn('Engine not initialized, cannot add pointer');
    }
  }, [engine]);

  const addMemoryBlock = useCallback((block: MemoryBlockData) => {
    if (engine) {
      try {
        engine.add_memory_block(block);
      } catch (err) {
        // console.error('Error adding memory block:', err);
        setError('Error adding memory block to engine');
      }
    } else {
      // console.warn('Engine not initialized, cannot add memory block');
    }
  }, [engine]);

  const animate = useCallback((deltaTime: number) => {
    if (engine) {
      try {
        engine.animate(deltaTime);
      } catch (err) {
        // console.error('Error animating:', err);
        setError('Error during animation');
      }
    }
  }, [engine]);

  const render = useCallback(async (canvasId: string) => {
    if (engine) {
      try {
        await engine.render(canvasId);
      } catch (err) {
        // console.error('Error rendering:', err);
        setError('Error during rendering');
      }
    }
  }, [engine]);

  const reset = useCallback(() => {
    if (engine) {
      try {
        engine.reset();
      } catch (err) {
        // console.error('Error resetting engine:', err);
        setError('Error resetting engine');
      }
    }

    // Cancelar frames de animación
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, [engine]);

  const getPointerCount = useCallback(() => {
    return engine ? engine.get_pointer_count() : 0;
  }, [engine]);

  const getMemoryBlockCount = useCallback(() => {
    return engine ? engine.get_memory_block_count() : 0;
  }, [engine]);

  const setAnimationSpeed = useCallback((speed: number) => {
    if (engine) {
      try {
        engine.set_animation_speed(speed);
      } catch (err) {
        // console.error('Error setting animation speed:', err);
        setError('Error setting animation speed');
      }
    }
  }, [engine]);

  // Inicializar automáticamente
  useEffect(() => {
    initialize();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (engine) {
        try {
          engine.reset();
        } catch (err) {
          // console.error('Error during cleanup:', err);
        }
      }
    };
  }, [initialize, engine]);

  return {
    engine,
    isLoading,
    error,
    initialize,
    addPointer,
    addMemoryBlock,
    animate,
    render,
    reset,
    getPointerCount,
    getMemoryBlockCount,
    setAnimationSpeed,
  };
}

// Hook específico para animaciones continuas
export function useAnimationLoop(
  onAnimate: (deltaTime: number) => void,
  isActive: boolean = true
) {
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convertir a segundos
      lastTimeRef.current = currentTime;

      onAnimate(deltaTime);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onAnimate, isActive]);

  return {
    stop: () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };
}
