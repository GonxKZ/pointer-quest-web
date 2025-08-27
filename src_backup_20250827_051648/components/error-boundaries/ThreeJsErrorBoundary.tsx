import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';
import { 
  ErrorInfo, 
  ErrorDetails, 
  ErrorType, 
  ErrorSeverity, 
  ErrorBoundaryConfig,
  ErrorRecoveryState,
  FallbackProps,
  ThreeJsErrorDetails 
} from '../../types/errors';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  componentName: string;
  fallback?: (props: FallbackProps) => ReactNode;
  onError?: (error: ErrorDetails & ThreeJsErrorDetails) => void;
  enableFallbackRenderer?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
}

interface State extends ErrorRecoveryState {
  webGLSupported: boolean;
  fallbackMode: boolean;
  performanceIssue: boolean;
}

const ThreeJsErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(34, 34, 60, 0.9), rgba(17, 25, 40, 0.9));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  margin: 1rem;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const FloatingBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(255, 107, 107, 0.05) 0%, transparent 50%);
  pointer-events: none;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: #00d4ff;
  z-index: 1;
  position: relative;
`;

const ErrorTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  z-index: 1;
  position: relative;
`;

const ErrorDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 500px;
  line-height: 1.6;
  color: #cccccc;
  z-index: 1;
  position: relative;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
  z-index: 1;
  position: relative;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'warning' }>`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => {
    switch (props.variant) {
      case 'warning':
        return `
          background: linear-gradient(45deg, #ffca28, #ffa000);
          color: #1a1a2e;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 202, 40, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: linear-gradient(45deg, #666666, #555555);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 102, 102, 0.4);
          }
        `;
      default:
        return `
          background: linear-gradient(45deg, #00d4ff, #4ecdc4);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
          }
        `;
    }
  }}
`;

const SystemInfo = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid rgba(0, 212, 255, 0.3);
  font-family: monospace;
  font-size: 0.8rem;
  text-align: left;
  max-width: 600px;
  z-index: 1;
  position: relative;
`;

const FallbackCanvas = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(45deg, #1a1a2e, #16213e);
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
`;

const FallbackVisualization = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
`;

const MemoryBlock = styled.div<{ color: string }>`
  height: 60px;
  background: ${props => props.color};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
`;

const TechnicalDetails = styled.details`
  max-width: 800px;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1;
  position: relative;
