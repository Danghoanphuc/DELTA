// apps/admin-backend/src/infrastructure/storage/r2.service.js
// Cloudflare R2 service for document uploads

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Logger } from "../../shared/utils/index.js";

class R2Service {
  constructor() {
    if (!process.env.R2_ACCOUNT_ID) {
      Logger.warn("[R2] Missing R2_ACCOUNT_ID env");
    }

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
    this.bucketName = process.env.R2_BUCKET_NAME || "printz";
  }

  /**
   * Get presigned URL for uploading file to R2
   * @param {string} fileKey - Unique file key
   * @param {string} fileType - MIME type
   * @returns {Promise<Object>} Upload URL and file key
   */
  async getPresignedUploadUrl(fileKey, fileType) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(this.client, command, {
        expiresIn: 900, // 15 minutes
      });

      Logger.info(`[R2] Generated upload URL for: ${fileKey}`);

      return { uploadUrl, fileKey };
    } catch (error) {
      Logger.error(`[R2] Failed to generate upload URL:`, error);
      throw error;
    }
  }

  /**
   * Get presigned URL for downloading file from R2
   * @param {string} fileKey - File key in R2
   * @param {string} fileName - Display filename
   * @param {string} mode - 'inline' or 'attachment'
   * @returns {Promise<string>} Download URL
   */
  async getPresignedDownloadUrl(fileKey, fileName, mode = "inline") {
    try {
      const disposition =
        mode === "attachment"
          ? `attachment; filename="${encodeURIComponent(fileName)}"`
          : `inline; filename="${encodeURIComponent(fileName)}"`;

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ResponseContentDisposition: disposition,
      });

      const downloadUrl = await getSignedUrl(this.client, command, {
        expiresIn: 3600, // 1 hour
      });

      Logger.info(`[R2] Generated download URL for: ${fileKey}`);

      return downloadUrl;
    } catch (error) {
      Logger.error(`[R2] Failed to generate download URL:`, error);
      throw error;
    }
  }

  /**
   * Upload file buffer directly to R2
   * @param {Buffer} buffer - File buffer
   * @param {string} fileKey - Unique file key
   * @param {string} contentType - MIME type
   * @returns {Promise<string>} File key
   */
  async uploadFile(buffer, fileKey, contentType) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
      });

      await this.client.send(command);

      Logger.success(`[R2] Uploaded file: ${fileKey}`);

      return fileKey;
    } catch (error) {
      Logger.error(`[R2] Upload failed:`, error);
      throw error;
    }
  }

  /**
   * Delete file from R2
   * @param {string} fileKey - File key to delete
   * @returns {Promise<void>}
   */
  async deleteFile(fileKey) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.client.send(command);

      Logger.success(`[R2] Deleted file: ${fileKey}`);
    } catch (error) {
      Logger.error(`[R2] Delete failed:`, error);
      throw error;
    }
  }
}

export const r2Service = new R2Service();
