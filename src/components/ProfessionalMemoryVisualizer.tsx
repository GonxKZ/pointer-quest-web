import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  margin: 1rem 0;
  font-family: 'Fira Code', 'Monaco', monospace;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,212,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
    pointer-events: none;
  }
`;

const Title = styled.h3`
  color: #00d4ff;
  margin-bottom: 1.5rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 1.2rem;
  position: relative;
  z-index: 2;
`;

const MemoryLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  position: relative;
  z-index: 2;
`;

const MemorySection = styled.div<{ type: 'stack' | 'heap' | 'global' }>`
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid ${props =>
    props.type === 'stack' ? '#4ecdc4' :
    props.type === 'heap' ? '#ff6b6b' : '#ffa500'};
  border-radius: 10px;
  padding: 1.5rem;
  position: relative;

  &::before {
    content: '${props => props.type.toUpperCase()}';
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background: ${props =>
      props.type === 'stack' ? '#4ecdc4' :
      props.type === 'heap' ? '#ff6b6b' : '#ffa500'};
    color: black;
    padding: 5px 15px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: bold;
  }
`;

const MemoryBlock = styled.div<{ active?: boolean; isPointer?: boolean }>`
  background: ${props => props.isPointer ?
    'linear-gradient(45deg, #00d4ff, #0099cc)' :
    'linear-gradient(135deg, #2a2a4a, #1a1a2e)'};
  border: 1px solid ${props => props.active ? '#00ff88' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00d4ff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.2);
  }
`;

const Address = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 0.7rem;
  color: #666;
  font-family: 'Fira Code', monospace;
`;

const Value = styled.div<{ type?: string }>`
  font-size: 1rem;
  color: ${props => props.type === 'pointer' ? 'white' : '#00d4ff'};
  font-weight: ${props => props.type === 'pointer' ? 'bold' : 'normal'};
  margin-bottom: 0.5rem;
`;

const Type = styled.div`
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
`;

const PointerArrow = styled.div<{ color?: string }>`
  position: absolute;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 12px solid ${props => props.color || '#00d4ff'};
  left: 50%;
  bottom: -12px;
  transform: translateX(-50%);
  filter: drop-shadow(0 2px 4px rgba(0, 212, 255, 0.3));
`;

const ExplanationPanel = styled.div`
  grid-column: 1 / -1;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 1rem;
  position: relative;
  z-index: 2;
`;

const ExplanationTitle = styled.h4`
  color: #00d4ff;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const ExplanationText = styled.div`
  color: #e0e6ff;
  line-height: 1.7;
  font-size: 0.95rem;
`;

const CodeSnippet = styled.pre`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  font-size: 0.9rem;
  color: #e0e0e0;
`;

const ObjectVisualization = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const ObjectHeader = styled.div`
  color: #00d4ff;
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const ObjectField = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

