// features/artworks/hooks/useArtworks.ts
// ✅ Hook Layer - State management

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  artworkService,
  Artwork,
  ArtworkFilters,
  UploadArtworkData,
} from "../services/artwork.service";

export function useArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  /**
   * Fetch artworks with filters
   */
  const fetchArtworks = useCallback(async (filters?: ArtworkFilters) => {
    setIsLoading(true);
    try {
      const data = await artworkService.getArtworks(filters);
      setArtworks(data.artworks);
      setPagination(data.pagination);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách artwork"
      );
      console.error("Error fetching artworks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Upload new artwork
   */
  const uploadArtwork = async (data: UploadArtworkData) => {
    try {
      const artwork = await artworkService.uploadArtwork(data);
      toast.success("Đã upload artwork thành công!");

      // Add to list
      setArtworks((prev) => [artwork, ...prev]);

      return artwork;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Không thể upload artwork";
      toast.error(message);
      throw error;
    }
  };

  /**
   * Delete artwork
   */
  const deleteArtwork = async (artworkId: string) => {
    try {
      await artworkService.deleteArtwork(artworkId);
      toast.success("Đã xóa artwork");

      // Remove from list
      setArtworks((prev) => prev.filter((a) => a._id !== artworkId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa artwork");
      throw error;
    }
  };

  /**
   * Update artwork metadata
   */
  const updateMetadata = async (
    artworkId: string,
    data: {
      description?: string;
      tags?: string[];
      notes?: string;
    }
  ) => {
    try {
      const updated = await artworkService.updateMetadata(artworkId, data);
      toast.success("Đã cập nhật artwork");

      // Update in list
      setArtworks((prev) =>
        prev.map((a) => (a._id === artworkId ? updated : a))
      );

      return updated;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật artwork"
      );
      throw error;
    }
  };

  return {
    artworks,
    isLoading,
    pagination,
    fetchArtworks,
    uploadArtwork,
    deleteArtwork,
    updateMetadata,
  };
}

/**
 * Hook for single artwork detail
 */
export function useArtworkDetail(artworkId: string) {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [versionHistory, setVersionHistory] = useState<Artwork[]>([]);

  const fetchArtwork = useCallback(async () => {
    if (!artworkId) return;

    setIsLoading(true);
    try {
      const data = await artworkService.getArtworkDetail(artworkId);
      setArtwork(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải artwork");
      console.error("Error fetching artwork:", error);
    } finally {
      setIsLoading(false);
    }
  }, [artworkId]);

  const fetchVersionHistory = useCallback(async () => {
    if (!artworkId) return;

    try {
      const versions = await artworkService.getVersionHistory(artworkId);
      setVersionHistory(versions);
    } catch (error: any) {
      console.error("Error fetching version history:", error);
    }
  }, [artworkId]);

  const createVersion = async (file: File) => {
    try {
      const newVersion = await artworkService.createVersion(artworkId, file);
      toast.success("Đã tạo version mới!");
      setArtwork(newVersion);
      await fetchVersionHistory();
      return newVersion;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo version mới");
      throw error;
    }
  };

  return {
    artwork,
    isLoading,
    versionHistory,
    fetchArtwork,
    fetchVersionHistory,
    createVersion,
  };
}
