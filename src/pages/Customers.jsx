import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Plus, MagnifyingGlass, Phone, Pencil,
  Trash, ChatCircle, FileText, X, CheckCircle,
  MapPin, Calendar, CreditCard, Spinner, Users,
  CaretDown, CaretUp
} from '@phosphor-icons/react';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { useCustomers, useCustomer, useDebtors, useCustomerSalesHistory, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, usePayDebt, useSendDebtReminder } from '../hooks/useCustomers';
import { toast } from 'react-toastify';
import { formatPhoneNumber, cleanPhoneNumber } from '../utils/phoneFormat';

const statusConfig = {
  active: { label: 'Faol', border: 'border-l-indigo-500', badge: 'bg-slate-50 text-indigo-600' },
  vip: { label: 'VIP', border: 'border-l-amber-400', badge: 'bg-amber-50 text-amber-600' },
  debtor: { label: 'Qarzdor', border: 'border-l-red-500', badge: 'bg-red-50 text-red-600' },
  inactive: { label: 'Nofaol', border: 'border-l-slate-400', badge: 'bg-slate-50 text-slate-500' },
};

const hasAnyDebt = (c) => parseFloat(c?.debt_uzs || 0) > 0 || parseFloat(c?.debt_usd || 0) > 0;

const getStatusConfig = (customer) => {
  return statusConfig[customer.status] || statusConfig.active;
};

const SWIPE_THRESHOLD = 75;

