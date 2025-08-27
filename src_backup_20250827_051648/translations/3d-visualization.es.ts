export const Visualization3DSpanish = {
  // Tipos de memoria
  memoryTypes: {
    stack: 'PILA',
    heap: 'MONTÓN',
    global: 'GLOBAL',
    static: 'ESTÁTICO',
    const: 'CONSTANTE'
  },
  
  // Etiquetas de objetos
  objects: {
    memoryBlock: 'Bloque de Memoria',
    pointer: 'Puntero',
    reference: 'Referencia',
    array: 'Array',
    variable: 'Variable',
    function: 'Función',
    object: 'Objeto'
  },
  
  // Estados de punteros
  pointerStates: {
    valid: 'VÁLIDO',
    owns: 'POSEE',
    null: 'NULO',
    moved: 'MOVIDO',
    dangling: 'COLGANTE',
    wild: 'SALVAJE',
    initialized: 'INICIALIZADO',
    uninitialized: 'NO INICIALIZADO',
    shared: 'COMPARTIDO',
    observing: 'OBSERVANDO',
    expired: 'EXPIRADO'
  },
  
  // Tipos de punteros
  pointerTypes: {
    raw: 'Puntero Raw',
    unique: 'unique_ptr',
    shared: 'shared_ptr',
    weak: 'weak_ptr',
    smart: 'Puntero Inteligente'
  },
  
  // Operaciones
  operations: {
    allocation: 'Asignación',
    deallocation: 'Liberación',
    assignment: 'Asignación',
    dereference: 'Desreferencia',
    addressOf: 'Dirección de',
    copying: 'Copia',
    moving: 'Movimiento',
    increment: 'Incremento',
    decrement: 'Decremento'
  },
  
  // Animaciones
  animations: {
    allocating: 'Asignando memoria...',
    deallocating: 'Liberando memoria...',
    pointing: 'Apuntando a...',
    dereferencing: 'Desreferenciando...',
    copying: 'Copiando...',
    moving: 'Moviendo...',
    incrementing: 'Incrementando contador...',
    decrementing: 'Decrementando contador...'
  },
  
  // Controles de visualización
  controls: {
    rotate: 'Rotar Vista',
    zoom: 'Hacer Zoom',
    pan: 'Mover Vista',
    reset: 'Restablecer Vista',
    start: 'Iniciar',
    stop: 'Detener',
    play: 'Reproducir',
    pause: 'Pausar',
    next: 'Siguiente',
    previous: 'Anterior',
    showGrid: 'Mostrar Rejilla',
    showLabels: 'Mostrar Etiquetas',
    showAddresses: 'Mostrar Direcciones',
    animate: 'Activar Animación',
    autoRotate: 'Rotación Automática',
    performance: 'Modo Rendimiento'
  },
  
  // Información de estado
  status: {
    memoryUsage: 'Uso de Memoria',
    objectCount: 'Cantidad de Objetos',
    pointerCount: 'Cantidad de Punteros',
    referenceCount: 'Contador de Referencias',
    performance: 'Rendimiento',
    fps: 'FPS',
    renderTime: 'Tiempo de Renderizado'
  },
  
  // Mensajes informativos
  messages: {
    validPointer: 'Puntero válido apuntando a memoria',
    nullPointer: 'Puntero nulo - no apunta a ninguna ubicación',
    danglingPointer: '¡PELIGRO! Puntero colgante - memoria ya liberada',
    memoryLeak: '¡ADVERTENCIA! Posible fuga de memoria detectada',
    leaked: 'Filtrado',
    safeOperation: 'Operación realizada de forma segura',
    unsafeOperation: '¡PELIGRO! Operación potencialmente insegura',
    objectDestroyed: 'Objeto destruido automáticamente',
    referenceCountZero: 'Contador de referencias llegó a cero',
    outOfBounds: 'FUERA DE LÍMITES',
    safeAccess: 'ACCESO SEGURO',
    constViolation: 'VIOLACIÓN DE CONST'
  },
  
  // Tooltips informativos
  tooltips: {
    memoryBlock: 'Bloque de memoria que contiene datos',
    pointer: 'Variable que almacena una dirección de memoria',
    arrow: 'Representa la relación de apuntado',
    referenceCounter: 'Número de shared_ptr que apuntan a este objeto',
    stackMemory: 'Memoria de pila - gestión automática',
    heapMemory: 'Memoria de montón - gestión manual requerida',
    smartPointer: 'Puntero inteligente con gestión automática de memoria'
  },
  
  // Niveles de detalle (LOD)
  lod: {
    high: 'Detalle Alto',
    medium: 'Detalle Medio',
    low: 'Detalle Bajo',
    auto: 'Automático'
  },
  
  // Códigos de color
  colorCodes: {
    stackMemory: 'Azul - Memoria de Pila',
    heapMemory: 'Naranja - Memoria de Montón',
    globalMemory: 'Verde - Memoria Global',
    validPointer: 'Azul Claro - Puntero Válido',
    nullPointer: 'Gris - Puntero Nulo',
    danglingPointer: 'Rojo - Puntero Colgante',
    smartPointer: 'Dorado - Puntero Inteligente'
  },
  
  // Explicaciones educativas
  educational: {
    basicPointers: {
      title: 'Punteros Básicos',
      description: 'Fundamentos de punteros en C++',
      declaration: 'Declaración de variable y puntero',
      dereference: 'Acceso al valor a través del puntero'
    },
    smartPointers: {
      title: 'Punteros Inteligentes',
      description: 'Gestión automática de memoria',
      uniquePtr: 'Puntero único con gestión automática',
      sharedPtr: 'Puntero compartido con conteo de referencias',
      weakPtr: 'Observador sin propiedad para romper ciclos'
    },
    constCorrectness: {
      title: 'Const Correctness',
      description: 'Inmutabilidad en punteros',
      pointerToConst: 'Puntero que no puede modificar el valor',
      constPointer: 'Puntero que no puede ser reasignado',
      constConstPointer: 'Ni el puntero ni el valor pueden cambiar'
    },
    functionPointers: {
      title: 'Punteros a Función',
      description: 'Selección de funciones en tiempo de ejecución',
      declaration: 'Declaración de puntero a función',
      assignment: 'Asignación de dirección de función',
      invocation: 'Llamada a través del puntero'
    },
    pointerArithmetic: {
      title: 'Aritmética de Punteros',
      description: 'Navegación por arrays usando punteros',
      increment: 'Incremento del puntero al siguiente elemento',
      bounds: 'Verificación de límites del array',
      safety: 'Operaciones seguras vs peligrosas'
    }
  }
};

