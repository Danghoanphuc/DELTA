// apps/admin-frontend/src/components/suppliers/SupplierPostsList.tsx
// Component to display supplier posts (like Facebook feed)

import { useState, useEffect } from "react";
import {
  Heart,
  Eye,
  MoreVertical,
  Edit2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { supplierApi } from "@/services/catalog.service";
import { toast } from "sonner";
import { PostEditorSelector } from "./PostEditorSelector";
import { QuickEditMetadataModal } from "./QuickEditMetadataModal";

interface Post {
  _id: string;
  title?: string;
  excerpt?: string;
  content: string;
  media: Array<{
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }>;
  visibility: string;
  likes: number;
  views: number;
  tags: string[];
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  createdBy: {
    displayName: string;
    email: string;
  };
  // Author profile
  authorProfile?: {
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
  };
  // Additional fields
  category?: string;
  subcategory?: string;
  readTime?: number;
  featured?: boolean;
  ogImage?: string;
  schemaType?: string;
  relatedProducts?: string[];
  relatedPosts?: string[];
  highlightQuote?: string;
}

interface SupplierPostsListProps {
  supplierId: string;
}

export function SupplierPostsList({ supplierId }: SupplierPostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [quickEditingPost, setQuickEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [supplierId]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const result = await supplierApi.getPostsBySupplier(supplierId);
      setPosts(result.posts || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowEditModal(true);
    setShowMenu(null);
  };

  const handleQuickEdit = (post: Post) => {
    setQuickEditingPost(post);
    setShowMenu(null);
  };

  const handleQuickEditSave = async (updates: any) => {
    if (!quickEditingPost) return;

    try {
      await supplierApi.updatePost(quickEditingPost._id, updates);
      toast.success("✨ Đã cập nhật metadata!");
      setQuickEditingPost(null);
      fetchPosts(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật");
      throw error;
    }
  };

  const handleUpdatePost = async (data: any) => {
    if (!editingPost) return;

    try {
      await supplierApi.updatePost(editingPost._id, data);
      toast.success("Đã cập nhật bài viết!");
      setShowEditModal(false);
      setEditingPost(null);
      fetchPosts(); // Refresh list
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật bài viết"
      );
      throw error;
    }
  };

  const handleDeleteClick = (postId: string) => {
    setDeletingPostId(postId);
    setShowDeleteConfirm(true);
    setShowMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPostId) return;

    try {
      await supplierApi.deletePost(deletingPostId);
      toast.success("Đã xóa bài viết!");
      setShowDeleteConfirm(false);
      setDeletingPostId(null);
      fetchPosts(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa bài viết");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-gray-500">Chưa có bài viết nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
        <div className="col-span-5">Tiêu đề / Nội dung</div>
        <div className="col-span-2 text-center">Trạng thái</div>
        <div className="col-span-2 text-center">Thống kê</div>
        <div className="col-span-2 text-center">Ngày đăng</div>
        <div className="col-span-1 text-center">Thao tác</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {posts.map((post) => (
          <div
            key={post._id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
          >
            {/* Title / Content */}
            <div className="col-span-5">
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                {post.media.length > 0 && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {post.media[0].type === "image" ? (
                      <img
                        src={post.media[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={post.media[0].url}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  {post.title && (
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {post.title}
                    </h4>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {post.content}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2 flex justify-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  post.visibility === "public"
                    ? "bg-green-100 text-green-700"
                    : post.visibility === "private"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {post.visibility === "public"
                  ? "Công khai"
                  : post.visibility === "private"
                  ? "Riêng tư"
                  : "Nháp"}
              </span>
            </div>

            {/* Stats */}
            <div className="col-span-2 text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="col-span-2 text-center text-sm text-gray-600">
              {formatDate(post.createdAt)}
            </div>

            {/* Actions */}
            <div className="col-span-1 flex justify-center">
              <div className="relative">
                <button
                  onClick={() =>
                    setShowMenu(showMenu === post._id ? null : post._id)
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                {showMenu === post._id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(null)}
                    />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                      <button
                        onClick={() => handleQuickEdit(post)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 border-b"
                      >
                        <Sparkles className="w-4 h-4" />
                        Sửa metadata
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <Edit2 className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(post._id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Edit Metadata Modal */}
      {quickEditingPost && (
        <QuickEditMetadataModal
          post={{
            _id: quickEditingPost._id,
            title: quickEditingPost.title || "",
            excerpt: quickEditingPost.excerpt,
            tags: quickEditingPost.tags,
            slug: quickEditingPost.slug,
            metaTitle: quickEditingPost.metaTitle,
            metaDescription: quickEditingPost.metaDescription,
          }}
          isOpen={!!quickEditingPost}
          onClose={() => setQuickEditingPost(null)}
          onSave={handleQuickEditSave}
        />
      )}

      {/* Edit Post Modal - auto-detect mode from existing content */}
      {editingPost && (
        <PostEditorSelector
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPost(null);
          }}
          onSubmit={handleUpdatePost}
          initialData={{
            // Content fields
            title: editingPost.title,
            content: editingPost.content,
            blocks: (editingPost as any).blocks, // Pass blocks if exists
            excerpt: editingPost.excerpt,
            media: editingPost.media,
            visibility: editingPost.visibility as
              | "public"
              | "private"
              | "draft",
            tags: editingPost.tags,
            // Category & SEO
            category: editingPost.category,
            subcategory: editingPost.subcategory,
            readTime: editingPost.readTime,
            featured: editingPost.featured,
            slug: editingPost.slug,
            metaTitle: editingPost.metaTitle,
            metaDescription: editingPost.metaDescription,
            ogImage: editingPost.ogImage,
            schemaType: editingPost.schemaType,
            // Related content
            relatedProducts: editingPost.relatedProducts,
            relatedPosts: editingPost.relatedPosts,
            highlightQuote: editingPost.highlightQuote,
            // Author profile - flatten for form
            authorName: editingPost.authorProfile?.name,
            authorTitle: editingPost.authorProfile?.title,
            authorAvatar: editingPost.authorProfile?.avatar,
            authorBio: editingPost.authorProfile?.bio,
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xác nhận xóa bài viết
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể
              hoàn tác.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingPostId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Xóa bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
