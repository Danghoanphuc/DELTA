// apps/admin-frontend/src/components/suppliers/artisan-blocks/CuratorNoteEditor.tsx
// Curator Note - Yellow box for author's personal opinion/commentary

import { CuratorNoteBlock, BLOCK_LIMITS } from "@/types/artisan-block.types";
import { MessageSquareQuote, User } from "lucide-react";

interface CuratorNoteEditorProps {
  block: CuratorNoteBlock;
  onChange: (block: CuratorNoteBlock) => void;
  defaultAuthorName?: string;
}

export function CuratorNoteEditor({
  block,
  onChange,
  defaultAuthorName,
}: CuratorNoteEditorProps) {
  const note = block.content.note || "";
  const charCount = note.length;
  const isOverLimit = charCount > BLOCK_LIMITS.CURATOR_NOTE_MAX_CHARS;

  const handleNoteChange = (newNote: string) => {
    onChange({
      ...block,
      content: { ...block.content, note: newNote },
    });
  };

  const handleAuthorChange = (authorName: string) => {
    onChange({
      ...block,
      content: { ...block.content, authorName },
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-amber-700">
        <MessageSquareQuote className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          Góc Giám Tuyển
        </span>
      </div>

      {/* Note Content - Yellow themed */}
      <div className="relative">
        <textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Chia sẻ quan điểm cá nhân, góc nhìn chuyên gia về sản phẩm/chủ đề này..."
          rows={4}
          className={`w-full px-4 py-3 bg-amber-50 border-2 rounded-lg text-sm resize-none focus:outline-none transition-all ${
            isOverLimit
              ? "border-red-300 focus:border-red-500"
              : "border-amber-200 focus:border-amber-400"
          }`}
          style={{ fontStyle: "italic" }}
        />

        {/* Character Counter */}
        <div className="absolute bottom-2 right-2">
          <span
            className={`text-xs ${
              isOverLimit ? "text-red-500 font-medium" : "text-amber-600"
            }`}
          >
            {charCount}/{BLOCK_LIMITS.CURATOR_NOTE_MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Author Attribution */}
      <div className="flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={block.content.authorName || defaultAuthorName || ""}
          onChange={(e) => handleAuthorChange(e.target.value)}
          placeholder="Tên người viết..."
          className="flex-1 px-2 py-1 bg-transparent border-b border-gray-200 text-xs focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Preview hint */}
      <div className="bg-amber-100/50 border border-amber-200 rounded p-2">
        <p className="text-[10px] text-amber-700">
          💡 Box này sẽ hiển thị nổi bật với nền vàng, giúp người đọc phân biệt
          quan điểm cá nhân với thông tin khách quan.
        </p>
      </div>
    </div>
  );
}
