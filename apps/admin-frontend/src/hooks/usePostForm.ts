// apps/admin-frontend/src/hooks/usePostForm.ts
// Custom hook for post form state management (Single Responsibility)

import { useState, useEffect } from "react";

interface PostFormData {
  // Content
  title: string;
  excerpt: string;
  content: string;
  category: string;
  subcategory: string;
  readTime: string;
  featured: boolean;
  media: Array<{
    type: "image" | "video";
    url: string;
    thumbnail?: string;
    tempId?: string; // ID tạm cho pending images
  }>;
  tags: string[];
  visibility: "public" | "private" | "draft";

  // Video
  videoUrl: string; // YouTube URL
  videoInfo: {
    videoId: string;
    title: string;
    thumbnailUrl: string;
    authorName: string;
    embedUrl: string;
    watchUrl: string;
  } | null;

  // SEO
  slug: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  schemaType: string;

  // Sales
  relatedProducts: any[];
  relatedPosts: any[];
  highlightQuote: string;

  // Author
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  authorBio: string;
}

export function usePostForm(initialData?: Partial<PostFormData>) {
  const [blogMode, setBlogMode] = useState(false);
  // Validate schemaType to prevent invalid values
  const validSchemaTypes = ["Article", "FAQ", "ProductReview"];
  const safeSchemaType =
    initialData?.schemaType && validSchemaTypes.includes(initialData.schemaType)
      ? initialData.schemaType
      : "Article";

  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    category: initialData?.category || "",
    subcategory: initialData?.subcategory || "",
    readTime: initialData?.readTime || "",
    featured: initialData?.featured || false,
    media: initialData?.media || [],
    tags: initialData?.tags || [],
    visibility: initialData?.visibility || "public",
    videoUrl: initialData?.videoUrl || "",
    videoInfo: initialData?.videoInfo || null,
    slug: initialData?.slug || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    ogImage: initialData?.ogImage || "",
    schemaType: safeSchemaType,
    relatedProducts: initialData?.relatedProducts || [],
    relatedPosts: initialData?.relatedPosts || [],
    highlightQuote: initialData?.highlightQuote || "",
    authorName: initialData?.authorName || "",
    authorTitle: initialData?.authorTitle || "",
    authorAvatar: initialData?.authorAvatar || "",
    authorBio: initialData?.authorBio || "",
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const autoSlug = generateSlug(formData.title);
      updateField("slug", autoSlug);
    }
  }, [formData.title]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addMedia = (item: {
    type: "image" | "video";
    url: string;
    tempId?: string;
  }) => {
    setFormData((prev) => ({ ...prev, media: [...prev.media, item] }));
  };

  const removeMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const reset = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      subcategory: "",
      readTime: "",
      featured: false,
      media: [],
      tags: [],
      visibility: "public",
      videoUrl: "",
      videoInfo: null,
      slug: "",
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
      schemaType: "Article",
      relatedProducts: [],
      relatedPosts: [],
      highlightQuote: "",
      authorName: "",
      authorTitle: "",
      authorAvatar: "",
      authorBio: "",
    });
    setBlogMode(false);
  };

  return {
    blogMode,
    setBlogMode,
    formData,
    updateField,
    addMedia,
    removeMedia,
    addTag,
    removeTag,
    reset,
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 60);
}
