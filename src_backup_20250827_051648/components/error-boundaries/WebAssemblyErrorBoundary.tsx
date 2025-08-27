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
  WasmErrorDetails 
} from '../../types/errors';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  moduleName: string;
  fallback?: (props: FallbackProps) => ReactNode;
  onError?: (error: ErrorDetails & WasmErrorDetails) => void;
  enableJsFallback?: boolean;
  fallbackImplementation?: any;
}

interface State extends ErrorRecoveryState {
  wasmSupported: boolean;
  wasmLoaded: boolean;
  fallbackActive: boolean;
  compilationFailed: boolean;
  runtimeFailed: boolean;
}

const WasmErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(95, 39, 205, 0.1), rgba(17, 82, 147, 0.1));
  border: 2px solid rgba(95, 39, 205, 0.3);
  border-radius: 15px;
  margin: 1rem;
  color: white;
  text-align: center;
  position: relative;
`;

const CircuitBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(90deg, rgba(95, 39, 205, 0.1) 1px, transparent 1px),
    linear-gradient(180deg, rgba(95, 39, 205, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  opacity: 0.3;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: #5f27cd;
  z-index: 1;
  position: relative;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const ErrorTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #5f27cd;
  text-shadow: 0 0 10px rgba(95, 39, 205, 0.3);
  z-index: 1;
  position: relative;
`;

const ErrorSubtitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #ffa500;
  font-weight: normal;
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

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'warning' | 'success' }>`
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
      case 'success':
        return `
          background: linear-gradient(45deg, #00d4aa, #01a3a4);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 212, 170, 0.4);
          }
        `;
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
          background: linear-gradient(45deg, #5f27cd, #341f97);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(95, 39, 205, 0.4);
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
  border: 1px solid rgba(95, 39, 205, 0.3);
  font-family: monospace;
  font-size: 0.8rem;
  text-align: left;
  max-width: 600px;
  z-index: 1;
  position: relative;
`;

const FallbackNotice = styled.div`
  background: linear-gradient(45deg, rgba(0, 212, 170, 0.2), rgba(1, 163, 164, 0.2));
  border: 1px solid #00d4aa;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #00d4aa;
  z-index: 1;
  position: relative;
`;

const PerformanceComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
  text-align: left;
  z-index: 1;
  position: relative;
