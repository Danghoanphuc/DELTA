// file-utils.ts - Utility functions cho file classification
import type { FileItem, FileGroup } from "./types";

/**
 * Phân loại file theo category
 */
export function categorizeFiles(files: FileItem[] | any): FileGroup {
  // ✅ Safety check: Ensure files is an array
  const fileArray = Array.isArray(files) ? files : [];

  // ✅ Early return if empty
  if (fileArray.length === 0) {
    return {
      contracts: [],
      production: [],
      media: [],
      documents: [],
    };
  }

  // Track which files have been categorized
  const categorized = new Set<string>();

  // 1. Hợp đồng & Hóa đơn (Ưu tiên cao nhất - check tên file)
  const contracts = fileArray.filter((f) => {
    const name = (f.name || "").toLowerCase();
    const isContract =
      name.includes("hop_dong") ||
      name.includes("hop-dong") ||
      name.includes("hopdong") ||
      name.includes("contract") ||
      name.includes("bao_gia") ||
      name.includes("bao-gia") ||
      name.includes("baogia") ||
      name.includes("quote") ||
      name.includes("invoice") ||
      name.includes("hoa_don") ||
      name.includes("hoa-don") ||
      name.includes("hoadon");
    if (isContract) categorized.add(f._id);
    return isContract;
  });

  // 2. File sản xuất (AI, PDF, CDR, PSD... - design files)
  const production = fileArray.filter((f) => {
    if (categorized.has(f._id)) return false;
    const ext = (f.name || "").split(".").pop()?.toLowerCase();
    const type = (f.type || "").toLowerCase();
    const isProduction =
      ["ai", "eps", "cdr", "psd", "tiff", "tif", "svg", "indd"].includes(
        ext || ""
      ) ||
      type.includes("illustrator") ||
      type.includes("photoshop") ||
      type.includes("postscript");
    if (isProduction) categorized.add(f._id);
    return isProduction;
  });

  // 3. Media (Images - nhưng backend đã filter ra rồi, nên check lại)
  const media = fileArray.filter((f) => {
    if (categorized.has(f._id)) return false;
    const type = f.type || "";
    const ext = (f.name || "").split(".").pop()?.toLowerCase();
    const isMedia =
      type.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp", "bmp", "ico"].includes(ext || "");
    if (isMedia) categorized.add(f._id);
    return isMedia;
  });

  // 4. Documents (Word, Excel, PDF, etc. - còn lại)
  const documents = fileArray.filter((f) => {
    if (categorized.has(f._id)) return false;
    const ext = (f.name || "").split(".").pop()?.toLowerCase();
    const type = (f.type || "").toLowerCase();
    const isDocument =
      [
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "rtf",
        "pdf",
      ].includes(ext || "") ||
      type.includes("word") ||
      type.includes("excel") ||
      type.includes("powerpoint") ||
      type.includes("text") ||
      type.includes("pdf");
    if (isDocument) categorized.add(f._id);
    return isDocument;
  });

  return {
    contracts,
    production,
    media,
    documents,
  };
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get file icon color class based on extension
 */
export function getFileIconColor(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();

  const colorMap: Record<string, string> = {
    // Production files
    ai: "bg-orange-50 text-orange-600",
    eps: "bg-orange-50 text-orange-600",
    cdr: "bg-red-50 text-red-600",
    pdf: "bg-red-50 text-red-600",
    psd: "bg-blue-50 text-blue-600",

    // Documents
    doc: "bg-blue-50 text-blue-600",
    docx: "bg-blue-50 text-blue-600",
    xls: "bg-green-50 text-green-600",
    xlsx: "bg-green-50 text-green-600",

    // Images
    jpg: "bg-purple-50 text-purple-600",
    jpeg: "bg-purple-50 text-purple-600",
    png: "bg-purple-50 text-purple-600",

    // Default
    default: "bg-stone-50 text-stone-600",
  };

  return colorMap[ext || ""] || colorMap.default;
}

/**
 * Download file
 */
export async function downloadFile(
  url: string,
  fileName: string
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback: open in new tab
    window.open(url, "_blank");
  }
}
