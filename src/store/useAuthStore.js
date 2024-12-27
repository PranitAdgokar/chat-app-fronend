import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingnIn: false,
  isSigningUp: false,
  isLoadingProfile: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (formData) => {
    try {
      set({ isSigningUp: true });
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in signUp", error);
    } finally {
      set({ isSigningUp: false });
    }
  },
}));
