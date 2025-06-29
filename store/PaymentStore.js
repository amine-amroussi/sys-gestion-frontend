import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { toast } from "sonner";

export const usePaymentStore = create((set, get) => ({
  state: {
    payments: [],
    selectedPayment: null,
    employees: [],
    sellerTrips: [],
    tripTotals: {}, // Cache trip totals and commissions by payment ID
    summary: { totalPayments: 0, totalNetPay: 0, totalCredit: 0 },
    loading: false,
    error: null,
    pagination: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
    filters: { status: "", search: "" },
    sort: { sortBy: "year", sortOrder: "DESC" },
  },

  fetchPayments: async (page = 1, limit = 10, filters = {}, sort = {}) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const params = {
        page,
        limit,
        status: filters.status || "",
        search: filters.search || "",
        sortBy: sort.sortBy || "year",
        sortOrder: sort.sortOrder || "DESC",
      };
      const response = await axiosInstance.get("/payment", { params, timeout: 10000 });
      if (response.status === 200) {
        const data = response.data.data || response.data;
        set((state) => ({
          state: {
            ...state.state,
            payments: Array.isArray(data.payments) ? data.payments : [],
            pagination: {
              totalItems: data.pagination?.totalItems || 0,
              totalPages: data.pagination?.totalPages || 0,
              currentPage: page,
              pageSize: limit,
            },
            loading: false,
          },
        }));
        // Fetch trip totals for each payment
        for (const payment of data.payments) {
          if (payment.EmployeeAssociation?.role.toLowerCase() === "seller") {
            await get().fetchTripTotals(
              payment.payment_id,
              payment.employee_cin,
              payment.month,
              payment.year
            );
          }
        }
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("fetchPayments error:", error.message, error.response?.data, error.response?.status);
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch payments",
        },
      }));
      toast.error(error.message || "Erreur lors de la récupération des paiements.");
    }
  },

  fetchTripTotals: async (paymentId, employeeId, month, year) => {
    try {
      const trips = await get().fetchSellerTrips(employeeId, month, year);
      const totalWaitedAmount = trips.reduce((sum, trip) => sum + (parseFloat(trip.waitedAmount) || 0), 0);
      const commission = totalWaitedAmount * 0.008;
      set((state) => ({
        state: {
          ...state.state,
          tripTotals: {
            ...state.state.tripTotals,
            [paymentId]: { totalWaitedAmount: totalWaitedAmount.toFixed(2), commission: commission.toFixed(2) },
          },
        },
      }));
    } catch (error) {
      console.error("fetchTripTotals error:", error.message);
      set((state) => ({
        state: {
          ...state.state,
          tripTotals: {
            ...state.state.tripTotals,
            [paymentId]: { totalWaitedAmount: "0.00", commission: "0.00" },
          },
        },
      }));
    }
  },

  fetchSellerTrips: async (employeeId, month, year) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const params = {
        employee: employeeId,
        startDate: `${year}-${month.toString().padStart(2, "0")}-01`,
        endDate: `${year}-${month.toString().padStart(2, "0")}-${new Date(year, month, 0).getDate()}`,
        status: "completed",
      };
      const response = await axiosInstance.get("/trip", { params, timeout: 10000 });
      if (response.status === 200) {
        set((state) => ({
          state: {
            ...state.state,
            sellerTrips: response.data.trips || [],
            loading: false,
          },
        }));
        return response.data.trips || [];
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("fetchSellerTrips error:", error.message, error.response?.data, error.response?.status);
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch seller trips",
        },
      }));
      toast.error(error.message || "Erreur lors de la récupération des tournées du vendeur.");
      return [];
    }
  },

  fetchPaymentsForEmployeeBetweenDates: async (employeeId, startMonth, startYear, endMonth, endYear) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const params = { employeeId, startMonth, startYear, endMonth, endYear };
      const requestUrl = axiosInstance.getUri({ url: "/payment/between-dates", params });
      console.log("Request URL:", requestUrl);
      const response = await axiosInstance.get("/payment/between-dates", { params, timeout: 10000 });
      if (response.status === 200) {
        const data = response.data.data || response.data;
        set((state) => ({
          state: { ...state.state, loading: false, error: null },
        }));
        return Array.isArray(data.payments) ? data.payments : [];
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("fetchPaymentsForEmployeeBetweenDates error:", error.message, error.response?.data, error.response?.status);
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch payments",
        },
      }));
      toast.error(error.message || "Erreur lors de la récupération des paiements.");
      return [];
    }
  },

  fetchEmployees: async () => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const response = await axiosInstance.get("/payment/employees", { timeout: 5000 });
      console.log("fetchEmployees response:", response.data);
      if (response.status === 200) {
        set((state) => ({
          state: {
            ...state.state,
            employees: Array.isArray(response.data.employees) ? response.data.employees : [],
            loading: false,
          },
        }));
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("fetchEmployees error:", error.message, error.response?.data, error.response?.status);
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch employees",
        },
      }));
      toast.error(error.message || "Erreur lors de la récupération des employés.");
    }
  },

  fetchPaymentById: async (id) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const response = await axiosInstance.get(`/payment/${id}`, { timeout: 5000 });
      if (response.status === 200) {
        set((state) => ({
          state: {
            ...state.state,
            selectedPayment: response.data.payment || null,
            loading: false,
          },
        }));
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("fetchPaymentById error:", error.message, error.response?.data, error.response?.status);
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch payment",
        },
      }));
      toast.error(error.message || "Erreur lors de la récupération du paiement.");
    }
  },

  createPayment: async (paymentInfo) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const response = await axiosInstance.post("/payment", paymentInfo, { timeout: 5000 });
      if (response.status === 200) {
        await get().fetchPayments(
          get().state.pagination.currentPage,
          get().state.pagination.pageSize,
          get().state.filters,
          get().state.sort
        );
        set((state) => ({ state: { ...state.state, loading: false } }));
        toast.success("Paiement créé avec succès !");
        return response.data.paymentEmployeeData;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("createPayment error:", error.message, error.response?.data, error.response?.status);
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to create payment",
        },
      }));
      toast.error(error.message || "Erreur lors de la création du paiement.");
      throw error;
    }
  },

  updatePayment: async (paymentId, status) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const response = await axiosInstance.patch(`/payment/${paymentId}`, { status }, { timeout: 5000 });
      if (response.status === 200) {
        await get().fetchPayments(
          get().state.pagination.currentPage,
          get().state.pagination.pageSize,
          get().state.filters,
          get().state.sort
        );
        set((state) => ({
          state: { ...state.state, selectedPayment: null, loading: false },
        }));
        toast.success("Paiement mis à jour avec succès !");
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("updatePayment error:", error.message, error.response?.data, error.response?.status);
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to update payment",
        },
      }));
      toast.error(error.message || "Erreur lors de la mise à jour du paiement.");
    }
  },

  fetchSummary: async (month, year) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const params = {};
      if (month && year) {
        params.month = month;
        params.year = year;
      }
      const response = await axiosInstance.get("/payment/summary", { params, timeout: 5000 });
      if (response.status === 200) {
        set((state) => ({
          state: {
            ...state.state,
            summary: response.data.summary || {
              totalPayments: 0,
              totalNetPay: 0,
              totalCredit: 0,
            },
            loading: false,
          },
        }));
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("fetchSummary error:", error.message, error.response?.data, error.response?.status);
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch summary",
        },
      }));
      toast.error(error.message || "Erreur lors de la récupération du résumé.");
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      state: {
        ...state.state,
        filters: { ...state.state.filters, ...newFilters },
        pagination: { ...state.state.pagination, currentPage: 1 },
      },
    }));
  },

  setSort: (newSort) => {
    set((state) => ({
      state: {
        ...state.state,
        sort: { ...state.state.sort, ...newSort },
        pagination: { ...state.state.pagination, currentPage: 1 },
      },
    }));
  },

  goToNextPage: async () => {
    const { currentPage, totalPages } = get().state.pagination;
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      set((state) => ({
        state: {
          ...state.state,
          pagination: { ...state.state.pagination, currentPage: nextPage },
        },
      }));
      await get().fetchPayments(
        nextPage,
        get().state.pagination.pageSize,
        get().state.filters,
        get().state.sort
      );
    }
  },
}));