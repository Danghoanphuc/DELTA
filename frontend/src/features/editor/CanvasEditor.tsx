import { useEffect, useRef } from "react";
// Import đúng cho Fabric v6
import { Canvas } from "fabric";

export default function CanvasEditor() {
  const canvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    const canvas = new Canvas("c", {
      width: 400,
      height: 300,
      backgroundColor: "#ffffff",
    });
    canvasRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);

  const handleExport = async () => {
    if (!canvasRef.current) return;

    try {
      // Fabric v6: toBlob đã được hỗ trợ native
      const blob = await canvasRef.current.toBlob({
        format: "png",
        quality: 0.8,
      });
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "design.png";
        link.click();
        URL.revokeObjectURL(url); // Clean up
      }
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div>
      <canvas
        id="c"
        width={400}
        height={300}
        style={{ border: "1px solid #ccc" }}
      />
      <button onClick={handleExport}>Xuất PNG</button>
    </div>
  );
}
