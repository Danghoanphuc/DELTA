// apps/admin-frontend/src/components/products/form-sections/StorytellingSection.tsx
// Section 4: Storytelling Content - With Import from Supplier Posts

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Loader2,
  FileText,
  ChevronDown,
  Check,
  Search,
} from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";
import { uploadService } from "../../../services/upload.service";
import { supplierApi } from "../../../services/catalog.service";
import { toast } from "sonner";

interface StorytellingSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

interface SupplierPost {
  _id: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  supplier?: {
    _id: string;
    name: string;
  };
  media?: Array<{
    type: "image" | "video";
    url: string;
  }>;
}

export function StorytellingSection({
  formData,
  updateFormData,
}: StorytellingSectionProps) {
  const [uploadingPart, setUploadingPart] = useState<
    "materials" | "process" | null
  >(null);
  const materialsInputRef = useRef<HTMLInputElement>(null);
  const processInputRef = useRef<HTMLInputElement>(null);

  // Import from posts state
  const [posts, setPosts] = useState<SupplierPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [showPostDropdown, setShowPostDropdown] = useState(false);
  const [postSearch, setPostSearch] = useState("");
  const [importTarget, setImportTarget] = useState<
    "materials" | "process" | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowPostDropdown(false);
        setImportTarget(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const result = await supplierApi.getAllPosts({
        visibility: "public",
        limit: 50,
      });
      setPosts(result.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Filter posts by search
  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.supplier?.name?.toLowerCase().includes(postSearch.toLowerCase())
  );

  // Import content from post
  const handleImportFromPost = (
    post: SupplierPost,
    target: "materials" | "process"
  ) => {
    // Extract first image from post media
    const firstImage = post.media?.find((m) => m.type === "image")?.url || "";

    // Strip HTML tags from content for plain text
    const plainContent = post.content
      ? post.content.replace(/<[^>]*>/g, "").trim()
      : post.excerpt || "";

    updateFormData({
      story: {
        ...formData.story,
        [target]: {
          title: post.title || "",
          content: plainContent.substring(0, 500), // Limit content length
          image: firstImage,
        },
      },
    });

    setShowPostDropdown(false);
    setImportTarget(null);
    setPostSearch("");
    toast.success(`Đã import nội dung từ "${post.title}"`);
  };

  const openImportDropdown = (target: "materials" | "process") => {
    setImportTarget(target);
    setShowPostDropdown(true);
  };

  const handleImageUpload = async (
    part: "materials" | "process",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingPart(part);
    try {
      const url = await uploadService.uploadImage(file, `story-${part}`);
      updateFormData({
        story: {
          ...formData.story,
          [part]: {
            ...formData.story?.[part],
            title: formData.story?.[part]?.title || "",
            content: formData.story?.[part]?.content || "",
            image: url,
          },
        },
      });
      toast.success("Upload ảnh thành công!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload ảnh thất bại");
    } finally {
      setUploadingPart(null);
      if (part === "materials" && materialsInputRef.current) {
        materialsInputRef.current.value = "";
      }
      if (part === "process" && processInputRef.current) {
        processInputRef.current.value = "";
      }
    }
  };

  // Render import dropdown
  const renderImportDropdown = () => {
    if (!showPostDropdown || !importTarget) return null;

    return (
      <div
        ref={dropdownRef}
        className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden"
      >
        {/* Search input */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              placeholder="Tìm bài viết..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          </div>
        </div>

        {/* Posts list */}
        <div className="max-h-60 overflow-y-auto">
          {isLoadingPosts ? (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 mx-auto text-orange-500 animate-spin" />
              <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Không tìm thấy bài viết nào
            </div>
          ) : (
            filteredPosts.map((post) => (
              <button
                key={post._id}
                type="button"
                onClick={() => handleImportFromPost(post, importTarget)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {post.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {post.supplier?.name || "Unknown"} •{" "}
                    {post.category || "Bài viết"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Import hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <FileText className="w-4 h-4 inline mr-2" />
          Bạn có thể import nội dung từ các bài viết của đối tác bằng cách nhấn
          nút "Import từ bài viết" ở mỗi phần.
        </p>
      </div>

      {/* Part 1: Materials */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Phần 1: Nguyên liệu
          </h3>
          <div className="relative">
            <button
              type="button"
              onClick={() => openImportDropdown("materials")}
              className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Import từ bài viết
              <ChevronDown className="w-4 h-4" />
            </button>
            {importTarget === "materials" && renderImportDropdown()}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              value={formData.story?.materials?.title || ""}
              onChange={(e) =>
                updateFormData({
                  story: {
                    ...formData.story,
                    materials: {
                      ...formData.story?.materials,
                      title: e.target.value,
                      content: formData.story?.materials?.content || "",
                      image: formData.story?.materials?.image || "",
                    },
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="VD: Chọn lựa nguyên liệu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              value={formData.story?.materials?.content || ""}
              onChange={(e) =>
                updateFormData({
                  story: {
                    ...formData.story,
                    materials: {
                      ...formData.story?.materials,
                      title: formData.story?.materials?.title || "",
                      content: e.target.value,
                      image: formData.story?.materials?.image || "",
                    },
                  },
                })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="Kể về quá trình chọn nguyên liệu..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh minh họa
            </label>
            <input
              ref={materialsInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload("materials", e)}
              className="hidden"
            />
            {!formData.story?.materials?.image ? (
              <button
                type="button"
                onClick={() => materialsInputRef.current?.click()}
                disabled={uploadingPart === "materials"}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors disabled:opacity-50"
              >
                {uploadingPart === "materials" ? (
                  <>
                    <Loader2 className="mx-auto h-8 w-8 text-orange-500 animate-spin" />
                    <p className="mt-2 text-sm text-gray-600">Đang upload...</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload ảnh</p>
                  </>
                )}
              </button>
            ) : (
              <div className="relative">
                <img
                  src={formData.story.materials.image}
                  alt="Materials"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      story: {
                        ...formData.story,
                        materials: {
                          title: formData.story?.materials?.title || "",
                          content: formData.story?.materials?.content || "",
                          image: "",
                        },
                      },
                    })
                  }
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Part 2: Process */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Phần 2: Quy trình chế tác
          </h3>
          <div className="relative">
            <button
              type="button"
              onClick={() => openImportDropdown("process")}
              className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Import từ bài viết
              <ChevronDown className="w-4 h-4" />
            </button>
            {importTarget === "process" && renderImportDropdown()}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              value={formData.story?.process?.title || ""}
              onChange={(e) =>
                updateFormData({
                  story: {
                    ...formData.story,
                    process: {
                      ...formData.story?.process,
                      title: e.target.value,
                      content: formData.story?.process?.content || "",
                      image: formData.story?.process?.image || "",
                    },
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="VD: Tạo hình & Trang trí"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              value={formData.story?.process?.content || ""}
              onChange={(e) =>
                updateFormData({
                  story: {
                    ...formData.story,
                    process: {
                      ...formData.story?.process,
                      title: formData.story?.process?.title || "",
                      content: e.target.value,
                      image: formData.story?.process?.image || "",
                    },
                  },
                })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="Kể về quy trình chế tác..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh minh họa
            </label>
            <input
              ref={processInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload("process", e)}
              className="hidden"
            />
            {!formData.story?.process?.image ? (
              <button
                type="button"
                onClick={() => processInputRef.current?.click()}
                disabled={uploadingPart === "process"}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors disabled:opacity-50"
              >
                {uploadingPart === "process" ? (
                  <>
                    <Loader2 className="mx-auto h-8 w-8 text-orange-500 animate-spin" />
                    <p className="mt-2 text-sm text-gray-600">Đang upload...</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload ảnh</p>
                  </>
                )}
              </button>
            ) : (
              <div className="relative">
                <img
                  src={formData.story.process.image}
                  alt="Process"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      story: {
                        ...formData.story,
                        process: {
                          title: formData.story?.process?.title || "",
                          content: formData.story?.process?.content || "",
                          image: "",
                        },
                      },
                    })
                  }
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
