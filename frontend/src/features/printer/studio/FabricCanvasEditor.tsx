// src/features/printer/studio/FabricCanvasEditor.tsx (✅ OPTIMIZED VERSION)

import React, { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import debounce from 'lodash.debounce';

interface FabricCanvasEditorProps {
  dielineUrl: string;
  onCanvasUpdate: (base64: string, jsonData: object) => void;
}

const FabricCanvasEditor: React.FC<FabricCanvasEditorProps> = ({ 
  dielineUrl, 
  onCanvasUpdate 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ✅ FIX 1: OPTIMIZED CANVAS UPDATE WITH OFFSCREEN CANVAS
  const generateTexture = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const backgroundImage = canvas.backgroundImage;

    // ✅ Tạo offscreen canvas nếu chưa có
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const offscreen = offscreenCanvasRef.current;
    offscreen.width = canvas.width || 500;
    offscreen.height = canvas.height || 500;
    const ctx = offscreen.getContext('2d');

    if (!ctx) return;

    // ✅ Tạm xóa background để render
    canvas.setBackgroundImage(null, () => {
      // Render vào offscreen canvas
      const canvasElement = canvas.getElement();
      ctx.clearRect(0, 0, offscreen.width, offscreen.height);
      ctx.drawImage(canvasElement, 0, 0);

      // ✅ Sử dụng WebP thay vì PNG để giảm size 50-70%
      const base64 = offscreen.toDataURL('image/webp', 0.8);
      const canvasJson = canvas.toObject();

      // Gọi callback
      onCanvasUpdate(base64, canvasJson);

      // Phục hồi background
      canvas.setBackgroundImage(backgroundImage, canvas.renderAll.bind(canvas));
    });
  }, [onCanvasUpdate]);

  // ✅ FIX 2: DEBOUNCED UPDATE (250ms)
  const debouncedUpdate = useRef(
    debounce(() => {
      generateTexture();
    }, 250)
  ).current;

  // ✅ FIX 3: PROPER INITIALIZATION WITH ERROR HANDLING
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 500,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    // ✅ Load SVG với error handling
    fabric.loadSVGFromURL(
      dielineUrl,
      (objects, options) => {
        try {
          const dieline = fabric.util.groupSVGElements(objects, options);
          dieline.set({
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
          });
          
          canvas.setBackgroundImage(dieline, canvas.renderAll.bind(canvas));
          
          // ✅ Generate initial texture
          setTimeout(() => debouncedUpdate(), 100);
        } catch (error) {
          console.error('Error setting dieline:', error);
        }
      },
      undefined,
      {
        crossOrigin: 'anonymous',
      }
    );

    // ✅ FIX 4: OPTIMIZED EVENT LISTENERS
    const handleChange = () => debouncedUpdate();

    canvas.on('object:added', handleChange);
    canvas.on('object:modified', handleChange);
    canvas.on('object:removed', handleChange);
    canvas.on('text:changed', handleChange);

    // Add example rectangle
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      width: 60,
      height: 70,
    });
    canvas.add(rect);

    // ✅ FIX 5: PROPER CLEANUP
    return () => {
      debouncedUpdate.cancel();
      canvas.off('object:added', handleChange);
      canvas.off('object:modified', handleChange);
      canvas.off('object:removed', handleChange);
      canvas.off('text:changed', handleChange);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [dielineUrl, debouncedUpdate]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default FabricCanvasEditor;
