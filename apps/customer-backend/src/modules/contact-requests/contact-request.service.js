// apps/customer-backend/src/modules/contact-requests/contact-request.service.js
import { ContactRequestRepository } from "./contact-request.repository.js";
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { sendContactRequestNotification } from "../../infrastructure/email/index.js";
import axios from "axios";
import { config } from "../../config/env.config.js";

export class ContactRequestService {
  constructor() {
    this.repository = new ContactRequestRepository();
  }

  /**
   * Get location from IP using multiple sources
   * @private
   */
  async getLocationFromIP(ip, cloudflareData = {}) {
    // Priority 1: Use Cloudflare data if available (most accurate)
    if (cloudflareData.cfCountry && cloudflareData.cfCity) {
      Logger.success(`[ContactRequestSvc] Using Cloudflare location data`);
      return {
        ip,
        latitude: cloudflareData.cfLatitude
          ? parseFloat(cloudflareData.cfLatitude)
          : null,
        longitude: cloudflareData.cfLongitude
          ? parseFloat(cloudflareData.cfLongitude)
          : null,
        city: cloudflareData.cfCity,
        country: cloudflareData.cfCountry,
        region: cloudflareData.cfRegion,
        timezone: cloudflareData.cfTimezone,
        address: `${cloudflareData.cfCity}, ${cloudflareData.cfRegion || ""}, ${
          cloudflareData.cfCountry
        }`.replace(", ,", ","),
        source: "cloudflare",
      };
    }

    // Priority 2: Use ipapi.co (free, good accuracy)
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
        timeout: 3000,
      });

      if (response.data && response.data.city) {
        Logger.success(`[ContactRequestSvc] Got location from ipapi.co`);
        return {
          ip,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          city: response.data.city,
          country: response.data.country_name,
          region: response.data.region,
          address: `${response.data.city}, ${response.data.region}, ${response.data.country_name}`,
          source: "ipapi",
        };
      }
    } catch (error) {
      Logger.warn(`[ContactRequestSvc] ipapi.co failed:`, error.message);
    }

    // Priority 3: Use ip-api.com (backup, also free)
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 3000,
      });

      if (response.data && response.data.status === "success") {
        Logger.success(`[ContactRequestSvc] Got location from ip-api.com`);
        return {
          ip,
          latitude: response.data.lat,
          longitude: response.data.lon,
          city: response.data.city,
          country: response.data.country,
          region: response.data.regionName,
          address: `${response.data.city}, ${response.data.regionName}, ${response.data.country}`,
          source: "ip-api",
        };
      }
    } catch (error) {
      Logger.warn(`[ContactRequestSvc] ip-api.com failed:`, error.message);
    }

    Logger.warn(
      `[ContactRequestSvc] All IP geolocation services failed for ${ip}`
    );
    return null;
  }

  /**
   * Reverse geocode coordinates using Goong.io
   * @private
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await axios.get(`https://rsapi.goong.io/Geocode`, {
        params: {
          latlng: `${latitude},${longitude}`,
          api_key: config.apiKeys.goong,
        },
        timeout: 3000,
      });

      if (response.data?.results?.[0]) {
        const result = response.data.results[0];
        const addressComponents = result.address_components || [];

        return {
          address: result.formatted_address,
          city: addressComponents.find((c) =>
            c.types.includes("administrative_area_level_1")
          )?.long_name,
          district: addressComponents.find((c) =>
            c.types.includes("administrative_area_level_2")
          )?.long_name,
          ward: addressComponents.find((c) =>
            c.types.includes("administrative_area_level_3")
          )?.long_name,
        };
      }
    } catch (error) {
      Logger.warn(
        `[ContactRequestSvc] Failed to reverse geocode:`,
        error.message
      );
    }
    return null;
  }

  /**
   * Create contact request
   */
  async createContactRequest(data, metadata = {}) {
    Logger.debug(
      `[ContactRequestSvc] Creating contact request from ${data.phone}`
    );

    // Validation
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationException("Vui lòng nhập họ tên");
    }

    if (!data.phone || data.phone.trim().length === 0) {
      throw new ValidationException("Vui lòng nhập số điện thoại");
    }

    if (!data.message || data.message.trim().length === 0) {
      throw new ValidationException("Vui lòng nhập nội dung cần hỗ trợ");
    }

    // Get location data with multiple fallbacks
    let locationData = null;

    // Try to get location from coordinates first (from browser geolocation)
    if (metadata.latitude && metadata.longitude) {
      const geocodeResult = await this.reverseGeocode(
        metadata.latitude,
        metadata.longitude
      );
      if (geocodeResult) {
        locationData = {
          latitude: metadata.latitude,
          longitude: metadata.longitude,
          ...geocodeResult,
          source: "browser-gps",
        };
      }
    }

    // Fallback to IP-based location with Cloudflare data
    if (!locationData && metadata.ip) {
      const cloudflareData = {
        cfCountry: metadata.cfCountry,
        cfCity: metadata.cfCity,
        cfRegion: metadata.cfRegion,
        cfTimezone: metadata.cfTimezone,
        cfLatitude: metadata.cfLatitude,
        cfLongitude: metadata.cfLongitude,
      };
      locationData = await this.getLocationFromIP(metadata.ip, cloudflareData);
    }

    // Final fallback for localhost/development
    if (
      !locationData &&
      (metadata.ip === "127.0.0.1" ||
        metadata.ip === "::1" ||
        metadata.ip?.includes("localhost"))
    ) {
      Logger.warn(
        `[ContactRequestSvc] Localhost detected - using mock location data`
      );
      locationData = {
        ip: metadata.ip,
        city: "Development",
        country: "Local",
        address: "Localhost (Development Environment)",
        source: "localhost-mock",
      };
    }

    // Create request
    const request = await this.repository.create({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      message: data.message.trim(),
      location: locationData,
      userAgent: metadata.userAgent,
      referrer: metadata.referrer,
      source: metadata.source || "contact_form",
    });

    Logger.success(
      `[ContactRequestSvc] Created contact request: ${request._id}`
    );

    // Send notification email (non-blocking)
    this.sendNotificationEmail(request).catch((error) => {
      Logger.error(
        `[ContactRequestSvc] Failed to send notification email:`,
        error
      );
    });

    return request;
  }

  /**
   * Send notification email to admin
   * @private
   */
  async sendNotificationEmail(request) {
    try {
      await sendContactRequestNotification({
        name: request.name,
        phone: request.phone,
        email: request.email,
        message: request.message,
        location: request.location,
        createdAt: request.createdAt,
      });
      Logger.success(
        `[ContactRequestSvc] Sent notification email for request ${request._id}`
      );
    } catch (error) {
      Logger.error(
        `[ContactRequestSvc] Failed to send notification email:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get contact requests (admin only)
   */
  async getContactRequests(filter = {}, options = {}) {
    return await this.repository.find(filter, options);
  }

  /**
   * Get contact request by ID (admin only)
   */
  async getContactRequest(id) {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundException("Contact Request", id);
    }
    return request;
  }

  /**
   * Update contact request status (admin only)
   */
  async updateStatus(id, status, notes) {
    const request = await this.getContactRequest(id);

    const updateData = { notes };

    // Set timestamp based on status
    if (status === "contacted") {
      updateData.contactedAt = new Date();
    } else if (status === "quoted") {
      updateData.quotedAt = new Date();
    } else if (status === "converted") {
      updateData.convertedAt = new Date();
    } else if (status === "closed") {
      updateData.closedAt = new Date();
    }

    return await this.repository.updateStatus(id, status, updateData);
  }
}
