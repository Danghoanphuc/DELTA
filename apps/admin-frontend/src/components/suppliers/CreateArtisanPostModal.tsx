// apps/admin-frontend/src/components/suppliers/CreateArtisanPostModal.tsx
// New post creation modal using THE ARTISAN BLOCK system

import { useState } from "react";
import { Loader2, Save, ArrowLeft, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useArtisanBlocks } from "@/hooks/useArtisanBlocks";
import { ArtisanBlockEditor } from "./artisan-blocks";
import { PostFormSidebarSimplified } from "./PostFormSidebarSimplified";
import { aiMetadataService } from "@/services/ai-metadata.service";
import { ArtisanBlock } from "@/types/artisan-block.types";

interface CreateArtisanPostModalProps {
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

const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  manufacturer: "Nhà sản xuất",
  distributor: "Nhà phân phối",
  printer: "Nhà in ấn",
  dropshipper: "Dropshipper",
  artisan: "Nghệ nhân",
};

export function CreateArtisanPostModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  supplierInfo,
}: CreateArtisanPostModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [subcategory, setSubcategory] = useState(
    initialData?.subcategory || ""
  );
  const [visibility, setVisibility] = useState<"public" | "private" | "draft">(
    initialData?.visibility || "public"
  );
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [ogImage, setOgImage] = useState(initialData?.ogImage || "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [videoInfo, setVideoInfo] = useState(initialData?.videoInfo || null);
  const [relatedProducts, setRelatedProducts] = useState(
    initialData?.relatedProducts || []
  );
  const [relatedPosts, setRelatedPosts] = useState(
    initialData?.relatedPosts || []
  );
  const [highlightQuote, setHighlightQuote] = useState(
    initialData?.highlightQuote || ""
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  // Author info (auto-filled from supplier)
  const authorName = initialData?.authorName || supplierInfo?.name || "";
  const authorTitle =
    initialData?.authorTitle ||
    (supplierInfo?.type
      ? SUPPLIER_TYPE_LABELS[supplierInfo.type]
      : "Nhà cung cấp");

  // Block management
  const {
    blocks,
    setBlocks,
    getPendingMediaForSubmit,
    clearPendingMedia,
    prepareBlocksForSubmit,
    validateBlocks,
    reset: resetBlocks,
  } = useArtisanBlocks(initialData?.blocks || []);

  // Handle file upload for media blocks
  // Creates a preview URL - the actual file is stored in block.content.file
  // and will be extracted by getPendingMediaForSubmit() on submit
  const handleFileUpload = async (file: File): Promise<{ preview: string }> => {
    const preview = URL.createObjectURL(file);
    return { preview };
  };

  // Convert blocks to plain text for AI metadata generation
  const getBlocksAsText = (blocks: ArtisanBlock[]): string => {
    return blocks
      .map((block) => {
        switch (block.type) {
          case "text":
            return block.content.text || "";
          case "curator_note":
            return block.content.note || "";
          case "comparison_table":
            const headers = block.content.headers.join(" | ");
            const rows = block.content.rows
              .map((row) => row.join(" | "))
              .join("\n");
            return `${headers}\n${rows}`;
          default:
            return "";
        }
      })
      .filter(Boolean)
      .join("\n\n");
  };

  const handleSubmit = async () => {
    // Validate
    if (!title.trim()) {
      toast({
        title: "Thiếu tiêu đề",
        description: "Vui lòng nhập tiêu đề bài viết",
        variant: "destructive",
      });
      return;
    }

    const { valid, errors } = validateBlocks();
    if (!valid) {
      toast({
        title: "Nội dung chưa hợp lệ",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsAiProcessing(true);

    try {
      // Generate AI metadata
      const contentText = getBlocksAsText(blocks);
      let aiMetadata;

      try {
        aiMetadata = await aiMetadataService.generateMetadata({
          title,
          content: contentText,
          category,
        });
        toast({
          title: "✨ AI đã tạo metadata",
          description: "Excerpt, tags, slug, SEO đã được tạo tự động",
        });
      } catch (aiError) {
        console.error("AI metadata error:", aiError);
        toast({
          title: "⚠️ AI không khả dụng",
          description: "Sử dụng metadata thủ công",
          variant: "default",
        });
        aiMetadata = {
          excerpt: "",
          tags: tags,
          slug: "",
          metaTitle: title,
          metaDescription: "",
          readTime: Math.ceil(contentText.length / 200),
        };
      }

      // Prepare blocks for submit
      const preparedBlocks = prepareBlocksForSubmit();
      const pendingMediaList = await getPendingMediaForSubmit();

      const postData = {
        title,
        category,
        subcategory,
        visibility,
        featured,
        ogImage,
        videoUrl,
        videoInfo,
        relatedProducts: relatedProducts.map((p: any) => p._id || p),
        relatedPosts: relatedPosts.map((p: any) => p._id || p),
        highlightQuote,

        // Block-based content (new format)
        blocks: preparedBlocks,
        editorMode: "artisan" as const, // Mark as Artisan Block post

        // AI-generated metadata
        excerpt: aiMetadata.excerpt,
        tags: aiMetadata.tags,
        slug: aiMetadata.slug,
        metaTitle: aiMetadata.metaTitle,
        metaDescription: aiMetadata.metaDescription,
        readTime: aiMetadata.readTime,

        // Author
        authorProfile: authorName
          ? {
              name: authorName,
              title: authorTitle,
            }
          : undefined,

        // Pending media for backend upload (base64 data)
        pendingMedia:
          pendingMediaList.length > 0 ? pendingMediaList : undefined,
      };

      if (pendingMediaList.length > 0) {
        toast({
          title: "⏳ Đang upload media",
          description: `Đang upload ${pendingMediaList.length} file...`,
        });
      }

      await onSubmit(postData);

      toast({
        title: "🎉 Thành công",
        description: "Bài viết đã được đăng!",
      });

      // Cleanup
      clearPendingMedia();
      resetBlocks();
      onClose();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu bài viết",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsAiProcessing(false);
    }
  };

  // Create formData object for sidebar compatibility
  const formData = {
    title,
    category,
    subcategory,
    visibility,
    featured,
    ogImage,
    videoUrl,
    videoInfo,
    relatedProducts,
    relatedPosts,
    highlightQuote,
    tags,
    authorName,
    authorTitle,
    media: [],
    content: "",
    excerpt: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    readTime: "",
    schemaType: "Article",
    authorAvatar: "",
    authorBio: "",
  };

  const updateField = (field: string, value: any) => {
    switch (field) {
      case "title":
        setTitle(value);
        break;
      case "category":
        setCategory(value);
        break;
      case "subcategory":
        setSubcategory(value);
        break;
      case "visibility":
        setVisibility(value);
        break;
      case "featured":
        setFeatured(value);
        break;
      case "ogImage":
        setOgImage(value);
        break;
      case "videoUrl":
        setVideoUrl(value);
        break;
      case "videoInfo":
        setVideoInfo(value);
        break;
      case "relatedProducts":
        setRelatedProducts(value);
        break;
      case "relatedPosts":
        setRelatedPosts(value);
        break;
      case "highlightQuote":
        setHighlightQuote(value);
        break;
      case "tags":
        setTags(value);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col z-50 animate-in fade-in duration-200">
      {/* Top Bar */}
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
              {title || "Bài viết mới (Artisan Block)"}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  visibility === "public" ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="text-xs text-gray-500 capitalize">
                {visibility}
              </span>
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                Block Mode
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${
              showSidebar
                ? "bg-orange-50 text-orange-600"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title="Cài đặt bài viết"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSubmitting ? "Đang lưu..." : "Đăng bài"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Block Editor */}
        <div className="flex-1 overflow-hidden bg-white">
          <ArtisanBlockEditor
            title={title}
            blocks={blocks}
            onTitleChange={setTitle}
            onBlocksChange={setBlocks}
            authorName={authorName}
            authorTitle={authorTitle}
            category={category}
            onFileUpload={handleFileUpload}
          />
        </div>

        {/* Settings Sidebar */}
        {showSidebar && (
          <div className="w-[360px] shrink-0 border-l border-gray-200 bg-white flex flex-col animate-in slide-in-from-right duration-300">
            <PostFormSidebarSimplified
              formData={formData}
              updateField={updateField}
              onOgImageUpload={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // TODO: Upload to Cloudinary
                  const preview = URL.createObjectURL(file);
                  setOgImage(preview);
                }
              }}
              onContentImageUpload={() => {}}
              isAiProcessing={isAiProcessing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
