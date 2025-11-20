// features/editor/components/DecalRenderer.tsx
// ✅ PHASE 1 REFACTORED: Sử dụng Zustand store trực tiếp
// Loại bỏ props drilling, component tự lấy state cần thiết

import React, { useRef, useEffect } from 'react';
import { useTexture, Text, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { DecalItem } from '../types/decal.types';
import { useEditorStore, type GizmoMode } from '@/stores/useEditorStore';

// === HELPERS ===
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
  if (decal.decalType === 'image') {
    const texture = useTexture(decal.imageUrl || '');
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
  if (decal.decalType === 'text') {
    const fontSize = decal.size[1] * 0.5;
    return (
      <Text
        fontSize={fontSize}
        color={decal.color || '#000000'}
        maxWidth={decal.size[0]}
        anchorY="middle"
        anchorX="center"
      >
        {decal.text || ''}
      </Text>
    );
  }
  if (decal.decalType === 'shape') {
    const color = decal.color || '#3498db';
    return (
      <>
        {decal.shapeType === 'circle' ? (
          <circleGeometry args={[0.5, 32]} />
        ) : (
          <planeGeometry args={[1, 1]} />
        )}
        <meshStandardMaterial color={color} transparent side={THREE.DoubleSide} />
      </>
    );
  }
  return null;
};

// === COMPONENT CHÍNH (DecalRenderer) ===
interface DecalRendererProps {
  decal: DecalItem;
  onSelect: (id: string | null, isMultiSelect: boolean) => void;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<DecalItem>) => void;
  gizmoMode?: GizmoMode;
  isSnapping?: boolean;
}

export const DecalRenderer: React.FC<DecalRendererProps> = ({ decal }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<any>(null);
  const orbitControls = useThree((state) => state.controls) as any;

  // ✅ PHASE 1: Lấy state và actions từ Zustand store
  const selectedItemIds = useEditorStore((state: any) => state.selectedItemIds);
  const gizmoMode = useEditorStore((state: any) => state.gizmoMode);
  const isSnapping = useEditorStore((state: any) => state.isSnapping);
  const selectItem = useEditorStore((state: any) => state.selectItem);
  const updateItem = useEditorStore((state: any) => state.updateItem);

  const isSelected = selectedItemIds.includes(decal.id);

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

  return (
    <>
      {/* Mesh của Decal */}
      <mesh
        ref={meshRef}
        position={offsetPosition}
        rotation={decalRotation}
        scale={scale}
        visible={decal.isVisible}
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();

          if (decal.isLocked) {
            selectItem(null, false);
            return;
          }

          const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
          selectItem(decal.id, isMultiSelect);
        }}
        onPointerOver={() => {
          if (decal.isLocked) document.body.style.cursor = 'not-allowed';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <DecalContent decal={decal} />
      </mesh>

      {/* GIZMO (Chỉ hiển thị nếu được chọn VÀ không bị khóa) */}
      {isSelected && !decal.isLocked && decal.isVisible && (
        <TransformControls
          ref={controlsRef}
          object={meshRef as any}
          mode={gizmoMode}
          space="world"
          showY={gizmoMode !== 'rotate'}
          showZ={gizmoMode !== 'rotate'}
          showX={gizmoMode !== 'rotate'}
          onMouseUp={() => {
            // ✅ Cập nhật decal khi kết thúc transform
            if (meshRef.current) {
              const { position, scale } = meshRef.current;
              updateItem(decal.id, {
                size: [scale.x, scale.y],
              });
            }
          }}
          translationSnap={isSnapping ? TRANSLATION_SNAP : undefined}
          scaleSnap={isSnapping ? SCALE_SNAP : undefined}
        />
      )}
    </>
  );
};