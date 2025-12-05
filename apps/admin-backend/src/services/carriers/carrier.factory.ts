// src/services/carriers/carrier.factory.ts
// ✅ Carrier Factory - Factory Pattern + Strategy Pattern

import {
  ICarrierAdapter,
  CarrierInfo,
} from "../../interfaces/carrier.interface";
import { GHNAdapter } from "./ghn.adapter";
import { GHTKAdapter } from "./ghtk.adapter";
import { ViettelPostAdapter } from "./viettel-post.adapter";
import { JTExpressAdapter } from "./jt-express.adapter";
import { NinjaVanAdapter } from "./ninja-van.adapter";

/**
 * CarrierFactory - Factory để tạo carrier adapters
 * Tuân thủ Open/Closed Principle - thêm carrier mới chỉ cần register
 */
export class CarrierFactory {
  private static adapters: Map<string, ICarrierAdapter> = new Map();
  private static initialized = false;

  /**
   * Initialize all carrier adapters
   */
  static initialize(): void {
    if (this.initialized) return;

    // Register all carriers
    this.register(new GHNAdapter());
    this.register(new GHTKAdapter());
    this.register(new ViettelPostAdapter());
    this.register(new JTExpressAdapter());
    this.register(new NinjaVanAdapter());

    this.initialized = true;
  }

  /**
   * Register a new carrier adapter
   * Tuân thủ OCP - extend functionality without modifying existing code
   */
  static register(adapter: ICarrierAdapter): void {
    this.adapters.set(adapter.carrierId, adapter);
  }

  /**
   * Get carrier adapter by ID
   */
  static getAdapter(carrierId: string): ICarrierAdapter | null {
    this.initialize();
    return this.adapters.get(carrierId) || null;
  }

  /**
   * Get all available carriers
   */
  static getCarriers(): CarrierInfo[] {
    this.initialize();
    return Array.from(this.adapters.values()).map((adapter) => ({
      id: adapter.carrierId,
      name: adapter.carrierName,
      available: adapter.isAvailable(),
    }));
  }

  /**
   * Check if carrier exists
   */
  static hasCarrier(carrierId: string): boolean {
    this.initialize();
    return this.adapters.has(carrierId);
  }
}

// Export singleton instance for convenience
export const carrierFactory = CarrierFactory;
