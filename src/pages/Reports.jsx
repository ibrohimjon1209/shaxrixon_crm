import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp, FiDollarSign, FiShoppingCart, FiCreditCard,
  FiDownload, FiCalendar, FiPackage, FiUser, FiArrowUpRight,
  FiArrowDownRight, FiPieChart, FiBarChart2
} from 'react-icons/fi';

const Reports = () => {
  const [dateFilter, setDateFilter] = useState('7 kun');
  const [reportData, setReportData] = useState({
    revenue: 0,
    profit: 0,
    salesCount: 0,
    debt: 0,
    dailySales: [],
    topProducts: [],
    topCustomers: []
  });

  // Mock data generation based on filter
  useEffect(() => {
    const generateData = () => {
      if (dateFilter === 'Bugun') {
        return {
          revenue: 150000,
          revenueTrend: 5.2,
          profit: 45000,
          profitTrend: 3.1,
          salesCount: 12,
          salesTrend: 15.4,
          debt: 20000,
          debtTrend: -2.1,
          dailySales: [
            { date: '08:00', amount: 15000 },
            { date: '10:00', amount: 25000 },
            { date: '12:00', amount: 45000 },
            { date: '14:00', amount: 30000 },
            { date: '16:00', amount: 20000 },
            { date: '18:00', amount: 15000 },
          ],
          topProducts: [
            { name: 'Folga balon', quantity: 5, revenue: 75000, trend: 'up' },
            { name: 'Geliy xizmat', quantity: 3, revenue: 60000, trend: 'up' },
          ],
          topCustomers: [
            { name: 'Azizov Olim', spent: 45000, orders: 1 },
          ]
        };
      }

      if (dateFilter === '7 kun') {
        return {
          revenue: 1250000,
          revenueTrend: 12.5,
          profit: 450000,
          profitTrend: 8.2,
          salesCount: 85,
          salesTrend: -2.4,
          debt: 120000,
          debtTrend: 5.1,
          dailySales: [
            { date: '18.05', amount: 160000 },
            { date: '19.05', amount: 120000 },
            { date: '20.05', amount: 190000 },
            { date: '21.05', amount: 280000 },
            { date: '22.05', amount: 150000 },
            { date: '23.05', amount: 220000 },
            { date: '24.05', amount: 180000 },
          ],
          topProducts: [
            { name: 'Folga balon', quantity: 25, revenue: 375000, trend: 'up' },
            { name: 'Katta figurniy balon', quantity: 18, revenue: 450000, trend: 'up' },
            { name: 'Geliy xizmat', quantity: 12, revenue: 240000, trend: 'down' },
            { name: 'Bezak to\'plami', quantity: 15, revenue: 120000, trend: 'up' },
          ],
          topCustomers: [
            { name: 'Ali Valiyev', spent: 320000, orders: 12 },
            { name: 'Bekzod Karimov', spent: 280000, orders: 8 },
            { name: 'Dilnoza Azizova', spent: 195000, orders: 5 },
          ]
        };
      }

      if (dateFilter === '30 kun') {
        return {
          revenue: 5400000,
          revenueTrend: 18.2,
          profit: 1850000,
          profitTrend: 14.5,
          salesCount: 340,
          salesTrend: 9.8,
          debt: 450000,
          debtTrend: 12.3,
          dailySales: Array.from({ length: 15 }, (_, i) => ({
            date: `${i + 10}.05`,
            amount: Math.floor(Math.random() * 200000) + 100000
          })),
          topProducts: [
            { name: 'Katta figurniy balon', quantity: 95, revenue: 2375000, trend: 'up' },
            { name: 'Folga balon', quantity: 82, revenue: 1230000, trend: 'up' },
            { name: 'Geliy xizmat', quantity: 45, revenue: 900000, trend: 'up' },
            { name: 'Mini figuralar', quantity: 120, revenue: 600000, trend: 'down' },
          ],
          topCustomers: [
            { name: 'Jamshid Tolipov', spent: 850000, orders: 24 },
            { name: 'Sardor Rahimov', spent: 620000, orders: 15 },
            { name: 'Guli Karimova', spent: 480000, orders: 11 },
          ]
        };
      }

      // Default for 'Yil' or others
      return {
        revenue: 48500000,
        revenueTrend: 24.8,
        profit: 15200000,
        profitTrend: 21.2,
        salesCount: 2450,
        salesTrend: 18.5,
        debt: 2100000,
        debtTrend: 8.4,
        dailySales: [
          { date: 'Yan', amount: 3200000 },
          { date: 'Feb', amount: 2800000 },
          { date: 'Mar', amount: 4500000 },
          { date: 'Apr', amount: 5200000 },
          { date: 'May', amount: 3800000 },
          { date: 'Iyun', amount: 4100000 },
        ],
        topProducts: [
          { name: 'Katta figurniy balon', quantity: 850, revenue: 21250000, trend: 'up' },
          { name: 'Folga balon', quantity: 720, revenue: 10800000, trend: 'up' },
          { name: 'Geliy xizmat', quantity: 410, revenue: 8200000, trend: 'up' },
        ],
        topCustomers: [
          { name: 'Event Agency LLC', spent: 8500000, orders: 145 },
          { name: 'Happy Kids Center', spent: 4200000, orders: 62 },
        ]
      };
    };

    setReportData(generateData());
  }, [dateFilter]);

  const summaryCards = [
    {
      title: 'Umumiy Tushum',
      value: reportData.revenue,
      trend: reportData.revenueTrend,
      icon: FiDollarSign,
      color: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-200'
    },
    {
      title: 'Sof Foyda',
      value: reportData.profit,
      trend: reportData.profitTrend,
      icon: FiTrendingUp,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-200'
    },
    {
      title: 'Sotuvlar Soni',
      value: reportData.salesCount,
      trend: reportData.salesTrend,
      icon: FiShoppingCart,
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-purple-200',
      isCurrency: false
    },
    {
      title: 'Qarzdorlik',
      value: reportData.debt,
      trend: reportData.debtTrend,
      icon: FiCreditCard,
      color: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-200'
    }
  ];

  const formatNumber = (num) => {
    return num.toLocaleString('uz-UZ');
  };

  const handleExport = (type) => {
    console.log(`Exporting as ${type}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hisobotlar Markazi</h1>
            <p className="text-sm text-gray-500">Do'koningiz faoliyati haqida tahlillar</p>
          </div>
          <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
            <FiDownload className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Filter Section */}
        <div className="px-4 mt-6 mb-8">
          <div className="bg-white rounded-3xl p-2 shadow-xl shadow-gray-200/50 flex gap-1">
            {['Bugun', '7 kun', '30 kun', 'Yil'].map((period) => (
              <button
                key={period}
                onClick={() => setDateFilter(period)}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${dateFilter === period
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            const colors = [
              { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
              { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
              { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
              { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
            ];
            const theme = colors[index % colors.length];

            return (
              <div
                key={index}
                className={`bg-white rounded-3xl p-6 shadow-sm border ${theme.border} relative overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-1`}
              >
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`w-14 h-14 shrink-0 ${theme.bg} ${theme.text} rounded-2xl flex items-center justify-center shadow-sm`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 truncate">{card.title}</p>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1 truncate">
                      {formatNumber(card.value)}
                    </h2>
                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${card.trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                      {card.trend >= 0 ? <FiArrowUpRight className="mr-0.5" /> : <FiArrowDownRight className="mr-0.5" />}
                      {Math.abs(card.trend)}%
                    </div>
                  </div>
                </div>

                {/* Subtle Background Accent */}
                <div className={`absolute -right-2 -bottom-2 w-16 h-16 ${theme.bg} rounded-full opacity-30 group-hover:scale-150 transition-transform duration-700`} />
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="px-6 mb-10">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Sotuvlar Dinamikasi</h3>
                <p className="text-sm text-gray-400 mt-1">Kunlik o'sish ko'rsatkichi</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <span className="text-xs font-semibold text-blue-700">Tushum</span>
                </div>
              </div>
            </div>

            <div className="relative h-64 w-full">
              {reportData.dailySales.length > 0 ? (
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((tick) => (
                    <line
                      key={tick}
                      x1="0" y1={tick} x2="100" y2={tick}
                      stroke="#f1f5f9" strokeWidth="0.5"
                    />
                  ))}

                  {/* Area Path */}
                  <path
                    d={`
                      M 0 100
                      ${reportData.dailySales.map((sale, i) => {
                      const x = (i / (reportData.dailySales.length - 1)) * 100;
                      const maxAmount = Math.max(...reportData.dailySales.map(s => s.amount)) || 1;
                      const y = 100 - (sale.amount / maxAmount) * 80;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                      L 100 100
                      Z
                    `}
                    fill="url(#chartGradient)"
                    className="transition-all duration-1000 ease-in-out"
                  />

                  {/* Line Path */}
                  <path
                    d={`
                      M ${(0 / (reportData.dailySales.length - 1)) * 100} ${100 - (reportData.dailySales[0].amount / (Math.max(...reportData.dailySales.map(s => s.amount)) || 1)) * 80}
                      ${reportData.dailySales.map((sale, i) => {
                      const x = (i / (reportData.dailySales.length - 1)) * 100;
                      const maxAmount = Math.max(...reportData.dailySales.map(s => s.amount)) || 1;
                      const y = 100 - (sale.amount / maxAmount) * 80;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    `}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-1000 ease-in-out"
                  />

                  {/* Points and Tooltips */}
                  {reportData.dailySales.map((sale, i) => {
                    const x = (i / (reportData.dailySales.length - 1)) * 100;
                    const maxAmount = Math.max(...reportData.dailySales.map(s => s.amount)) || 1;
                    const y = 100 - (sale.amount / maxAmount) * 80;
                    return (
                      <g key={i} className="group/point">
                        <circle
                          cx={x}
                          cy={y}
                          r="1.5"
                          fill="white"
                          stroke="#2563eb"
                          strokeWidth="1"
                          className="hover:r-2 transition-all duration-300 cursor-pointer"
                        />
                        {/* Invisible hover area */}
                        <rect
                          x={x - 5} y="0" width="10" height="100"
                          fill="transparent"
                          className="cursor-pointer"
                        />
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <FiBarChart2 className="w-12 h-12 mb-2 opacity-20" />
                  <span className="text-sm font-medium">Ma'lumotlar yuklanmoqda...</span>
                </div>
              )}
            </div>

            {/* X-Axis Labels */}
            <div className="relative mt-6 h-6 w-full">
              {reportData.dailySales.map((sale, i) => {
                // Only show every Nth label to avoid overlapping
                // Aim for ~6 labels max
                const totalPoints = reportData.dailySales.length;
                const interval = Math.ceil(totalPoints / 6);
                const shouldShow = i % interval === 0 || i === totalPoints - 1;

                if (!shouldShow) return null;

                const leftPosition = (i / (totalPoints - 1)) * 100;

                return (
                  <span
                    key={i}
                    className="absolute text-[10px] font-semibold text-gray-400 uppercase tracking-tighter whitespace-nowrap transition-all duration-300"
                    style={{
                      left: `${leftPosition}%`,
                      transform: i === 0 ? 'none' : i === totalPoints - 1 ? 'translateX(-100%)' : 'translateX(-50%)'
                    }}
                  >
                    {sale.date}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Two Column Section */}
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Top Products */}
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <FiPackage className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Top Mahsulotlar</h3>
            </div>

            <div className="space-y-4">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-bold text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-400">{product.quantity} dona sotilgan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">{formatNumber(product.revenue)}</p>
                    <p className={`text-[10px] font-semibold ${product.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {product.trend === 'up' ? '+' : '-'}12%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/40 border border-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <FiUser className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Top Mijozlar</h3>
            </div>

            <div className="space-y-4">
              {reportData.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    <img src={`https://ui-avatars.com/api/?name=${customer.name}&background=random&color=fff`} alt={customer.name} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{customer.name}</h4>
                    <p className="text-xs text-gray-400">{customer.orders} ta buyurtma</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">{formatNumber(customer.spent)}</p>
                    <p className="text-[10px] font-semibold text-emerald-500">+18.2%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="px-4 grid grid-cols-2 gap-4 mb-12">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-3xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-95"
          >
            <FiDownload className="w-5 h-5" />
            Excel Export
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-rose-600 text-white rounded-3xl font-bold hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-95"
          >
            <FiPieChart className="w-5 h-5" />
            PDF Report
          </button>
        </div>
      </div>

      {/* Empty State Logic Check */}
      {reportData.revenue === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-32 h-32 bg-gray-100 rounded-[3rem] flex items-center justify-center mb-6 animate-pulse">
            <FiCalendar className="w-16 h-16 text-gray-300" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hozircha ma'lumot yo'q</h3>
            <p className="text-gray-500 max-w-[200px] mx-auto text-sm">
              Tanlangan muddat uchun sotuv ma'lumotlari topilmadi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
