// features/editor/components/ProductViewer3D.tsx
// ✅ BẢN VÁ: Sửa lỗi import "@drei" -> "@react-three/drei"
// ✅ BẢN VÁ 3: Sửa lỗi ReferenceError 'onUpdate is not defined'

import React, {
  Suspense,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  Loader,
  SpotLight,
} from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { toast } from "sonner";
import { ViewerModel } from "./ViewerModel"; // Component con render model
import {
  use3DInteraction,
  InteractionResult,
  SurfaceDefinition,
} from "../hooks/use3DInteraction";
import { DecalItem } from "../types/decal.types";
import { GizmoMode } from "../hooks/useDesignEditor";

// Ngưỡng kéo (khoảng cách pixel)
const DRAG_THRESHOLD = 5;

// === COMPONENT CON (NỘI BỘ) ===

// Định nghĩa Handle (tay cầm) cho ref
interface SceneContentHandle {
  handleClick: (event: React.MouseEvent) => void;
  handleDrop: (event: React.DragEvent, dropData: any) => void;
  handleDragOver: (event: React.DragEvent) => void;
}

interface SceneContentProps {
  modelUrl: string;
  onModelLoaded?: () => void;
  initialRotationY?: number;
  decals: DecalItem[];
  surfaceMapping: SurfaceDefinition[];
  onDrop: (dropData: any, interactionResult: InteractionResult) => void;
  selectedDecalId: string | null;
  onDecalSelect: (id: string | null, isMultiSelect: boolean) => void;
  onUpdate: (id: string, updates: Partial<DecalItem>) => void; // Tên nội bộ là 'onUpdate'
  gizmoMode: GizmoMode;
  isSnapping: boolean;
  modelRef: React.RefObject<THREE.Group | null>;
  isDraggingFlag: React.MutableRefObject<boolean>;
}

const SceneContent = forwardRef<SceneContentHandle, SceneContentProps>(
  (
    {
      modelUrl,
      onModelLoaded,
      initialRotationY,
      decals,
      surfaceMapping,
      onDrop,
      selectedDecalId,
      onDecalSelect,
      onUpdate, // Nhận 'onUpdate'
      gizmoMode,
      isSnapping,
      modelRef,
      isDraggingFlag,
    },
    ref
  ) => {
    const controlsRef = useRef<OrbitControlsImpl>(null);

    const { handleClick, handleDrop, handleDragOver } = use3DInteraction({
      modelRef,
      surfaceMapping, // Truyền surfaceMapping
      onSurfaceClick: (result) => {
        if (isDraggingFlag.current) return;
        onDecalSelect(null, false); // Bỏ chọn khi click ra ngoài
      },
      onSurfaceDrop: (interactionResult, dropData) => {
        onDrop(dropData, interactionResult);
      },
    });

    useImperativeHandle(ref, () => ({
      handleClick,
      handleDrop,
      handleDragOver,
    }));

    return (
      <Suspense fallback={<Html center>Đang tải...</Html>}>
        {/* Ánh sáng */}
        <Environment preset="studio" />
        <ambientLight intensity={0.3} />
        <hemisphereLight groundColor="black" intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <SpotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1.5}
        />

        {/* Model chính */}
        <ViewerModel
          modelRef={modelRef}
          modelUrl={modelUrl}
          controlsRef={controlsRef}
          onModelLoaded={onModelLoaded}
          initialRotationY={initialRotationY ?? 180}
          decals={decals}
          selectedDecalId={selectedDecalId}
          onDecalSelect={onDecalSelect}
          onDecalUpdate={onUpdate} // Truyền 'onUpdate' xuống
          gizmoMode={gizmoMode}
          isSnapping={isSnapping}
        />

        {/* Điều khiển */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={0.1}
          maxDistance={50}
          enableDamping={true}
        />
      </Suspense>
    );
  }
);

