export const Lesson03_DanglingPtrTranslation = {
  title: 'Tarea 3: Punteros Colgantes (Dangling Pointers)',
  objective: 'Reconocer y evitar los peligros de los punteros colgantes',
  description: 'Identifica y previene problemas con punteros colgantes',
  
  sections: {
    fundamentalTheory: 'Teoría Fundamental',
    keyConcepts: 'Conceptos Clave',
    cppExample: 'Código C++ de Ejemplo',
    dangerZone: 'Zona de Peligro',
    interaction: 'Interacción',
    references: 'Referencias y Mejores Prácticas'
  },
  
  concepts: {
    whatAreDangling: 'Qué son los punteros colgantes',
    commonCauses: 'Causas comunes de punteros colgantes',
    detection: 'Cómo detectar y prevenir este problema',
    memoryManagement: 'Mejores prácticas para la gestión de memoria'
  },
  
  dangerWarning: `<strong>⚠️ PELIGRO EXTREMO:</strong> Un puntero colgante apunta a memoria que ya ha sido 
    liberada. Acceder a esta memoria causa <strong>comportamiento indefinido</strong> - puede parecer que 
    funciona, pero es impredecible y puede corrompir datos o provocar crashes.`,
    
  bestPractices: {
    setToNull: 'Establece punteros a nullptr después de delete',
    avoidDelete: 'Usa smart pointers para evitar delete manual',
    scopeAwareness: 'Ten cuidado con el ámbito de variables locales',
    doubleDelete: 'Nunca hagas delete dos veces en el mismo puntero'
  },
  
  buttons: {
    allocateMemory: 'Asignar Memoria',
    deleteMemory: 'Liberar Memoria',
    accessDangling: 'Acceder (PELIGROSO)',
    setNull: 'Establecer nullptr',
    reset: 'Reiniciar'
  },
  
  statusDisplay: {
    task: 'Tarea 3: Punteros Colgantes',
    step: 'Paso',
    status: 'Estado',
    valid: 'Válido',
    dangling: 'Colgante',
    null: 'Nulo',
    undefined: 'Indefinido'
  },
  
  messages: {
    allocated: 'Memoria asignada correctamente',
    freed: 'Memoria liberada - ¡puntero ahora es colgante!',
    danglingAccess: '💥 ACCESO A PUNTERO COLGANTE - Comportamiento indefinido',
    nullified: 'Puntero establecido a nullptr de forma segura',
    safeAccess: 'Acceso seguro a memoria válida'
  }
};

export const Lesson03_StepsSpanish = [
  "Asignar memoria dinámica: int* p = new int(42);",
  "Liberar la memoria: delete p;",
  "¡PELIGRO! p ahora es un puntero colgante",
  "Solución: establecer p = nullptr después de delete"
];

export const Lesson03_CodeExampleSpanish = `#include <iostream>

int main() {
    // 1. Asignar memoria dinámicamente
    int* p = new int(42);
    std::cout << "Valor: " << *p << std::endl;  // ✅ OK
    
    // 2. Liberar la memoria
    delete p;
    // ⚠️ AHORA p es un puntero colgante!
    
    // 3. NUNCA hagas esto - comportamiento indefinido
    // std::cout << *p << std::endl;  // 💥 PELIGROSO!
    
    // 4. SOLUCIÓN: Establecer a nullptr
    p = nullptr;
    
    // 5. Verificación segura
    if (p != nullptr) {
        std::cout << "Valor: " << *p << std::endl;
    } else {
        std::cout << "Puntero es nullptr - seguro" << std::endl;  // ✅ Seguro
    }
    
    return 0;
}`;