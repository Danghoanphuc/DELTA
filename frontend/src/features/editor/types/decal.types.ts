// features/editor/types/decal.types.ts
// ✅ NÂNG CẤP: Hỗ trợ Grouping (Nhóm)

import * as THREE from "three";

/**
 * @name DecalItem
 * @description
 * Định nghĩa cấu trúc dữ liệu cho một "Decal" (tem dán)
 * được áp dụng trong không gian 3D.
 */
export interface DecalItem {
  id: string;
  type: "decal";
  parentId: string | null; // ID của group cha

  // === Dữ liệu ===
  decalType: "image" | "text" | "shape";
  imageUrl?: string;
  text?: string;
  shapeType?: "rect" | "circle";
  color?: string;

  // === Dữ liệu 3D (Transform) ===
  position: [number, number, number];
  normal: [number, number, number];
  size: [number, number];
  rotation: [number, number, number];

  // === Trạng thái ===
  isVisible: boolean;
  isLocked: boolean;
}

/**
 * @name GroupItem
 * @description
 * Định nghĩa cấu trúc dữ liệu cho một "Group" (Nhóm)
 * chứa các EditorItem khác.
 */
export interface GroupItem {
  id: string;
  type: "group";
  parentId: string | null; // ID của group cha (cho phép lồng nhóm)
  name: string;

  // === Trạng thái ===
  isVisible: boolean;
  isLocked: boolean;
}

/**
 * @name EditorItem
 * @description
 * Union type, đại diện cho bất cứ thứ gì có thể có trong Layer Panel.
 */
export type EditorItem = DecalItem | GroupItem;
