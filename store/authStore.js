import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

export const useAuth = create((set, get) => ({
  authState: {
    user: null,
    loading: false,
    error: null,
    isAuth: false, 
  },
  login: async (formData) => {
    console.log(formData);

    set({ authState: { ...get().authState, loading: true } });
    try {
      const response = await axiosInstance.post("/auth", formData);
      console.log(response);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        set({
          authState: {
            ...get().authState,
            user: response.data.user,
            isAuth: true,
          },
        });
      } else {
        console.log("Some thing went wrong");

        ShowToast.error(`Les informations ne sont pas correctes`);
      }
    } catch (error) {
      set({
        authState: { ...get().authState, error: error.response.data.message },
      });
    } finally {
      set({ authState: { ...get().authState, loading: false } });
    }
  },
  logout: async () => {
    set({ authState: { ...get().authState, loading: true } });
    try {
      set({ authState: { user: null, isAuth: false, error: null } });
      localStorage.removeItem("user");
    } catch (error) {
      set({
        authState: { ...get().authState, error: error.response.data.message },
      });
    } finally {
      set({ authState: { ...get().authState, loading: false } });
    }
  },
  laodUser: () => {
    set({ authState: { ...get().authState, loading: true } });
    setTimeout(() => {
      const user = localStorage.getItem("user");
      if (user) {
        set({
          authState: {
            ...get().authState,
            user: JSON.parse(user),
            isAuth: true,
          },
        });
      }
    }, 2000);
    set({ authState: { ...get().authState, loading: false } });
  },
}));