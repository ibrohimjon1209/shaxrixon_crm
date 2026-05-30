import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customerService from '../services/customer.service';
import { toast } from 'react-toastify';

export const useCustomers = (params) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.getCustomers(params),
  });
};

export const useCustomer = (id) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
    staleTime: 0,
  });
};

// Fetches customer sales via GET /api/sales/?customer={id}
export const useCustomerSalesHistory = (id) => {
  return useQuery({
    queryKey: ['customers', id, 'sales-history'],
    queryFn: () => customerService.getCustomerSalesHistory(id),
    enabled: !!id,
  });
};

export const useCustomerBotLink = (id) => {
  return useQuery({
    queryKey: ['customers', id, 'bot-link'],
    queryFn: () => customerService.getBotLink(id),
    enabled: !!id,
  });
};

const getErrorMsg = (err) => {
  const d = err?.response?.data;
  if (!d) return 'Xatolik yuz berdi';
  if (typeof d === 'string') return d;
  if (d.detail) return d.detail;
  const first = Object.values(d)[0];
  return Array.isArray(first) ? first[0] : (first || 'Xatolik yuz berdi');
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['customers'] });
      toast.success('Mijoz muvaffaqiyatli qo\'shildi');
    },
    onError: (err) => toast.error(getErrorMsg(err)),
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerService.updateCustomer(id, data),
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['customers'] });
      queryClient.refetchQueries({ queryKey: ['customer', data.id] });
      toast.success('Mijoz muvaffaqiyatli yangilandi');
    },
    onError: (err) => toast.error(getErrorMsg(err)),
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['customers'] });
      toast.success('Mijoz muvaffaqiyatli o\'chirildi');
    },
    onError: (err) => toast.error(getErrorMsg(err)),
  });
};

export const useDebtors = () => {
  return useQuery({
    queryKey: ['customers', 'debtors'],
    queryFn: () => customerService.getDebtors(),
  });
};

export const useVipCustomers = () => {
  return useQuery({
    queryKey: ['customers', 'vip'],
    queryFn: () => customerService.getVipCustomers(),
  });
};

export const usePayDebt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerService.payDebt(id, data),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: ['customers'] });
      queryClient.refetchQueries({ queryKey: ['customer', variables.id] });
      toast.success("Qarz to'lovi muvaffaqiyatli amalga oshirildi");
    },
    onError: (err) => toast.error(getErrorMsg(err)),
  });
};

export const useSendDebtReminder = () => {
  return useMutation({
    mutationFn: (id) => customerService.sendDebtReminder(id),
    onSuccess: () => {
      toast.success('Eslatma muvaffaqiyatli yuborildi');
    },
    onError: (err) => toast.error(getErrorMsg(err)),
  });
};

export const useGetBotLink = () => {
  return useMutation({
    mutationFn: (id) => customerService.getBotLink(id),
  });
};

export const useUnlinkTelegram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => customerService.unlinkTelegram(id),
    onSuccess: (_, id) => {
      queryClient.refetchQueries({ queryKey: ['customers'] });
      queryClient.refetchQueries({ queryKey: ['customer', id] });
      toast.success("Telegram bog'liqlik bekor qilindi");
    },
    onError: (err) => toast.error(getErrorMsg(err)),
  });
};
