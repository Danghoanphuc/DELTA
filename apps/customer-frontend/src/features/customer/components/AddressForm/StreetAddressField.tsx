// apps/customer-frontend/src/features/customer/components/AddressForm/StreetAddressField.tsx
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/shared/components/ui/form";
import { FloatingLabelInput } from "@/shared/components/ui/floating-label-input";
import { Home } from "lucide-react";

interface StreetAddressFieldProps {
  isFieldValid: (fieldName: string) => boolean;
}

export const StreetAddressField = ({
  isFieldValid,
}: StreetAddressFieldProps) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="shippingAddress.street"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormControl>
            <FloatingLabelInput
              label="Số nhà, tên đường cụ thể"
              icon={<Home className="w-4 h-4" />}
              error={fieldState.error?.message}
              isSuccess={isFieldValid("shippingAddress.street")}
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
