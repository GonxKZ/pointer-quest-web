import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { LessonNarrator } from './VirtualNarrator';
import Auto3DDemo from './Auto3DDemo';
// import { useApp } from '../context/AppContext'; // Not used

interface TeachingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  duration: number;
  voiceText?: string;
}

interface AutoTeachingSystemProps {
  lessonId: number;
  onComplete?: () => void;
  speed?: 'slow' | 'normal' | 'fast';
}

// Contenedor principal
const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const Overlay = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.isVisible ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const TutorialCard = styled.div`
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.9), rgba(42, 82, 152, 0.9));
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const TutorialTitle = styled.h2`
  color: #00d4ff;
  margin-bottom: 15px;
  font-size: 1.5rem;
`;

const TutorialText = styled.p`
  color: #b8c5d6;
  margin-bottom: 25px;
  line-height: 1.6;
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const ProgressDot = styled.div<{ active: boolean; completed: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props =>
    props.completed ? '#00ff88' :
    props.active ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)'};
  transition: all 0.3s ease;
`;

const ControlButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 5px;

  ${props => props.variant === 'secondary' ? `
    background: transparent;
    border: 2px solid #00d4ff;
    color: #00d4ff;

    &:hover {
      background: rgba(0, 212, 255, 0.1);
    }
  ` : `
    background: linear-gradient(45deg, #00d4ff, #0099cc);
    color: white;

    &:hover {
      background: linear-gradient(45deg, #0099cc, #006699);
      transform: translateY(-2px);
    }
  `}
`;

const SpeedControl = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 10px;
  z-index: 100;
`;

const SpeedButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#00d4ff' : 'transparent'};
  border: 1px solid ${props => props.active ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)'};
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  margin: 0 3px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#0099cc' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

// Hook para manejar el progreso del tutorial
function useTutorialProgress(steps: TeachingStep[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    } else {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // const goToStep = useCallback((stepIndex: number) => {
  //   if (stepIndex >= 0 && stepIndex < steps.length) {
  //     setCurrentStep(stepIndex);
  //   }
  // }, [steps.length]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  return {
    currentStep,
    completedSteps,
    isPaused,
    nextStep,
    prevStep,
    /* goToStep, */
    togglePause
  };
}

export default function AutoTeachingSystem({
  lessonId,
  onComplete,
  speed = 'normal' // eslint-disable-line @typescript-eslint/no-unused-vars
}: AutoTeachingSystemProps) {
  // const _appContext = useApp(); // Not used
  const [isTutorialMode, setIsTutorialMode] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(speed);

  // Definir pasos de enseñanza según la lección
  const teachingSteps: Record<number, TeachingStep[]> = {
    1: [
      {
        id: 'welcome',
        title: '¡Bienvenido a Punteros Básicos!',
        description: 'Vamos a aprender sobre punteros paso a paso. Te guiaré a través de cada concepto.',
        component: TutorialCard,
        duration: 3,
        voiceText: '¡Hola! Bienvenido al mundo de los punteros en C++.'
      },
      {
        id: 'memory_explanation',
        title: 'La Memoria del Ordenador',
        description: 'La memoria es como un gran almacén donde se guardan todas las variables del programa.',
        component: Auto3DDemo,
        props: { autoPlay: true, speed: currentSpeed },
        duration: 5,
        voiceText: 'Imagina que la memoria de tu ordenador es como un edificio con muchas habitaciones.'
      },
      {
        id: 'variables_explanation',
        title: 'Variables en Memoria',
        description: 'Cada variable tiene una dirección única en memoria, como la dirección de tu casa.',
        component: Auto3DDemo,
        props: { autoPlay: true, speed: currentSpeed },
        duration: 4,
        voiceText: 'Las variables son como cajas que contienen valores y tienen direcciones únicas.'
      },
      {
        id: 'pointers_intro',
        title: '¿Qué es un Puntero?',
        description: 'Un puntero es una variable especial que almacena la dirección de otra variable.',
        component: Auto3DDemo,
        props: { autoPlay: true, speed: currentSpeed },
        duration: 6,
        voiceText: 'Un puntero es como una flecha que apunta a otra variable en memoria.'
      },
      {
        id: 'address_operator',
        title: 'El Operador &',
        description: 'Usamos & para obtener la dirección de memoria de una variable.',
        component: Auto3DDemo,
        props: { autoPlay: true, speed: currentSpeed },
        duration: 4,
        voiceText: 'El símbolo ampersand te da la dirección donde vive una variable.'
      },
      {
        id: 'pointer_declaration',
        title: 'Declarando Punteros',
        description: 'Para declarar un puntero usamos el tipo seguido de asterisco: int* ptr;',
        component: Auto3DDemo,
        props: { autoPlay: true, speed: currentSpeed },
        duration: 5,
        voiceText: 'Para crear un puntero escribes el tipo seguido de asterisco y el nombre.'
      },
      {
        id: 'dereference_operator',
        title: 'El Operador *',
        description: 'Usamos * para acceder al valor de la variable apuntada por el puntero.',
        component: Auto3DDemo,
        props: { autoPlay: true, speed: currentSpeed },
        duration: 5,
        voiceText: 'El asterisco te permite ver o cambiar el valor de la variable apuntada.'
      },
      {
        id: 'complete',
        title: '¡Excelente Trabajo!',
        description: 'Has aprendido los conceptos básicos de los punteros. ¡Sigue practicando!',
        component: TutorialCard,
        duration: 3,
        voiceText: '¡Felicitaciones! Ahora conoces los fundamentos de los punteros.'
      }
    ]
  };

  const steps = teachingSteps[lessonId] || [];
  const {
    currentStep,
    completedSteps,
    isPaused,
    nextStep,
    prevStep,
    /* goToStep, */
    togglePause
  } = useTutorialProgress(steps);

  const currentTeachingStep = steps[currentStep];
  const CurrentComponent = currentTeachingStep?.component;

  // Efectos de velocidad
  // const speedMultipliers = {
  //   slow: 1.5,
  //   normal: 1,
  //   fast: 0.7
  // };

  const handleComplete = () => {
    setIsTutorialMode(false);
    onComplete?.();
  };

  return (
    <Container>
      {/* Sistema de narración */}
      <LessonNarrator lessonId={lessonId} />

      {/* Componente de enseñanza actual */}
      {CurrentComponent && (
        <CurrentComponent {...(currentTeachingStep.props || {})} />
      )}

      {/* Controles de velocidad */}
      <SpeedControl>
        <div style={{ color: 'white', marginBottom: '10px' }}>Velocidad:</div>
        <SpeedButton
          active={currentSpeed === 'slow'}
          onClick={() => setCurrentSpeed('slow')}
        >
          🐌 Lento
        </SpeedButton>
        <SpeedButton
          active={currentSpeed === 'normal'}
          onClick={() => setCurrentSpeed('normal')}
        >
          ⚡ Normal
        </SpeedButton>
        <SpeedButton
          active={currentSpeed === 'fast'}
          onClick={() => setCurrentSpeed('fast')}
        >
          🚀 Rápido
        </SpeedButton>
      </SpeedControl>

      {/* Overlay de tutorial */}
      {isTutorialMode && (
        <Overlay isVisible={true}>
          <TutorialCard>
            <TutorialTitle>
              {currentTeachingStep?.title}
            </TutorialTitle>
            <TutorialText>
              {currentTeachingStep?.description}
            </TutorialText>

            <ProgressIndicator>
              {steps.map((_, index) => (
                <ProgressDot
                  key={index}
                  active={index === currentStep}
                  completed={completedSteps.includes(index)}
                />
              ))}
            </ProgressIndicator>

            <div>
              <ControlButton
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="secondary"
              >
                ← Anterior
              </ControlButton>

              <ControlButton
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
              >
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'} →
              </ControlButton>
            </div>

            <div style={{ marginTop: '15px' }}>
              <ControlButton onClick={togglePause} variant="secondary">
                {isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}
              </ControlButton>
              <ControlButton onClick={handleComplete} variant="secondary">
                Saltar Tutorial
              </ControlButton>
            </div>
          </TutorialCard>
        </Overlay>
      )}
    </Container>
  );
}