const SwipeableCustomerCard = ({ customer, onClick, onEdit, onDelete }) => {
  const sc = getStatusConfig(customer);
  const hasDebt = hasAnyDebt(customer);
  const debtUzs = parseFloat(customer.debt_uzs || 0);
  const debtUsd = parseFloat(customer.debt_usd || 0);
  const x = useMotionValue(0);

  const editOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const editScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.7, 1]);
  const deleteScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0.7]);

  const snapBack = () => animate(x, 0, { type: 'spring', stiffness: 500, damping: 38, mass: 0.6 });

  const handleDragEnd = (_, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      snapBack();
      onEdit(customer);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      snapBack();
      onDelete(customer.id);
    } else {
      snapBack();
    }
  };

  return (
    <div className="relative mb-3 overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex justify-between items-center rounded-2xl pointer-events-none">
        <motion.div
          style={{ opacity: editOpacity }}
          className="w-1/2 h-full bg-gradient-to-r from-[#6366f1] to-blue-400 flex items-center justify-start pl-6 rounded-l-2xl"
        >
          <motion.div style={{ scale: editScale }} className="flex flex-col items-center">
            <div className="bg-white/20 p-2.5 rounded-full mb-1">
              <Pencil className="text-white w-4 h-4" />
            </div>
            <span className="text-[10px] text-white font-bold">Tahrir</span>
          </motion.div>
        </motion.div>
        <motion.div
          style={{ opacity: deleteOpacity }}
          className="w-1/2 h-full bg-gradient-to-l from-red-500 to-red-400 flex items-center justify-end pr-6 rounded-r-2xl"
        >
          <motion.div style={{ scale: deleteScale }} className="flex flex-col items-center">
            <div className="bg-white/20 p-2.5 rounded-full mb-1">
              <Trash className="text-white w-4 h-4" />
            </div>
            <span className="text-[10px] text-white font-bold">O'chirish</span>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -110, right: 110 }}
        dragElastic={0.08}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        className={`relative bg-white rounded-2xl shadow-sm border-l-4 ${sc.border} z-10 cursor-grab select-none`}
        onClick={() => onClick(customer)}
      >
        <div className="flex items-center gap-3 p-4">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 ${customer.status === 'vip' ? 'bg-gradient-to-br from-amber-400 to-amber-500' : 'bg-gradient-to-br from-[#6366f1] to-[#4338ca]'}`}>
            {customer.name ? customer.name.charAt(0).toUpperCase() : 'M'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-sm text-slate-900 truncate">{customer.name}</h3>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Phone className="w-3 h-3" />
              <span>{customer.phone}</span>
            </div>
          </div>

          <div className="text-right shrink-0 space-y-1">
            {hasDebt ? (
              <>
                {debtUzs > 0 && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-xl block">{debtUzs.toLocaleString()} so'm</span>}
                {debtUsd > 0 && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-xl block">${debtUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
              </>
            ) : (
              <span className="text-xs font-bold text-indigo-500 bg-slate-50 px-2 py-1 rounded-xl block">Qarsiz</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CustomerDetailModal = ({ customer, onClose, onDelete, onEdit }) => {
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState('uzs');
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef(null);
  const payDebtMutation = usePayDebt();
  const sendReminderMutation = useSendDebtReminder();
  const { data: customerDetail, isLoading: detailLoading } = useCustomer(customer?.id);
  const { data: historyData, isLoading: historyLoading } = useCustomerSalesHistory(customer?.id);
  const salesHistory = historyData?.results || historyData || [];

  if (!customer) return null;

  const detail = customerDetail || customer;
  const debtUZS = parseFloat(detail.debt_uzs || 0);
  const debtUSD = parseFloat(detail.debt_usd || 0);
  const hasDebt = debtUZS > 0 || debtUSD > 0;
  const totalSpentUzs = parseFloat(detail.total_spent_uzs || 0);
  const totalSpentUsd = parseFloat(detail.total_spent_usd || 0);
  const isLinked = customerDetail?.is_linked ?? false;

  const latestDebtSale = salesHistory.find(s => s.debt_due_date);
  const debtDueDate = detail.debt_due_date || latestDebtSale?.debt_due_date;
  const isDebtOverdue = latestDebtSale?.is_overdue ?? (debtDueDate && new Date(debtDueDate) < new Date());

  const handlePayDebt = async (e) => {
    e.preventDefault();
    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast.error("To'lov miqdorini kiriting");
      return;
    }
    try {
      const payData = payCurrency === 'uzs'
        ? { amount_uzs: parseFloat(payAmount).toFixed(2), amount_usd: '0.00' }
        : { amount_uzs: '0.00', amount_usd: parseFloat(payAmount).toFixed(2) };
      await payDebtMutation.mutateAsync({ id: customer.id, data: payData });
      setShowPayForm(false);
      setPayAmount('');
      onClose();
    } catch (error) {}
  };

  const handleSendReminder = async () => {
    try {
      await sendReminderMutation.mutateAsync(customer.id);
    } catch (error) {}
  };

  const handleOpenPayForm = () => {
    setPayCurrency(debtUZS > 0 ? 'uzs' : 'usd');
    setShowPayForm(true);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 80 }}
      className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] px-5 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-12 -right-4 w-20 h-20 bg-white/5 rounded-full" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(customer)} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(customer.id)} className="w-9 h-9 bg-red-500/20 text-red-100 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
              <Trash className="w-5 h-5" />
            </button>
          </div>
        </div>
        <h2 className="text-white text-lg font-bold relative z-10">Mijoz profili</h2>
      </div>

      {/* Avatar card overlapping header */}
      <div className="px-5 -mt-12 relative z-10 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 ${detail.status === 'vip' ? 'bg-gradient-to-br from-amber-400 to-amber-500' : 'bg-gradient-to-br from-[#6366f1] to-[#4338ca]'}`}>
            {detail.name ? detail.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">{detail.name}</h2>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{detail.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-8 space-y-4 scroll-smooth">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <span className="text-xs text-slate-500 block mb-1">Jami xaridlar</span>
            {totalSpentUsd > 0 && <span className="font-bold text-emerald-600 text-sm block">${totalSpentUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
            {totalSpentUzs > 0 && <span className="font-bold text-slate-900 text-sm block">{totalSpentUzs.toLocaleString()} so'm</span>}
            {!totalSpentUzs && !totalSpentUsd && <span className="font-bold text-slate-400 text-sm">—</span>}
          </div>
          <div className={`rounded-2xl p-4 shadow-sm border text-center ${hasDebt ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`text-xs block mb-1 ${hasDebt ? 'text-red-500' : 'text-indigo-600'}`}>Joriy qarz</span>
            {hasDebt ? (
              <>
                {debtUSD > 0 && <span className="font-bold text-sm text-red-600 block">${debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
                {debtUZS > 0 && <span className="font-bold text-sm text-red-600 block">{debtUZS.toLocaleString()} so'm</span>}
                {debtDueDate && (
                  <span className={`text-[10px] font-bold mt-1.5 block ${isDebtOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                    {isDebtOverdue ? '⚠ Muddati o\'tgan' : `Muddat: ${new Date(debtDueDate).toLocaleDateString('uz-UZ')}`}
                  </span>
                )}
              </>
            ) : (
              <span className="font-bold text-sm text-indigo-600">Qarsiz</span>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Manzil</span>
              <span className="text-sm font-medium text-slate-700">{detail.address || 'Kiritilmagan'}</span>
            </div>
          </div>
          <div className="flex flex-col p-4">
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) {
                   setTimeout(() => {
                     scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
                   }, 200);
                }
              }}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Savdolar tarixi</span>
                  <span className="text-sm font-medium text-slate-700">{showHistory ? "Yopish" : "Ko'rish"}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                {showHistory ? <CaretUp className="w-4 h-4 text-slate-500" /> : <CaretDown className="w-4 h-4 text-slate-500" />}
              </div>
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-2 border-t border-slate-100 space-y-3">
                    {historyLoading ? (
                      <div className="py-4 flex justify-center"><Spinner className="w-6 h-6 text-[#6366f1] animate-spin" /></div>
                    ) : salesHistory.length > 0 ? (
                      salesHistory.map(sale => (
                        <div key={sale.id} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900">Xarid #{sale.id} • {sale.item_count} ta mahsulot</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(sale.created_at).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            {parseFloat(sale.total_uzs || 0) > 0 && <p className="text-xs font-black text-[#6366f1]">{parseFloat(sale.total_uzs).toLocaleString()} so'm</p>}
                            {parseFloat(sale.total_usd || 0) > 0 && <p className="text-xs font-black text-emerald-600">${parseFloat(sale.total_usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                            <p className="text-[9px] font-bold text-slate-500">{sale.payment_method_display}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-center text-slate-400 py-2">Tarix bo'sh</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {detail.note && (
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block">Eslatma</span>
                <span className="text-sm font-medium text-slate-700">{detail.note}</span>
              </div>
            </div>
          )}

          {hasDebt && debtDueDate && (
            <div className="flex items-center gap-3 p-4">
              <div className={`w-9 h-9 ${isDebtOverdue ? 'bg-red-50' : 'bg-orange-50'} rounded-xl flex items-center justify-center shrink-0`}>
                <Calendar className={`w-4 h-4 ${isDebtOverdue ? 'text-red-400' : 'text-orange-400'}`} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block">Qarz to'lash sanasi</span>
                <span className={`text-sm font-bold ${isDebtOverdue ? 'text-red-500' : 'text-orange-600'}`}>
                  {new Date(debtDueDate).toLocaleDateString('uz-UZ')}
                </span>
                {isDebtOverdue && (
                  <span className="text-[10px] font-bold text-red-400 block">Muddati o'tgan!</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-3">
            <div className={`w-9 h-9 ${isLinked ? 'bg-slate-50' : 'bg-slate-50'} rounded-xl flex items-center justify-center shrink-0`}>
              <ChatCircle className={`w-4 h-4 ${isLinked ? 'text-indigo-500' : 'text-slate-400'}`} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Telegram</span>
              {isLinked
                ? <span className="text-sm font-bold text-indigo-600">Ulangan ✓</span>
                : <span className="text-sm font-medium text-slate-400">Ulanmagan</span>
              }
            </div>
          </div>
        </div>

        {/* Debt actions */}
        {hasDebt && (
          <div>
            {showPayForm ? (
              <form onSubmit={handlePayDebt} className="bg-red-50 rounded-2xl p-4 space-y-3 border border-red-100">
                {(debtUZS > 0 && debtUSD > 0) && (
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => { setPayCurrency('uzs'); setPayAmount(''); }}
                      className={`py-2 rounded-xl font-bold text-xs transition-all ${payCurrency === 'uzs' ? 'bg-red-500 text-white' : 'bg-white text-red-500 border border-red-200'}`}>
                      so'm
                    </button>
                    <button type="button" onClick={() => { setPayCurrency('usd'); setPayAmount(''); }}
                      className={`py-2 rounded-xl font-bold text-xs transition-all ${payCurrency === 'usd' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-emerald-200'}`}>
                      $ (USD)
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-red-600">
                    Qarz: {payCurrency === 'uzs' ? `${debtUZS.toLocaleString()} so'm` : `$${debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    placeholder={payCurrency === 'uzs' ? "Miqdor (so'm)" : 'Miqdor ($)'}
                    max={payCurrency === 'uzs' ? debtUZS : debtUSD}
                    className="flex-1 bg-white border border-red-200 rounded-xl py-3 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <button
                    type="button"
                    onClick={() => setPayAmount((payCurrency === 'uzs' ? debtUZS : debtUSD).toString())}
                    className="px-3 bg-red-100 text-red-600 rounded-xl text-xs font-bold whitespace-nowrap border border-red-200 hover:bg-red-200 transition-colors"
                  >
                    To'liq
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowPayForm(false); setPayAmount(''); }}
                    className="py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm"
                  >
                    Bekor
                  </button>
                  <button
                    type="submit"
                    disabled={payDebtMutation.isPending}
                    className="py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {payDebtMutation.isPending ? <Spinner className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    To'lash
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleOpenPayForm}
                  className="bg-emerald-600 text-white rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 text-sm"
                >
                  <CreditCard className="w-4 h-4" /> Qarz To'lash
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={sendReminderMutation.isPending}
                  className="bg-orange-500 text-white rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {sendReminderMutation.isPending ? <Spinner className="animate-spin w-4 h-4" /> : <PaperPlaneRight className="w-4 h-4" />}
                  Eslatma
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const AddEditCustomerModal = ({ initialData, onClose, onSave, isPending }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone ? formatPhoneNumber(initialData.phone) : '+998',
    address: initialData?.address || '',
    debt_uzs: initialData?.debt_uzs || '0',
    debt_usd: initialData?.debt_usd || '0',
    status: initialData?.status || 'active',
    note: initialData?.note || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.phone !== '+998') {
      const cleanData = {
        ...formData,
        phone: cleanPhoneNumber(formData.phone)
      };
      onSave(cleanData);
    } else {
      toast.error('Ma\'lumotlarni to\'liq kiriting');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/40 flex flex-col justify-end"
    >
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        className="bg-white rounded-t-3xl px-5 pt-6 pb-8 relative w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Mijoz tahrirlash' : "Mijoz qo'shish"}</h2>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Ism</label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]"
              placeholder="Ismni kiriting"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Telefon</label>
            <input
              required
              name="phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]"
              placeholder="+998 90 123 45 67"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Manzil</label>
            <input
              name="address"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]"
              placeholder="Toshkent shahri"
            />
          </div>
          {initialData && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Qarz (so'm)</label>
                <input
                  name="debt_uzs"
                  value={formData.debt_uzs}
                  onChange={e => setFormData({ ...formData, debt_uzs: e.target.value })}
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Qarz ($)</label>
                <input
                  name="debt_usd"
                  value={formData.debt_usd}
                  onChange={e => setFormData({ ...formData, debt_usd: e.target.value })}
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Eslatma (Note)</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] min-h-[80px]"
              placeholder="Mijoz haqida eslatma..."
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#6366f1] text-white rounded-2xl py-4 font-bold flex items-center justify-center mt-2 transition-colors shadow-lg shadow-indigo-500/20"
          >
            {isPending ? <Spinner className="animate-spin mr-2 w-4 h-4" /> : null}
            {initialData ? 'O\'zgarishlarni saqlash' : 'Saqlash'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Customers = () => {
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState(location.state?.filter || 'Barchasi');
  const [searchQuery, setSearchQuery] = useState(location.state?.openCustomerName || '');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const statusMap = {
    'Barchasi': null,
    'Faol': 'active',
    'VIP': 'vip'
  };

  const isDebtorFilter = activeFilter === 'Qarzdorlar';

  const { data: customersData, isLoading: customersLoading } = useCustomers({
    search: searchQuery,
    status: statusMap[activeFilter]
  });
  const { data: debtorsData, isLoading: debtorsLoading } = useDebtors();

  const isLoading = isDebtorFilter ? debtorsLoading : customersLoading;

  const customerList = isDebtorFilter
    ? (Array.isArray(debtorsData) ? debtorsData : debtorsData?.results || []).filter(
        c => !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone?.includes(searchQuery)
      )
    : customersData?.results || [];
  useEffect(() => {
    const name = location.state?.openCustomerName;
    if (!name || selectedCustomer) return;
    const found = customerList.find(c => c.name === name);
    if (found) setSelectedCustomer(found);
  }, [customerList, location.state?.openCustomerName]);

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const handleSaveCustomer = async (data) => {
    try {
      if (customerToEdit) {
        await updateCustomerMutation.mutateAsync({ id: customerToEdit.id, data });
        setSelectedCustomer(null);
      } else {
        await createCustomerMutation.mutateAsync(data);
      }
      setIsAddEditModalOpen(false);
      setCustomerToEdit(null);
    } catch (error) {}
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Haqiqatdan ham bu mijozni o\'chirmoqchimisiz?')) {
      try {
        await deleteCustomerMutation.mutateAsync(id);
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
      } catch (error) {}
    }
  };

  const handleEditCustomer = (customer) => {
    setCustomerToEdit(customer);
    setIsAddEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-32 md:pb-8">
      <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] px-5 md:px-8 pt-10 pb-8 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute top-10 -right-4 w-16 h-16 bg-white/5 rounded-full" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Mijozlar</h1>
            <div className="flex items-center gap-2 mt-1">
              <Users className="text-slate-200 w-4 h-4" />
              <span className="text-slate-200 text-sm">{isDebtorFilter ? customerList.length : (customersData?.count || 0)} ta mijoz</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 -mt-3 relative z-10 max-w-6xl mx-auto">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlass className="text-slate-400 w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mijoz qidirish..."
            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mb-4">
          {['Barchasi', 'Qarzdorlar'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === filter
                  ? 'bg-[#6366f1] text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-100 shadow-sm'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-2 md:grid md:grid-cols-2 md:gap-3">
          {isLoading ? (
            <div className="flex justify-center py-20 md:col-span-2">
              <Spinner className="w-10 h-10 text-[#6366f1] animate-spin" />
            </div>
          ) : customerList.length > 0 ? (
            customerList.map((customer) => (
              <SwipeableCustomerCard
                key={customer.id}
                customer={customer}
                onClick={setSelectedCustomer}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium mb-1">Mijozlar topilmadi</p>
              <p className="text-xs text-slate-400">Yangi mijoz qo'shish uchun + tugmasini bosing</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => { setCustomerToEdit(null); setIsAddEditModalOpen(true); }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#6366f1] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onDelete={handleDeleteCustomer}
            onEdit={handleEditCustomer}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddEditModalOpen && (
          <AddEditCustomerModal
            initialData={customerToEdit}
            onClose={() => setIsAddEditModalOpen(false)}
            onSave={handleSaveCustomer}
            isPending={createCustomerMutation.isPending || updateCustomerMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
