// frontend/src/features/editor/components/ProductViewer3D.tsx
// ✅ NHIỆM VỤ 1: NHẬN CANVAS ELEMENTS THAY VÌ BASE64 TEXTURES

import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Loader } from "@react-three/drei";
import { ViewerModel } from "./ViewerModel";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

interface ProductViewer3DProps {
  modelUrl: string;
  // ✅ THAY ĐỔI: Nhận Map thay vì Record<string, string>
  canvasElements: Map<string, HTMLCanvasElement>;
  className?: string;
  dimensions?: { length?: number; width?: number; height?: number };
  onModelLoaded?: () => void;
  initialRotationY?: number;
}

const ViewerFallback = () => (
  <Html center>
    <div className="text-center text-gray-500">Đang tải phôi 3D...</div>
  </Html>
);

export default function ProductViewer3D({
  modelUrl,
  canvasElements,
  className,
  dimensions,
  onModelLoaded,
  initialRotationY,
}: ProductViewer3DProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const HIGH_QUALITY_DPR = 2;

  return (
    <div className={`w-full h-full bg-gray-100 rounded-lg ${className || ""}`}>
      <Canvas
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={HIGH_QUALITY_DPR}
      >
        <Suspense fallback={<ViewerFallback />}>
          <Environment preset="studio" />
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />

          {/* ✅ TRUYỀN canvasElements */}
          <ViewerModel
            modelUrl={modelUrl}
            canvasElements={canvasElements}
            controlsRef={controlsRef}
            dimensions={dimensions}
            onModelLoaded={onModelLoaded}
            initialRotationY={initialRotationY ?? 180}
          />

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            minDistance={0.1}
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
