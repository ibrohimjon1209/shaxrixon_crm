import React, { useState, useMemo, useEffect } from 'react';
import {
  FiSearch, FiPlus, FiMinus, FiX, FiCheck, FiSend, FiShare2,
  FiArrowLeft, FiPackage, FiLoader, FiShoppingCart, FiUser,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { useProductsForSale } from '../hooks/useProducts';
import { useCustomers, useCreateCustomer } from '../hooks/useCustomers';
import { useCreateSale } from '../hooks/useSales';
import { toast } from 'react-toastify';
import { AddEditCustomerModal } from './Customers';
import { AnimatePresence } from 'framer-motion';

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
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [usdRate, setUsdRate] = useState(12800);
  const [rateLoading, setRateLoading] = useState(true);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => { if (data.rates?.UZS) setUsdRate(Math.round(data.rates.UZS)); })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  }, []);

  const { data: productsData, isLoading: productsLoading } = useProductsForSale({
    page: productPage,
    ...(searchTerm ? { search: searchTerm } : {}),
  });
  const { data: customersData } = useCustomers();
  const createSaleMutation = useCreateSale();
  const createCustomerMutation = useCreateCustomer();

  useEffect(() => { setProductPage(1); }, [searchTerm]);

  const products = productsData?.results || [];
  const totalProductPages = productsData?.count ? Math.ceil(productsData.count / 20) : 1;
  const customers = customersData?.results || [];

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.warning('Mahsulot omborda qolmagan');
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      const currentQty = parseInt(existingItem.quantity, 10) || 0;
      if (currentQty < product.quantity) {
        setCart(cart.map(item =>
          item.id === product.id ? { ...item, quantity: currentQty + 1 } : item
        ));
      } else {
        toast.warning('Ombordagi miqdordan ko\'p sotib olib bo\'lmaydi');
      }
    } else {
      const isUzs = product.currency === 'uzs';
      const priceUzs = isUzs ? parseFloat(product.sale_price || 0) : 0;
      const priceUsd = !isUzs ? parseFloat(product.sale_price || 0) : 0;
      const newItem = {
        id: product.id,
        name: product.name,
        price: isUzs ? priceUzs : priceUsd,
        price_uzs: priceUzs,
        price_usd: priceUsd,
        currency: isUzs ? 'UZS' : 'USD',
        quantity: 1,
        maxQuantity: product.quantity
      };
      const newCart = [...cart, newItem];
      const newHasUzs = newCart.some(i => i.price_uzs > 0);
      const newHasUsd = newCart.some(i => i.price_usd > 0);
      if (newHasUzs && !newHasUsd) setSelectedCurrency('UZS');
      else if (!newHasUzs && newHasUsd) setSelectedCurrency('USD');
      setCart(newCart);
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
    if (!selectedCustomer) {
      toast.error('Mijozni tanlang');
      return;
    }

    const defaultUzs = getTotalUzs();
    const defaultUsd = getTotalUsd();
    
    let scale = 1;
    if (hasCustomAmount) {
      if (selectedCurrency === 'UZS' && defaultUzs > 0) {
        scale = customAmountValue / defaultUzs;
      } else if (selectedCurrency === 'USD' && defaultUsd > 0) {
        scale = customAmountValue / defaultUsd;
      }
    }

    const payload = {
      customer: selectedCustomer.id,
      payment_method: paymentType,
      items: cart.map(item => {
        const basePrice = selectedCurrency === 'USD' ? (item.price_usd || 0) : (item.price_uzs || 0);
        return {
          product: item.id,
          quantity: item.quantity,
          price: (basePrice * scale).toFixed(2)
        };
      })
    };
    try {
      const result = await createSaleMutation.mutateAsync(payload);
      setLastCreatedSale(result);
      setSaleAmounts({
        uzs: selectedCurrency === 'UZS' ? (hasCustomAmount ? customAmountValue : defaultUzs) : 0,
        usd: selectedCurrency === 'USD' ? (hasCustomAmount ? customAmountValue : defaultUsd) : 0,
      });
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
    setPaymentType('cash');
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

  // Completion modal
  if (showCompletion) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="mb-1 space-y-0.5">
              {saleAmounts.uzs > 0 && (
                <p className="text-2xl font-black text-[#1447E6]">{saleAmounts.uzs.toLocaleString()} so'm</p>
              )}
              {saleAmounts.usd > 0 && (
                <p className="text-2xl font-black text-emerald-600">${saleAmounts.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-6">Sotuv muvaffaqiyatli yakunlandi</p>
            <div className="space-y-3">
              <button
                onClick={handleViewReceipt}
                className="w-full py-3.5 bg-[#1447E6] text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
              >
                Chekni ko'rish
              </button>
              <button
                onClick={handleNewSale}
                className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Yangi sotuv
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Receipt modal
  if (showReceipt) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <button onClick={handleNewSale} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Chek #{lastCreatedSale?.id}</h2>
            <div className="w-9" />
          </div>

          <div className="text-center mb-5">
            <h3 className="text-base font-bold text-gray-900">BalonCRM Sotuv cheki</h3>
            <p className="text-xs text-gray-400 mt-1">{formatDateTime(lastCreatedSale?.created_at)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Mijoz: {lastCreatedSale?.customer_name}</p>
          </div>

          <div className="mb-5 space-y-2">
            <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
              <div>Mahsulot</div>
              <div className="text-center">Miqdor</div>
              <div className="text-center">Narx</div>
              <div className="text-right">Jami</div>
            </div>
            {(() => {
              const isUsd = saleAmounts.usd > 0;
              return lastCreatedSale?.items?.map((item) => {
                const price = parseFloat(item.price || 0);
                return (
                  <div key={item.id} className="grid grid-cols-4 gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="font-medium text-gray-900 text-xs truncate">{item.product_name}</div>
                    <div className="text-center text-gray-500 text-xs">{item.quantity}</div>
                    <div className={`text-center text-xs font-semibold ${isUsd ? 'text-emerald-600' : 'text-[#1447E6]'}`}>
                      {isUsd ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${price.toLocaleString()} so'm`}
                    </div>
                    <div className={`text-right font-bold text-xs ${isUsd ? 'text-emerald-600' : 'text-[#1447E6]'}`}>
                      {isUsd ? `$${(price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${(price * item.quantity).toLocaleString()} so'm`}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 mb-5">
            <div className="flex justify-between font-bold text-gray-900">
              <span>Jami:</span>
              <div className="text-right space-y-0.5">
                {saleAmounts.uzs > 0 && (
                  <p className="text-[#1447E6]">{saleAmounts.uzs.toLocaleString()} so'm</p>
                )}
                {saleAmounts.usd > 0 && (
                  <p className="text-emerald-600">${saleAmounts.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>To'landi:</span>
              <div className="text-right space-y-0.5">
                {saleAmounts.uzs > 0 && (
                  <p>{saleAmounts.uzs.toLocaleString()} so'm</p>
                )}
                {saleAmounts.usd > 0 && (
                  <p>${saleAmounts.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                )}
              </div>
            </div>
            {parseFloat(lastCreatedSale?.debt_amount || 0) > 0 && (
              <div className="flex justify-between text-sm font-bold text-red-500">
                <span>Qarz:</span>
                <span>{parseFloat(lastCreatedSale?.debt_amount || 0).toLocaleString()} {cur}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-32">
      {/* Sticky header */}
      <div className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sotuv</h1>
            <p className="text-xs text-gray-400">Yangi buyurtma rasmiylashtirish</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Customer selector */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Mijozni tanlash</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400 w-4 h-4" />
              </div>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const id = e.target.value;
                  const customer = customers.find(c => c.id.toString() === id);
                  setSelectedCustomer(customer || null);
                }}
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1447E6]/20 focus:border-[#1447E6] transition-all text-gray-900 font-medium text-sm appearance-none outline-none"
              >
                <option value="">Mijozni tanlang...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="w-[46px] h-[46px] shrink-0 bg-[#1447E6] hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              <FiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product selection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-bold text-gray-900">Mahsulotlar</h3>
            <div className="relative flex-1 max-w-[180px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-100 focus:ring-2 focus:ring-[#1447E6]/20 focus:border-[#1447E6] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {productsLoading ? (
              <div className="col-span-full py-10 flex justify-center">
                <FiLoader className="w-6 h-6 text-[#1447E6] animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full py-8 text-center text-sm text-gray-400">Mahsulot topilmadi</div>
            ) : products.map((product) => {
              const isUzsProduct = product.currency === 'uzs';
              const priceUzs = isUzsProduct ? parseFloat(product.sale_price || 0) : 0;
              const priceUsd = !isUzsProduct ? parseFloat(product.sale_price || 0) : 0;
              const isHighPrice = priceUzs > 1000000 || priceUsd > 100;
              
              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`${isHighPrice ? 'col-span-2' : ''} group cursor-pointer bg-white rounded-2xl p-3 border transition-all duration-200 ${product.quantity <= 0
                    ? 'opacity-50 grayscale border-gray-100'
                    : 'border-gray-100 hover:border-[#1447E6] hover:shadow-md active:scale-95'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                      <FiPackage className="w-4 h-4 text-[#1447E6]" />
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${product.quantity <= 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      {product.quantity <= 0 ? 'Yo\'q' : `${product.quantity} ${product.unit}`}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-xs mb-1.5 truncate leading-tight">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      {priceUzs > 0 && (
                        <p className="text-[#1447E6] font-bold text-xs leading-tight">
                          {priceUzs.toLocaleString()} so'm
                        </p>
                      )}
                      {priceUsd > 0 && (
                        <p className="text-emerald-600 font-bold text-xs leading-tight">
                          ${priceUsd.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="w-6 h-6 bg-blue-50 text-[#1447E6] rounded-lg flex items-center justify-center group-hover:bg-[#1447E6] group-hover:text-white transition-colors">
                      <FiPlus className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalProductPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setProductPage(p => p - 1)}
                disabled={productPage === 1 || productsLoading}
                className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-[#1447E6] hover:text-white transition-all disabled:opacity-30"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-gray-500">
                {productPage} / {totalProductPages}
                <span className="font-normal text-gray-400 ml-1">({productsData?.count} ta)</span>
              </span>
              <button
                onClick={() => setProductPage(p => p + 1)}
                disabled={productPage === totalProductPages || productsLoading}
                className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-[#1447E6] hover:text-white transition-all disabled:opacity-30"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Savatcha</h3>
              <span className="bg-blue-50 text-[#1447E6] px-2.5 py-1 rounded-xl text-xs font-bold">{cart.length} ta</span>
            </div>

            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-xs truncate">{item.name}</h4>
                    <p className="text-[10px] text-gray-400">{item.price.toLocaleString()} {item.currency === 'USD' ? '$' : "so'm"}</p>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-xl p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#1447E6]"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.maxQuantity}
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.id, e.target.value)}
                      onBlur={() => commitQuantity(item.id)}
                      className="w-10 text-center font-bold text-gray-900 text-xs bg-transparent outline-none"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#1447E6]"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-[#1447E6] min-w-[70px] text-right">
                    {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
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
                    ? 'bg-[#1447E6] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {paymentType !== 'debt' && (
              <div className="mb-4 space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Sotuv narxi
                </label>
                {cartHasBoth && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => { setSelectedCurrency('UZS'); setCustomAmount(''); }}
                      className={`py-2.5 rounded-xl font-bold text-xs transition-all ${selectedCurrency === 'UZS'
                        ? 'bg-[#1447E6] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                      so'm
                    </button>
                    <button
                      onClick={() => { setSelectedCurrency('USD'); setCustomAmount(''); }}
                      className={`py-2.5 rounded-xl font-bold text-xs transition-all ${selectedCurrency === 'USD'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                      $
                    </button>
                  </div>
                )}
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${selectedCurrency === 'UZS' ? 'text-gray-400' : 'text-emerald-500'}`}>
                    {selectedCurrency === 'UZS' ? "so'm" : '$'}
                  </span>
                  <input
                    type="number"
                    placeholder={selectedCurrency === 'UZS' 
                      ? (getTotalUzs() > 0 ? getTotalUzs().toLocaleString() : '0')
                      : (getTotalUsd() > 0 ? getTotalUsd().toLocaleString() : '0')
                    }
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className={`w-full pl-10 pr-14 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 ${selectedCurrency === 'UZS' ? 'focus:ring-[#1447E6]/20 focus:border-[#1447E6]' : 'focus:ring-emerald-200 focus:border-emerald-400'} font-bold text-sm outline-none`}
                  />
                  {(selectedCurrency === 'UZS' ? getTotalUzs() > 0 : getTotalUsd() > 0) && (
                    <button
                      type="button"
                      onClick={() => setCustomAmount((selectedCurrency === 'UZS' ? getTotalUzs() : getTotalUsd()).toString())}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[10px] font-bold hover:opacity-80 transition-colors ${selectedCurrency === 'UZS' ? 'bg-[#1447E6]/10 text-[#1447E6]' : 'bg-emerald-50 text-emerald-600'}`}
                    >
                      to'liq
                    </button>
                  )}
                </div>
                {customAmount !== '' && (
                  <button
                    type="button"
                    onClick={() => setCustomAmount('')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                  >
                    <FiX className="w-3.5 h-3.5" /> Tozalash
                  </button>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 space-y-1 mb-4">
              <div className="flex justify-between font-bold text-gray-900">
                <span className="text-sm">Jami:</span>
                <div className="text-right">
                  <p className={`text-base ${hasCustomAmount ? 'text-blue-600' : selectedCurrency === 'USD' ? 'text-emerald-600' : ''}`}>
                    {hasCustomAmount 
                      ? (selectedCurrency === 'USD' 
                          ? `$${customAmountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : `${customAmountValue.toLocaleString()} so'm`)
                      : (selectedCurrency === 'USD'
                          ? (getTotalUsd() > 0 ? `$${getTotalUsd().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0')
                          : (getTotalUzs() > 0 ? `${getTotalUzs().toLocaleString()} so'm` : '0 so\'m'))
                    }
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={createSaleMutation.isPending || !selectedCustomer}
              className="w-full py-4 bg-[#1447E6] text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createSaleMutation.isPending ? <FiLoader className="animate-spin w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
              Sotuvni yakunlash
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isAddCustomerModalOpen && (
          <AddEditCustomerModal
            onClose={() => setIsAddCustomerModalOpen(false)}
            onSave={async (data) => {
              try {
                const newCustomer = await createCustomerMutation.mutateAsync(data);
                setSelectedCustomer(newCustomer || null);
                setIsAddCustomerModalOpen(false);
              } catch (error) {}
            }}
            isPending={createCustomerMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales;
