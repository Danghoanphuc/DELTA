// src/data/productTaxonomy.data.ts (TỆP MỚI)
// File này định nghĩa "kho phôi" (Taxonomy + Metadata) của Printz

export interface ProductTaxonomyNode {
  id: string; // "box_reverse_tuck"
  name: string; // "Hộp khóa ngược"
  parent: string | null; // "box_paper"

  // 1. Metadata Schema: Cấu hình các trường form sẽ được render
  metadataSchema: {
    dimensions: {
      default: { length: number; width: number; height: number };
    };
    materials: {
      label: string;
      options: { value: string; name: string }[]; // "300g", "350g"
    }[];
    printingOptions: {
      label: string;
      options: { value: string; name: string }[]; // "in-bon-mau", "phu-mang"
    }[];
  };

  // 2. Asset 3D: Thông tin cho ProductViewer3D
  assets: {
    modelUrl: string; // File GLB
    surfaces: {
      key: string;
      name: string;
      materialName: string; // Tên vật liệu trong file GLB
      dielineSvgUrl: string; // File SVG cho editor 2D
    }[];
  };
}

// Giả lập CSDL Taxonomy của bạn
export const productTaxonomyDB: Record<string, ProductTaxonomyNode> = {
  box_reverse_tuck: {
    id: "box_reverse_tuck",
    name: "Hộp khóa ngược",
    parent: "box_paper",

    metadataSchema: {
      dimensions: { default: { length: 120.4, width: 60.4, height: 169.9 } },
      materials: [
        {
          label: "Chất liệu giấy",
          options: [
            { value: "ivory_300", name: "Thẻ trắng 300g (0.42mm)" },
            { value: "ivory_350", name: "Thẻ trắng 350g (0.5mm)" },
          ],
        },
      ],
      printingOptions: [
        {
          label: "Quy trình in",
          options: [
            { value: "in_bon_mau", name: "In bốn màu" },
            { value: "khong_in", name: "Không in" },
          ],
        },
        {
          label: "Tay nghề",
          options: [
            { value: "mang_mo", name: "Màng mờ" },
            { value: "phim_nhe", name: "Phim nhẹ" },
          ],
        },
        //... (thêm các nhóm quy trình khác)
      ],
    },

    assets: {
      // Dùng model từ sản phẩm bạn đã sửa tay
      modelUrl:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1761921322/sitarbuckss_lfnzc7.glb",
      surfaces: [
        {
          key: "main_body",
          name: "Thân & Nắp",
          materialName: "Material_Lid",
          dielineSvgUrl:
            "https://res.cloudinary.com/da3xfws3n/raw/upload/v1761923456/dieline-box-01_qabcde.svg",
        },
      ],
    },
  },
  // ... (Thêm các loại hộp/sản phẩm khác ở đây)
};

// Hàm helper để lấy các node con (ví dụ: lấy các loại "Hộp giấy")
export const getTaxonomyChildren = (parentId: string | null) => {
  return Object.values(productTaxonomyDB).filter(
    (node) => node.parent === parentId
  );
};
