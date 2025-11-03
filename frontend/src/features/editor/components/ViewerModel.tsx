// src/features/editor/components/ViewerModel.tsx
// ✅ SỬA LỖI: Thêm lại logic "fallbackTexture"

import React, { useMemo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useCameraAutoFit } from "../hooks/useCameraAutoFit";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ViewerModelProps {
  modelUrl: string;
  textures: Record<string, string | null>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  dimensions?: { length?: number; width?: number; height?: number };
  onModelLoaded?: () => void;
  initialRotationY?: number;
}

// Bộ đệm (cache) cho texture (Giữ nguyên)
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

  // Hook auto-fit camera (Giữ nguyên)
  useCameraAutoFit(group, gltf.scene, controlsRef);

  // Báo model đã tải xong (Giữ nguyên)
  useEffect(() => {
    if (gltf.scene) {
      onModelLoaded?.();
    }
  }, [gltf.scene, onModelLoaded]);

  // Lưu trữ vật liệu gốc (Giữ nguyên)
  const originalMaterials = useRef<Record<string, THREE.Material>>({});
  useEffect(() => {
    if (Object.keys(originalMaterials.current).length > 0) return; // Chỉ lưu 1 lần

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

  // Logic tải và cache texture (Giữ nguyên)
  const loadedTextures = useMemo(() => {
    const newTextures: Record<string, THREE.Texture> = {};
    for (const materialName in textures) {
      const textureData = textures[materialName];
      if (textureData) {
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
    // Dọn dẹp cache
    if (textureCache.size > 10) {
      const firstKey = Array.from(textureCache.keys())[0];
      textureCache.get(firstKey)?.dispose();
      textureCache.delete(firstKey);
    }
    return newTextures;
  }, [textures]);

  // ✅ SỬA LỖI: Logic áp (apply) texture lên model
  useEffect(() => {
    // ✅ THÊM LẠI LOGIC FALLBACK
    // Vì đây là trình chỉnh sửa 1-bề-mặt, chúng ta chỉ có 1 texture
    // Lấy texture đó, bất kể tên key là gì
    const firstTextureKey = Object.keys(loadedTextures)[0];
    const fallbackTexture = loadedTextures[firstTextureKey];

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materialName = child.material.name;
        const originalMaterial = originalMaterials.current[materialName];

        // ✅ SỬA LỖI: Thử tìm texture khớp tên, NẾU KHÔNG CÓ, dùng fallback
        const newTexture = loadedTextures[materialName] || fallbackTexture;

        if (newTexture) {
          // Có texture mới -> áp dụng
          if (originalMaterial) {
            child.material = originalMaterial.clone();
            if ("map" in child.material) {
              child.material.map = newTexture;
            }
            child.material.needsUpdate = true;
          }
        } else {
          // Không có texture mới -> trả về bản gốc
          if (originalMaterial) {
            child.material = originalMaterial;
          }
        }
      }
    });
  }, [gltf.scene, loadedTextures, textures]);

  // Logic scale kích thước (Giữ nguyên)
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

  return (
    <primitive
      ref={group}
      object={gltf.scene}
      rotation={[0, rotationYInRadians, 0]}
    />
  );
}
