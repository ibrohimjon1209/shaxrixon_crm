import { useState } from 'react';
import {
  Plus, Minus, MagnifyingGlass, Package, Truck, X, Check,
  Spinner, Trash, Pencil
} from '@phosphor-icons/react';
import { useQueries } from '@tanstack/react-query';
import { usePurchases, usePurchaseDetail, useCreatePurchase, useUpdatePurchase, useDeletePurchase } from '../hooks/usePurchases';
import purchaseService from '../services/purchase.service';
import { useProducts } from '../hooks/useProducts';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (num) => parseFloat(num || 0).toLocaleString('uz-UZ');

const getProductCurrency = (product) => (product?.currency || 'uzs').toLowerCase();

const getProductCostPrice = (product) => {
  const cost = parseFloat(product?.cost_price || 0);
  if (cost > 0) return cost;
  return parseFloat(product?.sale_price || 0);
};

const paymentMethods = [
  { id: 'cash', label: 'Naqd' },
  { id: 'card', label: 'Karta' },
  { id: 'debt', label: 'Nasiya' },
  { id: 'transfer', label: "O'tkazma" },
];

const Purchases = () => {
  const [viewPurchase, setViewPurchase] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editPurchaseId, setEditPurchaseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const { data: purchasesData, isLoading: purchasesLoading } = usePurchases();
  const { data: purchaseDetail, isLoading: detailLoading } = usePurchaseDetail(viewPurchase?.id);
  const { data: productsData } = useProducts({ search: productSearch });

  const createPurchaseMutation = useCreatePurchase();
  const updatePurchaseMutation = useUpdatePurchase();
  const deletePurchaseMutation = useDeletePurchase();

  const purchases = purchasesData?.results || [];
  const products = productsData?.results || [];

  const purchaseDetails = useQueries({
    queries: purchases.map(p => ({
      queryKey: ['purchase-detail', p.id],
      queryFn: () => purchaseService.getPurchase(p.id),
      staleTime: 5 * 60 * 1000,
    }))
  });

  const getItemsCount = (purchaseId) => {
    const idx = purchases.findIndex(p => p.id === purchaseId);
    const detail = purchaseDetails[idx]?.data;
    return detail?.items?.reduce((s, i) => s + (i.quantity || 0), 0) ?? null;
  };

  const filteredPurchases = searchTerm
    ? purchases.filter(p => p.id?.toString().includes(searchTerm))
    : purchases;

  const addToCart = (item) => {
    const costPrice = parseFloat(item.cost_price || 0) > 0 ? parseFloat(item.cost_price || 0) : parseFloat(item.sale_price || 0);
    const currency = (item.currency || 'uzs').toLowerCase();
    
    const cartId = item.isVariant ? `v-${item.id}` : `p-${item.id}`;
    const existing = cart.find(c => c.cartId === cartId);
    
    if (existing) {
      setCart(cart.map(c =>
        c.cartId === cartId ? { ...c, quantity: (parseInt(c.quantity) || 0) + 1, costPrice, currency } : c
      ));
    } else {
      setCart([...cart, {
        cartId,
        productId: item.productId,
        variantId: item.isVariant ? item.id : null,
        productName: item.productName,
        variantName: item.isVariant ? item.name : null,
        name: item.isVariant ? `${item.productName} (${item.name})` : item.productName,
        quantity: 1,
        costPrice,
        currency
      }]);
    }
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const openCreateModal = () => {
    setCart([]);
    setNote('');
    setPaymentMethod('cash');
    setEditPurchaseId(null);
    setModalMode('create');
  };

  const openEditModal = (purchase) => {
    setCart(
      (purchase.items || []).map(item => ({
        cartId: item.variant ? `v-${item.variant}` : `p-${item.product}`,
        productId: item.product,
        variantId: item.variant,
        productName: item.product_name,
        variantName: item.variant_name,
        name: item.variant_name ? `${item.product_name} (${item.variant_name})` : item.product_name,
        quantity: item.quantity,
        costPrice: parseFloat(item.cost_price || 0),
        currency: (item.currency || 'uzs').toLowerCase()
      }))
    );
    setNote(purchase.note || '');
    setPaymentMethod(purchase.payment_method || 'cash');
    setEditPurchaseId(purchase.id);
    setModalMode('edit');
  };

  const handleSave = async () => {
    if (modalMode === 'create' && cart.length === 0) {
      toast.error('Kamida bitta mahsulot tanlang');
      return;
    }
    try {
      if (modalMode === 'create') {
        const total_uzs = cart.reduce((sum, item) => item.currency === 'uzs' ? sum + (item.quantity * item.costPrice) : sum, 0);
        const total_usd = cart.reduce((sum, item) => item.currency === 'usd' ? sum + (item.quantity * item.costPrice) : sum, 0);

        await createPurchaseMutation.mutateAsync({
          items: cart.map(item => ({
            product: item.productId,
            ...(item.variantId ? { variant: item.variantId } : {}),
            quantity: parseInt(item.quantity) || 1,
            cost_price: parseFloat(item.costPrice || 0).toFixed(2),
            currency: item.currency || 'uzs'
          })),
          total_uzs: total_uzs.toFixed(2),
          total_usd: total_usd.toFixed(2),
          payment_method: paymentMethod,
          note
        });
      } else {
        // include items and totals when updating a purchase
        const total_uzs = cart.reduce((sum, item) => item.currency === 'uzs' ? sum + (item.quantity * item.costPrice) : sum, 0);
        const total_usd = cart.reduce((sum, item) => item.currency === 'usd' ? sum + (item.quantity * item.costPrice) : sum, 0);
        await updatePurchaseMutation.mutateAsync({
          id: editPurchaseId,
          data: {
            items: cart.map(item => ({
              product: item.productId,
              ...(item.variantId ? { variant: item.variantId } : {}),
              quantity: parseInt(item.quantity) || 1,
              cost_price: parseFloat(item.costPrice || 0).toFixed(2),
              currency: item.currency || 'uzs'
            })),
            total_uzs: total_uzs.toFixed(2),
            total_usd: total_usd.toFixed(2),
            payment_method: paymentMethod,
            note
          }
        });
      }
      setModalMode(null);
    } catch (_) {}
  };

  const isPending = createPurchaseMutation.isPending || updatePurchaseMutation.isPending;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] px-5 md:px-8 pt-10 pb-8 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute top-12 -right-4 w-16 h-16 bg-white/5 rounded-full" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Xaridlar</h1>
            <p className="text-slate-200 text-sm mt-0.5">Ombor to'ldirish</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 max-w-6xl mx-auto">
        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Xarid raqami bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]"
          />
        </div>

        {/* Purchase list */}
        {purchasesLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="w-10 h-10 text-[#6366f1] animate-spin" />
          </div>
        ) : filteredPurchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPurchases.map((purchase) => (
              <div
                key={purchase.id}
                onClick={() => setViewPurchase(purchase)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-[#6366f1] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-[#6366f1] shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-[160px]">
                      {purchase.note ? purchase.note : `Xarid #${purchase.id}`}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      {new Date(purchase.created_at).toLocaleDateString()}
                      <span>•</span>
                      {getItemsCount(purchase.id) ?? '...'} ta
                      <span>•</span>
                      <span className="font-semibold text-slate-600">{purchase.payment_method_display || paymentMethods.find(p => p.id === purchase.payment_method)?.label || purchase.payment_method}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(purchase); }}
                      className="w-8 h-8 bg-slate-50 text-indigo-500 rounded-lg flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Bu xaridni o'chirmoqchimisiz?")) {
                          deletePurchaseMutation.mutate(purchase.id);
                        }
                      }}
                      disabled={deletePurchaseMutation.isPending}
                      className="w-8 h-8 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      {deletePurchaseMutation.isPending
                        ? <Spinner className="animate-spin w-3 h-3" />
                        : <Trash className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
            <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Xaridlar yo'q</h3>
            <p className="text-slate-400 text-sm">Omborga mahsulot qo'shish uchun + tugmasini bosing</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#6366f1] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-[#f8fafc] rounded-t-3xl w-full max-w-2xl mx-auto h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] px-5 pt-6 pb-5 flex items-center justify-between shrink-0">
                <h2 className="text-white text-lg font-bold">
                  {modalMode === 'create' ? 'Yangi Xarid' : `Xaridni Tahrirlash #${editPurchaseId}`}
                </h2>
                <button
                  onClick={() => setModalMode(null)}
                  className="w-9 h-9 bg-white/20 text-white rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {modalMode === 'create' && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mahsulot qo'shish</label>
                      <div className="relative w-40">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="Qidirish..."
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {products.flatMap(p => {
                        const items = p.variants?.length > 0 
                          ? p.variants.map(v => ({ ...v, productId: p.id, productName: p.name, isVariant: true }))
                          : [{ ...p, productId: p.id, productName: p.name, isVariant: false }];
                        
                        return items.map(item => {
                          const currency = (item.currency || 'uzs').toLowerCase();
                          const costPrice = parseFloat(item.cost_price || 0) > 0 ? parseFloat(item.cost_price || 0) : parseFloat(item.sale_price || 0);
                          return (
                            <button
                              key={item.isVariant ? `v-${item.id}` : `p-${item.id}`}
                              onClick={() => addToCart(item)}
                              className="group cursor-pointer bg-white rounded-2xl p-3 border border-slate-100 hover:border-[#6366f1] hover:shadow-md active:scale-95 transition-all text-left"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center">
                                  <Package className="w-4 h-4 text-[#6366f1]" />
                                </div>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${(item.quantity || 0) <= 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {(item.quantity || 0) <= 0 ? "Yo'q" : `${item.quantity || 0} ${item.unit || 'dona'}`}
                                </span>
                              </div>
                              <div className="mb-1.5">
                                <h4 className="font-semibold text-slate-800 text-xs truncate leading-tight">{item.productName}</h4>
                                {item.isVariant && <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{item.name}</p>}
                              </div>
                              <p className={`text-xs font-bold leading-tight ${currency === 'usd' ? 'text-emerald-600' : 'text-[#6366f1]'}`}>
                                {currency === 'usd' ? `$${fmt(costPrice)}` : `${fmt(costPrice)} so'm`}
                              </p>
                            </button>
                          );
                        });
                      })}
                    </div>
                  </div>
                )}

                {/* Cart */}
                {cart.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <h3 className="text-sm font-bold text-slate-900">Tanlangan mahsulotlar</h3>
                      <span className="bg-slate-50 text-[#6366f1] px-2.5 py-1 rounded-xl text-xs font-bold">{cart.length} ta</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {cart.map(item => {
                        const isUsd = item.currency === 'usd';
                        const priceLabel = isUsd ? `$${fmt(item.costPrice)}` : `${fmt(item.costPrice)} so'm`;
                        const totalLabel = isUsd
                          ? `$${fmt(item.costPrice * item.quantity)}`
                          : `${fmt(item.costPrice * item.quantity)} so'm`;
                        return (
                          <div key={item.cartId} className="px-4 py-3">
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => (modalMode === 'create' || modalMode === 'edit') && setCart(cart.map(c => c.cartId === item.cartId ? { ...c, quantity: Math.max(1, (parseInt(c.quantity) || 1) - 1) } : c))}
                                disabled={!['create','edit'].includes(modalMode)}
                                className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all disabled:opacity-50"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                disabled={!['create','edit'].includes(modalMode)}
                                onChange={(e) => setCart(cart.map(c => c.cartId === item.cartId ? { ...c, quantity: e.target.value } : c))}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  setCart(cart.map(c => c.cartId === item.cartId ? { ...c, quantity: val } : c));
                                }}
                                className="flex-1 h-11 text-center font-black text-slate-900 text-lg bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:border-[#6366f1] disabled:opacity-70 disabled:bg-slate-100"
                              />
                              <button
                                onClick={() => (modalMode === 'create' || modalMode === 'edit') && setCart(cart.map(c => c.cartId === item.cartId ? { ...c, quantity: (parseInt(c.quantity) || 1) + 1 } : c))}
                                disabled={!['create','edit'].includes(modalMode)}
                                className="w-11 h-11 rounded-2xl bg-[#6366f1] flex items-center justify-center text-white hover:bg-blue-700 active:scale-90 transition-all disabled:opacity-50"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                              {['create','edit'].includes(modalMode) && (
                                <button
                                  onClick={() => removeFromCart(item.cartId)}
                                  className="w-11 h-11 rounded-2xl bg-red-500 flex items-center justify-center text-white hover:bg-red-600 active:scale-90 transition-all"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">To'lov usuli</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] outline-none"
                    >
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>{method.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Izoh (ixtiyoriy)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Xarid haqida izoh..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] outline-none min-h-[70px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-slate-100 bg-white shrink-0">
                <button
                  onClick={handleSave}
                  disabled={isPending || cart.length === 0}
                  className="w-full py-4 bg-[#6366f1] text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Spinner className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
                  {modalMode === 'create' ? 'Xaridni Saqlash' : "O'zgarishlarni Saqlash"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {viewPurchase && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl relative"
            >
              {detailLoading && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-3xl">
                  <Spinner className="w-8 h-8 text-[#6366f1] animate-spin" />
                </div>
              )}
              <div className="flex items-center justify-between p-5 border-b border-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Xarid #{viewPurchase.id}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openEditModal(purchaseDetail || viewPurchase);
                      setViewPurchase(null);
                    }}
                    className="w-8 h-8 bg-slate-50 text-indigo-500 rounded-xl flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewPurchase(null)}
                    className="w-8 h-8 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sana</p>
                <p className="text-sm font-bold text-slate-900 mb-5">
                  {new Date(viewPurchase.created_at).toLocaleString()}
                </p>

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Mahsulotlar</h3>
                <div className="space-y-2 mb-5">
                  {(purchaseDetail || viewPurchase).items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                      <span className="text-sm font-black text-[#6366f1]">{item.quantity} dona</span>
                    </div>
                  ))}
                </div>

                {(purchaseDetail || viewPurchase).note && (
                  <div className="mb-5 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Izoh</p>
                    <p className="text-sm text-orange-800">{(purchaseDetail || viewPurchase).note}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Jami miqdor:</span>
                  <span className="text-xl font-black text-slate-900">
                    {(purchaseDetail || viewPurchase).items?.reduce((s, i) => s + (i.quantity || 0), 0)} dona
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Purchases;
