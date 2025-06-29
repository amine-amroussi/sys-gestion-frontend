import { create } from 'zustand';
import { axiosInstance } from '@/utils/axiosInstance';
import { ShowToast } from '@/utils/toast';

export const useCharges = create((set, get) => ({
  chargeState: {
    charges: [],
    loadingCharge: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    },
  },
  createCharge: async (chargeInfo) => {
    set((state) => ({ chargeState: { ...state.chargeState, loadingCharge: true, error: null } }));
    try {
      const response = await axiosInstance.post('/charges', chargeInfo);
      if (response.status === 201) {
        ShowToast.successAdd('Charge ajoutée avec succès');
        return response.data.newCharge;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout de la charge';
      set((state) => ({
        chargeState: { ...state.chargeState, loadingCharge: false, error: errorMessage },
      }));
      ShowToast.error(errorMessage);
      throw error;
    }
  },
  fetchAllCharges: async (page = 1, limit = 10, filters = {}) => {
    set((state) => ({ chargeState: { ...state.chargeState, loadingCharge: true, error: null } }));
    try {
      const cleanedFilters = {
        type: filters.type?.trim() || undefined,
        startDate: filters.startDate && !isNaN(new Date(filters.startDate).getTime()) ? filters.startDate : undefined,
        endDate: filters.endDate && !isNaN(new Date(filters.endDate).getTime()) ? filters.endDate : undefined,
      };

      const response = await axiosInstance.get('/charges', { 
        params: { 
          page, 
          limit,
          ...cleanedFilters,
        },
      });

      if (response.status === 200) {
        const { charges, pagination } = response.data;
        set((state) => ({
          chargeState: {
            ...state.chargeState,
            charges,
            pagination,
            loadingCharge: false,
          },
        }));
      }
    } catch (error) {
      console.error('Fetch charges error:', error);
      const errorMessage = error.response?.data?.message || 
        error.message === 'Network Error' ? 'Erreur de connexion au serveur' :
        'Erreur lors de la récupération des charges';
      set((state) => ({
        chargeState: { 
          ...state.chargeState, 
          loadingCharge: false, 
          error: errorMessage,
        },
      }));
      ShowToast.error(errorMessage);
    }
  },
  nextPage: () => {
    const { pagination } = get().chargeState;
    if (pagination.currentPage < pagination.totalPages) {
      get().fetchAllCharges(pagination.currentPage + 1, pagination.pageSize, get().chargeState.filters);
    }
  },
}));