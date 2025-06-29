// productStore.js
import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

export const useProduct = create((set, get) => ({
  productState: {
    products: [],
    selectedProducts: [],
    selectedProduct: "",
    loadingProduct: false,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllProducts: async (page = 1, limit = 10, filters = {}) => {
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true },
      }));

      // Clean and log filters
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search.trim();
      if (filters.minPrice && !isNaN(parseFloat(filters.minPrice))) {
        cleanFilters.minPrice = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice && !isNaN(parseFloat(filters.maxPrice))) {
        cleanFilters.maxPrice = parseFloat(filters.maxPrice);
      }
      console.log("Fetching products with params:", { page, limit, ...cleanFilters });

      const response = await axiosInstance.get(`/product`, {
        params: { page, limit, ...cleanFilters },
      });

      if (response.status === 200) {
        const data = response.data;
        console.log("Fetched products:", data.data.products);
        set((state) => ({
          productState: {
            ...state.productState,
            products: data.data.products,
            pagination: data.data.pagination,
            loadingProduct: false,
          },
        }));
      }
    } catch (error) {
      console.error("Fetch products error:", error.response?.data || error);
      set((state) => ({
        productState: { ...state.productState, loadingProduct: false },
      }));
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération des produits.");
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().productState.pagination.currentPage;
      const totalPages = get().productState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          productState: {
            ...state.productState,
            pagination: { ...state.productState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllProducts(nextPage, get().productState.pagination.pageSize);
      }
    } catch (error) {
      ShowToast.error("Erreur lors du changement de page.");
    }
  },
  createProduct: async (productInfo) => {
    const toastId = ShowToast.loading("Ajout d'un produit...");
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true },
      }));
      const response = await axiosInstance.post("/product", {
        designation: productInfo.designation,
        genre: productInfo.genre,
        priceUnite: Number(productInfo.priceUnite),
        capacityByBox: Number(productInfo.capacityByBox),
        box: productInfo.box,
      });
      if (response.status === 201) {
        await get().fetchAllProducts(get().productState.pagination.currentPage, get().productState.pagination.pageSize);
        ShowToast.dismiss(toastId);
        ShowToast.successAdd(`Le produit`);
      }
    } catch (error) {
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la création du produit.");
    } finally {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: false },
      }));
    }
  },
  getProduct: async (id) => {
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true },
      }));
      const response = await axiosInstance.get(`/product/${id}`);
      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          productState: {
            ...state.productState,
            selectedProduct: data.data.product,
            loadingProduct: false,
          },
        }));
      }
    } catch (error) {
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération du produit.");
    } finally {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: false },
      }));
    }
  },
  editProduct: async (productInfo, id) => {
    const toastId = ShowToast.loading("Mise à jour du produit...");
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true },
      }));
      const response = await axiosInstance.patch(`/product/${id}`, {
        designation: productInfo.designation,
        genre: productInfo.genre,
        priceUnite: Number(productInfo.priceUnite),
        capacityByBox: Number(productInfo.capacityByBox),
        box: productInfo.box,
      });
      if (response.status === 200) {
        await get().fetchAllProducts(get().productState.pagination.currentPage, get().productState.pagination.pageSize);
        ShowToast.dismiss(toastId);
        ShowToast.successUpdate(`Le produit`);
      }
    } catch (error) {
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la mise à jour du produit.");
    } finally {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: false },
      }));
    }
  },
}));