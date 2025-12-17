// apps/customer-frontend/src/features/magazine/hooks/useMagazinePosts.ts
import { useState, useEffect } from "react";
import { magazineService, MagazinePost } from "@/services/magazine.service";

export function useMagazinePosts(category: string) {
  const [posts, setPosts] = useState<MagazinePost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<MagazinePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all posts and featured posts in parallel
        const [allPostsData, featuredPostsData] = await Promise.all([
          magazineService.getPostsByCategory(category, { limit: 20 }),
          magazineService.getPostsByCategory(category, {
            featured: true,
            limit: 3,
          }),
        ]);

        setPosts(allPostsData.posts || []);
        setFeaturedPosts(featuredPostsData.posts || []);
      } catch (err: any) {
        console.error(`Error fetching posts for ${category}:`, err);
        setError(err.message || "Không thể tải bài viết");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  return {
    posts,
    featuredPosts,
    isLoading,
    error,
  };
}
