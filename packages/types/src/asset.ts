// src/types/asset.ts

// Định nghĩa 1 bề mặt (Surface) bên trong Phôi
export interface AssetSurface {
  _id?: string;
  surfaceKey: string; // vd: "main_body"
  name: string; // vd: "Thân hộp"
  materialName: string; // vd: "Material_Lid" (tên trong file GLB)
  dielineSvgUrl: string; // URL tới file SVG
}

// Định nghĩa 1 ảnh preview cho Phôi
export interface AssetExampleImage {
  _id?: string;
  url: string;
  publicId: string;
}

// Định nghĩa đối tượng Phôi (Asset)
// Đây là "Nguyên liệu" gốc, được tạo ra từ "Kho Phôi"
export interface Asset {
  _id: string;
  name: string; // Tên phôi (vd: "Hộp nắp gài 10x10x5")
  category: string; // Danh mục phôi (vd: "packaging")
  description?: string; // Mô tả kỹ thuật

  // Dữ liệu 3D/2D
  assets: {
    modelUrl: string; // URL tới file .glb
    surfaces: AssetSurface[];
  };

  // Ảnh chụp/render mẫu của phôi
  images: AssetExampleImage[];

  // (Lưu ý: Phôi không chứa "pricing" hay "isActive"
  //  vì đó là logic kinh doanh của "Sản phẩm đăng bán")

  createdAt?: string;
  updatedAt?: string;
}
