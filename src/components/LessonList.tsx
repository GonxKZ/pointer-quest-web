import React from 'react';
// import { Link } from 'react-router-dom'; // Not used
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #00d4ff;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px #00d4ff;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #b8c5d6;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.3), rgba(42, 82, 152, 0.3));
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
    border-color: rgba(0, 212, 255, 0.5);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #b8c5d6;
  font-size: 1rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.$active ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.$active ? 'rgba(0, 212, 255, 0.2)' : 'transparent'};
  color: ${props => props.$active ? '#00d4ff' : '#ffffff'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
  }
`;

const LessonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const LessonCard = styled.div`
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 140, 0, 0.2));
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(255, 165, 0, 0.3);
    border-color: rgba(255, 165, 0, 0.5);
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, #00d4ff, transparent);
    transition: left 0.5s;
  }

  &:hover:before {
    left: 100%;
  }
`;

const LessonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const LessonNumber = styled.div`
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
`;

const LessonStatus = styled.div<{ $completed: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  background: ${props => props.$completed ? '#00ff88' : '#ff6b6b'};
  color: ${props => props.$completed ? '#000' : '#fff'};
`;

const LessonTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #00d4ff;
  font-size: 1.3rem;
`;

const LessonDescription = styled.p`
  color: #b8c5d6;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const LessonMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const Difficulty = styled.span<{ $level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  background: ${props =>
    props.$level === 'beginner' ? '#00ff88' :
    props.$level === 'intermediate' ? '#ffa500' : '#ff6b6b'};
  color: ${props => props.$level === 'beginner' ? '#000' : '#fff'};
`;

const Topic = styled.span`
  color: #888;
  font-size: 0.9rem;
`;

// Styled components for 3D Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, rgba(10, 20, 40, 0.95), rgba(30, 40, 60, 0.95));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 20px;
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 50px rgba(0, 212, 255, 0.3);
  animation: modalAppear 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid rgba(0, 212, 255, 0.2);
`;

const ModalTitle = styled.h2`
  color: #00d4ff;
  margin: 0;
  font-size: 1.8rem;
  text-shadow: 0 0 20px #00d4ff;
`;

const CloseButton = styled.button`
  background: rgba(255, 100, 100, 0.2);
  border: 2px solid rgba(255, 100, 100, 0.3);
  color: #ff6464;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 100, 100, 0.3);
    border-color: rgba(255, 100, 100, 0.5);
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
`;

const LessonInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoSection = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 212, 255, 0.1);
`;

const InfoTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  text-shadow: 0 0 10px #00d4ff;
`;

const InfoText = styled.p`
  color: #b8c5d6;
  line-height: 1.6;
  margin: 0;
`;

const CodeExample = styled.div`
  margin-bottom: 1rem;
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  color: #e0e0e0;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  margin: 0.5rem 0;
`;

const CodeExplanation = styled.p`
  color: #888;
  font-style: italic;
  margin: 0;
  font-size: 0.9rem;
`;

const ExerciseList = styled.ul`
  margin: 0;
  padding-left: 1.5rem;
`;

const ExerciseItem = styled.li`
  color: #b8c5d6;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const VisualizationSection = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 212, 255, 0.1);
  display: flex;
  flex-direction: column;
`;

const VisualizationContainer = styled.div`
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  overflow: hidden;
  min-height: 400px;
`;

const TerminalSection = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 212, 255, 0.1);
  margin-top: 1rem;
`;

const TerminalContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  overflow: hidden;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
`;

const TerminalWindow = styled.div`
  width: 100%;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
`;

const TerminalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
`;

const TerminalTitle = styled.div`
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: bold;
`;

const TerminalStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-size: 0.8rem;
`;

const StatusIndicator = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? '#00ff00' : '#ff4444'};
  box-shadow: ${props => props.$active ? '0 0 5px #00ff00' : 'none'};
  animation: ${props => props.$active ? 'pulse 1s infinite' : 'none'};
`;

const TerminalBody = styled.div`
  padding: 1rem;
  color: #ffffff;
`;

const TerminalCode = styled.pre`
  margin: 0;
  color: #ffffff;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 100px;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 5px;
  position: relative;
`;

const TerminalCursor = styled.span`
  color: #00ff00;
  animation: blink 1s infinite;
`;

const TerminalOutput = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  border-left: 3px solid #00ff00;
`;

const OutputHeader = styled.div`
  color: #00ff00;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const OutputText = styled.div`
  color: #ffffff;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
  padding: 1.5rem 2rem;
  border-top: 2px solid rgba(0, 212, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
`;

const ActionButton = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled ? 'rgba(100,100,100,0.3)' : 'rgba(0, 212, 255, 0.2)'};
  border: 2px solid ${props => props.disabled ? 'rgba(100,100,100,0.3)' : 'rgba(0, 212, 255, 0.3)'};
  color: ${props => props.disabled ? '#666' : '#00d4ff'};
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
      border-color: rgba(0, 212, 255, 0.5);
    `}
  }
