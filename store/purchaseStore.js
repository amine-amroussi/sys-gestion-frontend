import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast"; // Import the toast utility

export const usePurchase = create((set, get) => ({
  purchaseState: {
    purchases: [],
    selectedPurchase: null,
    loadingPurchase: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllPurchases: async (page = 1, limit = 10, filters = {}) => {
    const toastId = ShowToast.loading("Chargement des achats...");
    try {
      set((state) => ({
        purchaseState: { ...state.purchaseState, loadingPurchase: true, error: null },
      }));

      // Construct query parameters including filters
      const queryParams = {
        page,
        limit,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        minTotal: filters.minTotal || undefined,
        maxTotal: filters.maxTotal || undefined,
        search: filters.search || undefined,
      };

      const response = await axiosInstance.get(`/purchase`, {
        params: queryParams,
      });

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          purchaseState: {
            ...state.purchaseState,
            purchases: data.data.purchases,
            pagination: data.data.pagination,
            loadingPurchase: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.success("Achats chargés");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec du chargement des achats";
      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          loadingPurchase: false,
          error: errorMessage,
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMessage);
      console.error("Fetch purchases error:", error);
    }
  },
  fetchPurchase : async (id) => {
  const toastId = ShowToast.loading("Chargement de l'achat...");
  try {
    set((state) => ({
      purchaseState: { ...state.purchaseState, loadingPurchase: true, error: null },
    }));

    const response = await axiosInstance.get(`/purchase/${id}`);

    if (response.status === 200) {
      const data = response.data;
      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          selectedPurchase: data.data.purchase,
          loadingPurchase: false,
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.successAdd("Achat chargé");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Échec du chargement de l'achat";
    set((state) => ({
      purchaseState: {
        ...state.purchaseState,
        loadingPurchase: false,
        error: errorMessage,
      },
    }));
    ShowToast.dismiss(toastId);
    ShowToast.error(errorMessage);
    console.error("Fetch purchase error:", error);
  }
},
  createPurchase: async (purchaseInfo) => {
    const toastId = ShowToast.loading("Ajout de l'achat...");
    try {
      set((state) => ({
        purchaseState: { ...state.purchaseState, loadingPurchase: true, error: null },
      }));

      const response = await axiosInstance.post("/purchase", purchaseInfo);

      if (response.status === 201) {
        await get().fetchAllPurchases(
          get().purchaseState.pagination.currentPage,
          get().purchaseState.pagination.pageSize
        );
        set((state) => ({
          purchaseState: {
            ...state.purchaseState,
            loadingPurchase: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successAdd("Achat");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec de la création de l'achat";
      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          loadingPurchase: false,
          error: errorMessage,
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMessage);
      console.error("Create purchase error:", error);
    }
  },
  nextPage: async () => {
    const toastId = ShowToast.loading("Chargement de la page suivante...");
    try {
      const currentPage = get().purchaseState.pagination.currentPage;
      const totalPages = get().purchaseState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          purchaseState: {
            ...state.purchaseState,
            pagination: { ...state.purchaseState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllPurchases(nextPage, get().purchaseState.pagination.pageSize);
        ShowToast.dismiss(toastId);
        ShowToast.successAdd("Page suivante chargée");
      } else {
        ShowToast.dismiss(toastId);
        ShowToast.error("Aucune page suivante disponible");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec du chargement de la page suivante";
      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          error: errorMessage,
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMessage);
      console.error("Next page error:", error);
    }
  },
}));