// apps/admin-frontend/src/components/suppliers/CreatePostModal.tsx
import { useState } from "react";
import { Loader2, Save, ArrowLeft, Eye, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { usePostForm } from "@/hooks/usePostForm";
import { useFileUpload } from "@/hooks/useFileUpload";
import { PostFormSidebarSimplified } from "./PostFormSidebarSimplified";
import { RichTextEditor } from "./RichTextEditor";
import { aiMetadataService } from "@/services/ai-metadata.service";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  supplierInfo?: {
    name: string;
    email?: string;
    type?:
      | "manufacturer"
      | "distributor"
      | "printer"
      | "dropshipper"
      | "artisan";
  };
}

// Map supplier type to Vietnamese
const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  manufacturer: "Nhà sản xuất",
  distributor: "Nhà phân phối",
  printer: "Nhà in ấn",
  dropshipper: "Dropshipper",
  artisan: "Nghệ nhân",
};

export function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  supplierInfo,
}: CreatePostModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // State quản lý việc hiển thị Sidebar hay Fullscreen mode
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { formData, updateField, addMedia, reset } = usePostForm({
    ...initialData,
    // Auto-fill author from supplier info
    authorName: initialData?.authorName || supplierInfo?.name || "",
    authorTitle:
      initialData?.authorTitle ||
      (supplierInfo?.type
        ? SUPPLIER_TYPE_LABELS[supplierInfo.type]
        : "Nhà cung cấp"),
  });

  const {
    uploadImage,
    addPendingImage,
    getPendingImagesForSubmit,
    clearPendingImages,
    hasPendingImages,
    prepareContentForSubmit,
  } = useFileUpload();

  // Xử lý upload ảnh chèn vào bài viết (Inline Image)
  // Ảnh được giữ local, chỉ upload khi submit
  const handleContentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Thêm vào pending list, lấy preview URL
      const { id, preview } = await addPendingImage(file);
      // Lưu cả id và preview vào media để track
      addMedia({ type: "image", url: preview, tempId: id });
      toast.success("📷 Ảnh đã thêm - sẽ được upload khi bạn đăng bài");
    } catch (error) {
      toast.error("Không thể thêm ảnh");
    }
  };

  // Xử lý upload ảnh OG/Cover (Dùng cho Sidebar)
  // OG image upload ngay vì cần URL cố định
  const handleOgImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      updateField("ogImage", url);
    } catch (error) {}
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết");
      return;
    }

    setIsSubmitting(true);
    setIsAiProcessing(true);

    try {
      // 🤖 AI MAGIC: Generate metadata automatically
      let aiMetadata;
      try {
        aiMetadata = await aiMetadataService.generateMetadata({
          title: formData.title,
          content: formData.content,
          category: formData.category,
        });

        toast.success("✨ AI đã tạo metadata tự động");
      } catch (aiError) {
        console.error("AI metadata error:", aiError);
        toast.warning("⚠️ AI không khả dụng - sử dụng metadata thủ công");
        // Fallback: use existing formData or empty
        aiMetadata = {
          excerpt: formData.excerpt || "",
          tags: formData.tags || [],
          slug: formData.slug || "",
          metaTitle: formData.metaTitle || formData.title,
          metaDescription: formData.metaDescription || formData.excerpt || "",
          readTime: formData.readTime || 5,
        };
      }

      // Merge AI metadata with form data
      const validSchemaTypes = ["Article", "FAQ", "ProductReview"];
      const safeSchemaType = validSchemaTypes.includes(formData.schemaType)
        ? formData.schemaType
        : "Article";

      // Lấy pending images để gửi kèm
      const pendingImages = getPendingImagesForSubmit();

      // Thay thế blob URLs trong content bằng placeholder {{img:id}}
      // Backend sẽ upload và thay thế bằng URL thật
      const preparedContent = prepareContentForSubmit(formData.content);

      const postData = {
        ...formData,
        // Content với placeholder thay vì blob URLs
        content: preparedContent,
        // AI-generated fields (override form data)
        excerpt: aiMetadata.excerpt,
        tags: aiMetadata.tags,
        slug: aiMetadata.slug,
        metaTitle: aiMetadata.metaTitle,
        metaDescription: aiMetadata.metaDescription,
        readTime: aiMetadata.readTime,
        // Other fields
        relatedProducts:
          formData.relatedProducts?.map((p: any) => p._id || p) || [],
        relatedPosts: formData.relatedPosts?.map((p: any) => p._id || p) || [],
        authorProfile: formData.authorName
          ? {
              name: formData.authorName,
              title:
                formData.authorTitle ||
                (supplierInfo?.type
                  ? SUPPLIER_TYPE_LABELS[supplierInfo.type]
                  : "Nhà cung cấp"),
              avatar: formData.authorAvatar,
              bio:
                formData.authorBio ||
                `${formData.authorName} - ${
                  formData.authorTitle ||
                  (supplierInfo?.type
                    ? SUPPLIER_TYPE_LABELS[supplierInfo.type]
                    : "Đối tác")
                } cung cấp sản phẩm chất lượng cao.`,
            }
          : undefined,
        schemaType: safeSchemaType,
        // NEW: Pending images để backend upload
        pendingImages: pendingImages.length > 0 ? pendingImages : undefined,
      };

      // Show upload progress if has pending images
      if (pendingImages.length > 0) {
        toast.loading(`Đang upload ${pendingImages.length} ảnh...`);
      }

      await onSubmit(postData);
      toast.success("🎉 Bài viết đã được đăng thành công!");

      // Clear pending images sau khi submit thành công
      clearPendingImages();
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Không thể lưu");
    } finally {
      setIsSubmitting(false);
      setIsAiProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col z-50 animate-in fade-in duration-200">
      {/* --- TOP BAR: Minimalist & Functional --- */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">
              {formData.title || "Bài viết chưa có tiêu đề"}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  formData.visibility === "public"
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <span className="text-xs text-gray-500 capitalize">
                {formData.visibility}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${
              !isSidebarOpen
                ? "bg-orange-50 text-orange-600"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title={isSidebarOpen ? "Đóng cài đặt" : "Mở cài đặt"}
          >
            {isSidebarOpen ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSubmitting ? "Saving..." : "Publish"}</span>
          </button>
        </div>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: WRITING AREA (Rich Text Editor) */}
        <div className="flex-1 overflow-hidden bg-white">
          <RichTextEditor
            title={formData.title}
            content={formData.content}
            onTitleChange={(title) => updateField("title", title)}
            onContentChange={(content) => updateField("content", content)}
            titlePlaceholder="Tiêu đề bài viết"
            contentPlaceholder="Bắt đầu câu chuyện của bạn..."
            onAddPendingImage={addPendingImage}
          />
        </div>

        {/* RIGHT: SETTINGS SIDEBAR (Collapsible) */}
        {isSidebarOpen && (
          <div className="w-[360px] shrink-0 border-l border-gray-200 bg-white flex flex-col animate-in slide-in-from-right duration-300">
            <PostFormSidebarSimplified
              formData={formData}
              updateField={updateField}
              onOgImageUpload={handleOgImageUpload}
              onContentImageUpload={handleContentImageUpload}
              isAiProcessing={isAiProcessing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
