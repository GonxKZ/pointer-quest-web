export const Lesson02_NullPtrTranslation = {
  title: 'Tarea 2: Punteros Nulos (nullptr)',
  objective: 'Dominar el uso correcto de punteros nulos y verificaciones de seguridad',
  description: 'Aprende a usar nullptr de forma segura y evitar errores comunes',
  
  sections: {
    fundamentalTheory: 'Teoría Fundamental',
    keyConcepts: 'Conceptos Clave',
    cppExample: 'Código C++ de Ejemplo',
    safetyCheck: 'Verificación de Seguridad',
    interaction: 'Interacción',
    references: 'Referencias y Mejores Prácticas'
  },
  
  concepts: {
    nullptrIntro: 'Introducción a nullptr vs NULL vs 0',
    safeAccess: 'Verificación de punteros antes del acceso',
    safePatterns: 'Patrones de uso seguro de punteros',
    errorPrevention: 'Prevención de errores de punteros nulos'
  },
  
  safetyRule: `<strong>🛡️ Regla de Seguridad:</strong> Siempre verifica que un puntero no sea 
    nullptr antes de desreferenciarlo. Un nullptr es un puntero que no apunta a ninguna 
    ubicación de memoria válida.`,
    
  bestPractices: {
    alwaysCheck: 'Verificación: Siempre comprueba if (ptr != nullptr) antes de usar *ptr',
    initialization: 'Inicialización: Usa nullptr para inicializar punteros sin valor',
    modernC: 'C++ Moderno: Prefiere nullptr sobre NULL o 0',
    earlyReturn: 'Retorno Temprano: Usa guard clauses para validación'
  },
  
  buttons: {
    checkNull: 'Verificar nullptr',
    assignValue: 'Asignar Valor',
    makeNull: 'Hacer nullptr',
    dereference: 'Desreferenciar',
    reset: 'Reiniciar'
  },
  
  statusDisplay: {
    task: 'Tarea 2: Punteros Nulos',
    step: 'Paso',
    status: 'Estado',
    safe: 'Seguro',
    dangerous: 'Peligroso',
    error: 'Error'
  },
  
  messages: {
    nullCheck: 'Verificación de nullptr realizada correctamente',
    safeAssignment: 'Puntero asignado de forma segura',
    nullAssignment: 'Puntero establecido a nullptr',
    safeDeref: 'Desreferenciación segura realizada',
    dangerousDeref: '¡PELIGRO! Intentando desreferenciar nullptr',
    undefined: 'Comportamiento indefinido detectado'
  }
};

export const Lesson02_StepsSpanish = [
  "Declaración inicial: int* p = nullptr;",
  "Verificar si el puntero es nullptr antes de usarlo",
  "Asignar una dirección válida al puntero",
  "Desreferenciar de forma segura después de la verificación"
];

export const Lesson02_CodeExampleSpanish = `#include <iostream>

int main() {
    // Inicialización segura con nullptr
    int* p = nullptr;
    
    // Verificación ANTES de desreferenciar
    if (p != nullptr) {
        std::cout << "Valor: " << *p << std::endl;
    } else {
        std::cout << "El puntero es nullptr - no se puede desreferenciar" << std::endl;
    }
    
    // Asignar dirección válida
    int x = 42;
    p = &x;
    
    // Ahora es seguro desreferenciar
    if (p != nullptr) {
        std::cout << "Valor seguro: " << *p << std::endl;  // ✅ Seguro
    }
    
    return 0;
}`;