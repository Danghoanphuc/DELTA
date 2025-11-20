import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ActionFeedbackProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  successMessage?: string;
  className?: string;
}

/**
 * Component hiển thị feedback cho các action nhanh (add to cart, like, etc.)
 * Thay thế toast bằng inline feedback ngắn gọn
 */
export const ActionFeedback: React.FC<ActionFeedbackProps> = ({
  isLoading = false,
  isSuccess = false,
  successMessage = 'Thành công',
  className = '',
}) => {
  if (!isLoading && !isSuccess) return null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {isLoading && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-600">Đang xử lý...</span>
        </>
      )}

      {isSuccess && !isLoading && (
        <div className="flex items-center gap-2 text-green-600 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}
    </div>
  );
};

