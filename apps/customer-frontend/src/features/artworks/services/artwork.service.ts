// features/artworks/services/artwork.service.ts
// ✅ Service Layer - API communication only

import api from "@/shared/lib/axios";

// ==================== TYPES ====================

export interface Artwork {
  _id: string;
  organizationId: string;
  uploadedBy: string;

  // File Info
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  fileFormat: string;

  // Technical Specs
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  resolution: number;
  colorMode: string;
  colorCount: number;
  hasTransparency: boolean;

  // Validation
  validationStatus: "pending" | "approved" | "rejected";
  validationErrors: string[];
  validatedAt?: Date;
  validatedBy?: string;

  // Usage
  usageCount: number;
  lastUsedAt?: Date;

  // Version Control
  version: number;
  previousVersionId?: string;

  // Metadata
  tags: string[];
  description: string;
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadArtworkData {
  file: File;
  description?: string;
  tags?: string[];
}

export interface ArtworkFilters {
  status?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface ArtworkRequirements {
  minResolution: number;
  acceptedFormats: string[];
  colorMode: string;
  maxFileSize: number;
  maxWidth?: number;
  maxHeight?: number;
}

// ==================== SERVICE ====================

class ArtworkService {
  /**
   * Upload new artwork
   */
  async uploadArtwork(data: UploadArtworkData): Promise<Artwork> {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.description) formData.append("description", data.description);
    if (data.tags) formData.append("tags", JSON.stringify(data.tags));

    const res = await api.post("/artworks", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data?.data?.artwork;
  }

  /**
   * Get artwork library
   */
  async getArtworks(filters?: ArtworkFilters): Promise<{
    artworks: Artwork[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.tags?.length) params.append("tags", filters.tags.join(","));
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const res = await api.get(`/artworks?${params}`);
    return res.data?.data;
  }

  /**
   * Get artwork detail
   */
  async getArtworkDetail(artworkId: string): Promise<Artwork> {
    const res = await api.get(`/artworks/${artworkId}`);
    return res.data?.data?.artwork;
  }

  /**
   * Validate artwork against requirements
   */
  async validateArtwork(
    artworkId: string,
    requirements: ArtworkRequirements
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const res = await api.post(`/artworks/${artworkId}/validate`, requirements);
    return res.data?.data;
  }

  /**
   * Create new version of artwork
   */
  async createVersion(artworkId: string, file: File): Promise<Artwork> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`/artworks/${artworkId}/version`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data?.data?.artwork;
  }

  /**
   * Get version history
   */
  async getVersionHistory(artworkId: string): Promise<Artwork[]> {
    const res = await api.get(`/artworks/${artworkId}/versions`);
    return res.data?.data?.versions || [];
  }

  /**
   * Update artwork metadata
   */
  async updateMetadata(
    artworkId: string,
    data: {
      description?: string;
      tags?: string[];
      notes?: string;
    }
  ): Promise<Artwork> {
    const res = await api.put(`/artworks/${artworkId}/metadata`, data);
    return res.data?.data?.artwork;
  }

  /**
   * Delete artwork
   */
  async deleteArtwork(artworkId: string): Promise<void> {
    await api.delete(`/artworks/${artworkId}`);
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    const res = await api.get("/artworks/tags");
    return res.data?.data?.tags || [];
  }

  /**
   * Get artwork statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byFormat: Record<string, number>;
    totalSize: number;
  }> {
    const res = await api.get("/artworks/stats");
    return res.data?.data;
  }
}

export const artworkService = new ArtworkService();