`;

/**
 * Three.js-Specific Error Boundary - Catches WebGL and 3D rendering errors
 * Provides fallbacks for graphics-related failures and WebGL compatibility issues
 */
export class ThreeJsErrorBoundary extends Component<Props, State> {
  private config: ErrorBoundaryConfig = {
    name: 'ThreeJsErrorBoundary',
    level: 'component',
    enableRetry: true,
    maxRetries: 3,
    enableFallback: true,
    enableLogging: true,
    enableDevelopmentInfo: true
  };

  private webglContext: WebGLRenderingContext | null = null;

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.MEDIUM,
      retryCount: 0,
      lastRetryTime: 0,
      isRecovering: false,
      recoveryAttempted: false,
      webGLSupported: this.checkWebGLSupport(),
      fallbackMode: false,
      performanceIssue: false
    };
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      this.webglContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!this.webglContext;
    } catch (e) {
      return false;
    }
  }

  private getWebGLInfo() {
    if (!this.webglContext) return null;
    
    const debugInfo = this.webglContext.getExtension('WEBGL_debug_renderer_info');
    return {
      vendor: debugInfo ? this.webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
      renderer: debugInfo ? this.webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
      version: this.webglContext.getParameter(this.webglContext.VERSION),
      maxTextureSize: this.webglContext.getParameter(this.webglContext.MAX_TEXTURE_SIZE),
      maxVertexAttribs: this.webglContext.getParameter(this.webglContext.MAX_VERTEX_ATTRIBS),
      maxFragmentUniforms: this.webglContext.getParameter(this.webglContext.MAX_FRAGMENT_UNIFORM_VECTORS)
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorType = ThreeJsErrorBoundary.classifyThreeJsError(error);
    const severity = ThreeJsErrorBoundary.determineSeverity(error, errorType);
    
    return { 
      hasError: true, 
      error,
      errorType,
      severity,
      isRecovering: false,
      recoveryAttempted: false,
      fallbackMode: errorType === ErrorType.THREEJS_ERROR
    };
  }

  private static classifyThreeJsError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('webgl') || message.includes('context lost') || message.includes('gl_')) {
      return ErrorType.THREEJS_ERROR;
    }
    if (message.includes('shader') || message.includes('glsl')) {
      return ErrorType.THREEJS_ERROR;
    }
    if (message.includes('texture') || message.includes('buffer') || message.includes('geometry')) {
      return ErrorType.THREEJS_ERROR;
    }
    if (message.includes('memory') || message.includes('performance')) {
      return ErrorType.PERFORMANCE_ERROR;
    }
    if (stack.includes('three') || stack.includes('@react-three/fiber')) {
      return ErrorType.THREEJS_ERROR;
    }
    
    return ErrorType.RENDER_ERROR;
  }

  private static determineSeverity(error: Error, errorType: ErrorType): ErrorSeverity {
    if (errorType === ErrorType.THREEJS_ERROR) {
      if (error.message.includes('context lost') || error.message.includes('webgl')) {
        return ErrorSeverity.HIGH;
      }
      return ErrorSeverity.MEDIUM;
    }
    return ErrorSeverity.LOW;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`🚨 Three.js Error Boundary caught error in "${this.props.componentName}":`, error, errorInfo);
    
    const webglInfo = this.getWebGLInfo();
    
    const threeJsErrorDetails: ThreeJsErrorDetails = {
      renderer: webglInfo?.renderer || 'Unknown',
      scene: this.props.componentName,
      camera: 'Unknown',
      geometryCount: 0,
      materialCount: 0,
      textureCount: 0,
      webglError: error.message.toLowerCase().includes('webgl'),
      shaderError: error.message.toLowerCase().includes('shader')
    };

    const errorDetails: ErrorDetails & ThreeJsErrorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      buildVersion: process.env.REACT_APP_VERSION,
      ...threeJsErrorDetails
    };

    this.setState({ errorInfo });

    // Log error with Three.js specific details
    this.logThreeJsError(errorDetails);
    
    // Call external error handler if provided
    this.props.onError?.(errorDetails);

    // Check for performance issues
    this.checkPerformanceIssues();
  }

  private logThreeJsError(errorDetails: ErrorDetails & ThreeJsErrorDetails) {
    if (process.env.NODE_ENV === 'development') {
      logger.error(`🔍 Three.js Error Details - ${this.props.componentName}`);
      logger.error('Error Details:', errorDetails);
      logger.error('WebGL Info:', this.getWebGLInfo());
      logger.error('WebGL Supported:', this.state.webGLSupported);
    }
  }

  private checkPerformanceIssues() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const context = canvas.getContext('webgl');
      if (context) {
        // Check for WebGL context loss
        context.addEventListener('webglcontextlost', (event) => {
          logger.warn('🚨 WebGL context lost!');
          event.preventDefault();
          this.setState({ performanceIssue: true });
        });
      }
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.config.maxRetries) {
      return;
    }

    logger.log(`🔄 Three.js Error Boundary attempting recovery for "${this.props.componentName}" (${retryCount + 1}/${this.config.maxRetries})`);

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
      lastRetryTime: Date.now(),
      isRecovering: false,
      recoveryAttempted: true,
      fallbackMode: false
    });
  };

  private handleFallbackMode = () => {
    logger.log(`🔄 Switching to fallback mode for "${this.props.componentName}"`);
    this.setState({
      fallbackMode: true,
      hasError: false
    });
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastRetryTime: 0,
      isRecovering: false,
      recoveryAttempted: false,
      fallbackMode: false,
      performanceIssue: false
    });
  };

  private renderFallbackVisualization() {
    return (
      <FallbackCanvas>
        <h3 style={{ color: '#00d4ff', marginBottom: '1rem' }}>2D Memory Visualization</h3>
        <FallbackVisualization>
          <MemoryBlock color="#00ff88">Stack</MemoryBlock>
          <MemoryBlock color="#ff6b6b">Heap</MemoryBlock>
          <MemoryBlock color="#ffa500">Global</MemoryBlock>
          <MemoryBlock color="#00d4ff">int* p</MemoryBlock>
          <MemoryBlock color="#4ecdc4">Value</MemoryBlock>
          <MemoryBlock color="#ff6b6b">Object</MemoryBlock>
        </FallbackVisualization>
        <p style={{ color: '#cccccc', fontSize: '0.9rem', marginTop: '1rem' }}>
          📊 Simplified 2D representation of memory layout
        </p>
      </FallbackCanvas>
    );
  }

  render() {
    // If in fallback mode, show 2D visualization
    if (this.state.fallbackMode && this.props.enableFallbackRenderer) {
      return (
        <div>
          {this.renderFallbackVisualization()}
          <ActionButtons>
            <ActionButton onClick={this.handleRetry}>
              🔄 Try 3D Again
            </ActionButton>
            <ActionButton variant="secondary" onClick={this.handleReset}>
              🔄 Reset
            </ActionButton>
          </ActionButtons>
        </div>
      );
    }

    if (this.state.hasError && this.state.error) {
      const { error, errorInfo, errorType, severity, retryCount } = this.state;
      const canRetry = retryCount < this.config.maxRetries;
      const webglInfo = this.getWebGLInfo();

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error,
          resetError: this.handleReset,
          retry: this.handleRetry,
          canRetry,
          retryCount,
          errorType,
          severity,
          boundaryName: this.config.name
        });
      }

      return (
        <ThreeJsErrorContainer>
          <FloatingBackground />
          
          <ErrorIcon>🎮</ErrorIcon>
          
          <ErrorTitle>3D Visualization Error</ErrorTitle>
          
          <ErrorDescription>
            The 3D visualization couldn't load properly. 
            {!this.state.webGLSupported && " Your browser doesn't support WebGL."}
            {errorType === ErrorType.PERFORMANCE_ERROR && " This might be due to performance limitations."}
            {errorType === ErrorType.THREEJS_ERROR && " There was a graphics rendering issue."}
          </ErrorDescription>

          <ActionButtons>
            {canRetry && (
              <ActionButton onClick={this.handleRetry}>
                🔄 Retry 3D ({this.config.maxRetries - retryCount} left)
              </ActionButton>
            )}
            
            {this.props.enableFallbackRenderer && (
              <ActionButton variant="warning" onClick={this.handleFallbackMode}>
                📊 Use 2D Mode
              </ActionButton>
            )}
            
            <ActionButton variant="secondary" onClick={this.handleReset}>
              🔄 Reset
            </ActionButton>
          </ActionButtons>

          <SystemInfo>
            <div><strong>Graphics Support:</strong></div>
            <div>WebGL: {this.state.webGLSupported ? '✅ Supported' : '❌ Not Supported'}</div>
            {webglInfo && (
              <>
                <div>Renderer: {webglInfo.renderer}</div>
                <div>Vendor: {webglInfo.vendor}</div>
                <div>Max Texture Size: {webglInfo.maxTextureSize}</div>
              </>
            )}
            <div>Component: {this.props.componentName}</div>
            <div>Performance Mode: {this.props.performanceMode || 'auto'}</div>
          </SystemInfo>

          {process.env.NODE_ENV === 'development' && (
            <TechnicalDetails>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#00d4ff' }}>
                🔧 Three.js Technical Details
              </summary>
              
              <pre style={{
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '1rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                overflow: 'auto',
                marginTop: '1rem',
                color: '#cccccc'
              }}>
                <strong>Component:</strong> {this.props.componentName}
                {'\n'}
                <strong>Error Type:</strong> {errorType}
                {'\n'}
                <strong>Severity:</strong> {severity}
                {'\n'}
                <strong>WebGL Support:</strong> {this.state.webGLSupported ? 'Yes' : 'No'}
                {'\n'}
                <strong>Error Message:</strong> {error.message}
                {'\n\n'}
                <strong>Stack Trace:</strong>
                {'\n'}
                {error.stack}
                {errorInfo && (
                  <>
                    {'\n\n'}
                    <strong>Component Stack:</strong>
                    {'\n'}
                    {errorInfo.componentStack}
                  </>
                )}
                {webglInfo && (
                  <>
                    {'\n\n'}
                    <strong>WebGL Info:</strong>
                    {'\n'}
                    {JSON.stringify(webglInfo, null, 2)}
                  </>
                )}
              </pre>
            </TechnicalDetails>
          )}
        </ThreeJsErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ThreeJsErrorBoundary;