import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { StudentProgressProvider } from './context/StudentProgressContext';
import AccessibilityProvider from './accessibility/AccessibilityManager';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';
import PWAManager from './components/PWAComponents';
import ThemeToggle from './components/ThemeToggle';
import AccessibilityPanel from './components/AccessibilityPanel';
import { useContrastValidation } from './utils/contrastChecker';
import AccessibilityAuditor from './components/AccessibilityAuditor';
import AxeDevTools from './components/AxeDevTools';
import KeyboardShortcutsGuide from './components/KeyboardShortcutsGuide';

// Optimized lazy loading with better chunk splitting
const MemoryVisualizer3D = lazy(() => 
  import(/* webpackChunkName: "3d-visualizer" */ './3d/MemoryVisualizer3D')
);
const LessonRouter = lazy(() => 
  import(/* webpackChunkName: "lesson-router" */ './components/LessonRouter')
);
const HomePage = lazy(() => 
  import(/* webpackChunkName: "home-page" */ './pages/HomePage')
);
const Navbar = lazy(() => 
  import(/* webpackChunkName: "navbar" */ './components/Navbar')
);
const LessonList = lazy(() => 
  import(/* webpackChunkName: "lesson-list" */ './components/LessonList')
);
const ErrorModal = lazy(() => 
  import(/* webpackChunkName: "error-modal" */ './components/ErrorModal')
);
const ContrastReport = lazy(() => 
  import(/* webpackChunkName: "contrast-report" */ './components/ContrastReport')
);
const ProgressDashboard = lazy(() => 
  import(/* webpackChunkName: "progress-dashboard" */ './components/ProgressDashboard')
);
const AchievementGallery = lazy(() => 
  import(/* webpackChunkName: "achievement-gallery" */ './components/AchievementSystem').then(module => ({ default: module.AchievementGallery }))
);
const AnalyticsPage = lazy(() => 
  import(/* webpackChunkName: "analytics-page" */ './components/AnalyticsPage')
);
const DataManagement = lazy(() => 
  import(/* webpackChunkName: "data-management" */ './components/DataManagement')
);

