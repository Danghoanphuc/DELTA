// apps/admin-frontend/src/components/suppliers/QuickEditMetadataModal.tsx
// Quick edit modal for AI-generated metadata
import { useState } from "react";
import {
  X,
  Save,
  Tag,
  Link as LinkIcon,
  FileText,
  Sparkles,
} from "lucide-react";

interface QuickEditMetadataModalProps {
  post: {
    _id: string;
    title: string;
    excerpt?: string;
    tags?: string[];
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    updates: Partial<QuickEditMetadataModalProps["post"]>
  ) => Promise<void>;
}

export function QuickEditMetadataModal({
  post,
  isOpen,
  onClose,
  onSave,
}: QuickEditMetadataModalProps) {
  const [formData, setFormData] = useState({
    excerpt: post.excerpt || "",
    tags: post.tags || [],
    slug: post.slug || "",
    metaTitle: post.metaTitle || "",
    metaDescription: post.metaDescription || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Chỉnh sửa nhanh Metadata
              </h2>
              <p className="text-sm text-gray-600 truncate max-w-md">
                {post.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Excerpt */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Mô tả ngắn (Excerpt)
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
              placeholder="Viết 1-2 câu mô tả hấp dẫn..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.excerpt.length}/200 ký tự
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <Tag className="w-4 h-4 text-purple-600" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm group"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-purple-400 hover:text-purple-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="Thêm tag mới..."
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <LinkIcon className="w-4 h-4 text-purple-600" />
              URL Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              placeholder="url-bai-viet-chuan-seo"
            />
            <p className="text-xs text-gray-500 mt-1">
              domain.com/tap-chi/{formData.slug || "..."}
            </p>
          </div>

          {/* SEO Meta */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              SEO Metadata (Optional)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-600 mb-1.5 block">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Tiêu đề SEO..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaTitle.length}/60 ký tự
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1.5 block">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  placeholder="Mô tả SEO..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 ký tự
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
