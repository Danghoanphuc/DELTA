// apps/customer-backend/src/modules/contact-requests/contact-request.controller.js
import { ContactRequestService } from "./contact-request.service.js";
import { ApiResponse } from "../../shared/utils/api-response.util.js";
import { API_CODES } from "../../shared/constants/index.js";

export class ContactRequestController {
  constructor() {
    this.service = new ContactRequestService();
  }

  /**
   * Create contact request (public)
   * @route POST /api/contact-requests
   */
  createContactRequest = async (req, res, next) => {
    try {
      console.log("[ContactRequestController] Received request:", req.body);
      const { name, phone, email, message, latitude, longitude } = req.body;

      // Extract metadata with multiple location sources
      const metadata = {
        ip:
          req.ip ||
          req.headers["x-forwarded-for"] ||
          req.headers["x-real-ip"] ||
          req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        referrer: req.headers.referer || req.headers.referrer,
        latitude,
        longitude,
        // Cloudflare headers (if using Cloudflare)
        cfCountry: req.headers["cf-ipcountry"],
        cfCity: req.headers["cf-ipcity"],
        cfRegion: req.headers["cf-region"],
        cfTimezone: req.headers["cf-timezone"],
        cfLatitude: req.headers["cf-iplatitude"],
        cfLongitude: req.headers["cf-iplongitude"],
      };

      const request = await this.service.createContactRequest(
        { name, phone, email, message },
        metadata
      );

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success(
            { request },
            "Đã gửi yêu cầu thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất."
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get contact requests (admin only)
   * @route GET /api/contact-requests
   */
  getContactRequests = async (req, res, next) => {
    try {
      const { status, page, limit } = req.query;

      const filter = {};
      if (status && status !== "all") {
        filter.status = status;
      }

      const result = await this.service.getContactRequests(filter, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get contact request detail (admin only)
   * @route GET /api/contact-requests/:id
   */
  getContactRequest = async (req, res, next) => {
    try {
      const request = await this.service.getContactRequest(req.params.id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ request }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update contact request status (admin only)
   * @route PUT /api/contact-requests/:id/status
   */
  updateStatus = async (req, res, next) => {
    try {
      const { status, notes } = req.body;
      const request = await this.service.updateStatus(
        req.params.id,
        status,
        notes
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ request }, "Đã cập nhật trạng thái"));
    } catch (error) {
      next(error);
    }
  };
}
