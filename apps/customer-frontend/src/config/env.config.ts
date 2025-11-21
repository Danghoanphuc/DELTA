const buildEnvValue = (value?: string, fallback = "") =>
  typeof value === "string" && value.length > 0 ? value : fallback;

export const config = {
  apiBaseUrl: buildEnvValue(import.meta.env.VITE_API_URL, "/api"),
  stripePublicKey: buildEnvValue(import.meta.env.VITE_STRIPE_PUBLIC_KEY),
  vnpayReturnUrl: buildEnvValue(import.meta.env.VITE_VNPAY_RETURN_URL),
  cloudinaryCloudName: buildEnvValue(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME),
  cloudinaryUploadPreset: buildEnvValue(
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  ),
  googleClientId: buildEnvValue(import.meta.env.VITE_GOOGLE_CLIENT_ID),
  facebookAppId: buildEnvValue(import.meta.env.VITE_FACEBOOK_APP_ID),
};

// ⚠️ Một số phần FE vẫn import ENV_CONFIG thay vì config,
// nên export thêm alias để không bị lỗi build TypeScript.
export const ENV_CONFIG = config;
