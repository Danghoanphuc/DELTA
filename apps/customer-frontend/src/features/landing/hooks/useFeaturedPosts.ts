import { useState, useEffect } from "react";
import { magazineService, MagazinePost } from "@/services/magazine.service";

export function useFeaturedPosts() {
  const [posts, setPosts] = useState<MagazinePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        console.log("Fetching posts from /magazine/all...");
        // Fetch latest posts from all categories (fallback if no featured posts)
        const result = await magazineService.getPostsByCategory("all", {
          limit: 3,
          page: 1,
        });
        console.log("API result:", result);
        setPosts(result.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, isLoading };
}
