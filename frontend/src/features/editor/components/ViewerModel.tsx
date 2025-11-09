// frontend/src/features/editor/components/ViewerModel.tsx
// Component render 3D Model và các Decals

import React, { useMemo, useEffect } from "react";
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
}: ViewerModelProps) {
  // Logic clone scene, auto-fit, rotation
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
        // onDrop và onDragOver đã được xử lý bởi <Canvas> ở component cha
      />

      {/* Render Decals */}
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
