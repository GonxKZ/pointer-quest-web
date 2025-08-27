export const spanishTranslations = {
  navbar: {
    title: 'Pointer Quest',
    lessons: 'Lecciones',
    visualization3D: 'Visualización 3D',
    progress: 'Progreso',
  },
  common: {
    loading: 'Cargando...',
    error: 'Ha ocurrido un error',
    tryAgain: 'Intentar de nuevo',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    close: 'Cerrar',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
  },
  lessons: {
    title: 'Lecciones de Punteros C++',
    description: 'Explora conceptos avanzados de punteros en C++',
    objective: 'Dominar la gestión de memoria y punteros',
    completed: 'Completado',
    inProgress: 'En progreso',
    locked: 'Bloqueado',
    startLesson: 'Comenzar lección',
    continueLesson: 'Continuar lección',
    nextLesson: 'Siguiente lección',
    previousLesson: 'Lección anterior',
    lessonComplete: 'Lección completada',
    allLessonsComplete: 'Todas las lecciones completadas',
  },
  ui: {
    languageSwitch: {
      english: 'Cambiar a Inglés',
      spanish: 'Cambiar a Español'
    },
    buttons: {
      start: 'Comenzar',
      next: 'Siguiente',
      previous: 'Anterior',
      restart: 'Reiniciar',
      play: 'Reproducir',
      pause: 'Pausar',
      stop: 'Detener',
      reset: 'Reiniciar',
      copy: 'Copiar',
      paste: 'Pegar',
      cut: 'Cortar',
      undo: 'Deshacer',
      redo: 'Rehacer'
    },
    performance: {
      fps: 'FPS',
      memory: 'Memoria',
      renderTime: 'Tiempo de Renderizado',
      drawCalls: 'Llamadas de Dibujo',
      triangles: 'Triángulos',
      performance: 'Rendimiento',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo'
    },
    errors: {
      title: 'Error',
      generalError: 'Ha ocurrido un error inesperado',
      networkError: 'Error de conexión',
      loadingError: 'Error al cargar',
      renderError: 'Error de renderizado',
      compilationError: 'Error de compilación',
      memoryError: 'Error de memoria',
      retry: 'Intentar de nuevo',
      report: 'Reportar error',
      details: 'Detalles del error'
    }
  },
  terminology: {
    pointer: 'Puntero',
    memory: 'Memoria',
    address: 'Dirección de memoria',
    reference: 'Referencia',
    smartPointer: 'Puntero inteligente',
    sharedPointer: 'Puntero compartido',
    uniquePointer: 'Puntero único',
    weakPointer: 'Puntero débil',
    rawPointer: 'Puntero raw',
    nullPointer: 'Puntero nulo',
    danglingPointer: 'Puntero colgante',
    wildPointer: 'Puntero salvaje',
    pointerArithmetic: 'Aritmética de punteros',
    pointerToPointer: 'Puntero a puntero',
    functionPointer: 'Puntero a función',
    stack: 'Pila',
    heap: 'Montón',
    allocation: 'Asignación',
    deallocation: 'Liberación',
    memoryLeak: 'Fuga de memoria',
    memoryLeaks: 'Fugas de memoria',
    memoryManagement: 'Gestión de memoria',
    raii: 'RAII (Adquisición de Recursos es Inicialización)',
    constructor: 'Constructor',
    destructor: 'Destructor',
    copyConstructor: 'Constructor de copia',
    moveConstructor: 'Constructor de movimiento',
    copyAssignment: 'Asignación de copia',
    moveAssignment: 'Asignación de movimiento',
    referenceCount: 'Contador de referencias',
    ownership: 'Propiedad',
    lifetime: 'Tiempo de vida',
    scope: 'Ámbito',
    dereferencing: 'Desreferenciación',
    addressOf: 'Dirección de',
    sizeof: 'Tamaño de',
    const: 'Constante',
    mutable: 'Mutable',
    static: 'Estático',
    dynamic: 'Dinámico'
  },
  
  // Specific lesson translations
  lessonContent: {
    lesson01: {
      title: 'Punteros Básicos en C++',
      description: 'Introducción fundamental a los punteros: qué son, cómo declararlos y usar',
      objective: 'Comprender los conceptos básicos de punteros y direcciones de memoria',
      keyPoints: [
        'Qué son los punteros y por qué son importantes',
        'Declaración y inicialización de punteros',
        'Operadores de dirección (&) y desreferenciación (*)',
        'Diferencia entre valor y dirección de memoria'
      ]
    },
    lesson02: {
      title: 'Punteros Nulos (nullptr)',
      description: 'Aprende a usar nullptr de forma segura y evitar errores comunes',
      objective: 'Dominar el uso correcto de punteros nulos y verificaciones de seguridad',
      keyPoints: [
        'Introducción a nullptr vs NULL vs 0',
        'Verificación de punteros antes del acceso',
        'Patrones de uso seguro de punteros',
        'Prevención de errores de punteros nulos'
      ]
    },
    lesson03: {
      title: 'Punteros Colgantes',
      description: 'Identifica y previene problemas con punteros colgantes',
      objective: 'Reconocer y evitar los peligros de los punteros colgantes',
      keyPoints: [
        'Qué son los punteros colgantes',
        'Causas comunes de punteros colgantes',
        'Cómo detectar y prevenir este problema',
        'Mejores prácticas para la gestión de memoria'
      ]
    },
    lesson37: {
      title: 'Ciclos de Referencias con shared_ptr',
      description: 'Aprende a identificar y resolver problemas de ciclos de referencias',
      objective: 'Comprender y solucionar ciclos de referencias que pueden causar fugas de memoria',
      keyPoints: [
        'Problema: Ciclo de referencias',
        'Solución: weak_ptr',
        'Patrón Parent-Child'
      ]
    }
  },
  
  // 3D Visualization translations
  visualization3D: {
    title: 'Visualización 3D de Punteros',
    description: 'Explora los conceptos de punteros en un entorno 3D interactivo',
    controls: {
      rotate: 'Rotar',
      zoom: 'Zoom',
      pan: 'Panorámica',
      reset: 'Restablecer vista',
      showGrid: 'Mostrar rejilla',
      showLabels: 'Mostrar etiquetas',
      animate: 'Animar',
      autoRotate: 'Rotación automática'
    },
    objects: {
      memoryBlock: 'Bloque de memoria',
      pointer: 'Puntero',
      reference: 'Referencia',
      array: 'Array',
      stack: 'Pila',
      heap: 'Montón',
      global: 'Global'
    },
    animations: {
      allocation: 'Asignación de memoria',
      deallocation: 'Liberación de memoria',
      pointerAssignment: 'Asignación de puntero',
      dereferencing: 'Desreferenciación',
      copying: 'Copia',
      moving: 'Movimiento'
    }
  },
  
  // Performance monitoring translations
  performance: {
    monitor: 'Monitor de Rendimiento',
    fps: 'FPS (Fotogramas por segundo)',
    memory: 'Uso de memoria',
    renderTime: 'Tiempo de renderizado',
    frameTime: 'Tiempo por fotograma',
    drawCalls: 'Llamadas de dibujo',
    triangles: 'Triángulos renderizados',
    performance: 'Rendimiento',
    excellent: 'Excelente',
    good: 'Bueno',
    fair: 'Regular',
    poor: 'Pobre',
    settings: {
      quality: 'Calidad',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      autoAdjust: 'Ajuste automático',
      vsync: 'Sincronización vertical',
      antialiasing: 'Suavizado de bordes'
    }
  }
};