import React from 'react';
import { Loader2 } from 'lucide-react';

interface CheckoutLoadingOverlayProps {
  isVisible: boolean;
  message: string;
  submessage?: string;
}

export const CheckoutLoadingOverlay: React.FC<CheckoutLoadingOverlayProps> = ({
  isVisible,
  message,
  submessage,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Animated loader */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          
          {/* Main message */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">{message}</h3>
            {submessage && (
              <p className="text-sm text-gray-600">{submessage}</p>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

