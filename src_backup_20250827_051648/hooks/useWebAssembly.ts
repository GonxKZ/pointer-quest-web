import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

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
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isInitializedRef = useRef(false);

  // Enhanced initialization with proper fallback and monitoring
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) {
      return; // Evitar inicialización múltiple
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to load WebAssembly module first
      let wasmEngine: WebAssemblyEngine | null = null;
      
      try {
        // Attempt to load WASM module
        const wasmModule = await import('../wasm/pointer_quest_wasm');
        await wasmModule.default();
        
        wasmEngine = {
          add_pointer: wasmModule.add_pointer,
          add_memory_block: wasmModule.add_memory_block,
          remove_pointer: wasmModule.remove_pointer,
          remove_memory_block: wasmModule.remove_memory_block,
          update_pointer_position: wasmModule.update_pointer_position,
          animate: wasmModule.animate,
          render: wasmModule.render,
          get_pointer_count: wasmModule.get_pointer_count,
          get_memory_block_count: wasmModule.get_memory_block_count,
          set_animation_speed: wasmModule.set_animation_speed,
          reset: wasmModule.reset
        };
        
        logger.log('✅ WebAssembly engine loaded successfully');
      } catch (wasmError) {
        logger.warn('⚠️ WebAssembly loading failed, using JavaScript fallback:', wasmError);
      }

      // Enhanced fallback engine with actual functionality
      const fallbackEngine: WebAssemblyEngine = {
        _pointers: new Map<string, PointerData>(),
        _memoryBlocks: new Map<string, MemoryBlockData>(),
        _animationSpeed: 1.0,
        
        add_pointer(pointer: PointerData) {
          this._pointers.set(pointer.id, { ...pointer });
        },
        add_memory_block(block: MemoryBlockData) {
          this._memoryBlocks.set(block.id, { ...block });
        },
        remove_pointer(id: string) {
          this._pointers.delete(id);
        },
        remove_memory_block(id: string) {
          this._memoryBlocks.delete(id);
        },
        update_pointer_position(id: string, end_x: number, end_y: number, end_z: number) {
          const pointer = this._pointers.get(id);
          if (pointer) {
            pointer.end_x = end_x;
            pointer.end_y = end_y;
            pointer.end_z = end_z;
          }
        },
        animate(_delta_time: number) {
          // Implement basic animation logic for fallback
          const time = performance.now() * 0.001 * this._animationSpeed;
          this._pointers.forEach((pointer) => {
            if (pointer.animated) {
              // Simple sine wave animation
              const offset = Math.sin(time * 2) * 0.1;
              pointer.end_y += offset;
            }
          });
        },
        async render(canvas_id: string) {
          // Simulate rendering with performance monitoring
          const start = performance.now();
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              // Basic rendering simulation
              const canvas = document.getElementById(canvas_id) as HTMLCanvasElement;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  // Draw simple representations
                  this._memoryBlocks.forEach((block, _id) => {
                    ctx.fillStyle = block.color;
                    ctx.fillRect(block.x * 10, block.y * 10, block.width * 10, block.height * 10);
                  });
                }
              }
              resolve(undefined);
            });
          });
          
          const renderTime = performance.now() - start;
          if (renderTime > 16.67) { // Alert if frame time > 60fps
            logger.warn(`⚠️ Slow render frame: ${renderTime.toFixed(2)}ms`);
          }
        },
        get_pointer_count() {
          return this._pointers.size;
        },
        get_memory_block_count() {
          return this._memoryBlocks.size;
        },
        set_animation_speed(speed: number) {
          this._animationSpeed = Math.max(0.1, Math.min(5.0, speed));
        },
        reset() {
          this._pointers.clear();
          this._memoryBlocks.clear();
          this._animationSpeed = 1.0;
        }
      } as WebAssemblyEngine;

      setEngine(wasmEngine || fallbackEngine);

      isInitializedRef.current = true;
      setIsLoading(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to initialize WebAssembly engine: ${errorMessage}`);
      setIsLoading(false);
    }
  }, []);

  // Funciones profesionales con manejo de errores
  const addPointer = useCallback((pointer: PointerData) => {
    if (engine) {
      try {
        engine.add_pointer(pointer);
      } catch (err) {
        setError('Error adding pointer to engine');
      }
    } else {
    }
  }, [engine]);

  const addMemoryBlock = useCallback((block: MemoryBlockData) => {
    if (engine) {
      try {
        engine.add_memory_block(block);
      } catch (err) {
        setError('Error adding memory block to engine');
      }
    } else {
    }
  }, [engine]);

  const animate = useCallback((deltaTime: number) => {
    if (engine) {
      try {
        engine.animate(deltaTime);
      } catch (err) {
        setError('Error during animation');
      }
    }
  }, [engine]);

  const render = useCallback(async (canvasId: string) => {
    if (engine) {
      try {
        await engine.render(canvasId);
      } catch (err) {
        setError('Error during rendering');
      }
    }
  }, [engine]);

  const reset = useCallback(() => {
    if (engine) {
      try {
        engine.reset();
      } catch (err) {
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
