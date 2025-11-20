// src/features/printer/components/form-fields/RadioGroupField.tsx
// Radio group field với descriptions

import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupFieldProps {
  name: string;
  label: string;
  options: RadioOption[];
}

export function RadioGroupField({
  name,
  label,
  options,
}: RadioGroupFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="space-y-3"
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex-1">
                    <Label
                      htmlFor={option.value}
                      className="font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    {option.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

