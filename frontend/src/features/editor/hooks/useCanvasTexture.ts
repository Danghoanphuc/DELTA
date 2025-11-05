// frontend/src/features/editor/hooks/useCanvasTexture.ts
// ✅ BẢN TỐI ƯU: Quản lý THREE.CanvasTexture hiệu quả

import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

interface UseCanvasTextureOptions {
  materialKey: string;
  onTextureReady?: (texture: THREE.CanvasTexture) => void;
}

export const useCanvasTexture = (options: UseCanvasTextureOptions) => {
  const { materialKey, onTextureReady } = options;

  // ✅ Dùng ref để tránh re-create texture
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ✅ FIX: Callback để tạo texture (chỉ chạy 1 lần)
  const createTexture = useCallback(
    (canvas: HTMLCanvasElement) => {
      console.log(`🎨 [CanvasTexture] Creating texture for: ${materialKey}`);

      const texture = new THREE.CanvasTexture(canvas);

      // ✅ Cấu hình texture tối ưu
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.flipY = false;
      texture.needsUpdate = true;

      textureRef.current = texture;

      if (onTextureReady) {
        onTextureReady(texture);
      }

      console.log(`✅ [CanvasTexture] Texture created for: ${materialKey}`);
      return texture;
    },
    [materialKey, onTextureReady]
  );

  // ✅ FIX: Update texture hiệu quả
  const updateTexture = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (!canvas) {
        console.warn(
          `⚠️ [CanvasTexture] Received null canvas for: ${materialKey}`
        );
        return;
      }

      sourceCanvasRef.current = canvas;

      if (textureRef.current) {
        // ✅ Reuse existing texture - chỉ update image
        textureRef.current.image = canvas;
        textureRef.current.needsUpdate = true;
        console.log(`🔄 [CanvasTexture] Texture updated for: ${materialKey}`);
      } else {
        // ✅ Tạo texture mới lần đầu
        createTexture(canvas);
      }
    },
    [materialKey, createTexture]
  );

  // ✅ Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        console.log(`🗑️ [CanvasTexture] Disposed texture for: ${materialKey}`);
      }
    };
  }, [materialKey]);

  return {
    texture: textureRef.current,
    updateTexture,
    getTexture: () => textureRef.current,
  };
};
