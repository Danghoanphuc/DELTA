// frontend/src/features/editor/components/ViewerModel.tsx
// ✅ BẢN HOÀN CHỈNH: Fix race condition + texture mapping

import React, { useMemo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useCameraAutoFit } from "../hooks/useCameraAutoFit";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ViewerModelProps {
  modelUrl: string;
  textures: Record<string, THREE.CanvasTexture | null>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  dimensions?: { length?: number; width?: number; height?: number };
  onModelLoaded?: () => void;
  initialRotationY?: number;
}

const textureCache = new Map<string, THREE.Texture>();

export function ViewerModel({
  modelUrl,
  textures = {},
  controlsRef,
  dimensions,
  onModelLoaded,
  initialRotationY,
}: ViewerModelProps) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl);

  useCameraAutoFit(group, gltf.scene, controlsRef);

  // ✅ FIX RACE CONDITION: Chỉ phụ thuộc vào gltf.scene
  useEffect(() => {
    if (gltf.scene) {
      onModelLoaded?.();
    }
  }, [gltf.scene]); // ✅ Không include onModelLoaded

  // Lưu trữ vật liệu gốc
  const originalMaterials = useRef<Record<string, THREE.Material>>({});
  useEffect(() => {
    if (Object.keys(originalMaterials.current).length > 0 || !gltf.scene)
      return;
    gltf.scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material &&
        !originalMaterials.current[child.material.name]
      ) {
        originalMaterials.current[child.material.name] = child.material.clone();
      }
    });
  }, [gltf.scene]);

  // Load textures
  const loadedTextures = useMemo(() => {
    console.log(`🖼️ [ViewerModel] Processing textures...`);
    const newTextures: Record<string, THREE.Texture> = {};
    for (const materialName in textures) {
      const textureData = textures[materialName];

      if (textureData instanceof THREE.CanvasTexture) {
        newTextures[materialName] = textureData;
        console.log(`✅ [ViewerModel] Texture loaded for: ${materialName}`);
      } else {
        console.warn(`⚠️ [ViewerModel] Invalid texture for: ${materialName}`);
      }
    }
    return newTextures;
  }, [textures]);

  // Áp texture
  useEffect(() => {
    if (!gltf.scene) return;

    console.log(`🎨 [ViewerModel] Applying textures to model...`);

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materialName = child.material.name;
        const originalMaterial = originalMaterials.current[materialName];
        const newTexture = loadedTextures[materialName];

        if (newTexture && originalMaterial) {
          // ✅ Clone material để tránh ảnh hưởng đến material khác
          const clonedMaterial = originalMaterial.clone();

          if ("map" in clonedMaterial) {
            clonedMaterial.map = newTexture;
            clonedMaterial.needsUpdate = true;
          }

          child.material = clonedMaterial;
          console.log(`✅ [ViewerModel] Applied texture to: ${materialName}`);
        } else if (originalMaterial && !newTexture) {
          // ✅ Khôi phục material gốc nếu không có texture
          child.material = originalMaterial;
          console.log(
            `🔄 [ViewerModel] Restored original material: ${materialName}`
          );
        }
      }
    });
  }, [gltf.scene, loadedTextures]);

  // Scale
  useEffect(() => {
    if (!group.current || !gltf.scene) return;
    if (!group.current.userData.originalBox) {
      if (group.current.children.length === 0) return;
      const box = new THREE.Box3().setFromObject(group.current);
      const size = box.getSize(new THREE.Vector3());
      if (size.x === 0 || size.y === 0 || size.z === 0) return;
      group.current.userData.originalBox = size;
    }
    const originalSize = group.current.userData.originalBox as THREE.Vector3;
    const scaleX = (dimensions?.width || originalSize.x) / originalSize.x;
    const scaleY = (dimensions?.height || originalSize.y) / originalSize.y;
    const scaleZ = (dimensions?.length || originalSize.z) / originalSize.z;
    group.current.scale.set(scaleX, scaleY, scaleZ);
  }, [dimensions, gltf.scene]);

  const rotationYInRadians = useMemo(() => {
    const rotationDegrees = initialRotationY ?? 180;
    return (rotationDegrees * Math.PI) / 180;
  }, [initialRotationY]);

  if (!gltf.scene) return null;

  return (
    <primitive
      ref={group}
      object={gltf.scene}
      rotation={[0, rotationYInRadians, 0]}
    />
  );
}
