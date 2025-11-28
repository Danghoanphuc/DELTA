// src/features/chat/hooks/useInputIntelligence.ts
import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

// Types
export type SuggestionType = 'product' | 'order' | 'none';
export type IntentType = 'business_card' | 'flyer' | null;

interface Product {
  id: string;
  name: string;
  slug?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
}

// Mock data - Sau này sẽ thay bằng API thật
const mockProducts: Product[] = [
  { id: 'P1', name: 'Card Visit C300', slug: 'card-visit-c300' },
  { id: 'P2', name: 'Poster A3', slug: 'poster-a3' },
  { id: 'P3', name: 'Brochure A4', slug: 'brochure-a4' },
];

const mockOrders: Order[] = [
  { id: 'O1', orderNumber: 'ORD-2024-001', status: 'Đang xử lý' },
  { id: 'O2', orderNumber: 'ORD-2024-002', status: 'Đã hoàn thành' },
  { id: 'O3', orderNumber: 'ORD-2024-003', status: 'Đang giao hàng' },
];

export function useInputIntelligence() {
  const [suggestionType, setSuggestionType] = useState<SuggestionType>('none');
  const [detectedIntent, setDetectedIntent] = useState<IntentType>(null);
  const [detectedColor, setDetectedColor] = useState<string | null>(null);

  // Fetch products (có thể dùng API thật sau)
  const { data: products = mockProducts } = useQuery<Product[]>({
    queryKey: ['chat-suggestions', 'products'],
    queryFn: async () => {
      // TODO: Thay bằng API thật
      // const res = await api.get('/products/search');
      // return res.data?.data || [];
      return mockProducts;
    },
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });

  // Fetch orders (có thể dùng API thật sau)
  const { data: orders = mockOrders } = useQuery<Order[]>({
    queryKey: ['chat-suggestions', 'orders'],
    queryFn: async () => {
      // TODO: Thay bằng API thật
      // const res = await api.get('/orders/recent');
      // return res.data?.data || [];
      return mockOrders;
    },
    staleTime: 1000 * 60 * 2, // Cache 2 phút
  });

  // Filter suggestions dựa trên keyword
  const suggestions = useMemo(() => {
    if (suggestionType === 'none') return [];
    
    if (suggestionType === 'product') {
      return products.map(p => ({ id: `P${p.id}`, name: p.name }));
    }
    
    if (suggestionType === 'order') {
      return orders.map(o => ({ 
        id: `O${o.id}`, 
        name: o.orderNumber,
        status: o.status 
      }));
    }
    
    return [];
  }, [suggestionType, products, orders]);

  // Phát hiện màu sắc trong text (hex, rgb, tên màu)
  const detectColor = useCallback((text: string): string | null => {
    // Hex color: #FF5733, #fff, #abc123
    const hexMatch = text.match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/);
    if (hexMatch) return hexMatch[0];

    // RGB: rgb(255, 87, 51), rgba(255, 87, 51, 0.5)
    const rgbMatch = text.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) return rgbMatch[0];

    // Tên màu phổ biến (tiếng Việt)
    const colorNames: Record<string, string> = {
      'đỏ': '#FF0000', 'xanh lá': '#00FF00', 'xanh dương': '#0000FF',
      'vàng': '#FFFF00', 'tím': '#800080', 'cam': '#FFA500',
      'hồng': '#FFC0CB', 'đen': '#000000', 'trắng': '#FFFFFF',
      'xám': '#808080', 'nâu': '#A52A2A',
    };

    const lowerText = text.toLowerCase();
    for (const [name, hex] of Object.entries(colorNames)) {
      if (lowerText.includes(name)) return hex;
    }

    return null;
  }, []);

  // Phát hiện intent từ text
  const detectIntent = useCallback((text: string): IntentType => {
    const lowerText = text.toLowerCase();
    
    // Business card keywords
    if (
      lowerText.includes('card visit') ||
      lowerText.includes('danh thiếp') ||
      lowerText.includes('name card') ||
      lowerText.includes('visiting card')
    ) {
      return 'business_card';
    }

    // Flyer keywords
    if (
      lowerText.includes('flyer') ||
      lowerText.includes('tờ rơi') ||
      lowerText.includes('tờ gấp') ||
      lowerText.includes('leaflet')
    ) {
      return 'flyer';
    }

    return null;
  }, []);

  // Hàm chính để phân tích input
  const analyzeInput = useCallback((text: string, cursorPosition: number) => {
    // 1. Phát hiện @ và # để hiện suggestions
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastWord = textBeforeCursor.split(/\s+/).pop() || '';
    
    if (lastWord.startsWith('@')) {
      const keyword = lastWord.substring(1).toLowerCase();
      setSuggestionType('product');
      // Có thể filter products theo keyword ở đây
    } else if (lastWord.startsWith('#')) {
      const keyword = lastWord.substring(1).toLowerCase();
      setSuggestionType('order');
      // Có thể filter orders theo keyword ở đây
    } else {
      setSuggestionType('none');
    }

    // 2. Phát hiện intent
    const intent = detectIntent(text);
    setDetectedIntent(intent);

    // 3. Phát hiện màu sắc
    const color = detectColor(text);
    setDetectedColor(color);
  }, [detectIntent, detectColor]);

  return {
    suggestions,
    suggestionType,
    detectedIntent,
    detectedColor,
    analyzeInput,
    setSuggestionType,
  };
}

