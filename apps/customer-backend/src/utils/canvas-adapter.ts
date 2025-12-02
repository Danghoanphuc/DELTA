import { 
    createCanvas, 
    loadImage, 
    Image, 
    Canvas, 
    GlobalFonts 
} from '@napi-rs/canvas';
import path from 'path';

export const getCanvasService = () => {
    return {
        create: (width: number, height: number, useHighQualityColor = false) => {
            return createCanvas(width, height, useHighQualityColor ? 1 : 0);
        },
        load: async (source: string | Buffer) => {
            try {
                return await loadImage(source);
            } catch (error) {
                console.error("[CanvasAdapter] Load Failed:", error);
                throw new Error("Cannot load image.");
            }
        },
        registerFont: (fontPath: string, familyName: string) => {
            try {
                const absolutePath = path.resolve(fontPath);
                return GlobalFonts.registerFromPath(absolutePath, familyName);
            } catch (error) {
                return false;
            }
        },
        dispose: (canvas: Canvas) => {
            canvas.width = 0; 
            canvas.height = 0;
        },
        ImageClass: Image,
        CanvasClass: Canvas
    };
};

export const checkCanvasHealth = () => {
    try {
        const c = createCanvas(50, 50);
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'green';
        ctx.fillRect(0,0,50,50);
        return c.toBuffer('image/png').length > 100 
            ? { status: 'healthy', engine: '@napi-rs/canvas' } 
            : false;
    } catch (e) { return false; }
};
