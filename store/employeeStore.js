import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

export const useEmployee = create((set, get) => ({
  employeeState: {
    employees: [],
    selectedEmployee: null,
    loadingEmployee: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllEmployees: async (page = 1, limit = 10, filters = {}) => {
    try {
      set((state) => ({
        employeeState: { ...state.employeeState, loadingEmployee: true, error: null },
      }));

      const response = await axiosInstance.get(`/employee`, {
        params: { page, limit, ...filters },
      });

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          employeeState: {
            ...state.employeeState,
            employees: data.data.employees,
            pagination: data.data.pagination,
            loadingEmployee: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        employeeState: {
          ...state.employeeState,
          loadingEmployee: false,
          error: error.response?.data?.msg || "Erreur lors de la récupération des employés.",
        },
      }));
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération des employés.");
    }
  },
  fetchEmployee: async (cin) => {
    try {
      set((state) => ({
        employeeState: { ...state.employeeState, loadingEmployee: true, error: null },
      }));

      const response = await axiosInstance.get(`/employee/${cin}`);

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          employeeState: {
            ...state.employeeState,
            selectedEmployee: data.employee,
            loadingEmployee: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        employeeState: {
          ...state.employeeState,
          loadingEmployee: false,
          error: error.response?.data?.msg || "Erreur lors de la récupération de l'employé.",
        },
      }));
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération de l'employé.");
    }
  },
  editEmployee: async (employeeInfo, cin) => {
    const toastId = ShowToast.loading("Mise à jour de l'employé...");
    try {
      set((state) => ({
        employeeState: { ...state.employeeState, loadingEmployee: true, error: null },
      }));

      const response = await axiosInstance.patch(`/employee/${cin}`, employeeInfo);

      if (response.status === 200) {
        await get().fetchAllEmployees(
          get().employeeState.pagination.currentPage,
          get().employeeState.pagination.pageSize
        );
        set((state) => ({
          employeeState: {
            ...state.employeeState,
            selectedEmployee: null,
            loadingEmployee: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successUpdate("Employé");
      }
    } catch (error) {
      set((state) => ({
        employeeState: {
          ...state.employeeState,
          loadingEmployee: false,
          error: error.response?.data?.msg || "Erreur lors de la mise à jour de l'employé.",
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la mise à jour de l'employé.");
    }
  },
  createEmployee: async (employeeInfo) => {
    const toastId = ShowToast.loading("Ajout d'un employé...");
    try {
      set((state) => ({
        employeeState: { ...state.employeeState, loadingEmployee: true, error: null },
      }));
      const response = await axiosInstance.post("/employee", employeeInfo);
      if (response.status === 201) {
        await get().fetchAllEmployees(
          get().employeeState.pagination.currentPage,
          get().employeeState.pagination.pageSize
        );
        set((state) => ({
          employeeState: {
            ...state.employeeState,
            loadingEmployee: false,
          },
        }));
        ShowToast.dismiss(toastId);
        ShowToast.successAdd("Employé");
      }
    } catch (error) {
      set((state) => ({
        employeeState: {
          ...state.employeeState,
          loadingEmployee: false,
          error: error.response?.data?.msg || "Erreur lors de la création de l'employé.",
        },
      }));
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la création de l'employé.");
      throw error;
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().employeeState.pagination.currentPage;
      const totalPages = get().employeeState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          employeeState: {
            ...state.employeeState,
            pagination: { ...state.employeeState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllEmployees(nextPage, get().employeeState.pagination.pageSize);
      }
    } catch (error) {
      ShowToast.error("Erreur lors du changement de page.");
    }
  },
}));