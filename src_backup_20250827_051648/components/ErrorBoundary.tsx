import { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 15px;
  margin: 1rem;
  color: white;
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
`;

const ErrorDetails = styled.details`
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  max-width: 800px;
  width: 100%;
`;

const ErrorStack = styled.pre`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const RetryButton = styled.button`
  background: linear-gradient(45deg, #00d4ff, #4ecdc4);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    // Log to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with Sentry, LogRocket, etc. here
      logger.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorTitle>🚨 Something went wrong</ErrorTitle>
          <ErrorMessage>
            We encountered an unexpected error while rendering this component. 
            This might be due to a 3D visualization issue, WebAssembly loading problem, 
            or a network connectivity issue.
          </ErrorMessage>
          
          <RetryButton onClick={this.handleRetry}>
            🔄 Try Again
          </RetryButton>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                🔍 Developer Information (Click to expand)
              </summary>
              <ErrorStack>
                <strong>Error:</strong> {this.state.error.message}
                {'\n\n'}
                <strong>Stack Trace:</strong>
                {'\n'}
                {this.state.error.stack}
                {this.state.errorInfo && (
                  <>
                    {'\n\n'}
                    <strong>Component Stack:</strong>
                    {'\n'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </ErrorStack>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
