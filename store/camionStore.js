import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

export const useCamion = create((set, get) => ({
  camionState: {
    camions: [],
    selectedCamion: null,
    loadingCamion: false,
    error: null,
  },
  fetchAllCamions: async () => {
    try {
      set((state) => ({
        camionState: { ...state.camionState, loadingCamion: true, error: null },
      }));
      const response = await axiosInstance.get(`/Truck`);
      if (response.status === 200) {
        set((state) => ({
          camionState: {
            ...state.camionState,
            camions: response.data.trucks,
            loadingCamion: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        camionState: {
          ...state.camionState,
          loadingCamion: false,
          error: error.response?.data?.msg || "Erreur lors de la récupération des camions.",
        },
      }));
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération des camions.");
    }
  },
  fetchCamion: async (id) => {
    try {
      set((state) => ({
        camionState: { ...state.camionState, loadingCamion: true, error: null },
      }));
      const response = await axiosInstance.get(`/Truck/${id}`);
      if (response.status === 200) {
        set((state) => ({
          camionState: {
            ...state.camionState,
            selectedCamion: response.data.truck,
            loadingCamion: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        camionState: {
          ...state.camionState,
          loadingCamion: false,
          error: error.response?.data?.msg || "Erreur lors de la récupération du camion.",
        },
      }));
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération du camion.");
    }
  },
  createCamion: async (camionInfo) => {
    const toastId = ShowToast.loading("Ajout d'un camion...");
    try {
      set((state) => ({
        camionState: { ...state.camionState, loadingCamion: true, error: null },
      }));
      const response = await axiosInstance.post("/Truck", camionInfo);
      if (response.status === 201) {
        await get().fetchAllCamions();
        set((state) => ({
          camionState: { ...state.camionState, loadingCamion: false },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successAdd("Camion");
      }
    } catch (error) {
      set((state) => ({
        camionState: {
          ...state.camionState,
          loadingCamion: false,
          error: error.response?.data?.msg || "Erreur lors de la création du camion.",
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la création du camion.");
      throw error;
    }
  },
  editCamion: async (camionInfo, id) => {
    const toastId = ShowToast.loading("Mise à jour du camion...");
    try {
      set((state) => ({
        camionState: { ...state.camionState, loadingCamion: true, error: null },
      }));
      const response = await axiosInstance.patch(`/Truck/${id}`, camionInfo);
      if (response.status === 200) {
        await get().fetchAllCamions();
        set((state) => ({
          camionState: {
            ...state.camionState,
            selectedCamion: null,
            loadingCamion: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successUpdate("Camion");
      }
    } catch (error) {
      set((state) => ({
        camionState: {
          ...state.camionState,
          loadingCamion: false,
          error: error.response?.data?.msg || "Erreur lors de la mise à jour du camion.",
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la mise à jour du camion.");
    }
  },
}));