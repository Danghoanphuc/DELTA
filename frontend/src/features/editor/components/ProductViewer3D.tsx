// src/features/editor/components/ProductViewer3D.tsx
// ✅ FINAL FIX: ĐẶT outputColorSpace (LỖI MÀU SẮC) VÀ DPR=2 (LỖI ĐỘ SẮC NÉT)

import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Loader } from "@react-three/drei";
import { ViewerModel } from "./ViewerModel";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three"; // <-- Cần import THREE

// =================================================================
interface ProductViewer3DProps {
  modelUrl: string;
  textures: Record<string, string | null>;
  className?: string;
  dimensions?: { length?: number; width?: number; height?: number };
  onModelLoaded?: () => void;
  initialRotationY?: number;
}

// Component Loading Fallback
const ViewerFallback = () => (
  <Html center>
    <div className="text-center text-gray-500">Đang tải phôi 3D...</div>
  </Html>
);

// Component chính
export default function ProductViewer3D({
  modelUrl,
  textures = {},
  className,
  dimensions,
  onModelLoaded,
  initialRotationY,
}: ProductViewer3DProps) {
  // Tạo ref cho OrbitControls (Giữ nguyên)
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const HIGH_QUALITY_DPR = 2;

  return (
    <div className={`w-full h-full bg-gray-100 rounded-lg ${className || ""}`}>
      <Canvas
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          // ✅ FIX LỖI MÀU SẮC: Buộc WebGL renderer xuất ra không gian màu sRGB (rất quan trọng)
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={HIGH_QUALITY_DPR}
      >
        <Suspense fallback={<ViewerFallback />}>
          {/* Thiết lập cảnh (Giữ nguyên) */}
          <Environment preset="studio" />
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />

          {/* Gọi Model Logic (Giữ nguyên) */}
          <ViewerModel
            modelUrl={modelUrl}
            textures={textures}
            controlsRef={controlsRef}
            dimensions={dimensions}
            onModelLoaded={onModelLoaded}
            initialRotationY={initialRotationY ?? 180} // Mặc định xoay 180 độ
          />

          {/* SỬA LỖI ZOOM IN TẠI ĐÂY (Giữ nguyên) */}
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
