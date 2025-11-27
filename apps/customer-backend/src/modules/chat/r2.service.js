import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Logger } from "../../shared/utils/index.js";

class R2Service {
  constructor() {
    // Fail fast nếu thiếu config
    if (!process.env.R2_ACCOUNT_ID) {
        Logger.warn("[R2] Missing R2_ACCOUNT_ID env");
    }

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucketName = process.env.R2_BUCKET_NAME || "printz";
  }

  async getPresignedUploadUrl(fileName, fileType) {
    const uniqueKey = `chat-uploads/${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uniqueKey,
      ContentType: fileType,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn: 900 }); // 15 phút
    return { uploadUrl: url, fileKey: uniqueKey };
  }

  async getPresignedDownloadUrl(fileKey, fileName, mode = 'inline') {
    if (!fileKey) {
      throw new Error("fileKey is required");
    }
    
    // ✅ FIX: fileName có thể undefined, cần fallback
    const finalFileName = fileName || fileKey.split('/').pop() || 'file';
    
    // ✅ FIX: ResponseContentDisposition format: "inline; filename="..." hoặc "attachment; filename="..."
    const disposition = mode === 'attachment' 
      ? `attachment; filename="${encodeURIComponent(finalFileName)}"`
      : `inline; filename="${encodeURIComponent(finalFileName)}"`;
    
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ResponseContentDisposition: disposition,
    });
    
    try {
      const signedUrl = await getSignedUrl(this.client, command, { expiresIn: 3600 }); // 1 giờ
      Logger.info(`[R2] Generated presigned URL for key=${fileKey.substring(0, 50)}..., mode=${mode}`);
      return signedUrl;
    } catch (error) {
      Logger.error(`[R2] Failed to generate presigned URL for key=${fileKey}:`, error.message);
      throw error;
    }
  }

  async uploadFile(buffer, key, contentType) {
    try {
        // ✅ FIX: key có thể là fileName (từ originalname), cần tạo unique key
        const uniqueKey = key.startsWith('chat-uploads/') 
          ? key 
          : `chat-uploads/${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${key}`;
        
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: uniqueKey,
            Body: buffer,
            ContentType: contentType
        });
        await this.client.send(command);
        
        // ✅ Return fileKey để frontend có thể dùng để download
        return uniqueKey;
    } catch (e) {
        Logger.error(`[R2] Upload failed: ${e.message}`);
        throw e;
    }
  }

  // ✅ NEW: Upload với fileKey cụ thể (từ presigned URL) - đảm bảo key khớp
  async uploadFileWithKey(buffer, fileKey, contentType) {
    try {
        if (!fileKey) {
            throw new Error("fileKey is required");
        }
        
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            Body: buffer,
            ContentType: contentType
        });
        await this.client.send(command);
        
        Logger.info(`[R2] Uploaded file with key: ${fileKey}`);
        return fileKey;
    } catch (e) {
        Logger.error(`[R2] Upload with key failed: ${e.message}`);
        throw e;
    }
  }
}

export const r2Service = new R2Service();