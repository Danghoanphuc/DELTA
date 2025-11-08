// features/editor/components/DecalRenderer.tsx
// ✅ BẢN VÁ: Sửa lỗi import "@drei" -> "@react-three/drei"
// ✅ BẢN VÁ 3: Sửa lỗi Crash (e.stopPropagation) và Warning (deprecated update)

import React, { useRef, useEffect } from "react";
import { useTexture, Text, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { DecalItem } from "../types/decal.types";
import { GizmoMode } from "../hooks/useDesignEditor";

// === Helpers ===
const decalUp = new THREE.Vector3(0, 1, 0);
const decalPosition = new THREE.Vector3();
const decalTarget = new THREE.Vector3();
const decalMatrix = new THREE.Matrix4();
const decalRotation = new THREE.Euler();
const decalNormal = new THREE.Vector3();
const TRANSLATION_SNAP = 0.1;
const SCALE_SNAP = 0.05;

// === COMPONENT CON (Render nội dung decal) ===
const DecalContent: React.FC<{ decal: DecalItem }> = ({ decal }) => {
  if (decal.decalType === "image") {
    const texture = useTexture(decal.imageUrl || "");
    if (!texture) return null;
    return (
      <>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          map={texture}
          transparent
          polygonOffset
          polygonOffsetFactor={-1}
          side={THREE.DoubleSide}
        />
      </>
    );
  }
  if (decal.decalType === "text") {
    const fontSize = decal.size[1] * 0.5;
    return (
      <Text
        fontSize={fontSize}
        color={decal.color || "#000000"}
        maxWidth={decal.size[0]}
        anchorY="middle"
        anchorX="center"
      >
        {decal.text || ""}
      </Text>
    );
  }
  if (decal.decalType === "shape") {
    const color = decal.color || "#3498db";
    return (
      <>
        {decal.shapeType === "circle" ? (
          <circleGeometry args={[0.5, 32]} />
        ) : (
          <planeGeometry args={[1, 1]} />
        )}
        <meshStandardMaterial
          color={color}
          transparent
          side={THREE.DoubleSide}
        />
      </>
    );
  }
  return null;
};
// --- Hết DecalContent ---

// === COMPONENT CHÍNH (DecalRenderer) ===
interface DecalRendererProps {
  decal: DecalItem;
  onSelect: (id: string | null, isMultiSelect: boolean) => void;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<DecalItem>) => void;
  gizmoMode: GizmoMode;
  isSnapping: boolean;
}

export const DecalRenderer: React.FC<DecalRendererProps> = ({
  decal,
  onSelect,
  isSelected,
  onUpdate,
  gizmoMode,
  isSnapping,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<any>(null);
  const orbitControls = useThree((state) => state.controls) as any;

  // Tính toán transform (vị trí, xoay, scale)
  decalNormal.fromArray(decal.normal);
  decalPosition.fromArray(decal.position);
  const offsetPosition = decalPosition.add(decalNormal.multiplyScalar(0.0001));
  decalNormal.fromArray(decal.normal);
  decalTarget.addVectors(offsetPosition, decalNormal);
  decalMatrix.lookAt(offsetPosition, decalTarget, decalUp);
  decalRotation.setFromRotationMatrix(decalMatrix);
  decalRotation.z += decal.rotation[2];
  const scale: [number, number, number] = [decal.size[0], decal.size[1], 1];

  // Cập nhật Gizmo khi state thay đổi
  useEffect(() => {
    if (isSelected && controlsRef.current) {
      // ❌ BỎ DÒNG NÀY (Sửa lỗi Warning deprecated)
      // controlsRef.current.update();
    }
  }, [isSelected, decal]);

  // === Xử lý Ẩn/Hiện ===
  if (!decal.isVisible) {
    return null; // Không render nếu bị ẩn
  }

  return (
    <>
      {/* Mesh của Decal */}
      <mesh
        ref={meshRef}
        position={offsetPosition}
        rotation={decalRotation}
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();

          if (decal.isLocked) {
            onSelect(null, false);
            return;
          }

          const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
          onSelect(decal.id, isMultiSelect);
        }}
        onPointerOver={() => {
          if (decal.isLocked) document.body.style.cursor = "not-allowed";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <DecalContent decal={decal} />
      </mesh>

      {/* GIZMO (Chỉ hiển thị nếu được chọn VÀ không bị khóa) */}
      {isSelected && !decal.isLocked && (
        <TransformControls
          ref={controlsRef}
          object={meshRef as any}
          mode={gizmoMode}
          space="world"
          showY={gizmoMode !== "rotate"}
          showZ={gizmoMode !== "rotate"}
          showX={gizmoMode !== "rotate"}
          onMouseDown={(e: any) => {
            // ❌ BỎ CÁC DÒNG NÀY (Sửa lỗi Crash)
            // e.stopPropagation();
            // e.nativeEvent.stopImmediatePropagation();
            if (orbitControls) orbitControls.enabled = false;
          }}
          onMouseUp={(e: any) => {
            // ❌ BỎ CÁC DÒNG NÀY (Sửa lỗi Crash)
            // e.stopPropagation();
            // e.nativeEvent.stopImmediatePropagation();
            if (orbitControls) orbitControls.enabled = true;

            if (meshRef.current) {
              const { position, scale } = meshRef.current;
              onUpdate(decal.id, {
                // position: position.toArray(), // (Cần logic phức tạp hơn)
                size: [scale.x, scale.y],
              });
            }
          }}
          translationSnap={isSnapping ? TRANSLATION_SNAP : null}
          scaleSnap={isSnapping ? SCALE_SNAP : null}
        />
      )}
    </>
  );
};