// Estilos globales con soporte completo para temas y accesibilidad
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily.primary};
    background: ${props => props.theme.colors.background.primary};
    color: ${props => props.theme.colors.text.primary};
    overflow-x: hidden;
    line-height: ${props => props.theme.typography.lineHeight.normal};
    transition: all ${props => props.theme.animation.duration.normal};
  }

  /* Accessibility enhancements */
  .a11y-high-contrast {
    filter: contrast(1.5);
  }

  .a11y-large-text {
    font-size: 1.25em !important;
  }

  .a11y-bold-text {
    font-weight: ${props => props.theme.typography.fontWeight.semibold} !important;
  }

  .a11y-underline-links a {
    text-decoration: underline !important;
  }

  .a11y-screen-reader {
    /* Screen reader optimizations */
  }

  .a11y-keyboard-only {
    /* Keyboard navigation enhancements */
  }

  /* Focus indicators - WCAG 2.1 AA Compliant */
  *:focus-visible {
    outline: 3px solid #00d4ff;
    outline-offset: 2px;
    border-radius: 2px;
  }

  [data-focus-size="large"] *:focus-visible {
    outline: 4px solid #00d4ff;
    outline-offset: 3px;
  }

  [data-focus-size="extra-large"] *:focus-visible {
    outline: 5px solid #00d4ff;
    outline-offset: 4px;
  }
  
  /* High visibility focus for critical interactive elements */
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  [role="button"]:focus-visible,
  [tabindex="0"]:focus-visible {
    outline: 3px solid #ffff00;
    outline-offset: 2px;
    box-shadow: 0 0 0 6px rgba(0, 212, 255, 0.3);
  }
  
  /* Ensure minimum interactive element sizes - WCAG 2.1 AA */
  button,
  a,
  input,
  select,
  textarea,
  [role="button"],
  [tabindex="0"] {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Mobile enhanced touch targets */
  @media (max-width: 768px) {
    button,
    a,
    input,
    select,
    textarea,
    [role="button"],
    [tabindex="0"] {
      min-height: 48px;
      min-width: 48px;
      margin: 4px;
    }
    
    *:focus-visible {
      outline: 4px solid #ffff00;
      outline-offset: 3px;
    }
  }

  /* Color blindness filters */
  [data-color-blindness="protanopia"] {
    filter: url(#protanopia);
  }

  [data-color-blindness="deuteranopia"] {
    filter: url(#deuteranopia);
  }

  [data-color-blindness="tritanopia"] {
    filter: url(#tritanopia);
  }

  /* Skip link styles */
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .sr-only:focus {
    position: static !important;
    width: auto !important;
    height: auto !important;
    padding: inherit !important;
    margin: inherit !important;
    overflow: visible !important;
    clip: auto !important;
    white-space: normal !important;
  }

  /* Scrollbar theming */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary[500]};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.primary[600]};
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High contrast media query - Enhanced */
  @media (prefers-contrast: high) {
    * {
      outline: 2px solid transparent;
    }
    
    *:focus,
    *:focus-visible {
      outline: 3px solid #ffffff !important;
      background-color: #000000 !important;
      color: #ffffff !important;
    }
    
    /* High contrast mode overrides */
    body {
      background: #000000 !important;
      color: #ffffff !important;
    }
    
    button,
    input,
    select,
    textarea {
      background: #000000 !important;
      color: #ffffff !important;
      border: 2px solid #ffffff !important;
    }
    
    a {
      color: #00ff00 !important;
      text-decoration: underline !important;
    }
    
    .primary-button {
      background: #ffffff !important;
      color: #000000 !important;
    }
  }

  /* Print styles */
  @media print {
    * {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  
  /* Accessibility landmark */
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const ViewToggle = styled.button`
  position: fixed;
  top: 80px;
  right: 80px;
  padding: 12px 24px;
  background: linear-gradient(45deg, ${props => props.theme.colors.topics.memory.primary}, ${props => props.theme.colors.secondary[500]});
  border: none;
  border-radius: ${props => props.theme.borderRadius.xl};
  color: ${props => props.theme.colors.text.inverse};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  cursor: pointer;
  z-index: 1000;
  transition: all ${props => props.theme.animation.duration.normal};
  box-shadow: ${props => props.theme.shadows.md};
  font-size: ${props => props.theme.typography.fontSize.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
    background: linear-gradient(45deg, ${props => props.theme.colors.topics.memory.secondary}, ${props => props.theme.colors.secondary[600]});
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.text.inverse};
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background-color ${props => props.theme.animation.duration.fast};
    
    &:hover {
      transform: none;
    }
  }
`;

const ControlsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  z-index: 1500;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    top: 10px;
    right: 10px;
    gap: ${props => props.theme.spacing[1]};
  }
`;

// Skip Links Component for WCAG 2.1 AA Compliance
const SkipLinks = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${props => props.theme.zIndex.skipLink};
  
  .skip-link {
    position: absolute;
    top: -100px;
    left: ${props => props.theme.spacing[2]};
    background: ${props => props.theme.colors.primary[500]};
    color: ${props => props.theme.colors.text.inverse};
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
    text-decoration: none;
    border-radius: ${props => props.theme.borderRadius.base};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    font-size: ${props => props.theme.typography.fontSize.sm};
    white-space: nowrap;
    transition: top ${props => props.theme.animation.duration.fast};
    
    &:focus,
    &:focus-visible {
      top: ${props => props.theme.spacing[2]};
      outline: 3px solid ${props => props.theme.colors.text.inverse};
      outline-offset: 2px;
    }
    
    &:not(:last-child) {
      margin-right: ${props => props.theme.spacing[2]};
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .skip-link {
      transition: none;
    }
  }
`;

// Componente principal de la aplicación
function AppContent() {
  const { state, dispatch } = useApp();
  
  // Enable contrast validation in development
  useContrastValidation(process.env.NODE_ENV === 'development');

  const toggle3DMode = () => {
    dispatch({ type: 'TOGGLE_3D_MODE' });
  };

  if (state.is3DMode) {
    return (
      <>
        <ControlsContainer>
          <ThemeToggle variant="button" />
          <ViewToggle 
          onClick={toggle3DMode}
          aria-label="Switch to 2D interface mode"
          title="Toggle 2D View (Ctrl+2)"
        >
            🎮 Vista 2D
          </ViewToggle>
        </ControlsContainer>
        <ErrorBoundary fallback={
          <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
            <h3>🚔 Error loading 3D Visualizer</h3>
            <p>Please try switching to 2D mode or refresh the page.</p>
            <button onClick={toggle3DMode} style={{
              background: '#00d4ff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}>
              Switch to 2D Mode
            </button>
          </div>
        }>
          <Suspense fallback={<LoadingSpinner size="large" message="Loading 3D Engine..." overlay />}>
            <MemoryVisualizer3D />
          </Suspense>
        </ErrorBoundary>
      </>
    );
  }

  return (
    <>
      {/* Skip Links for WCAG 2.1 AA Compliance */}
      <SkipLinks role="navigation" aria-label="Skip links">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
        <a href="#3d-controls" className="skip-link">
          Skip to 3D controls
        </a>
      </SkipLinks>

      <ControlsContainer id="3d-controls">
        <ThemeToggle variant="button" />
        <ViewToggle 
          onClick={toggle3DMode}
          aria-label="Switch to 3D visualization mode"
          title="Toggle 3D View (Ctrl+3)"
        >
          🕶️ Vista 3D
        </ViewToggle>
      </ControlsContainer>

      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner size="small" message="Loading navigation..." />}>
          <div id="navigation">
            <Navbar />
          </div>
        </Suspense>
      </ErrorBoundary>
      
      <MainContent 
        id="main-content" 
        role="main" 
        tabIndex={-1}
        aria-label="Main application content"
      >
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading home page..." />}>
                <HomePage />
              </Suspense>
            } />
            <Route path="/lessons" element={
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading lesson list..." />}>
                <LessonList />
              </Suspense>
            } />
            <Route path="/lessons/:id" element={
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading lesson..." />}>
                <LessonRouter />
              </Suspense>
            } />
            <Route path="/3d" element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner size="large" message="Loading 3D visualizer..." />}>
                  <MemoryVisualizer3D />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/progress" element={
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading progress dashboard..." />}>
                <ProgressDashboard />
              </Suspense>
            } />
            <Route path="/achievements" element={
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading achievements..." />}>
                <AchievementGallery />
              </Suspense>
            } />
            <Route path="/analytics" element={
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading analytics..." />}>
                <AnalyticsPage />
              </Suspense>
            } />
            <Route path="/data" element={
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading data management..." />}>
                <DataManagement />
              </Suspense>
            } />
          </Routes>
        </ErrorBoundary>
      </MainContent>

      {state.showError && (
        <Suspense fallback={<div>Loading error modal...</div>}>
          <ErrorModal
            message={state.errorMessage}
            onClose={() => dispatch({ type: 'HIDE_ERROR' })}
          />
        </Suspense>
      )}
      
      {/* PWA Components */}
      <PWAManager />
      
      {/* Accessibility Panel */}
      <AccessibilityPanel />
      
      {/* Performance monitoring - only in development */}
      <PerformanceMonitor visible={process.env.NODE_ENV === 'development'} />
      
      {/* Contrast Report - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <ContrastReport />
        </Suspense>
      )}
      
      {/* Accessibility Auditor - always available for testing */}
      <AccessibilityAuditor />
      
      {/* Axe DevTools - development only */}
      <AxeDevTools />
      
      {/* Keyboard Shortcuts Guide - WCAG 2.1 AA */}
      <KeyboardShortcutsGuide />
    </>
  );
}

// Componente principal exportado
function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <StudentProgressProvider>
          <AccessibilityProvider>
            <GlobalStyle />
            <AppContainer>
              <Router>
                <AppContent />
              </Router>
            </AppContainer>
          </AccessibilityProvider>
        </StudentProgressProvider>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
