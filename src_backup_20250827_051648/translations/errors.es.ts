export const ErrorMessagesSpanish = {
  // Error boundaries
  errorBoundary: {
    title: 'Ha ocurrido un error inesperado',
    description: 'Algo salió mal mientras se ejecutaba la aplicación.',
    technicalDetails: 'Detalles técnicos del error:',
    retry: 'Intentar de nuevo',
    reload: 'Recargar página',
    report: 'Reportar problema',
    goHome: 'Ir al inicio',
    contactSupport: 'Contactar soporte'
  },
  
  // Tipos de errores específicos
  errorTypes: {
    // Errores de WebAssembly
    webAssembly: {
      loadFailed: 'Error al cargar el módulo WebAssembly',
      compilationFailed: 'Error de compilación de WebAssembly',
      executionFailed: 'Error de ejecución de WebAssembly',
      fallbackMode: 'Usando modo de respaldo - algunas funciones limitadas'
    },
    
    // Errores de renderizado 3D
    rendering: {
      webglNotSupported: 'WebGL no está soportado en este navegador',
      contextLost: 'Contexto WebGL perdido - recargando...',
      shaderCompilation: 'Error de compilación de shaders',
      textureLoad: 'Error al cargar texturas',
      geometryLoad: 'Error al cargar geometrías',
      performanceDegradation: 'Rendimiento degradado - reduciendo calidad'
    },
    
    // Errores de memoria y punteros
    memory: {
      allocationFailed: 'Error al asignar memoria',
      nullPointerAccess: 'Intento de acceder a puntero nulo detectado',
      danglingPointer: 'Puntero colgante detectado - operación cancelada',
      memoryLeak: 'Posible fuga de memoria detectada',
      invalidAddress: 'Dirección de memoria inválida',
      bufferOverflow: 'Desbordamiento de buffer detectado'
    },
    
    // Errores de red y carga
    network: {
      connectionFailed: 'Error de conexión de red',
      timeoutError: 'Tiempo de espera agotado',
      resourceNotFound: 'Recurso no encontrado',
      loadingFailed: 'Error al cargar recursos'
    },
    
    // Errores de compilación
    compilation: {
      syntaxError: 'Error de sintaxis en el código',
      typeError: 'Error de tipos',
      linkingError: 'Error de enlazado',
      runtimeError: 'Error en tiempo de ejecución'
    }
  },
  
  // Notificaciones de estado
  notifications: {
    success: {
      lessonCompleted: 'Lección completada exitosamente',
      codeCompiled: 'Código compilado sin errores',
      memoryFreed: 'Memoria liberada correctamente',
      testPassed: 'Prueba superada',
      settingsSaved: 'Configuración guardada'
    },
    
    warning: {
      performanceIssue: 'Problema de rendimiento detectado',
      memoryUsageHigh: 'Uso de memoria alto',
      codeQualityIssue: 'Problema de calidad de código detectado',
      deprecatedFeature: 'Característica obsoleta utilizada',
      browserCompatibility: 'Problema de compatibilidad del navegador'
    },
    
    info: {
      loadingProgress: 'Cargando recursos...',
      savingProgress: 'Guardando progreso...',
      compilingCode: 'Compilando código...',
      executingTests: 'Ejecutando pruebas...',
      optimizingPerformance: 'Optimizando rendimiento...'
    }
  },
  
  // Mensajes de validación
  validation: {
    required: 'Este campo es obligatorio',
    invalidFormat: 'Formato inválido',
    tooShort: 'Demasiado corto',
    tooLong: 'Demasiado largo',
    invalidCharacters: 'Caracteres inválidos',
    mustBeNumber: 'Debe ser un número',
    mustBePositive: 'Debe ser un número positivo',
    invalidEmail: 'Dirección de email inválida',
    passwordWeak: 'La contraseña es demasiado débil'
  },
  
  // Acciones de recuperación
  recovery: {
    automatic: 'Recuperación automática en progreso...',
    manualRequired: 'Se requiere intervención manual',
    retrying: 'Reintentando operación...',
    fallbackActivated: 'Modo de respaldo activado',
    restartRequired: 'Se requiere reinicio',
    contactSupport: 'Contacte al soporte técnico si el problema persiste'
  },
  
  // Códigos de error
  errorCodes: {
    E001: 'Error de inicialización',
    E002: 'Error de configuración',
    E003: 'Error de recursos',
    E004: 'Error de permisos',
    E005: 'Error de compatibilidad',
    E006: 'Error de validación',
    E007: 'Error de red',
    E008: 'Error de tiempo de espera',
    E009: 'Error de memoria',
    E010: 'Error crítico del sistema'
  }
};

// Función utilitaria para obtener mensajes de error
export function getErrorMessage(errorType: string, errorCode?: string): string {
  const keys = errorType.split('.');
  let current: any = ErrorMessagesSpanish;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return `Error: ${errorType}${errorCode ? ` (${errorCode})` : ''}`;
    }
  }
  
  if (typeof current === 'string') {
    return errorCode ? `${current} (${errorCode})` : current;
  }
  
  return `Error: ${errorType}${errorCode ? ` (${errorCode})` : ''}`;
}

export default ErrorMessagesSpanish;