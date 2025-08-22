import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: #ff6b6b;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
`;

const Description = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const CodeBlock = styled.pre`
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #444;
  margin: 1rem 0;
  font-family: 'Fira Code', monospace;
`;

export default function Lesson37_CyclicSharedPtr() {
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    {
      title: "Problema: Ciclo de Referencias",
      description: "Cuando dos objetos se referencian mutuamente con shared_ptr",
      code: `// Problema: Ciclo de referencias
class Node {
public:
    std::shared_ptr<Node> next;
    std::shared_ptr<Node> prev;  // Esto crea un ciclo!
    
    ~Node() {
        std::cout << "Node destroyed\\n";
    }
};

void create_cycle() {
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    
    a->next = b;  // b.use_count() == 2
    b->prev = a;  // a.use_count() == 2
    
    // Al salir del scope, ¡los objetos NO se destruyen!
    // Ambos tienen use_count > 1 debido al ciclo
}`
    },
    {
      title: "Solución: weak_ptr",
      description: "Usar weak_ptr para romper el ciclo de referencias",
      code: `// Solución: Romper el ciclo con weak_ptr
class Node {
public:
    std::shared_ptr<Node> next;      // Ownership hacia adelante
    std::weak_ptr<Node> prev;        // Observación hacia atrás
    
    ~Node() {
        std::cout << "Node destroyed\\n";
    }
    
    void process_prev() {
        if (auto p = prev.lock()) {  // Conversión segura
            // Usar p como shared_ptr normal
            std::cout << "Previous node exists\\n";
        } else {
            std::cout << "Previous node was destroyed\\n";
        }
    }
};

void safe_chain() {
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    
    a->next = b;  // b.use_count() == 2
    b->prev = a;  // a.use_count() == 1 (weak_ptr no cuenta)
    
    // Al salir del scope: a.use_count() == 0 → se destruye
    // Luego b.use_count() == 0 → se destruye
    // ✅ Destrucción correcta en orden inverso
}`
    },
    {
      title: "Patrón Parent-Child",
      description: "Aplicación práctica en relaciones padre-hijo",
      code: `class Child;

class Parent : public std::enable_shared_from_this<Parent> {
private:
    std::vector<std::shared_ptr<Child>> children;
    
public:
    void add_child(std::shared_ptr<Child> child);
    
    ~Parent() {
        std::cout << "Parent destroyed\\n";
    }
};

class Child {
private:
    std::weak_ptr<Parent> parent;  // No ownership del padre
    
public:
    void set_parent(std::shared_ptr<Parent> p) {
        parent = p;
    }
    
    void notify_parent() {
        if (auto p = parent.lock()) {
            // Acceso seguro al parent
            std::cout << "Parent is alive\\n";
        }
    }
    
    ~Child() {
        std::cout << "Child destroyed\\n";
    }
};

void Parent::add_child(std::shared_ptr<Child> child) {
    children.push_back(child);
    child->set_parent(shared_from_this());
}`
    }
  ];

  return (
    <Container>
      <Title>Lección 37: Ciclos de Referencias con shared_ptr</Title>
      
      <Description>
        <h2>🎯 Objetivo</h2>
        <p>
          Aprender a identificar y resolver problemas de ciclos de referencias 
          que pueden causar memory leaks cuando se usan shared_ptr incorrectamente.
        </p>
        
        <h3>📚 Conceptos Clave:</h3>
        <ul>
          <li><strong>Ciclo de Referencias:</strong> Cuando dos o más objetos se referencian mutuamente</li>
          <li><strong>Memory Leak:</strong> Memoria que no se libera automáticamente</li>
          <li><strong>weak_ptr:</strong> Puntero que no afecta el reference count</li>
          <li><strong>lock():</strong> Método para convertir weak_ptr a shared_ptr de forma segura</li>
        </ul>
      </Description>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setCurrentExample(index)}
            style={{
              padding: '0.5rem 1rem',
              background: currentExample === index ? '#ff6b6b' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {example.title}
          </button>
        ))}
      </div>

      <Description>
        <h3>{examples[currentExample].title}</h3>
        <p>{examples[currentExample].description}</p>
        
        <CodeBlock>
          {examples[currentExample].code}
        </CodeBlock>
      </Description>

      <Description>
        <h3>🔧 Reglas de Diseño</h3>
        <ul>
          <li><strong>Principio de Ownership Único:</strong> Solo un objeto debe "poseer" otro</li>
          <li><strong>Referencias hacia arriba:</strong> Usar weak_ptr para referencias padre ← hijo</li>
          <li><strong>Referencias laterales:</strong> Considerar weak_ptr para relaciones entre hermanos</li>
          <li><strong>Testing:</strong> Verificar que los destructores se llamen correctamente</li>
        </ul>
        
        <h3>⚠️ Señales de Alerta</h3>
        <ul>
          <li>Reference count mayor a 1 cuando solo existe una variable local</li>
          <li>Destructores que nunca se ejecutan</li>
          <li>Memory usage que crece continuamente</li>
          <li>Objetos que persisten después de que deberían ser destruidos</li>
        </ul>
      </Description>

      <Description>
        <h3>✅ Ejemplo Completo Funcional</h3>
        <CodeBlock>
{`#include <iostream>
#include <memory>
#include <vector>

class Child;

class Parent : public std::enable_shared_from_this<Parent> {
private:
    std::vector<std::shared_ptr<Child>> children;
    
public:
    void add_child(std::shared_ptr<Child> child);
    
    ~Parent() {
        std::cout << "Parent destroyed\\n";
    }
    
    size_t child_count() const {
        return children.size();
    }
};

class Child {
private:
    std::weak_ptr<Parent> parent;
    
public:
    void set_parent(std::shared_ptr<Parent> p) {
        parent = p;
    }
    
    bool has_parent() const {
        return !parent.expired();
    }
    
    ~Child() {
        std::cout << "Child destroyed\\n";
    }
};

void Parent::add_child(std::shared_ptr<Child> child) {
    children.push_back(child);
    child->set_parent(shared_from_this());
}

int main() {
    std::cout << "Creating parent and child...\\n";
    {
        auto parent = std::make_shared<Parent>();
        auto child = std::make_shared<Child>();
        
        parent->add_child(child);
        
        std::cout << "Parent ref count: " << parent.use_count() << "\\n"; // 1
        std::cout << "Child ref count: " << child.use_count() << "\\n";   // 2
        std::cout << "Child has parent: " << child->has_parent() << "\\n"; // true
        
        std::cout << "Leaving scope...\\n";
    }
    std::cout << "Scope ended. Objects should be destroyed.\\n";
    
    return 0;
}`}
        </CodeBlock>
      </Description>
    </Container>
  );
}