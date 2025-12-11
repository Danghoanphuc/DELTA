// apps/customer-backend/src/shared/models/thread-template.model.js
// Thread Template Model for Quick Thread Creation

import mongoose from "mongoose";

// Template Categories
export const TEMPLATE_CATEGORY = {
  BUG: "bug",
  FEATURE_REQUEST: "feature-request",
  QUESTION: "question",
  GENERAL: "general",
};

// Context Types
export const CONTEXT_TYPE = {
  ORDER: "ORDER",
  DESIGN: "DESIGN",
  PRODUCT: "PRODUCT",
};

const threadTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: Object.values(TEMPLATE_CATEGORY),
      required: true,
      index: true,
    },

    // Template Content
    titleTemplate: {
      type: String,
      required: true,
      // Example: "Báo lỗi: {{issue_type}}"
    },
    contentTemplate: {
      type: String,
      default: "",
      // Markdown with placeholders
      // Example: "## Mô tả lỗi\n{{description}}\n\n## Ảnh chụp màn hình\n{{screenshots}}"
    },

    // Auto-fill Fields
    defaultTags: [
      {
        type: String,
      },
    ],
    defaultPriority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    // Context Restrictions
    applicableContexts: [
      {
        type: String,
        enum: Object.values(CONTEXT_TYPE),
      },
    ],

    // Quick Actions (for ORDER context)
    quickActions: [
      {
        label: {
          type: String,
          required: true,
        },
        action: {
          type: String,
          required: true,
          // Examples: "cancel_order", "change_address", "report_issue"
        },
        icon: {
          type: String,
          default: "message-circle",
        },
      },
    ],

    // Organization-specific or global
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ===== INDEXES =====
threadTemplateSchema.index({ category: 1, isActive: 1 });
threadTemplateSchema.index({ organizationId: 1, isActive: 1 });
threadTemplateSchema.index({ applicableContexts: 1 });

// ===== INSTANCE METHODS =====

/**
 * Apply template with data
 */
threadTemplateSchema.methods.apply = function (data = {}) {
  let title = this.titleTemplate;
  let content = this.contentTemplate;

  // Replace placeholders
  Object.keys(data).forEach((key) => {
    const placeholder = `{{${key}}}`;
    title = title.replace(new RegExp(placeholder, "g"), data[key] || "");
    content = content.replace(new RegExp(placeholder, "g"), data[key] || "");
  });

  return {
    title,
    content,
    tags: this.defaultTags,
    priority: this.defaultPriority,
    templateId: this._id,
    templateName: this.name,
  };
};

/**
 * Check if template is applicable for context
 */
threadTemplateSchema.methods.isApplicableFor = function (contextType) {
  return (
    this.applicableContexts.length === 0 ||
    this.applicableContexts.includes(contextType)
  );
};

// ===== STATIC METHODS =====

/**
 * Get templates for context
 */
threadTemplateSchema.statics.getForContext = function (
  contextType,
  organizationId = null
) {
  const query = {
    isActive: true,
    $or: [
      { applicableContexts: contextType },
      { applicableContexts: { $size: 0 } }, // Global templates
    ],
  };

  if (organizationId) {
    query.$or = [
      { organizationId: organizationId },
      { organizationId: null }, // Global templates
    ];
  } else {
    query.organizationId = null; // Only global templates
  }

  return this.find(query).sort({ category: 1, name: 1 }).lean();
};

/**
 * Get templates by category
 */
threadTemplateSchema.statics.getByCategory = function (
  category,
  organizationId = null
) {
  const query = {
    category,
    isActive: true,
  };

  if (organizationId) {
    query.$or = [{ organizationId: organizationId }, { organizationId: null }];
  } else {
    query.organizationId = null;
  }

  return this.find(query).sort({ name: 1 }).lean();
};

/**
 * Create default templates
 */
threadTemplateSchema.statics.createDefaults = async function (createdBy) {
  const defaultTemplates = [
    {
      name: "Báo lỗi đơn hàng",
      description: "Template để báo lỗi liên quan đến đơn hàng",
      category: TEMPLATE_CATEGORY.BUG,
      titleTemplate: "Báo lỗi: {{issue_type}}",
      contentTemplate: `## Mô tả lỗi
{{description}}

## Ảnh chụp màn hình
{{screenshots}}

## Thông tin bổ sung
{{additional_info}}`,
      defaultTags: ["bug", "order"],
      defaultPriority: "high",
      applicableContexts: [CONTEXT_TYPE.ORDER],
      quickActions: [
        {
          label: "Báo lỗi sản phẩm",
          action: "report_product_issue",
          icon: "alert-circle",
        },
        {
          label: "Báo lỗi giao hàng",
          action: "report_shipping_issue",
          icon: "truck",
        },
      ],
      createdBy,
      isActive: true,
    },
    {
      name: "Yêu cầu thay đổi đơn hàng",
      description: "Template để yêu cầu thay đổi thông tin đơn hàng",
      category: TEMPLATE_CATEGORY.FEATURE_REQUEST,
      titleTemplate: "Yêu cầu thay đổi: {{change_type}}",
      contentTemplate: `## Thông tin cần thay đổi
{{current_info}}

## Thông tin mới
{{new_info}}

## Lý do thay đổi
{{reason}}`,
      defaultTags: ["change-request", "order"],
      defaultPriority: "normal",
      applicableContexts: [CONTEXT_TYPE.ORDER],
      quickActions: [
        {
          label: "Thay đổi địa chỉ",
          action: "change_address",
          icon: "map-pin",
        },
        {
          label: "Thay đổi số lượng",
          action: "change_quantity",
          icon: "hash",
        },
      ],
      createdBy,
      isActive: true,
    },
    {
      name: "Hỏi đáp chung",
      description: "Template cho câu hỏi chung",
      category: TEMPLATE_CATEGORY.QUESTION,
      titleTemplate: "Câu hỏi: {{topic}}",
      contentTemplate: `## Câu hỏi
{{question}}

## Thông tin liên quan
{{context}}`,
      defaultTags: ["question"],
      defaultPriority: "normal",
      applicableContexts: [], // Applicable to all contexts
      quickActions: [],
      createdBy,
      isActive: true,
    },
    {
      name: "Yêu cầu hủy đơn",
      description: "Template để yêu cầu hủy đơn hàng",
      category: TEMPLATE_CATEGORY.GENERAL,
      titleTemplate: "Yêu cầu hủy đơn hàng",
      contentTemplate: `## Lý do hủy
{{reason}}

## Ghi chú
{{notes}}`,
      defaultTags: ["cancel", "order"],
      defaultPriority: "urgent",
      applicableContexts: [CONTEXT_TYPE.ORDER],
      quickActions: [
        {
          label: "Yêu cầu hủy đơn",
          action: "cancel_order",
          icon: "x-circle",
        },
      ],
      createdBy,
      isActive: true,
    },
  ];

  const created = [];
  for (const template of defaultTemplates) {
    const existing = await this.findOne({
      name: template.name,
      organizationId: null,
    });

    if (!existing) {
      const newTemplate = await this.create(template);
      created.push(newTemplate);
    }
  }

  return created;
};

export const ThreadTemplate = mongoose.model(
  "ThreadTemplate",
  threadTemplateSchema
);
