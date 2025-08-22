import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { AppProvider, useApp } from './context/AppContext';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';

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
      <ViewToggle onClick={toggle3DMode}>
        🕶️ Vista 3D
      </ViewToggle>

      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner size="small" message="Loading navigation..." />}>
          <Navbar />
        </Suspense>
      </ErrorBoundary>
      
      <MainContent>
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
      
      {/* Performance monitoring - only in development */}
      <PerformanceMonitor visible={process.env.NODE_ENV === 'development'} />
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
