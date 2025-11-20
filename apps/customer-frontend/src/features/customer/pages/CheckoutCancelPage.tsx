import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutCancelPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">Thanh toán bị hủy</h1>
        <p className="mb-6 text-gray-600">Bạn đã hủy giao dịch thanh toán. Nếu có vấn đề, vui lòng liên hệ hỗ trợ.</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default CheckoutCancelPage;

