// frontend/src/features/editor/hooks/useCanvasTexture.ts
// ✅ NHIỆM VỤ 1: Hook quản lý THREE.CanvasTexture cho cập nhật 3D realtime

import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

interface UseCanvasTextureOptions {
  materialKey: string;
  onTextureReady?: (texture: THREE.CanvasTexture) => void;
}

/**
 * Hook quản lý THREE.CanvasTexture từ Fabric Canvas
 * Loại bỏ hoàn toàn việc tạo base64, cập nhật 3D tức thì
 */
export const useCanvasTexture = (options: UseCanvasTextureOptions) => {
  const { materialKey, onTextureReady } = options;

  // Ref lưu canvas element từ Fabric
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ref lưu THREE.CanvasTexture
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  /**
   * Tạo CanvasTexture từ canvas element
   * Chỉ tạo 1 lần duy nhất
   */
  const createTexture = useMemo(() => {
    return (canvas: HTMLCanvasElement) => {
      if (textureRef.current) {
        // Nếu đã có texture, chỉ update source
        textureRef.current.image = canvas;
        textureRef.current.needsUpdate = true;
        return textureRef.current;
      }

      // Tạo texture mới
      const texture = new THREE.CanvasTexture(canvas);

      // Cấu hình texture cho print quality
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.flipY = false;

      textureRef.current = texture;

      // Notify parent
      if (onTextureReady) {
        onTextureReady(texture);
      }

      console.log(`✅ [CanvasTexture] Created for material: ${materialKey}`);
      return texture;
    };
  }, [materialKey, onTextureReady]);

  /**
   * Cập nhật texture (không cần tạo base64)
   * Chỉ cần set needsUpdate = true
   */
  const updateTexture = (canvas: HTMLCanvasElement) => {
    if (!canvas) return;

    // Lưu reference đến canvas
    sourceCanvasRef.current = canvas;

    if (textureRef.current) {
      // ✅ MẤU CHỐT: Chỉ cần set needsUpdate, không tạo base64
      textureRef.current.needsUpdate = true;
      console.log(`🔄 [CanvasTexture] Updated for: ${materialKey}`);
    } else {
      // Tạo texture lần đầu
      createTexture(canvas);
    }
  };

  /**
   * Cleanup texture khi unmount
   */
  useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        console.log(`🗑️ [CanvasTexture] Disposed for: ${materialKey}`);
      }
    };
  }, [materialKey]);

  return {
    texture: textureRef.current,
    updateTexture,
    getTexture: () => textureRef.current,
  };
};
