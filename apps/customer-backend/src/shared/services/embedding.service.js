// apps/customer-backend/src/shared/services/embedding.service.js
// ❌ DO NOT import OpenAI at top level - causes Sentry ESM hook issues
// ❌ import OpenAI from "openai";
// ✅ Use dynamic import in _getOpenAI() instead
import { config } from "../../config/env.config.js";
import { Logger } from "../utils/index.js";

/**
 * EmbeddingService - Generates text embeddings using OpenAI
 * Used for semantic search in products via MongoDB Atlas Vector Search
 */
class EmbeddingService {
  constructor() {
    this.openai = null;
    this.model = "text-embedding-3-small";
    this.dimensions = 1536;
  }

  /**
   * Lazy load OpenAI client
   * @returns {Promise<OpenAI|null>}
   */
  async _getOpenAI() {
    if (!config.apiKeys.openai) {
      Logger.warn(
        "[EmbeddingService] OPENAI_API_KEY is not configured. Vector search will be disabled."
      );
      return null;
    }

    if (!this.openai) {
      // ✅ Dynamic import to avoid Sentry ESM hook issues
      const { default: OpenAI } = await import("openai");
      this.openai = new OpenAI({
        apiKey: config.apiKeys.openai,
      });
    }

    return this.openai;
  }

  /**
   * Check if the service is available
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    const client = await this._getOpenAI();
    return client !== null;
  }

  /**
   * Sanitize text for embedding generation
   * @param {string} text - Raw text
   * @returns {string} - Sanitized text
   */
  sanitizeText(text) {
    if (!text) return "";
    return text
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/\r/g, "") // Remove carriage returns
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim();
  }

  /**
   * Generate embedding vector for a given text
   * @param {string} text - Input text to embed
   * @returns {Promise<number[]|null>} - Embedding vector or null on error
   */
  async generateEmbedding(text) {
    const openai = await this._getOpenAI();
    if (!openai) {
      Logger.warn(
        "[EmbeddingService] Service not available. Skipping embedding generation."
      );
      return null;
    }

    if (!text || text.trim() === "") {
      Logger.warn("[EmbeddingService] Empty text provided for embedding.");
      return null;
    }

    try {
      const sanitizedText = this.sanitizeText(text);

      Logger.info(
        `[EmbeddingService] Generating embedding for text (${sanitizedText.length} chars)`
      );

      const response = await openai.embeddings.create({
        model: this.model,
        input: sanitizedText,
        dimensions: this.dimensions,
      });

      const embedding = response.data[0].embedding;

      if (!embedding || embedding.length !== this.dimensions) {
        Logger.error(
          `[EmbeddingService] Invalid embedding dimensions: ${embedding?.length}`
        );
        return null;
      }

      Logger.info(
        `[EmbeddingService] Successfully generated embedding (${embedding.length} dimensions)`
      );

      return embedding;
    } catch (error) {
      Logger.error(
        `[EmbeddingService] Error generating embedding: ${error.message}`,
        error
      );

      // Log specific OpenAI errors
      if (error.response) {
        Logger.error(
          `[EmbeddingService] OpenAI API error: ${error.response.status} - ${error.response.data?.error?.message}`
        );
      }

      return null;
    }
  }

  /**
   * Generate embedding for a product
   * Creates a rich text representation of the product for better semantic search
   * @param {object} product - Product data
   * @returns {Promise<number[]|null>} - Embedding vector or null on error
   */
  async generateProductEmbedding(product) {
    try {
      // Build rich text representation
      const textParts = [
        product.name || "",
        product.description || "",
        `Category: ${product.category || ""}`,
      ];

      // Add specifications if available
      if (product.specifications) {
        const specs = Object.entries(product.specifications)
          .filter(([_, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        if (specs) {
          textParts.push(`Specifications: ${specs}`);
        }
      }

      // Add materials if available (from assets)
      if (product.assets?.surfaces?.length > 0) {
        const materials = product.assets.surfaces
          .map((s) => s.materialName)
          .filter(Boolean)
          .join(", ");
        if (materials) {
          textParts.push(`Materials: ${materials}`);
        }
      }

      const textToEmbed = textParts.filter(Boolean).join(" - ");

      Logger.info(
        `[EmbeddingService] Generating product embedding for: "${product.name}"`
      );

      return await this.generateEmbedding(textToEmbed);
    } catch (error) {
      Logger.error(
        `[EmbeddingService] Error generating product embedding: ${error.message}`,
        error
      );
      return null;
    }
  }

  /**
   * Batch generate embeddings for multiple texts
   * OpenAI supports batch processing up to 2048 inputs
   * @param {string[]} texts - Array of texts to embed
   * @returns {Promise<(number[]|null)[]>} - Array of embedding vectors
   */
  async generateBatchEmbeddings(texts) {
    const openai = await this._getOpenAI();
    if (!openai) {
      Logger.warn(
        "[EmbeddingService] Service not available. Skipping batch embedding generation."
      );
      return texts.map(() => null);
    }

    if (!texts || texts.length === 0) {
      return [];
    }

    try {
      // Sanitize all texts
      const sanitizedTexts = texts.map((text) => this.sanitizeText(text));

      Logger.info(
        `[EmbeddingService] Generating batch embeddings for ${texts.length} texts`
      );

      const response = await openai.embeddings.create({
        model: this.model,
        input: sanitizedTexts,
        dimensions: this.dimensions,
      });

      const embeddings = response.data.map((item) => item.embedding);

      Logger.info(
        `[EmbeddingService] Successfully generated ${embeddings.length} embeddings`
      );

      return embeddings;
    } catch (error) {
      Logger.error(
        `[EmbeddingService] Error generating batch embeddings: ${error.message}`,
        error
      );
      return texts.map(() => null);
    }
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();
