// frontend/src/features/editor/hooks/use3DInteraction.ts
// ✅ HOOK HOÀN CHỈNH CHO 3D Interaction

import { useRef, useCallback } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { toast } from "sonner";

interface Use3DInteractionProps {
  modelRef: React.RefObject<THREE.Group | null>;
  surfaceMapping: Array<{
    materialName: string;
    surfaceKey: string;
    artboardSize: { width: number; height: number };
  }>;
  onSurfaceClick?: (surfaceKey: string, uvCoords: THREE.Vector2) => void;
  onSurfaceDrop?: (
    surfaceKey: string,
    uvCoords: THREE.Vector2,
    dropData: any
  ) => void;
}

export function use3DInteraction({
  modelRef,
  surfaceMapping,
  onSurfaceClick,
  onSurfaceDrop,
}: Use3DInteractionProps) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // ✅ HELPER: Chuyển đổi tọa độ màn hình sang tọa độ normalized device (-1 to 1)
  const updateMousePosition = useCallback(
    (event: MouseEvent | React.MouseEvent | React.DragEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl]
  );

  // ✅ HELPER: Raycast và tìm intersection
  const performRaycast = useCallback((): {
    materialName: string;
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

    if (!mesh.material || !intersection.uv) {
      console.warn("[3DInteraction] Mesh không có material hoặc UV");
      return null;
    }

    const materialName = (mesh.material as THREE.Material).name;

    return {
      materialName,
      uv: intersection.uv.clone(),
      point: intersection.point.clone(),
      normal: intersection.face?.normal.clone() || new THREE.Vector3(0, 0, 1),
    };
  }, [modelRef, camera]);

  // ✅ HELPER: Chuyển đổi UV (0-1) sang tọa độ pixel trên artboard
  const uvToPixelCoords = useCallback(
    (
      uv: THREE.Vector2,
      materialName: string
    ): { x: number; y: number; surfaceKey: string } | null => {
      const surface = surfaceMapping.find(
        (s) => s.materialName === materialName
      );

      if (!surface) {
        // Đây là điều bình thường, click vào vật liệu không map
        return null;
      }

      // Chuyển UV (0-1) sang pixel (0-artboardSize)
      const x = uv.x * surface.artboardSize.width;
      const y = (1 - uv.y) * surface.artboardSize.height; // Flip Y axis

      return {
        x,
        y,
        surfaceKey: surface.surfaceKey,
      };
    },
    [surfaceMapping]
  );

  // ✅ CLICK-TO-EDIT: Handler khi click vào model 3D
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      updateMousePosition(event);
      const result = performRaycast();

      if (!result) return;

      const pixelCoords = uvToPixelCoords(result.uv, result.materialName);

      if (!pixelCoords) {
        // Click vào vật liệu không map
        return;
      }

      // Gọi callback
      if (onSurfaceClick) {
        onSurfaceClick(pixelCoords.surfaceKey, result.uv);
      }
    },
    [updateMousePosition, performRaycast, uvToPixelCoords, onSurfaceClick]
  );

  // ✅ DRAG-AND-APPLY: Handler khi thả element lên model 3D
  const handleDrop = useCallback(
    (event: React.DragEvent, dropData: any) => {
      event.preventDefault();
      updateMousePosition(event as any);
      const result = performRaycast();

      if (!result) {
        toast.error("Vui lòng thả lên bề mặt của model");
        return;
      }

      const pixelCoords = uvToPixelCoords(result.uv, result.materialName);

      if (!pixelCoords) {
        toast.error("Không thể thả vào vùng này");
        return;
      }

      // Gọi callback
      if (onSurfaceDrop) {
        onSurfaceDrop(pixelCoords.surfaceKey, result.uv, {
          ...dropData,
          pixelX: pixelCoords.x,
          pixelY: pixelCoords.y,
          worldPoint: result.point,
          worldNormal: result.normal,
        });
      }
    },
    [updateMousePosition, performRaycast, uvToPixelCoords, onSurfaceDrop]
  );

  // ✅ HELPER: Prevent default drag over (cần thiết để drop hoạt động)
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return {
    handleClick,
    handleDrop,
    handleDragOver,
  };
}
