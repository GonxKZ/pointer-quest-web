import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  progress?: number;
  overlay?: boolean;
  category?: 'básica' | 'intermedia' | 'avanzada' | 'experta';
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Overlay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'overlay',
})<{ overlay: boolean }>`
  ${props => props.overlay ? `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    backdrop-filter: blur(5px);
  ` : ''}
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.overlay ? '100vh' : '200px'};
`;

const Container = styled.div<{ size: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const Spinner = styled.div<{ size: string }>`
  width: ${props => 
    props.size === 'small' ? '30px' :
    props.size === 'medium' ? '50px' : '80px'
  };
  height: ${props => 
    props.size === 'small' ? '30px' :
    props.size === 'medium' ? '50px' : '80px'
  };
  border: 4px solid rgba(0, 212, 255, 0.3);
  border-top: 4px solid #00d4ff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const LoadingText = styled.div<{ size: string }>`
  font-size: ${props => 
    props.size === 'small' ? '0.9rem' :
    props.size === 'medium' ? '1.2rem' : '1.5rem'
  };
  color: #00d4ff;
  text-shadow: 0 0 10px #00d4ff;
  animation: ${pulse} 2s ease-in-out infinite;
  margin-bottom: 0.5rem;
`;

const LoadingSubtext = styled.div`
  font-size: 0.9rem;
  color: #b8c5d6;
  margin-bottom: 1rem;
`;

const ProgressContainer = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 1rem;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #00d4ff, #4ecdc4);
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const LoadingSteps = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${
    props => props.completed ? '#4ecdc4' :
    props.active ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)'
  };
  transition: all 0.3s ease;
  ${props => props.active && `
    animation: ${pulse} 1s ease-in-out infinite;
  `}
`;

const steps = [
  'Loading 3D Engine...',
  'Initializing WebAssembly...',
  'Setting up Components...',
  'Ready!'
];

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Cargando Pointer Quest...', 
  progress,
  overlay = false,
  category
}: LoadingSpinnerProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    if (!overlay) return;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [overlay]);

  return (
    <Overlay overlay={overlay}>
      <Container size={size}>
        <Spinner size={size} />
        <LoadingText size={size}>{message}</LoadingText>
        <LoadingSubtext>
          {category ? `Lección ${category} - Preparando visualizaciones 3D` : 'Preparando visualizaciones 3D'}
        </LoadingSubtext>
        
        {progress !== undefined && (
          <ProgressContainer>
            <ProgressBar progress={progress} />
          </ProgressContainer>
        )}
        
        {overlay && (
          <LoadingSteps>
            {steps.map((step, index) => (
              <Step 
                key={index}
                active={index === currentStep}
                completed={index < currentStep}
                title={step}
              />
            ))}
          </LoadingSteps>
        )}
      </Container>
    </Overlay>
  );
}
