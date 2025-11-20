import {
  type Document,
  type FilterQuery,
  type Model,
  Types,
  isValidObjectId,
} from "mongoose";
import {
  NotFoundException,
  ValidationException,
} from "../shared/exceptions.js";
import { type IAdmin } from "../models/admin.model.js";
import { Infraction } from "../models/infraction.model.js";
import { recordAdminAuditLog } from "./admin.audit-log.service.js";
import { sendAssetFlagNotification } from "./email.service.js";

// --- Import shared models ---
// @ts-ignore - JS models without types
import { Product as ProductModelJS } from "../../../customer-backend/src/shared/models/product.model.js";
// @ts-ignore
import { DesignTemplate as DesignTemplateModelJS } from "../../../customer-backend/src/shared/models/design-template.model.js";
// @ts-ignore
import { PrinterProfile as PrinterProfileModelJS } from "../../../customer-backend/src/shared/models/printer-profile.model.js";
// @ts-ignore
import { User as UserModelJS } from "../../../customer-backend/src/shared/models/user.model.js";

type AssetType = "product" | "template";

interface ProductDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  printerProfileId: Types.ObjectId;
  healthStatus: "Active" | "Warning" | "Suspended";
  isPublished: boolean;
  stats?: Record<string, unknown> & {
    lastSuspensionAt?: Date;
  };
  createdAt: Date;
}

interface DesignTemplateDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  printerId: Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
}

interface PrinterProfileDocument extends Document {
  _id: Types.ObjectId;
  businessName?: string;
  contactEmail?: string;
  user?: Types.ObjectId | null;
}

interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  displayName?: string;
}

const ProductModel = ProductModelJS as Model<ProductDocument>;
const DesignTemplateModel =
  DesignTemplateModelJS as unknown as Model<DesignTemplateDocument>;
const PrinterProfileModel =
  PrinterProfileModelJS as Model<PrinterProfileDocument>;
const UserModel = UserModelJS as Model<UserDocument>;

const RECENT_WINDOW_DAYS = 7;
const PENDING_LIMIT = 50;
const INFRACTION_POINTS = 10;

const normalizeAssetType = (type: string | undefined): AssetType => {
  if (type === "product" || type === "template") {
    return type;
  }
  throw new ValidationException("Loại asset không hợp lệ.");
};

const ensureValidObjectId = (id?: string): Types.ObjectId => {
  if (!id || !isValidObjectId(id)) {
    throw new ValidationException("ID không hợp lệ.");
  }
  return new Types.ObjectId(id);
};

const getModelByType = (type: AssetType) =>
  type === "product" ? ProductModel : DesignTemplateModel;

export const getPendingAssets = async (typeInput: string | undefined) => {
  const type = normalizeAssetType(typeInput);
  const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  if (type === "product") {
    const filter: FilterQuery<ProductDocument> = {
      createdAt: { $gte: since },
      healthStatus: { $ne: "Suspended" },
    };
    return ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(PENDING_LIMIT)
      .lean();
  } else {
    const filter: FilterQuery<DesignTemplateDocument> = {
      createdAt: { $gte: since },
      isPublic: true,
    };
    return DesignTemplateModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(PENDING_LIMIT)
      .lean();
  }
};

