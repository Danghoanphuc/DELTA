/**
 * Supplier Adapter Factory
 *
 * Factory pattern to create supplier adapters
 * Handles adapter instantiation and caching
 */

import { BaseSupplierAdapter } from "./base-supplier.adapter.js";
import { PrintfulAdapter } from "./printful.adapter.js";
import { Logger } from "../../shared/utils/logger.util.js";

export class SupplierAdapterFactory {
  private static adapterCache: Map<string, BaseSupplierAdapter> = new Map();

  /**
   * Create supplier adapter by type
   * @param supplierType - Supplier type (e.g., "printful", "customcat")
   * @param apiKey - Optional API key (uses env var if not provided)
   * @returns Supplier adapter instance
   */
  static create(supplierType: string, apiKey?: string): BaseSupplierAdapter {
    const cacheKey = `${supplierType}-${apiKey || "default"}`;

    // Return cached adapter if exists
    if (this.adapterCache.has(cacheKey)) {
      Logger.debug(
        `[SupplierAdapterFactory] Using cached adapter for ${supplierType}`
      );
      return this.adapterCache.get(cacheKey)!;
    }

    Logger.info(
      `[SupplierAdapterFactory] Creating new adapter for ${supplierType}`
    );

    let adapter: BaseSupplierAdapter;

    switch (supplierType.toLowerCase()) {
      case "printful":
        const printfulKey = apiKey || process.env.PRINTFUL_API_KEY;
        if (!printfulKey) {
          throw new Error(
            "Printful API key not provided. Set PRINTFUL_API_KEY environment variable."
          );
        }
        adapter = new PrintfulAdapter(printfulKey);
        break;

      case "customcat":
        // TODO: Implement CustomCat adapter
        throw new Error("CustomCat adapter not yet implemented");

      case "gooten":
        // TODO: Implement Gooten adapter
        throw new Error("Gooten adapter not yet implemented");

      default:
        throw new Error(`Unsupported supplier type: ${supplierType}`);
    }

    // Cache adapter for reuse
    this.adapterCache.set(cacheKey, adapter);

    Logger.success(
      `[SupplierAdapterFactory] Created adapter for ${supplierType}`
    );

    return adapter;
  }

  /**
   * Clear adapter cache
   * Useful for testing or when API keys change
   */
  static clearCache(): void {
    Logger.info("[SupplierAdapterFactory] Clearing adapter cache");
    this.adapterCache.clear();
  }

  /**
   * Get list of supported supplier types
   * @returns Array of supported supplier types
   */
  static getSupportedSuppliers(): string[] {
    return ["printful"]; // Add more as implemented
  }

  /**
   * Check if supplier type is supported
   * @param supplierType - Supplier type to check
   * @returns True if supported
   */
  static isSupported(supplierType: string): boolean {
    return this.getSupportedSuppliers().includes(supplierType.toLowerCase());
  }
}
