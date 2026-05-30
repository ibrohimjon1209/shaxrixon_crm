import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiLoader, FiPackage, FiBell } from 'react-icons/fi';
import { useLowStockProducts } from '../hooks/useProducts';

const Notification = () => {
  const navigate = useNavigate();
  const { data: lowStockProducts = [], isLoading } = useLowStockProducts();

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('lastSeenLowStockCount', String(lowStockProducts.length));
    }
  }, [isLoading, lowStockProducts.length]);

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-20 font-sans">
      {/* Blue gradient header */}
      <div className="bg-gradient-to-br from-[#1447E6] to-[#0F3CC7] px-5 md:px-8 pt-10 pb-10 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute top-12 -right-4 w-16 h-16 bg-white/5 rounded-full" />
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Ogohlantirishlar</h1>
            <p className="text-blue-200 text-xs mt-0.5">{lowStockProducts.length} ta ogohlantirish</p>
          </div>
          <div className="ml-auto w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <FiBell className="text-white w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Content overlapping header */}
      <div className="px-4 md:px-8 -mt-5 relative z-10 pb-8 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FiLoader className="w-10 h-10 text-[#1447E6] animate-spin" />
          </div>
        ) : lowStockProducts.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {lowStockProducts.map((product, index) => (
              <div
                key={product.id}
                className={`flex items-center justify-between p-4 ${index < lowStockProducts.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 shrink-0">
                    <FiPackage className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-lg">
                        {product.category_name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-xl">
                    {product.quantity} {product.unit}
                  </span>
                  <FiAlertCircle className="text-orange-400 w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="text-emerald-400 w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Hamma narsa joyida!</h3>
            <p className="text-gray-400 text-sm">Omboringizda kam qolgan mahsulotlar yo'q.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
