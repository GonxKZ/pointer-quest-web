import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="circuit" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(0,212,255,0.1)"/><circle cx="10" cy="10" r="8" fill="none" stroke="rgba(0,212,255,0.05)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23circuit)"/></svg>');
    opacity: 0.4;
    pointer-events: none;
  }
`;

const Title = styled.h2`
  color: #00d4ff;
  text-align: center;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 1.8rem;
  position: relative;
  z-index: 2;

  &::after {
    content: '🎯';
    position: absolute;
    right: -40px;
    top: 50%;
    transform: translateY(-50%);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: translateY(-50%) scale(1); }
    50% { transform: translateY(-50%) scale(1.2); }
  }
`;

const ConceptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 2;
`;

const ConceptCard = styled.div<{ level: 'basic' | 'intermediate' | 'advanced' }>`
  background: ${props =>
    props.level === 'basic' ? 'rgba(0, 212, 255, 0.1)' :
    props.level === 'intermediate' ? 'rgba(255, 107, 107, 0.1)' :
    'rgba(0, 255, 136, 0.1)'};
  border: 1px solid ${props =>
    props.level === 'basic' ? 'rgba(0, 212, 255, 0.3)' :
    props.level === 'intermediate' ? 'rgba(255, 107, 107, 0.3)' :
    'rgba(0, 255, 136, 0.3)'};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props =>
      props.level === 'basic' ? '0 10px 30px rgba(0, 212, 255, 0.2)' :
      props.level === 'intermediate' ? '0 10px 30px rgba(255, 107, 107, 0.2)' :
      '0 10px 30px rgba(0, 255, 136, 0.2)'};
  }
`;

const ConceptHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ConceptTitle = styled.h3`
  color: #00d4ff;
  margin: 0;
  font-size: 1.2rem;
`;

