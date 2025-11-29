import React, { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Check, AlertCircle, X } from "lucide-react";

interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  isSuccess?: boolean; // Mới: Trạng thái thành công
  formatter?: (value: string) => string; // Mới: Hàm format dữ liệu
}

const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(
  (
    {
      className,
      label,
      icon,
      error,
      isSuccess,
      id,
      onChange,
      formatter,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || `floating-input-${Math.random().toString(36).substr(2, 9)}`;
    const [internalValue, setInternalValue] = useState(
      props.defaultValue || props.value || ""
    );

    // Handler thông minh: Vừa format vừa trigger onChange gốc
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawValue = e.target.value;

      // Nếu có formatter, xử lý value trước khi hiển thị
      if (formatter) {
        rawValue = formatter(rawValue);
      }

      setInternalValue(rawValue);
      e.target.value = rawValue; // Cập nhật lại value trong event để react-hook-form nhận đúng
      onChange?.(e); // Gọi hàm onChange gốc của React Hook Form
    };

    return (
      <div className="relative group">
        <div className="relative">
          <input
            {...props}
            ref={ref}
            id={inputId}
            placeholder=" "
            onChange={handleChange}
            className={cn(
              "peer block w-full rounded-xl border-2 bg-white px-4 pb-3 pt-6 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Logic Border: Error (Đỏ) -> Success (Xanh lá) -> Default (Xám/Xanh dương)
              error
                ? "border-red-100 bg-red-50/30 focus:border-red-500 focus:ring-0"
                : isSuccess
                ? "border-green-100 bg-green-50/30 focus:border-green-500 focus:ring-0"
                : "border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
              icon ? "pl-11" : "",
              className
            )}
          />

          {/* Label Animation */}
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-gray-500 duration-200 cursor-text bg-transparent font-medium",
              "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2",
              "peer-focus:top-4 peer-focus:-translate-y-3 peer-focus:scale-75",
              // Màu Label đổi theo trạng thái
              error
                ? "text-red-500 peer-focus:text-red-500"
                : isSuccess
                ? "text-green-600 peer-focus:text-green-600"
                : "peer-focus:text-blue-600",
              icon ? "left-11" : ""
            )}
          >
            {label}
          </label>

          {/* Start Icon (User, Phone...) */}
          {icon && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none",
                error
                  ? "text-red-400"
                  : isSuccess
                  ? "text-green-500"
                  : "text-gray-400 peer-focus:text-blue-500"
              )}
            >
              {icon}
            </div>
          )}

          {/* End Icon (Feedback Status: Check/X) - CỰC QUAN TRỌNG */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 scale-0 peer-focus:scale-100 peer-[&:not(:placeholder-shown)]:scale-100">
            {error ? (
              <div className="bg-red-100 text-red-500 rounded-full p-1 animate-in zoom-in spin-in-180">
                <X size={14} strokeWidth={3} />
              </div>
            ) : isSuccess ? (
              <div className="bg-green-100 text-green-600 rounded-full p-1 animate-in zoom-in">
                <Check size={14} strokeWidth={3} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Error Message with Animation */}
        {error && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500 animate-in slide-in-from-top-1 fade-in">
            <AlertCircle size={12} />
            {error}
          </div>
        )}
      </div>
    );
  }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
