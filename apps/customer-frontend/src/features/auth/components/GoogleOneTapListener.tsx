// apps/customer-frontend/src/features/auth/components/GoogleOneTapListener.tsx
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from '@/shared/lib/axios';
import { toast } from '@/shared/utils/toast';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export const GoogleOneTapListener = () => {
  const { user, setAccessToken, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const isAuthenticated = !!user;
  const errorShownRef = useRef(false);

  // Suppress Google SDK errors trong console (chúng sẽ được handle bởi onError)
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Intercept Google SDK errors để không spam console
    const errorHandler = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Bỏ qua các lỗi từ Google SDK khi chưa config đúng
      if (
        message.includes('GSI_LOGGER') ||
        message.includes('The given origin is not allowed') ||
        message.includes('FedCM') ||
        message.includes('credential_button_library')
      ) {
        // Chỉ log một lần để developer biết
        if (!errorShownRef.current) {
          const currentOrigin = window.location.origin;
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'NOT_SET';
          
          console.warn(
            '\n' +
            '╔═══════════════════════════════════════════════════════════════╗\n' +
            '║  ⚠️  GOOGLE OAUTH CONFIGURATION ERROR                        ║\n' +
            '╠═══════════════════════════════════════════════════════════════╣\n' +
            '║  Origin hiện tại chưa được phép trong Google Console        ║\n' +
            '║                                                               ║\n' +
            '║  🔧 CÁCH SỬA (Nếu đã thêm origin nhưng vẫn lỗi):            ║\n' +
            '║  1. ✅ Kiểm tra Client ID có đúng không:                     ║\n' +
            `║     ${clientId.substring(0, 60).padEnd(60)}║\n` +
            '║                                                               ║\n' +
            '║  2. 🧹 CLEAR CACHE & COOKIES:                                ║\n' +
            '║     - Mở DevTools (F12)                                      ║\n' +
            '║     - Right-click vào nút Reload                              ║\n' +
            '║     - Chọn "Empty Cache and Hard Reload"                      ║\n' +
            '║     - Hoặc: Settings > Privacy > Clear browsing data        ║\n' +
            '║                                                               ║\n' +
            '║  3. 🔄 Kiểm tra lại Google Console:                           ║\n' +
            '║     - Vào: https://console.cloud.google.com/apis/credentials ║\n' +
            '║     - Đảm bảo origin này có trong danh sách:                 ║\n' +
            `║       ${currentOrigin.padEnd(60)}║\n` +
            '║     - KHÔNG có dấu "/" ở cuối (ví dụ: http://localhost:5173) ║\n' +
            '║                                                               ║\n' +
            '║  4. ⏱️  Đợi thêm 5-10 phút (Google có thể propagate chậm)   ║\n' +
            '║                                                               ║\n' +
            `║  📋 Client ID: ${clientId.substring(0, 50).padEnd(50)}║\n` +
            `║  🌐 Origin: ${currentOrigin.padEnd(55)}║\n` +
            '╚═══════════════════════════════════════════════════════════════╝\n'
          );
          errorShownRef.current = true;
        }
        return; // Suppress error
      }
      originalError.apply(console, args);
    };

    const warnHandler = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Bỏ qua warnings từ Google SDK
      if (message.includes('GSI_LOGGER') || message.includes('FedCM')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = errorHandler;
    console.warn = warnHandler;

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Debug log
  useEffect(() => {
    if (!isAuthenticated && import.meta.env.DEV) {
      console.log('🔵 [GoogleOneTap] Component mounted, user not authenticated - One Tap should appear');
    }
  }, [isAuthenticated]);

  // Chỉ hiển thị One Tap khi user chưa đăng nhập
  if (isAuthenticated) {
    return null;
  }

  // Component này sử dụng GoogleLogin với useOneTap để hiển thị One Tap
  // Ẩn button nhưng vẫn cho phép One Tap popup hiển thị
  return (
    <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
      <GoogleLogin
        onSuccess={async (credentialResponse: CredentialResponse) => {
          console.log("👆 [GoogleOneTap] Success callback triggered:", credentialResponse);
          const { credential } = credentialResponse;
          
          if (!credential) {
            console.warn('⚠️ [GoogleOneTap] No credential in response');
            return;
          }

          try {
            console.log("📤 [GoogleOneTap] Sending credential to backend...");
            
            // Gọi API xác thực của Printz
            const res = await axios.post('/auth/google-verify', { 
              credential, 
              role: 'customer' 
            });

            const { accessToken, user: userData } = res.data.data;

            console.log("✅ [GoogleOneTap] Backend verified, setting auth state...");

            // Lưu thông tin đăng nhập
            setAccessToken(accessToken);
            await fetchMe();
            
            toast.success(`Chào mừng trở lại, ${userData?.displayName || 'bạn'}!`);
            
            // Điều hướng vào App nếu đang ở trang Landing
            if (window.location.pathname === '/' || window.location.pathname === '/signin') {
              navigate('/app'); 
            }

          } catch (err: any) {
            console.error("❌ [GoogleOneTap] Login Error:", err);
            const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại';
            // Chỉ hiển thị lỗi nếu không phải do user đóng popup
            if (err.response?.status !== 401) {
              toast.error(errorMsg);
            }
          }
        }}
        onError={() => {
          // Chỉ log ở dev mode và không spam
          if (import.meta.env.DEV && !errorShownRef.current) {
            console.debug('⚠️ [GoogleOneTap] Error or closed');
          }
        }}
        useOneTap={true}
        auto_select={false}
        // Thêm các props cần thiết để tránh undefined
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
};