`;

const PerformanceCard = styled.div<{ active: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(45deg, rgba(0, 212, 170, 0.2), rgba(1, 163, 164, 0.2))'
    : 'rgba(0, 0, 0, 0.3)'
  };
  border: 1px solid ${props => props.active ? '#00d4aa' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 1rem;
  
  h4 {
    color: ${props => props.active ? '#00d4aa' : '#cccccc'};
    margin-bottom: 0.5rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1rem;
    color: #cccccc;
    font-size: 0.9rem;
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
 * WebAssembly-Specific Error Boundary - Handles WASM loading and runtime errors
 * Provides JavaScript fallbacks when WebAssembly fails to load or execute
 */
export class WebAssemblyErrorBoundary extends Component<Props, State> {
  private config: ErrorBoundaryConfig = {
    name: 'WebAssemblyErrorBoundary',
    level: 'component',
    enableRetry: true,
    maxRetries: 2,
    enableFallback: true,
    enableLogging: true,
    enableDevelopmentInfo: true
  };

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
      wasmSupported: this.checkWasmSupport(),
      wasmLoaded: false,
      fallbackActive: false,
      compilationFailed: false,
      runtimeFailed: false
    };
  }

  private checkWasmSupport(): boolean {
    try {
      if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
        const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
        if (module instanceof WebAssembly.Module) return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
      }
    } catch (e) {
      logger.warn('WebAssembly support check failed:', e);
    }
    return false;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorType = WebAssemblyErrorBoundary.classifyWasmError(error);
    const severity = WebAssemblyErrorBoundary.determineSeverity(error, errorType);
    
    const compilationFailed = error.message.toLowerCase().includes('compilation') || 
                              error.message.toLowerCase().includes('invalid');
    const runtimeFailed = error.message.toLowerCase().includes('runtime') ||
                          error.message.toLowerCase().includes('execution');
    
    return { 
      hasError: true, 
      error,
      errorType,
      severity,
      isRecovering: false,
      recoveryAttempted: false,
      compilationFailed,
      runtimeFailed,
      fallbackActive: errorType === ErrorType.WASM_ERROR
    };
  }

  private static classifyWasmError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('webassembly') || message.includes('wasm') || 
        message.includes('compilation') || message.includes('instantiate')) {
      return ErrorType.WASM_ERROR;
    }
    if (message.includes('memory') || message.includes('out of bounds')) {
      return ErrorType.MEMORY_ERROR;
    }
    if (message.includes('import') || message.includes('module')) {
      return ErrorType.CHUNK_LOAD_ERROR;
    }
    if (stack.includes('wasm') || stack.includes('webassembly')) {
      return ErrorType.WASM_ERROR;
    }
    
    return ErrorType.RENDER_ERROR;
  }

  private static determineSeverity(error: Error, errorType: ErrorType): ErrorSeverity {
    if (errorType === ErrorType.WASM_ERROR) {
      if (error.message.includes('compilation') || error.message.includes('invalid')) {
        return ErrorSeverity.HIGH;
      }
      return ErrorSeverity.MEDIUM;
    }
    if (errorType === ErrorType.MEMORY_ERROR) {
      return ErrorSeverity.HIGH;
    }
    return ErrorSeverity.LOW;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`🚨 WebAssembly Error Boundary caught error in module "${this.props.moduleName}":`, error, errorInfo);
    
    const wasmErrorDetails: WasmErrorDetails = {
      module: this.props.moduleName,
      function: this.extractFunctionName(error),
      wasmError: error.message.toLowerCase().includes('webassembly') || error.message.toLowerCase().includes('wasm'),
      fallbackAvailable: !!this.props.enableJsFallback && !!this.props.fallbackImplementation,
      compilationError: error.message.toLowerCase().includes('compilation'),
      runtimeError: error.message.toLowerCase().includes('runtime')
    };

    const errorDetails: ErrorDetails & WasmErrorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      buildVersion: process.env.REACT_APP_VERSION,
      ...wasmErrorDetails
    };

    this.setState({ errorInfo });

    // Log error with WebAssembly specific details
    this.logWasmError(errorDetails);
    
    // Call external error handler if provided
    this.props.onError?.(errorDetails);

    // Automatically switch to JavaScript fallback if available
    if (this.props.enableJsFallback && this.props.fallbackImplementation) {
      this.handleFallbackMode();
    }
  }

  private extractFunctionName(error: Error): string | undefined {
    const stack = error.stack;
    if (!stack) return undefined;
    
    // Try to extract function name from stack trace
    const match = stack.match(/at\s+(\w+)/);
    return match ? match[1] : undefined;
  }

  private logWasmError(errorDetails: ErrorDetails & WasmErrorDetails) {
    if (process.env.NODE_ENV === 'development') {
      logger.error(`🔍 WebAssembly Error Details - ${this.props.moduleName}`);
      logger.error('Error Details:', errorDetails);
      logger.error('WASM Support:', this.state.wasmSupported);
      logger.error('Fallback Available:', !!this.props.enableJsFallback);
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.config.maxRetries) {
      return;
    }

    logger.log(`🔄 WebAssembly Error Boundary attempting recovery for module "${this.props.moduleName}" (${retryCount + 1}/${this.config.maxRetries})`);

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
      lastRetryTime: Date.now(),
      isRecovering: false,
      recoveryAttempted: true,
      fallbackActive: false,
      compilationFailed: false,
      runtimeFailed: false
    });
  };

  private handleFallbackMode = () => {
    logger.log(`🔄 Switching to JavaScript fallback for module "${this.props.moduleName}"`);
    this.setState({
      fallbackActive: true,
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
      fallbackActive: false,
      compilationFailed: false,
      runtimeFailed: false
    });
  };

  private getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown'
    };
  }

  render() {
    // If fallback mode is active and we have a fallback implementation
    if (this.state.fallbackActive && this.props.enableJsFallback && this.props.fallbackImplementation) {
      return (
        <div>
          <FallbackNotice>
            ⚡ JavaScript Fallback Active - Performance may be reduced but all features are functional
          </FallbackNotice>
          {React.createElement(this.props.fallbackImplementation)}
          <ActionButtons>
            <ActionButton onClick={this.handleRetry}>
              🔄 Try WebAssembly Again
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
      const hasFallback = this.props.enableJsFallback && this.props.fallbackImplementation;
      const browserInfo = this.getBrowserInfo();

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
        <WasmErrorContainer>
          <CircuitBackground />
          
          <ErrorIcon>⚙️</ErrorIcon>
          
          <ErrorTitle>WebAssembly Error</ErrorTitle>
          <ErrorSubtitle>Module: {this.props.moduleName}</ErrorSubtitle>
          
          <ErrorDescription>
            The WebAssembly module failed to load or execute properly.
            {!this.state.wasmSupported && " Your browser doesn't support WebAssembly."}
            {this.state.compilationFailed && " There was a compilation error in the WASM module."}
            {this.state.runtimeFailed && " There was a runtime error during execution."}
            {hasFallback && " A JavaScript fallback is available."}
          </ErrorDescription>

          <ActionButtons>
            {canRetry && (
              <ActionButton onClick={this.handleRetry}>
                🔄 Retry WASM ({this.config.maxRetries - retryCount} left)
              </ActionButton>
            )}
            
            {hasFallback && (
              <ActionButton variant="success" onClick={this.handleFallbackMode}>
                ⚡ Use JS Fallback
              </ActionButton>
            )}
            
            <ActionButton variant="secondary" onClick={this.handleReset}>
              🔄 Reset
            </ActionButton>
          </ActionButtons>

          {hasFallback && (
            <PerformanceComparison>
              <PerformanceCard active={false}>
                <h4>🚀 WebAssembly (Failed)</h4>
                <ul>
                  <li>Near-native performance</li>
                  <li>Optimized for computations</li>
                  <li>Lower memory usage</li>
                  <li>Currently unavailable</li>
                </ul>
              </PerformanceCard>
              
              <PerformanceCard active={true}>
                <h4>⚡ JavaScript Fallback</h4>
                <ul>
                  <li>Reliable compatibility</li>
                  <li>Full feature support</li>
                  <li>Slightly slower performance</li>
                  <li>Available now</li>
                </ul>
              </PerformanceCard>
            </PerformanceComparison>
          )}

          <SystemInfo>
            <div><strong>WebAssembly Support:</strong></div>
            <div>Supported: {this.state.wasmSupported ? '✅ Yes' : '❌ No'}</div>
            <div>Module: {this.props.moduleName}</div>
            <div>Error Type: {errorType}</div>
            <div>Severity: {severity}</div>
            <div>Fallback Available: {hasFallback ? '✅ Yes' : '❌ No'}</div>
            <div>Hardware Threads: {browserInfo.hardwareConcurrency}</div>
            <div>Platform: {browserInfo.platform}</div>
          </SystemInfo>

          {process.env.NODE_ENV === 'development' && (
            <TechnicalDetails>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#5f27cd' }}>
                🔧 WebAssembly Technical Details
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
                <strong>Module:</strong> {this.props.moduleName}
                {'\n'}
                <strong>Error Type:</strong> {errorType}
                {'\n'}
                <strong>Severity:</strong> {severity}
                {'\n'}
                <strong>WASM Support:</strong> {this.state.wasmSupported ? 'Yes' : 'No'}
                {'\n'}
                <strong>Compilation Failed:</strong> {this.state.compilationFailed ? 'Yes' : 'No'}
                {'\n'}
                <strong>Runtime Failed:</strong> {this.state.runtimeFailed ? 'Yes' : 'No'}
                {'\n'}
                <strong>Fallback Available:</strong> {hasFallback ? 'Yes' : 'No'}
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
                {'\n\n'}
                <strong>Browser Info:</strong>
                {'\n'}
                {JSON.stringify(browserInfo, null, 2)}
              </pre>
            </TechnicalDetails>
          )}
        </WasmErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default WebAssemblyErrorBoundary;