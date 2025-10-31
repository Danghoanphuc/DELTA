// src/features/printer/studio/ProductViewer3D.tsx (✅ FIXED WITH AUTO-FIT CAMERA)

import React, { Suspense, useMemo, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ProductViewer3DProps {
  modelUrl: string;
  textureData: string | null;
}

// ✅ FIX 1: CAMERA AUTO-FIT HOOK
const useCameraAutoFit = (groupRef: React.RefObject<THREE.Group>) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!groupRef.current) return;

    // Tính Bounding Box của model
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Tính khoảng cách camera dựa trên size
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    // Thêm padding 30%
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

    // Lerp camera position
    currentPos.current.lerp(targetPos.current, 0.1);
    camera.position.copy(currentPos.current);

    // Stop khi đủ gần
    if (currentPos.current.distanceTo(targetPos.current) < 0.01) {
      isAnimating.current = false;
    }
  });
};

// ✅ FIX 2: MODEL COMPONENT WITH TEXTURE CACHE
const textureCache = new Map<string, THREE.Texture>();

const Model = ({ modelUrl, textureData }: ProductViewer3DProps) => {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl);

  // ✅ Camera auto-fit
  useCameraAutoFit(group);

  // ✅ FIX 3: OPTIMIZED TEXTURE LOADING WITH CACHE
  const texture = useMemo(() => {
    if (!textureData) return null;

    // Check cache
    if (textureCache.has(textureData)) {
      return textureCache.get(textureData)!;
    }

    const loader = new THREE.TextureLoader();
    const tex = loader.load(textureData);
    tex.encoding = THREE.sRGBEncoding;
    tex.flipY = false;
    tex.needsUpdate = true;

    // Cache với limit (max 5 textures)
    if (textureCache.size > 5) {
      const firstKey = Array.from(textureCache.keys())[0];
      const oldTex = textureCache.get(firstKey);
      if (oldTex) oldTex.dispose(); // ✅ Memory cleanup
      textureCache.delete(firstKey);
    }

    textureCache.set(textureData, tex);
    return tex;
  }, [textureData]);

  // ✅ FIX 4: APPLY TEXTURE TO MODEL
  useEffect(() => {
    if (!texture || !gltf.scene) return;

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          // Clone material để tránh conflict
          const newMaterial = child.material.clone();
          newMaterial.map = texture;
          newMaterial.needsUpdate = true;
          child.material = newMaterial;
        }
      }
    });

    // ✅ Cleanup old materials
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
};

// ✅ MAIN COMPONENT
const ProductViewer3D: React.FC<ProductViewer3DProps> = ({
  modelUrl,
  textureData,
}) => {
  return (
    <Canvas
      key={modelUrl}
      style={{ background: "#f0f0f0", width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 10], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      
      <Suspense fallback={null}>
        <Model modelUrl={modelUrl} textureData={textureData} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={50}
        />
      </Suspense>
    </Canvas>
  );
};

export default ProductViewer3D;
