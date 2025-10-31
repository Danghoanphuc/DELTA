'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PrinterStudio from '@/features/printer/studio/PrinterStudio';
import { Product } from '@/types/product'; // Assuming you have this type

// You might want to create a proper API service for this
const getProductById = async (productId: string): Promise<Product> => {
  // Assuming an API endpoint like /api/products/:id
  // You need to ensure this endpoint exists and returns the correct data.
  const response = await fetch(`/api/products/${productId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  const data = await response.json();
  return data.product; // Assuming the API returns { product: {...} }
};

const PrinterStudioPage = () => {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const productData = await getProductById(productId);
        if (!productData.assets?.modelUrl || !productData.assets?.dielineUrl) {
            throw new Error('Product is missing required 3D model or dieline assets.');
        }
        setProduct(productData);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return <div>Loading Studio...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <PrinterStudio
      modelUrl={product.assets.modelUrl!}
      dielineUrl={product.assets.dielineUrl!}
      productId={product._id}
    />
  );
};

export default PrinterStudioPage;
