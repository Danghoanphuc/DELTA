// frontend/src/features/editor/components/ViewerModel.tsx
// ✅ SỬA LỖI LOGIC: Loại bỏ onDrop và onDragOver (đã được <Canvas> ở cha xử lý)

import React, { useMemo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useCameraAutoFit } from "../hooks/useCameraAutoFit";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { DecalItem } from "../types/decal.types";
import { DecalRenderer } from "./DecalRenderer";
import { GizmoMode } from "../hooks/useDesignEditor";

interface ViewerModelProps {
  modelUrl: string;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onModelLoaded?: () => void;
  initialRotationY?: number;
  modelRef: React.RefObject<THREE.Group | null>;
  decals: DecalItem[];
  selectedDecalId: string | null;
  onDecalSelect: (id: string | null, isMultiSelect: boolean) => void;
  onDecalUpdate: (id: string, updates: Partial<DecalItem>) => void;
  gizmoMode: GizmoMode;
  isSnapping: boolean;

  // ❌ XÓA: Loại bỏ 2 props đã được component cha (Canvas) xử lý
  // onDrop: (event: React.DragEvent) => void;
  // onDragOver: (event: React.DragEvent) => void;
}

export function ViewerModel({
  modelUrl,
  controlsRef,
  onModelLoaded,
  initialRotationY,
  modelRef,
  decals,
  selectedDecalId,
  onDecalSelect,
  onDecalUpdate,
  gizmoMode,
  isSnapping,
}: // ❌ XÓA:
// onDrop,
// onDragOver,
ViewerModelProps) {
  // ... (logic clone scene, auto-fit, rotation giữ nguyên) ...
  const { scene: originalScene } = useGLTF(modelUrl);
  const scene = useMemo(() => {
    if (originalScene) {
      const clonedScene = originalScene.clone();
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (!child.userData.surfaceKey) {
            child.userData.surfaceKey = child.material.name;
          }
        }
      });
      return clonedScene;
    }
    return null;
  }, [originalScene]);
  useCameraAutoFit(modelRef, scene, controlsRef);
  useEffect(() => {
    if (scene) {
      onModelLoaded?.();
    }
  }, [scene, onModelLoaded]);
  const rotationYInRadians = useMemo(() => {
    const rotationDegrees = initialRotationY ?? 180;
    return (rotationDegrees * Math.PI) / 180;
  }, [initialRotationY]);

  if (!scene) return null;

  return (
    <>
      <primitive
        ref={modelRef}
        object={scene}
        rotation={[0, rotationYInRadians, 0]}
        // ❌ XÓA: Loại bỏ 2 handler
        // onDrop={onDrop}
        // onDragOver={onDragOver}
      />

      {/* Render Decals (Đã cập nhật) */}
      {decals
        .filter((d) => d.isVisible)
        .map((decal) => (
          <DecalRenderer
            key={decal.id}
            decal={decal}
            onSelect={onDecalSelect}
            isSelected={decal.id === selectedDecalId}
            onUpdate={onDecalUpdate}
            gizmoMode={gizmoMode}
            isSnapping={isSnapping}
          />
        ))}
    </>
  );
}
