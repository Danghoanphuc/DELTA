// apps/admin-frontend/src/services/ai-metadata.service.ts
// Service to generate post metadata using AI (ChatGPT/Claude)

interface PostContent {
  title: string;
  content: string;
  category?: string;
}

interface GeneratedMetadata {
  excerpt: string;
  tags: string[];
  slug: string;
  metaTitle: string;
  metaDescription: string;
  readTime: number;
}

class AIMetadataService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor() {
    // TODO: Move to env variables
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
    this.apiEndpoint = "https://api.openai.com/v1/chat/completions";
  }

  /**
   * Generate all metadata for a post using AI
   */
  async generateMetadata(post: PostContent): Promise<GeneratedMetadata> {
    try {
      const prompt = this.buildPrompt(post);
      const response = await this.callAI(prompt);
      const metadata = this.parseAIResponse(response);

      // Calculate read time (fallback if AI doesn't provide)
      const readTime = this.calculateReadTime(post.content);

      return {
        excerpt: metadata.excerpt || post.content.substring(0, 200) + "...",
        tags: metadata.tags || [],
        slug: metadata.slug || this.generateSlug(post.title),
        metaTitle: metadata.metaTitle || post.title.substring(0, 60),
        metaDescription:
          metadata.metaDescription || post.content.substring(0, 160) + "...",
        readTime: metadata.readTime || readTime,
      };
    } catch (error) {
      console.error("[AI Metadata] Error:", error);
      // Fallback to manual generation
      return this.generateFallbackMetadata(post);
    }
  }

  /**
   * Build prompt for AI
   * UPDATED: Tối ưu cho Luxury B2B & SEO Ngách
   */
  private buildPrompt(post: PostContent): string {
    return `Bạn là Giám đốc Sáng tạo và Chuyên gia SEO cho thương hiệu quà tặng doanh nghiệp Luxury (B2B).
Phong cách: Sang trọng, tinh tế, am hiểu phong thủy và tâm lý lãnh đạo (Sếp).

Dựa vào nội dung bài viết sau, hãy tạo metadata chuẩn SEO B2B theo format JSON:

**Tiêu đề**: ${post.title}
**Chuyên mục**: ${post.category || "Chưa phân loại"}
**Nội dung**:
${post.content.substring(0, 2000)}...

Yêu cầu khắt khe:
1. **slug**: 
   - CỰC KỲ QUAN TRỌNG: Phải ngắn gọn (tối đa 3-5 từ), chứa từ khóa chính.
   - BỎ các từ văn hoa sáo rỗng (như "chi-vuon-cao", "nghe-thuat", "kham-pha").
   - Tập trung vào SẢN PHẨM hoặc ĐỐI TƯỢNG.
   - Ví dụ SAI: "nghe-thuat-kintsugi-va-bai-hoc-lanh-dao"
   - Ví dụ ĐÚNG: "qua-tang-kintsugi-lanh-dao" hoặc "binh-hut-loc-men-ran"

2. **excerpt** (Mô tả ngắn cho Blog): 
   - Viết 1-2 câu (150-200 ký tự) khơi gợi sự tò mò, dùng ngôn ngữ "người trong nghề".

3. **metaDescription** (Cho Google): 
   - Tối đa 160 ký tự.
   - Cấu trúc: [Tên Sản phẩm/Giải pháp] + [Lợi ích đẳng cấp/Tâm linh] + [CTA nhẹ nhàng].
   - Phải chứa từ khóa: "Cao cấp", "Lãnh đạo", "Độc bản" hoặc tên sản phẩm cụ thể (Sơn mài, Trầm hương...).

4. **metaTitle**: 
   - Tối đa 60 ký tự. Giật tít nhưng phải sang (không rẻ tiền).

5. **tags**: 
   - 5 từ khóa dài (long-tail keyword) mà khách hàng B2B thường tìm kiếm.
   - KHÔNG dùng từ đơn vô nghĩa (như "quà", "tặng", "doanh", "nghiệp").
   - Ví dụ ĐÚNG: "quà tặng sếp mệnh mộc", "tranh sơn mài cao cấp".

6. **readTime**: Ước tính số phút đọc.

Trả về ĐÚNG format JSON này (không thêm markdown, không giải thích):
{
  "excerpt": "...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "slug-ngan-chuan-seo",
  "metaTitle": "...",
  "metaDescription": "...",
  "readTime": 5
}`;
  }

  /**
   * Call OpenAI API
   */
  private async callAI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cheaper and faster
        messages: [
          {
            role: "system",
            content:
              "Bạn là chuyên gia SEO và content marketing. Luôn trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Parse AI response to metadata object
   */
  private parseAIResponse(response: string): Partial<GeneratedMetadata> {
    try {
      // Remove markdown code blocks if present
      const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        excerpt: parsed.excerpt || "",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        slug: parsed.slug || "",
        metaTitle: parsed.metaTitle || "",
        metaDescription: parsed.metaDescription || "",
        readTime: parsed.readTime || 0,
      };
    } catch (error) {
      console.error("[AI Metadata] Parse error:", error);
      throw error;
    }
  }

  /**
   * Calculate read time based on word count
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Fallback metadata generation (no AI)
   */
  private generateFallbackMetadata(post: PostContent): GeneratedMetadata {
    const slug = this.generateSlug(post.title);
    const readTime = this.calculateReadTime(post.content);

    // Extract first paragraph as excerpt
    const firstParagraph = post.content
      .split("\n")
      .find((p) => p.trim().length > 50);
    const excerpt = firstParagraph
      ? firstParagraph.substring(0, 200) + "..."
      : post.content.substring(0, 200) + "...";

    // Simple tag extraction (most common words)
    const words = post.content
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const tags = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    return {
      excerpt,
      tags,
      slug,
      metaTitle: post.title.substring(0, 60),
      metaDescription: excerpt.substring(0, 160),
      readTime,
    };
  }

  /**
   * Quick excerpt generation only (faster)
   */
  async generateExcerpt(content: string): Promise<string> {
    try {
      const prompt = `Viết 1 câu mô tả hấp dẫn (150-200 ký tự) cho bài viết này:\n\n${content.substring(
        0,
        1000
      )}`;

      const response = await this.callAI(prompt);
      return response.trim().replace(/^["']|["']$/g, "");
    } catch (error) {
      // Fallback
      const firstParagraph = content
        .split("\n")
        .find((p) => p.trim().length > 50);
      return firstParagraph
        ? firstParagraph.substring(0, 200) + "..."
        : content.substring(0, 200) + "...";
    }
  }
}

export const aiMetadataService = new AIMetadataService();
