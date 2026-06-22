import { useState, useEffect } from 'react';
import {
  Plus, Minus, MagnifyingGlass, Package, Truck, X, Check,
  Spinner, Trash, PencilSimple, CaretRight
} from '@phosphor-icons/react';
import { usePurchases, usePurchaseDetail, useCreatePurchase, useUpdatePurchase, useDeletePurchase } from '../hooks/usePurchases';
import { useProducts } from '../hooks/useProducts';
import { toast } from 'react-toastify';
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

const fmt = (num) => parseFloat(num || 0).toLocaleString('uz-UZ');

const Purchases = () => {
  const [viewPurchase, setViewPurchase] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editPurchaseId, setEditPurchaseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [note, setNote] = useState('');

  // Variant selection (same pattern as Sotuv)
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);

  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const { data: purchasesData, isLoading: purchasesLoading } = usePurchases();
  const { data: purchaseDetail, isLoading: detailLoading } = usePurchaseDetail(viewPurchase?.id);
  const { data: productsData } = useProducts({ search: productSearch });

  const createPurchaseMutation = useCreatePurchase();
  const updatePurchaseMutation = useUpdatePurchase();
  const deletePurchaseMutation = useDeletePurchase();

  const purchases = purchasesData?.results || [];
  const products = productsData?.results || [];

  const filteredPurchases = searchTerm
    ? purchases.filter(p => p.id?.toString().includes(searchTerm))
    : purchases;

  const handleProductClick = (product) => {
    if (product.has_variants && product.variants?.length > 0) {
      if (product.variants.length === 1) {
        addToCart(product, product.variants[0]);
      } else {
        setSelectedProductForVariants(product);
        setShowVariantModal(true);
      }
    } else {
      addToCart(product, null);
    }
  };

  const addToCart = (product, variant = null) => {
    const cartId = variant ? `v-${variant.id}` : `p-${product.id}`;
    const existing = cart.find(item => item.cartId === cartId);

    if (existing) {
      setCart(cart.map(item =>
        item.cartId === cartId ? { ...item, quantity: (parseInt(item.quantity, 10) || 0) + 1 } : item
      ));
    } else {
      const isUzs = variant
        ? (variant.currency || 'uzs').toLowerCase() === 'uzs'
        : (product.currency || 'uzs').toLowerCase() === 'uzs';
      const rawCost = variant ? variant.cost_price : product.cost_price;
      const rawSale = variant ? variant.sale_price : product.sale_price;
      const costPrice = parseFloat(rawCost || 0) > 0 ? parseFloat(rawCost) : parseFloat(rawSale || 0);
      setCart([...cart, {
        cartId,
        productId: product.id,
        variantId: variant ? variant.id : null,
        productName: product.name,
        variantName: variant ? variant.name : null,
        name: variant ? `${product.name} (${variant.name})` : product.name,
        quantity: 1,
        costPrice,
        currency: isUzs ? 'uzs' : 'usd',
      }]);
    }
    if (variant) setShowVariantModal(false);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const openCreateModal = () => {
    setCart([]);
    setNote('');
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
    setEditPurchaseId(purchase.id);
    setModalMode('edit');
  };

  const handleSave = async () => {
    if (modalMode === 'create' && cart.length === 0) {
      toast.error('Kamida bitta mahsulot tanlang');
      return;
    }
    try {
      const total_uzs = cart.reduce((sum, item) => item.currency === 'uzs' ? sum + (item.quantity * item.costPrice) : sum, 0);
      const total_usd = cart.reduce((sum, item) => item.currency === 'usd' ? sum + (item.quantity * item.costPrice) : sum, 0);
      const data = {
        items: cart.map(item => ({
          product: item.productId,
          ...(item.variantId ? { variant: item.variantId } : {}),
          quantity: parseInt(item.quantity, 10) || 1,
          cost_price: parseFloat(item.costPrice || 0).toFixed(2),
          currency: item.currency || 'uzs'
        })),
        total_uzs: total_uzs.toFixed(2),
        total_usd: total_usd.toFixed(2),
        note
      };

      if (modalMode === 'create') {
        await createPurchaseMutation.mutateAsync(data);
      } else {
        await updatePurchaseMutation.mutateAsync({ id: editPurchaseId, data });
      }
      setModalMode(null);
    } catch { }
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

        {/* Purchase list (tarix) */}
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
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(purchase.created_at).toLocaleDateString()} • {purchase.item_count ?? 0} ta mahsulot
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(purchase); }}
                      className="w-8 h-8 bg-slate-50 text-indigo-500 rounded-lg flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <PencilSimple className="w-3.5 h-3.5" />
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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col justify-end md:items-center md:justify-center md:p-6"
          >
            <motion.div
              initial={isDesktop ? { opacity: 0, scale: 0.95, y: 0 } : { y: '100%' }}
              animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
              exit={isDesktop ? { opacity: 0, scale: 0.95, y: 0 } : { y: '100%' }}
              transition={isDesktop ? { duration: 0.2, ease: 'easeOut' } : { type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-[#f8fafc] rounded-t-3xl md:rounded-3xl w-full max-w-4xl mx-auto h-[92vh] md:h-auto md:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
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
                {/* Product search + grid */}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[320px] md:max-h-[380px] overflow-y-auto pr-1">
                    {products.map((product) => {
                      const isUzsProduct = (product.currency || 'uzs').toLowerCase() === 'uzs';
                      const rawCost = product.cost_price;
                      const rawSale = product.sale_price;
                      const costPrice = parseFloat(rawCost || 0) > 0 ? parseFloat(rawCost) : parseFloat(rawSale || 0);
                      const costUzs = isUzsProduct ? costPrice : 0;
                      const costUsd = !isUzsProduct ? costPrice : 0;

                      return (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="group cursor-pointer bg-white rounded-2xl p-3 border border-slate-100 hover:border-[#6366f1] hover:shadow-md active:scale-95 transition-all text-left"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center">
                              <Package className="w-4 h-4 text-[#6366f1]" />
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${(product.total_quantity ?? product.quantity ?? 0) <= 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                              {(product.total_quantity ?? product.quantity ?? 0)} {product.has_variants ? 'jami' : (product.unit || 'dona')}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-800 text-xs mb-1.5 truncate leading-tight">{product.name}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              {product.has_variants ? (
                                product.variants?.length === 1 ? (
                                  <p className="text-slate-500 font-bold text-[10px] leading-tight truncate">{product.variants[0].name}</p>
                                ) : (
                                  <p className="text-slate-500 font-bold text-[10px] leading-tight">
                                    {product.variant_count} ta variant
                                  </p>
                                )
                              ) : (
                                <>
                                  {costUzs > 0 && <p className="text-[#6366f1] font-bold text-xs leading-tight">{costUzs.toLocaleString()} so'm</p>}
                                  {costUsd > 0 && <p className="text-emerald-600 font-bold text-xs leading-tight">${costUsd.toLocaleString()}</p>}
                                </>
                              )}
                            </div>
                            <div className="w-6 h-6 bg-slate-50 text-[#6366f1] rounded-lg flex items-center justify-center group-hover:bg-[#6366f1] group-hover:text-white transition-colors">
                              {product.has_variants && product.variants?.length !== 1 ? <CaretRight className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-[#6366f1] bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 z-10">
                      {cart.length} ta
                    </span>
                    <div className="divide-y divide-slate-50">
                      {cart.map(item => {
                        const isUsd = item.currency === 'usd';
                        const priceLabel = isUsd ? `$${fmt(item.costPrice)}` : `${fmt(item.costPrice)} so'm`;
                        const totalLabel = isUsd
                          ? `$${fmt(item.costPrice * item.quantity)}`
                          : `${fmt(item.costPrice * item.quantity)} so'm`;
                        return (
                          <div key={item.cartId} className="px-4 pt-3 pb-2.5">
                            <div className="flex items-start justify-between mb-1.5 pr-10">
                              <div className="flex-1 min-w-0 pr-2">
                                <h4 className="font-bold text-slate-900 text-sm truncate leading-tight">{item.productName || item.name}</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {item.variantName && <span className="mr-1">{item.variantName} ·</span>}
                                  {priceLabel} × {item.quantity}
                                </p>
                              </div>
                              <p className={`text-sm font-black shrink-0 ${isUsd ? 'text-emerald-600' : 'text-[#6366f1]'}`}>{totalLabel}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCart(cart.map(c => c.cartId === item.cartId ? { ...c, quantity: Math.max(1, (parseInt(c.quantity, 10) || 1) - 1) } : c))}
                                className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-300 active:scale-90 transition-all shrink-0"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <span className="w-8 text-center font-black text-slate-900 text-base select-none">{item.quantity}</span>
                              <button
                                onClick={() => setCart(cart.map(c => c.cartId === item.cartId ? { ...c, quantity: (parseInt(c.quantity, 10) || 1) + 1 } : c))}
                                className="w-12 h-12 rounded-xl bg-[#6366f1] flex items-center justify-center text-white hover:bg-blue-700 active:scale-90 transition-all shrink-0"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.cartId)}
                                className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white hover:bg-red-600 active:scale-90 transition-all shrink-0 ml-auto"
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

                {/* Note */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Izoh (ixtiyoriy)..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] outline-none min-h-[70px] resize-none"
                  />
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

      {/* Variant Selection Modal — Sotuvdagi bilan bir xil */}
      <AnimatePresence>
        {showVariantModal && selectedProductForVariants && (
          <motion.div
            variants={backdropVariants} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-end md:items-center md:justify-center md:p-6"
            onClick={() => setShowVariantModal(false)}
          >
            <motion.div
              variants={isDesktop
                ? { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } }, exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } } }
                : modalVariants}
              initial="hidden" animate="visible" exit="exit"
              className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
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
                  const rawCost = variant.cost_price;
                  const rawSale = variant.sale_price;
                  const costPrice = parseFloat(rawCost || 0) > 0 ? parseFloat(rawCost) : parseFloat(rawSale || 0);
                  return (
                    <div
                      key={variant.id}
                      onClick={() => addToCart(selectedProductForVariants, variant)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-[#6366f1] bg-white cursor-pointer hover:shadow-sm transition-all"
                    >
                      <div className="min-w-0 pr-3">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{variant.name}</h4>
                        {variant.barcode && <p className="text-[10px] text-slate-400 mt-0.5">{variant.barcode}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold ${isUsd ? 'text-emerald-600' : 'text-[#6366f1]'}`}>
                            {isUsd ? `$${costPrice.toLocaleString()}` : `${costPrice.toLocaleString()} so'm`}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] font-semibold text-slate-500">Qoldiq: {variant.quantity} {variant.unit}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 text-[#6366f1]">
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

      {/* View Detail Modal */}
      <AnimatePresence>
        {viewPurchase && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-3xl w-full max-w-lg md:max-w-3xl max-h-[85vh] md:max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl relative"
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
                    <PencilSimple className="w-4 h-4" />
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
                      <p className="text-sm font-bold text-slate-900">
                        {item.product_name}
                        {item.variant_name && <span className="text-slate-400 font-normal"> ({item.variant_name})</span>}
                      </p>
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
