// apps/admin-frontend/src/components/suppliers/artisan-blocks/ArtisanBlockEditor.tsx
// Main block editor with drag-drop sortable list and split-view preview

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArtisanBlock,
  BlockType,
  createEmptyBlock,
} from "@/types/artisan-block.types";
import { ArtisanBlockItem } from "./ArtisanBlockItem";
import { BlockPreview } from "./BlockPreview";
import {
  Plus,
  Type,
  Image,
  MessageSquareQuote,
  Table,
  Eye,
  EyeOff,
  Layers,
  Film,
  BookOpen,
  Sparkles,
  Package,
  MousePointerClick,
} from "lucide-react";

interface ArtisanBlockEditorProps {
  title: string;
  blocks: ArtisanBlock[];
  onTitleChange: (title: string) => void;
  onBlocksChange: (blocks: ArtisanBlock[]) => void;
  authorName?: string;
  authorTitle?: string;
  category?: string;
  onFileUpload?: (file: File) => Promise<{ preview: string }>;
}

// New B2B Curator blocks
const NEW_BLOCK_TYPES: {
  type: BlockType;
  label: string;
  icon: any;
  desc: string;
}[] = [
  { type: "hero", label: "Hero", icon: Film, desc: "Video/Image với title" },
  {
    type: "story",
    label: "Story",
    icon: BookOpen,
    desc: "Nội dung storytelling",
  },
  {
    type: "interactive",
    label: "Interactive",
    icon: Sparkles,
    desc: "Audio, Zoom, So sánh",
  },
  { type: "artifact", label: "Artifact", icon: Package, desc: "Sản phẩm B2B" },
  {
    type: "footer",
    label: "Footer",
    icon: MousePointerClick,
    desc: "CTA chuyển đổi",
  },
];

// All block types for the add menu
const BLOCK_TYPES: {
  type: BlockType;
  label: string;
  icon: any;
  desc: string;
  category: "new" | "legacy";
}[] = [
  // New B2B blocks
  ...NEW_BLOCK_TYPES.map((b) => ({ ...b, category: "new" as const })),
  // Legacy blocks
  {
    type: "text",
    label: "Văn bản",
    icon: Type,
    desc: "Rich text với TipTap",
    category: "legacy",
  },
  {
    type: "media",
    label: "Media",
    icon: Image,
    desc: "Ảnh, Audio, Video",
    category: "legacy",
  },
  {
    type: "curator_note",
    label: "Góc Giám Tuyển",
    icon: MessageSquareQuote,
    desc: "Quan điểm cá nhân",
    category: "legacy",
  },
  {
    type: "comparison_table",
    label: "Bảng So Sánh",
    icon: Table,
    desc: "Tối đa 3 cột",
    category: "legacy",
  },
];

export function ArtisanBlockEditor({
  title,
  blocks,
  onTitleChange,
  onBlocksChange,
  authorName,
  authorTitle,
  category,
  onFileUpload,
}: ArtisanBlockEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    const newBlocks = arrayMove(blocks, oldIndex, newIndex).map(
      (block, index) => ({
        ...block,
        order: index + 1,
      })
    );

    onBlocksChange(newBlocks);
  };

  // Add new block
  const addBlock = (type: BlockType) => {
    const newBlock = createEmptyBlock(type, blocks.length + 1);
    onBlocksChange([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  // Update block
  const updateBlock = useCallback(
    (updatedBlock: ArtisanBlock) => {
      onBlocksChange(
        blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
      );
    },
    [blocks, onBlocksChange]
  );

  // Delete block
  const deleteBlock = useCallback(
    (blockId: string) => {
      const newBlocks = blocks
        .filter((b) => b.id !== blockId)
        .map((block, index) => ({ ...block, order: index + 1 }));
      onBlocksChange(newBlocks);
    },
    [blocks, onBlocksChange]
  );

  // Move block up/down
  const moveBlock = useCallback(
    (blockId: string, direction: "up" | "down") => {
      const index = blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      const newBlocks = arrayMove(blocks, index, newIndex).map((block, i) => ({
        ...block,
        order: i + 1,
      }));
      onBlocksChange(newBlocks);
    },
    [blocks, onBlocksChange]
  );

  return (
    <div className="flex h-full">
      {/* LEFT: Editor Panel */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          showPreview ? "border-r border-gray-200" : ""
        }`}
      >
        {/* Title Input */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Tiêu đề bài viết..."
            className="w-full text-2xl font-bold text-gray-900 placeholder:text-gray-300 border-none focus:ring-0 px-0 py-2 bg-transparent outline-none"
          />
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-600">
              {blocks.length} block{blocks.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Preview Toggle */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                showPreview
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {showPreview ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              Preview
            </button>

            {/* Add Block Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm Block
              </button>

              {/* Add Menu Dropdown */}
              {showAddMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAddMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 max-h-[70vh] overflow-y-auto">
                    {/* New B2B Blocks */}
                    <div className="px-3 py-1.5">
                      <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider">
                        B2B Curator Blocks
                      </span>
                    </div>
                    {BLOCK_TYPES.filter((b) => b.category === "new").map(
                      ({ type, label, icon: Icon, desc }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => addBlock(type)}
                          className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-orange-50 transition-colors text-left"
                        >
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Icon className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {label}
                            </p>
                            <p className="text-xs text-gray-500">{desc}</p>
                          </div>
                        </button>
                      )
                    )}

                    {/* Divider */}
                    <div className="my-2 border-t border-gray-100" />

                    {/* Legacy Blocks */}
                    <div className="px-3 py-1.5">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Legacy Blocks
                      </span>
                    </div>
                    {BLOCK_TYPES.filter((b) => b.category === "legacy").map(
                      ({ type, label, icon: Icon, desc }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => addBlock(type)}
                          className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {label}
                            </p>
                            <p className="text-xs text-gray-500">{desc}</p>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Blocks List */}
        <div className="flex-1 overflow-y-auto p-6">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Layers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bắt đầu với Block đầu tiên
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">
                Mỗi bài viết được lắp ghép từ các khối nội dung. Click "Thêm
                Block" để bắt đầu.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {BLOCK_TYPES.slice(0, 2).map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all"
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {blocks.map((block, index) => (
                    <ArtisanBlockItem
                      key={block.id}
                      block={block}
                      onChange={updateBlock}
                      onDelete={() => deleteBlock(block.id)}
                      onMoveUp={() => moveBlock(block.id, "up")}
                      onMoveDown={() => moveBlock(block.id, "down")}
                      canMoveUp={index > 0}
                      canMoveDown={index < blocks.length - 1}
                      defaultAuthorName={authorName}
                      onFileUpload={onFileUpload}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Quick Add at bottom */}
          {blocks.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAddMenu(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Thêm block mới</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Preview Panel */}
      {showPreview && (
        <div className="w-[400px] shrink-0 bg-[#F9F8F6] overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">
                Live Preview
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <BlockPreview
                title={title}
                blocks={blocks}
                authorName={authorName}
                authorTitle={authorTitle}
                category={category}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
