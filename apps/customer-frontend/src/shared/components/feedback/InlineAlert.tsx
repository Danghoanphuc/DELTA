import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface InlineAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  type,
  message,
  description,
  onClose,
  className = '',
}) => {
  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      text: 'text-green-800',
      subtext: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      text: 'text-red-800',
      subtext: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      text: 'text-yellow-800',
      subtext: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      text: 'text-blue-800',
      subtext: 'text-blue-700',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border rounded-lg p-4 ${className} animate-in fade-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${style.text}`}>{message}</p>
          {description && (
            <p className={`mt-1 text-sm ${style.subtext}`}>{description}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

