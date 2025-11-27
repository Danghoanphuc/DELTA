// apps/customer-backend/src/infrastructure/search/algolia.service.js
// ✅ Algolia Search Service - Fixed for v5 & ESM

// 👇 FIX: Dùng Named Import thay vì Default Import
import { algoliasearch } from 'algoliasearch';
import { Logger } from '../../shared/utils/index.js';

class AlgoliaService {
  constructor() {
    try {
      if (process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_KEY) {
        this.client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
        this.indexName = 'products'; // Tên index trên Algolia
        Logger.info('[Algolia] Service initialized');
      } else {
        Logger.warn('[Algolia] Missing keys (ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY), search will fail');
        this.client = null;
      }
    } catch (error) {
      console.error('[Algolia] Initialization error:', error);
      Logger.error('[Algolia] Initialization error:', error);
      this.client = null;
    }
  }

  /**
   * Tìm kiếm sản phẩm
   * @param {String} query - Search query
   * @returns {Promise<Array>} Search results
   */
  async searchProducts(query) {
    if (!this.client) {
      Logger.warn('[Algolia] Client not initialized, returning empty results');
      return [];
    }

    try {
      const { results } = await this.client.search({
        requests: [
          {
            indexName: this.indexName,
            query: query,
            hitsPerPage: 5,
          },
        ],
      });
      return results[0].hits;
    } catch (error) {
      // ✅ FIX: Xử lý lỗi index không tồn tại (404) một cách graceful
      if (error.status === 404 || error.message?.includes('does not exist')) {
        Logger.warn(`[Algolia] Index "${this.indexName}" does not exist. Please create it in Algolia dashboard or run sync script.`);
        return [];
      }
      // Các lỗi khác vẫn log error
      Logger.error('[Algolia] Search error:', error);
      return [];
    }
  }

  /**
   * Hàm đồng bộ 1 sản phẩm lên Algolia (Gọi khi Create/Update Product)
   * @param {Object} product - Product object từ MongoDB
   */
  async syncProduct(product) {
    if (!this.client) {
      // Logger.warn('[Algolia] Client not initialized, skipping sync');
      return;
    }

    try {
      const record = {
        objectID: product._id.toString(),
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.pricing?.[0]?.pricePerUnit || 0,
        image: product.images?.[0]?.url || '',
      };

      // ✅ Algolia v5 API: Dùng saveObjects với object params
      await this.client.saveObjects({ 
        indexName: this.indexName, 
        objects: [record] 
      });
      Logger.info(`[Algolia] Synced product: ${product._id}`);
    } catch (e) {
      // ✅ FIX: Xử lý lỗi index không tồn tại (404) một cách graceful
      if (e.status === 404 || e.message?.includes('does not exist')) {
        Logger.warn(`[Algolia] Index "${this.indexName}" does not exist. Skipping sync.`);
        return;
      }
      Logger.error('[Algolia] Sync error:', e);
    }
  }

  /**
   * Xóa sản phẩm khỏi Algolia (Gọi khi Delete Product)
   * @param {String} productId - Product ID
   */
  async deleteProduct(productId) {
    if (!this.client) {
      return;
    }

    try {
      // ✅ Algolia v5 API: Dùng deleteObjects với object params
      await this.client.deleteObjects({ 
        indexName: this.indexName, 
        objectIDs: [productId.toString()] 
      });
      Logger.info(`[Algolia] Deleted product: ${productId}`);
    } catch (e) {
      // ✅ FIX: Xử lý lỗi index không tồn tại (404) một cách graceful
      if (e.status === 404 || e.message?.includes('does not exist')) {
        Logger.warn(`[Algolia] Index "${this.indexName}" does not exist. Skipping delete.`);
        return;
      }
      Logger.error('[Algolia] Delete error:', e);
    }
  }
}

export const algoliaService = new AlgoliaService();