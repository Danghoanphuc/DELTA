// apps/customer-frontend/src/shared/components/ui/SmartTagInput.tsx
// ✨ SMART PIPELINE: AI-powered Tag Input

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Sparkles, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { cn } from "@/shared/lib/utils";

interface SmartTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  // AI context
  productName?: string;
  category?: string;
  // UI
  showAIButton?: boolean;
}

/**
 * ✨ SMART TAG INPUT
 * - AI tag suggestions
 * - Add/remove tags
 * - Max 10 tags
 */
export function SmartTagInput({
  tags,
  onChange,
  maxTags = 10,
  placeholder = "Nhập tag và nhấn Enter...",
  className,
  disabled = false,
  productName,
  category,
  showAIButton = true,
}: SmartTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Handle add tag manually
   */
  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;

    if (tags.length >= maxTags) {
      toast.error(`Tối đa ${maxTags} tags`);
      return;
    }

    if (tags.includes(trimmed)) {
      toast.error("Tag đã tồn tại");
      return;
    }

    onChange([...tags, trimmed]);
    setInputValue("");
  };

  /**
   * Handle remove tag
   */
  const handleRemoveTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  /**
   * Handle Enter key
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag if input is empty
      handleRemoveTag(tags.length - 1);
    }
  };

  /**
   * Handle AI generation
   */
  const handleGenerateTags = async () => {
    if (!productName) {
      toast.error("Vui lòng nhập tên sản phẩm trước khi dùng AI");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await api.post("/ai/generate-text", {
        intent: "tags",
        context: {
          productName,
          category: category || "Sản phẩm in ấn",
        },
      });

      const generatedTags: string[] = res.data.data.generated;

      // Merge với tags hiện tại (không duplicate)
      const uniqueTags = [...new Set([...tags, ...generatedTags])].slice(
        0,
        maxTags
      );

      onChange(uniqueTags);
      toast.success(`✨ Zin đã tạo ${generatedTags.length} tags cho bạn!`);
    } catch (error: any) {
      console.error("[AI] Tag generation failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể tạo tags. Vui lòng thử lại."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Tags display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="gap-1 pl-3 pr-1 py-1"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveTag(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isGenerating || tags.length >= maxTags}
          className="flex-1"
        />

        {showAIButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateTags}
            disabled={isGenerating || disabled}
            className="gap-2 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                ✨ Ask Zin
              </>
            )}
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {tags.length}/{maxTags} tags
        </span>
        {showAIButton && tags.length === 0 && !isGenerating && (
          <span className="text-xs">
            💡 Tip: Nhấn "Ask Zin" để AI tự động tạo tags
          </span>
        )}
      </div>
    </div>
  );
}

