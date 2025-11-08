// frontend/src/features/editor/hooks/use3DHoverHighlight/use3DHoverHighlight.ts
// [AI] TÁI CẤU TRÚC: Ưu tiên 'userData.surfaceKey', fallback về 'materialName'
// ✅ PHIÊN BẢN 1.0: "Thực thi" Hợp đồng hoverHighlight.types.ts

import { useRef, useCallback } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

// Import "Hợp đồng Kỹ thuật" MỚI
import {
  Use3DHoverHighlightProps,
  Use3DHoverHighlightReturn,
  InteractionResult,
  SurfaceDefinition,
} from "./hoverHighlight.types";

export function use3DHoverHighlight({
  modelRef,
  surfaceMapping,
  onSurfaceHoverStart,
  onSurfaceHoverEnd,
}: Use3DHoverHighlightProps): Use3DHoverHighlightReturn {
  const { camera, gl } = useThree();

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const currentHoveredRef = useRef<string | null>(null);

  // HELPER: Chuyển đổi tọa độ màn hình (Giữ nguyên)
  const updateMousePosition = useCallback(
    (event: MouseEvent | React.MouseEvent | React.DragEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl]
  );

  // [AI] TÁI CẤU TRÚC: Helper mới gộp logic raycast và tra cứu
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
      return null;
    }

    // [AI] LÕI THAY ĐỔI: Ưu tiên userData.surfaceKey
    const userDataSurfaceKey = mesh.userData?.surfaceKey;
    if (userDataSurfaceKey) {
      const surface = surfaceMapping.find(
        (s: SurfaceDefinition) => s.surfaceKey === userDataSurfaceKey
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

    // [AI] FALLBACK: Nếu không có userData, thử materialName
    const materialName = (mesh.material as THREE.Material)?.name;
    if (materialName) {
      const surface = surfaceMapping.find(
        (s: SurfaceDefinition) => s.materialName === materialName
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
  }, [modelRef, camera, surfaceMapping]); // <-- Thêm dependency surfaceMapping

  // [AI] XÓA BỎ helper 'performRaycast' cũ
  // [AI] XÓA BỎ helper 'uvToPixelCoords' cũ

  // [LOGIC MỚI]: Thực thi "Đầu ra" `handleMouseMove`
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      updateMousePosition(event);
      // [AI] THAY ĐỔI: Gọi helper mới
      const result = performRaycastAndFindSurface();

      const newHoveredSurface = result ? result.surface.surfaceKey : null;
      const oldHoveredSurface = currentHoveredRef.current;

      // Logic "Cảm biến":
      if (newHoveredSurface !== oldHoveredSurface) {
        // 1. Tình huống: "Di chuột ra khỏi" vùng cũ
        if (oldHoveredSurface) {
          onSurfaceHoverEnd(oldHoveredSurface);
        }

        // 2. Tình huống: "Di chuột vào" vùng mới
        if (result) {
          // newHoveredSurface is not null
          const { surface, uv, point, normal } = result;

          // [AI] ĐƠN GIẢN HÓA: Tính toán pixelCoords
          const pixelCoords = {
            x: uv.x * surface.artboardSize.width,
            y: (1 - uv.y) * surface.artboardSize.height,
          };

          // Lắp ráp "Gói hàng" (Tái sử dụng từ Hợp đồng Vàng)
          const interactionResult: InteractionResult = {
            surfaceKey: surface.surfaceKey,
            uv: uv,
            pixelCoords: pixelCoords,
            worldPoint: point,
            worldNormal: normal,
          };
          onSurfaceHoverStart(interactionResult);
        }

        // Cập nhật "bộ nhớ"
        currentHoveredRef.current = newHoveredSurface;
      }
    },
    [
      // [AI] THAY ĐỔI: Cập nhật dependency
      updateMousePosition,
      performRaycastAndFindSurface,
      onSurfaceHoverStart,
      onSurfaceHoverEnd,
    ]
  );

  // [LOGIC MỚI]: Thực thi "Đầu ra" `handleMouseLeave` (Giữ nguyên)
  const handleMouseLeave = useCallback(
    (event: React.MouseEvent) => {
      if (currentHoveredRef.current) {
        onSurfaceHoverEnd(currentHoveredRef.current);
        currentHoveredRef.current = null;
      }
    },
    [onSurfaceHoverEnd]
  );

  // Trả về Hợp đồng "Đầu ra" MỚI
  return {
    handleMouseMove,
    handleMouseLeave,
  };
}
