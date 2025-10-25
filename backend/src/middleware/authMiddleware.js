import jwt from "jsonwebtoken";
// LỖI #1: Phải import với đuôi .js
import { User } from "../models/User.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // Lấy Token từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // LỖI #2: Phải là 'res.status', không phải 'status'
      return res.status(401).json({ message: "Không tìm thấy access Token" });
    }

    // LỖI #3: Logic bất đồng bộ đã được sửa
    // Chúng ta phải xử lý logic bên trong callback của jwt.verify
    // vì nó là một hàm bất đồng bộ (hoặc dùng jwt.verify phiên bản sync)
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          console.error(err);
          // LỖI #2: Phải là 'res.status'
          return res
            .status(403)
            .json({ message: "Access Token hết hạn hoặc không hợp lệ" });
        }

        // --- Logic chỉ được tiếp tục SAU KHI verify thành công ---
        try {
          // 'decodedUser' đã tồn tại ở đây
          // LỖI #5: Sửa lại cú pháp select (bỏ khoảng trắng thừa)
          const user = await User.findById(decodedUser.userId).select(
            "-hashedPassword"
          );

          if (!user) {
            // LỖI #2: Phải là 'res.status'
            return res
              .status(404)
              .json({ message: "Người dùng không tồn tại" });
          }

          // Trả user về trong req
          req.user = user;

          // Cho phép yêu cầu đi tiếp
          next();
        } catch (findUserError) {
          // Xử lý lỗi nếu việc tìm user thất bại
          console.error("Lỗi khi tìm user trong authMiddleware", findUserError);
          return res.status(500).json({ message: "Lỗi hệ thống khi tìm user" });
        }
      }
    );
    // KHÔNG viết code tiếp ở đây, vì code đã chạy trong callback ở trên
  } catch (error) {
    console.error("Lỗi xác minh JWT trong authMiddleware", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
