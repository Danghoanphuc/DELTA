// frontend/src/features/editor/components/ViewerModel.tsx
// ✅ THÊM: Material validation và debug logging

import React, { useMemo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useCameraAutoFit } from "../hooks/useCameraAutoFit";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ViewerModelProps {
  modelUrl: string;
  textures: Record<string, THREE.CanvasTexture | null>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  dimensions?: { length?: number; width?: number; height?: number };
  onModelLoaded?: () => void;
  initialRotationY?: number;
}

const textureCache = new Map<string, THREE.Texture>();

export function ViewerModel({
  modelUrl,
  textures = {},
  controlsRef,
  dimensions,
  onModelLoaded,
  initialRotationY,
}: ViewerModelProps) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl);

  useCameraAutoFit(group, gltf.scene, controlsRef);

  useEffect(() => {
    if (gltf.scene) {
      onModelLoaded?.();
    }
  }, [gltf.scene]);

  // Lưu trữ vật liệu gốc
  const originalMaterials = useRef<Record<string, THREE.Material>>({});
  useEffect(() => {
    if (Object.keys(originalMaterials.current).length > 0 || !gltf.scene)
      return;
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

  // ✅ THÊM: Validate material mapping
  useEffect(() => {
    if (!gltf.scene) return;

    // 1. Collect all material names from model
    const modelMaterials = new Set<string>();
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => modelMaterials.add(mat.name));
        } else {
          modelMaterials.add(child.material.name);
        }
      }
    });

    // 2. Get provided texture keys
    const providedMaterials = Object.keys(textures).filter(
      (key) => textures[key] !== null
    );

    // 3. Find matches and mismatches
    const matched: string[] = [];
    const unmatched: string[] = [];

    providedMaterials.forEach((matName) => {
      if (modelMaterials.has(matName)) {
        matched.push(matName);
      } else {
        unmatched.push(matName);
      }
    });

    const modelMaterialsArray = Array.from(modelMaterials);

    // 4. Log validation results
    console.group("🔍 [ViewerModel] Material Mapping Validation");
    console.log("📦 Model materials:", modelMaterialsArray);
    console.log("🎨 Provided textures:", providedMaterials);
    console.log("✅ Matched materials:", matched);

    if (unmatched.length > 0) {
      console.warn("⚠️ Unmatched materials:", unmatched);
      console.warn("💡 These textures won't be applied to the 3D model");
      console.warn("💡 Check your product config 'materialName' values");
      console.warn("💡 Material names are case-sensitive!");

      // Suggest similar names
      unmatched.forEach((unmatchedName) => {
        const similar = modelMaterialsArray.filter(
          (modelName) =>
            modelName.toLowerCase().includes(unmatchedName.toLowerCase()) ||
            unmatchedName.toLowerCase().includes(modelName.toLowerCase())
        );
        if (similar.length > 0) {
          console.warn(
            `   🔍 Did you mean: ${similar.join(
              ", "
            )} instead of "${unmatchedName}"?`
          );
        }
      });
    }

    if (matched.length === 0 && providedMaterials.length > 0) {
      console.error("❌ CRITICAL: NO MATERIALS MATCHED!");
      console.error("❌ Textures will NOT be applied to the 3D model");
      console.error("💡 Possible causes:");
      console.error("   1. Material names in product config don't match GLB");
      console.error("   2. Case mismatch (e.g., 'Material' vs 'material')");
      console.error("   3. Wrong material names in surfaces config");
      console.error("");
      console.error("💡 Fix:");
      console.error(
        `   Update your product config to use: [${modelMaterialsArray.join(
          ", "
        )}]`
      );
    }

    if (matched.length > 0) {
      console.log(
        `✅ ${matched.length}/${providedMaterials.length} materials mapped successfully`
      );
    }

    console.groupEnd();
  }, [gltf.scene, textures]);

  // Load textures
  const loadedTextures = useMemo(() => {
    console.log(`🖼️ [ViewerModel] Processing textures...`);
    const newTextures: Record<string, THREE.Texture> = {};
    for (const materialName in textures) {
      const textureData = textures[materialName];

      if (textureData instanceof THREE.CanvasTexture) {
        newTextures[materialName] = textureData;
        console.log(`✅ [ViewerModel] Texture loaded for: ${materialName}`);
      } else {
        console.warn(`⚠️ [ViewerModel] Invalid texture for: ${materialName}`);
      }
    }
    return newTextures;
  }, [textures]);

  // Áp texture
  useEffect(() => {
    if (!gltf.scene) return;

    console.log(`🎨 [ViewerModel] Applying textures to model...`);

    let appliedCount = 0;
    let skippedCount = 0;

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materialName = child.material.name;
        const originalMaterial = originalMaterials.current[materialName];
        const newTexture = loadedTextures[materialName];

        if (newTexture && originalMaterial) {
          // Clone material để tránh ảnh hưởng đến material khác
          const clonedMaterial = originalMaterial.clone();

          if ("map" in clonedMaterial) {
            clonedMaterial.map = newTexture;
            clonedMaterial.needsUpdate = true;
          }

          child.material = clonedMaterial;
          appliedCount++;
          console.log(`✅ [ViewerModel] Applied texture to: ${materialName}`);
        } else if (originalMaterial && !newTexture) {
          // Khôi phục material gốc nếu không có texture
          child.material = originalMaterial;
          skippedCount++;
          console.log(
            `🔄 [ViewerModel] Restored original material: ${materialName} (no texture provided)`
          );
        }
      }
    });

    console.log(
      `📊 [ViewerModel] Texture application summary: ${appliedCount} applied, ${skippedCount} skipped`
    );
  }, [gltf.scene, loadedTextures]);

  // Scale
  useEffect(() => {
    if (!group.current || !gltf.scene) return;
    if (!group.current.userData.originalBox) {
      if (group.current.children.length === 0) return;
      const box = new THREE.Box3().setFromObject(group.current);
      const size = box.getSize(new THREE.Vector3());
      if (size.x === 0 || size.y === 0 || size.z === 0) return;
      group.current.userData.originalBox = size;
    }
    const originalSize = group.current.userData.originalBox as THREE.Vector3;
    const scaleX = (dimensions?.width || originalSize.x) / originalSize.x;
    const scaleY = (dimensions?.height || originalSize.y) / originalSize.y;
    const scaleZ = (dimensions?.length || originalSize.z) / originalSize.z;
    group.current.scale.set(scaleX, scaleY, scaleZ);
  }, [dimensions, gltf.scene]);

  const rotationYInRadians = useMemo(() => {
    const rotationDegrees = initialRotationY ?? 180;
    return (rotationDegrees * Math.PI) / 180;
  }, [initialRotationY]);

  if (!gltf.scene) return null;

  return (
    <primitive
      ref={group}
      object={gltf.scene}
      rotation={[0, rotationYInRadians, 0]}
    />
  );
}
