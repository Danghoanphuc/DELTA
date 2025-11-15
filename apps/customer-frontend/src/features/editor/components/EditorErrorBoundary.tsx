// src/features/editor/components/EditorErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error để debug
    console.error("❌ [EditorErrorBoundary] Uncaught error in editor:", error);
    console.error("Error Info:", errorInfo);
    
    // TODO: Có thể gửi error đến error tracking service (Sentry, etc.)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleGoToShop = () => {
    window.location.href = "/shop";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          onGoBack={this.handleGoBack}
          onGoToShop={this.handleGoToShop}
        />
      );
    }

    return this.props.children;
  }
}

// ✅ Component Fallback UI đẹp hơn
function ErrorFallback({
  error,
  onReset,
  onGoBack,
  onGoToShop,
}: {
  error: Error | null;
  onReset: () => void;
  onGoBack: () => void;
  onGoToShop: () => void;
}) {

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Đã xảy ra lỗi trong trình chỉnh sửa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Trình chỉnh sửa 3D gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay lại trang sản phẩm.
          </p>
          
          {error && (
            <details className="rounded-md bg-gray-100 p-3 text-xs">
              <summary className="cursor-pointer font-medium text-gray-700">
                Chi tiết lỗi (dành cho kỹ thuật)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-gray-600">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={onReset} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
            <Button onClick={onGoBack} className="w-full" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại trang trước
            </Button>
            <Button onClick={onGoToShop} className="w-full" variant="ghost">
              Về trang cửa hàng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
