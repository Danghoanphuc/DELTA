/**
 * Printful Supplier Adapter
 *
 * Implements BaseSupplierAdapter for Printful API
 * API Docs: https://developers.printful.com/docs/
 */

import {
  BaseSupplierAdapter,
  SupplierProduct,
  InventoryStatus,
  SupplierOrderData,
  SupplierOrder,
  OrderStatus,
} from "./base-supplier.adapter.js";
import { Logger } from "../../shared/utils/logger.util.js";

export class PrintfulAdapter extends BaseSupplierAdapter {
  constructor(apiKey: string) {
    super("Printful", "https://api.printful.com", apiKey);
  }

  /**
   * Get product catalog from Printful
   * @returns List of products
   */
  async getProductCatalog(): Promise<SupplierProduct[]> {
    try {
      Logger.info("[PrintfulAdapter] Fetching product catalog...");

      const response = await this.makeRequest<{
        code: number;
        result: Array<{
          id: number;
          type: string;
          type_name: string;
          title: string;
          brand: string;
          model: string;
          image: string;
          variant_count: number;
          currency: string;
          files: Array<{
            id: string;
            type: string;
            title: string;
            additional_price: string;
          }>;
        }>;
      }>({
        method: "GET",
        url: "/products",
      });

      const products: SupplierProduct[] = response.result.map((product) => ({
        supplierSku: `PRINTFUL-${product.id}`,
        name: product.title,
        description: `${product.brand} ${product.model}`,
        category: product.type_name,
        images: [product.image],
        printMethods: product.files.map((file) => file.type),
      }));

      Logger.success(`[PrintfulAdapter] Fetched ${products.length} products`);

      return products;
    } catch (error) {
      Logger.error("[PrintfulAdapter] Failed to fetch product catalog:", error);
      throw error;
    }
  }

