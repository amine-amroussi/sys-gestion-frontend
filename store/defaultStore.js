import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

export const useDefaultStore = create((set, get) => ({
    defaultState: {
        loading: false,
        error: null,
        data: null,
        productCount: 0,
        totalPrice: 0,
        boxCount: 0,
        truckCount: 0,
        employeeCount: 0,
        supplierCount: 0,
        activeTrips: 0,
        emptyBoxes : 0,
      sentBoxes : 0,
        inStockBoxes : 0,
    },
    
    fetchDefaultData: async () => {
        try {
            set((state) => ({
                defaultState: { ...state.defaultState, loading: true, error: null },
            }));
            const response = await axiosInstance.get(`/default`);
            console.log(response);
            
            if (response.status === 200) {
                set((state) => ({
                    defaultState: {
                        ...state.defaultState,
                        data: response.data,
                        productCount: response.data.productCount,
                        totalPrice: response.data.totalPrice,
                        boxCount: response.data.boxCount,
                        truckCount: response.data.truckCount,
                        employeeCount: response.data.employeeCount,
                        supplierCount: response.data.supplierCount,
                        activeTrips: response.data.activeTrips,
                        emptyBoxes: response.data.emptyBoxes,
                        sentBoxes: response.data.sentBoxes,
                        inStockBoxes: response.data.inStockBoxes,
                        loading: false,
                    },
                }));
            }
        } catch (error) {
            set((state) => ({
                defaultState: {
                    ...state.defaultState,
                    loading: false,
                    error: error.response?.data?.msg || "Erreur lors de la récupération des données par défaut.",
                },
            }));
            ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération des données par défaut.");
        }
    },
}));