const DifficultyBadge = styled.span<{ level: 'basic' | 'intermediate' | 'advanced' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  background: ${props =>
    props.level === 'basic' ? 'rgba(0, 212, 255, 0.2)' :
    props.level === 'intermediate' ? 'rgba(255, 107, 107, 0.2)' :
    'rgba(0, 255, 136, 0.2)'};
  color: ${props =>
    props.level === 'basic' ? '#00d4ff' :
    props.level === 'intermediate' ? '#ff6b6b' :
    '#00ff88'};
`;

const ConceptDescription = styled.p`
  color: #e0e6ff;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const CodeExample = styled.pre`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  font-size: 0.85rem;
  color: #e0e0e0;
  font-family: 'Fira Code', 'Monaco', monospace;

  .keyword {
    color: #ff6b6b;
    font-weight: bold;
  }

  .type {
    color: #4ecdc4;
  }

  .comment {
    color: #666;
    font-style: italic;
  }

  .operator {
    color: #ffa500;
  }

  .number {
    color: #00d4ff;
  }
`;

const DetailedExplanation = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h4`
  color: #00d4ff;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const SectionText = styled.div`
  color: #b8c5d6;
  line-height: 1.6;
  font-size: 0.9rem;
`;

const MemoryVisualization = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const MemoryRegion = styled.div<{ type: 'stack' | 'heap' | 'global' }>`
  text-align: center;
  padding: 0.5rem;
  border-radius: 6px;
  background: ${props =>
    props.type === 'stack' ? 'rgba(78, 205, 196, 0.2)' :
    props.type === 'heap' ? 'rgba(255, 107, 107, 0.2)' :
    'rgba(255, 165, 0, 0.2)'};
  border: 1px solid ${props =>
    props.type === 'stack' ? 'rgba(78, 205, 196, 0.4)' :
    props.type === 'heap' ? 'rgba(255, 107, 107, 0.4)' :
    'rgba(255, 165, 0, 0.4)'};
`;

const MemoryLabel = styled.div`
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #00d4ff;
`;

const MemoryContent = styled.div`
  font-size: 0.7rem;
  color: #b8c5d6;
`;

export default function PointersTechnicalGuide() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const concepts = [
    {
      id: 'basic_pointers',
      title: 'Punteros Básicos',
      level: 'basic' as const,
      description: 'La esencia de los punteros: direcciones de memoria y acceso indirecto.',
      code: `// Puntero básico - almacena dirección de memoria
int x = 42;
int* ptr = &x;  // & obtiene la dirección

// Acceso al valor apuntado
std::cout << *ptr << std::endl;  // 42

// Modificación a través del puntero
*ptr = 100;
std::cout << x << std::endl;     // 100`,
      explanation: {
        technical: `Un puntero es una variable que contiene la dirección de memoria de otra variable.
Técnicamente, es un entero sin signo que representa una ubicación en el espacio
de direcciones virtuales del proceso (típicamente 64 bits en sistemas modernos).`,
        practical: `Los punteros permiten el acceso indirecto a datos. En lugar de trabajar
directamente con el valor, trabajas con su ubicación en memoria. Esto es
fundamental para muchas estructuras de datos y algoritmos eficientes.`,
        memory: `En el stack, las variables locales tienen direcciones consecutivas.
El puntero almacena esta dirección y permite modificar el valor original
desde cualquier scope que tenga acceso al puntero.`
      }
    },
    {
      id: 'pointer_arithmetic',
      title: 'Aritmética de Punteros',
      level: 'intermediate' as const,
      description: 'Operaciones matemáticas con punteros y su relación con arrays.',
      code: `int arr[] = {10, 20, 30, 40, 50};
int* ptr = arr;  // Apunta al primer elemento

// Avanzar al siguiente elemento
ptr++;  // ptr += sizeof(int)
std::cout << *ptr << std::endl;  // 20

// Calcular diferencias
int* ptr2 = &arr[3];
std::cout << ptr2 - ptr << std::endl;  // 3`,
      explanation: {
        technical: `La aritmética de punteros funciona en unidades del tipo apuntado.
Si ptr es int*, entonces ptr + 1 = ptr + sizeof(int).
Esta es la base de cómo funcionan los arrays en C++.`,
        practical: `Permite iterar sobre arrays de manera eficiente, calcular distancias
entre elementos, y implementar algoritmos de búsqueda y ordenamiento.
Es más rápido que usar índices en bucles grandes.`,
        memory: `Los arrays se almacenan contiguamente en memoria. ptr++ avanza
exactamente sizeof(elemento) bytes, manteniendo la alineación correcta.`
      }
    },
    {
      id: 'smart_pointers',
      title: 'Punteros Inteligentes',
      level: 'advanced' as const,
      description: 'Gestión automática de memoria con RAII y ownership semántico.',
      code: `// unique_ptr - propiedad exclusiva
std::unique_ptr<int> uptr = std::make_unique<int>(42);
*uptr = 100;

// shared_ptr - propiedad compartida
std::shared_ptr<MyClass> sptr = std::make_shared<MyClass>();
std::cout << sptr.use_count() << std::endl;  // 1

// weak_ptr - observador sin ownership
std::weak_ptr<MyClass> wptr = sptr;
auto locked = wptr.lock();
if (locked) {
    // El objeto aún existe
}`,
      explanation: {
        technical: `Los smart pointers implementan RAII (Resource Acquisition Is Initialization).
unique_ptr usa move semantics para transferir ownership.
shared_ptr usa reference counting para compartir ownership.
weak_ptr rompe ciclos de referencias.`,
        practical: `Eliminan la necesidad de delete manual, previenen memory leaks,
y hacen el código más seguro y expresivo. Son fundamentales para
sistemas modernos de gestión de recursos.`,
        memory: `unique_ptr libera automáticamente su recurso al destruirse.
shared_ptr mantiene un control block con el contador de referencias.
weak_ptr no incrementa el contador, evitando ciclos.`
      }
    }
  ];

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <Container>
      <Title>🎯 Guía Técnica de Punteros</Title>

      <ConceptGrid>
        {concepts.map((concept) => (
          <ConceptCard
            key={concept.id}
            level={concept.level}
            onClick={() => toggleCard(concept.id)}
          >
            <ConceptHeader>
              <ConceptTitle>{concept.title}</ConceptTitle>
              <DifficultyBadge level={concept.level}>
                {concept.level}
              </DifficultyBadge>
            </ConceptHeader>

            <ConceptDescription>{concept.description}</ConceptDescription>

            <CodeExample dangerouslySetInnerHTML={{
              __html: concept.code
                .replace(/(int|void|class|std::|make_unique|make_shared)/g, '<span class="keyword">$1</span>')
                .replace(/(unique_ptr|shared_ptr|weak_ptr)/g, '<span class="type">$1</span>')
                .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
                .replace(/(\+\+|--|\+=|-=|\*|=)/g, '<span class="operator">$1</span>')
                .replace(/(\d+)/g, '<span class="number">$1</span>')
            }} />

            {expandedCard === concept.id && (
              <DetailedExplanation>
                <SectionTitle>📋 Explicación Técnica</SectionTitle>
                <SectionText>{concept.explanation.technical}</SectionText>

                <SectionTitle>🛠️ Aplicación Práctica</SectionTitle>
                <SectionText>{concept.explanation.practical}</SectionText>

                <SectionTitle>🧠 Layout en Memoria</SectionTitle>
                <SectionText>{concept.explanation.memory}</SectionText>

                <MemoryVisualization>
                  <MemoryRegion type="stack">
                    <MemoryLabel>Stack</MemoryLabel>
                    <MemoryContent>
                      Variables locales<br/>
                      Parámetros<br/>
                      Punteros locales
                    </MemoryContent>
                  </MemoryRegion>

                  <MemoryRegion type="heap">
                    <MemoryLabel>Heap</MemoryLabel>
                    <MemoryContent>
                      Objetos dinámicos<br/>
                      Arrays<br/>
                      Estructuras complejas
                    </MemoryContent>
                  </MemoryRegion>

                  <MemoryRegion type="global">
                    <MemoryLabel>Global</MemoryLabel>
                    <MemoryContent>
                      Variables estáticas<br/>
                      Constantes globales<br/>
                      Singletons
                    </MemoryContent>
                  </MemoryRegion>
                </MemoryVisualization>
              </DetailedExplanation>
            )}
          </ConceptCard>
        ))}
      </ConceptGrid>

      <DetailedExplanation style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
        <SectionTitle>🎯 Consideraciones de Rendimiento</SectionTitle>
        <SectionText>
          <strong>Cache Locality:</strong> Los punteros pueden causar cache misses si los datos
          apuntados no están en caché. Los arrays son más eficientes que listas enlazadas.<br/><br/>

          <strong>Branch Prediction:</strong> El acceso a través de punteros puede confundir
          el predictor de branches del CPU, afectando el rendimiento.<br/><br/>

          <strong>Vectorization:</strong> Los punteros impiden la vectorización automática
          por parte del compilador, a menos que uses punteros restrict.

          <strong>Alignment:</strong> Los datos mal alineados causan penalizaciones de rendimiento.
          Usar alignas() para optimizar el acceso a memoria.
        </SectionText>

        <SectionTitle>🔧 Buenas Prácticas</SectionTitle>
        <SectionText>
          • <strong>Siempre inicializar punteros</strong> - Evita punteros colgantes<br/>
          • <strong>Usar nullptr</strong> - Más seguro que NULL<br/>
          • <strong>Preferir referencias</strong> - Cuando no necesites punteros<br/>
          • <strong>Smart pointers por defecto</strong> - Para gestión automática<br/>
          • <strong>Evitar aritmética compleja</strong> - Puede ser error-prone<br/>
          • <strong>Documentar ownership</strong> - Claridad sobre quién libera la memoria
        </SectionText>
      </DetailedExplanation>
    </Container>
  );
}
