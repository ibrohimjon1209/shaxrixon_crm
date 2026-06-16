import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendUp, CurrencyDollar, ShoppingCart, CreditCard,
  Package, ChartBar, Spinner, Users, WarningCircle, Truck
} from '@phosphor-icons/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardStats, useProfitReport, useWarehouseReport } from '../hooks/useReports';
import { useDebtors } from '../hooks/useCustomers';
import { useProducts, useLowStockProducts } from '../hooks/useProducts';

const fmt = (num) => parseFloat(num || 0).toLocaleString('uz-UZ');

const periodMap = {
  'Bugun':  'today',
  '7 kun':  '7kun',
  '30 kun': 'oylik',
  'Yil':    'yillik',
};

const StatCard = ({ icon: Icon, bg, color, title, value, sub, loading, valueUSD }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
    <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
    {loading ? (
      <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
    ) : (
      <>
        <p className={`text-base font-black ${color} leading-tight`}>{value}</p>
        {valueUSD !== undefined && valueUSD !== null && (
          <p className="text-sm font-bold text-slate-500">${fmt(valueUSD)}</p>
        )}
      </>
    )}
    {sub && <p className="text-[9px] text-slate-400 font-medium mt-0.5">{sub}</p>}
  </div>
);

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab,   setActiveTab]   = useState('dashboard');
  const [dashPeriod,  setDashPeriod]  = useState('7 kun');

  const today         = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [profitFrom, setProfitFrom] = useState(thirtyDaysAgo);
  const [profitTo,   setProfitTo]   = useState(today);

  // ── Dedicated report endpoints ─────────────────────────────
  const { data: dashStats, isLoading: dashLoading, isError: dashError } =
    useDashboardStats(periodMap[dashPeriod]);


  const { data: profitData, isLoading: profitLoading } =
    useProfitReport(profitFrom, profitTo);


  const { data: warehouseData, isLoading: warehouseLoading, isError: warehouseError } =
    useWarehouseReport();

  const { data: debtorsRaw = [] }  = useDebtors();
  const { data: allProductsData, isLoading: productsLoading } = useProducts({ limit: 1000 });
  const { data: lowStockProducts = [] } = useLowStockProducts();

  const debtors    = Array.isArray(debtorsRaw) ? debtorsRaw : (debtorsRaw?.results || []);
  const allProducts = allProductsData?.results || [];

  const wh = warehouseError ? null : warehouseData;
  const totalProducts = wh?.total_products ?? (allProductsData?.count || allProducts.length);
  const totalQty      = wh?.total_quantity  ?? allProducts.reduce((s, p) => s + parseFloat(p.quantity || 0), 0);
  const totalValUZS   = parseFloat(wh?.total_value_uzs ?? wh?.total_value ?? 0);
  const totalValUSD   = parseFloat(wh?.total_value_usd ?? 0);
  const lowStockList  = wh?.low_stock?.length ? wh.low_stock : lowStockProducts;
  const warehouseSpinning = warehouseLoading && productsLoading;

  // Dashboard stats — new field names
  const revUZS    = parseFloat(dashStats?.revenue_uzs ?? 0);
  const revUSD    = parseFloat(dashStats?.revenue_usd ?? 0);
  const profUZS   = parseFloat(dashStats?.profit_uzs ?? dashStats?.gross_profit_uzs ?? 0);
  const profUSD   = parseFloat(dashStats?.profit_usd ?? dashStats?.gross_profit_usd ?? 0);
  const costUZS   = parseFloat(dashStats?.cost_uzs ?? dashStats?.sale_cost_uzs ?? 0);
  const costUSD   = parseFloat(dashStats?.cost_usd ?? dashStats?.sale_cost_usd ?? 0);
  const purchaseUZS = parseFloat(dashStats?.purchase_total_uzs ?? dashStats?.purchase_total ?? 0);
  const purchaseUSD = parseFloat(dashStats?.purchase_total_usd ?? 0);
  const debtUZS   = parseFloat(dashStats?.debt_uzs    ?? 0);
  const debtUSD   = parseFloat(dashStats?.debt_usd    ?? 0);
  const salesCount = dashStats?.sales_count ?? 0;
  const purchasesCount = dashStats?.purchases_count ?? 0;
  const chartData  = (dashStats?.daily_sales || []).map(d => ({
    name: d.date,
    'so\'m': parseFloat(d.amount_uzs || 0),
    '$':    parseFloat(d.amount_usd  || 0),
  }));

  const tabs = [
    { id: 'dashboard', label: 'Umumiy'  },
    { id: 'profit',    label: 'Foyda'   },
    { id: 'warehouse', label: 'Ombor'   },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 md:pb-8">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] px-5 md:px-8 pt-10 pb-10 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute top-12 -right-4 w-16 h-16 bg-white/5 rounded-full" />
        <h1 className="text-white text-2xl font-bold relative z-10">Hisobotlar</h1>
        <p className="text-slate-200 text-sm mt-0.5 relative z-10">Do'konginiz faoliyati tahlili</p>
      </div>

      <div className="px-4 md:px-8 -mt-5 relative z-10 max-w-6xl mx-auto">

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1 mb-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === t.id ? 'bg-[#6366f1] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ DASHBOARD TAB ══════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 pb-4">

            {/* Period filter */}
            <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1">
              {Object.keys(periodMap).map(p => (
                <button
                  key={p}
                  onClick={() => setDashPeriod(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    dashPeriod === p ? 'bg-[#6366f1] text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={CurrencyDollar} bg="bg-emerald-50" color="text-emerald-600"
                title="Tushum ($)"
                value={`$${fmt(revUSD)}`}
                sub={`${fmt(revUZS)} so'm`}
                loading={dashLoading}
              />
              <StatCard
                icon={TrendUp} bg="bg-teal-50" color="text-teal-600"
                title="Sof Foyda"
                value={`$${fmt(profUSD)}`}
                sub={`${fmt(profUZS)} so'm`}
                loading={dashLoading}
              />
              <StatCard
                icon={CreditCard} bg="bg-amber-50" color="text-amber-600"
                title="Xarajat"
                value={`$${fmt(costUSD)}`}
                sub={`${fmt(costUZS)} so'm`}
                loading={dashLoading}
              />
              <StatCard
                icon={Truck} bg="bg-indigo-50" color="text-indigo-600"
                title="Xarid jami"
                value={`$${fmt(purchaseUSD)}`}
                sub={`${fmt(purchaseUZS)} so'm | ${purchasesCount} ta`}
                loading={dashLoading}
              />
              <StatCard
                icon={ShoppingCart} bg="bg-purple-50" color="text-purple-600"
                title="Sotuvlar"
                value={salesCount}
                sub="ta sotuv"
                loading={dashLoading}
              />
              <StatCard
                icon={CreditCard} bg="bg-red-50" color="text-red-500"
                title="Qarz"
                value={`$${fmt(debtUSD)}`}
                sub={`${fmt(debtUZS)} so'm | ${debtors.length} ta`}
                loading={dashLoading}
              />
            </div>

            {/* Daily sales chart */}
            {!dashLoading && chartData.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Kunlik sotuv grafigi</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="so'm" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="$" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Revenue vs Profit bar */}
            {!dashLoading && (revUZS > 0 || profUZS > 0) && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Tushum, xarajat va foyda</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Tushum ($)',      val: revUSD,  color: 'bg-emerald-500', text: 'text-emerald-600', max: revUSD  },
                    { label: 'Tushum (so\'m)', val: revUZS,  color: 'bg-[#6366f1]',   text: 'text-[#6366f1]',   max: revUZS  },
                    { label: 'Xarajat (so\'m)', val: costUZS, color: 'bg-amber-500',   text: 'text-amber-600',   max: revUZS  },
                    { label: 'Xarid (so\'m)',   val: purchaseUZS, color: 'bg-indigo-500', text: 'text-indigo-600', max: Math.max(revUZS, purchaseUZS) },
                    { label: 'Foyda (so\'m)',   val: profUZS, color: 'bg-teal-500',    text: 'text-teal-600',    max: revUZS  },
                  ].map((row, i) => {
                    const pct = Math.min(100, row.val > 0 && row.max > 0 ? (row.val / row.max) * 100 : 0);
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-slate-600">{row.label}</span>
                          <span className={`text-xs font-black ${row.text}`}>
                            {i === 1 ? `$${fmt(row.val)}` : `${fmt(row.val)} so'm`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className={`${row.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top products from dashboard */}
            {dashStats?.top_products?.length > 0 && (
              <div 
                onClick={() => navigate('/warehouse')}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:border-[#6366f1]/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#6366f1]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Top Mahsulotlar</h3>
                </div>
                <div className="space-y-2.5">
                  {dashStats.top_products.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.quantity} dona</p>
                      </div>
                      <p className={`text-xs font-black shrink-0 ${p.currency === 'usd' ? 'text-emerald-600' : 'text-[#6366f1]'}`}>
                        {p.currency === 'usd' ? `$${fmt(p.revenue)}` : `${fmt(p.revenue)} so'm`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top customers from dashboard */}
            {dashStats?.top_customers?.length > 0 && (
              <div 
                onClick={() => navigate('/customers')}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:border-purple-600/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Top Mijozlar</h3>
                </div>
                <div className="space-y-2.5">
                  {dashStats.top_customers.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center font-bold text-purple-400 text-xs shrink-0">
                        {c.name?.charAt(0) || 'M'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.orders} ta buyurtma</p>
                      </div>
                      <div className="text-right shrink-0">
                        {parseFloat(c.spent_usd || 0) > 0 && <p className="text-xs font-black text-emerald-600">${fmt(c.spent_usd)}</p>}
                        {parseFloat(c.spent_uzs || 0) > 0 && <p className="text-xs font-black text-[#6366f1]">{fmt(c.spent_uzs)} so'm</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debtors list */}
            {debtors.length > 0 && (
              <div 
                onClick={() => navigate('/customers', { state: { filter: 'Qarzdorlar' } })}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:border-red-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                    <Users className="w-4 h-4 text-red-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Qarzdorlar</h3>
                  <span className="ml-auto text-xs font-bold text-red-400">{debtors.length} ta</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {debtors.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center font-bold text-red-400 text-xs shrink-0">
                          {c.name?.charAt(0) || 'M'}
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{c.name}</p>
                      </div>
                      <div className="text-right">
                        {parseFloat(c.debt_usd || 0) > 0 && <span className="text-xs font-black text-red-500 block">${fmt(c.debt_usd)}</span>}
                        {parseFloat(c.debt_uzs || 0) > 0 && <span className="text-xs font-black text-red-500 block">{fmt(c.debt_uzs)} so'm</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PROFIT TAB ════════════════════════════════════════ */}
        {activeTab === 'profit' && (
          <div className="space-y-4 pb-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Sana oralig'i</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dan</label>
                  <input type="date" value={profitFrom} onChange={e => setProfitFrom(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gacha</label>
                  <input type="date" value={profitTo} onChange={e => setProfitTo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]" />
                </div>
              </div>
            </div>

            {profitLoading ? (
              <div className="flex justify-center py-14">
                <Spinner className="w-10 h-10 text-[#6366f1] animate-spin" />
              </div>
            ) : profitData ? (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Tushum',         uzs: profitData.revenue_uzs      ?? 0, usd: profitData.revenue_usd                                      ?? 0, bg: 'bg-slate-50',    color: 'text-[#6366f1]'   },
                    { label: 'Sotuv xarajati', uzs: profitData.sale_cost_uzs    ?? 0, usd: profitData.cost_usd ?? profitData.sale_cost_usd              ?? 0, bg: 'bg-orange-50',  color: 'text-orange-600'  },
                    { label: 'Yalpi foyda',    uzs: profitData.gross_profit_uzs ?? 0, usd: profitData.gross_profit_usd ?? profitData.profit_usd         ?? 0, bg: 'bg-teal-50',    color: 'text-teal-600'    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                      <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${item.color}`}>{item.label}</p>
                      {parseFloat(item.usd) !== 0 && (
                        <p className={`text-base font-black leading-tight ${parseFloat(item.usd) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          ${fmt(item.usd)}
                        </p>
                      )}
                      <p className={`text-sm font-bold ${item.color}`}>{fmt(item.uzs)} so'm</p>
                    </div>
                  ))}
                </div>

                {/* Monthly breakdown */}
                {profitData.monthly?.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Oylik tahlil</h3>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {profitData.monthly.map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                          <span className="text-xs font-semibold text-slate-500">{row.month || row.date || row.period}</span>
                          <div className="text-right space-y-0.5">
                            {parseFloat(row.revenue_usd || 0) !== 0 && <p className="text-xs font-bold text-emerald-600">${fmt(row.revenue_usd)}</p>}
                            {parseFloat(row.revenue_uzs || 0) !== 0 && <p className="text-xs font-bold text-[#6366f1]">{fmt(row.revenue_uzs)} so'm</p>}
                            <p className="text-[10px] text-slate-400 font-semibold">{row.count} ta sotuv</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-14 bg-white rounded-2xl border border-slate-100 text-slate-400">
                <ChartBar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Ma'lumot topilmadi</p>
              </div>
            )}
          </div>
        )}

        {/* ══ WAREHOUSE TAB ═════════════════════════════════════ */}
        {activeTab === 'warehouse' && (
          <div className="space-y-4 pb-4">
            {warehouseSpinning ? (
              <div className="flex justify-center py-14">
                <Spinner className="w-10 h-10 text-[#6366f1] animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <StatCard icon={Package} bg="bg-slate-50"   color="text-[#6366f1]"  title="Jami Mahsulotlar" value={totalProducts}         sub="tur"  />
                  <StatCard icon={Package} bg="bg-purple-50" color="text-purple-600" title="Jami Miqdor"      value={fmt(totalQty)}         sub="dona" />
                  <StatCard icon={Package} bg="bg-orange-50" color="text-orange-600" title="Ombor Qiymati"    value={`${fmt(totalValUZS)} so'm`} valueUSD={totalValUSD} sub="" />
                </div>

                {lowStockList.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                        <WarningCircle className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Kam Qolgan Mahsulotlar</h3>
                      <span className="ml-auto text-xs font-bold text-red-400">{lowStockList.length} ta</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {lowStockList.map((p, i) => (
                        <div key={i} className="flex items-center justify-between bg-red-50/50 border border-red-100 rounded-xl px-3 py-2.5">
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                            {p.category_name && <p className="text-[10px] text-slate-400">{p.category_name}</p>}
                          </div>
                          <span className="text-xs font-bold text-red-500 bg-white px-2.5 py-1 rounded-xl border border-red-100">
                            {p.quantity} {p.unit || 'dona'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {allProducts.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Barcha Mahsulotlar</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider rounded-l-xl">Nomi</th>
                            <th className="text-center py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Miqdor</th>
                            <th className="text-right py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tan narx</th>
                            <th className="text-right py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider rounded-r-xl">Sotuv narx</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {allProducts.map((p, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{p.name}</td>
                              <td className="py-2.5 px-3 text-center text-slate-600">{p.quantity} {p.unit}</td>
                              <td className="py-2.5 px-3 text-right text-slate-500">
                                {parseFloat(p.cost_price_usd || 0) > 0 ? `${fmt(p.cost_price_usd)} $` : `${fmt(p.cost_price_uzs ?? p.cost_price)} so'm`}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-[#6366f1]">
                                {parseFloat(p.sale_price_usd || 0) > 0 ? `${fmt(p.sale_price_usd)} $` : `${fmt(p.sale_price_uzs ?? p.sale_price)} so'm`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
