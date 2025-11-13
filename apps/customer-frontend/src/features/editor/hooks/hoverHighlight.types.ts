// frontend/src/features/editor/hooks/hoverHighlight.types.ts
import * as THREE from "three";
import React from "react";

export interface SurfaceDefinition {
  surfaceKey: string;
  materialName: string;
  artboardSize: {
    width: number;
    height: number;
  };
}

export interface InteractionResult {
  surfaceKey: string;
  uv: THREE.Vector2;
  pixelCoords: {
    x: number;
    y: number;
  };
  worldPoint: THREE.Vector3;
  worldNormal: THREE.Vector3;
}

export interface Use3DHoverHighlightProps {
  modelRef: React.RefObject<THREE.Object3D | null>;
  surfaceMapping: SurfaceDefinition[];
  onSurfaceHoverStart: (result: InteractionResult) => void;
  onSurfaceHoverEnd: (surfaceKey: string) => void;
}

export interface Use3DHoverHighlightReturn {
  handleMouseMove: (event: React.MouseEvent) => void;
  handleMouseLeave: (event: React.MouseEvent) => void;
}
