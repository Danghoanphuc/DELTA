import { UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { AuthFlowValues } from "../utils/auth-helpers";
import { AUTH_STYLES } from "../utils/auth-styles";

interface NameFormProps {
  form: UseFormReturn<AuthFlowValues>;
  isLoading: boolean;
  onSubmit: () => void;
}

export function NameForm({ form, isLoading, onSubmit }: NameFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {/* Họ */}
        <div>
          <label className={AUTH_STYLES.label}>Họ</label>
          <Input
            type="text"
            placeholder="Ví dụ: Nguyễn"
            {...register("firstName")}
            className={AUTH_STYLES.input(!!errors.firstName)}
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* Tên */}
        <div>
          <label className={AUTH_STYLES.label}>Tên</label>
          <Input
            type="text"
            placeholder="Ví dụ: Văn A"
            {...register("lastName")}
            className={AUTH_STYLES.input(!!errors.lastName)}
            disabled={isLoading}
          />
        </div>
      </div>

      <Button
        type="button"
        className={AUTH_STYLES.button("secondary")}
        onClick={onSubmit}
        disabled={isLoading}
      >
        TIẾP TỤC BẢO MẬT <span className="ml-2">→</span>
      </Button>
    </div>
  );
}
