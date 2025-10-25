// backend/src/types/express/index.d.ts

// Import kiểu IUser bạn vừa định nghĩa ở Bước 1
import { IUser } from "../user";

// Mở rộng namespace Express toàn cục
declare global {
  namespace Express {
    // Định nghĩa lại interface Request để thêm thuộc tính 'user'
    export interface Request {
      user?: IUser; // 'user' là optional (?) và có kiểu IUser
    }
  }
}

// Dòng này cần thiết để biến file thành một module
export {};
