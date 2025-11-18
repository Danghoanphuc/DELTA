// src/shared/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Đã có lỗi xảy ra
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Xin lỗi, có lỗi không mong muốn xảy ra. Vui lòng thử làm mới trang hoặc liên hệ hỗ trợ nếu lỗi tiếp tục.
          </p>
          {this.state.error && (
            <details className="mb-6 text-left max-w-2xl w-full">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                Chi tiết lỗi (dành cho developers)
              </summary>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <div className="flex gap-3">
            <Button onClick={this.handleReset} variant="outline">
              Thử lại
            </Button>
            <Button onClick={() => window.location.reload()}>
              Làm mới trang
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

