import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
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

const SpinnerContainer = styled.div`
  text-align: center;
  color: #00d4ff;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(0, 212, 255, 0.2);
  border-left: 4px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: #00d4ff;
  text-shadow: 0 0 10px #00d4ff;
  animation: pulse 2s ease-in-out infinite;
`;

const LoadingSubtext = styled.div`
  font-size: 0.9rem;
  color: #b8c5d6;
  margin-top: 0.5rem;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

export default function LoadingSpinner() {
  return (
    <Overlay>
      <SpinnerContainer>
        <Spinner />
        <LoadingText>Cargando Pointer Quest...</LoadingText>
        <LoadingSubtext>Preparando visualizaciones 3D</LoadingSubtext>
      </SpinnerContainer>
    </Overlay>
  );
}
