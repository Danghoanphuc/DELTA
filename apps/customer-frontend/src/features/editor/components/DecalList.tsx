// features/editor/components/DecalList.tsx
// ✅ BẢN VÁ: Sửa lỗi "useState is not defined"

import React, { useMemo, useState } from "react"; // ✅ SỬA LỖI: Thêm 'useState'
import { EditorItem, GroupItem, DecalItem } from "../types/decal.types";
import {
  ImageIcon,
  Type,
  Square,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Folder,
  FolderOpen,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { NativeScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { cn } from "@/shared/lib/utils";

// 1. Import DND-Kit (Core, Sortable, Utilities)
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  buildTree,
  flattenTree,
  getSortedTreeItems,
} from "./decal-list-tree-utils"; // (File tiện ích)

// === PROPS ===
export interface DecalListProps {
  items: EditorItem[];
  selectedItemIds: string[];
  onSelect: (id: string, isMultiSelect: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<EditorItem>) => void;
  onReorder: (
    activeId: string,
    overId: string | null, // Sửa: overId có thể null
    newParentId: string | null
  ) => void;
}

// === COMPONENT CON: Item (Render 1 lớp) ===
interface SortableItemProps {
  item: EditorItem;
  depth: number;
  isSelected: boolean;
  onSelect: (id: string, isMultiSelect: boolean) => void;
  onUpdate: (id: string, updates: Partial<EditorItem>) => void;
  onDelete: (id: string) => void;
}

const SortableItem = ({
  item,
  depth,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 20 + 8}px`, // Thụt lề
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : "auto", // Nổi lên khi kéo
  };

  const Icon =
    item.type === "group"
      ? Folder
      : (item as DecalItem).decalType === "image"
      ? ImageIcon
      : (item as DecalItem).decalType === "text"
      ? Type
      : Square;

  const color =
    item.type === "group"
      ? "text-yellow-600"
      : (item as DecalItem).decalType === "image"
      ? "text-blue-500"
      : (item as DecalItem).decalType === "text"
      ? "text-green-500"
      : "text-purple-500";

  const name =
    item.type === "group"
      ? item.name
      : (item as DecalItem).text // Ưu tiên text
      ? (item as DecalItem).text?.substring(0, 20) || "Text"
      : (item as DecalItem).decalType; // Fallback về decalType

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center justify-between p-1.5 rounded-md cursor-pointer hover:bg-gray-100",
        isSelected && "bg-blue-100 hover:bg-blue-100"
      )}
      onClick={(e) => onSelect(item.id, e.ctrlKey || e.metaKey || e.shiftKey)}
    >
      {/* Icon, Tên, Tay cầm */}
      <div className="flex items-center overflow-hidden gap-1.5">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>
        <Icon size={16} className={cn(color, "flex-shrink-0")} />
        <span className="text-sm truncate" title={name}>
          {name}
        </span>
      </div>

      {/* Actions (Lock, Hide) */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          title="Xóa lớp"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          <Trash2 size={14} className="text-red-500 opacity-50 group-hover:opacity-100" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          title={item.isLocked ? "Mở khóa" : "Khóa"}
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(item.id, { isLocked: !item.isLocked });
          }}
        >
          {item.isLocked ? (
            <Lock size={14} className="text-red-600" />
          ) : (
            <Unlock size={14} className="opacity-0 group-hover:opacity-100" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          title={item.isVisible ? "Ẩn lớp" : "Hiện lớp"}
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(item.id, { isVisible: !item.isVisible });
          }}
        >
          {item.isVisible ? (
            <Eye size={14} />
          ) : (
            <EyeOff size={14} className="text-gray-500" />
          )}
        </Button>
      </div>
    </div>
  );
};

// === COMPONENT CHÍNH: DecalList ===
export const DecalList: React.FC<DecalListProps> = ({
  items,
  selectedItemIds,
  onSelect,
  onDelete,
  onUpdate,
  onReorder,
}) => {
  // 1. Cảm biến DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // 2. Xây dựng cây từ danh sách phẳng
  const { flattenedTree, sortedIds } = useMemo(() => {
    const reversedItems = [...items].reverse();
    const tree = buildTree(reversedItems);
    const flatTree = flattenTree(tree);
    const ids = getSortedTreeItems(flatTree);
    return { flattenedTree: flatTree, sortedIds: ids };
  }, [items]);

  // 3. Xử lý DND
  // ✅ DÒNG GÂY LỖI (VÌ THIẾU IMPORT) ĐÃ ĐƯỢC SỬA
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    // (Logic xử lý khi di chuột qua 1 group... tạm thời bỏ qua)
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);

    const activeItem = flattenedTree.find((i) => i.id === active.id);
    if (!activeItem) return;

    if (!over) {
      return;
    }

    if (active.id === over.id) return;

    const overItem = flattenedTree.find((i) => i.id === over.id);
    if (!overItem) return;

    const newParentId = overItem.parentId;

    onReorder(active.id as string, over.id as string, newParentId);
  };

  return (
    <div className="w-full h-full">
      {items.length === 0 ? (
        <p className="text-xs text-gray-500 p-4 text-center">
          Chưa có lớp nào.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedIds}
            strategy={verticalListSortingStrategy}
          >
            <NativeScrollArea className="flex-1 h-full">
              <div className="p-2 space-y-0.5">
                {flattenedTree.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    depth={item.depth}
                    isSelected={selectedItemIds.includes(item.id)}
                    onSelect={onSelect}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </NativeScrollArea>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
