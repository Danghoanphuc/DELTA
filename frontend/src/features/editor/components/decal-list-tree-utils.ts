// features/editor/components/decal-list-tree-utils.ts
// ✅ FILE MỚI: Cung cấp các hàm tiện ích để xử lý cây

import { EditorItem } from "../types/decal.types";

export type TreeItem = EditorItem & {
  children: TreeItem[];
  depth: number;
};

/**
 * Xây dựng cấu trúc cây (lồng nhau) từ danh sách phẳng (flat list).
 */
export function buildTree(
  items: EditorItem[],
  parentId: string | null = null,
  depth = 0
): TreeItem[] {
  const children = items.filter((item) => item.parentId === parentId);
  // Sắp xếp (tạm thời bỏ qua, vì DND sẽ xử lý)
  // .sort((a, b) => a.index - b.index);
  return children.map((item) => ({
    ...item,
    depth,
    children: buildTree(items, item.id, depth + 1),
  }));
}

/**
 * Làm phẳng cây (flatten) để render danh sách 1 cấp (nhưng có thụt lề).
 */
export function flattenTree(tree: TreeItem[]): TreeItem[] {
  let result: TreeItem[] = [];
  for (const item of tree) {
    result.push(item);
    if (item.children.length > 0) {
      result = result.concat(flattenTree(item.children));
    }
  }
  return result;
}

/**
 * Lấy danh sách ID đã được sắp xếp (cho SortableContext của DND-Kit).
 */
export function getSortedTreeItems(flattenedTree: TreeItem[]): string[] {
  return flattenedTree.map((item) => item.id);
}
