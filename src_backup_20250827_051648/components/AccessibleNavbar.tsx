/**
 * Accessible Navbar Component - WCAG 2.1 AA Compliant
 * 
 * Enhanced version of Navbar with full accessibility features:
 * - Proper ARIA labels and landmarks
 * - Keyboard navigation support
 * - High contrast mode support
 * - Screen reader optimization
 * - Skip links for navigation
 */

import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { theme } from '../design-system/theme';
import { 
  focusVisible, 
  respectsReducedMotion, 
  generateAriaLabel,
  AccessibilityAnnouncer,
  keyboardNavigation
} from '../design-system/utils/accessibility';

// Skip link for navigation
const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: ${theme.colors.primary[500]};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  text-decoration: none;
  border-radius: ${theme.borderRadius.sm};
  z-index: ${theme.zIndex.skipLink};
  font-weight: ${theme.typography.fontWeight.semibold};
  
  &:focus {
    top: 6px;
  }
  
  ${focusVisible}
`;

// Accessible animations with reduced motion support
const glow = `
  0%, 100% { text-shadow: 0 0 10px #00d4ff; }
  50% { text-shadow: 0 0 20px #00d4ff, 0 0 30px #0099ff; }
`;

const shimmer = `
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
  z-index: ${theme.zIndex.sticky};
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
    
    ${respectsReducedMotion(`
      animation: shimmer 3s ease-in-out infinite;
      @keyframes shimmer {
        ${shimmer}
      }
    `)}
  }
  
  @media (prefers-contrast: high) {
    background: #000000;
    border: 2px solid #ffffff;
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: 1rem 1.5rem;
  }
`;

const NavContainer = styled.div`
  max-width: ${theme.layout.maxWidth};
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    gap: 1rem;
  }
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
  min-height: 44px; /* WCAG minimum touch target */

  &::before {
    content: '🎯';
    ${respectsReducedMotion(`
      animation: glow 2s ease-in-out infinite;
      @keyframes glow {
        ${glow}
      }
    `)}
  }

  &:hover {
    color: #00a8cc;
    text-shadow: 0 0 25px #00a8cc;
    transform: scale(1.05);

    &::before {
      ${respectsReducedMotion(`
        animation: glow 1s ease-in-out infinite;
      `)}
    }
  }
  
  ${focusVisible}
  
  @media (prefers-contrast: high) {
    color: #ffffff;
    text-shadow: none;
    border: 2px solid #ffffff;
    padding: ${theme.spacing[2]};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 2rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex: 1;
  justify-content: center;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
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
  min-height: 44px; /* WCAG minimum touch target */
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

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

  ${props => props.$isActive && `
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 255, 136, 0.2));
    color: #ffffff;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
    border: 1px solid rgba(0, 212, 255, 0.5);

    &::before {
      left: 100%;
    }
  `}
  
  ${focusVisible}
  
  @media (prefers-contrast: high) {
    border: 2px solid #ffffff;
    background: ${props => props.$isActive ? '#ffffff' : 'transparent'};
    color: ${props => props.$isActive ? '#000000' : '#ffffff'};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
`;

const LanguageButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 15px;
  min-height: 44px; /* WCAG minimum touch target */
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00d4ff;
    color: #00d4ff;
  }
  
  ${focusVisible}
  
  @media (prefers-contrast: high) {
    border: 2px solid #ffffff;
    background: transparent;
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
  
  @media (max-width: ${theme.breakpoints.md}) {
    gap: 1rem;
    padding: 0.8rem 1rem;
  }
`;

const ProgressText = styled.span`
  font-size: 0.9rem;
  color: #e0e6ff;
  font-weight: 500;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    display: none;
  }
`;

const ProgressValue = styled.span`
  color: #00d4ff;
  font-weight: 800;
  font-size: 1.1rem;
  text-shadow: 0 0 10px #00d4ff;
  
  @media (prefers-contrast: high) {
    text-shadow: none;
  }
`;

const ProgressBarContainer = styled.div`
  width: 250px;
  height: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    width: 150px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100px;
  }
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #00d4ff, #00ff88, #ff6b6b);
  background-size: 200% 200%;
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
  transition: width 0.3s ease;
  
  ${respectsReducedMotion(`
    animation: shimmer 2s ease-in-out infinite;
  `)}
  
  @media (prefers-contrast: high) {
    background: #ffffff;
    box-shadow: none;
  }
`;

// Screen reader only text for progress
const ScreenReaderOnly = styled.span`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

interface AccessibleNavbarProps {
  className?: string;
}

export default function AccessibleNavbar({ className }: AccessibleNavbarProps) {
  const location = useLocation();
  const { state, dispatch } = useApp();
  const navRef = useRef<HTMLElement>(null);

  const getProgress = () => {
    const totalLessons = 120; // Total de lecciones planeadas
    const completed = state.userProgress.completedLessons.length;
    return Math.round((completed / totalLessons) * 100);
  };

  const progress = getProgress();

  const handleLanguageSwitch = () => {
    const announcer = AccessibilityAnnouncer.getInstance();
    const newLanguage = state.language === 'en' ? 'es' : 'en';
    const languageName = newLanguage === 'en' ? 'English' : 'Español';
    
    dispatch({ type: 'CHANGE_LANGUAGE', payload: newLanguage });
    announcer.announceInteraction(`Language switched to ${languageName}`, 'Language changed successfully');
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!navRef.current) return;
      
      // Handle Escape key to return focus to skip link
      if (event.key === keyboardNavigation.keys.ESCAPE) {
        const skipLink = document.querySelector('a[href="#main-content"]') as HTMLElement;
        skipLink?.focus();
      }
    };
    
    navRef.current?.addEventListener('keydown', handleKeyDown);
    return () => navRef.current?.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigationItems = [
    {
      path: '/lessons',
      label: state.language === 'en' ? 'Lessons' : 'Lecciones',
      emoji: '📚',
      description: state.language === 'en' ? 'Browse all C++ pointer lessons' : 'Explorar todas las lecciones de punteros en C++'
    },
    {
      path: '/3d',
      label: state.language === 'en' ? '3D Visualization' : 'Visualización 3D',
      emoji: '🕶️',
      description: state.language === 'en' ? 'Interactive 3D memory visualization' : 'Visualización 3D interactiva de memoria'
    }
  ];

  return (
    <>
      <SkipLink href="#main-content">
        {state.language === 'en' ? 'Skip to main content' : 'Saltar al contenido principal'}
      </SkipLink>
      
      <Nav ref={navRef} role="navigation" aria-label="Main navigation" className={className}>
        <NavContainer>
          <Logo 
            to="/" 
            aria-label={generateAriaLabel.button(
              state.language === 'en' ? 'Go to homepage' : 'Ir a la página principal',
              'Pointer Quest'
            )}
          >
            <span aria-hidden="true">🎯</span> Pointer Quest
          </Logo>

          <NavLinks role="menubar">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                role="menuitem"
                $isActive={location.pathname === item.path}
                aria-label={`${item.label}. ${item.description}`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span aria-hidden="true">{item.emoji}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
            
            <LanguageButton
              onClick={handleLanguageSwitch}
              aria-label={generateAriaLabel.button(
                state.language === 'en' 
                  ? 'Switch to Spanish' 
                  : 'Cambiar a inglés',
                'Language selector'
              )}
              title={state.language === 'en' ? 'Switch to Spanish' : 'Switch to English'}
            >
              <span aria-hidden="true">
                {state.language === 'en' ? '🇪🇸' : '🇬🇧'}
              </span>
              <ScreenReaderOnly>
                {state.language === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
              </ScreenReaderOnly>
            </LanguageButton>
          </NavLinks>

          <ProgressSection 
            role="progressbar"
            aria-valuenow={state.userProgress.completedLessons.length}
            aria-valuemin={0}
            aria-valuemax={120}
            aria-label={generateAriaLabel.progress(
              state.userProgress.completedLessons.length, 
              120, 
              progress
            )}
          >
            <ProgressText aria-hidden="true">
              {state.language === 'en' ? 'Progress:' : 'Progreso:'}
            </ProgressText>
            <ProgressValue aria-hidden="true">
              {progress}%
            </ProgressValue>
            <ProgressBarContainer>
              <ProgressBar 
                $progress={progress}
                role="presentation"
                aria-hidden="true"
              />
            </ProgressBarContainer>
            
            <ScreenReaderOnly>
              {generateAriaLabel.progress(
                state.userProgress.completedLessons.length, 
                120, 
                progress
              )}
            </ScreenReaderOnly>
          </ProgressSection>
        </NavContainer>
      </Nav>
    </>
  );
}