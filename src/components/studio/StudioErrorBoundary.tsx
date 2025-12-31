/**
 * Studio Error Boundary
 * 
 * Catches and handles errors in the Studio canvas and related components,
 * preventing complete page crashes and providing recovery options.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
  showReportButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

const MAX_RETRIES = 3;

export class StudioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error details for debugging
    console.error('[StudioErrorBoundary] Caught error:', error);
    console.error('[StudioErrorBoundary] Component stack:', errorInfo.componentStack);
    
    // Send to error tracking service (if available)
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo): void {
    // In production, send to error tracking service
    if (typeof window !== 'undefined' && import.meta.env.PROD) {
      // Example: Send to Sentry, LogRocket, etc.
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };
      
      console.log('[StudioErrorBoundary] Error report:', errorReport);
      // fetch('/api/error-report', { method: 'POST', body: JSON.stringify(errorReport) });
    }
  }

  private handleReset = (): void => {
    const { retryCount } = this.state;
    const { onReset } = this.props;
    
    if (retryCount < MAX_RETRIES) {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        retryCount: retryCount + 1 
      });
      onReset?.();
    }
  };

  private handleGoHome = (): void => {
    window.location.href = '/home';
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private copyErrorDetails = (): void => {
    const { error, errorInfo } = this.state;
    const details = `
Error: ${error?.message}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}

URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();
    
    navigator.clipboard.writeText(details);
  };

  render(): ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { children, fallbackTitle, fallbackDescription, showReportButton = true } = this.props;

    if (hasError) {
      const canRetry = retryCount < MAX_RETRIES;
      const isReactFlowError = error?.message?.includes('ReactFlow') || 
                               error?.stack?.includes('ReactFlow') ||
                               error?.stack?.includes('@xyflow');

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8 bg-background">
          <Card className="max-w-lg w-full border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-destructive">
                    {fallbackTitle || 'Something went wrong'}
                  </CardTitle>
                  <CardDescription>
                    {fallbackDescription || 'The studio encountered an error'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error type hint */}
              {isReactFlowError && (
                <div className="p-3 bg-amber-500/10 rounded-lg text-sm text-amber-600 dark:text-amber-400">
                  This appears to be a canvas rendering error. Try refreshing the page.
                </div>
              )}
              
              {/* Error message */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {error?.message || 'Unknown error'}
                </p>
              </div>
              
              {/* Retry count */}
              {retryCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Retry attempts: {retryCount} / {MAX_RETRIES}
                </p>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-wrap gap-2">
              {canRetry && (
                <Button 
                  onClick={this.handleReset} 
                  variant="default"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              )}
              
              <Button 
                onClick={this.handleReload} 
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              
              <Button 
                onClick={this.handleGoHome} 
                variant="outline"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
              
              {showReportButton && (
                <Button 
                  onClick={this.copyErrorDetails} 
                  variant="ghost"
                  size="sm"
                  className="gap-2 ml-auto"
                >
                  <Bug className="w-4 h-4" />
                  Copy Error Details
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook to use error boundary state in functional components
 * (for triggering errors programmatically)
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);
  
  if (error) {
    throw error;
  }
  
  return {
    showBoundary: (error: Error) => setError(error),
    resetBoundary: () => setError(null),
  };
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => (
    <StudioErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </StudioErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

export default StudioErrorBoundary;
