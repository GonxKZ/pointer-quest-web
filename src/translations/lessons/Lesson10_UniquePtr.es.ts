export const Lesson10_UniquePtrTranslation = {
  title: 'Lección 10: Punteros Únicos (unique_ptr)',
  objective: 'Dominar unique_ptr para gestión automática de memoria con propiedad exclusiva',
  description: 'Aprende cómo unique_ptr proporciona propiedad exclusiva y gestión automática de memoria',
  
  sections: {
    fundamentalTheory: 'Teoría Fundamental',
    keyConcepts: 'Conceptos Clave',
    cppExample: 'Código C++ de Ejemplo',
    moveSemantics: 'Semántica de Movimiento',
    interaction: 'Interacción',
    references: 'Referencias y Mejores Prácticas'
  },
  
  concepts: {
    exclusiveOwnership: 'Propiedad exclusiva - solo un unique_ptr puede poseer el objeto',
    automaticCleanup: 'Limpieza automática al destruirse el unique_ptr',
    moveOnly: 'Solo se puede mover, no copiar',
    raii: 'Implementa RAII (Resource Acquisition Is Initialization)'
  },
  
  uniquePtrRule: `<strong>🔒 Concepto unique_ptr:</strong> Solo UN unique_ptr puede poseer un objeto 
    a la vez. No se puede copiar, solo mover. Cuando el unique_ptr se destruye, 
    automáticamente libera la memoria del objeto.`,
    
  bestPractices: {
    makeUnique: 'Usa std::make_unique en lugar de new',
    moveTransfer: 'Usa std::move para transferir propiedad',
    releaseOwnership: 'Usa release() para liberar propiedad sin destruir',
    resetPointer: 'Usa reset() para cambiar el objeto poseído'
  },
  
  buttons: {
    createUnique: 'Crear unique_ptr',
    moveOwnership: 'Mover Propiedad',
    releasePtr: 'Liberar Propiedad',
    resetPtr: 'Reset unique_ptr',
    checkOwnership: 'Verificar Propiedad',
    reset: 'Reiniciar'
  },
  
  statusDisplay: {
    task: 'Lección 10: unique_ptr',
    owner: 'Propietario',
    object: 'Objeto',
    alive: 'Vivo',
    destroyed: 'Destruido',
    none: 'Ninguno'
  },
  
  messages: {
    created: 'unique_ptr creado con propiedad exclusiva',
    moved: 'Propiedad transferida exitosamente',
    released: 'Propiedad liberada - objeto aún vivo',
    reset: 'unique_ptr reseteado - objeto anterior destruido',
    destroyed: 'unique_ptr destruido - objeto liberado automáticamente',
    invalidAccess: 'No se puede acceder - unique_ptr no posee objeto'
  }
};

export const Lesson10_StepsSpanish = [
  "Crear unique_ptr: auto ptr = std::make_unique<int>(42);",
  "Mover propiedad: auto ptr2 = std::move(ptr);",
  "Verificar propietario original: ptr es ahora nullptr",
  "Destrucción automática al salir del scope"
];

export const Lesson10_CodeExampleSpanish = `#include <iostream>
#include <memory>

int main() {
    // Crear unique_ptr usando make_unique
    auto ptr1 = std::make_unique<int>(42);
    std::cout << "ptr1 posee: " << *ptr1 << std::endl;  // 42
    
    // Mover propiedad (no copiar)
    auto ptr2 = std::move(ptr1);  // ptr1 ahora es nullptr
    
    // Verificar estado después del movimiento
    if (ptr1 == nullptr) {
        std::cout << "ptr1 ya no posee el objeto" << std::endl;
    }
    
    if (ptr2) {
        std::cout << "ptr2 ahora posee: " << *ptr2 << std::endl;  // 42
    }
    
    // Cambiar el valor
    *ptr2 = 100;
    std::cout << "Nuevo valor: " << *ptr2 << std::endl;  // 100
    
    // Reset para destruir el objeto actual
    ptr2.reset();  // El objeto int se destruye aquí
    
    if (!ptr2) {
        std::cout << "ptr2 ya no posee ningún objeto" << std::endl;
    }
    
    return 0;
    // Limpieza automática al final del scope
}`;