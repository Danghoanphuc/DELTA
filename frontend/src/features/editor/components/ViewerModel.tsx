// src/features/editor/components/ViewerModel.tsx
// ✅ FINAL FIX: LOẠI BỎ ENCODING CŨ, DÙNG SRGBColorSpace VÀ NEAREST FILTER CHO TEXTURE

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

// Bộ đệm (cache) cho texture
const textureCache = new Map<string, THREE.Texture>();

export function ViewerModel({
  modelUrl,
  textures = {},
  controlsRef,
  dimensions,
  onModelLoaded,
  initialRotationY, // <-- Prop này có thể là undefined
}: ViewerModelProps) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl);

  // Gọi hook auto-fit camera (Giữ nguyên)
  useCameraAutoFit(group, gltf.scene, controlsRef);

  // Báo cho component cha khi model đã tải xong (Giữ nguyên)
  useEffect(() => {
    if (gltf.scene) {
      onModelLoaded?.();
    }
  }, [gltf.scene, onModelLoaded]);

  // Lưu trữ vật liệu gốc (Giữ nguyên)
  const originalMaterials = useRef<Record<string, THREE.Material>>({});
  useEffect(() => {
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

  // Logic tải và cache texture (ĐÃ SỬA BỘ LỌC và MÃ HÓA)
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
          // ❌ FIX LỖI MÀU: BỎ DÒNG ENCODING NÀY
          // loadedTexture.encoding = THREE.sRGBEncoding;
          loadedTexture.flipY = false;
          loadedTexture.needsUpdate = true;

          // ✅ THÊM DÒNG NÀY: Dùng ColorSpace hiện đại cho đầu vào Texture
          loadedTexture.colorSpace = THREE.SRGBColorSpace;

          // ✅ THIẾT LẬP LỌC MỚI ĐỂ CHỐNG MỜ (MIPMAPPING)
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

  // Logic áp (apply) texture lên model (Giữ nguyên)
  useEffect(() => {
    if (Object.keys(loadedTextures).length === 0) return;
    const firstTextureKey = Object.keys(loadedTextures)[0];
    const fallbackTexture = loadedTextures[firstTextureKey];

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materialName = child.material.name;
        let newTexture = loadedTextures[materialName] || fallbackTexture;
        if (newTexture) {
          if (!(child.material instanceof THREE.MeshStandardMaterial)) {
            child.material = new THREE.MeshStandardMaterial({
              map: newTexture,
              metalness: 0.1,
              roughness: 0.8,
              name: materialName,
            });
          } else {
            (child.material as THREE.MeshStandardMaterial).map = newTexture;
          }
          child.material.needsUpdate = true;
        } else {
          const originalMaterial = originalMaterials.current[materialName];
          if (originalMaterial) child.material = originalMaterial;
        }
      }
    });
  }, [gltf.scene, loadedTextures, textures]);

  // Logic scale kích thước (Giữ nguyên)
  useEffect(() => {
    // ... (logic scale giữ nguyên)
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

  // SỬA LỖI XOAY MẶT (Giữ nguyên)
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
