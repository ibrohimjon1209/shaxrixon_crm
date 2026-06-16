import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, WarningCircle, Spinner, Package, Bell, Clock, User, Calendar } from '@phosphor-icons/react';
import { useLowStockProducts } from '../hooks/useProducts';
import { useOverdueSales } from '../hooks/useSales';

const Notification = () => {
  const navigate = useNavigate();
  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useLowStockProducts();
  const { data: overdueSalesData, isLoading: overdueLoading } = useOverdueSales();
  const overdueSales = overdueSalesData?.results || [];

  const totalCount = lowStockProducts.length + overdueSales.length;

  useEffect(() => {
    if (!lowStockLoading && !overdueLoading) {
      localStorage.setItem('lastSeenLowStockCount', String(lowStockProducts.length));
      localStorage.setItem('lastSeenOverdueCount', String(overdueSales.length));
    }
  }, [lowStockLoading, overdueLoading, lowStockProducts.length, overdueSales.length]);

  const getDaysOverdue = (dueDateStr) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.floor((today - due) / (1000 * 60 * 60 * 24));
  };

  const isLoading = lowStockLoading || overdueLoading;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
      <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] px-5 md:px-8 pt-10 pb-10 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute top-12 -right-4 w-16 h-16 bg-white/5 rounded-full" />
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Ogohlantirishlar</h1>
            <p className="text-slate-200 text-xs mt-0.5">{totalCount} ta ogohlantirish</p>
          </div>
          <div className="ml-auto w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Bell className="text-white w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 -mt-5 relative z-10 pb-8 max-w-3xl mx-auto space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <Spinner className="w-10 h-10 text-[#6366f1] animate-spin" />
          </div>
        ) : (
          <>
            {/* Overdue sales */}
            {overdueSales.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-50">
                  <div className="w-7 h-7 bg-red-50 rounded-xl flex items-center justify-center">
                    <Clock className="text-red-500 w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Muddati o'tgan qarzlar</h2>
                  <span className="ml-auto text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-xl">
                    {overdueSales.length} ta
                  </span>
                </div>
                {overdueSales.map((sale, index) => {
                  const daysOverdue = getDaysOverdue(sale.debt_due_date);
                  const debtAmount = parseFloat(sale.remaining_amount || sale.total_uzs || 0);
                  return (
                    <div
                      key={sale.id}
                      onClick={() => navigate('/customers', { state: { openCustomerName: sale.customer_name } })}
                      className={`p-4 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors ${index < overdueSales.length - 1 ? 'border-b border-slate-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-sm text-slate-900 truncate">{sale.customer_name}</h3>
                            <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                              {daysOverdue != null && daysOverdue > 0 ? `${daysOverdue} kun` : 'Bugun'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1.5">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-[10px] text-slate-400">
                                Sana: {sale.created_at ? new Date(sale.created_at).toLocaleDateString('uz-UZ') : '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-red-400 shrink-0" />
                              <span className="text-[10px] text-red-500 font-semibold">
                                Muddat: {sale.debt_due_date ? new Date(sale.debt_due_date).toLocaleDateString('uz-UZ') : '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 col-span-2">
                              <WarningCircle className="w-3 h-3 text-orange-400 shrink-0" />
                              <span className="text-[10px] text-slate-500 font-semibold">
                                Qarz: {debtAmount > 0 ? debtAmount.toLocaleString() + ' so\'m' : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Low stock */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-50">
                  <div className="w-7 h-7 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Package className="text-orange-500 w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Kam qolgan mahsulotlar</h2>
                  <span className="ml-auto text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-xl">
                    {lowStockProducts.length} ta
                  </span>
                </div>
                {lowStockProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-4 ${index < lowStockProducts.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{product.name}</h3>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-lg">
                          {product.category_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-xl">
                        {product.quantity} {product.unit}
                      </span>
                      <WarningCircle className="text-orange-400 w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalCount === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="text-emerald-400 w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Hamma narsa joyida!</h3>
                <p className="text-slate-400 text-sm">Hech qanday ogohlantirish yo'q.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notification;
