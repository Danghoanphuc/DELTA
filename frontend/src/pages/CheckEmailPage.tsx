// frontend/src/pages/CheckEmailPage.tsx (NÂNG CẤP)

import { useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react"; // 👈 Thêm useState, useEffect

const CHECK_EMAIL_STORAGE_KEY = "emailVerifiedStatus"; // Key cho localStorage

const CheckEmailPage = () => {
  const { state } = useLocation();
  const email = state?.email;

  // 👇 STATE MỚI ĐỂ THEO DÕI TRẠNG THÁI XÁC THỰC 👇
  const [isVerified, setIsVerified] = useState(
    localStorage.getItem(CHECK_EMAIL_STORAGE_KEY) === "true" // Đọc trạng thái ban đầu
  );

  // 👇 LẮNG NGHE SỰ KIỆN STORAGE 👇
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHECK_EMAIL_STORAGE_KEY && event.newValue === "true") {
        setIsVerified(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup: Gỡ bỏ listener khi component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // Chỉ chạy 1 lần khi mount

  // 👇 XÓA DẤU HIỆU KHI RỜI KHỎI TRANG (Tùy chọn) 👇
  // Để lần sau vào lại trang này, nó hiển thị đúng "Kiểm tra..."
  useEffect(() => {
    return () => {
      localStorage.removeItem(CHECK_EMAIL_STORAGE_KEY);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {/* 👇 HIỂN THỊ THÔNG BÁO DỰA TRÊN isVerified 👇 */}
        {isVerified ? (
          <>
            {/* Trạng thái ĐÃ XÁC THỰC */}
            <h1 className="text-2xl font-bold mb-4 text-green-600">
              Email của bạn đã được xác nhận!
            </h1>
            <p className="text-gray-700 mb-6">
              Tuyệt vời! Giờ bạn có thể đăng nhập vào tài khoản của mình.
            </p>
            <Link
              to="/signin"
              className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Đăng nhập ngay
            </Link>
          </>
        ) : (
          <>
            {/* Trạng thái CHƯA XÁC THỰC */}
            <h1 className="text-2xl font-bold mb-4">
              Kiểm tra Hộp thư của bạn!
            </h1>
            <p className="text-gray-700 mb-6">
              <br />
              Chúng tôi đã gửi một liên kết kích hoạt tài khoản đến
              {email ? (
                <strong className="text-indigo-600 block my-2">{email}</strong>
              ) : (
                " email của bạn."
              )}
              Hãy nhấp vào liên kết đó để hoàn tất đăng ký.
            </p>
            <p className="text-sm text-gray-500">
              (Không thấy? Vui lòng kiểm tra thư mục Spam/Rác.)
            </p>
            <Link
              to="/signin"
              className="mt-6 inline-block text-indigo-600 hover:underline"
            >
              Quay lại trang Đăng nhập
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckEmailPage;
