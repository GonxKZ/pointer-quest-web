import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';
import { 
  ErrorInfo, 
  ErrorDetails, 
  ErrorType, 
  ErrorSeverity, 
  ErrorBoundaryConfig,
  ErrorRecoveryState 
} from '../../types/errors';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  onError?: (error: ErrorDetails) => void;
  fallback?: ReactNode;
}

interface State extends ErrorRecoveryState {
  lastPropsKey: string;
}

const CatastrophicErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const ErrorTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #ff6b6b;
  text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
`;

const ErrorMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
  color: #cccccc;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: linear-gradient(45deg, #ff6b6b, #ff5252);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
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

const TechnicalDetails = styled.details`
  max-width: 800px;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TechnicalSummary = styled.summary`
  cursor: pointer;
  font-weight: bold;
  padding: 0.5rem;
  color: #00d4ff;
  
  &:hover {
    color: #4ecdc4;
  }
`;

const ErrorStack = styled.pre`
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin-top: 1rem;
  color: #cccccc;
  font-family: 'Consolas', 'Monaco', monospace;
`;

const RecoveryStatus = styled.div<{ recovering: boolean }>`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.recovering 
    ? 'linear-gradient(45deg, rgba(255, 202, 40, 0.2), rgba(255, 160, 0, 0.2))'
    : 'rgba(0, 212, 255, 0.1)'
  };
  border: 1px solid ${props => props.recovering ? '#ffca28' : '#00d4ff'};
  color: ${props => props.recovering ? '#ffca28' : '#00d4ff'};
`;

/**
 * App-Level Error Boundary - Catches catastrophic errors that could crash the entire application
 * This is the top-level safety net that ensures the app never completely breaks
 */
