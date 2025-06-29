import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

export const useBox = create((set, get) => ({
  boxState: {
    boxes: [],
    selectedBoxes: [],
    selectedBoxId: "",
    lodingBox: false,
  },
  fetchAllBoxes: async () => {
    try {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: true } }));
      const response = await axiosInstance.get("/box");
      const fetchedBoxes = response.data.data?.boxes || [];
      console.log("Fetched boxes in boxStore:", fetchedBoxes); // Debug
      set((state) => ({
        boxState: { ...state.boxState, boxes: fetchedBoxes, lodingBox: false },
      }));
      if (!fetchedBoxes.length) {
        ShowToast.error("Aucune caisse disponible.");
      }
    } catch (error) {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
      const errorMsg = error.response?.data?.message || "Erreur lors de la récupération des caisses.";
      ShowToast.error(errorMsg);
      console.error("Fetch boxes error:", error);
    }
  },
  createBox: async (boxInfo) => {
    console.log(boxInfo);
    
    const toastId = ShowToast.loading("Ajout d'une caisse...");
    try {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: true } }));
      await axiosInstance.post("/box", boxInfo);
      await get().fetchAllBoxes();
      ShowToast.dismiss(toastId);
      ShowToast.successAdd("Caisse");
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
    } catch (error) {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
      const errorMsg = error.response?.data?.message || "Erreur lors de la création de la caisse.";
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMsg);
    }
  },
  editBox: async (boxInfo, boxId) => {
    const toastId = ShowToast.loading("Mise à jour de la caisse...");
    try {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: true } }));
      await axiosInstance.patch(`/box/${boxId}`, boxInfo);
      await get().fetchAllBoxes();
      ShowToast.dismiss(toastId);
      ShowToast.successUpdate("Caisse");
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
    } catch (error) {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
      const errorMsg = error.response?.data?.message || "Erreur lors de la mise à jour de la caisse.";
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMsg);
    }
  },
  deleteBox: async (boxId) => {
    const toastId = ShowToast.loading("Suppression de la caisse...");
    try {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: true } }));
      await axiosInstance.delete(`/box/${boxId}`);
      await get().fetchAllBoxes();
      ShowToast.dismiss(toastId);
      ShowToast.successDelete("Caisse");
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
    } catch (error) {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
      const errorMsg = error.response?.data?.message || "Erreur lors de la suppression de la caisse.";
      ShowToast.dismiss(toastId);
      ShowToast.error(errorMsg);
    }
  },
}));