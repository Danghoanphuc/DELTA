// src/features/editor/hooks/useCameraAutoFit.ts
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export const useCameraAutoFit = (
  groupRef: React.RefObject<THREE.Group | null>,
  modelScene: THREE.Object3D | null,
  controlsRef: React.RefObject<OrbitControlsImpl | null>
) => {
  const { camera, size } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetCenter = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  // Tính toán vị trí
  useEffect(() => {
    if (!groupRef.current || !modelScene || !controlsRef.current) return;
    const controls = controlsRef.current;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const boxSize = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);

    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    // ✅ SỬA LỖI "DÍ SÁT" TẠI ĐÂY:
    // Tăng từ 1.3 lên 1.5 để lùi camera ra xa hơn
    cameraZ *= 2.2;

    targetPos.current.set(center.x, center.y, center.z + cameraZ);
    targetCenter.current.copy(center);
    isAnimating.current = true;
  }, [groupRef, camera, modelScene, controlsRef]);

  // Hoạt ảnh (Đã sửa lỗi zoom)
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (isAnimating.current) {
      camera.position.lerp(targetPos.current, 0.1);
      controls.target.lerp(targetCenter.current, 0.1);

      if (
        camera.position.distanceTo(targetPos.current) < 0.01 &&
        controls.target.distanceTo(targetCenter.current) < 0.01
      ) {
        isAnimating.current = false;
        camera.position.copy(targetPos.current);
        controls.target.copy(targetCenter.current);
      }
    }

    // Luôn gọi update() để zoom/damping hoạt động
    controls.update();
  });

  // Điều chỉnh FOV (Giữ nguyên)
  useEffect(() => {
    const aspect = size.width / size.height;
    if (aspect < 1) {
      (camera as THREE.PerspectiveCamera).fov = 60;
    } else {
      (camera as THREE.PerspectiveCamera).fov = 50;
    }
    camera.updateProjectionMatrix();
  }, [size, camera]);

  // Hủy animation khi người dùng tương tác (Giữ nguyên)
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const stopAnimation = () => {
      isAnimating.current = false;
    };

    controls.addEventListener("start", stopAnimation);
    (controls as any).addEventListener("wheel", stopAnimation);

    return () => {
      controls.removeEventListener("start", stopAnimation);
      (controls as any).removeEventListener("wheel", stopAnimation);
    };
  }, [controlsRef]);
};
