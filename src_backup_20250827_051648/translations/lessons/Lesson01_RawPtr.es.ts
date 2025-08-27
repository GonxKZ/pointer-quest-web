export const Lesson01_RawPtrTranslation = {
  title: 'Tarea 1: Punteros Básicos - int* p = &x',
  objective: 'Comprender los fundamentos de los punteros y las direcciones de memoria',
  description: 'Aprende los conceptos básicos de punteros y cómo apuntan a direcciones de memoria',
  
  sections: {
    fundamentalTheory: 'Teoría Fundamental',
    keyConcepts: 'Conceptos Clave',
    cppExample: 'Código C++ de Ejemplo',
    criticalPoint: 'Punto Crítico de Entendimiento',
    interaction: 'Interacción',
    references: 'Referencias y Mejores Prácticas'
  },
  
  concepts: {
    normalVariable: 'Variable normal que almacena el valor 42 en la pila',
    pointerVariable: 'Puntero que almacena la dirección donde vive x',
    addressOfOperator: 'Operador address-of: "dame la dirección de x"',
    dereferenceOperator: 'Operador de desreferencia: "dame el valor en la dirección p"'
  },
  
  fundamentalConcept: `Cuando reasignas <code>x = 100</code>, el puntero <code>p</code> NO cambia porque 
    almacena una <strong>dirección</strong>, no un valor. La dirección de x permanece 
    constante durante toda su vida útil.`,
    
  bestPractices: {
    goldenRule: 'Regla de Oro: Siempre inicializa los punteros',
    verification: 'Verificación: Comprueba si el puntero es válido antes de desreferenciar',
    modernity: 'Modernidad: Prefiere smart pointers en código moderno',
    coreGuidelines: 'Pautas Centrales - Gestión de Recursos'
  },
  
  buttons: {
    modifyX: 'Modificar x (+10)',
    nextStep: 'Siguiente Paso',
    reset: 'Reiniciar'
  },
  
  statusDisplay: {
    task: 'Tarea 1: Punteros Básicos',
    step: 'Paso',
    status: 'Estado'
  }
};

export const Lesson01_StepsSpanish = [
  "Declaración inicial: int x = 42; int* p = &x;",
  "Observa cómo p almacena la dirección de x",
  "Modifica x y verifica que p continúa apuntando a la misma dirección",
  "El puntero no cambia porque almacena una dirección, no un valor"
];

export const Lesson01_MessagesSpanish = {
  initialMessage: 'p apunta correctamente a x',
  modifiedMessage: 'x modificado a',
  pointerUnchanged: '. p continúa apuntando a la misma dirección!',
  memoryState: 'Estado de Memoria'
};