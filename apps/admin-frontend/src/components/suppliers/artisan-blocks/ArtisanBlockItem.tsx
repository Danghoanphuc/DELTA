// apps/admin-frontend/src/components/suppliers/artisan-blocks/ArtisanBlockItem.tsx
// Single block wrapper with drag handle, type indicator, and delete button

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArtisanBlock,
  TextBlock,
  MediaBlock,
  CuratorNoteBlock,
  ComparisonTableBlock,
  HeroBlock,
  StoryBlock,
  InteractiveBlock,
  ArtifactBlock,
  FooterBlock,
  BlockType,
} from "@/types/artisan-block.types";
import { TextBlockEditor } from "./TextBlockEditor";
import { MediaBlockEditor } from "./MediaBlockEditor";
import { CuratorNoteEditor } from "./CuratorNoteEditor";
import { ComparisonTableEditor } from "./ComparisonTableEditor";
import { HeroBlockEditor } from "./HeroBlockEditor";
import { StoryBlockEditor } from "./StoryBlockEditor";
import { InteractiveBlockEditor } from "./InteractiveBlockEditor";
import { ArtifactBlockEditor } from "./ArtifactBlockEditor";
import { FooterBlockEditor } from "./FooterBlockEditor";
import {
  GripVertical,
  Trash2,
  Type,
  Image,
  MessageSquareQuote,
  Table,
  ChevronUp,
  ChevronDown,
  Film,
  BookOpen,
  Sparkles,
  Package,
  MousePointerClick,
} from "lucide-react";

interface ArtisanBlockItemProps {
  block: ArtisanBlock;
  onChange: (block: ArtisanBlock) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  defaultAuthorName?: string;
  onFileUpload?: (file: File) => Promise<{ preview: string }>;
}

const BLOCK_ICONS: Record<BlockType, any> = {
  // New blocks
  hero: Film,
  story: BookOpen,
  interactive: Sparkles,
  artifact: Package,
  footer: MousePointerClick,
  // Legacy blocks
  text: Type,
  media: Image,
  curator_note: MessageSquareQuote,
  comparison_table: Table,
};

const BLOCK_LABELS: Record<BlockType, string> = {
  // New blocks
  hero: "Hero",
  story: "Story",
  interactive: "Interactive",
  artifact: "Artifact",
  footer: "Footer",
  // Legacy blocks
  text: "Văn bản",
  media: "Media",
  curator_note: "Góc Giám Tuyển",
  comparison_table: "Bảng So Sánh",
};

const BLOCK_COLORS: Record<BlockType, string> = {
  // New blocks
  hero: "border-l-rose-500",
  story: "border-l-indigo-500",
  interactive: "border-l-cyan-500",
  artifact: "border-l-emerald-500",
  footer: "border-l-orange-500",
  // Legacy blocks
  text: "border-l-blue-400",
  media: "border-l-green-400",
  curator_note: "border-l-amber-400",
  comparison_table: "border-l-purple-400",
};

export function ArtisanBlockItem({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  defaultAuthorName,
  onFileUpload,
}: ArtisanBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = BLOCK_ICONS[block.type] || Type;
  const label = BLOCK_LABELS[block.type] || block.type;
  const colorClass = BLOCK_COLORS[block.type] || "border-l-gray-400";

  const renderEditor = () => {
    switch (block.type) {
      // New blocks
      case "hero":
        return (
          <HeroBlockEditor
            block={block as HeroBlock}
            onChange={(updated) => onChange(updated)}
            onFileUpload={onFileUpload}
          />
        );
      case "story":
        return (
          <StoryBlockEditor
            block={block as StoryBlock}
            onChange={(updated) => onChange(updated)}
          />
        );
      case "interactive":
        return (
          <InteractiveBlockEditor
            block={block as InteractiveBlock}
            onChange={(updated) => onChange(updated)}
            onFileUpload={onFileUpload}
          />
        );
      case "artifact":
        return (
          <ArtifactBlockEditor
            block={block as ArtifactBlock}
            onChange={(updated) => onChange(updated)}
            onFileUpload={onFileUpload}
          />
        );
      case "footer":
        return (
          <FooterBlockEditor
            block={block as FooterBlock}
            onChange={(updated) => onChange(updated)}
            defaultCuratorName={defaultAuthorName}
          />
        );
      // Legacy blocks
      case "text":
        return (
          <TextBlockEditor
            block={block as TextBlock}
            onChange={(updated) => onChange(updated)}
          />
        );
      case "media":
        return (
          <MediaBlockEditor
            block={block as MediaBlock}
            onChange={(updated) => onChange(updated)}
            onFileUpload={onFileUpload}
          />
        );
      case "curator_note":
        return (
          <CuratorNoteEditor
            block={block as CuratorNoteBlock}
            onChange={(updated) => onChange(updated)}
            defaultAuthorName={defaultAuthorName}
          />
        );
      case "comparison_table":
        return (
          <ComparisonTableEditor
            block={block as ComparisonTableBlock}
            onChange={(updated) => onChange(updated)}
          />
        );
      default: {
        const _exhaustiveCheck: never = block;
        return (
          <div className="text-gray-500 text-sm">
            Unknown block type: {(_exhaustiveCheck as ArtisanBlock).type}
          </div>
        );
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-lg border-l-4 shadow-sm transition-all ${colorClass} ${
        isDragging ? "opacity-50 shadow-lg scale-[1.02]" : "hover:shadow-md"
      }`}
    >
      {/* Block Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
        {/* Drag Handle */}
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Block Type Indicator */}
        <div className="flex items-center gap-1.5 flex-1">
          <Icon className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">{label}</span>
          <span className="text-[10px] text-gray-400">#{block.order}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Move Up/Down for non-drag reorder */}
          {canMoveUp && onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Di chuyển lên"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
          {canMoveDown && onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Di chuyển xuống"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
            title="Xóa block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-4">{renderEditor()}</div>
    </div>
  );
}
