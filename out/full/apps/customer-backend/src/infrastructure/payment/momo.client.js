// apps/customer-backend/src/infrastructure/payment/momo.client.js
import crypto from "crypto";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../config/env.config.js";
import { Logger } from "../../shared/utils/logger.util.js";

export class MomoService {
  constructor() {
    this.partnerCode = (config.momo.partnerCode || "").trim();
    this.accessKey = (config.momo.accessKey || "").trim();
    this.secretKey = (config.momo.secretKey || "").trim();
    this.endpoint =
      config.momo.endpoint || "https://test-payment.momo.vn/v2/gateway/api/create";
    this.returnUrl = config.momo.returnUrl;
    this.ipnUrl = config.momo.ipnUrl;

    if (!this.partnerCode || !this.accessKey || !this.secretKey) {
      Logger.warn(
        "[MomoService] Thiếu cấu hình MOMO (PARTNER/ACCESS/SECRET). Kiểm tra .env!"
      );
    }
  }

  /**
   * Tạo URL thanh toán MoMo (Capture Wallet)
   * @param {string} masterOrderId
   * @param {number} amountVnd
   * @param {string} ipAddr
   * @param {string} orderInfo
   * @returns {Promise<string>}
   */
  async createPaymentUrl(masterOrderId, amountVnd, ipAddr, orderInfo) {
    if (!masterOrderId) throw new Error("masterOrderId is required");
    if (!amountVnd || amountVnd <= 0) throw new Error("amount must be > 0");
    if (!this.returnUrl) throw new Error("MOMO_RETURN_URL is not configured");
    if (!this.partnerCode || !this.accessKey || !this.secretKey) {
      throw new Error("MOMO credentials are not configured");
    }

    const orderId = String(masterOrderId);
    const requestId = uuidv4();
    const amount = String(Math.round(Number(amountVnd))); // VND, không nhân 100
    const requestType = "captureWallet";
    const extraData = ""; // optional base64 string

    // Raw signature theo tài liệu MoMo (v2)
    const rawSignature =
      `accessKey=${this.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${encodeURIComponent(this.ipnUrl || "")}` +
      `&orderId=${orderId}` +
      `&orderInfo=${encodeURIComponent(orderInfo)}` +
      `&partnerCode=${this.properPartnerCode()}` +
      `&redirectUrl=${encodeURIComponent(this.returnUrl)}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");

    const body = {
      partnerCode: this.properPartnerCode(),
      partnerName: "MoMoPay",
      storeId: this.properPartnerCode(),
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: this.returnUrl,
      ipnUrl: this.ipnUrl,
      lang: "vi",
      requestType,
      extraData,
      signature,
    };

    Logger.debug("[MomoService] Request body:", JSON.stringify(body));

    const res = await axios.post(this.endpoint, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 20000,
    });

    const data = res.data || {};
    Logger.debug("[MomoService] Create response:", JSON.stringify(data));

    if (String(data.resultCode) !== "0" || !data.payUrl) {
      throw new Error(
        `MoMo create payment failed: code=${data.resultCode} msg=${data.message || ""}`
      );
    }

    return data.payUrl;
  }

  /**
   * Xác thực chữ ký IPN/Return từ MoMo (HMACSHA256)
   * @param {any} payload - req.body từ MoMo
   */
  verifySignature(payload) {
    try {
      const {
        amount = "",
        orderId = "",
        requestId = "",
        orderInfo = "",
        orderType = "",
        transId = "",
        message = "",
        localMessage = "",
        responseTime = "",
        errorCode = "",
        payType = "",
        extraData = "",
        signature = "",
        partnerCode,
      } = payload || {};

      const accessKey = this.accessKey;
      const raw =
        `accessKey=${accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData || ""}` +
        `&message=${message || ""}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo || ""}` +
        `&orderType=${orderType || ""}` +
        `&partnerCode=${partnerCode || this.properPartnerCode()}` +
        `&payType=${payType || ""}` +
        `&requestId=${requestId}` +
        `&responseTime=${responseTime || ""}` +
        `&transId=${transId}` +
        `&resultCode=${errorCode ?? payload.resultCode ?? ""}`;

      const sign = crypto
        .createHmac("sha256", this.secretKey)
        .update(raw)
        .digest("hex");

      const recv = String(signature || "").toLowerCase();
      const calc = String(sign).toLowerCase();
      Logger.debug(`[MomoService] verify recv=${recv} calc=${calc}`);
      return recv === calc;
    } catch (e) {
      Logger.error("[MomoService] verifySignature error:", e);
      return false;
    }
  }

  properPartnerCode() {
    return this.partnerCode;
  }
}

