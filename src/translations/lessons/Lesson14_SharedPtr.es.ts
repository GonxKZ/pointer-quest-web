export const Lesson14_SharedPtrTranslation = {
  title: 'Lección 14: Punteros Compartidos (shared_ptr)',
  objective: 'Dominar el uso de shared_ptr para gestión automática de memoria compartida',
  description: 'Aprende cómo shared_ptr gestiona automáticamente la memoria con conteo de referencias',
  
  sections: {
    fundamentalTheory: 'Teoría Fundamental',
    keyConcepts: 'Conceptos Clave',
    cppExample: 'Código C++ de Ejemplo',
    referenceCount: 'Conteo de Referencias',
    interaction: 'Interacción',
    references: 'Referencias y Mejores Prácticas'
  },
  
  concepts: {
    sharedOwnership: 'Propiedad compartida entre múltiples punteros',
    automaticCleanup: 'Limpieza automática cuando use_count llega a 0',
    referenceCount: 'Conteo de referencias para gestión de memoria',
    threadSafety: 'Seguridad básica en hilos para el conteo de referencias'
  },
  
  sharedPtrRule: `<strong>🔗 Concepto shared_ptr:</strong> Múltiples shared_ptr pueden apuntar 
    al mismo objeto. El objeto se destruye automáticamente cuando el último shared_ptr 
    que lo referencia es destruido (use_count == 0).`,
    
  bestPractices: {
    makeShared: 'Usa std::make_shared en lugar de new',
    cyclicRef: 'Cuidado con los ciclos de referencias',
    weakPtr: 'Usa weak_ptr para romper ciclos',
    performance: 'Ten en cuenta el overhead del conteo de referencias'
  },
  
  buttons: {
    createShared: 'Crear shared_ptr',
    copyShared: 'Copiar shared_ptr',
    removeRef: 'Eliminar Referencia',
    checkCount: 'Ver use_count',
    reset: 'Reiniciar'
  },
  
  statusDisplay: {
    task: 'Lección 14: shared_ptr',
    useCount: 'use_count',
    object: 'Objeto',
    alive: 'Vivo',
    destroyed: 'Destruido'
  },
  
  messages: {
    created: 'shared_ptr creado - use_count = 1',
    copied: 'shared_ptr copiado - use_count incrementado',
    removed: 'Referencia eliminada - use_count decrementado',
    destroyed: 'Último shared_ptr eliminado - objeto destruido automáticamente',
    stillAlive: 'Objeto aún vivo - quedan referencias activas'
  }
};

export const Lesson14_StepsSpanish = [
  "Crear primer shared_ptr: auto ptr1 = std::make_shared<int>(42);",
  "Copiar shared_ptr: auto ptr2 = ptr1; (use_count = 2)",
  "Eliminar una referencia: ptr1.reset(); (use_count = 1)",
  "Eliminar última referencia: ptr2.reset(); (objeto destruido)"
];

export const Lesson14_CodeExampleSpanish = `#include <iostream>
#include <memory>

int main() {
    // Crear shared_ptr usando make_shared
    auto ptr1 = std::make_shared<int>(42);
    std::cout << "use_count: " << ptr1.use_count() << std::endl;  // 1
    
    {
        // Copiar shared_ptr
        auto ptr2 = ptr1;
        std::cout << "use_count: " << ptr1.use_count() << std::endl;  // 2
        
        // Ambos apuntan al mismo objeto
        std::cout << "*ptr1: " << *ptr1 << std::endl;  // 42
        std::cout << "*ptr2: " << *ptr2 << std::endl;  // 42
        
        // Modificar a través de cualquier puntero
        *ptr2 = 100;
        std::cout << "*ptr1: " << *ptr1 << std::endl;  // 100
        
    } // ptr2 se destruye aquí, use_count vuelve a 1
    
    std::cout << "use_count: " << ptr1.use_count() << std::endl;  // 1
    
    // ptr1 se destruye al final del scope
    // El objeto int se libera automáticamente
    
    return 0;
}`;