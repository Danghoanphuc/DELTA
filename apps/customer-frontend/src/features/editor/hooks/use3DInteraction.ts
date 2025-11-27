// frontend/src/features/editor/hooks/use3DInteraction.ts
// ✅ PHIÊN BẢN 3.0: "CO-LOCATION" TYPES
// Di dời các types từ 'blueprints.types.ts' (đã xóa) vào đây.

import { useRef, useCallback } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { toast } from "@/shared/utils/toast";
import * as React from "react"; // ✅ THÊM: Import React cho types

// ❌ Xóa: Import từ './blueprints.types'
// import {
//   Use3DInteractionProps,
//   Use3DInteractionReturn,
//   InteractionResult,
//   SurfaceDefinition,
// } from "./blueprints.types";

// =======================================================
// ✅ THÊM: NỘI DUNG CỦA 'blueprints.types.ts' ĐƯỢC DÁN VÀO ĐÂY
// =======================================================

/**
 * @name SurfaceDefinition (Định nghĩa 1 Bề mặt Ánh xạ)
 * (Dùng chung cho cả Interaction và Hover)
 */
export interface SurfaceDefinition {
  materialName: string;
  surfaceKey: string;
  artboardSize: {
    width: number;
    height: number;
  };
}

/**
 * @name InteractionResult (Kết quả Tương tác)
 * (Dùng chung cho cả Interaction và Hover)
 */
export interface InteractionResult {
  surfaceKey: string;
  uv: THREE.Vector2;
  pixelCoords: {
    x: number;
    y: number;
  };
  worldPoint: THREE.Vector3;
  worldNormal: THREE.Vector3;
}

/**
 * @name Use3DInteractionProps (ĐẶC TẢ "ĐẦU VÀO")
 */
export interface Use3DInteractionProps {
  modelRef: React.RefObject<THREE.Group | null>;
  surfaceMapping: Array<SurfaceDefinition>;
  onSurfaceClick: (result: InteractionResult) => void;
  onSurfaceDrop: (result: InteractionResult, dropData: any) => void;
}

/**
 * @name Use3DInteractionReturn (ĐẶC TẢ "ĐẦU RA")
 */
export interface Use3DInteractionReturn {
  handleClick: (event: React.MouseEvent) => void;
  handleDrop: (event: React.DragEvent, dropData: any) => void;
  handleDragOver: (event: React.DragEvent) => void;
}
// =======================================================
// (Kết thúc phần dán types)
// =======================================================

export function use3DInteraction({
  modelRef,
  surfaceMapping,
  onSurfaceClick,
  onSurfaceDrop,
}: Use3DInteractionProps): Use3DInteractionReturn {
  // (Phần còn lại của hook giữ nguyên 100%)

  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // HELPER: Chuyển đổi tọa độ màn hình (Giữ nguyên)
  const updateMousePosition = useCallback(
    (event: MouseEvent | React.MouseEvent | React.DragEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl]
  );

  // Helper: performRaycastAndFindSurface (Giữ nguyên)
  const performRaycastAndFindSurface = useCallback((): {
    surface: SurfaceDefinition;
    uv: THREE.Vector2;
    point: THREE.Vector3;
    normal: THREE.Vector3;
  } | null => {
    if (!modelRef.current) return null;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(
      modelRef.current,
      true
    );

    if (intersects.length === 0) return null;

    const intersection = intersects[0];
    const mesh = intersection.object as THREE.Mesh;

    if (!mesh || !intersection.uv) {
      console.warn("[3DInteraction] Mesh không có UV");
      return null;
    }

    // Ưu tiên userData.surfaceKey
    const userDataSurfaceKey = mesh.userData?.surfaceKey;
    if (userDataSurfaceKey) {
      const surface = surfaceMapping.find(
        (s) => s.surfaceKey === userDataSurfaceKey
      );
      if (surface) {
        return {
          surface,
          uv: intersection.uv.clone(),
          point: intersection.point.clone(),
          normal:
            intersection.face?.normal.clone() || new THREE.Vector3(0, 0, 1),
        };
      }
    }

    // Fallback: materialName
    const materialName = (mesh.material as THREE.Material)?.name;
    if (materialName) {
      const surface = surfaceMapping.find(
        (s) => s.materialName === materialName
      );
      if (surface) {
        return {
          surface,
          uv: intersection.uv.clone(),
          point: intersection.point.clone(),
          normal:
            intersection.face?.normal.clone() || new THREE.Vector3(0, 0, 1),
        };
      }
    }

    return null;
  }, [modelRef, camera, surfaceMapping]);

  // Handler: handleClick (Giữ nguyên)
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      updateMousePosition(event);
      const result = performRaycastAndFindSurface();
      if (!result) return;
      const { surface, uv, point, normal } = result;
      const pixelCoords = {
        x: uv.x * surface.artboardSize.width,
        y: (1 - uv.y) * surface.artboardSize.height,
      };
      const interactionResult: InteractionResult = {
        surfaceKey: surface.surfaceKey,
        uv: uv,
        pixelCoords: pixelCoords,
        worldPoint: point,
        worldNormal: normal,
      };
      onSurfaceClick(interactionResult);
    },
    [updateMousePosition, performRaycastAndFindSurface, onSurfaceClick]
  );

  // Handler: handleDrop (Giữ nguyên)
  const handleDrop = useCallback(
    (event: React.DragEvent, dropData: any) => {
      event.preventDefault();
      updateMousePosition(event as any);
      const result = performRaycastAndFindSurface();
      if (!result) {
        toast.error("Vui lòng thả lên bề mặt của model");
        return;
      }
      const { surface, uv, point, normal } = result;
      const pixelCoords = {
        x: uv.x * surface.artboardSize.width,
        y: (1 - uv.y) * surface.artboardSize.height,
      };
      const interactionResult: InteractionResult = {
        surfaceKey: surface.surfaceKey,
        uv: uv,
        pixelCoords: pixelCoords,
        worldPoint: point,
        worldNormal: normal,
      };
      onSurfaceDrop(interactionResult, dropData);
    },
    [updateMousePosition, performRaycastAndFindSurface, onSurfaceDrop]
  );

  // Handler: handleDragOver (Giữ nguyên)
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Trả về (Giữ nguyên)
  return {
    handleClick,
    handleDrop,
    handleDragOver,
  };
}
