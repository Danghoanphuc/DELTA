// apps/customer-frontend/src/features/auth/components/NameForm.tsx
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { User } from "lucide-react";
import type { AuthFlowValues } from "../utils/auth-helpers";
import { getInputStyle, getBtnStyle } from "./EmailForm"; // ✅ Import

interface NameFormProps {
  form: UseFormReturn<AuthFlowValues>;
  isLoading: boolean;
  onSubmit: () => void;
}

export function NameForm({ form, isLoading, onSubmit }: NameFormProps) {
  const { register } = form;
  const isSignIn = false; // NameForm chỉ dùng cho Sign Up -> luôn là màu cam

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {/* First Name */}
        <div className="group relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <User className="w-4 h-4" />
          </div>
          <Input
            type="text"
            placeholder="Tên (First Name)"
            {...register("firstName")}
            className={getInputStyle(isSignIn)}
            disabled={isLoading}
            autoFocus
          />
          <div className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-orange-500 transition-all duration-500 group-focus-within:w-full" />
        </div>

        {/* Last Name */}
        <div className="group relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <User className="w-4 h-4 opacity-0" />
          </div>
          <Input
            type="text"
            placeholder="Họ (Last Name)"
            {...register("lastName")}
            className={getInputStyle(isSignIn)}
            disabled={isLoading}
          />
          <div className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-orange-500 transition-all duration-500 group-focus-within:w-full" />
        </div>
      </div>

      <Button
        type="button"
        className={`${getBtnStyle(isSignIn)} mt-2`}
        onClick={onSubmit}
        disabled={isLoading}
      >
        TIẾP TỤC <span className="ml-1">→</span>
      </Button>
    </div>
  );
}