export const authMe = async (req, res) => {
  try {
    const user = req.user; //Lấy từ middleware
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
