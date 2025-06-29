import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

export const useSupplier = create((set, get) => ({
  supplierState: {
    suppliers: [],
    selectedSupplier: null,
    loadingSupplier: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllSuppliers: async (page = 1, limit = 10) => {
    try {
      set((state) => ({
        supplierState: { ...state.supplierState, loadingSupplier: true, error: null },
      }));

      const response = await axiosInstance.get(`/supplier`, {
        params: { page, limit },
      });

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            suppliers: data.data.suppliers,
            pagination: data.data.pagination,
            loadingSupplier: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        supplierState: {
          ...state.supplierState,
          loadingSupplier: false,
          error: error.response?.data?.msg || "Erreur lors de la récupération des fournisseurs.",
        },
      }));
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération des fournisseurs.");
    }
  },
  fetchSupplier: async (id) => {
    try {
      set((state) => ({
        supplierState: { ...state.supplierState, loadingSupplier: true, error: null },
      }));

      const response = await axiosInstance.get(`/supplier/${id}`);

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            selectedSupplier: data.supplier,
            loadingSupplier: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        supplierState: {
          ...state.supplierState,
          loadingSupplier: false,
          error: error.response?.data?.msg || "Erreur lors de la récupération du fournisseur.",
        },
      }));
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération du fournisseur.");
    }
  },
  createSupplier: async (supplierInfo) => {
    const toastId = ShowToast.loading("Ajout d'un fournisseur...");
    try {
      set((state) => ({
        supplierState: { ...state.supplierState, loadingSupplier: true, error: null },
      }));

      const response = await axiosInstance.post("/supplier", supplierInfo);

      if (response.status === 201) {
        await get().fetchAllSuppliers(
          get().supplierState.pagination.currentPage,
          get().supplierState.pagination.pageSize
        );
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            loadingSupplier: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successAdd("Fournisseur");
      }
    } catch (error) {
      set((state) => ({
        supplierState: {
          ...state.supplierState,
          loadingSupplier: false,
          error: error.response?.data?.msg || "Erreur lors de la création du fournisseur.",
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la création du fournisseur.");
      throw error;
    }
  },
  editSupplier: async (supplierInfo, id) => {
    const toastId = ShowToast.loading("Mise à jour du fournisseur...");
    try {
      set((state) => ({
        supplierState: { ...state.supplierState, loadingSupplier: true, error: null },
      }));

      const response = await axiosInstance.patch(`/supplier/${id}`, supplierInfo);

      if (response.status === 200) {
        await get().fetchAllSuppliers(
          get().supplierState.pagination.currentPage,
          get().supplierState.pagination.pageSize
        );
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            selectedSupplier: null,
            loadingSupplier: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successUpdate("Fournisseur");
      }
    } catch (error) {
      set((state) => ({
        supplierState: {
          ...state.supplierState,
          loadingSupplier: false,
          error: error.response?.data?.msg || "Erreur lors de la mise à jour du fournisseur.",
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la mise à jour du fournisseur.");
    }
  },
  deleteSupplier: async (id) => {
    const toastId = ShowToast.loading("Suppression du fournisseur...");
    try {
      set((state) => ({
        supplierState: { ...state.supplierState, loadingSupplier: true, error: null },
      }));

      const response = await axiosInstance.delete(`/supplier/${id}`);

      if (response.status === 200) {
        await get().fetchAllSuppliers(
          get().supplierState.pagination.currentPage,
          get().supplierState.pagination.pageSize
        );
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            loadingSupplier: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successDelete("Fournisseur");
      }
    } catch (error) {
      set((state) => ({
        supplierState: {
          ...state.supplierState,
          loadingSupplier: false,
          error: error.response?.data?.msg || "Erreur lors de la suppression du fournisseur.",
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la suppression du fournisseur.");
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().supplierState.pagination.currentPage;
      const totalPages = get().supplierState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            pagination: { ...state.supplierState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllSuppliers(nextPage, get().supplierState.pagination.pageSize);
      }
    } catch (error) {
      ShowToast.error("Erreur lors du changement de page.");
    }
  },
}));