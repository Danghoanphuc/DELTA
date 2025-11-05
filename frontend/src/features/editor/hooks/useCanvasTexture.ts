// frontend/src/features/editor/hooks/useCanvasTexture.ts
// ✅ BẢN HOÀN CHỈNH: Quản lý THREE.CanvasTexture

import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

interface UseCanvasTextureOptions {
  materialKey: string;
  onTextureReady?: (texture: THREE.CanvasTexture) => void;
}

export const useCanvasTexture = (options: UseCanvasTextureOptions) => {
  const { materialKey, onTextureReady } = options;
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const createTexture = useMemo(() => {
    return (canvas: HTMLCanvasElement) => {
      if (textureRef.current) {
        textureRef.current.image = canvas;
        textureRef.current.needsUpdate = true;
        return textureRef.current;
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.flipY = false;

      textureRef.current = texture;

      if (onTextureReady) {
        onTextureReady(texture);
      }

      console.log(`✅ [CanvasTexture] Created for material: ${materialKey}`);
      return texture;
    };
  }, [materialKey, onTextureReady]);

  const updateTexture = (canvas: HTMLCanvasElement) => {
    if (!canvas) return;
    sourceCanvasRef.current = canvas;

    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    } else {
      createTexture(canvas);
    }
  };

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
