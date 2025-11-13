// apps/admin-backend/src/@types/express/index.d.ts
import { IAdmin } from "../../models/admin.model.js";

// Định nghĩa một namespace toàn cục cho Express
declare global {
  namespace Express {
    // Mở rộng (merge) interface Request
    export interface Request {
      // Thêm thuộc tính 'user' vào Request
      user?: IAdmin;
    }
  }
}