export class AppLevelErrorBoundary extends Component<Props, State> {
  private config: ErrorBoundaryConfig = {
    name: 'AppLevelErrorBoundary',
    level: 'app',
    enableRetry: true,
    maxRetries: 3,
    enableFallback: true,
    enableLogging: true,
    enableDevelopmentInfo: true
  };

  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.CRITICAL,
      retryCount: 0,
      lastRetryTime: 0,
      isRecovering: false,
      recoveryAttempted: false,
      lastPropsKey: this.getPropsKey(props)
    };
  }

  private getPropsKey(props: Props): string {
    return JSON.stringify({ 
      childrenType: typeof props.children,
      fallbackType: typeof props.fallback 
    });
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorType = AppLevelErrorBoundary.classifyError(error);
    const severity = AppLevelErrorBoundary.determineSeverity(error, errorType);
    
    return { 
      hasError: true, 
      error,
      errorType,
      severity,
      isRecovering: false,
      recoveryAttempted: false
    };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    const currentPropsKey = JSON.stringify({ 
      childrenType: typeof props.children,
      fallbackType: typeof props.fallback 
    });
    
    // Reset error state when props change significantly (e.g., route change)
    if (state.hasError && currentPropsKey !== state.lastPropsKey) {
      return {
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: 0,
        isRecovering: false,
        recoveryAttempted: false,
        lastPropsKey: currentPropsKey
      };
    }
    
    return { lastPropsKey: currentPropsKey };
  }

  private static classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('chunk') || message.includes('loading')) {
      return ErrorType.CHUNK_LOAD_ERROR;
    }
    if (message.includes('webassembly') || message.includes('wasm')) {
      return ErrorType.WASM_ERROR;
    }
    if (message.includes('three') || message.includes('webgl') || message.includes('canvas')) {
      return ErrorType.THREEJS_ERROR;
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK_ERROR;
    }
    if (stack.includes('lesson') || message.includes('lesson')) {
      return ErrorType.LESSON_CONTENT_ERROR;
    }
    
    return ErrorType.RENDER_ERROR;
  }

  private static determineSeverity(error: Error, errorType: ErrorType): ErrorSeverity {
    // App-level errors are always high severity or critical
    switch (errorType) {
      case ErrorType.CHUNK_LOAD_ERROR:
      case ErrorType.WASM_ERROR:
      case ErrorType.THREEJS_ERROR:
        return ErrorSeverity.CRITICAL;
      case ErrorType.NETWORK_ERROR:
      case ErrorType.LESSON_CONTENT_ERROR:
        return ErrorSeverity.HIGH;
      default:
        return ErrorSeverity.CRITICAL;
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('🚨 App-Level Error Boundary caught catastrophic error:', error, errorInfo);
    
    const errorDetails: ErrorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      buildVersion: process.env.REACT_APP_VERSION
    };

    this.setState({ errorInfo });

    // Log error for production monitoring
    this.logError(errorDetails);
    
    // Call external error handler if provided
    this.props.onError?.(errorDetails);

    // Attempt automatic recovery for certain error types
    this.attemptAutoRecovery();
  }

  private logError(errorDetails: ErrorDetails) {
    if (process.env.NODE_ENV === 'production') {
      // In production, send to error monitoring service
      this.sendToMonitoringService(errorDetails);
    } else {
      // In development, provide detailed console logging
      logger.error('🔍 App-Level Error Details');
      logger.error('Error Details:', errorDetails);
      logger.error('Component Stack:', errorDetails.componentStack);
      logger.error('Full Stack:', errorDetails.stack);
    }
  }

  private async sendToMonitoringService(errorDetails: ErrorDetails) {
    try {
      // This would integrate with services like Sentry, LogRocket, etc.
      // For now, we'll use a mock implementation
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...errorDetails,
          level: 'critical',
          tags: ['app-level', 'catastrophic']
        })
      });
    } catch (logError) {
      logger.error('Failed to log error to monitoring service:', logError);
    }
  }

  private attemptAutoRecovery = () => {
    const { errorType, retryCount } = this.state;
    
    // Don't auto-recover from certain critical errors
    if (errorType === ErrorType.WASM_ERROR || retryCount >= this.config.maxRetries) {
      return;
    }

    this.setState({ isRecovering: true });

    // Wait before attempting recovery
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, Math.min(1000 * Math.pow(2, retryCount), 10000)); // Exponential backoff, max 10s
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.config.maxRetries) {
      this.setState({ isRecovering: false });
      return;
    }

    logger.log(`🔄 App-Level Error Boundary attempting recovery (${retryCount + 1}/${this.config.maxRetries})`);

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
      lastRetryTime: Date.now(),
      isRecovering: false,
      recoveryAttempted: true
    });
  };

  private handleManualRetry = () => {
    logger.log('🔄 Manual retry requested by user');
    this.handleRetry();
  };

  private handleReset = () => {
    logger.log('🔄 Manual reset requested by user');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastRetryTime: 0,
      isRecovering: false,
      recoveryAttempted: false
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorType, severity, retryCount, isRecovering } = this.state;
      const canRetry = retryCount < this.config.maxRetries;

      return (
        <CatastrophicErrorContainer>
          <ErrorIcon>💥</ErrorIcon>
          
          <ErrorTitle>Application Error</ErrorTitle>
          
          <ErrorMessage>
            We encountered a critical error that prevented the C++ Pointer Quest application from running properly.
            This could be due to a system compatibility issue, network problem, or corrupted application state.
          </ErrorMessage>

          {isRecovering && (
            <RecoveryStatus recovering={true}>
              🔄 Attempting automatic recovery... Please wait.
            </RecoveryStatus>
          )}

          <ActionButtons>
            {canRetry && !isRecovering && (
              <ActionButton onClick={this.handleManualRetry}>
                🔄 Try Again ({this.config.maxRetries - retryCount} attempts left)
              </ActionButton>
            )}
            
            <ActionButton variant="secondary" onClick={this.handleReset}>
              🏠 Reset Application
            </ActionButton>
            
            <ActionButton variant="danger" onClick={this.handleReload}>
              🔄 Reload Page
            </ActionButton>
          </ActionButtons>

          <RecoveryStatus recovering={false}>
            <strong>Error Type:</strong> {errorType}<br/>
            <strong>Severity:</strong> {severity}<br/>
            <strong>Time:</strong> {new Date().toLocaleString()}
          </RecoveryStatus>

          {process.env.NODE_ENV === 'development' && (
            <TechnicalDetails>
              <TechnicalSummary>
                🔧 Technical Details (Development Only)
              </TechnicalSummary>
              
              <div>
                <h4>Error Information:</h4>
                <ErrorStack>
                  <strong>Name:</strong> {error.name}
                  {'\n'}
                  <strong>Message:</strong> {error.message}
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
                </ErrorStack>
                
                <h4>Debug Information:</h4>
                <ErrorStack>
                  <strong>Retry Count:</strong> {retryCount}
                  {'\n'}
                  <strong>Error Type:</strong> {errorType}
                  {'\n'}
                  <strong>Severity:</strong> {severity}
                  {'\n'}
                  <strong>User Agent:</strong> {navigator.userAgent}
                  {'\n'}
                  <strong>URL:</strong> {window.location.href}
                  {'\n'}
                  <strong>Timestamp:</strong> {new Date().toISOString()}
                </ErrorStack>
              </div>
            </TechnicalDetails>
          )}
        </CatastrophicErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default AppLevelErrorBoundary;