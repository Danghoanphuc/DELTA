// SỬA LẠI NHƯ SAU:
const MOCK_SVG_URL =
  "https://res.cloudinary.com/da3xfws3n/image/upload/v1762267465/Cube_exubkj.svg";
// ✅ THÊM LINK GLB THẬT CỦA ANH VÀO ĐÂY
const MOCK_GLB_URL =
  "https://res.cloudinary.com/da3xfws3n/image/upload/v1762252017/cube_eoztbg.glb"; // (Đây là link tôi thấy trong schema)

export const uploadFileToCloudinary = async (file: File): Promise<string> => {
  console.log(`[CloudinaryService] Giả lập tải lên: ${file.name}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      // ✅ SỬA LOGIC: Kiểm tra loại file
      if (file.name.endsWith(".glb") || file.name.endsWith(".gltf")) {
        console.log(`[CloudinaryService] Giả lập thành công: ${MOCK_GLB_URL}`);
        resolve(MOCK_GLB_URL);
      } else {
        console.log(`[CloudinaryService] Giả lập thành công: ${MOCK_SVG_URL}`);
        resolve(MOCK_SVG_URL);
      }
    }, 1000);
  });
};
