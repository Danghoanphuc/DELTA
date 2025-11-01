// frontend/src/features/editor/components/EditorErrorBoundary.tsx
// ✅ ERROR BOUNDARY - Catch and handle errors gracefully

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { toast } from "sonner";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Copy,
  CheckCircle,
} from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error("Editor Error Boundary caught an error:", error, errorInfo);

    // Update state
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error tracking service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);

    // Show toast notification
    toast.error("Đã xảy ra lỗi trong trình chỉnh sửa", {
      description: "Vui lòng thử tải lại trang",
      duration: 5000,
    });
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Implement error logging service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    // For now, just log to console
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log("Error Report:", errorReport);

    // You can send this to your backend
    // fetch('/api/error-log', {
    //   method: 'POST',
    //   body: JSON.stringify(errorReport),
    // });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}

Timestamp: ${new Date().toISOString()}
Browser: ${navigator.userAgent}
URL: ${window.location.href}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      toast.success("Error details copied to clipboard");
    });
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Oops! Something went wrong
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    The editor encountered an unexpected error
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error count warning */}
              {errorCount > 1 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Multiple errors detected</AlertTitle>
                  <AlertDescription>
                    This error has occurred {errorCount} times. Consider
                    reloading the page.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error details */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Bug size={16} />
                  Error Details
                </h4>
                <p className="text-sm text-red-700 font-mono mb-2">
                  {error?.message}
                </p>
                {error?.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-32 p-2 bg-white rounded">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Component stack (for developers) */}
              {errorInfo?.componentStack && (
                <details className="p-4 bg-gray-100 rounded-lg">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800 font-medium">
                    Component stack (for developers)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-32">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  variant="secondary"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home size={16} className="mr-2" />
                  Go Home
                </Button>
                <Button
                  onClick={this.handleCopyError}
                  variant="outline"
                  size="icon"
                  title="Copy error details"
                >
                  <Copy size={16} />
                </Button>
              </div>

              {/* Help text */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Need help?</AlertTitle>
                <AlertDescription>
                  If this error persists:
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li>Try clearing your browser cache</li>
                    <li>Check your internet connection</li>
                    <li>Update your browser to the latest version</li>
                    <li>Contact support with the error details above</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Simple wrapper component for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) => {
  const WrappedComponent = (props: P) => (
    <EditorErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EditorErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};

// Hook to manually trigger error boundary (for async errors)
export const useErrorHandler = () => {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};
