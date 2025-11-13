// printer/utils/assetValidator.ts
// 🔥 BỘ NÃO XÁC THỰC: Đảm bảo link 100% không bị 404

/**
 * Xác thực một URL (Cloudinary, S3...) có tồn tại hay không.
 * Sử dụng 'HEAD' request để tiết kiệm băng thông (chỉ lấy headers).
 * @param url Đường dẫn asset (GLB, SVG)
 * @returns boolean true nếu file tồn tại (200 OK), false nếu 404 hoặc lỗi.
 */
export async function validateAssetUrl(url: string): Promise<boolean> {
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "cors",
    });
    return response.ok;
  } catch (error) {
    console.error(`[AssetValidator] Lỗi khi xác thực URL: ${url}`, error);
    return false;
  }
}
