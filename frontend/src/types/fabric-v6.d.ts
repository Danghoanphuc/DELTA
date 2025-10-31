// Type definitions cho Fabric.js v6.x
// Fabric v6 đã thay đổi hoàn toàn cách import và API

declare module 'fabric' {
  // Core Classes
  export class Canvas {
    constructor(element: HTMLCanvasElement | string, options?: any);
    
    // Properties
    width: number;
    height: number;
    backgroundColor: string | null;
    
    // Methods
    add(...objects: any[]): this;
    remove(...objects: any[]): this;
    dispose(): void;
    renderAll(): void;
    clear(): void;
    setActiveObject(object: any): this;
    getActiveObject(): any | null;
    getActiveObjects(): any[];
    discardActiveObject(): this;
    requestRenderAll(): void;
    
    // Serialization
    toJSON(propertiesToInclude?: string[]): any;
    toDataURL(options?: {
      format?: string;
      quality?: number;
      multiplier?: number;
      left?: number;
      top?: number;
      width?: number;
      height?: number;
    }): string;
    
    toBlob(options?: {
      format?: string;
      quality?: number;
      multiplier?: number;
      left?: number;
      top?: number;
      width?: number;
      height?: number;
    }): Promise<Blob>;
    
    loadFromJSON(json: any, callback?: () => void): void;
  }

  export class StaticCanvas {
    toBlob(options?: {
      format?: string;
      quality?: number;
      multiplier?: number;
    }): Promise<Blob>;
  }

  // Shape Classes
  export class Rect {
    constructor(options?: {
      left?: number;
      top?: number;
      width?: number;
      height?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      selectable?: boolean;
      [key: string]: any;
    });
  }

  export class Circle {
    constructor(options?: {
      left?: number;
      top?: number;
      radius?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      [key: string]: any;
    });
  }

  export class Triangle {
    constructor(options?: {
      left?: number;
      top?: number;
      width?: number;
      height?: number;
      fill?: string;
      [key: string]: any;
    });
  }

  export class Line {
    constructor(points: [number, number, number, number], options?: any);
  }

  export class Polyline {
    constructor(points: Array<{ x: number; y: number }>, options?: any);
  }

  export class Polygon {
    constructor(points: Array<{ x: number; y: number }>, options?: any);
  }

  // Text Classes
  export class Text {
    constructor(text: string, options?: {
      left?: number;
      top?: number;
      fontSize?: number;
      fontFamily?: string;
      fill?: string;
      [key: string]: any;
    });
  }

  export class IText {
    constructor(text: string, options?: {
      left?: number;
      top?: number;
      fontSize?: number;
      fontFamily?: string;
      fill?: string;
      [key: string]: any;
    });
  }

  export class Textbox {
    constructor(text: string, options?: {
      left?: number;
      top?: number;
      width?: number;
      fontSize?: number;
      fill?: string;
      [key: string]: any;
    });
  }

  // Image Class (Fabric v6 đổi tên từ Image thành FabricImage)
  export class FabricImage {
    constructor(element: HTMLImageElement | HTMLCanvasElement, options?: any);
    
    static fromURL(
      url: string,
      callback?: (image: FabricImage) => void,
      options?: any
    ): Promise<FabricImage>;
    
    scaleToWidth(width: number): void;
    scaleToHeight(height: number): void;
    scale(scale: number): void;
  }

  // Group
  export class Group {
    constructor(objects?: any[], options?: any);
    addWithUpdate(object: any): void;
    removeWithUpdate(object: any): void;
  }

  // Path
  export class Path {
    constructor(path: string | any[], options?: any);
  }

  // Gradient
  export class Gradient {
    constructor(options: {
      type?: 'linear' | 'radial';
      coords?: any;
      colorStops?: Array<{ offset: number; color: string }>;
    });
  }

  // Pattern
  export class Pattern {
    constructor(options: {
      source: HTMLImageElement | HTMLCanvasElement | string;
      repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
    });
  }

  // Utility functions
  export function loadSVGFromURL(
    url: string,
    callback: (results: any[], options: any) => void
  ): void;

  export function loadSVGFromString(
    svg: string,
    callback: (results: any[], options: any) => void
  ): void;

  // Re-export as Image alias để tương thích với code cũ
  export { FabricImage as Image };
}
