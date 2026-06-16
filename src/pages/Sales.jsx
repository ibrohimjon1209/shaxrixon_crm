import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import {
  MagnifyingGlass, Plus, Minus, X, Check, PaperPlaneRight, ShareNetwork,
  ArrowLeft, Package, Spinner, ShoppingCart, User,
  CaretLeft, CaretRight, PencilSimple, Trash
} from '@phosphor-icons/react';
import { useProductsForSale } from '../hooks/useProducts';
import { useCustomers, useCreateCustomer } from '../hooks/useCustomers';
import { useCreateSale, useSales, useSale, useUpdateSale, useDeleteSale } from '../hooks/useSales';
import { toast } from 'react-toastify';
import { AddEditCustomerModal } from './Customers';
import { motion, AnimatePresence } from 'framer-motion';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 15, transition: { duration: 0.15, ease: 'easeIn' } }
};
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

const SearchableCustomerSelect = ({ customers, selectedCustomer, onSelect }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return customers;
    const q = query.toLowerCase().trim();
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.full_name || '').toLowerCase().includes(q) ||
      (c.phone || '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    );
  }, [customers, query]);

  const handleSelect = (customer) => {
    onSelect(customer);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Selected badge or Search input */}
      {selectedCustomer && !isOpen ? (
        <div
          onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="w-full pl-9 pr-9 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-medium text-sm cursor-pointer hover:border-[#6366f1]/40 transition-colors overflow-hidden"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="text-[#6366f1] w-4 h-4" />
          </div>
          <span className="block truncate">{selectedCustomer.name} <span className="text-xs text-slate-400">({selectedCustomer.phone})</span></span>
          <button
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <MagnifyingGlass className="text-slate-400 w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ism yoki telefon raqam..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] text-slate-900 font-medium text-sm appearance-none outline-none"
          />
        </>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl z-50 overflow-hidden"
          >
            <div className="max-h-[220px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-5 text-center text-sm text-slate-400">
                  <MagnifyingGlass className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                  Mijoz topilmadi
                </div>
              ) : (
                filtered.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                      selectedCustomer?.id === c.id
                        ? 'bg-[#6366f1]/5'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      selectedCustomer?.id === c.id
                        ? 'bg-[#6366f1] text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {(c.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 truncate">{c.phone}</p>
                    </div>
                    {selectedCustomer?.id === c.id && (
                      <Check className="w-4 h-4 text-[#6366f1] shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const ITEM_H = 52;
const UZ_MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

const WheelCol = ({ items, value, onChange }) => {
  const ref = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const timerRef = useRef(null);
  const initIdx = items.findIndex(i => i.value === value);
  const [activeIdx, setActiveIdx] = useState(initIdx >= 0 ? initIdx : 0);

  useLayoutEffect(() => {
    const idx = items.findIndex(i => i.value === value);
    if (ref.current) ref.current.scrollTop = (idx >= 0 ? idx : 0) * ITEM_H;
  }, []);

  useEffect(() => {
    const idx = items.findIndex(i => i.value === value);
    if (idx < 0 && ref.current && items.length) {
      const last = items.length - 1;
      ref.current.scrollTop = last * ITEM_H;
      setActiveIdx(last);
      onChangeRef.current(items[last].value);
    }
  }, [items.length]);

  const handleScroll = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    setActiveIdx(clamped);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!ref.current) return;
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' });
      onChangeRef.current(items[clamped].value);
    }, 120);
  };

  return (
    <div className="relative flex-1 overflow-hidden" style={{ height: ITEM_H * 5 }}>
      {/* top fade */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * 2, background: 'linear-gradient(to bottom, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 100%)' }} />
      {/* bottom fade */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * 2, background: 'linear-gradient(to top, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 100%)' }} />
      {/* center box */}
      <div className="absolute inset-x-1 z-1 pointer-events-none rounded-2xl"
        style={{
          top: ITEM_H * 2,
          height: ITEM_H,
          zIndex: 1,
          background: 'rgba(243,244,246,0.9)',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(0,0,0,0.06)',
        }} />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll wheel-col-inner"
        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((item, idx) => {
          const isSelected = idx === activeIdx;
          return (
            <div
              key={item.value}
              style={{
                height: ITEM_H,
                scrollSnapAlign: 'center',
                transition: 'transform 0.25s ease, opacity 0.25s ease, color 0.25s ease, font-size 0.25s ease',
                transform: isSelected ? 'scaleY(1.15)' : 'scaleY(1)',
                opacity: isSelected ? 1 : 0.4,
                color: isSelected ? '#000000' : '#9ca3af',
                fontWeight: 500,
                fontSize: '1rem',
                position: 'relative',
                zIndex: 2,
              }}
              className="flex items-center justify-center select-none"
            >
              {item.label}
            </div>
          );
        })}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  );
};