interface FlagAssetParams {
  id: string;
  type: string;
  reason: string;
  admin: IAdmin;
  context?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

const getPrinterOwnerContact = async (printerProfileId: Types.ObjectId) => {
  const printerProfile = await PrinterProfileModel.findById(
    printerProfileId
  ).lean();

  if (!printerProfile) {
    return { email: null, displayName: null, printerProfileId: null };
  }

  let ownerEmail = printerProfile.contactEmail ?? null;
  let ownerDisplayName = printerProfile.businessName ?? null;

  if ((!ownerEmail || !ownerDisplayName) && printerProfile.user) {
    const user = await UserModel.findById(printerProfile.user).lean();
    ownerEmail = ownerEmail ?? user?.email ?? null;
    ownerDisplayName =
      ownerDisplayName ?? user?.displayName ?? user?.email ?? null;
  }

  return {
    email: ownerEmail,
    displayName: ownerDisplayName,
    printerProfileId: printerProfile._id.toString(),
  };
};

const getTemplateOwnerContact = async (printerUserId: Types.ObjectId) => {
  const user = await UserModel.findById(printerUserId).lean();
  let printerProfileId: string | null = null;

  const printerProfile = await PrinterProfileModel.findOne({
    user: printerUserId,
  })
    .select("_id businessName contactEmail")
    .lean();

  if (printerProfile) {
    printerProfileId = printerProfile._id.toString();
  }

  return {
    email: user?.email ?? printerProfile?.contactEmail ?? null,
    displayName: user?.displayName ?? printerProfile?.businessName ?? null,
    printerProfileId,
  };
};

const createInfractionIfPossible = async (
  printerProfileId: string | null,
  admin: IAdmin,
  reason: string
) => {
  if (!printerProfileId) {
    return;
  }

  await Infraction.create({
    printerProfileId: new Types.ObjectId(printerProfileId),
    adminId: admin._id,
    type: "MANUAL_ADJUSTMENT",
    pointsDeducted: INFRACTION_POINTS,
    notes: `Flag nội dung: ${reason}`,
  });
};

export const flagAsset = async ({
  id,
  type,
  reason,
  admin,
  context,
}: FlagAssetParams) => {
  if (!admin) {
    throw new ValidationException("Thiếu thông tin admin.");
  }

  if (!reason || reason.trim().length < 5) {
    throw new ValidationException("Lý do phải có tối thiểu 5 ký tự.");
  }

  const assetType = normalizeAssetType(type);
  const objectId = ensureValidObjectId(id);

  if (assetType === "product") {
    const product = await ProductModel.findById(objectId);
    if (!product) {
      throw new NotFoundException("Sản phẩm", id);
    }

    product.healthStatus = "Suspended";
    product.isPublished = false;
    product.stats = {
      ...(product.stats ?? {}),
      lastSuspensionAt: new Date(),
    };

    await product.save();

    const ownerInfo = await getPrinterOwnerContact(product.printerProfileId);

    if (ownerInfo.email) {
      await sendAssetFlagNotification(
        ownerInfo.email,
        product.name,
        assetType,
        reason
      );
    }

    await createInfractionIfPossible(ownerInfo.printerProfileId, admin, reason);

    void recordAdminAuditLog({
      action: "ASSET_FLAGGED",
      actor: admin,
      targetType: "Product",
      targetId: product._id.toString(),
      metadata: {
        reason,
        printerProfileId: ownerInfo.printerProfileId,
      },
      ipAddress: context?.ipAddress ?? undefined,
      userAgent: context?.userAgent ?? undefined,
    });

    return product.toObject();
  }

  const template = await DesignTemplateModel.findById(objectId);
  if (!template) {
    throw new NotFoundException("Design Template", id);
  }

  template.isPublic = false;
  template.set("moderationStatus", "Flagged", { strict: false });
  await template.save();

  const ownerInfo = await getTemplateOwnerContact(template.printerId);

  if (ownerInfo.email) {
    await sendAssetFlagNotification(
      ownerInfo.email,
      template.name,
      assetType,
      reason
    );
  }

  await createInfractionIfPossible(ownerInfo.printerProfileId, admin, reason);

  void recordAdminAuditLog({
    action: "ASSET_FLAGGED",
    actor: admin,
    targetType: "DesignTemplate",
    targetId: template._id.toString(),
    metadata: {
      reason,
      printerProfileId: ownerInfo.printerProfileId,
    },
    ipAddress: context?.ipAddress ?? undefined,
    userAgent: context?.userAgent ?? undefined,
  });

  return template.toObject();
};

