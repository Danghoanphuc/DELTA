export const config = {
  apiBaseUrl: "/api",
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || "",
  vnpayReturnUrl: import.meta.env.VITE_VNPAY_RETURN_URL || "",
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "",
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID || "",
};
