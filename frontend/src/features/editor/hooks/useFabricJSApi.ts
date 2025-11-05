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

      fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.centerObject(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
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
      activeObject.clone().then((cloned: fabric.Object) => {
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

  const updateTextStyle = useCallback((property: string, value: any) => {
    const canvas = getCanvas();
    const activeObject = canvas?.getActiveObject();
    if (activeObject instanceof fabric.Textbox) {
      activeObject.set(property as any, value);
      canvas?.renderAll();
    }
  }, [getCanvas]);

  const bringToFront = useCallback(() => {
    const canvas = getCanvas();
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      (canvas as any)?.bringToFront(activeObject);
      canvas?.renderAll();
    }
  }, [getCanvas]);

  const sendToBack = useCallback(() => {
    const canvas = getCanvas();
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      (canvas as any)?.sendToBack(activeObject);
      canvas?.renderAll();
    }
  }, [getCanvas]);

  const bringForward = useCallback(() => {
    const canvas = getCanvas();
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      (canvas as any)?.bringForward(activeObject);
      canvas?.renderAll();
    }
  }, [getCanvas]);

  const sendBackwards = useCallback(() => {
    const canvas = getCanvas();
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      (canvas as any)?.sendBackwards(activeObject);
      canvas?.renderAll();
    }
  }, [getCanvas]);

  const align = useCallback((alignment: string) => {
    // Implementation for align
  }, [getCanvas]);

  const applyFilter = useCallback((filter: string) => {
    // Implementation for applyFilter
  }, [getCanvas]);

  const exportCanvas = useCallback(async (format: string) => {
    // Implementation for exportCanvas
  }, [getCanvas]);

  const toggleLock = useCallback(() => {
    const canvas = getCanvas();
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      activeObject.set({
        lockMovementX: !activeObject.lockMovementX,
        lockMovementY: !activeObject.lockMovementY,
        lockScalingX: !activeObject.lockScalingX,
        lockScalingY: !activeObject.lockScalingY,
        lockRotation: !activeObject.lockRotation,
      });
      canvas?.renderAll();
    }
  }, [getCanvas]);

  const toggleVisibility = useCallback(() => {
    const canvas = getCanvas();
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      activeObject.set({ visible: !activeObject.visible });
      canvas?.renderAll();
    }
  }, [getCanvas]);


  return { 
    addText, 
    addImage, 
    addShape, 
    getJSON, 
    getCanvas, 
    deleteSelected, 
    duplicateSelected,
    updateTextStyle,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackwards,
    align,
    applyFilter,
    exportCanvas,
    toggleLock,
    toggleVisibility
  };
};
