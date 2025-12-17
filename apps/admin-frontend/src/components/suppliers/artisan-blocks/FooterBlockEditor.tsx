// apps/admin-frontend/src/components/suppliers/artisan-blocks/FooterBlockEditor.tsx
// Footer Block - Conversion CTAs

import { FooterBlock, BLOCK_LIMITS } from "@/types/artisan-block.types";
import {
  MousePointerClick,
  Download,
  ExternalLink,
  MessageCircle,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";

interface FooterBlockEditorProps {
  block: FooterBlock;
  onChange: (block: FooterBlock) => void;
  defaultCuratorName?: string;
}

const PRIMARY_ICONS = [
  { value: "download", label: "Download", icon: Download },
  { value: "external", label: "External Link", icon: ExternalLink },
];

const SECONDARY_ICONS = [
  { value: "chat", label: "Chat", icon: MessageCircle },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
];

export function FooterBlockEditor({
  block,
  onChange,
  defaultCuratorName,
}: FooterBlockEditorProps) {
  const { curatorQuote, curatorName, primaryCta, secondaryCta } = block.data;

  const updateData = (updates: Partial<FooterBlock["data"]>) => {
    onChange({ ...block, data: { ...block.data, ...updates } });
  };

  const updatePrimaryCta = (
    updates: Partial<NonNullable<FooterBlock["data"]["primaryCta"]>>
  ) => {
    updateData({
      primaryCta: { ...primaryCta, label: "", url: "", ...updates },
    });
  };

  const updateSecondaryCta = (
    updates: Partial<NonNullable<FooterBlock["data"]["secondaryCta"]>>
  ) => {
    updateData({
      secondaryCta: { ...secondaryCta, label: "", url: "", ...updates },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-700">
        <MousePointerClick className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          Footer (Chuyển đổi)
        </span>
      </div>

      {/* Curator Quote */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Lời kết từ Giám tuyển
        </label>
        <textarea
          value={curatorQuote || ""}
          onChange={(e) =>
            updateData({
              curatorQuote: e.target.value.slice(
                0,
                BLOCK_LIMITS.QUOTE_MAX_CHARS
              ),
            })
          }
          placeholder="Một câu kết ấn tượng từ giám tuyển..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none italic"
        />
        <div className="flex justify-between items-center mt-1">
          <input
            type="text"
            value={curatorName || defaultCuratorName || ""}
            onChange={(e) => updateData({ curatorName: e.target.value })}
            placeholder="Tên giám tuyển"
            className="px-2 py-1 border-b border-gray-200 text-xs focus:outline-none focus:border-amber-400 bg-transparent"
          />
          <span className="text-[10px] text-gray-400">
            {(curatorQuote || "").length}/{BLOCK_LIMITS.QUOTE_MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
        <label className="text-xs font-semibold text-orange-800 block">
          Primary CTA
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">
              Label
            </label>
            <input
              type="text"
              value={primaryCta?.label || ""}
              onChange={(e) => updatePrimaryCta({ label: e.target.value })}
              placeholder="Download Catalogue"
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Icon</label>
            <div className="flex gap-1">
              {PRIMARY_ICONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    updatePrimaryCta({ icon: value as "download" | "external" })
                  }
                  className={`flex-1 p-2 rounded border transition-all ${
                    primaryCta?.icon === value
                      ? "border-orange-500 bg-orange-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4 mx-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 mb-1 block">URL</label>
          <input
            type="text"
            value={primaryCta?.url || ""}
            onChange={(e) => updatePrimaryCta({ url: e.target.value })}
            placeholder="https://... hoặc /path/to/file.pdf"
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Secondary CTA */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
        <label className="text-xs font-semibold text-gray-700 block">
          Secondary CTA (tùy chọn)
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">
              Label
            </label>
            <input
              type="text"
              value={secondaryCta?.label || ""}
              onChange={(e) => updateSecondaryCta({ label: e.target.value })}
              placeholder="Liên hệ Giám tuyển"
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Icon</label>
            <div className="flex gap-1">
              {SECONDARY_ICONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    updateSecondaryCta({
                      icon: value as "chat" | "phone" | "email",
                    })
                  }
                  className={`flex-1 p-2 rounded border transition-all ${
                    secondaryCta?.icon === value
                      ? "border-gray-500 bg-gray-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4 mx-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 mb-1 block">URL</label>
          <input
            type="text"
            value={secondaryCta?.url || ""}
            onChange={(e) => updateSecondaryCta({ url: e.target.value })}
            placeholder="https://zalo.me/... hoặc tel:..."
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
      </div>

      {/* Hint */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-xs text-green-700">
          🎯 Footer block là điểm chuyển đổi. Primary CTA nên là hành động chính
          (download catalogue), Secondary là liên hệ trực tiếp.
        </p>
      </div>
    </div>
  );
}
