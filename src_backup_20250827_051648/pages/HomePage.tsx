import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Animaciones avanzadas
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(1deg); }
  66% { transform: translateY(-10px) rotate(-1deg); }
`;

const glow = keyframes`
  0%, 100% {
    text-shadow: 0 0 30px #00d4ff, 0 0 40px #0099ff;
    filter: hue-rotate(0deg);
  }
  50% {
    text-shadow: 0 0 40px #00d4ff, 0 0 50px #0099ff, 0 0 60px #0066cc;
    filter: hue-rotate(10deg);
  }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 15px 35px rgba(0, 212, 255, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 25px 50px rgba(0, 212, 255, 0.6); }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background: linear-gradient(-45deg, #0f0f23, #1a1a2e, #16213e, #0f3460, #533483, #1a1a2e);
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 50%);
    animation: ${float} 20s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,212,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
`;

const Title = styled.h1`
  font-size: 6rem;
  font-weight: 800;
  background: linear-gradient(45deg, #00d4ff, #00ff88, #ff6b6b, #9b59b6, #00d4ff);
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${glow} 3s ease-in-out infinite, ${gradientShift} 4s ease infinite;
  margin-bottom: 1rem;
  text-align: center;
  filter: drop-shadow(0 0 30px rgba(0, 212, 255, 0.8));
  position: relative;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 3.5rem;
    letter-spacing: 1px;
  }
`;

const Subtitle = styled.p`
  font-size: 2rem;
  color: #e0e6ff;
  margin-bottom: 4rem;
  max-width: 800px;
  line-height: 1.6;
  font-weight: 300;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  position: relative;
  z-index: 2;
  animation: ${slideInUp} 1s ease-out;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2rem;
  max-width: 1300px;
  width: 100%;
  margin-bottom: 4rem;
  position: relative;
  z-index: 2;
`;

const FeatureCard = styled(Link)`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  padding: 3rem;
  text-decoration: none;
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, transparent, #00d4ff, #00ff88, transparent);
    transition: left 0.8s ease;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent);
  }

  &:hover {
    transform: translateY(-20px) scale(1.03);
    box-shadow: 0 35px 70px rgba(0, 212, 255, 0.4);
    border-color: rgba(0, 212, 255, 0.6);

    &::before {
      left: 100%;
    }
  }

  &:hover div:first-child {
    animation: ${pulse} 1s ease infinite;
    filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.8));
  }
`;

const FeatureIcon = styled.div`
  font-size: 4.5rem;
  margin-bottom: 2rem;
  display: inline-block;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.5));
`;

const FeatureTitle = styled.h3`
  color: #00d4ff;
  margin-bottom: 1.5rem;
  font-size: 1.7rem;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
  position: relative;
`;

const FeatureDescription = styled.p`
  color: #b8c5d6;
  line-height: 1.8;
  font-size: 1.1rem;
  font-weight: 400;
  opacity: 0.9;
`;

const StartButton = styled(Link)`
  background: linear-gradient(45deg, #00d4ff, #00ff88, #ff6b6b, #9b59b6);
  background-size: 400% 400%;
  color: #000;
  padding: 2rem 5rem;
  border-radius: 60px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.4rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 40px rgba(0, 212, 255, 0.5);
  animation: ${pulse} 2.5s ease-in-out infinite;
  position: relative;
  z-index: 2;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 2px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.6s ease;
  }

  &::after {
    content: '🚀';
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.5rem;
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-10px) scale(1.08);
    box-shadow: 0 30px 60px rgba(0, 212, 255, 0.7);
    animation-play-state: paused;

    &::before {
      left: 100%;
    }

    &::after {
      transform: translateY(-50%) translateX(5px);
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 3rem;
    font-size: 1.2rem;
    letter-spacing: 1px;
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 5rem;
  margin-top: 5rem;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    gap: 2.5rem;
  }
`;

const Stat = styled.div`
  text-align: center;
  padding: 2.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  min-width: 180px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(0, 212, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-10px) scale(1.05);
    box-shadow: 0 20px 40px rgba(0, 212, 255, 0.4);

    &::before {
      opacity: 1;
    }
  }
`;

const StatNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(45deg, #00d4ff, #00ff88, #ff6b6b);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${glow} 2s ease-in-out infinite, ${gradientShift} 3s ease infinite;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
`;

const StatLabel = styled.div`
  color: #e0e6ff;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
`;

export default function HomePage() {
  return (
    <Container>
      <Title>🎯 Pointer Quest</Title>
      <Subtitle>
        Domina los punteros en C++ con visualizaciones 3D interactivas,
        lecciones gamificadas y un motor de animaciones WebAssembly
      </Subtitle>

      <FeatureGrid>
        <FeatureCard to="/lessons">
          <FeatureIcon>📚</FeatureIcon>
          <FeatureTitle>120 Lecciones Interactivas</FeatureTitle>
          <FeatureDescription>
            Desde punteros básicos hasta patrones avanzados de concurrencia.
            Cada lección incluye código real, explicaciones detalladas y ejemplos prácticos.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard to="/3d">
          <FeatureIcon>🕶️</FeatureIcon>
          <FeatureTitle>Visualización 3D</FeatureTitle>
          <FeatureDescription>
            Explora la memoria como nunca antes. Stack, Heap y Global en 3D interactivo
            con punteros animados y efectos visuales profesionales.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard to="/lessons">
          <FeatureIcon>⚡</FeatureIcon>
          <FeatureTitle>Motor WebAssembly</FeatureTitle>
          <FeatureDescription>
            Animaciones de alto rendimiento impulsadas por Rust/WebAssembly.
            Miles de elementos renderizados en tiempo real sin comprometer el rendimiento.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard to="/lessons">
          <FeatureIcon>🎮</FeatureIcon>
          <FeatureTitle>Gamificación</FeatureTitle>
          <FeatureDescription>
            Sistema de progreso, logros y desafíos. Aprende divirtiéndote
            con un enfoque educativo moderno y engaging.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>

      <StartButton to="/lessons">
        🚀 ¡Comenzar Aventura!
      </StartButton>

      <Stats>
        <Stat>
          <StatNumber>120</StatNumber>
          <StatLabel>Lecciones</StatLabel>
        </Stat>
        <Stat>
          <StatNumber>3D</StatNumber>
          <StatLabel>Visualizaciones</StatLabel>
        </Stat>
        <Stat>
          <StatNumber>∞</StatNumber>
          <StatLabel>Posibilidades</StatLabel>
        </Stat>
      </Stats>
    </Container>
  );
}
