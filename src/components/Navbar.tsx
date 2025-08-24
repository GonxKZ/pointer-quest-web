import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useApp } from '../context/AppContext';

// Animaciones
const glow = keyframes`
  0%, 100% { text-shadow: 0 0 10px #00d4ff; }
  50% { text-shadow: 0 0 20px #00d4ff, 0 0 30px #0099ff; }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Nav = styled.nav`
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(30, 60, 114, 0.8));
  backdrop-filter: blur(20px);
  padding: 1.2rem 3rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00d4ff, transparent);
    animation: ${shimmer} 3s ease-in-out infinite;
  }
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled(Link)`
  font-size: 2.5rem;
  font-weight: 800;
  color: #00d4ff;
  text-decoration: none;
  text-shadow: 0 0 15px #00d4ff;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;

  &::before {
    content: '🎯';
    animation: ${glow} 2s ease-in-out infinite;
  }

  &:hover {
    color: #00a8cc;
    text-shadow: 0 0 25px #00a8cc;
    transform: scale(1.05);

    &::before {
      animation: ${glow} 1s ease-in-out infinite;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

const NavLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  padding: 0.8rem 1.5rem;
  border-radius: 15px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
    transition: left 0.4s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #00d4ff;
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);

    &::before {
      left: 100%;
    }
  }

  &.active {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 255, 136, 0.2));
    color: #ffffff;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
    border: 1px solid rgba(0, 212, 255, 0.5);

    &::before {
      left: 100%;
    }
  }
`;

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 1.5rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
`;

const ProgressText = styled.span`
  font-size: 0.9rem;
  color: #e0e6ff;
  font-weight: 500;
`;

const ProgressValue = styled.span`
  color: #00d4ff;
  font-weight: 800;
  font-size: 1.1rem;
  text-shadow: 0 0 10px #00d4ff;
`;

const ProgressBarContainer = styled.div`
  width: 250px;
  height: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
`;


export default function Navbar() {
  const location = useLocation();
  const { state, dispatch } = useApp();

  const getProgress = () => {
    const totalLessons = 120; // Total de lecciones planeadas
    const completed = state.userProgress.completedLessons.length;
    return Math.round((completed / totalLessons) * 100);
  };

  const progress = getProgress();

  const handleLanguageSwitch = () => {
    const newLanguage = state.language === 'en' ? 'es' : 'en';
    dispatch({ type: 'CHANGE_LANGUAGE', payload: newLanguage });
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">
          🎯 Pointer Quest
        </Logo>

        <NavLinks>
          <NavLink
            to="/lessons"
            className={location.pathname === '/lessons' ? 'active' : ''}
          >
            📚 {state.language === 'en' ? 'Lessons' : 'Lecciones'}
          </NavLink>

          <NavLink
            to="/3d"
            className={location.pathname === '/3d' ? 'active' : ''}
          >
            🕶️ {state.language === 'en' ? '3D Visualization' : 'Visualización 3D'}
          </NavLink>
          
          <button 
            onClick={handleLanguageSwitch} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer', 
              fontSize: '1rem' 
            }}
          >
            {state.language === 'en' ? '🇪🇸' : '🇬🇧'}
          </button>
        </NavLinks>

        <ProgressSection>
          <ProgressText>{state.language === 'en' ? 'Progress:' : 'Progreso:'}</ProgressText>
          <ProgressValue>{progress}%</ProgressValue>
          <ProgressBarContainer>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00d4ff, #00ff88, #ff6b6b)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 2s ease-in-out infinite',
              borderRadius: '20px',
              boxShadow: '0 0 15px rgba(0, 212, 255, 0.6)'
            }} />
          </ProgressBarContainer>
        </ProgressSection>
      </NavContainer>
    </Nav>
  );
}
