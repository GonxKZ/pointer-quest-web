import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';
import { 
  ErrorInfo, 
  ErrorDetails, 
  ErrorType, 
  ErrorSeverity, 
  ErrorBoundaryConfig,
  ErrorRecoveryState,
  FallbackProps 
} from '../../types/errors';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  routeName: string;
  fallback?: (props: FallbackProps) => ReactNode;
  onError?: (error: ErrorDetails) => void;
  enableNavigation?: boolean;
}

interface State extends ErrorRecoveryState {
  routeName: string;
}

const RouteErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(238, 90, 36, 0.1));
  border: 2px solid rgba(255, 107, 107, 0.3);
  border-radius: 15px;
  margin: 2rem;
  color: white;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: #ff6b6b;
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ff6b6b;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
`;

const ErrorSubtitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #ffca28;
  font-weight: normal;
`;

const ErrorDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
  color: #cccccc;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 800px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'warning' }>`
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
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

const RouteInfo = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid rgba(0, 212, 255, 0.3);
`;

const TechnicalDetails = styled.details`
  max-width: 800px;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
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

const RetryStatus = styled.div<{ isRetrying: boolean }>`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.isRetrying 
    ? 'linear-gradient(45deg, rgba(255, 202, 40, 0.2), rgba(255, 160, 0, 0.2))'
    : 'rgba(0, 212, 255, 0.1)'
  };
  border: 1px solid ${props => props.isRetrying ? '#ffca28' : '#00d4ff'};
  color: ${props => props.isRetrying ? '#ffca28' : '#00d4ff'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

/**
 * Route-Level Error Boundary - Catches errors specific to pages/routes
 * Prevents route-level failures from crashing the entire application
 */
export class RouteLevelErrorBoundary extends Component<Props, State> {
  private config: ErrorBoundaryConfig = {
    name: 'RouteLevelErrorBoundary',
    level: 'route',
    enableRetry: true,
    maxRetries: 2,
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
      severity: ErrorSeverity.MEDIUM,
      retryCount: 0,
      lastRetryTime: 0,
      isRecovering: false,
      recoveryAttempted: false,
      routeName: props.routeName
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorType = RouteLevelErrorBoundary.classifyError(error);
    const severity = RouteLevelErrorBoundary.determineSeverity(error, errorType);
    
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
    // Reset error state when route changes
    if (state.hasError && props.routeName !== state.routeName) {
      return {
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: 0,
        isRecovering: false,
        recoveryAttempted: false,
        routeName: props.routeName
      };
    }
    
    return { routeName: props.routeName };
  }

  private static classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('chunk') || message.includes('loading') || message.includes('import')) {
      return ErrorType.CHUNK_LOAD_ERROR;
    }
    if (stack.includes('lesson') || message.includes('lesson')) {
      return ErrorType.LESSON_CONTENT_ERROR;
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK_ERROR;
    }
    if (message.includes('three') || message.includes('webgl')) {
      return ErrorType.THREEJS_ERROR;
    }
    if (message.includes('performance') || message.includes('memory')) {
      return ErrorType.PERFORMANCE_ERROR;
    }
    
    return ErrorType.RENDER_ERROR;
  }

  private static determineSeverity(error: Error, errorType: ErrorType): ErrorSeverity {
    switch (errorType) {
      case ErrorType.CHUNK_LOAD_ERROR:
      case ErrorType.THREEJS_ERROR:
        return ErrorSeverity.HIGH;
      case ErrorType.LESSON_CONTENT_ERROR:
      case ErrorType.PERFORMANCE_ERROR:
        return ErrorSeverity.MEDIUM;
      case ErrorType.NETWORK_ERROR:
        return ErrorSeverity.LOW;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`🚨 Route-Level Error Boundary caught error in route "${this.props.routeName}":`, error, errorInfo);
    
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

    // Log error
    this.logError(errorDetails);
    
    // Call external error handler if provided
    this.props.onError?.(errorDetails);

    // Attempt automatic recovery for non-critical errors
    this.attemptAutoRecovery();
  }

  private logError(errorDetails: ErrorDetails) {
    if (process.env.NODE_ENV === 'development') {
      logger.error(`🔍 Route Error Details - ${this.props.routeName}`);
      logger.error('Error Details:', errorDetails);
      logger.error('Route:', this.props.routeName);
      logger.error('Component Stack:', errorDetails.componentStack);
    }
  }

  private attemptAutoRecovery = () => {
    const { severity, retryCount } = this.state;
    
    // Don't auto-recover from high severity errors or after max retries
    if (severity === ErrorSeverity.HIGH || retryCount >= this.config.maxRetries) {
      return;
    }

    this.setState({ isRecovering: true });

    // Wait before attempting recovery
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, 2000 + (retryCount * 1000)); // Progressive delay
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.config.maxRetries) {
      this.setState({ isRecovering: false });
      return;
    }

    logger.log(`🔄 Route-Level Error Boundary attempting recovery for route "${this.props.routeName}" (${retryCount + 1}/${this.config.maxRetries})`);

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
    logger.log(`🔄 Manual retry requested for route "${this.props.routeName}"`);
    this.handleRetry();
  };

  private handleReset = () => {
    logger.log(`🔄 Manual reset requested for route "${this.props.routeName}"`);
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

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleReloadPage = () => {
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { error, errorInfo, errorType, severity, retryCount, isRecovering } = this.state;
      const canRetry = retryCount < this.config.maxRetries;

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error,
          resetError: this.handleReset,
          retry: this.handleManualRetry,
          canRetry,
          retryCount,
          errorType,
          severity,
          boundaryName: this.config.name
        });
      }

      return (
        <RouteErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          
          <ErrorTitle>Page Error</ErrorTitle>
          <ErrorSubtitle>Route: {this.props.routeName}</ErrorSubtitle>
          
          <ErrorDescription>
            This page encountered an error and couldn't load properly. 
            {errorType === ErrorType.CHUNK_LOAD_ERROR && 
              " This might be due to a network issue or outdated cached files."}
            {errorType === ErrorType.LESSON_CONTENT_ERROR && 
              " There was a problem loading the lesson content."}
            {errorType === ErrorType.PERFORMANCE_ERROR && 
              " The page encountered a performance issue."}
          </ErrorDescription>

          {isRecovering && (
            <RetryStatus isRetrying={true}>
              🔄 Attempting to recover... Please wait.
            </RetryStatus>
          )}

          <ActionGrid>
            {canRetry && !isRecovering && (
              <ActionButton onClick={this.handleManualRetry}>
                🔄 Try Again
                {retryCount > 0 && ` (${this.config.maxRetries - retryCount} left)`}
              </ActionButton>
            )}
            
            <ActionButton variant="secondary" onClick={this.handleReset}>
              🏠 Reset Page
            </ActionButton>
            
            {this.props.enableNavigation && (
              <>
                <ActionButton variant="warning" onClick={this.handleGoBack}>
                  ⬅️ Go Back
                </ActionButton>
                
                <ActionButton onClick={this.handleGoHome}>
                  🏠 Home
                </ActionButton>
              </>
            )}
            
            <ActionButton variant="danger" onClick={this.handleReloadPage}>
              🔄 Reload Page
            </ActionButton>
          </ActionGrid>

          <RouteInfo>
            <strong>Error Information:</strong><br/>
            Type: {errorType} | Severity: {severity}<br/>
            Route: {this.props.routeName} | Time: {new Date().toLocaleTimeString()}
          </RouteInfo>

          {process.env.NODE_ENV === 'development' && (
            <TechnicalDetails>
              <TechnicalSummary>
                🔧 Technical Details (Development Only)
              </TechnicalSummary>
              
              <div>
                <h4>Error Information:</h4>
                <ErrorStack>
                  <strong>Route:</strong> {this.props.routeName}
                  {'\n'}
                  <strong>Error Name:</strong> {error.name}
                  {'\n'}
                  <strong>Error Message:</strong> {error.message}
                  {'\n'}
                  <strong>Error Type:</strong> {errorType}
                  {'\n'}
                  <strong>Severity:</strong> {severity}
                  {'\n'}
                  <strong>Retry Count:</strong> {retryCount}
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
              </div>
            </TechnicalDetails>
          )}
        </RouteErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default RouteLevelErrorBoundary;
