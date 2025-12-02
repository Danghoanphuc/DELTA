import {
  createCanvas,
  loadImage,
  Image,
  Canvas,
  GlobalFonts,
} from "@napi-rs/canvas";
import path from "path";

export const getCanvasService = () => {
  return {
    create: (width: number, height: number, useHighQualityColor = false) => {
      // @napi-rs/canvas only accepts 2 parameters (width, height)
      const canvas = createCanvas(width, height);
      return canvas;
    },

    load: async (source: string | Buffer) => {
      try {
        return await loadImage(source);
      } catch (error) {
        console.error("[CanvasAdapter] Load Image Failed:", error);
        throw new Error("Cannot load image. Check file format.");
      }
    },

    registerFont: (fontPath: string, familyName: string) => {
      try {
        const absolutePath = path.resolve(fontPath);
        return GlobalFonts.registerFromPath(absolutePath, familyName);
      } catch (error) {
        console.error(`[CanvasAdapter] Font error ${familyName}:`, error);
        return false;
      }
    },

    dispose: (canvas: Canvas) => {
      canvas.width = 0;
      canvas.height = 0;
    },

    ImageClass: Image,
    CanvasClass: Canvas,
  };
};

export const checkCanvasHealth = () => {
  try {
    const c = createCanvas(50, 50);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 0, 50, 50);
    const buffer = c.toBuffer("image/png");
    if (buffer.length < 100) return false;
    return { status: "healthy", engine: "@napi-rs/canvas" };
  } catch (error) {
    console.error("[CanvasAdapter] CRITICAL:", error);
    return false;
  }
};
