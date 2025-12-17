// apps/admin-frontend/src/components/suppliers/PostFormSidebar.tsx
import { useState } from "react";
import {
  X,
  Plus,
  Settings,
  Globe,
  Image as ImageIcon,
  Search,
  User,
  Tag,
  UploadCloud,
  LayoutTemplate,
} from "lucide-react";

interface PostFormSidebarProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  onOgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PostFormSidebar({
  formData,
  updateField,
  addTag,
  removeTag,
  onOgImageUpload,
  onContentImageUpload,
}: PostFormSidebarProps) {
  // Tab state: 'general' | 'seo' | 'media'
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Cấu hình", icon: Settings },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "media", label: "Media", icon: ImageIcon },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* --- TABS HEADER --- */}
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

      {/* --- TABS CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
        {/* TAB 1: GENERAL SETTINGS */}
        {activeTab === "general" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Status & Visibility */}
            <Section title="Trạng thái">
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
            </Section>

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

            <Section title="Tác giả" icon={User}>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => updateField("authorName", e.target.value)}
                  placeholder="Tên hiển thị..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <input
                  type="text"
                  value={formData.authorTitle}
                  onChange={(e) => updateField("authorTitle", e.target.value)}
                  placeholder="Chức danh (VD: Curator)..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </Section>

            <Section title="Tags" icon={Tag}>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs flex items-center gap-1 group"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-gray-400 group-hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <TagInput onAdd={addTag} />
              </div>
            </Section>
          </div>
        )}

        {/* TAB 2: SEO SETTINGS */}
        {activeTab === "seo" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" /> Preview trên Google
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-blue-600 truncate hover:underline cursor-pointer">
                  domain.com/{formData.slug || "your-url-slug"}
                </p>
                <p className="text-lg text-blue-800 font-medium truncate leading-tight">
                  {formData.metaTitle || formData.title || "Tiêu đề bài viết"}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {formData.metaDescription ||
                    formData.excerpt ||
                    "Mô tả bài viết sẽ xuất hiện ở đây..."}
                </p>
              </div>
            </div>

            <Section title="URL Slug">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="url-bai-viet-chuan-seo"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </Section>

            <Section title="Meta Data">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 flex justify-between">
                    Meta Title <span>{formData.metaTitle.length}/60</span>
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => updateField("metaTitle", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 flex justify-between">
                    Meta Description{" "}
                    <span>{formData.metaDescription.length}/160</span>
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) =>
                      updateField("metaDescription", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                  />
                </div>
              </div>
            </Section>

            <Section title="Schema Type">
              <select
                value={formData.schemaType}
                onChange={(e) => updateField("schemaType", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="Article">📄 Article (Bài viết)</option>
                <option value="FAQ">❓ FAQ (Hỏi đáp)</option>
                <option value="ProductReview">⭐ Product Review</option>
              </select>
            </Section>
          </div>
        )}

        {/* TAB 3: MEDIA */}
        {activeTab === "media" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helper Components for Sidebar ---

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

function TagInput({ onAdd }: { onAdd: (t: string) => void }) {
  const [val, setVal] = useState("");
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && val.trim()) {
      e.preventDefault();
      onAdd(val.trim());
      setVal("");
    }
  };
  return (
    <div className="relative">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tag rồi Enter..."
        className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
      />
      <button
        onClick={() => {
          if (val.trim()) {
            onAdd(val.trim());
            setVal("");
          }
        }}
        className="absolute right-2 top-2 p-0.5 text-gray-400 hover:text-orange-500"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
