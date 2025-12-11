/**
 * Base Supplier Adapter
 *
 * Abstract class that all supplier adapters must implement
 * Provides common utilities and defines standard interface
 */

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Logger } from "../../shared/utils/logger.util.js";

// Standard interfaces for supplier data
export interface SupplierProduct {
  supplierSku: string;
  name: string;
  description?: string;
  category?: string;
  variants?: Array<{
    supplierSku: string;
    attributes: Record<string, any>;
    price: number;
    cost: number;
  }>;
  images?: string[];
  printMethods?: string[];
}

export interface InventoryStatus {
  supplierSku: string;
  available: boolean;
  quantity: number;
  leadTime: {
    min: number;
    max: number;
    unit: "days" | "weeks";
  };
  lastUpdated?: Date;
}

export interface SupplierOrderData {
  items: Array<{
    supplierSku: string;
    quantity: number;
    customization?: {
      printMethod?: string;
      printAreas?: Array<{
        area: string;
        artworkUrl: string;
      }>;
      personalization?: {
        text: string;
        font?: string;
        color?: string;
      };
    };
  }>;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
    phone?: string;
  };
  deadline?: Date;
  notes?: string;
}

export interface SupplierOrder {
  id: string;
  status:
    | "pending"
    | "confirmed"
    | "in_production"
    | "shipped"
    | "delivered"
    | "cancelled";
  items: Array<{
    supplierSku: string;
    quantity: number;
    status: string;
  }>;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
}

export interface OrderStatus {
  id: string;
  status:
    | "pending"
    | "confirmed"
    | "in_production"
    | "shipped"
    | "delivered"
    | "cancelled";
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
}

/**
 * Base Supplier Adapter
 * All supplier-specific adapters must extend this class
 */
export abstract class BaseSupplierAdapter {
  protected httpClient: AxiosInstance;
  protected supplierName: string;

  constructor(supplierName: string, baseURL: string, apiKey?: string) {
    this.supplierName = supplierName;

    // Create axios instance with common configuration
    this.httpClient = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        Logger.debug(
          `[${this.supplierName}Adapter] ${config.method?.toUpperCase()} ${
            config.url
          }`
        );
        return config;
      },
      (error) => {
        Logger.error(`[${this.supplierName}Adapter] Request error:`, error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        Logger.debug(
          `[${this.supplierName}Adapter] Response ${response.status} from ${response.config.url}`
        );
        return response;
      },
      (error) => {
        Logger.error(
          `[${this.supplierName}Adapter] Response error:`,
          error.response?.data || error.message
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get product catalog from supplier
   * @returns List of products with variants
   */
  abstract getProductCatalog(): Promise<SupplierProduct[]>;

  /**
   * Check inventory status for a specific SKU
   * @param supplierSku - Supplier's SKU
   * @returns Inventory status
   */
  abstract checkInventory(supplierSku: string): Promise<InventoryStatus>;

  /**
   * Create order with supplier
   * @param orderData - Order data
   * @returns Created order
   */
  abstract createOrder(orderData: SupplierOrderData): Promise<SupplierOrder>;

  /**
   * Get order status
   * @param orderId - Supplier's order ID
   * @returns Order status
   */
  abstract getOrderStatus(orderId: string): Promise<OrderStatus>;

  /**
   * Cancel order
   * @param orderId - Supplier's order ID
   */
  abstract cancelOrder(orderId: string): Promise<void>;

  /**
   * Make HTTP request with retry logic
   * @param config - Axios request config
   * @param retries - Number of retries (default: 3)
   * @returns Response data
   */
  protected async makeRequest<T = any>(
    config: AxiosRequestConfig,
    retries: number = 3
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.httpClient.request<T>(config);
        return response.data;
      } catch (error: any) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          Logger.error(
            `[${this.supplierName}Adapter] Client error ${error.response.status}, not retrying`
          );
          throw error;
        }

        // Retry on server errors (5xx) or network errors
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          Logger.warn(
            `[${this.supplierName}Adapter] Request failed, retrying in ${delay}ms (attempt ${attempt}/${retries})`
          );
          await this.sleep(delay);
        }
      }
    }

    Logger.error(
      `[${this.supplierName}Adapter] Request failed after ${retries} attempts`
    );
    throw lastError;
  }

  /**
   * Sleep for specified milliseconds
   * @param ms - Milliseconds to sleep
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate required fields in data
   * @param data - Data object
   * @param requiredFields - List of required field names
   * @throws Error if any required field is missing
   */
  protected validateRequiredFields(
    data: Record<string, any>,
    requiredFields: string[]
  ): void {
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  }
}
