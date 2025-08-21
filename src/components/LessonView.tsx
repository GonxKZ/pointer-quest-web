import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import CodeEditor, { Terminal } from './CodeEditor';
import MemoryVisualizer from './MemoryVisualizer';
// import ErrorModal from './ErrorModal'; // Not used

// Datos de ejemplo para las lecciones (esto se expandirá)
const lessonData: Record<number, {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  code: string;
  explanation: string;
  guidelines: string[];
}> = {
  1: {
    title: "Punteros Básicos - T*",
    description: "Aprende los fundamentos de los punteros en C++",
    difficulty: 'beginner',
    code: `#include <iostream>

int main() {
    int x = 42;
    int* ptr = &x;  // & obtiene la dirección de x

    std::cout << "Valor de x: " << x << std::endl;
    std::cout << "Dirección de x: " << ptr << std::endl;
    std::cout << "Valor apuntado por ptr: " << *ptr << std::endl;

    *ptr = 100;  // Modificar x a través del puntero
    std::cout << "Nuevo valor de x: " << x << std::endl;

    return 0;
}`,
    explanation: `
Los punteros son variables que almacenan direcciones de memoria.

• **int x = 42;** - Variable normal que almacena el valor 42
• **int* ptr = &x;** - Puntero que almacena la dirección de x
• **&x** - Operador de dirección (address-of)
• ***ptr** - Operador de desreferencia (dereference)
• Los punteros permiten acceso indirecto a variables
• Un puntero sin inicializar contiene basura y puede causar crashes
    `,
    guidelines: [
      "Siempre inicializa los punteros",
      "Verifica que un puntero no sea nullptr antes de desreferenciarlo",
      "Usa const cuando el puntero no deba modificar el valor apuntado",
      "Evita punteros a variables locales después de que la función retorna"
    ]
  },

  2: {
    title: "Puntero Nulo - nullptr",
    description: "Comprende el concepto de puntero nulo y su importancia",
    difficulty: 'beginner',
    code: `#include <iostream>

void process_data(int* data) {
    if (data == nullptr) {
        std::cout << "Error: Datos no disponibles" << std::endl;
        return;
    }

    std::cout << "Procesando: " << *data << std::endl;
}

int main() {
    int x = 42;
    int* valid_ptr = &x;
    int* null_ptr = nullptr;

    process_data(valid_ptr);  // OK
    process_data(null_ptr);   // Manejo seguro

    // Verificación antes de usar
    if (valid_ptr != nullptr) {
        *valid_ptr = 100;
    }

    return 0;
}`,
    explanation: `
nullptr representa un puntero que no apunta a ningún objeto válido.

• **nullptr** - Literal de puntero nulo (C++11+)
• **NULL** - Macro de C (evitar en C++)
• Desreferenciar nullptr causa crash inmediato
• Útil para indicar "sin datos" o "error"
• Siempre verifica contra nullptr antes de usar
    `,
    guidelines: [
      "Usa nullptr en lugar de NULL",
      "Siempre verifica punteros contra nullptr",
      "Retorna nullptr para indicar error o falta de datos",
      "No desreferencies un puntero sin verificar que no es nullptr"
    ]
  },

  3: {
    title: "Punteros en Heap - new y delete",
    description: "Aprende a gestionar memoria dinámica con new y delete",
    difficulty: 'beginner',
    code: `#include <iostream>

int main() {
    // Crear un entero en el heap
    int* ptr = new int(42);

    std::cout << "Valor: " << *ptr << std::endl;
    std::cout << "Dirección: " << ptr << std::endl;

    // Modificar el valor
    *ptr = 100;
    std::cout << "Nuevo valor: " << *ptr << std::endl;

    // Liberar la memoria
    delete ptr;
    ptr = nullptr;  // Buenas prácticas

    return 0;
}`,
    explanation: `
La gestión dinámica de memoria permite crear objetos que persisten más allá del scope actual.

• **new int(42)** - Reserva memoria en el heap y la inicializa
• **delete ptr** - Libera la memoria reservada
• El heap es una región de memoria más grande pero más lenta
• Es responsabilidad del programador gestionar esta memoria
• Los memory leaks ocurren cuando no se libera la memoria
    `,
    guidelines: [
      "Siempre empareja new con delete",
      "Pon el puntero a nullptr después de delete",
      "Usa delete[] para arrays",
      "Evita memory leaks verificando liberaciones"
    ]
  },

  4: {
    title: "Punteros a Arrays",
    description: "Domina el uso de punteros con arrays",
    difficulty: 'intermediate',
    code: `#include <iostream>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    int* ptr = arr;  // Puntero al primer elemento

    std::cout << "Array usando índices:" << std::endl;
    for(int i = 0; i < 5; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;

    std::cout << "Array usando punteros:" << std::endl;
    for(int i = 0; i < 5; i++) {
        std::cout << *(ptr + i) << " ";
    }
    std::cout << std::endl;

    std::cout << "ptr[2] = " << ptr[2] << std::endl;
    std::cout << "*(ptr + 2) = " << *(ptr + 2) << std::endl;

    return 0;
}`,
    explanation: `
Los arrays y punteros están íntimamente relacionados en C++.

• **int* ptr = arr** - Un array se puede tratar como un puntero
• ***(ptr + i)** - Acceso usando aritmética de punteros
• **ptr[i]** - Sintaxis equivalente al acceso con arrays
• Los arrays se desintegran a punteros cuando se pasan a funciones
• El nombre del array es un puntero constante al primer elemento
    `,
    guidelines: [
      "Usa la notación de arrays cuando trabajes con arrays",
      "Usa aritmética de punteros solo cuando sea necesario",
      "Ten cuidado con los límites del array",
      "Recuerda que los arrays se convierten en punteros"
    ]
  },

  5: {
    title: "Punteros Constantes",
    description: "Entiende las diferentes formas de const con punteros",
    difficulty: 'intermediate',
    code: `#include <iostream>

int main() {
    int x = 42;
    int y = 100;

    // Puntero a constante (no puedo cambiar el valor apuntado)
    const int* ptr1 = &x;
    // *ptr1 = 50;  // Error: no se puede modificar
    ptr1 = &y;     // OK: puedo cambiar a qué apunta

    // Puntero constante (no puedo cambiar a qué apunta)
    int* const ptr2 = &x;
    *ptr2 = 50;    // OK: puedo cambiar el valor
    // ptr2 = &y;   // Error: no puedo cambiar la dirección

    // Puntero constante a constante
    const int* const ptr3 = &x;
    // *ptr3 = 50;  // Error
    // ptr3 = &y;   // Error

    std::cout << "x = " << x << std::endl;
    return 0;
}`,
    explanation: `
const se puede aplicar al puntero, al valor apuntado, o a ambos.

• **const int* ptr** - Puntero a constante (el valor no se puede cambiar)
• **int* const ptr** - Puntero constante (la dirección no se puede cambiar)
• **const int* const ptr** - Ambas restricciones
• Usar const mejora la seguridad y permite optimizaciones
• Es especialmente útil en parámetros de función
    `,
    guidelines: [
      "Usa const siempre que sea posible",
      "Punteros a constantes para datos que no deben modificarse",
      "Punteros constantes para punteros que no deben reasignarse",
      "Documenta claramente qué significa cada const"
    ]
  },

  6: {
    title: "Punteros Dobles",
    description: "Trabaja con punteros que apuntan a otros punteros",
    difficulty: 'intermediate',
    code: `#include <iostream>

int main() {
    int x = 42;
    int* ptr = &x;      // Puntero normal
    int** ptr2 = &ptr;  // Puntero a puntero

    std::cout << "Valor de x: " << x << std::endl;
    std::cout << "Valor a través de ptr: " << *ptr << std::endl;
    std::cout << "Valor a través de ptr2: " << **ptr2 << std::endl;

    std::cout << "Dirección de x: " << &x << std::endl;
    std::cout << "Dirección en ptr: " << ptr << std::endl;
    std::cout << "Dirección en ptr2: " << ptr2 << std::endl;

    // Modificar a través de puntero doble
    **ptr2 = 100;
    std::cout << "Nuevo valor de x: " << x << std::endl;

    return 0;
}`,
    explanation: `
Los punteros dobles son útiles para estructuras de datos dinámicas.

• **int** - Entero
• **int*** - Puntero a entero
• **int*** - Puntero a puntero a entero
• **&ptr** - Obtiene la dirección del puntero
• ***ptr2** - Desreferencia el puntero doble
• Útiles para arrays de strings, matrices, etc.
    `,
    guidelines: [
      "Ten cuidado con múltiples niveles de desreferencia",
      "Verifica que cada nivel no sea nullptr",
      "Usa typedefs para mejorar legibilidad",
      "Dibuja diagramas de memoria para entender el flujo"
    ]
  },

  7: {
    title: "Punteros de Función",
    description: "Aprende a usar punteros que apuntan a funciones",
    difficulty: 'advanced',
    code: `#include <iostream>

// Función simple
int suma(int a, int b) {
    return a + b;
}

int resta(int a, int b) {
    return a - b;
}

int main() {
    // Declarar puntero a función
    int (*operacion)(int, int);

    // Asignar función
    operacion = suma;
    std::cout << "Suma: " << operacion(5, 3) << std::endl;

    // Cambiar a otra función
    operacion = resta;
    std::cout << "Resta: " << operacion(5, 3) << std::endl;

    // Usando typedef para claridad
    typedef int (*OperacionPtr)(int, int);
    OperacionPtr op = suma;

    return 0;
}`,
    explanation: `
Los punteros de función permiten pasar funciones como parámetros.

• **int (*ptr)(int, int)** - Puntero a función que recibe dos int y retorna int
• **ptr = funcion** - Asignar función al puntero
• **ptr(args)** - Llamar a la función a través del puntero
• Útiles para callbacks, estrategias, y polimorfismo en tiempo de ejecución
• Las funciones se desintegran a punteros automáticamente
    `,
    guidelines: [
      "Usa typedefs para simplificar la sintaxis",
      "Verifica que el puntero no sea nullptr antes de llamar",
      "Documenta claramente la signatura de la función",
      "Considera std::function como alternativa moderna"
    ]
  },

  8: {
    title: "Smart Pointers - unique_ptr",
    description: "Descubre los punteros inteligentes que gestionan automáticamente la memoria",
    difficulty: 'intermediate',
    code: `#include <iostream>
#include <memory>

int main() {
    // Crear unique_ptr
    std::unique_ptr<int> ptr1 = std::make_unique<int>(42);

    std::cout << "Valor: " << *ptr1 << std::endl;

    // Transferir ownership
    std::unique_ptr<int> ptr2 = std::move(ptr1);

    if (!ptr1) {
        std::cout << "ptr1 es nullptr después del move" << std::endl;
    }

    std::cout << "Valor a través de ptr2: " << *ptr2 << std::endl;

    // La memoria se libera automáticamente al final del scope
    return 0;
}`,
    explanation: `
Los smart pointers evitan memory leaks al gestionar automáticamente la memoria.

• **unique_ptr** - Propiedad exclusiva de la memoria
• **make_unique<T>()** - Función helper para crear unique_ptr
• **std::move()** - Transfiere la propiedad
• **reset()** - Libera la memoria manualmente
• No se puede copiar, solo mover
    `,
    guidelines: [
      "Usa make_unique en lugar de new",
      "Prefiere unique_ptr sobre raw pointers",
      "Usa std::move para transferir propiedad",
      "No te preocupes por delete - es automático"
    ]
  },

  9: {
    title: "Smart Pointers - shared_ptr",
    description: "Aprende sobre punteros compartidos con conteo de referencias",
    difficulty: 'advanced',
    code: `#include <iostream>
#include <memory>

int main() {
    // Crear shared_ptr
    std::shared_ptr<int> ptr1 = std::make_shared<int>(42);

    std::cout << "Valor: " << *ptr1 << std::endl;
    std::cout << "Conteo de referencias: " << ptr1.use_count() << std::endl;

    // Crear otra referencia
    {
        std::shared_ptr<int> ptr2 = ptr1;
        std::cout << "Conteo después de ptr2: " << ptr1.use_count() << std::endl;
        std::cout << "Valor a través de ptr2: " << *ptr2 << std::endl;
    } // ptr2 se destruye aquí

    std::cout << "Conteo final: " << ptr1.use_count() << std::endl;

    return 0;
}`,
    explanation: `
shared_ptr permite múltiples propietarios de la misma memoria.

• **shared_ptr** - Propiedad compartida con conteo de referencias
• **use_count()** - Número de shared_ptr que apuntan al mismo objeto
• **make_shared<T>()** - Crea objeto y shared_ptr eficientemente
• La memoria se libera cuando el último shared_ptr se destruye
• Útil para estructuras de datos complejas
    `,
    guidelines: [
      "Usa make_shared para mejor rendimiento",
      "Ten cuidado con ciclos de referencias",
      "Usa weak_ptr para romper ciclos",
      "Monitoriza use_count() para debugging"
    ]
  },

  10: {
    title: "Smart Pointers - weak_ptr",
    description: "Entiende los punteros débiles para evitar ciclos de referencias",
    difficulty: 'advanced',
    code: `#include <iostream>
#include <memory>

class Nodo {
public:
    std::shared_ptr<Nodo> siguiente;
    std::weak_ptr<Nodo> anterior;  // Evita ciclo

    Nodo(int valor) : valor(valor) {}
    ~Nodo() { std::cout << "Nodo " << valor << " destruido" << std::endl; }

    int valor;
};

int main() {
    auto nodo1 = std::make_shared<Nodo>(1);
    auto nodo2 = std::make_shared<Nodo>(2);

    // Crear referencias (sin ciclos)
    nodo1->siguiente = nodo2;
    nodo2->anterior = nodo1;  // weak_ptr no crea ciclo

    // Acceder a través de weak_ptr
    if (auto ptr = nodo2->anterior.lock()) {
        std::cout << "Valor del anterior: " << ptr->valor << std::endl;
    }

    return 0;
}`,
    explanation: `
weak_ptr resuelve el problema de ciclos de referencias en shared_ptr.

• **weak_ptr** - Referencia no-propietaria a un objeto shared_ptr
• **lock()** - Intenta obtener un shared_ptr temporal
• No incrementa el use_count()
• Útil para observers y caches
• Previene memory leaks por ciclos
    `,
    guidelines: [
      "Usa weak_ptr para relaciones no-propietarias",
      "Siempre verifica con lock() antes de usar",
      "Útil en listas doblemente enlazadas",
      "Ideal para implementar observer pattern"
    ]
  },

  11: {
    title: "Arrays Dinámicos",
    description: "Gestiona arrays de tamaño dinámico con new[] y delete[]",
    difficulty: 'intermediate',
    code: `#include <iostream>

int main() {
    // Crear array dinámico
    int* arr = new int[5];

    // Inicializar
    for(int i = 0; i < 5; i++) {
        arr[i] = (i + 1) * 10;
    }

    // Usar
    std::cout << "Array dinámico:" << std::endl;
    for(int i = 0; i < 5; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;

    // Liberar memoria (importante: delete[], no delete)
    delete[] arr;
    arr = nullptr;

    return 0;
}`,
    explanation: `
Los arrays dinámicos permiten crear arrays de tamaño conocido en runtime.

• **new int[5]** - Reserva memoria para 5 enteros
• **delete[] arr** - Libera el array completo
• **arr[i]** - Acceso normal a elementos
• El tamaño debe conocerse en tiempo de ejecución
• No se puede redimensionar después de creado
    `,
    guidelines: [
      "Usa delete[] para arrays dinámicos",
      "No mezcles delete con delete[]",
      "Considera std::vector como alternativa moderna",
      "Verifica el tamaño antes de acceder"
    ]
  },

  12: {
    title: "Punteros y Polimorfismo",
    description: "Aprovecha el polimorfismo con punteros a clases base",
    difficulty: 'advanced',
    code: `#include <iostream>

class Animal {
public:
    virtual void hablar() {
        std::cout << "???" << std::endl;
    }
    virtual ~Animal() = default;
};

class Perro : public Animal {
public:
    void hablar() override {
        std::cout << "¡Guau!" << std::endl;
    }
};

class Gato : public Animal {
public:
    void hablar() override {
        std::cout << "¡Miau!" << std::endl;
    }
};

int main() {
    // Array de punteros a Animal
    Animal* animales[3];

    animales[0] = new Perro();
    animales[1] = new Gato();
    animales[2] = new Animal();

    // Polimorfismo en acción
    for(int i = 0; i < 3; i++) {
        animales[i]->hablar();
        delete animales[i];
    }

    return 0;
}`,
    explanation: `
El polimorfismo permite tratar objetos de diferentes tipos de forma uniforme.

• **virtual** - Habilita polimorfismo
• **override** - Indica que se sobreescribe un método virtual
• **Animal*** - Puntero a clase base puede apuntar a clases derivadas
• La función correcta se llama según el tipo real del objeto
• Esencial para diseño orientado a objetos
    `,
    guidelines: [
      "Usa virtual para métodos que pueden sobreescribirse",
      "No olvides virtual en el destructor de la clase base",
      "Usa override para claridad",
      "Entiende slicing vs polimorfismo"
    ]
  },

  13: {
    title: "Punteros y Templates",
    description: "Crea código genérico que funciona con cualquier tipo de puntero",
    difficulty: 'advanced',
    code: `#include <iostream>
#include <memory>

template <typename T>
void mostrar_info(T* ptr) {
    if (ptr) {
        std::cout << "Valor: " << *ptr << std::endl;
        std::cout << "Dirección: " << ptr << std::endl;
    } else {
        std::cout << "Puntero nulo" << std::endl;
    }
}

template <typename T>
class Contenedor {
private:
    T* datos;
    size_t tamano;

public:
    Contenedor(size_t n) : tamano(n) {
        datos = new T[n];
    }

    ~Contenedor() {
        delete[] datos;
    }

    T& operator[](size_t i) {
        return datos[i];
    }
};

int main() {
    int x = 42;
    mostrar_info(&x);

    double y = 3.14;
    mostrar_info(&y);

    Contenedor<int> cont(5);
    cont[0] = 10;
    cont[1] = 20;

    std::cout << "Elemento 0: " << cont[0] << std::endl;

    return 0;
}`,
    explanation: `
Los templates permiten crear código genérico que funciona con cualquier tipo.

• **template <typename T>** - Define un template
• **T*** - Puntero a cualquier tipo T
• Se puede usar con cualquier tipo que soporte las operaciones requeridas
• Excelente para crear contenedores genéricos
• Los templates se instancian en tiempo de compilación
    `,
    guidelines: [
      "Usa templates para código reutilizable",
      "Especifica claramente los requerimientos del tipo T",
      "Considera especializaciones cuando sea necesario",
      "Los templates no afectan el rendimiento en runtime"
    ]
  },

  14: {
    title: "Punteros en Structs",
    description: "Trabaja con punteros dentro de estructuras de datos",
    difficulty: 'intermediate',
    code: `#include <iostream>

struct Nodo {
    int dato;
    Nodo* siguiente;  // Puntero al siguiente nodo
};

void imprimir_lista(Nodo* cabeza) {
    Nodo* actual = cabeza;
    while (actual != nullptr) {
        std::cout << actual->dato << " -> ";
        actual = actual->siguiente;
    }
    std::cout << "nullptr" << std::endl;
}

int main() {
    // Crear lista enlazada
    Nodo* cabeza = new Nodo{1, nullptr};
    cabeza->siguiente = new Nodo{2, nullptr};
    cabeza->siguiente->siguiente = new Nodo{3, nullptr};

    imprimir_lista(cabeza);

    // Liberar memoria
    while (cabeza != nullptr) {
        Nodo* temp = cabeza;
        cabeza = cabeza->siguiente;
        delete temp;
    }

    return 0;
}`,
    explanation: `
Los structs pueden contener punteros para crear estructuras de datos dinámicas.

• **Nodo*** - Puntero a struct Nodo
• **->** - Operador de acceso a miembro a través de puntero
• Se pueden crear listas, árboles, grafos, etc.
• Es responsabilidad del programador gestionar la memoria
• Las estructuras autorreferenciales son muy comunes
    `,
    guidelines: [
      "Usa -> para acceder a miembros a través de punteros",
      "Gestiona correctamente la memoria de structs con punteros",
      "Considera smart pointers para estructuras complejas",
      "Dibuja diagramas para entender las conexiones"
    ]
  },

  15: {
    title: "Punteros y Memoria",
    description: "Entiende cómo los punteros interactúan con la memoria del sistema",
    difficulty: 'advanced',
    code: `#include <iostream>
#include <iomanip>

int main() {
    // Variables locales (stack)
    int stack_var = 42;
    int* stack_ptr = &stack_var;

    std::cout << "=== STACK ===" << std::endl;
    std::cout << "Variable: " << stack_var << std::endl;
    std::cout << "Dirección: " << std::hex << stack_ptr << std::dec << std::endl;

    // Variables dinámicas (heap)
    int* heap_ptr = new int(100);

    std::cout << "\n=== HEAP ===" << std::endl;
    std::cout << "Variable: " << *heap_ptr << std::endl;
    std::cout << "Dirección: " << std::hex << heap_ptr << std::dec << std::endl;

    // Array estático
    int static_arr[3] = {1, 2, 3};

    std::cout << "\n=== ARRAY ESTÁTICO ===" << std::endl;
    for(int i = 0; i < 3; i++) {
        std::cout << "arr[" << i << "] = " << static_arr[i]
                  << " en " << std::hex << &static_arr[i] << std::dec << std::endl;
    }

    delete heap_ptr;
    return 0;
}`,
    explanation: `
Diferentes tipos de variables se almacenan en diferentes segmentos de memoria.

• **Stack** - Variables locales, rápida pero limitada
• **Heap** - Memoria dinámica, más flexible pero lenta
• **Global/Static** - Variables globales y estáticas
• Cada segmento tiene características y usos específicos
• Los punteros pueden apuntar a cualquier segmento
    `,
    guidelines: [
      "Entiende dónde se almacena cada tipo de variable",
      "Usa el stack para datos temporales pequeños",
      "Usa el heap para datos grandes o que persisten",
      "Libera siempre la memoria del heap"
    ]
  },

  16: {
    title: "Punteros y Excepciones",
    description: "Gestiona correctamente la memoria cuando ocurren excepciones",
    difficulty: 'advanced',
    code: `#include <iostream>
#include <stdexcept>

class Recurso {
public:
    Recurso() { std::cout << "Recurso creado" << std::endl; }
    ~Recurso() { std::cout << "Recurso destruido" << std::endl; }
};

void funcion_que_puede_fallar(bool fallar) {
    Recurso* recurso = new Recurso();

    if (fallar) {
        delete recurso;  // Liberar antes de lanzar
        throw std::runtime_error("Error simulado");
    }

    delete recurso;
}

int main() {
    try {
        funcion_que_puede_fallar(false);
        std::cout << "Primera llamada exitosa" << std::endl;

        funcion_que_puede_fallar(true);
        std::cout << "Esta línea no se ejecutará" << std::endl;

    } catch (const std::exception& e) {
        std::cout << "Excepción capturada: " << e.what() << std::endl;
    }

    return 0;
}`,
    explanation: `
Las excepciones complican la gestión de memoria manual.

• **RAII** - Resource Acquisition Is Initialization
• **Smart pointers** - Gestionan automáticamente la memoria
• **delete antes de throw** - Evita memory leaks
• **try-catch** - Manejo de excepciones
• Las excepciones pueden ocurrir en cualquier momento
    `,
    guidelines: [
      "Usa smart pointers para evitar problemas",
      "Libera recursos antes de lanzar excepciones",
      "Usa RAII siempre que sea posible",
      "Considera noexcept para funciones que no lanzan"
    ]
  }
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 2rem;
  gap: 2rem;
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #00d4ff;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px #00d4ff;
`;

const Description = styled.p`
  color: #b8c5d6;
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Difficulty = styled.span<{ level: 'beginner' | 'intermediate' | 'advanced' }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  background: ${props =>
    props.level === 'beginner' ? '#00ff88' :
    props.level === 'intermediate' ? '#ffa500' : '#ff6b6b'};
  color: ${props => props.level === 'beginner' ? '#000' : '#fff'};
`;

const Navigation = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
  background: transparent;
  color: #00d4ff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
`;

const MainContent = styled.div`
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  backdrop-filter: blur(10px);
`;

const Section = styled.section`
  margin-bottom: 2rem;

  h2 {
    color: #00d4ff;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
`;

const Explanation = styled.div`
  color: #e0e0e0;
  line-height: 1.6;
  font-family: 'Fira Code', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  white-space: pre-line;
`;

const GuidelinesList = styled.ul`
  list-style: none;
  padding: 0;
`;

const Guideline = styled.li`
  color: #b8c5d6;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;

  &:before {
    content: "▶";
    color: #00d4ff;
    position: absolute;
    left: 0;
  }
`;

const Sidebar = styled.div`
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.9), rgba(42, 82, 152, 0.9));
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  position: sticky;
  top: 100px;
`;

const SidebarTitle = styled.h3`
  color: #00d4ff;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
`;

const CompleteButton = styled(ActionButton)`
  background: linear-gradient(45deg, #00ff88, #00cc66);
  color: #000;

  &:hover {
    background: linear-gradient(45deg, #00cc66, #009944);
    transform: translateY(-2px);
  }
`;

const ResetButton = styled(ActionButton)`
  background: linear-gradient(45deg, #ff6b6b, #cc4444);
  color: white;

  &:hover {
    background: linear-gradient(45deg, #cc4444, #aa2222);
    transform: translateY(-2px);
  }
`;

const ErrorButton = styled(ActionButton)`
  background: linear-gradient(45deg, #ffa500, #cc8400);
  color: white;

  &:hover {
    background: linear-gradient(45deg, #cc8400, #aa6600);
    transform: translateY(-2px);
  }
`;

export default function LessonView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const lessonId = parseInt(id || '1');
  const lesson = lessonData[lessonId];



  if (!lesson) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
          Lección no encontrada
        </div>
      </Container>
    );
  }

  const handleComplete = () => {
    // Aquí se implementará la lógica de completar lección
    // console.log('Lección completada:', lessonId);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_MEMORY' });
  };

  const handleSimulateError = () => {
    dispatch({
      type: 'SHOW_ERROR',
      payload: '¡Error de Comportamiento Indefinido!\n\nIntentaste desreferenciar un puntero nulo, lo que causa un crash inmediato en el programa.'
    });
  };

  const goToLesson = (targetId: number) => {
    navigate(`/lessons/${targetId}`);
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>Lección {lessonId}: {lesson.title}</Title>
          <Description>{lesson.description}</Description>
          <MetaInfo>
            <Difficulty level={lesson.difficulty}>
              {lesson.difficulty === 'beginner' ? 'Principiante' :
               lesson.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
            </Difficulty>
          </MetaInfo>
        </TitleSection>

        <Navigation>
          <NavButton
            onClick={() => goToLesson(lessonId - 1)}
            disabled={lessonId <= 1}
          >
            ← Anterior
          </NavButton>
          <NavButton
            onClick={() => goToLesson(lessonId + 1)}
            disabled={lessonId >= 16}
          >
            Siguiente →
          </NavButton>
        </Navigation>
      </Header>

      <ContentGrid>
        <MainContent>
          <Section>
            <h2>📝 Código de Ejemplo</h2>
            <CodeEditor
              code={lesson.code}
              language="cpp"
              onChange={() => {}} // Solo lectura por ahora
            />
            <Terminal
              code={lesson.code}
              language="cpp"
              lessonId={lessonId}
            />
          </Section>

          <Section>
            <h2>🎯 Explicación</h2>
            <Explanation>{lesson.explanation}</Explanation>
          </Section>

          <Section>
            <h2>✅ Directrices de C++ Core</h2>
            <GuidelinesList>
              {lesson.guidelines.map((guideline, index) => (
                <Guideline key={index}>{guideline}</Guideline>
              ))}
            </GuidelinesList>
          </Section>

          <Section>
            <h2>🧠 Visualización de Memoria</h2>
            <MemoryVisualizer />
          </Section>
        </MainContent>

        <Sidebar>
          <SidebarTitle>🎮 Acciones</SidebarTitle>

          <CompleteButton onClick={handleComplete}>
            ✅ Marcar como Completada
          </CompleteButton>

          <ResetButton onClick={handleReset}>
            🔄 Reiniciar Memoria
          </ResetButton>

          <ErrorButton onClick={handleSimulateError}>
            ⚠️ Simular Error
          </ErrorButton>

          <SidebarTitle style={{ marginTop: '2rem' }}>📊 Progreso</SidebarTitle>
          <div style={{ color: '#b8c5d6', fontSize: '0.9rem' }}>
            <p>Lección actual: {lessonId + 1}/17</p>
            <p>Completadas: {state.userProgress.completedLessons.length}</p>
            <p>Puntuación: {state.userProgress.totalScore}</p>
          </div>

          <SidebarTitle style={{ marginTop: '2rem' }}>🏆 Logros</SidebarTitle>
          <div style={{ color: '#b8c5d6', fontSize: '0.9rem' }}>
            {state.userProgress.achievements.length === 0 ? (
              <p>Sin logros aún</p>
            ) : (
              state.userProgress.achievements.map((achievement, index) => (
                <div key={index}>🏆 {achievement}</div>
              ))
            )}
          </div>
        </Sidebar>
      </ContentGrid>
    </Container>
  );
}