// Función utilitaria para obtener traducciones con soporte mejorado
export function get3DTranslation(key: string, defaultValue: string = key): string {
  const keys = key.split('.');
  let current: any = Visualization3DSpanish;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return defaultValue;
    }
  }
  
  return typeof current === 'string' ? current : defaultValue;
}

// Función para obtener explicaciones educativas completas
export function getEducationalContent(topic: string, subtopic?: string): any {
  const content = Visualization3DSpanish.educational[topic as keyof typeof Visualization3DSpanish.educational];
  
  if (!content) {
    return {
      title: topic,
      description: 'Concepto educativo de programación',
      details: {}
    };
  }
  
  if (subtopic) {
    return {
      ...content,
      current: content[subtopic as keyof typeof content] || subtopic
    };
  }
  
  return content;
}

// Utilidades adicionales para componentes 3D
export const get3DLabel = (key: string, fallback: string): string => {
  return get3DTranslation(key, fallback);
};

export const get3DStatus = (status: string): string => {
  return get3DTranslation(`status.${status}`, status);
};

export const get3DMessage = (message: string): string => {
  return get3DTranslation(`messages.${message}`, message);
};

export const get3DControl = (control: string): string => {
  return get3DTranslation(`controls.${control}`, control);
};

export default Visualization3DSpanish;