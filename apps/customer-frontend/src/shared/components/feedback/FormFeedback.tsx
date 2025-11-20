import React from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface FormFeedbackProps {
  state: 'idle' | 'loading' | 'success' | 'error';
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  className?: string;
}

export const FormFeedback: React.FC<FormFeedbackProps> = ({
  state,
  successMessage = 'Thành công!',
  errorMessage = 'Có lỗi xảy ra',
  loadingMessage = 'Đang xử lý...',
  className = '',
}) => {
  if (state === 'idle') return null;

  return (
    <div className={`mt-4 ${className}`}>
      {state === 'loading' && (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">{loadingMessage}</span>
        </div>
      )}

      {state === 'success' && (
        <div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {state === 'error' && (
        <div className="flex items-center gap-2 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
          <XCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

