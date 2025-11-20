// src/features/printer/components/form-fields/TagInputField.tsx
// Tag input field với suggestions

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { X, Plus } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

interface TagInputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  suggestions?: string[];
  description?: string;
}

export function TagInputField({
  name,
  label,
  placeholder,
  suggestions = [],
  description,
}: TagInputFieldProps) {
  const form = useFormContext();
  const [inputValue, setInputValue] = useState("");

  const currentTags = form.watch(name) || [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (currentTags.includes(trimmed)) return;

    form.setValue(name, [...currentTags, trimmed]);
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue(
      name,
      currentTags.filter((tag: string) => tag !== tagToRemove)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-3">
              {/* Current tags */}
              {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentTags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addTag(inputValue)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestions
                    .filter((s) => !currentTags.includes(s))
                    .map((suggestion) => (
                      <Button
                        key={suggestion}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addTag(suggestion)}
                        className="h-7 text-xs"
                      >
                        + {suggestion}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

