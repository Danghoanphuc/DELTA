// apps/customer-backend/src/modules/chat/r2.service.js
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Logger } from "../../shared/utils/index.js";

class R2Service {
  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId) {
      Logger.warn("Missing R2_ACCOUNT_ID");
    }

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.R2_BUCKET_NAME || "printz";
  }

  /**
   * Tạo URL upload tạm thời (Client đẩy file thẳng lên R2)
   * @param {string} fileName - Tên file gốc
   * @param {string} fileType - Mime type (vd: application/pdf)
   */
  async getPresignedUploadUrl(fileName, fileType) {
    try {
      // Tạo unique key: design-files/{timestamp}-{random}-{filename}
      const uniqueKey = `design-files/${Date.now()}-${Math.random().toString(36).substring(7)}-${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueKey,
        ContentType: fileType,
      });

      // URL sống trong 15 phút (900s)
      const url = await getSignedUrl(this.client, command, { expiresIn: 900 });
      
      return {
        uploadUrl: url, // URL để Frontend PUT file lên
        fileKey: uniqueKey, // Key để lưu vào DB
        publicUrl: `${process.env.ADMIN_APP_URL || ''}/api/chat/r2/proxy/${uniqueKey}` // URL danh nghĩa (nếu cần)
      };
    } catch (error) {
      Logger.error(`[R2] Get Upload URL Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tạo URL download/preview tạm thời (Bảo mật file)
   * @param {string} fileKey - Key của file trên R2
   * @param {string} originalName - Tên file gốc
   * @param {string} mode - 'inline' (hiển thị) hoặc 'attachment' (tải xuống), mặc định 'inline'
   */
  async getPresignedDownloadUrl(fileKey, originalName, mode = 'inline') {
    try {
      const disposition = mode === 'attachment' 
        ? `attachment; filename="${encodeURIComponent(originalName)}"`
        : `inline; filename="${encodeURIComponent(originalName)}"`;

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ResponseContentDisposition: disposition,
      });

      // URL download sống trong 1 giờ (3600s)
      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      Logger.error(`[R2] Get Download URL Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload file lên R2 từ backend (Proxy để tránh CORS)
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileKey - Key của file trên R2
   * @param {string} contentType - Mime type
   */
  async uploadFile(fileBuffer, fileKey, contentType) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.client.send(command);
      Logger.info(`[R2] Upload successful: ${fileKey}`);
      return true;
    } catch (error) {
      Logger.error(`[R2] Upload Error: ${error.message}`);
      throw error;
    }
  }
}

export const r2Service = new R2Service();