export default function ProfessionalMemoryVisualizer() {
  const [activeSection, setActiveSection] = useState<'stack' | 'heap' | 'global' | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  // Datos de ejemplo que representan la memoria real
  const memoryState = {
    stack: [
      { id: 'stack_1', address: '0x7ffeed1a4b8c', value: 'int x = 42', type: 'variable', active: true },
      { id: 'stack_2', address: '0x7ffeed1a4b88', value: 'int* ptr', type: 'pointer', active: true, pointsTo: 'heap_1' },
    ],
    heap: [
      { id: 'heap_1', address: '0x1a2b3c4d', value: '42', type: 'integer', active: true },
      { id: 'heap_2', address: '0x2b3c4d5e', value: 'MyObject', type: 'object', active: false },
    ],
    global: [
      { id: 'global_1', address: '0x400060', value: 'static int counter', type: 'static', active: false },
    ]
  };

  const explanations = {
    stack: `
      El Stack es una región de memoria LIFO (Last In, First Out) que almacena:
      • Variables locales de funciones
      • Parámetros de funciones
      • Direcciones de retorno
      • Punteros a variables locales

      Características técnicas:
      • Tamaño fijo (típicamente 1-8 MB)
      • Gestión automática por el compilador
      • Muy rápido de acceder
      • Se libera automáticamente al salir de la función
    `,
    heap: `
      El Heap es una región de memoria dinámica donde se almacenan:
      • Objetos creados con new/malloc
      • Arrays dinámicos
      • Estructuras de datos complejas
      • Datos que deben persistir más allá del scope actual

      Características técnicas:
      • Tamaño variable (limitado por RAM disponible)
      • Gestión manual (programador debe liberar memoria)
      • Más lento que el stack
      • Riesgo de memory leaks si no se libera correctamente
    `,
    global: `
      La memoria Global/Static almacena:
      • Variables globales
      • Variables estáticas
      • Constantes globales
      • Tablas de funciones virtuales

      Características técnicas:
      • Inicializada en tiempo de carga del programa
      • Disponible durante toda la vida del programa
      • Acceso desde cualquier parte del código
      • Solo una instancia por programa
    `
  };

  const handleSectionClick = (section: 'stack' | 'heap' | 'global') => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleObjectClick = (objectId: string) => {
    setSelectedObject(selectedObject === objectId ? null : objectId);
  };

  return (
    <Container>
      <Title>🧠 Arquitectura de Memoria - Vista Profesional</Title>

      <MemoryLayout>
        <MemorySection
          type="stack"
          onClick={() => handleSectionClick('stack')}
          style={{ cursor: 'pointer' }}
        >
          {memoryState.stack.map((item) => (
            <MemoryBlock
              key={item.id}
              active={item.active}
              isPointer={item.type === 'pointer'}
              onClick={() => handleObjectClick(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <Address>0x{item.address.slice(-4)}</Address>
              <Value type={item.type === 'pointer' ? 'pointer' : 'value'}>
                {item.value}
              </Value>
              <Type>{item.type}</Type>
              {item.pointsTo && <PointerArrow color="#00d4ff" />}
            </MemoryBlock>
          ))}
        </MemorySection>

        <MemorySection
          type="heap"
          onClick={() => handleSectionClick('heap')}
          style={{ cursor: 'pointer' }}
        >
          {memoryState.heap.map((item) => (
            <MemoryBlock
              key={item.id}
              active={item.active}
              onClick={() => handleObjectClick(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <Address>0x{item.address.slice(-4)}</Address>
              <Value>{item.value}</Value>
              <Type>{item.type} object</Type>
            </MemoryBlock>
          ))}
        </MemorySection>

        <MemorySection
          type="global"
          onClick={() => handleSectionClick('global')}
          style={{ cursor: 'pointer' }}
        >
          {memoryState.global.map((item) => (
            <MemoryBlock
              key={item.id}
              active={item.active}
              onClick={() => handleObjectClick(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <Address>0x{item.address.slice(-4)}</Address>
              <Value>{item.value}</Value>
              <Type>{item.type}</Type>
            </MemoryBlock>
          ))}
        </MemorySection>

        {activeSection && (
          <ExplanationPanel>
            <ExplanationTitle>
              📚 Explicación Técnica - {activeSection.toUpperCase()}
            </ExplanationTitle>
            <ExplanationText>
              {explanations[activeSection]}
            </ExplanationText>

            <CodeSnippet>
{`// Ejemplo de uso de ${activeSection}
void example_function() {
    int x = 42;                    // Stack: variable local
    int* ptr = new int(100);       // Heap: memoria dinámica

    // ptr apunta al heap desde el stack
    std::cout << *ptr << std::endl;

    delete ptr;                    // Liberar heap manualmente
} // x se libera automáticamente (stack)`}
            </CodeSnippet>
          </ExplanationPanel>
        )}

        {selectedObject && (
          <ExplanationPanel>
            <ExplanationTitle>🔍 Detalles del Objeto: {selectedObject}</ExplanationTitle>
            <ObjectVisualization>
              <ObjectHeader>Layout en Memoria</ObjectHeader>
              <ObjectField>
                <span>Dirección:</span>
                <span>0x{memoryState.heap[0]?.address}</span>
              </ObjectField>
              <ObjectField>
                <span>Tamaño:</span>
                <span>4 bytes (int)</span>
              </ObjectField>
              <ObjectField>
                <span>Alineación:</span>
                <span>4 bytes</span>
              </ObjectField>
              <ObjectField>
                <span>Valor actual:</span>
                <span>42</span>
              </ObjectField>
              <ObjectField>
                <span>Estado:</span>
                <span>Activo</span>
              </ObjectField>
            </ObjectVisualization>

            <ExplanationText>
              <strong>Explicación técnica:</strong><br/>
              Los objetos en el heap tienen un layout específico en memoria. Cada tipo de dato
              tiene requisitos de alineación y padding para optimizar el acceso a memoria.
              Los punteros almacenan la dirección exacta donde comienza el objeto.
            </ExplanationText>
          </ExplanationPanel>
        )}
      </MemoryLayout>

      <ExplanationPanel style={{ marginTop: '2rem' }}>
        <ExplanationTitle>🎯 Punteros - Conceptos Fundamentales</ExplanationTitle>
        <ExplanationText>
          <strong>¿Qué es un puntero?</strong><br/>
          Un puntero es una variable que almacena la dirección de memoria de otra variable u objeto.
          Técnicamente, es un entero sin signo que representa una ubicación en el espacio de direcciones virtuales del proceso.

          <strong>¿Por qué usar punteros?</strong><br/>
          • Eficiencia: Evitar copiar datos grandes<br/>
          • Flexibilidad: Modificar objetos en diferentes scopes<br/>
          • Polimorfismo: Interfaz común para diferentes tipos<br/>
          • Gestión manual: Control preciso del ciclo de vida

          <strong>Tipos de punteros:</strong><br/>
          • <code>T*</code> - Puntero básico a tipo T<br/>
          • <code>const T*</code> - Puntero a dato constante<br/>
          • <code>T* const</code> - Puntero constante<br/>
          • <code>void*</code> - Puntero genérico (sin tipo)<br/>
          • <code>std::unique_ptr&lt;T&gt;</code> - Propiedad exclusiva<br/>
          • <code>std::shared_ptr&lt;T&gt;</code> - Propiedad compartida
        </ExplanationText>
      </ExplanationPanel>
    </Container>
  );
}
