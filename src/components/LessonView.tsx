import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import CodeEditor from './CodeEditor';
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

  // Más lecciones se agregarán aquí...
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
            disabled={lessonId >= 120}
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
            <p>Lección actual: {lessonId}/120</p>
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
