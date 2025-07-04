import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { toast } from "sonner";
import { ShowToast } from "@/utils/toast";

export const useTrip = create((set, get) => ({
  tripState: {
    trips: [],
    activeTrips: [],
    loadingTrip: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10
    }
  },
  fetchAllTrips: async (page = 1, params = {}) => {
    try {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null }
      }));

      const response = await axiosInstance.get(`/trip`, {
        params: {
          page,
          limit: params.limit || 10,
          startDate: params.startDate,
          endDate: params.endDate,
          employee: params.employee,
          truck: params.truck,
          status: params.status,
          search: params.search,
          sortBy: params.sortBy || 'date',
          sortOrder: params.sortOrder || 'DESC'
        }
      });

      if (response.status === 200) {
        // ShowToast.successAdd(`L'achat est ajoute`)
        ShowToast.success(`Tournées chargées avec succès !`);
        const { trips, totalItems, totalPages, currentPage } = response.data;
        set((state) => ({
          tripState: {
            ...state.tripState,
            trips,
            pagination: {
              totalItems,
              totalPages,
              currentPage,
              pageSize: params.limit || 10
            }
          }
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la récupération des tournées.";
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage }
      }));
      toast.error(errorMessage);
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false }
      }));
    }
  },
  fetchActiveTrips: async () => {
    try {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));

      console.log("Fetching active trips from /trip/active");
      const response = await axiosInstance.get(`/trip/active`);
      console.log("fetchActiveTrips response:", response.data);

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          tripState: { ...state.tripState, activeTrips: data.trips || [] },
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la récupération des tournées actives.";
      console.error("fetchActiveTrips error:", error.response?.data || error);
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      toast.error(errorMessage);
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  fetchTripById: async (tripId) => {
  try {
    const parsedTripId = parseInt(tripId, 10);
    console.log("Fetching trip by ID:", parsedTripId);
    if (isNaN(parsedTripId)) {
      throw new Error("ID de tournée invalide");
    }
    console.log(`Requesting /trip/${parsedTripId}`);
    const response = await axiosInstance.get(`/trip/${parsedTripId}`);
    console.log("fetchTripById response:", JSON.stringify(response.data.trip, null, 2));
    if (!response.data.trip) {
      throw new Error("No trip data returned in response");
    }
    return response.data.trip;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la récupération de la tournée par ID.";
    console.error("fetchTripById error:", {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
    });
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
},
fetchLastTripByMatricule : async (matricule) => {
  try {
    console.log(`Fetching last trip for truck with matricule: ${matricule}`);
    const response = await axiosInstance.get(`/trip/last/${matricule}`);
    console.log("fetchLastTripByMatricule response:", response.data);

    if (response.status === 200) {
      return response.data.trip;
    } else {
      throw new Error("Erreur lors de la récupération de la dernière tournée.");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Erreur lors de la récupération de la dernière tournée.";
    console.error("fetchLastTripByMatricule error:", {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
},

  startTrip: async (tripData) => {
    try {
      console.log("Sending startTrip request with data:", tripData);
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));

      // Send the request
      const response = await axiosInstance.post(`/trip/start`, tripData);
      console.log("startTrip response:", response.data);

      // If the response is successful, add the new trip to the list of active trips
      if (response.status === 201) {
        set((state) => ({
          tripState: {
            ...state.tripState,
            activeTrips: [...state.tripState.activeTrips, response.data.trip],
          },
        }));
        // Fetch the updated list of active trips
        await get().fetchActiveTrips();
      }
    } catch (error) {
      console.log(error);
      
      // Extract the error message from the response
      const errorMessage = error.response?.data?.message || "Erreur lors du démarrage de la tournée.";
      console.error("startTrip error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        request: tripData,
      });
      // Update the state with the error message
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      // Show a toast with the error message
      toast.error(errorMessage);
      // Throw the error to propagate it to the caller
      throw error;
    } finally {
      // Reset the loading flag
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  finishTrip: async (tripId, tripData) => {
    try {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));
      console.log("Sending finishTrip request for tripId:", tripId, "with data:", JSON.stringify(tripData, null, 2));

      const response = await axiosInstance.post(`/trip/finish/${tripId}`, tripData);
      console.log("finishTrip response:", response.data);

      if (response.status === 200) {
        set((state) => ({
          tripState: {
            ...state.tripState,
            activeTrips: state.tripState.activeTrips.filter(trip => trip.id !== tripId),
          },
        }));
        await get().fetchAllTrips(get().tripState.pagination.currentPage, get().tripState.pagination.pageSize);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la finalisation de la tournée.";
      console.error("finishTrip error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        request: tripData,
        stack: error.stack,
      });
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      toast.error(errorMessage);
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  generateInvoice: async (tripId, type) => {
    try {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));

      const response = await axiosInstance.get(`/trip/invoice/${tripId}`, {
        params: { type },
      });
      console.log("generateInvoice response:", response.data);

      if (response.status === 200) {
        return response.data.invoice;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la génération de la facture.";
      console.error("generateInvoice error:", error.response?.data || error);
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      toast.error(errorMessage);
      throw error;
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  emptyTruck: async (matricule) => {
    try {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));

      console.log(`Sending emptyTruck request for matricule: ${matricule}`);
      const response = await axiosInstance.post(`/trip/empty/${matricule}`);
      console.log("emptyTruck response:", response.data);

      if (response.status === 200) {
        await get().fetchAllTrips(get().tripState.pagination.currentPage, {
          limit: get().tripState.pagination.pageSize
        });
        toast.success(`Camion ${matricule} vidé avec succès !`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors du vidage du camion.";
      console.error("emptyTruck error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      toast.error(errorMessage);
      throw error;
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().tripState.pagination.currentPage;
      const totalPages = get().tripState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          tripState: {
            ...state.tripState,
            pagination: { ...state.tripState.pagination, currentPage: nextPage }
          }
        }));
        await get().fetchAllTrips(nextPage, {
          limit: get().tripState.pagination.pageSize
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors du changement de page.";
      set((state) => ({
        tripState: { ...state.tripState, error: errorMessage }
      }));
      toast.error(errorMessage);
    }
  },
  fetchAllProduct : async() => {
    try {
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors du changement de page.";
      set((state) => ({
        tripState: { ...state.tripState, error: errorMessage }
      }));
      toast.error(errorMessage);
    }
  } 
}));  