// === COMPONENT CHA (ProductViewer3D) ===
interface ProductViewer3DProps {
  modelUrl: string;
  className?: string;
  onModelLoaded?: () => void;
  initialRotationY?: number;
  decals: DecalItem[];
  surfaceMapping: SurfaceDefinition[];
  onDrop: (dropData: any, interactionResult: InteractionResult) => void;
  selectedDecalId: string | null;
  onDecalSelect: (id: string | null, isMultiSelect: boolean) => void;
  onDecalUpdate: (id: string, updates: Partial<DecalItem>) => void; // Tên bên ngoài là 'onDecalUpdate'
  gizmoMode: GizmoMode;
  isSnapping: boolean;
}

export default function ProductViewer3D({
  modelUrl,
  className,
  onModelLoaded,
  initialRotationY,
  decals,
  surfaceMapping,
  onDrop,
  selectedDecalId,
  onDecalSelect,
  onDecalUpdate, // Nhận 'onDecalUpdate'
  gizmoMode,
  isSnapping,
}: ProductViewer3DProps) {
  const HIGH_QUALITY_DPR = 2;
  const modelRef = useRef<THREE.Group>(null);

  // === Logic Debounced Click ===
  const sceneContentRef = useRef<SceneContentHandle>(null);
  const isDraggingFlag = useRef(false);
  const pointerDownPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    pointerDownPos.current = { x: event.clientX, y: event.clientY };
    isDraggingFlag.current = false;
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (event.buttons > 0) {
      const deltaX = Math.abs(event.clientX - pointerDownPos.current.x);
      const deltaY = Math.abs(event.clientY - pointerDownPos.current.y);
      if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
        isDraggingFlag.current = true;
      }
    }
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (isDraggingFlag.current) {
      event.stopPropagation();
      return;
    }
    sceneContentRef.current?.handleClick(event);
  }, []);
  // === Hết Handlers Debounced Click ===

  // === Handlers Drop (ĐÃ SỬA LỖI JSON.PARSE) ===
  const handleCanvasDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    try {
      const jsonData = event.dataTransfer.getData("application/json");
      const file = event.dataTransfer.files?.[0];

      let dropData: any = null;

      if (jsonData && jsonData.startsWith("{")) {
        try {
          dropData = JSON.parse(jsonData);
        } catch (jsonError) {
          console.warn("[DND] Lỗi parse JSON (bỏ qua):", jsonError);
          dropData = null;
        }
      } else if (file && file.type.startsWith("image/")) {
        dropData = { type: "imageFile", file: file };
      }

      if (dropData) {
        sceneContentRef.current?.handleDrop(event, dropData);
      }
    } catch (e: any) {
      // Thêm kiểu 'any' cho 'e'
      console.error("Lỗi nghiêm trọng khi xử lý drop:", e);
      // Hiển thị lỗi cụ thể hơn nếu có
      toast.error(e.message || "Lỗi khi xử lý dữ liệu kéo thả.");
    }
  }, []); // Dependencies giữ nguyên (rỗng)

  const handleCanvasDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    sceneContentRef.current?.handleDragOver(event);
  }, []);

  return (
    <div className={`w-full h-full bg-gray-100 ${className || ""}`}>
      <Canvas
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={HIGH_QUALITY_DPR}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onClick={handleCanvasClick}
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
      >
        <SceneContent
          ref={sceneContentRef}
          modelUrl={modelUrl}
          onModelLoaded={onModelLoaded}
          initialRotationY={initialRotationY}
          decals={decals}
          surfaceMapping={surfaceMapping}
          onDrop={onDrop}
          selectedDecalId={selectedDecalId}
          onDecalSelect={onDecalSelect}
          // ✅✅✅ SỬA LỖI TẠI ĐÂY ✅✅✅
          // Truyền `onDecalUpdate` (từ props) vào `onUpdate` (của SceneContent)
          onUpdate={onDecalUpdate}
          gizmoMode={gizmoMode}
          isSnapping={isSnapping}
          modelRef={modelRef}
          isDraggingFlag={isDraggingFlag}
        />
      </Canvas>
      <Loader />
    </div>
  );
}
