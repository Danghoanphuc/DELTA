// src/modules/printers/printer.routes.js
import { Router } from "express";
import printerProfileRoutes from "./printer.profile.routes.js";
// Import controller hoặc service nếu bạn có các route public (ví dụ: lấy danh sách nhà in)
// import { PrinterController } from "./printer.controller.js";

const router = Router();
// const printerController = new PrinterController();

// === CÁC ROUTE CÔNG KHAI (PUBLIC) ===
// Ví dụ: Lấy danh sách nhà in (nếu bạn có logic này)
// router.get("/", printerController.getAllPrinters);

// === CÁC ROUTE CỦA NHÀ IN (PRINTER) ===
// Sử dụng các route con cho việc quản lý profile
// Mọi route trong này sẽ có tiền tố /api/printers
// Ví dụ: /api/printers/my-profile
router.use("/", printerProfileRoutes);

export default router;
