import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAccessToken, fetchMe } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Đăng nhập thất bại', { description: error });
        navigate('/signin');
        return;
      }

      if (accessToken) {
        setAccessToken(accessToken);
        try {
          await fetchMe();
          toast.success('Đăng nhập thành công!');
          // ✅ SỬA: Redirect ngay vào /app thay vì / (SmartLanding sẽ redirect lại)
          navigate('/app', { replace: true });
        } catch (err: any) {
          // ✅ Xử lý trường hợp user chưa tồn tại (404)
          if (err.response?.status === 404) {
            toast.error('Tài khoản chưa được tạo. Vui lòng thử lại.');
            navigate('/signin');
          } else {
            console.error('[AuthCallback] FetchMe error:', err);
            toast.error('Lỗi khi tải thông tin người dùng');
            navigate('/signin');
          }
        }
      } else {
        toast.error('Thiếu thông tin xác thực');
        navigate('/signin');
      }
    };

    handleCallback();
  }, [searchParams, setAccessToken, fetchMe, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export { AuthCallbackPage };