  /**
   * Check inventory for specific variant
   * @param supplierSku - Printful variant ID (e.g., "PRINTFUL-12345")
   * @returns Inventory status
   */
  async checkInventory(supplierSku: string): Promise<InventoryStatus> {
    try {
      // Extract Printful product ID from SKU
      const productId = supplierSku.replace("PRINTFUL-", "");

      Logger.debug(
        `[PrintfulAdapter] Checking inventory for ${supplierSku}...`
      );

      const response = await this.makeRequest<{
        code: number;
        result: {
          sync_product: {
            id: number;
            external_id: string;
            name: string;
            variants: number;
            synced: number;
          };
          sync_variants: Array<{
            id: number;
            external_id: string;
            sync_product_id: number;
            name: string;
            synced: boolean;
            variant_id: number;
            retail_price: string;
            currency: string;
            is_ignored: boolean;
            files: Array<{
              id: number;
              type: string;
              hash: string;
              url: string;
              filename: string;
              mime_type: string;
              size: number;
              width: number;
              height: number;
              dpi: number;
              status: string;
              created: number;
              thumbnail_url: string;
              preview_url: string;
              visible: boolean;
            }>;
          }>;
        };
      }>({
        method: "GET",
        url: `/store/products/${productId}`,
      });

      // Printful doesn't provide real-time inventory
      // Assume available with default lead time
      return {
        supplierSku,
        available: true,
        quantity: 999, // Printful is print-on-demand, effectively unlimited
        leadTime: {
          min: 2,
          max: 7,
          unit: "days",
        },
        lastUpdated: new Date(),
      };
    } catch (error: any) {
      // If product not found, mark as unavailable
      if (error.response?.status === 404) {
        Logger.warn(
          `[PrintfulAdapter] Product ${supplierSku} not found, marking as unavailable`
        );
        return {
          supplierSku,
          available: false,
          quantity: 0,
          leadTime: {
            min: 0,
            max: 0,
            unit: "days",
          },
          lastUpdated: new Date(),
        };
      }

      Logger.error(
        `[PrintfulAdapter] Failed to check inventory for ${supplierSku}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create order with Printful
   * @param orderData - Order data
   * @returns Created order
   */
  async createOrder(orderData: SupplierOrderData): Promise<SupplierOrder> {
    try {
      Logger.info("[PrintfulAdapter] Creating order...");

      // Validate required fields
      this.validateRequiredFields(orderData, ["items", "shippingAddress"]);

      // Map to Printful order format
      const printfulOrder = {
        recipient: {
          name: orderData.shippingAddress.name,
          address1: orderData.shippingAddress.address1,
          address2: orderData.shippingAddress.address2 || "",
          city: orderData.shippingAddress.city,
          state_code: orderData.shippingAddress.state || "",
          country_code: orderData.shippingAddress.country,
          zip: orderData.shippingAddress.zip,
          phone: orderData.shippingAddress.phone || "",
        },
        items: orderData.items.map((item) => ({
          variant_id: parseInt(item.supplierSku.replace("PRINTFUL-", "")),
          quantity: item.quantity,
          files:
            item.customization?.printAreas?.map((area) => ({
              type: area.area,
              url: area.artworkUrl,
            })) || [],
        })),
      };

      const response = await this.makeRequest<{
        code: number;
        result: {
          id: number;
          external_id: string;
          status: string;
          shipping: string;
          created: number;
          updated: number;
          recipient: any;
          items: Array<{
            id: number;
            external_id: string;
            variant_id: number;
            sync_variant_id: number;
            external_variant_id: string;
            quantity: number;
            price: string;
            retail_price: string;
            name: string;
            product: any;
            files: any[];
            options: any[];
          }>;
          costs: {
            currency: string;
            subtotal: string;
            discount: string;
            shipping: string;
            tax: string;
            total: string;
          };
          retail_costs: {
            currency: string;
            subtotal: string;
            discount: string;
            shipping: string;
            tax: string;
            total: string;
          };
        };
      }>({
        method: "POST",
        url: "/orders",
        data: printfulOrder,
      });

      const order: SupplierOrder = {
        id: response.result.id.toString(),
        status: this.mapPrintfulStatus(response.result.status),
        items: response.result.items.map((item) => ({
          supplierSku: `PRINTFUL-${item.variant_id}`,
          quantity: item.quantity,
          status: response.result.status,
        })),
        createdAt: new Date(response.result.created * 1000),
      };

      Logger.success(`[PrintfulAdapter] Created order ${order.id}`);

      return order;
    } catch (error) {
      Logger.error("[PrintfulAdapter] Failed to create order:", error);
      throw error;
    }
  }

  /**
   * Get order status from Printful
   * @param orderId - Printful order ID
   * @returns Order status
   */
  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      Logger.debug(`[PrintfulAdapter] Getting status for order ${orderId}...`);

      const response = await this.makeRequest<{
        code: number;
        result: {
          id: number;
          external_id: string;
          status: string;
          shipping: string;
          created: number;
          updated: number;
          shipments: Array<{
            id: number;
            carrier: string;
            service: string;
            tracking_number: string;
            tracking_url: string;
            created: number;
            ship_date: string;
            shipped_at: number;
            reshipment: boolean;
            items: Array<{
              item_id: number;
              quantity: number;
            }>;
          }>;
        };
      }>({
        method: "GET",
        url: `/orders/${orderId}`,
      });

      const shipment = response.result.shipments?.[0];

      return {
        id: orderId,
        status: this.mapPrintfulStatus(response.result.status),
        trackingNumber: shipment?.tracking_number,
        trackingUrl: shipment?.tracking_url,
        estimatedDelivery: shipment?.ship_date
          ? new Date(shipment.ship_date)
          : undefined,
        actualDelivery: shipment?.shipped_at
          ? new Date(shipment.shipped_at * 1000)
          : undefined,
      };
    } catch (error) {
      Logger.error(
        `[PrintfulAdapter] Failed to get order status for ${orderId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Cancel order with Printful
   * @param orderId - Printful order ID
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      Logger.info(`[PrintfulAdapter] Cancelling order ${orderId}...`);

      await this.makeRequest({
        method: "DELETE",
        url: `/orders/${orderId}`,
      });

      Logger.success(`[PrintfulAdapter] Cancelled order ${orderId}`);
    } catch (error) {
      Logger.error(
        `[PrintfulAdapter] Failed to cancel order ${orderId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Map Printful status to standard status
   * @param printfulStatus - Printful order status
   * @returns Standard status
   */
  private mapPrintfulStatus(
    printfulStatus: string
  ):
    | "pending"
    | "confirmed"
    | "in_production"
    | "shipped"
    | "delivered"
    | "cancelled" {
    const statusMap: Record<string, any> = {
      draft: "pending",
      pending: "confirmed",
      failed: "cancelled",
      canceled: "cancelled",
      onhold: "pending",
      inprocess: "in_production",
      partial: "shipped",
      fulfilled: "delivered",
    };

    return statusMap[printfulStatus] || "pending";
  }
}
