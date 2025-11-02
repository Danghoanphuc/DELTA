// src/features/editor/components/ProductViewer3D.tsx (BẢN SỬA LỖI onModelLoaded)

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

// =================================================================
// ✅ SỬA LỖI: Thêm `dimensions` vào interface
// =================================================================
interface ProductViewer3DProps {
  modelUrl: string;
  textures: Record<string, string | null>;
  className?: string;
  dimensions?: { length?: number; width?: number; height?: number };
  onModelLoaded?: () => void;
}

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

// Texture cache (Giữ nguyên)
const textureCache = new Map<string, THREE.Texture>();

/**
 * Model component (NÂNG CẤP)
 */
function Model({
  modelUrl,
  textures = {}, // ✅ Vá lỗi 1: Giá trị mặc định
  dimensions,
  onModelLoaded, // ✅ Nhận prop dimensions
}: {
  modelUrl: string;
  textures: Record<string, string | null>;
  // ✅ Thêm dimensions vào props type của Model
  dimensions?: { length?: number; width?: number; height?: number };
  onModelLoaded?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl);
  useEffect(() => {
    if (gltf.scene) {
      onModelLoaded?.(); // Báo cho component cha: "Tôi đã tải xong!"
    }
  }, [gltf.scene, onModelLoaded]);
  // (Logic lưu originalMaterials giữ nguyên)
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

  useCameraAutoFit(group, gltf.scene);

  // (Logic useMemo - loadedTextures giữ nguyên)
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
          loadedTexture.encoding = THREE.sRGBEncoding;
          loadedTexture.flipY = false;
          loadedTexture.needsUpdate = true;
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

  // (useEffect áp dụng texture giữ nguyên)
  useEffect(() => {
    let materialsUpdated = false;

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materialName = child.material.name;
        const newTexture = loadedTextures[materialName];
        const originalMaterial = originalMaterials.current[materialName];

        if (newTexture) {
          if (!(child.material instanceof THREE.MeshStandardMaterial)) {
            const newStandardMaterial = new THREE.MeshStandardMaterial({
              map: newTexture,
              metalness: 0.1,
              roughness: 0.8,
            });
            newStandardMaterial.name = materialName;
            child.material = newStandardMaterial;
          } else {
            (child.material as THREE.MeshStandardMaterial).map = newTexture;
          }
          child.material.needsUpdate = true;
          materialsUpdated = true;
        } else if (textures.hasOwnProperty(materialName) && originalMaterial) {
          child.material = originalMaterial;
          materialsUpdated = true;
        }
      }
    });

    if (materialsUpdated) {
      console.log("3D Viewer: Materials updated.");
    }
  }, [gltf.scene, loadedTextures, textures]);

  // =================================================================
  useEffect(() => {
    if (!group.current || !gltf.scene) return;

    // Chỉ tính kích thước gốc 1 LẦN
    if (!group.current.userData.originalBox) {
      // KIỂM TRA MỚI: Đảm bảo model đã có geometry (children)
      if (group.current.children.length === 0) {
        console.warn("3D Model: Đang chờ geometry, tạm dừng scale...");
        return; // Thoát ra, chờ lần render sau
      }

      const box = new THREE.Box3().setFromObject(group.current);
      const size = box.getSize(new THREE.Vector3());

      // KIỂM TRA MỚI: Đảm bảo kích thước hợp lệ
      if (size.x === 0 || size.y === 0 || size.z === 0) {
        console.warn("3D Model: Kích thước vẫn = 0, đang chờ render...");
        return; // Kích thước chưa sẵn sàng, thoát ra
      }

      // Kích thước đã hợp lệ, LƯU NÓ LẠI
      group.current.userData.originalBox = size;
    }

    // Logic scale (giữ nguyên)
    const originalSize = group.current.userData.originalBox as THREE.Vector3;
    const scaleX = (dimensions?.width || originalSize.x) / originalSize.x;
    const scaleY = (dimensions?.height || originalSize.y) / originalSize.y;
    const scaleZ = (dimensions?.length || originalSize.z) / originalSize.z;

    // Áp dụng scale
    group.current.scale.set(scaleX, scaleY, scaleZ);
  }, [dimensions, gltf.scene]); // Phụ thuộc giữ nguyên

  return <primitive ref={group} object={gltf.scene} />;
}

// ✅ MAIN COMPONENT (Đã cập nhật prop)
export default function ProductViewer3D({
  modelUrl,
  textures = {}, // ✅ Vá lỗi 2: Giá trị mặc định
  className,
  dimensions, // ✅ Truyền prop dimensions
  onModelLoaded, // <--- ✅ SỬA LỖI Ở ĐÂY: Thêm vào
}: ProductViewer3DProps) {
  return (
    <div className={`w-full h-full bg-gray-100 rounded-lg ${className || ""}`}>
      <Canvas
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        dpr={[1, 2]}
      >
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
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />

          <Model
            modelUrl={modelUrl}
            textures={textures}
            dimensions={dimensions}
            onModelLoaded={onModelLoaded} // ✅ Truyền vào Model
          />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={0.5}
            maxDistance={50}
            autoRotate={false}
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