`;

const CompleteButton = styled.button`
  background: linear-gradient(45deg, #00ff88, #00d4ff);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #000;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 255, 136, 0.4);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

// const TerminalAnimations = styled.div`
//   @keyframes blink {
//     0%, 50% { opacity: 1; }
//     51%, 100% { opacity: 0; }
//   }
//
//   @keyframes pulse {
//     0% { opacity: 1; }
//     50% { opacity: 0.5; }
//     100% { opacity: 1; }
//   }
// `;

// Datos de lecciones (esto se expandirá con todas las 120 lecciones)
const lessons = [
  {
    id: 0,
    title: "🎯 Introducción a Punteros - Conceptos Básicos",
    description: "¡Tu primer paso en el mundo de los punteros! Aprende qué son, por qué son importantes y cómo revolucionan la programación en C++.",
    difficulty: 'beginner' as const,
    topic: "Introducción",
    completed: false,
    content: {
      beginner: {
        theory: "🎯 **¿Qué son los punteros?**\n\nLos punteros son como direcciones postales que nos dicen DÓNDE está algo en la memoria de la computadora. En lugar de tener el regalo (el valor), tienes la dirección exacta donde está guardado.\n\n**🔑 Concepto Clave:**\n- **Variable normal**: Contiene el valor directamente\n- **Puntero**: Contiene la dirección de memoria donde está el valor\n\n**💡 Analogía cotidiana:**\nImagina que tienes una carta importante:\n- Variable normal = Tienes la carta en tu bolsillo\n- Puntero = Tienes la dirección de donde está la carta",
        examples: [
          {
            code: `// 🎯 Introducción a Punteros
// Este es tu primer programa con punteros

#include <iostream>

int main() {
    // Una variable normal
    int edad = 25;

    // Un puntero a un entero
    int* puntero_a_edad;

    // Hacemos que el puntero apunte a la variable
    puntero_a_edad = &edad;

    // Mostramos los valores
    std::cout << "Valor de edad: " << edad << std::endl;
    std::cout << "Dirección de edad: " << puntero_a_edad << std::endl;
    std::cout << "Valor al que apunta el puntero: " << *puntero_a_edad << std::endl;

    return 0;
}`,
            explanation: "📮 **Desglosemos el código:**\n\n1. `int edad = 25;` → Creamos una variable normal\n2. `int* puntero_a_edad;` → Declaramos un puntero\n3. `puntero_a_edad = &edad;` → El puntero apunta a la variable (obtiene la dirección)\n4. `*puntero_a_edad` → Accedemos al valor al que apunta el puntero"
          }
        ],
        exercises: [
          "🎯 Crea una variable entera con tu edad",
          "📮 Declara un puntero que apunte a esa variable",
          "🔓 Usa el operador * para mostrar el valor al que apunta",
          "📍 Usa el operador & para mostrar la dirección de memoria",
          "🔄 Modifica el valor usando el puntero y verifica el cambio"
        ]
      },
      intermediate: {
        theory: "Los punteros son variables especiales que almacenan direcciones de memoria. En C++, una dirección de memoria es un número que representa la ubicación exacta donde se almacena un dato en la RAM.\n\n**Características técnicas:**\n- **Tamaño fijo**: En x64, los punteros ocupan 8 bytes\n- **Tipos**: Cada tipo de puntero está asociado a un tipo de dato\n- **Operadores**: & (dirección), * (desreferencia)\n\n**Importancia en C++:**\n- Gestión dinámica de memoria\n- Estructuras de datos eficientes\n- Paso de parámetros por referencia\n- Programación de bajo nivel",
        examples: [
          {
            code: `#include <iostream>

int main() {
    int numero = 42;
    int* ptr = &numero;

    std::cout << "=== ANÁLISIS DE MEMORIA ===" << std::endl;
    std::cout << "Valor: " << numero << std::endl;
    std::cout << "Dirección: " << ptr << std::endl;
    std::cout << "Tamaño del puntero: " << sizeof(ptr) << " bytes" << std::endl;
    std::cout << "Tamaño del entero: " << sizeof(numero) << " bytes" << std::endl;
    std::cout << "Valor desreferenciado: " << *ptr << std::endl;

    // Modificación a través del puntero
    *ptr = 100;
    std::cout << "Nuevo valor: " << numero << std::endl;

    return 0;
}`,
            explanation: "Este ejemplo muestra el análisis completo de memoria con punteros, incluyendo tamaños y modificación de valores."
          }
        ],
        exercises: [
          "🔍 Experimenta con diferentes tipos de datos (float, char, bool)",
          "📏 Usa sizeof() para comparar tamaños de variables vs punteros",
          "🔄 Implementa un swap de valores usando punteros",
          "📊 Crea un programa que muestre direcciones de múltiples variables",
          "🛡️ Practica verificaciones de seguridad con punteros"
        ]
      },
      expert: {
        theory: "Los punteros en C++ son la base de la gestión de memoria y el acceso directo a recursos del sistema. Comprender su funcionamiento es esencial para:\n\n**Aplicaciones avanzadas:**\n- **Sistemas embebidos**: Control directo de hardware\n- **Motores de videojuegos**: Gestión optimizada de recursos\n- **Sistemas operativos**: Manejo de memoria a bajo nivel\n- **Bibliotecas de alto rendimiento**: Optimización de estructuras de datos\n\n**Consideraciones técnicas:**\n- **Alineación de memoria**: Impacto en rendimiento\n- **Cache locality**: Efectos en velocidad de ejecución\n- **Memory leaks**: Riesgos de gestión manual\n- **Thread safety**: Concurrencia y punteros",
        examples: [
          {
            code: `#include <iostream>
#include <iomanip>

int main() {
    std::cout << std::hex << std::showbase;

    // Análisis avanzado de memoria
    int variables[] = {10, 20, 30, 40, 50};
    int* ptr = variables;

    std::cout << "=== ANÁLISIS AVANZADO DE MEMORIA ===" << std::endl;

    for(int i = 0; i < 5; i++) {
        std::cout << "Elemento[" << i << "]: " << std::endl;
        std::cout << "  Valor: " << variables[i] << std::endl;
        std::cout << "  Dirección: " << &variables[i] << std::endl;
        std::cout << "  Puntero aritmético: " << (ptr + i) << std::endl;
        std::cout << "  Desreferenciado: " << *(ptr + i) << std::endl;
        std::cout << std::endl;
    }

    return 0;
}`,
            explanation: "Ejemplo avanzado que demuestra aritmética de punteros, análisis de memoria hexadecimal y acceso a arrays mediante punteros."
          }
        ],
        exercises: [
          "⚡ Implementa aritmética de punteros con arrays multidimensionales",
          "🏗️ Crea estructuras que manejen memoria de forma eficiente",
          "🎯 Implementa algoritmos de búsqueda usando solo punteros",
          "🔒 Analiza implicaciones de cache con acceso a través de punteros",
          "📊 Compara rendimiento: acceso directo vs acceso mediante punteros"
        ]
      }
    }
  },
  {
    id: 1,
    title: "🎯 Punteros Básicos - T*",
    description: "Domina los fundamentos: variables, direcciones de memoria y acceso seguro. ¡Tu primer paso al mundo de los punteros!",
    difficulty: 'beginner' as const,
    topic: "Punteros Básicos",
    completed: false,
    content: {
      beginner: {
        theory: "🎯 Los punteros son como direcciones postales. En lugar de tener el regalo (valor), tienes la dirección donde está guardado.",
        examples: [
          { code: "int x = 42;\nint* ptr = &x;", explanation: "📮 'x' es como una casa con el número 42. 'ptr' es la dirección postal de esa casa." },
          { code: "std::cout << *ptr << std::endl; // Imprime 42", explanation: "🔓 Para ver qué hay dentro de la casa, usamos * (como abrir la puerta)" }
        ],
        exercises: [
          "🎯 Declara una variable normal (como una casa)",
          "📮 Crea un puntero que apunte a esa variable (consigue su dirección)",
          "🔓 Usa * para ver el valor que está dentro (abre la puerta)"
        ]
      },
      intermediate: {
        theory: "Los punteros son variables que almacenan direcciones de memoria (generalmente 8 bytes en x64). Permiten acceso indirecto a datos y son esenciales para estructuras de datos dinámicas.",
        examples: [
          { code: "int x = 42;\nint* ptr = &x;\nstd::cout << \"Dirección: \" << ptr << std::endl;\nstd::cout << \"Valor: \" << *ptr << std::endl;", explanation: "& obtiene la dirección, * accede al valor apuntado" },
          { code: "ptr = nullptr; // Puntero seguro\nif (ptr != nullptr) {\n    *ptr = 100;\n}", explanation: "nullptr previene accesos a memoria inválida" }
        ],
        exercises: [
          "🔧 Experimenta con diferentes tipos de datos (float, char, bool)",
          "📏 Usa sizeof() para ver el tamaño de punteros vs variables normales",
          "🛡️ Implementa verificaciones de nullptr antes de cada acceso",
          "🔄 Modifica valores a través de punteros y observa los cambios"
        ]
      },
      expert: {
        theory: "Los punteros en C++ son tipos que contienen direcciones de memoria. Su tamaño es fijo (8 bytes en x64) independiente del tipo apuntado. La aritmética de punteros opera en bytes y requiere comprensión del modelo de memoria.",
        examples: [
          { code: "int arr[5] = {10,20,30,40,50};\nint* ptr = arr;\nstd::cout << sizeof(int*) << \" bytes\" << std::endl;\nstd::cout << ptr[2] << \" == \" << *(ptr + 2) << std::endl;", explanation: "Punteros tienen tamaño fijo. Sintaxis [] y *(ptr + n) son equivalentes" },
          { code: "struct Node { int data; Node* next; };\nNode* head = new Node{42, nullptr};\nstd::cout << head->data << std::endl; // Equivalente a (*head).data", explanation: "Punteros a structs usan -> para acceso a miembros" }
        ],
        exercises: [
          "⚡ Implementa aritmética de punteros con arrays multidimensionales",
          "🏗️ Crea estructuras autorreferenciales (linked lists con punteros)",
          "🎯 Implementa algoritmos de búsqueda usando solo punteros",
          "🔒 Analiza implicaciones de cache con acceso a través de punteros",
          "📊 Compara rendimiento: acceso directo vs punteros"
        ]
      }
    }
  },
  {
    id: 2,
    title: "🛡️ Puntero Nulo - nullptr",
    description: "Aprende a usar nullptr para punteros seguros. ¡Nunca más punteros sin inicializar!",
    difficulty: 'beginner' as const,
    topic: "Punteros Básicos",
    completed: false,
    content: {
      beginner: {
        theory: "🛡️ **¿Qué es nullptr?**\n\nnullptr es un literal especial que representa 'ningún objeto'. Es como decir 'este puntero no apunta a nada'.\n\n**🔑 Concepto Clave:**\n- **nullptr = puntero vacío/sin dirección**\n- **0 = número cero**\n- **NULL = macro obsoleto**\n\n**💡 Analogía cotidiana:**\nImagina que tienes una llave:\n- Variable normal con valor = Tienes la llave\n- Puntero nullptr = No tienes llave (está vacío)\n- Puntero sin inicializar = ¡No sabes si tienes llave o no!",
        examples: [
          {
            code: `// 🛡️ Introducción a nullptr
// Tu primer programa con punteros seguros

#include <iostream>

int main() {
    // ✅ FORMA CORRECTA: Inicializar con nullptr
    int* puntero_seguro = nullptr;

    // ❌ FORMA PELIGROSA: Puntero sin inicializar
    int* puntero_peligroso;  // ¡Contiene basura!

    // Verificar antes de usar
    if (puntero_seguro != nullptr) {
        std::cout << "Puntero seguro apunta a: " << *puntero_seguro << std::endl;
    } else {
        std::cout << "✅ Puntero seguro está vacío (nullptr)" << std::endl;
    }

    // ⚠️  Esto causaría undefined behavior:
    // std::cout << *puntero_peligroso << std::endl;

    return 0;
}`,
            explanation: "📮 **Desglosemos el código:**\n\n1. `int* puntero_seguro = nullptr;` → Inicialización segura\n2. `int* puntero_peligroso;` → ¡Peligroso! Contiene memoria basura\n3. `if (puntero_seguro != nullptr)` → Verificación obligatoria\n4. `nullptr` → Representa 'sin dirección válida'"
          },
          {
            code: `// 🛡️ Función segura con punteros
#include <iostream>

void procesar_datos(int* datos, int longitud) {
    // Verificación de seguridad obligatoria
    if (datos == nullptr || longitud <= 0) {
        std::cout << "❌ Error: Datos inválidos" << std::endl;
        return;
    }

    // Procesar datos de forma segura
    for(int i = 0; i < longitud; i++) {
        std::cout << "Dato[" << i << "] = " << datos[i] << std::endl;
    }
}

int main() {
    int numeros[] = {10, 20, 30, 40, 50};

    procesar_datos(numeros, 5);      // ✅ Funciona correctamente
    procesar_datos(nullptr, 5);      // ✅ Detecta error de forma segura

    return 0;
}`,
            explanation: "🔒 **Función segura:**\n\n1. Verifica `datos == nullptr` antes de usar\n2. Verifica longitud > 0\n3. Solo accede a memoria válida\n4. Maneja errores de forma elegante"
          }
        ],
        exercises: [
          "🎯 Declara un puntero e inicialízalo con nullptr",
          "🛡️ Escribe una función que verifique si un puntero es nullptr antes de usarlo",
          "🔄 Compara punteros usando == y != con nullptr",
          "⚠️ Identifica código peligroso que usa punteros sin inicializar",
          "🛡️ Crea una función segura que maneje parámetros puntero nulos"
        ]
      },
      intermediate: {
        theory: "En C++ moderno, nullptr es el único literal válido para inicializar punteros. Soluciona problemas históricos de C donde NULL era simplemente 0.\n\n**Ventajas de nullptr:**\n- **Type safety**: Solo funciona con punteros\n- **Claridad**: 'null pointer' vs 'cero'\n- **Sobrecarga**: Permite sobrecarga de funciones\n\n**Contextos de uso:**\n- Inicialización de miembros de clase\n- Parámetros de función opcionales\n- Retorno de funciones que pueden fallar\n- Estado 'sin objeto' en estructuras de datos",
        examples: [
          {
            code: `#include <iostream>
#include <memory>

class Procesador {
private:
    int* buffer = nullptr;
    size_t tamano = 0;

public:
    Procesador() = default;

    void asignar_buffer(size_t nuevo_tamano) {
        // Liberar buffer anterior si existe
        if (buffer != nullptr) {
            delete[] buffer;
        }

        if (nuevo_tamano > 0) {
            buffer = new int[nuevo_tamano];
            tamano = nuevo_tamano;

            // Inicializar con valores por defecto
            for(size_t i = 0; i < tamano; i++) {
                buffer[i] = 0;
            }
        } else {
            buffer = nullptr;
            tamano = 0;
        }
    }

    void mostrar_buffer() const {
        if (buffer == nullptr) {
            std::cout << "Buffer vacío (nullptr)" << std::endl;
            return;
        }

        std::cout << "Buffer contenido: ";
        for(size_t i = 0; i < tamano; i++) {
            std::cout << buffer[i] << " ";
        }
        std::cout << std::endl;
    }

    ~Procesador() {
        if (buffer != nullptr) {
            delete[] buffer;
        }
    }
};

int main() {
    Procesador p;
    p.mostrar_buffer();  // Buffer vacío

    p.asignar_buffer(3); // Asignar buffer
    p.mostrar_buffer();  // Mostrar contenido

    return 0;
}`,
            explanation: "Este ejemplo muestra gestión segura de memoria usando nullptr para indicar estado 'sin buffer'."
          }
        ],
        exercises: [
          "🏗️ Implementa una clase que use nullptr para estado 'sin objeto'",
          "🔄 Sobrecarga funciones que acepten punteros o nullptr",
          "🛡️ Crea un smart wrapper que maneje nullptr automáticamente",
          "📊 Implementa un contenedor que use nullptr como 'vacío'",
          "🔧 Refactoriza código legacy que use NULL a nullptr"
        ]
      },
      expert: {
        theory: "nullptr es un literal de tipo std::nullptr_t introducido en C++11. Es convertible implícitamente a cualquier tipo de puntero, pero no a tipos integrales.\n\n**Implementación técnica:**\n- `typedef decltype(nullptr) nullptr_t;`\n- Es un prvalue de tipo nullptr_t\n- No es un puntero, pero se convierte implícitamente\n\n**Casos edge:**\n- Templates con deducción de tipos\n- Sobrecarga de operadores\n- Interoperabilidad con C\n- Optimizaciones del compilador",
        examples: [
          {
            code: `#include <iostream>
#include <type_traits>

// Función que demuestra sobrecarga con nullptr
void procesar(void* ptr) {
    std::cout << "Procesando puntero genérico" << std::endl;
}

void procesar(int* ptr) {
    std::cout << "Procesando puntero a entero" << std::endl;
}

void procesar(std::nullptr_t) {
    std::cout << "Procesando nullptr literal" << std::endl;
}

template<typename T>
void inspeccionar(T valor) {
    std::cout << "Tipo: " << typeid(T).name() << std::endl;

    if constexpr (std::is_same_v<T, std::nullptr_t>) {
        std::cout << "Es nullptr_t" << std::endl;
    } else if constexpr (std::is_pointer_v<T>) {
        std::cout << "Es puntero" << std::endl;
    } else {
        std::cout << "Es otro tipo" << std::endl;
    }
}

int main() {
    int* int_ptr = nullptr;
    void* void_ptr = nullptr;

    procesar(int_ptr);    // Llama a procesar(int*)
    procesar(void_ptr);   // Llama a procesar(void*)
    procesar(nullptr);    // Llama a procesar(nullptr_t)

    std::cout << std::endl;
    inspeccionar(nullptr);  // std::nullptr_t
    inspeccionar(int_ptr);  // int*

    return 0;
}`,
            explanation: "Ejemplo avanzado que demuestra:\n1. Sobrecarga de funciones con nullptr\n2. Deducción de tipos en templates\n3. Diferencias entre punteros nullptr y nullptr literal\n4. Type traits para identificación de tipos"
          }
        ],
        exercises: [
          "🔧 Implementa sobrecarga de funciones usando nullptr_t",
          "📝 Crea templates que manejen nullptr de forma especial",
          "🎯 Usa type traits para detectar nullptr_t en tiempo de compilación",
          "⚡ Optimiza código usando propiedades de nullptr",
          "🔄 Implementa conversión segura entre tipos de punteros y nullptr",
          "🧪 Escribe tests que verifiquen comportamiento de nullptr en templates"
        ]
      }
    }
  },
  {
    id: 3,
    title: "⚠️ Punteros Colgantes - Dangling",
    description: "Identifica y previene los peligrosos punteros colgantes que causan crashes impredecibles.",
    difficulty: 'beginner' as const,
    topic: "Punteros Básicos",
    completed: false,
    content: {
      beginner: {
        theory: "⚠️ **¿Qué es un puntero colgante?**\n\nUn puntero colgante (dangling pointer) es un puntero que apunta a memoria que ya ha sido liberada. Es como tener una llave que abre una puerta que ya no existe.\n\n**🔑 Concepto Clave:**\n- **Puntero válido** = Apunta a memoria viva y accesible\n- **Puntero colgante** = Apunta a memoria muerta/liberada\n- **Acceso** = 💥 CAUSA CRASH O COMPORTAMIENTO IMPREDECIBLE\n\n**💡 Analogía cotidiana:**\nImagina que tienes una llave que abría tu casa:\n- Casa existe = Puntero válido\n- Casa demolida = Puntero colgante\n- Usar la llave = ¡PELIGRO!",
        examples: [
          {
            code: `// ⚠️ Punteros Colgantes - ¡CUIDADO!
// Este código demuestra el PELIGRO de los punteros colgantes

#include <iostream>

int main() {
    // ✅ PASO 1: Crear un puntero válido
    int* puntero = new int(42);
    std::cout << "1. Puntero creado: " << *puntero << std::endl;

    // ❌ PASO 2: Liberar la memoria
    delete puntero;
    std::cout << "2. Memoria liberada con delete" << std::endl;

    // 💥 ¡PELIGRO! El puntero ahora está COLGANTE
    // Apunta a memoria que ya no nos pertenece
    std::cout << "3. ⚠️  Puntero colgante: " << *puntero << std::endl;

    // ✅ SOLUCIÓN: Asignar nullptr después de delete
    puntero = nullptr;
    std::cout << "4. ✅ Puntero ahora es nullptr (seguro)" << std::endl;

    return 0;
}`,
            explanation: "💥 **Desglosemos el PELIGRO:**\n\n1. `new int(42)` → Creamos memoria y obtenemos puntero\n2. `delete puntero` → Liberamos memoria, ¡pero el puntero sigue apuntando ahí!\n3. `*puntero` → 💥 ¡ACCESO A MEMORIA LIBERADA!\n4. `puntero = nullptr` → ✅ Solución: el puntero ya no apunta a nada"
          },
          {
            code: `// 🛡️ Función SEGURA que evita punteros colgantes
#include <iostream>

int* crear_numero(int valor) {
    return new int(valor);
}

void procesar_numero(int* numero) {
    if (numero != nullptr) {
        std::cout << "Procesando: " << *numero << std::endl;
    } else {
        std::cout << "❌ Error: Numero es nullptr" << std::endl;
    }
}

void liberar_numero(int*& numero) {  // Parámetro por referencia
    if (numero != nullptr) {
        delete numero;
        numero = nullptr;  // ✅ ¡IMPORTANTE! Asignar nullptr
    }
}

int main() {
    // ✅ FORMA SEGURA
    int* numero = crear_numero(100);
    procesar_numero(numero);
    liberar_numero(numero);  // Libera Y asigna nullptr automáticamente

    // ✅ Ahora es seguro usar el puntero
    if (numero == nullptr) {
        std::cout << "✅ Numero liberado correctamente" << std::endl;
    }

    return 0;
}`,
            explanation: "🛡️ **Función segura que previene dangling pointers:**\n\n1. `liberar_numero(int*& numero)` → Parámetro por referencia para modificar el puntero\n2. `delete numero` → Libera la memoria\n3. `numero = nullptr` → ✅ Previene puntero colgante\n4. Verificación final → Confirma que está seguro"
          }
        ],
        exercises: [
          "⚠️ Identifica dónde se crean punteros colgantes en código dado",
          "💥 Ejecuta código con dangling pointers y observa los crashes",
          "🛡️ Modifica funciones para que asignen nullptr después de delete",
          "🔄 Crea una función segura que libere memoria y evite dangling pointers",
          "📝 Escribe código que demuestre el peligro y la solución",
          "🛡️ Implementa una clase que maneje punteros sin crear dangling pointers"
        ]
      },
      intermediate: {
        theory: "Los punteros colgantes son una de las fuentes más comunes de bugs en C++. Ocurren cuando:\n\n**Causas principales:**\n- **Delete manual**: Liberar memoria pero no limpiar punteros\n- **Scope de variables**: Variables locales que salen de scope\n- **Referencias inválidas**: Referencias a objetos destruidos\n- **API mal diseñada**: Funciones que retornan punteros a memoria local\n\n**Consecuencias:**\n- **Crashes aleatorios**: El programa puede funcionar o fallar\n- **Corrupción de datos**: Modificación de memoria no perteneciente\n- **Vulnerabilidades de seguridad**: Posibles exploits\n- **Comportamiento indefinido**: Resultados impredecibles",
        examples: [
          {
            code: `#include <iostream>
#include <memory>

class Administrador {
private:
    int* datos = nullptr;
    size_t tamano = 0;

public:
    Administrador(size_t t) {
        if (t > 0) {
            tamano = t;
            datos = new int[t];
            for(size_t i = 0; i < t; i++) {
                datos[i] = i * 10;
            }
        }
    }

    int* obtener_datos() {
        return datos;  // ⚠️ ¡PELIGRO! Retornamos puntero interno
    }

    void liberar_datos() {
        if (datos != nullptr) {
            delete[] datos;
            datos = nullptr;  // ✅ Buena práctica
            tamano = 0;
        }
    }

    ~Administrador() {
        liberar_datos();  // ✅ Destructor seguro
    }
};

int main() {
    Administrador admin(5);

    // ⚠️ ¡CUIDADO! Este puntero puede volverse colgante
    int* datos_externos = admin.obtener_datos();

    std::cout << "Datos iniciales: ";
    for(size_t i = 0; i < 5; i++) {
        std::cout << datos_externos[i] << " ";
    }
    std::cout << std::endl;

    // ❌ ¡PROBLEMA! Si admin libera datos, datos_externos se vuelve colgante
    admin.liberar_datos();

    // 💥 ¡ESTO PODRÍA CRASHEAR!
    // std::cout << datos_externos[0] << std::endl;

    return 0;
}`,
            explanation: "Ejemplo de dangling pointer causado por mal diseño de API:\n1. `obtener_datos()` retorna puntero interno\n2. Si el objeto libera memoria, el puntero externo se vuelve inválido\n3. Acceso posterior = comportamiento indefinido\n4. Solución: usar referencias o copias en lugar de punteros internos"
          }
        ],
        exercises: [
          "🏗️ Diseña una clase que evite exponer punteros internos",
          "🔄 Implementa patrón RAII para gestión automática de memoria",
          "📝 Crea ejemplos que muestren diferentes causas de dangling pointers",
          "🛡️ Refactoriza código legacy para eliminar dangling pointers",
          "⚡ Implementa sistema de debugging que detecte punteros colgantes",
          "🎯 Crea wrapper seguro que prevenga acceso a punteros inválidos"
        ]
      },
      expert: {
        theory: "Los punteros colgantes representan un problema fundamental de la gestión manual de memoria en C++. Técnicamente:\n\n**Problema técnico:**\n- **Race conditions**: Entre delete y acceso posterior\n- **Cache invalidation**: Memoria puede ser reutilizada\n- **Memory fragmentation**: Afecta rendimiento del sistema\n- **Debugging difficulty**: Comportamiento no determinístico\n\n**Soluciones avanzadas:**\n- **Smart pointers**: RAII automático\n- **Reference counting**: Detección automática de liberación\n- **Memory pools**: Gestión controlada de memoria\n- **Static analysis**: Herramientas de detección automática",
        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <vector>

// Ejemplo avanzado: Comparación de técnicas seguras vs peligrosas

// ❌ VERSIÓN PELIGROSA - Dangling pointers
void version_peligrosa() {
    std::vector<int*> punteros;

    for(int i = 0; i < 5; i++) {
        int* temp = new int(i * 10);
        punteros.push_back(temp);
    }

    // Usar punteros
    for(int* ptr : punteros) {
        std::cout << *ptr << " ";
    }
    std::cout << std::endl;

    // ❌ ¡PROBLEMA! Liberar algunos punteros
    for(size_t i = 0; i < punteros.size(); i += 2) {
        delete punteros[i];
        punteros[i] = nullptr;  // Solo algunos asignamos nullptr
    }

    // 💥 ¡PELIGRO! Algunos punteros son colgantes
    for(int* ptr : punteros) {
        if(ptr != nullptr) {
            std::cout << *ptr << " ";  // ✅ Seguro
        } else {
            std::cout << "nullptr ";
        }
    }
    std::cout << std::endl;
}

// ✅ VERSIÓN SEGURA - Smart pointers
void version_segura() {
    std::vector<std::unique_ptr<int>> punteros_inteligentes;

    for(int i = 0; i < 5; i++) {
        punteros_inteligentes.push_back(std::make_unique<int>(i * 10));
    }

    // Usar punteros inteligentes
    for(const auto& ptr : punteros_inteligentes) {
        std::cout << *ptr << " ";
    }
    std::cout << std::endl;

    // ✅ Automáticamente seguro - no dangling pointers posibles
    punteros_inteligentes.clear();  // Memoria liberada automáticamente
    std::cout << "✅ Memoria liberada automáticamente" << std::endl;
}

int main() {
    std::cout << "🔴 VERSIÓN PELIGROSA:" << std::endl;
    version_peligrosa();

    std::cout << "\n🟢 VERSIÓN SEGURA:" << std::endl;
    version_segura();

    return 0;
}`,
            explanation: "Comparación experta entre gestión manual (peligrosa) y smart pointers (seguros):\n1. **Manual**: Requiere cuidado extremo, fácil crear dangling pointers\n2. **Smart pointers**: Gestión automática, imposible crear dangling pointers\n3. `std::unique_ptr`: Propiedad exclusiva, liberación automática\n4. `std::make_unique`: Creación segura sin new manual"
          }
        ],
        exercises: [
          "🔧 Implementa detector de dangling pointers usando técnicas avanzadas",
          "📊 Compara rendimiento entre raw pointers y smart pointers",
          "🏗️ Diseña patrón RAII personalizado para tu dominio",
          "⚡ Implementa memory pool que evite dangling pointers",
          "🛡️ Crea sistema de validación de punteros en tiempo de ejecución",
          "🎯 Desarrolla herramienta de análisis estático para dangling pointers",
          "🔄 Migra sistema legacy de raw pointers a smart pointers"
        ]
      }
    }
  },
  {
    id: 4,
    title: "🔧 new y delete - Gestión Manual",
    description: "Domina la asignación y liberación manual de memoria. ¡El poder viene con responsabilidad!",
    difficulty: 'beginner' as const,
    topic: "Gestión de Memoria",
    completed: false,
    content: {
      beginner: {
        theory: "🔧 **¿Qué es new y delete?**\n\n**new**: Es un operador que reserva memoria en el HEAP y devuelve un puntero a esa memoria.\n**delete**: Es un operador que libera la memoria que fue reservada con new.\n\n**💡 Analogía cotidiana:**\nImagina que vas a una biblioteca:\n- `new` = Pedir prestado un libro (te dan la ubicación)\n- El puntero = La ubicación del libro en los estantes\n- `delete` = Devolver el libro para que otros lo usen\n\n**⚠️ REGLA DE ORO:** **Cada new debe tener exactamente un delete**",
        examples: [
          {
            code: `// 🔧 new y delete - El ciclo completo de vida
#include <iostream>

int main() {
    std::cout << "=== NEW Y DELETE - GESTIÓN MANUAL ===" << std::endl;

    // 🔧 PASO 1: Crear memoria con new
    int* puntero = new int(42);
    std::cout << "1. Memoria creada con new: " << *puntero << std::endl;

    // 🔧 PASO 2: Usar la memoria
    *puntero = 100;  // Modificar el valor
    std::cout << "2. Valor modificado: " << *puntero << std::endl;

    // 🔧 PASO 3: Liberar memoria con delete
    delete puntero;
    std::cout << "3. Memoria liberada con delete" << std::endl;

    // ✅ ¡IMPORTANTE! Asignar nullptr después de delete
    puntero = nullptr;
    std::cout << "4. Puntero ahora es nullptr (seguro)" << std::endl;

    return 0;
}`,
            explanation: "📋 **Ciclo completo de new/delete:**\n\n1. `new int(42)` → Reserva memoria e inicializa con 42\n2. `*puntero = 100` → Usa la memoria como una variable normal\n3. `delete puntero` → Libera la memoria (¡OBLIGATORIO!)\n4. `puntero = nullptr` → Previene dangling pointers"
          },
          {
            code: `// 🔧 Función segura que maneja su propia memoria
#include <iostream>

void procesar_datos() {
    // Crear array dinámico
    int* datos = new int[5];

    // Inicializar datos
    for(int i = 0; i < 5; i++) {
        datos[i] = i * 10;
        std::cout << "datos[" << i << "] = " << datos[i] << std::endl;
    }

    // ⚠️ ¡REGLA CRÍTICA!
    // Si esta función termina sin delete, ¡FUGA DE MEMORIA!
    delete[] datos;  // ¡Obligatorio para arrays!
    std::cout << "✅ Memoria liberada correctamente" << std::endl;
}

int main() {
    procesar_datos();
    std::cout << "✅ Función completada sin fugas de memoria" << std::endl;
    return 0;
}`,
            explanation: "🛡️ **Función que gestiona su propia memoria:**\n\n1. `new int[5]` → Crea array dinámico\n2. Usar el array como uno normal\n3. `delete[] datos` → ¡CRÍTICO! Libera el array\n4. Sin este delete = **FUGA DE MEMORIA**\n\n**💡 Nota:** Para arrays usar `delete[]`, no `delete`"
          }
        ],
        exercises: [
          "🔧 Declara un puntero y úsalo para crear memoria con new",
          "📝 Almacena un valor en la memoria recién creada",
          "🔄 Modifica el valor a través del puntero",
          "🗑️ Libera la memoria correctamente con delete",
          "✅ Asigna nullptr después del delete para seguridad",
          "📊 Crea y usa un array dinámico con new[]",
          "🔒 Implementa una función que gestione su propia memoria"
        ]
      },
      intermediate: {
        theory: "La gestión manual de memoria es una de las características más poderosas (y peligrosas) de C++. Mientras que lenguajes como Java o Python manejan la memoria automáticamente, C++ te da el control total, pero con gran responsabilidad.\n\n**Situaciones donde usar new/delete:**\n- **Objetos grandes** que no caben en el stack\n- **Datos con vida útil indeterminada**\n- **Polimorfismo** (objetos de diferentes clases)\n- **Estructuras de datos dinámicas** (listas, árboles, grafos)\n\n**Alternativas modernas:**\n- `std::unique_ptr` y `std::shared_ptr`\n- Contenedores STL (`std::vector`, `std::string`)\n- RAII (Resource Acquisition Is Initialization)",
        examples: [
          {
            code: `#include <iostream>
#include <memory>

// ❌ VERSIÓN PELIGROSA - Gestión manual
void version_peligrosa() {
    int* manual = new int(42);

    if (rand() % 2) {  // Condición aleatoria
        std::cout << "Retornando temprano..." << std::endl;
        return;  // ¡FUGA DE MEMORIA! Olvidamos delete
    }

    std::cout << "Valor: " << *manual << std::endl;
    delete manual;  // Solo se ejecuta si no hay return temprano
}

// ✅ VERSIÓN SEGURA - Smart pointer
void version_segura() {
    std::unique_ptr<int> inteligente = std::make_unique<int>(42);

    if (rand() % 2) {
        std::cout << "Retornando temprano..." << std::endl;
        return;  // ✅ Sin fugas - el unique_ptr libera automáticamente
    }

    std::cout << "Valor: " << *inteligente << std::endl;
    // ✅ Memoria liberada automáticamente al salir del scope
}

int main() {
    std::cout << "🔴 Versión peligrosa:" << std::endl;
    // version_peligrosa();  // ¡Descomenta bajo tu propio riesgo!

    std::cout << "\n🟢 Versión segura:" << std::endl;
    version_segura();

    return 0;
}`,
            explanation: "Comparación crítica entre gestión manual y smart pointers:\n\n**Gestión Manual (Peligrosa):**\n- Fácil olvidar delete\n- Return temprano = fuga de memoria\n- Excepciones = fuga de memoria\n- Requiere disciplina extrema\n\n**Smart Pointers (Seguros):**\n- Liberación automática\n- Excepciones-safe\n- No memory leaks\n- Gestión automática"
          }
        ],
        exercises: [
          "🏗️ Implementa una clase que use new/delete para gestión interna",
          "🛡️ Crea funciones que manejen returns tempranos sin fugas",
          "🔄 Compara el uso de raw pointers vs smart pointers",
          "📊 Implementa una estructura de datos que use new/delete",
          "⚡ Mide el rendimiento de gestión manual vs automática",
          "🛡️ Refactoriza código legacy para usar smart pointers",
          "🎯 Identifica y arregla memory leaks en código existente"
        ]
      },
      expert: {
        theory: "La gestión manual de memoria es fundamental para el rendimiento y control en sistemas embebidos, motores de videojuegos y aplicaciones de alto rendimiento. Sin embargo, requiere un entendimiento profundo de:\n\n**Aspectos técnicos avanzados:**\n- **Memory alignment** y optimización de cache\n- **Placement new** para control preciso de ubicación\n- **Custom allocators** para estrategias específicas\n- **Memory pools** para evitar fragmentación\n- **Exception safety** en gestión manual\n\n**Patrones de diseño:**\n- **RAII (Resource Acquisition Is Initialization)**\n- **Smart pointers con deleters personalizados**\n- **Memory ownership semantics**\n- **Rule of Three/Five/Zero**",
        examples: [
          {
            code: `#include <iostream>
#include <new>  // Para placement new
#include <memory>

// Ejemplo avanzado: Placement new y custom allocation
class Buffer {
private:
    char* data;
    size_t size;

public:
    Buffer(size_t s) : size(s) {
        data = new char[size];
        std::cout << "Constructor: " << size << " bytes asignados" << std::endl;
    }

    // Placement new - construye objeto en memoria existente
    void* operator new(size_t, void* location) {
        std::cout << "Placement new: usando memoria existente" << std::endl;
        return location;
    }

    // Constructor para placement new
    Buffer(size_t s, const char* initial) : size(s) {
        data = new char[size];
        if (initial) {
            std::copy(initial, initial + std::min(size, strlen(initial)), data);
        }
        std::cout << "Placement constructor: " << (initial ? initial : "sin inicialización") << std::endl;
    }

    ~Buffer() {
        delete[] data;
        std::cout << "Destructor: memoria liberada" << std::endl;
    }

    void mostrar() const {
        std::cout << "Buffer: ";
        for(size_t i = 0; i < std::min(size, size_t(10)); i++) {
            std::cout << (data[i] ? data[i] : '.');
        }
        std::cout << std::endl;
    }
};

int main() {
    std::cout << "=== NEW AVANZADO ===" << std::endl;

    // 1. New normal
    Buffer* normal = new Buffer(10);
    normal->mostrar();
    delete normal;

    std::cout << std::endl;

    // 2. Placement new
    char memoria[sizeof(Buffer)];
    Buffer* colocado = new(memoria) Buffer(5, "Hola");
    colocado->mostrar();

    // 3. Destrucción manual para placement new
    colocado->~Buffer();
    std::cout << "✅ Placement new destruido manualmente" << std::endl;

    return 0;
}`,
            explanation: "Ejemplo avanzado de técnicas de gestión manual de memoria:\n\n1. **Constructor normal** con new/delete estándar\n2. **Placement new** construye objeto en memoria pre-asignada\n3. **Destructor manual** requerido para placement new\n4. Control preciso de ciclo de vida de objetos\n\n**Casos de uso:**\n- Pools de objetos\n- Serialización personalizada\n- Optimizaciones de rendimiento extremo\n- Sistemas embebidos con memoria limitada"
          }
        ],
        exercises: [
          "🎯 Implementa placement new para optimizar creación de objetos",
          "🏗️ Crea un custom allocator para tu aplicación específica",
          "⚡ Implementa un memory pool que evite fragmentación",
          "🔧 Crea smart pointers con deleters personalizados",
          "📊 Compara rendimiento de diferentes estrategias de allocation",
          "🛡️ Implementa RAII wrapper para recursos no-memoria",
          "🎨 Diseña sistema de gestión de memoria para motor de videojuegos",
          "🔍 Implementa herramientas de debugging para memory leaks"
        ]
      }
    }
  },
  {
    id: 5,
    title: "💥 Double Delete - El Error Fatal",
    description: "Aprende a evitar el double delete que corrompe el heap y causa crashes catastróficos.",
    difficulty: 'intermediate' as const,
    topic: "Gestión de Memoria",
    completed: false,
    content: {
      beginner: {
        theory: "💥 **¿Qué es el Double Delete?**\n\nEl **double delete** es uno de los errores más peligrosos en C++. Ocurre cuando llamas `delete` dos veces en el mismo puntero, causando corrupción del heap y crashes impredecibles.\n\n**🔑 Concepto Clave:**\n- **Primera llamada a delete**: ✅ Libera memoria correctamente\n- **Segunda llamada a delete**: 💥 **CORROMPE EL HEAP**\n- **Resultado**: Crash, comportamiento indefinido, vulnerabilidades de seguridad\n\n**💡 Analogía cotidiana:**\nImagina que devuelves un libro a la biblioteca:\n- Primera devolución = Todo bien\n- Segunda devolución = ¡Confusión total! El sistema de la biblioteca se corrompe",
        examples: [
          {
            code: `// 💥 DOUBLE DELETE - ¡ERROR FATAL!
// Este código causa CORRUPCIÓN DEL HEAP

#include <iostream>

int main() {
    std::cout << "=== DEMOSTRACIÓN DOUBLE DELETE ===" << std::endl;

    // ✅ PASO 1: Crear memoria
    int* puntero = new int(42);
    std::cout << "1. Memoria creada: " << *puntero << std::endl;

    // ✅ PASO 2: Primer delete (correcto)
    delete puntero;
    std::cout << "2. Primer delete: memoria liberada" << std::endl;

    // 💥 PASO 3: ¡SEGUNDO DELETE! (FATAL)
    std::cout << "3. ⚠️  Intentando segundo delete..." << std::endl;
    // delete puntero;  // ¡ESTO CAUSARÍA CRASH!

    std::cout << "4. ✅ Segundo delete comentado para evitar crash" << std::endl;

    return 0;
}`,
            explanation: "💥 **¿Por qué es tan peligroso?**\n\n1. `new int(42)` → Crea memoria en el heap\n2. `delete puntero` → Libera memoria correctamente\n3. `delete puntero` → 💥 **CORRUPCIÓN DEL HEAP**\n\n**¿Qué pasa internamente?**\n- El heap manager marca la memoria como libre\n- Segundo delete intenta liberar memoria ya liberada\n- Estructuras de datos del heap se corrompen\n- Resultado: Crash inmediato o problemas posteriores"
          },
          {
            code: `// 🛡️ PREVENCIÓN DE DOUBLE DELETE
#include <iostream>

int main() {
    std::cout << "=== PREVENCIÓN DOUBLE DELETE ===" << std::endl;

    // ✅ FORMA SEGURA: Asignar nullptr después de delete
    int* seguro = new int(100);
    std::cout << "1. Puntero creado: " << *seguro << std::endl;

    // Liberar y asignar nullptr
    delete seguro;
    seguro = nullptr;  // ✅ ¡PROTECCIÓN!
    std::cout << "2. Memoria liberada y puntero = nullptr" << std::endl;

    // ✅ Ahora es seguro llamar delete nuevamente
    if (seguro != nullptr) {
        delete seguro;
        std::cout << "3. Delete condicional ejecutado" << std::endl;
    } else {
        std::cout << "3. ✅ Delete omitido porque puntero es nullptr" << std::endl;
    }

    // ✅ Función segura que previene double delete
    auto delete_seguro = [](int*& ptr) {
        if (ptr != nullptr) {
            delete ptr;
            ptr = nullptr;
            std::cout << "Función: Puntero liberado y puesto a nullptr" << std::endl;
        } else {
            std::cout << "Función: Puntero ya era nullptr" << std::endl;
        }
    };

    // Probar función segura
    int* test = new int(200);
    delete_seguro(test);  // Libera y asigna nullptr
    delete_seguro(test);  // Seguro, no hace nada

    return 0;
}`,
            explanation: "🛡️ **Técnicas de prevención:**\n\n1. **Asignar nullptr después de delete**\n2. **Verificar antes de cada delete**\n3. **Usar funciones helper seguras**\n4. **Smart pointers (solución automática)**\n\n**Regla de oro:** **Siempre asigna nullptr después de delete**"
          }
        ],
        exercises: [
          "💥 Crea código que demuestre el peligro del double delete",
          "🛡️ Modifica el código para prevenir double delete con nullptr",
          "🔄 Implementa una función segura que libere memoria sin riesgos",
          "⚠️ Identifica todos los lugares en código donde puede ocurrir double delete",
          "✅ Crea una clase que garantice que delete solo se llame una vez",
          "📝 Escribe código que muestre las consecuencias del double delete"
        ]
      },
      intermediate: {
        theory: "El double delete es especialmente problemático en programas complejos con múltiples propietarios de punteros. Los síntomas pueden no aparecer inmediatamente, haciendo el debugging muy difícil.\n\n**Síntomas del double delete:**\n- **Crashes aleatorios** en tiempo de ejecución\n- **Corrupción de datos** en estructuras no relacionadas\n- **Violaciones de acceso** en malloc/free\n- **Comportamiento errático** del programa\n\n**Situaciones de riesgo:**\n- **Punteros compartidos** entre funciones\n- **Containers de punteros** sin gestión clara\n- **Excepciones** que interrumpen la limpieza\n- **Código legacy** sin convenciones claras",
        examples: [
          {
            code: `#include <iostream>
#include <vector>
#include <exception>

class GestorRecursos {
private:
    int* recurso;
    bool liberado;

public:
    GestorRecursos(int valor = 0) : recurso(new int(valor)), liberado(false) {
        std::cout << "Recurso creado: " << *recurso << std::endl;
    }

    ~GestorRecursos() {
        liberar();
    }

    void liberar() {
        if (!liberado) {
            delete recurso;
            recurso = nullptr;
            liberado = true;
            std::cout << "Recurso liberado" << std::endl;
        }
    }

    int* obtener_recurso() {
        return recurso;
    }
};

void funcion_riesgosa() {
    GestorRecursos gestor(42);
    int* puntero_externo = gestor.obtener_recurso();

    std::cout << "Usando recurso: " << *puntero_externo << std::endl;

    // ⚠️ ¡PROBLEMA! Si hay una excepción aquí...
    // throw std::runtime_error("Error inesperado");

    // Y luego alguien más intenta usar el puntero...
    // delete puntero_externo;  // ¡DOUBLE DELETE!

    // Solución: no liberar manualmente, dejar que el destructor lo haga
}

int main() {
    try {
        funcion_riesgosa();
    } catch (const std::exception& e) {
        std::cout << "Excepción capturada: " << e.what() << std::endl;
        // El destructor de GestorRecursos se llama automáticamente
        // y libera el recurso de forma segura
    }

    return 0;
}`,
            explanation: "Ejemplo de double delete en gestión compleja de recursos:\n\n**Problemas comunes:**\n1. **Múltiples propietarios** de un mismo puntero\n2. **Excepciones** que interrumpen limpieza\n3. **Falta de convención** clara de ownership\n4. **Destructores manuales** mal implementados\n\n**Soluciones:**\n- RAII (Resource Acquisition Is Initialization)\n- Smart pointers para ownership claro\n- Excepciones-safe code\n- Convenciones claras de responsabilidad"
          }
        ],
        exercises: [
          "🏗️ Implementa una clase RAII que prevenga double delete",
          "🛡️ Crea un sistema de gestión de recursos que evite double delete",
          "🔄 Refactoriza código con potencial de double delete",
          "⚡ Implementa smart pointer básico que prevenga double delete",
          "🎯 Identifica y arregla double delete en código legacy",
          "📊 Mide el impacto de double delete en performance",
          "🛡️ Crea framework para debugging de problemas de memoria"
        ]
      },
      expert: {
        theory: "El double delete es un síntoma de problemas de diseño más profundos en la gestión de recursos. Técnicamente, corrompe las estructuras de datos internas del heap manager.\n\n**Corrupción técnica del heap:**\n- **Free lists** se corrompen con punteros inválidos\n- **Metadata de bloques** se sobrescribe incorrectamente\n- **Boundary checks** fallan con datos corruptos\n- **Memory fragmentation** se acelera\n\n**Herramientas de detección:**\n- **Valgrind** para Linux (memcheck)\n- **AddressSanitizer** para GCC/Clang\n- **Dr. Memory** para Windows\n- **Custom heap managers** con debugging",
        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <vector>

// Ejemplo experto: Detección y prevención avanzada de double delete

class HeapMonitor {
private:
    static std::vector<void*> allocated_blocks;

public:
    static void* allocate(size_t size) {
        void* block = malloc(size);
        if (block) {
            allocated_blocks.push_back(block);
            std::cout << "📦 Bloque asignado: " << block << std::endl;
        }
        return block;
    }

    static void deallocate(void* block) {
        if (!block) return;

        // Buscar si el bloque ya fue liberado
        auto it = std::find(allocated_blocks.begin(), allocated_blocks.end(), block);
        if (it == allocated_blocks.end()) {
            std::cout << "❌ ERROR: Intento de liberar bloque no asignado: " << block << std::endl;
            return;
        }

        std::cout << "🗑️  Liberando bloque: " << block << std::endl;
        free(block);
        allocated_blocks.erase(it);
    }

    static void report_leaks() {
        std::cout << "📊 Estado actual del heap:" << std::endl;
        std::cout << "   Bloques asignados: " << allocated_blocks.size() << std::endl;
        for (void* block : allocated_blocks) {
            std::cout << "   ❌ Fuga detectada: " << block << std::endl;
        }
    }
};

std::vector<void*> HeapMonitor::allocated_blocks;

void demo_double_delete_detection() {
    std::cout << "🎯 DEMO: Detección de Double Delete" << std::endl;

    // Asignación normal
    int* ptr1 = new int(1);
    int* ptr2 = new int(2);

    // Simular double delete
    delete ptr1;  // ✅ Correcto
    // delete ptr1;  // ❌ Double delete detectado por herramientas

    delete ptr2;  // ✅ Correcto

    HeapMonitor::report_leaks();
}

int main() {
    demo_double_delete_detection();

    std::cout << "\n🛡️ COMPARACIÓN: Raw Pointers vs Smart Pointers" << std::endl;

    // ❌ Peligroso: Raw pointers requieren disciplina
    {
        int* raw = new int(42);
        // Olvidar delete = fuga de memoria
        // Double delete = corrupción
    }

    // ✅ Seguro: Smart pointers automáticos
    {
        std::unique_ptr<int> smart = std::make_unique<int>(42);
        // Memoria liberada automáticamente
        // ¡Imposible hacer double delete!
    }

    return 0;
}`,
            explanation: "Ejemplo avanzado de detección y prevención de double delete:\n\n1. **Heap Monitor** personalizado para debugging\n2. **Tracking de bloques** asignados\n3. **Detección de double free**\n4. **Comparación** raw pointers vs smart pointers\n\n**Técnicas avanzadas:**\n- **Memory tracking** para debugging\n- **Custom allocators** con validación\n- **RAII patterns** para gestión automática\n- **Static analysis** para detección en compile-time"
          }
        ],
        exercises: [
          "🔧 Implementa un heap monitor personalizado para detectar double delete",
          "📊 Crea sistema de profiling de uso de memoria",
          "⚡ Implementa custom allocator con debugging de double delete",
          "🎯 Usa AddressSanitizer para detectar problemas de memoria",
          "🏗️ Diseña patrón RAII que prevenga double delete por diseño",
          "🔍 Implementa static analyzer básico para double delete",
          "📈 Crea benchmarks que muestren costo de detección vs performance",
          "🛡️ Desarrolla librería segura que elimine posibilidad de double delete"
        ]
      }
    }
  },
  {
    id: 6,
    title: "📊 Arrays Dinámicos - new[]/delete[]",
    description: "Domina los arrays dinámicos. Las reglas son diferentes y las consecuencias peores.",
    difficulty: 'intermediate' as const,
    topic: "Gestión de Memoria",
    completed: false,
    content: {
      beginner: {
        theory: "📊 **¿Qué son los Arrays Dinámicos?**\n\nLos arrays dinámicos permiten crear arrays cuyo tamaño se determina en tiempo de ejecución. A diferencia de los arrays normales que tienen tamaño fijo, los arrays dinámicos se crean en el HEAP.\n\n**🔑 Concepto Clave:**\n- **Array estático**: `int arr[5];` - Tamaño fijo en compilación\n- **Array dinámico**: `new int[5];` - Tamaño variable en ejecución\n- **new[]**: Reserva memoria para múltiples elementos\n- **delete[]**: Libera memoria de arrays dinámicos\n\n**⚠️ REGLA CRÍTICA:** **new[] siempre debe ir con delete[]**",
        examples: [
          {
            code: `// 📊 ARRAYS DINÁMICOS - Tu primer array en el heap
#include <iostream>

int main() {
    std::cout << "=== ARRAYS DINÁMICOS CON new[] ===" << std::endl;

    // ✅ Crear array dinámico de 5 enteros
    int* array_dinamico = new int[5];
    std::cout << "1. Array dinámico creado en el heap" << std::endl;

    // ✅ Inicializar valores
    for(int i = 0; i < 5; i++) {
        array_dinamico[i] = (i + 1) * 10;
        std::cout << "   array_dinamico[" << i << "] = " << array_dinamico[i] << std::endl;
    }

    // ✅ Usar el array como uno normal
    std::cout << "2. Suma de elementos: ";
    int suma = 0;
    for(int i = 0; i < 5; i++) {
        suma += array_dinamico[i];
    }
    std::cout << suma << std::endl;

    // ⚠️ ¡CRÍTICO! Liberar con delete[] (no delete)
    delete[] array_dinamico;
    array_dinamico = nullptr;
    std::cout << "3. ✅ Array liberado correctamente con delete[]" << std::endl;

    return 0;
}`,
            explanation: "📋 **Ciclo completo de new[]/delete[]:**\n\n1. `new int[5]` → Reserva espacio para 5 enteros en el heap\n2. `array_dinamico[i]` → Acceso normal como array estático\n3. `delete[] array_dinamico` → ¡OBLIGATORIO! Libera el array completo\n4. `nullptr` → Previene dangling pointers\n\n**💡 Nota:** delete[] llama al destructor de cada elemento si es una clase"
          },
          {
            code: `// 📊 COMPARACIÓN: Array estático vs dinámico
#include <iostream>

int main() {
    std::cout << "=== ARRAY ESTÁTICO vs DINÁMICO ===" << std::endl;

    // 🔵 ARRAY ESTÁTICO - Tamaño fijo
    int estatico[3] = {1, 2, 3};
    std::cout << "Array estático: ";
    for(int valor : estatico) {
        std::cout << valor << " ";
    }
    std::cout << std::endl;

    // 🟢 ARRAY DINÁMICO - Tamaño variable
    int tamano = 3;
    int* dinamico = new int[tamano];

    // Inicializar dinámicamente
    for(int i = 0; i < tamano; i++) {
        dinamico[i] = (i + 1) * 100;
    }

    std::cout << "Array dinámico: ";
    for(int i = 0; i < tamano; i++) {
        std::cout << dinamico[i] << " ";
    }
    std::cout << std::endl;

    // ✅ Liberar memoria
    delete[] dinamico;
    dinamico = nullptr;

    return 0;
}`,
            explanation: "🔄 **Comparación clave:**\n\n**Array Estático:**\n- Tamaño conocido en compilación\n- Vive en stack\n- Se destruye automáticamente\n- Sintaxis simple: `int arr[5]`\n\n**Array Dinámico:**\n- Tamaño decidido en ejecución\n- Vive en heap\n- Debes liberarlo manualmente\n- Sintaxis: `new int[5]`, `delete[]`"
          }
        ],
        exercises: [
          "📊 Declara un array dinámico con new[] especificando el tamaño",
          "🔄 Inicializa todos los elementos del array dinámico",
          "📝 Calcula la suma de todos los elementos",
          "🗑️ Libera correctamente la memoria con delete[]",
          "✅ Asigna nullptr después de delete[]",
          "🔢 Crea una función que devuelva un array dinámico",
          "📏 Implementa redimensionamiento dinámico de arrays"
        ]
      },
      intermediate: {
        theory: "Los arrays dinámicos son fundamentales para estructuras de datos flexibles, pero requieren cuidado especial. new[] no solo reserva memoria, sino que también llama a constructores si es necesario.\n\n**Diferencias críticas con new:**\n- **new**: Para objetos individuales\n- **new[]**: Para arrays de objetos\n- **delete**: Llama destructor una vez\n- **delete[]**: Llama destructor para cada elemento\n\n**Casos de uso avanzados:**\n- Arrays de objetos personalizados\n- Buffers de tamaño variable\n- Caches dinámicos\n- Pools de objetos",
        examples: [
          {
            code: `#include <iostream>
#include <string>

class Elemento {
private:
    int id;
    std::string nombre;

public:
    Elemento(int i = 0, const std::string& n = "desconocido")
        : id(i), nombre(n) {
        std::cout << "Constructor Elemento(" << id << ", " << nombre << ")" << std::endl;
    }

    ~Elemento() {
        std::cout << "Destructor Elemento(" << id << ", " << nombre << ")" << std::endl;
    }

    void mostrar() const {
        std::cout << "Elemento " << id << ": " << nombre << std::endl;
    }
};

int main() {
    std::cout << "=== ARRAYS DINÁMICOS DE OBJETOS ===" << std::endl;

    int tamano = 3;

    // ✅ Crear array de objetos - new[] llama a constructores
    Elemento* elementos = new Elemento[tamano];

    std::cout << "\n--- Usando los elementos ---" << std::endl;
    for(int i = 0; i < tamano; i++) {
        elementos[i].mostrar();
    }

    std::cout << "\n--- Liberando array ---" << std::endl;
    // ✅ delete[] llama a destructores de TODOS los elementos
    delete[] elementos;
    elementos = nullptr;

    std::cout << "\n✅ Todos los destructores fueron llamados" << std::endl;

    return 0;
}`,
            explanation: "🔧 **Arrays de objetos personalizados:**\n\n1. **new Elemento[3]** → Llama constructor 3 veces\n2. **delete[] elementos** → Llama destructor 3 veces\n3. Cada elemento se inicializa correctamente\n4. Cada elemento se destruye correctamente\n\n**💡 Importante:** Si usaras delete en lugar de delete[], solo se llamaría un destructor, causando fugas de recursos."
          }
        ],
        exercises: [
          "🏗️ Crea una clase con constructor y destructor que muestre mensajes",
          "📊 Crea un array dinámico de objetos de tu clase",
          "🔍 Verifica que se llamen todos los constructores y destructores",
          "⚠️ Compara comportamiento con delete vs delete[]",
          "🛡️ Implementa una función que gestione arrays de objetos",
          "📈 Crea un sistema de gestión de objetos con arrays dinámicos",
          "🔄 Implementa resize para arrays dinámicos de objetos"
        ]
      },
      expert: {
        theory: "Los arrays dinámicos requieren consideraciones avanzadas de rendimiento, alineación de memoria y gestión de excepciones. new[] puede fallar y lanzar std::bad_alloc.\n\n**Técnicas avanzadas:**\n- **Placement new[]**: Control preciso de ubicación\n- **Custom allocators**: Estrategias de asignación personalizadas\n- **Exception safety**: Manejo robusto de fallos de asignación\n- **Memory alignment**: Optimización de acceso a cache\n- **RAII wrappers**: Gestión automática de arrays dinámicos\n\n**Alternativas modernas:**\n- `std::vector<T>`: Array dinámico automático\n- `std::unique_ptr<T[]>`: Puntero inteligente para arrays\n- `std::array<T, N>`: Array estático con interfaz de contenedor",
        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <vector>
#include <new>  // Para placement new

// Clase para demostrar gestión avanzada
class Buffer {
private:
    char* data;
    size_t size;

public:
    Buffer(size_t s) : size(s) {
        data = new char[size];
        std::fill(data, data + size, 0);
        std::cout << "Buffer creado: " << size << " bytes" << std::endl;
    }

    ~Buffer() {
        delete[] data;
        std::cout << "Buffer destruido: " << size << " bytes" << std::endl;
    }

    // Sobrecarga de new[] para debugging
    void* operator new[](size_t size) {
        std::cout << "new[] llamado: " << size << " bytes" << std::endl;
        return ::operator new[](size);
    }

    // Sobrecarga de delete[] para debugging
    void operator delete[](void* ptr, size_t size) {
        std::cout << "delete[] llamado: " << size << " bytes" << std::endl;
        ::operator delete[](ptr, size);
    }
};

int main() {
    std::cout << "=== GESTIÓN AVANZADA DE ARRAYS DINÁMICOS ===" << std::endl;

    // 1. Array dinámico tradicional
    std::cout << "\n--- 1. new[] / delete[] tradicional ---" << std::endl;
    Buffer* buffers = new Buffer[3];  // Llama operator new[]
    delete[] buffers;                 // Llama operator delete[]

    // 2. Smart pointer para arrays
    std::cout << "\n--- 2. std::unique_ptr para arrays ---" << std::endl;
    std::unique_ptr<Buffer[]> smart_buffers(new Buffer[2]);
    // Se libera automáticamente

    // 3. std::vector - solución moderna
    std::cout << "\n--- 3. std::vector - solución moderna ---" << std::endl;
    std::vector<Buffer> vector_buffers(2);  // Gestión automática
    // Se libera automáticamente

    std::cout << "\n✅ Todos los recursos liberados automáticamente" << std::endl;

    return 0;
}`,
            explanation: "🎯 **Gestión avanzada de arrays dinámicos:**\n\n1. **Operator new[]/delete[]** personalizado para debugging\n2. **std::unique_ptr<T[]>** para gestión automática de arrays\n3. **std::vector** como alternativa moderna y segura\n4. **RAII** que previene fugas de memoria\n\n**Patrones recomendados:**\n- Usar std::vector en lugar de new[]/delete[]\n- Usar unique_ptr<T[]> para ownership claro\n- Sobrecargar new[]/delete[] solo para debugging avanzado\n- Preferir contenedores STL sobre gestión manual"
          }
        ],
        exercises: [
          "🔧 Sobrecarga operator new[] y delete[] para tu clase",
          "🛡️ Implementa gestión de excepciones para new[] fallido",
          "📊 Compara rendimiento de new[] vs std::vector",
          "⚡ Implementa custom allocator para arrays dinámicos",
          "🎯 Crea wrapper RAII para arrays dinámicos",
          "🔄 Migra código legacy de new[]/delete[] a std::vector",
          "📈 Implementa profiling de uso de memoria para arrays",
          "🛡️ Desarrolla librería segura para arrays dinámicos"
        ]
      }
    }
  },
  {
    id: 7,
    title: "🔒 const Punteros - Inmutabilidad",
    description: "Domina las 3 combinaciones de const con punteros: const T*, T* const, const T* const.",
    difficulty: 'intermediate' as const,
    topic: "Punteros y Const",
    completed: false,
    content: {
      beginner: {
        theory: "🔒 **const con Punteros**\n\nLas 3 formas de usar const con punteros son:\n\n1. **const T*** → Puntero a constante (el valor apuntado no puede cambiar)\n2. **T* const** → Puntero constante (el puntero no puede cambiar)\n3. **const T* const** → Ambos constantes\n\n**💡 Analogía cotidiana:**\n- **const int* ptr** = Puedes cambiar de libro, pero no escribir en él\n- **int* const ptr** = No puedes cambiar de libro, pero sí escribir en él\n- **const int* const ptr** = Ni cambiar de libro ni escribir en él",
        examples: [
          {
            code: `// 🔒 CONST CON PUNTEROS - Las 3 formas
#include <iostream>

int main() {
    int valor1 = 10, valor2 = 20, valor3 = 30;

    // 1. const T* → Puntero a constante
    // Puedo cambiar el puntero, pero NO el valor apuntado
    const int* ptr1 = &valor1;
    std::cout << "1. const int* ptr1 = " << *ptr1 << std::endl;

    // ✅ Puedo cambiar a dónde apunta
    ptr1 = &valor2;
    std::cout << "   ptr1 ahora apunta a: " << *ptr2 << std::endl;

    // ❌ NO puedo cambiar el valor apuntado
    // *ptr1 = 100; // ERROR: No se puede modificar

    // 2. T* const → Puntero constante
    // NO puedo cambiar el puntero, pero SÍ el valor apuntado
    int* const ptr2 = &valor2;
    std::cout << "2. int* const ptr2 = " << *ptr2 << std::endl;

    // ✅ Puedo cambiar el valor apuntado
    *ptr2 = 200;
    std::cout << "   *ptr2 = " << *ptr2 << std::endl;

    // ❌ NO puedo cambiar a dónde apunta
    // ptr2 = &valor3; // ERROR: Puntero constante

    // 3. const T* const → Ambos constantes
    // NO puedo cambiar ni el puntero ni el valor
    const int* const ptr3 = &valor3;
    std::cout << "3. const int* const ptr3 = " << *ptr3 << std::endl;

    // ❌ NO puedo cambiar el puntero
    // ptr3 = &valor1; // ERROR

    // ❌ NO puedo cambiar el valor apuntado
    // *ptr3 = 300;   // ERROR

    return 0;
}`,
            explanation: "🔒 **Las 3 formas de const con punteros:**\n\n1. **const int* ptr** → El int es constante, el puntero puede cambiar\n2. **int* const ptr** → El puntero es constante, el int puede cambiar\n3. **const int* const ptr** → Ambos son constantes\n\n**💡 Truco mnemotécnico:** Lee de derecha a izquierda:\n- **const int* ptr** = ptr es puntero a int constante\n- **int* const ptr** = ptr es puntero constante a int"
          }
        ],
        exercises: [
          "🔒 Declara un const int* y explica qué significa",
          "📝 Declara un int* const y explica qué significa",
          "🔄 Declara un const int* const y explica qué significa",
          "⚠️ Identifica errores de compilación en código con const punteros",
          "🛡️ Crea funciones que usen punteros const apropiados",
          "🔄 Convierte código sin const a código con const correcto"
        ]
      },
      intermediate: {
        theory: "El uso correcto de const con punteros es fundamental para escribir código seguro y expresivo. Permite especificar claramente las intenciones del programador y previene errores en tiempo de compilación.\n\n**Aplicaciones prácticas:**\n- **Parámetros de función**: Indicar que no se modificará el argumento\n- **Miembros de clase**: Proteger datos internos\n- **Interfaces de API**: Especificar contratos\n- **Optimizaciones**: Permitir mejores optimizaciones del compilador",
        examples: [
          {
            code: `#include <iostream>
#include <vector>

class ProcesadorDatos {
private:
    std::vector<int> datos;

public:
    // Constructor
    ProcesadorDatos(const std::vector<int>& inicial) : datos(inicial) {}

    // Función const: no modifica el objeto
    void mostrar_datos() const {
        std::cout << "Datos: ";
        for(int valor : datos) {
            std::cout << valor << " ";
        }
        std::cout << std::endl;
    }

    // Función que retorna puntero const a datos internos
    const int* obtener_datos() const {
        if (datos.empty()) {
            return nullptr;
        }
        return datos.data();
    }

    // Función que permite modificación controlada
    void procesar_datos() {
        for(int& valor : datos) {
            valor *= 2;
        }
    }
};

void funcion_que_no_modifica(const ProcesadorDatos& procesador) {
    // ✅ Solo puede llamar a funciones const
    procesador.mostrar_datos();

    // ✅ Recibe puntero const - no puede modificar
    const int* datos = procesador.obtener_datos();
    if (datos != nullptr) {
        std::cout << "Primer dato: " << datos[0] << std::endl;
        // ❌ No puede modificar: *datos = 100; // ERROR
    }
}

int main() {
    std::vector<int> inicial = {1, 2, 3, 4, 5};
    ProcesadorDatos p(inicial);

    p.mostrar_datos();

    funcion_que_no_modifica(p);

    p.procesar_datos();
    p.mostrar_datos();

    return 0;
}`,
            explanation: "🔒 **Uso práctico de const con punteros en clases:**\n\n1. **Funciones const** → No modifican el objeto\n2. **Retorno const** → El llamador no puede modificar los datos\n3. **Parámetros const** → La función no modifica el argumento\n4. **Protección de datos** → Previene modificaciones accidentales\n\n**Beneficios:**\n- **Seguridad**: Previene modificaciones no deseadas\n- **Claridad**: Especifica intenciones del programador\n- **Compilación**: Detección de errores en tiempo de compilación"
          }
        ],
        exercises: [
          "🏗️ Crea una clase con funciones const que retornen punteros const",
          "🛡️ Implementa una API que use const correctamente",
          "🔄 Refactoriza código para usar const apropiadamente",
          "⚡ Identifica oportunidades de optimización con const",
          "🎯 Diseña interfaces const-correct",
          "📝 Documenta el significado de cada uso de const"
        ]
      },
      expert: {
        theory: "La const-correctness es un aspecto avanzado de C++ que afecta profundamente el diseño de APIs y la mantenibilidad del código. Técnicamente, const es parte del sistema de tipos y afecta la sobrecarga de funciones.\n\n**Aspectos técnicos avanzados:**\n- **Sobrecarga basada en const**: Funciones pueden sobrecargarse según const\n- **Type deduction**: const afecta decltype y auto\n- **Template metaprogramming**: Traits para detectar const\n- **Cast operations**: const_cast para casos necesarios\n- **Thread safety**: const como indicador de thread-safety",
        examples: [
          {
            code: `#include <iostream>
#include <type_traits>

class SmartContainer {
private:
    int* data;
    size_t size;

public:
    SmartContainer(size_t s) : size(s) {
        data = new int[size];
        for(size_t i = 0; i < size; i++) {
            data[i] = i * 10;
        }
    }

    ~SmartContainer() {
        delete[] data;
    }

    // Sobrecarga basada en const
    const int* begin() const {
        std::cout << "begin() const llamada" << std::endl;
        return data;
    }

    int* begin() {
        std::cout << "begin() no-const llamada" << std::endl;
        return data;
    }

    // Función que demuestra const_cast (usar con cuidado)
    void forzar_modificacion() const {
        // ⚠️ const_cast remueve const (peligroso, usar solo si es necesario)
        int* modifiable = const_cast<int*>(data);
        modifiable[0] = 999;
        std::cout << "Modificación forzada: " << data[0] << std::endl;
    }

    void mostrar() const {
        std::cout << "Datos: ";
        for(size_t i = 0; i < size; i++) {
            std::cout << data[i] << " ";
        }
        std::cout << std::endl;
    }
};

// Función template que detecta const
template<typename T>
void analizar_puntero(T* ptr) {
    if constexpr (std::is_const_v<std::remove_pointer_t<T>>) {
        std::cout << "Puntero a tipo const" << std::endl;
    } else {
        std::cout << "Puntero a tipo no-const" << std::endl;
    }
}

int main() {
    SmartContainer contenedor(5);

    // Demostrar sobrecarga basada en const
    const SmartContainer& const_ref = contenedor;
    const int* it1 = const_ref.begin();  // Llama a begin() const
    int* it2 = contenedor.begin();        // Llama a begin() no-const

    // Demostrar detección de const en templates
    analizar_puntero(it1);  // Puntero a tipo const
    analizar_puntero(it2);  // Puntero a tipo no-const

    contenedor.mostrar();

    // ⚠️ Demostrar const_cast (usar con extrema precaución)
    std::cout << "\n--- Demostración de const_cast ---" << std::endl;
    const_ref.forzar_modificacion();
    contenedor.mostrar();

    return 0;
}`,
            explanation: "🎯 **Técnicas avanzadas de const:**\n\n1. **Sobrecarga const** → Diferentes implementaciones para const y no-const\n2. **const_cast** → Remover const (usar solo cuando sea absolutamente necesario)\n3. **Template metaprogramming** → Detectar const en tiempo de compilación\n4. **Type traits** → Análisis de propiedades de tipos\n\n**Consideraciones importantes:**\n- **const_cast es peligroso** → Solo usar cuando no hay alternativa\n- **Sobrecarga const** → Permite APIs más expresivas\n- **Templates** → Pueden detectar y manejar const automáticamente"
          }
        ],
        exercises: [
          "🔧 Implementa sobrecarga de funciones basada en const",
          "🛡️ Crea templates que manejen const automáticamente",
          "⚡ Usa type traits para inspeccionar propiedades const",
          "🎯 Implementa const_cast solo cuando sea necesario",
          "🏗️ Diseña APIs const-correct desde cero",
          "🔍 Analiza código legacy para const-correctness",
          "📊 Compara rendimiento de versiones const vs no-const"
        ]
      }
    }
  },
  {
    id: 8,
    title: "🔗 Punteros Dobles - T**",
    description: "Domina los punteros a punteros. Esenciales para APIs y estructuras de datos complejas.",
    difficulty: 'intermediate' as const,
    topic: "Punteros Avanzados",
    completed: false,
    content: {
      beginner: {
        theory: "🔗 **¿Qué es un puntero doble?**\n\nUn puntero doble (T**) es un puntero que apunta a otro puntero. Es como tener un índice que te lleva a otro índice.\n\n**💡 Analogía cotidiana:**\nImagina que buscas información en una biblioteca:\n- **T*** = Una estantería específica (apunta a un libro)\n- **T*** = Un plano de la biblioteca que te dice DÓNDE está cada estantería\n\n**🔑 Aplicaciones comunes:**\n- Matrices dinámicas (arrays de arrays)\n- APIs que devuelven objetos creados dinámicamente\n- Estructuras de datos con punteros anidados\n- Parámetros de salida en funciones C",

        examples: [
          {
            code: `// 🔗 PUNTEROS DOBLES - Tu primer T**
#include <iostream>

int main() {
    std::cout << "=== PUNTEROS DOBLES T** ===" << std::endl;

    // 1. Un puntero normal a un entero
    int valor = 42;
    int* puntero = &valor;

    // 2. Un puntero doble que apunta al puntero anterior
    int** puntero_doble = &puntero;

    std::cout << "Valor original: " << valor << std::endl;
    std::cout << "A través de puntero simple: " << *puntero << std::endl;
    std::cout << "A través de puntero doble: " << **puntero_doble << std::endl;

    // 3. Modificación a través del puntero doble
    **puntero_doble = 100;
    std::cout << "Después de modificar con **: " << valor << std::endl;

    return 0;
}`,
            explanation: "📋 **Niveles de indirección:**\n\n1. `valor` = El valor real (42)\n2. `puntero` = Apunta al valor\n3. `puntero_doble` = Apunta al puntero\n4. `*puntero_doble` = El puntero (desreferencia una vez)\n5. `**puntero_doble` = El valor (desreferencia dos veces)"
          },
          {
            code: `// 🔗 MATRIZ DINÁMICA CON PUNTEROS DOBLES
#include <iostream>

int main() {
    std::cout << "=== MATRIZ DINÁMICA CON T** ===" << std::endl;

    int filas = 3;
    int columnas = 4;

    // 1. Crear array de punteros (filas)
    int** matriz = new int*[filas];

    // 2. Para cada fila, crear array de enteros (columnas)
    for(int i = 0; i < filas; i++) {
        matriz[i] = new int[columnas];

        // Inicializar cada elemento
        for(int j = 0; j < columnas; j++) {
            matriz[i][j] = i * 10 + j;
        }
    }

    // 3. Usar la matriz
    std::cout << "Contenido de la matriz:" << std::endl;
    for(int i = 0; i < filas; i++) {
        for(int j = 0; j < columnas; j++) {
            std::cout << matriz[i][j] << " ";
        }
        std::cout << std::endl;
    }

    // 4. ¡IMPORTANTE! Liberar en orden inverso
    for(int i = 0; i < filas; i++) {
        delete[] matriz[i];  // Liberar cada fila
    }
    delete[] matriz;  // Liberar el array de punteros

    return 0;
}`,
            explanation: "🏗️ **Matriz con punteros dobles:**\n\n1. `new int*[filas]` → Array de punteros (filas)\n2. `matriz[i] = new int[columnas]` → Cada fila es un array\n3. `matriz[i][j]` → Acceso bidimensional\n4. Liberar con `delete[]` para cada fila, luego para el array de punteros\n\n**💡 Nota:** Esta es la forma tradicional, pero `std::vector<std::vector<int>>` es más segura"
          }
        ],
        exercises: [
          "🔗 Declara un int** y haz que apunte a un int*",
          "📝 Usa ** para acceder al valor final",
          "🔄 Modifica el valor a través del puntero doble",
          "📊 Crea una matriz simple usando T**",
          "🗑️ Practica la liberación correcta de memoria",
          "🔍 Identifica errores comunes con T**"
        ]
      },
      intermediate: {
        theory: "Los punteros dobles son especialmente útiles en APIs que necesitan devolver objetos recién creados al llamador. En lugar de devolver un puntero simple (que el llamador podría olvidar liberar), las APIs pueden usar T** para recibir la dirección donde almacenar el puntero.\n\n**Patrones de uso avanzados:**\n- **Parámetros de salida**: Funciones que crean objetos\n- **Builders y factories**: Construcción configurable\n- **Callbacks con contexto**: Punteros a punteros para modificar estado\n- **Interfaz C**: APIs legacy que requieren T**",

        examples: [
          {
            code: `#include <iostream>

// 🏭 API QUE USA T** PARA PARÁMETROS DE SALIDA
void crear_objeto(int** objeto_salida, int valor_inicial) {
    // Crear el objeto
    int* nuevo_objeto = new int(valor_inicial);

    // Devolver a través del parámetro de salida
    *objeto_salida = nuevo_objeto;

    std::cout << "Objeto creado con valor: " << valor_inicial << std::endl;
}

void destruir_objeto(int** objeto) {
    if (*objeto != nullptr) {
        delete *objeto;
        *objeto = nullptr;
        std::cout << "Objeto destruido" << std::endl;
    }
}

int main() {
    std::cout << "=== API CON T** PARA SALIDA ===" << std::endl;

    int* mi_objeto = nullptr;

    // Crear objeto a través de la API
    crear_objeto(&mi_objeto, 42);
    std::cout << "Valor del objeto: " << *mi_objeto << std::endl;

    // Modificar el objeto
    *mi_objeto = 100;
    std::cout << "Valor modificado: " << *mi_objeto << std::endl;

    // Destruir objeto a través de la API
    destruir_objeto(&mi_objeto);

    // Verificar que está destruido
    if (mi_objeto == nullptr) {
        std::cout << "✅ Objeto correctamente destruido" << std::endl;
    }

    return 0;
}`,
            explanation: "🏭 **API con parámetros de salida:**\n\n1. `crear_objeto(&mi_objeto, 42)` → Pasa dirección del puntero\n2. `*objeto_salida = nuevo_objeto` → Asigna el puntero creado\n3. El llamador recibe el objeto a través del parámetro de salida\n4. `destruir_objeto(&mi_objeto)` → Limpieza segura\n\n**🎯 Beneficios:**\n- **Claridad de ownership**: Quién debe liberar qué\n- **Prevención de fugas**: API maneja la creación y destrucción\n- **Interfaz consistente**: Patrón estándar en APIs C"
          }
        ],
        exercises: [
          "🏭 Crea una función que use T** para devolver objetos",
          "🛡️ Implementa funciones de creación y destrucción seguras",
          "🔄 Modifica objetos a través de punteros dobles",
          "📝 Crea una mini-API usando el patrón T**",
          "⚠️ Identifica problemas potenciales con T**",
          "🛡️ Implementa verificaciones de seguridad con T**"
        ]
      },
      expert: {
        theory: "Los punteros dobles introducen complejidad adicional en la gestión de memoria y pueden ser fuente de errores sutiles. Es crucial entender completamente el ownership y las responsabilidades de cada nivel de indirección.\n\n**Consideraciones técnicas avanzadas:**\n- **Multiple ownership**: ¿Quién es el propietario real?\n- **Exception safety**: ¿Qué pasa si hay excepciones?\n- **Thread safety**: Concurrencia con punteros dobles\n- **Memory layout**: Cómo se almacenan en memoria\n- **Optimization**: Costes de indirección múltiple",

        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <vector>

// 🎯 COMPARACIÓN: T** vs SMART POINTERS
class Recurso {
public:
    Recurso(int id) : id_(id) {
        std::cout << "Recurso " << id_ << " creado" << std::endl;
    }

    ~Recurso() {
        std::cout << "Recurso " << id_ << " destruido" << std::endl;
    }

    void usar() const {
        std::cout << "Usando recurso " << id_ << std::endl;
    }

private:
    int id_;
};

// ❌ VERSIÓN PELIGROSA - Raw pointers con T**
void api_peligrosa(Recurso** salida) {
    *salida = new Recurso(1);
    // ¿Quién debe liberar esto?
}

// ✅ VERSIÓN SEGURA - Smart pointers
void api_segura(std::unique_ptr<Recurso>& salida) {
    salida = std::make_unique<Recurso>(2);
    // El llamador es propietario
}

// ✅ VERSIÓN MODERNA - Retorno directo
std::unique_ptr<Recurso> api_moderna() {
    return std::make_unique<Recurso>(3);
    // Transferencia clara de ownership
}

int main() {
    std::cout << "=== COMPARACIÓN T** vs SMART POINTERS ===" << std::endl;

    // ❌ Raw pointers - propenso a errores
    Recurso* raw_ptr = nullptr;
    api_peligrosa(&raw_ptr);
    raw_ptr->usar();
    // ¿Liberar aquí o en otro lado?
    delete raw_ptr;

    std::cout << std::endl;

    // ✅ Smart pointers - claro y seguro
    std::unique_ptr<Recurso> smart_ptr;
    api_segura(smart_ptr);
    smart_ptr->usar();
    // Se libera automáticamente

    std::cout << std::endl;

    // ✅ Mejor opción - retorno directo
    auto mejor_ptr = api_moderna();
    mejor_ptr->usar();
    // Se libera automáticamente

    return 0;
}`,
            explanation: "🎯 **Comparación de enfoques:**\n\n**T** (Raw pointers):**\n- ❌ Propenso a fugas de memoria\n- ❌ Ownership no claro\n- ❌ Fácil olvidar delete\n- ❌ Riesgos de double delete\n\n**Smart Pointers:**\n- ✅ Ownership claro y automático\n- ✅ Excepción-safe\n- ✅ Sin fugas de memoria\n- ✅ Sin double delete\n\n**💡 Conclusión:** Evita T** cuando sea posible. Usa smart pointers o retornos directos."
          }
        ],
        exercises: [
          "🔧 Refactoriza código legacy de T** a smart pointers",
          "🎯 Implementa APIs modernas sin T**",
          "📊 Compara rendimiento de T** vs soluciones modernas",
          "⚡ Identifica cuellos de botella en indirección múltiple",
          "🏗️ Diseña sistemas sin punteros dobles",
          "🔍 Analiza casos donde T** es inevitable",
          "🛡️ Crea wrappers seguros para APIs legacy con T**"
        ]
      }
    }
  },
  {
    id: 9,
    title: "🏭 APIs con T** - Parámetros de Salida",
    description: "Domina APIs que usan T** para devolver objetos creados dinámicamente al llamador.",
    difficulty: 'intermediate' as const,
    topic: "Punteros y APIs",
    completed: false,
    content: {
      beginner: {
        theory: "🏭 **APIs con T** para parámetros de salida**\n\nMuchas APIs C y algunas APIs C++ usan el patrón T** para devolver objetos que crean dinámicamente. Esto soluciona el problema de 'quién debe liberar la memoria'.\n\n**💡 Analogía cotidiana:**\nImagina que vas a una tienda que te fabrica un producto personalizado:\n- **Tú**: Llevo mi maletín vacío\n- **Tienda**: Fabrico el producto y lo pongo en tu maletín\n- **Tú**: Te llevas el producto en tu maletín\n\n**🔑 Patrón T**:\n- El llamador pasa un puntero nulo\n- La API crea el objeto y lo asigna a través del puntero\n- El llamador es responsable de liberar el objeto",

        examples: [
          {
            code: `// 🏭 API CON T** - Patrón de parámetros de salida
#include <iostream>

// API que crea un objeto y lo devuelve a través de T**
void crear_numero(int** numero_salida, int valor) {
    if (numero_salida == nullptr) {
        std::cout << "❌ Error: numero_salida es nullptr" << std::endl;
        return;
    }

    // Crear el objeto
    int* nuevo_numero = new int(valor);
    std::cout << "🏭 API: Creando número con valor " << valor << std::endl;

    // Devolver a través del parámetro de salida
    *numero_salida = nuevo_numero;
}

int main() {
    std::cout << "=== API CON T** PARA SALIDA ===" << std::endl;

    // El llamador proporciona un puntero nulo
    int* mi_numero = nullptr;

    // Llamar a la API
    crear_numero(&mi_numero, 42);

    // Ahora tenemos el objeto
    std::cout << "✅ Llamador: Recibido número = " << *mi_numero << std::endl;

    // ⚠️ ¡IMPORTANTE! El llamador debe liberar la memoria
    delete mi_numero;
    mi_numero = nullptr;

    std::cout << "✅ Memoria liberada correctamente" << std::endl;

    return 0;
}`,
            explanation: "🏭 **Cómo funciona el patrón T**:**\n\n1. `int* mi_numero = nullptr` → El llamador prepara un puntero nulo\n2. `crear_numero(&mi_numero, 42)` → Pasa la dirección del puntero\n3. `*numero_salida = nuevo_numero` → La API asigna el objeto creado\n4. `delete mi_numero` → El llamador libera la memoria\n\n**🎯 Ventajas:**\n- **Claridad de ownership** → El llamador sabe que debe liberar\n- **Prevención de fugas** → API no puede olvidar liberar\n- **Interfaz consistente** → Patrón común en APIs C"
          },
          {
            code: `// 🏭 COMPARACIÓN: T** vs Retorno de puntero
#include <iostream>

// ❌ FORMA PROBLEMÁTICA - Retorno de puntero
int* crear_numero_problematico(int valor) {
    return new int(valor);
    // ⚠️ ¿Quién debe liberar esto?
}

int main() {
    std::cout << "=== COMPARACIÓN T** vs RETORNO ===" << std::endl;

    // ❌ Problema: ¿Quién libera?
    int* numero = crear_numero_problematico(100);
    std::cout << "Número: " << *numero << std::endl;

    // Si olvidamos delete, ¡FUGA DE MEMORIA!
    // delete numero; // ¿Debemos hacerlo aquí?

    // ✅ Mejor: API con T**
    int* numero_seguro = nullptr;
    crear_numero(&numero_seguro, 200);
    std::cout << "Número seguro: " << *numero_seguro << std::endl;

    // ✅ Claramente sabemos que debemos liberar
    delete numero_seguro;
    numero_seguro = nullptr;

    std::cout << "✅ Memoria gestionada correctamente" << std::endl;

    return 0;
}

// Función crear_numero del ejemplo anterior
void crear_numero(int** numero_salida, int valor) {
    if (numero_salida == nullptr) return;

    int* nuevo_numero = new int(valor);
    *numero_salida = nuevo_numero;
    std::cout << "🏭 Creando número: " << valor << std::endl;
}`,
            explanation: "🔄 **T** vs retorno de puntero:**\n\n**Retorno de puntero (problemático):**\n- ❌ **Confuso ownership** → ¿Quién debe liberar?\n- ❌ **Fácil olvidar delete** → Fugga de memoria\n- ❌ **No claro en la interfaz** → ¿Es transferencia o préstamo?\n\n**T** (claro y seguro):**\n- ✅ **Claridad total** → El llamador siempre libera\n- ✅ **Prevención de fugas** → API no puede olvidar\n- ✅ **Interfaz explícita** → Parámetro de salida documentado"
          }
        ],
        exercises: [
          "🏭 Crea una API que use T** para devolver objetos",
          "📝 Implementa una función de fábrica con T**",
          "🛡️ Añade verificaciones de nullptr en tu API",
          "🔄 Compara APIs con T** vs retornos de puntero",
          "⚠️ Identifica problemas potenciales en APIs con T**",
          "🛡️ Crea una función segura que libere objetos de T**"
        ]
      },
      intermediate: {
        theory: "Las APIs con T** son especialmente importantes en interfaces C y en situaciones donde el objeto debe ser creado dinámicamente pero el llamador necesita control total sobre el ciclo de vida.\n\n**Casos de uso comunes:**\n- **APIs C legacy** que necesitan devolver objetos complejos\n- **Factory patterns** donde el tipo exacto se determina en runtime\n- **Bibliotecas que requieren callbacks** con creación de objetos\n- **Interfaces que requieren polimorfismo** con transferencia de ownership\n\n**Consideraciones de diseño:**\n- **Documentación clara** del ownership\n- **Exception safety** en la creación\n- **Resource management** consistente\n- **Error handling** apropiado",

        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <string>

// Clase de ejemplo
class Objeto {
private:
    std::string nombre;
    int valor;

public:
    Objeto(const std::string& n, int v) : nombre(n), valor(v) {
        std::cout << "📦 Creando Objeto: " << nombre << " = " << valor << std::endl;
    }

    ~Objeto() {
        std::cout << "🗑️  Destruyendo Objeto: " << nombre << std::endl;
    }

    void usar() const {
        std::cout << "🔧 Usando " << nombre << " con valor " << valor << std::endl;
    }
};

// 🏭 API que usa T** para devolver objetos polimórficos
void crear_objeto(Objeto** objeto_salida, const std::string& tipo, int valor) {
    if (!objeto_salida) {
        std::cout << "❌ Error: objeto_salida es nullptr" << std::endl;
        return;
    }

    // Lógica de fábrica basada en el tipo
    if (tipo == "especial") {
        *objeto_salida = new Objeto("Especial-" + std::to_string(valor), valor * 2);
    } else {
        *objeto_salida = new Objeto("Normal-" + std::to_string(valor), valor);
    }
}

// 🏭 API moderna que usa smart pointers
std::unique_ptr<Objeto> crear_objeto_moderno(const std::string& tipo, int valor) {
    if (tipo == "especial") {
        return std::make_unique<Objeto>("Especial-" + std::to_string(valor), valor * 2);
    } else {
        return std::make_unique<Objeto>("Normal-" + std::to_string(valor), valor);
    }
}

int main() {
    std::cout << "=== APIs CON T** vs SMART POINTERS ===" << std::endl;

    // ❌ API legacy con T** - requiere gestión manual
    std::cout << "\n--- API Legacy con T** ---" << std::endl;
    Objeto* obj_legacy = nullptr;
    crear_objeto(&obj_legacy, "especial", 42);
    obj_legacy->usar();

    // ⚠️ El llamador debe recordar liberar
    delete obj_legacy;
    obj_legacy = nullptr;

    // ✅ API moderna con smart pointers - automático
    std::cout << "\n--- API Moderna con Smart Pointers ---" << std::endl;
    auto obj_moderno = crear_objeto_moderno("especial", 42);
    obj_moderno->usar();
    // Se libera automáticamente

    std::cout << "\n✅ Ambas APIs funcionan, pero la moderna es más segura" << std::endl;

    return 0;
}`,
            explanation: "🏭 **APIs avanzadas con T**:**\n\n1. **Factory pattern** → Crear objetos basados en parámetros\n2. **Polimorfismo** → Devolver tipos derivados a través de base*\n3. **Configuración runtime** → Decidir tipo en tiempo de ejecución\n4. **Ownership transfer** → Claridad sobre quién libera\n\n**Comparación con smart pointers:**\n- **T**: ✅ Claridad, ✅ Control total, ❌ Gestión manual\n- **Smart pointers**: ✅ Automático, ✅ Seguro, ❌ Un poco más complejo"
          }
        ],
        exercises: [
          "🏗️ Implementa una fábrica de objetos usando T**",
          "🔄 Crea APIs que retornen diferentes tipos basados en parámetros",
          "🛡️ Añade manejo de errores a tu API con T**",
          "⚡ Compara rendimiento de T** vs smart pointers",
          "🎯 Implementa patrón de fábrica con herencia",
          "📝 Documenta claramente el ownership en tu API"
        ]
      },
      expert: {
        theory: "El patrón T** es fundamental en el diseño de APIs C y en la interoperabilidad entre lenguajes. Sin embargo, en C++ moderno, generalmente se prefieren las alternativas más seguras.\n\n**Patrones avanzados:**\n- **Builder pattern** con parámetros de salida\n- **Factory functions** con configuración compleja\n- **Dependency injection** containers\n- **Service locators** con lazy initialization\n\n**Alternativas modernas:**\n- `std::unique_ptr<T>` para ownership único\n- `std::shared_ptr<T>` para ownership compartido\n- `std::function` para factory functions\n- Templates para type safety",

        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <functional>
#include <unordered_map>

// Framework avanzado para APIs con T**
template<typename T>
class APIFramework {
private:
    using FactoryFunction = std::function<void(T**, int)>;

    std::unordered_map<std::string, FactoryFunction> factories;

public:
    // Registrar una fábrica
    void registrar_fabrica(const std::string& tipo, FactoryFunction fabrica) {
        factories[tipo] = fabrica;
    }

    // Crear objeto usando T**
    bool crear_objeto(const std::string& tipo, T** objeto_salida, int parametro) {
        if (!objeto_salida) return false;

        auto it = factories.find(tipo);
        if (it == factories.end()) {
            std::cout << "❌ Tipo no registrado: " << tipo << std::endl;
            return false;
        }

        // Crear el objeto
        it->second(objeto_salida, parametro);
        return true;
    }

    // Versión moderna con smart pointers
    std::unique_ptr<T> crear_objeto_moderno(const std::string& tipo, int parametro) {
        T* temp = nullptr;
        if (crear_objeto(tipo, &temp, parametro)) {
            return std::unique_ptr<T>(temp);
        }
        return nullptr;
    }
};

// Clase de ejemplo
class Widget {
private:
    int id;
    std::string descripcion;

public:
    Widget(int i, const std::string& desc = "Widget")
        : id(i), descripcion(desc) {
        std::cout << "🔧 Creando " << descripcion << " con ID " << id << std::endl;
    }

    ~Widget() {
        std::cout << "🗑️  Destruyendo " << descripcion << " con ID " << id << std::endl;
    }

    void usar() const {
        std::cout << "🔧 Usando " << descripcion << " " << id << std::endl;
    }
};

// Función fábrica para widgets
void crear_widget(Widget** widget_salida, int id) {
    if (!widget_salida) return;
    *widget_salida = new Widget(id, "Widget-Fábrica");
}

int main() {
    std::cout << "=== FRAMEWORK AVANZADO CON T** ===" << std::endl;

    APIFramework<Widget> framework;

    // Registrar fábricas
    framework.registrar_fabrica("widget", crear_widget);

    // ✅ Uso legacy con T**
    std::cout << "\n--- Uso Legacy con T** ---" << std::endl;
    Widget* widget_legacy = nullptr;
    if (framework.crear_objeto("widget", &widget_legacy, 1)) {
        widget_legacy->usar();
        delete widget_legacy;
    }

    // ✅ Uso moderno con smart pointers
    std::cout << "\n--- Uso Moderno con Smart Pointers ---" << std::endl;
    auto widget_moderno = framework.crear_objeto_moderno("widget", 2);
    if (widget_moderno) {
        widget_moderno->usar();
    }
    // Se libera automáticamente

    std::cout << "\n✅ Framework flexible que soporta ambos enfoques" << std::endl;

    return 0;
}`,
            explanation: "🎯 **Framework avanzado con T**:**\n\n1. **Template-based framework** → Soporte para cualquier tipo\n2. **Factory registration** → Fábricas registrables dinámicamente\n3. **Legacy support** → APIs con T** para compatibilidad\n4. **Modern interface** → Smart pointers para código nuevo\n5. **Error handling** → Manejo robusto de errores\n\n**💡 Lección clave:** El patrón T** es poderoso pero requiere disciplina. En C++ moderno, combínalo con smart pointers para obtener lo mejor de ambos mundos."
          }
        ],
        exercises: [
          "🎯 Implementa un framework de fábricas usando T**",
          "🛡️ Añade manejo de excepciones a tu framework",
          "⚡ Optimiza el registro de fábricas usando templates",
          "🔄 Crea adaptadores entre APIs legacy y modernas",
          "🏗️ Implementa un sistema de plugins usando T**",
          "📊 Compara rendimiento de diferentes estrategias de factory",
          "🛡️ Desarrolla wrappers de seguridad para APIs con T**"
        ]
      }
    }
  },
  {
    id: 10,
    title: "🎯 std::unique_ptr - Propiedad Única",
    description: "Domina el puntero inteligente más simple. RAII automático y move semantics.",
    difficulty: 'intermediate' as const,
    topic: "Smart Pointers",
    completed: false,
    content: {
      beginner: {
        theory: "🎯 **¿Qué es std::unique_ptr?**\n\n`std::unique_ptr` es un **smart pointer** que tiene **propiedad única** sobre un objeto. Solo puede haber un `unique_ptr` apuntando a un objeto al mismo tiempo.\n\n**🔑 Características principales:**\n- ✅ **Propiedad única**: Solo un `unique_ptr` puede poseer el objeto\n- ✅ **Move-only**: Se puede mover pero no copiar\n- ✅ **Liberación automática**: Se destruye automáticamente cuando sale del scope\n- ✅ **Ligero**: Sin overhead de conteo de referencias\n\n**💡 Analogía cotidiana:**\nImagina que tienes una llave especial que solo una persona puede tener. Cuando esa persona ya no la necesita, la llave se destruye automáticamente.",

        examples: [
          {
            code: `// 🎯 std::unique_ptr - Tu primer smart pointer
#include <iostream>
#include <memory>

int main() {
    std::cout << "=== std::unique_ptr - PROPIEDAD ÚNICA ===" << std::endl;

    // ✅ FORMA RECOMENDADA: make_unique
    std::unique_ptr<int> puntero_inteligente = std::make_unique<int>(42);

    std::cout << "1. Puntero creado: " << *puntero_inteligente << std::endl;

    // ✅ Usar como puntero normal
    *puntero_inteligente = 100;
    std::cout << "2. Valor modificado: " << *puntero_inteligente << std::endl;

    // ✅ ¡NO necesitas delete! Se libera automáticamente
    std::cout << "3. Fin del scope - memoria liberada automáticamente" << std::endl;

    return 0;
}`,
            explanation: "📋 **Ciclo completo de std::unique_ptr:**\n\n1. `std::make_unique<int>(42)` → Crea el objeto y el puntero inteligente\n2. `*puntero_inteligente = 100` → Usa como un puntero normal\n3. **Fin del scope** → El destructor se llama automáticamente\n4. **Memoria liberada** → ¡Sin fugas de memoria!"
          },
          {
            code: `// 🎯 Transferencia de propiedad con std::move
#include <iostream>
#include <memory>

void tomar_propiedad(std::unique_ptr<int> puntero_recibido) {
    std::cout << "Función recibió: " << *puntero_recibido << std::endl;
    // puntero_recibido se destruye aquí automáticamente
}

int main() {
    std::cout << "=== TRANSFERENCIA DE PROPIEDAD ===" << std::endl;

    auto puntero_original = std::make_unique<int>(42);
    std::cout << "1. Puntero original: " << *puntero_original << std::endl;

    // ✅ Transferir propiedad con std::move
    tomar_propiedad(std::move(puntero_original));

    // ❌ puntero_original ahora es nullptr
    if (puntero_original == nullptr) {
        std::cout << "2. ✅ Puntero original ahora es nullptr" << std::endl;
    }

    // ✅ Crear otro puntero
    auto nuevo_puntero = std::make_unique<int>(200);
    std::cout << "3. Nuevo puntero: " << *nuevo_puntero << std::endl;

    return 0;
}`,
            explanation: "🔄 **Transferencia de propiedad:**\n\n1. `std::unique_ptr<int> puntero_original` → Tiene la propiedad del objeto\n2. `std::move(puntero_original)` → Transfiere la propiedad a la función\n3. `puntero_original` → Ahora es `nullptr` (sin propiedad)\n4. **Función termina** → El objeto se destruye automáticamente"
          }
        ],
        exercises: [
          "🎯 Crea un std::unique_ptr con std::make_unique",
          "📝 Accede y modifica el valor a través del unique_ptr",
          "🔄 Usa std::move para transferir propiedad",
          "🛡️ Verifica que el unique_ptr se libera automáticamente",
          "✅ Compara unique_ptr vs punteros raw tradicionales"
        ]
      },
      intermediate: {
        theory: "`std::unique_ptr` es la herramienta fundamental para gestión de recursos en C++ moderno. Se basa en el patrón RAII (Resource Acquisition Is Initialization) y move semantics.\n\n**Cuándo usar unique_ptr:**\n- **Propiedad única clara**: Solo un propietario del recurso\n- **Recursos que no necesitan compartir**: Archivos, conexiones, memoria\n- **Miembros de clases**: Para composición\n- **Funciones que crean objetos**: Retornar ownership\n\n**Ventajas sobre punteros raw:**\n- **Sin fugas de memoria**: Liberación automática\n- **Exception-safe**: Funciona con excepciones\n- **API clara**: Propiedad obvia en el código\n- **Performance**: Sin overhead de conteo de referencias",

        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <fstream>

class ArchivoManager {
private:
    std::unique_ptr<std::FILE, decltype(&std::fclose)> archivo;

public:
    ArchivoManager(const char* nombre_archivo)
        : archivo(std::fopen(nombre_archivo, "r"), &std::fclose) {

        if (!archivo) {
            throw std::runtime_error("No se pudo abrir el archivo");
        }

        std::cout << "Archivo abierto correctamente" << std::endl;
    }

    void leer_linea() {
        char buffer[256];
        if (std::fgets(buffer, sizeof(buffer), archivo.get())) {
            std::cout << "Línea leída: " << buffer;
        }
    }

    // No necesitamos destructor - unique_ptr lo maneja automáticamente
};

int main() {
    std::cout << "=== unique_ptr CON RECURSOS REALES ===" << std::endl;

    try {
        ArchivoManager manager("ejemplo.txt");
        manager.leer_linea();
        // Archivo se cierra automáticamente al salir del scope
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << std::endl;
    }

    std::cout << "✅ Recurso liberado automáticamente" << std::endl;

    return 0;
}`,
            explanation: "🏗️ **unique_ptr con recursos reales:**\n\n1. **Custom deleter**: `&std::fclose` para archivos\n2. **Exception safety**: Si hay excepción, archivo se cierra\n3. **Sin memory leaks**: unique_ptr maneja la liberación\n4. **RAII pattern**: Adquisición y liberación automática\n\n**💡 Este patrón funciona con cualquier recurso que tenga función de limpieza.**"
          }
        ],
        exercises: [
          "🏗️ Crea una clase que use unique_ptr para gestionar recursos",
          "🛡️ Implementa manejo de excepciones con unique_ptr",
          "🔧 Usa custom deleters para diferentes tipos de recursos",
          "📊 Compara performance de unique_ptr vs gestión manual",
          "🎯 Implementa patrón RAII usando unique_ptr"
        ]
      },
      expert: {
        theory: "`std::unique_ptr` es un componente fundamental del sistema de tipos de C++ moderno. Su implementación se basa en move semantics y templates avanzados.\n\n**Detalles técnicos:**\n- **Template con deleter**: `unique_ptr<T, Deleter>`\n- **Empty base optimization**: Deleter stateless no ocupa espacio\n- **Move constructor/assignment**: Transfiere ownership eficientemente\n- **Type safety**: Previene conversión accidental a shared_ptr\n\n**Patrones avanzados:**\n- **Factory functions**: Retornar unique_ptr de funciones\n- **Pimpl idiom**: Ocultar detalles de implementación\n- **Dependency injection**: Inyección de dependencias con ownership\n- **Resource management**: Gestión de cualquier tipo de recurso",

        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <type_traits>

// Clase para demostrar deleter personalizado con estado
class ConnectionDeleter {
private:
    std::string connection_info;

public:
    ConnectionDeleter(const std::string& info) : connection_info(info) {}

    void operator()(void* connection) const {
        std::cout << "Cerrando conexión: " << connection_info << std::endl;
        // Simular cierre de conexión
        delete static_cast<int*>(connection);
    }
};

template<typename T>
std::unique_ptr<T> crear_objeto_con_logging() {
    std::cout << "Creando objeto de tipo: " << typeid(T).name() << std::endl;
    return std::make_unique<T>();
}

// Función factory que retorna unique_ptr
std::unique_ptr<int> crear_numero_importante(int valor) {
    auto numero = std::make_unique<int>(valor);
    std::cout << "Número importante creado: " << *numero << std::endl;
    return numero;  // Transferencia de ownership al llamador
}

int main() {
    std::cout << "=== unique_ptr AVANZADO ===" << std::endl;

    // 1. Factory function
    auto numero = crear_numero_importante(42);
    std::cout << "Número recibido: " << *numero << std::endl;

    // 2. Custom deleter con estado
    auto conexion = std::unique_ptr<int, ConnectionDeleter>(
        new int(123),
        ConnectionDeleter("Base de datos principal")
    );
    std::cout << "Conexión establecida: " << *conexion << std::endl;

    // 3. Template que crea objetos
    auto objeto = crear_objeto_con_logging<double>();
    *objeto = 3.14;
    std::cout << "Objeto creado: " << *objeto << std::endl;

    // 4. Transferencia de ownership
    auto otro_numero = std::move(numero);
    if (!numero) {
        std::cout << "✅ Ownership transferido exitosamente" << std::endl;
    }

    return 0;
}`,
            explanation: "🎯 **Características avanzadas de unique_ptr:**\n\n1. **Factory functions**: Funciones que crean y retornan unique_ptr\n2. **Custom deleters**: Deleters con estado para recursos complejos\n3. **Type deduction**: Templates que infieren tipos automáticamente\n4. **Move semantics**: Transferencia eficiente de ownership\n\n**💡 unique_ptr es la base del resource management moderno en C++.**"
          }
        ],
        exercises: [
          "🔧 Implementa factory functions que retornen unique_ptr",
          "🏗️ Crea custom deleters con estado para recursos complejos",
          "⚡ Optimiza unique_ptr usando empty base optimization",
          "🎯 Implementa patrón pimpl usando unique_ptr",
          "📊 Mide el overhead de diferentes tipos de deleters",
          "🛡️ Crea sistema de resource management basado en unique_ptr"
        ]
      }
    }
  },
  {
    id: 11,
    title: "🎯 std::unique_ptr<T[]> - Arrays Inteligentes",
    description: "Domina unique_ptr especializado para arrays. ¡La alternativa moderna a new[]/delete[]!",
    difficulty: 'intermediate' as const,
    topic: "Smart Pointers",
    completed: false,
    content: {
      beginner: {
        theory: "🎯 **¿Qué es std::unique_ptr<T[]>?**\n\n`std::unique_ptr<T[]>` es la versión de `unique_ptr` especializada para manejar arrays dinámicos. Soluciona todos los problemas de `new[]` y `delete[]`.\n\n**🔑 Características principales:**\n- ✅ **Gestión automática de arrays**: Sin olvidar `delete[]`\n- ✅ **Sintaxis de array**: `ptr[índice]` funciona normalmente\n- ✅ **Propiedad única**: Solo un `unique_ptr` puede poseer el array\n- ✅ **Liberación automática**: Se destruyen todos los elementos\n\n**💡 Analogía cotidiana:**\nImagina que tienes un estante inteligente que:\n- Se encarga de organizar los libros automáticamente\n- Sabe cuántos libros hay\n- Los devuelve a la biblioteca cuando ya no los necesitas",

        examples: [
          {
            code: `// 🎯 unique_ptr<T[]> - Tu primer array inteligente
#include <iostream>
#include <memory>

int main() {
    std::cout << "=== unique_ptr<T[]> - ARRAYS INTELIGENTES ===" << std::endl;

    // ✅ Crear array dinámico inteligente
    auto array_inteligente = std::make_unique<int[]>(5);

    std::cout << "1. Array inteligente creado" << std::endl;

    // ✅ Inicializar como array normal
    for(int i = 0; i < 5; i++) {
        array_inteligente[i] = (i + 1) * 10;
        std::cout << "   array_inteligente[" << i << "] = " << array_inteligente[i] << std::endl;
    }

    // ✅ Usar como array normal
    std::cout << "2. Suma de elementos: ";
    int suma = 0;
    for(int i = 0; i < 5; i++) {
        suma += array_inteligente[i];
    }
    std::cout << suma << std::endl;

    // ✅ ¡NO necesitas delete[]! Se libera automáticamente
    std::cout << "3. Fin del scope - array liberado automáticamente" << std::endl;

    return 0;
}`,
            explanation: "📋 **Ciclo completo de unique_ptr<T[]>:**\n\n1. `std::make_unique<int[]>(5)` → Crea array dinámico inteligente\n2. `array_inteligente[i]` → Acceso normal como array estático\n3. **Fin del scope** → Se libera automáticamente con `delete[]`\n4. **Sin memory leaks** → ¡Gestión automática completa!"
          },
          {
            code: `// 🎯 COMPARACIÓN: unique_ptr<T[]> vs new[]/delete[]
#include <iostream>
#include <memory>

void funcion_con_fuga() {
    // ❌ FORMA PROBLEMÁTICA
    int* array_peligroso = new int[3];
    array_peligroso[0] = 10;
    array_peligroso[1] = 20;
    array_peligroso[2] = 30;

    // ⚠️ ¡FUGA DE MEMORIA! Olvidé delete[]
    // delete[] array_peligroso;
}

void funcion_segura() {
    // ✅ FORMA SEGURA
    auto array_seguro = std::make_unique<int[]>(3);
    array_seguro[0] = 10;
    array_seguro[1] = 20;
    array_seguro[2] = 30;

    // ✅ Se libera automáticamente
}

int main() {
    std::cout << "=== COMPARACIÓN ARRAY INTELIGENTE vs RAW ===" << std::endl;

    // ❌ Esto causa fuga de memoria
    funcion_con_fuga();

    // ✅ Esto es completamente seguro
    funcion_segura();

    std::cout << "✅ Arrays gestionados correctamente" << std::endl;

    return 0;
}`,
            explanation: "🔄 **unique_ptr<T[]> vs new[]/delete[]:**\n\n**new[]/delete[] (Peligroso):**\n- ❌ **Fácil olvidar delete[]** → Fuga de memoria\n- ❌ **Excepciones** → Fuga de memoria\n- ❌ **Código frágil** → Múltiples puntos de fallo\n\n**unique_ptr<T[]> (Seguro):**\n- ✅ **Liberación automática** → Sin fugas\n- ✅ **Exception-safe** → Funciona con excepciones\n- ✅ **Sintaxis simple** → Como array normal"
          }
        ],
        exercises: [
          "🎯 Crea un std::unique_ptr<int[]> con std::make_unique",
          "📝 Inicializa todos los elementos del array inteligente",
          "🔄 Accede a elementos usando la sintaxis [] normal",
          "🛡️ Verifica que se libera automáticamente al salir del scope",
          "✅ Compara unique_ptr<T[]> vs new[]/delete[] tradicionales"
        ]
      },
      intermediate: {
        theory: "`std::unique_ptr<T[]>` es fundamental para el manejo seguro de arrays dinámicos en C++ moderno. Proporciona una interfaz familiar pero con toda la seguridad de RAII.\n\n**Ventajas sobre arrays raw:**\n- **Prevención de fugas**: Liberación automática garantizada\n- **Exception safety**: Funciona correctamente con excepciones\n- **Bounds checking**: Algunos compiladores añaden verificación\n- **API consistente**: Mismos métodos que unique_ptr normal\n\n**Limitaciones:**\n- **Sin resize**: No se puede cambiar tamaño después de creación\n- **Propiedad única**: No se puede compartir\n- **Constructor específico**: Requiere tamaño en construcción",

        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <algorithm>

class ProcesadorDatos {
private:
    std::unique_ptr<int[]> datos;
    size_t tamano;

public:
    ProcesadorDatos(size_t n) : datos(std::make_unique<int[]>(n)), tamano(n) {
        // Inicializar con valores secuenciales
        for(size_t i = 0; i < tamano; i++) {
            datos[i] = static_cast<int>(i * 2);
        }
        std::cout << "ProcesadorDatos creado con " << tamano << " elementos" << std::endl;
    }

    void procesar() {
        std::cout << "Procesando datos: ";
        for(size_t i = 0; i < tamano; i++) {
            datos[i] *= 3;  // Multiplicar por 3
            std::cout << datos[i] << " ";
        }
        std::cout << std::endl;
    }

    void mostrar() const {
        std::cout << "Datos actuales: ";
        for(size_t i = 0; i < tamano; i++) {
            std::cout << datos[i] << " ";
        }
        std::cout << std::endl;
    }

    // Método que retorna puntero raw (solo lectura)
    const int* obtener_datos() const {
        return datos.get();
    }

    size_t obtener_tamano() const {
        return tamano;
    }
};

int main() {
    std::cout << "=== unique_ptr<T[]> EN CLASES ===" << std::endl;

    // Crear procesador de datos
    ProcesadorDatos procesador(5);
    procesador.mostrar();

    // Procesar datos
    procesador.procesar();
    procesador.mostrar();

    // ✅ Todo se libera automáticamente
    std::cout << "✅ Procesador destruido - memoria liberada automáticamente" << std::endl;

    return 0;
}`,
            explanation: "🏗️ **unique_ptr<T[]> en clases:**\n\n1. **Miembro de clase**: `std::unique_ptr<int[]> datos`\n2. **Constructor**: Inicialización con `std::make_unique`\n3. **RAII automático**: Se libera cuando el objeto se destruye\n4. **Interfaz segura**: Métodos que retornan punteros raw para lectura\n\n**💡 Patrón común en C++ moderno para gestión de buffers.**"
          }
        ],
        exercises: [
          "🏗️ Crea una clase que use unique_ptr<T[]> para datos internos",
          "🔄 Implementa métodos para procesar los datos del array",
          "🛡️ Añade métodos que retornen punteros const para acceso seguro",
          "📊 Implementa operaciones de agregación (suma, promedio, etc.)",
          "🎯 Usa unique_ptr<T[]> con diferentes tipos de datos"
        ]
      },
      expert: {
        theory: "`std::unique_ptr<T[]>` tiene semántica especializada para arrays que lo diferencia del `unique_ptr` normal. Técnicamente, es una especialización parcial de la plantilla.\n\n**Diferencias técnicas con unique_ptr<T>:**\n- **operator[]**: Acceso indexado en lugar de desreferencia\n- **Destructor**: Llama a `delete[]` en lugar de `delete`\n- **Construcción**: Solo con `make_unique<T[]>(n)`\n- **Conversión**: No se convierte a `T*` implícitamente\n\n**Optimizaciones:**\n- **Empty base optimization**: Deleter por defecto no ocupa espacio\n- **Inlinig**: Llamadas al deleter pueden optimizarse\n- **Cache friendly**: Mejor locality que listas enlazadas",

        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <chrono>

class PerformanceTester {
private:
    static const size_t TAMANO = 1000000;

public:
    static void test_raw_array() {
        auto start = std::chrono::high_resolution_clock::now();

        int* raw_array = new int[TAMANO];

        // Inicializar
        for(size_t i = 0; i < TAMANO; i++) {
            raw_array[i] = static_cast<int>(i);
        }

        // Procesar
        long long suma = 0;
        for(size_t i = 0; i < TAMANO; i++) {
            suma += raw_array[i];
        }

        delete[] raw_array;  // ⚠️ Manual

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        std::cout << "Raw array: " << duration.count() << "ms, suma: " << suma << std::endl;
    }

    static void test_unique_ptr_array() {
        auto start = std::chrono::high_resolution_clock::now();

        auto smart_array = std::make_unique<int[]>(TAMANO);

        // Inicializar
        for(size_t i = 0; i < TAMANO; i++) {
            smart_array[i] = static_cast<int>(i);
        }

        // Procesar
        long long suma = 0;
        for(size_t i = 0; i < TAMANO; i++) {
            suma += smart_array[i];
        }

        // ✅ Automático
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        std::cout << "Smart array: " << duration.count() << "ms, suma: " << suma << std::endl;
    }
};

int main() {
    std::cout << "=== PERFORMANCE: unique_ptr<T[]> vs new[]/delete[] ===" << std::endl;

    // ⚠️ Test con arrays grandes
    std::cout << "Testing with " << PerformanceTester::TAMANO << " elements:" << std::endl;

    PerformanceTester::test_raw_array();
    PerformanceTester::test_unique_ptr_array();

    std::cout << "✅ Ambos tienen rendimiento similar, pero unique_ptr es más seguro" << std::endl;

    return 0;
}`,
            explanation: "📊 **Performance comparison:**\n\n1. **Overhead mínimo**: unique_ptr<T[]> tiene casi el mismo rendimiento que raw arrays\n2. **Seguridad**: Sin costo de seguridad adicional\n3. **RAII**: Liberación automática sin impacto en performance\n4. **Cache friendly**: Mismo patrón de acceso que arrays raw\n\n**💡 unique_ptr<T[]> es la opción por defecto para arrays dinámicos en C++ moderno.**"
          }
        ],
        exercises: [
          "⚡ Implementa benchmarks para comparar performance",
          "🏗️ Crea un wrapper que elija entre unique_ptr<T> y unique_ptr<T[]> automáticamente",
          "🔧 Implementa custom deleter para arrays con cleanup especial",
          "📈 Mide el overhead exacto de unique_ptr<T[]> vs raw arrays",
          "🎯 Implementa allocator personalizado para unique_ptr<T[]>",
          "🛡️ Crea sistema de logging para operaciones de array"
        ]
      }
    }
  },
  {
    id: 12,
    title: "🔄 Move vs Copy - Semántica de unique_ptr",
    description: "Comprende por qué unique_ptr solo se puede mover, no copiar. ¡Fundamento de move semantics!",
    difficulty: 'intermediate' as const,
    topic: "Smart Pointers",
    completed: false,
    content: {
      beginner: {
        theory: "🔄 **¿Por qué unique_ptr no se puede copiar?**\n\n`std::unique_ptr` tiene **propiedad única**, lo que significa que solo puede haber un `unique_ptr` apuntando a un objeto al mismo tiempo.\n\n**💡 Analogía cotidiana:**\nImagina que tienes una llave única que abre una puerta secreta:\n- **Copiar la llave** = ¡Imposible! Solo puede existir una llave\n- **Transferir la llave** = Dar la llave a otra persona (mover)\n- **Destruir la llave** = La puerta queda sin llave (destrucción)\n\n**🔑 Conceptos clave:**\n- **Move semantics**: Transferir propiedad sin copiar\n- **std::move()**: Convierte en rvalue para permitir movimiento\n- **Propiedad exclusiva**: Solo un owner al mismo tiempo",

        examples: [
          {
            code: `// 🔄 MOVE VS COPY - unique_ptr no se puede copiar
#include <iostream>
#include <memory>

void mostrar_propiedad(const std::unique_ptr<int>& ptr, const std::string& nombre) {
    if (ptr) {
        std::cout << nombre << " tiene: " << *ptr << std::endl;
    } else {
        std::cout << nombre << " está vacío (nullptr)" << std::endl;
    }
}

int main() {
    std::cout << "=== MOVE VS COPY CON unique_ptr ===" << std::endl;

    // ✅ Crear unique_ptr
    auto original = std::make_unique<int>(42);
    mostrar_propiedad(original, "Original");

    // ❌ ¡ERROR! No se puede copiar
    // std::unique_ptr<int> copia = original;  // Error de compilación

    // ✅ ¡SÍ! Se puede mover (transferir propiedad)
    std::unique_ptr<int> movido = std::move(original);
    std::cout << "\n--- Después de std::move ---" << std::endl;
    mostrar_propiedad(original, "Original");  // Ahora nullptr
    mostrar_propiedad(movido, "Movido");      // Ahora tiene el valor

    return 0;
}`,
            explanation: "🔄 **Move vs Copy:**\n\n1. **Crear unique_ptr**: `original` tiene propiedad del objeto\n2. **Copiar (ERROR)**: `std::unique_ptr<int> copia = original` → Error de compilación\n3. **Mover (CORRECTO)**: `std::unique_ptr<int> movido = std::move(original)` → Transferencia de propiedad\n4. **Después del move**: `original` es `nullptr`, `movido` tiene el objeto\n\n**💡 El movimiento transfiere la propiedad, la copia crearía dos owners.**"
          },
          {
            code: `// 🔄 FUNCIONES CON unique_ptr - Pasar por valor vs referencia
#include <iostream>
#include <memory>

class Objeto {
public:
    Objeto(int v) : valor(v) {
        std::cout << "Objeto " << valor << " creado" << std::endl;
    }
    ~Objeto() {
        std::cout << "Objeto " << valor << " destruido" << std::endl;
    }
    void usar() const {
        std::cout << "Usando objeto " << valor << std::endl;
    }
private:
    int valor;
};

// ❌ FORMA INCORRECTA: Pasar por valor consume el puntero
void funcion_por_valor(std::unique_ptr<Objeto> obj) {
    std::cout << "Función recibió: ";
    obj->usar();
    // obj se destruye al salir de la función
}

// ✅ FORMA CORRECTA: Pasar por referencia
void funcion_por_referencia(const std::unique_ptr<Objeto>& obj) {
    std::cout << "Función recibió referencia a: ";
    obj->usar();
    // El puntero original no se modifica
}

// ✅ FORMA PARA TRANSFERIR PROPIEDAD: Pasar por valor + move
std::unique_ptr<Objeto> crear_objeto(int valor) {
    return std::make_unique<Objeto>(valor);
}

int main() {
    auto puntero = std::make_unique<Objeto>(100);
    puntero->usar();

    std::cout << "\n--- Llamando funciones ---" << std::endl;

    // ❌ Consumiría el puntero (no recomendado)
    // funcion_por_valor(std::move(puntero));

    // ✅ Solo observa (recomendado)
    funcion_por_referencia(puntero);

    // ✅ Transferir propiedad
    auto nuevo_puntero = crear_objeto(200);

    return 0;
}`,
            explanation: "🔄 **Formas de pasar unique_ptr a funciones:**\n\n1. **Por valor (consume)**: `func(unique_ptr<T> p)` → El puntero se mueve a la función\n2. **Por referencia (observa)**: `func(const unique_ptr<T>& p)` → Solo observa, no modifica\n3. **Retornar unique_ptr**: `unique_ptr<T> func()` → Transfiere propiedad al llamador\n\n**💡 Elegir la forma correcta según la intención:**\n- **Observar**: Usa referencia const\n- **Transferir**: Usa move\n- **Consumir**: Usa por valor"
          }
        ],
        exercises: [
          "🔄 Intenta copiar un unique_ptr y observa el error de compilación",
          "📝 Usa std::move para transferir propiedad entre unique_ptr",
          "🔀 Crea funciones que acepten unique_ptr por referencia y por valor",
          "🛡️ Implementa una función que retorne unique_ptr",
          "⚡ Comprueba que el movimiento es O(1) (constante)"
        ]
      },
      intermediate: {
        theory: "La semántica de movimiento es uno de los avances más importantes de C++11. `std::unique_ptr` es el ejemplo perfecto de por qué necesitamos move semantics.\n\n**Sin move semantics:**\n- No podríamos transferir propiedad\n- Tendríamos que usar punteros raw o shared_ptr\n- Más bugs de gestión manual\n\n**Con move semantics:**\n- Transferencia eficiente de recursos\n- Claridad de ownership\n- Prevención de sharing accidental\n- API más expresivas",

        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <vector>

class Administrador {
private:
    std::unique_ptr<int[]> datos;
    size_t tamano;

public:
    // Constructor move-only
    Administrador(std::unique_ptr<int[]> d, size_t t)
        : datos(std::move(d)), tamano(t) {
        std::cout << "Administrador creado con " << tamano << " elementos" << std::endl;
    }

    // Constructor que crea datos
    explicit Administrador(size_t t)
        : datos(std::make_unique<int[]>(t)), tamano(t) {
        for(size_t i = 0; i < tamano; i++) {
            datos[i] = static_cast<int>(i * 10);
        }
        std::cout << "Administrador creado con datos generados" << std::endl;
    }

    // Move constructor
    Administrador(Administrador&& otro) noexcept
        : datos(std::move(otro.datos)), tamano(otro.tamano) {
        otro.tamano = 0;
        std::cout << "Move constructor: propiedad transferida" << std::endl;
    }

    // Move assignment
    Administrador& operator=(Administrador&& otro) noexcept {
        if (this != &otro) {
            datos = std::move(otro.datos);
            tamano = otro.tamano;
            otro.tamano = 0;
            std::cout << "Move assignment: propiedad transferida" << std::endl;
        }
        return *this;
    }

    void mostrar() const {
        std::cout << "Datos: ";
        for(size_t i = 0; i < tamano; i++) {
            std::cout << datos[i] << " ";
        }
        std::cout << std::endl;
    }

    // Método que transfiere propiedad
    std::unique_ptr<int[]> transferir_datos() {
        std::cout << "Transfiriendo propiedad de datos" << std::endl;
        return std::move(datos);
    }
};

int main() {
    std::cout << "=== MOVE SEMANTICS EN CLASES ===" << std::endl;

    // Crear administrador
    Administrador admin1(5);
    admin1.mostrar();

    // Move constructor
    Administrador admin2(std::move(admin1));
    admin2.mostrar();

    // Move assignment
    Administrador admin3(3);
    admin3 = std::move(admin2);
    admin3.mostrar();

    // Transferir datos
    auto datos_extraidos = admin3.transferir_datos();
    std::cout << "Datos extraídos: " << datos_extraidos[0] << std::endl;

    return 0;
}`,
            explanation: "🔄 **Move semantics en clases:**\n\n1. **Move constructor**: `Admin(Admin&& otro)` → Transfiere recursos\n2. **Move assignment**: `operator=(Admin&& otro)` → Transfiere recursos\n3. **std::move()**: Convierte lvalue en rvalue para movimiento\n4. **Transferencia de propiedad**: Los unique_ptr internos se mueven\n\n**💡 Las clases con unique_ptr deben implementar move semantics.**"
          }
        ],
        exercises: [
          "🏗️ Implementa move constructor y move assignment para una clase con unique_ptr",
          "🔄 Crea una función que transfiera unique_ptr entre objetos",
          "📊 Compara rendimiento de copiar vs mover unique_ptr",
          "🛡️ Implementa una clase que solo permita movimiento, no copia",
          "⚡ Mide el tiempo de operaciones de movimiento"
        ]
      },
      expert: {
        theory: "Técnicamente, `std::unique_ptr` no puede ser copiable porque violaría su invariante fundamental: propiedad única. El sistema de tipos de C++ previene esto en tiempo de compilación.\n\n**Implementación técnica:**\n- `unique_ptr` elimina `operator=` y copy constructor\n- Solo mantiene move constructor y move assignment\n- Usa `delete` keyword para explicit deletion\n- Deleter es parte del tipo (type erasure)\n\n**Optimizaciones avanzadas:**\n- Empty base optimization para deleters sin estado\n- Inlining de llamadas al deleter\n- Minimal overhead comparado con raw pointers",

        examples: [
          {
            code: `#include <iostream>
#include <memory>
#include <type_traits>

template<typename T>
void analizar_unique_ptr(const std::unique_ptr<T>& ptr) {
    std::cout << "=== ANÁLISIS DE unique_ptr ===" << std::endl;
    std::cout << "Tipo T: " << typeid(T).name() << std::endl;
    std::cout << "Es puntero: " << std::is_pointer_v<T> << std::endl;
    std::cout << "Es array: " << std::is_array_v<T> << std::endl;

    if (ptr) {
        std::cout << "Valor: " << *ptr << std::endl;
        std::cout << "Dirección: " << ptr.get() << std::endl;
    } else {
        std::cout << "Puntero vacío (nullptr)" << std::endl;
    }
}

int main() {
    std::cout << "=== unique_ptr EN PROFUNDIDAD ===" << std::endl;

    // unique_ptr para objeto individual
    auto obj_ptr = std::make_unique<int>(42);
    analizar_unique_ptr(obj_ptr);

    // unique_ptr para array
    auto arr_ptr = std::make_unique<int[]>(5);
    for(int i = 0; i < 5; i++) {
        arr_ptr[i] = i * 100;
    }

    std::cout << "\n--- Array ---" << std::endl;
    std::cout << "Elementos: ";
    for(int i = 0; i < 5; i++) {
        std::cout << arr_ptr[i] << " ";
    }
    std::cout << std::endl;

    // Demostrar que no se puede copiar
    std::cout << "\n--- Intentando copiar (ERROR) ---" << std::endl;

    // Esto NO compila:
    // auto copia = obj_ptr;  // Error: use of deleted function
    // auto copia2 = *obj_ptr;  // Error: unique_ptr is not copyable

    // Esto SÍ funciona:
    auto movido = std::move(obj_ptr);
    std::cout << "Después del move: " << (obj_ptr ? "tiene valor" : "es nullptr") << std::endl;

    return 0;
}`,
            explanation: "🎯 **Análisis técnico de unique_ptr:**\n\n1. **Type traits**: Análisis de tipos en tiempo de compilación\n2. **Array vs object**: Diferentes especializaciones\n3. **Copy prevention**: Funciones eliminadas explícitamente\n4. **Move semantics**: Transferencia eficiente de recursos\n\n**💡 unique_ptr es un ejemplo perfecto de RAII y move semantics.**"
          }
        ],
        exercises: [
          "🔧 Usa type traits para inspeccionar unique_ptr en templates",
          "📝 Implementa una función que detecte si un tipo es move-only",
          "⚡ Crea benchmarks que muestren el costo de move vs copy",
          "🏗️ Implementa un smart pointer move-only personalizado",
          "🎯 Usa SFINAE para detectar si un tipo es copiable",
          "🔍 Analiza el assembly generado por operaciones de move"
        ]
      }
    }
  },
  {
    id: 4,
    title: "➕ Aritmética de Punteros - Operadores + y -",
    description: "Aprende a navegar por la memoria usando aritmética de punteros. ¡Descubre cómo +1 puede significar +4 bytes!",
    difficulty: 'beginner' as const,
    topic: "Punteros Básicos",
    completed: false,
    content: {
      beginner: {
        theory: "➕ **¿Qué es la aritmética de punteros?**\n\nLa aritmética de punteros permite navegar por la memoria usando operaciones matemáticas. ¡Pero cuidado! Los punteros no cuentan bytes, sino elementos.\n\n**🔑 Concepto Clave:**\n- **ptr + 1** → Avanza un elemento completo, no 1 byte\n- **ptr - 1** → Retrocede un elemento completo\n- **ptr + n** → Avanza n elementos\n\n**💡 Analogía cotidiana:**\nImagina casas en una calle:\n- Casa número 100 = Dirección actual\n- \"Siguiente casa\" = +1 casa (podría ser el número 104)\n- Puntero cuenta casas, no metros entre ellas",
        examples: [
          {
            code: `// ➕ Introducción a Aritmética de Punteros
// Descubre cómo los punteros navegan la memoria

#include <iostream>

int main() {
    // Array de enteros para practicar
    int numeros[5] = {10, 20, 30, 40, 50};
    
    // Puntero al primer elemento
    int* ptr = numeros;
    
    std::cout << "=== ARITMÉTICA DE PUNTEROS ===" << std::endl;
    
    // Mostrar elemento actual
    std::cout << "Elemento actual: " << *ptr << std::endl;
    std::cout << "Dirección actual: " << ptr << std::endl;
    
    // ➕ Avanzar un elemento
    ptr = ptr + 1;  // También: ptr++
    std::cout << "Después de +1: " << *ptr << std::endl;
    std::cout << "Nueva dirección: " << ptr << std::endl;
    
    // ➕ Avanzar dos elementos más
    ptr = ptr + 2;
    std::cout << "Después de +2: " << *ptr << std::endl;
    
    // ➖ Retroceder un elemento  
    ptr = ptr - 1;
    std::cout << "Después de -1: " << *ptr << std::endl;
    
    return 0;
}`,
            explanation: "🎯 **Desglosemos la aritmética:**\n\n1. `int* ptr = numeros` → Apunta al primer elemento\n2. `ptr + 1` → Avanza un int completo (4 bytes)\n3. `*ptr` → Accede al valor en la nueva posición\n4. `ptr - 1` → Retrocede un elemento\n5. Las direcciones cambian de 4 en 4 (tamaño de int)"
          }
        ],
        exercises: [
          "🎯 Crea un array y navega usando ptr++ y ptr--",
          "📏 Observa cómo cambian las direcciones con diferentes tipos",
          "🔄 Recorre un array completo usando solo aritmética de punteros",
          "⚠️ Intenta ptr+10 en un array de 5 elementos y observa el peligro",
          "🔍 Compara sizeof(int) con la diferencia entre ptr y ptr+1"
        ]
      },
      intermediate: {
        theory: "La aritmética de punteros opera en unidades del tipo apuntado. Cuando incrementas un puntero, avanza sizeof(T) bytes, no 1 byte.\n\n**Operaciones válidas:**\n- **ptr + n, ptr - n**: Desplazamiento\n- **ptr1 - ptr2**: Distancia entre punteros (mismo tipo)\n- **++ptr, ptr++**: Pre/post incremento\n- **--ptr, ptr--**: Pre/post decremento\n\n**Consideraciones importantes:**\n- Solo válido dentro del mismo objeto/array\n- Comportamiento indefinido si sales del rango\n- Diferentes tipos = diferentes tamaños de salto\n- Útil para implementar iteradores eficientes",
        examples: [
          {
            code: `#include <iostream>

int main() {
    // Arrays de diferentes tipos
    int enteros[4] = {1, 2, 3, 4};
    double decimales[4] = {1.1, 2.2, 3.3, 4.4};
    char caracteres[4] = {'A', 'B', 'C', 'D'};
    
    int* int_ptr = enteros;
    double* double_ptr = decimales;
    char* char_ptr = caracteres;
    
    std::cout << "=== COMPARACIÓN DE TIPOS ===" << std::endl;
    
    // Mostrar direcciones iniciales
    std::cout << "int*: " << int_ptr << " -> " << int_ptr + 1 << " (diff: " << (int_ptr + 1) - int_ptr << ")" << std::endl;
    std::cout << "double*: " << double_ptr << " -> " << double_ptr + 1 << " (diff: " << (double_ptr + 1) - double_ptr << ")" << std::endl;
    std::cout << "char*: " << (void*)char_ptr << " -> " << (void*)(char_ptr + 1) << " (diff: " << (char_ptr + 1) - char_ptr << ")" << std::endl;
    
    // Recorrido usando aritmética
    std::cout << "\\nRecorrido con aritmética:" << std::endl;
    for(int i = 0; i < 4; i++) {
        std::cout << "enteros[" << i << "] = " << *(int_ptr + i) << std::endl;
        std::cout << "decimales[" << i << "] = " << *(double_ptr + i) << std::endl;
        std::cout << "caracteres[" << i << "] = " << *(char_ptr + i) << std::endl;
    }
    
    return 0;
}`,
            explanation: "Este ejemplo muestra cómo diferentes tipos avanzan diferentes cantidades de bytes: int (4), double (8), char (1)."
          }
        ],
        exercises: [
          "🔧 Implementa funciones que usen aritmética en lugar de índices",
          "📊 Compara rendimiento: aritmética vs acceso por índice",
          "🎯 Crea iteradores personalizados usando aritmética de punteros",
          "⚠️ Implementa verificaciones de bounds en aritmética",
          "🔍 Analiza el assembly generado por diferentes enfoques"
        ]
      },
      expert: {
        theory: "La aritmética de punteros es fundamental para el rendimiento en C++. Los compiladores pueden optimizar bucles que usan aritmética de punteros mejor que acceso por índice.\n\n**Detalles técnicos:**\n- **Pointer aliasing**: Restricciones del compilador\n- **Cache locality**: Acceso secuencial vs aleatorio\n- **Loop unrolling**: Optimizaciones automáticas\n- **SIMD**: Vectorización de operaciones\n\n**Casos de uso avanzados:**\n- Implementación de contenedores STL\n- Algoritmos de procesamiento de imagen\n- Parsers de alto rendimiento\n- Sistemas de memoria personalizada",
        examples: [
          {
            code: `#include <iostream>
#include <chrono>
#include <vector>

template<typename T>
void copy_with_indices(T* dest, const T* src, size_t count) {
    for(size_t i = 0; i < count; ++i) {
        dest[i] = src[i];
    }
}

template<typename T>  
void copy_with_pointers(T* dest, const T* src, size_t count) {
    const T* src_end = src + count;
    while(src != src_end) {
        *dest++ = *src++;
    }
}

template<typename T>
void copy_with_pointer_arithmetic(T* dest, const T* src, size_t count) {
    for(const T* end = src + count; src < end; ++src, ++dest) {
        *dest = *src;
    }
}

int main() {
    constexpr size_t SIZE = 1000000;
    std::vector<int> source(SIZE, 42);
    std::vector<int> dest1(SIZE), dest2(SIZE), dest3(SIZE);
    
    auto benchmark = [](const char* name, auto func) {
        auto start = std::chrono::high_resolution_clock::now();
        func();
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        std::cout << name << ": " << duration.count() << " μs" << std::endl;
    };
    
    benchmark("Índices", [&]() { 
        copy_with_indices(dest1.data(), source.data(), SIZE); 
    });
    
    benchmark("Punteros++", [&]() { 
        copy_with_pointers(dest2.data(), source.data(), SIZE); 
    });
    
    benchmark("Aritmética", [&]() { 
        copy_with_pointer_arithmetic(dest3.data(), source.data(), SIZE); 
    });
    
    return 0;
}`,
            explanation: "Comparación de rendimiento entre diferentes técnicas de iteración, mostrando cómo la aritmética de punteros puede ser más eficiente."
          }
        ],
        exercises: [
          "⚡ Implementa algoritmos STL usando solo aritmética de punteros",
          "🎯 Optimiza bucles críticos reemplazando índices por punteros",
          "📊 Analiza el impacto en caché de diferentes patrones de acceso",
          "🔧 Crea iteradores que aprovechen aritmética optimizada",
          "🏗️ Implementa allocators que usen aritmética avanzada",
          "📈 Mide rendimiento en arquitecturas específicas"
        ]
      }
    }
  },
  {
    id: 32,
    title: "⚠️ Exception Memory Leaks",
    description: "Master exception-safe memory management and understand how exceptions can cause subtle memory leaks without RAII.",
    difficulty: 'expert' as const,
    topic: "Exception Safety",
    completed: false,
    content: {
      beginner: {
        theory: "When exceptions occur between new and delete, memory leaks can happen. RAII (Resource Acquisition Is Initialization) prevents this automatically.",
        examples: [
          { code: "// DANGEROUS: Exception between new/delete\nvoid risky() {\n    Widget* ptr = new Widget();\n    may_throw(); // Exception here!\n    delete ptr;  // Never reached\n}", explanation: "If may_throw() throws an exception, the delete statement is never reached, causing a memory leak." },
        ],
        exercises: [
          "🚨 Identify memory leak scenarios with exceptions",
          "🛡️ Implement RAII solutions with smart pointers",
          "🔧 Create custom exception guards"
        ]
      },
      intermediate: {
        theory: "RAII ensures automatic cleanup during stack unwinding. When exceptions propagate up the call stack, destructors are called automatically.",
        examples: [
          { code: "// SAFE: RAII guarantees cleanup\nvoid safe() {\n    auto ptr = std::make_unique<Widget>();\n    may_throw(); // Exception OK - destructor called\n}", explanation: "unique_ptr's destructor is automatically called during stack unwinding, preventing memory leaks." }
        ],
        exercises: [
          "🎯 Convert unsafe new/delete to RAII patterns",
          "📊 Implement custom scope guards",
          "⚡ Understand stack unwinding mechanics"
        ]
      },
      expert: {
        theory: "Exception safety levels: basic guarantee (no leaks), strong guarantee (no state change), and no-throw guarantee (never throws).",
        examples: [
          { code: "template<typename F>\nclass ScopeGuard {\n    F cleanup_;\npublic:\n    explicit ScopeGuard(F f) : cleanup_(f) {}\n    ~ScopeGuard() { cleanup_(); }\n};", explanation: "Custom scope guards provide RAII for complex cleanup scenarios." }
        ],
        exercises: [
          "🏗️ Implement strong exception safety",
          "🔒 Design no-throw operations",
          "📈 Analyze exception safety in large codebases"
        ]
      }
    }
  },
  {
    id: 33,
    title: "🔧 shared_ptr Custom Deleters",
    description: "Master custom deletion logic with shared_ptr control blocks and understand their memory and performance impacts.",
    difficulty: 'expert' as const,
    topic: "Smart Pointers",
    completed: false,
    content: {
      beginner: {
        theory: "shared_ptr allows custom deletion logic stored in the control block. Different deleter types have varying memory and performance impacts.",
        examples: [
          { code: "// Custom deleter for FILE*\nstd::shared_ptr<FILE> file_ptr(\n    fopen(\"data.txt\", \"r\"),\n    [](FILE* f) { if(f) fclose(f); }\n);", explanation: "Custom lambda deleter ensures proper cleanup of C resources." },
        ],
        exercises: [
          "📁 Implement RAII for FILE* resources",
          "🔧 Create custom deleters for arrays",
          "🛡️ Handle C API resources safely"
        ]
      },
      intermediate: {
        theory: "Control block contains reference counts, deleter object, and allocator. Different deleter types affect memory overhead.",
        examples: [
          { code: "// Function pointer deleter (zero overhead)\nvoid my_deleter(Widget* p) { delete p; }\nauto sp = std::shared_ptr<Widget>(new Widget(), my_deleter);", explanation: "Function pointers have zero storage overhead in the control block." }
        ],
        exercises: [
          "📊 Compare deleter memory overhead",
          "⚡ Optimize custom deleters for performance",
          "🔍 Understand control block internals"
        ]
      },
      expert: {
        theory: "Type erasure allows different deleters in same shared_ptr type. make_shared vs custom deleter affects allocation patterns and performance.",
        examples: [
          { code: "// Large lambda capture increases control block size\nint context = 42;\nauto sp = std::shared_ptr<Widget>(new Widget(),\n    [context](Widget* w) { /* uses context */ delete w; });", explanation: "Captured variables are stored in the control block, increasing memory usage." }
        ],
        exercises: [
          "🏗️ Design efficient custom deleters",
          "📈 Profile memory usage with different deleters",
          "⚙️ Implement zero-overhead deleter patterns"
        ]
      }
    }
  },
  {
    id: 34,
    title: "📊 shared_ptr<T[]> Arrays",
    description: "Explore array specialization vs alternatives in modern C++. Learn when to use shared_ptr<T[]> and when std::vector is better.",
    difficulty: 'intermediate' as const,
    topic: "Smart Pointers",
    completed: false,
    content: {
      beginner: {
        theory: "shared_ptr<T[]> (C++17) provides array specialization with automatic delete[] and operator[] access. Usually std::vector is a better choice.",
        examples: [
          { code: "// Array specialization\nstd::shared_ptr<int[]> arr(new int[10]);\narr[0] = 42;  // operator[] available", explanation: "shared_ptr<T[]> automatically uses delete[] and provides array access." },
        ],
        exercises: [
          "📊 Create shared array instances",
          "🔍 Compare with std::vector",
          "⚡ Understand automatic delete[]"
        ]
      },
      intermediate: {
        theory: "Array specialization removes operator* and operator-> while adding operator[]. No size information is provided.",
        examples: [
          { code: "// Modern alternatives\nstd::vector<int> vec(10);     // Preferred\nstd::array<int, 10> arr;      // Fixed size\nauto uptr = std::make_unique<int[]>(10); // Exclusive", explanation: "Modern C++ provides better alternatives with bounds checking and size information." }
        ],
        exercises: [
          "📈 Compare performance characteristics",
          "🛡️ Implement bounds checking",
          "🔧 Choose appropriate container types"
        ]
      },
      expert: {
        theory: "Use shared_ptr<T[]> only when shared ownership of arrays is essential. Memory overhead and lack of size information make containers preferable.",
        examples: [
          { code: "// When shared_ptr<T[]> makes sense\nclass ImageBuffer {\n    std::shared_ptr<uint8_t[]> pixels_;\npublic:\n    std::shared_ptr<uint8_t[]> get_pixels() const { return pixels_; }\n};", explanation: "Shared ownership of large buffers between multiple objects justifies shared_ptr<T[]>." }
        ],
        exercises: [
          "🏗️ Design shared buffer systems",
          "📊 Profile memory usage vs alternatives",
          "⚙️ Implement C API compatibility layers"
        ]
      }
    }
  },
  {
    id: 35,
    title: "🛡️ not_null<T*> Wrapper",
    description: "Express non-null intent in API design with GSL not_null wrapper and eliminate unnecessary null checks.",
    difficulty: 'intermediate' as const,
    topic: "Safety",
    completed: false,
    content: {
      beginner: {
        theory: "gsl::not_null<T*> is a lightweight wrapper that expresses non-null intent in API design. Part of the Guidelines Support Library (GSL).",
        examples: [
          { code: "// Clear intent\nvoid process(gsl::not_null<Widget*> widget) {\n    widget->do_something(); // No null check needed!\n}", explanation: "Function signature clearly communicates that widget cannot be null." },
        ],
        exercises: [
          "🎯 Create not_null function parameters",
          "🔍 Identify null check elimination opportunities",
          "📋 Design clear API contracts"
        ]
      },
      intermediate: {
        theory: "not_null provides runtime validation on construction and assignment. Different assertion levels available: none, debug, always.",
        examples: [
          { code: "// Runtime validation\nWidget* maybe_null = get_widget();\nif (maybe_null) {\n    auto safe = gsl::not_null{maybe_null};\n    process(safe); // Guaranteed non-null\n}", explanation: "Explicit null check before creating not_null wrapper ensures safety." }
        ],
        exercises: [
          "⚙️ Configure assertion levels",
          "🛡️ Implement validation strategies",
          "🔧 Integrate with existing codebases"
        ]
      },
      expert: {
        theory: "Static analyzers understand not_null intent. Core Guidelines I.12 and F.23 recommend using not_null for API design clarity.",
        examples: [
          { code: "// Static analyzer benefits\nvoid analyze_me(gsl::not_null<Widget*> guaranteed,\n               Widget* maybe_null) {\n    guaranteed->method(); // No warnings\n    maybe_null->method(); // Analyzer warns\n}", explanation: "Tools like Clang Static Analyzer and PVS-Studio understand not_null semantics." }
        ],
        exercises: [
          "🔍 Enable static analysis warnings",
          "📊 Migrate existing APIs to not_null",
          "⚡ Measure performance impact"
        ]
      }
    }
  },
  {
    id: 37,
    title: "🔄 Cyclic shared_ptr Graphs",
    description: "Understand how shared_ptr cycles create memory leaks and learn to break them with weak_ptr.",
    difficulty: 'expert' as const,
    topic: "Advanced Smart Pointers",
    completed: false,
    content: {
      beginner: {
        theory: "When shared_ptr objects reference each other in a cycle, they prevent each other from being destroyed, causing memory leaks.",
        examples: [
          { code: "auto a = make_shared<Node>();\nauto b = make_shared<Node>();\na->next = b; b->prev = a; // Cycle!", explanation: "Both nodes keep each other alive forever." }
        ],
        exercises: [
          "🔍 Identify cyclic references",
          "🔧 Break cycles with weak_ptr"
        ]
      }
    }
  },
  {
    id: 38,
    title: "⚛️ atomic<shared_ptr> Lock-Free",
    description: "Learn thread-safe shared_ptr operations using atomic<shared_ptr> for lock-free programming.",
    difficulty: 'expert' as const,
    topic: "Concurrency",
    completed: false,
    content: {
      beginner: {
        theory: "atomic<shared_ptr> provides thread-safe operations like load, store, and compare_exchange without mutexes.",
        examples: [
          { code: "atomic<shared_ptr<int>> atomic_ptr;\nauto local = atomic_ptr.load(); // Thread-safe", explanation: "Atomic operations prevent race conditions." }
        ],
        exercises: [
          "⚡ Implement lock-free data structures",
          "🔒 Understand memory ordering"
        ]
      }
    }
  },
  {
    id: 40,
    title: "📏 Deleter State Impact on unique_ptr Size",
    description: "Explore how different deleter types affect unique_ptr memory footprint and EBO optimization.",
    difficulty: 'advanced' as const,
    topic: "Memory Optimization",
    completed: false,
    content: {
      beginner: {
        theory: "Empty Base Optimization (EBO) allows stateless deleters to add no memory overhead to unique_ptr.",
        examples: [
          { code: "sizeof(unique_ptr<int>) == 8; // With default deleter\nsizeof(unique_ptr<int, function<void(int*)>>) > 8; // With std::function", explanation: "Stateful deleters increase unique_ptr size." }
        ],
        exercises: [
          "📐 Measure deleter overhead",
          "🎯 Optimize memory usage"
        ]
      }
    }
  },
  {
    id: 41,
    title: "⚠️ const_cast Traps and UB",
    description: "Learn the dangerous pitfalls of const_cast and when it causes undefined behavior.",
    difficulty: 'expert' as const,
    topic: "Undefined Behavior",
    completed: false,
    content: {
      beginner: {
        theory: "Using const_cast to modify originally const objects results in undefined behavior due to compiler optimizations.",
        examples: [
          { code: "const int x = 42;\nint* px = const_cast<int*>(&x);\n*px = 100; // UB!", explanation: "Compiler may assume const objects never change." }
        ],
        exercises: [
          "🚫 Identify UB scenarios",
          "✅ Find safe alternatives"
        ]
      }
    }
  },
  {
    id: 42,
    title: "🏭 unique_ptr<Base> Factory Patterns",
    description: "Master factory patterns using unique_ptr for clean ownership transfer and polymorphism.",
    difficulty: 'advanced' as const,
    topic: "Design Patterns",
    completed: false,
    content: {
      beginner: {
        theory: "Factory patterns with unique_ptr provide clear ownership semantics and exception safety.",
        examples: [
          { code: "unique_ptr<Shape> createShape(const string& type) {\n  return make_unique<Circle>();\n}", explanation: "Factory functions transfer ownership to caller." }
        ],
        exercises: [
          "🏗️ Implement factory patterns",
          "🔧 Use builder pattern with unique_ptr"
        ]
      }
    }
  },
  {
    id: 60,
    title: "🎓 Final Examination",
    description: "Master all pointer scenarios and become a memory management expert! Solve 8 challenging scenarios to prove your expertise.",
    difficulty: 'expert' as const,
    topic: "Comprehensive Review",
    completed: false,
    content: {
      beginner: {
        theory: "This comprehensive examination tests your understanding of all pointer concepts covered in the course.",
        examples: [
          { code: "// Example scenarios include:\n// - Dangling pointers\n// - Double delete\n// - Memory leaks\n// - Cyclic references", explanation: "Eight different scenarios test your diagnostic and problem-solving skills." },
        ],
        exercises: [
          "🔍 Diagnose memory problems",
          "🛠️ Apply appropriate fixes",
          "🎯 Achieve expert-level score"
        ]
      },
      intermediate: {
        theory: "Each scenario represents a real-world memory management challenge with different severity levels and solution approaches.",
        examples: [
          { code: "// Scoring system:\n// +10 points for diagnosis\n// +25 points for correct fix\n// -5 points for hints used", explanation: "Score 200+ points to achieve expert level certification." }
        ],
        exercises: [
          "📊 Complete all scenarios",
          "🏆 Maximize your score",
          "🔧 Master modern C++ solutions"
        ]
      },
      expert: {
        theory: "The final examination integrates concepts from basic pointers through advanced smart pointer usage, testing practical application skills.",
        examples: [
          { code: "// Perfect score: 280 points\n// Expert level: 200+ points\n// Competent level: 150+ points", explanation: "Achieve mastery by solving all scenarios without hints." }
        ],
        exercises: [
          "🎯 Achieve perfect score",
          "🏅 Demonstrate comprehensive mastery",
          "🚀 Apply knowledge to real projects"
        ]
      }
    }
  },

  // Advanced Design Patterns with Smart Pointers
  {
    id: 44,
    title: "🔍 Observer Pattern con Smart Pointers",
    description: "Implementa el patrón Observer de forma segura usando weak_ptr para evitar punteros colgantes.",
    difficulty: 'advanced' as const,
    topic: "Design Patterns",
    completed: false,
    content: {
      advanced: {
        theory: "El Observer Pattern con smart pointers garantiza seguridad de memoria y previene punteros colgantes cuando los observers se destruyen.",
        examples: [],
        exercises: [
          "🔍 Implementa Subject con vector<weak_ptr<Observer>>",
          "🛡️ Maneja observers destruidos automáticamente",
          "📡 Crea notificaciones thread-safe",
          "🎯 Implementa diferentes tipos de observers",
          "🧹 Limpia automáticamente observers expirados"
        ]
      }
    }
  },

  {
    id: 45,
    title: "⚙️ Command Pattern con unique_ptr",
    description: "Gestor de comandos con deshacer/rehacer usando unique_ptr para gestión automática de memoria.",
    difficulty: 'advanced' as const,
    topic: "Design Patterns",
    completed: false,
    content: {
      advanced: {
        theory: "El Command Pattern encapsula operaciones como objetos, permitiendo deshacer/rehacer, logging, y transacciones con gestión automática de memoria.",
        examples: [],
        exercises: [
          "⚙️ Crea CommandManager con unique_ptr<Command>",
          "↶ Implementa sistema de undo/redo",
          "📦 Diseña MacroCommands composites",
          "💾 Añade logging persistente de comandos",
          "🔒 Implementa comandos thread-safe"
        ]
      }
    }
  },

  {
    id: 47,
    title: "🔄 Strategy Pattern con Function Pointers",
    description: "Algoritmos intercambiables usando function pointers para máximo rendimiento sin overhead.",
    difficulty: 'advanced' as const,
    topic: "Design Patterns",
    completed: false,
    content: {
      advanced: {
        theory: "El Strategy Pattern con function pointers permite cambiar algoritmos dinámicamente sin overhead de virtual functions.",
        examples: [],
        exercises: [
          "🔄 Implementa Context con function pointer strategy",
          "⚡ Crea registry de estrategias disponibles",
          "📈 Compara performance vs virtual functions",
          "🧪 Usa std::function para mayor flexibilidad",
          "🔒 Implementa strategy switching thread-safe"
        ]
      }
    }
  },

  {
    id: 48,
    title: "🔬 Template Metaprogramming con Punteros",
    description: "Cómputo en tiempo de compilación y type traits para manipular tipos de punteros.",
    difficulty: 'expert' as const,
    topic: "Metaprogramming",
    completed: false,
    content: {
      expert: {
        theory: "La metaprogramación con templates permite cómputo en tiempo de compilación, especialmente útil para manipular tipos de punteros y crear abstracciones zero-cost.",
        examples: [],
        exercises: [
          "🔬 Implementa type traits para punteros",
          "⚡ Crea constexpr algorithms con punteros",
          "🛠️ Usa SFINAE para overload resolution",
          "📋 Implementa concepts C++20 para punteros",
          "🎯 Optimiza código con template specialization"
        ]
      }
    }
  },
  {
    id: 50,
    title: "Vector Reallocation with unique_ptr",
    description: "Advanced memory reallocation behavior, move semantics, and exception safety in containers",
    difficulty: 'expert' as const,
    topic: "Advanced Memory Management",
    completed: false
  },
  {
    id: 51,
    title: "shared_ptr Multiple Inheritance",
    description: "Multiple inheritance pointer casting, virtual base classes, and the diamond problem",
    difficulty: 'expert' as const,
    topic: "Advanced Smart Pointers", 
    completed: false
  },
  {
    id: 52,
    title: "Interactive Signature Analyzer",
    description: "Interactive function signature analysis and parameter lifetime analysis",
    difficulty: 'expert' as const,
    topic: "Lifetime Analysis",
    completed: false
  },
  {
    id: 53,
    title: "Lambda Captures with Smart Pointers", 
    description: "Capture by value vs reference, lifetime management in lambda expressions",
    difficulty: 'expert' as const,
    topic: "Modern C++ Features",
    completed: false
  },
  {
    id: 54,
    title: "Interior Pointers with string_view/span",
    description: "Non-owning views, dangling pointer detection, and safe span usage",
    difficulty: 'expert' as const,
    topic: "View Types",
    completed: false
  },
  {
    id: 55,
    title: "Ownership Audit System",
    description: "Automated ownership analysis, leak detection, and ownership transfer validation",
    difficulty: 'expert' as const,
    topic: "Static Analysis",
    completed: false
  },
  {
    id: 56,
    title: "ABI Simulator for Function Pointers",
    description: "ABI compatibility, function pointer layouts, and calling conventions",
    difficulty: 'expert' as const,
    topic: "Low-Level Programming",
    completed: false
  },
  {
    id: 57,
    title: "C Interop with RAII Wrappers",
    description: "C library integration, RAII wrappers, and exception safety across boundaries",
    difficulty: 'expert' as const,
    topic: "C Integration",
    completed: false
  },
  {
    id: 58,
    title: "Performance Battle: Copy vs Move",
    description: "Move semantics performance, copy elision, and RVO optimization",
    difficulty: 'expert' as const,
    topic: "Performance Optimization",
    completed: false
  },
  {
    id: 59,
    title: "Shared Owner with View using Aliasing Constructor",
    description: "Aliasing constructor usage and shared ownership of subobjects",
    difficulty: 'expert' as const,
    topic: "Advanced Smart Pointers",
    completed: false
  },

  // Future advanced lessons can be added here...
];

// Componente de visualización 3D mejorado con animaciones
const Enhanced3DVisualization = ({ lesson, animationStep, isAnimating }: {
  lesson: any,
  animationStep: number,
  isAnimating: boolean
}) => {
  const { state } = useApp(); // eslint-disable-line @typescript-eslint/no-unused-vars

  // Crear datos de visualización basados en la lección y paso actual
  const getVisualizationData = () => {
    const baseData: any = {
      stack: [
        { id: 'var1', type: 'stack', address: 0x1000, value: 'int x', size: 4, color: '#00ff88' },
        { id: 'ptr1', type: 'stack', address: 0x1004, value: 'int* ptr', size: 8, color: '#00d4ff' }
      ],
      heap: [] as any[],
      global: [] as any[],
      pointers: [] as any[]
    };

    if (lesson.id === 0 && lesson.content?.examples) {
      // Lección 0: Introducción a Punteros
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar variable y puntero sin conectar
          baseData.stack = [
            { id: 'var1', type: 'stack', address: 0x1000, value: 'int edad = 25', size: 4, color: '#00ff88' },
            { id: 'ptr1', type: 'stack', address: 0x1004, value: 'int* puntero_a_edad', size: 8, color: '#00d4ff' }
          ];
          baseData.heap = [
            { id: 'heap_example', type: 'heap', address: 0x2000, value: 'new int[3]', size: 12, color: '#ff6b6b' }
          ];
          baseData.global = [
            { id: 'global_var', type: 'global', address: 0x3000, value: 'static int contador', size: 4, color: '#ffa500' }
          ];
          baseData.pointers = [
            { id: 'arrow1', name: 'puntero_a_edad', targetId: null, address: 0x1004, color: '#00d4ff', type: 'raw' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Conectar puntero a la variable
          baseData.pointers = [
            { id: 'connection1', name: 'puntero_a_edad', targetId: 'var1', address: 0x1004, color: '#00d4ff', type: 'raw' }
          ];
        }
      }
    } else if (lesson.id === 1 && lesson.content?.examples) {
      // Punteros básicos - mostrar diferentes estados según el paso
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Mostrar variable y puntero separados
          baseData.stack = [
            { id: 'var1', type: 'stack', address: 0x1000, value: 'int x = 42', size: 4, color: '#00ff88' },
            { id: 'ptr1', type: 'stack', address: 0x1004, value: 'int* ptr', size: 8, color: '#00d4ff' }
          ];
          baseData.pointers = [
            { id: 'arrow1', name: 'arrow1', targetId: null, address: 0x1004, color: '#00d4ff', type: 'raw' }
          ];
        } else if (animationStep === 1) {
          // Mostrar puntero apuntando a variable
          baseData.pointers = [
            { id: 'connection1', name: 'connection1', targetId: 'var1', address: 0x1004, color: '#00d4ff', type: 'raw' }
          ];
        }
      }
    } else if (lesson.id === 2 && lesson.content?.examples) {
      // Lección 2: nullptr - mostrar diferentes estados de seguridad
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar puntero nullptr vs puntero sin inicializar
          baseData.stack = [
            { id: 'safe_ptr', type: 'stack', address: 0x1000, value: 'int* seguro = nullptr', size: 8, color: '#00ff88' },
            { id: 'danger_ptr', type: 'stack', address: 0x1008, value: 'int* peligroso', size: 8, color: '#ff4444' }
          ];
          baseData.pointers = [
            { id: 'safe_arrow', name: 'seguro', targetId: null, address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Verificación de nullptr
          baseData.pointers = [
            { id: 'safe_arrow', name: 'seguro', targetId: null, address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        }
      }
    } else if (lesson.id === 3 && lesson.content?.examples) {
      // Lección 3: Dangling pointers - mostrar el peligro y la solución
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar puntero válido apuntando a heap
          baseData.stack = [
            { id: 'dangling_ptr', type: 'stack', address: 0x1000, value: 'int* puntero', size: 8, color: '#00ff88' }
          ];
          baseData.heap = [
            { id: 'valid_memory', type: 'heap', address: 0x2000, value: 'new int(42)', size: 4, color: '#ff6b6b' }
          ];
          baseData.pointers = [
            { id: 'valid_connection', name: 'puntero', targetId: 'valid_memory', address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Memoria liberada - puntero se vuelve colgante
          baseData.heap = [
            { id: 'freed_memory', type: 'heap', address: 0x2000, value: '❌ MEMORIA LIBERADA', size: 4, color: '#666666' }
          ];
          baseData.pointers = [
            { id: 'dangling_connection', name: 'puntero', targetId: 'freed_memory', address: 0x1000, color: '#ff4444', type: 'raw' }
          ];
        } else if (animationStep === 2) {
          // Paso 3: Solución - asignar nullptr
          baseData.pointers = [
            { id: 'safe_nullptr', name: 'puntero', targetId: null, address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        }
      }
    } else if (lesson.id === 4 && lesson.content?.examples) {
      // Lección 4: new/delete - mostrar el ciclo completo de gestión de memoria
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar puntero sin memoria asignada
          baseData.stack = [
            { id: 'ptr_stack', type: 'stack', address: 0x1000, value: 'int* puntero', size: 8, color: '#00d4ff' }
          ];
          baseData.pointers = [
            { id: 'null_ptr', name: 'puntero', targetId: null, address: 0x1000, color: '#ff4444', type: 'raw' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Asignar memoria con new
          baseData.heap = [
            { id: 'new_memory', type: 'heap', address: 0x2000, value: 'new int(42)', size: 4, color: '#ff6b6b' }
          ];
          baseData.pointers = [
            { id: 'connected_ptr', name: 'puntero', targetId: 'new_memory', address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        } else if (animationStep === 2) {
          // Paso 3: Liberar memoria con delete
          baseData.heap = [
            { id: 'freed_memory', type: 'heap', address: 0x2000, value: '❌ MEMORIA LIBERADA', size: 4, color: '#666666' }
          ];
          baseData.pointers = [
            { id: 'dangling_ptr', name: 'puntero', targetId: 'freed_memory', address: 0x1000, color: '#ff4444', type: 'raw' }
          ];
        } else if (animationStep === 3) {
          // Paso 4: Asignar nullptr después de delete
          baseData.pointers = [
            { id: 'safe_nullptr', name: 'puntero', targetId: null, address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        }
      }
    } else if (lesson.id === 5 && lesson.content?.examples) {
      // Lección 5: Double Delete - mostrar el peligro y la prevención
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar puntero válido con memoria asignada
          baseData.stack = [
            { id: 'double_ptr', type: 'stack', address: 0x1000, value: 'int* puntero', size: 8, color: '#00ff88' }
          ];
          baseData.heap = [
            { id: 'first_memory', type: 'heap', address: 0x2000, value: 'new int(42)', size: 4, color: '#ff6b6b' }
          ];
          baseData.pointers = [
            { id: 'first_connection', name: 'puntero', targetId: 'first_memory', address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Primer delete - memoria liberada
          baseData.heap = [
            { id: 'freed_memory', type: 'heap', address: 0x2000, value: '❌ MEMORIA LIBERADA', size: 4, color: '#666666' }
          ];
          baseData.pointers = [
            { id: 'dangling_ptr', name: 'puntero', targetId: 'freed_memory', address: 0x1000, color: '#ff4444', type: 'raw' }
          ];
        } else if (animationStep === 2) {
          // Paso 3: Segundo delete - CORRUPCIÓN DEL HEAP
          baseData.heap = [
            { id: 'corrupted_heap', type: 'heap', address: 0x2000, value: '💥 HEAP CORRUPTO', size: 4, color: '#ff0000' }
          ];
          baseData.pointers = [
            { id: 'corrupted_ptr', name: 'puntero', targetId: 'corrupted_heap', address: 0x1000, color: '#ff0000', type: 'raw' }
          ];
        } else if (animationStep === 3) {
          // Paso 4: Solución - asignar nullptr después del primer delete
          baseData.pointers = [
            { id: 'safe_nullptr', name: 'puntero', targetId: null, address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        }
      }
    } else if (lesson.id === 6 && lesson.content?.examples) {
      // Lección 6: Arrays dinámicos - mostrar creación y gestión de arrays
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar puntero sin array
          baseData.stack = [
            { id: 'array_ptr', type: 'stack', address: 0x1000, value: 'int* array_ptr', size: 8, color: '#00d4ff' }
          ];
          baseData.pointers = [
            { id: 'null_array', name: 'array_ptr', targetId: null, address: 0x1000, color: '#ff4444', type: 'raw' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Crear array con new[]
          baseData.heap = [
            { id: 'dynamic_array', type: 'heap', address: 0x2000, value: 'new int[3]', size: 12, color: '#ff6b6b' }
          ];
          baseData.pointers = [
            { id: 'array_connection', name: 'array_ptr', targetId: 'dynamic_array', address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        } else if (animationStep === 2) {
          // Paso 3: Mostrar acceso a elementos
          baseData.heap = [
            { id: 'dynamic_array_access', type: 'heap', address: 0x2000, value: 'int[3] = {10,20,30}', size: 12, color: '#ff6b6b' }
          ];
          baseData.pointers = [
            { id: 'array_connection', name: 'array_ptr', targetId: 'dynamic_array_access', address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        } else if (animationStep === 3) {
          // Paso 4: Liberar con delete[]
          baseData.heap = [
            { id: 'freed_array', type: 'heap', address: 0x2000, value: '❌ ARRAY LIBERADO', size: 12, color: '#666666' }
          ];
          baseData.pointers = [
            { id: 'dangling_array', name: 'array_ptr', targetId: 'freed_array', address: 0x1000, color: '#ff4444', type: 'raw' }
          ];
        } else if (animationStep === 4) {
          // Paso 5: Solución - nullptr
          baseData.pointers = [
            { id: 'safe_array_nullptr', name: 'array_ptr', targetId: null, address: 0x1000, color: '#00ff88', type: 'raw' }
          ];
        }
      }
    } else if (lesson.id === 8 && lesson.content?.examples) {
      // Lección 8: Punteros dobles - mostrar niveles de indirección
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar valor y puntero simple
          baseData.stack = [
            { id: 'value', type: 'stack', address: 0x1000, value: 'int valor = 42', size: 4, color: '#00ff88' },
            { id: 'single_ptr', type: 'stack', address: 0x1004, value: 'int* ptr', size: 8, color: '#00d4ff' }
          ];
          baseData.pointers = [
            { id: 'single_connection', name: 'ptr', targetId: 'value', address: 0x1004, color: '#00d4ff', type: 'raw' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Agregar puntero doble
          baseData.stack.push(
            { id: 'double_ptr', type: 'stack', address: 0x100c, value: 'int** ptr_doble', size: 8, color: '#ff6b6b' }
          );
          baseData.pointers.push(
            { id: 'double_connection', name: 'ptr_doble', targetId: 'single_ptr', address: 0x100c, color: '#ff6b6b', type: 'raw' }
          );
        } else if (animationStep === 2) {
          // Paso 3: Mostrar matriz con T**
          baseData.stack = [
            { id: 'matrix_ptr', type: 'stack', address: 0x1000, value: 'int** matriz', size: 8, color: '#ff6b6b' }
          ];
          baseData.heap = [
            { id: 'row_ptrs', type: 'heap', address: 0x2000, value: 'int*[filas]', size: 24, color: '#ff6b6b' },
            { id: 'row_data', type: 'heap', address: 0x3000, value: 'int[columnas]', size: 16, color: '#00ff88' }
          ];
          baseData.pointers = [
            { id: 'matrix_to_rows', name: 'matriz', targetId: 'row_ptrs', address: 0x1000, color: '#ff6b6b', type: 'raw' },
            { id: 'rows_to_data', name: 'fila', targetId: 'row_data', address: 0x2000, color: '#00d4ff', type: 'raw' }
          ];
        }
      } else if (lesson.id === 9 && lesson.content?.examples) {
        // Lección 9: APIs con T** para parámetros de salida
        const currentExample = lesson.content.examples[animationStep];
        if (currentExample && isAnimating) {
          if (animationStep === 0) {
            // Paso 1: API con T** - puntero nulo inicial
            baseData.stack = [
              { id: 'api_ptr', type: 'stack', address: 0x1000, value: 'int* resultado = nullptr', size: 8, color: '#00d4ff' }
            ];
            baseData.pointers = [
              { id: 'null_ptr', name: 'resultado', targetId: null, address: 0x1000, color: '#ff4444', type: 'raw' }
            ];
          } else if (animationStep === 1) {
            // Paso 2: Llamada a API - creación del objeto
            baseData.stack = [
              { id: 'api_ptr', type: 'stack', address: 0x1000, value: 'int* resultado', size: 8, color: '#00d4ff' }
            ];
            baseData.heap = [
              { id: 'created_obj', type: 'heap', address: 0x2000, value: 'new int(42)', size: 4, color: '#ff6b6b' }
            ];
            baseData.pointers = [
              { id: 'api_connection', name: 'resultado', targetId: 'created_obj', address: 0x1000, color: '#00ff88', type: 'raw' }
            ];
          } else if (animationStep === 2) {
            // Paso 3: Uso del objeto creado
            baseData.stack = [
              { id: 'api_ptr', type: 'stack', address: 0x1000, value: 'int* resultado', size: 8, color: '#00d4ff' }
            ];
            baseData.heap = [
              { id: 'used_obj', type: 'heap', address: 0x2000, value: 'int(42) usado', size: 4, color: '#00ff88' }
            ];
            baseData.pointers = [
              { id: 'api_connection', name: 'resultado', targetId: 'used_obj', address: 0x1000, color: '#00ff88', type: 'raw' }
            ];
          } else if (animationStep === 3) {
            // Paso 4: Liberación por el llamador
            baseData.stack = [
              { id: 'api_ptr', type: 'stack', address: 0x1000, value: 'int* resultado', size: 8, color: '#00d4ff' }
            ];
            baseData.heap = [
              { id: 'freed_obj', type: 'heap', address: 0x2000, value: '❌ MEMORIA LIBERADA', size: 4, color: '#666666' }
            ];
            baseData.pointers = [
              { id: 'dangling_ptr', name: 'resultado', targetId: 'freed_obj', address: 0x1000, color: '#ff4444', type: 'raw' }
            ];
          }
        }
      }
    } else if (lesson.id === 10 && lesson.content?.examples) {
      // Lección 10: std::unique_ptr - mostrar propiedad única
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar unique_ptr creado con make_unique
          baseData.stack = [
            { id: 'unique_ptr_stack', type: 'stack', address: 0x1000, value: 'unique_ptr<int> up', size: 8, color: '#00ff88' }
          ];
          baseData.heap = [
            { id: 'unique_memory', type: 'heap', address: 0x2000, value: 'int(42) - owner: unique', size: 4, color: '#00ff88' }
          ];
          baseData.pointers = [
            { id: 'unique_connection', name: 'up', targetId: 'unique_memory', address: 0x1000, color: '#00ff88', type: 'unique' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Transferir propiedad con std::move
          baseData.stack = [
            { id: 'unique_ptr_stack', type: 'stack', address: 0x1000, value: 'unique_ptr<int> up', size: 8, color: '#ff4444' },
            { id: 'new_unique_ptr', type: 'stack', address: 0x1008, value: 'unique_ptr<int> nuevo', size: 8, color: '#00ff88' }
          ];
          baseData.heap = [
            { id: 'unique_memory', type: 'heap', address: 0x2000, value: 'int(42) - owner: nuevo', size: 4, color: '#00ff88' }
          ];
          baseData.pointers = [
            { id: 'new_connection', name: 'nuevo', targetId: 'unique_memory', address: 0x1008, color: '#00ff88', type: 'unique' }
          ];
        } else if (animationStep === 2) {
          // Paso 3: Mostrar liberación automática
          baseData.stack = [
            { id: 'new_unique_ptr', type: 'stack', address: 0x1008, value: 'unique_ptr<int> nuevo', size: 8, color: '#00ff88' }
          ];
          baseData.heap = [
            { id: 'unique_memory', type: 'heap', address: 0x2000, value: 'int(42) - owner: nuevo', size: 4, color: '#00ff88' }
          ];
          baseData.pointers = [
            { id: 'new_connection', name: 'nuevo', targetId: 'unique_memory', address: 0x1008, color: '#00ff88', type: 'unique' }
          ];
        }
      }
    } else if (lesson.id === 11 && lesson.content?.examples) {
      // Lección 11: unique_ptr<T[]> - mostrar arrays inteligentes
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar array inteligente creado
          baseData.stack = [
            { id: 'array_ptr', type: 'stack', address: 0x1000, value: 'unique_ptr<int[]> arr', size: 8, color: '#00ff88' }
          ];
          baseData.heap = [
            { id: 'smart_array', type: 'heap', address: 0x2000, value: 'int[5] inteligente', size: 20, color: '#00ff88' }
          ];
          baseData.pointers = [
            { id: 'array_connection', name: 'arr', targetId: 'smart_array', address: 0x1000, color: '#00ff88', type: 'unique' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Mostrar acceso con []
          baseData.heap = [
            { id: 'smart_array_access', type: 'heap', address: 0x2000, value: 'int[5] = {10,20,30,40,50}', size: 20, color: '#00ff88' }
          ];
          baseData.pointers = [
            { id: 'array_connection', name: 'arr', targetId: 'smart_array_access', address: 0x1000, color: '#00ff88', type: 'unique' }
          ];
        } else if (animationStep === 2) {
          // Paso 3: Comparar con array raw
          baseData.stack.push(
            { id: 'raw_array_ptr', type: 'stack', address: 0x1008, value: 'int* raw_arr', size: 8, color: '#ff4444' }
          );
          baseData.heap.push(
            { id: 'raw_array', type: 'heap', address: 0x3000, value: 'int[3] raw', size: 12, color: '#ff4444' }
          );
          baseData.pointers.push(
            { id: 'raw_connection', name: 'raw_arr', targetId: 'raw_array', address: 0x1008, color: '#ff4444', type: 'raw' }
          );
        }
      }
    } else if (lesson.id === 12 && lesson.content?.examples) {
      // Lección 12: Move vs Copy - mostrar propiedad única
      const currentExample = lesson.content.examples[animationStep];
      if (currentExample && isAnimating) {
        if (animationStep === 0) {
          // Paso 1: Mostrar unique_ptr original
          baseData.stack = [
            { id: 'original_ptr', type: 'stack', address: 0x1000, value: 'unique_ptr<int> original', size: 8, color: '#00ff88' }
          ];
          baseData.heap = [
            { id: 'owned_object', type: 'heap', address: 0x2000, value: 'int(42) - owner: original', size: 4, color: '#00ff88' }
          ];
          baseData.pointers = [
            { id: 'original_connection', name: 'original', targetId: 'owned_object', address: 0x1000, color: '#00ff88', type: 'unique' }
          ];
        } else if (animationStep === 1) {
          // Paso 2: Después del move - propiedad transferida
          baseData.stack = [
            { id: 'original_ptr', type: 'stack', address: 0x1000, value: 'unique_ptr<int> original', size: 8, color: '#ff4444' },
            { id: 'moved_ptr', type: 'stack', address: 0x1008, value: 'unique_ptr<int> movido', size: 8, color: '#00ff88' }
          ];
          baseData.heap = [
            { id: 'owned_object', type: 'heap', address: 0x2000, value: 'int(42) - owner: movido', size: 4, color: '#00ff88' }
          ];
          baseData.pointers = [
            { id: 'moved_connection', name: 'movido', targetId: 'owned_object', address: 0x1008, color: '#00ff88', type: 'unique' }
          ];
        } else if (animationStep === 2) {
          // Paso 3: Mostrar error de copia
          baseData.stack = [
            { id: 'copy_error', type: 'stack', address: 0x1010, value: 'COMPILATION ERROR', size: 8, color: '#ff0000' }
          ];
          baseData.pointers = [
            { id: 'error_line', name: 'ERROR', targetId: 'copy_error', address: 0x1010, color: '#ff0000', type: 'raw' }
          ];
        }
      }
    }

    return baseData;
  };

  const vizData = getVisualizationData();

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, 5, 10]} intensity={0.6} color="#00d4ff" />

        {/* Stack Section */}
        <group position={[-4, 0, 0]}>
          <Text position={[0, 3, 0]} fontSize={0.6} color="#00ff88" font="/fonts/FiraCode-Bold.woff">
            📚 STACK
          </Text>
          {vizData.stack.map((block: any, index: number) => (
            <group key={block.id} position={[0, index * -1.2, 0]}>
              {/* Caja principal con animación */}
              <mesh>
                <boxGeometry args={[2, 0.8, 0.6]} />
                <meshStandardMaterial
                  color={block.color}
                  transparent
                  opacity={0.9}
                  metalness={0.4}
                  roughness={0.1}
                  emissive={block.color}
                  emissiveIntensity={0.1}
                />
              </mesh>

              {/* Borde luminoso */}
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(2, 0.8, 0.6)]} />
                <lineBasicMaterial color="#ffffff" transparent opacity={0.8} />
              </lineSegments>

              {/* Texto con mejor visibilidad */}
              <Text
                position={[0, 0, 0.4]}
                fontSize={0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
                font="/fonts/FiraCode-Regular.woff"
              >
                {block.value}
              </Text>

              {/* Etiqueta de dirección de memoria */}
              <Text
                position={[0, -0.6, 0]}
                fontSize={0.15}
                color="#00ff88"
                anchorX="center"
                anchorY="middle"
              >
                0x{block.address?.toString(16) || '1000'}
              </Text>

              {/* Efecto de brillo */}
              <pointLight position={[0, 0, 1]} intensity={0.5} color={block.color} distance={2} />
            </group>
          ))}
        </group>

        {/* Heap Section */}
        <group position={[4, 0, 0]}>
          <Text position={[0, 3, 0]} fontSize={0.6} color="#ff6b6b" font="/fonts/FiraCode-Bold.woff">
            🗑️ HEAP
          </Text>
          {vizData.heap.map((block: any, index: number) => (
            <group key={block.id} position={[0, index * -1.2, 0]}>
              {/* Caja principal con animación */}
              <mesh>
                <boxGeometry args={[2, 0.8, 0.6]} />
                <meshStandardMaterial
                  color={block.color}
                  transparent
                  opacity={0.9}
                  metalness={0.4}
                  roughness={0.1}
                  emissive={block.color}
                  emissiveIntensity={0.1}
                />
              </mesh>

              {/* Borde luminoso */}
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(2, 0.8, 0.6)]} />
                <lineBasicMaterial color="#ffffff" transparent opacity={0.8} />
              </lineSegments>

              {/* Texto con mejor visibilidad */}
              <Text
                position={[0, 0, 0.4]}
                fontSize={0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
                font="/fonts/FiraCode-Regular.woff"
              >
                {block.value}
              </Text>

              {/* Etiqueta de dirección de memoria */}
              <Text
                position={[0, -0.6, 0]}
                fontSize={0.15}
                color="#ff6b6b"
                anchorX="center"
                anchorY="middle"
              >
                0x{block.address?.toString(16) || '2000'}
              </Text>

              {/* Efecto de brillo */}
              <pointLight position={[0, 0, 1]} intensity={0.5} color={block.color} distance={2} />
            </group>
          ))}
        </group>

        {/* Global Section */}
        <group position={[0, -3, 0]}>
          <Text position={[0, 2, 0]} fontSize={0.6} color="#ffa500" font="/fonts/FiraCode-Bold.woff">
            🌍 GLOBAL
          </Text>
          {vizData.global?.map((block: any, index: number) => (
            <group key={block.id} position={[index * 2.5 - 2, 0, 0]}>
              {/* Caja principal con animación */}
              <mesh>
                <boxGeometry args={[2, 0.8, 0.6]} />
                <meshStandardMaterial
                  color={block.color}
                  transparent
                  opacity={0.9}
                  metalness={0.4}
                  roughness={0.1}
                  emissive={block.color}
                  emissiveIntensity={0.1}
                />
              </mesh>

              {/* Borde luminoso */}
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(2, 0.8, 0.6)]} />
                <lineBasicMaterial color="#ffffff" transparent opacity={0.8} />
              </lineSegments>

              {/* Texto con mejor visibilidad */}
              <Text
                position={[0, 0, 0.4]}
                fontSize={0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
                font="/fonts/FiraCode-Regular.woff"
              >
                {block.value}
              </Text>

              {/* Etiqueta de dirección de memoria */}
              <Text
                position={[0, -0.6, 0]}
                fontSize={0.15}
                color="#ffa500"
                anchorX="center"
                anchorY="middle"
              >
                0x{block.address?.toString(16) || '3000'}
              </Text>

              {/* Efecto de brillo */}
              <pointLight position={[0, 0, 1]} intensity={0.5} color={block.color} distance={2} />
            </group>
          ))}
        </group>

        {/* Punteros con animación mejorada */}
        {vizData.pointers.map((ptr: any, index: number) => {
          // Calcular posiciones dinámicas basadas en el tipo de puntero
          const getPointerPositions = () => {
            if (ptr.type === 'raw') {
              return {
                start: [-3.5, 0.8 - index * 0.3, 0],
                end: [3.5, 0.8 - index * 0.3, 0]
              };
            }
            return {
              start: [-3.5, -0.8 - index * 0.3, 0],
              end: [3.5, -0.8 - index * 0.3, 0]
            };
          };

          const positions = getPointerPositions() as { start: [number, number, number]; end: [number, number, number] };

          return (
            <group key={ptr.id}>
              {/* Línea del puntero con animación */}
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    args={[
                      new Float32Array([
                        positions.start[0], positions.start[1], positions.start[2],
                        positions.end[0], positions.end[1], positions.end[2]
                      ]),
                      3
                    ]}
                    attach="attributes-position"
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color={ptr.color}
                  transparent
                  opacity={isAnimating ? 1.0 : 0.6}
                  linewidth={5}
                />
              </line>

              {/* Cabeza de flecha mejorada */}
              <group position={[positions.end[0], positions.end[1], positions.end[2]] as [number, number, number]}>
                <mesh>
                  <coneGeometry args={[0.15, 0.4, 12]} />
                  <meshStandardMaterial
                    color={ptr.color}
                    transparent
                    opacity={0.9}
                    emissive={ptr.color}
                    emissiveIntensity={0.3}
                  />
                </mesh>
                {/* Efecto de brillo en la punta */}
                <pointLight intensity={0.8} color={ptr.color} distance={1} />
              </group>

              {/* Etiqueta del puntero */}
              <Text
                position={[(positions.start[0] + positions.end[0]) / 2, (positions.start[1] + positions.end[1]) / 2 + 0.3, 0] as [number, number, number]}
                fontSize={0.2}
                color={ptr.color}
                anchorX="center"
                anchorY="middle"
                font="/fonts/FiraCode-Regular.woff"
              >
                {ptr.type?.toUpperCase() || 'PTR'}
              </Text>

              {/* Animación de partículas si está activo */}
              {isAnimating && (
                <mesh position={[(positions.start[0] + positions.end[0]) / 2, (positions.start[1] + positions.end[1]) / 2, 0] as [number, number, number]}>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshStandardMaterial
                    color={ptr.color}
                    transparent
                    opacity={0.8}
                    emissive={ptr.color}
                    emissiveIntensity={0.6}
                  />
                </mesh>
              )}
            </group>
          );
        })}

        <OrbitControls enableZoom enableRotate />
      </Canvas>

      {/* Animation status */}
      {isAnimating && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,212,255,0.9)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          🎬 Animando paso {animationStep + 1}
        </div>
      )}
    </div>
  );
};

// Componente de animación de terminal
const TerminalAnimation = ({ lesson, currentStep, isAnimating }: {
  lesson: any,
  currentStep: number,
  isAnimating: boolean
}) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [, setCurrentLine] = React.useState(0);

  React.useEffect(() => {
    if (!isAnimating || !lesson?.content?.examples) return;

    const example = lesson.content.examples[currentStep];
    if (!example) return;

    const lines = example.code.split('\n');
    setCurrentLine(0);
    setDisplayedText('');

    let lineIndex = 0;
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (lineIndex < lines.length) {
        const currentLineText = lines[lineIndex];
        if (charIndex < currentLineText.length) {
          setDisplayedText(prev => prev + currentLineText[charIndex]);
          charIndex++;
        } else {
          setDisplayedText(prev => prev + '\n');
          lineIndex++;
          charIndex = 0;
        }
      } else {
        clearInterval(typeInterval);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentStep, isAnimating, lesson]);

  const getOutput = () => {
    if (!lesson?.content?.examples || !isAnimating) return '';

    const example = lesson.content.examples[currentStep];
    if (!example) return '';

    // Simular salida basada en el código
    switch (lesson.id) {
      case 1: // Punteros básicos
        if (currentStep === 0) return 'x = 42\nptr contiene: 0x7fff5fbff8ac\n*ptr = 42';
        if (currentStep === 1) return 'Valor: 42';
        break;
      case 2: // Nullptr
        return 'Puntero es nulo - seguro!';
      case 3: // Dangling
        return '💥 SEGMENTATION FAULT - Acceso a memoria liberada!';
      case 4: // new/delete
        return 'Valor: 42\nMemoria liberada correctamente';
      case 5: // Double delete
        if (currentStep === 0) return '💥 RUNTIME ERROR: Double free detected!';
        return '✅ Verificación de puntero antes de delete';
      case 6: // new[]/delete[]
        return 'Array asignado correctamente\nArray liberado con delete[]';
      case 7: // const pointers
        return '✅ Puntero a const creado\n✅ const puntero creado\n✅ Ambos const creado';
      case 8: // Double pointers
        return '✅ Matriz dinámica creada\n✅ Puntero doble funcionando';
      case 9: // unique_ptr
        return '✅ unique_ptr creado\n✅ Propiedad transferida\n✅ Memoria liberada automáticamente';
      case 10: // unique_ptr<T[]>
        return '✅ Array inteligente creado\n✅ Acceso como array normal\n✅ Memoria gestionada automáticamente';
      default:
        return 'Ejecutando código...';
    }
    return '';
  };

  return (
    <TerminalWindow>
      <TerminalHeader>
        <TerminalTitle>Terminal - {lesson?.title || 'Lección'}</TerminalTitle>
        <TerminalStatus>
          <StatusIndicator $active={isAnimating} />
          {isAnimating ? 'Ejecutando...' : 'Listo'}
        </TerminalStatus>
      </TerminalHeader>
      <TerminalBody>
        <TerminalCode>
          {displayedText}
          {isAnimating && <TerminalCursor>|</TerminalCursor>}
        </TerminalCode>
        {getOutput() && (
          <TerminalOutput>
            <OutputHeader>Salida:</OutputHeader>
            <OutputText>{getOutput()}</OutputText>
          </TerminalOutput>
        )}
      </TerminalBody>
    </TerminalWindow>
  );
};

// Componente de celebración
const CompletionCelebration = ({ completedLessons }: { completedLessons: Set<number> }) => {
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [lastCompleted, setLastCompleted] = React.useState<number | null>(null);

  React.useEffect(() => {
    const handleLessonCompleted = (event: any) => {
      setLastCompleted(event.detail.lessonId);
      setShowCelebration(true);

      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
        setLastCompleted(null);
      }, 3000);
    };

    window.addEventListener('lessonCompleted', handleLessonCompleted);
    return () => window.removeEventListener('lessonCompleted', handleLessonCompleted);
  }, []);

  if (!showCelebration || lastCompleted === null) return null;

  return (
    <CelebrationOverlay>
      <CelebrationContent>
        <CelebrationIcon>🎉</CelebrationIcon>
        <CelebrationTitle>¡Lección Completada!</CelebrationTitle>
        <CelebrationText>Has completado la lección {lastCompleted}</CelebrationText>
        <CelebrationStats>
          <StatItem>
            <CelebrationStatNumber>{completedLessons.size}</CelebrationStatNumber>
            <CelebrationStatLabel>Completadas</CelebrationStatLabel>
          </StatItem>
          <StatItem>
            <CelebrationStatNumber>{10 - completedLessons.size}</CelebrationStatNumber>
            <CelebrationStatLabel>Restantes</CelebrationStatLabel>
          </StatItem>
          <StatItem>
            <CelebrationStatNumber>{Math.round((completedLessons.size / 10) * 100)}%</CelebrationStatNumber>
            <CelebrationStatLabel>Progreso</CelebrationStatLabel>
          </StatItem>
        </CelebrationStats>
      </CelebrationContent>
    </CelebrationOverlay>
  );
};

// Styled components para la celebración
const CelebrationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
`;

const CelebrationContent = styled.div`
  background: linear-gradient(135deg, rgba(10, 20, 40, 0.95), rgba(30, 40, 60, 0.95));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 0 50px rgba(0, 212, 255, 0.3);
  animation: celebrationPop 0.5s ease-out;
`;

const CelebrationIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: celebrationBounce 2s ease-in-out infinite;
`;

const CelebrationTitle = styled.h2`
  color: #00d4ff;
  margin: 0 0 1rem 0;
  font-size: 2rem;
  text-shadow: 0 0 20px #00d4ff;
`;

const CelebrationText = styled.p`
  color: #b8c5d6;
  font-size: 1.2rem;
  margin: 1rem 0;
`;

const CelebrationStats = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const CelebrationStatNumber = styled.div`
  color: #00ff88;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 0 10px #00ff88;
`;

const CelebrationStatLabel = styled.div`
  color: #888;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

// const CelebrationAnimations = styled.div`
//   @keyframes celebrationPop {
//     0% { transform: scale(0.5); opacity: 0; }
//     50% { transform: scale(1.1); }
//     100% { transform: scale(1); opacity: 1; }
//   }
//
//   @keyframes celebrationBounce {
//     0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
//     40% { transform: translateY(-10px); }
//     60% { transform: translateY(-5px); }
//   }
// `;


export default function LessonList() {
  const { state } = useApp(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [filter, setFilter] = React.useState<'all' | 'beginner' | 'intermediate' | 'advanced' | 'completed' | 'pending'>('all');
  const [selectedLesson, setSelectedLesson] = React.useState<any>(null);
  const [show3D, setShow3D] = React.useState(false);
  const [animationStep, setAnimationStep] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [completedLessons, setCompletedLessons] = React.useState<Set<number>>(new Set());

  const filteredLessons = lessons.filter(lesson => {
    if (filter === 'all') return true;
    if (filter === 'completed') return lesson.completed;
    if (filter === 'pending') return !lesson.completed;
    return lesson.difficulty === filter;
  });

  const completedCount = lessons.filter(l => l.completed).length;
  const totalLessons = lessons.length;

  const handleLessonClick = (lesson: any) => {
    setSelectedLesson(lesson);
    setShow3D(true);
    setAnimationStep(0);
    setIsAnimating(false);
  };

  const handleClose3D = () => {
    setShow3D(false);
    setSelectedLesson(null);
    setAnimationStep(0);
    setIsAnimating(false);
  };

  const handleStartAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
  };

  const handleNextStep = () => {
    if (selectedLesson?.content?.examples) {
      setAnimationStep(prev => (prev + 1) % selectedLesson.content.examples.length);
    }
  };

  const handleLessonComplete = (lessonId: number) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      return newSet;
    });
    // Trigger celebration animation
    const event = new CustomEvent('lessonCompleted', { detail: { lessonId } });
    window.dispatchEvent(event);
    // In a real app, this would also update the backend
    // console.log(`Lección ${lessonId} completada! 🎉`);
  };

  const isLessonCompleted = (lessonId: number) => {
    return completedLessons.has(lessonId);
  };

  return (
    <Container>
      <Header>
        <Title>🎯 Pointer Quest</Title>
        <Subtitle>Domina los punteros en C++ con visualizaciones 3D interactivas</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{completedCount}</StatNumber>
          <StatLabel>Completadas</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{totalLessons}</StatNumber>
          <StatLabel>Total de Lecciones</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{Math.round((completedCount / totalLessons) * 100)}%</StatNumber>
          <StatLabel>Progreso</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>🎮 3D</StatNumber>
          <StatLabel>Visualizaciones</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>🏆 {completedCount >= 5 ? '5' : completedCount}</StatNumber>
          <StatLabel>Logros</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterContainer>
        <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>
          Todas
        </FilterButton>
        <FilterButton $active={filter === 'beginner'} onClick={() => setFilter('beginner')}>
          Principiante
        </FilterButton>
        <FilterButton $active={filter === 'intermediate'} onClick={() => setFilter('intermediate')}>
          Intermedio
        </FilterButton>
        <FilterButton $active={filter === 'advanced'} onClick={() => setFilter('advanced')}>
          Avanzado
        </FilterButton>
        <FilterButton $active={filter === 'completed'} onClick={() => setFilter('completed')}>
          Completadas
        </FilterButton>
        <FilterButton $active={filter === 'pending'} onClick={() => setFilter('pending')}>
          Pendientes
        </FilterButton>
      </FilterContainer>

      <LessonsGrid>
        {filteredLessons.map(lesson => (
          <LessonCard key={lesson.id} onClick={() => handleLessonClick(lesson)}>
            <LessonHeader>
              <LessonNumber>{lesson.id}</LessonNumber>
                          <LessonStatus $completed={isLessonCompleted(lesson.id)}>
              {isLessonCompleted(lesson.id) ? '✓ Completada' : '❌ No Completado'}
            </LessonStatus>
            </LessonHeader>

            <LessonTitle>{lesson.title}</LessonTitle>
            <LessonDescription>{lesson.description}</LessonDescription>

            <LessonMeta>
              <Difficulty $level={lesson.difficulty}>
                {lesson.difficulty === 'beginner' ? 'Principiante' :
                 lesson.difficulty === 'intermediate' ? 'Intermedio' :
                 lesson.difficulty === 'advanced' ? 'Avanzado' : 'Experto'}
              </Difficulty>
              <Topic>{lesson.topic}</Topic>
            </LessonMeta>
          </LessonCard>
        ))}
      </LessonsGrid>

      {/* Celebración cuando se completa una lección */}
      <CompletionCelebration completedLessons={completedLessons} />

      {/* 3D Modal */}
      {show3D && selectedLesson && (
        <ModalOverlay onClick={handleClose3D}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedLesson.title}</ModalTitle>
              <CloseButton onClick={handleClose3D}>✕</CloseButton>
            </ModalHeader>

                    <ModalBody>
          <LessonInfo>
            <InfoSection>
              <InfoTitle>📚 Teoría</InfoTitle>
              <InfoText>{selectedLesson.content?.theory || 'Contenido no disponible'}</InfoText>
            </InfoSection>

            <InfoSection>
              <InfoTitle>💡 Ejemplos</InfoTitle>
              {selectedLesson.content?.examples?.map((example: any, index: number) => (
                <CodeExample key={index}>
                  <CodeBlock>{example.code}</CodeBlock>
                  <CodeExplanation>{example.explanation}</CodeExplanation>
                </CodeExample>
              )) || <InfoText>Ejemplos no disponibles</InfoText>}
            </InfoSection>

            <InfoSection>
              <InfoTitle>🎯 Ejercicios</InfoTitle>
              <ExerciseList>
                {selectedLesson.content?.exercises?.map((exercise: string, index: number) => (
                  <ExerciseItem key={index}>• {exercise}</ExerciseItem>
                )) || <InfoText>Ejercicios no disponibles</InfoText>}
              </ExerciseList>
            </InfoSection>

            {/* Multi-level content sections */}
            {selectedLesson.content?.beginner && (
              <InfoSection>
                <InfoTitle>🟢 Nivel Principiante</InfoTitle>
                <InfoText>{selectedLesson.content.beginner.theory}</InfoText>
                {selectedLesson.content.beginner.examples?.map((example: any, index: number) => (
                  <CodeExample key={index}>
                    <CodeBlock>{example.code}</CodeBlock>
                    <CodeExplanation>{example.explanation}</CodeExplanation>
                  </CodeExample>
                ))}
                <ExerciseList>
                  {selectedLesson.content.beginner.exercises?.map((exercise: string, index: number) => (
                    <ExerciseItem key={index}>• {exercise}</ExerciseItem>
                  ))}
                </ExerciseList>
              </InfoSection>
            )}

            {selectedLesson.content?.intermediate && (
              <InfoSection>
                <InfoTitle>🟡 Nivel Intermedio</InfoTitle>
                <InfoText>{selectedLesson.content.intermediate.theory}</InfoText>
                {selectedLesson.content.intermediate.examples?.map((example: any, index: number) => (
                  <CodeExample key={index}>
                    <CodeBlock>{example.code}</CodeBlock>
                    <CodeExplanation>{example.explanation}</CodeExplanation>
                  </CodeExample>
                ))}
                <ExerciseList>
                  {selectedLesson.content.intermediate.exercises?.map((exercise: string, index: number) => (
                    <ExerciseItem key={index}>• {exercise}</ExerciseItem>
                  ))}
                </ExerciseList>
              </InfoSection>
            )}

            {selectedLesson.content?.expert && (
              <InfoSection>
                <InfoTitle>🔴 Nivel Experto</InfoTitle>
                <InfoText>{selectedLesson.content.expert.theory}</InfoText>
                {selectedLesson.content.expert.examples?.map((example: any, index: number) => (
                  <CodeExample key={index}>
                    <CodeBlock>{example.code}</CodeBlock>
                    <CodeExplanation>{example.explanation}</CodeExplanation>
                  </CodeExample>
                ))}
                <ExerciseList>
                  {selectedLesson.content.expert.exercises?.map((exercise: string, index: number) => (
                    <ExerciseItem key={index}>• {exercise}</ExerciseItem>
                  ))}
                </ExerciseList>
              </InfoSection>
            )}
          </LessonInfo>

                        <VisualizationSection>
            <InfoTitle>🎮 Visualización 3D</InfoTitle>
            <VisualizationContainer>
              <Enhanced3DVisualization
                lesson={selectedLesson}
                animationStep={animationStep}
                isAnimating={isAnimating}
              />
            </VisualizationContainer>
          </VisualizationSection>

          <TerminalSection>
            <InfoTitle>💻 Terminal - Ejecución Paso a Paso</InfoTitle>
            <TerminalContainer>
              <TerminalAnimation
                lesson={selectedLesson}
                currentStep={animationStep}
                isAnimating={isAnimating}
              />
            </TerminalContainer>
          </TerminalSection>
            </ModalBody>

            <ModalFooter>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <ActionButton onClick={handleStartAnimation} disabled={isAnimating}>
                    ▶️ Animar
                  </ActionButton>
                  <ActionButton onClick={handleNextStep} disabled={!isAnimating}>
                    ⏭️ Siguiente
                  </ActionButton>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  {selectedLesson?.content?.examples && (
                    <InfoText style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>
                      Paso {animationStep + 1} de {selectedLesson.content.examples.length}
                    </InfoText>
                  )}
                </div>
                <CompleteButton onClick={() => {
                  handleLessonComplete(selectedLesson.id);
                  handleClose3D();
                }}>
                  🎯 Marcar como Completada
                </CompleteButton>
              </div>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
