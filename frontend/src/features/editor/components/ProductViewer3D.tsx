// src/features/editor/components/ProductViewer3D.tsx (✅ BẢN VÁ "ÉP" VẬT LIỆU)

import React, { Suspense, useMemo, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  Html,
  Loader,
} from "@react-three/drei";
import * as THREE from "three";

interface ProductViewer3DProps {
  modelUrl: string;
  textureData: string | null;
  className?: string;
}

// Hook auto-fit (đã sửa ở bước trước, giữ nguyên)
const useCameraAutoFit = (
  groupRef: React.RefObject<THREE.Group>,
  modelScene: THREE.Scene | null
) => {
  const { camera, size } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!groupRef.current || !modelScene) return;
    if (!isAnimating.current && camera.position.length() === 0) {
      camera.position.set(0, 0, 10);
    }
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.3;
    targetPos.current.set(center.x, center.y, center.z + cameraZ);
    currentPos.current.copy(camera.position);
    isAnimating.current = true;
    camera.lookAt(center);
  }, [groupRef, camera, modelScene]);

  useFrame(() => {
    if (!isAnimating.current) return;
    currentPos.current.lerp(targetPos.current, 0.1);
    camera.position.copy(currentPos.current);
    if (currentPos.current.distanceTo(targetPos.current) < 0.01) {
      isAnimating.current = false;
    }
  });

  useEffect(() => {
    const aspect = size.width / size.height;
    if (aspect < 1) {
      (camera as THREE.PerspectiveCamera).fov = 60;
    } else {
      (camera as THREE.PerspectiveCamera).fov = 50;
    }
    camera.updateProjectionMatrix();
  }, [size, camera]);
};

// Texture cache (giữ nguyên)
const textureCache = new Map<string, THREE.Texture>();

/**
 * Model component
 */
function Model({
  modelUrl,
  textureData,
}: {
  modelUrl: string;
  textureData: string | null;
}) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl);

  useCameraAutoFit(group, gltf.scene);

  // Logic load texture (giữ nguyên)
  const texture = useMemo(() => {
    if (!textureData) return null;
    if (textureCache.has(textureData)) {
      return textureCache.get(textureData)!;
    }
    const loader = new THREE.TextureLoader();
    const loadedTexture = loader.load(textureData);
    loadedTexture.encoding = THREE.sRGBEncoding;
    loadedTexture.flipY = false;
    loadedTexture.needsUpdate = true;
    if (textureCache.size > 5) {
      const firstKey = Array.from(textureCache.keys())[0];
      const oldTex = textureCache.get(firstKey);
      if (oldTex) oldTex.dispose();
      textureCache.delete(firstKey);
    }
    textureCache.set(textureData, loadedTexture);
    return loadedTexture;
  }, [textureData]);

  // =================================================================
  // ✅✅✅ BẢN VÁ MỚI NẰM Ở ĐÂY ✅✅✅
  // Chúng ta sẽ "ép" vật liệu mới thay vì "clone" vật liệu cũ
  // =================================================================
  useEffect(() => {
    if (!texture) return;

    // 1. Tạo một vật liệu (Material) mới hoàn toàn
    const newMaterial = new THREE.MeshStandardMaterial({
      map: texture, // <-- Dán texture (con lạc đà)
      metalness: 0.1, // Giảm độ bóng (cho giống cốc sứ)
      roughness: 0.8, // Tăng độ nhám
    });

    // 2. Duyệt qua model 3D
    gltf.scene.traverse((child) => {
      // 3. Nếu child là một Mesh (vật thể thấy được)
      if (child instanceof THREE.Mesh) {
        // 4. ÉP nó phải dùng vật liệu mới của chúng ta
        child.material = newMaterial;
      }
    });

    // 5. Cleanup (dọn dẹp khi texture thay đổi)
    return () => {
      // Dọn dẹp vật liệu cũ (nếu có)
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.dispose();
          }
        }
      });
      // Dọn dẹp vật liệu mới
      newMaterial.map?.dispose();
      newMaterial.dispose();
    };
  }, [gltf.scene, texture]); // <-- Chạy lại khi texture thay đổi

  return <primitive ref={group} object={gltf.scene} />;
}

// ✅ MAIN COMPONENT (Đã xóa prop 'camera' ở bước trước)
export default function ProductViewer3D({
  modelUrl,
  textureData,
  className,
}: ProductViewer3DProps) {
  return (
    <div className={`w-full h-full bg-gray-100 rounded-lg ${className || ""}`}>
      <Canvas gl={{ preserveDrawingBuffer: true }}>
        <Suspense
          fallback={
            <Html center>
              <div className="text-center text-gray-500">
                Đang tải phôi 3D...
              </div>
            </Html>
          }
        >
          <Environment preset="studio" />
          <Model modelUrl={modelUrl} textureData={textureData} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={0.5}
            maxDistance={50}
            autoRotate={false}
            // Thêm các thuộc tính giảm độ nhạy
            enableDamping={true}
            dampingFactor={0.1}
            zoomSpeed={0.7}
            rotateSpeed={0.2}
          />
        </Suspense>
      </Canvas>
      <Loader />
    </div>
  );
}
