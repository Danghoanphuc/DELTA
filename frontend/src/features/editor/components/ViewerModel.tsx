// src/features/editor/components/ViewerModel.tsx
// ✅ SỬA LỖI RACE CONDITION TRIỆT ĐỂ:
// Xóa `onModelLoaded` khỏi dependency array của `useEffect`
// để đảm bảo nó chỉ chạy MỘT LẦN khi `gltf.scene` xuất hiện.

import React, { useMemo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useCameraAutoFit } from "../hooks/useCameraAutoFit";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ViewerModelProps {
  modelUrl: string;
  textures: Record<string, string | null | THREE.CanvasTexture>;
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

  // ✅ SỬA LỖI TẠI ĐÂY:
  // Chúng ta CHỈ theo dõi `gltf.scene`.
  useEffect(() => {
    if (gltf.scene) {
      // Ngay khi gltf.scene xuất hiện (lần đầu),
      // gọi `onModelLoaded` (phiên bản mới nhất của hàm).
      onModelLoaded?.();
    }
  }, [gltf.scene]); // <-- Chỉ phụ thuộc vào `gltf.scene`

  // Lưu trữ vật liệu gốc (Giữ nguyên)
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

  // Logic tải texture "zero-cost" (Giữ nguyên)
  const loadedTextures = useMemo(() => {
    const newTextures: Record<string, THREE.Texture> = {};
    for (const materialName in textures) {
      const textureData = textures[materialName];
      if (textureData) {
        if (textureData instanceof THREE.CanvasTexture) {
          newTextures[materialName] = textureData;
          continue;
        }

        if (textureCache.has(textureData)) {
          newTextures[materialName] = textureCache.get(textureData)!;
        } else {
          const loader = new THREE.TextureLoader();
          const loadedTexture = loader.load(textureData);
          loadedTexture.flipY = false;
          loadedTexture.needsUpdate = true;
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          loadedTexture.minFilter = THREE.NearestFilter;
          loadedTexture.magFilter = THREE.NearestFilter;
          loadedTexture.generateMipmaps = false;
          textureCache.set(textureData, loadedTexture);
          newTextures[materialName] = loadedTexture;
        }
      }
    }
    if (textureCache.size > 10) {
      const firstKey = Array.from(textureCache.keys())[0];
      textureCache.get(firstKey)?.dispose();
      textureCache.delete(firstKey);
    }
    return newTextures;
  }, [textures]);

  // Logic áp texture (Giữ nguyên)
  useEffect(() => {
    if (!gltf.scene) return;

    const firstTextureKey = Object.keys(loadedTextures)[0];
    const fallbackTexture = loadedTextures[firstTextureKey];

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materialName = child.material.name;
        const originalMaterial = originalMaterials.current[materialName];
        const newTexture = loadedTextures[materialName] || fallbackTexture;

        if (newTexture) {
          if (originalMaterial) {
            child.material = originalMaterial.clone();
            if ("map" in child.material) {
              child.material.map = newTexture;
            }
            child.material.needsUpdate = true;
          }
        } else {
          if (originalMaterial) {
            child.material = originalMaterial;
          }
        }
      }
    });
  }, [gltf.scene, loadedTextures, textures]);

  // Logic scale (Giữ nguyên)
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

  // Logic xoay (Giữ nguyên)
  const rotationYInRadians = useMemo(() => {
    const rotationDegrees = initialRotationY ?? 180;
    return (rotationDegrees * Math.PI) / 180;
  }, [initialRotationY]);

  if (!gltf.scene) {
    return null;
  }

  return (
    <primitive
      ref={group}
      object={gltf.scene}
      rotation={[0, rotationYInRadians, 0]}
    />
  );
}
