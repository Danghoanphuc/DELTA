// apps/customer-frontend/src/features/auth/components/PasswordStrengthIndicator.tsx
// ✅ NEW: Visual password strength indicator

import { cn } from "@/shared/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: "Ít nhất 8 ký tự", test: (p) => p.length >= 8 },
  { label: "Có chữ hoa (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Có chữ thường (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "Có số (0-9)", test: (p) => /[0-9]/.test(p) },
  {
    label: "Có ký tự đặc biệt (!@#$...)",
    test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
  },
];

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const metRequirements = requirements.filter((req) => req.test(password));
  const strength = metRequirements.length;
  const percentage = (strength / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-orange-500";
    if (strength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return "Yếu";
    if (strength <= 3) return "Trung bình";
    if (strength <= 4) return "Khá";
    return "Mạnh";
  };

  return (
    <div className="space-y-2 text-sm">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              getStrengthColor()
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span
          className={cn("text-xs font-bold", {
            "text-red-600": strength <= 2,
            "text-orange-600": strength === 3,
            "text-yellow-600": strength === 4,
            "text-green-600": strength === 5,
          })}
        >
          {getStrengthLabel()}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {requirements.map((req, index) => {
          const met = req.test(password);
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                {
                  "text-green-600": met,
                  "text-gray-400": !met,
                }
              )}
            >
              <span
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                  {
                    "bg-green-100": met,
                    "bg-gray-100": !met,
                  }
                )}
              >
                {met ? "✓" : "○"}
              </span>
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
