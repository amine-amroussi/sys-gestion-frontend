import { create } from 'zustand';
import { axiosInstance } from '@/utils/axiosInstance';
import { toast } from 'sonner';

export const useRevenue = create((set, get) => ({
  revenueState: {
    totalRevenue: 0,
    revenueByDate: {},
    totalPurchases: 0,
    purchasesByDate: {},
    totalPayments: 0,
    paymentsByDate: {},
    period: 'today',
    startDate: null,
    endDate: null,
    loading: false,
    error: null,
  },
  fetchFinancialSummary: async (period = 'today', startDate = null, endDate = null) => {
    set((state) => ({ revenueState: { ...state.revenueState, loading: true, error: null } }));
    try {
      const params = { period };
      if (period === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const response = await axiosInstance.get('/revenue', { params });
      if (response.status === 200) {
        const { totalRevenue, revenueByDate, totalPurchases, purchasesByDate, totalPayments, paymentsByDate, period: resPeriod, startDate: resStart, endDate: resEnd } = response.data.data;
        set((state) => ({
          revenueState: {
            ...state.revenueState,
            totalRevenue,
            revenueByDate,
            totalPurchases,
            purchasesByDate,
            totalPayments,
            paymentsByDate,
            period: resPeriod,
            startDate: resStart,
            endDate: resEnd,
            loading: false,
          },
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Erreur lors de la récupération des données financières.';
      set((state) => ({
        revenueState: { ...state.revenueState, loading: false, error: errorMessage },
      }));
      toast.error(errorMessage);
    }
  },
  setPeriod: (newPeriod) => {
    set((state) => ({
      revenueState: { ...state.revenueState, period: newPeriod, startDate: null, endDate: null },
    }));
    get().fetchFinancialSummary(newPeriod);
  },
  setCustomDates: (startDate, endDate) => {
    set((state) => ({
      revenueState: { ...state.revenueState, period: 'custom', startDate, endDate },
    }));
    get().fetchFinancialSummary('custom', startDate, endDate);
  },
}));