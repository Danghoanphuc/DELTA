// frontend/src/pages/SmartLanding.tsx
// Component này tự động điều hướng based on authentication status

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import LandingPage from "./LandingPage";

/**
 * SmartLanding Component
 *
 * Tự động điều hướng dựa trên trạng thái đăng nhập:
 * - Chưa đăng nhập: Hiển thị Landing Page
 * - Đã đăng nhập: Redirect về app chính
 *
 * Cách sử dụng:
 * ```tsx
 * <Route path="/" element={<SmartLanding />} />
 * ```
 */
export function SmartLanding() {
  const { user, loading } = useAuthStore();

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If logged in, redirect to main app
  if (user) {
    // ✅ Organization user -> redirect to organization dashboard
    if (user.organizationProfileId) {
      return <Navigate to="/organization/dashboard" replace />;
    }

    // Default: redirect to chat app
    return <Navigate to="/app" replace />;
  }

  // Not logged in: show landing page
  return <LandingPage />;
}

export default SmartLanding;

// ========== ALTERNATIVE: With Query Params ==========
/**
 * Nếu bạn muốn cho phép force show landing page ngay cả khi đã login,
 * sử dụng query param: /?force=landing
 */
export function SmartLandingWithForce() {
  const { user, loading } = useAuthStore();
  const searchParams = new URLSearchParams(window.location.search);
  const forceLanding = searchParams.get("force") === "landing";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Force show landing page
  if (forceLanding) {
    return <LandingPage />;
  }

  // Redirect if logged in
  if (user) {
    // ✅ Organization user -> redirect to organization dashboard
    if (user.organizationProfileId) {
      return <Navigate to="/organization/dashboard" replace />;
    }
    return <Navigate to="/app" replace />;
  }

  return <LandingPage />;
}

// ========== USAGE EXAMPLES ==========
/*

EXAMPLE 1: Basic Smart Routing
--------------------------------
// In your router:
import SmartLanding from '@/pages/SmartLanding';

<Route path="/" element={<SmartLanding />} />
<Route path="/app" element={<ChatAppPage />} />


EXAMPLE 2: With Force Landing
------------------------------
// In your router:
import { SmartLandingWithForce } from '@/pages/SmartLanding';

<Route path="/" element={<SmartLandingWithForce />} />

// User can access landing even when logged in:
// https://printz.vn/?force=landing


EXAMPLE 3: Custom Redirect Logic
---------------------------------
export function CustomSmartLanding() {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      // Custom logic here
      const lastVisitedPage = localStorage.getItem('lastVisitedPage');
      
      if (lastVisitedPage && lastVisitedPage !== '/') {
        setRedirect(lastVisitedPage);
      } else if (user.role === 'printer') {
        setRedirect('/printer/dashboard');
      } else {
        setRedirect('/app');
      }
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  return <LandingPage />;
}

*/
