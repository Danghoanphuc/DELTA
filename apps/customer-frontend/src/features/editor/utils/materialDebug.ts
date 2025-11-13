// frontend/src/features/editor/utils/materialDebug.ts
// 🔥 UTILITY: Debug và verify material names

import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

/**
 * 🎯 Extract tất cả material names từ GLB file
 * Dùng để debug và verify material names
 */
export async function extractMaterialNames(
  modelUrl: string
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        const materials = new Set<string>();

        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => materials.add(mat.name));
            } else {
              materials.add(child.material.name);
            }
          }
        });

        resolve(Array.from(materials));
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * 🎯 Verify xem material name có tồn tại trong model không
 */
export async function verifyMaterialName(
  modelUrl: string,
  materialName: string
): Promise<{
  exists: boolean;
  allMaterials: string[];
  suggestions: string[];
}> {
  const allMaterials = await extractMaterialNames(modelUrl);
  const exists = allMaterials.includes(materialName);

  // Tìm các material name tương tự (fuzzy match)
  const suggestions = allMaterials.filter(
    (mat) =>
      mat.toLowerCase().includes(materialName.toLowerCase()) ||
      materialName.toLowerCase().includes(mat.toLowerCase())
  );

  return {
    exists,
    allMaterials,
    suggestions,
  };
}

/**
 * 🎯 Log chi tiết về materials trong model
 */
export async function debugModelMaterials(modelUrl: string): Promise<void> {
  console.log("🔍 [MaterialDebug] Analyzing model:", modelUrl);

  try {
    const materials = await extractMaterialNames(modelUrl);

    console.log("📦 [MaterialDebug] Found materials:", materials);
    console.log("📊 [MaterialDebug] Total count:", materials.length);

    materials.forEach((mat, index) => {
      console.log(`   ${index + 1}. "${mat}"`);
    });

    if (materials.length === 0) {
      console.warn(
        "⚠️ [MaterialDebug] No materials found! Model may have issues."
      );
    }

    return Promise.resolve();
  } catch (error) {
    console.error("❌ [MaterialDebug] Error:", error);
    return Promise.reject(error);
  }
}

/**
 * 🎯 Tạo material name mapping suggestions
 */
export function suggestMaterialMapping(
  modelMaterials: string[],
  surfaceNames: string[]
): Record<string, string> {
  const mapping: Record<string, string> = {};

  // Simple heuristic: Match by similarity
  surfaceNames.forEach((surfaceName) => {
    const matches = modelMaterials.filter(
      (mat) =>
        mat.toLowerCase().includes(surfaceName.toLowerCase()) ||
        surfaceName.toLowerCase().includes(mat.toLowerCase())
    );

    if (matches.length > 0) {
      mapping[surfaceName] = matches[0];
    } else if (modelMaterials.length > 0) {
      // Fallback: Use first material
      mapping[surfaceName] = modelMaterials[0];
    }
  });

  return mapping;
}

/**
 * 🎯 Validate texture setup
 */
export interface TextureSetupValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: {
    modelMaterials: string[];
    canvasMaterials: string[];
    matchedMaterials: string[];
    unmatchedMaterials: string[];
  };
}

export async function validateTextureSetup(
  modelUrl: string,
  canvasElements: Map<string, HTMLCanvasElement>
): Promise<TextureSetupValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get model materials
  const modelMaterials = await extractMaterialNames(modelUrl);
  const canvasMaterials = Array.from(canvasElements.keys());

  // Find matches and unmatched
  const matchedMaterials = canvasMaterials.filter((mat) =>
    modelMaterials.includes(mat)
  );
  const unmatchedMaterials = canvasMaterials.filter(
    (mat) => !modelMaterials.includes(mat)
  );

  // Validation
  if (modelMaterials.length === 0) {
    errors.push("Model has no materials");
  }

  if (canvasMaterials.length === 0) {
    errors.push("No canvas textures available");
  }

  if (matchedMaterials.length === 0 && canvasMaterials.length > 0) {
    errors.push(
      `Material name mismatch! Canvas: [${canvasMaterials.join(
        ", "
      )}], Model: [${modelMaterials.join(", ")}]`
    );
  }

  if (unmatchedMaterials.length > 0) {
    warnings.push(
      `Some canvas materials don't match model: [${unmatchedMaterials.join(
        ", "
      )}]`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info: {
      modelMaterials,
      canvasMaterials,
      matchedMaterials,
      unmatchedMaterials,
    },
  };
}
