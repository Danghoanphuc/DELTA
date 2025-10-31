// src/features/editor/components/ProductViewer3D.tsx (✅ PRODUCTION VERSION)

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

// ✅ FIX 1: CAMERA AUTO-FIT HOOK
const useCameraAutoFit = (groupRef: React.RefObject<THREE.Group>) => {
  const { camera, size } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!groupRef.current) return;

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Calculate camera distance based on size
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    // Add 30% padding
    cameraZ *= 1.3;

    // Set target position
    targetPos.current.set(center.x, center.y, center.z + cameraZ);
    currentPos.current.copy(camera.position);
    isAnimating.current = true;

    // Update lookAt
    camera.lookAt(center);
  }, [groupRef, camera]);

  // ✅ Smooth animation
  useFrame(() => {
    if (!isAnimating.current) return;

    currentPos.current.lerp(targetPos.current, 0.1);
    camera.position.copy(currentPos.current);

    if (currentPos.current.distanceTo(targetPos.current) < 0.01) {
      isAnimating.current = false;
    }
  });

  // ✅ Responsive FOV based on aspect ratio
  useEffect(() => {
    const aspect = size.width / size.height;
    
    if (aspect < 1) {
      // Portrait mode
      (camera as THREE.PerspectiveCamera).fov = 60;
    } else {
      (camera as THREE.PerspectiveCamera).fov = 50;
    }
    
    camera.updateProjectionMatrix();
  }, [size, camera]);
};

// ✅ FIX 2: TEXTURE CACHE
const textureCache = new Map<string, THREE.Texture>();

/**
 * Model component with texture and camera auto-fit
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

  // ✅ Auto-fit camera
  useCameraAutoFit(group);

  // ✅ FIX 3: OPTIMIZED TEXTURE LOADING WITH CACHE
  const texture = useMemo(() => {
    if (!textureData) return null;

    // Check cache
    if (textureCache.has(textureData)) {
      return textureCache.get(textureData)!;
    }

    const loader = new THREE.TextureLoader();
    const loadedTexture = loader.load(textureData);
    loadedTexture.encoding = THREE.sRGBEncoding;
    loadedTexture.flipY = false;
    loadedTexture.needsUpdate = true;

    // Cache with limit (max 5 textures)
    if (textureCache.size > 5) {
      const firstKey = Array.from(textureCache.keys())[0];
      const oldTex = textureCache.get(firstKey);
      if (oldTex) oldTex.dispose();
      textureCache.delete(firstKey);
    }

    textureCache.set(textureData, loadedTexture);
    return loadedTexture;
  }, [textureData]);

  // ✅ FIX 4: APPLY TEXTURE TO MODEL
  useEffect(() => {
    if (!texture) return;

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          const newMaterial = child.material.clone();
          newMaterial.map = texture;
          newMaterial.needsUpdate = true;
          child.material = newMaterial;
        }
      }
    });

    // ✅ Cleanup
    return () => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.dispose();
          }
        }
      });
    };
  }, [gltf.scene, texture]);

  return <primitive ref={group} object={gltf.scene} />;
}

// ✅ MAIN COMPONENT
export default function ProductViewer3D({
  modelUrl,
  textureData,
  className,
}: ProductViewer3DProps) {
  return (
    <div className={`w-full h-full bg-gray-100 rounded-lg ${className || ""}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
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
          <Model modelUrl={modelUrl} textureData={textureData} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={50}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
      <Loader />
    </div>
  );
}
