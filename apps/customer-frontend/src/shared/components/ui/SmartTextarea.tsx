// apps/customer-frontend/src/shared/components/ui/SmartTextarea.tsx
// ✨ SMART PIPELINE: AI-powered Textarea

import { useState } from "react";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";
import { cn } from "@/shared/lib/utils";

interface SmartTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  // AI context
  productName?: string;
  category?: string;
  assetName?: string;
  intent?: "description" | "seo-title";
  // UI
  showAIButton?: boolean;
  minRows?: number;
  maxRows?: number;
}

/**
 * ✨ SMART TEXTAREA
 * - "✨ Ask Zin" button
 * - AI generation (one-shot hoặc streaming)
 * - Loading state
 * - Error handling
 */
export function SmartTextarea({
  value,
  onChange,
  placeholder = "Nhập mô tả...",
  className,
  disabled = false,
  productName,
  category,
  assetName,
  intent = "description",
  showAIButton = true,
  minRows = 4,
  maxRows = 12,
}: SmartTextareaProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Handle AI generation (one-shot)
   */
  const handleAskZin = async () => {
    if (!productName) {
      toast.error("Vui lòng nhập tên sản phẩm trước khi dùng AI");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await api.post("/ai/generate-text", {
        intent,
        context: {
          productName,
          category: category || "Sản phẩm in ấn",
          assetName: assetName || "",
        },
      });

      const generated = res.data.data.generated;
      onChange(generated);
      toast.success("✨ Zin đã tạo nội dung cho bạn!");
    } catch (error: any) {
      console.error("[AI] Generation failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể tạo nội dung. Vui lòng thử lại."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle regenerate (nếu đã có nội dung)
   */
  const handleRegenerate = async () => {
    if (!productName) {
      toast.error("Vui lòng nhập tên sản phẩm trước");
      return;
    }

    const confirmed = window.confirm(
      "Bạn có chắc muốn tạo lại nội dung? Nội dung hiện tại sẽ bị thay thế."
    );
    if (!confirmed) return;

    await handleAskZin();
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("min-h-[100px] resize-y", className)}
          disabled={disabled || isGenerating}
          rows={minRows}
        />

        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {value.length} ký tự
        </div>
      </div>

      {/* AI Buttons */}
      {showAIButton && (
        <div className="flex items-center gap-2">
          {!value ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAskZin}
              disabled={isGenerating || disabled}
              className="gap-2"
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
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating || disabled}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Tạo lại bằng AI
                </>
              )}
            </Button>
          )}

          {isGenerating && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Zin đang viết cho bạn...
            </span>
          )}
        </div>
      )}

      {/* Hint */}
      {showAIButton && !value && !isGenerating && (
        <p className="text-xs text-muted-foreground">
          💡 Tip: Nhấn "Ask Zin" để AI tự động viết mô tả chuyên nghiệp cho bạn
        </p>
      )}
    </div>
  );
}

