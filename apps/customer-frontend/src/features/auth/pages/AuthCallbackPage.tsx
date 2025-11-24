// apps/customer-frontend/src/features/auth/pages/AuthCallbackPage.tsx
// ✅ Cải thiện với Error Boundary, UX tốt hơn và xử lý lỗi thân thiện

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { AuthLayout } from '../components/AuthLayout';

type CallbackStatus = 'loading' | 'success' | 'error';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAccessToken, fetchMe } = useAuthStore();
  
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const error = searchParams.get('error');

      if (error) {
        setErrorMessage(error === 'access_denied' 
          ? 'Bạn đã từ chối quyền truy cập.' 
          : 'Đăng nhập thất bại. Vui lòng thử lại.');
        setStatus('error');
        toast.error('Đăng nhập thất bại', { description: error });
        return;
      }

      if (!accessToken) {
        setErrorMessage('Thiếu thông tin xác thực. Vui lòng thử lại.');
        setStatus('error');
        toast.error('Thiếu thông tin xác thực');
        return;
      }

      try {
        setAccessToken(accessToken);
        await fetchMe();
        setStatus('success');
        toast.success('Đăng nhập thành công!');
        
        // Redirect sau 1 giây để user thấy thông báo thành công
        setTimeout(() => {
          navigate('/app', { replace: true });
        }, 1000);
      } catch (err: any) {
        console.error('[AuthCallback] Error:', err);
        
        // Xử lý các trường hợp lỗi cụ thể
        if (err.response?.status === 404) {
          setErrorMessage('Tài khoản chưa được tạo. Vui lòng đăng ký trước.');
          toast.error('Tài khoản chưa được tạo. Vui lòng thử lại.');
        } else if (err.response?.status === 403) {
          setErrorMessage('Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.');
          toast.error('Tài khoản chưa được kích hoạt');
        } else {
          setErrorMessage('Lỗi khi tải thông tin người dùng. Vui lòng thử lại.');
          toast.error('Lỗi khi tải thông tin người dùng');
        }
        
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, setAccessToken, fetchMe, navigate]);

  const handleRetry = () => {
    setStatus('loading');
    setErrorMessage('');
    // Reload page để thử lại
    window.location.reload();
  };

  const handleGoToSignIn = () => {
    navigate('/signin', { replace: true });
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md shadow-xl">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Đang xử lý đăng nhập...
              </h1>
              <p className="text-sm text-gray-600">
                Vui lòng đợi trong giây lát
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 italic">
                  "Kiên nhẫn là chìa khóa của thành công"
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-600" />
              <h1 className="text-2xl font-bold text-green-600">
                Đăng nhập thành công!
              </h1>
              <p className="text-gray-700">
                Đang chuyển hướng...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-600" />
              <h1 className="text-2xl font-bold text-red-600">
                Đăng nhập thất bại
              </h1>
              <p className="text-gray-700">{errorMessage}</p>
              <div className="flex flex-col gap-3 mt-6 w-full">
                <Button onClick={handleRetry} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
                <Button onClick={handleGoToSignIn}>
                  Về trang đăng nhập
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </AuthLayout>
  );
}
