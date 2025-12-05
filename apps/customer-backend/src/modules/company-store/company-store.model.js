// src/modules/company-store/company-store.model.js
// ✅ Company Store Model - Store riêng cho từng tổ chức (SwagUp-style)

import mongoose from "mongoose";

const STORE_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  ARCHIVED: "archived",
};

const STORE_ACCESS = {
  PUBLIC: "public", // Ai cũng vào được (có link)
  PRIVATE: "private", // Chỉ member của org
  PASSWORD: "password", // Cần password
  EMAIL_DOMAIN: "email_domain", // Chỉ email @company.com
};

// Schema cho sản phẩm trong store
const StoreProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  swagPack: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SwagPack",
  },
  // Display info (có thể override)
  displayName: { type: String, trim: true },
  displayDescription: { type: String, trim: true },
  displayImage: { type: String },

  // Pricing
  price: { type: Number, required: true },
  compareAtPrice: { type: Number }, // Giá gốc (để hiện giảm giá)

  // Inventory
  trackInventory: { type: Boolean, default: false },
  inventoryCount: { type: Number, default: 0 },

  // Options
  allowSizeSelection: { type: Boolean, default: false },
  availableSizes: [{ type: String }],

  // Limits
  maxPerOrder: { type: Number, default: 10 },
  maxPerPerson: { type: Number }, // Giới hạn mỗi người mua bao nhiêu

  // Status
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },

  // Stats
  totalOrdered: { type: Number, default: 0 },
});

// Schema cho categories trong store
const StoreCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  icon: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const CompanyStoreSchema = new mongoose.Schema(
  {
    // === ORGANIZATION LINK ===
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      unique: true, // Mỗi org chỉ có 1 store
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // === STORE IDENTITY ===
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: { type: String, trim: true },
    description: { type: String, trim: true },

    // === BRANDING ===
    branding: {
      logoUrl: { type: String },
      faviconUrl: { type: String },
      primaryColor: { type: String, default: "#000000" },
      secondaryColor: { type: String, default: "#ffffff" },
      accentColor: { type: String, default: "#10b981" },
      headerBgColor: { type: String },
      fontFamily: { type: String, default: "Inter" },
      heroImageUrl: { type: String },
      heroTitle: { type: String },
      heroSubtitle: { type: String },
    },

    // === ACCESS CONTROL ===
    access: {
      type: {
        type: String,
        enum: Object.values(STORE_ACCESS),
        default: STORE_ACCESS.PRIVATE,
      },
      password: { type: String }, // Hashed password
      allowedDomains: [{ type: String }], // @company.com
      requireApproval: { type: Boolean, default: false },
    },

    // === PRODUCTS ===
    products: [StoreProductSchema],
    categories: [StoreCategorySchema],

    // === SETTINGS ===
    settings: {
      // Checkout
      allowGuestCheckout: { type: Boolean, default: false },
      requireShippingAddress: { type: Boolean, default: true },
      collectPhone: { type: Boolean, default: true },

      // Budget/Credits
      enableBudget: { type: Boolean, default: false },
      defaultBudget: { type: Number, default: 0 }, // VND per person
      budgetPeriod: {
        type: String,
        enum: ["monthly", "quarterly", "yearly", "one_time"],
      },

      // Approval
      requireApproval: { type: Boolean, default: false },
      approvalThreshold: { type: Number, default: 0 }, // Auto-approve under this amount

      // Notifications
      notifyOnOrder: { type: Boolean, default: true },
      notificationEmails: [{ type: String }],

      // Display
      showPrices: { type: Boolean, default: true },
      showInventory: { type: Boolean, default: false },
      itemsPerPage: { type: Number, default: 12 },
    },

    // === STATUS ===
    status: {
      type: String,
      enum: Object.values(STORE_STATUS),
      default: STORE_STATUS.DRAFT,
    },

    // === CUSTOM DOMAIN ===
    customDomain: { type: String, trim: true },
    sslEnabled: { type: Boolean, default: false },

    // === STATS ===
    stats: {
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalVisitors: { type: Number, default: 0 },
      uniqueCustomers: { type: Number, default: 0 },
    },

    // === SEO ===
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      ogImage: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
CompanyStoreSchema.index({ slug: 1 });
CompanyStoreSchema.index({ organization: 1 });
CompanyStoreSchema.index({ status: 1 });
CompanyStoreSchema.index({ "products.isActive": 1 });

// === VIRTUALS ===
CompanyStoreSchema.virtual("activeProductCount").get(function () {
  return this.products?.filter((p) => p.isActive).length || 0;
});

CompanyStoreSchema.virtual("storeUrl").get(function () {
  if (this.customDomain) {
    return `https://${this.customDomain}`;
  }
  return `https://printz.vn/store/${this.slug}`;
});

// === METHODS ===
CompanyStoreSchema.methods.isAccessible = function (user, password) {
  switch (this.access.type) {
    case STORE_ACCESS.PUBLIC:
      return true;
    case STORE_ACCESS.PRIVATE:
      return user?.organizationId?.toString() === this.organization.toString();
    case STORE_ACCESS.PASSWORD:
      return password === this.access.password;
    case STORE_ACCESS.EMAIL_DOMAIN:
      if (!user?.email) return false;
      const domain = user.email.split("@")[1];
      return this.access.allowedDomains.includes(domain);
    default:
      return false;
  }
};

// === STATICS ===
CompanyStoreSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, status: STORE_STATUS.ACTIVE });
};

export const CompanyStore =
  mongoose.models.CompanyStore ||
  mongoose.model("CompanyStore", CompanyStoreSchema);

export { STORE_STATUS, STORE_ACCESS };
