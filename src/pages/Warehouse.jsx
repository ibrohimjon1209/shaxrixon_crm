import { useState, useEffect, useRef, useMemo } from 'react';
import {
  MagnifyingGlass, Plus, Minus, PencilSimple, Trash, X, Package,
  Check, Spinner, WarningCircle, CaretLeft, CaretRight,
  Stack, CaretRight as ArrowRight
} from '@phosphor-icons/react';
import {
  useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useLowStockProducts,
  useVariants, useCreateVariant, useUpdateVariant, useDeleteVariant
} from '../hooks/useProducts';
import { motion, AnimatePresence } from 'framer-motion';

const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all";

const SearchableCategorySelect = ({ categories, selectedCategoryId, onSelect }) => {
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
    if (!query.trim()) return categories;
    const q = query.toLowerCase().trim();
    return categories.filter(c => (c.name || '').toLowerCase().includes(q));
  }, [categories, query]);

  const selectedCategory = categories.find(c => c.id.toString() === selectedCategoryId?.toString());

  const handleSelect = (categoryId) => {
    onSelect(categoryId);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect('');
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {selectedCategory && !isOpen ? (
        <div
          onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="w-full pl-9 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium text-sm cursor-pointer hover:border-[#6366f1]/40 transition-colors overflow-hidden"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Stack className="text-[#6366f1] w-4 h-4" />
          </div>
          <span className="block truncate">{selectedCategory.name}</span>
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
            placeholder="Kategoriyani qidirish..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] text-slate-900 font-medium text-sm appearance-none outline-none"
          />
        </>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/60 z-50 overflow-hidden"
          >
            <div className="max-h-[220px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-5 text-center text-sm text-slate-400">
                  <MagnifyingGlass className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                  Kategoriya topilmadi
                </div>
              ) : (
                filtered.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c.id.toString())}
                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                      selectedCategoryId?.toString() === c.id.toString()
                        ? 'bg-[#6366f1]/5'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      selectedCategoryId?.toString() === c.id.toString()
                        ? 'bg-[#6366f1] text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {(c.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                    </div>
                    {selectedCategoryId?.toString() === c.id.toString() && (
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

const ProductForm = ({ formData, setFormData, categories, onSubmit, submitLabel, isPending, onDeleteVariant }) => {
  const variantsEndRef = useRef(null);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), { name: '', quantity: '', sale_price: '', cost_price: '', currency: 'uzs', unit: 'dona', is_active: true }]
    });
    setTimeout(() => {
      variantsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const requestRemoveVariant = (variant, index) => {
    if (variant.id) {
      setVariantToDelete({ ...variant, index });
    } else {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: newVariants });
    }
  };

  const confirmRemoveVariant = async () => {
    if (variantToDelete) {
      if (onDeleteVariant) {
        setIsDeletingVariant(true);
        try {
          await onDeleteVariant(variantToDelete.id);
        } catch (error) {
          setIsDeletingVariant(false);
          return;
        }
        setIsDeletingVariant(false);
      }
      const newVariants = formData.variants.filter((_, i) => i !== variantToDelete.index);
      setFormData({ ...formData, variants: newVariants });
      setVariantToDelete(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mahsulot nomi</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Mahsulot nomini kiriting" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Kategoriya</label>
        <SearchableCategorySelect
          categories={categories}
          selectedCategoryId={formData.category}
          onSelect={(id) => setFormData({ ...formData, category: id })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tavsif <span className="text-slate-400 font-normal">(ixtiyoriy)</span></label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className={inputClass + ' resize-none'}
          placeholder="Mahsulot haqida qo'shimcha ma'lumot..."
        />
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Variantlar</h3>
          <button
            type="button"
            onClick={handleAddVariant}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-[#6366f1] rounded-xl text-xs font-bold hover:bg-[#6366f1] hover:text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Qo'shish
          </button>
        </div>

        {!(formData.variants?.length) ? (
          <p className="text-xs text-slate-400 text-center py-3">Variant qo'shilmagan</p>
        ) : (
          <div className="space-y-3">
            {formData.variants.map((variant, idx) => {
              const updateVariant = (field, value) => {
                const newVariants = [...formData.variants];
                newVariants[idx] = { ...newVariants[idx], [field]: value };
                setFormData({ ...formData, variants: newVariants });
              };
              const removeVariant = () => requestRemoveVariant(variant, idx);
              const isUzs = (variant.currency || 'uzs') === 'uzs';
              const symbol = isUzs ? "so'm" : '$';
              const symbolClass = isUzs ? 'text-[#6366f1]' : 'text-emerald-600';
              return (
                <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomi</label>
                    <input value={variant.name || ''} onChange={e => updateVariant('name', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none" placeholder="Masalan: XL, Qizil" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Birlik</label>
                    <select value={variant.unit || 'dona'} onChange={e => updateVariant('unit', e.target.value)} className="w-full h-9 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none">
                      <option value="dona">Dona</option>
                      <option value="kg">Kg</option>
                      <option value="litr">Litr</option>
                      <option value="metr">Metr</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Miqdor</label>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => updateVariant('quantity', Math.max(0, (parseInt(variant.quantity) || 0) - 1))} className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 active:scale-90 transition-all shrink-0">
                        <Minus className="w-4 h-4" />
                      </button>
                      <input type="number" value={variant.quantity || ''} onChange={e => updateVariant('quantity', e.target.value)} className="flex-1 h-9 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#6366f1]" placeholder="0" />
                      <button type="button" onClick={() => updateVariant('quantity', (parseInt(variant.quantity) || 0) + 1)} className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center text-white hover:bg-blue-700 active:scale-90 transition-all shrink-0">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Valyuta</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { updateVariant('currency', 'usd'); }}
                        className={`py-2 rounded-xl font-bold text-xs transition-all ${!isUzs ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        $ (USD)
                      </button>
                      <button
                        type="button"
                        onClick={() => { updateVariant('currency', 'uzs'); }}
                        className={`py-2 rounded-xl font-bold text-xs transition-all ${isUzs ? 'bg-[#6366f1] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        so'm (UZS)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tan narx</label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${symbolClass}`}>{symbol}</span>
                      <input type="number" value={variant.cost_price || ''} onChange={e => updateVariant('cost_price', e.target.value)} className={`w-full py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none ${isUzs ? 'pl-12' : 'pl-7'} pr-3`} placeholder="0" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sotuv narxi</label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${symbolClass}`}>{symbol}</span>
                      <input type="number" value={variant.sale_price || ''} onChange={e => updateVariant('sale_price', e.target.value)} className={`w-full py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none ${isUzs ? 'pl-12' : 'pl-7'} pr-3`} placeholder="0" />
                    </div>
                  </div>

                  <button type="button" onClick={removeVariant} className="w-full py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> O'chirish
                  </button>
                </div>
              );
            })}
            <div ref={variantsEndRef} />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onSubmit} disabled={isPending || !formData.name} className="flex-1 px-4 py-3.5 bg-[#6366f1] text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {isPending && <Spinner className="animate-spin w-4 h-4" />}
          {submitLabel}
        </button>
      </div>

      {variantToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center px-4" onClick={() => setVariantToDelete(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trash className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Variantni o'chirish</h3>
              <p className="text-sm text-slate-500">"{variantToDelete.name}" variantini o'chirmoqchimisiz?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setVariantToDelete(null)} disabled={isDeletingVariant} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200">Bekor</button>
              <button
                onClick={confirmRemoveVariant}
                disabled={isDeletingVariant}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600"
              >
                {isDeletingVariant && <Spinner className="animate-spin w-4 h-4" />}
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VariantForm = ({ formData, setFormData, onSubmit, submitLabel, isPending }) => {
  const isUzs = formData.currency === 'uzs';
  const hasPrice = parseFloat(formData.sale_price || 0) > 0;
  const symbol = isUzs ? "so'm" : '$';
  const symbolClass = isUzs ? 'text-[#6366f1]' : 'text-emerald-600';

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Variant nomi</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Masalan: Qizil, XL, yoki 1KG" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Birlik</label>
        <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className={inputClass}>
          <option value="dona">Dona</option>
          <option value="kg">Kg</option>
          <option value="litr">Litr</option>
          <option value="metr">Metr</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Miqdor</label>
        <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className={inputClass} placeholder="0" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2">Valyuta</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, currency: 'usd', sale_price: '', cost_price: '' })}
            className={`py-2.5 rounded-xl font-bold text-sm transition-all ${!isUzs ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            $ (USD)
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, currency: 'uzs', sale_price: '', cost_price: '' })}
            className={`py-2.5 rounded-xl font-bold text-sm transition-all ${isUzs ? 'bg-[#6366f1] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            so'm (UZS)
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tan narx</label>
        <div className="relative">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${symbolClass}`}>{symbol}</span>
          <input
            type="number"
            value={formData.cost_price}
            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
            className={inputClass + (isUzs ? ' pl-12' : ' pl-7')}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sotuv narxi</label>
        <div className="relative">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${symbolClass}`}>{symbol}</span>
          <input
            type="number"
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
            className={inputClass + (isUzs ? ' pl-12' : ' pl-7')}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onSubmit} disabled={isPending || !formData.name || !hasPrice} className="flex-1 px-4 py-3.5 bg-[#6366f1] text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {isPending && <Spinner className="animate-spin w-4 h-4" />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

const statusConfig = {
  good: { label: 'Yaxshi', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  low: { label: 'Kam', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  critical: { label: 'Tanqis', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

const Warehouse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showCatDeleteConfirm, setShowCatDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showCategoryStats, setShowCategoryStats] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);

  const [variantFormData, setVariantFormData] = useState({
    name: '',
    quantity: '',
    sale_price: '',
    cost_price: '',
    currency: 'usd',
    unit: 'dona',
  });

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image: 'string',
    is_active: true,
    variants: []
  });

  useEffect(() => { setPage(1); }, [searchTerm]);

  const { data: productsData, isLoading: productsLoading } = useProducts({ search: searchTerm, page, ordering: 'quantity' });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: lowStockData } = useLowStockProducts();
  const { data: singleProduct, isLoading: productLoading } = useProduct(selectedProduct?.id);

  useEffect(() => {
    if (singleProduct && showEditModal) {
      setFormData({
        name: singleProduct.name || '',
        category: singleProduct.category?.toString() || '',
        description: singleProduct.description || '',
        image: singleProduct.image || 'string',
        is_active: singleProduct.is_active !== undefined ? singleProduct.is_active : true,
        variants: singleProduct.variants?.map(v => ({
          id: v.id,
          name: v.name || '',
          quantity: v.quantity || '',
          sale_price: v.sale_price || '',
          cost_price: v.cost_price || '',
          currency: v.currency || 'uzs',
          unit: v.unit || 'dona',
        })) || [],
      });
    }
  }, [singleProduct, showEditModal]);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createVariantMutation = useCreateVariant();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();

  const products = productsData?.results || [];
  const categories = categoriesData?.results || [];
  const totalProductPages = productsData?.count ? Math.ceil(productsData.count / 20) : 1;

  const totalProductCount = productsData?.count ?? products.length;
  const lowStockRaw = lowStockData?.results || lowStockData || [];
  const lowStockCount = Array.isArray(lowStockRaw) ? lowStockRaw.length : 0;

  const categoryStats = categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.product_count ?? 0,
    quantity: parseInt(c.total_quantity) || 0,
    saleUzs: parseFloat(c.total_sale_price_uzs) || 0,
    saleUsd: parseFloat(c.total_sale_price_usd) || 0,
    costUzs: parseFloat(c.total_cost_price_uzs) || 0,
    costUsd: parseFloat(c.total_cost_price_usd) || 0,
    lowStock: 0,
  })).sort((a, b) => a.quantity - b.quantity);

  const categoryTotals = categoryStats.reduce((acc, c) => {
    acc.qty += c.quantity;
    acc.saleUzs += c.saleUzs; acc.saleUsd += c.saleUsd;
    acc.costUzs += c.costUzs; acc.costUsd += c.costUsd;
    return acc;
  }, { qty: 0, saleUzs: 0, saleUsd: 0, costUzs: 0, costUsd: 0 });

  // Drill-down: tanlangan kategoriyaning mahsulotlari
  const { data: catProductsData, isLoading: catProductsLoading } = useProducts(
    selectedCategory ? { category: selectedCategory.id, ordering: 'quantity' } : {}
  );

  const catSaleUzs = selectedCategory?.saleUzs || 0;
  const catSaleUsd = selectedCategory?.saleUsd || 0;
  const catCostUzs = selectedCategory?.costUzs || 0;
  const catCostUsd = selectedCategory?.costUsd || 0;

  const getStatusCfg = (status) => statusConfig[status] || statusConfig.good;

  const buildProductPayload = () => {
    const payload = {
      name: formData.name,
      category: formData.category ? parseInt(formData.category) : null,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
    };
    if (formData.description) {
      payload.description = formData.description;
    }
    if (formData.variants && formData.variants.length > 0) {
      payload.variants = formData.variants.map(v => ({
        ...(v.id ? { id: v.id } : {}),
        name: v.name || '',
        cost_price: v.cost_price || '0',
        sale_price: v.sale_price || '0',
        currency: v.currency || 'uzs',
        quantity: parseInt(v.quantity) || 0,
        unit: v.unit || 'dona',
        is_active: true
      }));
    }
    return payload;
  };

  const handleAddProduct = async () => {
    try {
      await createProductMutation.mutateAsync(buildProductPayload());
      setShowAddModal(false);
      resetForm();
    } catch (error) {}
  };

  const handleEditProduct = async () => {
    try {
      await updateProductMutation.mutateAsync({ id: selectedProduct.id, data: buildProductPayload() });
      setShowEditModal(false);
      resetForm();
    } catch (error) {}
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {}
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category?.toString() || '',
      description: product.description || '',
      image: product.image || 'string',
      is_active: product.is_active !== undefined ? product.is_active : true,
      variants: product.variants?.map(v => ({
        id: v.id,
        name: v.name || '',
        quantity: v.quantity || '',
        sale_price: v.sale_price || '',
        cost_price: v.cost_price || '',
        currency: v.currency || 'uzs',
        unit: v.unit || 'dona',
      })) || [],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', description: '', image: 'string', is_active: true, variants: [] });
    setSelectedProduct(null);
  };

  const handleAddCategory = async () => {
    if (newCategory) {
      try {
        await createCategoryMutation.mutateAsync({ name: newCategory });
        setNewCategory('');
      } catch (error) {}
    }
  };

  const handleDeleteCategory = (cat) => {
    setCategoryToDelete(cat);
    setShowCatDeleteConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      setShowCatDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (error) {}
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setEditValue(cat.name);
  };

  const handleUpdateCategory = async () => {
    if (editValue && editValue !== editingCategory.name) {
      try {
        await updateCategoryMutation.mutateAsync({ id: editingCategory.id, data: { name: editValue } });
        setEditingCategory(null);
      } catch (error) {}
    } else {
      setEditingCategory(null);
    }
  };

  const buildVariantPayload = () => {
    const payload = {
      product: selectedProduct?.id,
      name: variantFormData.name,
      quantity: parseInt(variantFormData.quantity) || 0,
      sale_price: variantFormData.sale_price || '0',
      currency: variantFormData.currency,
      unit: variantFormData.unit,
    };
    if (parseFloat(variantFormData.cost_price) > 0) {
      payload.cost_price = variantFormData.cost_price;
    }
    return payload;
  };

  const resetVariantForm = () => {
    setVariantFormData({ name: '', quantity: '', sale_price: '', cost_price: '', currency: 'uzs', unit: 'dona' });
    setSelectedVariant(null);
  };

  const handleAddVariant = async () => {
    try {
      await createVariantMutation.mutateAsync(buildVariantPayload());
      setShowAddVariantModal(false);
      resetVariantForm();
    } catch (error) {}
  };

  const handleEditVariant = async () => {
    try {
      await updateVariantMutation.mutateAsync({ id: selectedVariant.id, data: buildVariantPayload() });
      setShowEditVariantModal(false);
      resetVariantForm();
    } catch (error) {}
  };

  const handleDeleteVariant = async () => {
    try {
      await deleteVariantMutation.mutateAsync(selectedVariant.id);
      setShowDeleteVariantModal(false);
      setSelectedVariant(null);
    } catch (error) {}
  };

  const openAddVariantModal = (product) => {
    setSelectedProduct(product);
    resetVariantForm();
    setShowAddVariantModal(true);
  };

  const openEditVariantModal = (product, variant) => {
    setSelectedProduct(product);
    setSelectedVariant(variant);
    setVariantFormData({
      name: variant.name || '',
      quantity: variant.quantity?.toString() || '0',
      sale_price: variant.sale_price || '',
      cost_price: variant.cost_price || '',
      currency: variant.currency || 'uzs',
      unit: variant.unit || 'dona',
    });
    setShowEditVariantModal(true);
  };

  const openDeleteVariantModal = (variant) => {
    setSelectedVariant(variant);
    setShowDeleteVariantModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 md:pb-8">
      {/* White header */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="px-5 md:px-8 py-5 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Ombor</h1>
              <p className="text-xs text-slate-400 mt-0.5">Mahsulotlar va zaxiralar</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-3 py-5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Kategoriyalar
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-5 bg-[#6366f1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Qo'shish
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Jami mahsulotlar</p>
              <p className="text-xl font-black text-blue-700">{totalProductCount}</p>
            </div>
            <div className={`rounded-2xl p-3 border ${lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Kam qolgan</p>
              <p className={`text-xl font-black ${lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{lowStockCount}</p>
            </div>
          </div>

          {/* Category stats button */}
          <button
            onClick={() => setShowCategoryStats(true)}
            className="w-full mb-4 flex items-center gap-3 bg-gradient-to-r from-[#6366f1] to-[#4338ca] text-white rounded-2xl px-4 py-3 shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
          >
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <Stack className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold leading-tight">Kategoriyalar bo'yicha</p>
              <p className="text-[11px] text-slate-200">{categoryStats.length} ta kategoriya • {categoryTotals.qty.toLocaleString()} dona qoldiq</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-200 shrink-0" />
          </button>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Mahsulotlarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl text-sm border border-slate-100 focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 md:px-8 py-4 max-w-6xl mx-auto">
        {productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="w-8 h-8 text-[#6366f1] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Mahsulot topilmadi</h3>
            <p className="text-slate-400 text-sm text-center max-w-[220px]">
              {searchTerm ? `"${searchTerm}" bo'yicha topilmadi` : 'Hali mahsulot qo\'shilmagan'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-5 px-6 py-3 bg-[#6366f1] text-white rounded-2xl font-bold flex items-center gap-2 shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" /> Mahsulot qo'shish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {products.map((product) => {
              const sc = getStatusCfg(product.status);
              const variants = product.variants || [];
              const isExpanded = expandedProductId === product.id;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden"
                >
                  {/* Top row: status dot + name + actions */}
                  <div className="px-4 pt-3.5 pb-2.5 flex items-start gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${sc.dot}`} />
                    <h3 className="text-sm font-bold text-slate-900 flex-1 leading-snug">{product.name}</h3>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(product)}
                        className="w-8 h-8 bg-slate-50 text-[#6366f1] rounded-xl flex items-center justify-center hover:bg-[#6366f1] hover:text-white transition-all"
                      >
                        <PencilSimple className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="w-8 h-8 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges + total quantity */}
                  <div className="px-4 pb-2.5 flex items-center gap-2 flex-wrap pl-9">
                    {product.category_name && (
                      <span className="text-[9px] font-semibold text-indigo-500 bg-slate-50 px-1.5 py-0.5 rounded-lg">{product.category_name}</span>
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    <div className="ml-auto bg-slate-50 rounded-xl px-2.5 py-1 text-center">
                      <p className="text-sm font-black text-slate-900 leading-tight">{product.total_quantity ?? product.quantity ?? 0}</p>
                      <p className="text-[9px] text-slate-400">jami</p>
                    </div>
                  </div>

                  {/* Variants toggle */}
                  <button
                    onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                    className="mx-3 mb-2.5 flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-500 hover:bg-indigo-50 hover:text-[#6366f1] transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Stack className="w-3.5 h-3.5" />
                      {variants.length} ta variant
                    </span>
                    <CaretRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Expanded variant list */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {variants.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-3">Variant yo'q</p>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {variants.map((v) => {
                            const vSc = getStatusCfg(v.status);
                            const isUsd = (v.currency || 'uzs').toLowerCase() === 'usd';
                            const price = parseFloat(v.sale_price || 0);
                            return (
                              <div key={v.id} className="flex items-center gap-2.5 px-4 py-2.5">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${vSc.dot}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">{v.name}</p>
                                </div>
                                <p className={`text-xs font-bold shrink-0 ${isUsd ? 'text-emerald-600' : 'text-[#6366f1]'}`}>
                                  {isUsd ? `$${price.toLocaleString()}` : `${price.toLocaleString()} so'm`}
                                </p>
                                <div className="text-center shrink-0 bg-slate-50 rounded-lg px-2 py-0.5">
                                  <p className="text-xs font-black text-slate-900">{v.quantity}</p>
                                  <p className="text-[9px] text-slate-400">{v.unit || 'dona'}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button onClick={() => openEditVariantModal(product, v)} className="w-6 h-6 text-[#6366f1] bg-slate-50 rounded-lg flex items-center justify-center hover:bg-[#6366f1] hover:text-white transition-all">
                                    <PencilSimple className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => openDeleteVariantModal(v)} className="w-6 h-6 text-red-400 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <Trash className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="p-3 pt-1">
                        <button
                          onClick={() => openAddVariantModal(product)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-[#6366f1] rounded-xl text-xs font-bold hover:bg-[#6366f1] hover:text-white transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Variant qo'shish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalProductPages > 1 && (
          <div className="flex items-center justify-between mt-4 bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1 || productsLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-[#6366f1] hover:text-white transition-all disabled:opacity-30"
            >
              <CaretLeft className="w-4 h-4" /> Oldingi
            </button>
            <span className="text-sm font-bold text-slate-600">
              {page} / {totalProductPages}
              <span className="font-normal text-slate-400 ml-1.5">({productsData?.count} ta mahsulot)</span>
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalProductPages || productsLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-[#6366f1] hover:text-white transition-all disabled:opacity-30"
            >
              Keyingi <CaretRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end md:items-center md:justify-center md:p-6" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl max-h-[90vh] md:max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Mahsulot qo'shish</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ProductForm formData={formData} setFormData={setFormData} categories={categories} onSubmit={handleAddProduct} submitLabel="Saqlash" isPending={createProductMutation.isPending} onDeleteVariant={(id) => deleteVariantMutation.mutateAsync(id)} />
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end md:items-center md:justify-center md:p-6" onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl max-h-[90vh] md:max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Mahsulotni tahrirlash</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            {productLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <Spinner className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Ma'lumotlar yuklanmoqda...</p>
              </div>
            ) : (
              <ProductForm formData={formData} setFormData={setFormData} categories={categories} onSubmit={handleEditProduct} submitLabel="Yangilash" isPending={updateProductMutation.isPending} onDeleteVariant={(id) => deleteVariantMutation.mutateAsync(id)} />
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trash className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Mahsulotni o'chirish</h3>
              <p className="text-sm text-slate-500">"{selectedProduct?.name}" mahsulotini o'chirmoqchimisiz?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm">
                Bekor
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleteProductMutation.isPending}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600"
              >
                {deleteProductMutation.isPending && <Spinner className="animate-spin w-4 h-4" />}
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Stats Modal */}
      {showCategoryStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end md:items-center md:justify-center" onClick={() => { setShowCategoryStats(false); setSelectedCategory(null); }}>
          <div className="bg-[#f8fafc] rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] px-5 pt-6 pb-5 shrink-0 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedCategory ? (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center text-white hover:bg-white/25 transition-colors shrink-0"
                    >
                      <CaretLeft className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
                      <Stack className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-white text-lg font-bold leading-tight truncate">
                      {selectedCategory ? selectedCategory.name : "Kategoriyalar bo'yicha"}
                    </h2>
                    <p className="text-slate-200 text-xs truncate">
                      {selectedCategory
                        ? `${selectedCategory.count} ta mahsulot • ${selectedCategory.quantity.toLocaleString()} dona`
                        : `${categoryStats.length} ta kategoriya • ${categoryTotals.qty.toLocaleString()} dona`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCategoryStats(false); setSelectedCategory(null); }}
                  className="w-9 h-9 bg-white/15 text-white rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            {selectedCategory ? (
              /* ── Drill-down: tanlangan kategoriya mahsulotlari ── */
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Category value summary */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider mb-1.5">Sotuv summasi</p>
                      {catSaleUsd > 0 && <p className="text-sm font-black text-emerald-600">${catSaleUsd.toLocaleString()}</p>}
                      {catSaleUzs > 0 && <p className="text-sm font-black text-[#6366f1]">{catSaleUzs.toLocaleString()} so'm</p>}
                      {!catSaleUzs && !catSaleUsd && <p className="text-sm font-black text-slate-300">—</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1.5">Tan narx summasi</p>
                      {catCostUsd > 0 && <p className="text-sm font-black text-orange-500">${catCostUsd.toLocaleString()}</p>}
                      {catCostUzs > 0 && <p className="text-sm font-black text-orange-600">{catCostUzs.toLocaleString()} so'm</p>}
                      {!catCostUzs && !catCostUsd && <p className="text-sm font-black text-slate-300">—</p>}
                    </div>
                  </div>
                </div>

                {/* Products in category */}
                {catProductsLoading ? (
                  <div className="py-10 flex justify-center"><Spinner className="w-7 h-7 text-[#6366f1] animate-spin" /></div>
                ) : (catProductsData?.results || []).length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Mahsulot topilmadi</p>
                  </div>
                ) : (catProductsData?.results || []).map((p) => {
                  const sc = getStatusCfg(p.status);
                  const firstVariant = (p.variants || [])[0];
                  const isUsd = firstVariant ? (firstVariant.currency || 'uzs').toLowerCase() === 'usd' : false;
                  const salePrice = parseFloat(firstVariant?.sale_price || 0);
                  const unit = firstVariant?.unit || 'dona';
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setShowCategoryStats(false); setSelectedCategory(null); openEditModal(p); }}
                      className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center gap-3 text-left hover:border-[#6366f1] active:scale-[0.99] transition-all"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                        {salePrice > 0 && (
                          <p className={`text-xs font-bold ${isUsd ? 'text-emerald-600' : 'text-[#6366f1]'}`}>
                            {isUsd ? `$${salePrice.toLocaleString()}` : `${salePrice.toLocaleString()} so'm`}
                            {(p.variants || []).length > 1 && <span className="text-slate-400 font-normal ml-1">dan</span>}
                          </p>
                        )}
                      </div>
                      <div className="text-center shrink-0 bg-slate-50 rounded-xl px-2.5 py-1">
                        <p className="text-sm font-black text-slate-900 leading-tight">{(p.total_quantity ?? 0).toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400">{unit}</p>
                      </div>
                      <PencilSimple className="w-4 h-4 text-slate-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              /* ── Kategoriyalar ro'yxati + umumiy summa ── */
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {/* Grand total */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Jami ombor summasi</p>
                  <div className="space-y-2">
                    {/* Sotuv row */}
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sotuv</p>
                      <div className="flex items-center gap-3">
                        {categoryTotals.saleUsd > 0 && <p className="text-base font-black text-emerald-600">${categoryTotals.saleUsd.toLocaleString()}</p>}
                        {categoryTotals.saleUzs > 0 && <p className="text-sm font-bold text-[#6366f1]">{categoryTotals.saleUzs.toLocaleString()} so'm</p>}
                        {!categoryTotals.saleUzs && !categoryTotals.saleUsd && <p className="text-base font-black text-slate-300">—</p>}
                      </div>
                    </div>
                    {/* Tan narx row */}
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tan narx</p>
                      <div className="flex items-center gap-3">
                        {categoryTotals.costUsd > 0 && <p className="text-base font-black text-orange-500">${categoryTotals.costUsd.toLocaleString()}</p>}
                        {categoryTotals.costUzs > 0 && <p className="text-sm font-bold text-orange-600">{categoryTotals.costUzs.toLocaleString()} so'm</p>}
                        {!categoryTotals.costUzs && !categoryTotals.costUsd && <p className="text-base font-black text-slate-300">—</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {categoryStats.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Stack className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Kategoriya topilmadi</p>
                  </div>
                ) : categoryStats.map((cat) => {
                  const isEmpty = cat.quantity <= 0;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat)}
                      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 text-left hover:border-[#6366f1] active:scale-[0.99] transition-all"
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${cat.lowStock > 0 || isEmpty ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-[#6366f1]'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{cat.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-indigo-500 bg-slate-50 px-1.5 py-0.5 rounded-lg">{cat.count} ta</span>
                          {cat.saleUsd > 0 && <span className="text-[10px] font-bold text-emerald-600">${cat.saleUsd.toLocaleString()}</span>}
                          {cat.saleUzs > 0 && <span className="text-[10px] font-bold text-[#6366f1]">{cat.saleUzs.toLocaleString()} so'm</span>}
                          {cat.lowStock > 0 && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                              <WarningCircle className="w-2.5 h-2.5" /> {cat.lowStock}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-1.5">
                        <div>
                          <p className={`text-lg font-black leading-tight ${isEmpty ? 'text-red-500' : 'text-slate-900'}`}>{cat.quantity.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400">dona</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[70] flex items-center justify-center px-4" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Kategoriyalar</h2>
                <p className="text-xs text-slate-400 mt-0.5">Mahsulot turlarini boshqarish</p>
              </div>
              <button
                onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}
                className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Yangi kategoriya nomi..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]"
              />
              <button
                onClick={handleAddCategory}
                disabled={createCategoryMutation.isPending}
                className="px-4 py-2.5 bg-[#6366f1] text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {createCategoryMutation.isPending ? <Spinner className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner className="animate-spin text-slate-400" />
                </div>
              ) : categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                  {editingCategory?.id === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateCategory}
                        disabled={updateCategoryMutation.isPending}
                        className="w-7 h-7 bg-[#6366f1] text-white rounded-lg flex items-center justify-center"
                      >
                        {updateCategoryMutation.isPending ? <Spinner className="animate-spin w-3 h-3" /> : <Check className="w-3 h-3" />}
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-slate-700">
                        {cat.name} <span className="text-[10px] text-slate-400">({cat.product_count})</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleStartEdit(cat)} className="w-7 h-7 text-slate-400 hover:text-[#6366f1] hover:bg-slate-50 rounded-lg transition-all flex items-center justify-center">
                          <PencilSimple className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat)} className="w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirm */}
      {showCatDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80] flex items-center justify-center px-4" onClick={() => setShowCatDeleteConfirm(false)}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <WarningCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Kategoriyani o'chirish?</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                <span className="font-bold text-slate-700">"{categoryToDelete?.name}"</span> kategoriyasini o'chirmoqchimisiz?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCatDeleteConfirm(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm"
                >
                  Yo'q
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  disabled={deleteCategoryMutation.isPending}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600"
                >
                  {deleteCategoryMutation.isPending && <Spinner className="animate-spin w-4 h-4" />}
                  Ha, o'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Variant Modal */}
      {showAddVariantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end md:items-center md:justify-center md:p-6" onClick={() => { setShowAddVariantModal(false); resetVariantForm(); }}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl max-h-[90vh] md:max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Variant qo'shish</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedProduct?.name}</p>
              </div>
              <button onClick={() => { setShowAddVariantModal(false); resetVariantForm(); }} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <VariantForm formData={variantFormData} setFormData={setVariantFormData} onSubmit={handleAddVariant} submitLabel="Saqlash" isPending={createVariantMutation.isPending} />
          </div>
        </div>
      )}

      {/* Edit Variant Modal */}
      {showEditVariantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end md:items-center md:justify-center md:p-6" onClick={() => { setShowEditVariantModal(false); resetVariantForm(); }}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl max-h-[90vh] md:max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Variant tahrirlash</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedProduct?.name} › {selectedVariant?.name}</p>
              </div>
              <button onClick={() => { setShowEditVariantModal(false); resetVariantForm(); }} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <VariantForm formData={variantFormData} setFormData={setVariantFormData} onSubmit={handleEditVariant} submitLabel="Yangilash" isPending={updateVariantMutation.isPending} />
          </div>
        </div>
      )}

      {/* Delete Variant Confirmation */}
      {showDeleteVariantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4" onClick={() => setShowDeleteVariantModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trash className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Variantni o'chirish</h3>
              <p className="text-sm text-slate-500">"{selectedVariant?.name}" variantini o'chirmoqchimisiz?</p>
              <p className="text-xs text-slate-400 mt-1">Bu amal variantni nofaol qiladi.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteVariantModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm">Bekor</button>
              <button
                onClick={handleDeleteVariant}
                disabled={deleteVariantMutation.isPending}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600"
              >
                {deleteVariantMutation.isPending && <Spinner className="animate-spin w-4 h-4" />}
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouse;
