// src/services/assetService.ts
import api from "@/shared/lib/axios";
import { Asset } from "@/types/asset";

// Giả định kiểu response từ API
type AssetResponse = {
  data: {
    asset: Asset;
  };
};

type AssetListResponse = {
  data: {
    assets: Asset[];
  };
};

/**
 * Lấy chi tiết một Phôi (Asset)
 */
export const getAssetById = async (assetId: string): Promise<Asset> => {
  const res = await api.get<AssetResponse>(`/assets/${assetId}`);
  if (!res.data?.data?.asset) {
    throw new Error("Không tìm thấy dữ liệu Phôi.");
  }
  return res.data.data.asset;
};

/**
 * Lấy danh sách Phôi của nhà in
 * (Đang được gọi bởi 'useCreateProductWizard' tại /api/assets/my-assets)
 */
export const getMyAssets = async (): Promise<Asset[]> => {
  const res = await api.get<AssetListResponse>("/assets/my-assets");
  return res.data?.data?.assets || [];
};

/**
 * Tạo một Phôi (Asset) mới
 * (Đang được gọi bởi 'useAssetWizard')
 */
export const createAsset = async (data: FormData): Promise<Asset> => {
  const res = await api.post<AssetResponse>("/assets", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.asset;
};

/**
 * Cập nhật một Phôi (Asset)
 * (Đang được gọi bởi 'useAssetWizard')
 */
export const updateAsset = async (
  assetId: string,
  data: FormData
): Promise<Asset> => {
  const res = await api.put<AssetResponse>(`/assets/${assetId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.asset;
};
