// apps/admin-frontend/src/services/youtube.service.ts
// Service để fetch YouTube video metadata qua oEmbed API

export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  authorName: string;
  authorUrl: string;
  uploadDate?: string;
  duration?: string;
  embedUrl: string;
  watchUrl: string;
}

class YouTubeService {
  /**
   * Extract YouTube video ID from various URL formats
   */
  extractVideoId(url: string): string | null {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  /**
   * Fetch video metadata using YouTube oEmbed API
   * No API key required!
   */
  async getVideoInfo(url: string): Promise<YouTubeVideoInfo | null> {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;

    try {
      // Use YouTube oEmbed API (no API key needed)
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

      const response = await fetch(oEmbedUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch video info");
      }

      const data = await response.json();

      return {
        videoId,
        title: data.title || "",
        description: "", // oEmbed doesn't provide description
        thumbnailUrl: this.getBestThumbnail(videoId),
        authorName: data.author_name || "",
        authorUrl: data.author_url || "",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    } catch (error) {
      console.error("Error fetching YouTube info:", error);

      // Fallback: return basic info without API call
      return {
        videoId,
        title: "",
        description: "",
        thumbnailUrl: this.getBestThumbnail(videoId),
        authorName: "",
        authorUrl: "",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }
  }

  /**
   * Get best quality thumbnail URL
   */
  getBestThumbnail(videoId: string): string {
    // maxresdefault (1280x720) > sddefault (640x480) > hqdefault (480x360)
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  /**
   * Get embed URL for iframe
   */
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  /**
   * Generate Schema.org VideoObject JSON-LD
   * For SEO - Google will show video in search results
   */
  generateVideoSchema(
    videoInfo: YouTubeVideoInfo,
    pageUrl: string,
    pageTitle: string,
    pageDescription: string
  ): object {
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: videoInfo.title || pageTitle,
      description: videoInfo.description || pageDescription,
      thumbnailUrl: videoInfo.thumbnailUrl,
      uploadDate: videoInfo.uploadDate || new Date().toISOString(),
      contentUrl: videoInfo.watchUrl,
      embedUrl: videoInfo.embedUrl,
      publisher: {
        "@type": "Organization",
        name: videoInfo.authorName || "YouTube",
        url: videoInfo.authorUrl,
      },
      // Optional: duration in ISO 8601 format (PT1H30M = 1 hour 30 minutes)
      ...(videoInfo.duration && { duration: videoInfo.duration }),
    };
  }
}

export const youtubeService = new YouTubeService();
