// apps/admin-frontend/src/components/suppliers/RelatedPostsPicker.tsx
// Component để chọn bài viết liên quan

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  FileText,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supplierApi } from "@/services/catalog.service";

interface Post {
  _id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  ogImage?: string;
  tags?: string[];
}

interface RelatedPostsPickerProps {
  selectedPosts: Post[];
  onPostsChange: (posts: Post[]) => void;
  currentPostId?: string; // Exclude current post from list
  keywords?: string[];
  maxPosts?: number;
}

export function RelatedPostsPicker({
  selectedPosts,
  onPostsChange,
  currentPostId,
  keywords = [],
  maxPosts = 4,
}: RelatedPostsPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all published posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Get posts from all suppliers (public only)
        const result = await supplierApi.getAllPosts({
          visibility: "public",
          limit: 100,
        });
        setAllPosts(result.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Sort posts: prioritize by keywords match
  const sortedPosts = useMemo(() => {
    if (!allPosts.length) return [];

    // Filter out current post and already selected posts
    const selectedIds = new Set(selectedPosts.map((p) => p._id));
    const available = allPosts.filter(
      (p) => p._id !== currentPostId && !selectedIds.has(p._id)
    );

    if (!keywords.length) {
      return available;
    }

    const lowerKeywords = keywords.map((k) => k.toLowerCase());

    const scored = available.map((post) => {
      let score = 0;
      const searchText = `${post.title} ${post.excerpt || ""} ${
        post.tags?.join(" ") || ""
      }`.toLowerCase();

      for (const keyword of lowerKeywords) {
        if (searchText.includes(keyword)) {
          score += 10;
          if (post.title?.toLowerCase().includes(keyword)) score += 5;
          if (post.tags?.some((t) => t.toLowerCase().includes(keyword)))
            score += 3;
        }
      }

      return { post, score };
    });

    return scored.sort((a, b) => b.score - a.score).map((s) => s.post);
  }, [allPosts, selectedPosts, currentPostId, keywords]);

  // Filter by search term
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return sortedPosts;

    const term = searchTerm.toLowerCase();
    return sortedPosts.filter(
      (p) =>
        p.title?.toLowerCase().includes(term) ||
        p.excerpt?.toLowerCase().includes(term) ||
        p.tags?.some((t) => t.toLowerCase().includes(term))
    );
  }, [sortedPosts, searchTerm]);

  const handleAddPost = (post: Post) => {
    if (selectedPosts.length >= maxPosts) return;
    onPostsChange([...selectedPosts, post]);
  };

  const handleRemovePost = (postId: string) => {
    onPostsChange(selectedPosts.filter((p) => p._id !== postId));
  };

  const handleMovePost = (index: number, direction: "up" | "down") => {
    const newPosts = [...selectedPosts];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newPosts.length) return;

    [newPosts[index], newPosts[newIndex]] = [
      newPosts[newIndex],
      newPosts[index],
    ];
    onPostsChange(newPosts);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">
            Bài viết liên quan
          </span>
          <span className="text-xs text-gray-500">
            ({selectedPosts.length}/{maxPosts})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Selected Posts */}
      {selectedPosts.length > 0 && (
        <div className="space-y-2">
          {selectedPosts.map((post, index) => (
            <div
              key={post._id}
              className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleMovePost(index, "up")}
                  disabled={index === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMovePost(index, "down")}
                  disabled={index === selectedPosts.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {post.ogImage ? (
                <img
                  src={post.ogImage}
                  alt={post.title}
                  className="w-12 h-8 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {post.title}
                </p>
                {post.category && (
                  <p className="text-xs text-gray-500">{post.category}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemovePost(post._id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expanded: Post Picker */}
      {isExpanded && (
        <div className="border border-gray-200 rounded-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm bài viết..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Post List */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                {searchTerm ? "Không tìm thấy bài viết" : "Không có bài viết"}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredPosts.slice(0, 15).map((post) => (
                  <button
                    key={post._id}
                    type="button"
                    onClick={() => handleAddPost(post)}
                    disabled={selectedPosts.length >= maxPosts}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {post.ogImage ? (
                      <img
                        src={post.ogImage}
                        alt={post.title}
                        className="w-12 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </p>
                      {post.category && (
                        <p className="text-xs text-gray-500">{post.category}</p>
                      )}
                    </div>

                    <Plus className="w-4 h-4 text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
