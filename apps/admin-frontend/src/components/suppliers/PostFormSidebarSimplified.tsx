// apps/admin-frontend/src/components/suppliers/PostFormSidebarSimplified.tsx
// SIMPLIFIED VERSION - AI handles: excerpt, tags, SEO, slug, readTime
import { useState } from "react";
import {
  Settings,
  Image as ImageIcon,
  LayoutTemplate,
  Sparkles,
  X,
  UploadCloud,
  Youtube,
  Check,
  Loader2,
  User,
  ShoppingBag,
  FileText,
  Quote,
  Star,
} from "lucide-react";
import { RelatedProductsPicker } from "./RelatedProductsPicker";
import { RelatedPostsPicker } from "./RelatedPostsPicker";

interface VideoInfo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  authorName: string;
  embedUrl: string;
  watchUrl: string;
}

interface PostFormSidebarSimplifiedProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  onOgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAiProcessing?: boolean;
}

export function PostFormSidebarSimplified({
  formData,
  updateField,
  onOgImageUpload,
  onContentImageUpload,
  isAiProcessing = false,
}: PostFormSidebarSimplifiedProps) {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Cấu hình", icon: Settings },
    { id: "products", label: "Sản phẩm", icon: ShoppingBag },
    { id: "media", label: "Media", icon: ImageIcon },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* AI Processing Banner */}
      {isAiProcessing && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-purple-900 font-medium">
              AI đang xử lý metadata...
            </span>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex items-center border-b border-gray-200 px-2 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
        {/* TAB 1: GENERAL SETTINGS */}
        {activeTab === "general" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* AI Info Card */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-purple-900 mb-1">
                    AI tự động hóa
                  </h4>
                  <p className="text-xs text-purple-700 leading-relaxed">
                    Khi bạn đăng bài, AI sẽ tự động tạo: Mô tả ngắn, Tags, SEO
                    metadata, URL slug, và tính thời gian đọc.
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Visibility + Featured */}
            <Section title="Trạng thái">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
                  {["draft", "public", "private"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateField("visibility", status)}
                      className={`px-2 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                        formData.visibility === status
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Featured Toggle */}
                <label className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg cursor-pointer hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <Star
                      className={`w-4 h-4 ${
                        formData.featured
                          ? "text-amber-500 fill-amber-500"
                          : "text-amber-400"
                      }`}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Bài viết nổi bật
                      </span>
                      <p className="text-xs text-gray-500">
                        Hiển thị ở vị trí đặc biệt
                      </p>
                    </div>
                  </div>
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      formData.featured ? "bg-amber-500" : "bg-gray-300"
                    }`}
                    onClick={() => updateField("featured", !formData.featured)}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        formData.featured ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </label>
              </div>
            </Section>

            {/* Category */}
            <Section title="Phân loại" icon={LayoutTemplate}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">
                    Chuyên mục chính
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="">Chọn trang...</option>
                    <optgroup label="3 Trụ Cột Tinh Thần">
                      <option value="triet-ly-song">🍃 Triết Lý Sống</option>
                      <option value="goc-giam-tuyen">👤 Góc Giám Tuyển</option>
                      <option value="cau-chuyen-di-san">
                        🏛️ Câu Chuyện Di Sản
                      </option>
                    </optgroup>
                    <optgroup label="5 Trụ Cột Ngũ Hành">
                      <option value="ngu-hanh-kim">
                        💎 Hành Kim - Đồng & Kim Loại
                      </option>
                      <option value="ngu-hanh-moc">
                        🍃 Hành Mộc - Gỗ & Tre
                      </option>
                      <option value="ngu-hanh-thuy">
                        🌊 Hành Thủy - Sơn Mài & Thủy Tinh
                      </option>
                      <option value="ngu-hanh-hoa">
                        🔥 Hành Hỏa - Trầm & Gốm Hỏa Biến
                      </option>
                      <option value="ngu-hanh-tho">
                        🏔️ Hành Thổ - Gốm Sứ & Đá
                      </option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">
                    Phân loại con (Tagline)
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => updateField("subcategory", e.target.value)}
                    placeholder="VD: Zen, Mindfulness..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </Section>

            {/* Author - Auto-filled from supplier info */}
            {(formData.authorName || formData.authorTitle) && (
              <Section title="Tác giả" icon={User}>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">
                    {formData.authorName}
                  </p>
                  {formData.authorTitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.authorTitle}
                    </p>
                  )}
                  <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Tự động từ thông tin nhà cung cấp
                  </p>
                </div>
              </Section>
            )}

            {/* AI Generated Fields Preview (Read-only) */}
            {(formData.excerpt ||
              formData.tags?.length > 0 ||
              formData.slug) && (
              <Section title="AI đã tạo" icon={Sparkles}>
                <div className="space-y-3 bg-purple-50/50 border border-purple-100 rounded-lg p-3">
                  {formData.excerpt && (
                    <div>
                      <label className="text-xs text-purple-600 font-medium mb-1 block">
                        Mô tả ngắn
                      </label>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {formData.excerpt}
                      </p>
                    </div>
                  )}
                  {formData.tags?.length > 0 && (
                    <div>
                      <label className="text-xs text-purple-600 font-medium mb-1 block">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formData.slug && (
                    <div>
                      <label className="text-xs text-purple-600 font-medium mb-1 block">
                        URL Slug
                      </label>
                      <p className="text-xs text-gray-700 font-mono">
                        {formData.slug}
                      </p>
                    </div>
                  )}
                  {formData.readTime && (
                    <div>
                      <label className="text-xs text-purple-600 font-medium mb-1 block">
                        Thời gian đọc
                      </label>
                      <p className="text-xs text-gray-700">
                        {formData.readTime} phút
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS & LINKS */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Highlight Quote */}
            <Section title="Câu trích dẫn nổi bật" icon={Quote}>
              <p className="text-xs text-gray-500 mb-2">
                Câu quote đặc biệt hiển thị trên card preview (tối đa 200 ký tự)
              </p>
              <textarea
                value={formData.highlightQuote || ""}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    updateField("highlightQuote", e.target.value);
                  }
                }}
                placeholder="VD: Nghệ thuật không chỉ là sản phẩm, mà là câu chuyện của người tạo ra nó..."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-400">
                  {formData.highlightQuote?.length || 0}/200
                </p>
                {formData.highlightQuote && (
                  <button
                    type="button"
                    onClick={() => updateField("highlightQuote", "")}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </Section>

            {/* Related Products */}
            <Section title="Sản phẩm liên quan" icon={ShoppingBag}>
              <p className="text-xs text-gray-500 mb-3">
                Chọn sản phẩm để hiển thị cuối bài viết. Ưu tiên theo keywords.
              </p>
              <RelatedProductsPicker
                selectedProducts={formData.relatedProducts || []}
                onProductsChange={(products) =>
                  updateField("relatedProducts", products)
                }
                keywords={formData.tags || []}
                maxProducts={6}
              />
            </Section>

            {/* Related Posts */}
            <Section title="Bài viết liên quan" icon={FileText}>
              <p className="text-xs text-gray-500 mb-3">
                Chọn bài viết khác để gợi ý cho người đọc.
              </p>
              <RelatedPostsPicker
                selectedPosts={formData.relatedPosts || []}
                onPostsChange={(posts) => updateField("relatedPosts", posts)}
                keywords={formData.tags || []}
                maxPosts={4}
              />
            </Section>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                💡 <strong>Mẹo:</strong> Liên kết nội dung giúp tăng thời gian
                người đọc ở lại trang và cải thiện SEO.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: MEDIA */}
        {activeTab === "media" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* YouTube Video */}
            <YouTubeInput
              videoUrl={formData.videoUrl}
              ogImage={formData.ogImage}
              onVideoChange={(url, videoInfo) => {
                updateField("videoUrl", url);
                if (videoInfo) {
                  updateField("videoInfo", videoInfo);
                }
              }}
              onThumbnailFetch={(thumbnail) => {
                // Auto-set OG image from YouTube thumbnail if not set
                if (!formData.ogImage && thumbnail) {
                  updateField("ogImage", thumbnail);
                }
              }}
            />

            <Section title="Social Share Image (OG)" icon={ImageIcon}>
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Ảnh hiển thị khi chia sẻ link lên Facebook/Zalo. (Khuyên dùng:
                  1200 x 630px)
                </p>

                {formData.ogImage ? (
                  <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={formData.ogImage}
                      alt="OG"
                      className="w-full h-auto object-cover aspect-[1.91/1]"
                    />
                    <button
                      onClick={() => updateField("ogImage", "")}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-[1.91/1] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition-all">
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 font-medium">
                      Tải ảnh OG
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onOgImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </Section>

            <Section title="Chèn ảnh vào bài viết">
              <label className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:shadow-sm cursor-pointer transition-all">
                <ImageIcon className="w-4 h-4" />
                <span>Thêm ảnh nội dung</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onContentImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Ảnh sẽ được thêm vào cuối bài viết
              </p>

              {/* Media Gallery - hiển thị ảnh đã thêm */}
              {formData.media && formData.media.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-gray-600">
                    Ảnh đã thêm ({formData.media.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.media.map((item: any, index: number) => (
                      <div
                        key={item.tempId || index}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={item.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Badge cho pending images */}
                        {item.tempId && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded">
                            Chờ upload
                          </div>
                        )}
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              "media",
                              formData.media.filter(
                                (_: any, i: number) => i !== index
                              )
                            )
                          }
                          className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function Section({ title, icon: Icon, children }: any) {
  return (
    <div className="space-y-3">
      <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {title}
      </h5>
      {children}
    </div>
  );
}

// YouTube URL utilities
function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getYouTubeThumbnail(videoId: string): string {
  // maxresdefault is highest quality, fallback to hqdefault
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

// YouTube Input Component
function YouTubeInput({
  videoUrl,
  ogImage,
  onVideoChange,
  onThumbnailFetch,
}: {
  videoUrl: string;
  ogImage: string;
  onVideoChange: (url: string, videoInfo?: VideoInfo) => void;
  onThumbnailFetch: (thumbnail: string) => void;
}) {
  const [inputValue, setInputValue] = useState(videoUrl || "");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const videoId = extractYouTubeId(videoUrl);

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    setInputValue(pastedText);
    validateAndSet(pastedText);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError("");
  };

  const handleBlur = () => {
    if (inputValue) {
      validateAndSet(inputValue);
    }
  };

  const validateAndSet = async (url: string) => {
    if (!url.trim()) {
      onVideoChange("", undefined);
      setError("");
      setVideoTitle("");
      return;
    }

    setIsValidating(true);
    setError("");

    const id = extractYouTubeId(url);

    if (!id) {
      setError("Link YouTube không hợp lệ");
      setIsValidating(false);
      return;
    }

    try {
      // Fetch video metadata via oEmbed API
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
      const response = await fetch(oEmbedUrl);

      if (response.ok) {
        const data = await response.json();
        const thumbnail = getYouTubeThumbnail(id);

        const videoInfo: VideoInfo = {
          videoId: id,
          title: data.title || "",
          thumbnailUrl: thumbnail,
          authorName: data.author_name || "",
          embedUrl: `https://www.youtube.com/embed/${id}`,
          watchUrl: `https://www.youtube.com/watch?v=${id}`,
        };

        setVideoTitle(data.title || "");
        onVideoChange(url, videoInfo);

        // Auto-set OG image if not set
        if (!ogImage) {
          onThumbnailFetch(thumbnail);
        }
      } else {
        // Fallback without metadata
        const thumbnail = getYouTubeThumbnail(id);
        onVideoChange(url, {
          videoId: id,
          title: "",
          thumbnailUrl: thumbnail,
          authorName: "",
          embedUrl: `https://www.youtube.com/embed/${id}`,
          watchUrl: `https://www.youtube.com/watch?v=${id}`,
        });

        if (!ogImage) {
          onThumbnailFetch(thumbnail);
        }
      }
    } catch (err) {
      // Still set video even if metadata fetch fails
      const thumbnail = getYouTubeThumbnail(id);
      onVideoChange(url, {
        videoId: id,
        title: "",
        thumbnailUrl: thumbnail,
        authorName: "",
        embedUrl: `https://www.youtube.com/embed/${id}`,
        watchUrl: `https://www.youtube.com/watch?v=${id}`,
      });

      if (!ogImage) {
        onThumbnailFetch(thumbnail);
      }
    }

    setIsValidating(false);
  };

  const handleRemove = () => {
    setInputValue("");
    onVideoChange("", undefined);
    setError("");
    setVideoTitle("");
  };

  return (
    <Section title="Video YouTube" icon={Youtube}>
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          Paste link YouTube để nhúng video vào bài viết
        </p>

        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onPaste={handlePaste}
            onBlur={handleBlur}
            placeholder="https://youtube.com/watch?v=..."
            className={`w-full px-3 py-2 pr-10 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                : videoId
                ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                : "border-gray-200 focus:ring-orange-500/20 focus:border-orange-500"
            }`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isValidating ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : videoId ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : null}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Video Preview */}
        {videoId && (
          <div className="space-y-2">
            {/* Video Title from YouTube */}
            {videoTitle && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">Tiêu đề video:</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {videoTitle}
                </p>
              </div>
            )}

            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black">
              <div className="aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(videoId)}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs text-green-700 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Video responsive + Schema.org/VideoObject cho SEO
              </p>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