const WheelDatePicker = ({ value, onChange }) => {
  const today = new Date();
  const parseVal = (v) => {
    if (!v) return { d: today.getDate(), m: today.getMonth() + 1, y: today.getFullYear() };
    const [y, mo, d] = v.split('-').map(Number);
    return { d, m: mo, y };
  };
  const init = parseVal(value);
  const [day, setDay] = useState(init.d);
  const [month, setMonth] = useState(init.m);
  const [year, setYear] = useState(init.y);

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, '0') }));
  const months = UZ_MONTHS.map((name, i) => ({ value: i + 1, label: name }));
  const years = Array.from({ length: 5 }, (_, i) => ({ value: today.getFullYear() + i, label: String(today.getFullYear() + i) }));

  useEffect(() => {
    const d = Math.min(day, daysInMonth);
    onChange(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }, [day, month, year]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kun</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oy</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yil</span>
      </div>
      <div className="flex gap-2">
        <WheelCol items={days} value={Math.min(day, daysInMonth)} onChange={setDay} />
        <WheelCol items={months} value={month} onChange={setMonth} />
        <WheelCol items={years} value={year} onChange={setYear} />
      </div>
    </div>
  );
};

const Sales = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState('cash');
  const [customUzs, setCustomUzs] = useState('');
  const [customUsd, setCustomUsd] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('UZS');
  const [customAmount, setCustomAmount] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastCreatedSale, setLastCreatedSale] = useState(null);
  const [saleAmounts, setSaleAmounts] = useState({ uzs: 0, usd: 0 });
  const [saleCart, setSaleCart] = useState([]);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtNote, setDebtNote] = useState('');
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [usdRate, setUsdRate] = useState(12800);
  const [rateLoading, setRateLoading] = useState(true);

  // History
  const [historyPage, setHistoryPage] = useState(1);
  const [allHistorySales, setAllHistorySales] = useState([]);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditSaleModal, setShowEditSaleModal] = useState(false);
  const [showDeleteSaleModal, setShowDeleteSaleModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [editSaleData, setEditSaleData] = useState({ payment_method: 'cash', note: '', debt_due_date: '' });

  // Variants
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => { if (data.rates?.UZS) setUsdRate(Math.round(data.rates.UZS)); })
      .catch(() => { })
      .finally(() => setRateLoading(false));
  }, []);

  const { data: productsData, isLoading: productsLoading } = useProductsForSale({
    page: productPage,
    ...(searchTerm ? { search: searchTerm } : {}),
  });
  const { data: customersData } = useCustomers();
  const createSaleMutation = useCreateSale();
  const createCustomerMutation = useCreateCustomer();
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();

  const { data: historyData, isLoading: historyLoading, isFetching: historyFetching } = useSales({ page: historyPage, page_size: 5, ordering: '-created_at' });
  const { data: saleDetail, isLoading: detailLoading } = useSale(selectedSaleId);
  const historyTotal = historyData?.count || 0;
  const hasMoreHistory = allHistorySales.length < historyTotal;

  useEffect(() => {
    if (!historyData?.results) return;
    setAllHistorySales(prev => historyPage === 1 ? historyData.results : [...prev, ...historyData.results]);
  }, [historyData]);

  const PM_LABELS = { cash: 'Naqd', debt: 'Nasiya', card: 'Karta' };
  const PM_COLORS = {
    cash: 'bg-emerald-50 text-emerald-700',
    debt: 'bg-orange-50 text-orange-700',
    card: 'bg-slate-50 text-blue-700',
  };

  useEffect(() => { setProductPage(1); }, [searchTerm]);

  const products = productsData?.results || [];
  const totalProductPages = productsData?.count ? Math.ceil(productsData.count / 20) : 1;
  const customers = customersData?.results || [];

  const handleProductClick = (product) => {
    if (product.has_variants && product.variants?.length > 0) {
      setSelectedProductForVariants(product);
      setShowVariantModal(true);
    } else {
      addToCart(product, null);
    }
  };

  const addToCart = (product, variant = null) => {
    const qty = variant ? variant.quantity : product.quantity;
    if (qty <= 0) {
      toast.warning('Mahsulot omborda qolmagan');
      return;
    }
    const cartId = variant ? `v-${variant.id}` : `p-${product.id}`;
    const existingItem = cart.find(item => item.cartId === cartId);
    
    if (existingItem) {
      const currentQty = parseInt(existingItem.quantity, 10) || 0;
      if (currentQty < qty) {
        setCart(cart.map(item =>
          item.cartId === cartId ? { ...item, quantity: currentQty + 1 } : item
        ));
      } else {
        toast.warning('Ombordagi miqdordan ko\'p sotib olib bo\'lmaydi');
      }
    } else {
      const isUzs = variant ? (variant.currency === 'uzs') : (product.currency === 'uzs');
      const salePrice = variant ? parseFloat(variant.sale_price || 0) : parseFloat(product.sale_price || 0);
      const priceUzs = isUzs ? salePrice : 0;
      const priceUsd = !isUzs ? salePrice : 0;
      const newItem = {
        cartId,
        id: cartId, // for react keys and internal logic
        productId: product.id,
        variantId: variant ? variant.id : null,
        productName: product.name,
        variantName: variant ? variant.name : null,
        name: variant ? `${product.name} (${variant.name})` : product.name,
        price: salePrice,
        price_uzs: priceUzs,
        price_usd: priceUsd,
        currency: isUzs ? 'UZS' : 'USD',
        quantity: 1,
        maxQuantity: qty
      };
      const newCart = [...cart, newItem];
      const newHasUzs = newCart.some(i => i.price_uzs > 0);
      const newHasUsd = newCart.some(i => i.price_usd > 0);
      if (newHasUzs && !newHasUsd) setSelectedCurrency('UZS');
      else if (!newHasUzs && newHasUsd) setSelectedCurrency('USD');
      setCart(newCart);
      if (variant) setShowVariantModal(false);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;
        if (newQuantity <= item.maxQuantity) return { ...item, quantity: newQuantity };
        toast.warning('Ombordagi miqdordan ko\'p sotib olib bo\'lmaydi');
        return item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const setQuantity = (id, value) => {
    const num = parseInt(value, 10);
    if (!value || isNaN(num) || num <= 0) {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: '' } : item));
      return;
    }
    const item = cart.find(i => i.id === id);
    if (num > item.maxQuantity) {
      toast.warning('Ombordagi miqdordan ko\'p sotib olib bo\'lmaydi');
      setCart(cart.map(i => i.id === id ? { ...i, quantity: i.maxQuantity } : i));
      return;
    }
    setCart(cart.map(i => i.id === id ? { ...i, quantity: num } : i));
  };

  const commitQuantity = (id) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, quantity: parseInt(i.quantity, 10) || 1 } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const getTotalUzs = () => cart.reduce((s, i) => s + (i.price_uzs || 0) * (parseInt(i.quantity, 10) || 0), 0);
  const getTotalUsd = () => cart.reduce((s, i) => s + (i.price_usd || 0) * (parseInt(i.quantity, 10) || 0), 0);
  const getDefaultTotal = () => getTotalUzs() || getTotalUsd();

  const cartCurrency = getTotalUzs() > 0 ? 'UZS' : 'USD';
  const cur = cartCurrency === 'USD' ? '$' : "so'm";
  const cartHasUzs = cart.some(i => i.price_uzs > 0);
  const cartHasUsd = cart.some(i => i.price_usd > 0);
  const cartHasBoth = cartHasUzs && cartHasUsd;

  const customUzsAmount = parseFloat(customUzs) || 0;
  const customUsdAmount = parseFloat(customUsd) || 0;
  const customAmountValue = parseFloat(customAmount) || 0;
  const hasCustomUzs = customUzs !== '' && customUzsAmount > 0 && paymentType !== 'debt';
  const hasCustomUsd = customUsd !== '' && customUsdAmount > 0 && paymentType !== 'debt';
  const hasCustomAmount = customAmount !== '' && customAmountValue > 0 && paymentType !== 'debt';

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    if (paymentType === 'debt' && !selectedCustomer) {
      toast.error('Nasiya uchun mijozni tanlang');
      return;
    }

    const defaultUzs = getTotalUzs();
    const defaultUsd = getTotalUsd();

    const uzsScale = cartHasUzs && customUzsAmount > 0 && defaultUzs > 0 ? customUzsAmount / defaultUzs : 1;
    const usdScale = cartHasUsd && customUsdAmount > 0 && defaultUsd > 0 ? customUsdAmount / defaultUsd : 1;

    const payload = {
      ...(selectedCustomer ? { customer: selectedCustomer.id } : {}),
      payment_method: paymentType,
      ...(paymentType === 'debt' ? { ...(debtDueDate ? { debt_due_date: debtDueDate } : {}), ...(debtNote ? { note: debtNote } : {}) } : {}),
      items: cart.map(item => {
        const isUsdItem = item.price_usd > 0;
        const basePrice = isUsdItem ? item.price_usd : item.price_uzs;
        const scale = paymentType === 'debt' ? 1 : (isUsdItem ? usdScale : uzsScale);
        return {
          product: item.productId,
          ...(item.variantId ? { variant: item.variantId } : {}),
          quantity: item.quantity,
          price: (basePrice * scale).toFixed(2),
          currency: isUsdItem ? 'usd' : 'uzs',
        };
      })
    };
    try {
      const result = await createSaleMutation.mutateAsync(payload);
      setHistoryPage(1);
      setAllHistorySales([]);
      setSaleCart([...cart]);
      setLastCreatedSale(result);
      setSaleAmounts(
        paymentType === 'debt'
          ? { uzs: 0, usd: 0 }
          : {
            uzs: customUzsAmount > 0 ? customUzsAmount : defaultUzs,
            usd: customUsdAmount > 0 ? customUsdAmount : defaultUsd,
          }
      );
      setShowDebtModal(false);
      setShowCompletion(true);
    } catch (error) { }
  };

  const handleViewReceipt = () => {
    setShowCompletion(false);
    setShowReceipt(true);
  };

  const handleNewSale = () => {
    setShowCompletion(false);
    setShowReceipt(false);
    setCart([]);
    setCustomUzs('');
    setCustomUsd('');
    setSelectedCurrency('UZS');
    setCustomAmount('');
    setPaymentType('debt');
    setDebtDueDate('');
    setDebtNote('');
    setShowDebtModal(false);
    setSelectedCustomer(null);
    setLastCreatedSale(null);
    setSaleAmounts({ uzs: 0, usd: 0 });
    setSearchTerm('');
    setProductPage(1);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('uz-UZ');
  };

  // Removed early returns for completion and receipt modals, moved to AnimatePresence below.

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* Sticky header */}
      <div className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Sotuv</h1>
            <p className="text-xs text-slate-400">Yangi buyurtma rasmiylashtirish</p>
          </div>
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="flex items-center gap-2 bg-[#6366f1] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Tarix
            {historyTotal > 0 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-[10px] font-black">{historyTotal}</span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Customer selector */}


        {/* Product selection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-bold text-slate-900">Mahsulotlar</h3>
            <div className="relative flex-1 max-w-[180px]">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-100 focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {productsLoading ? (
              <div className="col-span-full py-10 flex justify-center">
                <Spinner className="w-6 h-6 text-[#6366f1] animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full py-8 text-center text-sm text-slate-400">Mahsulot topilmadi</div>
            ) : products.map((product) => {
              const isUzsProduct = product.currency === 'uzs';
              const priceUzs = isUzsProduct ? parseFloat(product.sale_price || 0) : 0;
              const priceUsd = !isUzsProduct ? parseFloat(product.sale_price || 0) : 0;
              const isHighPrice = priceUzs > 1000000 || priceUsd > 100;

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`${isHighPrice ? 'col-span-2' : ''} group cursor-pointer bg-white rounded-2xl p-3 border transition-all duration-200 ${(product.total_quantity ?? product.quantity) <= 0
                    ? 'opacity-50 grayscale border-slate-100'
                    : 'border-slate-100 hover:border-[#6366f1] hover:shadow-md active:scale-95'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center">
                      <Package className="w-4 h-4 text-[#6366f1]" />
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${(product.total_quantity ?? product.quantity) <= 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      {(product.total_quantity ?? product.quantity) <= 0 ? 'Yo\'q' : `${product.total_quantity ?? product.quantity} ${product.has_variants ? 'jami' : product.unit}`}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-xs mb-1.5 truncate leading-tight">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      {product.has_variants ? (
                        <p className="text-slate-500 font-bold text-[10px] leading-tight">
                          {product.variant_count} ta variant
                        </p>
                      ) : (
                        <>
                          {priceUzs > 0 && (
                            <p className="text-[#6366f1] font-bold text-xs leading-tight">
                              {priceUzs.toLocaleString()} so'm
                            </p>
                          )}
                          {priceUsd > 0 && (
                            <p className="text-emerald-600 font-bold text-xs leading-tight">
                              ${priceUsd.toLocaleString()}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="w-6 h-6 bg-slate-50 text-[#6366f1] rounded-lg flex items-center justify-center group-hover:bg-[#6366f1] group-hover:text-white transition-colors">
                      {product.has_variants ? <CaretRight className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalProductPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setProductPage(p => p - 1)}
                disabled={productPage === 1 || productsLoading}
                className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-[#6366f1] hover:text-white transition-all disabled:opacity-30"
              >
                <CaretLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-500">
                {productPage} / {totalProductPages}
                <span className="font-normal text-slate-400 ml-1">({productsData?.count} ta)</span>
              </span>
              <button
                onClick={() => setProductPage(p => p + 1)}
                disabled={productPage === totalProductPages || productsLoading}
                className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-[#6366f1] hover:text-white transition-all disabled:opacity-30"
              >
                <CaretRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>


        {/* Cart */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-xs font-semibold text-slate-400">Savatcha <span className="text-[#6366f1]">{cart.length} ta</span></p>
            </div>
            <div className="divide-y divide-slate-50">
              {cart.map((item) => {
                const isUsd = item.currency === 'USD';
                const priceLabel = isUsd ? `$${item.price.toLocaleString()}` : `${item.price.toLocaleString()} so'm`;
                const totalLabel = isUsd
                  ? `$${(item.price * item.quantity).toLocaleString()}`
                  : `${(item.price * item.quantity).toLocaleString()} so'm`;
                return (
                  <div key={item.id} className="px-4 py-3">
                    {/* Top row: name + total */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.productName || item.name}</h4>
                        {item.variantName && (
                          <p className="text-[10px] text-slate-500 font-medium truncate mb-0.5">{item.variantName}</p>
                        )}
                        <p className="text-xs text-slate-400">{priceLabel} × {item.quantity}</p>
                      </div>
                      <p className={`text-sm font-black shrink-0 ${isUsd ? 'text-emerald-600' : 'text-[#6366f1]'}`}>{totalLabel}</p>
                    </div>
                    {/* Bottom row: - input + X */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) => setQuantity(item.id, e.target.value)}
                        onBlur={() => commitQuantity(item.id)}
                        className="flex-1 h-11 text-center font-black text-slate-900 text-lg bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:border-[#6366f1]"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-11 h-11 rounded-2xl bg-[#6366f1] flex items-center justify-center text-white hover:bg-blue-700 active:scale-90 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-11 h-11 rounded-2xl bg-red-500 flex items-center justify-center text-white hover:bg-red-600 active:scale-90 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Payment */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            {/* Payment type toggle */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: 'cash', label: 'Naqd' },
                { id: 'debt', label: 'Nasiya' },
                { id: 'card', label: 'Karta' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setPaymentType(type.id);
                    if (type.id === 'debt') { setCustomUzs(''); setCustomUsd(''); setCustomAmount(''); }
                  }}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all ${paymentType === type.id
                    ? 'bg-[#6366f1] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Mijoz — barcha to'lov turlarida (nasiyada majburiy) */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Mijoz {paymentType === 'debt' ? <span className="text-red-400">*</span> : <span className="text-slate-300">(ixtiyoriy)</span>}
              </label>
                <div className="flex gap-2">
                  <SearchableCustomerSelect
                    customers={customers}
                    selectedCustomer={selectedCustomer}
                    onSelect={setSelectedCustomer}
                  />
                  <button
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="w-[46px] h-[46px] shrink-0 bg-[#6366f1] hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
            </div>

            {paymentType !== 'debt' && (
              <div className="mb-4 space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  To'lov summasi
                </label>
                {cartHasUzs && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6366f1]">so'm</span>
                    <input
                      type="number"
                      placeholder={getTotalUzs() > 0 ? getTotalUzs().toLocaleString() : '0'}
                      value={customUzs}
                      onChange={(e) => setCustomUzs(e.target.value)}
                      className="w-full pl-12 pr-14 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] font-bold text-sm outline-none"
                    />
                    {getTotalUzs() > 0 && (
                      <button type="button" onClick={() => setCustomUzs(getTotalUzs().toString())}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[10px] font-bold bg-[#6366f1]/10 text-[#6366f1] hover:opacity-80">
                        to'liq
                      </button>
                    )}
                  </div>
                )}
                {cartHasUsd && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">$</span>
                    <input
                      type="number"
                      placeholder={getTotalUsd() > 0 ? getTotalUsd().toFixed(2) : '0'}
                      value={customUsd}
                      onChange={(e) => setCustomUsd(e.target.value)}
                      className="w-full pl-7 pr-14 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 font-bold text-sm outline-none"
                    />
                    {getTotalUsd() > 0 && (
                      <button type="button" onClick={() => setCustomUsd(getTotalUsd().toString())}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 hover:opacity-80">
                        to'liq
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-1 mb-4">
              <div className="flex justify-between font-bold text-slate-900">
                <span className="text-sm">Jami:</span>
                <div className="text-right space-y-0.5">
                  {cartHasUzs && (
                    <p className="text-base text-[#6366f1]">
                      {(customUzsAmount > 0 ? customUzsAmount : getTotalUzs()).toLocaleString()} so'm
                    </p>
                  )}
                  {cartHasUsd && (
                    <p className="text-base text-emerald-600">
                      ${(customUsdAmount > 0 ? customUsdAmount : getTotalUsd()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {paymentType === 'debt' ? (
              <button
                onClick={() => {
                  if (!selectedCustomer) { toast.error('Mijozni tanlang'); return; }
                  setShowDebtModal(true);
                }}
                disabled={!selectedCustomer}
                className="w-full py-4 bg-[#6366f1] text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PaperPlaneRight className="w-4 h-4" />
                Davom etish
              </button>
            ) : (
              <button
                onClick={handleCompleteSale}
                disabled={createSaleMutation.isPending}
                className="w-full py-4 bg-[#6366f1] text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createSaleMutation.isPending ? <Spinner className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                Sotuvni yakunlash
              </button>
            )}
          </div>
        )}
      </div>
      {/* Debt modal */}
      {showDebtModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end" onClick={() => setShowDebtModal(false)}>
          <div className="bg-white rounded-t-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-2 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Nasiya ma'lumotlari</h2>
              <button onClick={() => setShowDebtModal(false)} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Qarz muddati
                </label>
                <WheelDatePicker value={debtDueDate} onChange={setDebtDueDate} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Izoh (ixtiyoriy)
                </label>
                <textarea
                  value={debtNote}
                  onChange={(e) => setDebtNote(e.target.value)}
                  rows={3}
                  placeholder="Qo'shimcha izoh kiriting..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] text-sm outline-none text-slate-900 resize-none"
                />
              </div>
              <button
                onClick={handleCompleteSale}
                disabled={createSaleMutation.isPending || !debtDueDate}
                className="w-full py-4 bg-[#6366f1] text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createSaleMutation.isPending ? <Spinner className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                Sotuvni yakunlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History Drawer ── */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end" onClick={() => setShowHistoryDrawer(false)}>
          <div className="bg-[#f8fafc] rounded-t-3xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Drawer header */}
            <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-slate-100 rounded-t-3xl shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sotuvlar tarixi</h2>
                {historyTotal > 0 && <p className="text-xs text-slate-400">{historyTotal} ta sotuv</p>}
              </div>
              <button onClick={() => setShowHistoryDrawer(false)} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {historyLoading && allHistorySales.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Spinner className="w-6 h-6 text-[#6366f1] animate-spin" />
                </div>
              ) : allHistorySales.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-400">Hali sotuv yo'q</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {allHistorySales.map((sale, idx) => {
                    const uzs = parseFloat(sale.total_uzs || 0);
                    const usd = parseFloat(sale.total_usd || 0);
                    return (
                      <div
                        key={sale.id}
                        onClick={() => { setSelectedSaleId(sale.id); setShowDetailModal(true); }}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-slate-50 hover:bg-slate-50 transition-colors ${idx < allHistorySales.length - 1 ? 'border-b border-slate-50' : ''}`}
                      >
                        <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center font-bold text-[#6366f1] text-sm shrink-0">
                          {sale.customer_name?.charAt(0) || 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-slate-900 truncate">{sale.customer_name}</p>
                            {sale.is_overdue && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-lg shrink-0">Muddati o'tgan</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-slate-400">{new Date(sale.created_at).toLocaleDateString('uz-UZ')}</p>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-600">{sale.payment_method_display}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {usd > 0 && <p className="text-xs font-bold text-emerald-600">${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                          {uzs > 0 && <p className="text-xs font-bold text-[#6366f1]">{uzs.toLocaleString()} so'm</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {hasMoreHistory && (
                <button
                  onClick={() => setHistoryPage(p => p + 1)}
                  disabled={historyFetching}
                  className="w-full py-3 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {historyFetching && <Spinner className="animate-spin w-4 h-4" />}
                  {historyFetching ? 'Yuklanmoqda...' : `Yana ko'rish (${historyTotal - allHistorySales.length} ta qoldi)`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Sotuv #{saleDetail?.id}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditSaleData({
                      payment_method: saleDetail?.payment_method || 'cash',
                      note: saleDetail?.note || '',
                      debt_due_date: saleDetail?.debt_due_date || '',
                    });
                    setShowEditSaleModal(true);
                    setShowDetailModal(false);
                  }}
                  className="w-8 h-8 bg-slate-50 text-[#6366f1] rounded-xl flex items-center justify-center hover:bg-[#6366f1] hover:text-white transition-all"
                >
                  <PencilSimple className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setShowDeleteSaleModal(true); setShowDetailModal(false); }}
                  className="w-8 h-8 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-[#6366f1] animate-spin" /></div>
            ) : saleDetail ? (
              <div className="p-5 space-y-4">
                {/* Info */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Mijoz</span>
                    <span className="font-semibold text-slate-900">{saleDetail.customer_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Sana</span>
                    <span className="font-semibold text-slate-900">{formatDateTime(saleDetail.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">To'lov</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${PM_COLORS[saleDetail.payment_method] || 'bg-slate-100 text-slate-600'}`}>
                      {PM_LABELS[saleDetail.payment_method] || saleDetail.payment_method}
                    </span>
                  </div>
                  {saleDetail.debt_due_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Qarz muddati</span>
                      <span className={`font-semibold ${saleDetail.is_overdue ? 'text-red-500' : 'text-slate-900'}`}>
                        {new Date(saleDetail.debt_due_date).toLocaleDateString('uz-UZ')}
                        {saleDetail.is_overdue && ' (muddati o\'tgan)'}
                      </span>
                    </div>
                  )}
                  {saleDetail.note && (
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-slate-400 shrink-0">Izoh</span>
                      <span className="font-medium text-slate-700 text-right">{saleDetail.note}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mahsulotlar</h3>
                  <div className="bg-slate-50 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-4 gap-2 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <div className="col-span-2">Nomi</div>
                      <div className="text-center">Miqdor</div>
                      <div className="text-right">Narx</div>
                    </div>
                    {(saleDetail.items || []).map((item, i) => {
                      const price = parseFloat(item.price || 0);
                      const isUsd = item.currency === 'usd';
                      const fmtPrice = isUsd
                        ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `${price.toLocaleString()} so'm`;
                      return (
                        <div key={i} className="grid grid-cols-4 gap-2 px-4 py-2.5 border-b border-slate-100 last:border-0 text-sm">
                          <div className="col-span-2 font-medium text-slate-900 truncate">{item.product_name}</div>
                          <div className="text-center text-slate-500">{item.quantity}</div>
                          <div className={`text-right font-bold ${isUsd ? 'text-emerald-600' : 'text-[#6366f1]'}`}>{fmtPrice}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  {parseFloat(saleDetail.total_uzs || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Jami (so'm)</span>
                      <span className="font-bold text-[#6366f1]">{parseFloat(saleDetail.total_uzs).toLocaleString()} so'm</span>
                    </div>
                  )}
                  {parseFloat(saleDetail.total_usd || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Jami ($)</span>
                      <span className="font-bold text-emerald-600">${parseFloat(saleDetail.total_usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {parseFloat(saleDetail.paid_amount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">To'langan</span>
                      <span className="font-bold text-emerald-600">{parseFloat(saleDetail.paid_amount).toLocaleString()} so'm</span>
                    </div>
                  )}
                  {parseFloat(saleDetail.remaining_amount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Qarz (qolgan)</span>
                      <span className="font-bold text-red-500">{parseFloat(saleDetail.remaining_amount).toLocaleString()} so'm</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Edit Sale Modal ── */}
      {showEditSaleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-end" onClick={() => setShowEditSaleModal(false)}>
          <div className="bg-white rounded-t-3xl w-full" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-2 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Sotuvni tahrirlash</h2>
              <button onClick={() => setShowEditSaleModal(false)} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">To'lov turi</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'cash', label: 'Naqd' }, { id: 'debt', label: 'Nasiya' }, { id: 'card', label: 'Karta' }].map(t => (
                    <button key={t.id}
                      onClick={() => setEditSaleData(d => ({ ...d, payment_method: t.id }))}
                      className={`py-2.5 rounded-xl font-bold text-xs transition-all ${editSaleData.payment_method === t.id ? 'bg-[#6366f1] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {editSaleData.payment_method === 'debt' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Qarz muddati</label>
                  <input type="date" value={editSaleData.debt_due_date}
                    onChange={e => setEditSaleData(d => ({ ...d, debt_due_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]" />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Izoh</label>
                <textarea value={editSaleData.note} onChange={e => setEditSaleData(d => ({ ...d, note: e.target.value }))}
                  rows={3} placeholder="Izoh..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]" />
              </div>
              <button
                onClick={async () => {
                  try {
                    await updateSaleMutation.mutateAsync({ id: selectedSaleId, data: editSaleData });
                    setShowEditSaleModal(false);
                  } catch { }
                }}
                disabled={updateSaleMutation.isPending}
                className="w-full py-4 bg-[#6366f1] text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                {updateSaleMutation.isPending ? <Spinner className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {showDeleteSaleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center px-4" onClick={() => setShowDeleteSaleModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trash className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Sotuvni o'chirish</h3>
              <p className="text-sm text-slate-500">Bu amalni ortga qaytarib bo'lmaydi.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteSaleModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm">Bekor</button>
              <button
                onClick={async () => {
                  try {
                    await deleteSaleMutation.mutateAsync(selectedSaleId);
                    setShowDeleteSaleModal(false);
                    setSelectedSaleId(null);
                  } catch { }
                }}
                disabled={deleteSaleMutation.isPending}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600">
                {deleteSaleMutation.isPending && <Spinner className="animate-spin w-4 h-4" />}
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isAddCustomerModalOpen && (
          <AddEditCustomerModal
            onClose={() => setIsAddCustomerModalOpen(false)}
            onSave={async (data) => {
              try {
                const newCustomer = await createCustomerMutation.mutateAsync(data);
                setSelectedCustomer(newCustomer || null);
                setIsAddCustomerModalOpen(false);
              } catch (error) { }
            }}
            isPending={createCustomerMutation.isPending}
          />
        )}
      </AnimatePresence>
      {/* Variant Selection Modal */}
      <AnimatePresence>
        {showVariantModal && selectedProductForVariants && (
          <motion.div 
            variants={backdropVariants} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end" 
            onClick={() => setShowVariantModal(false)}
          >
            <motion.div 
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden flex flex-col origin-bottom" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedProductForVariants.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Variantni tanlang</p>
                </div>
                <button onClick={() => setShowVariantModal(false)} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-2">
                {selectedProductForVariants.variants?.map((variant) => {
                  const isUsd = (variant.currency || 'uzs').toLowerCase() === 'usd';
                  const price = parseFloat(variant.sale_price || 0);
                  const outOfStock = variant.quantity <= 0;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => !outOfStock && addToCart(selectedProductForVariants, variant)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        outOfStock 
                          ? 'opacity-50 border-slate-100 bg-slate-50 cursor-not-allowed' 
                          : 'border-slate-100 hover:border-[#6366f1] bg-white cursor-pointer hover:shadow-sm'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{variant.name}</h4>
                        {variant.barcode && <p className="text-[10px] text-slate-400 mt-0.5">{variant.barcode}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold ${isUsd ? 'text-emerald-600' : 'text-[#6366f1]'}`}>
                            {isUsd ? `$${price.toLocaleString()}` : `${price.toLocaleString()} so'm`}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] font-semibold text-slate-500">Qoldiq: {variant.quantity} {variant.unit}</span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        outOfStock ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-[#6366f1]'
                      }`}>
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Completion modal */}
        {showCompletion && (
          <motion.div 
            variants={backdropVariants} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          >
            <motion.div 
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="mb-1 space-y-0.5">
                  {saleAmounts.uzs === 0 && saleAmounts.usd === 0 ? (
                    <p className="text-2xl font-black text-orange-500">Nasiya</p>
                  ) : (
                    <>
                      {saleAmounts.usd > 0 && (
                        <p className="text-2xl font-black text-emerald-600">${saleAmounts.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      )}
                      {saleAmounts.uzs > 0 && (
                        <p className="text-2xl font-black text-[#6366f1]">{saleAmounts.uzs.toLocaleString()} so'm</p>
                      )}
                    </>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-6">Sotuv muvaffaqiyatli yakunlandi</p>
                <div className="space-y-3">
                  <button
                    onClick={handleViewReceipt}
                    className="w-full py-3.5 bg-[#6366f1] text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    Chekni ko'rish
                  </button>
                  <button
                    onClick={handleNewSale}
                    className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Yangi sotuv
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Receipt modal */}
        {showReceipt && (
          <motion.div 
            variants={backdropVariants} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          >
            <motion.div 
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <button onClick={handleNewSale} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-bold text-slate-900">Chek #{lastCreatedSale?.id}</h2>
                <div className="w-9" />
              </div>

              <div className="text-center mb-5">
                <h3 className="text-base font-bold text-slate-900">BalonCRM Sotuv cheki</h3>
                <p className="text-xs text-slate-400 mt-1">{formatDateTime(lastCreatedSale?.created_at)}</p>
                <p className="text-xs text-slate-500 mt-0.5">Mijoz: {lastCreatedSale?.customer_name}</p>
              </div>

              <div className="mb-5 space-y-2">
                <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                  <div>Mahsulot</div>
                  <div className="text-center">Miqdor</div>
                  <div className="text-center">Narx</div>
                  <div className="text-right">Jami</div>
                </div>
                {lastCreatedSale?.items?.map((item) => {
                  const price = parseFloat(item.price || 0);
                  const isUsd = item.currency === 'usd';
                  const fmt = (v) => isUsd
                    ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `${v.toLocaleString()} so'm`;
                  return (
                    <div key={item.id} className="grid grid-cols-4 gap-2 py-1.5 border-b border-slate-50 last:border-0">
                      <div className="font-medium text-slate-900 text-xs truncate">{item.product_name}</div>
                      <div className="text-center text-slate-500 text-xs">{item.quantity}</div>
                      <div className={`text-center text-xs font-semibold ${isUsd ? 'text-emerald-600' : 'text-[#6366f1]'}`}>{fmt(price)}</div>
                      <div className={`text-right font-bold text-xs ${isUsd ? 'text-emerald-600' : 'text-[#6366f1]'}`}>{fmt(price * item.quantity)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4 space-y-2 mb-5">
                {lastCreatedSale?.payment_method !== 'debt' && (
                  <>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Jami:</span>
                      <div className="text-right space-y-0.5">
                        {saleAmounts.uzs > 0 && <p className="text-[#6366f1]">{saleAmounts.uzs.toLocaleString()} so'm</p>}
                        {saleAmounts.usd > 0 && <p className="text-emerald-600">${saleAmounts.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>To'landi:</span>
                      <div className="text-right space-y-0.5">
                        {saleAmounts.uzs > 0 && <p>{saleAmounts.uzs.toLocaleString()} so'm</p>}
                        {saleAmounts.usd > 0 && <p>${saleAmounts.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                      </div>
                    </div>
                  </>
                )}
                {parseFloat(lastCreatedSale?.debt_amount || 0) > 0 && (
                  <div className="flex justify-between text-sm font-bold text-red-500">
                    <span>Qarz:</span>
                    <span>{parseFloat(lastCreatedSale.debt_amount).toLocaleString()} so'm</span>
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales;
