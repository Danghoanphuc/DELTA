// apps/customer-frontend/src/features/delivery-checkin/pages/ShipperLandingPage.tsx
/**
 * Shipper Landing Page
 * Shows login/register options for unauthenticated users
 */

import { Link } from "react-router-dom";
import { Truck, LogIn, UserPlus, MapPin, History, Shield } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function ShipperLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 rounded-xl p-2">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Shipper Portal
              </h1>
              <p className="text-xs text-gray-500">Printz Delivery System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Truck className="w-12 h-12 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Chào mừng đến Shipper Portal
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Hệ thống check-in giao hàng thông minh. Xác nhận giao hàng với ảnh
            và GPS, theo dõi lịch sử giao hàng dễ dàng.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Check-in GPS</h3>
            <p className="text-sm text-gray-600">
              Xác nhận vị trí giao hàng chính xác với GPS và ảnh chứng minh
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <History className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Lịch sử giao hàng
            </h3>
            <p className="text-sm text-gray-600">
              Theo dõi tất cả các đơn hàng đã giao với timeline chi tiết
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Bảo mật cao</h3>
            <p className="text-sm text-gray-600">
              Dữ liệu được mã hóa và bảo vệ an toàn tuyệt đối
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
            Bắt đầu ngay
          </h3>
          <div className="space-y-4">
            <Link to="/signin" className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base">
                <LogIn className="w-5 h-5 mr-2" />
                Đăng nhập
              </Button>
            </Link>
            <Link to="/shipper/register" className="block">
              <Button
                variant="outline"
                className="w-full h-12 text-base border-orange-200 hover:bg-orange-50"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Đăng ký tài khoản Shipper
              </Button>
            </Link>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản? Đăng ký miễn phí để bắt đầu giao hàng
          </p>
        </div>

        {/* Test Account Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
          <h4 className="font-semibold text-blue-900 mb-2">
            🧪 Tài khoản test
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            Sử dụng tài khoản sau để test nhanh:
          </p>
          <div className="bg-white rounded-lg p-3 font-mono text-sm">
            <p>
              <span className="text-gray-500">Email:</span> shipper@printz.vn
            </p>
            <p>
              <span className="text-gray-500">Password:</span> Shipper@123
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2024 Printz. Shipper Portal v1.0
        </div>
      </footer>
    </div>
  );
}

export default ShipperLandingPage;
