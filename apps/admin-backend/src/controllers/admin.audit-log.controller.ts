import { type Request, type Response, type NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listAdminAuditLogs } from "../services/admin.audit-log.service.js";

export const getAuditLogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      actions,
      actorId,
      role,
      targetType,
      targetId,
      limit = "50",
      offset = "0",
    } = req.query;

    const actionList =
      typeof actions === "string"
        ? actions.split(",").map((item) => item.trim())
        : Array.isArray(actions)
          ? actions
          : undefined;

    const logs = await listAdminAuditLogs({
      actions: actionList as any,
      actorId: actorId as string | undefined,
      role: role as any,
      targetType: targetType as string | undefined,
      targetId: targetId as string | undefined,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.status(200).json({
      success: true,
      data: logs,
    });
  }
);

