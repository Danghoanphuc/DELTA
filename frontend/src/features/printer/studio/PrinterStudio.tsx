// src/features/printer/studio/PrinterStudio.tsx (✅ FIXED VERSION)

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import FabricCanvasEditor from "./FabricCanvasEditor";
import ProductViewer3D from "./ProductViewer3D";

// Định nghĩa kiểu dữ liệu cho Phôi (Product)
interface ProductPhôi {
  _id: string;
  name: string;
  assets: {
    modelUrl: string;
    dielineUrl: string;
  };
}

export const PrinterStudio: React.FC = () => {
  const { productId } = useParams();

  const [product, setProduct] = useState<ProductPhôi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [textureData, setTextureData] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editorData, setEditorData] = useState<object | null>(null);

  // === ✅ FIX 1: FETCH DỮ LIỆU VỚI ABORT CONTROLLER ===
  useEffect(() => {
    if (!productId) return;

    let isCancelled = false;
    const controller = new AbortController();

    const fetchProductPhôi = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${productId}`, {
          signal: controller.signal, // ✅ Hỗ trợ cancel request
        });
        
        if (!response.ok) {
          throw new Error("Could not fetch product data.");
        }
        
        // ✅ Check nếu đã bị cancel
        if (isCancelled) return;
        
        const data: ProductPhôi = await response.json();
        setProduct(data);
      } catch (err) {
        // ✅ Ignore AbortError
        if (err instanceof Error && err.name === "AbortError") return;
        
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchProductPhôi();

    // ✅ Cleanup khi component unmount hoặc productId thay đổi
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [productId]);

  // === ✅ FIX 2: USE CALLBACK ĐỂ TRÁNH RE-RENDER KHÔNG CẦN THIẾT ===
  const handleCanvasUpdate = useCallback((base64: string, jsonData: object) => {
    setTextureData(base64);
    setEditorData(jsonData);
  }, []);

  // === ✅ FIX 3: VALIDATE DỮ LIỆU TRƯỚC KHI SUBMIT ===
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // ✅ Validation
    if (!textureData || !editorData || !productId) {
      alert("Please design something or ensure product is loaded.");
      return;
    }

    // ✅ Validate JSON không trống
    const parsedData = typeof editorData === 'string' 
      ? JSON.parse(editorData) 
      : editorData;
    
    if (!parsedData || (parsedData as any).objects?.length === 0) {
      alert("Canvas is empty! Please add at least one object.");
      return;
    }

    try {
      // ✅ Atomic snapshot - tạo tất cả data cùng lúc
      const fetchRes = await fetch(textureData);
      const blob = await fetchRes.blob();
      
      // ✅ Validate file size
      if (blob.size > 5 * 1024 * 1024) { // 5MB
        alert("Preview image is too large (>5MB)");
        return;
      }
      
      const previewImageFile = new File([blob], "preview.png", {
        type: "image/png",
      });

      const designData = {
        name,
        description,
        editorData,
        baseProductId: productId,
        isPublic: true,
      };

      const formData = new FormData();
      formData.append("previewImage", previewImageFile);
      formData.append("designData", JSON.stringify(designData));

      const response = await fetch("/api/designs/templates", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        alert("Template created successfully!");
        const result = await response.json();
        console.log("Success:", result);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to create template."}`);
      }
    } catch (error) {
      alert("An error occurred while submitting the form.");
      console.error("Submit Error:", error);
    }
  };

  // === LOADING/ERROR STATES ===
  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <div>Loading Studio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        flexDirection: "column" 
      }}>
        <div style={{ color: "red" }}>Error: {error}</div>
        <button onClick={() => window.location.reload()} style={{ marginTop: "1rem" }}>
          Retry
        </button>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  // === RENDER UI ===
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 2fr",
        gap: "1rem",
        padding: "1rem",
        height: "calc(100vh - 80px)",
      }}
    >
      {/* Column 1: Form */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>Create Template for: {product.name}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="template-name">Name:</label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="template-description">Description:</label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "8px", minHeight: "100px" }}
            />
          </div>
          <button
            type="submit"
            style={{ padding: "10px 15px", cursor: "pointer" }}
          >
            Save Template
          </button>
        </form>
      </div>

      {/* Column 2: 2D Editor */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <FabricCanvasEditor
          dielineUrl={product.assets.dielineUrl}
          onCanvasUpdate={handleCanvasUpdate}
        />
      </div>

      {/* Column 3: 3D Viewer */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <ProductViewer3D
          modelUrl={product.assets.modelUrl}
          textureData={textureData}
        />
      </div>
    </div>
  );
};

export default PrinterStudio;
