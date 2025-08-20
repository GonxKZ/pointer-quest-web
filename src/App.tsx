import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LessonList from './components/LessonList';
import ErrorModal from './components/ErrorModal';
import LoadingSpinner from './components/LoadingSpinner';

// Carga perezosa de componentes pesados
const MemoryVisualizer3D = lazy(() => import('./3d/MemoryVisualizer3D'));
const LessonView = lazy(() => import('./components/LessonView'));
const HomePage = lazy(() => import('./pages/HomePage'));

// Estilos globales
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    color: #ffffff;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1a1a2e;
  }

  ::-webkit-scrollbar-thumb {
    background: #3a86ff;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #5ba0ff;
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
`;

const ViewToggle = styled.button`
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 12px 24px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Componente principal de la aplicación
function AppContent() {
  const { state, dispatch } = useApp();

  const toggle3DMode = () => {
    dispatch({ type: 'TOGGLE_3D_MODE' });
  };

  if (state.is3DMode) {
    return (
      <>
        <ViewToggle onClick={toggle3DMode}>
          🎮 Vista 2D
        </ViewToggle>
        <Suspense fallback={<LoadingSpinner />}>
          <MemoryVisualizer3D />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <ViewToggle onClick={toggle3DMode}>
        🕶️ Vista 3D
      </ViewToggle>

      <Navbar />
      <MainContent>
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<LoadingSpinner />}>
              <HomePage />
            </Suspense>
          } />
          <Route path="/lessons" element={<LessonList />} />
          <Route path="/lessons/:id" element={
            <Suspense fallback={<LoadingSpinner />}>
              <LessonView />
            </Suspense>
          } />
          <Route path="/3d" element={
            <Suspense fallback={<LoadingSpinner />}>
              <MemoryVisualizer3D />
            </Suspense>
          } />
        </Routes>
      </MainContent>

      {state.showError && (
        <ErrorModal
          message={state.errorMessage}
          onClose={() => dispatch({ type: 'HIDE_ERROR' })}
        />
      )}
    </>
  );
}

// Componente principal exportado
function App() {
  return (
    <AppProvider>
      <GlobalStyle />
      <AppContainer>
        <Router>
          <AppContent />
        </Router>
      </AppContainer>
    </AppProvider>
  );
}

export default App;