// frontend/src/features/editor/hooks/useFabricJSApi.ts
import { useCallback } from 'react';
import * as fabric from 'fabric';

export const useFabricJSApi = (canvasRef: React.RefObject<fabric.Canvas | null>) => {
  const getCanvas = useCallback(() => canvasRef.current, [canvasRef]);

  const addText = useCallback(
    (text: string) => {
      const canvas = getCanvas();
      if (!canvas) return;

      const textObj = new fabric.Textbox(text, {
        left: 100,
        top: 100,
        fontSize: 40,
        fontFamily: 'Arial',
        fill: '#000000',
      });

      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();
    },
    [getCanvas]
  );

  const addImage = useCallback(
    (imageUrl: string) => {
      const canvas = getCanvas();
      if (!canvas) return;

      fabric.Image.fromURL(imageUrl, (img) => {
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.centerObject(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    },
    [getCanvas]
  );

  const addShape = useCallback(
    (shape: 'rect' | 'circle' | 'triangle' | 'line') => {
      const canvas = getCanvas();
      if (!canvas) return;

      let shapeObj;
      switch (shape) {
        case 'rect':
          shapeObj = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: '#ff0000',
          });
          break;
        case 'circle':
          shapeObj = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 50,
            fill: '#0000ff',
          });
          break;
        case 'triangle':
          shapeObj = new fabric.Triangle({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: '#00ff00',
          });
          break;
        case 'line':
          shapeObj = new fabric.Line([50, 50, 200, 50], {
            stroke: '#000000',
            strokeWidth: 2,
          });
          break;
      }

      if (shapeObj) {
        canvas.add(shapeObj);
        canvas.setActiveObject(shapeObj);
        canvas.renderAll();
      }
    },
    [getCanvas]
  );

  const getJSON = useCallback(() => {
    const canvas = getCanvas();
    return canvas ? JSON.stringify(canvas.toJSON()) : '';
  }, [getCanvas]);

  const deleteSelected = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [getCanvas]);

  const duplicateSelected = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: cloned.left! + 20,
          top: cloned.top! + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      });
    }
  }, [getCanvas]);

  return { 
    addText, 
    addImage, 
    addShape, 
    getJSON, 
    getCanvas, 
    deleteSelected, 
    duplicateSelected 
  };
};
