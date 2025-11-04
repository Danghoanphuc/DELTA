// frontend/src/features/editor/components/ViewerModel.tsx
// ✅ BẢN CẢI THIỆN: Đã sửa lỗi UV Map (flipY = true) và làm sắc nét (NearestFilter)

import React, { useMemo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useCameraAutoFit } from "../hooks/useCameraAutoFit";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ViewerModelProps {
  modelUrl: string;
  canvasElements: Map<string, HTMLCanvasElement>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  dimensions?: { length?: number; width?: number; height?: number };
  onModelLoaded?: () => void;
  initialRotationY?: number;
}

export function ViewerModel({
  modelUrl,
  canvasElements,
  controlsRef,
  dimensions,
  onModelLoaded,
  initialRotationY,
}: ViewerModelProps) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl);

  // Cache texture objects (THREE.CanvasTexture)
  const textureCache = useRef<Map<string, THREE.CanvasTexture>>(new Map());

  // Hook auto-fit camera
  useCameraAutoFit(group, gltf.scene, controlsRef);

  // Báo model đã tải xong
  useEffect(() => {
    if (gltf.scene) {
      onModelLoaded?.();
    }
  }, [gltf.scene, onModelLoaded]);

  // Lưu trữ vật liệu gốc
  const originalMaterials = useRef<Record<string, THREE.Material>>({});
  useEffect(() => {
    if (Object.keys(originalMaterials.current).length > 0) return;

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

  // TẠO VÀ CẬP NHẬT THREE.CanvasTexture
  useEffect(() => {
    // SỬA LỖI (GUARD CLAUSE):
    // Ngăn crash nếu useEffect chạy trước khi prop canvasElements sẵn sàng
    if (!gltf.scene || !canvasElements) {
      console.warn("[ViewerModel] Đang chờ scene hoặc canvasElements map...");
      return; // Bỏ qua nếu chưa sẵn sàng
    }

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materialName = child.material.name;

        const canvasElement = canvasElements.get(materialName);

        if (canvasElement) {
          // Kiểm tra cache
          let texture = textureCache.current.get(materialName);

          if (!texture) {
            // TẠO MỚI CanvasTexture
            texture = new THREE.CanvasTexture(canvasElement);

            // ✅ CẢI THIỆN 1: Sửa lỗi UV map, lật texture theo trục Y
            texture.flipY = true;

            texture.colorSpace = THREE.SRGBColorSpace;

            // ✅ CẢI THIỆN 2: Dùng NearestFilter để ảnh sắc nét, không bị mờ
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;

            texture.generateMipmaps = false;

            textureCache.current.set(materialName, texture);
            console.log(
              `🎨 [ViewerModel] Created CanvasTexture for: ${materialName}`
            );
          } else {
            // CẬP NHẬT texture hiện có
            texture.needsUpdate = true;
            // (Không cần log ở đây vì nó log quá nhiều, có thể bật khi debug)
            // console.log(
            //   `🔄 [ViewerModel] Updated CanvasTexture for: ${materialName}`
            // );
          }

          // Áp dụng texture vào material
          const originalMaterial = originalMaterials.current[materialName];
          if (originalMaterial) {
            child.material = originalMaterial.clone();
            if ("map" in child.material) {
              child.material.map = texture;
            }
            child.material.needsUpdate = true;
          }
        } else {
          // Không có canvas -> trả về material gốc
          const originalMaterial = originalMaterials.current[materialName];
          if (originalMaterial) {
            child.material = originalMaterial;
          }
        }
      }
    });
  }, [gltf.scene, canvasElements]);

  // Logic scale kích thước
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

  // Logic xoay
  const rotationYInRadians = useMemo(() => {
    const rotationDegrees = initialRotationY ?? 180;
    return (rotationDegrees * Math.PI) / 180;
  }, [initialRotationY]);

  // Cleanup textures on unmount
  useEffect(() => {
    return () => {
      textureCache.current.forEach((texture) => {
        texture.dispose();
      });
      textureCache.current.clear();
      console.log("🗑️ [ViewerModel] Disposed all CanvasTextures");
    };
  }, []);

  return (
    <primitive
      ref={group}
      object={gltf.scene}
      rotation={[0, rotationYInRadians, 0]}
    />
  );
}
