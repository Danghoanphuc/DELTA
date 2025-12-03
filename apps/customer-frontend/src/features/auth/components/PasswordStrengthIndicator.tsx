import { cn } from "@/shared/lib/utils";
import { Check } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  code: string;
}

const requirements: PasswordRequirement[] = [
  { label: "Tối thiểu 8 ký tự", test: (p) => p.length >= 8, code: "LEN" },
  { label: "Chữ hoa", test: (p) => /[A-Z]/.test(p), code: "UPP" },
  { label: "Chữ thường", test: (p) => /[a-z]/.test(p), code: "LOW" },
  { label: "Số", test: (p) => /[0-9]/.test(p), code: "NUM" },
  {
    label: "Ký tự đặc biệt",
    test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
    code: "SYM",
  },
];

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const metRequirements = requirements.filter((req) => req.test(password));
  const strength = metRequirements.length;
  const isWeak = strength <= 2;
  const isMedium = strength > 2 && strength < 5;
  const isStrong = strength === 5;

  return (
    <div className="bg-stone-100 p-3 border border-stone-200">
      {/* Header Status */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-200">
        <span className="font-mono text-[10px] uppercase text-stone-500">
          Độ bảo mật
        </span>
        <span
          className={cn(
            "font-mono text-xs font-bold uppercase",
            isWeak && "text-red-600",
            isMedium && "text-yellow-600",
            isStrong && "text-emerald-600"
          )}
        >
          {isWeak ? "YẾU" : isMedium ? "TRUNG BÌNH" : "MẠNH"}
        </span>
      </div>

      {/* Grid Checklist */}
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req) => {
          const met = req.test(password);
          return (
            <div
              key={req.code}
              className={cn(
                "flex items-center gap-2 text-[10px] font-mono transition-colors",
                met ? "text-stone-900" : "text-stone-400 opacity-60"
              )}
            >
              <div
                className={cn(
                  "w-3 h-3 flex items-center justify-center border",
                  met
                    ? "bg-stone-900 border-stone-900 text-white"
                    : "border-stone-300 bg-white"
                )}
              >
                {met && <Check className="w-2 h-2" />}
              </div>
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress Line (Thin) */}
      <div className="w-full h-[2px] bg-stone-200 mt-3 relative">
        <div
          className={cn(
            "absolute top-0 left-0 h-full transition-all duration-500",
            isWeak
              ? "bg-red-500"
              : isMedium
              ? "bg-yellow-500"
              : "bg-emerald-600"
          )}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
