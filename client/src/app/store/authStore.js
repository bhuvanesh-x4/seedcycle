import { create } from "zustand";
import { api } from "../api.js";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  fetchMe: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.get("/auth/me");
      set({ user: data.user, loading: false });
    } catch (e) {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.post("/auth/login", { email, password });
      set({ user: data.user, loading: false });
      return true;
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.message || "Login failed" });
      return false;
    }
  },

  register: async (name, email, password, phone) => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.post("/auth/register", { name, email, password, phone });
      set({ user: data.user, loading: false });
      return true;
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.message || "Register failed" });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      set({ user: null });
    }
  }
}));
