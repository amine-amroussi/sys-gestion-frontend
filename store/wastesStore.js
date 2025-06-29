import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

export const useWastes = create((set, get) => ({
  wasteState: {
    wastes: [],
    selectedWaste: "",
    loadingWaste: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllWastes: async (page = 1, limit = 10, filters = {}) => {
    const toastId = ShowToast.loading("Chargement des déchets...");
    try {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: true, error: null },
      }));

      const params = { page, limit };
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await axiosInstance.get(`/waste`, { params });

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          wasteState: {
            ...state.wasteState,
            wastes: data.wastes,
            pagination: data.pagination || {
              totalItems: data.wastes.length,
              totalPages: Math.ceil(data.wastes.length / limit),
              currentPage: page,
              pageSize: limit,
            },
            loadingWaste: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.success("Déchets chargés");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec du chargement des déchets";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          loadingWaste: false,
          error: errorMessage,
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMessage);
      console.error("Fetch wastes error:", error);
    }
  },
  nextPage: async () => {
    const toastId = ShowToast.loading("Chargement de la page suivante...");
    try {
      const currentPage = get().wasteState.pagination.currentPage;
      const totalPages = get().wasteState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          wasteState: {
            ...state.wasteState,
            pagination: { ...state.wasteState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllWastes(nextPage, get().wasteState.pagination.pageSize);
        ShowToast.dismiss(toastId);
        ShowToast.successAdd("Page suivante chargée");
      } else {
        ShowToast.dismiss(toastId);
        ShowToast.error("Aucune page suivante disponible");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec du chargement de la page suivante";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          error: errorMessage,
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMessage);
      console.error("Next page error:", error);
    }
  },
  createWaste: async (wasteInfo) => {
    const toastId = ShowToast.loading("Ajout du déchet...");
    try {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: true, error: null },
      }));
      const validatedWasteInfo = {
        ...wasteInfo,
        qtt: parseFloat(wasteInfo.qtt),
      };
      if (isNaN(validatedWasteInfo.qtt) || validatedWasteInfo.qtt <= 0) {
        throw new Error("La quantité doit être un nombre positif");
      }
      const response = await axiosInstance.post("/waste", validatedWasteInfo);
      if (response.status === 201 || response.status === 200) {
        await get().fetchAllWastes(get().wasteState.pagination.currentPage, get().wasteState.pagination.pageSize);
        set((state) => ({
          wasteState: {
            ...state.wasteState,
            loadingWaste: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successAdd("Déchet");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Échec de la création du déchet";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          loadingWaste: false,
          error: errorMessage,
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMessage);
      console.error("Create waste error:", error);
    }
  },
  getWaste: async (id) => {
    const toastId = ShowToast.loading("Chargement du déchet...");
    try {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: true, error: null },
      }));
      const response = await axiosInstance.get(`/waste/${id}`);
      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          wasteState: {
            ...state.wasteState,
            selectedWaste: data.waste,
            loadingWaste: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successAdd("Déchet chargé");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec du chargement du déchet";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          loadingWaste: false,
          error: errorMessage,
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMessage);
      console.error("Get waste error:", error);
    }
  },
  editWaste: async (wasteInfo, id) => {
    const toastId = ShowToast.loading("Modification du déchet...");
    try {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: true, error: null },
      }));
      const response = await axiosInstance.patch(`/waste/${id}`, wasteInfo);
      if (response.status === 200) {
        await get().fetchAllWastes(get().wasteState.pagination.currentPage, get().wasteState.pagination.pageSize);
        set((state) => ({
          wasteState: {
            ...state.wasteState,
            loadingWaste: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successUpdate("Déchet");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec de la modification du déchet";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          loadingWaste: false,
          error: errorMessage,
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMessage);
      console.error("Edit waste error:", error);
    }
  },
}));