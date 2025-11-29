// apps/customer-frontend/src/features/customer/components/AddressForm/PersonalInfoFields.tsx
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/shared/components/ui/form";
import { FloatingLabelInput } from "@/shared/components/ui/floating-label-input";
import { User, Phone } from "lucide-react";
import { formatPhoneNumber, formatName } from "../../utils/formatters";

interface PersonalInfoFieldsProps {
  isFieldValid: (fieldName: string) => boolean;
}

export const PersonalInfoFields = ({
  isFieldValid,
}: PersonalInfoFieldsProps) => {
  const form = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Full Name */}
      <FormField
        control={form.control}
        name="shippingAddress.fullName"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <FloatingLabelInput
                label="Họ và tên người nhận"
                icon={<User className="w-4 h-4" />}
                error={fieldState.error?.message}
                isSuccess={isFieldValid("shippingAddress.fullName")}
                formatter={formatName}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Phone */}
      <FormField
        control={form.control}
        name="shippingAddress.phone"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <FloatingLabelInput
                label="Số điện thoại liên hệ"
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                error={fieldState.error?.message}
                isSuccess={isFieldValid("shippingAddress.phone")}
                formatter={formatPhoneNumber}
                maxLength={13}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
